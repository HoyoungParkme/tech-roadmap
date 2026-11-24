/* II-2-2 API 호출 기본 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 요청·응답 JSON 은 페이지 코드의 값(gpt-4o-mini, max_tokens 512, temperature 0.7)과 STEPS 데이터(parsed, tokens, retry, usage)를 그린다.
 * 응답 본문·id·토큰 수는 페이지에 적힌 예시 값이다(실제 API 호출 없음). 비용은 그 값으로 계산했다: 1,240×0.15/1M + 856×0.60/1M = $0.000700. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, clock, lock, server, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // JSON 줄: [text, 강조?] 를 고정폭으로. shown 개수까지
  function json(x, y, lines, o) { o = o || {}; const lh = o.lh || 24, fs = o.fs || 14.5, w = o.w || 460;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    lines.forEach((ln, i) => { const [s, hot] = Array.isArray(ln) ? ln : [ln, false], op = o.show ? o.show(i) : 1; if (op <= 0) return;
      if (hot) el('rect', { x: x + 6, y: y + 9 + i * lh, width: w - 12, height: lh - 2, rx: 4, fill: hot === 'bad' ? BADBG : ACCBG, opacity: op });
      mono(x + 16, y + 9 + i * lh + lh * 0.7, s, { 'font-size': fs, opacity: op * (o.op ?? 1), fill: hot === 'bad' ? BAD : hot ? ACC : INK, 'font-weight': hot ? 700 : 500 }); }); }
  // 두 줄기 시퀀스 다이어그램
  const CX = 110, SX = 850;
  function lanes(o) { o = o || {};
    card(CX, 66, 150, 40, { rx: 8, text: o.client || 'client', fs: 15, mono: true, fw: 700, stroke: o.cHot || INK, color: o.cHot || INK });
    card(SX, 66, 170, 40, { rx: 8, text: 'OpenAI API', fs: 15, fw: 700, stroke: INFO, color: INFO });
    el('line', { x1: CX, y1: 86, x2: CX, y2: 410, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    el('line', { x1: SX, y1: 86, x2: SX, y2: 410, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); }

  // ---------- 1. 기본 호출 ----------
  const REQ = ['{', '  "model": "gpt-4o-mini",', '  "messages": [', '    {"role": "system", "content": "당신은 친절한 요리사입니다."},', '    {"role": "user", "content": "파스타 레시피를 알려줘"}', '  ],', '  "max_tokens": 512,', '  "temperature": 0.7', '}'];
  function s1(t, c) { const { k, u } = c;
    lanes();
    if (k === 0) { pill(CX, 150, 'OPENAI_API_KEY', WARN, pop(u, 0.5), { mono: true, fs: 13.5 }); grow(CX, 134, CX, 90, E(u, 0.8, 1.3), WARN);
      mono(CX - 60, 200, 'client = OpenAI()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      note(330, 240, 'SDK client = 주문대', fade(u, 1.6), { 'font-size': 17, 'font-weight': 800 }); return; }
    const shown = [2, 6, 9, 9][k - 1], prevShown = k > 1 ? [2, 6, 9, 9][k - 2] : 0, n = lerp(prevShown, shown, E(u, 0.2, 1.4));
    const hot = (i) => (k === 1 && i === 1) || (k === 2 && (i === 3 || i === 4)) || (k === 3 && (i === 6 || i === 7));
    if (k <= 3) json(200, 104, REQ.map((s, i) => [s, hot(i)]), { show: (i) => clamp(n - i), w: 560, fs: 13.5, lh: 25 });
    if (k === 3) { grow(CX, 360, SX, 360, E(u, 1.4, 2.2), ACC); mono(480, 350, 'POST /v1/chat/completions', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 4) { grow(CX, 130, SX, 130, 1, ACC); mono(480, 120, 'POST /v1/chat/completions', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle' });
      clock(CX, 230, 34, E(u, 0.2, 1.8), WARN); lock(CX + 60, 230, true, BAD, pop(u, 0.3));
      note(CX + 90, 236, 'create() 줄에서 멈춰 기다린다', fade(u, 0.5));
      el('rect', { x: SX - 12, y: 140, width: 24, height: 170 * E(u, 0.2, 1.8), rx: 4, fill: INFO, opacity: 0.4 });
      grow(SX, 330, CX, 330, E(u, 1.9, 2.5), GOOD); card(480, 360, 260, 34, { rx: 8, text: '응답 한 덩어리 도착', fs: 14.5, stroke: GOOD, color: GOOD, s: pop(u, 2.3) }); } }

  // ---------- 2. 응답 파싱 ----------
  function s2(t, c) { const { k, u } = c, P = c.beat.parsed;
    const v = (x, d) => (P && P[x] !== '—' && P[x] != null ? P[x] : d);
    const L = ['response = {', '  "id": "chatcmpl-…",', '  "model": "' + v('model', 'gpt-4o-mini') + '",', '  "choices": [{', '    "message": {"role": "assistant",', '      "content": "파스타 레시피: 1) 면을 삶고..."},', '    "finish_reason": "stop"', '  }],', '  "usage": {"prompt_tokens": 42,', '    "completion_tokens": 128, "total_tokens": 170}', '}'];
    const HOT = [[], [5], [6], [8], [9], [1, 2]][k];
    json(40, 60, L.map((s, i) => [s, HOT.includes(i)]), { w: 520, fs: 13.5, lh: 30, show: (i) => (k === 0 ? clamp((u - 0.2) * 6 - i * 0.5) : 1) });
    if (k === 0) { note(600, 200, '아직 아무것도 꺼내지 않았다', fade(u, 1.8), { fill: MUT }); return; }
    // 오른쪽: 꺼낸 값 목록 (누적)
    const OUT = [['choices[0].message.content', '"파스타 레시피: 1) 면을…"', 1], ['choices[0].finish_reason', '"' + v('finishReason', 'stop') + '"', 2], ['usage.prompt_tokens', String(v('inputTokens', 42)), 3], ['usage.completion_tokens', String(v('outputTokens', 128)) + '  (total 170)', 4], ['response.model', '"' + v('model', 'gpt-4o-mini') + '"', 5]];
    OUT.forEach(([path, val, kk], i) => { if (k < kk) return; const y = 76 + i * 64, s = k === kk ? E(u, 0.4, 1.2) : 1;
      if (k === kk) dot([[560, 60 + 18 + HOT[0] * 30], [600, y]], seg(u, 0.1, 0.5), ACC, 6);
      mono(600, y, path, { 'font-size': 13.5, fill: MUT, opacity: s }); mono(600, y + 24, val, { 'font-size': 15, 'font-weight': 800, fill: kk === 2 ? GOOD : ACC, opacity: s }); });
    if (k === 2) note(600, 410, '"length"였다면 max_tokens에 걸려 잘린 것', fade(u, 1.6), { fill: WARN, 'font-size': 14 }); }

  // ---------- 3. Streaming ----------
  function s3(t, c) { const { k, u } = c, T = c.beat.tokens || [], PT = (c.prev && c.prev.tokens) || [];
    lanes({ client: 'for chunk' });
    if (k <= 1) { json(200, 110, ['{', '  "model": "gpt-4o-mini",', '  "messages": [{"role": "user", "content": "파스타 레시피"}],', '  "max_tokens": 512', '}'], { w: 560, fs: 13.5, show: (i) => (k === 1 ? clamp((u - 0.2) * 5 - i * 0.6) : 1), op: k === 0 ? fade(u, 0.3) : 1 });
      if (k === 0) note(200, 300, '같은 client, 같은 요청에서 시작한다', fade(u, 1.0), { fill: MUT }); return; }
    if (k === 2) { json(200, 110, ['  "stream": true'], { w: 300, fs: 15, show: () => 1 }); el('rect', { x: 200, y: 110, width: 300, height: 42, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.3) });
      for (let i = 0; i < 6; i++) { const y = 210 + i * 30; grow(SX, y, CX, y, E(u, 0.6 + i * 0.12, 1.2 + i * 0.12), ACC, { sw: 1.6 }); }
      cross(480, 390, 12, pop(u, 1.8)); note(500, 396, '한 덩어리 응답 대신 chunk 여러 개', fade(u, 1.8)); return; }
    // 조각들이 흘러온다
    const nNew = T.length - (k === 3 ? 0 : PT.length);
    T.forEach((ch, i) => { const isNew = i >= T.length - nNew, y = 120 + (i % 9) * 22;
      if (isNew) { const j = i - (T.length - nNew); fly(SX - 30, 120 + j * 6, 380, 150, seg(u, 0.2 + j * 0.15, 0.8 + j * 0.15), JSON.stringify(ch), { mono: true, fill: ACC }); } });
    // 화면 (client 쪽)
    const shownN = T.length - nNew + Math.floor(clamp((u - 0.4) / (0.15 * Math.max(1, nNew)), 0, 1) * nNew);
    card(330, 260, 380, 120, { rx: 10, stroke: INK });
    tx(160, 220, '사용자 화면', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const txt = T.slice(0, k === 3 || k >= 4 ? shownN : T.length).join('');
    tx(160, 262, txt, { 'font-size': 18, 'font-weight': 700 });
    el('rect', { x: 160 + tw(txt, 18) + 4, y: 246, width: 3, height: 22, fill: ACC, opacity: Math.floor(u * 3) % 2 ? 0.2 : 1 });
    if (k === 4) { mono(560, 300, 'chunk.choices[0].delta.content', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(560, 336, '마지막 chunk: None → or ""', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 5) { mono(160, 360, 'full_text = [' + T.map((x) => JSON.stringify(x)).slice(-6).join(', ') + ', …]', { 'font-size': 13.5, opacity: fade(u, 1.2) }); }
    if (k === 6) { mono(160, 360, 'final_answer = "".join(full_text)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
      // 체감 시간 비교 (개념 그림)
      tx(560, 120, '첫 글자가 보이는 때 (개념 그림)', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 1.0) });
      [['동기', 0.95, MUT], ['stream', 0.08, ACC]].forEach(([nm, f, col], i) => { const y = 140 + i * 40; tx(560, y + 18, nm, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1) });
        el('rect', { x: 630, y, width: 200, height: 24, rx: 4, fill: SOFT, opacity: fade(u, 1.1) }); el('rect', { x: 630 + 200 * f * E(u, 1.2, 2.0) - 3, y: y - 4, width: 6, height: 32, rx: 2, fill: col }); }); } }

  // ---------- 4. 재시도 ----------
  const WAIT = [1, 2, 4, 8, 16];
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { ['RateLimitError', 'APITimeoutError', 'APIConnectionError'].forEach((s, i) => pill(240, 110 + i * 56, s, WARN, pop(u, 0.2 + i * 0.25), { mono: true, fs: 14 }));
      clock(620, 170, 44, E(u, 1.0, 2.2), INFO, 'timeout=30.0'); note(560, 260, '30초 안에 안 오면 Timeout', fade(u, 1.6)); return; }
    // 시도 칸 5개
    tx(40, 70, 'for attempt in range(5)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    const st = [b.retryCount >= 1 ? 'rate-limit' : null, b.retryCount >= 2 ? 'timeout' : null, b.retryCount >= 3 ? (b.retryStatus === 'success' ? 'success' : 'wait') : null];
    for (let i = 0; i < 5; i++) { const x = 70 + i * 170, s = k === 1 ? pop(u, 0.2 + i * 0.15) : 1, stt = st[i];
      const col = stt === 'rate-limit' || stt === 'timeout' ? BAD : stt === 'success' ? GOOD : stt === 'wait' ? WARN : GRID;
      card(x + 60, 130, 130, 64, { rx: 10, stroke: col, sw: stt ? 2.6 : 1.6, fill: stt === 'success' ? GOODBG : stt && stt !== 'wait' ? BADBG : PANEL, s });
      mono(x + 60, 122, '#' + (i + 1), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s });
      const lab = stt === 'rate-limit' ? '429' : stt === 'timeout' ? 'Timeout' : stt === 'success' ? '200 OK' : stt === 'wait' ? '대기 중' : '';
      if (lab) mono(x + 60, 146, lab, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: (k === 2 && i === 0) || (k === 3 && i === 1) || (k === 5 && i === 2) ? fade(u, 0.9) : 1 }); }
    // 백오프 대기 막대
    if (k >= 4) { tx(40, 250, 'wait = 2 ** attempt + jitter', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      WAIT.forEach((w, i) => { const x = 70 + i * 170, h = w * 7 * (k === 4 ? E(u, 0.2 + i * 0.15, 1.0 + i * 0.15) : 1), hot = i === 1;
        el('rect', { x: x + 40, y: 390 - h, width: 40, height: h, rx: 3, fill: hot ? WARN : INFO, opacity: hot ? 0.9 : 0.4 });
        mono(x + 60, 384 - h, w + 's', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: hot ? WARN : INK });
        if (i < 4) grow(x + 125, 130, x + 165, 130, 1, MUT); });
      if (k === 4) note(420, 280, '#2 실패 뒤 #3 전에 2초(+jitter)', fade(u, 1.4), { fill: WARN, 'font-size': 14.5 }); }
    if (k === 2) { dot([[130, 200], [130, 260], [800, 260]], seg(u, 0.2, 0.8), ACC, 6); note(260, 300, 'RateLimitError · 429 Too Many Requests', fade(u, 1.0), { fill: BAD }); }
    if (k === 3) { // 예외 거르기
      [['RateLimit · Timeout · Connection', '재시도', GOOD, 260], ['BadRequest · Authentication', '즉시 raise', BAD, 650]].forEach(([a, d, col, x], i) => { const s = pop(u, 0.4 + i * 0.4);
        card(x, 290, 320, 70, { rx: 10, stroke: col, s }); mono(x, 284, a, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: s }); tx(x, 306, d, { 'font-size': 14.5, fill: col, 'text-anchor': 'middle', 'font-weight': 800, opacity: s }); });
      note(40, 380, '마지막 시도(attempt == 4)면 그대로 raise · 무한 루프 없음', fade(u, 1.6), { 'font-size': 14.5 }); }
    if (k === 5) {
      mono(40, 206, 'response = call_with_retry([...])', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      note(40, 234, '호출하는 쪽은 한 줄, 재시도는 함수 안에 숨어 있다', fade(u, 1.6), { 'font-size': 14.5 }); } }

  // ---------- 5. 비용 ----------
  const PRICE = [['gpt-4o', 2.5, 10], ['gpt-4o-mini', 0.15, 0.6], ['o1-mini', 1.1, 4.4]];
  function s5(t, c) { const { k, u } = c, us = c.beat.usage, pu = (c.prev && c.prev.usage) || us;
    if (k === 0) { mono(60, 110, 'from datetime import date', { 'font-size': 15, opacity: fade(u, 0.2) }); mono(60, 140, 'client = OpenAI()', { 'font-size': 15, opacity: fade(u, 0.5) });
      card(700, 220, 300, 240, { rx: 8, stroke: GRID, dash: '6 5', s: pop(u, 0.8) }); note(700, 226, '영수증 없음', fade(u, 1.2), { fill: MUT, 'text-anchor': 'middle' }); return; }
    if (k <= 2) { tx(60, 76, '$ / 1M 토큰', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      PRICE.forEach(([m, i_, o_], r) => { const y = 110 + r * 90, sel = us && us.model === m, s = k === 1 ? E(u, 0.2 + r * 0.2, 1.0 + r * 0.2) : 1;
        if (sel) el('rect', { x: 40, y: y - 14, width: 880, height: 74, rx: 10, fill: ACCBG, opacity: k === 2 ? fade(u, 0.4) : 1 });
        mono(60, y + 24, m, { 'font-size': 16, 'font-weight': 800, fill: sel ? ACC : INK });
        [['입력', i_, INFO], ['출력', o_, WARN]].forEach(([nm, v, col], j) => { const yy = y + j * 28;
          tx(240, yy + 14, nm, { 'font-size': 13.5, fill: MUT }); el('rect', { x: 290, y: yy, width: Math.max(2, 50 * v * s), height: 20, rx: 3, fill: col, opacity: 0.8 });
          mono(300 + 50 * v * s, yy + 15, '$' + v.toFixed(2), { 'font-size': 14, 'font-weight': 700 }); }); });
      if (k === 1) note(640, 400, '출력이 입력보다 4배 비싸다', fade(u, 1.8), { fill: WARN }); return; }
    // 영수증
    const L = [['gpt-4o-mini', '', ''], ['입력  1,240 × $0.15 / 1M', '$0.000186', 0.3], ['출력    856 × $0.60 / 1M', '$0.000514', 0.7], ['이번 호출', '$0.000700', 1.2]];
    el('rect', { x: 60, y: 70, width: 470, height: 196, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 1.8 });
    L.forEach(([a, b2, d], i) => { const y = 104 + i * 40, op = k === 3 ? fade(u, d || 0) : 1;
      if (i === 3) el('line', { x1: 80, y1: y - 22, x2: 510, y2: y - 22, stroke: INK, 'stroke-dasharray': '4 4', opacity: op });
      mono(80, y, a, { 'font-size': 15, 'font-weight': i === 3 || i === 0 ? 800 : 500, opacity: op, fill: i === 0 ? ACC : INK }); mono(510, y, b2, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: op, fill: i === 3 ? ACC : INK }); });
    if (k >= 4) { // 오늘 누적 그릇
      const tot = tween(k === 5 ? pu.totalCost : 0, us.totalCost, u), H = 220, lvl = H * tot / 0.05;
      el('rect', { x: 680, y: 90, width: 160, height: H, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      el('rect', { x: 682, y: 90 + H - lvl, width: 156, height: lvl, rx: 10, fill: k === 5 ? ACC : INFO, opacity: 0.7 });
      mono(760, 82, 'daily_cost[오늘]', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 });
      mono(760, 340, '$' + tot.toFixed(4), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 5 ? ACC : INK });
      if (k === 5) { fly(510, 224, 760, 120, seg(u, 0.1, 1.0), '+$0.0007', { mono: true });
        mono(60, 320, '이번 호출: $0.000700 | 오늘 누적: $0.0428', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
        note(60, 360, '이 값이 user별 quota와 알람의 기준이 된다', fade(u, 2.0), { 'font-size': 14.5 }); }
      else note(60, 320, '앞선 호출들이 이미 쌓여 있다', fade(u, 1.0), { fill: MUT }); } }

  const quiz = [
    { q: '동기 create() 호출에서 응답이 오기 전 코드는 어떻게 되나?',
      o: ['다음 줄이 먼저 실행된다', 'create() 줄에서 멈춰 응답을 기다린다', '빈 응답을 받고 넘어간다'], a: 1,
      why: '동기 호출은 응답 전체가 만들어져 한 덩어리로 올 때까지 block 된다. 이 기다림을 줄이는 게 다음 장면의 stream이다.' },
    { q: 'finish_reason이 "length"라면 무슨 뜻인가?',
      o: ['max_tokens에 걸려 답이 잘렸다', '모델이 정상 종료했다', '안전 필터에 걸렸다'], a: 0,
      why: '"stop"이 정상 종료이고 "length"는 상한에 닿아 잘린 것이다. 본문만 보면 잘린 줄 모르므로 꼭 확인한다.' },
    { q: 'stream=True에서 이번 조각의 텍스트는 어디에 있나?',
      o: ['response.choices[0].message.content', 'chunk.usage.total_tokens', 'chunk.choices[0].delta.content'], a: 2,
      why: '스트림의 chunk는 message 대신 delta를 담는다. 마지막 chunk는 None일 수 있어 or ""로 막는다.' },
    { q: '재시도 코드가 except로 잡지 않고 바로 실패시키는 예외는 무엇인가?',
      o: ['RateLimitError', 'AuthenticationError', 'APITimeoutError'], a: 1,
      why: '키가 틀린 요청은 몇 번을 다시 보내도 같다. 재시도는 429·Timeout·Connection 같은 일시 실패에만 건다.' },
    { q: 'gpt-4o-mini로 입력 1,240, 출력 856 토큰을 쓰면 비용은 얼마인가?',
      o: ['$0.000700', '$0.002096', '$0.0428'], a: 0,
      why: '1,240 × 0.15/1M + 856 × 0.60/1M = 0.000186 + 0.000514다. $0.0428은 그날 누적액이다.' },
  ];

  const summary = [
    'API 호출은 model과 messages와 max_tokens를 담은 요청 하나를 보내는 일이고, 동기 호출은 답이 올 때까지 멈춘다.',
    '응답에서 본문은 choices[0].message.content이고 finish_reason과 usage도 함께 확인한다.',
    'stream=True로 받으면 delta 조각이 생기는 대로 와서 첫 글자를 빨리 보여 줄 수 있다.',
    '일시 실패는 1초, 2초, 4초로 늘려 가며 재시도하고, 비용은 usage에 단가를 곱해 매일 쌓아 본다.',
  ];
  const review = [
    { q: '긴 보고서를 요청했더니 문장이 중간에 끊겨 왔다. 먼저 볼 값은?',
      o: ['finish_reason이 "length"인지', 'response.id', 'temperature'], a: 0,
      why: 'max_tokens에 닿으면 에러 없이 잘린 본문이 온다. "length"면 상한을 늘리거나 이어서 다시 호출한다.' },
    { q: '사용자가 많은 시간대에 429가 몰려 나고, 재시도하자 더 심해졌다. 무엇이 빠졌을 가능성이 큰가?',
      o: ['stream=True', '지수 백오프와 jitter', 'finish_reason 확인'], a: 1,
      why: '모두 같은 간격으로 바로 다시 보내면 요청이 한꺼번에 몰린다. 대기 시간을 늘리고 jitter로 흩어야 폭주가 잦아든다.' },
    { q: 'stream으로 바꾼 뒤 비용 집계가 0으로 찍힌다. 원인은?',
      o: ['스트림은 요금이 없어서', 'delta가 비어 있어서', 'stream 모드는 기본적으로 usage를 보내지 않아서'], a: 2,
      why: '스트림에서는 stream_options={"include_usage": True}를 줘야 마지막에 usage가 온다. 그래야 단가 계산이 된다.' },
  ];

  R.page({ title: 'API 요청과 응답 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
