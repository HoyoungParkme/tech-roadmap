/* III-2-1 ReAct 패턴 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * CoT만 / 도구만 / ReAct 루프 / 트레이스 / 비교표. 트레이스 문장은 페이지의 M4·ANS4(예시)를 줄여 그린다.
 * 입력 토큰은 o200k_base 로 센 값: SYSTEM + history 가 호출마다 83 → 166 → 221, 끝난 history 272. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, cross, check, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const PH = { question: [INK, SOFT, 'Question'], thought: [INFO, INFOBG, 'Thought'], action: [WARN, WARNBG, 'Action'], observation: [GOOD, GOODBG, 'Observation'], final: [ACC, ACCBG, 'Final'] };
  // 트레이스 한 줄 (왼쪽 위 기준). sl: 0→1 미끄러져 들어옴
  function row(x, y, w, ph, text, sl, o) { o = o || {}; sl = sl ?? 1; if (sl <= 0) return; const [col, bg, name] = PH[ph], dx = (1 - E(sl, 0, 1)) * 40, op = clamp(sl * 1.5) * (o.op ?? 1);
    el('rect', { x: x + dx, y, width: w, height: 34, rx: 8, fill: o.bad ? BADBG : bg, stroke: o.bad ? BAD : col, 'stroke-width': o.hot ? 3 : 1.8, opacity: op });
    tx(x + dx + 10, y + 22, name, { 'font-size': 13.5, 'font-weight': 800, fill: o.bad ? BAD : col, opacity: op });
    mono(x + dx + 118, y + 22, text, { 'font-size': 14, fill: INK, opacity: op }); }
  function llm(cx, cy, s, name) { card(cx, cy, 140, 62, { rx: 12, sw: 2.5, s });
    if (s > 0.5) { tx(cx, cy - 4, 'LLM', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 }); mono(cx, cy + 17, name || 'gpt-4o', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } }
  // Thought → Action → Observation 고리. on: 켜진 노드 이름, sc(i): 노드 크기
  const RING = [['thought', -90], ['action', 30], ['observation', 150]];
  function ring(cx, cy, r, on, o) { o = o || {}; const nw = o.nw || 132;
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3, opacity: o.op ?? 1 });
    RING.forEach(([ph, a], i) => { const [col, bg, name] = PH[ph], x = cx + r * Math.cos(a * Math.PI / 180), y = cy + r * Math.sin(a * Math.PI / 180), s = o.sc ? o.sc(i) : 1, hot = on === ph;
      card(x, y, nw, 40, { rx: 20, text: name, fs: o.fs || 15, stroke: col, color: hot ? PANEL : col, fill: hot ? col : (o.dim ? PANEL : bg), sw: hot ? 3 : 2, s, op: o.dim && !hot ? 0.5 : 1 }); }); }
  function ringDot(cx, cy, r, f, col) { if (f <= 0 || f >= 1) return; const a = (-90 + 360 * f) * Math.PI / 180; el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 7, fill: col || ACC }); }
  function magnifier(cx, cy, s) { if (s <= 0) return; const g = R.G(cx, cy, s); el('circle', { cx: -6, cy: -6, r: 16, fill: PANEL, stroke: WARN, 'stroke-width': 4 }, g); el('line', { x1: 6, y1: 6, x2: 20, y2: 20, stroke: WARN, 'stroke-width': 5, 'stroke-linecap': 'round' }, g); }

  // 1. 순수 CoT — 머릿속에서만
  const Q1 = '2024 카타르 월드컵 우승국의 인구는?';
  function s1(t, c) { const { k, u } = c;
    // 학습 데이터 안쪽 / 바깥 세상
    el('rect', { x: 500, y: 34, width: 250, height: 150, rx: 14, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    tx(516, 56, '학습 데이터 (기억)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    llm(625, 118, k === 0 ? pop(u, 0.2) : 1);
    el('line', { x1: 770, y1: 30, x2: 770, y2: 190, stroke: k === 4 ? BAD : OFF, 'stroke-width': k === 4 ? 4 : 3, 'stroke-dasharray': '8 6' });
    tx(855, 70, '바깥 세상', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: OFF });
    magnifier(855, 120, k === 0 ? pop(u, 0.6) : 1); cross(855, 120, 18, k === 0 ? pop(u, 1.0) : 1);
    sub(855, 170, 'tools 없음', k === 0 ? fade(u, 1.2) : 1, { fill: BAD, 'font-weight': 700 });
    if (k === 0) { note(24, 110, 'import는 OpenAI 클라이언트 하나뿐', fade(u, 1.5)); return; }
    const pr = ['prompt = """질문에 답하기 전에 단계별로 생각해라.', `Q: ${Q1}`, 'A: 단계별 추론:"""'];
    snippet(24, 40, pr.map((s, i) => (k === 1 ? typed(s, E(u, 0.2 + i * 0.5, 0.8 + i * 0.5)) : s)), { fs: 13.5, w: 450 });
    if (k === 1) return;
    grow(476, 90, 552, 110, k === 2 ? E(u, 0.1, 0.6) : 1, MUT);
    if (k === 2) dot([[476, 90], [552, 110]], seg(u, 0.6, 1.2), INFO, 7);
    const M = c.beat.messages || [];
    M.forEach((m, i) => { const fresh = (k === 2 && i === 0) || (k === 3 && i === 1);
      row(24, 220 + i * 46, 912, 'thought', m.text.length > 62 ? m.text.slice(0, 60) + '…' : m.text, fresh ? seg(u, 1.0 - (k === 3 ? 0.8 : 0), 1.8 - (k === 3 ? 0.8 : 0)) : 1); });
    if (k === 3) sub(480, 330, '확인한 사실이 아니라 기억을 늘어놓았다', fade(u, 1.6), { 'font-size': 15 });
    if (k === 4) { row(24, 330, 912, 'final', '2024 카타르 월드컵 우승국 아르헨티나의 인구는 약 4500만명입니다.', seg(u, 0.2, 1.0), { bad: true });
      pill(260, 396, '카타르 대회는 2022년', BAD, pop(u, 1.3), { fs: 14 }); pill(520, 396, '인구도 확인 안 함', BAD, pop(u, 1.6), { fs: 14 });
      sub(770, 214, '밖을 볼 수단이 없다', fade(u, 1.9), { fill: BAD, 'font-weight': 700, 'font-size': 14 }); } }

  // 2. 순수 Tool Use — 한 번 검색하고 끝
  const RES = [['카타르 인구', '290만'], ['아르헨티나 인구', '4600만'], ['프랑스 인구', '6800만']];
  function s2(t, c) { const { k, u } = c;
    magnifier(470, 92, k === 0 ? pop(u, 0.2) : 1); mono(470, 140, 'search()', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: k === 0 ? fade(u, 0.5) : 1 });
    if (k === 0) { card(160, 92, 170, 44, { rx: 22, text: 'Thought 단계', fs: 15, stroke: OFF, color: OFF, dash: '5 4', s: pop(u, 0.8) }); cross(270, 92, 12, pop(u, 1.2));
      note(24, 250, '도구는 생겼지만 언제, 왜 쓸지 정하는 단계가 없다', fade(u, 1.6)); return; }
    // 질의 그대로
    const qs = 'search("2024 카타르 월드컵 우승국 인구")';
    mono(24, 60, k === 1 ? typed(qs, E(u, 0.2, 1.0)) : qs, { 'font-size': 14.5, 'font-weight': 700 });
    if (k === 1) { dot([[200, 72], [440, 92]], seg(u, 1.1, 2.0), WARN, 7); sub(220, 110, '사용자 문장을 손대지 않고 넣는다', fade(u, 1.6), { 'font-size': 14 }); return; }
    // 결과가 섞여 돌아온다
    el('rect', { x: 24, y: 170, width: 420, height: 150, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.8 });
    tx(36, 192, 'Observation · 결과가 뒤섞임', { 'font-size': 13.5, 'font-weight': 800, fill: GOOD });
    RES.forEach(([n, v], i) => { const y = 222 + i * 32, s = k === 2 ? seg(u, 0.2 + i * 0.3, 0.7 + i * 0.3) : 1, hot = k >= 4 && i === 0;
      if (hot) el('rect', { x: 32, y: y - 20, width: 404, height: 28, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 2 });
      tx(44, y, n, { 'font-size': 15, opacity: s }); mono(420, y, v, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, opacity: s }); });
    // 통째로 프롬프트에
    const pr = ['prompt = f"검색 결과: {results}', '         질문: {query}', '         답:"'];
    snippet(520, 170, pr, { fs: 14, w: 410, op: k === 2 ? fade(u, 1.2) : 1 });
    if (k === 2) { R.fly(300, 250, 640, 200, seg(u, 1.4, 2.4), 'results', { mono: true, fill: GOOD }); return; }
    llm(720, 340, k === 3 ? pop(u, 0.2) : 1);
    grow(720, 262, 720, 306, k === 3 ? E(u, 0.3, 0.8) : 1, MUT);
    // 되돌아가는 길이 없다
    el('path', { d: 'M650,340 C560,400 380,400 380,330', fill: 'none', stroke: OFF, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: k === 3 ? fade(u, 1.0) : 0.6 });
    cross(510, 392, 10, k === 3 ? pop(u, 1.4) : 1);
    if (k === 3) { sub(510, 418, '재검색·재추론 없음 · LLM 1회', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 4) { card(880, 340, 120, 44, { rx: 22, text: '290만', fs: 17, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.6) });
      grow(792, 340, 818, 340, E(u, 0.3, 0.6), BAD); sub(880, 380, '맨 앞 결과를 골랐다', fade(u, 1.2), { fill: BAD }); return; }
    // k5: 두 단계를 한 번에 눌러 담았다
    card(880, 340, 120, 44, { rx: 22, text: '290만', fs: 17, stroke: BAD, color: BAD, fill: BADBG });
    el('rect', { x: 18, y: 36, width: 400, height: 34, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
    pill(700, 50, '① 우승국은 어디?', INFO, pop(u, 0.8), { fs: 14 }); grow(782, 50, 808, 50, E(u, 1.1, 1.4), INFO); pill(870, 50, '② 그 나라 인구?', INFO, pop(u, 1.4), { fs: 14 });
    sub(780, 96, '필요한 건 두 단계였다', fade(u, 1.8), { fill: INFO, 'font-weight': 700 }); }

  // 3. ReAct 루프 — 코드 한 줄씩
  const RX = 230, RY = 220, RR = 118;
  function s3(t, c) { const { k, u } = c, on = ['thought', 'thought', 'action', null, 'thought', 'action', 'observation', null][k];
    ring(RX, RY, RR, on, { sc: (i) => (k === 1 ? pop(u, 0.3 + i * 0.4) : k === 0 ? 0 : 1) });
    if (k === 0) el('circle', { cx: RX, cy: RY, r: RR, fill: 'none', stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': '4 6' });
    const px = 470;
    // 도구 두 개
    const tl = [['search', '검색'], ['read_page', '본문 읽기']];
    if (k <= 2) tl.forEach(([n, d], i) => { const x = px + 90 + i * 230, s = k === 0 ? pop(u, 0.3 + i * 0.4) : 1;
      card(x, 70, 200, 56, { rx: 10, stroke: WARN, fill: WARNBG, s }); if (s > 0.5) { mono(x, 66, n + '()', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN }); tx(x, 86, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } });
    if (k === 0) { note(px, 160, '단계마다 다른 도구를 고를 수 있다', fade(u, 1.4)); return; }
    if (k === 1) { snippet(px, 130, ['Thought: <다음에 뭘 할지>', 'Action: <도구 호출> 또는 Final Answer: <답>', 'Observation: <시스템이 채움>'], { fs: 14, op: fade(u, 0.3), w: 460 });
      sub(px + 230, 260, 'SYSTEM 프롬프트가 정한 루프의 문법', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 2) { tx(px, 150, 'TOOLS', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      tl.forEach(([n], i) => { const y = 176 + i * 44, s = pop(u, 0.4 + i * 0.4); card(px + 90, y, 180, 36, { rx: 8, text: `"${n}"`, fs: 14, mono: true, stroke: GRID, s }); grow(px + 186, y, px + 246, y, E(u, 0.8 + i * 0.4, 1.2 + i * 0.4), MUT); card(px + 340, y, 170, 36, { rx: 8, text: n, fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.1 + i * 0.4) }); });
      sub(px + 230, 290, 'Action 문자열의 이름으로 실제 함수를 찾는다', fade(u, 1.9), { 'font-size': 14 }); return; }
    // k3~: history 목록 + 회차
    tx(px, 52, 'history', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    const step = k >= 6 ? 1 : 0;
    mono(940, 52, `step ${step} / 6`, { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    row(px, 64, 470, 'question', '2024 월드컵 우승국의 인구는?', k === 3 ? seg(u, 0.3, 1.1) : 1);
    if (k === 3) { note(px, 140, '질문 한 줄로 시작, 최대 6바퀴', fade(u, 1.5)); return; }
    if (k >= 4) { // LLM이 Thought + Action을 쓴다, Observation 앞에서 끊는다
      row(px, 106, 470, 'thought', '먼저 우승국부터 확인해야 한다.', k === 4 ? seg(u, 0.8, 1.6) : 1);
      row(px, 148, 470, 'action', 'search("2024 월드컵 우승국")', k === 4 ? seg(u, 1.2, 2.0) : 1);
      if (k === 4) { el('line', { x1: px, y1: 192, x2: px + 470, y2: 192, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 1.9) });
        mono(px + 470, 212, 'stop=["Observation:"] — 관찰은 지어내지 않는다', { 'text-anchor': 'end', 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) });
        dot([[RX, RY - RR], [px, 120]], seg(u, 0.2, 0.8), INFO, 6); } }
    if (k === 5) { // Final Answer 면 바로 반환
      card(px + 235, 250, 300, 50, { rx: 25, text: '"Final Answer:" in out ?', fs: 15, mono: true, stroke: INK, s: pop(u, 0.2) });
      grow(px + 235, 276, px + 235, 320, E(u, 0.7, 1.1), GOOD); card(px + 235, 344, 220, 40, { rx: 20, text: '예 → 바로 return', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.1) });
      sub(px + 235, 392, '아니오면 도구를 실행한다 · 이번 회차는 아니오', fade(u, 1.7), { 'font-size': 14 }); }
    if (k >= 6) { row(px, 190, 470, 'observation', '2024 코파 아메리카 우승은 아르헨티나', k === 6 ? seg(u, 1.2, 2.0) : 1);
      if (k === 6) { mono(px, 260, 'TOOLS["search"]("2024 월드컵 우승국")', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.3) });
        dot([[RX + RR * 0.87, RY + RR * 0.5], [px, 206]], seg(u, 0.8, 1.4), GOOD, 6);
        sub(px + 235, 300, '도구 결과가 history에 붙어 다음 Thought의 입력이 된다', fade(u, 1.9), { 'font-size': 14 }); } }
    if (k === 7) { ringDot(RX, RY, RR, (u * 0.8) % 1, ACC);
      tx(RX, RY + 6, '다시 Thought', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      note(px, 260, '결과를 보고 다음 수를 다시 정한다', fade(u, 0.8)); note(px, 292, '돌 때마다 하나씩 확인할 수 있다', fade(u, 1.4), { fill: GOOD }); } }

  // 4. 트레이스 — history 가 쌓이고 입력 토큰이 는다
  const TR = [['question', '2024 월드컵 우승국의 인구는?'], ['thought', '먼저 2024 월드컵 우승국이 어디인지 확인해야 한다.'], ['action', 'search("2024 월드컵 우승국")'],
    ['observation', '2024 코파 아메리카 우승은 아르헨티나 (월드컵은 2022)'], ['thought', '우승국은 아르헨티나. 이제 인구 원문을 읽자.'], ['action', 'read_page(".../wiki/Argentina")'],
    ['observation', 'Argentina population (2024 est.): 46,234,830'], ['final', '약 4,623만명 (아르헨티나, 코파 아메리카)']];
  const UP = [1, 1, 3, 4, 6, 7, 8, 8], ON = [null, 'thought', 'action', 'observation', 'action', 'observation', 'thought', 'observation'];
  const TOK = [0, 0, 83, 83, 166, 166, 221, 272];   // 지금까지 본 마지막 LLM 입력 크기
  function s4(t, c) { const { k, u } = c, n = UP[k], np = k ? UP[k - 1] : 0;
    if (k === 0) { snippet(24, 40, ['trace = react_loop("2024 월드컵 우승국의 인구는?")'], { fs: 14.5, op: fade(u, 0.2) });
      note(24, 130, '안에서 몇 바퀴 돌지는 LLM이 정한다', fade(u, 1.4)); }
    const y0 = k === 0 ? 160 : 40;
    TR.slice(0, n).forEach(([ph, text], i) => { const fresh = i >= np || (k === 0 && i === 0);
      row(24, y0 + i * 44, 620, ph, text, fresh ? seg(u, 0.3 + (i - np) * 0.6, 1.1 + (i - np) * 0.6) : 1, { hot: k === 3 && i === 3, op: k === 7 && ![3, 6, 7].includes(i) ? 0.45 : 1 }); });
    if (k === 3) pill(560, y0 + 3 * 44 + 56, '전제 수정: 2024는 코파 아메리카', WARN, pop(u, 1.4), { fs: 13.5 });
    if (k === 5) sub(500, y0 + 6 * 44 + 54, '도구 결과는 예시 값', fade(u, 1.5), { 'font-size': 13.5 });
    if (k === 7) { [3, 6].forEach((i, j) => el('path', { d: `M640,${y0 + 7 * 44 + 17} C700,${y0 + 7 * 44} 700,${y0 + i * 44 + 17} 640,${y0 + i * 44 + 17}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, opacity: E(u, 0.3 + j * 0.5, 1.0 + j * 0.5) }));
      tx(712, y0 + 5 * 44 + 22, '답의 근거', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) }); }
    if (k === 0) return;
    // 오른쪽: 작은 고리 + 입력 토큰
    ring(830, 125, 82, ON[k], { nw: 104, fs: 13.5, dim: true });
    if (k === 7) return;
    const tv = tween(TOK[k - 1] || 0, TOK[k], u), bx = 690, by = 290, bw = 240;
    tx(bx, by - 14, 'LLM 입력 토큰', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('rect', { x: bx, y: by, width: bw, height: 20, rx: 4, fill: SOFT }); el('rect', { x: bx, y: by, width: Math.max(2, bw * tv / 300), height: 20, rx: 4, fill: INFO });
    mono(bx, by + 44, tv > 0 ? Math.round(tv) + ' 토큰' : '아직 호출 전', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    sub(bx + bw / 2, by + 74, 'SYSTEM + history · o200k_base', 1, { 'font-size': 13.5 }); }

  // 5. 비교표를 한 줄씩
  const ROWS = [['추론', 'O', 'X', 'O'], ['외부 정보', 'X', 'O', 'O'], ['다단계 검증', 'X', 'X', 'O'], ['실시간 데이터', 'X', 'O', 'O'],
    ['Hallucination 위험', '높음', '중간', '낮음'], ['추론 투명성', '중간', '낮음', '높음'], ['LLM 호출', '1회', '1~2회', 'N회']];
  const COLX = [430, 600, 790];
  function cellMark(x, y, v, ri, s) { if (s <= 0) return;
    if (v === 'O') return check(x, y, 10, s); if (v === 'X') return cross(x, y, 9, s);
    const good = (ri === 4 && v === '낮음') || (ri === 5 && v === '높음'), bad = (ri === 4 && v === '높음') || (ri === 5 && v === '낮음');
    if (ri === 6) { const n = v === '1회' ? 1 : v === '1~2회' ? 2 : 5; for (let i = 0; i < n; i++) el('circle', { cx: x - 40 + i * 14, cy: y, r: 5, fill: n === 5 ? WARN : INFO, opacity: s });
      return mono(x + 44, y + 5, v, { 'font-size': 14, 'font-weight': 700, opacity: s }); }
    card(x, y, 70, 28, { rx: 14, text: v, fs: 14, stroke: good ? GOOD : bad ? BAD : WARN, color: good ? GOOD : bad ? BAD : WARN, s }); }
  function s5(t, c) { const { k, u } = c;
    ['CoT', 'Tool Use', 'ReAct'].forEach((h, i) => tx(COLX[i], 40, h, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: i === 2 ? ACC : INK }));
    el('rect', { x: COLX[2] - 75, y: 18, width: 150, height: 330, rx: 10, fill: ACCBG, opacity: 0.5 });
    const shown = Math.min(k + 1, 7);
    ROWS.slice(0, shown).forEach((r, i) => { const y = 72 + i * 40, fresh = i === k;
      tx(40, y + 5, r[0], { 'font-size': 15, 'font-weight': 700, opacity: fresh ? fade(u, 0.2) : 1 });
      el('line', { x1: 30, y1: y + 20, x2: 930, y2: y + 20, stroke: GRID, 'stroke-width': 1, opacity: fresh ? fade(u, 0.2) : 1 });
      [1, 2, 3].forEach((j) => cellMark(COLX[j - 1], y, r[j], i, fresh ? pop(u, 0.4 + j * 0.35) : 1)); });
    if (k === 7) { [['단순 추론만', 'CoT'], ['단발성 검색', 'Tool Use'], ['다단계 + 검증 + 최신 데이터', 'ReAct']].forEach(([a, b2], i) => { const x = 160 + i * 320, s = pop(u, 0.3 + i * 0.4);
        card(x, 384, 300, 42, { rx: 21, text: `${a} → ${b2}`, fs: 14.5, stroke: i === 2 ? ACC : GRID, color: i === 2 ? ACC : INK, sw: i === 2 ? 2.5 : 1.6, s }); }); }
    else if (k <= 6) sub(480, 384, ['CoT도 단계별로 추론한다', '도구가 있어야 밖을 본다', '루프가 있어야 여러 번 확인한다', 'cutoff를 넘는 건 Action 단계', '단계마다 사실을 확인하니 지어낼 틈이 준다', 'Thought·Action·Observation이 모두 남는다', '정확성을 호출 횟수로 산다'][k], fade(u, 1.6), { 'font-size': 15 }); }

  const quiz = [
    { q: '순수 CoT가 "2024 카타르 월드컵" 질문에 틀린 답을 낸 근본 원인은 무엇인가?',
      o: ['추론 단계가 너무 짧아서', '도구가 없어 기억만으로 답하고 사실을 확인하지 못해서', 'temperature가 너무 낮아서'], a: 1,
      why: 'CoT는 학습 데이터 안에서만 생각한다. 대회 연도도 인구도 밖에서 확인할 수단이 없어 그럴듯한 문장이 그대로 답이 됐다.' },
    { q: '순수 Tool Use가 "290만"이라는 엉뚱한 답을 낸 이유는 무엇인가?',
      o: ['검색 도구가 고장 나서', '검색 결과에 아르헨티나 인구가 없어서', '질문을 쪼개지 않고 한 번 검색한 뒤 결과를 다시 따져 보지 않아서'], a: 2,
      why: '"우승국 확인 → 그 나라 인구" 두 단계를 한 번의 검색에 눌러 담았고, 뒤섞인 결과 중 맨 앞 카타르 인구를 골랐다.' },
    { q: 'ReAct 루프에서 LLM 호출에 stop=["Observation:"]을 주는 이유는 무엇인가?',
      o: ['모델이 Observation까지 스스로 지어내지 못하게 Action 뒤에서 끊으려고', '응답 속도를 높이려고', 'Final Answer를 막으려고'], a: 0,
      why: 'Observation은 도구를 실제로 실행한 결과로 시스템이 채운다. 끊지 않으면 모델이 관찰 결과까지 상상해 써 버린다.' },
    { q: '트레이스에서 첫 사이클이 인구가 아니라 우승국부터 검색한 덕분에 생긴 일은 무엇인가?',
      o: ['토큰을 아꼈다', '2024년에는 월드컵이 아니라 코파 아메리카가 열렸다는 전제 오류를 바로잡았다', '도구 호출을 한 번으로 줄였다'], a: 1,
      why: 'Observation 1이 질문의 잘못된 전제를 드러냈고, 두 번째 사이클은 그 결과를 근거로 read_page를 골랐다.' },
    { q: 'ReAct가 CoT나 Tool Use보다 비싼 부분은 무엇인가?',
      o: ['LLM 호출 횟수가 N회로 늘어난다', '도구를 쓸 수 없다', '추론 과정이 기록되지 않는다'], a: 0,
      why: '루프를 돌 때마다 LLM을 부르고 history도 길어진다. 트레이스 예시에서 입력은 83, 166, 221토큰으로 커졌다.' },
  ];

  const summary = [
    'CoT만 쓰면 기억으로만 추론해 연도와 인구를 확인하지 못한 채 답한다.',
    '도구만 붙이면 질문을 한 번에 검색해 뒤섞인 결과에서 엉뚱한 값을 고른다.',
    'ReAct는 Thought가 도구를 고르고 Observation이 다음 Thought로 돌아오는 고리를 돈다.',
    '고리를 돌 때마다 확인할 수 있지만 LLM 호출이 늘고 입력 토큰도 함께 커진다.',
  ];
  const review = [
    { q: '사내 규정 챗봇이 "올해 바뀐 휴가 규정"을 틀리게 답한다. 프롬프트에는 단계별로 생각하라는 지시만 있다. 먼저 손볼 곳은?',
      o: ['규정 문서 검색 도구를 주고 ReAct 루프로 확인하게 한다', '"더 꼼꼼히 단계별로 생각해라"를 한 줄 더 넣는다', 'temperature를 높여 여러 답을 받아 본다'], a: 0,
      why: '학습 시점 뒤에 바뀐 사실은 추론을 늘려도 알 수 없다. Action 단계로 바깥 문서를 읽어야 확인된다.' },
    { q: 'ReAct 에이전트 로그에 Observation 줄이 있는데 도구 서버에는 호출 기록이 없다. 먼저 의심할 것은?',
      o: ['TOOLS 표에 도구가 두 번 등록됐다', 'max_steps가 너무 작다', 'LLM 호출에 stop을 주지 않아 모델이 Observation을 지어 썼다'], a: 2,
      why: 'Action 뒤에서 생성을 끊지 않으면 모델이 관찰 결과까지 이어 쓴다. 실제 도구가 돌지 않았으니 서버 기록이 없다.' },
    { q: '검색 한 번으로 끝나는 "오늘 환율" 조회와, 회사를 찾고 그 회사의 매출을 다시 찾는 질문이 있다. 알맞은 짝은?',
      o: ['둘 다 순수 CoT', '환율은 Tool Use, 두 단계 질문은 ReAct', '둘 다 Tool Use 한 번'], a: 1,
      why: '단발 검색은 도구 한 번이면 되지만, 앞 결과로 다음 검색을 정해야 하는 질문은 루프가 있어야 한다.' },
  ];

  R.page({ title: 'ReAct — Thought · Action · Observation', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
