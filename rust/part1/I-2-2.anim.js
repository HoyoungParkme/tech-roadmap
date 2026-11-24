/* I-2-2 lifetime — 'a 의 의미 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   확인한 값 (rustc 1.100, edition 2021): E0597 `x` / `sentence` / `s2` does not live long enough, E0106 missing lifetime specifier,
   E0505 cannot move out of `novel` because it is borrowed / "첫 단어: hello" (w 는 sentence 의 첫 5바이트, 같은 시작 주소)
   "긴 쪽: hello" / novel 32바이트, first 13바이트, "첫 문장 발췌: 어느 봄날" / "Alice <a@x.com> on MyApp" */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 공용 그림 도구 ──────────────────────────────────────────
  function slot(x, y, name, vals, o) {
    o = o || {}; const dead = !!o.dead, col = dead ? OFF : (o.col || INK), cw = o.cw || 58, op = o.op ?? 1;
    const g = R.G(x, y, 1, op);
    tx(-12, 35, name, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', class: 'mono', fill: col, 'text-decoration': dead ? 'line-through' : null }, g);
    vals.forEach(([f, v], i) => { const cx = i * (cw + 4);
      el('rect', { x: cx, y: 10, width: cw, height: 40, rx: 5, fill: dead ? SOFT : (o.fill || PANEL), stroke: col, 'stroke-width': 2, 'stroke-dasharray': dead ? '4 4' : null }, g);
      if (f) tx(cx + cw / 2, 3, f, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g);
      if (v === '●') el('circle', { cx: cx + cw / 2, cy: 30, r: 6, fill: dead ? OFF : (o.ptrCol || ACC) }, g);
      else mono(cx + cw / 2, 36, String(v), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: dead ? OFF : (o.valCol || INK) }, g); });
    return { ptr: [x + cw / 2, y + 30], right: x + vals.length * (cw + 4) - 4, top: y + 10, bottom: y + 50 };
  }
  function wire(pts, u, col, o) {
    o = o || {}; if (u <= 0) return; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot; const out = [pts[0]];
    for (let i = 0; i < L.length && d > 0; i++) { const f = Math.min(1, d / L[i]); out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); d -= L[i]; }
    el('polyline', { points: out.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'stroke-linejoin': 'round',
      'marker-end': u > 0.98 && !o.plain ? (col === BAD ? 'url(#ra-ahr)' : col === ACC || !col ? 'url(#ra-ahb)' : 'url(#ra-ah)') : null });
  }
  function err(cx, cy, code, lines, s) {
    if (s <= 0.01) return; lines = [].concat(lines); const head = 'error[' + code + ']';
    const w = Math.max(tw(head, 15), ...lines.map((l) => tw(l, 14))) + 34, h = 34 + lines.length * 21, g = R.G(cx, cy, s);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: INK }, g);
    mono(-w / 2 + 16, -h / 2 + 23, head, { 'font-size': 15, 'font-weight': 800, fill: BAD }, g);
    lines.forEach((l, i) => mono(-w / 2 + 16, -h / 2 + 45 + i * 21, l, { 'font-size': 14, fill: PANEL }, g));
  }
  function code(x, y, rows, vis, lh) { lh = lh || 36;
    rows.forEach(([n, s, m], i) => { const op = clamp(vis - i); if (op <= 0) return; const yy = y + i * lh;
      mono(x, yy, String(n), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
      mono(x + 14, yy, s, { 'font-size': 14.5, fill: m === 'bad' ? BAD : m === 'mut' ? MUT : INK, opacity: op }); }); }
  // 수명 막대 (세로): y0 → y1 을 u 만큼, 위에 이름
  function vbar(x, y0, y1, u, col, name, o) { o = o || {}; if (u <= 0) return; const y = lerp(y0, y1, clamp(u));
    el('rect', { x: x - 7, y: y0 - 14, width: 14, height: Math.max(4, y - y0 + 18), rx: 7, fill: col, opacity: o.op ?? 0.85 });
    if (name) mono(x, y0 - 22, name, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0, 0.3) }); }
  // 수명 막대 (가로)
  function hbar(x0, x1, y, u, col, name, o) { o = o || {}; if (u <= 0) return; const x = lerp(x0, x1, clamp(u));
    el('rect', { x: x0, y: y - 10, width: Math.max(2, x - x0), height: 20, rx: 10, fill: col, opacity: o.op ?? 0.85 });
    if (name) mono(x0 - 12, y + 5, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: o.color || col }); }
  // 색이 다른 조각을 한 줄로 (가운데 정렬), 조각마다 나타나는 시점 [글, 색, 등장]
  function sig(cx, y, parts, u, fs) { fs = fs || 17;
    R.spans(cx, y, parts.map(([s, col, at]) => [s, { fill: col || INK, 'font-weight': col ? 800 : 500, 'fill-opacity': at == null ? 1 : fade(u, at) }]), { 'font-size': fs, 'text-anchor': 'middle' }); }
  function cellsW(x, y, items, o) { o = o || {}; let cx = x; // items: [글, 바이트수]. 칸 폭이 바이트 수에 비례
    return items.map(([ch, b], i) => { const w = b * (o.unit || 16) + (b - 1) * 1, st = (o.st && o.st(i)) || {};
      el('rect', { x: cx, y, width: w, height: 40, rx: 4, fill: st.fill || ACCBG, stroke: st.stroke || ACC, 'stroke-width': 2, opacity: st.op ?? 1 });
      if (ch) tx(cx + w / 2, y + 26, ch, { 'font-size': b > 1 ? 16 : 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: st.op ?? 1 });
      const r = [cx, w]; cx += w + 3; return r; }); }

  // 1. 참조에는 유효기간이 있다
  const ROWS1 = [[2, 'let r;'], [3, '{'], [4, '    let x = 5;'], [5, '    r = &x;'], [6, '}'], [8, 'println!("{}", r);']];
  function s1(t, c) { const { k, u } = c;
    if (k === 3) {
      [['C/C++', 130, BAD], ['Rust', 280, GOOD]].forEach(([n, y, col], i) => { tx(120, y + 5, n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end' });
        el('line', { x1: 140, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 3 });
        [['컴파일', 260], ['실행', 520], ['결과', 780]].forEach(([s, x]) => sub(x, y - 24, s, 1)); });
      const a = E(u, 0.2, 1.4); el('circle', { cx: lerp(160, 780, a), cy: 130, r: 9, fill: BAD });
      check(260, 160, 10, pop(u, 0.5)); tx(780, 168, '죽은 자리의 값을 읽는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      const b = E(u, 1.2, 1.8); el('circle', { cx: lerp(160, 260, b), cy: 280, r: 9, fill: GOOD });
      cross(260, 318, 10, pop(u, 1.8)); tx(260, 352, 'E0597 로 빌드 중단', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 1.9) });
      tx(650, 330, '버그가 배포 전에 사라진다', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    const vis = k === 0 ? lerp(0, 4, E(u, 0.1, 0.9)) : k === 1 ? lerp(4, 5, E(u, 0.1, 0.5)) : lerp(5, 6, E(u, 0.1, 0.5));
    code(80, 90, ROWS1, vis, 44);
    const Y = (i) => 90 + i * 44 - 5;
    // 수명 막대: x 는 4~6줄, r 은 2줄부터 쓰이는 곳까지
    vbar(400, Y(2), Y(4), k === 0 ? E(u, 0.8, 1.4) : 1, ACC, "x");
    const rEnd = k <= 1 ? Y(3) : Y(5), rU = k === 0 ? E(u, 1.2, 1.8) : k === 2 ? 1 : 1;
    vbar(450, Y(0), rEnd, rU, INFO, 'r');
    if (k === 2) { el('rect', { x: 435, y: Y(4) + 6, width: 30, height: Y(5) - Y(4), rx: 6, fill: BAD, opacity: 0.85 * fade(u, 0.5) });
      tx(475, Y(4) + 40, 'x 보다 오래 쓰인 구간', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) }); }
    // 오른쪽: 스택 칸
    zone(600, 40, 330, k === 2 ? 150 : 360, '스택');
    const xDead = k >= 1 && (k > 1 || u > 0.6);
    const xs = slot(720, 80, 'x', [['i32', 5]], { cw: 70, dead: xDead, op: k === 0 ? fade(u, 0.6) : 1 });
    const rs = slot(720, k === 2 ? 0 : 200, 'r', [['&i32', '●']], { cw: 70, col: INFO, ptrCol: xDead ? BAD : INFO, op: k === 2 ? 0 : 1 });
    if (k < 2) wire([[rs.ptr[0], rs.top], [xs.ptr[0], xs.bottom + 4]], k === 0 ? seg(u, 1.6, 2.1) : 1, xDead ? BAD : INFO, { dash: xDead ? '6 4' : null });
    if (k === 1) { tx(765, 330, 'x 는 } 에서 drop', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      tx(765, 356, 'r 은 빈 자리를 가리킨다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 2) err(765, 310, 'E0597', ['`x` does not live long enough', '} - `x` dropped here', '    while still borrowed'], pop(u, 1.2));
  }

  // 2. elision
  const HW = ['h', 'e', 'l', 'l', 'o', '␣', 'w', 'o', 'r', 'l', 'd'];
  function s2(t, c) { const { k, u } = c;
    if (k === 0 || k === 2) {
      const lab = k === 2;
      sig(480, 120, lab ? [['fn first_word'], ["<'a>", ACC, 0.4], ['(s: &'], ["'a ", ACC, 0.8], ['str) -> &'], ["'a ", ACC, 1.2], ['str']] : [['fn first_word(s: &str) -> &str']], u, 19);
      if (!lab) { pill(480, 200, '내가 쓴 라벨 0개', INK, pop(u, 0.6), { fs: 15 });
        tx(480, 270, '입력 참조가 하나 · 반환도 참조 하나', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
        tx(480, 300, '반환이 어디서 왔는지 고를 필요가 없다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
      tx(480, 60, '컴파일러가 실제로 보는 시그니처', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' });
      wire([[420, 140], [420, 190], [700, 190], [700, 140]], seg(u, 1.4, 2.0), ACC);
      tx(560, 220, '입력 s 의 수명 = 반환의 수명', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 300, '생략 규칙: 입력 참조가 하나면 반환도 그 lifetime', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    zone(30, 40, 360, 360, '스택'); zone(410, 40, 520, 360, '힙 (sentence)');
    const xs = 430, cw = 40;
    HW.forEach((ch, i) => { const sl = i < 5 && (k >= 1); el('rect', { x: xs + i * (cw + 3), y: 110, width: cw, height: 40, rx: 4, fill: sl && (k > 1 || u > 1.6) ? INFOBG : ACCBG, stroke: sl && (k > 1 || u > 1.6) ? INFO : ACC, 'stroke-width': 2 });
      mono(xs + i * (cw + 3) + cw / 2, 136, ch, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' }); });
    if (k === 1) { const i = Math.min(5, Math.floor(lerp(0, 6, E(u, 0.2, 1.4)))); el('rect', { x: xs + i * (cw + 3) - 2, y: 106, width: cw + 4, height: 48, rx: 6, fill: 'none', stroke: i === 5 ? WARN : INK, 'stroke-width': 3 });
      mono(xs + i * (cw + 3) + cw / 2, 180, 'i = ' + i, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: i === 5 ? WARN : MUT });
      if (u > 1.5) { el('path', { d: `M${xs},96 V88 H${xs + 5 * (cw + 3) - 3} V96`, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 1.5) });
        mono(xs + 2.5 * (cw + 3), 80, '&s[..5]', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
      const w = slot(130, 250, '반환', [['ptr', '●'], ['len', 5]], { col: INFO, ptrCol: INFO, op: fade(u, 1.9) });
      wire([[w.ptr[0], w.top], [w.ptr[0], 200], [xs + 8, 154]], seg(u, 2.0, 2.4), INFO);
      tx(670, 260, '새 문자열을 만들지 않고 s 의 일부를 빌린다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    const sen = slot(130, 90, 'sentence', [['ptr', '●'], ['len', 11], ['cap', 11]], {});
    wire([[sen.right, sen.ptr[1]], [426, 130]], 1, ACC);
    const w = slot(130, 210, 'w', [['ptr', '●'], ['len', 5]], { col: INFO, ptrCol: INFO, op: k === 3 ? fade(u, 0.5) : 1 });
    wire([[w.ptr[0], w.bottom], [w.ptr[0], 290], [400, 290], [452, 154]], k === 3 ? seg(u, 0.8, 1.4) : 1, INFO, { dash: '6 4' });
    if (k === 3) terminal(450, 250, 450, 70, ['첫 단어: hello'], seg(u, 1.6, 2.0), { title: '출력' });
    if (k === 4) { // 수명 막대 비교
      el('rect', { x: 420, y: 180, width: 500, height: 210, rx: 10, fill: PANEL, stroke: GRID });
      hbar(520, 880, 215, E(u, 0.2, 0.9), ACC, 'sentence'); hbar(560, 760, 245, E(u, 0.5, 1.1), INFO, 'w');
      check(900, 230, 10, pop(u, 1.2));
      hbar(520, 680, 315, E(u, 1.3, 1.8), ACC, 'sentence'); hbar(560, 780, 345, E(u, 1.5, 2.0), INFO, 'w');
      el('rect', { x: 680, y: 335, width: 100, height: 20, rx: 6, fill: BAD, opacity: 0.85 * fade(u, 2.0) });
      mono(900, 350, 'E0597', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.2) });
      tx(670, 285, 'sentence 가 먼저 끝나면', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); }
  }

  // 3. 입력이 둘일 때
  const ROWS3 = [[15, 'let s1 = String::from("hello");'], [16, 'let result;'], [17, '{'], [18, '    let s2 = String::from("hi!");'], [19, '    result = longest(&s1, &s2);'],
    [20, '    println!("긴 쪽: {}", result);'], [21, '}'], [22, 'println!("{}", result);']];
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) {
      sig(480, 90, k === 0 ? [['fn longest(x: &str, y: &str) -> &str']] : [['fn longest'], ["<'a>", ACC, 0.3], ['(x: &'], ["'a ", ACC, 0.6], ['str, y: &'], ["'a ", ACC, 0.9], ['str) -> &'], ["'a ", ACC, 1.2], ['str']], u, 18);
      if (k === 0) { wire([[330, 104], [330, 150], [720, 150], [740, 104]], seg(u, 0.3, 0.9), MUT, { dash: '5 4' }); wire([[480, 104], [480, 150]], seg(u, 0.6, 0.9), MUT, { dash: '5 4', plain: true });
        mono(760, 150, '?', { 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
        err(480, 280, 'E0106', ['missing lifetime specifier', 'the signature does not say whether', 'it is borrowed from `x` or `y`'], pop(u, 1.3)); return; }
      tx(480, 180, "x, y, 반환을 같은 'a 로 묶었다", { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 215, '반환 참조는 두 입력 중 하나에서 온다는 약속', fade(u, 2.0), { 'font-weight': 700 });
      check(480, 280, 16, pop(u, 2.2)); return; }
    if (k === 2) {
      hbar(260, 860, 120, E(u, 0.2, 0.9), INFO, 'x'); hbar(400, 640, 180, E(u, 0.5, 1.1), WARN, 'y');
      const ov = E(u, 1.2, 1.8);
      el('rect', { x: 400, y: 80, width: 240, height: 140, rx: 8, fill: ACC, opacity: 0.12 * ov }); el('rect', { x: 400, y: 80, width: 240, height: 140, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: ov });
      mono(520, 70, "'a = 둘 다 살아 있는 구간", { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: ov });
      hbar(400, 640, 270, E(u, 1.8, 2.3), ACC, '반환');
      tx(520, 330, '반환은 더 짧은 쪽 y 에 맞춰진다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    code(80, 70, ROWS3, k === 3 ? lerp(0, 7, E(u, 0.1, 1.0)) : 8, 40);
    const Y = (i) => 70 + i * 40 - 5;
    vbar(560, Y(0), Y(7), k === 3 ? E(u, 0.6, 1.4) : 1, INFO, 's1');
    vbar(610, Y(3), Y(6), k === 3 ? E(u, 0.9, 1.5) : 1, WARN, 's2');
    const resEnd = k === 4 ? Y(7) : Y(5);
    vbar(660, Y(4), resEnd, k === 3 ? E(u, 1.2, 1.8) : 1, k === 4 ? BAD : GOOD, 'result');
    if (k === 3) terminal(700, 70, 230, 70, ['긴 쪽: hello'], seg(u, 1.9, 2.3), { title: '출력' });
    if (k === 4) { el('rect', { x: 650, y: Y(6) + 6, width: 20, height: Y(7) - Y(6), rx: 6, fill: INK, opacity: 0.25 });
      err(815, 300, 'E0597', ['`s2` does not live long', 'enough'], pop(u, 0.8));
      tx(800, 120, 's2 가 끝나면', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(800, 146, 'result 도 끝난다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
  }

  // 4. 참조를 든 구조체
  const NOVEL = [['어', 3], ['느', 3], ['␣', 1], ['봄', 3], ['날', 3], [',', 1], ['␣', 1], ['그', 3], ['는', 3], ['␣', 1], ['떠', 3], ['났', 3], ['다', 3], ['.', 1]];
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) {
      R.card(300, 150, 340, 150, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 0.2) });
      sig(300, 110, [['struct Excerpt'], ["<'a>", ACC, k === 0 ? 1.0 : null]], u, 18);
      sig(300, 170, [['part: &'], ["'a ", ACC, k === 0 ? 1.2 : null], ['str']], u, 17);
      if (k === 0) { sub(300, 260, '참조 필드가 있으면 구조체에도 라벨', fade(u, 1.5), { 'font-weight': 700, fill: INK });
        err(720, 160, 'E0106', ['라벨을 빼면:', 'missing lifetime specifier', 'part: &str', '      ^ expected named', '        lifetime parameter'], pop(u, 1.8)); return; }
      sig(660, 290, [['impl'], ["<'a>", ACC, 0.4], [' Excerpt'], ["<'a>", ACC, 0.8]], u, 18);
      sig(660, 330, [['fn part(&self) -> &str']], u, 16);
      pill(300, 292, '① 선언', ACC, pop(u, 0.5), { fs: 14 }); pill(300, 332, '② 사용', ACC, pop(u, 0.9), { fs: 14 });
      tx(660, 380, '반환은 생략 규칙(&self)이 채운다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); return; }
    zone(30, 40, 340, 360, '스택'); zone(390, 40, 540, 360, '힙 (novel)');
    const cs = cellsW(410, 100, NOVEL, { unit: 14, st: (i) => (i < 5 && k >= 2 && (k > 2 || u > 1.0)) ? { fill: INFOBG, stroke: INFO } : k === 5 ? { op: 0.35 } : {} });
    mono(915, 92, '32바이트', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    const novel = slot(150, 80, 'novel', [['ptr', '●'], ['len', 32], ['cap', 32]], { cw: 52 });
    wire([[novel.right, novel.ptr[1]], [406, 120]], 1, ACC);
    if (k >= 2 && k <= 4) { const sEnd = cs[4][0] + cs[4][1];
      el('path', { d: `M410,${158} V${166} H${sEnd} V158`, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: k === 2 ? fade(u, 1.0) : 1 });
      mono((410 + sEnd) / 2, 188, 'first · 13바이트', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 1.2) : 1 });
      const f = slot(150, 180, 'first', [['ptr', '●'], ['len', 13]], { cw: 52, col: INFO, ptrCol: INFO, op: k === 2 ? fade(u, 1.5) : 1 });
      wire([[f.right, f.ptr[1]], [392, f.ptr[1]], [392, 132], [406, 132]], k === 2 ? seg(u, 1.7, 2.2) : 1, INFO, { dash: '6 4' }); }
    if (k === 3 || k === 4) { const e = slot(150, 290, 'ex', [['part', '●']], { cw: 52, col: ACC, ptrCol: INFO, op: k === 3 ? fade(u, 0.3) : 1 });
      mono(150, 370, "Excerpt<'a>", { 'font-size': 14, fill: MUT, opacity: k === 3 ? fade(u, 0.3) : 1 });
      wire([[e.right, e.ptr[1]], [382, e.ptr[1]], [382, 124], [406, 124]], k === 3 ? seg(u, 0.6, 1.2) : 1, INFO, { dash: '6 4' }); }
    if (k === 3) terminal(470, 280, 430, 70, ['첫 문장 발췌: 어느 봄날'], seg(u, 1.5, 1.9), { title: '출력' });
    if (k === 4) { pill(660, 230, 'drop(novel);', BAD, pop(u, 0.4), { mono: true }); cross(745, 230, 10, pop(u, 1.0));
      err(660, 335, 'E0505', ['cannot move out of `novel`', 'because it is borrowed'], pop(u, 1.3)); }
    if (k === 5) { const o = slot(150, 220, 'part', [['ptr', '●'], ['len', 13], ['cap', 13]], { cw: 52, col: GOOD, ptrCol: GOOD, op: fade(u, 0.3) });
      mono(150, 300, 'OwnedExcerpt { part: String }', { 'font-size': 14, fill: INK, opacity: fade(u, 0.3) });
      cellsW(410, 260, NOVEL.slice(0, 5), { unit: 14, st: () => ({ fill: GOODBG, stroke: GOOD, op: E(u, 0.8, 1.4) }) });
      wire([[o.right, o.ptr[1]], [406, 280]], seg(u, 1.3, 1.7), GOOD);
      mono(560, 330, "13바이트 복사 · 라벨 0개", { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); }
  }

  // 5. 실전 — owned 먼저
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 3) {
      R.card(250, 150, 320, 160, { rx: 12, stroke: GOOD, sw: 2.5, s: k === 0 ? pop(u, 0.2) : 1 });
      mono(250, 105, 'struct User', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      mono(250, 150, 'name: String', { 'font-size': 16, 'text-anchor': 'middle' }); mono(250, 185, 'email: String', { 'font-size': 16, 'text-anchor': 'middle' });
      [['A', 'l', 'i', 'c', 'e'], ['a', '@', 'x', '.', 'c', 'o', 'm']].forEach((cs, j) => cs.forEach((ch, i) => { const x = 500 + i * 36, y = 128 + j * 48, op = k === 0 ? clamp(lerp(0, 7, E(u, 0.6, 1.6)) - i) : 1;
        el('rect', { x, y, width: 32, height: 36, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: op }); mono(x + 16, y + 24, ch, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); }));
      grow(410, 145, 494, 145, k === 0 ? seg(u, 0.4, 0.8) : 1, ACC); grow(410, 180, 494, 192, k === 0 ? seg(u, 0.5, 0.9) : 1, ACC);
      pill(250, 270, "라벨 0개", GOOD, k === 0 ? pop(u, 1.8) : 1, { fs: 15 });
      if (k === 3) { terminal(130, 310, 700, 70, ['Alice <a@x.com> on MyApp'], seg(u, 0.4, 1.0), { title: '출력' });
        tx(700, 270, "main 안의 라벨 0회", { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
      return; }
    if (k === 1) {
      const rows = [["struct UserRef<'a> { name: &'a str, … }", 0.2], ["struct Session<'a> { user: UserRef<'a> }", 0.9], ["impl<'a> Session<'a> { … }", 1.6]];
      rows.forEach(([s, at], i) => { const y = 90 + i * 90; R.card(480, y, 560, 56, { rx: 10, stroke: WARN, sw: 2, s: pop(u, at) });
        mono(480, y + 6, s, { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, at + 0.1) });
        if (i) grow(480, y - 62, 480, y - 30, seg(u, at - 0.2, at), WARN); });
      tx(480, 380, '라벨이 이 타입을 담는 곳마다 따라붙는다', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 2) {
      tx(170, 70, '프로그램 시작', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); tx(860, 70, '프로그램 끝', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      el('line', { x1: 170, y1: 84, x2: 170, y2: 360, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' }); el('line', { x1: 860, y1: 84, x2: 860, y2: 360, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' });
      hbar(170, 860, 130, E(u, 0.2, 1.2), GOOD, "APP_NAME", { color: INK });
      mono(515, 110, "&'static str = \"MyApp\"", { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      hbar(320, 620, 220, E(u, 1.0, 1.6), ACC, 'u (main 안)', { color: INK });
      hbar(400, 520, 280, E(u, 1.3, 1.8), INFO, '&u.name', { color: INK });
      tx(515, 340, "문자열 리터럴은 실행 파일 안에 있어 끝까지 산다", { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(515, 375, "막힐 때 아무 데나 'static 을 붙이는 것은 답이 아니다", fade(u, 2.3), { 'font-weight': 700, fill: WARN }); return; }
    // k 4: 순서
    [['1', 'owned 로 시작', 'String · Vec', GOOD], ['2', '측정', '복사가 병목인가?', INFO], ['3', "참조 + 'a", '확인된 곳만', WARN]].forEach(([n, a, b, col], i) => {
      const x = 180 + i * 300, sc = pop(u, 0.2 + i * 0.45); R.card(x, 190, 240, 120, { rx: 14, stroke: col, sw: 2.5, s: sc });
      mono(x - 95, 160, n, { 'font-size': 22, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.45) });
      tx(x, 192, a, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.45) });
      tx(x, 222, b, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.45) });
      if (i < 2) grow(x + 124, 190, x + 176, 190, seg(u, 0.5 + i * 0.45, 0.8 + i * 0.45), col); });
    tx(480, 330, '규칙은 하나: 참조는 원본보다 오래 살 수 없다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
  }

  const quiz = [
    { q: '안쪽 블록에서 r = &x를 하고 블록 밖에서 r을 출력하면 무엇이 일어나는가?',
      o: ['5가 그대로 출력된다', 'E0597 `x` does not live long enough로 빌드가 멈춘다', '실행 중에 panic이 난다'], a: 1,
      why: 'x는 블록의 }에서 drop된다. r이 그보다 오래 쓰이는 구간이 생기므로 컴파일러가 막는다.' },
    { q: "fn first_word(s: &str) -> &str에 'a를 쓰지 않아도 되는 이유는 무엇인가?",
      o: ['입력 참조가 하나뿐이라 반환이 그 lifetime을 쓴다고 정해지기 때문이다', '&str은 언제나 \'static이기 때문이다', '반환값이 새 String이기 때문이다'], a: 0,
      why: '생략 규칙이 입력에 붙은 lifetime을 반환에도 붙인다. 반환 w는 sentence의 첫 5바이트를 가리키는 조각이다.' },
    { q: "longest<'a>(x: &'a str, y: &'a str)에서 반환값은 얼마나 오래 쓸 수 있는가?",
      o: ['x와 y 중 더 긴 쪽만큼', '프로그램이 끝날 때까지', 'x와 y가 둘 다 살아 있는 동안'], a: 2,
      why: "'a는 두 입력이 겹치는 구간이다. 그래서 s2가 끝난 블록 밖에서 result를 쓰면 E0597이 난다." },
    { q: 'Excerpt { part: first }를 쓰는 중에 drop(novel)을 넣으면 어떻게 되는가?',
      o: ['ex.part가 빈 문자열이 된다', 'E0505로 빌드가 멈춘다', 'novel만 해제되고 ex는 계속 쓸 수 있다'], a: 1,
      why: 'ex는 novel의 앞 13바이트를 빌리고 있다. 빌려 준 값을 옮기거나 버리면 cannot move out of `novel` because it is borrowed가 난다.' },
    { q: '구조체를 처음 설계할 때 이 장이 권하는 출발점은 무엇인가?',
      o: ['String 같은 소유 필드로 시작한다', "모든 참조 필드에 'static을 붙인다", '처음부터 &\'a str 필드로 복사를 없앤다'], a: 0,
      why: '소유 필드면 라벨이 하나도 필요 없다. 복사가 병목으로 확인된 곳만 참조와 라벨로 바꾼다.' },
  ];

  const summary = [
    '참조는 원본보다 오래 쓰일 수 없다. 블록이 끝난 x를 가리키면 E0597이 난다.',
    '입력 참조가 하나면 컴파일러가 반환에 같은 lifetime을 붙여 라벨을 안 써도 된다.',
    "입력 참조가 둘이면 'a로 묶고, 반환은 두 입력이 함께 사는 구간만큼만 쓸 수 있다.",
    "참조 필드를 든 구조체도 원본보다 오래 못 산다. 처음엔 String으로 짜서 라벨을 피한다.",
  ];
  const review = [
    { q: '설정 파일 내용을 String으로 읽고, 그 안의 &str 조각을 담은 구조체를 함수 밖으로 돌려주려 했더니 E0515가 났다. 먼저 고칠 방법은 무엇인가?',
      o: ['조각을 String으로 복사해 소유 필드로 담는다', "구조체에 'static 라벨을 붙인다", '함수 안에서 내용을 한 번 더 읽는다'], a: 0,
      why: '원본 String이 함수 끝에서 drop되므로 조각 참조는 밖으로 나갈 수 없다. 소유 필드로 바꾸면 라벨도 사라진다.' },
    { q: 'fn pick(a: &str, b: &str) -> &str를 썼더니 E0106이 났다. 맞는 설명은 무엇인가?',
      o: ['&str은 반환 타입으로 쓸 수 없다', '입력 참조가 둘이라 반환이 어느 쪽에서 오는지 컴파일러가 정할 수 없다', 'a와 b의 길이가 달라서다'], a: 1,
      why: "생략 규칙은 입력 참조가 하나이거나 &self가 있을 때만 반환 lifetime을 채운다. 그 밖에는 'a로 관계를 적는다." },
    { q: '메서드 fn title(&self) -> &str이 있는 impl<\'a> Doc<\'a>에서 반환에 라벨을 쓰지 않아도 되는 이유는 무엇인가?',
      o: ['메서드는 lifetime 검사를 받지 않아서', '반환이 언제나 새 문자열이어서', '&self가 있으면 반환이 self의 lifetime을 쓴다고 정해져서'], a: 2,
      why: 'Excerpt::part도 같은 규칙으로 라벨 없이 컴파일된다. impl의 <\'a>는 타입을 지목하는 데만 쓴다.' },
  ];

  R.page({ title: '수명 막대', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
