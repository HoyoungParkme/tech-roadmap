/* V-2-1 서빙 패턴 — FastAPI·배치 추론 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   숫자 출처: 장면 3 의 [32, 8] 은 venv torch 2.15 + asyncio 로 배칭 워커를 돌려 40건을 한꺼번에 넣은 결과,
   장면 4 의 977·196 배치는 ceil(1,000,000/1024)·ceil(200,000/1024). 시간 막대는 모양을 보이는 그림이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, card, mono, sub, pill, grow, dot, fly, cells, zone, check, cross, lock, clock, server, dbIcon, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  function fileIcon(cx, cy, name, col, s, note) { const g = R.G(cx, cy, s ?? 1), c = col || INK;
    el('path', { d: 'M-22,-28 H10 L22,-16 V28 H-22 Z', fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    [-6, 4, 14].forEach((y) => el('line', { x1: -12, y1: y, x2: 10, y2: y, stroke: c, 'stroke-width': 2, opacity: 0.5 }, g));
    if (name) tx(0, 48, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: c, class: 'mono' }, g);
    if (note) tx(0, 67, note, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }

  // =========================================================
  // 1. 서버가 뜰 때 한 번 — 모든 요청이 한 모델을 공유
  // =========================================================
  const TL = [[60, '서버 시작'], [250, 'lifespan: load · eval'], [470, 'yield'], [700, '요청 · 요청 · 요청'], [900, 'ml.clear()']];
  function timeline(n, u) { el('line', { x1: 50, y1: 52, x2: lerp(50, 920, n >= 5 ? 1 : (TL[Math.max(0, n - 1)][0] + 30) / 920), y2: 52, stroke: MUT, 'stroke-width': 2.5 });
    TL.slice(0, n).forEach(([x, s], i) => { el('circle', { cx: x, cy: 52, r: 6, fill: i === 2 ? GOOD : INK }); tx(x, 34, s, { 'font-size': 13.5, 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle', fill: i === 2 ? GOOD : MUT, 'font-weight': 700 }); }); }
  function mlDict(filled, s) { card(560, 190, 190, 86, { rx: 12, stroke: filled ? ACC : INK, fill: filled ? ACCBG : PANEL, s: s ?? 1 });
    mono(475, 168, 'ml = {', { 'font-size': 15, 'font-weight': 700 }); mono(498, 196, filled ? '"model": model' : '', { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); mono(475, 222, '}', { 'font-size': 15, 'font-weight': 700 }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [['asynccontextmanager', INFO], ['torch', ACC], ['FastAPI', GOOD], ['BaseModel', WARN]].forEach(([s, col], i) => pill(180 + i * 200, 200, s, col, pop(u, 0.3 + i * 0.35), { mono: true, fs: 15 }));
      sub(480, 270, 'lifespan · 모델 · 서버 · 요청 검증 — 도구 네 개', fade(u, 1.9), { 'font-size': 15, fill: INK }); return; }
    timeline(k === 1 ? 1 : k === 2 ? 2 : k <= 5 ? 3 : 5, u);
    dbIcon(110, 200, 'model.ts', { stroke: INK }); server(320, 200, 'FastAPI 앱', { lamp: k >= 3 ? GOOD : OFF });
    if (k === 1) { card(800, 160, 230, 44, { rx: 10, text: 'cuda.is_available()', mono: true, fs: 14.5, s: pop(u, 0.2) });
      [['"cuda"', 120, OFF], ['"cpu"', 230, INFO]].forEach(([s, y, col], i) => { grow(800, 182, 740 + i * 120, y - 20, E(u, 0.6, 1.0), col); pill(740 + i * 120, y, s, col, pop(u, 0.9), { mono: true, fs: 14.5 }); });
      sub(800, 290, '이 환경(venv)은 CPU 라 cpu', fade(u, 1.3), { 'font-size': 14 });
      mlDict(false, pop(u, 1.6)); sub(560, 270, '모든 요청이 볼 저장소 하나', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    mlDict(k >= 3, 1);
    if (k === 2) { dot([[150, 200], [262, 200]], seg(u, 0.3, 1.2), ACC, 8); fly(110, 200, 320, 130, seg(u, 0.3, 1.4), 'torch.jit.load', { mono: true, stay: true });
      mono(320, 300, '로드 1회', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      card(800, 320, 240, 60, { rx: 10, text: '요청 핸들러 안에서\ntorch.load() 금지', fs: 14.5, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.0) }); return; }
    if (k === 3) { fly(380, 200, 560, 200, seg(u, 0.6, 1.4), 'model.eval()', { mono: true, fill: GOOD });
      pill(560, 290, 'yield — 이제 요청을 받는다', GOOD, pop(u, 1.8), { fs: 14.5 }); return; }
    if (k === 4) { card(800, 130, 240, 44, { rx: 10, text: 'FastAPI(lifespan=…)', mono: true, fs: 14.5, stroke: GOOD, s: pop(u, 0.2) });
      mono(690, 220, '{"features": [0.1, 0.4, …]}', { 'font-size': 14, fill: INK, opacity: fade(u, 0.8) }); check(915, 214, 9, pop(u, 1.1));
      mono(690, 260, '{"features": "abc"}', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.4) }); mono(880, 260, '422', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      sub(800, 310, 'class Req(BaseModel) — 검증은 pydantic 이', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 5) { tx(700, 120, '전처리 = 학습 때와 같은 상수', { 'font-size': 15, 'font-weight': 700 });
      [['학습', '(x − mean) / std', GOOD], ['서빙', '(x − mean) / std', GOOD], ['서빙 (틀림)', '(x − 0) / 1', BAD]].forEach(([a, b, col], i) => { const y = 170 + i * 48;
        mono(700, y, a, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) }); mono(815, y, b, { 'font-size': 14.5, fill: col, opacity: fade(u, 0.3 + i * 0.5) }); });
      sub(810, 330, '에러 없이 정확도만 조용히 떨어진다', fade(u, 1.8), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); return; }
    // k6: 요청들이 한 모델을 공유
    for (let i = 0; i < 5; i++) { const y = 110 + i * 52; person(880, y, null, { s: 0.55 });
      dot([[850, y], [600, 200]], ((t * 0.7 + i / 5) % 1), INFO, 5); }
    grow(380, 200, 465, 200, 1, MUT);
    pill(700, 360, 'with torch.inference_mode(): ml["model"](x)', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
    sub(320, 360, '디스크 읽기는 시작할 때 한 번뿐', fade(u, 1.2), { 'font-size': 14.5, fill: INK }); }

  // =========================================================
  // 2. 이벤트 루프 — 블로킹과 처방
  // =========================================================
  const RQ = [['R1', ACC], ['R2', INFO], ['R3', WARN], ['R4', GOOD]];
  const LX = 170, TW = 720;
  function lane(y, name, col) { tx(30, y + 20, name, { 'font-size': 15, 'font-weight': 700, fill: col || INK }); el('rect', { x: LX, y, width: TW, height: 30, rx: 6, fill: SOFT }); }
  function bar(y, a, b, col, u, label) { const w = (b - a) * TW * clamp(u); if (w <= 0) return; el('rect', { x: LX + a * TW, y: y + 3, width: w, height: 24, rx: 4, fill: col, opacity: 0.85 });
    if (label && u > 0.6 && (b - a) * TW > 34) mono(LX + a * TW + 6, y + 21, label, { 'font-size': 13.5, fill: PANEL, 'font-weight': 700 }); }
  function arrivals(u) { RQ.forEach(([n, col], i) => { const x = LX + i * 0.06 * TW; el('line', { x1: x, y1: 92, x2: x, y2: 116, stroke: col, 'stroke-width': 3, opacity: fade(u, 0.1 + i * 0.1) }); mono(x, 86, n, { 'font-size': 14, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: fade(u, 0.1 + i * 0.1) }); });
    tx(LX + TW, 86, '시간 → (그림)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
  function s2(t, c) { const { k, u } = c;
    if (k < 6) { arrivals(k === 0 ? u : 3); lane(130, '이벤트 루프'); }
    if (k === 0 || k === 1) { // 양보하는 핸들러: 짧은 조각들이 번갈아
      const segs = [[0, 0.06, 0], [0.06, 0.12, 1], [0.12, 0.18, 2], [0.18, 0.24, 3], [0.36, 0.42, 0], [0.42, 0.48, 1], [0.5, 0.56, 2], [0.56, 0.62, 3]];
      segs.forEach(([a, b, i], j) => bar(130, a, b, RQ[i][1], k === 0 ? E(u, 0.3 + j * 0.2, 0.5 + j * 0.2) : 1, RQ[i][0]));
      if (k === 0) { sub(530, 220, 'await 에서 양보 — 한 루프가 요청을 번갈아 처리한다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
      card(480, 270, 330, 70, { rx: 12, text: '@app.post("/bad")\nasync def bad(req): …', mono: true, fs: 14.5, stroke: BAD, s: pop(u, 0.3) });
      sub(480, 340, 'async def = 루프 위에서 직접 돈다 (빠르다는 뜻이 아니다)', fade(u, 1.2), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2 || k === 3) { const g = k === 2 ? E(u, 0.2, 2.2) : 1;
      [0, 1, 2, 3].forEach((i) => bar(130, i * 0.22, i * 0.22 + 0.2 * (i === 0 ? 1 : 1), RQ[i][1], clamp(g * 4 - i), RQ[i][0] + ' model(x)'));
      for (let i = 1; i < 4; i++) { const wait = clamp(g * 4 - 0.2) > 0 ? 1 : 0; el('rect', { x: LX + i * 0.06 * TW, y: 180 + i * 20, width: Math.max(0, (i * 0.22 - i * 0.06) * TW * clamp(g * 2)), height: 12, rx: 3, fill: BAD, opacity: 0.35 * wait }); }
      tx(LX, 270, '빨간 띠 = 루프가 막혀 기다린 시간', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
      if (k === 2) { pill(700, 320, '동시성 → 사실상 1', BAD, pop(u, 2.0), { fs: 15 }); return; }
      card(330, 345, 300, 54, { rx: 10, text: 'def _infer(features):  # 동기', mono: true, fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 0.4) });
      fly(LX + 40, 145, 330, 345, seg(u, 0.2, 0.9), 'model(x)', { mono: true, fill: INFO });
      sub(720, 360, '무거운 일을 떼어 내야 옮길 수 있다', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); return; }
    // k4~6: 스레드풀 / def / workers
    if (k <= 5) { lane(220, '스레드풀', INFO);
      [0, 1, 2, 3].forEach((i) => { bar(130, i * 0.06, i * 0.06 + 0.04, RQ[i][1], k === 4 ? E(u, 0.2 + i * 0.15, 0.4 + i * 0.15) : 1); });
      [0, 1, 2, 3].forEach((i) => bar(220, i * 0.06 + 0.04 + i * 0.16, i * 0.06 + 0.04 + i * 0.16 + 0.18, RQ[i][1], k === 4 ? E(u, 0.6 + i * 0.3, 1.0 + i * 0.3) : 1, RQ[i][0]));
      tx(LX, 290, '루프 칸은 짧게 비고, 추론은 다른 실행 흐름에서', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: k === 4 ? fade(u, 1.6) : 1 });
      if (k === 4) card(480, 350, 520, 46, { rx: 10, text: 'await loop.run_in_executor(None, _infer, …)', mono: true, fs: 14.5, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
      else { card(480, 350, 420, 46, { rx: 10, text: 'def good_b(req):   # async 없음', mono: true, fs: 14.5, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
        sub(480, 395, 'FastAPI 가 알아서 스레드풀에서 돌린다', fade(u, 1.0), { 'font-size': 14.5, fill: INK }); }
      return; }
    // k6: GIL · workers
    lock(110, 210, true, WARN, pop(u, 0.2)); tx(140, 216, 'GIL — 파이썬 스레드는 한 번에 하나', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
    for (let w = 0; w < 4; w++) { const y = 250 + w * 38, a = 0.8 + w * 0.3; tx(30, y + 20, `워커 ${w + 1}`, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) });
      el('rect', { x: LX, y, width: TW * E(u, a, a + 0.4), height: 28, rx: 6, fill: SOFT });
      bar(y - 1, 0.05 + w * 0.03, 0.3 + w * 0.03, ACC, E(u, a + 0.2, a + 0.6)); bar(y - 1, 0.45 + w * 0.02, 0.7 + w * 0.02, INFO, E(u, a + 0.4, a + 0.8)); }
    pill(700, 210, 'uvicorn … --workers 4', ACC, pop(u, 0.6), { mono: true, fs: 14.5 }); }

  // =========================================================
  // 3. 동적 배칭 — 5ms 창에 모아 한 번에
  // =========================================================
  function gpu(x, y, lit, u) { tx(x, y - 12, 'GPU 연산 칸 32 (그림)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < 32; i++) { const r = Math.floor(i / 8), c = i % 8, on = i < lit * clamp(u ?? 1);
      el('rect', { x: x + c * 26, y: y + r * 26, width: 22, height: 22, rx: 3, fill: on ? ACC : SOFT, stroke: on ? 'none' : GRID, opacity: on ? 0.85 : 1 }); } }
  function qbox(n, o) { o = o || {}; el('rect', { x: 330, y: 160, width: 300, height: 64, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(338, 150, 'queue: asyncio.Queue', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: o.op ?? 1 });
    for (let i = 0; i < Math.min(n, 18); i++) el('circle', { cx: 348 + (i % 18) * 15.5, cy: 192, r: 6, fill: INFO }); if (n > 18) mono(620, 197, `${n}`, { 'font-size': 14, 'text-anchor': 'end', fill: INFO, 'font-weight': 800 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { gpu(640, 150, 1, 1); for (let i = 0; i < 5; i++) { const a = 0.2 + i * 0.45; dot([[60, 200], [640, 200]], seg(u, a, a + 0.4), INFO, 7); }
      person(60, 200, '요청', { s: 0.8 }); mono(380, 180, 'model(x) × 요청 수', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5) });
      sub(745, 300, '한 번에 1칸만 쓰고 31칸이 논다', fade(u, 1.6), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { const g = E(u, 0.3, 1.3);
      tx(160, 120, 'MAX_BATCH', { 'font-size': 16, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle' }); cells(40, 150, Array(8).fill(''), { w: 26, h: 26, gap: 4, style: (i) => ({ fill: i < 8 * g ? ACC : PANEL, stroke: i < 8 * g ? ACC : GRID }) });
      mono(160, 210, '= 32 건이 차면', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(700, 120, 'MAX_WAIT', { 'font-size': 16, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle' }); clock(700, 175, 34, E(u, 0.6, 1.8), WARN);
      mono(700, 240, '= 5 ms 가 지나면', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      pill(430, 175, '먼저 오는 쪽에 flush', INK, pop(u, 1.9), { fs: 15 });
      sub(430, 320, '크게 잡으면 지연·메모리↑, 길게 잡으면 한산할 때 손해', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { qbox(0, { op: fade(u, 0.2) }); person(110, 192, '핸들러', { s: 0.8 }); card(830, 192, 150, 56, { rx: 10, text: 'batch_worker', mono: true, fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 0.8) });
      grow(150, 192, 320, 192, E(u, 1.0, 1.5), INFO); mono(235, 180, 'put', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      grow(640, 192, 750, 192, E(u, 1.3, 1.8), ACC); mono(695, 180, 'get', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      sub(480, 300, '둘은 큐 하나로만 만난다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    card(830, 192, 150, 56, { rx: 10, text: 'batch_worker', mono: true, fs: 14.5, stroke: ACC, color: ACC });
    if (k === 3) { qbox(0); fly(360, 192, 830, 280, seg(u, 0.3, 1.0), 'items[0]', { mono: true, fill: INFO, stay: true });
      clock(830, 100, 26, E(u, 1.0, 2.6) * 0.6, WARN); mono(870, 105, 'start', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) });
      sub(480, 360, 'await queue.get() — 첫 1건이 오면 5ms 창이 열린다', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { const n = Math.round(lerp(40, 8, E(u, 0.4, 1.8))); qbox(n);
      mono(480, 110, '한꺼번에 40건이 들어오면', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.1) });
      cells(160, 270, ['32', '8'], { w: 110, h: 40, fs: 16, style: (i) => ({ op: fade(u, 1.0 + i * 0.8), stroke: i ? WARN : ACC, color: i ? WARN : ACC }) });
      tx(160, 340, '1번 창: 32건이 차서 닫힘', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.2) }); tx(160, 364, '2번 창: 남은 8건, 시간이 다 돼 닫힘', { 'font-size': 14, fill: WARN, opacity: fade(u, 2.0) });
      sub(700, 360, 'asyncio 로 실제 돌린 결과 [32, 8]', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 5) { gpu(640, 260, 32, E(u, 0.8, 1.6));
      cells(330, 130, Array(8).fill('x'), { w: 30, h: 30, gap: 3, fs: 13.5, style: (i) => ({ op: 1, stroke: INFO, color: INFO, s: lerp(1, 0.9, E(u, 0.2, 0.6)) }) });
      mono(460, 120, 'torch.stack(...) → (32, F)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      grow(470, 200, 630, 300, E(u, 0.6, 1.0), ACC); pill(380, 260, 'model(batch) 한 번', ACC, pop(u, 1.0), { mono: true, fs: 15 });
      sub(380, 330, '호출 32번 → 1번', fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 6) { for (let i = 0; i < 8; i++) { const y = 110 + i * 34; card(240, y, 120, 26, { rx: 6, text: `future ${i + 1}`, mono: true, fs: 13.5, stroke: i < 8 * E(u, 0.6, 2.0) ? GOOD : GRID, color: INK, sw: 1.5 });
        dot([[755, 192], [302, y]], seg(u, 0.4 + i * 0.18, 0.9 + i * 0.18), GOOD, 5); }
      mono(480, 380, 'for it, y in zip(items, out): set_result(...)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6) });
      tx(240, 72, '… 32개 중 8개', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); return; }
    // k7: 핸들러 쪽
    person(110, 192, 'predict()', { s: 0.8 });
    card(330, 192, 150, 50, { rx: 10, text: E(u, 1.4, 1.8) > 0.5 ? 'future ✓' : 'future …', mono: true, fs: 15, stroke: E(u, 1.4, 1.8) > 0.5 ? GOOD : WARN, s: pop(u, 0.2) });
    grow(150, 192, 252, 192, E(u, 0.3, 0.6), INFO); grow(408, 192, 750, 192, E(u, 0.6, 1.0), INFO); mono(580, 180, 'queue.put', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle' });
    dot([[755, 205], [410, 205]], seg(u, 1.0, 1.5), GOOD, 6);
    sub(330, 280, 'await fut — 직접 추론하지 않고 양보하며 기다린다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); }

  // =========================================================
  // 4. 오프라인 배치 잡 — 100만 건과 재시작
  // =========================================================
  const GX = 40, GY = 90, CS = 13;   // 50×20 칸, 한 칸 = 1,000건
  function idGrid(done, todoHi, u) { for (let i = 0; i < 1000; i++) { const r = Math.floor(i / 50), c = i % 50, d = i < done;
      el('rect', { x: GX + c * CS, y: GY + r * CS, width: CS - 2, height: CS - 2, rx: 2, fill: d ? GOOD : todoHi ? WARN : SOFT, opacity: d ? 0.75 : todoHi ? 0.5 + 0.4 * clamp(u ?? 1) : 1 }); }
    tx(GX, GY - 14, '고객 ID 1,000,000 (한 칸 = 1,000)', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { idGrid(0, false); fileIcon(780, 140, 'done_ids.txt', INK, pop(u, 0.4), '체크포인트'); fileIcon(780, 300, 'scores.parquet', ACC, pop(u, 0.9), '결과');
      card(400, 380, 300, 40, { rx: 20, text: 'API 서버가 아니라 스크립트 하나', fs: 14.5, stroke: MUT, s: pop(u, 1.5) }); return; }
    if (k === 1) { const g = E(u, 0.2, 1.6); idGrid(Math.floor(800 * g), false); if (u > 1.7) { cross(GX + 50 * CS * 0 + 10 * CS, GY + 16 * CS + 6, 14, pop(u, 1.7)); mono(400, 380, '800,000 건에서 죽었다', { 'font-size': 16, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle' }); }
      fileIcon(780, 160, 'done_ids.txt', INK, 1); mono(780, 260, 'set(800,000개)', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(780, 300, '파일이 없으면 set()', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 2) { idGrid(800, true, E(u, 0.3, 1.0)); mono(400, 380, '남은 건수: 200000 / 전체 1000000', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) });
      card(825, 200, 220, 64, { rx: 12, text: 'todo = 전체 − done', mono: true, fs: 15, stroke: WARN, s: pop(u, 0.5) });
      sub(825, 260, '처음부터가 아니라 이어서', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3) { idGrid(800, true); for (let b = 0; b < 4; b++) { const s = pop(u, 0.4 + b * 0.3); el('rect', { x: GX + b * 3 * CS - 1, y: GY + 16 * CS - 1, width: 3 * CS - 1, height: 4 * CS, rx: 3, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: s }); }
      card(825, 160, 236, 56, { rx: 12, text: 'DataLoader(batch_size=1024)', mono: true, fs: 13.5, stroke: ACC, s: pop(u, 0.2) });
      mono(825, 240, '200,000 / 1024 → 196 배치', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) });
      mono(825, 270, '(전체였다면 977 배치)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) }); return; }
    if (k === 4) { const g = E(u, 0.2, 2.6); idGrid(800 + Math.floor(120 * g), true);
      card(825, 180, 220, 70, { rx: 12, text: 'model.eval()\ninference_mode', mono: true, fs: 14.5, stroke: GOOD });
      for (let i = 0; i < 4; i++) dot([[GX + 25 * CS, GY + 18 * CS], [712, 180]], ((t * 0.8 + i / 4) % 1), ACC, 5);
      sub(825, 270, '그래프를 만들지 않아 메모리가 안정적', fade(u, 1.2), { 'font-size': 14 }); return; }
    if (k === 5) { const ax = R.axes(110, 90, 480, 230, { x: [0, 10], y: [0, 10], xl: '처리한 배치 →', yl: '메모리 (그림)' });
      R.line(ax, [[0, 1], [10, 10]], E(u, 0.3, 1.5), BAD); R.line(ax, [[0, 1], [10, 1]], E(u, 0.6, 1.8), GOOD, { sw: 3.5 });
      tx(ax.X(4), ax.Y(7.5), '리스트에 쌓으면', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(ax.X(10) - 6, ax.Y(1) - 12, '배치마다 append', { 'font-size': 14, fill: GOOD, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 1.8) });
      fileIcon(780, 170, 'scores.parquet', ACC, 1); for (let i = 0; i < 3; i++) fly(620, 300, 780, 180, seg(u, 0.4 + i * 0.6, 0.9 + i * 0.6), 'df', { mono: true });
      sub(780, 290, '배치마다 append — 메모리는 한 배치만큼', fade(u, 1.6), { 'font-size': 14 }); return; }
    // k6
    idGrid(960, true); fileIcon(780, 140, 'done_ids.txt', INK, 1);
    for (let i = 0; i < 3; i++) fly(GX + 47 * CS, GY + 19 * CS, 780, 150, seg(u, 0.3 + i * 0.5, 0.8 + i * 0.5), '+1024 ID', { mono: true, fill: GOOD });
    sub(780, 260, '저장에 성공한 ID 만 이어 쓴다', fade(u, 1.0), { 'font-size': 14.5, fill: INK });
    card(780, 320, 260, 48, { rx: 10, text: '죽어도 다음 실행은 그다음 배치부터', fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 1.8) }); }

  // =========================================================
  // 5. 서빙 스택 — 네 칸을 채운다
  // =========================================================
  const COL = [['FastAPI 직접', '어떤 모델이든', '손으로 구현', '프로토타입·소규모·복잡한 전후처리', GOOD], ['TorchServe', 'PyTorch 전용', '기본 내장', '순수 PyTorch 프로덕션', WARN], ['Triton', 'PT · TF · ONNX', '기본 내장', '대규모 GPU·최고 성능', INFO], ['ONNX Runtime', '프레임워크 독립', '엔진 최적화', '경량·엣지·CPU', ACC]];
  const ROWS = ['프레임워크', '동적 배칭', '맞는 곳'];
  function s5(t, c) { const { k, u } = c, n = Math.min(k, 4);
    ROWS.forEach((r, i) => tx(30, 170 + i * 80, r, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: k === 0 ? fade(u, 0.3 + i * 0.3) : 1 }));
    for (let j = 0; j < 4; j++) { const x = 250 + j * 190, [name, fw, bt, use, col] = COL[j], on = j < n, fresh = j === n - 1 && k <= 4;
      card(x, 92, 176, 50, { rx: 10, text: name, fs: 15.5, stroke: on ? col : GRID, color: on ? INK : OFF, fill: on ? PANEL : SOFT, s: fresh ? pop(u, 0.2) : 1 });
      [fw, bt, use].forEach((s, i) => { const y = 165 + i * 80; el('rect', { x: x - 88, y: y - 28, width: 176, height: 62, rx: 8, fill: on ? PANEL : SOFT, stroke: GRID, 'stroke-width': 1 });
        if (!on) return; const op = fresh ? fade(u, 0.6 + i * 0.4) : 1, words = s.split('·');
        if (i === 2 && s.length > 12) { const mid = Math.ceil(words.length / 2); [words.slice(0, mid).join('·'), words.slice(mid).join('·')].forEach((w, q) => tx(x, y - 6 + q * 22, w, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: op })); }
        else tx(x, y + 5, s, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': i === 1 ? 700 : 400, fill: i === 1 && s === '손으로 구현' ? WARN : INK, opacity: op }); }); }
    if (k === 0) sub(540, 400, '유연 ↔ 전용 ↔ 고성능 ↔ 경량', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 5) { el('rect', { x: 162, y: 60, width: 760, height: 330, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
      sub(540, 412, '얼마나 크고, 팀이 무엇을 감당할 수 있는가로 고른다', fade(u, 0.8), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); } }

  const quiz = [
    { q: 'FastAPI 서버에서 모델을 로드하기에 알맞은 곳은 어디인가?',
      o: ['/predict 핸들러 안 — 요청마다 최신 파일을 읽도록', 'lifespan 블록 — 서버가 뜰 때 한 번만', '전처리 함수 안'], a: 1,
      why: '요청마다 torch.load 하면 매번 디스크를 읽고 장치로 올려 응답이 느려지고 메모리가 터진다. 한 번 로드한 ml["model"]을 모든 요청이 공유한다.' },
    { q: 'async def 핸들러 안에서 model(x)를 그냥 부르면 무슨 일이 생기는가?',
      o: ['추론 동안 이벤트 루프 전체가 멈춰 다른 요청이 줄을 선다', 'FastAPI가 자동으로 스레드풀로 옮긴다', 'GPU가 여러 요청을 동시에 처리한다'], a: 0,
      why: 'model(x)에는 await 양보 지점이 없다. run_in_executor로 넘기거나 동기 def 핸들러로 선언해야 루프가 풀린다.' },
    { q: 'MAX_BATCH=32, MAX_WAIT=5ms인 배칭 워커에 요청 40건이 한꺼번에 들어오면 배치는 어떻게 나뉘는가?',
      o: ['40건 한 배치', '5ms마다 1건씩 40배치', '32건, 8건 두 배치'], a: 2,
      why: '첫 창은 32건이 차는 순간 닫히고, 남은 8건은 다음 창에서 시간이 다 되어 닫힌다. 실제로 돌린 결과도 [32, 8] 이었다.' },
    { q: '100만 건 스코어링이 80만 건에서 죽었다. 재시작 설계가 된 잡은 다시 실행하면 어떻게 하는가?',
      o: ['done_ids.txt를 읽어 남은 20만 건만 처리한다', '처음부터 100만 건을 다시 처리한다', 'parquet 파일을 지우고 처음부터 한다'], a: 0,
      why: '배치마다 저장에 성공한 ID를 체크포인트에 이어 쓰므로, todo = 전체 − done으로 남은 것만 돈다.' },
    { q: 'PyTorch·TensorFlow·ONNX 모델을 큰 GPU 클러스터 한 서버에서 굴려야 한다. 알맞은 선택은?',
      o: ['FastAPI 직접', 'Triton Inference Server', 'TorchServe'], a: 1,
      why: 'Triton은 여러 프레임워크를 한 서버에서 돌리고 동적 배칭을 config.pbtxt로 선언한다. TorchServe는 PyTorch 전용이다.' },
  ];

  const summary = [
    '모델은 lifespan에서 한 번 로드해 eval()로 두고, 모든 요청이 그 하나를 함께 쓴다.',
    'async 핸들러에서 추론을 그냥 부르면 루프가 멈추니 스레드풀로 넘기거나 def로 선언한다.',
    '요청을 5ms 창에 최대 32건까지 모으면 model 호출 한 번으로 여러 건을 처리한다.',
    '밤샘 배치 잡은 결과를 배치마다 흘려 쓰고, 처리한 ID를 남겨 죽어도 이어서 돈다.',
  ];
  const review = [
    { q: '부하 테스트에서 동시 요청이 늘수록 응답 시간이 요청 수에 비례해 늘었다. 먼저 볼 곳은?',
      o: ['async def 핸들러 안에서 model(x)를 직접 부르는지', 'MAX_WAIT가 5ms 인지', 'done_ids.txt가 있는지'], a: 0,
      why: '루프가 추론마다 막히면 요청이 한 줄로 서서 지연이 쌓인다. 스레드풀로 넘기거나 def 핸들러로 바꾼다.' },
    { q: '동적 배칭을 붙였더니 한밤중 한산한 시간에 요청마다 지연이 조금 늘었다. 이유로 맞는 것은?',
      o: ['배치가 32건이라 메모리가 넘쳐서', '요청이 적어 배치가 차지 않고 매번 MAX_WAIT 만큼 기다려서', 'lifespan에서 모델을 다시 읽어서'], a: 1,
      why: '창은 32건이 차거나 5ms가 지나야 닫힌다. 요청이 드물면 시간 쪽 조건으로만 닫혀 그만큼 대기가 붙는다.' },
    { q: '새벽 스코어링 잡이 매번 중간에 메모리 부족으로 죽는다. 고칠 방향으로 맞는 것은?',
      o: ['batch_size를 1로 줄여 실시간 API로 바꾼다', '결과를 리스트에 모았다가 끝에 한 번에 저장한다', '결과를 배치마다 파일에 append하고 처리한 ID를 체크포인트로 남긴다'], a: 2,
      why: '배치마다 흘려 쓰면 메모리는 한 배치 크기로 유지된다. 체크포인트가 있으면 죽어도 남은 것부터 잇는다.' },
  ];

  R.page({ title: '서빙 패턴', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
