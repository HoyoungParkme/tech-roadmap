/* I-1-2 MLOps vs LLMOps — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 위쪽 정거장 띠(파이프라인의 어느 칸인지) + 그 칸의 실제 대상(CSV 표, 트리 숲, 프롬프트 문서, 채점 칸, 별칭 화살표, 평가셋 칸).
 * 숫자는 페이지 코드·STEPS 데이터에서만 읽는다. LLM 답변과 judge 점수는 "예시" 딱지를 붙인다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, cross, check, lock, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const ex = (x, y, op) => pill(x, y, '예시', WARN, op ?? 1, { fs: 13.5 });
  // 정거장 띠: names 중 at 번째가 지금 칸
  function stations(names, at, col) { const n = names.length, w = 150, gap = (900 - n * w) / (n - 1);
    names.forEach((s, i) => { const x = 30 + i * (w + gap) + w / 2, on = i === at, done = i < at;
      card(x, 40, w, 36, { rx: 18, stroke: on ? col : done ? col : GRID, sw: on ? 2.6 : 1.6, fill: on ? (col === ACC ? ACCBG : INFOBG) : PANEL, text: s, fs: 14.5, fw: on ? 800 : 600, color: on || done ? col : MUT });
      if (i < n - 1) grow(x + w / 2 + 4, 40, x + w / 2 + gap - 4, 40, 1, done || on ? col : GRID, { plain: true, sw: 2 }); }); }
  function bubble(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 15, lh = fs + 8, h = lines.length * lh + 18, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    const total = lines.reduce((a, s) => a + s.length, 0); let left = Math.round(total * (o.f ?? 1));
    lines.forEach((s, i) => { const show = s.slice(0, Math.max(0, left)); left -= s.length; if (show) tx(x + 14, y + 13 + fs + i * lh, show, { 'font-size': fs, fill: o.color || INK, 'font-weight': 600, opacity: op }); }); return h; }

  // ---------- 1. MLOps 파이프라인 ----------
  const ST1 = ['데이터', '피처', '학습', '평가', '기록'];
  function csv(x, y, sep, enc, op) { const cols = ['x1', 'x2', '지역', 'label'], cw = 90, rh = 34, rows = 5;
    cols.forEach((s, j) => { const dx = j === 3 ? sep * 70 : 0;
      tx(x + j * cw + dx + cw / 2, y, s, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: j === 3 ? ACC : INK, class: 'mono', opacity: op });
      for (let r = 0; r < rows; r++) { const yy = y + 14 + r * rh, cx = x + j * cw + dx;
        el('rect', { x: cx + 4, y: yy, width: cw - 8, height: rh - 6, rx: 4, fill: j === 3 ? ACCBG : SOFT, stroke: GRID, opacity: op });
        if (j === 2) { if (enc > 0.5) mono(cx + cw / 2, yy + 20, r % 2 ? '0 1' : '1 0', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: op });
          else tx(cx + cw / 2, yy + 20, ['서울', '부산', '서울', '대구', '부산'][r], { 'font-size': 14, 'text-anchor': 'middle', opacity: op }); }
        else if (j === 3) mono(cx + cw / 2, yy + 20, String(r % 2), { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: op });
        else { const raw = [0.9, 0.3, 0.6, 0.15, 0.75][(r + j) % 5], v = lerp(raw * (j ? 0.4 : 1), 0.5 + (raw - 0.5) * 0.6, enc > 0 ? E(enc, 0, 0.5) : 0);
          el('rect', { x: cx + 10, y: yy + 9, width: (cw - 20) * v, height: 10, rx: 3, fill: INFO, opacity: op * 0.8 }); } } }); }
  function s1(t, c) { const { k, u } = c; stations(ST1, k, INFO);
    if (k === 0) {
      pill(480, 98, 'df = load_csv("training_data_v3.csv")', INFO, pop(u, 0.2), { mono: true, fs: 14 });
      csv(250, 150, E(u, 1.2, 2.0), 0, fade(u, 0.4));
      tx(380, 352, 'X', { 'font-size': 20, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(645, 352, 'y', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(480, 395, '이 CSV 버전(v3)이 곧 실험 조건이다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) {
      csv(250, 150, 1, E(u, 0.3, 1.8) * 2, 1);
      pill(250 + 40, 98, 'scale_features', INFO, pop(u, 0.3), { mono: true, fs: 14 }); pill(250 + 300, 98, 'encode_categorical', INFO, pop(u, 1.1), { mono: true, fs: 14 });
      sub(480, 395, '학습과 추론에서 같은 변환을 써야 한다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) {
      zone(120, 80, 720, 290, 'with mlflow.start_run():', { fill: SOFT, stroke: INFO, dash: '6 5', op: fade(u, 0.1) });
      const n = Math.round(lerp(0, 200, E(u, 0.4, 2.2)));
      for (let i = 0; i < n; i++) { const x = 160 + (i % 25) * 18, y = 130 + Math.floor(i / 25) * 28;
        el('path', { d: `M${x},${y - 9} L${x + 8},${y + 7} L${x - 8},${y + 7} Z`, fill: GOOD, opacity: 0.8 }); el('line', { x1: x, y1: y + 7, x2: x, y2: y + 12, stroke: INK, 'stroke-width': 1.5 }); }
      mono(740, 200, `${n}`, { 'font-size': 34, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      tx(740, 230, 'n_estimators', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', class: 'mono' });
      tx(725, 300, 'model.fit(X_train, y_train)', { 'font-size': 14, 'text-anchor': 'middle', class: 'mono', 'font-weight': 700, opacity: fade(u, 1.0) });
      sub(480, 400, '학습 계산은 한 번에 크게 든다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 3) {
      [0, 1, 2].forEach((i) => { const y = 120 + i * 86, s = fade(u, 0.3 + i * 0.6);
        tx(140, y + 22, `평가 ${i + 1}회`, { 'font-size': 15.5, 'font-weight': 700, opacity: s });
        [['accuracy', 0.62], ['f1', 0.48]].forEach(([n, v], j) => { const yy = y + j * 28;
          mono(300, yy + 15, n, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: s });
          el('rect', { x: 312, y: yy, width: 360 * v * E(u, 0.4 + i * 0.6, 0.9 + i * 0.6), height: 20, rx: 4, fill: INFO, opacity: 0.85 }); });
        if (i) tx(720, y + 30, '= 같은 값', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8 + i * 0.6) }); });
      sub(480, 395, '같은 모델·같은 X_test 면 숫자가 늘 같다 (막대 길이는 그림용)', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k === 4: MLflow 기록
    zone(140, 80, 420, 290, 'MLflow run', { fill: SOFT, stroke: INFO });
    [['metric', 'accuracy'], ['metric', 'f1'], ['artifact', 'model/  (.pkl)']].forEach(([a, b], i) => { const op = fade(u, 0.3 + i * 0.4);
      mono(170, 140 + i * 44, a, { 'font-size': 14.5, fill: MUT, opacity: op }); mono(290, 140 + i * 44, b, { 'font-size': 15, 'font-weight': 700, fill: i === 2 ? INFO : INK, opacity: op }); });
    const a = E(u, 1.2, 2.0); card(lerp(760, 360, a), lerp(150, 300, a), 120, 70, { rx: 8, stroke: INFO, sw: 2.5, text: 'model.pkl', fs: 15, mono: true, fw: 800, color: INFO });
    tx(760, 260, '가중치 파일이', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    tx(760, 288, '최종 산출물', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }

  // ---------- 2. LLMOps 파이프라인 ----------
  const ST2 = ['프롬프트', '평가셋', '평가 함수', '판사 채점', 'Registry'];
  function promptDoc(x, y, op, hi) { el('rect', { x, y, width: 380, height: 190, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: op });
    mono(x + 16, y + 28, 'PROMPT_V2 = """', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: op });
    ['너는 친절한 고객 상담원이다.', '아래 컨텍스트만 사용해 답하라.'].forEach((s, i) => tx(x + 16, y + 60 + i * 26, s, { 'font-size': 15, opacity: op }));
    [['컨텍스트: ', '{context}'], ['질문: ', '{question}']].forEach(([a, b], i) => { const yy = y + 124 + i * 28; tx(x + 16, yy, a, { 'font-size': 15, opacity: op });
      const bx = x + 16 + tw(a, 15); if (hi) el('rect', { x: bx - 4, y: yy - 18, width: tw(b, 15) + 8, height: 24, rx: 5, fill: ACCBG, opacity: op * hi });
      mono(bx, yy, b, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: op }); }); }
  const CASES = [['환불 정책?', ['7일', '미개봉']], ['배송 기간?', ['1~2일']]];
  function s2(t, c) { const { k, u } = c; stations(ST2, k, ACC);
    if (k === 0) { promptDoc(120, 110, fade(u, 0.2), fade(u, 1.2));
      tx(680, 190, '학습 코드가 있던 자리에', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(680, 220, '텍스트 한 덩어리', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(680, 260, '이 문자열이 곧 산출물', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) {
      CASES.forEach(([q, kw], i) => { const x = 110 + i * 300, s = pop(u, 0.2 + i * 0.4);
        card(x + 120, 170, 260, 120, { rx: 12, stroke: ACC, sw: 2, s });
        tx(x + 10, 140, q, { 'font-size': 16, 'font-weight': 800, opacity: s }); tx(x + 10, 172, 'expected_keywords', { 'font-size': 13.5, fill: MUT, class: 'mono', opacity: s });
        kw.forEach((w, j) => pill(x + 40 + j * 80, 208, w, GOOD, pop(u, 0.6 + i * 0.4 + j * 0.2), { fs: 14 })); });
      card(820, 180, 140, 110, { rx: 10, stroke: OFF, dash: '6 5', text: '학습\n데이터셋', fs: 15, color: MUT, s: pop(u, 1.5) }); cross(880, 132, 10, pop(u, 1.8));
      sub(480, 330, '정답을 외우게 하는 데이터가 아니라 채점용 케이스', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) {
      card(480, 180, 340, 90, { rx: 12, stroke: ACC, sw: 2.5, text: 'evaluate(prompt) → dict', fs: 17, mono: true, fw: 800, s: pop(u, 0.2) });
      fly(80, 180, 220, 180, seg(u, 0.6, 1.4), 'PROMPT_V2', { mono: true, stay: true });
      mono(380, 290, 'scores = [', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.4) });
      [0, 1].forEach((i) => el('rect', { x: 490 + i * 66, y: 268, width: 56, height: 30, rx: 5, fill: PANEL, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 1.6 + i * 0.2) }));
      mono(632, 290, ']', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(480, 350, '평가 대상이 모델이 아니라 프롬프트 문자열이다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 3) { ex(880, 92, pop(u, 0.1));
      const sc = [0.9, 0.7];
      CASES.forEach(([q], i) => { const y = 130 + i * 96, at = 0.2 + i * 0.8;
        tx(60, y + 5, q, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, at) });
        grow(170, y, 250, y, E(u, at, at + 0.3), MUT);
        bubble(260, y - 22, 220, ['답변 …'], { f: E(u, at + 0.2, at + 0.5) });
        grow(486, y, 560, y, E(u, at + 0.4, at + 0.6), MUT);
        card(620, y, 110, 46, { rx: 10, stroke: WARN, sw: 2.2, text: 'judge', fs: 15, fw: 800, color: WARN, s: pop(u, at + 0.4) });
        mono(720, y + 6, sc[i].toFixed(1), { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, at + 0.6) }); });
      const avg = lerp(0, 0.8, E(u, 1.9, 2.4));
      mono(480, 350, `avg = (0.9 + 0.7) / 2 = ${avg.toFixed(2)}`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 385, '같은 답을 다시 채점해도 점수가 조금씩 흔들린다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k === 4: Registry push
    zone(560, 90, 340, 270, 'LangSmith · customer_bot', { fill: SOFT, stroke: ACC });
    const a = E(u, 0.3, 1.2); card(lerp(180, 730, a), lerp(220, 150, a), 170, 50, { rx: 8, stroke: ACC, sw: 2.2, text: 'PROMPT_V2', fs: 15, mono: true, fw: 800, color: ACC });
    [['커밋 2', 'prod', 1.3], ['커밋 1', '', 0]].forEach(([n, tag, at], i) => { const y = 230 + i * 50; tx(600, y, n, { 'font-size': 15, opacity: fade(u, i ? 0.2 : at) }); if (tag) pill(800, y - 5, tag, GOOD, pop(u, at + 0.2), { mono: true, fs: 14 }); });
    tx(250, 300, '재학습 없이', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    tx(250, 328, '태그 하나로 배포 끝', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }

  // ---------- 3. 모델 소유권 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) {
      server(260, 200, '우리 서버', { lamp: GOOD, s: pop(u, 0.1) });
      card(260, 90, 140, 46, { rx: 8, stroke: INFO, sw: 2.2, text: '/models/v3.pkl', fs: 14, mono: true, s: pop(u, 0.4) });
      el('line', { x1: 330, y1: 200, x2: 560, y2: 200, stroke: MUT, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
      cross(445, 200, 12, pop(u, 1.1)); tx(445, 168, '인터넷 끊김', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      tx(660, 160, '그래도 동작', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      tx(660, 200, '같은 입력 → 같은 출력', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(660, 240, '업그레이드 시점은 우리가', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1 || k === 2) {
      const swing = k === 1 ? E(u, 1.4, 2.0) : 0;
      card(690, 120, 200, 60, { rx: 12, stroke: k === 2 ? GOOD : INK, sw: 2.4, text: '모델 A', fs: 16, fw: 800, s: 1 });
      card(690, 280, 200, 60, { rx: 12, stroke: BAD, dash: k === 1 ? null : '6 5', text: '모델 B (새 버전)', fs: 15, fw: 700, color: k === 1 ? BAD : MUT, s: k === 1 ? pop(u, 1.2) : 0.9, op: k === 2 ? 0.5 : 1 });
      const name = k === 1 ? '"gpt-4"' : '"gpt-4-0613"';
      card(220, 200, 210, 56, { rx: 28, stroke: k === 2 ? GOOD : WARN, sw: 2.5, text: 'model=' + name, fs: 15, mono: true, fw: 800, color: k === 2 ? GOOD : WARN });
      const ty = lerp(140, 262, swing); grow(330, 200, 584, ty, k === 1 ? E(u, 0.3, 0.9) : 1, swing > 0.5 ? BAD : (k === 2 ? GOOD : INK), { sw: 3 });
      if (k === 1) { tx(220, 290, '별칭(alias)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.5) });
        pill(220, 340, '우리 코드는 그대로', MUT, pop(u, 2.1), { fs: 14 }); }
      if (k === 2) { lock(584, 142, true, GOOD, pop(u, 0.3));
        [['temperature=0', 0.9], ['seed=42 (지원 모델만)', 1.4]].forEach(([s, at], i) => pill(220, 290 + i * 46, s, GOOD, pop(u, at), { mono: true, fs: 14 }));
        tx(690, 360, '언제 바꿀지 우리가 정한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 3) { ex(880, 66, pop(u, 0.1));
      tx(80, 72, '같은 snapshot · temperature 0 · 같은 질문', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.1) });
      const A = [['환불은 구매 후 ', '7일', ' 이내 가능합니다.'], ['환불은 구매 후 ', '7일', ' 이내 가능합니다.'], ['환불은 구매일로부터 ', '7일', ' 안에 됩니다.']];
      A.forEach((p, i) => { const y = 130 + i * 70, op = fade(u, 0.3 + i * 0.5), diff = i === 2;
        mono(80, y + 6, `호출 ${i + 1}`, { 'font-size': 14.5, fill: MUT, opacity: op });
        el('rect', { x: 170, y: y - 20, width: 520, height: 40, rx: 8, fill: diff ? WARNBG : SOFT, stroke: diff ? WARN : GRID, opacity: op });
        tx(186, y + 6, p.join(''), { 'font-size': 15.5, opacity: op }); });
      tx(780, 270, '드물게 문장이', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.6) });
      tx(780, 296, '달라진다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.6) });
      pill(480, 370, '고정은 완화책, 감지는 회귀 eval 이 한다', INK, pop(u, 2.2), { fs: 14.5 }); return; }
    // k === 4: 체크리스트
    tx(480, 64, '운영 체크리스트', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
    ['alias 대신 snapshot ID', 'temperature 0 + seed', '매일 회귀 eval', '점수 하락 알람', 'deprecation 일정 추적'].forEach((s, i) => { const y = 108 + i * 56, s2 = pop(u, 0.3 + i * 0.35);
      el('rect', { x: 260, y: y - 18, width: 36, height: 36, rx: 6, fill: PANEL, stroke: GOOD, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
      check(278, y, 10, s2); tx(316, y + 6, s, { 'font-size': 16.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); }); }

  // ---------- 4. 학습 데이터셋 vs 평가셋 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) {
      tx(60, 70, 'training_data', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO, opacity: fade(u, 0.1) });
      const n = Math.round(lerp(0, 100, E(u, 0.2, 1.8)));
      for (let i = 0; i < n; i++) el('rect', { x: 60 + (i % 20) * 26, y: 92 + Math.floor(i / 20) * 26, width: 22, height: 22, rx: 3, fill: INFO, opacity: 0.6 });
      sub(320, 250, '한 칸 = 10,000 행', fade(u, 0.5), { 'font-size': 14.5 });
      mono(760, 140, (n * 10000).toLocaleString('en-US') + ' 행', { 'font-size': 26, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
      tx(760, 190, '샘플 하나가 조금 틀려도', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(760, 216, '집계가 학습을 이끈다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(760, 300, '$50,000 · 라벨링 외주', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); ex(760, 336, pop(u, 2.1)); return; }
    const F = [['id', '"eval-001"'], ['question', '"환불 정책?"'], ['context', '"환불은 7일 이내 미개봉 상품만..."'], ['expected_answer', '"구매 후 7일 이내, 미개봉만 가능."']];
    if (k === 1) {
      zone(80, 70, 800, 230, null, { fill: SOFT, stroke: ACC });
      F.forEach(([a, b], i) => { const y = 112 + i * 46, op = fade(u, 0.2 + i * 0.4);
        mono(110, y, a, { 'font-size': 15, fill: MUT, opacity: op }); tx(300, y, b, { 'font-size': 15.5, 'font-weight': 700, opacity: op, fill: i === 3 ? ACC : INK }); });
      sub(480, 345, '기대 답변을 문장으로 못 적으면 그 기능은 평가할 수 없다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) {
      tx(90, 80, 'required_facts', { 'font-size': 15, class: 'mono', fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.1) });
      ['7일', '미개봉'].forEach((w, i) => pill(300 + i * 90, 75, w, GOOD, pop(u, 0.2 + i * 0.15), { fs: 15 }));
      tx(520, 80, 'forbidden', { 'font-size': 15, class: 'mono', fill: BAD, 'font-weight': 700, opacity: fade(u, 0.4) });
      ['30일', '무조건'].forEach((w, i) => pill(680 + i * 90, 75, w, BAD, pop(u, 0.5 + i * 0.15), { fs: 15 }));
      ex(880, 140, pop(u, 0.8));
      [['구매 후 7일 이내, 미개봉만 가능합니다.', true, 1.0], ['30일 이내라면 무조건 환불됩니다.', false, 1.7]].forEach(([s, ok, at], i) => { const y = 170 + i * 100;
        bubble(90, y, 520, [s], { f: E(u, at, at + 0.4), stroke: ok ? GOOD : BAD });
        if (ok) { check(660, y + 22, 13, pop(u, at + 0.4)); tx(690, y + 28, '필수 2개 포함', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, at + 0.4) }); }
        else { cross(660, y + 22, 11, pop(u, at + 0.4)); tx(690, y + 28, '금지어 2개 등장', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, at + 0.4) }); } });
      sub(480, 400, '문장 비교가 아니라 사실 포함 여부로 채점한다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 3) {
      const n = Math.round(lerp(0, 500, E(u, 0.2, 1.6)));
      for (let i = 0; i < n; i++) { const bad = i === 213 && u > 1.9; el('rect', { x: 60 + (i % 25) * 19, y: 80 + Math.floor(i / 25) * 15, width: 15, height: 11, rx: 2, fill: bad ? BAD : ACC, opacity: bad ? 1 : 0.65 }); }
      const big = tween(1000000, 500, u, 1.5);
      mono(760, 130, Math.round(big).toLocaleString('en-US'), { 'font-size': 30, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      tx(760, 160, 'size (케이스)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      tx(760, 230, '한 케이스 오류 =', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) });
      mono(760, 262, '1 / 500 = 0.2%', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
      tx(760, 290, '점수가 그만큼 틀어진다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      sub(300, 400, '도메인 전문가가 한 건씩 · 실제 질문 카테고리를 덮게', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    // k === 4: 건당 값
    ex(880, 64, pop(u, 0.1));
    tx(480, 70, '예시 금액을 한 건 값으로 나누면', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
    const W = 560, x0 = 260;
    tx(x0 - 14, 160, '학습셋 1행', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'end' });
    tx(x0 - 14, 250, '평가셋 1건', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'end' });
    el('rect', { x: x0, y: 140, width: Math.max(2, W * 0.05 / 30), height: 28, rx: 3, fill: INFO });
    mono(x0 + 14, 161, '$50,000 / 1,000,000 = $0.05', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5) });
    el('rect', { x: x0, y: 230, width: W * E(u, 0.8, 1.8), height: 28, rx: 3, fill: ACC });
    mono(x0 + W - 10, 251, '$15,000 / 500 = $30', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'end', opacity: fade(u, 1.7) });
    mono(480, 330, '30 ÷ 0.05 = 600배', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    sub(480, 370, '양이 아니라 한 건의 품질에 돈을 쓴다', fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 5. 공통점과 차이 ----------
  const ROWS = [['산출물', '모델 .pkl/.h5', '프롬프트 + RAG 인덱스'], ['자산', '학습 데이터 100만 행', 'Eval Set 500 케이스'], ['평가', 'accuracy / F1 / AUC', 'LLM-judge / RAGAS'], ['비용', '학습 시 GPU (Capex)', '호출마다 토큰 (Opex)'], ['배포', '모델 서버 재배포', '프롬프트 hot-swap'], ['디버깅', 'feature importance', 'trace + 프롬프트'], ['보안', '모델 도용', 'Prompt Injection']];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) {
      [[260, 'MLOps', '모델 공장', '우리가 모델을 만든다', INFO], [700, 'LLMOps', '프롬프트 운영실', '남의 모델을 우리 도메인에 붙인다', ACC]].forEach(([x, a, b, d, col], i) => { const s = pop(u, 0.2 + i * 0.6);
        card(x, 180, 340, 190, { rx: 16, stroke: col, sw: 2.6, s });
        tx(x, 130, a, { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', class: 'mono', opacity: s });
        tx(x, 175, b, { 'font-size': 24, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s });
        tx(x, 222, d, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.6) }); });
      tx(480, 340, '만드는 쪽이냐 붙이는 쪽이냐', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 1) {
      tx(270, 56, 'MLOps', { 'font-size': 15, 'font-weight': 800, fill: INFO, class: 'mono', opacity: fade(u, 0.1) }); tx(580, 56, 'LLMOps', { 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 0.1) });
      ROWS.forEach(([a, b, d], i) => { const y = 92 + i * 44, op = fade(u, 0.2 + i * 0.28);
        el('rect', { x: 60, y: y - 26, width: 840, height: 38, rx: 6, fill: i % 2 ? PANEL : SOFT, opacity: op });
        tx(80, y, a, { 'font-size': 15, 'font-weight': 800, opacity: op }); tx(270, y, b, { 'font-size': 15, fill: INFO, opacity: op }); tx(580, y, d, { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: op }); });
      return; }
    if (k === 2) {
      el('circle', { cx: 360, cy: 210, r: 170 * pop(u, 0.1), fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: 0.7 });
      el('circle', { cx: 600, cy: 210, r: 170 * pop(u, 0.3), fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: 0.7 });
      tx(250, 210, 'MLOps', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      tx(710, 210, 'LLMOps', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      ['CI/CD', '모니터링', '버전 관리', '회귀 테스트', 'A/B 테스트', '가드레일'].forEach((s, i) => tx(480, 112 + i * 38, s, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.22) }));
      return; }
    if (k === 3) {
      const nodes = [[110, '질문', INK, ''], [290, '임베딩 모델', INFO, 'MLOps'], [480, '벡터 DB', WARN, '공통'], [670, '프롬프트 + LLM', ACC, 'LLMOps'], [850, '답변', INK, '']];
      nodes.forEach(([x, n, col, who], i) => { const s = pop(u, 0.2 + i * 0.35);
        card(x, 190, i === 3 ? 170 : 140, 64, { rx: 12, stroke: col, sw: 2.4, text: n, fs: 15, fw: 800, color: col, s });
        if (who) pill(x, 260, who, col, pop(u, 0.5 + i * 0.35), { fs: 14 });
        if (i) grow(nodes[i - 1][0] + (i === 4 ? 85 : 70), 190, x - (i === 3 ? 85 : 70), 190, E(u, 0.3 + i * 0.35, 0.6 + i * 0.35), MUT); });
      dot(nodes.map(([x]) => [x, 190]), seg(u, 1.9, 2.8), ACC, 7);
      sub(480, 340, '실무 RAG 는 두 체계를 함께 운영한다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 4) {
      const M = [['실험 추적', 'MLflow', 'LangSmith'], ['모델 서빙', 'TorchServe', '(외부 API)'], ['데이터 라벨링', 'Label Studio', 'Argilla'], ['모니터링', 'Evidently', 'Helicone / Langfuse'], ['평가', 'sklearn metrics', 'RAGAS / DeepEval']];
      M.forEach(([a, b, d], i) => { const y = 80 + i * 62, s = pop(u, 0.2 + i * 0.3);
        tx(130, y + 5, a, { 'font-size': 14.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
        card(340, y, 190, 44, { rx: 8, stroke: INFO, text: b, fs: 15, mono: true, color: INFO, s });
        card(720, y, 220, 44, { rx: 8, stroke: ACC, text: d, fs: 15, mono: true, color: ACC, s: pop(u, 0.4 + i * 0.3) });
        grow(437, y, 608, y, E(u, 0.4 + i * 0.3, 0.8 + i * 0.3), MUT); });
      return; }
    // k === 5
    [[150, 'MLOps', '내가 만든 모델을 신뢰할 만큼', '잘 검증했나?', INFO], [270, 'LLMOps', '내가 만들지 않은 모델을', '어떻게 안전하게 붙이나?', ACC]].forEach(([y, a, b, d, col], i) => { const s = pop(u, 0.3 + i * 0.8);
      card(480, y, 640, 96, { rx: 14, stroke: col, sw: 2.5, s });
      tx(200, y + 6, a, { 'font-size': 17, 'font-weight': 800, fill: col, class: 'mono', opacity: s });
      tx(330, y - 6, b, { 'font-size': 16, opacity: s }); tx(330, y + 22, d, { 'font-size': 17, 'font-weight': 800, opacity: s }); });
    grow(480, 200, 480, 220, E(u, 1.0, 1.2), MUT); }

  const quiz = [
    { q: 'MLOps 파이프라인의 최종 산출물은 무엇인가?',
      o: ['학습된 모델 가중치 파일(model.pkl)', '프롬프트 문자열', '평가셋 500 케이스'], a: 0,
      why: 'MLOps는 데이터로 모델을 직접 학습시키고, MLflow에 남기는 가중치 파일이 산출물이다. 학습 데이터셋은 그 모델을 만드는 자산이다.' },
    { q: 'LLMOps 파이프라인에서 프롬프트를 고친 뒤 배포는 어떻게 끝나는가?',
      o: ['모델을 다시 학습해 가중치를 올린다', '평가셋으로 채점한 뒤 Registry에 prod 태그로 올린다', '학습 데이터를 늘려 재실행한다'], a: 1,
      why: '모델은 외부 API라 다시 학습할 것이 없다. evaluate로 평가셋 점수를 확인하고 push_prompt로 prod 태그를 붙이면 배포가 끝난다.' },
    { q: 'model="gpt-4"처럼 별칭으로 부를 때 생기는 위험은 무엇인가?',
      o: ['호출 비용이 두 배가 된다', '별칭이 가리키는 모델이 바뀌어도 코드는 그대로라 변화를 모른다', '응답이 JSON으로 오지 않는다'], a: 1,
      why: '별칭은 특정 모델이 아니라 이름표다. gpt-4-0613 같은 snapshot으로 고정하고, 그래도 남는 변화는 회귀 eval로 감지한다.' },
    { q: '평가셋 500 케이스 중 한 건의 정답이 틀렸다면 무엇이 문제인가?',
      o: ['학습이 느려진다', '평가셋 하나쯤은 점수에 영향이 없다', '기준 자체가 틀려 점수가 1/500 = 0.2%만큼 왜곡된다'], a: 2,
      why: '100만 행 학습셋은 집계가 오류를 덮지만, 평가셋은 한 건 한 건이 채점 기준이다. 그래서 건당 $30(예시)를 들여 전문가가 만든다.' },
    { q: 'MLOps와 LLMOps가 같은 것은 무엇인가?',
      o: ['CI/CD, 모니터링, 회귀 테스트 같은 운영 절차', '핵심 산출물', '평가 방식'], a: 0,
      why: '산출물(모델 vs 프롬프트)과 평가(F1 vs LLM-judge)는 다르지만, 운영을 자동화하는 절차는 그대로 옮겨 쓸 수 있다.' },
  ];

  const summary = [
    'MLOps는 데이터로 모델을 직접 학습시키고 그 가중치 파일을 산출물로 남긴다.',
    'LLMOps는 남의 모델을 API로 쓰므로 프롬프트와 평가셋이 산출물이자 자산이 된다.',
    '별칭 모델명은 언제든 다른 모델을 가리킬 수 있어 snapshot 고정과 회귀 eval로 막는다.',
    '평가셋은 500건이어도 한 건이 기준이라, 예시 금액으로 건당 $30을 들여 사람이 만든다.',
  ];
  const review = [
    { q: '어느 날 프롬프트를 바꾸지 않았는데 답변 형식이 달라졌다. 코드를 보니 model="gpt-4"다. 먼저 할 일은?',
      o: ['snapshot ID로 고정하고 회귀 eval을 돌려 차이를 확인한다', '모델을 다시 학습시킨다', '학습 데이터를 늘린다'], a: 0,
      why: '별칭이 다른 모델로 넘어갔을 가능성이 크다. LLMOps에는 재학습할 모델이 없으니 고정과 평가로 대응한다.' },
    { q: 'LLM 기능 평가에 쓸 예산이 생겼다. 가장 효과적인 사용처는?',
      o: ['운영 로그 100만 줄을 싸게 라벨링한다', '실제 질문 카테고리를 덮는 골든 케이스를 전문가가 만든다', '더 큰 GPU를 산다'], a: 1,
      why: 'LLMOps 자산은 학습셋이 아니라 평가셋이다. required_facts와 forbidden까지 적힌 케이스가 있어야 확률적 출력도 자동 채점된다.' },
    { q: 'RAG 서비스에서 임베딩 모델을 새로 학습했더니 답변 품질이 떨어졌다. 이 일은 누구의 책임 영역에서 시작됐나?',
      o: ['LLMOps의 프롬프트 관리', '외부 LLM 제공자', 'MLOps의 임베딩 모델 학습·배포'], a: 2,
      why: 'RAG에서 임베딩 모델은 우리가 학습하는 MLOps 영역이고, 프롬프트와 LLM 호출은 LLMOps 영역이다. 두 체계를 함께 운영해야 한다.' },
  ];

  R.page({ title: 'MLOps vs LLMOps 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
