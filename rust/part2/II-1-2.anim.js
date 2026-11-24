/* II-1-2 trait — 동작을 묶는 인터페이스 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 트레잇 계약 카드와 구현표(타입 × 트레잇), 구조체 필드 칸, 메서드 호출이 impl 블록을 찾아가는 길,
   바이트 칸(preview의 10바이트 자르기), 바운드 게이트, 크레이트 경계(오펀 규칙) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  // ---------- 지역 도우미 ----------
  // rustc 진단 상자: rows [[글, 색, 굵기]]
  function diag(x, y, w, rows, o) { o = o || {}; const lh = o.lh || 22, h = 16 + rows.length * lh, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: op });
    rows.forEach(([s, col, fw], i) => { const a = (o.show ? o.show(i) : 1) * op; if (a <= 0.01) return;
      mono(x + 14, y + 8 + i * lh + lh * 0.72, s, { 'font-size': o.fs || 14, fill: col || INK, 'font-weight': fw || 400, opacity: a }); });
    return h; }
  // 구현표: rows 타입 이름, cols 트레잇 이름, at(r, c) → { v: 'ok'|'no'|'auto'|'', a, hot }
  function implTable(x, y, rows, cols, at, o) { o = o || {}; const cw = o.cw || 110, nw = o.nw || 120, rh = 36, w = nw + cols.length * cw + 12, h = 40 + rows.length * rh;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 12, y + 24, o.title || '구현표', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    cols.forEach((s, j) => mono(x + nw + j * cw + cw / 2, y + 24, s, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: MUT }));
    rows.forEach((s, i) => { const yy = y + 40 + i * rh + rh / 2;
      el('line', { x1: x + 8, y1: yy - rh / 2, x2: x + w - 8, y2: yy - rh / 2, stroke: GRID, 'stroke-width': 1 });
      mono(x + 14, yy + 5, s, { 'font-size': 15, 'font-weight': 700 });
      cols.forEach((_, j) => { const st = at(i, j) || {}, cx = x + nw + j * cw + cw / 2, a = st.a ?? 1;
        if (st.hot) el('rect', { x: cx - cw / 2 + 4, y: yy - rh / 2 + 3, width: cw - 8, height: rh - 6, rx: 6, fill: st.v === 'no' ? BADBG : GOODBG, opacity: a });
        if (st.v === 'ok' || st.v === 'auto') { if (a > 0) check(cx - (st.v === 'auto' ? 22 : 0), yy, 8, a); if (st.v === 'auto') tx(cx + 2, yy + 5, '자동', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: a }); }
        else if (st.v === 'no') { if (a > 0) cross(cx, yy, 7, a); }
        else el('circle', { cx, cy: yy, r: 4, fill: GRID }); }); });
    return { w, h, cell: (i, j) => [x + nw + j * cw + cw / 2, y + 40 + i * rh + rh / 2] }; }
  // 구조체 칸: 이름 + 필드 [이름, 값]
  function structBox(x, y, name, fields, o) { o = o || {}; const fw = o.fw || 130, h = 64, op = o.op ?? 1, col = o.stroke || INK;
    tx(x, y - 10, name, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op, class: 'mono' });
    fields.forEach(([n, v], i) => { const xx = x + i * (fw + 6);
      el('rect', { x: xx, y, width: fw, height: h, rx: 6, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2, opacity: op });
      mono(xx + 10, y + 22, n, { 'font-size': 13.5, fill: MUT, opacity: op });
      if (v != null) mono(xx + 10, y + 48, v, { 'font-size': 15, 'font-weight': 700, opacity: op * (o.vop ?? 1) }); });
    return { x, y, w: fields.length * (fw + 6) - 6, h }; }
  // 메서드 꼬리표 (구조체 아래)
  const tag = (x, y, s, col, a, o) => { if (a <= 0) return; o = o || {}; const w = tw(s, 14) + 24;
    el('rect', { x, y, width: w, height: 30, rx: 15, fill: o.fill || (col === ACC ? ACCBG : PANEL), stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': o.dash, opacity: a });
    mono(x + 12, y + 20, s, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: a }); return w; };

  // ---------- 1. trait 정의와 impl ----------
  const ART = [['title', '"Rust 1.80"'], ['author', '"core"']], TW = [['user', '"core"'], ['body', '"hi"']];
  function s1(t, c) { const { k, u } = c;
    // 계약 카드
    const cg = k === 0 ? pop(u, 0.2) : 1;
    card(250, 66, 400, 96, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.4, s: cg });
    if (cg > 0.9) { mono(70, 52, 'trait Summary {', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      mono(90, 78, 'fn summarize(&self) -> String;', { 'font-size': 15 }); mono(70, 98, '}', { 'font-size': 15, fill: ACC }); }
    if (k === 0) tx(250, 132, '시그니처만 있다. 본문은 각 타입이 채운다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9) });
    // 두 구조체
    if (k >= 1) { const a1 = k === 1 ? fade(u, 0.2) : 1, a2 = k === 1 ? fade(u, 0.7) : 1;
      structBox(50, 180, 'Article', ART, { op: a1, stroke: k === 2 || (k === 4) ? ACC : INK });
      structBox(50, 300, 'Tweet', TW, { op: a2, stroke: k === 3 ? ACC : INK });
      if (k === 1) tx(470, 260, '필드 구성이 서로 다른 두 타입', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.3) }); }
    // impl 꼬리표
    if (k >= 2) tag(330, 196, 'summarize: "{title} — {author}"', ACC, k === 2 ? fade(u, 1.0) : 1);
    if (k >= 3) tag(330, 316, 'summarize: "@{user}: {body}"', ACC, k === 3 ? fade(u, 1.0) : 1);
    // 구현표
    implTable(690, 120, ['Article', 'Tweet'], ['Summary'], (i) => { const on = (i === 0 && k >= 2) || (i === 1 && k >= 3), now = (i === 0 && k === 2) || (i === 1 && k === 3);
      return on ? { v: 'ok', a: now ? pop(u, 0.5) : 1, hot: now } : {}; }, { nw: 110, cw: 120 });
    if (k === 2 || k === 3) mono(810, 260, k === 2 ? 'impl Summary for Article' : 'impl Summary for Tweet', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
    if (k === 4) { // a.summarize()가 Article의 impl을 찾아간다
      mono(700, 300, 'a.summarize()', { 'font-size': 17, 'font-weight': 800, fill: ACC });
      dot([[700, 290], [600, 250], [520, 211]], seg(u, 0.2, 1.0), ACC, 7);
      fly(480, 211, 700, 368, seg(u, 1.0, 1.7), 'Rust 1.80', { mono: true }); fly(540, 211, 790, 368, seg(u, 1.2, 1.9), 'core', { mono: true });
      card(750, 368, 260, 40, { rx: 8, fill: INK, stroke: 'none', text: 'Rust 1.80 — core', fs: 16, mono: true, color: PANEL, s: pop(u, 2.0) }); } }

  // ---------- 2. 기본 메서드 ----------
  const SUMA = 'Rust 1.80 — core';
  function bytesOf(s) { const out = []; for (const ch of s) { const n = new TextEncoder().encode(ch).length; for (let i = 0; i < n; i++) out.push(i === 0 ? ch : ''); } return out; }
  function s2(t, c) { const { k, u } = c;
    // 트레잇 카드: 필수 칸 + (k1부터) 기본 구현 칸
    el('rect', { x: 30, y: 20, width: 420, height: k >= 1 ? 150 : 86, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 });
    mono(46, 46, 'trait Summary', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    mono(60, 76, 'fn summarize(&self) -> String;', { 'font-size': 14.5 }); pill(400, 72, '필수', BAD, k === 0 ? pop(u, 0.4) : 1, { fs: 13.5 });
    if (k >= 1) { const a = k === 1 ? fade(u, 0.3) : 1;
      mono(60, 112, 'fn preview(&self) -> String {', { 'font-size': 14.5, opacity: a }); pill(400, 108, '기본', GOOD, k === 1 ? pop(u, 0.5) : 1, { fs: 13.5 });
      mono(76, 136, 'self.summarize() 앞 10바이트 + "..."', { 'font-size': 14, fill: MUT, opacity: a });
      if (k === 1) { el('path', { d: 'M54,130 C20,120 20,82 54,78', fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'marker-end': 'url(#ra-ahb)', opacity: fade(u, 1.2) });
        tx(470, 112, '기본 메서드는 필수 메서드를 불러 만든다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); } }
    // 두 impl 블록
    const rows = [['impl Summary for Article', k >= 2 ? (k === 3 ? 0.45 : 1) : 0.45], ['impl Summary for Tweet', k >= 3 ? 1 : 0.45]];
    rows.forEach(([s, a], i) => { const y = 200 + i * 104;
      el('rect', { x: 30, y, width: 420, height: 92, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6, opacity: a });
      mono(46, y + 24, s, { 'font-size': 15, 'font-weight': 700, opacity: a });
      tag(46, y + 42, 'summarize', INK, a, { fill: PANEL });
      if (i === 0 && k >= 2) tag(170, y + 42, 'preview (물려받음)', GOOD, (k === 2 ? fade(u, 0.6) : 1) * (k === 3 ? 0.6 : 1), { dash: '5 4', fill: GOODBG });
      if (i === 1 && k >= 3) tag(170, y + 42, 'preview (덮어씀)', WARN, k === 3 ? pop(u, 0.6) : 1, { fill: WARNBG }); });
    if (k === 2) { grow(300, 140, 300, 236, seg(u, 0.2, 0.8), GOOD, { dash: '6 5' });
      // 10바이트 자르기
      const B = bytesOf(SUMA), x0 = 500, w = 23;
      tx(500, 214, 'summarize() = "Rust 1.80 — core"  바이트로 보면', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
      B.forEach((ch, i) => { const a = fade(u, 1.0 + i * 0.03); el('rect', { x: x0 + i * w, y: 226, width: w - 2, height: 34, rx: 3, fill: i < 10 ? GOODBG : PANEL, stroke: i < 10 ? GOOD : GRID, 'stroke-width': 1.4, opacity: a });
        if (ch) mono(x0 + i * w + (w - 2) / 2, 248, ch === ' ' ? '·' : ch, { 'text-anchor': 'middle', 'font-size': 14, opacity: a }); });
      if (u > 1.8) { el('line', { x1: x0 + 10 * w - 1, y1: 218, x2: x0 + 10 * w - 1, y2: 268, stroke: BAD, 'stroke-width': 2.5 }); mono(x0 + 10 * w + 6, 286, '..10', { 'font-size': 14, fill: BAD, 'font-weight': 700 }); }
      card(700, 330, 330, 40, { rx: 8, fill: INK, stroke: 'none', text: '[미리보기] Rust 1.80 ...', fs: 15, mono: true, color: PANEL, s: pop(u, 2.1) }); }
    if (k === 3) { mono(500, 330, 'fn preview(&self) -> String {', { 'font-size': 14.5, opacity: fade(u, 0.8) }); mono(520, 354, 'format!("🐦 @{}", self.user)', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(500, 300, 'Tweet은 자기 preview를 쓴다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) }); }
    if (k === 4) terminal(500, 220, 420, 120, ['article.preview()', '[미리보기] Rust 1.80 ...', 'tweet.preview()', '🐦 @core'], 1 + seg(u, 0.3, 2.2) * 3, { title: '같은 호출, 두 결과' });
    if (k === 0) tx(480, 140, 'impl 블록은 이 칸을 반드시 채워야 한다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) }); }

  // ---------- 3. 트레잇 바운드 ----------
  function s3(t, c) { const { k, u } = c;
    spans(40, 52, k === 1 ? [['fn notify_short(item: &', {}], ['impl Summary', { fill: ACC, 'font-weight': 800 }], [')', {}]] : k === 2 ? [['fn make_tweet() -> ', {}], ['impl Summary', { fill: ACC, 'font-weight': 800 }]] : [['fn notify<T', {}], [': Summary', { fill: ACC, 'font-weight': 800 }], ['>(item: &T)', {}]], { 'font-size': 19, 'font-weight': 700, opacity: k === 1 || k === 2 ? fade(u, 0.2) : 1 });
    if (k === 1) { mono(40, 92, 'fn notify<T: Summary>(item: &T)', { 'font-size': 16, fill: MUT, opacity: fade(u, 0.5) }); tx(440, 92, '와 같은 뜻, 더 짧은 표기', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8) }); }
    const tbl = implTable(640, 100, ['Article', 'Tweet', 'i32'], ['Summary'], (i) => ({ v: i < 2 ? 'ok' : 'no', hot: (k === 0 && i === 0) || (k === 3 && i < 2) || (k === 4 && i === 2), a: 1 }), { nw: 110, cw: 140 });
    if (k === 2) { // 구체 타입을 감춘 상자
      el('rect', { x: 40, y: 130, width: 520, height: 170, rx: 14, fill: SOFT, stroke: ACC, 'stroke-width': 2.4 });
      mono(60, 160, 'impl Summary', { 'font-size': 17, 'font-weight': 800, fill: ACC });
      const hide = E(u, 1.0, 1.8);
      structBox(70, 200, 'Tweet', [['user', '"core"'], ['body', '"hi"']], { op: 1 - hide, fw: 120 });
      if (hide > 0.5) { el('rect', { x: 64, y: 176, width: 270, height: 96, rx: 8, fill: GRID, opacity: 0.9 * hide }); tx(199, 232, '호출자에게는 안 보인다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: clamp((hide - 0.7) / 0.3) }); }
      tag(370, 214, 'summarize()', ACC, fade(u, 1.8));
      tx(300, 340, '호출자가 아는 것: Summary를 구현한 무언가', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // 게이트
    const gx = 420, gy = 200;
    el('rect', { x: gx - 9, y: gy - 60, width: 18, height: 120, rx: 5, fill: ACC });
    mono(gx, gy + 84, 'T: Summary', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC });
    if (k === 0 || k === 1) { const x = lerp(90, 560, E(u, 0.4, 2.0)); pill(x, gy, '&article', GOOD, 1, { mono: true, fs: 15 }); }
    if (k === 3) { [['&article', '속보! Rust 1.80 — core', 0.2], ['&make_tweet()', '속보! hi', 0.9]].forEach(([s, out, a], i) => { const x = lerp(100, 560, E(u, a, a + 1.0));
        pill(x, gy - 30 + i * 60, s, GOOD, 1, { mono: true, fs: 14 }); });
      terminal(40, 310, 540, 96, ['$ ./bounds', '속보! Rust 1.80 — core', '속보! hi'], 1 + seg(u, 1.2, 2.4) * 2, { title: '실행 결과' }); }
    if (k === 4) { const x = lerp(100, gx - 50, E(u, 0.2, 1.0)) - E(u, 1.0, 1.5) * 60; pill(x, gy, '&42', BAD, 1, { mono: true, fs: 15 }); cross(gx, gy - 80, 11, pop(u, 1.0));
      diag(40, 310, 580, [['error[E0277]: the trait bound `{integer}: Summary`', BAD, 700], ['               is not satisfied', BAD, 700], ['note: required by a bound in `notify`', INK]], { show: (i) => fade(u, 1.3 + i * 0.3) }); } }

  // ---------- 4. 표준 트레잇: Display · From/Into ----------
  function s4(t, c) { const { k, u } = c;
    const cols = ['Display', 'Debug', 'Into<String>'];
    implTable(500, 30, ['Article', 'Tweet'], cols, (i, j) => {
      if (i === 0 && j === 0) return k >= 0 ? { v: 'ok', a: k === 0 ? pop(u, 0.6) : 1, hot: k === 0 || k === 2 } : {};
      if (i === 0 && j === 2) return k >= 1 ? { v: 'auto', a: k === 1 ? fade(u, 1.6) : 1, hot: k === 1 || k === 3 } : {};
      if (i === 1 && j === 1) return k === 4 ? { v: 'ok', a: fade(u, 1.4), hot: true } : {};
      if (i === 1 && j === 0) return k === 4 ? { v: 'no', a: pop(u, 0.4), hot: true } : {};
      return {}; }, { nw: 100, cw: 120 });
    if (k === 0) { mono(40, 60, 'impl fmt::Display for Article', { 'font-size': 17, 'font-weight': 800, fill: ACC });
      mono(60, 88, 'write!(f, "{} by {}", self.title, self.author)', { 'font-size': 14.5, fill: MUT });
      [['println!("{}", a)', 0.9], ['a.to_string()', 1.3], ['format!("{a}")', 1.7]].forEach(([s, a], i) => pill(160 + i * 0, 190 + i * 50, s, ACC, pop(u, a), { mono: true, fs: 15 }));
      tx(330, 240, '이 셋이 한꺼번에 열린다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { // From 한 방향을 쓰면 Into가 따라온다
      card(130, 230, 160, 60, { rx: 10, text: 'Article', fs: 17, mono: true, stroke: INK });
      card(470, 230, 160, 60, { rx: 10, text: 'String', fs: 17, mono: true, stroke: ACC, color: ACC });
      grow(214, 214, 386, 214, seg(u, 0.3, 1.0), ACC); mono(300, 200, 'String::from(a)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      grow(214, 250, 386, 250, seg(u, 1.4, 2.0), GOOD, { dash: '6 5' }); mono(300, 278, 'a.into()', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      mono(40, 70, 'impl From<Article> for String', { 'font-size': 17, 'font-weight': 800, fill: ACC });
      tx(40, 100, '표준 라이브러리의 impl<T, U: From<T>> Into<U> for T 덕분에 Into가 따라온다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k2, k3: 실제로 찍고 바꾼다
    const moved = k === 3 && u > 1.3;
    structBox(40, 120, 'a: Article', [['title', '"Rust"'], ['author', '"core"']], { fw: 120, op: moved ? 0.35 : 1, stroke: moved ? OFF : INK });
    if (moved) { cross(300, 152, 12, pop(u, 1.3)); tx(40, 220, 'a는 into()로 옮겨져 더 쓸 수 없다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); }
    if (k === 2) { mono(40, 260, 'println!("{}", a);', { 'font-size': 17, 'font-weight': 700 }); terminal(40, 290, 420, 80, ['$ ./std_traits', 'Rust by core'], 1 + seg(u, 0.8, 1.4), {}); }
    if (k === 3) { mono(40, 260, 'let s: String = a.into();', { 'font-size': 17, 'font-weight': 700 });
      fly(170, 152, 620, 300, seg(u, 0.4, 1.3), 'a', { mono: true });
      card(700, 300, 260, 52, { rx: 8, stroke: ACC, fill: ACCBG, text: 's = "Rust — core"', fs: 16, mono: true, color: ACC, s: pop(u, 1.3) });
      tx(700, 350, 'from() 본문이 a.summarize()를 돌려준다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) {
      mono(40, 250, 'println!("{:?}", tweet);  // derive(Debug)', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(40, 220, 'println!("{}", tweet);', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.2) });
      diag(40, 290, 600, [['error[E0277]: `Tweet` doesn\'t implement `std::fmt::Display`', BAD, 700], ['{:?} 는 Debug, {} 는 Display. Display는 derive가 없다', INK]], { show: (i) => fade(u, 0.5 + i * 0.9) }); } }

  // ---------- 5. 오펀 규칙과 newtype ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { // 네 가지 조합 표
      tx(480, 44, 'impl 트레잇 for 타입 — 둘 중 하나는 내 크레이트 것', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      const cells = [['내 트레잇', '내 타입', true, 'Summary for Article'], ['내 트레잇', '남의 타입', true, 'Summary for i32'], ['남의 트레잇', '내 타입', true, 'Display for Wrapper'], ['남의 트레잇', '남의 타입', false, 'Display for Vec<String>']];
      cells.forEach(([a, b, ok, ex], i) => { const x = 60 + (i % 2) * 430, y = 80 + Math.floor(i / 2) * 150, s = pop(u, 0.2 + i * 0.35);
        card(x + 200, y + 60, 400, 120, { rx: 12, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, sw: 2, s });
        if (s > 0.9) { tx(x + 24, y + 40, `${a} × ${b}`, { 'font-size': 16, 'font-weight': 800 }); mono(x + 24, y + 72, ex, { 'font-size': 15, fill: MUT });
          tx(x + 24, y + 102, ok ? '허용' : 'E0117 금지', { 'font-size': 15, 'font-weight': 800, fill: ok ? GOOD : BAD }); if (ok) check(x + 360, y + 60, 12, 1); else cross(x + 360, y + 60, 11, 1); } });
      return; }
    // 크레이트 두 구역
    zone(30, 30, 420, 360, '내 크레이트', { stroke: ACC, fill: ACCBG, color: ACC });
    zone(510, 30, 420, 360, '표준 라이브러리 std (남의 크레이트)', { stroke: GRID });
    card(620, 110, 150, 48, { rx: 8, text: 'Display', fs: 16, mono: true, stroke: INFO, color: INFO, fill: INFOBG });
    card(820, 110, 150, 48, { rx: 8, text: 'Vec<String>', fs: 15, mono: true, stroke: INK });
    sub(620, 152, '트레잇', 1); sub(820, 152, '타입', 1);
    if (k === 0) { el('path', { d: 'M620,136 C620,220 820,220 820,136', fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', opacity: fade(u, 0.3) });
      mono(720, 238, 'impl Display for Vec', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5) }); cross(720, 200, 11, pop(u, 1.0));
      diag(40, 290, 880, [['error[E0117]: only traits defined in the current crate can be', BAD, 700], ['     implemented for types defined outside of the crate', BAD, 700]], { show: (i) => fade(u, 1.3 + i * 0.3) });
      tx(240, 150, '둘 다 남의 것이면 막힌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      tx(240, 180, '두 크레이트가 각자 구현을 넣으면 충돌하기 때문', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k1~3: Wrapper
    const wg = k === 1 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: 60, y: 100, width: 360 * wg, height: 120, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2.6 });
    if (wg >= 1) { mono(76, 126, 'struct Wrapper(Vec<String>)', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      [['ptr', '•'], ['len', '2'], ['cap', '2']].forEach(([n, v], i) => { const x = 90 + i * 100; card(x + 40, 172, 80, 44, { rx: 6, text: v, fs: 17, mono: true, stroke: INK }); mono(x + 40, 210, n, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); });
      mono(400, 210, 'self.0', { 'text-anchor': 'end', 'font-size': 14, fill: ACC, 'font-weight': 700 }); }
    if (k === 1) { grow(820, 140, 430, 170, seg(u, 0.2, 1.0), MUT, { dash: '5 5' }); tx(240, 252, 'Vec과 같은 24 바이트, 이름만 내 것', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k >= 2) { el('path', { d: 'M560,110 C480,110 440,130 420,150', fill: 'none', stroke: GOOD, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)', opacity: k === 2 ? fade(u, 0.3) : 1 });
      mono(240, 262, 'impl Display for Wrapper', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: k === 2 ? fade(u, 0.6) : 1 }); check(400, 256, 10, k === 2 ? pop(u, 1.0) : 1);
      if (k === 2) mono(240, 292, 'write!(f, "[{}]", self.0.join(", "))', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 3) { ['"a"', '"b"'].forEach((s, i) => card(120 + i * 80, 330, 64, 40, { rx: 6, text: s, fs: 15, mono: true, stroke: INK, s: pop(u, 0.2 + i * 0.2) }));
      grow(300, 330, 560, 330, seg(u, 0.8, 1.4), ACC);
      card(720, 330, 220, 52, { rx: 8, fill: INK, stroke: 'none', text: '[a, b]', fs: 20, mono: true, color: PANEL, s: pop(u, 1.5) });
      tx(720, 380, 'println!("{}", w)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, class: 'mono', opacity: fade(u, 1.7) }); } }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'Article과 Tweet이 둘 다 impl Summary를 하면 호출하는 쪽이 얻는 것은 무엇인가?',
      o: ['두 타입의 필드가 같아진다', '타입을 몰라도 summarize() 하나로 부를 수 있다', 'summarize의 출력 형식이 같아진다'], a: 1,
      why: '트레잇은 메서드 시그니처의 계약이다. 출력 형식은 각 impl이 정하고, 호출은 같은 이름으로 한다.' },
    { q: 'impl Summary for Article이 preview를 정의하지 않으면 article.preview()는 어떻게 되는가?',
      o: ['컴파일 에러가 난다', '빈 문자열을 돌려준다', '트레잇의 기본 구현이 쓰여 [미리보기] Rust 1.80 ...이 나온다'], a: 2,
      why: '본문이 있는 메서드는 기본 구현이다. Article은 summarize만 채우고 preview는 그대로 물려받는다.' },
    { q: 'notify(&42)가 컴파일되지 않는 이유는 무엇인가?',
      o: ['i32가 Summary를 구현하지 않아 T: Summary 바운드를 못 지킨다', '42가 참조로 넘어갈 수 없다', 'notify가 Article만 받도록 적혀 있다'], a: 0,
      why: '바운드는 구현표를 보고 호출 지점에서 검사된다. rustc는 the trait bound `{integer}: Summary` is not satisfied로 막는다.' },
    { q: 'impl From<Article> for String을 쓰면 따로 쓰지 않아도 생기는 것은 무엇인가?',
      o: ['Article의 Display 구현', 'a.into()로 String을 얻는 Into 구현', 'Article의 Clone 구현'], a: 1,
      why: '표준 라이브러리가 From<T>를 구현한 모든 U에 대해 Into<U> for T를 미리 깔아 둔다. 그래서 let s: String = a.into()가 된다.' },
    { q: 'impl Display for Vec<String>이 E0117로 막히는 이유는 무엇인가?',
      o: ['Vec에는 이미 Display가 있다', 'Display를 쓰려면 derive가 필요하다', '트레잇과 타입이 모두 남의 크레이트 것이다'], a: 2,
      why: '오펀 규칙은 트레잇이나 타입 중 하나가 내 크레이트 것이어야 한다. Wrapper(Vec<String>)로 감싸면 타입이 내 것이 된다.' },
  ];

  const summary = [
    '트레잇은 메서드 시그니처의 계약이고, 각 타입은 impl 블록에서 본문을 채운다.',
    '기본 메서드는 필수 메서드를 불러 만들어 두고, 필요한 타입만 덮어쓴다.',
    'T: Summary 바운드를 걸면 구현하지 않은 타입은 호출 지점에서 E0277로 막힌다.',
    'From을 구현하면 Into가 따라오고, 남의 트레잇을 남의 타입에 붙일 때는 newtype으로 감싼다.',
  ];
  const review = [
    { q: 'derive(Debug)를 붙인 Tweet을 println!("{}", tweet)으로 찍자 E0277이 났다. 할 일은?',
      o: ['impl fmt::Display for Tweet을 직접 쓴다', '#[derive(Display)]를 붙인다', 'Debug derive를 지운다'], a: 0,
      why: '{}는 Display를 찾는다. Display는 사람이 읽을 모양이라 derive가 없고 fmt를 직접 써야 한다.' },
    { q: '외부 크레이트의 타입 Vec<String>에 내 Summary 트레잇을 impl하려 한다. 어떻게 되는가?',
      o: ['E0117로 막혀 newtype이 필요하다', '트레잇이 내 것이라 그대로 허용된다', 'Vec이 이미 Summary를 구현해 충돌한다'], a: 1,
      why: '오펀 규칙은 둘 중 하나만 내 것이면 된다. 막히는 것은 Display for Vec처럼 둘 다 남의 것일 때다.' },
    { q: '한글 제목 "가나다라"의 Article에 기본 preview를 부르자 panic이 났다. 원인은?',
      o: ['summarize가 String 대신 &str을 돌려서', '바이트 10에서 자르는데 그 자리가 글자 중간이라서', 'Article이 preview를 덮어쓰지 않아서'], a: 1,
      why: '&s[..10]은 바이트 기준이다. 한글은 한 글자가 3바이트라 10번째 바이트가 \'라\' 안에 걸리면 char boundary panic이 난다.' },
  ];

  R.page({ title: '트레잇 계약과 구현표', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
