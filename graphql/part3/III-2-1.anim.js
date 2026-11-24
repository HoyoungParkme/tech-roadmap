/* III-2-1 Pagination — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 중복·누락 글과 읽는 행 수는 node 로 offset/cursor 를 흉내 내 확인한 값이다. cursor 예시 행(10:05 등)은 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, spans, person, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- GraphQL·JSON 글 상자 ----------
  const KW = /^(query|mutation|subscription|fragment|on|type|union|enum|input|directive|interface|scalar)$/;
  const JKW = /^(const|let|function|return|if|await|async|import|from|export|new|throw|typeof|switch|case|break)$/;
  function toks(s, lang) { const out = [], re = /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*")|(\$\w+)|(@\w+)|(\.\.\.)|(\b\d+\b)|(\b\w+\b)|(\s+|.)/g; let m;
    while ((m = re.exec(s))) { const [t, cm, st, vr, dr, sp, nu, wd] = m;
      if (cm && !(lang === 'js' && t[0] === '#') && !(lang !== 'js' && t[0] === '/')) out.push([t, { fill: MUT }]);
      else if (st) { const key = lang === 'json' && /^\s*:/.test(s.slice(re.lastIndex)); out.push([t, key ? { fill: INFO, 'font-weight': 700 } : { fill: GOOD }]); }
      else if (vr) out.push([t, { fill: ACC, 'font-weight': 700 }]);
      else if (dr) out.push([t, { fill: WARN, 'font-weight': 700 }]);
      else if (sp) out.push([t, { fill: ACC, 'font-weight': 700 }]);
      else if (nu) out.push([t, { fill: WARN }]);
      else if (wd) out.push([t, (lang === 'js' ? JKW : KW).test(t) && lang !== 'json' ? { fill: INFO, 'font-weight': 700 } : /^(null|true|false)$/.test(t) ? { fill: WARN, 'font-weight': 700 } : {}]);
      else out.push([t, {}]); }
    return out; }
  // lines 를 상자에 쓴다. o: fs, w, title, shown(보일 줄 수, 소수면 마지막 줄 타이핑), hi(i), dim(i), lang('gql'|'json'|'js'), op
  function doc(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 8, n = lines.length, h = n * lh + 18, op = o.op ?? 1;
    const w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + 32, sh = o.shown ?? n;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: op });
    if (o.title) tx(x + 2, y - 9, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    lines.forEach((s, i) => { if (i >= Math.ceil(sh)) return; const part = i === Math.ceil(sh) - 1 && sh % 1 ? s.slice(0, Math.round(s.length * (sh % 1))) : s, ly = y + 9 + i * lh;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: ly, width: w - 8, height: lh, rx: 4, fill: o.hiFill || ACCBG, opacity: op });
      if (part) spans(x + 14, ly + lh / 2 + fs * 0.36, toks(part, o.lang), { 'font-size': fs, opacity: op * (o.dim && o.dim(i) ? 0.35 : 1) }); });
    return { x, y, w, h, lh, ly: (i) => y + 9 + i * lh + lh / 2, cx: (i, col) => x + 14 + col * fs * 0.6 }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const lpill = (x, y, s, col, sc, o) => pill(x + (tw(s, (o && o.fs) || 14) + 26) / 2, y, s, col, sc, o);   // 왼쪽 끝 기준 알약
  // 굽은 선이 자란다
  function curve(d, u, col, o) { o = o || {}; if (u <= 0) return; const p = el('path', { d, fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.2, pathLength: 100, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : o.dash, opacity: o.op ?? 1, 'marker-end': u >= 1 && !o.plain ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); return p; }

  // ---------- 1. offset / limit ----------
  // 글 100개를 한 줄에 20개씩: 줄 하나가 한 페이지. st(n) → { fill, stroke, op } (n 은 1부터)
  const GX = 170, GY = 186, PW = 34;
  function grid(st, s) { for (let r = 0; r < 5; r++) { tx(GX - 14, GY + r * 44 + 21, (r + 1) + '쪽', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
    for (let j = 0; j < 20; j++) { const n = r * 20 + j + 1, o = st(n) || {}, sc = s ? s(n) : 1; if (sc <= 0) continue;
      el('rect', { x: GX + j * PW, y: GY + r * 44, width: PW - 5, height: 30, rx: 4, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.4, opacity: (o.op ?? 1) * clamp(sc) }); } } }
  const cellX = (n) => GX + ((n - 1) % 20) * PW, cellY = (n) => GY + Math.floor((n - 1) / 20) * 44;
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { doc(30, 30, ['type Query {', '  posts(skip: Int = 0, take: Int = 20): [Post!]!', '  postsCount: Int!  # 페이지 수 계산용', '}'], { fs: 14, w: 470, shown: lerp(0, 4, E(u, 0.1, 1.0)), hi: (i) => i === 1 });
      grid(() => ({}), (n) => clamp(u * 60 - n * 0.4 - 30));
      note(540, 70, 'SQL 의 LIMIT / OFFSET 을', fade(u, 1.6)); note(540, 98, '그대로 노출한 모양', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 1) { doc(30, 30, ['query Page2 {', '  posts(skip: 20, take: 20) { id title }', '  postsCount', '}'], { fs: 14, w: 470, hi: (i) => i === 1 });
      const h = E(u, 0.4, 1.2); grid((n) => (n <= 20 ? { op: 0.45 } : n <= 40 ? { fill: h > 0 ? ACCBG : PANEL, stroke: h > 0 ? ACC : GRID, sw: 2 } : {}));
      grow(GX - 2, GY - 12, lerp(GX - 2, GX + 20 * PW - 5, E(u, 0.3, 1.0)), GY - 12, 1, MUT, { plain: true });
      mono(GX, GY - 20, 'skip 20 · 건너뜀', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
      lpill(GX + 20 * PW + 8, GY + 44 + 15, '21~40번째', ACC, pop(u, 1.3), { fs: 13.5 });
      note(540, 70, '페이지 수 = ⌈postsCount ÷ 20⌉', fade(u, 1.7)); note(540, 98, 'skip = (page − 1) × take', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 2) { const sc = E(u, 0.3, 2.2) * 40;
      mono(30, 50, 'SELECT * FROM posts ORDER BY created_at DESC', { 'font-size': 15, fill: INFO, opacity: fade(u, 0.1) }); mono(30, 76, 'LIMIT 20 OFFSET 20;', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.1) });
      grid((n) => (n > 40 ? { op: 0.6 } : n <= sc ? (n <= 20 ? { fill: SOFT, stroke: MUT, op: 0.8 } : { fill: ACCBG, stroke: ACC, sw: 2 }) : {}));
      if (sc < 40) { const n = Math.max(1, Math.ceil(sc)); el('rect', { x: cellX(n) - 2, y: cellY(n) - 3, width: PW - 1, height: 36, rx: 5, fill: 'none', stroke: INFO, 'stroke-width': 2.6 }); }
      lpill(GX + 20 * PW + 8, GY + 15, '읽고 버림', MUT, pop(u, 1.3), { fs: 13.5 }); lpill(GX + 20 * PW + 8, GY + 59, '돌려줌', ACC, pop(u, 2.2), { fs: 13.5 });
      note(540, 120, 'DB 가 읽은 행 40 · 돌려준 행 20', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 3) { grid((n) => (n > 80 && n <= 100 ? { fill: ACCBG, stroke: ACC, sw: 2 } : n > 20 && n <= 40 ? { op: 0.5 } : {}));
      curve(`M${GX - 40},${GY + 44 + 15} C${GX - 90},${GY + 100} ${GX - 90},${GY + 4 * 44 - 20} ${GX - 44},${GY + 4 * 44 + 15}`, E(u, 0.3, 1.2), ACC);
      mono(30, 60, 'posts(skip: 80, take: 20)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      note(30, 100, '5쪽으로 바로 점프 · skip = (5 − 1) × 20', fade(u, 1.3)); sub(250, 130, '게시판처럼 페이지 번호를 보여 주는 화면에 자연스럽다', fade(u, 1.8), { 'font-size': 14 }); return; }
    // k4: 약점 — 뒤 페이지일수록 읽는 행이 는다
    tx(30, 44, '페이지별로 DB 가 읽는 행 (= skip + take)', { 'font-size': 15, 'font-weight': 700 });
    [1, 2, 3, 4, 5].forEach((p, i) => { const y = 64 + i * 34; tx(70, y + 15, p + '쪽', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 });
      hbar(84, y + 2, 320, p * 20, 100, { u: E(u, 0.2 + i * 0.2, 0.7 + i * 0.2), col: p === 5 ? BAD : INFO, text: String(p * 20), h: 18 }); });
    mono(30, 262, '5쪽: 100행 읽고 80행 버림', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
    [['insert 가 끼면 같은 글이 또 나온다', 'Step 2'], ['큰 테이블의 COUNT(*) 가 비싸다', 'postsCount']].forEach(([a, b], i) => { const s = pop(u, 1.7 + i * 0.3);
      card(720, 110 + i * 80, 400, 56, { rx: 10, text: a, fs: 15, stroke: WARN, color: INK, s }); mono(905, 132 + i * 80, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s }); });
    note(30, 310, '직관적이고 점프가 되지만, 뒤로 갈수록 느려진다', fade(u, 2.2)); }

  // ---------- 2. insert 시 중복 ----------
  const AL = 'ABCDEFGHIJKLMNOPQRSTUVW'.split('');
  const LX = 70, LP = 41, ROW = [120, 250];
  const slot = (p) => ({ x: LX + (p % 20) * LP, y: ROW[Math.floor(p / 20)] ?? 380 });
  function post2(p, s, o) { o = o || {}; if (p >= 26) return; const { x, y } = slot(p);
    card(x + 18, y, 36, 44, { rx: 6, text: s, fs: 16, fw: 800, stroke: o.stroke || GRID, color: o.color || INK, fill: o.fill || PANEL, sw: o.sw || 1.6, s: o.s, op: o.op }); }
  function pages(win, o) { o = o || {}; ROW.forEach((y, r) => { const on = win === r;
    el('rect', { x: LX - 8, y: y - 32, width: 20 * LP + 12, height: 64, rx: 10, fill: on ? ACCBG : 'none', stroke: on ? ACC : GRID, 'stroke-width': on ? 2.2 : 1.4, 'stroke-dasharray': on ? null : '5 4' });
    tx(LX - 8, y - 42, r === 0 ? '1쪽 · skip 0' : '2쪽 · skip 20', { 'font-size': 14, 'font-weight': 700, fill: on ? ACC : MUT }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { pages(0); AL.slice(0, 20).forEach((s, i) => post2(i, s, { s: pop(u, 0.2 + i * 0.05, 0.4) }));
      tx(LX + 20 * LP, 70, '← 최신', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); tx(LX - 8, 70, '← 최신', { 'font-size': 13.5, fill: MUT, opacity: 0 });
      note(LX, 330, '사용자가 글A~글T 20개를 봤다', fade(u, 1.5)); note(LX, 360, '다음 페이지 요청은 take=20, skip=20', fade(u, 1.9), { fill: ACC }); return; }
    if (k === 1 || k === 2) { const sh = k === 1 ? E(u, 0.6, 1.8) : 1; pages(k === 2 ? 1 : null);
      post2(0, 'X', { fill: WARNBG, stroke: WARN, color: WARN, sw: 2.4, s: k === 1 ? pop(u, 1.85) : 1, op: 1 });
      AL.slice(0, 23).forEach((s, i) => { const p = i + sh, a = slot(Math.floor(p)), b = slot(Math.ceil(p)), f = p - Math.floor(p);
        if (Math.floor(p) === Math.ceil(p) || a.y === b.y) { const x = lerp(a.x, b.x, f), y = a.y; if (sh < 1) { card(x + 18, y, 36, 44, { rx: 6, text: s, fs: 16, fw: 800, stroke: s === 'T' ? BAD : GRID, sw: s === 'T' ? 2.4 : 1.6 }); return; } }
        else if (sh < 1) { const x = lerp(a.x, b.x, f), y = lerp(a.y, b.y, f); card(x + 18, y, 36, 44, { rx: 6, text: s, fs: 16, fw: 800, stroke: BAD, sw: 2.4 }); return; }
        const q = i + 1; if (q >= 25) return; const seen = s === 'T';
        post2(q, s, { stroke: seen ? BAD : k === 2 && q >= 20 ? ACC : GRID, color: seen ? BAD : INK, fill: seen && k === 2 ? BADBG : PANEL, sw: seen ? 2.4 : 1.6 }); });
      if (k === 1) { note(LX, 330, '글X 가 맨 앞에 등록되며 모두 한 칸씩 밀린다', fade(u, 1.9)); mono(LX, 360, '글T : 20번 → 21번', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); return; }
      note(LX, 330, 'skip=20 은 21번째부터 · 그 자리에 이미 본 글T', fade(u, 0.6), { fill: BAD }); sub(LX + 300, 362, '요청은 정상인데 결과가 겹친다', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    if (k === 3) { const d = E(u, 0.6, 1.6); pages(u > 1.8 ? 1 : null);
      AL.slice(0, 23).forEach((s, i) => { if (s === 'C') { if (d < 1) post2(i, s, { stroke: BAD, color: BAD, op: 1 - d, s: 1 - d * 0.5 }); return; }
        const p = i > 2 ? i - d : i, a = slot(Math.floor(p)), b = slot(Math.ceil(p)), f = p - Math.floor(p), lost = s === 'U';
        card(lerp(a.x, b.x, f) + 18, lerp(a.y, b.y, f), 36, 44, { rx: 6, text: s, fs: 16, fw: 800, stroke: lost ? BAD : u > 1.8 && p >= 20 ? ACC : GRID, color: lost ? BAD : INK, fill: lost && u > 1.8 ? BADBG : PANEL, sw: lost ? 2.4 : 1.6 }); });
      note(LX, 330, '반대로 글C 가 지워지면 글U 가 1쪽 끝으로 올라간다', fade(u, 1.0)); note(LX, 360, '2쪽은 글V 부터 · 글U 는 영영 못 본다', fade(u, 2.0), { fill: BAD }); return; }
    // k4: 값 기반
    post2(0, 'X', { fill: WARNBG, stroke: WARN, color: WARN, sw: 2.4 });
    AL.slice(0, 23).forEach((s, i) => { const q = i + 1, after = i > 19 && u > 1.4; post2(q, s, { stroke: s === 'T' ? ACC : after ? ACC : GRID, fill: after ? ACCBG : PANEL, sw: s === 'T' ? 2.6 : 1.6, color: s === 'T' ? ACC : INK }); });
    const tp = slot(20); pill(tp.x + 18, tp.y - 44, 'cursor = 글T', ACC, pop(u, 0.4), { fs: 13.5 });
    note(LX, 330, '위치 대신 마지막으로 본 값을 기억한다', fade(u, 0.9)); note(LX, 360, '"글T 다음" = 글U, 글V, 글W … · insert 가 껴도 그대로', fade(u, 1.6), { fill: ACC }); }

  // ---------- 3. cursor ----------
  function feed(x, y, n, o) { o = o || {}; for (let i = 0; i < n; i++) { const s = o.s ? o.s(i) : 1; if (s <= 0) continue; el('rect', { x: x + i * 17, y, width: 14, height: 30, rx: 3, fill: o.col || ACC, opacity: 0.75 * clamp(s) }); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { doc(30, 40, ['type Query {', '  posts(', '    first: Int = 20,   # 다음 N 개', '    after: String      # 마지막 cursor', '  ): PostFeed!', '}'], { fs: 15, w: 440, shown: lerp(0, 6, E(u, 0.1, 1.0)), hi: (i) => i === 2 || i === 3 });
      card(700, 90, 300, 54, { rx: 10, text: 'skip: 몇 번째부터', fs: 16, stroke: MUT, color: MUT, s: pop(u, 1.0) }); cross(840, 90, 12, pop(u, 1.4));
      card(700, 190, 300, 54, { rx: 10, text: 'after: 무엇 다음부터', fs: 16, stroke: ACC, color: ACC, sw: 2.6, s: pop(u, 1.7) }); return; }
    if (k === 1) { doc(30, 40, ['type PostFeed {', '  nodes:      [Post!]!', '  nextCursor: String', '  hasNext:    Boolean!', '}'], { fs: 15, w: 360 });
      el('rect', { x: 470, y: 60, width: 450, height: 200, rx: 14, fill: 'none', stroke: INK, 'stroke-width': 2.2, opacity: fade(u, 0.2) }); tx(486, 84, 'PostFeed · 응답 봉투', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.2) });
      feed(490, 104, 20, { s: (i) => fade(u, 0.5 + i * 0.03) }); mono(840, 125, 'nodes', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
      card(600, 180, 200, 40, { rx: 20, text: 'nextCursor', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.2) });
      el('circle', { cx: 860, cy: 180, r: 14, fill: GOOD, opacity: fade(u, 1.6) }); mono(860, 220, 'hasNext', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(30, 300, '다음 요청에 쓸 재료를 응답이 직접 들려준다', fade(u, 2.0)); return; }
    if (k === 2 || k === 3) { const first = k === 2;
      doc(30, 40, first ? ['query Initial {', '  posts(first: 20) {', '    nodes { id title }', '    nextCursor', '    hasNext', '  }', '}'] : ['query NextPage($cursor: String!) {', '  posts(first: 20, after: $cursor) {', '    nodes { id title }', '    nextCursor', '    hasNext', '  }', '}'], { fs: 14.5, w: 420, hi: (i) => i === 1 });
      feed(480, 70, 20, { col: first ? ACC : OFF, s: (i) => (first ? fade(u, 0.4 + i * 0.03) : 1) }); mono(480, 60, '1~20', { 'font-size': 13.5, fill: MUT });
      if (!first) { feed(480, 150, 20, { s: (i) => fade(u, 0.8 + i * 0.03) }); mono(480, 140, '이어지는 20개', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 }); }
      const cy = first ? 150 : 230;
      card(640, cy + 20, 320, 36, { rx: 18, text: 'Y3JlYXRlZEF0OjIw…', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, first ? 1.2 : 0.2) });
      if (first) { grow(640, 190, 640, 222, E(u, 1.6, 1.9), MUT); mono(640, 246, 'base64 풀면 "createdAt:20"', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
        note(30, 330, '첫 요청은 cursor 없이 · 응답에서 nextCursor 를 받는다', fade(u, 2.1)); return; }
      curve(`M480,${cy + 20} C440,${cy + 20} 440,${40 + 9 + 22.5 + 11} 452,${40 + 9 + 22.5 + 11}`, E(u, 0.4, 1.0), WARN);
      card(512, 300, 36, 40, { rx: 6, text: 'X', fs: 15, fw: 800, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 1.6) });
      note(560, 306, '그 사이 새 글이 와도 기준값은 그대로', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 4) { tx(40, 44, 'ORDER BY createdAt DESC, id DESC  (예시 값)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      const rows = [['10:06', 51], ['10:05', 50], ['10:05', 47], ['10:05', 45], ['10:04', 44], ['10:03', 43]];
      const cur = 2;   // cursor = (10:05, 47)
      rows.forEach(([ts, id], i) => { const y = 64 + i * 40, after = i > cur, s = pop(u, 0.2 + i * 0.1);
        card(200, y + 16, 300, 34, { rx: 6, text: `${ts}   id ${id}`, fs: 15, mono: true, stroke: i === cur ? WARN : after && u > 1.0 ? ACC : GRID, fill: after && u > 1.0 ? ACCBG : PANEL, color: i === cur ? WARN : INK, sw: i === cur ? 2.6 : 1.6, s }); });
      lpill(360, 64 + cur * 40 + 16, 'cursor (10:05, 47)', WARN, pop(u, 0.7), { fs: 13.5 });
      doc(560, 70, ['createdAt < 10:05', '  OR (createdAt = 10:05', '      AND id < 47)', 'take: first + 1'], { fs: 15, w: 350, op: fade(u, 1.0), hi: (i) => i === 1 || i === 2 });
      note(560, 230, '같은 10:05 의 id 45 도 빠지지 않는다', fade(u, 1.8), { fill: ACC }); note(560, 260, '21개를 읽어 21번째가 있으면 hasNext', fade(u, 2.1)); return; }
    // k5: 인덱스 범위 검색 vs 앞에서부터 세기
    tx(40, 46, 'offset: 앞에서부터 세며 건너뛴다', { 'font-size': 15, 'font-weight': 700, fill: BAD });
    const sc = E(u, 0.2, 2.4); for (let i = 0; i < 40; i++) el('rect', { x: 40 + i * 21, y: 64, width: 17, height: 24, rx: 3, fill: i < sc * 40 ? (i < 32 ? OFF : ACC) : SOFT });
    mono(40, 112, '뒤 페이지일수록 오래 걸린다', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
    tx(40, 166, 'cursor: (createdAt, id) 인덱스로 바로 찾아간다', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    const tree = [[480, 200], [300, 270], [660, 270], [200, 340], [400, 340], [560, 340], [760, 340]], path = [0, 2, 5];
    [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].forEach(([a, b]) => { const on = path.includes(a) && path.includes(b); grow(tree[a][0], tree[a][1] + 14, tree[b][0], tree[b][1] - 14, on ? E(u, 0.4 + path.indexOf(b) * 0.4, 0.8 + path.indexOf(b) * 0.4) : 1, on ? ACC : GRID, { plain: true, sw: on ? 3 : 1.6 }); });
    tree.forEach(([x, y], i) => card(x, y, 70, 28, { rx: 6, stroke: path.includes(i) ? ACC : GRID, fill: path.includes(i) ? ACCBG : PANEL, sw: 1.8 }));
    feed(510, 372, 20, { s: (i) => fade(u, 1.6 + i * 0.03) });
    lpill(40, 390, '찾아간 뒤 20개만 읽는다 · 페이지 점프는 못 한다', ACC, pop(u, 2.0), { fs: 13.5 }); }

  // ---------- 4. Relay Connection ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { for (let i = 0; i < 14; i++) card(90 + i * 56, 140, 44, 50, { rx: 6, text: String(i + 1), fs: 14, mono: true, stroke: i >= 5 && i < 9 ? ACC : GRID, fill: i >= 5 && i < 9 ? ACCBG : PANEL, s: pop(u, 0.1 + i * 0.04) });
      grow(390, 205, 640, 205, E(u, 0.8, 1.4), ACC, { sw: 3 }); mono(390, 236, 'first / after →', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      grow(310, 80, 60, 80, E(u, 1.4, 2.0), INFO, { sw: 3 }); mono(320, 85, '← last / before', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) });
      note(60, 320, '인자 이름까지 표준이라 도구가 알아본다', fade(u, 2.2)); return; }
    const E4 = [5, 6, 7, 8];
    const box = (op) => { el('rect', { x: 40, y: 40, width: 600, height: 330, rx: 14, fill: 'none', stroke: INK, 'stroke-width': 2.2, opacity: op }); tx(56, 66, 'PostConnection', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: op }); };
    if (k <= 3) { box(k === 1 ? fade(u, 0.1) : 1);
      el('rect', { x: 60, y: 82, width: 560, height: 186, rx: 10, fill: SOFT, opacity: k === 1 ? fade(u, 0.4) : 1 }); mono(74, 104, 'edges: [PostEdge!]!', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.5) : 1 });
      el('rect', { x: 60, y: 282, width: 560, height: 74, rx: 10, fill: SOFT, opacity: k === 1 ? fade(u, 0.9) : 1 }); mono(74, 304, 'pageInfo: PageInfo!', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.0) : 1 });
      if (k === 1) { mono(660, 90, '# totalCount 는 선택', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); note(660, 150, '목록 자체가 아니라', fade(u, 1.8)); note(660, 178, '목록을 감싼 봉투', fade(u, 2.0), { fill: ACC }); return; }
      E4.forEach((n, i) => { const x = 80 + i * 134, s = k === 2 ? pop(u, 0.3 + i * 0.25) : 1;
        card(x + 60, 130, 120, 28, { rx: 14, text: 'cursor', fs: 13.5, mono: true, stroke: WARN, color: WARN, s });
        card(x + 60, 200, 120, 76, { rx: 8, text: 'node\nPost ' + (n + 1), fs: 14, mono: true, stroke: ACC, color: INK, s }); });
      if (k === 2) { note(660, 140, '항목마다 cursor + node', fade(u, 1.6)); sub(780, 170, '중간 어디서든 이어받는다', fade(u, 2.0), { 'font-size': 14 }); return; }
      // k3: pageInfo 네 칸
      [['startCursor', 80, 130, 84], ['endCursor', 482, 531, 598]].forEach(([s, x, x1, x2], i) => { lpill(x, 330, s, WARN, pop(u, 0.3 + i * 0.3), { fs: 13.5, mono: true }); curve(`M${x1},316 L${x2},242`, E(u, 0.5 + i * 0.3, 1.0 + i * 0.3), WARN, { sw: 1.6 }); });
      [['hasPreviousPage', 700, 120, INFO], ['hasNextPage', 700, 200, GOOD]].forEach(([s, x, y, col], i) => { el('circle', { cx: x, cy: y, r: 13, fill: col, opacity: fade(u, 1.2 + i * 0.3) }); mono(x + 24, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.3) }); });
      note(660, 290, '이전·다음 버튼을 켤지', fade(u, 2.0)); note(660, 318, 'pageInfo 하나로 안다', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 4) { const Q = doc(30, 50, ['query Feed($first: Int = 20, $after: String) {', '  posts(first: $first, after: $after) {', '    edges {', '      cursor', '      node { id title }', '    }', '    pageInfo { endCursor hasNextPage }', '  }', '}'], { fs: 14, w: 440, shown: lerp(0, 9, E(u, 0.1, 1.0)) });
      const J = doc(520, 50, ['{ "posts": {', '    "edges": [', '      { "cursor": "…",', '        "node": { "id": …, "title": … } },', '      …', '    ],', '    "pageInfo": { "endCursor": "…",', '                  "hasNextPage": true }', '} }'], { lang: 'json', fs: 13.5, w: 420, shown: lerp(0, 9, E(u, 1.0, 1.9)), hi: (i) => i === 6 || i === 7 });
      note(30, 330, '한 단계 깊어지는 대신 도구가 페이지 합치기를 해 준다', fade(u, 2.1)); return; }
    // k5: edge = 관계
    card(200, 170, 150, 64, { rx: 32, text: 'User', fs: 18, stroke: INFO, color: INFO, sw: 2.6, s: pop(u, 0.2) });
    card(720, 170, 150, 64, { rx: 32, text: 'Post', fs: 18, stroke: ACC, color: ACC, sw: 2.6, s: pop(u, 0.4) });
    grow(278, 170, 642, 170, E(u, 0.6, 1.3), WARN, { sw: 3 });
    card(460, 120, 210, 40, { rx: 20, text: 'edge · 좋아요 관계', fs: 14.5, stroke: WARN, color: WARN, s: pop(u, 1.2) });
    [['likedAt', 0], ['rank', 1]].forEach(([s, i]) => lpill(400 + i * 130, 220, s, WARN, pop(u, 1.6 + i * 0.25), { fs: 13.5, mono: true }));
    note(200, 320, 'node 는 entity, edge 는 그 목록 안에서의 관계', fade(u, 2.0)); sub(480, 350, '관계에 붙는 값은 edge 에 둔다', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 5. 선택 가이드 ----------
  const QN = [[170, 80, '페이지 점프가 필요한가?'], [480, 80, 'insert 가 잦은가?'], [790, 80, '외부·다른 팀이 쓰는 API?']];
  const LEAF = [[170, 190, 'offset', ACC], [480, 190, 'offset 도 OK', MUT], [720, 190, 'Relay', INFO], [870, 190, '단순 cursor', GOOD]];
  function tree5(k, u) {
    const show = (i, at) => (k === i ? pop(u, at) : k > i ? 1 : 0);
    QN.forEach(([x, y, s], i) => { const sc = show(i, 0.2); if (sc <= 0) return; card(x, y, 250, 50, { rx: 10, text: s, fs: 15, stroke: WARN, sw: 2.2, s: sc }); });
    const yes = (i, x2, y2, at, lab) => { const g = k === i ? E(u, at, at + 0.4) : k > i ? 1 : 0; if (g <= 0) return; grow(QN[i][0] + (x2 - QN[i][0]) * 0.1, 106, x2, y2 - 20, g, MUT); tx((QN[i][0] + x2) / 2 + 8, 140, lab, { 'font-size': 13.5, fill: MUT, opacity: g }); };
    yes(0, 170, 190, 0.6, '예'); if (k >= 1) { grow(296, 80, 352, 80, k === 1 ? E(u, 0.1, 0.3) : 1, MUT); tx(312, 70, '아니오', { 'font-size': 13.5, fill: MUT }); }
    yes(1, 480, 190, 0.6, '아니오'); if (k >= 2) { grow(606, 80, 662, 80, k === 2 ? E(u, 0.1, 0.3) : 1, MUT); tx(626, 70, '예', { 'font-size': 13.5, fill: MUT }); }
    yes(2, 720, 190, 0.6, '예'); yes(2, 870, 190, 0.9, '아니오');
    LEAF.forEach(([x, y, s, col], i) => { const sc = show([0, 1, 2, 2][i], [1.0, 1.0, 1.0, 1.3][i]); if (sc <= 0) return; card(x, y, tw(s, 16) + 36, 40, { rx: 20, text: s, fs: 16, stroke: col, color: col, sw: 2.6, s: sc }); }); }
  function s5(t, c) { const { k, u } = c; tree5(Math.min(k, 3), k <= 2 ? u : 3);
    if (k === 0) { note(40, 300, '5쪽으로 바로 가야 하면 답은 offset 하나', fade(u, 1.6)); return; }
    if (k === 1) { note(40, 300, '데이터가 잠잠하면 offset 도 충분하다', fade(u, 1.6)); sub(260, 330, '판단 기준은 insert 빈도', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { note(40, 300, '내부 전용이면 단순 cursor 로 충분', fade(u, 1.6)); sub(260, 330, '공개 API 는 표준을 따르는 편이 설명 비용이 싸다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3) { lpill(640, 240, 'GitHub · Shopify', INFO, pop(u, 0.4), { fs: 14 }); lpill(90, 240, '사내 관리자 페이지', ACC, pop(u, 0.8), { fs: 14 });
      note(40, 310, '한 서비스 안에서도 화면 성격에 따라 섞어 쓸 수 있다', fade(u, 1.6)); return; }
    if (k === 4) { card(200, 320, 260, 44, { rx: 8, text: '{ skip: 20, take: 20 }', fs: 15, mono: true, s: pop(u, 0.2) });
      grow(336, 320, 420, 320, E(u, 0.5, 0.9), BAD); card(580, 320, 300, 44, { rx: 8, text: '{ first: 20, after: "…" }', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      [0, 1, 2].forEach((i) => { card(770 + i * 60, 390, 50, 30, { rx: 6, text: '앱', fs: 13.5, s: pop(u, 1.3 + i * 0.15) }); cross(770 + i * 60, 390, 9, pop(u, 1.7 + i * 0.15)); });
      note(40, 395, '변수 모양이 바뀌어 클라이언트를 전부 고친다', fade(u, 1.9), { fill: BAD }); return; }
    card(240, 320, 380, 44, { rx: 8, text: 'cursor = base64(createdAt + id)', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) }); check(445, 320, 9, pop(u, 0.6));
    card(700, 320, 400, 44, { rx: 8, text: 'totalCount 항상 노출 → COUNT(*)', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.0) });
    note(40, 395, '정렬키를 다 담고, 개수는 필요한 화면에만', fade(u, 1.8)); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'posts(skip: 80, take: 20)으로 5쪽을 읽을 때 DB가 실제로 읽는 행은 몇 개인가?',
      o: ['20개', '100개', '80개'], a: 1,
      why: 'OFFSET은 앞의 80행을 읽고 버린 뒤 20행을 돌려준다. 그래서 뒤 페이지일수록 skip + take 만큼 읽느라 느려진다.' },
    { q: '1쪽(글A~글T)을 본 뒤 맨 앞에 글X가 추가되고 skip=20으로 2쪽을 요청하면 첫 글은 무엇인가?',
      o: ['이미 본 글T', '글U', '새 글X'], a: 0,
      why: '글X가 끼며 모두 한 칸씩 밀려 글T가 21번째가 된다. skip=20은 위치로 자르니 방금 본 글이 또 나온다.' },
    { q: 'cursor resolver가 createdAt뿐 아니라 id까지 비교하는 이유는 무엇인가?',
      o: ['id 비교가 더 빨라서', 'createdAt이 같은 글이 경계에 있을 때 빠지거나 겹치지 않게 하려고', 'base64 인코딩에 id가 꼭 필요해서'], a: 1,
      why: '같은 10:05 글이 여럿이면 시각만으로는 어디까지 봤는지 모른다. (createdAt, id) 쌍으로 비교해야 경계가 정확하다.' },
    { q: 'Relay Connection에서 다음 버튼을 켤지 정하는 데 쓰는 값은 무엇인가?',
      o: ['edges의 길이', 'totalCount', 'pageInfo.hasNextPage'], a: 2,
      why: 'pageInfo는 startCursor·endCursor와 hasPreviousPage·hasNextPage를 모아 준다. 다음 요청은 endCursor를 after로 보낸다.' },
    { q: '외부 팀이 쓰는 공개 API의 무한 스크롤 목록이라면 어떤 방식이 알맞은가?',
      o: ['Relay Connection', 'offset', '단순 cursor'], a: 0,
      why: '점프가 없고 insert가 잦으니 cursor 계열이고, 공개 API라 표준인 Relay를 따르면 도구 지원을 그대로 받는다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'offset은 페이지 점프가 쉽지만 skip이 클수록 앞의 행을 읽고 버리느라 느려진다.',
    '위치로 자르는 offset은 글이 끼거나 지워지면 같은 글이 또 나오거나 빠진다.',
    'cursor는 마지막으로 본 값 다음을 묻는다. 정렬키와 id를 함께 담아야 경계가 정확하다.',
    'Relay Connection은 edges의 cursor와 node, pageInfo로 cursor 방식을 표준화했다.',
  ];
  const review = [
    { q: '피드에서 스크롤을 내리다 방금 본 글이 또 보인다는 신고가 왔다. 먼저 의심할 것은?',
      o: ['서버 캐시가 오래된 값을 준다', '피드가 skip/take 위치 기반으로 잘리고 그 사이 새 글이 들어왔다', 'pageInfo.hasNextPage가 잘못 계산됐다'], a: 1,
      why: '위치 기반은 insert 하나로 모든 글이 한 칸씩 밀린다. 마지막으로 본 값을 기준으로 하는 cursor로 바꾸면 겹치지 않는다.' },
    { q: '관리자 게시판에서 "37쪽으로 이동" 기능이 필요하다. 어떤 방식이 맞나?',
      o: ['Relay Connection만 쓴다', '단순 cursor를 쓴다', 'offset을 쓴다'], a: 2,
      why: 'cursor는 이전 페이지의 값을 알아야 이어 갈 수 있어 임의 페이지로 바로 못 간다. 점프가 요구사항이면 offset이다.' },
    { q: 'cursor를 id만으로 만들었더니 createdAt DESC 정렬 피드에서 글이 가끔 빠진다. 고칠 것은?',
      o: ['cursor에 정렬키 createdAt과 id를 함께 담는다', 'take를 first + 1에서 first로 줄인다', 'totalCount를 항상 함께 보낸다'], a: 0,
      why: '정렬이 createdAt 기준이면 cursor에도 정렬키가 있어야 그 다음을 정확히 찾는다. 같은 시각이 겹칠 때를 위해 id도 함께 둔다.' },
  ];

  R.page({ title: '목록을 자르는 방식', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
