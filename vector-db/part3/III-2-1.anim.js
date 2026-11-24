/* III-2-1 Chroma 운영 모드 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 파이썬 프로세스 안의 RAM 벡터 DB · 프로세스 아래 디스크 폴더와 파일 · chroma run 서버와 포트 · HTTP 로 오가는 요청 JSON ·
 *       In-Memory → Persistent → Server 계단.
 * 숫자는 chromadb 1.5.9 를 실제로 돌린 값이다.
 *   In-Memory query "파이썬 웹" → 거리 1.30 · PersistentClient 파일: chroma.sqlite3 188,416 B, data_level0.bin 167,600 B
 *   chroma run 로그: "Connect to Chroma at: …", "Frontend server listening on address" · heartbeat {"nanosecond heartbeat": …}
 *   HttpClient query "결제 내역" → ids [["order_1234"]], 거리 0.76 · HttpClient 는 임베딩을 클라이언트에서 계산해 벡터를 보낸다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, dbIcon, server, person, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 ----------
  function proc(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || 'none', stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-dasharray': '8 6', opacity: op });
    tx(x + 16, y + 24, name, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || MUT, opacity: op }); }
  // RAM 칸: 작은 메모리 칸이 채워진다
  function ramGrid(x, y, cols, rows, f, col) { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, s = clamp(f * cols * rows - i); if (s <= 0) continue;
      el('rect', { x: x + c * 22, y: y + r * 22, width: 18, height: 18, rx: 3, fill: col || ACC, opacity: 0.12 + 0.2 * s }); } }
  function star(x, y, r, s) { if (s <= 0.02) return; const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = (i % 2 ? r * 0.45 : r) * s; p.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); }
    el('polygon', { points: p.map((q) => q.join(',')).join(' '), fill: WARN }); }
  // 디스크 폴더 트리
  function tree(x, y, name, files, n) { mono(x, y, name, { 'font-size': 15, 'font-weight': 800, opacity: clamp(n) });
    files.forEach(([f, sz, lv, col], i) => { const op = clamp(n - 1 - i); if (op <= 0.02) return; const yy = y + 26 + i * 25, xx = x + 22 * lv;
      el('path', { d: `M${xx - 14},${yy - 20} V${yy - 5} H${xx - 4}`, fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: op });
      mono(xx, yy, f, { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: op }); if (sz) mono(x + 330, yy, sz, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }); }
  function disk(x, y, w, h, op) { el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: op ?? 1 });
    el('path', { d: `M${x + 14},${y} v-10 h60 l10,10`, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: op ?? 1 }); }
  const P2FILES = [['chroma.sqlite3', '188,416 B', 1, INFO], ['<uuid>/', '', 1, ACC], ['data_level0.bin', '167,600 B', 2, ACC], ['header.bin · length.bin · link_lists.bin', '', 2, ACC]];

  // ---------- 1. In-Memory ----------
  function s1(t, c) { const { k, u } = c;
    const dying = k === 5 ? E(u, 0.8, 2.0) : 0;
    proc(40, 30, 520, 360, 'python 프로세스', { op: 1 - 0.7 * dying });
    card(140, 84, 150, 40, { rx: 8, stroke: INFO, fill: INFOBG, text: 'chromadb', fs: 15, mono: true, color: INFO, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { card(300, 250, 440, 200, { rx: 12, stroke: GRID, dash: '6 5', text: '벡터 DB 아직 없음', fs: 15, color: MUT, s: pop(u, 0.8) }); return; }
    const fill = k === 1 ? E(u, 0.2, 1.6) : 1;
    el('rect', { x: 80, y: 150, width: 440, height: 200, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: 1 - dying });
    tx(96, 174, 'In-Memory Vector DB (RAM)', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: 1 - dying });
    ramGrid(96, 186, 19, 7, fill * (1 - dying));
    if (k === 1) { [['서버', 690, 110], ['디스크 파일', 840, 110]].forEach(([n, x, y], i) => { if (i) dbIcon(x, y, null, { s: 0.7 * pop(u, 0.8 + i * 0.3) }); else server(x, y, null, { s: 0.6 * pop(u, 0.8) });
        cross(x, y, 26, pop(u, 1.3 + i * 0.3)); tx(x, y + 62, n + ' 없음', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.5 + i * 0.3) }); });
      mono(600, 280, 'client = chromadb.Client()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); sub(760, 320, 'EphemeralClient()와 같은 것', fade(u, 2.0)); return; }
    // 컬렉션
    const cs = k === 2 ? pop(u, 0.3) : 1, n = k >= 3 ? 1 : 0;
    card(300, 262, 300, 120, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2, s: cs, op: 1 - dying });
    mono(166, 222, `my_docs · ${n}건`, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: cs * (1 - dying) });
    if (k === 2) { mono(600, 120, 'client.create_collection("my_docs")', { 'font-size': 14.5, opacity: fade(u, 0.5) }); sub(760, 170, 'RAM 위에 만들어진다', fade(u, 1.2)); return; }
    const dp = [360, 290 + 70 * dying * dying], qp = [210, 300];
    if (k === 3) { fly(740, 90, dp[0], dp[1], seg(u, 0.3, 1.5), 'FastAPI는 빠른 Python 웹 프레임워크', { fill: ACC }); mono(600, 200, 'col.add(documents=[…], ids=["doc1"])', { 'font-size': 14, opacity: fade(u, 0.2) });
      sub(760, 250, '임베딩까지 마쳐 RAM에 놓인다', fade(u, 1.8)); }
    if (k > 3 || u > 1.5) { el('circle', { cx: dp[0], cy: dp[1], r: 9, fill: ACC, opacity: 1 - dying }); mono(dp[0] + 14, dp[1] + 5, 'doc1', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: 1 - dying }); }
    if (k === 4) { star(qp[0], qp[1], 13, pop(u, 0.3)); mono(qp[0] - 36, qp[1] - 20, '"파이썬 웹"', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) });
      const f = E(u, 0.8, 1.4); el('line', { x1: qp[0], y1: qp[1], x2: lerp(qp[0], dp[0], f), y2: lerp(qp[1], dp[1], f), stroke: GOOD, 'stroke-width': 2.6 });
      if (f >= 1) card(285, 282, 54, 26, { rx: 6, fill: PANEL, stroke: GOOD, sw: 1.4, text: '1.30', fs: 13.5, mono: true, color: GOOD });
      mono(600, 140, 'col.query(query_texts=["파이썬 웹"],', { 'font-size': 14, opacity: fade(u, 0.3) }); mono(600, 164, '          n_results=1)', { 'font-size': 14, opacity: fade(u, 0.3) });
      [['네트워크 왕복', '0'], ['디스크 읽기', '0']].forEach(([a, b], i) => { tx(600, 240 + i * 40, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6 + i * 0.3) }); mono(800, 240 + i * 40, b, { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7 + i * 0.3) }); }); return; }
    if (k === 5) { cross(300, 200, 40, pop(u, 0.4)); tx(600, 140, '프로세스 종료', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
      mono(600, 230, '다시 실행 → my_docs 없음', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); sub(760, 270, '컬렉션도 문서도 RAM과 함께 사라진다', fade(u, 2.2)); } }

  // ---------- 2. Persistent ----------
  function s2(t, c) { const { k, u } = c;
    const rs = k === 4 ? E(u, 0.1, 0.6) : 0, back = k === 4 ? E(u, 1.0, 1.8) : 1;
    proc(40, 24, 520, 200, k === 4 && back > 0 ? '새 python 프로세스 (같은 path)' : 'python 프로세스', { op: k === 4 ? Math.max(1 - rs, back) : 1 });
    if (k === 4 && back <= 0) cross(300, 135, 30, pop(u, 0.3));
    const cl = k === 0 ? 'import chromadb' : 'PersistentClient(path="./chroma_data")';
    mono(60, 82, cl, { 'font-size': 14.5, 'font-weight': 700, fill: k === 0 ? INFO : ACC, opacity: k === 0 ? fade(u, 0.2) : 1 });
    // RAM 캐시와 컬렉션
    const n = k >= 3 ? 1 : 0, colOn = k >= 2 ? (k === 2 ? pop(u, 0.3) : k === 4 ? back : 1) : 0;
    if (colOn > 0.02) { card(300, 160, 300, 80, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2, s: colOn }); mono(300, 152, `my_docs · ${n}건`, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: colOn });
      tx(300, 178, 'RAM 캐시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: colOn }); }
    // 디스크
    const dOn = k === 0 ? 0 : k === 1 ? pop(u, 0.4) : 1;
    if (k === 0) { el('rect', { x: 40, y: 262, width: 520, height: 152, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.6) }); sub(300, 346, '디스크와 아직 연결 전', fade(u, 0.9)); }
    if (dOn > 0.02) { disk(40, 262, 520, 152, dOn);
      const nf = k === 1 ? 1 + E(u, 0.8, 1.4) : k === 2 ? 2 : k === 3 ? 2 + E(u, 0.6, 1.8) * 4 : 6;
      tree(60, 290, './chroma_data/', P2FILES, nf); }
    if (k === 1) { mono(600, 110, 'PersistentClient(path=...)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); sub(760, 150, '폴더가 없으면 만들고 sqlite 파일을 연다', fade(u, 1.4)); }
    if (k === 2) { mono(600, 110, 'get_or_create_collection("my_docs")', { 'font-size': 14.5, opacity: fade(u, 0.2) }); sub(760, 150, '첫 실행이면 만들고, 재실행이면 불러온다', fade(u, 1.2)); }
    if (k === 3) { for (let i = 0; i < 5; i++) dot([[300 + (i - 2) * 30, 200], [300 + (i - 2) * 30, 290]], ((u * 0.9 + i / 5) % 1) * (u < 2.4 ? 1 : 0), ACC, 5);
      mono(600, 110, 'col.add(...)  →  count() = 1', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); sub(760, 150, 'RAM과 디스크에 함께 기록된다', fade(u, 1.4)); }
    if (k === 4) { if (back > 0) for (let i = 0; i < 3; i++) dot([[200 + i * 100, 300], [200 + i * 100, 190]], clamp(back * 1.4 - i * 0.15), INFO, 6);
      tx(600, 110, '껐다가 다시 실행', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); mono(600, 160, 'col.count()  →  1', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) }); }
    if (k === 5) { el('rect', { x: 50, y: 300, width: 500, height: 24, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
      el('rect', { x: 72, y: 326, width: 478, height: 76, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 0.9) });
      tx(600, 300, 'sqlite3 = 컬렉션 · 문서 · 메타데이터', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) });
      tx(600, 340, '<uuid>/ = 그 컬렉션의 HNSW 인덱스', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1) });
      sub(760, 150, '문서 1건만 넣어도 이 파일들이 생긴다', fade(u, 1.8)); } }

  // ---------- 3. Server ----------
  const T3 = [['$ pip install chromadb', null], ['$ chroma --help', null], ['  run   Start a local Chroma server', 'var(--term)'],
    ['$ chroma run --host 0.0.0.0 --port 8000 --path /data/chroma', null],
    ['$ curl localhost:8000/api/v2/heartbeat', null], ['{"nanosecond heartbeat": 1714000000000000000}', 'var(--good)'],
    ['Connect to Chroma at: http://localhost:8000', 'var(--good)'], ['INFO  Frontend server listening … 0.0.0.0:8000', 'var(--good)']];
  function s3(t, c) { const { k, u } = c;
    const shown = [0, 3, 4, 4, 4, 6, 8][k], prevShown = [0, 0, 3, 4, 4, 4, 6][k];
    terminal(30, 20, 470, 380, T3, Math.max(0.01, k === 0 ? 1 * E(u, 0.3, 1.0) : prevShown + (shown - prevShown) * E(u, 0.2, 1.4)), { title: 'terminal', fs: 13.5 });
    const SX = 730, SY = 150;
    if (k <= 1) { card(SX, SY, 260, 160, { rx: 12, stroke: GRID, dash: '7 6', text: '서버 프로세스\n아직 없음', fs: 15, color: MUT });
      if (k === 0) sub(SX, 300, 'Chroma를 라이브러리가 아니라', fade(u, 1.0), { 'font-weight': 700, fill: INK }); if (k === 0) sub(SX, 324, '따로 뜬 프로세스로 쓴다', fade(u, 1.3), { 'font-weight': 700, fill: INK });
      if (k === 1) sub(SX, 300, 'chroma 명령은 같은 패키지에 들어 있다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    const up = k === 2 ? pop(u, 1.2) : 1, docker = k >= 4 ? (k === 4 ? E(u, 0.2, 1.0) : 1) : 0;
    if (docker > 0) { el('rect', { x: SX - 170, y: SY - 120, width: 340 * docker, height: 360, rx: 14, fill: INFOBG, stroke: INFO, 'stroke-width': 2.2, opacity: 0.9 });
      tx(SX - 156, SY - 96, 'container · chromadb/chroma', { 'font-size': 14, 'font-weight': 800, fill: INFO, class: 'mono', opacity: docker }); }
    proc(SX - 130, SY - 76, 260, 150, 'chroma run', { fill: PANEL, op: up });
    server(SX, SY + 6, null, { s: 0.8 * up, lamp: k >= 5 ? GOOD : k >= 2 ? ACC : OFF });
    pill(SX + 120, SY - 76, ':8000', ACC, up, { mono: true, fs: 14 });
    if (k >= 3) { const ds = k === 3 ? pop(u, 0.4) : 1; dbIcon(SX, SY + 180, null, { s: ds * 0.85 }); mono(SX, SY + 238, '/data/chroma', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: ds });
      grow(SX, SY + 76, SX, SY + 145, k === 3 ? E(u, 0.6, 1.0) : 1, MUT); }
    if (k === 2) sub(SX, SY + 110, '8000 포트에서 HTTP를 기다린다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
    if (k === 3) sub(SX + 120, SY + 150, '--path로 영속', fade(u, 1.0), { 'font-weight': 700, fill: INK, 'text-anchor': 'start' });
    if (k === 4) { mono(SX, 414, '-p 8000:8000  -v ./data:/chroma/chroma', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) }); }
    if (k === 5) { dot([[500, 240], [SX - 130, SY]], seg(u, 0.2, 0.9), WARN, 7); dot([[SX - 130, SY + 20], [500, 262]], seg(u, 1.0, 1.7), GOOD, 7);
      pill(SX, SY + 110, '200 OK', GOOD, pop(u, 1.6), { mono: true, fs: 14 }); }
    if (k === 6) sub(SX, SY + 110, '이 두 줄이 보이면 접속을 받는다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }

  // ---------- 4. HttpClient ----------
  const CL = [['API Server', 90, 'POST …/add'], ['Worker', 210, 'POST …/query'], ['Notebook', 330, 'GET …/count']];
  function s4(t, c) { const { k, u } = c, SX = 640, SY = 170;
    proc(SX - 140, SY - 110, 280, 220, 'chroma 서버 :8000', { fill: PANEL });
    server(SX - 70, SY - 20, null, { s: 0.6, lamp: GOOD });
    dbIcon(SX, SY + 190, null, { s: 0.7 }); mono(SX + 50, SY + 196, '/data/chroma', { 'font-size': 14, opacity: 1 }); el('line', { x1: SX, y1: SY + 110, x2: SX, y2: SY + 150, stroke: MUT, 'stroke-width': 2 });
    const nCl = [0, 1, 1, 1, 2, 3, 3][k];
    if (k >= 2) { const s = k === 2 ? pop(u, 0.3) : 1; card(SX + 40, SY + 30, 150, 60, { rx: 8, stroke: ACC, fill: ACCBG, sw: 2, s }); mono(SX + 40, SY + 26, 'shared_docs', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: s });
      tx(SX + 40, SY + 48, k >= 3 && (k > 3 || u > 1.8) ? '1건' : '0건', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }
    CL.forEach(([n, y, req], i) => { if (i >= nCl) return; const fresh = (k === 1 && i === 0) || (k === 4 && i === 1) || (k === 5 && i === 2), s = fresh ? pop(u, 0.2) : 1;
      card(110, y, 160, 56, { rx: 10, stroke: INK, sw: 2, s, text: n, fs: 15 });
      el('line', { x1: 190, y1: y, x2: SX - 140, y2: SY + (i - 1) * 50, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: s }); });
    if (k === 0) { tx(110, 210, '접속한 클라이언트 0', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); return; }
    const box = (lines, col, op) => { el('rect', { x: 200, y: 300, width: 380, height: 26 + lines.length * 22, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 1.6, opacity: op });
      lines.forEach((s, i) => mono(212, 322 + i * 22, s, { 'font-size': 13.5, fill: i ? INK : col, 'font-weight': i ? 400 : 700, opacity: op })); };
    if (k === 1) { mono(260, 30, 'HttpClient(host="localhost", port=8000)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) }); sub(330, 210, '나머지 코드는 In-Memory와 같다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { sub(SX, 30, '컬렉션은 서버가 들고 있다', fade(u, 1.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { fly(190, 90, SX - 140, SY - 50, seg(u, 0.3, 1.5), 'POST …/add', { fill: ACC, mono: true });
      box(['요청 본문 (줄임)', '"ids": ["order_1234"]', '"documents": ["주문 #1234 결제 완료"]', '"embeddings": [[… ×384]]'], ACC, fade(u, 1.0));
      dot([[SX, SY + 110], [SX, SY + 150]], seg(u, 1.6, 2.2), ACC, 6); return; }
    if (k === 4) { fly(190, 210, SX - 140, SY, seg(u, 0.3, 1.3), 'POST …/query', { fill: INFO, mono: true });
      fly(SX - 140, SY + 20, 190, 230, seg(u, 1.4, 2.2), 'order_1234 · 0.76', { fill: GOOD, mono: true });
      box(['임베딩은 클라이언트에서 계산', '"query_embeddings": [[… ×384]]', '"n_results": 5', '응답 ids [["order_1234"]]'], INFO, fade(u, 0.6)); return; }
    if (k === 5) { fly(190, 330, SX - 140, SY + 50, seg(u, 0.3, 1.3), 'GET …/count', { fill: INK, mono: true });
      box(['Settings(chroma_client_auth_…)', 'chroma_client_auth_credentials=', '  "my-secret-token"', '→ 요청마다 토큰이 실려 간다'], WARN, fade(u, 0.8)); return; }
    // k6
    [['Client()', 'RAM'], ['PersistentClient(path)', '디스크'], ['HttpClient(host, port)', '서버']].forEach(([a, b], i) => { const y = 34 + i * 26, on = i === 2;
      mono(210, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: on ? ACC : MUT, opacity: fade(u, 0.2 + i * 0.3) }); tx(420, y, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
    box(['그 아래 공통 코드', 'col = client.get_or_create_collection(...)', 'col.add(...)  ·  col.query(...)'], GOOD, fade(u, 1.2)); }

  // ---------- 5. 고르기 ----------
  const STAIR = [['In-Memory', 'Client()', 'PoC · 테스트', INFO], ['Persistent', 'PersistentClient(path)', '단일 앱 · 배치', ACC], ['Server', 'HttpClient(host, port)', '멀티 앱 · 프로덕션', WARN]];
  function stairs(k, u, hi) { STAIR.forEach(([n, fn, use, col], i) => { const x = 60 + i * 290, y = 300 - i * 90, s = k === 0 ? pop(u, 0.3 + i * 0.4) : 1, on = hi === i || hi == null;
      el('rect', { x, y, width: 260, height: 400 - y, rx: 10, fill: on ? PANEL : SOFT, stroke: on ? col : GRID, 'stroke-width': on ? 2.6 : 1.5, opacity: s });
      tx(x + 16, y + 30, n, { 'font-size': 17, 'font-weight': 800, fill: on ? col : MUT, opacity: s }); mono(x + 16, y + 56, fn, { 'font-size': 14, fill: on ? INK : MUT, opacity: s }); tx(x + 16, y + 80, use, { 'font-size': 14, fill: MUT, opacity: s }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { stairs(0, u); [0, 1].forEach((i) => grow(250 + i * 290, 290 - i * 90, 330 + i * 290, 230 - i * 90, E(u, 1.4 + i * 0.3, 1.8 + i * 0.3), MUT));
      sub(480, 60, '작게 시작해서 필요할 때 한 칸 올린다', fade(u, 2.0), { 'font-weight': 700, fill: INK, 'font-size': 16 }); return; }
    if (k === 4) { stairs(1, u); const f = E(u, 0.3, 2.2), i = Math.min(2, Math.floor(f * 3)), x = 60 + i * 290 + 130, y = 300 - i * 90 - 30;
      card(x, y, 220, 34, { rx: 17, fill: INK, stroke: 'none', text: '바뀌는 줄 = 1', fs: 14.5, color: PANEL });
      sub(480, 60, 'add · query · 체인 코드는 그대로', fade(u, 1.6), { 'font-weight': 700, fill: INK, 'font-size': 16 }); return; }
    if (k === 5) { [['Persistent로 여러 프로세스', 'SQLite 파일을 동시에 연다'], ['토큰 없이 0.0.0.0 바인딩', '누구나 컬렉션을 지운다'], ['In-Memory로 프로덕션', '재시작마다 다시 인덱싱']].forEach(([a, b], i) => {
        const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.4); card(x, 210, 280, 150, { rx: 12, stroke: BAD, fill: BADBG, sw: 2, s }); cross(x, 170, 16, s);
        tx(x, 222, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); tx(x, 250, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.4) }); });
      sub(480, 340, '피해야 할 세 가지', fade(u, 1.9), { 'font-weight': 700, fill: INK, 'font-size': 16 }); return; }
    const hi = k - 1; stairs(k, u, hi);
    const notes = [[['설정 0 · 가장 빠름', 1], ['종료하면 휘발', 0], ['다른 프로세스 접근 불가', 0]], [['디스크에 영속', 1], ['단일 앱이면 운영 비용 0', 1], ['동시 접근 시 SQLite 락', 0]], [['여러 앱이 같은 데이터', 1], ['인증 토큰', 1], ['운영 부담 · 네트워크 지연', 0]]][hi];
    notes.forEach(([s, ok], i) => { const y = 56 + i * 36, x = 50; (ok ? check : cross)(x, y - 5, 8, pop(u, 0.3 + i * 0.4)); tx(x + 18, y, s, { 'font-size': 15, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, 0.35 + i * 0.4) }); });
    if (hi === 1) { [0, 1].forEach((i) => { const x = 420 + i * 130; person(x, 70, i ? '앱 B' : '앱 A', { s: 0.8 }); grow(x, 116, 480, 200, E(u, 1.2 + i * 0.3, 1.6 + i * 0.3), i ? BAD : MUT); });
      lbl(230, 200, '같은 SQLite 파일 → 락 충돌', fade(u, 2.0), { fill: BAD }); } }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'chromadb.Client()로 문서를 넣은 스크립트를 다시 실행하면 my_docs는 어떻게 되는가?',
      o: ['디스크에서 다시 불러온다', '없다. 프로세스와 함께 사라졌다', '서버에 남아 있다'], a: 1,
      why: 'In-Memory 모드는 같은 프로세스의 RAM 에만 데이터를 둔다. 서버도 디스크 파일도 없어서 종료하면 컬렉션과 문서가 함께 사라진다.' },
    { q: 'PersistentClient(path="./chroma_data")로 문서 1건을 add 했을 때 디스크에 생기는 것은 무엇인가?',
      o: ['chroma.sqlite3와 <uuid>/ 폴더의 HNSW 파일', 'collection.parquet 하나', 'flush()를 불러야 생긴다'], a: 0,
      why: '실제로 돌려 보면 chroma.sqlite3(188,416 B)와 <uuid>/data_level0.bin(167,600 B) 등이 add 직후 생긴다. parquet 파일은 없다.' },
    { q: 'chroma run --port 8000 --path /data/chroma에서 --path가 하는 일은 무엇인가?',
      o: ['서버 로그를 남길 폴더를 정한다', '클라이언트가 접속할 주소를 정한다', '서버가 데이터를 영속 저장할 폴더를 정한다'], a: 2,
      why: '서버 프로세스가 그 폴더에 sqlite와 인덱스 파일을 쓰고 혼자 관리한다. 접속 주소는 --host와 --port가 정한다.' },
    { q: 'HttpClient로 col.query(query_texts=["결제 내역"])를 부르면 서버로 가는 요청에는 무엇이 실리는가?',
      o: ['클라이언트가 계산한 질의 임베딩 벡터', '질의 문자열만, 임베딩은 서버가 한다', '컬렉션 전체 문서'], a: 0,
      why: '임베딩 함수는 클라이언트 쪽 컬렉션 객체에 붙어 있다. 문자열을 벡터로 바꾼 뒤 query_embeddings로 보내고, 서버는 거리 계산만 한다.' },
    { q: '배치 인덱서와 API 서버 두 프로세스가 같은 Chroma 데이터를 동시에 읽고 써야 한다. 알맞은 모드는 무엇인가?',
      o: ['In-Memory', 'Persistent로 같은 path를 둘 다 연다', 'Server 모드에 둘 다 HttpClient로 붙는다'], a: 2,
      why: 'Persistent는 한 프로세스용이라 같은 SQLite 파일을 동시에 열면 락 충돌이 난다. 여럿이 공유하려면 서버 하나가 데이터를 맡아야 한다.' },
  ];

  const summary = [
    'In-Memory는 설정이 없어 빠르지만 프로세스가 끝나면 데이터도 함께 사라진다.',
    'Persistent는 add 즉시 sqlite3와 HNSW 파일에 써서 다시 열면 그대로 불러온다.',
    'chroma run이나 Docker로 서버를 띄우면 여러 앱이 HTTP로 같은 컬렉션을 공유한다.',
    '세 모드는 클라이언트를 만드는 한 줄만 다르니 작게 시작해 필요할 때 올린다.',
  ];
  const review = [
    { q: 'FastAPI 앱을 워커 4개로 띄우고 각자 PersistentClient로 같은 폴더를 열었더니 가끔 쓰기가 실패한다. 먼저 바꿀 것은 무엇인가?',
      o: ['Chroma 서버를 하나 띄우고 워커들은 HttpClient로 붙인다', 'In-Memory로 바꿔 락을 없앤다', '워커마다 n_results를 줄인다'], a: 0,
      why: 'Persistent는 단일 프로세스용이라 여러 프로세스가 같은 SQLite를 열면 충돌한다. 서버가 데이터를 혼자 맡고 나머지는 HTTP로 접근하면 된다.' },
    { q: '단위 테스트마다 깨끗한 Chroma가 필요하고 디스크에 흔적이 남으면 안 된다. 알맞은 클라이언트는 무엇인가?',
      o: ['HttpClient', 'chromadb.Client()', 'PersistentClient(path)'], a: 1,
      why: 'In-Memory는 서버도 파일도 없이 프로세스 안에서만 돌고 끝나면 사라진다. 테스트처럼 매번 새로 시작하는 곳에 맞다.' },
    { q: 'Docker로 띄운 Chroma 서버를 다시 만들었더니 컬렉션이 비었다. 가장 먼저 의심할 것은 무엇인가?',
      o: ['heartbeat 엔드포인트가 v1이라서', '클라이언트 쪽 임베딩 모델이 바뀌어서', '-v 볼륨 매핑 없이 컨테이너 안에만 저장해서'], a: 2,
      why: '서버는 --path 폴더에 데이터를 쓴다. 그 폴더를 호스트 볼륨에 매핑하지 않으면 컨테이너를 지울 때 데이터도 함께 지워진다.' },
  ];

  R.page({ title: 'Chroma 세 가지 운영 모드', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
