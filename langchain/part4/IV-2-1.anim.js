/* IV-2-1 ReAct Agent (LangGraph) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그래프 구조(노드 agent·tools, 엣지 4개), 메시지 6개, stream updates chunk 5개, values chunk 6개는
 * langgraph 1.2 + 정해진 답을 내는 가짜 모델로 실제 실행해 확인했다. LLM 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 그래프 부품 ----------
  const ST = { idle: [OFF, PANEL, MUT, 2], ready: [ACC, PANEL, ACC, 2.2], active: [ACC, ACCBG, ACC, 3.2], pending: [WARN, WARNBG, WARN, 2.4], ghost: [OFF, PANEL, OFF, 1.6] };
  function gnode(cx, cy, w, name, st, o) { o = o || {}; const [stroke, fill, color, sw] = ST[st || 'ready'];
    card(cx, cy, w, 50, { rx: 12, stroke, fill, sw, text: name, fs: 16, fw: 800, mono: true, color, s: o.s, op: o.op, dash: st === 'ghost' ? '6 5' : null });
    if (o.sub) sub(cx, cy + 44, o.sub, o.op ?? (o.s == null ? 1 : clamp(o.s)), { fill: o.subCol || MUT, class: 'mono' }); }
  function capsule(cx, cy, s, name, o) { o = o || {}; card(cx, cy, 70, 30, { rx: 15, fill: o.ghost ? PANEL : INK, stroke: o.ghost ? OFF : 'none', dash: o.ghost ? '5 4' : null, text: name, fs: 13.5, fw: 700, color: o.ghost ? OFF : PANEL, s, mono: true }); }
  function diamond(cx, cy, r, s, o) { o = o || {}; if (s <= 0) return; const g = G(cx, cy, s);
    el('path', { d: `M0,${-r} L${r * 1.3},0 L0,${r} L${-r * 1.3},0 Z`, fill: o.hot ? WARNBG : PANEL, stroke: o.col || WARN, 'stroke-width': 2.4 }, g);
    tx(0, 7, '?', { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: o.col || WARN }, g); }
  const mk = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function arc(x1, y1, cx, cy, x2, y2, u, col, o) { if (u <= 0) return; o = o || {};
    el('path', { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 100, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : null, opacity: o.op ?? 1, 'marker-end': u >= 0.98 ? mk(col) : null }); }
  const qpts = (x1, y1, cx, cy, x2, y2) => Array.from({ length: 13 }, (_, i) => { const t = i / 12; return [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2]; });

  // 두 가지 배치: 크게(장면 1) · 왼쪽에 작게(장면 3~5)
  const BIG = { st: [70, 240], ag: [218, 240], br: [362, 240], tl: [525, 150], en: [525, 330], nw: 132, tw: 132, r: 28 };
  const CMP = { st: [50, 220], ag: [166, 220], br: [270, 220], tl: [376, 140], en: [376, 306], nw: 110, tw: 104, r: 24 };
  function E_(L) { const [sx, sy] = L.st, [ax, ay] = L.ag, [bx, by] = L.br, [tx_, ty] = L.tl, [ex, ey] = L.en;
    return { SA: [sx + 35, sy, ax - L.nw / 2 - 3, ay], AB: [ax + L.nw / 2, ay, bx - L.r * 1.3 - 3, by], BT: [bx, by - L.r, tx_ - L.tw / 2 - 4, ty + 8], BE: [bx, by + L.r, ex - 39, ey],
      TA: [tx_, ty - 26, (ax + tx_) / 2, Math.min(ay, ty) - 96, ax, ay - 28] }; }
  // o: 각 부품의 크기(0~1, 없으면 안 그림), e*: 엣지가 자란 정도, st: 노드 상태, flow: [경로이름, u] 흐르는 점
  function graph(L, o) { o = o || {}; const e = E_(L), st = o.st || {};
    if (o.eSA) grow(...e.SA, o.eSA, o.hot === 'SA' ? ACC : MUT);
    if (o.eAB) grow(...e.AB, o.eAB, o.hot === 'AB' ? ACC : MUT, { dash: '6 4' });
    if (o.eBT) grow(...e.BT, o.eBT, o.hot === 'BT' ? ACC : MUT, { dash: '6 4' });
    if (o.eBE) grow(...e.BE, o.eBE, o.hot === 'BE' ? ACC : MUT, { dash: '6 4' });
    if (o.eTA) arc(...e.TA, o.eTA, o.hot === 'TA' ? ACC : MUT);
    if (o.lab) { const op = o.lab; const [x1, y1, x2, y2] = e.BT, [a1, b1, a2, b2] = e.BE;
      tx((x1 + x2) / 2 - 8, (y1 + y2) / 2 - 8, '있음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, opacity: op });
      tx((a1 + a2) / 2 - 8, (b1 + b2) / 2 + 20, '없음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, opacity: op }); }
    if (o.sSt != null) capsule(...L.st, o.sSt, 'START');
    if (o.sAg != null) gnode(...L.ag, L.nw, 'agent', st.ag, { s: o.sAg, sub: o.subAg });
    if (o.sBr != null) diamond(...L.br, L.r, o.sBr, { hot: o.brHot });
    if (o.sTl != null) gnode(...L.tl, L.tw, 'tools', st.tl, { s: o.sTl, sub: o.subTl });
    if (o.sEn != null) capsule(...L.en, o.sEn, 'END', { ghost: o.enGhost });
    if (o.flow) { const [name, u] = o.flow; const r = name === 'TA' ? qpts(...e.TA) : name === 'AT' ? [[e.AB[0], e.AB[1]], [L.br[0], L.br[1]], [e.BT[2], e.BT[3]]]
        : name === 'AE' ? [[e.AB[0], e.AB[1]], [L.br[0], L.br[1]], [e.BE[2], e.BE[3]]] : [[e.SA[0], e.SA[1]], [e.SA[2], e.SA[3]]];
      dot(r, u, ACC, 8); } }
  const full = (L, st, extra) => graph(L, Object.assign({ sSt: 1, sAg: 1, sBr: 1, sTl: 1, sEn: 1, eSA: 1, eAB: 1, eBT: 1, eBE: 1, eTA: 1, st }, extra || {}));

  // ---------- 메시지 카드 ----------
  const KIND = { human: ['HumanMessage', INFO, INFOBG], call: ['AIMessage', ACC, ACCBG], tool: ['ToolMessage', WARN, WARNBG], final: ['AIMessage', GOOD, GOODBG] };
  // m = { kind, text, meta }. s가 0→1이면 오른쪽에서 밀려 들어온다
  function mrow(x, y, w, i, m, s, o) { o = o || {}; if (s <= 0) return; const [tag, col, bg] = KIND[m.kind], g = G(x + (1 - s) * 40, y, 1, clamp(s * 1.5));
    el('rect', { x: 0, y: 0, width: w, height: 50, rx: 8, fill: bg, stroke: col, 'stroke-width': o.hot ? 2.8 : 1.4 }, g);
    el('rect', { x: 0, y: 0, width: 6, height: 50, rx: 3, fill: col }, g);
    tx(16, 19, (i != null ? `[${i}] ` : '') + tag, { 'font-size': 13.5, 'font-weight': 800, fill: col, class: 'mono' }, g);
    if (m.meta) mono(w - 12, 19, m.meta, { 'font-size': 13.5, fill: o.metaCol || MUT, 'text-anchor': 'end', 'font-weight': o.metaCol ? 700 : 400 }, g);
    mono(16, 40, m.text, { 'font-size': 14.5, fill: INK }, g); }
  const Q = '서울과 도쿄의 날씨를 비교해줘';
  const MSG = [
    { kind: 'human', text: Q },
    { kind: 'call', text: 'tool_calls: get_weather(city="서울")', meta: 'id=call_a1' },
    { kind: 'tool', text: '"25도, 맑음"', meta: 'tool_call_id=call_a1' },
    { kind: 'call', text: 'tool_calls: get_weather(city="도쿄")', meta: 'id=call_b2' },
    { kind: 'tool', text: '"22도, 흐림"', meta: 'tool_call_id=call_b2' },
    { kind: 'final', text: '서울 25도 맑음, 도쿄 22도 흐림. 서울이 3도 더 따뜻', meta: 'tool_calls=[] · 예시' },
  ];

  // ---------- 오른쪽 카드: 도구 · 모델 ----------
  function toolCard(cx, cy, s, o) { o = o || {}; if (s <= 0) return; const g = G(cx, cy, s);
    el('rect', { x: -140, y: -78, width: 280, height: 156, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2.2 }, g);
    tx(-124, -52, '@tool', { 'font-size': 14, 'font-weight': 700, fill: WARN, class: 'mono' }, g);
    tx(-70, -52, 'get_weather(city: str)', { 'font-size': 14.5, 'font-weight': 800, class: 'mono' }, g);
    tx(-124, -26, '"도시의 현재 날씨를 가져온다."', { 'font-size': 14, fill: o.doc ? ACC : MUT, 'font-weight': o.doc ? 700 : 400 }, g);
    const f = o.fill ?? 1;
    [['서울', '25도, 맑음'], ['도쿄', '22도, 흐림']].forEach(([a, b], i) => { const y = 6 + i * 34, k = clamp(f * 2 - i);
      el('rect', { x: -124, y, width: 70, height: 28, rx: 5, fill: SOFT, stroke: GRID, opacity: k }, g); tx(-89, y + 19, a, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: k }, g);
      el('rect', { x: -48, y, width: 172, height: 28, rx: 5, fill: SOFT, stroke: GRID, opacity: k }, g); mono(-36, y + 19, b, { 'font-size': 14, opacity: k }, g); }); }
  function llmCard(cx, cy, s, bound, o) { o = o || {}; if (s <= 0) return; const g = G(cx, cy, s);
    el('rect', { x: -110, y: -36, width: 220, height: 72, rx: 12, fill: bound ? ACCBG : PANEL, stroke: o.col || (bound ? ACC : INK), 'stroke-width': 2.4 }, g);
    tx(0, -6, o.name || 'ChatOpenAI', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }, g);
    mono(0, 18, bound ? 'gpt-4o-mini + tools' : 'gpt-4o-mini', { 'text-anchor': 'middle', 'font-size': 14, fill: bound ? ACC : MUT, 'font-weight': 700 }, g); }

  // 1. 수동 ReAct — 부품을 하나씩 조립
  function s1(t, c) { const { k, u } = c, L = BIG;
    // 부품 선반
    const parts = ['StateGraph', 'MessagesState', 'ToolNode', 'ChatOpenAI', '@tool'];
    parts.forEach((p, i) => pill(78 + i * 120 + (i > 1 ? 10 : 0) + (i > 3 ? 4 : 0), 46, p, i === 4 ? WARN : i === 3 ? INK : ACC, k === 0 ? pop(u, 0.2 + i * 0.25) : 1, { mono: true, fs: 13.5 }));
    zone(24, 86, 600, 318, 'StateGraph(MessagesState)', { fill: 'none', stroke: GRID, dash: '6 5', sw: 1.6 });
    if (k === 0) { tx(324, 250, '아직 노드도 엣지도 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); }
    // 오른쪽: 도구 · 모델
    if (k >= 1) toolCard(792, 150, k === 1 ? pop(u, 0.2) : 1, { fill: k === 1 ? E(u, 0.8, 1.8) : 1, doc: k === 1 && u > 1.9 });
    if (k === 1) { grow(700, 120, 650, 120, E(u, 2.0, 2.5), ACC, { plain: true }); tx(792, 248, 'docstring = LLM이 읽는 도구 설명', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k >= 2) { llmCard(792, 330, k === 2 ? pop(u, 0.2) : 1, k > 2 || u > 1.9);
      if (k === 2) fly(792, 232, 792, 300, seg(u, 0.7, 1.9), '{name, args:{city: str}}', { mono: true }); }
    if (k === 2) sub(792, 390, '이제 tool_calls를 낼 수 있다', fade(u, 2.0), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    if (k < 3) return;
    // 그래프 조립
    const sAg = k === 3 ? pop(u, 0.2) : 1, sBr = k === 4 ? pop(u, 0.2) : k > 4 ? 1 : null;
    const sTl = k >= 5 ? (k === 5 ? pop(u, 0.2) : 1) : null, sSt = k >= 5 ? (k === 5 ? pop(u, 0.9) : 1) : null;
    const idle = k === 6 && u > 1.6, st = { ag: idle ? 'idle' : 'ready', tl: idle ? 'idle' : 'ready' };
    if (k === 3) grow(682, 330, L.ag[0] + 70, L.ag[1] + 12, E(u, 0.9, 1.6), ACC, { dash: '4 4' });
    graph(L, { sAg, sBr, sTl, sSt, sEn: k >= 4 ? 1 : null, enGhost: k === 4,
      eAB: k === 4 ? E(u, 0.6, 1.1) : k > 4 ? 1 : 0, eBT: k === 4 ? E(u, 1.1, 1.7) : k > 4 ? 1 : 0, eBE: k === 4 ? E(u, 1.1, 1.7) : k > 4 ? 1 : 0, lab: k === 4 ? fade(u, 1.8) : k > 4 ? 1 : 0,
      eSA: k === 5 ? E(u, 1.3, 1.9) : k > 5 ? 1 : 0, eTA: k === 6 ? E(u, 0.2, 1.2) : 0, st,
      subAg: 'agent_node(state)', subTl: k >= 5 ? 'ToolNode(tools)' : null });
    if (k === 4) { gnode(...L.tl, L.tw, 'tools', 'ghost', {}); mono(L.br[0] - 12, L.br[1] + 66, 'should_continue', { 'text-anchor': 'end', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(L.br[0] - 12, L.br[1] + 88, 'last.tool_calls를 직접 검사', { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 5) mono(324, 392, 'add_node ×2 · set_entry_point · add_conditional_edges', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
    if (k === 6) { [['노드', '2'], ['분기 함수', '1'], ['엣지', '3']].forEach(([a, b], i) => { const s = pop(u, 1.4 + i * 0.25);
        card(150 + i * 170, 386, 150, 32, { rx: 16, fill: PANEL, stroke: INK, sw: 1.6, s, text: `${a} ${b}`, fs: 14.5, fw: 700 }); });
      if (u > 1.6) banner(790, 398, 'compile() · 실행 전 모두 대기', pop(u, 1.7)); } }

  // 2. create_react_agent — 한 줄로 같은 그래프
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const A = ['from langgraph.graph import StateGraph, END, MessagesState', 'from langgraph.prebuilt import ToolNode', 'from langchain_openai import ChatOpenAI', 'from langchain_core.tools import tool'];
      const B2 = ['from langgraph.prebuilt import create_react_agent', 'from langchain_openai import ChatOpenAI', 'from langchain_core.tools import tool'];
      lbl(60, 46, 'Step 1 (manual-react.py)', 1, { 'text-anchor': 'start', fill: MUT });
      A.forEach((s, i) => { const y = 82 + i * 32; mono(60, y, s, { 'font-size': 14, fill: i < 2 ? MUT : INK });
        if (i < 2) el('line', { x1: 56, y1: y - 5, x2: 56 + tw(s, 14) * E(u, 0.6 + i * 0.4, 1.2 + i * 0.4) + 4, y2: y - 5, stroke: BAD, 'stroke-width': 2.4 }); });
      lbl(60, 240, 'Step 2 (create-agent.py)', fade(u, 1.4), { 'text-anchor': 'start', fill: ACC });
      B2.forEach((s, i) => { const y = 276 + i * 32, s_ = fade(u, 1.5 + i * 0.25); if (i === 0) el('rect', { x: 52, y: y - 20, width: tw(s, 14) + 16, height: 28, rx: 6, fill: ACCBG, opacity: s_ });
        mono(60, y, s, { 'font-size': 14, fill: i === 0 ? ACC : INK, 'font-weight': i === 0 ? 700 : 400, opacity: s_ }); });
      return; }
    if (k === 1) { toolCard(250, 170, pop(u, 0.2), {}); llmCard(640, 170, pop(u, 0.6), false);
      const s = pop(u, 1.3); pill(640, 260, 'model.bind_tools(tools)', BAD, s, { mono: true, fs: 14 }); if (s > 0.5) el('line', { x1: 540, y1: 260, x2: 740, y2: 260, stroke: BAD, 'stroke-width': 2.6, opacity: clamp(s) });
      tx(480, 340, '도구와 모델만 준비한다. 묶는 일은 create_react_agent가 한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    // k ≥ 2: 한 줄 상자
    const open = k >= 3 ? (k === 3 ? E(u, 0.2, 1.2) : 1) : 0;
    mono(480, 44, 'agent = create_react_agent(model, tools)', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 0.1) : 1 });
    const bx = 120, by = 74, bw = 560, bh = 300;
    el('rect', { x: bx, y: by, width: bw, height: bh, rx: 14, fill: INK, opacity: (1 - open) * (k === 2 ? fade(u, 0.2) : 1) });
    el('rect', { x: bx, y: by, width: bw, height: bh, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.4 });
    if (k === 2) { fly(-20 + 60, 140, bx + 80, by + 150, seg(u, 0.5, 1.3), 'model', { mono: true }); fly(40, 300, bx + 80, by + 150, seg(u, 0.7, 1.5), 'tools', { mono: true, fill: WARN });
      tx(bx + bw / 2, by + bh / 2 + 6, '컴파일된 그래프', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: PANEL, opacity: fade(u, 1.4) });
      // 줄 수 비교
      tx(720, 120, '줄 수', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.6) });
      [['manual-react.py', 41], ['한 줄', 1]].forEach(([n, v], i) => { const y = 140 + i * 56, g = E(u, 1.7 + i * 0.2, 2.5);
        tx(720, y + 2, n, { 'font-size': 14, 'font-weight': 700, class: i ? null : 'mono', opacity: fade(u, 1.7) });
        el('rect', { x: 720, y: y + 12, width: Math.max(3, 170 * v / 41 * g), height: 18, rx: 4, fill: i ? ACC : OFF });
        mono(720 + Math.max(3, 170 * v / 41 * g) + 8, y + 26, String(v), { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.2) }); });
      return; }
    // k ≥ 3: 열어 보면 Step 1과 같은 그래프
    const L = { st: [bx + 60, by + 170], ag: [bx + 190, by + 170], br: [bx + 312, by + 170], tl: [bx + 450, by + 92], en: [bx + 450, by + 250], nw: 120, tw: 112, r: 26 };
    const g = k === 3 ? E(u, 0.6, 1.8) : 1;
    graph(L, { sSt: g, sAg: g, sBr: g, sTl: g, sEn: g, eSA: g, eAB: g, eBT: g, eBE: g, eTA: k === 3 ? E(u, 1.2, 2.0) : 1, lab: g, st: { ag: 'ready', tl: 'ready' }, subAg: 'bind_tools 포함', subTl: 'ToolNode' });
    if (k === 3) { tx(720, 110, 'get_graph()로 본 엣지', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) });
      ['__start__ → agent', 'agent → tools  (조건)', 'agent → __end__ (조건)', 'tools → agent'].forEach((s, i) => mono(720, 142 + i * 30, s, { 'font-size': 14, opacity: fade(u, 1.6 + i * 0.2) }));
      tx(720, 290, 'Step 1과 노드 이름까지 같다', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.4) }); return; }
    // k = 4: 옵션 두 개를 꽂는다
    tx(830, 110, '옵션은 인자로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
    pill(390, 402, 'prompt="당신은 친절한 날씨 비서입니다."', INFO, pop(u, 0.3), { mono: true, fs: 13.5, fill: PANEL });
    tx(560, 407, '모델을 부를 때 맨 앞 시스템 메시지로', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
    const sDb = pop(u, 1.0); dbIcon(830, 214, '', { s: sDb * 0.8, stroke: GOOD });
    mono(830, 278, 'checkpointer=', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: clamp(sDb) });
    mono(830, 298, 'MemorySaver()', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: clamp(sDb) });
    grow(782, 214, bx + bw + 6, 214, E(u, 1.4, 1.9), GOOD);
    tx(830, 330, 'thread_id 별 대화 기억', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }

  // 3. invoke — 질문 한 번에 도구까지
  function slots(x, y, w, n, filled, o) { o = o || {}; const i0 = o.from || 0;
    for (let i = 0; i < n; i++) { const yy = y + i * 46; if (i < filled) continue;
      el('rect', { x, y: yy, width: w, height: 38, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '6 5', opacity: o.op ?? 1 });
      mono(x + 14, yy + 25, `[${i + i0}]`, { 'font-size': 13.5, fill: OFF, opacity: o.op ?? 1 }); } }
  function s3(t, c) { const { k, u } = c, L = CMP;
    const st = k === 0 ? { ag: 'ready', tl: 'ready' } : k === 1 ? { ag: 'active', tl: 'ready' } : { ag: 'active', tl: 'pending' };
    full(L, st, { flow: k === 1 ? ['SA', seg(u, 0.9, 1.7)] : null, hot: k === 1 ? 'SA' : null });
    llmCard(166, 370, 1, true, { col: k >= 1 ? ACC : INK });
    grow(166, 334, 166, 248, k === 0 ? 0 : 1, k >= 1 ? ACC : MUT, { plain: true, dash: '3 4' });
    const X = 470, W = 460;
    mono(X, 44, 'result = agent.invoke({"messages": [ … ]})', { 'font-size': 14.5, 'font-weight': 700 });
    if (k === 0) { slots(X, 70, W, 1, 0); tx(X + W / 2, 140, '아직 호출 전 · messages가 비어 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) }); return; }
    const s0 = k === 1 ? E(u, 0.2, 0.9) : 1; mrow(X, 64, W, 0, MSG[0], s0);
    if (k === 1) { tx(X + W / 2, 160, '질문이 START → agent로 들어간다', { 'text-anchor': 'middle', 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { slots(X, 122, W, 5, 0, { op: fade(u, 0.2), from: 1 }); [1, 2, 3, 4, 5].forEach((i, j) => mono(X + 60, 122 + j * 46 + 25, i % 2 ? 'agent가 쓸 자리' : 'tools가 쓸 자리', { 'font-size': 13.5, fill: i % 2 ? ACC : WARN, opacity: fade(u, 0.6 + j * 0.25) }));
      sub(L.tl[0], L.tl[1] - 40, '차례 대기', fade(u, 1.6), { fill: WARN, 'font-weight': 700 }); return; }
    if (k === 3) { // 질문 속 도시 이름이 인자 칸으로
      const sig = 'get_weather(city: str) -> str'; card(X + W / 2, 160, tw(sig, 15) + 40, 40, { rx: 8, stroke: WARN, sw: 2, text: sig, mono: true, fs: 15, fw: 700, s: pop(u, 0.2) });
      tx(X + W / 2, 206, 'LLM이 이 시그니처를 보고 인자를 채운다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      ['서울', '도쿄'].forEach((city, i) => { const y = 256 + i * 58, s = fade(u, 1.0 + i * 0.5);
        el('rect', { x: X, y: y - 22, width: W, height: 40, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: s });
        mono(X + 16, y + 4, 'get_weather(city=', { 'font-size': 15, opacity: s }); mono(X + 16 + tw('get_weather(city=', 15), y + 4, `"${city}")`, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6 + i * 0.5) });
        fly(X + 60 + i * 80, 132, X + 230, y, seg(u, 0.9 + i * 0.5, 1.7 + i * 0.5), city, {}); });
      tx(X + W / 2, 386, '질문에는 도구 이름이 없다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) }); return; }
    // k = 4: 마지막 메시지가 답
    [1, 2, 3, 4].forEach((i, j) => mrow(X, 64 + (j + 1) * 54, W, i, MSG[i], 1, {}));
    mrow(X, 64 + 5 * 54, W, 5, MSG[5], E(u, 0.3, 1.0), { hot: true });
    mono(X - 12, 64 + 5 * 54 + 30, '[-1]', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.2) });
    sub(L.tl[0] + 10, 404, '.content가 최종 답변 (문장은 예시)', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 }); }

  // 4. 메시지 왕복 — tool_call_id로 짝짓기
  function s4(t, c) { const { k, u } = c, L = CMP, X = 452, W = 488, Y = 36, H = 60;
    const route = [['SA', 'SA'], ['AT', 'AB'], ['TA', 'TA'], ['AT', 'AB'], ['TA', 'TA'], ['AE', 'BE']][k];
    full(L, { ag: k === 5 ? 'ready' : 'active', tl: k === 1 || k === 3 ? 'active' : 'ready' }, { flow: [route[0], seg(u, 0.3, 1.4)], hot: route[1] });
    const n = tween(c.prev ? k : null, k + 1, u);
    for (let i = 0; i <= k; i++) mrow(X, Y + i * H, W, i, MSG[i], i === k ? E(u, 0.9, 1.6) : 1, { hot: i === k, metaCol: (i === 1 || i === 2) && k >= 2 ? ACC : (i === 3 || i === 4) && k >= 4 ? ACC : null });
    // 짝짓기 선
    const link = (a, b, uu) => arc(X + W + 2, Y + a * H + 14, X + W + 18, Y + (a + b) / 2 * H + 25, X + W + 2, Y + b * H + 14, uu, ACC, { sw: 2 });
    if (k >= 2) link(1, 2, k === 2 ? E(u, 1.6, 2.3) : 1);
    if (k >= 4) link(3, 4, k === 4 ? E(u, 1.6, 2.3) : 1);
    const cyc = k <= 1 ? 0 : k <= 3 ? 1 : 2;
    mono(40, 400, `messages ${Math.round(n)}개 · 도구 왕복 ${cyc}회`, { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 5) { tx(L.en[0] + 44, L.en[1] + 6, '종료', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) }); } }

  // 5. stream — 노드마다 chunk가 나온다
  const RUNS = [['agent', 'AIMessage · 서울 호출', ACC], ['tools', '"25도, 맑음"', WARN], ['agent', 'AIMessage · 도쿄 호출', ACC], ['tools', '"22도, 흐림"', WARN], ['agent', '최종 답변', GOOD]];
  function s5(t, c) { const { k, u } = c;
    if (k === 5) { const lines = ['--- 노드: agent ---', '  AIMessage tool_calls=[get_weather(city="서울")]', '--- 노드: tools ---', '  ToolMessage content="25도, 맑음"', '--- 노드: agent ---', '  AIMessage tool_calls=[get_weather(city="도쿄")]', '--- 노드: tools ---', '  ToolMessage content="22도, 흐림"', '--- 노드: agent ---', '  AIMessage content="서울이 3도 더 따뜻하고 맑습니다."'];
      card(250, 60, 420, 40, { rx: 8, stroke: ACC, sw: 2, text: 'create_react_agent(model, tools)', mono: true, fs: 15, fw: 700, color: ACC, s: pop(u, 0.1) });
      card(710, 60, 380, 40, { rx: 8, stroke: INFO, sw: 2, text: 'agent.stream(inputs, "updates")', mono: true, fs: 15, fw: 700, color: INFO, s: pop(u, 0.4) });
      tx(480, 66, '+', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.4) });
      terminal(60, 100, 840, 300, lines.map((s) => (s.startsWith('---') ? [s, 'var(--hl)'] : s)), lerp(0, 10, E(u, 0.6, 2.5)), { title: 'python stream-debug.py  (출력 예시)', lh: 25, fs: 14 }); return; }
    const X0 = 200, DX = 148, laneI = 96, laneS = 210;
    if (k === 4) return modes(u, X0);
    // 시간축과 두 줄
    tx(40, laneI + 6, 'invoke', { 'font-size': 15, 'font-weight': 800, class: 'mono' }); tx(40, laneS + 6, 'stream', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: INFO });
    el('line', { x1: X0 - 40, y1: laneI, x2: 920, y2: laneI, stroke: GRID, 'stroke-width': 2 }); el('line', { x1: X0 - 40, y1: laneS, x2: 920, y2: laneS, stroke: GRID, 'stroke-width': 2 });
    RUNS.forEach(([n], i) => { const x = X0 + i * DX; mono(x, 50, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: n === 'agent' ? ACC : WARN, opacity: k >= 1 ? 1 : 0.45 });
      el('line', { x1: x, y1: 60, x2: x, y2: laneS + 8, stroke: GRID, 'stroke-dasharray': '3 4' }); });
    if (k === 0) { pill(480, 300, 'inputs = {"messages": [HumanMessage(질문)]}', INFO, pop(u, 0.3), { mono: true, fs: 14 }); tx(480, 360, '아직 호출 전', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); return; }
    if (k === 1) { mono(480, 290, 'for chunk in agent.stream(inputs, stream_mode="updates"):', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      card(480, 350, 460, 44, { rx: 8, stroke: INFO, sw: 2, fill: INFOBG, text: 'chunk = {노드 이름: {"messages": [새 메시지]}}', fs: 15, fw: 700, mono: true, s: pop(u, 0.9) });
      tx(480, 402, '노드 하나가 끝날 때마다 하나씩', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k <= 3) { const done = k === 2 ? 2 * E(u, 0.2, 2.2) : 2 + 3 * E(u, 0.2, 2.2), head = X0 - 40 + done * DX;
      el('line', { x1: head, y1: 62, x2: head, y2: laneS + 12, stroke: INFO, 'stroke-width': 2.4 });
      RUNS.forEach(([n, s, col], i) => { const v = clamp((done - i) * 2); if (v <= 0) return; const x = X0 + i * DX;
        card(x, laneS + 50 + (i % 2) * 54, 140, 44, { rx: 8, stroke: col, sw: 2, fill: PANEL, s: pop(v, 0) });
        mono(x - 60, laneS + 44 + (i % 2) * 54, `#${i + 1} ${n}`, { 'font-size': 13.5, 'font-weight': 800, fill: col, opacity: clamp(v) });
        tx(x - 60, laneS + 64 + (i % 2) * 54, s, { 'font-size': 13.5, opacity: clamp(v), class: i % 2 ? 'mono' : null });
        grow(x, laneS + 4, x, laneS + 26 + (i % 2) * 54, clamp(v), col, { plain: true }); });
      const fin = k === 3 && done >= 4.95;
      if (!fin) { for (let i = 0; i < 3; i++) el('circle', { cx: X0 + 520 + i * 18, cy: laneI - 19, r: 4, fill: OFF, opacity: 0.4 + 0.6 * ((Math.floor(t * 3) + i) % 3 === 0) }); mono(X0 + 500, laneI - 14, '끝날 때까지 기다림', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
      else { card(X0 + 4 * DX - 40, laneI + 32, 200, 36, { rx: 8, stroke: INK, sw: 2, fill: SOFT, text: 'result · messages 6개', fs: 14, fw: 700, s: pop(u, 2.3) }); }
      return; }
  }
  function modes(u, X0) {
    tx(480, 50, 'stream_mode를 바꾸면 chunk 모양이 바뀐다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.1) });
    const rows = [['values', '그때그때 state 전체', INK, 'chunk 6개'], ['updates', '노드가 바꾼 부분만', INFO, 'chunk 5개'], ['messages', 'LLM 토큰 조각', ACC, '토큰마다']];
    rows.forEach(([m, d, col, cnt], r) => { const y = 120 + r * 96, s = fade(u, 0.2 + r * 0.6);
      mono(40, y + 6, m, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); tx(40, y + 26, d, { 'font-size': 13.5, fill: MUT, opacity: s });
      if (r === 0) for (let i = 0; i < 6; i++) { const h = 8 + i * 8, x = X0 + 30 + i * 108, v = clamp(E(u, 0.3, 1.3) * 6 - i); el('rect', { x, y: y + 14 - h, width: 34, height: h, rx: 3, fill: OFF, opacity: v }); mono(x + 17, y + 32, `msg ${i + 1}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: v }); }
      if (r === 1) for (let i = 0; i < 5; i++) { const x = X0 + 30 + (i + 1) * 108, v = clamp(E(u, 0.9, 1.9) * 5 - i); el('rect', { x, y: y - 2, width: 34, height: 16, rx: 3, fill: RUNS[i][2], opacity: v }); }
      if (r === 2) for (let i = 0; i < 40; i++) { const x = X0 + 30 + i * 15.5, v = clamp(E(u, 1.5, 2.5) * 40 - i); el('rect', { x, y: y + 2, width: 8, height: 10, rx: 2, fill: ACC, opacity: v * 0.85 }); }
      mono(920, y + 6, cnt, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.8 + r * 0.6) }); });
    tx(480, 404, 'updates는 디버깅, messages는 UI 라이브 출력에', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); }

  const quiz = [
    { q: '수동 ReAct 그래프에서 should_continue 함수가 하는 일은 무엇인가?',
      o: ['도구를 실제로 실행하고 결과를 돌려준다', 'tool_calls 유무로 tools와 END 중 갈 곳을 고른다', '모델에 도구 시그니처를 묶는다'], a: 1,
      why: '분기 함수는 마지막 메시지의 tool_calls만 본다. 있으면 "tools", 없으면 END를 돌려 add_conditional_edges가 길을 고른다.' },
    { q: 'create_react_agent(model, tools)가 돌려주는 것은 무엇인가?',
      o: ['도구 목록을 묶은 모델 객체', '아직 compile하지 않은 StateGraph', 'agent·tools 노드와 분기·루프가 들어 있는 컴파일된 그래프'], a: 2,
      why: 'get_graph()로 열어 보면 Step 1과 같은 agent·tools 노드와 엣지 4개가 이미 연결돼 있다. bind_tools도 안에서 한다.' },
    { q: '사용자가 도구 이름을 말하지 않았는데 city="서울"이 채워지는 이유는 무엇인가?',
      o: ['LLM이 도구 시그니처와 docstring을 보고 인자를 정하기 때문', 'ToolNode가 질문에서 도시 이름을 정규식으로 뽑기 때문', 'HumanMessage에 tool_calls가 자동으로 붙기 때문'], a: 0,
      why: 'bind_tools로 넘어간 get_weather(city: str)의 설명을 LLM이 읽고 tool_calls에 인자를 적는다. ToolNode는 적힌 대로 실행만 한다.' },
    { q: 'ToolMessage가 어느 도구 호출의 결과인지 알려 주는 필드는 무엇인가?',
      o: ['content', 'tool_call_id', 'name'], a: 1,
      why: 'AIMessage의 tool_calls에 붙은 id(call_a1)를 ToolMessage가 tool_call_id로 되받아 요청과 응답이 짝지어진다.' },
    { q: 'stream_mode="updates"로 이 질문을 흘리면 chunk는 몇 개 나오나?',
      o: ['1개, 마지막에 한 번', '5개, 노드가 실행될 때마다', '6개, 메시지마다'], a: 1,
      why: 'agent, tools, agent, tools, agent 순서로 노드가 다섯 번 실행되고 그때마다 변경분이 하나씩 나온다. 처음 질문은 노드 출력이 아니다.' },
  ];

  const summary = [
    '수동으로 짜면 노드 2개, 분기 함수 1개, 엣지 3개를 직접 연결해야 한다.',
    'create_react_agent(model, tools) 한 줄이 같은 구조의 컴파일된 그래프를 만든다.',
    'LLM이 도구 설명을 읽고 tool_calls를 내면 ToolNode가 실행해 ToolMessage를 붙인다.',
    'tool_calls가 빈 AIMessage가 나오면 끝나고, stream으로 노드마다 결과를 본다.',
  ];
  const review = [
    { q: 'Agent가 도구를 부른 뒤 OpenAI가 "tool_calls 뒤에 응답 메시지가 없다"는 오류를 냈다. 먼저 확인할 것은?',
      o: ['ToolMessage의 tool_call_id가 호출 id와 같은지', 'HumanMessage를 두 번 넣지 않았는지', 'stream_mode를 values로 바꿨는지'], a: 0,
      why: '도구 결과는 호출 id로 짝지어진다. id가 다르면 모델 쪽에서는 응답 없는 호출이 남은 것으로 본다.' },
    { q: 'invoke로 돌렸더니 답이 이상한데 중간에 무슨 일이 있었는지 모르겠다. 가장 먼저 해 볼 일은?',
      o: ['모델을 더 큰 것으로 바꾼다', 'create_react_agent를 버리고 그래프를 직접 짠다', 'stream_mode="updates"로 돌려 노드별 출력을 본다'], a: 2,
      why: 'updates는 agent와 tools가 낸 변경분을 차례로 보여 준다. 어느 호출에서 인자나 결과가 틀렸는지 바로 보인다.' },
    { q: '수동 그래프에서 tools → agent 엣지를 빠뜨리면 어떻게 되나?',
      o: ['도구가 아예 실행되지 않는다', '도구 결과를 LLM이 다시 보지 못해 왕복이 한 번에서 끊긴다', 'tool_calls가 생기지 않는다'], a: 1,
      why: 'ReAct는 도구 결과를 들고 agent로 돌아와 다음 행동을 정하는 루프다. 돌아오는 엣지가 없으면 두 번째 도시를 부를 기회가 없다.' },
  ];

  R.page({ title: 'ReAct 그래프와 메시지 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
