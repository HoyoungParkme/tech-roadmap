/* IV-2-2 Human-in-the-Loop — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * interrupt_before 정지, get_state의 next=('tools',), 메시지 개수, update_state의 교체·덧붙임, 거부 후 next=('agent',)는
 * langgraph 1.2 + MemorySaver + 정해진 답을 내는 가짜 모델로 실행해 확인했다. LLM 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal, dbIcon, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 그래프 (START → agent → 분기 → tools / END, tools → agent) ----------
  const ST = { idle: [OFF, PANEL, MUT, 2], ready: [ACC, PANEL, ACC, 2.2], active: [ACC, ACCBG, ACC, 3.2], wait: [WARN, WARNBG, WARN, 2.4], bad: [BAD, BADBG, BAD, 3], off: [OFF, SOFT, OFF, 1.8] };
  function gnode(cx, cy, w, name, st, s) { const [stroke, fill, color, sw] = ST[st || 'ready'];
    card(cx, cy, w, 50, { rx: 12, stroke, fill, sw, text: name, fs: 16, fw: 800, mono: true, color, s }); }
  function capsule(cx, cy, s, name) { card(cx, cy, 70, 30, { rx: 15, fill: INK, stroke: 'none', text: name, fs: 13.5, fw: 700, color: PANEL, s, mono: true }); }
  function diamond(cx, cy, r, s) { if (s <= 0) return; const g = G(cx, cy, s);
    el('path', { d: `M0,${-r} L${r * 1.3},0 L0,${r} L${-r * 1.3},0 Z`, fill: PANEL, stroke: WARN, 'stroke-width': 2.4 }, g);
    tx(0, 7, '?', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: WARN }, g); }
  const mk = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function arc(x1, y1, cx, cy, x2, y2, u, col, o) { if (u <= 0) return; o = o || {};
    el('path', { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 100, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : o.dash, opacity: o.op ?? 1, 'marker-end': u >= 0.98 && !o.plain ? mk(col) : null }); }
  const qpts = (x1, y1, cx, cy, x2, y2) => Array.from({ length: 13 }, (_, i) => { const t = i / 12; return [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2]; });
  const L = { st: [48, 236], ag: [160, 236], br: [262, 236], tl: [374, 154], en: [374, 322], nw: 104, tw: 100, r: 24 };
  const EG = (() => { const [sx, sy] = L.st, [ax, ay] = L.ag, [bx, by] = L.br, [tx_, ty] = L.tl, [ex, ey] = L.en;
    return { SA: [sx + 35, sy, ax - L.nw / 2 - 3, ay], AB: [ax + L.nw / 2, ay, bx - L.r * 1.3 - 3, by], BT: [bx, by - L.r, tx_ - L.tw / 2 - 4, ty + 8], BE: [bx, by + L.r, ex - 39, ey],
      TA: [tx_, ty - 26, (ax + tx_) / 2, Math.min(ay, ty) - 96, ax, ay - 28] }; })();
  const GATE = [lerp(EG.BT[0], EG.BT[2], 0.5), lerp(EG.BT[1], EG.BT[3], 0.5)];
  const ROUTE = { SA: [[EG.SA[0], EG.SA[1]], [EG.SA[2], EG.SA[3]]], AG: [[EG.AB[0], EG.AB[1]], [L.br[0], L.br[1]], GATE], GT: [GATE, [EG.BT[2], EG.BT[3]]],
    AT: [[EG.AB[0], EG.AB[1]], [L.br[0], L.br[1]], [EG.BT[2], EG.BT[3]]], TA: qpts(...EG.TA), AE: [[EG.AB[0], EG.AB[1]], [L.br[0], L.br[1]], [EG.BE[2], EG.BE[3]]] };
  // o: s(0~1 전체 크기), st:{ag,tl}, hot: 굵게 칠할 엣지, flow:[경로, u], gate: 0(없음)~1(닫힘), noGate: 빈 게이트 자리
  function graph(o) { o = o || {}; const s = o.s ?? 1, st = o.st || {};
    grow(...EG.SA, s, o.hot === 'SA' ? ACC : MUT);
    grow(...EG.AB, s, o.hot === 'AB' ? ACC : MUT, { dash: '6 4' });
    grow(...EG.BT, s, o.hot === 'BT' ? ACC : o.hot === 'BTbad' ? BAD : MUT, { dash: '6 4' });
    grow(...EG.BE, s, o.hot === 'BE' ? ACC : MUT, { dash: '6 4' });
    arc(...EG.TA, o.ta ?? s, o.hot === 'TA' ? ACC : MUT);
    capsule(...L.st, s, 'START'); gnode(...L.ag, L.nw, 'agent', st.ag, s); diamond(...L.br, L.r, s); gnode(...L.tl, L.tw, 'tools', st.tl, s); capsule(...L.en, s, 'END');
    if (o.noGate) { el('circle', { cx: GATE[0], cy: GATE[1], r: 15, fill: PANEL, stroke: OFF, 'stroke-width': 1.6, 'stroke-dasharray': '4 3', opacity: o.noGate }); cross(GATE[0], GATE[1], 7, o.noGate); }
    if (o.gate) gate(o.gate);
    if (o.flow) dot(ROUTE[o.flow[0]], o.flow[1], ACC, 8); }
  function gate(v) { if (v <= 0) return; const [x, y] = GATE, g = G(x, y - (1 - v) * 40, 0.6 + 0.4 * v, clamp(v * 1.4));
    el('circle', { cx: 0, cy: 0, r: 17, fill: WARN, stroke: PANEL, 'stroke-width': 2.5 }, g);
    el('rect', { x: -6.5, y: -7, width: 4.5, height: 14, rx: 1, fill: PANEL }, g); el('rect', { x: 2, y: -7, width: 4.5, height: 14, rx: 1, fill: PANEL }, g); }

  // ---------- 메시지 · 표 · 저장소 ----------
  const KIND = { human: ['HumanMessage', INFO, INFOBG], call: ['AIMessage', ACC, ACCBG], tool: ['ToolMessage', WARN, WARNBG], bad: ['ToolMessage', BAD, BADBG], final: ['AIMessage', GOOD, GOODBG] };
  function mrow(x, y, w, i, m, s, o) { o = o || {}; if (s <= 0) return; const [tag, col, bg] = KIND[m.kind], g = G(x + (1 - s) * 40, y, 1, clamp(s * 1.5));
    el('rect', { x: 0, y: 0, width: w, height: 48, rx: 8, fill: bg, stroke: col, 'stroke-width': o.hot ? 2.8 : 1.4 }, g);
    el('rect', { x: 0, y: 0, width: 6, height: 48, rx: 3, fill: col }, g);
    tx(16, 18, (i != null ? `[${i}] ` : '') + tag, { 'font-size': 13.5, 'font-weight': 800, fill: col, class: 'mono' }, g);
    if (m.meta) mono(w - 12, 18, m.meta, { 'font-size': 13.5, fill: o.metaCol || MUT, 'text-anchor': 'end', 'font-weight': o.metaCol ? 800 : 400 }, g);
    mono(16, 39, m.text, { 'font-size': 14.5, fill: o.txtCol || INK, 'font-weight': o.txtCol ? 700 : 400 }, g); }
  const M = {
    human: { kind: 'human', text: '"u_42 계정 삭제해줘"' },
    call: { kind: 'call', text: 'tool_calls: delete_user(id="u_42")', meta: 'call_abc' },
    call43: { kind: 'call', text: 'tool_calls: delete_user(id="u_43")', meta: 'call_abc · id 같음' },
  };
  // users 표: rows [[id, 상태]] 상태 'ok' | 'gone'
  function users(x, y, rows, o) { o = o || {}; const w = 270;
    el('rect', { x, y, width: w, height: 30 + rows.length * 36, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    tx(x + 14, y + 21, 'users 테이블', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    rows.forEach(([id, st], i) => { const yy = y + 30 + i * 36, gone = st === 'gone', a = o.op ?? 1;
      if (gone) el('rect', { x: x + 6, y: yy + 2, width: w - 12, height: 30, rx: 6, fill: BADBG, opacity: a });
      mono(x + 18, yy + 22, id, { 'font-size': 15, 'font-weight': 800, fill: gone ? BAD : INK, 'text-decoration': gone ? 'line-through' : null, opacity: a });
      mono(x + w - 16, yy + 22, gone ? 'DELETE 됨' : 'active', { 'font-size': 14, fill: gone ? BAD : GOOD, 'text-anchor': 'end', 'font-weight': 700, opacity: a }); }); }
  function store(cx, cy, s, o) { o = o || {}; dbIcon(cx, cy, '', { s: s * 0.82, stroke: o.col || INFO, fill: o.fill });
    mono(cx, cy + 56, o.name || 'MemorySaver', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: o.col || INFO, opacity: clamp(s) }); }
  function keyTag(x, y, s) { if (s <= 0) return; pill(x, y, 'thread_id = "thr-7f3a"', INFO, s, { mono: true, fs: 13.5, fill: INFOBG }); }
  function snapCard(cx, cy, s, o) { o = o || {}; if (s <= 0) return; const g = G(cx, cy, s);
    el('rect', { x: -112, y: -46, width: 224, height: 92, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.2 }, g);
    tx(-98, -22, 'checkpoint', { 'font-size': 14, 'font-weight': 800, fill: INFO }, g);
    mono(-98, 4, "next = ('tools',)", { 'font-size': 14, 'font-weight': 700 }, g);
    mono(-98, 28, o.msgs || 'messages 2개', { 'font-size': 14 }, g); }
  const X = 456, W = 484;   // 메시지 칸

  // 1. 사람 없이 끝까지 — 위험 도구가 그대로 실행
  function riskCard(cx, cy, s, head, doc, body) { if (s <= 0) return; const g = G(cx, cy, s);
    el('rect', { x: -190, y: -62, width: 380, height: 124, rx: 10, fill: PANEL, stroke: BAD, 'stroke-width': 2.2 }, g);
    mono(-174, -34, '@tool', { 'font-size': 14, 'font-weight': 700, fill: WARN }, g); mono(-120, -34, head, { 'font-size': 15, 'font-weight': 800 }, g);
    tx(-174, -8, doc, { 'font-size': 14, fill: MUT }, g);
    el('rect', { x: -176, y: 10, width: 352, height: 34, rx: 6, fill: BADBG }, g); mono(-164, 32, body, { 'font-size': 14, fill: BAD, 'font-weight': 700 }, g); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { const s0 = k === 0 ? pop(u, 0.2) : 1, s1_ = k === 1 ? pop(u, 0.2) : k > 1 ? 1 : 0, shrink = k === 2 ? 1 - 0.25 * E(u, 0.3, 1.0) : 1;
      riskCard(230, 112, s0 * shrink, 'delete_user(id: str)', '"사용자 계정을 영구 삭제 (복구 불가)."', 'DELETE FROM users WHERE id = ?');
      riskCard(230, 292, s1_ * shrink, 'charge_card(amount: int)', '"결제를 즉시 진행."', 'stripe.Charge.create(amount=…)');
      users(660, 36, [['u_42', 'ok'], ['u_43', 'ok']], { op: k === 0 ? fade(u, 0.8) : 1 });
      if (k === 0) pill(795, 186, '되돌릴 방법이 없다', BAD, pop(u, 1.6), { fs: 14 });
      if (k === 1) pill(795, 186, '비가역 도구 2개', BAD, pop(u, 1.2), { fs: 14 });
      if (k === 2) { card(760, 300, 240, 72, { rx: 12, fill: ACCBG, stroke: ACC, sw: 2.4, s: pop(u, 0.2) }); tx(760, 294, 'llm.bind_tools(tools)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.3) });
        sub(760, 318, 'gpt-4o-mini', fade(u, 0.3), { class: 'mono' });
        fly(400, 112, 690, 290, seg(u, 0.6, 1.4), 'delete_user', { mono: true, fill: BAD }); fly(400, 292, 690, 310, seg(u, 0.9, 1.7), 'charge_card', { mono: true, fill: BAD });
        tx(760, 372, '무엇을 부를지는 LLM이 정한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); }
      return; }
    users(660, 36, [['u_42', k === 6 && u > 1.5 ? 'gone' : 'ok'], ['u_43', 'ok']]);
    const st = { ag: k === 5 ? 'active' : 'ready', tl: k === 6 ? 'bad' : 'ready' };
    graph({ s: k === 3 ? E(u, 0.2, 1.2) : 1, st, noGate: k === 3 ? fade(u, 1.4) : 1, hot: k === 6 ? 'BTbad' : k === 5 ? 'SA' : null,
      flow: k === 5 ? ['SA', seg(u, 0.2, 0.9)] : k === 6 ? ['AT', seg(u, 0.2, 1.2)] : null });
    if (k === 3) tx(GATE[0] + 22, GATE[1] + 30, '검사 지점 없음', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
    if (k === 4) { const ox = 700; card(ox, 290, 300, 150, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) });
      mono(ox - 130, 250, 'app = graph.compile()', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.4) });
      [['interrupt_before', 1.0], ['checkpointer', 1.5]].forEach(([n, a], i) => { const y = 290 + i * 40; mono(ox - 130, y, n + ' =', { 'font-size': 14.5, fill: MUT, opacity: fade(u, a) }); cross(ox + 90, y - 5, 8, pop(u, a + 0.3)); });
      return; }
    if (k >= 5) { mrow(X, 200, W, 0, M.human, k === 5 ? E(u, 0.1, 0.6) : 1); mrow(X, 256, W, 1, M.call, k === 5 ? E(u, 1.0, 1.7) : 1); }
    if (k === 5) tx(X + W / 2, 340, 'agent가 delete_user를 고른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
    if (k === 6) { mrow(X, 312, W, 2, { kind: 'bad', text: '"deleted u_42"', meta: 'call_abc' }, E(u, 1.4, 2.0));
      banner(X + W / 2, 396, '멈출 틈 없이 실행됐다 · 복구 불가', pop(u, 2.1)); } }

  // 2. interrupt_before — tools 직전에 멈춘다
  function s2(t, c) { const { k, u } = c;
    store(800, 92, k === 0 ? pop(u, 0.2) : 1);
    if (k === 0) { [['개발', 'MemorySaver'], ['운영', 'SqliteSaver · PostgresSaver']].forEach(([a, b], i) => { const y = 210 + i * 46, s = fade(u, 0.9 + i * 0.4);
        tx(640, y, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); mono(690, y, b, { 'font-size': 14.5, opacity: s }); });
      tx(800, 320, '멈춘 순간의 state를 담아 둘 곳', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    const gs = k === 1 ? E(u, 0.2, 1.4) : 1, gv = k === 2 ? E(u, 0.3, 1.2) : k > 2 ? 1 : 0;
    const st = { ag: k === 4 ? 'active' : 'ready', tl: k === 6 ? 'wait' : 'ready' };
    graph({ s: gs, st, gate: gv, hot: k === 4 ? 'SA' : k === 6 ? 'AB' : null, flow: k === 4 ? ['SA', seg(u, 0.3, 1.0)] : k === 6 ? ['AG', Math.min(0.999, seg(u, 0.2, 1.0))] : null });
    if (k === 1) tx(230, 392, '노드·엣지는 Step 1과 같다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
    if (k >= 2) { mono(230, 392, 'interrupt_before=["tools"]', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: k === 2 ? fade(u, 1.0) : 1 });
      arc(740, 100, 560, 90, 440, 160, k === 2 ? E(u, 1.2, 1.9) : 1, INFO, { plain: true, dash: '5 5' });
      if (k === 2) tx(600, 74, 'checkpointer', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k >= 3) keyTag(800, 186, k === 3 ? pop(u, 0.3) : 1);
    if (k === 3) tx(800, 226, '재개할 때 같은 열쇠를 쓴다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
    if (k >= 4) mrow(X, 250, W, 0, M.human, k === 4 ? E(u, 0.1, 0.6) : 1);
    if (k >= 5) mrow(X, 306, W, 1, M.call, k === 5 ? E(u, 0.3, 1.0) : 1);
    if (k === 5) tx(X + W / 2, 384, 'agent는 여기까지 하고 끝난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
    if (k === 6) { dot([GATE, [GATE[0], 60], [488, 60]], seg(u, 1.0, 1.6), INFO, 7); snapCard(600, 96, pop(u, 1.6), {});
      grow(712, 96, 752, 96, E(u, 2.0, 2.4), INFO);
      tx(X + W / 2, 384, 'invoke는 여기서 return 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.1) }); } }

  // 3. get_state — 멈춘 state를 꺼내 본다
  function s3(t, c) { const { k, u } = c;
    store(110, 84, 1); keyTag(110, 176, 1);
    const pull = k === 0 ? E(u, 0.4, 1.4) : 1;
    mono(110, 226, 'app.get_state(config)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) fly(150, 84, 560, 70, seg(u, 0.4, 1.4), 'snapshot', { fill: INFO });
    // 스냅샷 카드
    const cs = k === 0 ? pop(u, 1.4) : 1; if (cs <= 0) return;
    const g = G(0, 0, 1, clamp(cs));
    el('rect', { x: 250, y: 30, width: 690, height: 222, rx: 12, fill: PANEL, stroke: INFO, 'stroke-width': 2.2 }, g);
    mono(268, 58, 'snapshot', { 'font-size': 15, 'font-weight': 800, fill: INFO }, g);
    const hiNext = k === 1, hiMsg = k === 2;
    if (hiNext) el('rect', { x: 262, y: 70, width: 300, height: 30, rx: 6, fill: WARNBG }, g);
    mono(272, 91, ".next = ('tools',)", { 'font-size': 15, 'font-weight': hiNext ? 800 : 500, fill: hiNext ? WARN : INK }, g);
    if (hiNext) tx(580, 91, '재개하면 tools부터', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6) }, g);
    mono(272, 124, '.values["messages"]', { 'font-size': 15, 'font-weight': hiMsg ? 800 : 500, fill: hiMsg ? ACC : INK }, g);
    mrow(268, 136, 320, 0, { kind: 'human', text: '"u_42 계정 삭제해줘"' }, k === 2 ? E(u, 0.3, 0.9) : k > 2 ? 1 : 0);
    mrow(600, 136, 326, 1, { kind: 'call', text: 'delete_user(…)', meta: 'call_abc' }, k === 2 ? E(u, 0.8, 1.4) : k > 2 ? 1 : 0, { hot: k === 3 });
    if (k === 2) tx(595, 214, '부수 효과는 아직 없다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }, g);
    if (k === 3) { const f = [['name', 'delete_user'], ['args', "{'id': 'u_42'}"], ['id', 'call_abc']];
      f.forEach(([a, b], i) => { const x = 280 + i * 220, s = pop(u, 0.4 + i * 0.4); card(x + 90, 300, 200, 56, { rx: 8, stroke: i === 1 ? BAD : ACC, sw: 2, s });
        mono(x + 10, 290, `tc["${a}"]`, { 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); mono(x + 10, 314, b, { 'font-size': 15, 'font-weight': 800, fill: i === 1 ? BAD : INK, opacity: clamp(s) }); });
      grow(763, 186, 700, 268, E(u, 0.2, 0.6), ACC, { plain: true, dash: '3 4' });
      tx(595, 372, 'for tc in pending.tool_calls', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { terminal(250, 270, 420, 120, ['⚠ 도구: delete_user', "  인자: {'id': 'u_42'}"], lerp(0, 2, E(u, 0.3, 1.6)), { title: 'print', lh: 26, fs: 15 });
      users(680, 270, [['u_42', 'ok'], ['u_43', 'ok']], { op: fade(u, 1.6) }); tx(110, 300, '부수 효과 0', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { person(110, 330, '검토자', { s: pop(u, 0.1) });
      ['도구가 요청한 작업과 맞나', '인자 id가 맞나', '비가역(DELETE·결제·메일)인가', 'prompt injection 흔적은 없나'].forEach((s, i) => { const y = 286 + i * 32;
        check(272, y - 5, 8, pop(u, 0.4 + i * 0.35)); tx(292, y, s, { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.35) }); });
      pill(820, 330, 'risk = HIGH · 비가역', BAD, pop(u, 1.9), { fs: 15, fill: BADBG }); } }

  // 4. 승인 — invoke(None) 또는 update_state로 고친 뒤 재개
  function s4(t, c) { const { k, u } = c;
    if (k === 7) { // 시간이 지나도 같은 지점부터
      const y = 210, x0 = 110, x1 = 850; grow(x0, y, x1, y, E(u, 0.1, 1.0), MUT);
      [['첫날', '정지 · checkpoint 저장', 0, WARN], ['', '사람이 검토하는 동안 그래프는 아무것도 안 한다', 0.5, MUT], ['며칠 뒤', 'invoke(None, 같은 thread_id)', 1, GOOD]].forEach(([d, s, f, col], i) => {
        const x = lerp(x0, x1, f), a = fade(u, 0.4 + i * 0.6); if (i !== 1) { el('circle', { cx: x, cy: y, r: 9, fill: col, opacity: a }); mono(x, y - 24, d, { 'text-anchor': i ? 'end' : 'start', 'font-size': 14, 'font-weight': 700, fill: col, opacity: a }); }
        tx(i === 1 ? x : i ? x : x, y + (i === 1 ? -50 : 36), s, { 'text-anchor': i === 1 ? 'middle' : i ? 'end' : 'start', 'font-size': 14.5, fill: i === 1 ? MUT : INK, 'font-weight': i === 1 ? 400 : 700, opacity: a }); });
      store(480, 300, pop(u, 1.2), { name: 'thr-7f3a' });
      tx(480, 404, 'MemorySaver는 프로세스가 끝나면 사라진다 · 운영은 Postgres 등', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    const caseB = k >= 3, del42 = (k === 1 && u > 1.3) || k === 2, del43 = k === 6 && u > 1.6;
    users(670, 30, [['u_42', del42 ? 'gone' : 'ok'], ['u_43', del43 ? 'gone' : 'ok']]);
    const open = k === 1 ? 1 - E(u, 0.1, 0.5) : k === 2 ? 0 : k === 6 ? 1 - E(u, 0.1, 0.5) : 1;
    const flow = k === 1 ? (u < 1.3 ? ['GT', seg(u, 0.4, 1.2)] : ['AE', seg(u, 1.7, 2.5)]) : k === 6 ? ['GT', seg(u, 0.4, 1.4)] : null;
    graph({ st: { ag: 'ready', tl: (k === 1 && u > 1.0 && u < 1.8) || (k === 6 && u > 1.2) ? 'active' : open > 0.5 ? 'wait' : 'ready' }, gate: open, flow, hot: k === 1 && u > 1.6 ? 'BE' : null });
    pill(230, 40, caseB ? 'Case B · 인자 교정' : 'APPROVE', caseB ? WARN : GOOD, k === 0 || k === 3 ? pop(u, 0.2) : 1, { fs: 15 });
    if (k === 0) { mono(230, 396, 'app.invoke(None, config)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
      tx(670, 230, 'None = 새 입력 없이 멈춘 곳부터', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); }
    const rows = [[0, M.human], [1, caseB && k >= 5 ? M.call43 : M.call]];
    const Y0 = 196, DY = 54;
    rows.forEach(([i, m]) => mrow(X, Y0 + i * DY + (k === 0 ? 70 : 0), W, i, m, 1, { hot: (i === 1 && k === 3) || (i === 1 && k === 5 && u > 1.4), metaCol: i === 1 && k >= 4 ? ACC : null }));
    if (k === 2) { mrow(X, Y0 + 2 * DY, W, 2, { kind: 'tool', text: '"deleted u_42"', meta: 'call_abc' }, E(u, 0.2, 0.8));
      mrow(X, Y0 + 3 * DY, W, 3, { kind: 'final', text: 'u_42 계정을 영구 삭제했습니다.', meta: '예시' }, E(u, 0.9, 1.5), { hot: true }); }
    if (k === 1) tx(X + W / 2, 336, 'tools 실행 → agent → END', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
    if (k === 3) { el('line', { x1: X + 200, y1: Y0 + DY + 42, x2: X + 200 + 120 * E(u, 0.6, 1.2), y2: Y0 + DY + 42, stroke: BAD, 'stroke-width': 3 });
      tx(X + W / 2, Y0 + 2 * DY + 40, '사실은 u_43 이어야 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); }
    if (k === 4) { const y = Y0 + 2 * DY + 14, s = pop(u, 0.3); card(X + W / 2, y + 40, W, 96, { rx: 10, stroke: WARN, sw: 2.2, fill: WARNBG, s });
      mono(X + 16, y + 18, 'patched = AIMessage(', { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(s) });
      mono(X + 32, y + 42, 'id=last.id,   # 같은 메시지 id', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9) });
      mono(X + 32, y + 66, 'tool_calls=[delete_user(id="u_43"), call_abc])', { 'font-size': 14.5, opacity: fade(u, 1.4) }); }
    if (k === 5) { fly(X + W / 2, Y0 + 3 * DY, X + W / 2, Y0 + DY + 24, seg(u, 0.2, 1.3), 'update_state(…, as_node="agent")', { mono: true, fill: WARN });
      tx(X, Y0 + 2 * DY + 30, '같은 id → [1]을 바꿔 끼운다', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      tx(X, Y0 + 2 * DY + 58, 'id 없이 넣으면 뒤에 하나 더 붙는다 (실행 확인)', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) }); }
    if (k === 6) mrow(X, Y0 + 2 * DY, W, 2, { kind: 'tool', text: '"deleted u_43"', meta: 'call_abc' }, E(u, 1.6, 2.2)); }

  // 5. 거부 — 도구는 끝내 실행되지 않는다
  function s5(t, c) { const { k, u } = c;
    if (k === 6) { const st = [['자율 실행', BAD], ['tools 직전 정지', WARN], ['get_state 검토', INFO], ['승인·교정 후 재개', GOOD], ['거부', BAD]];
      st.forEach(([s, col], i) => { const x = 110 + i * 185, sc = pop(u, 0.2 + i * 0.3);
        card(x, 170, 160, 64, { rx: 12, stroke: col, sw: 2.4, fill: PANEL, s: sc, text: s, fs: 15, fw: 800, color: col });
        mono(x, 120, String(i + 1), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: clamp(sc) });
        if (i < 4) grow(x + 82, 170, x + 103, 170, E(u, 0.5 + i * 0.3, 0.8 + i * 0.3), MUT); });
      users(345, 270, [['u_42', 'ok'], ['u_43', 'ok']], { op: fade(u, 1.8) });
      tx(480, 400, '거부한 쪽은 DELETE가 한 번도 나가지 않았다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    users(670, 30, [['u_42', 'ok'], ['u_43', 'ok']]);
    const injected = k >= 4, gv = injected ? 1 - E(u, k === 4 ? 1.2 : -1, k === 4 ? 1.6 : 0) : 1;
    graph({ st: { ag: k === 5 && u > 0.9 && u < 1.8 ? 'active' : 'ready', tl: injected ? 'off' : 'wait' }, gate: injected ? (k === 4 ? gv : 0) : 1,
      flow: k === 5 ? (u < 1.0 ? ['TA', seg(u, 0.1, 0.9)] : ['AE', seg(u, 1.6, 2.4)]) : null, hot: k === 5 ? (u < 1.2 ? 'TA' : 'BE') : null });
    if (injected) { cross(L.tl[0] + 44, L.tl[1] - 24, 9, k === 4 ? pop(u, 1.6) : 1); }
    pill(230, 40, 'REJECT', BAD, k === 0 ? pop(u, 0.2) : 1, { fs: 15, fill: BADBG });
    mrow(X, 196, W, 0, M.human, 1); mrow(X, 250, W, 1, M.call, 1, { metaCol: k === 2 ? ACC : null, hot: k === 2 });
    if (k === 0) { store(560, 360, pop(u, 0.4), { name: 'checkpoint 보관' }); tx(780, 340, 'invoke를 더 부르지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(780, 368, '도구는 영원히 실행되지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 1) { [['옵션 1 · 그냥 둔다', MUT, 0.3], ['옵션 2 · 거부를 agent 에게 알린다', ACC, 0.8]].forEach(([s, col, a], i) => pill(X + W / 2, 336 + i * 44, s, col, pop(u, a), { fs: 15, fill: i ? ACCBG : PANEL })); return; }
    if (k === 2) { mono(X, 342, 'tool_id = pending.tool_calls[0]["id"]', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      fly(X + W - 40, 268, X + 380, 382, seg(u, 0.8, 1.6), 'call_abc', { mono: true }); if (u > 1.6) pill(X + 380, 382, 'call_abc', ACC, 1, { mono: true }); return; }
    const rej = { kind: 'bad', text: '"rejected by human — not executed"', meta: 'call_abc' };
    if (k === 3) { card(X + W / 2, 350, W, 70, { rx: 10, stroke: BAD, sw: 2.2, fill: PANEL, s: pop(u, 0.3) });
      mono(X + 16, 340, 'ToolMessage(content="rejected by human …",', { 'font-size': 14.5, opacity: fade(u, 0.5) }); mono(X + 16, 364, '            tool_call_id="call_abc")', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(X + W / 2, 408, '도구는 아직 한 번도 불리지 않았다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    mrow(X, 304, W, 2, rej, k === 4 ? E(u, 0.3, 1.0) : 1);
    if (k === 4) { mono(X, 384, 'update_state(…, as_node="tools")', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
      mono(X, 408, "→ next = ('agent',)", { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); return; }
    mrow(X, 358, W, 3, { kind: 'final', text: '본인 확인이 필요합니다. 고객센터로…', meta: '예시' }, E(u, 1.4, 2.0), { hot: true }); }

  const quiz = [
    { q: 'interrupt_before 없이 compile한 Agent가 delete_user를 고르면 무슨 일이 생기나?',
      o: ['ToolNode가 곧바로 DELETE를 실행한다', '그래프가 사람의 확인을 기다린다', 'LLM이 실행 전에 한 번 더 묻는다'], a: 0,
      why: '정지 지점이 없으면 agent가 고른 도구를 tools 노드가 그대로 실행한다. u_42가 지워지고 되돌릴 수 없다.' },
    { q: 'interrupt_before=["tools"]로 멈춘 그래프를 나중에 다시 찾는 열쇠는 무엇인가?',
      o: ['tool_call_id', 'config의 thread_id', '노드 이름 "tools"'], a: 1,
      why: 'checkpointer는 state를 thread_id 별로 저장한다. 재개할 때 같은 thr-7f3a를 넘겨야 그 checkpoint를 불러온다.' },
    { q: '멈춘 뒤 app.get_state(config).next에 들어 있는 값은 무엇인가?',
      o: ["('agent',)", '()', "('tools',)"], a: 2,
      why: 'tools 직전에서 멈췄으므로 다음에 실행될 노드는 tools다. 이 시점까지 DELETE는 나가지 않았다.' },
    { q: 'update_state로 tool_calls 인자를 u_43으로 고칠 때 새 AIMessage에 꼭 넣어야 하는 것은?',
      o: ['원래 메시지와 같은 id', '새로 만든 tool_call id', 'as_node="tools"'], a: 0,
      why: 'messages는 메시지 id가 같을 때만 바꿔 끼운다. id가 없으면 AIMessage가 하나 더 붙어 tool_calls가 두 개 남는다.' },
    { q: '거부 ToolMessage를 as_node="tools"로 넣은 뒤 next는 무엇이 되나?',
      o: ["('tools',)", "('agent',)", '()'], a: 1,
      why: 'tools가 응답한 것으로 기록되니 다음은 tools→agent 엣지를 따라 agent다. agent가 거부를 읽고 안내 답을 만든다.' },
  ];

  const summary = [
    '정지 지점이 없으면 LLM이 고른 DELETE나 결제가 사람 확인 없이 바로 실행된다.',
    'interrupt_before=["tools"]와 checkpointer를 주면 tools 직전에 멈추고 state가 저장된다.',
    'get_state로 next와 tool_calls를 보고 승인은 invoke(None), 교정은 update_state로 한다.',
    '거부할 때는 같은 tool_call_id의 ToolMessage를 넣어 agent가 안내 답을 만들게 한다.',
  ];
  const review = [
    { q: '승인 버튼을 누르고 invoke(None, config)를 불렀는데 처음부터 다시 도는 것 같다. 먼저 의심할 것은?',
      o: ['tools 노드의 함수가 잘못됐다', '재개할 때 thread_id가 처음과 다르다', 'interrupt_before를 interrupt_after로 써야 한다'], a: 1,
      why: 'checkpoint는 thread_id로 찾는다. 다른 값을 넘기면 저장된 state가 없어 멈춘 지점을 이어 갈 수 없다.' },
    { q: '서버를 재시작했더니 승인 대기 중이던 요청이 모두 사라졌다. 무엇을 바꿔야 하나?',
      o: ['checkpointer를 Sqlite나 Postgres 저장소로 바꾼다', 'interrupt_before에 agent를 더한다', 'update_state를 한 번 더 부른다'], a: 0,
      why: 'MemorySaver는 프로세스 메모리에만 있다. 며칠 뒤 승인하려면 디스크나 DB에 남는 checkpointer가 필요하다.' },
    { q: '인자를 고쳐 재개했더니 모델 API가 "응답 없는 tool_calls가 있다"는 오류를 냈다. 원인으로 가장 그럴듯한 것은?',
      o: ['ToolMessage의 content가 비어 있었다', '거부 메시지를 as_node="agent"로 넣었다', '교정한 AIMessage에 원래 id를 주지 않았다'], a: 2,
      why: 'id 없이 넣으면 원래 AIMessage가 그대로 남는다. 같은 call_abc에 응답은 하나뿐이라 한쪽 호출이 짝 없이 남는다.' },
  ];

  R.page({ title: '정지 · 검토 · 재개', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
