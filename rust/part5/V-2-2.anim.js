/* V-2-2 cargo 워크스페이스 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 크레이트 상태·의존 화살표는 페이지 STEPS 의 crates / shared / links 를 읽는다.
 * 터미널 출력은 cargo 1.100 으로 같은 워크스페이스를 만들어 돌린 결과다 (nothing to print, cyclic package dependency …). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));

  // 크레이트 그래프 (api 위, core 가운데, shared 아래)
  const P = { api: [700, 80], core: [560, 205], shared: [810, 320] };
  const EDGE = { 'api>core': [[655, 106], [600, 179]], 'api>shared': [[735, 106], [800, 293]], 'core>shared': [[630, 220], [735, 306]], 'core>api': [[585, 179], [645, 106]] };
  function crate(name, kind, o) { o = o || {}; const [x, y] = P[name], col = o.col || (o.on ? ACC : INK);
    card(x, y, 150, 52, { rx: 10, stroke: col, sw: o.on ? 2.6 : 2, fill: o.fill, s: o.s ?? 1, op: o.op });
    if ((o.s ?? 1) < 0.9) return;
    mono(x - 60, y + 6, name, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: o.op ?? 1 });
    pill(x + 44, y, kind, kind === 'bin' ? WARN : INFO, 1, { fs: 13.5, mono: true, op: o.op }); }
  function graph(c, o) { o = o || {}; const b = c.beat, cr = b.crates || [];
    (b.links || []).forEach((l) => { const key = l.from + '>' + l.to, prevHas = c.prev && (c.prev.links || []).some((q) => q.from === l.from && q.to === l.to);
      const e = EDGE[key]; if (e) grow(e[0][0], e[0][1], e[1][0], e[1][1], prevHas ? 1 : E(c.u, 0.4, 1.2), ACC, { sw: 2.4 }); });
    cr.forEach((x, i) => { if (!P[x.name]) return; const on = o.on ? o.on(x) : x.status === 'active' || x.status === 'build';
      crate(x.name, x.kind, { on, s: o.pop ? pop(c.u, 0.2 + i * 0.3) : 1, col: o.col && o.col(x), op: o.op && o.op(x) }); }); }

  // ---------- 1. cargo 기본 ----------
  function tree(rows) { rows.forEach(([d, s, col, o], i) => { const y = 70 + i * 36;
    mono(560 + d * 24, y, s, { 'font-size': 15, 'font-weight': d ? 600 : 800, fill: col || INK, opacity: o ?? 1 }); }); }
  function s1(t, c) { const { k, u } = c;
    const CMD = ['$ cargo new my-app', '$ cargo build', '$ cargo run', ['Hello, world!', '#86efac'], '$ cargo test', '$ cargo add serde --features derive'];
    const upto = [1, 4, 6, 6][k], from = [0, 1, 4, 6][k];
    terminal(24, 24, 500, 230, CMD, from + clamp((u - 0.2) / 1.2, 0, 1) * (upto - from), { title: 'my-app' });
    const lockOn = k >= 1 ? (k === 1 ? fade(u, 1.0) : 1) : 0, tgt = k >= 1 ? (k === 1 ? fade(u, 1.4) : 1) : 0;
    tree([[0, 'my-app/', null, k === 0 ? fade(u, 0.6) : 1], [1, 'Cargo.toml', null, k === 0 ? fade(u, 0.9) : 1], [1, 'src/main.rs', null, k === 0 ? fade(u, 1.1) : 1],
      [1, 'Cargo.lock', ACC, lockOn], [1, 'target/debug/my-app', MUT, tgt]]);
    if (k === 0) { sub(700, 300, '패키지 하나 = Cargo.toml 하나', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { note(560, 290, '첫 빌드에 Cargo.lock 이 생긴다', fade(u, 1.8), { fill: ACC }); return; }
    const toml = ['[dependencies]', 'serde = { version = "1.0.229",', '          features = ["derive"] }'];
    if (k === 2) { snippet(24, 280, toml, { fs: 14, op: fade(u, 1.5) }); note(560, 300, 'cargo add 가 Cargo.toml 을 고친다', fade(u, 1.8)); return; }
    // k3: 선언 vs 스냅샷
    snippet(24, 280, toml, { fs: 14 }); tx(24, 272, 'Cargo.toml · 원하는 범위', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
    snippet(500, 280, ['name = "serde"', 'version = "1.0.229"', 'checksum = "4148590a…"'], { fs: 14, op: fade(u, 0.7) });
    tx(500, 272, 'Cargo.lock · 실제로 쓴 것', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) });
    grow(410, 330, 490, 330, E(u, 1.2, 1.6), ACC); }

  // ---------- 2. 워크스페이스 ----------
  function s2(t, c) { const { k, u } = c;
    snippet(24, 30, ['[workspace]', 'resolver = "2"', 'members = [', '  "crates/api",', '  "crates/core",', '  "crates/shared",', ']'], { fs: 14, op: k === 0 ? fade(u, 0.1) : 1 });
    if (k === 0) { mono(60, 270, '[package]', { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.8) });
      el('line', { x1: 56, y1: 265, x2: 56 + 92 * E(u, 1.2, 1.6), y2: 265, stroke: BAD, 'stroke-width': 3 });
      note(60, 310, '루트는 패키지가 아니라 멤버를 묶는 껍데기', fade(u, 1.7));
      card(700, 200, 260, 120, { rx: 14, stroke: GRID, dash: '7 6', fill: 'none', s: pop(u, 1.0) }); sub(700, 206, '멤버 등록 전', fade(u, 1.3), { 'font-size': 15 }); return; }
    graph(c, { pop: k === 1, on: (x) => k === 1 ? x.status === 'active' : true });
    if (k === 1) { note(330, 120, 'members 에 적은 경로 = 멤버', fade(u, 1.4)); return; }
    // k2: 공유 target · lock
    const sy = 395;
    [['target/', 470, INK], ['Cargo.lock', 700, ACC]].forEach(([n, x, col], i) => { card(x, sy, 170, 38, { rx: 8, text: n, fs: 15, mono: true, fw: 800, stroke: col, s: pop(u, 0.3 + i * 0.3) }); });
    ['api', 'core', 'shared'].forEach((n, i) => { const [x, y] = P[n]; el('line', { x1: x, y1: y + 26, x2: lerp(x, 470, E(u, 0.8 + i * 0.2, 1.4 + i * 0.2)), y2: lerp(y + 26, sy - 20, E(u, 0.8 + i * 0.2, 1.4 + i * 0.2)), stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); });
    note(40, 300, '멤버 셋이 target/ 하나와', fade(u, 1.8)); note(40, 328, 'Cargo.lock 하나를 같이 쓴다', fade(u, 1.9));
    sub(40, 360, 'crates/api/target 같은 폴더는 생기지 않는다', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 14 }); }

  // ---------- 3. workspace.dependencies ----------
  const MX = { api: 170, core: 480, shared: 790 };
  function member(name, lines, y, hot, o) { o = o || {}; const x = MX[name];
    card(x, y + 50, 280, 112, { rx: 10, stroke: hot ? ACC : GRID, sw: hot ? 2.4 : 1.6 });
    mono(x - 126, y + 20, `crates/${name}`, { 'font-size': 14.5, 'font-weight': 800 });
    lines.forEach(([s, col], i) => mono(x - 126, y + 52 + i * 26, s, { 'font-size': 14, fill: col || INK, 'font-weight': col ? 700 : 400 })); }
  function s3(t, c) { const { k, u } = c;
    card(480, 70, 560, 104, { rx: 12, stroke: ACC, sw: 2.4, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k > 0 || u > 0.6) { mono(220, 42, '[workspace.dependencies]', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      ['serde = { version = "1.0", features = ["derive"] }', 'tokio = { version = "1.40", features = ["full"] }', 'anyhow = "1.0"'].forEach((s, i) => mono(220, 68 + i * 22, s, { 'font-size': 13.5, opacity: k === 0 ? fade(u, 0.7 + i * 0.25) : 1 })); }
    const inh = (n) => (n === 'api' ? k >= 1 : k >= 3), y = 200;
    const own = ['serde = "…"', WARN], wsl = ['serde.workspace = true', ACC];
    member('api', [inh('api') ? wsl : own, inh('api') ? ['tokio.workspace = true', ACC] : ['tokio = "…"', WARN]].concat(k >= 2 ? [['core = { path = "../core" }', INFO]] : []), y, k === 1 || k === 2);
    member('core', [inh('core') ? wsl : own], y, k === 3);
    member('shared', [inh('shared') ? wsl : own], y, k === 3);
    if (k === 0) { sub(480, 380, '루트에 적기만 해서는 멤버가 바뀌지 않는다 · 멤버마다 버전이 따로 있다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 1) { grow(250, 192, 330, 125, E(u, 0.6, 1.2), ACC); note(40, 390, 'api 에서 버전 숫자가 사라졌다', fade(u, 1.4), { fill: ACC }); return; }
    if (k === 2) { grow(312, 302, 338, 262, E(u, 0.5, 1.1), INFO); note(40, 390, '같은 워크스페이스끼리는 path 로 바로 참조', fade(u, 1.3), { fill: INFO }); return; }
    grow(560, 192, 560, 125, E(u, 0.4, 0.9), ACC); grow(870, 192, 700, 125, E(u, 0.6, 1.1), ACC);
    terminal(40, 330, 520, 80, ['$ cargo tree -d', ['warning: nothing to print.', '#86efac']], clamp((u - 1.2) / 0.5, 0, 2), { title: '중복 버전 찾기' });
    note(590, 380, 'serde 한 벌 · 업그레이드는 루트 한 줄', fade(u, 2.0), { fill: GOOD }); }

  // ---------- 4. 크레이트 나누기 ----------
  function s4(t, c) { const { k, u } = c;
    const CODE = k <= 1 ? ['use core::run_pipeline;', 'use shared::AppConfig;', '', 'fn main() -> anyhow::Result<()> {', '    let config = AppConfig::from_env()?;', '    run_pipeline(config)?;', '    Ok(())', '}']
      : ['// crates/core/src/lib.rs', 'use shared::AppConfig;', '', 'pub fn run_pipeline(cfg: AppConfig)', '    -> anyhow::Result<()> {', '    // 순수 로직', '    Ok(())', '}'];
    snippet(24, 30, CODE, { fs: 13.5 });
    graph(c, {});
    if (k === 0) { note(40, 270 + 70, 'bin 은 얇게 · 가져다 쓰기만 한다', fade(u, 1.4)); return; }
    if (k === 1) { const [sx, sy] = P.shared, [ax, ay] = P.api, [cx, cy] = P.core;
      fly(sx - 40, sy - 60, ax + 40, ay + 40, seg(u, 0.3, 1.1), 'AppConfig', { mono: true, fill: INFO });
      fly(ax - 20, ay + 30, cx + 20, cy - 30, seg(u, 1.3, 2.1), 'config', { mono: true });
      note(40, 340, 'main 은 조립만 · 로직은 core 에', fade(u, 2.0)); return; }
    if (k === 2) { note(40, 340, '의존은 아래로만 흐른다', fade(u, 1.4), { fill: ACC }); sub(40, 370, 'shared 는 아무도 참조하지 않는 맨 아래 층', fade(u, 1.8), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    // k3: lib 만 따로 테스트 · 역방향은 금지
    terminal(40, 300, 380, 100, ['$ cargo test -p core', ['  bin 없이 lib 만 테스트', '#86efac']], clamp((u - 0.3) / 0.5, 0, 2), { title: 'test' });
    el('path', { d: 'M 880,300 C 930,200 900,100 778,80', fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 1.4) });
    cross(918, 190, 12, pop(u, 1.8)); sub(880, 400, 'shared → api 는 금지', fade(u, 2.0), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); }

  // ---------- 5. 빌드 프로파일 ----------
  function dial(cx, cy, v, col) { el('path', { d: `M ${cx - 90},${cy} A 90,90 0 0 1 ${cx + 90},${cy}`, fill: 'none', stroke: SOFT, 'stroke-width': 16 });
    const a = Math.PI * (1 - v / 3); el('path', { d: `M ${cx - 90},${cy} A 90,90 0 0 1 ${cx + 90 * Math.cos(a)},${cy - 90 * Math.sin(a)}`, fill: 'none', stroke: col, 'stroke-width': 16 });
    [0, 1, 2, 3].forEach((n) => { const b = Math.PI * (1 - n / 3); mono(cx + 116 * Math.cos(b), cy - 116 * Math.sin(b) + 5, String(n), { 'font-size': 15, 'text-anchor': 'middle', fill: MUT }); });
    mono(cx, cy - 10, `opt-level ${Math.round(v)}`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }
  function s5(t, c) { const { k, u } = c;
    const rel = k === 1 || k === 3, v = k === 1 ? tween(0, 3, u - 0.3, 1.2) : rel ? 3 : 0;
    dial(190, 170, v, rel ? ACC : INFO);
    mono(190, 214, rel ? '[profile.release]' : '[profile.dev]', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    ['api', 'core', 'shared'].forEach((n, i) => { const y = 70 + i * 80, on = k === 3 ? n === 'api' || u < 1.4 : true;
      card(560, y, 150, 50, { rx: 10, text: n, fs: 16, mono: true, fw: 800, stroke: k === 3 && n === 'api' && u > 1.4 ? ACC : INK, op: on ? 1 : 0.35 });
      grow(326, 172, 482, y, k === 0 ? E(u, 0.4 + i * 0.2, 1.0 + i * 0.2) : 1, rel ? ACC : INFO, { sw: 1.8 }); });
    tx(560, 30, '루트 프로파일이 모든 멤버에', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    if (k === 0) { sub(190, 260, '최적화 끔 · 빌드가 빠르다', fade(u, 1.5), { 'font-size': 14 }); return; }
    if (k === 1) { ['lto = true', 'codegen-units = 1'].forEach((s, i) => pill(800, 90 + i * 60, s, ACC, pop(u, 1.2 + i * 0.4), { mono: true }));
      note(720, 240, '빌드는 느려지고', fade(u, 1.9), { fill: WARN }); note(720, 268, '실행은 빨라진다', fade(u, 2.1), { fill: GOOD }); return; }
    const lines = k === 2 ? ['$ cargo build', ['Finished `dev` profile [unoptimized + debuginfo]', '#86efac']] : ['$ cargo build --release', ['Finished `release` profile [optimized]', '#86efac'], '$ cargo run -p api --release'];
    terminal(24, 300, 560, 110, lines, clamp((u - 0.2) / 0.5, 0, lines.length), { title: k === 2 ? '개발 중' : '배포 직전' });
    card(800, 260, 220, 46, { rx: 8, text: k === 2 ? 'target/debug' : 'target/release', fs: 16, mono: true, fw: 800, stroke: k === 2 ? INFO : ACC, s: pop(u, 1.2) });
    if (k === 3) sub(800, 310, '-p api 로 멤버 하나만 실행', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 6. 함정 · 마무리 ----------
  function s6(t, c) { const { k, u } = c;
    if (k <= 2) graph(c, { on: (x) => (k === 1 ? x.name === 'api' : true), op: (x) => (k === 1 && x.name !== 'api' ? 0.4 : 1) });
    if (k === 0) { terminal(24, 40, 440, 120, ['$ cargo build --workspace', '$ cargo test --workspace'], clamp(u / 0.8, 0, 2), { title: 'CI' });
      ['api', 'core', 'shared'].forEach((n, i) => { const [x, y] = P[n]; check(x + 92, y - 38, 9, pop(u, 1.2 + i * 0.3)); });
      note(40, 220, '멤버 셋을 한 번에', fade(u, 1.8)); return; }
    if (k === 1) { terminal(24, 40, 440, 150, ['$ cargo run -p api', '$ cargo tree -d', ['warning: nothing to print.', '#86efac']], clamp(u / 0.6, 0, 3), { title: 'terminal' });
      note(40, 240, '비어 있으면 같은 크레이트가 두 버전으로', fade(u, 2.0)); note(40, 266, '컴파일되는 일이 없다는 뜻', fade(u, 2.1)); return; }
    if (k === 2) { const e = EDGE['core>api'], g = E(u, 0.2, 0.8), fix = E(u, 1.8, 2.5);
      el('line', { x1: e[0][0], y1: e[0][1], x2: lerp(e[0][0], e[1][0], g), y2: lerp(e[0][1], e[1][1], g), stroke: BAD, 'stroke-width': 3, opacity: 1 - fix });
      terminal(24, 40, 440, 150, [['error: cyclic package dependency:', '#f87171'], ['  package `api v0.1.0`', '#f87171'], ['  depends on itself', '#f87171']], clamp((u - 0.6) / 0.4, 0, 3), { title: 'cargo build' });
      fly(P.core[0], P.core[1], P.shared[0], P.shared[1], seg(u, 1.8, 2.5), '공통부', { fill: GOOD });
      note(40, 240, '우회는 없다 · 공통부를 shared 로 옮긴다', fade(u, 1.7), { fill: BAD }); return; }
    [['함께 바뀌는 코드는 한 크레이트에', '과분할 금지'], ['공통 타입은 shared 로', '중복과 순환을 막는다'], ['버전은 workspace.dependencies 로 한 벌', '업그레이드는 루트 한 줄']].forEach(([a, b], i) => {
      const y = 80 + i * 100, s = pop(u, 0.2 + i * 0.4); card(480, y, 680, 76, { rx: 12, stroke: GOOD, sw: 2, s }); if (s < 0.9) return;
      check(180, y, 13, 1); tx(216, y - 4, a, { 'font-size': 17, 'font-weight': 800 }); tx(216, y + 22, b, { 'font-size': 14, fill: MUT }); });
    sub(480, 400, 'feature 는 멤버끼리 합쳐진다 · resolver 로 다룬다', fade(u, 1.8), { 'font-size': 14 }); }

  const quiz = [
    { q: 'cargo new my-app 후 처음 cargo build를 하면 새로 생기는 것은 무엇인가?',
      o: ['Cargo.toml과 src/main.rs', 'target/debug 산출물과 Cargo.lock', '[workspace] 표'], a: 1,
      why: 'cargo new가 Cargo.toml과 src/main.rs를 만들고, 첫 빌드가 target/debug와 버전을 고정한 Cargo.lock을 만든다.' },
    { q: '워크스페이스로 묶은 api·core·shared가 함께 쓰는 것은 무엇인가?',
      o: ['각 멤버의 src 폴더', '각 멤버의 [package] 이름', '루트의 target/ 하나와 Cargo.lock 하나'], a: 2,
      why: '멤버는 루트의 target/와 Cargo.lock을 나눠 쓴다. 그래서 공통 의존성은 한 번만 컴파일되고 버전도 한 벌로 잠긴다.' },
    { q: '루트에 [workspace.dependencies] serde를 적은 뒤 멤버에서 할 일은 무엇인가?',
      o: ['serde.workspace = true로 물려받는다', '아무것도 안 해도 자동으로 적용된다', '멤버마다 같은 버전 숫자를 다시 적는다'], a: 0,
      why: '루트에 적기만 해서는 바뀌지 않는다. 멤버가 workspace = true로 물려받아야 버전 숫자가 멤버에서 사라지고 한 벌이 된다.' },
    { q: 'api가 core와 shared를, core가 shared를 쓸 때 만들면 안 되는 의존은 무엇인가?',
      o: ['api → core', 'shared → api', 'core → shared'], a: 1,
      why: '의존은 api, core, shared 순으로 아래로만 흐른다. 맨 아래 shared가 위를 참조하면 순환이 생겨 빌드가 막힌다.' },
    { q: '[profile.release]를 crates/api/Cargo.toml에 적으면 어떻게 되는가?',
      o: ['api에만 그 설정이 적용된다', '모든 멤버에 적용된다', '무시되고 루트에 적으라는 경고가 뜬다'], a: 2,
      why: '프로파일은 워크스페이스 루트에서만 정한다. 실제로 돌려 보면 profiles for the non root package will be ignored 경고가 나온다.' },
    { q: 'core가 api를 path로 참조하게 바꾸면 cargo는 어떻게 하는가?',
      o: ['cyclic package dependency 에러로 빌드를 거부한다', '경고만 내고 빌드한다', '알아서 순서를 정해 빌드한다'], a: 0,
      why: 'api → core → api 고리가 생기면 cargo가 package `api` depends on itself라며 멈춘다. 공통부를 shared로 빼야 풀린다.' },
  ];

  const summary = [
    'Cargo.toml은 원하는 것을, Cargo.lock은 실제로 쓴 버전을 적는다.',
    '루트에 [workspace]와 members를 적으면 멤버들이 target/과 Cargo.lock을 같이 쓴다.',
    '버전은 [workspace.dependencies]에 한 번 적고 멤버는 workspace = true로 받는다.',
    '의존은 api, core, shared 방향으로만 흘린다. 거꾸로 참조하면 순환 에러로 빌드가 멈춘다.',
  ];
  const review = [
    { q: 'cargo tree -d 결과에 serde가 두 버전으로 나온다. 먼저 손볼 곳은?',
      o: ['멤버마다 적힌 serde 버전을 workspace = true로 바꾼다', '[profile.release]에 lto를 켠다', 'shared 크레이트를 지운다'], a: 0,
      why: '멤버가 각자 버전을 적으면 같은 크레이트가 두 번 컴파일될 수 있다. 루트의 [workspace.dependencies]로 모으면 한 벌이 된다.' },
    { q: 'core에 넣은 타입을 api도 쓰고, core도 api의 함수를 부르게 됐다. 빌드가 멈췄다. 어떻게 푸나?',
      o: ['api와 core를 서로 path로 참조한다', '둘이 함께 쓰는 부분을 shared로 옮겨 의존을 한 방향으로 만든다', 'resolver를 "3"으로 바꾼다'], a: 1,
      why: '서로 참조하면 cyclic package dependency다. 공통부를 맨 아래 shared로 빼면 api와 core가 모두 아래만 바라본다.' },
    { q: '배포 빌드가 너무 느려 개발 반복까지 늦어졌다. 루트 설정은 lto = true, codegen-units = 1이다. 알맞은 처방은?',
      o: ['멤버마다 [profile.dev]를 따로 적는다', 'Cargo.lock을 지우고 다시 빌드한다', '평소엔 cargo build(dev)로 돌리고 --release는 배포 직전에만 쓴다'], a: 2,
      why: 'lto와 codegen-units = 1은 release 프로파일 설정이라 빌드 시간을 늘린다. 개발 중에는 최적화를 끈 dev로 빠르게 반복한다.' },
  ];

  R.page({ title: '워크스페이스 구조', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
