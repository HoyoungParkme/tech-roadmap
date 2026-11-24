/* V-1-1 FAISS vs Chroma vs pgvector 기능 비교 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 표의 칸·막대 값은 각 beat 의 matrix · bars 를 읽는다. 지연 값은 페이지 perf-bench.py 주석의 예시 벤치 값,
 * 비용은 cost.md 의 항목 값을 다시 더한 것(합계 $103 · $470 · TCO 는 계산으로 확인). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const COLX = [165, 480, 795];
  const NAMES = ['FAISS', 'Chroma', 'pgvector'], KEYS = ['faiss', 'chroma', 'pgvector'];
  const DBC = { faiss: WARN, chroma: ACC, pgvector: INFO };          // 그래프에서 DB 를 가르는 색
  const OKC = { full: GOOD, partial: WARN, no: BAD }, OKS = { full: '✓', partial: '△', no: '✕' };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const fmt$ = (v) => '$' + Math.round(v).toLocaleString('en-US');

  // 상태 칩: 색 동그라미 + 기호 + 글
  function okRow(x, y, ok, text, s, w) { if (s <= 0) return;
    el('rect', { x, y: y - 15, width: (w || 270) * E(s, 0, 0.5), height: 21, rx: 4, fill: ok === 'full' ? GOODBG : ok === 'partial' ? WARNBG : BADBG });
    el('circle', { cx: x + 11, cy: y - 4.5, r: 7, fill: OKC[ok], opacity: fade(s, 0.3, 0.3) });
    tx(x + 11, y, OKS[ok], { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(s, 0.3, 0.3) });
    tx(x + 24, y, text, { 'font-size': 13.5, 'font-weight': 600, opacity: fade(s, 0.4, 0.4) }); }
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op);
    el('path', { d: 'M-15,-20 H7 L15,-12 V20 H-15 Z', fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    el('path', { d: 'M7,-20 V-12 H15', fill: 'none', stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    if (name) tx(0, 38, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: o.stroke || INK }, g); return g; }

  // ---------- 1. 기능 매트릭스 ----------
  const ROWLBL = ['영속성', '메타 저장', '메타 필터', 'JOIN', '수평 확장', '동시성'];
  function anatomy(op) {
    COLX.forEach((cx, i) => { tx(cx, 30, NAMES[i], { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: op });
      tx(cx, 50, ['라이브러리', 'embedded DB', 'PostgreSQL 확장'][i], { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op }); });
    // FAISS: 내 Python 프로세스 안의 인덱스 (벡터 점들)
    el('rect', { x: 55, y: 62, width: 220, height: 88, rx: 10, fill: 'none', stroke: MUT, 'stroke-width': 1.8, 'stroke-dasharray': '6 5', opacity: op });
    tx(67, 80, 'Python 프로세스', { 'font-size': 13.5, fill: MUT, opacity: op });
    for (let r = 0; r < 3; r++) for (let q = 0; q < 9; q++) el('circle', { cx: 85 + q * 20, cy: 98 + r * 16, r: 4.5, fill: ACC, opacity: op * 0.75 });
    // Chroma: 앱 프로세스 + SQLite 파일
    el('rect', { x: 370, y: 62, width: 220, height: 88, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.8, opacity: op });
    tx(382, 80, '앱 프로세스', { 'font-size': 13.5, fill: MUT, opacity: op });
    card(438, 116, 110, 32, { rx: 7, text: 'chromadb', fs: 14, mono: true, op });
    fileIcon(540, 106, 'sqlite3', { op });
    // pgvector: DB 서버 + vector 확장
    dbIcon(745, 108, null, { s: 0.8, op });
    pill(855, 108, '+ vector', ACC, 1, { fs: 14, mono: true, op }); }
  function rowsUpTo(c) { const b = c.beat, p = c.prev; const n = b.matrix ? b.matrix.rows.length : 0, pn = p && p.matrix ? p.matrix.rows.length : 0;
    b.matrix.rows.forEach((row, ri) => { const s = ri < pn ? 1 : seg(c.u, 0.2 + (ri - pn) * 0.4, 0.9 + (ri - pn) * 0.4);
      KEYS.forEach((key, ci) => { const cell = row[key]; okRow(COLX[ci] - 140, 288 + ri * 23, cell.ok, ROWLBL[ri] + ' · ' + cell.v, s, 280); }); });
    return n; }
  function s1(t, c) { const { k, u } = c;
    anatomy(k === 0 ? fade(u, 0.1, 0.6) : 1);
    el('line', { x1: 20, y1: 268, x2: 940, y2: 268, stroke: GRID, 'stroke-width': 1.5 });
    rowsUpTo(c);
    if (k === 0) { const code = ['pip install faiss-cpu', 'PersistentClient(path=…)', 'CREATE EXTENSION vector;'];
      code.forEach((s, i) => { const f = E(u, 0.5 + i * 0.45, 1.2 + i * 0.45); mono(COLX[i], 190, s.slice(0, Math.round(s.length * f)), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }); });
      ['벡터와 id 만 안다', '메타데이터·필터 기본', 'SQL 전부와 함께 쓴다'].forEach((s, i) => sub(COLX[i], 222, s, fade(u, 1.9 + i * 0.15), { 'font-size': 14 }));
      sub(480, 300, '같은 층위가 아니다 · 아래에 비교 항목이 한 줄씩 쌓인다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 1) { // 영속성: 직접 저장 / 자동 SQLite / WAL
      grow(165, 150, 165, 196, E(u, 0.3, 1.0), WARN); fileIcon(165, 222, null, { stroke: WARN, s: pop(u, 1.0) }); mono(190, 216, 'index.faiss', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.1) });
      sub(165, 254, 'write_index() 를 직접 불러야 저장', fade(u, 1.4), { fill: WARN, 'font-weight': 700 });
      for (let i = 0; i < 4; i++) dot([[438, 132], [438, 170], [540, 170], [540, 136]], ((t * 0.7 + i / 4) % 1), ACC, 4.5);
      sub(490, 196, '쓰면 SQLite 가 알아서 저장', fade(u, 0.6), { fill: GOOD, 'font-weight': 700 });
      const wal = Math.floor(E(u, 0.3, 2.2) * 10); for (let i = 0; i < 10; i++) el('rect', { x: 712 + i * 17, y: 186, width: 14, height: 22, rx: 3, fill: i < wal ? INFO : SOFT, stroke: GRID });
      sub(795, 236, 'WAL 에 먼저 기록 · 트랜잭션 O', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 2) { // 메타데이터 필터: blog(파랑) / news(회색)
      const cat = [1, 0, 1, 1, 0, 0, 1, 0];
      COLX.forEach((cx, ci) => { cat.forEach((b, j) => { const x = cx - 105 + j * 30, y = 176, keep = ci === 0 || b === 1, dim = ci > 0 && b === 0 ? 1 - 0.8 * E(u, 1.3, 2.0) : 1;
        el('circle', { cx: x, cy: y, r: 9, fill: ci === 0 ? OFF : b ? INFO : OFF, opacity: (keep ? 1 : dim) * pop(u, 0.2 + j * 0.06) });
        if (ci === 0) mono(x, y + 26, String(40 + j), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) }); }); });
      sub(165, 236, 'id 만 안다 · 카테고리를 모른다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 }); cross(275, 176, 9, pop(u, 1.4));
      pill(480, 222, 'where={"category": "blog"}', ACC, pop(u, 0.9), { fs: 13.5, mono: true });
      pill(795, 222, "WHERE category='blog'", INFO, pop(u, 1.1), { fs: 13.5, mono: true }); return; }
    if (k === 3) { // JOIN: 앱에서 합성 vs 한 쿼리
      [0, 1].forEach((ci) => { const cx = COLX[ci]; card(cx - 70, 200, 76, 34, { rx: 7, text: '앱', fs: 14 }); card(cx + 70, 176, 96, 30, { rx: 6, text: ci ? 'Chroma' : 'FAISS', fs: 13.5 }); card(cx + 70, 224, 96, 30, { rx: 6, text: 'authors', fs: 13.5, mono: true });
        for (let i = 0; i < 3; i++) { const a = seg(u, 0.3 + i * 0.6, 0.85 + i * 0.6); dot(i % 2 ? [[cx - 32, 200], [cx + 22, 224]] : [[cx - 32, 200], [cx + 22, 176]], a < 0.5 ? a * 2 : 2 - a * 2, WARN, 5); }
        sub(cx, 256, '코드에서 왕복하며 합친다', fade(u, 1.6), { fill: WARN, 'font-weight': 700 }); });
      // pgvector: 두 표를 한 쿼리로
      const tb = (x, name, rows, op) => { card(x, 172, 110, 26, { rx: 5, text: name, fs: 13.5, mono: true, fill: INFOBG, stroke: INFO, op }); rows.forEach((r, i) => card(x, 198 + i * 24, 110, 24, { rx: 0, text: r, fs: 13.5, mono: true, sw: 1.2, stroke: GRID, op })); };
      tb(725, 'docs', ['a_id=7', 'a_id=3'], pop(u, 0.2)); tb(865, 'authors', ['id=3', 'id=7'], pop(u, 0.4));
      const j = E(u, 0.8, 1.6); if (j > 0) { el('path', { d: `M780,198 C800,198 790,222 ${lerp(780, 810, j)},222`, fill: 'none', stroke: INFO, 'stroke-width': 2.4 }); el('path', { d: `M780,222 C800,222 790,198 ${lerp(780, 810, j)},198`, fill: 'none', stroke: INFO, 'stroke-width': 2.4 }); }
      sub(795, 256, 'JOIN … ORDER BY embedding <=> $1', fade(u, 1.6), { fill: INFO, 'font-weight': 700, class: 'mono' }); return; }
    if (k === 4) { // 수평 확장·동시성
      [[178, '검색'], [200, '검색'], [222, '쓰기']].forEach(([y, s], i) => { const w = i === 2; grow(40, y, w ? 128 : 220, y, E(u, 0.2 + i * 0.2, 1.0 + i * 0.2), w ? BAD : GOOD, { plain: w });
        tx(40, y - 4, s, { 'font-size': 13.5, fill: w ? BAD : GOOD, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.2) }); });
      lock(145, 222, true, BAD, pop(u, 1.0)); sub(165, 254, '쓰기 잠금은 앱이 직접', fade(u, 1.3), { fill: WARN, 'font-weight': 700 });
      card(440, 200, 90, 50, { rx: 8, text: '노드 1', fs: 14, stroke: ACC }); card(560, 200, 90, 50, { rx: 8, text: '노드 2', fs: 14, stroke: OFF, color: OFF, dash: '5 4', op: fade(u, 0.5) }); cross(560, 200, 14, pop(u, 1.0));
      sub(490, 254, '단일 노드가 한계', fade(u, 1.2), { fill: WARN, 'font-weight': 700 });
      card(730, 200, 96, 44, { rx: 8, text: 'primary', fs: 14, mono: true, stroke: INFO, fill: INFOBG });
      [0, 1].forEach((i) => { const s = pop(u, 0.6 + i * 0.3); card(880, 180 + i * 42, 96, 34, { rx: 7, text: 'replica', fs: 13.5, mono: true, stroke: INFO, s }); grow(780, 200, 830, 180 + i * 42, E(u, 0.9 + i * 0.3, 1.4 + i * 0.3), INFO); });
      sub(795, 254, '읽기 복제 · Citus · MVCC', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 }); return; }
    // k5: 결론 — 칸 수 세기
    const b = c.beat.matrix.rows; KEYS.forEach((key, i) => { const n = b.filter((r) => r[key].ok === 'full').length, v = Math.round(E(u, 0.2, 1.4) * n);
      mono(COLX[i], 196, `✓ ${v} / 6`, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 2 ? GOOD : i === 0 ? BAD : WARN }); });
    banner(480, 240, '기능은 pgvector 가 앞선다 · FAISS 의 강점은 속도', pop(u, 1.5)); }

  // ---------- 2. 성능 (로그 축 꺾은선) ----------
  const XS = { '1만 행': 0, '100만 행': 1, '1억 행': 2 };
  function chart(op) { const x0 = 120, y0 = 60, w = 470, h = 290;
    const X = (i) => x0 + 70 + i * 165, Y = (ms) => y0 + h - ((Math.log10(ms) + 1) / 4) * h;   // 0.1 ~ 1000 ms
    el('line', { x1: x0, y1: y0 + h, x2: x0 + w, y2: y0 + h, stroke: MUT, 'stroke-width': 1.8, opacity: op }); el('line', { x1: x0, y1: y0, x2: x0, y2: y0 + h, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [0.1, 1, 10, 100, 1000].forEach((v) => { el('line', { x1: x0, y1: Y(v), x2: x0 + w, y2: Y(v), stroke: GRID, 'stroke-dasharray': '3 4', opacity: op }); mono(x0 - 8, Y(v) + 5, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); });
    Object.keys(XS).forEach((s, i) => tx(X(i), y0 + h + 24, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: op }));
    tx(x0 - 50, y0 - 18, 'top-10 지연 ms (로그 축)', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: op });
    tx(x0 + w, y0 + h + 48, '예시 벤치 값 · 768차원 · median 50회', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
    return { X, Y }; }
  function pts(beat) { const out = {}; if (!beat || !beat.bars) return out; beat.bars.scenarios.forEach((sc) => sc.values.forEach((v) => { (out[v.db] = out[v.db] || [])[XS[sc.label]] = v.ms; })); return out; }
  function s2(t, c) { const { k, u } = c;
    const ax = chart(k === 0 ? fade(u, 0.2, 0.8) : 1), P = pts(c.beat), Q = pts(c.prev);
    // 오른쪽: 조건과 질의 벡터
    if (k === 0) { [['차원', '768'], ['행 수', '1만 · 100만 · 1억'], ['반복', 'median 50회'], ['장비', 'A10G (FAISS 만 GPU)']].forEach(([a, b], i) => { const s = pop(u, 0.5 + i * 0.35);
        card(790, 90 + i * 64, 280, 50, { rx: 10, stroke: GRID, s }); tx(668, 96 + i * 64, a, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6 + i * 0.35) }); mono(912, 96 + i * 64, b, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.35) }); });
      return; }
    // 질의 벡터 q (768칸 중 앞 6칸)
    R.cells(660, 64, ['.12', '-.3', '.07', '.55', '-.1', '.9'], { w: 36, h: 30, gap: 3, fs: 13.5, style: () => ({ stroke: INFO, fill: INFOBG }) });
    mono(900, 85, '… 768', { 'font-size': 14, fill: INFO, 'font-weight': 700 }); tx(660, 52, 'q (같은 질의 벡터)', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    KEYS.forEach((key, i) => { const y = 150 + i * 46, on = P[key] && P[key][0] != null; card(720, y, 120, 34, { rx: 8, text: NAMES[i], fs: 14.5, stroke: on ? DBC[key] : GRID, color: on ? DBC[key] : MUT, sw: on ? 2.4 : 1.6 });
      if (k === 1) grow(760, 100, 720, y - 18, E(u, 0.3 + i * 0.3, 0.9 + i * 0.3), MUT); });
    if (k === 1) { mono(800, 310, 'DIM = 768', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.4) }); mono(800, 336, 'K = 10', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) });
      sub(800, 372, '같은 q · 같은 K 로 세 번 잰다', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 4) pill(800, 300, 'SET hnsw.ef_search = 100;', INFO, pop(u, 0.3), { fs: 13.5, mono: true });
    // 점과 선
    KEYS.forEach((key) => { const now = P[key] || [], was = Q[key] || [];
      const line = []; now.forEach((v, i) => { if (v != null) line.push([i, v]); });
      for (let i = 1; i < line.length; i++) { const isNew = was[line[i][0]] == null, f = isNew ? E(u, 0.3, 1.4) : 1; if (f <= 0) continue;
        const [a0, v0] = line[i - 1], [a1, v1] = line[i]; el('line', { x1: ax.X(a0), y1: ax.Y(v0), x2: lerp(ax.X(a0), ax.X(a1), f), y2: lerp(ax.Y(v0), ax.Y(v1), f), stroke: DBC[key], 'stroke-width': 2.6 }); }
      line.forEach(([i, v]) => { const isNew = was[i] == null, s = isNew ? pop(u, 1.2) : 1; if (s <= 0) return;
        el('circle', { cx: ax.X(i), cy: ax.Y(v), r: 6.5 * s, fill: DBC[key] });
        if (k < 7) mono(ax.X(i) + (i === 0 ? -11 : 11), ax.Y(v) + 5, String(v), { 'font-size': 13.5, 'font-weight': 700, fill: DBC[key], 'text-anchor': i === 0 ? 'end' : 'start', opacity: isNew ? fade(u, 1.4) : 1 }); });
      // 막 잰 DB: q 가 날아가서 돌아온다
      const fresh = now.findIndex((v, i) => v != null && was[i] == null);
      if (fresh === 0 && k >= 2 && k <= 4) { const i = KEYS.indexOf(key); fly(660, 80, 720, 150 + i * 46, seg(u, 0.1, 0.7), 'q', { fill: DBC[key] });
        mono(800, 300 + (k === 4 ? 40 : 0), v2s(now[0]) + ' ms', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: DBC[key], opacity: fade(u, 0.8) }); } });
    // 범례 (선 끝)
    if (k >= 5) KEYS.forEach((key, i) => { const v = (P[key] || [])[k >= 6 ? 2 : 1]; if (v == null) return; tx(ax.X(k >= 6 ? 2 : 1) + 56, ax.Y(v) + 5 + (key === 'faiss' ? 0 : 0), NAMES[i], { 'font-size': 14, 'font-weight': 800, fill: DBC[key], opacity: fade(u, 1.5) }); });
    if (k === 5) sub(800, 330, '100만 행: pgvector 가 Chroma 를 앞선다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k === 6) { el('line', { x1: ax.X(2) - 26, y1: ax.Y(8), x2: ax.X(2) - 26, y2: ax.Y(320), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: fade(u, 1.5) });
      mono(800, 330, '320 / 8 = 40배', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) }); }
    if (k === 7) { el('rect', { x: 121, y: ax.Y(5), width: 469, height: ax.Y(0.1) - ax.Y(5), fill: GOODBG, opacity: 0.6 * fade(u, 0.2) });
      tx(130, ax.Y(5) + 18, '5ms 미만: 사람이 차이를 못 느낀다', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) });
      banner(800, 330, '작을 땐 아무거나, 클수록 FAISS', pop(u, 1.2)); } }
  const v2s = (v) => (v < 10 ? String(v) : String(Math.round(v)));

  // ---------- 3. 운영: 백업·복구 타임라인 → 운영 도구 ----------
  const LX0 = 170, LX1 = 920, BK = 330, CR = 820;
  function lane(i, op) { const y = 120 + i * 92;
    tx(30, y + 5, NAMES[i], { 'font-size': 16, 'font-weight': 800, opacity: op });
    el('line', { x1: LX0, y1: y, x2: LX1, y2: y, stroke: GRID, 'stroke-width': 3, opacity: op });
    for (let x = LX0 + 20; x < CR; x += 38) el('circle', { cx: x, cy: y, r: 3.5, fill: MUT, opacity: op * 0.7 });   // 쓰기
    return y; }
  function crash(y, s) { const g = R.G(CR, y, s); el('path', { d: 'M4,-22 L-8,2 H2 L-4,22 L10,-4 H0 Z', fill: BAD }, g); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { tx(LX0, 46, '시간 →   ● 쓰기   ⚡ 장애', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      for (let i = 0; i <= k; i++) { const y = lane(i, 1), cur = i === k, s = (a) => (cur ? pop(u, a) : 1), f = (a) => (cur ? fade(u, a) : 1);
        el('line', { x1: BK, y1: y - 26, x2: BK, y2: y + 26, stroke: INFO, 'stroke-width': 2.4, opacity: f(0.2) });
        crash(y, s(1.0));
        if (i === 0) { pill(BK - 4, y - 36, 'index.faiss', WARN, s(0.3), { fs: 13.5, mono: true }); pill(BK + 120, y + 34, 'metadata.pkl', WARN, s(0.5), { fs: 13.5, mono: true });
          el('rect', { x: BK, y: y - 10, width: (CR - BK) * (cur ? E(u, 1.2, 2.0) : 1), height: 20, fill: BAD, opacity: 0.18 });
          tx(560, y + 5, '마지막 백업 뒤 변경분 전부 손실', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: f(1.8) });
          sub(BK + 60, y - 60, '두 파일 시점이 어긋나면 결과가 깨진다', f(0.8), { fill: WARN, 'font-weight': 700 }); }
        if (i === 1) { el('rect', { x: BK, y: y - 14, width: 100, height: 28, rx: 4, fill: OFF, opacity: 0.45 * f(0.2) }); tx(BK + 50, y - 22, '서버 정지 · rsync', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: MUT, opacity: f(0.4) });
          el('rect', { x: BK + 100, y: y - 10, width: (CR - BK - 100) * (cur ? E(u, 1.2, 2.0) : 1), height: 20, fill: BAD, opacity: 0.18 });
          tx(600, y + 34, '운영 중 복사는 파일 손상 위험', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: f(1.6) }); }
        if (i === 2) { pill(BK, y - 36, 'pg_basebackup', INFO, s(0.2), { fs: 13.5, mono: true });
          const wf = cur ? E(u, 0.4, 1.4) : 1, n = Math.floor(((CR - BK) / 24) * wf);
          for (let j = 0; j < n; j++) el('rect', { x: BK + 6 + j * 24, y: y + 12, width: 18, height: 12, rx: 2, fill: INFO, opacity: 0.6 });
          tx(BK + 6, y + 44, 'WAL 아카이빙 (끊김 없음)', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: f(0.8) });
          const rx = cur ? lerp(BK, CR - 20, E(u, 1.5, 2.4)) : CR - 20; el('path', { d: `M${rx},${y - 18} L${rx - 7},${y - 30} H${rx + 7} Z`, fill: GOOD, opacity: f(1.5) });
          tx(CR - 20, y - 36, '5분 전으로 복구', { 'font-size': 13.5, 'text-anchor': 'end', 'font-weight': 700, fill: GOOD, opacity: f(2.2) }); } }
      return; }
    // k3~5: 운영 도구 세 칸
    COLX.forEach((cx, i) => { tx(cx, 40, NAMES[i], { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 }); el('rect', { x: cx - 140, y: 58, width: 280, height: 290, rx: 12, fill: i === 0 ? 'none' : SOFT, stroke: i === 0 ? OFF : GRID, 'stroke-width': 1.8, 'stroke-dasharray': i === 0 ? '6 5' : null }); });
    if (k === 3) { const tools = [['직접 계측'], ['du -sh', 'heartbeat'], ['pg_stat_statements', 'pg_relation_size()', 'pg_database_size()', 'log_min_duration']];
      tools.forEach((ls, i) => ls.forEach((s, j) => { const sc = pop(u, 0.3 + j * 0.3 + i * 0.15); card(COLX[i], 96 + j * 50, 236, 38, { rx: 8, text: s, fs: 14, mono: true, s: sc, stroke: i === 2 ? INFO : i === 0 ? OFF : WARN, color: i === 0 ? MUT : INK, dash: i === 0 ? '5 4' : null }); }));
      const hs = fade(u, 1.8); el('rect', { x: 660, y: 74, width: 270, height: 44, rx: 9, fill: 'none', stroke: BAD, 'stroke-width': 2.4, opacity: hs }); tx(795, 376, '느린 벡터 쿼리가 바로 보인다', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO, opacity: hs });
      tx(165, 376, '슬로우 쿼리 로그 없음', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); return; }
    if (k === 4) { card(165, 140, 200, 54, { rx: 10, text: 'wrapper 를\n직접 만든다', fs: 14.5, stroke: OFF, color: MUT, dash: '5 4', s: pop(u, 0.3) });
      // Chroma heartbeat 맥박선
      const hb = E(u, 0.3, 1.6), pts2 = []; for (let x = 0; x <= 240 * hb; x += 4) { const p = (x % 60); pts2.push([360 + x, 150 - (p > 24 && p < 30 ? 34 : p >= 30 && p < 36 ? -18 : 0)]); }
      if (pts2.length > 1) el('polyline', { points: pts2.map((p) => p.join(',')).join(' '), fill: 'none', stroke: WARN, 'stroke-width': 2.4 });
      mono(480, 220, 'GET /api/v1/heartbeat', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(480, 250, '살아 있다/죽었다만 안다', fade(u, 1.5), { fill: WARN, 'font-weight': 700 });
      card(795, 110, 200, 36, { rx: 8, text: 'postgres_exporter', fs: 14, mono: true, stroke: INFO, s: pop(u, 0.4) });
      [['Prometheus', 742], ['Datadog', 852]].forEach(([s, x], i) => { grow(795, 130, x, 194, E(u, 0.9 + i * 0.2, 1.4 + i * 0.2), INFO); card(x, 214, 100, 34, { rx: 8, text: s, fs: 14, stroke: INFO, fill: INFOBG, s: pop(u, 1.3 + i * 0.2) }); });
      sub(795, 270, '표준 통합 대시보드·알림', fade(u, 1.8), { fill: GOOD, 'font-weight': 700 }); return; }
    // k5: 권한 — RLS 로 행 단위로 가린다
    [0, 1].forEach((i) => { card(COLX[i], 130, 200, 54, { rx: 10, text: '권한 모델 없음\n앱이 전부 책임', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 0.3 + i * 0.2) }); });
    const rows = [['acme', INFO], ['globex', WARN], ['acme', INFO], ['globex', WARN]];
    mono(795, 84, 'GRANT SELECT ON docs TO app;', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
    rows.forEach(([tn, col], j) => { const hide = tn === 'globex' ? 1 - 0.75 * E(u, 1.2, 2.0) : 1; card(795, 118 + j * 34, 220, 28, { rx: 5, text: 'tenant=' + tn, fs: 13.5, mono: true, stroke: col, op: hide * fade(u, 0.4 + j * 0.15) }); });
    sub(795, 270, 'Row-Level Security: acme 는 acme 행만', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 }); }

  // ---------- 4. 비용: 쌓이는 막대 ----------
  const PARTS = [[['g5.xlarge GPU', 610], ['EBS 200GB', 16], ['백업/전송', 20], ['WAF·NLB 등', 200]],
    [['t3.large', 60], ['EBS 100GB', 8], ['백업/전송', 10], ['ALB', 25]],
    [['RDS Multi-AZ', 420], ['gp3 200GB', 30], ['백업 7일', 20]]];
  const PEOPLE = [4500, 1200, 800];
  const sum = (a) => a.reduce((x, [, v]) => x + v, 0);
  function s4(t, c) { const { k, u } = c, bx = [150, 340, 530], base = 360, BW = 110;
    const maxNow = k >= 3 ? 5600 : 1000, maxPrev = k === 3 ? 1000 : maxNow, mx = k === 3 ? lerp(maxPrev, maxNow, E(u, 0.2, 1.2)) : maxNow, H = 280, sc = (v) => (v / mx) * H;
    el('line', { x1: 60, y1: base, x2: 620, y2: base, stroke: MUT, 'stroke-width': 1.8 });
    tx(60, 40, k >= 3 ? '월 비용 (인프라 + 인력, USD)' : '월 인프라 비용 (USD)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    NAMES.forEach((nm, i) => { if (k < 3 && i > k) return; tx(bx[i], base + 24, nm, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: DBC[KEYS[i]] });
      let y = base; const building = k === i; PARTS[i].forEach(([name, v], j) => { const g = building ? E(u, 0.2 + j * 0.4, 0.6 + j * 0.4) : 1, h = sc(v) * g; if (h <= 0) return;
        y -= h; el('rect', { x: bx[i] - BW / 2, y, width: BW, height: h, fill: DBC[KEYS[i]], opacity: 0.35 + 0.5 * (j === 0 ? 1 : 0.4), stroke: PANEL, 'stroke-width': 1.5 }); });
      if (k >= 3) { const g = k === 3 ? E(u, 1.0, 1.9) : 1, h = sc(PEOPLE[i]) * g; if (h > 0) { y -= h; el('rect', { x: bx[i] - BW / 2, y, width: BW, height: h, fill: OFF, opacity: 0.75, stroke: PANEL, 'stroke-width': 1.5 }); } }
      const tot = sum(PARTS[i]) + (k >= 3 ? PEOPLE[i] : 0), show = building ? fade(u, 1.9) : k === 3 ? fade(u, 1.9) : 1;
      if (k <= 3) mono(bx[i], y - 10, fmt$(tot), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: show });
      if (k >= 4) { const tco = tot * 36, v = k === 4 ? tco * E(u, 0.3, 1.6) : tco; mono(bx[i], y - 32, fmt$(v), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 2 ? GOOD : i === 0 ? BAD : INK });
        mono(bx[i], y - 10, fmt$(tot) + ' × 36', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); } });
    // 오른쪽: 지금 쌓는 항목 목록
    if (k <= 2) { tx(680, 70, NAMES[k] + ' 월 인프라', { 'font-size': 16, 'font-weight': 800, fill: DBC[KEYS[k]] });
      PARTS[k].forEach(([name, v], j) => { const op = fade(u, 0.3 + j * 0.4); tx(680, 110 + j * 32, name, { 'font-size': 14.5, opacity: op }); mono(930, 110 + j * 32, fmt$(v), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); });
      const yy = 110 + PARTS[k].length * 32; el('line', { x1: 680, y1: yy - 14, x2: 930, y2: yy - 14, stroke: GRID, opacity: fade(u, 1.8) });
      tx(680, yy + 10, '합계', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.9) }); mono(930, yy + 10, fmt$(sum(PARTS[k])), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      if (k === 0) sub(805, 330, 'GPU 가 610 / 846 = 72%', fade(u, 2.2), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 });
      if (k === 2) sub(805, 330, '이 표에는 아직 사람 비용이 없다', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700 }); }
    if (k === 3) { tx(680, 80, '월 인력 비용 (가정값)', { 'font-size': 15, 'font-weight': 800 }); el('rect', { x: 680, y: 92, width: 16, height: 12, fill: OFF });
      NAMES.forEach((nm, i) => { const op = fade(u, 1.0 + i * 0.2); tx(706, 126 + i * 32, nm, { 'font-size': 14.5, opacity: op, fill: DBC[KEYS[i]], 'font-weight': 700 }); mono(930, 126 + i * 32, fmt$(PEOPLE[i]), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); });
      banner(805, 300, '순위 역전 · FAISS 가 가장 비싸다', pop(u, 2.0)); }
    if (k === 4) { tx(680, 90, '3년 TCO', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); tx(680, 116, '(인프라 + 인력) × 36개월', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) });
      mono(680, 170, '45,720 vs 46,908', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) }); tx(680, 196, '차이 $1,188 · 사실상 동률', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) });
      mono(680, 250, '192,456', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); tx(680, 276, 'FAISS 는 약 4배', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 5) { [['p99 < 5ms + 1억 벡터', 'FAISS GPU', WARN], ['100만 미만 + PoC', 'Chroma', ACC], ['기존 PG + JOIN', 'pgvector', INFO]].forEach(([a, b, col], i) => { const s = pop(u, 0.3 + i * 0.4), y = 100 + i * 86;
        card(790, y, 290, 66, { rx: 10, stroke: col, sw: 2.2, s }); tx(660, y - 6, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); tx(660, y + 20, '→ ' + b, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.4) }); });
      sub(790, 372, '조건이 붙으면 비용 순위가 바뀐다', fade(u, 1.8), { 'font-size': 14.5, 'font-weight': 700 }); } }

  // ---------- 5. 시나리오 지도: 규모(로그) × 요구 ----------
  const SX = (n) => 110 + ((Math.log10(n) - 4) / 5) * 800;   // 1만 ~ 10억
  const SCEN = [
    { lo: 1e4, hi: 1e6, y: 84, name: 'PoC · Jupyter', db: 'FAISS', col: WARN, sla: 'SLA 없음 · 노트북' },
    { lo: 1e5, hi: 5e6, y: 140, name: '단일 앱 · 작은 SaaS', db: 'Chroma', col: ACC, sla: 'p99 < 100ms' },
    { lo: 1e6, hi: 1e8, y: 196, name: '엔터프라이즈 · SQL', db: 'pgvector', col: INFO, sla: 'p99 < 50ms · 99.99%' },
    { lo: 1e6, hi: 1e8, y: 252, name: '멀티테넌트 · RBAC', db: 'pgvector', col: INFO, sla: 'tenant_id + GRANT' },
    { lo: 1e8, hi: 1e9, y: 308, name: '1억 + 실시간', db: 'FAISS GPU / 전용', col: BAD, sla: 'p99 < 5ms' },
  ];
  const ORDER = [0, 1, 2, 3, 4];   // beat k 에 새로 붙는 행
  function s5(t, c) { const { k, u } = c;
    el('line', { x1: 110, y1: 360, x2: 910, y2: 360, stroke: MUT, 'stroke-width': 1.8 });
    [[1e4, '1만'], [1e5, '10만'], [1e6, '100만'], [1e7, '1000만'], [1e8, '1억'], [1e9, '10억']].forEach(([n, s]) => { el('line', { x1: SX(n), y1: 360, x2: SX(n), y2: 366, stroke: MUT }); el('line', { x1: SX(n), y1: 40, x2: SX(n), y2: 360, stroke: GRID, 'stroke-dasharray': '3 5' }); tx(SX(n), 384, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', class: 'mono' }); });
    tx(910, 408, '벡터 수 (로그 축)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
    const shown = Math.min(k + 1, 5);
    for (let i = 0; i < shown; i++) { const r = SCEN[ORDER[i]], cur = i === k, g = cur ? E(u, 0.2, 1.2) : 1, x0 = SX(r.lo), x1 = SX(r.hi);
      el('rect', { x: x0, y: r.y - 22, width: (x1 - x0) * g, height: 44, rx: 8, fill: r.col, opacity: k === 5 ? 0.22 : cur ? 0.3 : 0.16 });
      el('rect', { x: x0, y: r.y - 22, width: (x1 - x0) * g, height: 44, rx: 8, fill: 'none', stroke: r.col, 'stroke-width': cur || k === 5 ? 2.4 : 1.4 });
      const op = cur ? fade(u, 1.0) : 1, lx = r.lo >= 1e8 ? x0 - 10 : x1 + 10, anc = r.lo >= 1e8 ? 'end' : 'start';
      tx(lx, r.y - 3, r.name + ' → ' + r.db, { 'font-size': 14.5, 'font-weight': 800, fill: r.col, opacity: op, 'text-anchor': anc });
      tx(lx, r.y + 17, r.sla, { 'font-size': 13.5, fill: MUT, opacity: op, 'text-anchor': anc, class: 'mono' }); }
    if (k === 3) { const rows = [['acme', INFO], ['globex', WARN], ['initech', GOOD]]; rows.forEach(([tn, col], j) => { const s = pop(u, 1.2 + j * 0.2);
      card(195, 226 + j * 28, 150, 24, { rx: 4, text: 'tenant_id=' + tn, fs: 13.5, mono: true, stroke: col, s }); }); }
    if (k === 5) banner(480, 30, '정답은 도구가 아니라 규모 · 인프라 · SLA 에 있다', pop(u, 0.6)); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'FAISS로 "category가 blog인 문서만" 벡터 검색하려면 무엇이 필요한가?',
      o: ['where 인자를 넘기면 된다', '메타데이터 저장과 필터를 애플리케이션이 직접 만든다', 'SQL WHERE 절을 붙인다'], a: 1,
      why: 'FAISS는 벡터와 id만 아는 라이브러리다. 메타데이터는 별도 dict나 DB에 두고 걸러 내는 코드를 직접 짜야 한다.' },
    { q: '예시 벤치에서 1만 행일 때 세 도구의 지연은 어떻게 보는 것이 맞는가?',
      o: ['셋 다 5ms 미만이라 성능만으로 고를 이유가 없다', 'FAISS가 0.4ms로 가장 빠르니 무조건 FAISS를 쓴다', 'pgvector 3.8ms는 서비스에 쓸 수 없는 수준이다'], a: 0,
      why: '0.4 · 2.1 · 3.8ms는 모두 사람이 못 느끼는 차이다. 격차는 100만, 1억 행으로 커질 때 벌어진다.' },
    { q: '실수로 지운 데이터를 "5분 전 시점"으로 되돌릴 수 있는 것은?',
      o: ['FAISS 인덱스 파일 복사본', 'Chroma SQLite 폴더 rsync', 'pgvector의 pg_basebackup과 WAL 아카이빙'], a: 2,
      why: '베이스 백업 위에 WAL을 다시 적용하면 원하는 시점까지 복구된다(PITR). 파일 복사는 마지막 백업 시점으로만 돌아간다.' },
    { q: '인프라 비용만 보면 Chroma가 가장 싼데, 3년 TCO에서 pgvector가 더 낮게 나온 이유는?',
      o: ['RDS가 EC2보다 싸서', 'GPU를 쓰지 않아서', '기존 DBA를 쓰면 월 인력 비용이 $800으로 가장 낮아서'], a: 2,
      why: '인프라는 $103 대 $470이지만 인력은 $1,200 대 $800이다. 36개월을 곱하면 $46,908 대 $45,720으로 뒤집힌다.' },
    { q: '1억 벡터에서 p99 5ms를 요구받았다. 가장 현실적인 후보는?',
      o: ['FAISS GPU 또는 Pinecone·Milvus 같은 전용 솔루션', 'Chroma PersistentClient', 'pgvector 기본 설정'], a: 0,
      why: '예시 벤치에서 1억 행 FAISS-GPU는 8ms, pgvector는 95ms, Chroma는 320ms였다. 이 구간은 전용 인덱스가 맡는다.' },
  ];

  const summary = [
    'FAISS는 라이브러리, Chroma는 임베디드 DB, pgvector는 PostgreSQL 확장이라 기능의 층위부터 다르다.',
    '예시 벤치에서 1만 행은 셋 다 5ms 미만이고, 1억 행에서는 FAISS-GPU 8ms와 Chroma 320ms로 벌어진다.',
    '백업과 시점 복구, 모니터링, 권한 관리는 PostgreSQL 도구를 그대로 쓰는 pgvector가 가장 갖춰져 있다.',
    '3년 TCO는 인력 비용 때문에 pgvector $45,720, Chroma $46,908, FAISS $192,456 순이다.',
  ];
  const review = [
    { q: '사내 검색을 FAISS로 만들었더니 메타데이터 dict와 인덱스 파일이 자꾸 어긋난다. 먼저 검토할 것은?',
      o: ['nprobe를 키운다', '메타데이터와 벡터를 한곳에서 관리하는 Chroma나 pgvector로 옮긴다', 'GPU 인스턴스로 바꾼다'], a: 1,
      why: 'FAISS는 벡터 id만 저장해서 메타데이터와 백업 정합성을 앱이 맡는다. 둘을 함께 저장하는 도구로 옮기면 이 문제가 사라진다.' },
    { q: '이미 PostgreSQL을 운영하는 팀이 문서 300만 건을 벡터 검색하려 한다. 어떤 선택이 맞는가?',
      o: ['인프라가 가장 싼 Chroma 단일 노드', 'GPU가 있는 FAISS', 'pgvector로 기존 테이블에 벡터 컬럼을 붙인다'], a: 2,
      why: '100만 행 예시 벤치에서 pgvector는 6.5ms로 충분히 빠르고, JOIN과 백업, 권한을 기존 DB 그대로 쓴다. 인력 비용이 가장 낮은 이유도 여기에 있다.' },
    { q: 'Chroma 단일 노드로 PoC를 시작했는데 1년 안에 1억 벡터까지 늘 계획이다. 미리 해 둘 일은?',
      o: ['1억 행 전에 pgvector나 전용 솔루션으로 옮길 경로를 정해 둔다', '인프라가 가장 싸니 같은 노드를 그대로 키운다', 'SQLite 폴더를 더 자주 rsync 한다'], a: 0,
      why: 'Chroma는 단일 노드가 한계이고 예시 벤치에서 1억 행 지연이 320ms였다. 규모가 커질 계획이면 옮길 곳을 먼저 정해야 한다.' },
  ];

  R.page({ title: 'FAISS · Chroma · pgvector 비교', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
