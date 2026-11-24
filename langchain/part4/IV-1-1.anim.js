/* IV-1-1 왜 LangGraph인가 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 값(Python이 뭐야? → simple, 39자 질문 → complex, draw_mermaid 표기)은 langgraph 1.2.24 · langchain-core 1.8.4로 돌려 확인했다.
 * LLM 출력 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock, person, snippet, kvTable } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공용 도우미 ----------
  // beat kk에 나타나 그 뒤로 남는 것: 크기(pop) · 투명도(fade) · 자람(E)
  const A = (c) => ({
    s: (kk, at) => (c.k > kk ? 1 : c.k === kk ? pop(c.u, at) : 0),
    o: (kk, at) => (c.k > kk ? 1 : c.k === kk ? fade(c.u, at) : 0),
    g: (kk, a, b) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a, b) : 0),
  });
  // 색 화살촉 (엔진 기본은 회색·강조·빨강뿐이라 노랑·파랑·초록을 더한다)
  function marks() { const d = el('defs', {});
    [['lc-w', WARN], ['lc-i', INFO], ['lc-g', GOOD]].forEach(([id, col]) => { const m = el('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, d); el('path', { d: 'M0,0 L10,5 L0,10 z', fill: col }, m); }); }
  const mid = (col) => (col === ACC ? 'ra-ahb' : col === BAD ? 'ra-ahr' : col === WARN ? 'lc-w' : col === INFO ? 'lc-i' : col === GOOD ? 'lc-g' : 'ra-ah');
  // 곡선(함수 f: 0→1 위치)을 u 만큼 그린다
  function curve(f, u, col, o) { o = o || {}; if (u <= 0) return; const n = 30, pts = [];
    for (let i = 0; i <= n; i++) { const tt = Math.min(u, i / n); pts.push(f(tt)); if (i / n >= u) break; }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, 'stroke-linecap': 'round', opacity: o.op ?? 1, 'marker-end': u > 0.98 && !o.plain ? `url(#${mid(col)})` : null }); }
  const qb = (p, q, r) => (s) => [(1 - s) * (1 - s) * p[0] + 2 * (1 - s) * s * q[0] + s * s * r[0], (1 - s) * (1 - s) * p[1] + 2 * (1 - s) * s * q[1] + s * s * r[1]];
  const cb = (p, q1, q2, r) => (s) => { const a = (1 - s) ** 3, b = 3 * (1 - s) ** 2 * s, d = 3 * (1 - s) * s * s, e = s ** 3; return [a * p[0] + b * q1[0] + d * q2[0] + e * r[0], a * p[1] + b * q1[1] + d * q2[1] + e * r[1]]; };
  const ln = (p, r) => (s) => [lerp(p[0], r[0], s), lerp(p[1], r[1], s)];
  // 상자 경계점: n = {x, y, w, h} 에서 (tx, ty) 쪽으로
  function rim(n, tx2, ty2, pad) { const dx = tx2 - n.x, dy = ty2 - n.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const k = Math.min(n.w / 2 / (Math.abs(ux) || 1e-9), n.h / 2 / (Math.abs(uy) || 1e-9)) + (pad ?? 3); return [n.x + ux * k, n.y + uy * k]; }
  function edge(a, b, u, col, o) { curve(ln(rim(a, b.x, b.y, 2), rim(b, a.x, a.y, 5)), u, col, o); }
  const route = (...ns) => ns.map((n) => [n.x, n.y]);
  // 그래프 노드 (LangGraph 노드 = 이름 붙은 함수)
  function gnode(n, name, o) { o = o || {}; const hot = o.hot;
    const g = card(n.x, n.y, n.w, n.h, { rx: 10, fill: hot ? ACCBG : o.fill || PANEL, stroke: hot ? ACC : o.stroke || INK, sw: hot ? 2.8 : 2, s: o.s, op: o.op, dash: o.dash });
    tx(0, o.sub ? -3 : 5.5, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, class: 'mono', fill: hot ? ACC : o.color || INK }, g);
    if (o.sub) tx(0, 16, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // START(검은 알약) · END(이중 고리)
  function gterm(n, kind, o) { o = o || {};
    if (kind === 'START') return card(n.x, n.y, n.w, n.h, { rx: n.h / 2, fill: INK, stroke: 'none', text: 'START', fs: 13.5, fw: 800, color: PANEL, mono: true, s: o.s, op: o.op });
    const g = R.G(n.x, n.y, o.s, o.op); el('circle', { cx: 0, cy: 0, r: n.h / 2, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g); el('circle', { cx: 0, cy: 0, r: n.h / 2 - 5, fill: o.fill || PANEL, stroke: INK, 'stroke-width': 1.6 }, g);
    tx(0, 5, 'END', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, class: 'mono' }, g); return g; }
  const N = (x, y, w, h) => ({ x, y, w: w || 120, h: h || 44 });
  const T = (x, y) => ({ x, y, w: 72, h: 34 });
  const E2 = (x, y) => ({ x, y, w: 50, h: 50 });
  function diamond(x, y, s, col) { if (s <= 0) return; const g = R.G(x, y, s); el('path', { d: 'M0,-20 L22,0 L0,20 L-22,0 Z', fill: WARNBG, stroke: col || WARN, 'stroke-width': 2.2 }, g); tx(0, 5, '?', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN }, g); }

  // ---------- 1. Chain의 한계 ----------
  const P1 = { y: 165, xs: [170, 420, 670], w: 196, h: 88 };
  const PARTS = [['prompt', 'ChatPromptTemplate'], ['llm', 'ChatOpenAI'], ['parser', 'StrOutputParser']];
  const LIMITS = [['~', '분기: RunnableBranch를 따로 끼워야 갈라진다'], ['x', '루프: 앞 단계로 돌아가는 화살표가 없다'], ['x', '상태: 앞 단계 값이 뒤로 이어지지 않는다']];
  function s1(t, c) { const { k, u } = c, a = A(c), y = P1.y; marks();
    const filled = k > 3 || (k === 3 && u > 0.85);
    PARTS.forEach(([n, cls], i) => { const x = P1.xs[i];
      if (k === 0) { card(x, y, P1.w, P1.h, { rx: 12, dash: '6 5', stroke: GRID, fill: SOFT, s: pop(u, 0.2 + i * 0.35) });
        mono(x, y + 5, cls, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.35 + i * 0.35) }); return; }
      const hot = k === 3 && i === 0 && filled && u < 2.2;
      const g = card(x, y, P1.w, P1.h, { rx: 12, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: 2.2, s: a.s(1, 0.2 + i * 0.35) });
      tx(0, -16, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono' }, g);
      tx(0, 5, cls, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
      const extra = i === 0 ? (filled ? '"질문: Python이 뭐야?"' : '"질문: {q}"') : i === 1 ? 'gpt-4o-mini' : 'AIMessage → str';
      mono(0, 29, extra, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: i === 0 && filled ? ACC : INK }, g); });
    if (k === 0) { sub(420, 260, 'import만 했다. 아직 만든 부품은 없다', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 1) sub(420, 260, '세 부품이 따로 놓여 있다. 서로 연결되지 않았다', fade(u, 1.4), { 'font-size': 15 });
    // 파이프 |
    if (k >= 2) [0, 1].forEach((i) => { const x1 = P1.xs[i] + P1.w / 2, x2 = P1.xs[i + 1] - P1.w / 2, gu = a.g(2, 0.2 + i * 0.4, 0.8 + i * 0.4);
      grow(x1, y, x2, y, gu, ACC, { sw: 3, plain: true }); if (gu > 0.5) mono((x1 + x2) / 2, y + 11, '|', { 'text-anchor': 'middle', 'font-size': 32, 'font-weight': 800, fill: ACC, opacity: clamp(gu * 2 - 1) }); });
    if (k === 2) { banner(420, 290, 'chain = prompt | llm | parser', pop(u, 1.3)); sub(420, 334, '흐르는 순서가 여기서 정해진다', fade(u, 1.9), { 'font-size': 15 }); }
    // invoke
    if (k === 3) { fly(170, 50, 170, y - 50, seg(u, 0.15, 0.8), '{"q": "Python이 뭐야?"}', { mono: true });
      dot([[P1.xs[0], y], [P1.xs[2], y], [P1.xs[2] + P1.w / 2 + 8, y]], seg(u, 0.9, 2.0), ACC, 8);
      sub(420, 290, '한 번 흘러가면 끝. 중간에 끼어들 곳이 없다', fade(u, 2.2), { 'font-size': 15 }); }
    if (k >= 3) { const go = a.g(3, 1.9, 2.3), os = a.s(3, 2.1);
      grow(P1.xs[2] + P1.w / 2 + 2, y, 822, y, go, INK);
      card(878, y, 104, 34, { rx: 17, text: '"Python은 …"', fs: 13.5, mono: true, fw: 700, stroke: INK, s: os });
      sub(878, y + 38, '예시 출력', a.o(3, 2.2)); }
    // 한계 목록
    LIMITS.forEach(([g, s], i) => { if (k < 4 + i) return; const yy = 300 + i * 38, op = a.o(4 + i, 1.2);
      if (g === 'x') cross(74, yy - 5, 7, a.s(4 + i, 1.1)); else mono(74, yy + 1, '~', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: WARN, opacity: op });
      tx(96, yy, s, { 'font-size': 15, 'font-weight': 700, fill: g === 'x' ? BAD : WARN, opacity: op }); });
    // 분기: 따로 끼운 갈림길
    if (k >= 4) { const gu = a.g(4, 0.2, 0.9);
      curve(qb([P1.xs[0] + 30, y - 46], [P1.xs[0] + 50, 62], [236, 62]), gu, WARN, { dash: '6 5' });
      card(295, 62, 112, 36, { rx: 8, text: 'search', mono: true, fs: 14.5, dash: '5 4', stroke: WARN, color: WARN, fill: WARNBG, s: a.s(4, 0.7) });
      curve(qb([352, 62], [P1.xs[1] - 40, 62], [P1.xs[1] - 30, y - 46]), a.g(4, 0.9, 1.4), WARN, { dash: '6 5' });
      tx(295, 32, 'RunnableBranch', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: WARN, opacity: a.o(4, 0.8) }); }
    // 루프: parser → llm 되돌아가기
    if (k >= 5) { const big = k === 7;
      curve(qb([P1.xs[2] - 30, y - 46], [545, 18], [P1.xs[1] + 30, y - 46]), a.g(5, 0.2, 1.3), BAD, { sw: big ? 4 : 2.6, dash: big ? null : '7 5' });
      cross(545, 70, big ? 14 : 11, a.s(5, 1.4));
      tx(545, 34, 'parser → llm', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: BAD, 'font-weight': 700, opacity: a.o(5, 1.5) }); }
    // 상태: 단계마다 값의 모양이 바뀌고 q는 사라진다
    if (k >= 6) { [['PromptValue', 295], ['AIMessage', 545]].forEach(([s, x], i) => mono(x, y + 64, s, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: a.o(6, 0.3 + i * 0.4) }));
      tx(670, y + 92, 'parser는 q를 모른다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: a.o(6, 1.4) }); }
    if (k === 7) banner(745, 352, '되돌아갈 화살표가 필요하다', pop(u, 1.4)); }

  // ---------- 2. 사이클이 필요한 세 패턴 ----------
  const AG = { th: N(160, 105, 120, 38), tl: N(160, 180, 120, 38), ob: N(160, 255, 120, 38) };
  const RT = { ca: N(480, 105, 120, 38), ch: N(480, 180, 120, 38), bo: N(480, 255, 120, 38) };
  const AP = { dr: N(790, 105, 120, 38), rv: N(790, 180, 120, 38), ed: N(715, 262, 110, 38), end: E2(875, 262) };
  function s2(t, c) { const { k, u } = c, a = A(c); marks();
    if (k === 0) { const y = 210;
      card(480, y, 150, 50, { rx: 10, text: 'LLM 호출', fs: 16, s: pop(u, 0.2) });
      grow(130, y, 403, y, E(u, 0.3, 0.8), MUT); grow(557, y, 800, y, E(u, 0.8, 1.3), MUT);
      person(95, y + 4, null, { s: pop(u, 0.1) }); dot([[130, y], [800, y]], seg(u, 0.4, 1.5), ACC, 8);
      card(855, y, 96, 40, { rx: 8, text: '결과', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.4) });
      pill(855, y + 50, '부족', BAD, pop(u, 1.7), { fs: 13.5 });
      curve(qb([830, y - 26], [480, 40], [130, y - 26]), seg(u, 1.8, 2.5), WARN, { dash: '7 5' });
      tx(480, 92, '한 번 더? 다른 길로?', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.3) });
      return; }
    const dim = k === 7 ? 0.45 : 1;
    // 머리글
    [['Agent 루프', 160, 1], ['Retry', 480, 3], ['사람 승인', 790, 5]].forEach(([s, x, kk]) => { if (k >= kk) lbl(x, 52, s, a.o(kk, 0.1) * dim, { 'font-size': 16 }); });
    // Agent
    if (k >= 1) { const o = { op: dim }; gnode(AG.th, 'Think', { s: a.s(1, 0.2), ...o }); gnode(AG.tl, 'Tool', { s: a.s(1, 0.5), ...o }); gnode(AG.ob, 'Observe', { s: a.s(1, 0.8), ...o, hot: k === 2 && u < 1 });
      edge(AG.th, AG.tl, a.g(1, 0.5, 0.9), MUT, o); edge(AG.tl, AG.ob, a.g(1, 0.8, 1.2), MUT, o);
      if (k === 1) sub(160, 312, '아직 직선: Observe에서 끝', fade(u, 1.5));
      if (k >= 2) { curve(qb([222, 255], [300, 180], [222, 105]), a.g(2, 0.3, 1.2), ACC, { sw: 2.8, op: dim });
        if (k < 7) { tx(160, 312, '결과 부족 → 다시 Think', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: a.o(2, 1.2) });
          if (k === 2) dot([[160, 105], [160, 255], [222, 255], [258, 180], [222, 105], [160, 105]], (t * 0.45) % 1, ACC, 6); } } }
    // Retry
    if (k >= 3) { const o = { op: dim }, fail = k === 3 && u > 0.9;
      gnode(RT.ca, 'Call API', { s: a.s(3, 0.2), ...o }); gnode(RT.ch, 'Check', { s: a.s(3, 0.5), ...o, stroke: fail ? BAD : INK, color: fail ? BAD : INK }); gnode(RT.bo, 'Backoff', { s: a.s(3, 1.3), ...o });
      edge(RT.ca, RT.ch, a.g(3, 0.5, 0.9), MUT, o); edge(RT.ch, RT.bo, a.g(3, 1.2, 1.6), BAD, o);
      if (k === 3) pill(585, 180, '실패', BAD, pop(u, 0.9), { fs: 13.5 });
      if (k >= 4) { curve(qb([418, 255], [340, 180], [418, 105]), a.g(4, 0.2, 1.0), WARN, { sw: 2.8, op: dim });
        if (k < 7) { const xs = [372, 412, 460], bars = [[384, 400], [424, 448]];
          bars.forEach(([x1, x2], i) => { const g = a.g(4, 1.0 + i * 0.5, 1.4 + i * 0.5); if (g > 0) el('rect', { x: x1, y: 297, width: (x2 - x1) * g, height: 8, rx: 3, fill: WARN }); });
          xs.forEach((x, i) => { el('circle', { cx: x, cy: 301, r: 8, fill: i === 2 ? GOOD : PANEL, stroke: i === 2 ? GOOD : BAD, 'stroke-width': 2, opacity: a.o(4, 0.9 + i * 0.5) }); });
          check(460, 301, 5, a.s(4, 2.0)); grow(476, 301, 560, 301, a.g(4, 2.0, 2.4), GOOD);
          tx(588, 306, '탈출', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: a.o(4, 2.3) });
          tx(420, 334, '대기를 두 배씩 늘려 다시 호출', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: a.o(4, 1.6) }); } } }
    // 사람 승인
    if (k >= 5) { const o = { op: dim };
      gnode(AP.dr, 'Draft', { s: a.s(5, 0.2), ...o }); gnode(AP.rv, 'Review', { s: a.s(5, 0.5), ...o, hot: k === 5 });
      edge(AP.dr, AP.rv, a.g(5, 0.5, 0.9), MUT, o);
      person(895, 176, null, { s: a.s(5, 1.0), op: dim });
      if (k === 5) { [0, 1].forEach((i) => el('rect', { x: 866 + i * 12, y: 210, width: 7, height: 20, rx: 2, fill: WARN, opacity: fade(u, 1.4) }));
        tx(905, 226, '대기', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) }); }
      if (k >= 6) { gnode(AP.ed, 'Edit', { s: a.s(6, 0.9), ...o }); gterm(AP.end, 'END', { s: a.s(6, 0.4), op: dim });
        edge(AP.rv, AP.end, a.g(6, 0.2, 0.6), GOOD, o); edge(AP.rv, AP.ed, a.g(6, 0.7, 1.1), BAD, o);
        curve(qb([660, 262], [636, 180], [726, 180]), a.g(6, 1.3, 2.0), BAD, { sw: 2.6, op: dim });
        if (k < 7) { tx(870, 306, 'Approve', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: a.o(6, 0.6) });
          tx(700, 222, 'Reject', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: a.o(6, 1.0) });
          mono(790, 334, 'interrupt()로 사람 답을 기다린다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: a.o(6, 2.0) }); } } }
    // Chain으로 쓰면: 루프가 체인 밖 while에 있다
    if (k === 7) { const op = fade(u, 0.3);
      snippet(130, 318, ['while True:            # 체인 밖', '    out = chain.invoke(x)', '    if 충분하다(out): break'], { fs: 14, op });
      tx(560, 350, '루프가 코드 밖으로 샌다', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      tx(560, 378, '그래프는 루프를 그림 안에 둔다', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); } }

  // ---------- 3. StateGraph로 다시 그리기 ----------
  const G3 = { st: T(70, 120), cl: N(215, 120), an: N(385, 120), en: E2(545, 120) };
  function s3(t, c) { const { k, u } = c, a = A(c); marks();
    gterm(G3.st, 'START', { s: a.s(0, 0.3) }); gterm(G3.en, 'END', { s: a.s(0, 0.7) });
    if (k === 0) { sub(310, 186, '시작과 끝만 있는 빈 그래프', fade(u, 1.2), { 'font-size': 15 }); }
    // State 칸
    if (k >= 1) { const run = k === 6, fq = run && u > 0.6, ft = run && u > 1.25, fa = run && u > 1.9;
      kvTable(640, 62, 296, [
        ['question', fq ? '"Python이 뭐야?"' : 'str', { op: a.o(1, 0.3), hot: run && u > 0.6 && u < 1.25 }],
        ['type', ft ? '"simple"' : '"simple"|"complex"', { op: a.o(1, 0.7), hot: run && u > 1.25 && u < 1.9 }],
        ['answer', fa ? '"(simple) ..."' : 'str', { op: a.o(1, 1.1), hot: run && u > 1.9 }],
      ], { title: 'State (TypedDict)', kw: 104, rh: 38 });
      if (k === 1) sub(788, 228, '노드 사이를 흐르는 dict의 칸', fade(u, 1.5)); }
    // 함수 두 개 → 노드
    if (k === 2 || k === 3) { const op = k === 2 ? 1 : 1 - fade(u, 0.15, 0.5);
      snippet(30, 228, ['def classify(state) -> dict:', '    return {"type": ...}'], { op: (k === 2 ? fade(u, 0.2) : 1) * op });
      snippet(330, 228, ['def answer(state) -> dict:', '    return {"answer": ...}'], { op: (k === 2 ? fade(u, 0.7) : 1) * op });
      if (k === 2) sub(310, 330, '바뀐 칸만 dict로 돌려주는 평범한 함수', fade(u, 1.5), { 'font-size': 15 }); }
    if (k === 3) { fly(170, 260, G3.cl.x, G3.cl.y, seg(u, 0.2, 0.9), 'add_node("classify")', { mono: true, fill: INK });
      fly(460, 260, G3.an.x, G3.an.y, seg(u, 0.7, 1.4), 'add_node("answer")', { mono: true, fill: INK }); }
    if (k >= 3) { gnode(G3.cl, 'classify', { s: a.s(3, 0.9), hot: k === 6 && u > 0.9 && u < 1.3 }); gnode(G3.an, 'answer', { s: a.s(3, 1.4), hot: k === 6 && u > 1.6 && u < 2.0 }); }
    if (k >= 4) { edge(G3.st, G3.cl, a.g(4, 0.2, 0.7), INK); edge(G3.cl, G3.an, a.g(4, 0.8, 1.3), INK); edge(G3.an, G3.en, a.g(4, 1.4, 1.9), INK);
      if (k === 4) sub(310, 200, 'add_edge × 3: 조건 없는 직선', fade(u, 2.0), { 'font-size': 15 }); }
    if (k >= 5) { const fo = a.o(5, 0.2);
      el('rect', { x: 22, y: 80, width: 582, height: 80, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': k === 5 && u < 0.9 ? '8 6' : null, opacity: fo });
      lock(604, 82, true, ACC, a.s(5, 0.8));
      mono(312, 214, 'graph = workflow.compile()', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: a.o(5, 1.0) });
      if (k === 5) sub(312, 246, '구조를 바꾸려면 workflow를 고쳐 다시 compile', fade(u, 1.6), { 'font-size': 14 }); }
    if (k === 6) { fly(250, 300, 70, 152, seg(u, 0.1, 0.6), '{"question": "Python이 뭐야?"}', { mono: true });
      dot(route(G3.st, G3.cl), seg(u, 0.6, 1.0), ACC, 8); dot(route(G3.cl, G3.an), seg(u, 1.3, 1.7), ACC, 8); dot(route(G3.an, G3.en), seg(u, 2.0, 2.4), ACC, 8);
      mono(215, 176, 'len 11 < 30', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      sub(312, 300, 'question만 넣으면 나머지 칸은 노드가 채운다', fade(u, 2.2), { 'font-size': 15 }); } }

  // ---------- 4. 조건부 엣지: 분기와 루프 ----------
  const G4 = { st: T(60, 200), cl: N(178, 200, 116), di: { x: 284, y: 200, w: 44, h: 40 }, dr: N(420, 105, 110), se: N(420, 300, 110), d2: { x: 530, y: 300, w: 44, h: 40 }, an: N(650, 300, 110), en: E2(830, 200) };
  const Q4 = 'LangGraph와 LCEL의 차이를 예시 코드와 함께 자세히 설명해줘';
  function s4(t, c) { const { k, u } = c, a = A(c), run = k === 8; marks();
    gterm(G4.st, 'START'); gterm(G4.en, 'END');
    // 노드
    gnode(G4.cl, 'classify', { hot: run && u > 0.4 && u < 0.9 });
    gnode(G4.an, 'answer', { hot: run && u > 1.6 && u < 2.05 });
    if (k >= 1) { gnode(G4.dr, 'direct', { s: a.s(1, 0.2), op: run ? 0.5 : 1 }); gnode(G4.se, 'search', { s: a.s(1, 0.6), hot: run && u > 0.95 && u < 1.5 });
      if (k === 1) { pill(530, 340, '+ ok', INFO, pop(u, 1.1), { fs: 13.5, mono: true }); sub(420, 46, '노드는 늘었지만 가는 길이 없다', fade(u, 1.6), { 'font-size': 15 }); } }
    // 엣지
    edge(G4.st, G4.cl, 1, INK);
    if (k <= 4) { const gone = k === 4 ? fade(u, 0.6) : 0; edge(G4.cl, G4.an, 1, INK, { op: 1 - gone * 0.75, dash: gone > 0 ? '6 6' : null });
      if (k === 4) cross(414, 250, 11, pop(u, 0.6)); }
    if (k === 0) sub(410, 380, '아직 Step 3의 직선 그래프', fade(u, 0.8), { 'font-size': 15 });
    if (k >= 2) { diamond(G4.di.x, G4.di.y, a.s(2, 0.3)); }
    if (k >= 5) { const g1 = a.g(5, 0.3, 0.9), g2 = a.g(5, 0.9, 1.5);
      edge(G4.cl, G4.di, 1, INK, { plain: true });
      edge(G4.di, G4.dr, g1, WARN, { dash: '7 5', op: run ? 0.4 : 1 }); edge(G4.di, G4.se, g2, WARN, { dash: '7 5' });
      mono(320, 136, 'simple', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: a.o(5, 0.8) * (run ? 0.5 : 1) });
      mono(318, 276, 'complex', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: a.o(5, 1.4) }); }
    if (k >= 3) diamond(G4.d2.x, G4.d2.y, a.s(3, 0.3));
    if (k >= 6) { const lu = a.g(6, 0.2, 1.1), lo = run && u > 1.4 ? 0.35 : 1;
      curve(cb([398, 324], [360, 404], [480, 404], [442, 324]), lu, INFO, { sw: 2.8, dash: '7 5', op: lo });
      mono(470, 412, 'retry', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: a.o(6, 1.0) * lo });
      edge(G4.se, G4.d2, 1, INK, { plain: true }); edge(G4.d2, G4.an, a.g(6, 1.2, 1.7), WARN, { dash: '7 5' });
      mono(574, 286, 'ok', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: a.o(6, 1.6) }); }
    if (k >= 7) { edge(G4.dr, G4.en, a.g(7, 0.2, 0.8), INK, { op: run ? 0.4 : 1 }); edge(G4.an, G4.en, a.g(7, 0.6, 1.2), INK);
      lock(900, 140, true, ACC, a.s(7, 1.4)); if (k === 7) mono(860, 112, 'compile()', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) }); }
    // 라우터 함수
    if (k >= 2 && k < 8) { snippet(20, 20, ['route_by_type(state)', '  simple  → "direct"', '  complex → "search"'], { fs: 13.5, op: a.o(2, 0.6) });
      if (k === 2) grow(140, 104, 268, 186, E(u, 1.2, 1.8), WARN, { dash: '4 4' }); }
    if (k >= 3 && k < 8) { snippet(600, 20, ['should_retry(state)', '  ok      → "answer"', '  ok 없음 → "search"'], { fs: 13.5, op: a.o(3, 0.6) });
      if (k === 3) grow(700, 104, 540, 278, E(u, 1.2, 1.8), WARN, { dash: '4 4' }); }
    // State
    const ft = run && u > 0.85, fo = run && u > 1.4, fa = run && u > 2.0;
    kvTable(20, 262, 300, [
      ['question', '"LangGraph와…" 39자', { hot: run && u < 0.6 }],
      ['type', ft ? '"complex"' : '?', { hot: run && ft && !fo }],
      ['answer', fa ? '"(complex) ..."' : '?', { hot: fa }],
      ['ok', fo ? 'True' : '—', { hot: fo && !fa }],
    ], { title: 'State', kw: 96, rh: 30 });
    if (run) { pill(480, 36, Q4, ACC, pop(u, 0.1), { fs: 13.5, fill: PANEL });
      dot(route(G4.st, G4.cl), seg(u, 0.3, 0.7), ACC, 8); dot(route(G4.cl, G4.di, G4.se), seg(u, 0.85, 1.3), ACC, 8);
      dot(route(G4.se, G4.d2, G4.an), seg(u, 1.45, 1.9), ACC, 8); dot(route(G4.an, G4.en), seg(u, 2.05, 2.5), ACC, 8);
      mono(178, 246, '39자 ≥ 30', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.75) });
      tx(560, 380, 'ok=True라 재시도 없이 통과', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) }); } }

  // ---------- 5. Chain vs LangGraph ----------
  const CX = [100, 220, 340], CY = 112;
  const G5 = { st: T(540, 125), pl: N(640, 125, 96, 40), tl: N(770, 70, 96, 40), ck: N(770, 185, 96, 40), fi: N(890, 185, 76, 40), en: E2(890, 268) };
  function chainMini(op, s, dx, dy) { CX.forEach((x, i) => card(x + (dx || 0), CY + (dy || 0), 96, 40, { rx: 8, text: ['prompt', 'llm', 'parser'][i], mono: true, fs: 14.5, s, op }));
    [160, 280].forEach((x) => mono(x + (dx || 0), CY + 9 + (dy || 0), '|', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: ACC, opacity: op * (s ?? 1) })); }
  function chips(items, x0, y0, col, a, kk) { items.forEach((s, i) => { const x = x0 + (i % 2) * 190, y = y0 + Math.floor(i / 2) * 38;
    pill(x, y, s, col, a.s(kk, 0.4 + i * 0.25), { fs: 14 }); }); }
  function s5(t, c) { const { k, u } = c, a = A(c); marks();
    el('line', { x1: 465, y1: 24, x2: 465, y2: 400, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 6' });
    const cw = k === 3, gw = k === 4;
    tx(40, 42, 'Chain (LCEL)', { 'font-size': 16, 'font-weight': 800, fill: cw ? GOOD : INK });
    tx(500, 42, 'LangGraph', { 'font-size': 16, 'font-weight': 800, fill: gw ? GOOD : INK });
    if (cw) el('rect', { x: 26, y: 60, width: 425, height: 104, rx: 12, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
    if (gw) el('rect', { x: 484, y: 50, width: 466, height: 245, rx: 12, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
    // 왼쪽: 체인 (5·6 에서는 plan 안으로 들어간다)
    if (k < 5) { chainMini(1, a.s(0, 0.2)); grow(40, 150, 400, 150, a.g(0, 0.6, 1.2), MUT, { plain: true }); if (k === 0) sub(220, 178, '1차원: 한 줄', fade(u, 1.2), { 'font-size': 15 }); }
    if (k === 5) { const f = E(u, 0.3, 1.5); if (f < 1) chainMini(1 - f, 1 - f * 0.6, lerp(0, 420, f), lerp(0, 13, f)); }
    if (k >= 5) pill(590, 182, 'prompt | llm | parser', ACC, a.s(5, 1.5), { fs: 13.5, mono: true, fill: ACCBG });
    // 오른쪽: 그래프
    gterm(G5.st, 'START', { s: a.s(0, 0.4) }); gnode(G5.pl, 'plan', { s: a.s(0, 0.7), hot: k >= 5 }); edge(G5.st, G5.pl, a.g(0, 0.8, 1.2), INK);
    if (k >= 1) { gnode(G5.tl, 'tool', { s: a.s(1, 0.2) }); gnode(G5.ck, 'check', { s: a.s(1, 0.4) });
      edge(G5.pl, G5.tl, a.g(1, 0.5, 1.0), WARN, { dash: '7 5' }); edge(G5.pl, G5.ck, a.g(1, 0.7, 1.2), WARN, { dash: '7 5' });
      curve(qb([722, 74], [680, 70], [662, 103]), a.g(1, 1.3, 1.9), INFO, { sw: 2.6 }); }
    if (k === 0) sub(700, 238, '2차원: 노드와 엣지', fade(u, 1.4), { 'font-size': 15 });
    if (k >= 6) { gnode(G5.fi, 'final', { s: a.s(6, 0.3) }); gterm(G5.en, 'END', { s: a.s(6, 0.6) }); edge(G5.ck, G5.fi, a.g(6, 0.4, 0.8), INK); edge(G5.fi, G5.en, a.g(6, 0.7, 1.1), INK); }
    // beat 별 아래 칸
    if (k === 1) { tx(40, 220, '분기', { 'font-size': 15, 'font-weight': 700 }); tx(110, 220, 'RunnableBranch로 우회', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.4) });
      tx(40, 256, '루프', { 'font-size': 15, 'font-weight': 700 }); tx(110, 256, '없음, 밖에서 while', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(560, 280, '분기 = 점선, 루프 = 되돌아오는 곡선', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) { [['dict', 40, 72], ['PromptValue', 112, 201], ['AIMessage', 241, 314], ['str', 354, 378]].forEach(([s, x, x2], i, arr) => { mono(x, 220, s, { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2 + i * 0.25) }); if (i < 3) grow(x2 + 5, 215, arr[i + 1][1] - 5, 215, E(u, 0.35 + i * 0.25, 0.6 + i * 0.25), MUT); });
      sub(220, 256, '값을 손에서 손으로 넘긴다', fade(u, 1.1), { 'font-size': 15 });
      snippet(500, 232, ['graph TD;', '  __start__ --> plan;', '  plan -.-> tool;', '  tool --> plan;'], { fs: 13.5, op: fade(u, 1.2) });
      tx(735, 270, 'draw_mermaid()', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: INFO, opacity: fade(u, 1.6) });
      tx(735, 296, 'State 칸은 reducer로', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); tx(735, 316, '자동으로 합쳐진다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 3) { mono(40, 206, 'chain = prompt | llm | parser', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) });
      chips(['요약', '분류', '임베딩', '단순 RAG'], 120, 252, GOOD, a, 3);
      ['add_node × 4', 'add_edge · add_conditional_edges', 'compile()'].forEach((s, i) => mono(500, 330 + i * 26, s, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2 + i * 0.2) })); }
    if (k === 4) { chips(['ReAct Agent', '재시도 · 폴백', '사람 승인', '멀티 에이전트', 'self-correcting RAG'], 610, 318, GOOD, a, 4);
      sub(220, 230, '모두 되돌아가는 길이 필요하다', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 5) { tx(220, 230, '대체가 아니라 조합', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.4) });
      sub(220, 262, 'LCEL 체인이 노드 하나 안으로 들어간다', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 6) { snippet(24, 210, ['def plan_node(state):', '    chain = plan_prompt | llm | parser', '    return {"plan": chain.invoke(state)}'], { fs: 13.5, op: fade(u, 1.0) });
      grow(400, 214, 492, 192, E(u, 1.4, 2.0), ACC, { dash: '5 4' });
      sub(700, 340, 'plan → tool / check → final → END', fade(u, 1.6), { 'font-size': 15 }); } }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'prompt | llm | parser 체인에서 parser가 받는 값은 무엇인가?',
      o: ['처음 넣은 {"q": ...} dict', 'llm이 돌려준 AIMessage', 'prompt가 만든 PromptValue'], a: 1,
      why: '파이프는 앞 단계의 출력만 다음 단계로 넘긴다. parser는 AIMessage만 받으므로 처음의 q는 이미 모른다.' },
    { q: 'Retry 패턴에서 사이클을 만드는 화살표는 무엇인가?',
      o: ['Call API에서 Check로 가는 화살표', 'Backoff에서 Call API로 돌아가는 화살표', 'Check에서 성공으로 빠져나가는 화살표'], a: 1,
      why: '실패하면 Backoff로 기다렸다가 다시 Call API로 돌아간다. 이 되돌아가는 화살표가 사이클이다.' },
    { q: 'graph.invoke({"question": "Python이 뭐야?"}) 뒤 type 칸에 들어가는 값은 무엇인가?',
      o: ['"complex"', '"simple"', '아무 값도 없다'], a: 1,
      why: 'classify가 질문 길이를 본다. 11자는 30보다 짧으므로 type은 "simple"이 된다.' },
    { q: 'search 노드가 ok=True를 돌려주면 should_retry는 어디로 보내는가?',
      o: ['search 자기 자신', 'answer', 'direct'], a: 1,
      why: 'should_retry는 ok가 있으면 "answer", 없으면 "search"를 돌려준다. 39자 질문은 ok=True라 재시도 없이 answer로 갔다.' },
    { q: 'LangGraph와 LCEL을 함께 쓰는 실전 구조는 무엇인가?',
      o: ['LangGraph가 LCEL을 대신하므로 LCEL은 쓰지 않는다', '체인 바깥을 while 문으로 감싼다', '노드 함수 안에서 LCEL 체인을 호출한다'], a: 2,
      why: 'plan_node 안에서 prompt | llm | parser를 그대로 부르고, 그 노드들을 그래프에 놓는다. 둘은 대체가 아니라 조합이다.' },
  ];

  const summary = [
    'LCEL 체인은 앞 단계 출력을 다음 단계로 넘기는 한 방향 파이프다.',
    'Agent 루프, 재시도, 사람 승인은 모두 앞 단계로 되돌아가는 화살표가 필요하다.',
    'StateGraph는 State 칸, 노드 함수, 엣지로 흐름을 자료구조로 적고 compile로 굳힌다.',
    '조건부 엣지의 라우터가 돌려준 문자열이 다음 노드를 고르고, 자기 자신을 고르면 루프가 된다.',
  ];
  const review = [
    { q: 'LCEL 체인으로 만든 검색 봇이 결과가 부족해도 다시 검색하지 못한다. 가장 알맞은 고침은?',
      o: ['검색 노드에 조건부 엣지를 달아 부족하면 검색으로 돌아가게 한다', '체인에 parser를 하나 더 붙인다', 'gpt-4o-mini를 더 큰 모델로 바꾼다'], a: 0,
      why: '체인에는 앞 단계로 돌아가는 화살표가 없다. 그래프에서 라우터가 "search"를 돌려주게 하면 재검색 루프가 생긴다.' },
    { q: '"GPT-5 출시일 알려줘"(13자)를 Step 4 그래프에 넣었더니 search를 한 번도 거치지 않았다. 이유는?',
      o: ['should_retry가 ok를 못 찾아서', '30자보다 짧아 classify가 simple로 찍고 direct로 갔기 때문', 'compile을 하지 않아서'], a: 1,
      why: 'route_by_type은 type이 simple이면 direct로 보낸다. 30자 미만 질문은 search 쪽 분기에 들어가지 않는다.' },
    { q: '요약 한 번만 하는 기능을 LangGraph 노드 넷으로 짰더니 코드가 길어졌다. 어떻게 보는 게 맞나?',
      o: ['그래프가 늘 더 좋으니 그대로 둔다', '되돌아갈 길이 없는 일이라 prompt | llm | parser 한 줄 체인이 낫다', '요약은 LangChain으로 할 수 없다'], a: 1,
      why: '분기나 루프가 없는 변환은 LCEL이 짧고 읽기 좋다. 그래프는 사이클이 필요할 때 쓴다.' },
  ];

  R.page({ title: 'Chain에서 Graph로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
