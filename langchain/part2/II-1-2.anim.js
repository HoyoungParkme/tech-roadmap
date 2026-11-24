/* II-1-2 Text Splitters — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 153자 원문을 가로 띠(글자 위치 0 → 153)로 펴 놓고, 분할기가 자르는 자리·청크 막대·겹침 구간을 그 위에 그린다.
 * 숫자: 청크 수·길이·토큰 수는 langchain-text-splitters 와 tiktoken(cl100k_base)으로 이 글을 실제로 나눈 결과다.
 *   Character 4개(42/32/28/45자) · Recursive(25) 7개 · overlap(50/10) 4개 평균 42자 · Token(20) 8개 145토큰 · from_tiktoken_encoder(20) 8개 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const T = '인공지능(AI)은 인간의 학습, 추론, 지각 능력을 컴퓨터로 구현한 기술이다. 머신러닝은 AI의 하위 분야로, 데이터에서 패턴을 학습한다. 딥러닝은 머신러닝의 하위 분야로, 신경망을 사용한다. 최근 대규모 언어 모델(LLM)이 등장하면서 자연어 처리 분야에 혁신이 일어났다.';
  const N = 153, X0 = 60, W = 840, X = (i) => X0 + (i / N) * W;
  const SENT = [[0, 42], [44, 76], [78, 106], [108, 153]], SEPS = [42, 76, 106];
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  // 원문 띠: o.parts = [[a, b, 색]] 으로 칠하기, o.op
  function ribbon(y, h, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x: X0, y, width: W, height: h, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    (o.parts || []).forEach(([a, b, col, f]) => el('rect', { x: X(a), y, width: (X(b) - X(a)) * (f ?? 1), height: h, rx: 5, fill: col, opacity: op * 0.85 }));
    if (o.ticks !== false) [0, 50, 100, 153].forEach((v) => { mono(X(v), y + h + 18, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); });
    if (o.label) tx(X0, y - 10, o.label, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op }); }
  // 문장 이름표 (띠 안)
  function sentLabels(y, op) { ['인공지능(AI)은 …', '머신러닝은 …', '딥러닝은 …', '최근 대규모 …'].forEach((s, i) => tx(X(SENT[i][0]) + 8, y, s, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, opacity: op ?? 1 })); }
  // 청크 막대 (글자 위치에 맞춰): [a, b] 를 y 에 그린다
  function bar(a, b, y, col, o) { o = o || {}; const f = o.f ?? 1, x = X(a), w = (X(b) - X(a)) * f; if (f <= 0) return;
    el('rect', { x, y, width: w, height: o.h || 24, rx: 5, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    if (o.text && f > 0.6) mono(x + 8, y + (o.h || 24) / 2 + 5, o.text, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: o.op ?? 1 }); }

  // ---------- 1. 분할 안 함 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { pill(210, 110, 'ChatOpenAI', INFO, pop(u, 0.2), { mono: true, fs: 16 }); pill(210, 170, 'PyPDFLoader', BAD, pop(u, 0.5), { mono: true, fs: 16 });
      card(560, 140, 260, 70, { rx: 10, stroke: GRID, sw: 2, dash: '7 6', s: pop(u, 0.9) });
      tx(560, 146, 'TextSplitter', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: OFF, opacity: fade(u, 1.0) });
      cross(700, 110, 12, pop(u, 1.4));
      tx(480, 270, '일부러 자르지 않고 통째로 넣어 본다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { const gather = E(u, 1.3, 2.4);
      for (let i = 0; i < 100; i++) { const on = i < lerp(0, 100, E(u, 0.1, 1.1)); if (!on) continue;
        const gx = 60 + (i % 20) * 22, gy = 60 + Math.floor(i / 20) * 28, tx2 = 60 + (i / 100) * 840, ty = 300;
        el('rect', { x: lerp(gx, tx2, gather), y: lerp(gy, ty, gather), width: lerp(16, 8.4, gather), height: lerp(22, 30, gather), rx: 2, fill: lerp(0, 1, gather) > 0.5 ? ACCBG : PANEL, stroke: BAD, 'stroke-width': 1.2 }); }
      mono(560, 120, typed('docs = PyPDFLoader("manual.pdf").load()', E(u, 0.2, 0.9)), { 'font-size': 14.5 });
      mono(560, 150, typed('long_text = "\\n".join(...)', E(u, 1.0, 1.5)), { 'font-size': 14.5 });
      tx(60, 280, '100쪽', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(480, 365, '100쪽이 문자열 하나로 붙었다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const push = E(u, 0.3, 1.8);
      el('rect', { x: lerp(60, 330, push), y: 140, width: lerp(840, 300, push), height: 34, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      mono(lerp(70, 340, push), 162, 'long_text (수만 토큰)', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      card(480, 270, 420, 120, { rx: 12, stroke: INFO, sw: 2.4, fill: INFOBG, s: pop(u, 0.2) });
      tx(480, 236, 'llm.invoke(f"이 문서를 요약해줘:\\n{long_text}")', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', opacity: fade(u, 0.4) });
      tx(290, 274, 'gpt-4o-mini 컨텍스트 128K', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      el('rect', { x: 290, y: 288, width: 380, height: 18, rx: 4, fill: PANEL, stroke: GRID });
      el('rect', { x: 290, y: 288, width: 380 * lerp(0, 0.45, E(u, 1.4, 2.4)), height: 18, rx: 4, fill: WARN });
      sub(480, 360, '분할 단계 없이 프롬프트 하나에', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 3) { const P = [['context 초과', 'BadRequestError'], ['토큰 비용', '100쪽 = 수만 토큰'], ['중간 정보 망각', '긴 입력의 가운데가 흐려진다'], ['검색 불가', '1 chunk = 1 vector']];
      P.forEach(([a, b], i) => { const cx = 250 + (i % 2) * 460, cy = 110 + Math.floor(i / 2) * 170, s = pop(u, 0.2 + i * 0.4);
        card(cx, cy, 400, 130, { rx: 12, stroke: BAD, sw: 2, s });
        tx(cx - 180, cy - 30, a, { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3 + i * 0.4) });
        tx(cx - 180, cy - 4, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.4), class: i === 0 || i === 3 ? 'mono' : null });
        const op = fade(u, 0.5 + i * 0.4), gx = cx + 80, gy = cy + 30;
        if (i === 0) { el('rect', { x: gx - 60, y: gy - 10, width: 120, height: 16, rx: 3, fill: SOFT, opacity: op }); el('rect', { x: gx - 60, y: gy - 10, width: 150, height: 16, rx: 3, fill: BAD, opacity: op * 0.7 }); }
        if (i === 1) for (let m = 0; m < 5; m++) el('ellipse', { cx: gx - 40 + m * 22, cy: gy, rx: 9, ry: 5, fill: WARN, opacity: op });
        if (i === 2) el('path', { d: `M${gx - 70},${gy - 22} Q${gx},${gy + 30} ${gx + 70},${gy - 22}`, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: op });
        if (i === 3) { el('circle', { cx: gx - 30, cy: gy, r: 9, fill: ACC, opacity: op }); for (let m = 0; m < 3; m++) el('circle', { cx: gx + 20 + m * 18, cy: gy - 10 + (m % 2) * 18, r: 5, fill: OFF, opacity: op }); } });
      return; }
    // k4 자르기
    const cut = E(u, 0.3, 1.6);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 840, w = 840 / 6, gap = cut * 14;
      el('rect', { x: 60 + a + i * gap - gap * 2.5, y: 160, width: w - 4, height: 40, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2 }); }
    for (let i = 1; i < 6; i++) { const x = 60 + i * 140 - 2 + (i - 0.5) * cut * 14 - cut * 35; if (fade(u, 0.2 + i * 0.1) > 0) el('line', { x1: x, y1: 140, x2: x, y2: 220, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: 1 - cut }); }
    banner(480, 290, 'Text Splitter 로 먼저 쪼갠다', pop(u, 1.6));
    sub(480, 340, '다음부터 분할기 4가지를 같은 153자 글로 비교한다', fade(u, 2.1), { 'font-size': 15 }); }

  // ---------- 2. CharacterTextSplitter ----------
  const CH = [42, 32, 28, 45];
  function s2(t, c) { const { k, u } = c;
    const sentParts = () => SENT.map(([a, b], i) => [a, b, [ACC, INFO, GOOD, WARN][i]]);
    if (k === 0) { ribbon(120, 40, { parts: SENT.map(([a, b]) => [a, b, OFF]), label: 'long_text  (153자)' }); sentLabels(146, 0.9);
      tx(480, 240, '청크 0개', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.6) });
      pill(480, 290, 'from langchain_text_splitters import CharacterTextSplitter', ACC, pop(u, 1.0), { mono: true, fs: 13.5 }); return; }
    if (k === 1) { ribbon(160, 40, { parts: SENT.map(([a, b]) => [a, b, OFF]), label: 'long_text  (153자)' }); sentLabels(186);
      SEPS.forEach((p, i) => { const s = pop(u, 0.3 + i * 0.3); el('rect', { x: X(p) - 2, y: 152, width: X(p + 2) - X(p) + 4, height: 56, rx: 3, fill: WARN, opacity: 0.9 * clamp(s) });
        tx(X(p + 1), 236, '". "', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: WARN, class: 'mono', opacity: clamp(s) }); });
      const rw = X(50) - X(0), f = E(u, 1.3, 2.0);
      el('line', { x1: X0, y1: 110, x2: X0 + rw * f, y2: 110, stroke: INK, 'stroke-width': 2 }); [X0, X0 + rw * f].forEach((x) => el('line', { x1: x, y1: 102, x2: x, y2: 118, stroke: INK, 'stroke-width': 2, opacity: f }));
      mono(X0 + rw / 2, 96, 'chunk_size=50', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: f });
      sub(480, 300, '구분자는 ". " 하나뿐이다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const drop = (i) => E(u, 0.3 + i * 0.3, 1.0 + i * 0.3);
      ribbon(70, 30, { parts: sentParts().map(([a0, b0, col], i) => [a0, b0, col, 1 - E(u, 0.3 + i * 0.3, 0.6 + i * 0.3)]), ticks: false, label: 'long_text' });
      const ax = R.axes(200, 150, 600, 200, { x: [0, 60], xt: [0, 25, 50], xl: '글자 수' });
      el('line', { x1: ax.X(50), y1: 140, x2: ax.X(50), y2: 356, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      mono(ax.X(50), 136, 'size 50', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
      CH.forEach((n, i) => { const f = drop(i), y = 160 + i * 46, col = [ACC, INFO, GOOD, WARN][i];
        if (f > 0 && f < 1) el('rect', { x: lerp(X(SENT[i][0]), 200, f), y: lerp(70, y, f), width: lerp(X(SENT[i][1]) - X(SENT[i][0]), ax.X(n) - 200, f), height: 28, rx: 4, fill: col, opacity: 0.8 });
        if (f >= 1) { el('rect', { x: 200, y, width: ax.X(n) - 200, height: 28, rx: 4, fill: col, opacity: 0.85 }); mono(ax.X(n) + 8, y + 19, `${n}자`, { 'font-size': 14, 'font-weight': 700, fill: col }); }
        tx(190, y + 19, `chunk[${i}]`, { 'font-size': 13.5, 'text-anchor': 'end', class: 'mono', fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      return; }
    if (k === 3) { const texts = ['인공지능(AI)은 … 구현한 기술이다', '머신러닝은 AI의 하위 분야로, … 학습한다', '딥러닝은 머신러닝의 하위 분야로, … 사용한다', '최근 대규모 언어 모델(LLM)이 … 일어났다.'];
      texts.forEach((s, i) => { const y = 60 + i * 62, col = [ACC, INFO, GOOD, WARN][i];
        card(400, y + 20, 680, 46, { rx: 8, stroke: col, sw: 2, s: pop(u, 0.2 + i * 0.2) });
        mono(76, y + 25, s, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.2) }); mono(724, y + 25, `${CH[i]}자`, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.2) }); });
      tx(800, 105, '끝의 "." 가', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); tx(800, 128, '사라졌다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      const avg = tween(0, 36, u > 1.6 ? 1.4 + (u - 1.6) : 0, 0.8);
      mono(400, 340, `평균 ${Math.round(Math.min(36, avg))}자 · 전부 50 이하`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6) });
      sub(400, 372, '구분자 ". " 는 자르는 데 쓰이고 청크에는 남지 않는다', fade(u, 2.0)); return; }
    // k4 구분자가 없는 긴 줄
    const s = 'Retrieval augmented generation combines a retriever with a generator…';
    mono(60, 80, typed(s, E(u, 0.2, 1.2)), { 'font-size': 15 }); sub(480, 112, '". " 가 한 번도 없는 94자 한 문장', fade(u, 1.0), { 'font-size': 14.5 });
    const ax = R.axes(160, 160, 640, 120, { x: [0, 100], xt: [0, 50, 94], xl: '글자 수' });
    el('line', { x1: ax.X(50), y1: 150, x2: ax.X(50), y2: 286, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); mono(ax.X(50), 146, 'size 50', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 });
    const f = E(u, 1.2, 2.2); el('rect', { x: 160, y: 200, width: (ax.X(94) - 160) * f, height: 40, rx: 5, fill: BAD, opacity: 0.85 });
    mono(150, 226, 'chunk[0]', { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT });
    if (f > 0.95) mono(ax.X(94) + 10, 226, '94자', { 'font-size': 15, 'font-weight': 800, fill: BAD });
    tx(480, 360, '자를 곳이 없으니 한도를 넘긴 채 그대로 나온다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.3) }); }

  // ---------- 3. RecursiveCharacterTextSplitter ----------
  const REC = [[0, 24], [25, 49], [50, 71], [72, 96], [97, 117], [118, 139], [140, 153]];
  const SEPL = [['"\\n\\n"', '문단'], ['"\\n"', '줄바꿈'], ['" "', '공백 (단어)'], ['""', '글자 (최후)']];
  function ladder(x, y, o) { o = o || {};
    SEPL.forEach(([s, n], i) => { const yy = y + i * 54, st = o.state ? o.state[i] : null, col = st === 'no' ? OFF : st === 'yes' ? GOOD : INK, sc = o.pop ? o.pop(i) : 1;
      card(x + 110, yy, 220, 42, { rx: 8, stroke: st === 'yes' ? GOOD : GRID, sw: st === 'yes' ? 2.6 : 1.6, fill: st === 'yes' ? GOODBG : PANEL, s: sc });
      mono(x + 20, yy + 5, s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: clamp(sc) }); tx(x + 100, yy + 5, n, { 'font-size': 14.5, fill: col, opacity: clamp(sc) });
      mono(x - 6, yy + 5, String(i + 1), { 'font-size': 14, 'font-weight': 800, fill: MUT, 'text-anchor': 'end', opacity: clamp(sc) });
      if (st === 'no') cross(x + 200, yy, 8, 1); if (st === 'yes') check(x + 200, yy, 9, 1); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { ribbon(150, 40, { parts: SENT.map(([a, b]) => [a, b, OFF]), label: 'long_text  (153자, 줄바꿈 없음)' }); sentLabels(176);
      pill(480, 280, 'RecursiveCharacterTextSplitter', ACC, pop(u, 0.6), { mono: true, fs: 16 }); sub(480, 320, '실무 기본값으로 쓰는 분할기', fade(u, 1.2), { 'font-size': 15 }); return; }
    if (k === 1) { ladder(320, 90, { pop: (i) => pop(u, 0.2 + i * 0.35) });
      grow(620, 80, 620, 260, E(u, 1.6, 2.4), ACC); tx(640, 180, '위에서부터 시도', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      tx(140, 180, '큰 단위', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) }); tx(140, 260, '작은 단위', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { ribbon(170, 40, { parts: SENT.map(([a, b]) => [a, b, OFF]), label: 'long_text' }); sentLabels(196, 0.5);
      for (let i = 0; i < 6; i++) { const f = E(u, 0.3 + i * 0.2, 0.6 + i * 0.2); if (f <= 0) continue; const a = i * 25;
        el('rect', { x: X(a), y: 118, width: (X(25) - X(0)) * f - 3, height: 30, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 1.6 }); }
      mono(X(12.5), 138, '25', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      tx(480, 290, 'chunk_size=25 · chunk_overlap=0', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono', opacity: fade(u, 1.6) });
      sub(480, 320, '한 청크는 25자를 넘지 않게', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 3) { const st = [u > 0.6 ? 'no' : null, u > 1.2 ? 'no' : null, u > 1.8 ? 'yes' : null, null];
      ladder(80, 70, { state: st });
      const py = 70 + Math.min(2, Math.floor(clamp((u - 0.2) / 0.6, 0, 2.99))) * 54; el('path', { d: `M60,${py - 9} L72,${py} L60,${py + 9} Z`, fill: ACC, opacity: fade(u, 0.2) });
      tx(420, 80, '153자 > 25 → 더 작은 단위로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(420, 134, '"\\n\\n" 없음, "\\n" 없음', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0), class: 'mono' });
      tx(420, 188, '공백에서 자를 수 있다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
      const words = T.split(' ').slice(0, 9); let x = 420; const f = E(u, 2.0, 2.6);
      words.forEach((w, i) => { const wd = tw(w, 13.5) + 10; if (x + wd > 940) return; card(x + wd / 2, 260 + (i % 2) * 0, wd, 30, { rx: 5, stroke: GOOD, sw: 1.5, text: w, fs: 13.5, s: clamp(f * 9 - i) }); x += wd + 6 + f * 4; });
      sub(670, 312, '단어 조각을 25자까지 다시 이어 붙인다', fade(u, 2.3)); return; }
    if (k === 4) { ribbon(80, 28, { parts: SENT.map(([a, b]) => [a, b, OFF, 1]), label: '원문 (문장 4개)' });
      REC.forEach(([a, b], i) => { const y = 150 + (i % 2) * 40, col = i % 2 ? INFO : ACC; bar(a, b, y, col, { f: E(u, 0.2 + i * 0.22, 0.6 + i * 0.22), text: `${b - a}` }); });
      const hot = fade(u, 2.0); el('rect', { x: X(25) - 4, y: 182, width: X(49) - X(25) + 8, height: 32, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: hot });
      el('line', { x1: X(43), y1: 108, x2: X(43), y2: 214, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: hot });
      tx(X(25), 250, 'chunk[1] = "능력을 … 기술이다. 머신러닝은"', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: WARN, opacity: hot });
      tx(480, 300, '청크 7개 · 단어 중간에서 잘린 곳은 없다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      sub(480, 330, '줄바꿈이 없는 글이라 문장 경계는 넘겨서 묶였다', fade(u, 2.3), { 'font-size': 15 }); return; }
    // k5 왜 기본값인가
    zone(40, 60, 420, 290, '이 글 (줄바꿈 없음)', { fill: SOFT });
    ladder(70, 120, { state: ['no', 'no', 'yes', null] });
    sub(250, 336, '공백 단계에서 멈춘다', 1, { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    zone(500, 60, 420, 290, '문단이 있는 문서', { fill: ACCBG, stroke: ACC, op: fade(u, 0.6) });
    [0, 1, 2].forEach((i) => { const y = 110 + i * 70, s = pop(u, 0.8 + i * 0.3);
      card(710, y + 10, 360, 50, { rx: 8, stroke: ACC, sw: 2, s, text: `문단 ${i + 1}`, fs: 15, color: ACC });
      if (i < 2) mono(860, y + 50, '\\n\\n', { 'font-size': 14, fill: WARN, 'font-weight': 800, opacity: fade(u, 1.0 + i * 0.3), 'text-anchor': 'middle' }); });
    sub(710, 336, '"\\n\\n" 에서 먼저 잘려 문단이 통째로 남는다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // ---------- 4. chunk_overlap ----------
  const OV = [[0, 49], [44, 91], [83, 132], [127, 153]], OVW = ['머신러닝은', '머신러닝의 하위', '등장하면서'];
  function slider(x, y, w, v, max, label) { el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    el('line', { x1: x, y1: y, x2: x + w * v / max, y2: y, stroke: ACC, 'stroke-width': 6, 'stroke-linecap': 'round' });
    el('circle', { cx: x + w * v / max, cy: y, r: 11, fill: PANEL, stroke: ACC, 'stroke-width': 3 });
    mono(x + w * v / max, y - 22, String(Math.round(v)), { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    if (label) tx(x - 14, y + 5, label, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' }); }
  function ovBars(u0, u, o) { o = o || {};
    OV.forEach(([a, b], i) => { const y = 130 + i * 44, f = o.all ? 1 : E(u, u0 + i * 0.35, u0 + 0.5 + i * 0.35);
      bar(a, b, y, ACC, { f, h: 30, text: `chunk[${i}]  ${b - a}자` });
      if (i > 0 && f > 0) { const pa = OV[i][0], pb = OV[i - 1][1], op = o.all ? 1 : fade(u, u0 + 0.4 + i * 0.35);
        el('rect', { x: X(pa), y: y - 44, width: X(pb) - X(pa), height: 74, rx: 4, fill: WARN, opacity: 0.35 * op });
        if (o.words) tx(X(pb) + 6, y - 8, `"${OVW[i - 1]}"`, { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: op }); } }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { ribbon(160, 40, { parts: SENT.map(([a, b]) => [a, b, OFF]), label: 'long_text  (153자)' }); sentLabels(186);
      pill(480, 290, 'RecursiveCharacterTextSplitter(chunk_size=50, …)', ACC, pop(u, 0.5), { mono: true, fs: 14 });
      sub(480, 330, '같은 분할기에 겹침 옵션만 켠다', fade(u, 1.1), { 'font-size': 15 }); return; }
    if (k === 1) { slider(300, 150, 400, lerp(0, 10, E(u, 0.4, 1.6)), 50, 'chunk_overlap');
      mono(300, 186, '0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(700, 186, '50', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      tx(480, 260, '앞 청크 끝에서 10자 안의 단어를', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.7) });
      tx(480, 290, '다음 청크 앞에 한 번 더 넣는다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { ribbon(70, 26, { parts: SENT.map(([a, b]) => [a, b, OFF]), label: '원문' });
      ovBars(0.2, u, { words: true });
      sub(480, 330, '겹침은 단어 단위라 10자보다 짧을 수 있다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 3) { tx(60, 70, 'chunk[1] 의 시작', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      card(480, 140, 840, 70, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.2) });
      mono(80, 136, 'overlap=0', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
      mono(80, 160, '"AI의 하위 분야로, 데이터에서 패턴을 학습한다. …"', { 'font-size': 15, opacity: fade(u, 0.4) });
      tx(880, 152, '무엇의?', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.9) });
      card(480, 260, 840, 70, { rx: 10, stroke: GOOD, sw: 2.4, fill: GOODBG, s: pop(u, 1.2) });
      mono(80, 256, 'overlap=10', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
      spans_(80, 280, [['"', INK], ['머신러닝은', WARN], [' AI의 하위 분야로, 데이터에서 패턴을 학습한다. …"', INK]], fade(u, 1.4));
      check(870, 260, 11, pop(u, 1.9));
      sub(480, 350, 'chunk[1] 만 검색돼도 주어가 살아 있다', fade(u, 2.1), { 'font-size': 15.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { const ax = R.axes(120, 120, 720, 60, { x: [0, 1000], xt: [0, 100, 200, 500, 1000], xl: 'chunk_size=1000 일 때 overlap' });
      el('rect', { x: ax.X(100), y: 120, width: (ax.X(200) - ax.X(100)) * E(u, 0.3, 1.2), height: 60, fill: GOOD, opacity: 0.35 });
      tx(ax.X(150), 108, '100~200 (10~20%)', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      card(250, 300, 300, 70, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 1.4), text: '너무 크면\n같은 글자를 여러 번 임베딩', fs: 14.5 });
      card(700, 300, 300, 70, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.8), text: '너무 작으면\n경계에서 문맥이 끊긴다', fs: 14.5 }); return; }
    // k5 create_documents
    ovBars(0, u, { all: true });
    const n = Math.round(tween(0, 42, u > 1 ? u - 0.9 : 0, 0.8));
    mono(480, 360, `Document 4개 · 평균 ${n}자`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) });
    sub(480, 392, '(49 + 47 + 49 + 26) // 4 = 42', fade(u, 1.8), { class: 'mono', 'font-size': 14.5 }); }
  function spans_(x, y, parts, op) { R.spans(x, y, parts.map(([s, col]) => [s, { fill: col, 'font-weight': col === WARN ? 800 : 400 }]), { 'font-size': 15, opacity: op }); }

  // ---------- 5. TokenTextSplitter ----------
  const TOKW = [['인공지능', ['인', '공', '지', '능']], ['컴퓨터로', ['·', '·', '·', '·', '·', '·', '터', '로']], ['학습,', ['·', '·', '습', ',']]];
  const TCH = ['인공지능(AI)은 인간의 학습, 추론, 지', '각 능력을 컴퓨터로 구현한 기�', '��이다. 머신러닝은 AI의 하위 분야', '로, 데이터에서 패턴을 학습한다. 딥러닝은 �'];
  const RT = [19, 19, 19, 15, 16, 16, 20, 19];
  function tokGrid(x, y, n, o) { o = o || {}; for (let i = 0; i < n; i++) { const r = Math.floor(i / 20), cc = i % 20;
    el('rect', { x: x + cc * 22, y: y + r * 26, width: 19, height: 21, rx: 3, fill: o.col ? o.col(r) : ACCBG, stroke: ACC, 'stroke-width': 1 }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { pill(330, 150, 'TokenTextSplitter', ACC, pop(u, 0.2), { mono: true, fs: 16 }); pill(630, 150, 'tiktoken', INFO, pop(u, 0.6), { mono: true, fs: 16 });
      tx(480, 240, '글자 수 대신 LLM 이 실제로 세는 토큰 수로 자른다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.2) }); return; }
    if (k === 1) { mono(480, 90, 'encoding_name="cl100k_base"', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.2) });
      sub(480, 116, 'GPT-4 계열 토크나이저', fade(u, 0.4), { 'font-size': 14.5 });
      tokGrid(260, 170, Math.round(lerp(0, 20, E(u, 0.6, 1.8))));
      mono(480, 240, 'chunk_size=20  →  토큰 20개가 한 청크', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { TOKW.forEach(([w, ts], i) => { const y = 80 + i * 80;
        tx(60, y + 6, w, { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.2 + i * 0.4) });
        ts.forEach((s, j) => { const sc = pop(u, 0.4 + i * 0.4 + j * 0.08); card(220 + j * 40, y, 34, 34, { rx: 5, stroke: s === '·' ? BAD : ACC, sw: 1.8, fill: s === '·' ? BADBG : ACCBG, text: s === '·' ? '' : s, fs: 14, s: sc }); });
        mono(220 + ts.length * 40 + 10, y + 6, `${ts.length}토큰`, { 'font-size': 16, 'font-weight': 800, fill: ts.length > w.length ? BAD : ACC, opacity: fade(u, 0.8 + i * 0.4) }); });
      sub(330, 316, '빨간 칸 = 한 글자를 바이트 조각으로 나눈 토큰', fade(u, 1.8), { 'font-size': 14.5 });
      const ch = Math.round(tween(0, 153, u > 1.8 ? u - 1.7 : 0, 0.6)), tk = Math.round(tween(0, 145, u > 1.8 ? u - 1.7 : 0, 0.6));
      mono(800, 150, `${ch}자`, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(800, 200, `= ${tk}토큰`, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
      sub(800, 232, '이 글 전체', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { const n = Math.round(lerp(0, 145, E(u, 0.2, 1.4)));
      tokGrid(60, 70, n, { col: (r) => (u > 1.6 ? (r % 2 ? INFOBG : ACCBG) : ACCBG) });
      for (let r = 1; r < 8; r++) el('line', { x1: 50, y1: 70 + r * 26 - 3, x2: 510, y2: 70 + r * 26 - 3, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.6 + r * 0.05) });
      for (let r = 0; r < 8; r++) mono(520, 70 + r * 26 + 16, r < 7 ? '20' : '5', { 'font-size': 13.5, 'font-weight': 700, fill: r < 7 ? ACC : WARN, opacity: fade(u, 1.8 + r * 0.05) });
      mono(750, 150, `${n}토큰`, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle' });
      mono(750, 200, '청크 8개', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
      sub(750, 230, '20 × 7 + 5 = 145', fade(u, 2.2), { class: 'mono', 'font-size': 15 }); return; }
    if (k === 4) { TCH.forEach((s, i) => { const y = 60 + i * 62, sc = pop(u, 0.2 + i * 0.3); card(440, y + 16, 780, 48, { rx: 8, stroke: ACC, sw: 1.8, s: sc });
        const parts = s.split(/(�+)/).filter(Boolean).map((p) => [p, p.includes('�') ? { fill: BAD, 'font-weight': 800 } : {}]);
        R.spans(70, y + 22, parts, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.3) }); mono(810, y + 22, '20 tok', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.3) }); });
      tx(480, 330, '"기술" 의 "술" 이 두 청크로 갈라져 깨졌다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      sub(480, 358, '토큰 경계가 한글 한 글자(3바이트) 안에 걸리면 생긴다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 5) { const ax = R.axes(120, 140, 720, 50, { x: [0, 8191], xt: [0, 2000, 4000, 6000, 8191], xl: 'text-embedding-3-small 입력 한도 (토큰)' });
      el('rect', { x: 120, y: 140, width: 720 * E(u, 0.3, 1.2), height: 50, fill: SOFT });
      el('rect', { x: 120, y: 140, width: Math.max(3, ax.X(500) - 120), height: 50, fill: ACC, opacity: fade(u, 1.3) });
      tx(ax.X(500) + 10, 120, 'chunk_size=500 토큰', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      tx(480, 290, '토큰으로 재고 자르면 한도를 넘을 일이 없다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.9) });
      sub(480, 320, '글자 수로 재면 한글은 토큰이 얼마나 될지 미리 알기 어렵다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k6 Recursive + 토큰 길이
    mono(60, 60, 'RecursiveCharacterTextSplitter.from_tiktoken_encoder(chunk_size=20)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
    sub(480, 88, '같은 글을 20토큰으로 나눈 실제 결과', fade(u, 0.3), { 'font-size': 14.5 });
    const ax = R.axes(160, 110, 560, 230, { x: [0, 22], xt: [0, 10, 20] });
    el('line', { x1: ax.X(20), y1: 104, x2: ax.X(20), y2: 340, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    RT.forEach((n, i) => { const y = 116 + i * 28; hbar(160, y, ax.X(n) - 160, n, n, { h: 20, u: E(u, 0.4 + i * 0.15, 1.0 + i * 0.15), col: GOOD, text: `${n}` });
      mono(150, y + 15, `[${i}]`, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }); });
    tx(800, 170, '깨진 글자 0', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
    sub(800, 198, '공백에서 자르고', fade(u, 2.0), { 'font-size': 14.5 }); sub(800, 220, '길이는 토큰으로 잰다', fade(u, 2.1), { 'font-size': 14.5 }); }

  const quiz = [
    { q: '100쪽 PDF를 자르지 않고 문자열 하나로 LLM에 넣을 때 생기는 문제가 아닌 것은 무엇인가?',
      o: ['토큰 비용이 크게 늘어난다', '문서가 벡터 하나뿐이라 검색이 쓸모없어진다', 'PDF의 쪽 번호 metadata가 page_content에 섞인다'], a: 2,
      why: '통째로 넣으면 한도 초과, 비용, 중간 정보 망각, 1 chunk = 1 vector 문제가 생긴다. metadata가 본문에 섞이는 것은 분할과 관계없다.' },
    { q: 'CharacterTextSplitter(separator=". ", chunk_size=50)에 ". "가 하나도 없는 94자 문장을 넣으면 어떻게 되나?',
      o: ['50자에서 강제로 자른다', '94자 청크 하나가 그대로 나온다', '빈 리스트를 돌려준다'], a: 1,
      why: 'Character 분할기는 구분자에서만 자른다. 자를 곳이 없으면 한도를 넘긴 청크가 그대로 나온다.' },
    { q: '줄바꿈이 없는 153자 글을 RecursiveCharacterTextSplitter(chunk_size=25)로 나눈 결과로 맞는 것은?',
      o: ['문장 4개가 정확히 청크 4개가 된다', '25자마다 글자 단위로 잘린다', '공백에서 잘려 7개가 되고, 한 청크가 문장 경계를 넘기도 한다'], a: 2,
      why: '"\\n\\n"과 "\\n"이 없어 공백 단계까지 내려간다. 단어는 지키지만 "… 기술이다. 머신러닝은"처럼 문장을 넘겨 묶인다.' },
    { q: 'chunk_size=50, chunk_overlap=10으로 나눴을 때 chunk[1]이 "머신러닝은"으로 시작하는 이유는?',
      o: ['chunk[0] 끝에서 10자 안에 드는 단어가 다음 청크 앞에 반복되기 때문에', '문장 첫 단어부터 새 청크를 시작하는 규칙 때문에', '10자마다 새 청크를 만들기 때문에'], a: 0,
      why: 'overlap은 앞 청크의 끝 단어 중 10자 안에 드는 것을 다음 청크 앞에 다시 붙인다. 그래서 주어 "머신러닝은"이 양쪽에 나온다.' },
    { q: 'TokenTextSplitter(chunk_size=20)로 한글 글을 나눴더니 청크에 "�"가 보였다. 원인은?',
      o: ['파일 인코딩을 utf-8로 지정하지 않아서', '토큰 경계가 한글 한 글자의 바이트 중간에 걸려서', 'chunk_overlap이 0이라서'], a: 1,
      why: 'cl100k_base는 드문 한글을 바이트 조각 토큰으로 나눈다. 20토큰에서 그대로 자르면 한 글자가 두 청크로 갈라진다.' },
  ];

  const summary = [
    '긴 문서를 통째로 넣으면 한도 초과와 비용, 중간 정보 망각이 생기고 검색도 할 수 없다.',
    'Character 분할기는 구분자에서만 자르므로 구분자가 없는 긴 줄은 한도를 넘긴 채 남는다.',
    'Recursive 분할기는 문단, 줄, 공백, 글자 순으로 내려가 단어를 자르지 않는다.',
    'overlap은 경계의 단어를 다음 청크에 반복하고, 한도는 토큰으로 재야 정확하다.',
  ];
  const review = [
    { q: '사내 위키를 Recursive 분할기로 잘랐더니 청크마다 문장이 중간에 섞여 시작한다. 먼저 확인할 것은?',
      o: ['원문에 문단 사이 줄바꿈이 남아 있는지', '임베딩 모델의 차원 수', 'chunk_overlap을 0으로 줄였는지'], a: 0,
      why: 'Recursive는 "\\n\\n"과 "\\n"을 먼저 찾는다. 로딩 중에 줄바꿈이 사라지면 공백 단계까지 내려가 문장을 넘겨 묶는다.' },
    { q: '검색된 청크만 보면 "AI의 하위 분야로, …"처럼 주어가 없어 LLM이 엉뚱하게 답한다. 가장 먼저 해 볼 것은?',
      o: ['TokenTextSplitter로 바꾼다', 'chunk_overlap을 chunk_size의 10~20%로 준다', 'chunk_size를 1로 줄인다'], a: 1,
      why: 'overlap을 주면 앞 청크 끝의 "머신러닝은" 같은 경계 단어가 다음 청크 앞에도 들어가 주어가 이어진다.' },
    { q: '한글 문서를 글자 수 500자로 잘랐는데 어떤 청크는 임베딩 한도 경고가 났다. 알맞은 손질은?',
      o: ['separator를 ". "로 바꾼다', 'chunk_overlap을 늘린다', 'from_tiktoken_encoder로 길이를 토큰으로 잰다'], a: 2,
      why: '한글은 글자마다 토큰 수가 1~3개로 달라 글자 수로는 토큰 한도를 보장할 수 없다. 공백에서 자르고 토큰으로 재면 두 문제를 함께 막는다.' },
  ];

  R.page({ title: '153자 원문을 자르는 자리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
