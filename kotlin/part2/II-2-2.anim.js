/* II-2-2 sealed class + when — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 봉인된 울타리(sealed 계층), 하위 타입 칸(object · data class), 컴파일러가 아는 자식 목록,
   when 의 갈래 길(값이 실제 타입에 맞는 길로 떨어진다), 빠진 갈래와 컴파일 에러. 값은 코드 그대로(User(1, "Park"), "환영합니다, Park") */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, G, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KW = /^(fun|val|var|when|is|if|else|for|in|return|class|data|sealed|object|enum|interface|abstract|out|null|true|false|this)$/;
  function toks(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = line.indexOf('"', i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  const kt = (x, y, s, o) => { o = o || {}; return spans(x, y, toks(s), { 'font-size': o.fs || 15, opacity: o.op ?? 1, 'text-anchor': o.anchor }, o.p); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  // 봉인 울타리: 굵은 테두리 + 봉인 자물쇠. open 이면 한쪽이 뚫린 점선
  function fence(x, y, w, h, o) { o = o || {}; const op = o.op ?? 1, col = o.open ? MUT : ACC;
    el('rect', { x, y, width: w, height: h, rx: 16, fill: o.open ? PANEL : ACCBG, stroke: col, 'stroke-width': o.open ? 2 : 3.4, 'stroke-dasharray': o.open ? '10 8' : null, opacity: op });
    if (!o.open && op > 0.5) lock(x + w - 26, y + 26, true, ACC, 0.9); }
  // 하위 타입 칸: 이름 + 종류 표 (+ 데이터 칸)
  function node(cx, cy, name, kind, o) { o = o || {}; const w = o.w || 150, h = o.payload ? 74 : 52, col = o.col || (kind === 'object' ? INFO : kind === 'data class' ? ACC : INK);
    const g = G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: kind === 'object' ? h / 2 : 10, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.hot ? 3.2 : 2.2, 'stroke-dasharray': o.dash }, g);
    mono(0, o.payload ? -12 : 2, name, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    if (kind) mono(0, o.payload ? 6 : 19, kind, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g);
    if (o.payload) mono(0, 28, o.payload, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, opacity: o.pop ?? 1 }, g);
    return g; }
  // 컴파일러가 아는 자식 목록
  function known(x, y, items, o) { o = o || {}; const h = 52 + Math.max(items.length, 1) * 34;
    el('rect', { x, y, width: 300, height: h, rx: 12, fill: PANEL, stroke: o.bad ? BAD : GRID, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    tx(x + 16, y + 28, '컴파일러가 아는 자식', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    items.forEach(([s, st], i) => { const yy = y + 62 + i * 34, op = st ?? 1; if (op <= 0.02) return;
      (s === '?' ? cross : check)(x + 30, yy - 5, 8, op); mono(x + 50, yy, s === '?' ? '??? (모른다)' : s, { 'font-size': 15, 'font-weight': 700, fill: s === '?' ? BAD : INK, opacity: op }); });
    if (o.tag) mono(x + 284, y + 28, o.tag, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: o.bad ? BAD : GOOD, opacity: o.op ?? 1 }); }
  const SUBS = [['Loading', 'object'], ['Success', 'data class'], ['Error', 'data class']];
  const SX = [110, 275, 440];

  // ---------- 1. sealed class — 닫힌 계층 ----------
  function s1(t, c) { const { k, u } = c;
    const open = k === 3;
    fence(30, 50, 490, 300, { open, op: k === 0 ? fade(u, 0.6) : 1 });
    card(275, 100, 260, 48, { rx: 10, text: open ? 'abstract class UiState' : 'sealed class UiState', mono: true, fs: 15.5, stroke: open ? INK : ACC, color: open ? INK : ACC, fill: PANEL, sw: 2.6, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { known(600, 80, [], { op: fade(u, 1.0), tag: '0개' }); note(275, 230, '자식이 아직 없다', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT });
      sub(750, 210, '울타리만 쳤다 · 검사할 대상도 없다', fade(u, 1.8), { 'font-size': 15 }); return; }
    SUBS.forEach(([n, kd], i) => { const at = 0.3 + i * 0.35, f = k === 1 ? E(u, at, at + 0.5) : 1;
      el('line', { x1: 275, y1: 124, x2: SX[i], y2: lerp(124, 214, f), stroke: open ? MUT : ACC, 'stroke-width': 2, opacity: f });
      node(SX[i], lerp(150, 245, f), n, kd, { w: 150, op: clamp(f * 2) }); });
    const items = SUBS.map(([n], i) => [n, k === 1 ? fade(u, 0.8 + i * 0.35) : 1]);
    if (k === 1) { known(600, 80, items, { tag: '3개' }); sub(750, 300, '이 목록이 뒤에서 when 검사의 근거가 된다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { known(600, 80, items, { tag: '3개 = 전부' });
      const b = Math.sin(seg(u, 0.6, 1.4) * Math.PI) * 60;
      card(720 - b * 2.6 + 120, 360, 230, 44, { rx: 9, text: 'class Hack : UiState()', mono: true, fs: 14.5, stroke: BAD, color: BAD, fill: BADBG, op: fade(u, 0.3) });
      if (u > 1.0) cross(540, 330, 12, pop(u, 1.0));
      sub(750, 300, '다른 모듈·패키지에서는 상속할 수 없다', fade(u, 1.5), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    // k === 3 : abstract 라면
    const f = E(u, 0.5, 1.3); node(lerp(620, 280, f), lerp(380, 318, f), '???', '외부 상속', { w: 130, col: BAD, dash: '5 4', op: fade(u, 0.4) });
    known(600, 60, [...items, ['?', fade(u, 1.5)]], { tag: '모른다', bad: true });
    sub(275, 395, '어디서든 상속할 수 있어 목록을 보장하지 못한다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // ---------- 2. enum 보다 유연 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { kt(40, 60, 'enum class Status { LOADING, SUCCESS, ERROR }', { fs: 16 });
      ['LOADING', 'SUCCESS', 'ERROR'].forEach((n, i) => card(150 + i * 200, 150, 170, 52, { rx: 6, text: n, mono: true, fs: 16, stroke: INK, fill: SOFT, sw: 2.4, s: pop(u, 0.2 + i * 0.15) }));
      [['user: User', 350, 0.8], ['message: String', 550, 1.3]].forEach(([s, x, at]) => { const f = E(u, at, at + 0.4), back = E(u, at + 0.45, at + 0.8);
        const y = lerp(290, 190, f) + back * 60; card(x, y, 150, 36, { rx: 8, text: s, mono: true, fs: 14, stroke: WARN, color: WARN, fill: WARNBG, op: fade(u, at - 0.2) });
        if (u > at + 0.45) cross(x + 88, 186, 9, pop(u, at + 0.45)); });
      note(40, 345, '상수는 모양이 전부 같아서 담을 자리가 없다', fade(u, 2.0), { fill: BAD });
      mono(40, 385, '→ user: User? · message: String? 를 덧대게 된다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
    fence(30, 50, 520, 300, { op: k === 1 ? fade(u, 0.3) : 1 });
    card(290, 96, 230, 44, { rx: 10, text: 'sealed class UiState', mono: true, fs: 15, stroke: ACC, color: ACC, fill: PANEL, sw: 2.4 });
    const PL = [null, 'user: User', 'message: String'];
    SUBS.forEach(([n, kd], i) => { const x = 120 + i * 170, m = k === 1 ? E(u, 0.4 + i * 0.2, 1.0 + i * 0.2) : 1;
      el('line', { x1: 290, y1: 118, x2: x, y2: 200, stroke: ACC, 'stroke-width': 2, opacity: m });
      if (k === 1 && m < 1) card(x, 250, 150, 52, { rx: 6, text: ['LOADING', 'SUCCESS', 'ERROR'][i], mono: true, fs: 15, stroke: INK, fill: SOFT, op: 1 - m });
      const pay = k >= 2 ? (PL[i] || '(데이터 없음)') : null;
      node(x, 250, n, kd, { w: 160, op: m, payload: pay, pop: k === 2 ? fade(u, 0.4 + i * 0.4) : 1, hot: k === 2 && u > 0.4 + i * 0.4 && u < 1.0 + i * 0.4 }); });
    if (k === 1) { note(600, 150, '자식마다 모양이 달라도 된다', fade(u, 1.6), { fill: ACC }); note(600, 185, '각자 다른 생성자와 프로퍼티', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 2) { note(600, 130, 'Loading · 값 없음 → object', fade(u, 0.5), { fill: INFO });
      note(600, 170, 'Success · 결과 user', fade(u, 0.9), { fill: ACC }); note(600, 210, 'Error · 메시지 message', fade(u, 1.3), { fill: ACC });
      sub(745, 290, 'enum 이면 nullable 필드로 덧댈 것을', fade(u, 1.9), { 'font-size': 14.5 }); sub(745, 315, '타입으로 나눴다', fade(u, 2.1), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); return; }
    // k === 3 : object 는 하나, data class 는 값마다
    el('rect', { x: 570, y: 50, width: 370, height: 330, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    ['a', 'b'].forEach((r, i) => { const y = 110 + i * 50; mono(600, y + 5, r, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      grow(622, y, 692, 130, E(u, 0.3 + i * 0.2, 0.6 + i * 0.2), INFO); });
    card(760, 132, 140, 46, { rx: 23, text: 'Loading', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.2) });
    sub(760, 180, '인스턴스 하나 (싱글턴)', fade(u, 0.8), { 'font-size': 14.5, fill: INFO, 'font-weight': 700 });
    [0, 1].forEach((i) => card(670 + i * 180, 250, 170, 50, { rx: 8, text: 'Success(\nUser(1, "Park"))', mono: true, fs: 13.5, stroke: ACC, s: pop(u, 1.1 + i * 0.2) }));
    mono(755, 255, '==', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6) });
    mono(755, 320, 'true', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) });
    sub(755, 355, '값이 같으면 같다 · equals/copy 무료', fade(u, 2.2), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); }

  // ---------- 3. when 완전성 검사 + 스마트 캐스트 ----------
  const LX = [170, 480, 790];
  function lanes(o) { o = o || {};
    kt(40, 70, 'fun render(state: UiState): String = when (state) {', { fs: 15, op: o.hop ?? 1 });
    SUBS.forEach(([n], i) => { const x = LX[i], f = o.fill ? o.fill[i] : 0, hot = o.hot === i;
      el('rect', { x: x - 140, y: 110, width: 280, height: 190, rx: 12, fill: hot ? GOODBG : f > 0.5 ? PANEL : SOFT, stroke: hot ? GOOD : f > 0.5 ? INK : GRID, 'stroke-width': hot ? 3 : 2, 'stroke-dasharray': f > 0.5 ? null : '7 5', opacity: o.op ?? 1 });
      if (f > 0) { kt(x - 124, 140, `is UiState.${n} ->`, { fs: 15, op: f }); }
      else mono(x, 140, `${n} ?`, { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 });
      if (o.out && f > 0) mono(x, 180, o.out[i], { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, opacity: f }); }); }
  const OUTS = ['"로딩 중..."', '"환영합니다, …"', '"오류: …"'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { lanes({ hop: fade(u, 0.2), op: fade(u, 0.6) });
      pill(800, 360, '완전성 검사 ON', GOOD, pop(u, 1.5), { fs: 15 });
      sub(330, 362, '값으로 쓰는 when · 갈래 자리는 아직 비어 있다', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 1) { lanes({ fill: [0, 1, 2].map((i) => fade(u, 0.3 + i * 0.4)), out: OUTS });
      SUBS.forEach((_, i) => check(LX[i] + 110, 280, 9, pop(u, 0.6 + i * 0.4)));
      card(170, 360, 180, 40, { rx: 8, text: 'else ->', mono: true, fs: 15, stroke: OFF, color: OFF, dash: '5 4', op: fade(u, 1.6) }); cross(270, 360, 9, pop(u, 1.9));
      pill(800, 360, '3 / 3 처리 · else 불필요', GOOD, pop(u, 2.1), { fs: 15 }); return; }
    const all = [1, 1, 1];
    if (k === 2 || k === 3) { const hot = k === 2 ? (u > 1.4 ? 1 : null) : 1;
      lanes({ fill: all, out: ['"로딩 중..."', k === 3 && u > 1.6 ? '"환영합니다, Park"' : '"환영합니다, …"', '"오류: …"'], hot });
      if (k === 2) { const f = E(u, 0.3, 1.3); card(lerp(480, 480, f), lerp(20, 240, f), 260, 40, { rx: 20, text: 'Success(User(1, "Park"))', mono: true, fs: 14, stroke: 'none', fill: ACC, color: PANEL, op: fade(u, 0.2) });
        if (u > 1.4) { grow(480, 300, 480, 345, E(u, 1.6, 1.9), GOOD); }
        if (u > 1.9) card(480, 375, 260, 42, { rx: 9, text: '"환영합니다, Park"', mono: true, fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.9) });
        sub(800, 380, '실제 타입이 길을 고른다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      // k === 3 : 스마트 캐스트 — 가지 안에서 state 의 타입이 좁혀진다
      card(480, 240, 220, 36, { rx: 18, text: u > 0.9 ? 'state: Success' : 'state: UiState', mono: true, fs: 15, stroke: 'none', fill: u > 0.9 ? GOOD : ACC, color: PANEL, s: 1 + bump(u, 0.9) });
      kt(370, 210, '${state.user.name}', { fs: 14.5, op: fade(u, 1.3) });
      if (u < 1.2) { lock(590, 206, true, BAD, 0.8); } else { check(600, 204, 8, pop(u, 1.2)); }
      mono(480, 345, 'state as Success', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      el('line', { x1: 480 - 65, y1: 340, x2: 480 - 65 + 130 * E(u, 2.0, 2.3), y2: 340, stroke: BAD, 'stroke-width': 2.4 });
      sub(480, 385, '캐스팅 없이 user 에 바로 닿는다', fade(u, 2.2), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    // k === 4 : Loading 도 같은 길로
    lanes({ fill: all, out: OUTS, hot: u > 1.3 ? 0 : null });
    const f = E(u, 0.3, 1.2); card(lerp(480, 170, f), lerp(20, 240, f), 170, 40, { rx: 20, text: 'UiState.Loading', mono: true, fs: 14, stroke: 'none', fill: INFO, color: PANEL, op: fade(u, 0.2) });
    if (u > 1.4) { grow(170, 300, 170, 345, E(u, 1.5, 1.8), GOOD); if (u > 1.8) card(170, 375, 200, 42, { rx: 9, text: '"로딩 중..."', mono: true, fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.8) }); }
    sub(640, 380, 'else 없이도 어떤 값이든 갈 곳이 있다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 4. 하위 타입 추가 → 컴파일 에러 ----------
  const S4 = SUBS.concat([['Empty', 'object']]);
  function col4(k, u, o) { o = o || {};
    fence(30, 40, 300, 360, {});
    mono(180, 72, 'sealed UiState', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    S4.forEach(([n, kd], i) => { const y = 110 + i * 66, isNew = i === 3, s = isNew && k === 0 ? pop(u, 0.4) : 1;
      node(170, y, n, kd, { w: 170, s, hot: isNew && (o.hotEmpty ?? true), col: isNew ? WARN : null });
      if (isNew) pill(285, y - 24, 'NEW', WARN, s, { fs: 13.5 }); }); }
  function s4(t, c) { const { k, u } = c;
    col4(k, u);
    if (k === 0) { known(560, 80, S4.map(([n], i) => [n, i === 3 ? fade(u, 1.0) : 1]), { tag: Math.round(tween(3, 4, u - 0.9, 0.3)) + '개' });
      sub(710, 330, '요구사항이 늘면 울타리에 갈래를 하나 더 넣는다', fade(u, 1.8), { 'font-size': 15 }); return; }
    // 오른쪽: 예전에 쓴 when (갈래 3개)
    el('rect', { x: 560, y: 40, width: 380, height: 300, rx: 12, fill: PANEL, stroke: k === 3 ? BAD : INK, 'stroke-width': k === 3 ? 3 : 2 });
    kt(576, 68, 'when (state) {', { fs: 15 });
    S4.forEach(([n], i) => { const y = 110 + i * 66;
      if (i < 3) { el('rect', { x: 580, y: y - 22, width: 340, height: 44, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); kt(596, y + 5, `is ${n} -> …`, { fs: 15 }); }
      else if (k >= 2) { el('rect', { x: 580, y: y - 22, width: 340, height: 44, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) });
        mono(596, y + 5, 'is Empty -> ??? 없음', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) }); }
      const g = k === 1 ? E(u, 0.3 + i * 0.3, 0.6 + i * 0.3) : 1;
      if (i < 3) grow(258, y, lerp(258, 576, g), y, g, GOOD, { plain: g < 1 }); });
    if (k === 1) { if (u > 1.4) { grow(258, 308, 420, 308, E(u, 1.4, 1.7), BAD, { plain: true }); mono(450, 314, '?', { 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) }); }
      pill(750, 380, '하위 타입 4 vs 갈래 3', BAD, pop(u, 2.0), { fs: 15 }); return; }
    if (k === 2) { const f = E(u, 0.8, 1.7); card(lerp(170, 500, f), 308, 90, 34, { rx: 17, text: 'Empty', mono: true, fs: 14.5, stroke: 'none', fill: WARN, color: PANEL, op: fade(u, 0.7) });
      if (u > 1.7) cross(500, 274, 12, pop(u, 1.7));
      sub(750, 380, '갈 곳 없는 값 · 사람이 찾을 필요는 없다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    // k === 3 : 빌드 실패
    terminal(360, 338, 580, 80, ["e: 'when' expression must be exhaustive,", "   add necessary 'is Empty' branch or 'else' branch instead"].map((s) => [s, '#fca5a5']), 2 * E(u, 0.3, 1.4), { fs: 13.5, lh: 18 });
    pill(750, 18 + 0, '빌드 실패', BAD, pop(u, 0.2), { fs: 14 }); }

  // ---------- 5. else 로 안전망을 끄지 마라 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const bad = k === 0;
      kt(40, 60, bad ? 'fun renderBad(state: UiState) = when (state) {' : 'fun render(state: UiState): String = when (state) {', { fs: 15 });
      const L = bad ? [['is UiState.Success -> showUser(…)', 180, 1], ['else -> Unit', 590, 2.1]] : [['is Loading -> "로딩"', 170, 1], ['is Success -> "성공: …"', 480, 1], ['is Error -> "실패: …"', 790, 1]];
      L.forEach(([s, x, wf]) => { const w = 280 * (bad ? (wf > 1 ? 1.55 : 1.15) : 1);
        el('rect', { x: x - w / 2, y: 100, width: w, height: 170, rx: 12, fill: bad && wf > 1 ? WARNBG : PANEL, stroke: bad && wf > 1 ? WARN : INK, 'stroke-width': 2.2 });
        kt(x - w / 2 + 14, 130, s, { fs: 15 }); });
      if (bad) { const toks2 = [['Loading', INFO, 0.3], ['Error', ACC, 0.8], ['Empty (나중에 추가)', WARN, 1.3]];
        toks2.forEach(([s, col, at], i) => { const f = E(u, at, at + 0.6); card(lerp(480, 520 + i * 70, f), lerp(20, 200 + (i % 2) * 34, f), tw(s, 13.5) + 30, 30, { rx: 15, text: s, fs: 13.5, mono: true, stroke: 'none', fill: col, color: PANEL, op: fade(u, at - 0.1) * (1 - 0.5 * E(u, at + 0.7, at + 1.0)) }); });
        pill(200, 330, '완전성 검사 OFF', BAD, pop(u, 1.8), { fs: 15 });
        sub(620, 335, '빌드는 통과 · 새 상태가 Unit 으로 조용히 샌다', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
      [0, 1, 2].forEach((i) => check([170, 480, 790][i] + 110, 250, 9, pop(u, 0.5 + i * 0.3)));
      card(480, 330, 180, 40, { rx: 8, text: 'else ->', mono: true, fs: 15, stroke: OFF, color: OFF, dash: '5 4', op: 1 - fade(u, 1.0) * 0.4 });
      if (u > 1.0) cross(580, 330, 9, pop(u, 1.0));
      pill(480, 390, '완전성 검사 다시 ON · 새 하위 타입이 생기면 여기서 에러', GOOD, pop(u, 1.8), { fs: 15 }); return; }
    if (k === 2) { fence(30, 50, 560, 300, {});
      card(310, 96, 300, 44, { rx: 10, text: 'sealed interface ApiResult<out T>', mono: true, fs: 14.5, stroke: ACC, color: ACC, fill: PANEL, sw: 2.4 });
      [['Ok<T>', 'data class', 'value: T', 170], ['Fail', 'data class', 'code: Int', 450]].forEach(([n, kd, p, x], i) => { const s = pop(u, 0.4 + i * 0.4);
        el('line', { x1: 310, y1: 118, x2: x, y2: 210, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.4 + i * 0.4) });
        node(x, 250, n, kd, { w: 200, payload: p, s }); });
      mono(450, 318, ': ApiResult<Nothing>', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3) });
      note(630, 140, '성공 · 실패가 갈리는 값도', fade(u, 1.5)); note(630, 172, '같은 방식으로 봉인한다', fade(u, 1.7), { fill: ACC });
      sub(780, 240, 'when 이 두 갈래를 강제한다', fade(u, 2.1), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    // k === 3 : 체크리스트
    [['when 은 값으로 쓴다', '모든 갈래를 다뤄야 컴파일된다'], ['sealed 대상 when 에 else 금지', '하위 타입이 늘면 컴파일러가 다시 짚는다'], ['갈래는 data class · object', '갈래별 데이터를 타입으로 담는다']].forEach(([a, b], i) => {
      const y = 100 + i * 90, s = pop(u, 0.3 + i * 0.5);
      card(480, y, 760, 70, { rx: 12, stroke: GOOD, sw: 2, fill: PANEL, s }); check(140, y, 14, s);
      tx(175, y - 4, a, { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.5) });
      tx(175, y + 22, b, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5 + i * 0.5) }); });
    sub(480, 390, 'UI 상태 · Result · 파싱 결과에 그대로 쓰는 기본값', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'sealed class와 abstract class의 차이 중 when 검사에 쓰이는 것은 무엇인가?',
      o: ['sealed는 인스턴스를 만들 수 있다', 'sealed는 자식 목록을 컴파일러가 전부 안다', 'abstract는 생성자를 가질 수 없다'], a: 1,
      why: 'sealed의 하위 타입은 같은 모듈·패키지에만 둘 수 있어 목록이 닫혀 있다. abstract는 어디서든 상속돼 목록을 보장하지 못한다.' },
    { q: '성공에는 user, 실패에는 message를 담아야 할 때 enum 대신 sealed class를 쓰는 이유는 무엇인가?',
      o: ['enum은 when에 넣을 수 없어서', 'sealed가 더 빨라서', 'sealed는 갈래마다 다른 프로퍼티를 가질 수 있어서'], a: 2,
      why: 'enum 상수는 모양이 모두 같다. sealed의 자식은 Success(user), Error(message)처럼 각자 다른 데이터를 담는다.' },
    { q: 'is UiState.Success 가지 안에서 state.user를 캐스팅 없이 쓸 수 있는 이유는 무엇인가?',
      o: ['스마트 캐스트로 state가 Success로 좁혀져서', 'user가 UiState의 멤버라서', 'when이 state를 복사해서'], a: 0,
      why: 'is 검사를 통과한 가지 안에서는 컴파일러가 state를 Success로 다룬다. 그래서 "환영합니다, Park"를 바로 만든다.' },
    { q: 'UiState에 Empty를 추가했는데 기존 when이 셋만 다룬다. 무엇이 일어나는가?',
      o: ['런타임에 Empty가 else로 간다', '컴파일 에러가 나서 빠진 is Empty 갈래를 알려 준다', 'Empty가 Loading으로 처리된다'], a: 1,
      why: 'sealed 대상 when은 모든 하위 타입을 다뤄야 한다. 처리를 놓친 when이 빌드 단계에서 드러난다.' },
    { q: 'sealed 타입 when에 else -> Unit을 붙이면 무엇을 잃는가?',
      o: ['스마트 캐스트', 'data class의 equals', '하위 타입이 늘었을 때의 컴파일 에러'], a: 2,
      why: 'else가 남은 갈래를 모두 받아 버려 완전성 검사가 꺼진다. 새 상태가 조용히 else로 흘러 런타임 버그가 된다.' },
  ];
  const summary = [
    'sealed class는 하위 타입을 같은 모듈·패키지 안으로 닫아 컴파일러가 자식 목록을 전부 안다.',
    '자식마다 다른 데이터를 가질 수 있어 성공은 user, 실패는 message처럼 타입으로 나뉜다.',
    'when이 모든 하위 타입을 다루면 else가 필요 없고, is 가지 안에서는 스마트 캐스트가 걸린다.',
    '하위 타입을 추가하면 놓친 when이 컴파일 에러로 드러나므로 else를 붙이지 않는다.',
  ];
  const review = [
    { q: '결제 상태에 Refunded를 추가했더니 빌드가 여러 곳에서 깨졌다. 가장 알맞은 대응은?',
      o: ['깨진 when마다 else를 붙인다', '깨진 when마다 is Refunded 갈래를 적는다', 'sealed를 abstract로 바꾼다'], a: 1,
      why: '컴파일러가 처리를 놓친 지점을 짚어 준 것이다. else를 붙이면 다음 추가 때 이 안내마저 사라진다.' },
    { q: '로딩 상태는 데이터가 없고 하나면 충분하다. 하위 타입을 무엇으로 선언하는가?',
      o: ['object Loading', 'data class Loading(val v: Int)', 'enum class Loading'], a: 0,
      why: '값이 없는 상태는 인스턴스 하나로 충분하니 object로 둔다. 값마다 달라지는 갈래만 data class로 만든다.' },
    { q: 'API 응답을 Ok(value)와 Fail(code)로 나눠 화면에 그리려 한다. 처리 누락을 막는 구성은?',
      o: ['Int 상태 코드와 if 문', 'abstract class와 else가 있는 when', 'sealed interface ApiResult와 else 없는 when'], a: 2,
      why: 'sealed로 갈래를 닫고 else 없이 when으로 받으면 두 갈래를 모두 다뤄야 컴파일된다.' },
  ];

  R.page({ title: '봉인된 계층 — sealed class + when', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
