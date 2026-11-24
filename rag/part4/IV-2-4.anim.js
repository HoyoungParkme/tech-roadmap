/* IV-2-4 Parent Document Retriever — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 문서·child 점수는 페이지의 PARENT_DOC, 정밀도·context 수치는 METRICS(예시 값)를 읽는다.
 * chunk 크기·겹침은 코드의 chunk_size=200 / chunk_overlap=20, parent 1000 / 100 이다. LLM 답변은 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const SHORT = { C1: 'JWT 구조', C2: 'OAuth2 플로우', C3: '갱신 · 만료', C4: 'RBAC · scope' };
  const P = () => (typeof PARENT_DOC === 'undefined' ? { children: [] } : PARENT_DOC);
  const M = () => (typeof METRICS === 'undefined' ? {} : METRICS);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const QTXT = 'OAuth2 인증 방법';

  // child 4개 가로 줄 (x0 부터 폭 w)
  const CX = (i) => 110 + i * 150, CY = 250;
  function kids(o) { o = o || {}; P().children.forEach((ch, i) => { const s = o.s ? o.s(i) : 1; if (s <= 0.02) return; const hit = o.hit && ch.id === 'C2', dim = o.dim && !hit;
      card(CX(i), o.y ?? CY, 132, 58, { rx: 8, text: `${ch.id}\n${SHORT[ch.id]}`, fs: 14.5, stroke: hit ? ACC : INFO, fill: hit ? ACCBG : PANEL, color: hit ? ACC : INK, sw: hit ? 3 : 2, s, op: dim ? 0.35 : 1 });
      if (o.tok) mono(CX(i), (o.y ?? CY) + 46, '200 tok', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: (dim ? 0.35 : 1) * s }); }); }
  function parentBox(x, y, w, s, o) { o = o || {}; card(x, y, w, 60, { rx: 10, stroke: WARN, fill: WARNBG, sw: 2.5, s, text: o.text || 'P3 · 3장 FastAPI 인증 시스템 · 1000 tok', fs: 15 }); }
  function gauge(x, y, name, v, col, u) { tx(x, y, name, { 'font-size': 14.5, 'font-weight': 700 });
    el('rect', { x: x + 90, y: y - 14, width: 220, height: 18, rx: 4, fill: SOFT }); el('rect', { x: x + 90, y: y - 14, width: 220 * v * E(u, 0.2, 1.2), height: 18, rx: 4, fill: col });
    mono(x + 320, y, Math.round(v * 100) + '%', { 'font-size': 15, 'font-weight': 800, fill: col }); }

  // ---------- 1. child 로 검색 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 60, 470, 46, { rx: 8, stroke: INFO, text: 'from_tiktoken_encoder(chunk_size=200, chunk_overlap=20)', fs: 14, mono: true, color: INFO, s: pop(u, 0.2) });
      const x0 = 80, sc = 1.0, y = 190; el('rect', { x: x0, y: y - 10, width: 800, height: 20, rx: 4, fill: SOFT });
      for (let v = 0; v <= 800; v += 200) { el('line', { x1: x0 + v, y1: y + 12, x2: x0 + v, y2: y + 18, stroke: MUT }); mono(x0 + v, y + 34, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
      tx(x0, y - 22, '문서 (토큰 위치)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 4; i++) { const g = E(u, 0.5 + i * 0.35, 0.9 + i * 0.35); if (g <= 0) continue; const a = x0 + i * 180 * sc, w = 200 * sc * g, yy = 250 + (i % 2) * 44;
        el('rect', { x: a, y: yy, width: w, height: 30, rx: 5, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
        if (g >= 1) mono(a + 100, yy + 20, `chunk ${i + 1}`, { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
        if (i && g >= 1) { el('rect', { x: a, y: 250, width: 20, height: 74, fill: WARN, opacity: 0.35 }); } }
      mono(x0 + 190, 352, '← 겹침 20 →', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(480, 398, '200토큰 창을 180토큰씩 밀며 자른다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { const sp = E(u, 0.3, 1.4); card(480, 80, 560, 60, { rx: 10, stroke: INK, text: '3장. FastAPI 인증 시스템', fs: 16, op: 1 - 0.5 * sp });
      P().children.forEach((ch, i) => { const x = lerp(480 - 210 + i * 140, CX(i), sp), y = lerp(150, CY, sp);
        card(x, y, 132, 58, { rx: 8, text: `${ch.id}\n${SHORT[ch.id]}`, fs: 14.5, stroke: INFO, s: 0.6 + 0.4 * sp, op: clamp(sp * 4) }); });
      P().children.forEach((ch, i) => mono(CX(i), CY + 46, '200 tok', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }));
      note(720, 160, 'split_documents → child 4개', fade(u, 1.8)); return; }
    kids({ tok: true, hit: k === 3 && u > 1.6 });
    R.dbIcon(840, 260, 'VectorStore', { s: k === 2 ? pop(u, 0.2) : 1 });
    if (k === 2) { P().children.forEach((_, i) => dot([[CX(i), CY - 30], [CX(i), 140], [840, 140], [840, 220]], seg(u, 0.4 + i * 0.3, 1.4 + i * 0.3), INFO, 6));
      note(480, 380, 'Child만 임베딩해 넣는다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    pill(480, 60, QTXT, ACC, 1, { fs: 15 });
    P().children.forEach((ch, i) => { const h = 90 * ch.score * E(u, 0.3 + i * 0.15, 1.0 + i * 0.15), hit = ch.id === 'C2';
      el('rect', { x: CX(i) - 18, y: 200 - h, width: 36, height: h, rx: 4, fill: hit ? ACC : INFO, opacity: 0.8 });
      mono(CX(i), 192 - h, ch.score.toFixed(2), { 'font-size': 14, 'font-weight': 800, fill: hit ? ACC : INK, 'text-anchor': 'middle', opacity: fade(u, 1.0 + i * 0.15) }); });
    pill(CX(1), 340, 'HIT', ACC, pop(u, 1.8), { fs: 14 });
    note(640, 380, '작아서 키워드가 흐려지지 않는다', fade(u, 2.0)); }

  // ---------- 2. child 만 LLM 에 ----------
  function s2(t, c) { const { k, u } = c, m = M().childOnly || {};
    if (k === 0) { kids({ dim: true, hit: true, y: 110 });
      card(CX(1), 270, 180, 80, { rx: 10, stroke: ACC, fill: ACCBG, sw: 3, text: 'hits[0] = C2\n200 tok', fs: 16, color: ACC, s: pop(u, 0.4) });
      grow(CX(1), 142, CX(1), 228, E(u, 0.2, 0.6), ACC);
      note(560, 280, '손에 든 것은 소절 하나', fade(u, 1.2)); return; }
    // 프롬프트 판
    zone(40, 50, 520, 240, 'prompt', { fill: SOFT, color: MUT });
    tx(60, 100, '[문서]', { 'font-size': 15, 'font-weight': 800 });
    card(250, 95, 240, 40, { rx: 6, text: 'C2 · OAuth2 플로우 (200 tok)', fs: 14, stroke: ACC, fill: ACCBG, s: k === 1 ? pop(u, 0.4) : 1 });
    tx(60, 160, '[질문]', { 'font-size': 15, 'font-weight': 800 });
    tx(130, 160, 'OAuth2 인증 방법을 설명하고', { 'font-size': 15 }); tx(130, 186, '토큰 만료는 어떻게 처리하나요?', { 'font-size': 15 });
    if (k === 1) { card(780, 170, 200, 70, { rx: 12, stroke: INK, text: 'gpt-4o-mini', fs: 16, s: pop(u, 1.2) }); grow(560, 170, 676, 170, E(u, 1.4, 1.9), MUT);
      note(560, 340, 'context 슬롯에 200토큰만 들어간다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { el('rect', { x: 130, y: 172, width: tw('토큰 만료', 15) + 4, height: 20, rx: 4, fill: BAD, opacity: 0.18 * fade(u, 0.2) });
      card(CX(2) + 400, 110, 140, 50, { rx: 8, text: 'C3 갱신 · 만료', fs: 14.5, stroke: BAD, dash: '5 4', color: BAD, op: fade(u, 0.4) });
      sub(CX(2) + 400, 152, 'context 밖', fade(u, 0.6), { fill: BAD, 'font-weight': 700 });
      zone(40, 310, 880, 96, '답변 (LLM 출력 예시)', { fill: BADBG, color: BAD, op: fade(u, 0.9) });
      tx(60, 360, '"OAuth2는 비밀번호 인증 플로우입니다."', { 'font-size': 15, opacity: fade(u, 1.2) });
      tx(60, 388, '"토큰 만료 처리는 문서에 없어서 답변할 수 없습니다."', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      cross(870, 370, 14, pop(u, 2.1)); return; }
    // k3 진단
    gauge(580, 110, '검색 정밀도', m.precision || 0, GOOD, u); check(946, 104, 9, pop(u, 1.2));
    gauge(580, 160, 'context', m.context || 0, BAD, u); cross(946, 154, 9, pop(u, 1.2));
    sub(760, 200, '평가 수치는 예시', 1, { 'font-size': 13.5 });
    note(60, 340, '찾기는 맞았다. 문제는 돌려준 크기다.', fade(u, 1.4), { fill: BAD });
    sub(60, 372, '만료(C3) · JWT(C1) · RBAC(C4)가 같이 있어야 답이 된다', fade(u, 1.8), { 'text-anchor': 'start', 'font-size': 14.5 }); }

  // ---------- 3. Child → Parent 매핑 ----------
  function s3(t, c) { const { k, u } = c;
    parentBox(480, 70, 600, k === 0 ? pop(u, 0.3) : 1);
    if (k === 0) { mono(480, 130, 'parent_splitter: chunk_size=1000, chunk_overlap=100', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 0.9) });
      note(480, 200, '절 하나를 통째로 담는 큰 chunk', fade(u, 1.5), { 'text-anchor': 'middle' }); return; }
    const kidS = k === 1 ? (i) => pop(u, 0.4 + i * 0.25) : null;
    P().children.forEach((_, i) => grow(480, 100, CX(i), 151, k === 1 ? E(u, 0.3 + i * 0.25, 0.6 + i * 0.25) : 1, GRID, { plain: true }));
    kids({ s: kidS, y: 180 });
    if (k === 1) { mono(480, 250, 'child_splitter: chunk_size=200, chunk_overlap=20', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // 두 저장소
    R.dbIcon(200, 330, 'VectorStore (Child 임베딩)', { s: k === 2 ? pop(u, 0.3) : 1 });
    const kv = k === 2 ? pop(u, 0.7) : 1; card(720, 330, 300, 70, { rx: 10, stroke: WARN, sw: 2.5, s: kv });
    mono(590, 322, '"P3" →', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: kv }); tx(650, 322, '3장 본문 1000 tok', { 'font-size': 14.5, opacity: kv });
    tx(590, 348, 'DocStore (InMemoryStore, 임베딩 없음)', { 'font-size': 13.5, fill: MUT, opacity: kv });
    if (k === 2) { el('rect', { x: 120, y: 270, width: 770, height: 140, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: fade(u, 1.4) });
      tx(470, 300, 'ParentDocumentRetriever', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    // k3 parent_id 끈
    P().children.forEach((ch, i) => { const g = E(u, 0.3 + i * 0.25, 1.0 + i * 0.25); if (g <= 0) return;
      const x0 = CX(i), y0 = 209, x1 = 600, y1 = 300; el('path', { d: `M${x0},${y0} Q${lerp(x0, x1, 0.5)},${y0 + 70} ${lerp(x0, x1, g)},${lerp(y0, y1, g)}`, fill: 'none', stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
      if (g >= 1) mono(x0, 236, 'parent_id="P3"', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle' }); });
    note(340, 410, 'add_documents 한 번에 끈까지 기록된다', fade(u, 1.8)); }

  // ---------- 4. parent 로 반환 ----------
  function s4(t, c) { const { k, u } = c, m = M().smallToBig || {};
    if (k <= 1) { R.dbIcon(170, 150, 'VectorStore', {}); card(720, 150, 300, 70, { rx: 10, stroke: WARN, sw: 2.5 });
      mono(590, 145, '"P3" →', { 'font-size': 15, 'font-weight': 800, fill: WARN }); tx(650, 145, '3장 본문 1000 tok', { 'font-size': 14.5 }); tx(590, 170, 'DocStore', { 'font-size': 13.5, fill: MUT });
      pill(170, 50, QTXT, ACC, 1, { fs: 15 }); }
    if (k === 0) { dot([[170, 64], [170, 120]], seg(u, 0.2, 0.8), ACC, 7);
      card(300, 300, 200, 64, { rx: 8, text: 'C2 · OAuth2 플로우', fs: 15, stroke: ACC, fill: ACCBG, color: ACC, sw: 3, s: pop(u, 0.9) });
      mono(300, 350, 'metadata: parent_id="P3"', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      grow(222, 222, 262, 264, E(u, 0.8, 1.1), ACC); note(560, 310, '① child 검색에서 C2 hit', fade(u, 1.6)); return; }
    if (k === 1) { card(300, 300, 200, 64, { rx: 8, text: 'C2 · OAuth2 플로우', fs: 15, stroke: ACC, fill: ACCBG, color: ACC, sw: 3 });
      const g = E(u, 0.2, 1.2); el('path', { d: `M400,300 Q${lerp(400, 600, 0.5)},${300} ${lerp(400, 600, g)},${lerp(300, 190, g)}`, fill: 'none', stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
      mono(560, 280, 'docstore.mget(["P3"])', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      fly(720, 190, 720, 330, seg(u, 1.4, 2.4), 'P3 1000 tok', { fill: WARN, stay: true });
      note(40, 400, '② parent_id 추출 → ③ DocStore에서 P3 꺼내기', fade(u, 1.8)); return; }
    // k2·k3 context 막대
    const v = k === 2 ? Math.round(lerp(200, 1000, E(u, 0.4, 1.8))) : 1000;
    tx(60, 70, '{context}에 들어가는 양', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    el('rect', { x: 60, y: 86, width: 800, height: 34, rx: 6, fill: SOFT });
    el('rect', { x: 60, y: 86, width: 160, height: 34, rx: 6, fill: ACC, opacity: 0.9 }); mono(140, 109, 'C2', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
    if (v > 200) el('rect', { x: 220, y: 86, width: (v - 200) * 0.8, height: 34, rx: 6, fill: WARN, opacity: 0.8 });
    if (v >= 1000) ['C1', 'C3', 'C4'].forEach((s, i) => mono(320 + i * 200, 109, s, { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }));
    mono(60, 150, `${v} 토큰`, { 'font-size': 22, 'font-weight': 800, fill: v >= 1000 ? WARN : ACC });
    if (k === 2) { note(300, 150, '④ C2 200토큰 대신 P3 절 전체', fade(u, 1.8)); return; }
    zone(40, 190, 520, 210, '답변 (LLM 출력 예시)', { fill: GOODBG, color: GOOD });
    ['"OAuth2 비밀번호 플로우는 /token 엔드포인트로', ' ID/PW를 보내 JWT access token을 받습니다.', ' 만료 시 refresh token으로 재발급하며,', ' scope를 조합해 RBAC도 적용합니다."'].forEach((s, i) => tx(60, 240 + i * 28, s, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.3) }));
    gauge(590, 260, '정밀도', m.precision || 0, GOOD, u - 1.2); gauge(590, 310, 'context', m.context || 0, GOOD, u - 1.4);
    sub(750, 350, '평가 수치는 예시', fade(u, 2.0), { 'font-size': 13.5 }); }

  // ---------- 5. 결과 ----------
  const STR = [['childOnly', 'Child만 (200 tok)', INFO], ['parentOnly', 'Parent만 (1000 tok)', WARN], ['smallToBig', 'small-to-big', GOOD]];
  function s5(t, c) { const { k, u } = c, mm = M();
    if (k <= 2) { tx(40, 44, '세 전략 비교 (질의 "OAuth2 인증 방법", 평가 수치는 예시)', { 'font-size': 15.5, 'font-weight': 800 });
      STR.forEach(([key, nm, col], i) => { if (i > k) return; const y = 100 + i * 110, m = mm[key] || {}, uu = i === k ? u : 3;
        tx(40, y, nm, { 'font-size': 16, 'font-weight': 800, fill: col });
        gauge(80, y + 34, '정밀도', m.precision || 0, m.precision >= 0.9 ? GOOD : BAD, uu); gauge(80, y + 66, 'context', m.context || 0, m.context >= 0.9 ? GOOD : BAD, uu); });
      const ans = ['답변 빈약', '키워드 흐려짐', '둘 다 확보'][k]; pill(800, 100 + k * 110 + 48, ans, k === 2 ? GOOD : BAD, pop(u, 1.4), { fs: 15 }); return; }
    if (k === 3) { const ax = R.axes(140, 50, 420, 300, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 1], yt: [0, 0.5, 1], xl: '검색 정밀도', yl: 'context 풍부도' });
      el('rect', { x: ax.X(0.9), y: ax.Y(1), width: ax.X(1) - ax.X(0.9), height: ax.Y(0.9) - ax.Y(1), fill: GOODBG, opacity: fade(u, 1.6) });
      STR.forEach(([key, nm, col], i) => { const m = mm[key] || {}, s = pop(u, 0.3 + i * 0.4); if (s <= 0.02) return;
        el('circle', { cx: ax.X(m.precision), cy: ax.Y(m.context), r: 9 * s, fill: col });
        tx(ax.X(m.precision) + (i === 2 ? -14 : 14), ax.Y(m.context) + (i === 1 ? -14 : 22), nm, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': i === 2 ? 'end' : 'start', opacity: s }); });
      note(620, 150, '크기 하나로는 둘 중 하나를 잃는다', fade(u, 1.4));
      note(620, 190, '찾는 chunk와 건네는 chunk를 나눈다', fade(u, 2.0), { fill: GOOD }); return; }
    // k4 크기 가이드
    [['Parent', '800 ~ 2000 tok', 'DocStore (KV)', WARN, 160], ['Child', '100 ~ 400 tok', 'VectorStore', INFO, 300]].forEach(([nm, sz, store, col, y], i) => { const s = pop(u, 0.2 + i * 0.4);
      card(200, y, 240, 80, { rx: 10, stroke: col, sw: 2.5, text: nm + '\n' + sz, fs: 16, s }); grow(330, y, 560, y, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), col);
      if (i === 0) card(700, y, 240, 70, { rx: 10, stroke: col, text: store, fs: 16, s: pop(u, 0.8) }); else R.dbIcon(700, y - 10, store, { s: pop(u, 1.2) }); });
    const g = E(u, 1.4, 2.0); el('line', { x1: 200, y1: 260, x2: 200, y2: lerp(260, 200, g), stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
    mono(214, 236, 'parent_id', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: '질의 "OAuth2 인증 방법"에 작은 child chunk가 잘 맞는 이유는 무엇인가?',
      o: ['chunk가 작아 한 주제만 담겨 키워드가 흐려지지 않기 때문이다', 'child는 임베딩을 하지 않기 때문이다', 'child가 parent보다 토큰이 많기 때문이다'], a: 0,
      why: '200토큰 소절 하나에는 OAuth2 이야기만 있다. 그래서 C2가 0.92로 다른 소절(0.38~0.51)보다 확실히 높다.' },
    { q: 'C2만 LLM에 넘겼을 때 답이 빈약했던 원인은 무엇인가?',
      o: ['검색이 엉뚱한 chunk를 골랐다', '질문에 필요한 만료 처리(C3)가 200토큰 안에 없었다', 'LLM 모델이 작았다'], a: 1,
      why: '검색 정밀도는 92%로 맞았다. 돌려준 크기가 작아 context가 25%에 그쳤다.' },
    { q: 'ParentDocumentRetriever에서 parent 본문은 어디에 저장되는가?',
      o: ['child와 함께 VectorStore에 임베딩된다', '프롬프트 템플릿 안에 고정된다', '임베딩 없이 DocStore(KV)에 id로 저장된다'], a: 2,
      why: '임베딩은 child만 한다. parent는 InMemoryStore 같은 KV에 두고, child metadata의 parent_id로 찾는다.' },
    { q: 'invoke 한 번에 일어나는 순서로 맞는 것은 무엇인가?',
      o: ['child 검색 → parent_id 추출 → DocStore에서 parent 꺼내기', 'parent 검색 → child로 쪼개기 → LLM', 'DocStore 전체 읽기 → 임베딩 → 검색'], a: 0,
      why: 'C2가 hit되면 metadata의 "P3"로 docstore.mget을 불러 1000토큰 절 전체를 돌려준다.' },
    { q: 'small-to-big이 Child만·Parent만 방식과 다른 점은 무엇인가?',
      o: ['chunk를 하나의 크기로 정하지 않고 검색용과 전달용을 나눈다', 'chunk 크기를 500 하나로 맞춘다', '임베딩을 parent에만 한다'], a: 0,
      why: 'Child만은 92%/25%, Parent만은 55%/95%였다. 나누면 92%/95%로 둘 다 얻는다(예시 수치).' },
  ];
  const summary = [
    '200토큰 child로 쪼개 검색하면 OAuth2 소절 C2가 0.92로 정확히 잡힌다.',
    '하지만 C2만 LLM에 주면 만료 처리 같은 이웃 내용이 없어 답을 못 한다.',
    'child마다 parent_id를 적어 두고, parent 본문은 임베딩 없이 DocStore에 둔다.',
    'child로 찾고 1000토큰 parent를 건네면 정밀도와 context를 함께 얻는다(예시 92%와 95%).',
  ];
  const review = [
    { q: '긴 기술 문서를 1000토큰 chunk로만 검색했더니 엉뚱한 절이 자주 올라온다. 먼저 바꿀 것은?',
      o: ['검색은 작은 child로 하고 반환은 parent로 하게 나눈다', 'chunk를 2000토큰으로 더 키운다', 'LLM 모델을 더 큰 것으로 바꾼다'], a: 0,
      why: '큰 chunk는 여러 주제가 섞여 키워드가 흐려진다. 이 장 예시에서 Parent만은 정밀도 55%였다.' },
    { q: 'ParentDocumentRetriever를 붙였는데 invoke 결과가 child 조각 그대로 나온다. 먼저 의심할 것은?',
      o: ['child_splitter의 chunk_size가 200이다', 'DocStore에 parent가 저장되지 않았거나 id 키가 맞지 않는다', 'VectorStore에 child가 너무 많다'], a: 1,
      why: 'retriever는 child metadata의 id로 DocStore에서 parent를 꺼낸다. 저장이 빠졌거나 id_key가 어긋나면 parent를 찾지 못한다.' },
    { q: 'FAQ처럼 질문 하나에 답 하나가 짧게 붙은 문서다. Parent Document Retriever가 맞는가?',
      o: ['맞다, 언제나 쓰는 것이 좋다', '맞다, parent를 2000토큰으로 키우면 된다', '굳이 필요 없다, 한 chunk로 이미 충분하다'], a: 2,
      why: '이미 한 chunk에 답이 다 들어 있으면 나눌 이유가 없다. parent 1000토큰은 토큰 비용만 늘린다.' },
  ];

  R.page({ title: '작게 찾고 크게 읽기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
