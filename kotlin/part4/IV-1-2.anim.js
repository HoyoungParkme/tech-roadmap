/* IV-1-2 Jetpack Compose — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 대상: 상태 칸과 화면, Composable 함수가 만드는 노드 트리, remember 가 지키는 State 상자와 구독 선,
 * recomposition 때 다시 호출되는 노드와 건너뛰는 노드, LazyColumn 창과 Modifier 층. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, person, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function phone(cx, cy, w, h, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: Math.min(w, h) > 120 ? 22 : 14, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5, opacity: op });
    if (w < h) el('line', { x1: cx - 16, y1: cy - h / 2 + 12, x2: cx + 16, y2: cy - h / 2 + 12, stroke: OFF, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: op });
    else el('line', { x1: cx - w / 2 + 12, y1: cy - 16, x2: cx - w / 2 + 12, y2: cy + 16, stroke: OFF, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: op });
    return { x0: cx - w / 2 + 10, y0: cy - h / 2 + 24, x1: cx + w / 2 - 10, y1: cy + h / 2 - 14 }; }
  const ripple = (x, y, f) => { if (f > 0 && f < 1) el('circle', { cx: x, cy: y, r: 8 + 30 * f, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: 1 - f }); };
  // 트리 노드(작은 판) + 오른쪽 상태 표시
  function node(x, y, w, s, o) { o = o || {};
    card(x + w / 2, y, w, 30, { rx: 6, text: s, fs: 14, mono: true, stroke: o.col || INK, color: o.col || INK, fill: o.fill, sw: o.col ? 2.4 : 1.8, s: o.s, op: o.op }); }
  function tag(x, y, s, col, op) { tx(x, y + 5, s, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: op ?? 1 }); }

  // ---------- 1. 명령형: 상태와 화면을 사람이 잇는다 ----------
  const SYNC = [[0, null], [1, '1'], [0, '0'], [2, '1']];   // [count 상태, tvCount 표시] — 페이지 설명의 값
  function s1(t, c) { const { k, u } = c, [cv, ui] = SYNC[k], [pv] = k ? SYNC[k - 1] : SYNC[0];
    // 상태 칸
    card(170, 150, 210, 120, { rx: 12, stroke: INFO, sw: 2.5, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(80, 112, 'var count', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: k === 0 ? fade(u, 0.3) : 1 });
    const shown = k === 0 ? 0 : tween(pv, cv, seg(u, 0.4, 1.0) * 3);
    mono(170, 178, String(Math.round(shown)), { 'font-size': 44, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: k === 0 ? fade(u, 0.3) : 1 });
    lbl(170, 236, '상태', 1, { fill: MUT });
    // 화면
    const sc = phone(790, 200, 180, 300);
    sub(790, 92, 'tvCount', 1, { class: 'mono' });
    const uiNow = k === 1 || k === 2 ? (u > 1.9 ? ui : SYNC[k - 1][1]) : ui;
    card(790, 130, 140, 56, { rx: 8, text: uiNow == null ? '' : uiNow, fs: 30, mono: true, stroke: k === 3 && u > 1.5 ? BAD : INK, color: k === 3 && u > 1.5 ? BAD : INK });
    card(745, 230, 66, 40, { rx: 20, text: '+', fs: 20, fill: ACCBG, stroke: ACC, color: ACC });
    card(835, 230, 90, 40, { rx: 20, text: 'Reset', fs: 14, mono: true, fill: ACCBG, stroke: ACC, color: ACC });
    lbl(790, 380, '화면', 1, { fill: MUT });
    if (k === 1 || k === 3) ripple(745, 230, seg(u, 0.1, 0.8)); if (k === 2) ripple(835, 230, seg(u, 0.1, 0.8));
    // 잇는 길: 사람 손
    person(480, 265, '개발자가 직접 잇는다', { s: k === 0 ? pop(u, 0.9) : 1 });
    if (k === 0) { el('line', { x1: 280, y1: 150, x2: 700, y2: 150, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '8 7', opacity: fade(u, 0.5) });
      tx(490, 138, '연결 장치 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) }); }
    if (k === 1) { grow(280, 150, 712, 140, E(u, 1.0, 1.4), ACC); fly(290, 130, 760, 130, seg(u, 1.1, 1.9), 'count.toString()', { mono: true }); }
    if (k === 2) { grow(530, 330, 712, 150, E(u, 1.0, 1.4), WARN); fly(520, 340, 770, 130, seg(u, 1.1, 1.9), '"0"', { mono: true, fill: WARN }); }
    if (k === 3) { el('line', { x1: 280, y1: 150, x2: 700, y2: 150, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '8 7' }); cross(490, 150, 12, pop(u, 0.9));
      banner(480, 60, '상태 2 ≠ 화면 1', pop(u, 1.5));
      tx(480, 105, '컴파일러는 아무 경고도 하지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }
    // 아래: 핸들러마다 갱신 줄
    const lines = [['btnPlus  { count++; tvCount.text = count.toString() }', k >= 1, INK], ['btnReset { count = 0; tvCount.text = "0" }', k >= 2, WARN], ['어딘가   { count++ }   // 갱신 줄 빠짐', k >= 3, BAD]];
    lines.forEach(([s, on, col], i) => { if (!on) return; const op = k === [1, 2, 3][i] ? fade(u, 0.2) : 1;
      mono(40, 350 + i * 26, s, { 'font-size': 14, fill: col, opacity: op, 'font-weight': i === 2 ? 700 : 400 }); });
    if (k === 2) tx(560, 404, `갱신 지점 ${u > 1.9 ? 2 : 1}곳`, { 'font-size': 15, 'font-weight': 800, fill: WARN }); }

  // ---------- 2. @Composable: 상태 → UI 트리 ----------
  const TREE = [ // [깊이, 이름, 등장 beat]
    [0, 'Column', 1], [1, 'Greeting(name)', 2], [2, 'Text', 2], [1, 'Text("나이: $age")', 2], [1, 'Button(onClick)', 3], [2, 'Text("자세히")', 3]];
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: 함수 카드
    const fcard = (y, a, b, s, col) => { card(190, y, 300, 70, { rx: 10, stroke: col || ACC, sw: 2, fill: ACCBG, s });
      mono(52, y - 8, a, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: clamp(s) }); mono(52, y + 18, b, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s) }); };
    fcard(100, '@Composable', 'Greeting(name: String)', k === 0 ? pop(u, 0.2) : 1);
    if (k >= 1) fcard(210, '@Composable', 'Profile(name, age)', k === 1 ? pop(u, 0.2) : 1);
    if (k === 4) { card(190, 330, 300, 60, { rx: 10, stroke: INFO, sw: 2.2, fill: INFOBG, s: pop(u, 0.2) });
      mono(52, 336, 'setContent { Profile("Alice", 30) }', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      fly(110, 316, 240, 228, seg(u, 0.6, 1.3), '"Alice"', { mono: true, fill: INFO }); fly(250, 316, 290, 228, seg(u, 0.8, 1.5), '30', { mono: true, fill: INFO }); }
    // 가운데: 노드 트리
    lbl(470, 52, 'UI 트리', 1, { fill: MUT });
    if (k === 0) { node(380, 110, 180, 'Text', { s: pop(u, 0.9), col: ACC }); grow(340, 100, 378, 108, E(u, 0.6, 0.9), ACC);
      pill(470, 180, 'findViewById · setText 없음', GOOD, pop(u, 1.6), { fs: 13.5 }); }
    else TREE.forEach(([d, s, b], i) => { if (k < b) return; const y = 90 + i * 46, x = 380 + d * 26, sc = k === b ? pop(u, 0.3 + i * 0.15) : 1;
      if (d > 0) { const py = 90 + (TREE.slice(0, i).map((r, j) => [r[0], j]).filter(([dd]) => dd === d - 1).pop()[1]) * 46;
        el('path', { d: `M${x - 14},${py + 15} V${y} H${x}`, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: sc > 0 ? 1 : 0 }); }
      node(x, y, s.length > 14 ? 200 : 160, s, { s: sc, col: k === b ? ACC : null });
      if (s === 'Button(onClick)') pill(x + 230, y, 'λ onClick', WARN, sc, { fs: 13.5, mono: true }); });
    // 오른쪽: 미리보기
    const sc = phone(800, 210, 190, 290); const live = k === 4 && u > 1.4;
    const nm = live ? 'Alice' : '$name', ag = live ? '30' : '$age';
    if (k === 0) tx(800, 130, `안녕하세요, ${nm} 님`, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, opacity: fade(u, 1.1) });
    if (k >= 1) el('rect', { x: sc.x0 + 6, y: sc.y0 + 10, width: sc.x1 - sc.x0 - 12, height: 160, rx: 6, fill: 'none', stroke: MUT, 'stroke-dasharray': '5 4', 'stroke-width': 1.5, opacity: k === 1 ? fade(u, 0.6) : 1 });
    if (k >= 2) { tx(sc.x0 + 14, 120, `안녕하세요, ${nm} 님`, { 'font-size': 14, 'font-weight': 600, fill: live ? INK : MUT, opacity: k === 2 ? fade(u, 0.8) : 1 });
      tx(sc.x0 + 14, 152, `나이: ${ag}`, { 'font-size': 14, 'font-weight': 600, fill: live ? INK : MUT, opacity: k === 2 ? fade(u, 1.1) : 1 }); }
    if (k >= 3) card(sc.x0 + 56, 192, 90, 36, { rx: 18, text: '자세히', fs: 14, fill: ACCBG, stroke: ACC, color: ACC, s: k === 3 ? pop(u, 1.0) : 1 });
    if (k === 4) { banner(800, 390, '같은 입력이면 언제나 같은 화면', pop(u, 2.0)); } }

  // ---------- 3. State + remember: 읽은 곳이 구독자가 된다 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 3) return s3rot(u);
    const v = k === 2 ? (u > 0.9 ? 1 : 0) : 0, flash = k === 2 ? seg(u, 1.4, 2.4) : 0;
    zone(40, 60, 270, 200, 'Composition 메모리 (remember)', { fill: SOFT });
    card(175, 160, 200, 90, { rx: 10, stroke: INFO, sw: 2.5, fill: PANEL, s: k === 0 ? pop(u, 0.3) : 1 });
    mono(90, 136, 'mutableStateOf', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 0 ? fade(u, 0.4) : 1 });
    mono(175, 186, String(v), { 'font-size': 36, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: k === 0 ? fade(u, 0.4) : 1 });
    if (k === 2) ripple(175, 172, seg(u, 0.8, 1.4));
    // Counter() 호출 표시
    const calls = k === 2 && u > 1.4 ? 2 : 1;
    pill(175, 300, `Counter() 호출 #${calls}`, INK, k === 0 ? pop(u, 0.9) : 1, { fs: 14, mono: true });
    if (k === 0) { sub(175, 340, '다시 호출돼도 같은 상자를 돌려받는다', fade(u, 1.4), { 'font-size': 14.5 });
      tx(175, 372, 'remember가 없으면 호출마다 0', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); }
    // 가운데 트리
    const N = [['Column', 380, 90], ['Text("Count: $count")', 400, 150], ['Row', 400, 210], ['Button("+")', 420, 270], ['Button("Reset")', 420, 330]];
    N.forEach(([s, x, y], i) => { const re = i === 1 && flash > 0, sk = k === 2 && u > 1.6 && i >= 3;
      node(x, y, i === 1 ? 210 : 150, s, { col: re ? ACC : null, fill: re ? ACCBG : null, op: k === 0 ? fade(u, 0.5) : 1 });
      if (sk) tag(x + 160, y, 'skip', MUT); });
    if (k === 2 && u > 1.6) tag(620, 150, '재호출', ACC);
    // 구독 선
    if (k >= 1) { const g = k === 1 ? E(u, 0.4, 1.2) : 1;
      el('path', { d: 'M275,160 C330,160 340,150 398,150', fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: g });
      if (k === 1) { tx(330, 125, '읽는 순간 구독', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) }); } }
    if (k === 2) dot([[275, 160], [398, 150]], seg(u, 1.0, 1.5), ACC, 7);
    // 오른쪽 화면
    phone(820, 210, 170, 280);
    card(820, 130, 140, 44, { rx: 6, text: `Count: ${k === 2 && u > 1.6 ? 1 : 0}`, fs: 17, mono: true, stroke: flash > 0 ? ACC : INK });
    card(785, 200, 56, 38, { rx: 19, text: '+', fs: 18, fill: ACCBG, stroke: ACC, color: ACC }); card(855, 200, 76, 38, { rx: 19, text: 'Reset', fs: 13.5, mono: true, fill: ACCBG, stroke: ACC, color: ACC });
    if (k === 2) { ripple(785, 200, seg(u, 0.2, 0.9)); mono(560, 400, 'onClick = { count++ }', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      tx(760, 400, '갱신 코드 0줄', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); } }
  // 회전: remember 와 rememberSaveable
  function s3rot(u) {
    [['remember', 240, false], ['rememberSaveable', 720, true]].forEach(([n, cx, save]) => {
      lbl(cx, 46, n, 1, { class: 'mono', fill: save ? GOOD : WARN, 'font-size': 17 });
      phone(cx - 130, 170, 90, 150); mono(cx - 130, 176, 'Count: 1', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 });
      const r = E(u, 0.4, 1.0); el('path', { d: `M${cx - 70},120 Q${cx - 10},${100 - 10 * r} ${cx + 40},120`, fill: 'none', stroke: MUT, 'stroke-width': 2.2, 'marker-end': 'url(#ra-ah)', opacity: r });
      sub(cx - 15, 92, '화면 회전', r);
      const s = pop(u, 1.0); phone(cx + 110, 180, 150, 90, { op: clamp(s) });
      const after = save ? 'Count: 1' : 'Count: 0';
      if (u > 1.2) mono(cx + 116, 186, after, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: save ? GOOD : BAD });
      if (save) { card(cx, 300, 200, 48, { rx: 8, text: 'Bundle: count = 1', fs: 14, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 0.6) });
        grow(cx - 110, 248, cx - 60, 280, E(u, 0.7, 1.0), GOOD); grow(cx + 60, 280, cx + 100, 228, E(u, 1.4, 1.8), GOOD); }
      else { cross(cx + 110, 240, 10, pop(u, 1.4)); tx(cx, 310, 'Activity가 새로 만들어지며 값이 날아간다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); } });
    el('line', { x1: 480, y1: 40, x2: 480, y2: 360, stroke: GRID, 'stroke-width': 1.5 });
    tx(480, 395, '회전이나 프로세스 복원까지 버텨야 하면 rememberSaveable', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ---------- 4. Recomposition: 바뀐 입력을 받는 노드만 ----------
  const ITEMS = ['apple', 'banana', 'cherry', 'kiwi'];   // 예시 목록 (코드의 items 자리)
  const keep = (f) => ITEMS.filter((s) => s.includes(f));
  function s4(t, c) { const { k, u } = c;
    if (k === 4) return s4anti(u);
    const typed = k === 2 ? (u > 0.6 ? 'a' : '') : k === 3 ? 'a' : '';
    // 왼쪽: 상태들
    card(140, 90, 200, 56, { rx: 8, stroke: INFO, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(52, 84, 'filter', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.3) : 1 });
    mono(52, 108, `"${typed}"`, { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: k === 0 ? fade(u, 0.3) : 1 });
    mono(40, 150, 'items (예시 목록)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.5) : 1 });
    ITEMS.forEach((s, i) => mono(52 + (i % 2) * 110, 176 + Math.floor(i / 2) * 24, s, { 'font-size': 14.5, opacity: k === 0 ? fade(u, 0.6 + i * 0.1) : 1 }));
    if (k >= 1) { const sc = k === 1 ? pop(u, 0.6) : 1, res = k === 1 ? ITEMS.length : k === 2 ? (u > 1.2 ? 2 : 4) : 2;
      card(140, 300, 220, 110, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: sc });
      mono(40, 264, 'filtered (derivedStateOf)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: clamp(sc) });
      pill(140, 280, 'key: items, filter', ACC, sc, { fs: 13.5, mono: true, fill: PANEL });
      mono(140, 330, `${res}개`, { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: clamp(sc) });
      if (k === 2 && u > 0.7 && u < 1.3) { pill(140, 375, '키가 바뀜 → 재계산', WARN, 1, { fs: 13.5 }); } }
    // 오른쪽: 트리
    const nodes = [['List()', 400, 70], ['Column', 430, 118], ['TextField', 460, 166], ['LazyColumn', 460, 214]];
    nodes.forEach(([s, x, y], i) => { const hot = k === 3 && (i === 2 || i === 3) && u > 0.4;
      node(x, y, 150, s, { col: hot ? ACC : null, fill: hot ? ACCBG : null, op: k === 0 ? fade(u, 0.8) : 1 }); });
    el('path', { d: 'M418,85 V118 H430 M448,133 V166 H460 M448,166 V214 H460', fill: 'none', stroke: GRID, 'stroke-width': 2 });
    if (k === 2) mono(620, 171, `value = "${typed}"`, { 'font-size': 13.5, fill: k === 2 && u > 0.6 ? WARN : MUT });
    const vis = k === 3 ? keep('a') : ITEMS;
    ITEMS.forEach((s, i) => { const inn = vis.includes(s), y = 262 + i * 38;
      const goneOp = k === 3 && !inn ? 1 - E(u, 0.8, 1.4) : k === 2 && !keep('a').includes(s) && u > 1.2 ? 0.35 : 1;
      if (goneOp <= 0.02) return;
      el('path', { d: `M478,229 V${y} H490`, fill: 'none', stroke: GRID, 'stroke-width': 1.5, opacity: goneOp });
      node(490, y, 190, `ItemRow(${s})`, { op: goneOp * (k === 0 ? fade(u, 1.0) : 1) });
      if (k === 3 && inn) tag(694, y, 'skip · 입력 그대로', MUT, fade(u, 1.5)); });
    if (k === 3) { tag(620, 166, '재호출 · 새 value', ACC, fade(u, 0.4)); tag(620, 214, '재호출 · 새 filtered', ACC, fade(u, 0.6));
      dot([[240, 90], [460, 166]], seg(u, 0.1, 0.5), ACC, 6); }
    if (k === 0) tx(700, 70, '구독자 아직 없음', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
    if (k === 2) { mono(620, 214, '', {}); ripple(535, 166, seg(u, 0.2, 0.8)); } }
  // 안티패턴: remember 없는 derivedStateOf
  function s4anti(u) {
    [['derivedStateOf { … }', 240, false], ['remember { derivedStateOf { … } }', 720, true]].forEach(([n, cx, good]) => {
      mono(cx, 52, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: good ? GOOD : BAD });
      for (let r = 0; r < 3; r++) { const s = pop(u, 0.4 + r * 0.55), y = 110 + r * 62;
        pill(cx - 120, y, `재구성 ${r + 1}`, INK, s, { fs: 13.5 });
        const inst = good ? '#1' : `#${r + 1}`, col = good ? GOOD : BAD;
        card(cx + 30, y, 130, 44, { rx: 8, text: `인스턴스 ${inst}`, fs: 14, mono: true, stroke: col, fill: good ? GOODBG : BADBG, s });
        if (!good || r === 0) tag(cx + 108, y, good ? '계산' : '다시 계산', col, clamp(s)); else tag(cx + 108, y, '캐시 사용', GOOD, clamp(s)); } });
    el('line', { x1: 480, y1: 30, x2: 480, y2: 300, stroke: GRID, 'stroke-width': 1.5 });
    sub(480, 330, '예시: 키가 그대로인 채 세 번 재구성될 때', fade(u, 1.8), { 'font-size': 14.5 });
    tx(480, 372, '캐시는 같은 인스턴스를 붙잡아 둘 때만 쓸모가 있다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ---------- 5. LazyColumn 과 Modifier ----------
  function s5(t, c) { const { k, u } = c;
    if (k >= 2) return s5mod(t, c);
    const sc = phone(300, 210, 230, 370);
    // padding(16.dp) 띠
    el('rect', { x: sc.x0, y: sc.y0, width: sc.x1 - sc.x0, height: sc.y1 - sc.y0, fill: WARNBG, opacity: k === 0 ? fade(u, 0.4) : 1 });
    el('rect', { x: sc.x0 + 16, y: sc.y0 + 16, width: sc.x1 - sc.x0 - 32, height: sc.y1 - sc.y0 - 32, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: k === 0 ? fade(u, 0.6) : 1 });
    mono(sc.x1 + 14, sc.y0 + 12, 'padding(16.dp)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.9) : 1 });
    const top = sc.y0 + 16, bot = sc.y1 - 16;
    if (k === 0) { tx(300, 215, '생성된 항목 0개', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
      [['LazyColumn', 'fillMaxSize', 1.4], ['spacedBy(8.dp)', '항목 사이 간격', 1.8]].forEach(([a, b, d], i) => { mono(520, 150 + i * 70, a, { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, d) }); tx(520, 176 + i * 70, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, d) }); });
      return; }
    // k 1: 목록이 창 밖까지 이어지고, 창 안 항목만 만든다
    const off = E(u, 0.4, 2.2) * 150, h = 46, gap = 8, x0 = sc.x0 + 24, w = sc.x1 - sc.x0 - 48;
    let made = 0;
    for (let i = 0; i < 14; i++) { const y = 20 + i * (h + gap) - off; if (y > 400 || y + h < 0) continue;
      const inView = y + h > top && y < bot; if (inView) made++;
      el('rect', { x: x0, y, width: w, height: h, rx: 8, fill: inView ? ACCBG : 'none', stroke: inView ? ACC : OFF, 'stroke-width': inView ? 2 : 1.5, 'stroke-dasharray': inView ? null : '5 4' });
      if (y + 28 > 16 && y + 28 < 405) { mono(x0 + 12, y + 28, `id=${i + 1}`, { 'font-size': 13.5, fill: inView ? ACC : OFF, 'font-weight': 700 });
        if (inView) tx(x0 + w - 12, y + 28, 'ItemRow', { 'font-size': 13.5, fill: INK, 'text-anchor': 'end', 'font-weight': 600 }); } }
    el('rect', { x: 185, y: 25, width: 230, height: 370, rx: 22, fill: 'none', stroke: INK, 'stroke-width': 2.5 });   // 틀을 위에 다시 그어 창 경계를 또렷하게
    el('rect', { x: sc.x0 + 16, y: top, width: sc.x1 - sc.x0 - 32, height: bot - top, fill: 'none', stroke: ACC, 'stroke-width': 2 });
    mono(520, 120, 'items(items, key = { it.id })', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    tx(520, 170, `지금 만든 ItemRow: ${made}개`, { 'font-size': 17, 'font-weight': 800 });
    tx(520, 205, '점선 항목은 아직 만들지 않았다', { 'font-size': 14.5, fill: MUT });
    tx(520, 260, 'key = id라서 목록이 바뀌어도', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    tx(520, 286, '같은 항목을 같은 것으로 알아본다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
  // Modifier 체인: 위에서 아래로 = 바깥에서 안쪽으로
  const CHAIN = ['.fillMaxWidth()', '.clickable { onClick(item) }', '.padding(12.dp)'];
  function s5mod(t, c) { const { k, u } = c;
    mono(40, 50, 'Card(modifier = Modifier', { 'font-size': 15, 'font-weight': 700 });
    const upto = k === 2 ? 1 : 3;
    CHAIN.forEach((s, i) => { if (i >= upto) return; const fresh = (k === 2 && i === 0) || (k === 3 && i > 0);
      mono(64, 80 + i * 28, s, { 'font-size': 15, 'font-weight': 700, fill: fresh ? ACC : INK, opacity: fresh ? fade(u, 0.2 + i * 0.3) : 1 }); });
    if (k === 4) mono(40, 80 + 3 * 28, ') { Text(item.name) }', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
    // 층 그림: 바깥(fillMaxWidth) → clickable 영역 → padding → 내용
    const X = 470, W = 440, Y = 60, H = 160;
    const a0 = k === 2 ? E(u, 0.3, 1.0) : 1;
    el('rect', { x: X, y: Y, width: W * a0, height: H, rx: 10, fill: 'none', stroke: INK, 'stroke-width': 2.2 });
    if (k === 2) { tx(X + 14, Y + 26, '부모 폭을 가득 채운 Card', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.0) });
      grow(X + 10, Y + H + 26, X + W - 10, Y + H + 26, E(u, 1.0, 1.6), MUT); grow(X + W - 10, Y + H + 26, X + 10, Y + H + 26, E(u, 1.0, 1.6), MUT);
      sub(X + W / 2, Y + H + 50, 'fillMaxWidth', fade(u, 1.6)); return; }
    const cl = k === 3 ? E(u, 0.3, 0.9) : 1;
    el('rect', { x: X + 2, y: Y + 2, width: W - 4, height: H - 4, rx: 9, fill: ACCBG, opacity: cl });
    el('rect', { x: X + 24, y: Y + 24, width: W - 48, height: H - 48, rx: 6, fill: PANEL, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k === 3 ? fade(u, 0.9) : 1 });
    tx(X + 30, Y + 18, '클릭 영역 = Card 전체', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: cl });
    mono(X + W - 30, Y + H - 6, 'padding(12.dp)', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: k === 3 ? fade(u, 1.0) : 1 });
    if (k === 4) { mono(X + 44, Y + 84, 'Text(item.name)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) }); }
    if (k === 3) { // 가장자리 탭: 이 순서면 반응한다 / 뒤집으면 안 한다
      ripple(X + 12, Y + 80, seg(u, 1.2, 1.8)); check(X + 12, Y + 80, 8, pop(u, 1.6));
      const bx = 470, by = 270; tx(bx, by - 8, '순서를 뒤집으면: .padding(12.dp).clickable { }', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      el('rect', { x: bx, y: by + 6, width: 300, height: 100, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.9) });
      el('rect', { x: bx + 18, y: by + 24, width: 264, height: 64, rx: 6, fill: ACCBG, opacity: fade(u, 1.9) });
      cross(bx + 9, by + 56, 7, pop(u, 2.2)); tx(bx + 312, by + 62, '여백은 클릭 안 됨', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { // 전체 조립
      const P = [['LazyColumn', 90], ['items(key)', 255], ['ItemRow', 420], ['Card + Modifier', 600], ['Text', 790]];
      P.forEach(([s, x], i) => { pill(x, 330, s, i === 3 ? ACC : INK, pop(u, 0.6 + i * 0.3), { fs: 14.5, mono: true });
        if (i) grow(P[i - 1][1] + tw(P[i - 1][0], 14.5) / 2 + 16, 330, x - tw(s, 14.5) / 2 - 16, 330, E(u, 0.7 + i * 0.3, 0.9 + i * 0.3), MUT); });
      tx(480, 390, '목록 · 키 · Modifier 체인이 한 항목에서 맞물린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  const quiz = [
    { q: '명령형 코드에서 count++ 뒤에 tvCount.text를 바꾸는 줄을 빠뜨리면 어떻게 되는가?',
      o: ['컴파일 에러가 난다', '화면이 이전 값에 머물러 상태와 어긋난다', '런타임이 알아서 화면을 갱신한다'], a: 1,
      why: '명령형에서는 상태와 화면을 잇는 일을 사람이 한다. 갱신 줄이 없으면 상태는 2인데 화면은 1에 머물고, 컴파일러는 경고하지 않는다.' },
    { q: 'Composable 안에서 다른 Composable(예: Greeting)을 호출하면 그것은 무엇이 되는가?',
      o: ['UI 트리의 자식 노드', '새 Activity', 'XML 레이아웃 파일'], a: 0,
      why: 'Compose에서는 함수 호출이 곧 조립이다. Column 안에서 Greeting과 Text를 부르면 그 순서대로 자식 노드가 된다.' },
    { q: 'var count by mutableStateOf(0)처럼 remember 없이 상태를 만들면 어떻게 되는가?',
      o: ['회전해도 값이 유지된다', 'Bundle에 자동 저장된다', '재호출될 때마다 0으로 돌아간다'], a: 2,
      why: 'remember가 재호출 사이에 같은 State 상자를 돌려준다. 없으면 Counter()가 다시 불릴 때마다 새 상자를 0으로 만든다.' },
    { q: 'filter가 ""에서 "a"로 바뀔 때 다시 호출되지 않는 것은 무엇인가?',
      o: ['새 value를 받는 TextField', '새 filtered를 받는 LazyColumn', '받는 항목이 그대로인 ItemRow'], a: 2,
      why: '입력이 바뀐 노드만 다시 호출된다. TextField와 LazyColumn은 새 값을 받지만, 같은 항목을 받는 ItemRow는 건너뛴다.' },
    { q: 'Modifier.clickable { }.padding(12.dp) 순서일 때 클릭 영역은 어디인가?',
      o: ['패딩까지 포함한 Card 전체', '패딩 안쪽의 내용 영역만', 'Text 글자 위만'], a: 0,
      why: 'Modifier는 적힌 순서대로 바깥에서 안쪽으로 적용된다. clickable이 먼저면 바깥 전체가 클릭 영역이고 padding은 그 안쪽에 생긴다.' },
  ];

  const summary = [
    '명령형 UI는 상태를 바꿀 때마다 화면 갱신 줄을 사람이 짝지어 써야 하고 하나만 빠져도 어긋난다.',
    'Composable은 상태를 받아 UI 트리를 만드는 함수라서 같은 입력이면 늘 같은 화면이 나온다.',
    'remember로 지킨 State를 읽은 곳만 값이 바뀔 때 다시 호출되고 입력이 같은 노드는 건너뛴다.',
    '긴 목록은 LazyColumn에 key를 주고, Modifier는 적은 순서대로 바깥부터 안쪽으로 적용된다.',
  ];
  const review = [
    { q: '검색어를 칠 때마다 목록 필터링이 재구성 횟수만큼 다시 도는 것 같다. 먼저 확인할 것은?',
      o: ['필터 계산을 키와 함께 remember로 감쌌는지', 'Text의 글꼴 크기', 'Activity가 XML을 쓰는지'], a: 0,
      why: 'remember 없이 계산하면 재구성마다 새로 돈다. items와 filter를 키로 remember하면 둘이 그대로일 때 결과를 다시 쓴다.' },
    { q: '화면을 돌렸더니 카운터가 0으로 돌아갔다. 코드에는 remember { mutableStateOf(0) }이 있다. 무엇을 바꿔야 하나?',
      o: ['mutableStateOf를 일반 var로 바꾼다', 'remember를 rememberSaveable로 바꾼다', 'Column을 LazyColumn으로 바꾼다'], a: 1,
      why: 'remember는 재구성 사이에만 값을 지키고 Activity가 다시 만들어지면 사라진다. rememberSaveable은 Bundle에 저장해 회전 뒤에 복원한다.' },
    { q: '목록 카드의 가장자리를 눌러도 반응이 없다. Modifier가 .padding(12.dp).clickable { } 순서다. 원인은?',
      o: ['items에 key를 주지 않아서', 'Card가 LazyColumn밖에 있어서', 'padding이 먼저라 클릭 영역이 안쪽으로 줄어서'], a: 2,
      why: '체인은 바깥부터 적용되므로 padding 뒤의 clickable은 여백을 뺀 안쪽에만 걸린다. clickable을 먼저 두면 Card 전체가 눌린다.' },
  ];

  R.page({ title: '상태 · UI 트리 · Recomposition', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
