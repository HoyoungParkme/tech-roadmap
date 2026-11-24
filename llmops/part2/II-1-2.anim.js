/* II-1-2 Prompt Registry — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    person, cross, check, clock, lock, tokens, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 파일 창 (II-1-1 과 같은 모양)
  function file(x, y, w, name, lines, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 9, h = o.h || lines.length * lh + 46;
    const g = el('g', { opacity: o.op ?? 1, transform: o.dx ? `translate(${o.dx} 0)` : null });
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8 }, g);
    el('path', { d: `M${x},${y + 28} V${y + 10} Q${x},${y} ${x + 10},${y} H${x + w - 10} Q${x + w},${y} ${x + w},${y + 10} V${y + 28} Z`, fill: SOFT }, g);
    mono(x + 14, y + 19, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.nameCol || MUT }, g);
    const shown = o.shown ?? lines.length;
    lines.forEach((ln, i) => { if (i >= Math.ceil(shown)) return; const [s, st] = Array.isArray(ln) ? ln : [ln, {}], yy = y + 38 + i * lh;
      const part = i === Math.ceil(shown) - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s;
      if (st.bg) el('rect', { x: x + 6, y: yy - 3, width: w - 12, height: lh, rx: 4, fill: st.bg, opacity: st.bgop ?? 1, stroke: st.dash ? BAD : 'none', 'stroke-dasharray': st.dash ? '4 4' : null }, g);
      const by = yy + fs * 0.85 + 1.5, a = { 'font-size': fs, opacity: st.op ?? 1 };
      if (st.plain) mono(x + 16, by, part, Object.assign(a, { fill: st.col || INK, 'font-weight': st.fw }), g);
      else spans(x + 16, by, tokens(part), a, g); });
    return { h, lh }; }
  function flag(x, y, label, col, s, o) { o = o || {}; const g = el('g', { transform: `translate(${x} ${y}) scale(${s ?? 1})`, opacity: o.op ?? 1 });
    el('line', { x1: 0, y1: 0, x2: 0, y2: -34, stroke: col, 'stroke-width': 2.5 }, g);
    const w = tw(label, 13.5) + 18; el('path', { d: `M0,-34 H${w} L${w - 8},-25 L${w},-16 H0 Z`, fill: col }, g);
    mono(8, -20.5, label, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL }, g); return g; }
  // 저장소(Registry) 아이콘: 서랍장
  function registry(cx, cy, w, h, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.01) return; const g = el('g', { transform: `translate(${cx} ${cy}) scale(${s})` });
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    tx(0, -h / 2 + 24, o.title || 'Prompt Registry', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC }, g);
    if (o.sub) tx(0, -h / 2 + 44, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }

  // ───────── 1. 흩어진 사본 ─────────
  const REPO = [
    ['backend-repo/prompts/customer.txt', [['너는 친절한 컨시어지다.', {}], ['답변은 3문장 이내로 한다.', {}], ['컨텍스트에 없는 내용은 만들지 마라.', {}]]],
    ['data-pipeline-repo/…/customer.txt', [['너는 친절한 컨시어지이다.', { bg: WARNBG }], ['답변은 3문장 이내로 작성한다.', { bg: WARNBG }], ['컨텍스트에 없는 내용은 지어내지 마라.', { bg: WARNBG }]]],
    ['search-repo/…/customer_v2.txt', [['너는 전문 컨시어지다.', { bg: WARNBG }], ['답변은 3문장 이내.', { bg: WARNBG }], ['(제약 줄 없음)', { bg: BADBG, col: BAD, dash: true }]]],
  ];
  const RX = [14, 328, 642];
  function repos(c, o) { const { k, u } = c;
    REPO.forEach(([name, lines], i) => { if (k < i) return; const a = k === i && i > 0 ? E(u, 0.2, 1.0) : 1, op = (o && o.op) ?? 1;
      const L = lines.map(([s, st]) => [s, Object.assign({ plain: true }, st, { col: st.col || INK, bgop: k === i ? fade(u, 1.0) : 1 })]);
      file(lerp(RX[0], RX[i], a), lerp(250, 40, a), 304, name, L, { op: (i > 0 ? clamp(a * 2) : 1) * op, fs: 14.5, stroke: i === 2 && k >= 2 ? BAD : GRID }); }); }
  function s1(t, c) { const { k, u } = c;
    repos(c, { op: k === 5 ? 0.35 : 1 });
    if (k <= 2) { card(150, 366, 230, 56, { rx: 12, stroke: k === 0 ? GRID : WARN, sw: 2 }); tx(52, 372, '같은 프롬프트 사본', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      mono(232, 375, Math.round(R.tween(k === 0 ? null : k, k + 1, u)) + '개', { 'font-size': 22, 'font-weight': 800, fill: k === 0 ? INK : WARN }); }
    if (k === 0) { tx(480, 230, '프롬프트가 한 군데뿐이면 문제가 보이지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    if (k === 1) { tx(480, 236, '복사해 붙이는 순간 어미가 갈라진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      [['다', '이다'], ['한다', '작성한다'], ['만들지', '지어내지']].forEach(([a, b], i) => { mono(330 + i * 120, 276, `${a}→${b}`, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8 + i * 0.2) }); }); return; }
    if (k === 2) { tx(794, 236, '환각 방지 제약이 통째로 빠졌다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
      cross(640, 296, 14, pop(u, 1.8)); tx(670, 302, '이 사본이 어디서 사고를 낼지 모른다', { 'font-size': 15, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { ['어느 버전이 진실인가?', 'prod 에는 무엇이 떠 있나?', '비개발자는 어디를 고치나?'].forEach((s, i) => { const x = 166 + i * 314, sc = pop(u, 0.3 + i * 0.4);
        card(x, 270, 280, 64, { rx: 14, stroke: BAD, sw: 2, s: sc, text: s, fs: 15 }); mono(x, 340, '?', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: BAD, opacity: clamp(sc) }); });
      return; }
    if (k === 4) { // 같은 repo 안의 if/elif
      const C4 = [['lang=="ko"', 'customer_ko.txt'], ['lang=="en"', 'customer_en.txt'], ['tier=="vip"', 'customer_vip.txt'], ['else', 'customer.txt']];
      el('rect', { x: 14, y: 188, width: 932, height: 222, rx: 12, fill: SOFT, opacity: fade(u, 0.1) });
      person(90, 268, '한국어 VIP', { s: pop(u, 0.2) });
      C4.forEach(([cond, f], i) => { const x = 270 + i * 180, a = fade(u, 0.4 + i * 0.15);
        pill(x, 230, cond, i === 0 ? ACC : INK, pop(u, 0.4 + i * 0.15), { mono: true, fs: 14 });
        card(x, 360, 168, 40, { rx: 8, text: f, mono: true, fs: 13.5, stroke: i === 0 ? ACC : GRID, color: i === 2 ? MUT : INK, s: pop(u, 0.6 + i * 0.15) });
        grow(x, 248, x, 336, a, i === 0 ? ACC : GRID, { plain: true }); });
      dot([[130, 268], [270, 268], [270, 336]], seg(u, 1.2, 2.0), ACC, 8);
      if (u > 2.0) { el('circle', { cx: 270, cy: 336, r: 8, fill: ACC }); }
      tx(810, 300, 'vip 분기에 닿지 못한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); return; }
    // k 5: 중앙 Registry
    registry(480, 300, 360, 150, { s: pop(u, 0.2), sub: '한 곳 · 버전과 태그 · UI 편집' });
    RX.forEach((x, i) => grow(x + 152, 162, lerp(380, 580, i / 2), 228, seg(u, 0.6 + i * 0.2, 1.1 + i * 0.2), ACC));
    ['단일 진실', '환경별 태그', '비개발자 수정'].forEach((s, i) => pill(380 + i * 100, 330, s, ACC, pop(u, 1.3 + i * 0.25), { fs: 13.5 })); }

  // ───────── 2. 중앙 Registry 에 push / pull + 캐시 ─────────
  const BODY = ['너는 친절한 컨시어지다.', '답변은 3문장 이내로 한다.', '컨텍스트에 없는 내용은 만들지 마라.'];
  function shelf(c, o) { o = o || {}; registry(700, 150, 380, 200, { s: o.s ?? 1 });
    if (o.row) { const a = o.row; el('rect', { x: 530, y: 120, width: 340, height: 92, rx: 8, fill: PANEL, stroke: ACC, 'stroke-width': 1.8, opacity: a });
      mono(546, 146, 'customer_bot', { 'font-size': 15, 'font-weight': 800, opacity: a });
      pill(588, 180, 'v3', INK, a, { mono: true, fs: 13.5 }); pill(682, 180, 'production', ACC, a, { mono: true, fs: 13.5 });
      tx(860, 146, 'Q1 마케팅 톤 반영', { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT, opacity: a }); } }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { card(170, 130, 230, 48, { rx: 10, text: 'lc = Client()', mono: true, fs: 15, stroke: ACC, s: pop(u, 0.2) });
      card(170, 290, 230, 48, { rx: 10, text: 'oai = OpenAI()', mono: true, fs: 15, stroke: INK, s: pop(u, 0.5) });
      shelf(c, { s: pop(u, 0.9) }); grow(288, 130, 506, 140, seg(u, 1.1, 1.6), ACC);
      card(700, 330, 220, 56, { rx: 10, text: 'gpt-4', fs: 16, stroke: MUT, s: pop(u, 1.3) }); grow(288, 290, 586, 328, seg(u, 1.4, 1.9), MUT);
      tx(170, 200, '프롬프트를 꺼내는 손', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(170, 360, '모델을 부르는 손', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { shelf(c); file(40, 110, 380, 'CUSTOMER_PROMPT = """…"""', BODY.map((s) => [s, { plain: true }]), { shown: lerp(0, 3, E(u, 0.2, 1.8)), fs: 15 });
      tx(230, 290, '본문은 한 번만 만든다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(700, 300, '아직 비어 있다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) }); return; }
    if (k === 2) { const a = E(u, 0.4, 1.4); shelf(c, { row: fade(u, 1.4, 0.5) });
      if (u < 1.5) file(lerp(40, 520, a), lerp(110, 120, a), 380, 'CUSTOMER_PROMPT', BODY.map((s) => [s, { plain: true }]), { fs: 15, op: 1 - seg(u, 1.2, 1.5) });
      mono(480, 320, 'lc.push_prompt("customer_bot", …, tags=["v3", "production"])', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 0.2) });
      tx(480, 360, '이름 + 태그가 프롬프트의 주소가 된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { shelf(c, { row: 1 });
      ['backend', 'data-pipeline', 'search'].forEach((n, i) => { const y = 90 + i * 110; card(150, y, 220, 64, { rx: 10, stroke: INK, s: pop(u, 0.1 + i * 0.15) });
        mono(56, y - 6, n + '-repo', { 'font-size': 14.5, 'font-weight': 700 }); mono(56, y + 18, 'pull("customer_bot", tag=…)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
        dot([[530, 166], [262, y]], seg(u, 0.6 + i * 0.25, 1.3 + i * 0.25), ACC, 7);
        if (u > 1.3 + i * 0.25) pill(340, y - 40, 'production', ACC, 1, { mono: true, fs: 13.5 }); });
      card(700, 330, 300, 56, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 2.0) }); tx(600, 336, '복사본', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
      mono(780, 338, '0개', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1), 'text-anchor': 'middle' }); return; }
    // k 4·5: 프로세스 메모리 캐시
    shelf(c, { row: 1 });
    el('rect', { x: 40, y: 70, width: 340, height: 300, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); tx(56, 96, '서버 프로세스 메모리', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const fresh = k === 4 ? 1 - E(u, 0.2, 2.6) * 0.7 : 0;
    card(210, 160, 300, 64, { rx: 10, stroke: k === 4 ? ACC : (u > 1.6 ? ACC : OFF), sw: 2, fill: PANEL });
    mono(76, 156, '("customer_bot", "production")', { 'font-size': 13.5, 'font-weight': 700, fill: k === 5 && u < 1.6 ? OFF : INK }); mono(76, 178, '→ (prompt, ts)', { 'font-size': 13.5, fill: MUT });
    clock(210, 270, 40, k === 4 ? fresh : (u < 1.6 ? 0 : 1 - E(u, 1.6, 2.6) * 0.05), k === 4 ? ACC : u < 1.6 ? BAD : ACC, k === 4 ? 'TTL 5분 안' : u < 1.6 ? 'TTL 지남' : '새로 채움');
    if (k === 4) { for (let i = 0; i < 5; i++) dot([[0, 230 - i * 3], [56, 172], [0, 116 + i * 4]], ((t * 0.7 + i / 5) % 1), ACC, 5);
      cross(420, 310, 10, pop(u, 0.6)); tx(440, 316, 'Registry 호출 없음', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      tx(210, 400, 'TTL 안이면 저장된 값을 바로 준다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    dot([[360, 160], [530, 160]], seg(u, 0.3, 0.9), WARN, 7); mono(440, 146, 'miss', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
    dot([[530, 190], [360, 190]], seg(u, 1.0, 1.6), ACC, 7); mono(440, 214, 'pull_prompt', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: fade(u, 1.0) });
    person(860, 330, 'UI 에서 수정', { s: pop(u, 1.8) }); grow(830, 330, 760, 260, seg(u, 2.0, 2.4), ACC);
    tx(560, 390, 'UI 수정은 5분 안에 모든 서비스로 퍼진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // ───────── 3. Semantic version ─────────
  const VX = [140, 350, 560, 790], VY = 210, VER = ['1.0.0', '1.0.1', '1.1.0', '2.0.0'];
  function vline(n, c) { el('line', { x1: 60, y1: VY, x2: VX[n - 1] + 40, y2: VY, stroke: GRID, 'stroke-width': 3 });
    for (let i = 0; i < n; i++) { const col = i === 3 ? BAD : i === 2 ? WARN : INK; el('circle', { cx: VX[i], cy: VY, r: 11, fill: PANEL, stroke: col, 'stroke-width': 3 });
      mono(VX[i], VY + 36, 'v' + VER[i], { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col }); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const D = [['1', 'MAJOR', '출력 형식이 바뀐다', BAD], ['0', 'MINOR', '기능이 늘어난다', WARN], ['0', 'PATCH', '문구만 다듬는다', GOOD]];
      mono(150, 200, 'v', { 'font-size': 70, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.1) });
      D.forEach(([d, n, s, col], i) => { const x = 270 + i * 230, sc = pop(u, 0.2 + i * 0.35);
        mono(x, 200, d, { 'text-anchor': 'middle', 'font-size': 84, 'font-weight': 800, fill: col, opacity: clamp(sc) }); if (i < 2) mono(x + 115, 200, '.', { 'text-anchor': 'middle', 'font-size': 70, fill: MUT, opacity: fade(u, 0.3) });
        pill(x, 260, n, col, pop(u, 0.6 + i * 0.35), { fs: 15 }); tx(x, 304, s, { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.8 + i * 0.35) }); });
      tx(480, 370, '숫자만 봐도 위험도가 읽힌다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k <= 4) { const n = k; vline(n, c);
      const tagAt = { production: k === 1 ? 0 : 1, staging: 2, experimental: 3 };
      const prodX = k === 2 ? lerp(VX[0], VX[1], E(u, 0.8, 1.6)) : VX[tagAt.production];
      flag(prodX, VY - 16, 'production', ACC, k === 1 ? pop(u, 0.6) : 1);
      if (k >= 3) flag(VX[2], VY - 16, 'staging', WARN, k === 3 ? pop(u, 0.9) : 1);
      if (k >= 4) flag(VX[3], VY - 16, 'experimental', BAD, pop(u, 0.9));
      if (k === 1) { file(80, 280, 420, 'metadata', [['"output_schema": "json"', {}], ['"fields": ["answer", "confidence", "sources"]', {}]], { op: fade(u, 1.2) });
        tx(600, 320, '출력 스키마를 같이 적어 둔다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
      if (k === 2) { tx(VX[1], 300, '형식 그대로 · production 이동', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
        sub(VX[1], 326, '그래도 eval 은 돌린다', fade(u, 1.8), { 'font-size': 14 }); }
      if (k === 3) { tx(VX[2], 300, 'confidence 단계 추가', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
        sub(VX[2], 326, 'staging 에서 먼저 검증', fade(u, 1.5), { 'font-size': 14 }); }
      if (k === 4) { card(640, 330, 160, 48, { rx: 8, text: '{ "answer": … }', mono: true, fs: 14, stroke: INK, s: pop(u, 0.4) }); grow(724, 330, 776, 330, seg(u, 0.9, 1.3), BAD);
        card(860, 330, 150, 48, { rx: 8, text: '## Answer', mono: true, fs: 14, stroke: BAD, color: BAD, s: pop(u, 1.3) });
        tx(640, 390, 'JSON 을 파싱하던 코드가 깨진다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }
      return; }
    // k 5: 클라이언트가 가리키는 것
    vline(4, c); flag(VX[1], VY - 16, 'production', ACC, 1); flag(VX[3], VY - 16, 'latest', BAD, 1); flag(VX[2], VY - 16, 'staging', WARN, 1, { op: 0.5 });
    const CL = [['version="1.0.1"', '고정 · 갱신 안 됨', VX[1], INK], ['tag="production"', '운영자가 옮기면 따라감', VX[1], GOOD], ['tag="latest"', 'major 가 오면 깨짐', VX[3], BAD]];
    CL.forEach(([a, b, x, col], i) => { const y = 296 + i * 40, s = pop(u, 0.3 + i * 0.45);
      mono(40, y + 5, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: clamp(s) }); grow(220, y, x, VY + 52, seg(u, 0.6 + i * 0.45, 1.0 + i * 0.45), col, { sw: 1.8 });
      tx(940, y + 5, b, { 'text-anchor': 'end', 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.45) }); }); }

  // ───────── 4. A/B 라우팅 ─────────
  // sha256(user_id) 의 마지막 16진 두 자리와 짝/홀 — python hashlib 로 계산한 값
  const USERS = [['user_1', '2b', 'control'], ['user_2', 'cd', 'control'], ['user_3', '14', 'treatment'], ['user_4', '21', 'control']];
  function versions(o) { o = o || {}; const p = o.prod ?? 1, rows = [['v1.0.0', ['control', p === 1 ? 'production' : null]], ['v2.0.0', ['treatment', p === 2 ? 'production' : p === 1 ? 'experimental' : null]]];
    el('rect', { x: 560, y: 40, width: 380, height: 150, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(578, 66, 'customer_bot', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: o.op ?? 1 });
    rows.forEach(([v, tags], i) => { const y = 104 + i * 50; mono(580, y + 5, v, { 'font-size': 15, 'font-weight': 700, opacity: o.op ?? 1 });
      let x = 680; tags.forEach((tg) => { if (!tg) return; const w = tw(tg, 13.5) + 26; pill(x + w / 2, y, tg, tg === 'production' ? GOOD : tg === 'control' ? INFO : tg === 'treatment' ? ACC : MUT, o.op ?? 1, { mono: true, fs: 13.5 }); x += w + 8; }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { versions({ op: fade(u, 0.2) });
      tx(280, 120, '같은 이름 아래', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(280, 146, '두 버전이 동시에 산다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
      [['control', 'v1.0.0', INFO], ['treatment', 'v2.0.0', ACC]].forEach(([n, v, col], i) => card(300 + i * 360, 320, 260, 64, { rx: 12, text: n + ' → ' + v, mono: true, fs: 15, stroke: col, color: col, s: pop(u, 1.2 + i * 0.3) }));
      return; }
    if (k === 1) { tx(40, 50, 'h = sha256(user_id) → int(h, 16) % 2', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      USERS.forEach(([id, hx, v], i) => { const y = 100 + i * 64, a = seg(u, 0.2 + i * 0.35, 0.6 + i * 0.35); if (a <= 0) return;
        mono(40, y + 5, id, { 'font-size': 15, 'font-weight': 700, opacity: a }); grow(110, y, 200, y, a, MUT);
        mono(214, y + 5, '…' + hx, { 'font-size': 15, opacity: a }); mono(300, y + 5, parseInt(hx, 16) % 2 ? '홀' : '짝', { 'font-size': 15, 'font-weight': 700, opacity: a });
        const col = v === 'control' ? INFO : ACC; grow(340, y, 560, y, seg(u, 0.5 + i * 0.35, 0.9 + i * 0.35), col); pill(640, y, v, col, pop(u, 0.8 + i * 0.35), { mono: true, fs: 14 }); });
      mono(40, 376, 'user_1 다시 → …2b → control', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.2) });
      tx(940, 376, '같은 사용자는 늘 같은 그룹', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 2) { versions({});
      card(160, 120, 220, 50, { rx: 25, text: 'variant = "treatment"', mono: true, fs: 14, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      fly(160, 145, 400, 260, seg(u, 0.6, 1.3), 'treatment', { mono: true, stay: true });
      mono(40, 266, 'pull_prompt("customer_bot", tag=', { 'font-size': 14.5, opacity: fade(u, 0.5) }); mono(462, 266, ')', { 'font-size': 14.5, opacity: fade(u, 0.5) });
      grow(476, 256, 600, 184, seg(u, 1.4, 1.9), ACC); el('rect', { x: 572, y: 136, width: 360, height: 44, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      tx(480, 360, '코드에는 프롬프트도, 분기 if 도 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { const F = [['model', '"gpt-4"'], ['system', null], ['user', 'f"{context}\\n{question}"']];
      [['control', 'v1.0.0 본문', INFO], ['treatment', 'v2.0.0 본문', ACC]].forEach(([n, v, col], j) => { const x = 40 + j * 460;
        el('rect', { x, y: 50, width: 420, height: 240, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: fade(u, 0.1) }); mono(x + 16, 78, n, { 'font-size': 15, 'font-weight': 800, fill: col });
        F.forEach(([a, b], i) => { const y = 124 + i * 54, diff = b === null; if (diff) el('rect', { x: x + 10, y: y - 22, width: 400, height: 38, rx: 6, fill: col === ACC ? ACCBG : INFOBG, opacity: fade(u, 1.0) });
          mono(x + 20, y + 4, a, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.2) }); mono(x + 110, y + 4, diff ? v : b, { 'font-size': 14.5, 'font-weight': diff ? 800 : 400, fill: diff ? col : INK, opacity: fade(u, 0.3 + i * 0.2) });
          if (!diff && j === 1) check(x + 395, y, 8, pop(u, 1.4 + i * 0.2)); }); });
      tx(480, 340, '다른 것은 system 프롬프트 하나뿐', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.8) });
      sub(480, 370, '그래야 차이를 프롬프트 탓으로 돌릴 수 있다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 4) { const cols = [60, 220, 400, 720], H = ['user_id', 'variant', 'answer', 'ts'];
      el('rect', { x: 40, y: 50, width: 880, height: 270, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); tx(60, 40, 'log_event()', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
      H.forEach((h, i) => mono(cols[i], 84, h, { 'font-size': 14, 'font-weight': 800, fill: i === 1 ? ACC : MUT })); el('line', { x1: 50, y1: 96, x2: 910, y2: 96, stroke: GRID });
      USERS.forEach(([id, , v], i) => { const y = 132 + i * 44, a = fade(u, 0.3 + i * 0.3);
        mono(cols[0], y, id, { 'font-size': 14.5, opacity: a }); mono(cols[1], y, v, { 'font-size': 14.5, 'font-weight': 700, fill: v === 'control' ? INFO : ACC, opacity: fade(u, 0.5 + i * 0.3) });
        mono(cols[2], y, '"환불은 …"', { 'font-size': 14.5, fill: MUT, opacity: a }); mono(cols[3], y, 'now()', { 'font-size': 14.5, fill: MUT, opacity: a }); });
      el('rect', { x: 206, y: 66, width: 150, height: 250, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      tx(480, 368, 'variant 칸이 없으면 A/B 분석을 할 수 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k 5: 태그만 옮겨 끝낸다
    const m = E(u, 0.6, 1.6); versions({ prod: m <= 0 ? 1 : m >= 1 ? 2 : 0 });
    if (m > 0 && m < 1) fly(760, 104, 820, 154, m, 'production', { mono: true, fill: GOOD });
    tx(280, 100, 'treatment 가 8% 더 좋다 (예시)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
    tx(280, 130, '태그만 옮긴다 · 코드 변경 0', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
    tx(40, 250, '라우팅 전략은 함수만 바꾸면 된다', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.8) });
    ['Hash (결정론)', 'Random', 'Tier (vip)', 'Geo (KR)', 'Time-window'].forEach((s, i) => pill(110 + i * 180, 300, s, i === 0 ? ACC : INK, pop(u, 1.9 + i * 0.12), { fs: 14 })); }

  // ───────── 5. Rollback ─────────
  const T0 = 20, T1 = 60, TX = (m) => 110 + (m - T0) / (T1 - T0) * 800;   // 14:20 ~ 15:00
  const hm = (m) => `14:${String(m).padStart(2, '0')}`;
  function taxis(op) { el('line', { x1: 110, y1: 330, x2: 910, y2: 330, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [20, 25, 30, 35, 40, 45, 50, 55, 60].forEach((m) => { el('line', { x1: TX(m), y1: 330, x2: TX(m), y2: 336, stroke: MUT, opacity: op }); mono(TX(m), 356, m === 60 ? '15:00' : hm(m), { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op }); }); }
  const GIT = [[25, 30, '커밋 찾기'], [30, 35, 'revert PR'], [35, 42, 'CI'], [42, 45, 'merge'], [45, 55, '배포']];
  const REG = [[25, 26, 'UI'], [26, 27, '태그'], [27, 32, '캐시 TTL']];
  function bars(list, y, col, u, a0) { list.forEach(([a, b, s], i) => { const g = E(u, a0 + i * 0.22, a0 + 0.3 + i * 0.22); if (g <= 0) return;
      el('rect', { x: TX(a), y, width: (TX(b) - TX(a)) * g - 2, height: 36, rx: 5, fill: col, opacity: 0.85 });
      if (TX(b) - TX(a) > tw(s, 13.5) + 8) tx((TX(a) + TX(b)) / 2, y + 23, s, { 'text-anchor': 'middle', 'font-size': 13.5, fill: PANEL, 'font-weight': 700, opacity: g }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { el('line', { x1: 60, y1: 200, x2: lerp(60, 900, E(u, 0.1, 1.0)), y2: 200, stroke: INK, 'stroke-width': 3 });
      [[0, '14:00', 'v2.0.0 production 배포', ACC], [23, '14:23', '환각률 알람 5% → 12%', BAD], [25, '14:25', 'on-call 대응 시작', INK]].forEach(([m, h, s, col], i) => { const x = 120 + m * 28, sc = pop(u, 0.5 + i * 0.5);
        el('circle', { cx: x, cy: 200, r: 10 * sc, fill: col }); mono(x, 170 - (i === 2 ? 40 : 0), h, { 'text-anchor': i === 2 ? 'start' : 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: clamp(sc) });
        tx(x, 240 + i * 34, s, { 'text-anchor': i === 0 ? 'start' : 'middle', 'font-size': 15, 'font-weight': 700, opacity: clamp(sc) }); });
      sub(480, 370, '여기부터 지나가는 1분이 그대로 피해다 · 수치는 예시', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    taxis(1);
    if (k <= 2) { tx(40, 100, 'Git 만', { 'font-size': 15, 'font-weight': 800 }); bars(GIT, 80, MUT, k === 1 ? u : 3, 0.2);
      if (k === 1 ? u > 1.5 : true) { mono(TX(55) + 8, 104, '30분', { 'font-size': 18, 'font-weight': 800, fill: BAD }); }
      if (k === 2) { tx(40, 200, 'Registry', { 'font-size': 15, 'font-weight': 800, fill: ACC }); bars(REG, 180, ACC, u, 0.2);
        mono(TX(32) + 8, 204, '7분', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
        tx(480, 280, '남는 시간은 클릭이 아니라 캐시 TTL 5분', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); }
      if (k === 1) tx(480, 200, '코드 배포 경로를 다시 타야 한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      return; }
    return; }
  // k 3~5 는 축 없이 따로 그린다 (s5 를 감싼 함수)
  function s5b(t, c) { const { k, u } = c; if (k < 3) return s5(t, c);
    if (k === 3) { const ax = R.axes(100, 60, 520, 260, { x: [0, 10], y: [70, 105], yt: [70, 80, 90, 100], grid: true, yl: '최근 5분 품질 (baseline = 100)', xl: '분' });
      el('line', { x1: 100, y1: ax.Y(90), x2: 620, y2: ax.Y(90), stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
      tx(616, ax.Y(90) - 8, 'baseline × 0.90', { 'text-anchor': 'end', 'font-size': 14, fill: BAD, 'font-weight': 700 });
      const P = [[0, 100], [1, 99], [2, 101], [3, 100], [4, 98], [5, 93], [6, 88], [7, 84], [8, 83], [9, 84], [10, 83]];
      R.line(ax, P, E(u, 0.2, 1.8), INK); const s = pop(u, 1.8);
      card(790, 150, 250, 74, { rx: 12, stroke: BAD, sw: 2.5, fill: BADBG, s }); tx(790, 144, 'Auto rollback triggered', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: clamp(s) });
      mono(790, 168, '1분마다 검사', { 'text-anchor': 'middle', 'font-size': 14, opacity: clamp(s) }); sub(790, 260, '곡선 값은 예시', fade(u, 2.0)); return; }
    if (k === 4) { const m = E(u, 0.6, 1.6); vrow(0, 'v1.0.0', m > 0.5); vrow(1, 'v2.0.0', m <= 0.5);
      if (m > 0 && m < 1) fly(660, 250, 660, 130, m, 'production', { mono: true, fill: GOOD });
      card(200, 190, 240, 60, { rx: 12, text: 'lc.update_tags(…)', mono: true, fs: 15, stroke: ACC, s: pop(u, 0.2) }); grow(322, 190, 440, 190, seg(u, 0.4, 0.8), ACC);
      tx(480, 370, '사람이 깨어나기 전에 이전 안정 버전으로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    const V = [['단일 진실', '흩어진 사본을 한 곳으로'], ['Semantic Version', '호환성 약속'], ['태그 라우팅', 'A/B 인프라'], ['Hot-swap', '코드 배포 없이 반영'], ['비개발자 협업', 'UI 로 직접 수정']];
    V.forEach(([a, b], i) => { const x = 110 + i * 185, s = pop(u, 0.2 + i * 0.3);
      card(x, 200, 170, 150, { rx: 14, stroke: ACC, sw: 2, s }); mono(x, 160, String(i + 1), { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: ACC, opacity: clamp(s) });
      tx(x, 210, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: clamp(s) }); tx(x, 238, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); });
    tx(480, 340, '프롬프트가 코드 배포 없이 바꿔 끼우는 인프라가 된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); }
  function vrow(i, v, prod) { const y = 130 + i * 120; card(640, y, 360, 70, { rx: 12, stroke: prod ? GOOD : GRID, sw: 2 });
    mono(480, y + 6, v, { 'font-size': 17, 'font-weight': 800 }); if (prod) pill(740, y, 'production', GOOD, 1, { mono: true, fs: 14 }); }

  const quiz = [
    { q: '세 repo의 customer 프롬프트를 비교했을 때 가장 위험한 차이는 무엇인가?',
      o: ['"다"가 "이다"로 바뀐 어미', 'search 사본에서 환각 방지 제약 줄이 빠진 것', '파일 이름이 customer_v2.txt인 것'], a: 1,
      why: '어미 차이는 어색할 뿐이지만, 빠진 제약은 그 서비스만 환각을 내게 만든다. 사본이 늘면 이런 누락을 찾기 어렵다.' },
    { q: 'get_prompt()가 5분 캐시를 두는 이유는 무엇인가?',
      o: ['Registry 비용을 아끼려고 프롬프트를 압축하려고', '매 호출마다 Registry를 부르면 지연이 늘어서', '프롬프트를 5분마다 자동으로 바꾸려고'], a: 1,
      why: 'TTL 5분 안에는 메모리의 값을 바로 돌려주고, 지나면 한 번만 pull 한다. 대신 UI 수정은 최대 5분 뒤에 퍼진다.' },
    { q: '출력이 JSON에서 Markdown으로 바뀐 프롬프트에는 어떤 버전이 맞는가?',
      o: ['1.0.1 (patch)', '1.1.0 (minor)', '2.0.0 (major)'], a: 2,
      why: '출력 형식이 바뀌면 파싱하던 코드가 깨지므로 major다. 그래서 experimental 태그로만 먼저 노출한다.' },
    { q: 'ab_routing.py에서 같은 user_id가 늘 같은 그룹에 들어가는 이유는 무엇인가?',
      o: ['sha256 해시의 짝/홀로 정하기 때문', '첫 요청 때 그룹을 DB에 저장하기 때문', 'Registry가 사용자를 기억하기 때문'], a: 0,
      why: '해시는 같은 입력에 늘 같은 값을 낸다. user_1은 몇 번을 넣어도 끝자리 2b, 홀수라 control이다.' },
    { q: '이 장의 사고 시나리오에서 Registry로 되돌릴 때 걸린 시간과 그 대부분을 차지한 것은 무엇인가?',
      o: ['7분, 캐시 TTL 5분', '30분, CI 통과 대기', '1분, UI 클릭'], a: 0,
      why: '14:25에 UI를 열고 14:27에 태그를 옮겼다. 나머지 5분은 서버 캐시가 만료되기를 기다린 시간이다.' },
  ];

  const summary = [
    '프롬프트를 repo마다 복사하면 어미가 갈라지고 제약 줄이 빠져도 아무도 모른다.',
    'Registry 한 곳에 이름과 태그로 올리고 모든 서비스가 같은 주소로 pull 한다.',
    '버전은 출력 형식이면 major, 기능이면 minor, 문구면 patch로 올려 호환성을 약속한다.',
    'A/B 승격도 rollback도 태그를 옮기면 끝나고, 사고 복구가 30분에서 7분으로 준다.',
  ];
  const review = [
    { q: '마케팅 팀이 Registry UI에서 문구를 고쳤는데 한 서버만 3분째 옛 문구를 쓴다. 먼저 의심할 것은?',
      o: ['그 서버의 5분 캐시가 아직 만료되지 않았다', 'semantic version이 patch로 올라갔다', 'A/B 해시가 그 서버만 다르게 계산된다'], a: 0,
      why: 'get_prompt()는 TTL 5분 동안 메모리 값을 돌려준다. 수정은 최대 5분 뒤에 모든 서버로 퍼진다.' },
    { q: '클라이언트를 tag="latest" 로 두었더니 어느 날 JSON 파싱 오류가 쏟아졌다. 무엇이 일어났나?',
      o: ['캐시 TTL이 너무 짧아졌다', 'v2.0.0처럼 출력 형식을 바꾼 major 버전이 latest가 되었다', 'production 태그가 v1.0.1로 옮겨졌다'], a: 1,
      why: 'latest는 새 버전을 무조건 따라가므로 major 변경도 그대로 받는다. 운영 코드는 버전을 고정하거나 production 태그를 본다.' },
    { q: 'A/B 실험이 끝나 treatment를 채택하려 한다. Registry 방식에서 할 일은?',
      o: ['get_variant()를 지우고 새 코드를 배포한다', '세 repo의 prompts/ 폴더를 v2 본문으로 덮어쓴다', 'v2.0.0에 production을 붙이고 v1.0.0에서 뗀다'], a: 2,
      why: '호출부는 tag="production"만 알기 때문에 태그를 옮기면 코드 변경 없이 캐시 TTL 뒤에 반영된다.' },
  ];

  R.page({ title: 'Prompt Registry', scenes: [s1, s2, s3, s4, s5b], quiz, summary, review });
})();
