/* II-2-3 FAISS 한계와 보완 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * FAISS 안의 벡터·hit 는 beat.faiss, 메타 행은 beat.metaDb, 영속성 단계는 beat.persist.steps, 필터 단계는 beat.filter 를 읽는다.
 * I = [[42, 23, 71]], D = [[118.97, 121.07, 125.36]] 와 pre-filter 결과 [[42, 71, -1]] 은 페이지 코드를 seed 17 로 실제 실행한 값(faiss-cpu 1.16.0). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const IDS = [17, 23, 42, 56, 71, 88];
  const META = { 17: ['Spark 입문', 'data'], 23: ['K8s 운영', 'infra'], 42: ['FAISS 정리', 'ai'], 56: ['Airflow', 'data'], 71: ['pgvector', 'ai'], 88: ['Redis cache', 'infra'] };
  const CATCOL = { ai: ACC, data: INFO, infra: WARN };
  const DIST = { 42: 118.97, 23: 121.07, 71: 125.36 };
  // 벡터 한 줄: id 꼬리표 + float 막대
  function vecSlot(x, y, id, o) { o = o || {}; const op = o.op ?? 1, hot = o.hot;
    card(x + 26, y + 15, 52, 30, { rx: 6, text: String(id), fs: 15, mono: true, fw: 800, stroke: hot ? BAD : INK, color: hot ? BAD : INK, fill: hot ? BADBG : PANEL, op });
    for (let i = 0; i < 12; i++) el('rect', { x: x + 62 + i * 13, y: y + 6, width: 11, height: 18, rx: 2, fill: hot ? BAD : INFO, opacity: (0.2 + 0.5 * (((id * 7 + i * 13) % 10) / 10)) * op }); }
  function faissBox(x, y, o) { o = o || {}; el('rect', { x, y, width: 260, height: 300, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    tx(x + 14, y + 24, o.title || 'IndexIDMap(IndexFlatL2(768))', { 'font-size': 14, 'font-weight': 800, fill: ACC, class: 'mono', opacity: o.op ?? 1 }); }
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('path', { d: 'M-28,-36 H14 L28,-22 V36 H-28 Z', fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g); el('path', { d: 'M14,-36 V-22 H28', fill: 'none', stroke: col, 'stroke-width': 2 }, g);
    tx(0, 58, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' }, g); return g; }

  // ---------- 1. FAISS 는 ID 만 안다 ----------
  function s1(t, c) { const { k, u } = c, vs = (c.beat.faiss && c.beat.faiss.vectors) || [];
    faissBox(40, 50);
    if (k === 0) { note(70, 200, '아직 벡터 0개', fade(u, 0.6), { fill: MUT }); note(360, 120, 'IndexIDMap 으로 감싸면', fade(u, 1.0)); note(360, 146, '벡터마다 내 정수 ID 를 붙인다', fade(u, 1.3), { fill: ACC }); return; }
    vs.forEach((v, i) => { const a = k === 1 ? E(u, 0.2 + i * 0.25, 0.8 + i * 0.25) : 1; if (a <= 0) return;
      vecSlot(lerp(300, 56, a), 88 + i * 40, v.id, { hot: v.hit && k >= 2, op: a }); });
    if (k === 1) { mono(360, 120, 'index.add_with_ids(vectors, ids)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) }); note(360, 160, 'ID 는 내가 정한다: 17 · 23 · 42 · 56 · 71 · 88', fade(u, 1.8)); return; }
    if (k === 2) { const qa = E(u, 0.2, 1.0); el('circle', { cx: lerp(560, 400, qa), cy: 180, r: 10, fill: BAD });
      mono(430, 186, 'q', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: qa }); mono(360, 120, 'D, I = index.search(q, k=3)', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      card(560, 260, 300, 50, { rx: 10, text: 'id=42 · dist=118.97', fs: 16, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.4) }); return; }
    if (k === 3) { mono(360, 130, 'I = [[42, 23, 71]]', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
      mono(360, 172, 'D = [[118.97, 121.07, 125.36]]', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.8) });
      note(360, 216, 'D 는 L2 거리의 제곱이라 숫자가 크다', fade(u, 1.5), { fill: MUT }); note(360, 242, '돌아오는 것은 이 두 배열이 전부', fade(u, 1.9)); return; }
    // k 4: 메타 질문
    card(600, 110, 220, 52, { rx: 26, text: 'ID 42 는 무슨 문서?', fs: 16, stroke: BAD, color: BAD, s: pop(u, 0.2) });
    ['title', 'category', '작성일'].forEach((n, i) => { const y = 190 + i * 52, s = pop(u, 0.7 + i * 0.3); card(600, y, 220, 40, { rx: 8, text: n + '  ?', fs: 15, stroke: OFF, color: MUT, dash: '5 4', s }); cross(730, y, 10, s); });
    note(480, 380, 'FAISS 는 모른다 → 메타는 다른 저장소에', fade(u, 1.9), { fill: BAD }); }

  // ---------- 2. SQLite 로 ID → 메타 ----------
  function table(x, y, rows, o) { o = o || {}; const cols = [['id', 46], ['title', 150], ['category', 96]], W = 292;
    el('rect', { x, y, width: W, height: 34 + 34 * 6, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    let cx = x; cols.forEach(([n, w]) => { tx(cx + 10, y + 22, n, { 'font-size': 14, 'font-weight': 800, fill: MUT, class: 'mono' }); cx += w; });
    el('line', { x1: x, y1: y + 34, x2: x + W, y2: y + 34, stroke: INK, 'stroke-width': 1.5 });
    rows.forEach((r, i) => { const yy = y + 34 + i * 34, op = o.op ? o.op(i) : 1; if (op <= 0) return;
      if (r.hit) el('rect', { x: x + 3, y: yy + 3, width: W - 6, height: 28, rx: 5, fill: ACCBG, opacity: op });
      mono(x + 10, yy + 22, String(r.id), { 'font-size': 14.5, 'font-weight': 700, opacity: op });
      tx(x + 56, yy + 22, r.title, { 'font-size': 14.5, opacity: op });
      mono(x + 206, yy + 22, r.category, { 'font-size': 14, 'font-weight': 700, fill: CATCOL[r.category] || INK, opacity: op }); }); }
  function s2(t, c) { const { k, u } = c, vs = (c.beat.faiss && c.beat.faiss.vectors) || [], rows = (c.beat.metaDb && c.beat.metaDb.rows) || [];
    faissBox(30, 50, { title: 'FAISS (벡터 + id)' });
    vs.forEach((v, i) => vecSlot(46, 88 + i * 40, v.id, { hot: v.hit && k >= 3 }));
    const TX = 620, TY = 50;
    tx(TX, TY - 12, 'SQLite  metadata.db · docs', { 'font-size': 14.5, 'font-weight': 800, fill: INFO });
    const rowsShown = k === 2 ? rows.map((r, i) => r) : rows;
    table(TX, TY, rowsShown, { op: (i) => (k === 2 ? fade(u, 0.3 + i * 0.25) : 1) });
    if (k === 0) { note(330, 140, 'id INTEGER PRIMARY KEY', fade(u, 0.5), { class: 'mono' }); note(330, 168, 'FAISS 와 같은 정수 ID', fade(u, 1.0), { fill: ACC }); return; }
    if (k === 1) { const a = E(u, 0.3, 1.4); fly(470, 330, 200, 162, a, 'add_with_ids(42)', { mono: true });
      note(330, 380, 'insert_doc: 먼저 FAISS 에 같은 doc_id 로', fade(u, 1.6)); return; }
    if (k === 2) { const a = E(u, 0.3, 1.4); fly(470, 330, 760, 160, a, 'INSERT … (42, …)', { mono: true, fill: INFO });
      note(330, 380, '두 저장소를 맞추는 일은 내 코드 몫', fade(u, 1.8), { fill: WARN }); return; }
    if (k === 3) { mono(330, 380, 'D, I = index.search(q, k=3)  →  [[42, 23, 71]]', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) }); return; }
    // k 4: id 로 잇기
    const yOf = (id) => IDS.indexOf(id);
    [42, 23, 71].forEach((id, i) => { const a = E(u, 0.2 + i * 0.3, 0.9 + i * 0.3), y1 = 88 + yOf(id) * 40 + 15, y2 = TY + 34 + yOf(id) * 34 + 17;
      grow(100, y1, TX - 4, y2, a, ACC, { sw: 2.4 }); });
    mono(330, 380, 'WHERE id IN (42, 23, 71)', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
    note(330, 408, '돌아오는 순서는 id 순 → 거리 순서는 I 로 다시 맞춘다', fade(u, 1.8), { fill: MUT, 'font-size': 14 }); }

  // ---------- 3. 영속성 ----------
  function ram(x, y, n, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: 260, height: 150, rx: 10, fill: o.empty ? PANEL : ACCBG, stroke: o.empty ? OFF : ACC, 'stroke-width': 2.5, 'stroke-dasharray': o.empty ? '6 5' : null });
    tx(x + 14, y + 26, '메모리 (프로세스)', { 'font-size': 14.5, 'font-weight': 800, fill: o.empty ? MUT : ACC });
    for (let i = 0; i < n; i++) el('rect', { x: x + 16 + (i % 7) * 34, y: y + 50 + Math.floor(i / 7) * 30, width: 28, height: 22, rx: 4, fill: i >= 6 ? WARN : ACC, opacity: 0.6 * op });
    mono(x + 246, y + 140, 'ntotal = ' + n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: o.empty ? MUT : INK }); }
  function s3(t, c) { const { k, u } = c, steps = (c.beat.persist && c.beat.persist.steps) || [];
    // 아래: 단계 띠 (페이지 데이터)
    steps.forEach((st, i) => { const fresh = i === steps.length - 1, s = fresh ? pop(u, 0.2) : 1, col = st.kind === 'add' ? WARN : st.kind === 'rebuild' ? BAD : st.kind === 'restart' ? MUT : ACC;
      card(90 + i * 156, 370, 146, 52, { rx: 8, stroke: col, s }); tx(90 + i * 156, 366, st.label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: col, opacity: s });
      tx(90 + i * 156, 386, st.detail.replace(/[✓⚠]/g, '').trim(), { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); });
    // 위: 메모리 ↔ 디스크
    zone(560, 40, 360, 270, '디스크', { fill: SOFT, stroke: GRID });
    const saved = k >= 1, n = k === 4 ? 7 : 6;
    if (k === 2) ram(60, 70, 0, { empty: true }); else ram(60, 70, k === 4 ? (u > 0.6 ? 7 : 6) : n, { op: k === 3 ? E(u, 0.6, 1.6) : 1 });
    if (saved) { fileIcon(660, 140, 'my_index.faiss', { col: ACC, s: k === 1 ? pop(u, 0.5) : 1 }); fileIcon(820, 140, 'chunks.pkl', { col: WARN, s: k === 1 ? pop(u, 0.9) : 1 });
      mono(660, 250, 'ntotal 6', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: k === 4 && u > 1.0 ? BAD : INK }); }
    if (k === 0) { mono(60, 270, 'INDEX_PATH  = "my_index.faiss"', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(60, 296, 'CHUNKS_PATH = "chunks.pkl"', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) });
      note(600, 180, '아직 아무것도 없다', fade(u, 1.0), { fill: MUT }); return; }
    if (k === 1) { for (let i = 0; i < 4; i++) { const a = seg(u, 0.2 + i * 0.2, 0.8 + i * 0.2); if (a > 0 && a < 1) dot([[320, 140], [630, 140]], a, ACC, 6); }
      note(60, 270, '인덱스와 원본 청크는 늘 짝으로 저장', fade(u, 1.4)); return; }
    if (k === 2) { cross(190, 145, 22, pop(u, 0.3)); mono(60, 270, 'os.path.exists(INDEX_PATH)?', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) });
      note(60, 298, '파일이 없으면 None → 새로 만든다', fade(u, 1.4), { fill: MUT }); return; }
    if (k === 3) { for (let i = 0; i < 4; i++) { const a = seg(u, 0.1 + i * 0.15, 0.7 + i * 0.15); if (a > 0 && a < 1) dot([[630, 140], [320, 140]], a, ACC, 6); }
      mono(60, 270, 'faiss.read_index(…) · pickle.load(…)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC }); check(300, 100, 12, pop(u, 1.6)); return; }
    if (k === 4) { mono(60, 270, 'index.add_with_ids(new_vec, new_ids)', { 'font-size': 14.5, 'font-weight': 700, fill: WARN });
      note(60, 298, '메모리는 7개, 파일은 여전히 6개', fade(u, 1.0), { fill: BAD });
      note(600, 290, 'IVF·PQ 는 옛 중심에 계속 쌓여 균형이 깨진다', fade(u, 1.8), { fill: WARN, 'font-size': 13.5 }); return; }
    // k 5: 야간 리빌드
    const cx = 380, cy = 180; el('circle', { cx, cy, r: 46, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    const a = -Math.PI / 2 + E(u, 0.2, 1.6) * Math.PI * 2 * (3 / 12); el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * 34, y2: cy + Math.sin(a) * 34, stroke: BAD, 'stroke-width': 3 });
    mono(cx, cy + 70, 'cron 03:00', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
    note(60, 270, '매일 밤 전체 재학습 + write_index', fade(u, 1.2), { fill: BAD }); note(60, 296, '라이브 add 가 필요하면 Chroma · pgvector', fade(u, 1.8), { fill: MUT, 'font-size': 14 }); }

  // ---------- 4. 필터 ----------
  function s4(t, c) { const { k, u } = c, f = c.beat.filter || {}, pre = (f.pre && f.pre.steps) || [], post = (f.post && f.post.steps) || [];
    tx(40, 34, '원하는 것: category = "ai" 중에서 가장 비슷한 top-3', { 'font-size': 16, 'font-weight': 800 });
    // 위 띠: pre-filter
    zone(30, 50, 900, 160, 'pre-filter — 먼저 거르고 그 안에서 검색', { fill: SOFT, stroke: GOOD, color: GOOD });
    IDS.forEach((id, i) => { const cat = META[id][1], keep = cat === 'ai', s = pre.length >= 1 ? 1 : 0, dim = s && !keep;
      card(90 + i * 62, 110, 52, 34, { rx: 6, text: String(id), fs: 14.5, mono: true, fw: 800, stroke: CATCOL[cat], color: CATCOL[cat], op: dim ? 0.25 : 1 }); });
    if (pre.length >= 1) mono(90, 168, 'SQLite → candidate_ids = [42, 71]', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: k === 0 ? fade(u, 0.8) : 1 });
    if (pre.length >= 2) { const s = k === 1 ? pop(u, 0.3) : 1; card(570, 110, 200, 44, { rx: 8, text: 'IDSelectorBatch', fs: 15, mono: true, stroke: GOOD, color: GOOD, s });
      if (k === 1) note(500, 180, '후보 집합을 search 에 같이 넘긴다', fade(u, 1.0)); }
    if (pre.length >= 3) { const r = [['42', GOOD], ['71', GOOD], ['-1', BAD]];
      r.forEach(([v, col], i) => card(720 + i * 62, 170, 54, 34, { rx: 6, text: v, fs: 15, mono: true, fw: 800, stroke: col, color: col, s: k === 2 ? pop(u, 0.3 + i * 0.3) : 1 }));
      if (k === 2) note(560, 176, 'I =', fade(u, 0.2), { class: 'mono' }); if (k === 2) sub(782, 202, '후보가 2개라 3번째는 -1', fade(u, 1.4), { 'font-size': 13.5 }); }
    if (k === 2) { return; }
    // 아래 띠: post-filter
    if (post.length >= 1 || k >= 3) {
      zone(30, 226, 900, 180, 'post-filter — 넉넉히 검색하고 거르기', { fill: SOFT, stroke: WARN, color: WARN, op: k === 3 ? fade(u, 0.2) : 1 });
      const cats = []; for (let i = 0; i < 50; i++) cats.push(i === 17 ? 'ai' : i % 3 === 0 ? 'data' : 'infra');   // 전체의 1~2% 만 ai 라고 가정한 그림
      const shown = k === 3 ? Math.floor(E(u, 0.3, 1.8) * 50) : 50, filt = post.length >= 2;
      for (let i = 0; i < shown; i++) { const x = 50 + (i % 25) * 34, y = 260 + Math.floor(i / 25) * 36, keep = cats[i] === 'ai', gone = filt && !keep;
        el('rect', { x, y, width: 28, height: 28, rx: 4, fill: keep ? ACC : CATCOL[cats[i]], opacity: gone ? 0.12 : 0.6 }); }
      mono(50, 350, 'search(q, k=50)', { 'font-size': 15, 'font-weight': 700, fill: WARN });
      if (filt) { mono(240, 350, '→ category="ai" 통과 1개', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: k === 4 ? fade(u, 1.2) : 1 });
        note(50, 390, 'ai 가 1% 인 데이터라면 50개를 가져와도 0~1개만 남는다', k === 4 ? fade(u, 1.8) : 1, { fill: BAD, 'font-size': 14.5 }); } }
    if (k === 4) { note(90, 200, '후보가 커지면 IDSelector 비용도 커진다', fade(u, 0.4), { fill: WARN, 'font-size': 14.5 }); }
    if (k === 5) { card(760, 330, 300, 120, { rx: 10, fill: PANEL, stroke: INK, s: pop(u, 0.3) });
      tx(630, 300, 'pre  = 정확, 후보 작을 때', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) });
      tx(630, 330, 'post = 단순, 결과 모자랄 수 있음', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) });
      tx(630, 360, 'top-k 손실 불가 → pre', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.2) }); } }

  // ---------- 5. 결론 ----------
  const LIMITS = ['메타데이터', '영속성', '필터', 'CRUD'];
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { // 왼쪽 FAISS, 오른쪽 통합 DB
      const L = [['100만 건 이상 + GPU', ACC], ['latency 가 최우선', ACC], ['메타·필터가 거의 없다', ACC], ['파이프라인에 라이브러리로', ACC]];
      const Rr = [['메타 필터가 일상적', INFO], ['추가·삭제가 라이브로', INFO], ['자동 영속성·백업·복제', INFO], ['인프라 코드를 줄이고 싶다', INFO]];
      tx(240, 50, 'FAISS 가 맞는 곳', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC });
      L.forEach(([s], i) => { const o = k === 0 ? pop(u, 0.2 + i * 0.3) : 1; card(240, 100 + i * 64, 380, 50, { rx: 10, text: s, fs: 15.5, stroke: ACC, s: o, op: k === 1 ? 0.45 : 1 }); });
      if (k === 1) { tx(720, 50, '통합 벡터 DB 가 맞는 곳', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: INFO });
        Rr.forEach(([s], i) => { const o = pop(u, 0.2 + i * 0.3); card(720, 100 + i * 64, 380, 50, { rx: 10, text: s, fs: 15.5, stroke: INFO, s: o }); });
        note(480, 390, '대다수 RAG 는 오른쪽에 가깝다', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); }
      return; }
    if (k === 2) { const P = [['Chroma', '파이썬 친화 · 메타 필터 내장', 'Part III'], ['pgvector', 'Postgres 확장 · SQL · 트랜잭션', 'Part IV'], ['Weaviate', '하이브리드 검색 · 멀티테넌시', ''], ['Milvus', '대규모 분산', ''], ['Qdrant', 'Rust · 메타 필터 강력', '']];
      P.forEach(([n, d, p], i) => { const o = pop(u, 0.2 + i * 0.25), y = 60 + i * 70; card(480, y + 10, 700, 56, { rx: 10, stroke: p ? ACC : GRID, sw: p ? 2.5 : 1.8, s: o });
        tx(150, y + 16, n, { 'font-size': 18, 'font-weight': 800, opacity: o }); tx(320, y + 16, d, { 'font-size': 15, fill: MUT, opacity: o }); if (p) mono(810, y + 16, p, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: o }); });
      return; }
    if (k === 3) { const P = [['FAISS + SQLite', '학습 · 프로토타입'], ['Chroma 하나로', '단일 컨테이너 RAG'], ['pgvector + Postgres', '기존 RDB 재활용'], ['FAISS(GPU) + pgvector', '고급 하이브리드']];
      P.forEach(([a, b], i) => { const x = 250 + (i % 2) * 460, y = 120 + Math.floor(i / 2) * 150, o = pop(u, 0.2 + i * 0.35);
        card(x, y, 400, 110, { rx: 12, stroke: i === 0 ? ACC : INFO, s: o }); tx(x, y - 6, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: o }); tx(x, y + 24, b, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: o }); });
      return; }
    // k 4: 한계 4종 → 통합 DB
    tx(240, 50, 'FAISS 로 직접 짜야 하는 것', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD });
    tx(720, 50, '통합 벡터 DB 에 이미 있는 것', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD });
    LIMITS.forEach((n, i) => { const y = 100 + i * 64, a = E(u, 0.3 + i * 0.3, 1.0 + i * 0.3);
      card(240, y, 300, 50, { rx: 10, text: n, fs: 16, stroke: BAD, color: BAD });
      card(lerp(240, 720, a), y, 300, 50, { rx: 10, text: n, fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, op: a });
      if (a >= 1) check(600, y, 11, 1); });
    tx(480, 390, '다음: Part III Chroma → Part IV pgvector', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'IndexIDMap에 add_with_ids로 6개를 넣고 검색했을 때 FAISS가 돌려주는 것은 무엇인가?',
      o: ['id 배열 I와 거리 배열 D', 'id와 title, category', '원본 벡터와 문서 본문'], a: 0,
      why: '실행하면 I = [[42, 23, 71]], D = [[118.97, 121.07, 125.36]]만 나온다. 42번이 무슨 문서인지는 FAISS가 모른다.' },
    { q: 'FAISS와 SQLite를 함께 쓸 때 두 저장소를 잇는 것은 무엇인가?',
      o: ['벡터 값 자체', 'SQLite가 자동으로 맞춰 주는 외래 키', '양쪽에 똑같이 쓰는 정수 ID'], a: 2,
      why: 'add_with_ids의 doc_id와 docs 테이블의 PRIMARY KEY를 같게 둔다. 둘을 맞추는 일은 애플리케이션 몫이다.' },
    { q: 'read_index로 복구한 뒤 add_with_ids로 새 벡터를 넣었다. 파일에는 어떻게 되는가?',
      o: ['자동으로 파일에도 추가된다', 'write_index를 다시 부르기 전까지 파일은 그대로다', '파일이 지워진다'], a: 1,
      why: '메모리는 7개, 파일은 6개로 어긋난다. 그래서 운영에서는 다시 쓰거나 야간 cron으로 전체 리빌드를 돈다.' },
    { q: 'pre-filter로 후보 {42, 71}만 넘기고 k=3을 요청하면 I는 어떻게 나오는가?',
      o: ['[[42, 71, -1]]', '[[42, 23, 71]]', '오류가 난다'], a: 0,
      why: 'IDSelectorBatch 안에서만 찾으니 후보가 2개뿐이다. 남는 자리는 -1로 채워진다. 실제로 실행해도 같다.' },
    { q: '메타 필터와 라이브 추가·삭제가 일상인 RAG 서비스에 더 맞는 선택은 무엇인가?',
      o: ['FAISS에 SQLite·cron·필터 코드를 직접 붙인다', 'GPU를 늘린다', 'Chroma나 pgvector 같은 통합 벡터 DB'], a: 2,
      why: '메타·영속·필터·CRUD 네 가지를 처음부터 한곳에서 준다. FAISS는 검색 속도가 절대적일 때 고른다.' },
  ];

  const summary = [
    'FAISS 검색 결과는 id와 거리뿐이라 title·category 같은 메타는 따로 보관해야 한다.',
    'SQLite에 같은 정수 ID로 메타를 두면 검색 뒤 IN 조회로 붙일 수 있고, 동기화는 내 코드 몫이다.',
    'write_index로 저장은 되지만 add는 파일에 반영되지 않아 다시 쓰거나 주기적으로 리빌드한다.',
    '필터는 pre-filter면 정확하지만 후보 비용이 들고, post-filter면 결과가 모자랄 수 있다.',
  ];
  const review = [
    { q: '새 문서를 추가했는데 서버를 재시작하자 그 문서가 검색되지 않는다. 먼저 의심할 것은?',
      o: ['nprobe가 너무 작다', 'add 뒤 write_index를 다시 부르지 않아 파일이 옛 상태다', 'SQLite의 id 타입이 틀렸다'], a: 1,
      why: 'FAISS는 메모리에서만 add된다. 재시작하면 read_index가 옛 파일을 읽으니 저장을 다시 해야 한다.' },
    { q: 'post-filter로 category="legal"인 문서를 찾는데 결과가 자주 비어 있다. legal은 전체의 1%다. 무엇을 바꿀까?',
      o: ['k=50을 k=5로 줄인다', 'SQLite 인덱스를 지운다', 'SQLite로 legal 후보 ID를 먼저 뽑아 IDSelector로 pre-filter한다'], a: 2,
      why: '드문 카테고리는 넉넉히 가져와도 거의 남지 않는다. 후보가 작으니 먼저 거르고 그 안에서 찾는 쪽이 맞다.' },
    { q: 'FAISS로 id [42, 23, 71]을 받고 SQLite IN 조회를 했더니 23번이 맨 앞에 왔다. 왜 그런가?',
      o: ['IN 조회는 거리 순서를 모르고 id 순으로 돌려주기 때문', 'FAISS 거리가 잘못 계산되어서', '23번이 가장 가까워서'], a: 0,
      why: '두 저장소를 잇는 것은 id뿐이라 순서 정보는 I 배열에만 있다. 결과는 I 순서대로 다시 정렬해야 한다.' },
  ];

  R.page({ title: 'FAISS 옆에 붙이는 것들', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
