/* IV-2-2 BERT vs GPT — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 같은 Transformer 줄기에서 갈라진 두 가지. 차이는 "어텐션 마스크 한 장"(5×5 격자)이다.
 *   BERT(인코더) = 파랑(INFO), GPT(디코더) = 청록(ACC), 인코더-디코더 = 주황(WARN), RAG = 초록(GOOD)
 * 숫자는 페이지 데이터·코드 주석에서만 읽는다. HF 모델 출력값(0.61 / 0.91 / 생성 문장)은 실행하지 못해 '예시'로 표시한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const BADBG = C.BADBG;

  function note(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op ?? 1 }, a || {})); }
  // 토큰 타일 (가운데 기준). o: {col, fill, s, op, mask, strike}
  function tok(cx, cy, s, o) { o = o || {}; const w = Math.max(44, tw(s, 15) + 20);
    const g = card(cx, cy, w, 36, { rx: 7, text: s, fs: 15, fw: 700, stroke: o.col || INK, fill: o.fill || PANEL, color: o.tcol || o.col || INK, s: o.s, op: o.op, dash: o.dash });
    if (o.strike) el('line', { x1: -w / 2 + 6, y1: 0, x2: w / 2 - 6, y2: 0, stroke: MUT, 'stroke-width': 2 }, g);
    return w; }
  // 토큰 줄: 왼쪽 x 부터 이어 붙인 중심 좌표를 돌려준다
  function rowPos(x, toks, gap) { gap = gap ?? 8; let cx = x; return toks.map((s) => { const w = Math.max(44, tw(s, 15) + 20), c = cx + w / 2; cx += w + gap; return c; }); }

  // ---------- 1. 갈림길: 마스크 한 장 ----------
  const TOK5 = ['나는', '어제', '영화', '를', '봤다'];
  const CS = 34;
  // 5×5 마스크 격자. vis(r, c) → 0(안 그림) ~ 1, val(r,c) → 1|0
  function maskGrid(x0, y0, col, colBg, vis, val, focus, fop) {
    TOK5.forEach((s, c) => tx(x0 + c * CS + CS / 2 - 1, y0 - 10, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 }));
    TOK5.forEach((s, r) => tx(x0 - 8, y0 + r * CS + CS / 2 + 5, s, { 'font-size': 13.5, fill: r === focus ? INK : MUT, 'text-anchor': 'end', 'font-weight': r === focus ? 800 : 600 }));
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { const x = x0 + c * CS, y = y0 + r * CS, v = vis(r, c), one = val(r, c);
      el('rect', { x, y, width: CS - 3, height: CS - 3, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1.2 });
      if (v <= 0) continue;
      el('rect', { x, y, width: CS - 3, height: CS - 3, rx: 4, fill: one ? col : SOFT, opacity: v * (one ? 0.85 : 1) });
      mono(x + (CS - 3) / 2, y + (CS - 3) / 2 + 5, one ? '1' : '0', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: one ? PANEL : OFF, opacity: v }); }
    if (focus != null && fop > 0) el('rect', { x: x0 - 3, y: y0 + focus * CS - 3, width: 5 * CS + 3, height: CS + 3, rx: 6, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fop }); }
  function s1(t, c) { const { k, u } = c, a = (c.beat.pane.attn || {}), f = a.focusIdx ?? 4, pf = c.prev ? (c.prev.pane.attn || {}).focusIdx : f;
    // 줄기와 두 가지
    card(480, 30, 360, 40, { rx: 10, text: 'Transformer (2017) · 인코더 6 + 디코더 6', fs: 15, stroke: MUT, s: k === 0 ? pop(u, 0.2) : 1 });
    const gb = k === 0 ? E(u, 0.6, 1.1) : 1;
    el('path', { d: `M480,50 C480,70 255,62 255,${lerp(50, 86, gb)}`, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: gb > 0 ? 1 : 0 });
    el('path', { d: `M480,50 C480,70 735,62 735,${lerp(50, 86, gb)}`, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: gb > 0 ? 1 : 0 });
    const nB = k === 2 ? Math.round(12 * E(u, 0.3, 1.4)) : k > 2 ? 12 : null, nG = k === 3 ? Math.round(12 * E(u, 0.3, 1.4)) : k > 3 ? 12 : null;
    card(255, 108, 270, 40, { rx: 10, stroke: INFO, fill: INFOBG, color: INFO, sw: k === 1 || k === 2 ? 3 : 2, text: 'BERT · 인코더' + (nB != null ? ` ×${nB}층` : ' 스택'), fs: 15.5, s: k === 0 ? pop(u, 1.0) : 1 + (k === 1 ? R.bump(u, 0.3) : 0) });
    card(735, 108, 270, 40, { rx: 10, stroke: ACC, fill: ACCBG, color: ACC, sw: k === 3 ? 3 : 2, text: 'GPT · 디코더' + (nG != null ? ` ×${nG}층` : ' 스택'), fs: 15.5, s: k === 0 ? pop(u, 1.2) : 1 + (k === 3 ? R.bump(u, 0.3) : 0) });
    // 두 격자
    const xB = 170, xG = 650, y0 = 182;
    const fop = k <= 3 ? 1 : 0;
    const visB = (r, cc) => { if (k >= 6) return 1; if (k === 4) return clamp(E(u, 0.3, 1.8) * 9 - (r + cc)); if (k === 5) return 1; return r === f ? (k === 0 ? fade(u, 1.3 + cc * 0.1) : 1) : 0; };
    const visG = (r, cc) => { if (k >= 6) return 1; if (k === 5) return clamp(E(u, 0.3, 1.8) * 9 - (r + cc)); return r === f ? (k === 0 ? fade(u, 1.4 + cc * 0.1) : 1) : 0; };
    const gridOp = k === 0 ? fade(u, 1.1) : 1;
    if (gridOp > 0) { maskGrid(xB, y0, INFO, INFOBG, (r, cc) => visB(r, cc) * gridOp, () => 1, k <= 3 || k === 5 ? f : null, fop || (k === 5 ? 1 : 0));
      maskGrid(xG, y0, ACC, ACCBG, (r, cc) => visG(r, cc) * gridOp, (r, cc) => (cc <= r ? 1 : 0), k <= 4 ? f : null, fop || (k === 4 ? 1 : 0));
      sub(480, 172, '행 = 보는 토큰', gridOp, { 'font-size': 13.5 }); sub(480, 192, '열 = 보이는 토큰', gridOp, { 'font-size': 13.5 }); }
    // 가운데 설명
    const seeB = 5, seeG = f + 1, w = TOK5[f];
    if (k <= 3) { note(480, 230, `'${w}' 가 보는 토큰`, k === 0 ? fade(u, 1.8) : fade(u, 0.3), { 'text-anchor': 'middle' });
      mono(480, 266, `BERT ${seeB}개`, { 'font-size': 17, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 2.0) : fade(u, 0.6) });
      mono(480, 296, `GPT  ${seeG}개`, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 2.1) : fade(u, 0.8) }); }
    if (k === 0) pill(480, 340, '차이 = 어텐션 마스크 하나', INK, pop(u, 2.3), { fs: 14.5 });
    if (k === 1) sub(480, 340, '첫 토큰도 오른쪽을 전부 본다', fade(u, 1.2), { 'font-size': 15, fill: INFO });
    if (k === 2) sub(480, 340, '층 수는 GPT-2 와 같은 12', fade(u, 1.5), { 'font-size': 15 });
    if (k === 3) sub(480, 340, `'${TOK5[4]}' 칸이 0 으로 막힌다`, fade(u, 1.5), { 'font-size': 15, fill: ACC });
    if (k === 4) { note(480, 250, 'BERT', fade(u, 0.3), { 'text-anchor': 'middle', fill: INFO });
      mono(480, 284, 'mask[i][j] = 1', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      sub(480, 312, '모든 j — 양방향', fade(u, 1.5), { 'font-size': 15 }); pill(480, 356, '25칸 모두 1', INFO, pop(u, 2.0), { fs: 14.5 }); }
    if (k === 5) { note(480, 250, 'GPT', fade(u, 0.3), { 'text-anchor': 'middle', fill: ACC });
      mono(480, 284, '1 if j <= i else 0', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      sub(480, 312, '오른쪽(미래) 차단', fade(u, 1.5), { 'font-size': 15 }); pill(480, 356, '1 = 15칸 · 0 = 10칸', ACC, pop(u, 2.0), { fs: 14.5, mono: true }); }
    if (k === 6) { const yb = 386 + 22;
      note(480, 240, '마스크', fade(u, 0.2), { 'text-anchor': 'middle' }); grow(480, 250, 480, 278, E(u, 0.4, 0.7), MUT);
      note(480, 300, '→ 학습 목표', fade(u, 0.7), { 'text-anchor': 'middle' }); grow(480, 312, 480, 340, E(u, 1.0, 1.3), MUT);
      note(480, 362, '→ 능력', fade(u, 1.3), { 'text-anchor': 'middle' });
      tx(255, yb, 'MLM 빈칸 맞추기 → 이해', { 'font-size': 15.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      tx(735, yb, '다음 토큰 예측 → 생성', { 'font-size': 15.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); } }

  // ---------- 2. BERT: 빈칸 맞추기와 임베딩 ----------
  // 768차원 벡터를 세로 칸 8개로 줄여 그린다 (칸 진하기는 장식, 값 아님)
  function vec(cx, y, seed, o) { o = o || {}; const n = 8, h = o.h || 11, col = o.col || INFO;
    for (let i = 0; i < n; i++) { const a = 0.25 + 0.7 * Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 0.5 + Math.sin(seed * 3.1 + i * 1.7) * 0.5);
      el('rect', { x: cx - 7, y: y + i * (h + 2), width: 14, height: h, rx: 2, fill: col, opacity: (o.op ?? 1) * clamp(a) }); } }
  function s2(t, c) { const { k, u } = c, m = c.beat.pane.mlm || {}, toks = m.tokens || [], mi = m.maskIdx;
    const n = toks.length, xs = toks.map((_, i) => 80 + (i + 0.5) * (460 / n));
    // 인코더 본체
    zoneEnc(k, u);
    // 입력 토큰
    toks.forEach((s, i) => { const isM = i === mi && s === '[MASK]';
      const appear = (k === 0 || k === 4) ? pop(u, 0.2 + i * 0.12) : 1;
      if (k === 1 && i === mi) { const f = E(u, 0.4, 0.9); tok(xs[i], 362, f < 0.5 ? '영화' : '[MASK]', { col: f < 0.5 ? INK : WARN, fill: f < 0.5 ? PANEL : WARNBG, s: 1 - Math.sin(f * Math.PI) * 0.25 }); return; }
      tok(xs[i], 362, s, { col: isM ? WARN : INK, fill: isM ? WARNBG : PANEL, s: appear });
      if (k <= 3 || k === 4 || k === 6) { const g = k === 0 || k === 4 || k === 6 ? E(u, 0.8 + i * 0.1, 1.3 + i * 0.1) : 1; if (!(k === 2)) grow(xs[i], 340, xs[i], 300, g, MUT, { plain: true }); } });
    // 오른쪽
    if (k === 0) { note(600, 120, '원문 그대로 넣으면', fade(u, 1.2)); note(600, 152, '맞힐 것이 없다', fade(u, 1.5), { fill: MUT }); pill(700, 220, '가린 칸 0개', MUT, pop(u, 2.0), { fs: 15 }); }
    if (k === 1) { pill(xs[mi], 405, '15% 를 [MASK] 로', WARN, pop(u, 1.0), { fs: 14 });
      note(600, 130, '빈칸이 생겼다', fade(u, 1.2), { fill: WARN }); sub(740, 170, "왼쪽 '어제' 만으로도", fade(u, 1.6), { 'font-size': 15 }); sub(740, 196, "오른쪽 '를 봤다' 만으로도 부족", fade(u, 1.9), { 'font-size': 15 }); }
    if (k >= 2 && k <= 3 || k === 7) { // MLM 헤드
      const gone = k === 3 ? E(u, 0.3, 0.9) : 0, hy = 120;
      if (k !== 7 || true) { card(xs[2] ?? 280, hy, 150, 40, { rx: 8, stroke: WARN, fill: WARNBG, color: WARN, text: 'MLM 헤드', fs: 15, op: k === 7 ? 0 : 1 - gone }); if (k === 3 && u < 0.9) cross(xs[2], hy, 16, pop(u, 0.2)); }
      if (k === 2) { [0, 1, 3, 4].forEach((i, j) => { const g = E(u, 0.2 + j * 0.15, 0.8 + j * 0.15); el('path', { d: `M${xs[i]},340 Q${xs[i]},${250} ${lerp(xs[i], xs[2], 0.6)},${230} T${xs[2]},${200}`, fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': `${g * 260} 400`, opacity: 0.9 }); });
        grow(xs[2], 200, xs[2], 142, E(u, 1.0, 1.3), WARN);
        const P = m.preds || [], pp = (c.prev && c.prev.pane.mlm && c.prev.pane.mlm.preds) || [];
        tx(600, 92, "fill('나는 어제 [MASK] 를 봤다')", { 'font-size': 14, class: 'mono', fill: MUT, opacity: fade(u, 1.2) });
        P.forEach((p, i) => { const y = 130 + i * 50; lbl(640, y + 14, p.token, fade(u, 1.4 + i * 0.2), { 'text-anchor': 'end' });
          R.hbar(654, y, 200, tween(pp[i] ? pp[i].prob : 0, p.prob, u - 1.3, 0.8), 1, { h: 20, col: i === 0 ? INFO : OFF, text: p.prob.toFixed(2) }); });
        sub(760, 300, '점수는 예시 (실행 결과 아님)', fade(u, 2.2), { 'font-size': 13.5 }); } }
    if (k === 3) { xs.forEach((x, i) => { const g = E(u, 0.9 + i * 0.12, 1.3 + i * 0.12); if (g > 0) vec(x, 120, i + 1, { op: g }); });
      mono(600, 120, 'AutoModel', { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.9) });
      note(600, 160, '헤드를 떼고 본체만', fade(u, 1.3)); note(600, 192, '토큰마다 문맥 벡터', fade(u, 1.7), { fill: INFO });
      sub(720, 240, '빈칸 맞추기로 배운 가중치 그대로', fade(u, 2.1), { 'font-size': 15 }); }
    if (k === 4) { card(745, 150, 330, 50, { rx: 10, stroke: INFO, text: 'embed(sentence) → (768,)', fs: 16, mono: true, color: INFO, s: pop(u, 1.0) });
      grow(560, 250, 640, 190, E(u, 1.4, 1.8), MUT);
      vec(745, 210, 9, { op: fade(u, 1.9), h: 12 }); mono(775, 262, '768', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) });
      sub(745, 330, '이제 목표는 빈칸이 아니라 벡터', fade(u, 2.3), { 'font-size': 15 }); }
    if (k === 5) { xs.forEach((x, i) => vec(x, 112, i + 3, { op: 1 - 0.5 * E(u, 1.2, 1.8) }));
      mono(310, 96, 'last_hidden_state (1, L, 768)', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
      xs.forEach((x, i) => { const g = E(u, 0.8, 1.6); if (g > 0 && g < 1) vec(lerp(x, 760, g), lerp(112, 140, g), i + 3, { op: 0.5 }); });
      vec(760, 140, 21, { op: fade(u, 1.5), h: 12 });
      mono(760, 128, 'mean(dim=1)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(760, 270, '(768,)', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(760, 310, `토큰 ${n}개 → 벡터 1개`, fade(u, 2.1), { 'font-size': 15 }); sub(760, 336, 'no_grad — 추론만', fade(u, 2.3), { 'font-size': 14 }); }
    if (k === 6) { const ox = 600, oy = 330, L = 200, a1 = -0.35, a2 = -0.35 - Math.acos(0.91) * E(u, 0.5, 1.3);
      el('line', { x1: ox - 10, y1: oy, x2: ox + L + 30, y2: oy, stroke: GRID, 'stroke-width': 1.5 }); el('line', { x1: ox, y1: oy + 10, x2: ox, y2: oy - L, stroke: GRID, 'stroke-width': 1.5 });
      grow(ox, oy, ox + L * Math.cos(a1), oy + L * Math.sin(a1), E(u, 0.2, 0.6), INFO, { sw: 3 });
      grow(ox, oy, ox + L * Math.cos(a2), oy + L * Math.sin(a2), E(u, 0.5, 0.9), ACC, { sw: 3 });
      tx(ox + L * Math.cos(a1) + 12, oy + L * Math.sin(a1) + 6, 'a', { 'font-size': 17, 'font-weight': 800, fill: INFO, class: 'mono', opacity: fade(u, 0.6) });
      tx(ox + L * Math.cos(a2) + 8, oy + L * Math.sin(a2) - 8, 'b', { 'font-size': 17, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 1.0) });
      sub(760, 70, 'a = "배송이 빠르고 포장이 좋아요"', fade(u, 0.4), { 'font-size': 13.5, fill: INFO }); sub(760, 94, 'b = 아래 문장', fade(u, 0.7), { 'font-size': 13.5, fill: ACC });
      mono(860, 170, 'cos = 0.91', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); sub(860, 196, '(예시 값)', fade(u, 1.6));
      note(700, 372, '단어는 거의 안 겹쳐도', fade(u, 1.9), { 'font-size': 15, 'text-anchor': 'middle' }); note(700, 398, '의미가 같으면 가깝다', fade(u, 2.2), { 'font-size': 15, fill: GOOD, 'text-anchor': 'middle' }); }
    if (k === 7) { card(735, 70, 250, 44, { rx: 8, stroke: BAD, text: 'bert.generate()', fs: 16, mono: true, color: BAD, s: pop(u, 0.2) }); cross(735, 70, 18, pop(u, 0.6));
      const rows = ((c.beat.pane.strengths || {}).rows || []);
      rows.forEach((r, i) => { const y = 140 + i * 50, op = fade(u, 0.9 + i * 0.3);
        if (r.ok) check(612, y - 5, 9, op); else cross(612, y - 5, 9, op);
        tx(632, y, r.task, { 'font-size': 15, 'font-weight': 700, fill: r.ok ? INK : BAD, opacity: op }); tx(632, y + 20, r.why, { 'font-size': 13.5, fill: MUT, opacity: op }); }); } }
  function zoneEnc(k, u) { const op = 1;
    el('rect', { x: 60, y: 220, width: 500, height: 80, rx: 12, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: op });
    tx(310, 252, 'BERT 인코더 · 12층', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
    tx(310, 278, '양방향 self-attention (마스크 없음)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }

  // ---------- 3. GPT: 자기회귀 생성 ----------
  function s3(t, c) { const { k, u } = c, g = c.beat.pane.gen || {}, P = g.prompt || [], Gn = g.generated || [], pG = (c.prev && c.prev.pane.gen && c.prev.pane.gen.generated) || [];
    // 디코더
    const dop = k === 0 ? pop(u, 0.3) : 1;
    card(250, 250, 400, 84, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2, s: dop });
    tx(250, 244, 'KoGPT-2 디코더 · causal', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: dop });
    tx(250, 270, '자기 왼쪽만 본다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: dop });
    // 작은 causal 삼각 마스크 아이콘
    for (let r = 0; r < 4; r++) for (let cc = 0; cc <= r; cc++) el('rect', { x: 84 + cc * 9, y: 226 + r * 9, width: 7.5, height: 7.5, fill: ACC, opacity: dop * 0.8 });
    // 문맥 줄
    const all = P.concat(Gn), xs = rowPos(40, all, 6);
    let shownG = Gn.length;
    if (k === 2) shownG = pG.length + Math.round(E(u, 1.2, 2.2) * (Gn.length - pG.length));
    if (k === 3) shownG = pG.length + Math.floor(E(u, 0.3, 2.3) * (Gn.length - pG.length) + 0.001);
    if (k === 4) shownG = E(u, 0.2, 0.7) < 1 ? 0 : 1;
    if (k === 5) shownG = Gn.length - 1 + (u > 1.9 ? 1 : 0);
    if (k === 6) shownG = Gn.length - 1 + (u > 1.6 ? 1 : 0);
    if (k === 7) shownG = Math.min(Gn.length, Math.floor(E(u, 0.2, 2.0) * Gn.length + 0.001));
    if (k >= 1) P.forEach((s, i) => tok(xs[i], 110, s, { col: MUT, fill: SOFT, tcol: INK, s: k === 1 ? pop(u, 0.3 + i * 0.25) : 1 }));
    Gn.forEach((s, i) => { if (i >= shownG) return; const last = i === shownG - 1; tok(xs[P.length + i], 110, s, { col: ACC, fill: last ? ACC : ACCBG, tcol: last ? PANEL : ACC }); });
    if (k >= 1) { const cx = (xs[P.length + shownG - 1] ?? xs[P.length - 1]) + 40; if (shownG < Gn.length || k <= 2) el('rect', { x: cx, y: 96, width: 10, height: 28, fill: ACC, opacity: Math.floor(u * 3) % 2 ? 0.2 : 0.9 }); }
    tx(40, 72, k >= 1 ? `문맥 ctx — 길이 ${P.length + shownG}` : '문맥 ctx — 비어 있음', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k >= 1) grow(160, 140, 160, 205, k === 1 ? E(u, 1.0, 1.4) : 1, MUT);
    // 오른쪽
    const RX = 500;
    if (k === 0) { note(RX, 200, '아직 생성 0개', fade(u, 0.8)); sub(RX + 150, 236, '가진 것: 다음 토큰 확률 계산', fade(u, 1.4), { 'font-size': 15 }); pill(RX + 150, 300, 'AutoModelForCausalLM', ACC, pop(u, 1.9), { fs: 14, mono: true }); }
    if (k === 1) { mono(RX, 200, 'ids = tok("옛날 옛적에")', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.6) }); note(RX, 246, '프롬프트가 첫 문맥', fade(u, 1.5)); sub(RX + 150, 280, '모델은 이 오른쪽만 계산한다', fade(u, 1.9), { 'font-size': 15 }); }
    if (k === 2) { pill(RX + 70, 196, 'temperature 0.8', ACC, pop(u, 0.3), { fs: 14.5, mono: true }); pill(RX + 260, 196, 'top_p 0.95', ACC, pop(u, 0.5), { fs: 14.5, mono: true });
      const hs = [0.9, 0.62, 0.45, 0.3, 0.2, 0.12]; hs.forEach((h, i) => { const x = RX + 30 + i * 46, H = 110 * h * E(u, 0.6, 1.2), inTop = i < 4;
        el('rect', { x, y: 350 - H, width: 34, height: H, rx: 3, fill: inTop ? ACC : OFF, opacity: inTop ? 0.85 : 0.6 }); });
      el('line', { x1: RX + 214, y1: 230, x2: RX + 214, y2: 352, stroke: INK, 'stroke-width': 1.8, 'stroke-dasharray': '4 4', opacity: fade(u, 1.0) });
      sub(RX + 120, 374, '누적확률 상위만 후보', fade(u, 1.1), { 'font-size': 13.5 }); sub(RX + 120, 396, '(분포 모양은 개념도)', fade(u, 1.2), { 'font-size': 13.5 });
      note(RX + 290, 300, 'argmax 대신', fade(u, 1.5), { 'font-size': 15 }); note(RX + 290, 326, '확률로 뽑는다', fade(u, 1.7), { 'font-size': 15, fill: ACC }); }
    if (k === 3) { mono(RX, 200, 'gpt.generate(ids, ...)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      note(RX, 246, '루프를 대신 돌려 준다', fade(u, 0.8)); sub(RX + 170, 284, 'max_new_tokens=20 · 그림은 앞 6개', fade(u, 1.2), { 'font-size': 14.5 });
      mono(RX + 170, 330, `${shownG} / ${Gn.length} tokens`, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); sub(RX + 170, 360, '생성 문장은 예시 (샘플링이라 매번 다름)', fade(u, 2.3), { 'font-size': 13.5 }); }
    if (k === 4) { mono(RX, 200, 'for _ in range(6):', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) }); note(RX, 246, 'ctx 를 프롬프트로 되돌림', fade(u, 0.6));
      sub(RX + 150, 282, 'generate() 내부를 손으로 재현', fade(u, 1.2), { 'font-size': 15 });
      for (let i = 0; i < 6; i++) el('circle', { cx: RX + 40 + i * 44, cy: 330, r: 12, fill: i < 1 ? ACC : PANEL, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.4 + i * 0.1) });
      sub(RX + 150, 370, '반복 6번 중 1번째', fade(u, 2.0), { 'font-size': 14 }); }
    if (k === 5) { // logits (1, L, vocab)
      const L = P.length + Gn.length - 1, cw = 30, ch = 22, gx = RX + 20, gy = 190, V = 9;
      mono(gx, gy - 14, `logits (1, ${L}, vocab)`, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      for (let r = 0; r < L; r++) for (let v = 0; v < V; v++) { const a = 0.15 + 0.55 * Math.abs(Math.sin(r * 7.1 + v * 3.3)), last = r === L - 1, best = last && v === 5;
        el('rect', { x: gx + v * cw, y: gy + r * ch, width: cw - 3, height: ch - 3, rx: 2, fill: best ? ACC : last ? ACC : OFF, opacity: (last ? (best ? 1 : 0.35) : a * 0.5 * (1 - 0.6 * E(u, 0.8, 1.2))) * fade(u, 0.3 + r * 0.05) }); }
      el('rect', { x: gx - 3, y: gy + (L - 1) * ch - 3, width: V * cw + 3, height: ch + 3, rx: 4, fill: 'none', stroke: INK, 'stroke-width': 2.4, opacity: fade(u, 0.9) });
      tx(gx + V * cw + 10, gy + (L - 1) * ch + 15, '[0, -1]', { 'font-size': 14, class: 'mono', 'font-weight': 700, opacity: fade(u, 1.0) });
      const bx = gx + 5 * cw + 13, by = gy + L * ch; grow(bx, by, bx, by + 40, E(u, 1.4, 1.7), ACC);
      mono(bx, by + 62, 'argmax → next_id', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.7) }); }
    if (k === 6) { const last = Gn[Gn.length - 1], tx0 = xs[P.length + Gn.length - 1];
      fly(250, 210, tx0, 110, E(u, 0.4, 1.6) * (u < 1.6 ? 1 : 1), last, { fill: ACC });
      mono(RX, 210, 'ctx = torch.cat([ctx, next_id], 1)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      note(RX, 260, '방금 뽑은 토큰 = 다음 입력', fade(u, 1.6), { fill: ACC }); sub(RX + 170, 296, 'ctx 길이 +1', fade(u, 1.8), { 'font-size': 15 });
      sub(RX + 170, 340, '한 번 뱉은 토큰은 되돌릴 수 없다', fade(u, 2.2), { 'font-size': 15, fill: BAD }); }
    if (k === 7) { const cx = 720, cy = 250, r = 88, rx = 140, items = ['문맥 읽기', '확률 계산', '하나 고르기', '끝에 붙이기'];
      el('ellipse', { cx, cy, rx, ry: r, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
      items.forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = cx + rx * Math.cos(a), y = cy + r * Math.sin(a); pill(x, y, s, ACC, pop(u, 0.2 + i * 0.2), { fs: 14, fill: PANEL }); });
      const ph = (u * 0.9) % 1, a = -Math.PI / 2 + ph * 2 * Math.PI; if (u > 1) el('circle', { cx: cx + rx * Math.cos(a), cy: cy + r * Math.sin(a), r: 6, fill: INK });
      note(cx, cy + 6, '학습 = 사용', fade(u, 1.2), { 'text-anchor': 'middle', 'font-size': 15 });
      sub(720, 392, '라벨 불필요 → 인터넷 전체가 데이터', fade(u, 2.0), { 'font-size': 14.5, 'text-anchor': 'start' }); } }

  // ---------- 4. 스케일링과 창발 ----------
  const SCALE = [['2018', 'GPT-1', 117e6, '117M'], ['2019', 'GPT-2', 1.5e9, '1.5B'], ['2020', 'GPT-3', 175e9, '175B']];
  function chart(k, u, op) { const x0 = 150, w = 440, lx = (v) => x0 + ((Math.log10(v) - 7) / 5) * w;
    [1e7, 1e8, 1e9, 1e10, 1e11, 1e12].forEach((v, i) => { el('line', { x1: lx(v), y1: 60, x2: lx(v), y2: 250, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: op });
      mono(lx(v), 272, ['10M', '100M', '1B', '10B', '100B', '1T'][i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); });
    tx(x0 + w, 296, '파라미터 수 (로그 축)', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, opacity: op });
    SCALE.forEach(([yr, nm, v, s], i) => { if (i > Math.min(k, 2)) return; const y = 80 + i * 58, g = k === i ? E(u, 0.3, 1.3) : 1;
      mono(x0 - 128, y + 19, yr, { 'font-size': 14, fill: MUT, opacity: op }); tx(x0 - 10, y + 19, nm, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: op });
      el('rect', { x: x0, y, width: (lx(v) - x0) * g, height: 26, rx: 4, fill: i === 2 ? ACC : INFO, opacity: op * (i === 2 ? 0.95 : 0.7) });
      mono(x0 + (lx(v) - x0) * g + 8, y + 19, s, { 'font-size': 15, 'font-weight': 800, opacity: op * (g > 0.9 ? 1 : 0) }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { chart(k, u, 1); const RX = 640;
      if (k === 0) { note(RX, 100, 'GPT-1 = 개념 증명', fade(u, 1.2)); sub(RX + 130, 134, '사전학습 + 작업별 파인튜닝', fade(u, 1.5), { 'font-size': 15 }); pill(RX + 130, 190, '프롬프트로 시키기: 아직 없음', MUT, pop(u, 2.0), { fs: 14 }); }
      if (k === 1) { grow(470, 93, 470, 144, E(u, 1.0, 1.4), INFO); mono(484, 126, '×13', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.3) });
        note(RX, 120, '한 해 만에 13배', fade(u, 1.4)); sub(RX + 130, 156, '제로샷 조짐 · 공개 보류 소동', fade(u, 1.8), { 'font-size': 15 }); }
      if (k === 2) { mono(560, 184, '×117', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
        note(RX, 110, 'GPT-1 대비 약 1,500배', fade(u, 1.5), { fill: ACC }); sub(RX + 130, 146, '175B / 117M ≈ 1,496', fade(u, 1.7), { 'font-size': 15, class: 'mono' });
        pill(RX + 130, 206, 'in-context learning 창발', ACC, pop(u, 2.1), { fs: 14.5 }); }
      if (k === 3) { const ax = R.axes(660, 80, 240, 170, { x: [0, 1], y: [0, 1], xl: 'log N', yl: 'log loss' });
        R.line(ax, [[0.05, 0.92], [0.95, 0.12]], E(u, 0.3, 1.3), INK, { sw: 3 });
        mono(800, 46, 'loss ∝ N^(−α)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        sub(780, 316, '로그-로그에서 직선 = 예측 가능 (개념도)', fade(u, 1.5), { 'font-size': 13.5 });
        sub(780, 344, 'Chinchilla(2022): 같은 계산이면 데이터를 더', fade(u, 2.0), { 'font-size': 13.5, fill: WARN });
        sub(780, 372, '법칙이 예측한 것은 손실뿐 — 능력은 아님', fade(u, 2.4), { 'font-size': 13.5, fill: BAD }); }
      return; }
    if (k <= 6) { // few-shot 프롬프트
      card(110, 50, 170, 40, { rx: 8, stroke: ACC, fill: ACCBG, text: 'GPT-3 · 175B', fs: 15, color: ACC });
      lock(220, 52, true, INK, k === 4 ? pop(u, 0.6) : 1); tx(244, 57, '가중치 고정 — 갱신 0번', { 'font-size': 15, 'font-weight': 700, opacity: k === 4 ? fade(u, 0.8) : 1 });
      el('rect', { x: 60, y: 90, width: 600, height: 230, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      mono(80, 116, 'few_shot_prompt', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const L = [['다음 리뷰의 감성을 분류하라.', INK], ['리뷰: 배송 최악이고 상자도 찌그러짐 → 부정', INK], ['리뷰: 인생 최고의 커피, 재구매 확정 → 긍정', INK], ['리뷰: 가격 대비 그럭저럭 쓸만함 → 중립', INK], ['리뷰: 화면이 이틀 만에 고장났어요 →', INK]];
      L.forEach(([s, col], i) => { const op = k === 4 ? (i === 0 ? fade(u, 1.0) : 0) : k === 5 ? (i === 0 ? 1 : fade(u, 0.2 + (i - 1) * 0.45)) : 1; tx(80, 150 + i * 36, s, { 'font-size': 15.5, fill: col, opacity: op }); });
      const lastW = 80 + tw(L[4][0], 15.5) + 8;
      if (k === 5) el('rect', { x: lastW, y: 278, width: 9, height: 22, fill: ACC, opacity: u > 2.0 ? (Math.floor(u * 3) % 2 ? 0.2 : 0.9) : 0 });
      if (k === 6) { const s = '부정'.slice(0, Math.ceil(E(u, 0.3, 0.9) * 2)); tx(lastW, 294, s, { 'font-size': 15.5, 'font-weight': 800, fill: ACC });
        const sp = pop(u, 1.0); if (sp > 0) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; el('line', { x1: lastW + 18 + 18 * Math.cos(a) * sp, y1: 288 + 18 * Math.sin(a) * sp, x2: lastW + 18 + 28 * Math.cos(a) * sp, y2: 288 + 28 * Math.sin(a) * sp, stroke: WARN, 'stroke-width': 2.5 }); } }
      const RX = 700;
      if (k === 4) { note(RX, 170, '학습이 아니라', fade(u, 1.5)); note(RX, 200, '문맥 읽기', fade(u, 1.7), { fill: ACC }); sub(RX + 110, 240, '모델 입장에선 여전히', fade(u, 2.0), { 'font-size': 14.5 }); sub(RX + 110, 264, '다음 토큰 맞추기', fade(u, 2.2), { 'font-size': 14.5 }); }
      if (k === 5) { pill(RX + 110, 170, '예시 3개 + 질문 1개', INK, pop(u, 1.8), { fs: 14.5 }); sub(RX + 110, 216, '화살표에서 끊어 이어 쓸 자리', fade(u, 2.2), { 'font-size': 14.5 }); }
      if (k === 6) { note(RX, 170, '분류기 학습 0번', fade(u, 1.0)); note(RX, 202, '인데 "부정"', fade(u, 1.3), { fill: ACC });
        pill(RX + 110, 256, '작은 모델엔 없던 능력', WARN, pop(u, 1.8), { fs: 14.5 }); sub(RX + 110, 300, '스케일 문턱에서 창발', fade(u, 2.2), { 'font-size': 14.5 }); }
      sub(360, 360, '예시 3개는 가중치가 아니라 입력에 들어간다', k === 4 ? fade(u, 2.3) : 1, { 'font-size': 14.5 }); return; }
    // k 7, 8: 정렬 파이프라인
    const items = [['사전학습', '다음 토큰 예측', MUT, SOFT], ['SFT', '지시-응답 파인튜닝', WARN, WARNBG], ['RLHF', '사람 선호 강화학습', GOOD, GOODBG]];
    items.forEach(([nm, d, col, bg], i) => { const x = 170 + i * 310, s = k === 7 ? pop(u, 0.2 + i * 0.6) : 1;
      card(x, 80, 240, 66, { rx: 10, stroke: col === MUT ? INK : col, fill: bg, s }); tx(x, 74, nm, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col === MUT ? INK : col, opacity: s > 0.3 ? 1 : 0 });
      tx(x, 98, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s > 0.3 ? 1 : 0 });
      if (i) grow(x - 190, 80, x - 124, 80, k === 7 ? E(u, 0.5 + i * 0.6, 0.8 + i * 0.6) : 1, MUT); });
    mono(170, 140, '2020 GPT-3', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(790, 140, '2022 ChatGPT', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 7 ? fade(u, 1.8) : 1 });
    if (k === 7) { note(480, 210, '파라미터 수는 그대로', fade(u, 2.0), { 'text-anchor': 'middle' }); sub(480, 244, '바뀐 것은 능력이 아니라 태도', fade(u, 2.3), { 'font-size': 15 }); return; }
    // k 8: 정렬 전/후
    card(480, 196, 300, 44, { rx: 10, stroke: INK, text: '"요약해줘: …(긴 글)"', fs: 15.5, s: pop(u, 0.2) });
    grow(400, 220, 250, 270, E(u, 0.5, 0.9), MUT); grow(560, 220, 710, 270, E(u, 0.6, 1.0), MUT);
    card(230, 320, 380, 80, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 1.0) }); tx(230, 312, '사전학습만 된 모델', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    tx(230, 340, '그 말로 시작하는 문서를 이어 쓴다', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    card(730, 320, 380, 80, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 1.6) }); tx(730, 312, '+ SFT / RLHF', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    tx(730, 340, '지시대로 요약을 돌려준다', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    sub(480, 404, '스케일이 능력을, 정렬이 제품을 만든다 (자세히: ml IV-2-2)', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 5. 실무 선택 지도 ----------
  const LANES = [['enc', '인코더', 'klue/roberta-base · BAAI/bge-m3', INFO, INFOBG, '라벨 · 벡터'], ['encdec', '인코더-디코더', 'nllb-200-distilled-600M · kobart', WARN, WARNBG, '문장 (변환)'], ['dec', '디코더 (LLM)', 'GPT 계보 · instruct 모델', ACC, ACCBG, '자유 문장']];
  const TASKS = [['분류', 'enc', 0], ['NER', 'enc', 1], ['임베딩', 'enc', 1], ['번역', 'encdec', 2], ['요약', 'encdec', 2], ['생성', 'dec', 3], ['대화', 'dec', 3]];
  function s5(t, c) { const { k, u } = c;
    const LX = 330, LW = 600;
    LANES.forEach(([id, nm, models, col, bg, out], i) => { const y = 60 + i * 96;
      el('rect', { x: LX, y, width: LW, height: 80, rx: 12, fill: bg, stroke: col, 'stroke-width': 2 });
      tx(LX + 16, y + 26, nm, { 'font-size': 16, 'font-weight': 800, fill: col }); tx(LX + 16, y + 50, models, { 'font-size': 13.5, fill: MUT, class: 'mono' });
      tx(LX + LW - 14, y + 26, '출력: ' + out, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'end' }); });
    // 작업 카드: 등장 beat 이전엔 안 보임, 등장 beat 에 왼쪽에서 레인으로 날아간다
    const slot = { enc: 0, encdec: 0, dec: 0 };
    TASKS.forEach(([nm, lane, at]) => { if (k < at) return; const li = LANES.findIndex((l) => l[0] === lane), si = slot[lane]++, tx0 = LX + 370 + si * 84, ty = 60 + li * 96 + 52;
      const f = k === at ? E(u, 0.3 + si * 0.3, 1.0 + si * 0.3) : 1; if (f <= 0) return;
      const x = lerp(170, tx0, f), y = lerp(200, ty, f); pill(x, y, nm, LANES[li][3], 1, { fs: 14.5, fill: PANEL }); });
    // 왼쪽: 갈림길 질문
    card(150, 60, 260, 70, { rx: 10, stroke: INK, sw: 2 }); tx(150, 54, '출력이 라벨·벡터인가,', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); tx(150, 78, '문장인가?', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    if (k <= 3) { const msg = ['분류 → 인코더면 충분', '토큰 라벨·벡터도 인코더', '입력 전체 → 다른 텍스트', '자유 문장 → 디코더'][k];
      note(30, 300, msg, fade(u, 1.6), { 'font-size': 15.5 });
      if (k === 1) sub(150, 330, 'LLM 보다 수십 배 싸고 빠르다', fade(u, 2.1), { 'font-size': 14 });
      if (k === 2) sub(150, 330, '요즘은 대형 LLM 도 흡수 중', fade(u, 2.1), { 'font-size': 14 });
      if (k === 3) sub(150, 330, '대화는 정렬된 instruct 모델', fade(u, 2.1), { 'font-size': 14 }); return; }
    // k ≥ 4: 함수 상자 (레인 위에 겹쳐 그림)
    el('rect', { x: 20, y: 120, width: 290, height: 290, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(36, 148, 'choose_model(', { 'font-size': 15, 'font-weight': 700, opacity: k === 4 ? fade(u, 0.2) : 1 });
    mono(56, 172, 'task,', { 'font-size': 15, opacity: k === 4 ? fade(u, 0.5) : 1 }); mono(56, 196, 'need_reasoning)', { 'font-size': 15, opacity: k === 4 ? fade(u, 0.8) : 1 });
    if (k === 4) { sub(165, 240, '판단 기준은 딱 2개', fade(u, 1.4), { 'font-size': 15 }); sub(165, 270, '표를 코드로 굳혀 둔다', fade(u, 1.9), { 'font-size': 15 }); }
    if (k === 5) { pill(165, 240, 'task="ocr"', BAD, pop(u, 0.3), { fs: 14.5, mono: true }); grow(165, 258, 165, 292, E(u, 0.8, 1.1), BAD);
      card(165, 316, 200, 40, { rx: 8, stroke: BAD, fill: BADBG, text: 'KeyError', fs: 16, mono: true, color: BAD, s: pop(u, 1.2) });
      sub(165, 370, '표에 없는 작업은 통과 못 한다', fade(u, 1.8), { 'font-size': 14 }); sub(165, 394, '(작업 이름은 예시)', fade(u, 2.0), { 'font-size': 13.5 }); }
    if (k >= 6) { const g = k === 6 ? E(u, 0.3, 1.4) : 1;
      el('rect', { x: LX + 4, y: 352, width: (LW - 8) * g, height: 52, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 });
      tx(LX + 18, 384, 'RAG — 인코더가 찾고 디코더가 답한다', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: g > 0.9 ? 1 : 0 });
      if (k === 6) { dotPath(u, [[LX + 120, 140], [LX + 300, 360]], INFO, 1.2); dotPath(u, [[LX + 120, 330], [LX + 400, 360]], ACC, 1.5);
        pill(165, 240, 'need_reasoning=True', GOOD, pop(u, 0.3), { fs: 14, mono: true }); sub(165, 290, '추론이 끼면 결국 LLM', fade(u, 1.6), { 'font-size': 14.5 }); sub(165, 316, '검색은 임베딩이 맡는다', fade(u, 1.9), { 'font-size': 14.5 }); } }
    if (k === 7) { const outs = [['choose_model("classification")', [['encoder: klue/roberta-base', INFO]]], ['choose_model("chat")', [['decoder: 정렬된 instruct 모델', ACC]]], ['choose_model("embedding", True)', [['decoder LLM + (검색은', GOOD], ['  encoder 임베딩) = RAG', GOOD]]]];
      let y = 226; outs.forEach(([a, rs], i) => { const op = fade(u, 0.3 + i * 0.6); mono(30, y, a, { 'font-size': 13.5, fill: MUT, opacity: op }); y += 22;
        rs.forEach(([b, col]) => { mono(30, y, b, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op }); y += 21; }); y += 10; }); }
    if (k === 8) { pill(165, 240, '감성 분류 1건', INK, pop(u, 0.2), { fs: 14.5 }); grow(165, 258, 165, 288, E(u, 0.5, 0.8), BAD);
      card(165, 310, 190, 38, { rx: 8, stroke: BAD, text: 'LLM API 호출', fs: 15, color: BAD, s: pop(u, 0.8) }); cross(165, 310, 15, pop(u, 1.2));
      sub(165, 356, '비용 · 지연 · 비결정성', fade(u, 1.6), { 'font-size': 14.5, fill: BAD }); sub(165, 384, '→ 인코더로 충분한 곳', fade(u, 2.1), { 'font-size': 14.5, fill: GOOD }); } }
  function dotPath(u, pts, col, at) { R.dot(pts, seg(u, at, at + 0.9), col, 7); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "BERT와 GPT의 구조를 가른 결정적 차이는 무엇인가?",
      o: ["층 수 — BERT가 훨씬 깊다", "어텐션 마스크 — BERT는 양방향, GPT는 causal mask로 왼쪽(과거)만 본다", "BERT에만 FFN이 있다"], a: 1,
      why: "둘 다 12층이고 블록 내부도 거의 같다. 볼 수 있는 범위가 사전학습 목표(MLM 대 다음 토큰)를, 목표가 능력(이해 대 생성)을 정한다." },
    { q: "BERT가 \"다음 단어 예측\" 대신 MLM으로 사전학습하는 이유는 무엇인가?",
      o: ["양방향으로 보면 다음 단어가 이미 입력에 보여 목표가 될 수 없어서", "라벨링된 데이터가 더 많아서", "생성 능력을 키우려고"], a: 0,
      why: "그래서 입력의 15%를 [MASK]로 가리고 양쪽 문맥으로 빈칸을 맞힌다. 표현은 이해용 임베딩이 되지만, 이어 쓰기를 배운 적이 없어 generate()가 없다." },
    { q: "GPT의 \"다음 토큰 예측\" 목표가 가진 장점으로 맞는 것은?",
      o: ["생성한 토큰을 나중에 되돌려 고칠 수 있다", "양쪽 문맥을 모두 봐서 빈칸을 잘 맞힌다", "라벨 없이 인터넷 텍스트 전체가 데이터가 되고, 학습 방식이 곧 생성 방식이다"], a: 2,
      why: "예측한 토큰을 문맥 끝에 붙이고 다시 예측하는 자기회귀 루프가 곧 생성이다. 다만 한 번 뱉은 토큰은 되돌릴 수 없어 앞의 실수가 뒤로 번진다." },
    { q: "GPT-3(175B)에서 창발한 in-context learning이란 무엇인가?",
      o: ["작업마다 따로 파인튜닝해 성능을 올리는 것", "가중치를 바꾸지 않고 프롬프트의 예시 몇 개만으로 새 작업을 해내는 것", "사람 선호로 강화학습해 지시를 따르게 하는 것"], a: 1,
      why: "부정·긍정·중립 예시 세 개 뒤에 네 번째 리뷰를 끊어 두면 \"부정\"을 이어 쓴다. 지시를 따르는 어시스턴트가 되려면 SFT→RLHF 정렬을 더 거쳐야 한다." },
    { q: "감성 분류처럼 출력이 라벨인 작업에 가장 알맞은 선택은?",
      o: ["인코더 계열(RoBERTa 등) 모델", "대형 디코더 LLM API 호출", "인코더-디코더(T5·BART)"], a: 0,
      why: "출력이 라벨·벡터면 인코더 계열이 LLM보다 수십 배 싸고 빠르며 종종 더 정확하다. 분류 하나에 LLM API를 부르는 것이 실무에서 가장 흔한 낭비다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'BERT는 Transformer 인코더만, GPT는 디코더만 쌓았다. 둘을 가른 건 어텐션 마스크다.',
    'BERT는 양쪽을 다 보므로 15%를 가리고 빈칸을 맞힌다. 이해와 임베딩에 강하고 생성은 못 한다.',
    'GPT는 왼쪽만 보고 다음 토큰을 맞힌다. 175B까지 키우자 in-context learning이 나타났다.',
    '출력이 라벨이나 벡터면 인코더 계열, 문장이면 디코더 LLM을 쓴다. RAG는 둘을 함께 쓴다.',
  ];
  const review = [
    { q: 'RAG 시스템에서 두 계보가 맡는 일로 맞는 것은?',
      o: ['디코더 LLM이 문서를 찾고, 인코더가 답을 쓴다', '인코더 하나가 찾기와 답 쓰기를 모두 한다', '인코더 임베딩이 문서를 찾고, 디코더 LLM이 답을 쓴다'], a: 2,
      why: '문맥을 압축한 벡터는 양방향으로 본 인코더가 잘 만든다. 문장을 이어 쓰는 일은 다음 토큰 예측으로 배운 디코더만 할 수 있다.' },
    { q: '사전학습만 마친 GPT에 질문을 넣었더니 답 대신 비슷한 질문을 줄줄이 이어 썼다. 맞는 진단은?',
      o: ['지시를 따르게 배운 적이 없다. SFT·RLHF로 정렬한다', '모델이 작다. 파라미터를 늘린다', 'causal mask가 빠졌다. 마스크를 넣는다'], a: 0,
      why: '사전학습 모델은 그럴듯한 다음 토큰을 잇는 자동완성 기계다. 어시스턴트처럼 답하려면 지시 데이터와 사람 선호로 정렬해야 한다.' },
    { q: 'BERT에게 문장 이어 쓰기를 시켜 보니 잘 안 된다. 가장 맞는 설명은?',
      o: ['층 수가 GPT보다 적어서', '빈칸 맞추기만 배워 이어 쓰는 법을 배운 적이 없어서', '사전학습 데이터가 GPT보다 적어서'], a: 1,
      why: '양방향 마스크라 다음 토큰 예측을 목표로 쓸 수 없었고, 그래서 MLM으로 학습했다. 마스크가 목표를 정하고 목표가 능력을 정한다.' },
  ];

  RA.page({ title: 'BERT vs GPT — 마스크 한 장이 가른 두 계보', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
