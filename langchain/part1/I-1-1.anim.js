/* I-1-1 LLM 직접 호출 vs LangChain — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 줄 수는 STEPS 의 bar · leftBox · rightBox 를 읽는다. 모델 답은 실제 호출이 아니므로 "예시"로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const typed = (s, f) => (f >= 1 ? s : s.slice(0, Math.round(s.length * clamp(f))));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, op) => pill(x, y, '예시', MUT, 1, { fs: 13.5, op });
  // 문서 한 장 (접힌 귀퉁이)
  function sheet(cx, cy, name, col, s) { const g = R.G(cx, cy, s ?? 1);
    el('path', { d: 'M-26,-32 H14 L26,-20 V32 H-26 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 2 }, g);
    el('path', { d: 'M14,-32 V-20 H26', fill: 'none', stroke: col || INK, 'stroke-width': 2 }, g);
    [-12, -2, 8, 18].forEach((y, i) => el('line', { x1: -16, y1: y, x2: i % 2 ? 6 : 14, y2: y, stroke: OFF, 'stroke-width': 3, 'stroke-linecap': 'round' }, g));
    if (name) tx(0, 52, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col || INK }, g); return g; }

  // ---------- 1. 손으로 만드는 HTTP 요청 ----------
  const REQ = [
    { y: 82, s: 'API_KEY = os.environ["OPENAI_API_KEY"]', k: 0 },
    { y: 106, s: 'URL = "https://api.openai.com/v1/chat/completions"', k: 0 },
    { y: 140, s: 'headers = {', k: 1 },
    { y: 162, s: '  "Authorization": f"Bearer {API_KEY}",', k: 1 },
    { y: 184, s: '  "Content-Type": "application/json" }', k: 1 },
    { y: 218, s: 'body = { "model": "gpt-4o-mini",', k: 2 },
    { y: 240, s: '  "messages": [{"role": "user",', k: 2 },
    { y: 262, s: '    "content": "이 리뷰를 요약해줘: ..."}] }', k: 2 },
  ];
  const PATH = ['resp.json()', '["choices"]', '[0]', '["message"]', '["content"]'];
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    zone(30, 40, 520, 250, 'HTTP 요청을 손으로 조립', { fill: SOFT });
    [[0, 70, 46], [1, 128, 64], [2, 206, 64]].forEach(([kk, y, h]) => { if (k < kk) return; const f = k === kk ? E(u, 0.1, 0.5) : 1;
      el('rect', { x: 40, y, width: 4, height: h * f, rx: 2, fill: k === kk ? ACC : OFF }); });
    REQ.forEach((r, i) => { if (k < r.k) return; const n = REQ.filter((q) => q.k === r.k), j = n.indexOf(r);
      const f = k === r.k ? seg(u, 0.3 + j * 0.45, 0.75 + j * 0.45) : 1;
      if (i === 7 && k >= 2) el('rect', { x: 168, y: r.y - 16, width: 222, height: 22, rx: 4, fill: WARNBG, opacity: k === 2 ? fade(u, 1.6) : 1 });
      mono(54, r.y, typed(r.s, f), { 'font-size': 14, fill: k === r.k ? INK : MUT }); });
    if (k === 1) fly(470, 82, 330, 162, seg(u, 1.3, 2.3), 'API_KEY', { mono: true });
    if (k === 2) note(400, 296, '프롬프트가 body 안에 박힌다', fade(u, 1.9), { fill: WARN, 'text-anchor': 'middle', 'font-size': 14 });
    // 서버
    server(800, 96, 'api.openai.com', { lamp: k >= 3 ? ACC : OFF });
    if (k === 3) { dot([[550, 170], [640, 170], [740, 110]], seg(u, 0.2, 1.2), ACC, 7);
      pill(645, 140, 'POST · timeout=30', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      pill(800, 186, 'raise_for_status() · 200', GOOD, pop(u, 1.3), { mono: true, fs: 13.5 }); }
    if (k >= 3) note(800, k === 3 ? 222 : 186, '재시도·rate-limit 코드는 0줄', k === 3 ? fade(u, 1.9) : 1, { fill: BAD, 'text-anchor': 'middle', 'font-size': 14 });
    // 응답을 파고드는 경로
    if (k >= 4) PATH.forEach((s, i) => { const x = 610 + i * 22, y = 220 + i * 28, on = k === 4 ? fade(u, 0.2 + i * 0.35, 0.3) : 1;
      if (i > 0) { el('path', { d: `M${x - 14},${y - 22} V${y - 5} H${x - 4}`, fill: 'none', stroke: i === 4 ? ACC : MUT, 'stroke-width': 1.8, opacity: on }); }
      mono(x, y, s, { 'font-size': 14, 'font-weight': i ? 700 : 500, fill: i === 4 ? ACC : INK, opacity: on }); });
    if (k >= 4) { const op = k === 4 ? fade(u, 2.0) : 1; mono(700, 368, 'answer = "…모델의 답…"', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: op });
      sub(818, 220, `키를 ${PATH.length - 1}번 파고든다`, op, { 'font-weight': 700, 'text-anchor': 'start' }); }
    // 문제 표시
    const iss = (b.leftBox && b.leftBox.issues) || [], pn = (p.leftBox && p.leftBox.issues || []).length;
    iss.forEach((s, i) => { const x = i % 2 ? 300 : 40, y = 318 + Math.floor(i / 2) * 32, w = tw(s, 13.5) + 24;
      card(x + w / 2, y, w, 26, { rx: 13, text: s, fs: 13.5, fw: 700, stroke: BAD, color: BAD, fill: BADBG, sw: 1.5, s: i >= pn && c.k > 0 ? pop(u, 1.6) : 1 }); });
    // 줄 수
    const v = tween(p.bar ? p.bar.left : 0, b.bar.left, u);
    tx(40, 398, 'direct.py', { 'font-size': 15, 'font-weight': 700 });
    hbar(130, 385, 300, v, 30, { col: BAD, text: Math.round(v) + '줄', h: 18 });
    if (k === 5) { const x30 = 130 + 300; el('line', { x1: x30, y1: 378, x2: x30, y2: 410, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: fade(u, 1.2) });
      note(620, 398, '에러 처리·재시도까지 넣으면 30줄을 넘는다', fade(u, 1.4), { fill: BAD, 'font-size': 14, 'text-anchor': 'middle' }); } }

  // ---------- 2. 벤더를 바꾸면 처음부터 ----------
  const ROWS = [
    ['URL', '…/v1/chat/completions', '…/v1/messages'],
    ['인증 헤더', 'Authorization: Bearer …', 'x-api-key: …'],
    ['버전 헤더', '(없음)', 'anthropic-version: 2023-06-01'],
    ['필수 바디', 'model, messages', 'model, max_tokens, messages'],
    ['답 위치', '["choices"][0]["message"]["content"]', '["content"][0]["text"]'],
  ];
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const top = k === 0 ? pop(u, 0.2) : 1;
    pill(480, 30, 'PROMPT = "이 리뷰를 요약해줘: ..."', INK, top, { mono: true, fs: 14 });
    grow(400, 46, 362, 66, k === 0 ? seg(u, 0.8, 1.4) : 1, MUT); grow(560, 46, 744, 66, k === 0 ? seg(u, 0.8, 1.4) : 1, MUT);
    lbl(362, 86, 'OpenAI · gpt-4o-mini', k === 0 ? fade(u, 1.2) : 1);
    lbl(744, 86, 'Anthropic · claude-3-5-sonnet', k === 0 ? fade(u, 1.2) : 1, { fill: k >= 3 ? BAD : INK });
    if (k === 0) note(480, 200, '보낼 내용은 한 줄로 같다. 다른 것은 보내는 코드다.', fade(u, 1.8), { 'text-anchor': 'middle' });
    ROWS.forEach(([name, a, z], i) => { const y = 104 + i * 46;
      const lk = i < 3 ? 1 : 2, rk = i < 3 ? 3 : 4;
      if (k >= 1) tx(30, y + 23, name, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: k === 1 && i < 3 ? fade(u, 0.1) : k >= lk ? 1 : 0.35 });
      if (k >= lk) { const j = i % 3, f = k === lk ? seg(u, 0.3 + j * 0.5, 0.8 + j * 0.5) : 1;
        el('rect', { x: 182, y, width: 360, height: 36, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: f > 0 ? 1 : 0 });
        mono(194, y + 23, typed(a, f), { 'font-size': 13.5, fill: a === '(없음)' ? MUT : INK }); }
      if (k >= rk) { const j = i % 3, f = k === rk ? seg(u, 0.3 + j * 0.5, 0.8 + j * 0.5) : 1;
        el('rect', { x: 566, y, width: 360, height: 36, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: f > 0 ? 1 : 0 });
        mono(578, y + 23, typed(z, f), { 'font-size': 13.5, fill: INK });
        tx(554, y + 25, '≠', { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: k === rk ? fade(u, 1.0 + j * 0.5) : 1 }); } });
    if (k >= 1) { const l = tween(p.bar ? p.bar.left : 0, b.bar.left, u), r = tween(p.bar ? p.bar.right : 0, b.bar.right, u);
      tx(30, 358, 'OpenAI', { 'font-size': 15, 'font-weight': 700 }); hbar(130, 345, 220, l, 30, { col: INK, text: Math.round(l) + '줄', h: 18 });
      tx(30, 396, 'Anthropic', { 'font-size': 15, 'font-weight': 700, fill: r > 0 ? BAD : MUT }); hbar(130, 383, 220, r, 30, { col: BAD, text: Math.round(r) + '줄', h: 18 }); }
    if (k === 5) { const n = Math.min(5, 2 + Math.floor(E(u, 0.4, 2.0) * 3.99));
      for (let i = 0; i < n; i++) sheet(560 + i * 76, 362, i < 2 ? ['openai', 'anthropic'][i] : i === 4 ? '… N' : `벤더 ${i + 1}`, i < 2 ? INK : BAD, i < 2 ? 1 : pop(u, 0.4 + (i - 2) * 0.5) * 0.9); } }

  // ---------- 3. 같은 인터페이스 뒤로 숨기기 ----------
  const COL = [{ x: 250, cls: 'ChatOpenAI', imp: 'from langchain_openai import ChatOpenAI', m: 'gpt-4o-mini' },
    { x: 710, cls: 'ChatAnthropic', imp: 'from langchain_anthropic import ChatAnthropic', m: 'claude-3-5-sonnet-…' }];
  function classBox(o, hot, op) { card(o.x, 236, 300, 96, { rx: 12, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: hot ? 2.6 : 2, op });
    tx(o.x, 222, o.cls, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono', fill: hot ? ACC : INK, opacity: op });
    tx(o.x, 252, 'URL · 헤더 · 바디 · 파싱', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op });
    mono(o.x, 274, `model="${o.m}"`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }
  function call(o, u) { // .invoke(PROMPT) → AIMessage → .content
    fly(o.x - 140, 150, o.x - 40, 200, seg(u, 0.2, 1.0), 'PROMPT', { mono: true });
    pill(o.x + 60, 160, '.invoke(PROMPT)', ACC, pop(u, 0.3), { mono: true, fs: 13.5 });
    grow(o.x, 286, o.x, 318, seg(u, 1.0, 1.3), ACC);
    card(o.x, 340, 250, 34, { rx: 8, text: 'AIMessage(content="…")', fs: 13.5, mono: true, stroke: ACC, s: pop(u, 1.3) });
    mono(o.x, 386, '.content → str', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
  function s3(t, c) { const { k, u } = c;
    COL.forEach((o, i) => { const on = k >= 1 && (k === 1 ? i === 0 : k === 2 ? i === 1 : false);
      if (k < 3) { mono(o.x, 56, o.imp, { 'font-size': 14, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.1 + i * 0.3) : 1 }); }
      classBox(o, on, k === 0 ? fade(u, 0.3) : 1);
      if (k === 0) ['URL', '헤더', '바디', '파싱'].forEach((s, j) => fly(o.x - 120 + j * 80, 104, o.x, 196, seg(u, 0.8 + j * 0.25, 1.7 + j * 0.25), s, { fill: BAD }));
      if (k >= 1 && k <= 2 && !on) { card(o.x, 340, 250, 34, { rx: 8, text: 'AIMessage(content="…")', fs: 13.5, mono: true, stroke: GRID, color: MUT }); } });
    if (k === 0) note(480, 380, 'HTTP 지식은 클래스 안으로 들어가고, 호출 코드에는 0줄 남는다', fade(u, 2.0), { 'text-anchor': 'middle' });
    if (k === 1) call(COL[0], u);
    if (k === 2) { call(COL[1], u); note(480, 404, '두 벤더의 결과가 같은 모양이다', fade(u, 2.2), { 'text-anchor': 'middle', fill: ACC, 'font-size': 14 }); }
    if (k >= 3) { const ap = k === 3 ? pop(u, 0.2) : 1;
      card(480, 82, 560, 92, { rx: 12, stroke: INK, sw: 2.5, fill: SOFT, s: ap });
      tx(480, 64, 'BaseChatModel', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono', opacity: ap });
      ['invoke', 'stream', 'batch', 'ainvoke'].forEach((m, j) => pill(270 + j * 140, 102, '.' + m, ACC, k === 3 ? pop(u, 0.6 + j * 0.2) : 1, { mono: true, fs: 14 }));
      COL.forEach((o) => grow(o.x, 188, o.x > 480 ? 640 : 320, 132, k === 3 ? seg(u, 1.4, 1.9) : 1, MUT));
      if (k === 3) { note(480, 340, '둘 다 이 부모를 물려받아 같은 메서드 네 개를 가진다', fade(u, 2.0), { 'text-anchor': 'middle' });
        note(480, 372, '재시도도 클래스 옵션(max_retries)이 맡는다', fade(u, 2.3), { 'text-anchor': 'middle', fill: MUT, 'font-size': 14 }); } }
    if (k === 4) { const sw = E(u, 1.5, 2.0), prov = sw > 0.5 ? 'anthropic' : 'openai', mdl = sw > 0.5 ? '"claude-3-5-sonnet-…"' : '"gpt-4o-mini"';
      card(480, 340, 620, 46, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.4, s: pop(u, 0.2) });
      spans(480 - tw(`init_chat_model(${mdl}, model_provider="${prov}")`, 14) / 2, 345, [['init_chat_model(', {}], [mdl, { fill: ACC }], [', model_provider=', {}], [`"${prov}"`, { fill: ACC, 'font-weight': 800 }], [')', {}]], { 'font-size': 14 });
      const tx0 = lerp(COL[0].x, COL[1].x, sw); grow(480, 316, tx0, 288, seg(u, 0.6, 1.0), ACC);
      note(480, 404, '벤더 선택이 문자열 인자 하나로 내려간다', fade(u, 2.2), { 'text-anchor': 'middle', 'font-size': 14 }); } }
  const spans = R.spans;

  // ---------- 4. prompt | model | parser ----------
  const BLK = [{ x: 170, name: 'ChatPromptTemplate', in: 'dict', out: 'ChatPromptValue' }, { x: 480, name: 'ChatOpenAI', in: 'PromptValue', out: 'AIMessage' }, { x: 790, name: 'StrOutputParser', in: 'AIMessage', out: 'str' }];
  function blocks(k, u) { BLK.forEach((b, i) => { const s = k === 0 ? pop(u, 0.2 + i * 0.4) : 1;
      card(b.x, 150, 236, 92, { rx: 12, stroke: INK, sw: 2.2, s });
      tx(b.x, 132, b.name, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, class: 'mono', opacity: s > 0.3 ? 1 : 0 });
      const inner = i === 0 ? null : i === 1 ? 'model="gpt-4o-mini"' : 'AIMessage → str';
      if (inner) mono(b.x, 164, inner, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s > 0.3 ? 1 : 0 });
      else if (s > 0.3) R.spans(b.x - 104, 164, [['"…요약해줘: ', { fill: MUT }], ['{review}', { fill: ACC, 'font-weight': 800 }], ['"', { fill: MUT }]], { 'font-size': 13.5 });
      mono(b.x, 182, `${b.in} → ${b.out}`, { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.6 + i * 0.2) : 1 }); }); }
  const CH = ['빠른', ' 배송과', ' 좋은', ' 품질에', ' 만족한', ' 리뷰다.'];
  function s4(t, c) { const { k, u } = c;
    blocks(k, u);
    if (k === 0) { note(480, 290, '셋 다 Runnable이라 파이프로 이을 수 있다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    if (k >= 1) { [325, 635].forEach((x, i) => tx(x, 162, '|', { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, class: 'mono', fill: ACC, opacity: k === 1 ? fade(u, 0.2 + i * 0.4) : 1 }));
      const f = k === 1 ? E(u, 1.0, 1.8) : 1;
      el('rect', { x: 40, y: 86, width: 880 * f, height: 120, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' });
      mono(48, 76, 'chain = prompt | model | parser', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 1.6) : 1 });
      tx(912, 76, 'RunnableSequence', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: MUT, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 2.0) : 1 }); }
    if (k === 1) { note(480, 290, '세 부품이 하나의 Runnable이 된다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { // invoke 한 건이 지나가며 모양이 바뀐다
      pill(480, 36, '.invoke({"review": "배송이 빠르고 품질도 좋아요."})', ACC, pop(u, 0.1), { mono: true, fs: 13.5 });
      dot([[60, 260], [900, 260]], seg(u, 0.2, 1.6), ACC, 7);
      [['ChatPromptValue', 'Human: …요약해줘: 배송이…'], ['AIMessage', 'content="빠른 배송과…"'], ['str', '"빠른 배송과 좋은…"']].forEach(([a, z], i) => {
        const s = pop(u, 0.4 + i * 0.45); card(BLK[i].x, 280, 236, 50, { rx: 8, stroke: i === 2 ? ACC : GRID, fill: PANEL, s });
        mono(BLK[i].x, 275, a, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: s > 0.4 ? 1 : 0 });
        tx(BLK[i].x, 296, z, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: s > 0.4 ? 1 : 0, class: i ? 'mono' : null }); });
      ex(900, 230, fade(u, 1.4));
      // batch 100건: 병렬 줄
      const bu = seg(u, 1.6, 2.7);
      mono(40, 336, '.batch([... 100건])', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      for (let ln = 0; ln < 5; ln++) { const y = 352 + ln * 12; el('line', { x1: 200, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 1, opacity: fade(u, 1.6) });
        for (let j = 0; j < 4; j++) dot([[200, y], [900, y]], clamp(bu * 1.6 - j * 0.2 - ln * 0.03), ACC, 4); }
      tx(40, 392, '같은 chain, 동시에', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { // stream · ainvoke
      mono(40, 268, 'for chunk in chain.stream(...):', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      let x = 60; const n = Math.floor(E(u, 0.3, 2.2) * (CH.length + 0.99));
      CH.forEach((s, i) => { const w = tw(s.trim(), 14) + 18; if (i < n) card(x + w / 2, 300, w, 32, { rx: 6, text: s.trim(), fs: 14, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 0.3 + i * 0.32, 0.4) }); x += w + 6; });
      ex(560, 300, fade(u, 0.6));
      mono(40, 362, 'await chain.ainvoke(...)', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
      note(290, 362, '기다리는 동안 다른 요청을 받는다', fade(u, 1.7), { 'font-size': 14, fill: MUT });
      note(480, 404, '토큰 흐름과 비동기도 같은 chain에 이미 붙어 있다', fade(u, 2.2), { 'text-anchor': 'middle', 'font-size': 14 }); return; }
    // k 4: 한 객체, 네 가지 호출
    ['.invoke', '.batch', '.stream', '.ainvoke'].forEach((m, i) => { const x = 180 + i * 200, s = pop(u, 0.2 + i * 0.25);
      grow(x, 208, x, 250, seg(u, 0.1 + i * 0.25, 0.4 + i * 0.25), ACC, { plain: true }); pill(x, 268, m, ACC, s, { mono: true, fs: 15 }); });
    [['한 건', 180], ['여러 건 병렬', 380], ['토큰씩', 580], ['비동기', 780]].forEach(([s, x], i) => sub(x, 304, s, fade(u, 0.6 + i * 0.25)));
    note(480, 360, '직접 호출이라면 네 가지를 따로 짜야 한다', fade(u, 1.6), { 'text-anchor': 'middle', fill: BAD });
    note(480, 392, '프롬프트를 바꿀 때도 ChatPromptTemplate 한 줄만 바꾼다', fade(u, 2.0), { 'text-anchor': 'middle', fill: MUT, 'font-size': 14 }); }

  // ---------- 5. 줄 수 비교와 그 너머 ----------
  function bars(c) { const { k, u } = c, b = c.beat, p = c.prev || {}, L = b.leftBox.summaryRows, Rr = b.rightBox.summaryRows, pn = p.leftBox ? p.leftBox.summaryRows.length : 0, max = b.bar.max;
    const x0 = 250, W = 560;
    el('rect', { x: 600, y: 22, width: 14, height: 12, rx: 2, fill: BAD }); tx(620, 33, '직접 호출', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    el('rect', { x: 720, y: 22, width: 14, height: 12, rx: 2, fill: ACC }); tx(740, 33, 'LangChain LCEL', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    L.forEach((r, i) => { const y = 66 + i * 64, nw = i >= pn, g = nw ? E(u, 0.2 + (i - pn) * 0.35, 1.1 + (i - pn) * 0.35) : 1, tot = r.total;
      if (tot) el('line', { x1: 30, y1: y - 14, x2: 930, y2: y - 14, stroke: GRID, 'stroke-width': 1.5 });
      tx(30, y + 18, r.what, { 'font-size': 15, 'font-weight': tot ? 800 : 700, opacity: nw ? fade(u, 0.2 + (i - pn) * 0.35) : 1 });
      const a = r.n, z = Rr[i].n;
      el('rect', { x: x0, y: y, width: Math.max(3, W * a / max * g), height: 18, rx: 4, fill: BAD, opacity: tot ? 1 : 0.85 });
      el('rect', { x: x0, y: y + 22, width: Math.max(3, W * z / max * g), height: 18, rx: 4, fill: ACC });
      mono(x0 + W * a / max * g + 8, y + 15, a + '줄', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: g });
      mono(x0 + W * z / max * g + 8, y + 37, z + '줄', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: g }); });
    if (k === 0) pill(700, 92, `−${Math.round((1 - Rr[0].n / L[0].n) * 100)}%`, ACC, pop(u, 1.5), { fs: 16 });
    if (k === 2) { const t = L[L.length - 1].n, z = Rr[Rr.length - 1].n; banner(720, 366, `${t}줄 → ${z}줄 · −${Math.round((1 - z / t) * 100)}%`, pop(u, 1.4)); } }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { bars(c); return; }
    if (k === 3) { tx(240, 46, '직접 호출: 변형마다 새 파일', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD });
      tx(720, 46, 'LCEL: chain 하나', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC });
      ['단일 호출', '벤더 교체', '배치', '스트림'].forEach((s, i) => { const x = 90 + i * 100, sc = pop(u, 0.2 + i * 0.2); sheet(x, 140, s, INK, sc);
        el('circle', { cx: x + 8, cy: 136, r: 7, fill: BAD, opacity: fade(u, 1.2 + i * 0.15) }); });
      note(240, 250, '버그 하나를 네 곳에서 고친다', fade(u, 1.6), { 'text-anchor': 'middle', fill: BAD });
      card(720, 140, 300, 80, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.4, s: pop(u, 0.5) });
      mono(720, 132, 'chain', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      el('circle', { cx: 800, cy: 126, r: 7, fill: BAD, opacity: fade(u, 1.2) * (1 - fade(u, 2.0)) }); check(800, 126, 9, pop(u, 2.0));
      ['.invoke', '.batch', '.stream', '.ainvoke'].forEach((m, i) => mono(612 + i * 72, 160, m, { 'font-size': 13.5, fill: INK, opacity: fade(u, 0.8 + i * 0.15) }));
      note(720, 250, '고칠 곳은 한 곳', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC });
      el('line', { x1: 480, y1: 30, x2: 480, y2: 300, stroke: GRID, 'stroke-width': 1.5 });
      sub(480, 360, '줄 수보다 큰 차이는 유지보수할 코드가 몇 벌이냐다', fade(u, 2.3), { 'font-size': 15, fill: INK }); return; }
    if (k === 4) { const S = [{ x: 170, now: 'prompt', alt: '번역 템플릿', why: '새 작업' }, { x: 480, now: 'model', alt: 'claude-3-5-sonnet', why: 'A/B 테스트' }, { x: 790, now: 'parser', alt: 'JSON · Pydantic', why: '구조화 출력' }];
      S.forEach((s, i) => { const a = E(u, 0.4 + i * 0.6, 0.9 + i * 0.6);
        card(s.x, 200, 230, 70, { rx: 12, stroke: a > 0.5 ? ACC : INK, fill: a > 0.5 ? ACCBG : PANEL, sw: 2.2 });
        mono(s.x, 206, a > 0.5 ? s.alt : s.now, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: a > 0.5 ? ACC : INK });
        if (a > 0 && a < 1) card(s.x, lerp(110, 200, a), 200, 34, { rx: 8, text: s.alt, fs: 14, mono: true, stroke: ACC, fill: PANEL, op: 1 - a });
        if (i < 2) tx(s.x + 155, 214, '|', { 'text-anchor': 'middle', 'font-size': 38, 'font-weight': 800, class: 'mono', fill: ACC });
        sub(s.x, 262, s.why, fade(u, 0.9 + i * 0.6), { 'font-size': 15, 'font-weight': 700, fill: INK }); });
      note(480, 340, '한 자리만 바꾸고 나머지 두 자리는 그대로 쓴다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    // k 5: 직접 요리 vs 밀키트
    tx(240, 46, '직접 요리', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD });
    tx(720, 46, '밀키트', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC });
    [['재료 손질', '키 · URL'], ['양념', '헤더'], ['조리', '바디 · POST'], ['담기', '응답 파싱'], ['설거지', '에러 · 재시도']].forEach(([a, z], i) => {
      const y = 86 + i * 46, s = pop(u, 0.2 + i * 0.2); card(240, y, 330, 38, { rx: 8, stroke: GRID, s });
      tx(100, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: s > 0.4 ? 1 : 0 }); mono(390, y + 5, z, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s > 0.4 ? 1 : 0 }); });
    zone(580, 70, 280, 190, null, { fill: ACCBG, stroke: ACC, sw: 2.2, op: fade(u, 0.8) });
    ['prompt', 'model', 'parser'].forEach((s, i) => { const y = 106 + i * 56; card(720, y, 200, 40, { rx: 8, text: s, fs: 16, mono: true, stroke: ACC, fill: PANEL, s: pop(u, 1.0 + i * 0.25) });
      if (i < 2) tx(720, y + 36, '|', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3 + i * 0.25) }); });
    [['단일 호출', '17 → 5줄'], ['누적 변형', '47 → 8줄']].forEach(([a, z], i) => { const s = pop(u, 1.8 + i * 0.3);
      card(330 + i * 300, 340, 260, 56, { rx: 10, stroke: ACC, sw: 2, s }); mono(330 + i * 300, 346, `${a}  ${z}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: s > 0.4 ? 1 : 0 }); }); }

  const quiz = [
    { q: 'direct.py에서 답 문자열을 꺼내려면 응답 JSON을 어떻게 다뤄야 하나?',
      o: ['resp.text를 그대로 쓰면 된다', '["choices"][0]["message"]["content"]로 직접 파고든다', 'requests가 content 필드를 알아서 돌려준다'], a: 1,
      why: '직접 호출은 벤더 응답 구조를 코드가 외워야 한다. 키를 네 번 파고들어야 답이 나오고, 구조가 바뀌면 이 줄이 깨진다.' },
    { q: 'OpenAI 호출 코드를 Anthropic용으로 바꿀 때 그대로 둘 수 있는 것은 무엇인가?',
      o: ['인증 헤더 이름', '응답에서 답을 꺼내는 경로', '보낼 프롬프트 문자열'], a: 2,
      why: 'PROMPT 한 줄만 같고 URL, 키 헤더(x-api-key), 필수 필드(max_tokens), 답 위치(content[0].text)는 모두 다르다.' },
    { q: 'ChatOpenAI와 ChatAnthropic을 같은 코드로 부를 수 있는 이유는 무엇인가?',
      o: ['둘 다 BaseChatModel을 물려받아 같은 메서드를 가져서', '두 회사의 HTTP API가 원래 같아서', 'LangChain이 모든 요청을 OpenAI로 보내서'], a: 0,
      why: '벤더별 차이는 클래스 안에 숨고 밖에는 invoke·stream·batch·ainvoke가 똑같이 드러난다. 그래서 클래스 한 줄만 바꾸면 된다.' },
    { q: 'chain = prompt | model | parser에서 parser가 받는 값은 무엇인가?',
      o: ['{"review": ...} 입력 dict', '모델이 돌려준 AIMessage', '채워진 ChatPromptValue'], a: 1,
      why: '값은 dict → ChatPromptValue → AIMessage → str 순서로 바뀐다. StrOutputParser는 AIMessage에서 문자열만 꺼낸다.' },
    { q: '직접 호출 47줄과 LCEL 8줄의 차이보다 더 크다고 한 이득은 무엇인가?',
      o: ['요청 한 번의 응답 속도', 'API 요금이 줄어드는 것', '같은 chain 하나로 여러 호출 방식과 부품 교체를 처리하는 것'], a: 2,
      why: '직접 호출은 변형마다 코드가 한 벌씩 늘어 버그도 여러 곳에서 고친다. LCEL은 chain 하나에 메서드만 바꿔 부르고 자리별로 부품을 갈아 끼운다.' },
  ];

  const summary = [
    'LLM을 requests로 직접 부르면 키, 헤더, 바디, 응답 파싱까지 한 번 호출에 17줄이 든다.',
    '벤더를 바꾸면 URL, 인증 헤더, 필수 필드, 답 위치가 모두 달라 코드를 새로 짠다.',
    'ChatOpenAI와 ChatAnthropic은 같은 BaseChatModel 메서드를 가져서 클래스만 바꾸면 된다.',
    'prompt | model | parser 체인 하나로 invoke, batch, stream, ainvoke를 모두 쓴다.',
  ];
  const review = [
    { q: '팀이 OpenAI와 Claude 답을 비교하려고 직접 호출 코드를 두 벌 짰다. 세 번째 벤더가 추가될 때 가장 적은 수정으로 끝내는 방법은?',
      o: ['세 번째 벤더용 requests 코드를 한 벌 더 짠다', '모델을 BaseChatModel 클래스나 init_chat_model로 바꿔 같은 invoke로 부른다', '세 벤더의 응답 JSON을 하나의 dict로 합친다'], a: 1,
      why: '공통 인터페이스 뒤에서는 벤더가 늘어도 호출 코드는 그대로다. 바뀌는 것은 클래스 이름이나 model_provider 문자열뿐이다.' },
    { q: '리뷰 100건을 요약하던 for 문 코드를 LCEL로 옮기려 한다. 같은 일을 하는 호출은?',
      o: ['chain.stream(reviews)', 'chain.invoke(reviews)', 'chain.batch([{"review": r} for r in reviews])'], a: 2,
      why: 'batch는 입력 목록을 받아 같은 chain을 병렬로 돌린다. invoke는 한 건, stream은 한 건의 토큰을 흘려보낸다.' },
    { q: '요약 체인의 출력을 문자열 대신 dict로 받고 싶다. prompt | model | parser 중 바꿀 자리는?',
      o: ['parser', 'prompt', 'model'], a: 0,
      why: '출력 모양은 마지막 자리 parser가 정한다. StrOutputParser를 JSON이나 Pydantic 파서로 바꾸면 나머지 두 자리는 그대로 쓴다.' },
  ];

  R.page({ title: 'LLM 호출이 체인이 되기까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
