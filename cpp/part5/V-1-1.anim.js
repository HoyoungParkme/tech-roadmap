/* V-1-1 빌드(CMake) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 생성기·명령·파이프라인·의존 그래프·빌드 타입은 STEPS 의 generators · commands · pipeline · graph · buildTypes 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const plain = (s) => String(s).replace(/^[^A-Za-z0-9가-힣(]+/u, '').trim();   // 데이터 앞의 그림 글자를 뗀다
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 작은 그림: 파일 · 폴더 ----------
  function doc(x, y, name, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1), c = o.col || INK;
    el('path', { d: 'M-9,-12 H4 L10,-6 V12 H-9 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M4,-12 V-6 H10', fill: 'none', stroke: c, 'stroke-width': 1.5 }, g);
    if (name) tx(18, 5, name, { 'font-size': o.fs || 14.5, class: 'mono', fill: o.tcol || c, 'font-weight': o.fw || 600, 'text-decoration': o.strike ? 'line-through' : null }, g);
    return g; }
  function folder(x, y, name, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1), c = o.col || INK;
    el('path', { d: 'M-11,-9 H-3 L0,-6 H11 V10 H-11 Z', fill: o.fill || SOFT, stroke: c, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    if (name) tx(19, 5, name, { 'font-size': o.fs || 14.5, class: 'mono', fill: o.tcol || c, 'font-weight': o.fw || 700 }, g);
    return g; }
  // 코드 문서: groups[i] 가 i ≤ k 일 때 보이고, 지금 beat 의 줄은 타이핑된다
  function codeDoc(x, y, w, h, title, groups, k, u, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    doc(x + 22, y + 22, title, { fs: 14, col: MUT, fw: 700 });
    let yy = y + 58;
    groups.forEach((rows, i) => { if (i > k) return; const cur = i === k, f = cur ? E(u, 0.15, 1.1) : 1;
      if (cur) el('rect', { x: x + 8, y: yy - 17, width: w - 16, height: rows.length * 24 + 4, rx: 5, fill: ACCBG });
      rows.forEach((s) => { mono(x + 16, yy, s.slice(0, Math.round(s.length * f)), { 'font-size': o.fs || 14, fill: cur ? INK : MUT, 'font-weight': cur ? 700 : 500 }); yy += 24; });
      yy += 10; }); }

  // ---------- 1. 선언 하나 → 생성기 여럿 ----------
  const GEN_FILE = { 'Unix Makefiles': 'Makefile', 'Ninja': 'build.ninja', 'Visual Studio': 'hello.sln', 'Xcode': 'hello.xcodeproj' };
  const S1_CODE = [['cmake_minimum_required(VERSION 3.16)'], ['project(hello LANGUAGES CXX)'],
    ['set(CMAKE_CXX_STANDARD 17)', 'set(CMAKE_CXX_STANDARD_REQUIRED ON)'], ['add_executable(hello main.cpp)']];
  function s1(t, c) { const { k, u } = c, gens = c.beat.generators || [], before = (c.prev && c.prev.generators || []).length;
    codeDoc(30, 40, 370, 300, 'CMakeLists.txt', S1_CODE, k, u);
    const NX = 500, NY = 190;
    grow(402, NY, 444, NY, k === 0 ? E(u, 0.6, 1.0) : 1, MUT);
    card(NX, NY, 110, 52, { rx: 10, text: 'cmake', fs: 17, fw: 800, mono: true, stroke: ACC, color: ACC, fill: ACCBG, sw: 2.5, s: k === 0 ? pop(u, 0.9) : 1 });
    sub(NX, NY + 46, '생성(generate)', k === 0 ? fade(u, 1.2) : 1);
    if (k >= 1) { const s = k === 1 ? pop(u, 1.2) : 1; pill(NX, NY + 92, 'CXX 컴파일러 탐지', INFO, s, { fs: 13.5 }); }
    if (k >= 2) pill(NX, NY - 70, 'C++17 · REQUIRED', ACC, k === 2 ? pop(u, 1.1) : 1, { fs: 13.5, mono: true });
    gens.forEach((g, i) => { const y = 70 + i * 82, isNew = i >= before, gu = isNew ? E(u, 0.4, 1.1) : 1, s = isNew ? pop(u, 1.0) : 1;
      grow(NX + 56, NY, 598, y, gu, k >= 2 ? ACC : MUT, { plain: true, sw: 2 });
      const cg = card(765, y, 330, 62, { rx: 10, stroke: isNew && k < 3 ? ACC : INK, sw: 2, s });
      tx(-149, -5, plain(g.os), { 'font-size': 15, 'font-weight': 800 }, cg);
      tx(-149, 17, g.name, { 'font-size': 13.5, fill: MUT, class: 'mono' }, cg);
      doc(775, y, GEN_FILE[g.name] || g.name, { fs: 14, s }); });
    if (k === 3) banner(480, 386, 'CMake는 빌드 파일을 만들 뿐, 컴파일은 make·ninja·MSVC가 한다', pop(u, 1.6)); }

  // ---------- 2. 타깃 두 개와 링크 ----------
  function s2(t, c) { const { k, u } = c, cmds = c.beat.commands || [], old = (c.prev && c.prev.commands || []).map((x) => x.cmd);
    tx(30, 30, 'CMakeLists.txt 의 명령', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    cmds.forEach((m, i) => { const pi = old.indexOf(m.cmd), isNew = pi < 0, y = 62 + lerp(pi < 0 ? i : pi, i, E(u, 0.05, 0.5)) * 52;
      const op = isNew ? fade(u, 0.6) : 1, dx = isNew ? lerp(-18, 0, E(u, 0.6, 1.1)) : 0;
      if (isNew) el('rect', { x: 26, y: y - 20, width: 278, height: 46, rx: 6, fill: ACCBG, opacity: op });
      mono(38 + dx, y, m.cmd, { 'font-size': 14.5, 'font-weight': 700, fill: m.tone === 'good' ? GOOD : INK, opacity: op });
      tx(38 + dx, y + 20, m.role, { 'font-size': 13.5, fill: MUT, opacity: op }); });
    if (k === 0) { zone(340, 50, 590, 290, null, { fill: 'none', stroke: GRID, dash: '6 6' });
      note(635, 190, '아직 타깃이 없다 · 만들 산출물 0개', fade(u, 0.6), { 'text-anchor': 'middle', fill: MUT }); return; }
    // core 라이브러리
    const CX = 790, CY = 185, cs = k === 1 ? pop(u, 0.3) : 1;
    [[690, 'src/math.cpp'], [830, 'src/util.cpp']].forEach(([x, n], i) => { doc(x - 50, 78, n, { fs: 13.5, s: cs });
      if (k === 1) dot([[x - 10, 96], [CX + (i ? 30 : -30), CY - 34]], seg(u, 0.9 + i * 0.3, 1.8 + i * 0.3), INFO, 6); });
    card(CX, CY, 170, 64, { rx: 10, stroke: INFO, sw: 2.5, fill: INFOBG, s: cs });
    lbl(CX, CY - 2, 'core', cs, { 'font-size': 18, class: 'mono', fill: INFO });
    sub(CX, CY + 20, 'add_library', cs);
    if (k >= 2) { const s = k === 2 ? pop(u, 0.4) : 1; grow(CX, CY + 33, CX, 266, k === 2 ? E(u, 0.2, 0.6) : 1, INFO, { plain: true });
      folder(CX - 40, 284, 'include/', { s }); pill(CX + 100, 284, 'PUBLIC', GOOD, k === 2 ? pop(u, 1.0) : 1, { fs: 13.5, mono: true }); }
    if (k >= 3) { const s = k === 3 ? pop(u, 0.3) : 1, MX = 470;
      doc(MX - 50, 78, 'src/main.cpp', { fs: 13.5, s });
      if (k === 3) dot([[MX - 10, 96], [MX, CY - 34]], seg(u, 0.8, 1.6), ACC, 6);
      card(MX, CY, 150, 64, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s });
      lbl(MX, CY - 2, 'myapp', s, { 'font-size': 18, class: 'mono', fill: ACC });
      sub(MX, CY + 20, 'add_executable', s);
      if (k === 3) { el('line', { x1: MX + 78, y1: CY, x2: CX - 88, y2: CY, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 6', opacity: fade(u, 1.2) });
        cross(630, CY, 10, pop(u, 1.5)); sub(630, CY - 24, '아직 링크 없음', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); } }
    if (k >= 4) { const MX = 470;
      grow(MX + 78, CY, CX - 90, CY, E(u, 0.2, 0.9), ACC);
      mono(630, CY - 12, 'PRIVATE', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      fly(CX - 30, 284, MX - 10, 284, seg(u, 1.0, 2.0), 'include/', { fill: GOOD, mono: true });
      if (u > 2.0) { folder(MX - 40, 284, 'include/', { col: GOOD }); sub(MX, 318, 'core에서 따라옴', 1, { fill: GOOD, 'font-weight': 700 }); }
      banner(635, 384, '설정은 전역이 아니라 그 타깃에 매단다', pop(u, 2.1)); } }

  // ---------- 3. configure → generate → build ----------
  const TERM = [['$ cmake -B build -S .', 0], ['-- Configuring done', 0], ['-- Generating done', 1], ['-- Build files have been written to: …/build', 1],
    ['$ cmake --build build', 2], ['[ 50%] Building CXX object …/main.cpp.o', 2], ['[100%] Built target myapp', 2], ['$ ./build/myapp', 3], ['$ rm -rf build', 4]];
  const BUILD = [['CMakeCache.txt', 0, 'doc'], ['CMakeFiles/', 1, 'dir'], ['Makefile', 1, 'doc'], ['main.cpp.o', 2, 'doc'], ['myapp', 2, 'exe']];
  function s3(t, c) { const { k, u } = c, pipe = c.beat.pipeline || [];
    const lines = TERM.filter((l) => l[1] <= k).map((l) => [l[0], l[0].startsWith('$') ? PANEL : null]);
    const before = TERM.filter((l) => l[1] < k).length, shown = before + (lines.length - before) * E(u, 0.1, 1.6);
    terminal(30, 30, 470, 238, lines, shown, { title: 'terminal', fs: 13.5 });
    // 소스 트리
    zone(530, 30, 190, 238, '소스 트리  ./', { fill: SOFT });
    doc(552, 86, 'CMakeLists.txt', { fs: 13.5 }); folder(552, 122, 'src/', { fs: 13.5 }); doc(572, 156, 'main.cpp', { fs: 13.5 });
    if (k >= 1 && k < 4) { check(575, 218, 9, k === 1 ? pop(u, 1.6) : 1); note(592, 224, '건드리지 않음', k === 1 ? fade(u, 1.7) : 1, { fill: GOOD, 'font-size': 14 }); }
    // build/
    const gone = k === 4 ? E(u, 0.9, 2.0) : 0;
    zone(735, 30, 200, 238, 'build/', { fill: PANEL, stroke: k === 4 ? BAD : GRID, sw: 1.8, dash: k === 4 ? '6 5' : null });
    BUILD.forEach(([n, at, kind], i) => { if (at > k) return; const y = 78 + i * 36, isNew = at === k && k < 4;
      const s = isNew ? pop(u, 0.5 + i * 0.12) : 1, op = 1 - gone, dy = gone * (40 + i * 10);
      const col = kind === 'exe' ? ACC : INK;
      if (kind === 'dir') folder(758, y + dy, n, { fs: 13.5, s, op, col }); else doc(758, y + dy, n, { fs: 13.5, s, op, col, fw: kind === 'exe' ? 800 : 600 }); });
    if (k === 2) dot([[640, 156], [758, 78 + 3 * 36]], seg(u, 0.6, 1.4), INFO, 6);
    if (k === 3) { pill(880, 78 + 4 * 36, 'run', ACC, pop(u, 0.9), { fs: 13.5, mono: true }); dot([[750, 222], [420, 222]], seg(u, 1.0, 1.8), ACC, 6); }
    if (k === 4) { cross(835, 150, 22, pop(u, 2.0)); check(575, 218, 9, pop(u, 1.6)); note(592, 224, '그대로', fade(u, 1.7), { fill: GOOD, 'font-size': 14 }); }
    // 아래: 단계 띠
    const PH = [['configure', 'cmake -B build'], ['generate', '같은 실행 안에서'], ['build', 'cmake --build build']];
    PH.forEach(([n, cmd], i) => { const x = 175 + i * 305, on = i < pipe.length, cur = i === pipe.length - 1 && k < 4, s = on && cur && (k === i || (k === 0 && i === 0)) ? pop(u, 0.3) : 1;
      if (i > 0) grow(x - 305 + 92, 330, x - 92, 330, on ? (cur ? E(u, 0.1, 0.5) : 1) : 0, on ? ACC : GRID);
      card(x, 330, 172, 44, { rx: 22, text: n, fs: 15, fw: 800, mono: true, stroke: on ? ACC : GRID, color: on ? (cur ? PANEL : ACC) : OFF, fill: on && cur ? ACC : PANEL, s });
      sub(x, 374, cmd, on ? 1 : 0.4, { class: 'mono' }); });
    if (k === 4) banner(480, 404, 'build/ 하나만 지우면 정리 끝 · .gitignore 에 넣는다', pop(u, 2.2)); }

  // ---------- 4. 의존 타깃 그래프 · 빌드 타입 ----------
  const KIND = { local: { col: INFO, bg: INFOBG, from: ['src/', '같은 저장소'] }, external: { col: GOOD, bg: GOODBG, from: ['시스템에 설치됨', 'find_package'] },
    fetched: { col: WARN, bg: WARNBG, from: ['nlohmann/json', 'GIT_TAG v3.11.3'] } };
  function s4(t, c) { const { k, u } = c, deps = (c.beat.graph && c.beat.graph.deps) || [], bts = c.beat.buildTypes || [];
    const pd = (c.prev && c.prev.graph && c.prev.graph.deps) || [], pb = (c.prev && c.prev.buildTypes || []).length;
    const RX = 150, RY = 175;
    card(RX, RY, 170, 76, { rx: 12, stroke: ACC, sw: 2.8, fill: k === 3 ? ACCBG : PANEL, s: k === 3 ? 1 + R.bump(u, 0.3) : 1 });
    lbl(RX, RY - 4, 'myapp', 1, { 'font-size': 19, class: 'mono', fill: ACC }); sub(RX, RY + 20, '실행파일 타깃');
    deps.forEach((d, i) => { const y = 80 + i * 95, K = KIND[d.kind] || KIND.local, prevD = pd.find((x) => x.name === d.name);
      const isNew = !prevD, declOnly = /선언/.test(d.via), wasDecl = prevD && /선언/.test(prevD.via), s = isNew ? pop(u, 0.4) : 1;
      // 출처 → 의존 타깃
      const fx = 830; card(fx, y, 200, 54, { rx: 8, stroke: K.col, sw: 1.6, dash: d.kind === 'external' ? null : '5 4', fill: PANEL, s });
      tx(fx, y - 4, K.from[0], { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: d.kind === 'fetched' ? 'mono' : null, opacity: s });
      tx(fx, y + 16, K.from[1], { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: 'mono', opacity: s });
      const flow = isNew || (wasDecl && !declOnly);
      el('line', { x1: 728, y1: y, x2: 632, y2: y, stroke: K.col, 'stroke-width': 2, 'stroke-dasharray': declOnly ? '5 5' : null, opacity: isNew ? fade(u, 0.8) : 1, 'marker-end': 'url(#ra-ah)' });
      if (flow && !declOnly) for (let j = 0; j < 3; j++) dot([[728, y], [632, y]], seg(u, 0.9 + j * 0.35, 1.5 + j * 0.35), K.col, 5);
      card(520, y, 216, 56, { rx: 10, stroke: K.col, sw: 2.2, fill: declOnly ? PANEL : K.bg, dash: declOnly ? '6 5' : null, s });
      mono(520, y - 2, d.name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: K.col, opacity: s });
      tx(520, y + 18, d.via, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s });
      // 의존 타깃 → myapp (core 는 처음부터, 나머지는 마지막 beat 에서 링크)
      const linked = d.kind === 'local' || k >= 4, gu = d.kind === 'local' ? 1 : k === 4 ? E(u, 0.2 + i * 0.2, 0.9 + i * 0.2) : 0;
      if (linked) grow(410, y, RX + 88, RY + (i - 1) * 16, gu, d.kind === 'local' ? MUT : ACC);
      if (k === 4 && d.kind !== 'local') fly(410, y, RX + 90, RY + (i - 1) * 16, seg(u, 1.1 + i * 0.25, 2.1 + i * 0.25), i === 1 ? '헤더 경로' : '플래그'); });
    // 빌드 타입
    tx(40, 378, 'CMAKE_BUILD_TYPE', { 'font-size': 13.5, class: 'mono', fill: MUT, 'font-weight': 700 });
    bts.forEach((b, i) => { const x = 330 + i * 300, s = i >= pb ? pop(u, 0.6) : 1, col = b.tone === 'good' ? GOOD : INK;
      card(x, 372, 270, 54, { rx: 10, stroke: col, sw: 2, s });
      mono(x - 122, 368, b.type, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s });
      mono(x - 122, 389, b.flags, { 'font-size': 13.5, fill: MUT, opacity: s });
      tx(x + 122, 368, b.use, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: s }); }); }

  // ---------- 5. 실패 사례 ----------
  const P_TITLE = ['in-source 빌드', '전역 include', '헤더 경로 손으로', '라이브러리 경로 하드코딩'];
  function panels(u) { const s = fade(u, 0.1);
    zone(30, 62, 432, 300, null, { fill: BADBG, op: s }); zone(498, 62, 432, 300, null, { fill: GOODBG, op: s });
    cross(54, 88, 9, s); check(522, 88, 9, s); }
  function s5(t, c) { const { k, u } = c;
    if (k < 4) { lbl(480, 34, `함정 ${k + 1} / 4 · ${P_TITLE[k]}`, 1, { 'font-size': 17 }); panels(u); }
    if (k === 0) {
      mono(74, 94, '$ cmake .   # 소스 폴더에서', { 'font-size': 14, 'font-weight': 700 });
      folder(64, 134, 'my_project/'); doc(88, 168, 'CMakeLists.txt', { fs: 13.5 }); folder(88, 200, 'src/', { fs: 13.5 });
      ['CMakeCache.txt', 'CMakeFiles/', 'Makefile', 'cmake_install.cmake'].forEach((n, i) => { const s = pop(u, 0.6 + i * 0.25), y = 232 + i * 32;
        if (n.endsWith('/')) folder(88, y, n, { fs: 13.5, col: BAD, s }); else doc(88, y, n, { fs: 13.5, col: BAD, s }); });
      note(300, 262, 'git status', fade(u, 1.8), { class: 'mono', fill: BAD }); note(300, 286, '새 파일 4개', fade(u, 1.9), { fill: BAD });
      mono(542, 94, '$ cmake -B build -S .', { 'font-size': 14, 'font-weight': 700 });
      folder(532, 134, 'my_project/'); doc(556, 168, 'CMakeLists.txt', { fs: 13.5 }); folder(556, 200, 'src/', { fs: 13.5 });
      folder(556, 232, 'build/', { fs: 13.5, col: GOOD, s: pop(u, 1.2) });
      note(650, 238, '← 산출물은 전부 여기', fade(u, 1.5), { fill: GOOD, 'font-size': 14 }); return; }
    if (k === 1) {
      mono(74, 94, 'include_directories(include)', { 'font-size': 14, 'font-weight': 700 });
      ['app', 'core', 'tests'].forEach((n, i) => { const x = 110 + i * 136; grow(246, 110, x, 236, E(u, 0.4 + i * 0.2, 1.0 + i * 0.2), BAD);
        card(x, 262, 104, 46, { rx: 8, text: n, mono: true, fs: 15, fw: 800 }); pill(x, 312, 'include/', BAD, pop(u, 1.2 + i * 0.2), { fs: 13.5, mono: true }); });
      note(74, 350, '필요 없는 타깃까지 경로를 받는다', fade(u, 1.9), { fill: BAD, 'font-size': 14 });
      mono(542, 94, 'target_include_directories(', { 'font-size': 14, 'font-weight': 700 }); mono(562, 116, 'app PUBLIC include)', { 'font-size': 14, 'font-weight': 700 });
      ['app', 'core', 'tests'].forEach((n, i) => { const x = 578 + i * 136, on = i === 0; if (on) grow(620, 130, x, 236, E(u, 0.6, 1.2), GOOD);
        card(x, 262, 104, 46, { rx: 8, text: n, mono: true, fs: 15, fw: 800, stroke: on ? GOOD : GRID, color: on ? INK : MUT });
        if (on) pill(x, 312, 'include/', GOOD, pop(u, 1.4), { fs: 13.5, mono: true }); });
      note(518, 350, '누가 무엇을 쓰는지 한눈에 보인다', fade(u, 2.0), { fill: GOOD, 'font-size': 14 }); return; }
    if (k === 2) {
      mono(74, 94, 'CMAKE_CXX_FLAGS "-I/usr/local/include"', { 'font-size': 13.5, 'font-weight': 700 });
      const mv = E(u, 0.8, 1.6);
      grow(150, 112, 150, 176, 1, BAD, { plain: true });
      folder(130, 200 + mv * 0, '/usr/local/include', { fs: 13.5, op: 1 - mv * 0.75 });
      folder(150 + mv * 30, 200 + mv * 80, '/opt/homebrew/include', { fs: 13.5, col: WARN, op: mv, s: 1 });
      cross(150, 146, 11, pop(u, 1.7)); note(74, 338, '라이브러리가 옮겨지면 바로 깨진다', fade(u, 1.9), { fill: BAD, 'font-size': 14 });
      mono(542, 94, 'target_link_libraries(', { 'font-size': 14, 'font-weight': 700 }); mono(562, 116, 'app PRIVATE fmt::fmt)', { 'font-size': 14, 'font-weight': 700 });
      card(600, 220, 140, 50, { rx: 8, text: 'fmt::fmt', mono: true, fs: 15, fw: 800, stroke: GOOD, fill: PANEL });
      card(830, 220, 120, 50, { rx: 8, text: 'app', mono: true, fs: 15, fw: 800, stroke: ACC });
      grow(670, 220, 768, 220, E(u, 0.5, 1.1), ACC);
      fly(670, 220, 800, 290, seg(u, 1.1, 2.0), '헤더 경로', { fill: GOOD, stay: true });
      note(518, 338, '경로는 타깃이 알아서 들고 온다', fade(u, 2.1), { fill: GOOD, 'font-size': 14 }); return; }
    if (k === 3) {
      mono(74, 94, 'target_link_libraries(app', { 'font-size': 14, 'font-weight': 700 }); mono(94, 116, '/usr/lib/libfmt.a)', { 'font-size': 14, 'font-weight': 700, fill: BAD });
      [['Linux', '/usr/lib/libfmt.a', true], ['Windows', 'fmt.lib', false], ['macOS', '/opt/homebrew/lib', false]].forEach(([os, p, ok], i) => { const y = 176 + i * 56, s = pop(u, 0.5 + i * 0.3);
        tx(80, y + 5, os, { 'font-size': 15, 'font-weight': 800, opacity: s }); mono(180, y + 5, p, { 'font-size': 13.5, fill: MUT, opacity: s });
        if (ok) check(430, y, 9, s); else cross(430, y, 9, s); });
      mono(542, 94, 'find_package(fmt REQUIRED)', { 'font-size': 14, 'font-weight': 700 });
      [['Linux', true], ['Windows', true], ['macOS', true]].forEach(([os], i) => { const y = 176 + i * 56, s = pop(u, 0.9 + i * 0.3);
        tx(548, y + 5, os, { 'font-size': 15, 'font-weight': 800, opacity: s }); mono(650, y + 5, '→ fmt::fmt', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: s }); check(898, y, 9, s); });
      note(518, 344, '플랫폼마다 맞는 파일을 CMake가 찾는다', fade(u, 2.1), { fill: GOOD, 'font-size': 14 }); return; }
    // k4: 고친 모양 — 타깃 하나에 필요한 것만 매달린다
    lbl(480, 34, '네 가지를 고친 모양', 1, { 'font-size': 17 });
    card(480, 200, 170, 74, { rx: 12, stroke: ACC, sw: 2.8, fill: ACCBG, s: pop(u, 0.2) });
    lbl(480, 196, 'app', 1, { 'font-size': 20, class: 'mono', fill: ACC }); sub(480, 220, 'add_executable');
    [['include/', 'PUBLIC', 180, 110], ['fmt::fmt', 'PRIVATE', 780, 110], ['C++17', '표준 고정', 180, 290], ['build/', 'out-of-source', 780, 290]].forEach(([a, b, x, y], i) => {
      const s = pop(u, 0.6 + i * 0.3); grow(x + (x < 480 ? 90 : -90), y, 480 + (x < 480 ? -88 : 88), 200 + (y < 200 ? -30 : 30), E(u, 0.6 + i * 0.3, 1.1 + i * 0.3), GOOD, { plain: true });
      card(x, y, 180, 58, { rx: 10, stroke: GOOD, sw: 2, s }); mono(x, y - 3, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(x, y + 18, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    banner(480, 388, '전역 대신 타깃, 수동 대신 선언', pop(u, 1.9)); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'CMake 자체가 하는 일은 무엇인가?',
      o: ['CMakeLists.txt의 선언을 읽어 플랫폼별 빌드 파일을 만든다', 'C++ 소스를 직접 컴파일한다', '필요한 라이브러리를 인터넷에서 설치해 준다'], a: 0,
      why: 'CMake는 메타 빌드 시스템이다. 같은 CMakeLists.txt에서 Makefile, build.ninja, VS 솔루션을 만들고, 실제 컴파일은 그 도구들이 한다.' },
    { q: 'target_include_directories(core PUBLIC include)에서 PUBLIC이 하는 일은 무엇인가?',
      o: ['core만 include/를 쓴다', '프로젝트의 모든 타깃에 include/가 뿌려진다', 'core와 core를 링크하는 타깃 모두 include/를 쓴다'], a: 2,
      why: 'PUBLIC은 나와 나를 쓰는 쪽 모두에 붙는다. 그래서 myapp이 core를 링크하자 include/ 경로가 저절로 따라왔다.' },
    { q: 'out-of-source로 빌드한 뒤 산출물을 모두 지우는 방법은 무엇인가?',
      o: ['소스 폴더의 CMakeCache.txt와 Makefile을 하나씩 찾아 지운다', 'build/ 폴더 하나만 지운다', 'CMake를 다시 설치한다'], a: 1,
      why: '-B build로 산출물을 build/에 모았으니 그 폴더만 지우면 된다. 소스 트리에는 아무것도 생기지 않았다.' },
    { q: 'find_package와 FetchContent의 차이는 무엇인가?',
      o: ['둘은 같은 일을 하고 이름만 다르다', 'find_package는 설치된 것을 찾고, FetchContent는 소스를 받아 함께 빌드한다', 'find_package는 헤더만, FetchContent는 라이브러리 파일만 가져온다'], a: 1,
      why: 'find_package는 설치돼 있어야 하고 없으면 REQUIRED 때문에 configure가 멈춘다. FetchContent는 GIT_TAG v3.11.3처럼 버전을 코드에 적어 받는다.' },
    { q: 'target_link_libraries(app /usr/lib/libfmt.a)가 문제인 이유는 무엇인가?',
      o: ['링크 속도가 느려진다', '헤더가 두 번 포함된다', '윈도우나 macOS에는 그 경로에 파일이 없어 빌드가 깨진다'], a: 2,
      why: '라이브러리 파일의 이름과 위치는 플랫폼마다 다르다. find_package(fmt REQUIRED)로 받은 fmt::fmt 타깃을 링크하면 CMake가 맞는 파일을 찾는다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    'CMake는 컴파일러가 아니다. CMakeLists.txt를 읽어 Makefile이나 VS 솔루션 같은 빌드 파일을 만든다.',
    '산출물 하나가 타깃 하나다. 헤더 경로와 링크 대상은 target_ 명령으로 그 타깃에만 붙인다.',
    'cmake -B build로 configure와 generate를 하고, cmake --build build로 컴파일한다.',
    '외부 라이브러리는 find_package나 FetchContent로 타깃을 받아 링크하고, 경로는 손으로 적지 않는다.',
  ];
  const review = [
    { q: '내 PC에서는 빌드되는데 CI에서만 libfmt.a를 찾을 수 없다며 링크가 실패한다. 먼저 의심할 것은?',
      o: ['CMakeLists.txt에 라이브러리 파일 경로가 직접 적혀 있다', 'C++ 표준을 17로 고정했다', 'build/ 폴더를 .gitignore에 넣었다'], a: 0,
      why: '절대 경로는 그 파일이 있는 PC에서만 맞다. find_package로 fmt::fmt 타깃을 받아 링크하면 환경마다 CMake가 위치를 찾는다.' },
    { q: '새 타깃 tests를 추가했더니 쓰지도 않는 헤더 경로 때문에 이름 충돌이 났다. CMakeLists.txt 위쪽에 있을 가능성이 큰 줄은?',
      o: ['target_link_libraries(tests PRIVATE core)', 'include_directories(include)', 'cmake_minimum_required(VERSION 3.16)'], a: 1,
      why: 'include_directories는 그 뒤에 만드는 모든 타깃에 경로를 뿌린다. target_include_directories로 필요한 타깃에만 붙이면 tests는 받지 않는다.' },
    { q: 'myapp이 core를 링크했는데도 core의 헤더를 못 찾는다는 오류가 난다. core 쪽에서 고칠 곳은?',
      o: ['add_library(core ...)를 add_executable로 바꾼다', 'cmake --build build를 한 번 더 실행한다', 'target_include_directories(core PRIVATE include)를 PUBLIC으로 바꾼다'], a: 2,
      why: 'PRIVATE 경로는 core 자신만 쓴다. PUBLIC으로 바꾸면 core를 링크하는 myapp에도 include/가 전이된다.' },
  ];

  R.page({ title: 'CMake 빌드 그림', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
