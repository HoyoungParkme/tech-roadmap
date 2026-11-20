/* III-2-2 seq2seq — 인코더-디코더와 병목 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 토큰·어순 연결·디코딩 표·노출 편향 줄·BLEU·보존율·어텐션 가중치는 SRC_TOKENS · TGT_TOKENS 와 STEPS 의
 * mismatch · failBox · decodeTable · biasBox · bottleneck · attention · legacyBox 를 그대로 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, cross, check, dot, cells, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 57.31) * 43758.5453; return s - Math.floor(s); };
  const tok = (cx, cy, w, col, o) => { o = o || {}; const W = Math.max(48, tw(w, 15) + 22); card(cx, cy, W, 34, { rx: 8, text: w, fs: 15, fw: 700, stroke: col, color: col, fill: o.fill || PANEL, s: o.s, op: o.op, dash: o.dash }); return W; };
  // 은닉 벡터 (작은 칸 n 개 세로 막대)
  function vec(x, y, n, col, o) { o = o || {}; for (let i = 0; i < n; i++) el('rect', { x, y: y + i * 9, width: 14, height: 7, rx: 1.5, fill: col, opacity: (o.op ?? 1) * (0.25 + 0.65 * hsh(i + (o.seed || 0) * 13)) }); }

  // ---------- 1. 번역 문제의 구조 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, M = b.mismatch || { src: [], tgt: [], links: [] };
    const SX = (i) => 150 + i * 120, TX = (i) => 560 + i * 100;
    if (k === 0) { // 분류 vs 번역
      tx(40, 40, '분류', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      card(120, 110, 140, 50, { rx: 10, text: '이미지 분류기', fs: 15, s: pop(u, 0.3) }); grow(192, 110, 252, 110, E(u, 0.6, 0.9), MUT);
      cells(262, 92, ['0.1', '0.9'], { w: 50, h: 36, fs: 14, style: () => ({ s: pop(u, 0.9), stroke: INFO, color: INFO }) });
      mono(262, 152, '고정 차원 벡터 1개', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.1) });
      tx(40, 230, '번역', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.2) });
      M.src.forEach((w, i) => tok(120 + i * 90, 290, w, ACC, { s: pop(u, 1.3 + i * 0.1) }));
      grow(345, 290, 420, 290, E(u, 1.6, 1.9), MUT);
      M.tgt.forEach((w, i) => tok(480 + i * 105, 290, w, INFO, { s: pop(u, 1.8 + i * 0.1) }));
      mono(480, 350, 'm = 3  →  n = 4  (m ≠ n)', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { // 어휘 사전
      const SV = [['<PAD>', 0], ['<SOS>', 1], ['<EOS>', 2], ['나는', 3], ['학생', 4], ['이다', 5]], TV = [['<PAD>', 0], ['<SOS>', 1], ['<EOS>', 2], ['I', 3], ['am', 4], ['a', 5], ['student', 6]];
      tx(60, 40, 'SRC_VOCAB', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC }); tx(520, 40, 'TGT_VOCAB', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO });
      const row = (x, y, w, id, col, sp, at) => { const op = fade(u, at); card(x + 70, y, 140, 34, { rx: 6, text: w, fs: 15, mono: true, stroke: sp ? WARN : col, color: sp ? WARN : col, fill: sp ? WARNBG : PANEL, op }); mono(x + 170, y + 5, String(id), { 'font-size': 16, 'font-weight': 800, op, opacity: op }); };
      SV.forEach(([w, id], i) => row(60, 80 + i * 44, w, id, ACC, i < 3, 0.2 + i * 0.15));
      TV.forEach(([w, id], i) => row(520, 80 + i * 44, w, id, INFO, i < 3, 0.5 + i * 0.15));
      note(300, 400, '특수 토큰 3종이 0·1·2 를 먼저 차지한다', fade(u, 2.1), { fill: WARN }); return; }
    // k ≥ 2: 두 id 시퀀스
    const SRC = [[3, '나는'], [4, '학생'], [5, '이다'], [2, '<EOS>']], TGT = [[1, '<SOS>'], [3, 'I'], [4, 'am'], [5, 'a'], [6, 'student'], [2, '<EOS>']];
    const sa = k === 2 ? 0.2 : -9, ta = k === 2 ? 1.0 : -9;
    tx(30, 56, 'src', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC }); tx(30, 166, 'tgt', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO });
    SRC.forEach(([id, w], i) => { const s = pop(u, sa + i * 0.15); card(100 + i * 82, 50, 70, 40, { rx: 6, text: String(id), fs: 17, mono: true, stroke: ACC, color: ACC, s }); tx(100 + i * 82, 90, w, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
    TGT.forEach(([id, w], i) => { const s = pop(u, ta + i * 0.15); card(100 + i * 82, 160, 70, 40, { rx: 6, text: String(id), fs: 17, mono: true, stroke: INFO, color: INFO, s }); tx(100 + i * 82, 200, w, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
    if (k === 2) return;
    // 길이 괄호
    const lb = k === 3 ? E(u, 0.3, 1.0) : 1;
    el('path', { d: `M65,${24} H${lerp(65, 465, lb)}`, stroke: ACC, 'stroke-width': 2.5, fill: 'none' }); el('path', { d: `M65,${134} H${lerp(65, 629, lb)}`, stroke: INFO, 'stroke-width': 2.5, fill: 'none' });
    mono(480, 30, 'len 4', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: lb }); mono(645, 140, 'len 6', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: lb });
    if (k === 3) { banner(500, 300, 'print → 4 6 — 입력과 출력의 길이가 다르다', pop(u, 1.4)); return; }
    if (k === 4) { // 1:1 치환 실패 — 어순 교차
      tx(30, 262, '1:1 치환', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
      M.src.forEach((w, i) => tok(SX(i), 300, w, ACC, { s: pop(u, 0.3 + i * 0.1) }));
      M.tgt.forEach((w, i) => tok(TX(i), 380, w, INFO, { s: pop(u, 0.6 + i * 0.1) }));
      M.links.forEach((l, j) => grow(SX(l.s), 318, TX(l.t), 362, E(u, 1.0 + j * 0.3, 1.4 + j * 0.3), j === 0 ? MUT : BAD));
      el('circle', { cx: TX(2), cy: 380, r: 26, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', opacity: fade(u, 2.0) });
      mono(TX(2) + 30, 352, '"a" 의 원문은?', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) });
      mono(560, 262, '→ "I student am"', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); return; }
    // k5: 인코더 → 디코더
    const e = E(u, 0.2, 1.0);
    M.src.forEach((w, i) => tok(80 + i * 85, 300, w, ACC, { op: 1 }));
    card(370, 300, 110, 56, { rx: 10, text: '인코더\n(이해)', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.3) });
    grow(426, 300, 486, 300, e, MUT); vec(492, 270, 7, ACC, { op: e });
    grow(512, 300, 560, 300, E(u, 0.9, 1.2), MUT);
    card(620, 300, 110, 56, { rx: 10, text: '디코더\n(생성)', fs: 15, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 1.1) });
    ['I', 'am', 'a', 'student', '<EOS>'].forEach((w, i) => { const s = pop(u, 1.4 + i * 0.2); card(720 + (i % 3) * 82, 270 + Math.floor(i / 3) * 50, 74, 34, { rx: 8, text: w, fs: 14, fw: 700, stroke: i === 4 ? WARN : INFO, color: i === 4 ? WARN : INFO, s }); });
    note(560, 392, '<EOS> 가 나오면 스스로 멈춘다', fade(u, 2.4), { fill: WARN }); }

  // ---------- 2. 인코더-디코더 ----------
  const EX = [70, 170, 270, 370], DX = [590, 680, 770, 860];
  function s2(t, c) { const { k, u } = c, SRC = typeof SRC_TOKENS !== 'undefined' ? SRC_TOKENS : [], TGT = typeof TGT_TOKENS !== 'undefined' ? TGT_TOKENS : [];
    // 인코더 판
    const eo = k === 0 ? E(u, 0.2, 0.8) : 1;
    el('rect', { x: 20, y: 70, width: 410, height: 250, rx: 14, fill: ACCBG, opacity: 0.5 * eo }); tx(34, 94, 'Encoder — 압축', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: eo });
    if (k === 0) { SRC.forEach((w, i) => tok(EX[i], 380, w, ACC, { s: pop(u, 0.6 + i * 0.15) })); note(470, 200, '입력 문장 → 벡터 하나', fade(u, 1.4)); return; }
    // 부품: 임베딩 256 → GRU 512
    const read = k === 2 ? E(u, 0.3, 2.3) * SRC.length : k >= 2 ? SRC.length : 0;
    SRC.forEach((w, i) => { tok(EX[i], 380, w, ACC, { op: 1 });
      const on = i < read, s = k === 1 ? pop(u, 0.4 + i * 0.12) : 1;
      card(EX[i], 300, 64, 26, { rx: 5, text: 'emb', fs: 13.5, mono: true, stroke: ACC, color: ACC, s });
      card(EX[i], 200, 64, 46, { rx: 8, text: 'GRU', fs: 15, mono: true, stroke: on ? ACC : INK, color: on ? ACC : INK, fill: on ? PANEL : SOFT, s });
      if (i) grow(EX[i - 1] + 34, 200, EX[i] - 34, 200, k === 1 ? E(u, 0.8, 1.2) : on ? 1 : 0.0001, on ? ACC : MUT);
      grow(EX[i], 362, EX[i], 316, s, MUT, { plain: true }); grow(EX[i], 286, EX[i], 225, s, MUT, { plain: true }); });
    if (k === 1) { mono(470, 160, 'Embedding(vocab, 256)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); mono(470, 200, 'GRU(256 → hid 512)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      note(470, 250, '이 512 가 컨텍스트 벡터의 크기다', fade(u, 2.1)); return; }
    // outputs (모든 시점 h)
    SRC.forEach((w, i) => { if (i >= read) return; const gone = k >= 3; vec(EX[i] - 7, 112, 6, gone ? OFF : ACC, { seed: i, op: gone ? (k === 3 ? 1 - 0.6 * E(u, 0.3, 1.0) : 0.4) : 1 }); if (gone && (k > 3 || u > 1.0)) cross(EX[i], 138, 9); });
    if (k === 2) { const i = Math.min(SRC.length - 1, Math.floor(read)); dot([[EX[0] - 40, 200], [EX[3], 200]], E(u, 0.3, 2.3), ACC, 6);
      mono(470, 140, 'outputs : 모든 시점의 h', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); mono(470, 170, 'hidden  : 마지막 h', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    // 컨텍스트 벡터
    const cv = k === 3 ? E(u, 0.8, 1.6) : 1;
    grow(EX[3] + 34, 200, 470, 200, cv, ACC); vec(474, 140, 13, ACC, { seed: 9, op: cv }); mono(481, 270, 'hidden', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: cv }); mono(481, 290, '(1, B, 512)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: cv });
    if (k === 3) { note(30, 50, 'outputs 는 버리고 hidden 하나만 반환', fade(u, 1.8), { fill: BAD }); return; }
    // 디코더 판
    const dop = k === 4 ? E(u, 0.2, 0.8) : 1;
    el('rect', { x: 530, y: 70, width: 410, height: 250, rx: 14, fill: INFOBG, opacity: 0.5 * dop }); tx(544, 94, 'Decoder — 생성', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: dop });
    if (k === 4) { note(560, 380, '컨텍스트 벡터에서 출발해 한 토큰씩', fade(u, 1.2)); return; }
    const gen = k === 6 ? E(u, 0.3, 2.3) * 4 : k >= 7 ? 4 : 0;
    DX.forEach((x, i) => { const s = k === 5 ? pop(u, 0.2 + i * 0.1) : 1, on = i < gen;
      card(x, 200, 64, 46, { rx: 8, text: 'GRU', fs: 15, mono: true, stroke: on ? INFO : INK, color: on ? INFO : INK, s });
      card(x, 128, 70, 26, { rx: 5, text: 'fc_out', fs: 13.5, mono: true, stroke: INFO, color: INFO, s, op: k === 5 ? fade(u, 0.8) : 1 });
      grow(x, 177, x, 142, s, MUT, { plain: true });
      if (i) grow(DX[i - 1] + 34, 200, x - 34, 200, on || k >= 7 ? 1 : 0.0001, INFO);
      const inp = i === 0 ? '<SOS>' : TGT[i - 1]; if (k >= 6) { tx(x, 300, inp, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: on || k >= 7 ? 1 : 0.25 }); grow(x, 286, x, 225, 1, MUT, { plain: true }); }
      if (k >= 6 && (on || k >= 7)) tok(x, 50, TGT[i], INFO, { s: k === 6 ? pop(u, 0.3 + (i + 1) * 0.5) : 1 }); });
    grow(500, 200, DX[0] - 34, 200, 1, ACC);
    if (k === 5) { mono(560, 380, 'fc_out = Linear(512, vocab) → 로짓', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.2) }); return; }
    if (k === 6) { note(560, 380, '직전 토큰 + hidden → 로짓, 새 hidden', fade(u, 2.2)); return; }
    // k7: 다리는 벡터 하나
    el('rect', { x: 460, y: 132, width: 42, height: 136, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.3) });
    banner(480, 340, '두 RNN 을 잇는 통로 = 벡터 하나 (512차원)', pop(u, 0.9)); }

  // ---------- 3. 학습과 생성 ----------
  const DT = [130, 270, 410, 550, 690];
  function s3(t, c) { const { k, u } = c, b = c.beat, rows = (b.decodeTable && b.decodeTable.rows) || [], bias = b.biasBox;
    if (k === 0) { // 특수 토큰과 PAD
      const seq = ['<SOS>', 'I', 'am', 'a', 'student', '<EOS>', '<PAD>', '<PAD>'], ids = [1, 3, 4, 5, 6, 2, 0, 0];
      seq.forEach((w, i) => { const x = 80 + i * 105, s = pop(u, 0.2 + i * 0.1), pad = w === '<PAD>';
        card(x, 120, 92, 38, { rx: 7, text: w, fs: 14, mono: true, stroke: pad ? OFF : i === 0 || i === 5 ? WARN : INFO, color: pad ? MUT : i === 0 || i === 5 ? WARN : INFO, s, dash: pad ? '4 3' : null });
        mono(x, 166, String(ids[i]), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: s });
        if (pad && u > 1.4) cross(x, 210, 10, pop(u, 1.4 + (i - 6) * 0.2)); });
      mono(80, 280, 'CrossEntropyLoss(ignore_index=0)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
      note(80, 320, 'PAD(0) 자리는 손실에서 뺀다', fade(u, 1.7), { fill: BAD }); return; }
    if (k === 1) { // ratio 0.5 = 동전
      const a = E(u, 0.3, 1.3) * Math.PI;
      el('circle', { cx: 300, cy: 200, r: 80, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5 });
      el('path', { d: `M300,200 L300,120 A80,80 0 0 1 ${300 + 80 * Math.sin(a)},${200 - 80 * Math.cos(a)} Z`, fill: GOOD, opacity: 0.8 });
      mono(300, 316, 'teacher_forcing_ratio = 0.5', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      note(560, 170, '초록: 정답 토큰을 넣을 확률', fade(u, 1.5), { fill: GOOD }); note(560, 210, '파랑: 자기 출력을 넣을 확률', fade(u, 1.9), { fill: INFO }); return; }
    // 디코더 펼침 (k ≥ 2)
    const shown = k === 2 ? 1 : k === 3 ? Math.min(5, 1 + E(u, 0.2, 2.2) * 4) : 5;
    vec(28, 150, 9, ACC, { seed: 9 }); mono(35, 250, 'enc', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    rows.forEach((r, i) => { const x = DT[i]; if (i >= Math.ceil(shown)) return; const s = k === 2 || (k === 3 && i >= 1) ? pop(u, k === 2 ? 0.3 : 0.2 + i * 0.5) : 1;
      card(x, 190, 70, 46, { rx: 8, text: 'dec', fs: 15, mono: true, stroke: INFO, color: INFO, s });
      grow(i ? DT[i - 1] + 37 : 44, 190, x - 37, 190, s, i ? INFO : ACC);
      tok(x, 280, r.input, MUT, { s }); grow(x, 262, x, 214, s, MUT, { plain: true });
      if (k >= 3 || k === 2 && false) { tok(x, 100, r.output, INFO, { s }); grow(x, 166, x, 118, s, MUT, { plain: true });
        if (k === 3 || k === 5) mono(x, 60, 'CE', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: s }); } });
    mono(DT[0], 330, 't=1', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    if (k === 2) { note(560, 120, 'hidden = encoder(src)', fade(u, 0.6)); note(560, 156, '첫 입력은 <SOS>', fade(u, 1.2), { fill: WARN }); return; }
    if (k === 3) { // 손실 누적 막대
      const n = Math.ceil(shown); for (let i = 0; i < n; i++) el('rect', { x: 800, y: 300 - (i + 1) * 30, width: 60, height: 26, rx: 4, fill: BAD, opacity: 0.25 + 0.15 * i });
      mono(830, 330, 'loss +=', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); return; }
    if (k === 4) { // 분기
      card(200, 240, 64, 28, { rx: 6, text: 'tgt[1]', fs: 13.5, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.3) });
      grow(232, 248, DT[1] - 36, 272, E(u, 0.5, 0.9), GOOD);
      el('path', { d: `M${DT[0] + 30},100 C${DT[0] + 80},100 ${DT[1] - 80},300 ${DT[1] - 36},286`, fill: 'none', stroke: INFO, 'stroke-width': 2.6, 'stroke-dasharray': '6 4', opacity: fade(u, 1.0) });
      note(760, 70, 'random < 0.5 → 정답 tgt[t]', fade(u, 0.6), { fill: GOOD, 'font-size': 14.5 }); note(760, 100, '그 밖 → 자기 출력 argmax', fade(u, 1.2), { fill: INFO, 'font-size': 14.5 }); }
    if (k === 5) { el('rect', { x: 760, y: 120, width: 170, height: 60, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.2) });
      mono(845, 156, 'loss.backward()', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      grow(DT[4] + 40, 34, DT[0], 34, E(u, 0.6, 1.8), BAD, { dash: '6 4' });
      mono(845, 220, '÷ (6 − 1) = 토큰당 평균', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k >= 6) { // 추론: 출력 → 다음 입력 화살표
      if (k === 6) note(760, 120, '추론엔 tgt 가 없다', fade(u, 0.3), { fill: BAD });
      rows.forEach((r, i) => { if (i === rows.length - 1) return; const g = k === 7 ? E(u, 0.3 + i * 0.4, 0.7 + i * 0.4) : k > 7 ? 1 : 0;
        if (g > 0) el('path', { d: `M${DT[i] + 30},100 C${DT[i] + 70},100 ${DT[i + 1] - 70},280 ${DT[i + 1] - 32},280`, fill: 'none', stroke: WARN, 'stroke-width': 2.4, opacity: g }); });
      if (k === 7) { el('rect', { x: DT[4] - 46, y: 80, width: 92, height: 40, rx: 9, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 2.2) }); note(760, 120, '<EOS> 에서 스스로 멈춘다', fade(u, 2.3), { fill: WARN }); } }
    if (k === 8) { // ratio 슬라이더
      el('line', { x1: 760, y1: 140, x2: 920, y2: 140, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
      el('circle', { cx: 840, cy: 140, r: 10, fill: GOOD, opacity: fade(u, 0.3) });
      mono(760, 170, '0.0', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(840, 170, '0.5', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); mono(920, 170, '1.0', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      sub(840, 200, '1.0: 빠르나 편향 큼', fade(u, 0.8), { 'font-size': 14 }); sub(840, 222, '0.0: 불안정', fade(u, 1.2), { 'font-size': 14 }); }
    // 노출 편향 두 줄 (아래)
    if (bias && k >= 4) { const line = (arr, y, good) => arr.forEach((w, i) => { const x = 160 + i * 150, bad = /✗|💥|…/.test(w), col = bad ? BAD : good ? GOOD : INK; const ww = tw(w, 13.5) + 22;
        card(x, y, Math.max(70, ww), 30, { rx: 7, text: w, fs: 13.5, fw: 700, stroke: col, color: col }); if (i) grow(x - 150 + 40, y, x - Math.max(70, ww) / 2 - 4, y, 1, MUT); });
      tx(20, 356, '학습', { 'font-size': 14, 'font-weight': 800, fill: GOOD }); line(bias.good, 351, true);
      tx(20, 402, '추론', { 'font-size': 14, 'font-weight': 800, fill: BAD }); line(bias.bad, 397, false); } }

  // ---------- 4. 병목 ----------
  function s4(t, c) { const { k, u } = c, B = c.beat.bottleneck || { retention: [], bleu: [] }, PB = (c.prev && c.prev.bottleneck) || B;
    // 왼쪽: 40단어 문장 → 고정 벡터 (깔때기)
    const n = 40; for (let i = 0; i < n; i++) { const x = 30 + (i % 20) * 21, y = 36 + Math.floor(i / 20) * 22, s = k === 0 ? pop(u, 0.2 + i * 0.02, 0.3) : 1;
      el('rect', { x, y, width: 17, height: 17, rx: 3, fill: INFO, opacity: 0.6 * s }); }
    tx(30, 100, '40단어 문장', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    el('path', { d: 'M40,110 L440,110 L270,170 L270,200 L210,200 L210,170 Z', fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    const wide = k === 6 ? E(u, 0.5, 1.4) : 0;
    el('rect', { x: 210 - 15 * wide, y: 200, width: 60 + 30 * wide, height: 26, rx: 5, fill: ACC, opacity: 0.85 });
    mono(240, 218, wide > 0.5 ? '1024' : '512', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
    // 보존율 (예시)
    tx(30, 258, '벡터에 남은 정보 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    B.retention.forEach((r, i) => { const y = 272 + i * 34, old = PB.retention[i], v = old ? r.keep : r.keep * E(u, 0.3, 1.0), col = r.keep < 40 ? BAD : r.keep < 70 ? WARN : GOOD;
      tx(30, y + 14, r.pos, { 'font-size': 13.5, fill: INK }); hbar(160, y + 1, 200, v, 100, { col, text: r.keep + '%', h: 16 }); });
    // 오른쪽
    if (k === 0) { note(500, 80, '가설: 문장이 길수록', fade(u, 1.2)); note(500, 112, '앞부분이 사라지고 BLEU 가 급락한다', fade(u, 1.6), { fill: BAD }); return; }
    const BX = (i) => 540 + i * 72, keys = ['0', '10', '20', '30', '40', '50+'];
    if (k === 1) { card(720, 80, 280, 44, { rx: 10, text: 'evaluate_by_length()', fs: 15, mono: true, s: pop(u, 0.3) });
      note(560, 150, '입력: (src, tgt_tokens) 쌍', fade(u, 1.0)); note(560, 182, '출력: {길이 구간: BLEU}', fade(u, 1.5)); return; }
    // 버킷
    keys.forEach((kk, i) => { const s = k === 2 ? pop(u, 0.2 + i * 0.12) : 1;
      el('path', { d: `M${BX(i) - 26},70 V130 H${BX(i) + 26} V70`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: s }); mono(BX(i), 150, kk, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); });
    if (k === 2) { for (let j = 0; j < 12; j++) { const len = Math.floor(hsh(j) * 58), bi = Math.min(5, Math.floor(len / 10)), g = E(u, 0.8 + j * 0.1, 1.3 + j * 0.1);
        el('circle', { cx: lerp(500 + j * 34, BX(bi) - 12 + (j % 3) * 12, g), cy: lerp(40, 118 - (j % 2) * 14, g), r: 5, fill: INFO }); }
      mono(540, 190, 'key = min(len // 10 * 10, 50)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) }); return; }
    // 버킷마다 후보/참조
    keys.forEach((kk, i) => { [0, 1, 2].forEach((j) => { el('rect', { x: BX(i) - 20, y: 112 - j * 13, width: 18, height: 10, rx: 2, fill: INFO, opacity: 0.8 }); el('rect', { x: BX(i) + 2, y: 112 - j * 13, width: 18, height: 10, rx: 2, fill: GOOD, opacity: 0.8 }); }); });
    if (k === 3) { tx(540, 200, '■ pred (모델 번역)', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.5) }); tx(740, 200, '■ refs (정답)', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.9) });
      note(540, 240, 'greedy_decode → id → 단어', fade(u, 1.5)); return; }
    // BLEU 막대 (예시)
    tx(540, 200, 'BLEU × 100 (예시 값)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    B.bleu.forEach((r, i) => { const x = 560 + i * 76, old = PB.bleu[i], f = old ? 1 : E(u, 0.3 + i * 0.2, 0.9 + i * 0.2), h = (r.score / 30) * 150 * f, col = r.score >= 22 ? GOOD : r.score >= 14 ? WARN : BAD;
      el('rect', { x: x - 24, y: 380 - h, width: 48, height: h, rx: 4, fill: col, opacity: 0.85 }); if (f > 0.05) mono(x, 372 - h, String(r.score), { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle' });
      tx(x, 402, r.len, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    el('line', { x1: 526, y1: 380, x2: 940, y2: 380, stroke: MUT, 'stroke-width': 1.8 });
    if (k === 6) note(520, 34, '1024 로 넓혀도 목은 여전히 고정 크기', fade(u, 1.6), { fill: BAD }); }

  // ---------- 5. 어텐션 예고 ----------
  function s5(t, c) { const { k, u } = c, b = c.beat, A = b.attention || { src: [], weights: [] }, PA = (c.prev && c.prev.attention) || A, L = (b.legacyBox && b.legacyBox.rows) || [];
    const HX = [140, 280, 420], qx = 700, qy = 300;
    // 인코더 outputs (되살아남)
    A.src.forEach((w, i) => { const s = k === 0 ? pop(u, 0.6 + i * 0.25) : 1, wv = tween(PA.weights[i], A.weights[i], u), hot = k >= 3 && wv > 0.5;
      tok(HX[i], 70, w, ACC, { s, fill: hot ? ACCBG : PANEL });
      vec(HX[i] - 7, 100, 6, ACC, { seed: i, op: s });
      mono(HX[i], 175, 'h' + (i + 1), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: s });
      if (k >= 3) { const bw = 90 * wv; el('rect', { x: HX[i] - 45, y: 190, width: 90, height: 14, rx: 4, fill: SOFT }); el('rect', { x: HX[i] - 45, y: 190, width: bw, height: 14, rx: 4, fill: GOOD });
        mono(HX[i], 226, wv.toFixed(2), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? GOOD : INK }); } });
    if (k === 0) { tx(30, 30, 'seq2seq 가 버렸던 outputs', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) }); note(500, 110, '버리지 말고 매 스텝 전부 다시 보자', fade(u, 1.6), { fill: GOOD }); return; }
    // 디코더 쿼리
    const qs = k === 1 ? pop(u, 0.3) : 1;
    card(qx, qy, 150, 46, { rx: 10, text: `dec h → "${A.query}"`, fs: 15, stroke: INFO, color: INFO, fill: INFOBG, s: qs });
    if (k === 1) { note(520, 380, '디코더의 지금 관심사로 전 시점을 조회한다', fade(u, 1.2)); return; }
    // 점수 선 (bmm)
    A.src.forEach((w, i) => { const g = k === 2 ? E(u, 0.3 + i * 0.3, 0.9 + i * 0.3) : 1, wv = k >= 3 ? tween(PA.weights[i], A.weights[i], u) : 0.33;
      el('line', { x1: qx - 60, y1: qy - 23, x2: lerp(qx - 60, HX[i], g), y2: lerp(qy - 23, 160, g), stroke: GOOD, 'stroke-width': 1.5 + 9 * wv, opacity: 0.35 + 0.5 * wv }); });
    if (k === 2) { mono(520, 380, 'scores = bmm(enc_outputs, dec_h)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.4) }); return; }
    if (k === 3) { mono(520, 380, 'weights = softmax(scores)  합 = 1', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.4) }); tx(30, 260, '예시 값', { 'font-size': 13.5, fill: MUT }); return; }
    // 가중합 → 컨텍스트 (k ≥ 4)
    const cu = k === 4 ? E(u, 0.3, 1.5) : 1;
    for (let i = 0; i < 6; i++) { let v = 0; A.weights.forEach((wt, j) => { v += wt * (0.25 + 0.65 * hsh(i + j * 13)); }); el('rect', { x: 860, y: 230 + i * 12, width: 18, height: 9, rx: 2, fill: GOOD, opacity: v * cu }); }
    mono(869, 318, 'context', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: cu }); grow(qx + 76, qy - 10, 850, 270, cu, GOOD);
    if (k === 4) { note(520, 380, '이번 스텝 전용 컨텍스트 — 매 스텝 새로 만든다', fade(u, 1.6), { fill: GOOD }); return; }
    // 유산 (k ≥ 5)
    L.forEach((r, i) => { const y = 290 + i * 34, s = (k === 5 && i >= 3) || (k === 6 && i === 3) ? pop(u, 0.3) : k === 5 ? pop(u, 0.2 + i * 0.3) : 1, cut = /✂/.test(r.to);
      card(250, y, 440, 32, { rx: 8, text: r.item + (cut ? '  → 어텐션으로 대체' : '  → 계승'), fs: 14, stroke: cut ? BAD : GOOD, color: cut ? BAD : GOOD, fill: cut ? BADBG : GOODBG, s }); });
    if (k === 6) banner(720, 400, '다음 챕터: IV-1-1 어텐션', pop(u, 1.4)); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "번역을 고정 차원 분류기나 토큰 1:1 치환으로 풀 수 없는 이유는 무엇인가?",
      o: ["입력과 출력의 길이가 다르고 어순도 달라서", "어휘 사전이 너무 커서", "한국어 토큰은 임베딩할 수 없어서"], a: 0,
      why: "\"나는 학생 이다\"는 3토큰, \"I am a student\"는 4토큰이고 \"am\"은 두 번째에 온다. 1:1 치환은 \"I student am\"처럼 어순이 무너지고 \"a\"는 만들 수도 없다." },
    { q: "seq2seq에서 인코더와 디코더를 잇는 통로는 무엇인가?",
      o: ["인코더의 모든 시점 outputs", "두 RNN이 공유하는 가중치", "인코더의 마지막 hidden, 곧 컨텍스트 벡터 하나"], a: 2,
      why: "인코더는 outputs를 버리고 마지막 hidden(예: 512차원)만 돌려주며, 그것이 디코더의 첫 hidden이 된다. 두 RNN은 가중치도 공유하지 않는다." },
    { q: "teacher forcing으로 학습할 때 치르는 대가는 무엇인가?",
      o: ["학습이 오히려 느려진다", "노출 편향 — 추론 때 처음 마주한 자기 실수가 연쇄 붕괴로 번질 수 있다", "디코더가 <EOS>를 내지 못하게 된다"], a: 1,
      why: "학습 때는 정답을, 추론 때는 자기 출력을 입력으로 받아 입력 분포가 다르다. 그래서 실무에서는 비율을 0.5 정도로 섞어 완충한다." },
    { q: "문장 길이별 BLEU 측정에서 드러난 seq2seq의 병목은 무엇인가?",
      o: ["hid_dim을 1024로 키우면 길이 문제가 사라진다", "짧은 문장일수록 앞부분이 사라진다", "20단어를 넘으면 BLEU가 급락하고, 벡터를 키워도 완화될 뿐이다"], a: 2,
      why: "예시 값 27.8 → 26.5 → 22.1 → 15.4 → 8.9로 떨어진다. 컨텍스트가 고정 크기 벡터 하나라 길수록 앞부분이 희석되고, 차원을 늘려도 \"고정\"이라는 구조는 그대로다." },
    { q: "어텐션이 seq2seq에서 바꾼 단 하나는 무엇인가?",
      o: ["\"마지막 h 하나만 전달\"을 매 스텝 인코더 전 시점의 가중합으로 바꿨다", "인코더-디코더 2단 구조를 없앴다", "teacher forcing과 <SOS>/<EOS>를 없앴다"], a: 0,
      why: "디코더 h와 인코더 outputs의 내적을 softmax로 바꿔 가중합하면 매 스텝 전용 컨텍스트가 생긴다(\"am\"을 만들 땐 \"이다\"에 0.82). 나머지 골격은 그대로 계승됐다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '번역은 입력과 출력의 길이가 다르고 어순도 달라서 분류기나 1:1 치환으로 풀 수 없다.',
    '인코더 RNN이 문장을 컨텍스트 벡터 하나로 압축하고, 디코더 RNN이 거기서 한 토큰씩 만든다.',
    '학습 때 정답 토큰을 넣는 teacher forcing은 안정적이지만 추론 때 노출 편향이 생긴다.',
    '벡터 하나에 다 담으니 20단어를 넘으면 BLEU가 급락한다. 인코더 전 시점을 다시 보는 어텐션이 해법이다.',
  ];
  const review = [
    { q: 'seq2seq 번역기가 짧은 문장은 잘 옮기는데 긴 문장의 앞부분을 자주 빠뜨린다. 먼저 의심할 것은?',
      o: ['teacher forcing 비율이 너무 낮다', '문장 전체를 고정 크기 벡터 하나로 넘기고 있다', '인코더와 디코더가 가중치를 공유하지 않는다'], a: 1,
      why: 'RNN은 토큰을 읽을 때마다 h를 덮어써서, 마지막 h 하나에는 앞부분이 희석된다. 두 RNN이 가중치를 따로 쓰는 건 원래 설계다.' },
    { q: '학습 loss는 잘 내려갔는데, 실제 번역에서 단어 하나를 틀리면 뒤 문장이 줄줄이 무너진다. 맞는 진단은?',
      o: ['노출 편향이다. teacher forcing 비율을 0.5쯤으로 섞는다', '벡터가 작다. hid_dim을 키운다', '<EOS>가 빠졌다. 문장 끝 토큰을 넣는다'], a: 0,
      why: '정답만 보고 학습한 디코더는 추론 때 처음으로 자기 출력을 입력으로 받는다. 한 번의 오답이 다음 입력이 되어 연쇄로 번진다.' },
    { q: 'seq2seq의 요소 중 Transformer와 LLM으로 이어지지 않은 것은?',
      o: ['<SOS>/<EOS> 특수 토큰', 'auto-regressive 생성', '입력 전체를 마지막 h 하나로만 넘기는 방식'], a: 2,
      why: '인코더-디코더 구조, 특수 토큰, 한 토큰씩 생성하는 방식은 그대로 남았다. 바뀐 건 벡터 하나로 압축하던 부분을 매번 전체를 다시 보는 방식으로 고친 것이다.' },
  ];

  RA.page({ title: 'seq2seq 실험실 — 압축하고, 생성하고, 막힌다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
