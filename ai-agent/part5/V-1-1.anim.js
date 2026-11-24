/* V-1-1 Single Agent 설계 패턴 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   System Prompt 글, tool JSON 스키마, 메모리 칸, ReAct 고리, 점검표를 화면에 그대로 놓는다. 대화 예는 페이지의 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, clamp, seg, pop, fade, tw, card, mono, sub, pill, grow, fly, dot, check, cross, spans, tokens, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 이 페이지 도우미 ----------
  const ap = (c, at, t0 = 0.2, d = 0.6) => (c.k > at ? 1 : c.k === at ? seg(c.u, t0, t0 + d) : 0);
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const ROLE = { system: [INFO, INFOBG], user: [INK, SOFT], assistant: [ACC, ACCBG], tool: [GOOD, GOODBG], error: [BAD, BADBG] };
  function msg(x, y, w, role, lines, o) {
    o = o || {}; lines = [].concat(lines); const h = 34 + (lines.length - 1) * 22, op = o.op ?? 1; if (op <= 0.01) return h;
    const [col, bg] = ROLE[o.as || role], g = el('g', { opacity: op });
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.hot ? bg : PANEL, stroke: col, 'stroke-width': o.hot ? 2.4 : 1.5 }, g);
    const rw = tw(role, 13.5) + 14;
    el('rect', { x: x + 6, y: y + 6, width: rw, height: 22, rx: 11, fill: col }, g);
    mono(x + 6 + rw / 2, y + 22, role, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }, g);
    lines.forEach((s, i) => tx(x + rw + 14, y + 22 + i * 22, s, { 'font-size': 14, fill: o.strike ? BAD : INK, class: o.mono ? 'mono' : null, style: 'white-space:pre', 'text-decoration': o.strike ? 'line-through' : null }, g));
    return h; }
  function codeBox(x, y, w, rows, o) {
    o = o || {}; const fs = o.fs || 14, lh = fs + 9, h = o.h || rows.length * lh + 16;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    rows.forEach((r, i) => { if (typeof r === 'string') r = { s: r }; const op = (r.op ?? 1) * (o.op ?? 1); if (op <= 0.01) return; const yy = y + 8 + i * lh;
      if (r.hl) el('rect', { x: x + 4, y: yy, width: w - 8, height: lh, rx: 4, fill: r.bad ? BADBG : r.good ? GOODBG : ACCBG, opacity: op });
      const s = r.f != null ? typed(r.s, r.f) : r.s;
      if (r.col) mono(x + 12, yy + lh / 2 + fs * 0.36, s, { 'font-size': fs, fill: r.col, 'font-weight': r.bold ? 700 : 400, opacity: op });
      else spans(x + 12, yy + lh / 2 + fs * 0.36, tokens(s), { 'font-size': fs, opacity: op }); });
    return h; }
  function iters(x, y, n, it, o) {
    o = o || {}; const g = el('g', { opacity: o.op ?? 1 }), col = o.col || ACC, cw = o.cw || 32;
    tx(x, y - 9, o.label || 'iteration', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }, g);
    for (let i = 0; i < n; i++) { const f = clamp(it - i);
      el('rect', { x: x + i * (cw + 6), y, width: cw, height: 26, rx: 5, fill: f > 0 ? col : PANEL, 'fill-opacity': f > 0 ? 0.2 + 0.8 * f : 1, stroke: f > 0 ? col : GRID, 'stroke-width': 1.6 }, g);
      mono(x + i * (cw + 6) + cw / 2, y + 18, String(i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: f > 0.5 ? PANEL : MUT, 'font-weight': 700 }, g); }
    if (o.count !== false) mono(x + n * (cw + 6) + 6, y + 18, `${Math.round(it)} / ${n}`, { 'font-size': 14, 'font-weight': 700, fill: col }, g); }
  function arc(cx, cy, r, a0, a1, col, o) { o = o || {}; if (a1 - a0 < 1) return;
    const P = (a) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)], [x0, y0] = P(a0), [x1, y1] = P(a1);
    el('path', { d: `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 3, 'stroke-dasharray': o.dash, 'marker-end': o.head === false ? null : col === ACC ? 'url(#ra-ahb)' : 'url(#ra-ah)' }); }
  const RX = 490, RW = 450;   // 오른쪽 칸

  // 1. System Prompt — 페르소나 / 규칙 / 출력 형식
  function s1(t, c) { const { k, u } = c;
    // 왼쪽: messages[0] 의 실제 글
    el('rect', { x: 24, y: 18, width: 440, height: 384, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2 });
    el('rect', { x: 32, y: 26, width: 72, height: 24, rx: 12, fill: INFO }); mono(68, 43, 'system', { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' });
    tx(114, 43, 'messages[0] · 모든 행동의 출발점', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const H = (i) => ap(c, 0, 0.2 + i * 0.35, 0.4);
    const rows = [
      ['## 1) Persona', H(0), 'h', 1], ['CustomerSupportBot v1.2', ap(c, 1, 0.2, 0.8), 'b', 1], ['TechCorp 전자제품 · 한국어 2~4문장', ap(c, 1, 0.6, 0.8), '', 1],
      ['## 2) Rules', H(1), 'h', 2], ['✕ 의료·법률 조언 → 전문가 안내', ap(c, 2, 0.2, 0.4), 'x', 2], ['✕ 환불 약속 (권한 없음)', ap(c, 2, 0.45, 0.4), 'x', 2],
      ['✕ 스펙 지어내기 → lookup_product', ap(c, 2, 0.7, 0.4), 'x', 2], ['? 모르면 "확인이 필요합니다" + escalate', ap(c, 2, 0.95, 0.4), 'q', 2],
      ['## 3) Output Format', H(2), 'h', 3], ['[원인] …  [해결] …  [다음] …', ap(c, 3, 0.2, 0.8), 'b', 3],
      ['## 4) Few-shot', ap(c, 4, 0.2, 0.4), 'h', 4], ['Q: "노트북이 부팅 안 돼요"', ap(c, 4, 0.5, 0.6), '', 4]];
    rows.forEach(([s, op, kind, blk], i) => { if (op <= 0) return; const y = 64 + i * 27, hot = k === blk || (k === 0 && kind === 'h' && blk <= 3);
      if (hot && kind !== 'h') el('rect', { x: 32, y: y - 2, width: 424, height: 25, rx: 4, fill: ACCBG, opacity: op });
      const col = kind === 'h' ? INFO : kind === 'x' ? BAD : kind === 'q' ? WARN : INK;
      tx(kind === 'h' ? 40 : 52, y + 16, s, { 'font-size': kind === 'h' ? 15 : 14, 'font-weight': kind === 'h' || kind === 'b' ? 700 : 500, fill: col, class: kind === 'h' ? 'mono' : null, opacity: op }); });
    if (k === 0) tx(244, 386, '세 블록이 곧 고칠 자리 세 곳이다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.6) });

    // 오른쪽: 이 블록이 행동을 어떻게 바꾸나
    if (k === 0) { card(RX + RW / 2, 80, 380, 46, { text: '"친절한 챗봇입니다. 도와드립니다."', fs: 15, stroke: BAD, color: MUT, s: pop(u, 0.3) });
      cross(RX + RW / 2 + 200, 80, 10, pop(u, 0.9));
      tx(RX + RW / 2, 128, '한 줄짜리 프롬프트는 어디를 고칠지 모른다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
      ['Persona', 'Rules', 'Output'].forEach((s, i) => card(RX + 80 + i * 145, 210, 125, 70, { rx: 10, text: s, fs: 16, fw: 800, stroke: INFO, color: INFO, dash: '6 5', s: pop(u, 0.8 + i * 0.3) })); }
    if (k === 1) { card(RX + RW / 2, 74, 300, 48, { rx: 24, fill: INFO, stroke: 'none', text: 'CustomerSupportBot v1.2', fs: 16, mono: true, color: PANEL, s: pop(u, 0.3) });
      [['도메인', 'TechCorp 전자제품'], ['언어', '한국어'], ['길이', '2~4문장'], ['태도', '화난 사용자에겐 공감']].forEach(([a, b], i) => { const y = 140 + i * 50, op = fade(u, 0.8 + i * 0.3);
        tx(RX + 60, y + 6, a, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: op }); tx(RX + 150, y + 6, b, { 'font-size': 16, 'font-weight': 700, opacity: op });
        el('line', { x1: RX + 50, y1: y + 22, x2: RX + RW - 30, y2: y + 22, stroke: GRID, opacity: op }); }); }
    if (k === 2) { msg(RX, 40, RW, 'user', '환불해 주세요', { op: fade(u, 0.2) });
      msg(RX, 90, RW, 'assistant', '네, 바로 환불해 드릴게요', { op: fade(u, 0.6), strike: u > 1.1 });
      if (u > 1.1) tx(RX + RW - 12, 152, 'DO NOT promise refunds', { 'font-size': 14, fill: BAD, 'font-weight': 700, class: 'mono', 'text-anchor': 'end', opacity: fade(u, 1.1) });
      msg(RX, 180, RW, 'assistant', ['확인이 필요합니다.', 'escalate_to_human(reason="refund")'], { op: fade(u, 1.6), hot: true });
      sub(RX + RW / 2, 270, '(예시 대화)', fade(u, 1.6), { 'font-size': 13.5 }); }
    if (k === 3) { [['[원인]', '한 줄'], ['[해결]', '단계별 번호 매기기'], ['[다음]', '사용자가 막히면 할 일']].forEach(([a, b], i) => { const y = 60 + i * 66, s = pop(u, 0.2 + i * 0.35);
        card(RX + RW / 2, y + 20, RW - 20, 54, { rx: 8, stroke: ACC, sw: 2, s }); mono(RX + 30, y + 26, a, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.35) });
        tx(RX + 120, y + 26, b, { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.35) }); });
      tx(RX + RW / 2, 290, '답이 매번 같은 모양이라 파싱하고 자동 검증할 수 있다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 4) { msg(RX, 40, RW, 'user', '노트북이 부팅 안 돼요', { op: fade(u, 0.2) });
      msg(RX, 88, RW, 'assistant', ['[원인] 전원 어댑터 또는 배터리 문제', '[해결] 1. 어댑터 분리 후 30초 대기', '          2. 재연결 후 부팅', '[다음] 같은 증상이면', '          escalate_to_human 호출'], { op: fade(u, 0.8), hot: true });
      tx(RX + RW / 2, 250, '규칙을 글로 읽는 것보다 예시 하나가 더 잘 지켜진다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) }); } }

  // 2. Tools — description + parameters
  function s2(t, c) { const { k, u } = c;
    tx(24, 30, 'LLM이 받는 tool 목록 (JSON 스키마)', { 'font-size': 15, 'font-weight': 800 });
    const a2 = ap(c, 2, 0.2, 1.0), a3 = ap(c, 3, 0.2, 1.0), a4 = ap(c, 4, 0.2, 1.0), a5 = ap(c, 5, 0.2, 0.8);
    codeBox(24, 42, 446, [
      { s: '{"name": "lookup_product",', op: a2, f: a2 },
      { s: ' "description": "제품 스펙 조회 …', op: a3, f: a3, hl: k === 3 },
      { s: '   언제: 스펙·호환성 질문, 반환: ProductSpec",', op: a3, f: a3, hl: k === 3 },
      { s: ' "parameters": {"model_id": {"type": "string",', op: a2, f: a2 },
      { s: '   "pattern": "^TC-[A-Z]{2}-\\d{4}$"}}}', op: a2, f: a2, hl: k === 2 },
      { s: '{"name": "escalate_to_human",', op: a4, f: a4 },
      { s: ' "description": "사람 상담원에게 인계 …",', op: a5, f: a5, hl: k === 5 },
      { s: ' "parameters": {"reason": {"enum":', op: a4, f: a4 },
      { s: '   ["refund", "technical", "complaint"]},', op: a4, f: a4, hl: k === 4 },
      { s: '  "summary": {"maxLength": 500}}}', op: a4, f: a4, hl: k === 4 }], { fs: 13.5, op: 1 });
    if (k < 2) sub(247, 160, '아직 비어 있다', 1, { 'font-size': 14 });
    // 오른쪽: 코드 쪽 검증
    if (k === 0) { pill(RX + 130, 70, 'from pydantic import Field', INK, pop(u, 0.2), { mono: true, fs: 14 }); pill(RX + 130, 116, 'from typing import Literal', INK, pop(u, 0.5), { mono: true, fs: 14 });
      tx(RX + 270, 75, '설명·정규식·길이 제한', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) }); tx(RX + 270, 121, '고를 수 있는 값 목록', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1) });
      card(RX + RW / 2, 230, 360, 50, { rx: 8, text: 'def search(q: str) -> str: ...', mono: true, fs: 14.5, stroke: BAD, color: MUT, s: pop(u, 1.5) });
      tx(RX + RW / 2, 280, '맨몸 함수는 아무 문자열이나 통과시킨다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (k === 1) { tx(RX + 10, 40, 'class ProductSpec(BaseModel)', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      [['model_id', 'str'], ['name', 'str'], ['released', 'str (ISO date)'], ['warranty_months', 'int'], ['compatible_accessories', 'list[str]']].forEach(([a, b], i) => { const y = 56 + i * 42, s = pop(u, 0.3 + i * 0.25);
        card(RX + RW / 2, y + 17, RW - 10, 34, { rx: 6, stroke: GRID, sw: 1.5, s }); mono(RX + 18, y + 22, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.35 + i * 0.25) }); mono(RX + RW - 20, y + 22, b, { 'font-size': 14.5, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.35 + i * 0.25) }); });
      tx(RX + RW / 2, 290, '반환 타입 str 을 구조체로 바꾼다. 결과 모양을 LLM이 미리 안다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k === 2) { tx(RX + RW / 2, 44, 'model_id 정규식 검사', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      [['TC-NB-2024', true], ['tc-nb-2024', false], ['노트북 스펙', false]].forEach(([s, ok], i) => { const y = 92 + i * 62, a = 0.3 + i * 0.5;
        fly(RX + 60, y, RX + 200, y, seg(u, a, a + 0.5), s, { fill: ok ? GOOD : BAD, mono: true, stay: true });
        if (u > a + 0.5) { (ok ? check : cross)(RX + 300, y, 10, pop(u, a + 0.5)); tx(RX + 324, y + 6, ok ? '호출 통과' : '호출 단계에서 실패', { 'font-size': 14.5, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, a + 0.6) }); } });
      tx(RX + RW / 2, 300, '잘못된 ID 는 도구가 돌기 전에 걸러진다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 3) { [['무엇', '제품 스펙 조회 (모델명·출시일·보증·액세서리)'], ['언제', '스펙이나 호환성을 물을 때'], ['반환', 'ProductSpec (못 찾으면 ValueError)']].forEach(([a, b], i) => { const y = 50 + i * 46, op = fade(u, 0.2 + i * 0.3);
        pill(RX + 32, y, a, ACC, pop(u, 0.2 + i * 0.3), { fs: 14.5 }); tx(RX + 70, y + 6, b, { 'font-size': 14.5, opacity: op }); });
      msg(RX, 196, RW, 'user', '이 노트북에 이 충전기 되나요?', { op: fade(u, 1.2) });
      grow(RX + RW / 2, 236, RX + RW / 2, 270, E(u, 1.6, 2.0), ACC);
      pill(RX + RW / 2, 290, '"언제" 와 맞는다 → lookup_product 호출', ACC, pop(u, 2.0), { fs: 14.5 }); }
    if (k === 4) { tx(RX + RW / 2, 44, 'reason 은 세 값 중 하나만', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      ['refund', 'technical', 'complaint'].forEach((s, i) => pill(RX + 90 + i * 140, 90, '"' + s + '"', GOOD, pop(u, 0.2 + i * 0.2), { mono: true, fs: 14.5 }));
      fly(RX + RW / 2, 210, RX + RW / 2, 150, seg(u, 0.9, 1.5), 'reason="음… 화나신 듯"', { fill: BAD, stay: true });
      if (u > 1.5) { cross(RX + RW / 2 + 130, 150, 9, pop(u, 1.5)); tx(RX + RW / 2, 192, '목록 밖 값은 들어올 자리가 없다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
      tx(RX + 10, 258, 'summary', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.8) });
      el('rect', { x: RX + 100, y: 245, width: 300, height: 18, rx: 4, fill: SOFT, stroke: GRID, opacity: fade(u, 1.8) }); el('rect', { x: RX + 100, y: 245, width: 300 * E(u, 1.9, 2.5), height: 18, rx: 4, fill: WARN });
      mono(RX + 410, 259, '500자', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.3) }); }
    if (k === 5) { tx(RX + RW / 2, 44, 'tool 세트 완성', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      [['lookup_product(model_id)', '→ ProductSpec'], ['escalate_to_human(reason, summary)', '→ { ticket_id, queue_position }']].forEach(([a, b], i) => { const y = 92 + i * 84, s = pop(u, 0.3 + i * 0.5);
        card(RX + RW / 2, y + 14, RW - 10, 66, { rx: 10, stroke: GOOD, sw: 2, s }); check(RX + 26, y + 14, 8, s);
        mono(RX + 44, y + 6, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) }); mono(RX + 44, y + 30, b, { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 0.5 + i * 0.5) }); });
      tx(RX + RW / 2, 290, '두 도구 모두 무엇·언제·반환이 적혀 있다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) }); } }

  // 3. Memory — chat history + scratchpad
  const SL = { x: 232, y: 62, w: 28, g: 4 };   // recent 칸 11개
  const slotX = (i) => SL.x + i * (SL.w + SL.g);
  function s3(t, c) { const { k, u } = c;
    zone(24, 18, 590, 216, 'ChatHistory (영구 · 사용자와의 대화)', { stroke: k >= 1 && k <= 3 ? ACC : 'none', sw: 2 });
    // 칸 자: 1~11, 5 와 10 표시
    for (let i = 0; i < 11; i++) { el('rect', { x: slotX(i), y: SL.y, width: SL.w, height: 40, rx: 5, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });
      mono(slotX(i) + SL.w / 2, SL.y + 58, String(i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    const mk = k === 0 ? E(u, 0.4, 1.2) : 1, mk2 = k === 0 ? E(u, 1.2, 2.0) : 1;
    el('line', { x1: slotX(10) - 2, y1: SL.y - 8, x2: slotX(10) - 2, y2: SL.y + 46, stroke: BAD, 'stroke-width': 2.5, opacity: mk });
    mono(slotX(10) - 6, SL.y + 82, 'SUMMARIZE_AFTER = 10', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: mk });
    el('rect', { x: slotX(6) - 2, y: SL.y - 6, width: 5 * (SL.w + SL.g), height: 52, rx: 7, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: mk2 });
    mono(slotX(0), SL.y + 104, 'MAX_RECENT_TURNS = 5 (뒤 5건 원문 유지)', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: mk2 });
    // summary 칸
    const sb = ap(c, 1, 0.2, 0.5);
    el('rect', { x: 40, y: SL.y - 6, width: 172, height: 120, rx: 8, fill: k >= 2 ? INFOBG : PANEL, stroke: INFO, 'stroke-width': 2, opacity: sb });
    mono(52, SL.y + 14, 'summary', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: sb });
    if (k === 1) mono(52, SL.y + 40, '""  (비어 있음)', { 'font-size': 14, fill: MUT, opacity: sb });
    if (k === 1) mono(slotX(0), SL.y + 128, 'recent: []', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
    // 메시지 11건이 차고, 앞 6건이 요약으로 접힌다
    if (k >= 2) { const fill = k === 2 ? E(u, 0.1, 1.0) * 11 : 11, fold = k === 2 ? E(u, 1.2, 2.0) : 1;
      for (let i = 0; i < 11; i++) { if (fill - i <= 0) continue; const old = i < 6, op = clamp(fill - i);
        const fx = old ? slotX(i) + (60 - slotX(i)) * fold : slotX(i), fy = old ? SL.y + 30 * fold : SL.y, sc = old ? 1 - 0.55 * fold : 1;
        if (old && fold >= 0.99) continue;
        el('rect', { x: fx, y: fy, width: SL.w * sc, height: 40 * sc, rx: 5, fill: i % 2 ? ACC : INK, opacity: op * (old ? 1 - 0.6 * fold : 1) }); }
      if (fold > 0.3) { mono(52, SL.y + 40, '앞 6건 요약', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fold }); mono(52, SL.y + 64, '(LLM summarize)', { 'font-size': 13.5, fill: MUT, opacity: fold }); }
      if (k === 2) mono(330, 210, typed('recent 11 → 5건', E(u, 1.6, 2.4)), { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); }
    // to_messages → 6개
    if (k >= 3) { const op = k === 3 ? 1 : 0.5;
      tx(630, 30, 'to_messages()', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: op });
      const L = [['system', '[과거 요약] 앞 6건'], ['user', '7번째 메시지'], ['assistant', '8번째 메시지'], ['user', '9번째 메시지'], ['assistant', '10번째 메시지'], ['user', '11번째 메시지']];
      L.forEach(([r, s], i) => msg(630, 42 + i * 37, 310, r, s, { op: (k === 3 ? fade(u, 0.3 + i * 0.2) : 1) * op, hot: i === 0 && k === 3 }));
      if (k === 3) mono(785, 292, '전송 메시지 6개', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
    // Scratchpad
    zone(24, 250, 590, 154, 'Scratchpad (휘발 · 이 요청 안에서만)', { stroke: k >= 4 ? WARN : 'none', sw: 2, op: k >= 3 ? 1 : 0.5 });
    if (k >= 4) { const gone = k === 5 ? E(u, 0.6, 1.4) : 0;
      [0, 1, 2].forEach((i) => { const op = (k === 4 ? fade(u, 0.3 + i * 0.4) : 1) * (1 - gone); if (op <= 0.01) return;
        el('rect', { x: 40 + gone * 30 * (i + 1), y: 284 + i * 36, width: 556, height: 30, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, opacity: op });
        mono(52 + gone * 30 * (i + 1), 304 + i * 36, `tool_calls[${i}] = {"name": …, "args": …, "result": …}`, { 'font-size': 14, opacity: op }); });
      if (k === 4) mono(596, 274, 'record() 3건', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.4) }); }
    if (k === 5) { mono(319, 330, 'pad.clear()  →  tool_calls = []  (0건)', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(319, 370, '다음 요청은 빈 scratchpad 로 시작한다. history 는 남는다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.9) }); } }

  // 4. Loop — max iterations + 종료 조건
  const O = { x: 235, y: 225, r: 120 };
  const NODE = [['생각', 'llm.invoke', 0], ['행동', 'tool 실행', 120], ['관찰', 'pad.record', 240]];
  const nodeXY = (a) => [O.x + O.r * Math.sin(a * Math.PI / 180), O.y - O.r * Math.cos(a * Math.PI / 180)];
  function s4(t, c) { const { k, u } = c;
    // 오른쪽: 상한 두 개
    const it = [0, 0, 1, 1, 1, 2, 8][k], pit = k ? [0, 0, 1, 1, 1, 2, 8][k - 1] : 0;
    iters(500, 46, 8, k === 6 ? pit + (it - pit) * E(u, 0.2, 1.4) : k === 2 ? E(u, 0.2, 0.8) : k === 5 ? 1 + E(u, 1.6, 2.2) : it, { label: 'MAX_ITER = 8  (LLM 호출 상한)', cw: 34, op: ap(c, 0, 0.2, 0.5) });
    const n = k >= 4 ? 1 : 0;
    tx(500, 112, 'MAX_SAME_TOOL = 3  (tool_log 를 Counter 로 센다)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: ap(c, 0, 0.8, 0.5) });
    for (let i = 0; i < 3; i++) { const f = k === 4 && i === 0 ? E(u, 0.8, 1.4) : i < n ? 1 : 0;
      el('rect', { x: 500 + i * 74, y: 122, width: 68, height: 26, rx: 5, fill: f > 0 ? WARN : PANEL, 'fill-opacity': f > 0 ? 0.25 + 0.75 * f : 1, stroke: f > 0 ? WARN : GRID, 'stroke-width': 1.6, opacity: ap(c, 0, 0.8, 0.5) }); }
    if (k >= 4) mono(730, 140, 'lookup_product 1 / 3', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: k === 4 ? fade(u, 1.2) : 1 });
    // ReAct 고리
    const ring = ap(c, 1, 0.2, 1.0);
    el('circle', { cx: O.x, cy: O.y, r: O.r, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: ring });
    if (ring > 0) { [[18, 102], [138, 222], [258, 342]].forEach(([a0, a1], i) => arc(O.x, O.y, O.r, a0, a0 + (a1 - a0) * clamp(ring * 3 - i), MUT, { sw: 2.5, head: ring * 3 - i > 0.97 })); }
    NODE.forEach(([a, b, ang], i) => { const [x, y] = nodeXY(ang), hot = (k === 2 && i === 0) || (k === 5 && i > 0);
      card(x, y, 124, 58, { rx: 12, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: hot ? 2.6 : 2, op: ring, text: `${a}\n${b}`, fs: 14.5, fw: 700 }); });
    mono(O.x, O.y + 5, 'for step in range(8)', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: ring });
    // 요청 시작
    if (k >= 1) { const op = k === 1 ? fade(u, 1.0) : 1;
      msg(500, 178, 440, 'user', '노트북이 부팅 안 돼요  (예시)', { op, hot: k === 1 });
      mono(500, 238, 'pad = Scratchpad()   tool_log = []', { 'font-size': 14, opacity: k === 1 ? fade(u, 1.5) : 1 });
      mono(940, 238, `pad ${k >= 5 && !(k === 5 && u < 1.2) && k < 6 ? 1 : 0}건`, { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 1.5) : 1 }); }
    // 1회차: history + pad + tools 를 들고 LLM 으로
    if (k === 2) { const [x, y] = nodeXY(0);
      ['history', 'pad', 'tools'].forEach((s, i) => fly(600 + i * 100, 275, x + 66, y + 6 + i * 4, seg(u, 0.3 + i * 0.2, 1.2 + i * 0.2), s, { fill: i === 1 ? WARN : i === 2 ? INFO : INK }));
      el('rect', { x: 500, y: 262, width: 440, height: 82, rx: 8, fill: SOFT, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.6) });
      mono(512, 286, 'action = {"type": "tool",', { 'font-size': 14, opacity: fade(u, 1.7) });
      mono(512, 310, '  "tool_name": "lookup_product",', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.8) });
      mono(512, 334, '  "tool_args": {"model_id": "TC-NB-2024"}}', { 'font-size': 14, opacity: fade(u, 1.9) }); }
    // final 이면 바로 끝
    if (k === 3) { el('rect', { x: 500, y: 262, width: 440, height: 116, rx: 10, fill: PANEL, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      mono(512, 288, 'if action.type == "final":', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.4) });
      mono(532, 314, 'history.append("assistant", …)', { 'font-size': 14, opacity: fade(u, 0.8) });
      mono(532, 338, 'pad.clear();  return action.text', { 'font-size': 14, opacity: fade(u, 1.1) });
      tx(720, 400, '이번 action 은 "tool" 이라 아래로 계속', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { pill(720, 290, 'tool_log.append("lookup_product")', WARN, pop(u, 0.3), { mono: true, fs: 14 });
      tx(720, 340, '같은 이름이 3번 쌓이면 사람에게 인계', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.5) }); }
    if (k === 5) { const [x1, y1] = nodeXY(120), [x2, y2] = nodeXY(240);
      dot([[x1, y1], [O.x, O.y + O.r], [x2, y2]], seg(u, 0.2, 1.2), ACC, 7);
      pill(720, 290, 'pad.record(name, args, result)', WARN, pop(u, 1.0), { mono: true, fs: 14 });
      tx(720, 340, '이 기록이 2회차 생각의 재료가 된다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 6) { card(720, 312, 440, 76, { rx: 10, fill: INK, stroke: 'none', s: pop(u, 1.4) });
      tx(720, 306, '처리 단계 한도를 넘었습니다.', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(720, 330, '질문을 단순화해 주세요.', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(720, 386, '8칸을 다 쓰면 pad 를 비우고 이 문구로 끝난다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); } }

  // 5. 점검표 — 4 영역 × 5
  const AREA = [
    ['System Prompt', ['페르소나 명시', 'DO NOT 5개 이내', '출력 형식 고정', 'few-shot 1~3개', '모르면 escalate']],
    ['Tools', ['이름이 의도 표현', '무엇·언제·반환', 'enum·regex·range', 'Pydantic 응답', 'tool 8개 이하']],
    ['Memory', ['영구·휘발 분리', 'N건 넘으면 요약', 'pad 는 clear()', '토큰 8k 모니터링', 'PII 마스킹']],
    ['Loop', ['MAX_ITER 5~10', '명시 종료 신호', '같은 tool 3회 break', '토큰·비용 로깅', 'timeout 30s']]];
  function s5(t, c) { const { k, u } = c;
    const done = Math.min(k, 4);
    tx(24, 34, '4 영역 × 5 항목', { 'font-size': 17, 'font-weight': 800, opacity: ap(c, 0, 0.2, 0.5) });
    tx(190, 34, '다 채우면 80점, 나머지는 평가셋과 모니터링', { 'font-size': 14.5, fill: MUT, opacity: ap(c, 0, 0.6, 0.5) });
    mono(936, 34, `채운 영역 ${done} / 4`, { 'font-size': 15, 'font-weight': 800, fill: done === 4 ? GOOD : ACC, 'text-anchor': 'end', opacity: ap(c, 0, 0.9, 0.5) });
    AREA.forEach(([name, items], a) => { const x = 24 + a * 231, on = k >= a + 1, cur = k === a + 1, op = k === 0 ? fade(u, 0.4 + a * 0.25) : 1;
      el('rect', { x, y: 54, width: 220, height: 250, rx: 10, fill: on ? GOODBG : PANEL, stroke: cur ? GOOD : GRID, 'stroke-width': cur ? 2.6 : 1.5, opacity: op });
      tx(x + 14, 82, name, { 'font-size': 16, 'font-weight': 800, fill: on ? GOOD : INK, opacity: op });
      items.forEach((s, i) => { const y = 104 + i * 38, ck = cur ? clamp(u * 2.4 - 0.4 - i * 0.35) : on ? 1 : 0;
        el('rect', { x: x + 14, y, width: 20, height: 20, rx: 4, fill: PANEL, stroke: ck > 0 ? GOOD : MUT, 'stroke-width': 1.8, opacity: op });
        if (ck > 0) check(x + 24, y + 10, 6, pop(ck, 0, 1));
        tx(x + 44, y + 15, s, { 'font-size': 14, opacity: op, fill: ck > 0 ? INK : MUT }); }); });
    if (k === 5) { el('rect', { x: 24, y: 318, width: 912, height: 86, rx: 10, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.2) });
      tx(40, 344, '5. 평가 (다음 단계)', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      [['골든 셋', '30~100개'], ['지표 3개', '정답률 · 호출 수 · 비용'], ['회귀 테스트', 'CI 에 연결']].forEach(([a, b], i) => { const x = 60 + i * 300, op = fade(u, 0.7 + i * 0.35);
        tx(x, 380, a, { 'font-size': 15, 'font-weight': 800, opacity: op }); tx(x + tw(a, 15) + 12, 380, b, { 'font-size': 14.5, fill: MUT, opacity: op }); }); } }

  const quiz = [
    { q: 'System Prompt에 출력 형식 블록을 고정해 두면 얻는 것은 무엇인가?',
      o: ['응답 속도가 빨라진다', '답이 매번 [원인]·[해결]·[다음] 같은 모양이라 파싱과 자동 검증이 된다', '금칙을 따로 적지 않아도 된다'], a: 1,
      why: '형식이 섹션 세 개로 고정되면 답변 모양이 흔들리지 않는다. 그래서 코드로 읽고 회귀 테스트를 걸 수 있다.' },
    { q: 'LLM이 tool을 부를지 정할 때 주로 읽는 것은 무엇인가?',
      o: ['tool의 description (무엇·언제·반환)', '함수 본문 코드', '반환 클래스의 필드 개수'], a: 0,
      why: 'LLM은 시그니처나 본문이 아니라 설명을 읽는다. "언제 호출" 이 적혀 있어야 호환성 질문에 lookup_product를 제때 부른다.' },
    { q: 'scratchpad를 응답 뒤에 비우지 않으면 무슨 일이 생기나?',
      o: ['대화 요약이 사라진다', 'MAX_ITER가 줄어든다', '다음 요청이 앞 요청의 tool 중간 결과를 읽는다'], a: 2,
      why: 'scratchpad는 한 요청 안의 tool 기록이다. clear()를 빼먹으면 남의 중간 결과가 다음 판단에 섞인다.' },
    { q: 'loop.py에서 같은 tool 이름이 tool_log에 3번 쌓이면 어떻게 되나?',
      o: ['루프에 빠졌다고 보고 사람에게 넘기는 문구를 돌려준다', 'MAX_ITER를 8에서 16으로 늘린다', 'scratchpad를 지우고 처음부터 다시 돈다'], a: 0,
      why: 'Counter로 센 최빈 tool이 MAX_SAME_TOOL 3에 닿으면 "동일 도구 반복 호출, 사람에게 인계합니다" 를 반환한다.' },
    { q: '점검표 4 영역을 다 채운 뒤 다음 단계로 든 것은 무엇인가?',
      o: ['tool을 20개 이상으로 늘린다', '골든 셋과 정답률·호출 수·비용 세 지표로 회귀를 자동화한다', 'System Prompt를 한 줄로 줄인다'], a: 1,
      why: '4 영역으로 80점을 만든 뒤 나머지는 평가다. 골든 셋 30~100개와 지표 3개를 CI에 연결한다.' },
  ];

  const summary = [
    'System Prompt는 페르소나, 금칙, 출력 형식 세 블록으로 나눠 쓰고 few-shot 예시로 톤을 굳힌다.',
    'LLM은 tool의 description을 읽고 부른다. 무엇, 언제, 반환을 적고 인자는 정규식과 Literal로 좁힌다.',
    '대화는 10건을 넘으면 앞 6건을 요약하고, tool 중간 결과는 scratchpad에 두었다가 응답 뒤 비운다.',
    '루프는 MAX_ITER 8, 같은 tool 3회, final 신호 가운데 하나에 걸려 반드시 끝난다.',
  ];
  const review = [
    { q: '상담 봇이 DB에 없는 제품 스펙을 그럴듯하게 지어내 답했다. 먼저 손볼 곳은?',
      o: ['System Prompt에 스펙은 지어내지 말고 lookup_product를 부르라는 금칙을 적는다', 'MAX_ITER를 8에서 20으로 늘린다', 'scratchpad를 더 자주 비운다'], a: 0,
      why: '환각은 규칙 블록에서 막는다. 스펙 질문을 도구로 돌리는 금칙이 있어야 LLM이 답을 만들어 내지 않는다.' },
    { q: '대화가 길어질수록 호출마다 토큰과 비용이 계속 늘어난다. 먼저 의심할 것은?',
      o: ['tool description이 너무 짧다', '모든 원문과 tool 결과를 매번 통째로 보내고 있다', 'few-shot 예시가 하나뿐이다'], a: 1,
      why: '오래된 대화는 요약으로 접고 최근 5건만 원문으로 보내야 한다. tool 결과까지 history에 섞으면 더 빨리 불어난다.' },
    { q: '에이전트가 같은 lookup_product를 계속 부르다 비용이 폭주했다. loop.py에서 이것을 끊는 장치는?',
      o: ['pad.record로 결과를 남기는 줄', 'System Prompt의 출력 형식 블록', 'tool_log를 Counter로 세어 3회면 사람에게 넘기는 검사'], a: 2,
      why: 'MAX_SAME_TOOL 검사가 반복 호출을 일찍 끊는다. MAX_ITER 8은 그래도 못 막을 때의 마지막 차단기다.' },
  ];

  R.page({ title: 'Single Agent의 네 부품', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
