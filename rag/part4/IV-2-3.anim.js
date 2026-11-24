/* IV-2-3 Contextual Compression — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * chunk 6개(점수·토큰·발췌)는 STEPS 의 chunks·compressor·tokenBar 를 읽는다.
 * 토큰 수는 각 문장을 tiktoken o200k_base(gpt-4o-mini 토크나이저)로 센 값이다. 발췌 문장은 LLM 출력 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const NAME = { 1: 'async def · 응답 모델', 2: 'Uvicorn 워커 늘리기', 3: 'FastAPI의 역사', 4: 'Pydantic v2 직렬화', 5: 'Swagger UI 경로', 6: 'CORS 설정' };
  const PX = 5.2;                                   // 토큰 1개 = 5.2px
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const bySc = (cs) => cs.slice().sort((a, b) => b.score - a.score);
  const exOf = (c, id) => { const x = ((c.beat.compressor || {}).extracted || []).find((e) => e.id === id); return x ? x.newTokens : null; };

  // chunk 한 줄: 머리(#id·점수) + 토큰 길이만큼의 막대
  function chunkRow(x, y, ch, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1; if (s <= 0.02 || op <= 0.02) return;
    const len = (o.tok ?? ch.tokens) * PX, noise = !ch.relevant, col = o.col || (o.markNoise && noise ? BAD : ch.relevant ? INFO : MUT);
    const g = R.G(x, y, s, op);
    mono(0, 5, '#' + ch.id, { 'font-size': 14.5, 'font-weight': 800, fill: col }, g);
    mono(34, 5, ch.score.toFixed(2), { 'font-size': 13.5, fill: MUT }, g);
    el('rect', { x: 84, y: -14, width: len, height: 28, rx: 5, fill: o.fill || (o.markNoise && noise ? BADBG : ch.relevant ? INFOBG : SOFT), stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': o.dash }, g);
    tx(92, 5, o.label || NAME[ch.id], { 'font-size': 13.5, 'font-weight': 600, fill: INK, 'text-decoration': o.strike ? 'line-through' : null }, g);
    const lw = Math.max(len, tw(o.label || NAME[ch.id], 13.5) + 16);
    if (o.tokLabel !== false) mono(84 + lw + 8, 5, o.tokText || (o.tok ?? ch.tokens) + ' tok', { 'font-size': 13.5, fill: o.tokCol || MUT, 'font-weight': 700 }, g); }
  // 프롬프트 창: segs [{tok, col}] 를 아래부터 쌓는다 (u 만큼)
  function promptWin(x, y, w, h, segs, u, o) { o = o || {}; const scale = h / 213;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    tx(x, y - 10, o.title || 'LLM 프롬프트 context', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    let acc = 0; const total = segs.reduce((a, b) => a + b.tok, 0);
    segs.forEach((sg, i) => { const shown = clamp(u * segs.length - i); if (shown <= 0) return; const hh = sg.tok * scale * shown;
      el('rect', { x: x + 6, y: y + h - 4 - acc - hh, width: w - 12, height: Math.max(0, hh - 2), rx: 3, fill: sg.col, opacity: 0.8 });
      if (shown >= 1 && sg.label) tx(x + w / 2, y + h - 4 - acc - hh / 2 + 5, sg.label, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' });
      acc += sg.tok * scale * shown; });
    const n = Math.round(segs.reduce((a, sg, i) => a + sg.tok * clamp(u * segs.length - i), 0));
    mono(x + w / 2, y + h + 26, (o.prefix || '') + n + ' 토큰', { 'font-size': 18, 'font-weight': 800, fill: o.numCol || INK, 'text-anchor': 'middle' }); return total; }
  const segsOf = (cs, f) => bySc(cs).filter(f || (() => true)).map((ch) => ({ tok: ch.tokens, col: ch.relevant ? INFO : OFF, label: '#' + ch.id }));
  function rows6(c, x, y, f) { bySc(c.beat.chunks || []).forEach((ch, i) => chunkRow(x, y + i * 46, ch, f ? f(ch, i) : {})); }
  // 토큰 미터: before → after
  function meter(x, y, before, after, u, o) { o = o || {}; const W = 330, v = lerp(before, after, E(u, 0.3, 1.5));
    tx(x, y - 12, o.title || '프롬프트 토큰', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    el('rect', { x, y, width: W, height: 26, rx: 5, fill: SOFT }); el('rect', { x, y, width: W * before / 213, height: 26, rx: 5, fill: OFF, opacity: 0.5 });
    el('rect', { x, y, width: W * v / 213, height: 26, rx: 5, fill: o.col || ACC });
    mono(x, y + 56, `${before} → ${Math.round(v)}`, { 'font-size': 20, 'font-weight': 800 });
    const pct = Math.round((1 - after / before) * 100);
    pill(x + 250, y + 50, `-${pct}%`, GOOD, pop(u, 1.6), { mono: true, fs: 16 }); }

  // ---------- 1. 압축 없음 ----------
  function s1(t, c) { const { k, u } = c, cs = c.beat.chunks || [];
    if (k === 0) { R.dbIcon(160, 190, 'FAISS 인덱스', { s: pop(u, 0.2) }); card(470, 190, 180, 64, { rx: 12, stroke: ACC, fill: ACCBG, text: 'LLM gpt-4o-mini', fs: 15, color: ACC, s: pop(u, 0.6) });
      promptWin(640, 70, 260, 280, [], 1); note(300, 330, '아직 검색 전: chunk 0개 · 토큰 0', fade(u, 1.2), { fill: MUT }); return; }
    if (k === 1) { rows6(c, 40, 70, (ch, i) => ({ s: pop(u, 0.3 + i * 0.25, 0.5), markNoise: u > 2.0 }));
      pill(150, 360, 'k=6 · 관련 3 + 무관 3', BAD, pop(u, 2.1), { fs: 14.5 }); promptWin(640, 70, 260, 280, [], 1); return; }
    rows6(c, 40, 70, () => ({ op: k === 2 ? 1 - 0.5 * E(u, 0.4, 1.6) : 0.5, markNoise: k === 3 }));
    if (k === 2) for (let i = 0; i < 6; i++) dot([[380, 70 + i * 46], [640, 210]], seg(u, 0.2 + i * 0.2, 0.9 + i * 0.2), INFO, 6);
    const segs = segsOf(cs).map((sg) => (k === 3 && sg.col === OFF ? Object.assign(sg, { col: BAD }) : sg));
    promptWin(640, 70, 260, 280, segs, k === 2 ? E(u, 0.4, 2.2) : 1, { title: 'chain_type="stuff" context' });
    if (k === 3) { note(40, 356, '213 토큰 중 무관 84 (39%)', fade(u, 0.5), { fill: BAD });
      sub(40, 386, '비용은 늘고 LLM 주의는 흩어진다 (Lost in the Middle)', fade(u, 1.2), { 'text-anchor': 'start', 'font-size': 14.5 }); }
    if (k === 4) { const y = 390; [['retriever', 120, INK], ['압축 ?', 330, ACC], ['LLM', 540, INK]].forEach(([s, x, col], i) => {
        card(x, y, 130, 36, { rx: 8, text: s, fs: 15, stroke: col, color: col, dash: i === 1 ? '6 4' : null, fill: i === 1 ? ACCBG : PANEL, s: pop(u, 0.2 + i * 0.4) });
        if (i) grow(x - 140, y, x - 68, y, E(u, i * 0.4, 0.3 + i * 0.4), MUT); }); } }

  // ---------- 2. LLMChainExtractor ----------
  function s2(t, c) { const { k, u } = c, cs = bySc(c.beat.chunks || []);
    const calls = k === 0 ? 0 : k === 1 ? Math.round(E(u, 0.2, 2.0) * 6) : 6;
    card(640, 110, 230, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5, text: 'LLMChainExtractor\n관련 문장만 발췌', fs: 15, color: ACC, s: k === 0 ? pop(u, 0.3) : 1 });
    mono(640, 170, `LLM 호출 ${calls}회`, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    if (k === 0) { rows6(c, 20, 70, () => ({ op: 0.6 })); return; }
    const done = { 1: k >= 2, 2: k >= 2, 3: k >= 3, 4: k >= 4, 5: k >= 4, 6: k >= 4 }, now = { 1: k === 2, 2: k === 2, 3: k === 3, 4: k === 4, 5: k === 4, 6: k === 4 };
    cs.forEach((ch, i) => { const y = 70 + i * 46;
      if (k === 1) { dot([[400, y], [525, 110]], seg(u, 0.2 + i * 0.3, 0.8 + i * 0.3), ACC, 5); chunkRow(20, y, ch, {}); return; }
      if (!done[ch.id]) { chunkRow(20, y, ch, { op: 0.6 }); return; }
      const g = now[ch.id] ? E(u, 0.3, 1.4) : 1;
      if (ch.relevant) { const nt = exOf(c, ch.id); if (nt == null) { chunkRow(20, y, ch, {}); return; }
        const tok = Math.round(lerp(ch.tokens, nt, g)); chunkRow(20, y, ch, { tok, fill: GOODBG, col: GOOD, tokText: g >= 1 ? `${ch.tokens}→${nt} tok` : tok + ' tok', tokCol: GOOD });
        if (now[ch.id] && g < 1) el('path', { d: `M${104 + tok * PX},${y - 18} L${104 + tok * PX},${y + 18}`, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }); }
      else { const f = now[ch.id] ? E(u, 0.4, 1.4) : 1; chunkRow(20, y + f * 8, ch, { op: 1 - 0.75 * f, strike: f > 0.5, col: BAD, label: f > 0.5 ? 'NO_OUTPUT' : NAME[ch.id], tokLabel: false });
        if (f > 0.5) cross(20 + 84 + ch.tokens * PX + 18, y + f * 8, 8, f); } });
    if (k === 5) meter(560, 270, 213, (c.beat.tokenBar || {}).after || 80, u); }

  // ---------- 3. EmbeddingsFilter ----------
  function s3(t, c) { const { k, u } = c, cs = bySc(c.beat.chunks || []), X0 = 330, W = 300, th = 0.5;
    card(800, 110, 230, 66, { rx: 12, stroke: WARN, fill: WARNBG, sw: 2.5, text: 'EmbeddingsFilter\nLLM 호출 0회', fs: 15, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { sub(800, 168, 'text-embedding-3-small', fade(u, 0.8), { class: 'mono' }); cs.forEach((ch, i) => chunkRow(20, 70 + i * 46, ch, { op: 0.6 })); return; }
    tx(X0, 44, '질문과의 cosine 유사도', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    cs.forEach((ch, i) => { const y = 70 + i * 46, pass = ch.score >= th, fill = k >= 2 ? E(u, 0.2 + i * 0.12, 0.9 + i * 0.12) : 0, show = k >= 2 ? 1 : 0;
      const gone = (k === 3 && !pass) ? E(u, 0.3, 1.2) : k >= 4 && !pass ? 1 : 0;
      mono(20, y + 5, '#' + ch.id, { 'font-size': 14.5, 'font-weight': 800, fill: gone ? OFF : INK });
      tx(60, y + 5, NAME[ch.id], { 'font-size': 14, 'font-weight': 600, fill: gone ? OFF : INK, 'text-decoration': gone > 0.5 ? 'line-through' : null });
      el('rect', { x: X0, y: y - 12, width: W, height: 24, rx: 4, fill: SOFT });
      if (show) { el('rect', { x: X0, y: y - 12, width: W * ch.score * (k === 2 ? fill : 1), height: 24, rx: 4, fill: pass ? GOOD : BAD, opacity: 0.85 - 0.5 * gone });
        if (k < 4) mono(X0 + W + 10, y + 5, ch.score.toFixed(2), { 'font-size': 14, 'font-weight': 700, fill: pass ? GOOD : BAD, opacity: k === 2 ? fade(u, 0.9 + i * 0.12) : 1 }); }
      if (k === 3 && !pass) mono(X0 + W + 60, y + 5, 'drop', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: k === 3 ? fade(u, 1.0) : 1 });
      if (k >= 2 && k < 4 && pass) mono(X0 + W + 60, y + 5, 'keep', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: k === 2 ? fade(u, 1.6) : 1 }); });
    const lx = X0 + W * th, g = k === 1 ? E(u, 0.3, 1.2) : 1; el('line', { x1: lx, y1: 52, x2: lx, y2: 52 + 290 * g, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
    mono(lx, 372, 'similarity_threshold = 0.5', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.0) : 1 });
    if (k === 4) meter(600, 250, 213, (c.beat.tokenBar || {}).after || 129, u, { col: WARN }); else if (k >= 2) sub(780, 230, 'chunk 안쪽은 건드리지 않는다', k === 2 ? fade(u, 2.0) : 1, { 'font-size': 14.5 }); }

  // ---------- 4. LLMListwiseRerank ----------
  function s4(t, c) { const { k, u } = c, cs = c.beat.chunks || [], orig = bySc(cs);
    const rp = (ch) => ch.rerankPos, ranked = cs.filter((ch) => rp(ch)).sort((a, b) => rp(a) - rp(b));
    card(480, 70, 250, 56, { rx: 12, stroke: INFO, fill: INFOBG, sw: 2.5, text: 'LLMListwiseRerank', fs: 16, color: INFO, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { orig.forEach((ch, i) => chunkRow(20, 130 + i * 46, ch, { op: 0.6, tokLabel: false })); return; }
    if (k < 5) { tx(20, 112, '1차 검색 순서', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      orig.forEach((ch, i) => chunkRow(20, 140 + i * 44, ch, { op: k >= 3 ? 0.45 : 1, tokLabel: false, s: 0.85 })); }
    tx(620, 112, 'LLM이 매긴 순서', { 'font-size': 14.5, 'font-weight': 700, fill: INFO });
    const slots = 3; for (let j = 0; j < 6; j++) { const y = 140 + j * 44; el('rect', { x: 620, y: y - 15, width: 300, height: 30, rx: 6, fill: 'none', stroke: j < slots ? INFO : GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: k === 1 ? fade(u, 0.3 + j * 0.1) : 1 }); }
    mono(930, 140 + 1 * 44 + 5, 'top_n=3', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 1.2) : 0 });
    if (k === 2) { orig.forEach((ch, i) => dot([[300, 140 + i * 44], [480, 98]], seg(u, 0.3, 1.2), INFO, 5));
      mono(480, 380, 'LLM 호출 1회로 6개를 한꺼번에', { 'font-size': 17, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); return; }
    if (k >= 3) ranked.forEach((ch, j) => { const i = orig.indexOf(ch), g = k === 3 ? E(u, 0.2 + j * 0.15, 1.2 + j * 0.15) : 1, cut = k >= 4 && j >= 3;
      const y0 = 140 + i * 44, y1 = 140 + j * 44; if (g <= 0) return;
      if (k < 5) el('line', { x1: 410, y1: y0, x2: lerp(410, 620, g), y2: lerp(y0, y1, g), stroke: cut ? OFF : j < 3 ? INFO : MUT, 'stroke-width': 2, opacity: 0.7 });
      if (g >= 1) { card(770, y1, 300, 30, { rx: 6, fill: cut ? SOFT : j < 3 ? INFOBG : PANEL, stroke: cut ? GRID : INFO, sw: 1.8 });
        mono(632, y1 + 5, (j + 1) + '위', { 'font-size': 14, 'font-weight': 800, fill: cut ? OFF : INFO });
        tx(680, y1 + 5, '#' + ch.id + ' ' + NAME[ch.id], { 'font-size': 14, 'font-weight': 600, fill: cut ? OFF : INK, 'text-decoration': cut ? 'line-through' : null }); } });
    if (k === 3) pill(770, 400, '#4(0.78)가 #2(0.88)를 앞질렀다', INFO, pop(u, 1.8), { fs: 14 });
    if (k === 4) { const g = E(u, 0.2, 0.8); el('line', { x1: 615, y1: 140 + 2.5 * 44, x2: 615 + 310 * g, y2: 140 + 2.5 * 44, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
      note(620, 400, '4~6위는 잘리고, 남은 3개는 원문 그대로', fade(u, 1.0), { fill: BAD }); }
    if (k === 5) meter(40, 200, 213, (c.beat.tokenBar || {}).after || 129, u, { col: INFO }); }

  // ---------- 5. 비교 ----------
  function s5(t, c) { const { k, u } = c, rows = ((c.beat.compressor || {}).comparison) || [], pn = (((c.prev || {}).compressor || {}).comparison || []).length;
    if (k <= 3) { const X0 = 270, W = 420; tx(40, 46, '압축 방식별 프롬프트 토큰 (chunk 6개, 예시 질문 1건)', { 'font-size': 16, 'font-weight': 800 });
      const NM = ['Raw (압축 없음)', 'EmbeddingsFilter', 'LLMListwiseRerank', 'LLMChainExtractor'], COL = [OFF, WARN, INFO, ACC];
      NM.forEach((nm, i) => { const y = 90 + i * 76, r = rows[i]; tx(40, y + 20, nm, { 'font-size': 15.5, 'font-weight': 700, fill: r ? INK : OFF });
        el('rect', { x: X0, y, width: W, height: 30, rx: 5, fill: SOFT }); if (!r) return;
        const g = i >= pn ? E(u, 0.2, 1.3) : 1; el('rect', { x: X0, y, width: W * r.tokens / 213 * g, height: 30, rx: 5, fill: COL[i], opacity: 0.85 });
        mono(X0 + W + 12, y + 21, `${r.tokens} tok`, { 'font-size': 15, 'font-weight': 800, opacity: i >= pn ? fade(u, 1.2) : 1 });
        tx(X0, y + 52, `절감 ${r.savedPct}% · LLM ${r.calls}회 · 정확도 ${r.accuracy}`, { 'font-size': 14, fill: MUT, opacity: i >= pn ? fade(u, 1.4) : 1 }); });
      return; }
    // k4 이상적 파이프라인
    tx(40, 46, 'DocumentCompressorPipeline: 셋을 직렬로', { 'font-size': 16, 'font-weight': 800 });
    const st = [['검색 결과', 'chunk 6개', INK], ['Filter 0.5', '3개 남음', WARN], ['Rerank top_n=4', '#1 · #4 · #2', INFO], ['Extractor', '발췌 3건', ACC]];
    st.forEach(([a, b, col], i) => { const x = 120 + i * 240, s = pop(u, 0.2 + i * 0.4);
      card(x, 150, 190, 80, { rx: 12, stroke: col, sw: 2.5, text: a + '\n' + b, fs: 15, color: col, s }); if (i) grow(x - 140, 150, x - 99, 150, E(u, i * 0.4, 0.3 + i * 0.4), MUT); });
    const ex = (STEPS.find((s) => s.compressor && s.compressor.kind === 'extractor' && s.compressor.extracted.length === 3) || {}).compressor;
    if (ex) ex.extracted.forEach((e, i) => { const y = 260 + i * 44, s = pop(u, 1.8 + i * 0.2);
      card(480, y, 820, 34, { rx: 6, stroke: ACC, fill: ACCBG, text: `#${e.id}  ${e.text}`, fs: 14, s }); }); }

  const quiz = [
    { q: '압축 없이 top-6을 그대로 넣었을 때 생기는 문제는 무엇인가?',
      o: ['관련 chunk가 사라진다', '213 토큰 중 84 토큰(39%)이 질문과 무관한 내용이다', '검색 속도가 느려진다'], a: 1,
      why: '#3·#5·#6은 FastAPI 역사, Swagger UI, CORS 이야기라 질문과 상관없다. 그만큼 비용이 늘고 LLM 주의가 흩어진다.' },
    { q: 'LLMChainExtractor가 토큰을 가장 많이 줄이는 이유는 무엇인가?',
      o: ['chunk 안에서도 관련 문장만 잘라 남기기 때문이다', 'LLM을 한 번만 부르기 때문이다', '점수 0.5 미만을 버리기 때문이다'], a: 0,
      why: '무관 chunk를 버리는 데 그치지 않고 남은 chunk도 발췌한다. 213에서 80 토큰이 되지만 chunk마다 LLM을 불러 6회가 든다.' },
    { q: 'EmbeddingsFilter가 걸러 내지 못하는 것은 무엇인가?',
      o: ['점수가 0.25인 chunk', '임계값 0.5 아래의 chunk 전체', '살아남은 chunk 안에 섞인 무관한 문장'], a: 2,
      why: 'chunk 단위로 keep/drop만 정한다. 0.5 이상인 #1·#2·#4는 원문 그대로 남아 213에서 129 토큰까지만 준다.' },
    { q: 'LLMListwiseRerank가 Extractor보다 싼 이유는 무엇인가?',
      o: ['임베딩만 쓰고 LLM을 안 부르기 때문이다', 'chunk 6개를 한 번에 보내 LLM을 1회만 부르기 때문이다', '토큰을 더 많이 줄이기 때문이다'], a: 1,
      why: 'Extractor는 chunk마다 6회, listwise는 목록 전체를 1회에 순위 매긴다. 그 결과 #4가 #2를 앞질렀다.' },
    { q: '세 압축기를 직렬로 묶을 때 맞는 순서는 무엇인가?',
      o: ['Filter → Rerank → Extractor', 'Extractor → Rerank → Filter', 'Rerank → Extractor → Filter'], a: 0,
      why: '공짜인 Filter로 명백한 노이즈를 먼저 버리고, Rerank로 순서를 고친 뒤, 비싼 Extractor는 남은 소수에만 쓴다.' },
  ];
  const summary = [
    '검색한 chunk 6개를 그대로 넣으면 213 토큰 중 84 토큰(39%)이 질문과 상관없는 내용이었다.',
    '검색과 LLM 사이에 압축 단계를 두어 노이즈를 빼면 토큰과 비용이 준다.',
    'Filter와 Rerank는 chunk 통째로 버려 129 토큰, Extractor는 문장까지 잘라 80 토큰이 된다.',
    '줄이는 폭이 클수록 LLM 호출이 늘어 Filter는 0회, Rerank는 1회, Extractor는 6회다.',
  ];
  const review = [
    { q: '트래픽이 많고 비용이 빠듯한 서비스에 압축을 붙이려 한다. 먼저 고를 것은?',
      o: ['LLMChainExtractor', 'EmbeddingsFilter', '압축 없이 k를 12로 늘리기'], a: 1,
      why: 'Filter는 LLM 호출 없이 cosine 비교만 한다. 절감 폭은 39%로 작아도 질문마다 드는 비용이 거의 없다.' },
    { q: 'EmbeddingsFilter를 붙였는데 답에 여전히 관계없는 문장이 끼어든다. 왜 그런가?',
      o: ['살아남은 chunk 안의 무관 문장은 그대로 들어가기 때문이다', '임계값이 0.5라서 모든 chunk가 버려졌다', 'Filter가 순서를 뒤집었기 때문이다'], a: 0,
      why: 'Filter는 chunk 통째로만 keep/drop을 정한다. 안쪽 문장까지 자르려면 Extractor를 뒤에 붙인다.' },
    { q: '1차 검색 점수 순서가 자주 의도와 어긋나는 도메인이다. 추가 비용을 LLM 1회로 묶고 싶다면?',
      o: ['LLMChainExtractor로 chunk마다 발췌한다', 'similarity_threshold를 0.9로 올린다', 'LLMListwiseRerank로 목록 전체를 한 번에 다시 줄 세운다'], a: 2,
      why: 'listwise는 6개를 한 번에 보고 순위를 매긴다. 이 장에서 0.78이던 #4가 0.88이던 #2보다 앞에 왔다.' },
  ];

  R.page({ title: '압축해서 프롬프트에 넣기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
