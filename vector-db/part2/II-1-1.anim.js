/* II-1-1 FAISS란 무엇인가 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 인덱스 크기·메모리·검색 결과는 각 beat 의 indexBox · memory · results 를 읽는다.
 * 검색 결과(D, I)는 build-index.py + search.py 를 seed 42 로 실제 실행한 값(faiss-cpu 1.16.0). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 고정 난수 (같은 그림을 매번 그리도록)
  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const fmtN = (v) => Math.round(v).toLocaleString('en-US');
  // np.random.seed(42) 뒤 random() 의 첫 값들 (실행 확인)
  const V42 = ['0.375', '0.951', '0.732', '0.599', '0.156', '0.156'];

  // 벡터 한 줄: 앞 몇 칸 값 + … + 칸 수
  function vecRow(x, y, vals, o) { o = o || {}; const w = o.w || 58, h = o.h || 34, n = vals.length, u = o.u ?? 1;
    vals.forEach((v, i) => { const s = clamp(u * (n + 1) - i); if (s <= 0) return;
      card(x + i * (w + 4) + w / 2, y + h / 2, w, h, { rx: 5, text: v, fs: 14, mono: true, fw: 600, stroke: o.col || INFO, fill: o.fill || INFOBG, s: 0.6 + 0.4 * s, op: s }); });
    const ex = x + n * (w + 4);
    if (u >= 1 && o.tail !== false) { mono(ex + 6, y + h / 2 + 5, '…', { 'font-size': 16, fill: MUT }); if (o.count) mono(ex + 30, y + h / 2 + 5, o.count, { 'font-size': 14.5, 'font-weight': 700, fill: o.col || INFO }); } }

  // FAISS 인덱스 상자: 안에 벡터 줄이 쌓인다. fill 0→1
  function indexBox(x, y, w, h, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.dying ? BADBG : ACCBG, stroke: o.dying ? BAD : ACC, 'stroke-width': 2.5, 'stroke-dasharray': o.dash, opacity: op });
    tx(x + 14, y + 24, o.name || 'IndexFlatL2', { 'font-size': 15.5, 'font-weight': 800, fill: o.dying ? BAD : ACC, class: 'mono', opacity: op });
    if (o.ntotal != null) mono(x + w - 14, y + 24, 'ntotal ' + fmtN(o.ntotal), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: INK, opacity: op });
    const rows = Math.round((o.fill || 0) * 8);
    for (let i = 0; i < rows; i++) el('rect', { x: x + 14, y: y + h - 18 - i * 11, width: w - 28, height: 7, rx: 2, fill: o.dying ? BAD : ACC, opacity: 0.35 * op }); }

  // Python 프로세스 테두리
  function proc(x, y, w, h, title, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': 2, 'stroke-dasharray': o.dash });
    tx(x + 16, y + 24, title, { 'font-size': 14.5, 'font-weight': 700, fill: o.color || MUT }); }

  // 2차원으로 줄여 그린 벡터 구름 (점 70개)
  const CLOUD = (() => { const r = rng(42), pts = []; for (let i = 0; i < 70; i++) pts.push([60 + r() * 420, 70 + r() * 300]); return pts; })();
  const QP = [300, 210];
  const NEAR = CLOUD.map((p, i) => [Math.hypot(p[0] - QP[0], p[1] - QP[1]), i]).sort((a, b) => a[0] - b[0]).slice(0, 5).map((d) => d[1]);

  // ---------- 1. 설치 ----------
  const T1 = [
    ['$ pip install faiss-cpu', null], ['Successfully installed faiss-cpu', 'var(--good)'],
    ['# pip install faiss-gpu  (CUDA 필요)', 'var(--off)'],
    ['$ python -c "import faiss; print(faiss.__version__)"', null], ['1.16.0', null],
  ];
  function s1(t, c) { const { k, u } = c;
    const shown = k === 0 ? E(u, 0.2, 1.6) * 2 : k === 1 ? 2 + E(u, 0.2, 1.0) : k === 2 ? 3 + E(u, 0.2, 1.6) * 2 : 5;
    terminal(30, 26, 440, 168, T1, shown, { title: 'bash' });
    // 내 앱 프로세스
    proc(510, 26, 420, 168, 'Python 프로세스 (내 앱)');
    card(600, 110, 130, 50, { rx: 8, text: 'app.py', fs: 15, mono: true });
    const pk = k === 0 ? E(u, 1.4, 2.4) : 1;
    if (pk > 0) card(lerp(330, 830, pk), lerp(60, 110, pk), 150, 50, { rx: 8, text: 'faiss 패키지', fs: 15, stroke: ACC, fill: ACCBG, color: ACC });
    if (k >= 3) { grow(667, 110, 752, 110, k === 3 ? E(u, 0.4, 1.0) : 1, ACC); sub(710, 152, '함수 호출', 1, { fill: ACC, 'font-weight': 700 }); }

    // 아래: beat 마다 한 가지
    const y0 = 226;
    if (k === 0 || k === 6) { // 아직 빈 인덱스
      const op = k === 0 ? fade(u, 2.0) : 1;
      el('rect', { x: 330, y: y0 + 30, width: 300, height: 110, rx: 12, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: op });
      tx(480, y0 + 80, '인덱스 없음', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: op });
      mono(480, y0 + 106, 'ntotal = 0', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: op });
      if (k === 6) { // 2017 Meta 공개
        el('line', { x1: 60, y1: y0 + 84, x2: lerp(60, 290, E(u, 0.2, 1.2)), y2: y0 + 84, stroke: MUT, 'stroke-width': 2 });
        el('circle', { cx: 110, cy: y0 + 84, r: 7, fill: ACC, opacity: fade(u, 0.5) });
        lbl(110, y0 + 64, '2017', fade(u, 0.5), { class: 'mono', fill: ACC });
        sub(150, y0 + 116, 'Meta 오픈소스 공개', fade(u, 0.8), { 'font-size': 14.5 });
        note(680, y0 + 70, '추천·검색 백엔드에서', fade(u, 1.4)); note(680, y0 + 96, '쓰이는 라이브러리', fade(u, 1.4)); }
      return; }
    if (k === 1) { // GPU 칩
      const s = pop(u, 0.4); const g = R.G(480, y0 + 85, s);
      el('rect', { x: -70, y: -48, width: 140, height: 96, rx: 8, fill: WARNBG, stroke: WARN, 'stroke-width': 2.5 }, g);
      for (let i = 0; i < 6; i++) { el('line', { x1: -55 + i * 22, y1: -48, x2: -55 + i * 22, y2: -60, stroke: WARN, 'stroke-width': 2.5 }, g); el('line', { x1: -55 + i * 22, y1: 48, x2: -55 + i * 22, y2: 60, stroke: WARN, 'stroke-width': 2.5 }, g); }
      tx(0, -4, 'faiss-gpu', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, class: 'mono' }, g);
      tx(0, 20, 'CUDA 필요', { 'text-anchor': 'middle', 'font-size': 14, fill: INK }, g);
      note(620, y0 + 70, 'CUDA 가 깔린 기계에서만', fade(u, 1.2)); note(620, y0 + 96, '나머지는 faiss-cpu 로 충분하다', fade(u, 1.4), { fill: MUT }); return; }
    if (k === 2) { check(420, y0 + 80, 18, pop(u, 1.8)); note(450, y0 + 86, 'import 성공 = 설치 끝', fade(u, 1.9), { 'font-size': 17 });
      sub(480, y0 + 126, '접속할 주소도 포트도 없다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { // 서버가 아니다
      const s = pop(u, 0.9);
      card(250, y0 + 85, 220, 74, { rx: 10, text: '벡터 DB 서버\n:6333 · REST', fs: 15, stroke: OFF, color: MUT, dash: '6 5', s });
      grow(370, y0 + 85, 560, y0 + 85, E(u, 1.1, 1.7), OFF, { dash: '6 5', plain: true });
      cross(465, y0 + 85, 15, pop(u, 1.8));
      note(600, y0 + 78, '네트워크 왕복이 없다', fade(u, 2.0)); note(600, y0 + 104, '대신 다른 프로세스는 못 쓴다', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 4) { // C++ 코어 + SIMD
      card(170, y0 + 40, 230, 44, { rx: 8, text: 'index.search(q)  · Python', fs: 14.5, mono: true });
      grow(170, y0 + 64, 170, y0 + 104, E(u, 0.2, 0.6), MUT);
      card(170, y0 + 130, 230, 44, { rx: 8, text: 'C++ 코어 (BLAS · AVX)', fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.5) });
      tx(330, y0 + 30, '한 명령으로 float 8개를 함께 계산 (AVX2)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
      const hot = E(u, 1.0, 1.4);
      for (let i = 0; i < 8; i++) { const x = 330 + i * 64;
        el('rect', { x, y: y0 + 48, width: 56, height: 40, rx: 5, fill: hot > 0 ? ACC : PANEL, opacity: 0.25 + 0.6 * hot, stroke: ACC, 'stroke-width': 1.8 });
        mono(x + 28, y0 + 74, 'f' + i, { 'text-anchor': 'middle', 'font-size': 14, fill: INK }); }
      grow(330, y0 + 108, 330 + 8 * 64 - 8, y0 + 108, E(u, 1.0, 1.4), ACC, { plain: true, sw: 4 });
      note(330, y0 + 140, '파이썬은 호출만 하고 계산은 C++ 이 맡는다', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 5) { // float32 ndarray
      tx(60, y0 + 36, 'np.ndarray  shape (1, 768)  dtype float32', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      vecRow(60, y0 + 56, V42, { u: E(u, 0.4, 1.6), count: '768칸' });
      for (let i = 0; i < 3; i++) { const x = 60 + i * 62; el('line', { x1: x, y1: y0 + 100, x2: x + 58, y2: y0 + 100, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.8) }); }
      mono(60, y0 + 124, '한 칸 = 4 byte', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) });
      note(560, y0 + 124, 'float64 를 넘기면 오류가 난다', fade(u, 2.2), { fill: BAD });
      return; } }

  // ---------- 2. Flat 인덱스 만들고 add ----------
  function s2(t, c) { const { k, u } = c, ib = c.beat.indexBox, pb = (c.prev && c.prev.indexBox) || ib;
    // 위: 벡터 하나의 차원
    tx(40, 40, 'dim = 768', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: INFO });
    vecRow(150, 18, V42, { u: k === 0 ? E(u, 0.2, 1.4) : 1, count: '768칸', w: 56, h: 32 });
    if (k === 0) { sub(260, 78, 'all-mpnet-base-v2 = 768 · OpenAI 3-small = 1536', fade(u, 1.6), { 'font-size': 14.5, 'text-anchor': 'start' }); }
    // 오른쪽: 인덱스 상자
    if (ib.created) { const s = k === 1 ? pop(u, 0.3) : 1, n = k === 3 ? tween(pb.ntotal, ib.ntotal, u, 1.6) : ib.ntotal;
      indexBox(600, 100, 320, 200, { ntotal: n, fill: n / 10000 });
      mono(616, 150, 'IndexFlatL2(768)', { 'font-size': 15, fill: INK, opacity: s });
      mono(616, 176, 'is_trained = True', { 'font-size': 14.5, fill: GOOD, opacity: s });
      if (k === 1) note(616, 330, '학습 없이 바로 add 할 수 있다', fade(u, 1.2), { fill: MUT }); }
    // 왼쪽: 10,000 × 768 행렬
    if (k >= 2) { const mu = k === 2 ? E(u, 0.2, 1.8) : 1, rows = 14, gone = k === 3 ? E(u, 0.3, 1.9) : k > 3 ? 1 : 0;
      tx(40, 120, 'vectors (10,000 × 768) float32', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(mu, 0, 0.2) });
      for (let i = 0; i < rows; i++) { const s = clamp(mu * rows - i); if (s <= 0) continue;
        el('rect', { x: 40, y: 134 + i * 13, width: 400 * s, height: 9, rx: 2, fill: INFO, opacity: 0.55 * (1 - gone * 0.6) }); }
      mono(450, 230, '× 10,000행', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(mu, 0.8, 0.2) });
      if (k === 2) sub(240, 342, 'np.random.seed(42) 로 만든 연습용 값', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 3) { for (let i = 0; i < 6; i++) { const a = seg(u, 0.2 + i * 0.25, 0.9 + i * 0.25); if (a > 0 && a < 1) dot([[440, 140 + i * 30], [600, 220 - i * 10]], a, ACC, 6); }
      mono(240, 342, 'index.add(vectors)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) }); }
    if (k === 4) { // 메모리 게이지
      const mb = 10000 * 768 * 4 / 1024 / 1024;
      tx(40, 330, '10,000 × 768 × 4 byte', { 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      mono(40, 358, '= 30,720,000 byte ≈ ' + (mb * E(u, 0.4, 1.4)).toFixed(1) + ' MB', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      tx(600, 330, 'RAM 16 GB 중', { 'font-size': 14.5, fill: MUT, 'font-weight': 600 });
      el('rect', { x: 600, y: 342, width: 320, height: 20, rx: 5, fill: SOFT, stroke: GRID });
      el('rect', { x: 600, y: 342, width: Math.max(3, 320 * 0.029 / 16 * E(u, 0.6, 1.4)), height: 20, rx: 5, fill: ACC });
      mono(920, 386, '0.029 GB', { 'font-size': 14.5, 'text-anchor': 'end', 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); } }

  // ---------- 3. search → D, I ----------
  function cloudBase(op, hiN) {
    el('rect', { x: 40, y: 40, width: 460, height: 350, rx: 12, fill: SOFT, stroke: GRID, opacity: op });
    tx(56, 64, '벡터 공간 (768차원을 2차원으로 줄여 그림)', { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: op });
    CLOUD.forEach((p, i) => { const r = NEAR.indexOf(i); el('circle', { cx: p[0], cy: p[1], r: r >= 0 && r < hiN ? 7 : 5, fill: r >= 0 && r < hiN ? ACC : OFF, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c, res = c.beat.results || [];
    cloudBase(k === 0 ? fade(u, 0.1, 0.8) : 1, k >= 3 ? (k === 3 ? Math.ceil(E(u, 0.2, 1.8) * 5) : 5) : 0);
    indexBox(560, 40, 360, 56, { ntotal: c.beat.indexBox.ntotal });
    if (k === 0) { note(560, 130, '데이터 10,000개가 이미 들어 있다', fade(u, 0.9)); note(560, 156, '(점 하나 = 벡터 하나)', fade(u, 1.2), { fill: MUT }); return; }
    // 쿼리 별
    const qx = k === 1 ? lerp(40, QP[0], E(u, 0.2, 1.4)) : QP[0];
    const star = (x, y, s) => { const g = R.G(x, y, s); el('path', { d: 'M0,-14 L4,-4 L14,-4 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-4 L-4,-4 Z', fill: BAD, stroke: PANEL, 'stroke-width': 1.5 }, g); };
    if (k === 1) { star(qx, QP[1], 1.2); mono(560, 140, 'q = embed("강아지 훈련법")', { 'font-size': 15, fill: INK, opacity: fade(u, 0.8) });
      mono(560, 168, 'shape (1, 768) float32', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.1) }); return; }
    if (k === 2) { const n = Math.floor(E(u, 0.2, 2.2) * CLOUD.length);
      for (let i = 0; i < n; i++) el('line', { x1: QP[0], y1: QP[1], x2: CLOUD[i][0], y2: CLOUD[i][1], stroke: BAD, 'stroke-width': 1, opacity: 0.35 });
      star(QP[0], QP[1], 1.2);
      mono(560, 140, 'D, I = index.search(q, k=5)', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      tx(560, 186, '거리 계산', { 'font-size': 15, 'font-weight': 700 });
      mono(560, 216, fmtN(10000 * E(u, 0.2, 2.2)) + ' / 10,000', { 'font-size': 22, 'font-weight': 800, fill: BAD });
      note(560, 252, '하나도 빼지 않고 전부 잰다', fade(u, 1.8), { fill: MUT }); return; }
    // k ≥ 3: top-5 표시
    NEAR.forEach((i, r) => { if (k === 3 && r >= Math.ceil(E(u, 0.2, 1.8) * 5)) return; const p = CLOUD[i];
      el('line', { x1: QP[0], y1: QP[1], x2: p[0], y2: p[1], stroke: ACC, 'stroke-width': 2 }); mono(p[0] + 9, p[1] - 8, String(r + 1), { 'font-size': 14, 'font-weight': 800, fill: ACC }); });
    star(QP[0], QP[1], 1.2);
    // D, I 표
    const x0 = 560, y0 = 124;
    tx(x0, y0, '순위', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); tx(x0 + 70, y0, 'I (id)', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); tx(x0 + 190, y0, 'D (L2²)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    res.forEach((r, i) => { const s = k === 3 ? clamp(E(u, 0.2, 1.8) * 5 - i) : 1; if (s <= 0) return; const y = y0 + 30 + i * 30;
      mono(x0 + 10, y, String(r.rank), { 'font-size': 15, fill: INK, opacity: s });
      mono(x0 + 70, y, String(r.idx), { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: s });
      mono(x0 + 190, y, r.dist.toFixed(4), { 'font-size': 15, fill: INK, opacity: s }); });
    if (k === 3) { note(560, 300, '랜덤 벡터라 거리가 모두 비슷하다', fade(u, 2.0), { fill: MUT }); note(560, 324, '(전체 평균 130.5)', fade(u, 2.1), { fill: MUT, class: 'mono' }); return; }
    if (k >= 4) { // docs 매핑은 사용자 몫
      const s = k === 4 ? pop(u, 0.5) : 1;
      zone(560, 290, 360, 104, 'docs  (내가 따로 보관)', { fill: WARNBG, stroke: WARN, op: s });
      mono(576, 340, 'docs[7178] → "강아지 앉아 훈련…"', { 'font-size': 14.5, opacity: s });
      mono(576, 368, 'docs[7688] → "산책 줄 당김 교정…"', { 'font-size': 14.5, opacity: s });
      mono(905, 384, '예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s }); }
    if (k === 5) banner(270, 356, 'FAISS = 벡터 → id 검색기', pop(u, 0.3)); }

  // ---------- 4. 메모리 = N × d × byte ----------
  const MEM = [['1만', 10000, 0.029], ['10만', 1e5, 0.29], ['100만', 1e6, 2.86], ['1000만', 1e7, 28.6], ['1억', 1e8, 286]];
  function s4(t, c) { const { k, u } = c, m = c.beat.memory, pm = (c.prev && c.prev.memory) || m;
    // 공식 칸
    const n = tween(pm.vectors, m.vectors, u), bp = tween(pm.bytes_per, m.bytes_per, u), gb = tween(pm.used_gb, m.used_gb, u);
    const cellF = (x, label, val, hot) => { card(x, 50, 150, 52, { rx: 8, text: val, fs: 17, mono: true, fw: 800, stroke: hot ? WARN : INK, color: hot ? WARN : INK }); sub(x, 92, label, 1); };
    cellF(110, 'N (벡터 수)', fmtN(n), k >= 2 && k <= 4 && u < 1.6);
    mono(200, 57, '×', { 'font-size': 20, 'text-anchor': 'middle' }); cellF(290, 'd (차원)', '768');
    mono(380, 57, '×', { 'font-size': 20, 'text-anchor': 'middle' }); cellF(470, 'byte', bp.toFixed(0) + (bp < 3 ? ' (fp16)' : ' (fp32)'), k === 1);
    mono(560, 57, '=', { 'font-size': 20, 'text-anchor': 'middle' });
    card(700, 50, 220, 52, { rx: 8, text: (gb < 1 ? gb.toFixed(3) : gb.toFixed(gb < 10 ? 2 : 1)) + ' GB', fs: 19, mono: true, fw: 800, stroke: gb > 16 ? BAD : ACC, color: gb > 16 ? BAD : ACC, fill: gb > 16 ? BADBG : ACCBG });
    if (k === 0) { sub(700, 92, 'GiB 기준 (÷ 1024³)', fade(u, 1)); }
    // 로그 막대 그래프
    const ax = R.axes(110, 140, 700, 220, { x: [0, 5], y: [-2, 3], yt: [] });
    [-2, -1, 0, 1, 2, 3].forEach((e) => { const y = ax.Y(e); el('line', { x1: 110, y1: y, x2: 810, y2: y, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(100, y + 5, e < 0 ? String(Math.pow(10, e)) : String(Math.pow(10, e)), { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }); });
    tx(110, 128, 'GB (로그 눈금)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    // RAM 16 GB 선
    const yr = ax.Y(Math.log10(16));
    el('line', { x1: 110, y1: yr, x2: 830, y2: yr, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '7 5' }); mono(836, yr + 5, 'RAM 16 GB', { 'font-size': 14, 'font-weight': 700, fill: BAD });
    const upto = k <= 1 ? 1 : k === 2 ? 2 : k === 3 || k === 5 ? 3 : 5;
    MEM.forEach(([name, , v], i) => { if (i >= upto) return; const cx = ax.X(i + 0.5);
      const grow1 = (k === 2 && i === 1) || (k === 3 && i === 2) || (k === 4 && i >= 3) ? E(u, 0.3 + (i === 4 ? 0.5 : 0), 1.5 + (i === 4 ? 0.5 : 0)) : 1;
      const top = ax.Y(-2 + (Math.log10(v) + 2) * grow1), over = v > 16, ghost = i === 4;
      el('rect', { x: cx - 34, y: top, width: 68, height: ax.Y(-2) - top, rx: 4, fill: over ? BAD : ACC, opacity: ghost ? 0.35 : 0.8, stroke: ghost ? BAD : 'none', 'stroke-dasharray': ghost ? '5 4' : null });
      mono(cx, top - 8, (v < 1 ? v.toFixed(3) : v < 10 ? v.toFixed(2) : v.toFixed(v < 100 ? 1 : 0)), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: over ? BAD : INK, opacity: fade(grow1, 0.8, 0.2) });
      lbl(cx, ax.Y(-2) + 22, name, 1, { 'font-size': 15 }); });
    if (k === 1) { const cx = ax.X(0.5) + 40, v = 0.014, top = ax.Y(-2 + (Math.log10(v) + 2) * E(u, 0.4, 1.4));
      el('rect', { x: cx, y: top, width: 30, height: ax.Y(-2) - top, rx: 4, fill: INFO, opacity: 0.8 });
      mono(cx + 15, top - 8, '0.014', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.4) });
      note(300, 330, 'float16 이면 같은 1만 개가 절반', fade(u, 1.6), { fill: INFO }); }
    if (k === 4) note(130, 176, '1000만 개부터 한 대에 안 들어간다', fade(u, 1.6), { fill: BAD });
    if (k === 5) { const cx = ax.X(2.5), s = E(u, 0.3, 1.4);
      const lo = ax.Y(Math.log10(2.86 / 32)), hi = ax.Y(Math.log10(2.86 / 8));
      el('rect', { x: cx + 44, y: hi, width: 40, height: lo - hi, rx: 4, fill: GOOD, opacity: 0.75 * s });
      grow(cx + 34, ax.Y(Math.log10(2.86)) + 6, cx + 62, hi - 4, s, GOOD);
      mono(cx + 92, hi + 4, '0.36', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) }); mono(cx + 92, lo + 4, '0.09', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) });
      note(ax.X(3.85), 300, 'PQ 압축 1/8 ~ 1/32', fade(u, 1.3), { fill: GOOD }); note(ax.X(3.85), 326, 'IVF 는 뒤지는 범위를 줄인다', fade(u, 1.6), { fill: MUT }); } }

  // ---------- 5. 한계 ----------
  function s5(t, c) { const { k, u } = c, lim = c.beat.limits || [];
    // 왼쪽 위: 인덱스 상자 (휘발 표시)
    const dying = c.beat.indexBox.dying;
    if (k <= 2) {
      const lost = k === 0 ? E(u, 0.8, 2.0) : 0;
      proc(40, 30, 420, 230, k === 0 && u > 0.6 ? 'Python 프로세스 — 종료됨' : 'Python 프로세스', { stroke: k === 0 && u > 0.6 ? BAD : GRID, color: k === 0 && u > 0.6 ? BAD : MUT, dash: k === 0 && u > 0.6 ? '6 5' : null });
      indexBox(70, 60, 360, 170, { ntotal: Math.round(1e6 * (1 - lost)), dying: dying && k !== 1, fill: 1 - lost });
      if (k === 0) { for (let i = 0; i < 8; i++) { const a = E(u, 0.8 + i * 0.08, 2.0 + i * 0.08); if (a > 0) el('rect', { x: 84 + i * 40, y: 200 + a * 160, width: 30, height: 7, rx: 2, fill: BAD, opacity: 0.5 * (1 - a) }); }
        note(500, 120, '프로세스가 끝나면', fade(u, 0.4)); note(500, 146, '벡터 100만 개가 통째로 사라진다', fade(u, 1.2), { fill: BAD }); }
      if (k >= 1) { // 파일
        const fx = 640, fy = 150, s = k === 1 ? pop(u, 0.2) : 1;
        const g = R.G(fx, fy, s); el('path', { d: 'M-40,-52 H22 L40,-34 V52 H-40 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.5 }, g); el('path', { d: 'M22,-52 V-34 H40', fill: 'none', stroke: INK, 'stroke-width': 2 }, g);
        tx(0, 76, 'my_index.faiss', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono' }, g);
        if (k === 1) { const a = seg(u, 0.5, 1.4), b = seg(u, 1.5, 2.4);
          if (a > 0 && a < 1) fly(430, 120, 600, 120, a, 'write_index', { mono: true });
          if (b > 0 && b < 1) fly(600, 180, 430, 180, b, 'read_index', { mono: true, fill: INFO });
          note(500, 290, '저장했다가 다시 읽으면 휘발은 막는다', fade(u, 2.0)); }
        if (k === 2) { // 두 프로세스가 같은 파일에
          card(840, 80, 130, 44, { rx: 8, text: '프로세스 A', fs: 14.5, s: pop(u, 0.2) }); card(840, 220, 130, 44, { rx: 8, text: '프로세스 B', fs: 14.5, s: pop(u, 0.4) });
          grow(775, 90, 690, 120, E(u, 0.6, 1.2), BAD); grow(775, 210, 690, 180, E(u, 0.8, 1.4), BAD);
          cross(720, 150, 13, pop(u, 1.5));
          note(500, 300, '동시에 쓰면 깨진다. 락·동기화·백업은 직접 만든다', fade(u, 1.8), { fill: BAD }); } }
      return; }
    if (k === 3 || k === 4) { // 돌려주는 것은 id 와 거리뿐
      const cols = [['id', 'I'], ['dist', 'D'], ['user_id', null], ['date', null], ['text', null]], x0 = 60, y0 = 60, cw = 120;
      cols.forEach(([n, f], i) => { const has = !!f, s = k === 3 ? clamp(E(u, 0.2, 1.4) * 5 - i) : 1;
        card(x0 + i * cw + cw / 2, y0, cw - 8, 40, { rx: 6, text: n, fs: 15, mono: true, stroke: has ? ACC : OFF, color: has ? ACC : OFF, fill: has ? ACCBG : PANEL, dash: has ? null : '5 4', op: s });
        for (let r = 0; r < 3; r++) mono(x0 + i * cw + cw / 2, y0 + 46 + r * 26, has ? (f === 'I' ? ['7178', '7688', '949'][r] : ['113.31', '113.54', '113.85'][r]) : '없음', { 'font-size': 14.5, 'text-anchor': 'middle', fill: has ? INK : OFF, opacity: s }); });
      if (k === 3) note(60, 210, '조건을 걸 칸이 아예 없다', fade(u, 1.8), { fill: BAD });
      if (k === 4) { snippet(60, 200, ['db.search(query_vec, k=10,', '  filter={"user_id": 42,', '          "date": {"$gt": "2024-01"}})'], { op: fade(u, 0.2) });
        cross(560, 250, 20, pop(u, 1.2)); note(600, 244, 'FAISS 로는', fade(u, 1.4)); note(600, 270, '이렇게 쓸 수 없다', fade(u, 1.4), { fill: BAD }); }
      return; }
    if (k === 5) { // top-1000 → 파이썬 필터
      tx(40, 40, 'FAISS top-1000', { 'font-size': 15, 'font-weight': 700 }); tx(40, 62, '(40칸만 그림)', { 'font-size': 13.5, fill: MUT });
      const rr = rng(7), pass = []; for (let i = 0; i < 40; i++) pass.push(rr() < 0.25);
      let kept = 0; const scan = Math.floor(E(u, 0.3, 2.3) * 40);
      for (let i = 0; i < 40; i++) { const x = 40 + (i % 20) * 44, y = 90 + Math.floor(i / 20) * 54, seen = i < scan, ok = pass[i] && kept < 10;
        if (seen && pass[i]) kept++;
        el('rect', { x, y, width: 38, height: 42, rx: 5, fill: !seen ? SOFT : pass[i] ? GOODBG : PANEL, stroke: !seen ? GRID : pass[i] ? GOOD : OFF, 'stroke-width': 1.8 });
        if (seen && !pass[i]) el('path', { d: `M${x + 10},${y + 12} L${x + 28},${y + 30} M${x + 28},${y + 12} L${x + 10},${y + 30}`, stroke: OFF, 'stroke-width': 2 }); }
      mono(40, 250, 'user_id == 42 통과: ' + Math.min(kept, 10) + ' / 10', { 'font-size': 17, 'font-weight': 800, fill: GOOD });
      note(40, 286, '조건에 안 맞는 대부분을 가져왔다가 버린다', fade(u, 1.6), { fill: WARN });
      note(40, 312, '통과가 10개 안 되면 더 크게 다시 검색한다', fade(u, 2.0), { fill: MUT }); return; }
    // k 6: 벡터 DB 서버
    const layers = [['REST API', INFO], ['메타데이터 · 필터', WARN], ['영속성 (디스크 · 복제)', GOOD], ['벡터 인덱스 (HNSW · IVF …)', ACC]];
    layers.forEach(([n, col], i) => { const s = pop(u, 0.2 + (3 - i) * 0.3); card(250, 90 + i * 66, 380, 52, { rx: 8, text: n, fs: 15.5, stroke: col, color: col, s }); });
    tx(250, 50, '벡터 DB 서버 = 인덱스 위에 세 층', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
    sub(250, 372, 'FAISS 가 주는 것은 맨 아래 층뿐', fade(u, 1.4), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
    [['Pinecone', '매니지드 SaaS'], ['Qdrant', 'Rust · 자체 HNSW'], ['Weaviate', 'GraphQL · 자체 HNSW'], ['Milvus', '분산 클러스터']].forEach(([a, b], i) => {
      const s = pop(u, 1.2 + i * 0.25); card(770, 90 + i * 66, 300, 52, { rx: 26, s }); tx(640, 96 + i * 66, a, { 'font-size': 16, 'font-weight': 800, opacity: s }); tx(745, 96 + i * 66, b, { 'font-size': 13.5, fill: MUT, opacity: s }); });
    void lim; }

  const quiz = [
    { q: 'FAISS를 설치한 뒤 다른 서비스에서 이 인덱스를 쓰려면 무엇이 문제인가?',
      o: ['포트 번호를 따로 열어야 한다', 'FAISS는 서버가 아니라 내 프로세스 안의 라이브러리라 REST로 부를 수 없다', 'GPU가 없으면 import가 안 된다'], a: 1,
      why: 'pip로 받는 Python 패키지라 같은 프로세스 안에서 함수로만 부른다. 다른 서비스가 쓰려면 API 서버를 직접 감싸야 한다.' },
    { q: 'IndexFlatL2(768)에 10,000개를 add했을 때 차지하는 메모리는 대략 얼마인가?',
      o: ['약 2.9 MB', '약 29.3 MB', '약 293 MB'], a: 1,
      why: '10,000 × 768 × 4 byte = 30,720,000 byte, 약 29.3 MB다. Flat은 벡터를 압축 없이 그대로 담는다.' },
    { q: 'index.search(q, 5)가 돌려주는 D와 I에 대한 설명으로 맞는 것은 무엇인가?',
      o: ['D는 L2 거리의 제곱, I는 add 순서로 매긴 id이고 원문은 들어 있지 않다', 'D는 코사인 유사도라 클수록 가깝다', 'I에 원문 문서와 메타데이터가 함께 담겨 온다'], a: 0,
      why: 'IndexFlatL2의 D는 제곱 L2 거리(113.31 ~ 114.44)이고 작을수록 가깝다. I는 id뿐이라 docs 매핑은 직접 들고 있어야 한다.' },
    { q: '16 GB RAM 서버에 768차원 float32 Flat 인덱스를 올릴 때, 처음으로 들어가지 않는 규모는 무엇인가?',
      o: ['100만 개 (2.86 GB)', '10만 개 (0.29 GB)', '1000만 개 (28.6 GB)'], a: 2,
      why: 'N × 768 × 4 byte로 계산하면 1000만 개가 28.6 GB라 16 GB를 넘는다. 이때부터 PQ 압축 같은 방법이 필요하다.' },
    { q: 'user_id가 42인 문서 중에서만 비슷한 것 10개를 찾고 싶다. FAISS만 쓸 때의 방법은 무엇인가?',
      o: ['search에 filter 인자를 넘긴다', 'write_index로 저장한 뒤 다시 읽는다', '넉넉히 top-1000을 받아 파이썬에서 user_id로 걸러 낸다'], a: 2,
      why: 'FAISS는 id와 거리만 알고 메타데이터를 모른다. 많이 가져와서 거르는 후처리뿐이고, 통과가 모자라면 다시 검색해야 한다.' },
  ];

  const summary = [
    'FAISS는 pip로 설치하는 라이브러리라 서버도 포트도 없고 내 프로세스 안에서만 돈다.',
    'IndexFlatL2는 학습 없이 벡터를 그대로 담고 검색할 때 전부와 거리를 잰다.',
    'search는 제곱 L2 거리 D와 id 배열 I만 돌려준다. 원문 매핑은 직접 들고 있어야 한다.',
    '메모리는 N × d × 4 byte라 768차원 1000만 개면 28.6 GB로 16 GB 서버를 넘는다.',
  ];
  const review = [
    { q: '서비스를 재배포할 때마다 검색 결과가 텅 비었다. 먼저 의심할 것은?',
      o: ['인덱스를 파일로 저장하지 않아 프로세스가 끝나며 벡터가 사라졌다', 'k 값을 너무 작게 줬다', 'float16으로 저장해서 값이 깨졌다'], a: 0,
      why: 'FAISS는 인메모리라 프로세스가 끝나면 ntotal이 0으로 돌아간다. write_index로 저장하고 시작할 때 read_index로 읽어야 한다.' },
    { q: '검색 결과 I가 [7178, 7688, 949…]로 나왔다. 사용자에게 문서 제목을 보여 주려면 무엇이 필요한가?',
      o: ['D 값을 코사인으로 바꾼다', 'add한 순서대로 문서를 담아 둔 별도 리스트나 DB', 'IndexFlatL2 대신 IndexFlatIP를 쓴다'], a: 1,
      why: 'FAISS는 벡터를 id로 바꿔 줄 뿐이다. id에서 원문·메타데이터로 가는 매핑은 사용자가 따로 관리한다.' },
    { q: '768차원 벡터 1000만 개를 16 GB 서버 한 대에서 검색해야 한다. 가장 먼저 검토할 것은?',
      o: ['IndexFlatL2를 그대로 쓰고 스왑을 켠다', 'k를 줄여 결과 크기를 줄인다', 'PQ 같은 압축 인덱스로 벡터당 바이트를 줄인다'], a: 2,
      why: 'Flat이면 28.6 GB라 메모리에 안 들어간다. 결과 크기가 아니라 저장하는 벡터 자체를 줄여야 한다.' },
  ];

  R.page({ title: 'FAISS 인덱스 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
