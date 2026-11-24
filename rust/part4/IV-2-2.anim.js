/* IV-2-2 thiserror / anyhow — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 손으로 쓰는 impl 을 벽돌로 쌓아 세고, thiserror 는 벽돌이 derive 한 줄로 접히는 모습, anyhow 는 맥락 꼬리표가 쌓이는 모습으로 그린다.
 * 출력은 thiserror 2 · anyhow 1 · toml 0.8 (rustc 1.100) 로 실제 실행해 확인한 것이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const RK = /^(fn|let|mut|match|if|else|while|for|in|loop|return|impl|enum|struct|use|pub|Some|None|Ok|Err|Self|self|as|ref|dyn|type|trait|derive|error|from)$/;
  function rtok(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, RK.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = line.indexOf('"', i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  function rs(x, y, s, o) { o = o || {}; const fs = o.fs || 15, x0 = o.anchor === 'middle' ? x - tw(s, fs) / 2 : x;
    return R.spans(x0, y, rtok(s), { 'font-size': fs, opacity: o.op ?? 1, 'font-weight': o.fw || 600 }); }
  function out(x, y, w, head, lines, shown, o) { o = o || {}; const lh = o.lh || 23, h = 36 + lines.length * lh, col = o.col || BAD, op = o.op ?? 1; if (op <= 0.01) return;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    el('rect', { x, y, width: w, height: 26, rx: 8, fill: col, opacity: op }); el('rect', { x, y: y + 16, width: w, height: 10, fill: col, opacity: op });
    mono(x + 12, y + 18, head, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, opacity: op });
    lines.forEach(([s, c], i) => { if (i >= Math.ceil(shown)) return; const part = i === Math.ceil(shown) - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s;
      mono(x + 14, y + 48 + i * lh, part, { 'font-size': o.fs || 14, 'font-weight': 600, fill: c || INK, opacity: op }); });
    return { x, y, w, h }; }
  const typed = (u, a, b, n) => clamp((u - a) / (b - a)) * n;
  // 손으로 쓴 줄 벽돌: n 개를 (x, 아래 y) 에서 위로 쌓는다
  function bricks(x, yb, n, col, o) { o = o || {}; const w = o.w || 120, h = o.h || 14;
    for (let i = 0; i < Math.floor(n); i++) el('rect', { x, y: yb - (i + 1) * (h + 3), width: w, height: h, rx: 3, fill: col, opacity: o.op ?? 0.85 }); }
  // enum 판: 이름과 변주 목록
  function enumBox(x, y, w, name, vars, o) { o = o || {}; const h = 44 + vars.length * 34, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 2.2, opacity: op });
    rs(x + 16, y + 28, name, { fs: 16, op });
    vars.forEach((v, i) => rs(x + 34, y + 60 + i * 34, v, { fs: 15, op: op * (o.vop ? o.vop(i) : 1) }));
    return h; }
  // 맥락 꼬리표
  function tag(x, y, s, col, o) { o = o || {}; const w = tw(s, 15) + 30, sc = o.s ?? 1; if (sc <= 0.01) return w;
    const g = R.G(x, y, sc, o.op ?? 1);
    el('path', { d: `M0,-16 L${w - 12},-16 L${w},0 L${w - 12},16 L0,16 Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2 }, g);
    el('circle', { cx: w - 14, cy: 0, r: 3.5, fill: col }, g);
    tx(12, 5, s, { 'font-size': 15, 'font-weight': 700, fill: col }, g); return w; }

  // ---------- 1. 손 impl 이 곱셈으로 ----------
  const SLOTS = [['impl Display', 8], ['impl Error', 1], ['impl From<io::Error>', 3]];
  function slots(fill, o) { o = o || {};
    SLOTS.forEach(([n, lines], i) => { const x = 460 + i * 160, yb = 330, f = fill[i];
      el('rect', { x: x - 6, y: 170, width: 132, height: yb - 170 + 6, rx: 8, fill: 'none', stroke: f > 0 ? WARN : GRID, 'stroke-width': 2, 'stroke-dasharray': f > 0 ? null : '6 5' });
      mono(x + 60, 156, n.replace('impl ', ''), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: f > 0 ? WARN : MUT });
      if (f > 0) { bricks(x, yb, f * lines, WARN); mono(x + 60, yb + 30, `${Math.round(f * lines)}줄`, { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' }); }
      else mono(x + 60, 260, '없음', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) {
      enumBox(40, 110, 340, 'enum ConfigError {', ['Missing(String),', 'Invalid(String),'], { op: k === 0 ? fade(u, 0.1) : 1 });
      pill(150, 80, '#[derive(Debug)]', MUT, k === 0 ? pop(u, 0.5) : 1, { mono: true, fs: 14 });
      const fd = k === 0 ? 0 : k === 1 ? E(u, 0.3, 1.8) : 1, fe = k === 2 ? E(u, 0.3, 0.6) : 0;
      slots([fd, fe, 0]);
      if (k === 0) { tx(40, 300, 'Debug 만 자동이다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
        tx(40, 330, '사람이 읽을 메시지(Display)도, ? 전파(Error)도 없다', { 'font-size': 15, fill: WARN, opacity: fade(u, 1.6) }); return; }
      if (k === 1) { [['ConfigError::Missing(k) =>', '"설정 없음: {}"'], ['ConfigError::Invalid(k) =>', '"잘못된 값: {}"']].forEach(([a, b], i) => { const at = 1.0 + i * 0.5;
          mono(40, 290 + i * 46, a, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, at) }); mono(60, 312 + i * 46, b, { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, at) }); });
        tx(480, 400, '변주 하나 = match 팔 하나. 메시지 문구는 impl 속에 흩어진다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.2) }); return; }
      rs(40, 300, 'impl std::error::Error for ConfigError {}', { fs: 15, op: fade(u, 0.2) });
      tx(40, 340, '내용은 비었지만 이게 있어야 ? 로 전파된다', { 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      return; }
    // k3: 타입 수 × (2 + 원인 수)
    const cols = ['Display', 'Error', 'From io', 'From Parse'], rows = ['ConfigError', 'DbError', 'NetError'], x0 = 250, y0 = 110, cw = 120, ch = 54;
    cols.forEach((s, j) => mono(x0 + j * (cw + 8) + cw / 2, y0 - 14, s, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: j >= 2 ? BAD : WARN }));
    let n = 0; const fillN = Math.floor(E(u, 0.2, 2.0) * 12 + 0.001);
    rows.forEach((r, i) => { mono(x0 - 14, y0 + i * (ch + 8) + ch / 2 + 5, r, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      cols.forEach((_, j) => { const on = n < fillN; n++;
        el('rect', { x: x0 + j * (cw + 8), y: y0 + i * (ch + 8), width: cw, height: ch, rx: 6, fill: on ? (j >= 2 ? BADBG : WARNBG) : PANEL, stroke: on ? (j >= 2 ? BAD : WARN) : GRID, 'stroke-width': 2 });
        if (on) mono(x0 + j * (cw + 8) + cw / 2, y0 + i * (ch + 8) + ch / 2 + 5, 'impl', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: j >= 2 ? BAD : WARN }); }); });
    mono(x0 + 2 * (cw + 8) - 4, 330, `${Math.min(12, fillN)}개`, { 'font-size': 26, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
    mono(480, 380, '3 타입 × (Display·Error 2 + 원인 에러 2) = 12', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
    sub(480, 408, '타입 하나에 원인 둘만 감싸도 4개 · 예시 구성', fade(u, 2.3), { 'font-size': 14 });
  }

  // ---------- 2. thiserror derive ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const f = E(u, 0.4, 1.6);
      // 왼쪽: 손 impl 벽돌이 한 줄로 접힌다
      bricks(80, 330, 9 * (1 - f) + (f >= 1 ? 0 : 0), WARN, { op: 1 - f * 0.8 });
      if (f < 1) mono(140, 352, `${Math.round(9 * (1 - f) + 1)}줄`, { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      rs(300, 120, 'use thiserror::Error;', { fs: 17, op: fade(u, 0.2) });
      const d = pop(u, 1.4); card(480, 200, 340, 56, { rx: 10, stroke: GOOD, sw: 2.6, fill: GOODBG, s: d });
      rs(480, 206, '#[derive(Debug, Error)]', { anchor: 'middle', fs: 18, op: fade(u, 1.5) });
      rs(330, 280, 'enum ConfigError { Missing(String), Invalid(String) }', { fs: 15, op: fade(u, 1.7) });
      tx(480, 370, 'impl Display · impl Error 를 더 쓸 필요가 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) });
      return; }
    const vars = [['#[error("설정 없음: {0}")]', 'Missing(String),'], ['#[error("잘못된 값: {0}")]', 'Invalid(String),']];
    const box = (op) => { el('rect', { x: 40, y: 70, width: 420, height: 230, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 2.2, opacity: op });
      rs(56, 98, '#[derive(Debug, Error)]', { fs: 15, op }); rs(56, 124, 'enum ConfigError {', { fs: 15, op }); };
    if (k === 1) { box(1);
      vars.forEach(([a, b], i) => { const y = 160 + i * 66, at = 0.3 + i * 0.6;
        el('rect', { x: 70, y: y - 18, width: tw(a, 15) + 12, height: 26, rx: 5, fill: ACCBG, opacity: fade(u, at) });
        rs(76, y, a, { fs: 15, op: fade(u, at) }); rs(76, y + 28, b, { fs: 15 }); });
      // {0} → 튜플 필드 0번
      const z = fade(u, 1.6);
      tx(500, 160, '{0} = 첫 번째 튜플 필드', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: z });
      tx(500, 196, '메시지가 변주 바로 위에 모인다', { 'font-size': 15.5, fill: INK, opacity: fade(u, 2.0) });
      tx(500, 228, '변주를 늘려도 그 위에 한 줄만 쓴다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) });
      return; }
    if (k === 2) { box(0.55); vars.forEach(([a, b], i) => { rs(76, 160 + i * 66, a, { fs: 15, op: 0.55 }); rs(76, 188 + i * 66, b, { fs: 15, op: 0.55 }); });
      const g = E(u, 0.3, 1.0); grow(470, 185, lerp(470, 530, g), 185, g, ACC);
      mono(560, 76, '컴파일 때 매크로가 만든 코드', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      const gen = ['impl Display for ConfigError {', '  … Missing(a) => "설정 없음: {a}"', '  … Invalid(a) => "잘못된 값: {a}"', '}', 'impl Error for ConfigError {}'];
      const n = typed(u, 0.6, 1.8, 5);
      el('rect', { x: 540, y: 90, width: 400, height: 190, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, 0.5) });
      gen.forEach((s, i) => { if (i < Math.ceil(n)) mono(556, 122 + i * 32, s, { 'font-size': 14, 'font-weight': 600, fill: INK, opacity: clamp(n - i) }); });
      tx(480, 350, '손 impl 이 소스에서 한 줄도 남지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) });
      return; }
    // k3: 실제 출력
    rs(40, 60, 'Err(ConfigError::Missing("DATABASE_URL".into()))', { fs: 16 });
    const f = E(u, 0.5, 1.5);
    mono(80, 160, '"설정 없음: {0}"', { 'font-size': 20, 'font-weight': 800, fill: ACC });
    pill(lerp(480, 285, f), lerp(60, 152, f), '"DATABASE_URL"', INFO, 1, { mono: true, fs: 14, op: 1 - fade(u, 1.5, 0.3) });
    const o = fade(u, 1.6);
    out(80, 210, 560, 'println!("{}", e) · 실행 결과', [['설정 없음: DATABASE_URL', INK]], o >= 1 ? 1 : o, { col: GOOD, fs: 17 });
    mono(80, 340, '{:?} 로 찍으면  Missing("DATABASE_URL")', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) });
    tx(80, 390, '메시지 · 타입 · 사용처가 한 화면에 모인다', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.4) });
  }

  // ---------- 3. #[from] ----------
  function plug(x, y, name, col, on, s) { // 원인 에러 알약 → #[from] 플러그 → 변주
    card(x, y, 170, 42, { rx: 21, text: name, fs: 14.5, mono: true, stroke: col, color: col, s });
    if (on > 0) { grow(x + 88, y, x + 88 + 110 * on, y, on, col); if (on >= 1) mono(x + 140, y - 10, '#[from]', { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); } }
  function appBox(o) { o = o || {};
    el('rect', { x: 400, y: 80, width: 520, height: 230, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2.2 });
    rs(416, 108, 'enum AppError {', { fs: 16 });
    [['Io(#[from] std::io::Error)', '"파일 읽기 실패"', INFO], ['Parse(#[from] ParseIntError)', '"숫자 파싱 실패"', WARN], ['Missing(String)', '"설정 없음: {0}"', MUT]].forEach(([v, m, col], i) => {
      const y = 150 + i * 56, op = i === 2 ? (o.missing ?? 1) : 1; if (op <= 0.01) return;
      el('rect', { x: 412, y: y - 22, width: 496, height: 44, rx: 8, fill: PANEL, stroke: o.hi === i ? col : GRID, 'stroke-width': o.hi === i ? 2.6 : 1.5, opacity: op });
      rs(426, y + 5, v, { fs: 15, op }); mono(896, y + 5, m, { 'font-size': 14, fill: ACC, 'text-anchor': 'end', opacity: op }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { appBox({ missing: k === 1 ? pop(u, 0.3) : 0, hi: k === 1 ? 2 : null });
      plug(110, 150, 'io::Error', INFO, k === 0 ? E(u, 0.5, 1.2) : 1, k === 0 ? pop(u, 0.2) : 1);
      plug(110, 206, 'ParseIntError', WARN, k === 0 ? E(u, 1.0, 1.7) : 1, k === 0 ? pop(u, 0.6) : 1);
      if (k === 0) { tx(40, 380, '원인 에러를 필드로 품는다 — 나중에 source() 로 꺼낼 수 있다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
      tx(110, 270, '원인 없음', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); grow(170, 262, 396, 262, seg(u, 0.8, 1.2), MUT, { dash: '5 5' });
      tx(40, 380, '우리가 직접 만드는 에러 — #[from] 없이 값만 담는다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      return; }
    if (k === 2) {
      el('rect', { x: 40, y: 70, width: 380, height: 150, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: 0.6 });
      tx(56, 96, 'Step 1 에서 손으로 쓰던 것', { 'font-size': 14.5, 'font-weight': 700, fill: BAD });
      mono(56, 130, 'impl From<io::Error> for AppError', { 'font-size': 14.5, fill: INK, opacity: 0.8 }); mono(56, 166, 'impl From<ParseIntError> for AppError', { 'font-size': 14.5, fill: INK, opacity: 0.8 });
      const x1 = E(u, 0.3, 0.9); el('line', { x1: 50, y1: 125, x2: lerp(50, 400, x1), y2: 125, stroke: BAD, 'stroke-width': 3 }); el('line', { x1: 50, y1: 161, x2: lerp(50, 400, E(u, 0.6, 1.2)), y2: 161, stroke: BAD, 'stroke-width': 3 });
      el('rect', { x: 500, y: 70, width: 420, height: 150, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, 1.2) });
      tx(516, 96, '#[from] 이 만들어 준 것', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      mono(516, 130, 'impl From<io::Error> for AppError', { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.5) }); mono(516, 166, 'impl From<ParseIntError> for AppError', { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.8) });
      tx(480, 300, '? 가 에러를 바꿀 근거가 생겼다 — 변환 코드는 0줄', { 'text-anchor': 'middle', 'font-size': 16.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) });
      return; }
    // k3: read_port 실행 결과
    rs(40, 52, 'fn read_port(path: &str) -> Result<u16, AppError>', { fs: 16 });
    const rows = [['ok.conf', '"8080"', 'Ok(8080)', null, GOOD], ['bad.conf', '"eighty"', '숫자 파싱 실패', 'source: invalid digit found in string', WARN], ['none.conf', '(없음)', '파일 읽기 실패', 'source: … (os error 2)', INFO]];
    rows.forEach(([f, body, r, src, col], i) => { const y = 120 + i * 96, at = 0.3 + i * 0.6;
      mono(40, y + 5, f, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, at) }); mono(150, y + 5, body, { 'font-size': 14.5, fill: MUT, opacity: fade(u, at) });
      grow(270, y, 360, y, seg(u, at + 0.1, at + 0.4), col);
      card(510, y, 280, 44, { rx: 8, text: r, fs: 16, mono: true, fw: 800, stroke: col, color: col, fill: PANEL, s: pop(u, at + 0.3) });
      if (src) { el('line', { x1: 520, y1: y + 22, x2: 520, y2: y + 40, stroke: col, 'stroke-width': 2, opacity: fade(u, at + 0.5) });
        mono(536, y + 42, src, { 'font-size': 14, fill: MUT, opacity: fade(u, at + 0.5) }); } });
    tx(40, 410, '서로 다른 원인이 AppError 하나로 모이고, 원인은 source() 에 남는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) });
  }

  // ---------- 4. anyhow 와 context ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) {
      rs(40, 52, 'fn load_config(path: &str) -> anyhow::Result<Config>', { fs: 16 });
      const bx = 620, by = 230; el('rect', { x: bx - 150, y: by - 70, width: 300, height: 140, rx: 14, fill: ACCBG, stroke: ACC, 'stroke-width': 2.6, opacity: fade(u, 0.2) });
      mono(bx, by + 6, 'anyhow::Error', { 'font-size': 19, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      [['io::Error', INFO, 120], ['toml::de::Error', WARN, 230], ['ConfigError', BAD, 340]].forEach(([n, col, y], i) => { const a = 0.5 + i * 0.5, f = seg(u, a, a + 0.6);
        if (f < 1) card(lerp(140, bx - 240, E(f, 0, 1)), lerp(y, by, E(f, 0, 1)), 170, 40, { rx: 20, text: n, fs: 14.5, mono: true, stroke: col, color: col, fill: PANEL, s: f > 0 ? 1 : pop(u, 0.2 + i * 0.2) });
        else el('circle', { cx: bx - 90 + i * 90, cy: by + 40, r: 7, fill: col }); });
      tx(480, 400, '에러 종류를 적지 않는다 — 무엇이든 ? 하나로 담긴다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) });
      return; }
    const L1 = 'std::fs::read_to_string(path).context("설정 파일을 열 수 없음")?', L2 = 'toml::from_str(&text).context("설정 파일 형식이 잘못됨")?';
    if (k === 1 || k === 2) {
      rs(40, 70, L1, { fs: 15, op: k === 1 ? 1 : 0.5 }); rs(40, 190, L2, { fs: 15, op: k === 2 ? 1 : 0.35 });
      const y = k === 1 ? 120 : 240, col = k === 1 ? INFO : WARN, nm = k === 1 ? 'io::Error' : 'toml::de::Error', msg = k === 1 ? '설정 파일을 열 수 없음' : '설정 파일 형식이 잘못됨';
      card(140, y, 200, 44, { rx: 22, text: nm, fs: 15, mono: true, stroke: col, color: col, s: pop(u, 0.3) });
      const w = tag(248, y, msg, ACC, { s: pop(u, 0.9) });
      tx(260 + w, y + 6, '실패했을 때만 붙는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) });
      if (k === 2) { tx(40, 320, '파일은 열렸고 toml 에서 실패했다면 남는 맥락은 이 줄의 것 하나뿐이다', { 'font-size': 15.5, 'font-weight': 700, fill: INK, opacity: fade(u, 1.8) });
        tx(40, 352, '같은 함수 안의 두 context 가 함께 쌓이지는 않는다', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      else tx(40, 320, '성공 경로에는 비용이 없다 — 실패할 때만 문구가 얹힌다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      return; }
    if (k === 3) {
      out(40, 50, 260, 'bad.toml · 실행 예', [['# app', MUT], ['name = "svc"', INK], ['port 8080', BAD]], typed(u, 0.1, 0.6, 3), { col: MUT });
      out(330, 50, 600, 'stderr · {:?} 출력', [['Error: 설정 파일 형식이 잘못됨', ACC], ['', INK], ['Caused by:', INK], ['    TOML parse error at line 3, column 6', BAD], ['    3 | port 8080', MUT], ['    expected `.`, `=`', BAD]], typed(u, 0.8, 2.0, 6), { col: INK, lh: 26 });
      tx(40, 300, '맨 윗줄 = 무엇을 하다가', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      tx(40, 336, 'Caused by = 무엇 때문에', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      tx(330, 400, '파일이 아예 없으면 첫 줄은 "설정 파일을 열 수 없음", 원인은 os error 2 가 된다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) });
      return; }
    // k4: 호출 단계마다 쌓인다
    const lv = [['TOML parse error at line 3, column 6', BAD, 'toml'], ['설정 파일 형식이 잘못됨', ACC, 'load_config'], ['서버 시작 실패', ACC, '호출한 main']];
    lv.forEach(([s, col, who], i) => { const y = 330 - i * 80, s2 = pop(u, 0.3 + i * 0.6);
      card(330, y, 460, 52, { rx: 10, text: s, fs: 15.5, stroke: col, color: col, fill: i ? ACCBG : BADBG, s: s2 });
      tx(620, y + 6, who, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.6) });
      if (i) grow(330, y + 52, 330, y + 30, seg(u, 0.2 + i * 0.6, 0.5 + i * 0.6), MUT, { plain: true }); });
    out(700, 60, 240, '{:?} 출력', [['서버 시작 실패', ACC], ['Caused by:', INK], [' 0: 설정 파일 …', ACC], [' 1: TOML parse …', BAD]], typed(u, 1.8, 2.6, 4), { col: INK, fs: 13.5 });
    tx(40, 60, '위로 올라갈 때마다 한 겹씩', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
  }

  // ---------- 5. 라이브러리=thiserror · 앱=anyhow ----------
  function s5(t, c) { const { k, u } = c;
    // 왼쪽 lib, 오른쪽 bin, 가운데 경계
    const libOp = k === 1 ? 0.45 : k === 3 ? 0 : 1, binOp = k === 0 ? 0.25 : k === 3 ? 0 : 1;
    el('rect', { x: 30, y: 70, width: 400, height: 290, rx: 12, fill: SOFT, stroke: INFO, 'stroke-width': 2.2, opacity: libOp });
    tx(46, 96, '라이브러리 크레이트', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: libOp });
    el('rect', { x: 530, y: 70, width: 400, height: 290, rx: 12, fill: SOFT, stroke: ACC, 'stroke-width': 2.2, opacity: binOp });
    tx(546, 96, '애플리케이션 (bin)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: binOp });
    if (k < 3) el('line', { x1: 480, y1: 60, x2: 480, y2: 370, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); if (k < 3) tx(480, 392, '경계', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    if (k === 0 || k >= 2) { rs(46, 130, '-> Result<Ast, ParseError>', { fs: 15, op: libOp }); mono(46, 156, 'thiserror · 구체 타입', { 'font-size': 14, fill: MUT, opacity: libOp }); }
    if (k === 0) { [['UnexpectedToken', '다시 입력받기'], ['UnexpectedEof', '줄을 더 읽기'], ['TooDeep', '거절']].forEach(([v, act], i) => { const y = 200 + i * 50, at = 0.4 + i * 0.4;
        card(140, y, 200, 38, { rx: 8, text: v, fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, at) }); grow(242, y, 290, y, seg(u, at + 0.2, at + 0.4), INFO); tx(298, y + 5, act, { 'font-size': 14.5, opacity: fade(u, at + 0.3) }); });
      sub(230, 386, '변주 이름은 예시', fade(u, 1.8), { 'font-size': 13.5 });
      tx(560, 220, '호출자가 match 로', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); tx(560, 248, '변주마다 다르게 대응한다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
      return; }
    if (k === 1) { rs(546, 130, 'fn main() -> anyhow::Result<()>', { fs: 15 });
      [['io::Error', INFO], ['ParseError', WARN], ['toml::de::Error', BAD]].forEach(([n, col], i) => { const f = seg(u, 0.4 + i * 0.4, 1.0 + i * 0.4);
        if (f < 1) card(lerp(640, 720, f), lerp(170 + i * 40, 244, f), 160, 34, { rx: 17, text: n, fs: 14, mono: true, stroke: col, color: col, op: 1 - f }); else el('circle', { cx: 700 + i * 20, cy: 244, r: 6, fill: col }); });
      card(730, 300, 260, 48, { rx: 10, text: '로그로 잘 찍히면 된다', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.8) });
      tx(560, 400, '분기할 일이 없다 — 빠른 전파와 좋은 로그', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { rs(546, 130, 'parse(&input)', { fs: 15 }); rs(560, 156, '.context("입력 파싱 단계")?', { fs: 15 });
      const f = E(u, 0.3, 1.3);
      card(lerp(230, 700, f), lerp(250, 230, f), 170, 40, { rx: 20, text: 'ParseError', fs: 15, mono: true, stroke: INFO, color: INFO, fill: PANEL });
      if (f >= 1) tag(560, 268, '입력 파싱 단계', ACC, { s: pop(u, 1.4) });
      out(546, 300, 370, '{:?} 출력 · 예시', [['Error: 입력 파싱 단계', ACC], ['Caused by: unexpected token', INFO]], typed(u, 1.9, 2.5, 2), { col: INK, fs: 13.5 });
      tx(46, 330, '타입으로 받고, 맥락을 얹어 던진다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) });
      return; }
    // k3: 함정 셋
    [['lib 가 anyhow 를 노출', '호출자가 match 로 못 나눈다'], ['context 없이 ? 만', '무엇을 하다 실패했는지 사라진다'], ['에러 enum 을 무한정 늘림', '경계 단위로 묶는다']].forEach(([a, b], i) => {
      const y = 140 + i * 78, s = pop(u, 0.3 + i * 0.5);
      card(480, y, 640, 62, { rx: 10, stroke: BAD, sw: 2.2, fill: PANEL, s });
      cross(190, y, 11, s); tx(220, y - 4, a, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4 + i * 0.5) }); tx(220, y + 20, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) }); });
  }

  const quiz = [
    { q: '에러 타입 3개가 각각 원인 에러 2개를 감쌀 때, 표준 라이브러리만으로 손으로 써야 하는 impl은 몇 개인가?',
      o: ['6개', '12개', '5개'], a: 1,
      why: '타입마다 Display와 Error가 2개, 원인마다 From이 1개라 3 × (2 + 2) = 12개다. thiserror는 이것을 derive와 어트리뷰트로 대신한다.' },
    { q: '#[error("설정 없음: {0}")]가 붙은 Missing("DATABASE_URL")을 {}로 출력하면 무엇이 찍히는가?',
      o: ['Missing("DATABASE_URL")', '설정 없음: {0}', '설정 없음: DATABASE_URL'], a: 2,
      why: '{0}은 첫 번째 튜플 필드로 바뀐다. 매크로가 이 문자열로 Display를 만들어 준다. Missing("DATABASE_URL")은 {:?}로 찍었을 때다.' },
    { q: 'AppError의 Io 변주 필드에 #[from]을 붙이면 무엇이 생기는가?',
      o: ['impl From<io::Error> for AppError가 생겨 ?가 io 에러를 AppError로 바꾼다', 'io::Error가 panic으로 바뀐다', 'Missing 변주에도 From이 생긴다'], a: 0,
      why: '#[from]은 그 필드 타입에서 AppError로 가는 From을 만들고 원인을 source()에 남긴다. 실행하면 숫자 파싱 실패의 source는 invalid digit found in string이다.' },
    { q: 'load_config 안의 두 줄에 각각 context를 붙였고 toml 파싱에서 실패했다. Error: 줄에 찍히는 것은?',
      o: ['두 문구가 모두 쌓여 찍힌다', '설정 파일 형식이 잘못됨 하나만 찍힌다', '아무 문구도 없이 TOML 에러만 찍힌다'], a: 1,
      why: '실패한 줄의 context 하나만 남고 원래 에러는 Caused by에 찍힌다. 맥락은 호출자가 다시 context를 붙일 때 위로 쌓인다.' },
    { q: '다른 팀이 쓸 파서 라이브러리의 공개 함수 에러 타입으로 알맞은 것은?',
      o: ['anyhow::Error', 'String', 'thiserror로 만든 구체 에러 enum'], a: 2,
      why: '호출자가 변주마다 match로 대응하려면 구체 타입이 보여야 한다. anyhow는 타입을 지우므로 애플리케이션 쪽에 맞다.' },
  ];

  const summary = [
    '표준 라이브러리만으로 에러 타입을 만들면 Display, Error, From impl을 모두 손으로 쓴다.',
    'thiserror는 #[derive(Error)]와 #[error] 한 줄로 Display와 Error를, #[from]으로 From을 만든다.',
    'anyhow는 에러 종류를 지우고 context로 무엇을 하다 실패했는지를 덧붙인다.',
    '라이브러리는 thiserror로 구체 타입을 보여 주고, 앱은 anyhow로 빠르게 전파한다.',
  ];
  const review = [
    { q: '앱 로그에 Error: 설정 파일 형식이 잘못됨만 있고 어느 기능에서 불렀는지 모르겠다. 먼저 할 일은?',
      o: ['호출하는 쪽에서도 .context("서버 시작 실패")처럼 맥락을 붙인다', '에러를 unwrap으로 바꿔 panic 위치를 본다', 'thiserror enum을 새로 만들어 모든 에러를 담는다'], a: 0,
      why: '맥락은 호출 단계를 올라가며 쌓인다. 바깥에서 context를 붙이면 Caused by 아래에 0, 1 번호로 원인 체인이 찍힌다.' },
    { q: '라이브러리가 anyhow::Result를 공개 API로 돌려준다. 호출하는 쪽이 겪을 문제는?',
      o: ['컴파일이 느려진다', '에러 종류별로 match해 다르게 대응하기 어렵다', '에러 메시지가 출력되지 않는다'], a: 1,
      why: 'anyhow는 타입을 지우므로 호출자는 downcast 없이는 변주를 나눌 수 없다. 남이 쓰는 코드는 thiserror로 구체 타입을 보여 준다.' },
    { q: 'thiserror로 만든 AppError에 #[from] std::io::Error를 달지 않고 read_to_string(path)?를 썼다. 무슨 일이 생기나?',
      o: ['io 에러가 자동으로 Missing 변주가 된다', '실행 중에 panic한다', 'From 구현이 없어 ?가 io 에러를 바꾸지 못하고 컴파일되지 않는다'], a: 2,
      why: '?는 From으로 에러를 바꾼다. #[from]이나 손으로 쓴 From이 없으면 컴파일 단계에서 막힌다.' },
  ];

  R.page({ title: 'thiserror / anyhow — 에러를 설계한다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
