/* IV-1-1 파일 IO·pathlib — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽 파이썬 프로세스(이름표 f → 파일 객체), 가운데 OS 의 열린 파일 표(fd), 오른쪽 디스크의 파일.
 * 숫자: 페이지 코드의 출력 주석, 그리고 python 3.12 로 직접 잰 값(8.2MB·20만 줄 로그의 tracemalloc 최대 메모리 등). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cells, zone, cross, check, lock, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  // 파일 한 장(귀 접힌 종이). rows: [{ t: 글자, col, w: 막대 길이 0~1, op }]
  function fileDoc(cx, cy, w, h, name, rows, o) { o = o || {}; const x = cx - w / 2, y = cy - h / 2, sc = o.stroke || INK;
    el('path', { d: `M${x},${y} H${x + w - 18} L${x + w},${y + 18} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: sc, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    el('path', { d: `M${x + w - 18},${y} V${y + 18} H${x + w}`, fill: 'none', stroke: sc, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    if (name) mono(cx, y + h + 20, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.nameCol || INK, opacity: o.op ?? 1 });
    const lh = o.lh || 22;
    (rows || []).forEach((r, i) => { const yy = y + 26 + i * lh, op = (r.op ?? 1) * (o.op ?? 1); if (op <= 0.02) return;
      if (r.t != null) mono(x + 12, yy + 5, r.t, { 'font-size': r.fs || 13.5, fill: r.col || INK, opacity: op, 'font-weight': r.fw });
      else el('rect', { x: x + 12, y: yy - 5, width: Math.max(0, (w - 34) * (r.w ?? 0.8)), height: 9, rx: 4, fill: r.col || OFF, opacity: op }); }); }
  // 변수 이름표: 고리 구멍이 있는 꼬리표
  function nameTag(x, y, name, s, col) { const g = R.G(x, y, s ?? 1), w = tw(name, 16) + 34;
    el('path', { d: `M${-w / 2},-15 H${w / 2 - 10} L${w / 2},0 L${w / 2 - 10},15 H${-w / 2} Z`, fill: col ? ACCBG : PANEL, stroke: col || INK, 'stroke-width': 2 }, g);
    el('circle', { cx: -w / 2 + 10, cy: 0, r: 3.5, fill: 'none', stroke: col || INK, 'stroke-width': 1.5 }, g);
    mono(4, 6, name, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col || INK }, g); return w; }
  // OS 열린 파일 표의 한 줄
  function fdRow(x, y, fd, name, st) { st = st || {}; const op = st.op ?? 1; if (op <= 0.02) return;
    el('rect', { x, y, width: 190, height: 30, rx: 6, fill: st.fill || ACCBG, stroke: st.stroke || ACC, 'stroke-width': 1.8, opacity: op });
    mono(x + 12, y + 20, 'fd ' + fd, { 'font-size': 14.5, 'font-weight': 800, fill: st.stroke || ACC, opacity: op });
    mono(x + 70, y + 20, name, { 'font-size': 14, fill: INK, opacity: op, 'text-decoration': st.strike ? 'line-through' : null }); }
  // with 블록 흐름 띠: open · 블록 안 작업 · close
  function withStrip(on, o) { o = o || {}; const y = 350, xs = [150, 480, 810], names = ['open()', '블록 안 작업', 'close()'];
    el('line', { x1: 70, y1: y, x2: 890, y2: y, stroke: GRID, 'stroke-width': 3 });
    names.forEach((n, i) => { const st = (o.st && o.st[i]) || (i < on ? 'done' : i === on ? 'cur' : 'idle');
      const col = st === 'bad' ? BAD : st === 'skip' ? OFF : st === 'idle' ? OFF : st === 'cur' ? ACC : INK;
      card(xs[i], y, 170, 40, { rx: 20, fill: st === 'cur' ? ACCBG : st === 'bad' ? BADBG : PANEL, stroke: col, sw: st === 'cur' ? 2.6 : 1.8, text: n, fs: 15, color: col, dash: st === 'skip' ? '5 5' : null, s: o.pop && i === on ? pop(o.u, 0.2) : 1 }); });
    if (o.label) sub(480, y + 44, o.label, o.lop ?? 1, { 'font-size': 14 }); }

  const P = { tagX: 72, objX: 245, rowY: 78, fdX: 400, docX: 790 };
  function scaffold(o) { o = o || {};
    zone(20, 20, 340, 270, '파이썬 프로세스'); zone(380, 20, 230, 270, '운영체제 · 열린 파일 표'); tx(700, 42, '디스크', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    fileDoc(P.docX, 150, 150, 170, 'notes.txt', [{ w: 0.8 }, { w: 0.55 }, { w: 0.7 }, { w: 0.4 }, { w: 0.65 }], { op: o.docOp }); }
  function fileObj(st, s) { st = st || {};
    card(P.objX, P.rowY + 14, 196, 78, { rx: 10, stroke: st.closed ? MUT : ACC, sw: 2.2, fill: st.closed ? SOFT : PANEL, s });
    if (s > 0.6) { mono(P.objX, P.rowY - 6, 'TextIOWrapper', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: st.closed ? MUT : INK });
      mono(P.objX, P.rowY + 16, st.closed ? 'closed = True' : "mode = 'r'", { 'font-size': 14, 'text-anchor': 'middle', fill: st.closed ? BAD : INK });
      mono(P.objX, P.rowY + 38, "encoding = 'utf-8'", { 'font-size': 14, 'text-anchor': 'middle', fill: st.closed ? MUT : ACC, 'font-weight': 700 }); } }

  // ---------- 1. open() + with ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { scaffold();
      const a = k === 0 ? pop(u, 0.2) : 1; nameTag(P.tagX, P.rowY + 14, 'f', a);
      grow(P.tagX + 26, P.rowY + 14, P.objX - 100, P.rowY + 14, k === 0 ? E(u, 0.5, 0.8) : 1, INK);
      fileObj({ closed: k === 2 && u > 0.9 }, k === 0 ? pop(u, 0.7) : 1);
      const fdOp = k < 2 ? (k === 0 ? fade(u, 1.2) : 1) : 1 - E(u, 0.9, 1.6);
      fdRow(P.fdX, P.rowY, 3, 'notes.txt', { op: fdOp });
      if (fdOp > 0.05) { grow(P.objX + 98, P.rowY + 14, P.fdX - 4, P.rowY + 15, k === 0 ? E(u, 1.3, 1.7) : fdOp, ACC); grow(P.fdX + 194, P.rowY + 15, P.docX - 80, 110, k === 0 ? E(u, 1.6, 2.0) : fdOp, ACC); }
      if (k === 0) { pill(P.fdX + 95, 150, '빌린 OS 자원', WARN, pop(u, 2.0), { fs: 14 }); withStrip(0, { pop: true, u }); }
      if (k === 1) { card(P.objX - 50, 210, 190, 64, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.2) });
        mono(P.objX - 135, 196, 'text', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) }); mono(P.objX + 35, 196, 'str', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3) });
        for (let i = 0; i < 4; i++) { const g = E(u, 0.6 + i * 0.3, 1.0 + i * 0.3); el('rect', { x: P.objX - 135, y: 207 + i * 13 - 4, width: 150 * [0.8, 0.55, 0.7, 0.4][i] * g, height: 8, rx: 4, fill: ACC, opacity: 0.8 }); }
        for (let i = 0; i < 4; i++) dot([[P.docX - 60, 120 + i * 22], [P.fdX + 100, 175], [P.objX + 45, 215]], seg(u, 0.4 + i * 0.3, 1.4 + i * 0.3), ACC, 5);
        sub(P.fdX + 115, 268, 'f.read() — 본문이 str 로', fade(u, 1.6), { 'font-size': 14 }); withStrip(1, { pop: true, u }); }
      if (k === 2) { if (u > 1.2) { tx(P.fdX + 95, 135, 'fd 3 반납', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); check(P.fdX + 160, 130, 9, pop(u, 1.3)); }
        mono(40, 208, 'f.read()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
        mono(40, 236, 'ValueError: I/O operation', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) }); mono(40, 258, '            on closed file.', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) });
        sub(P.fdX + 115, 268, '예외가 나도 close 는 실행된다', fade(u, 2.2), { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
        withStrip(2, { pop: true, u, st: [null, null, u > 0.8 ? 'cur' : 'idle'] }); }
      return; }
    if (k === 3) { zone(20, 20, 470, 270, '파이썬 프로세스 — with 없이'); zone(510, 20, 430, 270, '운영체제 · 열린 파일 표');
      snippet(40, 50, ['f = open("notes.txt", "r", ...)', 'data = f.read()   # 여기서 예외', 'f.close()'], { w: 430, fs: 14.5 });
      const hit = u > 0.9; if (hit) { el('path', { d: 'M440,92 l-14,20 h12 l-10,22', fill: 'none', stroke: BAD, 'stroke-width': 3.5, 'stroke-linejoin': 'round', opacity: fade(u, 0.9) }); }
      cross(455, 138, 9, pop(u, 1.3)); tx(60, 170, 'close() 줄에 도달하지 못한다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
      const n = Math.floor(lerp(1, 7, E(u, 1.4, 2.6)));
      for (let i = 0; i < 7; i++) { const x = 530 + (i % 2) * 200, y = 50 + Math.floor(i / 2) * 40; if (i < n) fdRow(x, y, 3 + i, 'notes.txt', { fill: BADBG, stroke: BAD, op: i === n - 1 ? fade(u, 1.4 + i * 0.17, 0.2) : 1 }); }
      tx(60, 214, '같은 함수를 부를 때마다 fd 가 하나씩 남는다', { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.9) });
      pill(725, 238, 'Too many open files', BAD, pop(u, 2.4), { mono: true, fs: 14.5 });
      withStrip(1, { st: ['done', 'bad', 'skip'], label: '작업 중 예외 → close() 건너뜀 → fd 누수', lop: fade(u, 1.2) }); return; }
    if (k === 4) { const modes = [['"w"', '열자마자 비운다', 'w'], ['"a"', '끝에 이어 붙인다', 'a'], ['"x"', '있으면 거부한다', 'x']];
      lbl(480, 36, 'open("a.txt", 모드, encoding="utf-8")', fade(u, 0.1), { class: 'mono', 'font-size': 16 });
      modes.forEach(([m, d, key], i) => { const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.35), at = 0.6 + i * 0.5;
        pill(cx, 78, m, key === 'w' ? BAD : key === 'a' ? GOOD : INFO, s, { mono: true, fs: 16 });
        const wipe = key === 'w' ? 1 - E(u, at, at + 0.6) : 1, add = key === 'a' ? E(u, at, at + 0.6) : 0;
        fileDoc(cx, 200, 170, 150, 'a.txt', [{ w: 0.8 * wipe }, { w: 0.55 * wipe }, { w: 0.7 * wipe }, { w: 0.6 * add, col: ACC, op: add }], { stroke: key === 'x' && u > at + 0.3 ? BAD : INK });
        if (key === 'w') mono(cx, 315, 'getsize → 0', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, at + 0.6) });
        if (key === 'a') el('line', { x1: cx - 70, y1: 270, x2: cx - 70, y2: 290, stroke: ACC, 'stroke-width': 2.5, opacity: Math.floor(t * 3) % 2 ? 1 : 0.2 });
        if (key === 'x') { cross(cx, 195, 22, pop(u, at + 0.3)); mono(cx, 315, 'FileExistsError', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, at + 0.5) }); }
        sub(cx, 352, d, fade(u, at + 0.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); });
      sub(480, 396, '"w" 는 write() 가 아니라 open() 순간에 비운다 (직접 확인: 연 직후 0바이트)', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k === 5 바이너리
    fileDoc(110, 140, 130, 150, 'img.png', [{ w: 0.7 }, { w: 0.5 }, { w: 0.8 }, { w: 0.6 }]);
    mono(260, 70, 'open("img.png", "rb")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
    const hex = ['89', '50', '4E', '47', '0D', '0A', '1A', '0A'], n = Math.round(lerp(0, 8, E(u, 0.3, 1.3)));
    cells(260, 96, hex.map((h, i) => (i < n ? h : '')), { w: 44, h: 40, gap: 4, style: (i) => ({ stroke: i < n ? ACC : GRID, color: ACC }) });
    mono(260, 162, "f.read() → bytes  (b'\\x89PNG\\r\\n\\x1a\\n')", { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) });
    card(380, 250, 280, 64, { rx: 10, stroke: INK, sw: 2, s: pop(u, 1.4), text: '텍스트 "r" : bytes → 디코딩 → str\n바이너리 "rb" : bytes 그대로', fs: 14 });
    pill(800, 116, 'encoding="utf-8"', BAD, pop(u, 1.7), { mono: true, fs: 14.5 }); if (u > 1.9) el('line', { x1: 708, y1: 116, x2: 892, y2: 116, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.9) });
    mono(600, 236, 'ValueError: binary mode', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.1) }); mono(600, 260, "doesn't take an encoding argument", { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.1) });
    sub(800, 156, 'rb 에 넣으면 바로 예외', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 2. 읽기 4가지 ----------
  // 잰 값 (python 3.12, 8.2MB · 20만 줄 로그, tracemalloc 최대치)
  const MEM = { file: 8.2, read: 24.6, held: 8.0, lines: 17.8, iter: 0.03 };
  const LOG = ['2024-01-01 INFO  start', '2024-01-01 WARN  slow query', '2024-01-01 ERROR timeout', '2024-01-01 INFO  done', '2024-01-01 ERROR disk full', '2024-01-01 INFO  retry'];
  function logDoc(o) { o = o || {}; const rows = LOG.map((s, i) => ({ t: s, col: o.hot === i ? ACC : /ERROR/.test(s) && o.err ? BAD : INK, op: o.rowOp ? o.rowOp(i) : 1, fw: o.hot === i ? 800 : null }));
    rows.push({ t: '…  (수백만 줄)', col: MUT, op: o.rowOp ? o.rowOp(6) : 1 });
    fileDoc(160, 185, 270, 220, o.name || 'small.txt', rows, { lh: 26 });
    if (o.hot != null) el('rect', { x: 30, y: 92 + o.hot * 26, width: 260, height: 22, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.5 }); }
  function memGauge(v, lab, o) { o = o || {}; const x = 640, y = 330, w = 280;
    tx(x, y - 12, '메모리 최대', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    R.hbar(x, y, w, v, 25, { h: 20, col: v > 5 ? BAD : GOOD, text: lab, label: false });
    mono(x + w, y - 12, lab, { 'font-size': 15, 'font-weight': 800, fill: v > 5 ? BAD : GOOD, 'text-anchor': 'end' }); }
  function s2(t, c) { const { k, u } = c;
    zone(340, 20, 600, 290, '파이썬 메모리', { fill: SOFT });
    if (k === 0) { logDoc({ rowOp: (i) => 1 - 0.7 * E(u, 0.3 + i * 0.12, 0.6 + i * 0.12) });
      for (let i = 0; i < 7; i++) dot([[280, 110 + i * 26], [400, 130]], seg(u, 0.3 + i * 0.12, 0.8 + i * 0.12), ACC, 5);
      card(620, 130, 520, 70, { rx: 10, stroke: BAD, sw: 2.2, s: pop(u, 0.6) });
      mono(375, 118, 'whole', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.7) }); mono(865, 118, 'str 하나', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.7) });
      el('rect', { x: 375, y: 134, width: 490 * E(u, 0.7, 1.6), height: 14, rx: 7, fill: BAD, opacity: 0.75 });
      sub(620, 200, '파일 전체가 문자열 하나가 된다', fade(u, 1.4), { 'font-size': 15, fill: INK });
      mono(380, 250, '8.2MB 파일 → 남는 str 8.0MB, 읽는 순간 최대 24.6MB', { 'font-size': 14, opacity: fade(u, 1.8) });
      memGauge(MEM.read * E(u, 0.6, 2.0), (MEM.read * E(u, 0.6, 2.0)).toFixed(1) + 'MB'); return; }
    if (k === 1) { logDoc({ hot: 0, rowOp: (i) => (i === 0 ? 1 - 0.6 * E(u, 0.4, 0.9) : 1) });
      fly(290, 110, 520, 130, seg(u, 0.4, 1.2), '첫 줄', { mono: true });
      card(620, 130, 520, 70, { rx: 10, stroke: ACC, sw: 2.2, s: pop(u, 1.0) });
      mono(375, 118, 'first', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.1) });
      R.spans(375, 150, [["'2024-01-01 INFO  start", {}], ['\\n', { fill: ACC, 'font-weight': 800 }], ["'", {}]], { 'font-size': 15, opacity: fade(u, 1.2) });
      pill(700, 220, '끝에 \\n 이 붙어 온다', ACC, pop(u, 1.8), { fs: 14.5 }); sub(700, 262, '떼려면 line.rstrip()', fade(u, 2.1), { 'font-size': 14.5 });
      memGauge(0.001, '한 줄'); return; }
    if (k === 2) { logDoc({ rowOp: (i) => 1 - 0.7 * E(u, 0.3 + i * 0.12, 0.6 + i * 0.12) });
      mono(375, 62, 'lines  (list)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      for (let i = 0; i < 12; i++) { const x = 375 + (i % 4) * 136, y = 78 + Math.floor(i / 4) * 44, s = pop(u, 0.4 + i * 0.1);
        card(x + 62, y + 18, 124, 34, { rx: 6, stroke: BAD, sw: 1.6, s, text: i === 11 ? '…' : "'…\\n'", fs: 14, mono: true }); }
      sub(640, 232, '줄마다 str 객체가 따로 생긴다 (20만 줄 → 20만 개)', fade(u, 1.7), { 'font-size': 14.5, fill: INK });
      mono(380, 268, '들고 있는 메모리: read() 8.0MB < readlines() 17.8MB', { 'font-size': 14, opacity: fade(u, 2.0) });
      memGauge(MEM.lines * E(u, 0.4, 2.0), (MEM.lines * E(u, 0.4, 2.0)).toFixed(1) + 'MB'); return; }
    if (k === 3 || k === 4) { const i0 = k === 3 ? Math.min(5, Math.floor(E(u, 0.2, 2.6) * 6)) : Math.min(5, Math.floor(E(u, 0.2, 2.6) * 6)), err = k === 4;
      logDoc({ name: 'huge.log', hot: i0, err });
      card(620, 110, 520, 60, { rx: 10, stroke: ACC, sw: 2.2 });
      mono(375, 98, 'line', { 'font-size': 15, 'font-weight': 800 }); mono(375, 126, "'" + LOG[i0] + "\\n'", { 'font-size': 15, fill: /ERROR/.test(LOG[i0]) && err ? BAD : INK });
      grow(292, 103 + i0 * 26, 360, 115, 1, ACC);
      if (k === 3) { sub(620, 175, '읽은 줄은 다음 반복에서 버려진다', fade(u, 0.6), { 'font-size': 15, fill: INK });
        mono(380, 230, 'for line in f:   # 파일 객체가 곧 이터레이터', { 'font-size': 14.5, opacity: fade(u, 1.0) }); }
      if (k === 4) { const cnt = LOG.slice(0, i0 + 1).filter((s) => /ERROR/.test(s)).length;
        mono(375, 200, 'if "ERROR" in line:', { 'font-size': 15, fill: INFO, 'font-weight': 700 });
        card(780, 205, 200, 56, { rx: 10, stroke: cnt ? BAD : INK, sw: 2.2 }); mono(700, 212, 'error_count', { 'font-size': 14.5, 'font-weight': 700 });
        mono(868, 213, String(cnt), { 'font-size': 22, 'font-weight': 800, fill: cnt ? BAD : INK, 'text-anchor': 'end' });
        sub(620, 270, '판정은 루프 안에서 끝내고 숫자만 남긴다', 1, { 'font-size': 14.5, fill: INK }); }
      memGauge(MEM.iter, '0.03MB'); return; }
    // k === 5 정리: 잰 값 비교
    logDoc({ name: 'huge.log', rowOp: () => 0.35 });
    tx(370, 58, '같은 8.2MB·20만 줄 로그에서 잰 메모리 최대치', { 'font-size': 15, 'font-weight': 700 });
    [['f.read()', MEM.read, BAD], ['f.readlines()', MEM.lines, BAD], ['for line in f', MEM.iter, GOOD]].forEach(([n, v, col], i) => { const y = 92 + i * 56, g = E(u, 0.2 + i * 0.35, 1.0 + i * 0.35);
      mono(370, y + 15, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.35) });
      R.hbar(530, y, 280, v * g, 25, { h: 22, col, label: false }); mono(820, y + 17, (v < 1 ? v.toFixed(2) : v.toFixed(1)) + 'MB', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.6 + i * 0.35) }); });
    sub(640, 270, 'python 3.12 · tracemalloc 으로 직접 잰 값', fade(u, 1.8), { 'font-size': 14 });
    card(640, 352, 400, 50, { rx: 10, stroke: INK, sw: 2, s: pop(u, 2.1) }); mono(460, 358, 'print(error_count)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); mono(820, 358, '42  (예)', { 'font-size': 15, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.2) }); }

  // ---------- 3. 쓰기 ----------
  function outDoc(lines, o) { o = o || {}; fileDoc(780, 175, 230, 230, o.name || 'out.txt', lines, { lh: 28, stroke: o.stroke }); }
  const ln = (s, col, op) => ({ t: s, col, op, fs: 15 });
  function s3(t, c) { const { k, u } = c;
    zone(20, 20, 470, 300, '파이썬 코드', { fill: SOFT });
    if (k === 0) { const w = 1 - E(u, 0.8, 1.4);
      snippet(40, 50, ['open("out.txt", "w", encoding="utf-8")'], { w: 430, fs: 14.5, op: fade(u, 0.1) });
      outDoc([{ w: 0.8 * w }, { w: 0.6 * w }, { w: 0.7 * w }, { w: 0.5 * w }], { stroke: u > 0.8 ? BAD : INK });
      tx(60, 140, '예전 내용', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: 1 - E(u, 0.8, 1.4) });
      if (u > 1.4) { mono(780, 330, 'getsize → 0 바이트', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
      tx(60, 180, '아직 write() 를 부르지 않았다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(60, 214, '그런데 파일은 이미 비었다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { snippet(40, 50, ['f.write("첫 줄\\n")', 'f.write("둘째 줄\\n")'], { w: 430, fs: 14.5 });
      fly(300, 70, 700, 98, seg(u, 0.3, 1.0), '첫 줄\\n', { mono: true }); fly(300, 94, 700, 126, seg(u, 1.0, 1.7), '둘째 줄\\n', { mono: true });
      outDoc([ln('첫 줄 ↵', INK, fade(u, 1.0)), ln('둘째 줄 ↵', INK, fade(u, 1.7))]);
      tx(60, 170, '\\n 을 빼먹었다면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      card(250, 214, 380, 44, { rx: 8, stroke: BAD, sw: 2, s: pop(u, 2.0), text: '첫 줄둘째 줄   ← 한 줄로 붙는다', fs: 15, color: BAD, mono: true }); return; }
    if (k === 2) { snippet(40, 50, ['open("out.txt", "a", encoding="utf-8")', 'print("이어붙인 줄", file=f)'], { w: 430, fs: 14.5 });
      const blink = Math.floor(t * 3) % 2 ? 1 : 0.2;
      outDoc([ln('첫 줄 ↵'), ln('둘째 줄 ↵'), ln('이어붙인 줄 ↵', ACC, fade(u, 1.5))]);
      if (u < 1.5) el('line', { x1: 682, y1: 155, x2: 682, y2: 177, stroke: ACC, 'stroke-width': 3, opacity: blink });
      fly(300, 94, 720, 158, seg(u, 0.6, 1.5), '이어붙인 줄', { mono: true });
      pill(250, 180, 'print 가 \\n 을 붙인다', ACC, pop(u, 1.6), { fs: 14.5 });
      mono(40, 250, "→ '첫 줄\\n둘째 줄\\n이어붙인 줄\\n'", { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(250, 290, '직접 실행해 읽은 out.txt 내용', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { snippet(40, 50, ['rows = ["kim,90\\n", "lee,80\\n"]', 'f.writelines(rows)'], { w: 430, fs: 14.5 });
      cells(60, 120, ['"kim,90\\n"', '"lee,80\\n"'], { w: 150, h: 40, gap: 10, fs: 14.5, style: () => ({ stroke: ACC }) });
      fly(140, 140, 720, 98, seg(u, 0.4, 1.1), 'kim,90\\n', { mono: true }); fly(300, 140, 720, 126, seg(u, 0.9, 1.6), 'lee,80\\n', { mono: true });
      outDoc([ln('kim,90 ↵', INK, fade(u, 1.1)), ln('lee,80 ↵', INK, fade(u, 1.6))], { name: 'scores.csv' });
      tx(60, 214, '원소에 \\n 이 없으면 (직접 실행)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      mono(60, 248, "'kim,90lee,80'", { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { // 텍스트 vs 바이너리 두 길
      const rowY = [95, 225];
      [['텍스트 "w"', 'str "안녕"', 'utf-8 인코딩', 'ec 95 88 eb 85 95'], ['바이너리 "wb"', 'bytes', '변환 없음', '그대로']].forEach(([m, a, mid, b], i) => { const y = rowY[i], s = pop(u, 0.2 + i * 0.6);
        pill(90, y, m, i ? ACC : INFO, s, { mono: true, fs: 14.5 });
        card(250, y, 120, 40, { rx: 8, stroke: INK, sw: 1.8, text: a, fs: 14.5, mono: true, s });
        grow(312, y, 386, y, E(u, 0.4 + i * 0.6, 0.8 + i * 0.6), MUT); card(440, y, 104, 40, { rx: 8, stroke: i ? OFF : WARN, sw: 1.8, text: mid, fs: 14, s, dash: i ? '5 4' : null, color: i ? MUT : WARN });
        grow(494, y, 600, y, E(u, 0.8 + i * 0.6, 1.2 + i * 0.6), MUT); mono(608, y + 5, b, { 'font-size': 14.5, 'font-weight': 700, fill: i ? ACC : INK, opacity: fade(u, 1.0 + i * 0.6) }); });
      fileDoc(880, 160, 90, 110, 'copy.png', [{ w: 0.7 }, { w: 0.5 }]);
      pill(250, 290, 'encoding 인자', BAD, pop(u, 1.7), { mono: true, fs: 14 }); if (u > 1.9) el('line', { x1: 185, y1: 290, x2: 315, y2: 290, stroke: BAD, 'stroke-width': 3 });
      tx(345, 296, '바이너리에는 끼어들 변환이 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k === 5 bytes 쓰기
    snippet(40, 50, ['open("copy.png", "wb")', 'f.write(b"\\x89PNG\\r\\n...")'], { w: 430, fs: 14.5 });
    const hex = ['89', '50', '4E', '47', '0D', '0A', '2E', '2E', '2E'], n = Math.round(lerp(0, 9, E(u, 0.3, 1.4)));
    cells(40, 130, hex.map((h, i) => (i < n ? h : '')), { w: 44, h: 38, gap: 4, fs: 14.5, style: () => ({ stroke: ACC, color: ACC }) });
    mono(40, 200, 'f.write(...) → 9', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) }); sub(300, 200, '쓴 바이트 수', fade(u, 1.5), { 'font-size': 14 });
    fileDoc(780, 175, 160, 190, 'copy.png', [{ t: '89 50 4E 47', col: ACC, op: fade(u, 1.2) }, { t: '0D 0A 2E 2E', col: ACC, op: fade(u, 1.3) }, { t: '2E', col: ACC, op: fade(u, 1.4) }], { lh: 28 });
    mono(40, 250, 'f.write("문자")  # str 을 넣으면', { 'font-size': 14.5, opacity: fade(u, 1.9) });
    mono(40, 280, "TypeError: a bytes-like object is required", { 'font-size': 14, fill: BAD, opacity: fade(u, 2.2) }); }

  // ---------- 4. pathlib ----------
  // 폴더 나무: items [{ name, depth, dir, st: 'ghost'|'on'|'hit'|'new', op }]
  function tree(items, o) { o = o || {}; const x0 = o.x || 590, y0 = o.y || 60, lh = 40;
    zone(x0 - 20, y0 - 34, 370, o.h || 300, o.title || '디스크 (작업 폴더)');
    items.forEach((it, i) => { const op = it.op ?? 1; if (op <= 0.02) return; const x = x0 + it.depth * 34, y = y0 + 12 + i * lh,
        col = it.st === 'ghost' ? OFF : it.st === 'hit' ? ACC : it.st === 'new' ? GOOD : INK;
      if (it.depth) el('path', { d: `M${x - 22},${y - lh + 16} V${y} H${x - 4}`, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: op });
      if (it.dir) el('path', { d: `M${x},${y - 9} h10 l4,4 h14 v16 h-28 Z`, fill: it.st === 'ghost' ? 'none' : col === INK ? WARNBG : PANEL, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': it.st === 'ghost' ? '4 3' : null, opacity: op });
      else el('rect', { x: x + 4, y: y - 11, width: 20, height: 24, rx: 2, fill: it.st === 'ghost' ? 'none' : PANEL, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': it.st === 'ghost' ? '4 3' : null, opacity: op });
      mono(x + 36, y + 6, it.name, { 'font-size': 15, 'font-weight': it.st === 'hit' || it.st === 'new' ? 800 : 600, fill: col, opacity: op });
      if (it.note) tx(x + 44 + tw(it.name, 15 * 0.92), y + 6, it.note, { 'font-size': 13.5, fill: it.noteCol || MUT, opacity: op, 'font-weight': 700 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { zone(20, 20, 520, 300, '경로를 문자열로 이으면', { fill: SOFT });
      mono(40, 80, '"data/" + "/" + "a.txt"', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      grow(60, 98, 60, 130, E(u, 0.5, 0.8), BAD); mono(40, 160, "'data//a.txt'", { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
      sub(300, 160, '슬래시가 겹친다 (직접 실행)', fade(u, 0.9), { 'font-size': 14 });
      mono(40, 220, 'os.path.join("data", "raw", "a.txt")', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); if (u > 1.7) el('line', { x1: 38, y1: 214, x2: 380, y2: 214, stroke: MUT, 'stroke-width': 2 });
      card(740, 150, 300, 110, { rx: 12, stroke: ACC, sw: 2.6, s: pop(u, 1.8) });
      mono(740, 140, 'from pathlib import Path', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
      sub(740, 172, '경로 = 문자열이 아니라 객체', fade(u, 2.1), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { const parts = [['Path("data")', INFO], ['"raw"', INK], ['"scores.csv"', INK]], snap = E(u, 0.8, 1.5);
      let x = 60; parts.forEach(([s, col], i) => { const w = tw(s, 15) + 26, gx = lerp(i * 40, 0, snap);
        card(x + w / 2 + gx, 90, w, 40, { rx: 8, stroke: col, sw: 2, text: s, fs: 15, mono: true, color: col, s: pop(u, 0.2 + i * 0.2) }); x += w + 8;
        if (i < 2) mono(x - 2 + lerp((i + 1) * 40 - 20, 0, snap), 96, '/', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); x += 14; });
      grow(260, 120, 260, 160, E(u, 1.5, 1.8), ACC);
      [['리눅스·맥', 'data/raw/scores.csv'], ['윈도우', 'data\\raw\\scores.csv']].forEach(([os, s], i) => { const y = 200 + i * 56;
        tx(60, y, os, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8 + i * 0.3) });
        mono(170, y, s, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8 + i * 0.3) }); });
      sub(280, 320, '같은 코드, 구분자는 OS 가 고른다 (print(p) 결과)', fade(u, 2.3), { 'font-size': 14 });
      tree([{ name: 'data', depth: 0, dir: true, st: 'ghost' }, { name: 'raw', depth: 1, dir: true, st: 'ghost' }, { name: 'scores.csv', depth: 2, st: 'ghost' }], { title: '아직 디스크에는 없다' }); return; }
    if (k === 2) { const segs = [['data/raw', 'p.parent', INFO], ['/', null, MUT], ['scores', 'p.stem', ACC], ['.csv', 'p.suffix', WARN]], fs = 26;
      let x = 120; const xs = segs.map(([s, , col]) => { const a = x, e = mono(x, 140, s, { 'font-size': fs, 'font-weight': 800, fill: col === MUT ? MUT : INK, opacity: fade(u, 0.1) });
        let w = tw(s, fs); try { w = e.getComputedTextLength() || w; } catch (er) { /* 측정 불가 */ } x += w; return [a, x]; });
      segs.forEach(([s, nm, col], i) => { if (!nm) return; const [a, b] = xs[i], at = 0.4 + i * 0.4, g = E(u, at, at + 0.4);
        el('path', { d: `M${a},158 v10 H${lerp(a, b, g)} v-10`, fill: 'none', stroke: col, 'stroke-width': 2.5 });
        mono((a + b) / 2, 196, nm, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, at + 0.2) }); });
      const nA = xs[2][0], nB = xs[3][1], g = E(u, 1.8, 2.2);
      el('path', { d: `M${nA},112 v-10 H${lerp(nA, nB, g)} v10`, fill: 'none', stroke: GOOD, 'stroke-width': 2.5 });
      mono((nA + nB) / 2, 86, "p.name → 'scores.csv'", { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      [["p.parent", "data/raw"], ["p.stem", "'scores'"], ["p.suffix", "'.csv'"]].forEach(([a, b], i) => { mono(140 + i * 250, 270, a + ' → ' + b, { 'font-size': 15, opacity: fade(u, 2.3) }); });
      sub(480, 330, '문자열을 자르지 않고 속성으로 읽는다 · 바꾸기: p.with_suffix(".json")', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 3) { snippet(30, 40, ['p.parent.mkdir(parents=True, exist_ok=True)'], { w: 500, fs: 14.5 });
      tree([{ name: 'data', depth: 0, dir: true, st: u > 0.6 ? 'new' : 'ghost', note: u > 0.6 ? '생성' : null, noteCol: GOOD }, { name: 'raw', depth: 1, dir: true, st: u > 1.1 ? 'new' : 'ghost', note: u > 1.1 ? '생성' : null, noteCol: GOOD }, { name: 'scores.csv', depth: 2, st: 'ghost', note: '파일은 아직 없음' }]);
      [['parents=True', '중간 폴더 data 까지 한 번에'], ['exist_ok=True', '두 번째 실행에도 에러 없음']].forEach(([a, b], i) => { const y = 120 + i * 44;
        mono(40, y, a, { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6 + i * 0.5) }); tx(200, y, b, { 'font-size': 14.5, opacity: fade(u, 0.7 + i * 0.5) }); });
      tx(40, 230, '옵션을 빼면 (직접 실행)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) });
      mono(40, 262, 'parents 없이 → FileNotFoundError', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.0) });
      mono(40, 290, 'exist_ok 없이 → FileExistsError', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { tree([{ name: 'data', depth: 0, dir: true }, { name: 'raw', depth: 1, dir: true }, { name: 'scores.csv', depth: 2, st: 'ghost', note: '?', noteCol: WARN }]);
      [['p.exists()', 'False', BAD], ['p.is_file()', 'False', BAD], ['p.parent.is_dir()', 'True', GOOD]].forEach(([a, b, col], i) => { const y = 90 + i * 56, s = pop(u, 0.3 + i * 0.45);
        card(170, y, 280, 42, { rx: 8, stroke: GRID, sw: 1.5, s }); mono(48, y + 6, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.45) });
        pill(370, y, b, col, pop(u, 0.6 + i * 0.45), { mono: true, fs: 15 }); });
      sub(250, 280, 'Path 객체 = 주소일 뿐, 파일을 만들지 않는다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { const scan = E(u, 0.3, 2.0) * 5;
      const items = [{ name: 'data', depth: 0, dir: true }, { name: 'summary.csv', depth: 1, st: scan > 1 ? 'hit' : null }, { name: '2024', depth: 1, dir: true }, { name: 'jan.csv', depth: 2, st: scan > 3 ? 'hit' : null }, { name: 'raw', depth: 1, dir: true }, { name: 'scores.csv', depth: 2, st: 'ghost' }];
      tree(items, { title: '예시 폴더', h: 300 }); const i = Math.min(5, Math.floor(scan)); if (u > 0.3 && u < 2.1) el('circle', { cx: 580, cy: 72 + i * 40, r: 7, fill: ACC });
      snippet(30, 40, ['for csv in Path("data").rglob("*.csv"):', '    print(csv.name)'], { w: 480, fs: 14.5 });
      [['glob("*.csv")', '그 폴더만', "summary.csv"], ['rglob("*.csv")', '하위 폴더까지', "summary.csv · jan.csv"]].forEach(([a, b, r], j) => { const y = 160 + j * 60;
        mono(40, y, a, { 'font-size': 15, 'font-weight': 800, fill: j ? ACC : INK, opacity: fade(u, 0.8 + j * 0.8) }); tx(220, y, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8 + j * 0.8) });
        mono(60, y + 26, '→ ' + r, { 'font-size': 14.5, fill: j ? ACC : INK, opacity: fade(u, 1.1 + j * 0.8) }); });
      sub(270, 300, '결과는 리스트가 아니라 제너레이터 — 하나씩 내놓는다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k === 6
    tree([{ name: 'data', depth: 0, dir: true }, { name: 'raw', depth: 1, dir: true }, { name: 'scores.csv', depth: 2, st: u > 0.8 ? 'new' : 'ghost', note: u > 0.8 ? "'kim,90\\n'" : null, noteCol: GOOD }]);
    snippet(30, 40, ['p.write_text("kim,90\\n", encoding="utf-8")', 'print(p.read_text(encoding="utf-8"))'], { w: 500, fs: 14.5 });
    fly(300, 120, 760, 132, seg(u, 0.3, 0.9), 'kim,90\\n', { mono: true });
    fly(760, 132, 200, 170, seg(u, 1.3, 2.0), 'kim,90', { mono: true, fill: INK });
    mono(40, 200, '→ kim,90', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.0) });
    tx(40, 260, '열기 · 쓰기 · 닫기를 한 줄로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
    sub(250, 296, '작은 파일 전용 — 큰 파일은 with open 과 스트리밍', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 5. 실무 함정 4종 ----------
  const PIT = [[240, 105, '① encoding 미지정'], [720, 105, '② 큰 파일을 read()'], [240, 305, '③ 문자열로 경로 결합'], [720, 305, '④ close 를 잊음']];
  function pitCard(i, on, u) { const [cx, cy, title] = PIT[i], st = on ? 1 : 0.55;
    card(cx, cy, 456, 186, { rx: 12, stroke: on ? BAD : GRID, sw: on ? 2.6 : 1.5, fill: PANEL });
    tx(cx - 212, cy - 66, title, { 'font-size': 16, 'font-weight': 800, fill: on ? BAD : MUT });
    const a = on ? u : 9, x = cx - 212, y = cy - 30, o = (at) => (on ? fade(a, at) : st);
    if (i === 0) { mono(x, y, 'utf-8 바이트  ed 95 9c ea b8 80', { 'font-size': 14.5, opacity: o(0.3) });
      mono(x, y + 34, 'utf-8 로 읽기  → 한글', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: o(0.8) });
      mono(x, y + 64, 'cp949 로 읽기  → UnicodeDecodeError', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: o(1.3) });
      mono(x, y + 92, '(깨진 채 읽으면 �븳湲�)', { 'font-size': 14, fill: MUT, opacity: o(1.7) }); }
    if (i === 1) { [['read()', 24.6, BAD], ['for line in f', 0.03, GOOD]].forEach(([n, v, col], j) => { const yy = y + j * 44;
        mono(x, yy + 6, n, { 'font-size': 15, 'font-weight': 700, opacity: o(0.3 + j * 0.5) }); R.hbar(x + 140, yy - 8, 200, v * (on ? E(a, 0.4 + j * 0.5, 1.2 + j * 0.5) : 1), 25, { h: 18, col, label: false });
        mono(x + 420, yy + 6, (v < 1 ? v.toFixed(2) : v.toFixed(1)) + 'MB', { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: o(1.0 + j * 0.5) }); });
      sub(cx, y + 100, '8.2MB 로그로 잰 최대 메모리', on ? fade(a, 1.8) : st, { 'font-size': 14 }); }
    if (i === 2) { mono(x, y, '"data/" + "/" + "a.txt"', { 'font-size': 15, opacity: o(0.3) }); mono(x + 260, y, "→ 'data//a.txt'", { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: o(0.8) });
      mono(x, y + 44, 'Path("data") / "a.txt"', { 'font-size': 15, opacity: o(1.2) }); mono(x + 260, y + 44, '→ data/a.txt', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: o(1.6) });
      sub(cx, y + 96, 'Path 는 open() 에 그대로 넘긴다', on ? fade(a, 2.0) : st, { 'font-size': 14 }); }
    if (i === 3) { card(x + 70, y + 30, 130, 60, { rx: 8, stroke: WARN, sw: 2, text: '쓰기 버퍼\n"done\\n"', fs: 14, op: o(0.3) });
      fileDoc(x + 380, y + 30, 70, 80, null, [{ w: 0.7, col: GOOD, op: on ? E(a, 1.4, 1.8) : 1 }], { op: o(0.3) });
      grow(x + 140, y + 30, x + 340, y + 30, on ? E(a, 0.8, 1.4) : 1, GOOD); tx(x + 160, y + 20, 'with 끝 → flush + close', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: o(1.0) });
      tx(x, y + 92, 'close 를 잊으면 버퍼가 디스크에 안 남을 수 있다', { 'font-size': 14, fill: BAD, opacity: o(1.8) }); } }
  function s5(t, c) { const { k, u } = c; for (let i = 0; i <= k; i++) pitCard(i, i === k, u); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'with open(...) as f: 블록 안에서 예외가 터지면 f는 어떻게 되나?',
      o: ['열린 채로 남아 직접 close() 해야 한다', '블록을 벗어나며 자동으로 닫힌다', '프로그램이 끝날 때까지 기다렸다 닫힌다'], a: 1,
      why: 'with는 블록을 벗어나는 모든 길에서 close()를 부른다. 닫힌 뒤 f.read()를 부르면 ValueError가 난다.' },
    { q: '크기를 모르는 huge.log에서 ERROR 줄 수만 세려면 어느 방법이 맞나?',
      o: ['f.read()로 읽고 count 한다', 'f.readlines()로 리스트를 만든다', 'for line in f로 한 줄씩 보며 센다'], a: 2,
      why: '8.2MB 로그로 재 보니 read()는 최대 24.6MB, readlines()는 17.8MB, for 순회는 0.03MB였다. 한 줄씩 보면 파일이 커져도 메모리가 그대로다.' },
    { q: '로그 파일에 기록을 계속 쌓아야 할 때 open 모드로 알맞은 것은 무엇인가?',
      o: ['"a"', '"w"', '"r"'], a: 0,
      why: '"w" 는 여는 순간 파일을 0바이트로 비운다. "a" 는 기존 내용을 두고 끝에 덧붙인다.' },
    { q: 'p = Path("data") / "raw" / "scores.csv" 를 실행한 직후 디스크에는 무엇이 생기나?',
      o: ['data/raw 폴더와 빈 scores.csv', 'data/raw 폴더만', '아무것도 생기지 않는다'], a: 2,
      why: 'Path는 경로를 나타내는 객체일 뿐이다. 폴더는 mkdir, 파일은 write_text나 open으로 만들어야 생긴다.' },
    { q: '맥에서 utf-8로 저장한 한글 파일을 윈도우에서 open("한글.txt")로 읽었더니 깨졌다. 고칠 곳은 어디인가?',
      o: ['open에 encoding="utf-8" 을 준다', '파일을 "rb" 로 열어 str로 쓴다', 'read() 대신 readlines()로 읽는다'], a: 0,
      why: 'encoding을 빼면 OS 기본 인코딩(윈도우는 cp949)으로 읽는다. utf-8 바이트를 cp949로 풀면 UnicodeDecodeError나 깨진 글자가 나온다.' },
  ];

  const summary = [
    '연 파일은 OS 자원이라 반드시 닫아야 하고, with 블록이 예외가 나도 close를 보장한다.',
    '텍스트 파일은 항상 encoding="utf-8"을 준다. 빼면 윈도우에서만 한글이 깨진다.',
    '큰 파일은 for line in f로 한 줄씩 읽는다. 8.2MB 로그에서 read()는 24.6MB, 순회는 0.03MB였다.',
    '"w"는 여는 순간 비우고 "a"는 덧붙인다. 경로는 Path와 / 연산자로 잇는다.',
  ];
  const review = [
    { q: '밤새 도는 수집 스크립트가 새벽에 "Too many open files"로 멈췄다. 먼저 의심할 코드는?',
      o: ['with 없이 open()하고 close() 전에 예외가 날 수 있는 곳', 'encoding="utf-8" 을 준 open() 호출', 'Path("data") / name으로 경로를 만든 곳'], a: 0,
      why: '예외로 close()를 건너뛰면 fd가 하나씩 남는다. with로 바꾸면 실패 경로에서도 fd가 반납된다.' },
    { q: '매일 실행하는 리포트 스크립트가 어제 기록을 계속 지운다. 이 코드에서 바꿀 곳은?',
      o: ['write() 대신 print(file=f)를 쓴다', 'open(path, "w")를 open(path, "a")로 바꾼다', 'encoding을 cp949로 바꾼다'], a: 1,
      why: '"w" 는 write()를 부르기 전, 여는 순간 파일을 비운다. 쌓아야 하는 기록은 "a" 로 연다.' },
    { q: '수 GB 로그에서 ERROR 줄만 골라 새 파일에 옮기려 한다. 가장 알맞은 조합은?',
      o: ['readlines()로 읽어 리스트에 모은 뒤 writelines()', 'read()로 읽고 split("\\n")으로 나눈다', '읽기 파일을 for로 돌며 줄마다 쓰기 파일에 write()'], a: 2,
      why: '두 파일을 with로 열고 줄마다 판정해 바로 쓰면 메모리에는 한 줄만 있다. 모아 두면 파일 크기만큼 메모리를 쓴다.' },
  ];

  R.page({ title: '파일과 경로 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
