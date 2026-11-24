/* V-1-1 트레이싱과 디버깅 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, cross, check, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // 한 번 호출의 Run 트리 (페이지의 예시 값: ms · tok · $)
  const RUNS = [
    { name: 'RunnableSequence', type: 'chain', d: 0, s: 0, e: 1432, tok: 610, cost: 0.00209 },
    { name: 'VectorStoreRetriever', type: 'retriever', d: 1, s: 0, e: 184, tok: 18, cost: 0.00002 },
    { name: 'ChatPromptTemplate', type: 'prompt', d: 1, s: 184, e: 187, tok: 0, cost: 0 },
    { name: 'ChatOpenAI', type: 'llm', d: 1, s: 187, e: 1425, tok: 592, cost: 0.00207 },
    { name: 'StrOutputParser', type: 'parser', d: 1, s: 1425, e: 1426, tok: 0, cost: 0 },
  ];
  const DUR = [1432, 184, 3, 1238, 1];

  // ── 1. 블랙박스: Retriever | Prompt | LLM | Parser 가 chain 안으로 사라진다
  function s1(t, c) { const { k, u } = c;
    const xs = [275, 425, 575, 725], Y = 190, W = 116;
    const names = [['Retriever', 'FAISS'], ['Prompt', '템플릿'], ['LLM', 'gpt-4o-mini'], ['Parser', 'Str']];
    if (k <= 2) names.forEach(([a, b], i) => { const built = i < 2 ? k >= 1 : k >= 2, s = k === 0 ? pop(u, 0.2 + i * 0.3) : 1;
      const solidNow = (k === 1 && i < 2) || (k === 2 && i >= 2) ? fade(u, 0.3 + (i % 2) * 0.3) : built ? 1 : 0;
      card(xs[i], Y, W, 64, { rx: 10, stroke: solidNow > 0.5 ? INK : MUT, dash: solidNow > 0.5 ? null : '6 5', sw: 2.2, s, text: a + '\n' + b, fs: 14.5, color: solidNow > 0.5 ? INK : MUT }); });
    if (k === 0) tx(500, 104, 'import 만 했다. 아직 아무것도 만들지 않았다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
    if (k === 1 || k === 2) { const o = k === 1 ? fade(u, 0.8) : 1;
      sub(xs[0], Y + 52, './idx 인덱스', o);
      pill(xs[1], Y + 52, '{context}', ACC, k === 1 ? pop(u, 1.0) : 1, { mono: true, fs: 13.5 });
      pill(xs[1], Y + 86, '{question}', ACC, k === 1 ? pop(u, 1.3) : 1, { mono: true, fs: 13.5 }); }
    // 파이프 | 가 단계를 잇는다
    if (k === 2) xs.slice(0, 3).forEach((x, i) => { const g = k === 2 ? E(u, 0.2 + i * 0.25, 0.6 + i * 0.25) : 1;
      grow(x + W / 2 + 2, Y, x + W / 2 + 2 + (150 - W - 4) * g, Y, g, ACC, { plain: true, sw: 3 });
      mono(x + 75, Y - 14, '|', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: g }); });
    // chain 이 검은 상자가 되어 덮는다
    if (k >= 2) { const o = k === 2 ? E(u, 1.3, 2.4) : 1;
      el('rect', { x: 195, y: 118, width: 610, height: 190, rx: 14, fill: INK, opacity: 0.95 * o });
      tx(214, 144, 'chain  (RunnableSequence)', { 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: o, class: 'mono' }); }
    if (k >= 3) { const q = 'Llama-3 라이선스는?';
      pill(95, Y, q, INFO, k === 3 ? pop(u, 0.1) : 1, { fs: 13.5 });
      if (k === 3) dot([[180, Y], [800, Y]], seg(u, 0.5, 1.8), WARN, 7);
      grow(500, 310, 500, 334, k === 3 ? seg(u, 1.8, 2.1) : 1, INK);
      card(500, 356, tw('"Llama-3는 커뮤니티 라이선스 …"', 14) + 30, 34, { rx: 17, fill: GOODBG, stroke: GOOD, sw: 2, text: '"Llama-3는 커뮤니티 라이선스 …"', fs: 14, color: INK, s: k === 3 ? pop(u, 2.0) : 1 });
      sub(500, 396, '최종 문자열 하나만 돌아온다 (LLM 출력은 예시)', k === 3 ? fade(u, 2.2) : 1); }
    if (k === 4) { const qs = ['어떤 문서 4개?', '어떻게 채웠나?', '몇 ms · 토큰?', '환각인가?'];
      xs.forEach((x, i) => { const s = pop(u, 0.2 + i * 0.3);
        card(x, Y + 10, 44, 44, { rx: 22, fill: WARN, stroke: 'none', text: '?', fs: 22, fw: 800, color: INK, s });
        tx(x, 96, qs[i], { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3 + i * 0.3) }); });
      tx(500, 72, '답이 틀려도 어디부터 볼지 모른다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) }); } }

  // ── 2. 콘솔 로그: 스위치 두 개와 터미널
  function toggle(x, y, label, on, o) { o = o || {};
    el('rect', { x, y: y - 13, width: 48, height: 26, rx: 13, fill: on > 0.5 ? (o.col || GOOD) : OFF });
    el('circle', { cx: x + 13 + 22 * on, cy: y, r: 10, fill: PANEL });
    mono(x + 60, y + 5, label, { 'font-size': 14.5, 'font-weight': 700, fill: o.dim ? MUT : INK }); }
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    zone(16, 22, 288, 376, '스위치', {});
    toggle(32, 66, 'set_verbose(True)', k === 0 ? E(u, 0.3, 0.9) : 1);
    toggle(32, 112, 'set_debug(True)', k === 0 ? 0 : k === 1 ? E(u, 0.3, 0.9) : 1, { dim: k === 0 });
    if (k >= 1) { const o = k === 1 ? fade(u, 1.2) : 1;
      mono(32, 160, 'with_config(verbose)', { 'font-size': 14, fill: MUT, opacity: o });
      el('line', { x1: 30, y1: 155, x2: 30 + tw('with_config(verbose)', 14) + 4, y2: 155, stroke: BAD, 'stroke-width': 2.5, opacity: o });
      tx(32, 182, '효과 없음 (config 키가 아니다)', { 'font-size': 13.5, fill: BAD, opacity: o }); }
    // 왼쪽 아래: 로그가 지나간 단계에 불이 켜진다
    const logs = b.verboseLog || [], n = logs.length, pn = (p.verboseLog || []).length;
    const shown = k === 0 || k === 1 ? 0 : lerp(pn, n, E(u, 0.2, 2.2));
    if (k < 6) { const stg = [['RunnableParallel', 2, 4], ['ChatPromptTemplate', 4, 6], ['ChatOpenAI', 6, 9], ['StrOutputParser', 9, 11]];
      tx(32, 222, '로그에 나온 단계', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      stg.forEach(([nm, a, z], i) => { const y = 250 + i * 38, run = shown > a, done = shown >= z - 0.01;
        card(160, y, 256, 30, { rx: 8, stroke: done ? GOOD : run ? WARN : GRID, sw: 1.8, fill: done ? GOODBG : run ? WARNBG : PANEL });
        mono(44, y + 5, nm, { 'font-size': 14, fill: done || run ? INK : MUT });
        if (i === 0) tx(276, y + 5, '+retriever', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }); }
    else { [['토큰·비용 합계 없음'], ['검색할 수 없다'], ['팀과 공유할 수 없다']].forEach(([s], i) => { const y = 250 + i * 46, sc = pop(u, 0.2 + i * 0.35);
        cross(48, y, 9, sc); tx(70, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); }); }
    // 터미널
    const col = { enter: WARN, exit: GOOD, data: OFF };
    const lines = ['$ python app.py'].concat(logs.map((l) => [l.text, col[l.level]]));
    terminal(320, 22, 624, 376, lines, 1 + shown, { title: 'stdout', fs: 13.5, lh: 25 });
    if (k <= 1) tx(632, 230, k === 0 ? 'LCEL 체인 · 로그 0줄' : '아직 invoke 전', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: OFF, opacity: fade(u, 1.0) });
    if (k === 6) { el('rect', { x: 320, y: 22, width: 624, height: 376, rx: 10, fill: INK, opacity: 0.55 * fade(u, 1.2, 0.6) });
      tx(32, 384, '호출 한 번에도 줄이 이만큼 쌓인다', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) }); } }

  // ── 3. LangSmith 연결: 환경변수 4줄 → Run 트리가 서버에 쌓인다
  const ENV = [['LANGSMITH_TRACING', '"true"'], ['LANGSMITH_ENDPOINT', '"https://api.smith…"'], ['LANGSMITH_API_KEY', '"lsv2_pt_..."'], ['LANGSMITH_PROJECT', '"rag-chatbot"']];
  function runRow(x, y, w, r, o) { o = o || {};
    const g = R.G(x, y, 1, o.op ?? 1);
    el('rect', { x: 0, y: -17, width: w, height: 34, rx: 7, fill: o.fill || GOODBG, stroke: o.stroke || GOOD, 'stroke-width': 1.6 }, g);
    mono(12, 5, r.name, { 'font-size': 14.5, 'font-weight': r.d === 0 ? 700 : 500 }, g);
    mono(w - 12, 5, r.type, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g); }
  function s3(t, c) { const { k, u } = c;
    zone(16, 24, 410, 196, 'os.environ', {});
    ENV.forEach(([a, v], i) => { const y = 74 + i * 38, typ = k === 0 ? clamp(u * 1.6 - i * 0.35) : 1;
      if (typ <= 0) return; mono(32, y, a.slice(0, Math.ceil(a.length * typ)), { 'font-size': 14, 'font-weight': 700 });
      if (typ >= 1) mono(196, y, '= ' + v, { 'font-size': 14, fill: ACC }); });
    // 앱
    card(110, 368, 172, 46, { rx: 10, text: 'app.py · invoke()', fs: 14.5, mono: true });
    // LangSmith 화면
    const on = k === 0 ? seg(u, 1.9, 2.3) : 1, X = 466, Wp = 478;
    el('rect', { x: X, y: 24, width: Wp, height: 376, rx: 12, fill: PANEL, stroke: on > 0.5 ? GOOD : GRID, 'stroke-width': 2 });
    tx(X + 16, 52, 'smith.langchain.com / rag-chatbot', { 'font-size': 15, 'font-weight': 700 });
    pill(X + Wp - 62, 47, on > 0.5 ? '● connected' : 'no trace', on > 0.5 ? GOOD : MUT, 1, { fs: 13.5 });
    if (k >= 1) mono(X + 16, 84, 'run_id = 7f3a-…-9c0e', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 1.8) : 1 });
    if (k >= 1) { const extra = k >= 3 ? 1 : 0, sh = k === 3 ? E(u, 0.6, 1.6) : extra;
      if (extra) runRow(X + 16, 120, Wp - 32, { name: 'my-rag  (@traceable)', type: 'chain', d: 0 }, { fill: ACCBG, stroke: ACC, op: k === 3 ? fade(u, 1.2) : 1 });
      RUNS.forEach((r, i) => { const y = 120 + (i + sh) * 42, ind = (r.d + sh) * 26, op = k === 1 ? fade(u, 0.3 + i * 0.3) : 1;
        if (r.d) el('path', { d: `M${X + 28 + (sh) * 26},${120 + sh * 42 + 17} V${y} H${X + 16 + ind}`, fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: op });
        runRow(X + 16 + ind, y, Wp - 32 - ind, r, { op }); }); }
    if (k === 2 || k === 4) for (let i = 0; i < 6; i++) dot([[196, 368], [330, 368], [X, 250]], (t * 0.7 + i / 6) % 1, ACC, 5);
    if (k >= 2 && k !== 3) card(X + Wp / 2, 372, Wp - 32, 34, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.4, text: 'output  "Llama-3는 커뮤니티 라이선스 …"', fs: 14, fw: 600, s: k === 2 ? pop(u, 1.4) : 1 });
    if (k === 3) snippet(20, 238, ['@traceable(run_type="chain",', '           name="my-rag")', 'def ask(question): ...'], { fs: 14, op: fade(u, 0.2) });
    if (k === 4) banner(222, 290, '코드 변경 0줄 · 환경변수 4개', pop(u, 0.4)); }

  // ── 4. trace 분석: 워터폴 막대로 단계별 시간·토큰·비용
  const BX = 250, BW = 420, BXo = (ms) => BX + BW * ms / 1432;
  function header(cols) { tx(30, 76, 'Run', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    tx(BX, 76, '시간 축 0 → 1,432ms', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    (cols || [['tok', 830], ['$', 940]]).forEach(([s, x]) => tx(x, 76, s, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'end' })); }
  function wfRows(c, o) { o = o || {}; const { k, u } = c;
    RUNS.forEach((r, i) => { const y = 108 + i * 50, gr = o.grow ? E(u, 0.2 + i * 0.3, 0.9 + i * 0.3) : 1, dim = o.focus != null && o.focus !== i;
      if (o.focus === i) el('rect', { x: 18, y: y - 21, width: 926, height: 42, rx: 8, fill: ACCBG });
      mono(30 + r.d * 18, y + 5, r.name, { 'font-size': 14.5, 'font-weight': r.d ? 500 : 700, fill: dim ? MUT : INK });
      el('rect', { x: BXo(r.s), y: y - 9, width: Math.max(3, (BXo(r.e) - BXo(r.s)) * gr), height: 18, rx: 4, fill: i === 3 ? ACC : i === 0 ? INK : INFO, opacity: dim ? 0.3 : 1 });
      mono(BXo(r.e) + 8, y + 5, fmt(DUR[i] * gr) + 'ms', { 'font-size': 14, 'font-weight': 700, fill: dim ? MUT : INK, opacity: o.grow ? fade(u, 0.6 + i * 0.3) : 1 });
      if (!o.noCols) { mono(830, y + 5, String(r.tok), { 'font-size': 14, 'text-anchor': 'end', fill: dim ? MUT : INK, opacity: o.grow ? fade(u, 0.8 + i * 0.3) : 1 });
        mono(940, y + 5, '$' + r.cost.toFixed(5), { 'font-size': 14, 'text-anchor': 'end', fill: dim ? MUT : INK, opacity: o.grow ? fade(u, 0.8 + i * 0.3) : 1 }); } }); }
  function s4(t, c) { const { k, u } = c;
    const g0 = k === 0 ? E(u, 0.2, 2.0) : 1;
    tx(30, 40, 'Trace · chain.invoke', { 'font-size': 16, 'font-weight': 800 });
    mono(940, 40, `${fmt(1432 * g0)}ms · ${fmt(610 * g0)} tok · $${(0.00209 * g0).toFixed(5)}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ACC });
    if (k === 3) header([['latency > 1s ?', 940]]); else header();
    wfRows(c, { grow: k === 0, focus: k === 2 ? 3 : undefined, noCols: k === 3 });
    if (k === 1) { [['tags: rag · v2', 170], ['user_id: u-42', 420], ['experiment: k=4', 680]].forEach(([s, x], i) => {
        fly(x, 398, x, 356, seg(u, 0.2 + i * 0.3, 1.0 + i * 0.3), s, { mono: true, stay: true, fill: INFO }); });
      tx(480, 400, 'root run 에 붙어 나중에 UI 에서 필터·집계된다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 2) { const g = E(u, 0.4, 1.6), y = 258;
      el('path', { d: `M${BXo(187)},${y - 26} V${y - 32} H${BXo(1425)} V${y - 26}`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: g });
      mono(BXo(806), y - 38, Math.round(86 * g) + '%', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: g });
      mono(480, 372, '1,238 ÷ 1,432 = 0.86  → 병목은 LLM 호출', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 3) { pill(480, 372, 'and(eq(name, "ChatOpenAI"), gt(latency, 1))', INK, pop(u, 0.2), { mono: true, fs: 14 });
      const lat = ['이름 불일치', '0.184s', '0.003s', '1.238s', '0.001s'];
      lat.forEach((s, i) => { const y = 108 + i * 50, ok = i === 3, o = fade(u, 0.7 + i * 0.25);
        mono(890, y + 5, s, { 'font-size': 14, 'text-anchor': 'end', fill: ok ? GOOD : MUT, 'font-weight': 700, opacity: o });
        if (ok) check(922, y, 9, pop(u, 0.8 + i * 0.25)); else cross(922, y, 7, pop(u, 0.8 + i * 0.25)); }); }
    if (k === 4) [['retriever k=4 → 2', '프롬프트 토큰 줄이기'], ['응답 캐시', '같은 질문은 LLM 생략'], ['작은 모델 검토', '지연·비용 비교']].forEach(([a, b], i) => {
      card(170 + i * 310, 374, 284, 52, { rx: 10, stroke: GOOD, sw: 2, fill: GOODBG, text: a + '\n' + b, fs: 14, s: pop(u, 0.3 + i * 0.35) }); }); }

  // ── 5. 에러 trace: 실패한 Run 이 빨갛게, 실패 입력으로 다시 돌린다
  const FAIL = [ // [이름, 깊이, 시작, 끝(ms), 상태]
    ['RunnableSequence', 0, 0, 412, 'fail'], ['VectorStoreRetriever', 1, 0, 184, 'ok'], ['ChatPromptTemplate', 1, 184, 187, 'ok'],
    ['ChatOpenAI', 1, 187, 407, 'fail'], ['StrOutputParser', 1, 0, 0, 'skip']];
  const FMS = ['412ms', '184ms', '3ms', '220ms', 'skipped'];
  function s5(t, c) { const { k, u } = c, X0 = 228, XW = 150, xo = (ms) => X0 + XW * ms / 412;
    el('rect', { x: 14, y: 24, width: 432, height: 290, rx: 12, fill: PANEL, stroke: k === 0 ? BAD : GRID, 'stroke-width': 2 });
    tx(30, 52, 'Trace · chain.invoke', { 'font-size': 15, 'font-weight': 800 });
    pill(380, 47, 'FAILED', BAD, k === 0 ? pop(u, 0.3) : 1, { fs: 13.5 });
    FAIL.forEach(([nm, d, s, e, st], i) => { const y = 92 + i * 48, rev = i === 0 || k >= 1, o = i === 0 || k >= 1 ? (k === 1 && i > 0 ? fade(u, 0.2 + i * 0.3) : 1) : 0.35;
      const col = !rev ? OFF : st === 'ok' ? GOOD : st === 'fail' ? BAD : MUT;
      if (rev && st === 'fail' && i === 3) el('rect', { x: 20, y: y - 20, width: 420, height: 40, rx: 8, fill: BADBG, opacity: o });
      mono(24 + d * 16, y + 5, nm, { 'font-size': 14, 'font-weight': d ? 500 : 700, fill: rev ? INK : MUT, opacity: Math.max(o, 0.35), 'text-decoration': rev && st === 'skip' ? 'line-through' : null });
      if (st === 'skip') { if (rev) el('rect', { x: X0, y: y - 8, width: XW, height: 16, rx: 4, fill: 'none', stroke: MUT, 'stroke-dasharray': '4 4', opacity: o }); }
      else el('rect', { x: xo(s), y: y - 8, width: Math.max(3, xo(e) - xo(s)), height: 16, rx: 4, fill: col, opacity: rev ? o : 0.4 });
      if (rev) mono(436, y + 5, FMS[i], { 'font-size': 13.5, 'text-anchor': 'end', 'font-weight': 700, fill: col, opacity: o }); });
    // 오른쪽: beat 마다 한 가지
    const RX = 470;
    if (k === 0) { fly(230, 92, 700, 120, seg(u, 0.4, 1.4), 'RateLimitError', { fill: BAD, stay: true });
      tx(700, 176, 'chain.invoke() 가 예외를 던졌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(700, 202, '별도 로깅 없이 trace 에 자동 기록', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); }
    if (k === 1) { const o = fade(u, 1.4);
      el('rect', { x: RX, y: 60, width: 474, height: 196, rx: 12, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: o });
      tx(RX + 18, 92, 'ChatOpenAI · 220ms', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: o });
      [['error', 'RateLimitError'], ['message', 'Rate limit reached for gpt-4o-mini …'], ['input', '[SystemMessage, HumanMessage]'], ['trace', 'openai/_base_client.py …']].forEach(([a, b], i) => {
        tx(RX + 18, 126 + i * 32, a, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.5 + i * 0.2) });
        mono(RX + 96, 126 + i * 32, b, { 'font-size': 14, opacity: fade(u, 1.5 + i * 0.2) }); }); }
    if (k === 2) { mono(RX, 64, 'client.list_runs(error=True, …)', { 'font-size': 14.5, 'font-weight': 700 });
      el('path', { d: `M${RX + 10},90 H${RX + 200} L${RX + 125},170 V200 H${RX + 85} V170 Z`, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
      for (let i = 0; i < 10; i++) { const red = i % 3 === 1, f = (t * 0.55 + i / 10) % 1, x = RX + 30 + (i * 37) % 150;
        const yy = lerp(96, red ? 218 : 160, f); if (!red && f > 0.75) continue;
        el('circle', { cx: lerp(x, RX + 105, clamp((yy - 100) / 80)), cy: yy, r: 6, fill: red ? BAD : GOOD, opacity: red ? 1 : 1 - clamp((f - 0.5) * 4) }); }
      [['[ChatOpenAI] RateLimitError', 236], ['[ChatOpenAI] RateLimitError', 270], ['[VectorStoreRetriever] Timeout', 304]].forEach(([s, y], i) => {
        card(RX + 300, y, 300, 28, { rx: 6, fill: BADBG, stroke: BAD, sw: 1.4, text: s, fs: 13.5, mono: true, s: pop(u, 0.6 + i * 0.4) }); });
      tx(RX + 300, 340, '실패한 Run 만 모인다 (목록은 예시)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 3) { const cx = 707, cy = 190;
      card(cx, 92, 300, 40, { rx: 10, stroke: BAD, sw: 2, text: 'r.inputs = {"question": …}', fs: 14, mono: true, s: pop(u, 0.2) });
      card(cx, 290, 300, 40, { rx: 10, stroke: ACC, sw: 2, text: 'chain.invoke(r.inputs)', fs: 14, mono: true, s: pop(u, 0.6) });
      el('path', { d: `M${cx + 150},92 C${cx + 230},92 ${cx + 230},290 ${cx + 150},290`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 0.8) });
      el('path', { d: `M${cx - 150},290 C${cx - 230},290 ${cx - 230},92 ${cx - 150},92`, fill: 'none', stroke: GRID, 'stroke-width': 2.2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.8) });
      dot([[cx + 150, 92], [cx + 205, 120], [cx + 205, 262], [cx + 150, 290]], seg(u, 1.0, 2.0), ACC, 7);
      tx(cx, 196, '실패 당시 입력 그대로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(cx, 220, '재현 환경을 새로 만들 필요가 없다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 4) { const g = E(u, 0.2, 1.6), x0 = RX + 10, w = 300;
      tx(x0, 70, 'error_rate', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: x0, y: 84, width: w, height: 22, rx: 6, fill: SOFT });
      el('rect', { x: x0, y: 84, width: w * 0.08 * g / 0.1, height: 22, rx: 6, fill: g > 0.62 ? BAD : WARN });
      el('line', { x1: x0 + w * 0.5, y1: 76, x2: x0 + w * 0.5, y2: 114, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
      mono(x0 + w * 0.5, 130, '5%', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
      tx(x0 + w + 10, 100, '규칙: > 5%', { 'font-size': 13.5, fill: MUT });
      fly(x0 + 150, 150, RX + 230, 250, seg(u, 1.5, 2.4), '알림: error_rate > 5%', { fill: BAD, stay: true });
      card(RX + 230, 300, 220, 44, { rx: 10, stroke: INFO, sw: 2, text: 'Slack #ml-ops', fs: 15, s: pop(u, 1.3) }); }
    if (k >= 1) tx(230, 352, k === 4 ? 'trace + 에러 보존으로 장애 대응 시간이 준다' : '성공 · 실패 · 건너뜀이 한눈에', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: k === 4 ? INK : MUT, opacity: k === 1 ? fade(u, 2) : 1 }); }

  // 장면마다 확인 문제 하나 (a: 정답 번호, 0부터)
  const quiz = [
    { q: 'chain.invoke()의 결과만 print할 때 알 수 없는 것은 무엇인가?',
      o: ['최종 답변 문자열', 'retriever가 고른 문서와 단계별 소요 시간', '체인이 예외 없이 끝났는지 여부'], a: 1,
      why: 'invoke는 마지막 Parser의 출력만 돌려준다. 중간 단계의 입출력·시간·토큰은 어디에도 남지 않는다.' },
    { q: '| 로 만든 LCEL 체인의 단계별 로그를 콘솔에서 보려면 무엇을 켜야 하는가?',
      o: ['set_verbose(True)', 'chain.with_config({"verbose": True})', 'set_debug(True)'], a: 2,
      why: 'set_verbose는 옛 Chain 클래스용이고 with_config의 verbose는 RunnableConfig 키가 아니라 효과가 없다. LCEL에서는 set_debug(True)가 [chain/start] 같은 줄을 찍는다.' },
    { q: 'LangSmith trace를 켤 때 기존 체인 코드에서 바꿔야 하는 것은 무엇인가?',
      o: ['없다. LANGSMITH_* 환경변수만 넣는다', '모든 Runnable에 콜백 인자를 넣는다', '체인을 @traceable 함수로 감싸야만 기록된다'], a: 0,
      why: '환경변수 4개를 넣으면 같은 invoke가 그대로 trace로 올라간다. @traceable은 체인 밖의 함수를 트리에 더할 때 쓴다.' },
    { q: '1,432ms 걸린 trace에서 응답을 빠르게 하려면 먼저 볼 Run은 무엇인가?',
      o: ['ChatOpenAI (1,238ms, 전체의 86%)', 'VectorStoreRetriever (184ms)', 'StrOutputParser (1ms)'], a: 0,
      why: '전체 시간의 86%를 LLM 호출이 차지한다. retriever를 아무리 줄여도 184ms 안에서만 줄어든다.' },
    { q: 'ChatOpenAI에서 RateLimitError가 나면 그 trace에서 StrOutputParser는 어떻게 표시되는가?',
      o: ['성공 (초록)', '실행되지 않음 (skipped)', '실패 (빨강)'], a: 1,
      why: '앞 단계에서 예외가 나면 뒤 단계는 돌지 않는다. trace는 성공·실패·건너뜀을 나눠 어디서 멈췄는지 보여 준다.' },
  ];

  const summary = [
    'chain.invoke()만 보면 최종 문자열 하나만 남고 중간 단계는 보이지 않는다.',
    'LCEL 체인은 set_verbose로는 조용하고, set_debug(True)를 켜야 단계별 로그가 찍힌다.',
    'LANGSMITH_TRACING 등 환경변수 4개만 넣으면 코드 수정 없이 Run 트리가 기록된다.',
    'trace로 보면 1,432ms 중 ChatOpenAI가 1,238ms였고, 실패한 단계도 바로 찾는다.',
  ];
  const review = [
    { q: '운영 중 답변이 가끔 틀린다는 신고가 왔는데 로그가 없다. 먼저 할 일로 알맞은 것은?',
      o: ['LangSmith trace를 켜고 틀린 호출의 retriever 출력부터 본다', '프롬프트 문장을 바꿔 가며 다시 배포한다', 'LLM을 더 큰 모델로 바꾼다'], a: 0,
      why: 'trace에는 retriever가 고른 문서, 채워진 프롬프트, LLM 출력이 단계별로 남는다. 원인을 본 뒤에 고쳐야 헛수고가 없다.' },
    { q: '평소 1,238ms 걸리던 ChatOpenAI run이 220ms 만에 빨갛게 끝났고 전체는 412ms였다. 무슨 일인가?',
      o: ['LLM이 느려져 병목이 생겼다', 'LLM 호출이 예외로 끝나 Parser가 돌지 않았다', 'retriever가 문서를 하나도 못 찾았다'], a: 1,
      why: '빨간 run은 응답이 아니라 예외다. 짧게 끝난 것은 빨라서가 아니라 실패해서이고, 뒤의 StrOutputParser는 skipped로 남는다.' },
    { q: 'LLM 비용이 갑자기 늘었다. 어떤 요청이 원인인지 찾는 방법으로 알맞은 것은?',
      o: ['set_debug 로그를 날짜별로 grep한다', '모든 체인에 print를 넣고 다시 배포한다', 'client.list_runs에 토큰 수 filter를 걸어 run을 고른다'], a: 2,
      why: 'LangSmith는 run마다 토큰과 비용을 기록하고 filter 식으로 조건 검색을 한다. 콘솔 로그에는 토큰·비용 합계가 없다.' },
  ];

  R.page({ title: 'LangSmith trace 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
