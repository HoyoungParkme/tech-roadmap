/* IV-2-2 Batch / Streaming / 압축 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   숫자 출처: 페이지 코드 주석과 단가표로 다시 계산한 값(1000건 × 800/200 × gpt-4 = $36, output 400 토큰 × 1만 호출 = $240/일).
   LLM 응답 문장, 압축 결과 문장, 토큰별 남김/버림 표시, 회사 X 수치는 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    server, browser, cross, check, clock, axes, line, zone, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ───────── 1. Batch API ─────────
  const FIELDS = [['"custom_id"', '"eval-0000"', ACC], ['"method"', '"POST"', INK], ['"url"', '"/v1/chat/completions"', INK]];
  function fileIcon(x, y, w, h, name, o) { o = o || {}; const s = o.s ?? 1; const g = G(x, y, s, clamp(s));
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 18} L${w / 2},${-h / 2 + 18} V${h / 2} H${-w / 2} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    if (name) mono(0, h / 2 + 20, name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }, g); return g; }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(400, 170, 560, 200, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.1) }); mono(140, 100, '{', { 'font-size': 18, 'font-weight': 700 });
      FIELDS.forEach(([a, b, col], i) => { const op = fade(u, 0.4 + i * 0.4); mono(170, 140 + i * 36, a + ':', { 'font-size': 17, fill: INFO, 'font-weight': 700, opacity: op }); mono(340, 140 + i * 36, b, { 'font-size': 17, fill: col, 'font-weight': i ? 400 : 800, opacity: op }); });
      mono(170, 248, '"body": { … }', { 'font-size': 17, fill: MUT, opacity: fade(u, 1.6) }); mono(140, 262, '}', { 'font-size': 18, 'font-weight': 700 });
      card(820, 160, 210, 90, { rx: 12, stroke: ACC, sw: 2, text: 'custom_id 로\n나중에 답을 짝짓는다', fs: 15, color: ACC, s: pop(u, 2.0) }); return; }
    if (k === 1) { const f = E(u, 0.2, 1.0);
      card(300, 120, 480, 130, { rx: 12, stroke: GRID, sw: 1.5, op: 1 - f * 0.6 });
      ['"body": {', '  "model": "gpt-4",', '  "messages": [{"role": "user", …}]', '}'].forEach((s, i) => mono(80, 82 + i * 26, s, { 'font-size': 15, opacity: 1 - f * 0.6 }));
      fileIcon(790, 210, 300, 280, 'batch_input.jsonl', { s: pop(u, 0.8) });
      for (let i = 0; i < 7; i++) { const op = fade(u, 1.0 + i * 0.15); mono(655, 104 + i * 30, i < 6 ? `{"custom_id": "eval-000${i}", …}` : '…  1000줄', { 'font-size': 13.5, fill: i < 6 ? INK : MUT, opacity: op }); }
      sub(300, 230, '평소 chat.completions 인자를 body에 그대로', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(300, 256, '한 요청 = 한 줄 JSON', fade(u, 1.6)); return; }
    if (k === 2) { fileIcon(170, 190, 120, 150, 'batch_input.jsonl', {}); card(700, 190, 240, 120, { rx: 14, stroke: INK, sw: 2, text: 'OpenAI Files', fs: 18, fw: 800 });
      fly(230, 150, 580, 150, seg(u, 0.3, 1.2), 'purpose="batch"', { mono: true, fill: INK }); dot([[580, 230], [230, 230]], seg(u, 1.4, 2.2), ACC, 8);
      pill(400, 270, 'file.id 발급', ACC, pop(u, 2.0), { mono: true, fs: 15 }); return; }
    if (k === 3) { R.snippet(70, 70, ['batch = client.batches.create(', '    input_file_id=file.id,', '    endpoint="/v1/chat/completions",', '    completion_window="24h",', ')'], { fs: 16 });
      const f = E(u, 1.0, 1.8); card(760, 130, 220, 100, { rx: 14, stroke: BAD, sw: 2.5, s: pop(u, 0.5) });
      mono(760, 120, '$36.00', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: f > 0.5 ? MUT : BAD, 'text-decoration': f > 0.5 ? 'line-through' : null });
      mono(760, 160, '$18.00', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: f });
      clock(760, 300, 36, 0.75 * E(u, 1.2, 2.4), WARN, '최대 24시간'); sub(380, 290, '기다림을 내주고 단가 절반을 받는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { ['validating', 'in_progress', 'completed'].forEach((s, i) => { const on = u > 0.4 + i * 0.7; pill(200 + i * 260, 160, s, on ? (i === 2 ? GOOD : INFO) : OFF, on ? 1 : 0.9, { mono: true, fs: 16, fill: on ? (i === 2 ? GOODBG : INFOBG) : PANEL });
        if (i) grow(200 + (i - 1) * 260 + 80, 160, 200 + i * 260 - 80, 160, seg(u, 0.4 + i * 0.7 - 0.3, 0.4 + i * 0.7), MUT); });
      el('path', { d: 'M200,200 C200,280 720,280 720,200', fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      dot([[200, 200], [330, 262], [590, 262], [720, 200]], (u * 0.8) % 1, INK, 6);
      mono(460, 300, 'retrieve(batch.id) · 60초마다', { 'font-size': 16, 'text-anchor': 'middle', fill: MUT }); sub(460, 360, '비동기라 완료를 기다리는 코드가 따로 필요하다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { const IN = ['eval-0000', 'eval-0001', 'eval-0002'], OUT = ['eval-0002', 'eval-0000', 'eval-0001'];
      tx(120, 70, '입력 (질문)', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(600, 70, '출력 jsonl (순서가 다를 수 있다)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      IN.forEach((id, i) => card(230, 120 + i * 80, 220, 50, { rx: 10, text: id, mono: true, fs: 15 }));
      OUT.forEach((id, i) => card(710, 120 + i * 80, 220, 50, { rx: 10, text: id, mono: true, fs: 15, stroke: GOOD, s: pop(u, 0.2 + i * 0.2) }));
      OUT.forEach((id, i) => { const j = IN.indexOf(id); grow(600, 120 + i * 80, 340, 120 + j * 80, seg(u, 0.9 + i * 0.3, 1.3 + i * 0.3), ACC, { plain: true, dash: '5 4' }); });
      sub(480, 380, '순서가 아니라 custom_id로 짝짓는다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k6
    tx(120, 70, '1000건 × (input 800 + output 200) × gpt-4', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    [['실시간', 36, BAD], ['Batch', 18, GOOD]].forEach(([n, v, col], i) => { const y = 100 + i * 70, f = E(u, 0.2 + i * 0.4, 0.9 + i * 0.4);
      tx(210, y + 27, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: 230, y, width: 15 * v * f, height: 42, rx: 6, fill: col, opacity: 0.85 }); mono(240 + 15 * v * f, y + 28, '$' + v.toFixed(2), { 'font-size': 17, 'font-weight': 800, opacity: f }); });
    ['실시간 질의 불가', '24시간 보장은 아님', '일부 모델만 지원'].forEach((s, i) => pill(220 + i * 260, 320, s, WARN, pop(u, 1.4 + i * 0.2), { fs: 14.5 })); }

  // ───────── 2. SSE Streaming ─────────
  const TOK = ['환불은', ' 구매', ' 후', ' 7일', ' 이내', ',', ' 미개봉', ' 상품만', ' 가능합니다.'];   // 응답 예시
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { server(200, 190, 'FastAPI', { lamp: GOOD }); browser(720, 190, 300, 180, '브라우저', {});
      ['from fastapi.responses import', '    StreamingResponse'].forEach((s, i) => mono(110, 300 + i * 24, s, { 'font-size': 15, fill: INFO, opacity: fade(u, 0.5 + i * 0.3) }));
      sub(480, 390, '라이브러리 추가 없이 프레임워크 기본 기능', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const f = E(u, 0.6, 1.6); const total = 640; let x = 160;
      mono(160, 100, f < 0.5 ? 'stream=False: 완성본 한 덩어리' : 'stream=True: chunk의 흐름', { 'font-size': 17, 'font-weight': 700, fill: f < 0.5 ? MUT : ACC });
      TOK.forEach((s, i) => { const w = tw(s, 16) + 18; el('rect', { x: x + i * 14 * f, y: 150, width: w, height: 44, rx: f > 0.5 ? 8 : 0, fill: f > 0.5 ? ACCBG : SOFT, stroke: f > 0.5 ? ACC : 'none', 'stroke-width': 1.6 });
        tx(x + i * 14 * f + w / 2, 178, s.trim(), { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 600 }); x += w; });
      void total; sub(480, 270, '인자 하나로 응답 모양이 바뀐다 (문장은 예시)', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 2 || k === 3) { server(130, 200, 'event_stream()', { lamp: GOOD }); browser(740, 200, 360, 220, 'EventSource', {});
      const n = k === 2 ? lerp(0, TOK.length + 1, E(u, 0.2, 2.4)) : TOK.length + 1;
      for (let i = 0; i < TOK.length + 1; i++) { const st = 0.2 + i * 0.24; if (k === 2) fly(200, 200, 570, 200, seg(u, st, st + 0.5), i < TOK.length ? `data: ${TOK[i].trim()}` : 'data: [DONE]', { mono: true, fill: i < TOK.length ? ACC : INK }); }
      if (k === 2) mono(380, 150, 'yield f"data: {token}\\n\\n"', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT });
      const shown = k === 3 ? lerp(0, TOK.length, E(u, 0.2, 2.2)) : Math.min(n, TOK.length) - 0.0;
      const txt = TOK.slice(0, Math.floor(shown)).join('');
      const lines = [txt.slice(0, 14), txt.slice(14)]; lines.forEach((s, i) => tx(590, 170 + i * 30, s, { 'font-size': 18, 'font-weight': 600 }));
      if (k === 3) { mono(380, 330, 'setAnswer(prev => prev + e.data)', { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.4) }); sub(740, 360, '타이핑 효과 = 토큰을 이어 붙인 결과', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
      return; }
    if (k === 4) { const X = (s) => 220 + s * 130; el('line', { x1: X(0), y1: 300, x2: X(5.2), y2: 300, stroke: MUT, 'stroke-width': 2 });
      [0, 1, 2, 3, 4, 5].forEach((s) => mono(X(s), 322, s + '초', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      const now = lerp(0, 5.2, E(u, 0.1, 2.6)); el('line', { x1: X(now), y1: 80, x2: X(now), y2: 300, stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' });
      tx(200, 140, 'non-streaming', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(200, 230, 'streaming', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: X(0), y: 118, width: X(Math.min(now, 5)) - X(0), height: 34, rx: 5, fill: SOFT }); if (now > 5) el('rect', { x: X(5), y: 118, width: 14, height: 34, rx: 3, fill: BAD });
      if (now < 5) tx(X(Math.min(now, 5)) + 8, 140, '…', { 'font-size': 18, fill: MUT });
      if (now > 0.2) el('rect', { x: X(0.2), y: 208, width: X(now) - X(0.2), height: 34, rx: 5, fill: ACC, opacity: 0.8 });
      mono(X(0.2), 270, 'TTFT 200ms', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) }); mono(X(5), 100, '5초 뒤 한 번에', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.4) });
      sub(560, 380, '체감 지연은 첫 반응까지의 시간이다. 중간 cancel 시 남은 토큰 비용도 아낀다', fade(u, 2.5), { 'font-size': 14 }); return; }
    if (k === 5) { [['non-streaming', 'N 토큰'], ['streaming', 'N 토큰']].forEach(([a, b], i) => { card(200, 100 + i * 70, 300, 50, { rx: 10, text: `${a}: ${b}`, mono: true, fs: 15, s: pop(u, 0.1 + i * 0.2) }); });
      mono(400, 140, '= 요금 동일', { 'font-size': 18, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.6) });
      card(700, 130, 180, 60, { rx: 12, text: 'nginx', mono: true, fs: 18, stroke: WARN, color: WARN, s: pop(u, 0.9) });
      for (let i = 0; i < 5; i++) { const f = E(u, 1.0 + i * 0.15, 1.3 + i * 0.15); el('rect', { x: lerp(560, 640 + i * 18, f), y: 188, width: 14, height: 14, rx: 3, fill: ACC, opacity: f }); }
      tx(700, 230, '버퍼링을 끄지 않으면 모아서 한 번에 보낸다', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      ['모바일 연결 끊김', 'tool call 처리 복잡', '로그를 토큰 단위로 남기기 까다롭다'].forEach((s, i) => pill(240 + i * 250, 330, s, WARN, pop(u, 1.8 + i * 0.15), { fs: 14 })); return; }
    // k6
    [['사용자 대화형 챗봇', 'streaming 필수', GOOD, true], ['B2B API 응답', 'non-streaming도 OK', MUT, false], ['백그라운드 작업', 'non-streaming', MUT, false]].forEach(([a, b, col, on], i) => { const y = 100 + i * 90, s = pop(u, 0.2 + i * 0.4);
      card(480, y, 600, 66, { rx: 12, stroke: on ? GOOD : GRID, sw: on ? 2.5 : 1.5, s }); tx(200, y + 6, a, { 'font-size': 17, 'font-weight': 700, opacity: clamp(s) }); mono(760, y + 6, b, { 'font-size': 16, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: clamp(s) }); }); }

  // ───────── 3. LLMLingua 압축 ─────────
  const SENT = [['구매', 0], ['후', 0], ['7일', 1], ['이내에', 1], ['환불', 1], ['신청을', 0], ['해야', 0], ['합니다.', 0]];
  const LINES = ['환불 정책은 다음과 같습니다.', '구매 후 7일 이내에 환불 신청을 해야 합니다.', '환불은 미개봉 상품에 한해서만 가능합니다.', '전자제품 카테고리는 환불이 불가능합니다.', '환불 신청은 마이페이지에서 가능합니다.', '배송비는 구매자가 부담합니다.', '환불은 영업일 기준 3~5일 소요됩니다.'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(260, 200, 220, 120, { rx: 14, stroke: GOOD, sw: 2.5, text: 'llmlingua-2\nBERT-base', mono: true, fs: 16, color: GOOD, s: pop(u, 0.2) });
      card(650, 200, 380, 240, { rx: 18, stroke: OFF, sw: 2, text: 'GPT 급 LLM', fs: 20, color: OFF, dash: '8 6', s: pop(u, 0.6) });
      sub(260, 290, '토큰마다 남길지 버릴지만 고른다', fade(u, 1.2), { 'font-weight': 700, fill: INK }); sub(480, 380, '압축에 큰 모델을 쓰면 아낀 돈을 다시 쓴다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { const n = Math.floor(lerp(1, 6, E(u, 0.2, 1.4)));
      for (let r = 0; r < n; r++) { card(380 + r * 10, 190 - r * 10, 600, 250, { rx: 10, stroke: GRID, sw: 1.4 }); }
      LINES.forEach((s, i) => tx(100 + (n - 1) * 10, 92 - (n - 1) * 10 + i * 30, s, { 'font-size': 15, opacity: fade(u, 0.1 + i * 0.1) }));
      mono(800, 360, '× 반복 ≈ 5000 tokens', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      sub(380, 360, '호출할 때마다 전부 과금된다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { let x = 90; tx(90, 80, '토큰별 남김 / 버림 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      SENT.forEach(([w, keep], i) => { const ww = tw(w, 18) + 22, f = E(u, 0.4 + i * 0.15, 0.8 + i * 0.15);
        el('rect', { x, y: 110, width: ww, height: 44, rx: 8, fill: keep ? ACCBG : SOFT, stroke: keep ? ACC : GRID, 'stroke-width': 1.8, opacity: keep ? 1 : 1 - 0.6 * f });
        tx(x + ww / 2, 139, w, { 'font-size': 18, 'text-anchor': 'middle', 'font-weight': keep ? 800 : 400, fill: keep ? ACC : MUT, 'text-decoration': !keep && f > 0.5 ? 'line-through' : null, opacity: keep ? 1 : 1 - 0.5 * f }); x += ww + 8; });
      R.snippet(90, 210, ['compress_prompt(long_context,', '    instruction="환불 정책 핵심만 남기고 압축",', '    target_token=1500, rate=0.3)'], { fs: 15, op: fade(u, 1.6) });
      return; }
    if (k === 3) { const f = E(u, 0.2, 1.4); tx(90, 80, '토큰 수', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('rect', { x: 90, y: 100, width: 700, height: 44, rx: 6, fill: OFF }); el('rect', { x: 90, y: 100, width: lerp(700, 700 * 1450 / 5000, f), height: 44, rx: 6, fill: ACC, opacity: 0.85 });
      mono(lerp(800, 90 + 700 * 0.29 + 10, f), 129, Math.round(lerp(5000, 1450, f)).toLocaleString('en-US'), { 'font-size': 18, 'font-weight': 800 });
      mono(800, 129, '−71%', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      card(440, 260, 700, 90, { rx: 12, stroke: ACC, sw: 2, fill: ACCBG, text: '"환불 7일 이내, 미개봉만, 전자제품 불가,\n마이페이지 신청, 배송비 구매자, 3~5일 소요"', fs: 16, s: pop(u, 1.6) });
      sub(440, 330, '압축 결과 예시: 문장은 사라지고 조건은 남았다', fade(u, 2.0)); return; }
    if (k === 4) { [['input 비용', '$0.15', '$0.045', '−70%', GOOD], ['latency', '2000ms', '1200ms', '−40%', GOOD], ['faithfulness', '0.92', '0.89', '−0.03', BAD]].forEach(([n, a, b, d, col], i) => { const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
        card(cx, 190, 270, 170, { rx: 14, stroke: col, sw: 2.2, s }); tx(cx, 132, n, { 'font-size': 16, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: clamp(s) });
        mono(cx, 178, a, { 'font-size': 18, fill: MUT, 'text-anchor': 'middle', 'text-decoration': 'line-through', opacity: clamp(s) }); mono(cx, 216, b, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(s) });
        mono(cx, 252, d, { 'font-size': 18, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.4) }); });
      sub(480, 340, '품질 조금을 내주고 비용·속도를 크게 얻는 거래', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    [['긴 대화 이력', '많은 RAG chunk', '긴 system prompt'], ['짧은 prompt (이미 효율적)', '정확성이 중요한 의료 · 법률']].forEach((list, j) => { tx(120 + j * 420, 80, j ? '쓰지 않는 곳' : '쓰는 곳', { 'font-size': 17, 'font-weight': 800, fill: j ? BAD : GOOD });
      list.forEach((s, i) => { const y = 120 + i * 60, s2 = pop(u, 0.2 + (j * 3 + i) * 0.25); (j ? cross : check)(140 + j * 420, y, 10, s2); tx(165 + j * 420, y + 6, s, { 'font-size': 16, 'font-weight': 600, opacity: clamp(s2) }); }); }); }

  // ───────── 4. max_tokens ─────────
  const MT = [['greeting', 50], ['factual_qa', 200], ['policy', 300], ['analysis', 1000], ['creative', 2000]];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const f = E(u, 1.2, 2.0), x0 = 160, sc = 600 / 0.048;
      tx(x0, 70, '호출 1회: input 800 × $30 + output 400 × $60 (per 1M)', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      el('rect', { x: x0, y: 100, width: 0.024 * sc, height: 50, rx: 6, fill: ACC, opacity: 0.85 }); el('rect', { x: x0 + 0.024 * sc, y: 100, width: 0.024 * sc * (1 - 0.5 * f), height: 50, rx: 6, fill: BAD, opacity: 0.85 });
      mono(x0 + 0.012 * sc, 131, 'in $0.024', { 'font-size': 16, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); mono(x0 + 0.024 * sc + 0.012 * sc * (1 - 0.5 * f), 131, 'out $' + (0.024 * (1 - 0.5 * f)).toFixed(3), { 'font-size': 16, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
      if (f > 0) { el('rect', { x: x0 + 0.024 * sc * (2 - 0.5 * f), y: 100, width: 0.024 * sc * 0.5 * f, height: 50, rx: 6, fill: 'none', stroke: BAD, 'stroke-dasharray': '5 4', 'stroke-width': 2 }); }
      sub(480, 200, '토큰은 2 : 1 인데 돈은 1 : 1', fade(u, 0.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      banner(480, 290, 'output 400 → 200이면 총액 $0.048 → $0.036 (−25%)', pop(u, 2.0)); return; }
    if (k === 1) { tx(220, 60, 'MAX_TOKENS (output 상한)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      MT.forEach(([n, v], i) => { const y = 80 + i * 56, f = E(u, 0.2 + i * 0.25, 0.9 + i * 0.25); mono(200, y + 22, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' });
        el('rect', { x: 220, y, width: Math.max(3, 0.32 * v * f), height: 32, rx: 5, fill: v <= 300 ? GOOD : WARN, opacity: 0.85 }); mono(230 + 0.32 * v * f, y + 22, String(v), { 'font-size': 16, 'font-weight': 800, opacity: f }); });
      sub(800, 380, '답의 성격별로 필요한 만큼만', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { const X = (v) => 140 + v * 3; el('line', { x1: X(200), y1: 90, x2: X(200), y2: 230, stroke: BAD, 'stroke-width': 3 }); mono(X(200), 82, 'max_tokens=200', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      const n = Math.min(200, lerp(0, 260, E(u, 0.2, 2.0))); for (let i = 0; i < n / 10; i++) el('rect', { x: X(i * 10) + 1, y: 140, width: 28, height: 40, rx: 4, fill: ACC, opacity: 0.8 });
      tx(140, 120, 'factual_qa 응답 토큰', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      R.snippet(140, 260, ['max_tokens=MAX_TOKENS[category],'], { fs: 17, op: fade(u, 0.5) }); sub(700, 330, '추가된 코드는 이 한 줄', fade(u, 1.2), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { tx(160, 70, '일 10,000 호출 · output 비용 (gpt-4, $60 / 1M)', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      [['평균 400 토큰', 240, BAD], ['평균 200 토큰', 120, GOOD]].forEach(([n, v, col], i) => { const y = 100 + i * 80, f = E(u, 0.2 + i * 0.5, 0.9 + i * 0.5);
        tx(300, y + 28, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: 320, y, width: 2 * v * f, height: 44, rx: 6, fill: col, opacity: 0.85 }); mono(330 + 2 * v * f, y + 29, '$' + v + ' / 일', { 'font-size': 18, 'font-weight': 800, opacity: f }); });
      sub(480, 320, '10,000 × 400 × $60 / 1M = $240', fade(u, 1.6), { class: 'mono', 'font-size': 15 }); sub(480, 350, 'output 길이를 반으로 줄이면 output 비용도 반', fade(u, 2.0), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    if (k === 4) { card(480, 80, 460, 50, { rx: 10, text: 'system: "답변은 200자 이내"', fs: 16, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      [['상한만 건 답', 0.95, BAD, '… 잘림'], ['길이를 지시한 답', 0.6, GOOD, '끝까지 말함']].forEach(([n, f0, col, end], i) => { const y = 170 + i * 80, f = E(u, 0.6 + i * 0.5, 1.4 + i * 0.5);
        tx(250, y + 26, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: 270, y, width: 500 * f0 * f, height: 40, rx: 6, fill: col, opacity: 0.75 });
        tx(280 + 500 * f0 * f, y + 26, end, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.4 + i * 0.5) }); });
      el('line', { x1: 270 + 500 * 0.95, y1: 160, x2: 270 + 500 * 0.95, y2: 220, stroke: BAD, 'stroke-width': 2.5 });
      sub(480, 370, '처음부터 짧게 쓰게 하면 잘리지 않고, 속도와 모바일 화면도 덕을 본다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 5) { [['stop', '"환불은 7일 이내 미개봉만 가능합니다."', GOOD], ['length', '"환불은 구매 후 7일 이내에 미개봉 상품에 한해…"', BAD]].forEach(([r, s, col], i) => { const y = 110 + i * 100, sc = pop(u, 0.2 + i * 0.5);
        card(400, y, 560, 60, { rx: 12, text: s, fs: 15, stroke: col, s: sc }); mono(760, y + 6, `finish_reason="${r}"`, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: clamp(sc) }); });
      pill(480, 340, 'metrics.truncated +1', BAD, pop(u, 1.6), { mono: true, fs: 15 }); sub(480, 390, '응답 문장은 예시', fade(u, 1.8)); return; }
    // k6: 잘림 비율
    const X0 = 160, W = 640, X = (p) => X0 + W * p / 20;
    [[0, 5, GOOD, 'OK'], [5, 10, WARN, '지켜본다'], [10, 20, BAD, '상한 재조정']].forEach(([a, b, col, n], i) => { el('rect', { x: X(a), y: 150, width: X(b) - X(a), height: 40, fill: col, opacity: 0.3 + 0.3 * fade(u, 0.2 + i * 0.3) }); tx((X(a) + X(b)) / 2, 250, n, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.3) }); });
    [0, 5, 10, 20].forEach((p) => mono(X(p), 214, p + '%', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }));
    const v = lerp(2, 12, E(u, 0.8, 2.2)); el('path', { d: `M${X(v)},146 l-8,-14 h16 z`, fill: INK });
    mono(X(v), 120, 'truncated_ratio ' + v.toFixed(0) + '% (예시)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
    sub(480, 330, '10%를 넘으면 max_tokens를 올리거나 프롬프트를 줄인다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ───────── 5. 트레이드오프 (tradeoff.md) ─────────
  const MX = [['Batch API', ['−50%', GOOD], ['+24h', BAD], ['-', MUT]], ['SSE Streaming', ['0%', MUT], ['TTFT ↓', GOOD], ['좋아짐', GOOD]], ['LLMLingua', ['−70%', GOOD], ['−40%', GOOD], ['quality ↓', BAD]], ['max_tokens', ['−25%', GOOD], ['−20%', GOOD], ['잘림 위험', BAD]]];
  function combo(title, items, u, o) { o = o || {}; tx(80, 70, title, { 'font-size': 18, 'font-weight': 800 });
    items.forEach(([s, col, x], i) => { const y = 120 + i * 62, sc = pop(u, 0.2 + i * 0.3); card(330, y, 440, 50, { rx: 10, text: s, fs: 16, stroke: col, color: x ? MUT : INK, sw: 2, s: sc, dash: x ? '5 5' : null }); if (x) cross(570, y, 10, sc); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { ['비용', 'Latency', 'UX'].forEach((h, j) => tx(420 + j * 180, 70, h, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT }));
      MX.forEach(([n, ...cs], i) => { const y = 100 + i * 66; tx(300, y + 30, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' });
        cs.forEach(([v, col], j) => { const s = pop(u, 0.2 + i * 0.25 + j * 0.08); card(420 + j * 180, y + 24, 160, 50, { rx: 8, text: v, mono: true, fs: 16, stroke: col, color: col, sw: 2, s }); }); });
      sub(480, 390, '세 칸을 동시에 좋게 만드는 기법은 없다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { combo('실시간 챗봇', [['SSE Streaming (필수)', GOOD], ['카테고리별 max_tokens', GOOD], ['캐싱 · 라우팅 (공통)', INFO], ['Batch API', OFF, true]], u); return; }
    if (k === 2) { combo('대량 eval 실행', [['Batch API (가장 큰 절감)', GOOD], ['짧은 max_tokens', GOOD], ['LLMLingua 입력 압축', GOOD], ['Streaming', OFF, true]], u); return; }
    if (k === 3) { [['긴 문서 분석', ['LLMLingua 압축', 'max_tokens 1500', 'non-streaming']], ['단순 FAQ', ['캐싱 (1순위)', 'max_tokens 200', 'gpt-4o-mini 라우팅']]].forEach(([n, list], j) => { const cx = 250 + j * 460;
        tx(cx, 70, n, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' }); list.forEach((s, i) => card(cx, 130 + i * 66, 340, 50, { rx: 10, text: s, fs: 16, stroke: i ? GRID : ACC, color: i ? INK : ACC, sw: 2, s: pop(u, 0.2 + j * 0.6 + i * 0.2) })); });
      sub(480, 370, '질문의 성격이 기법을 고른다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { tx(80, 60, '회사 X, 도입 6개월 뒤 (문서의 예시)', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      [['월 비용', '$30K', '$9K', '−70%'], ['p95 latency', '4초', '1.5초', ''], ['NPS', '35', '65', '']].forEach(([n, a, b, d], i) => { const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
        card(cx, 200, 260, 170, { rx: 14, stroke: GOOD, sw: 2, s }); tx(cx, 145, n, { 'font-size': 16, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: clamp(s) });
        mono(cx, 192, a, { 'font-size': 20, fill: MUT, 'text-anchor': 'middle', 'text-decoration': 'line-through', opacity: clamp(s) }); mono(cx, 236, b, { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: clamp(s) });
        if (d) mono(cx, 268, d, { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: clamp(s) }); });
      sub(480, 340, '라우팅 + 캐싱 + max_tokens + 압축을 겹쳐 쓴 결과', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 5) { const ST = ['캐싱', 'max_tokens', '라우팅', 'Batch API', 'LLMLingua', 'Streaming'], NOTE = ['가장 빠른 ROI', '코드 한 줄', '1~2주', '필요할 때만', 'RAG가 무거울 때', '챗봇이면 필수'];
      ST.forEach((s, i) => { const x = 110 + i * 148, y = i % 2 ? 230 : 150, sc = pop(u, 0.2 + i * 0.3);
        el('circle', { cx: x, cy: y, r: 26 * clamp(sc, 0, 1.2), fill: i < 3 ? ACC : PANEL, stroke: ACC, 'stroke-width': 2.5 }); mono(x, y + 6, String(i + 1), { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: i < 3 ? PANEL : ACC, opacity: clamp(sc) });
        tx(x, y + (i % 2 ? 52 : -40), s, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(sc) }); tx(x, y + (i % 2 ? 74 : -62), NOTE[i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: clamp(sc) });
        if (i) grow(x - 148 + 24, (i - 1) % 2 ? 230 : 150, x - 24, y, seg(u, 0.2 + i * 0.3, 0.4 + i * 0.3), MUT, { plain: true }); });
      sub(480, 370, '싸고 빠른 것부터 붙인다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k6: 측정 고리
    const cx = 480, cy = 210, r = 150; el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3 });
    ['조합한다', '측정한다', '튜닝한다', '반복한다'].forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, s2 = pop(u, 0.2 + i * 0.3);
      card(cx + r * Math.cos(a), cy + r * Math.sin(a), 120, 44, { rx: 22, text: s, fs: 16, stroke: ACC, color: ACC, fill: PANEL, s: s2 }); });
    const a = -Math.PI / 2 + (u / 3) * Math.PI * 2; el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 8, fill: INK });
    tx(cx, cy + 6, 'silver bullet은 없다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }

  // ───────── 확인 문제 ─────────
  const quiz = [
    { q: 'Batch API 결과 파일에서 어떤 답이 어떤 질문의 것인지 맞추는 방법은 무엇인가?',
      o: ['출력 줄 순서가 입력 순서와 같으니 순서대로 맞춘다', '각 줄의 custom_id로 맞춘다', 'batch.id로 맞춘다'], a: 1,
      why: '출력 순서는 입력과 다를 수 있다. 입력 줄마다 eval-0000 같은 custom_id를 붙여 두고 그 값으로 짝짓는다.' },
    { q: 'SSE streaming을 켜면 바뀌는 것은 무엇인가?',
      o: ['첫 토큰이 보이기까지의 시간', '호출당 토큰 수와 요금', '모델이 만드는 답의 내용'], a: 0,
      why: '토큰 수가 같으니 요금은 같다. 대신 5초 기다리던 화면이 200ms 만에 첫 글자를 보여 준다.' },
    { q: 'LLMLingua-2 압축에 GPT급 모델 대신 작은 BERT 계열 모델을 쓰는 이유는 무엇인가?',
      o: ['BERT가 GPT보다 요약을 잘해서', '압축 결과를 사람이 읽기 쉬워서', '압축 자체가 비싸면 input 비용에서 아낀 돈이 사라져서'], a: 2,
      why: '목표는 input 비용을 줄이는 것이다. 토큰마다 남김·버림만 고르는 작은 모델이면 5000토큰을 1450토큰으로 줄이고도 남는다.' },
    { q: 'gpt-4에서 input 800, output 400인 호출의 output을 200으로 줄이면 총비용은 얼마나 주는가?',
      o: ['50%', '25%', '12.5%'], a: 1,
      why: 'input $0.024와 output $0.024로 반반이다. output이 절반이 되면 $0.048이 $0.036이 되어 25% 준다.' },
    { q: '실시간 챗봇 조합에서 Batch API가 빠지는 이유는 무엇인가?',
      o: ['결과가 최대 24시간 뒤에 오기 때문이다', '할인 폭이 너무 작기 때문이다', 'streaming과 같은 API를 쓰기 때문이다'], a: 0,
      why: 'Batch는 기다림을 내주고 50% 할인을 받는다. 사용자가 바로 답을 기다리는 곳에서는 쓸 수 없다.' },
  ];

  const summary = [
    '즉시 답이 필요 없는 대량 작업은 Batch API로 보내 단가를 절반으로 낮춘다.',
    'streaming은 요금은 그대로이고, 첫 토큰을 200ms 만에 보여 줘 체감 지연을 줄인다.',
    'LLMLingua 압축은 긴 context를 70% 줄이지만 품질이 조금 떨어져 의료·법률에는 쓰지 않는다.',
    'max_tokens와 길이 지시로 output을 줄이면 비용이 바로 준다. 잘림 비율은 따로 잰다.',
  ];
  const review = [
    { q: '야간에 1000건 eval을 돌리는데 비용을 줄이고 싶다. 결과는 다음 날 아침에 보면 된다. 먼저 쓸 기법은?',
      o: ['SSE streaming', 'Batch API', '더 큰 max_tokens'], a: 1,
      why: '즉시성이 필요 없으니 24시간 창을 받아들이고 반값을 얻는다. 1000건이 $36에서 $18이 된다.' },
    { q: 'max_tokens를 카테고리별로 걸었더니 답이 문장 중간에 끊긴다는 불만이 늘었다. 먼저 확인할 것은?',
      o: ['임베딩 모델 버전', 'Batch 상태', 'finish_reason이 "length"인 비율'], a: 2,
      why: '잘린 답은 finish_reason이 "length"다. 10%를 넘으면 상한을 올리거나 프롬프트에 길이 지시를 넣는다.' },
    { q: '챗봇에 streaming을 넣었는데 운영 서버에서는 답이 여전히 한꺼번에 나온다. 로컬에서는 잘 된다. 의심할 곳은?',
      o: ['nginx 같은 리버스 프록시의 버퍼링 설정', 'OpenAI 요금제', 'LLMLingua 압축률'], a: 0,
      why: '프록시가 응답을 모았다가 보내면 토큰 흐름이 끊긴다. SSE 경로는 버퍼링을 꺼야 한다.' },
  ];

  R.page({ title: '비용·지연 절감 기법', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
