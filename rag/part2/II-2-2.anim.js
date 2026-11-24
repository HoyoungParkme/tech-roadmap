/* II-2-2 Chunk Size와 Overlap — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 위쪽 띠 = 시연 문서 FULL_DOC 212자(눈금은 글자 위치), 그 아래 조항 3개(1.1 95자 · 1.2 61자 · 1.3 54자),
 *       그 아래 청크 막대 = 각 청크가 문서의 어디부터 어디까지인지(겹치면 막대도 겹친다).
 * 청크는 STEPS 의 chunks 를 읽는다 — langchain-text-splitters 로 실제 돌린 결과다 (30자 → 8조각, 5000자 → 1조각, 100자 → 3조각, 100자+겹침 40 → 95·88·85자).
 * 마지막 장면의 recall 곡선(0.42 … 0.89)은 페이지의 예시 수치다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, tween, G, card, spans, mono, sub, lbl, pill, grow, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const DOC = '1.1 근무시간은 오전 9시부터 오후 6시까지이다. 플렉스타임 적용 부서는 코어타임(10시~4시) 내에서 자율 출퇴근한다. 점심시간은 1시간이며 12시~1시 사이로 한다. 1.2 휴게시간은 4시간 근무당 30분 이상 부여한다. 야간근무(22시 이후)는 통상임금의 50%를 가산한다. 1.3 연차휴가는 입사 1년 후 15일을 부여하며 매년 1일씩 가산하여 최대 25일까지 부여한다.';
  const N = DOC.length;   // 212
  const X0 = 60, W = 840, X = (i) => X0 + (W * i) / N;
  const CL = [[0, 95, '1.1 근무시간', INFO], [96, 157, '1.2 휴게·야간', WARN], [158, N, '1.3 연차', GOOD]];
  const ANS = '야간근무(22시 이후)는 통상임금의 50%를 가산한다.';   // 30자
  const A0 = DOC.indexOf(ANS), A1 = A0 + ANS.length;
  const CC = [ACC, INFO, WARN, GOOD];
  // 문서 띠 + 조항 띠
  function ribbon(o) { o = o || {};
    tx(X0, 34, `시연 문서 FULL_DOC · ${N}자`, { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('rect', { x: X0, y: 44, width: W, height: 14, rx: 4, fill: SOFT, stroke: GRID });
    [0, 50, 100, 150, 200].forEach((v) => { el('line', { x1: X(v), y1: 58, x2: X(v), y2: 64, stroke: MUT }); });
    [0, 100, 212].forEach((v) => mono(X(v), 78, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': v === 212 ? 'end' : v ? 'middle' : 'start' }));
    CL.forEach(([a, b, name, col], i) => { const op = o.clauseOp ?? 1; el('rect', { x: X(a), y: 88, width: X(b) - X(a) - 2, height: 24, rx: 4, fill: col, opacity: 0.18 * op + (o.hiClause === i ? 0.4 : 0) });
      tx((X(a) + X(b)) / 2, 105, `${name} (${b - a}자)`, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: op }); });
    if (o.ans) { el('rect', { x: X(A0), y: 44, width: X(A1) - X(A0), height: 14, rx: 3, fill: BAD, opacity: o.ans }); } }
  // 청크 → 문서 안 [시작, 끝)
  function spansOf(ch) { const out = []; let from = 0; ch.forEach((c) => { const p = DOC.indexOf(c.text.trim(), from); out.push([p, p + c.text.trim().length]); from = p + 1; }); return out; }
  // 청크 막대. rows=true 면 청크마다 한 줄, 아니면 한 줄에 나란히
  function bars(ch, o) { o = o || {}; const sp = spansOf(ch), y0 = o.y ?? 130;
    sp.forEach(([a, b], i) => { const at = (o.at ?? 0.3) + i * (o.step ?? 0.2), f = o.anim ? E(o.u, at, at + 0.4) : 1; if (f <= 0) return;
      const y = o.rows ? y0 + i * 40 : y0, col = CC[(i + (o.shift || 0)) % 4];
      el('rect', { x: X(a) + 1, y, width: Math.max(2, (X(b) - X(a) - 2) * f), height: 30, rx: 5, fill: col, opacity: o.dim && o.dim(i) ? 0.25 : 0.85 });
      if (f > 0.9 && X(b) - X(a) > 34) mono((X(a) + X(b)) / 2, y + 20, o.label ? o.label(i, b - a) : `${b - a}`, { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); });
    return sp; }
  // 겹친 구간 (rows 막대 사이)
  function overlaps(sp, y0, op) { for (let i = 1; i < sp.length; i++) { const a = sp[i][0], b = sp[i - 1][1]; if (b <= a) continue;
      el('rect', { x: X(a), y: y0 + (i - 1) * 40 - 4, width: X(b) - X(a), height: 78, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: op }); } }
  // 자 (chunk_size 크기 괄호)
  function bracket(size, u, at, col, y) { const f = E(u, at, at + 0.8), w = (W * Math.min(size, N) / N) * f, yy = y ?? 128;
    el('line', { x1: X0, y1: yy, x2: X0 + w, y2: yy, stroke: col, 'stroke-width': 3 }); el('line', { x1: X0, y1: yy - 8, x2: X0, y2: yy + 8, stroke: col, 'stroke-width': 3 });
    if (size <= N) el('line', { x1: X0 + w, y1: yy - 8, x2: X0 + w, y2: yy + 8, stroke: col, 'stroke-width': 3, opacity: f > 0.98 ? 1 : 0 });
    else if (f > 0.98) tx(X0 + w, yy + 26, '5000 은 문서 끝을 한참 넘는다 →', { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'end' }); }
  function textList(ch, x, y, o) { o = o || {}; ch.forEach((c, i) => { const t = c.text.trim(), sh = o.u != null ? fade(o.u, (o.at ?? 0.3) + i * 0.15) : 1, col = CC[i % 4];
      mono(x, y + i * (o.lh || 24), `#${i + 1}`, { 'font-size': 13.5, 'font-weight': 800, fill: col, opacity: sh });
      const s = t.length > (o.max || 40) ? t.slice(0, (o.max || 40) - 1) + '…' : t; tx(x + 34, y + i * (o.lh || 24), s, { 'font-size': 13.5, opacity: o.dim && o.dim(i) ? 0.35 * sh : sh, fill: o.hi && o.hi(i) ? BAD : INK, 'font-weight': o.hi && o.hi(i) ? 700 : 400 }); }); }
  function vecPts(pts, u, at) { pts.forEach(([x, y, col, name], i) => { const s = pop(u, at + i * 0.15); el('circle', { cx: x, cy: y, r: 8 * s, fill: col }); if (name) tx(x + 14, y + 5, name, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: s }); }); }

  // ---------- 1. 너무 작은 chunk ----------
  function s1(t, c) { const { k, u } = c, ch = c.beat.chunks || [];
    ribbon();
    if (k === 0) { bracket(30, u, 0.3, BAD);
      card(480, 230, 360, 60, { rx: 10, stroke: BAD, text: 'RecursiveCharacterTextSplitter(\n  chunk_size=30, chunk_overlap=0)', fs: 14.5, mono: true, s: pop(u, 0.9) });
      tx(480, 310, '조항 하나(54~95자)보다 훨씬 작은 자', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); return; }
    const sp = bars(ch, { anim: k === 1, u, at: 0.3, step: 0.2 });
    if (k === 1) { const n = Math.round(tween((c.prev || {}).chunkCount, c.beat.chunkCount, u, 1.6)); mono(480, 220, `len(chunks) = ${n}`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      sub(480, 252, '212자 문서가 8조각 (28·29·28·29·28·28·24·11자)', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 2) { textList(ch, 70, 200, { u, at: 0.2, hi: (i) => i === 1 || i === 2, lh: 24 });
      tx(560, 250, '문장이 청크 중간에서 끊긴다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      sub(560, 278, '#2 "…코어타임(10시~4시) 내에서"', fade(u, 2.0), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    if (k === 3) { [['문맥 단절', '#2와 #3이 한 문장을 나눠 가짐', BAD], ['노이즈 검색', '"근무시간" 질의에 #1만 걸림', WARN], ['벡터 8개', '저장·검색할 벡터가 는다', INFO]].forEach(([a, b, col], i) => { const y = 200 + i * 62, s = pop(u, 0.3 + i * 0.45);
        card(250, y, 380, 50, { rx: 8, stroke: col, s }); tx(76, y + 6, `${i + 1}. ${a}`, { 'font-size': 15.5, 'font-weight': 800, fill: col, opacity: s }); tx(200, y + 6, b, { 'font-size': 14, opacity: s }); });
      sp.forEach(([a, b], i) => vecPts([[520 + (i % 4) * 90 + 60, 220 + Math.floor(i / 4) * 70 + (i % 2) * 18, CC[i % 4]]], u, 1.8 + i * 0.05));
      sub(760, 372, '벡터 8개 (그림)', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    // k 4: 질문 하나
    pill(300, 236, '"코어타임엔 뭘 하나?"', INK, pop(u, 0.2), { fs: 15 });
    [1, 2].forEach((i, j) => { const [a, b] = sp[i]; grow(300, 218, (X(a) + X(b)) / 2, 164, E(u, 0.6 + j * 0.3, 1.0 + j * 0.3), BAD, { sw: 2 }); });
    tx(70, 290, '#2 플렉스타임 적용 부서는 코어타임(10시~4시) 내에서', { 'font-size': 14.5, opacity: fade(u, 1.1) });
    tx(70, 318, '#3 자율 출퇴근한다. 점심시간은 1시간이며 12시~1시', { 'font-size': 14.5, opacity: fade(u, 1.4) });
    tx(70, 356, '답이 두 청크에 반씩 — 하나만 뽑히면 답도 반쪽이다', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) }); }

  // ---------- 2. 너무 큰 chunk ----------
  function s2(t, c) { const { k, u } = c, ch = c.beat.chunks || [];
    ribbon({ ans: k === 4 ? fade(u, 0.3) : 0 });
    if (k === 0) { bracket(5000, u, 0.3, WARN);
      card(480, 230, 360, 60, { rx: 10, stroke: WARN, text: 'RecursiveCharacterTextSplitter(\n  chunk_size=5000, chunk_overlap=0)', fs: 14.5, mono: true, s: pop(u, 0.9) });
      tx(480, 310, '문서(212자)보다 큰 자 = 자르지 않는 것', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); return; }
    bars(ch, { anim: k === 1, u, at: 0.3, label: (i, n) => `#1 · ${n}자 · 조항 3개 전부` });
    if (k === 1) { mono(480, 220, 'len(chunks) = 1', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.0) }); return; }
    if (k === 2) { vecPts([[300, 230, INFO, '근무시간'], [460, 330, WARN, '휴게·야간'], [620, 230, GOOD, '연차']], u, 0.2);
      [[300, 230], [460, 330], [620, 230]].forEach(([x, y], i) => grow(x, y, 460, 263, E(u, 0.9 + i * 0.15, 1.3 + i * 0.15), MUT, { sw: 1.6, dash: '4 4', plain: true }));
      el('circle', { cx: 460, cy: 263, r: 11 * pop(u, 1.5), fill: 'none', stroke: INK, 'stroke-width': 3 }); tx(480, 268, '청크 벡터 = 세 주제의 평균', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.7) });
      sub(760, 370, '벡터 위치는 그림', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    if (k === 3) { tx(70, 200, 'Lost in the middle', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      for (let i = 0; i < 20; i++) { const mid = 1 - Math.sin((i / 19) * Math.PI) * 0.75; el('rect', { x: 70 + i * 22, y: 216, width: 18, height: 26, rx: 3, fill: INK, opacity: mid * fade(u, 0.3 + i * 0.03) }); }
      sub(290, 266, '긴 컨텍스트의 가운데 정보를 자주 놓친다', fade(u, 1.0), { 'font-size': 14 });
      [['모호한 임베딩', '여러 주제가 한 벡터에'], ['질의마다 통째로', '청크 전체가 프롬프트에']].forEach(([a, b], i) => { const y = 300 + i * 40; cross(80, y - 5, 8, pop(u, 1.4 + i * 0.3)); tx(100, y, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.3) }); sub(260, y, b, fade(u, 1.5 + i * 0.3), { 'text-anchor': 'start', 'font-size': 14 }); });
      return; }
    // k 4: 질문 하나
    pill(300, 210, '"야간근무 가산율은?"', INK, pop(u, 0.2), { fs: 15 });
    const f = E(u, 0.6, 1.4); el('rect', { x: X(A0), y: 128, width: X(A1) - X(A0), height: 34, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: f });
    mono(70, 290, `답 ${ANS.length}자 / 청크 ${N}자`, { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.2) });
    tx(70, 326, `${Math.round((1 - ANS.length / N) * 100)}%가 질문과 무관한 글자다`, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); }

  // ---------- 3. 적정 chunk ----------
  const SEPS = ['"\\n\\n"', '"\\n"', '". "', '" "', '""'];
  function s3(t, c) { const { k, u } = c, ch = c.beat.chunks || [];
    ribbon({ ans: k === 5 ? fade(u, 0.3) : 0 });
    if (k === 0) { bracket(100, u, 0.3, GOOD);
      CL.forEach(([a, b, , col], i) => mono(X(a) + 4, 156, `${b - a}`, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: fade(u, 1.2 + i * 0.2) }));
      card(480, 240, 360, 56, { rx: 10, stroke: GOOD, text: 'chunk_size=100', fs: 17, mono: true, color: GOOD, s: pop(u, 1.0) });
      tx(480, 300, '조항 하나(54~95자)가 들어가는 크기', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(480, 328, '실제 규정처럼 조항이 500~1000자면 700자 안팎', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { SEPS.forEach((s, i) => { pill(110 + i * 110, 180, s, i === 2 ? ACC : MUT, pop(u, 0.2 + i * 0.2), { mono: true, fs: 15 }); if (i) grow(110 + i * 110 - 82, 180, 110 + i * 110 - 34, 180, E(u, 0.3 + i * 0.2, 0.5 + i * 0.2), MUT, { sw: 1.6 }); });
      tx(70, 250, '이 문서엔 단락·줄바꿈이 없어 ". " 에서 잘린다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      mono(70, 296, 'keep_separator="end"', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) }); tx(290, 296, '→ 마침표를 앞 문장 끝에 붙인다', { 'font-size': 15, opacity: fade(u, 1.8) });
      sub(480, 340, '(기본값이면 다음 청크가 ". 1.2 …" 로 시작한다)', fade(u, 2.2), { 'font-size': 14 }); return; }
    bars(ch, { anim: k === 2, u, at: 0.3, step: 0.35, shift: 1 });
    if (k === 2) { mono(480, 220, 'len(chunks) = 3', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.5) });
      sub(480, 252, '청크 경계 = 조항 경계 (95·61·54자)', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 3) { ch.forEach((x, i) => { const t = x.text, y = 200 + i * 52;
        mono(70, y, `#${i + 1}`, { 'font-size': 14, 'font-weight': 800, fill: CC[(i + 1) % 4], opacity: fade(u, 0.2 + i * 0.3) });
        tx(110, y, t.slice(0, 12) + ' …', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); tx(330, y, '… ' + t.slice(-12), { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) });
        check(640, y - 5, 9, pop(u, 0.6 + i * 0.3)); sub(660, y, '조항 시작 → 조항 끝', fade(u, 0.7 + i * 0.3), { 'text-anchor': 'start', 'font-size': 14 }); }); return; }
    if (k === 4) { vecPts([[260, 240, INFO, '근무시간'], [470, 320, WARN, '휴게·야간'], [680, 240, GOOD, '연차']], u, 0.2);
      tx(480, 370, '청크마다 주제 하나 → 벡터가 서로 떨어져 또렷하다 (그림)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); return; }
    pill(300, 210, '"야간근무 가산율은?"', INK, pop(u, 0.2), { fs: 15 });
    const sp = spansOf(ch); el('rect', { x: X(sp[1][0]), y: 126, width: X(sp[1][1]) - X(sp[1][0]), height: 34, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.6) });
    mono(70, 290, `답 ${ANS.length}자 / 청크 ${sp[1][1] - sp[1][0]}자`, { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.0) });
    tx(70, 326, `212자를 통째로 보낼 때보다 무관한 글자가 ${N - ANS.length}자 → ${sp[1][1] - sp[1][0] - ANS.length}자로 준다`, { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) }); }

  // ---------- 4. Overlap ----------
  function s4(t, c) { const { k, u } = c, ch = c.beat.chunks || [];
    ribbon();
    if (k === 0) { bracket(100, u, 0.2, GOOD, 128); bracket(40, u, 0.9, BAD, 150);
      mono(X(40) + 8, 155, 'overlap 40', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      card(480, 240, 400, 56, { rx: 10, stroke: ACC, text: 'chunk_size=100, chunk_overlap=40', fs: 16, mono: true, color: ACC, s: pop(u, 1.2) });
      tx(480, 300, '문장 하나(25~30자)가 통째로 넘어갈 크기', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    const sp = bars(ch, { rows: true, y: 126, anim: k === 1, u, at: 0.3, step: 0.35, shift: 1 });
    if (k === 1) { overlaps(sp, 126, fade(u, 1.8)); mono(480, 268, '95 · 88 · 85자', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 296, '빨간 점선 = 두 청크에 모두 든 글자', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    overlaps(sp, 126, 1);
    if (k === 2) { const s1 = '점심시간은 1시간이며 12시~1시 사이로 한다.';
      tx(70, 280, '#1 꼬리', { 'font-size': 14, 'font-weight': 800, fill: CC[1], opacity: fade(u, 0.3) }); tx(150, 280, s1, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      grow(140, 290, 140, 312, E(u, 0.8, 1.1), BAD); tx(70, 330, '#2 머리', { 'font-size': 14, 'font-weight': 800, fill: CC[2], opacity: fade(u, 1.1) }); tx(150, 330, s1, { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      sub(700, 330, '같은 문장이 양쪽에 산다', fade(u, 1.8), { 'font-size': 14.5, 'font-weight': 700, fill: BAD }); return; }
    if (k === 3) { pill(250, 300, '"야간근무 50% 가산"', INK, pop(u, 0.2), { fs: 15 });
      [1, 2].forEach((i, j) => { const [a, b] = sp[i]; grow(330, 300 - j * 8, X(A0) + 20, 126 + i * 40 + 30, E(u, 0.6 + j * 0.3, 1.0 + j * 0.3), BAD, { sw: 2 }); check(X(b) + 18, 126 + i * 40 + 15, 9, pop(u, 1.1 + j * 0.3)); });
      tx(480, 360, '#2로 찾든 #3으로 찾든 앞뒤 문맥이 붙어 온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { const T = [['overlap = 20', '210자', '겹침 0 (문장이 못 넘어감)', MUT, 210], ['overlap = 40', '268자', '+28%', BAD, 268]];
      T.forEach(([a, b, d, col, v], i) => { const y = 280 + i * 44; mono(70, y, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.5) });
        el('rect', { x: 210, y: y - 16, width: 1.5 * v * E(u, 0.4 + i * 0.5, 1.0 + i * 0.5), height: 22, rx: 4, fill: col, opacity: 0.8 }); mono(220 + 1.5 * v, y, `${b}  ${d}`, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.9 + i * 0.5) }); });
      sub(480, 378, '실제 문서의 권장은 chunk_size의 10~20%', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    textList(ch, 70, 290, { u, at: 0.2, max: 56, lh: 28 });
    sub(480, 378, '겹친 문장 2개가 경계 양쪽 청크에 함께 있다', fade(u, 1.8), { 'font-size': 14.5, 'font-weight': 700, fill: BAD }); }

  // ---------- 5. 실험 (예시 수치) ----------
  const PTS = [[100, 0.42], [300, 0.71], [500, 0.85], [700, 0.89], [1000, 0.86], [2000, 0.68], [5000, 0.55]];
  const LX = (v) => 110 + ((Math.log10(v) - 2) / (Math.log10(5000) - 2)) * 760, LY = (r) => 330 - ((r - 0.3) / 0.7) * 250;
  function chartFrame(op) { el('line', { x1: 100, y1: 330, x2: 890, y2: 330, stroke: MUT, 'stroke-width': 1.8, opacity: op }); el('line', { x1: 100, y1: 70, x2: 100, y2: 330, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [100, 300, 700, 2000, 5000].forEach((v) => mono(LX(v), 352, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }));
    [0.4, 0.6, 0.8].forEach((r) => { mono(92, LY(r) + 5, r.toFixed(1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); el('line', { x1: 100, y1: LY(r), x2: 890, y2: LY(r), stroke: GRID, 'stroke-dasharray': '3 4', opacity: op }); });
    tx(890, 380, 'chunk_size (자, 로그 눈금)', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, opacity: op });
    tx(100, 56, 'recall@5 (예시 수치)', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: op }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 50, 'eval_set — 질문과 정답 조항', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      [['근무시간이 어떻게 되나요?', '1.1'], ['야간근무 수당은?', '1.2'], ['연차는 며칠?', '1.3']].forEach(([q, g], i) => { const y = 100 + i * 56, s = pop(u, 0.3 + i * 0.3);
        card(330, y, 540, 44, { rx: 8, stroke: GRID, s }); tx(80, y + 5, q, { 'font-size': 15, opacity: s }); pill(560, y, `gold ${g}`, CL[i][3], s, { mono: true, fs: 14 }); });
      tx(80, 290, '… 50쌍 정도', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      tx(480, 350, '정답을 아는 질문이 있어야 size를 숫자로 고른다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) }); return; }
    if (k === 1 || k === 2) { const steps = [['split', 'size, overlap'], ['FAISS 색인', 'from_documents'], ['검색', 'top-k=5'], ['정답 포함?', 'gold in 결과']];
      steps.forEach(([a, b], i) => { const x = 140 + i * 230, s = pop(u, 0.2 + i * 0.3); card(x, 150, 190, 70, { rx: 10, stroke: i === 3 ? ACC : INK, s }); tx(x, 146, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: s }); mono(x, 170, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s });
        if (i) grow(x - 135, 150, x - 97, 150, E(u, 0.3 + i * 0.3, 0.5 + i * 0.3), MUT); });
      if (k === 2) { tx(80, 270, 'hits / len(eval_set)', { 'font-size': 18, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.4) });
        [0, 1, 2].forEach((i) => { const y = 316, x = 420 + i * 120; tx(x, y, ['1.1', '1.2', '1.3'][i], { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.6 + i * 0.2) }); check(x + 50, y - 5, 9, pop(u, 1.7 + i * 0.2)); });
        sub(480, 360, '질문마다 top-5 안에 정답 조항이 있으면 1점', fade(u, 2.2), { 'font-size': 14 }); }
      return; }
    chartFrame(1);
    const shown = k === 3 ? E(u, 0.2, 2.2) * PTS.length : PTS.length;
    if (k >= 4) R.line({ X: LX, Y: LY }, PTS, k === 4 ? E(u, 0.2, 1.6) : 1, ACC, { sw: 3, op: k === 5 ? 0.3 : 1 });
    PTS.forEach(([v, r], i) => { const s = clamp(shown - i); if (s <= 0 || k === 5) return; el('circle', { cx: LX(v), cy: LY(r), r: 6 * s, fill: v === 700 && k >= 4 ? BAD : ACC });
      mono(LX(v), LY(r) - 14, r.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); });
    if (k === 4) { tx(LX(700), LY(0.89) - 38, '★ 700자 0.89', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      sub(480, 404, '양 끝이 처지고 가운데가 솟은 ∩자', fade(u, 2.0), { 'font-size': 14.5, 'font-weight': 700 }); }
    if (k === 5) { [['FAQ', 200, 400, INFO], ['채팅 로그', 300, 500, WARN], ['기술 문서', 500, 800, GOOD], ['법률·계약', 1000, 1500, BAD]].forEach(([n, a, b, col], i) => { const y = 92 + i * 30, f = E(u, 0.3 + i * 0.35, 0.8 + i * 0.35);
        el('rect', { x: LX(a), y, width: (LX(b) - LX(a)) * f, height: 20, rx: 4, fill: col, opacity: 0.75 }); tx(LX(b) + 8, y + 15, `${n} ${a}~${b}`, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 0.6 + i * 0.35) }); });
      sub(480, 404, '도메인마다 꼭대기가 옮겨 간다 → 직접 재 봐야 한다', fade(u, 2.0), { 'font-size': 14.5, 'font-weight': 700 }); } }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: '212자 시연 문서를 chunk_size=30으로 자르면 생기는 일로 맞는 것은 무엇인가?',
      o: ['8조각이 되고 문장이 청크 중간에서 끊긴다', '조항 3개로 깔끔하게 나뉜다', '자르지 않은 1조각이 된다'], a: 0,
      why: '30자는 문장보다 짧다. "플렉스타임 … 내에서"와 "자율 출퇴근한다"가 다른 청크로 갈라져 답이 반씩 나뉜다.' },
    { q: 'chunk_size=5000으로 212자 문서를 자르면 "야간근무 가산율은?" 질문에 무엇이 넘어가는가?',
      o: ['답이 든 문장 30자만', '조항 1.2 하나', '세 조항이 모두 든 212자 청크 전체'], a: 2,
      why: '문서가 통째로 한 청크라 답 30자를 위해 212자가 프롬프트에 들어간다. 86%가 질문과 무관한 글자다.' },
    { q: '조항 단위로 자를 때 keep_separator="end"를 준 이유는 무엇인가?',
      o: ['청크 수를 줄이려고', '마침표를 앞 문장 끝에 붙여 다음 청크가 ". 1.2"로 시작하지 않게 하려고', '겹침을 만들려고'], a: 1,
      why: '기본값은 구분자를 다음 조각 앞에 붙인다. "end"로 두면 1.2 조항 청크가 "1.2 휴게시간은 …"으로 깔끔하게 시작한다.' },
    { q: '같은 설정에서 chunk_overlap=20을 주었더니 아무것도 겹치지 않았다. 이유는 무엇인가?',
      o: ['LangChain이 문장 같은 조각 단위로만 겹치는데 문장이 20자보다 길어서', 'overlap은 chunk_size의 절반 이상이어야 해서', 'keep_separator와 함께 쓸 수 없어서'], a: 0,
      why: '앞 청크 끝의 조각을 통째로 다음 청크에 옮긴다. 25~30자 문장은 20자에 안 들어가니 40자를 주자 비로소 겹쳤다.' },
    { q: '예시 실험에서 chunk_size별 recall@5 곡선은 어떤 모양인가?',
      o: ['크기가 클수록 계속 오른다', '양 끝이 처지고 가운데가 솟은 ∩자', '크기와 상관없이 평평하다'], a: 1,
      why: '너무 작으면 문맥이 끊기고 너무 크면 주제가 섞여 둘 다 떨어진다. 예시에서는 700자가 0.89로 가장 높았다.' },
  ];

  const summary = [
    '212자 문서를 30자로 자르면 8조각이 되고 한 문장의 답이 두 청크에 반씩 나뉜다.',
    '5000자처럼 문서보다 큰 크기는 자르지 않는 것과 같아 답 30자를 위해 212자가 통째로 간다.',
    '조항 하나 크기로 자르면 청크마다 주제가 하나라 벡터가 또렷하고 질문과 무관한 글자가 준다.',
    'overlap은 문장 단위로 겹치므로 문장보다 커야 하고, 최적 크기는 평가셋으로 recall@k를 재서 고른다.',
  ];
  const review = [
    { q: '사내 FAQ 검색에서 답이 자꾸 반쪽만 나온다. 청크를 보니 한 문장이 두 청크에 걸쳐 있다. 먼저 해 볼 것은?',
      o: ['chunk_size를 문장·조항이 들어가도록 키우고 경계 문장이 겹치게 overlap을 준다', 'top-k를 1로 줄인다', '임베딩 차원을 늘린다'], a: 0,
      why: '너무 작은 청크는 한 문장을 나눠 갖는다. 의미 단위가 들어갈 크기로 키우고 overlap으로 경계 문장을 양쪽에 두면 반쪽 답이 준다.' },
    { q: '청크를 문서 하나 통째로 쓰게 했더니 검색은 늘 걸리는데 답변 정확도와 비용이 나빠졌다. 원인으로 알맞은 것은?',
      o: ['청크 수가 많아서 검색이 느려졌다', '한 청크에 여러 주제가 섞이고 무관한 글자까지 프롬프트에 들어간다', 'overlap이 너무 커서 같은 글이 반복된다'], a: 1,
      why: '큰 청크의 벡터는 여러 주제의 평균이라 흐려지고, LLM은 긴 컨텍스트 가운데를 놓치기 쉽다. 토큰 비용도 청크 크기만큼 든다.' },
    { q: '새 도메인(법률 계약서)에 RAG를 붙인다. chunk_size를 정하는 가장 믿을 만한 방법은?',
      o: ['기술 문서에서 잘 됐던 700자를 그대로 쓴다', '가장 작은 100자로 시작한다', '정답 조항을 아는 평가셋으로 여러 크기의 recall@k를 재서 고른다'], a: 2,
      why: '곡선의 꼭대기는 도메인마다 옮겨 간다. 예시처럼 법률은 1000~1500자 쪽이 맞을 수 있으니 직접 재 봐야 한다.' },
  ];

  R.page({ title: '청크 크기와 겹침', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
