/* I-2-1 PromptTemplate — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 양식·변수·렌더 결과는 STEPS 의 dataState 를 읽는다. 출력 문자열과 input_variables 는 langchain-core 1.8.4 로 실행해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, spans, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const VC = { topic: [WARN, WARNBG], style: [INFO, INFOBG], role: [WARN, WARNBG], question: [INFO, INFOBG], word: [WARN, WARNBG], history: [ACC, ACCBG], input: [INFO, INFOBG] };
  const vcol = (n) => VC[n] || [INK, PANEL];
  // 변수 카드: 이름 = 값
  function varCard(x, y, name, val, s) { const [c, bg] = vcol(name), w = Math.max(tw(name, 14), tw(val || '(빈칸)', 14)) + 30;
    card(x + w / 2, y, w, 52, { rx: 10, stroke: c, fill: bg, sw: 2, s }); if ((s ?? 1) < 0.4) return w;
    mono(x + 14, y - 6, name, { 'font-size': 14, 'font-weight': 800, fill: c }); tx(x + 14, y + 16, val == null ? '(빈칸)' : val, { 'font-size': 14, fill: val == null ? MUT : INK }); return w; }
  // 양식 한 줄: 'a{x}b' → 슬롯은 색 칸. fill[name] = 값(있으면 채움)
  function line(x, y, tpl, fill, o) { o = o || {}; let cx = x; const fs = o.fs || 15;
    tpl.split(/(\{\w+\})/).forEach((p) => { if (!p) return; const m = p.match(/^\{(\w+)\}$/);
      if (m) { const n = m[1], v = fill && fill[n], [c, bg] = vcol(n), s = v != null ? v : p, w = tw(s, fs) + 14;
        el('rect', { x: cx, y: y - fs - 3, width: w, height: fs + 12, rx: 5, fill: v != null ? bg : PANEL, stroke: c, 'stroke-width': 1.8, 'stroke-dasharray': v != null ? null : '4 3', opacity: o.op ?? 1 });
        tx(cx + 7, y, s, { 'font-size': fs, 'font-weight': 700, fill: c, class: v != null ? null : 'mono', opacity: o.op ?? 1 }); cx += w + 2; }
      else { tx(cx, y, p, { 'font-size': fs, fill: o.col || INK, class: o.mono ? 'mono' : null, opacity: o.op ?? 1 }); cx += tw(p, fs) + 1; } }); return cx; }
  // 종이 양식
  function paper(x, y, w, h, title, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return;
    el('path', { d: `M${x},${y} H${x + w - 22} L${x + w},${y + 22} V${y + h * s} H${x} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 });
    el('path', { d: `M${x + w - 22},${y} V${y + 22} H${x + w}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 2 });
    if (title) tx(x + 16, y + 24, title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono', opacity: s > 0.5 ? 1 : 0 }); }
  const ds = (c) => c.beat.dataState, vmap = (vs) => { const o = {}; (vs || []).forEach((v) => { if (v.value != null) o[v.name] = v.value; }); return o; };

  // ---------- 1. f-string ----------
  const TPL = '{topic}에 대해 {style}으로 설명해줘';
  function s1(t, c) { const { k, u } = c, d = ds(c);
    const vs = d.variables; let x = 40; vs.forEach((v, i) => { x += varCard(x, 86, v.name, '"' + v.value + '"', k === 0 ? pop(u, 0.2 + i * 0.3) : 1) + 16; });
    if (k === 0) { note(480, 200, '이 두 값이 어디에 쓰일지는 코드를 더 읽어야 안다', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { mono(40, 170, 'prompt = f"', { 'font-size': 16, opacity: fade(u, 0.1) });
      const f = E(u, 0.6, 1.4); if (f < 1) line(140, 170, TPL, null, { op: 1 - f });
      fly(70, 86, 160, 160, seg(u, 0.5, 1.2), '파이썬', { fill: WARN }); fly(260, 86, 300, 160, seg(u, 0.6, 1.3), '초등학생도 이해하게', { fill: INFO });
      if (f >= 1) tx(140, 170, d.rendered + '"', { 'font-size': 16, 'font-weight': 700 });
      note(480, 250, '실행하는 순간 빈칸이 값으로 바뀌고 양식은 사라진다', fade(u, 1.8), { 'text-anchor': 'middle' });
      note(480, 280, '양식은 이 줄 안에만 박혀 있다', fade(u, 2.2), { 'text-anchor': 'middle', fill: WARN }); return; }
    if (k === 2) { tx(40, 166, d.rendered, { 'font-size': 15, fill: MUT });
      [['재사용이 어렵다', '양식과 변수가 코드에 섞임'], ['NameError가 늦게', '그 줄이 실행돼야 터진다'], ['DRY 위배', '같은 양식을 복사'], ['검증 · 문서화 곤란', '필요한 변수 목록이 없다']].forEach(([a, z], i) => {
        const cx = 130 + (i % 2) * 380, cy = 230 + Math.floor(i / 2) * 84, s = pop(u, 0.3 + i * 0.35); card(cx + 70, cy, 340, 66, { rx: 10, stroke: BAD, fill: BADBG, s });
        if (s > 0.4) { mono(cx - 84, cy + 6, `${i + 1}`, { 'font-size': 20, 'font-weight': 800, fill: BAD }); tx(cx - 56, cy - 4, a, { 'font-size': 16, 'font-weight': 800 }); tx(cx - 56, cy + 18, z, { 'font-size': 13.5, fill: MUT }); } });
      return; }
    // k 3~5: 복사본이 늘어난다
    const copies = [['prompt = f"…"', TPL], ['def explain(topic, style):', TPL], ['def explain_v2(topic, style, lang):', '{topic}에 대해 {style}으로, {lang}로 설명해줘']];
    const n = k === 3 ? 2 : 3;
    copies.slice(0, n).forEach(([h, tp], i) => { const y = 150 + i * 84, s = (k === 3 && i === 1) || (k === 4 && i === 2) ? pop(u, 0.3) : 1;
      paper(40, y - 34, 560, 70, null, { s, stroke: i ? WARN : INK }); if (s < 0.5) return;
      mono(56, y - 8, h, { 'font-size': 14, fill: MUT }); line(56, y + 22, tp, null, { fs: 14.5 }); });
    mono(800, 190, `양식 복사본 ${n}개`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: n > 2 ? BAD : WARN, opacity: k >= 4 ? 1 : fade(u, 1.0) });
    sub(800, 220, k === 3 ? '함수로 감싸도 양식은 함수 안에 박힌다' : '변형 하나마다 함수 하나, 양식 하나', k >= 4 ? 1 : fade(u, 1.3), { 'font-size': 14 });
    if (k === 5) { card(800, 300, 280, 70, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 0.3) });
      mono(800, 296, "NameError: name 'topic'", { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.5) }); mono(800, 316, 'is not defined', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.5) });
      sub(800, 356, '그 줄이 실행될 때에야 터진다', fade(u, 1.0), { 'font-size': 14 });
      banner(320, 400, '양식을 코드에서 떼어 내자 → PromptTemplate', pop(u, 1.8)); } }

  // ---------- 2. PromptTemplate ----------
  function s2(t, c) { const { k, u } = c, d = ds(c), p = c.prev ? ds(c.prev) : {};
    if (k === 0) { mono(480, 110, 'from langchain_core.prompts import PromptTemplate', { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      paper(330, 160, 300, 180, 'template', { s: E(u, 0.8, 1.6) }); note(480, 380, '양식을 하나의 객체로 다룬다', fade(u, 1.9), { 'text-anchor': 'middle' }); return; }
    if (k === 6) { // 파이프의 첫 부품
      [['template', 170], ['llm', 480], ['parser', 790]].forEach(([s, x], i) => { card(x, 200, 220, 64, { rx: 12, text: s, fs: 18, mono: true, stroke: i ? INK : ACC, fill: i ? PANEL : ACCBG, color: i ? INK : ACC, s: pop(u, 0.2 + i * 0.3) });
        if (i) tx(x - 155, 214, '|', { 'font-size': 38, 'font-weight': 800, class: 'mono', fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.3) }); });
      note(480, 300, '양식이 객체라서 파이프의 첫 부품이 된다', fade(u, 1.5), { 'text-anchor': 'middle' }); return; }
    // 양식 종이
    const fillNow = k >= 3 ? vmap(d.variables) : null, f = k === 3 ? E(u, 1.2, 1.4) : 1;
    paper(40, 70, 540, 120, 'PromptTemplate.from_template(…)', { s: k === 1 ? E(u, 0.2, 0.8) : 1, stroke: ACC });
    if (k >= 1) line(60, 140, d.template, k === 5 ? null : f >= 1 ? fillNow : null, { op: k === 1 ? fade(u, 0.6) : 1 });
    if (k === 1) { note(800, 140, '빈칸 두 개, 값은 아직 없다', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { mono(620, 110, 'template.input_variables', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      d.inputVariables.forEach((n, i) => { const [col] = vcol(n); fly(i ? 80 : 270, 132, 690 + i * 100, 146, seg(u, 0.5 + i * 0.3, 1.1 + i * 0.3), n, { fill: col, mono: true });
        if (u > 1.1 + i * 0.3) pill(690 + i * 100, 146, `'${n}'`, col, 1, { mono: true, fs: 14 }); });
      sub(740, 182, '알파벳 순으로 돌려준다', fade(u, 1.8), { 'font-size': 14 });
      card(480, 300, 760, 70, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 2.0) });
      mono(480, 296, 'template.invoke({"topic": "x"})', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      mono(480, 318, "KeyError: missing variables {'style'}", { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 3) { let x = 60; d.variables.forEach((v, i) => { x += varCard(x, 260, v.name, v.value, pop(u, 0.2 + i * 0.2)) + 16; });
      fly(110, 260, 100, 140, seg(u, 0.6, 1.2), '파이썬', { fill: WARN }); fly(300, 260, 250, 140, seg(u, 0.7, 1.3), '초등학생도 이해하게', { fill: INFO });
      grow(590, 130, 680, 130, seg(u, 1.5, 1.8), ACC); card(790, 130, 200, 50, { rx: 10, text: 'StringPromptValue', fs: 14, mono: true, stroke: ACC, s: pop(u, 1.8) }); return; }
    if (k === 4) { mono(60, 250, 'result.to_string()', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      card(320, 296, 560, 48, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 0.3) }); tx(60, 302, '"' + d.rendered + '"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      note(780, 140, 'f-string과 같은 결과', fade(u, 1.0), { 'text-anchor': 'middle' }); note(780, 168, '양식은 객체로 남아 있다', fade(u, 1.4), { 'text-anchor': 'middle', fill: ACC }); return; }
    // k 5: 같은 양식, 다른 값
    const R3 = [['파이썬', '초등학생도 이해하게'], ['Docker', '비유로'], ['Git', '한 줄로']];
    R3.forEach(([a, z], i) => { const y = 240 + i * 52, s = pop(u, 0.3 + i * 0.4);       card(400, y, 700, 40, { rx: 8, stroke: i ? INK : GRID, s }); if (s < 0.4) return;
      const end = line(64, y + 6, '{topic}에 대해 {style}', { topic: a, style: z }, { fs: 14.5 }); tx(end, y + 6, '으로 설명해줘', { 'font-size': 14.5, fill: i ? BAD : INK, 'font-weight': i ? 800 : 400 }); });
    note(780, 112, '양식 1개로 값만 바꾼다', fade(u, 1.0), { 'text-anchor': 'middle' });
    sub(780, 144, '"비유로으로"처럼 고정 글자는 그대로 붙는다', fade(u, 1.9), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); }

  // ---------- 3. ChatPromptTemplate ----------
  function s3(t, c) { const { k, u } = c, d = ds(c), msgs = d.chatMessages || [];
    if (k === 0) { card(220, 200, 320, 60, { rx: 10, text: '"하나의 긴 문자열"', fs: 16, stroke: MUT, color: MUT, s: pop(u, 0.2) }); sub(220, 260, 'PromptTemplate', fade(u, 0.4), { class: 'mono' });
      grow(400, 200, 520, 200, seg(u, 0.8, 1.2), ACC);
      [['System', INFO], ['Human', INK], ['AI', ACC], ['Human', INK]].forEach(([r, col], i) => card(720, 120 + i * 54, 260, 42, { rx: 8, text: r + 'Message', fs: 15, mono: true, stroke: col, color: col, s: pop(u, 1.2 + i * 0.2) }));
      sub(720, 352, 'ChatModel은 메시지 배열을 받는다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    const fill = k >= 3 ? vmap(d.variables) : null;
    // 역할별 양식 두 줄
    msgs.forEach((m, i) => { const y = 112 + i * 64, col = m.role === 'system' ? INFO : INK, s = k === 1 ? pop(u, 0.3 + i * 0.4) : 1;
      card(330, y, 580, 52, { rx: 10, stroke: col, s }); if (s < 0.4) return;
      tx(56, y + 5, m.role, { 'font-size': 14, 'font-weight': 800, fill: col });
      const done = m.renderedText && !m.renderedText.startsWith('('), fl = done ? fill : (k === 3 ? (u > 1.3 ? fill : null) : null);
      line(130, y + 6, m.templateText, fl, { fs: 14.5 }); });
    if (k === 1) { note(780, 300, '{role} · {question}은 아직 빈칸', fade(u, 1.5), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { mono(660, 110, 'input_variables', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      d.variables.slice().sort((a, b) => (a.name < b.name ? -1 : 1)).forEach((v, i) => { const [col] = vcol(v.name); pill(700 + i * 120, 150, `'${v.name}'`, col, pop(u, 0.5 + i * 0.3), { mono: true, fs: 14 }); });
      note(480, 260, 'system과 human에 흩어진 빈칸을 모두 찾는다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    if (k === 3) { let x = 40; d.variables.forEach((v, i) => { x += varCard(x, 300, v.name, v.value, pop(u, 0.2 + i * 0.2)) + 16; });
      fly(90, 300, 230, 112, seg(u, 0.6, 1.25), '파이썬', { fill: WARN }); fly(300, 300, 190, 176, seg(u, 0.7, 1.3), '리스트 컴프리헨션이 뭐야?', { fill: INFO });
      card(800, 300, 220, 48, { rx: 10, text: 'ChatPromptValue', fs: 15, mono: true, stroke: ACC, s: pop(u, 1.8) }); return; }
    // k 4,5: 완성된 메시지
    mono(40, 236, 'result.to_messages()', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
    msgs.forEach((m, i) => { const done = !m.renderedText.startsWith('('), y = 272 + i * 46, s = done ? ((k === 4 && i === 0) || (k === 5 && i === 1) ? E(u, 0.3, 1.0) : 1) : 0; if (s <= 0) return;
      const col = i ? INK : INFO; el('rect', { x: 40, y: y - 18, width: 600 * s, height: 36, rx: 8, fill: i ? PANEL : INFOBG, stroke: col, 'stroke-width': 1.8 });
      if (s > 0.7) { mono(54, y + 5, i ? 'HumanMessage' : 'SystemMessage', { 'font-size': 13.5, 'font-weight': 800, fill: col }); tx(190, y + 5, m.renderedText, { 'font-size': 14.5 }); } });
    if (k === 5) { grow(650, 295, 700, 295, seg(u, 1.1, 1.4), ACC); card(800, 295, 190, 44, { rx: 10, text: 'ChatOpenAI', fs: 15, mono: true, stroke: ACC, s: pop(u, 1.4) });
      sub(800, 350, 'system = 페르소나 · 규칙', fade(u, 1.8), { 'font-size': 14 }); sub(800, 372, 'human = 질문', fade(u, 2.0), { 'font-size': 14 }); } }

  // ---------- 4. FewShotPromptTemplate ----------
  function s4(t, c) { const { k, u } = c, d = ds(c), exs = d.examples || [], word = (d.variables.find((v) => v.name === 'word') || {}).value;
    if (k === 0) { ['FewShotPromptTemplate', 'PromptTemplate'].forEach((s, i) => pill(300 + i * 360, 160, s, i ? INK : ACC, pop(u, 0.2 + i * 0.3), { mono: true, fs: 16 }));
      sub(300, 200, '전체 양식', fade(u, 0.8), { 'font-size': 14 }); sub(660, 200, '예시 하나를 그릴 작은 양식', fade(u, 1.0), { 'font-size': 14 });
      note(480, 300, '말로 설명하기 어려우면 예시를 보여 준다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    // 왼쪽: 예시 카드
    tx(40, 80, 'examples', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    exs.forEach((e, i) => { const y = 112 + i * 50, s = k === 1 ? pop(u, 0.2 + i * 0.3) : 1; card(150, y, 220, 40, { rx: 8, stroke: GRID, s });
      if (s > 0.4) { tx(66, y + 5, e.input, { 'font-size': 15, 'font-weight': 700 }); tx(140, y + 5, '→', { 'font-size': 15, fill: MUT }); tx(170, y + 5, e.output, { 'font-size': 15, 'font-weight': 700, fill: ACC }); } });
    if (k === 1) { note(480, 330, '입력과 출력 쌍 3개를 dict 리스트로', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    // 가운데: 도장(example_prompt)
    card(150, 300, 220, 64, { rx: 10, stroke: INK, fill: SOFT, s: k === 2 ? pop(u, 0.2) : 1 });
    mono(150, 258, 'example_prompt', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    line(54, 300, '입력: {input}', null, { fs: 14 }); line(54, 326, '출력: {output}', null, { fs: 14 });
    if (k === 2) { note(560, 300, '예시 하나를 "입력 · 출력" 두 줄로 찍는 도장', fade(u, 1.0), { 'text-anchor': 'middle' }); return; }
    // 오른쪽: 조립된 문서
    const top = 70, x0 = 320; paper(x0, top, 600, 340, null, { s: k === 3 ? E(u, 0.2, 0.9) : 1, stroke: ACC });
    if (k === 3 && u < 0.9) return;
    tx(x0 + 20, top + 36, d.prefix, { 'font-size': 15, 'font-weight': 700 }); sub(x0 + 560, top + 36, 'prefix', 1, { 'text-anchor': 'end' });
    const ins = k >= 5; // 예시 삽입
    if (!ins) { el('rect', { x: x0 + 20, y: top + 54, width: 560, height: 168, rx: 8, fill: SOFT, stroke: GRID, 'stroke-dasharray': '5 4' }); sub(x0 + 300, top + 144, '예시가 들어올 자리', 1, { 'font-size': 14 }); }
    else exs.forEach((e, i) => { const y = top + 76 + i * 56, s = k === 5 ? E(u, 0.3 + i * 0.4, 0.7 + i * 0.4) : 1; if (s <= 0) return;
      if (k === 5) fly(150, 300, x0 + 100, y, seg(u, 0.1 + i * 0.4, 0.5 + i * 0.4), `${e.input} → ${e.output}`, {});
      tx(x0 + 20, y, `입력: ${e.input}`, { 'font-size': 14.5, opacity: s }); tx(x0 + 20, y + 22, `출력: ${e.output}`, { 'font-size': 14.5, fill: ACC, opacity: s }); });
    const sy = top + 260; line(x0 + 20, sy, '입력: {word}', k >= 4 && (k > 4 || u > 1.0) ? { word } : null, { fs: 15 }); tx(x0 + 20, sy + 30, '출력:', { 'font-size': 15 }); sub(x0 + 560, sy, 'suffix', 1, { 'text-anchor': 'end' });
    if (k === 3) note(160, 395, 'input_variables=["word"]', fade(u, 1.4), { 'text-anchor': 'middle', class: 'mono', 'font-size': 14 });
    if (k === 4) { fly(160, 360, x0 + 70, sy - 6, seg(u, 0.3, 1.0), '"큰"', { fill: WARN }); mono(160, 395, 'few_shot.format(word="큰")', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.1) }); }
    if (k === 6) { const bl = Math.floor(t * 2) % 2; el('rect', { x: x0 + 70, y: sy + 14, width: 14, height: 22, fill: ACC, opacity: bl ? 1 : 0.2 });
      note(x0 + 300, sy + 31, '← 모델이 채울 자리', fade(u, 0.3), { fill: ACC, 'font-size': 14 });
      sub(160, 395, 'ExampleSelector로 고를 수도 있다', fade(u, 1.4), { 'font-size': 13.5 }); } }

  // ---------- 5. MessagesPlaceholder ----------
  function bubble(x, y, w, role, text, s, o) { o = o || {}; if (s <= 0) return; const col = role === 'system' ? INFO : role === 'ai' ? ACC : INK;
    el('rect', { x, y: y - 17, width: w * s, height: 34, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 1.7 });
    if (s > 0.6) { mono(x + 12, y + 5, { system: 'System', human: 'Human', ai: 'AI' }[role], { 'font-size': 13.5, 'font-weight': 800, fill: col }); tx(x + 82, y + 5, text, { 'font-size': 14.5 }); } }
  function s5(t, c) { const { k, u } = c, d = ds(c), H = d.history || [], inp = (d.variables.find((v) => v.name === 'input') || {}).value;
    if (k === 0) { // 문자열 슬롯으로 넣으면?
      mono(40, 90, '("human", "{history}") 로 넣으면', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.1) });
      bubble(40, 136, 560, 'human', "[HumanMessage(content='안녕! 내 이름은…", E(u, 0.4, 1.0), { fill: BADBG });
      sub(320, 172, '배열이 글자로 뭉개져 메시지 하나가 된다', fade(u, 1.0), { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      mono(40, 236, 'MessagesPlaceholder("history") 로 넣으면', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      ['human', 'ai', 'human'].forEach((r, i) => bubble(40, 276 + i * 40, 400, r, i === 1 ? '안녕하세요 박서연님!' : i ? '오늘 기분이 좋아' : '안녕! 내 이름은 박서연이야', E(u, 1.6 + i * 0.2, 2.0 + i * 0.2)));
      sub(660, 316, '메시지가 하나하나 살아 있다', fade(u, 2.3), { 'font-size': 14, fill: ACC, 'font-weight': 700 }); return; }
    if (k === 5) { // 자동 누적 + 다섯 단계
      const steps = ['f-string', 'PromptTemplate', 'ChatPromptTemplate', 'FewShot', 'MessagesPlaceholder'], adds = ['코드에 박힘', '양식 분리', '역할 분리', '예시 삽입', 'history 주입'];
      steps.forEach((s, i) => { const x = 104 + i * 188, sc = pop(u, 0.2 + i * 0.25); card(x, 110, 172, 46, { rx: 10, text: s, fs: 14, mono: true, stroke: i ? ACC : BAD, color: i ? ACC : BAD, s: sc });
        sub(x, 152, adds[i], fade(u, 0.4 + i * 0.25), { 'font-size': 14 }); if (i) grow(x - 104, 110, x - 88, 110, seg(u, 0.3 + i * 0.25, 0.5 + i * 0.25), ACC); });
      card(480, 280, 420, 56, { rx: 12, text: 'RunnableWithMessageHistory', fs: 16, mono: true, stroke: INK, s: pop(u, 1.6) });
      const a = E(u, 1.8, 2.7) * Math.PI * 2; el('path', { d: `M300,280 A180,60 0 ${a > Math.PI ? 1 : 0} 1 ${480 - 180 * Math.cos(a)},${280 - 60 * Math.sin(a)}`, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: a > 0.05 ? 1 : 0 });
      sub(480, 370, 'history 저장 · 불러오기를 자동으로', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // 양식 (왼쪽)
    const filled = k >= 3, s0 = k === 1 ? E(u, 0.2, 0.8) : 1;
    zone(30, 62, 460, filled ? 340 : 190, 'prompt', { fill: SOFT, op: s0 });
    bubble(46, 110, 420, 'system', d.systemText, s0);
    const hh = filled ? H.length * 40 + 12 : 44, hy = 136;
    el('rect', { x: 46, y: hy, width: 420, height: hh, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': filled ? null : '5 4', opacity: s0 });
    if (!filled) mono(60, hy + 27, 'MessagesPlaceholder("history")', { 'font-size': 14, fill: ACC, opacity: s0 });
    else H.forEach((m, i) => bubble(54, hy + 26 + i * 40, 404, m.role, m.text, k === 3 ? E(u, 0.6 + i * 0.2, 1.0 + i * 0.2) : 1));
    const iy = hy + hh + 30; if (filled && inp && (k > 3 || u > 1.4)) bubble(46, iy, 420, 'human', inp, 1); else { tx(56, iy + 5, 'human', { 'font-size': 13.5, 'font-weight': 800, opacity: s0 }); line(130, iy + 6, '{input}', null, { fs: 14 }); }
    if (k === 1) { note(720, 170, '메시지 배열이 통째로', fade(u, 1.2), { 'text-anchor': 'middle' }); note(720, 196, '들어올 자리', fade(u, 1.2), { 'text-anchor': 'middle' }); return; }
    // 오른쪽: history 배열
    if (k === 2 || k === 3) { mono(560, 86, 'history = [', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.1) : 1 });
      H.forEach((m, i) => bubble(560, 120 + i * 42, 360, m.role, m.text, k === 2 ? E(u, 0.3 + i * 0.35, 0.7 + i * 0.35) : 1));
      mono(560, 260, ']', { 'font-size': 14.5, 'font-weight': 700 });
      if (k === 2) sub(740, 300, '턴이 늘면 길이도 는다', fade(u, 1.8), { 'font-size': 14 });
      if (k === 3) { fly(640, 296, 250, 200, seg(u, 0.2, 0.7), '[3개 메시지]', { fill: ACC }); pill(740, 320, '"input": "내 이름 기억해?"', INFO, pop(u, 0.9), { fs: 14 }); fly(740, 320, 250, iy, seg(u, 1.0, 1.4), '내 이름 기억해?', { fill: INFO }); }
      return; }
    // k 4: 다섯 개
    const parts = [['System', 1, INFO], ['history', 3, ACC], ['Human', 1, INK]];
    parts.forEach(([n, v, col], i) => { const x = 600 + i * 110, s = pop(u, 0.3 + i * 0.3); card(x, 180, 90, 70, { rx: 10, stroke: col, s });
      if (s > 0.4) { mono(x, 182, String(v), { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); sub(x, 204, n, 1, { 'font-size': 13.5 }); }
      if (i) tx(x - 55, 190, '+', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5 + i * 0.3) }); });
    mono(710, 260, '= 메시지 5개', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) });
    note(710, 300, '모델이 이름을 "기억"할 재료가 생겼다', fade(u, 1.9), { 'text-anchor': 'middle', 'font-size': 14 }); }

  const quiz = [
    { q: 'f-string으로 만든 프롬프트의 가장 큰 문제는 무엇인가?',
      o: ['양식이 실행 즉시 값과 섞여 코드 줄 안에만 남는다', '한글을 넣을 수 없다', '실행 속도가 느리다'], a: 0,
      why: 'f"{topic}에 대해…"는 실행되는 순간 문자열이 된다. 같은 양식을 쓰려면 함수마다 복사해야 해서 변형마다 복사본이 늘었다.' },
    { q: 'PromptTemplate.from_template("{topic}에 대해 {style}으로 설명해줘").input_variables는 무엇인가?',
      o: ["['topic', 'style']", "['style', 'topic']", '{topic} · {style}이 든 문자열'], a: 1,
      why: '양식에서 빈칸 이름을 찾아 알파벳 순 리스트로 준다. 하나를 빠뜨리고 invoke하면 바로 KeyError로 알려 준다.' },
    { q: 'ChatPromptTemplate.invoke({"role": "파이썬", "question": …})가 만드는 것은 무엇인가?',
      o: ['빈칸이 채워진 문자열 하나', 'AIMessage 하나', 'SystemMessage와 HumanMessage가 든 ChatPromptValue'], a: 2,
      why: '역할별 줄이 각각 메시지가 된다. system은 "너는 파이썬 전문가다…", human은 질문이 된다.' },
    { q: 'few_shot.format(word="큰")의 마지막 두 줄은 무엇인가?',
      o: ['"입력: 큰"과 "출력:"', '"입력: 빠른"과 "출력: 느린"', '"반대말을 답하세요."와 빈 줄'], a: 0,
      why: 'prefix, 예시 세 쌍, suffix 순으로 이어 붙인다. suffix의 "출력:" 뒤가 모델이 채울 자리다.' },
    { q: 'history 3개와 질문 하나를 넣은 prompt.invoke 결과의 메시지 수는?',
      o: ['3개', '5개', '2개'], a: 1,
      why: 'System 1개, history 3개, 마지막 Human 1개가 합쳐져 5개다. placeholder가 배열을 펼쳐 넣는다.' },
  ];

  const summary = [
    'f-string은 실행 즉시 양식이 사라져 변형마다 복사본이 늘어난다.',
    'PromptTemplate은 빈칸을 가진 양식 객체라 값만 바꿔 다시 쓴다.',
    'ChatPromptTemplate은 system과 human을 나눠 메시지 배열을 만든다.',
    'FewShot은 예시를 자동으로 끼우고 MessagesPlaceholder는 대화 기록을 통째로 넣는다.',
  ];
  const review = [
    { q: '챗봇이 앞에서 들은 이름을 기억하지 못한다. 양식에 ("human", "{history}") 줄이 있다. 바꿀 것은?',
      o: ['그 줄을 MessagesPlaceholder("history")로 바꾼다', 'system 문장을 더 길게 쓴다', 'FewShot 예시를 추가한다'], a: 0,
      why: '문자열 슬롯에 넣으면 대화 배열이 글자로 뭉개져 Human 메시지 하나가 된다. placeholder는 메시지를 하나씩 살려 넣는다.' },
    { q: '템플릿에 "{style}으로"를 두고 style에 "비유로"를 넣었더니 이상한 문장이 나왔다. 왜인가?',
      o: ['PromptTemplate이 조사를 자동으로 고치기 때문', '고정 글자 "으로"가 값 뒤에 그대로 붙어 "비유로으로"가 되기 때문', 'style이 input_variables에 없기 때문'], a: 1,
      why: '템플릿은 빈칸만 바꾸고 나머지 글자는 그대로 둔다. 값과 맞물리는 조사는 양식 쪽에서 함께 다듬어야 한다.' },
    { q: '번역체 말투를 고치고 싶은데 규칙을 말로 설명하기 어렵다. 어떤 양식이 맞나?',
      o: ['PromptTemplate 하나에 규칙을 길게 적는다', 'MessagesPlaceholder에 빈 배열을 넣는다', '고친 예시 몇 쌍을 FewShotPromptTemplate로 넣는다'], a: 2,
      why: '예시를 보여 주면 모델이 패턴을 따라 한다. FewShot은 예시 목록과 양식을 따로 관리해 바꾸기도 쉽다.' },
  ];

  R.page({ title: '편지 양식의 진화', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
