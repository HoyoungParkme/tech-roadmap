/* V-2-1 Fallback · Degraded · Chaos — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    person, cross, check, clock, lock, server, dbIcon, browser, meters, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const mid = (x, y, s, o) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle' }, o || {}));
  const note = (y, s, u, a, col) => mid(480, y, s, { 'font-size': 16, 'font-weight': 700, fill: col || INK, opacity: fade(u, a) });

  // ───────── 1. 벤더 하나뿐일 때 ─────────
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { person(70, 180, '사용자', {}); card(300, 180, 170, 56, { rx: 10, text: 'POST /chat', mono: true, fs: 16, stroke: INK });
      server(620, 180, 'OpenAI gpt-4o', { lamp: k === 1 ? BAD : GOOD, stroke: k === 1 && u > 0.6 ? BAD : INK });
      el('line', { x1: 100, y1: 180, x2: 214, y2: 180, stroke: GRID, 'stroke-width': 2.5 }); el('line', { x1: 386, y1: 180, x2: 562, y2: 180, stroke: k === 1 ? BAD : GRID, 'stroke-width': 2.5 });
      if (k === 0) { dot([[100, 180], [214, 180], [386, 180], [562, 180]], seg(u, 0.2, 1.4), ACC, 7);
        pill(475, 130, '경로가 하나뿐', BAD, pop(u, 1.5), { fs: 14 });
        note(330, '이 한 줄이 서비스 전체의 단일 장애점(SPOF)이 된다', u, 2.0, BAD); return; }
      cross(620, 180, 26, pop(u, 0.5)); dot([[562, 180], [386, 180], [214, 180], [100, 180]], seg(u, 0.8, 1.8), BAD, 7);
      card(300, 300, 360, 56, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 1.6) });
      mono(300, 306, '502  LLM error: …', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      note(390, '예외를 잡아서 하는 일이 502로 바꾸는 것뿐이다', u, 2.2); return; }
    if (k === 2) { const X0 = 100, W = 760, Y = 300, X = (m) => X0 + (m / 26) * W;   // 2023-11 = 0, 2025-12 = 25
      el('line', { x1: X0, y1: Y, x2: X0 + W, y2: Y, stroke: MUT, 'stroke-width': 2 });
      [['2024-01', 2], ['2025-01', 14], ['2025-12', 25]].forEach(([s, m]) => mono(X(m), Y + 24, s, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }));
      [['2023-11-08', 0, 8], ['2024-06-04', 7, 5], ['2024-12-11', 13, 4]].forEach(([d, m, h], i) => { const g = E(u, 0.3 + i * 0.35, 1.0 + i * 0.35), hh = h * 24 * g;
        el('rect', { x: X(m) - 14, y: Y - hh, width: 28, height: hh, rx: 4, fill: BAD });
        mono(X(m), Y - hh - 10, h + '시간', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0 + i * 0.35) });
        mono(X(m), Y + 46, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 1.0 + i * 0.35) }); });
      for (let m = 15; m <= 25; m++) { const n = m % 2 ? 2 : 1; for (let j = 0; j < n; j++) el('circle', { cx: X(m), cy: Y - 12 - j * 14, r: 5, fill: WARN, opacity: fade(u, 1.6 + (m - 15) * 0.06) }); }
      tx(X(20), Y - 60, '2025: 월 1-2회 부분 장애', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(X0, 50, '코드 주석의 OpenAI 장애 이력', { 'font-size': 16, 'font-weight': 700 });
      return; }
    if (k === 3) { const T = [['Total outage', '드물지만 치명적', (i) => 1], ['Elevated 5xx', '가장 흔함', (i) => i % 4 === 1], ['Slow response', 'timeout 다발', (i) => 2], ['Rate limit storm', '429 폭증', (i) => i > 3 ? 3 : 0], ['Specific model', 'gpt-4만 다운', (i) => i < 4]];
      T.forEach(([n, d, f], r) => { const y = 54 + r * 72, s = seg(u, 0.2 + r * 0.3, 0.6 + r * 0.3); if (s <= 0) return;
        tx(60, y + 6, n, { 'font-size': 16, 'font-weight': 700, opacity: s }); tx(60, y + 28, d, { 'font-size': 13.5, fill: r === 1 ? BAD : MUT, 'font-weight': r === 1 ? 700 : 400, opacity: s });
        for (let i = 0; i < 10; i++) { const v = f(i), col = v === 1 || v === true ? BAD : v === 2 ? WARN : v === 3 ? BAD : GOOD;
          el('rect', { x: 300 + i * 56, y: y - 16, width: 46, height: 34, rx: 6, fill: col, opacity: s * 0.75 });
          if (v === 2) mono(323 + i * 56, y + 6, '…', { 'font-size': 15, 'text-anchor': 'middle', fill: PANEL, opacity: s });
          if (v === 3) mono(323 + i * 56, y + 6, '429', { 'font-size': 13.5, 'text-anchor': 'middle', fill: PANEL, 'font-weight': 700, opacity: s }); } });
      tx(880, 410, '칸 하나 = 요청 하나 (모양은 예시)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) }); return; }
    if (k === 4) { browser(330, 190, 460, 240, '사용자 화면', { s: pop(u, 0.1) });
      mono(330, 180, 'LLM error:', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.4) });
      mono(330, 208, 'Connection timeout', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.5) });
      const n = Math.floor(lerp(0, 5, E(u, 0.9, 2.4)));
      for (let i = 0; i < n; i++) { el('path', { d: `M${640 + i * 52},120 a16,16 0 1 1 -6,-12`, fill: 'none', stroke: WARN, 'stroke-width': 3, 'marker-end': 'url(#ra-ah)' }); }
      tx(640, 175, '새로고침 반복', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      tx(640, 205, '= 다시 호출 = 비용만 늘어난다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
      note(395, '무엇을 해야 할지 알려 주지 않으면 사용자는 같은 요청을 다시 보낸다', u, 2.1); return; }
    const s0 = pop(u, 0.1); mid(480, 110, '외부 API는 죽지 않는다', { 'font-size': 26, 'font-weight': 800, fill: MUT, opacity: clamp(s0) });
    el('line', { x1: 300, y1: 102, x2: lerp(300, 660, E(u, 0.6, 1.1)), y2: 102, stroke: BAD, 'stroke-width': 4 });
    mid(480, 175, '외부 API는 언제든 죽는다', { 'font-size': 30, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
    [['Step 2-3', 'multi-provider fallback'], ['Step 4', 'degraded mode'], ['Step 5', 'chaos로 미리 확인']].forEach(([a, b], i) => { const x = 200 + i * 280, s = pop(u, 1.6 + i * 0.25);
      card(x, 290, 250, 70, { rx: 12, stroke: GOOD, sw: 2, s }); mono(x, 282, a, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) }); mid(x, 306, b, { 'font-size': 15.5, 'font-weight': 700, opacity: clamp(s) }); }); }

  // ───────── 2. Claude 로 자동 전환 ─────────
  const N2 = { u: [60, 200], app: [230, 200], oa: [560, 100], cl: [560, 300], dg: [840, 200] };
  function topo(c, o) { o = o || {}; const { k, u } = c;
    person(N2.u[0], N2.u[1], '사용자', {}); card(N2.app[0], N2.app[1], 170, 56, { rx: 10, text: 'chat_with_fallback', mono: true, fs: 13.5, stroke: INK });
    el('line', { x1: 90, y1: 200, x2: 145, y2: 200, stroke: GRID, 'stroke-width': 2.5 });
    el('path', { d: 'M315,190 L490,108', stroke: o.oaDown ? BAD : GRID, 'stroke-width': 2.5, fill: 'none' }); el('path', { d: 'M315,210 L490,292', stroke: GRID, 'stroke-width': 2.5, fill: 'none' });
    server(N2.oa[0], N2.oa[1], '1차 OpenAI', { s: 0.85, lamp: o.oaDown ? BAD : GOOD, stroke: o.oaDown ? BAD : INK, op: o.op0 });
    server(N2.cl[0], N2.cl[1], '2차 Claude', { s: 0.85, lamp: o.clDown ? BAD : GOOD, stroke: o.clDown ? BAD : INK, op: o.op1 });
    if (o.oaDown) cross(N2.oa[0], N2.oa[1], 18, 1); if (o.clDown) cross(N2.cl[0], N2.cl[1], 18, 1); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { topo(c, { op0: fade(u, 0.2), op1: fade(u, 0.7) });
      lock(660, 100, true, INFO, pop(u, 1.2)); lock(660, 300, true, INFO, pop(u, 1.4)); tx(690, 106, 'API key', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.3) }); tx(690, 306, 'API key', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.5) });
      note(400, '장애가 난 뒤에 연결하고 키를 발급받으면 늦다', u, 1.9); return; }
    if (k === 1) { topo(c); dot([[90, 200], [145, 200], [315, 190], [490, 108]], seg(u, 0.2, 1.1), ACC, 7); clock(N2.oa[0] + 110, N2.oa[1], 18, E(u, 0.6, 1.4) * 0.3, WARN, 'timeout=10');
      dot([[490, 108], [315, 190], [145, 200]], seg(u, 1.3, 2.1), GOOD, 7); mono(400, 120, 'success +1', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      note(400, 'fallback이 있으니 10초만 기다리고 넘어갈 수 있다', u, 2.2); return; }
    if (k === 2) { topo(c, { oaDown: u > 0.5 }); dot([[90, 200], [145, 200], [315, 190], [490, 108]], seg(u, 0.1, 0.7), ACC, 7);
      el('rect', { x: 620, y: 160, width: 320, height: 76, rx: 8, fill: INK, opacity: fade(u, 1.0) });
      mono(634, 188, 'WARNING OpenAI failed:', { 'font-size': 14, fill: '#fbbf24', opacity: fade(u, 1.1) }); mono(634, 214, 'falling back to Claude', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 1.3) });
      mono(400, 120, 'fail +1', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      note(380, 'timeout과 status 에러만 잡고 raise 하지 않는다', u, 1.8); sub(480, 408, '전부 잡으면 우리 버그까지 숨는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { topo(c, { oaDown: true }); dot([[145, 200], [315, 210], [490, 292]], seg(u, 0.2, 1.0), ACC, 7);
      pill(720, 280, 'max_tokens=1024 (필수)', INFO, pop(u, 0.9), { mono: true, fs: 14 }); pill(720, 330, 'resp.content[0].text', INFO, pop(u, 1.2), { mono: true, fs: 14 });
      dot([[490, 292], [315, 210], [145, 200], [90, 200]], seg(u, 1.4, 2.3), GOOD, 7);
      note(400, '사용자는 벤더가 바뀐 줄 모른다 · 인자와 응답 모양만 다르다', u, 2.2); return; }
    if (k === 4) { topo(c, { oaDown: true, clDown: u > 0.7 }); dot([[145, 200], [315, 210], [490, 292]], seg(u, 0.1, 0.7), ACC, 7);
      card(N2.dg[0], N2.dg[1], 160, 60, { rx: 12, text: 'degraded\nresponse', fs: 15, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 1.0) });
      el('path', { d: 'M620,290 C700,290 720,220 755,205', stroke: WARN, 'stroke-width': 2.5, fill: 'none', opacity: fade(u, 1.1), 'marker-end': 'url(#ra-ah)' });
      dot([[620, 290], [700, 260], [760, 205]], seg(u, 1.2, 1.9), WARN, 7);
      note(400, '여기서도 502를 던지지 않는다', u, 2.1); return; }
    const X0 = 220, W = 640;
    tx(X0, 60, '한 달(30일) 다운 시간', { 'font-size': 16, 'font-weight': 700 });
    [['벤더 1개 · 99.9%', 1, '43.2분', BAD], ['벤더 2개 · 99.9999%', 2.6 / 2592, '2.6초', GOOD]].forEach(([n, f, v, col], i) => { const y = 110 + i * 90, g = E(u, 0.3 + i * 0.6, 1.3 + i * 0.6);
      tx(X0 - 16, y + 20, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: X0, y, width: W, height: 32, rx: 6, fill: SOFT }); el('rect', { x: X0, y, width: Math.max(3, W * f * g), height: 32, rx: 6, fill: col });
      mono(i ? X0 + 14 : X0 + W - 12, y + 22, v, { 'font-size': 17, 'font-weight': 800, 'text-anchor': i ? 'start' : 'end', fill: i ? col : PANEL, opacity: fade(u, 1.0 + i * 0.6) }); });
    mono(480, 300, '0.1% × 0.1% = 0.0001%', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
    sub(480, 330, '두 벤더가 서로 독립이라는 가정 아래의 계산', fade(u, 2.1), { 'font-size': 14.5 });
    note(390, '30일 × 1440분 × 0.001 = 43.2분, × 0.000001 = 2.6초', u, 2.3); }

  // ───────── 3. LiteLLM Router ─────────
  const DEP = [['primary', 'openai/gpt-4o', 'timeout 10', INK], ['backup-claude', 'anthropic/claude-3-5-sonnet', '다른 벤더', ACC], ['backup-azure', 'azure/gpt-4o', '같은 모델 · 다른 인프라', INFO]];
  function deps(c, n, hi) { DEP.slice(0, n).forEach(([a, b, d, col], i) => { const y = 70 + i * 92, s = c.k === i ? pop(c.u, 0.2) : 1, on = hi === i;
      card(220, y, 380, 76, { rx: 12, stroke: on ? BAD : col, sw: on ? 3 : 2, s, fill: on ? BADBG : PANEL });
      mono(48, y - 8, 'model_name', { 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); mono(160, y - 8, '"' + a + '"', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: clamp(s) });
      mono(48, y + 20, b, { 'font-size': 14.5, opacity: clamp(s) }); tx(392, y + 20, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: clamp(s) }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { deps(c, k + 1);
      if (k === 0) { card(760, 170, 280, 120, { rx: 12, stroke: GRID, s: pop(u, 0.8) }); mono(640, 145, 'router.acompletion(', { 'font-size': 14.5, opacity: fade(u, 1.0) });
        mono(660, 175, 'model="primary")', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) }); tx(640, 210, '코드는 이름만 부른다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) });
        note(395, '실제 모델은 설정에서 갈아 끼운다', u, 2.0); return; }
      if (k === 1) { tx(640, 60, '같은 이름으로 넣으면?', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.6) });
        card(700, 120, 130, 44, { rx: 8, text: 'primary', mono: true, fs: 15, stroke: WARN, s: pop(u, 0.8) }); card(880, 90, 100, 36, { rx: 8, text: 'gpt-4o', mono: true, fs: 14, stroke: GRID, s: pop(u, 0.9) }); card(880, 150, 100, 36, { rx: 8, text: 'claude', mono: true, fs: 14, stroke: GRID, s: pop(u, 1.0) });
        for (let i = 0; i < 6; i++) dot([[765, 120], [830, i % 2 ? 150 : 90]], seg(u, 1.0 + i * 0.22, 1.4 + i * 0.22), WARN, 6);
        tx(640, 210, '평소 트래픽도 반씩 나뉜다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
        tx(640, 236, '순서를 원하면 이름을 나눈다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
      tx(640, 340, 'Azure의 gpt-4o는 프롬프트를', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); tx(640, 366, '안 고쳐도 되는 가장 싼 보험이다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    if (k === 3) { el('rect', { x: 60, y: 40, width: 840, height: 300, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(80, 70, 'Router(', { 'font-size': 16, 'font-weight': 800 });
      [['primary', INK], ['backup-claude', ACC], ['backup-azure', INFO]].forEach(([n, col], i) => { const x = 200 + i * 270; card(x, 130, 210, 48, { rx: 24, text: n, mono: true, fs: 15, stroke: col, color: col, s: pop(u, 0.2 + i * 0.3) });
        if (i < 2) grow(x + 108, 130, x + 162, 130, seg(u, 0.5 + i * 0.3, 0.8 + i * 0.3), MUT); });
      mono(480, 186, 'fallbacks = [{"primary": ["backup-claude", "backup-azure"]}]', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      [['num_retries=2', '넘기기 전 재시도'], ['timeout=15', '전체 한도']].forEach(([a, b], i) => { mono(110, 240 + i * 40, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2 + i * 0.2) }); tx(290, 240 + i * 40, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2 + i * 0.2) }); });
      clock(560, 260, 24, E(u, 1.6, 2.6), WARN); mono(600, 255, 'cooldown_time=60', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) }); tx(600, 280, '실패한 곳은 1분간 건너뛴다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      note(390, 'cooldown이 circuit breaker 노릇을 한다', u, 2.2); return; }
    if (k === 4) { deps(c, 3, u > 1.0 ? 0 : null); mono(630, 50, 'acompletion(model="primary")', { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      for (let i = 0; i < 3; i++) { const a = 0.2 + i * 0.3; dot([[620, 90], [420, 70]], seg(u, a, a + 0.25), ACC, 6); if (u > a + 0.25) cross(440 - i * 22, 40, 7, 1); }
      dot([[620, 120], [420, 162]], seg(u, 1.2, 1.6), ACC, 7); check(430, 132, 11, pop(u, 1.7));
      tx(640, 160, '처음 + 재시도 2번 실패', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.1) });
      tx(640, 190, '→ backup-claude 성공', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(640, 300, '호출부에 try/except가 없다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.1) }); return; }
    ['서비스 A', '서비스 B', '서비스 C'].forEach((n, i) => { const y = 90 + i * 110; card(110, y, 140, 50, { rx: 10, text: n, fs: 15, stroke: GRID, s: pop(u, 0.1 + i * 0.15) }); dot([[180, y], [380, 200]], seg(u, 0.5 + i * 0.2, 1.1 + i * 0.2), ACC, 6); });
    card(470, 200, 180, 90, { rx: 14, text: 'LiteLLM\nproxy :4000', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.3) });
    ['비용·quota', '팀별 key', '감사 로그'].forEach((n, i) => pill(470, 290 + i * 40, n, INFO, pop(u, 1.4 + i * 0.25), { fs: 14 }));
    ['OpenAI', 'Anthropic', 'Azure'].forEach((n, i) => { const y = 90 + i * 110; card(820, y, 150, 50, { rx: 10, text: n, fs: 15, stroke: INK, s: pop(u, 0.8 + i * 0.15) }); grow(562, 200, 742, y, seg(u, 0.9 + i * 0.15, 1.3 + i * 0.15), MUT); });
    note(410, '모델 교체가 코드 배포가 아니라 설정 작업이 된다', u, 2.3); }

  // ───────── 4. Degraded mode ─────────
  const RUNG = [['1. 비슷한 질문의 캐시 답', 'semantic_cache · threshold 0.85', GOOD], ['2. 환불 · 취소 · 긴급?', '키워드 분기', WARN], ['3. 큐에 접수', '티켓 발급', INFO]];
  function ladder(c, on) { const { u } = c; RUNG.forEach(([a, b, col], i) => { const y = 120 + i * 100, hot = on === i, past = on > i;
      card(200, y, 300, 70, { rx: 12, stroke: hot ? col : GRID, sw: hot ? 3 : 1.5, fill: hot ? SOFT : PANEL });
      tx(66, y - 4, a, { 'font-size': 16, 'font-weight': 700, fill: past ? OFF : INK }); tx(66, y + 20, b, { 'font-size': 13.5, fill: MUT });
      if (past) cross(330, y, 10, 1); });
    mono(200, 50, 'degraded_response(question)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['greeting', '잠시 후 다시 시도해주세요'], ['fallback', '약 30분 내 복구 예정입니다'], ['urgent', '080-xxx-xxxx (24시간 상담)'], ['queue', '접수했습니다. 티켓 번호: {ticket}']].forEach(([a, b], i) => {
        const y = 70 + i * 74, s = seg(u, 0.2 + i * 0.3, 0.6 + i * 0.3); if (s <= 0) return;
        el('rect', { x: 120, y: y - 28, width: 720, height: 58, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 1.8, opacity: s });
        mono(140, y + 6, a, { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: s }); tx(290, y + 6, b, { 'font-size': 15.5, opacity: s }); });
      note(390, 'LLM 없이 답할 재료를 평소에 검토받아 둔다', u, 1.9); return; }
    if (k < 5) ladder(c, k <= 3 ? k - 1 : 2);
    if (k === 1) { dot([[200, 70], [200, 85]], seg(u, 0.1, 0.4), ACC, 7); grow(352, 120, 470, 120, seg(u, 0.5, 0.9), GOOD);
      card(700, 150, 420, 130, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 0.9) }); tx(510, 120, '(지난번 비슷한 질문의 답)', { 'font-size': 15, opacity: fade(u, 1.1) });
      tx(510, 160, '⚠ 시스템 점검 중이라 캐시된 답변입니다.', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.4) }); mono(510, 196, 'source: cache_degraded', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      sub(700, 250, 'embedding도 로컬 모델로 · 벤더가 다운이니까', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 2) { mono(560, 60, '"주문 환불하고 싶어요"', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) }); grow(352, 220, 470, 220, seg(u, 0.5, 0.9), WARN);
      card(700, 230, 420, 90, { rx: 12, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 0.9) }); tx(510, 222, '긴급한 문의는 080-xxx-xxxx', { 'font-size': 15.5, opacity: fade(u, 1.1) }); tx(510, 248, '(24시간 상담)로 연락 주세요.', { 'font-size': 15.5, opacity: fade(u, 1.1) });
      mono(700, 304, 'source: static_urgent', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      note(400, '돈이 걸린 문의는 자동 안내로 끝내지 않고 사람에게 넘긴다', u, 2.0); return; }
    if (k === 3) { grow(352, 320, 470, 320, seg(u, 0.4, 0.8), INFO);
      card(700, 320, 420, 90, { rx: 12, stroke: INFO, sw: 2, fill: INFOBG, s: pop(u, 0.8) }); tx(510, 312, '문의를 접수했습니다. 복구 후 우선 답변드리겠습니다.', { 'font-size': 14.5, opacity: fade(u, 1.0) });
      mono(510, 340, '티켓 번호: T20250102030405678901', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) });
      sub(700, 230, '티켓 모양은 실행 확인 (시각 2025-01-02 03:04:05 예시)', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 4) { mono(560, 60, 'LPUSH pending_questions', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      for (let i = 2; i >= 0; i--) { const y = 100 + i * 36, a = i === 0 ? E(u, 0.3, 1.0) : 1; card(720, y + (1 - a) * -30, 400, 30, { rx: 6, stroke: i ? GRID : INFO, sw: i ? 1.5 : 2.5, op: a }); }
      [['ticket', '"T2025…"'], ['question', '"…"'], ['ts', 'isoformat()'], ['user_id', 'current_user_id()']].forEach(([a, b], i) => { mono(540, 230 + i * 30, a, { 'font-size': 15, 'font-weight': 700, fill: i === 3 ? ACC : INK, opacity: fade(u, 1.0 + i * 0.2) }); mono(660, 230 + i * 30, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0 + i * 0.2) }); });
      tx(540, 370, 'user_id가 있어야 복구 후 누구에게 보낼지 안다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // 같은 장애, 다른 화면
    [['Error 502', BAD, BADBG, 260, '무엇을 해야 할지 모른다'], ['곧 복구됩니다\n접수번호 T123', GOOD, GOODBG, 700, '기다리면 된다는 걸 안다']].forEach(([a, col, bg, x, d], i) => {
      browser(x, 180, 300, 200, null, { s: pop(u, 0.2 + i * 0.5), stroke: col }); card(x, 195, 240, 90, { rx: 10, text: a, fs: 18, color: col, fill: bg, stroke: col, s: pop(u, 0.4 + i * 0.5) });
      mid(x, 320, d, { 'font-size': 15.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.5) }); });
    note(390, '장애 시간은 같아도 받아들이는 무게가 다르다', u, 2.1); }

  // ───────── 5. Chaos engineering ─────────
  const SIM = { n: 10000, oaFail: 1023, clOk: 978, dg: 45 };   // seed 0 시뮬레이션 (실행 확인)
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['CHAOS_MODE = false', 'prod', false, 150], ['CHAOS_MODE = true', 'staging', true, 300]].forEach(([a, b, on, y], i) => { const s = pop(u, 0.2 + i * 0.6);
        el('rect', { x: 100, y: y - 22, width: 76, height: 44, rx: 22, fill: on ? ACC : OFF, opacity: clamp(s) }); el('circle', { cx: on ? 154 : 122, cy: y, r: 17, fill: PANEL, opacity: clamp(s) });
        mono(200, y + 6, a, { 'font-size': 17, 'font-weight': 800, fill: on ? ACC : MUT, opacity: clamp(s) }); tx(200, y + 32, on ? '주입한다' : '함수가 바로 return · 운영 영향 없음', { 'font-size': 14.5, fill: MUT, opacity: clamp(s) }); });
      [['OPENAI_FAIL_RATE', '0.1'], ['CLAUDE_FAIL_RATE', '0.05'], ['LATENCY_MS', '5000']].forEach(([a, b], i) => { mono(600, 130 + i * 50, a, { 'font-size': 15, opacity: fade(u, 1.4 + i * 0.2) }); mono(900, 130 + i * 50, b, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: WARN, opacity: fade(u, 1.4 + i * 0.2) }); });
      note(395, '기본값을 꺼 두면 주입 코드가 prod에 들어가도 안전하다', u, 2.2); return; }
    if (k === 1) { [['"openai"', 0.1, WARN], ['"claude"', 0.05, WARN], ['"azure" (등록 안 됨)', 0, MUT]].forEach(([n, r, col], i) => { const y = 90 + i * 80;
        mono(80, y + 6, n, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) }); hbar(380, y - 9, 400, r, 0.1, { u: E(u, 0.4 + i * 0.3, 1.2 + i * 0.3), col, text: String(r), h: 22 }); });
      mono(80, 340, 'rate = rates.get(provider, 0)', { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      note(395, '1순위를 더 자주 죽여야 fallback 경로가 실제로 밟힌다', u, 2.1); return; }
    if (k === 2) { const pick = Math.floor(t * 3) % 3;
      card(160, 200, 120, 120, { rx: 18, stroke: INK, sw: 3, s: pop(u, 0.2) }); [[-28, -28], [28, 28], [0, 0], [28, -28], [-28, 28]].forEach(([dx, dy]) => el('circle', { cx: 160 + dx, cy: 200 + dy, r: 8, fill: INK, opacity: fade(u, 0.3) }));
      mono(160, 290, 'random.choice', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
      [['timeout', '5초 지연 뒤 APITimeoutError'], ['5xx', 'APIStatusError 503'], ['429', 'RateLimitError']].forEach(([a, b], i) => { const y = 100 + i * 100, on = pick === i && u > 0.8;
        card(600, y, 440, 70, { rx: 12, stroke: on ? BAD : GRID, sw: on ? 3 : 1.5, fill: on ? BADBG : PANEL, s: pop(u, 0.5 + i * 0.2) });
        mono(400, y + 6, a, { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6 + i * 0.2) }); tx(500, y + 6, b, { 'font-size': 15, opacity: fade(u, 0.6 + i * 0.2) });
        grow(222, 200, 378, y, seg(u, 0.6 + i * 0.2, 1.0 + i * 0.2), MUT); });
      clock(860, 100, 16, E(u, 1.0, 2.6), WARN);
      note(400, '한 종류만 주입하면 그 한 종류에만 강한 코드가 된다', u, 2.2); return; }
    if (k === 3) { const g = E(u, 0.2, 2.2), X0 = 140, W = 700, Ws = (v) => W * v / SIM.n;
      tx(X0, 50, 'staging 10,000건 시뮬레이션 (seed 0, 실행 결과)', { 'font-size': 15, 'font-weight': 700 });
      const rows = [['OpenAI 호출', SIM.n, INK, 0.2], ['OpenAI 실패 → Claude', SIM.oaFail, WARN, 0.8], ['Claude 성공', SIM.clOk, GOOD, 1.4], ['Claude도 실패 → degraded', SIM.dg, BAD, 1.9]];
      rows.forEach(([n, v, col, a], i) => { const y = 90 + i * 70, s = E(u, a, a + 0.6);
        tx(X0, y, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: s });
        el('rect', { x: X0, y: y + 10, width: Math.max(3, Ws(v) * s), height: 24, rx: 5, fill: col, opacity: 0.85 });
        mono(X0 + Math.max(3, Ws(v)) + 10, y + 28, Math.round(v * s).toLocaleString('en-US'), { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s }); });
      note(395, '기대값 0.1 × 0.05 = 0.5% · degraded 경로까지 실제로 밟힌다', u, 2.3); return; }
    if (k === 4) { [['staging', '항상 켬 · 10%', ACC, 1], ['prod', '끔', MUT, 0], ['canary', '1% 트래픽에만', WARN, 0.01]].forEach(([a, b, col, f], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
        card(x, 160, 250, 160, { rx: 14, stroke: col, sw: 2.5, s }); mid(x, 120, a, { 'font-size': 20, 'font-weight': 800, fill: col, opacity: clamp(s) }); mid(x, 150, b, { 'font-size': 15, opacity: clamp(s) });
        for (let j = 0; j < 20; j++) el('rect', { x: x - 100 + (j % 10) * 20, y: 180 + Math.floor(j / 10) * 20, width: 16, height: 16, rx: 3, fill: (i === 0 && j < 2) || (i === 2 && j === 0 && u > 1.6) ? BAD : SOFT, opacity: clamp(s) }); });
      sub(480, 290, '칸 하나 = 요청 5% · canary 칸은 그 일부만', fade(u, 1.8), { 'font-size': 14 });
      note(380, 'staging에서 늘 켜 두면 fallback이 죽은 채로 배포되지 않는다', u, 2.2); return; }
    meters(60, 120, 840, [
      { name: 'fallback_triggered', val: Math.round(tween(0, SIM.oaFail, u)).toLocaleString('en-US') },
      { name: 'fallback_success_rate', val: (tween(0, SIM.clOk / SIM.oaFail * 100, u)).toFixed(1) + '%', good: true },
      { name: 'degraded_responses', val: String(Math.round(tween(0, SIM.dg, u))) },
      { name: 'user_visible_errors', val: '0', good: true },
    ], { h: 90 });
    sub(480, 250, '값은 위 시뮬레이션에서 나온 것', fade(u, 1.0), { 'font-size': 14.5 });
    note(320, '사용자에게 보인 에러가 0 이어야 정상이다', u, 1.8, GOOD); }

  const quiz = [
    { q: '외부 장애 중 코드 주석이 가장 흔하다고 꼽은 유형은 무엇인가?',
      o: ['완전 다운 (Total outage)', '일부 요청만 5xx로 실패 (Elevated 5xx)', '특정 모델만 다운'], a: 1,
      why: '완전 다운은 드물지만 치명적이고, 일부 요청만 실패하는 경우가 가장 흔하다. 절반만 죽는 쪽이 오히려 잡기 어렵다.' },
    { q: '99.9% 가용성 벤더 둘을 독립이라 보고 OR로 묶으면 한 달 다운 시간은 얼마인가?',
      o: ['약 2.6초', '약 4.3분', '약 21.6분'], a: 0,
      why: '둘이 동시에 죽을 확률은 0.001 × 0.001 = 0.000001이다. 30일 × 86,400초 × 0.000001 ≈ 2.6초다.' },
    { q: 'LiteLLM에 OpenAI와 Claude를 같은 model_name "primary"로 넣으면 평소에 어떻게 되는가?',
      o: ['OpenAI만 쓰다가 실패할 때만 Claude로 간다', '설정 오류로 Router가 뜨지 않는다', '평소 트래픽도 두 배포에 나뉘어 간다'], a: 2,
      why: '같은 이름은 부하 분산 묶음이다. 1순위 뒤에만 쓰려면 backup-claude처럼 이름을 달리 짓고 fallbacks에 순서를 적는다.' },
    { q: '모든 벤더가 죽었을 때 "환불" 문의는 어떻게 처리하는가?',
      o: ['24시간 상담 번호로 바로 안내한다', '캐시 답을 먼저 찾는다', '티켓만 주고 기다리게 한다'], a: 0,
      why: '캐시 답이 없으면 환불·취소·긴급 키워드를 먼저 본다. 돈이 걸린 문의는 사람에게 넘긴다.' },
    { q: 'OpenAI 실패율 10%, Claude 실패율 5%로 주입하면 degraded까지 가는 비율의 기대값은?',
      o: ['15%', '0.5%', '5%'], a: 1,
      why: '둘 다 실패해야 degraded로 간다. 0.1 × 0.05 = 0.005이고, seed 0으로 10,000건을 돌리면 45건이 나왔다.' },
  ];

  const summary = [
    'OpenAI 하나만 부르면 그 경로가 단일 장애점이 된다. 부분 장애는 매달 한두 번 있었다.',
    'OpenAI가 실패하면 Claude를 부른다. 99.9% 벤더 둘이 독립이면 월 다운 시간이 43분에서 2.6초가 된다.',
    'LiteLLM은 같은 이름끼리 부하를 나누고, fallbacks에 적은 순서로 다른 이름의 모델로 넘어간다.',
    '모두 죽으면 캐시 답, 긴급 안내, 티켓 접수 순으로 답한다. staging에서 장애를 주입해 이 경로를 늘 확인한다.',
  ];
  const review = [
    { q: 'OpenAI 장애 날 fallback 코드가 있었는데도 사용자에게 502가 보였다. 먼저 의심할 것은?',
      o: ['Claude 모델 품질이 낮았다', 'fallback 경로를 평소에 한 번도 밟아 보지 않았다', 'timeout을 10초로 잡았다'], a: 1,
      why: '한 번도 실행되지 않은 except 블록은 깨진 채 배포되기 쉽다. staging에 10% 주입을 상시 켜 두면 이런 일을 미리 잡는다.' },
    { q: 'LiteLLM을 붙인 뒤 Claude 비용이 평소에도 늘었다. 설정에서 가장 먼저 볼 곳은?',
      o: ['cooldown_time 값', 'num_retries 값', '두 배포의 model_name이 같은지'], a: 2,
      why: '같은 이름이면 장애가 없어도 트래픽이 나뉜다. 순서 있는 fallback은 이름을 나누고 fallbacks 목록으로 만든다.' },
    { q: '모든 벤더가 30분 다운됐는데 문의가 사라졌다는 불만이 나왔다. 빠진 것은?',
      o: ['질문과 user_id를 큐에 넣고 티켓을 주는 단계', '정적 인사 문구', 'OpenAI timeout 설정'], a: 0,
      why: '답할 수 없을 때도 질문을 Redis 큐에 남기고 티켓을 주면 요청이 사라지지 않는다. user_id가 있어야 복구 후 답을 보낼 수 있다.' },
  ];

  R.page({ title: 'LLM Fallback 신뢰성', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
