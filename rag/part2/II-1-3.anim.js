/* II-1-3 메타데이터 보존과 활용 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 문서 카드 6장(제목 + metadata 칩). 장면마다 카드 상태가 바뀐다 (STEPS 의 docState: no-meta / filtered-in·out / cited / allowed·denied).
 * 필터 결과(6 → 3건), ACL 결과(허용 2 · 차단 4) 는 페이지의 DOCS 메타에 조건을 그대로 적용한 값이다. LLM 답변 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, G, card, mono, sub, lbl, pill, grow, dot, zone, cross, check, lock, dbIcon, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const DOCS = [
    { t: 'PostgreSQL 17 신기능', c: 'PostgreSQL 17은 증분 백업…', m: { source: 'pg17_release.pdf', page: 3, author: 'lee', tenant_id: 'tenantA', role: 'engineer' } },
    { t: 'React 19 업데이트 노트', c: 'React 19에서는 서버 컴포넌트…', m: { source: 'react19_notes.pdf', page: 12, author: 'park', tenant_id: 'tenantA', role: 'engineer' } },
    { t: '사내 인사규정 개정', c: '2024년 하반기 인사규정이…', m: { source: 'hr_policy_v3.pdf', page: 1, author: 'kim', tenant_id: 'tenantA', role: 'hr' } },
    { t: 'K8s 블루-그린 배포', c: 'Kubernetes 환경에서의…', m: { source: 'devops_manual.pdf', page: 8, author: 'choi', tenant_id: 'tenantA', role: 'engineer' } },
    { t: '연봉 테이블 2025', c: '2025년 직급별 연봉 테이블…', m: { source: 'hr_salary_2025.pdf', page: 1, author: 'kim', tenant_id: 'tenantA', role: 'hr' } },
    { t: '경쟁사 B 인사 보고서', c: '경쟁사 B의 인사 정책 분석…', m: { source: 'rival_hr.pdf', page: 5, author: 'kim', tenant_id: 'tenantB', role: 'hr' } },
  ];
  const POS = (i) => [20 + (i % 3) * 204, 30 + Math.floor(i / 3) * 168];
  const CW = 198, CH = 150;
  const STAMP = { 'no-meta': ['NO META', BAD], 'filtered-in': ['MATCH', GOOD], 'filtered-out': ['SKIP', MUT], cited: ['CITED', ACC], allowed: ['ALLOWED', GOOD], denied: ['DENIED', BAD] };
  // 카드 한 장. st = 상태, keys = 보일 meta 키, o.metaOp = meta 보이는 정도, o.drop = meta 가 떨어져 나간 정도
  function docCard(i, st, keys, o) { o = o || {}; const d = DOCS[i], [x, y] = POS(i), dim = st === 'filtered-out' || st === 'denied', g = G(0, 0, 1, o.op ?? (dim ? 0.45 : 1));
    const bc = STAMP[st] ? STAMP[st][1] : INK;
    el('rect', { x, y, width: CW, height: CH, rx: 8, fill: PANEL, stroke: st === 'visible' || !STAMP[st] ? GRID : bc, 'stroke-width': st === 'visible' ? 1.6 : 2.6 }, g);
    tx(x + 10, y + 22, d.t, { 'font-size': 14.5, 'font-weight': 800 }, g);
    tx(x + 10, y + 44, d.c, { 'font-size': 13.5, fill: MUT }, g);
    el('line', { x1: x + 8, y1: y + 56, x2: x + CW - 8, y2: y + 56, stroke: GRID, 'stroke-dasharray': '4 3' }, g);
    const mo = st === 'no-meta' ? 1 - (o.drop ?? 1) : o.metaOp ?? 1;
    keys.forEach((k, j) => { const yy = y + 76 + j * 20 + (st === 'no-meta' ? 40 * (o.drop ?? 1) : 0), hi = o.hi && o.hi.includes(k);
      if (mo <= 0.02) return;
      mono(x + 10, yy, `${k === 'tenant_id' ? 'tenant' : k === 'source' ? 'src' : k}:`, { 'font-size': 13.5, fill: MUT, opacity: mo }, g);
      mono(x + 10 + tw(k === 'tenant_id' ? 'tenant: ' : k === 'source' ? 'src: ' : k + ': ', 13.5), yy, String(d.m[k]), { 'font-size': 13.5, 'font-weight': 700, fill: hi ? ACC : INFO, opacity: mo }, g); });
    if (st === 'no-meta' && (o.drop ?? 1) > 0.6) { mono(x + 10, y + 82, 'metadata = {}', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: fade(o.u ?? 3, o.at ?? 0) }, g); }
    if (STAMP[st] && st !== 'no-meta') { const [s, col] = STAMP[st]; pill(x + CW - tw(s, 13.5) / 2 - 22, y + CH - 18, s, col, o.stampS ?? 1, { fs: 13.5, fill: PANEL }); }
    if (st === 'denied') lock(x + 24, y + CH - 20, true, BAD, o.stampS ?? 1); }
  // 모든 카드: docState 를 읽고, 앞 beat 와 다르면 u 에 맞춰 순서대로 바뀐다
  function cards(c, keysOf, o) { o = o || {}; const ds = c.beat.docState, pv = c.prev ? c.prev.docState : ds;
    ds.forEach((d, i) => { const changed = pv[i].state !== d.state, a = (o.at ?? 0.4) + i * 0.18, f = changed ? E(c.u, a, a + 0.3) : 1, st = f > 0.5 ? d.state : pv[i].state;
      const keys = keysOf ? keysOf(i) : (d.highlightKeys && d.highlightKeys.length ? d.highlightKeys : ['source', 'page', 'author']);
      docCard(i, st, keys, { hi: o.hi, stampS: changed ? pop(c.u, a + 0.15) : 1, drop: o.drop, u: c.u, at: o.dropAt, metaOp: o.metaOp }); }); }
  const KEYS3 = () => ['source', 'page', 'author'];
  const RX = 640; // 오른쪽 판 왼쪽 끝
  function rightPanel(title, o) { o = o || {}; el('rect', { x: RX, y: 30, width: 300, height: 336, rx: 10, fill: o.fill || SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    if (title) tx(RX + 14, 54, title, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 }); }

  // ---------- 1. 메타 누락 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { cards(c, KEYS3); rightPanel('준비');
      pill(RX + 150, 110, 'OpenAIEmbeddings', ACC, pop(u, 0.4), { mono: true, fs: 14.5 }); dbIcon(RX + 150, 230, 'Chroma', { s: pop(u, 0.8) });
      sub(RX + 150, 340, '카드 6장에는 아직 메타가 있다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 1) { cards(c, KEYS3, { drop: E(u, 0.4, 1.6), dropAt: 1.7 }); rightPanel('raw_texts = [...]');
      DOCS.forEach((d, i) => mono(RX + 14, 90 + i * 30, `"${d.c.slice(0, 15)}…"`, { 'font-size': 13.5, opacity: fade(u, 0.8 + i * 0.15) }));
      tx(RX + 14, 300, 'page_content만 남았다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { cards(c, KEYS3, { metaOp: 0 }); rightPanel('Chroma.from_texts(...)');
      dbIcon(RX + 150, 200, 'company_docs', { s: 1 });
      DOCS.forEach((_, i) => { const [x, y] = POS(i); dot([[x + CW / 2, y + 30], [RX + 150, 190]], E(u, 0.3 + i * 0.15, 1.1 + i * 0.15), MUT, 6); });
      mono(RX + 14, 310, '# metadatas= 빠짐', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      sub(RX + 150, 340, '벡터만 들어가고 출처는 없다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3) { cards(c, KEYS3, { metaOp: 0 }); rightPanel('similarity_search("연차 정책", k=3)');
      [0, 1, 2].forEach((j) => { const y = 96 + j * 76, s = pop(u, 0.4 + j * 0.3); card(RX + 150, y, 270, 60, { rx: 8, stroke: GRID, s });
        tx(RX + 28, y - 6, `결과 ${j + 1}  본문은 있다`, { 'font-size': 14, opacity: s }); mono(RX + 28, y + 18, 'metadata = {}', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: s }); });
      tx(RX + 150, 340, '어느 파일 몇 쪽인지 모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    cards(c, KEYS3, { metaOp: 0 }); rightPanel('막히는 일');
    ['출처 표기', '문서 필터', '중복 추적', '권한 제어'].forEach((s, i) => { const y = 100 + i * 64; lock(RX + 40, y, true, BAD, pop(u, 0.3 + i * 0.35)); tx(RX + 70, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); }); }

  // ---------- 2. 메타 첨부 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { cards(c, KEYS3, { metaOp: 0.25 }); rightPanel('from langchain_core.documents');
      el('rect', { x: RX + 30, y: 100, width: 240, height: 70, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.4) }); mono(RX + 46, 142, 'page_content', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      el('rect', { x: RX + 30, y: 180, width: 240, height: 70, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.9) }); mono(RX + 46, 222, 'metadata', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
      tx(RX + 150, 300, 'Document 하나에 같이 담는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { cards(c, KEYS3, { metaOp: 0.25 }); rightPanel('docs[2] 만들기');
      const f = E(u, 0.4, 1.3);
      el('rect', { x: RX + 20, y: lerp(80, 96, f), width: 260, height: 70, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 }); tx(RX + 32, lerp(80, 96, f) + 28, '2024년 하반기 인사규정이', { 'font-size': 14 }); tx(RX + 32, lerp(80, 96, f) + 50, '개정되었습니다. …', { 'font-size': 14 });
      el('rect', { x: RX + 20, y: lerp(240, 166, f), width: 260, height: 86, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
      [['source', 'hr_policy_v3.pdf'], ['page', '1'], ['author', 'kim']].forEach(([a, b], j) => mono(RX + 32, lerp(240, 166, f) + 24 + j * 22, `${a}: ${b}`, { 'font-size': 14, 'font-weight': 700, fill: INFO }));
      if (f > 0.98) check(RX + 150, 300, 12, pop(u, 1.4));
      tx(RX + 150, 340, '세 키만 챙겨도 충분하다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { cards(c, KEYS3, { metaOp: 1, hi: ['source', 'page', 'author'] }); rightPanel('docs = [Document(...), …]');
      DOCS.forEach((d, i) => { mono(RX + 14, 92 + i * 34, `Document(… ${d.m.source.slice(0, 12)}…)`, { 'font-size': 13.5, opacity: fade(u, 0.3 + i * 0.25) }); });
      tx(RX + 150, 330, '6건 모두 메타를 품었다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { cards(c, KEYS3); rightPanel('Chroma.from_documents(...)'); dbIcon(RX + 150, 170, 'company_docs', {});
      DOCS.forEach((_, i) => { const [x, y] = POS(i); dot([[x + CW / 2, y + 80], [RX + 150, 160]], E(u, 0.3 + i * 0.15, 1.1 + i * 0.15), INFO, 6); });
      [0, 1, 2].forEach((j) => pill(RX + 70 + j * 80, 270, ['source', 'page', 'author'][j], INFO, pop(u, 1.6 + j * 0.15), { mono: true, fs: 13.5 }));
      sub(RX + 150, 320, '벡터와 메타가 같이 저장된다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 4) { cards(c, KEYS3); rightPanel('hits = similarity_search(..., k=2)');
      card(RX + 150, 140, 270, 96, { rx: 8, stroke: INFO, s: pop(u, 0.4) });
      tx(RX + 28, 118, '2024년 하반기 인사규정…', { 'font-size': 14, opacity: fade(u, 0.6) }); mono(RX + 28, 146, '{"source": "hr_policy_v3.pdf",', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.9) }); mono(RX + 28, 168, ' "page": 1, "author": "kim"}', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) });
      el('rect', { x: POS(2)[0] - 4, y: POS(2)[1] - 4, width: CW + 8, height: CH + 8, rx: 10, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: fade(u, 0.3) });
      tx(RX + 150, 260, '메타가 통째로 따라온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) });
      sub(RX + 150, 290, '(예시 출력)', fade(u, 1.7), { 'font-size': 13.5 }); return; }
    cards(c, KEYS3); rightPanel('누가 메타를 채우나');
    [['PyPDFLoader', 'source · page 자동', GOOD], ['WebBaseLoader', 'source · title 자동', GOOD], ['직접 만든 로더', '직접 넣어야 한다', WARN]].forEach(([a, b, col], i) => { const y = 100 + i * 80, s = pop(u, 0.4 + i * 0.4);
      card(RX + 150, y, 270, 62, { rx: 8, stroke: col, s }); mono(RX + 28, y - 4, a, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); tx(RX + 28, y + 18, b, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: s }); }); }

  // ---------- 3. 메타 필터 ----------
  const AUTH = (i) => ['author'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { cards(c, AUTH); rightPanel('Chroma(collection_name="company_docs")'); dbIcon(RX + 150, 170, 'company_docs', { s: pop(u, 0.3) });
      mono(RX + 150, 290, '후보 6건', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    if (k === 1) { cards(c, AUTH); rightPanel('(A) 필터 없이');
      mono(RX + 14, 96, '"연차 정책 어떻게 바뀜?"', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      DOCS.forEach((_, i) => { const [x, y] = POS(i); el('rect', { x: x - 3, y: y - 3, width: CW + 6, height: CH + 6, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 0.5 + i * 0.12) }); });
      mono(RX + 150, 190, '후보 6건', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.2) });
      tx(RX + 150, 250, 'K8s·React 문서도 후보에 든다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(RX + 150, 276, '점수만으로 고르면 섞일 수 있다', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 2) { cards(c, AUTH, { hi: ['author'] }); rightPanel('(B) filter={"author": "kim"}');
      const f = E(u, 0.4, 1.8); el('path', { d: `M${RX + 50},90 H${RX + 250} L${RX + 175},170 V210 H${RX + 125} V170 Z`, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      mono(RX + 150, 124, 'author == "kim"', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
      const n = Math.round(lerp(6, 3, f)); mono(RX + 150, 270, `후보 ${n}건`, { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: n === 3 ? GOOD : INK });
      sub(RX + 150, 300, '6 → 3', fade(u, 1.9), { 'font-size': 15, class: 'mono', 'font-weight': 700 }); return; }
    if (k === 3) { cards(c, (i) => ['author', 'page'], { hi: ['author', 'page'] }); rightPanel('(C) $and 복합 조건');
      mono(RX + 14, 92, '{"$and": [', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(RX + 30, 116, '{"author": "kim"},', { 'font-size': 14, opacity: fade(u, 0.3) }); mono(RX + 30, 140, '{"page": {"$lte": 5}}]}', { 'font-size': 14, opacity: fade(u, 0.4) });
      [2, 4, 5].forEach((i, j) => { const y = 190 + j * 40, d = DOCS[i]; check(RX + 30, y - 5, 8, pop(u, 0.8 + j * 0.3)); check(RX + 54, y - 5, 8, pop(u, 0.9 + j * 0.3)); tx(RX + 74, y, `${['인사규정 개정', '연봉 테이블', '경쟁사 B 보고서'][j]}  p.${d.m.page}`, { 'font-size': 14, opacity: fade(u, 0.8 + j * 0.3) }); });
      sub(RX + 150, 340, 'kim 3건 모두 5쪽 이내라 그대로', fade(u, 2.0), { 'font-size': 14 }); return; }
    cards(c, AUTH); rightPanel('효과');
    [['검색 공간이 준다', '6 → 3건만 비교'], ['무관 문서가 빠진다', 'K8s·React는 후보 밖'], ['규칙을 검색에 쓴다', '"최근 6개월", "부서별"']].forEach(([a, b], i) => { const y = 100 + i * 80;
      check(RX + 30, y - 4, 9, pop(u, 0.3 + i * 0.4)); tx(RX + 50, y, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); sub(RX + 50, y + 24, b, fade(u, 0.4 + i * 0.4), { 'text-anchor': 'start', 'font-size': 14 }); }); }

  // ---------- 4. 인용 ----------
  const CTX = [['[#1] 2024년 하반기 인사규정이 개정…', '(hr_policy_v3.pdf p.1)'], ['[#2] 2025년 직급별 연봉 테이블이…', '(hr_salary_2025.pdf p.1)']];
  const SP = (i) => ['source', 'page'];
  function s4(t, c) { const { k, u } = c;
    const pick = [2, 4];
    if (k === 0) { cards(c, SP); rightPanel('hits (kim 필터, k=2)');
      pick.forEach((i, j) => { const [x, y] = POS(i); el('rect', { x: x - 4, y: y - 4, width: CW + 8, height: CH + 8, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.4 + j * 0.4) });
        mono(RX + 14, 100 + j * 50, `${j + 1}. ${DOCS[i].m.source} p.${DOCS[i].m.page}`, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6 + j * 0.4) }); });
      sub(RX + 150, 220, '(예시) 상위 2건', fade(u, 1.5), { 'font-size': 14 });
      sub(RX + 150, 250, '각 Document에 source·page가 실려 있다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 1) { cards(c, SP, { hi: ['source', 'page'] }); rightPanel('format_context(hits)', { fill: PANEL });
      CTX.forEach(([a, b], j) => { const y = 100 + j * 90; tx(RX + 14, y, a, { 'font-size': 13.5, opacity: fade(u, 0.4 + j * 0.7) }); mono(RX + 30, y + 24, b, { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8 + j * 0.7) });
        const [x, yy] = POS(pick[j]); dot([[x + CW / 2, yy + 80], [RX + 40, y + 20]], E(u, 0.5 + j * 0.7, 1.0 + j * 0.7), INFO, 6); });
      sub(RX + 150, 310, '본문 뒤에 (source p.page)', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { cards(c, SP); rightPanel('system 프롬프트', { fill: PANEL });
      ['다음 문서를 근거로 한국어로 답하세요.', '각 사실 뒤에 [#번호]를 표시하고,', '마지막 줄에 참고한 source/page', '목록을 출력합니다.'].forEach((s, j) => tx(RX + 14, 96 + j * 28, s, { 'font-size': 14, 'font-weight': j === 1 || j === 2 ? 700 : 400, fill: j === 1 || j === 2 ? ACC : INK, opacity: fade(u, 0.3 + j * 0.35) }));
      el('rect', { x: RX + 14, y: 230, width: 272, height: 70, rx: 8, fill: SOFT, stroke: GRID, opacity: fade(u, 1.7) });
      mono(RX + 26, 258, 'human: 질문: {q}', { 'font-size': 13.5, opacity: fade(u, 1.8) }); mono(RX + 26, 282, '근거 문서: {ctx}', { 'font-size': 13.5, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { cards(c, SP, { at: 1.0 }); rightPanel('chain = prompt | llm');
      [['질문', 100], ['근거 2건', 150]].forEach(([s, y], j) => { pill(RX + 80, y, s, INK, pop(u, 0.2 + j * 0.2), { fs: 14 }); dot([[RX + 130, y], [RX + 220, 210]], E(u, 0.4 + j * 0.2, 1.0 + j * 0.2), ACC, 6); });
      card(RX + 220, 210, 100, 50, { rx: 10, stroke: ACC, fill: ACCBG, text: 'LLM', fs: 16, color: ACC, s: pop(u, 0.3) });
      tx(RX + 150, 300, '근거로 쓰인 두 장이 CITED', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); return; }
    cards(c, SP); rightPanel('answer.content (출력 예시)', { fill: PANEL });
    ['2024년 하반기에 연차 산정 기준이', '변경되었습니다 [#1].'].forEach((s, j) => tx(RX + 14, 100 + j * 26, s, { 'font-size': 14.5, opacity: fade(u, 0.3 + j * 0.3) }));
    pill(RX + 210, 126, '[#1]', ACC, pop(u, 0.9), { mono: true, fs: 13.5 });
    tx(RX + 14, 196, '출처:', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.2) });
    ['- hr_policy_v3.pdf p.1', '- hr_salary_2025.pdf p.1'].forEach((s, j) => mono(RX + 14, 222 + j * 24, s, { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4 + j * 0.3) }));
    sub(RX + 150, 320, '근거 문서를 바로 열어 확인한다', fade(u, 2.1), { 'font-size': 14 }); }

  // ---------- 5. ACL ----------
  const TR = (i) => ['tenant_id', 'role'];
  function userBadge(u, at) { person(RX + 50, 96, null, { s: pop(u, at ?? 0) }); mono(RX + 90, 90, 'tenant_id: tenantA', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, (at ?? 0) + 0.2) }); mono(RX + 90, 114, 'role: hr', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, (at ?? 0) + 0.3) }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { cards(c, TR, { hi: ['tenant_id', 'role'] }); rightPanel('CurrentUser'); userBadge(u, 0.3);
      sub(RX + 150, 200, '인증 미들웨어가 채워 준다', fade(u, 1.0), { 'font-size': 14 });
      tx(RX + 150, 260, '카드의 tenant·role과 맞춰 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { cards(c, TR); rightPanel('build_acl_filter(user)', { fill: PANEL }); userBadge(u);
      ['{"$and": [', '  {"tenant_id": "tenantA"},', '  {"role": {"$in":', '      ["hr", "admin"]}}', ']}'].forEach((s, j) => mono(RX + 14, 170 + j * 26, s, { 'font-size': 14, 'font-weight': 700, fill: j === 1 ? INFO : j === 2 || j === 3 ? ACC : INK, opacity: fade(u, 0.4 + j * 0.25) }));
      sub(RX + 150, 330, '조건 둘은 $and로 묶는다 (Chroma)', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { cards(c, TR); rightPanel('role 갈래');
      [['hr', 'hr·admin만', GOOD], ['engineer', 'eng·admin만', GOOD], ['admin', 'tenant 전체', INFO], ['그 밖', '403 거부', BAD]].forEach(([a, b, col], j) => { const y = 96 + j * 64;
        grow(RX + 30, 70, RX + 30, y, E(u, 0.2, 0.5), MUT, { plain: true, sw: 1.6 }); grow(RX + 30, y, RX + 50, y, E(u, 0.4 + j * 0.3, 0.6 + j * 0.3), col, { sw: 1.6 });
        pill(RX + 56 + (tw(a, 14) + 26) / 2, y, a, col, pop(u, 0.5 + j * 0.3), { mono: true, fs: 14 }); tx(RX + 178, y + 5, b, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 0.6 + j * 0.3) }); }); return; }
    if (k === 3) { cards(c, TR, { at: 0.6 }); rightPanel('search_with_acl'); userBadge(u);
      const al = Math.round(lerp(0, 2, E(u, 0.8, 1.8))), dn = Math.round(lerp(0, 4, E(u, 0.8, 1.8)));
      mono(RX + 30, 220, `허용 ${al}`, { 'font-size': 24, 'font-weight': 800, fill: GOOD }); mono(RX + 160, 220, `차단 ${dn}`, { 'font-size': 24, 'font-weight': 800, fill: BAD });
      sub(RX + 150, 280, '검색 전에 후보에서 빠진다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 4) { cards(c, TR); rightPanel('POST /rag/query');
      [['요청', INK], ['get_current_user', INFO], ['build_acl_filter', ACC], ['similarity_search', GOOD]].forEach(([s, col], j) => { const y = 90 + j * 66;
        card(RX + 150, y, 230, 40, { rx: 8, stroke: col, text: s, fs: 14.5, mono: true, color: col, s: pop(u, 0.3 + j * 0.35) }); if (j) grow(RX + 150, y - 46, RX + 150, y - 22, E(u, 0.2 + j * 0.35, 0.4 + j * 0.35), col, { sw: 1.8 }); });
      sub(RX + 150, 350, 'Depends로 모든 질의에 강제', fade(u, 1.9), { 'font-size': 14 }); return; }
    cards(c, TR); rightPanel('누가 무엇을 보나');
    [['tenantA · hr', '2건', 'hr_policy · hr_salary', GOOD], ['tenantA · engineer', '3건', 'pg17 · react19 · k8s', INFO], ['tenantB · hr', '1건', 'rival_hr만', WARN]].forEach(([a, b, d, col], j) => { const y = 96 + j * 86, s = pop(u, 0.3 + j * 0.4);
      card(RX + 150, y, 272, 70, { rx: 8, stroke: col, s }); mono(RX + 26, y - 8, a, { 'font-size': 14, 'font-weight': 700, opacity: s }); mono(RX + 274, y - 8, b, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: s }); tx(RX + 26, y + 18, d, { 'font-size': 13.5, fill: MUT, opacity: s }); }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'Chroma.from_texts에 metadatas를 빼고 저장하면 검색 결과는 어떻게 되는가?',
      o: ['검색이 아예 되지 않는다', '본문은 돌아오지만 metadata가 빈 dict다', '본문 대신 파일 이름이 돌아온다'], a: 1,
      why: '벡터는 본문으로 만들어지니 검색은 된다. 하지만 source·page·author가 없어 출처 표기, 필터, 권한 제어가 모두 막힌다.' },
    { q: 'Document(page_content, metadata)로 저장할 때 metadata를 따로 넘기지 않아도 되는 함수는 무엇인가?',
      o: ['Chroma.from_documents', 'Chroma.from_texts', 'similarity_search'], a: 0,
      why: 'from_documents는 Document마다 실린 metadata를 그대로 인덱싱한다. from_texts는 metadatas 인자를 따로 받아야 한다.' },
    { q: '6건 중 filter={"author": "kim"}을 걸면 검색 후보는 몇 건이 되는가?',
      o: ['2건', '6건', '3건'], a: 2,
      why: 'author가 kim인 문서는 인사규정 개정, 연봉 테이블, 경쟁사 B 보고서 3건이다. 나머지 3건은 후보에서 빠진다.' },
    { q: '답변에 "(hr_policy_v3.pdf p.1)" 같은 인용을 붙이려면 무엇이 있어야 하는가?',
      o: ['검색된 Document의 source·page 메타', '더 큰 LLM 모델', 'temperature를 1로 높인 설정'], a: 0,
      why: 'format_context가 metadata의 source와 page를 본문 뒤에 붙이고, 프롬프트가 [#번호] 표기를 시킨다. 메타가 없으면 붙일 것이 없다.' },
    { q: 'tenantA의 hr 사용자가 6건짜리 컬렉션을 검색하면 후보는 몇 건인가?',
      o: ['3건', '2건', '6건'], a: 1,
      why: 'tenant_id가 tenantA이고 role이 hr 또는 admin인 문서는 인사규정 개정과 연봉 테이블 2건이다. 경쟁사 B 보고서는 tenantB라 빠진다.' },
  ];

  const summary = [
    'page_content만 저장하면 검색은 되지만 어느 파일 몇 쪽인지 알 수 없다.',
    'Document에 source·page·author를 함께 담아 from_documents로 저장하면 메타가 검색 결과에 따라온다.',
    '메타 필터를 걸면 6건 중 author가 kim인 3건만 후보가 되고, 답변에는 source와 page를 인용할 수 있다.',
    'tenant_id와 role로 검색 필터를 강제하면 tenantA hr 사용자는 6건 중 2건만 본다.',
  ];
  const review = [
    { q: '사내 RAG가 답은 잘하는데 "어느 문서에서 나온 말이냐"는 질문에 답하지 못한다. 먼저 확인할 것은?',
      o: ['청크 크기가 너무 작은지', '저장할 때 metadata를 함께 넣었는지', '임베딩 모델의 차원 수'], a: 1,
      why: '출처는 검색 결과의 metadata에서 온다. from_texts에 metadatas를 빼먹었으면 metadata가 빈 dict라 인용할 재료가 없다.' },
    { q: '여러 회사가 한 벡터스토어를 쓰는데 A사 직원 화면에 B사 문서가 근거로 떴다. 가장 알맞은 해결책은?',
      o: ['답변 뒤에 B사 문서를 지우는 후처리를 넣는다', '회사마다 임베딩 모델을 바꾼다', '검색할 때 tenant_id 필터를 사용자 정보로 강제로 합친다'], a: 2,
      why: '검색 전 단계에서 후보를 좁혀야 B사 문서가 LLM에 들어가지 않는다. 사용자 컨텍스트로 만든 ACL 필터를 모든 질의에 붙인다.' },
    { q: 'Chroma에서 filter={"tenant_id": "tenantA", "role": {"$in": ["hr"]}}처럼 키 두 개를 한 dict에 넣었더니 오류가 났다. 왜인가?',
      o: ['조건이 둘 이상이면 $and로 묶어야 해서', '$in 연산자를 지원하지 않아서', 'tenant_id라는 이름은 예약어라서'], a: 0,
      why: 'Chroma의 where는 연산자 하나만 받으므로 조건 여러 개는 {"$and": [...]}로 묶는다. 벡터스토어마다 필터 문법이 다르다.' },
  ];

  R.page({ title: '문서 카드와 메타데이터', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
