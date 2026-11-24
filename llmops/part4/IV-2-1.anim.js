/* IV-2-1 모델 라우팅 — small first — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   숫자 출처: 페이지 코드(일 1만 호출 분포, 단가표). 라우터 시뮬레이션·분류기 1·2층·is_insufficient 는 코드를 그대로 돌린 결과.
   LLM 분류 결과(JSON)와 응답 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, axes, line, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ───────── 1. 모든 질문 GPT-4 ─────────
  const DIST = [['인사', 1500, GOOD], ['단순 FAQ', 2000, INFO], ['중간 질의', 3500, WARN], ['복잡 분석', 2500, BAD], ['창작', 500, ACC]];
  const NEED = [GOOD, GOOD, INFO, BAD, BAD];   // 필요한 모델: gpt-3.5 / 4o-mini / gpt-4
  function cellType(i) { let acc = 0; for (let t = 0; t < DIST.length; t++) { acc += DIST[t][1] / 100; if (i < acc) return t; } return 4; }
  function waffle(x, y, u, o) { o = o || {}; const cs = 26;
    for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10, ty = cellType(i), f = o.fill ? clamp(o.fill * 100 - i) : 1; if (f <= 0) continue;
      const col = o.need ? (u > 0.3 + i * 0.012 ? NEED[ty] : DIST[ty][2]) : o.mono ? BAD : DIST[ty][2];
      el('rect', { x: x + c * cs, y: y + r * cs, width: cs - 4, height: cs - 4, rx: 4, fill: col, opacity: 0.25 + 0.6 * f }); } }
  function s1(t, c) { const { k, u } = c, wx = 70, wy = 60;
    tx(wx, 44, '일 10,000 호출 (한 칸 = 100건)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k === 0) { waffle(wx, wy, u, { fill: E(u, 0.1, 1.6) });
      DIST.forEach(([n, v, col], i) => { const y = 90 + i * 44, op = fade(u, 0.4 + i * 0.25); el('rect', { x: 400, y: y - 14, width: 18, height: 18, rx: 4, fill: col, opacity: op * 0.85 });
        tx(428, y, n, { 'font-size': 15, 'font-weight': 600, opacity: op }); mono(620, y, v.toLocaleString('en-US'), { 'font-size': 15, 'text-anchor': 'end', opacity: op }); });
      el('path', { d: 'M640,76 H652 V170 H640', fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      tx(664, 128, '쉬운 질문 3,500건 = 35%', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); return; }
    if (k === 1) { waffle(wx, wy, u, {}); card(720, 190, 170, 70, { rx: 14, text: 'gpt-4', mono: true, fs: 22, fw: 800, stroke: BAD, color: BAD, sw: 3, s: pop(u, 0.2) });
      for (let i = 0; i < 14; i++) dot([[330, 80 + (i % 7) * 36], [520, 190], [632, 190]], ((u * 0.6 + i / 14) % 1), DIST[cellType(i * 7)][2], 6);
      mono(720, 260, 'model="gpt-4"  # 고정', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      cross(640, 320, 10, pop(u, 1.4)); tx(660, 326, '모델을 고르는 코드가 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { waffle(wx, wy, u, { mono: true });
      const d = tween(0, 300, u, 1.4); mono(420, 120, '10,000 × $0.03', { 'font-size': 22, 'font-weight': 700, opacity: fade(u, 0.1) });
      mono(420, 175, '= $' + Math.round(d) + ' / 일', { 'font-size': 30, 'font-weight': 800, fill: BAD });
      mono(420, 230, '= $9,000 / 월', { 'font-size': 22, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      sub(560, 300, '"안녕하세요" 한 마디에도 GPT-4 요금', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { waffle(wx, wy, u, { need: true });
      [['gpt-3.5로 충분', '인사 · 단순 FAQ', GOOD], ['gpt-3.5 / 4o-mini', '중간 질의', INFO], ['gpt-4가 필요', '복잡 분석 · 창작', BAD]].forEach(([a, b, col], i) => { const y = 100 + i * 80, s = pop(u, 1.4 + i * 0.25);
        card(560, y, 280, 62, { rx: 12, stroke: col, sw: 2.2, s }); tx(440, y - 4, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: clamp(s) }); tx(440, y + 18, b, { 'font-size': 14, fill: MUT, opacity: clamp(s) });
        mono(690, y + 6, ['35%', '35%', '30%'][i], { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', opacity: clamp(s) }); }); return; }
    // k4: 절감 시뮬레이션 (Step 1 의 어림값: gpt-4 $0.03, gpt-3.5 $0.001, 4o-mini $0.0002)
    const X0 = 220, W = 600, sc = W / 300;
    [['전부 gpt-4', [[300, BAD, '$300']]], ['난이도별', [[3.5, GOOD, '쉬움 $3.5'], [0.7, INFO, '중간 $0.7'], [90, BAD, '복잡 $90']]]].forEach(([n, parts], i) => { const y = 110 + i * 110;
      tx(X0 - 14, y + 28, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' }); let x = X0;
      parts.forEach(([v, col, lab], j) => { const f = E(u, 0.2 + i * 0.6 + j * 0.2, 0.8 + i * 0.6 + j * 0.2); el('rect', { x, y, width: Math.max(3, v * sc * f), height: 44, rx: 5, fill: col, opacity: 0.85 });
        if (i) mono(X0 + [0, 110, 220][j], y + 70, lab, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: f }); x += v * sc * f; });
      mono(X0 + (i ? 94.2 : 300) * sc + 12, y + 29, i ? '$94.2 / 일' : '$300 / 일', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.6 + i * 0.8) }); });
    banner(480, 370, '같은 트래픽, 일 $300 → $94.2 (−69%)', pop(u, 2.0)); }

  // ───────── 2. 분류기 ─────────
  // 코드의 regex_classify · keyword_classify 를 실제로 돌린 결과
  const QS = [['안녕하세요', 5, 'trivial', 'regex'], ['영업시간 알려주세요', 10, 'trivial', 'regex'], ['환불 가능한가요?', 9, 'easy', 'kw'], ['PDF 100p 요약해 줘', 14, 'hard', 'kw'], ['회원 등급별 적립금 정책이 …(70자)', 70, 'medium', 'kw']];
  const LV = { trivial: GOOD, easy: INFO, medium: WARN, hard: BAD };
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { tx(80, 60, 'TRIVIAL_PATTERNS', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      ['^안녕|^hi|^hello|^감사', '^영업시간|^전화번호|^주소', '^몇\\s*시|^어디|^언제'].forEach((p, i) => card(260, 100 + i * 52, 360, 40, { rx: 8, text: 'r"' + p + '"', mono: true, fs: 14.5, stroke: i === 0 && u > 1.2 ? GOOD : GRID, sw: i === 0 && u > 1.2 ? 2.5 : 1.4, s: pop(u, 0.2 + i * 0.2) }));
      fly(820, 110, 520, 100, seg(u, 0.6, 1.2), '안녕하세요', { stay: true, fill: INK });
      pill(720, 210, 'trivial · 0.1ms · $0', GOOD, pop(u, 1.5), { fs: 15 }); sub(720, 250, '가장 싼 판정부터', fade(u, 1.9), { 'font-weight': 700 }); return; }
    if (k === 1) { tx(80, 50, 'regex_classify(q)', { 'font-size': 15, 'font-weight': 800, fill: INFO, class: 'mono' });
      QS.forEach(([q, , lv, by], i) => { const y = 80 + i * 60, f = fade(u, 0.2 + i * 0.3), hit = by === 'regex';
        card(240, y + 18, 320, 42, { rx: 8, text: q, fs: 15, stroke: GRID, s: f > 0 ? 1 : 0, op: f });
        grow(405, y + 18, 480, y + 18, seg(u, 0.4 + i * 0.3, 0.6 + i * 0.3), hit ? GOOD : MUT);
        if (hit) pill(570, y + 18, 'trivial 확정', GOOD, pop(u, 0.6 + i * 0.3), { fs: 14 }); else mono(500, y + 24, 'None → 다음 층', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.6 + i * 0.3) }); });
      sub(800, 200, '모르면 억지로 정하지 않는다', fade(u, 2.0), { 'font-weight': 700, fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { tx(80, 70, 'COMPLEX_KEYWORDS', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      ['분석', '비교', '요약', '추론', '계산', '여러', '전체', '모든', '왜'].forEach((w, i) => pill(130 + (i % 5) * 150, 130 + Math.floor(i / 5) * 70, w, BAD, pop(u, 0.2 + i * 0.12), { fs: 17 }));
      sub(480, 300, '이 단어가 들어가면 hard일 확률이 높다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const X = (n) => 120 + Math.min(n, 220) * 3.3; el('line', { x1: X(0), y1: 120, x2: X(220), y2: 120, stroke: MUT, 'stroke-width': 3 });
      [[0, 50, INFO, 'easy'], [50, 200, WARN, 'medium'], [200, 220, BAD, 'hard']].forEach(([a, b, col, n], i) => { el('rect', { x: X(a), y: 92, width: X(b) - X(a), height: 22, fill: col, opacity: 0.35 * fade(u, 0.2 + i * 0.2) }); tx((X(a) + X(b)) / 2, 84, n, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.2) }); });
      [0, 50, 200].forEach((v) => mono(X(v), 142, v + '자', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      QS.slice(2).forEach(([q, n, lv], i) => { const y = 200 + i * 56, f = fade(u, 0.8 + i * 0.4); el('circle', { cx: X(n), cy: 120, r: 7, fill: LV[lv], opacity: f });
        el('line', { x1: X(n), y1: 128, x2: X(n), y2: y - 8, stroke: LV[lv], 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: f });
        tx(X(n) + 10, y + 4, q, { 'font-size': 15, opacity: f }); const pl = lv + (n <= 50 && lv === 'hard' ? ' (키워드 "요약")' : ''); pill(X(n) + 30 + tw(q, 15) + (tw(pl, 13.5) + 26) / 2, y, pl, LV[lv], f > 0.5 ? 1 : 0, { fs: 13.5, mono: true }); });
      return; }
    if (k === 4) { const lines = ['- trivial: 인사 / 단순 사실 확인', '- easy:    정책 조회 / FAQ', '- medium:  여러 정보 조합', '- hard:    분석 / 추론 / 긴 문서'];
      card(300, 170, 480, 230, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.1) }); mono(80, 82, 'CLASSIFY_PROMPT', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.2) });
      lines.forEach((s, i) => mono(80, 120 + i * 32, s, { 'font-size': 15, fill: LV[['trivial', 'easy', 'medium', 'hard'][i]], 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.2) }));
      mono(80, 260, '출력 JSON: {level, confidence}', { 'font-size': 15, opacity: fade(u, 1.2) });
      card(750, 170, 300, 90, { rx: 12, stroke: INFO, sw: 2, fill: INFOBG, s: pop(u, 1.6) });
      mono(750, 165, '{"level": "easy",', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); mono(750, 190, ' "confidence": 0.9}', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      sub(750, 240, '응답 예시', fade(u, 1.8)); return; }
    if (k === 5) { card(200, 180, 240, 60, { rx: 12, text: '"환불 가능한가요?"', fs: 16, s: pop(u, 0.1) }); grow(320, 180, 400, 180, seg(u, 0.4, 0.7), MUT);
      card(520, 180, 220, 70, { rx: 12, text: 'gpt-3.5-turbo\njson_object', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.6) }); grow(630, 180, 700, 180, seg(u, 1.0, 1.3), MUT);
      pill(770, 180, 'easy', INFO, pop(u, 1.3), { mono: true, fs: 16 });
      sub(520, 270, '분류 자체는 가장 싼 모델로', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(520, 296, '키워드 층에서 easy / medium이 나온 질문만 여기로 온다', fade(u, 1.9)); return; }
    // k6: cascade
    [['1층 regex', '0.1ms · $0', GOOD], ['2층 길이·키워드', 'ms · $0', WARN], ['3층 LLM 분류', '200ms · 30%만', INFO]].forEach(([a, b, col], i) => { const w = 560 - i * 120, y = 80 + i * 90, s = pop(u, 0.2 + i * 0.4);
      card(400, y, w, 64, { rx: 12, stroke: col, sw: 2.5, s }); tx(400 - w / 2 + 20, y + 6, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: clamp(s) }); mono(400 + w / 2 - 20, y + 6, b, { 'font-size': 14.5, 'text-anchor': 'end', opacity: clamp(s) });
      if (i < 2) grow(400, y + 32, 400, y + 58, seg(u, 0.5 + i * 0.4, 0.8 + i * 0.4), MUT); });
    card(800, 170, 220, 80, { rx: 12, stroke: GOOD, sw: 2, text: '분류 비용\n평균 $0.0001 / 건', fs: 16, color: GOOD, s: pop(u, 1.8) });
    sub(400, 380, '확정되는 층에서 바로 돌려준다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ───────── 3. 라우터 ─────────
  const RT = [['trivial', 'gpt-3.5-turbo', 0.0007, 1500, 1.05], ['easy', 'gpt-4o-mini', 0.00024, 2000, 0.48], ['medium', 'gpt-4o', 0.007, 4000, 28.0], ['hard', 'gpt-4', 0.036, 2500, 90.0]];
  function table(u, o) { o = o || {}; RT.forEach(([lv, m, pc], i) => { const y = 90 + i * 62, s = o.pop ? pop(u, 0.2 + i * 0.3) : 1, hi = o.hi === i;
      card(320, y, 480, 50, { rx: 10, stroke: hi ? LV[lv] : GRID, sw: hi ? 3 : 1.4, fill: hi ? SOFT : PANEL, s });
      mono(100, y + 6, lv, { 'font-size': 16, 'font-weight': 800, fill: LV[lv], opacity: clamp(s) }); tx(210, y + 6, '→', { 'font-size': 16, fill: MUT, opacity: clamp(s) });
      mono(240, y + 6, m, { 'font-size': 16, 'font-weight': 700, opacity: clamp(s) }); mono(545, y + 6, '$' + pc + '/회', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end', opacity: clamp(s) }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { tx(80, 50, 'ROUTING_TABLE', { 'font-size': 15, 'font-weight': 800, fill: INFO }); table(u, { pop: true });
      sub(320, 360, '호출 1회 = input 800 · output 200 기준', fade(u, 1.6)); sub(790, 200, '규칙은 코드가 아니라 표', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { table(u, { hi: u > 1.4 ? 3 : null });
      card(790, 70, 220, 46, { rx: 10, text: '"PDF 100p 요약해 줘"', fs: 15, s: pop(u, 0.1) }); grow(790, 93, 790, 130, seg(u, 0.4, 0.7), MUT);
      card(790, 154, 200, 46, { rx: 10, text: 'classify() → hard', mono: true, fs: 15, stroke: BAD, color: BAD, s: pop(u, 0.7) });
      grow(690, 154, 565, 276, seg(u, 1.1, 1.5), BAD); pill(790, 280, 'model = "gpt-4"', BAD, pop(u, 1.8), { mono: true, fs: 15 }); return; }
    if (k === 2) { const m = RT[Math.floor(u / 0.6) % 4][1];
      R.snippet(120, 80, ['res = openai.chat.completions.create(', '    model=model,', '    messages=[system, user],', ')'], { fs: 17 });
      card(690, 130, 220, 40, { rx: 8, text: m, mono: true, fs: 16, stroke: ACC, color: ACC, fill: ACCBG });
      grow(560, 130, 576, 130, 1, ACC); sub(480, 270, '바뀌는 것은 model 한 줄, 나머지 호출부는 그대로', fade(u, 0.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { card(480, 190, 460, 210, { rx: 14, stroke: INK, sw: 2, s: pop(u, 0.1) });
      [['"answer"', '"PDF 핵심은 …" (예시)'], ['"model"', '"gpt-4"'], ['"level"', '"hard"'], ['"cost"', '0.036']].forEach(([a, b], i) => { const op = fade(u, 0.3 + i * 0.3);
        mono(280, 130 + i * 40, a + ':', { 'font-size': 16, fill: INFO, 'font-weight': 700, opacity: op }); mono(400, 130 + i * 40, b, { 'font-size': 16, opacity: op, fill: i === 3 ? ACC : INK }); });
      sub(480, 330, '어떤 모델로 얼마에 처리했는지 남겨야 나중에 표를 고친다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { ['level', '호출 수', 'model', '× 1회', '= 하루'].forEach((h, j) => tx([90, 230, 290, 560, 820][j], 66, h, { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': j === 1 || j === 3 || j === 4 ? 'end' : 'start' }));
      RT.forEach(([lv, m, pc, n, v], i) => { const y = 110 + i * 58, f = E(u, 0.2 + i * 0.4, 0.9 + i * 0.4);
        mono(90, y, lv, { 'font-size': 16, 'font-weight': 800, fill: LV[lv] }); mono(230, y, n.toLocaleString('en-US'), { 'font-size': 16, 'text-anchor': 'end' }); mono(290, y, m, { 'font-size': 16 });
        mono(560, y, '$' + pc, { 'font-size': 16, 'text-anchor': 'end', fill: MUT }); mono(820, y, '$' + (v * f).toFixed(2), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: f >= 1 ? INK : MUT }); });
      el('line', { x1: 600, y1: 340, x2: 830, y2: 340, stroke: INK, 'stroke-width': 1.5, opacity: fade(u, 1.8) });
      mono(820, 372, '$119.53', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 2.0) }); return; }
    // k5
    const X0 = 220, sc = 600 / 360;
    tx(X0 - 14, 140, '전부 gpt-4', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: X0, y: 112, width: 360 * sc * E(u, 0.2, 0.9), height: 44, rx: 5, fill: BAD, opacity: 0.85 });
    mono(X0 + 360 * sc - 10, 140, '$360.00', { 'font-size': 17, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end', opacity: fade(u, 0.8) });
    tx(X0 - 14, 240, '라우팅', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' }); let x = X0;
    RT.forEach(([lv, , , , v], i) => { const w = v * sc * E(u, 1.0, 1.6); el('rect', { x, y: 212, width: Math.max(2, w), height: 44, fill: LV[lv], opacity: 0.85 }); x += w; });
    mono(x + 12, 240, '$119.53', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.5) });
    sub(X0 + 20, 290, 'trivial + easy 3,500건이 $1.53', fade(u, 1.8), { 'text-anchor': 'start', fill: GOOD, 'font-weight': 700, 'font-size': 14.5 });
    banner(480, 360, '하루 $360 → $119.53, 67% 절감', pop(u, 2.1)); }

  // ───────── 4. Fallback ─────────
  const FB = [['trivial', 'gpt-3.5-turbo', 'gpt-4o-mini'], ['easy', 'gpt-4o-mini', 'gpt-4o'], ['medium', 'gpt-4o', 'gpt-4'], ['hard', 'gpt-4', 'claude-3-opus']];
  function chain(y, a, b, o) { o = o || {}; const s = o.s ?? 1;
    card(o.x1 || 340, y, 200, 46, { rx: 10, text: a, mono: true, fs: 15, stroke: o.fa ? BAD : INK, color: o.fa ? BAD : INK, s });
    grow((o.x1 || 340) + 104, y, (o.x2 || 620) - 104, y, o.g ?? 1, o.fa ? BAD : MUT);
    card(o.x2 || 620, y, 200, 46, { rx: 10, text: b, mono: true, fs: 15, stroke: o.ok ? GOOD : GRID, color: INK, sw: o.ok ? 2.5 : 1.6, s }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tx(80, 50, 'FALLBACK_CHAIN', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      FB.forEach(([lv, a, b], i) => { const y = 100 + i * 70, s = pop(u, 0.2 + i * 0.3); mono(150, y + 6, lv, { 'font-size': 16, 'font-weight': 800, fill: LV[lv], 'text-anchor': 'end', opacity: clamp(s) }); chain(y, a, b, { s, g: seg(u, 0.5 + i * 0.3, 0.8 + i * 0.3) }); });
      sub(480, 390, '1순위가 안 되면 오른쪽으로 넘어간다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { chain(90, 'gpt-3.5-turbo', 'gpt-4o-mini', { fa: u > 1.2, g: seg(u, 1.4, 1.8), ok: u > 2.0 });
      card(240, 200, 300, 60, { rx: 10, text: '"죄송합니다. 그 부분은\n잘 모르겠습니다."', fs: 14.5, stroke: WARN, s: pop(u, 0.3) });
      mono(240, 270, 'is_insufficient → True', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      card(720, 200, 300, 60, { rx: 10, text: '"환불은 구매 후 7일 이내,\n미개봉 상품만 가능합니다."', fs: 14.5, stroke: GOOD, s: pop(u, 2.0) });
      check(720, 280, 12, pop(u, 2.2)); sub(480, 360, '응답 문장은 예시, 판정은 코드를 돌린 결과', fade(u, 2.3)); return; }
    if (k === 2) { chain(90, 'gpt-4o', 'gpt-4', { fa: true, g: seg(u, 0.8, 1.2), ok: u > 1.4 });
      pill(340, 150, 'RateLimitError', BAD, pop(u, 0.3), { mono: true, fs: 14 }); sub(480, 190, 'except → continue', fade(u, 0.6), { class: 'mono', 'font-size': 15 });
      zone(200, 240, 560, 110, '체인을 다 돌아도 실패하면', { stroke: BAD, dash: '5 5', fill: 'none', op: fade(u, 1.6) });
      mono(480, 310, 'raise last_error', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 3) { [['"죄송합니다. 그 부분은 잘 모르겠습니다."', '거부어 포함', true], ['"네"', '10자 미만', true], ['"환불은 구매 후 7일 이내, 미개봉 상품만 가능합니다."', '통과', false]].forEach(([a, why, bad], i) => { const y = 100 + i * 80, op = fade(u, 0.2 + i * 0.5);
        tx(80, y, a, { 'font-size': 15, opacity: op }); mono(80, y + 28, `is_insufficient → ${bad ? 'True' : 'False'}`, { 'font-size': 15, 'font-weight': 800, fill: bad ? BAD : GOOD, opacity: fade(u, 0.5 + i * 0.5) });
        tx(860, y + 14, why, { 'font-size': 15, 'font-weight': 700, fill: bad ? BAD : GOOD, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.5) }); });
      sub(480, 380, '기준이 코드에 박혀 있어야 escalate가 예측된다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { const V = [['gpt-4', 'OpenAI'], ['claude-3-opus', 'Anthropic'], ['gemini-1.5-pro', 'Google']];
      V.forEach(([m, v], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.3), dead = i === 0 && u > 0.9;
        card(x, 140, 230, 70, { rx: 12, text: m + '\n' + v, mono: true, fs: 15, stroke: dead ? BAD : i === 1 && u > 1.4 ? GOOD : GRID, sw: 2.2, color: dead ? BAD : INK, s });
        if (i) grow(x - 310 + 118, 140, x - 118, 140, seg(u, 0.9 + (i - 1) * 0.5, 1.2 + (i - 1) * 0.5), i === 1 ? BAD : MUT); });
      cross(170, 210, 11, pop(u, 0.9)); tx(170, 240, '장애', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); check(480, 210, 12, pop(u, 1.5));
      [['단일 vendor', '99.5%', MUT], ['여러 vendor', '99.9%', GOOD]].forEach(([a, b, col], i) => { mono(300 + i * 300, 320, b, { 'font-size': 26, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 1.8 + i * 0.2) }); sub(300 + i * 300, 350, a + ' SLA', fade(u, 1.8 + i * 0.2)); });
      return; }
    if (k === 5) { ['openai.chat.completions', 'anthropic.messages', 'genai.generate_content'].forEach((s, i) => { const y = 90 + i * 80, f = E(u, 0.3, 1.4);
        card(220, y, 280, 50, { rx: 10, text: s, mono: true, fs: 14.5, stroke: GRID, op: 1 - f * 0.4 });
        grow(364, y, 524, 170, seg(u, 0.6 + i * 0.2, 1.2 + i * 0.2), MUT); });
      card(680, 170, 300, 70, { rx: 14, text: 'litellm.completion(\n  model=…, messages=…)', mono: true, fs: 15, stroke: ACC, color: ACC, sw: 2.5, s: pop(u, 1.3) });
      sub(680, 240, 'vendor 별 분기 코드가 사라진다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k6: 대가
    tx(80, 70, '1차 실패 후 2차 호출', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const a = E(u, 0.2, 0.9), b = E(u, 1.0, 1.7);
    el('rect', { x: 120, y: 100, width: 300 * a, height: 40, rx: 6, fill: BAD, opacity: 0.8 }); tx(130, 126, '1차 (실패)', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: a });
    el('rect', { x: 420, y: 100, width: 300 * b, height: 40, rx: 6, fill: GOOD, opacity: 0.8 }); tx(430, 126, '2차 (성공)', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: b });
    tx(120, 180, '지연: 한 번 더 기다린다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); tx(120, 214, '비용: 두 번 낸다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
    tx(120, 248, '형식: 모델마다 답 모양이 달라 검증이 필요하다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    banner(480, 340, '그래도 안정성을 얻으려고 붙인다', pop(u, 2.1)); }
  const zone = R.zone;

  // ───────── 5. 종합 (routing_summary.md) ─────────
  const STEP = [['All GPT-4', 3600, 0.88], ['+ Cache', 1260, 0.88], ['+ Routing', 1080, 0.86], ['+ Fallback', 1100, 0.87]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const X = (i) => 160 + i * 200, Y = (v) => 330 - v / 3600 * 240;
      tx(80, 50, '월 비용 (일 4천 호출)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      STEP.forEach(([n, v, q], i) => { const f = E(u, 0.2 + i * 0.4, 0.8 + i * 0.4); el('rect', { x: X(i) - 50, y: 330 - (330 - Y(v)) * f, width: 100, height: (330 - Y(v)) * f, rx: 5, fill: i ? GOOD : BAD, opacity: 0.8 });
        mono(X(i), Y(v) - 10, '$' + v.toLocaleString('en-US'), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: f }); tx(X(i), 356, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
        mono(X(i), 384, 'Q ' + q.toFixed(2), { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.6 + i * 0.1) }); });
      sub(800, 200, '비용 −70%, 품질 0.88 → 0.86', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const W = 640, X0 = 160;
      [['Before', 3600, BAD], ['After', 1100, GOOD]].forEach(([n, v, col], i) => { const y = 90 + i * 70, f = E(u, 0.2 + i * 0.4, 0.9 + i * 0.4);
        tx(X0 - 14, y + 26, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: X0, y, width: W * v / 3600 * f, height: 40, rx: 6, fill: col, opacity: 0.85 });
        mono(X0 + W * v / 3600 * f + 10, y + 27, '$' + v.toLocaleString('en-US') + ' / 월', { 'font-size': 16, 'font-weight': 800, opacity: f }); });
      for (let m = 0; m < 12; m++) { const f = pop(u, 1.2 + m * 0.08); el('rect', { x: 160 + m * 54, y: 270, width: 46, height: 46, rx: 6, fill: GOOD, opacity: 0.2 + 0.6 * clamp(f) }); mono(183 + m * 54, 299, '2.5K', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: clamp(f) }); }
      tx(160, 254, '월 $2,500 절감 × 12', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.1) });
      mono(480, 370, '= 연 $30,000', { 'font-size': 24, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 2) { const ax = axes(120, 70, 640, 260, { x: [0, 12], y: [0, 30000], xt: [0, 4, 8, 12], yt: [0, 10000, 30000], xl: '개월', yl: '누적 $', grid: true });
      el('line', { x1: ax.X(0), y1: ax.Y(10000), x2: ax.X(12), y2: ax.Y(10000), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); tx(ax.X(12) + 8, ax.Y(10000) + 5, '도입 $10K', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      const pts = []; for (let m = 0; m <= 12; m++) pts.push([m, m * 2450]); line(ax, pts, E(u, 0.2, 1.8), GOOD);
      if (u > 1.0) { el('circle', { cx: ax.X(10000 / 2450), cy: ax.Y(10000), r: 7, fill: INK, opacity: fade(u, 1.0) }); tx(ax.X(10000 / 2450), ax.Y(10000) - 16, '약 4개월에 회수', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
      tx(ax.X(12) + 8, ax.Y(29400) + 5, '$29,400', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(440, 410, '순절감 = 월 $2,500 − 운영 $50, 1년 ROI 약 3배', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const M = [['인사 / 단순 FAQ', 'gpt-3.5 / Haiku', GOOD], ['정책 조회', 'gpt-4o-mini', INFO], ['분석 / 요약', 'gpt-4o / Sonnet', WARN], ['코드 생성', 'gpt-4 / Opus', BAD], ['한국어 특화', 'HCX-003 / KoGPT', ACC], ['비전 / 멀티모달', 'gpt-4o / Gemini', ACC]];
      M.forEach(([a, b, col], i) => { const y = 62 + i * 54, op = fade(u, 0.2 + i * 0.2); tx(320, y + 6, a, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', opacity: op });
        grow(340, y, 420, y, seg(u, 0.3 + i * 0.2, 0.5 + i * 0.2), MUT); pill(540, y, b, col, op > 0 ? R.spring(op) : 0, { mono: true, fs: 14.5 }); });
      sub(820, 250, '아래 둘은 비용이 아니라', fade(u, 1.8), { 'font-weight': 700 }); sub(820, 272, '능력이 기준이다', fade(u, 1.8), { 'font-weight': 700 }); return; }
    if (k === 4) { ['Classifier 정확도 ≥ 85%', 'Routing 별 quality eval 통과', 'Fallback chain 테스트', '비용 대시보드 모델별 분리', 'Latency 모니터 (fallback 영향)'].forEach((s, i) => { const y = 80 + i * 58;
        el('rect', { x: 200, y: y - 16, width: 26, height: 26, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 2 }); check(213, y - 3, 9, pop(u, 0.4 + i * 0.35));
        tx(244, y + 4, s, { 'font-size': 17, 'font-weight': i === 0 ? 800 : 600, fill: i === 0 ? ACC : INK }); });
      sub(720, 120, '분류가 틀리면 절감도 품질도', fade(u, 2.2), { 'font-weight': 700, fill: BAD }); sub(720, 142, '같이 무너진다', fade(u, 2.2), { 'font-weight': 700, fill: BAD }); return; }
    // k5: 못과 망치
    [[16, 'gpt-3.5', GOOD], [26, 'gpt-4o-mini', INFO], [38, 'gpt-4o', WARN], [52, 'gpt-4', BAD]].forEach(([s, m, col], i) => { const x = 160 + i * 210, f = E(u, 0.2 + i * 0.3, 0.8 + i * 0.3);
      el('rect', { x: x - s / 2, y: 280 - s * 3 * f, width: s, height: s * 3 * f, rx: 2, fill: OFF }); el('rect', { x: x - s, y: 280 - s * 3 * f - 8, width: s * 2, height: 8, rx: 2, fill: MUT, opacity: f });
      const hy = lerp(80, 280 - s * 3 - 30, E(u, 1.0 + i * 0.2, 1.5 + i * 0.2)); el('rect', { x: x - s * 1.2, y: hy - s * 0.6, width: s * 2.4, height: s * 1.2, rx: 4, fill: col, opacity: 0.85 }); el('rect', { x: x - 4, y: hy - s * 0.6 - 60, width: 8, height: 60, rx: 3, fill: MUT });
      mono(x, 320, m, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col }); });
    banner(480, 380, '못 크기(질문 난이도)에 맞춰 망치(모델)를 고른다', pop(u, 2.1)); }

  // ───────── 확인 문제 ─────────
  const quiz = [
    { q: '일 1만 호출을 전부 GPT-4로 보낼 때 가장 큰 낭비는 무엇인가?',
      o: ['복잡 분석 2,500건에 GPT-4를 쓰는 것', '인사·단순 FAQ 3,500건까지 GPT-4 요금을 내는 것', '창작 500건에 GPT-4를 쓰는 것'], a: 1,
      why: '35%는 GPT-3.5로도 충분한 질문이다. 난이도별로 나누면 일 $300이 $94.2로 69% 준다.' },
    { q: '"환불 가능한가요?"가 분류기에서 거치는 경로로 맞는 것은 무엇인가?',
      o: ['regex에서 trivial로 확정된다', '키워드 "환불"로 hard가 된다', 'regex는 None, 키워드 층은 easy라서 LLM 분류로 넘어간다'], a: 2,
      why: '인사 패턴에 안 맞고 복잡 키워드도 없어 easy가 나온다. cascade는 hard·trivial만 바로 돌려주고 나머지는 LLM이 확인한다.' },
    { q: '라우터 시뮬레이션(입력 800·출력 200)에서 하루 비용 $119.53 중 가장 큰 몫은 어디서 나오는가?',
      o: ['hard 2,500건을 처리하는 gpt-4', 'medium 4,000건을 처리하는 gpt-4o', 'trivial 1,500건을 처리하는 gpt-3.5'], a: 0,
      why: 'gpt-4가 2,500건에 $90.00, gpt-4o가 4,000건에 $28.00이다. 싼 두 모델은 3,500건을 $1.53에 처리한다.' },
    { q: 'fallback chain에서 gpt-3.5가 "죄송합니다. 잘 모르겠습니다."라고 답하면 어떻게 되는가?',
      o: ['그 답을 그대로 사용자에게 보낸다', 'is_insufficient가 True가 되어 다음 모델 gpt-4o-mini를 부른다', '즉시 예외를 던진다'], a: 1,
      why: '거부어가 들어 있으면 부족한 답으로 본다. continue로 체인의 다음 모델에 넘기고, 체인이 다 실패할 때만 예외를 던진다.' },
    { q: '도입비 $10K, 월 절감 $2,500, 운영비 월 $50이면 도입비는 언제쯤 회수되는가?',
      o: ['약 4개월', '첫 달', '약 1년'], a: 0,
      why: '매달 남는 돈이 $2,450이라 $10,000을 채우는 데 약 4.1개월 걸린다. 1년 순절감은 $29,400으로 ROI 약 3배다.' },
  ];

  const summary = [
    '모든 질문을 GPT-4로 보내면 인사 한 마디에도 가장 비싼 요금을 낸다.',
    '분류기는 regex, 길이·키워드, LLM 순으로 내려가며 싼 층에서 확정되면 바로 끝낸다.',
    '난이도별 모델 표로 보내면 같은 트래픽이 하루 $360에서 $119.53으로 준다.',
    '부족한 답이나 장애는 fallback chain이 다음 모델로 넘긴다. 대신 지연과 비용이 늘 수 있다.',
  ];
  const review = [
    { q: '라우팅을 붙였는데 비용이 거의 줄지 않았다. 로그를 보니 대부분이 gpt-4로 갔다. 먼저 의심할 것은?',
      o: ['분류기가 질문 대부분을 hard로 판정하고 있다', 'gpt-4 단가가 올랐다', 'fallback chain이 너무 짧다'], a: 0,
      why: '라우팅 효과는 분류 정확도에 달려 있다. 응답에 남긴 level·model 기록으로 분류 분포부터 확인한다.' },
    { q: '라우팅 후 easy 질문의 답이 자주 부실하다는 불만이 늘었다. 코드 구조를 크게 바꾸지 않는 대응은?',
      o: ['모든 질문을 다시 gpt-4로 보낸다', '분류 프롬프트를 통째로 지운다', 'easy 체인에 2순위 모델을 둔다'], a: 2,
      why: 'fallback chain은 라우팅 표에 2순위를 더한 것이다. is_insufficient로 부족한 답만 위 모델로 넘기니 비용은 대부분 그대로 유지된다.' },
    { q: 'OpenAI 장애가 30분 이어졌는데 hard 질문 응답은 끊기지 않았다. 가능하게 한 구성은?',
      o: ['키워드 기반 난이도 분류기', 'vendor를 섞은 fallback 체인', '카테고리별 max_tokens 제한'], a: 1,
      why: 'gpt-4 다음에 claude-3-opus, gemini를 두면 한 vendor 장애를 넘길 수 있다. litellm이 SDK 차이를 감춰 같은 코드로 부른다.' },
  ];

  R.page({ title: '모델 라우팅', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
