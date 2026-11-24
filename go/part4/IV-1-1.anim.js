/* IV-1-1 go mod — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 폴더 트리, go.mod·go.sum 파일 줄, 버전 수직선(MVS), import ↔ require 대조(tidy), replace 경로 갈아끼우기.
 * 모듈 경로·버전은 페이지 코드 블록과 STEPS.graph 에서 읽는다. 해시는 자리표시(h1:…)만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, lock, spans, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공용 부품 ----------
  // 작은 파일 아이콘 (접힌 귀퉁이)
  function fileIco(x, y, col, s) { const g = R.G(x, y, s ?? 1); el('path', { d: 'M-7,-9 H3 L7,-5 V9 H-7 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g); el('path', { d: 'M3,-9 V-5 H7', fill: 'none', stroke: col || INK, 'stroke-width': 1.5 }, g); return g; }
  function folderIco(x, y, col, s) { const g = R.G(x, y, s ?? 1); el('path', { d: 'M-10,-7 H-3 L-1,-4 H10 V8 H-10 Z', fill: col === ACC ? ACCBG : SOFT, stroke: col || INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g); return g; }
  // 파일 창: 제목 탭 + 고정폭 줄. rows: [{t, col, op, hi, typed, strike, w}]
  function doc(x, y, w, name, rows, o) { o = o || {}; const lh = o.lh || 25, h = (o.h || rows.length * lh + 22), op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h + 30, rx: 9, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, opacity: op });
    el('rect', { x, y, width: w, height: 30, rx: 9, fill: o.head || SOFT, opacity: op }); el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: o.stroke || INK, 'stroke-width': 1.2, opacity: op });
    fileIco(x + 18, y + 15, o.stroke || INK); mono(x + 34, y + 20, name, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || INK, opacity: op });
    rows.forEach((r, i) => { if (!r) return; const yy = y + 30 + 16 + i * lh + 5, rop = (r.op ?? 1) * op; if (rop <= 0.02) return;
      if (r.hi) el('rect', { x: x + 6, y: yy - 17, width: w - 12, height: lh - 2, rx: 5, fill: r.hi === true ? ACCBG : r.hi, opacity: rop * (r.hiop ?? 1) });
      const s = r.typed == null ? r.t : r.t.slice(0, Math.round(r.t.length * clamp(r.typed)));
      const e = mono(x + 14, yy, s, { 'font-size': r.fs || 14.5, fill: r.col || INK, 'font-weight': r.fw || 500, opacity: rop });
      if (r.strike) el('line', { x1: x + 12, y1: yy - 5, x2: x + 14 + tw(r.t, r.fs || 14.5) * clamp(r.strike), y2: yy - 5, stroke: BAD, 'stroke-width': 2.2, opacity: rop }); });
    return { x, y, w, h: h + 30, row: (i) => y + 30 + 16 + i * lh }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 모듈이란 ----------
  const TREE = [
    { n: 'go.mod', c: 'module 경로 + go 버전', k: 0 },
    { n: 'go.sum', c: '의존성 무결성 해시', k: 0 },
    { n: 'main.go', c: 'package main', k: 1, pkg: true },
    { n: 'order/order.go', c: 'package order', k: 1, pkg: true },
    { n: 'pay/pay.go', c: 'package pay', k: 1, pkg: true },
  ];
  function tree(k, u) { const x0 = 56, y0 = 76;
    folderIco(x0, y0, ACC, k === 0 ? pop(u, 0.2) : 1); mono(x0 + 18, y0 + 5, 'shop/', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.3) : 1 });
    TREE.forEach((r, i) => { if (r.k > k) return; const y = y0 + 42 + i * 40, at = r.k === k ? (r.k === 0 ? 0.6 + i * 0.5 : 0.3 + (i - 2) * 0.45) : -9, gu = E(u, at, at + 0.4);
      const top = i === 0 ? y0 + 12 : y0 + 42 + (i - 1) * 40;
      el('line', { x1: x0, y1: top, x2: x0, y2: lerp(top, y, gu), stroke: GRID, 'stroke-width': 2 });
      grow(x0, y, x0 + 22, y, gu, GRID, { plain: true });
      if (gu <= 0) return;
      const isDir = r.n.includes('/'), op = fade(u, at + 0.3);
      if (isDir) { folderIco(x0 + 36, y, INK, pop(u, at + 0.2)); } else fileIco(x0 + 36, y, i < 2 ? ACC : INK, pop(u, at + 0.2));
      mono(x0 + 52, y + 5, r.n, { 'font-size': 15, 'font-weight': 700, fill: i < 2 ? ACC : INK, opacity: op });
      if (r.pkg) pill(338, y, r.c, INFO, pop(u, at + 0.5), { mono: true, fs: 13.5 });
      else tx(250, y + 5, r.c, { 'font-size': 13.5, fill: MUT, opacity: fade(u, at + 0.5) }); });
    // 모듈 경계: 트리 전체를 감싸는 점선 (k0 끝에 자라난다)
    const bu = k === 0 ? E(u, 1.8, 2.5) : 1, bh = k === 0 ? 132 : 252;
    if (bu > 0) { const r = el('rect', { x: 30, y: 52, width: 400, height: bh, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2, pathLength: bu < 1 ? 100 : null });
      r.setAttribute('stroke-dasharray', bu < 1 ? `${bu * 100} 100` : '7 5');
      tx(42, 52 + bh + 22, k === 0 ? '모듈 하나 = go.mod 가 있는 폴더 트리' : '모듈 하나 = 패키지 3개 + go.mod', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 2.2) : 1 }); } }
  function s1(t, c) { const { k, u } = c, g = c.beat.graph || {};
    tree(k, u);
    if (k === 0) { // 오른쪽: 뿌리의 두 파일
      [['go.mod', 'module github.com/acme/shop', 'go 1.22'], ['go.sum', '…/gin v1.9.1 h1:…=', '…/gin v1.9.1/go.mod h1:…=']].forEach(([n, a, b], i) => {
        const d = doc(520, 60 + i * 150, 400, n, [{ t: a, typed: E(u, 0.9 + i * 0.6, 1.5 + i * 0.6) }, { t: b, typed: E(u, 1.2 + i * 0.6, 1.8 + i * 0.6), col: i ? MUT : INK }], { op: fade(u, 0.5 + i * 0.6), stroke: ACC, lh: 26 }); });
      return; }
    if (k === 1) { zone(500, 60, 420, 300, '모듈 github.com/acme/shop', { fill: ACCBG, color: ACC, op: fade(u, 0.2) });
      ['main', 'order', 'pay'].forEach((p, i) => { const s = pop(u, 0.5 + i * 0.35); card(600 + i * 120, 190, 100, 86, { rx: 10, s, stroke: INFO, fill: PANEL });
        if (s > 0.5) { folderIco(600 + i * 120, 172, INFO); mono(600 + i * 120, 212, p, { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' }); } });
      // 태그 하나가 모듈 전체에 붙는다
      const ts = pop(u, 1.8); if (ts > 0) { el('line', { x1: 870, y1: 60, x2: 870, y2: 92 * ts + 60 * (1 - ts), stroke: WARN, 'stroke-width': 2 }); pill(870, 106, 'v1.2.0', WARN, ts, { mono: true, fill: WARNBG }); }
      tx(710, 320, '패키지 = import 단위 · 모듈 = 버전 단위', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      return; }
    if (k === 2) { const mod = 'github.com/acme/shop';
      tx(500, 76, 'import 경로 = module 경로 + 폴더 경로', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      [['/order', 1, 158], ['/pay', 2, 238]].forEach(([d, i, y]) => { const a = 0.4 + (i - 1) * 0.8;
        fly(470, y - 44, 560, y, seg(u, a, a + 0.7), mod, { mono: true, fill: ACC });
        fly(470, 76 + 42 + (i + 2) * 40, 560 + tw(mod, 13.5) * 0.5 + 60, y, seg(u, a + 0.2, a + 0.9), d, { mono: true, fill: INFO });
        const op = fade(u, a + 0.8);
        spans(500, y + 5, [['import "', { fill: MUT }], [mod, { fill: ACC, 'font-weight': 700 }], [d, { fill: INFO, 'font-weight': 700 }], ['"', { fill: MUT }]], { 'font-size': 15.5, opacity: op }); });
      cross(520, 310, 9, pop(u, 2.1)); tx(540, 316, '/ (main) 은 실행 파일 — import 대상이 아니다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) });
      return; }
    // k3: GOPATH 시절 vs 지금
    const f = g.fields || [];
    tx(500, 76, (f[0] && f[0].k) || '과거', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.1) });
    card(710, 112, 420, 40, { rx: 8, text: '$GOPATH/src/github.com/acme/shop', mono: true, fs: 14.5, stroke: BAD, fill: BADBG, color: BAD, s: pop(u, 0.2) });
    lock(940, 110, true, BAD, pop(u, 0.6)); tx(500, 152, '폴더 위치가 곧 import 경로였다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7) });
    tx(500, 206, (f[1] && f[1].k) || '지금', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
    [['~/work/shop', 242], ['/tmp/demo/shop', 290]].forEach(([p, y], i) => { const s = pop(u, 1.2 + i * 0.4);
      card(640, y, 280, 38, { rx: 8, text: p, mono: true, fs: 14.5, stroke: GOOD, fill: GOODBG, color: INK, s });
      pill(838, y, '+ go.mod', ACC, s, { mono: true, fs: 13.5 }); check(915, y, 9, pop(u, 1.5 + i * 0.4)); });
    tx(500, 344, 'import 경로를 정하는 것은 go.mod 의 module 한 줄뿐', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) }); }

  // ---------- 2. go mod init ----------
  function s2(t, c) { const { k, u } = c, b = c.beat, g = b.graph || {};
    const cmd = k === 5 ? '$ go mod init gitlab.acme.io/team/shop' : '$ go mod init github.com/acme/shop';
    const lines = ['$ mkdir shop && cd shop'];
    if (k >= 1) lines.push(cmd, ['go: creating new go.mod: module ' + (k === 5 ? 'gitlab.acme.io/team/shop' : 'github.com/acme/shop'), 'var(--term)']);
    const shown = k === 0 ? 1 * E(u, 0.2, 1.2) : k === 1 || k === 5 ? 1 + 2 * E(u, 0.2, 1.4) : 3;
    terminal(30, 40, 430, 150, lines, Math.max(0.01, shown), { title: 'zsh', fs: 13.5 });
    // 폴더와 go.mod
    folderIco(44, 210, ACC, 1.3); mono(64, 216, 'shop/', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    if (k === 0) { const s = fade(u, 1.2); el('rect', { x: 80, y: 262, width: 220, height: 40, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: s });
      mono(190, 287, 'go.mod 없음', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
      tx(500, 210, '아직 그냥 폴더다', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.8) });
      tx(500, 240, 'GOPATH 와 상관없는 아무 위치', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    const modPath = k === 5 ? 'gitlab.acme.io/team/shop' : 'github.com/acme/shop';
    const rows = [
      { t: 'module ' + modPath, typed: k === 1 ? E(u, 1.4, 2.2) : 1, hi: k === 2 || k === 5, fw: 700 },
      { t: '' },
      { t: 'go 1.22', typed: k === 1 ? E(u, 2.0, 2.4) : 1, hi: k === 3, fw: 700 },
      { t: '' },
      { t: k >= 4 ? '// require 없음 (0개)' : '', col: MUT, op: k === 4 ? fade(u, 0.6) : 1 },
    ];
    const d = doc(80, 228, 380, 'go.mod', rows, { stroke: ACC, op: k === 1 ? fade(u, 1.1) : 1, lh: 26 });
    if (k === 1) { tx(500, 240, 'go.mod 생성 — 이 폴더가 모듈이 됐다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.3), fill: ACC });
      tx(500, 270, '이미 있으면 init 은 거부한다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.5) }); return; }
    if (k === 2 || k === 5) { // module 경로 = 남이 쓰는 import 접두사
      const users = k === 5 ? ['gitlab.acme.io/team/shop/order', 'gitlab.acme.io/team/shop/pay'] : ['github.com/acme/shop/order', 'github.com/acme/shop/pay'];
      users.forEach((s, i) => { const y = 300 + i * 52, a = 0.4 + i * 0.4, gu = E(u, a, a + 0.6);
        el('path', { d: `M460,${d.row(0)} C540,${d.row(0)} 520,${y - 5} ${lerp(460, 560, gu)},${y - 5}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: gu });
        spans(570, y, [['import "', { fill: MUT }], [s.slice(0, modPath.length), { fill: ACC, 'font-weight': 700 }], [s.slice(modPath.length) + '"', { fill: INFO }]], { 'font-size': 14.5, opacity: fade(u, a + 0.5) }); });
      tx(570, 250, k === 5 ? '사내 코드도 실제 호스트 주소로' : '다른 코드가 쓰는 import 접두사', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.2) });
      if (k === 2) { cross(582, 404, 7, pop(u, 2.0)); tx(596, 409, '바꾸면 모든 사용자의 import 가 깨진다', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) }); }
      else tx(570, 404, '저장소를 옮기거나 공개할 때 고생하지 않는다', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) });
      return; }
    if (k === 3) { // go 지시자 = 기능 스위치
      tx(520, 236, 'go 지시자 = 언어 기능 스위치', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      const x0 = 540, x1 = 900, V = [18, 19, 20, 21, 22], X = (v) => lerp(x0, x1, (v - 18) / 4), cur = 22;
      el('line', { x1: x0, y1: 296, x2: x1, y2: 296, stroke: MUT, 'stroke-width': 2 });
      V.forEach((v) => { el('line', { x1: X(v), y1: 290, x2: X(v), y2: 302, stroke: MUT, 'stroke-width': 1.8 }); mono(X(v), 322, '1.' + v, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      const pu = E(u, 0.4, 1.0); el('circle', { cx: X(18 + 4 * pu), cy: 296, r: 8, fill: ACC });
      [['제네릭', 18, 360], ['반복마다 새 루프 변수', 22, 392]].forEach(([s, v, y], i) => { const on = pu >= (v - 18) / 4 - 0.01, op = fade(u, 1.1 + i * 0.4);
        el('rect', { x: X(v) - 16, y: y - 15, width: 32, height: 18, rx: 9, fill: on ? GOOD : OFF, opacity: op }); el('circle', { cx: X(v) + (on ? 7 : -7), cy: y - 6, r: 6, fill: PANEL, opacity: op });
        tx(X(v) + (v === 22 ? -26 : 26), y, s + ` (1.${v}+)`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': v === 22 ? 'end' : 'start', opacity: op }); });
      tx(520, 262, '낮추면 그 버전에 없던 문법이 컴파일 에러', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.2) });
      return; }
    // k4: require 비어 있음
    el('rect', { x: 540, y: 250, width: 360, height: 110, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 0.3) });
    mono(560, 282, 'require (', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4) }); mono(560, 344, ')', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4) });
    mono(720, 316, '0', { 'font-size': 30, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    tx(720, 400, '외부 패키지를 import 하고 go get · tidy 를 돌리면 채워진다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }

  // ---------- 3. go get + go.sum ----------
  function s3(t, c) { const { k, u } = c, flow = (c.beat.graph && c.beat.graph.flow) || [];
    const latest = k === 3, ver = latest ? 'v1.10.0' : 'v1.9.1';
    const cmd = flow[0] ? '$ ' + flow[0].label : '$ go get github.com/gin-gonic/gin@v1.9.1';
    terminal(30, 30, 520, 76, [k === 4 ? '$ git add go.mod go.sum' : cmd], k === 0 || k === 3 || k === 4 ? Math.max(0.01, E(u, 0.1, 0.9)) : 1, { fs: 13.5 });
    // 받아 오기: 프록시 → 모듈 캐시
    if (k === 0 || k === 3) { card(120, 170, 190, 50, { rx: 25, text: 'proxy.golang.org', mono: true, fs: 14, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.5) });
      card(120, 350, 190, 50, { rx: 8, text: '모듈 캐시', fs: 15, stroke: INK, s: pop(u, 0.7) });
      fly(120, 200, 120, 290, seg(u, 1.0, 2.0), `gin@${ver}.zip`, { mono: true, fill: ACC, stay: true });
      if (k === 0) tx(230, 404, '받기만 했다 — 파일은 다음 줄에서 바뀐다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    // go.mod / go.sum 창
    const reqT = k === 3 ? (u < 1.4 ? 'require github.com/gin-gonic/gin v1.9.1' : 'require github.com/gin-gonic/gin v1.10.0') : 'require github.com/gin-gonic/gin v1.9.1';
    const modRows = [{ t: 'module github.com/acme/shop', col: MUT }, { t: 'go 1.22', col: MUT }, k >= 1 ? { t: reqT, typed: k === 1 ? E(u, 0.3, 1.4) : 1, hi: k === 1 || (k === 3 && u > 1.4), fw: 700, fs: 14 } : null];
    const gm = doc(560, 120, 380, 'go.mod', modRows, { stroke: k >= 1 ? ACC : INK, lh: 26 });
    if (k === 1) { tx(560, 276, '"최소 v1.9.1 이상" 이라는 요구', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      fly(400, 160, 760, 200, seg(u, 0.1, 0.6), 'require', { fill: ACC }); }
    if (k >= 2) { const sumRows = [
        { t: 'gin v1.9.1 h1:…=', typed: k === 2 ? E(u, 0.5, 1.1) : 1, hi: k === 2 ? true : null },
        { t: 'gin v1.9.1/go.mod h1:…=', typed: k === 2 ? E(u, 1.2, 1.8) : 1, hi: k === 2 ? WARNBG : null },
        k === 3 ? { t: 'gin v1.10.0 h1:…=', typed: E(u, 1.6, 2.2), hi: true } : null,
        k === 3 ? { t: 'gin v1.10.0/go.mod h1:…=', typed: E(u, 1.9, 2.5), hi: WARNBG } : null ];
      const gs = doc(560, 262, 380, 'go.sum', sumRows.filter((r, i) => i < 2 || k === 3), { stroke: WARN, lh: 24, h: 4 * 24 - 10, head: WARNBG });
      if (k === 2) { lock(905, 276, true, WARN, pop(u, 2.0));
        tx(40, 280, '● 모듈 zip 의 해시', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
        tx(40, 310, '● 그 모듈 go.mod 의 해시', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) });
        card(150, 200, 160, 46, { rx: 8, text: 'gin@v1.9.1.zip', mono: true, fs: 13.5, stroke: ACC, s: pop(u, 0.2) });
        grow(232, 205, 552, gs.row(0) - 5, E(u, 0.3, 0.8), ACC); grow(232, 215, 552, gs.row(1) - 5, E(u, 1.0, 1.5), WARN);
        tx(40, 390, '받은 코드의 해시가 다르면 빌드를 거부한다 = 변조 잠금', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      if (k === 3) { tx(330, 404, 'v1.10.0 은 오늘의 최신 (예시) — 자동 추적이 아니다', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); }
      if (k === 4) { // 커밋: 두 파일이 함께
        card(250, 220, 200, 120, { rx: 12, stroke: INK, fill: SOFT, s: pop(u, 0.1) }); tx(250, 192, 'git commit', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.2) });
        fly(650, 170, 230, 222, seg(u, 0.4, 1.2), 'go.mod', { mono: true, fill: ACC, stay: true });
        fly(650, 310, 270, 256, seg(u, 0.7, 1.5), 'go.sum', { mono: true, fill: WARN, stay: true });
        tx(60, 330, 'CI · 동료 머신', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
        mono(60, 360, '받은 zip 해시 == go.sum', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.8) }); check(270, 355, 9, pop(u, 2.0));
        mono(60, 392, 'go.sum 이 빠지면 검증할 기준이 없다', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.2) }); } } }

  // ---------- 4. MVS ----------
  const VX0 = 70, VX1 = 900, VER = (m) => lerp(VX0, VX1, m / 10), LY = 250;   // v1.0 … v1.10 수직선
  function vline(k, u) { el('line', { x1: VX0, y1: LY, x2: VX1, y2: LY, stroke: MUT, 'stroke-width': 2.2 });
    for (let m = 0; m <= 9; m++) { el('line', { x1: VER(m), y1: LY - 6, x2: VER(m), y2: LY + 6, stroke: MUT, 'stroke-width': 1.6 }); mono(VER(m), LY + 26, 'v1.' + m, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } }
  function s4(t, c) { const { k, u } = c, m = (c.beat.graph && c.beat.graph.mvs) || { reqs: [] };
    if (k === 4) return mgraph(u, m);
    vline(k, u);
    const reqs = m.reqs.map((r) => ({ by: r.by, v: +r.ver.split('.')[1], ver: r.ver }));
    // 요구 = "이 버전 이상" 광선
    reqs.forEach((r, i) => { const a = k === 0 ? 0.3 + i * 0.5 : -9, s = pop(u, a), y = 100 + i * 42;
      const ru = k === 0 ? E(u, a + 0.3, a + 1.0) : 1;
      el('line', { x1: VER(r.v), y1: y, x2: lerp(VER(r.v), VX1, ru), y2: y, stroke: [INFO, WARN, GOOD][i], 'stroke-width': 4, opacity: 0.55, 'stroke-linecap': 'round' });
      el('circle', { cx: VER(r.v), cy: y, r: 7 * s, fill: [INFO, WARN, GOOD][i] });
      el('line', { x1: VER(r.v), y1: y, x2: VER(r.v), y2: LY, stroke: [INFO, WARN, GOOD][i], 'stroke-width': 1.4, 'stroke-dasharray': '3 4', opacity: s });
      tx(VER(r.v) - 14, y + 5, r.by, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: s });
      mono(VER(r.v) + 14, y - 10, '≥ ' + r.ver, { 'font-size': 13.5, 'font-weight': 700, fill: [INFO, WARN, GOOD][i], opacity: s }); });
    if (k === 0) { tx(480, 46, '같은 lib 을 세 곳이 서로 다른 버전으로 요구', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      mono(480, 330, '선택: ?', { 'font-size': 20, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    const mx = Math.max(...reqs.map((r) => r.v));
    // v1.9.0 은 공개됐지만 아무도 요구하지 않는다
    const nine = k === 1 ? fade(u, 1.6) : 1;
    el('circle', { cx: VER(9), cy: LY, r: 7, fill: PANEL, stroke: OFF, 'stroke-width': 2.5, opacity: nine });
    tx(VER(9), LY - 16, 'v1.9.0 공개', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: nine });
    tx(VER(9), LY + 50, '요구 없음 → 안 씀', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: nine });
    // 교집합: 모든 광선이 겹치는 시작점 = 최댓값
    const su = k === 1 ? E(u, 0.3, 1.3) : 1;
    el('rect', { x: VER(mx), y: 80, width: (VX1 - VER(mx)) * su, height: 150, fill: ACC, opacity: 0.08 });
    el('line', { x1: VER(mx), y1: 78, x2: VER(mx), y2: LY, stroke: ACC, 'stroke-width': 2.4, opacity: su });
    const ps = k === 1 ? pop(u, 1.2) : 1; el('circle', { cx: VER(mx), cy: LY, r: 10 * ps, fill: ACC });
    const picked = (m.picked || 'v1.6.0');
    card(VER(mx), 340, tw('선택 ' + picked, 18) + 36, 46, { rx: 23, text: '선택 ' + picked, fs: 18, mono: true, fill: ACC, stroke: 'none', color: PANEL, s: ps });
    if (k === 1) { tx(480, 46, '모든 "이상" 요구를 만족하는 가장 낮은 점 = 요구 중 최댓값', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); return; }
    if (k === 2) { terminal(40, 296, 370, 104, ['$ go list -m all | grep lib', '…/lib v1.6.0'], 0.01 + 2 * E(u, 0.2, 1.4), { fs: 14 });
      tx(480, 46, 'require 목록이 아니라 실제 선택을 본다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) }); return; }
    if (k === 3) { // 새 릴리스가 나와도 선택은 그대로
      const s = pop(u, 0.5); el('line', { x1: VER(10), y1: LY - 6, x2: VER(10), y2: LY + 6, stroke: MUT, 'stroke-width': 1.6, opacity: s }); mono(VER(10), LY + 26, 'v1.10', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
      el('circle', { cx: VER(10), cy: LY, r: 8 * s, fill: WARN }); tx(VER(10), LY - 16, '새 릴리스', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: s });
      lock(VER(mx) + (tw('선택 ' + picked, 18) + 36) / 2 + 24, 340, true, ACC, pop(u, 1.3));
      tx(480, 46, '누가 올리기 전까지 go build 결과는 같다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(700, 404, '새 버전 예시 — lock 파일 없이도 재현된다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
  }
  // k4: go mod graph — 누가 어떤 버전을 요구했나
  function mgraph(u, m) {
    const N = { shop: [110, 160], gin: [420, 90], auth: [420, 230], l4: [770, 60], l6: [770, 160], l5: [770, 260] };
    const E2 = [['shop', 'gin', 0.2], ['shop', 'auth', 0.35], ['shop', 'l4', 0.6], ['gin', 'l6', 0.9], ['auth', 'l5', 1.1]];
    E2.forEach(([a, b, at]) => { const gu = E(u, at, at + 0.5), A = N[a], B = N[b]; grow(A[0] + 60, A[1], lerp(A[0] + 60, B[0] - 66, 1), B[1], gu, b === 'l6' ? ACC : MUT, { sw: b === 'l6' ? 3 : 2 }); });
    [['shop', 'shop'], ['gin', 'gin'], ['auth', 'auth']].forEach(([n, s], i) => card(N[n][0], N[n][1], 120, 40, { rx: 8, text: s, fs: 15, mono: true, s: pop(u, 0.1 + i * 0.15) }));
    [['l4', 'lib@v1.4.0', MUT], ['l6', 'lib@v1.6.0', ACC], ['l5', 'lib@v1.5.0', MUT]].forEach(([n, s, col], i) => card(N[n][0], N[n][1], 132, 40, { rx: 8, text: s, fs: 14, mono: true, stroke: col, color: col, sw: n === 'l6' ? 3 : 2, s: pop(u, 0.7 + i * 0.2) }));
    tx(440, 320, 'go mod graph — 최댓값을 요구한 쪽 = gin', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    card(440, 372, 170, 44, { rx: 22, text: '선택 ' + (m.picked || 'v1.6.0'), fs: 17, mono: true, fill: ACC, stroke: 'none', color: PANEL, s: pop(u, 2.0) });
    tx(940, 404, '원치 않게 올라간 버전은 여기서 범인을 찾는다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.2) }); }

  // ---------- 5. go mod tidy ----------
  const IMPORTS = ['github.com/gin-gonic/gin', 'github.com/google/uuid'];
  function s5(t, c) { const { k, u } = c;
    // 왼쪽: 코드의 import (기준)
    const code = doc(30, 40, 400, 'main.go · order/ · pay/', [
      { t: 'import (', col: MUT }, { t: '  "' + IMPORTS[0] + '"', hi: k === 0 ? null : k === 1 ? null : null }, { t: '  "' + IMPORTS[1] + '"', hi: k === 1 ? GOODBG : null }, { t: ')', col: MUT } ], { lh: 26 });
    // 스캔 빛줄기
    if (k === 0) { const y = lerp(code.y + 34, code.y + code.h - 6, E(u, 0.3, 1.8)); el('rect', { x: code.x + 4, y: y - 3, width: code.w - 8, height: 6, rx: 3, fill: INFO, opacity: 0.5 * (1 - fade(u, 1.9)) });
      tx(230, 230, '기준은 go.mod 가 아니라 실제 코드', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    // 오른쪽: go.mod require
    const add = k >= 1, rm = k >= 2, ind = k >= 3;
    const rows = [
      { t: 'require (', col: MUT },
      { t: '  github.com/gin-gonic/gin v1.9.1' },
      add ? { t: '  github.com/google/uuid v1.6.0', typed: k === 1 ? E(u, 0.8, 1.6) : 1, hi: k === 1 ? GOODBG : null, col: GOOD } : null,
      { t: '  github.com/pkg/errors v0.9.1', col: rm ? BAD : INK, strike: k === 2 ? E(u, 0.6, 1.3) : rm ? 1 : 0, op: k === 2 ? 1 - fade(u, 1.8, 0.6) * 0.75 : rm ? 0.25 : 1 },
      ind ? { t: '  golang.org/x/net …  // indirect', typed: k === 3 ? E(u, 0.4, 1.2) : 1, col: INFO, hi: k === 3 ? INFOBG : null } : null,
      { t: ')', col: MUT } ];
    const rr = rows.filter(Boolean), iE = rr.indexOf(rows[3]);
    const gm = doc(520, 40, 410, 'go.mod', rr, { lh: 26, stroke: ACC });
    if (k === 1) { grow(430, code.row(2) - 5, 518, gm.row(2) - 5, E(u, 0.2, 0.8), GOOD);
      pill(470, 300, '추가 — import 하는데 require 에 없음', GOOD, pop(u, 1.6), { fs: 14 }); }
    if (k === 2) { cross(946, gm.row(iE) - 5, 8, pop(u, 1.3));
      pill(700, 300, '제거 — 아무도 import 안 함', BAD, pop(u, 1.5), { fs: 14 });
      tx(480, 350, '안 지우면 쓰지도 않는 모듈이 취약점 스캐너에 걸린다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
    if (k === 3) { tx(540, 272, 'gin 이 쓰는 것 — 내가 직접 import 하진 않는다', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.2) });
      // go.sum 재작성: 줄이 갈아끼워진다
      for (let i = 0; i < 6; i++) { const y = 300 + i * 16, keep = i % 3 !== 2, w = 180 + ((i * 37) % 90), ru = E(u, 1.2 + i * 0.12, 1.5 + i * 0.12);
        el('rect', { x: 640, y, width: w, height: 10, rx: 3, fill: keep ? WARN : BAD, opacity: keep ? 0.55 : 0.55 * (1 - ru) });
        if (!keep) el('rect', { x: 640, y, width: w * ru, height: 10, rx: 3, fill: GOOD, opacity: 0.6 }); }
      tx(620, 314, 'go.sum', { 'font-size': 15, 'font-weight': 800, class: 'mono', 'text-anchor': 'end', fill: WARN, opacity: fade(u, 1.0) });
      tx(620, 336, '실제 필요분으로', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) }); }
    if (k === 4) { // CI 게이트
      const st = [['go mod tidy', 180], ['git diff --exit-code', 480]];
      st.forEach(([s, x], i) => { card(x, 320, tw(s, 15) + 34, 44, { rx: 8, text: s, mono: true, fs: 15, s: pop(u, 0.2 + i * 0.3) }); });
      grow(180 + 66, 320, 480 - 118, 320, E(u, 0.6, 1.0), MUT);
      const tokU = seg(u, 1.0, 1.7); dot([[120, 320], [480, 320]], tokU, ACC, 7);
      [['diff 있음 → exit 1', BAD, 278], ['diff 없음 → exit 0', GOOD, 362]].forEach(([s, col, y], i) => { const gu = E(u, 1.7 + i * 0.25, 2.1 + i * 0.25);
        grow(584, 320, 700, y - 5, gu, col === BAD ? BAD : MUT); tx(712, y, s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: gu, class: 'mono' }); });
      tx(30, 404, '누락·잉여 의존성을 사람 손 없이 막는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); } }

  // ---------- 6. replace · vendor · /v2 ----------
  const GOMOD = ['module github.com/acme/shop', 'go 1.22', 'require (', '  github.com/gin-gonic/gin v1.9.1', '  github.com/acme/authlib/v2 v2.3.0', ')', 'replace github.com/acme/authlib/v2 => ../authlib'];
  function s6(t, c) { const { k, u } = c;
    const hiOf = [[0, 1], [2, 3, 4, 5], [6], [], []][k] || [];
    const rows = GOMOD.map((s, i) => ({ t: s, fs: 13.5, hi: hiOf.includes(i) ? (k === 2 ? WARNBG : true) : null, col: i === 6 ? WARN : i === 4 && k >= 1 ? INK : INK, op: i === 6 && k < 2 ? 0.15 : 1, typed: i === 6 && k === 2 ? E(u, 0.2, 1.0) : null }));
    const gm = doc(24, 30, 430, 'go.mod', rows, { lh: 24, stroke: ACC });
    if (k === 0) { tx(500, 80, '뼈대는 두 줄', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      [['module', 'import 경로의 기준', ACC], ['go', '최소 언어 버전', INFO]].forEach(([a, b, col], i) => { const s = pop(u, 0.5 + i * 0.4);
        pill(560, 130 + i * 56, a, col, s, { mono: true, fs: 15 }); tx(610, 135 + i * 56, b, { 'font-size': 15, opacity: fade(u, 0.7 + i * 0.4) }); });
      tx(500, 280, '대부분은 go get · go mod tidy 가 대신 써 준다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { // v1 과 v2 는 다른 모듈
      [['github.com/acme/authlib', 'v1.x', 600, INFO], ['github.com/acme/authlib/v2', 'v2.x', 600, ACC]].forEach(([p, v, x, col], i) => { const y = 120 + i * 120, s = pop(u, 0.4 + i * 0.5);
        card(700, y, 400, 70, { rx: 10, stroke: col, fill: i ? ACCBG : INFOBG, s });
        mono(518, y - 6, p, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: s }); mono(518, y + 20, '버전 ' + v, { 'font-size': 13.5, fill: MUT, opacity: s }); });
      tx(700, 300, 'major ≥ 2 는 경로 끝에 /v2 — 서로 다른 모듈', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(700, 328, '한 빌드 안에 v1 과 v2 가 함께 있을 수 있다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 2) { // replace: 원격 대신 로컬 폴더
      const yR = gm.row(4) - 5;
      card(820, 90, 200, 48, { rx: 24, text: '원격 v2.3.0', fs: 14.5, stroke: OFF, color: MUT, s: pop(u, 0.2) });
      const cut = E(u, 0.9, 1.2); el('path', { d: `M456,${yR} C600,${yR} 640,90 718,90`, fill: 'none', stroke: OFF, 'stroke-width': 2.2, 'stroke-dasharray': '5 5' }); cross(640, 120, 9, cut > 0 ? pop(u, 0.9) : 0);
      const lu = E(u, 1.1, 1.8); el('path', { d: `M456,${gm.row(6) - 5} C560,${gm.row(6) - 5} 600,250 ${lerp(600, 730, lu)},250`, fill: 'none', stroke: WARN, 'stroke-width': 2.6 });
      folderIco(760, 250, WARN, 1.4 * pop(u, 1.6)); mono(782, 256, '../authlib', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) });
      tx(560, 330, '동료 머신', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); mono(640, 330, '../authlib 없음 → 빌드 실패', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); cross(940, 325, 8, pop(u, 2.2));
      tx(560, 370, '임시로만 쓰고 커밋 전에 걷어낸다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.4) }); return; }
    if (k === 3) { // vendor/
      card(560, 100, 170, 56, { rx: 8, text: '모듈 캐시', fs: 15, s: pop(u, 0.1) });
      folderIco(800, 100, ACC, 1.6 * pop(u, 0.3)); mono(824, 106, 'vendor/', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      for (let i = 0; i < 6; i++) dot([[640, 100], [780, 100]], seg(u, 0.5 + i * 0.15, 1.1 + i * 0.15), ACC, 5);
      terminal(500, 180, 430, 70, ['$ go build -mod=vendor'], Math.max(0.01, E(u, 1.2, 1.8)), { fs: 14 });
      // 네트워크 끊김 표시
      const nu = fade(u, 1.8); el('path', { d: 'M540,300 q30,-24 60,0 M552,312 q18,-14 36,0', fill: 'none', stroke: MUT, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: nu }); cross(570, 310, 12, pop(u, 1.9));
      tx(620, 312, '네트워크 없이 빌드', { 'font-size': 15, 'font-weight': 700, opacity: nu }); check(790, 306, 10, pop(u, 2.1));
      tx(500, 370, 'tidy 뒤엔 go mod vendor 를 다시 — 안 맞으면 빌드가 멈춘다', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    // k4: import 에도 /v2, 그리고 함정 넷
    spans(490, 70, [['import "github.com/acme/authlib', { fill: INK }], ['/v2', { fill: ACC, 'font-weight': 800 }], ['"', { fill: INK }]], { 'font-size': 15, opacity: fade(u, 0.2) }); check(940, 64, 9, pop(u, 0.4));
    spans(490, 104, [['import "github.com/acme/authlib"', { fill: MUT }]], { 'font-size': 15, opacity: fade(u, 0.6) }); cross(940, 98, 8, pop(u, 0.8));
    const traps = ((c.beat.graph && c.beat.graph.traps) || []);
    traps.forEach((tp, i) => { const y = 160 + i * 60, s = pop(u, 1.0 + i * 0.3), col = tp.tone === 'danger' ? BAD : WARN;
      card(710, y, 440, 50, { rx: 10, stroke: col, fill: tp.tone === 'danger' ? BADBG : WARNBG, s });
      tx(504, y - 3, tp.t, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.1 + i * 0.3) });
      tx(504, y + 17, tp.why, { 'font-size': 13.5, fill: INK, opacity: fade(u, 1.1 + i * 0.3) }); }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '다른 코드가 shop 모듈의 order 패키지를 쓸 때 import 경로는 무엇인가?',
      o: ['"order"', '"github.com/acme/shop/order"', '"$GOPATH/src/order"'], a: 1,
      why: 'import 경로는 go.mod의 module 경로 github.com/acme/shop 뒤에 하위 폴더 /order를 붙여 만든다.' },
    { q: 'go mod init github.com/acme/shop이 go.mod 첫 줄에 쓰는 것은 무엇인가?',
      o: ['module github.com/acme/shop', 'require github.com/acme/shop', 'go github.com/acme/shop'], a: 0,
      why: '인자로 준 경로가 그대로 module 지시자가 된다. 이 경로가 남들이 쓰는 import 접두사다.' },
    { q: 'go get 뒤 go.sum에 생기는 두 줄이 담는 것은 무엇인가?',
      o: ['gin의 소스 코드 사본', '최신 버전 번호와 릴리스 날짜', '모듈 zip의 해시와 그 모듈 go.mod의 해시'], a: 2,
      why: 'h1: 해시 두 줄이 내용을 잠근다. 다음 빌드에서 받은 코드의 해시가 다르면 빌드를 거부한다.' },
    { q: 'shop이 lib v1.4.0, gin이 v1.6.0, auth가 v1.5.0을 요구하고 v1.9.0이 공개돼 있다. MVS가 고르는 버전은 무엇인가?',
      o: ['v1.4.0', 'v1.9.0', 'v1.6.0'], a: 2,
      why: '요구는 "이 버전 이상" 이므로 셋을 모두 만족하는 가장 낮은 점은 최댓값 v1.6.0이다. 아무도 요구하지 않은 v1.9.0은 쓰지 않는다.' },
    { q: 'go mod tidy가 require를 고칠 때 기준으로 삼는 것은 무엇인가?',
      o: ['코드가 실제로 import 하는 패키지', 'go.sum에 적힌 해시 목록', '모듈 프록시의 최신 버전'], a: 0,
      why: 'tidy는 import를 전부 훑어 없는 require는 넣고 아무도 안 쓰는 require는 지운다. 코드가 정답이다.' },
    { q: 'go.mod에 replace github.com/acme/authlib/v2 => ../authlib를 남긴 채 커밋하면 무슨 일이 생기나?',
      o: ['모두가 자동으로 원격 v2.3.0을 받는다', '../authlib 폴더가 없는 사람의 빌드가 깨진다', 'vendor/ 폴더가 자동으로 생긴다'], a: 1,
      why: 'replace는 모듈을 내 로컬 경로로 갈아끼운다. 그 경로가 없는 동료나 CI에서는 빌드가 실패한다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'go.mod가 있는 폴더 트리가 모듈 하나이고, import 경로는 module 경로에 폴더를 붙여 정해진다.',
    'go get은 require 한 줄을 넣고 go.sum에 해시를 남긴다. 두 파일은 함께 커밋한다.',
    'MVS는 요구된 버전 중 최댓값을 고르고 그 위로는 올리지 않아서 빌드가 재현된다.',
    'tidy는 코드에 맞춰 require를 고치고, replace는 임시로만, major 2 이상은 경로에 /v2를 붙인다.',
  ];
  const review = [
    { q: '동료가 go.mod만 커밋하고 go.sum은 빠뜨렸다. CI에서 먼저 걱정할 일은?',
      o: ['받아 온 의존성 코드를 검증할 해시가 없다', 'MVS가 최신 버전을 고르게 된다', 'module 경로가 바뀐다'], a: 0,
      why: 'go.sum은 모듈 zip과 go.mod의 해시를 담는다. 빠지면 받은 코드가 그 버전 그대로인지 확인할 기준이 사라진다.' },
    { q: 'lib v1.9.0이 공개됐는데 go list -m all에는 여전히 v1.6.0이 나온다. 올바른 판단은?',
      o: ['go.sum이 깨졌으니 지우고 다시 받는다', '프록시 캐시가 늦었으니 기다린다', '아무도 v1.9.0을 요구하지 않아 MVS가 v1.6.0을 고른 정상 결과다'], a: 2,
      why: 'MVS는 요구된 버전 중 최댓값만 쓴다. 올리고 싶으면 go get으로 v1.9.0을 명시해 요구를 바꾼다.' },
    { q: 'import "github.com/acme/authlib"로 v2 기능을 쓰려는데 계속 v1이 받아진다. 고칠 곳은?',
      o: ['replace로 원격 저장소를 다시 지정한다', 'import와 require 경로 끝에 /v2를 붙인다', 'go mod vendor를 다시 돌린다'], a: 1,
      why: 'major 2 이상은 경로 끝에 /v2가 붙는 별개의 모듈이다. 경로에 /v2가 없으면 v1 모듈을 찾는다.' },
  ];

  R.page({ title: 'go.mod 들여다보기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
