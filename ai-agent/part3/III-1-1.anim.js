/* III-1-1 Chain of Thought — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 사과 문제(7 − 3 − 2), 메시지 JSON, 응답 본문, 출력 토큰을 그린다.
 * 토큰 수는 o200k_base(gpt-4o-mini 토크나이저)로 센 값: 직접 답 "남은 사과는 4개입니다." 10, CoT 응답 본문 80.
 * 정확도 30% / 80% 는 페이지의 예시 값, 17.7→78.7 · 10.4→40.7 은 Kojima 2022 가 보고한 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, cross, check, snippet, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));

  // 사과 한 알: st = 'full' | 'eaten' | 'skip'(먹었어야 하는데 남은 것)
  function apple(cx, cy, st, s) { s = s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s);
    if (st === 'eaten') { el('circle', { cx: 0, cy: 0, r: 15, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, g); return; }
    el('circle', { cx: 0, cy: 0, r: 15, fill: BAD, opacity: st === 'skip' ? 0.35 : 0.85, stroke: st === 'skip' ? BAD : 'none', 'stroke-width': 2.5, 'stroke-dasharray': st === 'skip' ? '4 3' : null }, g);
    el('path', { d: 'M0,-14 Q2,-22 7,-24', fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g); }
  function apples(x, y, st, s) { for (let i = 0; i < 7; i++) apple(x + i * 46, y, st(i), s ? s(i) : 1); }

  // LLM 상자
  function llm(cx, cy, s, name) { card(cx, cy, 150, 66, { rx: 12, sw: 2.5, s, fill: PANEL, stroke: INK });
    if (s > 0.5) { tx(cx, cy - 4, 'LLM', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 }); mono(cx, cy + 18, name || 'gpt-4o-mini', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } }
  // 역할 꼬리표가 붙은 메시지 상자 (왼쪽 위 기준). lines 는 한 줄 이상
  function msgBox(x, y, w, role, lines, o) { o = o || {}; const fs = o.fs || 14, lh = fs + 8, h = lines.length * lh + 34, op = o.op ?? 1;
    const col = role === 'user' ? INFO : role === 'assistant' ? ACC : MUT, bg = role === 'user' ? INFOBG : role === 'assistant' ? ACCBG : SOFT;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: bg, stroke: col, 'stroke-width': 2, opacity: op });
    tx(x + 12, y + 19, role, { 'font-size': 13.5, 'font-weight': 800, fill: col, class: 'mono', opacity: op });
    lines.forEach((s, i) => mono(x + 12, y + 30 + fs + i * lh, s, { 'font-size': fs, fill: INK, opacity: op }));
    return h; }
  // 토큰 칸: n 개를 per 개씩 줄 바꿔 채운다 (f: 0→1 만큼)
  function tokenBlocks(x, y, n, f, col, per) { per = per || 20; const k = Math.round(n * clamp(f));
    for (let i = 0; i < k; i++) el('rect', { x: x + (i % per) * 13, y: y + Math.floor(i / per) * 13, width: 10, height: 10, rx: 2, fill: col, opacity: 0.85 }); }

  const Q = '사과 7개에서 3개 먹고 또 2개 먹으면 몇 개 남나?';
  const MSG = ['messages = [', '  {"role": "user",', `   "content": "${Q}"},`, ']'];

  // 1. 직접 답
  function s1(t, c) { const { k, u } = c;
    snippet(24, 40, MSG.map((s, i) => (k === 0 ? typed(s, E(u, 0.2 + i * 0.35, 0.6 + i * 0.35)) : s)), { fs: 13.5, w: 500 });
    const ap = (i) => (k === 0 ? pop(u, 1.4 + i * 0.12, 0.5) : 1);
    const st = (i) => (k >= 3 && i < 3 ? 'eaten' : k >= 3 && i < 5 ? 'skip' : 'full');
    apples(70, 330, st, ap);
    if (k === 0) { note(48, 386, '−3, −2 뺄셈이 두 번 들어간 문제', fade(u, 2.1), { fill: MUT }); return; }
    // 호출
    llm(770, 107, k === 1 ? pop(u, 0.2) : 1);
    grow(530, 107, 690, 107, k === 1 ? E(u, 0.5, 1.3) : 1, MUT);
    if (k === 1) { dot([[530, 107], [690, 107]], seg(u, 1.3, 2.3), INFO, 7);
      pill(610, 160, '풀이 지시 없음', BAD, pop(u, 1.6), { fs: 14 }); return; }
    // 응답
    const sl = k === 2 ? E(u, 0.2, 1.0) : 1;
    grow(770, 142, 770, 196, sl, ACC);
    msgBox(560, 200, 370, 'assistant', ['"남은 사과는 4개입니다."'], { op: k === 2 ? fade(u, 0.8) : 1 });
    tokenBlocks(574, 278, 10, k === 2 ? E(u, 1.3, 2.2) : 1, ACC);
    mono(574 + 140, 288, '출력 10 토큰', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 2 ? fade(u, 2.0) : 1 });
    if (k === 2) { note(48, 386, '중간 식이 없어 어디서 틀렸는지 알 수 없다', fade(u, 2.2), { fill: MUT }); return; }
    // k3: 빼먹은 두 번째 뺄셈
    const a = E(u, 0.2, 0.9), b = E(u, 1.0, 1.8);
    el('path', { d: 'M50,300 V290 H210 V300', fill: 'none', stroke: INK, 'stroke-width': 2, opacity: a });
    mono(130, 282, '7 − 3 = 4', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: a });
    el('path', { d: 'M188,360 V370 H304 V360', fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: b });
    mono(246, 390, '− 2 건너뜀', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: b });
    card(460, 330, 120, 40, { rx: 20, text: '모델 답 4', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.6) });
    card(460, 380, 120, 34, { rx: 17, text: '정답 2', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.9) });
    const acc = tween(c.prev && c.prev.accuracy.direct, c.beat.accuracy.direct, u);
    note(580, 352, '100문제 정확도', fade(u, 2.0), { 'font-size': 14, fill: MUT });
    hbar(700, 338, 160, acc, 100, { col: BAD, text: Math.round(acc) + '%', h: 20 });
    sub(780, 384, '예시 값', fade(u, 2.0)); }

  // 2. CoT 프롬프트 한 줄
  const SFX = "Let's think step by step.";
  function s2(t, c) { const { k, u } = c;
    const joined = k >= 2;
    const lines = joined ? ['messages = [', '  {"role": "user",', '   "content": f"{question}\\n{cot_suffix}"},', ']'] : MSG;
    snippet(24, 40, lines, { fs: 13.5, w: 500 });
    llm(770, 107, 1);
    grow(530, 107, 690, 107, 1, MUT);
    if (k === 0) { [['질문 그대로', 230], ['모델 그대로', 400]].forEach(([s, x], i) => { const sc = pop(u, 0.4 + i * 0.4); card(x, 178, 150, 36, { rx: 18, stroke: GOOD, s: sc }); check(x - 50, 178, 8, sc); tx(x - 34, 183, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }); });
      note(48, 260, '바뀌는 것은 프롬프트 한 줄뿐이다', fade(u, 1.6), { 'font-size': 17, 'font-weight': 800 }); return; }
    // k1: 마법의 한 줄
    const sx = 60, sy = 190;
    if (k === 1) { snippet(sx, sy, [`cot_suffix = "${SFX}"`], { fs: 15, op: fade(u, 0.3) });
      pill(270, 268, '파인튜닝 없음', MUT, pop(u, 1.2), { fs: 14 }); pill(420, 268, '예시 없음', MUT, pop(u, 1.5), { fs: 14 }); pill(550, 268, '도구 없음', MUT, pop(u, 1.8), { fs: 14 }); return; }
    // k2 이후: user 메시지 본문 = 질문 + 줄바꿈 + suffix
    const fly = k === 2 ? E(u, 0.2, 1.0) : 1;
    if (k === 2 && fly < 1) R.fly(300, 205, 220, 250, fly, SFX, { fill: ACC, mono: true });
    msgBox(24, 196, 500, 'user', [Q, k === 2 ? typed(SFX, E(u, 0.9, 1.7)) : SFX], { fs: 14, op: k === 2 ? fade(u, 0.6) : 1 });
    if (k === 2) { dot([[530, 107], [690, 107]], seg(u, 1.8, 2.6), INFO, 7); sub(270, 300, 'user 메시지 하나에 두 줄', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k3: 응답 모양이 바뀐다
    const y0 = 300; tx(24, y0 - 6, '응답 모양', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('rect', { x: 24, y: y0 + 4, width: 220, height: 30, rx: 8, fill: SOFT, stroke: GRID });
    mono(36, y0 + 24, '4개입니다.', { 'font-size': 13.5, fill: MUT });
    mono(254, y0 + 24, '10 토큰', { 'font-size': 13.5, fill: MUT });
    const gh = E(u, 0.2, 1.6);
    el('rect', { x: 560, y: 200, width: 370, height: 30 + 150 * gh, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
    ['Let\'s think step by step.', 'Step 1: 처음 7개', 'Step 2: 7 - 3 = 4', 'Step 3: 4 - 2 = 2', '따라서 2개'].forEach((s, i) => { const f = clamp(gh * 5 - i); if (f > 0) mono(574, 222 + i * 28, typed(s, f), { 'font-size': 14 }); });
    mono(920, 396, '80 토큰', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
    card(400, 392, 300, 34, { rx: 17, text: 'MultiArith 17.7% → 78.7%', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.9) });
    sub(400, 372, 'Kojima 2022 · text-davinci-002', fade(u, 2.1)); }

  // 3. 단계별 추론 (응답 본문 + 사과)
  const OUT = ["Let's think step by step.", 'Step 1: 처음에 사과는 7개 있습니다.', 'Step 2: 3개를 먹으면 7 - 3 = 4개가 남습니다.', 'Step 3: 다시 2개를 먹으면 4 - 2 = 2개가 남습니다.', '따라서 남은 사과는 2개입니다.'];
  function s3(t, c) { const { k, u } = c, x = 24, y = 34, lh = 34;
    el('rect', { x, y, width: 520, height: 214, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
    tx(x + 12, y + 20, 'assistant · message.content', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, class: 'mono' });
    const shown = k + 1;   // k0: 1줄 … k4: 5줄
    if (k === 5) el('rect', { x: x + 12, y: y + 34 + 4 * lh + 2, width: 300, height: lh - 8, rx: 5, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: E(u, 0.4, 1.0) * 0.8 });
    OUT.slice(0, Math.min(shown, 5)).forEach((s, i) => { const cur = i === Math.min(shown, 5) - 1 && k <= 4;
      if (cur) el('rect', { x: x + 6, y: y + 34 + i * lh, width: 508, height: lh - 4, rx: 6, fill: PANEL, opacity: 0.9 });
      mono(x + 14, y + 56 + i * lh, cur ? typed(s, E(u, 0.2, 1.2)) : s, { 'font-size': 14, 'font-weight': cur ? 700 : 400 }); });
    // 사과 (오른쪽)
    const ax = 616;
    const st = (i) => ((k >= 2 && i < 3) || (k >= 3 && i < 5) ? 'eaten' : 'full');
    for (let i = 0; i < 7; i++) apple(ax + i * 44, 92, st(i), k === 1 ? pop(u, 0.4 + i * 0.1, 0.5) : k === 0 ? 0 : 1);
    if (k >= 1) mono(ax - 20, 150, '7개', { 'font-size': 16, 'font-weight': 800, opacity: k === 1 ? fade(u, 1.2) : 1 });
    if (k >= 2) { const a = k === 2 ? E(u, 0.6, 1.4) : 1;
      cross(ax + 44, 92, 9, a); mono(ax + 120, 150, '7 − 3 = 4', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: a });
      card(ax + 250, 146, 52, 34, { rx: 8, text: '4', fs: 17, mono: true, stroke: INFO, color: INFO, s: k === 2 ? pop(u, 1.6) : 1 }); }
    if (k >= 3) { const a = k === 3 ? E(u, 0.3, 1.2) : 1, fl = k === 3 ? E(u, 0.2, 0.9) : 1;
      // 앞 결과 4 가 다음 식의 입력으로 내려온다
      el('path', { d: `M${ax + 250},163 C${ax + 250},200 ${ax + 60},190 ${ax + 60},212`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: fl });
      mono(ax + 120, 236, '4 − 2 = 2', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: a });
      card(ax + 250, 232, 52, 34, { rx: 8, text: '2', fs: 17, mono: true, stroke: GOOD, color: GOOD, s: k === 3 ? pop(u, 1.5) : 1 });
      if (k === 3) note(ax - 20, 290, '직접 답이 빼먹던 바로 그 단계', fade(u, 2.0), { fill: GOOD }); }
    if (k >= 4) { const a = k === 4 ? E(u, 0.9, 1.6) : 1;
      el('rect', { x: x + 12, y: y + 34 + 4 * lh + 2, width: 50, height: lh - 8, rx: 5, fill: 'none', stroke: WARN, 'stroke-width': 2.4, opacity: a });
      if (k === 4) note(ax - 20, 290, '"따라서" 뒤가 최종 답이다', fade(u, 1.6), { fill: WARN }); }
    if (k === 5) { snippet(24, 270, ['m = re.search(r"따라서.*?(\\d+)개", text)', 'final = int(m.group(1)) if m else None'], { fs: 14.5 });
      R.fly(240, 192, 760, 340, seg(u, 1.0, 2.0), '2', { mono: true, fill: GOOD });
      if (u > 2.0) { card(760, 340, 170, 46, { rx: 10, text: 'final = 2', fs: 18, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 2.0) }); }
      sub(760, 392, '최종 답: 2개', fade(u, 2.3), { 'font-size': 14 }); } }

  // 4. 정확도 비교 (100문제 격자)
  function grid100(x, y, hits, f, col, missCol) { const cs = 19; for (let i = 0; i < 100; i++) { const s = clamp(f * 100 - i); if (s <= 0) continue;
      const r = Math.floor(i / 10), q = i % 10, hit = hits != null && i < hits;
      el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 3, fill: hits == null ? OFF : hit ? col : missCol, opacity: (hits == null ? 0.6 : hit ? 0.9 : 0.35) * s }); } }
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {}, gx = 40, gy = 70;
    tx(gx, 50, 'GSM8K test[:100]', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    const hits = k === 3 ? Math.round(tween(0, b.accuracy.direct, u)) : k >= 4 ? Math.round(k === 4 ? tween(30, b.accuracy.cot, u) : 80) : null;
    grid100(gx, gy, hits, k === 0 ? E(u, 0.2, 1.8) : 1, k >= 4 ? GOOD : WARN, BAD);
    if (k === 0) { note(gx, 290, '같은 100문제로 두 방식을 비교한다', fade(u, 2.0)); return; }
    if (k <= 2) { // 두 갈래 호출
      const lane = (y, label, sfx, col, s) => { card(560, y, 170, 40, { rx: 10, text: label, fs: 15, stroke: col, color: col, s }); if (s > 0.5) mono(660, y + 5, sfx, { 'font-size': 14, fill: col }); };
      grow(250, 170, 460, 110, k === 1 ? E(u, 0.2, 0.9) : 1, MUT); grow(250, 170, 460, 230, k === 1 ? E(u, 0.4, 1.1) : 1, MUT);
      lane(110, 'use_cot=False', 'suffix = ""', WARN, k === 1 ? pop(u, 0.9) : 1);
      lane(230, 'use_cot=True', 'suffix = "\\nLet\'s think…"', GOOD, k === 1 ? pop(u, 1.2) : 1);
      if (k === 1) { note(300, 330, '다른 조건은 전부 같다', fade(u, 1.8)); return; }
      // k2: 마지막 숫자 뽑기
      el('rect', { x: 300, y: 300, width: 630, height: 44, rx: 8, fill: SOFT, stroke: GRID });
      const reply = '... so she makes 9 * 2 = $18 every day.';
      mono(316, 328, reply, { 'font-size': 14.5 });
      const hx = 316 + tw('... so she makes 9 * 2 = $', 14.5);
      el('rect', { x: hx - 3, y: 308, width: tw('18', 14.5) + 6, height: 28, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: E(u, 0.6, 1.2) });
      R.fly(hx + 10, 322, 820, 388, seg(u, 1.2, 2.1), '18', { mono: true });
      if (u > 2.1) card(820, 388, 120, 36, { rx: 18, text: 'nums[-1] = 18', fs: 13.5, mono: true, stroke: ACC, color: ACC });
      sub(450, 388, '예시 응답 · 끝에 마침표가 있어도 마지막 숫자를 잡는다', fade(u, 1.8)); return; }
    // k3~: 막대
    const bx = 330, bw = 420, ad = k === 3 ? tween(p.accuracy && p.accuracy.direct, b.accuracy.direct, u) : b.accuracy.direct, ac = k === 4 ? tween(0, b.accuracy.cot, u) : b.accuracy.cot;
    note(bx, 120, '직접 답', 1, { fill: WARN }); hbar(bx + 90, 104, bw, ad, 100, { col: WARN, text: Math.round(ad) + '%', h: 22 });
    if (k >= 4) { note(bx, 170, 'CoT', 1, { fill: GOOD }); hbar(bx + 90, 154, bw, ac, 100, { col: GOOD, text: Math.round(ac) + '%', h: 22 }); }
    sub(bx + 90 + bw / 2, 210, '정확도 · 예시 값', 1, { 'font-size': 14 });
    mono(gx, 290, (k === 3 ? 'direct_hits = ' : 'cot_hits = ') + (hits ?? 0), { 'font-size': 16, 'font-weight': 800, fill: k >= 4 ? GOOD : WARN });
    if (k === 4) card(860, 205, 90, 36, { rx: 18, text: '+50%p', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.6) });
    if (k === 5) { // 논문 보고값
      const ax = R.axes(400, 262, 470, 120, { x: [0, 100], y: [0, 2], xt: [0, 50, 100] });
      [['MultiArith', 17.7, 78.7], ['GSM8K', 10.4, 40.7]].forEach(([n, a, z], i) => { const y = 280 + i * 54, g = E(u, 0.2 + i * 0.4, 1.4 + i * 0.4);
        tx(392, y + 22, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' });
        el('rect', { x: ax.X(0), y, width: Math.max(2, ax.X(a) - ax.X(0)) * g, height: 16, rx: 3, fill: OFF });
        el('rect', { x: ax.X(0), y: y + 20, width: Math.max(2, ax.X(z) - ax.X(0)) * g, height: 16, rx: 3, fill: INFO });
        mono(ax.X(a) + 6, y + 13, a + '%', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4 + i * 0.4) });
        mono(ax.X(z) + 6, y + 33, z + '%', { 'font-size': 13.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4 + i * 0.4) }); });
      tx(400, 250, 'Kojima 2022 보고값 (회색 직접 · 파랑 Zero-shot CoT)', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 0.2) }); } }

  // 5. 한계와 선택
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { tx(480, 60, 'CoT를 켜면 함께 늘어나는 것', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['출력 토큰', '풀이까지 다 쓴다'], ['응답 시간', '토큰 수에 비례'], ['출력 단가', '입력의 3~5배']].forEach(([a, d], i) => { const x = 180 + i * 300, s = pop(u, 0.3 + i * 0.4);
        card(x, 190, 240, 110, { rx: 12, stroke: WARN, sw: 2, s }); tx(x, 180, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.4 + i * 0.4) });
        tx(x, 212, d, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.5 + i * 0.4) }); });
      return; }
    // 토큰 칸 비교 (k1 이후 위쪽에 남긴다)
    const td = tween(p.tokens && p.tokens.direct, b.tokens.direct, u), tc = k === 1 ? tween(0, b.tokens.cot, u) : b.tokens.cot;
    tx(40, 50, '직접 답', { 'font-size': 15, 'font-weight': 700, fill: WARN }); tokenBlocks(130, 40, Math.round(td), 1, WARN, 40);
    mono(130 + 10 * 13 + 10, 50, Math.round(td) + ' 토큰', { 'font-size': 14, 'font-weight': 700, fill: WARN });
    tx(40, 92, 'CoT', { 'font-size': 15, 'font-weight': 700, fill: ACC }); tokenBlocks(130, 82, Math.round(tc), 1, ACC, 40);
    mono(130 + 40 * 13 + 10, 92, Math.round(tc) + ' 토큰', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    if (k === 1) { card(800, 74, 110, 40, { rx: 20, text: '× 8', fs: 18, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.5) });
      sub(480, 170, 'o200k_base로 센 값 · 출력 토큰은 입력보다 비싸다', fade(u, 1.8), { 'font-size': 14 }); return; }
    const y0 = 160;
    if (k === 2 || k === 3) { const on = k === 2, items = on ? [['다단계 계산', 'GSM8K · MATH'], ['논리 추론', 'Big-Bench · ARC'], ['계획 수립', '일정 · 코드 구조'], ['"왜"를 묻는 분석', '설명이 필요한 질문']]
        : [['단순 사실 회수', '"프랑스 수도?"'], ['번역 · 요약', '형식 변환'], ['1-step 분류', '감정 · 스팸'], ['짧은 응답이 중요', '실시간 시스템']];
      tx(40, y0 + 10, on ? 'CoT를 켠다' : 'CoT를 끈다', { 'font-size': 17, 'font-weight': 800, fill: on ? GOOD : BAD });
      items.forEach(([a, d], i) => { const x = 40 + (i % 2) * 450, y = y0 + 36 + Math.floor(i / 2) * 104, s = pop(u, 0.3 + i * 0.35);
        card(x + 205, y + 40, 410, 84, { rx: 12, stroke: on ? GOOD : BAD, sw: 2, s });
        if (on) check(x + 36, y + 40, 11, s); else cross(x + 36, y + 40, 10, s);
        tx(x + 64, y + 36, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.35) });
        tx(x + 64, y + 62, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.35) }); });
      return; }
    if (k === 4) { // 질문 유형으로 켜고 끈다 + max_tokens
      card(160, 260, 190, 50, { rx: 10, text: '질문 도착', fs: 16, s: pop(u, 0.2) });
      card(420, 260, 170, 70, { rx: 10, text: '다단계 추론?', fs: 16, stroke: INFO, color: INFO, s: pop(u, 0.5) });
      grow(255, 260, 335, 260, E(u, 0.5, 0.9), MUT);
      grow(505, 245, 650, 200, E(u, 1.0, 1.5), GOOD); grow(505, 275, 650, 320, E(u, 1.0, 1.5), MUT);
      card(760, 200, 200, 44, { rx: 22, text: '예 → CoT 켬', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.5) });
      card(760, 320, 200, 44, { rx: 22, text: '아니오 → 직접 답', fs: 15, stroke: WARN, color: WARN, s: pop(u, 1.7) });
      const mx = 130 + 30 * 13 - 2; el('line', { x1: mx, y1: 74, x2: mx, y2: 112, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', opacity: fade(u, 2.0) });
      mono(mx + 6, 128, 'max_tokens로 상한', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) });
      return; }
    // k5: 다음 기법
    tx(480, 180, '풀이를 더 단단하게 만드는 다음 기법', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    [['Few-shot CoT', '풀이 예시를 함께 준다', 'III-1-2'], ['Self-consistency', '여러 번 풀고 다수결', 'III-1-2'], ['Tree of Thoughts', '가지를 펼쳐 탐색', 'III-1-2']].forEach(([a, d, ch], i) => { const x = 180 + i * 300, s = pop(u, 0.3 + i * 0.35);
      card(x, 290, 260, 110, { rx: 12, stroke: i === 0 ? ACC : GRID, sw: i === 0 ? 2.5 : 1.8, s });
      tx(x, 274, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: i === 0 ? ACC : INK, opacity: fade(u, 0.4 + i * 0.35) });
      tx(x, 302, d, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.35) });
      mono(x, 328, ch, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.35) }); }); }

  const quiz = [
    { q: '풀이 없이 답만 요청했을 때 모델이 "4개"라고 답한 원인은 무엇인가?',
      o: ['질문에 숫자가 너무 많아서 문장을 잘못 읽었다', '7 − 3 = 4 까지만 하고 두 번째 뺄셈 − 2를 건너뛰었다', 'temperature가 높아 답이 무작위로 나왔다'], a: 1,
      why: '7 − 3 − 2 = 2 인데 모델은 중간 결과 4에서 멈췄다. 중간 식이 없으니 어느 단계를 빠뜨렸는지 응답만 보고는 알 수 없다.' },
    { q: 'Zero-shot CoT를 쓰려고 프롬프트에서 실제로 바꾸는 것은 무엇인가?',
      o: ['질문 끝에 "Let\'s think step by step." 한 줄을 붙인다', '풀이 예시 두세 개를 messages에 넣는다', '모델을 추론 전용 모델로 다시 학습한다'], a: 0,
      why: '질문과 모델은 그대로 두고 user 메시지 끝에 한 줄만 붙인다. 예시를 넣는 것은 다음 장의 Few-shot CoT다.' },
    { q: 'CoT 응답에서 두 번째 뺄셈을 빼먹지 않게 해 주는 것은 무엇인가?',
      o: ['마지막 줄의 "따라서" 마커', '응답이 길어져 모델이 더 오래 생각한 것', '앞 단계의 중간 결과 4를 다음 식이 그대로 받아 쓰는 것'], a: 2,
      why: 'Step 2에서 적어 둔 4가 Step 3의 입력이 되어 4 − 2 = 2를 계산한다. "따라서"는 답을 뽑기 쉽게 해 줄 뿐이다.' },
    { q: '정확도 평가 코드에서 정규식을 "끝의 숫자"가 아니라 "마지막 숫자"를 찾게 바꾼 이유는 무엇인가?',
      o: ['CoT 응답은 "…= $18." 처럼 마침표로 끝나 끝자리 숫자 패턴이 실패하기 때문이다', '숫자가 하나뿐인 응답에서만 채점하려고', '쉼표가 든 숫자를 버리려고'], a: 0,
      why: '끝에 마침표가 붙으면 (-?\\d+)\\s*$ 는 아무것도 못 잡아 정답도 오답으로 센다. 마지막 숫자를 고르면 풀이가 긴 응답도 공정하게 채점된다.' },
    { q: 'CoT를 끄는 편이 나은 질문은 무엇인가?',
      o: ['여행 일정을 짜 달라는 계획 질문', '연필 개수를 여러 번 더하고 빼는 산수', '"프랑스 수도는?" 같은 단순 사실 질문'], a: 2,
      why: '한 번에 꺼낼 수 있는 사실은 풀이가 정확도를 올리지 못하고 출력 토큰만 10에서 80처럼 늘린다.' },
  ];

  const summary = [
    '풀이 없이 답만 시키면 모델은 7 − 3 − 2 문제에서 두 번째 뺄셈을 빼먹고 4개라고 답하곤 한다.',
    '질문 끝에 "Let\'s think step by step." 한 줄만 붙여도 응답이 단계별 풀이로 바뀐다.',
    '중간 결과를 식으로 적으면 그 값이 다음 단계의 입력이 되어 빼먹을 자리가 사라진다.',
    '대가는 출력 토큰이다. 이 예제는 10토큰이 80토큰이 되므로 다단계 문제에만 켠다.',
  ];
  const review = [
    { q: '고객 문의를 감정(긍정/부정)으로만 나누는 분류기에 CoT를 켰더니 비용만 늘었다. 가장 그럴듯한 이유는?',
      o: ['한 단계로 끝나는 분류라 풀이가 정확도를 올리지 못한다', 'CoT는 영어 질문에서만 효과가 있다', '분류에는 temperature를 높여야 CoT가 듣는다'], a: 0,
      why: 'CoT 이득은 연쇄가 긴 문제에서 나온다. 1-step 분류는 정확도가 그대로인데 출력 토큰만 몇 배로 는다.' },
    { q: 'CoT로 정확도를 재 보니 직접 답보다 오히려 낮게 나왔다. 응답을 열어 보니 풀이는 맞았다. 먼저 의심할 것은?',
      o: ['모델이 풀이를 지어냈다', '채점 코드가 마침표로 끝나는 긴 응답에서 숫자를 못 뽑았다', '100문제가 너무 적다'], a: 1,
      why: '끝자리 숫자만 찾는 정규식은 "…= $18." 같은 CoT 응답에서 실패한다. 마지막 숫자를 뽑게 고치면 같은 응답이 정답으로 채점된다.' },
    { q: '사과 문제에서 직접 답은 "4개", CoT는 "2개"였다. 두 응답의 차이를 가장 잘 설명하는 것은?',
      o: ['CoT 응답은 더 큰 다른 모델이 낸 것이다', '직접 답 호출에는 질문 문장이 빠져 있었다', 'CoT 응답이 출력 토큰을 더 써서 7 − 3 = 4와 4 − 2 = 2를 따로 적었다'], a: 2,
      why: '모델과 질문은 같고 한 줄만 다르다. CoT는 80토큰을 들여 중간 식을 적었고 그 덕에 두 번째 뺄셈까지 수행했다.' },
  ];

  R.page({ title: 'Chain of Thought — 같은 질문, 두 가지 답', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
