/* V-1-2 Complexity / Depth Limit — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 중첩 쿼리와 행 수(로그 막대), 깊이 자, 복잡도 점수 트리, 5초 타임라인, 해시 allowlist.
 * 깊이·점수·에러 문구는 graphql-depth-limit 1.1 · graphql-query-complexity 1.x · @apollo/server 4로 돌려 확인한 값.
 * 행 수는 페이지 가정(사용자 1000명, 사람당 글 50개)으로 곱한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, cross, check, lock, dbIcon, spans, tokens, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  function code(x, y, lines, shown, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 7, n = lines.length;
    const w = o.w || Math.max(...lines.map((l) => tw(Array.isArray(l) ? l[0] : l, fs))) + 28, h = n * lh + 16;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: o.op ?? 1 });
    if (o.title) tx(x + 4, y - 8, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: o.op ?? 1 });
    const sh = shown == null ? n : shown;
    lines.forEach((l, i) => { if (i >= Math.ceil(sh)) return; let [s, col] = Array.isArray(l) ? l : [l, null];
      if (i === Math.ceil(sh) - 1 && sh % 1) s = s.slice(0, Math.round(s.length * (sh % 1)));
      const yy = y + 8 + fs + i * lh;
      if (col) mono(x + 14, yy, s, { 'font-size': fs, fill: col, 'font-weight': 600, opacity: o.op ?? 1 });
      else spans(x + 14, yy, tokens(s), { 'font-size': fs, opacity: o.op ?? 1 }); });
    return { w, h }; }
  const fmt = (v) => v.toLocaleString('en-US');

  // ---------- 1. 무한 중첩 ----------
  // 레벨 L(1부터)의 행 수: users 1000, posts ×50, author ×1 (페이지 주석의 가정)
  const rowsAt = (L) => 1000 * Math.pow(50, Math.floor(L / 2));
  const FIELD = (L) => (L === 1 ? 'users' : L % 2 === 0 ? 'posts' : 'author');
  function bombText(depth, grow_) { const L = ['query Bomb {']; const show = Math.min(depth, 8);
    for (let i = 1; i <= show; i++) L.push(' '.repeat(i * 2) + FIELD(i) + ' {');
    if (depth > 8) L.push(' '.repeat(18) + '… 12 단계 더');
    L.push(' '.repeat(Math.min(depth, 9) * 2 + 2) + 'title');
    code(30, 40, L.map((s, i) => (i <= grow_ ? s : '')), Math.min(L.length, grow_ + 1), { fs: 14, lh: 25, w: 300, title: 'step1-malicious-query.graphql' }); }
  function rowBars(depth, u0) { const x0 = 470, W = 420, top = 52, gap = 33;
    tx(x0, top - 16, '레벨별 처리 행 수 (로그 눈금)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const levels = []; for (let i = 1; i <= Math.min(depth, 8); i++) levels.push(i); if (depth > 8) levels.push(depth);
    levels.forEach((L, j) => { const y = top + j * gap, v = rowsAt(L), lg = Math.log10(v), g = clamp(u0 * levels.length - j);
      if (g <= 0) return; const w = (W - 150) * (lg / 20) * g, hot = v >= 1e8;
      mono(x0 - 8, y + 14, String(L), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      el('rect', { x: x0, y, width: Math.max(3, w), height: 20, rx: 4, fill: hot ? BAD : L % 2 ? INFO : ACC, opacity: 0.85 });
      mono(x0 + w + 8, y + 15, L === 20 ? '약 9.8 × 10¹⁹' : fmt(v), { 'font-size': 13.5, 'font-weight': 700, fill: hot ? BAD : INK, opacity: g }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 3) { const depth = [1, 4, 8, 20][k], prevD = [0, 1, 4, 8][k];
      const g = k === 0 ? E(u, 0.2, 0.8) * 2 : (prevD + 1) + E(u, 0.2, 1.2) * (Math.min(depth, 8) - prevD + (depth > 8 ? 1 : 0));
      bombText(depth, Math.floor(g)); rowBars(depth, k === 0 ? E(u, 0.6, 1.2) : clamp(lerp(Math.min(prevD, 8) / Math.min(depth + (depth > 8 ? 1 : 0), 9), 1, E(u, 0.4, 2.0))));
      pill(180, 386, `깊이 ${depth}`, depth > 7 ? BAD : depth > 3 ? WARN : GOOD, k === 0 ? pop(u, 0.6) : 1, { fs: 15 });
      if (k === 1) note(470, 330, 'posts 한 겹마다 ×50, 덧셈이 아니라 곱셈', fade(u, 2.0));
      if (k === 2) note(470, 360, 'author는 ×1 이라도 다시 posts를 열 수 있다', fade(u, 2.0), { fill: BAD });
      if (k === 3) { note(470, 390, 'DataLoader는 쿼리 수만 줄인다. 행 수는 그대로', fade(u, 2.0), { fill: BAD }); }
      return; }
    if (k === 4) { const m = E(u, 0.2, 2.0);
      card(240, 200, 200, 120, { rx: 12, stroke: m > 0.8 ? BAD : INK, sw: 2.5, text: 'GraphQL 서버', fs: 16 });
      el('rect', { x: 160, y: 236, width: 160, height: 16, rx: 4, fill: SOFT }); el('rect', { x: 160, y: 236, width: 160 * m, height: 16, rx: 4, fill: m > 0.8 ? BAD : WARN });
      tx(240, 282, '메모리', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (m > 0.98) pill(240, 110, 'OOM', BAD, pop(u, 2.0), { mono: true, fs: 18 });
      dbIcon(620, 200, 'DB', { stroke: WARN }); for (let i = 0; i < 8; i++) dot([[340, 200], [570, 200]], ((u * 0.9 + i / 8) % 1), WARN, 5);
      pill(620, 330, '요청은 단 1건', INK, pop(u, 0.6), { fs: 15 });
      note(480, 400, 'DB가 버텨도 결과를 모으는 서버가 먼저 죽는다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    const W = [['Depth Limit', '깊이 N까지'], ['Complexity', '가중치 합산'], ['Timeout', '시간 한도'], ['Allowlist', '등록된 쿼리만']];
    W.forEach(([a, b], i) => { const x = 210 + i * 170, s = pop(u, 0.3 + i * 0.4);
      el('rect', { x: x - 14, y: 90, width: 28, height: 220, rx: 6, fill: i === 3 ? ACC : INFO, opacity: 0.25 + i * 0.18, transform: `translate(${x} 200) scale(1 ${s}) translate(${-x} -200)` });
      tx(x, 340, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(x, 362, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    dot([[60, 200], [900, 200]], E(u, 0.2, 2.4), BAD, 8);
    note(480, 60, '뒤로 갈수록 강하고 제약도 크다', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  // ---------- 2. Depth Limit ----------
  function pipeline(gate, u, hot) { const P = [['parse', 120], ['validate', 300], ['execute', 480]];
    P.forEach(([n, x], i) => { card(x, 50, 120, 40, { rx: 8, text: n, mono: true, fs: 15, stroke: n === 'validate' && gate ? ACC : GRID, color: n === 'validate' && gate ? ACC : INK, fill: n === 'validate' && gate ? ACCBG : PANEL });
      if (i < 2) grow(x + 62, 50, x + 118, 50, 1, MUT); });
    if (gate) pill(300, 96, 'depthLimit(7)', ACC, gate, { mono: true, fs: 13.5 });
    if (hot === 'blocked') cross(540, 50, 0, 0); }
  function ruler(n, o) { o = o || {}; const x0 = 90, y = 230, w = 64;
    for (let i = 0; i < 10; i++) { const on = i < n, over = on && i >= 7;
      el('rect', { x: x0 + i * (w + 4), y, width: w, height: 46, rx: 6, fill: on ? (over ? BAD : o.col || GOOD) : PANEL, stroke: on ? 'none' : GRID, 'stroke-width': 1.5, opacity: on ? (o.op ? o.op(i) : 0.85) : 1 });
      if (o.labels && o.labels[i]) mono(x0 + i * (w + 4) + w / 2, y + 28, o.labels[i], { 'font-size': 13.5, 'text-anchor': 'middle', fill: on ? PANEL : MUT, 'font-weight': 700, opacity: o.op ? o.op(i) : 1 });
      mono(x0 + i * (w + 4) + w / 2, y + 66, String(i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    if (o.limit) { const lx = x0 + 7 * (w + 4) - 2; el('line', { x1: lx, y1: y - 26, x2: lx, y2: y + 76, stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: o.limit });
      tx(lx + 6, y - 12, '한도 7', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: o.limit }); } }
  function s2(t, c) { const { k, u } = c;
    if (k === 5) { pipeline(1, 1); ruler(2, { labels: ['users', 'posts'], limit: 1 });
      check(270, 330, 11, pop(u, 0.5)); note(290, 336, '깊이 2 → 통과', fade(u, 0.5), { fill: GOOD });
      const gx = 560, gy = 328, cols = 40, rows = 6, fill = E(u, 0.8, 2.0);
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) if ((r * cols + q) / (rows * cols) < fill) el('rect', { x: gx + q * 8, y: gy + r * 8, width: 6, height: 6, fill: BAD, opacity: 0.7 });
      mono(gx, gy - 12, 'users(first:10000) × posts(first:1000)', { 'font-size': 13.5, fill: MUT });
      mono(gx, gy + 72, '= 10,000,000 행', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      note(90, 400, '깊이는 세로만 잰다. 가로 폭증은 다음 단계가 맡는다', fade(u, 2.2)); return; }
    pipeline(k === 0 ? 0 : k === 1 ? pop(u, 0.4) : 1, u);
    if (k === 0) { pill(300, 96, 'import depthLimit (아직 안 붙임)', MUT, pop(u, 0.3), { fs: 13.5 });
      ruler(10, { col: WARN, op: (i) => fade(u, 0.5 + i * 0.12) }); pill(820, 253, '… 20', BAD, pop(u, 1.8), { mono: true, fs: 15 });
      dot([[60, 50], [560, 50]], seg(u, 0.4, 2.2), BAD, 8); note(90, 380, '깊이 20 Bomb도 그대로 execute까지 간다', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 1) { ruler(0, { limit: E(u, 0.6, 1.2) }); note(90, 380, '깊이 8 이상이면 validate에서 끝난다', fade(u, 1.6)); return; }
    if (k === 2) { const n = Math.round(E(u, 0.2, 1.4) * 8); ruler(n, { labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], limit: 1 });
      mono(90, 200, 'query Deep { a { b { … h { i } … } } }', { 'font-size': 14, fill: MUT });
      code(420, 330, [["'Deep' exceeds maximum operation depth of 7", BAD]], fade(u, 1.6), { fs: 14 });
      cross(566, 50, 12, pop(u, 1.6)); mono(90, 400, 'resolver 실행 0번', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { const n = Math.round(E(u, 0.2, 1.2) * 4); ruler(n, { labels: ['user', 'posts', 'comm…', 'author'], limit: 1 });
      el('rect', { x: 90 + 4 * 68, y: 230, width: 64, height: 46, rx: 6, fill: 'none', stroke: MUT, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: fade(u, 1.4) });
      mono(90 + 4 * 68 + 32, 258, 'name', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) });
      note(90, 360, '자식이 없는 name은 세지 않는다 → 깊이 4', fade(u, 1.7)); check(566, 50, 12, pop(u, 2.0)); return; }
    // k4 ignore
    ruler(3, { labels: ['user', 'posts', 'author'], limit: 1 });
    code(90, 320, ['__schema { types { fields { … } } }', 'ignore: ["whitelistedFieldName"]'], E(u, 0.3, 1.2) * 2, { fs: 14 });
    note(520, 342, '__로 시작하면 원래 안 센다', fade(u, 1.4), { fill: GOOD }); note(520, 372, '그 밖의 예외는 ignore에 적는다', fade(u, 1.8), { fill: MUT }); }

  // ---------- 3. Complexity ----------
  function gauge(x, y, w, v, max, o) { o = o || {}; const f = clamp(v / max);
    el('rect', { x, y, width: w, height: 18, rx: 9, fill: SOFT, stroke: GRID }); el('rect', { x, y, width: Math.max(4, w * f), height: 18, rx: 9, fill: v > max ? BAD : o.col || ACC });
    mono(x + w + 10, y + 14, `${fmt(Math.round(v))} / ${fmt(max)}`, { 'font-size': 14, 'font-weight': 800, fill: v > max ? BAD : INK }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(140, 120, 180, 50, { rx: 10, text: '필드 하나', fs: 15, s: pop(u, 0.2) });
      grow(232, 120, 300, 120, E(u, 0.4, 0.7), MUT); card(420, 120, 230, 56, { rx: 10, text: 'directiveEstimator\n@complexity 있나?', fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      grow(536, 120, 640, 120, E(u, 0.9, 1.2), GOOD); mono(650, 126, '있으면 value 사용', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.1) });
      grow(420, 150, 420, 210, E(u, 1.2, 1.5), MUT); card(420, 240, 230, 50, { rx: 10, text: 'simpleEstimator → 1', mono: true, fs: 14, s: pop(u, 1.5) });
      gauge(140, 320, 380, 0, 1000); tx(140, 306, 'MAX_COMPLEXITY', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.7) });
      note(560, 220, 'fieldExtensionsEstimator를 쓰면', fade(u, 2.0), { fill: BAD }); note(560, 246, '@complexity를 못 읽어 501000 짜리가 4점', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 1) { terminal(60, 60, 520, 200, ['$ node server.js', 'Query complexity: 40', 'Query complexity: 150', 'Query complexity: 51'], E(u, 0.2, 1.6) * 4, { title: '실행 로그' });
      [['posts { title }', 40], ['posts(first:50) { author { name } }', 150], ['trending { title }', 51]].forEach(([q, v], i) => { const y = 300 + i * 34, a = 1.4 + i * 0.25;
        mono(60, y + 14, q, { 'font-size': 13.5, opacity: fade(u, a) }); el('rect', { x: 400, y, width: 2.4 * v * E(u, a, a + 0.4), height: 18, rx: 4, fill: ACC });
        mono(410 + 2.4 * v, y + 14, String(v), { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, a + 0.3) }); });
      note(640, 120, '한도는 분포를 본 뒤 정한다', fade(u, 2.2)); return; }
    if (k === 2) { mono(60, 50, 'query($n: Int) { posts(first: $n) { title } }   variables: { n: 10000 }', { 'font-size': 14, 'font-weight': 700 });
      [['validationRules (variables: {})', 'first = 20 (기본값)', 40, '그대로 실행', BAD], ['plugin (request.variables)', 'first = 10000', 20000, '400 QUERY_TOO_COMPLEX', GOOD]].forEach(([n, f, v, r, col], i) => {
        const y = 120 + i * 140, a = 0.3 + i * 0.9; tx(60, y, n, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, a) });
        mono(60, y + 28, f, { 'font-size': 14, fill: MUT, opacity: fade(u, a + 0.2) }); gauge(330, y + 14, 300, v * E(u, a + 0.2, a + 0.7), 1000);
        pill(760, y + 62, r, col, pop(u, a + 0.7), { fs: 14 }); });
      note(60, 400, 'validation 단계에는 변수 값이 없다 (실행해서 확인)', fade(u, 2.2)); return; }
    if (k === 3) { tx(60, 60, 'posts(first) { title } = (1 + 1) × first', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      [[20, 40], [50, 100], [500, 1000]].forEach(([f, v], i) => { const y = 110 + i * 70, a = 0.3 + i * 0.4;
        mono(60, y + 16, `first: ${f}`, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); gauge(220, y, 460, v * E(u, a, a + 0.6), 1000); });
      note(60, 360, '리스트를 크게 요청할수록 점수가 비례해 오른다', fade(u, 1.8)); note(60, 390, 'Step 2에서 뚫린 가로 폭증이 여기서 걸린다', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 4) { [['trending', '@complexity(value: 50)', '비싼 집계', 50], ['externalApiResult', '@complexity(value: 100)', '외부 호출', 100], ['title', '표시 없음', '기본값', 1]].forEach(([f, d, w, v], i) => {
        const y = 90 + i * 90, a = 0.3 + i * 0.5; mono(60, y, f, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, a) }); mono(60, y + 24, d, { 'font-size': 13.5, fill: ACC, opacity: fade(u, a) });
        tx(60, y + 46, w, { 'font-size': 13.5, fill: MUT, opacity: fade(u, a) });
        for (let j = 0; j < Math.round(v * E(u, a, a + 0.8) / 2); j++) el('rect', { x: 380 + (j % 25) * 18, y: y - 14 + Math.floor(j / 25) * 18, width: 14, height: 14, rx: 2, fill: i === 2 ? GOOD : ACC, opacity: 0.8 });
        if (v === 1) el('rect', { x: 380, y: y - 14, width: 7, height: 14, rx: 2, fill: GOOD, opacity: fade(u, a) }); });
      sub(620, 380, '칸 하나 = 2점 · 응답 크기가 아니라 서버가 쓰는 자원으로 매긴다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // 트리 계산 (k5 통과, k6 거절)
    const big = k === 6, F = big ? 500 : 50;
    const nodes = big ? [['posts(first:500)', 480, 80], ['author', 480, 170], ['posts(first:500)', 480, 260], ['title', 480, 350]] : [['posts(first:50)', 480, 100], ['author', 480, 210], ['name', 480, 320]];
    const vals = big ? [501000, 1001, 1000, 1] : [150, 2, 1];
    const forms = big ? ['(1 + 1001) × 500', '1 + 1000', '(1 + 1) × 500', '1'] : ['(1 + 2) × 50', '1 + 1', '1'];
    nodes.forEach(([n, x, y], i) => { card(300, y, 220, 46, { rx: 8, text: n, mono: true, fs: 15 }); if (i) el('line', { x1: 300, y1: nodes[i - 1][2] + 23, x2: 300, y2: y - 23, stroke: GRID, 'stroke-width': 2 }); });
    nodes.slice().reverse().forEach(([n, x, y], j) => { const i = nodes.length - 1 - j, a = 0.3 + j * 0.45;
      mono(430, y + 5, forms[i], { 'font-size': 14.5, fill: MUT, opacity: fade(u, a) }); mono(640, y + 5, '= ' + fmt(vals[i]), { 'font-size': 16, 'font-weight': 800, fill: i === 0 ? (big ? BAD : ACC) : INK, opacity: fade(u, a + 0.2) }); });
    gauge(60, 396, 420, vals[0] * E(u, 1.8, 2.4), 1000);
    if (big) pill(820, 80, '400 거절', BAD, pop(u, 2.3), { fs: 15 }); else pill(820, 100, '통과', GOOD, pop(u, 2.0), { fs: 15 });
    void F; }

  // ---------- 4. Timeout ----------
  const TX = (s) => 120 + s * 120;
  function timeline(o) { o = o || {}; el('line', { x1: TX(0), y1: 330, x2: TX(6), y2: 330, stroke: MUT, 'stroke-width': 1.8 });
    for (let s = 0; s <= 6; s++) { el('line', { x1: TX(s), y1: 330, x2: TX(s), y2: 336, stroke: MUT }); mono(TX(s), 354, s + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    if (o.slow) { el('line', { x1: TX(3), y1: 70, x2: TX(3), y2: 330, stroke: WARN, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: o.slow }); tx(TX(3) + 6, 84, 'slow 경고 3s', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: o.slow }); }
    if (o.abort) { el('line', { x1: TX(5), y1: 70, x2: TX(5), y2: 330, stroke: BAD, 'stroke-width': 2.5, opacity: o.abort }); tx(TX(5) + 6, 84, 'abort 5s', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: o.abort }); } }
  function bar(y, s0, s1_, col, label, f) { if (f <= 0) return; el('rect', { x: TX(s0), y, width: (TX(s1_) - TX(s0)) * f, height: 28, rx: 6, fill: col, opacity: 0.8 });
    tx(TX(s0) + 10, y + 19, label, { 'font-size': 14, 'font-weight': 700, fill: PANEL, opacity: f > 0.5 ? 1 : 0 }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2 || k === 4) timeline({ slow: k >= 1 ? 1 : 0, abort: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) { pill(TX(0), 110, 'requestDidStart', ACC, pop(u, 0.2), { mono: true, fs: 14 });
      el('rect', { x: TX(0), y: 180, width: (TX(5) - TX(0)) * E(u, 0.5, 1.8), height: 22, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      tx(TX(0) + 8, 172, 'setTimeout(() => controller.abort(), 5000)', { 'font-size': 13.5, class: 'mono', fill: BAD, opacity: fade(u, 0.8) });
      note(TX(0), 260, '요청마다 AbortController와 타이머 하나', fade(u, 2.0)); return; }
    if (k === 1) { bar(150, 0, 1.2, GOOD, '응답', E(u, 0.2, 0.9)); pill(TX(1.2) + 80, 164, 'clearTimeout', GOOD, pop(u, 1.0), { mono: true, fs: 13.5 });
      bar(220, 0, 3.6, WARN, '느린 응답', E(u, 0.8, 1.8)); mono(TX(3.6) + 12, 240, 'console.warn("slow query …ms")', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 1.9) });
      sub(480, 400, '막대 길이는 예시', 1, { 'font-size': 13.5 }); return; }
    if (k === 2) { bar(150, 0, 0.8, BAD, '에러', E(u, 0.2, 0.7)); pill(TX(0.8) + 110, 164, 'didEncounterErrors', BAD, pop(u, 0.8), { mono: true, fs: 13.5 });
      const n = Math.round(E(u, 1.2, 2.4) * 8); for (let i = 0; i < n; i++) R.clock(TX(2.4) + i * 44, 240, 16, 0.6, WARN);
      note(TX(2.4) - 10, 290, '에러 경로를 안 지우면 요청마다 타이머가 남는다', fade(u, 1.4), { fill: WARN }); return; }
    if (k === 3) { [['context({ req })', 120], ['requestDidStart', 360], ['resolver', 600]].forEach(([n, x], i) => { const a = 0.2 + i * 0.4;
        card(x + 60, 140, 190, 50, { rx: 10, text: n, mono: true, fs: 14.5, stroke: i === 1 ? ACC : INK, color: i === 1 ? ACC : INK, s: pop(u, a) }); if (i) grow(x - 50, 140, x - 36, 140, E(u, a, a + 0.2), MUT); });
      mono(420, 200, 'contextValue.signal = controller.signal', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      dot([[420, 210], [660, 210], [660, 168]], seg(u, 1.4, 2.2), ACC, 7); mono(660, 240, 'ctx.signal', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      note(120, 320, '실행 순서: context → requestDidStart → resolver (실행해서 확인)', fade(u, 2.2)); note(120, 350, 'context 함수는 controller를 모르니 plugin이 넣는다', fade(u, 2.4), { fill: MUT }); return; }
    if (k === 4) { const f = E(u, 0.2, 2.2), end = Math.min(6, lerp(0, 6, f));
      el('rect', { x: TX(0), y: 180, width: TX(Math.min(end, 5)) - TX(0), height: 28, rx: 6, fill: INFO, opacity: 0.8 }); tx(TX(0) + 10, 199, 'db.posts.findMany({ signal })', { 'font-size': 13.5, fill: PANEL, 'font-weight': 700, class: 'mono' });
      if (end >= 5) { cross(TX(5) + 18, 194, 11, pop(u, 1.9)); code(TX(5) - 230, 240, [['Error: aborted: AbortError', BAD]], 1, { fs: 14, op: fade(u, 2.0) }); }
      return; }
    if (k === 5) { [['Apollo Router', 'traffic_shaping 5s'], ['GraphQL 서버', 'AbortController 5s'], ['외부 API', 'fetch(url, { signal })'], ['Postgres', 'statement_timeout = 5000']].forEach(([n, r], i) => {
        const y = 70 + i * 80, a = 0.2 + i * 0.4; card(250, y, 260, 56, { rx: 10, text: n, fs: 16, s: pop(u, a) }); pill(560, y, r, i === 3 ? ACC : INFO, pop(u, a + 0.2), { mono: true, fs: 13.5 });
        if (i) grow(250, y - 52, 250, y - 30, E(u, a - 0.1, a), MUT); });
      note(700, 220, '앱이 포기해도', fade(u, 2.0)); note(700, 248, 'DB가 돌면 부하는 그대로', fade(u, 2.2), { fill: BAD }); return; }
    code(120, 90, ['# router.yaml', 'traffic_shaping:', '  router:', '    timeout: 5s'], E(u, 0.2, 1.4) * 4, { fs: 16, lh: 30, w: 320 });
    note(500, 140, '코드 없이 설정 한 줄', fade(u, 1.5)); note(500, 170, '게이트웨이가 있으면 여기서 거는 편이 일관적', fade(u, 1.9), { fill: MUT }); }

  // ---------- 5. Allowlist ----------
  const HASH = [['query GetMe { me }', '0930d7a87c67'], ['query Feed { posts { id title } }', 'b4d3b8a00a04']];
  function hashTable(x, y, op, hot) { el('rect', { x, y, width: 400, height: 116, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    tx(x + 14, y + 22, 'persisted-queries.json', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op });
    HASH.forEach(([q, h], i) => { mono(x + 14, y + 52 + i * 30, h + '…', { 'font-size': 14, 'font-weight': 700, fill: hot === i ? GOOD : ACC, opacity: op }); mono(x + 150, y + 52 + i * 30, q.length > 26 ? q.slice(0, 25) + '…' : q, { 'font-size': 13.5, opacity: op }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { HASH.forEach(([q, h], i) => { const y = 110 + i * 120, a = 0.2 + i * 0.6;
        code(40, y - 26, [q], fade(u, a), { fs: 14 }); grow(360, y - 8, 470, y - 8, E(u, a + 0.3, a + 0.6), MUT); mono(415, y - 16, 'sha256', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, a + 0.3) });
        pill(570, y - 8, h + '…', ACC, pop(u, a + 0.6), { mono: true, fs: 14 }); });
      note(40, 380, '빌드가 모든 쿼리를 모아 해시 ↔ 원문 맵을 만든다', fade(u, 2.0)); return; }
    if (k === 1) { hashTable(60, 120, fade(u, 0.2)); grow(470, 178, 600, 178, E(u, 0.6, 1.0), MUT);
      card(720, 178, 200, 90, { rx: 12, text: 'Apollo Server\nallowlist 로딩', fs: 15, s: pop(u, 1.0) });
      note(60, 320, '배포마다 목록이 갱신돼야 새 쿼리가 동작한다', fade(u, 1.8)); return; }
    if (k === 2) { hashTable(500, 60, 1);
      [['query GetMe { me }', '0930d7a87c67', true], ['query Evil { me me2: me }', '9b974c5e21e9', false]].forEach(([q, h, ok], i) => { const y = 250 + i * 80, a = 0.2 + i * 1.0;
        mono(40, y, q, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, a) }); mono(40, y + 24, 'sha256 = ' + h + '…', { 'font-size': 13.5, fill: MUT, opacity: fade(u, a + 0.2) });
        if (ok) { check(500, y + 6, 11, pop(u, a + 0.5)); mono(522, y + 12, '200 { "me": "kim" }', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, a + 0.6) }); }
        else { cross(500, y + 6, 11, pop(u, a + 0.5)); mono(522, y + 12, '400 OPERATION_NOT_IN_ALLOWLIST', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, a + 0.6) }); } });
      note(40, 404, 'Evil의 resolver 호출 0번 (실행해서 확인)', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 3) { [['enforceAllowlist', '등록된 해시만'], ['depthLimit(7)', '깊이'], ['complexityPlugin', '점수 1000'], ['timeoutPlugin', '5초']].forEach(([n, r], i) => {
        const x = 150 + i * 220, a = 0.2 + i * 0.4; el('rect', { x: x - 80, y: 110, width: 160, height: 160, rx: 12, fill: i === 0 ? ACCBG : SOFT, stroke: i === 0 ? ACC : GRID, 'stroke-width': 2, opacity: fade(u, a) });
        mono(x, 180, n, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, a) }); tx(x, 206, r, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, a) }); });
      dot([[30, 190], [930, 190]], seg(u, 1.6, 2.8), INK, 7);
      note(480, 330, 'allowlist를 넣어도 앞 단계를 떼지 않는다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { hashTable(60, 80, 1, 0);
      [['정적 분석', '빌드 단에서 모든 쿼리가 보인다'], ['캐시 키 안정', '같은 해시 = 같은 쿼리'], ['감사', '어느 빌드가 어느 쿼리를 쓰는지']].forEach(([a, b], i) => { const y = 100 + i * 90, s = pop(u, 0.4 + i * 0.4);
        card(720, y, 300, 70, { rx: 10, stroke: GOOD, s }); tx(720, y - 6, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(720, y + 18, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }); return; }
    if (k === 5) { [['빌드', '쿼리 등록'], ['게이트웨이', 'allowlist enforce'], ['서버', 'depth · complexity · timeout'], ['DB', 'statement_timeout']].forEach(([a, b], i) => {
        const y = 60 + i * 84, s = pop(u, 0.2 + i * 0.4); el('rect', { x: 200 + i * 30, y: y - 30, width: 560 - i * 60, height: 64, rx: 12, fill: i === 0 ? ACCBG : SOFT, stroke: i === 0 ? ACC : GRID, 'stroke-width': 2, opacity: s });
        tx(230 + i * 30, y + 8, a, { 'font-size': 16, 'font-weight': 800, opacity: s }); tx(380 + i * 30, y + 8, b, { 'font-size': 14.5, fill: MUT, opacity: s, class: 'mono' }); });
      note(480, 400, '한 곳이 실패해도 다음 계층이 받친다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    // k6 공개 API
    tx(60, 70, '외부에 열린 API는 쿼리를 미리 알 수 없다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
    cross(500, 64, 11, pop(u, 0.5)); mono(520, 70, 'allowlist', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5) });
    const used = E(u, 0.8, 2.2); el('rect', { x: 60, y: 150, width: 600, height: 40, rx: 8, fill: SOFT, stroke: GRID });
    el('rect', { x: 60, y: 150, width: 600 * used * 0.7, height: 40, rx: 8, fill: ACC, opacity: 0.8 });
    mono(60, 140, 'GitHub GraphQL: 1시간에 5,000 point', { 'font-size': 14, 'font-weight': 700 });
    tx(60, 220, '쿼리마다 복잡도만큼 point를 깎는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
    mono(60, 280, 'Shopify Admin API: 쿼리 비용을 계산해 throttle', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8) });
    note(60, 360, '공개 API는 complexity + rate limit을 강하게', fade(u, 2.2), { fill: ACC }); }

  const quiz = [
    { q: 'users → posts → author → posts … 처럼 서로 참조하는 쿼리가 위험한 이유는 무엇인가?',
      o: ['중첩 한 겹마다 행 수가 곱해져서 요청 하나로 서버를 무너뜨릴 수 있어서', '쿼리 문자열이 길어 파싱이 느려서', 'DataLoader를 쓸 수 없어서'], a: 0,
      why: '사용자 1000명에 사람당 글 50개면 posts 한 겹마다 ×50이다. 깊이 8이면 맨 아래 posts만 62억 5천만 행이 된다.' },
    { q: 'graphql-depth-limit으로 query { user { posts { comments { author { name } } } } }의 깊이를 재면 몇인가?',
      o: ['5', '4', '3'], a: 1,
      why: '자식 선택이 있는 필드만 센다. user·posts·comments·author 네 개라 깊이 4이고, 자식이 없는 name은 세지 않는다.' },
    { q: 'createComplexityRule을 Apollo validationRules에 넣었을 때 생기는 구멍은 무엇인가?',
      o: ['introspection 쿼리가 막힌다', '변수로 보낸 first: $n 값을 못 보고 기본값으로 점수를 매긴다', '점수가 두 배로 계산된다'], a: 1,
      why: 'validation에는 변수 값이 없어 first: $n = 10000을 기본값 20으로 계산해 40점으로 통과시킨다. plugin에서 request.variables를 넘기면 20000점으로 막힌다.' },
    { q: 'timeout plugin이 5초에 controller.abort()를 불렀는데도 DB 부하가 그대로다. 빠진 것은 무엇인가?',
      o: ['resolver가 ctx.signal을 DB 호출에 넘기지 않았다', 'willSendResponse에서 타이머를 지웠다', '타임아웃을 3초로 잡지 않았다'], a: 0,
      why: 'abort는 신호만 보낸다. resolver가 signal을 DB·fetch에 넘겨야 실제로 끊기고, DB에는 statement_timeout도 따로 건다.' },
    { q: 'allowlist를 켠 서버에 처음 보는 쿼리가 오면 어떻게 되는가?',
      o: ['한 번 실행한 뒤 목록에 자동으로 추가된다', '쿼리 원문의 sha256이 목록에 없어 400으로 거절되고 resolver는 돌지 않는다', '깊이가 7 이하면 실행된다'], a: 1,
      why: '등록된 해시만 실행한다. 실행해 보면 query Evil은 400 OPERATION_NOT_IN_ALLOWLIST를 받고 resolver 호출 수는 늘지 않는다.' },
  ];
  const summary = [
    '서로 참조하는 타입은 중첩 한 겹마다 행 수가 곱해져 요청 한 건으로도 서버가 죽는다.',
    '깊이 제한은 자식이 있는 필드 수를 세며 실행 전에 거절하지만 리스트 크기는 보지 않는다.',
    '복잡도는 자식 점수에 first를 곱해 가로 폭증까지 잡고, 변수까지 보려면 plugin에서 계산한다.',
    '타임아웃은 signal을 DB까지 넘겨야 듣고, 운영에서는 allowlist로 등록된 쿼리만 실행한다.',
  ];
  const review = [
    { q: 'depthLimit(7)을 걸었는데 users(first:10000) { posts(first:1000) { title } }로 서버가 느려졌다. 먼저 붙일 것은?',
      o: ['depthLimit을 5로 낮추기', 'first를 곱하는 복잡도 점수 한도', 'introspection 끄기'], a: 1,
      why: '이 쿼리는 깊이 2라 depth로는 못 막는다. 1000만 행을 읽으려는 가로 폭증은 first를 곱하는 complexity가 맡는다.' },
    { q: '복잡도 한도 1000을 걸었는데 posts(first:500) 두 겹 쿼리가 통과했다. 로그에는 점수 4가 찍혔다. 먼저 의심할 것은?',
      o: ['SDL의 @complexity를 못 읽는 estimator를 썼다', '한도 1000이 너무 높다', 'DB 인덱스가 없다'], a: 0,
      why: 'fieldExtensionsEstimator는 SDL directive를 읽지 않아 필드마다 1점만 매긴다. directiveEstimator를 쓰면 501000 점으로 거절된다.' },
    { q: '외부 개발자에게 공개한 GraphQL API에 쓸 수 있는 방어 조합은?',
      o: ['allowlist 하나만', '복잡도 한도 + 복잡도 기반 rate limit + timeout', '방어 없이 DataLoader만'], a: 1,
      why: '공개 API는 클라이언트 쿼리를 미리 등록할 수 없어 allowlist가 안 된다. GitHub처럼 복잡도로 point를 깎는 방식으로 간다.' },
  ];

  R.page({ title: '쿼리 위험도와 방어선', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
