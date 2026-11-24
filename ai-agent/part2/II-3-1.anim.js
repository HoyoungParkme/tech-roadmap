/* II-3-1 LLM의 한계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 위쪽 한계 카드 세 장의 상태(inert/broken/fixed)와 질문·응답 문장은 페이지 STEPS 데이터를 읽는다. 응답 문장은 페이지의 예시 출력이다(LLM 호출 없음).
 * 학습 마감일: GPT-4o 2023-10, Claude 3.5 Sonnet 2024-04, Gemini 1.5 2024-05(코드 주석 기준). tool_calls JSON 의 인자 값은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock, dbIcon, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 위쪽 한계 카드 세 장
  const LIM = [['hallucination', '환각'], ['cutoff', '지식 단절'], ['action', '행동 불가']];
  function limits(c) { const st = c.beat.states || {}, ps = (c.prev && c.prev.states) || st, f = c.beat.focus;
    LIM.forEach(([id, name], i) => { const cx = 190 + i * 290, s = st[id], changed = ps[id] !== s, col = s === 'broken' ? BAD : s === 'fixed' ? GOOD : GRID;
      const sc = changed ? pop(c.u, 0.3) : 1;
      card(cx, 30, 220, 38, { rx: 19, fill: s === 'broken' ? BADBG : s === 'fixed' ? GOODBG : PANEL, stroke: f === id ? INK : col, sw: f === id ? 3 : 1.8 });
      tx(cx - 10, 36, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: s === 'inert' ? MUT : col });
      if (s === 'broken') cross(cx + 70, 30, 8, sc); if (s === 'fixed') check(cx + 70, 30, 9, sc); }); }
  function bubble(x, y, w, text, op, o) { o = o || {}; const lines = String(text).split('\n'), h = 18 + lines.length * 22;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 1.8, opacity: op });
    lines.forEach((ln, i) => tx(x + 16, y + 26 + i * 22, ln, { 'font-size': o.fs || 14.5, opacity: op, fill: o.color || INK, 'font-weight': o.fw || 500 }));
    return h; }
  // 긴 문장을 n 글자씩 줄바꿈
  const wrap = (s, n) => { const out = []; String(s).split('\n').forEach((p) => { while (p.length > n) { out.push(p.slice(0, n)); p = p.slice(n); } out.push(p); }); return out.join('\n'); };
  function llmBox(cx, cy, o) { o = o || {}; card(cx, cy, 130, 64, { rx: 12, text: 'LLM', fs: 18, fw: 800, s: o.s, stroke: o.stroke || INK }); }

  // ---------- 1. 환각 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    limits(c);
    if (k === 0) { llmBox(480, 220, { s: pop(u, 0.2) });
      [['검색', 230, 140], ['문서', 730, 140], ['외부 API', 480, 360]].forEach(([n, x, y], i) => { grow(480, 220, x, y, E(u, 0.6 + i * 0.2, 1.1 + i * 0.2), GRID, { plain: true, dash: '5 5' });
        card(x, y, 110, 40, { rx: 8, text: n, fs: 14.5, stroke: GRID, color: MUT, s: pop(u, 0.8 + i * 0.2) }); cross((480 + x) / 2, (220 + y) / 2, 9, pop(u, 1.4 + i * 0.15)); });
      note(600, 230, '외부 지식 연결 없음', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 1) { [['질문', 140], ['messages', 360], ['LLM', 580], ['본문', 800]].forEach(([n, x], i) => { const s = pop(u, 0.2 + i * 0.3);
        card(x, 200, 140, 50, { rx: 10, text: n, fs: 15, mono: n === 'messages', stroke: n === 'LLM' ? INK : GRID, s });
        if (i < 3) grow(x + 72, 200, x + 148, 200, E(u, 0.4 + i * 0.3, 0.7 + i * 0.3), MUT); });
      el('rect', { x: 640, y: 260, width: 120, height: 40, rx: 8, fill: 'none', stroke: BAD, 'stroke-dasharray': '5 4', 'stroke-width': 2, opacity: fade(u, 1.6) });
      tx(700, 286, '사실 확인', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); cross(770, 280, 8, pop(u, 1.9));
      note(140, 340, '받은 질문을 그대로 넘기고 본문만 돌려준다', fade(u, 2.0)); return; }
    // 질문과 시간선
    person(70, 120, null, {});
    bubble(110, 90, 420, b.userAsk || '', k === 2 ? fade(u, 0.2) : 1, { fill: ACCBG, stroke: ACC });
    if (k === 2) { const X0 = 120, W = 720, yr = (v) => X0 + (v - 2022) / 9 * W;
      el('line', { x1: X0, y1: 300, x2: X0 + W, y2: 300, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 0.5) });
      [2023, 2025, 2027, 2029, 2031].forEach((v) => mono(yr(v), 324, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) }));
      el('rect', { x: X0, y: 286, width: (yr(2023.8) - X0) * E(u, 0.8, 1.4), height: 28, rx: 4, fill: INFO, opacity: 0.35 });
      mono(yr(2022.9), 278, '학습 데이터', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) });
      el('circle', { cx: yr(2030), cy: 300, r: 9 * pop(u, 1.6), fill: BAD }); mono(yr(2030), 272, '2030 (질문)', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.7) });
      note(120, 380, '아직 일어나지 않은 일이라 학습 데이터에 있을 수 없다', fade(u, 2.1)); return; }
    llmBox(110, 250, {});
    const ans = wrap(b.llmAnswer || '', 30), n = k === 3 ? E(u, 0.4, 2.0) : 1;
    const shown = ans.slice(0, Math.round(ans.length * n));
    bubble(200, 196, 560, shown, 1, { fill: PANEL, stroke: k === 4 ? BAD : INK });
    sub(840, 300, '예시 출력', 1);
    if (k === 3) note(200, 360, '모른다고 하지 않고 이름과 이론까지 붙인다', fade(u, 2.2), { fill: BAD });
    if (k === 4) { [['이재훈 교수', 300], ['TimeFold 모델', 520]].forEach(([s, x], i) => { const pp = pop(u, 0.3 + i * 0.4);
        card(x, 330, tw(s, 15) + 120, 40, { rx: 8, text: s + ' · 실재하지 않음', fs: 14.5, stroke: BAD, color: BAD, fill: BADBG, s: pp }); });
      note(200, 395, '근거도 출처도 없다 · 문장만 보고는 구별할 수 없다', fade(u, 1.4)); } }

  // ---------- 2. 지식 단절 ----------
  const X0 = 100, TW = 760, yr = (v) => X0 + (v - 2023) / 4 * TW;   // 2023 ~ 2027
  function timeline(u, o) { o = o || {};
    el('line', { x1: X0, y1: 200, x2: X0 + TW, y2: 200, stroke: MUT, 'stroke-width': 2 });
    [2023, 2024, 2025, 2026, 2027].forEach((v) => { el('line', { x1: yr(v), y1: 194, x2: yr(v), y2: 206, stroke: MUT }); mono(yr(v), 226, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    [['GPT-4o', 2023 + 9.5 / 12, ACC, 0], ['Claude 3.5', 2024 + 3.5 / 12, INFO, 1], ['Gemini 1.5', 2024 + 4.5 / 12, GOOD, 2]].forEach(([n, v, col, i]) => { const s = o.anim ? pop(u, 0.3 + i * 0.35) : 1;
      const ly = [98, 124, 150][i], left = i === 0;
      el('circle', { cx: yr(v), cy: 200, r: 7 * s, fill: col }); el('line', { x1: yr(v), y1: 192, x2: yr(v), y2: ly + 4, stroke: col, 'stroke-width': 1.5, opacity: s });
      tx(left ? yr(v) - 6 : yr(v) + 6, ly, n + ' · ' + ['2023-10', '2024-04', '2024-05'][i], { 'font-size': 14, 'font-weight': 700, fill: col, opacity: s, class: 'mono', 'text-anchor': left ? 'end' : 'start' }); });
    if (o.today) { const tx0 = yr(2026 + 4 / 12), s = o.todayS ?? 1; el('line', { x1: tx0, y1: 120, x2: tx0, y2: 214, stroke: BAD, 'stroke-width': 3, opacity: s });
      mono(tx0, 110, 'today (예: 2026-05-07)', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 800, opacity: s }); } }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    limits(c);
    timeline(u, { anim: k === 0, today: k >= 1, todayS: k === 1 ? fade(u, 0.6) : 1 });
    if (k === 0) { note(X0, 290, '마감일 뒤의 세상은 전혀 모른다', fade(u, 1.6)); return; }
    if (k === 1) { mono(X0, 290, 'from datetime import date', { 'font-size': 15, opacity: fade(u, 0.3) }); note(X0, 324, '실행 시점의 오늘을 질문에 넣는다', fade(u, 1.0)); return; }
    if (k === 2) { card(330, 300, 460, 40, { rx: 8, stroke: INFO, fill: INFOBG, s: pop(u, 0.3) });
      mono(110, 305, 'system', { 'font-size': 14, fill: INFO, 'font-weight': 800, opacity: fade(u, 0.4) }); tx(180, 305, '당신은 정직한 AI 어시스턴트입니다.', { 'font-size': 14.5, opacity: fade(u, 0.5) });
      note(110, 360, '모르는 것을 지어내지 말라는 안전장치', fade(u, 1.2)); return; }
    if (k === 3) { mono(X0, 290, 'q = f"{today} 서울 날씨와 비트코인 시세 알려줘"', { 'font-size': 14.5, opacity: fade(u, 0.2) });
      bubble(X0, 312, 520, '2026-05-07 ' + (b.userAsk || '').replace(/^오늘 /, ''), fade(u, 1.0), { fill: ACCBG, stroke: ACC }); return; }
    const ans = wrap(b.llmAnswer || '', 34);
    bubble(X0, 262, 600, ans, k === 4 ? fade(u, 0.4) : 1, { fill: SOFT, stroke: GRID });
    sub(800, 300, '예시 출력', 1);
    if (k === 4) note(X0, 380, '지어내지 않았지만 아무것도 해결하지 못했다', fade(u, 1.6), { fill: WARN });
    if (k === 5) { const a = yr(2023 + 9.5 / 12), z = yr(2026 + 4 / 12);
      el('rect', { x: a, y: 186, width: (z - a) * E(u, 0.2, 1.2), height: 28, rx: 4, fill: BAD, opacity: 0.18 });
      mono((a + z) / 2, 250, '모르는 구간 · 보통 6~18개월 이상', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      note(X0, 390, '프롬프트를 다듬어도 없는 데이터는 나오지 않는다 · 외부 도구가 필요하다', fade(u, 1.6), { 'font-size': 14.5 }); } }

  // ---------- 3. 행동 불가 ----------
  function mailbox(cx, cy, n, s) { card(cx, cy, 170, 110, { rx: 10, stroke: INK, s });
    tx(cx, cy - 24, '보낸 편지함', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); mono(cx, cy + 22, String(n), { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: n ? GOOD : BAD, opacity: s }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    limits(c);
    if (k === 0) { llmBox(480, 200, { s: pop(u, 0.2) }); note(330, 300, '앞의 두 예제와 똑같은 준비', fade(u, 0.8), { fill: MUT }); note(330, 330, '달라지는 건 요청 내용뿐이다', fade(u, 1.2)); return; }
    if (k === 1) { R.spans(120, 150, [['def ask_llm_to_act(request: str) ', {}], ['-> str', { fill: BAD, 'font-weight': 800, 'text-decoration': 'underline' }], [':', {}]], { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      note(120, 220, '돌아오는 것은 언제나 문자열 하나', fade(u, 1.4), { fill: BAD }); return; }
    person(70, 120, null, {});
    bubble(110, 90, 470, b.userAsk || '', k === 2 ? fade(u, 0.2) : 1, { fill: ACCBG, stroke: ACC });
    if (k === 2) { mailbox(780, 260, 0, pop(u, 1.0)); note(110, 280, '텍스트를 만드는 게 아니라 실제로 보내 달라는 요청', fade(u, 1.4)); return; }
    if (k === 3) { bubble(110, 160, 470, b.llmAnswer || '', fade(u, 0.3)); sub(500, 308, '예시 출력', 1); mailbox(780, 260, 0, 1); note(690, 360, '아무 일도 없었다', fade(u, 1.6), { fill: BAD }); return; }
    // k4: 출력 통로
    llmBox(300, 280, {});
    [['텍스트', 0, true], ['네트워크', 1, false], ['파일', 2, false], ['키보드·마우스', 3, false]].forEach(([n, i, ok]) => { const y = 200 + i * 54, s = pop(u, 0.2 + i * 0.25);
      grow(366, 280, 560, y, E(u, 0.2 + i * 0.25, 0.7 + i * 0.25), ok ? GOOD : GRID, { plain: !ok, dash: ok ? null : '5 5' });
      card(640, y, 150, 40, { rx: 8, text: n, fs: 14.5, stroke: ok ? GOOD : GRID, color: ok ? GOOD : MUT, s }); if (!ok) cross(560, y, 8, s); });
    note(110, 405, 'LLM의 출력 통로는 텍스트 하나뿐이다', fade(u, 1.6)); }

  // ---------- 4. RAG ----------
  const DOCS = ['nobel_2024.pdf', 'nobel_2023.pdf', 'physics_faq.md'];
  function s4(t, c) { const { k, u } = c, b = c.beat;
    limits(c);
    dbIcon(110, 170, 'Chroma ./kb', { s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { DOCS.forEach((d, i) => { card(330, 120 + i * 46, 190, 36, { rx: 6, text: d, fs: 14, mono: true, stroke: GRID, s: pop(u, 0.8 + i * 0.2) }); grow(250, 120 + i * 46, 160, 170, E(u, 1.0 + i * 0.2, 1.4 + i * 0.2), GRID); });
      note(80, 330, 'LLM 밖에 처음으로 믿을 자료가 생겼다', fade(u, 1.8)); return; }
    // 질문 → 검색 → 문서 3건
    mono(250, 92, 'ask_with_rag("2024년 노벨 물리학상 수상자는?")', { 'font-size': 14.5, 'font-weight': 700 });
    DOCS.forEach((d, i) => { const y = 140 + i * 42; if (k === 1) fly(160, 170, 330 + 0, y, seg(u, 0.4 + i * 0.25, 1.2 + i * 0.25), d, { mono: true, fill: INFO, stay: true });
      if (k > 1) card(330, y, tw(d, 13.5) + 24, 30, { rx: 14, text: d, fs: 13.5, mono: true, fill: INFO, stroke: 'none', color: PANEL }); });
    if (k === 1) { mono(250, 290, 'docs = db.similarity_search(question, k=3)', { 'font-size': 14, opacity: fade(u, 1.6) }); mono(250, 316, 'sources = [d.metadata["source"] …]', { 'font-size': 14, opacity: fade(u, 1.9) }); return; }
    if (k === 2 || k === 3) { const L = ['다음 자료만을 근거로 답하시오.', '자료에 없으면 "모릅니다"라고 답하시오.', '', '[자료]  …검색한 문서 3건…', '[질문]  2024년 노벨 물리학상 수상자는?'];
      el('rect', { x: 470, y: 120, width: 460, height: 150, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      L.forEach((s, i) => mono(486, 146 + i * 26, s, { 'font-size': 13.5, fill: i < 2 ? ACC : INK, 'font-weight': i < 2 ? 700 : 500, opacity: k === 2 ? fade(u, 0.2 + i * 0.25) : 1 }));
      if (k === 2) note(470, 300, '근거를 자료로 묶어 지어낼 자리를 없앤다', fade(u, 1.8));
      if (k === 3) [['환각', 'RAG + 출처 검증'], ['지식 단절', '실시간 API 도구'], ['행동 불가', '외부 함수 도구']].forEach(([a, d], i) => { const y = 310 + i * 36, s = pop(u, 0.3 + i * 0.3);
        card(560, y, 180, 30, { rx: 15, text: a, fs: 14, stroke: BAD, color: BAD, s }); grow(654, y, 704, y, s, GOOD); card(800, y, 180, 30, { rx: 15, text: d, fs: 14, stroke: GOOD, color: GOOD, fill: GOODBG, s }); });
      return; }
    // k4, k5: 답 + 출처
    const L = ['{', '  "answer": "존 홉필드, 제프리 힌턴",', '  "sources": ["nobel_2024.pdf", …]', '}'];
    el('rect', { x: 470, y: 120, width: 440, height: 124, rx: 10, fill: SOFT, stroke: GOOD, 'stroke-width': 1.8 });
    L.forEach((s, i) => mono(488, 148 + i * 26, s, { 'font-size': 14.5, 'font-weight': i === 2 ? 800 : 500, fill: i === 2 ? GOOD : INK, opacity: k === 4 ? fade(u, 0.2 + i * 0.25) : 1 }));
    sub(690, 268, '실제 2024년 수상자 · 출처로 사람이 검증한다', k === 4 ? fade(u, 1.4) : 1);
    if (k === 4) note(470, 320, '같은 방식으로 실시간 API를 붙이면 지식 단절도 처방된다', fade(u, 1.8), { 'font-size': 14.5 });
    if (k === 5) note(470, 320, '도구로 외부 함수를 부르면 행동 불가까지 처방된다', fade(u, 0.8), { 'font-size': 14.5 }); }

  // ---------- 5. Agent 통합 ----------
  const TOOLS = [['search_kb', '환각', 'query'], ['get_weather', '지식 단절', 'city'], ['send_email', '행동 불가', 'to, subject, body']];
  function loop(active, u) { // LLM ↔ 런타임 고리
    const cx = 190, cy = 270, r = 95;
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 2.5 });
    [['LLM 판단', cx, cy - r, 0], ['도구 실행', cx + r, cy + 30, 1], ['결과 되돌리기', cx - r, cy + 30, 2]].forEach(([n, x, y, i]) => { const on = active === i;
      card(x, y, tw(n, 14) + 26, 32, { rx: 16, text: n, fs: 14, fw: 700, fill: on ? ACC : PANEL, stroke: on ? ACC : GRID, color: on ? PANEL : INK }); });
    const a = -Math.PI / 2 + (u * 2.2) * Math.PI; el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 6, fill: ACC }); }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    limits(c);
    if (k <= 3) { mono(40, 92, 'import requests, smtplib, json', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
      TOOLS.forEach(([n, lim, arg], i) => { const y = 150 + i * 80, on = k === i + 1, s = k === 0 ? pop(u, 0.6 + i * 0.25) : 1;
        card(250, y, 300, 56, { rx: 10, stroke: on ? GOOD : GRID, sw: on ? 3 : 1.6, fill: on ? GOODBG : PANEL, s });
        mono(120, y - 2, 'def ' + n + '(…)', { 'font-size': 15, 'font-weight': 800, fill: on ? GOOD : INK, opacity: s }); tx(120, y + 20, lim + ' 처방', { 'font-size': 13.5, fill: MUT, opacity: s });
        if (on) { grow(410, y, 520, y, E(u, 0.4, 0.9), GOOD);
          const D = [['db.similarity_search(query, k=3)', '사내 지식에서 사실을 찾는다'], ['requests.get(날씨 API).json()', '학습 데이터에 없던 오늘의 값'], ['smtplib.SMTP(…).sendmail(…)', '메일이 실제로 나간다']][i];
          mono(540, y - 2, D[0], { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.8) }); tx(540, y + 20, D[1], { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1) }); } });
      if (k === 0) note(560, 380, '세 처방을 평범한 파이썬 함수로 옮긴다', fade(u, 1.6));
      return; }
    if (k === 4) { const L = ['tools = [', '  {"type": "function", "function": {', '    "name": "get_weather",', '    "description": "도시의 실시간 날씨 조회",', '    "parameters": {"type": "object",', '      "properties": {"city": {"type": "string"}}}}},', '  … search_kb, send_email …', ']'];
      el('rect', { x: 120, y: 80, width: 640, height: L.length * 28 + 20, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      L.forEach((s, i) => mono(140, 108 + i * 28, s, { 'font-size': 14.5, fill: /name|description|parameters/.test(s) ? ACC : INK, 'font-weight': /name/.test(s) ? 800 : 500, opacity: fade(u, 0.2 + i * 0.18) }));
      note(120, 360, '이름·설명·파라미터를 알아야 LLM이 언제 쓸지 고른다', fade(u, 1.9)); return; }
    // k5~7: 루프 + 메시지 기록
    loop(k === 5 ? 0 : k === 6 ? 1 : 2, u);
    const LOG = [
      ['user', '노벨상 정보 + 오늘 날씨 + 휴가 메일 보내기', ACC, 5],
      ['assistant', 'tool_calls: [{"id": "call_1", "function":', INFO, 6],
      ['', '  {"name": "search_kb", "arguments": "{\\"query\\": …}"}}]', INFO, 6],
      ['tool', '{"tool_call_id": "call_1", "content": "…"}', GOOD, 7],
    ];
    LOG.forEach(([r, s, col, kk], i) => { if (k < kk) return; const y = 110 + i * 40, op = k === kk ? fade(u, 0.3 + (i % 2) * 0.3) : 1;
      if (r) { el('rect', { x: 330, y: y - 18, width: 96, height: 26, rx: 13, fill: col, opacity: op }); mono(378, y, r, { 'font-size': 13.5, fill: PANEL, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); }
      mono(438, y, s, { 'font-size': 13.5, opacity: op }); });
    if (k === 5) { mono(330, 80, 'while True:  create(messages, tools=tools)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) }); return; }
    if (k >= 6) sub(860, 270, 'arguments 값은 예시', 1);
    const ans = (b.llmAnswer || '').split('\n');
    ans.forEach((s, i) => { const y = 300 + i * 32, op = k === 6 ? fade(u, 1.2) : (i === 0 ? 1 : fade(u, 0.6 + i * 0.4));
      card(620, y, 520, 28, { rx: 6, fill: GOODBG, stroke: GOOD, sw: 1.4, op }); tx(380, y + 5, s, { 'font-size': 14, opacity: op, 'font-weight': 600 }); });
    if (k === 7) note(330, 410, 'tool_calls가 없을 때 최종 답이 나온다', fade(u, 1.9), { fill: ACC, 'font-size': 14.5 }); }

  const quiz = [
    { q: '"2030년 노벨 물리학상 수상자"를 묻자 LLM이 이름까지 대며 답했다. 무엇이 일어난 것인가?',
      o: ['환각, 그럴듯한 다음 토큰으로 사실 아닌 답을 만들었다', '최신 뉴스를 검색했다', '미래를 예측하는 기능이 켜졌다'], a: 0,
      why: 'LLM은 사실 여부와 상관없이 매끄러운 문장을 만든다. 2030년은 미래이고 이재훈 교수도 TimeFold 모델도 실재하지 않는다.' },
    { q: '정직하게 답하라는 system을 넣은 뒤 오늘 날씨를 물으면 어떻게 되나?',
      o: ['정확한 날씨를 알려 준다', '학습 마감일을 밝히고 모른다고 답한다', '에러를 낸다'], a: 1,
      why: '지어내지는 않지만 해결도 못 한다. GPT-4o의 학습 데이터는 2023년 10월에서 끊겨 있어 오늘의 값이 없다.' },
    { q: 'ask_llm_to_act()로 "메일 보내줘"를 요청한 결과는 무엇인가?',
      o: ['메일이 실제로 발송된다', '메일 앱이 자동으로 열린다', '보내는 방법을 설명한 문자열만 돌아온다'], a: 2,
      why: 'LLM의 출력 통로는 텍스트뿐이다. 반환 타입부터 str이라 네트워크나 파일을 건드릴 수 없다.' },
    { q: 'RAG가 환각을 줄이는 방법은 무엇인가?',
      o: ['모델을 다시 학습시킨다', '검색한 자료만 근거로 답하게 하고 출처를 함께 돌려준다', 'temperature를 0으로 둔다'], a: 1,
      why: '먼저 지식 베이스에서 관련 문서 3건을 찾아 넣고, 자료에 없으면 모른다고 하게 한다. 출처가 있어 사람이 검증할 수 있다.' },
    { q: 'Agent 루프에서 LLM과 코드가 나눠 맡는 일은 무엇인가?',
      o: ['LLM이 도구를 고르고, 런타임 코드가 실제로 실행한다', 'LLM이 도구를 직접 실행한다', '코드가 도구를 고르고 LLM이 실행한다'], a: 0,
      why: 'LLM은 tool_calls로 이름과 인자만 내놓는다. 런타임이 함수를 부르고 결과를 role="tool" 메시지로 되돌린다.' },
  ];

  const summary = [
    'LLM은 모르는 사실도 그럴듯한 문장으로 지어내고, 문장만 봐서는 구별하기 어렵다.',
    '학습 마감일 뒤의 정보는 없어서 오늘 날씨나 시세는 정직하게 거절할 수밖에 없다.',
    'LLM의 출력은 텍스트뿐이라 메일 발송 같은 실제 행동은 혼자 하지 못한다.',
    'RAG와 도구를 묶어 LLM이 고르고 코드가 실행하는 루프를 돌리면 세 한계를 메운다.',
  ];
  const review = [
    { q: '사내 규정 질문에 챗봇이 없는 조항을 지어냈다. 가장 먼저 붙일 것은?',
      o: ['규정 문서를 검색해 근거와 출처로 붙이는 RAG', '같은 질문을 더 큰 모델에 다시 보내기', '응답 길이를 짧게 제한하기'], a: 0,
      why: '환각은 근거가 없을 때 생긴다. 검색한 자료만 쓰게 하고 출처를 붙이면 지어낸 답을 막고 검증도 할 수 있다.' },
    { q: 'Agent가 get_weather를 부른 뒤 다음 호출에서 400 에러가 난다. tool 메시지는 넣었다. 빠졌을 가능성이 큰 것은?',
      o: ['tools 스펙의 description', 'tool_calls가 담긴 assistant 메시지를 messages에 넣는 일', 'system 메시지'], a: 1,
      why: 'tool 메시지는 자신을 부른 assistant 메시지 바로 뒤에 와야 한다. messages.append(msg)를 먼저 해야 tool_call_id가 짝을 찾는다.' },
    { q: '"오늘 환율 알려주고 팀에 메일로 공유해줘"를 처리하려면 어떤 처방들이 필요한가?',
      o: ['RAG 하나면 된다', 'system 프롬프트를 길게 쓰면 된다', '실시간 API 도구와 메일 발송 도구'], a: 2,
      why: '오늘 환율은 학습 데이터에 없고 메일 발송은 행동이다. 각각 실시간 조회 도구와 외부 함수 도구가 맡는다.' },
  ];

  R.page({ title: 'LLM의 세 한계와 처방', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
