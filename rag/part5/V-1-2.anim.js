/* V-1-2 RAG 프롬프트 설계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 왼쪽: prompt 를 이루는 영역(system·형식·거절·예시·참고 자료·질문)이 쌓이는 모습 — beat 의 promptShape 를 읽는다.
 * 오른쪽: LLM 응답(모두 예시)과, 그 응답이 참고 자료의 사실 세 개를 담았는지 대조한 결과. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, grow, dot, check, cross } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 글을 폭 w 안에서 줄바꿈 (낱말 단위, 넘치면 글자 단위)
  function wrap(s, w, fs) { const out = []; let cur = '';
    String(s).split(/(\s+)/).forEach((wd) => { if (!wd) return;
      if (tw(cur + wd, fs) <= w) { cur += wd; return; }
      if (cur.trim()) out.push(cur.trim()); cur = '';
      if (tw(wd, fs) > w) { for (const ch of wd) { if (tw(cur + ch, fs) > w) { out.push(cur); cur = ''; } cur += ch; } } else cur = wd.trimStart(); });
    if (cur.trim()) out.push(cur.trim()); return out; }
  const clip = (lines, n) => (lines.length > n ? lines.slice(0, n - 1).concat([lines[n - 1].replace(/.{2}$/, '') + '…']) : lines);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- prompt 영역 쌓기 ----------
  const PX = 34, PW = 410, FS = 13.5, LH = 18;
  function sections(sh) { const out = [];
    out.push({ key: 'system', title: 'system · 지시', col: ACC, text: sh.system, role: 'system' });
    if (sh.format) out.push({ key: 'format', title: '[형식 규칙]', col: INFO, text: sh.format, sub: true });
    if (sh.refusal) out.push({ key: 'refusal', title: '[거절 · 출처 규칙]', col: WARN, text: sh.refusal, sub: true });
    (sh.fewshot || []).forEach((ex, i) => { out.push({ key: 'fq' + i, title: '예시 질문', col: INFO, text: ex.q, role: 'human' });
      out.push({ key: 'fa' + i, title: '예시 답 (3 bullet + 출처)', col: INFO, text: ex.a.split('\n')[0] + ' …', role: 'ai' }); });
    out.push({ key: 'context', title: '[참고 자료]', col: INK, text: sh.context, role: 'human' });
    out.push({ key: 'question', title: '[질문]', col: INK, text: sh.question, role: 'human', join: true });
    return out; }
  // show(key) → 0~1 나타남, o.hot 강조 키, o.roles 역할 이름표
  function promptStack(sh, show, o) { o = o || {}; let y = 34; const pos = {}, many = sections(sh).length > 5;
    tx(PX, 22, 'prompt', { 'font-size': 14, 'font-weight': 800, fill: MUT });
    sections(sh).forEach((s) => { const empty = !s.text, a = show(s.key);
      const lines = empty ? ['비어 있음'] : clip(wrap(s.text, PW - 34, FS), s.key === 'context' ? (many ? 2 : 3) : many && s.key !== 'system' ? 1 : 2), h = 22 + lines.length * LH;
      if (a <= 0) return;
      const x = PX + (s.sub ? 16 : 0), w = PW - (s.sub ? 16 : 0), dx = (1 - a) * -30;
      el('rect', { x: x + dx, y, width: w, height: h, rx: 8, fill: empty ? PANEL : s.col === ACC ? ACCBG : s.col === WARN ? WARNBG : s.col === INFO ? INFOBG : SOFT, stroke: empty ? OFF : o.hot === s.key ? s.col : GRID, 'stroke-width': o.hot === s.key ? 2.6 : 1.4, 'stroke-dasharray': empty ? '5 4' : null, opacity: a });
      el('rect', { x: x + dx, y, width: 5, height: h, rx: 2, fill: empty ? OFF : s.col, opacity: a });
      tx(x + dx + 14, y + 16, s.title, { 'font-size': 13.5, 'font-weight': 800, fill: empty ? MUT : s.col === INK ? INK : s.col, opacity: a });
      lines.forEach((ln, i) => tx(x + dx + 14, y + 34 + i * LH, ln, { 'font-size': FS, fill: empty ? MUT : INK, opacity: a, 'font-style': empty ? 'italic' : null }));
      pos[s.key] = { y, h };
      y += h + 6; });
    if (o.roles) { const groups = {}; sections(sh).forEach((s) => { if (pos[s.key] && s.role) { const g = s.role + (s.key.match(/\d/) || [''])[0]; (groups[g] = groups[g] || []).push(pos[s.key]); } });
      Object.entries(groups).forEach(([g, ps]) => { const y0 = ps[0].y, y1 = ps[ps.length - 1].y + ps[ps.length - 1].h, role = g.replace(/\d/, '');
        el('path', { d: `M${PX + PW + 8},${y0 + 2} h8 V${y1 - 2} h-8`, fill: 'none', stroke: role === 'system' ? ACC : role === 'ai' ? GOOD : INFO, 'stroke-width': 2.2, opacity: o.roles });
        tx(PX + PW + 22, (y0 + y1) / 2 + 5, role, { 'font-size': 13.5, 'font-weight': 800, class: 'mono', fill: role === 'system' ? ACC : role === 'ai' ? GOOD : INFO, opacity: o.roles }); }); }
    return pos; }
  const appearAll = () => 1;
  // 앞 beat 에 없던 영역은 u 에 따라 미끄러져 들어온다
  function showNew(c, t0) { const prev = c.k > 0 && c.prev ? sections(c.prev.promptShape).filter((s) => s.text).map((s) => s.key) : null;
    return (key) => { const s = sections(c.beat.promptShape).find((x) => x.key === key); if (!s) return 0;
      if (!s.text) return 1; if (!prev || prev.includes(key)) return c.k === 0 && !prev ? E(c.u, t0 ?? 0.2, (t0 ?? 0.2) + 0.6) : 1;
      return E(c.u, 0.3, 1.0); }; }

  // ---------- 오른쪽: 응답 · 사실 대조 ----------
  const AX = 528, AW = 410;
  const FACTS = [{ name: '연 15일', re: /15일/ }, { name: '3년차부터 +1일 (최대 25일)', re: /3년차/ }, { name: '리프레시 3일', re: /리프레시/ }];
  function answer(ans, u, o) { o = o || {}; const pre = /^\((호출 전|few-shot 전|refusal 규칙 전)\)/.test(ans.text);
    const head = pre ? ans.text.match(/^\(([^)]*)\)/)[1] : 'LLM 응답 (예시)', body = pre ? ans.text.replace(/^\([^)]*\)\s*/, '') : ans.text;
    const col = pre ? MUT : ans.quality === 'bad' ? BAD : ans.quality === 'good' ? GOOD : INFO;
    const lines = []; body.split('\n').forEach((p) => wrap(p, AW - 34, 14.5).forEach((l) => lines.push(l)));
    const h = Math.max(70, 40 + Math.min(lines.length, 7) * 22), y = o.y || 34, s = o.s ?? 1;
    el('rect', { x: AX, y, width: AW, height: h, rx: 10, fill: pre ? PANEL : ans.quality === 'bad' ? BADBG : ans.quality === 'good' ? GOODBG : INFOBG, stroke: col, 'stroke-width': 2, 'stroke-dasharray': pre ? '5 4' : null, opacity: s });
    tx(AX + 16, y + 22, head, { 'font-size': 13.5, 'font-weight': 800, fill: col, opacity: s });
    const total = lines.join('').length; let left = Math.round(total * clamp(u));
    lines.slice(0, 7).forEach((ln, i) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length; if (!part) return;
      tx(AX + 16, y + 46 + i * 22, part, { 'font-size': 14.5, 'font-weight': pre ? 500 : 600, fill: pre ? MUT : INK, opacity: s }); });
    return { y, h, pre, lines }; }
  function tags(list, y, s) { let x = AX; (list || []).forEach((t, i) => { const lab = t.toUpperCase(), w = tw(lab, 13.5) + 24;
    pill(x + w / 2, y, lab, GOOD, typeof s === 'function' ? s(i) : s, { fs: 13.5, mono: true, fill: GOODBG }); x += w + 8; }); }
  function factRow(text, y, u0, o) { o = o || {};
    tx(AX, y - 18, o.title || '참고 자료의 사실이 답에 들어갔나', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u0, 0) });
    FACTS.forEach((f, i) => { const ok = f.re.test(text), s = pop(u0, 0.15 + i * 0.3), w = i === 1 ? 190 : 104, x = AX + [0, 114, 314][i];
      card(x + w / 2, y + 18, w, 34, { rx: 8, text: f.name, fs: 13.5, stroke: ok ? GOOD : BAD, color: ok ? INK : BAD, fill: ok ? GOODBG : BADBG, sw: 1.8, s });
      (ok ? check : cross)(x + w - 4, y, 8, s); });
    return FACTS.filter((f) => f.re.test(text)).length; }

  // ---------- 1. Simple prompt ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, sh = b.promptShape;
    const pos = promptStack(sh, showNew(c), { hot: k === 0 ? 'context' : k === 1 ? 'question' : null });
    if (k === 0) { note(AX, 70, '검색해 온 자료 한 덩어리', fade(u, 1.0));
      FACTS.forEach((f, i) => pill(AX + 110, 120 + i * 44, f.name, INK, pop(u, 1.3 + i * 0.3), { fs: 14, fill: SOFT }));
      sub(AX + 215, 270, '자료에 든 사실 세 개 · 답에 들어가야 할 것', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 1) { pill(PX + PW - 70, (pos.system.y + 22), 'system 없음', BAD, pop(u, 1.2), { fs: 13.5, fill: BADBG });
      note(AX, 80, 'prompt = 자료 + 질문 한 줄', fade(u, 0.6));
      note(AX, 112, '"이 자료만 써라" 는 말이 어디에도 없다', fade(u, 1.4), { fill: BAD });
      return; }
    const a = answer(b.answer, k === 2 ? E(u, 0.2, 1.6) : 1, { s: k === 2 ? pop(u, 0.1) : 1 });
    const fy = a.y + a.h + 46;
    factRow(b.answer.text, fy, k === 2 ? u - 1.6 : 1);
    if (k === 3) { // 일반론이 새어 나온다
      card(AX + 330, fy + 106, 190, 50, { rx: 25, text: '학습된 일반 상식', fs: 14, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 0.2) });
      for (let i = 0; i < 4; i++) dot([[AX + 250, fy + 106], [AX + 120, a.y + a.h - 6]], ((u * 0.7 + i / 4) % 1) * (u > 0.4 ? 1 : 0), WARN, 5);
      note(AX, fy + 112, '"보통", "회사마다 다르지만"', fade(u, 1.0), { fill: WARN, 'font-size': 14.5 }); } }

  // ---------- 2. System 지시 ----------
  function s2(t, c) { const { k, u } = c, b = c.beat, sh = b.promptShape;
    promptStack(sh, showNew(c), { hot: k === 0 ? 'system' : null, roles: k === 1 ? fade(u, 0.4) : k > 1 ? 1 : 0 });
    if (k === 0) { note(AX, 80, '맨 앞에 규칙 한 줄', fade(u, 1.0), { fill: ACC });
      note(AX, 116, '"[참고 자료]의 내용만 근거로 답하세요"', fade(u, 1.5)); return; }
    if (k === 1) { note(AX, 80, 'ChatPromptTemplate.from_messages', fade(u, 0.8), { class: 'mono', 'font-size': 14.5 });
      note(AX, 116, 'system 메시지 · human 메시지 두 칸으로 나눈다', fade(u, 1.4)); return; }
    const a = answer(b.answer, k === 2 ? E(u, 0.2, 1.7) : 1, { s: k === 2 ? pop(u, 0.1) : 1 });
    tags(b.answer.tags, a.y + a.h + 24, k === 2 ? pop(u, 1.8) : 1);
    if (k === 2) { factRow(b.answer.text, a.y + a.h + 82, u - 1.8); return; }
    // k3: 사실 대조 1/3 → 3/3
    const y = a.y + a.h + 74; tx(AX, y, '자료의 사실이 답에 들어간 수', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    [['system 없음 (Step 1)', 1, BAD], ['system 한 줄', 3, GOOD]].forEach(([lab, n, col], i) => { const yy = y + 22 + i * 40, g = E(u, 0.3 + i * 0.6, 1.2 + i * 0.6);
      tx(AX, yy + 15, lab, { 'font-size': 14, 'font-weight': 600 });
      el('rect', { x: AX + 170, y: yy, width: 180, height: 20, rx: 4, fill: SOFT });
      el('rect', { x: AX + 170, y: yy, width: 180 * n / 3 * g, height: 20, rx: 4, fill: col, opacity: 0.85 });
      mono(AX + 362, yy + 15, `${n} / 3`, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.6) }); }); }

  // ---------- 3. 형식 지정 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat, sh = b.promptShape;
    promptStack(sh, showNew(c), { hot: k === 0 || k === 3 ? 'format' : null, roles: 1 });
    if (k === 0) { note(AX, 80, 'system 안에 [형식 규칙] 칸을 따로 둔다', fade(u, 1.1), { fill: INFO });
      ['• 정확히 3개', '• 각 항목 한 문장', '• 서론·맺음말 없이'].forEach((s, i) => note(AX + 10, 124 + i * 30, s, fade(u, 1.4 + i * 0.3))); return; }
    if (k === 1) { const a = answer(b.answer, 1, {}); note(AX, a.y + a.h + 40, '직전 답은 줄글이었다', fade(u, 0.6), { fill: MUT });
      note(AX, a.y + a.h + 72, '같은 구조의 체인을 규칙만 바꿔 다시 만든다', fade(u, 1.2)); return; }
    const a = answer(b.answer, k === 2 ? E(u, 0.2, 1.5) : 1, { s: k === 2 ? pop(u, 0.1) : 1 });
    tags(b.answer.tags, a.y + a.h + 24, k === 2 ? (i) => pop(u, 1.6 + i * 0.2) : 1);
    if (k === 2) { const y = a.y + a.h + 62, n = b.answer.text.split('\n').filter((l) => l.startsWith('• ')).length;
      mono(AX, y + 10, 'split("\\n") → "• " 로 시작하는 줄', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      for (let i = 0; i < n; i++) card(AX + 40 + i * 70, y + 44, 56, 34, { rx: 6, text: `[${i}]`, fs: 14, mono: true, stroke: INFO, color: INFO, s: pop(u, 2.0 + i * 0.15) });
      mono(AX + 260, y + 50, `len == ${n} ✓`, { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.4) }); return; }
    note(AX, a.y + a.h + 76, '형식은 [형식 규칙] 칸만 고치면 된다', fade(u, 0.6), { fill: INFO });
    note(AX, a.y + a.h + 106, 'grounding 규칙과 섞이지 않는다', fade(u, 1.2)); }

  // ---------- 4. Refusal + Citation ----------
  function s4(t, c) { const { k, u } = c, b = c.beat, sh = b.promptShape;
    promptStack(sh, showNew(c), { hot: k === 0 ? 'question' : k === 1 ? 'refusal' : null, roles: 1 });
    if (k === 0) { const y = 34; card(AX + AW / 2, y + 40, AW, 80, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 0.9) });
      tx(AX + 16, y + 22, 'refusal 규칙 전 응답 (예시)', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      tx(AX + 16, y + 52, '• 인사 시스템에서 신청하시면 됩니다.', { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.2) });
      // 질문 낱말을 자료에서 찾아본다
      tx(AX, 170, '자료에서 "신청" 을 찾으면', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      mono(AX, 200, '0 건', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      note(AX + 70, 198, '자료에 없는 절차를 지어냈다', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 1) { note(AX, 80, '환각을 막는 장치 두 개', fade(u, 1.1), { fill: WARN });
      note(AX + 10, 122, '① 없으면 "없다" 고만 답한다', fade(u, 1.4)); note(AX + 10, 154, '② 끝에 [출처: 문서명] 을 단다', fade(u, 1.8)); return; }
    const a = answer(b.answer, k === 2 ? E(u, 0.2, 1.4) : 1, { s: k === 2 ? pop(u, 0.1) : 1 });
    tags(b.answer.tags, a.y + a.h + 24, k === 2 ? (i) => pop(u, 1.5 + i * 0.2) : 1);
    if (k === 2) { note(AX, a.y + a.h + 74, '지어낸 절차가 사라지고 근거 문서가 남았다', fade(u, 2.2), { fill: GOOD }); return; }
    [['refusal 없으면', '그럴듯한 절차를 지어낸다', BAD], ['citation 없으면', '답이 맞는지 확인할 길이 없다', BAD]].forEach(([a1, b1, col], i) => {
      const y = a.y + a.h + 66 + i * 64, s = pop(u, 0.3 + i * 0.5);
      card(AX + AW / 2, y + 22, AW, 52, { rx: 10, stroke: col, sw: 1.8, s });
      tx(AX + 16, y + 28, a1, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) });
      tx(AX + 150, y + 28, b1, { 'font-size': 14.5, opacity: fade(u, 0.5 + i * 0.5) }); }); }

  // ---------- 5. Few-shot ----------
  function s5(t, c) { const { k, u } = c, b = c.beat, sh = b.promptShape;
    promptStack(sh, showNew(c), { hot: k === 0 ? 'system' : k === 1 || k === 2 ? 'fq0' : null, roles: k >= 2 ? (k === 2 ? fade(u, 0.6) : 1) : 0 });
    if (k === 0) { const a = answer(b.answer, 1, {});
      note(AX, a.y + a.h + 40, '규칙은 다 지키지만 호출마다', fade(u, 0.8)); note(AX, a.y + a.h + 70, '톤·길이가 조금씩 다르다', fade(u, 1.2), { fill: WARN }); return; }
    const ex = (sh.fewshot && sh.fewshot[0]) || null;
    if (k === 1 || k === 2) { if (!ex) return; const y = 34, lines = ['Q. ' + ex.q].concat(ex.a.split('\n'));
      el('rect', { x: AX, y, width: AW, height: 30 + lines.length * 24, rx: 10, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: k === 1 ? pop(u, 0.2) : 1 });
      tx(AX + 16, y + 22, k === 1 ? '모범 Q-A 한 쌍 (경조사 휴가)' : '→ ("human", 질문) / ("ai", 모범 답)', { 'font-size': 13.5, 'font-weight': 800, fill: INFO });
      lines.forEach((ln, i) => tx(AX + 16, y + 48 + i * 24, ln, { 'font-size': 14, 'font-weight': i ? 500 : 700, fill: i === 0 && k === 2 ? INFO : i > 0 && k === 2 ? GOOD : INK, opacity: k === 1 ? fade(u, 0.6 + i * 0.25) : 1 }));
      if (k === 2) { mono(AX + AW - 16, y + 48, 'human', { 'font-size': 13.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 0.6) });
        mono(AX + AW - 16, y + 72, 'ai', { 'font-size': 13.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.0) }); }
      return; }
    if (k === 3) { note(AX, 70, '조립 순서', fade(u, 0.3), { fill: MUT });
      [['system', ACC], ['human  예시 질문', INFO], ['ai     예시 답', GOOD], ['human  자료 + 실제 질문', INFO]].forEach(([s, col], i) => {
        card(AX + 150, 108 + i * 52, 300, 40, { rx: 8, text: s, fs: 14.5, mono: true, stroke: col, color: col, s: pop(u, 0.4 + i * 0.35) });
        if (i < 3) grow(AX + 150, 128 + i * 52, AX + 150, 136 + i * 52, E(u, 0.7 + i * 0.35, 0.9 + i * 0.35), MUT); }); return; }
    // k4: 예시와 같은 모양
    const a = answer(b.answer, E(u, 0.2, 1.4), { s: pop(u, 0.1) });
    tags(b.answer.tags, a.y + a.h + 24, (i) => pop(u, 1.5 + i * 0.15));
    const shape = (txt) => txt.split('\n').map((l) => (l.startsWith('• ') ? 'bullet' : l.startsWith('[출처') ? 'cite' : 'text'));
    const y = a.y + a.h + 62, mine = shape(b.answer.text), exs = ex ? shape(ex.a) : [];
    [['예시 답', exs], ['이번 답', mine]].forEach(([lab, sh2], r) => { tx(AX, y + 18 + r * 32, lab, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8) });
      sh2.forEach((kind, i) => card(AX + 100 + i * 56, y + 13 + r * 32, 50, 24, { rx: 5, text: kind === 'bullet' ? '•' : kind === 'cite' ? '출처' : '…', fs: 13.5, stroke: kind === 'cite' ? GOOD : INFO, color: kind === 'cite' ? GOOD : INFO, s: pop(u, 1.9 + i * 0.12 + r * 0.2) })); });
    if (exs.join() === mine.join()) mono(AX + 370, y + 34, '같은 모양 ✓', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.5) }); }

  const quiz = [
    { q: 'system 지시 없이 자료와 질문만 넣었더니 "보통 15일 정도"라는 답이 나왔다. 빠진 것은 무엇인가?',
      o: ['자료 속 리프레시 3일과 근속 가산', '질문 문장', '자료의 문서 이름'], a: 0,
      why: '자료에는 연 15일, 3년차부터 1일씩 가산(최대 25일), 리프레시 3일이 있었다. 지시가 없으니 일반 상식이 섞이고 뒤의 두 사실이 빠졌다.' },
    { q: 'system에 넣은 한 줄 중 답을 자료 쪽으로 붙잡아 둔 것은 무엇인가?',
      o: ['"당신은 사내 Q&A 도우미입니다"', '"[참고 자료]의 내용만 근거로 답하세요"', '"질문에 친절하게 답하세요"'], a: 1,
      why: '자료만 근거로 쓰라는 ground 규칙이 들어가자 일반론이 사라지고 사실 세 개가 모두 답에 들어갔다.' },
    { q: '[형식 규칙]으로 답을 정확히 3 bullet으로 고정하면 무엇이 쉬워지나?',
      o: ['답의 사실 정확도 검증', '검색 속도', '줄 단위로 나눠 UI나 후속 처리에 넣는 일'], a: 2,
      why: '"• "로 시작하는 줄을 세면 늘 3개라 assert가 통과한다. 모양이 고정되어 파싱과 표 변환이 안정된다.' },
    { q: '자료에 없는 "연차 신청은 어디서?"를 물었을 때 거절 규칙이 있는 prompt의 올바른 답은?',
      o: ['"인사 시스템에서 신청하시면 됩니다"', '"제공된 자료에 해당 정보가 없습니다" + [출처]', '빈 답'], a: 1,
      why: '거절 규칙이 없을 때는 그럴듯한 절차를 지어냈다. 규칙이 들어가면 없다고 말하고, 출처 규칙 덕에 무엇을 보고 판단했는지도 남는다.' },
    { q: 'few-shot 예시를 넣으면 규칙만 글로 적었을 때보다 무엇이 더 안정되나?',
      o: ['검색되는 문서의 수', '답의 톤·길이·출처 위치 같은 모양', '모델의 학습 데이터'], a: 1,
      why: '경조사 Q-A 한 쌍을 human/ai 메시지로 보여 주면, 실제 답도 3 bullet 뒤에 [출처]가 붙는 같은 모양으로 나온다.' },
  ];

  const summary = [
    '자료와 질문만 넣으면 모델이 일반 상식을 섞어 자료의 사실을 흘린다.',
    'system에 자료만 근거로 답하라는 한 줄을 넣자 사실 세 개가 모두 답에 들어갔다.',
    '형식 규칙은 답의 모양을 고정하고, 거절·출처 규칙은 지어낸 답을 막는다.',
    '모범 Q-A 한 쌍을 메시지로 넣으면 톤과 출처 위치까지 예시를 따른다.',
  ];
  const review = [
    { q: '사내 챗봇이 자료에 없는 사내 절차를 자신 있게 지어낸다. prompt에서 먼저 확인할 곳은?',
      o: ['[형식 규칙]의 bullet 개수', '거절 규칙이 있는지', 'few-shot 예시의 개수'], a: 1,
      why: '형식은 지켜도 내용은 지어낼 수 있다. Step 4의 "신청 어디서?" 사례처럼 거절 규칙이 있어야 없는 정보를 지어내지 않는다.' },
    { q: '답을 받아 줄마다 나눠 표로 그리는데 가끔 표가 깨진다. 가장 직접적인 해결은?',
      o: ['형식 규칙으로 3 bullet을 고정한다', 'temperature를 높인다', '참고 자료를 더 길게 넣는다'], a: 0,
      why: '줄글이나 서론이 섞이면 나누는 코드가 흔들린다. 형식 규칙으로 모양을 고정하고, 필요하면 같은 모양의 예시를 함께 보여 준다.' },
    { q: '규칙을 다 넣었는데도 출처 줄이 어떤 때는 맨 위, 어떤 때는 맨 아래에 붙는다. 무엇을 더하면 좋은가?',
      o: ['참고 자료를 하나 더 검색한다', '거절 규칙을 지운다', '모범 Q-A를 메시지로 넣는다'], a: 2,
      why: '글로 적은 규칙만으로는 모양이 완전히 고정되지 않는다. few-shot 예시로 실물을 보여 주면 출처 위치까지 따라 한다.' },
  ];

  R.page({ title: 'RAG 프롬프트 — 영역이 하나씩 붙는다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
