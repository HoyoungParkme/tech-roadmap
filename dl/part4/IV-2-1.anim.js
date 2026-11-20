/* IV-2-1 Attention is All You Need — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 토큰 줄(RNN 은 한 칸씩, Transformer 는 한꺼번에) → 텐서 판을 쪼개고 붙이는 멀티헤드
 *           → 위치마다 다른 파형 지문 → 잔차 우회로가 달린 블록 → 블록을 쌓고 잘라 쓰는 계보.
 * 숫자: 코드의 하이퍼파라미터(512, 8, 64, 2048, 6, 5000…)와 직접 실행해 센 값(파라미터 1,050,624 / 2,099,712 /
 *       3,152,384 / nn.Transformer 44,140,544)만 쓴다. 헤드별 어텐션 맵은 페이지의 HEAD_MAPS(예시값)를 그대로 쓴다.
 *       PE 히트맵은 d_model=16 축소판을 sin/cos 로 실제 계산한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, WARNBG, INFO, INFOBG } = C;

  const TK = ['그', '동물은', '피곤해서', '길을', '건너지', '않았다'];
  // 페이지 HEAD_MAPS 와 같은 예시값
  const HM = [
    { name: 'Head 1 지시/의미', w: [[0.55, 0.25, 0.05, 0.05, 0.05, 0.05], [0.30, 0.45, 0.10, 0.05, 0.05, 0.05], [0.05, 0.55, 0.25, 0.05, 0.05, 0.05], [0.05, 0.10, 0.05, 0.55, 0.20, 0.05], [0.05, 0.15, 0.10, 0.35, 0.30, 0.05], [0.05, 0.50, 0.15, 0.05, 0.15, 0.10]] },
    { name: 'Head 2 문법', w: [[0.40, 0.40, 0.05, 0.05, 0.05, 0.05], [0.45, 0.35, 0.05, 0.05, 0.05, 0.05], [0.05, 0.10, 0.40, 0.05, 0.35, 0.05], [0.05, 0.05, 0.05, 0.40, 0.40, 0.05], [0.05, 0.05, 0.05, 0.55, 0.25, 0.05], [0.05, 0.05, 0.10, 0.10, 0.45, 0.25]] },
    { name: 'Head 3 인접', w: [[0.60, 0.30, 0.03, 0.03, 0.02, 0.02], [0.30, 0.40, 0.20, 0.04, 0.03, 0.03], [0.05, 0.30, 0.35, 0.22, 0.05, 0.03], [0.03, 0.05, 0.25, 0.37, 0.25, 0.05], [0.03, 0.04, 0.05, 0.28, 0.35, 0.25], [0.02, 0.03, 0.05, 0.05, 0.30, 0.55]] },
  ];
  const peV = (pos, i, d) => { const wave = Math.pow(10000, (2 * Math.floor(i / 2)) / d); return i % 2 === 0 ? Math.sin(pos / wave) : Math.cos(pos / wave); };

  // ---------- 부품 ----------
  function tok(cx, cy, s, o) { o = o || {}; return card(cx, cy, Math.max(54, tw(s, 15) + 20), 34, { rx: 8, text: s, fs: 15, fw: 700, stroke: o.stroke || INK, fill: o.fill, color: o.color, s: o.s, op: o.op, sw: o.sw }); }
  function note(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op }, a || {})); }
  function grid(x, y, rows, cols, cw, ch, colr, o) { o = o || {}; for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const sh = o.show ? o.show(i, j) : 1; if (sh <= 0.01) continue;
      el('rect', { x: x + j * cw, y: y + i * ch, width: cw - 1.5, height: ch - 1.5, rx: 2, fill: o.fill ? o.fill(i, j) : colr, opacity: sh * (o.op ? o.op(i, j) : 0.25 + 0.12 * ((i * 3 + j * 5) % 4)) }); } }
  function box(cx, cy, w, h, s, o) { o = o || {}; return card(cx, cy, w, h, { rx: 9, text: s, fs: o.fs || 15, fw: 700, stroke: o.stroke || INK, fill: o.fill || PANEL, color: o.color, s: o.s, op: o.op, sw: o.sw, mono: o.mono }); }
  function hmap(x, y, w, cs, colr, o) { o = o || {}; w.forEach((row, r) => row.forEach((v, c) => { const sh = o.show ? o.show(r, c) : 1; if (sh <= 0.01) return;
      el('rect', { x: x + c * cs, y: y + r * cs, width: cs - 2, height: cs - 2, rx: 3, fill: PANEL, stroke: GRID, opacity: sh });
      el('rect', { x: x + c * cs, y: y + r * cs, width: cs - 2, height: cs - 2, rx: 3, fill: colr, opacity: sh * (0.06 + 1.4 * v) }); })); }

  // ---------- 1. 왜 RNN 을 버렸나 ----------
  const TX = TK.map((_, i) => 100 + i * 150);
  function chain(y, lit, o) { o = o || {}; TK.forEach((s, i) => { const on = lit == null ? 1 : i < lit ? 1 : 0, now = lit != null && i === lit - 1;
      tok(TX[i], y, s, { stroke: now ? WARN : on ? INK : GRID, color: on ? INK : MUT, fill: now ? WARNBG : PANEL, sw: now ? 2.6 : 2, op: o.op });
      if (i < 5) grow(TX[i] + 46, y, TX[i + 1] - 46, y, lit == null || i < lit - 1 ? 1 : 0.999, lit == null || i < lit - 1 ? INK : GRID, { op: o.op }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { chain(150);
      pill(250, 70, '① 병렬화 불가', BAD, pop(u, 0.4), { fs: 16 }); sub(560, 76, 't 는 t−1 을 기다린다', fade(u, 0.7), { 'font-size': 15 });
      const g = seg(u, 1.2, 2.4); if (g > 0 && g < 1) el('circle', { cx: lerp(TX[0], TX[5], g), cy: 150, r: 12 * (1 - 0.75 * g), fill: ACC, opacity: 1 - 0.6 * g });
      pill(250, 260, '② 장거리 의존 희석', BAD, pop(u, 1.2), { fs: 16 }); sub(560, 266, '"그" 의 정보가 5칸을 거치며 옅어진다', fade(u, 1.6), { 'font-size': 15 });
      note(480, 360, '두 문제의 뿌리는 하나 — 순차성', fade(u, 2.4), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { box(200, 210, 200, 90, 'LSTM(512, 512)', { mono: true, s: pop(u, 0.2), fs: 16 });
      for (let i = 0; i < 6; i++) grid(470, 110 + i * 34, 1, 16, 22, 28, ACC, { show: () => fade(u, 0.5 + i * 0.12) });
      TK.forEach((s, i) => tx(460, 130 + i * 34, s, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, fill: MUT, opacity: fade(u, 0.5 + i * 0.12) }));
      mono(640, 340, 'x  (seq=6, batch=1, dim=512)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      sub(640, 375, '(그림의 한 줄 = 512차원 벡터)', fade(u, 1.7), { 'font-size': 14 });
      sub(200, 290, '은닉 512차원', fade(u, 0.6), { 'font-size': 15 }); return; }
    if (k === 2) { const lit = Math.min(6, 1 + Math.floor(clamp((u - 0.2) / 2.2) * 6));
      chain(130, lit); TK.forEach((_, i) => { if (i < lit) box(TX[i], 230, 70, 44, 'LSTM', { fs: 14, s: i === lit - 1 ? pop(u, 0.2 + (i * 2.2) / 6) : 1, stroke: i === lit - 1 ? WARN : MUT }); if (i < lit - 1) grow(TX[i] + 36, 230, TX[i + 1] - 36, 230, 1, WARN); });
      mono(80, 60, `for t in range(6):   순차 연산 ${lit} / 6`, { 'font-size': 17, 'font-weight': 700, fill: WARN });
      sub(480, 300, 'h 가 스텝마다 이어진다 — 다음 칸은 기다린다', fade(u, 1.0), { 'font-size': 15 });
      note(480, 360, '문장이 길면 학습 시간이 선형으로 는다', fade(u, 2.3), { 'text-anchor': 'middle', fill: BAD }); return; }
    if (k === 3) { chain(320); let q = 0;
      for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const g = E(u, 0.5, 1.0); el('path', { d: `M${TX[i]},300 Q ${(TX[i] + TX[j]) / 2},${300 - 22 * (j - i)} ${TX[j]},300`, fill: 'none', stroke: ACC, 'stroke-width': 1.8, opacity: 0.6 * g }); q++; }
      mono(80, 70, 'attn = nn.MultiheadAttention(512, 8)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      mono(80, 105, 'out, weights = attn(x, x, x)   # Q=K=V=x', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
      pill(760, 170, '6스텝 → 호출 1회', GOOD, pop(u, 1.4), { fs: 16 });
      sub(760, 210, '15쌍이 한꺼번에', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 4) { chain(120);
      const g = seg(u, 0.3, 1.6); if (g > 0 && g < 1) { const i = Math.min(4, Math.floor(g * 5)), f = g * 5 - i; el('circle', { cx: lerp(TX[i], TX[i + 1], f), cy: 120, r: 9, fill: WARN }); }
      mono(80, 70, 'RNN: 그 → 않았다 = 5 hop (seq−1)', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      TK.forEach((s, i) => tok(TX[i], 320, s, { stroke: i === 0 || i === 5 ? ACC : GRID, color: i === 0 || i === 5 ? ACC : MUT, op: fade(u, 1.4) }));
      const a = E(u, 1.6, 2.2); if (a > 0) el('path', { d: `M${TX[0]},300 Q 480,${300 - 150 * a} ${lerp(TX[0], TX[5], a)},300`, fill: 'none', stroke: ACC, 'stroke-width': 4 });
      mono(80, 220, 'Attention: 언제나 1 hop', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) }); return; }
    // k5: 부품 목록 — 인코더·디코더 탑
    const tower = (cx, title, rows, colr, at) => { el('rect', { x: cx - 130, y: 80, width: 260, height: 220, rx: 14, fill: 'none', stroke: colr, 'stroke-width': 2.4, opacity: fade(u, at) });
      lbl(cx, 70, title, fade(u, at), { fill: colr });
      rows.forEach((r, i) => box(cx, 270 - i * 50, 220, 40, r, { fs: 14, s: pop(u, at + 0.2 + i * 0.15), stroke: r.includes('Norm') ? WARN : colr })); };
    tower(270, '인코더 × 6', ['Multi-Head Attn', 'Add & Norm', 'FFN', 'Add & Norm'], ACC, 0.2);
    tower(690, '디코더 × 6', ['Masked MHA', 'Cross MHA', 'FFN', '(각각 Add&Norm)'], INFO, 0.9);
    grow(400, 140, 560, 175, E(u, 1.8, 2.1), ACC);
    box(270, 360, 260, 40, 'Embedding + Positional Enc.', { fs: 14, s: pop(u, 2.0), stroke: GOOD }); box(690, 360, 260, 40, 'Embedding + Positional Enc.', { fs: 14, s: pop(u, 2.1), stroke: GOOD }); }

  // ---------- 2. 멀티헤드 ----------
  const HC = [ACC, INFO, WARN];
  function bar512(x, y, w, split, u0, o) { o = o || {}; const n = 8, gap = split * 8, sw = (w - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) el('rect', { x: x + i * (sw + gap), y, width: sw, height: o.h || 34, rx: 4, fill: i < 3 ? HC[i] : MUT, opacity: (o.op ?? 1) * (0.35 + 0.1 * (i % 2)) }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { bar512(80, 90, 800, E(u, 0.6, 1.2)); mono(480, 76, 'd_model = 512', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      for (let i = 0; i < 8; i++) { const x = 80 + i * 104 + 46; grow(x, 130, x, 200, E(u, 1.0 + i * 0.05, 1.3 + i * 0.05), MUT); box(x, 225, 80, 40, `head ${i + 1}`, { fs: 14, s: pop(u, 1.2 + i * 0.05), stroke: i < 3 ? HC[i] : MUT }); grow(x, 248, 480, 315, E(u, 1.8, 2.1), MUT, { plain: true }); }
      box(480, 335, 220, 40, 'concat → W_O', { fs: 16, s: pop(u, 2.1), stroke: ACC, color: ACC });
      sub(480, 395, '분할 → 병렬 → concat', fade(u, 2.4), { 'font-size': 15 }); return; }
    if (k === 1) { bar512(80, 110, 800, 1);
      for (let i = 0; i < 8; i++) mono(80 + i * 104 + 46, 160, '64', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.1) });
      mono(480, 90, 'd_k = 512 // 8 = 64', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      mono(480, 240, 'assert d_model % h == 0', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(480, 320, '64차원 시선 8개 — 총합은 여전히 512', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { ['w_q', 'w_k', 'w_v', 'w_o'].forEach((n, i) => { const x = 140 + i * 190, colr = i === 3 ? GOOD : [ACC, WARN, INFO][i];
        grid(x - 60, 110, 8, 8, 15, 15, colr, { show: () => pop(u, 0.2 + i * 0.3) }); mono(x, 260, n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: colr, opacity: fade(u, 0.3 + i * 0.3) }); });
      sub(330, 290, 'Linear(512, 512) × 4', fade(u, 1.5), { 'font-size': 15 });
      mono(480, 345, '4 × (512×512 + 512) = 1,050,624', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
      sub(710, 290, 'w_o = 관점 합성용', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 3) { grid(60, 110, 6, 16, 18, 28, ACC, { show: () => 1 - 0.7 * E(u, 1.0, 1.5) }); mono(200, 300, '(B, L, 512)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      grow(370, 190, 450, 190, E(u, 0.6, 1.0), MUT); mono(380, 175, 'view·transpose', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      for (let h = 7; h >= 0; h--) grid(560 + h * 22, 80 + (7 - h) * 22, 6, 4, 22, 20, h < 3 ? HC[h] : MUT, { show: () => fade(u, 1.0 + (7 - h) * 0.08) });
      mono(700, 395, '(B, 8, L, 64)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.7) });
      sub(200, 345, '헤드 축이 배치처럼 → 행렬곱 한 번', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 4) { for (let h = 0; h < 8; h++) { const x = 70 + (h % 4) * 115, y = 90 + Math.floor(h / 4) * 130;
        grid(x, y, 6, 6, 16, 16, h < 3 ? HC[h] : MUT, { show: () => fade(u, 0.3 + h * 0.08), op: (i, j) => 0.15 + 0.6 * (((i + 2) * (j + 3) * (h + 1)) % 7) / 7 }); }
      mono(240, 380, 'scores (B, 8, L, L)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      mono(720, 160, 'QK^T / √d_k', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      mono(720, 205, '√64 = 8', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(720, 250, '헤드마다 독립 계산', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 5) { const n = 6, cs = 44;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const fut = j > i, sh = fade(u, 0.2 + (i * n + j) * 0.01), mk = fut ? E(u, 0.9, 1.4) : 0;
        el('rect', { x: 80 + j * cs, y: 90 + i * cs, width: cs - 3, height: cs - 3, rx: 4, fill: fut && mk > 0.5 ? SOFT : ACC, opacity: sh * (fut && mk > 0.5 ? 1 : 0.25 + 0.1 * ((i + j) % 3)) });
        if (fut && mk > 0.5) mono(80 + j * cs + 20, 90 + i * cs + 27, '−∞', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: mk }); }
      mono(420, 120, 'masked_fill(mask == 0, -inf)', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      grow(560, 170, 560, 220, E(u, 1.5, 1.8), MUT); mono(575, 200, 'softmax', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      mono(420, 260, 'e^(−∞) = 0 → 확률 정확히 0', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
      sub(560, 320, '0 을 곱하지 않고 −∞ 를 채운다 — softmax 이전', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 6 || k === 7) { const cs = 30;
      HM.forEach((h, q) => { const x = 50 + q * 300; hmap(x + 40, 110, h.w, cs, HC[q], { show: (r) => (k === 6 ? fade(u, 0.3 + q * 0.5 + r * 0.05) : 1) });
        lbl(x + 130, 92, h.name, k === 6 ? fade(u, 0.3 + q * 0.5) : 1, { fill: HC[q] });
        if (q === 0) TK.forEach((s, r) => tx(x + 34, 110 + r * cs + 20, s, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT })); });
      sub(480, 320, '예시 가중치 — 같은 문장, 헤드마다 다른 관계', k === 6 ? fade(u, 1.8) : 1, { 'font-size': 14.5 });
      if (k === 6) { mono(480, 365, 'out = attn @ v   (B, 8, L, 64)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
      // k7: concat → W_O
      for (let i = 0; i < 8; i++) { const m = E(u, 0.3 + i * 0.08, 1.0 + i * 0.08); el('rect', { x: lerp(60 + i * 110, 200 + i * 70, m), y: lerp(350, 360, m), width: lerp(90, 68, m), height: 22, rx: 3, fill: i < 3 ? HC[i] : MUT, opacity: 0.55 }); }
      grow(770, 371, 830, 371, E(u, 1.5, 1.8), ACC); box(880, 371, 90, 40, 'W_O', { mono: true, s: pop(u, 1.8), stroke: ACC, color: ACC });
      mono(480, 408, '(B, 8, L, 64) → (B, L, 512) → W_O', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.1) }); return; }
    // k8: √d_k 이유 — 내적 분포
    const ax = R.axes(80, 90, 520, 240, { x: [-24, 24], y: [0, 0.42], xt: [-16, -8, 0, 8, 16], xl: 'q·k 값' });
    const gauss = (s) => { const pts = []; for (let i = 0; i <= 96; i++) { const x = -24 + i * 0.5; pts.push([x, Math.exp(-x * x / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI))]); } return pts; };
    R.line(ax, gauss(8), E(u, 0.3, 1.1), BAD, { sw: 3 }); R.line(ax, gauss(1), E(u, 1.2, 2.0), ACC, { sw: 3 });
    tx(ax.X(10), ax.Y(0.06), '분산 = d_k = 64', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
    tx(ax.X(2), ax.Y(0.36), '÷ √64 → 분산 1', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
    note(640, 150, '큰 점수 → softmax 가 한 점에 몰림', fade(u, 1.4), { fill: BAD });
    sub(780, 190, '→ 기울기 소실', fade(u, 1.6), { 'font-size': 15, fill: BAD });
    note(640, 260, '나눠서 분산을 1 로', fade(u, 2.2), { fill: ACC });
    sub(780, 300, '(q·k 성분이 평균 0·분산 1 일 때)', fade(u, 2.4), { 'font-size': 14 }); }

  // ---------- 3. 포지셔널 인코딩 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { mono(480, 140, 'PE(pos, 2i)   = sin(pos / 10000^(2i/d))', { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      mono(480, 200, 'PE(pos, 2i+1) = cos(pos / 10000^(2i/d))', { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.9) });
      pill(300, 290, '짝수 차원 = sin', ACC, pop(u, 1.5), { fs: 15 }); pill(660, 290, '홀수 차원 = cos', INFO, pop(u, 1.7), { fs: 15 });
      sub(480, 360, '학습되는 값이 아니라 계산으로 정해진다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1 || k === 7) { const ax = R.axes(80, 70, 620, 250, { x: [0, k === 7 ? 90 : 60], y: [-1.1, 1.1], xt: k === 7 ? [0, 30, 60, 90] : [0, 20, 40, 60], xl: '위치 pos' });
      const W = [[0, ACC, 'dim 0  파장 6.3'], [64, WARN, 'dim 64  파장 19.9'], [128, INFO, 'dim 128  파장 62.8']];
      W.forEach(([d2, colr, n], q) => { const w = Math.pow(10000, d2 / 512), pts = []; for (let i = 0; i <= 240; i++) { const x = i * (k === 7 ? 0.375 : 0.25); pts.push([x, Math.sin(x / w)]); }
        R.line(ax, k === 7 ? pts.filter((p) => p[0] <= 60) : pts, k === 1 ? E(u, 0.3 + q * 0.5, 1.0 + q * 0.5) : 1, colr, { sw: 2.6 });
        if (k === 7) R.line(ax, pts.filter((p) => p[0] >= 60), E(u, 0.3, 1.2), colr, { sw: 2.6, dash: '6 5' });
        tx(730, 110 + q * 40, n, { 'font-size': 15, 'font-weight': 700, fill: colr, opacity: k === 1 ? fade(u, 0.6 + q * 0.5) : 1 }); });
      if (k === 1) { sub(820, 260, '빠른 진동 = 이웃 구분', fade(u, 1.9), { 'font-size': 15 }); sub(820, 290, '느린 진동 = 먼 거리 구분', fade(u, 2.2), { 'font-size': 15 }); return; }
      el('line', { x1: ax.X(60), y1: 70, x2: ax.X(60), y2: 320, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      sub(ax.X(60) + 60, 58, '학습 길이 너머', fade(u, 0.6), { 'font-size': 14 });
      pill(820, 270, '학습형 위치 (BERT)', INFO, pop(u, 1.6), { fs: 14 }); pill(820, 320, 'RoPE (최신 LLM)', ACC, pop(u, 1.9), { fs: 14 });
      sub(820, 370, '모두 여기서 갈라졌다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 2) { grid(200, 80, 12, 32, 16, 20, MUT, { show: () => fade(u, 0.3), op: () => 0.18 });
      tx(190, 95, '0', { 'font-size': 14, 'text-anchor': 'end', fill: MUT, class: 'mono' }); tx(190, 315, '4999', { 'font-size': 14, 'text-anchor': 'end', fill: MUT, class: 'mono' });
      tx(190, 210, '⋮', { 'font-size': 18, 'text-anchor': 'end', fill: MUT });
      mono(456, 340, 'pe = zeros(5000, 512)', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      for (let i = 0; i < 12; i++) el('rect', { x: 100, y: 80 + i * 20, width: 30, height: 18.5, rx: 2, fill: ACC, opacity: fade(u, 1.1 + i * 0.03) * (0.2 + 0.6 * i / 11) });
      mono(115, 340, 'pos (5000, 1)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) });
      note(760, 160, '한 번 만들어 두고', fade(u, 1.9)); note(760, 195, '순전파는 슬라이싱만', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 3) { const ax = R.axes(100, 80, 520, 240, { x: [0, 255], y: [0, 1], xt: [0, 128, 255], yt: [0, 0.5, 1], xl: 'i (0 ~ 255)', yl: 'div_i' });
      const pts = []; for (let i = 0; i <= 255; i += 3) pts.push([i, Math.pow(10000, -2 * i / 512)]); R.line(ax, pts, E(u, 0.4, 1.6), ACC, { sw: 3 });
      mono(660, 130, 'div = exp(−log(10000)·2i/d)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(660, 170, '    = 1 / 10000^(2i/d)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      mono(660, 230, 'i=0 → 1.0', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); mono(660, 260, 'i=255 → 0.0001', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(780, 320, '거듭제곱 대신 exp·log — 수치 안정', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { const cs = 34, d = 16; for (let p = 0; p < 8; p++) for (let i = 0; i < d; i++) { const v = peV(p, i, d), sh = fade(u, 0.3 + (i % 2 ? 0.9 : 0) + p * 0.05);
          el('rect', { x: 140 + i * cs, y: 90 + p * cs, width: cs - 3, height: cs - 3, rx: 3, fill: v >= 0 ? ACC : INFO, opacity: sh * (0.08 + 0.85 * Math.abs(v)) }); }
      for (let p = 0; p < 8; p++) mono(130, 90 + p * cs + 22, `pos ${p}`, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT });
      tx(140, 80, '짝수 열 ← sin', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) }); tx(400, 80, '홀수 열 ← cos', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
      sub(410, 385, 'd_model=16 축소판으로 실제 계산 · 진할수록 |값| 큼 (초록 +, 파랑 −)', fade(u, 1.8), { 'font-size': 14 });
      mono(740, 80, 'register_buffer', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { grid(120, 120, 1, 16, 26, 30, ACC, { show: () => fade(u, 0.2) }); tx(110, 141, '임베딩', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      tx(320, 195, '+', { 'font-size': 28, 'font-weight': 800, opacity: fade(u, 0.5) });
      grid(120, 220, 1, 16, 26, 30, INFO, { show: () => fade(u, 0.6), fill: (i, j) => (peV(3, j, 16) >= 0 ? ACC : INFO), op: (i, j) => 0.1 + 0.8 * Math.abs(peV(3, j, 16)) }); tx(110, 241, 'PE[pos]', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: INFO, opacity: fade(u, 0.6) });
      grow(328, 260, 328, 300, E(u, 1.0, 1.3), MUT);
      grid(120, 315, 1, 16, 26, 30, GOOD, { show: () => fade(u, 1.3) }); tx(110, 336, 'x', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: GOOD, opacity: fade(u, 1.3) });
      mono(720, 140, 'x + pe[:L]', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      mono(720, 200, '512 + 512 → 512', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(720, 250, 'concat → 1024', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); cross(830, 245, 10, pop(u, 2.2));
      sub(720, 300, '차원이 그대로 — 뒤쪽 구조를 안 바꾼다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k6: 회전
    const cx = 260, cy = 220, r = 120, w = 1, a0 = 10 * w, a1 = 13 * w;
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 2 }); el('line', { x1: cx - r - 10, y1: cy, x2: cx + r + 10, y2: cy, stroke: GRID }); el('line', { x1: cx, y1: cy - r - 10, x2: cx, y2: cy + r + 10, stroke: GRID });
    const P = (a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
    const g = E(u, 0.9, 1.8), a = lerp(a0, a1, g), p0 = P(a0), pa = P(a);
    el('line', { x1: cx, y1: cy, x2: p0[0], y2: p0[1], stroke: MUT, 'stroke-width': 2.5 }); el('circle', { cx: p0[0], cy: p0[1], r: 8, fill: MUT });
    tx(p0[0] + 14, p0[1] + 5, 'PE(10)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    if (u > 0.9) { el('line', { x1: cx, y1: cy, x2: pa[0], y2: pa[1], stroke: ACC, 'stroke-width': 3 }); el('circle', { cx: pa[0], cy: pa[1], r: 9, fill: ACC }); }
    tx(P(a1)[0] - 16, P(a1)[1] - 12, 'PE(13)', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.8) });
    sub(cx, 380, '(sin, cos) 한 쌍 — dim 0, 1', fade(u, 0.3), { 'font-size': 14.5 });
    mono(470, 130, 'sin(a+k) = sin a·cos k + cos a·sin k', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
    mono(470, 190, 'PE(pos+k) = R_k · PE(pos)', { 'font-size': 19, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
    note(470, 250, 'k칸 떨어짐 = 고정된 회전 하나', fade(u, 2.0));
    sub(700, 300, '위치와 무관하게 상대 거리를 배운다', fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 4. 블록 완성 ----------
  const BY = { in: 360, mha: 290, n1: 230, ffn: 160, n2: 100, out: 40 };
  function encBlock(cx, o) { o = o || {}; const at = o.at || (() => 1), hi = o.hi || (() => false);
    [['in', 'x  (B, L, 512)', MUT], ['mha', 'Multi-Head Attn', ACC], ['n1', 'Add & Norm', WARN], ['ffn', 'FFN 512→2048→512', INFO], ['n2', 'Add & Norm', WARN]].forEach(([id, s, colr]) => {
      const sh = at(id); if (sh <= 0.01) return; box(cx, BY[id], 230, 42, s, { fs: 15, stroke: colr, s: sh, fill: hi(id) ? ACCBG : PANEL, sw: hi(id) ? 3 : 2 }); });
    [['in', 'mha'], ['mha', 'n1'], ['n1', 'ffn'], ['ffn', 'n2']].forEach(([a, b]) => { if (at(b) > 0.5) grow(cx, BY[a] - 22, cx, BY[b] + 23, 1, MUT); }); }
  function resid(cx, from, to, u0, colr) { if (u0 <= 0) return; const x = cx + 150, y1 = BY[from], y2 = BY[to];
    el('path', { d: `M${cx + 115},${y1} H${x} V${lerp(y1, y2, clamp(u0))}`, fill: 'none', stroke: colr || WARN, 'stroke-width': 3 });
    if (u0 >= 1) grow(x, y2, cx + 117, y2, 1, colr || WARN); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0 || k === 2) { const xs = TK.map((_, i) => 110 + i * 150);
      TK.forEach((s, i) => { tok(xs[i], 360, s); tok(xs[i], 70, s, { op: 0.5, stroke: GRID }); });
      if (k === 0) { for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (i !== j) el('line', { x1: xs[i], y1: 340, x2: xs[j], y2: 250, stroke: ACC, 'stroke-width': 1.3, opacity: 0.35 * fade(u, 0.3) });
        box(480, 230, 860, 40, '어텐션 = 토큰끼리 섞기 (문맥 모으기)', { fs: 15, stroke: ACC, s: pop(u, 0.5), color: ACC });
        xs.forEach((x, i) => { box(x, 150, 110, 40, 'FFN', { s: pop(u, 1.3 + i * 0.08), stroke: INFO, color: INFO, mono: true }); grow(x, 208, x, 172, E(u, 1.2, 1.5), MUT); });
        note(480, 120, '모은 것을 토큰마다 비선형으로 소화 = FFN', fade(u, 2.2), { 'text-anchor': 'middle', fill: INFO }); return; }
      xs.forEach((x, i) => { box(x, 215, 110, 50, 'FFN', { s: 1, stroke: INFO, color: INFO, mono: true }); grow(x, 340, x, 242, E(u, 0.3 + i * 0.05, 0.7 + i * 0.05), MUT); grow(x, 188, x, 90, E(u, 0.9 + i * 0.05, 1.3 + i * 0.05), MUT); });
      cross(480, 300, 14, pop(u, 1.6));
      note(560, 306, '토큰 사이 선 없음', fade(u, 1.6), { fill: BAD });
      sub(480, 405, '같은 FFN 을 위치마다 따로 — 섞기는 어텐션의 몫', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) { const cols = [[90, 4, 'd 512'], [330, 12, 'd_ff 2048'], [570, 4, 'd 512']];
      cols.forEach(([x, n, s], q) => { const gap = 300 / n; for (let i = 0; i < n; i++) el('circle', { cx: x, cy: 80 + gap / 2 + i * gap, r: n > 6 ? 9 : 12, fill: PANEL, stroke: q === 1 ? INFO : INK, 'stroke-width': 2, opacity: fade(u, 0.2 + q * 0.5) });
        mono(x, 405, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: q === 1 ? INFO : INK, opacity: fade(u, 0.2 + q * 0.5) }); });
      [[0, 1, 0.5], [1, 2, 1.0]].forEach(([a, b, at]) => { const [x1, n1] = cols[a], [x2, n2] = cols[b], g = E(u, at, at + 0.4); if (g <= 0) return;
        for (let i = 0; i < n1; i++) for (let j = 0; j < n2; j++) el('line', { x1: x1 + 12, y1: 80 + 150 / n1 + i * 300 / n1, x2: lerp(x1 + 12, x2 - 12, g), y2: lerp(80 + 150 / n1 + i * 300 / n1, 80 + 150 / n2 + j * 300 / n2, g), stroke: MUT, 'stroke-width': 0.8, opacity: 0.4 }); });
      mono(210, 70, 'ReLU', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.9) });
      // 파라미터 비중
      const tot = 3152384, parts = [[1050624, 'MHA', ACC], [2099712, 'FFN', INFO], [2048, 'Norm', WARN]]; let x0 = 660;
      parts.forEach(([v, n, colr], q) => { const w = 260 * v / tot * E(u, 1.5, 2.1); el('rect', { x: x0, y: 160, width: Math.max(w, 1), height: 34, fill: colr, opacity: 0.75 }); x0 += w; });
      lbl(790, 140, '인코더 층 파라미터', fade(u, 1.5), { 'font-size': 15 });
      mono(790, 225, 'FFN 2,099,712 / 3,152,384', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 2.0) });
      note(790, 270, '≈ 2/3 가 FFN', fade(u, 2.3), { 'text-anchor': 'middle', fill: INFO }); return; }
    if (k >= 3 && k <= 6) { const cx = 300;
      const at = k === 3 ? (id) => pop(u, { in: 0.2, mha: 0.5, n1: 0.8, ffn: 1.1, n2: 1.4 }[id]) : k === 4 ? (id) => (id === 'in' ? 1 : pop(u, { mha: 0.3, n1: 0.7, ffn: 1.1, n2: 1.5 }[id])) : () => 1;
      encBlock(cx, { at, hi: (id) => (k === 5 && (id === 'n1' || id === 'mha')) || (k === 6 && (id === 'n2' || id === 'ffn')) });
      if (k === 3) { el('rect', { x: cx - 135, y: 70, width: 270, height: 245, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, 1.7) });
        mono(cx + 150, 80, '× 6', { 'font-size': 24, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
        note(560, 200, 'MHA → Add&Norm → FFN → Add&Norm', fade(u, 2.1)); sub(720, 240, '층마다 파라미터는 다르고 구조는 같다', fade(u, 2.3), { 'font-size': 15 }); return; }
      if (k === 4) { [['attn', 'MultiheadAttention (②)', ACC], ['ffn', 'FeedForward', INFO], ['norm1', 'LayerNorm', WARN], ['norm2', 'LayerNorm', WARN]].forEach(([n, d, colr], i) => {
          mono(560, 120 + i * 50, `self.${n}`, { 'font-size': 16, 'font-weight': 700, fill: colr, opacity: fade(u, 0.3 + i * 0.4) }); sub(800, 120 + i * 50 - 5, d, fade(u, 0.4 + i * 0.4), { 'font-size': 14.5 }); });
        sub(700, 340, '서브레이어 2개 → Norm 2개', fade(u, 2.2), { 'font-size': 15 }); return; }
      if (k === 5) { resid(cx, 'in', 'n1', E(u, 0.4, 1.2));
        R.dot([[cx, BY.in - 22], [cx, BY.mha], [cx, BY.n1]], seg(u, 0.5, 1.4), ACC, 7); R.dot([[cx + 115, BY.in], [cx + 150, BY.in], [cx + 150, BY.n1], [cx + 117, BY.n1]], seg(u, 0.5, 1.4), WARN, 7);
        mono(560, 150, 'a = attn(x, x, x)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
        mono(560, 200, 'x = norm1(x + a)', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
        note(560, 260, '잔차 = gradient 고속도로', fade(u, 1.8), { fill: WARN });
        sub(720, 300, '서브레이어가 쓸모없어도 x 는 그대로 통과', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      resid(cx, 'in', 'n1', 1); resid(cx, 'n1', 'n2', E(u, 0.3, 1.0));
      mono(560, 150, 'x = norm2(x + ffn(x))', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) });
      mono(560, 220, '들어올 때 (B, L, 512)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) }); mono(560, 255, '나갈 때   (B, L, 512)', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      note(560, 320, '모양 보존 → 몇 층이든 쌓을 수 있다', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 7) { const n = 5, cs = 52; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const ok = j <= i, sh = fade(u, 0.3 + i * 0.12);
          el('rect', { x: 100 + j * cs, y: 90 + i * cs, width: cs - 3, height: cs - 3, rx: 5, fill: ok ? ACC : SOFT, opacity: sh * (ok ? 0.6 : 1) });
          mono(100 + j * cs + 24, 90 + i * cs + 31, ok ? '1' : '−∞', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ok ? PANEL : BAD, opacity: sh }); }
      mono(450, 130, 'torch.tril(ones(L, L)).bool()', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
      note(450, 200, 't 번째는 자신 이전만 본다', fade(u, 1.3), { fill: ACC });
      note(450, 250, '안 가리면 다음 단어를 베낀다', fade(u, 1.8), { fill: BAD });
      sub(620, 300, '→ 손실 0, 아무것도 못 배움', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k8: 디코더 세 겹 + 인코더
    box(170, 330, 220, 44, '인코더 출력', { s: pop(u, 0.2), stroke: ACC, color: ACC }); el('rect', { x: 60, y: 120, width: 220, height: 180, rx: 12, fill: ACCBG, opacity: fade(u, 0.2) }); lbl(170, 210, '인코더 × 6', fade(u, 0.2), { fill: ACC });
    [['Masked MHA', 320, BAD, 0.4], ['Cross MHA', 220, INFO, 0.9], ['FFN', 120, INFO, 1.4]].forEach(([s, y, colr, at]) => { box(620, y, 240, 46, s, { s: pop(u, at), stroke: colr }); box(620, y - 38, 150, 26, 'Add & Norm', { fs: 13.5, s: pop(u, at + 0.2), stroke: WARN }); });
    grow(282, 330 - 120, 498, 222, E(u, 1.1, 1.5), ACC); mono(330, 250, 'K, V', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
    mono(760, 230, 'Q', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
    note(800, 380, '서브레이어 3개, 각각 Add&Norm', fade(u, 2.2), { 'text-anchor': 'middle' }); }

  // ---------- 5. 왜 혁명인가 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const ids = [17, 402, 88, 1203]; ids.forEach((id, i) => { mono(90, 130 + i * 50, String(id), { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.2 + i * 0.1) }); grow(100, 125 + i * 50, 250, 90 + id % 9 * 26 + 10, E(u, 0.8 + i * 0.1, 1.2 + i * 0.1), ACC, { plain: true }); });
      grid(260, 90, 10, 20, 20, 26, ACC, { show: () => fade(u, 0.4) }); lbl(460, 75, 'nn.Embedding(vocab, 512)', fade(u, 0.4), { class: 'mono' });
      mono(460, 380, '행 하나 = 토큰 하나의 512차원 벡터', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(720, 180, '토큰 id → 표의 한 행', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 1 || k === 2) { const cx = 300; box(cx, 380, 260, 36, 'embed + pos (③)', { fs: 15, stroke: GOOD, s: k === 1 ? pop(u, 0.2) : 1 });
      for (let l = 0; l < 6; l++) { const y = 330 - l * 50, on = k === 1 ? pop(u, 0.5 + l * 0.2) : 1; box(cx, y, 260, 38, `EncoderLayer ${l + 1} (④)`, { fs: 14.5, s: on, stroke: ACC }); }
      if (k === 1) { mono(560, 150, 'nn.ModuleList([...] × 6)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); sub(720, 200, '리스트가 아니라 ModuleList — 파라미터 등록', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      const g = clamp((u - 0.3) / 2.0), ly = 380 - g * 300; for (let i = 0; i < 6; i++) el('circle', { cx: cx + 150 + i * 18, cy: ly, r: 6, fill: ACC });
      mono(560, 150, 'h = pos(embed(x))', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(560, 185, 'for layer in layers: h = layer(h)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      note(560, 260, '층(깊이)은 순차', fade(u, 1.2)); note(560, 300, '토큰(길이)은 언제나 병렬', fade(u, 1.7), { fill: ACC }); return; }
    if (k === 3) { const args = [['d_model', '512'], ['nhead', '8'], ['num_encoder_layers', '6'], ['num_decoder_layers', '6'], ['dim_feedforward', '2048'], ['dropout', '0.1']];
      el('rect', { x: 60, y: 70, width: 470, height: 300, rx: 12, fill: SOFT });
      mono(80, 100, 'nn.Transformer(', { 'font-size': 17, 'font-weight': 800, fill: ACC });
      args.forEach(([a, v], i) => { mono(110, 140 + i * 36, `${a} =`, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.2) }); mono(400, 140 + i * 36, v, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.2) }); });
      note(580, 160, '논문 설정과 1:1', fade(u, 1.7));
      mono(580, 230, '파라미터 44,140,544개', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      sub(740, 270, '(직접 세어 본 값)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4) { const slab = (x, y, L, colr, at) => { for (let b = 3; b >= 0; b--) grid(x + b * 10, y - b * 10, 1, L, 12, 60, colr, { show: () => fade(u, at) }); };
      slab(60, 130, 20, ACC, 0.2); mono(190, 230, 'src (32, 20, 512)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      slab(60, 300, 15, INFO, 0.6); mono(160, 400, 'tgt (32, 15, 512)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.7) });
      for (let i = 0; i < 15; i++) for (let j = 0; j < 15; j++) el('rect', { x: 380 + j * 10, y: 130 + i * 10, width: 9, height: 9, fill: j <= i ? INFO : SOFT, opacity: fade(u, 1.0) * (j <= i ? 0.6 : 1) });
      mono(455, 300, 'tgt_mask (15, 15)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      grow(560, 210, 640, 210, E(u, 1.4, 1.7), MUT);
      slab(660, 210, 15, GOOD, 1.7); mono(760, 300, 'out (32, 15, 512)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) });
      note(640, 370, '원문 32 × 20 = 640토큰이 한 번에', fade(u, 2.2), { fill: ACC }); return; }
    // k5, k6: 계보
    box(480, 70, 240, 44, 'Transformer (2017)', { s: k === 5 ? pop(u, 0.2) : 1, stroke: ACC, color: ACC, fill: ACCBG });
    const kids = [['BERT', '인코더만', ACC, 150], ['GPT', '디코더만', INFO, 370], ['ViT', '인코더 + 패치', WARN, 590], ['Whisper', '인코더-디코더 + 오디오', GOOD, 810]];
    kids.forEach(([n, d, colr, x], i) => { const show = i < 3 || k === 6, at = k === 5 ? 0.6 + i * 0.4 : i === 3 ? 0.3 : -1; if (!show) return;
      grow(480, 92, x, 165, at < 0 ? 1 : E(u, at, at + 0.3), MUT); box(x, 190, 190, 48, n, { fs: 17, stroke: colr, color: colr, s: at < 0 ? 1 : pop(u, at + 0.2) }); sub(x, 236, d, at < 0 ? 1 : fade(u, at + 0.3), { 'font-size': 14.5 }); });
    if (k === 5) { note(480, 320, '새 구조가 아니라 — 블록을 어떻게 자르느냐', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    // 스케일링: 층 수
    [[6, '논문 6층 (+6)'], [96, 'GPT-3 96층']].forEach(([n, s], i) => { const x = 330 + i * 300, h = 100 * Math.log(n) / Math.log(96) * E(u, 0.8 + i * 0.4, 1.3 + i * 0.4);
      el('rect', { x: x - 40, y: 400 - h, width: 80, height: h, rx: 4, fill: ACC, opacity: 0.6 }); tx(x + 50, 395, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4) }); });
    sub(480, 278, '그 뒤의 역사 = 이 블록을 얼마나 크게 쌓느냐 (높이는 로그 눈금)', fade(u, 2.2), { 'font-size': 14.5 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "Transformer가 RNN을 버린 두 이유(순차 처리·정보 희석)의 공통 뿌리는 무엇인가?",
      o: ["파라미터가 너무 많다는 점", "순차성 — t번째 토큰이 t-1번째 결과를 기다려야 한다는 점", "어텐션을 쓸 수 없다는 점"], a: 1,
      why: "순차 처리 때문에 토큰 6개면 GPU가 6번을 기다리고, 먼 토큰은 최대 seq-1번을 거쳐야 만난다. 어텐션은 호출 한 번, 거리는 항상 1 hop이다." },
    { q: "멀티헤드 어텐션에서 512차원을 8개 헤드×64차원으로 쪼개는 이유는 무엇인가?",
      o: ["헤드마다 다른 부분공간에서 서로 다른 관계를 보게 하려고", "총 연산량을 8배로 늘려 표현력을 키우려고", "디코더의 미래 토큰을 가리려고"], a: 0,
      why: "헤드 하나는 한 관점의 관계만 잘 잡는다. 쪼개도 총 계산량은 단일 헤드와 거의 같고, concat 후 W_O가 8개 관점을 하나로 합친다." },
    { q: "포지셔널 인코딩을 임베딩에 더하는 이유는 무엇인가?",
      o: ["임베딩 차원을 두 배로 늘리려고", "학습되는 위치 파라미터로 표현력을 키우려고", "내용만 비교해 순서를 모르는 어텐션에 위치를 알려 주려고"], a: 2,
      why: "차원마다 파장이 다른 sin/cos 값을 더하면 위치마다 고유한 무늬가 생긴다. 이어 붙이지 않고 더하므로 차원이 늘지 않고, 학습값이 아니라 계산값이다." },
    { q: "Add&Norm의 Add(x + Sublayer(x))가 하는 일은 무엇인가?",
      o: ["미래 토큰의 점수를 -inf로 가린다", "서브레이어를 우회하는 잔차 통로를 만들어 깊게 쌓아도 학습되게 한다", "토큰 벡터를 4배로 넓혔다가 되돌린다"], a: 1,
      why: "서브레이어가 아무것도 못 해도 입력이 그대로 통과한다. ResNet의 통찰과 같아서 논문의 6층에서 GPT-3의 96층까지 쌓을 수 있다." },
    { q: "BERT·GPT·ViT·Whisper와 Transformer 블록의 관계로 맞는 것은?",
      o: ["RNN을 다시 붙여 긴 문장 성능을 보완했다", "각자 완전히 새로운 구조를 발명했다", "BERT는 인코더만, GPT는 디코더만 떼는 식으로 같은 블록을 변주했다"], a: 2,
      why: "ViT는 입력을 이미지 패치로 바꿨을 뿐이고 Whisper는 인코더-디코더 원형 그대로다. 병렬화가 되니 이 블록을 크게 쌓는 스케일링이 시작됐다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'RNN은 앞 토큰 결과를 기다리느라 GPU가 놀고, 먼 단어 정보는 여러 스텝을 거치며 흐려진다.',
    '멀티헤드는 512차원을 8개 헤드로 나눠 관계를 여러 관점에서 본다. 총 연산량은 거의 같다.',
    '순서는 sin·cos 위치 값을 더해 알려 주고, 잔차 연결 덕에 층을 깊게 쌓아도 학습된다.',
    '순차 의존이 없어 완전 병렬로 학습된다. 덕분에 모델을 크게 키우는 스케일링이 시작됐다.',
  ];
  const review = [
    { q: '디코더를 학습할 때 마스크를 빼먹었다. 학습 loss는 금세 바닥까지 떨어졌는데 실제 생성은 엉망이다. 이유는?',
      o: ['위치 인코딩이 함께 사라져서', '미래 정답 토큰을 미리 보고 베껴서', '헤드 수가 줄어 관점이 모자라서'], a: 1,
      why: '마스크가 없으면 학습 때 맞혀야 할 다음 토큰이 입력에 보인다. 생성할 때는 미래가 없으니 베끼던 습관이 통하지 않는다.' },
    { q: 'sin·cos 위치 인코딩을 쓴 모델에 학습 때보다 긴 문장을 넣었다. 맞는 설명은?',
      o: ['학습한 위치 표가 모자라 바로 오류가 난다', '긴 문장은 위치 정보 없이 처리된다', '위치 값이 계산식이라 처음 보는 길이에도 만들어진다'], a: 2,
      why: '사인·코사인 위치 값은 학습한 표가 아니라 위치를 넣어 계산한 값이다. 그래서 학습 때 못 본 길이에도 외삽된다.' },
    { q: 'Transformer 블록 안에서 어텐션과 FFN의 역할 분담으로 맞는 것은?',
      o: ['어텐션은 토큰 사이 문맥을 모으고, FFN은 토큰마다 그걸 소화한다', 'FFN이 토큰 사이 관계를 보고, 어텐션은 토큰마다 따로 돈다', '둘 다 미래 토큰을 가리는 일을 한다'], a: 0,
      why: '어텐션은 다른 토큰을 참조해 문맥을 모은다. FFN은 토큰별로 따로 적용되는 2층 MLP라 모아 온 정보를 비선형으로 다듬는다.' },
  ];

  RA.page({ title: 'Transformer 해부 — 토큰 6개 "그 동물은 피곤해서…"', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
