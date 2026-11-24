/* II-1-1 Document Loading — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽 원본(PDF 쪽, HTML 소스, md 파일, 논문 쪽, 폴더) → 가운데 로더 → 오른쪽 Document 카드(page_content + metadata).
 * 맨 아래 선반에는 지금까지 만든 Document 가 쌓인다(STEPS 의 producedIds).
 * 숫자: 42쪽·page 0·total_pages 42, 파일 7개(pdf 3·html 2·md 2) 는 페이지 데이터와 코드에서 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, G, card, mono, sub, lbl, pill, grow, dot, zone, cross, check, terminal, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 그림 ----------
  // 파일 아이콘 (가운데 기준). kind 띠 색은 형식마다 다르다
  function fileIcon(cx, cy, kind, col, name, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1), w = 62, h = 78;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 16} L${w / 2},${-h / 2 + 16} V${h / 2} H${-w / 2} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2 }, g);
    el('path', { d: `M${w / 2 - 16},${-h / 2} V${-h / 2 + 16} H${w / 2}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 1.6 }, g);
    [-24, -15, -6].forEach((y) => el('line', { x1: -w / 2 + 10, y1: y, x2: w / 2 - 14, y2: y, stroke: OFF, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g));
    el('rect', { x: -w / 2, y: 6, width: w, height: 22, fill: col }, g);
    tx(0, 22, kind, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: PANEL }, g);
    if (name) tx(0, h / 2 + 20, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono' }, g);
    return g; }
  // Document 카드 (왼쪽 위 기준). d = { tag, col, lines, meta:[[k,v]] }. o.mn = 보이는 meta 줄 수(소수 가능)
  function docCard(x, y, w, d, o) { o = o || {}; const lh = 20, nl = d.lines.length, nm = (d.meta || []).length;
    const h = 34 + nl * lh + (nm ? 12 + nm * lh : 0) + 8, g = G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: 0, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || d.col || INK, 'stroke-width': o.sw || 2 }, g);
    el('rect', { x: 0, y: 0, width: w, height: 26, rx: 8, fill: d.col || INK }, g); el('rect', { x: 0, y: 16, width: w, height: 10, fill: d.col || INK }, g);
    tx(10, 18, d.tag, { 'font-size': 13.5, 'font-weight': 800, fill: PANEL }, g);
    if (o.badge) tx(w - 10, 18, o.badge, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'end', class: 'mono' }, g);
    d.lines.forEach((s, i) => mono(10, 44 + i * lh, s, { 'font-size': 13.5 }, g));
    if (nm) { const y0 = 34 + nl * lh + 4; el('line', { x1: 8, y1: y0, x2: w - 8, y2: y0, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, g);
      d.meta.forEach(([k, v], i) => { const op = clamp((o.mn ?? nm) - i); if (op <= 0) return;
        mono(10, y0 + 18 + i * lh, k + ':', { 'font-size': 13.5, fill: MUT, opacity: op }, g); mono(10 + tw(k + ': ', 13.5), y0 + 18 + i * lh, v, { 'font-size': 13.5, 'font-weight': 700, fill: o.metaCol || INFO, opacity: op }, g); }); }
    return h; }
  // 로더 판 (가운데 기준)
  function loader(cx, cy, name, args, o) { o = o || {}; const w = o.w || 250;
    card(cx, cy, w, args ? 70 : 46, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.4, s: o.s, op: o.op });
    tx(cx, cy - (args ? 9 : -6), name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: o.s == null ? 1 : clamp(o.s * 2) });
    if (args) mono(cx, cy + 18, args, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: o.s == null ? 1 : clamp(o.s * 2) }); }
  // 맨 아래 선반: 지금까지 만든 Document id 들. 이번 beat 에 새로 생긴 것은 튀어나온다
  const KIND = { pdf: ['PDF', WARN], html: ['HTML', INFO], md: ['MD', GOOD], mm: ['논문', ACC] };
  function shelf(c, at) { const ids = c.beat.producedIds || [], prev = c.prev ? c.prev.producedIds || [] : ids;
    el('line', { x1: 20, y1: 384, x2: 940, y2: 384, stroke: GRID, 'stroke-width': 1.5 });
    tx(24, 408, '쌓인 Document', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    let x = 140, fresh = 0;
    ids.forEach((id) => { const [, col] = KIND[id.split('-')[0]], w = tw(id, 13.5) + 26, isNew = !prev.includes(id);
      const s = isNew ? pop(c.u, (at ?? 1.6) + 0.2 * fresh++) : 1; pill(x + w / 2, 403, id, col, s, { fs: 13.5, mono: true }); x += w + 8; });
    mono(940, 408, `${ids.length}개`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: MUT }); }

  // ---------- 1. PDF ----------
  const PDF_RAW = ['%PDF-1.4', '1 0 obj << /Type /Catalog ...', 'stream', '  Tj (제1장 인사규정) ET', '  Tj (1.1 근무시간은 09:00~18:00) ET', 'endstream', 'xref ... 42 pages'];
  const DOC0 = { tag: 'Document  docs[0]', col: WARN, lines: ['제1장 인사규정', '1.1 근무시간은 09:00 ~ 18:00', '    으로 한다.'], meta: [['source', '"data/hr_policy.pdf"'], ['page', '0'], ['total_pages', '42']] };
  function pageStack(cx, cy, n, col) { for (let i = n - 1; i >= 0; i--) el('rect', { x: cx - 31 + i * 5, y: cy - 39 - i * 5, width: 62, height: 78, rx: 3, fill: PANEL, stroke: i ? OFF : col, 'stroke-width': 1.6 }); }
  function s1(t, c) { const { k, u } = c; shelf(c);
    if (k === 0) {
      terminal(24, 26, 320, 210, PDF_RAW.map((s, i) => (i === 3 || i === 4 ? [s, 'var(--hl)'] : s)), lerp(0, 7, E(u, 0.2, 1.4)), { title: 'hr_policy.pdf (바이너리)', fs: 13.5 });
      pageStack(184, 300, 3, WARN); fileIcon(184, 300, 'PDF', WARN, null);
      mono(240, 300, '42쪽', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      sub(184, 368, '글자가 바이너리 안에 묻혀 있다', fade(u, 1.0));
      loader(530, 150, 'PyPDFLoader', '("data/hr_policy.pdf")', { s: pop(u, 1.2), w: 270 });
      grow(240, 290, 400, 180, E(u, 1.6, 2.1), MUT, { dash: '6 5' });
      zone(680, 60, 250, 250, 'docs', { fill: 'none', stroke: GRID, dash: '6 5', op: fade(u, 1.9) });
      tx(805, 180, '아직 비어 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) });
      sub(805, 206, '로더만 만들고 읽지 않았다', fade(u, 2.2)); return; }
    if (k === 1) { pageStack(110, 190, 3, WARN); fileIcon(110, 190, 'PDF', WARN, 'hr_policy.pdf');
      loader(380, 190, 'PyPDFLoader', null, { w: 190 }); mono(380, 240, 'loader.load()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) });
      for (let i = 0; i < 6; i++) { const a = 0.3 + i * 0.22, f = E(u, a, a + 0.9); if (f <= 0 || f >= 1) continue;
        const x = f < 0.5 ? lerp(140, 380, f * 2) : lerp(380, 700, (f - 0.5) * 2), y = 190 + Math.sin(f * Math.PI) * -30;
        el('rect', { x: x - 14, y: y - 18, width: 28, height: 36, rx: 3, fill: PANEL, stroke: WARN, 'stroke-width': 2 }); }
      const n = Math.round(lerp(0, 42, E(u, 0.5, 2.2))), shown = Math.min(5, Math.ceil(n / 8.4));
      for (let i = shown - 1; i >= 0; i--) { const x = 640 + i * 12, y = 90 + i * 12;
        el('rect', { x, y, width: 220, height: 150, rx: 8, fill: PANEL, stroke: i ? OFF : WARN, 'stroke-width': i ? 1.5 : 2.4 }); }
      if (shown) { el('rect', { x: 640, y: 90, width: 220, height: 26, rx: 8, fill: WARN }); tx(652, 108, 'Document  p.0', { 'font-size': 13.5, 'font-weight': 800, fill: PANEL });
        mono(652, 140, '제1장 인사규정', { 'font-size': 13.5 }); mono(652, 162, '1.1 근무시간은 ...', { 'font-size': 13.5, fill: MUT }); }
      mono(760, 300, `len(docs) = ${n}`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
      sub(760, 330, '1쪽 = Document 1개', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 2) { pageStack(110, 160, 3, WARN); fileIcon(110, 160, 'PDF', WARN, 'hr_policy.pdf');
      el('rect', { x: 76, y: 116, width: 62, height: 78, rx: 3, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.3) });
      sub(110, 262, '첫 쪽 = page 0', fade(u, 0.4), { fill: ACC, 'font-weight': 700 });
      grow(160, 160, 380, 160, E(u, 0.4, 0.9), ACC);
      const h = docCard(400, 60, 380, DOC0, { mn: lerp(0, 3, E(u, 1.0, 2.2)), s: pop(u, 0.5) });
      tx(800, 100, '← page_content', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 0.8) });
      tx(800, 60 + h - 40, '← metadata', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
      sub(590, 60 + h + 30, 'source·page는 로더가 알아서 채운다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 3) { // unstructured hi_res: 쪽 배치를 읽어 요소로 나눈다
      el('rect', { x: 40, y: 40, width: 300, height: 330, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      el('rect', { x: 64, y: 62, width: 170, height: 16, rx: 3, fill: INK });
      [96, 112, 128].forEach((y) => el('line', { x1: 64, y1: y, x2: 316, y2: y, stroke: OFF, 'stroke-width': 4, 'stroke-linecap': 'round' }));
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) el('rect', { x: 64 + q * 84, y: 156 + r * 24, width: 84, height: 24, fill: r ? PANEL : SOFT, stroke: MUT, 'stroke-width': 1.2 });
      el('rect', { x: 64, y: 248, width: 252, height: 100, rx: 4, fill: SOFT, stroke: MUT, 'stroke-width': 1.2 });
      el('circle', { cx: 120, cy: 298, r: 22, fill: 'none', stroke: MUT, 'stroke-width': 2 }); el('path', { d: 'M170,330 L215,270 L250,310 L280,285 L306,330 Z', fill: OFF });
      const BX = [[56, 54, 186, 32, 'Title', INK], [56, 88, 268, 48, 'NarrativeText', INFO], [56, 148, 268, 88, 'Table', WARN], [56, 242, 268, 112, 'Image', ACC]];
      BX.forEach(([x, y, w, h, name, col], i) => { const a = 0.3 + i * 0.35, f = E(u, a, a + 0.4); if (f <= 0) return;
        el('rect', { x, y, width: w * f, height: h, rx: 4, fill: 'none', stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': '7 4' });
        pill(470 + 20, 92 + i * 52, name, col, pop(u, a + 0.3), { fs: 14.5, mono: true }); grow(x + w + 6, y + h / 2, 420, 92 + i * 52, E(u, a + 0.2, a + 0.5), col === INK ? MUT : col, { sw: 1.6, plain: true }); });
      card(760, 120, 300, 70, { rx: 10, stroke: INK, text: 'UnstructuredPDFLoader\nstrategy="hi_res"', fs: 14.5, mono: true, s: pop(u, 0.2) });
      tx(760, 200, 'OCR + 레이아웃 분석', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      sub(760, 228, '표·그림이 섞인 쪽도 구역별로 나눈다', fade(u, 1.9), { 'font-size': 14.5 });
      sub(760, 256, 'PyPDFLoader는 쪽 글자를 한 덩어리로 뽑는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k 4: 어떤 로더든 같은 모양
    loader(170, 110, 'PyPDFLoader', null, { w: 220, s: pop(u, 0.2) }); loader(170, 200, 'UnstructuredPDFLoader', null, { w: 260, s: pop(u, 0.4) });
    sub(170, 268, '그 밖의 로더 …', fade(u, 0.6), { 'font-size': 15 });
    grow(300, 110, 520, 170, E(u, 0.7, 1.1), ACC); grow(300, 200, 520, 180, E(u, 0.8, 1.2), ACC); grow(250, 262, 520, 190, E(u, 0.9, 1.3), MUT, { dash: '5 4' });
    const g = G(0, 0, 1, fade(u, 1.2));
    el('rect', { x: 540, y: 90, width: 360, height: 190, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.4 }, g);
    tx(560, 120, 'Document', { 'font-size': 18, 'font-weight': 800 }, g);
    el('rect', { x: 560, y: 136, width: 320, height: 52, rx: 8, fill: SOFT }, g); mono(574, 168, 'page_content: str', { 'font-size': 16, 'font-weight': 700 }, g);
    el('rect', { x: 560, y: 200, width: 320, height: 52, rx: 8, fill: INFOBG }, g); mono(574, 232, 'metadata: dict', { 'font-size': 16, 'font-weight': 700, fill: INFO }, g);
    tx(720, 320, 'Splitter · Embedding · VectorStore는 이 모양만 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); }

  // ---------- 2. HTML ----------
  const HTML_RAW = ['<html lang="ko">', '  <head><title>RAG 입문</title></head>', '  <body>', '    <nav>...메뉴...</nav>', '    <article>', '      <h1>RAG는 무엇인가?</h1>', '      <p>검색 증강 생성(Retrieval...</p>', '    </article>', '    <script>analytics(...)</script>', '  </body>', '</html>'];
  const KEEP = [4, 5, 6, 7], DROP = [1, 3, 8];
  function htmlSrc(u, mode, o) { o = o || {}; browser(205, 190, 370, 330, null, {}); mono(60, 46, 'blog.example.com/rag-intro', { 'font-size': 13.5, fill: MUT });
    HTML_RAW.forEach((s, i) => { const y = 80 + i * 26, keep = KEEP.includes(i), drop = DROP.includes(i), f = mode ? fade(u, 0.4 + i * 0.06) : 1;
      if (mode && keep) el('rect', { x: 30, y: y - 17, width: 350, height: 24, rx: 4, fill: GOODBG, opacity: f });
      const shown = o.typing != null ? clamp(o.typing - i) : 1; if (shown <= 0) return;
      mono(36, y, s, { 'font-size': 13.5, fill: mode && drop ? OFF : mode && !keep ? MUT : INK, 'text-decoration': mode && drop && f > 0.5 ? 'line-through' : null, opacity: shown });
      if (o.title && i === 1) el('rect', { x: 30, y: y - 17, width: 350, height: 24, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2.4, opacity: o.title }); }); }
  const HDOC = { tag: 'Document  html-1', col: INFO, lines: ['RAG는 무엇인가?', '검색 증강 생성(Retrieval', 'Augmented Generation) ...'], meta: [['source', '"https://blog.example.com/rag-intro"']] };
  function s2(t, c) { const { k, u } = c; shelf(c);
    if (k === 0) { htmlSrc(u, false, { typing: lerp(0, 11, E(u, 0.2, 1.6)) });
      loader(660, 130, 'WebBaseLoader', 'web_paths=[URL]', { s: pop(u, 1.4), w: 260 }); pill(660, 210, 'import bs4', INFO, pop(u, 1.7), { mono: true, fs: 14.5 });
      sub(660, 260, '본문 외에 nav·script·head도 섞여 있다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) { htmlSrc(u, true);
      const f = E(u, 0.2, 0.7); el('path', { d: 'M490,90 H830 L700,200 V250 H620 V200 Z', fill: SOFT, stroke: INK, 'stroke-width': 2.2, opacity: f });
      mono(660, 125, 'SoupStrainer', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: f });
      mono(660, 150, '["article","h1","h2","p"]', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: f });
      tx(660, 290, '통과: article · h1 · p', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      tx(660, 318, '버림: head · nav · script', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) });
      sub(660, 350, 'parse_only에 든 태그만 파싱한다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { htmlSrc(u, true, {}); loader(560, 120, 'WebBaseLoader', null, { w: 190 });
      dot([[390, 190], [470, 140], [560, 140], [620, 150]], E(u, 0.2, 1.0), INFO, 7);
      docCard(600, 150, 330, HDOC, { s: pop(u, 1.0), mn: 0 });
      sub(560, 76, 'URL을 받아 본문만 남긴다', fade(u, 0.3), { 'font-size': 14.5 });
      sub(765, 330, 'aload()로 여러 URL을 동시에 받을 수도 있다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { htmlSrc(u, true, { title: fade(u, 0.3) });
      docCard(450, 60, 470, HDOC, { mn: lerp(0, 1, E(u, 0.5, 1.0)) });
      const y = 60 + 34 + 60 + 4 + 18 + 20; // 다음 meta 자리
      mono(460, y + 2, 'title:', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1) }); mono(518, y + 2, '없음', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      cross(580, y - 3, 8, pop(u, 1.2));
      tx(450, 270, '<title> 줄도 parse_only에 걸러져서', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(450, 296, 'title 메타가 생기지 않았다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      pill(640, 340, '목록에 "title" 을 더하면 들어온다', GOOD, pop(u, 2.2), { fs: 14 }); return; }
    // k 4: 사이트 통째로 — RecursiveUrlLoader
    const root = [200, 200], L1 = [[420, 100], [420, 200], [420, 300]], L2 = [[640, 70], [640, 130], [640, 180], [640, 230], [640, 280], [640, 330]];
    card(root[0], root[1], 190, 44, { rx: 8, stroke: INFO, text: 'docs.example.com', fs: 14, mono: true, s: pop(u, 0.2) });
    L1.forEach((p, i) => { grow(root[0] + 96, root[1], p[0] - 60, p[1], E(u, 0.5 + i * 0.1, 0.9 + i * 0.1), INFO, { sw: 1.8 }); card(p[0], p[1], 110, 36, { rx: 8, stroke: INFO, text: `/page${i + 1}`, fs: 13.5, mono: true, s: pop(u, 0.8 + i * 0.1) }); });
    L2.forEach((p, i) => { const par = L1[Math.floor(i / 2)]; grow(par[0] + 56, par[1], p[0] - 48, p[1], E(u, 1.2 + i * 0.08, 1.5 + i * 0.08), MUT, { sw: 1.6 }); card(p[0], p[1], 92, 30, { rx: 7, stroke: MUT, text: '…', fs: 13.5, s: pop(u, 1.4 + i * 0.08) }); });
    mono(420, 370, 'depth 1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); mono(640, 370, 'depth 2 (max_depth=2)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
    [['robots.txt 지키기', 120], ['요청 속도 제한', 190], ['라이선스 확인', 260]].forEach(([s, y], i) => { check(778, y, 9, pop(u, 1.9 + i * 0.2)); tx(796, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9 + i * 0.2) }); }); }

  // ---------- 3. Markdown ----------
  const MD_RAW = ['---', 'title: "RAG 입문"', 'author: "박서연"', 'tags: [rag, llm, vectorstore]', 'date: 2026-05-01', '---', '# RAG 는 무엇인가?', '검색 증강 생성(...)은', '외부 지식을 LLM 답변에 결합하는 패턴이다.', '## 핵심 구성', '- Loader : 다양한 형식 → Document', '- Splitter / Embedding / VectorStore'];
  function mdFile(x, y, u, o) { o = o || {}; const lh = 24;
    el('rect', { x, y, width: 360, height: MD_RAW.length * lh + 44, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(x + 14, y + 22, 'docs/rag-intro.md', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    MD_RAW.forEach((s, i) => { const yy = y + 48 + i * lh, front = i < 6, op = front ? o.frontOp ?? 1 : o.bodyOp ?? 1, sh = o.typing != null ? clamp(o.typing - i) : 1;
      if (front && o.hiFront) el('rect', { x: x + 6, y: yy - 17, width: 348, height: lh, fill: WARNBG, opacity: o.hiFront * op });
      if (sh > 0 && op > 0) mono(x + 14, yy, s, { 'font-size': 13.5, fill: front ? WARN : s.startsWith('#') ? ACC : INK, 'font-weight': s.startsWith('#') ? 700 : 400, opacity: op * sh }); }); }
  const MDOC = { tag: 'Document  md-1', col: GOOD, lines: ['# RAG 는 무엇인가?', '검색 증강 생성(...)은 ...', '## 핵심 구성 ...'],
    meta: [['source', '"docs/rag-intro.md"'], ['title', '"RAG 입문"'], ['author', '"박서연"'], ['tags', '["rag","llm","vectorstore"]'], ['date', '2026-05-01']] };
  function s3(t, c) { const { k, u } = c; shelf(c);
    if (k === 0) { mdFile(24, 30, u, { typing: lerp(0, 12, E(u, 0.2, 1.4)), hiFront: fade(u, 1.5) });
      tx(400, 70, '--- 사이 = YAML frontmatter', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      [['import frontmatter', WARN], ['Document', INK], ['MarkdownHeaderTextSplitter', ACC]].forEach(([s, col], i) => pill(660, 150 + i * 56, s, col, pop(u, 1.8 + i * 0.2), { mono: true, fs: 14.5 }));
      return; }
    if (k === 1) { const f = E(u, 0.4, 1.4);
      el('rect', { x: 24, y: 30, width: 360, height: 332, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
      mono(38, 52, 'frontmatter.load(...)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      zone(474, 66, 380, 136, 'post.metadata', { fill: WARNBG, op: fade(u, 1.2), color: WARN }); zone(474, 222, 380, 108, 'post.content (본문만)', { fill: SOFT, op: fade(u, 1.2) });
      // 위 6줄은 오른쪽 위로, 아래 본문은 오른쪽 아래로 미끄러진다
      const g1 = G(lerp(0, 450, f), lerp(0, 18, f), 1, 1);
      MD_RAW.slice(1, 5).forEach((s, i) => mono(38, 100 + i * 24, s, { 'font-size': 13.5, fill: WARN }, g1));
      const g2 = G(lerp(0, 450, f), lerp(0, 62, f), 1, 1);
      MD_RAW.slice(6, 9).forEach((s, i) => mono(38, 200 + i * 24, s, { 'font-size': 13.5, fill: i ? INK : ACC }, g2));
      tx(430, 360, 'frontmatter와 본문이 갈라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { const h = docCard(470, 30, 440, MDOC, { mn: lerp(1, 5, E(u, 0.3, 1.8)), metaCol: WARN });
      mdFile(24, 30, u, { bodyOp: 0.35 });
      grow(384, 110, 466, 180, E(u, 0.2, 0.6), WARN, { sw: 2 });
      sub(690, 30 + h + 26, 'source에 frontmatter 키를 더해 metadata로', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { el('rect', { x: 30, y: 60, width: 330, height: 200, rx: 8, fill: SOFT, stroke: GRID });
      mono(44, 84, 'doc.page_content', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const cut = E(u, 0.5, 1.0); el('line', { x1: 30, y1: 174, x2: lerp(30, 360, cut), y2: 174, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
      ['# RAG 는 무엇인가?', '검색 증강 생성(...)은', '외부 지식을 ... 패턴이다.', '## 핵심 구성', '- Loader : ...', '- Splitter / ...'].forEach((s, i) => mono(44, 112 + i * 22 + (i > 2 ? 14 : 0), s, { 'font-size': 13.5, fill: s.startsWith('#') ? ACC : INK, 'font-weight': s.startsWith('#') ? 700 : 400 }));
      const ch = [{ tag: 'chunks[0]', col: GOOD, lines: ['검색 증강 생성(...)은', '외부 지식을 ... 패턴이다.'], meta: [['h1', '"RAG 는 무엇인가?"']] },
        { tag: 'chunks[1]', col: GOOD, lines: ['- Loader : ...', '- Splitter / ...'], meta: [['h1', '"RAG 는 무엇인가?"'], ['h2', '"핵심 구성"']] }];
      ch.forEach((d, i) => { const a = 1.0 + i * 0.5; docCard(470, 40 + i * 160, 400, d, { s: pop(u, a), mn: lerp(0, d.meta.length, E(u, a + 0.3, a + 0.9)), metaCol: ACC }); });
      grow(362, 120, 462, 90, E(u, 1.0, 1.3), GOOD, { sw: 1.8 }); grow(362, 220, 462, 250, E(u, 1.5, 1.8), GOOD, { sw: 1.8 });
      sub(200, 300, '#·## 줄이 자르는 자리이자 메타가 된다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k 4: UnstructuredMarkdownLoader 와 비교
    tx(240, 50, 'UnstructuredMarkdownLoader', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2) });
    tx(700, 50, 'frontmatter로 직접 나누기', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6) });
    docCard(60, 70, 360, { tag: 'Document', col: MUT, lines: ['title: "RAG 입문" ...  ← 글자로 남음', '# RAG 는 무엇인가? ...'], meta: [['source', '"docs/rag-intro.md"']] }, { s: pop(u, 0.3) });
    docCard(520, 70, 360, { tag: 'Document', col: GOOD, lines: ['# RAG 는 무엇인가? ...'], meta: [['source', '"docs/rag-intro.md"'], ['author', '"박서연"'], ['tags', '["rag","llm",...]']] }, { s: pop(u, 0.7), metaCol: WARN });
    mono(480, 300, 'filter = {"author": "박서연"}', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    cross(240, 340, 11, pop(u, 1.8)); sub(240, 372, '걸 키가 없다', fade(u, 1.9), { fill: BAD, 'font-weight': 700 });
    check(700, 340, 12, pop(u, 2.1)); sub(700, 372, '저자로 좁혀 검색', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 }); }

  // ---------- 4. 멀티모달 (논문 PDF) ----------
  function paper(u, o) { o = o || {};
    el('rect', { x: 30, y: 26, width: 300, height: 344, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(46, 50, 'paper_2026.pdf', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    tx(46, 78, 'Figure 1. RAG 아키텍처', { 'font-size': 14, 'font-weight': 700 });
    el('rect', { x: 46, y: 88, width: 268, height: 70, rx: 4, fill: SOFT });
    card(110, 123, 84, 30, { rx: 5, text: 'Retriever', fs: 13.5, sw: 1.5 }); card(250, 123, 84, 30, { rx: 5, text: 'Generator', fs: 13.5, sw: 1.5 }); grow(154, 123, 206, 123, 1, MUT, { sw: 1.8 });
    tx(46, 186, 'Table 1. 성능 비교', { 'font-size': 14, 'font-weight': 700 });
    const T = [['Model', 'EM', 'F1'], ['no-RAG', '0.32', '0.41'], ['RAG', '0.58', '0.69']];
    T.forEach((r, i) => r.forEach((v, j) => { const x = 46 + [0, 120, 194][j], w = [120, 74, 74][j];
      el('rect', { x, y: 196 + i * 28, width: w, height: 28, fill: i ? PANEL : SOFT, stroke: MUT, 'stroke-width': 1.2 });
      mono(x + 8, 215 + i * 28, v, { 'font-size': 13.5, 'font-weight': i ? 400 : 700, fill: o.hiF1 && i === 2 && j === 2 ? ACC : INK }); }));
    [296, 314, 332, 350].forEach((y, i) => el('line', { x1: 46, y1: y, x2: i === 3 ? 220 : 314, y2: y, stroke: OFF, 'stroke-width': 4, 'stroke-linecap': 'round' })); }
  const REG = [[40, 62, 280, 100, 'Image', ACC], [40, 172, 280, 114, 'Table', WARN], [40, 286, 280, 74, 'NarrativeText', INFO]];
  function s4(t, c) { const { k, u } = c; shelf(c, 1.8);
    if (k === 0) { paper(u); card(620, 120, 300, 54, { rx: 10, stroke: ACC, fill: ACCBG, text: 'partition_pdf', fs: 17, mono: true, color: ACC, s: pop(u, 0.6) });
      sub(620, 180, 'from unstructured.partition.pdf', fade(u, 0.8), { 'font-size': 14 });
      [['글', INFO], ['표', WARN], ['그림', ACC]].forEach(([s, col], i) => pill(530 + i * 90, 250, s, col, pop(u, 1.4 + i * 0.25), { fs: 15 }));
      sub(620, 300, '한 쪽 안에 세 종류가 섞여 있다', fade(u, 2.1), { 'font-size': 15 }); return; }
    paper(u, { hiF1: k === 5 });
    if (k === 1) { REG.forEach(([x, y, w, h, name, col], i) => { const a = 0.3 + i * 0.4, f = E(u, a, a + 0.5); if (f <= 0) return;
        el('rect', { x: x - 2, y: y + 2, width: (w + 4) * f, height: h - 4, rx: 4, fill: 'none', stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': '7 4' }); });
      [['strategy="hi_res"', '레이아웃 분석 + OCR'], ['infer_table_structure=True', '표 칸 구조까지'], ['extract_images_in_pdf=True', '그림은 파일로 뽑기']].forEach(([a, b], i) => {
        mono(400, 90 + i * 64, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); sub(400, 112 + i * 64, b, fade(u, 0.5 + i * 0.4), { 'text-anchor': 'start', 'font-size': 14 }); });
      fileIcon(820, 290, 'PNG', ACC, 'images/fig1.png', { s: pop(u, 1.9) }); grow(332, 350, 780, 300, E(u, 1.6, 2.1), ACC, { dash: '5 4', sw: 1.8 }); return; }
    if (k === 2) { const rows = [['Title', INK, 'Figure 1. RAG 아키텍처'], ['Image', ACC, '(그림)'], ['Title', INK, 'Table 1. 성능 비교'], ['Table', WARN, 'Model EM F1 …'], ['NarrativeText', INFO, '본문 문단']];
      mono(380, 60, 'for el in elements:  type(el).__name__', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      rows.forEach(([kind, col, s], i) => { const y = 100 + i * 52, a = 0.4 + i * 0.3; pill(380 + (tw(kind, 14.5) + 26) / 2, y, kind, col, pop(u, a), { mono: true, fs: 14.5 }); tx(560, y + 5, s, { 'font-size': 14.5, fill: MUT, opacity: fade(u, a + 0.1) }); });
      return; }
    if (k === 3) { // 종류별 변환
      grow(330, 230, 380, 120, E(u, 0.2, 0.5), WARN, { sw: 1.8 }); grow(330, 120, 380, 220, E(u, 0.8, 1.1), ACC, { sw: 1.8 }); grow(330, 320, 380, 320, E(u, 1.4, 1.7), INFO, { sw: 1.8 });
      zone(390, 70, 550, 96, 'Table → el.metadata.text_as_html', { fill: WARNBG, color: WARN, op: fade(u, 0.3) });
      mono(404, 120, '<table><tr><th>Model</th><th>EM</th>', { 'font-size': 13.5, opacity: fade(u, 0.5) }); mono(404, 144, '<th>F1</th></tr> ... <td>0.69</td> ...', { 'font-size': 13.5, opacity: fade(u, 0.6) });
      zone(390, 180, 550, 96, 'Image → 비전 모델 캡션 (출력 예시)', { fill: ACCBG, color: ACC, op: fade(u, 0.9) });
      tx(404, 230, 'RAG 아키텍처 다이어그램 — Retriever와', { 'font-size': 14, opacity: fade(u, 1.1) }); tx(404, 254, 'Generator가 화살표로 연결됨', { 'font-size': 14, opacity: fade(u, 1.2) });
      zone(390, 290, 550, 60, 'NarrativeText → el.text 그대로', { fill: INFOBG, color: INFO, op: fade(u, 1.5) });
      sub(665, 372, '세 종류가 모두 글자가 된다', fade(u, 2.1), { 'font-size': 15, 'font-weight': 700, fill: ACC }); return; }
    if (k === 4) { const D = [{ tag: 'mm-text', col: INFO, lines: ['Figure 1. RAG 아키텍처를 ...'], meta: [['element', '"NarrativeText"'], ['page', '3']] },
        { tag: 'mm-table', col: WARN, lines: ['<table><tr><th>Model ...'], meta: [['element', '"Table"'], ['page', '5']] },
        { tag: 'mm-image', col: ACC, lines: ['RAG 아키텍처 다이어그램 ...'], meta: [['element', '"Image"'], ['page', '3']] }];
      D.forEach((d, i) => docCard(360 + (i % 2) * 290, 30 + Math.floor(i / 2) * 160 + (i === 2 ? 0 : 0), 275, d, { s: pop(u, 0.3 + i * 0.4), mn: lerp(0, 2, E(u, 0.6 + i * 0.4, 1.2 + i * 0.4)), metaCol: d.col }));
      sub(800, 250, '모두 source="paper_2026.pdf"', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    // k 5: 결과 확인
    mono(380, 80, 'print({d.metadata["element"] for d in docs})', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
    [['NarrativeText', INFO], ['Table', WARN], ['Image', ACC], ['Title', INK]].forEach(([s, col], i) => pill(440 + i * 130 + (i ? 30 : 0), 130, s, col, pop(u, 0.5 + i * 0.2), { mono: true, fs: 14 }));
    tx(380, 210, '같은 Document 모양이라 한 인덱스에 넣는다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.3) });
    tx(380, 250, '표 안 숫자 0.69, 그림 속 화살표도', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) });
    tx(380, 276, '이제 글자로 검색된다', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.9) }); }

  // ---------- 5. DirectoryLoader ----------
  const TREE = ['data/', '├── hr_policy.pdf  (42 pages)', '├── manual.pdf     (8 pages)', '├── blog/', '│   ├── rag-intro.html', '│   └── chunking.html', '├── docs/', '│   ├── rag-intro.md', '│   └── api-spec.md', '└── papers/', '    └── paper_2026.pdf'];
  const FILES = [[1, 'pdf'], [2, 'pdf'], [4, 'html'], [5, 'html'], [7, 'md'], [8, 'md'], [10, 'pdf']];
  const LMAP = { pdf: ['PyPDFLoader', WARN, 90], html: ['BSHTMLLoader', INFO, 190], md: ['UnstructuredMarkdownLoader', GOOD, 290] };
  function tree(u, o) { o = o || {}; TREE.forEach((s, i) => { const y = 54 + i * 27, file = FILES.find((f) => f[0] === i), sh = o.typing != null ? clamp(o.typing - i) : 1; if (sh <= 0) return;
      if (o.done && file) { const f = clamp(o.done * 7 - FILES.indexOf(file)); if (f > 0) el('rect', { x: 26, y: y - 18, width: 320 * f, height: 24, rx: 4, fill: { pdf: WARNBG, html: INFOBG, md: GOODBG }[file[1]] }); }
      mono(34, y, s, { 'font-size': 14, fill: file ? INK : MUT, 'font-weight': file ? 400 : 700, opacity: sh }); }); }
  function s5(t, c) { const { k, u } = c; shelf(c);
    if (k === 0) { tree(u, { typing: lerp(0, 11, E(u, 0.2, 1.5)) });
      tx(440, 60, '7개 파일 · 3가지 형식', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.5) });
      [['DirectoryLoader', ACC], ['PyPDFLoader', WARN], ['BSHTMLLoader', INFO], ['UnstructuredMarkdownLoader', GOOD]].forEach(([s, col], i) => pill(440 + (tw(s, 14.5) + 26) / 2, 120 + i * 54, s, col, pop(u, 1.7 + i * 0.15), { mono: true, fs: 14.5 }));
      return; }
    tree(u, { done: k >= 3 ? (k === 3 ? E(u, 0.3, 2.0) : 1) : 0 });
    if (k === 1) { Object.entries(LMAP).forEach(([ext, [name, col, y]], i) => { pill(640 + (tw(name, 14) + 26) / 2 - 60, y, name, col, pop(u, 0.2 + i * 0.2), { mono: true, fs: 14 }); mono(500, y + 5, `.${ext}`, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.2) }); });
      FILES.forEach(([row, ext], i) => { const y = 54 + row * 27 - 5, ty = LMAP[ext][2]; grow(350, y, 490, ty, E(u, 0.7 + i * 0.15, 1.1 + i * 0.15), LMAP[ext][1], { sw: 1.6, plain: true }); });
      pill(640, 360, '모르는 확장자 → ValueError', BAD, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 2) { [['glob="**/*"', '하위 폴더까지 재귀'], ['show_progress=True', '진행 막대'], ['use_multithreading=True', '여러 파일을 동시에'], ['silent_errors=True', '한 파일이 실패해도 계속']].forEach(([a, b], i) => {
        mono(420, 80 + i * 70, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); sub(420, 104 + i * 70, b, fade(u, 0.4 + i * 0.4), { 'text-anchor': 'start', 'font-size': 14.5 }); });
      [3, 6, 9].forEach((r, i) => el('rect', { x: 26, y: 54 + r * 27 - 18, width: 120, height: 24, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.5 + i * 0.1) }));
      [0, 1, 2, 3].forEach((i) => { const y = 340 + i * 0, x0 = 700 + i * 52; el('rect', { x: x0, y: 300, width: 40, height: 60, rx: 6, fill: SOFT, stroke: GRID }); dot([[x0 + 20, 300], [x0 + 20, 360]], ((u * 1.3 + i * 0.25) % 1), ACC, 5); });
      sub(800, 290, '스레드 4개 (그림)', fade(u, 1.6), { 'font-size': 13.5 }); return; }
    if (k === 3) { const f = E(u, 0.3, 2.0), nf = Math.round(f * 7);
      el('rect', { x: 420, y: 70, width: 480, height: 22, rx: 11, fill: SOFT }); el('rect', { x: 420, y: 70, width: 480 * f, height: 22, rx: 11, fill: ACC });
      mono(420, 120, `${nf}/7 파일`, { 'font-size': 16, 'font-weight': 700 });
      [['PDF 쪽', '42 + 8 + 논문 쪽수', WARN], ['HTML', '2', INFO], ['Markdown', '2', GOOD]].forEach(([a, b, col], i) => { const y = 170 + i * 48;
        tx(420, y, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.8 + i * 0.4) }); mono(560, y, b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4) }); });
      mono(420, 330, 'len(docs) = 54 + 논문 쪽수', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
      sub(660, 358, 'PDF는 쪽마다 Document 1개', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 4) { const ax = R.axes(470, 80, 360, 220, { x: [0, 3], y: [0, 3.6], yt: [0, 1, 2, 3], yl: '파일 수' });
      [['pdf', 3, WARN], ['html', 2, INFO], ['md', 2, GOOD]].forEach(([s, v, col], i) => { const x = ax.X(i + 0.5), h = (ax.Y(0) - ax.Y(v)) * E(u, 0.3 + i * 0.3, 0.9 + i * 0.3);
        el('rect', { x: x - 34, y: ax.Y(0) - h, width: 68, height: h, rx: 4, fill: col }); mono(x, ax.Y(0) + 22, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
        mono(x, ax.Y(v) - 8, String(v), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.9 + i * 0.3) }); });
      sub(650, 356, 'source를 set으로 모아 파일 단위로 센다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k 5: Splitter 로 넘기기
    for (let i = 0; i < 5; i++) el('rect', { x: 420 + i * 8, y: 90 + i * 8, width: 120, height: 70, rx: 6, fill: PANEL, stroke: [WARN, INFO, GOOD, WARN, ACC][i], 'stroke-width': 2 });
    mono(480, 205, 'docs', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    grow(580, 130, 640, 130, E(u, 0.3, 0.7), ACC);
    card(760, 130, 220, 60, { rx: 10, stroke: ACC, fill: ACCBG, text: 'RecursiveCharacter\nTextSplitter(500)', fs: 14, mono: true, color: ACC, s: pop(u, 0.5) });
    grow(760, 162, 760, 220, E(u, 1.0, 1.3), ACC);
    for (let i = 0; i < 8; i++) { const s = pop(u, 1.3 + i * 0.1); el('rect', { x: 640 + i * 31, y: 236, width: 26 * s, height: 40, rx: 4, fill: [WARNBG, INFOBG, GOODBG][i % 3], stroke: [WARN, INFO, GOOD][i % 3], 'stroke-width': 1.5 }); }
    mono(760, 300, 'split_documents(docs)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
    sub(760, 330, '형식을 묻지 않는다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: ACC }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'PyPDFLoader로 42쪽짜리 PDF를 load()하면 Document는 몇 개가 되는가?',
      o: ['1개, 파일 하나가 Document 하나다', '42개, 쪽마다 하나씩 만든다', '0개, split을 먼저 해야 만들어진다'], a: 1,
      why: 'PyPDFLoader는 쪽마다 Document를 하나씩 만들고 metadata에 page(0부터)와 total_pages 42를 넣는다.' },
    { q: 'WebBaseLoader에 SoupStrainer(["article","h1","h2","p"])를 주었을 때 metadata에서 빠지는 것은 무엇인가?',
      o: ['source(URL)', 'title', 'page_content'], a: 1,
      why: 'parse_only에 없는 <title>은 파싱되지 않아 title 메타가 생기지 않는다. source는 URL이라 늘 들어간다.' },
    { q: 'Markdown의 frontmatter(title·author·tags)를 metadata로 옮기는 방법으로 맞는 것은 무엇인가?',
      o: ['UnstructuredMarkdownLoader가 알아서 옮긴다', 'MarkdownHeaderTextSplitter가 옮긴다', 'python-frontmatter로 따로 읽어 metadata에 넣는다'], a: 2,
      why: 'UnstructuredMarkdownLoader의 metadata는 source뿐이다. frontmatter.load로 나눠 읽으면 author·tags로 필터를 걸 수 있다.' },
    { q: 'partition_pdf로 나온 Table 요소는 어떤 글자로 바꿔 Document에 넣는가?',
      o: ['el.metadata.text_as_html의 HTML 표', '표를 찍은 PNG 파일 경로', '비전 모델이 쓴 캡션'], a: 0,
      why: 'infer_table_structure=True면 표 구조가 HTML로 나온다. 그림(Image)은 캡션 글자로 바꾼다.' },
    { q: 'data/ 폴더의 파일을 확장자별로 셀 때 Counter가 pdf 3을 내려면 무엇을 세야 하는가?',
      o: ['docs의 Document 개수', 'source를 set으로 모은 파일 이름', 'page 번호의 합'], a: 1,
      why: 'PDF는 쪽마다 Document가 생겨 Document로 세면 pdf가 50을 넘는다. source를 set으로 모아야 파일 수가 나온다.' },
  ];

  const summary = [
    'PDF·HTML·Markdown·논문·폴더 어디서 읽든 결과는 page_content와 metadata를 가진 Document다.',
    'PyPDFLoader는 쪽마다 Document를 만들고 source와 page를 자동으로 붙인다.',
    'HTML은 SoupStrainer로 본문 태그만 남기고, title 태그까지 거르면 title 메타도 빠진다.',
    'frontmatter는 따로 읽어 metadata에 넣고, 표는 HTML로, 그림은 캡션 글자로 바꿔 넣는다.',
  ];
  const review = [
    { q: '블로그 글을 WebBaseLoader로 읽어 답변에 글 제목을 붙이려 했더니 metadata에 title이 없다. 먼저 의심할 것은?',
      o: ['parse_only 목록에 title 태그가 빠졌다', '블로그가 robots.txt로 막았다', 'aload()가 아니라 load()를 썼다'], a: 0,
      why: 'WebBaseLoader는 파싱된 soup에서 <title>을 찾아 title 메타를 만든다. SoupStrainer가 title을 거르면 찾을 것이 없다.' },
    { q: '폴더를 DirectoryLoader로 읽었더니 len(docs)가 파일 수 7보다 훨씬 크다. 무엇 때문인가?',
      o: ['silent_errors가 실패한 파일을 여러 번 읽었다', 'PDF는 쪽마다 Document가 하나씩 생긴다', 'use_multithreading이 문서를 복제했다'], a: 1,
      why: 'hr_policy.pdf 42쪽, manual.pdf 8쪽이 각각 쪽 수만큼 Document가 된다. HTML과 md는 파일당 하나다.' },
    { q: '사내 문서 검색에서 "작성자가 박서연인 문서만"을 걸고 싶다. 로딩 단계에서 해 둘 일은?',
      o: ['본문을 더 작게 잘라 둔다', 'Markdown을 HTML로 바꿔 읽는다', 'frontmatter의 author를 metadata로 옮겨 둔다'], a: 2,
      why: '검색 필터는 metadata 키에만 걸린다. frontmatter가 본문 글자로 남아 있으면 author로 좁힐 수 없다.' },
  ];

  R.page({ title: '문서가 Document가 되는 과정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
