/* I-2-1 npm과 package.json — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 실행해 본 값(npm 11.9.0, 2026-11-24 레지스트리): npm init -y 는 "type": "commonjs" 를 넣는다,
 * express@4.19.2 설치 → lock 의 패키지 68개(express 포함), integrity sha512-5T6nhjs…, body-parser 1.20.2 · cookie 0.6.0,
 * npm update → 4.22.3, npm outdated: Current 4.19.2 · Wanted 4.22.3 · Latest 5.3.0,
 * npm audit: 4.19.2 트리 7건(low 3 · moderate 1 · high 3) → 4.22.3 뒤 0건, --production 은 "Use --omit=dev" 경고. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, terminal, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function file(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: op });
    el('rect', { x, y, width: w, height: 30, rx: 10, fill: SOFT, opacity: op }); el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: o.stroke || INK, 'stroke-width': 1.2, opacity: op });
    mono(x + 14, y + 21, name, { 'font-size': 15, 'font-weight': 800, opacity: op, fill: o.stroke === GRID ? MUT : o.stroke || INK }); }
  // 폴더 아이콘
  function folder(cx, cy, w, h, name, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), col = o.stroke || INK;
    el('path', { d: `M${-w / 2},${-h / 2 + 8} h${w * 0.32} l8,-8 h${w * 0.68 - 8} v${h} h${-w} z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    if (name) mono(0, 6, name, { 'font-size': o.fs || 14, 'text-anchor': 'middle', 'font-weight': 700, fill: o.color || col }, g); return g; }
  // 컨테이너 이미지 상자
  function image(cx, cy, w, h, title, items, o) { o = o || {}; card(cx, cy, w, h, { rx: 12, stroke: o.stroke || INFO, sw: 2.2, fill: PANEL, s: o.s });
    if ((o.s ?? 1) < 0.5) return; tx(cx - w / 2 + 14, cy - h / 2 + 24, title, { 'font-size': 14, 'font-weight': 800, fill: o.stroke || INFO });
    items.forEach(([n, col, op], i) => pill(cx, cy - h / 2 + 56 + i * 36, n, col, 1, { mono: true, fs: 13.5, op: op ?? 1 })); }

  // ---------- 1. package.json ----------
  const DOC = { x: 30, y: 30, w: 400, h: 360 };
  function doc(c) { const F = c.beat.manifest.fields, P = c.prev ? c.prev.manifest.fields : [], u = c.u;
    file(DOC.x, DOC.y, DOC.w, DOC.h, 'package.json', { stroke: INK });
    F.forEach((f, i) => { const isNew = !P.find((q) => q.key === f.key), y = DOC.y + 60 + i * 44, s = isNew ? clamp(E(u, 0.2 + (i - P.length) * 0.3, 0.8 + (i - P.length) * 0.3)) : 1;
      if (isNew && s > 0) el('rect', { x: DOC.x + 8, y: y - 22, width: (DOC.w - 16) * s, height: 34, rx: 6, fill: ACCBG });
      if (s <= 0) return; mono(DOC.x + 20, y, `"${f.key}"`, { 'font-size': 15, 'font-weight': 700, fill: isNew ? ACC : INK, opacity: s });
      mono(DOC.x + 196, y, f.val, { 'font-size': 15, opacity: s }); }); }
  function s1(t, c) { const { k, u } = c; doc(c); const X = 470;
    if (k === 0) { tx(X, 70, 'version = semver', { 'font-size': 16, 'font-weight': 800 });
      [['1', 'MAJOR', '호환이 깨진다', BAD], ['0', 'MINOR', '기능 추가', INFO], ['0', 'PATCH', '버그 수정', GOOD]].forEach(([v, n, d, col], i) => { const x = X + 30 + i * 150, s = pop(u, 0.9 + i * 0.3);
        card(x + 50, 150, 100, 70, { rx: 10, text: v, fs: 30, mono: true, stroke: col, color: col, s });
        if (i < 2) mono(x + 115, 160, '.', { 'font-size': 30, 'font-weight': 800, opacity: s });
        mono(x + 50, 210, n, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: col, opacity: fade(u, 1.2 + i * 0.3) });
        tx(x + 50, 236, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2 + i * 0.3) }); });
      note(X, 310, 'name 은 npm 에서 이 패키지를 찾는 이름', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 1) { grow(DOC.x + 330, 190, X + 60, 120, E(u, 0.8, 1.3), MUT); file(X + 70, 90, 150, 80, 'index.js', { stroke: INK, op: fade(u, 1.2) });
      mono(X + 245, 140, 'require("my-app") 하면 여기', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
      const t2 = fade(u, 1.6); ['index.js', 'util.js', 'db.js'].forEach((f, i) => { pill(X + 80 + i * 140, 250, f, ACC, pop(u, 1.6 + i * 0.15), { mono: true, fs: 14 }); });
      mono(X + 220, 300, '"type": "module" → 이 폴더 .js 전부 ESM', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: t2 });
      mono(X + 220, 340, 'npm init -y 기본값은 "commonjs"', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 2) { [['npm start', 'node index.js'], ['npm test', 'vitest']].forEach(([a, b], i) => { const y = 120 + i * 110, s = pop(u, 0.9 + i * 0.4);
        card(X + 90, y, 160, 50, { rx: 25, text: a, fs: 16, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s });
        grow(X + 176, y, X + 250, y, E(u, 1.2 + i * 0.4, 1.5 + i * 0.4), MUT);
        card(X + 340, y, 170, 46, { rx: 8, text: b, fs: 15, mono: true, s: pop(u, 1.5 + i * 0.4) }); });
      note(X, 340, '팀 전체가 같은 명령으로 돌린다', fade(u, 2.2), { fill: ACC }); return; }
    // k3, k4 : 배포 이미지에 무엇이 들어가나
    image(X + 120, 210, 210, 180, '배포 이미지', [['express', ACC, 1]], { s: pop(u, k === 3 ? 0.8 : 0) });
    if (k === 3) { fly(DOC.x + 300, DOC.y + 324, X + 120, 186, seg(u, 1.2, 2.0), 'express ^4.19.2', { mono: true }); note(X, 360, '실행에 꼭 필요 → 함께 배포', fade(u, 2.2), { fill: ACC }); return; }
    folder(X + 360, 210, 150, 110, '', { stroke: WARN, s: pop(u, 0.6) }); pill(X + 360, 216, 'vitest', WARN, pop(u, 1.0), { mono: true, fs: 14 });
    tx(X + 360, 290, '개발 PC 에만', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
    if (u > 1.4) cross(X + 245, 210, 11, pop(u, 1.4)); note(X, 360, '테스트 도구는 이미지에 안 들어간다', fade(u, 2.0), { fill: WARN }); }

  // ---------- 2. npm install ----------
  function cloud(cx, cy, s) { const g = R.G(cx, cy, s);
    el('path', { d: 'M-60,20 a26,26 0 0 1 4,-44 a34,34 0 0 1 62,-10 a26,26 0 0 1 48,22 a22,22 0 0 1 -6,32 z', fill: SOFT, stroke: MUT, 'stroke-width': 2 }, g);
    tx(0, 8, 'npm 레지스트리', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT }, g); }
  function nm(x, y, w, h) { zone(x, y, w, h, 'node_modules/', { fill: PANEL, stroke: INK, sw: 1.8, color: INK }); }
  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };
  function s2(t, c) { const { k, u } = c, NX = 420, NY = 40, NW = 510, NH = 340;
    if (k <= 2) { cloud(120, 110, 1); nm(NX, NY, NW, NH);
      for (let i = 0; i < 4; i++) dot([[190, 110], [NX - 10, 110]], ((t * 0.7 + i / 4) % 1), ACC, 5);
      folder(NX + 90, NY + 80, 130, 56, 'express', { stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.5) : 1 });
      if (k === 0) { mono(40, 260, '"dependencies": {', { 'font-size': 14.5, opacity: fade(u, 1.0) }); mono(60, 288, '"express": "^4.19.2"', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) }); mono(40, 316, '}', { 'font-size': 14.5, opacity: fade(u, 1.0) });
        sub(190, 360, 'package.json 에도 기록된다', fade(u, 1.8), { 'font-size': 14 }); return; }
      const n = k === 1 ? Math.round(lerp(1, 68, E(u, 0.3, 2.2))) : 68;
      for (let i = 1; i < n; i++) { const col = i % 12, row = Math.floor(i / 12); el('rect', { x: NX + 180 + col * 26, y: NY + 54 + row * 26, width: 20, height: 20, rx: 3, fill: i < 3 ? ACC : OFF, opacity: 0.85 }); }
      pill(NX + 90, NY + 150, 'body-parser', MUT, 1, { mono: true, fs: 13.5 }); pill(NX + 90, NY + 190, 'cookie', MUT, 1, { mono: true, fs: 13.5 });
      mono(NX + 180, NY + 280, `패키지 ${n}개`, { 'font-size': 20, 'font-weight': 800, fill: ACC });
      if (k === 1) { note(40, 260, 'express 하나를 적었을 뿐인데', fade(u, 0.6), { 'font-size': 14 }); note(40, 288, '의존성의 의존성까지 온다', fade(u, 1.2), { 'font-size': 14, fill: ACC }); return; }
      // k2: 개발 의존성
      el('rect', { x: NX + 14, y: NY + 296, width: 150, height: 34, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 1.6, opacity: fade(u, 0.4) });
      mono(NX + 89, NY + 318, 'vitest · eslint', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(40, 260, 'npm install -D vitest eslint', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(40, 290, '→ "devDependencies"', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    if (k === 3) { tx(40, 46, '같은 package.json, 다른 설치', { 'font-size': 16, 'font-weight': 800 });
      image(250, 230, 300, 230, 'npm install', [['express + 전이 의존성', ACC], ['vitest · eslint', WARN]], { s: pop(u, 0.3) });
      const drop = E(u, 1.2, 2.0);
      image(700, 230, 300, 230, 'npm install --omit=dev', [['express + 전이 의존성', ACC], ['vitest · eslint', WARN, 1 - drop]], { s: pop(u, 0.7), stroke: GOOD });
      if (drop > 0.5) cross(700, 266, 10, 1);
      note(560, 390, '배포 이미지가 가벼워진다', fade(u, 2.2), { fill: GOOD }); return; }
    // k4: 전역 설치
    tx(40, 46, '-g 는 프로젝트 밖에 깔린다', { 'font-size': 16, 'font-weight': 800 });
    folder(220, 170, 260, 120, '', { stroke: INK, s: pop(u, 0.2) }); mono(220, 160, '내 PC 전역', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
    pill(220, 196, 'http-server', WARN, pop(u, 0.6), { mono: true, fs: 14 });
    [['동료 PC', 560], ['CI 서버', 800]].forEach(([n, x], i) => { const s = pop(u, 1.0 + i * 0.4); card(x, 170, 180, 110, { rx: 12, stroke: GRID, s });
      if (s > 0.5) { tx(x, 150, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); cross(x, 192, 10, 1); mono(x, 230, '없음 · 버전 다름', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD }); } });
    note(40, 330, 'package.json 에 안 남아 다른 곳에서 재현되지 않는다', fade(u, 2.0), { fill: BAD });
    note(40, 362, '프로젝트 도구는 devDependencies + npx', fade(u, 2.4), { fill: GOOD }); }

  // ---------- 3. package-lock.json ----------
  const VX = (v) => 470 + (v - 4.19) * 520;   // 4.19 ~ 5.0 → x  (범위 막대용)
  function s3(t, c) { const { k, u } = c, L = c.beat.lock;
    if (k <= 1) { file(40, 40, 340, 140, 'package.json', { stroke: INK }); mono(60, 100, '"express": "^4.19.2"', { 'font-size': 15, fill: ACC, 'font-weight': 700 }); mono(60, 136, '범위만 적혀 있다', { 'font-size': 13.5, fill: MUT });
      file(40, 220, 340, 160, 'package-lock.json', { stroke: GOOD, op: k === 0 ? fade(u, 0.3) : 1 });
      mono(60, 280, '"lockfileVersion": 3', { 'font-size': 15, opacity: k === 0 ? fade(u, 0.8) : 1 });
      // 범위 막대 4.19.2 이상 5.0.0 미만
      tx(470, 90, '^4.19.2 가 허용하는 범위', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: VX(4.192), y: 120, width: VX(5.0) - VX(4.192), height: 22, rx: 11, fill: ACCBG, stroke: ACC, 'stroke-width': 1.6 });
      mono(VX(4.192), 168, '4.19.2', { 'font-size': 14, 'text-anchor': 'middle' }); mono(VX(5.0), 168, '5.0.0 미만', { 'font-size': 14, 'text-anchor': 'middle' });
      if (k === 0) { mono(650, 230, '?', { 'font-size': 40, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); note(470, 290, L.resolved, fade(u, 1.6), { fill: MUT, 'font-size': 14 }); return; }
      const d = E(u, 0.3, 1.2); el('circle', { cx: VX(4.192), cy: lerp(60, 131, d), r: 9, fill: GOOD });
      mono(60, 320, '"version": "4.19.2"', { 'font-size': 15, fill: GOOD, 'font-weight': 800, opacity: fade(u, 1.2) });
      grow(VX(4.192), 145, 390, 312, E(u, 1.4, 2.0), GOOD);
      note(470, 260, '이번에 실제로 깔린 정확한 버전을 적어 둔다', fade(u, 2.0), { fill: GOOD, 'font-size': 14 }); return; }
    if (k === 2) { tx(40, 50, '받은 파일이 그 파일이 맞는지 확인한다', { 'font-size': 16, 'font-weight': 800 });
      mono(40, 96, '"resolved": "…/express/-/express-4.19.2.tgz"', { 'font-size': 14.5, opacity: fade(u, 0.2) });
      mono(40, 126, '"integrity": "sha512-5T6nhjs…"', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      [['받은 tgz', 'sha512-5T6nhjs…', GOOD, true], ['중간에 바뀐 tgz', 'sha512-(다른 값)', BAD, false]].forEach(([a, h, col, ok], i) => { const y = 200 + i * 90, s = pop(u, 0.9 + i * 0.6);
        card(150, y, 220, 60, { rx: 10, text: a, fs: 15, stroke: col, s }); grow(262, y, 390, y, E(u, 1.1 + i * 0.6, 1.4 + i * 0.6), MUT);
        mono(410, y + 5, h, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 1.3 + i * 0.6) });
        if (u > 1.6 + i * 0.6) { (ok ? check : cross)(680, y, 11, pop(u, 1.6 + i * 0.6)); tx(704, y + 6, ok ? '해시 일치 → 설치' : '불일치 → 설치 실패', { 'font-size': 14.5, fill: col, 'font-weight': 700 }); } }); return; }
    if (k === 3) { tx(40, 50, '전이 의존성도 버전이 박힌다', { 'font-size': 16, 'font-weight': 800 });
      card(200, 130, 220, 50, { rx: 10, text: 'express 4.19.2', fs: 15, mono: true, stroke: ACC, color: ACC });
      [['body-parser', '1.20.2'], ['cookie', '0.6.0']].forEach(([n, v], i) => { const y = 240 + i * 80;
        el('path', { d: `M200,155 V${y} H${300}`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: fade(u, 0.3 + i * 0.4) });
        card(410, y, 220, 46, { rx: 8, text: `${n} ${v}`, fs: 15, mono: true, s: pop(u, 0.5 + i * 0.4) }); lock(540, y, true, GOOD, pop(u, 1.0 + i * 0.4)); });
      mono(620, 280, '… 68개 전부', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      note(600, 130, '내가 적지 않은 것도 고정된다', fade(u, 2.0), { fill: GOOD, 'font-size': 14 }); return; }
    // k4: npm ci — 두 기계, 같은 트리
    file(380, 40, 200, 70, 'package-lock.json', { stroke: GOOD });
    [['내 PC', 200], ['CI', 760]].forEach(([n, x], i) => { const s = pop(u, 0.3 + i * 0.2);
      card(x, 260, 260, 190, { rx: 12, stroke: GRID, s }); if (s < 0.5) return;
      tx(x, 186, n + '  ·  npm ci', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      const g = E(u, 0.8, 2.2); for (let j = 0; j < 68; j++) { if (j / 68 > g) break; el('rect', { x: x - 110 + (j % 12) * 18, y: 206 + Math.floor(j / 12) * 18, width: 14, height: 14, rx: 2, fill: j === 0 ? ACC : OFF }); }
      dot([[480, 112], [x, 190]], seg(u, 0.4, 1.0), GOOD, 6); });
    if (u > 2.2) { check(480, 260, 14, pop(u, 2.2)); mono(480, 296, '같은 트리', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 800 }); }
    sub(480, 380, 'node_modules 를 지우고 lock 그대로 다시 만든다', fade(u, 2.4), { 'font-size': 14 }); }

  // ---------- 4. semver ----------
  const VS = ['4.19.2', '4.20.0', '4.21.2', '4.22.3', '5.0.0', '5.3.0'], SX = (i) => 110 + i * 150;
  function vline(y, hi) { el('line', { x1: 60, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 3 });
    VS.forEach((v, i) => { el('circle', { cx: SX(i), cy: y, r: 7, fill: hi && hi(i) ? ACC : PANEL, stroke: i >= 4 ? WARN : INK, 'stroke-width': 2 });
      mono(SX(i), y + 28, v, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: i >= 4 ? WARN : INK }); }); }
  function rangeBar(y, from, to, col, label, g) { if (g <= 0) return; const x0 = SX(from) - 22, x1 = SX(to) + 22;
    el('rect', { x: x0, y: y - 14, width: (x1 - x0) * g, height: 28, rx: 14, fill: col, opacity: 0.18 }); mono(x0 - 8, y + 5, label, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: g }); }
  function pin(i, y, col, lab) { el('path', { d: `M${SX(i)},${y - 12} l-10,-18 h20 z`, fill: col }); if (lab) mono(SX(i), y - 38, lab, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, 'font-weight': 800 }); }
  function s4(t, c) { const { k, u } = c, Y = 110;
    vline(Y); tx(60, 40, '실제로 나와 있는 express 버전 (일부)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k === 0) { pin(0, Y, ACC, '설치됨'); terminal(60, 200, 420, 110, ['$ npm ls express', 'my-app@1.0.0', '└── express@4.19.2'], lerp(1, 3, E(u, 0.3, 1.5)), { title: 'terminal' });
      note(530, 250, '선언은 범위, 깔린 것은 하나', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 1) { const mv = E(u, 1.4, 2.2); el('path', { d: `M${lerp(SX(0), SX(3), mv)},${Y - 12} l-10,-18 h20 z`, fill: ACC });
      rangeBar(200, 0, 3, ACC, '^4.19.2', E(u, 0.2, 0.9)); rangeBar(260, 0, 0, GOOD, '~4.19.2', E(u, 0.7, 1.2));
      mono(SX(4), 205, '5.x 는 밖', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      mono(SX(1) + 20, 265, '4.19.x 만 (뒤 패치가 없다)', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.2) });
      pill(480, 350, 'npm update → 4.19.2 에서 4.22.3', ACC, pop(u, 2.0), { mono: true, fs: 15 }); return; }
    if (k === 2) { pin(0, Y, INK); rangeBar(200, 0, 0, INK, '"4.19.2"', E(u, 0.2, 0.8));
      VS.slice(1).forEach((v, i) => cross(SX(i + 1), 200, 8, pop(u, 0.8 + i * 0.15)));
      note(80, 300, '--save-exact: 범위 기호 없이 그 버전만', fade(u, 1.6), { fill: INK }); note(80, 330, '보안 패치도 자동으로 안 들어온다', fade(u, 2.1), { fill: WARN, 'font-size': 14 }); return; }
    if (k === 3) { pin(0, Y, INK, 'Current'); pin(3, Y, ACC, 'Wanted'); pin(5, Y, WARN, 'Latest');
      terminal(60, 210, 640, 110, ['$ npm outdated', 'Package  Current  Wanted  Latest', 'express   4.19.2  4.22.3   5.3.0'], lerp(1, 3, E(u, 0.3, 1.5)), { title: 'terminal (2026-11)' });
      note(60, 360, 'Latest 는 MAJOR 가 달라 범위 밖 — 직접 올려야 한다', fade(u, 2.0), { fill: WARN, 'font-size': 14 }); return; }
    // k4 audit
    pin(0, Y, INK); pin(3, Y, GOOD);
    tx(60, 200, 'npm audit (2026-11 실행)', { 'font-size': 15, 'font-weight': 800 });
    const rows = [['4.19.2 트리', [[3, 'low', OFF], [1, 'moderate', WARN], [3, 'high', BAD]]], ['4.22.3 트리', []]];
    rows.forEach(([n, parts], i) => { const y = 240 + i * 60; mono(60, y + 18, n, { 'font-size': 14.5, 'font-weight': 700 }); let x = 200; const g = E(u, 0.4 + i * 0.8, 1.4 + i * 0.8);
      parts.forEach(([v, lab, col]) => { const w = v * 95 * g; el('rect', { x, y, width: w, height: 26, rx: 4, fill: col }); if (g > 0.9) mono(x + w / 2, y + 18, `${v} ${lab}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: PANEL, 'font-weight': 700 }); x += w + 4; });
      mono(x + 10, y + 18, parts.length ? '7건' : '0건', { 'font-size': 15, 'font-weight': 800, fill: parts.length ? BAD : GOOD, opacity: fade(u, 1.2 + i * 0.8) }); }); }

  // ---------- 5. scripts · npx ----------
  function s5(t, c) { const { k, u } = c, rows = c.beat.scripts.rows, P = c.prev ? c.prev.scripts.rows : [];
    if (k <= 2) { tx(40, 46, 'npm 명령 → 실제로 도는 것', { 'font-size': 15, 'font-weight': 800 });
      rows.forEach((r, i) => { const isNew = !P.find((q) => q.call === r.call), s = isNew ? pop(u, 0.3 + (i - P.length) * 0.3) : 1, y = 90 + i * 56;
        card(130, y, 190, 42, { rx: 21, text: r.call, fs: 15, mono: true, stroke: r.tone === 'point' ? ACC : GOOD, color: r.tone === 'point' ? ACC : GOOD, s });
        if (s > 0.5) { grow(228, y, 268, y, 1, MUT); mono(280, y + 5, r.maps, { 'font-size': 14.5 }); } });
      const X = 600;
      if (k === 0) { note(X, 100, 'start · test 는 run 을 빼도 된다', fade(u, 1.0), { fill: ACC, 'font-size': 14 }); terminal(X, 150, 330, 100, ['$ npm start', '> node index.js'], lerp(1, 2, E(u, 1.2, 1.8)), { title: 'terminal' }); return; }
      if (k === 1) { // --watch: 저장하면 다시 시작
        file(X, 80, 150, 70, 'index.js', { stroke: INK });
        const saves = [0.6, 1.6]; saves.forEach((a, i) => { if (u > a && (i === 1 || u < 1.6)) pill(X + 75, 175, i ? '저장 (2번째)' : '저장', WARN, pop(u, a), { fs: 13.5 }); });
        const rot = E(u, 0.8, 1.4) + E(u, 1.8, 2.4); el('circle', { cx: X + 260, cy: 120, r: 30, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': '14 6', transform: `rotate(${rot * 360} ${X + 260} 120)` });
        mono(X + 260, 125, 'node', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD });
        note(X, 240, '--watch: 파일이 바뀌면 다시 시작', fade(u, 1.0), { fill: GOOD, 'font-size': 14 }); note(X, 268, 'dev 는 직접 만든 이름 → npm run dev', fade(u, 1.8), { 'font-size': 14 }); return; }
      // k2: .bin 이 PATH 앞에 붙는다
      tx(X, 80, 'npm run lint 가 eslint 를 찾는 순서', { 'font-size': 14.5, 'font-weight': 800 });
      [['./node_modules/.bin', true], ['시스템 PATH', false]].forEach(([p, ok], i) => { const y = 130 + i * 60, s = pop(u, 0.6 + i * 0.4);
        card(X + 160, y, 300, 44, { rx: 8, stroke: ok ? GOOD : GRID, fill: ok ? GOODBG : PANEL, s }); if (s > 0.5) { mono(X + 26, y + 5, `${i + 1}. ${p}`, { 'font-size': 14.5, 'font-weight': 700 }); if (ok) check(X + 286, y, 9, 1); } });
      dot([[X + 10, 100], [X + 10, 130], [X + 290, 130]], seg(u, 1.2, 1.9), GOOD, 6);
      note(X, 260, '전역 설치 없이도 로컬 도구가 돈다', fade(u, 2.0), { fill: GOOD, 'font-size': 14 }); return; }
    // k3: npx
    tx(40, 46, 'npx create-vite my-app — 설치 없이 한 번', { 'font-size': 16, 'font-weight': 800 });
    const st = [['로컬 .bin 에 있나?', INK], ['없으면 받아서 캐시에', INFO], ['실행', GOOD], ['프로젝트에 안 남는다', MUT]];
    st.forEach(([s, col], i) => { const x = 130 + i * 230, sc = pop(u, 0.3 + i * 0.45); card(x, 170, 200, 70, { rx: 12, text: s, fs: 15, stroke: col, color: col, s: sc });
      if (i) grow(x - 130, 170, x - 102, 170, E(u, 0.2 + i * 0.45, 0.4 + i * 0.45), MUT); });
    folder(360, 310, 120, 70, '~/.npm', { stroke: INFO, s: pop(u, 0.9), fs: 13.5 });
    note(520, 300, 'start · test 외 이름은 npm run 이 필요하다', fade(u, 2.2), { 'font-size': 14 }); }

  // ---------- 6. 실무 함정 — 코드가 배포까지 가는 길 ----------
  const ST = [['내 PC', 110], ['git', 340], ['CI', 580], ['운영 이미지', 830]];
  function pipe(u, hot) { ST.forEach(([n, x], i) => { card(x, 120, 170, 64, { rx: 12, text: n, fs: 16, stroke: i === hot ? ACC : INK, color: i === hot ? ACC : INK, fill: i === hot ? ACCBG : PANEL });
      if (i) grow(ST[i - 1][1] + 88, 120, x - 88, 120, 1, MUT); }); }
  function s6(t, c) { const { k, u } = c, rows = c.beat.pitfall.rows;
    if (k === 4) { tx(40, 46, '재현 가능한 설치 체크리스트', { 'font-size': 16, 'font-weight': 800 });
      rows.forEach((r, i) => { const y = 92 + i * 62, flip = E(u, 0.3 + i * 0.35, 0.7 + i * 0.35);
        card(480, y, 880, 50, { rx: 10, stroke: flip > 0.5 ? GOOD : BAD, fill: flip > 0.5 ? GOODBG : BADBG });
        (flip > 0.5 ? check : cross)(64, y, 9, 1);
        tx(90, y + 6, flip > 0.5 ? r.good : r.bad, { 'font-size': 14.5, 'font-weight': 700, fill: flip > 0.5 ? GOOD : BAD }); }); return; }
    pipe(u, [1, 0, 3, 2][k]);
    if (k === 0) { fly(110, 180, 340, 180, seg(u, 0.3, 1.2), 'package.json', { mono: true, stay: true });
      fly(110, 214, 340, 214, seg(u, 0.6, 1.5), 'package-lock.json', { mono: true, fill: GOOD, stay: true });
      note(40, 270, 'lock 이 없으면 CI 와 동료가 범위를 새로 해석한다', fade(u, 1.8), { fill: BAD, 'font-size': 14 });
      note(40, 300, 'git add package.json package-lock.json', fade(u, 2.2), { fill: GOOD, class: 'mono', 'font-size': 14 }); return; }
    if (k === 1) { pill(110, 200, 'express', ACC, pop(u, 0.3), { mono: true, fs: 14 }); pill(110, 240, 'eslint · vitest  -D', WARN, pop(u, 0.7), { mono: true, fs: 14 });
      note(40, 300, '테스트 도구가 dependencies 에 있으면 이미지까지 간다', fade(u, 1.4), { fill: BAD, 'font-size': 14 });
      note(40, 330, '반대로 런타임 라이브러리를 -D 에 두면 운영에서 못 찾는다', fade(u, 2.0), { fill: BAD, 'font-size': 14 }); return; }
    if (k === 2) { pill(580, 200, 'npm ci --omit=dev', ACC, pop(u, 0.3), { mono: true, fs: 15 });
      fly(580, 120, 830, 186, seg(u, 0.8, 1.6), 'express …', { mono: true, stay: true }); fly(580, 150, 760, 230, seg(u, 0.9, 1.7), 'eslint · vitest', { mono: true, fill: OFF, stay: false });
      if (u > 1.7) cross(760, 236, 9, 1);
      note(40, 300, 'lock 그대로 · 개발 도구는 빼고', fade(u, 2.0), { fill: GOOD }); return; }
    // k3 점검
    terminal(60, 190, 560, 110, ['$ npm audit --production', 'npm warn config production Use `--omit=dev` instead.', '$ npm audit --omit=dev'], lerp(1, 3, E(u, 0.3, 1.8)), { title: 'terminal (npm 11)', fs: 13.5 });
    pill(800, 240, 'npm outdated', INFO, pop(u, 1.6), { mono: true, fs: 14 });
    note(60, 340, '--production 은 낡은 옵션이다. --omit=dev 를 쓴다', fade(u, 2.2), { fill: WARN, 'font-size': 14 }); }

  const quiz = [
    { q: 'vitest를 dependencies가 아니라 devDependencies에 두면 무엇이 달라지나?',
      o: ['npm install --omit=dev로 설치할 때 빠진다', '테스트가 더 빨리 돈다', 'node_modules에 아예 설치되지 않는다'], a: 0,
      why: 'devDependencies는 개발할 때만 필요하다고 적어 둔 것이다. 배포용 설치에서 빼면 이미지가 가벼워진다.' },
    { q: 'package.json에 express 하나만 적고 설치했는데 node_modules에 패키지가 68개 생겼다. 이유는?',
      o: ['npm이 인기 패키지를 함께 깔아 줘서', 'express가 의존하는 패키지와 그 의존성까지 딸려 와서', '전역 설치가 섞여 들어와서'], a: 1,
      why: '전이 의존성이다. express 4.19.2 하나가 67개를 더 끌고 와 lock에는 모두 68개가 적힌다.' },
    { q: 'CI에서 npm install 대신 npm ci를 쓰는 이유는 무엇인가?',
      o: ['설치 속도가 항상 더 빨라서', 'devDependencies를 자동으로 빼 줘서', 'package-lock.json에 적힌 버전 그대로 설치해 결과가 매번 같아서'], a: 2,
      why: 'npm ci는 node_modules를 지우고 lock 그대로 다시 만든다. 범위를 새로 해석하지 않으니 기계마다 같은 트리가 나온다.' },
    { q: '"express": "^4.19.2"일 때 npm update로 올라갈 수 있는 버전은?',
      o: ['4.22.3', '5.0.0', '5.3.0'], a: 0,
      why: '캐럿은 MAJOR를 넘지 않는다. 실제로 돌리면 4.22.3까지 오르고 5.x는 Latest로만 보인다.' },
    { q: 'scripts에 "lint": "eslint ."만 적어도 전역 설치 없이 돌아가는 이유는?',
      o: ['npm이 eslint를 자동으로 받아 와서', 'npm run이 node_modules/.bin을 PATH 앞에 붙여서', 'eslint가 Node 표준 라이브러리라서'], a: 1,
      why: 'npm run은 프로젝트의 node_modules/.bin을 먼저 뒤진다. 그래서 devDependencies에 둔 도구가 그대로 실행된다.' },
    { q: 'npm 11에서 npm audit --production을 쓰면 어떻게 되나?',
      o: ['오래된 옵션이라며 --omit=dev를 쓰라고 경고한다', '운영 서버에만 감사를 돌린다', '취약점을 자동으로 고친다'], a: 0,
      why: '실행하면 "Use --omit=dev instead" 경고가 뜬다. 개발 의존성을 빼고 보려면 --omit=dev를 쓴다.' },
  ];

  const summary = [
    'package.json은 이름, 버전, 실행 명령, 의존성 범위를 적은 명세서다.',
    'npm install express 한 줄에 전이 의존성까지 패키지 68개가 node_modules에 깔렸다.',
    'package-lock.json은 실제로 깔린 버전과 해시를 적어 두고, npm ci가 그대로 다시 만든다.',
    '^4.19.2는 5.0.0 미만까지 허용해 npm update가 4.22.3으로 올렸고 audit 7건이 0건이 됐다.',
  ];
  const review = [
    { q: '동료 PC에서는 테스트가 통과하는데 CI에서만 깨진다. 저장소에 package-lock.json이 없다. 먼저 할 일은?',
      o: ['CI에서 npm install을 두 번 돌린다', 'lock 파일을 커밋하고 CI는 npm ci로 설치한다', '모든 의존성을 -g로 설치한다'], a: 1,
      why: 'lock이 없으면 기계마다 범위를 그때그때 해석해 다른 버전이 깔린다. lock을 커밋하고 npm ci를 쓰면 같은 트리가 나온다.' },
    { q: '운영 이미지에서 "Cannot find module \'dayjs\'"가 났다. 로컬에선 잘 된다. 의심할 곳은?',
      o: ['dayjs가 devDependencies에 들어가 --omit=dev 설치에서 빠졌다', 'dayjs 버전이 semver를 안 지켰다', 'npm audit이 dayjs를 지웠다'], a: 0,
      why: '런타임에 import하는 라이브러리는 dependencies에 있어야 한다. 배포 설치는 devDependencies를 빼기 때문이다.' },
    { q: 'npm audit이 express 4.19.2 트리에서 high 3건을 보고했다. 범위는 ^4.19.2다. 가장 가벼운 첫 조치는?',
      o: ['곧바로 5.3.0으로 올린다', 'package.json을 "4.19.2"로 고정한다', 'npm update로 범위 안 최신 4.22.3을 받고 다시 audit한다'], a: 2,
      why: '범위 안 업데이트는 호환이 유지된다고 약속된 쪽이다. 실제로 4.22.3으로 올리자 audit이 0건이었다.' },
  ];

  R.page({ title: 'npm이 의존성을 다루는 법', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
