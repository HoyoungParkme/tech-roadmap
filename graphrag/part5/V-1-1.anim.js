/* V-1-1 Microsoft GraphRAG — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   인물 그래프와 4개 community 는 networkx 3.7 louvain_communities(seed=1)로 실제로 나눈 예시 그래프(노드 15·엣지 26, modularity 0.498)다.
   LLM 답변·인덱싱 로그 숫자는 페이지의 예시 출력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, cells, check, cross, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 그래프 도우미 ----------
  const TYPE = { P: [ACC, ACCBG], O: [INFO, INFOBG], X: [WARN, WARNBG] };
  function gnode(x, y, name, o) { o = o || {}; const [col, bg] = TYPE[o.t || 'P'], s = o.s ?? 1; if (s <= 0.02) return;
    const r = o.r || 15, g = G(x, y, s, o.op);
    if (o.hot) el('circle', { cx: 0, cy: 0, r: r + 7, fill: 'none', stroke: o.hotCol || col, 'stroke-width': 2, opacity: 0.6 }, g);
    el('circle', { cx: 0, cy: 0, r, fill: o.fill || bg, stroke: o.stroke || col, 'stroke-width': 2.2 }, g);
    if (name) tx(o.dx || 0, o.ny ?? r + 17, name, { 'text-anchor': 'middle', 'font-size': o.fs || 14, 'font-weight': 700, fill: o.color || INK }, g); }
  function gedge(a, b, u, o) { o = o || {}; if (u <= 0) return; const r = o.r || 15, d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
    const sx = a[0] + ux * r, sy = a[1] + uy * r, ex = b[0] - ux * r, ey = b[1] - uy * r;
    el('line', { x1: sx, y1: sy, x2: lerp(sx, ex, clamp(u)), y2: lerp(sy, ey, clamp(u)), stroke: o.col || GRID, 'stroke-width': o.sw || 2, opacity: o.op ?? 1 }); }

  // 예시 인물 그래프 (networkx 로 community 를 나눈 결과: A 창업기, B 픽사, C 복귀 후 애플, D 가족)
  const N = {
    jobs: [300, 232, '잡스', 'A'], apple: [120, 118, 'Apple', 'A', 'O'], woz: [235, 92, '워즈니악', 'A'], mark: [92, 205, '마쿨라', 'A'],
    pixar: [420, 112, '픽사', 'B', 'O'], lucas: [520, 70, '루카스필름', 'B', 'O'], cat: [590, 138, '캣멀', 'B'], las: [500, 190, '래스터', 'B'],
    ive: [420, 318, '아이브', 'C'], cook: [520, 268, '쿡', 'C'], fors: [590, 340, '포스톨', 'C'], iph: [500, 390, 'iPhone', 'C', 'O'],
    laur: [200, 320, '로런 파월', 'D'], paul: [90, 300, '폴 잡스', 'D'], clara: [130, 385, '클라라 잡스', 'D'],
  };
  const EDGES = [['jobs', 'woz'], ['jobs', 'mark'], ['woz', 'mark'], ['jobs', 'apple'], ['woz', 'apple'], ['mark', 'apple'],
    ['jobs', 'pixar'], ['cat', 'pixar'], ['las', 'pixar'], ['cat', 'las'], ['pixar', 'lucas'], ['cat', 'lucas'],
    ['jobs', 'ive'], ['jobs', 'cook'], ['jobs', 'fors'], ['ive', 'cook'], ['cook', 'fors'], ['ive', 'fors'], ['ive', 'iph'], ['fors', 'iph'], ['cook', 'iph'],
    ['jobs', 'laur'], ['jobs', 'paul'], ['laur', 'paul'], ['paul', 'clara'], ['laur', 'clara']];
  const COM = { A: [ACC, '창업기', 12], B: [INFO, '픽사', 47], C: [GOOD, '복귀 후 애플', 89], D: [WARN, '가족', 130] };
  const YY = (y) => 66 + (y - 70) * 0.84;
  function graph(o) { o = o || {}; const at = (k) => [N[k][0] + (o.dx || 0), YY(N[k][1])];
    if (o.regions) Object.keys(COM).forEach((cid, i) => { const ks = Object.keys(N).filter((k) => N[k][3] === cid), xs = ks.map((k) => at(k)[0]), ys = ks.map((k) => at(k)[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2 + 6, s = typeof o.regions === 'number' ? o.regions : 1;
      el('ellipse', { cx, cy, rx: (Math.max(...xs) - Math.min(...xs)) / 2 + 52, ry: (Math.max(...ys) - Math.min(...ys)) / 2 + 40, fill: COM[cid][0], opacity: 0.1 * s, stroke: COM[cid][0], 'stroke-width': 1.5, 'stroke-dasharray': '5 5', 'stroke-opacity': 0.6 * s }); });
    EDGES.forEach(([a, b], i) => { const hot = o.hotEdge && o.hotEdge(a, b); gedge(at(a), at(b), o.grow ? clamp(o.grow * EDGES.length - i) : 1, { col: hot ? ACC : GRID, sw: hot ? 3 : 2 }); });
    Object.keys(N).forEach((k, i) => { const [, , name, cid, t] = N[k], [x, y] = at(k), hot = o.hot && o.hot(k), dim = o.dim && !hot;
      gnode(x, y, name, { t: t === 'O' ? 'O' : 'P', hot, op: dim ? 0.35 : 1, s: o.pop ? o.pop(i) : 1, stroke: o.regions && !hot ? COM[cid][0] : null, fill: o.regions && !hot ? PANEL : null }); }); }

  // 위쪽 진행 막대: 페이지 데이터 stages (idle / active / done)
  const STAGE = ['설치·init', 'settings', '인덱싱', 'Local', 'Global'];
  function strip(c) { const st = c.beat.stages || [];
    STAGE.forEach((n, i) => { const s = (st[i] || {}).state, x = 610 + i * 70, col = s === 'done' ? GOOD : s === 'active' ? ACC : OFF;
      if (i) el('line', { x1: x - 52, y1: 20, x2: x - 18, y2: 20, stroke: s === 'idle' ? GRID : col, 'stroke-width': 2 });
      el('circle', { cx: x, cy: 20, r: 8, fill: s === 'idle' ? PANEL : col, stroke: col, 'stroke-width': 2 });
      tx(x, 44, n, { 'text-anchor': 'middle', 'font-size': 13.5, fill: s === 'idle' ? MUT : col, 'font-weight': 700 }); }); }
  const exam = (x, y, op) => pill(x, y, '예시', WARN, 1, { fs: 13.5, op: op ?? 1 });

  // ---------- 1. 설치 & 초기화: 터미널 + 폴더 골격 ----------
  const SH = [['# microsoft.github.io/graphrag', null], '$ python -m venv .venv', '$ pip install graphrag', '$ pip show graphrag', ['Version: 0.5.0', 'var(--term)'],
    '$ export OPENAI_API_KEY="sk-..."', '$ graphrag init --root ./demo', ['Initializing project at ./demo', 'var(--term)'], '$ cp steve_jobs_book.txt ./demo/input/'];
  const SHN = [1, 3, 5, 6, 8, 8, 9, 9];
  function fileRow(x, y, name, kind, o) { o = o || {}; const op = o.op ?? 1, col = o.col || INK;
    if (kind === 'dir') { el('path', { d: `M${x},${y - 9} h8 l3,3 h11 v14 h-22 z`, fill: o.fill || WARNBG, stroke: WARN, 'stroke-width': 1.6, opacity: op }); }
    else el('path', { d: `M${x + 2},${y - 10} h12 l5,5 v15 h-17 z`, fill: PANEL, stroke: o.icol || MUT, 'stroke-width': 1.6, opacity: op });
    mono(x + 30, y + 5, name, { 'font-size': 14.5, fill: col, opacity: op, 'font-weight': o.bold ? 700 : 400 });
    if (o.note) tx(x + 34 + tw(name, 14.5 * 1.0), y + 5, o.note, { 'font-size': 13.5, fill: MUT, opacity: op }); }
  function s1(t, c) { const { k, u } = c; strip(c);
    const n = SHN[k], prev = k ? SHN[k - 1] : 0, shown = n === prev ? n : lerp(prev, n, E(u, 0.2, 1.6));
    terminal(24, 62, 410, 330, SH, k === 0 ? fade(u, 0.2) : shown, { title: 'init.sh', fs: 14 });
    const X = 480, Y = 92, L = 34;
    if (k === 0) { tx(690, 210, '아직 아무것도 없다', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: fade(u, 0.8) });
      tx(690, 236, '파이프라인 다섯 칸이 모두 대기', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); return; }
    // .venv (k>=1) 와 graphrag 패키지
    if (k <= 3) { const s = k === 1 ? pop(u, 0.6) : 1; fileRow(X, Y, '.venv/', 'dir', { op: s });
      fileRow(X + 26, Y + L, 'graphrag', 'file', { op: k === 1 ? fade(u, 1.4) : 1, note: k >= 2 ? '0.5.0' : '', icol: ACC });
      if (k >= 2) { check(X + 230, Y + L, 9, k === 2 ? pop(u, 1.4) : 1); sub(690, Y + 100, 'Python 3.10 이상', k === 2 ? fade(u, 1.6) : 1, { 'font-size': 14 }); }
      if (k === 3) { card(690, 290, 300, 70, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.3), text: 'OPENAI_API_KEY\n(Azure OpenAI 도 같은 자리)', fs: 14.5 }); }
      return; }
    // demo/ 골격 (k>=4)
    const rows = [['demo/', 'dir', 0, ''], ['settings.yaml', 'file', 1, '설계도'], ['.env', 'file', 1, 'API 키'], ['prompts/', 'dir', 1, '템플릿 10개'],
      ['entity_extraction.txt', 'file', 2, ''], ['summarize_descriptions.txt', 'file', 2, ''], ['community_report.txt', 'file', 2, ''], ['input/', 'dir', 1, '']];
    rows.forEach(([nm, kind, d], i) => { const show = k === 4 ? (i === 0 || i === 7 ? pop(u, 0.4 + (i ? 0.5 : 0)) : 0) : k === 5 ? (i === 0 || i === 7 ? 1 : fade(u, 0.2 + i * 0.22)) : 1;
      if (show <= 0) return; const y = Y + i * L;
      if (d) el('path', { d: `M${X + 8 + (d - 1) * 26},${y - 22} V${y} h12`, fill: 'none', stroke: GRID, 'stroke-width': 1.5, opacity: show });
      fileRow(X + d * 26, y, nm, kind, { op: show, note: k >= 5 ? rows[i][3] : '', col: i >= 4 && i <= 6 ? ACC : INK }); });
    if (k >= 6) { const y = Y + 8 * L, s = k === 6 ? pop(u, 0.4) : 1; fileRow(X + 52, y, 'steve_jobs_book.txt', 'file', { op: s, icol: INFO, bold: true });
      mono(X + 52 + 30 + tw('steve_jobs_book.txt', 14.5) + 14, y + 5, '6.3 MB', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: k === 6 ? fade(u, 1) : 1 });
      el('path', { d: `M${X + 34},${y - 22} V${y} h12`, fill: 'none', stroke: GRID, 'stroke-width': 1.5, opacity: s }); }
    if (k === 7) banner(690, 400, '다음: settings.yaml 에서 모델·청크를 정한다', pop(u, 0.3)); }

  // ---------- 2. settings.yaml: 손잡이 하나씩 ----------
  const SEC = ['llm', 'embeddings', 'chunks', 'entity_extraction', 'community_reports', 'cluster_graph', 'input', 'storage'];
  const HOT = [[], [0], [1], [2], [3, 4], [5], [6, 7]];
  function s2(t, c) { const { k, u } = c; strip(c);
    // 왼쪽: 설정 파일 한 장
    el('rect', { x: 24, y: 62, width: 250, height: 340, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(40, 88, 'settings.yaml', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    SEC.forEach((s, i) => { const hot = HOT[k].includes(i), y = 122 + i * 36, op = k === 0 ? fade(u, 0.2 + i * 0.15) : 1;
      if (hot) el('rect', { x: 32, y: y - 19, width: 234, height: 28, rx: 6, fill: ACCBG, opacity: fade(u, 0.1) });
      mono(44, y, s + ':', { 'font-size': 14.5, fill: hot ? ACC : INK, 'font-weight': hot ? 700 : 400, opacity: op }); });
    const X = 330, cx = 620;
    if (k === 0) { tx(cx, 200, '이 한 장이 파이프라인 전체를 정한다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.6) });
      sub(cx, 232, '모델 · 청크 · 추출 강도 · 클러스터링 · 입출력', fade(u, 1.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { card(430, 160, 200, 64, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'gpt-4o-mini', fs: 17, mono: true, s: pop(u, 0.2) });
      sub(430, 212, 'max_tokens 4000', fade(u, 0.6), { 'font-size': 14 });
      for (let i = 0; i < 12; i++) { const y = 120 + (i % 4) * 22, x = 600 + Math.floor(i / 4) * 46, s = fade(u, 0.8 + i * 0.08); el('rect', { x, y, width: 36, height: 16, rx: 3, fill: WARNBG, stroke: WARN, 'stroke-width': 1.2, opacity: s }); }
      grow(532, 160, 590, 160, seg(u, 0.6, 1.1), ACC);
      tx(670, 238, '청크마다 한 번씩 부른다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(cx, 320, '호출이 가장 많은 곳이라 비용의 대부분이 여기서 정해진다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { card(420, 150, 210, 56, { rx: 12, stroke: INFO, sw: 2.2, fill: INFOBG, text: 'text-embedding-3-small', fs: 14.5, mono: true, s: pop(u, 0.2) });
      gnode(420, 270, '픽사', { t: 'O', s: pop(u, 0.6) }); grow(450, 270, 520, 270, seg(u, 0.8, 1.3), INFO);
      cells(530, 248, ['0.12', '-0.40', '0.07', '…', '0.31'], { w: 62, h: 42, fs: 14, style: () => ({ stroke: INFO, op: fade(u, 1.2) }) });
      sub(690, 318, '엔티티 이름·설명 → 벡터 (값은 예시)', fade(u, 1.5), { 'font-size': 14 });
      tx(cx, 372, '채팅 모델과 따로 설정한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { // 토큰 자: 1200 토큰 청크, 100 토큰 겹침
      const x0 = 330, W = 590, T = 3500, Xt = (v) => x0 + (v / T) * W;
      el('line', { x1: x0, y1: 300, x2: x0 + W, y2: 300, stroke: MUT, 'stroke-width': 1.8 });
      [0, 1100, 2200, 3300].forEach((v) => { el('line', { x1: Xt(v), y1: 300, x2: Xt(v), y2: 306, stroke: MUT }); mono(Xt(v), 324, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      tx(x0 + W, 350, '토큰 위치', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      [0, 1, 2].forEach((i) => { const a = i * 1100, b = a + 1200, y = 130 + i * 50, s = E(u, 0.2 + i * 0.4, 0.9 + i * 0.4);
        el('rect', { x: Xt(a), y, width: (Xt(b) - Xt(a)) * s, height: 34, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8 });
        if (s > 0.9) mono(Xt(a) + 12, y + 23, `청크 ${i + 1} · ${a}–${b}`, { 'font-size': 14, fill: ACC, 'font-weight': 700 });
        if (i && s > 0.2) { el('rect', { x: Xt(a), y: y - 16, width: Xt(1200) - Xt(1100), height: 50, fill: WARN, opacity: 0.35 }); } });
      tx(Xt(1150), 112, '겹침 100', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(cx, 390, '경계에 걸친 문장이 양쪽 청크에 다 남는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2) }); return; }
    if (k === 4) { // gleaning: 같은 청크를 한 번 더 훑는다
      card(420, 150, 170, 120, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 0.2) }); mono(420, 110, '청크 #142', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 0.3) });
      [0, 1, 2, 3].forEach((i) => el('line', { x1: 352, y1: 135 + i * 18, x2: 488, y2: 135 + i * 18, stroke: WARN, 'stroke-width': 3, opacity: 0.5 * fade(u, 0.3) }));
      pill(640, 110, '1차 추출 · 트리플 3', ACC, pop(u, 0.6), { fs: 14 }); pill(640, 170, '다시 훑기 · +1', ACC, pop(u, 1.2), { fs: 14 });
      el('path', { d: 'M500,170 C560,230 600,230 600,190', fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.1) });
      exam(800, 140, fade(u, 1.3));
      mono(330, 300, 'max_gleanings: 1', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); tx(520, 300, '올리면 더 잡지만 호출이 늘어 비싸진다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
      mono(330, 350, 'community_reports.max_length: 2000', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 5) { // 한 묶음 최대 10
      const cx0 = 470, cy0 = 230; el('circle', { cx: cx0, cy: cy0, r: 92, fill: ACC, opacity: 0.08, stroke: ACC, 'stroke-dasharray': '5 5' });
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, s = pop(u, 0.2 + i * 0.1); el('circle', { cx: cx0 + Math.cos(a) * 58, cy: cy0 + Math.sin(a) * 58, r: 11 * s, fill: ACCBG, stroke: ACC, 'stroke-width': 2 }); }
      mono(cx0, cy0 + 6, '10', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      const x2 = 720; el('circle', { cx: x2, cy: cy0, r: 70, fill: BAD, opacity: 0.06, stroke: BAD, 'stroke-dasharray': '5 5', 'stroke-opacity': fade(u, 1.5) });
      for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2; el('circle', { cx: x2 + Math.cos(a) * 44, cy: cy0 + Math.sin(a) * 44, r: 8, fill: BAD, opacity: 0.5 * fade(u, 1.5) }); }
      mono(x2, cy0 + 6, '11', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      tx(x2, cy0 + 100, '넘치면 더 잘게 쪼갠다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(cx0, cy0 + 122, 'max_cluster_size: 10 · 알고리즘은 기본값 Leiden', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1) }); return; }
    // k6 입출력
    fileRow(340, 160, 'input/', 'dir', { op: pop(u, 0.2) }); mono(370, 196, '*.txt', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4) });
    card(610, 170, 190, 64, { rx: 10, stroke: ACC, sw: 2.2, text: '인덱싱 파이프라인', fs: 15, s: pop(u, 0.6) });
    dot([[440, 170], [515, 170]], seg(u, 0.8, 1.4), ACC, 6); grow(440, 170, 512, 170, seg(u, 0.6, 1.0), MUT); grow(708, 170, 780, 170, seg(u, 1.2, 1.6), MUT);
    fileRow(790, 160, 'output/', 'dir', { op: pop(u, 1.6) }); mono(820, 196, '*.parquet', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
    banner(620, 320, 'settings.yaml 작성 끝 · 이제 인덱싱', pop(u, 2.0)); }

  // ---------- 3. 인덱싱: 책 → 청크 → 트리플 → 병합 → community → 리포트 ----------
  const PIPE = ['청크', '추출', '병합', 'community', '리포트'];
  function line5(k, u) { PIPE.forEach((p, i) => { const x = 110 + i * 175, on = k >= i + 1, now = k === i + 1;
      if (i) el('line', { x1: x - 125, y1: 82, x2: x - 50, y2: 82, stroke: on ? ACC : GRID, 'stroke-width': 2.5 });
      card(x, 82, 100, 34, { rx: 17, stroke: on ? ACC : GRID, fill: now ? ACC : on ? ACCBG : PANEL, color: now ? PANEL : on ? ACC : MUT, text: `${i + 1} ${p}`, fs: 14, sw: 2, s: now ? 1 + R.bump(u, 0.1) : 1 }); }); }
  function counter(x, y, label, v, col) { tx(x, y, label, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, 'text-anchor': 'middle' }); mono(x, y + 30, v, { 'font-size': 24, 'font-weight': 800, fill: col || INK, 'text-anchor': 'middle' }); }
  const f0 = (v) => Math.round(v).toLocaleString('en-US');
  function s3(t, c) { const { k, u } = c; strip(c);
    if (k <= 3) line5(k, u);
    if (k === 0) { terminal(220, 140, 520, 120, ['$ graphrag index --root ./demo', ['⠋ create_base_text_units …', 'var(--term)']], fade(u, 0.2) * 2, { title: 'index.sh' });
      tx(480, 320, '명령은 한 줄, 안에서는 다섯 공정이 차례로 돈다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(480, 350, '로그 숫자는 페이지의 예시 출력이다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 1) { el('rect', { x: 60, y: 150, width: 120, height: 160, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
      for (let i = 0; i < 9; i++) el('line', { x1: 74, y1: 170 + i * 15, x2: 166, y2: 170 + i * 15, stroke: INFO, 'stroke-width': 2.5, opacity: 0.45 });
      mono(120, 336, '책 1권', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700 });
      for (let i = 0; i < 40; i++) { const s = clamp(E(u, 0.2, 1.8) * 40 - i), x = 230 + (i % 10) * 44, y = 160 + Math.floor(i / 10) * 40;
        if (s > 0) el('rect', { x, y, width: 38, height: 32, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: s }); }
      grow(190, 230, 222, 230, seg(u, 0.1, 0.4), ACC);
      counter(800, 190, 'chunks', f0(lerp(0, 1432, E(u, 0.2, 1.8))), ACC); sub(800, 262, 'size 1200 · overlap 100', fade(u, 1.2), { 'font-size': 14 }); return; }
    if (k === 2) { card(170, 230, 250, 110, { rx: 10, stroke: WARN, fill: WARNBG, sw: 2 });
      mono(60, 200, '청크 #142', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
      tx(60, 232, '1986년 잡스는 루카스필름의', { 'font-size': 14.5 }); tx(60, 256, '그래픽스 부문을 인수했다', { 'font-size': 14.5 });
      gnode(400, 180, '잡스', { s: pop(u, 0.5) }); gnode(560, 280, '픽사', { t: 'O', s: pop(u, 0.8) });
      gedge([400, 180], [560, 280], seg(u, 1.0, 1.6), { col: ACC, sw: 2.5 });
      if (u > 1.5) { el('rect', { x: 430, y: 215, width: 104, height: 22, rx: 4, fill: PANEL, opacity: fade(u, 1.5) }); mono(482, 231, 'ACQUIRED', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
      exam(470, 340, fade(u, 1.8));
      counter(780, 150, 'LLM 호출', f0(lerp(0, 1432, E(u, 0.3, 2.0)))); counter(780, 230, 'entities', f0(lerp(0, 12840, E(u, 0.5, 2.2))), ACC); counter(780, 310, 'relationships', f0(lerp(0, 23107, E(u, 0.5, 2.2))), INFO); return; }
    if (k === 3) { const m = E(u, 0.4, 1.6), xs = [[250, 150, 'Steve Jobs'], [250, 300, '잡스'], [420, 225, 'Jobs']];
      xs.forEach(([x, y, nm], i) => gnode(lerp(x, 330, m), lerp(y, 225, m), m < 0.95 ? nm : null, { op: i && m > 0.9 ? 0 : 1, r: 22, hot: m > 0.95 && !i }));
      if (m > 0.95) mono(330, 278, 'STEVE JOBS', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      tx(330, 340, '같은 사람을 가리키는 이름을 하나로', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
      counter(760, 190, 'entities', f0(tween(12840, 8221, u)), ACC); sub(760, 262, '설명은 LLM 이 하나로 요약', fade(u, 1.2), { 'font-size': 14 }); return; }
    if (k === 4) { graph({ dx: 0, regions: E(u, 0.4, 1.4) });
      Object.keys(COM).forEach((cid, i) => { const [col, nm] = COM[cid]; pill(800, 140 + i * 50, nm, col, pop(u, 1.0 + i * 0.2), { fs: 14 }); });
      counter(800, 360, '전체 communities', f0(lerp(0, 156, E(u, 0.3, 1.6))), ACC); return; }
    if (k === 5) { graph({ regions: 1 });
      Object.keys(COM).forEach((cid, i) => { const [col, nm, no] = COM[cid], y = 140 + i * 62, s = pop(u, 0.3 + i * 0.3);
        card(800, y, 220, 52, { rx: 8, stroke: col, sw: 2, s }); mono(706, y - 4, `community ${no}`, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) });
        tx(706, y + 17, `${nm} 요약 리포트`, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.3) }); });
      exam(800, 400, fade(u, 1.6)); return; }
    if (k === 6 || k === 8) { const files = ['create_final_entities', 'create_final_relationships', 'create_final_communities', 'create_final_community_reports'];
      if (k === 6) { files.forEach((f, i) => { const y = 120 + i * 58, s = pop(u, 0.2 + i * 0.3); fileRow(120, y, f + '.parquet', 'file', { op: s, icol: GOOD, bold: i === 0 }); });
        card(780, 200, 230, 110, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 1.4) }); mono(780, 192, '47m 12s', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.5) });
        sub(780, 226, '전체 인덱싱 (예시 로그)', fade(u, 1.6), { 'font-size': 14 }); mono(120, 380, './demo/output/', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
      // k8 parquet 를 열어 본다
      mono(60, 90, 'pd.read_parquet(".../create_final_entities.parquet")', { 'font-size': 14.5, fill: MUT });
      const rows = [['title', 'type', 'description'], ['STEVE JOBS', 'PERSON', '애플 공동 창업자 …'], ['PIXAR', 'ORGANIZATION', '애니메이션 스튜디오 …'], ['…', '', '']];
      rows.forEach((r, i) => { const y = 140 + i * 50, op = i ? fade(u, 0.3 + i * 0.35) : 1;
        if (!i) el('rect', { x: 60, y: y - 28, width: 760, height: 42, rx: 6, fill: SOFT });
        r.forEach((v, j) => mono([80, 300, 520][j], y, v, { 'font-size': 15, 'font-weight': i ? 400 : 700, fill: i ? INK : MUT, opacity: op }));
        el('line', { x1: 60, y1: y + 18, x2: 820, y2: y + 18, stroke: GRID, opacity: op }); });
      tx(480, 370, '이름·타입·설명이 표로 남아 사람이 직접 검증할 수 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    // k7 비용
    const ax = 220, W = 560; tx(60, 130, 'gpt-4o-mini', { 'font-size': 16, 'font-weight': 700 }); tx(60, 210, 'gpt-4o', { 'font-size': 16, 'font-weight': 700 });
    el('rect', { x: ax, y: 112, width: Math.max(3, W / 16.7 * E(u, 0.2, 0.8)), height: 26, rx: 4, fill: GOOD });
    mono(ax + W / 16.7 + 10, 131, '약 $8 / 100MB', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.7) });
    el('rect', { x: ax, y: 192, width: W * E(u, 0.8, 1.9), height: 26, rx: 4, fill: BAD });
    mono(ax + W - 8, 211, '× 16.7', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end', opacity: fade(u, 1.8) });
    tx(480, 290, '토큰 단가 비 · 입력 $2.50 ÷ $0.15 = 16.7', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2) });
    sub(480, 320, '$8 은 페이지의 추정치, 임베딩은 따로 약 $0.4', fade(u, 2.2), { 'font-size': 14 }); }

  // ---------- 4. Local 쿼리: 질문 근처의 점 ----------
  const QL = '잡스가 픽사를 언제 어떻게 인수했나?';
  const nearLocal = (k) => ['jobs', 'pixar', 'lucas', 'cat', 'las'].includes(k);
  function s4(t, c) { const { k, u } = c; strip(c);
    graph({ dx: -20, hot: k >= 1 && k !== 5 && k !== 6 ? (n) => n === 'jobs' || n === 'pixar' : null, dim: k >= 1 && k <= 4,
      hotEdge: k >= 1 && k <= 4 ? (a, b) => (a === 'jobs' && b === 'pixar') || (nearLocal(a) && nearLocal(b) && (k > 1 || u > 1.2)) : null });
    if (k === 0) { fly(780, 80, 300, 232, seg(u, 0.8, 1.8), '질문', {}); card(780, 100, 300, 64, { rx: 10, stroke: ACC, sw: 2, text: QL, fs: 14.5, s: pop(u, 0.2) });
      mono(780, 160, '--method local', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); return; }
    if (k === 1) { [['① 질문 임베딩', 0.2], ['② top-K 엔티티', 0.6], ['③ 이웃 관계', 1.2], ['④ 원문 청크', 1.7]].forEach(([s, a], i) => pill(790, 110 + i * 56, s, i === 1 ? ACC : INK, pop(u, a), { fs: 14.5 }));
      [['#142', 250, 412], ['#218', 330, 412]].forEach(([nm, x, y], i) => { const s = pop(u, 1.8 + i * 0.2); card(x, y - 20, 60, 30, { rx: 4, stroke: WARN, fill: WARNBG, text: nm, fs: 13.5, mono: true, s, sw: 1.8 }); }); return; }
    if (k === 2 || k === 3 || k === 4) { const s = k === 2 ? pop(u, 0.2) : 1;
      card(790, 200, 300, 230, { rx: 12, stroke: ACC, sw: 2, s, fill: PANEL });
      if (s > 0.6) { mono(660, 110, 'LOCAL', { 'font-size': 13.5, fill: ACC, 'font-weight': 800 }); exam(880, 105);
        ['1986년 루카스필름 그래픽스', '부문을 1,000만 달러에', '인수해 픽사로 바꿨다.', '이후 5천만 달러를 더', '넣고 회장을 맡았다.'].forEach((l, i) => tx(660, 142 + i * 24, l, { 'font-size': 14.5, opacity: k === 2 ? fade(u, 0.5 + i * 0.25) : 1 })); }
      if (k >= 3) ['entity: Steve_Jobs', 'entity: Pixar', 'chunks #142 · #218'].forEach((s2, i) => card(790, 340 + i * 26 - 26, 260, 22, { rx: 11, stroke: 'none', fill: WARNBG, text: s2, fs: 13.5, mono: true, color: WARN, s: k === 3 ? pop(u, 0.3 + i * 0.3) : 1 }));
      if (k === 4) { el('circle', { cx: 400, cy: 170, r: 150, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 0.3) });
        tx(380, 410, '질문 근처만 본다 · "전체 인물망은?" 에는 약하다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1) }); }
      return; }
    if (k === 5) { R.snippet(560, 90, ['from graphrag.cli.query import run_local_search', 'response, context = run_local_search(', '    root_dir=Path("./demo"), community_level=2,', '    query="잡스가 픽사를 …", ...)'], { fs: 13.5, op: fade(u, 0.3) });
      tx(745, 290, 'CLI 옵션과 인자가 일대일로 맞는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); return; }
    R.meters(600, 150, 330, [{ name: '응답 시간', val: '~3초' }, { name: '한 질문 비용', val: '$0.001', good: true }]);
    tx(765, 280, 'top-K 검색 1번 + LLM 1번', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
    sub(765, 308, '페이지의 예시 수치 (mini 기준)', fade(u, 1), { 'font-size': 14 }); }

  // ---------- 5. Global 쿼리: community 리포트를 map → reduce ----------
  const QG = '이 책에서 잡스의 핵심 인물망은?';
  const CARD = (i) => [720, 90 + i * 64];
  function s5(t, c) { const { k, u } = c; strip(c);
    if (k <= 3) graph({ dx: -40, regions: 1 });
    const ids = Object.keys(COM);
    if (k === 0) { card(750, 140, 300, 64, { rx: 10, stroke: ACC, sw: 2, text: QG, fs: 14.5, s: pop(u, 0.2) });
      mono(750, 200, '--method global', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(750, 290, '점 하나가 아니라 면 전체를 묻는 질문', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); return; }
    if (k === 1 || k === 2 || k === 3) { ids.forEach((cid, i) => { const [col, nm, no] = COM[cid], [x, y] = CARD(i);
        card(x, y, 150, 48, { rx: 8, stroke: col, sw: 2, text: `#${no} ${nm}`, fs: 14, color: col, s: k === 1 ? pop(u, 0.2 + i * 0.2) : 1 });
        if (k === 1) { fly(560, 40, x - 80, y, seg(u, 0.6 + i * 0.25, 1.3 + i * 0.25), 'Q', { fill: ACC });
          card(x + 135, y, 90, 30, { rx: 15, stroke: col, fill: PANEL, text: '부분답', fs: 13.5, color: col, s: pop(u, 1.4 + i * 0.25), sw: 1.6 }); }
        if (k === 2) dot([[x + 75, y], [870, 210]], seg(u, 0.2 + i * 0.15, 1.0 + i * 0.15), col, 7); });
      if (k === 1) tx(720, 380, 'Map · 리포트마다 부분 답', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      if (k >= 2) { const s = k === 2 ? pop(u, 1.1) : 1; card(880, 210, 150, 150, { rx: 12, stroke: INK, sw: 2.5, s });
        if (s > 0.5) ['4개 축', '① 창업기', '② 픽사', '③ 복귀 후', '④ 가족'].forEach((l, i) => tx(880, 166 + i * 23, l, { 'text-anchor': 'middle', 'font-size': i ? 14 : 15, 'font-weight': i ? 600 : 800, opacity: k === 2 ? fade(u, 1.3 + i * 0.15) : 1 }));
        exam(880, 310, k === 2 ? fade(u, 1.8) : 1);
        if (k === 2) tx(720, 380, 'Reduce · 하나의 답으로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
      if (k === 3) { mono(720, 380, 'Sources: community 12 · 47 · 89 · 130', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
        tx(720, 406, '출처가 엔티티가 아니라 community', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) }); }
      return; }
    if (k === 4) { // community 수만큼 호출
      tx(60, 90, 'Map 단계 호출 = 고른 community 리포트 수', { 'font-size': 16, 'font-weight': 700 });
      const n = Math.round(lerp(0, 156, E(u, 0.2, 1.8)));
      for (let i = 0; i < 156; i++) { const x = 60 + (i % 26) * 22, y = 120 + Math.floor(i / 26) * 22; el('rect', { x, y, width: 18, height: 18, rx: 3, fill: i < n ? WARN : SOFT, opacity: i < n ? 0.85 : 1 }); }
      counter(780, 150, '이 예시의 community', String(n), WARN);
      card(780, 300, 230, 70, { rx: 10, stroke: ACC, sw: 2, text: 'Local\n검색 1 + LLM 1', fs: 14.5, s: pop(u, 1.8) });
      tx(330, 280, '리포트가 많을수록 비싸지만 전체 그림이 나온다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2) }); return; }
    if (k === 5) { R.snippet(80, 110, ['from graphrag.cli.query import run_global_search', 'response, context = run_global_search(', '    root_dir=Path("./demo"),', '    community_level=2,   # 0=루트, 클수록 잘게', '    query="이 책에서 잡스의 핵심 인물망은?", ...)'], { fs: 14, op: fade(u, 0.3) });
      tx(480, 330, 'local 과 같은 인자에 community_level 이 더해진다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); return; }
    if (k === 6) { // 계층 깊이
      const lv = [[0, 1], [1, 3], [2, 6], [3, 10], [4, 14]];
      lv.forEach(([l, n], r) => { const y = 100 + r * 62, on = l === 2, s = fade(u, 0.2 + r * 0.25);
        mono(70, y + 5, `level ${l}`, { 'font-size': 15, 'font-weight': on ? 800 : 600, fill: on ? ACC : l === 0 || l === 4 ? INK : MUT, opacity: s });
        for (let i = 0; i < n; i++) { const w = 560 / n, x = 200 + i * w; el('rect', { x: x + 3, y: y - 14, width: w - 6, height: 28, rx: 6, fill: on ? ACCBG : SOFT, stroke: on ? ACC : GRID, 'stroke-width': on ? 2 : 1.2, opacity: s }); } });
      tx(820, 105, '빠름 · 굵게', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); tx(820, 229, '기본값', { 'font-size': 14.5, fill: ACC, 'font-weight': 800, opacity: fade(u, 1.6) }); tx(820, 353, '느림 · 잘게', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      sub(480, 405, '칸 수는 모양만 보여 주는 그림이다', fade(u, 2), { 'font-size': 13.5 }); return; }
    // k7 토글
    const on = E(u, 0.6, 1.4); el('rect', { x: 360, y: 130, width: 240, height: 56, rx: 28, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    el('rect', { x: lerp(364, 482, on), y: 134, width: 114, height: 48, rx: 24, fill: ACC });
    tx(421, 165, 'Local', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: on < 0.5 ? PANEL : MUT }); tx(539, 165, 'Global', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: on >= 0.5 ? PANEL : MUT });
    card(300, 290, 230, 70, { rx: 10, stroke: ACC, sw: 2, text: '점 · 좁은 사실\n출처 = 엔티티·청크', fs: 14.5, s: pop(u, 1.4) });
    card(660, 290, 230, 70, { rx: 10, stroke: INFO, sw: 2, text: '면 · 전체 그림\n출처 = community', fs: 14.5, s: pop(u, 1.7) });
    tx(480, 390, '두 결과를 캐싱해 두고 화면에서 골라 보게 한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'graphrag 0.5에서 작업 폴더 골격(settings.yaml·.env·prompts/)을 만드는 명령은 무엇인가?',
      o: ['graphrag init --root ./demo', 'pip install graphrag --init', 'graphrag query --init'], a: 0,
      why: 'init이 settings.yaml, .env, 프롬프트 템플릿 10개를 만든다. pip는 패키지만 설치한다.' },
    { q: 'chunks.size 1200, overlap 100이면 두 번째 청크는 몇 번째 토큰부터 시작하는가?',
      o: ['100번째', '1200번째', '1100번째'], a: 2,
      why: '앞 청크 끝 100토큰을 겹쳐 가져가므로 1100에서 시작해 2300까지 간다. 경계에 걸친 문장이 양쪽에 남는다.' },
    { q: '인덱싱 3단계에서 엔티티가 12,840개에서 8,221개로 줄어드는 까닭은 무엇인가?',
      o: ['LLM이 중요하지 않은 엔티티를 버려서', '같은 대상을 가리키는 엔티티를 하나로 합쳐서', 'community 하나에 10개까지만 넣어서'], a: 1,
      why: 'Steve Jobs, 잡스, Jobs처럼 표기만 다른 엔티티를 병합하고 설명을 요약한다. 크기 제한은 community 단계의 이야기다.' },
    { q: 'Local 쿼리가 "잡스가 픽사를 언제 인수했나?" 에 답할 때 프롬프트에 모으는 것은 무엇인가?',
      o: ['질문과 가까운 엔티티, 그 관계, 원문 청크', 'community 리포트 전부', '입력 파일 전체 텍스트'], a: 0,
      why: '질문 임베딩으로 top-K 엔티티를 찾고 이웃 관계와 청크 #142·#218 같은 원문을 붙인다. 그래서 출처가 분명하다.' },
    { q: 'Global 쿼리의 비용이 Local보다 큰 까닭은 무엇인가?',
      o: ['임베딩 모델이 더 비싸서', '청크를 처음부터 다시 잘라서', '리포트마다 LLM을 부르고 다시 합쳐서'], a: 2,
      why: '리포트마다 부분 답을 만들고 다시 합친다. 호출 수가 community 수에 비례한다.' },
  ];

  const summary = [
    'graphrag init이 settings.yaml, .env, 프롬프트 템플릿을 만들고 input 폴더에 원문을 넣으면 준비가 끝난다.',
    'settings.yaml 한 장이 인덱싱 모델, 청크 1200토큰과 겹침 100, 클러스터 크기 10을 정한다.',
    '인덱싱은 청크, 추출, 병합, community, 리포트 다섯 공정을 돌고 결과를 parquet로 남긴다.',
    'Local은 질문 근처 엔티티와 원문으로 좁은 사실에 답하고, Global은 community 리포트를 모아 전체 그림을 만든다.',
  ];
  const review = [
    { q: '인덱싱 비용을 줄이려고 settings.yaml에서 가장 먼저 볼 곳은 어디인가?',
      o: ['storage.base_dir', 'input.file_pattern', 'llm.model과 max_gleanings'], a: 2,
      why: '청크마다 LLM을 부르는 추출이 비용의 대부분이다. 모델 단가와 다시 훑는 횟수가 호출 비용을 정한다.' },
    { q: '"이 책 전체에서 반복되는 주제는?" 을 local로 물었더니 답이 한쪽에 치우쳤다. 먼저 바꿀 것은?',
      o: ['--method global로 바꿔 community 리포트를 모은다', 'chunks.size를 2배로 키운다', 'top-K를 1로 줄인다'], a: 0,
      why: 'local은 질문 근처 엔티티만 본다. 문서 전체를 가로지르는 질문은 리포트를 map-reduce 하는 global의 몫이다.' },
    { q: 'global 답이 너무 뭉뚱그려져 나온다. 바꿔 볼 만한 것은?',
      o: ['max_cluster_size를 1로', 'community_level을 더 깊게', 'embeddings 모델 삭제'], a: 1,
      why: 'level이 깊을수록 더 잘게 나뉜 community 리포트를 본다. 대신 리포트가 늘어 느리고 비싸진다.' },
  ];

  R.page({ title: 'GraphRAG 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
