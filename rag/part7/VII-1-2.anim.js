/* VII-1-2 평가 지표 심화 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 같은 top-5 검색 결과(정답 doc_42 가 2등)를 네 가지 채점 방식으로 본다.
 * 숫자: 페이지 TOP_K·STEPS.calc 와, 코드대로 다시 계산한 값(HR 1.0, RR 0.5, NDCG 0.631, 가중 합 0.766).
 * LLM-as-Judge 점수(5·5·5·4)는 LLM 출력이라 "예시"로 표시한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const tag = (x, y, s, op) => pill(x, y, s, WARN, 1, { fs: 13.5, op: op ?? 1, fill: WARNBG });
  const DOCS = () => (typeof TOP_K === 'undefined' ? [] : TOP_K);
  const Q = () => (typeof QUERY === 'undefined' ? '' : QUERY);

  // top-5 목록 (왼쪽). o.hot: 강조할 순위, o.s(i): 등장 크기
  function list(x, y, o) { o = o || {}; const rows = DOCS();
    rows.forEach((d, i) => { const yy = y + i * 50, s = o.s ? o.s(i) : 1; if (s <= 0) return; const gold = d.relevant;
      const g = R.G(0, 0, 1, s);
      el('rect', { x, y: yy, width: 330, height: 40, rx: 7, fill: gold ? ACCBG : PANEL, stroke: gold ? ACC : GRID, 'stroke-width': gold ? 2.5 : 1.5 }, g);
      mono(x + 20, yy + 26, String(d.rank), { 'font-size': 15, 'font-weight': 800, fill: gold ? ACC : MUT, 'text-anchor': 'middle' }, g);
      mono(x + 40, yy + 26, d.id, { 'font-size': 14.5, 'font-weight': 700, fill: gold ? ACC : INK }, g);
      tx(x + 118, yy + 26, d.title.split(' — ')[1] || d.title, { 'font-size': 14.5, fill: gold ? ACC : INK }, g); }); }

  // ---------- 1. Hit Rate ----------
  function strip(x, y, rank, score, op) { // 5칸 + 바깥 1칸, 정답 자리를 칠한다
    for (let i = 0; i < 6; i++) { const on = rank === i + 1 || (rank === '없음' && i === 5);
      el('rect', { x: x + i * 30 + (i === 5 ? 12 : 0), y, width: 26, height: 26, rx: 4, fill: on ? ACC : i === 5 ? 'none' : SOFT, stroke: i === 5 ? GRID : 'none', 'stroke-dasharray': i === 5 ? '3 3' : null, opacity: op }); }
    el('line', { x1: x + 152, y1: y - 6, x2: x + 152, y2: y + 32, stroke: INK, 'stroke-width': 2, opacity: op });
    mono(x + 220, y + 19, score.toFixed(1), { 'font-size': 18, 'font-weight': 800, fill: score ? GOOD : BAD, opacity: op }); }
  function s1(t, c) { const { k, u } = c, calc = c.beat.calc;
    pill(200, 34, 'Q  ' + Q(), INK, 1, { fs: 15 });
    list(40, 66, { s: (i) => (k === 0 ? pop(u, 0.2 + i * 0.15) : 1) });
    // k=5 창
    el('path', { d: 'M30,66 H22 V312 H30', fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: k === 0 ? fade(u, 1.2) : 1 });
    tx(16, 196, 'top-5', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', transform: 'rotate(-90 16 196)', opacity: k === 0 ? fade(u, 1.2) : 1 });
    if (k === 0) { card(640, 120, 380, 54, { rx: 10, text: 'gt_id in top_k[:5]  →  1.0 / 0.0', mono: true, fs: 15, stroke: INK, s: pop(u, 1.4) });
      note(470, 190, '맞으면 1, 아니면 0 — 이진 판정 한 줄', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 1) { dot([[60, 86], [60, 136]], seg(u, 0.2, 1.0), WARN, 8);
      if (u > 1.0) { pill(640, 120, 'doc_42 를 2등에서 찾음', ACC, pop(u, 1.0), { fs: 15, fill: ACCBG });
        mono(640, 190, 'Hit Rate@5 = ' + (u > 1.4 ? '1.0' : '0.0'), { 'font-size': 22, 'font-weight': 800, fill: u > 1.4 ? GOOD : MUT, 'text-anchor': 'middle' }); } return; }
    // 정답 위치를 바꿔 보는 표
    tx(470, 70, '정답이 몇 등이든', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    mono(470 + 77, 100, '1  2  3  4  5', { 'font-size': 14, fill: MUT, style: 'white-space:pre' });
    calc.ifRank.forEach((r, i) => { const prevN = c.prev && c.prev.calc ? c.prev.calc.ifRank.length : 0, isNew = i >= prevN, op = isNew ? fade(u, 0.3 + (i - prevN) * 0.4) : 1;
      const y = 116 + i * 48; tx(470, y + 19, (r.rank === '없음' ? '밖' : r.rank + '등'), { 'font-size': 15, 'font-weight': 700, opacity: op });
      strip(540, y, r.rank, r.score, op); });
    if (k === 3) note(470, 340, 'N개 쿼리의 0/1을 평균하면 시스템 Hit Rate', fade(u, 1.4), { fill: MUT });
    if (k === 4) { note(470, 340, '1등과 5등이 똑같이 1점 — 순위 정보가 버려진다', fade(u, 1.2), { fill: BAD });
      note(470, 370, '순위 품질은 MRR로 잰다', fade(u, 1.8), { fill: MUT }); } }

  // ---------- 2. MRR ----------
  function s2(t, c) { const { k, u } = c, calc = c.beat.calc, pc = c.prev && c.prev.calc ? c.prev.calc.curve.length : 0;
    pill(200, 34, 'Q  ' + Q(), INK, 1, { fs: 15 });
    list(40, 66, {});
    const ax = R.axes(500, 70, 400, 250, { x: [0.5, 5.5], y: [0, 1], xt: [1, 2, 3, 4, 5], yt: [0, 0.5, 1], xl: '정답의 순위', yl: 'RR = 1 / 순위', grid: true });
    const pts = calc.curve.map((r) => [r.rank, r.rr]);
    R.line(ax, pts, k === 0 ? 1 : clamp(((pts.length - 1) - (pc - 1) * (1 - E(u, 0.2, 1.4))) / Math.max(1, pts.length - 1)), ACC, { op: 0.6 });
    calc.curve.forEach((r, i) => { const op = i >= pc ? fade(u, 0.2 + (i - pc) * 0.35) : 1, cx = ax.X(r.rank), cy = ax.Y(r.rr), real = r.rank === calc.firstRelevantRank;
      el('circle', { cx, cy, r: real ? 9 : 6, fill: real ? ACC : PANEL, stroke: ACC, 'stroke-width': 2.5, opacity: op });
      mono(cx + 14, r.rank === 1 ? cy + 5 : cy - 10, r.rr.toFixed(r.rr === 1 || r.rr === 0.5 || r.rr === 0.25 || r.rr === 0.2 ? (r.rr === 1 ? 1 : 2) : 3), { 'font-size': 14, 'font-weight': 700, fill: real ? ACC : INK, opacity: op }); });
    if (k === 0) note(40, 340, '정답이 처음 나오는 순위 i를 찾아 1/i를 돌려준다', fade(u, 1.2), { fill: MUT });
    if (k === 1) { grow(372, 136, 470, ax.Y(0.5), E(u, 0.3, 1.0), ACC);
      mono(40, 350, 'RR = 1 / 2 = 0.500', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      note(40, 384, '한 계단 내려갔을 뿐인데 점수가 반으로', fade(u, 1.6), { fill: BAD }); }
    if (k === 2) note(40, 350, '쿼리마다 RR을 구해 평균하면 MRR', fade(u, 1.4), { fill: MUT });
    if (k === 3) { note(40, 350, '1 → 0.5 → 0.333 → 0.25 → 0.2', fade(u, 0.6), { fill: INK, class: 'mono' });
      note(40, 384, '첫 정답만 본다 — 정답이 여럿이면 NDCG', fade(u, 1.6), { fill: MUT }); } }

  // ---------- 3. NDCG ----------
  const DISC = [1, 0.631, 0.5, 0.431, 0.387];
  function s3(t, c) { const { k, u } = c, calc = c.beat.calc, rows = calc.dcgRows, pn = c.prev && c.prev.calc ? c.prev.calc.dcgRows.length : 0;
    const X0 = 170, CW = 120, BY = 300, BH = 160;
    tx(40, 60, '순위', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(40, 102, 'rels', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    tx(40, BY - BH / 2, '1 / log₂(i+1)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    calc.rels.forEach((v, i) => { const cx = X0 + i * CW + CW / 2;
      mono(cx, 60, String(i + 1), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      card(cx, 96, 52, 36, { rx: 6, text: String(v), mono: true, fs: 17, fw: 800, stroke: v ? ACC : GRID, color: v ? ACC : MUT, fill: v ? ACCBG : PANEL, s: k === 0 ? pop(u, 0.2 + i * 0.1) : 1 });
      // 할인 막대 (회색 틀) + gain (칠함)
      const h = BH * DISC[i], op0 = k === 0 ? fade(u, 0.8 + i * 0.12) : 1;
      el('rect', { x: cx - 30, y: BY - h, width: 60, height: h, rx: 4, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op0 });
      mono(cx, BY + 22, DISC[i].toFixed(3), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: op0 });
      const seen = i < rows.length, fresh = i >= pn, f = !seen ? 0 : fresh ? E(u, 0.4 + (i - pn) * 0.4, 1.2 + (i - pn) * 0.4) : 1;
      if (seen && v) { el('rect', { x: cx - 30, y: BY - h * f, width: 60, height: h * f, rx: 4, fill: ACC });
        mono(cx, BY - h - 10, 'gain ' + (DISC[i] * f).toFixed(3), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); }
      if (seen && !v && f > 0) mono(cx, BY - h - 10, 'gain 0', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: f }); });
    // 누적 DCG
    const cum = tween(c.prev && c.prev.calc ? c.prev.calc.dcg : 0, calc.dcg, u);
    mono(40, 370, `DCG@5 = ${cum.toFixed(3)}`, { 'font-size': 18, 'font-weight': 800, fill: ACC });
    if (k >= 1) mono(300, 370, 'IDCG@5 = 1.000', { 'font-size': 18, 'font-weight': 800, fill: INK, opacity: k === 1 ? fade(u, 1.4) : 1 });
    if (k === 1) note(560, 370, '이상적 순위 [1,0,0,0,0]이면 1/log₂2 = 1', fade(u, 1.8), { fill: MUT, 'font-size': 14 });
    if (k === 2) note(560, 370, '3·4등은 rel 0 — 누적이 멈춘다', fade(u, 1.4), { fill: MUT });
    if (k === 3) { mono(560, 370, 'NDCG@5 = 0.631 / 1.000 = 0.631', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) });
      note(560, 404, '정답을 1등으로 올리면 1.0이 된다', fade(u, 1.8), { fill: MUT }); } }

  // ---------- 4. LLM-as-Judge ----------
  const DIMS = ['정확성', '완전성', '관련성', '명료성'];
  function s4(t, c) { const { k, u } = c, calc = c.beat.calc, inp = calc.input;
    // 판정관
    card(480, 200, 150, 90, { rx: 14, text: 'gpt-4o\n판정관', fs: 17, fw: 800, stroke: INFO, color: INFO, fill: INFOBG, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { note(390, 290, 'OpenAI client 준비 — 아직 채점 전', fade(u, 1.0), { fill: MUT }); }
    // 왼쪽: 채점 지시문 (질문·정답·답변 칸)
    if (k >= 2 || k === 1) { const op = k === 1 ? fade(u, 1.6) : 1;
      tx(40, 74, 'JUDGE_PROMPT', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: op });
      [['[질문]', inp.question], ['[정답]', inp.gt], ['[답변]', '1년 이상 근속 시 연차 15일 … 리프레시 3일']].forEach(([h, v], i) => { const y = 96 + i * 66;
        el('rect', { x: 40, y, width: 330, height: 54, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': k >= 2 ? null : '5 4', opacity: op });
        mono(52, y + 22, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
        const f = k === 2 ? fade(u, 0.3 + i * 0.4) : k > 2 ? 1 : 0;
        if (f > 0) tx(52, y + 44, v.length > 21 ? v.slice(0, 21) + '…' : v, { 'font-size': 14.5, opacity: f }); });
      if (k >= 2) grow(372, 200, 402, 200, k === 2 ? E(u, 1.6, 2.0) : 1, MUT); }
    // 오른쪽: 기준 4개 × 1~5점
    if (k >= 1) { DIMS.forEach((d, i) => { const y = 100 + i * 64, op = k === 1 ? fade(u, 0.2 + i * 0.2) : 1, r = calc.rubric[i], sc = r ? r.score : 0;
        const pr = c.prev && c.prev.calc && c.prev.calc.rubric[i] ? c.prev.calc.rubric[i].score : 0;
        tx(600, y + 6, d, { 'font-size': 15, 'font-weight': 700, opacity: op });
        for (let j = 0; j < 5; j++) { const on = j < sc, fresh = on && !(j < pr), f = fresh ? pop(u, 0.4 + (i % 2) * 0.5 + j * 0.12) : on ? 1 : 0;
          el('circle', { cx: 680 + j * 30, cy: y, r: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2, opacity: op });
          if (f > 0) el('circle', { cx: 680 + j * 30, cy: y, r: 10 * f, fill: j === 4 && sc === 4 ? OFF : ACC }); }
        if (sc) mono(840, y + 6, `${sc} / 5`, { 'font-size': 16, 'font-weight': 800, fill: sc === 5 ? GOOD : WARN, opacity: fade(u, sc === pr ? 0 : 1.2) }); });
      grow(556, 200, 586, 200, k >= 4 ? 1 : 0, MUT); }
    if (k === 1) note(600, 370, '1~5점 int만 받도록 스키마로 묶는다', fade(u, 1.8), { fill: MUT });
    if (k === 3) { pill(480, 300, 'temperature = 0', INK, pop(u, 0.3), { mono: true, fs: 14 }); pill(480, 340, 'JSON 출력 강제', INK, pop(u, 0.6), { fs: 14 });
      note(40, 380, '같은 답을 다시 채점해도 흔들리지 않게', fade(u, 1.4), { fill: MUT }); }
    if (k >= 4) tag(700, 370, '채점 결과 (예시)', k === 4 ? fade(u, 1.6) : 1);
    if (k === 5) { mono(40, 380, '(5 + 5 + 5 + 4) / 4 = 4.75 / 5', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); } }

  // ---------- 5. 종합 ----------
  const MODS = [['Hit Rate@5', 0.3], ['MRR', 0.3], ['NDCG@5', 0.2], ['LLM-Judge', 0.2]];
  const BX = 120, BW = 720;
  function s5(t, c) { const { k, u } = c, calc = c.beat.calc, ms = calc.metrics;
    if (k === 0) { ['hit_rate', 'mrr', 'ndcg', 'llm_judge'].forEach((s, i) => card(180 + i * 200, 140, 170, 52, { rx: 10, text: s, mono: true, fs: 16, stroke: INK, s: pop(u, 0.2 + i * 0.2) }));
      note(480, 230, '앞 네 단계의 채점 함수를 한 파일로 모은다', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT }); return; }
    // 가중치 칸: 폭 = 가중치
    let x = BX; tx(BX, 54, '가중치 칸 (폭 = 가중치), 칠한 만큼 = 값 × 가중치', { 'font-size': 14.5, fill: MUT, 'font-weight': 600 });
    MODS.forEach(([name, w], i) => { const cw = BW * w, op = k === 1 ? fade(u, 0.2 + i * 0.25) : 1, m = ms[i] || { value: 0 };
      el('rect', { x, y: 100, width: cw - 4, height: 44, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
      tx(x + 8, 90, `${name} · ${w}`, { 'font-size': 14, 'font-weight': 700, opacity: op });
      if (k >= 2) { const f = k === 2 ? E(u, 0.2 + i * 0.3, 1.0 + i * 0.3) : 1, fw = (cw - 4) * m.value * f;
        el('rect', { x, y: 100, width: fw, height: 44, rx: 6, fill: i === 3 ? WARN : ACC, opacity: 0.85 });
        if (m.value < 1) el('rect', { x: x + fw, y: 100, width: (cw - 4) - fw, height: 44, rx: 6, fill: 'none' });
        mono(x + 8, 166, `${m.value} × ${w}`, { 'font-size': 14, fill: MUT, opacity: f }); }
      x += cw; });
    if (k === 2) tag(BX + BW - 60, 196, 'Judge 0.95 = 4.75/5 (예시)', fade(u, 1.8));
    if (k >= 3) { // 기여분을 이어 붙인 합계 막대
      const parts = ms.map((m, i) => m.value * MODS[i][1]); let px = BX; const yb = 220, f = k === 3 ? E(u, 0.2, 1.6) : 1;
      tx(BX, yb - 10, '합계 막대', { 'font-size': 14.5, fill: MUT, 'font-weight': 600 });
      el('rect', { x: BX, y: yb, width: BW, height: 30, rx: 6, fill: SOFT });
      parts.forEach((p, i) => { const w = BW * p * clamp(f * 4 - i); if (w <= 0) return; el('rect', { x: px, y: yb, width: w, height: 30, fill: i === 3 ? WARN : ACC, opacity: 0.6 + 0.1 * i, stroke: PANEL, 'stroke-width': 1.5 }); px += BW * p; });
      const tot = parts.reduce((a, b) => a + b, 0);
      mono(BX + BW * tot * f + 10, yb + 22, (tot * f).toFixed(3), { 'font-size': 18, 'font-weight': 800, fill: INK });
      if (k === 3) mono(BX, 290, '0.30 + 0.15 + 0.126 + 0.19 = 0.766', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k >= 4) { // 등급 띠
      const yb = 290, bands = [[0, 0.6, 'C'], [0.6, 0.7, 'B'], [0.7, 0.8, 'B+'], [0.8, 0.9, 'A'], [0.9, 1, 'A+']], tot = 0.766;
      bands.forEach(([a, b, g], i) => { const op = k === 4 ? fade(u, 0.2 + i * 0.12) : 1, on = g === 'B+';
        el('rect', { x: BX + BW * a, y: yb, width: BW * (b - a) - 3, height: 34, rx: 5, fill: on ? ACCBG : SOFT, stroke: on ? ACC : 'none', 'stroke-width': 2, opacity: op });
        tx(BX + BW * (a + b) / 2, yb + 23, g, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? ACC : MUT, opacity: op });
        mono(BX + BW * a, yb + 52, a.toFixed(1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); });
      grow(BX + BW * tot, 252, BX + BW * tot, yb - 2, k === 4 ? E(u, 0.8, 1.3) : 1, ACC);
      if (k === 4) note(BX + 216, 395, 'MRR 칸이 절반 비었다 — 정답을 1등으로 올릴 리랭커를 검토', fade(u, 1.6), { fill: WARN, 'font-size': 14.5 });
      if (k === 4) el('rect', { x: BX + 216 + 108, y: 100, width: 104, height: 44, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) }); }
    if (k === 5) [['매 빌드', 'HR·MRR·NDCG', '수초'], ['주요 변경 시', '+ LLM-Judge', '수분, ~$1'], ['분기별', '+ 사람 평가 100건', '수시간']].forEach(([a, b, cst], i) => {
      const cx = 165 + i * 315, s = pop(u, 0.2 + i * 0.35); card(cx, 385, 290, 48, { rx: 10, stroke: i === 2 ? GOOD : INK, sw: 2, s });
      tx(cx - 132, 391, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) });
      tx(cx - 30, 391, b + ' · ' + cst, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.35) }); }); }

  const quiz = [
    { q: '정답 문서가 top-5 중 5등에 있을 때 Hit Rate@5는 얼마인가?',
      o: ['0.2', '1.0', '0.0'], a: 1,
      why: 'Hit Rate는 top-k 안에 정답이 있는지만 본다. 1등이든 5등이든 1.0이라 순위 정보는 버려진다.' },
    { q: '정답이 2등에 있으면 역순위(RR)는 얼마인가?',
      o: ['0.500', '0.631', '0.200'], a: 0,
      why: 'RR은 정답이 처음 나온 순위의 역수다. 1/2 = 0.500으로, 한 계단 내려간 것만으로 점수가 반이 된다.' },
    { q: 'rels = [0,1,0,0,0]일 때 NDCG@5가 0.631인 이유는 무엇인가?',
      o: ['정답이 5개 중 1개라서', '2등 자리의 할인 1/log₂3 = 0.631을 이상적 DCG 1.000으로 나눠서', '3등 이후가 모두 0이라서'], a: 1,
      why: '2등의 gain은 1/log₂(3) = 0.631이고, 정답이 1등인 이상적 순위의 DCG는 1이다. 0.631 / 1.000 = 0.631이다.' },
    { q: '자동 지표 대신 LLM-as-Judge를 쓰는 이유는 무엇인가?',
      o: ['호출 비용이 더 싸서', '정답 id 일치만으로는 못 보는 답변의 정확성·완전성·명료성을 채점하려고', '검색 순위를 더 정확히 재려고'], a: 1,
      why: 'Hit Rate·MRR·NDCG는 정답 문서 id만 본다. 최종 답의 품질은 강한 LLM에게 기준별 1~5점으로 묻는다.' },
    { q: 'HR 1.0, MRR 0.5, NDCG 0.631, Judge 0.95를 가중치 0.3·0.3·0.2·0.2로 합하면 몇 등급인가?',
      o: ['A (0.8 이상)', 'B (0.6~0.7)', 'B+ (0.7~0.8)'], a: 2,
      why: '0.30 + 0.15 + 0.126 + 0.19 = 0.766이라 B+다. 가장 많이 깎인 곳은 MRR 칸이라 리랭커를 먼저 검토한다.' },
  ];

  const summary = [
    'Hit Rate는 top-k 안에 정답이 있는지만 보고 순위는 묻지 않는다.',
    'MRR은 첫 정답 순위의 역수라 2등이면 0.5로 반이 된다.',
    'NDCG는 순위마다 1/log₂(i+1)로 깎아 더하고 이상적 순위로 나눈다. 2등이면 0.631이다.',
    '네 지표를 0.3·0.3·0.2·0.2로 합하면 0.766, B+이고 MRR이 가장 많이 깎였다.',
  ];
  const review = [
    { q: 'Hit Rate@5는 0.98인데 사용자들이 "엉뚱한 문서가 먼저 나온다"고 한다. 먼저 재 볼 지표는 무엇인가?',
      o: ['Hit Rate@10', 'MRR', 'LLM-as-Judge'], a: 1,
      why: 'Hit Rate는 정답이 몇 등인지 보지 않는다. 정답이 아래쪽에 깔리는지는 순위의 역수를 쓰는 MRR이 드러낸다.' },
    { q: '한 질문에 정답 문서가 셋이고 관련도 등급(3·2·1)도 있다. 알맞은 지표는 무엇인가?',
      o: ['NDCG', 'MRR', 'Hit Rate'], a: 0,
      why: 'MRR은 첫 정답만, Hit Rate는 있고 없음만 본다. 여러 정답과 등급을 순위 할인과 함께 반영하는 것은 NDCG다.' },
    { q: '매 PR마다 평가를 돌려야 하는데 예산이 빠듯하다. 매번 돌릴 조합은 무엇인가?',
      o: ['사람 평가 100건', 'LLM-as-Judge 전체', 'Hit Rate·MRR·NDCG'], a: 2,
      why: '자동 지표는 수초면 끝나 매 빌드에 맞다. LLM-Judge는 주요 변경 때, 사람 평가는 분기별로 돌린다.' },
  ];

  R.page({ title: '검색 채점 4가지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
