/* III-1-1 SequentialChain — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 값은 STEPS 의 flow(예시 LLM 출력)를 읽는다. 타입 흐름(dict → ChatPromptValue → AIMessage → str),
 * 변수 2개 prompt 의 TypeError, SequentialChain 의 만들 때 검사, format 지시문 792자는 langchain-core 1.8.4 로 실행해 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, kvTable } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 프롬프트 템플릿 한 줄: {변수}는 슬롯(점선 칸)으로, fill[변수]가 있으면 그 값으로 채운다
  function tline(x, y, s, o) { o = o || {}; const fs = o.fs || 14, anchor = o.anchor || 'start';
    const parts = s.split(/(\{[^}]+\})/).filter(Boolean), widths = parts.map((p) => {
      const m = p.match(/^\{(.+)\}$/), v = m && o.fill && o.fill[m[1]] != null ? o.fill[m[1]] : p; return tw(v, fs) + (m ? 10 : 0); });
    const total = widths.reduce((a, b) => a + b, 0); let cx = anchor === 'middle' ? x - total / 2 : x;
    parts.forEach((p, i) => { const m = p.match(/^\{(.+)\}$/), w = widths[i], op = o.op ?? 1;
      if (m) { const filled = o.fill && o.fill[m[1]] != null, bad = o.bad && o.bad === m[1];
        el('rect', { x: cx + 1, y: y - fs + 1, width: w - 2, height: fs + 8, rx: 4, fill: filled ? INFOBG : bad ? BADBG : ACCBG, stroke: filled ? INFO : bad ? BAD : ACC, 'stroke-width': 1.5, 'stroke-dasharray': filled ? null : '4 3', opacity: op });
        mono(cx + 5, y + 2, filled ? o.fill[m[1]] : p, { 'font-size': fs, 'font-weight': 700, fill: filled ? INFO : bad ? BAD : ACC, opacity: op });
      } else tx(cx, y + 2, p, { 'font-size': fs, fill: INK, opacity: op, style: 'white-space:pre' });
      cx += w; });
    return total; }
  // 부품 카드: 머리글 + 본문 줄들
  function part(cx, cy, w, h, head, rows, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return;
    const g = card(cx, cy, w, h, { rx: 10, stroke: o.stroke || INK, sw: o.sw || 2, fill: o.fill || PANEL, s, dash: o.dash });
    tx(-w / 2 + 12, -h / 2 + 20, head, { 'font-size': 13.5, 'font-weight': 700, fill: o.hc || MUT, class: 'mono' }, g);
    (rows || []).forEach((r, i) => { const y = -h / 2 + 46 + i * 24; tx(-w / 2 + 12, y, r, { 'font-size': 14.5, 'font-weight': i === 0 ? 700 : 500, fill: i === 0 ? INK : MUT, class: 'mono' }, g); });
    return g; }
  const pipeGlyph = (x, y, s) => { if (s > 0) mono(x, y + 9, '|', { 'font-size': 30, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: clamp(s) }); };
  const typeTag = (x, y, s, op, col) => pill(x, y, s, col || INFO, 1, { fs: 13.5, mono: true, op, fill: PANEL });
  const ex = (x, y, op) => tx(x, y, '예시 출력', { 'font-size': 13.5, fill: MUT, opacity: op ?? 1, 'font-weight': 600 });
  const flowVal = (c, label) => { const f = (c.beat.flow || []).find((x) => x.label === label); return f ? f.value : ''; };

  // ---------- 1. 단일 chain ----------
  const P = [{ x: 195, w: 224 }, { x: 440, w: 180 }, { x: 665, w: 190 }], PY = 170, PH = 104;
  function s1(t, c) { const { k, u } = c;
    const heads = ['ChatPromptTemplate', 'ChatOpenAI', 'StrOutputParser'], mods = ['langchain_core.prompts', 'langchain_openai', 'langchain_core.output_parsers'];
    if (k === 0) { heads.forEach((h, i) => { const x = P[i].x, a = 0.2 + i * 0.4;
        card(x, PY, P[i].w, PH, { rx: 10, stroke: GRID, dash: '6 5', fill: 'none', sw: 2 });
        tx(x, PY + 5, ['prompt', 'model', 'parser'][i], { 'text-anchor': 'middle', 'font-size': 15, fill: OFF, 'font-weight': 700 });
        fly(x, 30, x, PY - 30, seg(u, a, a + 0.9), h, { mono: true, stay: true, fill: INK });
        sub(x, PY + 78, mods[i], fade(u, a + 0.6), { class: 'mono' }); });
      sub(420, 330, 'import 만 했다. 아직 아무것도 만들지 않았다', fade(u, 1.9), { 'font-size': 15 }); return; }
    // 부품
    const sp = (i) => (k === 1 ? pop(u, 0.2 + i * 0.4) : 1);
    part(P[0].x, PY, P[0].w, PH, 'prompt', [], { s: sp(0) });
    if (sp(0) > 0.5) { const x0 = P[0].x - P[0].w / 2 + 12; tline(x0, PY - 6, '다음 영어 문장을', { fs: 14 }); tline(x0, PY + 22, '한국어로 번역: {review}', { fs: 14, fill: (k === 3 && seg(u, 0.9, 1.0) > 0) || k >= 4 ? { review: '…amazing!' } : null }); }
    part(P[1].x, PY, P[1].w, PH, 'model', ['gpt-4o-mini', 'temperature=0'], { s: sp(1) });
    part(P[2].x, PY, P[2].w, PH, 'parser', ['StrOutputParser', 'AIMessage → str'], { s: sp(2) });
    if (k === 1) { sub(420, 300, '셋 다 아직 따로 있다. 서로 모른다', fade(u, 1.8), { 'font-size': 15 }); return; }
    // 파이프로 묶기
    const pu = k === 2 ? E(u, 0.2, 1.0) : 1;
    pipeGlyph(328, PY, pu * 2); pipeGlyph(550, PY, pu * 2 - 0.6);
    const cu = k === 2 ? E(u, 0.9, 1.9) : 1;
    if (cu > 0) { const r = el('rect', { x: 70, y: 102, width: 705, height: 136, rx: 18, fill: 'none', stroke: ACC, 'stroke-width': 2.6, pathLength: 100, 'stroke-dasharray': cu < 1 ? `${cu * 100} 100` : null });
      mono(90, 92, 'translate_chain = prompt | model | parser', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, k === 2 ? 1.6 : 0) });
      if (k === 2) pill(680, 92, 'RunnableSequence', ACC, pop(u, 2.0), { fs: 13.5, mono: true, fill: PANEL }); }
    if (k === 2) return;
    // 실행: 값과 타입이 흐른다
    const types = [['dict', 40], ['ChatPromptValue', 305], ['AIMessage', 535], ['str', 760]], TY = 300;
    const tS = k === 3 ? [fade(u, 0.2), fade(u, 1.2), fade(u, 1.9), 0] : [1, 1, 1, fade(u, 0.3)];
    types.forEach(([s, x], i) => { if (tS[i] <= 0) return; const w = tw(s, 13.5) + 26;
      typeTag(x + w / 2, TY, s, tS[i], i === 3 ? GOOD : INFO);
      if (i < 3 && tS[i + 1] > 0) { const nx = types[i + 1][1]; grow(x + w + 6, TY, nx - 8, TY, tS[i + 1], MUT); } });
    sub(400, TY + 40, 'invoke 한 번에 값의 타입이 세 번 바뀐다', k === 3 ? fade(u, 2.2) : 1, { 'font-size': 14.5 });
    const L = (i) => P[i].x - P[i].w / 2, Rt = (i) => P[i].x + P[i].w / 2;
    if (k === 3) { fly(215, 375, P[0].x + 40, PY + 20, seg(u, 0.1, 0.9), '{"review": "This product is amazing!"}', { mono: true });
      dot([[Rt(0), PY], [L(1), PY]], seg(u, 1.0, 1.6), INFO, 7);
      dot([[Rt(1), PY], [L(2), PY]], seg(u, 1.7, 2.3), INFO, 7);
      return; }
    // 결과와 한계
    dot([[Rt(2), PY], [790, PY]], seg(u, 0.1, 0.6), GOOD, 7);
    const out = flowVal(c, '출력');
    pill(865, PY, out, GOOD, pop(u, 0.5), { fs: 13.5, fill: GOODBG }); ex(810, PY + 38, fade(u, 0.8));
    const gu = pop(u, 1.4); card(480, 388, 330, 42, { rx: 10, stroke: WARN, dash: '6 5', sw: 2, fill: 'none', s: gu });
    tx(480, 394, '번역한 뒤 요약까지 하려면?', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); }

  // ---------- 2. chain | chain ----------
  // 캡슐: 프롬프트 칸 + model + parser
  const CAP = [{ x0: 30, cx: 245, name: 'translate_chain', tpl: ['영어→한국어 번역:', '{review}'] }, { x0: 500, cx: 715, name: 'summarize_chain', tpl: ['한 줄 요약:', '{review}'] }], CY = 150;
  function capsule(i, s, o) { o = o || {}; if (s <= 0) return; const cp = CAP[i], x0 = cp.x0;
    const g = el('g', { opacity: clamp(s) });
    el('rect', { x: x0, y: CY - 52, width: 430, height: 104, rx: 16, fill: o.hot ? ACCBG : SOFT, stroke: ACC, 'stroke-width': 2.2 }, g);
    mono(x0 + 6, CY - 62, cp.name, { 'font-size': 15, 'font-weight': 700, fill: ACC }, g);
    el('rect', { x: x0 + 12, y: CY - 38, width: 200, height: 76, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 1.8 }, g);
    tline(x0 + 24, CY - 6, cp.tpl[0], { fs: 14, op: clamp(s) }); tline(x0 + 24, CY + 22, cp.tpl[1], { fs: 14, fill: o.fill, op: clamp(s) });
    pipeGlyph(x0 + 226, CY, 1);
    [['model', x0 + 282], ['parser', x0 + 382]].forEach(([n, x], j) => { el('rect', { x: x - 40, y: CY - 24, width: 80, height: 48, rx: 8, fill: PANEL, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 3' }, g);
      mono(x, CY + 5, n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INK }, g); if (j === 0) pipeGlyph(x0 + 332, CY, 1); }); }
  function s2(t, c) { const { k, u } = c;
    const shared = k <= 2;
    if (shared) { const sh = k === 0 ? pop(u, 0.2) : 1, sh2 = k === 0 ? pop(u, 0.6) : 1;
      part(380, 340, 200, 78, 'model', ['gpt-4o-mini'], { s: sh, stroke: ACC, hc: ACC });
      part(590, 340, 200, 78, 'parser', ['StrOutputParser'], { s: sh2, stroke: ACC, hc: ACC });
      if (k === 0) { sub(480, 150, '두 chain 이 함께 쓸 부품 하나씩', fade(u, 1.2), { 'font-size': 15 }); sub(480, 180, '객체를 두 번 만들지 않는다', fade(u, 1.7), { 'font-size': 15 }); return; } }
    capsule(0, k === 1 ? E(u, 0.2, 0.9) : 1, { fill: k >= 4 ? { review: '…delivery!' } : null });
    if (shared) { const lu = k === 1 ? E(u, 1.0, 1.8) : 1; grow(CAP[0].x0 + 282, CY + 26, 370, 300, lu, ACC, { dash: '4 4', plain: true }); grow(CAP[0].x0 + 382, CY + 26, 580, 300, lu, ACC, { dash: '4 4', plain: true }); }
    if (k === 1) return;
    capsule(1, k === 2 ? E(u, 0.2, 0.9) : 1, { fill: k >= 4 && (k > 4 || seg(u, 1.6, 1.7) > 0) ? { review: '이 제품 놀랍고…' } : null });
    if (k === 2) { const lu = E(u, 1.0, 1.8); grow(CAP[1].x0 + 282, CY + 26, 400, 300, lu, ACC, { dash: '4 4', plain: true }); grow(CAP[1].x0 + 382, CY + 26, 610, 300, lu, ACC, { dash: '4 4', plain: true });
      sub(480, 405, '선이 같은 상자로 모인다: 부품은 공유된다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    // k ≥ 3: 두 캡슐 사이 파이프
    const pu = k === 3 ? E(u, 0.2, 1.0) : 1;
    pipeGlyph(480, CY, pu * 1.5);
    if (pu > 0) { el('line', { x1: 460, y1: CY, x2: lerp(460, 500, pu), y2: CY, stroke: ACC, 'stroke-width': 3 }); }
    if (k === 3) { mono(480, 270, 'pipeline = translate_chain | summarize_chain', { 'font-size': 16, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      sub(480, 302, '클래스 없이 연산자 하나로 이어진다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 4) { const inp = flowVal(c, '입력'), mid = flowVal(c, '중간'), out = flowVal(c, '출력');
      pill(245, 50, inp, INK, pop(u, 0.1), { fs: 13.5, fill: PANEL });
      dot([[245, 66], [150, CY + 20]], seg(u, 0.4, 0.9), INFO, 7);
      fly(440, CY - 75, 620, CY + 22, seg(u, 1.0, 1.7), mid, { fill: INFO });
      pill(715, 270, out, GOOD, pop(u, 2.0), { fs: 14, fill: GOODBG });
      sub(470, 270, '중간 문자열은 손대지 않아도 넘어간다', fade(u, 1.8), { 'font-size': 14 }); ex(660, 306, fade(u, 2.2)); return; }
    // k5: 규칙 — 변수 1개 vs 2개
    const y1 = 285, y2 = 365;
    card(480, y1, 860, 64, { rx: 10, stroke: GOOD, sw: 2, fill: GOODBG, s: pop(u, 0.2) });
    if (fade(u, 0.4) > 0) { tline(80, y1 + 4, '한 줄 요약: {translated}', { fs: 15, fill: E(u, 0.6, 0.9) > 0.99 ? { translated: '앞 chain 문자열' } : null }); check(560, y1, 11, pop(u, 0.9));
      tx(590, y1 + 6, '변수 1개면 이름이 달라도 들어간다', { 'font-size': 15, 'font-weight': 700, fill: GOOD }); }
    card(480, y2, 860, 64, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 1.3) });
    if (fade(u, 1.5) > 0) { tline(80, y2 + 4, '{review}의 요약: {translated}', { fs: 15 }); cross(560, y2, 10, pop(u, 1.9));
      mono(590, y2 + 6, 'TypeError: Expected mapping', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); } }

  // ---------- 3. SequentialChain (legacy) ----------
  const LB = [{ x: 170, tpl: ['영어→한국어 번역:', '{review}'], out: 'translated', name: 'translate' },
              { x: 480, tpl: ['한 줄 요약:', '{translated}'], out: 'summary', name: 'summarize' },
              { x: 790, tpl: ['감성 분석(긍정/부정):', '{summary}'], out: 'sentiment', name: 'sentiment' }], LY = 150, LW = 250, LH = 112;
  function llmBlock(i, s, o) { o = o || {}; if (s <= 0) return; const b = LB[i];
    const g = card(b.x, LY, LW, LH, { rx: 10, stroke: o.stroke || INK, sw: 2, s });
    mono(-LW / 2 + 12, -LH / 2 + 20, 'LLMChain · ' + b.name, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }, g);
    if (s > 0.6) { tline(b.x - LW / 2 + 14, LY - 6, b.tpl[0], { fs: 14 }); tline(b.x - LW / 2 + 14, LY + 22, o.bad ? '{' + o.bad + '}' : b.tpl[1], { fs: 14, bad: o.bad }); }
    const op = o.keyOp ?? 1; if (op > 0) pill(b.x, LY + LH / 2 + 18, 'output_key="' + b.out + '"', ACC, 1, { fs: 13.5, mono: true, fill: PANEL, op }); }
  function wire(i, u) { if (u <= 0) return; const a = LB[i], b = LB[i + 1], y = LY + LH / 2 + 18;
    const x1 = a.x + tw('output_key="' + a.out + '"', 13.5) / 2 + 14, x2 = b.x - LW / 2 + 16;
    el('path', { d: `M${x1},${y} C${x1 + 30},${y} ${x2 - 30},${LY + 60} ${x2},${LY + 30}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, pathLength: u < 1 ? 100 : null, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : '5 4' }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 120, 760, 54, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 0.2) });
      mono(480, 126, 'from langchain_classic.chains import LLMChain, SequentialChain', { 'font-size': 15.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.4) });
      [['LangChain 0.x', 'langchain.chains', INK], ['LangChain 1.0 이후', 'langchain_classic.chains', ACC]].forEach(([a, b, col], i) => { const x = 270 + i * 420, s = pop(u, 1.0 + i * 0.5);
        card(x, 250, 340, 78, { rx: 10, stroke: col, sw: 2, s }); tx(x, 244, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.1 + i * 0.5) });
        mono(x, 270, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: col, opacity: fade(u, 1.1 + i * 0.5) }); });
      grow(445, 250, 595, 250, E(u, 1.5, 2.0), ACC);
      sub(480, 345, '옛 체인 클래스는 별도 패키지로 옮겨졌다', fade(u, 2.1), { 'font-size': 15 }); return; }
    const bad = k === 6 ? 'translatd' : null;
    for (let i = 0; i < 3; i++) { const s = k === i + 1 ? pop(u, 0.2) : k > i + 1 ? 1 : 0;
      llmBlock(i, s, { keyOp: k === i + 1 ? fade(u, 1.0) : 1, bad: i === 1 ? bad : null, stroke: i === 1 && bad ? BAD : INK });
      if (i > 0 && s > 0 && !(i === 1 && bad)) wire(i - 1, k === i + 1 ? E(u, 1.2, 2.2) : 1); }
    if (k >= 2 && k <= 3) { const nm = LB[k - 2].out; sub(Math.min(LB[k - 1].x, 740), 40, '{' + nm + '}는 앞 output_key와 같은 이름', fade(u, 2.0), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); }
    if (k === 1) sub(480, 330, 'output_key 가 다음 단계가 받을 이름을 정한다', fade(u, 1.6), { 'font-size': 15 });
    if (k >= 4 && k <= 5) { const fu = k === 4 ? E(u, 0.2, 1.2) : 1;
      if (fu > 0) el('rect', { x: 28, y: 64, width: 904, height: 186, rx: 16, fill: 'none', stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': fu < 1 ? `${fu * 100} 100` : '8 5', pathLength: fu < 1 ? 100 : null });
      mono(40, 52, 'overall = SequentialChain(chains=[translate, summarize, sentiment])', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 4 ? fade(u, 0.9) : 1 }); }
    if (k === 4) { pill(240, 300, 'input_variables=["review"]', INFO, pop(u, 1.3), { fs: 14, mono: true, fill: PANEL });
      pill(640, 300, 'output_variables=[translated, summary, sentiment]', ACC, pop(u, 1.7), { fs: 14, mono: true, fill: PANEL });
      sub(480, 352, '들어가는 이름과 나오는 이름을 모두 적는다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 5) { const rows = c.beat.flow.map((f) => f.label === '입력' ? 'review' : f.label);
      const vals = c.beat.flow.map((f) => f.value), shown = Math.min(4, 1 + Math.floor(E(u, 0.3, 2.3) * 3.99));
      for (let i = 1; i < shown; i++) { const b = LB[i - 1]; check(b.x + LW / 2 - 18, LY - LH / 2 + 16, 8, pop(u, 0.3 + (i - 1) * 0.67)); }
      kvTable(170, 262, 620, rows.slice(0, shown).map((r, i) => [r, '"' + vals[i] + '"', { hot: i === shown - 1 && i > 0 }]), { title: 'result (dict) · 예시 출력', rh: 30, kw: 150 }); return; }
    if (k === 6) { const s = pop(u, 0.6); card(480, 320, 760, 96, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, s });
      mono(480, 312, 'ValidationError: Missing required input keys:', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      mono(480, 340, "{'translatd'}, only had {'translated', 'review'}", { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, opacity: fade(u, 1.0) });
      sub(480, 396, '오타가 invoke 전에, 만드는 순간 잡힌다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // ---------- 4. RunnablePassthrough.assign ----------
  function dictCard(x, y, rows, o) { o = o || {}; const w = o.w || 250, rh = 26, h = 30 + rows.length * rh;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 12, y + 20, 'dict', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    rows.forEach(([kk, v, hot], i) => { const yy = y + 30 + i * rh, op = (o.op ?? 1) * (hot != null && hot < 1 ? hot : 1);
      if (hot != null) el('rect', { x: x + 6, y: yy, width: w - 12, height: rh - 3, rx: 5, fill: ACCBG, opacity: op });
      mono(x + 14, yy + 18, kk + ':', { 'font-size': 14, 'font-weight': 700, fill: hot != null ? ACC : INK, opacity: op });
      mono(x + 14 + tw(kk + ': ', 14), yy + 18, v, { 'font-size': 14, fill: INK, opacity: op }); });
    return h; }
  const ST = [{ x: 380, name: 'assign(translated=…)', chain: 'translate_chain', tpl: '영어→한국어: {review}' }, { x: 660, name: 'assign(summary=…)', chain: 'summarize_chain', tpl: '한 줄 요약: {translated}' }], SY = 110;
  function station(i, s) { if (s <= 0) return; const st = ST[i];
    card(st.x, SY, 200, 64, { rx: 10, stroke: ACC, sw: 2.4, fill: ACCBG, s });
    mono(st.x, SY + 5, st.name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: clamp(s) }); }
  function chainBox(i, s) { if (s <= 0) return; const st = ST[i];
    card(st.x, 320, 250, 96, { rx: 10, stroke: INK, sw: 2, s });
    if (s > 0.6) { mono(st.x - 113, 294, st.chain, { 'font-size': 14, 'font-weight': 700, fill: MUT }); tline(st.x - 113, 326, st.tpl, { fs: 14 }); mono(st.x - 113, 354, '→ str', { 'font-size': 14, fill: MUT }); } }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const pu = E(u, 0.3, 1.8);
      card(480, 150, 220, 90, { rx: 40, stroke: ACC, sw: 2.5, fill: 'none', dash: '7 5', s: pop(u, 0.1) });
      mono(480, 98, 'RunnablePassthrough()', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      dictCard(lerp(60, 650, pu), 122, [['review', '"This product…"']], { w: 230 });
      sub(480, 250, '들어온 dict 를 그대로 내보낸다', fade(u, 1.6), { 'font-size': 15 });
      mono(480, 310, '.assign(새키=runnable)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 340, '여기에 키 하나를 덧붙여 내보낸다', fade(u, 2.2), { 'font-size': 15 }); return; }
    chainBox(0, k === 1 ? pop(u, 0.2) : k >= 5 ? 0 : 1);
    if (k >= 2 && k < 5) chainBox(1, k === 2 ? pop(u, 0.2) : 1);
    if (k === 1) { sub(380, 220, '{review}를 받아 번역 문자열 하나를 낸다', fade(u, 1.0), { 'font-size': 15 }); return; }
    if (k === 2) { const y = 110, a = fade(u, 0.9);
      mono(60, 50, 'translate_chain | summarize_chain 이라면?', { 'font-size': 15, 'font-weight': 700, opacity: a });
      pill(160, y, '{review}', INK, pop(u, 1.0), { mono: true, fs: 13.5, fill: PANEL }); grow(215, y, 280, y, E(u, 1.2, 1.5), MUT);
      pill(390, y, '"이 제품 정말 놀라워요!"', INFO, pop(u, 1.4), { fs: 13.5, fill: PANEL }); grow(500, y, 565, y, E(u, 1.6, 1.9), MUT);
      pill(670, y, '"제품 만족도 높음"', INFO, pop(u, 1.8), { fs: 13.5, fill: PANEL });
      tx(760, y + 6, 'review 사라짐', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); return; }
    // k ≥ 3: 정류장
    const su = (i) => (k === 3 ? pop(u, 0.2 + i * 0.4) : 1);
    if (k < 5) for (let i = 0; i < 2; i++) grow(ST[i].x, 270, ST[i].x, SY + 36, k === 3 ? E(u, 1.0 + i * 0.3, 1.6 + i * 0.3) : 1, ACC, { dash: '4 4' });
    el('line', { x1: 40, y1: SY, x2: 920, y2: SY, stroke: GRID, 'stroke-width': 3, opacity: 0.8 });
    station(0, su(0)); station(1, su(1));
    if (k === 3) { mono(480, 40, 'pipeline = assign(translated=…) | assign(summary=…)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // k4: dict 가 정류장을 지나며 키가 붙는다
    const v1 = '"이 제품 정말 놀라워요!"', v2 = '"제품 만족도 높음"';
    const p = k === 4 ? E(u, 0.2, 2.5) : 1, x = lerp(20, 640, p);
    const r1 = k === 4 ? fade(u, 1.0, 0.3) : 1, r2 = k === 4 ? fade(u, 2.0, 0.3) : 1;
    const rows = [['review', '"This product…"']]; if (r1 > 0) rows.push(['translated', v1, r1]); if (r2 > 0) rows.push(['summary', v2, r2]);
    dictCard(x, 160, rows, { w: 310 });
    if (k === 4) { ex(20, 400, fade(u, 2.3)); return; }
    // k5: 이 패턴을 쓰는 이유 세 가지
    [['① 원본 보존', 'review를 끝까지 들고 간다'], ['② 여러 변수 함께 쓰기', '"{review}의 요약은 {summary}"'], ['③ 결과에 이름 붙이기', '키 이름 = assign 인자 이름']].forEach(([a, b], i) => {
      const y = 190 + i * 74, s = pop(u, 0.2 + i * 0.4); card(330, y, 600, 60, { rx: 10, stroke: GOOD, sw: 2, s });
      tx(50, y - 2, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); tx(280, y - 2, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.4), class: i === 1 ? 'mono' : null }); }); }

  // ---------- 5. 실전 3단 ----------
  const RS = [{ x: 170, n: 'summarize', tpl: ['리뷰를 한 줄로 요약:', '{review}'], p: 'str_parser', key: 'summary' },
              { x: 480, n: 'translate', tpl: ['한국어→영어 번역:', '{summary}'], p: 'str_parser', key: 'english' },
              { x: 790, n: 'extract_json', tpl: ['JSON 으로 변환: {english}', '{format}'], p: 'json_parser', key: 'report' }], RY = 105, RW = 270, RH = 104;
  function rStation(i, s) { if (s <= 0) return; const st = RS[i];
    card(st.x, RY, RW, RH, { rx: 10, stroke: INK, sw: 2, s });
    if (s < 0.6) return;
    mono(st.x - RW / 2 + 12, RY - RH / 2 + 19, st.n, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    tline(st.x - RW / 2 + 12, RY - 4, st.tpl[0], { fs: 14 });
    tline(st.x - RW / 2 + 12, RY + 22, st.tpl[1], { fs: 14, fill: i === 2 ? { format: '지시문 792자' } : null });
    mono(st.x + RW / 2 - 12, RY + RH / 2 - 10, '| ' + st.p, { 'font-size': 13.5, fill: i === 2 ? ACC : MUT, 'text-anchor': 'end', 'font-weight': i === 2 ? 700 : 500 }); }
  function schema(x, y, s) { if (s <= 0) return; card(x + 160, y + 95, 320, 190, { rx: 10, stroke: INK, sw: 2, s, fill: PANEL });
    if (s < 0.6) return;
    mono(x + 16, y + 30, 'class ReviewReport(BaseModel):', { 'font-size': 15, 'font-weight': 700 });
    [['rating', 'int', '별점 1~5'], ['sentiment', 'str', 'positive | neutral | negative'], ['tags', 'list[str]', '키워드 태그']].forEach(([a, b, d], i) => {
      mono(x + 36, y + 68 + i * 42, a + ': ', { 'font-size': 15, 'font-weight': 700 }); mono(x + 36 + tw(a + ': ', 15), y + 68 + i * 42, b, { 'font-size': 15, fill: INFO, 'font-weight': 700 });
      tx(x + 36, y + 87 + i * 42, d, { 'font-size': 13.5, fill: MUT }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { schema(60, 60, pop(u, 0.2));
      grow(400, 155, 520, 155, E(u, 1.0, 1.5), ACC);
      mono(460, 140, 'json_parser', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      const du = pop(u, 1.5); card(700, 155, 300, 190, { rx: 6, stroke: GRID, sw: 1.8, s: du });
      if (du > 0.6) { for (let i = 0; i < 6; i++) el('rect', { x: 572, y: 80 + i * 18, width: [250, 220, 256, 180, 240, 120][i], height: 7, rx: 3, fill: SOFT });
        mono(700, 222, '792자', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: ACC }); }
      mono(700, 290, 'get_format_instructions()', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      sub(480, 360, '출력 모양을 먼저 정하고, 그 모양을 LLM 에게 알려 줄 지시문을 만든다', fade(u, 2.2), { 'font-size': 15 }); return; }
    for (let i = 0; i < 3; i++) rStation(i, k === i + 1 ? pop(u, 0.2) : k > i + 1 ? 1 : 0);
    if (k === 1) { sub(170, 210, '원문 → 한 줄 요약', fade(u, 1.0), { 'font-size': 15 }); return; }
    if (k === 2) { grow(170 + RW / 2 - 50, 196, 480 - RW / 2 + 40, 196, E(u, 0.9, 1.5), MUT, { dash: '4 4' }); sub(480, 214, '{summary}를 받는다', fade(u, 1.2), { 'font-size': 15 }); return; }
    if (k === 3) { sub(790, 178, '.partial로 {format}을 미리 채운다', fade(u, 1.0), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
      sub(790, 204, 'parser 가 Pydantic 검사까지 한다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    // k ≥ 4: assign 3연속
    const au = k === 4 ? E(u, 0.2, 1.6) : 1;
    RS.forEach((st, i) => { const s = clamp(au * 3 - i); if (s <= 0) return;
      pill(st.x, 30, 'assign(' + st.key + '=' + st.n + ')', ACC, s, { fs: 13.5, mono: true, fill: PANEL }); });
    if (k < 7) for (let i = 0; i < 2; i++) pipeGlyph((RS[i].x + RS[i + 1].x) / 2, RY, clamp(au * 3 - i - 0.5));
    if (k === 4) { sub(480, 220, 'dict 가 세 정류장을 지나며 키가 하나씩 붙는다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k <= 6) { const f = c.beat.flow, rows = [['review', '"제품 너무 좋고 배송도 빨라요. 추천!"']];
      const vS = '"' + (f[1] ? f[1].value : '') + '"', vE = f[2] ? '"' + f[2].value + '"' : null;
      const r1 = k === 5 ? fade(u, 0.6, 0.3) : 1; if (r1 > 0) rows.push(['summary', vS, r1]);
      if (k === 6) { rows.push(['english', vE, fade(u, 0.3, 0.3)]); rows.push(['report', 'ReviewReport(…)', fade(u, 0.9, 0.3)]); }
      if (k === 5) dot([[60, 230], [170, RY + RH / 2], [170, 230]], seg(u, 0.1, 0.6), INFO, 7);
      if (k === 6) { dot([[480, RY + RH / 2], [480, 200]], seg(u, 0.1, 0.4), INFO, 7); dot([[790, RY + RH / 2], [790, 200]], seg(u, 0.6, 0.9), INFO, 7); }
      dictCard(40, 205, rows, { w: 545 });
      ex(40, 410, 1);
      if (k === 6) { const s = pop(u, 1.3), x0 = 600; card(x0 + 160, 290, 320, 160, { rx: 10, stroke: GOOD, sw: 2.4, fill: GOODBG, s });
        if (s > 0.6) { mono(x0 + 14, 236, 'ReviewReport', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
          ['rating=5', "sentiment='positive'", "tags=['delivery', 'quality']"].forEach((r, i) => mono(x0 + 24, 268 + i * 28, r, { 'font-size': 14.5, opacity: fade(u, 1.5 + i * 0.2) }));
          tx(x0 + 14, 356, 'JSON 문자열이 타입 검사된 객체로', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.2) }); } }
      return; }
    // k7: 세 패턴
    const pats = [['① chain 하나', 'prompt | model | parser', '단순 작업'], ['② chain | chain', '문자열이 바로 다음 슬롯으로', '직선 흐름'], ['③ assign 누적', 'dict 에 키가 쌓인다', '변수가 여럿일 때']];
    pats.forEach(([a, b, d], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.45);
      card(x, 300, 280, 150, { rx: 12, stroke: ACC, sw: 2, s });
      if (s > 0.6) { tx(x, 262, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 }); tx(x, 296, b, { 'text-anchor': 'middle', 'font-size': 14.5, class: 'mono', fill: INK });
        tx(x, 336, d, { 'text-anchor': 'middle', 'font-size': 15, fill: ACC, 'font-weight': 700 }); } }); }

  const quiz = [
    { q: 'translate_chain.invoke({"review": …}) 한 번에 값의 타입은 어떤 순서로 바뀌는가?',
      o: ['str → dict → AIMessage', 'dict → ChatPromptValue → AIMessage → str', 'dict → AIMessage → ChatPromptValue → str'], a: 1,
      why: 'prompt가 dict를 ChatPromptValue로 채우고, model이 AIMessage를 내고, StrOutputParser가 그 안의 글자만 꺼내 str로 만든다.' },
    { q: 'translate_chain | summarize_chain에서 뒤 prompt가 "{review}의 요약: {translated}" 처럼 변수가 두 개라면 어떻게 되는가?',
      o: ['앞 문자열이 두 슬롯에 똑같이 들어간다', '첫 번째 슬롯만 채워지고 나머지는 빈칸이 된다', '문자열 하나로는 못 채워 TypeError가 난다'], a: 2,
      why: '변수가 하나뿐이면 문자열이 이름과 상관없이 그 슬롯에 들어가지만, 둘 이상이면 dict가 필요해 "Expected mapping type" 오류가 난다.' },
    { q: 'SequentialChain에서 요약 단계 prompt에 {translatd}라고 오타를 내면 언제 알게 되는가?',
      o: ['SequentialChain을 만드는 순간 ValidationError가 난다', 'invoke 했을 때 빈 문자열이 들어간다', 'LLM이 알아서 고쳐 읽는다'], a: 0,
      why: 'SequentialChain은 output_key와 다음 prompt 변수가 이어지는지 만들 때 검사한다. 그래서 변수 사슬을 추적하기 쉽다.' },
    { q: 'RunnablePassthrough.assign(translated=translate_chain)를 지난 뒤 dict는 어떻게 되는가?',
      o: ['review는 지워지고 translated만 남는다', 'review는 그대로 두고 translated 키가 하나 더 붙는다', 'dict가 번역 문자열 하나로 바뀐다'], a: 1,
      why: 'assign은 들어온 dict를 통째로 통과시키면서 새 키만 덧붙인다. 그래서 원문 review를 끝까지 들고 갈 수 있다.' },
    { q: '실전 3단 파이프라인의 마지막 JSON 단계에서 PydanticOutputParser가 하는 일은 무엇인가?',
      o: ['JSON 문자열을 검사된 ReviewReport 객체로 바꾼다', '영어 요약을 다시 한국어로 번역한다', 'dict에서 쓰지 않는 review 키를 지운다'], a: 0,
      why: 'get_format_instructions로 출력 모양(792자 지시문)을 알려 주고, 돌아온 문자열을 rating=int 같은 필드 규칙에 맞춰 객체로 만든다.' },
  ];

  const summary = [
    'prompt, model, parser를 파이프로 묶으면 invoke 한 번에 dict가 str이 된다.',
    'chain 끼리도 파이프로 잇는다. 뒤 prompt 변수가 하나면 앞 문자열이 그대로 들어간다.',
    '뒤 prompt가 변수를 둘 이상 쓰거나 원문이 더 필요하면 assign으로 dict에 키를 쌓는다.',
    'SequentialChain은 이름을 모두 적어 만들 때 검사하고, 지금은 langchain_classic에 있다.',
  ];
  const review = [
    { q: 'chain | chain으로 번역 뒤 요약을 붙였더니 결과에 원문 review가 없다. 원문도 함께 받으려면 무엇을 바꾸나?',
      o: ['StrOutputParser를 빼 버린다', '각 chain을 RunnablePassthrough.assign으로 감싼다', 'temperature를 0으로 맞춘다'], a: 1,
      why: '파이프는 앞 결과만 넘기므로 원문이 사라진다. assign은 dict를 그대로 두고 키를 덧붙이므로 review, translated, summary가 함께 남는다.' },
    { q: '요약 prompt를 "{review}를 참고해 {translated}를 요약"로 바꾸자 chain | chain이 TypeError를 냈다. 먼저 의심할 것은?',
      o: ['변수가 둘이 되어 문자열 하나로는 못 채운다', '번역 chain의 모델 이름이 틀렸다', 'parser가 JSON 형식을 기대한다'], a: 0,
      why: '변수 하나짜리 prompt만 문자열을 바로 받는다. 두 변수를 쓰려면 assign으로 두 키가 든 dict를 만들어 넘겨야 한다.' },
    { q: '리뷰를 별점·감성·태그로 받아 DB에 바로 넣으려 한다. 마지막 단계에 알맞은 것은?',
      o: ['StrOutputParser로 받은 문자열을 그대로 저장', 'SequentialChain의 verbose=True', 'PydanticOutputParser로 ReviewReport 객체를 받는다'], a: 2,
      why: 'Pydantic 스키마를 두면 rating은 int, tags는 list[str]로 검사된 객체가 나온다. 모양이 틀리면 OutputParserException으로 바로 드러난다.' },
  ];

  R.page({ title: '체인 직렬 연결', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
