/* V-1-2 가드레일 (PII / Toxic / Hallucination / Policy / 라이브러리) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    person, cross, check, lock, hbar, server, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const mid = (x, y, s, o) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle' }, o || {}));
  const note = (y, s, u, a, col) => mid(480, y, s, { 'font-size': 16, 'font-weight': 700, fill: col || INK, opacity: fade(u, a) });
  // 조각 문장: parts [[글자, 색|null, 배경|null]] 를 x 부터 이어 그린다. 돌려준 값: 각 조각의 [x0, x1]
  function seq(x, y, parts, fs, op) { const out = []; let cx = x;
    parts.forEach(([s, col, bg]) => { const w = tw(s, fs); if (bg) el('rect', { x: cx - 2, y: y - fs - 2, width: w + 4, height: fs + 9, rx: 4, fill: bg, opacity: op ?? 1 });
      mono(cx, y, s, { 'font-size': fs, fill: col || INK, 'font-weight': col ? 700 : 400, opacity: op ?? 1 }); out.push([cx, cx + w]); cx += w; }); return out; }
  function gate(x, y, name, col, s, o) { o = o || {}; const g = card(x, y, 120, 76, { rx: 12, stroke: col, sw: 2.5, fill: o.fill || PANEL, s, dash: o.dash });
    el('path', { d: 'M0,-28 L14,-22 V-12 Q14,-2 0,4 Q-14,-2 -14,-12 V-22 Z', fill: col, opacity: 0.85 }, g); tx(0, 24, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col }, g); }

  // ───────── 1. PII ─────────
  const S1 = [['내 이메일 ', null], ['hong@example.com', 'E'], [' ', null], ['010-1234-5678', 'P'], [' 로 연락주세요', null]];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [['email', 'hong@example.com'], ['phone', '010-1234-5678'], ['ssn', '900101-1234567'], ['card', '1234-5678-9012-3456'], ['ip', '10.0.0.12']].forEach(([n, ex], i) => {
        const y = 60 + i * 52, s = seg(u, 0.2 + i * 0.25, 0.6 + i * 0.25); if (s <= 0) return;
        el('rect', { x: 130, y: y - 22, width: 520, height: 42, rx: 8, fill: PANEL, stroke: BAD, 'stroke-width': 1.5, opacity: s });
        mono(150, y + 5, n, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: s }); mono(270, y + 5, ex, { 'font-size': 15, fill: MUT, opacity: s }); });
      [['이름', '홍길동'], ['주소', '서울시 강남구']].forEach(([n, ex], i) => { const x = 760, y = 110 + i * 90, s = pop(u, 1.7 + i * 0.3);
        card(x, y, 200, 64, { rx: 10, stroke: GRID, dash: '5 5', s }); mid(x, y - 4, n, { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: clamp(s) }); mid(x, y + 18, ex, { 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); });
      mid(760, 260, '정규식 표에 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
      note(360, '형식이 정해진 PII 다섯 종류만 정규식으로 잡는다', u, 2.0); return; }
    if (k === 1 || k === 2) { const done = k === 2 ? 1 : E(u, 1.4, 2.2);
      mono(80, 70, 'mask_pii(user_input)', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      const parts = S1.map(([s, tag]) => tag ? [done > 0.5 ? (tag === 'E' ? '[EMAIL_REDACTED]' : '[PHONE_REDACTED]') : s, done > 0.5 ? GOOD : BAD, done > 0.5 ? GOODBG : (k === 1 && u > 0.5 ? BADBG : null)] : [s, null, null]);
      seq(80, 140, parts, 17);
      if (k === 1) { mono(80, 210, 're.findall → 건수,  re.sub → 표식', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.6) });
        note(330, '지우지 않고 표식으로 바꾼다 · 문장 구조는 그대로', u, 2.2); return; }
      card(300, 250, 380, 70, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.3) }); mono(130, 245, 'found =', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      mono(130, 270, '{"email": 1, "phone": 1}', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) });
      grow(500, 250, 600, 250, seg(u, 1.0, 1.5), MUT); card(740, 250, 240, 56, { rx: 10, text: 'pii_detected metric', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.4) });
      note(370, '건수를 metric으로 올리면 PII 유입량이 대시보드에 뜬다 (실행 확인)', u, 2.0); return; }
    if (k === 3) { person(70, 200, '사용자', {});
      gate(290, 200, 'mask_pii', BAD, pop(u, 0.1));
      el('line', { x1: 470, y1: 60, x2: 470, y2: 350, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' });
      tx(480, 80, '여기부터 벤더', { 'font-size': 14.5, 'font-weight': 700, fill: BAD });
      server(740, 200, 'LLM 벤더', { s: 0.9 });
      fly(110, 170, 230, 170, seg(u, 0.2, 0.9), 'hong@… 010-…', { fill: BAD, mono: true });
      fly(350, 200, 590, 200, seg(u, 1.1, 2.2), '[EMAIL_REDACTED] …', { fill: GOOD, mono: true, stay: true });
      mono(290, 280, '+1 pii_detected', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      note(385, '원문이 한 번 벤더로 나가면 회수할 길이 없다', u, 2.2, BAD); return; }
    if (k === 4) { mono(60, 70, '"홍길동 서울시 강남구, +1-415-555-0100"', { 'font-size': 17, 'font-weight': 700 });
      card(200, 160, 260, 70, { rx: 10, stroke: GRID, sw: 2, s: pop(u, 0.2) }); mid(200, 152, '정규식 mask_pii', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(200, 178, 'found = {}', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.7) });
      grow(340, 160, 520, 160, seg(u, 1.0, 1.4), ACC);
      card(680, 160, 300, 70, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 1.3) }); mid(680, 152, 'Presidio (ML NER)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      mid(680, 176, '예시 결과', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
      [['홍길동', 'PERSON'], ['서울시 강남구', 'LOCATION'], ['+1-415-555-0100', 'PHONE_NUMBER']].forEach(([a, b], i) => { const y = 250 + i * 42, s = fade(u, 1.7 + i * 0.25);
        mono(560, y, a, { 'font-size': 15, opacity: s }); pill(820, y - 5, b, ACC, s, { mono: true, fs: 13.5 }); });
      mid(200, 260, '이름·주소·외국 번호를', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) }); mid(200, 284, '하나도 못 잡았다 (실행 확인)', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
      note(400, '정규식 다음에 ML 한 겹을 더 쌓는다', u, 2.3); return; }
    [['운영 로그', '마스킹본만', GOOD, true], ['raw input', '저장 금지', BAD, false], ['암호화 vault', '필요할 때만 30일', WARN, true]].forEach(([a, b, col, ok], i) => {
      const x = 180 + i * 300, s = pop(u, 0.2 + i * 0.45); dbIcon(x, 170, null, { stroke: col, s });
      mid(x, 260, a, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: clamp(s) }); mid(x, 286, b, { 'font-size': 14.5, fill: MUT, opacity: clamp(s) });
      if (i === 2) lock(x + 52, 130, true, col, clamp(s)); (ok ? check : cross)(x - 52, 130, 12, s); });
    note(370, '마스킹해도 원문 로그가 남으면 소용없다', u, 1.8); }

  // ───────── 2. Toxic 필터 (입력 · 출력 두 번) ─────────
  const P2 = { q: 60, g1: 250, llm: 480, g2: 700, out: 890, y: 200 };
  function lane(c, o) { o = o || {}; const { k, u } = c, Y = P2.y;
    person(P2.q, Y, '질문', {});
    el('line', { x1: 95, y1: Y, x2: P2.out - 40, y2: Y, stroke: GRID, 'stroke-width': 2.5 });
    gate(P2.g1, Y, '입력 검사', INFO, 1);
    card(P2.llm, Y, 120, 64, { rx: 12, text: 'LLM', fs: 18, stroke: o.llmOff ? GRID : INK, color: o.llmOff ? OFF : INK, dash: o.llmOff ? '5 5' : null, fill: PANEL });
    gate(P2.g2, Y, '출력 검사', INFO, 1);
    card(P2.out, Y, 90, 50, { rx: 10, text: '응답', fs: 15, stroke: GRID }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const CAT = [['hate', '증오'], ['hate/threatening', '증오 + 위협'], ['harassment', '괴롭힘'], ['self-harm', '자해'], ['sexual', '성적'], ['sexual/minors', '아동 성적'], ['violence', '폭력'], ['violence/graphic', '잔혹 폭력']];
      CAT.forEach(([a, b], i) => { const x = 140 + (i % 4) * 228, y = 90 + Math.floor(i / 4) * 110, s = pop(u, 0.2 + i * 0.15), crit = a === 'sexual/minors';
        card(x, y, 208, 80, { rx: 12, stroke: crit ? BAD : WARN, sw: crit ? 3 : 2, fill: crit ? BADBG : PANEL, s });
        mono(x, y - 6, a, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: crit ? BAD : INK, opacity: clamp(s) }); mid(x, y + 20, b, { 'font-size': 14, fill: MUT, opacity: clamp(s) }); });
      mid(480, 300, '코드 주석의 주요 8종 · openai 1.54 응답 키는 13개', { 'font-size': 15, fill: MUT, 'font-weight': 600, opacity: fade(u, 1.8) });
      note(350, '유형마다 대응 강도가 다르다 · 아동 성적 콘텐츠는 즉시 차단', u, 2.2, BAD); return; }
    lane(c, { llmOff: k === 3 || k === 4 });
    if (k === 1) { card(480, 70, 260, 52, { rx: 10, text: 'Moderation API · 무료', fs: 16, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
      grow(P2.g1, 160, 380, 90, seg(u, 0.6, 1.1), MUT); grow(P2.g2, 160, 580, 90, seg(u, 0.9, 1.4), MUT);
      mono(480, 320, 'CRITICAL = {"sexual/minors", "self-harm/intent"}', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.5) });
      note(380, '입력과 출력에 같은 검사 함수를 한 번씩 건다', u, 2.2); return; }
    if (k === 2) { dot([[95, 200], [P2.g1 - 60, 200]], seg(u, 0.1, 0.6), WARN, 7);
      card(250, 340, 420, 120, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.5) });
      mono(60, 312, 'flagged    True', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      mono(60, 338, 'categories {"harassment": True}', { 'font-size': 15, opacity: fade(u, 1.0) });
      mono(60, 364, 'scores', { 'font-size': 15, opacity: fade(u, 1.2) }); hbar(150, 352, 180, 0.8, 1, { u: E(u, 1.3, 2.2), col: WARN, label: false, h: 14 });
      tx(60, 392, '값은 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
      tx(500, 330, 'flagged가 우리 기준과 다르면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(500, 356, 'scores로 임계값을 직접 잡는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { dot([[95, 200], [P2.g1 - 60, 200], [P2.g1, 200], [P2.g1, 300]], seg(u, 0.1, 1.2), BAD, 8);
      card(P2.g1, 330, 150, 48, { rx: 10, text: '403 차단', fs: 17, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.2) });
      mono(P2.g1, 120, 'sexual/minors', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      mid(P2.llm, 270, 'LLM은 부르지도 않는다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      note(395, '중대 위반은 토큰 쓰기 전에 끊는다', u, 2.1, BAD); return; }
    if (k === 4) { dot([[95, 200], [P2.g1 - 60, 200], [P2.g1, 200], [P2.g1, 290]], seg(u, 0.1, 1.2), WARN, 8);
      card(P2.g1 + 160, 330, 460, 56, { rx: 12, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.2) });
      tx(P2.g1 - 60, 336, '죄송합니다. 적절하지 않은 요청은 답변드릴 수 없어요.', { 'font-size': 15, opacity: fade(u, 1.3) });
      mono(P2.g1, 120, 'harassment', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      note(400, '경미하면 에러 코드 대신 정중한 문장', u, 2.1); return; }
    dot([[95, 200], [P2.llm - 60, 200]], seg(u, 0.1, 0.7), GOOD, 7); check(P2.g1, 120, 12, pop(u, 0.5));
    dot([[P2.llm + 60, 200], [P2.g2 - 60, 200], [P2.g2, 200], [P2.g2, 290]], seg(u, 0.9, 1.7), BAD, 8);
    card(P2.g2 - 90, 330, 470, 56, { rx: 12, stroke: GOOD, sw: 2, fill: GOODBG, s: pop(u, 1.7) });
    tx(P2.g2 - 310, 336, '죄송합니다. 적절한 답변을 생성하지 못했어요.', { 'font-size': 15, opacity: fade(u, 1.8) });
    mono(P2.g2, 120, 'toxic_blocked{output} +1', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
    note(405, '출력도 검사하지 않으면 LLM이 그대로 내보낸다', u, 2.3); }

  // ───────── 3. Hallucination (judge 채점) ─────────
  function ruler(c, score, o) { o = o || {}; const { u } = c, X0 = 120, W = 720, Y = o.y || 300, X = (v) => X0 + v * W;
    [[0, 0.5, BAD, BADBG, '< 0.5 거부 → 상담사'], [0.5, 0.7, WARN, WARNBG, '0.5~0.7 경고'], [0.7, 1, GOOD, GOODBG, '≥ 0.7 통과']].forEach(([a, b, col, bg, name], i) => {
      const s = o.bands ? fade(u, 0.3 + i * 0.4) : 0.25;
      el('rect', { x: X(a), y: Y, width: X(b) - X(a), height: 26, fill: bg, stroke: col, 'stroke-width': 1.5, opacity: Math.max(s, 0.25) });
      if (o.bands) mid((X(a) + X(b)) / 2, Y + 54, name, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: s }); });
    [0, 0.5, 0.7, 1].forEach((v) => mono(X(v), Y - 8, String(v), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }));
    if (score != null) { const x = X(score * E(u, 0.3, 1.4)); el('path', { d: `M${x - 9},${Y - 30} L${x + 9},${Y - 30} L${x},${Y - 14} Z`, fill: INK });
      mono(x, Y - 36, score.toFixed(2) + ' (예시)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { el('rect', { x: 60, y: 30, width: 400, height: 330, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(80, 60, 'FACTUALITY_PROMPT', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      tx(80, 92, '답변이 컨텍스트에서 근거를', { 'font-size': 15 }); tx(80, 114, '찾을 수 있는지 평가하세요.', { 'font-size': 15 });
      [['컨텍스트', '{context}', 150], ['답변', '{answer}', 240]].forEach(([a, b, y], i) => { const s = k === 0 ? pop(u, 0.5 + i * 0.4) : 1;
        tx(80, y, a, { 'font-size': 14.5, fill: MUT, 'font-weight': 700 }); card(260, y + 34, 360, 46, { rx: 8, stroke: INFO, dash: '6 5', sw: 2, s });
        mono(260, y + 40, b, { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: clamp(s) }); });
      if (k === 0) { tx(520, 150, '"맞냐" 가 아니라', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 1.5) }); tx(520, 182, '"근거가 있냐" 를 묻는다', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
        tx(520, 230, '판단 범위를 컨텍스트 안으로 좁힌다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
      el('rect', { x: 520, y: 80, width: 380, height: 200, rx: 12, fill: INK, opacity: fade(u, 0.2) });
      [['{', 0], ['  "faithful": true | false,', 0.4], ['  "score": 0.0~1.0,', 0.7], ['  "reason": "근거 또는 모순"', 1.0], ['}', 1.2]].forEach(([s, a], i) => mono(540, 120 + i * 34, s, { 'font-size': 15, fill: i && i < 4 ? 'var(--term)' : PANEL, opacity: fade(u, a) }));
      tx(520, 320, 'reason을 같이 받아야 왜 걸렀는지 설명된다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { [['요청마다 본 답변', 'gpt-4o (예시)', INK, 110], ['그 답을 다시 채점', 'gpt-4o-mini judge', ACC, 250]].forEach(([a, b, col, y], i) => {
        card(300, y, 360, 74, { rx: 12, stroke: col, sw: 2.5, s: pop(u, 0.2 + i * 0.5) }); mid(300, y - 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) });
        mono(300, y + 20, b, { 'font-size': 15, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.4 + i * 0.5) }); });
      grow(300, 150, 300, 210, seg(u, 0.8, 1.2), MUT);
      pill(300, 325, 'response_format = json_object', INFO, pop(u, 1.4), { mono: true, fs: 14 });
      tx(560, 160, '호출 수가 두 배가 된다', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      tx(560, 192, '그래서 judge는 싼 모델로', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(560, 220, 'JSON 모드로 파싱 실패를 막는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { mono(60, 60, 'retrieve(question, top_k=5)', { 'font-size': 15, 'font-weight': 700, fill: INFO });
      for (let i = 0; i < 5; i++) { const x = 90 + i * 70, s = pop(u, 0.2 + i * 0.12); card(x, 120, 54, 68, { rx: 6, stroke: INFO, sw: 2, s }); mono(x, 126, 'd' + (i + 1), { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, opacity: clamp(s) }); }
      grow(240, 160, 240, 220, seg(u, 0.9, 1.2), MUT); card(240, 250, 200, 52, { rx: 10, text: 'llm.generate', mono: true, fs: 15, stroke: INK, s: pop(u, 1.1) });
      grow(440, 120, 620, 120, seg(u, 1.4, 1.9), INFO); grow(340, 250, 620, 250, seg(u, 1.5, 2.0), ACC);
      card(730, 185, 200, 160, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 1.9) }); mid(730, 170, 'judge', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      mid(730, 198, '같은 d1~d5', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 2.0) }); mid(730, 222, '+ 답변', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) });
      note(370, '생성에 쓴 근거로 검증한다 · 다시 검색하면 기준이 바뀐다', u, 2.2); return; }
    if (k === 4) { ruler(c, 0.42, {});
      card(480, 110, 520, 120, { rx: 12, stroke: WARN, sw: 2.5, fill: WARNBG, s: pop(u, 1.5) });
      [['"confidence": "low"', BAD], ['"warning": "답변 근거가 약합니다…"', INK], ['"reason": "…"', MUT]].forEach(([s, col], i) => mono(240, 82 + i * 28, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.6 + i * 0.2) }));
      note(395, '답을 지우지 않고 확신도를 같이 보여 준다', u, 2.3); return; }
    ruler(c, null, { bands: true, y: 150 });
    card(480, 320, 560, 60, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 1.6) });
    mid(480, 326, '금융·의료·법률은 점수와 상관없이 사람이 검증', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.7) }); }

  // ───────── 4. 사내 정책 ─────────
  const PAT = [['경쟁사|competitor', '경쟁사 언급'], ['진단(은|이) (확실|확정)', '의료 단정'], ['투자(는|하)? (반드시|꼭)', '투자 권유'], ['(반드시|무조건) (구매|매수)', '구매 강요']];
  function cascade(c, o) { const { u } = c; [['키워드', '빠름 · 공짜', WARN], ['LLM judge', '느림 · $0.001', ACC], ['사람 검토', '확실 · 비쌈', INFO]].forEach(([a, b, col], i) => {
      const x = 200 + i * 280, off = o.off === i; card(x, 90, 200, 70, { rx: 12, stroke: off ? GRID : col, sw: 2.5, dash: off ? '5 5' : null, s: 1 });
      mid(x, 86, a, { 'font-size': 17, 'font-weight': 800, fill: off ? OFF : col }); mid(x, 110, b, { 'font-size': 14, fill: MUT });
      if (i < 2) grow(x + 102, 90, x + 176, 90, 1, GRID); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { PAT.forEach(([re, n], i) => { const y = 70 + i * 66, s = seg(u, 0.2 + i * 0.3, 0.6 + i * 0.3); if (s <= 0) return;
        el('rect', { x: 120, y: y - 26, width: 720, height: 50, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 1.8, opacity: s });
        mono(140, y + 6, re, { 'font-size': 17, 'font-weight': 700, fill: WARN, opacity: s }); tx(820, y + 6, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', opacity: s }); });
      note(360, '자주 나오는 위반은 정규식으로 먼저 막는다', u, 1.9); return; }
    if (k === 1) { [['"경쟁사보다 지금 무조건 매수하세요"', ['경쟁사|competitor', '(반드시|무조건) (구매|매수)']], ['"환불은 7일 이내 가능합니다"', []]].forEach(([s, v], i) => {
        const y = 80 + i * 170; mono(80, y, s, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.2 + i * 1.0) });
        mono(100, y + 40, 'violations =', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5 + i * 1.0) });
        if (!v.length) mono(240, y + 40, '[]', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
        v.forEach((p, j) => pill(330 + j * 260, y + 35, p, BAD, pop(u, 0.7 + j * 0.4), { mono: true, fs: 14 })); });
      note(390, '첫 매치에서 멈추지 않고 전부 모은다 (실행 확인)', u, 2.0); return; }
    if (k === 2) { el('rect', { x: 200, y: 30, width: 560, height: 300, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(222, 60, 'POLICY_GUIDE', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      ['경쟁사 (회사B, 회사C) 언급 금지', '의료 진단 / 처방 절대 금지', '투자 수익률 약속 금지', '법적 자문 형태의 답 금지', '정치/종교 의견 금지'].forEach((r, i) => { const a = seg(u, 0.3 + i * 0.3, 0.6 + i * 0.3);
        if (a <= 0) return; el('circle', { cx: 240, cy: 100 + i * 46, r: 14, fill: ACC, opacity: a }); mono(240, 105 + i * 46, String(i + 1), { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: a });
        tx(268, 106 + i * 46, r, { 'font-size': 16, opacity: a }); });
      note(375, '규정은 문장으로 둔다 · 법무·기획이 직접 고친다', u, 2.0); return; }
    if (k === 3) { mono(60, 60, '답변: "이 상품은 연 10% 수익이 보장됩니다"  (예시)', { 'font-size': 16, 'font-weight': 700 });
      mono(60, 92, '키워드 검사 → []', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4) });
      card(200, 200, 200, 70, { rx: 10, text: 'POLICY_GUIDE\n+ 답변', fs: 15, stroke: GRID, s: pop(u, 0.6) });
      grow(302, 200, 400, 200, seg(u, 0.9, 1.3), ACC); card(480, 200, 150, 60, { rx: 10, text: 'gpt-4o-mini', mono: true, fs: 15, stroke: ACC, color: ACC, s: pop(u, 1.1) });
      grow(557, 200, 620, 200, seg(u, 1.4, 1.7), ACC);
      el('rect', { x: 630, y: 130, width: 300, height: 140, rx: 10, fill: INK, opacity: fade(u, 1.6) });
      [['"violated": true', BAD], ['"rule_number": 3', 'var(--term)'], ['"reason": "수익 약속"', 'var(--term)']].forEach(([s, col], i) => mono(648, 170 + i * 34, s, { 'font-size': 15, 'font-weight': 700, fill: col === BAD ? '#f87171' : col, opacity: fade(u, 1.8 + i * 0.2) }));
      note(345, '정규식이 못 잡은 위반을 조항 번호와 함께 지목한다 (판정은 예시)', u, 2.3); return; }
    cascade(c, { off: k === 4 ? 1 : null });
    if (k === 4) { mono(60, 210, '"경쟁사보다 지금 무조건 매수하세요"', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      dot([[200, 180], [200, 130]], seg(u, 0.4, 0.9), WARN, 8); cross(200, 160, 12, pop(u, 0.9));
      mid(480, 160, '호출 안 함', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.1) });
      card(480, 300, 470, 56, { rx: 12, stroke: GOOD, sw: 2, fill: GOODBG, s: pop(u, 1.4) }); mid(480, 306, '이 부분은 상담사에게 문의해 주시기 바랍니다.', { 'font-size': 15.5, opacity: fade(u, 1.5) });
      mono(480, 370, 'policy_block{"keyword"} +1', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      note(405, '싼 검사에서 걸리면 비싼 검사는 건너뛴다', u, 2.2); return; }
    mono(60, 210, '"이 상품은 연 10% 수익이 보장됩니다"', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
    check(200, 160, 12, pop(u, 0.5)); dot([[300, 90], [380, 90]], seg(u, 0.6, 1.0), ACC, 7); cross(480, 160, 12, pop(u, 1.1));
    card(480, 300, 470, 56, { rx: 12, stroke: GOOD, sw: 2, fill: GOODBG, s: pop(u, 1.4) }); mid(480, 306, '이 부분은 상담사에게 문의해 주시기 바랍니다.', { 'font-size': 15.5, opacity: fade(u, 1.5) });
    mono(480, 370, 'policy_block{"llm_judge"} +1 · 위반 내용 로그', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    note(405, 'system prompt만 믿지 않고 출력에서 한 번 더 본다', u, 2.2); }

  // ───────── 5. Guardrails AI ─────────
  const VAL = [['DetectPII', 'fix', '마스킹 후 통과', BAD], ['ToxicLanguage', 'exception', '응답 차단', WARN], ['GroundedAIHallucination', 'reask', '다시 묻기', ACC], ['CompetitorCheck', 'filter', '그 부분만 제거', INFO]];
  function guardBox(c, hi) { const { k, u } = c;
    el('rect', { x: 520, y: 30, width: 410, height: 290, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    mono(540, 58, 'Guard().use_many(', { 'font-size': 15, 'font-weight': 800 });
    VAL.forEach(([n, f, d, col], i) => { const y = 92 + i * 56, on = hi === i;
      el('rect', { x: 538, y: y - 20, width: 374, height: 44, rx: 8, fill: on ? SOFT : PANEL, stroke: on ? col : GRID, 'stroke-width': on ? 2.5 : 1.5 });
      mono(552, y + 6, n, { 'font-size': 14.5, 'font-weight': 700, fill: on ? col : INK }); mono(900, y + 6, f, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: col }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['Step 1  mask_pii', 'DetectPII'], ['Step 2  moderate', 'ToxicLanguage'], ['Step 3  check_faithfulness', 'GroundedAIHallucination'], ['Step 4  check_policy', 'CompetitorCheck']].forEach(([a, b], i) => {
        const y = 70 + i * 74, s = seg(u, 0.2 + i * 0.35, 0.6 + i * 0.35); if (s <= 0) return;
        el('rect', { x: 60, y: y - 24, width: 330, height: 48, rx: 10, fill: SOFT, stroke: GRID, opacity: s }); mono(76, y + 6, a, { 'font-size': 15, opacity: s });
        grow(400, y, 520, y, seg(u, 0.5 + i * 0.35, 0.9 + i * 0.35), ACC);
        el('rect', { x: 530, y: y - 24, width: 330, height: 48, rx: 10, fill: ACCBG, stroke: ACC, opacity: s }); mono(546, y + 6, b, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: s }); });
      note(375, '직접 짠 네 겹이 hub의 validator로 이미 있다', u, 2.1); return; }
    if (k >= 1 && k <= 3) guardBox(c, k === 1 ? 0 : k === 2 ? 1 : 2);
    if (k === 1) { mono(40, 80, '"내 이메일은 hong@example.com"', { 'font-size': 15, 'font-weight': 700 });
      fly(260, 110, 500, 92, seg(u, 0.3, 1.0), 'hong@…', { fill: BAD, mono: true });
      fly(560, 160, 260, 220, seg(u, 1.2, 2.0), '[마스킹]', { fill: GOOD, mono: true, stay: true });
      tx(40, 280, 'on_fail="fix" 는 차단이 아니다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) });
      tx(40, 306, '고쳐서 그대로 진행한다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { ['환불은 7일 이내 가능합니다.', '(거친 문장)', '자세한 건 고객센터로.'].forEach((s, i) => { const y = 80 + i * 56, bad = i === 1;
        card(250, y, 420, 44, { rx: 8, stroke: bad ? BAD : GRID, sw: bad ? 2.5 : 1.5, fill: bad && u > 1.0 ? BADBG : PANEL, s: pop(u, 0.2 + i * 0.2) });
        tx(60, y + 5, s, { 'font-size': 15, fill: bad ? BAD : INK, opacity: fade(u, 0.3 + i * 0.2) });
        mono(440, y + 5, bad ? '> 0.5' : '≤ 0.5', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: bad ? BAD : GOOD, opacity: fade(u, 0.9 + i * 0.1) }); });
      card(250, 290, 300, 50, { rx: 10, text: '응답 전체 차단 (exception)', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.6) });
      tx(40, 370, '문장 단위라 한 문장만 문제여도 잡힌다 · 점수는 예시', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { card(140, 110, 140, 56, { rx: 10, text: 'LLM', fs: 17, stroke: INK, s: 1 });
      el('path', { d: 'M520,148 C420,148 360,200 200,140', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3), 'marker-end': 'url(#ra-ahb)' });
      dot([[520, 148], [430, 165], [330, 172], [210, 142]], seg(u, 0.4, 1.4), ACC, 7);
      tx(260, 210, 'reask: 근거 없는 답이면 다시 묻는다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      el('rect', { x: 538, y: 240, width: 374, height: 44, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2.5 });
      mono(40, 300, '"저희 제품을 추천합니다. ', { 'font-size': 15, opacity: fade(u, 1.4) });
      mono(275, 300, '회사B 제품도 좋아요."', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.4) * (1 - 0.6 * fade(u, 2.0)), 'text-decoration': u > 2.0 ? 'line-through' : null });
      tx(40, 340, 'filter: 경쟁사 언급 부분만 지운다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) });
      tx(40, 390, '실패 대응이 넷이라 "무조건 차단" 말고도 고를 수 있다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { el('rect', { x: 200, y: 60, width: 560, height: 230, rx: 18, fill: ACCBG, stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.2) });
      mono(222, 92, 'guard(', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      card(480, 175, 340, 70, { rx: 12, text: 'llm_api = openai…create', mono: true, fs: 15, stroke: INK, s: pop(u, 0.5) });
      pill(480, 255, 'metadata.context = rag_context', INFO, pop(u, 1.1), { mono: true, fs: 14 });
      mono(740, 278, ')', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      note(350, '호출부 한 곳을 감싸면 네 validator가 모두 걸린다', u, 1.8); return; }
    card(240, 90, 300, 60, { rx: 12, text: 'response', mono: true, fs: 17, stroke: INK, s: pop(u, 0.1) });
    grow(240, 122, 140, 200, seg(u, 0.4, 0.9), GOOD); grow(240, 122, 340, 200, seg(u, 0.6, 1.1), BAD);
    card(140, 240, 230, 70, { rx: 10, stroke: GOOD, sw: 2.5, s: pop(u, 0.9) }); mid(140, 234, 'validation_passed', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) }); mono(140, 258, 'validated_output', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    card(400, 240, 260, 70, { rx: 10, stroke: BAD, sw: 2.5, s: pop(u, 1.1) }); mid(400, 234, '실패', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); tx(400, 258, '안전 문구로 대체', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.2) });
    el('rect', { x: 600, y: 60, width: 330, height: 260, rx: 10, fill: INK, opacity: fade(u, 1.4) }); mono(620, 90, 'Guard failed:', { 'font-size': 14.5, fill: '#f87171', opacity: fade(u, 1.5) });
    ['DetectPII → fix', 'ToxicLanguage → exception', '…'].forEach((s, i) => mono(620, 124 + i * 30, s, { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 1.7 + i * 0.2) }));
    note(380, '실패 내역은 전부 로그로 남아 감사 추적이 된다', u, 2.2); }

  const quiz = [
    { q: '"홍길동 서울시 강남구, +1-415-555-0100"을 mask_pii에 넣으면 found는 무엇인가?',
      o: ['{"phone": 1}', '{} (아무것도 못 잡는다)', '{"name": 1, "phone": 1}'], a: 1,
      why: '전화 정규식은 01로 시작하는 한국 번호만 본다. 이름과 주소는 패턴이 없어서 Presidio 같은 ML NER을 한 겹 더 쌓는다.' },
    { q: '입력 검사에서 sexual/minors가 걸리면 무엇이 일어나는가?',
      o: ['LLM을 부르지 않고 403으로 끊는다', '정중한 거절 문장을 돌려준다', 'LLM 답을 받은 뒤 출력 검사에서 막는다'], a: 0,
      why: 'CRITICAL_CATEGORIES에 든 중대 위반은 토큰을 쓰기 전에 바로 차단한다. 경미한 flagged만 완곡한 거절로 돌린다.' },
    { q: 'judge 점수가 0.42로 나온 RAG 답변은 정책상 어떻게 처리하는가?',
      o: ['경고 표시를 붙여 그대로 보여 준다', '점수와 상관없이 그대로 통과시킨다', '답변을 거부하고 상담사에게 넘긴다'], a: 2,
      why: '0.7 미만은 경고, 0.5 미만은 거부와 사람 에스컬레이션이다. 0.42는 0.5보다 낮다.' },
    { q: '키워드 검사를 LLM judge보다 앞에 두는 이유는 무엇인가?',
      o: ['키워드 검사가 더 정확해서', '빠르고 공짜라서 걸리면 비싼 judge 호출을 건너뛸 수 있어서', 'judge는 키워드 결과가 있어야 돌아서'], a: 1,
      why: '대부분의 명백한 위반은 정규식에서 끝난다. 통과한 답만 $0.001짜리 judge로 넘긴다.' },
    { q: 'Guardrails AI에서 경쟁사 언급 문장만 지우고 나머지 답을 살리는 on_fail 값은 무엇인가?',
      o: ['filter', 'exception', 'reask'], a: 0,
      why: 'filter는 걸린 부분만 제거한다. exception은 응답 전체를 막고 reask는 LLM에 다시 묻는다.' },
  ];

  const summary = [
    '정규식은 이메일, 전화, 주민번호, 카드, IP만 잡는다. 이름과 주소는 ML NER로 한 겹 더 막는다.',
    'Moderation은 입력과 출력에 한 번씩 건다. 중대 위반은 LLM을 부르기 전에 403으로 끊는다.',
    'judge LLM은 생성에 쓴 context로 근거를 묻는다. 0.7 미만은 경고, 0.5 미만은 사람에게 넘긴다.',
    '정책 검사는 키워드부터 돌리고 통과한 답만 LLM judge로 넘긴다. 라이브러리는 on_fail로 대응을 고른다.',
  ];
  const review = [
    { q: '로그 검색에서 고객 전화번호가 그대로 보였다. LLM 호출 전 마스킹은 돌고 있었다. 먼저 의심할 것은?',
      o: ['정규식 패턴이 틀렸다', '원문을 저장하는 다른 로그 경로가 남아 있다', 'Moderation API가 꺼져 있다'], a: 1,
      why: 'LLM 입력만 마스킹하고 저장 경로를 그대로 두면 소용없다. 로그도 마스킹본만 남기고 원문은 암호화 vault에 30일만 둔다.' },
    { q: '출력 검사를 붙였더니 정상 답변까지 자주 막힌다. 가장 먼저 손볼 곳은?',
      o: ['출력 검사를 끈다', '모든 차단을 403으로 바꾼다', 'flagged 대신 scores로 카테고리별 임계값을 잡는다'], a: 2,
      why: '기본 flagged 기준이 우리 서비스와 안 맞을 수 있다. 점수를 직접 보고 harassment 0.7 같은 임계값을 정한다.' },
    { q: '"연 10% 수익 보장"이라는 답이 키워드 검사를 통과했다. 이 위반을 잡는 층은?',
      o: ['PII 정규식', 'POLICY_GUIDE를 읽는 LLM judge', '입력 Moderation'], a: 1,
      why: '금지 패턴 네 개에는 수익 약속 표현이 없다. 자연어 규정 3조를 읽는 judge가 조항 번호와 함께 위반을 지목한다.' },
  ];

  R.page({ title: 'LLMOps 가드레일', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
