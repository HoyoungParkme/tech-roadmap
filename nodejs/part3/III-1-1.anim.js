/* III-1-1 파일 시스템 fs와 path — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 1 세 API의 스레드 사용 · 2 이벤트 루프 점유 대비 · 3 쓰기·목록·폴더·stat·인코딩 · 4 path 조립 · 5 실무 기본형
 * 실측값(node v24): 200MB 파일 readFileSync 654ms 동안 1ms 타이머 0회, await readFile 1004ms 동안 362회.
 *   out.txt("hello") → stat.size 5, readFile 인코딩 없음 → <Buffer 68 65 6c 6c 6f>. path.join("./data/", "/list.json") → "data/list.json". */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));

  // 파일 아이콘 (모서리 접힌 종이)
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-24,-30 H12 L24,-18 V30 H-24 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M12,-30 V-18 H24', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-8, 2, 12].forEach((y) => el('line', { x1: -14, y1: y, x2: 14, y2: y, stroke: OFF, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g));
    if (name) tx(0, 52, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  // 시간 막대 하나: x 부터 w 만큼, g(0→1) 만큼 자란다
  function blk(x, y, w, h, text, col, g, o) { o = o || {}; if (g <= 0) return;
    el('rect', { x, y, width: Math.max(2, w * g), height: h, rx: 6, fill: o.fill || col, opacity: o.op ?? 1, stroke: o.stroke || 'none', 'stroke-width': 1.8, 'stroke-dasharray': o.dash });
    if (text && g > 0.7) tx(x + w / 2, y + h / 2 + 5, text, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: o.color || PANEL, opacity: clamp((g - 0.7) * 4) }); }

  // ---------- 1. 세 얼굴: 메인 스레드와 libuv ----------
  const L = { x0: 190, x1: 780, ym: 132, yu: 246, h: 40 };
  function lanes(uvOp) {
    el('rect', { x: L.x0, y: L.ym, width: L.x1 - L.x0, height: L.h, rx: 8, fill: SOFT });
    el('rect', { x: L.x0, y: L.yu, width: L.x1 - L.x0, height: L.h, rx: 8, fill: SOFT, opacity: uvOp });
    tx(40, L.ym + 18, '메인 스레드', { 'font-size': 15, 'font-weight': 700 }); tx(40, L.ym + 37, 'JS는 여기서만 돈다', { 'font-size': 13.5, fill: MUT });
    tx(40, L.yu + 18, 'libuv', { 'font-size': 15, 'font-weight': 700, opacity: uvOp }); tx(40, L.yu + 37, '파일 읽기 담당', { 'font-size': 13.5, fill: MUT, opacity: uvOp });
    el('line', { x1: L.x0, y1: 318, x2: L.x1, y2: 318, stroke: MUT, 'stroke-width': 1.5, 'marker-end': 'url(#ra-ah)' }); tx(L.x1, 338, '시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    fileIcon(880, 210, 'config.json'); }
  function others(x, n, g, col) { for (let i = 0; i < n; i++) blk(x + i * 62, L.ym + 6, 54, L.h - 12, '다른 일', col || GOOD, clamp(g * n - i)); }
  function s1(t, c) { const { k, u } = c;
    if (k === 5) return compare3(u);
    lanes(k === 0 ? 0.35 : 1);
    if (k === 0) { const g = E(u, 0.3, 1.8);
      pill(300, 52, 'fs.readFileSync(p, "utf8")', BAD, pop(u, 0.2), { mono: true, fs: 14 });
      blk(L.x0 + 8, L.ym + 4, 380, L.h - 8, 'readFileSync — 읽는 중', BAD, g);
      grow(L.x0 + 8 + 380 * g, L.ym + L.h / 2, 852, 196, g > 0.05 && g < 1 ? 1 : 0, BAD, { plain: true, dash: '4 4' });
      blk(L.x0 + 396, L.ym + 4, 110, L.h - 8, 'console.log', INK, E(u, 1.9, 2.3));
      pill(L.x0 + 451, 90, 'text — 그 자리에서 문자열', GOOD, pop(u, 2.0), { fs: 13.5 });
      [0, 1, 2].forEach((i) => { card(600 + i * 26, 214, 22, 22, { rx: 4, stroke: WARN, fill: WARNBG, s: pop(u, 0.6 + i * 0.2) }); });
      note(570, 252, '뒤에 온 일은 전부 대기', fade(u, 1.2), { fill: WARN });
      sub(L.x0 + 190, L.yu + 26, 'libuv 는 쓰지 않는다', 0.8); return; }
    const call = k <= 2 ? 'fs.readFile(p, "utf8", cb)' : 'await fsp.readFile(p, "utf8")';
    pill(300, 52, call, k <= 2 ? INFO : ACC, k === 1 || k === 3 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
    const g0 = k === 1 || k === 3 ? E(u, 0.3, 0.7) : 1;
    blk(L.x0 + 8, L.ym + 4, 74, L.h - 8, '호출', k <= 2 ? INFO : ACC, g0);
    grow(L.x0 + 45, L.ym + L.h, L.x0 + 100, L.yu, k === 1 || k === 3 ? E(u, 0.6, 0.9) : 1, MUT);
    const rd = k === 1 || k === 3 ? E(u, 0.8, 2.4) : 1;
    blk(L.x0 + 100, L.yu + 4, 340, L.h - 8, '파일 읽기', WARN, rd);
    if (rd > 0 && rd < 1) dot([[L.x0 + 100 + 340 * rd, L.yu + L.h / 2], [852, 214]], (t * 1.4) % 1, WARN, 5);
    others(L.x0 + 92, 5, k === 1 || k === 3 ? E(u, 0.9, 2.2) : 1);
    if (k === 1 || k === 2) { const cb = card(660, 64, 230, 56, { rx: 10, stroke: INFO, dash: k === 1 ? '6 5' : null, fill: INFOBG, s: k === 1 ? pop(u, 1.0) : 1 });
      mono(-100, -4, '(err, data) => {', { 'font-size': 14, fill: INFO, 'font-weight': 700 }, cb); mono(-86, 16, 'if (err) return …', { 'font-size': 13.5, fill: INK }, cb);
      if (k === 1) note(560, 110, '나중에 부를 함수 — 등록만', fade(u, 1.6), { fill: INFO, 'font-size': 14 }); }
    if (k === 2) { const d = E(u, 0.2, 0.9);
      dot([[L.x0 + 440, L.yu], [L.x0 + 470, L.ym + L.h]], d < 1 ? d : 0, INFO, 7);
      blk(L.x0 + 420, L.ym + 4, 130, L.h - 8, '콜백 실행', INFO, E(u, 0.9, 1.4));
      pill(L.x0 + 485, 222, 'data — 읽기 완료 후 도착', INFO, pop(u, 1.2), { fs: 13.5, fill: PANEL });
      el('path', { d: `M${L.x0 + 92},${L.ym - 8} V${L.ym - 16} H${L.x0 + 400} V${L.ym - 8}`, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.6) });
      note(L.x0 + 160, L.ym - 24, '그 사이 스레드는 자유', fade(u, 1.7), { fill: GOOD }); }
    if (k === 3 || k === 4) { const ful = k === 4 ? E(u, 0.9, 1.3) : 0;
      pill(640, 92, ful > 0.5 ? 'Promise ‹fulfilled›' : 'Promise ‹pending›', ful > 0.5 ? GOOD : WARN, k === 3 ? pop(u, 0.8) : 1, { mono: true, fs: 14, fill: PANEL });
      if (k === 3) { note(560, 56, 'fsp = 같은 fs, Promise 판', fade(u, 1.4), { fill: ACC, 'font-size': 14 });
        card(820, 56, 120, 34, { rx: 8, text: 'async load()', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.8) }); } }
    if (k === 4) { const d = E(u, 0.2, 0.9);
      dot([[L.x0 + 440, L.yu], [L.x0 + 470, L.ym + L.h]], d < 1 ? d : 0, ACC, 7);
      blk(L.x0 + 420, L.ym + 4, 150, L.h - 8, 'await 다음 줄', ACC, E(u, 0.9, 1.4));
      R.snippet(560, 346, ['const data = await fsp.readFile(p, "utf8");', 'console.log(data.length);'], { fs: 13.5, op: fade(u, 1.6) });
      note(40, 372, '콜백 없이 위에서 아래로', fade(u, 1.8), { fill: ACC }); }
  }
  function othersAt(x, y, n, g, col) { for (let i = 0; i < n; i++) blk(x + i * 62, y, 54, 26, '다른 일', col || GOOD, clamp(g * n - i)); }
  // 세 방식을 작은 시간선 셋으로 (1장면 마지막 beat)
  function compare3(u) {
    const rows = [['readFileSync', '스레드 점유 · 블로킹', BAD, 'sync'], ['readFile(cb)', '논블로킹 · 콜백 중첩', INFO, 'cb'], ['fs/promises', '논블로킹 · 평평한 코드', ACC, 'aw']];
    tx(480, 44, '같은 파일, 세 가지 모양', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    rows.forEach(([n, d, col, m], i) => { const y = 92 + i * 96, g = E(u, 0.2 + i * 0.4, 1.2 + i * 0.4), x0 = 230;
      mono(40, y + 22, n, { 'font-size': 15, 'font-weight': 700, fill: col });
      el('rect', { x: x0, y, width: 430, height: 34, rx: 6, fill: SOFT });
      if (m === 'sync') blk(x0 + 4, y + 4, 330, 26, '점유', BAD, g);
      else { blk(x0 + 4, y + 4, 40, 26, '', col, g); othersAt(x0 + 52, y + 4, 4, g); blk(x0 + 312, y + 4, 100, 26, m === 'cb' ? '콜백' : '재개', col, clamp(g * 2 - 1)); }
      tx(690, y + 22, d, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.6 + i * 0.4) }); });
    banner(480, 386, '기본값은 fs/promises + await · Sync 는 부팅 초기화에만', pop(u, 1.9)); }

  // ---------- 2. 이벤트 루프 점유 대비 ----------
  const RW = [{ y: 78, name: 'readFileSync', col: BAD }, { y: 238, name: 'fs/promises · await', col: ACC }];
  const TX0 = 360, PX = 46;   // 시간 막대 시작, 짧은 요청 하나의 폭
  function row(r, op) { const { y, name, col } = r;
    zone(24, y - 30, 912, r === RW[0] ? 132 : 158, null, { fill: SOFT, op });
    mono(44, y - 6, name, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op });
    tx(44, y + 16, r === RW[0] ? '동기 · 블로킹' : '비동기 · 콜백도 같다', { 'font-size': 13.5, fill: MUT, opacity: op });
    el('rect', { x: TX0, y: y - 18, width: 560, height: 40, rx: 6, fill: PANEL, stroke: GRID, opacity: op }); }
  function s2(t, c) { const { k, u } = c;
    row(RW[0], k === 3 ? 0.45 : 1); row(RW[1], k === 1 || k === 2 ? 0.45 : 1);
    const sy = RW[0].y, ay = RW[1].y;
    if (k === 0) { [sy, ay].forEach((y, j) => { [1, 2, 3, 4, 5].forEach((id, i) => card(250 + (i % 3) * 38, y - 8 + (i > 2 ? 28 : 0), 34, 24, { rx: 5, text: 'r' + id, fs: 13.5, mono: true, stroke: id === 2 ? WARN : INK, color: id === 2 ? WARN : INK, s: pop(u, 0.3 + i * 0.12 + j * 0.5) })); });
      pill(625, 186, 'r2 = 큰 파일 읽기 · 나머지는 짧은 요청', WARN, pop(u, 1.6), { fs: 13.5, fill: PANEL });
      note(TX0 + 10, sy + 6, '같은 요청 5개를 두 서버에 보낸다', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); return; }
    // 동기 줄
    const sg = k === 1 ? E(u, 0.3, 2.4) : k >= 2 ? 1 : 0;
    if (k >= 1) { blk(TX0 + 4, sy - 14, PX, 32, 'r1', INK, k === 1 ? E(u, 0.2, 0.4) : 1);
      blk(TX0 + 54, sy - 14, 300, 32, 'r2 · readFileSync', BAD, k === 1 ? E(u, 0.5, 2.4) : 1);
      const wait = k === 1 ? Math.round(lerp(0, 3, E(u, 0.6, 1.6))) : k === 2 ? 3 - Math.round(3 * E(u, 1.1, 2.2)) : 0;
      for (let i = 0; i < wait; i++) card(250 + i * 30, sy + 6, 26, 24, { rx: 4, text: String(i + 3), fs: 13.5, mono: true, stroke: WARN, color: WARN, fill: WARNBG });
      if (k === 1) note(232, sy + 46, '대기 중 ' + wait + '건', fade(u, 0.8), { fill: WARN, 'font-size': 14 }); }
    if (k >= 2) { const g = k === 2 ? E(u, 1.1, 2.2) : 1;
      [3, 4, 5].forEach((id, i) => blk(TX0 + 360 + i * 52, sy - 14, PX, 32, 'r' + id, INK, clamp(g * 3 - i)));
      const a = k === 2 ? fade(u, 0.2) : 1;
      mono(TX0 + 54, sy + 40, 'A', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: a, 'text-anchor': 'middle' }); mono(TX0 + 354, sy + 40, 'B', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: a, 'text-anchor': 'middle' });
      el('path', { d: `M${TX0 + 66},${sy + 35} H${TX0 + 342}`, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: a });
      if (k === 2) note(TX0 + 112, sy + 68, '이 사이 서버 전체가 멈춘다', fade(u, 0.6), { fill: BAD }); }
    // 비동기 줄
    if (k >= 3) { const uu = k === 3 ? u : 3;
      blk(TX0 + 4, ay - 14, PX, 32, 'r1', INK, E(uu, 0.2, 0.4));
      blk(TX0 + 54, ay - 14, 40, 32, 'r2', ACC, E(uu, 0.4, 0.6));
      el('rect', { x: TX0, y: ay + 34, width: 560, height: 34, rx: 6, fill: PANEL, stroke: GRID });
      tx(TX0 - 14, ay + 57, 'libuv', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
      grow(TX0 + 74, ay + 18, TX0 + 90, ay + 34, E(uu, 0.55, 0.75), MUT);
      blk(TX0 + 90, ay + 38, 300, 26, 'r2 파일 읽기', WARN, E(uu, 0.7, 2.4));
      [3, 4, 5].forEach((id, i) => blk(TX0 + 100 + i * 52, ay - 14, PX, 32, 'r' + id, INK, E(uu, 0.8 + i * 0.25, 1.0 + i * 0.25)));
      blk(TX0 + 396, ay - 14, 76, 32, 'r2 끝', ACC, E(uu, 2.4, 2.6));
      if (k === 3) note(TX0 + 270, ay - 24, '스레드는 바로 다음 요청으로', fade(u, 1.2), { fill: GOOD, 'font-size': 14 });
      if (k === 3) { mono(TX0 + 54, ay + 92, '1', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) }); } }
    if (k === 4) { mono(TX0 + 54, ay + 92, '1', { 'font-size': 16, 'font-weight': 800, fill: ACC }); mono(TX0 + 434, ay + 92, '2', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      note(TX0 + 74, ay + 92, '즉시 찍힘', 1, { 'font-size': 14, fill: MUT }); note(TX0 + 454, ay + 92, '읽기가 끝나면', fade(u, 0.4), { 'font-size': 14, fill: MUT });
      const m = E(u, 0.8, 2.0);
      tx(44, 388, '실측 예 · 200MB 파일을 읽는 동안 1ms 타이머가 돈 횟수', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.7) });
      R.hbar(560, 362, 200, Math.round(0 * m), 362, { col: BAD, text: 'Sync 0회 (654ms)', h: 14, u: m });
      R.hbar(560, 386, 200, Math.round(362 * m), 362, { col: ACC, text: 'await ' + Math.round(362 * m) + '회 (1004ms)', h: 14 }); } }

  // ---------- 3. 쓰기 · 목록 · 폴더 · stat · 인코딩 ----------
  // 왼쪽: 프로젝트 폴더 나무. rows: [이름, 깊이, 보이기(0~1), 색]
  function tree(rows) { zone(28, 40, 330, 344, './ (프로젝트 폴더)', { fill: SOFT });
    rows.forEach(([n, d, s, col], i) => { if (s <= 0) return; const y = 88 + i * 40, x = 52 + d * 28, dir = n.endsWith('/');
      const g = R.G(x, y, 0.6 + 0.4 * s, s);
      if (dir) el('path', { d: 'M0,-10 H9 L13,-6 H26 V10 H0 Z', fill: col === INK ? PANEL : col === GOOD ? GOODBG : ACCBG, stroke: col, 'stroke-width': 2 }, g);
      else el('path', { d: 'M3,-12 H16 L21,-7 V12 H3 Z', fill: PANEL, stroke: col, 'stroke-width': 2 }, g);
      mono(34, 5, n, { 'font-size': 15, 'font-weight': 700, fill: col }, g); }); }
  function s3(t, c) { const { k, u } = c;
    const T = [['out.txt', 0, k === 0 ? pop(u, 0.3) : 1, k === 0 ? GOOD : INK], ['app.log', 0, 1, k === 0 ? ACC : INK], ['data/', 0, 1, k === 1 ? ACC : INK], ['a.json', 1, 1, k === 1 ? ACC : INK], ['b.csv', 1, 1, k === 1 ? ACC : INK],
      ['cache/', 0, k < 2 ? 0 : k === 2 ? pop(u, 0.5) : 1, k === 2 ? GOOD : INK], ['img/', 1, k < 2 ? 0 : k === 2 ? pop(u, 0.5) : 1, k === 2 ? GOOD : INK]];
    tree(T);
    if (k === 0) { mono(400, 62, 'writeFile — 통째로 덮어쓴다', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      const g = R.G(400, 76); el('rect', { x: 0, y: 0, width: 300, height: 54, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }, g);
      mono(16, 33, '(이전 내용)', { 'font-size': 14.5, fill: OFF, opacity: 1 - fade(u, 0.6), 'text-decoration': 'line-through' }, g);
      mono(16, 33, '"hello"'.slice(0, Math.round(7 * E(u, 0.9, 1.6))), { 'font-size': 14.5, 'font-weight': 700, fill: GOOD }, g);
      mono(400, 190, 'appendFile — 끝에 이어 붙인다', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      const g2 = R.G(400, 204); el('rect', { x: 0, y: 0, width: 360, height: 128, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }, g2);
      ['요청 도착', '요청 도착'].forEach((s, i) => mono(16, 30 + i * 30, s, { 'font-size': 14.5, fill: MUT }, g2));
      const a = E(u, 1.5, 2.2); if (a > 0) { el('rect', { x: 8, y: 70, width: 344 * a, height: 30, rx: 5, fill: ACCBG }, g2); mono(16, 90, '요청 도착  ← 새 줄', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: a }, g2); }
      note(400, 366, '로그에 writeFile 을 쓰면 앞 내용이 사라진다', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 1) { mono(400, 70, 'await fsp.readdir("./data")', { 'font-size': 15, 'font-weight': 700 });
      ['a.json', 'b.csv'].forEach((n, i) => fly(110, 208 + i * 40, 520 + i * 130, 140, seg(u, 0.4 + i * 0.3, 1.3 + i * 0.3), n, { mono: true }));
      const s = fade(u, 1.5);
      mono(420, 146, '[', { 'font-size': 22, fill: INK, opacity: s }); pill(520, 140, "'a.json'", ACC, s, { mono: true, fs: 14, fill: PANEL }); pill(650, 140, "'b.csv'", ACC, s, { mono: true, fs: 14, fill: PANEL }); mono(720, 146, ']', { 'font-size': 22, opacity: s });
      note(420, 214, '이름만 온다 — 경로가 아니다', fade(u, 1.8), { fill: WARN });
      mono(420, 256, 'path.join("./data", name)', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 2.2) }); sub(640, 290, '열 때는 폴더 경로를 붙인다', fade(u, 2.3)); return; }
    if (k === 2) { mono(400, 70, 'mkdir("./cache/img", { recursive: true })', { 'font-size': 14.5, 'font-weight': 700 });
      card(560, 150, 300, 48, { rx: 10, text: '1회째 · cache/ 와 img/ 를 함께 만든다', fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 0.6) });
      card(560, 220, 300, 48, { rx: 10, text: '2회째 · 이미 있음 → 에러 없이 통과', fs: 14, stroke: ACC, color: ACC, s: pop(u, 1.5) }); check(394, 220, 10, pop(u, 1.6));
      note(400, 300, '존재 확인 후 생성하는 코드가 따로 필요 없다', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 3) { const g = R.G(400, 50, pop(u, 0.2)); el('rect', { x: 0, y: 0, width: 260, height: 104, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 }, g);
      mono(16, 26, 'stat("./out.txt")', { 'font-size': 14, 'font-weight': 700, fill: MUT }, g);
      mono(16, 56, 'size     5', { 'font-size': 15, 'font-weight': 700 }, g); mono(16, 84, 'isFile() true', { 'font-size': 15, 'font-weight': 700, fill: GOOD }, g);
      mono(690, 74, 'readFile(p, "utf8")', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) });
      pill(760, 116, "'hello'  문자열", GOOD, pop(u, 1.1), { mono: true, fs: 14, fill: PANEL });
      mono(400, 206, 'readFile(p)  — 인코딩 없음', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      mono(400, 248, '<Buffer', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      cells(476, 226, ['68', '65', '6c', '6c', '6f'], { w: 44, h: 36, gap: 6, style: (i) => ({ stroke: WARN, s: pop(u, 1.6 + i * 0.1) }) });
      mono(726, 248, '>', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) });
      note(400, 306, '텍스트면 "utf8" 을 준다 · 이미지·zip 은 일부러 뺀다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k === 4: 존재 확인
    mono(400, 62, 'exists(p) = try { await stat(p) } catch', { 'font-size': 14.5, 'font-weight': 700 });
    [['./out.txt', true], ['./nope.txt', false]].forEach(([p, ok], i) => { const y = 128 + i * 96, a = E(u, 0.3 + i * 0.8, 1.0 + i * 0.8);
      mono(400, y + 5, p, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.8) });
      grow(520, y, 620, y, a, ok ? GOOD : BAD);
      card(690, y, 120, 40, { rx: 8, text: ok ? 'stat 성공' : 'throw ENOENT', fs: 13.5, mono: true, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, s: pop(u, 0.9 + i * 0.8) });
      grow(752, y, 800, y, E(u, 1.1 + i * 0.8, 1.4 + i * 0.8), ok ? GOOD : BAD);
      mono(812, y + 6, ok ? 'true' : 'false', { 'font-size': 16, 'font-weight': 800, fill: ok ? GOOD : BAD, opacity: fade(u, 1.4 + i * 0.8) }); });
    mono(400, 350, 'fs.exists', { 'font-size': 15, 'font-weight': 700, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 2.2) });
    note(490, 350, '폐기 — 확인과 사용 사이에 파일이 바뀔 수 있다', fade(u, 2.3), { fill: MUT, 'font-size': 14 }); }

  // ---------- 4. path 모듈 ----------
  function seps(x, y, s, col, a, fs) { fs = fs || 16; let xx = x; [...s].forEach((ch) => { const sep = ch === '/' || ch === '\\';
      tx(xx, y, ch, { 'font-size': fs, class: 'mono', 'font-weight': sep ? 800 : 600, fill: sep ? col : INK, opacity: a }); xx += fs * 0.6; }); return xx; }
  function s4(t, c) { const { k, u } = c, segs = (c.beat.path && c.beat.path.segments) || [];
    if (k === 0) { tx(40, 54, '문자열을 + 로 이을 때', { 'font-size': 17, 'font-weight': 800 });
      [['"./data"', '"/"', '"list.json"', './data/list.json', GOOD, '이번엔 맞다'], ['"./data/"', '', '"/list.json"', './data//list.json', BAD, '슬래시가 겹친다'], ['"./data"', '', '"list.json"', './datalist.json', BAD, '슬래시가 빠진다']].forEach(([a, b, d, out, col, why], i) => {
        const y = 118 + i * 82, s = pop(u, 0.3 + i * 0.55);
        pill(110, y, a, INK, s, { mono: true, fs: 14 }); if (b) pill(210, y, b, INK, s, { mono: true, fs: 14 }); pill(b ? 330 : 240, y, d, INK, s, { mono: true, fs: 14 });
        tx(b ? 168 : 182, y + 6, '+', { 'font-size': 18, 'font-weight': 800, fill: MUT, opacity: s, 'text-anchor': 'middle' }); if (b) tx(258, y + 6, '+', { 'font-size': 18, 'font-weight': 800, fill: MUT, opacity: s, 'text-anchor': 'middle' });
        grow(420, y, 480, y, E(u, 0.6 + i * 0.55, 0.9 + i * 0.55), col);
        mono(496, y + 6, out, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, 0.9 + i * 0.55) });
        tx(760, y + 6, why, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.55) }); });
      note(40, 384, '구분자도 OS 마다 다르다 — 윈도우는 \\', fade(u, 2.2), { fill: WARN }); return; }
    // 조각 → path.join → 결과
    const sh = k === 1 ? E(u, 0.2, 1.6) : 1;
    segs.forEach((s, i) => { const x = 80 + i * 150, a = clamp(sh * segs.length - i);
      pill(x + 40, 64, i === 0 ? s : `"${s}"`, i === 0 ? ACC : INK, 0.7 + 0.3 * a, { mono: true, fs: 14, op: 0.4 + 0.6 * a });
      if (k === 1) dot([[x + 40, 82], [380, 136]], seg(u, 0.4 + i * 0.25, 1.0 + i * 0.25), ACC, 6); });
    card(380, 150, 150, 44, { rx: 10, text: 'path.join', fs: 16, mono: true, stroke: ACC, color: ACC, fill: ACCBG });
    tx(560, 156, '__dirname = 이 파일이 있는 폴더 (예: /app)', { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 1.2) : 1 });
    const lx = 60, ly = 240, out = '/app/data/users/list.json', win = 'C:\\app\\data\\users\\list.json';
    if (k === 1) { grow(380, 172, 380, 210, E(u, 1.4, 1.7), ACC); const n = Math.round(out.length * E(u, 1.7, 2.6));
      seps(lx + 140, ly, out.slice(0, n), ACC, 1); tx(lx, ly, '결과', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      note(lx, ly + 50, '구분자와 겹친 슬래시는 path 가 정리한다', fade(u, 2.4), { 'font-size': 14.5, fill: MUT }); return; }
    if (k === 2) { const flip = Math.floor(t * 1.2) % 2;
      tx(lx, ly, 'Linux · macOS', { 'font-size': 15, 'font-weight': 700, fill: flip === 0 ? GOOD : MUT }); seps(lx + 160, ly, out, GOOD, flip === 0 ? 1 : 0.45);
      tx(lx, ly + 52, 'Windows', { 'font-size': 15, 'font-weight': 700, fill: flip === 1 ? INFO : MUT, opacity: fade(u, 0.4) }); seps(lx + 160, ly + 52, win, INFO, (flip === 1 ? 1 : 0.45) * fade(u, 0.4));
      banner(480, 360, '코드는 그대로 · 구분자만 OS 를 따른다', pop(u, 1.4)); return; }
    if (k === 3) { tx(lx, ly, '결과', { 'font-size': 15, 'font-weight': 700, fill: MUT }); const x0 = lx + 140, cw = 16 * 0.6;
      seps(x0, ly, out, ACC, 1);
      const bi = out.lastIndexOf('/') + 1, ei = out.lastIndexOf('.');
      const b1 = E(u, 0.3, 1.0), b2 = E(u, 1.2, 1.9);
      el('path', { d: `M${x0 + bi * cw},${ly + 10} V${ly + 18} H${x0 + out.length * cw} V${ly + 10}`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: b1 });
      pill(x0 + (bi + out.length) / 2 * cw + 40, ly + 52, 'basename → "list.json"', INFO, b1, { mono: true, fs: 14, fill: PANEL });
      el('path', { d: `M${x0 + ei * cw},${ly - 22} V${ly - 30} H${x0 + out.length * cw} V${ly - 22}`, fill: 'none', stroke: WARN, 'stroke-width': 2.2, opacity: b2 });
      pill(x0 + out.length * cw + 110, ly - 30, 'extname → ".json"', WARN, b2, { mono: true, fs: 14, fill: PANEL });
      note(lx, ly + 116, 'split("/") 로 자르면 윈도우에서 깨진다', fade(u, 2.2), { fill: MUT, 'font-size': 14.5 }); return; }
    // k === 4: resolve 는 cwd 기준
    el('rect', { x: 0, y: 200, width: 960, height: 220, fill: PANEL });
    mono(lx, 232, 'path.resolve("data", "a.txt")', { 'font-size': 15, 'font-weight': 700, fill: WARN });
    [['/app', '/app/data/a.txt'], ['/home/kim', '/home/kim/data/a.txt']].forEach(([cwd, r], i) => { const y = 280 + i * 44, a = fade(u, 0.4 + i * 0.6);
      tx(lx, y, `cwd = ${cwd} 에서 실행`, { 'font-size': 14.5, fill: MUT, opacity: a }); grow(lx + 260, y - 5, lx + 320, y - 5, E(u, 0.5 + i * 0.6, 0.8 + i * 0.6), WARN);
      mono(lx + 334, y, r, { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: a }); });
    tx(620, 290, 'join(__dirname, …) 은', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
    tx(620, 314, '어디서 실행해도 같은 파일', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
    sub(480, 396, '(경로 값은 예시)', fade(u, 2.2)); }

  // ---------- 5. 실무 기본형 readConfig ----------
  const TRAPS = ['요청 경로의 ...Sync', '경로 문자열 + 연결', '인코딩 누락', '에러 미처리'];
  function s5(t, c) { const { k, u } = c;
    // 오른쪽 함정 체크리스트: beat k 까지 해결
    zone(660, 36, 276, 228, '실무 함정 4가지', { fill: SOFT });
    const solved = [0, 1, 2, 3].map((i) => (k === 0 ? (i === 0 ? E(u, 0.8, 1.2) : 0) : k === 1 ? (i <= 0 ? 1 : i === 1 ? E(u, 1.2, 1.6) : 0) : k === 2 ? (i <= 1 ? 1 : i === 2 ? E(u, 1.4, 1.8) : 0) : k === 3 ? (i <= 2 ? 1 : i === 3 ? E(u, 1.6, 2.0) : 0) : 1));
    TRAPS.forEach((s, i) => { const y = 84 + i * 44, d = solved[i];
      tx(690, y + 5, s, { 'font-size': 15, 'font-weight': 700, fill: d > 0.5 ? GOOD : BAD });
      if (d > 0) check(904, y, 9, d); else cross(904, y, 7, 1); });
    // 위: readConfig 의 흐름
    const st = [['path.join', '(__dirname, …)'], ['readFile', '(p, "utf8")'], ['JSON.parse', '(raw)'], ['return', '설정 객체']];
    const on = [k >= 1, k >= 2, k >= 2, k >= 4 || k === 2];
    st.forEach(([a, b], i) => { const x = 92 + i * 148, s = on[i] ? (k === [1, 2, 2, 2][i] && k !== 4 ? pop(u, 0.3 + (i === 2 ? 0.5 : i === 3 ? 0.9 : 0)) : 1) : 0;
      if (s <= 0) { card(x, 110, 132, 60, { rx: 10, stroke: GRID, dash: '5 5', fill: PANEL }); return; }
      const g = card(x, 110, 132, 60, { rx: 10, stroke: i === 3 ? GOOD : ACC, fill: i === 3 ? GOODBG : ACCBG, s });
      mono(0, -4, a, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: i === 3 ? GOOD : ACC }, g); mono(0, 16, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g);
      if (i > 0) grow(x - 140 + 66, 110, x - 66, 110, s, ACC); });
    tx(28, 64, 'async readConfig()', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    if (k === 0) { ['fs/promises', 'path'].forEach((m, i) => pill(140 + i * 170, 230, `require("${m}")`, ACC, pop(u, 0.2 + i * 0.4), { mono: true, fs: 14, fill: PANEL }));
      note(60, 300, '비동기 fs 와 OS 독립 경로, 이 둘로 시작한다', fade(u, 1.4)); return; }
    if (k === 1) { [['/app 에서 실행', 0], ['/home/kim 에서 실행', 1]].forEach(([s, i]) => { const y = 228 + i * 50, a = fade(u, 0.8 + i * 0.4);
        tx(40, y, s, { 'font-size': 14.5, fill: MUT, opacity: a }); grow(220, y - 5, 300, y - 5, E(u, 0.9 + i * 0.4, 1.2 + i * 0.4), ACC); });
      fileIcon(360, 250, '/app/config.json', { s: pop(u, 1.6) }); note(40, 350, '파일 기준 경로라 실행 위치가 달라도 같은 파일', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 2) { cells(60, 220, ['7b', '22', '70', '6f', '72', '74'], { w: 40, h: 34, gap: 4, style: (i) => ({ stroke: WARN, op: 1 - 0.65 * E(u, 1.0, 1.5) }) });
      grow(330, 237, 380, 237, E(u, 0.8, 1.2), ACC);
      mono(396, 243, "'{\"port\":3000}'", { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      note(60, 300, '"utf8" 덕분에 Buffer 가 아니라 문자열이 온다', fade(u, 1.6));
      el('rect', { x: 26, y: 46, width: 600, height: 132, rx: 12, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 2.0) });
      tx(600, 196, 'try { … }', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: INFO, 'text-anchor': 'end', opacity: fade(u, 2.0) }); return; }
    if (k === 3) { el('rect', { x: 26, y: 46, width: 600, height: 132, rx: 12, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      grow(240, 140, 240, 222, E(u, 0.2, 0.6), BAD); card(240, 246, 170, 44, { rx: 22, text: 'catch (err)', fs: 14.5, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.5) });
      grow(240, 268, 150, 330, E(u, 0.9, 1.3), GOOD); grow(240, 268, 380, 330, E(u, 1.4, 1.8), BAD);
      card(150, 356, 210, 44, { rx: 10, text: 'ENOENT → return {}', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.2) });
      card(420, 356, 210, 44, { rx: 10, text: '그 외 → throw err', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.7) });
      sub(420, 396, '권한·디스크 오류는 위로 알린다', fade(u, 2.2)); return; }
    // k === 4: 크기에 따라
    tx(40, 236, '파일 크기에 따라', { 'font-size': 16, 'font-weight': 800 });
    [['config.json · 수 KB', 0.03, GOOD, 'readFile 그대로'], ['로그·영상 · 수 GB', 1, BAD, '스트림으로 (III-2-2)']].forEach(([n, f, col, how], i) => { const y = 274 + i * 56, g = E(u, 0.3 + i * 0.5, 1.3 + i * 0.5);
      tx(40, y + 14, n, { 'font-size': 14.5, 'font-weight': 700 }); el('rect', { x: 240, y, width: 260, height: 20, rx: 4, fill: SOFT }); el('rect', { x: 240, y, width: Math.max(4, 260 * f * g), height: 20, rx: 4, fill: col });
      tx(520, y + 15, how, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.5) }); });
    tx(40, 400, 'readFile 은 파일 전체를 메모리에 올린다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'fs.readFile과 fs.promises.readFile의 차이는 무엇인가?',
      o: ['둘 다 논블로킹이고 결과를 받는 모양만 다르다', 'readFile이 더 빠르고 promises 판은 느리다', 'promises 판은 메인 스레드를 붙든다'], a: 0,
      why: '둘 다 읽기를 libuv에 맡겨 스레드를 놓아준다. 콜백으로 받느냐 Promise로 받느냐가 다를 뿐이고, await로 받으면 코드가 평평해진다.' },
    { q: '요청 핸들러 안에서 readFileSync로 큰 파일을 읽으면 무슨 일이 생기는가?',
      o: ['그 요청만 느려지고 다른 요청은 정상이다', 'Node가 자동으로 비동기로 바꿔 준다', '읽는 동안 서버 전체가 다른 요청을 처리하지 못한다'], a: 2,
      why: 'JS는 메인 스레드 하나에서 돈다. 200MB 파일 실측에서 readFileSync 654ms 동안 1ms 타이머가 한 번도 돌지 못했다.' },
    { q: '인코딩 없이 fsp.readFile("./out.txt")를 부르면 무엇이 오는가?',
      o: ["문자열 'hello'", '파일 크기 5', '<Buffer 68 65 6c 6c 6f> 같은 바이트 덩어리'], a: 2,
      why: '인코딩을 빼면 원시 바이트인 Buffer가 온다. 텍스트라면 "utf8"을 줘야 문자열로 받는다.' },
    { q: 'path.join(__dirname, "config.json")을 쓰는 이유는 무엇인가?',
      o: ['어느 폴더에서 실행해도 이 파일 옆의 config.json을 가리키려고', '파일을 더 빨리 읽으려고', 'cwd를 기준으로 경로를 바꾸려고'], a: 0,
      why: '__dirname은 지금 파일이 있는 폴더의 절대 경로다. "./config.json"이나 path.resolve는 실행 위치(cwd)에 따라 가리키는 곳이 바뀐다.' },
    { q: 'readConfig의 catch에서 ENOENT만 기본값으로 넘기고 나머지는 다시 throw하는 이유는 무엇인가?',
      o: ['ENOENT가 가장 흔해서 나머지는 무시해도 되기 때문에', '권한 오류 같은 진짜 문제를 파일 없음으로 덮지 않으려고', 'throw를 해야 코드가 빨라지기 때문에'], a: 1,
      why: '모든 에러를 삼키면 권한·디스크 오류도 빈 설정으로 처리된다. err.code로 갈라야 문제를 알아챌 수 있다.' },
  ];
  const summary = [
    'fs는 같은 파일 읽기를 동기, 콜백, Promise 세 가지 모양으로 준다.',
    'readFileSync는 읽는 동안 메인 스레드를 붙들어 다른 요청을 모두 세운다.',
    '요청 경로에서는 fs/promises와 await를 쓰고 텍스트에는 "utf8"을 준다.',
    '경로는 path.join(__dirname, …)으로 만들고 에러는 err.code로 갈라 처리한다.',
  ];
  const review = [
    { q: '서버가 가끔 1초씩 멈춘다. 핸들러에서 readFileSync로 로그 파일을 읽고 있었다. 먼저 바꿀 것은?',
      o: ['서버 메모리를 늘린다', 'await fsp.readFile로 바꿔 읽는 동안 스레드를 놓아준다', 'readFile 콜백 안에 readFileSync를 넣는다'], a: 1,
      why: '멈춤의 원인은 읽기가 메인 스레드를 붙드는 것이다. 비동기로 바꾸면 읽기는 libuv가 맡고 다른 요청은 계속 처리된다.' },
    { q: 'npm start로 띄우면 되는데 다른 폴더에서 node src/app.js로 띄우면 설정 파일을 못 찾는다. 의심할 곳은?',
      o: ['"./config.json" 같은 cwd 기준 상대 경로', 'fs/promises 버전 문제', '설정 파일의 인코딩'], a: 0,
      why: '상대 경로는 실행 위치를 기준으로 풀린다. path.join(__dirname, "config.json")으로 바꾸면 실행 위치와 상관없이 같은 파일을 연다.' },
    { q: 'JSON.parse에서 이상한 에러가 나서 보니 raw가 <Buffer 7b 22 …>였다. 고칠 곳은?',
      o: ['JSON.parse 대신 eval을 쓴다', 'mkdir에 recursive를 준다', 'readFile에 "utf8" 인코딩을 넘긴다'], a: 2,
      why: '인코딩을 빼면 문자열이 아니라 Buffer가 온다. 원인은 parse보다 앞의 readFile 호출에 있다.' },
  ];

  R.page({ title: 'fs와 path — 스레드·파일·경로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
