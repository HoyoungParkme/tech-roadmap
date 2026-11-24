/* II-2-1 FAISS 실전 워크플로우 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 진행률은 beat 의 embedProgress · trainProgress · addProgress, 파일은 indexFile, 검색은 searchResult 를 읽는다.
 * 파일 크기 14.9 MB 는 IndexIVFFlat(384, nlist=100)에 1만 개를 넣고 write_index 로 직접 재 본 값(faiss-cpu 1.16.0).
 * recall · latency 표와 검색 문장은 페이지의 예시 값이다(코퍼스가 없어 재현 불가). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const fmtN = (v) => Math.round(v).toLocaleString('en-US');
  const star = (x, y, s, col) => { const g = R.G(x, y, s ?? 1); el('path', { d: 'M0,-14 L4,-4 L14,-4 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-4 L-4,-4 Z', fill: col || BAD, stroke: PANEL, 'stroke-width': 1.5 }, g); };
  // 파일 아이콘
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('path', { d: 'M-30,-40 H16 L30,-26 V40 H-30 Z', fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5 }, g); el('path', { d: 'M16,-40 V-26 H30', fill: 'none', stroke: col, 'stroke-width': 2 }, g);
    if (o.tag) tx(0, 6, o.tag, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col }, g);
    tx(0, 62, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' }, g); return g; }
  function progress(x, y, w, v, label, col) { tx(x, y - 8, label, { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    el('rect', { x, y, width: w, height: 14, rx: 4, fill: SOFT, stroke: GRID }); el('rect', { x, y, width: Math.max(2, w * clamp(v / 100)), height: 14, rx: 4, fill: col || ACC });
    mono(x + w + 8, y + 12, Math.round(v) + '%', { 'font-size': 14, 'font-weight': 700, fill: col || ACC }); }
  // 예시 문장 (페이지 데이터)
  const SAMPLE = ['강아지 배변 훈련은 일관된 시간표가 핵심…', '클리커 훈련은 긍정 강화 기법으로…', '반려견 산책 시 리드줄 사용법…'];

  // ---------- 1. 임베딩 ----------
  function s1(t, c) { const { k, u } = c, ep = c.beat.embedProgress, pep = (c.prev && c.prev.embedProgress) ?? ep;
    if (k === 0) { [['numpy', INFO], ['pickle', WARN], ['SentenceTransformer', ACC]].forEach(([n, col], i) => pill(250 + i * 230, 180, 'import ' + n, col, pop(u, 0.3 + i * 0.4), { mono: true, fs: 15 }));
      note(480, 260, '파이프라인 시작 전: 텍스트도 벡터도 아직 없다', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); return; }
    // 왼쪽: 텍스트 더미
    fileIcon(80, 90, 'corpus.txt', { tag: 'txt' });
    const nT = k === 1 ? 10000 * E(u, 0.3, 1.8) : 10000;
    for (let i = 0; i < 6; i++) { const s = k === 1 ? clamp(E(u, 0.3, 1.8) * 6 - i) : 1; if (s <= 0) continue;
      el('rect', { x: 150 + i * 4, y: 60 + i * 30, width: 200, height: 24, rx: 4, fill: PANEL, stroke: GRID, opacity: s });
      if (i < 3) tx(158 + i * 4, 77 + i * 30, SAMPLE[i].slice(0, 13), { 'font-size': 13.5, opacity: s }); }
    mono(150, 260, 'texts  ' + fmtN(nT) + '개', { 'font-size': 16, 'font-weight': 800, fill: INK });
    if (k === 1) { sub(250, 290, '문장은 예시', fade(u, 2.0)); return; }
    // 가운데: 모델
    const ms = k === 2 ? pop(u, 0.3) : 1;
    card(480, 150, 170, 90, { rx: 12, stroke: ACC, fill: ACCBG, s: ms });
    tx(480, 142, 'all-MiniLM-L6-v2', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: ms });
    mono(480, 168, '→ 384차원', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: ms });
    if (k === 2) { note(480, 240, '출력 차원은 모델이 정한다', fade(u, 1.2), { 'text-anchor': 'middle' }); return; }
    // 배치 흐름 + 진행률
    const e = k === 3 ? tween(pep, ep, u, 2.2) : ep;
    if (k === 3) { for (let i = 0; i < 5; i++) { const a = ((t * 0.9 + i / 5) % 1); dot([[360, 150], [395, 150]], a, INFO, 5); dot([[565, 150], [620, 150]], a, ACC, 5); }
      mono(480, 220, 'batch_size = 64 → 157번', { 'text-anchor': 'middle', 'font-size': 15, fill: INK }); }
    progress(380, 270, 200, e, 'encode 진행률', ACC);
    // 오른쪽: 벡터 행렬 + 단위원
    const rows = Math.round(10 * e / 100);
    for (let i = 0; i < rows; i++) el('rect', { x: 640, y: 60 + i * 15, width: 260, height: 10, rx: 2, fill: ACC, opacity: 0.5 });
    if (rows) mono(640, 230, 'embeddings (10000, 384)', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    if (k === 3) { // 정규화 = 단위원 위의 점
      const cx = 700, cy = 330, r = 50, f = E(u, 1.4, 2.4); el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 1.5 });
      const rr = rng(4); for (let i = 0; i < 9; i++) { const a = rr() * 6.28, d = lerp(0.4 + rr() * 1.2, 1, f); el('circle', { cx: cx + Math.cos(a) * r * d, cy: cy + Math.sin(a) * r * d, r: 4, fill: INFO }); }
      tx(764, 322, 'normalize_embeddings', { 'font-size': 13.5, fill: MUT, class: 'mono' }); tx(764, 344, '모든 벡터 길이 = 1', { 'font-size': 14, 'font-weight': 700, fill: INFO }); return; }
    if (k === 4) { const f = E(u, 0.3, 1.2);
      mono(640, 262, 'dtype: ' + (f > 0.5 ? 'float32' : '?'), { 'font-size': 15, 'font-weight': 700, fill: f > 0.5 ? GOOD : WARN });
      mono(640, 288, 'C-contiguous: ' + (f > 0.5 ? 'True' : '?'), { 'font-size': 15, 'font-weight': 700, fill: f > 0.5 ? GOOD : WARN });
      // 메모리에 행이 이어 붙은 모습
      for (let i = 0; i < 12; i++) el('rect', { x: 640 + i * 22, y: 312, width: 20, height: 22, fill: i % 4 === 0 ? ACC : ACCBG, stroke: ACC, 'stroke-width': 1, opacity: fade(u, 1.2) });
      tx(640, 356, '행이 메모리에 한 줄로 이어진다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
      cross(200, 340, 12, pop(u, 1.8)); note(222, 346, '빠뜨리면 add 에서 에러', fade(u, 1.9), { fill: BAD }); return; }
    // k 5: 저장 두 파일
    const a = E(u, 0.2, 1.0), b = E(u, 0.8, 1.6);
    fileIcon(lerp(770, 700, a), lerp(140, 330, a), 'corpus.npy', { col: ACC, tag: '벡터', op: a });
    fileIcon(lerp(200, 860, b), lerp(160, 330, b), 'texts.pkl', { col: WARN, tag: '문장', op: b });
    note(380, 380, '벡터와 원문은 따로 저장한다', fade(u, 1.8)); }

  // ---------- 2. IVF 빌드 ----------
  const PTS = (() => { const r = rng(31), centers = [[150, 130], [300, 115], [420, 170], [200, 270], [350, 300], [110, 340], [460, 330], [260, 190]], p = [];
    for (let i = 0; i < 96; i++) { const c = centers[i % 8]; p.push([Math.max(52, Math.min(498, c[0] + (r() - 0.5) * 110)), Math.max(84, Math.min(378, c[1] + (r() - 0.5) * 90))]); } return { p, centers }; })();
  const near = (q, cs) => { let b = 0, bd = 1e9; cs.forEach((c, j) => { const d = (q[0] - c[0]) ** 2 + (q[1] - c[1]) ** 2; if (d < bd) { bd = d; b = j; } }); return b; };
  const INIT = (() => { const r = rng(9); return PTS.centers.map(() => [80 + r() * 400, 70 + r() * 300]); })();
  const CC = [ACC, INFO, WARN, GOOD, ACC, INFO, WARN, GOOD];
  function space(op) { el('rect', { x: 40, y: 40, width: 470, height: 350, rx: 12, fill: SOFT, stroke: GRID, opacity: op ?? 1 });
    tx(54, 62, '384차원 공간을 2차원으로 (셀 8개로 줄여 그림)', { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: op ?? 1 }); }
  function diamond(x, y, op, col) { el('path', { d: `M${x},${y - 9} L${x + 9},${y} L${x},${y + 9} L${x - 9},${y} Z`, fill: PANEL, stroke: col || INK, 'stroke-width': 2.2, opacity: op ?? 1 }); }
  function invlists(x, y, fill, o) { o = o || {};   // 역색인 목록: 셀 번호 → id 들
    tx(x, y - 12, 'inverted lists (nlist = 100, 그림은 8줄)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    for (let j = 0; j < 8; j++) { const yy = y + j * 30; mono(x, yy + 17, 'c' + j, { 'font-size': 14, 'font-weight': 700, fill: CC[j] });
      el('rect', { x: x + 34, y: yy + 2, width: 320, height: 22, rx: 4, fill: PANEL, stroke: GRID });
      const n = Math.round(12 * clamp(fill)); for (let i = 0; i < n; i++) el('rect', { x: x + 38 + i * 26, y: yy + 6, width: 22, height: 14, rx: 2, fill: CC[j], opacity: 0.6 }); } }
  function s2(t, c) { const { k, u } = c, tp = c.beat.trainProgress, ptp = (c.prev && c.prev.trainProgress) ?? tp, ap = c.beat.addProgress, pap = (c.prev && c.prev.addProgress) ?? ap;
    space();
    const trained = k >= 4, tr = k === 4 ? tween(ptp, tp, u, 2.0) / 100 : tp / 100;
    const cs = trained ? PTS.centers.map((cc, j) => [lerp(INIT[j][0], cc[0], tr), lerp(INIT[j][1], cc[1], tr)]) : INIT;
    PTS.p.forEach((p) => el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: trained && tr > 0.95 ? CC[near(p, PTS.centers)] : OFF, opacity: 0.8 }));
    const RX = 560;
    if (k === 0) { fileIcon(640, 120, 'corpus.npy', { col: ACC, tag: '벡터', s: pop(u, 0.2) });
      mono(720, 112, 'n = 10,000', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.8) }); mono(720, 140, 'd = 384', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.1) }); return; }
    if (k === 1) { mono(RX, 110, 'nlist = int(√10000)', { 'font-size': 18, 'font-weight': 700 }); mono(RX, 150, '      = 100', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      note(RX, 200, '셀 하나에 평균 100개', fade(u, 1.5), { fill: MUT }); return; }
    if (k >= 2 && k <= 3) { const s = k === 2 ? pop(u, 0.2) : 1, s2 = k === 2 ? pop(u, 0.8) : 1;
      card(RX + 180, 90, 360, 54, { rx: 10, text: 'quantizer = IndexFlatL2(384)\n중심점 100개 자리 (비어 있음)', fs: 14, stroke: INK, dash: '6 5', s, mono: false });
      card(RX + 180, 180, 360, 54, { rx: 10, text: 'IndexIVFFlat(quantizer, 384, 100)\n셀마다 원본 벡터를 그대로', fs: 14, stroke: ACC, color: ACC, fill: ACCBG, s: s2 });
      if (k === 3) { mono(RX, 260, 'index.is_trained  →  False', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
        fly(RX + 20, 310, RX + 280, 310, seg(u, 0.6, 1.6), 'index.add(…)', { mono: true, fill: MUT, stay: u < 1.6 });
        if (u > 1.6) { cross(RX + 300, 310, 13, pop(u, 1.6)); note(RX, 360, '중심이 없으니 넣을 셀을 못 고른다', fade(u, 1.9), { fill: BAD }); } }
      return; }
    cs.forEach(([x, y], j) => diamond(x, y, 1, trained && tr > 0.95 ? CC[j] : INK));
    if (k === 4) { progress(RX, 100, 280, tr * 100, 'train (k-means) 진행률', ACC);
      mono(RX, 170, 'is_trained = ' + (tr >= 0.99 ? 'True' : 'False'), { 'font-size': 16, 'font-weight': 800, fill: tr >= 0.99 ? GOOD : BAD });
      note(RX, 214, '중심점 100개가 데이터 쪽으로 옮겨 간다', fade(u, 0.6), { fill: MUT }); return; }
    // k 5: add → 역색인 목록
    const af = tween(pap, ap, u, 2.0) / 100;
    for (let i = 0; i < 6; i++) { const a = seg(u, 0.2 + i * 0.25, 0.9 + i * 0.25), p = PTS.p[i * 7], j = near(p, PTS.centers); if (a > 0 && a < 1) dot([p, [RX + 40, 92 + j * 30]], a, CC[j], 5); }
    invlists(RX, 80, af);
    mono(RX, 350, 'index.ntotal = ' + fmtN(10000 * af), { 'font-size': 17, 'font-weight': 800, fill: ACC }); }

  // ---------- 3. 저장 ----------
  function ram(x, y, op) { el('rect', { x, y, width: 300, height: 150, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: op });
    for (let i = 0; i < 8; i++) el('rect', { x: x + 16 + i * 35, y: y + 150, width: 20, height: 12, fill: ACC, opacity: op * 0.7 });
    tx(x + 14, y + 26, 'RAM — index 객체', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: op });
    for (let i = 0; i < 7; i++) el('rect', { x: x + 16, y: y + 44 + i * 13, width: 268, height: 8, rx: 2, fill: ACC, opacity: 0.3 * op }); }
  function s3(t, c) { const { k, u } = c, f = c.beat.indexFile, pf = (c.prev && c.prev.indexFile) || f;
    if (k <= 1) { ram(60, 80, 1);
      el('rect', { x: 620, y: 70, width: 280, height: 220, rx: 14, fill: SOFT, stroke: GRID, 'stroke-width': 2 }); tx(636, 96, '디스크', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      mono(60, 300, 'INDEX_PATH = "wiki_10k.index"', { 'font-size': 16, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.6) : 1 });
      if (k === 0) { note(640, 190, '아직 비어 있다', fade(u, 1.0), { fill: MUT }); note(60, 340, '프로세스가 끝나면 RAM 의 index 는 사라진다', fade(u, 1.6), { fill: WARN }); return; }
      for (let i = 0; i < 8; i++) { const a = seg(u, 0.2 + i * 0.15, 1.0 + i * 0.15); if (a > 0 && a < 1) dot([[360, 150 + (i % 3) * 20], [740, 170]], a, ACC, 6); }
      fileIcon(760, 170, 'wiki_10k.index', { col: ACC, s: pop(u, 1.2) });
      mono(60, 340, 'faiss.write_index(index, INDEX_PATH)', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) }); return; }
    if (k === 2) { fileIcon(200, 170, 'wiki_10k.index', { col: ACC });
      const mb = tween(pf.sizeMb, f.sizeMb, u, 1.6); mono(330, 160, mb.toFixed(1) + ' MB', { 'font-size': 34, 'font-weight': 800, fill: ACC });
      mono(330, 200, 'os.path.getsize(…) / 1024²', { 'font-size': 14.5, fill: MUT });
      R.hbar(330, 250, 400, 14.65, 14.9, { u: E(u, 1.2, 2.0), col: MUT, text: '벡터 원본 14.6 MB' }); R.hbar(330, 284, 400, 14.87, 14.9, { u: E(u, 1.4, 2.2), col: ACC, text: '.index 파일 14.9 MB' });
      note(330, 340, '거의 원본 크기 그대로다 (IVFFlat 은 압축하지 않는다)', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 3) { // 파일 해부
      const parts = [['헤더 · 메트릭 · nlist', 0.02, INK], ['중심점 100 × 384', 0.15, WARN], ['벡터 10,000 × 384', 14.65, ACC], ['id 10,000개', 0.08, INFO]];
      tx(60, 60, 'wiki_10k.index 안 (MB)', { 'font-size': 16, 'font-weight': 800 });
      let x = 60; const W = 840, tot = 14.9;
      parts.forEach(([n, v, col], i) => { const w = Math.max(10, W * v / tot) * E(u, 0.2 + i * 0.3, 0.9 + i * 0.3); el('rect', { x, y: 90, width: w, height: 50, fill: col, opacity: 0.75 }); x += Math.max(10, W * v / tot) + 2; });
      parts.forEach(([n, v, col], i) => { const y = 190 + i * 42, o = fade(u, 0.6 + i * 0.3); el('rect', { x: 60, y: y - 14, width: 18, height: 18, rx: 3, fill: col, opacity: 0.75 * o });
        tx(90, y, n, { 'font-size': 15.5, 'font-weight': 700, opacity: o }); mono(420, y, v.toFixed(2) + ' MB', { 'font-size': 15, 'text-anchor': 'end', opacity: o }); });
      note(520, 220, '중심점이 같이 저장되니', fade(u, 1.8)); note(520, 246, '읽자마자 train 없이 검색된다', fade(u, 1.9), { fill: GOOD }); return; }
    if (k === 4) { fileIcon(200, 150, 'wiki_10k.index', { col: ACC, tag: '벡터+id' }); fileIcon(560, 150, 'texts.pkl', { col: WARN, tag: '문장', s: pop(u, 0.3) });
      zone(330, 250, 480, 110, 'id → 문장 (예시)', { fill: WARNBG, stroke: WARN, op: fade(u, 0.8) });
      mono(346, 300, 'texts[4821] → "' + SAMPLE[0].slice(0, 12) + '…"', { 'font-size': 14.5, opacity: fade(u, 1.0) });
      mono(346, 330, 'texts[912]  → "' + SAMPLE[1].slice(0, 12) + '…"', { 'font-size': 14.5, opacity: fade(u, 1.2) });
      note(60, 300, '인덱스에는', fade(u, 1.6)); note(60, 326, '문장이 없다', fade(u, 1.6), { fill: BAD }); return; }
    // k 5: 빌드는 한 번, 로드는 여러 번
    const steps = [['embed', '수십 분', INFO], ['train', '수 분', ACC], ['add', '수 분', ACC]];
    tx(60, 60, '빌드 (한 번)', { 'font-size': 16, 'font-weight': 800 });
    steps.forEach(([n, d, col], i) => { const s = pop(u, 0.2 + i * 0.25); card(140 + i * 170, 120, 150, 56, { rx: 8, text: n + '\n' + d, fs: 15, stroke: col, color: col, s }); });
    fileIcon(690, 120, '.index', { col: ACC, s: pop(u, 1.0) });
    tx(60, 250, '서비스 시작 (매번)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
    for (let i = 0; i < 5; i++) { const s = pop(u, 1.4 + i * 0.15); card(140 + i * 150, 310, 130, 50, { rx: 8, text: 'read_index\n~1초', fs: 14, stroke: GOOD, color: GOOD, s }); } }

  // ---------- 4. 로드 + 검색 ----------
  function cellsSmall(x, y, w, h, q, probe) { // 셀 8개로 나눈 공간, probe 개만 연다
    el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: GRID });
    const sx = w / 470, sy = h / 350, cs = PTS.centers.map(([a, b]) => [x + (a - 40) * sx, y + (b - 40) * sy]);
    const order = cs.map((cc, j) => [Math.hypot(cc[0] - q[0], cc[1] - q[1]), j]).sort((a, b) => a[0] - b[0]).map((d) => d[1]), open = order.slice(0, probe);
    PTS.p.forEach((p) => { const pp = [x + (p[0] - 40) * sx, y + (p[1] - 40) * sy], j = near(pp, cs); el('circle', { cx: pp[0], cy: pp[1], r: 3.5, fill: CC[j], opacity: open.includes(j) ? 0.85 : 0.12 }); });
    cs.forEach(([a, b], j) => diamond(a, b, open.includes(j) ? 1 : 0.3, CC[j])); return { cs, open, order }; }
  function s4(t, c) { const { k, u } = c, sr = c.beat.searchResult;
    // 프로세스 A (흐리게) · 파일 · 프로세스 B
    const B0 = 330;
    if (k <= 2) { el('rect', { x: 30, y: 40, width: 200, height: 120, rx: 12, fill: PANEL, stroke: OFF, 'stroke-dasharray': '6 5', 'stroke-width': 2 });
      tx(46, 66, '프로세스 A (빌드)', { 'font-size': 14.5, fill: OFF, 'font-weight': 700 }); tx(46, 96, '이미 끝났다', { 'font-size': 14, fill: OFF });
      fileIcon(130, 270, 'wiki_10k.index', { col: ACC });
      el('rect', { x: B0, y: 40, width: 600, height: 340, rx: 14, fill: SOFT, stroke: INFO, 'stroke-width': 2.5 }); tx(B0 + 16, 66, '프로세스 B (검색 서비스)', { 'font-size': 15, fill: INFO, 'font-weight': 800 });
      const a = k === 0 ? seg(u, 0.3, 1.3) : 1; if (k === 0 && a < 1) dot([[170, 270], [B0 + 40, 140]], a, ACC, 7);
      card(B0 + 150, 130, 240, 74, { rx: 10, text: 'IndexIVFFlat\nntotal 10,000 · nlist 100', fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 1.3) : 1 });
      if (k === 0) { mono(B0 + 20, 250, 'faiss.read_index("wiki_10k.index")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); note(B0 + 20, 290, '빌드 코드를 몰라도 된다', fade(u, 1.8), { fill: MUT }); return; }
      fileIcon(B0 + 440, 140, 'texts.pkl', { col: WARN, tag: '문장', s: k === 1 ? pop(u, 0.3) : 1 });
      if (k === 1) { note(B0 + 20, 270, 'id 를 문장으로 되돌릴 사전도 함께 연다', fade(u, 1.0)); return; }
      // k 2: 같은 모델
      card(B0 + 150, 280, 240, 60, { rx: 10, text: 'all-MiniLM-L6-v2', fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      check(B0 + 290, 280, 12, pop(u, 0.8)); mono(B0 + 320, 286, '빌드와 같은 모델', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
      mono(B0 + 20, 362, '다른 모델(768차원 등)을 쓰면 거리 자체가 무의미하다', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { tx(60, 80, 'query = "강아지 훈련 방법"', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) });
      grow(160, 110, 160, 160, E(u, 0.5, 1.0), ACC); mono(180, 140, 'model.encode(…, normalize=True)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      for (let i = 0; i < 12; i++) { const s = clamp(E(u, 1.0, 2.0) * 12 - i); if (s > 0) card(80 + i * 40, 200, 34, 34, { rx: 4, text: '', stroke: INFO, fill: INFOBG, op: s }); }
      mono(570, 222, '… qv (1, 384) float32', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.0) }); return; }
    // k ≥ 4: 셀 그림 + 결과
    const q = [190, 210], cells = cellsSmall(30, 40, 360, 320, q, sr.nprobe); star(q[0], q[1], 1.1);
    tx(30, 390, 'nprobe = ' + sr.nprobe + ' → 가장 가까운 셀 하나만 연다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
    if (k === 4) { mono(430, 80, 'D, I = index.search(qv, 5)', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      [['D', '[[0.182 0.241 0.298 …]]'], ['I', '[[4821  912 7330 …]]']].forEach(([n, v], i) => { mono(430, 130 + i * 34, n + ' = ' + v, { 'font-size': 15, opacity: fade(u, 0.6 + i * 0.4) }); });
      note(430, 220, '아직 id 와 거리뿐, 문장은 없다', fade(u, 1.6), { fill: MUT }); mono(430, 250, '예시 값', { 'font-size': 13.5, fill: MUT }); return; }
    const items = sr.items || [];
    if (k === 5) { items.forEach((it, i) => { const y = 80 + i * 70, o = fade(u, 0.3 + i * 0.4);
        mono(430, y, it.rank + '위  id=' + it.id + '  dist=' + it.dist.toFixed(3), { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: o });
        tx(450, y + 26, it.doc, { 'font-size': 14.5, opacity: o }); });
      mono(430, 300, 'if idx == -1: continue', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) }); note(430, 328, '-1 = 채울 결과가 모자랐다는 표시', fade(u, 1.8), { fill: MUT });
      mono(430, 370, '문장·거리는 예시 값', { 'font-size': 13.5, fill: MUT }); return; }
    // k 6: 옆 셀의 정답을 놓친다
    const nb = cells.cs[cells.order[1]]; el('circle', { cx: nb[0], cy: nb[1], r: 34, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
    grow(q[0], q[1], nb[0], nb[1], E(u, 0.3, 1.0), BAD, { dash: '5 4' }); cross(lerp(q[0], nb[0], 0.5), lerp(q[1], nb[1], 0.5), 10, pop(u, 1.0));
    note(430, 110, '정답 일부가 옆 셀에 있다', fade(u, 0.6), { fill: BAD });
    R.meters(430, 160, 480, [{ name: 'latency', val: sr.latencyMs + ' ms', good: true }, { name: 'recall@5', val: sr.recall.toFixed(2), hot: true, bar: sr.recall * 100 }]);
    mono(430, 270, '예시 값', { 'font-size': 13.5, fill: MUT }); note(430, 320, '빠르지만 놓친다 → nprobe 를 올린다', fade(u, 1.6)); }

  // ---------- 5. nprobe 튜닝 ----------
  const TRADE = [[1, 0.62, 0.42], [2, 0.78, 0.71], [5, 0.91, 1.20], [10, 0.96, 1.78], [20, 0.98, 3.10], [50, 0.99, 7.40]];   // 페이지 출력 예시
  function s5(t, c) { const { k, u } = c, sr = c.beat.searchResult, pr = (c.prev && c.prev.searchResult) || sr;
    if (k === 0) { [['queries', '(100, 384)', INFO], ['ground_truth_top5', '(100, 5)', GOOD], ['wiki_10k.index', 'nlist 100', ACC]].forEach(([n, s, col], i) => {
        const o = pop(u, 0.2 + i * 0.4); card(180 + i * 300, 160, 250, 90, { rx: 10, stroke: col, s: o }); mono(180 + i * 300, 152, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: o }); mono(180 + i * 300, 180, s, { 'text-anchor': 'middle', 'font-size': 15, opacity: o }); });
      note(480, 300, '정답은 IndexFlatL2 전수 검색으로 미리 구해 둔다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    // 왼쪽: 셀 열기
    const np = sr.nprobe, q = [180, 220]; cellsSmall(30, 50, 300, 270, q, { 1: 1, 2: 2, 5: 3, 10: 4, 20: 5, 50: 8 }[np] || 1);
    star(q[0], q[1], 1); mono(30, 350, 'index.nprobe = ' + np, { 'font-size': 18, 'font-weight': 800, fill: ACC });
    mono(30, 378, '(100칸 중 ' + np + '칸)', { 'font-size': 14.5, fill: MUT });
    // 오른쪽: recall–latency 곡선
    const ax = R.axes(420, 60, 470, 280, { x: [0, 8], y: [0.5, 1], xt: [0, 2, 4, 6, 8], yt: [0.6, 0.8, 1.0], grid: true });
    tx(420, 46, 'recall@5', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); tx(890, 384, 'latency ms', { 'font-size': 14, fill: MUT, 'font-weight': 600, 'text-anchor': 'end' });
    const shown = k >= 4 ? 6 : TRADE.findIndex((r) => r[0] === np) + 1, prevN = k >= 5 ? 6 : TRADE.findIndex((r) => r[0] === pr.nprobe) + 1;
    const drawN = k === 4 ? lerp(prevN, 6, E(u, 0.2, 1.6)) : lerp(Math.max(1, prevN), shown, E(u, 0.2, 1.2));
    R.line(ax, TRADE.map((r) => [r[2], r[1]]), clamp((drawN - 1) / 5), ACC);
    TRADE.forEach(([n, rc, ms], i) => { if (i + 1 > Math.ceil(drawN - 0.01)) return; const hot = n === 10 && k >= 4;
      el('circle', { cx: ax.X(ms), cy: ax.Y(rc), r: hot ? 9 : 6, fill: hot ? BAD : ACC });
      const off = [[10, 5], [10, 5], [-12, -10], [10, 22], [0, -12], [-8, -12]][i]; mono(ax.X(ms) + off[0], ax.Y(rc) + off[1], 'np' + n, { 'text-anchor': off[0] < 0 ? 'end' : 'start', 'font-size': 14, 'font-weight': 700, fill: hot ? BAD : ACC }); });
    const rc = tween(pr.recall, sr.recall, u), ms = tween(pr.latencyMs, sr.latencyMs, u);
    mono(890, 230, 'recall ' + rc.toFixed(2), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: ACC });
    mono(890, 258, ms.toFixed(2) + ' ms', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: INK });
    mono(890, 286, '예시 값', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (k === 4) note(560, 150, 'nprobe 10 뒤로는 시간만 늘고 recall 은 거의 그대로', fade(u, 1.8), { fill: BAD, 'font-size': 14.5 });
    if (k === 5) { card(720, 160, 300, 50, { rx: 10, text: 'index.nprobe = 10  (재빌드 없음)', fs: 15, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.3) }); } }

  const quiz = [
    { q: '임베딩 결과를 FAISS에 넣기 전에 꼭 맞춰야 하는 형식은 무엇인가?',
      o: ['float64 리스트', 'C-contiguous float32 배열', '문자열 리스트'], a: 1,
      why: 'FAISS는 C-contiguous float32만 받는다. np.ascontiguousarray(..., dtype="float32")를 빠뜨리면 add에서 에러가 난다.' },
    { q: 'IndexIVFFlat을 만들고 바로 add를 부르면 왜 실패하는가?',
      o: ['nprobe를 정하지 않아서', 'quantizer가 Flat이라서', 'train 전이라 셀 중심이 없어 벡터를 넣을 셀을 못 고르기 때문'], a: 2,
      why: 'IVF는 k-means로 중심점 100개를 먼저 배워야 한다. 그 전에는 is_trained가 False다.' },
    { q: 'write_index로 저장한 wiki_10k.index 파일에 들어 있지 않은 것은 무엇인가?',
      o: ['원본 문장 텍스트', '중심점 100개', '1만 개 벡터와 id'], a: 0,
      why: '파일 14.9 MB 대부분은 벡터 원본이고 중심점·id가 조금 붙는다. 문장은 texts.pkl처럼 따로 보관해야 한다.' },
    { q: '검색 서비스(프로세스 B)에서 쿼리를 임베딩할 때 지켜야 할 것은 무엇인가?',
      o: ['빌드 때와 같은 임베딩 모델을 쓴다', '더 큰 최신 모델로 바꾼다', 'normalize를 끈다'], a: 0,
      why: '쿼리와 문서가 같은 384차원 공간에 있어야 거리가 뜻을 가진다. 모델이 다르면 공간이 달라진다.' },
    { q: 'nprobe를 1에서 10으로 올렸을 때 예시 측정값은 어떻게 바뀌었는가?',
      o: ['recall은 그대로이고 latency만 늘었다', 'recall 0.62 → 0.96, latency 0.42 → 1.78 ms', '재빌드를 해야 바뀐다'], a: 1,
      why: '여는 셀이 늘어 놓치던 정답을 찾는다. nprobe는 런타임 속성이라 재빌드 없이 바꾼다.' },
  ];

  const summary = [
    '1만 문장을 같은 모델로 384차원 float32 벡터로 만들고, 벡터와 원문은 따로 저장한다.',
    'IVF는 train으로 중심점 100개를 배운 뒤에야 add로 벡터를 셀마다 나눠 담는다.',
    'write_index 파일은 14.9 MB로 원본 벡터에 중심점과 id가 붙은 크기이고 문장은 없다.',
    '검색 쪽은 read_index로 바로 시작하고, nprobe를 올리면 recall과 latency가 함께 오른다.',
  ];
  const review = [
    { q: '서비스를 띄울 때마다 인덱스를 만드느라 수십 분이 걸린다. 무엇을 바꿔야 할까?',
      o: ['빌드 프로세스에서 write_index로 저장하고, 서비스는 read_index만 한다', 'nprobe를 1로 낮춘다', 'batch_size를 줄인다'], a: 0,
      why: 'embed·train·add는 한 번만 치르면 된다. 파일로 굳혀 두면 서비스는 1초 안팎의 로드로 시작한다.' },
    { q: '검색 결과 id는 잘 나오는데 엉뚱한 문장이 표시된다. 먼저 의심할 것은?',
      o: ['nprobe가 너무 크다', 'texts.pkl이 인덱스를 만들 때의 순서와 다르다', 'write_index가 벡터를 압축했다'], a: 1,
      why: '인덱스는 id만 알고 문장은 texts[idx]로 찾는다. 매핑 파일의 순서가 add 순서와 어긋나면 엉뚱한 원문이 붙는다.' },
    { q: '응답은 빠른데 사용자들이 관련 문서를 자주 못 찾는다고 한다. 재빌드 없이 해 볼 수 있는 것은?',
      o: ['nlist를 늘린다', 'train을 다시 돌린다', 'index.nprobe를 올리며 recall과 latency를 잰다'], a: 2,
      why: 'nprobe 1은 셀 하나만 열어 옆 셀의 정답을 놓친다. nprobe는 런타임에 바꿀 수 있고, nlist와 train은 재빌드가 필요하다.' },
  ];

  R.page({ title: 'FAISS 파이프라인 따라가기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
