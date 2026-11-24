/* V-2-1 벡터 DB 조합 패턴 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 지연 값(~1ms · ~50ms · 0.3ms · 3ms · ~10ms)은 페이지 코드 주석의 예시 값이다.
 * 계산으로 확인한 값: 캐시 키 sha1("갤럭시 폴드 후기")[:16] = 563c2b2d031925d6,
 *   샤드 merge(numpy, 10만 개 · 64차원 · seed 42: 샤드별 top-10 을 합쳐 다시 정렬한 결과 = 전체 top-10),
 *   샤드 4→5개로 바꿀 때 id mod 가 달라지는 비율 80%, federated min-max · 가중 합산 결과(예시 점수로 코드 그대로 실행). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, kvTable, dbIcon, server, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const qtri = (x, y, col, s) => { const g = R.G(x, y, s ?? 1); el('path', { d: 'M0,-10 L9,7 L-9,7 Z', fill: col || BAD }, g); };

  // ---------- 1. Hot / Cold ----------
  function grid100(u0, hotOp) { const x0 = 40, y0 = 62, cs = 27;
    tx(x0, 46, '1억 벡터 = 100칸 (한 칸 = 100만)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 100; i++) { const s = clamp(u0 * 100 - i), r = Math.floor(i / 10), q = i % 10; if (s <= 0) continue;
      el('rect', { x: x0 + q * (cs + 2), y: y0 + r * (cs + 2), width: cs, height: cs, rx: 3, fill: i === 0 ? WARN : INFO, opacity: i === 0 ? hotOp : 0.25 + 0.1 * s }); }
    if (u0 >= 1) { tx(x0, 370, 'Hot 1% (100만)', { 'font-size': 14, 'font-weight': 800, fill: WARN }); tx(x0 + 150, 370, 'Cold 99% (9,900만)', { 'font-size': 14, 'font-weight': 800, fill: INFO }); } }
  function gpuBox(x, y, o) { o = o || {}; card(x, y, 220, 110, { rx: 12, stroke: WARN, fill: WARNBG, sw: 2.4, s: o.s, op: o.op });
    tx(x, y - 22, 'Hot · FAISS GPU', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: o.op ?? 1 });
    if (o.sub) mono(x, y + 6, o.sub, { 'text-anchor': 'middle', 'font-size': 14, opacity: o.op ?? 1 });
    if (o.ms) mono(x, y + 32, o.ms, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: o.op ?? 1 }); }
  function coldBox(x, y, o) { o = o || {}; dbIcon(x, y - 6, null, { stroke: INFO, s: o.s, op: o.op });
    tx(x, y + 50, 'Cold · pgvector 디스크', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: o.op ?? 1 });
    if (o.sub) mono(x, y + 72, o.sub, { 'text-anchor': 'middle', 'font-size': 14, opacity: o.op ?? 1 });
    if (o.ms) mono(x, y + 94, o.ms, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: o.op ?? 1 }); }
  const GX = 520, GY = 130, CX = 800, CY = 130;
  function s1(t, c) { const { k, u } = c;
    grid100(k === 0 ? E(u, 0.1, 1.2) : 1, 1);
    if (k === 0) { const f = E(u, 1.4, 2.2); if (f > 0) { const x = lerp(54, GX, f), y = lerp(76, GY, f); el('rect', { x: x - 14, y: y - 14, width: 27, height: 27, rx: 3, fill: WARN }); }
      gpuBox(GX, GY, { op: fade(u, 1.4) }); coldBox(CX, CY, { op: fade(u, 1.6) });
      grow(GX + 110, GY + 20, CX - 50, CY + 20, E(u, 2.0, 2.5), MUT, { dash: '6 4' }); tx(675, GY + 60, '없으면 Cold 로', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 1) { [['dim', '768'], ['hot_capacity', '1,000,000'], ['cold_dsn', '"postgresql://..."']].forEach(([a, b], i) => { const s = pop(u, 0.2 + i * 0.4), y = 90 + i * 64;
        card(660, y, 470, 50, { rx: 10, stroke: i === 1 ? WARN : GRID, sw: i === 1 ? 2.4 : 1.6, s }); mono(440, y + 5, a, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.3 + i * 0.4) }); mono(880, y + 5, b, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.4) }); });
      el('rect', { x: 430, y: 300, width: 460, height: 26, rx: 6, fill: SOFT }); el('rect', { x: 430, y: 300, width: 460 * E(u, 1.4, 2.4), height: 26, rx: 6, fill: WARN, opacity: 0.7 });
      tx(430, 350, 'Hot 상한 = hot_capacity · 넘치면 LRU 로 밀어낸다', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    const bothOn = { op: 1 };
    if (k === 2) { gpuBox(GX, GY, { s: pop(u, 0.3), sub: 'IndexFlatIP · 1M vec' }); coldBox(CX, CY, { s: pop(u, 0.8), sub: '99M vec' });
      snippet(420, 300, ['self.hot = faiss.index_cpu_to_gpu(res, 0, cpu_idx)', 'self.cold = psycopg2.connect(cold_dsn)'], { fs: 13.5, op: fade(u, 1.3) }); return; }
    gpuBox(GX, GY, { sub: 'IndexFlatIP · 1M vec', ms: k >= 3 ? '~1ms' : null }); coldBox(CX, CY, { sub: '99M vec', ms: k >= 4 ? '~50ms' : null });
    if (k === 3) { qtri(420, 300, BAD, pop(u, 0.1)); mono(440, 306, 'query', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      dot([[420, 290], [GX, GY + 55]], seg(u, 0.3, 0.9), BAD, 7); mono(GX, 250, 'D[0][-1] = 0.83 ≥ 0.8 ✓', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) });
      dot([[GX, GY + 55], [600, 330]], seg(u, 1.4, 2.0), GOOD, 7); pill(680, 330, '바로 반환 ~1ms', GOOD, pop(u, 1.9), { fs: 14 });
      tx(420, 390, '0.83 은 예시 유사도 · 기준 min_sim = 0.8 (예시값)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { qtri(420, 300, BAD); dot([[420, 290], [GX, GY + 55]], seg(u, 0.1, 0.6), BAD, 7);
      mono(GX, 250, 'D[0][-1] = 0.61 < 0.8 ✕', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.6) });
      dot([[GX + 110, GY], [CX - 50, CY]], seg(u, 1.0, 1.6), BAD, 7); mono(CX, 290, 'ORDER BY embedding <=> q', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      pill(CX, 330, '폴백 ~50ms', WARN, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 5) { [['Hot', WARN, 0.3], ['Cold', INFO, 0.9]].forEach(([n, col, a], i) => { const y = 290 + i * 46; tx(420, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, a) });
        R.cells(480, y - 16, ['812', '7', '3301', '…'], { w: 62, h: 32, gap: 4, fs: 14, style: () => ({ stroke: col, op: fade(u, a + 0.2) }) }); });
      tx(760, 316, '같은 모양: id 리스트', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.5) }); tx(760, 342, '호출자는 어느 티어인지 몰라도 된다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) });
      tx(420, 390, '(id 값은 예시)', { 'font-size': 13.5, fill: MUT }); return; }
    // k6: 적중률 99% 가정의 지연 분포
    tx(420, 258, '적중률 99% 가정', { 'font-size': 15, 'font-weight': 800 });
    hbar(420, 276, 300, 99, 100, { col: WARN, text: '99% · ~1ms', u: E(u, 0.2, 1.0) }); hbar(420, 306, 300, 1, 100, { col: INFO, text: '1% · ~50ms', u: E(u, 0.5, 1.2) });
    mono(420, 362, '평균 0.99×1 + 0.01×50 = 1.49ms', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
    tx(420, 392, '코드 주석의 예시: p50 3ms · p99 50ms (꼬리는 Cold 가 정한다)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); }

  // ---------- 2. Redis 캐시 ----------
  const KEY = 'vsearch:563c2b2d031925d6:k10';
  function redis(x, y, rows, o) { kvTable(x, y, 420, rows, { title: o && o.title || 'Redis', kw: 236 }); }
  function s2(t, c) { const { k, u } = c;
    card(110, 90, 170, 44, { rx: 8, text: '"갤럭시 폴드 후기"', fs: 14.5 }); tx(110, 60, '검색 요청', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 });
    const BX = 830, BY = 290;
    const backend = (op, s) => { card(BX, BY, 190, 74, { rx: 10, text: 'Hot/Cold\nbackend_search', fs: 14.5, stroke: INFO, op, s }); };
    if (k === 0) { card(480, 90, 160, 50, { rx: 10, text: 'Redis', fs: 17, stroke: BAD, color: BAD, s: pop(u, 0.2) }); backend(1, pop(u, 0.5));
      grow(195, 90, 398, 90, E(u, 0.6, 1.1), MUT); grow(480, 116, 480, 180, E(u, 1.0, 1.4), GOOD); pill(480, 206, 'HIT → 바로 반환', GOOD, pop(u, 1.3), { fs: 14 });
      grow(560, 100, BX - 40, BY - 40, E(u, 1.5, 2.1), WARN); pill(700, 160, 'MISS → 검색 후 SET', WARN, pop(u, 1.9), { fs: 14 }); return; }
    if (k === 1) { backend(1); const f = E(u, 0.3, 1.4); el('rect', { x: BX - 110 - 40 * f, y: BY - 50 - 50 * f, width: 220 + 40 * f, height: 100 + 90 * f, rx: 14, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' });
      mono(BX - 140, BY - 84, 'CachedSearcher', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      tx(40, 300, '기존 Hot/Cold 코드는 그대로 두고', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); tx(40, 326, '바깥에서 감싸기만 한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); return; }
    if (k === 2) { card(480, 160, 180, 60, { rx: 10, text: 'redis.from_url(…)', fs: 14, mono: true, stroke: BAD, s: pop(u, 0.2) });
      clock(720, 160, 34, 1 - E(u, 0.8, 2.6) * 0.3, WARN, 'ttl_sec = 300');
      tx(480, 270, 'TTL 이 지나면 키가 사라진다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); tx(480, 296, '= 결과가 최대 300초까지 오래될 수 있다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { grow(195, 90, 300, 150, E(u, 0.2, 0.6), MUT); card(380, 170, 160, 44, { rx: 8, text: 'sha1(query)', fs: 14.5, mono: true, s: pop(u, 0.5) });
      const h = '563c2b2d031925d6', n = Math.round(E(u, 0.8, 1.8) * 16); mono(480, 176, '→ ' + h.slice(0, n), { 'font-size': 16, 'font-weight': 800, fill: BAD });
      tx(480, 210, '앞 16자', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
      card(480, 290, 400, 48, { rx: 10, text: KEY, fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 2.0) });
      tx(480, 350, 'k 가 다르면 :k5 처럼 다른 키', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 4) { redis(300, 150, [[KEY.slice(0, 22) + '…', '[812, 7, …]', { hot: true, ttl: '214s' }]], {}); backend(0.35);
      dot([[195, 90], [320, 200]], seg(u, 0.2, 0.7), BAD, 7); dot([[320, 200], [195, 110]], seg(u, 0.9, 1.4), GOOD, 7);
      pill(110, 170, '~0.3ms', GOOD, pop(u, 1.4), { fs: 15 }); tx(BX, BY + 64, '호출 0회', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) });
      tx(300, 260, '(TTL 남은 시간 · id 는 예시)', { 'font-size': 13.5, fill: MUT }); return; }
    if (k === 5) { const has = u > 2.0; redis(300, 150, has ? [[KEY.slice(0, 22) + '…', '[812, 7, …]', { hot: true, ttl: '300s' }]] : [['(키 없음)', '', { gone: true }]], {}); backend(1);
      dot([[195, 90], [320, 200]], seg(u, 0.1, 0.5), BAD, 7); pill(560, 120, 'MISS', WARN, pop(u, 0.5), { fs: 14 });
      dot([[560, 200], [BX - 90, BY]], seg(u, 0.7, 1.3), WARN, 7); dot([[BX - 90, BY - 20], [640, 210]], seg(u, 1.4, 2.0), INFO, 7);
      mono(560, 350, 'setex(key, 300, json.dumps(results))', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) }); return; }
    // k6: 두 번 호출
    tx(300, 160, '같은 질의를 두 번', { 'font-size': 16, 'font-weight': 800 });
    tx(300, 210, '1번째 (MISS)', { 'font-size': 15, 'font-weight': 700 }); hbar(420, 196, 380, 3, 3, { col: WARN, text: '3ms', h: 22, u: E(u, 0.2, 1.0) });
    tx(300, 256, '2번째 (HIT)', { 'font-size': 15, 'font-weight': 700 }); hbar(420, 242, 380, 0.3, 3, { col: GOOD, text: '0.3ms', h: 22, u: E(u, 0.8, 1.4) });
    banner(560, 330, '캐시 한 겹으로 10배 · 3 / 0.3 = 10', pop(u, 1.6)); }

  // ---------- 3. Multi-tenant ----------
  const TC = { acme: INFO, globex: WARN, initech: GOOD };
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { tx(40, 40, '필터만 (한 테이블)', { 'font-size': 16, 'font-weight': 800, fill: BAD });
      const rows = ['acme', 'globex', 'acme', 'initech', 'globex', 'acme'], leak = E(u, 1.3, 2.0);
      rows.forEach((tn, i) => { const mine = tn === 'acme'; card(170, 80 + i * 36, 220, 30, { rx: 4, text: 'tenant_id=' + tn, fs: 13.5, mono: true, stroke: TC[tn], op: mine ? 1 : lerp(0.3, 1, leak), fill: !mine && leak > 0.5 ? BADBG : PANEL }); });
      mono(40, 320, 'WHERE tenant_id = $1', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-decoration': u > 1.3 ? 'line-through' : null });
      tx(40, 350, '필터를 한 번만 빠뜨려도 다른 회사 행이 섞인다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      el('line', { x1: 470, y1: 30, x2: 470, y2: 380, stroke: GRID, 'stroke-width': 1.5 });
      tx(510, 40, '물리 격리 (칸 자체를 나눈다)', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5) });
      ['acme', 'globex', 'initech'].forEach((tn, i) => card(600 + (i % 2) * 200, 110 + Math.floor(i / 2) * 120, 170, 90, { rx: 10, text: tn, fs: 15, mono: true, stroke: TC[tn], sw: 2.4, s: pop(u, 0.7 + i * 0.2) }));
      return; }
    const chroma = k <= 3;
    if (chroma) { el('rect', { x: 60, y: 60, width: 840, height: 250, rx: 14, fill: SOFT, stroke: ACC, 'stroke-width': 2.2, opacity: k === 1 ? fade(u, 0.2) : 1 });
      mono(80, 86, 'chromadb.PersistentClient("./data")', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.4) : 1 });
      if (k === 1) { tx(480, 200, '클라이언트는 하나만 두고 공유한다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
      ['acme', 'globex', 'initech'].forEach((tn, i) => { const x = 200 + i * 280, s = k === 2 ? pop(u, 0.3 + i * 0.35) : 1, dim = k === 3 && tn !== 'acme' ? 0.35 : 1;
        card(x, 190, 220, 120, { rx: 10, stroke: TC[tn], sw: 2.4, s, op: dim }); mono(x, 160, 'docs_' + tn, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: TC[tn], opacity: dim * (k === 2 ? fade(u, 0.5 + i * 0.35) : 1) });
        for (let j = 0; j < 6; j++) el('circle', { cx: x - 60 + j * 24, cy: 210 + (j % 2) * 18, r: 6, fill: TC[tn], opacity: dim * 0.8 * (k === 2 ? fade(u, 0.7 + i * 0.35) : 1) }); });
      if (k === 2) tx(480, 350, 'f"docs_{tenant_id}" 이름 규칙 하나가 경계가 된다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      if (k === 3) { mono(200, 350, 'search("acme", …)', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' }); dot([[200, 335], [200, 252]], seg(u, 0.3, 1.0), INFO, 7);
        tx(620, 350, '다른 컬렉션으로 가는 길이 없다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.2) }); }
      return; }
    // k4~6: PostgreSQL schema
    dbIcon(110, 190, 'PostgreSQL', { stroke: INFO });
    ['acme', 'globex', 'initech'].forEach((tn, i) => { const y = 90 + i * 100, s = k === 4 ? pop(u, 0.3 + i * 0.3) : 1, on = k === 4 || tn === 'acme', op = on ? 1 : k === 5 ? 1 - 0.65 * E(u, 1.0, 1.6) : 0.35;
      el('rect', { x: 230, y: y - 38, width: 300, height: 80, rx: 10, fill: on && k >= 5 ? INFOBG : PANEL, stroke: TC[tn], 'stroke-width': 2.2, opacity: op * s });
      mono(244, y - 14, 'tenant_' + tn, { 'font-size': 14.5, 'font-weight': 800, fill: TC[tn], opacity: op * s }); mono(244, y + 12, '└ documents (embedding)', { 'font-size': 13.5, fill: MUT, opacity: op * s }); });
    if (k === 4) { tx(570, 120, '커넥션 하나', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.2) }); tx(570, 146, 'schema 를 바꿔 가며 격리', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 5) { snippet(560, 70, ['SET search_path TO tenant_acme'], { fs: 14, op: fade(u, 0.2) });
      tx(570, 160, '이후 documents 는 tenant_acme.documents', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(570, 220, 'tenant_id 를 SQL 문자열에 이어 붙이지 말고', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) });
      mono(570, 246, 'sql.Identifier(...) 로 감싼다', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    snippet(560, 70, ['SELECT id, content FROM documents', 'ORDER BY embedding <=> %s LIMIT %s'], { fs: 13.5, op: fade(u, 0.2) });
    tx(570, 156, 'WHERE 가 없어도 acme 행만 나온다', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
    card(700, 260, 280, 60, { rx: 10, text: 'tenant_id = 인증 토큰에서\n요청 본문 값을 믿지 않는다', fs: 14, stroke: WARN, s: pop(u, 1.6) }); }

  // ---------- 4. Sharding ----------
  const SX = [190, 390, 590, 790], SY = 300, SCOL = [INFO, ACC, WARN, GOOD];
  function shards(o) { o = o || {}; SX.forEach((x, i) => { const s = o.s ? o.s(i) : 1, hot = o.hot ? o.hot(i) : true;
      card(x, SY, 150, 84, { rx: 10, stroke: SCOL[i], sw: hot ? 2.4 : 1.4, fill: hot ? PANEL : SOFT, s, op: hot ? 1 : 0.55 }); mono(x, SY - 22, 'shard' + i, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: SCOL[i], opacity: s > 0 ? 1 : 0 }); }); }
  const SHTOP = [[0.5, 0.497, 0.446], [0.486, 0.468, 0.451], [0.494, 0.426, 0.424], [0.471, 0.448, 0.446]];   // numpy 실측: 샤드별 top-3 유사도
  const GTOP = [[0.5, 0], [0.497, 0], [0.494, 2], [0.486, 1], [0.471, 3], [0.468, 1], [0.451, 1], [0.448, 3], [0.446, 0], [0.446, 3]];   // 전체 top-10 (유사도, 샤드)
  function s4(t, c) { const { k, u } = c;
    card(490, 60, 180, 46, { rx: 10, text: 'ShardedVectorStore', fs: 14.5, mono: true, stroke: INK });
    if (k === 0) { shards({ s: (i) => pop(u, 0.2 + i * 0.1) });
      grow(450, 84, SX[1], SY - 46, E(u, 0.8, 1.3), ACC); pill(260, 170, '쓰기: 한 노드', ACC, pop(u, 1.2), { fs: 14 });
      SX.forEach((x, i) => grow(530, 84, x + 20, SY - 46, E(u, 1.6 + i * 0.1, 2.1 + i * 0.1), BAD)); pill(760, 170, '읽기: 모든 노드 → merge', BAD, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 1) { shards({ s: (i) => pop(u, 0.4 + i * 0.25) }); SX.forEach((x, i) => mono(x, SY + 62, 'postgresql://shard' + i, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6 + i * 0.25) }));
      mono(490, 160, 'self.n = len(shard_dsns) = 4', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 2) { shards(); for (let id = 0; id < 12; id++) { const s = id % 4, f = E(u, 0.2 + id * 0.15, 0.7 + id * 0.15); if (f <= 0) continue; const row = Math.floor(id / 4);
        card(lerp(490, SX[s] - 40 + row * 40, f), lerp(100, SY + 10, f), 34, 28, { rx: 5, text: String(id), fs: 13.5, mono: true, stroke: SCOL[s], fill: PANEL }); }
      mono(760, 160, 'doc_id % 4', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1) }); return; }
    if (k === 3) { shards({ hot: (i) => i === 2 || u < 0.8 }); mono(490, 150, '42 % 4 = 2', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.3) });
      fly(490, 170, SX[2], SY + 12, seg(u, 0.9, 1.7), 'INSERT id=42', { mono: true, fill: WARN, stay: true });
      tx(490, 400, '다른 세 샤드는 쓰기를 모른다 · 노드가 늘어도 쓰기 비용은 그대로', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 4) { shards({ hot: (i) => i === 2 }); dot([[490, 84], [SX[2], SY - 46]], seg(u, 0.2, 0.8), BAD, 7);
      SHTOP[2].forEach((v, j) => mono(SX[2], SY - 2 + j * 20, 'sim ' + v.toFixed(3), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9 + j * 0.2) }));
      tx(490, 170, 'shard2 의 top-k 와 유사도를 받는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    if (k === 5) { shards(); const T = [0.55, 0.7, 1.0, 0.62];
      SX.forEach((x, i) => { dot([[490, 84], [x, SY - 46]], seg(u, 0.2, 0.7), BAD, 6); const w = 120 * T[i] * E(u, 0.8, 1.8); el('rect', { x: x - 60, y: SY - 2, width: w, height: 16, rx: 4, fill: i === 2 ? BAD : OFF }); });
      tx(490, 170, 'asyncio.gather 로 동시에 · 끝나는 시점 = 가장 느린 샤드', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(490, 400, '막대 길이는 예시 · 코드 주석 기준 전체 ~10ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 6) { SX.forEach((x, i) => { tx(x, 150, 'shard' + i, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: SCOL[i] });
        SHTOP[i].forEach((v, j) => mono(x, 176 + j * 20, v.toFixed(3), { 'font-size': 13.5, 'text-anchor': 'middle', fill: SCOL[i], opacity: 1 - 0.6 * E(u, 0.9, 1.3) })); });
      const f = E(u, 0.9, 2.2); GTOP.forEach(([v, s], j) => { const op = clamp(f * 10 - j); if (op <= 0) return; const x = 100 + j * 80;
        card(x, 300, 70, 36, { rx: 6, text: v.toFixed(3), fs: 13.5, mono: true, stroke: SCOL[s], fill: PANEL, op }); mono(x, 336, String(j + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); });
      tx(480, 380, '합쳐서 다시 정렬한 top-10 = 전체를 한 번에 찾은 top-10 (numpy 실측 · 10만 개)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.2) }); return; }
    // k7: 샤드 수를 바꾸면
    tx(60, 150, 'id 0~19 · 4개 → 5개로 늘리면', { 'font-size': 15, 'font-weight': 800 });
    for (let id = 0; id < 20; id++) { const a = id % 4, b = id % 5, same = a === b, f = E(u, 0.4, 1.4); const x = 60 + id * 44;
      card(x + 17, 200, 38, 34, { rx: 5, text: String(id), fs: 13.5, mono: true, stroke: f > 0.5 ? (same ? GOOD : BAD) : GRID, fill: f > 0.5 && !same ? BADBG : PANEL });
      mono(x + 17, 240, String(a), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); mono(x + 17, 262, String(b), { 'font-size': 13.5, 'text-anchor': 'middle', fill: same ? GOOD : BAD, opacity: f }); }
    tx(40, 246, '%4', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); tx(40, 268, '%5', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    mono(480, 330, '20개 중 16개 = 80% 가 자리를 옮긴다', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
    tx(480, 364, '그래서 노드를 늘릴 때는 재분배 계획이 필요하다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }

  // ---------- 5. Federated ----------
  const BK = [['faiss', 0.5, WARN, [['d1', 0.92], ['d2', 0.88], ['d3', 0.81]]], ['pgv', 0.3, INFO, [['d2', 0.79], ['d4', 0.74], ['d1', 0.70]]], ['chroma', 0.2, ACC, [['d5', 0.61], ['d2', 0.55], ['d6', 0.50]]]];
  const NORM = { faiss: [1, 0.636, 0], pgv: [1, 0.444, 0], chroma: [1, 0.455, 0] };
  const MERGED = [['d2', 0.709, 'faiss'], ['d1', 0.5, 'faiss'], ['d5', 0.2, 'chroma'], ['d4', 0.133, 'pgv'], ['d3', 0, 'faiss'], ['d6', 0, 'chroma']];
  const ALT = [['d2', 0.655], ['d5', 0.5], ['d1', 0.2], ['d4', 0.133]];
  const BCX = [200, 480, 760];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { qtri(480, 50, BAD, pop(u, 0.1)); BK.forEach(([n, , col], i) => { grow(480, 64, BCX[i], 120, E(u, 0.3, 0.8), col); card(BCX[i], 146, 140, 46, { rx: 10, text: n, fs: 15, mono: true, stroke: col, s: pop(u, 0.6 + i * 0.1) }); });
      ['① 같은 질의를 모두에게', '② 점수를 0~1 로 맞춘다', '③ 가중치로 더해 top-k'].forEach((s, i) => tx(480, 240 + i * 40, s, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.1 + i * 0.4) })); return; }
    if (k === 1) { card(480, 170, 360, 170, { rx: 12, stroke: INK, s: pop(u, 0.2) }); mono(330, 112, '@dataclass FedResult', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) });
      [['doc_id', 'str', INK], ['score', 'float  # 0~1', INK], ['source', 'str    # 어느 DB', ACC]].forEach(([a, b, col], i) => { mono(330, 150 + i * 34, a + ': ' + b, { 'font-size': 15, fill: col, 'font-weight': i === 2 ? 800 : 500, opacity: fade(u, 0.6 + i * 0.3) }); });
      tx(480, 310, 'source 가 있어야 결과를 디버깅할 수 있다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { tx(260, 90, 'weights', { 'font-size': 15, 'font-weight': 800, class: 'mono' }); BK.forEach(([n, w, col], i) => { tx(260, 140 + i * 50, n, { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: col }); hbar(360, 126 + i * 50, 340, w, 0.5, { col, text: w.toFixed(1), h: 22, u: E(u, 0.3 + i * 0.3, 1.0 + i * 0.3) }); });
      mono(480, 320, '0.5 + 0.3 + 0.2 = 1.0', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 3 || k === 4) { BK.forEach(([n, , col, rows], i) => { const x = BCX[i];
        card(x, 80, 140, 40, { rx: 9, text: n, fs: 15, mono: true, stroke: col });
        rows.forEach(([d, v], j) => { const y = 140 + j * 44, nv = NORM[n][j], f = k === 3 ? E(u, 0.6 + j * 0.3, 1.4 + j * 0.3) : 1, vv = lerp(v, nv, f);
          mono(x - 50, y, d, { 'font-size': 15, 'font-weight': 700 }); mono(x + 60, y, vv.toFixed(3), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: f > 0.5 ? col : INK }); }); });
      if (k === 3) { tx(480, 310, '(s − min) / (max − min)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.2) });
        tx(480, 346, '각 목록의 1등은 1.0, 꼴찌는 0.0 이 된다 · 원점수 0.81 도 0', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) });
        tx(480, 390, '원점수는 예시 값 · 정규화는 코드를 그대로 실행한 결과', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
      else { qtri(480, 300, BAD); BK.forEach(([, , col], i) => dot([[480, 290], [BCX[i], 120]], seg(u, 0.3, 1.0), col, 6));
        tx(480, 350, 'gather 로 세 곳을 동시에 · 기다리는 시간 = 가장 느린 DB', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
      return; }
    if (k === 5) { tx(80, 70, 'd2 는 세 DB 모두에 나온다', { 'font-size': 16, 'font-weight': 800 });
      const parts = [['faiss', 0.5, 0.636, WARN], ['pgv', 0.3, 1, INFO], ['chroma', 0.2, 0.455, ACC]]; let x = 120;
      parts.forEach(([n, w, s, col], i) => { const v = w * s, f = E(u, 0.3 + i * 0.5, 0.9 + i * 0.5), wd = 600 * v * f;
        el('rect', { x, y: 110, width: wd, height: 40, fill: col, opacity: 0.8 }); mono(x + 4, 176 + i * 22, `${n}: ${w} × ${s.toFixed(3)} = ${v.toFixed(3)}`, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.5) }); x += 600 * v; });
      mono(120 + 600 * 0.709 + 10, 136, '= 0.709', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 2.0) });
      tx(80, 290, 'd1 은 faiss 1등이지만 pgv 에서 꼴찌(0) · 합 0.5 × 1.0 + 0.3 × 0 = 0.500', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { tx(240, 70, '최종 순위', { 'font-size': 16, 'font-weight': 800 }); MERGED.forEach(([d, s, src], i) => { const y = 100 + i * 44, col = { faiss: WARN, pgv: INFO, chroma: ACC }[src], op = fade(u, 0.2 + i * 0.25);
        mono(240, y + 16, String(i + 1), { 'font-size': 15, fill: MUT, opacity: op }); mono(270, y + 16, d, { 'font-size': 15, 'font-weight': 800, opacity: op });
        hbar(320, y + 3, 300, s, 0.709, { col, text: s.toFixed(3), h: 20, u: E(u, 0.3 + i * 0.25, 0.8 + i * 0.25) }); mono(740, y + 16, 'source=' + src, { 'font-size': 13.5, fill: col, opacity: op }); });
      return; }
    // k7: 가중치 = 정책
    tx(120, 80, 'faiss 0.5 · pgv 0.3 · chroma 0.2', { 'font-size': 15, 'font-weight': 800, class: 'mono' }); tx(560, 80, 'faiss 0.2 · pgv 0.3 · chroma 0.5', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.8) });
    MERGED.slice(0, 4).forEach(([d, s], i) => { mono(140, 130 + i * 40, `${i + 1}. ${d}  ${s.toFixed(3)}`, { 'font-size': 15, 'font-weight': d === 'd5' ? 800 : 500, fill: d === 'd5' ? ACC : INK }); });
    ALT.forEach(([d, s], i) => { mono(580, 130 + i * 40, `${i + 1}. ${d}  ${s.toFixed(3)}`, { 'font-size': 15, 'font-weight': d === 'd5' ? 800 : 500, fill: d === 'd5' ? ACC : INK, opacity: fade(u, 1.0 + i * 0.2) }); });
    banner(480, 340, '가중치를 바꾸면 d5 가 3등 → 2등 · 가중치가 곧 검색 정책', pop(u, 2.0)); }

  const quiz = [
    { q: 'Hot/Cold 패턴에서 Hot 티어에 두는 것은 무엇인가?',
      o: ['전체 1억 벡터의 복제본', '자주 검색되는 1%(100만 개) 벡터', '최근 1시간 동안 추가된 벡터만'], a: 1,
      why: '자주 쓰는 100만 개만 GPU 메모리에 올리고 나머지 9,900만 개는 pgvector 디스크에 둔다. 메모리 비용을 줄이면서 대부분의 질의를 ~1ms에 끝낸다.' },
    { q: '캐시 키를 vsearch:{sha1 앞 16자}:k{k}로 만든 이유 중 k를 넣은 까닭은?',
      o: ['같은 질의라도 k가 다르면 결과 개수가 달라서', 'sha1이 짧아서 충돌을 막으려고', 'TTL을 k초로 맞추려고'], a: 0,
      why: 'k=10 결과를 k=5 요청에 그대로 돌려주면 안 된다. k를 키에 넣으면 :k10과 :k5가 서로 다른 캐시가 된다.' },
    { q: 'tenant별 collection·schema로 물리 격리했을 때 얻는 것은?',
      o: ['tenant_id를 아무 값이나 받아도 안전해진다', '검색 속도가 tenant 수만큼 빨라진다', '검색 코드에서 필터를 빠뜨려도 다른 테넌트 데이터가 섞이지 않는다'], a: 2,
      why: '질의가 그 테넌트의 칸 안에서만 돈다. 다만 어떤 칸을 고를지는 tenant_id가 정하므로 그 값은 인증 정보에서 꺼내야 한다.' },
    { q: '4개 샤드에서 각각 top-10을 받아 합친 뒤 다시 정렬하면 어떻게 되나?',
      o: ['전체를 한 번에 정확히 검색한 top-10과 같다', '샤드 수만큼 결과가 부정확해진다', '각 샤드 1등만 남는다'], a: 0,
      why: '전체 top-10 중 어떤 샤드에 있는 것도 그 샤드의 top-10 안에 든다. numpy 실측에서도 합친 결과가 전체 top-10과 같았다.' },
    { q: 'min-max 정규화 뒤 가중 합산에서 d2가 1등이 된 이유는?',
      o: ['FAISS 원점수가 가장 높아서', '세 DB 결과에 모두 나와 점수가 더해져서', '가중치가 가장 큰 DB에서 왔기 때문에'], a: 1,
      why: 'd2는 0.5×0.636 + 0.3×1 + 0.2×0.455 = 0.709를 받았다. FAISS 1등 d1은 pgv에서 꼴찌라 0.500에 그쳤다.' },
  ];
  const summary = [
    '자주 찾는 1%만 GPU에 두고 나머지 99%는 pgvector 디스크에 둔다. 빗나간 질의만 ~50ms 폴백을 탄다.',
    '같은 질의는 Redis 캐시가 0.3ms에 답하고 TTL 300초가 결과 신선도의 상한이 된다.',
    '테넌트는 collection이나 schema로 물리적으로 나누고 tenant_id는 인증 정보에서 꺼낸다.',
    '샤딩은 쓰기를 한 노드로 보내고 읽기를 모든 노드에 보내 합치며, 노드 수를 바꾸면 재분배가 따른다.',
  ];
  const review = [
    { q: 'Hot/Cold 위에 캐시를 얹었는데 인기 검색어 결과가 5분 가까이 예전 그대로다. 먼저 볼 것은?',
      o: ['Redis TTL 300초 설정', 'Hot 티어의 hot_capacity', '샤드 개수'], a: 0,
      why: 'HIT면 백엔드를 아예 부르지 않으므로 TTL 동안 같은 결과가 나간다. 300초가 신선도의 상한이다.' },
    { q: '샤드를 4개에서 5개로 늘렸더니 많은 문서가 검색되지 않는다. 원인으로 가장 그럴듯한 것은?',
      o: ['merge 정렬 방향이 반대다', 'id mod N 규칙이 바뀌어 약 80%의 문서가 다른 샤드로 가야 하는데 옮기지 않았다', 'asyncio.gather가 한 샤드를 빼먹었다'], a: 1,
      why: 'id % 4와 id % 5가 같은 id는 20%뿐이다. 재분배 없이 규칙만 바꾸면 나머지는 엉뚱한 샤드를 찾는다.' },
    { q: 'federated 검색에 pgvector 결과를 <=> 거리 그대로 넣었더니 먼 문서가 위로 올라온다. 고칠 곳은?',
      o: ['가중치를 0.3에서 0.5로 올린다', 'min-max 대신 평균으로 나눈다', '거리를 1 - 거리 같은 유사도로 바꿔서 넘긴다'], a: 2,
      why: '정규화 코드는 큰 점수를 좋은 것으로 본다. 거리는 작을수록 가깝기 때문에 유사도로 뒤집어 넘겨야 한다.' },
  ];

  R.page({ title: '벡터 DB 조합 패턴', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
