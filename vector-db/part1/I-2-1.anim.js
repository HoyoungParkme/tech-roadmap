/* I-2-1 벡터 DB 아키텍처 전체 지도 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 위쪽 띠는 늘 다섯 단계 지도(Ingest·Storage·Index·Query·Result)이고, 아래가 그 단계의 실물이다.
 *       문서가 숫자 띠가 되고(1) 벡터·원본·메타가 한 행으로 묶이고(2) HNSW 층이 쌓이고(3)
 *       질문 벡터가 그래프를 따라가 top-k 칸을 채우고(4) 필터·BM25·RRF 가 두 순위를 합친다(5).
 * 숫자: 페이지 STEPS 데이터와 코드. HNSW 층별 노드 수(3 · 23 · 602 · 10,000)와 빌드 4~7초는 faiss-cpu(M=16, efConstruction=128,
 *       1만×1536)로 잰 값, BM25 -0.27 과 RRF 0.033 은 rank_bm25 와 코드 식으로 다시 계산한 값이다. 임베딩 값·검색 점수는 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, dbIcon, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, u, a, d) => s.slice(0, Math.round(s.length * clamp((u - a) / d)));
  function rnd(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  // ---------- 위쪽 지도 띠 ----------
  const ST = ['ingest', 'storage', 'index', 'query', 'result'], STN = ['Ingest', 'Storage', 'Index', 'Query', 'Result'];
  function mapStrip(c, here) { const act = c.beat.active || [], pa = (c.prev && c.prev.active) || act;
    ST.forEach((id, i) => { const x = 110 + i * 185, on = act.includes(id), isNew = on && !pa.includes(id), cur = id === here;
      if (i) { const l = act.includes(ST[i - 1]) && on; el('line', { x1: x - 185 + 66, y1: 28, x2: x - 66, y2: 28, stroke: l ? ACC : GRID, 'stroke-width': l ? 2.5 : 1.5 }); }
      card(x, 28, 128, 32, { rx: 16, fill: cur ? INK : on ? ACCBG : PANEL, stroke: cur ? INK : on ? ACC : GRID, sw: 1.8, text: STN[i], fs: 15, color: cur ? PANEL : on ? ACC : OFF, s: isNew ? pop(c.u, 0.2) : 1 }); }); }
  function strip(x, y, vals, u0, u, o) { o = o || {}; const cs = o.cs || 74;
    vals.forEach((v, i) => { const s = o.fill ? clamp((u - u0 - i * 0.12) / 0.25) : 1, has = v != null && s > 0.5, n = typeof v === 'number';
      el('rect', { x: x + i * cs, y, width: cs - 6, height: 40, rx: 6, fill: has && n ? (v < 0 ? BAD : ACC) : PANEL, opacity: has && n ? 0.18 + 0.55 * Math.min(1, Math.abs(v)) : 1 });
      el('rect', { x: x + i * cs, y, width: cs - 6, height: 40, rx: 6, fill: 'none', stroke: o.col || GRID, 'stroke-width': 1.5 });
      mono(x + i * cs + (cs - 6) / 2, y + 26, has ? (n ? v.toFixed(3) : v) : '?', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: has ? INK : OFF }); }); }
  function doc(cx, cy, title, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), w = o.w || 230;
    el('path', { d: `M${-w / 2},-30 H${w / 2 - 16} L${w / 2},-14 V30 H${-w / 2} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    tx(-w / 2 + 12, 6, title, { 'font-size': o.fs || 14.5, 'font-weight': 600, fill: o.color || INK }, g); return g; }

  // ---------- 장면 1. Ingest ----------
  const V42 = [0.021, -0.834, 0.512, '…', 0.097];
  function s1(t, c) { const { k, u } = c, sm = c.beat.sample; mapStrip(c, 'ingest');
    const MX = 480, MY = 150, model = sm.model !== '모델 미선택';
    const ms = k === 1 ? pop(u, 0.2) : 1;
    const g = k === 5 ? null : card(MX, MY, 230, 70, { rx: 12, fill: model ? ACCBG : PANEL, stroke: model ? ACC : OFF, dash: model ? null : '6 5', sw: 2.5, s: model ? ms : 1 });
    if (g) tx(0, -6, '임베딩 모델', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: model ? ACC : MUT }, g);
    if (g) tx(0, 18, sm.model, { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', fill: model ? INK : MUT }, g);
    if (k === 0) { doc(150, 130, '텍스트 문서', { s: pop(u, 0.2) }); doc(150, 210, '이미지 · 오디오', { s: pop(u, 0.5), stroke: MUT, color: MUT });
      grow(270, 150, MX - 120, MY, E(u, 0.8, 1.4), OFF, { dash: '6 5' }); strip(300, 300, ['?', '?', '?', '…', '?'], 0, u, {});
      tx(300, 370, '고정 길이 벡터 (보통 384~1536차원)', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 1) { mono(MX, MY + 64, 'client = OpenAI()', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) });
      tx(MX, MY + 92, '한 번 만들어 모듈 전체에서 재사용', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) }); return; }
    const one = k === 2 || k === 3 || k === 5;
    if (k === 2 || k === 3) { doc(150, 150, typed('FastAPI는 비동기 웹 프레임워크다', u, k === 2 ? 0.2 : -9, 1.0), { w: 270, fs: 14 }); mono(30, 110, 'doc_42', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      grow(287, 150, MX - 118, MY, 1, MUT);
      R.snippet(560, 240, ['def embed_text(text) -> list[float]:', '    # float 1536개'], { fs: 14.5, op: k === 2 ? fade(u, 0.8) : 0.35 }); }
    if (k === 2) return;
    if (k === 3) { dot([[287, 150], [MX - 118, MY]], seg(u, 0.1, 0.6), ACC, 7); dot([[MX, MY + 36], [MX, 300]], seg(u, 0.6, 0.9), ACC, 7); grow(MX, MY + 36, MX, 296, E(u, 0.5, 0.9), MUT);
      strip(300, 330, V42, 0.9, u, { fill: true, col: ACC }); mono(680, 356, '1536차원', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7) }); return; }
    if (k === 4) { // N번 왕복 → 1번 왕복
      [['doc_42', 110], ['doc_43', 190]].forEach(([d, y], i) => doc(130, y, d, { w: 150, fs: 14.5 }));
      const single = E(u, 1.2, 1.8);
      [110, 190].forEach((y, i) => { el('path', { d: `M210,${y} C300,${y} 300,${MY} ${MX - 118},${MY}`, fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: 1 - single * 0.7 }); dot([[210, y], [MX - 118, MY]], seg(u, 0.1 + i * 0.4, 0.6 + i * 0.4), BAD, 6); });
      if (u > 1.2) { el('rect', { x: 200, y: 260, width: 160, height: 44, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: single }); mono(280, 288, 'input=[2건]', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: single });
        grow(360, 282, MX - 60, MY + 36, single, ACC); }
      tx(640, 280, '왕복 횟수', { 'font-size': 15, fill: MUT, 'font-weight': 600 });
      mono(640, 320, u < 1.4 ? 'N번' : '1번', { 'font-size': 26, 'font-weight': 800, fill: u < 1.4 ? BAD : GOOD });
      tx(640, 350, '같은 순서로 벡터 N개가 돌아온다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    // k5: 문서 2건 → 벡터 2줄
    [['FastAPI는 비동기 웹 프레임워크다', V42], ['벡터 DB는 의미 검색을 지원한다', ['…', '…', '…', '…', '…']]].forEach(([d, v], i) => { const y = 150 + i * 130;
      doc(160, y - 40, d, { w: 290, fs: 14, s: pop(u, 0.1 + i * 0.2) }); strip(330, y - 20, v, 0.6 + i * 0.5, u, { fill: true, col: i ? INFO : ACC, cs: 70 });
      mono(700, y + 6, `vectors[${i}]`, { 'font-size': 15, 'font-weight': 700, fill: i ? INFO : ACC, opacity: fade(u, 1.0 + i * 0.5) }); });
    tx(480, 400, '2 × 1536 (값은 예시)', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); }

  // ---------- 장면 2. Storage: 한 레코드로 묶기 ----------
  const COL = [['id', 70, 90], ['document', 160, 290], ['embedding', 450, 190], ['metadata', 640, 290]];
  const RECS = [['d1', 'FastAPI는 비동기 웹 프레임워크다', '[0.021, -0.834, …]', 'framework · 2026-05-01'], ['d2', '벡터 DB는 의미 검색을 지원한다', '[…]', 'database · 2026-05-03']];
  function header(y, s) { COL.forEach(([n, x, w]) => { el('rect', { x, y, width: w - 6, height: 34, rx: 6, fill: INK, opacity: s }); mono(x + 12, y + 23, n, { 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: s }); }); }
  function rec(y, r, o) { o = o || {}; COL.forEach(([n, x, w], j) => { const s = o.cell ? o.cell(j) : 1; if (s <= 0.01) return; const hi = o.hiMeta && j === 3;
    el('rect', { x, y, width: w - 6, height: 38, rx: 6, fill: hi ? WARNBG : j === 2 ? ACCBG : PANEL, stroke: hi ? WARN : GRID, 'stroke-width': hi ? 2.2 : 1.5, opacity: s });
    (j === 1 ? tx : mono)(x + 10, y + 25, r[j], { 'font-size': j === 1 ? 14 : 14, 'font-weight': j === 0 ? 800 : 500, fill: j === 2 ? ACC : hi ? WARN : INK, opacity: s }); }); }
  function s2(t, c) { const { k, u } = c, sm = c.beat.sample; mapStrip(c, 'storage');
    const HY = 160;
    if (k === 0) { [['벡터', '[0.021, -0.834, …]', ACC], ['원본 텍스트', 'FastAPI는 …', INK], ['메타데이터', '{category, date}', WARN]].forEach(([a, b, col], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.3);
        card(x, 150, 250, 66, { rx: 10, stroke: col, sw: 2, s }); if (s > 0.5) { tx(x, 142, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col }); mono(x, 166, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); }
        grow(x, 186, 480, 290, E(u, 1.2, 1.8), col); });
      card(480, 316, 300, 50, { rx: 25, fill: INK, stroke: 'none', text: '한 레코드로 함께', fs: 16, color: PANEL, s: pop(u, 1.9) }); return; }
    // 디스크
    dbIcon(860, 340, './vec_store', { s: k === 1 ? pop(u, 0.3) : 0.8 });
    if (k === 1) { tx(480, 120, 'PersistentClient(path="./vec_store")', { 'text-anchor': 'middle', 'font-size': 16, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.2) });
      R.server(300, 270, '파이썬 프로세스', { s: 0.8, op: 1 - E(u, 1.4, 2.0) * 0.7 }); cross(300, 270, 26, pop(u, 1.4));
      tx(560, 280, '프로세스가 죽어도', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) }); tx(560, 308, '디스크에 남는다', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    header(HY, k === 2 ? E(u, 0.2, 0.8) : 1); mono(70, HY - 18, 'collection "docs"', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    const cnt = k <= 4 ? 0 : 2; mono(760, HY - 18, `count = ${k === 5 ? Math.round(tween(0, 2, u)) : cnt}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 5 ? ACC : MUT });
    if (k === 2) { tx(480, 260, 'RDB의 테이블에 해당', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: fade(u, 1.0) }); return; }
    if (k === 3) { // ids · docs · metas 세 줄이 길이와 순서를 맞춘다
      [['ids', ['"d1"', '"d2"']], ['docs', ['"FastAPI는 …"', '"벡터 DB는 …"']], ['metas', ['{framework}', '{database}']]].forEach(([n, vs], i) => { const y = 230 + i * 52;
        mono(70, y + 24, n, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2 + i * 0.3) }); vs.forEach((v, j) => card(260 + j * 220, y + 18, 200, 38, { rx: 6, text: v, fs: 14, mono: true, s: pop(u, 0.3 + i * 0.3 + j * 0.15) })); });
      el('rect', { x: 156, y: 236, width: 208, height: 152, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) });
      tx(380, 406, '같은 자리 = 같은 레코드', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { rec(HY + 44, RECS[0], { cell: (j) => fade(u, 0.3 + j * 0.35, 0.3) });
      fly(480, 400, COL[2][1] + 90, HY + 62, seg(u, 0.4, 1.2), 'embedding', { mono: true });
      tx(480, 330, 'collection.add(...) 한 번', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.6) });
      dot([[640, HY + 70], [820, 320]], seg(u, 1.8, 2.5), ACC, 6); return; }
    RECS.forEach((r, i) => rec(HY + 44 + i * 44, r, { cell: k === 5 ? () => fade(u, 0.3 + i * 0.5, 0.3) : null, hiMeta: k === 6 }));
    if (k === 6) { pill(640, 300, 'where category = "framework"', WARN, pop(u, 0.6), { mono: true, fs: 14.5 });
      el('rect', { x: 62, y: HY + 40, width: 870, height: 46, rx: 8, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.3) });
      tx(70, 352, '메타를 함께 두면 검색 때 그대로 필터가 된다', { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); } }

  // ---------- 장면 3. Index: HNSW 층 쌓기 ----------
  const LAY = [['L3', 3, 110], ['L2', 23, 180], ['L1', 602, 250], ['L0', 10000, 320]];   // faiss 실측 층별 노드 수
  function s3(t, c) { const { k, u } = c, ix = c.beat.index; mapStrip(c, 'index');
    if (k === 0) { [['Flat', '정확 · O(N)', 'flat'], ['IVF', '빠름 · 근사', 'ivf'], ['HNSW', '고품질 · 고속', 'hnsw']].forEach(([n, d, kind], i) => { const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.35);
        card(cx, 210, 260, 200, { rx: 14, stroke: i === 2 ? ACC : GRID, sw: 2, s }); if (s < 0.5) return;
        tx(cx, 140, n, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: i === 2 ? ACC : INK }); tx(cx, 290, d, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT });
        const r = rnd(3 + i); for (let j = 0; j < 18; j++) { const x = cx - 90 + r() * 180, y = 170 + r() * 90; el('circle', { cx: x, cy: y, r: 4, fill: kind === 'flat' ? (x < cx - 90 + 180 * clamp(u - 1) ? BAD : OFF) : kind === 'ivf' ? (x < cx ? (y < 215 ? INFO : WARN) : (y < 215 ? GOOD : MUT)) : OFF }); }
        if (kind === 'ivf') { el('line', { x1: cx, y1: 165, x2: cx, y2: 265, stroke: MUT, 'stroke-dasharray': '4 4' }); el('line', { x1: cx - 95, y1: 215, x2: cx + 95, y2: 215, stroke: MUT, 'stroke-dasharray': '4 4' }); }
        if (kind === 'hnsw') [[190, 2], [225, 4], [258, 8]].forEach(([y, n]) => { el('line', { x1: cx - 90, y1: y, x2: cx + 90, y2: y, stroke: GRID, 'stroke-width': 2 }); for (let j = 0; j < n; j++) el('circle', { cx: cx - 80 + j * (160 / Math.max(1, n - 1)), cy: y, r: 4.5, fill: ACC }); }); });
      return; }
    if (k === 1) { [['Distance', '거리 척도'], ['VectorParams', '차원 · 척도'], ['HnswConfigDiff', 'm · ef_construct']].forEach(([n, d], i) => { const cx = 180 + i * 300, s = pop(u, 0.2 + i * 0.3);
        el('circle', { cx, cy: 190, r: 52 * s, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }); const a = -2.2 + E(u, 0.6 + i * 0.3, 1.4 + i * 0.3) * 2.6;
        el('line', { x1: cx, y1: 190, x2: cx + Math.cos(a) * 40 * s, y2: 190 + Math.sin(a) * 40 * s, stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
        mono(cx, 272, n, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.3) }); tx(cx, 298, d, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); });
      tx(480, 370, '인덱스 설정에 쓰는 세 손잡이', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { dbIcon(170, 220, 'Storage', { s: 0.9 }); card(700, 220, 300, 160, { rx: 14, stroke: ACC, sw: 2.5, fill: ACCBG, dash: '6 5' });
      mono(700, 126, './qdrant_store', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC });
      for (let i = 0; i < 12; i++) dot([[230, 220], [560, 220 + ((i % 5) - 2) * 18]], seg(u, 0.1 + i * 0.15, 0.7 + i * 0.15), ACC, 5);
      const n = Math.round(tween(0, 10000, u, 2.2)); mono(700, 236, n.toLocaleString('en-US') + ' vectors', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 }); return; }
    if (k === 3) { const n = Math.round(tween(0, 1536, u, 1.6)); for (let i = 0; i < 96; i++) { const on = i < n / 16; el('rect', { x: 100 + i * 8, y: 180, width: 6, height: 40, fill: on ? ACC : SOFT, opacity: on ? 0.4 + (i % 4) * 0.15 : 1 }); }
      el('path', { d: 'M100,236 V246 H866 V236', fill: 'none', stroke: INK, 'stroke-width': 2 }); mono(483, 272, `dim = ${n}`, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC });
      tx(483, 310, '차원은 임베딩 모델이 정한다 (384 · 768 · 1536)', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 4) { const ox = 260, oy = 320; grow(ox, oy, ox + 170, oy - 170, 1, ACC, { sw: 3 }); grow(ox, oy, ox + 230, oy - 80, 1, INFO, { sw: 3 });
      el('path', { d: `M${ox + 80},${oy - 28} A85,85 0 0 0 ${ox + 60},${oy - 60}`, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.3) });
      mono(560, 170, 'distance = COSINE', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      lock(580, 240, u > 1.2, INK, pop(u, 1.0)); tx(610, 246, '컬렉션을 만들 때 고정', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.1) });
      tx(610, 276, '바꾸려면 다시 만들어야 한다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 5) { // m=16: 한 노드에서 이웃 선 16개, ef_construct=128: 후보 원
      const cx = 300, cy = 230, r = rnd(9);
      el('circle', { cx, cy, r: 150 * E(u, 1.4, 2.2), fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + r() * 0.2, L = 70 + r() * 50, g = E(u, 0.2 + i * 0.06, 0.6 + i * 0.06);
        el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * L * g, y2: cy + Math.sin(a) * L * g, stroke: ACC, 'stroke-width': 2 }); if (g > 0.95) el('circle', { cx: cx + Math.cos(a) * L, cy: cy + Math.sin(a) * L, r: 5, fill: PANEL, stroke: ACC, 'stroke-width': 2 }); }
      el('circle', { cx, cy, r: 11, fill: ACC });
      mono(560, 170, `m = ${ix.mEdges}`, { 'font-size': 20, 'font-weight': 800, fill: ACC }); tx(560, 198, '노드 하나에 이웃 선 16개', { 'font-size': 15, fill: MUT });
      mono(560, 260, 'ef_construct = 128', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) }); tx(560, 288, '이웃을 고를 때 살펴볼 후보 수', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      tx(560, 340, '둘 다 올리면 정확하고 느려진다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k6: 4층이 쌓인다
    LAY.slice().reverse().forEach(([n, cnt, y], i) => { const g = E(u, 0.2 + i * 0.35, 0.8 + i * 0.35); if (g <= 0) return; const w = 520 * g;
      el('path', { d: `M${110 + 40},${y - 22} H${110 + 40 + w} L${110 + w},${y + 22} H110 Z`, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      const dots = Math.min(40, Math.round(Math.sqrt(cnt) * 2.2)), r = rnd(31 + i); for (let j = 0; j < dots * g; j++) el('circle', { cx: 130 + r() * (w - 30), cy: y - 14 + r() * 28, r: 3.5, fill: n === 'L0' ? OFF : ACC });
      mono(60, y + 6, n, { 'font-size': 15, 'font-weight': 800, fill: MUT }); mono(660 + 20, y + 6, cnt.toLocaleString('en-US') + '개', { 'font-size': 16, 'font-weight': 800, fill: n === 'L0' ? INK : ACC, opacity: fade(u, 0.6 + i * 0.35) }); });
    tx(800, 120, 'faiss 실측', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 }); mono(800, 150, 'M=16', { 'font-size': 15, 'font-weight': 700 });
    tx(800, 200, `빌드 ${ix.buildTime}`, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); tx(800, 226, '(이 PC)', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) });
    tx(480, 400, '위층으로 갈수록 약 1/16씩 줄어든다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); }

  // ---------- 장면 4. Query ----------
  const QPTS = (() => { const r = rnd(17), a = []; for (let i = 0; i < 34; i++) a.push([120 + r() * 400, 110 + r() * 270]); return a; })();
  const D1 = [430, 200], D2 = [210, 330], QP = [400, 240];
  function slots(n, hits, o) { o = o || {}; for (let i = 0; i < n; i++) { const y = 140 + i * 66, h = hits[i], s = o.s ? o.s(i) : 1;
    el('rect', { x: 620, y, width: 300, height: 54, rx: 10, fill: h ? GOODBG : PANEL, stroke: h ? GOOD : GRID, 'stroke-width': 2, 'stroke-dasharray': h ? null : '6 5', opacity: s });
    mono(636, y + 33, `#${i + 1}`, { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: s });
    if (h) { mono(680, y + 24, h.id, { 'font-size': 15, 'font-weight': 800, fill: GOOD }); tx(680, y + 44, h.text.slice(0, 18) + (h.text.length > 18 ? '…' : ''), { 'font-size': 13.5, fill: MUT });
      mono(906, y + 33, h.score.toFixed(2), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: GOOD }); }
    else if (o.empty) mono(680, y + 33, o.empty, { 'font-size': 14, fill: MUT, opacity: s }); } }
  function field(o) { o = o || {}; QPTS.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4, fill: OFF }));
    for (let i = 0; i < QPTS.length; i++) { const p = QPTS[i], q = QPTS[(i * 7 + 3) % QPTS.length]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 120) el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: GRID, 'stroke-width': 1.3 }); }
    [[D1, 'd1', GOOD], [D2, 'd2', INFO]].forEach(([p, n, col]) => { el('circle', { cx: p[0], cy: p[1], r: 8, fill: o.hit && o.hit.includes(n) ? col : PANEL, stroke: col, 'stroke-width': 2.5 }); mono(p[0] + 12, p[1] - 10, n, { 'font-size': 15, 'font-weight': 800, fill: col }); }); }
  function s4(t, c) { const { k, u } = c, q = c.beat.query, hits = (q && q.hits) || []; mapStrip(c, 'query');
    if (k === 0) { card(300, 160, 360, 56, { rx: 28, fill: WARNBG, stroke: WARN, text: '"비동기 웹 프레임워크?"', fs: 17, color: WARN, s: pop(u, 0.2) });
      [['같은 모델로 벡터화', 0.8], ['HNSW 인덱스 탐색', 1.2], ['top-k 꺼내기', 1.6]].forEach(([s, a], i) => { pill(300, 250 + i * 50, `${i + 1}. ${s}`, INK, pop(u, a), { fs: 15 }); }); return; }
    if (k === 1) { slots(3, [], { s: (i) => pop(u, 0.2 + i * 0.25), empty: '{ id, score, payload }' }); mono(620, 112, 'k = 3', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      tx(300, 200, 'score 내림차순으로', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.0) }); tx(300, 230, '세 칸을 채운다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { mono(80, 130, '"비동기 웹 프레임워크?"', { 'font-size': 16, 'font-weight': 700, fill: WARN });
      strip(80, 160, [0.031, -0.812, '…', '…', '…'], 0.3, u, { fill: true, col: WARN });
      pill(250, 260, 'text-embedding-3-small', ACC, pop(u, 1.0), { mono: true, fs: 14.5 }); check(410, 260, 10, pop(u, 1.2)); tx(430, 266, '적재 때와 같은 모델', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      pill(250, 320, 'BGE (768차원)', OFF, pop(u, 1.6), { fs: 14.5 }); cross(410, 320, 9, pop(u, 1.8)); tx(430, 326, '다른 모델이면 비교 불가', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      tx(700, 186, 'q_vec · 1536차원', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: WARN, opacity: fade(u, 1.0) }); return; }
    field({ hit: hits.map((h) => h.id) });
    el('circle', { cx: QP[0], cy: QP[1], r: 9, fill: BAD }); mono(QP[0] - 14, QP[1] + 28, 'q_vec', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
    if (k === 3) { const route = [[150, 130], [260, 170], [350, 210], [430, 200]], g = E(u, 0.2, 1.8);
      for (let i = 0; i < route.length - 1; i++) { const s = clamp(g * 3 - i); if (s > 0) grow(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1], s, WARN, { sw: 3 }); }
      el('circle', { cx: QP[0], cy: QP[1], r: 90 * E(u, 1.2, 2.0), fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      mono(620, 150, 'hnsw_ef = 64', { 'font-size': 18, 'font-weight': 800, fill: WARN }); tx(620, 182, '후보 64개까지 들고 다닌다', { 'font-size': 15, fill: MUT });
      tx(620, 236, '전수 비교 없이', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) }); tx(620, 262, '근처 후보만 훑는다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    slots(3, hits, { empty: k === 5 ? '문서가 2건뿐' : '' });
    if (k === 4) fly(D1[0], D1[1], 760, 167, seg(u, 0.2, 1.0), 'd1', { mono: true, fill: GOOD });
    if (k === 5) { fly(D2[0], D2[1], 760, 233, seg(u, 0.2, 1.0), 'd2', { mono: true, fill: INFO });
      tx(620, 380, '글자가 겹치지 않아도 뜻이 가까우면 위로', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    tx(620, 112, 'score (예시 값)', { 'font-size': 14.5, fill: MUT, 'font-weight': 600 }); }

  // ---------- 장면 5. Hybrid ----------
  function s5(t, c) { const { k, u } = c, sm = c.beat.sample; mapStrip(c, 'result');
    if (k === 0) { [['메타 필터', '후보를 먼저 좁힌다', WARN], ['BM25', '키워드 점수', INFO], ['벡터', '의미 점수', ACC], ['RRF', '두 순위를 합친다', INK]].forEach(([a, b, col], i) => { const cx = 140 + i * 228, s = pop(u, 0.2 + i * 0.3);
        card(cx, 200, 200, 110, { rx: 12, stroke: col, sw: 2.5, s }); if (s > 0.5) { tx(cx, 192, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col }); tx(cx, 220, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT }); } });
      return; }
    if (k === 1) { [['Filter', 'qdrant_client.models', WARN], ['BM25Okapi', 'rank_bm25', INFO]].forEach(([a, b, col], i) => { const s = pop(u, 0.2 + i * 0.4);
        card(300 + i * 360, 190, 300, 90, { rx: 12, stroke: col, sw: 2.5, s }); if (s > 0.5) { mono(300 + i * 360, 186, a, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: col }); mono(300 + i * 360, 214, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); } });
      tx(480, 320, '필터는 메타 조건, BM25는 키워드 점수를 맡는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    // 깔때기: d1(framework) 통과, d2(database) 걸림
    const funnel = (o) => { el('path', { d: 'M110,110 L330,110 L250,200 L250,250 L190,250 L190,200 Z', fill: WARNBG, stroke: WARN, 'stroke-width': 2.2, opacity: o });
      mono(220, 100, 'category = framework', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: o }); };
    if (k === 2) { funnel(1);
      card(150, 330, 170, 40, { rx: 8, text: 'd1 · framework', fs: 14.5, mono: true, stroke: GOOD });
      card(560, 170, 170, 40, { rx: 8, text: 'd2 · database', fs: 14.5, mono: true, stroke: BAD, op: 1 - fade(u, 1.6) * 0.5 });
      dot([[220, 80], [220, 250], [180, 310]], seg(u, 0.2, 1.4), GOOD, 7); cross(560, 230, 12, pop(u, 1.4));
      tx(700, 300, 'category가 있을 때만', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.0) }); tx(700, 328, 'Filter(must=[...])', { 'font-size': 15, class: 'mono', fill: MUT, opacity: fade(u, 1.2) }); return; }
    // 두 줄 순위표
    const vecRank = (x, s) => { tx(x, 110, '벡터 순위', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: s });
      card(x + 90, 150, 180, 40, { rx: 8, text: 'rank 0 · d1', fs: 15, mono: true, stroke: ACC, op: s }); };
    const kwRank = (x, s) => { tx(x, 110, 'BM25 순위', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: s });
      card(x + 90, 150, 180, 40, { rx: 8, text: 'rank 0 · d1', fs: 15, mono: true, stroke: INFO, op: s }); };
    if (k === 3) { funnel(0.5); vecRank(400, fade(u, 0.6));
      mono(400, 230, 'limit = k * 2 = 10', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(400, 262, '그런데 필터를 통과한 문서는 d1 하나', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
      mono(400, 300, sm.output, { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { vecRank(80, 1); kwRank(500, fade(u, 0.4));
      mono(500, 230, 'bm25.get_scores(...)', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) }); mono(500, 270, `d1 = ${tween(0, -0.27, u, 1.0).toFixed(2)}`, { 'font-size': 22, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) });
      tx(500, 310, '후보가 1건뿐이라 IDF가 음수가 된다', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(500, 336, '실무에서는 전체 문서로 BM25를 돌린다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 5) { const ax = R.axes(110, 110, 420, 240, { x: [0, 20], y: [0.012, 0.018], xt: [0, 5, 10, 15, 20], yt: [0.012, 0.015, 0.018], xl: 'rank', yl: '1 / (60 + rank)' });
      const pts = []; for (let r = 0; r <= 20; r++) pts.push([r, 1 / (60 + r)]); R.line(ax, pts, E(u, 0.2, 1.4), ACC);
      R.scatter(ax, [[0, 1 / 60, GOOD], [1, 1 / 61, INFO]], { u: fade(u, 1.4), r: 7 });
      mono(620, 150, 'rrf(0) = 0.0167', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); mono(620, 186, 'rrf(1) = 0.0164', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.7) });
      tx(620, 240, '점수가 아니라 순위만 쓴다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.9) }); tx(620, 266, '그래서 척도가 달라도 합친다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 6) { vecRank(80, 1); kwRank(500, 1);
      fly(170, 170, 390, 300, seg(u, 0.2, 1.0), 'rrf(0)', { mono: true, fill: ACC, stay: true }); fly(590, 170, 570, 300, seg(u, 0.5, 1.3), 'rrf(0)', { mono: true, fill: INFO, stay: true });
      mono(480, 360, 'd1 = 1/60 + 1/60 = 0.033', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.5) }); return; }
    // k7: 정렬해 top-k
    card(480, 170, 520, 56, { rx: 10, stroke: GOOD, fill: GOODBG, sw: 2.5, s: pop(u, 0.3) });
    if (u > 0.5) { mono(250, 177, '#1  d1', { 'font-size': 17, 'font-weight': 800, fill: GOOD }); tx(350, 177, 'FastAPI는 비동기 웹 프레임워크다', { 'font-size': 15 }); mono(725, 177, '0.033', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' }); }
    tx(480, 260, '벡터 순위와 키워드 순위가 함께 들어간 결과', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.1) });
    mono(480, 300, 'fused.sort(...); fused[:k]', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); }

  const quiz = [
    { q: '문서 여러 건을 임베딩할 때 batch_embed로 한 번에 보내는 까닭은 무엇인가?',
      o: ['한 번에 보내야 벡터 차원이 커져서', '건마다 따로 부르면 왕복이 N번이라 느리고 비싸서', '배치로 보내야 문서 순서가 섞이지 않아서'], a: 1,
      why: 'N건을 한 요청에 실으면 왕복이 1회로 줄어든다. 돌아온 벡터 리스트는 넣은 순서와 같다.' },
    { q: 'collection.add에 벡터만이 아니라 documents와 metadatas를 함께 넣는 까닭은 무엇인가?',
      o: ['검색 결과로 원본을 돌려주고 category·date 같은 조건으로 거를 수 있어서', '메타데이터가 있어야 벡터 차원이 정해져서', '디스크에 쓰려면 세 가지가 꼭 필요해서'], a: 0,
      why: '벡터만 있으면 id와 거리밖에 모른다. 원본과 메타를 같은 레코드에 두면 결과 표시와 필터 검색이 바로 된다.' },
    { q: 'HNSW를 m=16으로 1만 개에 빌드했을 때 위층으로 갈수록 노드가 적어지는 모습으로 맞는 것은 무엇인가?',
      o: ['층마다 노드 수가 같다', 'L1이 가장 많고 L0이 가장 적다', 'L0 10,000개, L1 602개, L2 23개처럼 위로 갈수록 크게 준다'], a: 2,
      why: '노드가 위층에 오를 확률이 층마다 약 1/16이라 위로 갈수록 듬성해진다. faiss로 재 보니 3 · 23 · 602 · 10,000개였다.' },
    { q: '질문 텍스트를 벡터로 바꿀 때 꼭 지켜야 하는 것은 무엇인가?',
      o: ['문서를 적재할 때 쓴 것과 같은 임베딩 모델을 쓴다', '질문은 문서보다 짧으니 더 작은 모델을 쓴다', '질문 벡터만 L2로 정규화하지 않는다'], a: 0,
      why: '모델이 다르면 차원과 공간이 달라 거리가 아무 뜻이 없다. 같은 embed_text로 만든 q_vec이어야 비교가 성립한다.' },
    { q: 'RRF가 벡터 점수와 BM25 점수를 바로 더하지 않고 순위를 쓰는 까닭은 무엇인가?',
      o: ['순위가 점수보다 계산이 빨라서', '두 점수의 척도가 달라 그대로 더하면 한쪽이 묻혀서', 'BM25 점수는 항상 음수라서'], a: 1,
      why: '코사인은 0~1, BM25는 범위가 따로 논다. 1/(60+rank)로 바꾸면 척도와 상관없이 합칠 수 있다.' },
  ];
  const summary = [
    '문서는 임베딩 모델을 거쳐 고정 길이 벡터가 되고, 여러 건은 한 번에 보내야 싸고 빠르다.',
    '벡터와 원본, 메타데이터를 한 레코드로 저장해야 결과를 보여 주고 조건으로 거를 수 있다.',
    'HNSW 인덱스는 거리 척도와 m, ef_construct를 정해 쌓는다. 척도는 나중에 못 바꾼다.',
    '검색은 같은 모델로 질문을 벡터화해 top-k를 꺼내고, 하이브리드는 필터와 RRF로 순위를 합친다.',
  ];
  const review = [
    { q: '검색 결과에 id와 점수만 오고 원문을 보여 줄 수 없다. 파이프라인에서 먼저 의심할 곳은?',
      o: ['Query 단계의 hnsw_ef 값', 'Storage 단계에서 documents와 metadatas를 함께 넣지 않은 것', 'Ingest 단계의 배치 크기'], a: 1,
      why: '원본과 메타는 저장할 때 같은 레코드에 넣어야 검색 결과의 payload로 돌아온다.' },
    { q: '컬렉션을 COSINE으로 만든 뒤 L2 기준으로 검색하고 싶어졌다. 맞는 대응은?',
      o: ['검색 요청에 distance=L2만 바꿔 보낸다', 'hnsw_ef를 올린다', '새 척도로 컬렉션을 다시 만들고 벡터를 다시 넣는다'], a: 2,
      why: '거리 척도는 컬렉션을 만들 때 고정되고 그래프도 그 척도로 쌓인다. 바꾸려면 다시 빌드해야 한다.' },
    { q: "category=framework 필터를 건 하이브리드 검색에서 BM25 점수가 -0.27처럼 이상하게 나왔다. 먼저 의심할 것은?",
      o: ['필터 뒤 남은 후보 1건만으로 BM25를 돌려 IDF가 망가졌다', '벡터 모델이 BM25와 다른 차원을 써서', 'RRF의 상수 60이 너무 커서'], a: 0,
      why: 'BM25는 문서 집합에서 단어가 얼마나 드문지로 IDF를 잰다. 후보가 한두 건이면 IDF가 0이나 음수가 되므로 전체 문서로 돌려야 한다.' },
  ];

  R.page({ title: '벡터 DB 파이프라인 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
