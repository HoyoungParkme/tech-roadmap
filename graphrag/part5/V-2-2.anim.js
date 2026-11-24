/* V-2-2 운영 점검 — 장면 4개 (../../anim/engine.js 규칙을 따른다)
   그래프 계산은 networkx 3.7 로 확인했다:
   - 예시 그래프(노드 14 · 엣지 13)의 고립 노드 = 2개 (nx.isolates)
   - barabasi_albert_graph(5000, 3, seed=42) 의 노드 1234 에서 hop 1~4 안에 닿는 노드 = 6 · 342 · 2,413 · 4,887 (hop 당 top-5 상한이면 5 · 30 · 155)
   - 글자 bigram Sørensen–Dice: "samsung electronics" vs "samsung electronic" = 0.971, "openai" vs "open ai" = 0.727 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, check, cross, hbar, snippet, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const exam = (x, y, op) => pill(x, y, '예시', WARN, 1, { fs: 13.5, op: op ?? 1 });

  // 위쪽: 4축 진행 (페이지 데이터 axisStates · progress)
  const AX = [['quality', 'Data Quality'], ['performance', 'Performance'], ['cost', 'Cost'], ['ops', 'Ops']];
  function strip(c) { const b = c.beat, p = c.prev || b, a = b.axisStates || {};
    AX.forEach(([key, nm], i) => { const st = a[key], x = 470 + i * 112, col = st === 'done' ? GOOD : b.focus === key ? ACC : OFF;
      card(x, 22, 104, 28, { rx: 14, stroke: col, sw: 1.8, fill: st === 'done' ? GOODBG : PANEL, text: (st === 'done' ? '✓ ' : '') + nm, fs: 13.5, color: st === 'done' ? GOOD : b.focus === key ? ACC : MUT }); });
    const d = tween(p.progress.done, b.progress.done, c.u); mono(944, 28, Math.round(d) + '/48', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: d >= 48 ? GOOD : INK }); }
  function ring(cx, cy, r, frac, col, label) { el('circle', { cx, cy, r, fill: 'none', stroke: SOFT, 'stroke-width': 12 });
    const f = clamp(frac), a = -Math.PI / 2 + f * Math.PI * 2; if (f > 0.001) el('path', { d: f >= 0.999 ? `M${cx},${cy - r} A${r},${r} 0 1 1 ${cx - 0.01},${cy - r}` : `M${cx},${cy - r} A${r},${r} 0 ${f > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`, fill: 'none', stroke: col, 'stroke-width': 12, 'stroke-linecap': 'round' });
    if (label) mono(cx, cy + 8, label, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }

  // ---------- 그래프 도우미 ----------
  function nd(x, y, o) { o = o || {}; const col = o.col || INK; el('circle', { cx: x, cy: y, r: o.r || 11, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 2, opacity: o.op ?? 1 });
    if (o.name) tx(x, y + (o.ny || 26), o.name, { 'text-anchor': 'middle', 'font-size': o.fs || 13.5, 'font-weight': 700, fill: o.tc || INK, opacity: o.op ?? 1 }); }
  // 예시 그래프 14노드 (12·13 고립)
  const TG = [[90, 140], [160, 100], [240, 130], [300, 190], [110, 220], [190, 230], [330, 270], [260, 320], [180, 330], [400, 120], [460, 160], [420, 210], [80, 330], [400, 330]];
  const TE = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 2], [3, 6], [6, 7], [7, 8], [8, 5], [9, 10], [10, 11], [11, 9]];
  function toy(o) { o = o || {}; TE.forEach(([a, b]) => el('line', { x1: TG[a][0], y1: TG[a][1], x2: TG[b][0], y2: TG[b][1], stroke: GRID, 'stroke-width': 2 }));
    TG.forEach(([x, y], i) => { const iso = i >= 12, hot = o.iso && iso; nd(x, y, { col: hot ? BAD : MUT, fill: hot ? BADBG : PANEL, r: hot ? 13 : 10 });
      if (hot) el('circle', { cx: x, cy: y, r: 22, fill: 'none', stroke: BAD, 'stroke-dasharray': '4 4', 'stroke-width': 1.8 }); }); }

  // ---------- 1. Data Quality ----------
  function s1(t, c) { const { k, u } = c; strip(c);
    if (k === 0) { // 별칭·대명사 → 한 노드
      const m = E(u, 0.8, 1.8); [['Tom Hanks', 160, 120], ['톰 행크스', 160, 220], ['그는', 160, 320]].forEach(([s0, x, y], i) => {
        const xx = lerp(x, 420, m), yy = lerp(y, 220, m); if (i && m > 0.95) return; nd(xx, yy, { col: ACC, fill: ACCBG, r: 16, name: m > 0.95 ? null : s0, ny: 34, fs: 15 }); });
      if (m > 0.95) tx(420, 266, 'Tom Hanks', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC });
      [['alias_dict', 0.3], ['coreference', 0.6], ['synonym 0.85', 0.9]].forEach(([s0, a], i) => pill(720, 140 + i * 56, s0, ACC, pop(u, a), { mono: true, fs: 14 }));
      tx(720, 330, '같은 대상을 가리키는 표현을 한 노드로', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { toy({ iso: u > 0.8 });
      el('rect', { x: 560, y: 100, width: 370, height: 46, rx: 8, fill: INK, opacity: fade(u, 0.2) }); mono(574, 128, 'MATCH (n) WHERE NOT (n)--()', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.3) });
      R.meters(560, 180, 370, [{ name: '고립 노드', val: String(Math.round(lerp(0, 2, E(u, 0.9, 1.6)))) }, { name: '알람 기준', val: '> 100' }]);
      tx(745, 300, '매일 04:00 · 이 그래프는 2개라 통과', { 'text-anchor': 'middle', 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { toy({});
      el('line', { x1: 400, y1: 330, x2: lerp(400, 300, E(u, 0.3, 1)), y2: lerp(330, 190, E(u, 0.3, 1)), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
      mono(380, 380, 'r.source = null', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      [['samsung electronics', 'samsung electronic', '0.971', true], ['openai', 'open ai', '0.727', false]].forEach(([a, b, v, hit], i) => { const y = 110 + i * 100, s = fade(u, 1.0 + i * 0.4);
        mono(560, y, a, { 'font-size': 14.5, opacity: s }); mono(560, y + 24, b, { 'font-size': 14.5, opacity: s });
        mono(900, y + 14, v, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: hit ? WARN : MUT, opacity: s });
        tx(900, y + 46, hit ? '0.85 넘음 · 중복 후보' : '0.85 아래 · 못 잡는다', { 'font-size': 13.5, 'text-anchor': 'end', fill: hit ? WARN : MUT, opacity: s, 'font-weight': 700 }); });
      tx(730, 340, 'bigram Sørensen–Dice · 분기 1회 50쌍만 사람이 본다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2) }); return; }
    if (k === 3) { // 주 1회 재계산, 분포 변화
      const a = [12, 9, 7, 5], b = [15, 6, 7, 5]; tx(80, 90, 'community 크기 분포 (그림 예시)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      a.forEach((v, i) => { const x = 100 + i * 100; el('rect', { x, y: 330 - v * 13, width: 34, height: v * 13, rx: 3, fill: OFF }); const g = E(u, 0.5 + i * 0.15, 1.3 + i * 0.15);
        el('rect', { x: x + 38, y: 330 - b[i] * 13 * g, width: 34, height: b[i] * 13 * g, rx: 3, fill: ACC }); });
      el('line', { x1: 80, y1: 330, x2: 500, y2: 330, stroke: MUT });
      tx(120, 360, '지난주', { 'font-size': 13.5, fill: MUT }); el('rect', { x: 100, y: 350, width: 12, height: 12, fill: OFF }); tx(200, 360, '이번주', { 'font-size': 13.5, fill: ACC }); el('rect', { x: 180, y: 350, width: 12, height: 12, fill: ACC });
      ring(740, 200, 70, E(u, 0.4, 1.6) * 0.2, WARN, '20%'); tx(740, 310, '분포가 20% 넘게 흔들리면 알람', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      mono(740, 340, 'recompute: weekly', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); return; }
    if (k === 4) { toy({}); [[470, 280], [520, 330], [470, 370]].forEach(([x, y], i) => { const s = pop(u, 0.8 + i * 0.2); if (s > 0.05) nd(x, y, { col: GOOD, fill: GOODBG, r: 11 * s }); });
      el('line', { x1: 470, y1: 280, x2: 520, y2: 330, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.4) }); el('line', { x1: 470, y1: 280, x2: 330, y2: 270, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.4) }); el('line', { x1: 520, y1: 330, x2: 470, y2: 370, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.4) });
      R.dbIcon(760, 120, 's3://docs/', { s: pop(u, 0.2) }); dot([[720, 140], [530, 300]], seg(u, 0.4, 1.0), GOOD, 7);
      pill(760, 250, 'created · updated 만', GOOD, pop(u, 1.0), { fs: 14 }); pill(760, 306, '추출 정확도 100건 샘플', ACC, pop(u, 1.4), { fs: 14 });
      tx(760, 360, '새 문서 몫만 그래프에 더한다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    ring(300, 220, 90, 1, GOOD, '12/12'); tx(300, 350, 'Data Quality 축 마감', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD });
    ring(680, 220, 90, tween(0.23, 0.25, u), ACC, Math.round(tween(23, 25, u)) + '%'); tx(680, 350, '전체 48 항목 중 12', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); }

  // ---------- 2. Performance ----------
  function s2(t, c) { const { k, u } = c; strip(c);
    if (k === 0) { // 인덱스: 전수 스캔 vs 바로 찾기, HNSW 층
      tx(60, 90, 'id 로 찾기', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < 12; i++) { const x = 60 + i * 34, scan = !u || i <= Math.floor(E(u, 0.2, 1.2) * 11); el('rect', { x, y: 110, width: 28, height: 28, rx: 4, fill: scan ? WARNBG : PANEL, stroke: scan ? WARN : GRID }); }
      tx(60, 166, '인덱스 없음 · 앞에서부터 전부', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6) });
      for (let i = 0; i < 12; i++) { const x = 60 + i * 34; el('rect', { x, y: 200, width: 28, height: 28, rx: 4, fill: i === 8 ? ACC : PANEL, stroke: i === 8 ? ACC : GRID, opacity: i === 8 ? fade(u, 1.2) : 1 }); }
      tx(60, 256, 'CREATE INDEX entity_id · 바로 한 칸', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) });
      // HNSW 3층
      tx(560, 90, 'HNSW 벡터 인덱스 · 1024차원 cosine', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      [[2, 130], [5, 200], [10, 270]].forEach(([n, y], li) => { el('line', { x1: 570, y1: y, x2: 920, y2: y, stroke: GRID, opacity: fade(u, 1.5) });
        for (let i = 0; i < n; i++) { const x = 590 + (i + 0.5) * (320 / n); nd(x, y, { r: 7, col: li === 2 && i === 6 ? ACC : MUT, op: fade(u, 1.5 + li * 0.2) }); } });
      dot([[670, 130], [814, 130], [814, 200], [846, 200], [846, 270], [814, 270]], seg(u, 2.0, 2.9), ACC, 6);
      tx(745, 320, '위층에서 크게 건너뛰고 아래층에서 좁힌다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2) }); return; }
    if (k === 1) { el('rect', { x: 80, y: 100, width: 420, height: 230, rx: 8, fill: PANEL, stroke: GRID });
      mono(96, 126, 'postgres.community_summaries', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['#12', '창업기 인물들 요약 …'], ['#47', '픽사 그룹 요약 …'], ['#89', '복귀 후 애플 …']].forEach(([id, s0], i) => { const y = 170 + i * 50, s = fade(u, 0.3 + i * 0.3);
        mono(100, y, id, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: s }); tx(160, y, s0, { 'font-size': 14.5, opacity: s }); });
      Q2(700, 140, '질의'); dot([[700, 160], [510, 200]], seg(u, 1.2, 1.8), ACC, 7); dot([[510, 220], [700, 270]], seg(u, 1.8, 2.4), GOOD, 7);
      tx(760, 300, '질의 때는 읽기만', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { // hop 폭발 (networkx BA 5000)
      const H = [[1, 6, 5], [2, 342, 30], [3, 2413, 155], [4, 4887, null]], x0 = 200, W = 520;
      tx(60, 86, 'BA 그래프 5,000노드에서 한 노드가 hop 안에 닿는 수', { 'font-size': 15, 'font-weight': 700 });
      H.forEach(([h, all, cap], i) => { const y = 120 + i * 66, g = E(u, 0.2 + i * 0.35, 0.9 + i * 0.35), lw = W * Math.log10(all) / Math.log10(5000);
        mono(60, y + 18, `hop ${h}`, { 'font-size': 15, 'font-weight': 700, fill: h > 3 ? BAD : INK });
        el('rect', { x: x0, y: y, width: Math.max(2, lw * g), height: 20, rx: 4, fill: h > 3 ? BAD : WARN, opacity: 0.8 }); mono(x0 + lw * g + 8, y + 16, all.toLocaleString('en-US'), { 'font-size': 14.5, 'font-weight': 700, opacity: g });
        if (cap) { const lc = W * Math.log10(cap) / Math.log10(5000); el('rect', { x: x0, y: y + 24, width: lc * g, height: 14, rx: 3, fill: ACC }); mono(x0 + lc * g + 8, y + 36, `top-5: ${cap}`, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: g }); } });
      tx(60, 400, '막대는 로그 눈금 · max_hop_depth 3, hop 당 top-K 5', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 3 || k === 4) { R.redisBox(200, 150, { name: k === 3 ? 'redis' : 'sqlite', sub: k === 3 ? 'embedding 캐시' : 'LLM 응답 캐시' });
      if (k === 3) { mono(200, 240, 'key = sha256(content)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.4) }); R.clock(200, 320, 30, 1 - E(u, 0.6, 2.6) * 0.1, WARN, 'TTL 90일');
        tx(620, 200, '같은 문장이 다시 오면', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1) }); tx(620, 230, '임베딩 API 를 다시 부르지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) }); return; }
      ring(620, 200, 80, E(u, 0.3, 1.5) * 0.6, GOOD, '60%'); tx(620, 320, 'hit ratio 목표 ≥ 0.60', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(620, 348, '목표가 있어야 모니터링이 의미를 갖는다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 5) { const x0 = 120, W = 640, X = (v) => x0 + v / 4000 * W; el('line', { x1: x0, y1: 220, x2: x0 + W, y2: 220, stroke: MUT, 'stroke-width': 2 });
      [0, 1000, 2000, 3000, 4000].forEach((v) => { el('line', { x1: X(v), y1: 220, x2: X(v), y2: 226, stroke: MUT }); mono(X(v), 246, v.toLocaleString('en-US'), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      el('rect', { x: x0, y: 180, width: (X(2000) - x0) * E(u, 0.2, 0.9), height: 30, fill: GOODBG }); el('rect', { x: X(2000), y: 180, width: (X(4000) - X(2000)) * E(u, 0.6, 1.3), height: 30, fill: BADBG });
      el('line', { x1: X(2000), y1: 160, x2: X(2000), y2: 230, stroke: INK, 'stroke-width': 2.5 }); mono(X(2000), 150, '2k tokens', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle' });
      tx(X(1000), 200, 'gpt-4o-mini', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); tx(X(3000), 200, 'gpt-4o', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(480, 320, '규칙을 설정 파일에 두면 사람이 아니라 코드가 지킨다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 6) { // 응답 시간 분포 + SLO 선 (모양만)
      const x0 = 120, W = 620, X = (ms) => x0 + ms / 3000 * W; el('line', { x1: x0, y1: 320, x2: x0 + W, y2: 320, stroke: MUT, 'stroke-width': 1.8 });
      for (let i = 0; i < 30; i++) { const ms = i * 100 + 50, h = 150 * Math.exp(-Math.pow((ms - 900) / 450, 2)) + (ms > 1600 ? 10 * Math.exp(-(ms - 1600) / 600) : 0), g = E(u, 0.1, 1.2);
        el('rect', { x: X(i * 100) + 1, y: 320 - h * g, width: W / 30 - 2, height: h * g, fill: ms > 2000 ? BAD : INFO, opacity: 0.7 }); }
      el('line', { x1: X(2000), y1: 120, x2: X(2000), y2: 330, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1) });
      mono(X(2000) + 8, 140, 'p95 SLO 2000ms', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1) });
      [0, 1000, 2000, 3000].forEach((v) => mono(X(v), 344, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      tx(480, 390, '분기 1회 50 RPS 부하 테스트로 지켜지는지 본다 · 분포는 모양 예시', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 7) { R.dbIcon(200, 200, 'primary', { s: 1 }); R.dbIcon(560, 130, 'replica 1', { s: pop(u, 0.3) }); R.dbIcon(560, 290, 'replica 2', { s: pop(u, 0.6) });
      for (let i = 0; i < 6; i++) dot([[820, 210], [610, i % 2 ? 130 : 290]], ((t * 0.6 + i / 6) % 1), ACC, 5);
      pill(820, 210, '읽기 질의', ACC, 1, { fs: 14 }); pill(820, 330, 'pool 50', INK, pop(u, 1.2), { mono: true, fs: 14 });
      grow(250, 190, 510, 140, seg(u, 0.9, 1.4), MUT, { dash: '4 4' }); grow(250, 210, 510, 280, seg(u, 0.9, 1.4), MUT, { dash: '4 4' }); return; }
    ring(300, 220, 90, 1, GOOD, '12/12'); tx(300, 350, 'Performance 축 마감', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD });
    ring(680, 220, 90, tween(0.48, 0.5, u), ACC, Math.round(tween(48, 50, u)) + '%'); tx(680, 350, '48 항목 중 24 · 절반', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); }
  const Q2 = (x, y, s) => card(x, y, tw(s, 14) + 26, 34, { rx: 17, stroke: ACC, sw: 2, text: s, fs: 14 });

  // ---------- 3. Cost ----------
  function gauge(x, y, w, frac, o) { o = o || {}; el('rect', { x, y, width: w, height: 30, rx: 6, fill: SOFT });
    const f = clamp(frac, 0, 1.05), col = f >= 1 ? BAD : f >= 0.8 ? WARN : GOOD; el('rect', { x, y, width: w * Math.min(f, 1), height: 30, rx: 6, fill: col });
    [[0.8, '80%', WARN], [1, '100%', BAD]].forEach(([p, s0, c0]) => { el('line', { x1: x + w * p, y1: y - 10, x2: x + w * p, y2: y + 40, stroke: c0, 'stroke-width': 2, 'stroke-dasharray': '4 3' }); mono(x + w * p, y - 16, s0, { 'font-size': 14, fill: c0, 'font-weight': 700, 'text-anchor': 'middle' }); });
    mono(x, y + 62, `${(f * 10).toFixed(1)}M / 10M 토큰`, { 'font-size': 15, 'font-weight': 700 }); }
  function s3(t, c) { const { k, u } = c; strip(c);
    if (k <= 3) { const fr = k === 0 ? E(u, 0.3, 1.6) * 0.55 : k === 1 ? 0.55 : k === 2 ? lerp(0.55, 1.0, E(u, 0.2, 1.4)) : lerp(0.55, 0.85, E(u, 0.2, 1.4));
      tx(80, 90, '하루 토큰 사용량 · DAILY_TOKEN_LIMIT 10,000,000', { 'font-size': 15, 'font-weight': 700 }); gauge(80, 140, 560, fr);
      if (k === 1) [['used_tokens', '5.5M'], ['cache_hit_rate', '목표 ≥ 0.60'], ['small_model_ratio', 'small 우선']].forEach(([a, b], i) => { mono(700, 120 + i * 48, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); tx(700, 140 + i * 48, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      if (k === 1) exam(760, 290, fade(u, 1.2));
      if (k === 2) { lock(360, 300, fr >= 1, fr >= 1 ? BAD : MUT, pop(u, 1.4)); tx(400, 306, fr >= 1 ? 'block · 새 호출 차단 + 슬랙' : '', { 'font-size': 15, 'font-weight': 800, fill: BAD });
        tx(80, 380, '알람만 있고 차단이 없으면 청구서는 계속 커진다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2) }); }
      if (k === 3) { card(760, 300, 260, 60, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, text: '#graphrag-ops\n⚠️ 85% 도달', fs: 14.5, s: pop(u, 1.4) });
        tx(80, 380, '차단 전에 한 번 경고해 손쓸 시간을 번다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 4) { [['1,500 토큰', 'gpt-4o-mini', GOOD], ['3,200 토큰', 'gpt-4o', BAD]].forEach(([a, b, col], i) => { const y = 140 + i * 110;
        Q2(150, y, a); grow(220, y, 380, y, seg(u, 0.3 + i * 0.5, 0.8 + i * 0.5), col); card(480, y, 180, 50, { rx: 10, stroke: col, sw: 2.5, text: b, fs: 15, mono: true, color: col, s: pop(u, 0.7 + i * 0.5) }); });
      mono(150, 375, 'token_estimate < 2_000', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      card(790, 200, 220, 90, { rx: 10, stroke: INK, sw: 2, text: '단가 약 1/17\n$0.15 vs $2.50', fs: 15, s: pop(u, 1.8) }); return; }
    if (k === 5) { R.redisBox(480, 150, { sub: 'sha256(text) → vec' }); Q2(150, 150, '문장');
      dot([[190, 150], [415, 150]], seg(u, 0.2, 0.8), ACC, 7); dot([[415, 160], [190, 260]], seg(u, 0.9, 1.5), GOOD, 7); pill(190, 280, 'hit · 비용 0', GOOD, pop(u, 1.4), { fs: 14 });
      card(780, 150, 170, 50, { rx: 10, stroke: INFO, sw: 2, text: 'embedder', fs: 15, op: 0.5 + 0.5 * fade(u, 2) }); tx(780, 210, 'miss 때만 계산 · 90일 저장', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2) }); return; }
    if (k === 6) { card(200, 200, 170, 60, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, text: 'gpt-4o · 1회', fs: 15, s: pop(u, 0.2) });
      R.dbIcon(450, 200, 'summary 저장', { s: pop(u, 0.6) }); grow(290, 200, 400, 200, seg(u, 0.5, 0.9), MUT);
      for (let i = 0; i < 6; i++) { const y = 100 + i * 40, s = pop(u, 1.1 + i * 0.15); card(780, y, 160, 30, { rx: 15, stroke: GOOD, sw: 1.8, text: `질의 ${i + 1} · 재사용`, fs: 13.5, color: GOOD, s }); dot([[500, 200], [700, y]], seg(u, 1.0 + i * 0.15, 1.6 + i * 0.15), GOOD, 5); }
      tx(450, 360, '한 번 만들고 여러 번 쓴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2) }); return; }
    if (k === 7) { for (let i = 0; i < 100; i++) { const x = 60 + (i % 20) * 20, y = 110 + Math.floor(i / 20) * 20, s = clamp(E(u, 0.2, 1.0) * 100 - i); el('rect', { x, y, width: 16, height: 16, rx: 3, fill: WARNBG, stroke: WARN, 'stroke-width': 1, opacity: s }); }
      tx(60, 240, '청크 100개', { 'font-size': 14.5, 'font-weight': 700, fill: WARN }); grow(470, 160, 560, 160, seg(u, 1.0, 1.4), ACC);
      card(680, 160, 200, 60, { rx: 10, stroke: ACC, sw: 2.5, text: 'Batch API 1회', fs: 15, s: pop(u, 1.3) });
      R.meters(560, 250, 360, [{ name: '호출 수', val: '1/100', good: true }, { name: '배치 할인', val: '50%', good: true }]); return; }
    ring(300, 220, 90, 1, GOOD, '12/12'); tx(300, 350, 'Cost 축 마감 · 월 1회 FinOps 회고', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD });
    ring(680, 220, 90, tween(0.73, 0.75, u), ACC, Math.round(tween(73, 75, u)) + '%'); tx(680, 350, '48 항목 중 36', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); }

  // ---------- 4. Ops ----------
  function s4(t, c) { const { k, u } = c; strip(c);
    if (k === 0) { // 인용 0 답변 격리
      const gx = 620; [[gx, 120], [gx + 90, 90], [gx + 170, 140], [gx + 60, 200], [gx + 160, 230]].forEach(([x, y], i) => nd(x, y, { col: INFO, fill: INFOBG, r: 12 }));
      [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4]].forEach(([a, b]) => { const P = [[gx, 120], [gx + 90, 90], [gx + 170, 140], [gx + 60, 200], [gx + 160, 230]]; el('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], stroke: GRID, 'stroke-width': 2 }); });
      card(200, 130, 240, 56, { rx: 10, stroke: GOOD, sw: 2, text: '답 A · citation 3', fs: 15, s: pop(u, 0.2) });
      [[gx, 120], [gx + 60, 200], [gx + 90, 90]].forEach(([x, y], i) => grow(322, 130, x - 14, y, seg(u, 0.5 + i * 0.15, 1.0 + i * 0.15), GOOD, { plain: true }));
      card(200, 270, 240, 56, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, text: '답 B · citation 0', fs: 15, s: pop(u, 1.0) }); tx(200, 330, 'hallucination 후보로 격리', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
      ['p50/p95/p99 대시보드', '5xx ≥ 1% 알람', 'groundedness 일 100건'].forEach((s0, i) => pill(620 + (i % 2) * 0, 300 + i * 40, s0, INK, pop(u, 1.6 + i * 0.25), { fs: 13.5 })); return; }
    if (k === 1) { // 하루 · 한 달 타임라인
      const x0 = 80, W = 800; el('line', { x1: x0, y1: 220, x2: x0 + W, y2: 220, stroke: MUT, 'stroke-width': 2 });
      for (let d = 0; d < 30; d++) { const x = x0 + (d + 0.5) * W / 30, s = clamp(E(u, 0.2, 1.6) * 30 - d); el('circle', { cx: x, cy: 220, r: 6 * s, fill: ACC }); }
      el('rect', { x: x0 + W - 22, y: 190, width: 20, height: 60, rx: 4, fill: WARN, opacity: fade(u, 1.7) }); tx(x0 + W - 12, 280, '월 1회 full', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
      tx(x0, 190, '매일 03:00 증분 재인덱싱', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      ['👍/👎 피드백', 'runbook · post-mortem'].forEach((s0, i) => pill(240 + i * 300, 340, s0, INK, pop(u, 2 + i * 0.2), { fs: 14 })); return; }
    if (k === 2) { R.clock(200, 170, 50, E(u, 0.2, 1.6), INFO, '90일 rotation'); lock(200, 300, true, INFO, pop(u, 1));
      el('rect', { x: 400, y: 120, width: 500, height: 50, rx: 8, fill: SOFT, opacity: fade(u, 0.5) }); tx(416, 151, '홍길동 010-1234-5678 의 주문을 찾아줘', { 'font-size': 15, opacity: fade(u, 0.5) });
      grow(650, 180, 650, 220, seg(u, 1.0, 1.4), MUT); el('rect', { x: 400, y: 230, width: 500, height: 50, rx: 8, fill: GOODBG, opacity: fade(u, 1.4) }); tx(416, 261, '[NAME] [PHONE] 의 주문을 찾아줘', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(650, 320, '→ audit_log', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) }); exam(870, 320, fade(u, 1.9)); return; }
    if (k === 3) { // Cypher ACL: 사용자별로 보이는 부분그래프
      toy({}); const vis = [0, 1, 2, 4, 5]; vis.forEach((i) => nd(TG[i][0], TG[i][1], { col: ACC, fill: ACCBG, r: 12, op: fade(u, 0.4) }));
      el('rect', { x: 560, y: 90, width: 370, height: 70, rx: 8, fill: INK, opacity: fade(u, 0.2) }); mono(574, 118, 'MATCH (n) WHERE', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.3) }); mono(574, 142, '  $team IN n.acl', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.5) });
      tx(745, 200, '이 팀에는 색칠된 5개 노드만', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1) });
      [['primary', 0.4], ['secondary', 0.7]].forEach(([s0, a], i) => R.person(680 + i * 130, 290, s0, { s: pop(u, 1.3 + a) }));
      tx(745, 380, '24/7 당번 2조 · 48/48', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2) }); return; }
    if (k === 4) { AX.forEach(([key, nm], i) => { const y = 110 + i * 62, s = fade(u, 0.2 + i * 0.3);
        tx(200, y + 6, nm, { 'font-size': 16, 'font-weight': 700, opacity: s }); for (let j = 0; j < 12; j++) el('rect', { x: 360 + j * 26, y: y - 12, width: 20, height: 22, rx: 4, fill: GOOD, opacity: 0.85 * clamp(E(u, 0.2 + i * 0.3, 0.9 + i * 0.3) * 12 - j) });
        mono(700, y + 6, '12/12', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: s }); });
      mono(700, 370, '48/48', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); tx(200, 370, '합계', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    ring(480, 190, 100, 1, GOOD, '100%');
    tx(480, 340, '운영 점검 4축 48항목 완료', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.4) });
    tx(480, 372, '다음은 실제 데이터로 한 바퀴 돌려 보는 일', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); }

  const quiz = [
    { q: '예시 그래프에서 고립 노드 점검 쿼리 MATCH (n) WHERE NOT (n)--()가 세는 것은 무엇인가?',
      o: ['관계가 하나도 없는 노드', 'source가 비어 있는 관계', '이름이 비슷한 노드 쌍'], a: 0,
      why: '어떤 관계에도 붙지 않은 노드를 센다. 이 예시 그래프는 2개라 알람 기준 100 아래다. source가 빈 관계는 orphan edge 점검이 따로 센다.' },
    { q: 'max_hop_depth 3, hop 당 top-K 5로 막으면 3 hop까지 닿는 노드 상한은 몇 개인가?',
      o: ['15개', '125개', '155개'], a: 2,
      why: '5 + 25 + 125 = 155다. 막지 않은 BA 그래프에서는 3 hop 안에 2,413개까지 퍼진다.' },
    { q: 'check_budget이 사용률 100%에서 하는 일은 무엇인가?',
      o: ['슬랙에 알리고 block을 돌려 새 호출을 막는다', '경고만 보내고 계속 호출한다', 'gpt-4o로 모델을 올린다'], a: 0,
      why: '80%에서는 warn, 100%에서는 block이다. 차단이 없으면 알람이 와도 비용은 계속 늘어난다.' },
    { q: 'citation이 0개인 답변을 Ops 점검은 어떻게 다루는가?',
      o: ['그대로 사용자에게 보낸다', 'hallucination 후보로 격리하고 일일 리포트에 올린다', '자동으로 다시 인덱싱한다'], a: 1,
      why: '그래프 근거가 하나도 없는 답은 지어낸 답일 수 있다. 따로 모아 groundedness 표본과 함께 본다.' },
  ];

  const summary = [
    '별칭·대명사를 한 노드로 모으고 고립 노드와 출처 없는 관계를 매일 세야 답이 흔들리지 않는다.',
    'id 인덱스와 HNSW, 미리 만든 community 요약, hop 3 제한이 질의 시간을 지킨다.',
    '하루 토큰 한도에서 80%는 경고, 100%는 차단하고 mini 라우팅과 캐시, 배치로 호출을 줄인다.',
    '인용 0 답변 격리, 증분 재인덱싱, 키 교체와 Cypher ACL, 당번까지 갖춰야 48항목이 닫힌다.',
  ];
  const review = [
    { q: '새 문서를 넣은 뒤 "OpenAI" 와 "Open AI" 가 서로 다른 노드로 남았다. 먼저 손볼 곳은?',
      o: ['alias_dict에 별칭을 등록한다', 'max_hop_depth를 늘린다', 'Batch API 크기를 키운다'], a: 0,
      why: '두 이름의 Dice 유사도는 0.727로 0.85 기준에 못 미쳐 중복 점검이 잡지 못한다. 별칭 사전으로 묶는 것이 확실하다.' },
    { q: '그래프 질의 p95가 SLO 2초를 넘기 시작했다. 로그를 보니 탐색 노드 수가 수천 개다. 먼저 의심할 것은?',
      o: ['LLM 응답 캐시 TTL', 'API 키 교체 주기', 'hop 깊이와 top-K 제한이 빠졌다'], a: 2,
      why: '제한이 없으면 3 hop 만에 수천 노드로 퍼진다. 깊이 3과 top-5를 걸면 상한이 155로 줄어든다.' },
    { q: '월말 청구서가 예상의 두 배였다. 대시보드에 남은 세 숫자 중 먼저 볼 것은?',
      o: ['고립 노드 수', 'used_tokens 추이와 small_model_ratio', '당번표'], a: 1,
      why: 'CostSnapshot은 사용 토큰, 캐시 hit, small 비율로 비용을 본다. 큰 모델로 간 비율이 늘었는지부터 확인한다.' },
  ];

  R.page({ title: '운영 점검 4축', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
