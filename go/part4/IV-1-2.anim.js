/* IV-1-2 go test — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 테스트 표(name·a·b·want·got), 표를 도는 tc 커서, t.Run 서브테스트 가지, 루프 변수 캡처, TestMain 생명주기, mock 주입.
 * 케이스 값은 STEPS 의 cases 와 코드 블록에서 읽는다. 실행 시간(0.003s)과 커버리지 82.0% 는 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, lock, spans, terminal, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const stamp = (x, y, ok, s) => card(x, y, 62, 26, { rx: 13, text: ok ? 'PASS' : 'FAIL', fs: 13.5, fw: 800, fill: ok ? GOOD : BAD, stroke: 'none', color: PANEL, s, mono: true });

  // 테스트 표: cols [{h, w, sub}], rows [[셀…]], o.style(r, c) → {fill, stroke, color}, o.rowS(r) 등장 0→1
  function table(x, y, cols, rows, o) { o = o || {}; const rh = o.rh || 38, hh = 34;
    let cx = x; const X = cols.map((c) => { const v = cx; cx += c.w; return v; }), W = cx - x;
    el('rect', { x, y, width: W, height: hh, rx: 6, fill: SOFT, opacity: o.hop ?? 1 });
    cols.forEach((c, i) => { tx(X[i] + 12, y + 22, c.h, { 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: c.col || INK, opacity: o.hop ?? 1 });
      if (c.sub && o.subs) mono(X[i] + 12 + tw(c.h, 14.5) + 6, y + 22, c.sub, { 'font-size': 13.5, fill: MUT, opacity: o.subs }); });
    rows.forEach((r, ri) => { const s = o.rowS ? o.rowS(ri) : 1; if (s <= 0) return; const yy = y + hh + ri * rh;
      el('line', { x1: x, y1: yy + rh, x2: x + W, y2: yy + rh, stroke: GRID, 'stroke-width': 1.2, opacity: s });
      r.forEach((v, ci) => { if (v == null || v === '') return; const st = (o.style && o.style(ri, ci)) || {};
        if (st.fill) el('rect', { x: X[ci] + 3, y: yy + 4, width: cols[ci].w - 6, height: rh - 8, rx: 5, fill: st.fill, stroke: st.stroke || 'none', 'stroke-width': 2, opacity: s * (st.op ?? 1) });
        mono(X[ci] + 12, yy + rh / 2 + 5, String(v), { 'font-size': 14.5, 'font-weight': ci === 0 ? 700 : 500, fill: st.color || INK, opacity: s * (st.op ?? 1) }); }); });
    return { X, W, row: (ri) => y + hh + ri * rh, rh, x, y }; }

  // ---------- 1. testing 패키지 ----------
  function s1(t, c) { const { k, u } = c, cs = c.beat.cases || [];
    if (k === 0) { const files = ['calc.go', 'calc_test.go', 'helper.go'];
      files.forEach((f, i) => { const y = 90 + i * 64, isT = f.endsWith('_test.go'), s = pop(u, 0.2 + i * 0.2);
        card(170, y, 220, 46, { rx: 8, text: f, mono: true, fs: 16, stroke: isT ? ACC : GRID, color: isT ? ACC : MUT, s, fill: isT && u > 1.2 ? ACCBG : PANEL }); });
      card(520, 154, 150, 56, { rx: 10, text: 'go test', mono: true, fs: 17, fill: INK, color: PANEL, stroke: 'none', s: pop(u, 0.6) });
      grow(282, 154, 440, 154, E(u, 0.9, 1.3), ACC);
      fly(170, 154, 760, 154, seg(u, 1.3, 2.0), 'calc_test.go', { mono: true, stay: true });
      note(660, 214, '_test.go 로 끝나는 파일만 수집', fade(u, 1.8), { fill: ACC });
      pill(760, 280, 'import "testing"', INFO, pop(u, 2.1), { mono: true, fs: 15 });
      note(60, 330, '프레임워크 설치 없음 — 표준 testing 과 go test 뿐', fade(u, 2.4), { fill: MUT, 'font-size': 14.5 }); return; }
    if (k === 1) { const fns = [['TestAdd', true], ['testAdd', false], ['Testadd', false]];
      fns.forEach(([n, ok], i) => { const y = 90 + i * 84, s = pop(u, 0.2 + i * 0.4), op = fade(u, 0.4 + i * 0.4);
        card(270, y, 420, 56, { rx: 10, stroke: ok ? GOOD : OFF, fill: ok ? GOODBG : SOFT, s });
        spans(78, y + 6, [['func ', { fill: INFO, 'font-weight': 700 }], [n, { 'font-weight': 800, fill: ok ? INK : MUT }], ['(t *testing.T)', { fill: MUT }]], { 'font-size': 16, opacity: op });
        if (ok) { check(520, y, 11, pop(u, 0.8)); note(560, y + 6, '실행된다', fade(u, 0.9), { fill: GOOD, 'font-weight': 800 }); }
        else note(520, y + 6, i === 1 ? '소문자 t — 테스트가 아니다' : 'Test 뒤가 소문자 — 스킵', fade(u, 1.0 + i * 0.3), { fill: MUT }); });
      banner(480, 370, '규칙 위반은 실패가 아니라 조용한 스킵', pop(u, 2.0)); return; }
    if (k === 2) { // Add(2,3) → got, want
      ['2', '3'].forEach((v, i) => { card(90, 130 + i * 70, 56, 48, { rx: 8, text: v, mono: true, fs: 20, s: pop(u, 0.2 + i * 0.2) }); dot([[118, 130 + i * 70], [260, 165]], seg(u, 0.6, 1.2), INFO, 6); });
      card(320, 165, 120, 70, { rx: 12, text: 'Add', mono: true, fs: 20, fill: INFOBG, stroke: INFO, color: INFO, s: pop(u, 0.4) });
      grow(382, 165, 520, 165, E(u, 1.2, 1.5), MUT);
      card(600, 165, 130, 70, { rx: 12, text: 'got\n5', mono: true, fs: 18, s: pop(u, 1.5), stroke: INK });
      card(780, 165, 130, 70, { rx: 12, text: 'want\n5', mono: true, fs: 18, s: pop(u, 1.9), stroke: ACC, color: ACC });
      mono(690, 172, '==', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2), fill: GOOD });
      note(480, 330, 'got · want 이름 쌍 → 실패 메시지도 "got X want Y"', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    if (k === 3) { // Errorf 는 계속, Fatalf 는 멈춘다
      [['t.Errorf', '기록하고 계속', GOOD], ['t.Fatalf', '그 테스트를 즉시 중단', BAD]].forEach(([f, d, col], i) => { const y = 110 + i * 120, a = 0.3 + i * 0.7;
        mono(40, y + 5, f, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, a - 0.2) });
        const end = i === 0 ? 880 : 470, gu = E(u, a, a + 1.0);
        el('line', { x1: 160, y1: y, x2: lerp(160, end, gu), y2: y, stroke: INK, 'stroke-width': 3 });
        if (gu > 0.32) cross(400, y, 9, 1);
        if (i === 1 && gu >= 1) { el('rect', { x: 472, y: y - 26, width: 8, height: 52, fill: BAD }); }
        if (i === 0 && gu >= 1) el('circle', { cx: 880, cy: y, r: 6, fill: INK });
        note(i === 0 ? 560 : 500, y - 16, d, fade(u, a + 0.8), { fill: col }); });
      cs.forEach((r, i) => { stamp(720 + i * 0, 330 + i * 36, r.pass, pop(u, 2.0 + i * 0.2)); mono(640, 335 + i * 36, r.name, { 'font-size': 14.5, 'text-anchor': 'end', opacity: fade(u, 2.0 + i * 0.2) }); }); return; }
    // k4: 실행 결과
    terminal(60, 40, 840, 300, ['$ go test ./...', ['ok  \tcalc\t0.003s', 'var(--term)'], '$ go test -v ./...', ['=== RUN   TestAdd', 'var(--term)'], ['--- PASS: TestAdd (0.00s)', '#4ade80'], ['PASS', '#4ade80'], ['ok  \tcalc\t0.003s', 'var(--term)']], 0.01 + 7 * E(u, 0.1, 2.0), { fs: 15, lh: 30 });
    note(60, 380, './... = 모듈 전체를 재귀로 · -v = 케이스별 출력', fade(u, 2.2)); sub(880, 380, '시간은 예시', fade(u, 2.2), { 'text-anchor': 'end' }); }

  // ---------- 2. 테이블 주도 테스트 ----------
  const COLS = [{ h: 'name', w: 150, sub: 'string' }, { h: 'a', w: 90, sub: 'int' }, { h: 'b', w: 90, sub: 'int' }, { h: 'want', w: 110, sub: 'int' }, { h: 'got', w: 110, col: INFO }, { h: '', w: 90 }];
  function s2(t, c) { const { k, u } = c, cs = c.beat.cases || [];
    const rows = k === 0 ? [] : cs.map((r) => { const [a, b] = r.input.split(',').map((s) => s.trim()); return [r.name, a, b, r.want, '', '']; });
    const n = rows.length, cur = k === 2 ? Math.min(n - 1, Math.floor(E(u, 0.2, 2.4) * n)) : k === 3 ? Math.min(n - 1, Math.floor(E(u, 0.2, 2.4) * n)) : -1;
    const fillTo = k >= 4 ? n : k === 3 ? Math.floor(E(u, 0.2, 2.4) * n + 0.6) : 0;
    rows.forEach((r, i) => { if (i < fillTo) { r[4] = cs[i].got; r[5] = '✓'; } });
    const T = table(130, 50, COLS, rows, { subs: k === 0 ? fade(u, 0.6) : 1, rowS: (ri) => (k === 1 ? pop(u, 0.3 + ri * 0.4) : 1),
      style: (ri, ci) => (ci === 4 && rows[ri][4] !== '' ? { color: INFO } : ci === 5 ? { color: GOOD } : (k === 2 || k === 3) && ri === cur ? { fill: INFOBG } : {}) });
    if (k === 0) { note(130, 150, 'tests := []struct{ name string; a, b int; want int }', fade(u, 1.0), { class: 'mono', 'font-size': 14.5 });
      note(130, 190, '케이스 한 줄의 모양을 먼저 정한다 — 익명 구조체로 충분', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 1) { note(130, T.row(n) + 34, '새 케이스 = 표에 한 줄 추가 · 정상값 · 0 · 음수 · 혼합', fade(u, 2.0), { fill: ACC }); return; }
    // tc 커서
    if (cur >= 0) { const yy = T.row(cur) + T.rh / 2; el('path', { d: `M${112},${yy - 10} L${124},${yy} L${112},${yy + 10} Z`, fill: INFO });
      mono(104, yy + 5, 'tc', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'end' }); }
    if (k === 2) { note(130, T.row(n) + 34, 'for _, tc := range tests — 검증 로직은 이 루프 안 한 곳', fade(u, 0.4), { class: 'mono', 'font-size': 14.5 }); return; }
    if (k === 3) { note(130, T.row(n) + 34, 'got := Add(tc.a, tc.b) 를 tc.want 와 비교', fade(u, 0.4), { class: 'mono', 'font-size': 14.5 }); return; }
    // k4: 실패 메시지 틀 — 어느 칸이 어느 자리에 들어가나
    const y = T.row(n) + 40;
    spans(60, y, [['t.Errorf("', { fill: MUT }], ['%s', { fill: ACC, 'font-weight': 800 }], [': Add(%d,%d)=%d want %d"', { fill: INK }], [', ', { fill: MUT }], ['tc.name', { fill: ACC, 'font-weight': 800 }], [', tc.a, tc.b, got, tc.want)', { fill: MUT }]], { 'font-size': 15, opacity: fade(u, 0.3) });
    const nx = T.X[0] + 40; grow(nx, T.row(n) + 2, 60 + tw('t.Errorf("', 15) + 10, y - 20, E(u, 1.0, 1.6), ACC);
    note(60, y + 34, 'tc.name 이 없으면 어떤 줄이 깨졌는지 알 수 없다', fade(u, 1.8), { fill: WARN }); }

  // ---------- 3. t.Run 서브테스트 ----------
  const SCOLS = [{ h: 'name', w: 130 }, { h: 'a', w: 56 }, { h: 'b', w: 56 }, { h: 'want', w: 80 }];
  function s3(t, c) { const { k, u } = c, cs = (c.beat.cases || []).filter((r) => r.input.includes(','));
    const rows = k === 0 ? [] : cs.map((r) => { const [a, b] = r.input.split(',').map((s) => s.trim()); return [r.name, a, b, r.want]; });
    const T = table(30, 40, SCOLS, rows, { rowS: (ri) => (k === 1 ? pop(u, 0.3 + ri * 0.4) : 1),
      style: (ri, ci) => (cs[ri] && !cs[ri].pass && ci === 3 ? { fill: BADBG, stroke: BAD, color: BAD } : ci === 0 && k >= 0 ? { color: ACC } : {}) });
    if (k === 0) { const s = pop(u, 0.5); el('rect', { x: 30, y: 40, width: 130, height: 34, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: s });
      grow(96, 76, 300, 140, E(u, 0.8, 1.4), ACC); note(310, 150, 'name 이 곧 t.Run 에 넘길 서브테스트 이름', fade(u, 1.4), { fill: ACC });
      note(310, 180, 'TestAddSub/positive 처럼 계층 이름이 붙는다', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 1) { const bad = cs.findIndex((r) => !r.pass);
      if (bad >= 0) { note(370, T.row(bad) + 25, `${cs[bad].input.replace(', ', '+')} = ${cs[bad].got} 인데 want ${cs[bad].want} — 일부러 틀림`, fade(u, 1.8), { fill: BAD }); } return; }
    // 서브테스트 가지
    const root = [470, 210], leaf = (i) => [700, 110 + i * 100];
    card(root[0], root[1], 150, 44, { rx: 8, text: 'TestAddSub', mono: true, fs: 15, fill: INK, color: PANEL, stroke: 'none' });
    cs.forEach((r, i) => { const a = k === 2 ? 0.2 + i * 0.6 : -9, gu = k === 2 ? E(u, a, a + 0.4) : 1, [lx, ly] = leaf(i);
      el('path', { d: `M${root[0] + 75},${root[1]} C${root[0] + 120},${root[1]} ${lx - 140},${ly} ${lerp(root[0] + 75, lx - 90, gu)},${ly}`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: gu });
      if (gu <= 0.05) return; const hot = k === 4 && r.name !== 'overflow';
      card(lx, ly, 180, 40, { rx: 8, text: '/' + r.name, mono: true, fs: 15, s: pop(u, k === 2 ? a + 0.3 : -9), stroke: r.pass ? INK : BAD, color: r.pass ? INK : BAD, op: hot ? 0.3 : 1 });
      mono(lx - 82, ly - 26, 't *testing.T', { 'font-size': 13.5, fill: MUT, opacity: (k === 2 ? fade(u, a + 0.4) : 1) * (hot ? 0.3 : 1) });
      stamp(lx + 140, ly, r.pass, k === 2 ? pop(u, a + 0.5) : 1); });
    if (k === 2) { note(30, 330, '하나가 실패해도 나머지는 계속 돈다', fade(u, 2.2), { fill: GOOD }); note(30, 360, '케이스마다 자기 t 를 받는다 → Fatalf 도 그 가지만 멈춘다', fade(u, 2.4), { fill: MUT, 'font-size': 14 }); return; }
    const bad = cs.find((r) => !r.pass) || { want: '5', got: '4' };
    if (k === 3) { card(110, 300, 120, 60, { rx: 10, text: 'want\n' + bad.want, mono: true, fs: 17, stroke: ACC, color: ACC, s: pop(u, 0.3) });
      card(290, 300, 120, 60, { rx: 10, text: 'got\n' + bad.got, mono: true, fs: 17, stroke: BAD, color: BAD, s: pop(u, 0.6) });
      mono(200, 307, '≠', { 'font-size': 24, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      spans(30, 392, [['t.Errorf("got %d want %d") → ', { fill: MUT }], [`got ${bad.got} want ${bad.want}`, { fill: BAD, 'font-weight': 800 }]], { 'font-size': 14.5, opacity: fade(u, 1.5) });
      return; }
    // k4: 실패 출력과 -run 재현
    terminal(20, 262, 440, 150, [['--- FAIL: TestAddSub (0.00s)', '#f87171'], ['    --- FAIL: TestAddSub/overflow (0.00s)', '#f87171'], ['        …_test.go:15: got 4 want 5', 'var(--term)'], "$ go test -run 'TestAddSub/overflow'"], 0.01 + 4 * E(u, 0.1, 1.8), { fs: 13.5 });
    note(480, 404, '이름의 공백은 _ 로 바뀐다: "case 1" → case_1', fade(u, 2.2), { fill: WARN, 'font-size': 14 }); }

  // ---------- 4. 병렬 · 커버리지 ----------
  function s4(t, c) { const { k, u } = c, cs = c.beat.cases || [], names = cs.map((r) => r.name);
    if (k === 0) { // 루프 변수 캡처
      tx(40, 46, 'Go 1.22 미만 · 복사 없음', { 'font-size': 15.5, 'font-weight': 800, fill: BAD });
      tx(520, 46, 'tc := tc 로 복사', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
      const step = Math.min(2, Math.floor(E(u, 0.2, 1.2) * 3));
      card(220, 110, 170, 46, { rx: 8, text: 'tc = ' + names[step], mono: true, fs: 15, stroke: BAD, color: BAD });
      names.forEach((nm, i) => { const x = 90 + i * 130; grow(x, 240, 220 - 30 + i * 30, 136, fade(u, 0.3 + i * 0.2), BAD, { sw: 1.8 });
        card(x, 270, 116, 54, { rx: 8, text: 'go func\n' + (u > 1.3 ? names[2] : '…'), mono: true, fs: 13.5, stroke: u > 1.3 ? BAD : INK, color: u > 1.3 ? BAD : INK }); });
      note(40, 340, '셋 다 마지막 케이스만 본다', fade(u, 1.5), { fill: BAD });
      names.forEach((nm, i) => { const x = 590 + i * 130, s = pop(u, 1.4 + i * 0.2);
        card(x, 120, 116, 44, { rx: 8, text: nm, mono: true, fs: 14, stroke: GOOD, color: GOOD, s }); grow(x, 240, x, 146, fade(u, 1.6 + i * 0.2), GOOD, { sw: 1.8 });
        card(x, 270, 116, 54, { rx: 8, text: 'go func\n' + nm, mono: true, fs: 13.5, stroke: GOOD, s }); });
      note(520, 340, '케이스마다 자기 복사본', fade(u, 2.2), { fill: GOOD });
      note(40, 396, 'Go 1.22 부터는 반복마다 새 변수라 이 줄이 필요 없다', fade(u, 2.5), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 1 || k === 2) { // 순차 vs 병렬 타임라인
      const x0 = 160, L = 230;
      tx(40, 70, '순차', { 'font-size': 15, 'font-weight': 800 }); tx(40, 210, 't.Parallel()', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC });
      names.forEach((nm, i) => { const sg = k === 1 ? E(u, 0.2 + i * 0.5, 0.7 + i * 0.5) : 1, pg = k === 1 ? E(u, 1.0, 2.0) : 1;
        el('rect', { x: x0 + i * L, y: 52, width: (L - 6) * sg, height: 30, rx: 5, fill: OFF });
        mono(x0 + i * L + 10, 72, nm, { 'font-size': 14, fill: INK, opacity: sg > 0.4 ? 1 : 0 });
        el('rect', { x: x0, y: 150 + i * 38, width: (L - 6) * pg, height: 30, rx: 5, fill: ACC, opacity: 0.8 });
        mono(x0 + 10, 170 + i * 38, nm, { 'font-size': 14, fill: PANEL, opacity: pg > 0.4 ? 1 : 0 }); });
      el('line', { x1: x0 + L, y1: 140, x2: x0 + L, y2: 270, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: k === 1 ? fade(u, 2.0) : 1 });
      if (k === 1) note(x0 + L + 16, 230, 'IO 대기·sleep 이 많을수록 이득이 크다', fade(u, 2.1), { fill: ACC, 'font-size': 14.5 });
      if (k === 2) { card(700, 340, 150, 44, { rx: 8, text: '전역 변수', fs: 15, stroke: BAD, color: BAD, s: pop(u, 0.3) });
        [0, 1].forEach((i) => grow(x0 + L - 10, 165 + i * 38, 630, 330 + i * 10, E(u, 0.6 + i * 0.3, 1.1 + i * 0.3), BAD, { dash: '5 4' }));
        cross(560, 300, 10, pop(u, 1.4));
        note(40, 340, '비교 코드는 그대로 · tc 복사본만 읽는다', fade(u, 1.6), { 'font-size': 14.5 });
        note(40, 372, '공유 상태를 건드리면 간헐적으로 깨진다 → -race', fade(u, 2.0), { fill: BAD, 'font-size': 14.5 }); }
      return; }
    // k3: 커버리지
    const lines = ['func Div(a, b int) (int, error) {', '    if b == 0 {', '        return 0, ErrDivZero', '    }', '    return a / b, nil', '}'];
    const cov = [1, 1, 0, 1, 1, 1];
    lines.forEach((s, i) => { const y = 70 + i * 34, a = fade(u, 0.2 + i * 0.15);
      el('rect', { x: 40, y: y - 22, width: 470, height: 30, rx: 4, fill: i === 0 || i === 3 || i === 5 ? 'none' : cov[i] ? GOODBG : BADBG, opacity: a });
      mono(52, y, s, { 'font-size': 14.5, fill: cov[i] || i === 3 || i === 5 ? INK : BAD, opacity: a }); });
    note(40, 300, '빨간 줄 = 테스트가 한 번도 안 지난 에러 경로', fade(u, 1.4), { fill: BAD });
    const pct = 82 * E(u, 0.6, 2.0);
    tx(600, 90, 'go test -cover', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    el('rect', { x: 600, y: 110, width: 300, height: 24, rx: 12, fill: SOFT }); el('rect', { x: 600, y: 110, width: 300 * pct / 100, height: 24, rx: 12, fill: ACC });
    mono(900, 162, pct.toFixed(1) + '%', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); sub(600, 162, '예시', 1, { 'text-anchor': 'start' });
    note(600, 230, '숫자를 올리기보다', fade(u, 2.0)); note(600, 258, '빠진 경로를 찾는 도구', fade(u, 2.2), { fill: ACC }); }

  // ---------- 5. TestMain 생명주기 ----------
  const LX = { go: 70, main: 200, setup: 330, run: 540, tear: 760, exit: 885 };
  function s5(t, c) { const { k, u } = c, cs = c.beat.cases || [], Y = 120;
    card(LX.go, Y, 100, 44, { rx: 8, text: 'go test', mono: true, fs: 15, fill: INK, color: PANEL, stroke: 'none' });
    if (k === 0) { el('path', { d: `M120,${Y + 10} C250,${Y + 120} 450,${Y + 120} ${LX.run - 40},${Y + 40}`, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.2) });
      note(300, Y + 120, 'TestMain 이 없으면 바로 Test 들을 돌린다', fade(u, 0.4), { fill: MUT, 'font-size': 14 });
      card(LX.run, Y + 50, 130, 40, { rx: 8, text: 'TestXxx …', mono: true, fs: 14, stroke: OFF, color: MUT }); }
    grow(LX.go + 52, Y, LX.main - 72, Y, k === 0 ? E(u, 0.8, 1.3) : 1, ACC);
    card(LX.main, Y, 140, 48, { rx: 8, text: 'TestMain(m)', mono: true, fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 1.2) : 1 });
    if (k === 0) { note(LX.main - 70, Y + 60, '패키지 테스트 전·후 딱 한 번', fade(u, 1.8), { fill: ACC }); note(LX.main - 70, Y + 230, '패키지마다 하나만 둘 수 있다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    // setup
    const sOn = k === 1 ? E(u, 0.4, 1.2) : 1;
    dbIcon(LX.setup, Y + 120, 'test DB', { stroke: k >= 3 ? MUT : ACC, s: 0.8 });
    grow(LX.main, Y + 26, LX.setup - 30, Y + 82, k === 1 ? E(u, 0.2, 0.6) : 1, MUT);
    mono(LX.setup, Y - 40, 'setup', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    if (k === 1) { note(LX.setup - 60, Y + 210, 'db = openTestDB() — 모두가 함께 쓰는 준비물', fade(u, 1.2)); pill(LX.setup, Y + 40, k >= 3 ? 'closed' : 'ready', GOOD, pop(u, 1.4), { mono: true }); return; }
    pill(LX.setup, Y + 40, k >= 3 ? 'closed' : 'ready', k >= 3 ? MUT : GOOD, 1, { mono: true });
    // m.Run
    zone(LX.run - 95, Y - 50, 190, 170, 'code := m.Run()', { fill: SOFT });
    const tests = cs.filter((r) => !r.phase);
    tests.forEach((r, i) => { const y = Y + i * 50, g = k === 2 ? E(u, 0.3 + i * 0.6, 0.9 + i * 0.6) : 1;
      el('rect', { x: LX.run - 80, y: y - 12, width: 160, height: 34, rx: 6, fill: SOFT, stroke: GRID });
      el('rect', { x: LX.run - 80, y: y - 12, width: 160 * g, height: 34, rx: 6, fill: GOODBG });
      mono(LX.run - 70, y + 10, r.name, { 'font-size': 14, 'font-weight': 700 }); if (g >= 1) check(LX.run + 66, y + 5, 7, 1); });
    if (k === 2) { mono(LX.run, Y + 140, 'code = 0', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      note(LX.run - 95, Y + 180, '모두 PASS 라 0 — 하나라도 실패면 0 이 아니다', fade(u, 2.3), { 'font-size': 14 }); return; }
    mono(LX.run, Y + 140, 'code = 0', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
    // teardown · os.Exit
    mono(LX.tear, Y - 40, 'teardown', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: k === 3 ? fade(u, 0.2) : 1 });
    card(LX.tear, Y, 120, 40, { rx: 8, text: 'db.Close()', mono: true, fs: 14, stroke: WARN, color: WARN, s: k === 3 ? pop(u, 0.3) : 1 });
    grow(LX.tear + 62, Y, LX.exit - 62, Y, k === 3 ? E(u, 0.8, 1.2) : 1, MUT);
    card(LX.exit, Y, 116, 40, { rx: 8, text: 'os.Exit(code)', mono: true, fs: 13.5, s: k === 3 ? pop(u, 1.1) : 1 });
    if (k === 3) { pill(LX.exit - 20, Y + 60, 'CI ← exit 0', GOOD, pop(u, 1.5), { mono: true });
      note(560, 340, 'os.Exit(0) 처럼 고정하면 실패가 가려진다', fade(u, 1.9), { fill: BAD, 'font-size': 14.5 });
      note(560, 370, 'os.Exit 는 defer 를 돌리지 않는다 — 정리는 그 앞에', fade(u, 2.2), { fill: WARN, 'font-size': 14.5 });
      note(560, 400, 'Go 1.15+: 그냥 반환해도 m.Run 결과로 끝난다', fade(u, 2.5), { fill: MUT, 'font-size': 14 }); return; }
    // k4: 케이스별 정리 — t.TempDir · t.Cleanup
    el('rect', { x: 30, y: 280, width: 900, height: 120, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(50, 304, 'TestQuery', { 'font-size': 15, 'font-weight': 800 });
    const pr = E(u, 0.3, 2.2); el('line', { x1: 180, y1: 340, x2: 880, y2: 340, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    el('line', { x1: 180, y1: 340, x2: lerp(180, 880, pr), y2: 340, stroke: INFO, 'stroke-width': 6, 'stroke-linecap': 'round' });
    const tmpOn = pr > 0.05 && pr < 0.97;
    card(260, 376, 170, 32, { rx: 6, text: 't.TempDir()', mono: true, fs: 14, stroke: tmpOn ? ACC : OFF, color: tmpOn ? ACC : MUT, s: pop(u, 0.4) });
    card(470, 376, 230, 32, { rx: 6, text: 't.Cleanup(resetTable)', mono: true, fs: 14, stroke: INFO, color: INFO, s: pop(u, 0.8) });
    if (pr >= 1) { cross(780, 376, 8, pop(u, 2.2)); note(800, 382, '임시 폴더 삭제', 1, { 'font-size': 14, fill: MUT }); check(780, 306, 8, pop(u, 2.4)); note(800, 312, '테이블 리셋', 1, { 'font-size': 14, fill: GOOD }); } }

  // ---------- 6. mock 주입과 에러 케이스 ----------
  function s6(t, c) { const { k, u } = c, cs = c.beat.cases || [];
    const svc = [170, 150];
    card(svc[0], svc[1], 180, 90, { rx: 12, text: 'Service', fs: 18, fw: 800, stroke: INK });
    // 인터페이스 소켓
    el('rect', { x: svc[0] + 90, y: svc[1] - 24, width: 22, height: 48, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 });
    mono(svc[0] - 80, svc[1] - 64, 'UserRepo interface', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.3) : 1 });
    mono(svc[0] - 80, svc[1] + 76, 'Find(id int) (*User, error)', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 });
    if (k === 0) { [['진짜 DB 구현', 110, OFF], ['mockRepo', 230, ACC]].forEach(([n, y, col], i) => { const s = pop(u, 1.0 + i * 0.4);
        card(520, y, 170, 48, { rx: 10, text: n, fs: 15, mono: i === 1, stroke: col, color: i ? ACC : MUT, s }); grow(434, y, 290, svc[1], E(u, 1.2 + i * 0.4, 1.6 + i * 0.4), i ? ACC : OFF, { dash: i ? null : '5 5' }); });
      note(40, 340, '필요한 동작만 좁게 선언 → 무엇이든 끼울 수 있다', fade(u, 2.1)); return; }
    // mock 이 꽂혀 있다
    const plug = k === 1 ? E(u, 0.1, 0.6) : 1;
    card(lerp(520, 380, plug), svc[1], 150, 54, { rx: 10, text: 'mockRepo', mono: true, fs: 15, stroke: ACC, color: ACC, fill: ACCBG });
    if (k === 1) { const outs = [['id = 1', '&User{Alice}, nil', GOOD], ['id = 99', 'nil, ErrNotFound', WARN], ['fail = true', 'nil, ErrDB', BAD]];
      outs.forEach(([a, b, col], i) => { const y = 270 + i * 44, s = pop(u, 0.8 + i * 0.45);
        pill(140, y, a, INK, s, { mono: true, fs: 14 }); grow(200, y, 330, y, E(u, 0.9 + i * 0.45, 1.2 + i * 0.45), col); mono(344, y + 5, b, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.1 + i * 0.45) }); });
      note(560, 300, '네트워크도 진짜 DB 도 없이', fade(u, 2.2), { fill: MUT }); note(560, 330, '에러 경로를 마음대로 만든다', fade(u, 2.4), { fill: ACC }); return; }
    // 표
    const COLS6 = [{ h: 'name', w: 150 }, { h: 'id', w: 60 }, { h: 'fail', w: 70 }, { h: 'wantErr', w: 140 }, { h: '', w: 50 }];
    const rows = cs.map((r) => [r.name, r.input.startsWith('id=') ? r.input.slice(3) : '1', r.input.includes('fail') ? 'true' : 'false', r.want === 'user' ? 'nil' : r.want, k >= 4 ? '✓' : '']);
    const cur = k === 3 ? Math.min(rows.length - 1, Math.floor(E(u, 0.2, 2.4) * rows.length)) : -1;
    const T = table(480, 40, COLS6, rows, { rowS: (ri) => (k === 2 ? pop(u, 0.3 + ri * 0.4) : 1),
      style: (ri, ci) => (ci === 4 ? { color: GOOD } : ri === cur ? { fill: INFOBG } : ri > 0 && k === 2 && ci === 0 ? { color: BAD } : ri > 0 && ci === 3 ? { color: BAD } : {}) });
    if (k === 2) { el('rect', { x: 474, y: T.row(1) - 2, width: T.W + 12, height: T.rh * 2 + 4, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.2, opacity: fade(u, 1.4) });
      note(480, T.row(3) + 34, '정상 1 + 에러 2 — 에러 행이 가장 흔한 구멍', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 3 && cur >= 0) { const r = rows[cur];
      fly(T.x + 40, T.row(cur) + 19, 380, svc[1] - 40, seg((u * rows.length / 2.4) % 1, 0.1, 0.8), `mockRepo{fail: ${r[2]}}`, { mono: true, fill: INFO });
      mono(40, 300, `svc.GetUser(${r[1]})`, { 'font-size': 16, 'font-weight': 700 }); mono(40, 334, '→ err = ' + r[3], { 'font-size': 16, 'font-weight': 800, fill: r[3] === 'nil' ? GOOD : BAD });
      note(40, 380, '운영은 진짜 구현, 테스트는 mock — 서비스는 모른다', fade(u, 0.5), { fill: MUT, 'font-size': 14 }); return; }
    // k4
    spans(480, T.row(3) + 40, [['if err != tc.wantErr ', { fill: INK }], ['{ t.Errorf(…) }', { fill: MUT }]], { 'font-size': 15, opacity: fade(u, 0.2) });
    terminal(40, 280, 380, 100, ['$ go test -race ./...', ['ok', '#4ade80']], 0.01 + 2 * E(u, 0.6, 1.6), { fs: 14.5 });
    note(480, T.row(3) + 76, '에러 값까지 비교해야 에러 경로가 덮인다', fade(u, 1.8), { fill: GOOD }); }

  const quiz = [
    { q: 'func testAdd(t *testing.T)를 calc_test.go에 두고 go test를 돌리면 어떻게 되나?',
      o: ['FAIL로 표시된다', '컴파일 에러가 난다', '테스트로 인식되지 않아 조용히 건너뛴다'], a: 2,
      why: '테스트 함수는 TestXxx 꼴이어야 한다. 소문자 test로 시작하면 실패가 아니라 아예 실행되지 않는다.' },
    { q: '테이블 주도 테스트에서 새 경계값 케이스를 추가하려면 무엇을 바꾸나?',
      o: ['tests 표에 한 줄을 더한다', '검증 루프를 하나 더 복사한다', '새 TestXxx 함수를 만든다'], a: 0,
      why: '표는 데이터, 루프는 로직이다. 검증은 루프 안 한 곳이라 표에 {"zero", 0, 0, 0} 같은 줄만 더하면 된다.' },
    { q: 't.Run으로 감싼 표에서 overflow 케이스(2+2, want 5)만 실패하면 나머지 케이스는 어떻게 되나?',
      o: ['overflow에서 전체 테스트가 멈춘다', '나머지도 계속 돌고, 실패는 TestAddSub/overflow 이름으로 찍힌다', '모든 케이스가 FAIL로 바뀐다'], a: 1,
      why: '서브테스트는 케이스마다 자기 t를 받는다. 출력에 계층 이름이 붙어 -run TestAddSub/overflow로 그 하나만 다시 돌릴 수 있다.' },
    { q: 'Go 1.21에서 tc := tc 없이 t.Parallel() 서브테스트를 돌리면 어떤 일이 생기나?',
      o: ['서브테스트가 순서대로만 돈다', '컴파일러가 경고를 내고 멈춘다', '모든 서브테스트가 마지막 케이스만 검사한다'], a: 2,
      why: '1.22 미만은 루프 변수 하나를 반복 내내 공유한다. 병렬 서브테스트는 루프가 끝난 뒤 돌아서 셋 다 마지막 값을 본다.' },
    { q: 'TestMain에서 code := m.Run() 뒤에 os.Exit(0)을 쓰면 무엇이 문제인가?',
      o: ['테스트가 실패해도 종료 코드가 0이라 CI가 통과시킨다', 'setup이 두 번 실행된다', 'teardown이 테스트보다 먼저 돈다'], a: 0,
      why: 'm.Run()은 실패하면 0이 아닌 코드를 돌려준다. 그 값을 os.Exit에 그대로 넘겨야 CI가 실패를 안다.' },
    { q: 'UserRepo를 인터페이스로 받으면 테스트에서 얻는 가장 큰 이점은 무엇인가?',
      o: ['서비스 코드가 더 빨라진다', 'mock을 주입해 ErrDB 같은 에러 경로를 진짜 DB 없이 만든다', 'go vet이 더 많은 버그를 찾는다'], a: 1,
      why: 'mockRepo{fail: true} 하나로 DB 장애를 재현한다. 표에 notfound·db_down 행을 넣어 에러 경로까지 덮는다.' },
  ];

  const summary = [
    '테스트는 _test.go 파일의 TestXxx 함수다. 이름 규칙을 어기면 실패가 아니라 조용히 빠진다.',
    '케이스를 표로 모으고 루프 하나로 검증하면 새 케이스는 표에 한 줄 더하는 일이 된다.',
    't.Run으로 감싸면 케이스마다 이름이 붙고, 하나가 실패해도 나머지는 계속 돈다.',
    '공용 준비는 TestMain에서 한 번 하고, 의존은 인터페이스로 받아 mock으로 에러 경로까지 덮는다.',
  ];
  const review = [
    { q: '표 주도 테스트가 실패했는데 메시지가 "Add(2,2)=4 want 5"뿐이라 어느 케이스인지 헷갈린다. 가장 나은 처방은?',
      o: ['검증 루프를 케이스마다 복사한다', '루프 본문을 t.Run(tc.name, …)으로 감싼다', 't.Errorf를 t.Fatalf로 바꾼다'], a: 1,
      why: 't.Run은 케이스 이름을 계층 이름으로 붙인다. 실패가 TestAddSub/overflow처럼 찍히고 -run으로 그 하나만 재현할 수 있다.' },
    { q: 't.Parallel()을 넣었더니 가끔만 실패한다. 케이스들이 같은 전역 변수를 고친다. 먼저 할 일은?',
      o: ['-race로 돌려 경쟁을 확인하고 케이스마다 자기 데이터를 쓰게 한다', '병렬 케이스 수를 늘린다', 'TestMain에서 os.Exit(0)을 부른다'], a: 0,
      why: '병렬 케이스가 공유 상태를 건드리면 실행 순서에 따라 결과가 흔들린다. -race가 그 지점을 짚고, 격리하면 사라진다.' },
    { q: '모든 테스트가 초록불인데 운영에서 DB 장애 때 서비스가 이상하게 동작했다. 테스트에서 빠졌을 가능성이 큰 것은?',
      o: ['TestMain의 setup', '서브테스트 이름', 'mock으로 ErrDB를 돌려주는 에러 케이스 행'], a: 2,
      why: '정상 경로만 검사하는 것이 가장 흔한 구멍이다. mockRepo{fail: true}로 의존 실패를 만들고 wantErr까지 비교해야 덮인다.' },
  ];

  R.page({ title: '테스트 표 돌려 보기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
