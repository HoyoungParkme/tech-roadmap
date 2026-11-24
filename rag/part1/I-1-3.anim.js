/* I-1-3 RAG 파이프라인 전체 흐름 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 위쪽 띠(장면 1~3): 페이지 데이터 activated·spotlight 로 8 컴포넌트를 점등한다.
 * 그림: PDF 쪽수 → 500자 창이 50자씩 겹치며 미끄러지는 청크 → 1536차원 벡터 → FAISS,
 *       질문 벡터와 청크 벡터의 각도(코사인 0.94/0.82/0.76), prompt 슬롯, 오프라인·온라인 두 레인, 8 컴포넌트 지도.
 * 42페이지·128개 청크·점수·LLM 답변은 페이지의 예시 값이다. 청크 경계 0/450/900 은 크기 500·겹침 50 으로 계산한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cross, check, lock, dbIcon, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c) => (kk, a, d = 0.6) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a, a + d) : 0);
  function wrap(s, maxW, fs) { const out = []; let line = '';
    for (const w of String(s).split(' ')) { const t = line ? line + ' ' + w : w; if (tw(t, fs) > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out; }
  function paper(cx, cy, w, h, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.stroke || INK, f = 12;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - f} L${w / 2},${-h / 2 + f} V${h / 2} H${-w / 2} Z`, fill: PANEL, stroke: col, 'stroke-width': 2 }, g);
    for (let i = 0; i < 3; i++) el('line', { x1: -w / 2 + 9, y1: -h / 2 + 20 + i * 9, x2: w / 2 - 10 - (i % 2) * 10, y2: -h / 2 + 20 + i * 9, stroke: OFF, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); return g; }
  function chip(cx, cy, name, o) { o = o || {}; const w = o.w || 140, h = 50, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.stroke || INK;
    for (let i = 0; i < 3; i++) { const yy = -h / 2 + 12 + i * 13; el('line', { x1: -w / 2 - 7, y1: yy, x2: -w / 2, y2: yy, stroke: col, 'stroke-width': 2.5 }, g); el('line', { x1: w / 2, y1: yy, x2: w / 2 + 7, y2: yy, stroke: col, 'stroke-width': 2.5 }, g); }
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    tx(0, 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' }, g); return g; }
  // 벡터 칸: 값 배열 (… 포함)
  function vec(x, y, vals, col, f) { let xx = x; vals.forEach((v, i) => { const s = clamp(f * vals.length - i); if (s <= 0) return; const w = tw(v, 14) + 14;
      el('rect', { x: xx, y, width: w, height: 30, rx: 4, fill: v === '…' ? PANEL : col === INFO ? INFOBG : ACCBG, stroke: col, 'stroke-width': 1.5, opacity: s });
      mono(xx + w / 2, y + 20, v, { 'font-size': 14, 'text-anchor': 'middle', fill: col, opacity: s, 'font-weight': 700 }); xx += w + 4; }); }

  // ---------- 위쪽 8 컴포넌트 띠 ----------
  const COMP = [['load', 'Load'], ['split', 'Split'], ['embed', 'Embed'], ['store', 'Store'], ['qembed', 'QEmbed'], ['search', 'Search'], ['prompt', 'Prompt'], ['llm', 'LLM']];
  const PH = { load: 0, split: 0, embed: 0, store: 0, qembed: 1, search: 1, prompt: 2, llm: 2 };
  function band(c) { const b = c.beat, pv = c.prev, Y = 30;
    ['Indexing', 'Retrieval', 'Generation'].forEach((s, i) => { const xs = [[52, 462], [486, 698], [716, 910]][i], on = b.activePhase === s.toLowerCase();
      el('rect', { x: xs[0], y: Y - 22, width: xs[1] - xs[0], height: 44, rx: 10, fill: on ? ACCBG : SOFT, stroke: on ? ACC : 'none', 'stroke-width': 1.5 }); });
    COMP.forEach(([id, name], i) => { const x = 100 + i * 106 + (PH[id] === 1 ? 10 : PH[id] === 2 ? 20 : 0), L = b.activated.includes(id), nw = L && pv && !pv.activated.includes(id), sp = b.spotlight.includes(id);
      pill(x, Y, name, L ? ACC : MUT, nw ? R.pop(c.u, 0.3) : 1, { fs: 14, fill: L ? (sp ? ACC : PANEL) : PANEL, color: L ? (sp ? PANEL : ACC) : OFF }); });
    const n = b.activated.length, n0 = pv ? pv.activated.length : n; mono(948, 36, `${Math.round(tween(n0, n, c.u))}/8`, { 'font-size': 14, 'text-anchor': 'end', fill: MUT, 'font-weight': 700 }); }

  // =========================================================
  // 1. Indexing — 문서 → 청크 → 벡터 → 저장 (오프라인)
  // =========================================================
  function s1(t, c) { const { k, u } = c, p = at(c); band(c);
    if (k === 0) { const n = Math.round(42 * E(u, 0.3, 1.8));
      for (let i = 0; i < Math.min(n, 12); i++) paper(150 + i * 6, 210 - i * 5, 90, 116, {});
      mono(185, 320, `${n} 페이지`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      tx(185, 345, '인사규정.pdf (예시)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      grow(270, 200, 360, 200, E(u, 1.0, 1.4), ACC);
      el('rect', { x: 370, y: 150, width: 550, height: 100, rx: 10, fill: SOFT, stroke: GRID, opacity: fade(u, 1.3) });
      mono(386, 182, 'Document(', { 'font-size': 15, opacity: fade(u, 1.3) });
      mono(406, 208, 'page_content="제1조 목적...",', { 'font-size': 15, fill: ACC, opacity: fade(u, 1.5) });
      mono(406, 234, 'metadata={source: "인사규정.pdf", page: 1})', { 'font-size': 15, fill: INFO, opacity: fade(u, 1.8) });
      sub(645, 290, '어떤 형식이든 표준 Document 목록이 된다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { // 500자 창이 450자씩 미끄러진다
      const X = (ch) => 80 + ch * 0.55; el('rect', { x: X(0), y: 110, width: X(1500) - X(0), height: 34, rx: 4, fill: SOFT, stroke: GRID });
      for (let i = 0; i < 40; i++) el('line', { x1: X(i * 37 + 10), y1: 127, x2: X(i * 37 + 30), y2: 127, stroke: OFF, 'stroke-width': 3, 'stroke-linecap': 'round' });
      tx(X(0), 100, '본문 글자 (0 → 1,500자 구간)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      [[0, 500], [450, 950], [900, 1400]].forEach(([a, b], i) => { const f = E(u, 0.3 + i * 0.5, 0.8 + i * 0.5), y = 170 + i * 56, col = [ACC, INFO, WARN][i];
        if (f <= 0) return; el('rect', { x: X(a), y, width: (X(b) - X(a)) * f, height: 38, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 2.5 });
        if (f > 0.95) { mono(X(a) + 12, y + 25, `청크 ${i + 1}  [${a}, ${b})`, { 'font-size': 14.5, 'font-weight': 700, fill: col });
          if (i > 0) { el('rect', { x: X(a), y: y - 18, width: X(a + 50) - X(a), height: 56, fill: WARN, opacity: 0.25 }); } } });
      mono(X(450) + 14, 214, '← 50자 겹침', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      pill(850, 330, 'chunk_size=500', ACC, pop(u, 0.4), { mono: true, fs: 14 }); pill(850, 368, 'overlap=50', WARN, pop(u, 0.9), { mono: true, fs: 14 });
      mono(480, 375, `${Math.round(128 * E(u, 1.6, 2.4))}개 청크`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      sub(480, 402, '42페이지를 자른 결과(예시) — 겹침이 문장 잘림을 메운다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 2) { ['제1조 목적…', '제3조 연차…', '제4조 특별…'].forEach((s, i) => { const y = 120 + i * 80;
        card(150, y, 170, 44, { rx: 8, text: s, fs: 14.5, stroke: ACC, s: pop(u, 0.2 + i * 0.2) });
        grow(240, y, 320, y, E(u, 0.6 + i * 0.3, 1.0 + i * 0.3), MUT);
        vec(330, y - 15, ['0.023', '-0.156', '0.892', '…', '0.041'], ACC, E(u, 0.9 + i * 0.3, 1.6 + i * 0.3)); });
      pill(820, 140, '1536-dim', ACC, pop(u, 1.4), { mono: true, fs: 15 });
      sub(820, 172, 'text-embedding-3-small', fade(u, 1.5), { 'font-size': 13.5, class: 'mono' });
      mono(480, 370, '128 × 1536', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
      sub(480, 398, '값은 앞 몇 자리만 보인 예시 — 이제 의미로 비교할 수 있다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { for (let i = 0; i < 6; i++) { const f = E(u, 0.2 + i * 0.18, 0.8 + i * 0.18), y = lerp(100, 200, f);
        if (f < 1) el('rect', { x: 290 + (i % 3) * 30, y, width: 22, height: 30, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 }); }
      dbIcon(330, 250, 'FAISS index', { stroke: ACC });
      pill(330, 345, '+ metadata', INFO, pop(u, 1.2), { fs: 14 });
      grow(400, 250, 560, 250, E(u, 1.4, 1.9), MUT);
      const g = R.G(640, 250, pop(u, 1.8)); el('rect', { x: -60, y: -40, width: 120, height: 80, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }, g); el('circle', { cx: 0, cy: 0, r: 22, fill: SOFT, stroke: INK, 'stroke-width': 2 }, g); el('circle', { cx: 0, cy: 0, r: 5, fill: INK }, g);
      mono(640, 320, 'save_local("./index")', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(640, 345, '디스크에 영속화', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // k4: 오프라인 배치 — 질문이 와도 돌지 않는다
    clock(220, 220, 70, 0.75 * E(u, 0.2, 1.4), ACC); tx(220, 325, 'cron · 주기 배치', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    sub(220, 350, '문서·모델이 바뀔 때만 재실행', fade(u, 0.8), { 'font-size': 14 });
    card(640, 150, 300, 50, { rx: 25, text: '"연차 휴가가 며칠이야?"', fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.9) });
    grow(640, 178, 640, 270, E(u, 1.2, 1.7), BAD); cross(640, 230, 15, pop(u, 1.8));
    card(640, 300, 300, 50, { rx: 10, text: 'index.py 재실행', fs: 15, stroke: GRID, color: MUT, dash: '5 4', s: pop(u, 1.2) });
    sub(640, 352, '질문마다 돌리지 않는다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // =========================================================
  // 2. Retrieval — 질문 벡터와 가까운 청크 top-3
  // =========================================================
  const HITS = [[0.94, '제3조 연차 휴가: 1년 이상 근속 시 15일…'], [0.82, '제4조 특별 휴가: …'], [0.76, '부칙 2026 추가 규정…']];
  function s2(t, c) { const { k, u } = c, p = at(c); band(c);
    if (k <= 1) { dbIcon(200, 220, './index', { stroke: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
      grow(260, 220, 400, 220, k === 0 ? E(u, 0.6, 1.2) : 1, ACC); mono(330, 205, 'load_local', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC });
      pill(330, 250, 'read-only', MUT, k === 0 ? pop(u, 1.2) : 1, { fs: 13.5 });
      card(560, 220, 240, 90, { rx: 12, text: 'vectorstore\n128 벡터 + 메타데이터', fs: 15, stroke: ACC, s: k === 0 ? pop(u, 1.2) : 1 });
      if (k === 0) sub(480, 330, 'index.py 가 만든 것을 다시 읽기만 한다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      if (k === 1) { card(810, 220, 190, 90, { rx: 12, text: 'retriever\nk = 3', fs: 16, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.3) }); grow(682, 220, 712, 220, E(u, 0.2, 0.5), INFO);
        sub(560, 330, 'search_type="similarity" · 아직 질문은 없다', fade(u, 1.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700, class: 'mono' }); }
      return; }
    if (k === 2) { card(250, 140, 320, 50, { rx: 25, text: '"연차 휴가가 며칠이야?"', fs: 16, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      grow(250, 168, 250, 220, E(u, 0.6, 1.0), INFO);
      vec(80, 232, ['0.019', '-0.142', '0.901', '…', '0.038'], INFO, E(u, 0.9, 1.7));
      sub(250, 300, '같은 임베딩 모델로 질문도 1536차원 벡터', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      vec(560, 232, ['0.023', '-0.156', '0.892', '…', '0.041'], ACC, fade(u, 1.2));
      tx(560, 222, '청크 벡터 (제3조)', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(720, 300, '모양이 비슷하다 = 의미가 가깝다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { // 각도 = 점수
      const O = [80, 380], qa = 48 * Math.PI / 180, Lr = 250;
      el('line', { x1: O[0], y1: O[1], x2: O[0] + 330, y2: O[1], stroke: GRID, 'stroke-width': 1.5 }); el('line', { x1: O[0], y1: O[1], x2: O[0], y2: O[1] - 300, stroke: GRID, 'stroke-width': 1.5 });
      [12, 82, 26, 70].forEach((d, i) => { const a = d * Math.PI / 180; el('line', { x1: O[0], y1: O[1], x2: O[0] + Math.cos(a) * 190, y2: O[1] - Math.sin(a) * 190, stroke: OFF, 'stroke-width': 2, opacity: fade(u, 0.2) }); });
      const ray = (a, len, col, f, w) => el('line', { x1: O[0], y1: O[1], x2: O[0] + Math.cos(a) * len * f, y2: O[1] - Math.sin(a) * len * f, stroke: col, 'stroke-width': w || 3, 'stroke-linecap': 'round' });
      ray(qa, Lr + 20, INFO, E(u, 0.3, 0.8), 4); if (u > 0.8) tx(O[0] + Math.cos(qa) * (Lr + 28), O[1] - Math.sin(qa) * (Lr + 28), '질문', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      const side = [1, -1, 1];
      HITS.forEach(([sc], i) => { const a = qa + side[i] * Math.acos(sc), f = E(u, 0.7 + i * 0.3, 1.2 + i * 0.3); ray(a, Lr - 12 * i, ACC, f);
        if (f > 0.9) tx(O[0] + Math.cos(a) * (Lr - 12 * i + 12), O[1] - Math.sin(a) * (Lr - 12 * i + 12) + 5, `#${i + 1}`, { 'font-size': 15, 'font-weight': 800, fill: ACC }); });
      tx(470, 92, 'top-3 · cosine similarity (점수는 예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      HITS.forEach(([sc, s], i) => { const y = 110 + i * 84, o = fade(u, 0.9 + i * 0.3);
        el('rect', { x: 470, y, width: 450, height: 70, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 1.8, opacity: o });
        mono(486, y + 28, `#${i + 1}`, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: o }); tx(530, y + 28, s, { 'font-size': 14.5, 'font-weight': 700, opacity: o });
        el('rect', { x: 530, y: y + 44, width: 300, height: 12, rx: 6, fill: SOFT, opacity: o }); el('rect', { x: 530, y: y + 44, width: 300 * sc * E(u, 1.0 + i * 0.3, 1.8 + i * 0.3), height: 12, rx: 6, fill: ACC });
        mono(905, y + 55, sc.toFixed(2), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: o }); });
      sub(240, 412, '회색 = 나머지 청크, 각도가 좁을수록 점수가 높다', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    // k4: 응답 시간 — 두 조각
    tx(80, 120, '질문 1건의 Retrieval 시간 (길이는 어림)', { 'font-size': 15, 'font-weight': 800 });
    el('rect', { x: 80, y: 150, width: 520 * E(u, 0.3, 1.2), height: 44, rx: 6, fill: INFO, opacity: 0.85 });
    if (u > 1.2) tx(96, 178, '질문 임베딩 — API 왕복', { 'font-size': 15, 'font-weight': 700, fill: PANEL });
    el('rect', { x: 604, y: 150, width: 70 * E(u, 1.3, 1.7), height: 44, rx: 6, fill: ACC });
    if (u > 1.7) { tx(690, 168, 'ANN 검색', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(690, 190, '보통 수~수십 ms', { 'font-size': 14, fill: MUT }); }
    sub(480, 270, '사용자가 기다리는 시간에 바로 더해진다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    ['질문 임베딩 캐싱', '인덱스 압축'].forEach((s, i) => pill(380 + i * 200, 320, s, GOOD, pop(u, 2.1 + i * 0.2), { fs: 14.5, fill: GOODBG })); }

  // =========================================================
  // 3. Generation — 자료 슬롯에 끼워 LLM 이 답한다
  // =========================================================
  function s3(t, c) { const { k, u } = c, p = at(c); band(c);
    const rows = [['system', '아래 자료만 근거로 답하라. 자료 밖은 "모릅니다"', WARN], ['system', '[자료] {context}', ACC], ['human', '{question}', INFO]];
    const pX = 60, pY = 90;
    if (k <= 2) rows.forEach(([r, s, col], i) => { const y = pY + i * 56, f = k === 0 ? fade(u, 0.3 + i * 0.4) : 1;
      el('rect', { x: pX, y, width: 470, height: 44, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 1.8, opacity: f });
      mono(pX + 12, y + 28, r, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: f }); tx(pX + 90, y + 28, s, { 'font-size': 14.5, opacity: f }); });
    if (k === 0) { sub(295, 280, 'ChatPromptTemplate — 지시 + 자료 슬롯 + 질문 슬롯', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { chip(740, 160, 'gpt-4o-mini', { s: pop(u, 0.2) }); mono(740, 215, 'temperature=0', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT });
      for (let i = 0; i < 8; i++) el('circle', { cx: 640 + i * 28, cy: 280, r: 9, fill: i < 7 || u > 1.0 ? ACC : PANEL, stroke: ACC, 'stroke-width': 2 });
      sub(738, 315, '8번째 컴포넌트 — 부품이 모두 모였다', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const steps = [['retriever', INFO], ['format_docs', ACC], ['prompt', WARN], ['llm', ACC], ['parser', MUT]];
      steps.forEach(([s, col], i) => { const x = 110 + i * 185; card(x, 320, 150, 44, { rx: 22, text: s, mono: true, fs: 14.5, stroke: col, color: col, s: pop(u, 0.2 + i * 0.2) });
        if (i < 4) grow(x + 77, 320, x + 108, 320, E(u, 0.5 + i * 0.2, 0.8 + i * 0.2), MUT); });
      dot([[110, 320], [850, 320]], clamp((u - 1.3) / 1.2), ACC, 8);
      pill(740, 150, 'question: RunnablePassthrough()', INFO, pop(u, 1.0), { fs: 13.5, mono: true });
      sub(740, 200, '질문은 그대로, context 는 검색해서', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    if (k === 3) { // 근거 답변 — 자료 줄과 답의 연결
      el('rect', { x: 60, y: 90, width: 400, height: 150, rx: 10, fill: SOFT, stroke: ACC, 'stroke-width': 1.5 }); tx(76, 116, '[context]', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
      ['- 제3조: 1년 이상 근속 시 15일', '- 제4조: 특별 휴가', '- 부칙 2026'].forEach((s, i) => tx(76, 148 + i * 28, s, { 'font-size': 15, fill: i === 0 ? INK : MUT, 'font-weight': i === 0 ? 700 : 500 }));
      el('rect', { x: 520, y: 260, width: 400, height: 100, rx: 12, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.6) });
      const A = '"1년 이상 근속 시 기본 연차는 15일입니다."', typed = clamp((u - 0.6) / 1.0);
      tx(536, 296, A.slice(0, Math.round(A.length * typed)), { 'font-size': 15, 'font-weight': 700 });
      if (u > 1.6) tx(536, 330, '[출처] 인사규정 제3조', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      pill(860, 260, '답변 예시', WARN, fade(u, 0.6) > 0 ? 1 : 0, { fs: 13.5, fill: WARNBG });
      if (u > 1.7) el('path', { d: 'M330,150 C470,150 470,300 520,300', fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': `${E(u, 1.7, 2.3) * 400} 400` }); return; }
    [['"자료만 근거로" 시스템 메시지', '자료 밖은 "모릅니다"'], ['temperature=0', '무작위성을 줄인다'], ['출처(메타데이터) 표시 강제', '근거를 따라가 확인']].forEach(([a, b], i) => {
      const y = 120 + i * 90; check(110, y, 14, pop(u, 0.2 + i * 0.5)); tx(140, y + 6, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.5) }); tx(520, y + 6, b, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) }); });
    sub(480, 395, '이 셋이 환각을 누른다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 4. Offline vs Online — 두 레인, 시점이 다르다
  // =========================================================
  function s4(t, c) { const { k, u } = c, p = at(c), sp = c.beat.spotlight;
    const offOn = k === 1 || k === 0 || k >= 3, onOn = k >= 2 || k === 0;
    const lane = (y, name, col, on) => { el('rect', { x: 40, y, width: 880, height: 120, rx: 12, fill: on ? SOFT : PANEL, stroke: on ? col : GRID, 'stroke-width': 2 }); lbl(130, y + 26, name, 1, { fill: col }); };
    lane(70, 'OFFLINE · Indexing', ACC, offOn); lane(250, 'ONLINE · Retrieve+Gen', INFO, onOn);
    if (k === 0) { el('line', { x1: 40, y1: lerp(220, 220, 1), x2: lerp(40, 920, E(u, 0.3, 1.3)), y2: 220, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
      sub(480, 238, '분리선 — 비용·지연·장애를 섞지 않는다', fade(u, 1.4), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); }
    // 오프라인: 하루 단위 배치 블록
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    days.forEach((d, i) => { const x = 270 + i * 90; mono(x + 30, 178, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      if (i % 3 === 0) { const f = k === 1 ? E(u, 0.3 + i * 0.12, 0.8 + i * 0.12) : k > 1 ? 1 : 0.35; el('rect', { x: x + 6, y: 112, width: 48 * f, height: 40, rx: 6, fill: ACC, opacity: 0.85 }); if (f > 0.9) mono(x + 30, 138, 'job', { 'font-size': 13.5, 'text-anchor': 'middle', fill: PANEL, 'font-weight': 700 }); } });
    if (k === 1) sub(480, 208, '실패해도 신규 문서 반영이 늦어질 뿐', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    // 온라인: 질문마다 짧은 요청
    for (let i = 0; i < 18; i++) { const x = 270 + i * 34, f = k === 2 ? E(u, 0.2 + i * 0.07, 0.4 + i * 0.07) : k > 2 ? 1 : 0.3; el('rect', { x, y: 300, width: 24, height: 34 * f, rx: 4, fill: INFO, opacity: k >= 2 ? 0.85 : 0.3 }); }
    if (k === 2) { mono(480, 360, '질문 1건 = 실시간 (목표 < 1.5초)', { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, 'font-weight': 800, opacity: fade(u, 1.2) });
      sub(480, 412, '실패하면 사용자가 바로 본다 — 캐싱·폴백·모니터링', fade(u, 1.8), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); }
    if (k === 3) { dbIcon(240, 222, null, { stroke: ACC, s: pop(u, 0.2) }); lbl(350, 228, 'Vector Store', fade(u, 0.3), { fill: ACC });
      grow(210, 150, 210, 190, E(u, 0.6, 1.0), ACC); mono(218, 170, '쓰기', { 'font-size': 14, fill: ACC, 'font-weight': 800 });
      grow(270, 252, 290, 296, E(u, 1.1, 1.5), INFO); mono(300, 292, '읽기', { 'font-size': 14, fill: INFO, 'font-weight': 800 });
      sub(480, 412, '인덱싱은 쓰고 검색은 읽는다 — 스냅샷 버전으로 관리', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 4) { el('rect', { x: 90, y: 60, width: 780, height: 300, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      ['Indexing 잡은 별도 스케줄러로 도는가', '인덱스 버전(스냅샷)을 추적할 수 있는가', '임베딩 모델을 바꾸면 재인덱싱이 자동인가', '온라인 경로의 인덱스 쓰기는 막혀 있는가', '검색 지연·실패율을 따로 보는가'].forEach((s, i) => {
        const y = 100 + i * 54; el('rect', { x: 120, y: y - 16, width: 24, height: 24, rx: 4, fill: PANEL, stroke: MUT, 'stroke-width': 2 }); check(132, y - 4, 9, pop(u, 0.4 + i * 0.35)); tx(160, y + 2, s, { 'font-size': 15.5, opacity: fade(u, 0.2 + i * 0.35) }); }); } }

  // =========================================================
  // 5. 8 컴포넌트 지도 — 위 레인 한 번, 아래 레인 매번
  // =========================================================
  const IO = { load: ['파일/URL', 'Document'], split: ['Document', 'List[Chunk]'], embed: ['Chunk text', 'vector(1536)'], store: ['(vec, meta)', '영속 인덱스'],
    qembed: ['question', 'query vector'], search: ['query vector', 'top-k chunks'], prompt: ['ctx + question', 'full prompt'], llm: ['full prompt', 'answer + 출처'] };
  const NAME = { load: 'Document Load', split: 'Splitter', embed: 'Embedding', store: 'Vector Store', qembed: 'Query Embed', search: 'Similarity Search', prompt: 'Prompt Builder', llm: 'LLM' };
  function s5(t, c) { const { k, u } = c, sp = c.beat.spotlight;
    const rows = [['load', 'split', 'embed', 'store'], ['qembed', 'search', 'prompt', 'llm']];
    lbl(80, 66, 'OFFLINE', 1, { fill: ACC, 'text-anchor': 'start' }); lbl(80, 266, 'ONLINE', 1, { fill: INFO, 'text-anchor': 'start' });
    rows.forEach((row, r) => row.forEach((id, i) => { const x = 140 + i * 225, y = 120 + r * 200, on = sp.includes(id), col = r ? INFO : ACC;
      const nw = on && !(c.prev && c.prev.spotlight.includes(id)), s = nw ? 0.85 + 0.15 * pop(u, 0.2 + i * 0.15) : 1;
      card(x, y, 180, 52, { rx: 10, text: NAME[id], fs: 15, stroke: on ? col : GRID, color: on ? col : MUT, fill: on ? (r ? INFOBG : ACCBG) : PANEL, s, sw: on ? 2.5 : 1.5 });
      if (i < 3) grow(x + 92, y, x + 132, y, 1, on ? col : GRID);
      const io = (r === 0 && k >= 2) || (r === 1 && k >= 3), fi = (r === 0 && k === 2) || (r === 1 && k === 3) ? fade(u, 0.4 + i * 0.3) : 1;
      if (io) { mono(x, y + 46, IO[id][0], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fi }); mono(x, y + 66, '→ ' + IO[id][1], { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: fi }); } }));
    // 다리: Vector Store → Similarity Search (read-only)
    const br = k >= 1 ? (k === 1 ? E(u, 0.8, 1.5) : 1) : 0, bx = 140 + 3 * 225;
    if (br > 0) { el('path', { d: `M${bx},196 C${bx},240 ${140 + 225},210 ${140 + 225},294`, fill: 'none', stroke: k === 4 ? WARN : MUT, 'stroke-width': k === 4 ? 4 : 2.5, 'stroke-dasharray': `${br * 500} 500`, 'marker-end': br > 0.98 ? 'url(#ra-ah)' : null });
      mono(560, 228, 'read-only', { 'font-size': 14, fill: MUT, opacity: br }); }
    if (k === 4) { pill(560, 66, 'Indexing 은 한 번, Retrieval·Generation 은 매번', WARN, pop(u, 0.6), { fs: 15, fill: WARNBG });
      sub(860, 280, '두 흐름을 잇는 다리', fade(u, 1.2), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); } }

  const quiz = [
    { q: 'chunk_size=500, chunk_overlap=50으로 자르면 둘째 청크는 몇 번째 글자에서 시작하는가?',
      o: ['500번째', '450번째', '550번째'], a: 1,
      why: '창이 500자이고 앞 청크와 50자를 겹치므로 500 - 50 = 450에서 다시 시작한다. 겹친 부분이 문장 잘림을 메운다.' },
    { q: 'Retrieval 단계에서 질문을 벡터로 바꿀 때 지켜야 할 조건은 무엇인가?',
      o: ['인덱싱 때와 같은 임베딩 모델을 쓴다', '질문은 더 작은 차원으로 줄인다', '질문은 벡터로 바꾸지 않고 글자로 찾는다'], a: 0,
      why: '청크 벡터와 같은 공간에 있어야 코사인 점수를 비교할 수 있다. 그래서 같은 text-embedding-3-small로 질문도 벡터로 바꾼다.' },
    { q: 'Generation 단계에서 환각을 누르는 장치로 페이지가 든 세 가지가 아닌 것은?',
      o: ['"자료만 근거로" 시스템 메시지', 'temperature=0', '청크 크기를 1,500자로 키우기'], a: 2,
      why: '페이지는 자료만 근거로 답하라는 지시, temperature=0, 출처 표시 강제의 세 가지를 든다. 청크 크기는 인덱싱의 설정이다.' },
    { q: '인덱싱과 검색·생성을 다른 워크로드로 나누는 까닭은 무엇인가?',
      o: ['두 흐름이 같은 코드를 공유해서', '배치와 실시간이라 비용·지연·장애 영향이 달라서', '벡터 DB를 하나만 연결할 수 있어서'], a: 1,
      why: '인덱싱은 일·주 단위 배치라 실패해도 반영이 늦어질 뿐이다. 온라인 경로는 수백 ms 안에 끝나야 하고 실패가 사용자에게 바로 보인다.' },
    { q: '8 컴포넌트 지도에서 오프라인 레인과 온라인 레인을 잇는 것은 무엇인가?',
      o: ['Prompt Builder', 'LLM', 'Vector Store'], a: 2,
      why: '인덱싱은 Vector Store에 쓰고 검색은 Vector Store에서 읽는다. 그래서 온라인 경로에서는 읽기 전용으로 쓴다.' },
  ];

  const summary = [
    '문서를 500자 청크로 자르고 50자씩 겹쳐 문장 잘림을 메운다.',
    '청크와 질문을 같은 모델로 벡터로 바꿔 각도가 가까운 청크를 찾는다.',
    '찾은 청크를 prompt에 끼우고 자료만 근거로 답하게 해 환각을 누른다.',
    '인덱싱은 배치로 한 번, 검색과 생성은 질문마다 돈다.',
  ];
  const review = [
    { q: '새 규정 PDF를 올렸는데 챗봇 답이 그대로다. 먼저 확인할 것은?',
      o: ['LLM의 temperature 값', '인덱싱 배치가 돌아 새 청크가 Vector Store에 들어갔는지', '질문 문장의 길이'], a: 1,
      why: '인덱싱은 주기 배치라 돌기 전까지 새 문서는 검색되지 않는다. 오프라인 레인의 실패는 반영 지연으로 나타난다.' },
    { q: '임베딩 모델을 바꾼 뒤 검색 결과가 엉망이 됐다. 원인으로 가장 그럴듯한 것은?',
      o: ['기존 인덱스를 옛 모델 벡터로 둔 채 질문만 새 모델로 바꿨다', 'top-k를 3으로 둬서', 'prompt에 출처를 붙여서'], a: 0,
      why: '청크와 질문 벡터가 다른 공간에 있으면 각도 비교가 의미를 잃는다. 모델을 바꾸면 재인덱싱이 따라와야 한다.' },
    { q: '응답이 느리다는 불만이 많다. 사용자 대기 시간에 바로 영향을 주는 쪽은?',
      o: ['주간 인덱싱 배치가 도는 시간', '청크를 자르는 데 걸린 시간', '질문마다 도는 온라인 경로'], a: 2,
      why: '온라인 경로는 질문마다 실행되어 사용자가 그대로 기다린다. 오프라인 배치는 미리 끝나 있어 대기 시간에 들어가지 않는다.' },
  ];

  R.page({ title: 'RAG 파이프라인 — 색인 · 검색 · 생성', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
