/* V-1-2 메모리와 상태 관리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   messages 배열, 토큰 막대, 벡터 저장소, 이벤트 표·시간축을 그린다. 토큰 수는 페이지의 예시값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, grow, fly, check, cross, spans, tokens, zone, dbIcon, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 이 페이지 도우미 ----------
  const ap = (c, at, t0 = 0.2, d = 0.6) => (c.k > at ? 1 : c.k === at ? seg(c.u, t0, t0 + d) : 0);
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const ROLE = { system: [INFO, INFOBG], user: [INK, SOFT], assistant: [ACC, ACCBG], tool: [GOOD, GOODBG], error: [BAD, BADBG] };
  // 메시지 한 칸 (높이 32, 줄이 늘면 22씩)
  function msg(x, y, w, role, lines, o) {
    o = o || {}; lines = [].concat(lines); const h = 32 + (lines.length - 1) * 22, op = o.op ?? 1; if (op <= 0.01) return h;
    const [col, bg] = ROLE[o.as || role], g = el('g', { opacity: op, transform: o.dx ? `translate(${o.dx} 0)` : null });
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.gone ? SOFT : o.hot ? bg : PANEL, stroke: o.gone ? OFF : col, 'stroke-width': o.hot ? 2.4 : 1.5, 'stroke-dasharray': o.gone ? '5 4' : null }, g);
    const rw = tw(role, 13.5) + 14;
    el('rect', { x: x + 6, y: y + 5, width: rw, height: 22, rx: 11, fill: o.gone ? OFF : col }, g);
    mono(x + 6 + rw / 2, y + 21, role, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }, g);
    lines.forEach((s, i) => tx(x + rw + 14, y + 21 + i * 22, s, { 'font-size': 14, fill: o.gone ? MUT : INK, style: 'white-space:pre', 'text-decoration': o.gone ? 'line-through' : null }, g));
    return h; }
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  // 컨텍스트 토큰 막대 (예시값)
  function tokBar(x, y, w, used, max, o) {
    o = o || {}; const f = used / max, col = used > max ? BAD : f > 0.8 ? WARN : ACC;
    tx(x, y - 8, '컨텍스트 토큰 (예시값)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    mono(x + w, y - 8, `${fmt(used)} / ${fmt(max)}`, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'end' });
    el('rect', { x, y, width: w, height: 16, rx: 5, fill: SOFT, stroke: GRID });
    el('rect', { x, y, width: Math.max(2, w * Math.min(1, f)), height: 16, rx: 5, fill: col });
    if (used > max) el('rect', { x: x + w - 3, y: y - 4, width: 9, height: 24, rx: 3, fill: BAD }); }
  const tokOf = (c) => tween(c.prev ? c.prev.tokenUsage.used : c.beat.tokenUsage.used, c.beat.tokenUsage.used, c.u);

  // 1. Short-term — messages 배열
  function s1(t, c) { const { k, u } = c, mem = c.beat.shortMem || [];
    card(140, 180, 170, 76, { text: 'LLM gpt-4o\n상태를 갖지 않는다', fs: 15, stroke: k === 3 ? ACC : INK, s: k === 0 ? pop(u, 0.3) : 1 });
    mono(140, 240, 'client = OpenAI()', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 0.9) : 1 });
    const X = 360, W = 576;
    if (k >= 1) { tx(X, 34, 'messages', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: k === 1 ? fade(u, 0.2) : 1 });
      mono(X + W, 34, `${mem.length}건`, { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 0.2) : 1 }); }
    if (k === 1) { el('rect', { x: X, y: 50, width: W, height: 60, rx: 8, fill: 'none', stroke: MUT, 'stroke-width': 1.8, 'stroke-dasharray': '6 5', opacity: fade(u, 0.5) });
      mono(X + W / 2, 86, 'messages = []   (0건)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) }); }
    const dead = k === 5 ? E(u, 1.3, 2.0) : 0;
    mem.forEach((m, i) => { const isNew = (k === 2 && i === 0) || (k === 4 && i === 1) || (k === 5 && i >= 2), op = isNew ? fade(u, k === 4 ? 1.2 : 0.9) : 1;
      msg(X, 50 + i * 42, W, m.role, m.content, { op, hot: isNew && k !== 5, gone: dead > 0.5 }); });
    if (k === 2) fly(140, 300, X + 120, 66, seg(u, 0.2, 1.0), 'user_input');
    if (k === 3) { el('rect', { x: X - 6, y: 44, width: W + 12, height: 44, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
      fly(X + 100, 66, 220, 170, seg(u, 0.5, 1.5), 'messages 전체 (1건)');
      tx(X + W / 2, 130, 'LLM은 기억이 없다. 요청마다 리스트 전체를 다시 싣는다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 4) { fly(220, 180, X + 140, 108, seg(u, 0.2, 1.1), 'answer');
      tx(X + W / 2, 170, '답도 쌓아야 다음 턴에 "방금 한 말"을 안다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
    if (k === 5) { el('rect', { x: X - 10, y: 40, width: W + 20, height: 4 * 42 + 12, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, 0.3) });
      tx(X, 242, '프로세스 메모리 안의 list', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
      if (dead > 0) { cross(X + W - 20, 242, 9, pop(u, 1.3)); tx(X + W - 40, 247, '서버가 죽으면 같이 사라진다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'end', opacity: dead }); } }
    if (k >= 2) tokBar(X, 392, W, tokOf(c), 8000); }

  // 2. 한계 — 토큰 상한을 넘으면 앞부터 잘린다
  const S2 = ['내 이름은 박호영이야', '반가워요, 박호영님!', '서울에 살아', '서울 어느 동네세요?', '강남이야', '강남 좋죠. 맛집 추천?', '... (긴 대화 50턴) ...', '내 이름이 뭐였지?'];
  function s2(t, c) { const { k, u } = c, mem = c.beat.shortMem;
    const LX = 24, LW = 470, row = (i) => 34 + i * 38;
    tx(LX, 22, 'messages', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    const prevDrop = c.prev && c.prev.shortMem ? c.prev.shortMem.filter((m) => m.dropped).length : 0;
    mem.forEach((m, i) => { const isNew = (k === 1 && i >= 4) || (k === 2 && i === 6) || (k === 4 && i === 7), justDrop = m.dropped && i >= prevDrop && (k === 3 || k === 4);
      const dx = justDrop ? -14 * E(u, 0.3 + (i - prevDrop) * 0.4, 0.9 + (i - prevDrop) * 0.4) : m.dropped ? -14 : 0;
      msg(LX + 14, row(i), LW - 14, m.role, m.content, { op: isNew ? fade(u, 0.3 + (i - 4) * 0.15) : 1, gone: m.dropped && (!justDrop || u > 0.6 + (i - prevDrop) * 0.4), dx, hot: isNew }); });
    // 컨텍스트 창: 남은 메시지만 감싼다
    const first = mem.findIndex((m) => !m.dropped), last = mem.length - 1 + (k === 5 ? 1 : 0), over = c.beat.tokenUsage.alert && k === 2;
    if (k >= 0) { const f0 = k === 3 || k === 4 ? tween(prevDrop, first, u, 1.6) : first;
      el('rect', { x: LX + 4, y: row(f0) - 5, width: LW + 4, height: row(last) - row(f0) + 42, rx: 10, fill: 'none', stroke: over ? BAD : ACC, 'stroke-width': 3, opacity: k === 0 ? fade(u, 0.3) : 1 }); }
    if (k === 5) msg(LX + 14, row(8), LW - 14, 'assistant', '모릅니다', { op: fade(u, 0.4), as: 'error', hot: true });
    // 오른쪽: 상한, 토큰, 경고 로그
    const RX = 530, RW = 406;
    if (k === 0) { pill(RX + 90, 50, 'tiktoken', INK, pop(u, 0.2), { mono: true, fs: 14 });
      card(RX + RW / 2, 120, RW, 58, { text: 'MAX_TOKENS = 8000', mono: true, fs: 17, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      tx(RX + RW / 2, 186, '모델은 128K까지 받지만', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(RX + RW / 2, 210, '비용과 지연 때문에 8K를 실용 상한으로 둔다', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k >= 1) tokBar(RX, 56, RW, tokOf(c), 8000);
    if (k === 1) mono(RX, 110, 'count_tokens(messages)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
    if (k === 2) { tx(RX, 112, '긴 대화 한 건만 붙여도 상한을 넘는다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); }
    if (k >= 3) { const log = ['[WARN] dropped: 내 이름은 박호영이야...', '[WARN] dropped: 반가워요, 박호영님!...', '[WARN] dropped: 서울에 살아...'];
      const n = k === 3 ? clamp((u - 0.4) / 0.5, 0, 2) : k === 4 ? 2 + clamp((u - 1.0) / 0.5) : 3;
      terminal(RX, 96, RW, 122, log, n, { title: 'while > MAX_TOKENS: pop(0)', fs: 13.5 }); }
    if (k === 3) tx(RX + RW / 2, 250, '하필 이름을 말한 첫 메시지가 먼저 나간다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
    if (k === 4) tx(RX + RW / 2, 250, '질문이 붙자 한 건 더 밀려난다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    if (k === 5) { card(RX + RW / 2, 290, RW, 74, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.9) });
      tx(RX + RW / 2, 284, '잘린 정보는 어떤 프롬프트로도', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) });
      tx(RX + RW / 2, 308, '되살릴 수 없다 → 장기 기억이 필요하다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.2) }); } }

  // 3. Long-term — 요약을 벡터로 저장하고 의미로 꺼낸다
  const VEC = [[.9, .2, .6, .1, .8, .3, .5, .2], [.3, .8, .2, .7, .1, .6, .4, .9], [.6, .4, .9, .3, .2, .8, .1, .5], [.2, .6, .3, .9, .5, .1, .7, .4], [.5, .1, .4, .6, .9, .2, .8, .3]];
  function vstrip(x, y, v, col, op) { v.forEach((a, i) => el('rect', { x: x + i * 11, y, width: 9, height: 18, rx: 2, fill: col, opacity: (0.15 + 0.8 * a) * op })); }
  function s3(t, c) { const { k, u } = c, lm = c.beat.longMem || [];
    if (k === 0) { pill(240, 80, 'Chroma', INK, pop(u, 0.2), { mono: true, fs: 15 }); pill(240, 140, 'OpenAIEmbeddings("text-embedding-3-small")', INK, pop(u, 0.6), { mono: true, fs: 14 });
      tx(240, 210, '요약을 글자가 아니라 "의미"로 찾기 위한 준비', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k >= 1) { dbIcon(80, 170, 'user_memory', { s: k === 1 ? pop(u, 0.2) : 1, stroke: k === 3 ? ACC : INK });
      mono(80, 258, `${lm.length}건`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: k === 1 ? fade(u, 0.8) : 1 }); }
    if (k === 1) tx(160, 175, '아직 저장된 요약이 없다', { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.0) });
    // 요약 5건
    lm.forEach((m, i) => { const y = 40 + i * 50, op = k === 2 ? fade(u, 1.0 + i * 0.25) : 1, hit = m.hit && k >= 3;
      el('rect', { x: 150, y, width: 400, height: 40, rx: 8, fill: hit ? ACCBG : PANEL, stroke: hit ? ACC : GRID, 'stroke-width': hit ? 2.4 : 1.5, opacity: op });
      mono(162, y + 25, m.id, { 'font-size': 13.5, fill: MUT, opacity: op }); tx(196, y + 25, m.summary, { 'font-size': 14.5, 'font-weight': hit ? 700 : 500, opacity: op });
      vstrip(456, y + 11, VEC[i], hit ? ACC : MUT, op);
      if (hit) { const r = i + 1; el('circle', { cx: 568, cy: y + 20, r: 12, fill: ACC, opacity: k === 3 ? fade(u, 1.4 + i * 0.2) : 1 }); mono(568, y + 25, String(r), { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.4 + i * 0.2) : 1 }); } });
    if (k === 2) { card(240, 330, 380, 50, { rx: 10, text: 'LLM: "사용자에 대한 사실만 요약"', fs: 14.5, stroke: INFO, s: pop(u, 0.2) });
      tx(350, 400, '원문이 아니라 사실 요약이 들어간다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 2) mono(456, 312, '임베딩 (그림)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) });
    // 질문 → 임베딩 → top-3
    const QX = 610, QW = 326;
    if (k === 3) { msg(QX, 40, QW, 'user', '내 이름이 뭐였지?', { op: fade(u, 0.2), hot: true });
      vstrip(QX + 120, 92, [.85, .25, .55, .15, .75, .35, .5, .25], ACC, fade(u, 0.6)); mono(QX + 110, 106, '임베딩', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.6) });
      grow(QX, 102, 584, 60, E(u, 0.9, 1.4), ACC); grow(QX, 104, 584, 110, E(u, 1.0, 1.5), ACC);
      mono(QX + QW / 2, 170, 'similarity_search(k=3)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      tx(QX + QW / 2, 200, '세 건이 오고, 가장 가까운 둘이', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(QX + QW / 2, 222, '이름과 거주지다', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (k >= 4) { const sm = c.beat.shortMem;
      tx(QX, 30, '이번 호출의 messages', { 'font-size': 15, 'font-weight': 800 });
      msg(QX, 44, QW, 'system', ['[기억] 사용자 이름: 박호영', '거주지: 서울 강남 …'], { op: k === 4 ? fade(u, 0.6) : 1, hot: k === 4 });
      msg(QX, 108, QW, 'user', sm[0].content, { op: k === 4 ? fade(u, 1.0) : 1 });
      if (k === 4) fly(560, 60, QX + 100, 60, seg(u, 0.1, 0.7), '박호영 · 서울 강남'); }
    if (k === 5) { el('rect', { x: QX, y: 170, width: QW, height: 56, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
      check(QX + 26, 198, 9, pop(u, 0.5)); tx(QX + 48, 204, '"박호영" 회수 성공', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5) });
      el('rect', { x: QX, y: 238, width: QW, height: 56, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: fade(u, 1.2) });
      cross(QX + 26, 266, 8, pop(u, 1.3)); tx(QX + 48, 272, 'Step 2: 잘린 뒤 "모릅니다"', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
      tx(QX + QW / 2, 324, '단기에서 사라져도 장기에서 꺼낸다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k >= 4) tokBar(QX, 392, QW, tokOf(c), 8000); }

  // 4. Episodic — 사용자별 이벤트 시계열
  const D0 = Date.UTC(2026, 3, 9), DAY = 86400000;
  const dayOf = (s) => (Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) - D0) / DAY;   // 4/9 = 0
  const TX = (d) => 60 + d * 26;   // 4/9 … 5/12
  function s4(t, c) { const { k, u } = c, ev = c.beat.episodicMem || [];
    if (k === 0) { el('rect', { x: 24, y: 40, width: 420, height: 46, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      spans(40, 69, tokens(typed('Base = declarative_base()', seg(u, 0.2, 1.0))), { 'font-size': 15 });
      tx(470, 69, '이벤트를 쌓을 표를 정의할 준비', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); }
    // 표
    if (k >= 1) { const cols = [['timestamp ▲', 40], ['event_type', 230], ['content', 380]], hop = k === 1 ? fade(u, 0.2) : 1;
      tx(24, 26, 'user_events', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: hop });
      tx(150, 26, 'user_id ▲ · timestamp ▲ 에 인덱스 (id · user_id 칸은 생략)', { 'font-size': 13.5, fill: MUT, opacity: hop });
      el('rect', { x: 24, y: 36, width: 600, height: 30, rx: 6, fill: INK, opacity: hop });
      cols.forEach(([s, x], i) => mono(x, 56, s, { 'font-size': 14, 'font-weight': 700, fill: PANEL, opacity: k === 1 ? fade(u, 0.3 + i * 0.25) : 1 })); }
    ev.forEach((e, i) => { const y = 70 + i * 32, isNew = (k === 2) || (k === 3 && i >= 3), op = isNew ? fade(u, 0.3 + (i % 3) * 0.3) : 1, hit = e.hit && k >= 5;
      el('rect', { x: 24, y, width: 600, height: 28, rx: 5, fill: hit ? ACCBG : i % 2 ? SOFT : PANEL, stroke: hit ? ACC : 'none', 'stroke-width': 2, opacity: op });
      const [ty, ...rest] = e.event.split(': ');
      mono(40, y + 19, e.time, { 'font-size': 14, opacity: op }); tx(230, y + 19, ty, { 'font-size': 14, fill: MUT, opacity: op }); tx(380, y + 19, rest.join(': '), { 'font-size': 14, 'font-weight': hit ? 800 : 500, opacity: op }); });
    if (k === 3) tx(780, 90, 'timestamp = utcnow()', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) });
    if (k === 3) tx(780, 116, '이 시각이 "지난주"의 근거', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
    // 시간축
    if (k >= 2) { const y = 330;
      el('line', { x1: TX(0), y1: y, x2: TX(33), y2: y, stroke: MUT, 'stroke-width': 2 });
      [['4/12', 3], ['4/19', 10], ['4/26', 17], ['5/3', 24], ['5/10', 31]].forEach(([s, d]) => { el('line', { x1: TX(d), y1: y - 5, x2: TX(d), y2: y + 5, stroke: MUT }); mono(TX(d), y + 24, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      if (k >= 4) { const cf = k === 4 ? E(u, 0.3, 1.3) : 1, x0 = TX(-1.5), x1 = TX(33);
        el('rect', { x: x1 - (x1 - x0) * cf, y: y - 34, width: (x1 - x0) * cf, height: 50, rx: 6, fill: INFO, opacity: 0.12 });
        tx(x0 + 4, y - 42, '오늘 − 30일 (cutoff)', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 4 ? fade(u, 1.3) : 1 });
        if (k === 4) tx(TX(33), y - 42, '6건 모두 후보', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1.6) }); }
      ev.forEach((e, i) => { const isNew = (k === 2) || (k === 3 && i >= 3), s = isNew ? pop(u, 0.4 + (i % 3) * 0.3) : 1, hit = e.hit && k >= 5;
        el('circle', { cx: TX(dayOf(e.time)), cy: y, r: (hit ? 10 : 7) * s, fill: hit ? ACC : INK }); }); }
    if (k === 5) { pill(780, 160, 'content LIKE "%등산%"', ACC, pop(u, 0.3), { mono: true, fs: 14 });
      tx(780, 200, '세 조건 · 시간순 정렬', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      mono(780, 236, '등산 3건 hit', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 6) { msg(24, 372, 600, 'assistant', '"4/25 북한산 4시간 등산하셨네요"', { op: fade(u, 0.6), hot: true });
      tx(780, 150, '요약이 아니라', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(780, 176, '시각이 붙은 사건이라서', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(780, 202, '"언제"를 답한다', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); } }

  // 5. 통합 — 세 메모리를 한 호출에
  function s5(t, c) { const { k, u } = c, lm = c.beat.longMem, ev = c.beat.episodicMem;
    const SP = [[24, 18, 'Long-term · 벡터', INFO], [24, 152, 'Episodic · 이벤트', WARN], [24, 286, 'Short-term · messages', ACC]];
    SP.forEach(([x, y, s, col], i) => { const op = k === 0 ? fade(u, 0.2 + i * 0.35) : 1;
      el('rect', { x, y, width: 400, height: 122, rx: 10, fill: PANEL, stroke: (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 5) ? col : GRID, 'stroke-width': 2, opacity: op });
      tx(x + 14, y + 22, s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); });
    const lop = k === 0 ? fade(u, 0.3) : 1;
    lm.forEach((m, i) => { const hit = m.hit && k >= 1, y = 48 + i * 17, op = hit ? 1 : 0.55;
      mono(40, y + 12, m.id, { 'font-size': 13.5, fill: MUT, opacity: lop * op }); tx(72, y + 12, m.summary, { 'font-size': 13.5, 'font-weight': hit ? 800 : 400, fill: hit ? INFO : INK, opacity: lop * op }); });
    if (k === 1) mono(410, 40, 'facts k=3', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 0.8) });
    // 에피소딕: 작은 시간축
    const all = [['04-12', '주문'], ['04-15', '검색'], ['04-18', '예약'], ['04-25', '북한산 등산'], ['05-02', '검색'], ['05-06', '등산 질문']], ex = (d) => 50 + (d - 3) * 10.5;
    el('line', { x1: 44, y1: 224, x2: 400, y2: 224, stroke: MUT, 'stroke-width': 1.8, opacity: lop });
    if (k >= 2) { const f = k === 2 ? E(u, 0.2, 1.0) : 1, w = 14 * 10.5, x1 = ex(29); el('rect', { x: x1 - w * f, y: 202, width: w * f, height: 44, rx: 5, fill: WARN, opacity: 0.15 });
      mono(x1, 196, 'days=14', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 0.8) : 1 });
      el('line', { x1, y1: 206, x2: x1, y2: 242, stroke: WARN, 'stroke-width': 2 }); tx(x1 + 6, 214, '오늘', { 'font-size': 13.5, 'font-weight': 700, fill: WARN }); }
    all.forEach(([d, s], i) => { const day = dayOf('2026-' + d), hit = k >= 2 && (i === 3 || i === 5), x = ex(day);
      el('circle', { cx: x, cy: 224, r: hit ? 8 : 5, fill: hit ? WARN : INK, opacity: lop * (k >= 2 && !hit ? 0.35 : 1) });
      if (hit) tx(x, i === 3 ? 262 : 262, `${d.slice(1).replace('-', '/')} ${s}`, { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': i === 3 ? 'end' : 'start', opacity: k === 2 ? fade(u, 1.0) : 1 }); });
    if (k === 2) tx(44, 196, '14일 밖 · 키워드 밖 제외', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
    // 단기: 기존 대화
    tx(40, 340, k >= 5 ? 'self.short  +2건 (user, assistant)' : 'self.short  (이전 대화)', { 'font-size': 14, class: 'mono', fill: k >= 5 ? ACC : INK, 'font-weight': k >= 5 ? 800 : 400, opacity: lop });
    // 오른쪽: 조립된 messages
    const QX = 450, QW = 486;
    if (k === 1) fly(300, 60, QX + 120, 70, seg(u, 0.2, 1.1), '박호영 · 서울 강남 · 등산', { fill: INFO });
    if (k === 2) fly(300, 230, QX + 120, 90, seg(u, 1.0, 1.9), '4/25 북한산 · 5/6 등산 질문', { fill: WARN });
    if (k >= 3) { tx(QX, 30, 'messages (이번 호출)', { 'font-size': 15, 'font-weight': 800, opacity: k === 3 ? fade(u, 0.2) : 1 });
      msg(QX, 44, QW, 'system', ['[기억] 박호영 · 서울 강남 · 등산 좋아함', '[이력] 4/25 북한산, 5/6 등산 질문'], { op: k === 3 ? fade(u, 0.4) : 1, hot: k === 3 });
      tx(QX + 16, 134, '*self.short', { 'font-size': 14, class: 'mono', fill: MUT, opacity: k === 3 ? fade(u, 0.8) : 1 });
      msg(QX, 146, QW, 'user', '이번 주말에 어디 가면 좋을까?', { op: k === 3 ? fade(u, 1.1) : 1 }); }
    if (k >= 4) { card(QX + 110, 230, 180, 50, { text: 'LLM 호출', fs: 16, fw: 800, stroke: k === 4 ? ACC : INK, s: k === 4 ? pop(u, 0.3) : 1 });
      if (k === 4) { grow(QX + 110, 180, QX + 110, 204, E(u, 0.5, 0.9), ACC); tx(QX + 220, 236, '이번 턴의 토큰 최고점', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) }); } }
    if (k === 5) { [[QX, 255, 300, 300, ACC, 'short +2'], [QX, 250, 300, 200, WARN, 'log_event("chat")'], [QX, 245, 300, 80, INFO, 'should_persist 이면 add_texts']].forEach(([x0, y0, x1, y1, col, s], i) => {
        grow(x0, y0, 420, y1, E(u, 0.3 + i * 0.4, 0.8 + i * 0.4), col === ACC ? ACC : MUT); tx(QX + 210, 290 + i * 24, s, { 'font-size': 14, 'font-weight': 700, fill: col, class: 'mono', opacity: fade(u, 0.6 + i * 0.4) }); }); }
    if (k === 6) msg(QX, 270, QW, 'assistant', ['북한산 다녀오신 지 2주 됐으니', '도봉산 어떠세요?  (예시 응답)'], { op: fade(u, 0.5), hot: true });
    if (k >= 1) tokBar(QX, 392, QW, tokOf(c), 8000); }

  const quiz = [
    { q: '단기 메모리에서 LLM이 "방금 한 말"을 기억하는 방법은 무엇인가?',
      o: ['LLM 서버가 대화를 따로 저장해 둔다', '요청마다 messages 리스트 전체를 다시 보낸다', '마지막 메시지 한 건만 보낸다'], a: 1,
      why: 'LLM은 상태를 갖지 않는다. user와 assistant 메시지를 쌓은 리스트를 매번 통째로 실어 보내야 앞 대화를 안다.' },
    { q: '토큰이 8,000을 넘을 때 overflow.py가 가장 먼저 버리는 메시지는 무엇인가?',
      o: ['가장 오래된 맨 앞 메시지', '가장 긴 메시지', '방금 들어온 질문'], a: 0,
      why: 'pop(0)으로 앞에서부터 지운다. 그래서 이름을 말한 첫 메시지가 먼저 사라지고 "내 이름이 뭐였지?" 에 답하지 못한다.' },
    { q: '장기 메모리가 "내 이름이 뭐였지?" 에 답할 수 있게 해 주는 것은 무엇인가?',
      o: ['대화 원문 전체를 다시 붙여 넣는 것', '질문과 의미가 가까운 사실 요약을 벡터 검색으로 꺼내 system 메시지로 붙이는 것', 'MAX_TOKENS를 128K로 올리는 것'], a: 1,
      why: '대화가 끝날 때 사실만 요약해 저장해 두고, 새 질문을 임베딩해 k=3으로 가까운 요약을 꺼낸다.' },
    { q: '에피소딕 메모리가 벡터 요약과 다른 점은 무엇인가?',
      o: ['사건마다 시각이 붙어 있어 "언제"를 답할 수 있다', '임베딩으로만 검색한다', '프로세스가 죽으면 사라진다'], a: 0,
      why: 'user_events는 timestamp가 붙은 행으로 쌓인다. 그래서 "4/25 북한산 4시간" 처럼 날짜를 짚어 답한다.' },
    { q: '통합 Agent가 응답 뒤에 하는 일로 맞는 것은 무엇인가?',
      o: ['세 저장소를 모두 비운다', '단기 리스트만 갱신한다', '대화는 단기에, 행동은 에피소딕에, 남길 사실은 장기에 쓴다'], a: 2,
      why: 'self.short에 두 건, log_event로 한 건, should_persist이면 장기에 요약 한 건을 쓴다. 다음 턴의 재료가 된다.' },
  ];

  const summary = [
    '단기 메모리는 messages 리스트다. LLM은 상태가 없어서 매 요청마다 리스트 전체를 다시 받는다.',
    '토큰 상한을 넘으면 앞에서부터 잘린다. 처음에 말한 이름이 사라져 나중에 답하지 못한다.',
    '장기 메모리는 사실 요약을 벡터로 저장해 두고, 새 질문과 의미가 가까운 3건을 꺼내 붙인다.',
    '에피소딕은 시각이 붙은 사건을 쌓아 언제 있었던 일인지 답한다. 실전에서는 셋을 한 호출에 합친다.',
  ];
  const review = [
    { q: '50턴쯤 대화한 뒤 봇이 사용자 이름을 잊었다. 로그에 [WARN] dropped가 찍혀 있다. 먼저 할 일은?',
      o: ['System Prompt에 "이름을 기억하라"고 적는다', '사용자 사실을 요약해 벡터 저장소에 두고 질문마다 검색해 붙인다', 'temperature를 낮춘다'], a: 1,
      why: '잘린 메시지는 프롬프트로 되살릴 수 없다. 장기 메모리에 사실을 따로 두고 꺼내 와야 한다.' },
    { q: '"지난번 등산 언제 갔지?" 에 봇이 날짜를 대지 못한다. 장기 벡터 요약에는 "취미: 등산, 사진" 만 있다. 무엇이 빠졌나?',
      o: ['timestamp가 붙은 이벤트를 쌓는 에피소딕 메모리', '더 큰 임베딩 모델', 'MAX_TOKENS 상한'], a: 0,
      why: '요약은 사실만 남기고 시각을 버린다. 사건과 시각을 함께 남기는 user_events 같은 표가 있어야 날짜로 답한다.' },
    { q: '세 메모리를 모두 끼워 넣었더니 한 호출이 3,200토큰까지 커졌다. 가장 알맞은 조절은?',
      o: ['에피소딕 기간을 30일에서 14일로 좁히고 facts는 k=3처럼 개수를 정해 둔다', '단기 리스트를 빼고 매번 새 대화로 시작한다', '세 메모리를 모두 끄고 원문만 보낸다'], a: 0,
      why: '회수 범위를 숫자로 묶으면 필요한 기억은 남기면서 토큰을 상한 아래로 둘 수 있다. 통합 예제도 days=14, k=3을 쓴다.' },
  ];

  R.page({ title: '에이전트의 세 가지 기억', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
