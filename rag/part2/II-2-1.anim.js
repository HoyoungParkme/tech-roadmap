/* II-2-1 Chunking 전략 비교 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽에 인사규정 문서(209자)를 글자 단위로 칠한다 — 글자 색 = 그 글자가 든 청크, 빨간 │ = 자른 자리, 굵은 청록 = 두 청크에 겹친 글자.
 * 오른쪽은 청크 카드(글자 수, 경계 OK/BROKEN). 청크는 STEPS 의 chunks 를 읽는다.
 * Fixed(80자 → 80·79·49자), Recursive(100자·겹침 20 → 70·79·66자), Document-based(3개) 는 langchain-text-splitters 로 실제 돌린 결과다.
 * Semantic 의 sim 0.91/0.42 와 비교 장면의 recall·속도는 페이지가 든 예시 수치다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, G, card, spans, mono, sub, lbl, pill, grow, dot, zone, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const DOC = '# 제1장 인사규정\n\n## 1.1 근무시간\n근무시간은 오전 9시부터 오후 6시까지로 한다. 점심시간은 12시부터 1시까지이다.\n\n## 1.2 연차 휴가\n1년 이상 근속한 직원에게 15일의 연차가 부여된다. 3년 이상 근속 시 근속년수당 1일이 추가된다.\n\n# 제2장 급여\n\n## 2.1 급여 지급\n급여는 매월 25일에 지급한다. 25일이 주말인 경우 직전 영업일에 지급한다.';
  const COL = [INFO, WARN, GOOD, ACC];
  const FS = 14, cw = (ch) => (ch.charCodeAt(0) > 255 ? FS : FS * 0.6);
  // 화면 줄: 원문 줄을 폭 maxW 안에서 공백 기준으로 접는다 ([a, b) 는 DOC 안 글자 위치)
  const ROWS = (() => { const rows = []; let idx = 0;
    DOC.split('\n').forEach((line) => { if (!line) { rows.push({ a: idx, b: idx, blank: true }); idx += 1; return; }
      let st = 0; while (st < line.length) { let e = st, w = 0; while (e < line.length && w + cw(line[e]) <= 340) { w += cw(line[e]); e++; }
        if (e < line.length) { const sp = line.lastIndexOf(' ', e - 1); if (sp > st) e = sp + 1; } rows.push({ a: idx + st, b: idx + e }); st = e; }
      idx += line.length + 1; }); return rows; })();
  // 청크 텍스트 → DOC 안 [시작, 끝) (겹침 허용). 못 찾으면 장 단위로 나눈다
  function ranges(chunks, strategy) {
    if (strategy === 'document') { const i12 = DOC.indexOf('## 1.2'), i2 = DOC.indexOf('# 제2장'); return [[0, i12 - 2], [i12, i2 - 2], [i2, DOC.length]]; }
    const out = []; let from = 0; chunks.forEach((c) => { const t = c.text.trim(), p = DOC.indexOf(t, from); out.push(p < 0 ? [from, from] : [p, p + t.length]); from = p < 0 ? from : p + 1; }); return out; }
  // 문서 판. o.rg 청크 구간, o.reveal 칠해진 글자 위치, o.cuts 빨간 │ 를 넣을 위치, o.hiRows 강조할 원문 줄, o.dim(i) 흐리게 할 청크
  function docPane(o) { o = o || {}; const rg = o.rg || [], rv = o.reveal ?? DOC.length;
    el('rect', { x: 14, y: 22, width: 452, height: 352, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(26, 42, o.title || '인사규정 발췌 (209자)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    let y = 70;
    ROWS.forEach((r) => { if (r.blank) { y += 9; return; }
      const parts = []; let buf = '', key = null;
      const flush = () => { if (!buf) return; const [own, rev] = key; const n = own.length;
        parts.push([buf, !rev || !n ? { fill: INK } : n > 1 ? { fill: ACC, 'font-weight': 800 } : { fill: COL[own[0] % 4], 'font-weight': 600, opacity: o.dim && o.dim(own[0]) ? 0.3 : 1 }]); buf = ''; };
      for (let i = r.a; i < r.b; i++) { const own = rg.map((g, j) => (i >= g[0] && i < g[1] ? j : -1)).filter((j) => j >= 0), k2 = [own, i < rv];
        if ((o.cuts || []).includes(i) && i < rv) { flush(); parts.push(['│', { fill: BAD, 'font-weight': 800 }]); key = null; }
        if (!key || key[0].join() !== own.join() || key[1] !== k2[1]) { flush(); key = k2; } buf += DOC[i]; }
      flush();
      const isHead = DOC[r.a] === '#';
      if (o.heads && isHead) el('rect', { x: 20, y: y - 16, width: 440, height: 22, rx: 4, fill: ACCBG, opacity: o.heads });
      spans(28, y, parts, { 'font-size': FS }); y += 21; }); }
  // 청크 카드 (오른쪽)
  const show = (t) => t.trim().replace(/\n+/g, ' ⏎ ');
  function chunkCard(i, ch, y, o) { o = o || {}; const s = o.s ?? 1, col = COL[i % 4], g = G(0, 0, 1, o.op ?? 1);
    el('rect', { x: 484, y, width: 456, height: o.h || 66, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 2.2, opacity: s }, g);
    el('rect', { x: 484, y, width: 8, height: o.h || 66, rx: 3, fill: col, opacity: s }, g);
    mono(502, y + 22, `chunk[${i}]`, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: s }, g);
    mono(596, y + 22, `${ch.text.trim().length}자`, { 'font-size': 14, 'font-weight': 700, opacity: s }, g);
    const p = show(ch.text); mono(502, y + 48, p.length > 30 ? p.slice(0, 29) + '…' : p, { 'font-size': 13.5, fill: MUT, opacity: s }, g);
    if (o.badge) pill(930 - (tw(o.badge, 13.5) + 26) / 2, y + 18, o.badge, o.badge === 'BROKEN' ? BAD : GOOD, o.bs ?? s, { fs: 13.5 });
    if (o.extra) mono(o.badge ? 862 : 930, y + 22, o.extra, { 'font-size': 13.5, 'font-weight': 700, fill: o.extraCol || ACC, 'text-anchor': 'end', opacity: s }, g); }
  function stars(x, y, n, op, col) { for (let i = 0; i < 5; i++) tx(x + i * 17, y, '★', { 'font-size': 16, fill: i < n ? col || WARN : OFF, opacity: op ?? 1 }); }

  // ---------- 1. Fixed ----------
  function s1(t, c) { const { k, u } = c, ch = c.beat.chunks || [], rg = ranges(ch, 'fixed'), cuts = rg.slice(1).map((g) => g[0]);
    if (k === 0) { docPane({});
      card(712, 80, 400, 64, { rx: 10, stroke: ACC, fill: ACCBG, text: 'CharacterTextSplitter(\n  separator="", chunk_size=80)', fs: 14.5, mono: true, color: ACC, s: pop(u, 0.3) });
      const x0 = 500, W = 420, f = E(u, 0.9, 1.9); el('rect', { x: x0, y: 200, width: W * f, height: 20, rx: 4, fill: SOFT, stroke: GRID });
      [0, 80, 160, 209].forEach((v, i) => { if (v / 209 > f + 0.001) return; el('line', { x1: x0 + W * v / 209, y1: 192, x2: x0 + W * v / 209, y2: 228, stroke: i && i < 3 ? BAD : MUT, 'stroke-width': 2 }); mono(x0 + W * v / 209, 248, String(v), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      tx(712, 290, '의미는 보지 않고 80자마다 자른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    const rv = k === 1 ? lerp(0, DOC.length, E(u, 0.2, 2.0)) : DOC.length;
    docPane({ rg, reveal: rv, cuts });
    if (k === 1) { ch.forEach((x, i) => { if (rv < rg[i][1] - 2) return; chunkCard(i, x, 40 + i * 82, { s: pop(u, 0.2 + (rg[i][1] / DOC.length) * 1.8) }); });
      mono(712, 330, `len(chunks) = ${rv >= DOC.length - 1 ? ch.length : '…'}`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { ch.forEach((x, i) => chunkCard(i, x, 40 + i * 82, { badge: 'BROKEN', bs: pop(u, 0.3 + i * 0.3) }));
      [['## 1.2 연', '차 휴가', 0.9], ['## 2.1', '급여 지급', 1.4]].forEach(([a, b, at], j) => { const y = 300 + j * 34;
        mono(500, y, a, { 'font-size': 15, 'font-weight': 700, fill: COL[j], opacity: fade(u, at) }); tx(500 + tw(a, 15) + 8, y, '✂', { 'font-size': 16, fill: BAD, opacity: fade(u, at) });
        mono(500 + tw(a, 15) + 30, y, b, { 'font-size': 15, 'font-weight': 700, fill: COL[j + 1], opacity: fade(u, at) }); });
      sub(830, 316, '제목 한가운데', fade(u, 1.8), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { ch.forEach((x, i) => chunkCard(i, x, 40 + i * 82, { op: i === 1 ? 1 : 0.35, badge: 'BROKEN' }));
      el('rect', { x: 480, y: 118, width: 464, height: 74, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.3) });
      tx(500, 300, 'chunk[1]은 "차 휴가" 로 시작한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(500, 328, '무슨 조항인지 알리는 제목이 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      tx(500, 356, '품질', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); stars(540, 357, 2, fade(u, 1.9), BAD); return; }
    // k 4: 장점
    ch.forEach((x, i) => { const n = x.text.trim().length; tx(500, 70 + i * 40, `chunk[${i}]`, { 'font-size': 14, 'font-weight': 700, fill: COL[i], class: 'mono' }); hbar(590, 56 + i * 40, 260, n, 80, { col: COL[i], u: E(u, 0.2 + i * 0.2, 0.8 + i * 0.2), text: `${n}자` }); });
    [['속도', 5], ['비용 0', 5]].forEach(([s, n], i) => { tx(500, 230 + i * 36, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.3) }); stars(580, 231 + i * 36, n, fade(u, 1.1 + i * 0.3), GOOD); });
    sub(712, 330, '프로토타입·토큰 길이를 딱 맞출 때만', fade(u, 1.9), { 'font-size': 14.5 }); }

  // ---------- 2. Recursive ----------
  const SEPS = [['"\\n\\n"', '단락'], ['"\\n"', '줄'], ['". "', '문장'], ['" "', '단어'], ['""', '글자']];
  const PARAS = [10, 58, 69, 8, 56];
  function s2(t, c) { const { k, u } = c, ch = c.beat.chunks || [], rg = ch.length ? ranges(ch, 'recursive') : [];
    if (k === 0) { docPane({});
      SEPS.forEach(([s, n], i) => { const y = 60 + i * 52, sc = pop(u, 0.3 + i * 0.25); pill(560, y, s, i ? MUT : ACC, sc, { mono: true, fs: 15 }); tx(620, y + 5, `${i + 1}순위 · ${n}`, { 'font-size': 15, 'font-weight': 700, opacity: sc });
        if (i) grow(560, y - 38, 560, y - 16, E(u, 0.2 + i * 0.25, 0.4 + i * 0.25), MUT, { sw: 1.6 }); });
      mono(712, 340, 'chunk_size=100, overlap=20', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); return; }
    docPane({ rg, heads: k === 3 ? fade(u, 0.3) * 0.7 : 0 });
    if (k === 1) { ch.forEach((x, i) => chunkCard(i, x, 40 + i * 82, { s: pop(u, 0.4 + i * 0.4) })); mono(712, 330, 'len(chunks) = 3', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { // 단락 5개를 100자 안에서 이어 붙인다
      tx(490, 50, '"\\n\\n" 으로 자른 단락 5개', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      const S = 3.9, S1 = 2.15; let x = 490; PARAS.forEach((n, i) => { const s = pop(u, 0.2 + i * 0.12); el('rect', { x, y: 66, width: n * S1 - 3, height: 30, rx: 4, fill: SOFT, stroke: MUT, opacity: s }); mono(x + (n * S1 - 3) / 2, 86, String(n), { 'font-size': 13.5, 'text-anchor': 'middle', opacity: s }); x += n * S1; });
      tx(490, 140, '100자 칸에 앞에서부터 담는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) });
      const BIN = [[[0, 10], [1, 58]], [[2, 69], [3, 8]], [[3, 8], [4, 56]]];
      BIN.forEach((bin, j) => { const y = 160 + j * 64, a = 1.0 + j * 0.45; el('rect', { x: 490, y, width: 100 * S, height: 40, rx: 6, fill: 'none', stroke: COL[j], 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, a) });
        let xx = 492, tot = 0; bin.forEach(([pi, n], q) => { const f = E(u, a + q * 0.15, a + q * 0.15 + 0.3); if (f <= 0) return; el('rect', { x: xx, y: y + 4, width: (n * S - 3) * f, height: 32, rx: 4, fill: (j === 2 && q === 0) ? ACC : COL[j], opacity: 0.85 }); xx += n * S + (q ? 0 : 2 * S); tot += n + (q ? 2 : 0); });
        mono(490 + 100 * S + 10, y + 26, `${[70, 79, 66][j]}자`, { 'font-size': 14, 'font-weight': 700, fill: COL[j], opacity: fade(u, a + 0.4) }); });
      sub(712, 368, '청록 = 겹침 20자 안에 든 "# 제2장 급여"(8자)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { ch.forEach((x, i) => chunkCard(i, x, 40 + i * 82, { badge: 'OK', bs: pop(u, 0.4 + i * 0.3), extra: i === 1 ? '끝에 # 제2장 급여' : i === 2 ? '머리에 # 제2장 급여' : null }));
      tx(500, 310, 'BROKEN 0곳', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); tx(500, 340, '품질', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); stars(540, 341, 4, fade(u, 1.9)); return; }
    if (k === 4) { [['단락·문장 경계를 지킨다', GOOD], ['Fixed 만큼 빠르다 · 외부 호출 0', GOOD], ['overlap으로 경계 문맥을 보탠다', GOOD]].forEach(([s, col], i) => { check(500, 80 + i * 60, 10, pop(u, 0.3 + i * 0.4)); tx(522, 86 + i * 60, s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); });
      tx(500, 300, '속도', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); stars(550, 301, 5, fade(u, 1.7), GOOD); return; }
    ch.forEach((x, i) => { const n = x.text.trim().length; mono(500, 70 + i * 40, `chunk[${i}]`, { 'font-size': 14, 'font-weight': 700, fill: COL[i] }); hbar(590, 56 + i * 40, 260, n, 100, { col: COL[i], text: `${n}자` }); });
    tx(500, 220, '길이가 들쭉날쭉할 수 있다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
    mono(500, 262, 'chunk.metadata = {}', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
    tx(500, 290, '제목은 본문 글자로만 남는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
    pill(712, 345, '그래도 대부분 프로젝트의 시작점', ACC, pop(u, 1.9), { fs: 14.5 }); }

  // ---------- 3. Semantic ----------
  const SENT = ['제1장·1.1 근무시간은 …', '점심시간은 12시부터 …', '1.2 연차 휴가 1년 이상 …', '3년 이상 근속 시 …', '제2장·2.1 급여는 매월 …', '25일이 주말인 경우 …'];
  const SEM_P = [[560, 110], [610, 150], [650, 100], [700, 140], [850, 260], [890, 300]];
  function s3(t, c) { const { k, u } = c, ch = c.beat.chunks || [], rg = ch.length ? ranges(ch, 'semantic') : [];
    if (k === 0) { docPane({}); card(712, 120, 380, 60, { rx: 10, stroke: ACC, fill: ACCBG, text: 'OpenAIEmbeddings(\n  "text-embedding-3-small")', fs: 14.5, mono: true, color: ACC, s: pop(u, 0.3) });
      pill(712, 210, '문장마다 API 호출 = 비용', WARN, pop(u, 1.2), { fs: 15 }); sub(712, 260, '여기부터는 돌리는 데 돈이 든다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 1) { docPane({}); card(712, 80, 380, 60, { rx: 10, stroke: ACC, text: 'breakpoint_threshold_type=\n"percentile", amount=95', fs: 14.5, mono: true, s: pop(u, 0.2) });
      const ax = R.axes(520, 170, 380, 150, { x: [0, 5], y: [0, 1], yl: '문장 사이 거리 (1 − sim)' });
      [0.2, 0.25, 0.18, 0.62, 0.22].forEach((v, i) => { const h = (ax.Y(0) - ax.Y(v)) * E(u, 0.5 + i * 0.15, 0.9 + i * 0.15); el('rect', { x: ax.X(i + 0.5) - 22, y: ax.Y(0) - h, width: 44, height: h, rx: 3, fill: i === 3 ? BAD : OFF }); });
      el('line', { x1: 520, y1: ax.Y(0.5), x2: 900, y2: ax.Y(0.5), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) });
      tx(900, ax.Y(0.5) - 8, '95 백분위', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 1.7) });
      sub(712, 368, '막대 높이는 그림 (실제 값 아님)', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    docPane(rg.length ? { rg } : {});
    if (k === 2) { ch.forEach((x, i) => chunkCard(i, x, 60 + i * 96, { s: pop(u, 0.4 + i * 0.5), h: 72, extra: '예시', extraCol: MUT }));
      sub(712, 290, '인사규정(1장) 한 덩어리, 급여(2장) 한 덩어리', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 3) { tx(490, 50, '문장 6개 → 벡터 6개 (그림)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      SEM_P.forEach(([x, y], i) => { const s = pop(u, 0.3 + i * 0.2); el('circle', { cx: x, cy: y, r: 8 * s, fill: i < 4 ? INFO : GOOD }); mono(x + 12, y + 5, `s${i + 1}`, { 'font-size': 13.5, 'font-weight': 700, opacity: s });
        if (i) grow(SEM_P[i - 1][0], SEM_P[i - 1][1], x, y, E(u, 1.4 + i * 0.12, 1.6 + i * 0.12), i === 4 ? BAD : MUT, { sw: i === 4 ? 2.5 : 1.6, plain: true, dash: i === 4 ? '6 4' : null }); });
      tx(640, 210, '1장 문장들', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) }); tx(820, 340, '2장 문장들', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.3) });
      mono(712, 380, '임베딩 호출 6번', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { const ax = R.axes(520, 70, 380, 220, { x: [0, 5], y: [0, 1], yt: [0, 0.5, 1], yl: '이웃 문장 cos sim (예시)' });
      [0, 1, 2, 3, 4].forEach((i) => { const v = i === 3 ? 0.42 : 0.91, h = (ax.Y(0) - ax.Y(v)) * E(u, 0.3 + i * 0.15, 0.7 + i * 0.15);
        el('rect', { x: ax.X(i + 0.5) - 24, y: ax.Y(0) - h, width: 48, height: h, rx: 3, fill: i === 3 ? BAD : 'none', stroke: i === 3 ? BAD : INFO, 'stroke-width': 2, 'stroke-dasharray': i === 3 ? null : '5 3' });
        mono(ax.X(i + 0.5), ax.Y(0) + 20, `s${i + 1}|s${i + 2}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      mono(ax.X(3.5), ax.Y(0.42) - 10, '0.42', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      mono(ax.X(1.5), ax.Y(0.91) - 10, '0.91', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      tx(712, 360, '급락한 s4|s5가 "제2장 급여" 시작점', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    [['품질', 5, GOOD], ['속도', 2, BAD]].forEach(([s, n, col], i) => { tx(500, 80 + i * 44, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); stars(560, 81 + i * 44, n, fade(u, 0.4 + i * 0.4), col); });
    tx(500, 190, 'Recursive보다 10~50배 느리고 비용이 든다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
    ['법률', '의료', '논문'].forEach((s, i) => pill(560 + i * 110, 260, s, ACC, pop(u, 1.6 + i * 0.2), { fs: 15 }));
    sub(712, 310, '정확도가 비용보다 중요한 곳에만', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 4. Document-based ----------
  const HP = ['제1장 > 1.1 근무시간', '제1장 > 1.2 연차 휴가', '제2장 > 2.1 급여 지급'];
  const HM = [['제1장 인사규정', '1.1 근무시간'], ['제1장 인사규정', '1.2 연차 휴가'], ['제2장 급여', '2.1 급여 지급']];
  function s4(t, c) { const { k, u } = c, ch = c.beat.chunks || [], rg = ch.length ? ranges(ch, 'document') : [];
    if (k === 0) { docPane({ heads: fade(u, 0.3) * 0.9 });
      [['"#"', 'Header1', '제1장 / 제2장'], ['"##"', 'Header2', '1.1 / 1.2 / 2.1']].forEach(([a, b, d], i) => { const y = 100 + i * 90, s = pop(u, 0.6 + i * 0.5);
        pill(540, y, a, ACC, s, { mono: true, fs: 16 }); grow(580, y, 640, y, E(u, 0.9 + i * 0.5, 1.2 + i * 0.5), ACC); mono(650, y + 5, b, { 'font-size': 16, 'font-weight': 800, opacity: s }); sub(650, y + 30, d, fade(u, 1.0 + i * 0.5), { 'text-anchor': 'start', 'font-size': 14 }); });
      sub(712, 320, '사람이 붙인 제목을 그대로 자 삼는다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { docPane({ heads: 0.5 }); card(712, 120, 380, 60, { rx: 10, stroke: ACC, fill: ACCBG, text: 'MarkdownHeaderTextSplitter(\n  strip_headers=False)', fs: 14.5, mono: true, color: ACC, s: pop(u, 0.3) });
      tx(712, 220, '제목 줄을 본문에도 남긴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(712, 248, '(True면 제목은 metadata 에만)', fade(u, 1.6), { 'font-size': 14 }); return; }
    docPane({ rg, dim: k === 4 ? (i) => i === 2 && u > 0.8 : null });
    if (k === 2) { ch.forEach((x, i) => chunkCard(i, x, 40 + i * 82, { s: pop(u, 0.4 + i * 0.35), extra: HP[i] })); return; }
    if (k === 3) { ch.forEach((x, i) => { const y = 40 + i * 104, s = pop(u, 0.3 + i * 0.35); el('rect', { x: 484, y, width: 456, height: 90, rx: 8, fill: PANEL, stroke: COL[i], 'stroke-width': 2.2, opacity: s });
        mono(500, y + 24, `docs[${i}].metadata`, { 'font-size': 14, 'font-weight': 800, fill: COL[i], opacity: s });
        mono(500, y + 50, `Header1: "${HM[i][0]}"`, { 'font-size': 14, opacity: fade(u, 0.6 + i * 0.35) }); mono(500, y + 74, `Header2: "${HM[i][1]}"`, { 'font-size': 14, opacity: fade(u, 0.8 + i * 0.35) }); }); return; }
    if (k === 4) { mono(490, 60, 'filter={"Header1": "제1장 인사규정"}', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      ch.forEach((x, i) => { const y = 84 + i * 66, ok = i < 2; chunkCard(i, x, y, { op: ok ? 1 : 0.35, h: 56 }); if (ok) check(916, y + 40, 9, pop(u, 0.6 + i * 0.2)); else cross(916, y + 40, 8, pop(u, 1.0)); });
      tx(490, 310, '"연차는 며칠?" 답에 붙는 출처', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      pill(640, 346, '제1장 > 1.2 연차 휴가', GOOD, pop(u, 1.9), { fs: 15 }); return; }
    tx(490, 60, '섹션이 길면 한 번 더 자른다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
    el('rect', { x: 490, y: 90, width: 440, height: 40, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.4) }); tx(500, 116, '긴 섹션 (예: 1500자 넘음)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) });
    grow(710, 138, 710, 178, E(u, 0.9, 1.2), ACC); mono(730, 166, 'Recursive', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
    [0, 1, 2].forEach((i) => { const s = pop(u, 1.3 + i * 0.2); el('rect', { x: 490 + i * 150, y: 192, width: 140 * s, height: 40, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); });
    sub(710, 270, '헤더 메타는 조각마다 그대로 따라간다', fade(u, 1.9), { 'font-size': 14.5 });
    sub(710, 300, '입력에 제목 구조가 있어야 쓸 수 있다', fade(u, 2.2), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); }

  // ---------- 5. 비교 ----------
  const ST = [['Fixed', 3, 2, 5, '무료', 62, 0.05], ['Recursive', 3, 4, 5, '무료', 84, 0.08], ['Semantic', 2, 5, 2, '유료', 89, 4.2], ['Document', 3, 5, 5, '무료', 91, 0.12]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { ['전략', '청크', '품질', '속도', '비용'].forEach((h, j) => tx([40, 250, 350, 520, 700][j], 60, h, { 'font-size': 15, 'font-weight': 700, fill: MUT }));
      ST.forEach(([n, cnt, q, sp, cost], i) => { const y = 110 + i * 62, op = fade(u, 0.3 + i * 0.35); el('line', { x1: 30, y1: y + 22, x2: 820, y2: y + 22, stroke: GRID, opacity: op });
        tx(40, y, n, { 'font-size': 17, 'font-weight': 800, fill: COL[i], opacity: op }); mono(260, y, String(cnt), { 'font-size': 17, 'font-weight': 700, opacity: op }); stars(350, y + 1, q, op); stars(520, y + 1, sp, op, GOOD); tx(700, y, cost, { 'font-size': 16, 'font-weight': 700, fill: cost === '유료' ? BAD : GOOD, opacity: op }); });
      return; }
    if (k === 1) { tx(40, 50, 'recall@5 (예시 수치, 질문 100개)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      ST.forEach(([n, , , , , r], i) => { const y = 90 + i * 70; tx(40, y + 18, n, { 'font-size': 16, 'font-weight': 800, fill: COL[i] }); hbar(200, y, 560, r, 100, { col: COL[i], u: E(u, 0.3 + i * 0.25, 1.0 + i * 0.25), text: `${r}%`, h: 26 }); });
      sub(480, 380, 'Fixed의 제목·단어 잘림이 가장 크게 깎는다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) { tx(40, 50, '1MB 문서 처리 시간 (예시 수치)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      ST.forEach(([n, , , , , , s], i) => { const y = 90 + i * 70; tx(40, y + 18, n, { 'font-size': 16, 'font-weight': 800, fill: COL[i] }); hbar(200, y, 560, s, 4.2, { col: COL[i], u: E(u, 0.3 + i * 0.25, 1.0 + i * 0.25), text: `${s}초`, h: 26 }); });
      sub(480, 380, 'Semantic만 임베딩 호출 때문에 길다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { card(260, 90, 400, 56, { rx: 10, stroke: INK, text: 'Q1. 헤더 구조가 있나?', fs: 16, s: pop(u, 0.2) });
      grow(400, 118, 640, 190, E(u, 0.6, 0.9), GOOD); tx(540, 150, 'YES', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) }); pill(720, 200, 'Document-based', COL[3], pop(u, 0.9), { fs: 15 });
      grow(260, 118, 260, 200, E(u, 1.0, 1.3), MUT); tx(272, 170, 'NO', { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.2) });
      card(260, 230, 420, 56, { rx: 10, stroke: INK, text: 'Q2. 정확도가 비용보다 절대 우선?', fs: 16, s: pop(u, 1.3) });
      grow(420, 258, 640, 320, E(u, 1.6, 1.9), GOOD); pill(720, 330, 'Semantic', COL[2], pop(u, 1.9), { fs: 15 });
      grow(260, 258, 260, 330, E(u, 1.9, 2.2), MUT); pill(260, 350, 'Recursive (대부분)', COL[1], pop(u, 2.2), { fs: 15 }); return; }
    if (k === 4) { tx(60, 60, '실무 표준 2단계', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.1) });
      [['① Document-based', '헤더로 큰 단위 + 메타', COL[3]], ['② Recursive', '1500자가 넘는 섹션만 더 자른다', COL[1]]].forEach(([a, b, col], i) => { const y = 130 + i * 110, s = pop(u, 0.3 + i * 0.6);
        card(480, y, 760, 76, { rx: 12, stroke: col, s }); tx(130, y - 6, a, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: s }); tx(130, y + 22, b, { 'font-size': 15, opacity: s }); if (i) grow(480, y - 72, 480, y - 40, E(u, 0.7, 1.0), ACC); });
      tx(480, 370, '처음부터 Semantic으로 가지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    [['II-2-2', 'chunk_size·overlap 적정값 찾기'], ['III-1-1', '청크를 벡터로 — Embedding']].forEach(([a, b], i) => { const s = pop(u, 0.3 + i * 0.5);
      card(260 + i * 440, 180, 380, 120, { rx: 12, stroke: ACC, s }); mono(260 + i * 440, 160, a, { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: s }); tx(260 + i * 440, 200, b, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: s }); });
    tx(480, 80, '다음에 볼 것', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.1) }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: '209자 문서를 CharacterTextSplitter(separator="", chunk_size=80)로 자르면 어떻게 되는가?',
      o: ['단락 경계에서 3조각으로 깔끔하게 나뉜다', '80·79·49자 3조각이고 "1.2 연차 휴가" 제목이 잘린다', '80자짜리 4조각이 된다'], a: 1,
      why: 'separator가 없으니 80자가 차는 자리에서 그대로 끊는다. 첫 경계가 "## 1.2 연|차 휴가"에 걸려 제목이 갈라진다.' },
    { q: 'RecursiveCharacterTextSplitter가 가장 먼저 시도하는 separator는 무엇인가?',
      o: ['"\\n\\n" (단락)', '". " (문장)', '"" (글자)'], a: 0,
      why: '단락으로 먼저 자르고 100자를 넘는 조각만 줄, 문장, 단어 순으로 다시 자른다. 이 문서는 단락 5개로 충분했다.' },
    { q: 'SemanticChunker가 청크 경계를 정하는 기준은 무엇인가?',
      o: ['마침표가 나올 때마다', '헤더 기호 #·##', '이웃 문장의 임베딩 코사인 유사도가 급락하는 곳'], a: 2,
      why: '문장마다 임베딩을 만들고 이웃끼리 유사도를 본다. 예시에서 0.91이던 값이 0.42로 떨어진 제2장 시작점이 경계가 됐다.' },
    { q: 'MarkdownHeaderTextSplitter가 각 청크에 자동으로 붙여 주는 것은 무엇인가?',
      o: ['Header1·Header2 같은 상위 제목 metadata', '청크 글자 수', '이웃 청크와의 유사도'], a: 0,
      why: 'headers_to_split_on에 적은 #·## 제목이 metadata로 붙어 "제1장 > 1.2 연차 휴가" 같은 경로로 필터·인용에 쓰인다.' },
    { q: '제목 구조가 없는 일반 사내 문서에 가장 먼저 쓸 전략은 무엇인가?',
      o: ['Semantic', 'Recursive', 'Fixed'], a: 1,
      why: '의사결정 트리에서 헤더 구조가 없고 정확도가 절대 우선이 아니면 Recursive다. 빠르고 무료이면서 경계를 지킨다.' },
  ];

  const summary = [
    'Fixed는 80자마다 무조건 잘라 "## 1.2 연|차 휴가"처럼 제목 한가운데를 끊는다.',
    'Recursive는 단락, 줄, 문장, 단어 순으로 자를 곳을 찾아 같은 문서를 70·79·66자 세 조각으로 나눈다.',
    'Semantic은 이웃 문장의 임베딩 유사도가 떨어지는 곳에서 자르지만 문장마다 API 호출이 든다.',
    'Document-based는 #·## 제목으로 자르고 그 경로를 metadata로 붙여 필터와 인용에 쓴다.',
  ];
  const review = [
    { q: '고정 크기로 자른 뒤 "연차" 관련 답변의 출처 표시가 엉뚱해졌다. 청크를 보니 "차 휴가"로 시작한다. 먼저 바꿀 것은?',
      o: ['chunk_size를 10자로 줄인다', '임베딩 모델을 더 큰 것으로 바꾼다', '단락·제목 경계를 지키는 Recursive나 헤더 기반 분할로 바꾼다'], a: 2,
      why: 'Fixed는 의미를 보지 않고 글자 수로만 자른다. 경계를 지키는 분할로 바꿔야 제목과 본문이 한 청크에 남는다.' },
    { q: 'Markdown 사내 위키인데 섹션 하나가 수천 자인 문서가 섞여 있다. 알맞은 조합은?',
      o: ['헤더로 먼저 나누고 긴 섹션만 Recursive로 더 자른다', '처음부터 모두 Semantic으로 자른다', 'Fixed 80자로 통일한다'], a: 0,
      why: '헤더 분할로 메타를 확보하고, 1500자를 넘는 섹션만 Recursive로 다시 자르는 2단계가 표준 조합이다.' },
    { q: 'Recursive(chunk_size=100, overlap=20)로 잘랐더니 "# 제2장 급여"가 두 청크에 모두 들어 있다. 왜인가?',
      o: ['separator 목록에 "#"이 없어서', '8자짜리 제목이 겹침 20자 안에 들어 다음 청크 머리로 복제돼서', 'chunk_size가 너무 커서 한 번 더 들어가서'], a: 1,
      why: '청크 2를 닫을 때 끝쪽 조각 중 overlap 20자 안에 드는 것을 다음 청크 앞에 다시 넣는다. 8자 제목이 그 조각이었다.' },
  ];

  R.page({ title: '문서가 청크로 잘리는 모습', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
