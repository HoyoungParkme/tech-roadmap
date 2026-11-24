/* III-1-2 Few-shot CoT 와 추론 기법 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 연필 문제(12 − 4 + 3 = 11), messages 목록, 5번 투표, 생각 나무를 그린다.
 * 메시지 본문 토큰은 o200k_base 로 센 값(zero-shot 27, few-shot 7+13+30+12+30+24 = 116).
 * 정확도 62/84/91/94 와 비용 1/3/5/8 은 페이지의 예시 값. 투표·나무 점수는 페이지 데이터. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, cross, check, snippet, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const ROLE = { system: [MUT, SOFT], user: [INFO, INFOBG], assistant: [ACC, ACCBG] };
  // 메시지 한 줄: 왼쪽 위 기준, sl(0→1) 만큼 오른쪽에서 밀려 들어온다
  function row(x, y, w, role, text, sl, o) { o = o || {}; sl = sl ?? 1; if (sl <= 0) return; const [col, bg] = ROLE[role], dx = (1 - E(sl, 0, 1)) * 40, op = clamp(sl * 1.5) * (o.op ?? 1);
    el('rect', { x: x + dx, y, width: w, height: 34, rx: 8, fill: o.bad ? BADBG : bg, stroke: o.bad ? BAD : col, 'stroke-width': 1.8, opacity: op });
    tx(x + dx + 10, y + 22, role, { 'font-size': 13.5, 'font-weight': 800, fill: o.bad ? BAD : col, class: 'mono', opacity: op });
    mono(x + dx + 100, y + 22, text, { 'font-size': 14, fill: INK, opacity: op });
    if (o.tok != null) mono(x + dx + w - 10, y + 22, o.tok + 't', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }
  function llm(cx, cy, s, name) { card(cx, cy, 140, 62, { rx: 12, sw: 2.5, s });
    if (s > 0.5) { tx(cx, cy - 4, 'LLM', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 }); mono(cx, cy + 17, name || 'gpt-4o-mini', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } }
  // 온도 다이얼 (0 ~ 1)
  function dial(cx, cy, v, s) { if (s <= 0) return; const g = R.G(cx, cy, s);
    el('path', { d: 'M-34,0 A34,34 0 0 1 34,0', fill: 'none', stroke: GRID, 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
    const a = Math.PI * (1 - v); el('line', { x1: 0, y1: 0, x2: Math.cos(a) * 28, y2: -Math.sin(a) * 28, stroke: WARN, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: 0, cy: 0, r: 5, fill: WARN }, g);
    tx(0, 24, 'temperature=' + v, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: WARN }, g); }
  // 연필 한 자루
  function pencil(x, y, col, op) { el('rect', { x: x - 5, y: y - 22, width: 10, height: 36, rx: 2, fill: col, opacity: op });
    el('path', { d: `M${x - 5},${y + 14} L${x},${y + 24} L${x + 5},${y + 14} Z`, fill: col === OFF ? OFF : INK, opacity: op * 0.7 }); }

  // 1. Zero-shot
  function s1(t, c) { const { k, u } = c;
    tx(24, 34, 'messages', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    el('rect', { x: 24, y: 46, width: 560, height: 120, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 1.8, 'stroke-dasharray': '6 5' });
    if (k === 0) { sub(304, 112, '비어 있다 — system도, 예시도 없다', fade(u, 0.4), { 'font-size': 15 });
      [['예시 없음', 160], ['지시 없음', 320], ['도구 없음', 460]].forEach(([s, x], i) => { const sc = pop(u, 1.0 + i * 0.3); pill(x, 214, s, MUT, sc, { fs: 14 }); cross(x - tw(s, 14) / 2 - 28, 214, 7, sc); }); }
    if (k >= 1) row(36, 60, 536, 'user', '연필 12자루. 4자루 나눠주고 3자루 더 사면 몇 자루?', k === 1 ? seg(u, 0.2, 1.2) : 1);
    if (k === 1) note(36, 128, '본문 27 토큰 · 어떻게 풀지는 말하지 않았다', fade(u, 1.6), { fill: MUT, 'font-size': 14 });
    if (k >= 2) { llm(790, 106, k === 2 ? pop(u, 0.2) : 1); dial(790, 210, 0, k === 2 ? pop(u, 0.6) : 1);
      grow(590, 106, 715, 106, k === 2 ? E(u, 0.8, 1.4) : 1, MUT);
      if (k === 2) { dot([[590, 106], [715, 106]], seg(u, 1.4, 2.4), INFO, 7); sub(790, 268, '거의 매번 같은 답', fade(u, 1.8), { 'font-size': 14 }); } }
    // 연필 (아래)
    const px = 60, py = 340;
    for (let i = 0; i < 12; i++) { const gone = k === 3 && i >= 8 && E(u, 1.2, 1.8) > 0.5;
      pencil(px + i * 24, py, gone ? OFF : WARN, k === 0 ? fade(u, 1.6 + i * 0.04) : 1); }
    if (k <= 1) return;
    if (k === 3) { row(36, 120, 536, 'assistant', '9자루입니다.', seg(u, 0.2, 1.0), { bad: true }); cross(560, 137, 8, pop(u, 0.9));
      sub(304, 182, '예시 응답 · 중간 식 없이 곧장 추측', fade(u, 1.0), { 'font-size': 14 });
      for (let i = 0; i < 3; i++) pencil(px + (12 + i) * 24 + 10, py, GOOD, pop(u, 1.9 + i * 0.12));
      mono(px + 160, 400, '12 − 4 = 8', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.5) });
      mono(px + 330, 400, '8 + 3 = 11', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) });
      card(780, 340, 150, 44, { rx: 22, text: '정답 11자루', fs: 16, stroke: GOOD, color: GOOD, s: pop(u, 2.3) }); } }

  // 2. Few-shot CoT — messages 가 쌓인다
  const FEW = [['system', '단계별로 풀어라', 7], ['user', '사과 3개, 2개 더 사면?', 13], ['assistant', '1) 처음: 3개↵2) 추가: +2개↵3) 합계: 5개↵답: 5개', 30],
    ['user', '쿠키 8개, 3개 먹으면?', 12], ['assistant', '1) 처음: 8개↵2) 소비: -3개↵3) 남은: 5개↵답: 5개', 30], ['user', '연필 12자루, 4자루 나눠주고 3자루 더 사면?', 24]];
  const UPTO = [1, 3, 5, 6, 6, 6, 6];   // beat k에서 보이는 메시지 수
  const ANS = ['1) 처음: 12자루', '2) 나눠줌: 12 − 4 = 8자루', '3) 추가: 8 + 3 = 11자루', '답: 11자루'];
  function tokBar(x, y, n, max, w, col, label, o) { o = o || {};
    el('rect', { x, y, width: w, height: 18, rx: 4, fill: SOFT });
    el('rect', { x, y, width: Math.max(2, w * n / max), height: 18, rx: 4, fill: col, opacity: 0.85 });
    tx(x - 10, y + 14, label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: col });
    mono(x + w * n / max + 8, y + 14, Math.round(n) + ' 토큰', { 'font-size': 14, 'font-weight': 700, fill: col }); }
  function s2(t, c) { const { k, u } = c, n = UPTO[k], nPrev = k > 0 ? UPTO[k - 1] : 0;
    FEW.slice(0, n).forEach(([role, text, tk], i) => { const fresh = i >= nPrev; row(24, 34 + i * 42, 560, role, text, fresh ? seg(u, 0.2 + (i - nPrev) * 0.5, 1.0 + (i - nPrev) * 0.5) : 1, { tok: tk, op: k >= 4 && i < 5 ? 0.75 : 1 }); });
    if (k >= 1 && k <= 2) { const yy = 34 + (k === 1 ? 2 : 4) * 42 + 17; el('path', { d: `M596,${yy - 42} C620,${yy - 42} 620,${yy} 596,${yy}`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.2) });
      tx(628, yy - 16, k === 1 ? '패턴 시연: 처음 → 변화 → 결과' : '같은 패턴 한 번 더', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) }); }
    // 입력 토큰 막대
    const used = FEW.slice(0, n).reduce((a, m) => a + m[2], 0), usedPrev = FEW.slice(0, nPrev).reduce((a, m) => a + m[2], 0);
    const cur = k === 0 ? tween(0, used, u) : tween(usedPrev, used, u);
    tokBar(150, 330, 27, 120, 400, INFO, 'Zero-shot');
    tokBar(150, 362, cur, 120, 400, ACC, 'Few-shot');
    sub(350, 404, '메시지 본문 토큰 (o200k_base)', 1, { 'font-size': 13.5 });
    if (k === 3) note(628, 290, '예시 뒤에 진짜 질문', fade(u, 1.0), { fill: INFO });
    if (k < 4) return;
    // 응답 (오른쪽)
    const lines = k === 4 ? 1 : k === 5 ? 3 : 4;
    el('rect', { x: 610, y: 34, width: 330, height: 34 + lines * 32, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
    tx(622, 54, 'assistant (응답)', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, class: 'mono' });
    ANS.slice(0, lines).forEach((s, i) => { const fresh = (k === 4 && i === 0) || (k === 5 && i >= 1) || (k === 6 && i === 3);
      mono(622, 84 + i * 32, fresh ? typed(s, E(u, 0.3 + (k === 5 ? (i - 1) * 0.8 : 0), 1.1 + (k === 5 ? (i - 1) * 0.8 : 0))) : s, { 'font-size': 14.5, 'font-weight': i === 3 ? 800 : 400, fill: i === 3 ? GOOD : INK }); });
    if (k === 4) dot([[584, 265], [600, 150], [610, 84]], seg(u, 0.1, 0.8), INFO, 6);
    if (k === 5) { el('path', { d: 'M830,108 C870,112 870,136 846,140', fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: fade(u, 1.0) }); }
    if (k === 6) { card(775, 232, 300, 40, { rx: 20, text: '정확도 62% → 84% (예시)', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.0) });
      card(775, 284, 300, 40, { rx: 20, text: '입력 27 → 116 토큰', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.4) }); } }

  // 3. Self-consistency — 5번 투표
  function s3(t, c) { const { k, u } = c, b = c.beat, votes = b.votes || [], pv = (c.prev && c.prev.votes) || [];
    // 재사용하는 few-shot 프롬프트
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1; card(110, 200, 170, 110, { rx: 10, stroke: ACC, fill: ACCBG, s });
      if (s > 0.5) { tx(110, 176, 'few-shot', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(110, 198, 'messages', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono' });
        mono(110, 228, '116 토큰', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); } }
    // 집계판
    const bx = 700, by = 60;
    tx(bx, by - 18, 'Counter(answers)', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: k === 0 ? fade(u, 0.3) : 1 });
    const cnt = {}; votes.forEach((v) => { cnt[v.answer] = (cnt[v.answer] || 0) + 1; });
    const keys = ['11자루', '5자루'];
    keys.forEach((kk, i) => { const y = by + 10 + i * 46, n = k === 5 ? (cnt[kk] || 0) : 0;
      tx(bx, y + 18, kk, { 'font-size': 15, 'font-weight': 700, fill: i ? BAD : GOOD, opacity: k === 0 ? fade(u, 0.6 + i * 0.3) : 1 });
      el('rect', { x: bx + 70, y: y + 4, width: 150, height: 20, rx: 4, fill: SOFT, opacity: k === 0 ? fade(u, 0.6 + i * 0.3) : 1 });
      if (n) { el('rect', { x: bx + 70, y: y + 4, width: 30 * n * E(u, 0.3 + i * 0.3, 1.2 + i * 0.3), height: 20, rx: 4, fill: i ? BAD : GOOD });
        mono(bx + 228, y + 19, String(n), { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.2 + i * 0.3) }); } });
    if (k === 0) { note(300, 330, '여러 답을 세어 다수결을 낼 준비', fade(u, 1.2)); return; }
    if (k === 1) { note(220, 360, '앞 장면의 예시 포함 messages를 그대로 쓴다', fade(u, 1.0)); return; }
    // 5 갈래
    const shownN = votes.length, prevN = pv.length;
    for (let i = 0; i < 5; i++) { const y = 70 + i * 62, lane = [[196, 200], [300, y], [520, y]];
      el('path', { d: `M196,200 C250,200 250,${y} 300,${y} L520,${y}`, fill: 'none', stroke: GRID, 'stroke-width': 2 });
      mono(312, y - 8, '호출 ' + (i + 1), { 'font-size': 13.5, fill: MUT });
      if (i < shownN) { const fresh = i >= prevN, f = fresh ? seg(u, 0.2 + (i - prevN) * 0.5, 1.0 + (i - prevN) * 0.5) : 1;
        if (fresh) dot(lane, f, INFO, 6);
        if (f >= 1 || !fresh) { const v = votes[i]; card(580, y, 100, 34, { rx: 17, text: v.answer, fs: 15, stroke: v.ok ? GOOD : BAD, color: v.ok ? GOOD : BAD, fill: v.ok ? PANEL : BADBG, s: fresh ? pop(u, 1.0 + (i - prevN) * 0.5) : 1 }); } } }
    if (k === 3) dial(420, 384, 0.7, pop(u, 0.2));
    if (k === 4) mono(24, 400, 'answers = ["11자루", "11자루", "5자루", "11자루", "11자루"]', { 'font-size': 14, opacity: fade(u, 1.8) });
    if (k === 5) { const f = b.finalVote; banner(790, 200, `최종: ${f.answer} (${f.count}/${f.total}표)`, pop(u, 1.6));
      mono(790, 246, 'most_common(1) → ("11자루", 4)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) });
      sub(790, 290, '오답 1개는 4표에 묻힌다 · 정확도 91% (예시)', fade(u, 2.2), { 'font-size': 14 }); } }

  // 4. Tree of Thoughts — 펼치고, 점수 매기고, 잘라 낸다
  const ROOT = { x: 300, y: 50 }, BR = [{ x: 145, y: 160 }, { x: 380, y: 160 }, { x: 525, y: 160 }], LF = [{ x: 70, y: 290, p: 0 }, { x: 220, y: 290, p: 0 }, { x: 380, y: 290, p: 1 }];
  function s4(t, c) { const { k, u } = c, tr = c.beat.tree;
    card(ROOT.x, ROOT.y, 300, 44, { rx: 10, text: '연필 12 · −4 · +3 = ?', fs: 16, stroke: INK, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { pill(ROOT.x, ROOT.y + 64, 'expand(node) → 후보 3개 + 점수', ACC, pop(u, 1.0), { fs: 14, mono: true }); note(80, 330, '한 번에 한 답이 아니라 여러 후보를 만든다', fade(u, 1.6)); return; }
    const best = k === 6;
    const brs = (tr && tr.branches) || [];
    brs.forEach((bb, i) => { const P = BR[i], g = k === 1 ? E(u, 0.2 + i * 0.25, 0.8 + i * 0.25) : 1, pruned = k >= 3 && i === 2, on = best && i === 0;
      grow(ROOT.x, ROOT.y + 22, P.x, P.y - 20, g, on ? ACC : pruned ? OFF : MUT, { plain: true, sw: on ? 4 : 2.2 });
      if (g < 1) return;
      card(P.x, P.y, 140, 40, { rx: 8, text: bb.label, fs: 14, stroke: on ? ACC : pruned ? OFF : INK, color: pruned ? OFF : INK, sw: on ? 3 : 1.8, s: k === 1 ? pop(u, 0.8 + i * 0.25) : 1 });
      if (k >= 2) card(P.x + 66, P.y - 20, 34, 26, { rx: 13, text: String(bb.score), fs: 14, mono: true, fill: pruned ? SOFT : WARNBG, stroke: pruned ? OFF : WARN, color: pruned ? OFF : WARN, s: k === 2 ? pop(u, 1.2 + i * 0.25) : 1 });
      if (pruned) { cross(P.x, P.y, 12, k === 3 ? pop(u, 0.3) : 1); sub(P.x, P.y + 40, 'beam 밖', k === 3 ? fade(u, 0.5) : 1, { fill: BAD, 'font-weight': 700 }); } });
    if (k === 1) note(620, 330, '가지 3개가 생긴다', fade(u, 1.8));
    if (k === 2) { snippet(600, 28, ['{"candidates": [', ' {"text": "먼저 12-4 계산", "score": 9},', ' {"text": "먼저 4+3 계산", "score": 5},', ' {"text": "한 번에 추측", "score": 2}]}'], { fs: 13.5, op: fade(u, 0.3), w: 350 });
      sub(775, 170, 'response_format = json_object', fade(u, 0.8), { 'font-size': 14 }); return; }
    if (k < 3) return;
    const leaves = []; brs.forEach((bb, i) => (bb.leaves || []).forEach((l) => leaves.push({ ...l, bi: i })));
    leaves.forEach((l, j) => { const P = LF[j], B = BR[l.bi], g = k === 3 ? E(u, 0.6 + j * 0.25, 1.2 + j * 0.25) : 1, cut = k >= 5 && j === 1, on = best && j === 0;
      grow(B.x, B.y + 20, P.x, P.y - 20, g, on ? ACC : cut ? OFF : MUT, { plain: true, sw: on ? 4 : 2.2 });
      if (g < 1) return;
      card(P.x, P.y, 140, 40, { rx: 8, text: l.text, fs: 13.5, mono: true, stroke: on ? ACC : cut ? OFF : INK, color: cut ? OFF : INK, sw: on ? 3 : 1.8, s: k === 3 ? pop(u, 1.2 + j * 0.25) : 1 });
      card(P.x + 66, P.y - 20, 34, 26, { rx: 13, text: String(l.score), fs: 14, mono: true, fill: cut ? SOFT : WARNBG, stroke: cut ? OFF : WARN, color: cut ? OFF : WARN, s: k === 3 ? pop(u, 1.6 + j * 0.25) : 1 });
      if (cut) cross(P.x, P.y, 12, k === 5 ? pop(u, 0.6) : 1); });
    if (k === 3) { note(620, 230, 'frontier = 상위 2개 가지', fade(u, 0.4), { fill: INFO }); note(620, 260, '두 가지만 자식을 낳는다', fade(u, 1.8), { fill: MUT }); return; }
    // 오른쪽: 점수순 목록
    const order = leaves.map((l, j) => ({ ...l, j })).sort((a, b2) => b2.score - a.score);
    tx(620, 60, 'cands.sort(score, reverse=True)', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: MUT });
    order.forEach((l, r) => { const y = 92 + r * 46, cut = k >= 5 && r >= 2, s = k === 4 ? pop(u, 0.3 + r * 0.3) : 1;
      card(780, y, 300, 38, { rx: 8, stroke: cut ? OFF : r === 0 ? ACC : GRID, sw: r === 0 ? 2.5 : 1.6, s });
      if (s > 0.5) { mono(645, y + 5, String(l.score).padStart(2, ' '), { 'font-size': 15, 'font-weight': 800, fill: cut ? OFF : WARN }); mono(680, y + 5, l.text, { 'font-size': 14, fill: cut ? OFF : INK }); }
      if (cut) cross(915, y, 8, k === 5 ? pop(u, 0.6) : 1); });
    if (k === 5) { el('line', { x1: 620, y1: 160, x2: 940, y2: 160, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) }); mono(940, 232, 'frontier = cands[:2]', { 'text-anchor': 'end', 'font-size': 13.5, fill: BAD, opacity: fade(u, 0.5) }); }
    if (k === 6) { banner(780, 250, '12-4=8 → +3=11 (10점)', pop(u, 0.8));
      sub(780, 290, 'expand 호출 3번 · 정확도 94% · 비용 ×8 (예시)', fade(u, 1.4), { 'font-size': 14 }); } }

  // 5. 네 기법 비교
  const T = [['Zero-shot', 62, 1, '분류 · FAQ 단답'], ['Few-shot CoT', 84, 3, '일반 챗봇 · 요약'], ['Self-consistency', 91, 5, '의료 · 법률 · 금융'], ['Tree of Thoughts', 94, 8, '올림피아드 · 알고리즘']];
  function icon(i, cx, cy, s) { if (s <= 0) return; const g = R.G(cx, cy, s);
    if (i === 0) el('line', { x1: -26, y1: 0, x2: 26, y2: 0, stroke: INK, 'stroke-width': 3, 'marker-end': 'url(#ra-ah)' }, g);
    if (i === 1) { [-12, -4, 4].forEach((d, j) => el('rect', { x: -22 + j * 4, y: d - 6, width: 34, height: 20, rx: 3, fill: j === 2 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 1.8 }, g)); }
    if (i === 2) { for (let j = 0; j < 5; j++) el('line', { x1: -26, y1: -16 + j * 8, x2: 18, y2: -16 + j * 8, stroke: j === 2 ? BAD : GOOD, 'stroke-width': 2.5 }, g); el('circle', { cx: 24, cy: 0, r: 5, fill: GOOD }, g); }
    if (i === 3) { el('path', { d: 'M0,-18 L-20,2 M0,-18 L0,2 M0,-18 L20,2 M-20,2 L-28,18 M-20,2 L-12,18 M0,2 L4,18', fill: 'none', stroke: INK, 'stroke-width': 2.2 }, g); el('circle', { cx: 0, cy: -18, r: 4, fill: INK }, g); } }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { T.forEach(([n], i) => { const x = 130 + i * 233, s = k === 0 ? pop(u, 0.2 + i * 0.35) : 1;
        icon(i, x, 60, s); tx(x, 112, n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.4 + i * 0.35) : 1 }); });
      if (k === 0) { ['예시 없이 바로', '예시 2~3개', 'N번 호출 + 다수결', '가지 탐색 + 자기평가'].forEach((d, i) => sub(130 + i * 233, 138, d, fade(u, 0.6 + i * 0.35), { 'font-size': 14 }));
        tx(40, 230, '이 장 예제의 LLM 호출 수', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
        [1, 1, 5, 3].forEach((n, i) => { for (let j = 0; j < n; j++) el('circle', { cx: 130 + i * 233 - (n - 1) * 11 + j * 22, cy: 280, r: 8, fill: n > 1 ? WARN : INFO, opacity: fade(u, 1.8 + j * 0.12) });
          mono(130 + i * 233, 316, n + '번', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.0) }); });
        sub(480, 370, 'ToT는 뿌리와 남은 두 가지를 펼쳐 expand 3번', fade(u, 2.2), { 'font-size': 14 }); return; }
      // k1: 정확도 기둥, k2: 비용 기둥
      const base = 380;
      T.forEach(([n, acc, cost], i) => { const x = 130 + i * 233, ga = k === 1 ? E(u, 0.2 + i * 0.3, 1.0 + i * 0.3) : 1;
        const ah = (acc - 40) * 3.2 * ga; el('rect', { x: x - 60, y: base - ah, width: 50, height: ah, rx: 4, fill: INFO, opacity: 0.85 });
        mono(x - 35, base - ah - 8, acc + '%', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: k === 1 ? fade(u, 1.0 + i * 0.3) : 1 });
        if (k === 2) { const gc = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3), ch = cost * 24 * gc; el('rect', { x: x + 10, y: base - ch, width: 50, height: ch, rx: 4, fill: WARN, opacity: 0.85 });
          mono(x + 35, base - ch - 8, '×' + cost, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.0 + i * 0.3) }); } });
      el('line', { x1: 40, y1: base, x2: 930, y2: base, stroke: MUT, 'stroke-width': 1.8 });
      tx(40, 404, k === 1 ? '파랑 정확도 · 예시 값' : '파랑 정확도 · 주황 비용(Zero-shot=1배) · 예시 값', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      if (k === 2) mono(930, 404, 'SC ×5 = 호출 수 · 토큰은 3×5=15배', { 'text-anchor': 'end', 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      return; }
    if (k === 3) { T.forEach(([n, , , use], i) => { const y = 70 + i * 82, s = pop(u, 0.2 + i * 0.35);
        icon(i, 90, y, s); tx(150, y + 6, n, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) });
        grow(370, y, 500, y, E(u, 0.5 + i * 0.35, 0.9 + i * 0.35), MUT);
        card(700, y, 340, 50, { rx: 25, text: use, fs: 16, stroke: i === 1 ? ACC : GRID, color: i === 1 ? ACC : INK, sw: i === 1 ? 2.5 : 1.8, s: pop(u, 0.8 + i * 0.35) }); });
      return; }
    if (k === 4) { // 계단: 아래에서 위로만 올라간다
      [['Few-shot CoT부터', '가성비 기준선'], ['모자라면 Self-consistency', 'N = 3~5'], ['그래도 모자라면 ToT', '비용 8배(예시) 감수']].forEach(([a, d], i) => { const x = 100 + i * 270, y = 330 - i * 90, s = pop(u, 0.2 + i * 0.45);
        el('rect', { x, y: y - 30, width: 250, height: 60 + i * 90, rx: 6, fill: i === 0 ? ACCBG : SOFT, stroke: i === 0 ? ACC : GRID, 'stroke-width': 2, opacity: s });
        tx(x + 14, y - 4, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.45) }); tx(x + 14, y + 20, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.45) }); });
      note(100, 60, '간단한 일에 ToT부터 꺼내면 과설계다', fade(u, 1.8), { fill: BAD }); return; }
    // k5: 다음은 ReAct — 추론에 도구를 붙인다
    const cx = 480, cy = 220, r = 110, P = [['Thought', -90, INFO], ['Action', 30, WARN], ['Observation', 150, GOOD]];
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': '2 6' });
    P.forEach(([n, a, col], i) => { const x = cx + r * Math.cos(a * Math.PI / 180), y = cy + r * Math.sin(a * Math.PI / 180), s = pop(u, 0.3 + i * 0.4);
      card(x, y, 140, 42, { rx: 21, text: n, fs: 16, stroke: col, color: col, fill: PANEL, s }); });
    const ang = -90 + 360 * E(u, 1.4, 2.8); if (u > 1.4) el('circle', { cx: cx + r * Math.cos(ang * Math.PI / 180), cy: cy + r * Math.sin(ang * Math.PI / 180), r: 7, fill: ACC });
    tx(cx, cy + 6, '다음: ReAct', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.2) });
    sub(cx, 392, '여기까지는 생각만 했다. 다음 장은 생각 사이에 도구 호출을 끼운다', fade(u, 1.8), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'Zero-shot으로 연필 문제를 물었을 때 응답에 빠져 있던 것은 무엇인가?',
      o: ['user 메시지', '12 − 4 = 8 같은 중간 식', 'temperature 설정'], a: 1,
      why: 'messages에는 질문 한 줄만 있었고 모델은 중간 식 없이 9자루라고 추측했다. 정답은 12 − 4 + 3 = 11자루다.' },
    { q: 'Few-shot CoT에서 모델이 "1) 처음: 12자루"부터 쓰기 시작하는 이유는 무엇인가?',
      o: ['앞의 user/assistant 예시 두 쌍이 같은 번호 형식을 보여 주었기 때문이다', 'temperature를 0으로 두었기 때문이다', '모델이 연필 문제를 미리 학습했기 때문이다'], a: 0,
      why: '예시 쌍이 "처음 → 변화 → 결과" 형식을 보여 주면 모델은 마지막 질문에도 그 형식을 이어 쓴다. 대신 메시지 본문이 27토큰에서 116토큰으로 는다.' },
    { q: 'Self-consistency에서 temperature를 0.7로 올리는 이유는 무엇인가?',
      o: ['응답을 더 빨리 받으려고', '토큰 비용을 줄이려고', '같은 질문을 여러 경로로 풀게 해 답을 모아 투표하려고'], a: 2,
      why: 'temperature 0이면 5번 불러도 거의 같은 답이라 투표가 의미 없다. 흔들어 푼 5개 중 4표를 얻은 11자루를 고른다.' },
    { q: 'beam=2인 Tree of Thoughts에서 2점짜리 "한 번에 추측" 가지는 어떻게 되는가?',
      o: ['첫 정렬에서 상위 2개에 들지 못해 펼치지 않는다', '점수가 낮아도 한 번은 자식을 만든다', '마지막에 다시 점수를 매겨 되살린다'], a: 0,
      why: '점수 9와 5 가지만 frontier에 남고 2점 가지는 버려진다. 그래서 expand 호출은 뿌리와 두 가지, 모두 3번이다.' },
    { q: '일반 챗봇에 추론 기법을 처음 붙일 때 권하는 출발점은 무엇인가?',
      o: ['Tree of Thoughts', 'Few-shot CoT', 'Self-consistency N=5'], a: 1,
      why: 'Few-shot CoT를 기준선으로 쓰고 모자랄 때만 Self-consistency, ToT 순으로 올린다. 예시 값 기준 비용은 3배, 5배, 8배로 커진다.' },
  ];

  const summary = [
    '예시 없이 질문만 던지면 모델은 중간 식 없이 추측해 연필 문제를 9자루라고 틀린다.',
    '풀이가 적힌 예시 두 쌍을 앞에 두면 모델이 같은 형식으로 12 − 4 = 8, 8 + 3 = 11을 적는다.',
    'Self-consistency는 온도를 올려 5번 풀고 다수결로 오답 1개를 묻는다.',
    'ToT는 후보에 점수를 매겨 상위 가지만 펼친다. 정확도가 오를수록 호출 비용도 커진다.',
  ];
  const review = [
    { q: 'Self-consistency를 붙였는데 5번 모두 똑같은 오답이 나왔다. 먼저 확인할 것은?',
      o: ['Counter 대신 평균을 써야 한다', 'temperature가 0으로 남아 있어 답이 흔들리지 않는다', '호출 수를 2번으로 줄여야 한다'], a: 1,
      why: '온도가 0이면 같은 프롬프트에 거의 같은 답이 나와 투표가 한 표나 다름없다. 0.7처럼 올려야 서로 다른 풀이가 모인다.' },
    { q: 'Few-shot 예시를 넣은 프롬프트로 Self-consistency를 5번 돌린다. 메시지 본문 토큰은 대략 몇 배가 되는가?',
      o: ['Zero-shot 1번의 5배', 'Few-shot 1번과 같다', 'Few-shot 1번의 5배, 이 예제로는 116 × 5 = 580토큰'], a: 2,
      why: '호출마다 예시가 통째로 들어가 116토큰이 5번 나간다. 비교표의 SC 5배는 호출 수만 센 값이다.' },
    { q: '사내 FAQ 봇이 짧은 정답을 빨리 내야 한다. 어떤 기법이 맞는가?',
      o: ['Zero-shot', 'Tree of Thoughts', 'Self-consistency N=5'], a: 0,
      why: 'FAQ 단답은 다단계 추론이 필요 없어 가장 싸고 빠른 Zero-shot으로 충분하다. ToT는 비용이 8배(예시)라 과설계다.' },
  ];

  R.page({ title: '추론 기법 4가지 — 같은 연필 문제', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
