/* VI-2-2 Adaptive RAG — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 모드별 비용·지연은 페이지 cost.py 상수(1x/3x/8x, 0.4s/1.2s/3.5s, 트래픽 30/50/20%)다. 평균은 Python 으로 확인:
 * adaptive 비용 3.40x, 지연 1.42s, always_multi 대비 -57.5% / -59%. 답변 문장은 예시 출력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, dot, cross, check, dbIcon, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const M = [{ key: 'simple', name: 'LLM 직접', cost: 1, lat: 0.4, col: GOOD, y: 90 }, { key: 'single', name: '1회 검색', cost: 3, lat: 1.2, col: INFO, y: 210 }, { key: 'multi', name: '분해 + N회 검색', cost: 8, lat: 3.5, col: WARN, y: 330 }];
  const QS = { q1: '파이썬 리스트 정렬 방법은?', q2: '우리 회사 휴가 정책은?', q3: '3분기 매출 하락 원인 분석' };
  function bubble(x, y, s, o) { o = o || {}; const fs = o.fs || 15, w = tw(s, fs) + 30, h = fs + 20, g = G(x, y, o.s, o.op);
    el('path', { d: `M18,${h / 2 - 3} l-8,12 l20,-10`, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('rect', { x: 0, y: -h / 2, width: w, height: h, rx: h / 2, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2 }, g);
    tx(15, fs * 0.36, s, { 'font-size': fs, 'font-weight': 700, fill: o.color || INK }, g); return w; }
  const DX = 300, DY = 210;
  // 분류기 마름모. state: idle | thinking | decided
  function router(t, st, s) { const g = G(DX, DY, s ?? 1), on = st !== 'idle';
    el('path', { d: 'M0,-46 L66,0 L0,46 L-66,0 Z', fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': 2.5 }, g);
    tx(0, 6, '분류기', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? ACC : MUT }, g);
    if (st === 'thinking') for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; el('circle', { cx: Math.cos(a) * 82, cy: Math.sin(a) * 58, r: 5, fill: ACC, opacity: 0.4 + 0.2 * i }, g); } }
  // 세 갈래 (on: 켜진 모드 key, 경로 u)
  function lanes(on, pu, o) { o = o || {};
    M.forEach((m) => { const lit = m.key === on, dim = on && !lit;
      el('path', { d: `M${DX + 66},${DY} C${DX + 110},${DY} ${DX + 100},${m.y} ${DX + 150},${m.y}`, fill: 'none', stroke: lit ? m.col : GRID, 'stroke-width': lit ? 3 : 2, 'stroke-dasharray': lit ? `${pu * 200} 999` : null, opacity: dim ? 0.5 : 1 });
      card(DX + 240, m.y, 180, 44, { rx: 10, stroke: lit ? m.col : GRID, sw: lit ? 2.6 : 1.8, fill: lit ? PANEL : SOFT, op: dim ? 0.55 : 1 });
      mono(DX + 162, m.y - 4, m.key, { 'font-size': 14.5, 'font-weight': 800, fill: lit ? m.col : MUT, opacity: dim ? 0.55 : 1 });
      tx(DX + 162, m.y + 15, m.name, { 'font-size': 13.5, fill: MUT, opacity: dim ? 0.55 : 1 });
      if (o.gauge) gauge(m, lit ? o.gauge : 0, dim); }); }
  // 비용·지연 막대
  function gauge(m, u, dim) { const x = 650, w = 210, op = dim ? 0.45 : 1;
    [['비용', m.cost / 8, `${m.cost}x`], ['지연', m.lat / 3.5, `${m.lat}s`]].forEach(([n, f, v], i) => { const y = m.y - 16 + i * 22;
      tx(x, y + 12, n, { 'font-size': 13.5, fill: MUT, opacity: op }); el('rect', { x: x + 40, y, width: w, height: 14, rx: 3, fill: SOFT, opacity: op });
      el('rect', { x: x + 40, y, width: Math.max(2, w * f * (u || (dim ? 1 : 0))), height: 14, rx: 3, fill: m.col, opacity: op * (u || dim ? 1 : 0) });
      if (u || dim) mono(x + 48 + w, y + 12, v, { 'font-size': 14, 'font-weight': 800, fill: dim ? MUT : m.col, opacity: dim ? op : clamp(u * 2) }); }); }
  const cl = (c) => (c.beat.classifier || {});

  // ---------- 1. simple ----------
  function s1(t, c) { const { k, u } = c, st = cl(c).state;
    router(t, st, k === 0 ? pop(u, 0.2) : 1);
    const pu = k === 2 ? E(u, 0.2, 1.0) : k > 2 ? 1 : 0;
    lanes(k >= 2 ? 'simple' : null, pu, { gauge: k >= 2 ? (k === 2 ? E(u, 1.0, 2.0) : 1) : 0 });
    if (k === 0) { mono(650, 84, 'llm = ChatOpenAI(…)', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) }); tx(650, 110, '벡터 DB 없이 LLM 하나', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); return; }
    bubble(10, 160, QS.q1, { fs: 14, s: k === 1 ? pop(u, 0.1) : 1 });
    grow(120, 178, DX - 70, DY - 6, k === 1 ? E(u, 0.4, 0.9) : 1, MUT);
    if (k === 1) return;
    if (k === 2) dot([[DX + 66, DY], [DX + 120, 120], [DX + 150, 90]], seg(u, 0.2, 1.0), GOOD, 7);
    if (k >= 3) { const a = k === 3 ? pop(u, 0.3) : 1; dbIcon(560, 160, null, { s: 0.45 * a, stroke: GRID }); cross(560, 158, 11, a); tx(590, 165, '검색 0회', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: a }); }
    if (k === 4) { bubble(10, 290, QS.q2, { fs: 14, s: pop(u, 0.2), fill: WARNBG, stroke: WARN });
      card(160, 360, 280, 34, { rx: 17, text: 'LLM만으로 답하면 지어낼 위험', fs: 14, fw: 700, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.9) });
      tx(650, 400, '사내 사실 질문은 single 로 보낸다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) }); } }

  // ---------- 2. single ----------
  function s2(t, c) { const { k, u } = c, st = cl(c).state;
    router(t, st);
    const pu = k === 2 ? E(u, 0.2, 1.0) : k > 2 ? 1 : 0;
    lanes(k >= 2 ? 'single' : null, pu, { gauge: k >= 3 ? (k === 3 ? E(u, 0.2, 1.4) : 1) : 0 });
    if (k < 4) { dbIcon(110, 320, null, { s: 0.6, stroke: INFO, op: k === 0 ? fade(u, 0.3) : 1 });
      mono(110, 375, 'retriever(k=3)', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.6) : 1 }); }
    if (k === 0) { tx(110, 400, '임베딩 · FAISS · LLM', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); return; }
    bubble(10, 160, QS.q2, { fs: 14, s: k === 1 ? pop(u, 0.1) : 1 });
    grow(120, 178, DX - 70, DY - 6, k === 1 ? E(u, 0.4, 0.9) : 1, MUT);
    // 회수 문서 3건
    [0, 1, 2].forEach((i) => { const a = k === 1 ? E(u, 0.8 + i * 0.3, 1.4 + i * 0.3) : 1; if (a <= 0) return;
      const b = k === 2 ? E(u, 1.0, 1.8) : k > 2 ? 1 : 0;
      card(lerp(lerp(110, 210 + i * 62, a), 560 + i * 64, b), lerp(320, 258, b), 52, 30, { rx: 5, text: `doc${i + 1}`, mono: true, fs: 13.5, fw: 700, stroke: INFO, fill: INFOBG }); });
    if (k === 1) tx(270, 290, 'top-3 문서를 한 번 회수', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) });
    if (k >= 2) { tx(726, 263, '→ prompt 문맥', { 'font-size': 13.5, fill: MUT, opacity: k === 2 ? fade(u, 1.8) : 1 }); }
    if (k === 4) { const a = fade(u, 0.3);
      card(160, 330, 280, 36, { rx: 18, text: '"X 정책은?" 같은 단일 사실', fs: 14, fw: 700, stroke: INFO, color: INFO, op: a }); check(296, 330, 8, a);
      card(160, 380, 280, 36, { rx: 18, text: '비교·인과 분석', fs: 14, fw: 700, stroke: WARN, color: WARN, op: fade(u, 1.0) });
      grow(300, 380, 430, 340, E(u, 1.3, 2.0), WARN); } }

  // ---------- 3. multi ----------
  const SUBS = ['3분기 매출 수치는?', '경쟁사 3분기 동향은?', '3분기 마케팅 캠페인은?', '3분기 거시경제 지표는?'];
  function s3(t, c) { const { k, u } = c, st = cl(c).state;
    bubble(10, 60, QS.q3, { fs: 15 });
    card(110, 200, 170, 50, { rx: 10, text: 'decompose()', mono: true, fs: 15, fw: 800, stroke: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.4) : 1 });
    grow(80, 84, 100, 172, k === 0 ? E(u, 0.2, 0.6) : 1, MUT);
    if (k === 0) { tx(210, 270, '질문 1개 → sub-query N개', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    SUBS.forEach((q, i) => { const y = 70 + i * 80, a = k === 0 ? E(u, 1.4 + i * 0.2, 2.2 + i * 0.2) : 1; if (a <= 0) return;
      el('path', { d: `M195,200 C240,200 240,${y} ${lerp(195, 290, a)},${y}`, fill: 'none', stroke: WARN, 'stroke-width': 2 });
      if (a >= 0.6) card(400, y, 220, 38, { rx: 19, text: q, fs: 14, fw: 700, stroke: WARN, fill: WARNBG, s: k === 0 ? pop(u, 2.0 + i * 0.2, 0.4) : 1 }); });
    if (k === 0) return;
    // N회 검색
    const n = k === 1 ? 0 : k === 2 ? Math.min(4, Math.floor(E(u, 0.2, 2.2) * 4 + 0.001)) : 4;
    SUBS.forEach((q, i) => { const y = 70 + i * 80; if (i < n || k > 2) { grow(512, y, 560, y, 1, INFO); card(590, y, 52, 30, { rx: 5, text: `+3`, mono: true, fs: 14, fw: 800, stroke: INFO, fill: INFOBG }); } });
    if (k === 1) { tx(540, 380, 'sub-query 4개 — 매출 · 경쟁사 · 마케팅 · 거시경제', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4) }); return; }
    zone(650, 40, 290, 110, 'all_docs', { fill: SOFT });
    mono(670, 110, `검색 ${n}회`, { 'font-size': 22, 'font-weight': 800, fill: INFO });
    if (k === 2) return;
    // CoT 종합
    const a = k === 3 ? fade(u, 0.2) : 1;
    if (k === 3) zone(650, 170, 290, 150, 'CoT 종합 (예시 출력)', { fill: PANEL, stroke: WARN, op: a });
    if (k === 3) ['1) 매출 -12%', '2) 경쟁사 신제품', '3) 광고비 -30%'].forEach((s, i) => tx(668, 222 + i * 30, s, { 'font-size': 15, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.6 + i * 0.4) : 1 }));
    card(795, 350, 200, 34, { rx: 17, text: '판정: multi', mono: true, fs: 15, fw: 800, stroke: 'none', fill: WARN, color: PANEL, s: k === 3 ? pop(u, 1.8) : 1 });
    if (k === 4) { const g = E(u, 0.3, 1.5);
      el('rect', { x: 668, y: 200, width: 250, height: 14, rx: 3, fill: SOFT }); el('rect', { x: 668, y: 200, width: 250 * g, height: 14, rx: 3, fill: WARN });
      el('rect', { x: 668, y: 250, width: 250, height: 14, rx: 3, fill: SOFT }); el('rect', { x: 668, y: 250, width: 250 * g, height: 14, rx: 3, fill: WARN });
      tx(668, 192, '비용 8x (세 모드 중 최대)', { 'font-size': 14.5, 'font-weight': 800, fill: WARN }); tx(668, 242, '지연 3.5s (최대)', { 'font-size': 14.5, 'font-weight': 800, fill: WARN });
      tx(668, 300, '꼭 필요한 질문에만 태운다', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.6) }); } }

  // ---------- 4. 분류기 ----------
  const LAB = [['simple', '일반 상식 · 사전학습으로 답', GOOD], ['single', '사실 확인 · 1회 검색', INFO], ['multi', '비교 · 분석 · 인과', WARN]];
  const ROUTE = [['q1', '파이썬 리스트 정렬 방법은?', 0], ['q2', '우리 회사 휴가 정책은?', 1], ['q3', '3분기 매출 하락 원인을 분석해줘', 2], ['q4', '경쟁사 대비 작년 점유율 변화는?', 2]];
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { mono(480, 60, 'Mode = Literal["simple", "single", "multi"]', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.2) : 1 });
      LAB.forEach(([n, why, col], i) => { const x = 180 + i * 300, s = k === 0 ? pop(u, 0.6 + i * 0.3) : 1;
        card(x, 160, 200, 60, { rx: 30, text: n, mono: true, fs: 20, fw: 800, stroke: col, color: col, fill: PANEL, s });
        if (k === 1) { card(x, 260, 260, 44, { rx: 8, text: why, fs: 14.5, fw: 700, stroke: col, fill: SOFT, s: pop(u, 0.3 + i * 0.4) }); grow(x, 192, x, 236, E(u, 0.2 + i * 0.4, 0.6 + i * 0.4), col); } });
      if (k === 1) tx(480, 350, '이 기준 세 줄이 곧 분류기의 규칙집이다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      return; }
    // 질문 → 라벨
    const lx = 800;
    LAB.forEach(([n, , col], i) => card(lx + 60, 90 + i * 110, 140, 44, { rx: 22, text: n, mono: true, fs: 16, fw: 800, stroke: col, color: col }));
    const llmOn = k >= 2, mdlOn = k >= 3;
    card(470, 140, 200, 58, { rx: 10, stroke: ACC, fill: ACCBG, s: k === 2 ? pop(u, 0.1) : 1 });
    mono(470, 136, 'classify_with_llm', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); tx(470, 158, 'zero-shot · 호출당 ≈0.3x', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    if (mdlOn) { card(470, 300, 200, 58, { rx: 10, stroke: INFO, fill: INFOBG, s: k === 3 ? pop(u, 0.2) : 1 });
      mono(470, 296, 'classify_with_model', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' }); tx(470, 318, '학습 모델 · ≈0.01x', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    ROUTE.forEach(([id, q, li], i) => { const y = 70 + i * 90, a = k === 2 ? fade(u, 0.3 + i * 0.4) : 1;
      tx(20, y + 5, q.length > 13 ? q.slice(0, 13) + '…' : q, { 'font-size': 14, 'font-weight': 700, opacity: a });
      if (k === 2) dot([[230, y], [370, 140], [570, 140], [lx - 10, 90 + li * 110]], seg(u, 0.5 + i * 0.4, 1.4 + i * 0.4), LAB[li][2], 6);
      else { grow(230, y, 368, 140, 1, GRID, { plain: true, sw: 1.5 }); if (mdlOn) grow(230, y, 368, 300, 1, GRID, { plain: true, sw: 1.5 }); } });
    if (k >= 3) [140, 300].forEach((y, j) => { if (j === 1 && !mdlOn) return; LAB.forEach((_, li) => grow(572, y, lx - 10, 90 + li * 110, k === 3 && j === 1 ? E(u, 0.6, 1.4) : 1, GRID, { plain: true, sw: 1.5 })); });
    if (k === 2) { const done = Math.floor(clamp((u - 0.9) / 0.4 + 1, 0, 4)); mono(lx + 60, 400, `${done} / 4 판정`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); }
    if (k === 4) card(470, 400, 380, 34, { rx: 17, text: '구현이 달라도 돌려주는 라벨은 같다', fs: 15, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.4) });
    if (k === 5) { zone(20, 360, 940, 52, null, { fill: SOFT });
      [['simple', 'answer_simple()'], ['single', 'answer_single_hop()'], ['multi', 'answer_multi_hop()']].forEach(([n, f], i) => { const a = fade(u, 0.3 + i * 0.4);
        mono(40 + i * 310, 392, n, { 'font-size': 14.5, 'font-weight': 800, fill: LAB[i][2], opacity: a }); mono(110 + i * 310, 392, '→ ' + f, { 'font-size': 14, opacity: a }); }); } }

  // ---------- 5. 비용 ----------
  const TR = [0.3, 0.5, 0.2];
  function s5(t, c) { const { k, u } = c, x0 = 250, W = 560, X = (v) => x0 + W * v / 8;
    if (k === 0) { tx(30, 60, '트래픽 분포 (가정)', { 'font-size': 15, 'font-weight': 800 });
      let acc = 0; M.forEach((m, i) => { const w = 900 * TR[i] * E(u, 0.2 + i * 0.3, 0.9 + i * 0.3);
        el('rect', { x: 30 + 900 * acc, y: 80, width: w, height: 50, fill: m.col, opacity: 0.85 });
        if (w > 60) { mono(42 + 900 * acc, 112, `${m.key} ${TR[i] * 100}%`, { 'font-size': 15, 'font-weight': 800, fill: PANEL }); }
        acc += TR[i]; });
      M.forEach((m, i) => { const a = fade(u, 1.4 + i * 0.3), y = 200 + i * 60; mono(30, y, m.key, { 'font-size': 16, 'font-weight': 800, fill: m.col, opacity: a });
        mono(180, y, `COSTS ${m.cost.toFixed(1)}`, { 'font-size': 15, opacity: a }); mono(400, y, `LATENCY ${m.lat}s`, { 'font-size': 15, opacity: a }); });
      return; }
    const row = (y, name, v, col, g, lab) => { tx(30, y + 18, name, { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: x0, y, width: W, height: 26, rx: 4, fill: SOFT });
      el('rect', { x: x0, y, width: Math.max(2, (X(v) - x0) * g), height: 26, rx: 4, fill: col }); if (g > 0.6) mono(X(v) + 8 > 900 ? X(v) - 8 : X(v) + 8, y + 19, lab || `${v.toFixed(2)}x`, { 'font-size': 15, 'font-weight': 800, fill: X(v) + 8 > 900 ? PANEL : col, 'text-anchor': X(v) + 8 > 900 ? 'end' : 'start' }); };
    tx(940, 40, '평균 비용 (상대값)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    row(70, '항상 multi', 8, WARN, k === 1 ? E(u, 0.2, 1.0) : 1);
    row(120, '항상 single', 3, INFO, k === 1 ? E(u, 0.8, 1.6) : 1);
    if (k === 1) return;
    // 가중평균: 0.3·1 + 0.5·3 + 0.2·8
    const parts = M.map((m, i) => TR[i] * m.cost); let acc = 0;
    tx(30, 188, 'adaptive', { 'font-size': 15, 'font-weight': 800, fill: ACC }); el('rect', { x: x0, y: 170, width: W, height: 26, rx: 4, fill: SOFT });
    parts.forEach((p, i) => { const g = k === 2 ? E(u, 0.3 + i * 0.5, 0.8 + i * 0.5) : 1; el('rect', { x: X(acc), y: 170, width: (X(p) - x0) * g, height: 26, fill: M[i].col, opacity: 0.9 });
      if (k === 2) mono(X(acc) + 4, 222 + i * 22, `${TR[i]}×${M[i].cost} = ${p.toFixed(1)}`, { 'font-size': 14, 'font-weight': 700, fill: M[i].col, opacity: fade(u, 0.5 + i * 0.5) }); acc += p; });
    mono(X(k === 5 ? 3.7 : 3.4) + 8, 189, k === 5 ? '3.70x' : '3.40x', { 'font-size': 15, 'font-weight': 800, fill: k === 5 ? BAD : ACC, opacity: k === 2 ? fade(u, 1.9) : 1 });
    if (k === 2) return;
    // 지연 비교
    tx(940, 262, '평균 지연', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    [['항상 multi', 3.5, WARN], ['항상 single', 1.2, INFO], ['adaptive', 1.42, ACC]].forEach(([n, v, col], i) => { const y = 272 + i * 34, g = k === 3 ? E(u, 0.3 + i * 0.3, 1.1 + i * 0.3) : 1;
      tx(30, y + 16, n, { 'font-size': 14.5, 'font-weight': 700 }); el('rect', { x: x0, y, width: W * v / 3.5 * g, height: 20, rx: 4, fill: col, opacity: 0.8 });
      if (g > 0.6) mono(x0 + W * v / 3.5 + 8 > 900 ? x0 + W * v / 3.5 - 8 : x0 + W * v / 3.5 + 8, y + 16, `${v.toFixed(2)}s`, { 'font-size': 14, 'font-weight': 800, fill: x0 + W * v / 3.5 + 8 > 900 ? PANEL : col, 'text-anchor': x0 + W * v / 3.5 + 8 > 900 ? 'end' : 'start' }); });
    if (k === 4) {
      card(860, 228, 150, 38, { rx: 19, text: '비용 -57.5%', fs: 16, fw: 800, stroke: 'none', fill: GOOD, color: PANEL, s: pop(u, 0.3) });
      card(860, 396, 150, 34, { rx: 17, text: '지연 -59%', fs: 15, fw: 800, stroke: 'none', fill: GOOD, color: PANEL, s: pop(u, 0.9) }); }
    if (k === 5) { const g = E(u, 0.3, 1.2); el('rect', { x: X(3.4), y: 170, width: (X(0.3) - x0) * g, height: 26, fill: BAD, opacity: 0.8 });
      card(720, 222, 380, 36, { rx: 18, text: 'LLM 분류기 +0.3x → 3.70x < 8.00x', fs: 15, fw: 800, stroke: BAD, color: INK, fill: PANEL, s: pop(u, 1.0) }); } }

  const quiz = [
    { q: '"파이썬 리스트 정렬 방법은?"을 simple로 보낼 때 검색은 몇 번 하는가?',
      o: ['0번', '1번', '4번'], a: 0,
      why: '사전학습 지식으로 답할 수 있어 벡터 검색 없이 LLM만 부른다. 비용 1x, 지연 0.4초다.' },
    { q: 'single 분기가 알맞은 질문은 무엇인가?',
      o: ['3분기 매출 하락 원인 분석', '우리 회사 휴가 정책은?', '파이썬 리스트 정렬 방법'], a: 1,
      why: '사내 문서 한 번 조회로 답이 나오는 단일 사실 질문이다. top-3 문서를 한 번 회수한다.' },
    { q: 'multi 분기에서 "3분기 매출 하락 원인" 질문은 검색을 몇 번 하는가?',
      o: ['1번', '2번', '4번'], a: 2,
      why: 'decompose가 매출·경쟁사·마케팅·거시경제 sub-query 4개를 만들고 각각 검색한다.' },
    { q: 'LLM 분류기와 학습 모델 분류기의 공통점은 무엇인가?',
      o: ['호출 비용이 같다', 'simple / single / multi 중 하나를 돌려준다', '둘 다 벡터 DB를 검색한다'], a: 1,
      why: '구현은 달라도 같은 세 라벨을 내므로 뒤의 adaptive_rag 라우터는 구현을 몰라도 된다.' },
    { q: '트래픽이 simple 30% · single 50% · multi 20%일 때 adaptive의 평균 비용은 얼마인가?',
      o: ['3.00x', '3.40x', '8.00x'], a: 1,
      why: '0.3×1 + 0.5×3 + 0.2×8 = 3.4이다. 항상 multi를 쓰는 8x보다 57.5% 싸다.' },
  ];

  const summary = [
    '모든 질문에 다중 검색을 쓰면 비용 8x, 지연 3.5초가 든다.',
    '분류기가 질문을 simple, single, multi로 나눠 알맞은 길로만 보낸다.',
    '일반 상식은 검색 없이, 사내 사실은 1회 검색, 인과 분석은 쪼개서 4회 검색한다.',
    '트래픽 30/50/20%에서 평균 비용은 3.4x로, 분류기 0.3x를 더해도 8x의 절반 아래다.',
  ];
  const review = [
    { q: 'Adaptive RAG를 붙였는데 사내 규정 질문에서 지어낸 답이 늘었다. 먼저 의심할 것은?',
      o: ['multi 분기의 sub-query 수', '분류기가 사실 질문을 simple로 잘못 보내는 것', 'cost.py의 트래픽 가정'], a: 1,
      why: 'simple은 검색 없이 LLM만 쓴다. 사실 질문이 이 길로 가면 근거 없이 답하게 된다.' },
    { q: '하루 수백만 건이 들어오는 서비스에서 분류 비용까지 줄이고 싶다. 알맞은 선택은?',
      o: ['fine-tuned 분류 모델로 라우팅한다', '모든 질문을 multi로 보낸다', '분류기 프롬프트를 더 길게 쓴다'], a: 0,
      why: 'LLM 분류는 호출당 약 0.3x, 학습 모델은 약 0.01x다. 트래픽이 많을수록 차이가 커진다.' },
    { q: '트래픽이 바뀌어 multi 질문 비율이 크게 늘었다. 평균 비용은 어떻게 되나?',
      o: ['그대로 3.4x다', '줄어든다', '8x 쪽으로 올라간다'], a: 2,
      why: '평균은 트래픽 가중평균이라 8x인 multi의 비중이 커지면 평균도 따라 오른다.' },
  ];

  R.page({ title: 'Adaptive RAG 라우팅', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
