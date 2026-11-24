/* VI-1-1 Self-RAG — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 문서·판정·점수는 페이지 STEPS 의 nodes / result 를 읽는다. LLM 답변 문장은 예시 출력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, dot, cross, check, dbIcon, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const DOCS = [
    { id: 'D1', title: '인사규정 3장 - 연차', snippet: '입사 1년 이상 시 연 15일 부여', rel: true },
    { id: 'D2', title: '경비처리 가이드', snippet: '출장비 정산은 월말 일괄 처리', rel: false },
    { id: 'D3', title: '인사규정 3장 - 리프레시', snippet: '5년 근속 시 추가 3일', rel: true },
    { id: 'D4', title: '근무시간 규정', snippet: '코어타임 10~16시 운영', rel: false },
  ];

  // 말풍선 (왼쪽 끝 기준)
  function bubble(x, y, s, o) { o = o || {}; const fs = o.fs || 15, w = tw(s, fs) + 30, h = fs + 20, g = G(x, y, o.s, o.op);
    el('path', { d: `M18,${h / 2 - 3} l-8,12 l20,-10`, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('rect', { x: 0, y: -h / 2, width: w, height: h, rx: h / 2, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2 }, g);
    tx(15, fs * 0.36, s, { 'font-size': fs, 'font-weight': 700, fill: o.color || INK }, g); return w; }
  // 문서 카드 (가운데 기준). o.mark: 'keep' | 'drop'
  function doc(cx, cy, d, o) { o = o || {}; const w = o.w || 230, h = o.h || 58, g = G(cx, cy, o.s, o.op);
    const st = o.mark === 'keep' ? GOOD : o.mark === 'drop' ? BAD : o.stroke || GRID;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.mark === 'drop' ? SOFT : o.fill || PANEL, stroke: st, 'stroke-width': o.mark ? 2.5 : 2 }, g);
    el('path', { d: `M${w / 2 - 14},${-h / 2} L${w / 2},${-h / 2 + 14} L${w / 2 - 14},${-h / 2 + 14} Z`, fill: GRID }, g);
    mono(-w / 2 + 11, -h / 2 + 22, d.id, { 'font-size': 14, 'font-weight': 800, fill: o.mark === 'drop' ? MUT : ACC }, g);
    tx(-w / 2 + 42, -h / 2 + 22, d.title, { 'font-size': 14.5, 'font-weight': 700, fill: o.mark === 'drop' ? MUT : INK }, g);
    tx(-w / 2 + 11, -h / 2 + 45, d.snippet, { 'font-size': 13.5, fill: MUT }, g);
    if (o.mark === 'drop') el('line', { x1: -w / 2 + 8, y1: 0, x2: w / 2 - 8, y2: 0, stroke: BAD, 'stroke-width': 2, opacity: 0.6 }, g);
    return g; }
  // reflection token 알약
  const tok = (cx, cy, s, col, sc, o) => pill(cx, cy, s, col, sc, Object.assign({ mono: true, fs: 14, fill: PANEL }, o || {}));
  const num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, ''));
  const tag = (x, y, s, op) => tx(x, y, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op ?? 1 });

  // ---------- 1. 일반 RAG ----------
  const DB1 = [120, 270], SL1 = [430, 70, 150, 230, 310], LLM1 = [760, 110];
  function s1(t, c) { const { k, u } = c;
    bubble(30, 60, '우리 회사 연차는?', { s: k === 0 ? pop(u, 0.2) : 1 });
    dbIcon(DB1[0], DB1[1], '정책 인덱스 (FAISS)', { s: k === 0 ? pop(u, 0.5) : 1 });
    card(LLM1[0], LLM1[1], 170, 56, { text: 'gpt-4o-mini', mono: true, fs: 15, stroke: INK, s: k === 0 ? pop(u, 0.8) : 1 });
    // 질문과 검색 사이: 판단 장치가 없다
    el('line', { x1: 110, y1: 82, x2: 110, y2: 216, stroke: GRID, 'stroke-width': 2.5 });
    card(110, 150, 150, 34, { rx: 17, text: '판단 장치 없음', fs: 13.5, stroke: MUT, dash: '5 4', color: MUT, fill: SOFT, op: k === 0 ? fade(u, 1.4) : 1 });
    if (k === 0) { tag(940, 404, 'top-k 4 · 검증 없음', fade(u, 1.8)); return; }
    // k1: 4건 모두 컨텍스트로
    DOCS.forEach((d, i) => { const a = k === 1 ? E(u, 0.3 + i * 0.25, 1.0 + i * 0.25) : 1; if (a <= 0) return;
      const bad = !d.rel && (k > 1 || u > 2.0);
      doc(lerp(DB1[0], SL1[0], a), lerp(DB1[1], SL1[i + 1], a), d, { s: 0.5 + 0.5 * a, stroke: bad ? WARN : GRID, fill: bad ? WARNBG : PANEL });
      if (a >= 1) grow(SL1[0] + 116, SL1[i + 1], LLM1[0] - 86, LLM1[1] + 10, k === 1 ? E(u, 1.4 + i * 0.1, 2.0 + i * 0.1) : 1, MUT, { sw: 1.6, plain: true }); });
    if (k === 1) { dot([[DB1[0], 82 + 134], [DB1[0], DB1[1] - 40]], seg(u, 0.05, 0.4), INFO, 6);
      if (u > 2.0) { tx(SL1[0] + 124, SL1[2] + 5, '무관', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) }); tx(SL1[0] + 124, SL1[4] + 5, '무관', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) }); }
      return; }
    tx(SL1[0] + 124, SL1[2] + 5, '무관', { 'font-size': 14, 'font-weight': 800, fill: WARN }); tx(SL1[0] + 124, SL1[4] + 5, '무관', { 'font-size': 14, 'font-weight': 800, fill: WARN });
    // k2: 오염된 답
    const ans = k === 2 ? fade(u, 0.3) : 1;
    tx(640, 192, 'LLM 답 (예시 출력)', { 'font-size': 13.5, fill: MUT, opacity: ans });
    card(785, 238, 300, 76, { rx: 12, stroke: BAD, sw: 2, fill: PANEL, op: ans });
    tx(648, 230, '연차는 15일이고', { 'font-size': 15, 'font-weight': 700, opacity: ans });
    tx(648, 256, '출장비는 월말 정산입니다.', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: k === 2 ? fade(u, 0.9) : 1 });
    if (k >= 2) { const lu = k === 2 ? E(u, 1.3, 2.2) : 1; el('path', { d: `M${SL1[0] + 116},${SL1[2] + 8} C560,190 590,260 ${lerp(SL1[0] + 116, 640, lu)},${lerp(SL1[2] + 8, 252, lu)}`, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: lu > 0 ? 1 : 0 }); }
    if (k === 2) return;
    // k3: 일반 지식 질문에도 검색
    const q2 = k === 3 ? pop(u, 0.2) : 1;
    bubble(30, 366, '1+1 은 얼마야?', { s: q2, fill: SOFT, stroke: MUT });
    if (k === 3) { dot([[60, 348], [60, 312], [DB1[0] - 30, DB1[1] + 50]], seg(u, 0.6, 1.4), BAD, 6); }
    const n = k === 3 && u < 1.4 ? 1 : 2;
    card(785, 350, 300, 52, { rx: 10, stroke: n === 2 ? BAD : GRID, sw: 2, op: k === 3 ? fade(u, 0.4) : 1 });
    tx(650, 356, '검색 호출', { 'font-size': 15, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.4) : 1 });
    mono(920, 357, `${n} / 질문 2`, { 'font-size': 17, 'font-weight': 800, fill: n === 2 ? BAD : INK, 'text-anchor': 'end', opacity: k === 3 ? fade(u, 0.4) : 1 });
    if (k === 3) return;
    // k4: 한계 3가지를 그림 위에 번호로
    [[DB1[0] + 70, 200, '1', '모든 질문에 검색'], [SL1[0], 30, '2', '무관 문서가 섞인다'], [785, 298, '3', '답을 검증하지 않는다']].forEach(([x, y, n2, s], i) => {
      const sc = pop(u, 0.3 + i * 0.45); el('circle', { cx: x - tw(s, 15) / 2 - 22, cy: y, r: 13 * sc, fill: BAD });
      mono(x - tw(s, 15) / 2 - 22, y + 5, n2, { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: sc });
      card(x, y, tw(s, 15) + 20, 30, { rx: 8, text: s, fs: 15, stroke: BAD, color: BAD, fill: BADBG, s: sc }); }); }

  // ---------- 2. [Retrieve] ----------
  const ROWS = [92, 210, 328], DEST = [['vectorstore 검색', INFO], ['바로 답변', GOOD], ['직전 근거 재사용', WARN]];
  const QS = [['우리 회사 연차는?', 'Yes'], ['1+1 은 얼마야?', 'No'], ['앞 답변을 더 풀어 줘', 'Continue']];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) {   // 판단 프롬프트
      card(480, 150, 560, 150, { rx: 12, stroke: INK, fill: PANEL, s: pop(u, 0.2) });
      mono(220, 108, 'RETRIEVE_PROMPT', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      tx(220, 140, '다음 질문에 외부 문서 검색이 필요한가?', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.7) });
      tx(220, 170, '셋 중 하나로만 답한다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9) });
      [['Yes', '검색 필요', INFO], ['No', '검색 불필요', GOOD], ['Continue', '앞서 찾은 근거 계속', WARN]].forEach(([a, b, col], i) => {
        const x = 230 + i * 250, s = pop(u, 1.2 + i * 0.3); tok(x, 290, a, col, s); tx(x, 330, b, { 'font-size': 14.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.3) }); });
      return; }
    if (k === 1) {   // 토큰 한 개 생성 → 첫 단어만
      bubble(40, 90, '우리 회사 연차는?', {});
      card(380, 210, 170, 64, { text: 'decide_retrieve()', mono: true, fs: 14, stroke: ACC, fill: ACCBG, s: pop(u, 0.2) });
      grow(200, 110, 300, 190, E(u, 0.3, 0.8), MUT);
      const a = E(u, 0.9, 1.5); tx(520, 168, '모델 출력 (예시)', { 'font-size': 13.5, fill: MUT, opacity: a });
      const w0 = tw('Yes', 16); mono(520, 214, 'Yes', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: a });
      mono(520 + w0 + 10, 214, '— 사내 정책 확인 필요', { 'font-size': 16, fill: MUT, opacity: a * (1 - E(u, 1.8, 2.4) * 0.8) });
      el('line', { x1: 520 + w0 + 4, y1: 192, x2: 520 + w0 + 4, y2: 226, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: fade(u, 1.7) });
      mono(520, 262, '.strip().split()[0]', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.7) });
      tok(580, 330, '[Retrieve]=Yes', INFO, pop(u, 2.1));
      return; }
    // k2~4: 질문 세 개가 세 갈래로
    const shown = k - 1;   // k2:1, k3:2, k4:3
    el('line', { x1: 380, y1: 50, x2: 380, y2: 380, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
    tx(380, 40, '[Retrieve] 판정', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    DEST.forEach(([s, col], i) => { const on = i < shown, fresh = i === shown - 1, sc = fresh ? pop(u, 0.9) : 1;
      if (i === 0) dbIcon(830, ROWS[0], null, { s: 0.55, stroke: on ? col : GRID });
      card(i === 0 ? 700 : 790, ROWS[i], i === 0 ? 150 : 210, 40, { rx: 10, text: s, fs: 15, stroke: on ? col : GRID, color: on ? col : OFF, fill: on ? PANEL : SOFT, s: on ? sc : 1 }); });
    QS.forEach(([q, v], i) => { if (i >= shown) return; const fresh = i === shown - 1, y = ROWS[i], col = DEST[i][1];
      bubble(20, y, q, { s: fresh ? pop(u, 0.1) : 1, fs: 14.5 });
      tok(470, y, `[Retrieve]=${v}`, col, fresh ? pop(u, 0.6) : 1);
      const end = i === 0 ? 620 : 680; if (fresh) dot([[565, y], [end, y]], seg(u, 1.0, 1.8), col, 6);
      grow(565, y, end, y, fresh ? E(u, 1.0, 1.8) : 1, col === INFO ? MUT : col, { sw: 2.2 }); });
    if (k >= 3) { const op = k === 3 ? fade(u, 1.6) : 1; cross(850, ROWS[1] + 46, 9, op); tx(870, ROWS[1] + 52, '검색 안 함', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: op }); }
    if (k === 4) { card(480, 395, 300, 34, { rx: 17, text: '질문 3개 → 검색 1회', fs: 15, fw: 800, stroke: ACC, color: ACC, s: pop(u, 2.0) }); } }

  // ---------- 3. [IsRel] ----------
  const XS = [124, 364, 604, 844];
  function s3(t, c) { const { k, u } = c, r = c.beat.result, pr = (c.prev && c.prev.result) || { docs: [] };
    bubble(20, 34, '우리 회사 연차는?', { fs: 14.5 });
    tx(940, 40, 'top-4 검색은 끝났다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const judged = r.docs.length, before = pr.docs.length;
    if (k === 0) { card(480, 330, 520, 96, { rx: 12, stroke: INK, s: pop(u, 0.8) });
      mono(240, 306, 'ISREL_PROMPT', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      tx(240, 336, '이 문서가 질문에 답하는 데 관련 있는가?', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.1) });
      tok(560, 306, 'Relevant', GOOD, pop(u, 1.6)); tok(680, 306, 'Irrelevant', BAD, pop(u, 1.8)); }
    DOCS.forEach((d, i) => { const isJ = i < judged, fresh = isJ && i >= before, a = fresh ? E(u, 0.4 + (i - before) * 0.6, 1.0 + (i - before) * 0.6) : isJ ? 1 : 0;
      const drop = isJ && !d.rel && a >= 1, y = 150 + (drop ? 70 * (fresh ? E(u, 1.2 + (i - before) * 0.6, 1.8 + (i - before) * 0.6) : 1) : 0);
      if (k === 4 && d.rel) return;   // 컨텍스트로 옮겨 그린다
      doc(XS[i], y, d, { mark: a >= 1 ? (d.rel ? 'keep' : 'drop') : null, s: k === 0 ? pop(u, 0.1 + i * 0.12) : 1, op: k === 4 && !d.rel ? 0.55 : 1 });
      if (fresh && a > 0 && a < 1) { const sx = XS[i] - 110 + 220 * a; el('line', { x1: sx, y1: 118, x2: sx, y2: 182, stroke: ACC, 'stroke-width': 3 }); }
      if (a >= 1 && k < 4) tok(XS[i], 98, d.rel ? 'Relevant' : 'Irrelevant', d.rel ? GOOD : BAD, fresh ? pop(u, 0.1 + 1.0 + (i - before) * 0.6, 0.4) : 1, { fs: 13.5 }); });
    if (k >= 1 && k < 4) { const kept = r.keptCount, drop = r.droppedCount;
      tx(40, 330, 'keep', { 'font-size': 15, 'font-weight': 800, fill: GOOD }); mono(90, 331, String(kept), { 'font-size': 22, 'font-weight': 800, fill: GOOD });
      tx(140, 330, 'drop', { 'font-size': 15, 'font-weight': 800, fill: BAD }); mono(190, 331, String(drop), { 'font-size': 22, 'font-weight': 800, fill: BAD });
      for (let i = 0; i < 4; i++) el('rect', { x: 40 + i * 44, y: 350, width: 38, height: 14, rx: 3, fill: i < kept ? GOOD : i < kept + drop ? BAD : SOFT, opacity: 0.85 });
      tx(40, 392, `판정 ${judged} / 4`, { 'font-size': 14, fill: MUT }); }
    if (k === 4) {   // 컨텍스트 4건 → 2건
      zone(40, 250, 520, 150, '답변 컨텍스트', { fill: GOODBG, stroke: GOOD, color: GOOD });
      [0, 2].forEach((i, j) => { const a = E(u, 0.2 + j * 0.3, 1.0 + j * 0.3); doc(lerp(XS[i], 180 + j * 250, a), lerp(150, 330, a), DOCS[i], { mark: 'keep', w: 230 }); });
      const bw = 300; tx(610, 290, '컨텍스트 문서 수', { 'font-size': 15, 'font-weight': 700 });
      const n = lerp(4, 2, E(u, 1.0, 2.0)); el('rect', { x: 610, y: 304, width: bw, height: 20, rx: 4, fill: SOFT });
      el('rect', { x: 610, y: 304, width: bw * n / 4, height: 20, rx: 4, fill: GOOD });
      mono(610, 350, `${Math.round(n)}건`, { 'font-size': 20, 'font-weight': 800, fill: GOOD });
      tx(610, 384, '무관 문서 2건은 프롬프트에 들어가지 않는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); } }

  // ---------- 4. [IsSup] + [IsUse] ----------
  function s4(t, c) { const { k, u } = c, r = c.beat.result, pr = (c.prev && c.prev.result) || { issupChecks: [], isuseScore: 0 };
    tx(30, 34, '생성된 답 (예시 출력)', { 'font-size': 13.5, fill: MUT });
    const claims = [['연 15일 부여', DOCS[0], 220], ['5년 근속 시 +3일', DOCS[2], 470]];
    card(330, 72, 600, 46, { rx: 10, stroke: GRID, sw: 1.5 });
    tx(46, 78, '연차는 입사 1년 이상 시 연 15일이며, 5년 근속 시 추가 3일', { 'font-size': 15, 'font-weight': 700 });
    // 근거 문서
    doc(150, 300, DOCS[0], { w: 240, mark: 'keep' }); doc(420, 300, DOCS[2], { w: 240, mark: 'keep' });
    claims.forEach(([s, d, x], i) => { const done = i < r.issupChecks.length, fresh = done && i >= pr.issupChecks.length, a = fresh ? E(u, 0.3, 1.3) : done ? 1 : 0;
      pill(x, 160, s, done ? GOOD : MUT, 1, { fs: 14.5, fill: done ? GOODBG : PANEL, color: done ? GOOD : MUT });
      if (a > 0) { const tx0 = i === 0 ? 150 : 420; el('line', { x1: x, y1: 176, x2: lerp(x, tx0, a), y2: lerp(176, 270, a), stroke: GOOD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' });
        if (a >= 1) tok(i === 0 ? 285 : 555, 222, 'Fully', GOOD, fresh ? pop(u, 1.3) : 1, { fs: 13.5 }); } });
    // 오른쪽 판정판
    const px = 640;
    tx(px, 140, '[IsSup] 지지도', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.4) : 1 });
    const sup = r.issupChecks.length > 0;
    ['No', 'Partially', 'Fully'].forEach((s, i) => { const on = sup && i === 2, sc = k === 0 ? pop(u, 0.6 + i * 0.2) : 1;
      card(px + 50 + i * 100, 176, 92, 34, { rx: 8, text: s, fs: 14, mono: true, fw: 700, stroke: on ? GOOD : GRID, fill: on ? GOOD : PANEL, color: on ? PANEL : MUT, s: sc }); });
    if (k >= 1) { const op = k === 1 ? fade(u, 0.3) : 1, sc = tween(pr.isuseScore, r.isuseScore, u);
      tx(px, 236, '[IsUse] 유용성 1~5', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: op });
      for (let i = 0; i < 5; i++) { const f = clamp(sc - i); el('rect', { x: px + i * 50, y: 252, width: 44, height: 30, rx: 6, fill: f > 0.5 ? WARN : PANEL, stroke: f > 0.5 ? WARN : GRID, 'stroke-width': 2, opacity: op });
        mono(px + i * 50 + 22, 273, String(i + 1), { 'font-size': 14.5, 'font-weight': 800, fill: f > 0.5 ? PANEL : MUT, 'text-anchor': 'middle', opacity: op }); }
      if (r.isuseScore) mono(px + 256, 273, `${Math.round(sc)}/5`, { 'font-size': 17, 'font-weight': 800, fill: WARN }); }
    if (k >= 3) { const op = k === 3 ? fade(u, 1.6) : 1;
      card(px + 140, 336, 300, 40, { rx: 10, stroke: GOOD, sw: 2, fill: GOODBG, op });
      tx(px + 10, 342, 'Fully 그리고 IsUse ≥ 4', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: op }); check(px + 262, 336, 10, op); }
    if (k === 4) { banner(330, 398, '근거가 있는 답만 출력한다', pop(u, 0.3));
      card(px + 140, 398, 300, 34, { rx: 8, text: '못 넘으면 regenerate()', fs: 14, stroke: MUT, dash: '5 4', color: MUT, op: fade(u, 1.0) }); } }

  // ---------- 5. 결과 ----------
  function s5(t, c) { const { k, u } = c, r = c.beat.result;
    if (k === 0) {   // 토큰 4개가 흐름 위 어디서 나오는가
      const st = [['질문', 70], ['검색', 330], ['생성', 590], ['출력', 890]];
      el('line', { x1: 70, y1: 150, x2: lerp(70, 890, E(u, 0.1, 1.0)), y2: 150, stroke: INK, 'stroke-width': 3 });
      st.forEach(([s, x], i) => { const sc = pop(u, 0.1 + i * 0.25); el('circle', { cx: x, cy: 150, r: 9 * sc, fill: INK }); lbl(x, 124, s, sc); });
      [['[Retrieve]', 200, 'Yes / No / Continue'], ['[IsRel]', 460, 'Relevant / Irrelevant'], ['[IsSup]', 700, 'Fully / Partially / No'], ['[IsUse]', 790, '1 ~ 5']].forEach(([s, x, v], i) => {
        const sc = pop(u, 1.1 + i * 0.3), y = i === 3 ? 330 : 210 + (i % 2) * 0; grow(x, 158, x, y - 20, E(u, 1.0 + i * 0.3, 1.4 + i * 0.3), ACC, { plain: true });
        tok(x, y, s, ACC, sc, { fs: 15 }); tx(x, y + 36, v, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3 + i * 0.3) }); });
      tx(480, 400, '검색 전 1번, 검색 후 문서마다 1번, 답을 만든 뒤 2번', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 600, opacity: fade(u, 2.2) });
      return; }
    const M = r.metrics, y0 = 62, rh = 44, x0 = 250, bw = 330;
    tx(30, 34, '일반 RAG', { 'font-size': 14, 'font-weight': 700, fill: MUT }); el('rect', { x: 100, y: 24, width: 14, height: 12, rx: 2, fill: OFF });
    tx(130, 34, 'Self-RAG', { 'font-size': 14, 'font-weight': 700, fill: ACC }); el('rect', { x: 200, y: 24, width: 14, height: 12, rx: 2, fill: ACC });
    tx(940, 34, '사내 QA 1,000건 · 예시 수치', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const prevN = (c.prev && c.prev.result.metrics || []).length;
    M.forEach((m, i) => { const fresh = i >= prevN, g = fresh ? E(u, 0.2 + (i - prevN) * 0.3, 1.2 + (i - prevN) * 0.3) : 1, y = y0 + i * rh, a = num(m.naive), b = num(m.self), top = Math.max(a, b);
      const dim = k >= 3 ? 0.55 : 1;
      tx(30, y + 20, m.name, { 'font-size': 15, 'font-weight': 700, opacity: dim * (fresh ? fade(u, 0.1 + (i - prevN) * 0.3) : 1) });
      el('rect', { x: x0, y: y + 2, width: Math.max(2, bw * a / top * g), height: 14, rx: 3, fill: OFF, opacity: dim });
      el('rect', { x: x0, y: y + 19, width: Math.max(2, bw * b / top * g), height: 14, rx: 3, fill: m.good ? ACC : WARN, opacity: dim });
      const op = dim * (fresh ? fade(u, 1.0 + (i - prevN) * 0.3) : 1);
      mono(x0 + bw + 12, y + 14, m.naive, { 'font-size': 13.5, fill: MUT, opacity: op }); mono(x0 + bw + 12, y + 32, m.self, { 'font-size': 13.5, 'font-weight': 700, fill: m.good ? ACC : WARN, opacity: op });
      mono(910, y + 24, m.delta, { 'font-size': 17, 'font-weight': 800, fill: m.good ? GOOD : BAD, 'text-anchor': 'end', opacity: op }); });
    if (k === 2) tx(480, 300, 'reflection token 용 LLM 호출 1~3회가 붙는다', { 'font-size': 15, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) });
    if (k === 3) { tx(30, 312, '비용을 낼 가치가 있는 곳', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      r.fitFor.forEach((f, i) => { const s = pop(u, 0.3 + i * 0.3); card(130 + i * 232, 362, 214, 46, { rx: 23, text: f, fs: 15, stroke: GOOD, color: INK, fill: GOODBG, s }); check(40 + i * 232, 362, 8, s); }); }
    if (k === 4) { tx(30, 312, '손해인 곳', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      [['캐주얼 챗봇', '비용·지연 손해'], ['대량 트래픽 검색', '토큰 비용 폭증']].forEach(([a, b], i) => { const s = pop(u, 0.3 + i * 0.35); card(170 + i * 280, 362, 250, 54, { rx: 10, text: a + '\n' + b, fs: 14, stroke: BAD, s }); cross(62 + i * 280, 345, 8, s); });
      pill(800, 362, '다음 → CRAG', ACC, pop(u, 1.4), { fs: 15 }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '일반 RAG에서 "연차는?" 답에 출장비 정산 내용이 섞인 원인은 무엇인가?',
      o: ['LLM이 출장비 규정을 미리 외우고 있어서', '검색된 top-4를 판단 없이 모두 컨텍스트에 넣어서', '질문 문장이 너무 짧아서'], a: 1,
      why: '일반 RAG는 유사도 상위 4건을 그대로 넣는다. 그중 무관한 경비처리 가이드가 답에 섞였다.' },
    { q: '[Retrieve]=No로 판정된 "1+1은 얼마야?"는 어떻게 처리되는가?',
      o: ['검색 없이 LLM이 바로 답한다', '사내 문서를 검색한 뒤 답한다', '직전 근거를 다시 꺼내 쓴다'], a: 0,
      why: '일반 지식이라 검색이 필요 없다. 이렇게 불필요한 검색 호출을 잘라 낸다.' },
    { q: '[IsRel] 판정 뒤 답변 컨텍스트에 남는 문서는 몇 건인가?',
      o: ['4건', '3건', '2건'], a: 2,
      why: '인사규정 연차·리프레시 2건만 Relevant이고, 경비처리 가이드와 근무시간 규정은 버려진다.' },
    { q: 'Self-RAG가 답을 그대로 출력하는 조건은 무엇인가?',
      o: ['[IsUse]가 3점 이상이면 된다', '[IsSup]이 Fully이고 [IsUse]가 4점 이상이다', '[IsRel]이 한 건이라도 Relevant이다'], a: 1,
      why: '두 검증을 모두 넘어야 출력하고, 아니면 다시 생성한다. 이 예시는 Fully와 5점으로 통과했다.' },
    { q: 'Self-RAG를 쓰지 않는 편이 나은 서비스는 무엇인가?',
      o: ['법률 자문', '금융 컴플라이언스', '대량 트래픽의 캐주얼 챗봇'], a: 2,
      why: 'reflection token 판정에 LLM 호출이 1~3회 더 붙어 비용이 30% 늘고 지연이 0.4초 늘어난다. 정확성이 덜 중요한 곳에서는 손해다.' },
  ];

  const summary = [
    '일반 RAG는 질문마다 검색하고 top-4를 다 넣어 무관한 문서가 답에 섞인다.',
    '[Retrieve] 토큰이 검색 여부를 먼저 정하고, [IsRel]이 문서마다 관련성을 가린다.',
    '답을 만든 뒤 [IsSup]과 [IsUse]로 근거와 유용성을 확인하고 못 넘으면 다시 만든다.',
    '예시 수치로 환각이 40% 줄고 비용이 30% 늘어, 정확성이 중요한 도메인에 맞다.',
  ];
  const review = [
    { q: 'Self-RAG를 붙였는데 답에 여전히 무관한 내용이 섞인다. 먼저 의심할 것은?',
      o: ['[Retrieve] 판정이 너무 자주 Yes를 낸다', '[IsRel] 필터를 거치지 않고 검색 결과를 넣고 있다', '[IsUse] 점수 기준이 4점이다'], a: 1,
      why: '무관 문서를 컨텍스트 밖으로 빼는 일은 [IsRel]이 맡는다. 이 단계가 빠지면 일반 RAG와 같은 오염이 생긴다.' },
    { q: '생성된 답의 한 주장에 맞는 근거 문서가 없다. 어느 토큰이 이를 잡아내는가?',
      o: ['[IsSup]', '[Retrieve]', '[IsRel]'], a: 0,
      why: '[IsSup]은 주장마다 문서가 뒷받침하는지 본다. Fully가 아니면 출력하지 않고 다시 생성한다.' },
    { q: '하루 수백만 건의 잡담형 질문을 받는 챗봇에 Self-RAG를 검토 중이다. 가장 큰 걸림돌은?',
      o: ['환각률이 오히려 늘어난다', '사내 문서를 검색할 수 없다', '판정용 LLM 호출이 붙어 비용과 지연이 늘어난다'], a: 2,
      why: '판정 토큰마다 LLM을 더 부른다. 예시 수치로 비용 1.3배, 지연 0.4초가 늘어 대량 트래픽에서는 부담이 크다.' },
  ];

  R.page({ title: 'Self-RAG 판정 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
