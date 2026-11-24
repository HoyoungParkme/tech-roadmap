/* II-1-1 프롬프트 Git 버전 관리 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    person, cross, check, clock, tokens, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 파일 창: 이름 탭 + 줄. lines 는 문자열 또는 [문자열, {bg, col, plain, strike, op}]. o.shown 소수면 마지막 줄을 타이핑
  function file(x, y, w, name, lines, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 9, h = o.h || lines.length * lh + 46;
    const g = el('g', { opacity: o.op ?? 1 });
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8 }, g);
    el('path', { d: `M${x},${y + 28} V${y + 10} Q${x},${y} ${x + 10},${y} H${x + w - 10} Q${x + w},${y} ${x + w},${y + 10} V${y + 28} Z`, fill: SOFT }, g);
    mono(x + 14, y + 19, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.nameCol || MUT }, g);
    const shown = o.shown ?? lines.length;
    lines.forEach((ln, i) => { if (i >= Math.ceil(shown)) return; const [s, st] = Array.isArray(ln) ? ln : [ln, {}], yy = y + 38 + i * lh;
      const part = i === Math.ceil(shown) - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s;
      if (st.bg) el('rect', { x: x + 6, y: yy - 3, width: w - 12, height: lh, rx: 4, fill: st.bg, opacity: st.bgop ?? 1 }, g);
      const by = yy + fs * 0.85 + 1.5, a = { 'font-size': fs, opacity: st.op ?? 1 };
      if (st.plain) mono(x + 16, by, part, Object.assign(a, { fill: st.col || INK, 'font-weight': st.fw, 'text-decoration': st.strike ? 'line-through' : null }), g);
      else spans(x + 16, by, tokens(part), a, g); });
    return { h, lh, row: (i) => y + 38 + i * lh - 3 }; }
  // 깃발 (git tag)
  function flag(x, y, label, col, s, o) { o = o || {}; const g = el('g', { transform: `translate(${x} ${y}) scale(${s ?? 1})`, opacity: o.op ?? 1 });
    el('line', { x1: 0, y1: 0, x2: 0, y2: -34, stroke: col, 'stroke-width': 2.5 }, g);
    const w = tw(label, 13.5) + 18; el('path', { d: `M0,-34 H${w} L${w - 8},-25 L${w},-16 H0 Z`, fill: col }, g);
    mono(8, -20.5, label, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL }, g); return g; }
  // commit 점
  function commit(x, y, col, s, hash) { const r = 9 * (s ?? 1); if (r <= 0.2) return; el('circle', { cx: x, cy: y, r, fill: PANEL, stroke: col || INK, 'stroke-width': 3 });
    if (hash) mono(x, y + 28, hash, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col || INK, 'font-weight': 700, opacity: clamp(s ?? 1) }); }

  // ───────── 1. 코드 안 하드코딩 ─────────
  const HC = [
    'def customer_chat(question, context):',
    '    res = client.chat.completions.create(',
    '        model="gpt-4",',
    '        messages=[{"role": "system",',
    '          "content": "너는 친절한 고객 상담원이다. …"},',
    '          {"role": "user",',
    '           "content": f"컨텍스트:\\n{context}\\n\\n질문: {question}"}])',
    '    return res.choices[0].message.content',
  ];
  function s1(t, c) { const { k, u } = c;
    const hl = (i) => (k >= 1 && (i === 3 || i === 4) ? { bg: BADBG } : k === 2 && (i === 5 || i === 6) ? { bg: WARNBG } : {});
    const lines = HC.map((s, i) => [k >= 3 && i === 4 ? s : s, hl(i)]);
    const f = file(26, 26, 572, 'hardcoded_anti.py', lines, { shown: k === 0 ? lerp(0, HC.length, E(u, 0.2, 1.9)) : HC.length, op: k === 4 ? 0.55 : 1 });
    if (k === 0) { // 함수 하나가 전부: 질문·컨텍스트 → 함수 → OpenAI
      const s = pop(u, 0.6); card(770, 130, 210, 46, { rx: 10, text: 'customer_chat()', mono: true, fs: 15, stroke: INK, s });
      fly(640, 250, 700, 56, seg(u, 1.0, 1.8), 'question', { mono: true, stay: true });
      fly(900, 250, 850, 56, seg(u, 1.2, 2.0), 'context', { mono: true, stay: true, fill: INFO });
      grow(700, 72, 730, 106, seg(u, 1.3, 1.7), MUT); grow(850, 72, 810, 106, seg(u, 1.5, 1.9), MUT); grow(770, 156, 770, 216, seg(u, 1.8, 2.4), INK);
      card(770, 244, 210, 46, { rx: 10, text: 'OpenAI gpt-4', fs: 15, stroke: MUT, s: pop(u, 2.0) });
      sub(770, 306, '함수 한 개 안에 다 들어 있다', fade(u, 2.2), { 'font-size': 14 }); }
    if (k === 1 || k === 2) {
      const y4 = f.row(4) + f.lh / 2; grow(704, y4, 604, y4, k === 1 ? seg(u, 0.3, 0.9) : 1, BAD);
      tx(712, y4 - 6, '페르소나 전부가', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: k === 1 ? fade(u, 0.6) : 1 });
      tx(712, y4 + 15, '코드 속 문자열 한 줄', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: k === 1 ? fade(u, 0.6) : 1 });
      const cs = k === 1 ? pop(u, 1.2) : 1; card(775, 236, 300, 82, { rx: 12, stroke: GRID, sw: 1.5, s: cs });
      tx(640, 220, '추적되는 프롬프트 버전', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: clamp(cs) });
      mono(640, 256, '0개', { 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: clamp(cs) });
      tx(700, 256, 'prompts/ 파일 없음', { 'font-size': 14, fill: MUT, opacity: clamp(cs) }); }
    if (k === 2) { const y6 = f.row(6) + f.lh / 2;
      fly(840, 330, 330, y6, seg(u, 0.4, 1.4), '{context}', { mono: true, fill: WARN });
      fly(900, 360, 470, y6, seg(u, 0.8, 1.8), '{question}', { mono: true, fill: WARN });
      tx(612, 330, '질문을 붙이는 형식도 코드 안', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); }
    if (k >= 3) { // 한 단어 수정 → 배포 사이클 전체
      const op = k === 4 ? 0.35 : 1;
      if (k === 3) { person(700, 92, '마케팅 팀', { s: pop(u, 0.1) });
        card(845, 70, 178, 52, { rx: 14, text: '상담원 → 컨시어지?', fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.4) });
        el('path', { d: 'M760,80 L736,86 L760,92 Z', fill: ACC, opacity: fade(u, 0.5) }); }
      const steps = ['grep', '코드 수정', '테스트', 'PR·리뷰', 'CI', '배포'];
      steps.forEach((s, i) => { const x = 98 + i * 152, a = k === 3 ? seg(u, 0.6 + i * 0.25, 0.9 + i * 0.25) : 1;
        if (a <= 0) return; card(x, 324, 128, 42, { rx: 8, text: s, fs: 15, stroke: i === 5 ? BAD : INK, s: R.spring(a), op });
        if (i < 5) grow(x + 66, 324, x + 86, 324, a, MUT, { op }); });
      const bar = k === 3 ? E(u, 0.8, 2.4) : 1;
      el('rect', { x: 34, y: 362, width: 892, height: 12, rx: 6, fill: SOFT, opacity: op });
      el('rect', { x: 34, y: 362, width: 892 * bar, height: 12, rx: 6, fill: BAD, opacity: 0.8 * op });
      tx(480, 400, '한 단어 수정에 반나절', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: (k === 3 ? fade(u, 2.2) : 1) * op }); }
    if (k === 4) { [['누가 · 언제 · 왜 바꿨나', 'git blame 뿐'], ['A/B 테스트', 'if/else 분기 코드'], ['rollback', '코드 전체를 되돌림'], ['PM · 마케팅 수정', '직접 못 한다']].forEach(([a, b], i) => {
        const y = 62 + i * 66, s = pop(u, 0.2 + i * 0.35); card(778, y, 316, 54, { rx: 10, stroke: BAD, sw: 2, s }); cross(646, y, 9, s);
        tx(668, y - 3, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); tx(668, y + 17, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.35) }); }); } }

  // ───────── 2. prompts/ 파일로 분리 ─────────
  const TREE = [[0, 'myproject/', 1], [1, 'src/', 1], [2, 'chat.py', 0], [1, 'prompts/', 1], [2, 'customer_v1.txt', 0], [2, 'customer_v2.txt', 0], [2, 'summarizer_v1.txt', 0]];
  const BODY = ['너는 친절한 고객 상담원이다.', '다음 규칙을 따라라:', '- 컨텍스트에 없는 사실은 만들지 마라', '- 모르면 솔직히 모른다고 답해라', '- 답변은 3문장 이내'];
  function tree(c) { const { k, u } = c, x0 = 40, y0 = 58, rh = 38;
    TREE.forEach(([d, name, dir], i) => { const a = k === 0 ? seg(u, 0.2 + i * 0.22, 0.5 + i * 0.22) : 1; if (a <= 0) return;
      const x = x0 + d * 26, y = y0 + i * rh, isP = i >= 3, hot = (k === 1 || k === 3) && i === 4;
      if (d > 0) { const py = y0 + (i <= 2 ? (d === 1 ? 0 : 1) : (d === 1 ? 0 : 3)) * rh; el('path', { d: `M${x - 16},${py + 10} V${lerp(py + 10, y, a)} ${a >= 1 ? `H${x - 4}` : ''}`, fill: 'none', stroke: GRID, 'stroke-width': 2 }); }
      if (dir) el('path', { d: `M${x},${y - 7} h7 l3,3 h10 v14 h-20 Z`, fill: isP ? ACCBG : SOFT, stroke: isP ? ACC : MUT, 'stroke-width': 1.6, opacity: a });
      else el('rect', { x: x + 2, y: y - 9, width: 15, height: 18, rx: 2, fill: hot ? ACC : PANEL, stroke: isP ? ACC : MUT, 'stroke-width': 1.6, opacity: a });
      mono(x + 27, y + 5, name, { 'font-size': 14.5, 'font-weight': dir || hot ? 700 : 500, fill: isP ? ACC : INK, opacity: a }); });
    return (i) => [x0 + TREE[i][0] * 26 + 27 + tw(TREE[i][1], 14.5) + 8, y0 + i * rh]; }
  function s2(t, c) { const { k, u } = c, at = tree(c);
    if (k === 0) { sub(170, 340, 'src/ 는 코드', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(170, 366, 'prompts/ 는 문장', fade(u, 2.1), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      card(640, 200, 380, 120, { rx: 12, stroke: GRID, sw: 1.5, s: pop(u, 1.6) });
      tx(640, 186, 'Git 이 파일 단위로 추적한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      mono(640, 216, 'git log prompts/customer_v1.txt', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 1) { // 경로 조립 → read_text
      const parts = [['PROMPTS_DIR', INK], [' / ', MUT], ['"customer_v1"', ACC], ['.txt', INFO]]; let x = 380;
      parts.forEach(([s, col], i) => { const w = tw(s, 15) + 6, a = seg(u, 0.2 + i * 0.25, 0.6 + i * 0.25);
        mono(lerp(x, x, a), lerp(60, 92, E(a, 0, 1)), s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: a }); x += w; });
      el('rect', { x: 370, y: 70, width: x - 362, height: 32, rx: 6, fill: 'none', stroke: INK, 'stroke-width': 1.8, opacity: fade(u, 1.3) });
      const [fx, fy] = at(4); dot([[x + 12, 86], [x + 40, 86], [x + 40, fy], [fx + 6, fy]], seg(u, 1.3, 1.9), ACC, 6);
      grow(fx + 6, fy + 18, 520, 210, seg(u, 1.6, 2.1), ACC); mono(560, 182, '.read_text(encoding="utf-8")', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      card(700, 236, 400, 46, { rx: 10, text: '"너는 친절한 고객 상담원이다.\\n…"', mono: true, fs: 14, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 2.0) });
      tx(700, 290, 'load_prompt() 는 문자열을 돌려줄 뿐', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 2) { // 상수 → messages 자리
      file(360, 40, 560, 'prompt_loader.py', [
        'CUSTOMER_PROMPT = load_prompt("customer_v1")', '', 'messages=[', '  {"role": "system", "content": CUSTOMER_PROMPT},', '  {"role": "user", "content": f"…{question}"},', ']'],
        { shown: lerp(0, 6, E(u, 0.1, 1.2)) });
      el('rect', { x: 624, y: 142, width: 126, height: 25, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.4) });
      fly(560, 300, 716, 154, seg(u, 1.3, 2.1), '"너는 친절한 …"', { mono: true });
      card(640, 330, 290, 52, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 2.1) }); tx(520, 336, '코드 안 문구', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      mono(700, 338, '0줄', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); }
    if (k >= 3) { const [fx, fy] = at(4);
      file(380, 70, 400, 'prompts/customer_v1.txt', BODY.map((s, i) => [s, { plain: true, bg: k === 4 && i === 0 ? WARNBG : null }]), { shown: k === 3 ? lerp(0, 5, E(u, 0.3, 2.0)) : 5, stroke: ACC, nameCol: ACC, fs: 15 });
      grow(fx + 6, fy, 374, 110, k === 3 ? seg(u, 0.1, 0.5) : 1, ACC, { plain: true, dash: '4 5' });
      if (k === 3) { sub(580, 260, '사람이 읽는 문장만 있다 · 코드 문법 0개', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }
    if (k === 4) { person(860, 106, '마케팅 팀', { s: pop(u, 0.2) }); grow(826, 106, 790, 106, seg(u, 0.5, 0.9), ACC);
      if (Math.floor(t * 3) % 2) el('rect', { x: 600, y: 104, width: 2.5, height: 20, fill: INK, opacity: fade(u, 0.6) });
      tx(842, 176, '문장을 직접 고친다', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) });
      person(470, 330, '개발자', { s: pop(u, 1.2) }); card(620, 330, 150, 44, { rx: 22, text: '배포 ▶', fs: 15, fill: INK, stroke: 'none', color: PANEL, s: pop(u, 1.5) });
      tx(720, 336, '버튼만 누른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); } }

  // ───────── 3. Git diff · log · revert ─────────
  const OLD = '너는 친절한 고객 상담원이다.', NEW = '너는 전문적이고 정확한 컨시어지다.';
  const LOG = [['7a8c9d1', '02-15', 'bob', 'customer_v1 초안'], ['9c2e1a5', '02-22', 'alice', '환각 줄이는 제약 추가'], ['b3e4f7a', '03-01', 'alice', '페르소나 → 컨시어지']];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const typed = E(u, 1.2, 2.4);
      file(150, 70, 520, 'prompts/customer_v1.txt  (M)', [
        [OLD, { plain: true, col: BAD, strike: u > 0.9, op: 1 - 0.5 * seg(u, 0.9, 1.2) }],
        [typed > 0 ? NEW.slice(0, Math.round(NEW.length * typed)) : '', { plain: true, col: GOOD, fw: 700, bg: typed > 0 ? GOODBG : null }],
        ...BODY.slice(1).map((s) => [s, { plain: true, col: MUT }])], { fs: 15, stroke: WARN, nameCol: WARN });
      card(810, 150, 200, 92, { rx: 12, stroke: GRID, sw: 1.5, s: pop(u, 0.4) }); tx(810, 134, '수정한 것', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
      mono(810, 168, '.txt 한 줄', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.5) });
      card(810, 290, 200, 60, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 1.8) }); tx(810, 296, '코드 0줄', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); return; }
    if (k === 1) { const D = [['diff --git a/prompts/customer_v1.txt b/…', { plain: true, col: MUT }], ['@@ -1,4 +1,4 @@', { plain: true, col: INFO, fw: 700 }],
        ['-' + OLD, { plain: true, col: BAD, bg: BADBG, fw: 700 }], ['+' + NEW, { plain: true, col: GOOD, bg: GOODBG, fw: 700 }],
        [' 다음 규칙을 따라라:', { plain: true, col: MUT }], [' - 컨텍스트에 없는 사실은 만들지 마라', { plain: true, col: MUT }], [' - 모르면 솔직히 모른다고 답해라', { plain: true, col: MUT }]];
      file(60, 40, 560, '$ git diff prompts/customer_v1.txt', D, { shown: lerp(0, 7, E(u, 0.2, 1.8)), fs: 15 });
      [['−1', BAD, BADBG, '지운 줄'], ['+1', GOOD, GOODBG, '더한 줄'], ['3', MUT, 'var(--soft)', '그대로인 줄']].forEach(([n, col, bg, s], i) => { const y = 90 + i * 88, a = pop(u, 1.4 + i * 0.3);
        card(760, y, 220, 66, { rx: 12, stroke: col, fill: bg, sw: 2, s: a }); mono(690, y + 10, n, { 'font-size': 28, 'font-weight': 800, fill: col, opacity: clamp(a) });
        tx(760, y + 6, s, { 'font-size': 15, 'font-weight': 700, opacity: clamp(a) }); });
      tx(340, 360, '사람이 바로 읽고 리뷰할 수 있다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { commit(110, 200, ACC, pop(u, 0.2), 'b3e4f7a'); grow(126, 200, 186, 200, seg(u, 0.4, 0.8), ACC, { plain: true });
      const rows = [['feat(prompt): customer 페르소나 → 컨시어지로 변경', INK, null], ['이유', ACC, '마케팅 톤 가이드 v3.2 반영'], ['영향', INFO, 'customer_v1.txt 만 (코드 변경 없음)'], ['평가', GOOD, 'faithfulness 0.87 → 0.89']];
      el('rect', { x: 190, y: 64, width: 720, height: 280, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.8, opacity: fade(u, 0.5) });
      rows.forEach(([a, col, b], i) => { const y = 112 + i * 62, op = fade(u, 0.6 + i * 0.4);
        if (!b) { mono(214, y, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); return; }
        pill(250, y - 5, a, col, pop(u, 0.6 + i * 0.4), { fs: 14 }); tx(300, y, b, { 'font-size': 16, opacity: op, class: i === 3 ? 'mono' : null }); });
      pill(820, 298, '점수는 예시', WARN, pop(u, 2.2), { fs: 13.5 });
      tx(550, 384, '커밋 메시지에 왜·어디·점수를 같이 남긴다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
    // k 3·4: 이력 줄
    const X = [150, 400, 650], y0 = 92;
    el('line', { x1: 80, y1: y0, x2: k === 4 ? 900 : lerp(80, 760, k === 3 ? E(u, 0.1, 0.8) : 1), y2: y0, stroke: GRID, 'stroke-width': 3 });
    LOG.forEach(([h, d, who, msg], i) => { const s = k === 3 ? pop(u, 0.3 + i * 0.25) : 1; commit(X[i], y0, i === 2 ? (k === 4 ? OFF : ACC) : INK, s);
      mono(X[i], y0 - 22, h, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: clamp(s), fill: k === 4 && i === 2 ? OFF : INK });
      tx(X[i], y0 + 30, `${d} · ${who}`, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: clamp(s) });
      tx(X[i], y0 + 50, msg, { 'text-anchor': 'middle', 'font-size': 14, opacity: clamp(s) * (k === 4 && i === 2 ? 0.4 : 1) }); });
    if (k === 3) { tx(920, 186, 'git blame — 줄마다 누가 언제', { 'text-anchor': 'end', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.1) });
      const BL = [[2, 'alice', NEW], [0, 'bob', '다음 규칙을 따라라:'], [1, 'alice', '- 컨텍스트에 없는 사실은 만들지 마라']];
      BL.forEach(([ci, who, s], i) => { const y = 222 + i * 50, a = seg(u, 1.2 + i * 0.3, 1.6 + i * 0.3); if (a <= 0) return;
        el('rect', { x: 40, y: y - 20, width: 880, height: 38, rx: 6, fill: i === 0 ? ACCBG : SOFT, opacity: a });
        mono(54, y + 4, `${LOG[ci][0]} (${who.padEnd(5)} ${i + 1})`, { 'font-size': 14, 'font-weight': 700, fill: ci === 2 ? ACC : INK, opacity: a });
        tx(330, y + 4, s, { 'font-size': 15, opacity: a });
        el('path', { d: `M${120},${y - 20} C${120},${y - 70} ${X[ci]},${y0 + 90} ${X[ci]},${y0 + 62}`, fill: 'none', stroke: ci === 2 ? ACC : MUT, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: a * 0.7 }); });
      return; }
    // k 4: revert + bisect
    const rv = pop(u, 0.3); commit(860, y0, GOOD, rv); mono(860, y0 - 22, 'git revert b3e4f7a', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: clamp(rv) });
    tx(850, y0 + 50, '내용은 9c2e1a5 상태로', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, opacity: fade(u, 0.7) });
    el('path', { d: `M852,${y0 + 12} C840,${y0 + 100} 520,${y0 + 104} ${X[1] + 70},${y0 + 64}`, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.6) });
    tx(40, 232, 'git bisect — 반씩 잘라 문제 commit 찾기', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.0) });
    const n = 8, bw = 92, bx = 90, by = 262, step = Math.floor(clamp((u - 1.2) / 0.45, 0, 3)); let lo = 0, hi = n - 1; const bad = 5;
    for (let s = 0; s < step; s++) { const m = Math.floor((lo + hi) / 2); if (m >= bad) hi = m; else lo = m + 1; }
    for (let i = 0; i < n; i++) { const inR = i >= lo && i <= hi, a = fade(u, 1.1);
      el('rect', { x: bx + i * (bw + 8), y: by, width: bw, height: 40, rx: 6, fill: inR ? (step === 3 && i === bad ? BADBG : PANEL) : SOFT, stroke: inR ? (step === 3 && i === bad ? BAD : INK) : GRID, 'stroke-width': 2, opacity: a });
      mono(bx + i * (bw + 8) + bw / 2, by + 26, i === 0 ? 'v1.0' : i === n - 1 ? 'HEAD' : `c${i}`, { 'text-anchor': 'middle', 'font-size': 14, fill: inR ? INK : OFF, opacity: a }); }
    pill(bx + bw / 2, by + 66, 'good', GOOD, pop(u, 1.2), { fs: 13.5 }); pill(bx + 7 * (bw + 8) + bw / 2, by + 66, 'bad', BAD, pop(u, 1.2), { fs: 13.5 });
    tx(480, 398, `commit ${n}개면 3번 확인으로 범인을 찾는다`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.5) }); }

  // ───────── 4. PR 리뷰 + CI eval 게이트 ─────────
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { // paths 필터
      const PR = [['PR #41', ['src/chat.py', 'README.md'], false], ['PR #42', ['src/chat.py', 'prompts/customer_v1.txt'], true]];
      PR.forEach(([name, files, hit], i) => { const y = 110 + i * 180, s = pop(u, 0.2 + i * 0.3);
        card(170, y, 260, 120, { rx: 12, stroke: GRID, sw: 1.8, s }); tx(56, y - 36, name, { 'font-size': 15, 'font-weight': 800, opacity: clamp(s) });
        files.forEach((f, j) => mono(56, y - 4 + j * 28, f, { 'font-size': 14, fill: f.startsWith('prompts/') ? ACC : INK, 'font-weight': f.startsWith('prompts/') ? 700 : 400, opacity: clamp(s) }));
        const a = seg(u, 1.0 + i * 0.5, 1.6 + i * 0.5); dot([[300, y], [470, y]], a, hit ? ACC : OFF, 7);
        if (u > 1.6 + i * 0.5) { if (hit) { grow(560, y, 640, y, seg(u, 1.6 + i * 0.5, 2.0 + i * 0.5), ACC); card(770, y, 240, 56, { rx: 10, text: 'Prompt Evaluation ▶', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.9 + i * 0.5) }); }
          else tx(600, y + 6, '워크플로가 돌지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); } });
      // 거름망
      el('rect', { x: 470, y: 50, width: 90, height: 320, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.6) });
      for (let i = 0; i < 9; i++) el('line', { x1: 480, y1: 78 + i * 34, x2: 550, y2: 78 + i * 34, stroke: GRID, 'stroke-width': 2, opacity: fade(u, 0.6) });
      mono(515, 394, 'paths: "prompts/**"', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.7) }); return; }
    if (k === 1) { const L = [['$ git diff --name-only origin/main HEAD -- prompts/', { plain: true, col: INK, fw: 700 }], ['prompts/customer_v1.txt', { plain: true, col: ACC, fw: 700, bg: ACCBG }],
        ['', {}], ['$ echo "files=$(xargs < changed.txt)" >> $GITHUB_OUTPUT', { plain: true, col: MUT }]];
      file(40, 40, 600, 'step: 변경된 프롬프트만 추출', L, { shown: lerp(0, 4, E(u, 0.2, 1.4)) });
      card(800, 100, 220, 50, { rx: 10, text: 'changed.txt', mono: true, fs: 15, stroke: ACC, s: pop(u, 0.9) });
      fly(380, 101, 800, 100, seg(u, 0.8, 1.4), 'prompts/customer_v1.txt', { mono: true });
      grow(800, 126, 800, 214, seg(u, 1.5, 1.9), ACC); card(800, 244, 260, 52, { rx: 10, text: 'outputs.files', mono: true, fs: 15, fill: ACCBG, stroke: ACC, color: ACC, s: pop(u, 1.9) });
      tx(340, 300, '전체가 아니라 바뀐 프롬프트만 평가한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) });
      sub(340, 330, 'checkout 은 fetch-depth: 0 이어야 origin/main 과 비교된다', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 2) { // eval set → 점수 → baseline
      tx(40, 56, 'eval_set_v3.jsonl', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      for (let i = 0; i < 7; i++) el('rect', { x: 40, y: 72 + i * 36, width: 170, height: 28, rx: 5, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1 + i * 0.08) });
      for (let i = 0; i < 7; i++) mono(52, 91 + i * 36, `{"q": …, "ctx": …}`, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.1 + i * 0.08) });
      card(380, 196, 190, 96, { rx: 12, text: '새 프롬프트\n+ gpt-4', fs: 15, stroke: ACC, s: pop(u, 0.4) });
      for (let i = 0; i < 6; i++) dot([[214, 86 + i * 40], [285, 196], [475, 196], [560, 196]], seg(u, 0.6 + i * 0.12, 1.6 + i * 0.12), ACC, 5);
      const ax = R.axes(600, 70, 300, 250, { x: [0, 1], y: [0.7, 1.0], yt: [0.7, 0.8, 0.85, 0.9, 1.0], grid: true, yl: 'faithfulness' });
      el('line', { x1: 600, y1: ax.Y(0.85), x2: 900, y2: ax.Y(0.85), stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.8) });
      tx(896, ax.Y(0.85) - 8, 'baseline 0.85', { 'text-anchor': 'end', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.8) });
      const v = lerp(0.7, 0.89, E(u, 1.4, 2.3)); el('rect', { x: 700, y: ax.Y(v), width: 100, height: ax.Y(0.7) - ax.Y(v), rx: 4, fill: ACC, opacity: 0.85 * fade(u, 1.4) });
      mono(750, ax.Y(v) - 10, v.toFixed(2), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      pill(380, 330, 'report.json', INK, pop(u, 2.3), { mono: true, fs: 14 }); sub(750, 400, '점수는 예시 (커밋 메시지의 0.89)', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    if (k === 3) { // PR 코멘트 표
      el('rect', { x: 120, y: 40, width: 720, height: 320, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 });
      person(170, 86, null, { s: 0.6 }); tx(200, 82, 'github-actions 코멘트 · ## Prompt Eval', { 'font-size': 15, 'font-weight': 700 });
      const cols = [160, 380, 530, 690], H = ['지표', 'Baseline', '신규 (예시)', '결과'];
      H.forEach((h, i) => tx(cols[i], 140, h, { 'font-size': 14, fill: MUT, 'font-weight': 700 })); el('line', { x1: 150, y1: 152, x2: 810, y2: 152, stroke: GRID, 'stroke-width': 1.5 });
      [['Faithfulness', '≥ 0.85', '0.89'], ['Relevance', '≥ 0.80', '0.83'], ['Avg Latency', '≤ 1500ms', '1320ms']].forEach(([m, b, n], i) => { const y = 192 + i * 52, a = fade(u, 0.3 + i * 0.45);
        tx(cols[0], y, m, { 'font-size': 15, 'font-weight': 700, opacity: a }); mono(cols[1], y, b, { 'font-size': 15, opacity: a });
        mono(cols[2], y, n, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6 + i * 0.45) }); check(cols[3] + 14, y - 5, 9, pop(u, 0.9 + i * 0.45)); });
      tx(480, 398, '리뷰어는 diff 와 숫자를 함께 보고 승인한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k 4: 게이트
    card(150, 120, 230, 52, { rx: 10, text: 'jq .pass report.json', mono: true, fs: 15, stroke: INK, s: pop(u, 0.2) });
    grow(266, 120, 360, 120, seg(u, 0.5, 0.9), BAD); card(420, 120, 100, 46, { rx: 23, text: 'false', mono: true, fs: 16, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.9) });
    grow(472, 120, 560, 120, seg(u, 1.1, 1.5), BAD); card(630, 120, 120, 46, { rx: 8, text: 'exit 1', mono: true, fs: 16, fill: BAD, stroke: 'none', color: PANEL, s: pop(u, 1.5) });
    const s = pop(u, 1.8); card(480, 270, 420, 86, { rx: 12, stroke: BAD, sw: 2, s }); cross(310, 270, 12, s);
    tx(340, 262, 'Prompt Evaluation — 실패', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: clamp(s) });
    tx(340, 288, 'Merge 버튼이 잠긴다', { 'font-size': 15, opacity: clamp(s) }); R.lock(660, 272, true, BAD, clamp(s));
    sub(480, 360, 'pass 가 true 일 때만 merge 할 수 있다', fade(u, 2.3), { 'font-size': 14.5 }); }

  // ───────── 5. Production tag + rollback ─────────
  const TAGS = ['prompt-v2024-02-01-prod', 'prompt-v2024-03-01-prod', 'prompt-v2024-03-15-prod'];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const y = 210, n = 4 + Math.floor(clamp((u - 0.2) / 0.5, 0, 5)); el('line', { x1: 60, y1: y, x2: 60 + n * 90, y2: y, stroke: INK, 'stroke-width': 3 });
      tx(40, y - 40, 'main', { 'font-size': 15, 'font-weight': 800 });
      for (let i = 0; i < n; i++) commit(90 + i * 90, y, INK, i >= 4 ? pop(u, 0.2 + (i - 4) * 0.5) : 1);
      flag(360, y - 12, TAGS[2], ACC, pop(u, 0.5)); tx(360, y + 40, '이 commit 에 이름표', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(800, y + 40, 'main 은 계속 자란다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      card(360, 70, 180, 46, { rx: 23, text: 'origin', fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.6) }); grow(360, 160, 360, 96, seg(u, 1.8, 2.3), INFO);
      mono(380, 130, 'git push origin <tag>', { 'font-size': 14, fill: INFO, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { flag(110, 120, 'prompt-v2024-03-15-prod', ACC, 1);
      const ST = ['./deploy.sh <tag>', 'git checkout <tag>', 'docker build', 'k8s rollout'];
      ST.forEach((s, i) => { const x = 130 + i * 230; card(x, 230, 200, 56, { rx: 10, text: s, mono: true, fs: 14, stroke: i === 3 ? GOOD : INK, s: pop(u, 0.2 + i * 0.35) }); if (i < 3) grow(x + 102, 230, x + 128, 230, seg(u, 0.5 + i * 0.35, 0.8 + i * 0.35), MUT); });
      dot([[30, 230], [930, 230]], seg(u, 1.4, 2.6), ACC, 7);
      tx(480, 330, '지금 떠 있는 것 = tag 이름 하나', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.0) });
      sub(480, 360, 'main 이 몇 번 바뀌어도 배포 입력은 그대로다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { const ax = R.axes(110, 60, 560, 270, { x: [0, 10], y: [0, 15], yt: [0, 5, 10, 15], grid: true, yl: 'hallucination 률 (%)', xl: '시간' });
      const P = [[0, 5], [1, 5.2], [2, 4.8], [3, 5.1], [4, 5], [5, 5], [5.6, 11.6], [6, 12], [7, 12.3], [8, 11.8], [9, 12.1]];
      el('line', { x1: ax.X(5), y1: 60, x2: ax.X(5), y2: 330, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); tx(ax.X(5), 52, '03-15 tag 배포', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700 });
      R.line(ax, P, E(u, 0.2, 2.0), BAD); mono(ax.X(2), ax.Y(5) - 12, '5%', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.6) });
      mono(ax.X(8), ax.Y(12) - 14, '12%', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
      const s = pop(u, 2.0); card(810, 150, 220, 80, { rx: 12, stroke: BAD, sw: 2.5, fill: BADBG, s }); tx(810, 144, 'Pagerduty 알람', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: clamp(s) });
      tx(810, 168, '운영팀 호출', { 'text-anchor': 'middle', 'font-size': 14, opacity: clamp(s) }); sub(810, 260, '수치는 예시', fade(u, 2.2)); return; }
    if (k === 3) { const sel = E(u, 0.9, 1.5);
      el('rect', { x: 60, y: 50, width: 540, height: 200, rx: 10, fill: INK }); mono(80, 82, '$ git tag -l "prompt-*"', { 'font-size': 15, fill: PANEL });
      TAGS.forEach((s, i) => { const y = 120 + i * 40; mono(80, y, s, { 'font-size': 15, fill: i === 2 ? 'var(--badbg)' : 'var(--term)', opacity: fade(u, 0.1 + i * 0.15) }); });
      mono(440, 200, '← 현재 (문제)', { 'font-size': 14, fill: 'var(--badbg)', opacity: fade(u, 0.5) * (1 - sel * 0.6) });
      el('rect', { x: 70, y: lerp(178, 138, sel), width: 340, height: 32, rx: 6, fill: 'none', stroke: sel > 0.5 ? GOOD : BAD, 'stroke-width': 2.5 });
      card(330, 310, 460, 50, { rx: 10, text: './deploy.sh prompt-v2024-03-01-prod', mono: true, fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.5) });
      clock(780, 150, 52, E(u, 1.8, 2.6), GOOD); tx(780, 232, '1분 안에 복귀', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
      sub(780, 258, '같은 deploy.sh, 다른 tag', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4) { const y = 120; el('line', { x1: 60, y1: y, x2: 900, y2: y, stroke: INK, 'stroke-width': 3 });
      for (let i = 0; i < 9; i++) commit(100 + i * 95, y, i === 2 || i === 6 ? ACC : INK, 1);
      flag(290, y - 12, 'prompt-v2024-03-01-prod', GOOD, pop(u, 0.1)); flag(670, y - 12, 'prompt-v2024-03-15-prod', BAD, pop(u, 0.2));
      el('path', { d: `M290,${y + 20} V${y + 36} H670 V${y + 20}`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.5) });
      mono(480, y + 62, 'git diff <tag A> <tag B> -- prompts/', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      const parts = [['prompt-v', MUT], ['YYYY-MM-DD', ACC], ['-', MUT], ['<env>', INFO]]; let x = 300;
      parts.forEach(([s, col], i) => { mono(x, 262, s, { 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 1.1 + i * 0.15) }); x += tw(s, 20); });
      tx(300, 230, 'tag 이름 규칙', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.0) });
      [['prompt-v2024-03-15-prod', 'production'], ['prompt-v2024-03-14-staging', 'staging'], ['prompt-v2024-03-14-canary-5', '5% canary']].forEach(([s, e], i) => {
        mono(300, 304 + i * 30, s, { 'font-size': 14.5, opacity: fade(u, 1.7 + i * 0.25) }); tx(600, 304 + i * 30, e, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7 + i * 0.25) }); }); return; }
    // k 5: 브랜치 역할
    const L = [['main', '개발 · 통합', INK, 90], ['release/*', '배포 준비', INFO, 160], ['hotfix/*', '사고 대응', BAD, 230]];
    L.forEach(([n, d, col, y], i) => { const a = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3); mono(40, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + i * 0.3) });
      el('line', { x1: 150, y1: y, x2: lerp(150, 760, a), y2: y, stroke: col, 'stroke-width': 3 }); tx(790, y + 5, d, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9 + i * 0.3) });
      for (let j = 0; j < 5; j++) if (a > j / 5) commit(180 + j * 125 + i * 30, y, col, 0.8); });
    [[360, 'tag'], [640, 'tag']].forEach(([x, s], i) => { flag(x, 300, s + ' prompt-* = 스냅샷', ACC, pop(u, 1.3 + i * 0.3)); });
    card(480, 372, 560, 46, { rx: 12, text: 'PM 이 직접 고치기엔 여전히 Git 이 벽이다', fs: 15, stroke: WARN, color: INK, s: pop(u, 2.1) }); }

  const quiz = [
    { q: '프롬프트를 함수 안 문자열로 두었을 때 생기는 일은 무엇인가?',
      o: ['문구 한 단어를 고쳐도 코드 수정·PR·CI·배포를 다 거쳐야 한다', '모델이 프롬프트를 더 정확히 따른다', '프롬프트 변경 이력이 자동으로 남는다'], a: 0,
      why: '문구가 소스 코드의 일부라서 "상담원 → 컨시어지" 한 단어에도 배포 사이클 전체가 따라붙는다. 페이지 예에서는 반나절이 걸렸다.' },
    { q: 'prompts/customer_v1.txt로 뺀 뒤 코드에 남는 것은 무엇인가?',
      o: ['프롬프트 본문 전체', '파일을 읽는 load_prompt()와 변수 이름', '마케팅 팀의 승인 기록'], a: 1,
      why: '코드는 load_prompt("customer_v1")로 읽어 CUSTOMER_PROMPT에 담아 넘길 뿐이다. 문장은 .txt에만 있다.' },
    { q: '새 프롬프트를 올린 뒤 환각이 늘었다. 문제를 만든 commit을 자동으로 좁혀 가는 명령은 무엇인가?',
      o: ['git blame', 'git bisect', 'git tag'], a: 1,
      why: 'bisect는 good과 bad 사이를 반씩 잘라 확인하며 범인 commit을 찾는다. blame은 줄마다 작성자를 보여 줄 뿐이다.' },
    { q: 'prompt_eval 워크플로에서 PR merge를 막는 조건은 무엇인가?',
      o: ['PR에 src/ 파일이 들어 있을 때', 'report.json의 pass가 true가 아닐 때', '리뷰어가 코멘트를 달았을 때'], a: 1,
      why: '마지막 step이 jq .pass report.json을 보고 true가 아니면 exit 1로 CI를 실패시킨다. 실패한 검사가 merge를 잠근다.' },
    { q: '운영 중 환각률이 5%에서 12%로 뛰었다. tag 방식에서 되돌리는 방법은 무엇인가?',
      o: ['main 브랜치에서 문구를 손으로 고쳐 다시 커밋한다', 'Pagerduty 알람을 끄고 지켜본다', '직전 안정 tag 이름을 같은 deploy.sh에 넣어 다시 배포한다'], a: 2,
      why: '배포 입력이 tag 하나이므로 prompt-v2024-03-01-prod로 다시 배포하면 1분 안에 이전 프롬프트로 돌아간다.' },
  ];

  const summary = [
    '프롬프트가 코드 문자열이면 한 단어를 고쳐도 배포 사이클을 통째로 돌아야 한다.',
    'prompts/ 폴더의 .txt로 빼면 코드는 읽기만 하고 Git이 문장 변화를 줄 단위로 남긴다.',
    'PR에서는 바뀐 프롬프트만 eval을 돌리고 baseline 0.85에 못 미치면 merge를 막는다.',
    '운영은 tag로 고정하고, 사고가 나면 직전 tag로 다시 배포해 1분 안에 돌아간다.',
  ];
  const review = [
    { q: '마케팅 팀이 톤 수정을 직접 하고 싶다고 한다. 이 장의 단계 중 이것을 처음 가능하게 한 것은?',
      o: ['프롬프트를 prompts/ 폴더의 .txt로 분리한 것', 'Production tag를 붙인 것', 'git bisect를 쓴 것'], a: 0,
      why: '문장이 코드 밖 텍스트 파일로 나와야 비개발자가 손댈 수 있다. tag와 bisect는 그 뒤의 운영 도구다.' },
    { q: '프롬프트 PR의 CI가 git diff --name-only origin/main 단계에서 실패했다. 먼저 의심할 것은?',
      o: ['eval_set_v3.jsonl 파일이 너무 크다', 'checkout이 얕게 받아 origin/main 이력이 없다', 'PR 코멘트 권한이 없다'], a: 1,
      why: 'actions/checkout은 기본으로 마지막 commit 하나만 받는다. fetch-depth: 0을 줘야 origin/main과 비교할 수 있다.' },
    { q: 'prod에 지금 어떤 프롬프트가 떠 있는지 묻는 질문에 가장 빨리 답하는 방법은?',
      o: ['main 브랜치의 최신 commit을 본다', 'git blame으로 줄마다 작성자를 본다', '배포에 쓴 tag 이름을 본다'], a: 2,
      why: 'main은 계속 움직이지만 tag는 한 commit에 멈춰 있다. deploy.sh가 tag로만 배포하므로 tag 이름 하나가 답이다.' },
  ];

  R.page({ title: '프롬프트 버전 관리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
