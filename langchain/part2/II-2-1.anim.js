/* II-2-1 Vector Stores — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 문서 5개가 임베딩되어 점이 되고, 그 점들이 Chroma(디스크 폴더) · FAISS(RAM) · pgvector(Postgres 테이블)에 담긴다.
 * 점의 자리와 검색 결과(#1, #3)는 예시다. 실제 값은 임베딩 모델이 정한다.
 * pgvector 표의 열 이름(document · embedding · cmetadata)은 langchain-postgres 의 langchain_pg_embedding 테이블을 따른다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, dbIcon, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const DOCS = [['AI Agent는 자율적으로 판단하고 행동한다', 'AI'], ['LangChain은 LLM 앱 개발 프레임워크다', 'LangChain'], ['RAG는 검색 + 생성을 결합한 기법이다', 'AI'], ['FastAPI는 파이썬 웹 프레임워크다', '웹'], ['Docker는 컨테이너 기반 가상화 도구다', '인프라']];
  const PTS = [[0.30, 0.72], [0.55, 0.60], [0.42, 0.45], [0.78, 0.30], [0.62, 0.15]];   // 예시 위치 (0~1)
  const Q = [0.24, 0.58], HIT = [0, 2];
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const SC = { chroma: GOOD, faiss: INFO, pg: WARN };
  // 벡터 공간: 점 5개 (+질문, 가까운 2개)
  function space(x, y, w, h, o) { o = o || {}; const P = ([a, b]) => [x + 20 + a * (w - 40), y + h - 18 - b * (h - 40)];
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.col || GRID, 'stroke-width': o.col ? 2.4 : 1.5 });
    if (o.title) tx(x + 12, y + 20, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.col || MUT });
    PTS.forEach((p, i) => { const s = o.pop ? o.pop(i) : 1; if (s <= 0) return; const [cx, cy] = P(p), on = o.hit && HIT.includes(i), dim = o.dim && o.dim(i);
      el('circle', { cx, cy, r: 9 * clamp(s), fill: dim ? OFF : on ? ACC : INK, opacity: dim ? 0.5 : 1 });
      mono(cx + 13, cy + 5, `#${i + 1}`, { 'font-size': 13.5, 'font-weight': 700, fill: dim ? OFF : on ? ACC : MUT, opacity: clamp(s) }); });
    if (o.q != null && o.q > 0) { const [qx, qy] = P(Q);
      if (o.ring) { el('circle', { cx: qx, cy: qy, r: lerp(0, 75, o.ring), fill: 'none', stroke: ACC, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: 1 - o.ring * 0.4 }); }
      if (o.hit) HIT.forEach((i) => { const [hx, hy] = P(PTS[i]); el('line', { x1: qx, y1: qy, x2: lerp(qx, hx, o.hit), y2: lerp(qy, hy, o.hit), stroke: ACC, 'stroke-width': 2.4 }); });
      el('rect', { x: qx - 8, y: qy - 8, width: 16, height: 16, fill: WARN, transform: `rotate(45 ${qx} ${qy})`, opacity: o.q });
      tx(qx - 12, qy - 14, '질문', { 'font-size': 13.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: o.q }); }
    if (o.note !== false) sub(x + w - 10, y + h - 6, '점 위치는 예시', 0.9, { 'text-anchor': 'end' }); }
  function docList(x, y, o) { o = o || {}; DOCS.forEach(([s, tp], i) => { const sc = o.pop ? o.pop(i) : 1; if (sc <= 0) return; const yy = y + i * 40;
    card(x + 170, yy, 340, 32, { rx: 6, stroke: o.hi && o.hi(i) ? ACC : GRID, sw: 1.6, s: sc, op: o.dim && o.dim(i) ? 0.35 : 1 });
    mono(x + 12, yy + 5, `#${i + 1}`, { 'font-size': 13.5, 'font-weight': 800, fill: MUT, opacity: clamp(sc) * (o.dim && o.dim(i) ? 0.35 : 1) });
    tx(x + 44, yy + 5, s.length > 21 ? s.slice(0, 21) + '…' : s, { 'font-size': 13.5, opacity: clamp(sc) * (o.dim && o.dim(i) ? 0.35 : 1) });
    if (o.meta) pill(x + 380 + tw(tp, 13.5) / 2, yy, `topic: ${tp}`, tp === 'AI' ? ACC : MUT, sc, { fs: 13.5 }); }); }
  function results(x, y, op, o) { o = o || {}; tx(x, y, o.title || 'similarity_search(…, k=2)', { 'font-size': 14, 'font-weight': 700, class: 'mono', opacity: op });
    HIT.forEach((i, j) => { card(x + 150, y + 30 + j * 40, 300, 32, { rx: 6, stroke: ACC, sw: 2, fill: ACCBG, op });
      tx(x + 12, y + 35 + j * 40, `#${i + 1} ${DOCS[i][0].slice(0, 18)}…`, { 'font-size': 13.5, 'font-weight': 700, opacity: op }); });
    sub(x + 150, y + 112, '예시 출력', op); }
  function folder(cx, cy, name, col, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: 'M-78,-30 H-34 L-24,-20 H78 V40 H-78 Z', fill: PANEL, stroke: col, 'stroke-width': 2.4 }, g);
    tx(0, 64, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: col }, g);
    (o.files || []).forEach((f, i) => mono(0, -2 + i * 18, f, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: o.fop ? o.fop(i) : 1 }, g)); }
  function ram(cx, cy, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -110, y: -34, width: 220, height: 68, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 2.4 }, g);
    for (let i = 0; i < 6; i++) el('rect', { x: -96 + i * 33, y: -22, width: 24, height: 30, rx: 3, fill: PANEL, stroke: INFO, 'stroke-width': 1.5 }, g);
    for (let i = 0; i < 14; i++) el('rect', { x: -100 + i * 15, y: 34, width: 8, height: 10, fill: INFO }, g);
    tx(0, 66, 'RAM', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO }, g); }

  // ---------- 1. Chroma ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [['from langchain_chroma import Chroma', GOOD], ['from langchain_openai import OpenAIEmbeddings', INFO], ['from langchain_core.documents import Document', INK]].forEach(([s, col], i) =>
        pill(480, 100 + i * 60, s, col, pop(u, 0.2 + i * 0.4), { mono: true, fs: 15 }));
      sub(480, 320, '아직 인덱스는 없다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { docList(60, 80, { pop: (i) => pop(u, 0.2 + i * 0.25) });
      tx(700, 170, 'Document 5개', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(700, 200, '이 리스트가 인덱싱 대상', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 2) { docList(20, 80, { dim: (i) => E(u, 0.3 + i * 0.25, 0.8 + i * 0.25) >= 1 });
      DOCS.forEach((_, i) => { const f = E(u, 0.3 + i * 0.25, 0.8 + i * 0.25); if (f > 0 && f < 1) dot([[380, 80 + i * 40], [600, 210]], f, ACC, 7); });
      space(560, 60, 380, 300, { title: 'Chroma 컬렉션 "study"', col: GOOD, pop: (i) => pop(u, 0.8 + i * 0.25) });
      sub(470, 395, 'from_documents 한 줄 = 임베딩 + 인덱스 만들기', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { space(40, 60, 380, 300, { title: 'Chroma 컬렉션 "study"', col: GOOD });
      grow(430, 210, 600, 210, E(u, 0.3, 0.9), GOOD);
      folder(720, 200, './chroma_db', GOOD, { s: pop(u, 0.6), files: ['chroma.sqlite3', '…'], fop: (i) => fade(u, 1.1 + i * 0.3) });
      sub(720, 300, 'persist_directory 만 주면', fade(u, 1.6), { 'font-size': 15 }); sub(720, 324, '따로 저장을 부르지 않아도 남는다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 4) { space(40, 60, 420, 320, { title: 'Chroma', col: GOOD, q: fade(u, 0.2), ring: E(u, 0.5, 1.2), hit: E(u, 1.2, 1.7) });
      pill(720, 80, '"AI Agent가 뭐야?"', WARN, pop(u, 0.2), { fs: 15 });
      results(560, 150, fade(u, 1.7)); return; }
    [['pip install langchain-chroma', GOOD], ['서버·계정 필요 없음', GOOD], ['persist_directory 로 영속화', GOOD]].forEach(([s, col], i) => pill(280, 110 + i * 70, s, col, pop(u, 0.2 + i * 0.3), { fs: 15, mono: i === 0 }));
    card(720, 180, 300, 120, { rx: 12, stroke: GOOD, sw: 2.4, fill: GOODBG, s: pop(u, 1.3) });
    tx(720, 170, '잘 맞는 곳', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
    tx(720, 198, 'PoC · 노트북 RAG 실험', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) }); }

  // ---------- 2. FAISS ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { pill(300, 130, 'from langchain_community.vectorstores import FAISS', INFO, pop(u, 0.2), { mono: true, fs: 14.5 });
      card(300, 230, 420, 50, { rx: 8, stroke: INK, sw: 2, s: pop(u, 0.7), text: 'embeddings = OpenAIEmbeddings(…)', fs: 14.5, mono: true });
      sub(700, 230, '← 저장·불러오기에 다시 쓴다', fade(u, 1.3), { 'font-size': 15, 'text-anchor': 'start' }); return; }
    if (k === 1) { docList(60, 80, { pop: (i) => pop(u, 0.1 + i * 0.15) });
      tx(720, 160, 'Chroma 때와 같은 리스트', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(720, 190, '바뀌는 것은 store 뿐', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 2) { ram(260, 180, { s: pop(u, 0.2) });
      space(560, 50, 380, 280, { title: 'FAISS 인덱스 (메모리 안)', col: INFO, pop: (i) => pop(u, 0.6 + i * 0.2) });
      grow(372, 180, 556, 180, E(u, 0.4, 0.8), INFO, { dash: '5 4' });
      card(260, 330, 220, 44, { rx: 8, stroke: GRID, sw: 1.8, dash: '6 5', s: pop(u, 1.6), text: '디스크: 아직 없음', fs: 14.5, color: MUT });
      sub(560, 370, '프로세스가 끝나면 사라진다', fade(u, 2.0), { 'font-size': 15, 'text-anchor': 'start' }); return; }
    if (k === 3) { ram(220, 180, {});
      grow(340, 180, 560, 180, E(u, 0.3, 0.9), INFO); mono(450, 166, 'save_local()', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.4) });
      folder(700, 180, './faiss_index', INFO, { s: pop(u, 0.8), files: ['index.faiss', 'index.pkl'], fop: (i) => fade(u, 1.2 + i * 0.4) });
      sub(480, 320, 'Chroma 와 달리 저장은 직접 불러야 한다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { folder(180, 170, './faiss_index', INFO, { files: ['index.faiss', 'index.pkl'] });
      grow(260, 170, 520, 170, E(u, 0.3, 0.9), INFO); mono(390, 156, 'load_local()', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.4) });
      ram(680, 170, { s: pop(u, 0.8) });
      pill(390, 250, 'embeddings (저장 때와 같은 모델)', ACC, pop(u, 1.2), { fs: 14 });
      card(480, 340, 560, 50, { rx: 8, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.6), text: 'allow_dangerous_deserialization=True', fs: 14.5, mono: true, color: WARN });
      sub(480, 385, 'index.pkl 은 pickle 이라 내가 만든 파일일 때만 연다', fade(u, 2.0)); return; }
    space(40, 60, 420, 320, { title: 'FAISS (복원한 인덱스)', col: INFO, q: fade(u, 0.2), ring: E(u, 0.5, 1.2), hit: E(u, 1.2, 1.7) });
    pill(720, 80, '"AI Agent가 뭐야?"', WARN, pop(u, 0.2), { fs: 15 });
    results(560, 150, fade(u, 1.7)); sub(710, 300, 'Chroma 와 같은 메서드, 같은 결과', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 3. pgvector ----------
  function pgTable(x, y, o) { o = o || {}; const cols = [['document', 300], ['embedding', 170], ['cmetadata (jsonb)', 200]], rh = 34;
    let cx = x; cols.forEach(([n, w]) => { el('rect', { x: cx, y, width: w, height: rh, fill: SOFT, stroke: GRID }); tx(cx + 10, y + 22, n, { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: WARN }); cx += w; });
    DOCS.forEach(([s, tp], i) => { const f = o.rows ? o.rows(i) : 1; if (f <= 0) return; const yy = y + rh * (i + 1), dim = o.dim && o.dim(i), hot = o.hot && o.hot(i), op = (dim ? 0.3 : 1) * clamp(f);
      let cx2 = x; cols.forEach(([n, w], j) => { el('rect', { x: cx2, y: yy, width: w, height: rh, fill: hot ? ACCBG : PANEL, stroke: GRID, opacity: op }); cx2 += w; });
      tx(x + 10, yy + 22, s.slice(0, 19) + '…', { 'font-size': 13.5, opacity: op });
      mono(x + 310, yy + 22, '[0.01, …]', { 'font-size': 13.5, fill: MUT, opacity: op });
      mono(x + 480, yy + 22, `{"topic": "${tp}"}`, { 'font-size': 13.5, fill: tp === 'AI' ? ACC : INK, 'font-weight': tp === 'AI' ? 700 : 400, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 60, 520, 120, ['$ psql study', ['study=# CREATE EXTENSION IF NOT EXISTS vector;', 'var(--hl)'], 'CREATE EXTENSION'], lerp(0, 3, E(u, 0.2, 1.6)), { title: 'PostgreSQL' });
      dbIcon(760, 160, 'PostgreSQL', { stroke: WARN, s: pop(u, 0.3) });
      pill(760, 260, '+ vector 타입', WARN, pop(u, 1.7), { mono: true, fs: 15 });
      sub(480, 340, 'DB 에 한 번만 실행하면 된다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 1) { const parts = [['postgresql+psycopg', INFO, '드라이버'], ['app:pw', BAD, '계정'], ['localhost:5432', GOOD, '호스트'], ['study', WARN, 'DB']];
      let x = 90; mono(60, 140, '"', { 'font-size': 17 });
      parts.forEach(([s, col, n], i) => { const w = tw(s, 17) + 2, op = fade(u, 0.2 + i * 0.35); mono(x, 140, s, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: op });
        tx(x + w / 2, 180, n, { 'font-size': 14, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: op }); x += w;
        if (i < 3) { mono(x, 140, ['://', '@', '/'][i], { 'font-size': 17, fill: MUT }); x += tw(['://', '@', '/'][i], 17) + 2; } });
      mono(x, 140, '"', { 'font-size': 17 });
      mono(60, 250, typed('COLLECTION = "study_docs"', E(u, 1.6, 2.2)), { 'font-size': 17, 'font-weight': 800, fill: WARN });
      sub(480, 320, '접속 정보와 컬렉션 이름을 상수로 고정한다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2) { docList(40, 80, { pop: (i) => pop(u, 0.1 + i * 0.15), meta: true });
      sub(480, 320, '이번엔 metadata 에 topic 을 붙였다 (뒤의 filter 에 쓴다)', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { tx(60, 56, 'langchain_pg_embedding  (collection = study_docs)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: MUT });
      pgTable(60, 72, { rows: (i) => E(u, 0.3 + i * 0.3, 0.7 + i * 0.3) });
      sub(480, 390, '호출은 Chroma·FAISS 와 같고, 벡터는 테이블 행이 된다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 4) { pgTable(60, 72, { hot: (i) => HIT.includes(i) && u > 1.2 });
      mono(480, 300, typed('vectorstore.similarity_search("AI Agent가 뭐야?", k=2)', E(u, 0.2, 1.1)), { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700 });
      sub(480, 330, '가까운 2행 #1, #3 (예시)', fade(u, 1.4), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      sub(480, 360, 'Postgres 안에서 돌지만 호출 코드는 한 글자도 다르지 않다', fade(u, 1.9), { 'font-size': 15 }); return; }
    pgTable(60, 72, { dim: (i) => u > 1.0 && DOCS[i][1] !== 'AI', hot: (i) => u > 1.8 && DOCS[i][1] === 'AI' });
    mono(480, 300, typed('filter={"topic": {"$eq": "AI"}}', E(u, 0.2, 0.9)), { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC });
    mono(480, 332, "→ WHERE cmetadata->>'topic' = 'AI'  (jsonb 조건)", { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
    sub(480, 366, '조건 밖의 3행은 점수와 상관없이 빠지고 AI 문서만 남는다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 4. VectorStore 추상 ----------
  const METH = ['from_documents', 'add_documents', 'similarity_search', 'as_retriever'];
  const KIDS = [['Chroma', GOOD], ['FAISS', INFO], ['PGVector', WARN]];
  function s4(t, c) { const { k, u } = c;
    const nm = k === 0 ? 0 : Math.min(4, k);   // 보이는 메서드 수
    card(480, 70, 300, 44, { rx: 8, stroke: INK, sw: 2.6, fill: SOFT, text: 'VectorStore (추상)', fs: 16, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    KIDS.forEach(([n, col], i) => { const x = 190 + i * 290;
      grow(480, 92, x, 168, k === 0 ? E(u, 0.6 + i * 0.2, 1.0 + i * 0.2) : 1, MUT, { plain: true });
      card(x, 190, 200, 44, { rx: 8, stroke: col, sw: 2.4, text: n, fs: 16, mono: true, color: col, s: k === 0 ? pop(u, 0.8 + i * 0.2) : 1 }); });
    if (k === 0) { sub(480, 140, '상속', fade(u, 1.2), { 'font-size': 14.5 }); sub(480, 300, '세 wrapper 가 같은 부모를 둔다', fade(u, 1.8), { 'font-size': 15.5, fill: INK, 'font-weight': 700 }); return; }
    if (k <= 4) { METH.slice(0, nm).forEach((m, j) => { const y = 250 + j * 38, isNew = j === nm - 1, s = isNew ? pop(u, 0.2) : 1;
        card(150, y, 220, 30, { rx: 6, stroke: isNew ? ACC : GRID, sw: isNew ? 2.2 : 1.4, text: m + (m === 'similarity_search' ? '(k=4)' : '()'), fs: 13.5, mono: true, color: isNew ? ACC : INK, s });
        KIDS.forEach((_, i) => { if (!isNew || u > 0.6 + i * 0.25) check(190 + i * 290 + 120, y, 8, isNew ? pop(u, 0.6 + i * 0.25) : 1); }); });
      if (k === 3) sub(600, 400, '점수까지 받는 similarity_search_with_score 도 함께', fade(u, 1.4), { 'font-size': 14.5 });
      if (k === 4) sub(600, 400, 'as_retriever 로 RAG 체인에 바로 꽂힌다', fade(u, 1.4), { 'font-size': 14.5 });
      return; }
    // k5 치환
    card(480, 300, 420, 50, { rx: 8, stroke: ACC, sw: 2.6, fill: ACCBG, text: 'store.similarity_search(q, k=2)', fs: 15, mono: true, color: ACC, s: pop(u, 0.2) });
    const which = Math.floor(clamp((u - 0.6) / 0.7, 0, 2.99));
    KIDS.forEach(([n, col], i) => { const x = 190 + i * 290, on = u > 0.6 && which === i;
      el('line', { x1: 480, y1: 275, x2: x, y2: 212, stroke: on ? col : GRID, 'stroke-width': on ? 3 : 1.5, 'stroke-dasharray': on ? null : '5 5' });
      if (on) dot([[480, 275], [x, 212]], ((u - 0.6) / 0.7) % 1, col, 7); });
    sub(480, 370, '어느 구현체가 들어와도 호출 코드는 그대로', fade(u, 2.2), { 'font-size': 15.5, fill: INK, 'font-weight': 700 }); }

  // ---------- 5. 환경별 교체 ----------
  const ENV = [['dev', 'chroma', GOOD, '빠른 시작'], ['test', 'faiss', INFO, '가볍고 서버 없음'], ['prod', 'pgvector', WARN, '운영 RDB · PG_DSN']];
  function s5(t, c) { const { k, u } = c;
    card(480, 60, 460, 48, { rx: 10, stroke: INK, sw: 2.4, fill: SOFT, text: 'get_vectorstore(docs) -> VectorStore', fs: 15, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(480, 116, 'backend = os.environ.get("VECTOR_STORE", "chroma")', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) { sub(480, 220, '반환 타입이 구현체가 아니라 추상이다', fade(u, 1.4), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    const shown = Math.min(3, k);
    ENV.slice(0, shown).forEach(([env, st, col, why], i) => { const x = 180 + i * 300, isNew = k <= 3 && i === k - 1, s = isNew ? pop(u, 0.4) : 1;
      grow(480, 130, x, 186, isNew ? E(u, 0.1, 0.5) : 1, col);
      card(x, 220, 240, 64, { rx: 10, stroke: col, sw: 2.4, s }); mono(x, 214, `${env} → ${st}`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: clamp(s) });
      tx(x, 238, why, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: clamp(s) });
      if (isNew) sub(x, 280, `${st} 일 때만 그 패키지를 import`, fade(u, 1.0)); });
    if (k === 4) { pill(480, 310, 'VECTOR_STORE="chromma"', BAD, pop(u, 0.3), { mono: true, fs: 15 });
      card(480, 370, 520, 44, { rx: 8, stroke: BAD, sw: 2.4, fill: BADBG, s: pop(u, 1.0), text: 'ValueError: Unknown VECTOR_STORE=chromma', fs: 14.5, mono: true, color: BAD });
      return; }
    if (k === 5) { const env = Math.floor(clamp((u - 0.2) / 0.8, 0, 2.99)), col = ENV[env][2];
      card(480, 340, 520, 76, { rx: 10, stroke: col, sw: 2.6, s: pop(u, 0.1) });
      mono(250, 330, 'store = get_vectorstore(docs)', { 'font-size': 15, 'font-weight': 700 }); mono(250, 356, 'retriever = store.as_retriever(search_kwargs={"k": 4})', { 'font-size': 14, 'font-weight': 700 });
      pill(820, 340, ENV[env][0], col, 1, { fs: 15, mono: true });
      sub(480, 400, 'dev·test·prod 어디서 돌아도 이 두 줄은 같다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  const quiz = [
    { q: 'Chroma.from_documents에 persist_directory를 주면 무엇이 달라지나?',
      o: ['검색이 더 빨라진다', '따로 저장을 부르지 않아도 인덱스가 디스크에 남는다', '서버를 따로 띄워야 한다'], a: 1,
      why: 'persist_directory만 지정하면 Chroma가 ./chroma_db에 알아서 저장한다. 서버나 계정은 필요 없다.' },
    { q: 'FAISS 인덱스를 다음 실행에서도 쓰려면 무엇을 해야 하나?',
      o: ['save_local()로 저장하고 같은 임베딩 모델로 load_local()한다', '아무것도 안 해도 RAM에 남는다', 'persist_directory를 준다'], a: 0,
      why: 'FAISS는 메모리 안에만 있어 저장을 직접 불러야 한다. 불러올 때는 저장 때와 같은 embeddings를 넘긴다.' },
    { q: 'pgvector에서 filter={"topic": {"$eq": "AI"}}가 결과를 AI 문서로 좁히려면 무엇이 먼저 필요한가?',
      o: ['CREATE INDEX를 따로 만든다', 'k를 5로 늘린다', 'Document에 metadata={"topic": …}를 넣어 저장한다'], a: 2,
      why: 'filter는 cmetadata(jsonb) 열을 조건으로 거른다. 저장할 때 topic이 없으면 걸러낼 값이 없다.' },
    { q: 'Chroma를 FAISS로 바꿔도 similarity_search 호출 코드를 고치지 않아도 되는 이유는?',
      o: ['두 라이브러리가 같은 회사 제품이라서', '둘 다 VectorStore 추상을 구현해 같은 메서드를 갖기 때문에', 'LangChain이 내부에서 항상 Chroma를 쓰기 때문에'], a: 1,
      why: 'VectorStore가 from_documents·add_documents·similarity_search·as_retriever를 정해 두고 세 wrapper가 이를 구현한다.' },
    { q: 'get_vectorstore()에서 알 수 없는 VECTOR_STORE 값이 오면 ValueError를 내는 이유는?',
      o: ['오타 난 값으로 조용히 기본값이 쓰이는 사고를 막으려고', '성능을 높이려고', 'pgvector 연결을 다시 시도하려고'], a: 0,
      why: '"chromma" 같은 오타를 기본값으로 넘기면 운영에서 엉뚱한 store가 쓰인다. 바로 실패하게 해 두면 배포 때 잡힌다.' },
  ];

  const summary = [
    'Chroma는 persist_directory 하나로 디스크에 저장되는 가장 손쉬운 로컬 store다.',
    'FAISS는 메모리 안에서 빠르게 찾지만 save_local과 load_local을 직접 불러야 한다.',
    'pgvector는 벡터를 Postgres 행으로 두어 metadata 조건을 SQL처럼 함께 건다.',
    '셋 다 VectorStore를 구현하므로 factory만 바꾸면 dev, test, prod에서 같은 코드가 돈다.',
  ];
  const review = [
    { q: 'FAISS로 만든 챗봇을 재시작했더니 검색 결과가 하나도 안 나온다. 먼저 의심할 것은?',
      o: ['임베딩 차원이 너무 크다', 'save_local로 저장하지 않았거나 load_local을 빼먹었다', 'k 값이 너무 작다'], a: 1,
      why: 'FAISS 인덱스는 RAM에만 있어 프로세스가 끝나면 사라진다. Chroma처럼 자동 저장되지 않는다.' },
    { q: '회원 주문 DB가 이미 Postgres에 있고 "내 주문 관련 문서만" 검색해야 한다. 가장 알맞은 선택은?',
      o: ['pgvector에 user_id를 metadata로 넣고 filter로 거른다', 'FAISS로 옮기고 결과를 파이썬에서 거른다', 'Chroma를 사용자마다 하나씩 만든다'], a: 0,
      why: 'pgvector는 기존 DB 안에서 metadata 조건을 SQL로 건다. 백업·권한도 기존 운영 방식을 그대로 쓴다.' },
    { q: '테스트에서는 FAISS, 운영에서는 pgvector를 쓰고 싶은데 RAG 체인 코드가 store마다 갈라져 있다. 무엇을 바꿔야 하나?',
      o: ['체인마다 if 문을 더 넣는다', '두 store의 결과를 합친다', 'VectorStore를 돌려주는 factory 한 곳에서만 환경을 나눈다'], a: 2,
      why: '체인은 VectorStore와 as_retriever만 알면 된다. 환경 분기를 factory 한 곳에 모으면 체인 코드는 하나로 남는다.' },
  ];

  R.page({ title: '문서 5개가 담기는 세 가지 store', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
