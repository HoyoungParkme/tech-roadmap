/* I-2-1 LLM 라이프사이클 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 프롬프트 문서가 블록 단위로 자라기(설계), 평가셋 칸과 4축 점수 막대·기준선(평가),
 *       사용자 점 100개와 해시 버킷 자·증량 계단(배포), 계측 카드·스팬·drift 곡선(모니터링), 5단계 고리(루프).
 * 숫자는 페이지 코드·STEPS 데이터와 실제 실행 결과(md5 버킷)에서만 읽는다. LLM 출력·점수·지표 곡선은 "예시". */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, axes, line, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const ex = (x, y, op) => pill(x, y, '예시', WARN, op ?? 1, { fs: 13.5 });
  const head = (s, op, a) => tx(480, 44, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 프롬프트 설계 ----------
  const BLK = [
    ['# 역할', ['너는 친절한 고객 상담원이다.']],
    ['# 출력 형식', ['JSON: {{"answer", "confidence", "sources"}}']],
    ['# 제약', ['- 컨텍스트에 없는 사실은 만들지 마라', '- 모르면 confidence = "low"', '- answer 는 3문장 이내']],
    ['# 예시', ['컨텍스트: 환불은 7일 이내 미개봉만 가능', '질문: 한 달 전 산 옷 환불돼요?', '답변: {{"answer": "구매 7일이 지나…"}}']],
    ['# 실행', ['컨텍스트: {context}', '질문: {question}', '답변:']],
  ];
  function s1(t, c) { const { k, u } = c;
    el('rect', { x: 30, y: 30, width: 500, height: 370, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2 });
    mono(46, 54, k === 4 && u > 1.8 ? 'prompts/v1.txt' : 'PROMPT_V1 = """', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
    let y = 80;
    BLK.slice(0, k + 1).forEach(([h, ls], i) => { const now = i === k, op = now ? fade(u, 0.2) : 1, rows = 1 + ls.length, hh = rows * 17 + 4;
      if (now) el('rect', { x: 36, y: y - 14, width: 488 * E(u, 0.1, 0.6), height: hh, rx: 4, fill: GOODBG });
      tx(48, y, h, { 'font-size': 13.5, 'font-weight': 800, fill: MUT, opacity: op });
      ls.forEach((s, j) => { const o2 = now ? fade(u, 0.4 + j * 0.3) : 1, isVar = i === 4 && j < 2;
        tx(60, y + 17 * (j + 1), s, { 'font-size': 13.5, fill: isVar ? ACC : INK, 'font-weight': isVar ? 800 : 500, opacity: o2, class: s.startsWith('JSON') || s.startsWith('답변: {') ? 'mono' : null }); });
      y += hh + 2; });
    // 오른쪽: 이 블록이 응답에 미치는 효과 (예시)
    const X = 560;
    if (k === 0) { tx(X, 90, '응답의 말투가 정해진다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.9) });
      R.person(640, 190, '고객 상담원', { s: pop(u, 1.2) }); sub(745, 300, '뒤 지시가 이 역할 안에서 해석된다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 1) { ex(900, 76, pop(u, 0.2)); tx(X, 90, '응답 모양', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
      el('rect', { x: X, y: 110, width: 360, height: 70, rx: 8, fill: SOFT, stroke: BAD, 'stroke-dasharray': '5 4', opacity: 1 - fade(u, 1.0) });
      tx(X + 14, 150, '환불은 아마 가능할 것 같아요~', { 'font-size': 14.5, opacity: 1 - fade(u, 1.0) });
      el('rect', { x: X, y: 200, width: 360, height: 100, rx: 8, fill: PANEL, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.0) });
      ['{"answer": "…",', ' "confidence": "high",', ' "sources": ["환불 정책"]}'].forEach((s, i) => mono(X + 14, 226 + i * 24, s, { 'font-size': 14, opacity: fade(u, 1.2 + i * 0.2) }));
      check(X + 330, 222, 10, pop(u, 1.9)); sub(X + 180, 330, 'json.loads 로 바로 파싱된다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) { tx(X, 90, '환각을 줄이는 세 줄', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
      [['없는 사실 금지', 0.6], ['모르면 low', 1.1], ['3문장 이내', 1.6]].forEach(([s, at], i) => { const y = 140 + i * 66;
        card(X + 170, y, 320, 50, { rx: 10, stroke: GOOD, s: pop(u, at) }); check(X + 40, y, 9, pop(u, at)); tx(X + 64, y + 6, s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, at) }); });
      sub(X + 170, 360, '"모르면 모른다" 가 환각 대책의 절반', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 3) { ex(900, 76, pop(u, 0.2)); tx(X, 90, '같은 모양으로 맞춰진다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
      [0, 1, 2].forEach((i) => { const y = 120 + i * 76, s = pop(u, 0.6 + i * 0.35);
        card(X + 170, y + 25, 330, 56, { rx: 8, stroke: GOOD, s });
        [0, 1, 2].forEach((j) => el('rect', { x: X + 24 + j * 100, y: y + 15, width: 86, height: 20, rx: 4, fill: [ACCBG, INFOBG, GOODBG][j], stroke: [ACC, INFO, GOOD][j], opacity: s })); });
      sub(X + 170, 370, '지시 열 줄보다 예시 한 건', fade(u, 2.1), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // k === 4
    tx(X, 90, '변수 자리만 남기고 닫는다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
    [['{context}', 150, 0.6], ['{question}', 200, 0.9]].forEach(([s, y, at]) => { pill(X + 120, y, s, ACC, pop(u, at), { mono: true, fs: 15 }); });
    sub(X + 120, 245, '호출할 때마다 이 두 자리만 채운다', fade(u, 1.3), { 'font-size': 14.5 });
    card(X + 180, 290, 220, 56, { rx: 10, stroke: ACC, sw: 2.5, text: 'prompts/v1.txt', fs: 15, mono: true, fw: 800, color: ACC, s: pop(u, 1.9) });
    sub(X + 180, 350, '50% 완성이면 충분, 다듬는 건 평가에서', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 2. 평가 ----------
  const MET = [['faithfulness', 0.82, 0.85], ['answer_relevancy', 0.88, 0.80], ['context_precision', 0.79, 0.75], ['context_recall', 0.77, 0.75]];
  function grid500(x, y, n, lit, cs) { cs = cs || 13; for (let i = 0; i < n; i++) el('rect', { x: x + (i % 25) * cs, y: y + Math.floor(i / 25) * cs, width: cs - 3, height: cs - 3, rx: 2, fill: i < lit ? ACC : OFF, opacity: i < lit ? 0.9 : 0.5 }); }
  function bars(u, k) { const x0 = 330, W = 460;
    MET.forEach(([n, v, b], i) => { const y = 110 + i * 64, g = k === 3 ? E(u, 0.3 + i * 0.2, 1.2 + i * 0.2) : 1, fail = v < b;
      mono(x0 - 14, y + 18, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: x0, y, width: W, height: 26, rx: 4, fill: SOFT });
      el('rect', { x: x0, y, width: W * v * g, height: 26, rx: 4, fill: k >= 4 && fail ? BAD : ACC });
      mono(x0 + 10, y + 19, v.toFixed(2), { 'font-size': 14.5, 'font-weight': 800, fill: PANEL, opacity: g > 0.9 ? 1 : 0 });
      if (k >= 4) { const bx = x0 + W * b, op = k === 4 ? fade(u, 0.3 + i * 0.3) : 1;
        el('line', { x1: bx, y1: y - 8, x2: bx, y2: y + 34, stroke: INK, 'stroke-width': 3, opacity: op });
        mono(bx + 6, y - 2, '≥' + b.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, opacity: op }); } }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { head('eval_set = load_eval_set("v3.jsonl")', fade(u, 0.1), { class: 'mono', 'font-size': 16 });
      grid500(170, 80, Math.round(lerp(0, 500, E(u, 0.2, 1.6))), 0, 16);
      mono(800, 200, Math.round(lerp(0, 500, E(u, 0.2, 1.6))) + '', { 'font-size': 36, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      tx(800, 230, '사람이 라벨링한 케이스', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT });
      pill(800, 290, 'v3', ACC, pop(u, 1.8), { mono: true, fs: 15 }); sub(800, 330, '기준에도 버전을 붙인다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { const lit = Math.round(lerp(0, 500, E(u, 0.3, 2.4)));
      grid500(60, 80, 500, lit, 16);
      card(700, 150, 140, 64, { rx: 12, text: 'LLM', fs: 18, fw: 800 });
      for (let i = 0; i < 5; i++) dot([[470, 150], [630, 150]], ((t * 0.9 + i / 5) % 1), ACC, 5);
      mono(700, 240, `호출 ${lit} / 500`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      tx(700, 280, '평가도 실제 호출이라', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(700, 304, '토큰 비용이 든다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); return; }
    if (k === 2) { zone(160, 70, 640, 260, 'results.append({ … })', { fill: SOFT, stroke: ACC });
      [['question', '"한 달 전 산 옷 환불돼요?"', INK], ['answer', '모델이 만든 답변', ACC], ['contexts', '["환불은 7일 이내 미개봉만 가능"]', INFO], ['ground_truth', '사람이 적은 정답', GOOD]].forEach(([a, b, col], i) => { const y = 124 + i * 50, op = fade(u, 0.3 + i * 0.4);
        mono(190, y, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); tx(360, y, b, { 'font-size': 15, opacity: op }); });
      sub(480, 370, 'contexts 가 있어야 답이 근거에 있는지(faithfulness) 판정한다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 3 || k === 4) { head(k === 3 ? 'RAGAS 4축 점수' : '축마다 기준선을 못 박는다', fade(u, 0.1)); ex(880, 44, pop(u, 0.2)); bars(u, k);
      if (k === 3) sub(560, 390, '평균 하나로 뭉개지 않고 네 방향으로 본다', fade(u, 2.0), { 'font-size': 14.5 });
      else sub(560, 390, '굵은 선이 BASELINE · 미달 축은 빨강', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k === 5: 게이트
    const L = MET.map(([n, v, b]) => [`${v >= b ? '✅' : '❌'} ${n}: ${v.toFixed(2)} (≥${b})`, v >= b ? '#86efac' : '#fca5a5']).concat([['EvalFailure: v1 프롬프트 개선 필요', '#fca5a5']]);
    terminal(40, 70, 520, 250, L, lerp(0, 5, E(u, 0.2, 1.8)), { title: 'python evaluation.py', fs: 14.5 }); ex(520, 344, pop(u, 0.2));
    const shut = E(u, 1.9, 2.4);
    el('rect', { x: 640, y: 150, width: 18, height: 140, rx: 4, fill: INK });
    const ang = lerp(-80, 0, shut), g = el('g', { transform: `translate(649 168) rotate(${ang})` });
    el('rect', { x: 0, y: -9, width: 200, height: 18, rx: 4, fill: BAD }, g);
    [40, 100, 160].forEach((x) => el('rect', { x, y: -9, width: 24, height: 18, fill: PANEL }, g));
    el('rect', { x: 820, y: 168, width: 12, height: 122, rx: 3, fill: OFF });
    tx(738, 330, '배포 차단', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: shut });
    sub(738, 360, '한 축이라도 미달이면 멈춘다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 3. Canary 배포 ----------
  const CAN = [3, 27, 48, 66, 91];     // 그림의 100명 중 v2 를 받는 5명 자리 (모양만)
  function crowd100(x, y, ratio, col2) { for (let i = 0; i < 100; i++) { const on = ratio >= 1 || (ratio > 0 && (ratio >= 0.25 ? i % 4 === 0 || CAN.includes(i) : CAN.includes(i)));
      el('circle', { cx: x + (i % 10) * 26, cy: y + Math.floor(i / 10) * 26, r: 9, fill: on ? (col2 || ACC) : OFF, opacity: on ? 1 : 0.6 }); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { crowd100(80, 90, u > 1.0 ? 0.05 : 0);
      mono(150, 380, 'CANARY_RATIO = 0.05', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      [['v1-prod', 95, OFF], ['v2-canary', 5, ACC]].forEach(([n, v, col], i) => { const y = 150 + i * 90, g = E(u, 1.0, 1.8);
        mono(470, y, n, { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 600, y: y - 18, width: 300 * v / 100 * g, height: 26, rx: 4, fill: col });
        mono(600 + 300 * v / 100 * g + 8, y, v + '%', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) }); });
      sub(680, 340, '사고가 나도 95% 는 그대로', fade(u, 2.1), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { head('bucket = md5(user_id) % 100', fade(u, 0.1), { class: 'mono', 'font-size': 17 });
      const x0 = 80, W = 800, X = (b) => x0 + W * b / 100;
      el('rect', { x: x0, y: 230, width: W, height: 24, rx: 4, fill: SOFT, stroke: GRID });
      el('rect', { x: x0, y: 230, width: W * 0.05, height: 24, rx: 4, fill: ACC });
      [0, 5, 25, 50, 75, 99].forEach((v) => mono(X(v), 280, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      tx(x0 - 8, 248, 'v2', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
      [['user-40', 0, 0.3], ['user-94', 2, 0.8], ['user-7', 64, 1.3]].forEach(([n, b, at], i) => { const g = E(u, at, at + 0.6), xx = lerp(300 + i * 220, X(b) + (i === 1 ? 6 : 0), g);
        pill(300 + i * 220, 100, n, b < 5 ? ACC : INK, pop(u, at - 0.2), { mono: true, fs: 14.5 });
        grow(300 + i * 220, 118, xx, 224, g, b < 5 ? ACC : MUT);
        mono(300 + i * 220 + 70, 105, '→ ' + b, { 'font-size': 15, 'font-weight': 800, fill: b < 5 ? ACC : INK, opacity: fade(u, at + 0.5) }); });
      sub(480, 340, '같은 user_id 는 몇 번을 계산해도 같은 버킷 · 내장 hash() 는 프로세스마다 바뀐다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) { const ax = axes(130, 80, 600, 260, { x: [0, 8], y: [0, 100], xt: [1, 3, 7], yt: [0, 25, 50, 100], xl: 'Day', yl: 'v2 비율 (%)', grid: true });
      line(ax, [[1, 5], [3, 5], [3, 25], [7, 25], [7, 100], [8, 100]], E(u, 0.2, 2.0), ACC, { sw: 3.5 });
      [[1, 5, '5% canary', 0.4], [3, 25, '25% rollout', 1.1], [7, 100, '100% production', 1.8]].forEach(([d, v, s, at]) => {
        el('circle', { cx: ax.X(d), cy: ax.Y(v), r: 7 * pop(u, at), fill: ACC }); tx(ax.X(d) + 12, ax.Y(v) - 12, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, at), 'text-anchor': d === 7 ? 'end' : 'start' }); });
      sub(845, 200, '올릴 날을', fade(u, 2.2), { 'font-size': 15 }); sub(845, 224, '미리 적어 둔다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 3) { const r = u < 0.8 ? 0.05 : 0;
      crowd100(80, 90, r);
      mono(640, 150, 'CANARY_RATIO', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      mono(640, 200, tween(0.05, 0.0, u > 0.6 ? u - 0.5 : 0, 0.5).toFixed(2), { 'font-size': 38, 'font-weight': 800, fill: u > 1.0 ? GOOD : ACC, 'text-anchor': 'middle' });
      tx(640, 270, '모두 v1-prod 로', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(640, 304, '재배포·재빌드 없이 한 줄', fade(u, 1.6), { 'font-size': 15 }); return; }
    // k === 4: 트리거
    ex(880, 44, pop(u, 0.1)); head('하나라도 넘으면 사람 판단 없이 rollback', fade(u, 0.1));
    const G = [['error rate', 1.2, 2, '%', 3.1], ['p95 latency', 2.4, 5, 's', 3.4], ['quality', 0.84, 0.85, '', 0.84], ['PagerDuty', 0, 1, '', 0]];
    G.forEach(([n, a, th, unit, b], i) => { const y = 100 + i * 66, x0 = 230, W = 420, max = th * 2 || 1, v = i === 0 ? lerp(a, b, E(u, 1.0, 1.8)) : a, over = i === 0 && v > th;
      tx(x0 - 14, y + 18, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' });
      el('rect', { x: x0, y, width: W, height: 26, rx: 4, fill: SOFT });
      if (i < 3) { el('rect', { x: x0, y, width: W * clamp(v / max), height: 26, rx: 4, fill: over ? BAD : i === 2 ? GOOD : ACC });
        el('line', { x1: x0 + W / 2, y1: y - 6, x2: x0 + W / 2, y2: y + 32, stroke: INK, 'stroke-width': 2.5 });
        mono(x0 + W + 10, y + 18, (i === 2 ? '< baseline' : '> ' + th + unit), { 'font-size': 14, fill: MUT }); }
      else mono(x0 + 10, y + 18, '알람 0건', { 'font-size': 14.5, fill: MUT }); });
    banner(480, 380, 'error rate 2% 초과 → rollback()', pop(u, 2.0)); }

  // ---------- 4. 모니터링 ----------
  const MC = [['Counter', 'llm_calls_total', 'model, status'], ['Histogram', 'llm_latency_seconds', 'model'], ['Histogram', 'llm_input_tokens', 'model'], ['Histogram', 'llm_output_tokens', 'model']];
  function metricCards(op, hot) { MC.forEach(([a, b, l], i) => { const x = 130 + i * 233, s = typeof op === 'function' ? op(i) : 1, o = typeof op === 'function' ? s : op;
    card(x, 80, 215, 76, { rx: 10, stroke: hot === i ? ACC : GRID, sw: hot === i ? 2.5 : 1.6, s, op: o });
    tx(x - 96, 64, a, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: s * o }); mono(x - 96, 88, b, { 'font-size': 13.5, 'font-weight': 800, opacity: s * o });
    mono(x - 96, 108, `{${l}}`, { 'font-size': 13.5, fill: INFO, opacity: s * o }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { metricCards((i) => pop(u, 0.2 + i * 0.35));
      sub(480, 210, 'model 라벨로 모델별로 쪼개 볼 수 있다', fade(u, 1.8), { 'font-size': 15 });
      tx(480, 290, '토큰을 재지 않으면 비용 급등의 원인을 나중에 못 찾는다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 1 || k === 2) { metricCards(0.45, 0); const err = k === 2;
      const x0 = 120, W = 600, span = E(u, 0.2, 1.6);
      tx(x0, 190, 'traced_call', { 'font-size': 14.5, 'font-weight': 800, class: 'mono' });
      el('rect', { x: x0, y: 200, width: W * span, height: 28, rx: 5, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
      tx(x0 + 40, 254, 'llm.complete', { 'font-size': 14, class: 'mono', opacity: fade(u, 0.4) });
      el('rect', { x: x0 + 40, y: 262, width: (W - 80) * E(u, 0.4, 1.4), height: 24, rx: 5, fill: err ? BADBG : GOODBG, stroke: err ? BAD : GOOD, 'stroke-width': 2 });
      mono(x0 + W - 4, 190, 'llm_latency.time()', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 0.3) });
      if (!err) { pill(840, 214, 'status="ok" +1', GOOD, pop(u, 1.6), { mono: true, fs: 14 });
        ex(880, 300, pop(u, 1.7)); [0.3, 0.7, 1, 0.5, 0.2].forEach((h, i) => el('rect', { x: 760 + i * 22, y: 380 - 60 * h * E(u, 1.8, 2.4), width: 18, height: 60 * h * E(u, 1.8, 2.4), fill: INFO, opacity: 0.8 }));
        tx(816, 400, '토큰 분포', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
      else { cross(x0 + W - 60, 274, 9, pop(u, 1.4)); pill(840, 214, 'status="err" +1', BAD, pop(u, 1.7), { mono: true, fs: 14 });
        grow(x0 + 200, 300, x0 + 200, 360, E(u, 2.0, 2.4), BAD); mono(x0 + 214, 360, 'raise  (삼키지 않고 다시 던진다)', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
      return; }
    if (k === 3) { ex(880, 44, pop(u, 0.1)); head('매일 trace 1% 를 judge 로 다시 채점', fade(u, 0.1));
      const ax = axes(110, 80, 640, 260, { x: [1, 30], y: [0.6, 1.0], xt: [1, 10, 20, 30], yt: [0.7, 0.8, 0.9, 1.0], xl: '일', yl: 'today_avg', grid: true });
      const Q = [0.88, 0.89, 0.87, 0.88, 0.9, 0.88, 0.87, 0.89, 0.88, 0.88, 0.89, 0.87, 0.88, 0.9, 0.89, 0.88, 0.87, 0.88, 0.89, 0.88, 0.88, 0.87, 0.86, 0.85, 0.84, 0.83, 0.83, 0.82, 0.81, 0.8].map((v, i) => [i + 1, v]);
      el('line', { x1: ax.X(1), y1: ax.Y(0.88), x2: ax.X(30), y2: ax.Y(0.88), stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
      el('line', { x1: ax.X(1), y1: ax.Y(0.836), x2: ax.X(30), y2: ax.Y(0.836), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.5) });
      tx(ax.X(30) + 8, ax.Y(0.88) + 5, '30일 기준선', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(ax.X(30) + 8, ax.Y(0.836) + 18, '× 0.95', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5) });
      line(ax, Q, E(u, 0.6, 2.2), INK, { sw: 2.5 });
      if (u > 2.2) { el('circle', { cx: ax.X(30), cy: ax.Y(0.8), r: 8, fill: BAD }); pill(ax.X(26), ax.Y(0.74), 'Quality drift 알람', BAD, pop(u, 2.2), { fs: 14 }); }
      return; }
    // k === 4: 알람 정책 + 대시보드
    [['p95 latency > 5s', 'Warning', WARN], ['error rate > 1%', 'Critical', BAD], ['cost > 평소 × 3', 'Anomaly', INFO], ['quality drift > 5%', 'Investigate', ACC]].forEach(([a, b, col], i) => { const y = 92 + i * 58, s = pop(u, 0.2 + i * 0.3);
      card(130, y, 220, 44, { rx: 22, stroke: col, sw: 2.2, text: b, fs: 15, fw: 800, color: col, s }); mono(260, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); });
    zone(560, 70, 370, 270, 'Grafana · 패널 6개', { fill: SOFT });
    ['Request rate', 'Latency p50/95/99', 'Error rate', 'Token cost $/h', 'Quality score', 'Cache hit ratio'].forEach((s, i) => { const x = 580 + (i % 2) * 175, y = 104 + Math.floor(i / 2) * 76, op = fade(u, 1.2 + i * 0.15);
      el('rect', { x, y, width: 160, height: 64, rx: 6, fill: PANEL, stroke: GRID, opacity: op }); tx(x + 8, y + 20, s, { 'font-size': 13.5, 'font-weight': 700, opacity: op });
      el('polyline', { points: [0, 1, 2, 3, 4, 5].map((j) => `${x + 10 + j * 28},${y + 50 - [6, 10, 7, 12, 9, 11][(j + i) % 6]}`).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: op }); });
    sub(745, 372, '선 모양은 그림용', fade(u, 2.0), { 'font-size': 13.5 }); }

  // ---------- 5. 루프 ----------
  const LOOP = ['1. Prompt Design', '2. Evaluation', '3. Canary Deploy', '4. Monitoring', '5. Regression'];
  const ART = ['prompts/v1.txt', 'eval_report.json', 'tag=prod', 'dashboards', 'v3 + eval v4'];
  const CX = 400, CY = 215, RX = 250, RY = 150;
  const pos = (i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [CX + RX * Math.cos(a), CY + RY * Math.sin(a)]; };
  function ring(on, art) { LOOP.forEach((s, i) => { const [x, y] = pos(i), hot = on.includes(i);
      card(x, y, 170, 46, { rx: 23, stroke: hot ? ACC : GRID, sw: hot ? 2.6 : 1.6, fill: hot ? ACCBG : PANEL, text: s, fs: 14.5, fw: 800, color: hot ? ACC : MUT });
      if (art) mono(x, y + 42, ART[i], { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: art(i) }); }); }
  const arc = (i, j, u, col) => { const [a, b] = pos(i), [p, q] = pos(j), dx = p - a, dy = q - b, L = Math.hypot(dx, dy), o = 50 / L; grow(a + dx * o * 1.2, b + dy * o, p - dx * o * 1.2, q - dy * o, u, col || MUT); };
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { ring([0, 1]); arc(0, 1, E(u, 0.3, 1.0), ACC); pill(820, 120, 'Eval Set v4 갱신', ACC, pop(u, 1.3), { fs: 14.5 });
      sub(800, 300, '새 프롬프트도 첫 관문은 평가', fade(u, 1.9), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { ring([1, 2]); arc(0, 1, 1); arc(1, 2, E(u, 0.3, 1.0), GOOD); check(pos(1)[0] + 30, (pos(1)[1] + pos(2)[1]) / 2 + 10, 11, pop(u, 0.9));
      ['5%', '25%', '100%'].forEach((s, i) => pill(800 + i * 0, 140 + i * 50, s, ACC, pop(u, 1.2 + i * 0.3), { mono: true, fs: 15 }));
      sub(800, 320, '통과한 버전만 트래픽을 받는다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { ring([3, 4, 0]); [[0, 1], [1, 2], [2, 3]].forEach(([a, b]) => arc(a, b, 1)); arc(3, 4, E(u, 0.3, 0.9), BAD); arc(4, 0, E(u, 1.2, 2.0), ACC);
      pill(pos(3)[0] - 90, pos(3)[1] + 50, '⚠ drift', BAD, pop(u, 0.4), { fs: 14.5 });
      sub(820, 200, '끝이 다시 처음으로', fade(u, 2.1), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { ring([0, 1, 2, 3, 4], (i) => fade(u, 0.3 + i * 0.35)); [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]].forEach(([a, b]) => arc(a, b, 1));
      sub(820, 200, '단계마다 파일이 남는다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); sub(820, 226, '전부 버전 관리 대상', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 4) { ring([]); [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]].forEach(([a, b]) => arc(a, b, 1));
      [['일간', 'drift 체크'], ['주간', '새 케이스 편입'], ['월간', '프롬프트 버전 검토'], ['분기', '모델 snapshot 갱신']].forEach(([a, b], i) => { const y = 100 + i * 64, s = pop(u, 0.3 + i * 0.35);
        card(800, y, 220, 50, { rx: 10, stroke: ACC, s }); tx(706, y + 6, a, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: s }); tx(756, y + 6, b, { 'font-size': 14.5, opacity: s }); });
      return; }
    // k === 5
    ring([Math.floor((t * 1.2) % 5)]); [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]].forEach(([a, b]) => arc(a, b, 1));
    const P = [0, 1, 2, 3, 4, 0].map(pos); dot(P, (t * 0.24) % 1, ACC, 8);
    tx(CX, CY - 8, '모델 · 사용자 · 요건이', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.4) });
    tx(CX, CY + 18, '계속 바뀐다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) });
    banner(790, 390, '한 번 배포로 끝나지 않는다', pop(u, 1.4)); }

  const quiz = [
    { q: 'PROMPT_V1에 JSON 예시를 넣고 .format()으로 채울 때 반드시 해야 하는 일은 무엇인가?',
      o: ['JSON을 작은따옴표로 바꾼다', 'JSON의 중괄호를 {{ }}로 두 번 쓴다', 'format 대신 + 로 이어 붙인다'], a: 1,
      why: '.format()은 { }를 변수 자리로 읽는다. 이스케이프하지 않으면 KeyError가 나서 프롬프트가 한 번도 만들어지지 않는다.' },
    { q: 'RAGAS 4축 중 faithfulness가 0.82, 기준선이 0.85이고 나머지는 통과했다. 어떻게 되는가?',
      o: ['평균이 높으니 배포한다', 'faithfulness만 빼고 배포한다', 'EvalFailure로 배포가 멈춘다'], a: 2,
      why: '코드는 하나라도 기준선 아래면 예외를 던진다. 점수는 예시지만 규칙은 "모든 축 통과"다.' },
    { q: 'canary 대상을 hash(user_id) % 100으로 정하면 생기는 문제는 무엇인가?',
      o: ['서버가 재시작되면 같은 사용자가 다른 버전으로 갈 수 있다', '계산이 너무 느리다', '5%보다 훨씬 많은 사용자가 v2를 받는다'], a: 0,
      why: '파이썬 내장 hash()는 프로세스마다 문자열 해시가 달라진다. md5 같은 고정 해시를 쓰면 user-40은 늘 버킷 0, user-7은 늘 64다.' },
    { q: 'daily_quality_check에서 알람이 울리는 조건은 무엇인가?',
      o: ['오늘 오류가 한 건이라도 나면', '오늘 평균 점수가 30일 기준선의 95% 아래로 내려가면', '토큰 수가 어제보다 늘면'], a: 1,
      why: 'trace 1%를 judge로 다시 채점해 today_avg < baseline × 0.95면 알람을 보낸다. 모델이 조용히 바뀌어도 이 지표가 먼저 움직인다.' },
    { q: '모니터링에서 drift가 잡히면 다음은 어디로 가는가?',
      o: ['회귀 단계에서 새 프롬프트를 만들고 다시 평가부터 거친다', '바로 100% 배포한다', '모니터링을 끈다'], a: 0,
      why: '라이프사이클은 고리다. 새 v3도 평가 게이트와 canary를 다시 지나야 트래픽을 받는다.' },
  ];

  const summary = [
    '프롬프트는 역할, 출력 형식, 제약, 예시, 변수 자리를 갖춘 명세로 쓴다.',
    '평가셋 500건에 돌려 RAGAS 네 축이 모두 기준선을 넘어야 배포로 간다.',
    '배포는 고정 해시로 5%만 먼저 보내고, 문제가 보이면 비율을 0으로 돌린다.',
    '운영 중에는 호출·지연·토큰·품질을 재고, drift가 보이면 다시 설계로 돌아간다.',
  ];
  const review = [
    { q: 'v2를 5%에 배포했는데 같은 고객이 새로고침할 때마다 다른 말투의 답을 받는다고 한다. 먼저 의심할 것은?',
      o: ['평가셋이 너무 작다', '버킷을 프로세스마다 달라지는 hash()로 나누고 있다', 'RAGAS 기준선이 낮다'], a: 1,
      why: '같은 사용자는 늘 같은 버전을 봐야 한다. 서버마다 다른 hash() 값 때문에 버킷이 흔들리면 v1과 v2를 오간다.' },
    { q: '평가는 통과했는데 배포 후 2주째 judge 평균이 조금씩 떨어진다. 무엇을 할까?',
      o: ['새로 들어온 질문 유형을 평가셋에 넣고 v3를 만들어 평가부터 다시 돌린다', '평가 기준선을 낮춰 알람을 끈다', '즉시 100%로 올린다'], a: 0,
      why: '평가셋이 못 잡은 입력이 운영에서 드러난 것이다. 그 케이스를 편입해야 다음 회귀 평가가 같은 실수를 잡는다.' },
    { q: 'canary 25% 단계에서 error rate가 2%를 넘었다. 가장 먼저 할 일은?',
      o: ['원인을 다 찾을 때까지 그대로 둔다', '100%로 올려 데이터를 더 모은다', 'CANARY_RATIO를 0으로 돌려 모두 v1로 보낸다'], a: 2,
      why: '되돌릴 조건을 미리 정해 둔 이유가 이것이다. 한 줄 rollback으로 피해를 멈춘 뒤 원인은 평가 단계에서 찾는다.' },
  ];

  R.page({ title: 'LLM 라이프사이클 루프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
