/* IV-1-3 Node, Edge, Conditional Edge — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 비유는 지하철 노선도: 노드 = 역, 엣지 = 직통, 조건부 엣지 = 환승(◇), 루프 = 순환, END = 종착.
 * call_agent 결과(count 1), 날씨 루프의 메시지 순서, recursion_limit=10의 GraphRecursionError, 같은 출발점에 엣지 두 종류를 걸면 둘 다 도는 것은
 * langgraph 1.2.24로 돌려 확인했다. 날씨 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, snippet, kvTable } = R;
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
  // 역(노드): 둥근 판 + 왼쪽 역 표시 원
  function station(n, name, o) { o = o || {}; const hot = o.hot;
    const g = card(n.x, n.y, n.w, n.h, { rx: n.h / 2, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : o.stroke || INK, sw: hot ? 3 : 2.2, s: o.s, op: o.op, dash: o.dash });
    el('circle', { cx: -n.w / 2 + 18, cy: 0, r: 6, fill: hot ? ACC : o.stroke || INK }, g);
    tx(8, 5.5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: hot ? ACC : o.stroke || INK }, g); return g; }
  function gterm(n, kind, o) { o = o || {};
    if (kind === 'START') return card(n.x, n.y, n.w, n.h, { rx: n.h / 2, fill: INK, stroke: 'none', text: 'START', fs: 13.5, fw: 800, color: PANEL, mono: true, s: o.s, op: o.op });
    const g = R.G(n.x, n.y, o.s, o.op); el('circle', { cx: 0, cy: 0, r: n.h / 2, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2.4 }, g); el('circle', { cx: 0, cy: 0, r: n.h / 2 - 6, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': 1.8 }, g);
    tx(0, 5, 'END', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, class: 'mono', fill: o.col || INK }, g); return g; }
  function diamond(n, s, o) { o = o || {}; if (s <= 0) return; const g = R.G(n.x, n.y, s); el('path', { d: 'M0,-24 L28,0 L0,24 L-28,0 Z', fill: o.hot ? WARN : WARNBG, stroke: WARN, 'stroke-width': 2.4 }, g);
    tx(0, 5, '?', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: o.hot ? PANEL : WARN }, g); }

  // ---------- 노선도 자리 ----------
  const M = { st: { x: 80, y: 120, w: 72, h: 34 }, ag: { x: 235, y: 120, w: 128, h: 46 }, rt: { x: 395, y: 120, w: 56, h: 48 }, tl: { x: 395, y: 290, w: 116, h: 46 }, en: { x: 575, y: 120, w: 52, h: 52 } };
  const LOOP = qb([337, 290], [235, 290], [235, 147]);
  const P = (n) => [n.x, n.y];
  // o: 각 요소의 크기/진행도 (0 이면 안 그림)
  function netmap(o) { o = o || {};
    if (o.st) gterm(M.st, 'START', { s: o.st });
    if (o.sa) edge(M.st, M.ag, o.sa, o.saCol || INK, { sw: 3 });
    if (o.ag) station(M.ag, 'agent', { s: o.ag, hot: o.hotAg });
    if (o.ar) edge(M.ag, M.rt, o.ar, INK, { sw: 3, plain: o.ar < 1 ? false : true });
    if (o.rt) diamond(M.rt, o.rt, { hot: o.hotRt });
    if (o.tl) station(M.tl, 'tool', { s: o.tl, hot: o.hotTl });
    if (o.en) gterm(M.en, 'END', { s: o.en, fill: o.endFill, col: o.endCol });
    if (o.rtT) { edge(M.rt, M.tl, o.rtT, WARN, { dash: '8 6', sw: 2.6 }); mono(408, 210, '"continue"', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: clamp(o.rtT * 2 - 1) }); }
    if (o.rtE) { edge(M.rt, M.en, o.rtE, WARN, { dash: '8 6', sw: 2.6 }); mono(485, 102, '"end"', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: clamp(o.rtE * 2 - 1) }); }
    if (o.loop) curve(LOOP, o.loop, INFO, { sw: o.loopW || 3 }); }
  const FULL = { st: 1, sa: 1, ag: 1, ar: 1, rt: 1, tl: 1, en: 1, rtT: 1, rtE: 1, loop: 1 };
  const runPath = [P(M.st), P(M.ag), P(M.rt), P(M.tl), [235, 290], P(M.ag), P(M.rt), P(M.en)];

  // ---------- 1. Node ----------
  function s1(t, c) { const { k, u } = c, a = A(c); marks();
    if (k === 0) { [['TypedDict', 160], ['operator.add', 330], ['StateGraph', 500]].forEach(([s, x], i) => pill(x, 120, s, INK, pop(u, 0.3 + i * 0.35), { fs: 15, mono: true }));
      el('rect', { x: 40, y: 200, width: 580, height: 170, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: fade(u, 1.2) });
      sub(330, 290, '노선도는 아직 비어 있다', fade(u, 1.5), { 'font-size': 15 }); return; }
    const after = k >= 2 && (k > 2 || u > 1.7);
    kvTable(660, 40, 280, [
      ['messages', after ? '[{ai: "안녕하세요"}]' : k >= 2 ? '[]' : 'Annotated[list, add]', { op: a.o(1, 0.3), hot: k === 2 && after }],
      ['count', after ? '1' : k >= 2 ? '0' : 'int', { op: a.o(1, 0.7), hot: k === 2 && after }],
    ], { title: 'AgentState', kw: 92, rh: 40 });
    if (k === 1) sub(800, 180, 'messages는 add로 누적된다', fade(u, 1.2), { 'font-size': 14.5 });
    // 함수 기계 → 역
    if (k === 2) { card(330, 240, 230, 70, { rx: 12, stroke: ACC, sw: 2.6, s: pop(u, 0.2) });
      mono(330, 236, 'call_agent(state)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      sub(330, 258, '받은 State → 바뀐 칸 dict', fade(u, 0.4));
      fly(800, 112, 210, 240, seg(u, 0.4, 1.0), '{messages: [], count: 0}', { mono: true, fill: INK });
      fly(450, 240, 800, 130, seg(u, 1.1, 1.7), '{messages: [ai], count: 1}', { mono: true });
      sub(800, 172, 'messages +1, count +1', fade(u, 1.9), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); }
    if (k >= 3) { const sh = k === 3 ? E(u, 0.2, 1.0) : 1;
      if (k === 3) card(lerp(330, M.ag.x, sh), lerp(240, M.ag.y, sh), lerp(230, 128, sh), lerp(70, 46, sh), { rx: 14, stroke: ACC, sw: 2.4, op: 1 - fade(u, 0.9, 0.3) });
      station(M.ag, 'agent', { s: a.s(3, 1.0) });
      mono(235, 186, 'add_node("agent", call_agent)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: a.o(3, 1.4) }); }
    if (k === 4) { [['LLM 호출', 90, 300], ['DB 조회', 235, 330], ['API 호출', 380, 300]].forEach(([s, x, y], i) => {
        pill(x, y, s, INFO, pop(u, 0.3 + i * 0.3), { fs: 14.5, fill: INFOBG }); grow(x, y - 16, lerp(x, 235, 0.65), lerp(y - 16, 146, 0.65), E(u, 0.6 + i * 0.3, 1.1 + i * 0.3), INFO); });
      tx(800, 220, '무엇이든 함수로 감싸면 역이 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(800, 248, 'return 한 dict가 State에 합쳐진다', fade(u, 2.0), { 'font-size': 14.5 }); } }

  // ---------- 2. Edge ----------
  const E2N = { st: { x: 80, y: 230, w: 72, h: 34 }, ag: { x: 250, y: 230, w: 128, h: 46 }, sv: { x: 470, y: 230, w: 120, h: 46 }, rt: { x: 360, y: 104, w: 56, h: 48 }, en: { x: 480, y: 104, w: 50, h: 50 } };
  function s2(t, c) { const { k, u } = c, a = A(c); marks();
    station(E2N.ag, 'agent', { s: a.s(0, 0.2) }); station(E2N.sv, 'save', { s: a.s(0, 0.6) });
    if (k === 0) sub(360, 310, '역 두 개. 노선은 아직 없다', fade(u, 1.2), { 'font-size': 15 });
    if (k >= 1) { gterm(E2N.st, 'START', { s: a.s(1, 0.2) }); edge(E2N.st, E2N.ag, a.g(1, 0.5, 1.1), INK, { sw: 3 });
      if (k === 1) { mono(330, 320, 'set_entry_point("agent")', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
        mono(330, 350, '= add_edge(START, "agent")', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); } }
    if (k >= 2) { edge(E2N.ag, E2N.sv, a.g(2, 0.3, 1.0), INK, { sw: 3 });
      if (k === 2) mono(360, 320, 'add_edge("agent", "save")', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); }
    if (k === 3) { dot([P(E2N.st), P(E2N.ag), P(E2N.sv)], (t * 0.45) % 1, ACC, 8);
      tx(360, 320, '분기도 환승도 없는 직통 노선', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) });
      sub(360, 350, 'agent가 끝나는 순간 save가 시작된다', fade(u, 1.4), { 'font-size': 15 }); }
    if (k === 4) { diamond(E2N.rt, pop(u, 0.2)); gterm(E2N.en, 'END', { s: pop(u, 0.4) });
      edge(E2N.ag, E2N.rt, E(u, 0.3, 0.7), WARN, { dash: '7 5' }); edge(E2N.rt, E2N.en, E(u, 0.6, 0.9), WARN, { dash: '7 5' });
      dot([P(E2N.ag), P(E2N.sv)], seg(u, 1.0, 1.9), ACC, 8); dot([P(E2N.ag), P(E2N.rt), P(E2N.en)], seg(u, 1.0, 1.9), WARN, 8);
      tx(330, 330, '같은 출발점에 둘 다 걸면 두 길이 모두 실행된다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      sub(330, 360, '오류는 나지 않는다. 한 길만 원하면 조건부 엣지 하나로 묶는다', fade(u, 2.1), { 'font-size': 14.5 });
      tx(760, 150, 'add_edge("agent", "save")', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(760, 176, '+ add_conditional_edges("agent", …)', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) }); } }

  // ---------- 3. Conditional Edge ----------
  const ROUTER = ['def should_continue(state):', '    last = state["messages"][-1]', '    if last.get("tool_calls"):', '        return "continue"', '    return "end"'];
  function s3(t, c) { const { k, u } = c, a = A(c); marks();
    snippet(30, 236, ROUTER, { fs: 13.5, op: a.o(0, 0.2) });
    if (k === 5) el('rect', { x: 34, y: 291, width: 300, height: 22, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 0.3) });
    if (k === 0) { [['{"tool_calls": [...]}', '"continue"', INFO], ['{"content": "답"}', '"end"', GOOD]].forEach(([m, r, col], i) => { const y = 90 + i * 70;
        pill(620, y, m, INK, pop(u, 0.6 + i * 0.6), { fs: 13.5, mono: true }); grow(730, y, 790, y, E(u, 0.9 + i * 0.6, 1.3 + i * 0.6), col);
        mono(800, y + 5, r, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.2 + i * 0.6) }); });
      sub(700, 250, '마지막 메시지만 보고 문자열을 돌려준다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    netmap({ st: a.s(1, 0.2), sa: a.g(1, 0.4, 0.9), ag: a.s(1, 0.3), tl: a.s(1, 0.8), ar: k >= 2 ? a.g(2, 0.2, 0.6) : 0, rt: k >= 2 ? a.s(2, 0.6) : 0,
      en: k >= 3 ? a.s(3, 1.0) : 0, rtT: k >= 3 ? a.g(3, 0.3, 0.9) : 0, rtE: k >= 3 ? a.g(3, 0.9, 1.5) : 0, hotRt: k === 4 && u > 0.9 && u < 1.6, endFill: k === 4 && u > 1.9 ? GOODBG : null });
    if (k === 1) sub(320, 200, '아직 갈림길이 없다', fade(u, 1.2), { 'font-size': 15 });
    if (k === 2) { mono(700, 100, 'add_conditional_edges(', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3), 'text-anchor': 'middle' });
      mono(700, 126, '"agent", should_continue, …)', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.7), 'text-anchor': 'middle' }); sub(700, 160, '출발 역과 라우팅 함수', fade(u, 1.3), { 'font-size': 14.5 }); }
    if (k === 3) { kvTable(640, 60, 290, [['"continue"', '→ "tool"', { op: fade(u, 0.5) }], ['"end"', '→ END', { op: fade(u, 1.1) }]], { title: '키 → 노드 매핑', kw: 120, rh: 40 });
      sub(785, 198, '돌려준 문자열이 곧 노선 선택', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 4) { pill(760, 100, 'AI: "답" (tool_calls 없음)', INK, pop(u, 0.2), { fs: 13.5 });
      dot([P(M.ag), P(M.rt), P(M.en)], seg(u, 0.5, 1.9), ACC, 8); mono(760, 150, 'should_continue → "end"', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.1) });
      sub(760, 184, '점선이 conditional edge', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 5) { tx(760, 220, 'if / else 면 충분하다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.6) });
      sub(760, 252, '분기 판단에 LLM 호출이 꼭 필요하지는 않다', fade(u, 1.2), { 'font-size': 15 }); } }

  // ---------- 4. Loop ----------
  const WX = [['user', '서울 날씨 알려줘'], ['ai', 'tool_calls: weather(서울)'], ['tool', '맑음 (예시)'], ['ai', '서울은 맑음 (예시)']];
  function s4(t, c) { const { k, u } = c, a = A(c); marks();
    const run = k === 3, at = (u0) => run && u > u0;
    netmap({ st: 1, sa: 1, ag: 1, tl: 1, ar: k >= 1 ? 1 : 0, rt: k >= 1 ? a.s(1, 0.3) : 0, en: k >= 1 ? a.s(1, 0.6) : 0, rtT: k >= 1 ? a.g(1, 0.5, 1.0) : 0, rtE: k >= 1 ? a.g(1, 0.9, 1.4) : 0,
      loop: k >= 2 ? a.g(2, 0.3, 1.4) : 0, loopW: k === 2 ? 4.5 : 3, hotAg: run && ((u > 0.3 && u < 0.7) || (u > 1.6 && u < 1.95)), hotTl: run && u > 0.95 && u < 1.35, endFill: run && u > 2.4 ? GOODBG : null });
    if (k === 0) sub(320, 210, 'Step 3 까지의 역과 진입점. 사이클은 없다', fade(u, 0.8), { 'font-size': 15 });
    if (k === 2) { mono(250, 370, 'add_edge("tool", "agent")', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.0) });
      dot([P(M.ag), P(M.rt), P(M.tl), [235, 290], P(M.ag)], (t * 0.35) % 1, INFO, 7); sub(250, 398, '도구를 쓴 뒤 다시 agent가 판단한다', fade(u, 1.6), { 'font-size': 14.5 }); }
    if (run) { dot(runPath, seg(u, 0.2, 2.5), ACC, 9);
      tx(660, 46, 'messages', { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: MUT });
      WX.forEach(([who, s], i) => { const show = i === 0 ? true : at([0, 0.65, 1.3, 1.95][i]); if (!show) return; const y = 76 + i * 44, col = who === 'user' ? INK : who === 'tool' ? INFO : ACC;
        card(800, y, 280, 34, { rx: 17, stroke: col, sw: 1.8, s: i === 0 ? 1 : pop(u, [0, 0.65, 1.3, 1.95][i], 0.4) });
        mono(676, y + 5, who, { 'font-size': 13.5, 'font-weight': 800, fill: col }); tx(722, y + 5, s, { 'font-size': 14 }); });
      mono(660, 280, 'count', { 'font-size': 14, 'font-weight': 800, fill: MUT }); mono(720, 282, at(1.95) ? '2' : at(0.65) ? '1' : '0', { 'font-size': 20, 'font-weight': 800, fill: ACC });
      tx(800, 330, at(1.95) ? '2회차: "end" → END' : at(0.65) ? '1회차: "continue" → tool' : '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN }); }
    if (k === 4) { const y = 360; ['prompt', 'llm', 'parser'].forEach((s, i) => card(90 + i * 120, y, 96, 36, { rx: 8, text: s, mono: true, fs: 14, s: pop(u, 0.2 + i * 0.15) }));
      [150, 270].forEach((x) => mono(x, y + 8, '|', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) }));
      curve(qb([330, y - 20], [270, y - 60], [210, y - 20]), E(u, 0.8, 1.4), BAD, { dash: '6 5' }); cross(270, y - 40, 9, pop(u, 1.5));
      tx(720, 250, 'LCEL: 한 방향 파이프', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      tx(720, 282, 'LangGraph: 사이클 가능', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      sub(720, 314, 'ReAct · Reflection 패턴이 여기서 나온다', fade(u, 2.1), { 'font-size': 14.5 }); }
    if (k === 5) { const n = Math.min(10, Math.floor(E(u, 0.2, 1.8) * 10 + 0.0001));
      if (u < 1.9) dot([P(M.ag), P(M.rt), P(M.tl), [235, 290], P(M.ag)], (u * 2.2) % 1, BAD, 7);
      tx(660, 60, 'recursion_limit = 10', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      for (let i = 0; i < 10; i++) el('rect', { x: 660 + i * 27, y: 78, width: 22, height: 22, rx: 4, fill: i < n ? BAD : PANEL, stroke: i < n ? 'none' : GRID, 'stroke-width': 1.5, opacity: i < n ? 0.85 : 1 });
      pill(790, 140, 'GraphRecursionError', BAD, pop(u, 1.9), { fs: 14, mono: true, fill: BADBG });
      tx(790, 200, '기본값은 버전마다 다르다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) });
      mono(790, 226, '0.x: 25 · 1.2.24: 10007', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); } }

  // ---------- 5. END ----------
  const SV = { x: 575, y: 290, w: 116, h: 46 };
  const LEGEND = [['Node', '역', 'State를 바꾸는 함수'], ['Edge', '직통', '끝나면 무조건 다음'], ['Conditional', '환승 ◇', 'State를 보고 분기'], ['Loop', '순환', '앞 역으로 되돌아감'], ['END', '종착', '닿으면 실행이 끝남']];
  function s5(t, c) { const { k, u } = c, a = A(c); marks();
    if (k === 0) { gterm({ x: 330, y: 180, w: 110, h: 110 }, 'END', { s: pop(u, 0.2) });
      mono(330, 280, 'END == "__end__"', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      mono(330, 310, 'START == "__start__"', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
      sub(330, 350, 'langgraph가 주는 특수 상수, 실체는 문자열', fade(u, 1.9), { 'font-size': 15 }); return; }
    const full = k >= 3;
    netmap({ st: full ? a.s(3, 0.2) : 0, sa: full ? a.g(3, 0.3, 0.6) : 0, ag: k >= 2 ? a.s(2, 0.2) : 0, ar: k >= 2 ? a.g(2, 0.3, 0.6) : 0, rt: k >= 2 ? a.s(2, 0.5) : 0, tl: k >= 2 ? a.s(2, 0.7) : 0,
      en: 1, rtT: k >= 2 ? a.g(2, 0.8, 1.2) : 0, rtE: k >= 2 ? a.g(2, 1.2, 1.7) : 0, loop: full ? a.g(3, 0.6, 1.4) : 0,
      hotAg: k === 4 && ((u > 0.35 && u < 0.7) || (u > 1.6 && u < 1.95)), hotTl: k === 4 && u > 0.95 && u < 1.35, endFill: k >= 4 && (k > 4 || u > 2.4) ? GOODBG : null, endCol: k === 1 ? ACC : null });
    if (k <= 2) { station(SV, 'save', { s: a.s(1, 0.2), op: k === 2 ? 0.5 : 1 }); edge(SV, M.en, a.g(1, 0.5, 1.1), INK, { sw: 3, op: k === 2 ? 0.5 : 1 }); }
    if (k === 1) mono(760, 300, 'add_edge("save", END)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.0) });
    if (k === 2) { mono(760, 60, '{"continue": "tool",', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(760, 84, ' "end": END}', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) });
      sub(760, 120, '매핑 값 자리에 END를 넣는다', fade(u, 1.9), { 'font-size': 14.5 }); }
    if (k === 3) sub(760, 200, '역 · 직통 · 환승 · 순환 · 종착이 한 노선도에', fade(u, 1.5), { 'font-size': 15 });
    if (k === 4) { dot(runPath, seg(u, 0.2, 2.5), ACC, 9);
      mono(760, 60, 'app = graph.compile()', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.1) });
      mono(760, 86, 'app.invoke({"messages": [...], "count": 0})', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      pill(700, 180, 'final_state', GOOD, pop(u, 2.4), { fs: 15, mono: true, fill: GOODBG }); }
    if (k === 5) LEGEND.forEach(([n, m, d], i) => { const y = 54 + i * 54, op = fade(u, 0.2 + i * 0.35);
      card(800, y, 270, 44, { rx: 10, stroke: i === 4 ? GOOD : GRID, s: pop(u, 0.2 + i * 0.35) });
      mono(680, y - 2, n, { 'font-size': 14.5, 'font-weight': 800, opacity: op }); tx(790, y - 2, m, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: op });
      tx(680, y + 16, d, { 'font-size': 13.5, fill: MUT, opacity: op }); }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'count가 0인 State로 call_agent를 한 번 실행하면 State의 count는 얼마인가?',
      o: ['0', '1', '2'], a: 1,
      why: 'call_agent는 {"count": state["count"] + 1}을 돌려주고, 그 dict가 State에 합쳐진다. 0에서 1이 된다.' },
    { q: 'set_entry_point("agent")와 같은 뜻의 코드는 무엇인가?',
      o: ['add_edge("agent", END)', 'add_node("START", agent)', 'add_edge(START, "agent")'], a: 2,
      why: '진입점 지정은 START에서 agent로 가는 엣지 하나를 만드는 일이다. 두 표기는 같은 엣지를 남긴다.' },
    { q: 'should_continue가 "end"를 돌려주면 다음은 어디인가?',
      o: ['매핑에서 "end"에 묶인 END', 'tool 노드', 'agent 노드'], a: 0,
      why: '조건부 엣지는 반환 문자열을 매핑에서 찾아 그 노드로 보낸다. "end"는 END에 묶여 있다.' },
    { q: '도구를 쓴 뒤 agent가 다시 판단하게 만드는 코드 한 줄은 무엇인가?',
      o: ['add_edge("agent", "tool")', 'add_edge("tool", "agent")', 'set_entry_point("tool")'], a: 1,
      why: 'tool에서 agent로 돌아가는 엣지가 사이클을 만든다. 날씨 예시에서는 이 길로 2회차 판단을 한 뒤 END로 갔다.' },
    { q: 'END의 실체는 무엇인가?',
      o: ['문자열 "__end__"', 'add_node로 등록한 빈 함수', '그래프가 자동으로 만든 tool 노드'], a: 0,
      why: 'END는 langgraph가 주는 특수 상수로 값은 "__end__"이다. 어느 경로든 여기에 닿으면 실행이 끝나고 최종 State가 나온다.' },
  ];

  const summary = [
    '노드는 State를 받아 바뀐 칸만 dict로 돌려주는 함수이고 add_node로 이름을 붙인다.',
    'add_edge는 끝나면 무조건 다음 노드로 가고, set_entry_point는 START에서 오는 엣지다.',
    '조건부 엣지는 라우팅 함수가 돌려준 문자열을 매핑에서 찾아 다음 노드를 고른다.',
    'tool에서 agent로 돌아가는 엣지가 루프를 만들고, recursion_limit가 끝없는 순환을 막는다.',
  ];
  const review = [
    { q: 'agent에 add_edge("agent", "save")와 조건부 엣지를 함께 걸었더니 save와 END 쪽이 둘 다 실행됐다. 원인은?',
      o: ['LangGraph 버그라 업데이트해야 한다', '같은 출발점의 두 엣지가 모두 따라가져서', 'save 노드를 등록하지 않아서'], a: 1,
      why: '같은 노드에 일반 엣지와 조건부 엣지를 함께 걸면 오류 없이 두 길이 모두 실행된다. 한 길만 원하면 조건부 엣지 하나로 묶는다.' },
    { q: 'Agent가 GraphRecursionError로 끝났다. 먼저 의심할 것은?',
      o: ['라우팅 함수가 "end"를 돌려주는 경우가 없다', 'END를 import하지 않았다', 'TypedDict 대신 dict를 썼다'], a: 0,
      why: 'tool과 agent 사이 순환에서 빠져나갈 문자열이 나오지 않으면 recursion_limit에 닿을 때까지 돈다.' },
    { q: 'app.invoke({"messages": []})를 했더니 call_agent에서 KeyError: \'count\'가 났다. 고칠 곳은?',
      o: ['add_edge("tool", "agent")를 지운다', 'recursion_limit를 늘린다', 'invoke에 "count": 0을 같이 넣는다'], a: 2,
      why: 'call_agent는 state["count"]를 읽는다. 처음 넣는 State에 count가 없으면 첫 노드에서 바로 KeyError가 난다.' },
  ];

  R.page({ title: '노선도로 보는 LangGraph', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
