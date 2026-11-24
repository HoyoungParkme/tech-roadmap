/* I-2-1 Naive vs Advanced vs Modular RAG — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 위쪽: 세 세대 탭(accent: on/past/lock/pick)과 그 세대의 모듈 줄(activeKeys 점등) — 페이지 데이터 그대로.
 * 그림: 노이즈 청크가 답에 섞이는 Naive, HyDE 로 질문이 불어나고 10개 후보가 재순위로 3개만 남는 Advanced,
 *       두 소스 순위를 RRF 로 합치는 Modular(점수는 페이지 rrf 코드를 k=60, 순위 1부터로 직접 계산한 값), 비교표, 결정 나무.
 * 정확도·지연·비용 수치는 페이지의 예시 값이다. HyDE 가상 답변·후보 문서 목록·LLM 답변도 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cross, check, lock, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c) => (kk, a, d = 0.6) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a, a + d) : 0);
  function wrap(s, maxW, fs) { const out = []; let line = '';
    for (const w of String(s).split(' ')) { const t = line ? line + ' ' + w : w; if (tw(t, fs) > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out; }
  function box(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14.5, h = lines.length * (fs + 7) + 18, op = o.op ?? 1; if (op <= 0.01) return h;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 1.8, opacity: op });
    lines.forEach((l, i) => { const [s, col, fw] = Array.isArray(l) ? l : [l]; tx(x + 12, y + 12 + fs * 0.85 + i * (fs + 7), s, { 'font-size': fs, fill: col || INK, 'font-weight': fw || 500, opacity: op }); });
    if (o.tag) pill(x + w - tw(o.tag, 13.5) / 2 - 22, y, o.tag, WARN, 1, { fs: 13.5, fill: WARNBG, op });
    return h; }

  // ---------- 위쪽: 세대 탭 + 모듈 줄 ----------
  const MODE = { naive: ['Naive', ['q', '질문'], ['rt', 'Retrieve'], ['gen', 'Generate'], ['ans', '답변']],
    advanced: ['Advanced', ['q', '질문'], ['pre', 'Pre-Retrieval'], ['rt', 'Retrieve'], ['post', 'Post-Retrieval'], ['gen', 'Generate'], ['ans', '답변']],
    modular: ['Modular', ['router', 'Router'], ['rt_v', 'Vector'], ['rt_w', 'Web'], ['mem', 'Memory'], ['fusion', 'Fusion·Eval'], ['gen', 'Generate']] };
  function tabs(c) { const a = c.beat.accent;
    ['naive', 'advanced', 'modular'].forEach((m, i) => { const st = a[m], x = 170 + i * 310, col = st === 'on' ? ACC : st === 'past' ? GOOD : st === 'pick' ? WARN : MUT;
      pill(x, 24, (st === 'past' ? '✓ ' : '') + MODE[m][0] + ' RAG', col, 1, { fs: 14.5, fill: st === 'on' ? ACCBG : st === 'pick' ? WARNBG : PANEL, color: st === 'lock' ? OFF : col });
      if (st === 'lock') lock(x + 78, 24, true, OFF, 0.7); }); }
  function mods(c) { const m = c.beat.activeMode, list = MODE[m].slice(1), keys = c.beat.activeKeys, pk = c.prev ? c.prev.activeKeys : keys, n = list.length;
    list.forEach(([key, name], i) => { const x = 70 + i * (820 / (n - 1)), on = keys.includes(key), nw = on && !pk.includes(key);
      if (i < n - 1) el('line', { x1: x + 52, y1: 70, x2: x + 820 / (n - 1) - 52, y2: 70, stroke: on && keys.includes(list[i + 1][0]) ? ACC : GRID, 'stroke-width': 2 });
      pill(x, 70, name, on ? ACC : MUT, nw ? 0.7 + 0.3 * pop(c.u, 0.3) : 1, { fs: 13.5, fill: on ? ACCBG : PANEL, color: on ? ACC : OFF }); }); }
  function accBar(x, y, w, v0, v1, u, label, col) { const v = tween(v0, v1, u);
    tx(x, y - 8, label, { 'font-size': 14, 'font-weight': 700, fill: MUT }); el('rect', { x, y, width: w, height: 20, rx: 10, fill: SOFT }); el('rect', { x, y, width: w * v / 100, height: 20, rx: 10, fill: col || ACC });
    mono(x + w + 10, y + 16, `${Math.round(v)}%`, { 'font-size': 18, 'font-weight': 800, fill: col || ACC }); }

  // =========================================================
  // 1. Naive — 그대로 검색, 그대로 이어 붙이기
  // =========================================================
  const D1 = '파이썬 비동기는 async/await로...', D2 = '파이썬 설치는 brew로...', Q = '파이썬 비동기 어떻게 써?';
  function s1(t, c) { const { k, u } = c, p = at(c); tabs(c); mods(c);
    // 문서 두 장 → FAISS
    [[D1, GOOD], [D2, BAD]].forEach(([d, col], i) => { const y = 130 + i * 56; box(40, y, 300, [d], { stroke: k >= 3 && i === 1 ? BAD : GRID, op: k === 0 ? fade(u, 0.2 + i * 0.3) : 1 }); });
    R.dbIcon(420, 170, null, { stroke: ACC, s: k === 0 ? pop(u, 1.0) : 1 }); mono(420, 240, 'vs (FAISS)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC });
    if (k === 0) { grow(345, 150, 370, 165, E(u, 0.8, 1.1), MUT); grow(345, 205, 370, 180, E(u, 0.9, 1.2), MUT); sub(240, 300, '문서를 통째로 임베딩 — 아직 질문은 없다', fade(u, 1.5), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k >= 1) { card(720, 140, 300, 44, { rx: 22, text: Q, fs: 15, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 0.2) : 1 });
      grow(570, 140, 475, 160, p(1, 0.5), INFO); mono(640, 190, 'similarity_search(k=3)', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, opacity: p(1, 0.8) }); }
    if (k === 1) { [D1, D2].forEach((d, i) => fly(420, 200, 640, 250 + i * 40, E(u, 1.2 + i * 0.3, 2.0 + i * 0.3), d.slice(0, 12) + '…', { fill: i ? BAD : GOOD, stay: true }));
      sub(640, 350, '문서가 2개뿐이라 k=3 이면 둘 다 딸려 온다', fade(u, 2.2), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); }
    if (k >= 2) { const f = k === 2 ? E(u, 0.3, 1.4) : 1;
      el('rect', { x: 520, y: 220, width: 400, height: 150, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      mono(536, 246, 'context:', { 'font-size': 14.5, fill: MUT });
      if (f > 0.2) tx(546, 272, D1, { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(f, 0.2, 0.3) });
      if (f > 0.6) tx(546, 298, D2, { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(f, 0.6, 0.3) });
      mono(536, 330, `question: ${Q}`, { 'font-size': 14, fill: INFO, opacity: fade(f, 0.9, 0.1) });
      if (k === 2) sub(720, 395, '정제 없이 그대로 concat → LLM', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { box(40, 290, 440, ['"비동기는 brew install 로 설치한 뒤…"'], { stroke: BAD, fill: BADBG, op: fade(u, 0.6), tag: '답변 예시', fs: 15 });
      el('path', { d: 'M520,298 C490,300 480,310 470,315', fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': `${E(u, 1.0, 1.6) * 100} 100` });
      sub(260, 380, '노이즈 청크가 답변을 오염시킨다', fade(u, 1.6), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
    if (k === 4) { accBar(60, 330, 300, 0, 62, u - 0.2, '정확도 (예시)', BAD);
      pill(160, 290, '~30줄 · 1일 PoC', GOOD, pop(u, 1.4), { fs: 14.5, fill: GOODBG }); sub(240, 390, '한계는 검색 hit-rate', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }

  // =========================================================
  // 2. Advanced — 질문을 불리고(HyDE), 넓게 뽑고, 재순위로 거른다
  // =========================================================
  const CAND = ['async/await 기초', 'brew 설치', 'asyncio.gather 예제', 'pip 업그레이드', '이벤트 루프 설명', 'venv 만들기', '스레드 vs 코루틴', 'PATH 설정', '파이썬 버전 확인', 'IDE 추천'];
  const RERANK = [0, 2, 4, 6, 1, 3, 5, 7, 8, 9];   // 재순위 뒤 순서 (예시) — 앞 셋만 남긴다
  function s2(t, c) { const { k, u } = c, p = at(c); tabs(c); mods(c);
    if (k === 0) { [['llm', 'gpt-4o-mini', INK], ['reranker', 'rerank-v3.5 · top_n=3', ACC], ['vs', 'FAISS', INFO]].forEach(([a, b, col], i) => {
        card(170 + i * 310, 200, 260, 74, { rx: 12, text: `${a}\n${b}`, fs: 15, mono: true, stroke: col, color: col, fill: i === 1 ? ACCBG : PANEL, s: pop(u, 0.2 + i * 0.4) }); });
      sub(480, 290, 'reranker 가 Advanced 의 핵심 부품', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { card(180, 160, 300, 44, { rx: 22, text: Q, fs: 15, stroke: INFO, color: INFO });
      grow(335, 160, 430, 160, E(u, 0.3, 0.7), WARN); pill(380, 132, 'HyDE', WARN, pop(u, 0.3), { fs: 14, fill: WARNBG });
      const hyde = 'asyncio 에서는 async def 로 코루틴을 만들고 await 로 결과를 기다린다. 여러 작업은 asyncio.gather 로 동시에 돌리고 asyncio.run 으로 이벤트 루프를 시작한다.';
      const ln = wrap(hyde, 440, 14.5), shown = clamp((u - 0.6) / 1.4) * ln.length;
      el('rect', { x: 450, y: 120, width: 470, height: 30 + ln.length * 22, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 1.8, opacity: fade(u, 0.5) });
      ln.forEach((s, i) => { if (shown > i) tx(464, 146 + i * 22, s, { 'font-size': 14.5, opacity: clamp(shown - i) }); });
      pill(860, 120, '가상 답변 예시', WARN, fade(u, 0.5) > 0 ? 1 : 0, { fs: 13.5, fill: PANEL });
      sub(480, 330, '짧은 질문 → 한 문단의 검색 재료', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // 후보 10개 목록 (k2: 1차 검색 순서, k3: 재순위로 자리 이동)
    if (k >= 2 && k <= 3) { const mv = k === 3 ? E(u, 0.4, 1.6) : 0;
      tx(70, 112, k === 2 ? 'similarity_search(expanded, k=10) — 1차 순서' : 'reranker.compress_documents — 다시 채점한 순서', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      CAND.forEach((s, i) => { const to = RERANK.indexOf(i), r = lerp(i, to, mv), y = 126 + r * 28, keep = to < 3, s0 = k === 2 ? fade(u, 0.2 + i * 0.12) : 1, gone = k === 3 && !keep ? E(u, 1.8, 2.4) : 0;
        const col = k === 3 && keep && mv > 0.9 ? GOOD : INK;
        el('rect', { x: 70, y, width: 380, height: 24, rx: 5, fill: k === 3 && keep && mv > 0.9 ? GOODBG : PANEL, stroke: col === GOOD ? GOOD : GRID, opacity: s0 * (1 - 0.75 * gone) });
        mono(84, y + 17, `${i + 1}`.padStart(2), { 'font-size': 13.5, fill: MUT, opacity: s0 * (1 - 0.75 * gone) }); tx(114, y + 17, s, { 'font-size': 14, fill: col, opacity: s0 * (1 - 0.75 * gone), 'font-weight': col === GOOD ? 700 : 500 }); });
      if (k === 2) sub(700, 260, '일단 많이 회수하고 뒤에서 거른다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 3) { pill(700, 180, 'cross-encoder 재채점', ACC, pop(u, 0.3), { fs: 14.5, fill: ACCBG }); mono(700, 240, `10 → ${u > 1.8 ? 3 : 10}`, { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
        sub(700, 290, '노이즈 7개가 빠진다 (순서는 예시)', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k === 4) { [0, 2, 4].forEach((ci, i) => box(70, 120 + i * 50, 300, [CAND[ci]], { stroke: GOOD, fill: GOODBG, op: fade(u, 0.2 + i * 0.2) }));
      grow(380, 190, 520, 190, E(u, 0.8, 1.3), GOOD); card(640, 190, 220, 60, { rx: 12, text: 'prompt → LLM', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.2) });
      sub(480, 320, '깨끗한 context 만 prompt 에 — 6모듈 완성', fade(u, 1.7), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    accBar(80, 150, 360, 62, 83, u - 0.2, '정확도 (예시)', GOOD);
    tx(80, 222, 'p95 지연 (예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT }); const L = tween(0.8, 1.6, u - 0.4);
    el('rect', { x: 80, y: 232, width: 180 * L, height: 20, rx: 10, fill: WARN }); mono(80 + 180 * L + 10, 248, `${L.toFixed(1)}s`, { 'font-size': 18, 'font-weight': 800, fill: WARN });
    pill(700, 170, '+21%p', GOOD, pop(u, 1.4), { fs: 20, fill: GOODBG }); pill(700, 240, '지연·비용 약 2배', WARN, pop(u, 1.8), { fs: 15, fill: WARNBG });
    sub(480, 330, 'HyDE 호출 1회 + reranker 가 더해진 대가', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 3. Modular — 라우터, 갈아 끼우는 소스, RRF 융합, 자기 평가
  // =========================================================
  const VEC = ['d3', 'd1', 'd7', 'd2', 'd5'], WEB = ['d1', 'd9', 'd3', 'd4', 'd6'];
  const FUSED = [['d1', 0.0325], ['d3', 0.0323], ['d9', 0.0161], ['d7', 0.0159], ['d2', 0.0156]];
  function s3(t, c) { const { k, u } = c, p = at(c); tabs(c); mods(c);
    const src = [['vector', INFO, 600], ['web', WARN, 760], ['memory', GOOD, 900]];
    if (k <= 1 || k === 4) { card(110, 220, 170, 44, { rx: 22, text: '질문', fs: 15, stroke: INFO, color: INFO });
      const g = R.G(320, 220, k === 0 ? pop(u, 0.3) : 1); el('path', { d: 'M0,-44 L60,0 L0,44 L-60,0 Z', fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g); tx(0, 6, 'Router', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }, g);
      src.forEach(([s, col, x], i) => { const y = 130 + i * 90, f = k === 0 ? E(u, 0.8 + i * 0.25, 1.3 + i * 0.25) : 1, pick = k === 4 ? (i === 0 ? E(u, 0.3, 0.9) : 0) : 0;
        el('path', { d: `M380,220 C440,220 440,${y} 500,${y}`, fill: 'none', stroke: k === 4 && i === 2 ? GRID : col, 'stroke-width': 2.5, 'stroke-dasharray': `${f * 300} 300` });
        if (k >= 1) { const sc = k === 1 ? pop(u, 0.3 + i * 0.3) : 1; card(600, y, 190, 56, { rx: 8, text: `search_${s}()`, mono: true, fs: 14.5, stroke: col, color: col, s: sc });
          if (k === 1 && u > 1.4) { el('rect', { x: 700, y: y - 14, width: 22, height: 28, rx: 3, fill: col, opacity: fade(u, 1.4) }); } }
        else if (f > 0.9) mono(510, y + 5, s, { 'font-size': 15, 'font-weight': 800, fill: col }); });
      if (k === 0) sub(480, 400, 'LLM 이 질문을 보고 어디서 찾을지 고른다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      if (k === 1) sub(480, 400, '소스는 레고 블록처럼 갈아 끼우는 함수', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      if (k === 4) { mono(712, 100, 'src="vector"(기본)', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(712, 124, '→ vector + web', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.9) });
        sub(480, 400, 'web / memory / 그 밖(vector + web) — 세 갈래', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k === 2) { // RRF: 1/(60 + 순위)
      [[VEC, 'vector 순위', INFO, 60], [WEB, 'web 순위', WARN, 220]].forEach(([L, name, col, x]) => { tx(x, 112, name, { 'font-size': 14.5, 'font-weight': 800, fill: col });
        L.forEach((d, i) => { const y = 124 + i * 44; card(x + 50, y + 18, 100, 34, { rx: 6, text: `${i + 1}. ${d}`, mono: true, fs: 15, stroke: col, color: INK, s: pop(u, 0.2 + i * 0.1) }); }); });
      mono(470, 150, 'score(d) = Σ 1 / (60 + rank)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.8) });
      mono(470, 178, 'd1 = 1/62 + 1/61', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
      tx(470, 222, '병합 결과', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      FUSED.forEach(([d, v], i) => { const y = 236 + i * 34, f = E(u, 1.3 + i * 0.12, 2.0 + i * 0.12); mono(470, y + 17, `${i + 1}. ${d}`, { 'font-size': 15, 'font-weight': 800, opacity: f });
        el('rect', { x: 540, y: y + 4, width: 300 * (v / 0.0325) * f, height: 18, rx: 4, fill: ACC }); mono(850, y + 18, v.toFixed(4), { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: f }); });
      sub(240, 380, 'vector 1위 d3 보다 두 목록에 고루 있는 d1 이 앞선다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3 || k === 5) { // 자기 평가 문
      card(150, 220, 200, 70, { rx: 10, text: 'context\n(fused[:5])', fs: 15, stroke: ACC });
      const g = R.G(420, 220, k === 3 ? pop(u, 0.4) : 1); el('path', { d: 'M0,-56 L80,0 L0,56 L-80,0 Z', fill: WARNBG, stroke: WARN, 'stroke-width': 2.5 }, g);
      tx(0, -2, 'LLM-as-judge', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN }, g); tx(0, 20, '충분?', { 'font-size': 14, 'text-anchor': 'middle' }, g);
      grow(252, 220, 336, 220, k === 3 ? E(u, 0.2, 0.5) : 1, MUT);
      grow(502, 220, 620, 220, k === 3 ? E(u, 1.0, 1.4) : 1, GOOD); tx(540, 210, 'yes', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: k === 3 ? fade(u, 1.2) : 1 });
      card(720, 220, 170, 50, { rx: 10, text: 'Generate', fs: 15, mono: true, stroke: GOOD, color: GOOD });
      el('path', { d: 'M420,278 L420,350 L150,350 L150,257', fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': `${(k === 3 ? E(u, 1.4, 2.0) : 1) * 700} 700`, 'marker-end': 'url(#ra-ahr)' });
      tx(430, 320, 'no', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: k === 3 ? fade(u, 1.6) : 1 });
      if (k === 3) { tx(285, 342, '부족하면 보강', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) }); sub(480, 400, 'Self-RAG 의 핵심 재료 — 스스로 충분한지 묻는다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      if (k === 5) { pill(285, 350, '+ search_web()', WARN, pop(u, 0.3), { fs: 14, fill: WARNBG, mono: true }); dot([[420, 278], [420, 350], [150, 350], [150, 257]], clamp((u - 0.4) / 1.2), BAD, 7);
        accBar(620, 330, 220, 83, 91, u - 1.2, '정확도 (예시)', GOOD); }
      return; }
    // k6: 모듈 교체 = 새 패턴
    [['Self-RAG', '자기 평가 루프'], ['CRAG', '검색 교정 + 웹 보강'], ['RAG-Fusion', '여러 쿼리 + RRF']].forEach(([a, b], i) => {
      const x = 170 + i * 310; card(x, 210, 250, 90, { rx: 14, text: `${a}\n${b}`, fs: 15.5, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.3 + i * 0.4) }); });
    sub(480, 320, '같은 6개 모듈을 다르게 조합한 이름들', fade(u, 1.7), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 4. 비교 — 표 한 줄씩, 그리고 정확도 계단
  // =========================================================
  const COLS = [['naive', 'Naive'], ['advanced', 'Advanced'], ['modular', 'Modular']];
  function s4(t, c) { const { k, u } = c, rows = c.beat.compare, prevN = c.prev ? c.prev.compare.length : 0; tabs(c);
    if (k <= 3) { const X = [80, 330, 520, 710], Y = 66, RH = 38;
      tx(X[0], Y + 26, '지표', { 'font-size': 15, 'font-weight': 800, fill: MUT }); COLS.forEach(([, n], i) => tx(X[i + 1] + 80, Y + 26, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.3 + i * 0.2) : 1 }));
      el('line', { x1: 70, y1: Y + 38, x2: lerp(70, 900, k === 0 ? E(u, 0.2, 1.0) : 1), y2: Y + 38, stroke: INK, 'stroke-width': 2 });
      rows.forEach((r, i) => { const y = Y + 44 + i * RH, nw = i >= prevN, f = nw ? E(u, 0.3 + (i - prevN) * 0.3, 0.8 + (i - prevN) * 0.3) : 1; if (f <= 0) return;
        tx(X[0], y + 27, r.metric, { 'font-size': 15, 'font-weight': 700, opacity: f });
        COLS.forEach(([m], j) => { const win = r.winner === m, x = X[j + 1];
          el('rect', { x, y: y + 4, width: 160 * f, height: RH - 8, rx: 6, fill: win ? GOODBG : SOFT, stroke: win ? GOOD : 'none', 'stroke-width': 1.8 });
          mono(x + 80, y + 27, r[m], { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': win ? 800 : 500, fill: win ? GOOD : INK, opacity: f }); }); });
      if (k === 0) sub(480, 300, '세 세대를 한 표에 — 지표가 한 줄씩 채워진다', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 3) mono(905, 412, `Naive 우세 ${rows.filter((r) => r.winner === 'naive').length} / ${rows.length}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: GOOD, opacity: fade(u, 1.8) });
      tx(80, 412, '수치는 페이지의 예시 값', { 'font-size': 13.5, fill: MUT }); return; }
    // 정확도 계단 (62 → 83 → 91)
    const ax = R.axes(90, 80, 420, 280, { x: [0, 3], y: [50, 100], yt: [50, 60, 70, 80, 90, 100], yl: '정확도 % (예시)', grid: true });
    const pts = [[0.5, 62], [1.5, 83], [2.5, 91]]; R.line(ax, pts, k === 4 ? E(u, 0.3, 1.6) : 1, ACC, { sw: 3.5 });
    pts.forEach(([x, y], i) => { const s = k === 4 ? pop(u, 0.3 + i * 0.6) : 1; el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 8 * s, fill: ACC }); mono(ax.X(x), ax.Y(y) - 16, `${y}%`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s });
      tx(ax.X(x), 385, COLS[i][1], { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); });
    pill(ax.X(1), ax.Y(72), '+21%p', GOOD, k === 4 ? pop(u, 1.0) : 1, { fs: 15, fill: GOODBG }); pill(ax.X(2), ax.Y(96), '+8%p', WARN, k === 4 ? pop(u, 1.6) : 1, { fs: 15, fill: WARNBG });
    if (k === 4) sub(730, 230, '첫 점프가 두 번째보다 훨씬 크다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 5) { el('circle', { cx: ax.X(1.5), cy: ax.Y(83), r: 22, fill: 'none', stroke: GOOD, 'stroke-width': 3 });
      [['코드', '~150 → 600+줄', '4배'], ['시간', '1주 → 1개월+', '4배'], ['정확도', '83 → 91%', '+8%p']].forEach(([a, b, d], i) => { const y = 140 + i * 66, s = fade(u, 0.3 + i * 0.4);
        tx(580, y, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); mono(660, y, b, { 'font-size': 15, opacity: s }); mono(900, y, d, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: i === 2 ? WARN : BAD, opacity: s }); });
      pill(730, 360, 'Advanced = sweet spot', GOOD, pop(u, 1.8), { fs: 16, fill: GOODBG }); } }

  // =========================================================
  // 5. 결정 나무 — 질문 세 개, 시나리오가 칸으로 떨어진다
  // =========================================================
  function s5(t, c) { const { k, u } = c, dec = c.beat.decision, prevN = c.prev ? c.prev.decision.length : 0; tabs(c);
    if (k >= 4) return s5ladder(t, c);
    const node = (x, y, s, sc) => { card(x, y, 190, 40, { rx: 20, text: s, fs: 14.5, stroke: INK, s: sc }); };
    const leaf = (x, y, s, col, sc) => card(x, y, 120, 34, { rx: 8, text: s, fs: 14.5, stroke: col, color: col, fill: PANEL, s: sc });
    const sh = (kk, a) => (k > kk ? 1 : k === kk ? pop(u, a) : 0);
    node(130, 90, 'Q1. PoC / MVP?', 1); leaf(360, 90, 'Naive', INFO, sh(0, 0.5)); grow(226, 90, 298, 90, sh(0, 0.4), MUT); tx(260, 82, 'YES', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    if (k >= 1) { grow(130, 112, 130, 158, sh(1, 0.2), MUT); node(130, 180, 'Q2. SLA 90%+?', sh(1, 0.3)); leaf(360, 180, 'Advanced', ACC, sh(1, 0.6)); grow(226, 180, 298, 180, sh(1, 0.5), MUT); tx(260, 172, 'NO', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    if (k >= 2) { grow(130, 202, 130, 248, sh(2, 0.2), MUT); node(130, 270, 'Q3. 의도 분기?', sh(2, 0.3)); leaf(360, 270, 'Modular', WARN, sh(2, 0.6)); grow(226, 270, 298, 270, sh(2, 0.5), MUT); tx(260, 262, 'YES', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      card(130, 340, 210, 34, { rx: 8, text: 'NO → Advanced + FT', fs: 14, stroke: ACC, color: ACC, s: sh(2, 0.9) }); }
    // 오른쪽: 시나리오 칸
    [['naive', 'Naive', INFO], ['advanced', 'Advanced', ACC], ['modular', 'Modular', WARN]].forEach(([m, n, col], i) => { const x = 610 + i * 120;
      el('rect', { x: x - 56, y: 76, width: 112, height: 330, rx: 10, fill: SOFT, stroke: col, 'stroke-width': 1.5 }); tx(x, 98, n, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); });
    const cnt = { naive: 0, advanced: 0, modular: 0 };
    dec.forEach((d, i) => { const j = cnt[d.pick]++, x = 610 + ['naive', 'advanced', 'modular'].indexOf(d.pick) * 120, y = 130 + j * 92, nw = i >= prevN, f = nw ? E(u, 0.3 + (i - prevN) * 0.25, 1.0 + (i - prevN) * 0.25) : 1;
      if (f <= 0) return; const yy = lerp(y - 14, y, f), lines = wrap(d.scenario, 96, 13.5).slice(0, 3);
      el('rect', { x: x - 52, y: yy, width: 104, height: 18 + lines.length * 19, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 1.2, opacity: f });
      lines.forEach((s, q) => tx(x, yy + 18 + q * 19, s, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: f })); }); }
  function s5ladder(t, c) { const { k, u } = c;
    if (k === 4) { [['1', 'Naive 로 시작', '1주 안에 동작 확인', INFO], ['2', 'Advanced 로 승격', 're-rank 부터 붙인다', ACC], ['3', 'Modular 는 SLA 미달 때만', 'A/B 로 ROI 검증', WARN]].forEach(([n, a, b, col], i) => {
        const x = 120 + i * 260, y = 330 - i * 90, s = pop(u, 0.3 + i * 0.5);
        el('rect', { x: x - 20, y, width: 260, height: 400 - y, fill: SOFT, stroke: col, 'stroke-width': 2, opacity: fade(u, 0.3 + i * 0.5) });
        card(x + 110, y - 6, 240, 66, { rx: 10, text: `${a}\n${b}`, fs: 15, stroke: col, color: col, s });
        mono(x - 4, y + 40, n, { 'font-size': 24, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.5) }); });
      return; }
    card(300, 180, 360, 80, { rx: 12, text: '처음부터 Modular (Self-RAG)\n→ 1개월 잡힌다', fs: 16, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.2) }); cross(480, 160, 20, pop(u, 0.9));
    card(300, 320, 360, 70, { rx: 12, text: 'Naive 면 충분한데 Modular\n→ 쿼리당 비용 약 3배', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.1) });
    [['I-2-2', 'RAG vs Fine-tuning'], ['Part II', 'Pre/Post 모듈 디테일'], ['Part III', 'Self-RAG / CRAG']].forEach(([a, b], i) => { const y = 150 + i * 70;
      card(760, y, 280, 52, { rx: 10, stroke: i ? GRID : ACC, fill: i ? PANEL : ACCBG, s: pop(u, 1.4 + i * 0.25) });
      if (u > 1.6 + i * 0.25) { mono(640, y + 6, a, { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(720, y + 6, b, { 'font-size': 14.5, 'font-weight': 700 }); } });
    lbl(760, 100, '다음 단계', fade(u, 1.3), {}); }

  const quiz = [
    { q: 'Naive RAG 예제에서 "brew install" 같은 엉뚱한 답이 나온 직접 원인은 무엇인가?',
      o: ['LLM이 파이썬을 몰라서', '검색 결과를 거르지 않고 그대로 prompt에 이어 붙여서', 'FAISS가 문서를 지워서'], a: 1,
      why: '문서가 2개뿐인데 k=3이라 설치 문서도 딸려 왔고, 정제 없이 concat해 노이즈가 답에 섞였다.' },
    { q: 'Advanced RAG에서 후보를 10개 뽑은 뒤 3개로 줄이는 단계는 무엇인가?',
      o: ['Post-Retrieval의 re-rank', 'Pre-Retrieval의 HyDE', 'Generate'], a: 0,
      why: 'cross-encoder 계열 reranker가 질문과 후보를 다시 채점해 top-3만 남긴다. 넓게 회수하고 뒤에서 거르는 구조다.' },
    { q: 'RRF(k=60)로 vector 순위 [d3, d1, …]와 web 순위 [d1, d9, d3, …]를 합치면 1위는 무엇인가?',
      o: ['d3', 'd9', 'd1'], a: 2,
      why: 'd1은 1/62 + 1/61 ≈ 0.0325, d3는 1/61 + 1/63 ≈ 0.0323이다. 두 목록 모두에서 높은 d1이 앞선다.' },
    { q: '비교표에서 Naive → Advanced와 Advanced → Modular의 정확도 차이(예시)는 각각 얼마인가?',
      o: ['+8%p, +21%p', '+21%p, +8%p', '+29%p, +0%p'], a: 1,
      why: '62% → 83% → 91%다. 첫 점프가 크고 둘째는 코드 4배·시간 4배를 들이고도 +8%p에 그친다.' },
    { q: '결정 나무에서 의도가 검색·계산·뉴스로 갈리는 비서에 권하는 것은 무엇인가?',
      o: ['Naive', 'Advanced', 'Modular'], a: 2,
      why: 'Q3에서 의도가 source별로 갈리면 Router 분기가 꼭 필요하다. 그래서 Modular를 고른다.' },
  ];

  const summary = [
    'Naive RAG는 검색 결과를 그대로 붙여 노이즈 청크가 답에 섞인다.',
    'Advanced는 질문을 늘려 넓게 찾고 재순위로 좋은 청크만 남긴다.',
    'Modular는 라우터와 RRF 융합, 자기 평가를 블록처럼 조합한다.',
    '정확도 예시는 62, 83, 91%이고 가성비는 Advanced가 가장 좋다.',
  ];
  const review = [
    { q: '사내 FAQ 봇이 Naive로 동작하는데 엉뚱한 문서가 자주 섞인다. 먼저 붙일 것은?',
      o: ['Router와 웹 검색', '후보를 넓게 뽑은 뒤 re-rank로 거르는 단계', 'LLM-as-judge 보강 루프'], a: 1,
      why: '노이즈 청크가 문제라면 Post-Retrieval의 re-rank가 가장 가까운 처방이다. 마이그레이션 순서도 Advanced 승격이 먼저다.' },
    { q: 'vector와 web 결과를 합치는데 두 점수의 척도가 다르다. 어떻게 합치는 게 맞나?',
      o: ['점수를 그대로 더한다', '한쪽 결과만 쓴다', '순위만 써서 1/(60 + 순위)를 더하는 RRF로 합친다'], a: 2,
      why: 'RRF는 점수 대신 순위를 써서 척도가 달라도 합칠 수 있다. 두 목록에 고루 오른 문서가 위로 올라온다.' },
    { q: '해커톤에서 처음부터 Self-RAG를 짜기로 했다. 가장 큰 위험은?',
      o: ['한 달 구현에 묶여 피드백 수집이 늦어진다', '정확도가 오히려 Naive보다 낮아진다', '검색 단계가 빠져 RAG가 아니게 된다'], a: 0,
      why: 'PoC는 Naive로 하루 만에 동작을 확인하는 게 먼저다. Modular는 코드 600줄 이상, 1개월 이상이 드는 선택이다.' },
  ];

  R.page({ title: 'RAG 3세대 — Naive · Advanced · Modular', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
