/* II-2-1 프롬프트와 메시지 구조 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * messages 배열은 페이지 STEPS 의 messages 데이터를 그대로 그린다. 응답 문장은 페이지에 적힌 예시 출력이다(LLM 호출 없음).
 * 토큰 수(33 → 69, 예시 22)는 메시지 본문을 tiktoken o200k_base 로 직접 센 값이다(역할·구분자 토큰 제외). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const RC = { system: INFO, user: ACC, assistant: GOOD };
  const RBG = { system: INFOBG, user: ACCBG, assistant: GOODBG };
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const AX = 40, AW = 520;   // messages 배열 자리

  // 메시지 한 장: 역할 알약 + 내용 (여러 줄 가능). 높이를 돌려준다
  function msgCard(x, y, w, m, o) { o = o || {}; const lines = String(m.content).split('\n'), h = 18 + lines.length * 22, col = RC[m.role] || MUT;
    const g = R.G(o.dx || 0, o.dy || 0, 1, o.op ?? 1);
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.hot ? RBG[m.role] : PANEL, stroke: o.dash ? GRID : col, 'stroke-width': o.hot ? 2.6 : 1.6, 'stroke-dasharray': o.dash ? '5 5' : null }, g);
    el('rect', { x: x + 8, y: y + 8, width: 92, height: 24, rx: 12, fill: col }, g);
    tx(x + 54, y + 25, m.role, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', class: 'mono' }, g);
    lines.forEach((ln, i) => tx(x + 112, y + 26 + i * 22, cut(ln, (o.max || 30) - (m.tag ? 5 : 0)), { 'font-size': 14, fill: INK }, g));
    if (m.tag) tx(x + w - 10, y + 26, m.tag, { 'font-size': 13.5, 'font-weight': 700, fill: m.tag === '실제 질문' || m.tag === '실제' ? ACC : MUT, 'text-anchor': 'end' }, g);
    return h; }
  // 배열 전체: 새 메시지는 오른쪽에서 미끄러져 들어온다
  function msgArray(c, msgs, o) { o = o || {}; const { u } = c, y0 = o.y || 70, gap = o.gap || 12;
    mono(AX, y0, 'messages = [', { 'font-size': 15, 'font-weight': 700 });
    let y = y0 + 14 + (o.lead || 0), ni = 0;
    msgs.forEach((m, i) => { const isNew = m.isNew && o.animate !== false && !(o.skipNew && o.skipNew(m, i)), d = isNew ? seg(u, 0.3 + ni * 0.35, 1.1 + ni * 0.35) : 1; if (isNew) ni++;
      if (o.hide && o.hide(m, i)) return;
      const h = msgCard(AX + 18, y, AW - 18, m, { dx: (1 - E(d, 0, 1)) * 380, op: d > 0 ? 1 : 0, hot: o.hot ? o.hot(m, i) : isNew, max: o.max });
      if (o.idx !== false) mono(AX + 4, y + 26, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      y += h + gap + (m.tag && msgs[i + 1] && msgs[i + 1].tag !== m.tag ? 10 : 0); });
    mono(AX, y + 14, ']', { 'font-size': 15, 'font-weight': 700 });
    mono(AX + AW, y + 14, 'len = ' + msgs.filter((m, i) => !(o.hide && o.hide(m, i))).length, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', fill: ACC });
    return y; }
  function llm(cx, cy, s, o) { o = o || {}; card(cx, cy, 130, 70, { rx: 12, text: o.text || 'LLM', fs: 18, fw: 800, stroke: o.stroke || INK, s }); }
  function bubble(x, y, w, s, op, o) { o = o || {}; const lines = s.split('\n'), h = 16 + lines.length * 21;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || GOODBG, stroke: o.stroke || GOOD, 'stroke-width': 1.8, opacity: op });
    lines.forEach((ln, i) => tx(x + 14, y + 24 + i * 21, ln, { 'font-size': 14, opacity: op, fill: o.color || INK }));
    return h; }

  // ---------- 1. 단일 메시지 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    const inArr = (b.messages || []).filter((m) => m.role !== 'assistant');
    if (k === 0) { card(300, 150, 260, 60, { rx: 10, text: 'client = OpenAI()', fs: 16, mono: true, s: pop(u, 0.3) });
      pill(300, 250, 'OPENAI_API_KEY', WARN, pop(u, 0.9), { mono: true, fs: 14 }); grow(300, 234, 300, 184, E(u, 1.2, 1.7), WARN);
      sub(300, 290, '키는 환경 변수에서 읽는다', fade(u, 1.5));
      mono(620, 150, 'messages = [ ]', { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) }); note(620, 182, '아직 메시지 0개', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 1) { [['system', '무대 설정 · 페르소나'], ['user', '사용자 입력'], ['assistant', '모델 응답']].forEach(([r, d], i) => { const y = 120 + i * 80, s = pop(u, 0.2 + i * 0.3);
        card(190, y, 150, 40, { rx: 20, text: r, fs: 16, mono: true, fill: RC[r], stroke: 'none', color: PANEL, s }); note(290, y + 6, d, fade(u, 0.4 + i * 0.3)); });
      el('rect', { x: 100, y: 180, width: 420, height: 80, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 1.6) });
      note(560, 226, '이번엔 user 하나만 쓴다', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 2) { mono(AX, 90, 'client.chat.completions.create(', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(AX + 30, 124, 'model="gpt-4o-mini",', { 'font-size': 16, fill: ACC, opacity: fade(u, 0.6) });
      mono(AX + 30, 158, 'messages=[ … ],', { 'font-size': 16, opacity: fade(u, 1.0) });
      el('rect', { x: AX + 130, y: 140, width: 110, height: 26, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.4) });
      mono(AX, 192, ')', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
      llm(760, 160, pop(u, 1.4)); return; }
    const y = msgArray(c, inArr, { y: 90 });
    llm(760, 120, 1);
    if (k === 3) { note(AX, y + 60, '{role, content} 하나가 이번 호출의 전부다', fade(u, 1.4)); return; }
    if (k === 4) { dot([[AX + AW, 120], [695, 120]], seg(u, 0.2, 0.9), ACC, 7);
      const a = (b.messages || []).find((m) => m.role === 'assistant');
      grow(760, 156, 760, 196, E(u, 1.0, 1.4), GOOD);
      bubble(600, 206, 330, '파스타를 만들려면 먼저 물을 끓이고\n소금을 넣습니다...', fade(u, 1.4));
      mono(600, 290, 'choices[0].message.content', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(765, 318, '응답은 배열 밖에 있다 · 예시 출력', fade(u, 2.0)); return; }
    // k5
    const op = 1 - E(u, 0.4, 1.4) * 0.75;
    bubble(600, 206, 330, '파스타를 만들려면 먼저 물을 끓이고\n소금을 넣습니다...', op);
    cross(765, 236, 20, pop(u, 1.0));
    note(600, 300, '배열에 넣지 않으면 다음 호출엔 없다', fade(u, 1.4), { fill: BAD });
    ['톤이 매번 다르다', '이전 대화를 모른다', '형식이 제멋대로'].forEach((s, i) => pill(140 + i * 200, 360, s, WARN, pop(u, 1.8 + i * 0.15), { fs: 13.5 })); }

  // ---------- 2. system 메시지 ----------
  function s2(t, c) { const { k, u } = c, b = c.beat, M = b.messages || [];
    if (k <= 1) { const y = msgArray(c, M, { y: 80, lead: k === 1 ? 56 : 0, animate: false });
      if (k === 1) { el('rect', { x: AX + 18, y: 94, width: AW - 18, height: 44, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
        tx(AX + 36, 122, '0번 자리 = system', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5) });
        R.person(760, 160, '사용자', { op: fade(u, 1.0) }); cross(800, 150, 12, pop(u, 1.5));
        note(660, 250, '사용자 화면엔 안 보이고', fade(u, 1.6)); note(660, 276, 'LLM에게만 전달된다', fade(u, 1.9), { fill: INFO }); }
      else note(AX, 260, '클라이언트는 그대로, 배열 첫 칸만 바뀐다', fade(u, 0.6), { fill: MUT });
      return; }
    const y = msgArray(c, M, { y: 80, max: 30, hot: (m) => (k === 5 && m.role === 'system') || (k === 3 && m.role === 'user') || (k === 2 && m.isNew) });
    if (k === 2) { note(AX, y + 56, '직업과 말투를 문장으로 적는다', fade(u, 1.6)); return; }
    if (k === 3) { note(620, 130, '질문은 그대로', fade(u, 0.4)); note(620, 160, '앞의 system 때문에', fade(u, 0.8)); note(620, 190, '해석이 달라진다', fade(u, 1.2), { fill: INFO }); return; }
    if (k === 4) { note(AX, 250, 'system 없음', fade(u, 0.2), { fill: MUT });
      bubble(AX, 262, 420, '파스타를 만들려면 먼저 물을 끓이고...', fade(u, 0.4), { fill: SOFT, stroke: GRID });
      note(AX, 340, 'system 있음', fade(u, 1.0), { fill: INFO });
      bubble(AX, 352, 520, 'Buongiorno! 파스타는 이탈리아의 영혼입니다. 먼저 큰 냄비에…', fade(u, 1.2));
      sub(800, 404, '예시 출력', fade(u, 1.4)); return; }
    if (k === 5) { [['페르소나', '직업 · 말투 · 전문 분야'], ['규칙', '해야 할 것 / 하지 말 것'], ['포맷', '출력 구조 (JSON 등)']].forEach(([a, d], i) => { const yy = 250 + i * 50, s = pop(u, 0.3 + i * 0.35);
        card(AX + 70, yy, 120, 38, { rx: 19, text: a, fs: 15, fill: INFO, stroke: 'none', color: PANEL, s }); note(AX + 150, yy + 6, d, fade(u, 0.5 + i * 0.35)); });
      return; }
    [['LLM이 무시할 수도 있다', BAD], ['길수록 매 호출 토큰 비용', WARN], ['모델마다 처리 방식이 다르다', WARN]].forEach(([s, col], i) => { const yy = 250 + i * 50;
      el('circle', { cx: AX + 20, cy: yy, r: 12, fill: col, opacity: fade(u, 0.3 + i * 0.35) }); mono(AX + 20, yy + 5, '!', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.35) });
      note(AX + 44, yy + 6, s, fade(u, 0.4 + i * 0.35)); });
    note(620, 270, '강제력 100%가 아니다', fade(u, 1.6), { fill: BAD, 'font-size': 17 }); }

  // ---------- 3. 대화 이력 ----------
  const TOK = [27, 6, 30, 6];   // 메시지 본문 토큰 (o200k)
  function tokBar(n, prevN, u, x, y) { const v = tween(prevN, n, u); el('rect', { x, y, width: 220, height: 20, rx: 4, fill: SOFT });
    el('rect', { x, y, width: 220 * v / 80, height: 20, rx: 4, fill: ACC }); mono(x + 230, y + 16, Math.round(v) + ' 토큰', { 'font-size': 14.5, 'font-weight': 800 }); }
  function s3(t, c) { const { k, u } = c, b = c.beat, M = b.messages || [], P = (c.prev && c.prev.messages) || M;
    const y = msgArray(c, M, { y: 70, max: 30, hot: (m) => (k === 8 && m.role === 'system') || (m.isNew && [2, 3, 6].includes(k)) });
    const sumT = (L) => L.reduce((a, m, i) => a + (TOK[i] || 0), 0);
    llm(780, 120, 1, { text: 'LLM' });
    if (k === 0) { note(620, 230, 'messages를 변수로 빼서', fade(u, 0.5)); note(620, 258, '계속 쌓아 간다', fade(u, 0.9), { fill: ACC }); return; }
    if (k === 1) { [0, 1].forEach((i) => { const s = clamp((u - 0.3 - i * 0.9) * 2); if (s <= 0) return;
        fly(AX + AW, 140 + i * 30, 715, 120, seg(u, 0.3 + i * 0.9, 1.1 + i * 0.9), '[ 전체 ' + M.length + '개 ]', { fill: ACC }); });
      el('rect', { x: 720, y: 180, width: 120, height: 34, rx: 6, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 4' }); tx(780, 202, '기억 칸 없음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      note(600, 260, '호출할 때마다 system부터 전부 다시 보낸다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 4) { for (let i = 0; i < 8; i++) dot([[AX + AW, 150], [715, 120]], ((u * 0.9 + i / 8) % 1) * (u < 1.6 ? 1 : 0), ACC, 5);
      grow(780, 156, 780, 200, E(u, 1.5, 1.9), GOOD);
      bubble(600, 210, 340, '방금 삶은 면에는 토마토 소스가\n잘 어울립니다...', fade(u, 1.9));
      sub(770, 300, '"소스"를 파스타 소스로 읽었다 · 예시 출력', fade(u, 2.2)); }
    if (k === 5) { note(600, 220, '본문 토큰 (o200k)', fade(u, 0.2), { fill: MUT, 'font-size': 14 });
      mono(600, 250, '1번째 호출', { 'font-size': 14, opacity: fade(u, 0.3) }); tokBar(33, 0, u, 600, 260);
      mono(600, 310, '2번째 호출', { 'font-size': 14, opacity: fade(u, 0.9) }); tokBar(69, 0, clamp(u - 0.8, 0, 3), 600, 320);
      note(600, 380, '모델에 메모리는 없다 · 이력 = 토큰 비용', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 6) { msgCard(AX + 18, y - 4, AW - 18, { role: 'assistant', content: 'response.choices[0].message.content' }, { dash: true, op: fade(u, 0.8) });
      mono(AX, y + 70, 'messages.append({...})', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    if (k === 7) { [['슬라이딩 윈도우', '최근 N턴만'], ['요약 압축', '오래된 대화 → 한 줄'], ['RAG', '관련 부분만 회수']].forEach(([a, d], i) => { const yy = 230 + i * 56, s = pop(u, 0.3 + i * 0.35);
        card(770, yy, 280, 46, { rx: 10, stroke: ACC, s }); tx(650, yy - 2, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); tx(650, yy + 17, d, { 'font-size': 13.5, fill: MUT, opacity: s }); }); return; }
    if (k === 8) { lock(AX + AW + 26, 96, true, INFO, pop(u, 0.3));
      mono(600, 240, 'messages[:1] + messages[-10:]', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) });
      note(600, 274, '무엇을 자르든 system은 남긴다', fade(u, 1.3)); note(600, 300, '지우면 페르소나가 사라진다', fade(u, 1.7), { fill: BAD }); } }

  // ---------- 4. Few-shot ----------
  function s4(t, c) { const { k, u } = c, b = c.beat, M = b.messages || [];
    if (k === 0) { const P = (c.prev && c.prev.messages) || [];
      P.forEach((m, i) => msgCard(AX + 18, 84 + i * 52, AW - 18, m, { dx: -E(u, 0.2 + i * 0.1, 1.0 + i * 0.1) * 600, op: 1 - E(u, 0.2 + i * 0.1, 1.0 + i * 0.1) }));
      note(620, 180, '이번 작업: 리뷰 감정 분류', fade(u, 1.2), { 'font-size': 17, 'font-weight': 800 });
      ['positive', 'negative', 'neutral'].forEach((s, i) => pill(660 + i * 110, 230, s, [GOOD, BAD, MUT][i], pop(u, 1.6 + i * 0.15), { mono: true, fs: 13.5 })); return; }
    if (k === 1) { mono(AX, 90, 'messages = [', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      el('rect', { x: AX + 18, y: 104, width: AW - 18, height: 40, rx: 8, fill: 'none', stroke: INFO, 'stroke-dasharray': '6 5', 'stroke-width': 2, opacity: fade(u, 0.6) });
      tx(AX + 36, 130, '1) system 자리', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.8) }); return; }
    const y = msgArray(c, M, { y: 66, gap: 8, max: 28, animate: k <= 5, hot: (m) => (k === 8 && m.tag === '예시 2') || (k !== 8 && m.isNew) });
    if (k === 2) { note(620, 140, '무엇을 하는지만 적고', fade(u, 1.2)); note(620, 168, '형식은 예시로 보여 준다', fade(u, 1.5), { fill: INFO }); }
    if (k === 6 || k === 7 || k === 8) { const s = k === 6 ? pop(u, 0.8) : 1;
      grow(AX + AW + 4, y - 24, 610, y - 24, k === 6 ? E(u, 0.3, 0.8) : 1, GOOD);
      msgCard(616, y - 44, 300, { role: 'assistant', content: 'neutral' }, { op: s, hot: k === 6 });
      if (k === 6) { note(620, y + 20, '설명 없이 한 단어 · 예시 출력', fade(u, 1.4)); return; } }
    if (k === 5) { grow(AX + AW + 4, y - 24, 610, y - 24, E(u, 1.0, 1.4), GOOD); el('rect', { x: 616, y: y - 44, width: 300, height: 40, rx: 8, fill: 'none', stroke: GOOD, 'stroke-dasharray': '6 5', 'stroke-width': 2, opacity: fade(u, 1.2) });
      tx(766, y - 18, 'LLM이 이어 쓸 자리', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 7) { lock(640, 120, true, MUT, pop(u, 0.2)); note(670, 126, '가중치는 그대로', fade(u, 0.4));
      note(610, 180, '예시만으로 형식을 고정', fade(u, 0.9), { fill: ACC });
      note(610, 230, '예시 4개 = 매 호출 22토큰', fade(u, 1.4), { class: 'mono', 'font-size': 14.5 }); sub(745, 256, '본문 기준 · o200k 실측', fade(u, 1.6)); }
    if (k === 8) { ['다양하게', 'edge case 1개', '마지막 예시가 가장 세다'].forEach((s, i) => { const s2 = pop(u, 0.3 + i * 0.35); card(770, 120 + i * 56, 260, 42, { rx: 21, text: s, fs: 15, stroke: i === 2 ? WARN : ACC, color: i === 2 ? WARN : ACC, s: s2 }); });
      grow(640, 290, 565, 290, E(u, 1.4, 1.9), WARN); note(650, 330, 'recency bias', fade(u, 1.9), { fill: WARN, class: 'mono' }); } }

  // ---------- 5. 모범 프롬프트 ----------
  const PR = ['명시성', '제약', '예시', '포맷'];
  function s5(t, c) { const { k, u } = c, b = c.beat, M = b.messages || [];
    const doneOf = (L) => { const sy = L.find((m) => m.role === 'system'), n = sy ? sy.content.split('\n').length : 0; return [n >= 1, n >= 3, L.some((m) => m.tag === '예시'), n >= 4]; };
    const done = doneOf(M), was = doneOf((c.prev && c.prev.messages) || []);
    // 오른쪽 체크리스트
    PR.forEach((p, i) => { const y = 100 + i * 58, ok = done[i], newly = ok && !was[i];
      const s = k === 0 ? pop(u, 0.3 + i * 0.25) : 1;
      card(830, y, 180, 44, { rx: 10, stroke: ok ? GOOD : GRID, dash: ok ? null : '5 5', fill: ok ? GOODBG : PANEL, s });
      tx(800, y + 6, (i + 1) + '. ' + p, { 'font-size': 15, 'font-weight': 700, opacity: s, fill: ok ? GOOD : MUT, 'text-anchor': 'middle' });
      if (ok) check(895, y, 9, newly ? pop(u, 1.4) : 1); });
    if (k === 0) { note(AX, 200, '실무 프롬프트는 네 원칙을 모두 담는다', fade(u, 1.4), { 'font-size': 16 }); mono(AX, 240, 'messages = [ ]', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 7) { [['system에 다 욱여넣기', '우선순위가 흐려진다'], ['예시 5개 이상', '비용만 는다'], ['JSON을 말로만', '깨진 JSON이 온다'], ['"최선을 다해줘"', '잴 수 없다']].forEach(([a, d], i) => { const y = 100 + i * 70, s = pop(u, 0.2 + i * 0.3);
        card(AX + 250, y, 480, 54, { rx: 10, stroke: BAD, s }); cross(AX + 36, y, 10, s);
        tx(AX + 60, y - 3, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); tx(AX + 60, y + 18, d, { 'font-size': 13.5, fill: MUT, opacity: s }); }); return; }
    const y = msgArray(c, M, { y: 66, gap: 10, max: 34, hot: (m) => (k === 5 && m.role === 'system') || (k !== 5 && m.isNew) });
    if (k === 5) ['[페르소나]', '[규칙]', '[금지]', '[포맷]'].forEach((s, i) => mono(AX + AW - 10, 106 + i * 22, '← ' + ['누구', '반드시', '절대', '모양'][i], { 'font-size': 13.5, fill: INFO, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.25) }));
    if (k === 6) note(AX, y + 50, 'system → 예시 쌍 → 실제 질문 · 실제 질문은 항상 마지막', fade(u, 1.4), { 'font-size': 14.5 }); }

  const quiz = [
    { q: '맨몸 호출에서 받은 응답을 messages에 넣지 않으면 어떻게 되나?',
      o: ['서버가 대신 기억해 다음 호출에 붙여 준다', '다음 호출에서는 그 응답이 없던 일이 된다', '응답이 system 메시지로 바뀐다'], a: 1,
      why: '이번 호출이 가진 것은 배열에 넣은 메시지뿐이다. 응답을 다시 넣어야 다음 호출이 그 내용을 본다.' },
    { q: 'system 메시지는 배열 어디에 두고, 누가 보나?',
      o: ['맨 앞에 두고, LLM만 본다', '맨 끝에 두고, 사용자도 본다', '아무 데나 두고, 사용자만 본다'], a: 0,
      why: 'system은 0번 자리의 무대 설정이다. 사용자 화면에는 안 나오지만 모든 응답의 말투와 규칙을 정한다.' },
    { q: '멀티턴 대화에서 LLM이 이전 대화를 "기억"하는 방법은 무엇인가?',
      o: ['모델 안의 메모리에 저장한다', 'API 키별로 서버가 이력을 보관한다', '매 호출에 이전 user·assistant 메시지를 전부 다시 보낸다'], a: 2,
      why: 'LLM은 stateless다. 이 장 예에서 본문 토큰이 33에서 69로 늘듯, 이력을 다시 보내는 만큼 비용도 는다.' },
    { q: 'Few-shot에서 예시는 어떤 모양으로 넣나?',
      o: ['user 질문과 assistant 정답을 한 쌍씩', 'system 안에 정답 목록만', '실제 질문 뒤에 정답을 붙여서'], a: 0,
      why: 'user/assistant 쌍이 "이 질문엔 이렇게 답한다"를 보여 준다. 그래서 마지막 질문에 neutral 한 단어만 돌아온다.' },
    { q: '출력이 JSON이어야 할 때 "포맷" 원칙에 맞는 것은 무엇인가?',
      o: ['"보기 좋게 정리해줘"라고 쓴다', 'system에 키 이름까지 적고 예시 쌍으로 모양을 보여 준다', '예시를 10개 넣는다'], a: 1,
      why: 'JSON을 말로만 시키면 자주 깨진다. 키 이름을 명시하고 예시 한 쌍을 붙이면 형식이 고정된다.' },
  ];

  const summary = [
    'LLM 호출은 role과 content를 가진 메시지 배열 하나를 보내고 답을 받는 일이다.',
    '배열 맨 앞의 system 메시지가 페르소나와 규칙과 포맷을 정한다.',
    'LLM은 이전 호출을 기억하지 못해서, 멀티턴은 이력을 매번 다시 보내 흉내 낸다.',
    'user와 assistant 예시 쌍을 미리 넣으면 파인튜닝 없이 출력 형식을 고정할 수 있다.',
  ];
  const review = [
    { q: '챗봇이 두 번째 질문 "소스는?"에 파스타와 상관없는 답을 했다. 먼저 확인할 것은?',
      o: ['temperature 값', '두 번째 호출의 messages에 첫 질문과 응답이 들어 있는지', 'API 키가 맞는지'], a: 1,
      why: '이력을 다시 보내지 않으면 LLM은 "소스"가 무엇의 소스인지 알 수 없다. 앞의 user와 assistant 메시지를 붙여야 한다.' },
    { q: '이력이 길어져 최근 10개만 남기도록 잘랐더니 셰프 말투가 사라졌다. 원인은?',
      o: ['few-shot 예시가 부족해서', '모델이 바뀌어서', '자르면서 0번의 system 메시지까지 버려서'], a: 2,
      why: 'messages[-10:]만 남기면 맨 앞 system이 빠진다. messages[:1] + messages[-10:]처럼 system은 고정해 둔다.' },
    { q: '감정 분류 결과에 설명 문장이 섞여 나온다. 가장 먼저 해 볼 것은?',
      o: ['user/assistant 예시 쌍으로 한 단어 답을 보여 준다', 'system을 지운다', '질문을 배열 맨 앞으로 옮긴다'], a: 0,
      why: '예시 쌍이 형식을 가장 확실하게 전한다. 실제 질문은 그대로 마지막에 둔다.' },
  ];

  R.page({ title: 'messages 배열 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
