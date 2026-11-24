/* V-1-2 TF Serving·TFLite·TF.js 배포 지도 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * TFLite 크기는 파라미터 311만 개 MLP 를 venv(TF 2.21)에서 실제로 변환해 잰 값, 정확도·예측 확률은 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, grow, fly, dot, zone, cross, check, terminal, server, person, hbar, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function doc(cx, cy, w, h, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), f = Math.min(w, h) * 0.3, c = o.stroke || INK;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - f} L${w / 2},${-h / 2 + f} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: c, 'stroke-width': o.sw || 2, 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash }, g);
    el('path', { d: `M${w / 2 - f},${-h / 2} V${-h / 2 + f} H${w / 2}`, fill: 'none', stroke: c, 'stroke-width': o.sw || 2 }, g); return g; }
  function folder(cx, cy, w, h, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), c = o.stroke || INK, t = h * 0.22;
    el('path', { d: `M${-w / 2},${-h / 2 + t} V${h / 2} H${w / 2} V${-h / 2 + t} H${-w / 2 + w * 0.42} L${-w / 2 + w * 0.34},${-h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: c, 'stroke-width': o.sw || 2, 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash }, g); return g; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. TF Serving ----------
  const VST = { retired: [OFF, '은퇴'], serving: [GOOD, '서빙 중'], incoming: [ACC, '핫스왑 대기'] };
  const FY = (i) => 112 + i * 96;
  function s1(t, c) { const { k, u } = c, vs = c.beat.serving.versions, pv = (c.prev && c.prev.serving && c.prev.serving.versions) || [];
    zone(20, 30, 260, 356, 'saved_model/', { fill: SOFT });
    vs.forEach((v, i) => { const [col, tag] = VST[v.state] || VST.retired, isNew = i >= pv.length && k > 0, f = isNew ? seg(u, 0.3, 1.1) : 1;
      const y = isNew ? lerp(FY(i) + 60, FY(i), E(f, 0, 1)) : FY(i);
      folder(92, y, 76, 56, { stroke: col, dash: v.state === 'incoming' ? '6 4' : null, sw: 2.4 });
      mono(92, y + 10, v.v + '/', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: col });
      if (f >= 1) { tx(146, y - 6, tag, { 'font-size': 15, 'font-weight': 700, fill: col }); const m = /(\d+\.\d)%/.exec(v.note);
        if (m) mono(146, y + 16, '정확도 ' + m[1] + '% (예시)', { 'font-size': 13.5, fill: MUT }); } });
    if (k === 0) { note(150, 352, '숫자 큰 폴더 = 현재 서빙', fade(u, 1.0), { 'text-anchor': 'middle', 'font-size': 14 }); return; }
    if (k === 1) { note(150, 410, '폴더 복사만으로 새 버전 감지', fade(u, 1.4), { 'text-anchor': 'middle', 'font-size': 14, fill: ACC }); return; }
    // 컨테이너
    const up = k === 2 ? pop(u, 0.2) : 1;
    card(500, 210, 250, 230, { rx: 14, stroke: INK, sw: 2.5, s: up });
    tx(500, 120, 'tensorflow/serving', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: fade(up, 0.5, 0.3) });
    mono(500, 142, '/models/iris', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(up, 0.5, 0.3) });
    grow(282, 170, 374, 170, k === 2 ? E(u, 0.6, 1.0) : 1, MUT, { dash: '5 4', plain: true });
    const ports = [['REST', ':8501', INFO, 186], ['gRPC', ':8500', GOOD, 262]];
    ports.forEach(([p, n, col, y], i) => { const s = k === 2 ? pop(u, 1.0 + i * 0.35) : 1;
      card(625, y, 86, 44, { rx: 8, stroke: col, fill: col === INFO ? INFOBG : GOODBG, sw: 2.2, s });
      mono(625, y - 3, p, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s }); mono(625, y + 15, n, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: s }); });
    if (k === 2) { mono(500, 380, 'docker run -p 8501:8501 -p 8500:8500 ... tensorflow/serving', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) });
      note(500, 410, '서버 코드 0줄', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); return; }
    person(870, 186, '클라이언트', {});
    if (k === 6) { ['배치 묶기', '동시성', '헬스체크', '메트릭', '버전 감지'].forEach((s, i) => { const y = 172 + i * 26; check(400, y - 5, 7, pop(u, 0.3 + i * 0.2)); tx(416, y, s, { 'font-size': 14, 'font-weight': 600, opacity: fade(u, 0.3 + i * 0.2) }); });
      card(790, 330, 220, 50, { rx: 8, dash: '6 5', stroke: BAD, text: 'FastAPI 로 직접 작성', fs: 14, color: BAD, s: pop(u, 1.5) }); cross(926, 330, 12, pop(u, 1.9));
      note(500, 404, '이미지 하나에 프로덕션 기능이 들어 있다', fade(u, 2.2), { 'text-anchor': 'middle', fill: GOOD }); return; }
    const url = k === 5 ? 'POST /v1/models/iris/versions/2:predict' : 'POST /v1/models/iris:predict';
    mono(940, 64, url, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: INFO, opacity: k === 3 || k === 5 ? fade(u, 0.3) : 1 });
    card(770, 334, 330, 40, { rx: 8, text: '{"instances": [[5.1, 3.5, 1.4, 0.2]]}', fs: 13.5, mono: true, fw: 600, stroke: INFO, op: k === 3 ? fade(u, 0.7) : 1 });
    if (k === 3) { dot([[840, 186], [668, 186]], seg(u, 1.4, 2.4), INFO, 7); note(770, 384, 'instances 배열에 입력을 담는다', fade(u, 1.0), { 'text-anchor': 'middle', 'font-size': 14 }); return; }
    if (k === 4) { dot([[668, 186], [840, 186]], seg(u, 0.2, 0.9), GOOD, 7);
      card(770, 386, 330, 40, { rx: 8, text: '{"predictions": [[0.97, 0.02, 0.01]]}', fs: 13.5, mono: true, fw: 600, stroke: GOOD, color: GOOD, s: pop(u, 0.9) });
      [0.97, 0.02, 0.01].forEach((p, i) => { el('rect', { x: 730 + i * 34, y: 258 - 70 * p * E(u, 1.2, 1.9) - 10, width: 24, height: Math.max(2, 70 * p * E(u, 1.2, 1.9)), rx: 3, fill: GOOD, opacity: 0.85 }); });
      sub(780, 268, '예시 값 · 서명 출력 그대로', fade(u, 2.0)); return; }
    // k5: 버전 지정 → 2/
    dot([[840, 186], [668, 186], [470, 186], [300, FY(1)], [130, FY(1)]], seg(u, 0.6, 2.2), INFO, 7);
    if (u > 2.2) el('rect', { x: 46, y: FY(1) - 34, width: 220, height: 64, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2.5 });
    note(500, 404, '버전을 골라 A/B 비교·롤백 검증', fade(u, 2.2), { 'text-anchor': 'middle', fill: INFO }); }

  // ---------- 2. TFLite 변환 ----------
  const BITS = { 'float32 (원본)': 32, 'float16': 16, 'dynamic range int8': 8, 'full int8': 8 };
  const GCOL = { base: INK, f16: INFO, dyn: ACC, int8: GOOD };
  function s2(t, c) { const { k, u } = c, gs = c.beat.convert.gauges, pg = (c.prev && c.prev.convert && c.prev.convert.gauges) || [];
    if (k < 5) { folder(80, 76, 70, 52, {}); mono(80, 126, 'saved_model/2', { 'font-size': 13.5, 'text-anchor': 'middle' });
      grow(122, 76, 186, 76, k === 0 ? E(u, 0.3, 0.7) : 1, MUT);
      card(290, 76, 200, 46, { rx: 8, text: 'TFLiteConverter', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.6) : 1 });
      grow(394, 76, 460, 76, k === 0 ? E(u, 1.0, 1.4) : 1, MUT);
      doc(492, 76, 40, 52, { stroke: GOOD, s: k === 0 ? pop(u, 1.4) : 1 }); mono(492, 126, '.tflite', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: k === 0 ? fade(u, 1.5) : 1 });
      sub(700, 70, 'FlatBuffer 한 파일', k === 0 ? fade(u, 1.6) : 1, { 'font-size': 14 }); }
    if (k === 0) { note(480, 260, '출발점은 V-1-1 에서 만든 바로 그 폴더', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { // 메모리 맵
      doc(80, 84, 46, 60, { stroke: GOOD }); mono(80, 134, '.tflite', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD });
      card(560, 70, 280, 40, { rx: 8, text: '역직렬화 → 객체로 복사', fs: 14, stroke: GRID, color: MUT, s: pop(u, 0.3) }); cross(720, 70, 10, pop(u, 0.8));
      grow(110, 76, 412, 70, E(u, 0.3, 0.8), GRID, { dash: '5 4', plain: true });
      card(560, 140, 280, 40, { rx: 8, text: '메모리 맵 — 바이트를 그대로 읽음', fs: 14, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.0) }); check(720, 140, 9, pop(u, 1.4));
      grow(110, 96, 412, 140, E(u, 1.0, 1.5), GOOD);
      sub(860, 112, '로딩이 빠르고 가볍다', fade(u, 1.6), { 'font-size': 14 }); }
    // 크기 막대
    const top = 172;
    gs.forEach((g, i) => { const y = top + i * 56, was = pg.find((p) => p.name === g.name), s = was || k === 5 ? 1 : E(u, 0.3, 1.6), col = GCOL[g.tone] || INK;
      tx(30, y + 14, g.name, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: was ? 1 : fade(u, 0.2) });
      sub(30, y + 34, g.quant, was ? 1 : fade(u, 0.4), { 'text-anchor': 'start' });
      const b = BITS[g.name] || 32; for (let q = 0; q < b; q++) el('rect', { x: 250 + q * 5.2, y: y, width: 4.2, height: 18, rx: 1, fill: col, opacity: (was ? 1 : clamp(s * 1.6 - q / b)) * 0.8 });
      mono(250 + b * 5.2 + 6, y + 14, b + 'bit', { 'font-size': 13.5, fill: col, opacity: was ? 1 : fade(u, 0.6) });
      hbar(450, y, 380, g.mb * s, c.beat.convert.maxMb, { col, h: 20, text: (g.mb * s).toFixed(1) + 'MB' }); });
    if (k === 4) { pill(740, top + 3 * 56 + 42, '활성값까지 int8 · 대표 데이터 필요', WARN, pop(u, 1.8), { fs: 13.5, fill: WARNBG }); }
    tx(30, 412, '크기는 파라미터 311만 개 MLP 를 TF 2.21 로 실제 변환해 잰 값', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 1.8) : 1 }); }

  // ---------- 3. Interpreter 와 함정 ----------
  const FLOW = ['Interpreter(model_path)', 'allocate_tensors()', 'set_tensor(input, x)', 'invoke()', 'get_tensor(output)'];
  function cellsRow(x, y, vals, o) { o = o || {}; vals.forEach((v, i) => card(x + i * 62, y, 56, 36, { rx: 5, text: v == null ? '' : String(v), fs: 14, mono: true, fw: 700, stroke: o.col || INK, fill: v == null ? PANEL : (o.fill || PANEL), dash: v == null ? '4 4' : null, color: o.col || INK, s: o.s ? o.s(i) : 1 })); }
  function s3(t, c) { const { k, u } = c, n = c.beat.runtime.flow.length, pn = (c.prev && c.prev.runtime) ? c.prev.runtime.flow.length : 0;
    if (k <= 3) {
      zone(20, 30, 520, 360, 'tf.lite.Interpreter', { fill: SOFT });
      doc(80, 110, 44, 58, { stroke: GOOD, s: k === 0 ? pop(u, 0.3) : 1 }); mono(80, 160, 'model_dyn.tflite', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, opacity: k === 0 ? fade(u, 0.5) : 1 });
      grow(110, 110, 170, 110, k === 0 ? E(u, 0.7, 1.1) : 1, GOOD); sub(140, 96, 'mmap', k === 0 ? fade(u, 1.0) : 1);
      card(340, 110, 290, 60, { rx: 10, text: '그래프 + 가중치 (메모리 맵)', fs: 14, stroke: GOOD, color: GOOD, fill: GOODBG, s: k === 0 ? pop(u, 1.1) : 1 });
      if (k >= 1) { tx(60, 210, '입력 버퍼 [1, 4] float32', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 1 ? fade(u, 0.4) : 1 });
        cellsRow(84, 244, k >= 2 ? [5.1, 3.5, 1.4, 0.2].map((v, i) => (k === 2 && u < 0.4 + i * 0.25 ? null : v)) : [null, null, null, null], { col: INFO, fill: INFOBG, s: (i) => (k === 1 ? pop(u, 0.5 + i * 0.1) : 1) });
        tx(60, 306, '출력 버퍼 [1, 3]', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: k === 1 ? fade(u, 1.0) : 1 });
        cellsRow(84, 340, [null, null, null], { col: GOOD, s: (i) => (k === 1 ? pop(u, 1.1 + i * 0.1) : 1) });
        if (k === 3) { dot([[84, 244], [340, 200], [340, 140], [440, 200], [146, 340]], seg(u, 0.2, 1.4), ACC, 7);
          [0.32, 0.35, 0.33].forEach((h, i) => { const s = E(u, 1.4 + i * 0.15, 1.9 + i * 0.15); el('rect', { x: 64 + i * 62, y: 354 - 30 * s, width: 40, height: 30 * s, rx: 3, fill: GOOD, opacity: 0.6 }); });
          mono(300, 345, '→ 확률 3개 회수', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) }); } }
      if (k === 2) { const f = seg(u, 1.6, 2.2); if (f > 0) { pill(lerp(470, 380, f), 244, 'float64', BAD, 1, { mono: true, fs: 13.5, fill: BADBG }); if (f >= 1) cross(380, 220, 9, pop(u, 2.2)); }
        mono(300, 296, 'Got FLOAT64 but expected FLOAT32', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.3) }); }
      // 오른쪽: 정형 4단계
      tx(580, 60, '정형 실행 흐름', { 'font-size': 15, 'font-weight': 700 });
      FLOW.forEach((f, i) => { const on = i < n, isNew = i >= pn && on, s = isNew ? pop(u, 0.2) : 1, y = 98 + i * 58;
        card(750, y, 320, 42, { rx: 21, text: f, fs: 14, mono: true, fw: 700, stroke: on ? (i === 4 ? GOOD : ACC) : GRID, color: on ? INK : OFF, fill: on ? PANEL : PANEL, dash: on ? null : '5 4', s });
        if (i > 0) grow(750, y - 37, 750, y - 23, on ? 1 : 0, on ? ACC : GRID); });
      return; }
    if (k === 4) { // 미지원 연산자
      el('circle', { cx: 300, cy: 210, r: 170 * pop(u, 0.2), fill: SOFT, stroke: GRID, 'stroke-width': 2 }); tx(300, 28, 'TF 연산 전체', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
      el('circle', { cx: 270, cy: 230, r: 90 * pop(u, 0.5), fill: GOODBG, stroke: GOOD, 'stroke-width': 2.5 }); tx(270, 236, 'TFLite 내장 op', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.7) });
      el('circle', { cx: 400, cy: 140, r: 9 * pop(u, 1.0), fill: BAD }); mono(414, 126, '내장에 없는 op', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.0) });
      el('circle', { cx: 270, cy: 230, r: lerp(90, 160, E(u, 1.6, 2.2)), fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 1.6) });
      tx(700, 120, 'SELECT_TF_OPS (Flex)', { 'font-size': 15, 'font-weight': 800, fill: WARN, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      sub(700, 146, 'TF 연산을 끌어와 우회', fade(u, 1.6), { 'font-size': 14 });
      tx(560, 250, '앱 바이너리', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.9) });
      el('rect', { x: 660, y: 236, width: 120, height: 20, rx: 4, fill: GOOD, opacity: fade(u, 1.9) * 0.8 });
      el('rect', { x: 780, y: 236, width: 120 * E(u, 2.1, 2.6), height: 20, rx: 4, fill: WARN, opacity: 0.8 }); sub(840, 280, '커진다', fade(u, 2.5), { fill: WARN }); return; }
    if (k === 5) { // 캘리브레이션
      tx(40, 60, 'representative_dataset — 실제 입력 200개', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < 24; i++) { const f = seg(u, 0.2 + i * 0.05, 0.8 + i * 0.05); if (f > 0 && f < 1) el('circle', { cx: lerp(60, 420, f), cy: 120 + (i % 5) * 18, r: 5, fill: INFO, opacity: 0.7 }); }
      card(480, 160, 120, 140, { rx: 10, text: '모델\n(float)', fs: 15, mono: true, fw: 800 });
      const ax = R.axes(600, 110, 300, 160, { x: [-4, 4], y: [0, 1], xl: '활성값', yl: '' });
      const H = [0.05, 0.12, 0.3, 0.6, 0.9, 1, 0.75, 0.45, 0.2, 0.08], hu = E(u, 0.8, 2.0);
      H.forEach((h, i) => el('rect', { x: ax.X(-3.6 + i * 0.75), y: ax.Y(h * hu), width: 20, height: ax.Y(0) - ax.Y(h * hu), rx: 2, fill: INFO, opacity: 0.55 }));
      [[-3.6, 'min'], [3.9, 'max']].forEach(([v, s], i) => { const o = fade(u, 2.0 + i * 0.2); el('line', { x1: ax.X(v), y1: 104, x2: ax.X(v), y2: 270, stroke: WARN, 'stroke-width': 2.5, opacity: o }); mono(ax.X(v), 98, s, { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: o }); });
      note(600, 340, '범위를 재야 int8 눈금(scale)을 정한다', fade(u, 2.3), { fill: WARN });
      sub(250, 340, '난수로 때우면 범위가 어긋난다', fade(u, 1.4), { 'font-size': 14, fill: BAD }); return; }
    // k6: full int8 결과
    doc(160, 180, 90, 116, { stroke: GOOD, s: pop(u, 0.3) }); mono(160, 268, 'model_int8.tflite', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.5) });
    mono(160, 292, '3,154,232 B (실측)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.7) });
    [['입력 dtype', 'int8', 120], ['출력 dtype', 'int8', 180]].forEach(([a, b, y], i) => { tx(300, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.3) }); pill(440, y, b, GOOD, pop(u, 0.9 + i * 0.3), { mono: true, fs: 14, fill: GOODBG }); });
    sub(370, 230, 'inference_input_type · inference_output_type', fade(u, 1.4));
    c.beat.runtime.targets.forEach((tg, i) => { const y = 110 + i * 70, s = pop(u, 1.5 + i * 0.25); card(770, y, 280, 48, { rx: 10, text: tg, fs: 14.5, fw: 700, stroke: ACC, s }); grow(520, 180, 626, y, E(u, 1.4 + i * 0.25, 1.8 + i * 0.25), GRID, { plain: true }); });
    note(480, 380, '변환 단계의 두 함정을 넘기면 실행은 단순하다', fade(u, 2.3), { 'text-anchor': 'middle' }); }

  // ---------- 4. TF.js ----------
  function s4(t, c) { const { k, u } = c, d = c.beat.tfjs;
    browser(700, 220, 440, 330, '사용자 브라우저', { stroke: INK });
    if (k === 0) { folder(80, 110, 70, 52, {}); mono(80, 160, 'saved_model/2', { 'font-size': 13.5, 'text-anchor': 'middle' });
      grow(122, 110, 170, 110, E(u, 0.3, 0.6), MUT); card(290, 110, 230, 42, { rx: 8, text: 'tensorflowjs_converter', fs: 14, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.5) });
      [['model.json', 200, INFO], ['group1-shard1of2.bin', 270, ACC], ['group1-shard2of2.bin', 330, ACC]].forEach(([n, y, col], i) => { const s = pop(u, 1.1 + i * 0.3);
        grow(290, 132, 160, y - 14, E(u, 1.0 + i * 0.3, 1.3 + i * 0.3), GRID, { plain: true }); doc(130, y, 26, 34, { stroke: col, s }); mono(152, y + 5, n, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: s }); });
      sub(700, 220, '아직 비어 있다', 1, { 'font-size': 14 }); return; }
    // 브라우저 안에 모델
    const lu = k === 1 ? E(u, 0.3, 1.8) : 1;
    if (k === 1) { [['model.json', 150, INFO], ['shard1of2.bin', 220, ACC], ['shard2of2.bin', 290, ACC]].forEach(([n, y, col], i) => { doc(110, y, 26, 34, { stroke: col }); mono(132, y + 5, n, { 'font-size': 13.5, 'font-weight': 700, fill: col });
        for (let j = 0; j < 3; j++) dot([[250, y], [520, 220]], seg(u, 0.3 + i * 0.25 + j * 0.2, 1.0 + i * 0.25 + j * 0.2), col, 5); }); }
    card(700, 130, 220, 52, { rx: 10, text: 'GraphModel', fs: 16, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, op: k === 1 ? lu : 1 });
    if (k === 1) { mono(700, 210, 'tf.loadGraphModel("web_model/model.json")', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); note(700, 270, '모델이 클라이언트에 상주한다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { server(140, 210, '추론 서버', { s: pop(u, 0.2), stroke: OFF }); cross(140, 210, 22, pop(u, 1.8));
      card(700, 220, 300, 38, { rx: 6, text: 'tensor2d([[5.1, 3.5, 1.4, 0.2]])', fs: 13.5, mono: true, fw: 700, stroke: INFO, color: INFO, s: pop(u, 0.4) });
      dot([[700, 200], [700, 158]], seg(u, 0.8, 1.3), INFO, 6);
      terminal(500, 270, 400, 100, ['> pred.print()', ['Tensor  [[p0, p1, p2]]', null]], 1 + E(u, 1.3, 2.0), { title: '브라우저 콘솔', fs: 13.5 });
      note(140, 300, '서버 호출 0', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); return; }
    if (k === 3) { // 웹캠 프레임 → 텐서
      for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) el('rect', { x: 520 + q * 18, y: 210 + r * 18, width: 16, height: 16, fill: INFO, opacity: 0.25 + 0.5 * ((r * 5 + q) % 3) / 2 * fade(u, 0.3) });
      tx(565, 300, 'video 프레임', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
      grow(620, 245, 660, 245, E(u, 0.6, 0.9), MUT); pill(735, 230, 'fromPixels → [h, w, 3]', INFO, pop(u, 0.9), { mono: true, fs: 13.5 });
      pill(735, 268, 'expandDims → [1, h, w, 3]', INFO, pop(u, 1.3), { mono: true, fs: 13.5 });
      grow(735, 210, 735, 160, E(u, 1.6, 1.9), INFO);
      R.lock(140, 200, true, GOOD, pop(u, 1.9)); note(140, 250, '영상은 기기를', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); note(140, 272, '떠나지 않는다', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); return; }
    if (k === 4) { // dispose
      const ax = R.axes(530, 200, 340, 140, { x: [0, 10], y: [0, 10], xl: '프레임', yl: 'GPU 메모리' });
      const leak = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 10]], ok = [[0, 1], [2, 1.4], [4, 1.2], [6, 1.4], [8, 1.2], [10, 1.4]];
      R.line(ax, leak, E(u, 0.3, 1.6), BAD); R.line(ax, ok, E(u, 0.9, 2.2), GOOD);
      tx(560, 228, 'dispose 없음', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); tx(860, 318, 'dispose()', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', class: 'mono', opacity: fade(u, 2.0) });
      sub(700, 186, '모양만 보인 그림', fade(u, 0.5));
      mono(140, 200, 'requestAnimationFrame(loop)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
      el('circle', { cx: 140, cy: 270, r: 40, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': `${251 * E(u, 0.3, 2.3)} 251` });
      mono(140, 276, '매 프레임', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC }); return; }
    // k5: 강점 vs 제약
    el('rect', { x: 20, y: 30, width: 460, height: 370, fill: PANEL, opacity: 1 });
    tx(40, 64, '얻는 것', { 'font-size': 15, 'font-weight': 800, fill: GOOD }); tx(40, 260, '내주는 것', { 'font-size': 15, 'font-weight': 800, fill: BAD });
    d.strengths.forEach((s, i) => { const y = 96 + i * 50; check(50, y - 5, 8, pop(u, 0.3 + i * 0.3)); tx(70, y, s.t, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); sub(70, y + 20, s.d, fade(u, 0.4 + i * 0.3), { 'text-anchor': 'start' }); });
    d.limits.forEach((s, i) => { const y = 292 + i * 50; cross(50, y - 5, 7, pop(u, 1.4 + i * 0.3)); tx(70, y, s.t, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.3) }); sub(70, y + 20, s.d, fade(u, 1.5 + i * 0.3), { 'text-anchor': 'start' }); });
    note(700, 260, '소형·상호작용·프라이버시 시나리오', fade(u, 2.2), { 'text-anchor': 'middle', fill: ACC }); }

  // ---------- 5. 배포 지도 ----------
  const MAP = [['서버', 'TF Serving', 'SavedModel 그대로', 'TorchServe', INFO], ['폰·엣지', 'TFLite / LiteRT', '.tflite (양자화)', 'ExecuTorch', ACC], ['브라우저', 'TF.js', 'model.json + .bin', 'ONNX Runtime Web', GOOD]];
  const MY = (i) => 120 + i * 100;
  function s5(t, c) { const { k, u } = c, n = c.beat.map.rows.length, pn = c.prev && c.prev.map ? c.prev.map.rows.length : 0;
    const pulse = k === 4 ? 1 + 0.08 * Math.sin(u * 6) * (1 - seg(u, 1.6, 2.4)) : 1;
    folder(90, 220, 96 * pulse, 72 * pulse, { stroke: ACC, sw: 2.6 }); mono(90, 280, 'SavedModel', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    [['목적지', 250], ['도구', 400], ['형식', 590], ['PyTorch 쪽', 820]].forEach(([h, x]) => tx(x, 50, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
    MAP.slice(0, n).forEach(([d, tool, fmt, pt, col], i) => { const isNew = i >= pn && k < 3, g = isNew ? E(u, 0.2, 0.8) : 1, y = MY(i), hi = k === 3 && i === 1;
      R.grow(140, 220, 196, y, g, col, { plain: true, sw: 2.5 });
      if (hi) el('rect', { x: 196, y: y - 30, width: 528, height: 60, rx: 10, fill: ACCBG, opacity: fade(u, 0.4) });
      card(250, y, 100, 42, { rx: 21, text: d, fs: 15, fw: 800, stroke: col, color: col, s: isNew ? pop(u, 0.6) : 1 });
      tx(400, y + 5, tool, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: isNew ? fade(u, 0.9) : 1 });
      mono(590, y + 5, fmt, { 'font-size': 14, 'text-anchor': 'middle', opacity: isNew ? fade(u, 1.2) : 1 });
      mono(820, y + 5, pt, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: isNew ? fade(u, 1.6) : 1 }); });
    if (k === 3) { terminal(300, 300, 600, 100, ['>>> pick_deployment("mobile")', ["{'tool': 'TFLite / LiteRT', 'format': '.tflite (양자화)', ...}", null]], 1 + E(u, 0.6, 1.8), { fs: 13.5 }); return; }
    if (k === 4) { note(480, 400, '학습 한 번, 코드 수정 없이 세 세계로', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC }); return; }
    if (k === 5) { el('rect', { x: 330, y: 80, width: 380, height: 280, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.3) });
      mono(520, 384, 'TF 한 생태계에서 공식 지원', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      sub(820, 384, '도구가 제각각', fade(u, 1.0), { 'font-size': 14 });
      pill(90, 360, '다음: Keras 3', INK, pop(u, 2.0), { fs: 14 }); } }

  const quiz = [
    { q: 'TF Serving 이 떠 있는 상태에서 새 모델을 무중단으로 올리는 방법은 무엇인가?',
      o: ['컨테이너를 재시작해 다시 로드한다', '모델 폴더 안에 더 큰 번호 폴더(3/)를 넣는다', 'REST 포트를 :8502 로 바꾼다'], a: 1,
      why: 'Serving 은 번호 폴더를 감시하다 숫자가 큰 폴더를 서빙 대상으로 올린다. 파일 복사가 곧 배포다.' },
    { q: '정확도에 민감한 모델을 GPU 델리게이트로 돌릴 때 먼저 시도할 양자화는 무엇인가?',
      o: ['float16', 'full int8', 'dynamic range int8'], a: 0,
      why: 'float16 은 크기를 12.4MB 에서 6.2MB 로 절반 줄이면서 정확도 손실이 가장 작고 GPU 와 잘 맞는다.' },
    { q: 'full int8 변환에서 빠뜨리면 정확도가 무너지는 것은 무엇인가?',
      o: ['allocate_tensors() 호출', 'SELECT_TF_OPS 허용', 'representative_dataset 캘리브레이션'], a: 2,
      why: '활성값까지 정수로 바꾸려면 실제 입력 100~500개로 범위를 재야 한다. 이 측정이 int8 눈금을 정한다.' },
    { q: 'TF.js 웹캠 루프에서 dispose 를 빠뜨리면 어떻게 되는가?',
      o: ['텐서가 GPU 메모리에 쌓여 탭이 죽는다', '영상이 서버로 올라가 버린다', '가중치 샤드를 매 프레임 다시 받는다'], a: 0,
      why: 'TF.js 텐서는 GC 가 치우지 않는다. 매 프레임 만든 텐서를 dispose 하지 않으면 메모리가 계속 오른다.' },
    { q: '서버·폰·브라우저 세 경로의 공통 출발점은 무엇인가?',
      o: ['목적지마다 따로 학습한 모델', '하나의 SavedModel', 'TF.js 의 model.json'], a: 1,
      why: 'Serving 은 SavedModel 을 그대로, TFLite 와 TF.js 는 같은 SavedModel 을 변환해 쓴다.' },
  ];
  const summary = [
    'TF Serving 은 SavedModel 폴더를 그대로 올리고, 더 큰 번호 폴더가 오면 무중단으로 바꾼다.',
    '311만 파라미터 모델이 TFLite 로 12.4MB, float16 6.2MB, int8 3.2MB 가 됐다.',
    'full int8 은 실제 입력으로 활성값 범위를 재는 대표 데이터셋이 있어야 정확도를 지킨다.',
    'TF.js 는 브라우저 안에서 추론해 데이터가 기기를 떠나지 않지만 큰 모델은 내려받기 어렵다.',
  ];
  const review = [
    { q: '폰 앱 모델을 dynamic range 로 줄였는데, 활성값까지 정수로 돌려 더 빠르게 하고 싶다. 먼저 준비할 것은?',
      o: ['TF Serving 도커 이미지', '실제 입력을 닮은 대표 데이터셋', 'model.json 과 가중치 샤드'], a: 1,
      why: 'full int8 은 활성값 범위를 재는 캘리브레이션이 필요하다. 난수로 채우면 범위가 어긋나 정확도가 떨어진다.' },
    { q: 'TFLite 변환 중 지원하지 않는 연산이라는 오류가 났다. 바로 쓸 수 있는 우회와 그 대가는?',
      o: ['SELECT_TF_OPS 를 허용하고 앱 크기 증가를 감수한다', 'float16 으로 바꾸면 오류가 사라진다', 'REST 대신 gRPC 로 호출한다'], a: 0,
      why: 'Flex delegate 가 TF 연산을 끌어와 변환은 되지만 TF 런타임 조각이 붙어 바이너리가 커진다.' },
    { q: '환자 사진을 서버로 보내면 안 되는 웹 데모를 만든다. 고를 경로는?',
      o: ['TF Serving 의 REST :8501', 'TFLite Micro', 'TF.js 로 브라우저 안에서 추론'], a: 2,
      why: 'TF.js 는 추론이 사용자 기기에서 일어나 사진이 기기를 떠나지 않는다. 대신 모델은 작아야 한다.' },
  ];

  R.page({ title: '배포 세 갈래', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
