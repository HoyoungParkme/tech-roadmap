/* II-1-1 LLM의 작동 원리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 토큰 ID 는 tiktoken o200k_base 로 직접 돌려 본 값(Hello 13225, ' world' 2375, '!' 0, ' How' 3253, EOS 199999, 사전 200,019개).
 * 임베딩 4차원 값·attention 점수·후보 확률은 페이지 데이터의 예시 값이고, temperature/top-p 막대는 그 확률로 계산한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, kvTable, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const show = (s) => String(s).replace(/^ /, '␣').replace(/\n/g, '\\n');
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const chip = (cx, cy, s, o) => { o = o || {}; const fs = o.fs || 15; return card(cx, cy, Math.max(o.w || 0, tw(s, fs) + 22), o.h || 34, { rx: 7, text: s, fs, mono: true, fw: 700, fill: o.fill || PANEL, stroke: o.stroke || INK, color: o.color || INK, s: o.s, op: o.op, sw: o.sw }); };

  // 위쪽 파이프라인 띠: 지금 단계만 진하게
  const STAGES = ['Tokenize', 'Embedding', 'Transformer', 'Generate'];
  function pipe(active) {
    STAGES.forEach((s, i) => { const cx = 170 + i * 205, on = i === active, past = i < active;
      card(cx, 26, 150, 30, { rx: 15, text: s, fs: 14, fw: 700, fill: on ? ACC : past ? ACCBG : PANEL, stroke: on || past ? ACC : GRID, color: on ? PANEL : past ? ACC : MUT, sw: 1.6 });
      if (i < 3) grow(cx + 80, 26, cx + 122, 26, 1, past || on ? ACC : GRID, { sw: 1.8 }); }); }

  // ---------- 1. Tokenization ----------
  const TEXT = 'Hello world';
  const DICT = [['0', "'!'"], ['198', "'\\n'"], ['2375', "' world'"], ['3253', "' How'"], ['13225', "'Hello'"], ['…', '…']];
  function s1(t, c) { const { k, u } = c;
    pipe(0);
    // 글자 칸 11개
    const x0 = 40, cw = 36, split = k === 3 ? E(u, 0.2, 1.0) : k > 3 ? 1 : 0;
    note(x0, 76, 'text = "Hello world"', k === 0 ? fade(u, 0.2) : 1, { class: 'mono', 'font-size': 15 });
    [...TEXT].forEach((ch, i) => { const s = k === 0 ? pop(u, 0.3 + i * 0.08, 0.4) : 1, dx = i >= 5 ? split * 18 : 0;
      card(x0 + i * cw + cw / 2 + dx, 112, cw - 4, 40, { rx: 5, text: ch === ' ' ? '␣' : ch, fs: 16, mono: true, fw: 700, s, stroke: ch === ' ' && k === 5 ? WARN : GRID, sw: ch === ' ' && k === 5 ? 3 : 1.5, color: ch === ' ' ? WARN : INK }); });
    if (k === 0) { chip(240, 210, 'token_ids = [ ]', { stroke: GRID, color: MUT, op: fade(u, 1.2) }); sub(240, 250, '아직 토큰 없음', fade(u, 1.5)); }
    // 사전
    if (k >= 1) { const rows = DICT.map(([id, pc]) => [id, pc, { hot: (k >= 3 && k <= 5) && (id === '13225' || id === '2375'), op: k === 1 ? clamp((u - 0.3) * 3 - 0) : 1 }]);
      rows.forEach((r, i) => { if (k === 1) r[2].op = clamp((u - 0.3 - i * 0.25) * 3); });
      kvTable(640, 58, 280, rows, { title: 'o200k_base 사전 (ID → 조각)', rh: 32, kw: 110 });
      mono(780, 300, '총 200,019개', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: k === 1 ? fade(u, 1.9) : 1 }); }
    if (k === 2) { card(240, 230, 120, 44, { rx: 8, text: 'LLM', fs: 16, s: pop(u, 0.3) });
      grow(240, 140, 240, 202, E(u, 0.6, 1.2), BAD); cross(240, 175, 11, pop(u, 1.3));
      note(320, 180, '문자열은 그대로 못 받는다', fade(u, 1.5), { fill: BAD }); return; }
    if (k < 3) return;
    // 토큰 두 개 + ID
    const sT = k === 3 ? pop(u, 0.9) : 1, sI = k === 3 ? fade(u, 1.5) : 1;
    chip(130, 200, 'Hello', { s: sT, fill: ACCBG, stroke: ACC, color: ACC, w: 120 });
    chip(345, 200, '␣world', { s: sT, fill: k === 5 ? WARNBG : ACCBG, stroke: k === 5 ? WARN : ACC, color: k === 5 ? WARN : ACC, w: 120 });
    mono(130, 248, '13225', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: sI });
    mono(345, 248, '2375', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: sI });
    mono(40, 300, 'token_ids = [13225, 2375]', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(u, 2.0) : 1 });
    if (k === 4) { // decode: ID → 사전 행
      const dl = E(u, 0.2, 1.0); el('path', { d: 'M130,262 Q420,300 650,232', fill: 'none', stroke: INFO, 'stroke-width': 1.8, pathLength: 100, 'stroke-dasharray': `${dl * 100} 100` });
      grow(380, 244, 650, 58 + 30 + 2 * 32 + 16, E(u, 0.6, 1.4), INFO, { sw: 1.8 });
      mono(40, 340, "decode([13225]) → 'Hello'", { 'font-size': 15, opacity: fade(u, 1.4) });
      mono(40, 370, "decode([2375])  → ' world'", { 'font-size': 15, opacity: fade(u, 1.8) }); return; }
    if (k === 5) { card(345, 352, 300, 64, { rx: 10, stroke: WARN, fill: WARNBG, sw: 2, s: pop(u, 0.4) });
      note(210, 346, "2375 = ' world' (앞 공백 포함)", fade(u, 0.7), { 'font-size': 15 });
      note(210, 372, '공백도 토큰 안에 들어간다', fade(u, 1.1), { fill: WARN, 'font-size': 14.5 }); return; }
    if (k === 6) { // 토큰 ≠ 단어
      const rowsK = [['unbelievable', ['un', 'bel', 'ievable']], ['안녕하세요', ['안', '녕하세요']]];
      rowsK.forEach(([w, ps], r) => { const y = 344 + r * 40, s0 = 0.3 + r * 0.7;
        note(40, y + 5, w, fade(u, s0), { class: 'mono', 'font-weight': 700 });
        let x = 190; ps.forEach((p, i) => { const wd = tw(p, 15) + 20; chip(x + wd / 2, y, p, { s: pop(u, s0 + 0.2 + i * 0.15), stroke: ACC, color: ACC, h: 30 }); x += wd + 6; });
        mono(x + 8, y + 5, ps.length + '토큰', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, s0 + 0.6) }); });
      card(780, 370, 260, 70, { rx: 10, stroke: GRID, s: pop(u, 1.8) });
      note(664, 364, '영어 1단어 ≈ 1.3토큰 (어림)', fade(u, 1.9), { 'font-size': 14 });
      note(664, 389, '한글 1글자 ≈ 0.94토큰 (실측)', fade(u, 2.1), { 'font-size': 14, fill: ACC }); } }

  // ---------- 2. Embedding ----------
  const VEC = { Hello: [0.21, -0.45, 0.83, 0.12], ' world': [0.67, 0.09, -0.31, 0.55] };
  function vecBars(cx, y, v, s, col) { v.forEach((x, i) => { const bx = cx + i * 52, h = Math.abs(x) * 70 * s;
      el('line', { x1: bx - 4, y1: y, x2: bx + 40, y2: y, stroke: GRID, 'stroke-width': 1.5 });
      el('rect', { x: bx, y: x >= 0 ? y - h : y, width: 36, height: Math.max(1, h), rx: 3, fill: x >= 0 ? col : WARN, opacity: 0.85 });
      mono(bx + 18, x >= 0 ? y + 18 : y - 8, x.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', opacity: s, 'font-weight': 700 }); }); }
  const MX = 330, MY = 92, MR = 11, MC = 14, CS = 16;   // 임베딩 표: 11줄 × 14칸 그림
  const ROWLAB = { 0: '0', 3: '2375', 6: '13225', 10: '199,999' };
  function table(k, u, hiRow) { const fill = k === 1 ? E(u, 0.2, 1.6) : 1;
    for (let r = 0; r < MR; r++) for (let q = 0; q < MC; q++) { const on = (r * MC + q) / (MR * MC) < fill, hot = r === hiRow;
      el('rect', { x: MX + q * CS, y: MY + r * 22, width: CS - 2, height: 20, rx: 2, fill: hot ? ACC : on ? INFO : SOFT, opacity: hot ? 0.9 : on ? 0.12 + 0.25 * (((r * 7 + q * 13) % 5) / 5) : 1 }); }
    Object.entries(ROWLAB).forEach(([r, s]) => mono(MX - 8, MY + r * 22 + 15, s, { 'font-size': 13.5, 'text-anchor': 'end', fill: +r === hiRow ? ACC : MUT, 'font-weight': 700 }));
    [1, 2, 4, 5, 7, 8, 9].forEach((r) => mono(MX - 8, MY + r * 22 + 15, '⋮', { 'font-size': 13.5, 'text-anchor': 'end', fill: OFF }));
    tx(MX + MC * CS / 2, MY - 12, '열 12,288개 (d_model)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 });
    mono(MX + MC * CS / 2, MY + MR * 22 + 20, 'nn.Embedding(200000, 12288)', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 }); }
  function s2(t, c) { const { k, u } = c;
    pipe(1);
    chip(110, 110, 'Hello', { fill: ACCBG, stroke: ACC, color: ACC, w: 120 }); mono(110, 150, '13225', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
    chip(110, 200, '␣world', { fill: ACCBG, stroke: ACC, color: ACC, w: 120 }); mono(110, 240, '2375', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
    if (k === 0) { mono(330, 100, 'import torch.nn as nn', { 'font-size': 15, opacity: fade(u, 0.3) });
      card(620, 230, 360, 120, { rx: 12, stroke: GRID, dash: '6 6', s: pop(u, 0.8) }); note(620, 236, '아직 벡터가 없다', fade(u, 1.2), { fill: MUT, 'text-anchor': 'middle' });
      note(40, 330, 'ID 13225에는 "인사말"이라는 뜻이 들어 있지 않다', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 5) { // 의미 공간 (개념 그림)
      const P = { king: [520, 130], queen: [700, 120], man: [540, 300], woman: [720, 290] };
      el('rect', { x: 430, y: 70, width: 360, height: 280, rx: 10, fill: SOFT, opacity: fade(u, 0.1) });
      Object.entries(P).forEach(([w, [x, y]], i) => { const s = pop(u, 0.2 + i * 0.15); el('circle', { cx: x, cy: y, r: 7 * s, fill: w === 'queen' ? ACC : INFO });
        const left = w === 'king' || w === 'man'; mono(left ? x - 12 : x + 12, y + 5, w, { 'font-size': 15, 'font-weight': 700, opacity: s, 'text-anchor': left ? 'end' : 'start' }); });
      grow(520, 136, 700 - 8, 128, E(u, 1.0, 2.0), ACC, { sw: 2.4 });
      note(450, 380, 'king − man + woman 에 가장 가까운 점 = queen', fade(u, 1.8), { 'font-size': 14.5 });
      sub(610, 404, '개념 그림 · 실제는 12,288차원', fade(u, 2.0));
      pill(110, 330, '+ 위치 임베딩 (자리 정보)', WARN, pop(u, 2.2), { fs: 13.5 }); return; }
    const hi = k === 3 ? 6 : k === 4 ? 3 : -1;
    table(k, u, hi);
    if (k === 1) { note(40, 320, '학습할 숫자', fade(u, 1.6), { fill: MUT }); mono(40, 348, '200,000 × 12,288', { 'font-size': 15, opacity: fade(u, 1.7) });
      mono(40, 376, '= 2,457,600,000개', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); }
    if (k >= 2) mono(40, 330, 'tensor([13225, 2375])', { 'font-size': 15, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.3) : 1 });
    if (k === 2) { grow(170, 150, MX - 50, MY + 6 * 22 + 10, E(u, 0.8, 1.6), ACC); grow(170, 240, MX - 50, MY + 3 * 22 + 10, E(u, 1.2, 2.0), ACC); }
    // 꺼낸 벡터
    const vx = 640;
    if (k >= 3) { const sH = k === 3 ? E(u, 0.6, 1.6) : 1;
      if (k === 3) fly(MX + MC * CS, MY + 6 * 22 + 10, vx + 60, 130, seg(u, 0.2, 0.9), '13225 행', { mono: true });
      tx(vx, 92, 'Hello →', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: sH }); vecBars(vx + 74, 150, VEC.Hello, sH, ACC); }
    if (k >= 4) { const sW = k === 4 ? E(u, 0.6, 1.6) : 1;
      if (k === 4) fly(MX + MC * CS, MY + 3 * 22 + 10, vx + 60, 270, seg(u, 0.2, 0.9), '2375 행', { mono: true });
      tx(vx, 232, '␣world →', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: sW }); vecBars(vx + 74, 290, VEC[' world'], sW, ACC);
      sub(800, 370, '12,288개 중 4개만 · 값은 예시', fade(u, k === 4 ? 1.8 : 0)); }
    if (k === 3) mono(40, 370, 'vectors.shape = (2, 12288)', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) }); }

  // ---------- 3. Self-Attention ----------
  const TOK3 = ['Hello', ' world', '!'];
  const HX = 610, HY = 120, HC = 78;
  function attnGrid(beat, u, k, newRow) { const A = beat.attention || [];
    TOK3.forEach((s, j) => tx(HX + j * HC + HC / 2, HY - 12, show(s), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', fill: INFO }));
    TOK3.forEach((s, i) => tx(HX - 10, HY + i * HC + HC / 2 + 5, show(s), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', class: 'mono', fill: ACC }));
    TOK3.forEach((a, i) => TOK3.forEach((b, j) => { const cell = A.find((x) => x.from === a && x.to === b), x = HX + j * HC, y = HY + i * HC;
      el('rect', { x, y, width: HC - 4, height: HC - 4, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': cell ? null : '4 4' });
      if (!cell) return; const s = i === newRow ? clamp((u - 0.4 - j * 0.3) * 3) : 1;
      el('rect', { x, y, width: HC - 4, height: HC - 4, rx: 6, fill: ACC, opacity: (0.1 + 0.85 * cell.score) * s });
      mono(x + (HC - 4) / 2, y + HC / 2 + 4, cell.score.toFixed(2), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: cell.score > 0.45 ? PANEL : INK, opacity: s }); }));
    tx(HX - 10, HY - 34, 'query ↓ · key →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    TOK3.forEach((a, i) => { const row = A.filter((x) => x.from === a); if (row.length < 3) return; const sum = row.reduce((p, x) => p + x.score, 0);
      mono(HX + 3 * HC + 6, HY + i * HC + HC / 2 + 5, '= ' + sum.toFixed(2), { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: i === newRow ? fade(u, 1.6) : 1 }); }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    pipe(2);
    if (k === 7) { // It → cat
      const W = ['The', 'cat', 'sat', 'on', 'the', 'mat', '.', 'It', 'was', 'tired'], xs = []; let x = 60;
      W.forEach((w, i) => { const wd = tw(w, 15) + 22; xs.push(x + wd / 2); chip(x + wd / 2, 200, w, { s: pop(u, 0.1 + i * 0.05), stroke: w === 'It' ? ACC : w === 'cat' ? GOOD : GRID, color: w === 'It' ? ACC : w === 'cat' ? GOOD : INK, h: 32 }); x += wd + 10; });
      const it = xs[7]; [1, 5, 0, 2].forEach((j, n) => { const w = n === 0 ? 6 : 1.6, sU = E(u, 0.8 + n * 0.15, 1.6 + n * 0.15);
        const mid = (it + xs[j]) / 2, hgt = 40 + Math.abs(it - xs[j]) * 0.14;
        const pth = el('path', { d: `M${it},183 Q${mid},${183 - hgt * 2} ${xs[j]},183`, fill: 'none', stroke: n === 0 ? GOOD : OFF, 'stroke-width': w, pathLength: 100, 'stroke-dasharray': `${sU * 100} 100` }); });
      note(it - 60, 250, '"It"이 가장 크게 보는 토큰 = cat', fade(u, 1.7), { fill: GOOD });
      [0, 1, 2, 3, 4].forEach((i) => el('rect', { x: 120 + i * 10, y: 300 - i * 10, width: 190, height: 70, rx: 8, fill: PANEL, stroke: INFO, 'stroke-width': 1.6, opacity: fade(u, 2.0 + i * 0.05) }));
      note(120, 400, 'head 8~96개', fade(u, 2.2), { fill: INFO, 'font-size': 15 });
      [0, 1, 2, 3].forEach((i) => el('rect', { x: 560, y: 380 - i * 26, width: 240, height: 22, rx: 5, fill: INFOBG, stroke: INFO, 'stroke-width': 1.4, opacity: fade(u, 2.1 + i * 0.08) }));
      note(820, 360, '블록 12층 이상', fade(u, 2.3), { fill: INFO }); return; }
    // 왼쪽: 토큰 벡터 x
    const nT = (b.tokens || []).length;
    TOK3.forEach((s, i) => { if (i >= nT) return; const sI = i === 2 && k === 2 ? pop(u, 0.3) : 1;
      chip(80, 120 + i * 62, show(s), { s: sI, stroke: ACC, color: ACC, fill: ACCBG, w: 100 });
      for (let q = 0; q < 6; q++) el('rect', { x: 140 + q * 12, y: 108 + i * 62, width: 10, height: 24, rx: 2, fill: ACC, opacity: (0.2 + ((i * 5 + q * 3) % 7) / 10) * sI }); });
    if (k <= 1 && nT === 2) chip(80, 244, '!', { stroke: GRID, color: OFF, w: 100, op: 0.6 });
    if (k >= 2) mono(40, 330, 'x : (3, d_model)', { 'font-size': 15, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.0) : 1 });
    if (k === 1 || k === 2) ['W_q', 'W_k', 'W_v'].forEach((w, i) => { const s = k === 1 ? pop(u, 0.4 + i * 0.3) : 1;
      card(330 + i * 80, 210, 62, 62, { rx: 6, text: w, fs: 15, mono: true, stroke: [ACC, INFO, GOOD][i], color: [ACC, INFO, GOOD][i], s }); });
    if (k === 1) note(300, 290, '학습되는 가중치 3개', fade(u, 1.5), { fill: MUT });
    // Q K V 열
    if (k >= 3) { const sQ = k === 3 ? E(u, 0.2, 1.4) : 1;
      [['Q', ACC, '찾는 것'], ['K', INFO, '가진 것'], ['V', GOOD, '전할 것']].forEach(([n, col, d], j) => { const x = 270 + j * 90;
        if (k === 3) grow(220, 182, x, 182, E(u, 0.1 + j * 0.2, 0.7 + j * 0.2), col, { sw: 1.6, plain: true });
        for (let i = 0; i < 3; i++) el('rect', { x: x - 16, y: 110 + i * 62, width: 32, height: 26, rx: 4, fill: col, opacity: 0.75 * sQ });
        tx(x, 96, n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: sQ });
        tx(x, 300, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: sQ }); }); }
    if (k === 0) { attnGrid(b, u, k, -1); note(HX, HY + 3 * HC + 30, '점수 칸이 아직 비어 있다', fade(u, 0.6), { fill: MUT }); return; }
    if (k < 4) { attnGrid(b, u, k, -1); return; }
    attnGrid(b, u, k, k - 4);
    if (k === 4) pill(HX + 117, 370, 'score = Q·Kᵀ / √d_k', ACC, pop(u, 0.2), { mono: true, fs: 14 });
    if (k === 5) pill(HX + 117, 370, 'softmax → 행 합 1.00', GOOD, pop(u, 0.2), { fs: 14 });
    if (k === 6) { mono(HX - 40, 376, 'out(!) = .20·V₁ + .55·V₂ + .25·V₃', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      [0.2, 0.55, 0.25].forEach((w, i) => dot([[450, 123 + i * 62], [HX - 20, HY + 2 * HC + 37]], seg(u, 0.3 + i * 0.2, 1.3 + i * 0.2), GOOD, 7)); }
    sub(HX + 117, 410, '점수는 예시 값', 1); }

  // ---------- 4. Generation ----------
  function seq(gen, k, u) { let x = 60;
    gen.forEach((s, i) => { const w = tw(show(s), 15) + 26, isNew = s === ' How' && k === 5; const op = isNew ? (seg(u, 1.6, 1.7) > 0 ? 1 : 0) : 1;
      chip(x + w / 2, 78, show(s), { stroke: isNew || (s === ' How' && k > 5) ? ACC : INK, fill: isNew ? ACCBG : PANEL, color: isNew ? ACC : INK, op, w: w - 4 }); x += w + 4; });
    el('rect', { x: x + 4, y: 64, width: 4, height: 28, fill: ACC, opacity: (Math.floor((u || 0) * 2.4) % 2) ? 0.2 : 1 }); }
  const LOOP = [[200, 170, 'forward'], [300, 270, '마지막 자리'], [200, 370, 'softmax'], [100, 270, '고르고 붙이기']];
  function ring(active, u0) { el('circle', { cx: 200, cy: 270, r: 100, fill: 'none', stroke: GRID, 'stroke-width': 2.5, pathLength: 100, 'stroke-dasharray': `${u0 * 100} 100`, transform: 'rotate(-90 200 270)' });
    LOOP.forEach(([x, y, s], i) => { const on = i === active, sc = u0 < 1 ? pop(u0 * 3, i * 0.5) : 1;
      card(x, y, tw(s, 14) + 24, 32, { rx: 16, text: s, fs: 14, fw: 700, fill: on ? ACC : PANEL, stroke: on ? ACC : GRID, color: on ? PANEL : INK, s: sc }); }); }
  function s4(t, c) { const { k, u } = c, b = c.beat;
    pipe(3);
    seq(b.generated || [], k, u);
    const act = [-1, -1, 0, 1, 2, 3, 3, -1][k];
    ring(act, k === 0 ? E(u, 0.2, 1.6) : 1);
    if (k === 0) { note(470, 200, '한 바퀴 = 토큰 1개', fade(u, 1.6), { 'font-size': 17, 'font-weight': 800 }); sub(560, 232, '바퀴를 돌 때마다 시퀀스가 한 칸 늘어난다', fade(u, 2.0)); return; }
    const X = 450;
    if (k === 1) { mono(X, 170, 'input_ids = [13225, 2375, 0]', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(X, 220, 'max_tokens = 50', { 'font-size': 16, opacity: fade(u, 0.9) });
      hbar(X, 250, 320, 0, 50, { text: '0 / 50', h: 16, u: 1 }); sub(X + 160, 300, '50바퀴가 상한', fade(u, 1.4)); return; }
    if (k === 2 || k === 3) { // logits 기둥 3개
      ['Hello', '␣world', '!'].forEach((s, j) => { const x = X + 40 + j * 130, last = j === 2, dim = k === 3 && !last;
        for (let r = 0; r < 12; r++) { const v = ((j * 17 + r * 11) % 9) / 9; el('rect', { x, y: 140 + r * 16, width: 20 + v * 50, height: 13, rx: 2, fill: last && k === 3 ? ACC : INFO, opacity: (dim ? 0.12 : 0.25 + v * 0.6) * (k === 2 ? clamp((u - 0.3 - j * 0.3) * 3) : 1) }); }
        mono(x + 30, 352, s, { 'font-size': 14.5, 'text-anchor': 'middle', fill: dim ? OFF : INK, 'font-weight': 700 }); });
      if (k === 2) mono(X, 120, 'logits : (1, 3, 200019)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.3) });
      if (k === 3) { mono(X, 120, 'logits[0, -1, :] → (200019,)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) }); sub(X + 200, 392, '앞 두 자리는 버린다', fade(u, 1.0)); }
      return; }
    if (k >= 4 && k <= 6) { const cand = b.candidates || [];
      cand.forEach((cd, i) => { const y = 130 + i * 44, s = k === 4 ? E(u, 0.2 + i * 0.15, 1.0 + i * 0.15) : 1, ch = cd.chosen;
        mono(X + 90, y + 14, show(cd.token), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ch ? ACC : INK });
        hbar(X + 104, y, 300, cd.prob * s, 0.5, { col: ch ? ACC : INFO, text: (cd.prob * 100).toFixed(0) + '%', h: 20 }); });
      if (k === 4) sub(X + 250, 370, '후보 5개 · 확률은 예시', fade(u, 1.6));
      if (k === 5) { pill(X + 250, 372, 'argmax → " How" (id 3253)', ACC, pop(u, 0.5), { fs: 14 }); fly(X + 120, 144, 330, 78, seg(u, 0.8, 1.6), '␣How', { mono: true }); }
      if (k === 6) { card(X + 70, 372, 140, 40, { rx: 8, text: '== EOS?', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.2) });
        note(X + 150, 378, '아니오 → append', fade(u, 0.8), { fill: GOOD });
        mono(40, 408, 'input_ids = [13225, 2375, 0, 3253]', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) }); }
      return; }
    // k7: 비용 ∝ 길이
    const ax = R.axes(X + 20, 120, 380, 200, { x: [0, 9], y: [0, 12], xt: [1, 4, 8], yt: [3, 6, 9, 12] });
    tx(X + 20, 104, 'forward 한 번에 넣는 토큰 수', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    tx(X + 400, 360, '생성한 토큰 n', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    for (let n = 1; n <= 8; n++) { const s = clamp((u - 0.2) * 4 - (n - 1) * 0.4); if (s <= 0) continue; const top = ax.Y((2 + n) * s);
      el('rect', { x: ax.X(n) - 14, y: top, width: 28, height: ax.Y(0) - top, rx: 3, fill: INFO, opacity: 0.8 }); }
    note(X + 20, 400, 'n개를 만들면 forward n번 · KV cache로 줄여도 길이에 비례', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 5. 추론 파라미터 ----------
  const CAND = [[' How', 0.45], [' What', 0.22], [' Welcome', 0.15], ['\\n', 0.10], [' Hi', 0.08]];
  const atT = (T) => { const q = CAND.map(([, p]) => Math.pow(p, 1 / T)), s = q.reduce((a, b) => a + b, 0); return q.map((x) => x / s); };
  function bars(x, y, w, ps, o) { o = o || {}; ps.forEach((p, i) => { const yy = y + i * (o.gap || 34), keep = o.keep == null || i < o.keep;
      mono(x + 88, yy + 15, show(CAND[i][0]), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: keep ? INK : OFF, 'text-decoration': keep ? null : 'line-through' });
      hbar(x + 98, yy, w, keep ? p : 0, o.max || 0.6, { col: !keep ? OFF : i === o.pick ? ACC : INFO, text: keep ? p.toFixed(o.dp ?? 2) : '—', h: 20 }); }); }
  function samples(b, k, u) { const S = (b.tempDemo && b.tempDemo.samples) || [];
    S.forEach((s, i) => { const y = 318 + i * 32, isNew = (k === 2 && s.temp === 0) || (k === 6 && s.temp === 1.5);
      const op = isNew ? fade(u, 1.6) : 1, col = s.temp === 0 ? INFO : s.temp === 0.7 ? WARN : BAD;
      mono(40, y, 'T=' + s.temp.toFixed(1), { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: op });
      tx(110, y, s.text, { 'font-size': 14.5, opacity: op, class: 'mono' }); });
    if (S.length) sub(880, 406, '출력 문장은 예시', 1); }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    pipe(4);
    samples(b, k, u);
    if (k === 0) { [['temperature', '분포 모양'], ['top_p', '후보 자르기'], ['max_tokens', '길이 상한']].forEach(([a, d], i) => { const cx = 200 + i * 280, s = pop(u, 0.3 + i * 0.35);
        el('circle', { cx, cy: 170, r: 52, fill: PANEL, stroke: ACC, 'stroke-width': 3 * s, opacity: s });
        el('line', { x1: cx, y1: 170, x2: cx + 36 * Math.cos(-2.2 + i * 0.9 + E(u, 0.5, 1.5)), y2: 170 + 36 * Math.sin(-2.2 + i * 0.9 + E(u, 0.5, 1.5)), stroke: ACC, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: s });
        mono(cx, 250, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); sub(cx, 274, d, s); }); return; }
    if (k === 1) { mono(40, 90, 'sample_next(logits, temperature=1.0, top_p=0.9)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      bars(300, 120, 330, CAND.map((x) => x[1]).map((p) => p * E(u, 0.5, 1.6)));
      sub(470, 300, 'T = 1.0 이면 원래 분포', fade(u, 1.8)); return; }
    if (k === 2) { // T 를 바꾸면
      [[0.5, 'T = 0.5 날카롭게'], [1.0, 'T = 1.0 그대로'], [1.5, 'T = 1.5 평평하게']].forEach(([T, name], j) => { const ps = atT(T), x0 = 70 + j * 300, s = E(u, 0.2 + j * 0.3, 1.2 + j * 0.3);
        tx(x0 + 110, 78, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: [INFO, INK, BAD][j] });
        ps.forEach((p, i) => { const h = p * 280 * s; el('rect', { x: x0 + i * 46, y: 280 - h, width: 36, height: h, rx: 3, fill: i === 0 ? ACC : INFO, opacity: 0.8 });
          mono(x0 + i * 46 + 18, 272 - h, p.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: s }); }); });
      return; }
    const p1 = CAND.map((x) => x[1]);
    if (k === 3) { bars(300, 90, 330, p1); mono(40, 110, 'probs = softmax(logits / T)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(560, 290, '합 = 1.00', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) }); return; }
    if (k === 4) { const cum = [0.45, 0.67, 0.82, 0.92, 1.0];
      bars(40, 90, 230, p1);
      cum.forEach((v, i) => { const s = clamp((u - 0.3) * 3 - i * 0.5); if (s <= 0) return; const x = 520 + i * 70, h = v * 190;
        el('rect', { x, y: 290 - h, width: 48, height: h, rx: 3, fill: v <= 0.9 ? GOOD : WARN, opacity: 0.75 * s });
        mono(x + 24, 290 - h + 20, v.toFixed(2), { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: PANEL, opacity: s }); });
      const yl = 290 - 0.9 * 190; el('line', { x1: 505, y1: yl, x2: 880, y2: yl, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) });
      mono(885, yl + 5, '0.9', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(520, 80, '누적 확률', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      mono(40, 290, 'cutoff = 3 + 1 = 4', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); return; }
    const keep = [0.489, 0.239, 0.163, 0.109, 0];
    if (k === 5) { bars(300, 90, 330, keep.map((v, i) => i < 4 ? tween(p1[i], v, u) : v), { keep: 4, dp: 3 });
      cross(560, 90 + 4 * 34 + 10, 9, pop(u, 0.3)); mono(40, 110, '÷ 0.92 (남은 합)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(40, 140, '→ 합 1.00', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); return; }
    if (k === 6) { // multinomial: 0~1 띠 위 예시 난수 0.62
      const x0 = 120, W = 700, y = 150; let acc = 0;
      keep.slice(0, 4).forEach((p, i) => { const x = x0 + acc * W; el('rect', { x, y, width: p * W - 3, height: 46, rx: 4, fill: i === 1 ? ACC : INFO, opacity: i === 1 ? 0.85 : 0.25 + 0.15 * i });
        mono(x + p * W / 2, y + 28, show(CAND[i][0]), { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: i === 1 ? PANEL : INK }); acc += p; });
      mono(x0, y + 72, '0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(x0 + W, y + 72, '1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      const r = 0.62, px = x0 + W * r * E(u, 0.3, 1.5); el('path', { d: `M${px},${y - 4} l-9,-16 h18 z`, fill: BAD });
      mono(px, y - 26, 'r = ' + (r * E(u, 0.3, 1.5)).toFixed(2), { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      note(x0, 262, '예시 난수 0.62 → " What" · 다시 뽑으면 다른 답이 나올 수 있다', fade(u, 1.7), { 'font-size': 14.5 }); return; }
    // k7: API 요청 JSON
    const L = ['{', '  "model": "gpt-4o",', '  "messages": [ … ],', '  "temperature": 0.7,', '  "top_p": 0.9,', '  "max_tokens": 500', '}'];
    el('rect', { x: 230, y: 64, width: 500, height: 232, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    L.forEach((s, i) => mono(260, 92 + i * 30, s, { 'font-size': 15.5, fill: /temperature|top_p|max_tokens/.test(s) ? ACC : INK, 'font-weight': /max_tokens/.test(s) ? 800 : 500, opacity: fade(u, 0.2 + i * 0.2, 0.3) }));
    pill(830, 250, '비용 상한', BAD, pop(u, 1.8), { fs: 14 }); }

  const quiz = [
    { q: '"Hello world"를 o200k_base로 encode하면 무엇이 나오나?',
      o: ['글자 11개에 대응하는 정수 11개', '[13225, 2375] 정수 두 개', '단어 사전의 뜻풀이 두 줄'], a: 1,
      why: '사전에 있는 조각 단위로 자르므로 "Hello"와 " world" 두 토큰이 된다. 2375는 앞 공백까지 포함한 조각이다.' },
    { q: 'nn.Embedding(200000, 12288)이 하는 일은 무엇인가?',
      o: ['토큰 ID로 표의 한 행을 꺼내 12,288개 실수 벡터를 돌려준다', 'ID를 12,288으로 나눈 몫을 돌려준다', '문장 전체를 하나의 숫자로 압축한다'], a: 0,
      why: '임베딩은 200,000행짜리 표에서 ID번째 행을 꺼내는 lookup이다. 이 표 자체가 학습으로 채워진다.' },
    { q: 'softmax를 거친 attention 가중치의 한 행이 뜻하는 것은 무엇인가?',
      o: ['토큰 하나가 각 토큰을 얼마나 볼지의 비율, 합이 1.0', '토큰의 등장 횟수', '다음에 올 토큰의 확률'], a: 0,
      why: '행 i는 i번째 토큰이 다른 토큰들에 나눠 준 주목도다. 예시에서 Hello 행은 0.62, 0.31, 0.07로 합이 1.00이다.' },
    { q: '토큰 10개를 생성하면 forward는 몇 번 도나?',
      o: ['1번, 한꺼번에 만든다', '10번, 한 바퀴에 한 토큰씩', '100번, 토큰 쌍마다 한 번'], a: 1,
      why: '자기회귀 생성은 한 바퀴에 다음 토큰 하나만 고르고 입력 끝에 붙인다. 그래서 비용이 출력 길이에 비례한다.' },
    { q: '확률 0.45, 0.22, 0.15, 0.10, 0.08에 top_p=0.9를 걸면 몇 개가 남나?',
      o: ['3개', '5개', '4개'], a: 2,
      why: '누적이 0.45, 0.67, 0.82까지 0.9 이하라 3개이고 코드가 1을 더해 4개를 남긴다. 0.08짜리 " Hi"만 빠진다.' },
  ];

  const summary = [
    'LLM은 글자를 직접 읽지 못하고 tokenizer가 만든 정수 ID 줄을 받는다.',
    '임베딩 표에서 ID번째 행을 꺼내면 토큰마다 긴 실수 벡터가 된다.',
    'Self-attention은 토큰마다 다른 토큰을 얼마나 볼지 합 1.0의 가중치로 정하고 V를 섞는다.',
    '생성은 다음 토큰 하나를 골라 붙이는 반복이고, temperature와 top_p가 고르는 방식을 바꾼다.',
  ];
  const review = [
    { q: '같은 질문에 매번 똑같은 답만 나와 다양한 문장이 필요하다. 먼저 바꿔 볼 것은?',
      o: ['max_tokens를 줄인다', 'temperature를 0보다 크게 두고 sampling한다', 'tokenizer를 바꾼다'], a: 1,
      why: 'temperature 0은 argmax와 같아 늘 최댓값 토큰만 고른다. 0보다 크면 확률에 비례해 뽑아 답이 달라질 수 있다.' },
    { q: '한글 문서를 넣었더니 토큰 수가 영어 문서보다 많이 나왔다. 가장 알맞은 설명은?',
      o: ['한글은 tokenizer 사전 조각이 영어보다 잘게 잘려 같은 뜻에 토큰이 더 든다', '한글은 임베딩 차원이 더 크다', 'attention이 한글에서만 두 번 돈다'], a: 0,
      why: '토큰 수는 tokenizer가 자른 조각 수다. o200k 기준 한글은 글자당 약 1토큰이라 같은 뜻의 영어보다 조각이 많다.' },
    { q: '응답을 길게 받으니 지연이 크게 늘었다. 파이프라인에서 원인이 되는 곳은?',
      o: ['Tokenize 단계가 느려서', '임베딩 표가 커서', '출력 토큰마다 forward를 한 번씩 더 돌아서'], a: 2,
      why: '생성 루프는 토큰 하나에 forward 한 번이다. max_tokens로 길이를 묶으면 지연과 비용 상한도 같이 묶인다.' },
  ];

  R.page({ title: 'LLM 파이프라인 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
