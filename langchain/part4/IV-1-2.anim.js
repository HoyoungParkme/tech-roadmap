/* IV-1-2 StateGraph 기본 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 화이트보드(State)의 메시지·turn 값은 각 beat의 stateDictView를 읽는다.
 * 실행 결과(메시지 2건, turn 2, 실수 3가지의 오류 이름, set_entry_point = add_edge(START, …))는 langgraph 1.2.24로 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock, snippet, terminal, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공용 도우미 ----------
  const A = (c) => ({
    s: (kk, at) => (c.k > kk ? 1 : c.k === kk ? pop(c.u, at) : 0),
    o: (kk, at) => (c.k > kk ? 1 : c.k === kk ? fade(c.u, at) : 0),
    g: (kk, a, b) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a, b) : 0),
  });
  function marks() { const d = el('defs', {});
    [['lc-w', WARN], ['lc-i', INFO], ['lc-g', GOOD]].forEach(([id, col]) => { const m = el('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, d); el('path', { d: 'M0,0 L10,5 L0,10 z', fill: col }, m); }); }
  const mid = (col) => (col === ACC ? 'ra-ahb' : col === BAD ? 'ra-ahr' : col === WARN ? 'lc-w' : col === INFO ? 'lc-i' : col === GOOD ? 'lc-g' : 'ra-ah');
  function curve(f, u, col, o) { o = o || {}; if (u <= 0) return; const n = 30, pts = [];
    for (let i = 0; i <= n; i++) { const tt = Math.min(u, i / n); pts.push(f(tt)); if (i / n >= u) break; }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, 'stroke-linecap': 'round', opacity: o.op ?? 1, 'marker-end': u > 0.98 && !o.plain ? `url(#${mid(col)})` : null }); }
  const qb = (p, q, r) => (s) => [(1 - s) * (1 - s) * p[0] + 2 * (1 - s) * s * q[0] + s * s * r[0], (1 - s) * (1 - s) * p[1] + 2 * (1 - s) * s * q[1] + s * s * r[1]];
  const ln = (p, r) => (s) => [lerp(p[0], r[0], s), lerp(p[1], r[1], s)];
  function rim(n, tx2, ty2, pad) { const dx = tx2 - n.x, dy = ty2 - n.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const k = Math.min(n.w / 2 / (Math.abs(ux) || 1e-9), n.h / 2 / (Math.abs(uy) || 1e-9)) + (pad ?? 3); return [n.x + ux * k, n.y + uy * k]; }
  function edge(a, b, u, col, o) { curve(ln(rim(a, b.x, b.y, 2), rim(b, a.x, a.y, 5)), u, col, o); }
  function gnode(n, name, o) { o = o || {}; const hot = o.hot;
    const g = card(n.x, n.y, n.w, n.h, { rx: 10, fill: hot ? ACCBG : o.fill || PANEL, stroke: hot ? ACC : o.stroke || INK, sw: hot ? 2.8 : 2, s: o.s, op: o.op, dash: o.dash });
    tx(0, 5.5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono', fill: hot ? ACC : o.color || INK }, g); return g; }
  function gterm(n, kind, o) { o = o || {};
    if (kind === 'START') return card(n.x, n.y, n.w, n.h, { rx: n.h / 2, fill: INK, stroke: 'none', text: 'START', fs: 13.5, fw: 800, color: PANEL, mono: true, s: o.s, op: o.op });
    const g = R.G(n.x, n.y, o.s, o.op); el('circle', { cx: 0, cy: 0, r: n.h / 2, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g); el('circle', { cx: 0, cy: 0, r: n.h / 2 - 5, fill: o.fill || PANEL, stroke: INK, 'stroke-width': 1.6 }, g);
    tx(0, 5, 'END', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, class: 'mono' }, g); return g; }

  // ---------- 화이트보드 (State) ----------
  const BX = 30, BY = 36, BW = 430, BH = 300;
  const MSG_Y = 146, TURN = { x: 396, y: 300 };
  function bubble(i, m, o) { o = o || {}; const human = m.kind === 'human', s = (human ? 'Human  ' : 'AI  ') + m.text, w = tw(s, 14.5) + 26, y = MSG_Y + i * 38;
    const g = card(50 + w / 2, y, w, 30, { rx: 15, fill: human ? INFOBG : ACCBG, stroke: human ? INFO : ACC, sw: 1.8, s: o.s, op: o.op, dash: o.ghost ? '5 4' : null });
    tx(-w / 2 + 13, 5, human ? 'Human' : 'AI', { 'font-size': 13.5, 'font-weight': 800, fill: human ? INFO : ACC }, g);
    tx(-w / 2 + 13 + tw(human ? 'Human  ' : 'AI  ', 13.5), 5, m.text, { 'font-size': 14.5, 'font-weight': 600 }, g); return { w, y }; }
  // o: { schema 0..1 (줄 수), msgType, turnType, msgBadge, turnBadge, values, msgs, ghost, turn, turnPrev, newFrom, u }
  function board(o) { o = o || {};
    zone(BX, BY, BW, BH, null, { fill: PANEL, stroke: o.empty ? GRID : INK, dash: o.empty ? '7 6' : null, sw: 2 });
    tx(BX + 16, BY + 2 - 10, 'AgentState', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: o.title ?? 1 });
    if (o.empty) { sub(BX + BW / 2, BY + BH / 2, o.emptyText || '스키마 없음', o.emptyOp ?? 1, { 'font-size': 15 }); return; }
    // messages 줄
    const r1 = o.r1 ?? 1, r2 = o.r2 ?? 1;
    if (r1 > 0) { mono(50, 76, 'messages', { 'font-size': 17, 'font-weight': 800, opacity: r1 });
      mono(50, 100, o.msgType || 'list', { 'font-size': 13.5, fill: MUT, opacity: r1 });
      if (o.msgBadge) pill(370, 70, 'add_messages', ACC, o.msgBadge, { fs: 13.5, mono: true, fill: ACCBG });
      if (o.values) { const ms = o.msgs || [];
        if (!ms.length) mono(50, MSG_Y + 5, '[ ]', { 'font-size': 17, 'font-weight': 700, opacity: o.values });
        ms.forEach((m, i) => bubble(i, m, { ghost: o.ghost, s: i >= (o.newFrom ?? 99) ? pop(o.u, o.at ?? 0.9) : 1, op: o.values })); } }
    el('line', { x1: BX + 14, y1: 222, x2: BX + BW - 14, y2: 222, stroke: GRID, 'stroke-width': 1.5, opacity: r2 });
    if (r2 > 0) { mono(50, 254, 'turn', { 'font-size': 17, 'font-weight': 800, opacity: r2 });
      mono(50, 278, o.turnType || 'int', { 'font-size': 13.5, fill: MUT, opacity: r2 });
      if (o.turnBadge) pill(330, 248, '덮어쓰기 (기본)', WARN, o.turnBadge, { fs: 13.5, fill: WARNBG });
      if (o.values) { const v = o.turnPrev == null ? o.turn : tween(o.turnPrev, o.turn, o.u, 0.9);
        card(TURN.x, TURN.y, 62, 46, { rx: 8, stroke: o.ghost ? WARN : INK, dash: o.ghost ? '5 4' : null, op: o.values });
        mono(TURN.x, TURN.y + 8, String(Math.round(v)), { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: o.ghost ? WARN : INK, opacity: o.values }); } } }
  const DV = (b) => (b && b.stateDictView) || { messages: [], turn: 0 };

  // 그래프 자리 (오른쪽, 위에서 아래로)
  const GN = { st: { x: 720, y: 58, w: 72, h: 32 }, us: { x: 720, y: 135, w: 140, h: 40 }, ai: { x: 720, y: 212, w: 140, h: 40 }, en: { x: 720, y: 290, w: 48, h: 48 } };
  const FR = { x: 500, y: 26, w: 440, h: 300 };

  // ---------- 1. TypedDict로 스키마 ----------
  function s1(t, c) { const { k, u } = c, a = A(c);
    if (k === 0) { board({ empty: true, emptyOp: fade(u, 0.8), title: fade(u, 0.2) });
      pill(720, 150, 'from typing import TypedDict', INK, pop(u, 0.4), { fs: 14, mono: true });
      sub(720, 196, '어떤 칸을 둘지 아직 정하지 않았다', fade(u, 1.2), { 'font-size': 15 }); return; }
    const dv = DV(c.beat);
    board({ r1: a.o(1, 0.3), r2: k >= 2 ? a.o(2, 0.3) : 0, values: k >= 3 ? a.o(3, 0.4) : 0, msgs: dv.messages, turn: dv.turn });
    if (k === 1) grow(50, 108, 50 + E(u, 0.6, 1.4) * 80, 108, 1, ACC, { plain: true, sw: 3 });
    if (k === 2) { grow(50, 286, 50 + E(u, 0.6, 1.2) * 30, 286, 1, ACC, { plain: true, sw: 3 }); pill(720, 160, '칸 2개', INK, pop(u, 1.2), { fs: 15 }); }
    if (k === 3) { check(150, MSG_Y, 9, pop(u, 1.2)); check(320, TURN.y, 9, pop(u, 1.4));
      mono(720, 150, 'initial = {', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.3) });
      mono(720, 176, '"messages": [], "turn": 0 }', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.5) });
      sub(720, 216, '스키마대로 채운 첫 dict', fade(u, 1.6), { 'font-size': 15 }); }
    if (k === 4) { zone(FR.x, FR.y, FR.w, 150, null, { fill: 'none', stroke: GRID, dash: '7 6' });
      tx(FR.x + FR.w / 2, 108, '그래프는 아직 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      fly(720, 250, TURN.x + 10, TURN.y - 34, seg(u, 0.3, 1.2), '{"turn": 1}', { mono: true, stay: false });
      tx(720, 220, '노드는 바뀐 칸만 dict로 낸다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      sub(720, 360, 'dataclass · pydantic도 되지만 내부가 dict라 TypedDict가 자연스럽다', fade(u, 2.0)); } }

  // ---------- 2. reducer: 이어 붙이기 vs 덮어쓰기 ----------
  const NA = { x: 640, y: 150, w: 90, h: 40 }, NB = { x: 820, y: 150, w: 90, h: 40 };
  function s2(t, c) { const { k, u } = c, a = A(c), dv = DV(c.beat);
    const ann = k >= 1, expMsg = k === 3, expTurn = k === 4;
    let msgs = dv.messages, turn = dv.turn, turnPrev = null, newFrom = 99;
    if (expMsg) { msgs = u < 1.1 ? [] : u < 2.0 ? dv.messages.slice(0, 1) : dv.messages; newFrom = u < 2.0 ? 0 : 1; }
    if (expTurn) { turn = u < 1.0 ? 0 : u < 1.9 ? 1 : 2; turnPrev = u < 1.0 ? null : u < 1.9 ? 0 : 1; }
    const tu = expTurn ? (u < 1.9 ? u - 1.0 : u - 1.9) : u;
    board({ msgType: ann ? 'Annotated[list, add_messages]' : 'list', msgBadge: k >= 1 ? a.s(1, 1.2) : 0, turnBadge: k >= 2 ? a.s(2, 0.5) : 0,
      values: 1, msgs, turn, turnPrev: expTurn ? turnPrev : (k === 5 ? 2 : null), newFrom, u: expMsg ? (u < 2.0 ? u - 1.1 : u - 2.0) + 0.2 : tu + 0.2, at: 0.2 });
    if (k === 0) { pill(640, 150, 'Annotated', INK, pop(u, 0.3), { fs: 15, mono: true }); pill(820, 150, 'add_messages', ACC, pop(u, 0.7), { fs: 15, mono: true, fill: ACCBG });
      sub(730, 210, '합치는 규칙을 칸에 붙일 재료', fade(u, 1.4), { 'font-size': 15 }); }
    if (k === 1) fly(820, 150, 370, 70, seg(u, 0.2, 1.1), 'add_messages', { mono: true });
    if (k === 2) sub(730, 160, 'reducer가 없으면 마지막 값이 이긴다', fade(u, 1.0), { 'font-size': 15 });
    if (expMsg || expTurn) { gnode(NA, 'A'); gnode(NB, 'B'); el('line', { x1: NA.x + 46, y1: NA.y, x2: NB.x - 50, y2: NB.y, stroke: MUT, 'stroke-width': 2 });
      sub(730, 102, '두 노드가 차례로 같은 키를 낸다', fade(u, 0.1), { 'font-size': 14.5 }); }
    if (expMsg) { fly(NA.x, NA.y + 30, 120, MSG_Y, seg(u, 0.3, 1.1), '[m1]', { mono: true, fill: INFO });
      fly(NB.x, NB.y + 30, 140, MSG_Y + 38, seg(u, 1.2, 2.0), '[m2]', { mono: true, fill: ACC });
      mono(730, 260, '[m1] + [m2] → [m1, m2]', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); }
    if (expTurn) { fly(NA.x, NA.y + 30, TURN.x, TURN.y - 30, seg(u, 0.3, 1.0), 'turn=1', { mono: true, fill: WARN });
      fly(NB.x, NB.y + 30, TURN.x, TURN.y - 30, seg(u, 1.2, 1.9), 'turn=2', { mono: true, fill: WARN });
      if (u > 2.0) { mono(TURN.x - 64, TURN.y + 8, '1', { 'text-anchor': 'middle', 'font-size': 20, fill: OFF, 'text-decoration': 'line-through' }); }
      mono(730, 260, '1 → 2 (교체, 1은 사라진다)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.2) }); }
    if (k === 5) { [['add_messages', '같은 id 면 교체, 새 id 면 덧붙임'], ['operator.add', '리스트를 그대로 이어 붙임'], ['직접 작성', '(old, new) → 합친 값']].forEach(([n, d], i) => {
        const y = 92 + i * 62, s = pop(u, 0.5 + i * 0.35); card(720, y, 400, 50, { rx: 10, stroke: i === 0 ? ACC : GRID, s });
        mono(540, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: i === 0 ? ACC : INK, opacity: fade(u, 0.6 + i * 0.35) });
        tx(668, y + 5, d, { 'font-size': 14, opacity: fade(u, 0.6 + i * 0.35) }); });
      sub(720, 300, 'Annotated는 표시일 뿐, 합칠 때 LangGraph가 읽는다', fade(u, 1.9), { 'font-size': 14.5 }); } }

  // ---------- 3. StateGraph + add_node ----------
  function frame(o) { o = o || {}; zone(FR.x, FR.y, FR.w, FR.h, null, { fill: 'none', stroke: o.done ? ACC : MUT, dash: o.done ? null : '7 6', op: o.op ?? 1, sw: o.done ? 2.4 : 1.8 });
    mono(FR.x + 14, FR.y + 22, o.label || 'StateGraph(AgentState)', { 'font-size': 13.5, 'font-weight': 700, fill: o.done ? ACC : MUT, opacity: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c, a = A(c), dv = DV(c.beat), ghost = k === 1 || k === 2;
    board({ msgType: 'Annotated[list, add_messages]', msgBadge: 1, turnBadge: 1, values: 1, msgs: dv.messages, turn: dv.turn, ghost, newFrom: k === 1 ? 0 : k === 2 ? 1 : 99, u, at: 1.4 });
    frame({ op: a.o(0, 0.6) });
    if (k === 0) { grow(BX + BW + 4, 120, FR.x - 4, 120, E(u, 0.2, 0.8), ACC); sub(720, 180, '스키마를 넘겨 그래프를 만든다. 노드는 아직 없다', fade(u, 1.2), { 'font-size': 14.5 }); }
    if (k === 1) { snippet(520, 60, ['def user_say(state):', '  return {"messages": [Human("안녕!")],', '          "turn": state["turn"] + 1}'], { fs: 13.5, op: fade(u, 0.2) });
      sub(720, 200, '실행되면 이렇게 바뀐다 (점선은 미리보기)', fade(u, 1.6), { 'font-size': 14.5 }); }
    if (k === 2) { snippet(520, 60, ['def ai_reply(state):', '  last = state["messages"][-1].content', '  return {"messages": [AI(...)], "turn": ...}'], { fs: 13.5, op: fade(u, 0.2) });
      curve(qb([136, MSG_Y], [330, 150], [516, 104]), E(u, 0.5, 1.2), INFO, { dash: '5 4' });
      mono(250, 24, 'last = "안녕!"', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.1) }); }
    if (k >= 3) { if (k === 3) fly(720, 300, GN.us.x, GN.us.y, seg(u, 0.2, 0.9), 'add_node("user_say")', { mono: true, fill: INK });
      gnode(GN.us, 'user_say', { s: a.s(3, 0.9) });
      if (k === 3) sub(720, 300, '미리보기 값은 지운다', fade(u, 1.5), { 'font-size': 14.5 }); }
    if (k >= 4) { if (k === 4) fly(720, 300, GN.ai.x, GN.ai.y, seg(u, 0.2, 0.9), 'add_node("ai_reply")', { mono: true, fill: INK });
      gnode(GN.ai, 'ai_reply', { s: a.s(4, 0.9) }); if (k === 4) pill(870, 135, '노드 2개', INK, pop(u, 1.3), { fs: 13.5 }); }
    if (k === 5) { tx(720, 180, '?', { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
      tx(720, 290, '어느 노드가 먼저 도는지 아직 모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) });
      sub(720, 360, '반환 dict는 reducer로 합쳐진다', fade(u, 1.6), { 'font-size': 14.5 }); } }

  // ---------- 4. add_edge ----------
  const ERRS = [['set_entry_point를 빠뜨림', 'ValueError: Graph must have an entrypoint', 'compile'],
    ['add_node 안 한 이름', 'ValueError: Found edge ending at unknown node', 'compile'],
    ['END 없이 빙빙 도는 순환', 'GraphRecursionError', '실행 중']];
  function graph4(c, a, o) { o = o || {}; const { k, u } = c;
    gterm(GN.st, 'START'); gnode(GN.us, 'user_say', { hot: o.hotUs }); gnode(GN.ai, 'ai_reply', { hot: o.hotAi });
    if (o.end) gterm(GN.en, 'END', { s: o.end }); }
  function s4(t, c) { const { k, u } = c, a = A(c);
    if (k <= 3) board({ msgType: 'Annotated[list, add_messages]', msgBadge: 1, turnBadge: 1, values: 1, msgs: [], turn: 0 });
    frame({ label: 'graph (배선 중)' });
    graph4(c, a, { end: k >= 2 ? a.s(2, 0.2) : 0, hotUs: k === 0 && u > 0.9 });
    edge(GN.st, GN.us, a.g(0, 0.2, 0.8), INK); if (k >= 0) pill(830, 135, 'entry', ACC, a.s(0, 0.9), { fs: 13.5, mono: true, fill: ACCBG });
    if (k >= 1) edge(GN.us, GN.ai, a.g(1, 0.2, 0.9), INK);
    if (k >= 2) edge(GN.ai, GN.en, a.g(2, 0.4, 1.0), INK);
    if (k === 2) mono(720, 360, 'START → user_say → ai_reply → END', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) });
    if (k === 3) { dot([[720, 58], [720, 290]], (t * 0.5) % 1, ACC, 7);
      curve(qb([790, 212], [880, 212], [890, 290]), E(u, 0.4, 1.1), WARN, { dash: '6 5' }); cross(872, 238, 10, pop(u, 1.2));
      mono(880, 318, 'if …?', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      tx(720, 350, '언제나 같은 길. 갈림길은 add_conditional_edges', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); }
    if (k === 4) ERRS.forEach(([a1, b1, when], i) => { const y = 74 + i * 92, s = pop(u, 0.3 + i * 0.6), op = fade(u, 0.4 + i * 0.6);
      card(245, y, 430, 76, { rx: 10, stroke: BAD, sw: 2, s }); cross(52, y - 14, 8, s);
      tx(70, y - 9, a1, { 'font-size': 15, 'font-weight': 800, opacity: op }); pill(408, y - 14, when, when === 'compile' ? INK : BAD, s, { fs: 13.5 });
      mono(46, y + 20, b1, { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: op }); });
    if (k === 5) { mono(46, 110, 'graph.set_entry_point("user_say")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(200, 150, '=', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) });
      mono(46, 196, 'graph.add_edge(START, "user_say")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      el('rect', { x: 36, y: 240, width: 420, height: 64, rx: 10, fill: SOFT, stroke: GRID, opacity: fade(u, 1.5) });
      mono(50, 266, 'graph.edges에 생기는 것', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) });
      mono(50, 290, "('__start__', 'user_say')", { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); } }

  // ---------- 5. compile + invoke ----------
  function s5(t, c) { const { k, u } = c, a = A(c), dv = DV(c.beat), pv = DV(c.prev);
    const grew = dv.messages.length > pv.messages.length && (k === 2 || k === 3);
    board({ msgType: 'Annotated[list, add_messages]', msgBadge: 1, turnBadge: 1, values: 1, msgs: grew && u < 1.2 ? pv.messages : dv.messages,
      turn: grew && u < 1.2 ? pv.turn : dv.turn, turnPrev: grew && u >= 1.2 ? pv.turn : null, newFrom: grew ? pv.messages.length : 99, u: grew ? u - 1.0 : u, at: 0.2 });
    frame({ done: k >= 0, label: k >= 4 ? 'app (invoked ✓)' : 'app = graph.compile()', op: 1 });
    lock(925, 30, true, ACC, a.s(0, 0.6));
    gterm(GN.st, 'START', {}); gnode(GN.us, 'user_say', { hot: k === 2 && u < 1.6 }); gnode(GN.ai, 'ai_reply', { hot: k === 3 && u < 1.6 }); gterm(GN.en, 'END', { fill: k >= 4 ? GOODBG : PANEL });
    edge(GN.st, GN.us, 1, k === 1 && u > 0.9 ? ACC : INK); edge(GN.us, GN.ai, 1, k === 3 ? ACC : INK); edge(GN.ai, GN.en, 1, k === 4 ? ACC : INK);
    if (k === 0) sub(720, 360, '배선이 끝난 설계도를 실행할 수 있는 Runnable로 굳힌다', fade(u, 1.0), { 'font-size': 14.5 });
    if (k === 1) { fly(720, 380, GN.st.x, GN.st.y + 20, seg(u, 0.2, 0.9), '{"messages": [], "turn": 0}', { mono: true }); dot([[720, 74], [720, 113]], seg(u, 1.0, 1.6), ACC, 7); }
    if (k === 2) { fly(560, 173, 210, MSG_Y, seg(u, 0.3, 1.1), '{messages: [Human], turn: 1}', { mono: true, fill: INFO });
      mono(720, 360, 'messages는 덧붙이고 turn은 0 → 1', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 3) { fly(560, 252, 230, MSG_Y + 38, seg(u, 0.3, 1.1), '{messages: [AI], turn: 2}', { mono: true, fill: ACC });
      mono(720, 360, 'messages 2건, turn 1 → 2', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 4) { dot([[720, 232], [720, 266]], seg(u, 0.1, 0.5), ACC, 7);
      terminal(500, 328, 440, 92, ['>>> result["messages"]', "[Human('안녕!'), AI(\"네! '안녕!' 잘 들었어요\")]", '>>> result["turn"]  →  2'], Math.min(3, E(u, 0.6, 2.2) * 3), { lh: 17, fs: 13.5 }); }
    if (k === 5) [['노드', '바뀐 칸만 dict로 낸다'], ['reducer', '합치는 규칙을 맡는다'], ['invoke', 'entry부터 END까지 한 번에']].forEach(([n, d], i) => {
      const y = 352 + i * 24; mono(560, y, n, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.4) }); tx(650, y, d, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.4) }); }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'AgentState(TypedDict)를 선언한 직후 그래프에 있는 노드 수는 몇 개인가?',
      o: ['0개, 아직 스키마만 있다', '2개, messages와 turn', '1개, AgentState'], a: 0,
      why: 'TypedDict는 State 칸의 이름과 타입만 정한다. 그래프와 노드는 StateGraph와 add_node가 만든다.' },
    { q: '노드 A가 turn=1, 노드 B가 turn=2를 차례로 돌려주면 reducer 없는 turn에 남는 값은 무엇인가?',
      o: ['[1, 2]', '3', '2'], a: 2,
      why: 'reducer가 없는 칸은 마지막 값으로 덮어쓴다. 1은 사라지고 2만 남는다.' },
    { q: 'user_say 노드 함수가 돌려주는 것은 무엇인가?',
      o: ['바뀐 칸만 담은 부분 dict', 'State 전체를 새로 만든 dict', '다음에 실행할 노드 이름'], a: 0,
      why: 'user_say는 {"messages": [...], "turn": ...}처럼 바뀐 키만 낸다. 기존 State와 합치는 일은 reducer가 한다.' },
    { q: 'add_node로 등록하지 않은 이름을 add_edge에 쓰면 언제 오류가 나는가?',
      o: ['add_edge를 부르는 순간', 'compile 할 때 ValueError', '오류 없이 무시된다'], a: 1,
      why: 'compile 단계에서 "Found edge ending at unknown node" ValueError가 난다. entry point가 없을 때도 compile에서 막힌다.' },
    { q: 'invoke({"messages": [], "turn": 0}) 뒤 result["messages"]에 든 메시지 수는 몇 개인가?',
      o: ['1개, 마지막 AI 메시지만', '2개, Human과 AI', '0개, 처음 넣은 빈 리스트'], a: 1,
      why: 'add_messages가 두 노드의 메시지를 이어 붙여 [Human, AI] 두 건이 된다. turn은 덮어써서 2다.' },
  ];

  const summary = [
    'TypedDict로 State 칸의 이름과 타입을 먼저 정한다. 이 단계에는 아직 그래프가 없다.',
    'reducer를 붙인 messages는 이어 붙고, 붙이지 않은 turn은 마지막 값으로 덮어쓴다.',
    '노드는 State를 받아 바뀐 칸만 dict로 돌려주는 함수이고 add_node로 이름을 붙인다.',
    'add_edge로 순서를 잇고 compile 뒤 invoke 하면 messages 2건, turn 2가 남는다.',
  ];
  const review = [
    { q: '대화 봇이 두 번째 턴마다 앞 대화를 잊는다. State를 보니 messages: list였다. 먼저 고칠 것은?',
      o: ['messages를 Annotated[list, add_messages]로 바꾼다', 'turn을 str로 바꾼다', 'add_edge를 하나 더 건다'], a: 0,
      why: 'reducer가 없으면 노드가 낸 새 리스트가 이전 리스트를 덮어쓴다. add_messages를 붙이면 이어 붙는다.' },
    { q: '노드가 {"turns": 5}를 돌려줬는데 State의 turn이 그대로다. 이유는?',
      o: ['turn이 add_messages라서', 'compile을 두 번 해서', 'turns는 스키마에 없는 키라 State에 들어가지 않아서'], a: 2,
      why: 'State 칸은 TypedDict에 적은 키뿐이다. 스키마에 없는 키는 오류 없이 버려지므로 철자를 스키마와 맞춰야 한다.' },
    { q: 'compile에서 "Graph must have an entrypoint"가 났다. 고치는 방법으로 맞는 것은?',
      o: ['ai_reply에 add_edge(…, END)를 더한다', 'set_entry_point("user_say") 또는 add_edge(START, "user_say")를 넣는다', 'messages에 reducer를 붙인다'], a: 1,
      why: '시작 노드가 없다는 뜻이다. 두 표기는 같은 START → user_say 엣지를 만든다.' },
  ];

  R.page({ title: 'State 화이트보드와 그래프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
