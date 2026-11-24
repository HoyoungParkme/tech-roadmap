/* IV-1-2 Result<T,E> 와 ? 연산자 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 성공과 실패를 두 갈래 선로로 그린다: Ok = 위쪽 초록 선로, Err = 아래쪽 빨간 선로.
 * 출력·경고·에러 문구는 rustc 1.100 으로 실제 컴파일·실행해 확인한 것이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 (IV-1-1 과 같은 모양) ----------
  const RK = /^(fn|let|mut|match|if|else|while|for|in|loop|return|impl|enum|struct|use|pub|Some|None|Ok|Err|Self|self|as|ref|dyn|type|trait)$/;
  function rtok(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, RK.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = line.indexOf('"', i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  function rs(x, y, s, o) { o = o || {}; const fs = o.fs || 15, x0 = o.anchor === 'middle' ? x - tw(s, fs) / 2 : x;
    return R.spans(x0, y, rtok(s), { 'font-size': fs, opacity: o.op ?? 1, 'font-weight': o.fw || 600 }); }
  function parcel(cx, cy, w, h, kind, val, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1; if (s <= 0.01 || op <= 0.01) return;
    const g = R.G(cx, cy, s, op), on = kind === 'some' || kind === 'ok', col = o.col || (on ? GOOD : kind === 'err' ? BAD : MUT);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || (on ? GOODBG : kind === 'err' ? BADBG : PANEL), stroke: col, 'stroke-width': 2.4, 'stroke-dasharray': kind === 'none' ? '6 5' : null }, g);
    const tag = o.tag ?? ({ some: 'Some', none: 'None', ok: 'Ok', err: 'Err' })[kind], tg = tw(tag, 14) + 16;
    el('rect', { x: -w / 2 + 8, y: -h / 2 - 13, width: tg, height: 24, rx: 6, fill: kind === 'none' ? PANEL : col, stroke: col, 'stroke-width': 2 }, g);
    tx(-w / 2 + 8 + tg / 2, -h / 2 + 4, tag, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, class: 'mono', fill: kind === 'none' ? MUT : PANEL }, g);
    if (val != null && val !== '') tx(0, 6 + (o.dy || 0), val, { 'text-anchor': 'middle', 'font-size': o.fs || 16, 'font-weight': 700, class: 'mono', fill: o.vcol || INK }, g);
    return g; }
  function out(x, y, w, head, lines, shown, o) { o = o || {}; const lh = o.lh || 23, h = 36 + lines.length * lh, col = o.col || BAD, op = o.op ?? 1; if (op <= 0.01) return;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    el('rect', { x, y, width: w, height: 26, rx: 8, fill: col, opacity: op }); el('rect', { x, y: y + 16, width: w, height: 10, fill: col, opacity: op });
    mono(x + 12, y + 18, head, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, opacity: op });
    lines.forEach(([s, c], i) => { if (i >= Math.ceil(shown)) return; const part = i === Math.ceil(shown) - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s;
      mono(x + 14, y + 48 + i * lh, part, { 'font-size': o.fs || 14, 'font-weight': 600, fill: c || INK, opacity: op }); });
    return { x, y, w, h }; }
  const typed = (u, a, b, n) => clamp((u - a) / (b - a)) * n;
  // 두 갈래 선로: 갈림점(jx,jy) 에서 위 Ok(y1), 아래 Err(y2) 로 갈라져 x2 까지
  function rails(jx, jy, y1, y2, x2, o) { o = o || {};
    el('path', { d: `M${jx},${jy} L${jx + 40},${y1} L${x2},${y1}`, fill: 'none', stroke: GOOD, 'stroke-width': 5, opacity: o.okOp ?? 0.55, 'stroke-linejoin': 'round' });
    el('path', { d: `M${jx},${jy} L${jx + 40},${y2} L${o.errEnd ?? x2},${y2}`, fill: 'none', stroke: BAD, 'stroke-width': 5, opacity: o.errOp ?? 0.55, 'stroke-linejoin': 'round', 'stroke-dasharray': o.errDash });
    tx(jx + 52, y1 - 12, 'Ok', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: GOOD }); tx(jx + 52, y2 + 26, 'Err', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: BAD }); }

  // ---------- 1. 실패를 값으로 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      rs(480, 64, 'enum Result<T, E> { Ok(T), Err(E) }', { anchor: 'middle', fs: 19, op: fade(u, 0.1) });
      const sp = E(u, 0.5, 1.4);
      grow(420, 82, lerp(420, 320, sp), lerp(82, 150, sp), sp, GOOD, { plain: sp < 1 }); grow(540, 82, lerp(540, 640, sp), lerp(82, 150, sp), sp, BAD, { plain: sp < 1 });
      parcel(300, 200, 180, 76, 'ok', 'T', { s: pop(u, 1.1), fs: 22 }); parcel(660, 200, 180, 76, 'err', 'E', { s: pop(u, 1.4), fs: 22 });
      sub(300, 268, '성공값', fade(u, 1.5), { 'font-size': 15 }); sub(660, 268, '에러값', fade(u, 1.7), { 'font-size': 15 });
      tx(480, 340, '성공도 실패도 함수가 돌려주는 하나의 값이다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.0) });
      sub(480, 375, '예외(try/catch)라는 별도 통로가 없다', fade(u, 2.3), { 'font-size': 15 });
      return; }
    if (k === 1) {
      const sig = 'fn parse_port(s: &str) -> Result<u16, ParseIntError>', fs = 17, x0 = 480 - tw(sig, fs) / 2;
      const tx0 = x0 + tw('fn parse_port(s: &str) -> Result<', fs), tw1 = tw('u16', fs), ex0 = tx0 + tw('u16, ', fs), ew = tw('ParseIntError', fs);
      R.spans(x0, 66, [['fn', { 'font-weight': 700, fill: INFO }], [' parse_port(s: &str) -> Result<'], ['u16', { 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) }], [', '], ['ParseIntError', { 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) }], ['>']], { 'font-size': fs, 'font-weight': 600 });
      grow(tx0 + tw1 / 2, 80, 300, 160, seg(u, 0.7, 1.2), GOOD); grow(ex0 + ew / 2, 80, 660, 160, seg(u, 1.2, 1.7), BAD);
      parcel(300, 210, 200, 70, 'ok', 'u16', { s: pop(u, 1.1), fs: 18 }); parcel(660, 210, 240, 70, 'err', 'ParseIntError', { s: pop(u, 1.6), fs: 16 });
      sub(300, 272, '포트 번호', fade(u, 1.4), { 'font-size': 15 }); sub(660, 272, '숫자가 아닐 때', fade(u, 1.8), { 'font-size': 15 });
      tx(480, 350, '시그니처만 보고도 실패할 수 있는 함수인지 안다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.1) });
      return; }
    if (k === 2) { // "8080" → parse → Ok(8080) → ? 로 꺼냄 → Ok(port)
      const y = 200, P = [[110, '"8080"'], [290, 's.parse()'], [470, '?'], [650, 'port'], [830, 'Ok(port)']];
      pill(110, y, '"8080"', ACC, pop(u, 0.1), { mono: true, fs: 16 });
      grow(160, y, 222, y, seg(u, 0.3, 0.5), MUT);
      card(290, y, 130, 50, { rx: 8, text: 's.parse()', fs: 15, mono: true, stroke: INK, s: pop(u, 0.4) });
      parcel(290, 300, 150, 56, 'ok', '8080', { s: pop(u, 0.8), fs: 17 }); grow(290, 228, 290, 262, seg(u, 0.6, 0.8), GOOD, { plain: true });
      // ? 가 상자를 연다
      const q = seg(u, 1.0, 1.5); el('circle', { cx: 470, cy: y, r: 26, fill: PANEL, stroke: WARN, 'stroke-width': 2.6, opacity: fade(u, 0.9) }); mono(470, y + 8, '?', { 'font-size': 24, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      dot([[365, 300], [440, y + 10]], q, GOOD, 7);
      grow(498, y, 600, y, seg(u, 1.5, 1.8), MUT);
      card(650, y, 90, 48, { rx: 8, text: '8080', fs: 20, mono: true, fw: 800, stroke: INK, s: pop(u, 1.6) }); mono(650, y - 36, 'let port: u16', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      grow(698, y, 740, y, seg(u, 1.9, 2.1), MUT);
      parcel(830, y, 150, 56, 'ok', '8080', { s: pop(u, 2.1), fs: 17 });
      tx(480, 380, '꺼내 쓰고, 내보낼 때 다시 Ok 로 감싼다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) });
      return; }
    if (k === 3) {
      rs(60, 60, 'let r = parse_port("8080");', { fs: 17 });
      parcel(200, 160, 170, 64, 'ok', '8080', { s: pop(u, 0.3), fs: 19 });
      mono(310, 166, 'r: Result<u16, ParseIntError>', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.7) });
      sub(200, 222, '8080 이 아니라 Ok(8080)', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      rs(60, 286, 'let next = r + 1;', { fs: 17, op: fade(u, 1.3) });
      out(330, 262, 600, 'rustc', [['error[E0369]: cannot add `{integer}` to', BAD], ['  `Result<u16, ParseIntError>`', BAD]], typed(u, 1.6, 2.4, 2));
      return; }
    // k4: 결과를 버리면 경고
    rs(60, 60, 'parse_port("oops");', { fs: 17 });
    const f = E(u, 0.4, 1.4);
    parcel(lerp(200, 200, f), lerp(150, 260, f), 220, 60, 'err', 'InvalidDigit', { op: 1 - 0.6 * f, fs: 15 });
    el('path', { d: 'M140,280 L156,360 L244,360 L260,280', fill: SOFT, stroke: MUT, 'stroke-width': 2.4, opacity: fade(u, 0.3) });
    sub(200, 388, '그냥 버림', fade(u, 0.6), { 'font-size': 14.5 });
    out(360, 130, 560, 'rustc', [['warning: unused `Result` that must be used', WARN], ['  --> result_basics.rs:18:5', MUT], ['  = note: this `Result` may be an `Err`', MUT]], typed(u, 1.4, 2.3, 3), { col: WARN });
    tx(640, 300, '#[must_use] 덕분에 버린 실패를 빌드 때 잡는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) });
  }

  // ---------- 2. 두 갈래를 처리한다 ----------
  const J = { jx: 250, jy: 200, y1: 120, y2: 290, x2: 640 };
  function s2(t, c) { const { k, u } = c;
    const INP = ['parse_port("8080")', 'parse_port("oops")', 'parse_port("8080")', 'parse_port("x")'][k];
    const ok = k === 0 || k === 2, how = ['match', '.unwrap_or(3000)', '.unwrap()', '.expect("port required")'][k];
    rs(40, 46, k ? INP + how : 'match parse_port("8080") { Ok(port) => …, Err(e) => … }', { fs: 16 });
    const cliff = k >= 2;
    rails(J.jx, J.jy, J.y1, J.y2, J.x2, { errEnd: cliff ? 470 : J.x2, okOp: ok ? 0.8 : 0.35, errOp: ok ? 0.35 : 0.8 });
    el('line', { x1: 60, y1: J.jy, x2: J.jx, y2: J.jy, stroke: INK, 'stroke-width': 5, opacity: 0.6 });
    const route = ok ? [[60, J.jy], [J.jx, J.jy], [J.jx + 40, J.y1], [J.x2, J.y1]] : [[60, J.jy], [J.jx, J.jy], [J.jx + 40, J.y2], [cliff ? 470 : J.x2, J.y2]];
    const m = seg(u, 0.3, 1.4);
    if (m < 1) { const segs = route; dot(segs, m, ok ? GOOD : BAD, 9); }
    if (k === 0) {
      card(780, J.y1, 260, 52, { rx: 10, text: 'listening on 8080', fs: 16, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 1.4) });
      card(780, J.y2, 260, 52, { rx: 10, text: 'bad port: {e}', fs: 16, mono: true, stroke: BAD, op: 0.6 });
      mono(40, 380, '두 팔 중 하나라도 빠지면 E0004 로 컴파일되지 않는다', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.0) });
      return; }
    if (k === 1) {
      card(560, J.y2, 170, 48, { rx: 8, text: 'unwrap_or(3000)', fs: 15, mono: true, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 0.2) });
      el('path', { d: `M645,${J.y2} L700,${J.y2} L740,200 L790,200`, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 1.4) });
      card(860, 200, 130, 54, { rx: 10, text: '3000', fs: 22, mono: true, fw: 800, stroke: INK, s: pop(u, 1.6) });
      mono(860, 250, 'let port', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) });
      tx(40, 380, '실패를 기본값으로 흡수 — panic 없이 다음 줄로 간다', { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) });
      return; }
    // k2, k3: Err 선로 끝은 낭떠러지(panic)
    el('path', { d: 'M470,275 L470,300 Q490,340 470,400', fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' });
    mono(490, 344, 'panic!', { 'font-size': 18, 'font-weight': 800, fill: BAD });
    if (k === 2) {
      card(780, J.y1, 170, 52, { rx: 10, text: 'n = 8080', fs: 18, mono: true, fw: 800, stroke: GOOD, fill: GOODBG, s: pop(u, 1.4) });
      tx(40, 380, 'Ok 로만 시험하면 이 낭떠러지가 안 보인다', { 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      return; }
    const fall = seg(u, 1.4, 1.9); if (fall > 0) el('circle', { cx: 470 + fall * 10, cy: J.y2 + fall * 100, r: 9 * (1 - fall * 0.4), fill: BAD });
    out(570, 180, 370, 'stderr · 실행 결과', [["thread 'main' panicked at …", INK], ['port required:', BAD], ['ParseIntError { kind: InvalidDigit }', BAD], ['종료 코드 101', MUT]], typed(u, 1.8, 2.6, 4));
    mono(780, J.y1 + 6, 'm 은 만들어지지 않는다', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.4) });
  }

  // ---------- 3. ? 연산자 ----------
  function s3(t, c) { const { k, u } = c;
    const L = ['let text = match fs::read_to_string(path) {', '    Ok(t) => t,', '    Err(e) => return Err(e),', '};'];
    if (k === 0) { const n = typed(u, 0.2, 1.2, 4);
      L.forEach((s, i) => { if (i < Math.ceil(n)) rs(40, 90 + i * 36, s, { fs: 16, op: clamp(n - i) }); });
      grow(560, 162, 640, 162, seg(u, 1.3, 1.6), GOOD); tx(650, 168, 'Ok 면 t 를 꺼내 계속', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      el('path', { d: 'M470,192 Q520,192 520,150 L520,40', fill: 'none', stroke: BAD, 'stroke-width': 2.4, opacity: fade(u, 1.7), 'marker-end': 'url(#ra-ahr)' });
      tx(540, 50, '손으로 반송', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      tx(40, 300, '호출 한 번에 네 줄. 세 번 부르면 열두 줄이 성공 로직을 덮는다', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) });
      rs(40, 340, 'Ok(Config { raw: text })', { fs: 16, op: fade(u, 2.3) * 0.5 });
      return; }
    if (k === 1) { const sq = E(u, 0.2, 1.0);
      L.forEach((s, i) => rs(40, lerp(90 + i * 36, 140, sq), s, { fs: 16, op: 1 - sq }));
      const line = 'let text = fs::read_to_string(path)?;', qx = 40 + tw(line.slice(0, line.indexOf('?')), 17) + 5;
      rs(40, 140, line, { fs: 17, op: fade(u, 0.9) });
      el('circle', { cx: qx, cy: 134, r: 16 * pop(u, 1.1), fill: 'none', stroke: WARN, 'stroke-width': 2.6 });
      grow(qx, 152, qx, 250, seg(u, 1.4, 1.8), GOOD); pill(qx, 274, 'Ok → text 에 내용', GOOD, pop(u, 1.8), { fs: 14.5 });
      grow(qx + 18, 128, qx + 160, 60, seg(u, 1.6, 2.0), BAD); tx(qx + 170, 60, 'Err → 이 줄에서 return Err(e)', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      tx(40, 380, '네 줄이 한 글자로 — 하는 일은 같다', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) });
      return; }
    // k2: 성공은 아래로, 실패는 위로
    card(160, 60, 220, 50, { rx: 10, text: '호출자', fs: 16, stroke: INFO, color: INFO, fill: INFOBG });
    card(160, 170, 300, 50, { rx: 8, text: 'read_to_string(path)?', fs: 15, mono: true, stroke: INK });
    card(160, 290, 300, 50, { rx: 8, text: 'Ok(Config { raw: text })', fs: 15, mono: true, stroke: GOOD, fill: GOODBG });
    grow(160, 196, 160, 262, seg(u, 0.3, 0.8), GOOD); dot([[160, 196], [160, 262]], seg(u, 0.3, 0.8), GOOD, 7);
    mono(180, 236, '파일이 있으면', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) });
    el('path', { d: 'M310,170 Q380,170 380,120 Q380,60 272,60', fill: 'none', stroke: BAD, 'stroke-width': 2.6, opacity: fade(u, 1.0), 'marker-end': 'url(#ra-ahr)' });
    dot([[310, 170], [380, 140], [380, 90], [272, 60]], seg(u, 1.1, 1.7), BAD, 7);
    out(440, 150, 500, 'load("nope.conf") 실행 결과', [['Err(Os { code: 2,', BAD], ['     kind: NotFound, .. })', BAD]], typed(u, 1.7, 2.3, 2));
    tx(440, 320, '읽히는 건 성공 경로뿐, 실패는 ? 한 글자에 맡긴다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.3) });
  }

  // ---------- 4. From 변환 ----------
  function app(o) { o = o || {}; // 오른쪽: AppError 두 칸
    el('rect', { x: 620, y: 110, width: 300, height: 220, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    mono(640, 136, 'enum AppError', { 'font-size': 16, 'font-weight': 800, opacity: o.op ?? 1 });
    [['Io(io::Error)', 190, o.io], ['Parse(ParseIntError)', 270, o.parse]].forEach(([s, y, f]) => {
      card(770, y, 260, 52, { rx: 8, text: s, fs: 15, mono: true, stroke: f ? (y === 190 ? INFO : WARN) : MUT, dash: f ? null : '6 5', fill: f === 2 ? (y === 190 ? INFOBG : WARNBG) : PANEL, color: f ? INK : MUT, op: o.op ?? 1 }); }); }
  function adapter(y, name, col, u0) { // 왼쪽 에러 → From 깔때기 → 오른쪽 칸
    card(120, y, 180, 46, { rx: 23, text: name, fs: 15, mono: true, stroke: col, color: col, s: pop(u0, 0) });
    const g = clamp(u0 * 2.5 - 0.5);
    el('path', { d: `M250,${y - 26} L410,${y - 12} L410,${y + 12} L250,${y + 26} Z`, fill: PANEL, stroke: col, 'stroke-width': 2.2, opacity: g });
    mono(330, y + 6, 'From', { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: g });
    grow(212, y, 248, y, g, col, { plain: true }); grow(412, y, 636, y, clamp(u0 * 2.5 - 1.2), col); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { app({ op: fade(u, 0.2) });
      card(120, 190, 180, 46, { rx: 23, text: 'io::Error', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.8) });
      card(120, 270, 180, 46, { rx: 23, text: 'ParseIntError', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.1) });
      tx(380, 236, '?', { 'font-size': 40, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      tx(480, 390, '그릇만 있고 변환 규칙은 아직 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) });
      return; }
    if (k === 1 || k === 2) {
      app({ io: 1, parse: k === 2 ? 1 : 0 });
      adapter(190, 'io::Error', INFO, k === 1 ? seg(u, 0.2, 1.6) : 1);
      if (k === 1) { card(120, 270, 180, 46, { rx: 23, text: 'ParseIntError', fs: 15, mono: true, stroke: WARN, color: WARN, op: 0.5 }); rs(40, 60, 'impl From<std::io::Error> for AppError', { fs: 16, op: fade(u, 0.2) }); return; }
      adapter(270, 'ParseIntError', WARN, seg(u, 0.2, 1.6));
      rs(40, 60, 'impl From<ParseIntError> for AppError', { fs: 16, op: fade(u, 0.2) });
      out(40, 330, 560, 'From 이 없으면 · rustc', [['error[E0277]: `?` couldn\'t convert the error to `AppError`', BAD]], typed(u, 1.8, 2.5, 1), { fs: 13.5 });
      return; }
    // k3, k4: load_port 실행
    app({ io: k === 3 ? 2 : 1, parse: k === 4 ? 2 : 1 });
    const y = k === 3 ? 190 : 270, col = k === 3 ? INFO : WARN;
    adapter(190, 'io::Error', INFO, 1); adapter(270, 'ParseIntError', WARN, 1);
    rs(40, 60, k === 3 ? 'let text = std::fs::read_to_string(path)?;' : 'let port: u16 = text.trim().parse()?;', { fs: 16 });
    dot([[120, y], [250, y], [410, y], [640, y]], seg(u, 0.3, 1.3), col, 9);
    const rows = k === 3 ? [['load_port("nope.conf")', 'Err(Io(Os { code: 2, kind: NotFound, .. }))', BAD]]
      : [['load_port("app.conf")   // 8080', 'Ok(8080)', GOOD], ['load_port("bad.conf")   // eighty', 'Err(Parse(ParseIntError { kind: InvalidDigit }))', BAD]];
    rows.forEach(([a, b, cl], i) => { const yy = 352 + i * 30, at = 1.4 + i * 0.4; mono(40, yy, a, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, at) });
      mono(370, yy, '→ ' + b, { 'font-size': 14, 'font-weight': 700, fill: cl, opacity: fade(u, at + 0.2) }); });
    tx(620, 96, '반환 타입이 달라도 ? 가 From 을 태워 맞춘다', { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.0) });
  }

  // ---------- 5. 콤비네이터 · Option 오가기 · main ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const y = 190;
      rs(40, 60, 'parse_port("8080").map(|p| p + 1).unwrap_or(3000)', { fs: 17 });
      parcel(130, y, 150, 60, 'ok', '8080', { fs: 18 });
      grow(208, y, 270, y, seg(u, 0.2, 0.4), MUT);
      card(350, y, 150, 46, { rx: 8, text: '.map(|p| p + 1)', fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.3) });
      grow(428, y, 490, y, seg(u, 0.7, 0.9), MUT);
      parcel(570, y, 150, 60, 'ok', String(Math.round(tween(8080, 8081, u - 0.9, 0.5))), { fs: 18, s: pop(u, 0.9) });
      grow(648, y, 700, y, seg(u, 1.4, 1.6), MUT);
      card(790, y, 170, 46, { rx: 8, text: '.unwrap_or(3000)', fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.5) });
      card(790, y + 100, 120, 52, { rx: 8, text: '8081', fs: 22, mono: true, fw: 800, stroke: INK, s: pop(u, 2.0) }); grow(790, y + 24, 790, y + 72, seg(u, 1.8, 2.0), MUT);
      tx(40, 380, 'map 은 Ok 안만 바꾸고, Err 였다면 3000 이 나온다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.2) });
      return; }
    if (k === 1) { const y = 180, f = seg(u, 1.0, 2.0);
      rs(40, 60, 'let maybe: Option<u16> = parse_port("oops").ok();', { fs: 17 });
      parcel(200, y, 260, 64, 'err', 'InvalidDigit', { fs: 16, op: 1 - 0.7 * f });
      if (f > 0) for (let i = 0; i < 6; i++) mono(140 + i * 26, y + f * 160, 'InvalidDigit'[i * 2] || '', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: 1 - f });
      grow(340, y, 470, y, seg(u, 0.4, 0.9), MUT); card(530, y, 90, 44, { rx: 8, text: '.ok()', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.5) }); grow(578, y, 680, y, seg(u, 0.9, 1.2), MUT);
      parcel(780, y, 160, 64, 'none', null, { s: pop(u, 1.2) });
      tx(200, 380, '에러 내용이 여기서 버려진다', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      sub(780, 260, 'Err → None', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      return; }
    if (k === 2) { const y = 190;
      rs(40, 60, 'let first = "a,b".split(",").next().ok_or(AppError::…)?;', { fs: 15.5 });
      const xs = [130, 360, 600, 820];
      parcel(xs[0], y, 140, 60, 'some', '"a"', { fs: 18, s: pop(u, 0.2) }); mono(xs[0], y + 56, '.next()', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      grow(205, y, 285, y, seg(u, 0.5, 0.8), MUT); card(360, y, 130, 44, { rx: 8, text: '.ok_or(…)', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      grow(428, y, 525, y, seg(u, 0.9, 1.2), MUT); parcel(xs[2], y, 140, 60, 'ok', '"a"', { fs: 18, s: pop(u, 1.2) });
      grow(675, y, 760, y, seg(u, 1.5, 1.8), MUT); el('circle', { cx: 720, cy: y - 40, r: 16 * pop(u, 1.5), fill: 'none', stroke: WARN, 'stroke-width': 2.4 }); mono(720, y - 32, '?', { 'font-size': 20, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      card(xs[3], y, 120, 52, { rx: 8, text: 'first = "a"', fs: 15, mono: true, fw: 800, stroke: INK, s: pop(u, 1.9) });
      tx(40, 330, 'None 이었다면 붙여 준 AppError 를 담은 Err 가 되어 ? 가 반송한다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.2) });
      tx(40, 370, 'ok() 는 에러를 버리고, ok_or() 는 에러를 붙인다 — 서로 반대 방향', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) });
      return; }
    // k3: main -> Result 와 종료 코드
    rs(40, 60, 'fn main() -> Result<(), AppError> {', { fs: 17 });
    rs(70, 96, 'let cfg = load_port("app.conf")?;', { fs: 16 });
    rails(150, 200, 150, 280, 520);
    el('line', { x1: 60, y1: 200, x2: 150, y2: 200, stroke: INK, 'stroke-width': 5, opacity: 0.6 });
    dot([[60, 200], [150, 200], [190, 150], [520, 150]], seg(u, 0.2, 1.0), GOOD, 8);
    dot([[60, 200], [150, 200], [190, 280], [520, 280]], seg(u, 1.0, 1.8), BAD, 8);
    card(640, 150, 220, 50, { rx: 10, text: 'Ok(())  →  종료 코드 0', fs: 15, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 0.9) });
    out(540, 250, 400, '파일이 없을 때 · 실행 결과', [['Error: Io(Os { code: 2,', BAD], ['  kind: NotFound, .. })', BAD], ['종료 코드 1', INK]], typed(u, 1.7, 2.5, 3));
    tx(40, 400, '최상단까지 예외 없이 값으로 흐른다', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.5) });
  }

  const quiz = [
    { q: 'let r = parse_port("8080");에서 r의 값은 무엇인가?',
      o: ['8080', 'Ok(8080)', 'Some(8080)'], a: 1,
      why: 'parse_port는 Result<u16, ParseIntError>를 돌려준다. r + 1처럼 숫자로 쓰면 E0369로 막히고, 먼저 Ok를 벗겨야 한다.' },
    { q: 'parse_port("x").expect("port required")를 실행하면 어떻게 되는가?',
      o: ['port required: ParseIntError { kind: InvalidDigit }를 남기고 panic한다', '기본값 0을 돌려준다', 'Err를 호출자에게 돌려준다'], a: 0,
      why: 'expect는 Err에서 메시지를 붙여 panic하고 프로세스는 종료 코드 101로 끝난다. 기본값이 필요하면 unwrap_or(3000)을 쓴다.' },
    { q: 'let text = fs::read_to_string(path)?;에서 파일이 없으면 무엇이 일어나는가?',
      o: ['text가 빈 문자열이 된다', '그 자리에서 panic한다', '함수가 그 줄에서 Err(io::Error)를 돌려주고 끝난다'], a: 2,
      why: '?는 Ok면 값을 꺼내고 Err면 즉시 반환한다. match 네 줄로 손수 반송하던 일을 한 글자가 대신한다.' },
    { q: 'load_port의 에러 타입이 AppError인데 parse()?가 컴파일되려면 무엇이 필요한가?',
      o: ['parse 대신 unwrap을 쓴다', 'impl From<ParseIntError> for AppError', 'AppError에 #[must_use]를 붙인다'], a: 1,
      why: '?는 From으로 에러를 함수의 에러 타입으로 바꾼다. 구현이 없으면 E0277 `?` couldn\'t convert the error to `AppError`가 난다.' },
    { q: 'parse_port("oops").ok()의 결과와 그때 잃는 것은 무엇인가?',
      o: ['Some(0), 아무것도 잃지 않는다', 'Err(None), 값 타입', 'None, 실패 이유(ParseIntError)'], a: 2,
      why: 'ok()는 Ok(v)를 Some(v)로, Err를 None으로 바꾸며 에러 내용은 버린다. 반대로 ok_or()는 None에 에러를 붙인다.' },
  ];

  const summary = [
    'Rust에는 예외가 없다. 실패할 수 있는 함수는 Ok 또는 Err를 담은 Result를 돌려준다.',
    'Result를 그냥 버리면 must_use 경고가 나고, 숫자처럼 쓰려 하면 E0369로 막힌다.',
    'match는 두 팔을 다 요구하고, unwrap과 expect는 Err에서 panic해 종료 코드 101로 끝난다.',
    '?는 Ok면 값을 꺼내고 Err면 즉시 반환한다. From 구현이 있으면 에러 타입도 바꿔 준다.',
  ];
  const review = [
    { q: '설정 파일을 읽고 포트를 파싱하는 함수를 짰더니 E0277 `?` couldn\'t convert the error가 났다. 먼저 확인할 것은?',
      o: ['함수의 에러 타입에 해당 하위 에러의 From 구현이 있는지', '파일 경로가 맞는지', 'main이 Result를 돌려주는지'], a: 0,
      why: '컴파일 에러이므로 실행 환경과는 상관없다. ?가 하위 에러를 함수의 에러 타입으로 바꿀 From이 없을 때 나는 에러다.' },
    { q: '사용자 입력 포트가 숫자가 아니면 3000으로 띄우고 싶다. 가장 알맞은 코드는?',
      o: ['parse_port(s).unwrap()', 'parse_port(s).expect("port")', 'parse_port(s).unwrap_or(3000)'], a: 2,
      why: 'unwrap과 expect는 Err에서 프로그램을 끝낸다. unwrap_or는 Err를 기본값으로 바꿔 흐름을 이어 간다.' },
    { q: 'main을 fn main() -> Result<(), AppError>로 바꾸고 load_port(...)?를 썼다. 파일이 없으면 어떻게 되는가?',
      o: ['Error: Io(...)를 출력하고 종료 코드 1로 끝난다', 'panic으로 종료 코드 101이 된다', '에러를 무시하고 정상 종료한다'], a: 0,
      why: 'main이 Err를 돌려주면 에러의 Debug 출력 앞에 Error:가 붙어 찍히고 종료 코드 1이 된다. panic이 아니므로 101이 아니다.' },
  ];

  R.page({ title: 'Result — 실패를 값으로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
