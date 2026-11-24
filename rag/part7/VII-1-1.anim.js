/* VII-1-1 RAGAS 평가 프레임워크 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 질문·답·context 문서를 실제 문장으로 놓고, claim 으로 쪼개 근거와 선으로 잇는다. 점수는 분수 → 막대.
 * 숫자: 페이지 STEPS 의 scores·detail 과, 공식대로 다시 계산한 값(3/3 = 1.00, (1+2/3)/2 = 0.83, 3/4 = 0.75, 평균 0.87).
 * LLM 이 내는 것(claim 판정, 역생성 질문, 코사인 0.91·0.87·0.86)은 예시 값이라 그림에도 "예시"를 붙인다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const tag = (x, y, s, op) => pill(x, y, s, WARN, 1, { fs: 13.5, op: op ?? 1, fill: WARNBG });
  // 문서 한 장 (접힌 귀퉁이)
  function paper(x, y, w, h, title, lines, o) { o = o || {}; const op = o.op ?? 1;
    el('path', { d: `M${x},${y} H${x + w - 22} L${x + w},${y + 22} V${y + h} H${x} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    el('path', { d: `M${x + w - 22},${y} V${y + 22} H${x + w}`, fill: SOFT, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    tx(x + 16, y + 28, title, { 'font-size': 15, 'font-weight': 800, opacity: op });
    lines.forEach((s, i) => tx(x + 16, y + 58 + i * 26, s, { 'font-size': 15, opacity: op, fill: INK })); }
  // 점수 막대: 분수 글자 + 막대 + 값
  function scoreBar(x, y, w, v, u, label, o) { o = o || {}; const f = u;
    tx(x, y - 10, label, { 'font-size': 15, 'font-weight': 700 });
    el('rect', { x, y, width: w, height: 22, rx: 5, fill: SOFT });
    el('rect', { x, y, width: Math.max(2, w * v * f), height: 22, rx: 5, fill: o.col || ACC });
    if (o.th) { const tx0 = x + w * o.th; el('line', { x1: tx0, y1: y - 4, x2: tx0, y2: y + 26, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 3' }); }
    mono(x + w + 12, y + 17, (v * f).toFixed(2), { 'font-size': 18, 'font-weight': 800, fill: o.col || ACC }); }

  // ---------- 1. Faithfulness ----------
  const ANS = '1년 이상 근속 시 연차 15일 + 리프레시 3일이 부여됩니다.';
  const CLAIMS1 = [['1년 이상 근속 시', 0], ['연차 15일 부여', 1], ['리프레시 3일 부여', 2]];
  const CTX1 = ['1년 이상 근속 시', '연차 15일', '+ 리프레시 3일 부여.'];
  function s1(t, c) { const { k, u } = c;
    // 질문·답
    card(250, 58, 420, 44, { rx: 8, text: 'Q   연차 정책 알려줘.', fs: 16, fw: 700, stroke: INK, s: k === 0 ? pop(u, 0.2) : 1 });
    const ans = k === 0 ? typed(ANS, E(u, 0.6, 2.2)) : ANS;
    el('rect', { x: 40, y: 98, width: 420, height: 70, rx: 8, fill: k >= 2 ? SOFT : PANEL, stroke: GRID, 'stroke-width': 2, opacity: k === 0 ? fade(u, 0.5) : 1 });
    tx(56, 124, 'A', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: k === 0 ? fade(u, 0.5) : 1 });
    tx(80, 124, ans.slice(0, 18), { 'font-size': 16 }); if (ans.length > 18) tx(80, 151, ans.slice(18), { 'font-size': 16 });
    // context 문서
    const cx0 = k === 1 ? lerp(640, 600, E(u, 0.2, 1.2)) : 600;
    if (k >= 1) paper(cx0, 50, 320, 150, '인사규정 3장 (context)', CTX1, { op: k === 1 ? fade(u, 0.2, 0.8) : 1 });
    if (k === 1) note(600, 236, '답의 모든 주장은 이 문서로 검사한다', fade(u, 1.4), { fill: MUT });
    // claim 목록 칸
    note(40, 222, 'claim 목록', 1, { fill: MUT });
    el('rect', { x: 40, y: 236, width: 520, height: 64, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    if (k <= 1) sub(300, 274, '아직 비어 있다 — 답을 쪼개기 전', k === 0 ? fade(u, 2.2) : 1, { 'font-size': 15 });
    if (k >= 2) {
      CLAIMS1.forEach(([s, j], i) => { const x = 128 + i * 172, f = k === 2 ? E(u, 0.2 + i * 0.25, 0.9 + i * 0.25) : 1;
        card(lerp(150 + i * 120, x, f), lerp(210, 268, f), 156, 40, { rx: 20, text: s, fs: 14.5, fw: 700, stroke: ACC, color: ACC, fill: ACCBG });
        const lu = k === 2 ? seg(u, 1.2 + i * 0.25, 1.9 + i * 0.25) : 1;
        if (lu > 0) { const tyy = 108 + j * 26; el('path', { d: `M${x + 78},${268} C${x + 160},${268} ${560},${tyy} ${cx0 + 14},${tyy - 5}`, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': lu < 1 ? `${lu * 400} 400` : null, opacity: 0.8 });
          check(x + 62, 248, 8, lu >= 1 ? 1 : 0); } });
      if (k === 2) tag(470, 330, 'LLM 판정 (예시)', fade(u, 2.1));
    }
    if (k === 3) { const f = E(u, 0.3, 1.5);
      mono(40, 352, '뒷받침된 claim 3 / 전체 claim 3', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      scoreBar(600, 340, 230, 1, f, 'faithfulness', { col: GOOD });
      note(600, 398, '지어낸 주장이 하나도 없다', fade(u, 1.8), { fill: GOOD }); } }

  // ---------- 2. Context Precision ----------
  const RET = [['인사규정 3장: 연차 15일 + 리프레시 3일', true], ['인사규정 4장: 출장비 정산 방식', false], ['인사규정 3장: 1년 이상 근속자 기준', true]];
  function s2(t, c) { const { k, u } = c;
    pill(170, 40, 'Q  연차 정책 알려줘.', INK, 1, { fs: 15 });
    tx(40, 86, '검색기 top-3', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    RET.forEach(([s, ok], i) => { const y = 120 + i * 62, f = k === 0 ? E(u, 0.3 + i * 0.35, 1.0 + i * 0.35) : 1;
      const bad = k >= 1 && !ok, op = bad ? 0.75 : 1;
      const g = R.G(lerp(500, 0, f), 0, 1, f);
      el('rect', { x: 40, y: y - 22, width: 420, height: 44, rx: 8, fill: bad ? BADBG : PANEL, stroke: bad ? BAD : k >= 1 ? GOOD : GRID, 'stroke-width': 2, opacity: op }, g);
      el('rect', { x: 40, y: y - 22, width: 42, height: 44, rx: 8, fill: INK }, g);
      mono(61, y + 6, '#' + (i + 1), { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }, g);
      tx(94, y + 6, s, { 'font-size': 15, fill: bad ? BAD : INK }, g);
      if (k >= 1) { const s0 = k === 1 ? pop(u, 0.4 + i * 0.35) : 1; if (ok) check(440, y, 9, s0); else cross(440, y, 8, s0); } });
    if (k === 1) note(40, 330, '출장비 정산은 연차 질문과 무관하다 → 관련 ✓ 2 · 비관련 ✗ 1', fade(u, 1.6));
    if (k === 1) tag(380, 370, 'LLM 판정 (예시)', fade(u, 1.9));
    // 오른쪽: rank 별 precision@k
    if (k >= 2) { const X = 520;
      tx(X, 86, 'rank 마다 precision@k', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const rows = [['P@1', '1 / 1', '1.00', true], ['P@2', '1 / 2', '0.50', false], ['P@3', '2 / 3', '0.67', true]];
      rows.forEach(([a, b, v, used], i) => { const y = 120 + i * 62, f = k === 2 ? fade(u, 0.3 + i * 0.4) : 1;
        mono(X, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: f });
        mono(X + 64, y + 6, b, { 'font-size': 16, opacity: f, fill: MUT });
        card(X + 190, y, 70, 36, { rx: 6, text: v, mono: true, fs: 16, fw: 800, stroke: used ? ACC : GRID, color: used ? ACC : OFF, fill: used ? ACCBG : PANEL, op: f });
        if (!used) tx(X + 240, y + 6, '비관련 자리라 빼고', { 'font-size': 14, fill: MUT, opacity: f }); }); }
    if (k === 3) { const f = E(u, 0.3, 1.4);
      mono(520, 314, '(1.00 + 0.67) / 2', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.1) });
      scoreBar(520, 356, 240, 0.8333, f, 'context precision', { col: ACC });
      note(40, 330, '같은 3건이라도 순서가 점수를 바꾼다', fade(u, 1.2), { fill: MUT });
      [['출장비가 3등이면', '1.00', GOOD], ['출장비가 1등이면', '0.58', BAD]].forEach(([a, v, col], i) => { const op = fade(u, 1.6 + i * 0.4);
        tx(40, 366 + i * 30, a, { 'font-size': 15, opacity: op }); mono(190, 366 + i * 30, v, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op }); }); } }

  // ---------- 3. Context Recall ----------
  const GT3 = ['1년 이상 근속자', '연차 15일', '리프레시 3일', '병가 별도 5일'];
  const CTX3 = ['1년 이상 근속자 연차 15일', '리프레시 3일 별도 부여'];
  const GTSENT = '1년 이상 근속자에게 연차 15일과 리프레시 3일, 병가 별도 5일이 부여된다.';
  function s3(t, c) { const { k, u } = c;
    pill(170, 40, 'Q  연차 정책 알려줘.', INK, 1, { fs: 15 });
    // ground_truth 칸
    tx(40, 92, 'ground_truth (정답 문장)', { 'font-size': 15, 'font-weight': 700, fill: k === 0 ? ACC : MUT });
    el('rect', { x: 40, y: 104, width: 520, height: 72, rx: 10, fill: k >= 2 ? PANEL : 'none', stroke: k === 0 ? ACC : GRID, 'stroke-width': 2, 'stroke-dasharray': k >= 2 ? null : '6 5' });
    if (k <= 1) sub(300, 146, 'recall 은 정답이 있어야 잰다 — 이 칸이 필수', k === 0 ? fade(u, 0.6) : 1, { 'font-size': 15, fill: k === 0 ? ACC : MUT });
    if (k >= 2) { const s = k === 2 ? typed(GTSENT, E(u, 0.2, 1.8)) : GTSENT;
      tx(56, 134, s.slice(0, 22), { 'font-size': 15.5 }); if (s.length > 22) tx(56, 160, s.slice(22), { 'font-size': 15.5 }); }
    // 검색된 context 2건
    if (k >= 1) CTX3.forEach((s, i) => { const f = k === 1 ? E(u, 0.2 + i * 0.4, 1.0 + i * 0.4) : 1, y = 128 + i * 64;
      card(lerp(800, 770, f), y, 300, 48, { rx: 8, text: s, fs: 15, fw: 600, stroke: INFO, fill: INFOBG, op: f }); });
    if (k >= 1) tx(620, 92, '검색된 context 2건', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: k === 1 ? fade(u, 0.2) : 1 });
    if (k === 1) note(620, 260, '이것으로 정답을 다 쓸 수 있을까?', fade(u, 1.5), { fill: MUT });
    if (k === 2) note(40, 214, '정답에는 병가 5일까지 들어 있다', fade(u, 1.9), { fill: WARN });
    // 정답 claim 4개와 커버리지
    if (k >= 3) { GT3.forEach((s, i) => { const x = 112 + i * 140, y = 270, f = k === 3 ? E(u, 0.1 + i * 0.15, 0.7 + i * 0.15) : 1, miss = i === 3;
        card(lerp(x - 30, x, f), lerp(200, y, f), 130, 40, { rx: 20, text: s, fs: 14.5, fw: 700, stroke: miss && (k > 3 || u > 1.6) ? BAD : ACC, color: miss && (k > 3 || u > 1.6) ? BAD : ACC, fill: miss && (k > 3 || u > 1.6) ? BADBG : ACCBG });
        const lu = k === 3 ? seg(u, 0.9 + i * 0.2, 1.5 + i * 0.2) : 1; if (lu <= 0) return;
        if (!miss) { const ty = i < 2 ? 128 : 192; el('path', { d: `M${x},${y - 20} C${x},${210} ${600},${ty} ${620},${ty}`, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': lu < 1 ? `${lu * 500} 500` : null, opacity: 0.8 }); check(x + 52, y - 26, 8, lu >= 1 ? 1 : 0); }
        else { el('path', { d: `M${x + 65},${y} H${lerp(x + 65, 800, lu)}`, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); if (lu >= 1) { cross(820, y, 9, 1); pill(890, y, 'MISSING', BAD, 1, { fs: 13.5, fill: BADBG }); } } });
      if (k === 3) tag(470, 330, 'claim 판정 (예시)', fade(u, 2.2)); }
    if (k === 4) { const f = E(u, 0.3, 1.4);
      mono(40, 356, '찾은 claim 3 / 정답 claim 4', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      scoreBar(520, 344, 240, 0.75, f, 'context recall', { col: WARN });
      note(40, 396, '빠진 근거는 chunk 크기·top-k·임베딩 쪽에서 찾는다', fade(u, 1.8), { fill: MUT }); } }

  // ---------- 4. Answer Relevance ----------
  const REGEN = [['연차 정책은', '어떻게 되나요?'], ['근속 1년 시', '받는 휴가는?'], ['리프레시 휴가는', '며칠인가요?']];
  const SIMS = [0.91, 0.87, 0.86], COLX = [470, 660, 850];
  function dial(cx, cy, r, sim, u, i) { const th = Math.acos(sim) * (i === 1 ? -1 : 1), a0 = -Math.PI / 2;
    el('circle', { cx, cy, r, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: clamp(u * 3) });
    const g1 = clamp(u * 2), g2 = clamp(u * 2 - 0.6);
    el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a0) * r * g1, y2: cy + Math.sin(a0) * r * g1, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' });
    const a1 = a0 + th; el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a1) * r * g2, y2: cy + Math.sin(a1) * r * g2, stroke: ACC, 'stroke-width': 3, 'stroke-linecap': 'round' });
    if (g2 >= 1) { const rr = r * 0.45, sweep = th > 0 ? 1 : 0;
      el('path', { d: `M${cx},${cy - rr} A${rr},${rr} 0 0 ${sweep} ${cx + Math.cos(a1) * rr},${cy + Math.sin(a1) * rr}`, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); } }
  function s4(t, c) { const { k, u } = c;
    // 왼쪽: 질문·답·LLM
    card(180, 60, 290, 42, { rx: 8, text: 'Q (원래)  연차 정책 알려줘.', fs: 15, fw: 700, stroke: INK });
    card(180, 150, 290, 86, { rx: 8, text: '1년 이상 근속 시 연차 15일\n+ 리프레시 3일이\n부여됩니다.', fs: 15, fw: 500, stroke: GRID, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { card(650, 160, 260, 70, { rx: 10, text: '임베딩 모델\n문장 → 벡터', fs: 15, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 1.0) });
      note(520, 250, '이 지표만 임베딩 모델을 함께 쓴다', fade(u, 1.6), { fill: MUT }); }
    if (k >= 1) { card(180, 250, 200, 44, { rx: 22, text: 'LLM: 답만 보고 질문 만들기', fs: 14, fw: 700, stroke: WARN, color: WARN, fill: WARNBG, s: k === 1 ? pop(u, 0.2) : 1 });
      grow(180, 194, 180, 226, k === 1 ? E(u, 0.1, 0.4) : 1, MUT); }
    // 역생성 질문 3개
    if (k >= 1) REGEN.forEach((q, i) => { const f = k === 1 ? E(u, 0.6 + i * 0.35, 1.4 + i * 0.35) : 1;
      card(lerp(280, COLX[i], f), lerp(250, 70, f), 176, 58, { rx: 8, text: q.join('\n'), fs: 14.5, fw: 600, stroke: ACC, fill: ACCBG, op: clamp(f * 3) }); });
    if (k === 1) tag(660, 140, '역생성 질문 (예시)', fade(u, 2.0));
    // 원래 질문 벡터 vs 역생성 질문 벡터 — 사이 각이 작을수록 cos 이 1 에 가깝다
    if (k >= 2) { REGEN.forEach((_, i) => { const du = k === 2 ? seg(u, 0.2 + i * 0.4, 1.4 + i * 0.4) : 1;
        dial(COLX[i], 200, 58, SIMS[i], du, i);
        mono(COLX[i], 292, 'cos = ' + SIMS[i].toFixed(2), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(du * 3, 2) }); });
      if (k === 2) { tx(370, 340, '검은 선 = 원래 질문,  초록 선 = 역생성 질문 (각이 작을수록 비슷)', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); tag(840, 340, '유사도 예시', fade(u, 2.2)); } }
    if (k === 3) { const f = E(u, 0.3, 1.4);
      mono(370, 340, '(0.91 + 0.87 + 0.86) / 3', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      scoreBar(370, 370, 300, 0.88, f, '', { col: ACC });
      note(40, 340, '동문서답이면 각이 벌어져 점수가 떨어진다', fade(u, 1.8), { fill: MUT, 'font-size': 14.5 }); } }

  // ---------- 5. 종합 ----------
  const MET = [['faithfulness', 'Faithfulness', 'gen'], ['precision', 'Context Precision', 'ret'], ['recall', 'Context Recall', 'ret'], ['relevance', 'Answer Relevance', 'gen']];
  function s5(t, c) { const { k, u } = c, sc = c.beat.scores, X = 210, W = 280;
    // 왼쪽: 지표 4개 막대 (0.7 점선)
    MET.forEach(([key, name, side], i) => { const y = 70 + i * 74, shown = (k === 3 && i <= 1) || k === 4 && true, f = k === 3 && i <= 1 ? E(u, 0.3 + i * 0.4, 1.3 + i * 0.4) : k === 4 && i >= 2 ? E(u, 0.3 + (i - 2) * 0.4, 1.3 + (i - 2) * 0.4) : 1;
      const on = (k === 3 && i <= 1) || k === 4, op = k === 0 ? pop(u, 0.2 + i * 0.25) : 1;
      tx(X - 14, y + 17, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: op, fill: on ? INK : MUT });
      el('rect', { x: X, y, width: W, height: 24, rx: 5, fill: SOFT, opacity: op });
      el('line', { x1: X + W * 0.7, y1: y - 4, x2: X + W * 0.7, y2: y + 28, stroke: MUT, 'stroke-width': 1.8, 'stroke-dasharray': '4 3', opacity: op });
      if (on) { const v = sc[key], col = v >= 0.85 ? GOOD : WARN; el('rect', { x: X, y, width: Math.max(2, W * v * f), height: 24, rx: 5, fill: col });
        mono(X + W + 12, y + 18, (v * f).toFixed(2), { 'font-size': 17, 'font-weight': 800, fill: col }); }
      else mono(X + W + 12, y + 18, '—', { 'font-size': 17, fill: OFF, opacity: op }); });
    mono(X + W * 0.7, 54, '0.7', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    // 오른쪽: 평가 샘플 한 줄
    const RX = 600;
    if (k >= 1 && k <= 3) { const op = k === 1 ? fade(u, 0.2) : 1;
      tx(RX, 70, 'eval_data — 샘플 1개', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: op });
      [['question', '연차 정책 알려줘.'], ['answer', '…연차 15일 + 리프레시 3일…'], ['contexts', ''], ['ground_truth', '']].forEach(([h, v], i) => { const y = 100 + i * 50;
        el('rect', { x: RX, y, width: 330, height: 40, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
        mono(RX + 10, y + 25, h, { 'font-size': 14, fill: MUT, opacity: op });
        const fill = i < 2 ? (k === 1 ? fade(u, 0.6 + i * 0.4) : 1) : k >= 2 ? (k === 2 ? fade(u, 0.4 + (i - 2) * 0.6) : 1) : 0;
        if (i === 2 && fill > 0) [0, 1, 2].forEach((j) => card(RX + 150 + j * 58, y + 20, 48, 26, { rx: 5, text: '#' + (j + 1), fs: 13.5, mono: true, stroke: j === 1 ? BAD : INFO, color: j === 1 ? BAD : INFO, op: fill }));
        else if (i === 3) tx(RX + 130, y + 25, fill > 0 ? '…병가 5일 포함' : '', { 'font-size': 14, opacity: fill });
        else tx(RX + 130, y + 25, v, { 'font-size': 14, opacity: fill }); });
      if (k === 1) note(RX, 330, '실전에서는 수십~수백 샘플을 넣는다', fade(u, 1.6), { fill: MUT });
      if (k === 2) note(RX, 330, '네 지표가 쓸 재료가 한 샘플에 다 모였다', fade(u, 1.6), { fill: MUT });
      if (k === 3) tag(RX + 90, 330, 'evaluate() — LLM 판정', fade(u, 0.3)); }
    if (k === 0) { [['retriever', 0], ['generator', 1]].forEach(([s, i]) => card(680 + i * 170, 210, 140, 50, { rx: 10, text: s, fs: 15, mono: true, stroke: GRID, color: MUT, s: pop(u, 1.4 + i * 0.2) }));
      note(600, 290, '어느 지표가 낮은지가 고칠 곳을 알려 준다', fade(u, 1.9), { fill: MUT }); }
    if (k === 4) { // 평균과 진단: 검색 쪽 두 지표가 낮다 (precision 은 5/6 그대로 계산)
      const avg = (sc.faithfulness + 5 / 6 + sc.recall + sc.relevance) / 4;
      mono(X, 392, `4 지표 평균 = ${tween(0, avg, u, 1.6).toFixed(2)}`, { 'font-size': 18, 'font-weight': 800, fill: INK });
      const by = (i) => 70 + i * 74 + 12, x0 = X + W + 70, cards = [['retriever', 150, WARN, WARNBG, [1, 2]], ['generator', 300, GOOD, GOODBG, [0, 3]]];
      cards.forEach(([name, cy, col, bg, rows], j) => { const op = fade(u, 1.4 + j * 0.4);
        rows.forEach((i) => grow(x0, by(i), 690, cy + (by(i) < cy ? -10 : 10), op, col, { plain: true }));
        card(770, cy, 150, 46, { rx: 10, text: name, mono: true, fs: 16, fw: 800, stroke: col, color: col, fill: bg, op });
        if (j === 0) tx(770, cy + 46, '여기를 고친다', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }); } }

  const quiz = [
    { q: '답의 claim 3개가 모두 context로 뒷받침될 때 faithfulness는 얼마인가?',
      o: ['0.92 — 판정관이 조금 깎는다', '1.00 — 뒷받침 3 / 전체 3', '0.75 — 4개 중 3개'], a: 1,
      why: 'faithfulness는 뒷받침된 claim 수를 전체 claim 수로 나눈다. 3/3이므로 1.00이고, 지어낸 주장이 없다는 뜻이다.' },
    { q: '관련 ✓, 비관련 ✗, 관련 ✓ 순서로 검색됐을 때 context precision이 1.00이 아닌 이유는 무엇인가?',
      o: ['관련 문서가 2건뿐이라서', '비관련 문서가 2등에 끼어 3등의 precision@3이 0.67로 떨어져서', '질문이 짧아서'], a: 1,
      why: '관련 문서 자리의 precision@k만 평균한다. (1.00 + 0.67) / 2 = 0.83이고, 출장비 문서를 3등으로 내리면 1.00이 된다.' },
    { q: 'context recall을 재려면 반드시 있어야 하는 입력은 무엇인가?',
      o: ['ground_truth(정답 문장)', '임베딩 모델', '역생성 질문'], a: 0,
      why: 'recall은 정답 문장을 claim으로 쪼개 검색 결과가 그중 몇 개를 덮는지 본다. 정답이 없으면 무엇이 빠졌는지 알 수 없다.' },
    { q: 'answer relevance는 답이 질문에 맞는지를 어떻게 재는가?',
      o: ['답에 들어간 단어 수를 센다', '답과 context의 겹친 문장을 센다', '답만 보고 만든 질문들과 원래 질문의 코사인 유사도를 평균한다'], a: 2,
      why: '역생성 질문이 원래 질문과 가까울수록 답이 그 질문에 맞게 쓰였다는 뜻이다. 예시에서는 0.91, 0.87, 0.86의 평균 0.88이다.' },
    { q: 'precision 0.83, recall 0.75가 가장 낮게 나왔다. 먼저 손볼 곳은 어디인가?',
      o: ['retriever(검색 쪽)', 'generator(생성 모델)', '평가 데이터셋 크기'], a: 0,
      why: 'precision과 recall은 검색된 context를 채점하는 지표다. 둘이 낮으면 chunk 크기, top-k, reranker처럼 검색 단계를 먼저 본다.' },
  ];

  const summary = [
    'RAGAS는 RAG 답을 네 지표로 나눠 LLM 판정관이 라벨 없이 채점한다.',
    'faithfulness는 답의 claim이 context에 있는지, relevance는 답이 질문에 맞는지 본다.',
    'precision은 검색 순서를, recall은 정답에 필요한 근거가 다 왔는지를 본다.',
    '예시 샘플은 1.00, 0.83, 0.75, 0.88로 검색 쪽 두 지표가 낮아 retriever를 고친다.',
  ];
  const review = [
    { q: '답이 문서에 없는 숫자를 지어내는 일이 잦다는 신고가 들어왔다. 먼저 볼 지표는 무엇인가?',
      o: ['context recall', 'faithfulness', 'answer relevance'], a: 1,
      why: '답의 주장이 context로 뒷받침되는지 재는 지표가 faithfulness다. 낮으면 "context 밖 사실은 답하지 마라" 같은 생성 쪽 조치를 먼저 한다.' },
    { q: 'recall은 1.00인데 precision이 낮다. 가장 그럴듯한 상황은 무엇인가?',
      o: ['정답 근거는 다 왔지만 관련 없는 문서가 위쪽 순위에 섞였다', '정답 근거가 검색 결과에서 빠졌다', '답이 질문과 다른 이야기를 한다'], a: 0,
      why: 'recall이 1.00이면 필요한 근거는 모두 왔다. precision이 낮은 것은 순서 문제라 reranker로 관련 문서를 위로 올리는 것이 맞다.' },
    { q: '정답 문장을 아직 만들지 못한 평가 세트로 돌릴 수 없는 지표는 무엇인가?',
      o: ['answer relevance', 'faithfulness', 'context recall'], a: 2,
      why: 'context recall은 ground_truth를 claim으로 쪼개 검색 결과와 대조한다. faithfulness와 relevance는 질문·답·context만으로 잰다.' },
  ];

  R.page({ title: 'RAGAS 4 지표 채점', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
