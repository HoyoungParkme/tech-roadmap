/* IV-2-1 panic! 과 unwrap — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 호출 스택을 쌓인 판으로 그리고, panic 은 위에서부터 판을 걷어 내며(drop) 되감는 모습으로 그린다.
 * panic 메시지·drop 순서·오버플로 결과·바이너리 크기는 rustc 1.100(Windows)으로 실제 실행해 확인한 것이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
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
  // 호출 스택 판 하나 (아래가 먼저 쌓인 것). st: ok | panic | gone | check
  function frame(cx, y, w, name, note, st, o) { o = o || {}; const op = o.op ?? 1; if (op <= 0.01) return;
    const col = st === 'panic' ? BAD : st === 'check' ? WARN : st === 'gone' ? OFF : INK;
    card(cx, y, w, 44, { rx: 6, stroke: col, sw: 2.2, fill: st === 'panic' ? BADBG : st === 'gone' ? SOFT : PANEL, op, s: o.s, dash: st === 'gone' ? '5 4' : null });
    mono(cx - w / 2 + 14, y + 6, name, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
    if (note) tx(cx + w / 2 - 12, y + 6, note, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }

  // ---------- 1. panic! vs Result ----------
  const FR = [['main', '_g'], ['run_app', '_g'], ['validate(-3)', '_g']];
  function s1(t, c) { const { k, u } = c, cx = 200, w = 300, Y = (i) => 330 - i * 58;
    tx(cx, 66, '호출 스택', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    el('line', { x1: cx - w / 2 - 10, y1: 356, x2: cx + w / 2 + 10, y2: 356, stroke: INK, 'stroke-width': 3 });
    if (k === 0) {
      FR.forEach(([n], i) => frame(cx, Y(i), w, n, '지역 변수 _g', i === 2 && u > 1.6 ? 'check' : 'ok', { s: pop(u, 0.2 + i * 0.4) }));
      rs(400, 120, 'if age < 0 {', { fs: 17, op: fade(u, 1.2) });
      mono(420, 160, 'age = -3', { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
      card(720, 150, 120, 44, { rx: 22, text: '참', fs: 17, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 1.7) });
      tx(400, 260, '프로그램이 믿는 전제(나이 ≥ 0)가 깨졌다', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.0) });
      sub(560, 300, '다음 줄에서 panic! 이 실행된다', fade(u, 2.3), { 'font-size': 15 });
      return; }
    if (k === 1) {
      FR.forEach(([n], i) => frame(cx, Y(i), w, n, '', i === 2 ? 'check' : 'ok', { op: 0.3 }));
      const x2 = 640;
      tx(x2, 66, '다른 호출: parse_age("abc")', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
      el('line', { x1: x2 - 160, y1: 356, x2: x2 + 160, y2: 356, stroke: INK, 'stroke-width': 3 });
      frame(x2, 330, 300, 'main', 'Err 를 받아 match', 'ok');
      const back = E(u, 1.2, 2.0);
      frame(x2, 272, 300, 'parse_age', '', 'ok', { s: pop(u, 0.2), op: 1 - back });
      parcel(lerp(x2 + 60, x2 + 60, back), lerp(200, 280, back) - 70, 300, 56, 'err', 'ParseIntError { kind: InvalidDigit }', { fs: 13.5, s: pop(u, 0.8) });
      tx(x2, 400, '실패가 값으로 돌아온다 — 호출자가 다음을 고른다', { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      return; }
    // k2: panic! → 위에서부터 drop 하며 되감기
    const T = [0.9, 1.4, 1.9];
    FR.forEach(([n], i) => { const at = T[2 - i], gone = u > at;
      frame(cx, Y(i), w, n, '', gone ? 'gone' : i === 2 ? 'panic' : 'ok', { op: gone ? 0.5 : 1 });
      if (gone) mono(cx + w / 2 + 20, Y(i) + 6, `drop ${n.replace('(-3)', '')}`, { 'font-size': 15, 'font-weight': 700, fill: WARN }); });
    out(540, 80, 400, 'stderr · 실행 결과', [["thread 'main' panicked at …", INK], ['나이는 음수가 될 수 없다: -3', BAD]], typed(u, 0.2, 0.8, 2));
    grow(cx + w / 2 + 160, 190, cx + w / 2 + 160, 360, seg(u, 0.9, 2.1), BAD);
    tx(cx + w / 2 + 174, 270, '되감는 순서', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9) });
    tx(700, 400, '이 스레드에서 이후 코드는 실행되지 않는다', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.3) });
  }

  // ---------- 2. unwrap 의 정체 ----------
  function machine(o) { // 가운데 unwrap 기계: 위 입구, 오른쪽 출구(값), 아래 출구(panic)
    card(420, 200, 220, 120, { rx: 12, stroke: INK, sw: 2.6, fill: SOFT });
    mono(420, 180, '.unwrap()', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
    mono(420, 210, 'match 한 번', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    el('line', { x1: 530, y1: 200, x2: 640, y2: 200, stroke: GOOD, 'stroke-width': 4, opacity: o.okOp ?? 0.5 });
    el('line', { x1: 420, y1: 260, x2: 420, y2: 330, stroke: BAD, 'stroke-width': 4, opacity: o.badOp ?? 0.5, 'stroke-dasharray': '6 4' });
    tx(585, 190, '값', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle' }); tx(438, 300, 'panic!', { 'font-size': 14.5, 'font-weight': 700, fill: BAD }); }
  function boom(cx, cy, s) { if (s <= 0) return; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r1 = 16 * s, r2 = 34 * s;
    el('line', { x1: cx + Math.cos(a) * r1, y1: cy + Math.sin(a) * r1, x2: cx + Math.cos(a) * r2, y2: cy + Math.sin(a) * r2, stroke: BAD, 'stroke-width': 3.5, 'stroke-linecap': 'round' }); }
    el('circle', { cx, cy, r: 12 * s, fill: BAD }); }
  function s2(t, c) { const { k, u } = c;
    const ok = k === 0 || k === 2, kind = [ 'some', 'none', 'ok', 'err' ][k], val = ['v', null, '42', '"타임아웃"'][k];
    machine({ okOp: ok ? 0.9 : 0.3, badOp: ok ? 0.3 : 0.9 });
    rs(40, 46, ['Some(v) => v,', 'None => panic!("called unwrap on None"),', 'let n = ok.unwrap();     // ok = Ok(42)', 'let n = bad.unwrap();    // bad = Err("타임아웃")'][k], { fs: 16 });
    const m = E(u, 0.2, 0.9);
    parcel(lerp(140, 300, m), 200, 150, 60, kind, val, { fs: 16, op: 1 - fade(u, 0.9, 0.3) });
    if (ok) { const f = seg(u, 1.1, 1.6); dot([[530, 200], [640, 200]], f, GOOD, 8);
      card(740, 200, 150, 56, { rx: 10, text: k === 0 ? 'v' : '42', fs: 24, mono: true, fw: 800, stroke: GOOD, color: INK, s: pop(u, 1.6) });
      tx(480, 380, k === 0 ? '값이 있으면 상자만 벗겨 그대로 준다' : 'Ok 이면 42 — 보증이 맞았을 때의 모습', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) });
      return; }
    const f = seg(u, 1.1, 1.5); dot([[420, 260], [420, 340]], f, BAD, 8); boom(420, 350, pop(u, 1.5));
    const msg = k === 1 ? [['called `Option::unwrap()` on a', BAD], ['`None` value', BAD]] : [['called `Result::unwrap()` on an', BAD], ['`Err` value: "타임아웃"', BAD]];
    out(560, 250, 380, 'stderr · 실제 메시지', msg, typed(u, 1.7, 2.4, 2));
    tx(40, 400, k === 1 ? '비어 있으면 그 자리에서 panic — 숨은 폭탄' : '보증이 틀린 순간 되감기가 시작된다', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
  }

  // ---------- 3. expect ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) {
      rs(40, 50, 'let cfg = fs::read_to_string("app.toml").unwrap();', { fs: 16 });
      out(40, 100, 620, 'panic 로그', [["thread 'main' panicked at src/main.rs:4:…", INK], ['called `Result::unwrap()` on an `Err` value:', BAD], ['Os { code: 2, kind: NotFound, .. }', BAD]], typed(u, 0.3, 1.3, 3));
      const q = pop(u, 1.6); card(800, 150, 200, 110, { rx: 12, stroke: WARN, sw: 2.4, fill: WARNBG, s: q });
      tx(800, 140, '무엇을', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.7) }); tx(800, 168, '기대했었나?', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.7) });
      tx(40, 330, '파일이 없다는 건 알지만, 그 파일이 왜 꼭 있어야 했는지는 로그에 없다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(350, 370, '원인 추적이 길어지는 패닉', fade(u, 2.4), { 'font-size': 15 });
      return; }
    if (k === 1) { const sw = E(u, 0.4, 1.2);
      rs(40, 70, 'let cfg = fs::read_to_string("app.toml")', { fs: 16 });
      rs(80, 110, '.unwrap();', { fs: 16, op: 1 - sw });
      rs(80, 110, '.expect("설정은 시작 시 로드되어 항상 존재해야 한다");', { fs: 16, op: sw });
      // 꼬리표가 붙는다
      const tg = pop(u, 1.3);
      el('path', { d: 'M520,150 L520,190', stroke: ACC, 'stroke-width': 2.4, opacity: tg });
      card(520, 240, 460, 64, { rx: 10, text: '기대 문장이 panic 메시지에 실린다', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: tg });
      tx(480, 350, '동작은 unwrap 과 같다 — Err 면 여전히 panic', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      return; }
    // k2: 로그로 원인 특정
    out(40, 60, 880, 'panic 로그 · 실행 결과', [["thread 'main' panicked at src/main.rs:8:…", INFO], ['설정은 시작 시 로드되어 항상 존재해야 한다:', GOOD], ['Os { code: 2, kind: NotFound, .. }', BAD]], typed(u, 0.2, 1.0, 3), { col: INK, fs: 16, lh: 30 });
    [['어디서', '파일·줄', INFO, 1.2], ['무엇을 기대했나', 'expect 문장', GOOD, 1.6], ['왜 깨졌나', 'OS 에러 2 (파일 없음)', BAD, 2.0]].forEach(([a, b, col, at], i) => {
      const x = 170 + i * 310, s = pop(u, at); card(x, 300, 270, 74, { rx: 10, stroke: col, sw: 2.4, s });
      tx(x, 294, a, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, at) }); tx(x, 320, b, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, at) }); });
    tx(480, 395, '로그 세 줄로 원인과 위치를 바로 좁힌다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.4) });
  }

  // ---------- 4. 암묵 패닉 ----------
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) {
      rs(40, 46, k === 0 ? 'let v = vec![10, 20, 30];   v[5]' : 'match v.get(5) { Some(x) => …, None => … }', { fs: 16 });
      const x0 = 120, w = 90, y = 150;
      [10, 20, 30, null, null, null].forEach((v, i) => { const x = x0 + i * (w + 8);
        if (v != null) card(x + w / 2, y, w, 60, { rx: 6, text: String(v), fs: 20, mono: true, fw: 800, stroke: INK });
        else el('rect', { x, y: y - 30, width: w, height: 60, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
        mono(x + w / 2, y + 54, String(i), { 'font-size': 14, fill: v == null ? OFF : MUT, 'text-anchor': 'middle' }); });
      mono(x0, y - 44, 'len = 3', { 'font-size': 15, 'font-weight': 800, fill: INK });
      const bx = x0 + 3 * (w + 8) - 4; el('line', { x1: bx, y1: y - 50, x2: bx, y2: y + 40, stroke: k === 0 ? BAD : GOOD, 'stroke-width': 4, opacity: fade(u, 0.3) });
      const ix = x0 + 5 * (w + 8) + w / 2, a = E(u, 0.3, 1.0);
      el('path', { d: `M${ix},${y + 110} L${ix},${lerp(y + 110, y + 40, a)}`, stroke: k === 0 ? BAD : INFO, 'stroke-width': 3, 'marker-end': a > 0.98 ? (k === 0 ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
      mono(ix, y + 132, 'index 5', { 'font-size': 15, 'font-weight': 800, fill: k === 0 ? BAD : INFO, 'text-anchor': 'middle' });
      if (k === 0) { boom(bx, y, pop(u, 1.1));
        out(40, 300, 620, 'stderr · 실행 결과', [['index out of bounds: the len is 3 but the index is 5', BAD]], typed(u, 1.3, 2.0, 1));
        tx(700, 345, 'unwrap 없이도 터진다', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
        return; }
      parcel(480, 330, 150, 56, 'none', null, { s: pop(u, 1.1) }); grow(ix, y + 140, 560, 320, seg(u, 0.9, 1.2), INFO, { plain: true });
      mono(580, 336, '→ "범위 밖 — 패닉 없이 처리"', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      tx(40, 405, '같은 범위 밖 접근이 None 이라는 값이 되었다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.1) });
      return; }
    // u8 눈금: 0 ~ 255
    const x0 = 80, W = 700, X = (v) => x0 + (v / 255) * W, y = 120;
    el('rect', { x: x0, y: y - 10, width: W, height: 20, rx: 4, fill: SOFT, stroke: GRID });
    [0, 128, 255].forEach((v) => mono(X(v), y + 36, String(v), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }));
    mono(x0, y - 22, 'u8 이 담을 수 있는 수', { 'font-size': 14, fill: MUT });
    el('circle', { cx: X(250), cy: y, r: 8, fill: INK });
    mono(X(250) - 12, y - 22, 'a = 250', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
    if (k === 2) {
      const a = E(u, 0.3, 1.0), end = lerp(X(250), X(255) + 60, a);
      el('line', { x1: X(250), y1: y, x2: end, y2: y, stroke: BAD, 'stroke-width': 4 });
      if (a >= 1) { mono(X(255) + 66, y + 6, '260?', { 'font-size': 16, 'font-weight': 800, fill: BAD }); }
      [['debug 빌드', 'attempt to add with overflow (panic)', BAD, 1.1], ['release 빌드', '조용히 감겨서 4', WARN, 1.5], ['a 가 상수일 때', 'error: this arithmetic operation will overflow', INFO, 1.9]].forEach(([h, b, col, at], i) => {
        const yy = 220 + i * 62; card(150, yy, 170, 46, { rx: 8, text: h, fs: 15, stroke: col, color: col, s: pop(u, at) });
        mono(255, yy + 6, b, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, at + 0.1) }); });
      return; }
    // k3: 안전 연산
    const rows = [['a.checked_add(10)', 'None', 'none'], ['a.checked_add(5)', 'Some(255)', 'some'], ['a.saturating_add(10)', '255', 'v'], ['a.wrapping_add(10)', '4', 'v']];
    rows.forEach(([op, r, kind], i) => { const yy = 200 + i * 52, at = 0.2 + i * 0.4;
      rs(80, yy + 6, op, { fs: 16, op: fade(u, at) }); grow(320, yy, 420, yy, seg(u, at + 0.1, at + 0.4), MUT);
      if (kind === 'v') card(500, yy, 110, 40, { rx: 8, text: r, fs: 17, mono: true, fw: 800, stroke: INK, s: pop(u, at + 0.3) });
      else parcel(510, yy, 140, 40, kind, kind === 'some' ? '255' : null, { s: pop(u, at + 0.3), fs: 15 }); });
    tx(620, 206, '넘치면 None — 호출자가 판단', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
    tx(620, 362, '빌드 종류와 상관없이 같은 결과', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.2) });
  }

  // ---------- 5. 언제 패닉? ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) {
      rs(40, 50, 'pub fn divide(a: i32, b: i32) -> Result<i32, String>', { fs: 16 });
      [['divide(10, 0)', 'err', '"0 으로 나눌 수 없다"', 150], ['divide(10, 2)', 'ok', '5', 280]].forEach(([call, kind, v, y], i) => { const at = 0.3 + i * 0.6;
        rs(60, y + 6, call, { fs: 17, op: fade(u, at) }); grow(220, y, 330, y, seg(u, at + 0.1, at + 0.4), MUT);
        parcel(470, y, 240, 60, kind, v, { s: pop(u, at + 0.4), fs: 15 }); });
      card(790, 215, 230, 100, { rx: 12, stroke: INFO, sw: 2.2, fill: INFOBG, s: pop(u, 1.8) });
      tx(790, 205, '죽일지 말지는', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); tx(790, 232, '호출자가 정한다', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(40, 390, '라이브러리는 panic 대신 Result 로 돌려준다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) });
      return; }
    const cx = 220, w = 320, Y = [340, 270, 200];
    const names = [['thread · main', ''], ['catch_unwind', '경계'], ['risky_task', '']];
    tx(cx, 60, '호출 스택', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    el('line', { x1: cx - w / 2 - 10, y1: 366, x2: cx + w / 2 + 10, y2: 366, stroke: INK, 'stroke-width': 3 });
    if (k === 1 || k === 2) {
      const gone = k === 2 || u > 1.4;
      frame(cx, Y[0], w, names[0][0], '', 'ok'); frame(cx, Y[1], w, names[1][0], '경계', 'check');
      frame(cx, Y[2], w, names[2][0], gone ? 'drop' : 'panic!', gone ? 'gone' : 'panic', { op: gone ? 0.5 : 1 });
      el('rect', { x: cx - w / 2 - 14, y: Y[1] - 30, width: w + 28, height: 8, rx: 3, fill: WARN });   // 벽
      if (k === 1) { const d = seg(u, 0.4, 1.4); el('line', { x1: cx + w / 2 + 30, y1: 160, x2: cx + w / 2 + 30, y2: lerp(160, Y[1] - 34, d), stroke: BAD, 'stroke-width': 4, 'stroke-dasharray': '6 4' });
        tx(cx + w / 2 + 44, 190, '되감기', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
        tx(cx + w / 2 + 44, Y[1] - 22, '여기서 멈춘다', { 'font-size': 15.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) });
        parcel(720, 300, 200, 56, 'err', 'Any', { s: pop(u, 1.9), tag: 'Err' }); mono(620, 350, 'result = Err(…)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) });
        return; }
      out(450, 90, 480, 'stderr · 실행 결과', [["thread 'main' panicked at …", INK], ['작업 중 오류', BAD], ['작업 실패 — 스레드는 계속 산다', WARN], ['main 계속', GOOD]], typed(u, 0.3, 1.6, 4));
      check(470, 300, 12, pop(u, 1.8)); tx(495, 306, 'result.is_err() 확인 후 로그만 남기고 계속', { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
      tx(450, 390, '한 작업의 panic 이 프로세스 전체를 죽이지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) });
      return; }
    // k3: panic = "abort" — 되감기 없음
    const br = seg(u, 0.8, 1.3);
    [0, 1, 2].forEach((i) => frame(cx, Y[i] + br * 30 * (i + 1) * 0, w, names[i][0], i === 2 ? 'panic!' : '', i === 2 ? 'panic' : 'ok', { op: 1 - br * 0.6 }));
    el('rect', { x: cx - w / 2 - 14, y: Y[1] - 30, width: (w + 28) * (1 - br), height: 8, rx: 3, fill: WARN });
    if (br > 0) { el('rect', { x: cx - w / 2 - 20, y: 170, width: w + 40, height: 210, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: br }); mono(cx, 160, '프로세스 즉시 종료', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: br }); }
    mono(450, 70, '[profile.release]  panic = "abort"', { 'font-size': 17, 'font-weight': 800, fill: INK, opacity: fade(u, 0.2) });
    [['drop 실행', '안 함'], ['catch_unwind', '못 잡음'], ['"main 계속"', '안 찍힘']].forEach(([a, b], i) => { const yy = 140 + i * 44, at = 1.2 + i * 0.3;
      tx(460, yy, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, at) }); tx(640, yy, b, { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, at) }); });
    tx(460, 300, '이 예제 실행 파일 (-O)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) });
    R.hbar(560, 316, 260, 131, 131, { col: OFF, u: E(u, 2.0, 2.4), text: 'unwind 131 KiB', h: 18 });
    R.hbar(560, 346, 260, 120, 131, { col: ACC, u: E(u, 2.1, 2.5), text: 'abort 120 KiB', h: 18 });
  }

  const quiz = [
    { q: 'validate(-3) 안에서 panic!이 일어나면 스택의 지역 변수는 어떤 순서로 drop되는가?',
      o: ['main, run_app, validate 순서', 'validate, run_app, main 순서', 'drop되지 않고 바로 끝난다'], a: 1,
      why: '되감기는 가장 위 프레임부터 걷어 낸다. 실제로 실행하면 drop validate, drop run_app, drop main 순서로 찍힌다.' },
    { q: 'Option 값이 None일 때 .unwrap()이 하는 일은 무엇인가?',
      o: ['called `Option::unwrap()` on a `None` value로 panic한다', '기본값을 돌려준다', 'None을 그대로 돌려준다'], a: 0,
      why: 'unwrap은 match 한 번이다. Some이면 값을 꺼내고 None이면 panic!을 부른다. 값이 있다는 보증은 컴파일러가 아니라 쓰는 사람이 진다.' },
    { q: 'unwrap을 expect("설정은 시작 시 로드되어 항상 존재해야 한다")로 바꾸면 무엇이 달라지는가?',
      o: ['Err일 때 panic하지 않는다', '파일이 없으면 자동으로 만든다', 'panic은 그대로지만 메시지에 기대한 내용이 함께 찍힌다'], a: 2,
      why: '동작은 unwrap과 같다. 로그에 기대 문장과 Os { code: 2, kind: NotFound }가 함께 찍혀 원인을 바로 좁힐 수 있다.' },
    { q: '길이 3인 벡터 v에서 v[5] 대신 v.get(5)를 쓰면 어떻게 되는가?',
      o: ['컴파일 에러가 난다', 'None을 돌려줘 match로 처리할 수 있다', '마지막 원소 30을 돌려준다'], a: 1,
      why: 'v[5]는 index out of bounds: the len is 3 but the index is 5로 panic한다. get은 범위 밖을 None이라는 값으로 바꾼다.' },
    { q: 'Cargo.toml에서 panic = "abort"로 빌드하면 catch_unwind는 어떻게 되는가?',
      o: ['panic을 잡지 못하고 프로세스가 바로 끝난다', '평소처럼 panic을 Err로 바꿔 준다', 'panic이 경고로 바뀐다'], a: 0,
      why: 'abort는 되감기를 하지 않으므로 drop도 catch_unwind도 동작하지 않는다. 이 예제에서는 실행 파일이 131 KiB에서 120 KiB로 줄었다.' },
  ];

  const summary = [
    'panic!은 전제가 깨졌을 때의 비상 정지다. 위 프레임부터 drop하며 되감고 스레드를 끝낸다.',
    '호출자가 대응할 수 있는 실패는 panic 대신 Result로 돌려준다.',
    'unwrap은 None이나 Err에서 panic하는 match다. 꼭 써야 하면 expect로 기대한 내용을 남긴다.',
    '범위 밖 인덱스와 정수 오버플로도 panic한다. get과 checked_add는 같은 상황을 None으로 돌려준다.',
  ];
  const review = [
    { q: '사용자가 보낸 나이 문자열을 숫자로 바꾸는 라이브러리 함수를 만든다. 숫자가 아니면 어떻게 할까?',
      o: ['panic!으로 즉시 멈춘다', 'Err를 돌려줘 호출자가 고르게 한다', 'unwrap으로 바로 꺼낸다'], a: 1,
      why: '잘못된 입력은 호출자가 대응할 수 있는 실패다. 라이브러리가 panic하면 호출자는 선택권을 잃는다.' },
    { q: '테스트에서는 멀쩡하던 합계 코드가 운영 빌드에서 이상하게 작은 값을 냈다. 먼저 의심할 것은?',
      o: ['정수 오버플로가 release 빌드에서 조용히 감겼다', '스택 되감기가 꺼졌다', 'expect 메시지가 틀렸다'], a: 0,
      why: 'debug 빌드는 오버플로에서 panic하지만 release는 감겨서 250 + 10이 4가 된다. checked_add나 saturating_add로 의도를 드러낸다.' },
    { q: '작업 스레드 하나의 panic 때문에 서버 전체가 죽는다. panic = "abort" 설정도 켜져 있다. 알맞은 판단은?',
      o: ['catch_unwind만 추가하면 해결된다', 'abort를 켠 채로 expect 메시지만 고친다', 'abort에서는 catch_unwind가 못 잡으니 되감기를 켜고 경계에서 잡는다'], a: 2,
      why: 'abort는 되감기가 없어 catch_unwind가 동작하지 않는다. 경계에서 panic을 잡으려면 unwind 설정이 필요하다.' },
  ];

  R.page({ title: 'panic — 비상 정지와 되감기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
