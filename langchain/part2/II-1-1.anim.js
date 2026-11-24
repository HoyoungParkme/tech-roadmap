/* II-1-1 Document Loaders — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽 원본(PDF 쪽, 웹 페이지 HTML, CSV 표, README.md, docs/ 폴더) → 가운데 Loader 판 → 오른쪽 Document 카드(page_content + metadata).
 * 숫자: 3쪽·4행·요소 4개·폴더 합계 8개(PDF 3 + CSV 4 + MD 1)는 langchain-community 0.4.2 로 같은 파일을 만들어 load() 해 본 결과다.
 * 웹 페이지 본문과 title 값은 예시다(example.com). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, browser, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 그림 ----------
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  // 파일 아이콘 (가운데 기준): 접힌 귀퉁이 + 색 띠
  function fileIcon(cx, cy, kind, col, name, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1), w = 58, h = 74;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 15} L${w / 2},${-h / 2 + 15} V${h / 2} H${-w / 2} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2 }, g);
    el('path', { d: `M${w / 2 - 15},${-h / 2} V${-h / 2 + 15} H${w / 2}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 1.5 }, g);
    [-22, -13, -4].forEach((y) => el('line', { x1: -w / 2 + 9, y1: y, x2: w / 2 - 12, y2: y, stroke: OFF, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g));
    el('rect', { x: -w / 2, y: 6, width: w, height: 21, fill: col }, g);
    tx(0, 21, kind, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: PANEL }, g);
    if (name) tx(0, h / 2 + 20, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono' }, g);
    return g; }
  // Document 카드 (왼쪽 위 기준). d = { tag, col, lines, meta:[[k,v]] }, o.mn = 보이는 meta 줄 수(소수 가능)
  function docCard(x, y, w, d, o) { o = o || {}; const lh = 20, nl = d.lines.length, nm = (d.meta || []).length;
    const h = 32 + nl * lh + (nm ? 12 + nm * lh : 0) + 6, g = G(x, y, o.s ?? 1, o.op ?? 1), col = d.col || ACC;
    el('rect', { x: 0, y: 0, width: w, height: h, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 2 }, g);
    el('rect', { x: 0, y: 0, width: w, height: 25, rx: 8, fill: col }, g); el('rect', { x: 0, y: 15, width: w, height: 10, fill: col }, g);
    tx(10, 18, d.tag, { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, class: 'mono' }, g);
    d.lines.forEach((s, i) => mono(10, 44 + i * lh, s, { 'font-size': 13.5, fill: d.empty ? BAD : INK, 'font-weight': d.empty ? 700 : 400 }, g));
    if (nm) { const y0 = 32 + nl * lh + 4; el('line', { x1: 8, y1: y0, x2: w - 8, y2: y0, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, g);
      d.meta.forEach(([k, v, hot], i) => { const op = clamp((o.mn ?? nm) - i); if (op <= 0) return;
        mono(10, y0 + 18 + i * lh, k + ':', { 'font-size': 13.5, fill: MUT, opacity: op }, g);
        mono(10 + tw(k + ': ', 13.5), y0 + 18 + i * lh, v, { 'font-size': 13.5, 'font-weight': 700, fill: hot ? ACC : INFO, opacity: op }, g); }); }
    return h; }
  // Loader 판 (가운데 기준)
  function loader(cx, cy, name, args, o) { o = o || {}; const w = o.w || Math.max(tw(name, 16), tw(args || '', 13.5)) + 40, h = args ? 66 : 44;
    const g = card(cx, cy, w, h, { rx: 10, stroke: o.col || ACC, fill: o.fill || ACCBG, sw: 2.4, s: o.s, op: o.op });
    tx(0, args ? -6 : 6, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: o.col || ACC }, g);
    if (args) mono(0, 18, args, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK }, g); return w; }
  // 코드 한 줄 (타이핑)
  function codeLine(x, y, s, f, o) { o = o || {}; const w = tw(s, 14) + 28;
    el('rect', { x, y: y - 20, width: w, height: 30, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.2, opacity: o.op ?? 1 });
    mono(x + 14, y, typed(s, f ?? 1), { 'font-size': 14, fill: INK, opacity: o.op ?? 1 }); }
  // 오른쪽 Document 영역의 개수 표시
  function lenTag(x, y, n, o) { o = o || {}; mono(x, y, `len(docs) = ${n}`, { 'font-size': 17, 'font-weight': 800, fill: o.col || ACC, 'text-anchor': o.anchor || 'start', opacity: o.op ?? 1 }); }
  function pageStack(cx, cy, n, col, o) { o = o || {}; for (let i = n - 1; i >= 0; i--) el('rect', { x: cx - 29 + i * 6, y: cy - 37 - i * 6, width: 58, height: 74, rx: 3, fill: PANEL, stroke: i ? OFF : col, 'stroke-width': 1.6, opacity: o.op ?? 1 }); }

  // ---------- 1. PyPDFLoader ----------
  const PDF_TXT = ['1장 서론 — 본 보고서는…', '2장 시장 규모 — 글로벌…', '3장 결론 — RAG 패턴이…'];
  function pdfLeft(o) { o = o || {}; const n = o.n ?? 3; if (n > 1) pageStack(120, 205, n - 1 + 1, BAD, { op: o.op });
    if (n > 0) fileIcon(120, 205, 'PDF', BAD, null, { op: o.op ?? 1 });
    tx(120, 268, 'report.pdf', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: o.op ?? 1 });
    sub(120, 290, '3쪽', o.op ?? 1); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      codeLine(40, 52, 'from langchain_community.document_loaders import PyPDFLoader', E(u, 0.2, 1.4));
      pdfLeft({ op: 0.4 }); sub(120, 320, '아직 손대지 않음', fade(u, 1.6));
      loader(440, 205, 'PyPDFLoader', null, { s: pop(u, 1.2) });
      zone(640, 100, 290, 210, 'docs', { fill: 'none', stroke: GRID, dash: '6 5', op: fade(u, 1.7) });
      tx(785, 205, 'Document 0개', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.9) });
      sub(785, 232, 'import 만 한 상태', fade(u, 2.1)); return; }
    if (k === 1) { pdfLeft({});
      loader(440, 205, 'PyPDFLoader', typed('("report.pdf")', E(u, 0.9, 1.8)), { w: 220 });
      const f = E(u, 0.2, 1.1); if (f > 0 && f < 1) pill(lerp(150, 400, f), lerp(170, 205, f), 'report.pdf', BAD, 1, { mono: true, fs: 13.5 });
      tx(440, 275, '경로만 기억한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(440, 298, 'load() 전에는 파일을 열지 않는다', fade(u, 1.8));
      zone(640, 100, 290, 210, 'docs', { fill: 'none', stroke: GRID, dash: '6 5' });
      tx(785, 205, 'Document 0개', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT }); return; }
    if (k === 2) {
      let landed = 0;
      for (let i = 0; i < 3; i++) { const f = E(u, 0.3 + i * 0.45, 1.2 + i * 0.45);
        if (f >= 1) { landed++; continue; }
        if (f > 0) { const mid = f < 0.5, x = mid ? lerp(120, 440, f * 2) : lerp(440, 700, (f - 0.5) * 2), y = mid ? lerp(205, 205, f * 2) : lerp(205, 84 + i * 96, (f - 0.5) * 2);
          el('rect', { x: x - 16, y: y - 20, width: 32, height: 40, rx: 3, fill: PANEL, stroke: BAD, 'stroke-width': 2 }); mono(x, y + 5, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD }); } }
      const left = 3 - [0, 1, 2].filter((i) => E(u, 0.3 + i * 0.45, 1.2 + i * 0.45) > 0).length;
      if (left > 0) { pageStack(120, 205, left, BAD); fileIcon(120, 205, 'PDF', BAD, null); }
      tx(120, 268, 'report.pdf', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      loader(440, 205, 'PyPDFLoader', 'loader.load()', { w: 200 });
      sub(440, 262, 'pypdf 가 쪽마다 글자를 뽑는다', fade(u, 0.4));
      for (let i = 0; i < landed; i++) docCard(640, 58 + i * 96, 290, { tag: `docs[${i}]`, col: ACC, lines: [PDF_TXT[i]], meta: [['page', String(i)]] }, { s: 1 });
      lenTag(640, 360, landed); sub(785, 395, '1쪽 = Document 1개', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { pdfLeft({});
      el('rect', { x: 91, y: 168, width: 58, height: 74, rx: 3, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.2) });
      grow(160, 205, 300, 160, E(u, 0.3, 0.8), ACC);
      const h = docCard(320, 58, 380, { tag: 'docs[0]  Document', col: ACC, lines: ['"1장 서론 — 본 보고서는 2026년 LLM…"'],
        meta: [['source', '"report.pdf"'], ['total_pages', '3'], ['page', '0', true], ['page_label', '"1"', true]] }, { mn: lerp(0, 4, E(u, 0.8, 2.0)) });
      tx(716, 104, '← page_content', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(716, 58 + h - 50, '← page 는 0부터', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      tx(716, 58 + h - 26, '← 사람이 보는 쪽 "1"', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) });
      sub(510, 58 + h + 32, 'producer·creator 같은 PDF 정보 키도 함께 들어온다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k4 스캔 PDF
    const g = G(120, 190, 1); el('rect', { x: -34, y: -44, width: 68, height: 88, rx: 3, fill: SOFT, stroke: INK, 'stroke-width': 2 }, g);
    el('circle', { cx: 14, cy: -22, r: 8, fill: OFF }, g); el('path', { d: 'M-28,30 L-8,2 L6,18 L16,6 L28,30 Z', fill: OFF }, g);
    tx(120, 262, '스캔 PDF', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); sub(120, 284, '글자가 아니라 그림', 1);
    loader(400, 190, 'PyPDFLoader', null, { s: pop(u, 0.2) }); grow(158, 190, 322, 190, E(u, 0.3, 0.8), MUT);
    grow(478, 190, 586, 150, E(u, 0.8, 1.2), MUT);
    docCard(600, 100, 300, { tag: 'docs[0]', col: BAD, lines: ['page_content = ""'], empty: true, meta: [['page', '0']] }, { s: pop(u, 1.0) });
    cross(880, 92, 10, pop(u, 1.4));
    grow(750, 220, 750, 282, E(u, 1.6, 2.0), GOOD);
    pill(750, 310, 'UnstructuredPDFLoader · OCR 계열', GOOD, pop(u, 1.9), { fs: 14 });
    sub(400, 250, '뽑을 글자가 없다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 }); }

  // ---------- 2. WebBaseLoader ----------
  const HTML = [['<html lang="ko">', 0], ['<nav>메뉴 · 로그인</nav>', 1], ['<article>', 0], ['  <h1>2026년 LLM 트렌드</h1>', 2], ['  <p>RAG와 Agent 패턴이…</p>', 2], ['</article>', 0], ['<script>track()</script>', 1]];
  function htmlPage(x, y, o) { o = o || {}; browser(x + 160, y + 120, 320, 240, null, { op: o.op });
    mono(x + 60, y + 18, typed('example.com/article', o.url ?? 1), { 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 });
    HTML.forEach(([s, kind], i) => { const yy = y + 56 + i * 25, strip = o.strip ?? 0;
      if (kind === 2 && strip > 0) { const inner = s.replace(/<[^>]+>/g, '').trim(); mono(x + 16, yy, lerp(1, 0, strip) > 0.5 ? s : inner, { 'font-size': 13.5, fill: strip > 0.5 ? INK : INK, 'font-weight': strip > 0.5 ? 700 : 400, opacity: o.op ?? 1 }); return; }
      mono(x + 16, yy, s, { 'font-size': 13.5, fill: kind === 2 ? INK : MUT, opacity: (o.op ?? 1) * (strip > 0 && kind !== 2 ? lerp(1, 0.18, strip) : 1), 'text-decoration': strip > 0.5 && kind !== 2 ? 'line-through' : null }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { htmlPage(30, 70, { op: fade(u, 0.2) });
      loader(560, 200, 'WebBaseLoader', null, { s: pop(u, 0.8) });
      pill(500, 280, 'requests', INFO, pop(u, 1.3), { mono: true }); pill(640, 280, 'BeautifulSoup', INFO, pop(u, 1.6), { mono: true });
      sub(570, 320, '받아 오기 + HTML 해석', fade(u, 1.9));
      tx(800, 200, '이번엔 PDF 대신 웹 페이지', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1), 'text-anchor': 'middle' }); return; }
    if (k === 1) { htmlPage(30, 70, { url: E(u, 0.2, 1.2) });
      loader(570, 200, 'WebBaseLoader', typed('("https://example.com/article")', E(u, 0.9, 1.9)), { w: 330 });
      tx(570, 270, 'URL 하나 = Document 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(570, 294, 'URL 리스트를 넘기면 URL 수만큼', fade(u, 2.2)); return; }
    if (k === 2) { htmlPage(30, 70, {});
      loader(560, 110, 'WebBaseLoader', null, {});
      el('line', { x1: 640, y1: 110, x2: 820, y2: 110, stroke: GRID, 'stroke-width': 2 });
      const sv = G(870, 110, 0.8); [-28, 0, 28].forEach((yy) => { el('rect', { x: -50, y: yy - 11, width: 100, height: 22, rx: 4, fill: PANEL, stroke: INK, 'stroke-width': 2 }, sv); }); tx(870, 170, 'example.com', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono' });
      dot([[640, 110], [820, 110]], seg(u, 0.3, 1.2), INFO, 7);
      card(700, 250, 400, 74, { rx: 8, stroke: INFO, fill: INFOBG, sw: 1.8, s: pop(u, 0.9) });
      mono(512, 240, 'User-Agent: Mozilla/5.0 (study-bot)', { 'font-size': 13.5, opacity: fade(u, 1.1) });
      mono(512, 264, 'timeout: 10', { 'font-size': 13.5, opacity: fade(u, 1.3) });
      clock(620, 350, 22, E(u, 1.4, 2.6) * 0.8, WARN, '10초 안에 못 받으면 포기');
      sub(800, 350, '봇 차단 사이트 대비', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 3) { htmlPage(30, 70, { strip: E(u, 0.3, 1.2) });
      loader(500, 200, 'BeautifulSoup', null, { col: INFO, fill: INFOBG });
      grow(360, 200, 430, 200, E(u, 0.2, 0.6), MUT); grow(570, 200, 610, 200, E(u, 1.0, 1.4), ACC);
      docCard(620, 120, 310, { tag: 'docs[0]', col: ACC, lines: ['"2026년 LLM 트렌드 —', ' RAG와 Agent 패턴이…"'] }, { s: pop(u, 1.3) });
      sub(775, 240, '태그·메뉴·스크립트는 빠지고 글자만', fade(u, 1.8), { 'font-size': 14.5 });
      lenTag(775, 290, E(u, 1.3, 1.6) > 0.5 ? 1 : 0, { anchor: 'middle' }); return; }
    if (k === 4) {
      const h = docCard(40, 70, 420, { tag: 'Web  docs[0]', col: INFO, lines: ['"2026년 LLM 트렌드 — RAG와…"'], meta: [['source', '"https://example.com/article"'], ['title', '"2026 LLM Trends"'], ['language', '"ko"']] }, { mn: lerp(0, 3, E(u, 0.3, 1.5)) });
      docCard(500, 70, 420, { tag: 'PDF  docs[0]', col: BAD, lines: ['"1장 서론 — 본 보고서는…"'], meta: [['source', '"report.pdf"'], ['page', '0'], ['page_label', '"1"']] }, { op: fade(u, 1.5) });
      tx(480, 70 + h + 44, 'page_content 는 같고, metadata 키는 로더마다 다르다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 70 + h + 70, '값은 예시 (title·language 는 HTML 의 <title>·lang 에서 온다)', fade(u, 2.2)); return; }
    // k5 robots.txt · JS 렌더 페이지
    card(190, 140, 300, 130, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.2) });
    mono(56, 104, 'robots.txt', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) });
    mono(56, 134, 'User-agent: *', { 'font-size': 13.5, opacity: fade(u, 0.4) }); mono(56, 158, 'Disallow: /private/', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 0.5) });
    mono(56, 182, '+ 이용약관 확인', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
    sub(190, 236, '긁기 전에 먼저 읽는다', fade(u, 0.8), { 'font-size': 14.5 });
    browser(560, 150, 260, 150, 'JS 로 그리는 페이지', { op: fade(u, 1.0) });
    mono(450, 152, '<div id="root"></div>', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1) });
    cross(670, 120, 12, pop(u, 1.4)); sub(560, 266, 'requests 로 받으면 본문이 비어 있다', fade(u, 1.5));
    grow(700, 160, 790, 160, E(u, 1.7, 2.1), GOOD); pill(850, 160, 'Playwright', GOOD, pop(u, 2.0), { mono: true });
    sub(850, 194, 'PlaywrightURLLoader', fade(u, 2.2), { class: 'mono' }); }

  // ---------- 3. CSVLoader ----------
  const ROWS = [['name', 'age', 'role'], ['박서연', '28', 'PM'], ['김지훈', '31', 'Eng'], ['이수민', '26', 'Designer'], ['정태형', '35', 'CTO']];
  function grid(x, y, o) { o = o || {}; const cw = [86, 52, 96], rh = 34, fill = o.fill ?? 99, gone = o.gone || [];
    ROWS.forEach((r, i) => { let cx = x; const op = gone.includes(i) ? 0.12 : 1; r.forEach((v, j) => { const n = i * 3 + j;
      if (n < fill) { el('rect', { x: cx, y: y + i * rh, width: cw[j], height: rh, fill: i === 0 ? SOFT : PANEL, stroke: GRID, 'stroke-width': 1.4, opacity: op });
        tx(cx + 10, y + i * rh + 23, v, { 'font-size': 14.5, 'font-weight': i === 0 ? 800 : 400, class: 'mono', fill: i === 0 ? GOOD : INK, opacity: op }); }
      cx += cw[j]; }); });
    return { w: cw.reduce((a, b) => a + b), rh }; }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { fileIcon(120, 190, 'CSV', GOOD, 'users.csv', { s: pop(u, 0.2) });
      loader(440, 190, 'CSVLoader', null, { s: pop(u, 0.8) });
      pill(440, 262, 'import csv  (표준 라이브러리)', GOOD, pop(u, 1.3), { fs: 14 });
      sub(440, 300, '추가로 설치할 패키지가 없다', fade(u, 1.7));
      zone(640, 100, 290, 200, 'docs', { fill: 'none', stroke: GRID, dash: '6 5', op: fade(u, 1.9) }); return; }
    if (k === 1) { const fill = Math.floor(lerp(0, 15, E(u, 0.2, 1.6)));
      tx(60, 60, 'users.csv', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      grid(60, 76, { fill });
      lbl(330, 98, '← 헤더 1행', fade(u, 1.7), { 'text-anchor': 'start', fill: GOOD });
      tx(330, 180, '← 데이터 4행', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(600, 150, '데이터 4행이', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 2.1) });
      tx(600, 180, 'Document 4개가 된다', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { tx(60, 70, '파일 안의 실제 글자', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      ['name,age,role', '박서연,28,PM', '김지훈,31,Eng'].forEach((s, i) => { const y = 108 + i * 34; let x = 60;
        [...s].forEach((ch) => { const isSep = ch === ',', w = tw(ch, 16);
          if (isSep) el('rect', { x: x - 2, y: y - 18, width: w + 4, height: 24, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, opacity: fade(u, 0.6 + i * 0.2) });
          mono(x, y, ch, { 'font-size': 16, 'font-weight': isSep ? 800 : 400, fill: isSep ? WARN : INK }); x += w; }); });
      loader(620, 150, 'CSVLoader(', null, { w: 160, s: pop(u, 0.3) });
      mono(560, 208, 'encoding="utf-8"', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      mono(560, 236, 'csv_args={"delimiter": ","}', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      sub(380, 300, '한글 파일은 인코딩을 적어 두고, 구분자는 쉼표 말고도 바꿀 수 있다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 3) { const g0 = grid(40, 70, { gone: [1, 2, 3, 4].filter((i) => E(u, 0.2 + (i - 1) * 0.4, 0.9 + (i - 1) * 0.4) > 0) });
      let n = 0;
      for (let i = 1; i <= 4; i++) { const f = E(u, 0.2 + (i - 1) * 0.4, 0.9 + (i - 1) * 0.4); if (f <= 0) continue;
        const x = lerp(40, 560, f), y = lerp(70 + i * 34, 40 + (i - 1) * 88, f);
        if (f < 1) { el('rect', { x, y, width: g0.w, height: 34, rx: 4, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); mono(x + 10, y + 23, ROWS[i].join('  '), { 'font-size': 14 }); }
        else { n++; docCard(560, 40 + (i - 1) * 88, 330, { tag: `docs[${i - 1}]`, col: ACC, lines: [`name: ${ROWS[i][0]} · age: ${ROWS[i][1]} …`], meta: [['row', String(i - 1)]] }); } }
      lenTag(40, 290, n); sub(150, 320, '헤더는 Document가 아니라 열 이름으로 쓰인다', fade(u, 1.8), { 'font-size': 14.5, 'text-anchor': 'start' }); return; }
    if (k === 4) { grid(40, 90, { fill: 6 });
      const lines = ['name: 박서연', 'age: 28', 'role: PM'];
      const h = docCard(520, 80, 320, { tag: 'docs[0].page_content', col: ACC, lines: lines.map((s, i) => typed(s, E(u, 0.4 + i * 0.4, 0.9 + i * 0.4))), meta: [['source', '"users.csv"'], ['row', '0', true]] }, { mn: lerp(0, 2, E(u, 1.7, 2.4)) });
      [0, 1, 2].forEach((j) => { const cx = [83, 152, 226][j]; grow(cx, 124, 520, 124 + j * 20, E(u, 0.4 + j * 0.4, 0.8 + j * 0.4), ACC, { plain: true, op: 0.6 }); });
      mono(520, 80 + h + 34, '"name: 박서연\\nage: 28\\nrole: PM"', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
      sub(680, 80 + h + 60, '"열: 값" 을 줄바꿈으로 이은 문자열', fade(u, 2.4)); return; }
    // k5 source_column
    const sc = E(u, 0.3, 1.0);
    docCard(60, 80, 330, { tag: 'docs[0]', col: ACC, lines: ['name: 박서연 …'], meta: [['source', sc < 0.5 ? '"users.csv"' : '"박서연"', sc >= 0.5], ['row', '0']] });
    mono(60, 60, typed('CSVLoader(..., source_column="name")', E(u, 0.1, 0.8)), { 'font-size': 14, fill: INFO, 'font-weight': 700 });
    sub(225, 230, 'source 가 파일 이름 대신 행의 name 값', fade(u, 1.0), { 'font-size': 14.5 });
    pill(640, 90, '"박서연 직무?"', INK, pop(u, 1.3), { fs: 15 });
    [['박서연', true], ['김지훈'], ['이수민'], ['정태형']].forEach(([n, hit], i) => { const y = 150 + i * 48, s = pop(u, 1.5 + i * 0.1);
      card(640, y, 220, 38, { rx: 8, stroke: hit ? ACC : GRID, fill: hit ? ACCBG : PANEL, sw: hit ? 2.4 : 1.5, s, text: `source: ${n}`, fs: 14, mono: true, color: hit ? ACC : MUT }); });
    grow(640, 110, 640, 128, E(u, 1.8, 2.1), ACC);
    sub(640, 362, '행 하나가 통째로 검색 단위가 된다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // ---------- 4. UnstructuredMarkdownLoader ----------
  const MD = [['# Project Setup', 'Title', WARN], ['본 프로젝트는 LangChain 학습용 예제입니다…', 'NarrativeText', INFO], ['## Installation', 'Title', WARN], ['uv pip install -r requirements.txt', 'CodeSnippet', GOOD]];
  function mdFile(x, y, o) { o = o || {}; const w = 380;
    el('rect', { x, y, width: w, height: 200, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 14, y + 24, 'README.md', { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: o.op ?? 1 });
    const rows = [[MD[0][0], 0], [MD[1][0], 1], [MD[2][0], 2], ['```', 3], [MD[3][0], 3], ['```', 3]];
    rows.forEach(([s, e], i) => { const show = o.lines ?? 6; if (i >= show) return; const hot = o.hot && o.hot.includes(e);
      mono(x + 14, y + 54 + i * 24, s, { 'font-size': 13.5, 'font-weight': s.startsWith('#') ? 800 : 400, fill: hot ? MD[e][2] : INK, opacity: (o.op ?? 1) * (o.dim && o.dim.includes(e) ? 0.12 : 1) }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { fileIcon(120, 190, 'MD', WARN, 'README.md', { s: pop(u, 0.2) });
      loader(450, 190, 'UnstructuredMarkdownLoader', null, { s: pop(u, 0.8) });
      pill(450, 262, 'pip install "unstructured[md]"', WARN, pop(u, 1.3), { mono: true, fs: 13.5 });
      sub(450, 300, 'unstructured 패키지가 문서를 요소로 나눈다', fade(u, 1.7)); return; }
    if (k === 1) { mdFile(40, 70, { lines: Math.floor(lerp(0, 6, E(u, 0.2, 1.4))) });
      [['헤더', 0, 118], ['문단', 1, 142], ['헤더', 2, 166], ['코드블록', 3, 214]].forEach(([s, e, y], i) => { const col = MD[e][2];
        grow(430, y - 5, 470, y - 5, E(u, 1.4 + i * 0.2, 1.7 + i * 0.2), col, { plain: true }); tx(480, y, s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.5 + i * 0.2) }); });
      tx(700, 170, '요소 네 덩어리', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 2.2) }); return; }
    if (k === 2 || k === 3) { const pick = k === 3 ? E(u, 0.3, 0.9) : 0;
      zone(40, 60, 420, 300, 'mode="single"  (기본값)', { fill: SOFT, op: k === 3 ? lerp(1, 0.35, pick) : fade(u, 0.2) });
      docCard(70, 110, 360, { tag: 'docs[0]', col: ACC, lines: ['Project Setup', '본 프로젝트는 LangChain…', 'Installation', 'uv pip install -r …'] }, { op: k === 3 ? lerp(1, 0.35, pick) : fade(u, 0.4) });
      sub(250, 330, 'Document 1개', k === 3 ? lerp(1, 0.35, pick) : fade(u, 0.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      zone(500, 60, 420, 300, 'mode="elements"', { fill: k === 3 ? ACCBG : SOFT, stroke: k === 3 ? ACC : 'none', op: fade(u, 0.8) });
      MD.forEach(([s, cat, col], i) => card(710, 112 + i * 52, 360, 40, { rx: 8, stroke: col, sw: 2, text: cat, fs: 14, color: col, s: k === 2 ? pop(u, 1.0 + i * 0.2) : 1 }));
      sub(710, 340, 'Document 4개', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 3) { mono(480, 396, typed('UnstructuredMarkdownLoader("README.md", mode="elements")', E(u, 0.9, 2.0)), { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 }); check(895, 84, 11, pop(u, 0.9)); }
      return; }
    if (k === 4) { mdFile(30, 80, { op: lerp(1, 0.35, E(u, 1.6, 2.2)), dim: [0, 1, 2, 3].filter((i) => E(u, 0.3 + i * 0.35, 1.0 + i * 0.35) > 0) });
      let n = 0;
      MD.forEach(([s, cat, col], i) => { const f = E(u, 0.3 + i * 0.35, 1.0 + i * 0.35); if (f <= 0) return; const ty = 50 + i * 86;
        if (f < 1) { const yy = [134, 158, 182, 230][i]; mono(lerp(44, 470, f), lerp(yy, ty + 40, f), s.slice(0, 22), { 'font-size': 13.5, 'font-weight': 700, fill: col }); return; }
        n++; docCard(470, ty, 360, { tag: `docs[${i}]`, col: ACC, lines: [s.replace(/^#+ /, '').slice(0, 32)] }); });
      lenTag(850, 400, n, { anchor: 'end' }); return; }
    if (k === 5) { MD.forEach(([s, cat, col], i) => { const y = 60 + i * 84, f = E(u, 0.2 + i * 0.35, 0.8 + i * 0.35);
        docCard(40, y, 400, { tag: `docs[${i}]`, col: ACC, lines: [s.replace(/^#+ /, '').slice(0, 36)] });
        grow(446, y + 34, 520, y + 34, f, col);
        pill(620, y + 34, `category: ${cat}`, col, pop(u, 0.5 + i * 0.35), { mono: true, fs: 14 }); });
      sub(800, 390, 'metadata["category"]', fade(u, 2.0), { class: 'mono', 'font-size': 14 }); return; }
    // k6 왜 elements
    pill(480, 50, '질문: "설치 명령어가 뭐야?"', INK, pop(u, 0.2), { fs: 15 });
    zone(40, 90, 420, 270, 'single: 섞인 한 덩어리', { fill: SOFT });
    ['Project Setup', '본 프로젝트는 LangChain…', 'Installation', 'uv pip install -r …'].forEach((s, i) => mono(62, 140 + i * 28, s, { 'font-size': 14, fill: i === 3 ? GOOD : MUT, 'font-weight': i === 3 ? 700 : 400 }));
    sub(250, 290, '명령어 한 줄에 설명 문장이 섞여', fade(u, 0.8), { 'font-size': 14.5 }); sub(250, 314, '벡터가 흐려진다', fade(u, 0.9), { 'font-size': 14.5 });
    zone(500, 90, 420, 270, 'elements: 요소별', { fill: ACCBG, stroke: ACC, op: fade(u, 1.1) });
    MD.forEach(([s, cat, col], i) => { const hit = cat === 'CodeSnippet', y = 140 + i * 50;
      card(710, y, 370, 40, { rx: 8, stroke: hit ? GOOD : GRID, sw: hit ? 3 : 1.5, fill: hit ? GOODBG : PANEL, text: cat, fs: 14, color: hit ? GOOD : MUT, s: pop(u, 1.2 + i * 0.12) }); });
    check(915, 290, 10, pop(u, 1.9)); sub(710, 340, 'CodeSnippet 만 정확히 걸린다', fade(u, 2.0), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); }

  // ---------- 5. DirectoryLoader ----------
  const FILES = [['report.pdf', 'PDF', BAD, 'PyPDFLoader', 3], ['users.csv', 'CSV', GOOD, 'CSVLoader', 4], ['README.md', 'MD', WARN, 'UnstructuredMarkdownLoader', 1]];
  function tree(x, y, o) { o = o || {}; mono(x, y, 'docs/', { 'font-size': 16, 'font-weight': 800 });
    FILES.forEach(([n, kind, col], i) => { const yy = y + 36 + i * 40, on = !o.on || o.on.includes(i);
      mono(x + 6, yy, i < 2 ? '├──' : '└──', { 'font-size': 15, fill: MUT });
      el('rect', { x: x + 42, y: yy - 15, width: 40, height: 20, rx: 4, fill: on ? col : OFF, opacity: o.op ?? 1 });
      tx(x + 62, yy, kind, { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
      mono(x + 92, yy, n, { 'font-size': 15, fill: on ? INK : OFF, 'font-weight': on ? 700 : 400 }); }); }
  function docBlocks(x, y, counts, o) { o = o || {}; let i = 0; const out = [];
    counts.forEach(([n, col], j) => { for (let m = 0; m < n; m++) { const s = o.s ? o.s(j, m, i) : 1;
      if (s > 0) { card(x + (i % 4) * 66 + 28, y + Math.floor(i / 4) * 50 + 20, 58, 40, { rx: 6, stroke: col, sw: 2, s, text: `[${i}]`, fs: 13.5, mono: true, color: col }); out.push(i); } i++; } });
    return out.length; }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const names = ['DirectoryLoader', 'PyPDFLoader', 'CSVLoader', 'UnstructuredMarkdownLoader'];
      mono(60, 70, 'from langchain_community.document_loaders import (', { 'font-size': 14.5, fill: MUT });
      names.forEach((n, i) => { const s = pop(u, 0.3 + i * 0.3), col = i === 0 ? ACC : FILES[i - 1][2];
        card(90 + (tw(n, 15) + 30) / 2 + (i === 0 ? 0 : 40), 120 + i * 58, tw(n, 15) + 30, 42, { rx: 8, stroke: col, sw: 2, text: n, fs: 15, mono: true, color: col, s }); });
      mono(60, 360, ')', { 'font-size': 14.5, fill: MUT });
      sub(700, 180, '폴더 담당 1개', fade(u, 0.6), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      sub(700, 250, '확장자 담당 3개', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { tree(80, 110, { op: 1 });
      [0, 1, 2].forEach((i) => fileIcon(560 + i * 120, 190, FILES[i][1], FILES[i][2], FILES[i][0], { s: pop(u, 0.4 + i * 0.3) }));
      tx(680, 320, '형식이 섞인 폴더 하나', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { const scan = E(u, 0.4, 1.8);
      tree(80, 110, { on: scan > 0.9 ? [0] : [0, 1, 2] });
      pill(460, 70, 'glob="**/*.pdf"', ACC, pop(u, 0.2), { mono: true, fs: 15 });
      const yy = lerp(146, 226, scan); if (scan > 0 && scan < 1) el('rect', { x: 70, y: yy - 20, width: 300, height: 28, rx: 6, fill: ACCBG, opacity: 0.8 });
      [0, 1, 2].forEach((i) => { const done = scan * 3 > i + 0.8; if (!done) return; i === 0 ? check(380, 141, 9, 1) : cross(380, 141 + i * 40, 8, 1); });
      loader(640, 200, 'DirectoryLoader', 'loader_cls=PyPDFLoader', { s: pop(u, 1.6) });
      sub(640, 262, '고른 파일을 어떤 로더에 맡길지 정한다', fade(u, 2.0)); return; }
    if (k === 3) { tree(40, 110, { on: [0] });
      loader(420, 150, 'DirectoryLoader', null, { w: 190 }); loader(420, 250, 'PyPDFLoader', null, { w: 190, col: BAD, fill: BADBG, s: pop(u, 0.3) });
      grow(420, 172, 420, 226, E(u, 0.3, 0.7), BAD); sub(500, 204, '위임', fade(u, 0.6), { 'font-weight': 700 });
      const n = docBlocks(600, 120, [[3, BAD]], { s: (j, m) => pop(u, 0.9 + m * 0.3) });
      lenTag(600, 260, n); sub(700, 292, 'report.pdf 3쪽 = Document 3개', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 4 || k === 5) {
      mono(40, 60, 'def load_all(folder):', { 'font-size': 15, 'font-weight': 700 }); mono(60, 88, 'loaders = [', { 'font-size': 15, fill: MUT });
      FILES.forEach(([n, kind, col, L], i) => { const y = 130 + i * 70, s = k === 4 ? pop(u, 0.3 + i * 0.35) : 1;
        card(250, y, 330, 50, { rx: 8, stroke: ACC, sw: 2, s, text: `DirectoryLoader(glob="**/*.${kind.toLowerCase()}")`, fs: 13.5, mono: true });
        if (k === 5) { grow(420, y, 520, y, E(u, 0.3 + i * 0.4, 0.7 + i * 0.4), col);
          card(530 + (tw(L, 14.5) + 28) / 2, y, tw(L, 14.5) + 28, 40, { rx: 8, stroke: col, sw: 2, text: L, fs: 14.5, mono: true, color: col, s: pop(u, 0.6 + i * 0.4) }); } });
      mono(60, 352, ']', { 'font-size': 15, fill: MUT });
      sub(480, 395, k === 4 ? '확장자마다 로더가 달라서 DirectoryLoader 를 여러 개 둔다' : 'loader_cls 로 확장자별 로더를 지정한다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 6 || k === 7) { const counts = [[3, BAD], [4, GOOD], [1, WARN]];
      FILES.forEach(([n, kind, col, L, m], i) => { pill(130, 110 + i * 70, `${kind} → ${m}개`, col, k === 6 && i > 0 ? pop(u, 0.2 + (i - 1) * 0.6) : 1, { fs: 15 }); });
      sub(130, 330, 'MD 는 기본 mode="single" → 1개', k === 6 ? fade(u, 1.6) : 1, { 'font-size': 14 });
      const n = docBlocks(330, 100, counts, { s: (j, m) => (k === 7 || j === 0 ? 1 : pop(u, 0.4 + (j - 1) * 0.6 + m * 0.1)) });
      mono(620, 70, 'docs.extend(ld.load())', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle' });
      if (k === 6) lenTag(330, 290, n);
      if (k === 7) { lenTag(330, 290, 8); banner(500, 350, 'PDF 3 + CSV 4 + MD 1 = 8', pop(u, 0.3));
        [['docs[0] source', 'docs/report.pdf', BAD], ['docs[3] source', 'docs/users.csv', GOOD], ['docs[7] source', 'docs/README.md', WARN]].forEach(([a, b, col], i) => {
          mono(640, 120 + i * 50, a + ':', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8 + i * 0.3) }); mono(640, 142 + i * 50, b, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.9 + i * 0.3) }); });
        sub(760, 285, '어디서 왔는지는 metadata 에만 남는다', fade(u, 1.8), { 'font-size': 14 }); }
      return; }
    // k8 어떤 원본이든 같은 Document
    [['PDF', BAD], ['Web', INFO], ['CSV', GOOD], ['MD', WARN]].forEach(([s, col], i) => { const y = 80 + i * 72;
      pill(90, y, s, col, pop(u, 0.2 + i * 0.15), { fs: 15 }); dot([[130, y], [330, 200]], seg(u, 0.5 + i * 0.15, 1.3 + i * 0.15), col, 6);
      grow(130, y, 318, 198, E(u, 0.3 + i * 0.15, 0.6 + i * 0.15), GRID, { plain: true }); });
    card(400, 200, 150, 90, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.6, s: pop(u, 0.9) });
    tx(400, 194, 'Document', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
    mono(400, 218, 'content+metadata', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    [['TextSplitter', 'II-1-2'], ['Embedding', 'II-1-3'], ['VectorStore', 'II-2-1']].forEach(([s, ch], i) => { const x = 590 + i * 130;
      grow(x - 105 + (i === 0 ? 30 : 0), 200, x - 58, 200, E(u, 1.3 + i * 0.3, 1.6 + i * 0.3), ACC);
      card(x, 200, 116, 50, { rx: 8, stroke: INK, sw: 2, text: s, fs: 14, s: pop(u, 1.4 + i * 0.3) }); mono(x, 246, ch, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6 + i * 0.3) }); });
    sub(480, 340, '다음 단계는 원본 형식을 몰라도 된다', fade(u, 2.2), { 'font-size': 16, fill: INK, 'font-weight': 700 }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: '3쪽짜리 PDF를 PyPDFLoader로 load() 하면 첫 쪽 Document의 metadata.page 값은 무엇인가?',
      o: ['1', '0', '3'], a: 1,
      why: 'page는 0부터 센다. 사람이 보는 쪽 번호 "1"은 page_label에 따로 들어간다.' },
    { q: 'React처럼 JS로 본문을 그리는 페이지를 WebBaseLoader로 읽으면 어떻게 되나?',
      o: ['본문이 비어 있거나 거의 없다', 'JS를 실행해 완성된 본문을 가져온다', 'HTML 태그까지 그대로 page_content에 들어간다'], a: 0,
      why: 'WebBaseLoader는 requests로 받은 HTML을 BeautifulSoup으로 해석할 뿐 JS를 실행하지 않는다. 이런 페이지는 PlaywrightURLLoader로 읽는다.' },
    { q: '헤더 1행과 데이터 4행인 users.csv를 CSVLoader로 읽은 결과는 무엇인가?',
      o: ['Document 1개, 표 전체가 한 문자열', 'Document 5개, 헤더도 한 개', 'Document 4개, 행마다 "열: 값" 문자열'], a: 2,
      why: '헤더는 열 이름으로 쓰이고 데이터 행마다 Document가 하나씩 생긴다. page_content는 "name: 박서연\\nage: 28\\nrole: PM" 꼴이다.' },
    { q: 'UnstructuredMarkdownLoader에 mode="elements"를 주면 무엇이 달라지나?',
      o: ['헤더·문단·코드블록이 각각 Document가 되고 category가 붙는다', '파일 전체가 Document 1개로 합쳐진다', '마크다운 기호가 HTML로 바뀐다'], a: 0,
      why: 'elements 모드는 요소마다 Document를 만든다. README는 Title·NarrativeText·Title·CodeSnippet 네 개로 나뉘었다.' },
    { q: 'docs/에 3쪽 PDF, 4행 CSV, README.md가 있을 때 load_all()이 돌려주는 Document 수는?',
      o: ['3개', '6개', '8개'], a: 2,
      why: 'PDF 3쪽은 3개, CSV 4행은 4개, MD는 기본 mode="single"이라 1개다. 합쳐서 8개다.' },
  ];

  const summary = [
    'PDF, 웹, CSV, 마크다운은 생김새가 달라 그대로는 같은 코드로 다룰 수 없다.',
    'Loader가 원본을 page_content와 metadata를 가진 Document로 바꿔 준다.',
    '나누는 단위는 로더마다 다르다. PDF는 쪽, CSV는 행, 웹은 URL, 마크다운은 파일이나 요소다.',
    'DirectoryLoader로 폴더를 한 번에 읽으면 3쪽 PDF, 4행 CSV, README가 Document 8개가 된다.',
  ];
  const review = [
    { q: '사내 매뉴얼 PDF를 넣었더니 몇몇 쪽의 page_content가 빈 문자열이다. 먼저 의심할 것은?',
      o: ['그 쪽이 글자가 아니라 이미지로 스캔돼 있다', 'chunk_size가 너무 작다', 'metadata의 page 번호가 0부터 시작한다'], a: 0,
      why: 'PyPDFLoader는 PDF 안의 글자를 뽑을 뿐 그림 속 글자는 읽지 못한다. 스캔본은 OCR이 되는 로더로 바꿔야 한다.' },
    { q: '회원 CSV로 RAG를 만들었는데 답에 어느 회원 행인지 출처가 users.csv로만 나온다. 가장 간단한 손질은?',
      o: ['DirectoryLoader로 바꾼다', 'CSVLoader에 source_column="name"을 준다', 'mode="elements"를 준다'], a: 1,
      why: 'source_column을 주면 metadata.source가 파일 이름 대신 그 행의 값(예: 박서연)이 된다.' },
    { q: '폴더를 DirectoryLoader로 읽었더니 README.md가 Document 1개로만 들어왔다. 왜인가?',
      o: ['마크다운은 원래 읽을 수 없어서 요약만 들어간다', 'glob이 .md를 한 번만 찾았기 때문이다', 'UnstructuredMarkdownLoader의 기본 mode가 "single"이라서'], a: 2,
      why: '기본 mode는 파일 전체를 한 Document로 만든다. 요소별로 나누려면 loader_kwargs로 mode="elements"를 넘긴다.' },
  ];

  R.page({ title: '원본 → Loader → Document', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
