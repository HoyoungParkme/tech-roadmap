/* IV-2-1 go test -bench — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림: b.N 이 커지는 모습, += 가 새 문자열을 계속 만드는 힙, Builder 버퍼가 두 배씩 크는 모습, append 재할당 사슬, 죽은 코드 제거, benchstat 분포.
 * ns/op·b.N·p 값은 예시다. B/op·allocs/op 는 Go 런타임 크기 등급과 append 증가 규칙으로 계산한 값(Builder 5회·248B, += 99회·5680B, cap 0 append 12회·25208B, make 1회·8192B). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, lock, spans, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const fmt = (v) => (v < 10 ? (Math.round(v * 10) / 10).toString() : Math.round(v).toLocaleString('en-US'));
  // 느림/빠름 막대 두 줄 (beat.bars). 앞 beat 값에서 이어진다
  function bars(c, x, y, w, o) { o = o || {}; const b = c.beat.bars, p = (c.prev && c.prev.bars && c.prev.bars.unit === b.unit) ? c.prev.bars : null; if (!b) return;
    const sv = tween(p ? p.slow.value : null, b.slow.value, c.u), fv = tween(p ? p.fast.value : null, b.fast.value, c.u), max = Math.max(b.slow.value, b.fast.value) || 1;
    tx(x, y, b.unit + (o.ex ? '  · 예시 값' : ''), { 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: MUT });
    [[b.slow.label, sv, BAD], [b.fast.label, fv, GOOD]].forEach(([l, v, col], i) => { const yy = y + 22 + i * 54;
      tx(x, yy + 12, l, { 'font-size': 14, 'font-weight': 700, fill: col });
      hbar(x, yy + 20, w, v, max, { col, h: 20, text: fmt(v) }); }); }

  // ---------- 1. 벤치 함수 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [['strutil.go', 90, INK], ['concat_test.go', 150, ACC]].forEach(([f, y, col], i) => card(150, y, 210, 44, { rx: 8, text: f, mono: true, fs: 15, stroke: col, color: col, s: pop(u, 0.2 + i * 0.3) }));
      pill(150, 214, 'import "testing"', INFO, pop(u, 0.9), { mono: true, fs: 14 }); pill(150, 256, 'import "strings"', INFO, pop(u, 1.1), { mono: true, fs: 14 });
      card(560, 90, 160, 48, { rx: 10, text: 'go build', mono: true, fs: 15, fill: INK, color: PANEL, stroke: 'none', s: pop(u, 1.3) });
      card(560, 190, 160, 48, { rx: 10, text: 'go test', mono: true, fs: 15, fill: ACC, color: PANEL, stroke: 'none', s: pop(u, 1.5) });
      grow(256, 90, 476, 90, E(u, 1.5, 1.9), MUT); grow(256, 150, 476, 186, E(u, 1.7, 2.1), ACC);
      el('path', { d: 'M256,150 L470,100', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', fill: 'none', opacity: fade(u, 2.0) }); cross(380, 124, 8, pop(u, 2.1));
      note(660, 96, '_test.go 는 결과물에 안 들어간다', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); note(660, 196, '벤치·테스트는 여기서만', fade(u, 2.2), { fill: ACC, 'font-size': 14 });
      note(60, 360, '벤치도 같은 표준 testing 패키지 — 설치할 것이 없다', fade(u, 2.3)); return; }
    if (k === 1) { spans(40, 60, [['func ', { fill: INFO, 'font-weight': 700 }], ['BenchmarkConcatPlus', { 'font-weight': 800 }], ['(b *testing.B)', { fill: MUT }]], { 'font-size': 17, opacity: fade(u, 0.1) });
      spans(40, 94, [['for i := 0; i < ', { fill: INK }], ['b.N', { fill: ACC, 'font-weight': 800 }], ['; i++ { … }', { fill: INK }]], { 'font-size': 17, opacity: fade(u, 0.3) });
      const NS = ['1', '100', '10,000', '658,214'], x0 = 80, k2 = Math.min(3, Math.floor(E(u, 0.5, 2.3) * 4));
      el('line', { x1: x0, y1: 300, x2: 880, y2: 300, stroke: GRID, 'stroke-width': 3 });
      NS.forEach((v, i) => { if (i > k2) return; const x = x0 + i * 230;
        card(x + 70, 210, 150, 52, { rx: 10, text: 'b.N = ' + v, mono: true, fs: 15.5, stroke: i === 3 ? ACC : INK, color: i === 3 ? ACC : INK, s: pop(u, 0.5 + i * 0.45) });
        if (i < 3) mono(x + 180, 160, i < 2 ? '×100' : '…', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.45) });
        el('rect', { x: x0, y: 294, width: Math.min(800, [8, 30, 200, 800][i]), height: 12, rx: 6, fill: i === 3 ? ACC : INFO, opacity: 0.5 }); });
      mono(880, 330, '1s', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); el('line', { x1: 880, y1: 286, x2: 880, y2: 314, stroke: MUT, 'stroke-width': 2 });
      note(80, 356, '한 번에 최대 100배씩 늘리고, 1초(-benchtime)를 넘기면 멈춘다', fade(u, 2.2), { fill: ACC });
      sub(880, 392, '마지막 b.N 은 예시', fade(u, 2.3), { 'text-anchor': 'end' }); return; }
    if (k === 2) { // += 가 매번 새 문자열을 만든다
      tx(40, 46, 's += "x"  × 100', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
      const n = Math.floor(E(u, 0.3, 2.2) * 99);
      for (let i = 0; i < 9; i++) { const len = i + 1, shown = i === 0 ? true : i <= Math.min(8, n), y = 80 + i * 30; if (!shown) continue;
        const live = i === Math.min(8, n);
        el('rect', { x: 120, y, width: 26 * len, height: 22, rx: 4, fill: live ? ACCBG : SOFT, stroke: live ? ACC : OFF, 'stroke-width': 1.6 });
        mono(126, y + 16, 'x'.repeat(len), { 'font-size': 14, fill: live ? ACC : OFF }); }
      mono(110, 96, '"x"', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); mono(110, 112, '할당 없음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: 0 });
      note(400, 120, '길이 2 부터는 매번 새로 할당', fade(u, 0.6), { fill: ACC });
      note(400, 150, '지난 문자열은 회색 = GC 가 치울 쓰레기', fade(u, 1.0), { fill: MUT });
      mono(700, 260, String(n), { 'font-size': 56, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); note(714, 260, '번 새 문자열', 1, { fill: BAD, 'font-size': 18 });
      note(400, 330, '첫 "x" 는 리터럴을 그대로 쓰므로 100번 중 99번', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 3) { [['BenchmarkConcatPlus', 's += "x"', BAD, 90], ['BenchmarkConcatBuilder', 'sb.WriteString("x")', GOOD, 230]].forEach(([n, op, col, y], i) => { const s = pop(u, 0.2 + i * 0.6);
        card(480, y, 820, 96, { rx: 12, stroke: col, s });
        mono(90, y - 18, n, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.6) });
        mono(90, y + 14, 'for b.N {  for 100번 { ' + op + ' }  }', { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.6) }); });
      note(90, 360, '두 벤치의 작업량이 같아야 숫자를 비교할 수 있다', fade(u, 1.8), { fill: ACC }); return; }
    // k4: Builder 버퍼가 두 배씩
    const CAPS = [8, 16, 32, 64, 128], total = CAPS.reduce((a, b) => a + b, 0);
    tx(40, 46, 'sb.WriteString("x") × 100 — 내부 []byte 버퍼', { 'font-size': 16, 'font-weight': 800 });
    CAPS.forEach((cp, i) => { const y = 80 + i * 50, s = E(u, 0.2 + i * 0.35, 0.5 + i * 0.35), w = cp * 5.4, used = i === 4 ? Math.min(100, Math.floor(E(u, 1.8, 2.5) * 100)) : cp;
      if (s <= 0) return; el('rect', { x: 120, y, width: w * s, height: 26, rx: 4, fill: i === 4 ? ACCBG : SOFT, stroke: i === 4 ? ACC : OFF, 'stroke-width': 1.6 });
      el('rect', { x: 120, y, width: (w * Math.min(used, cp) / cp) * s, height: 26, rx: 4, fill: i === 4 ? ACC : OFF, opacity: 0.35 });
      mono(110, y + 18, 'cap ' + cp, { 'font-size': 14, fill: i === 4 ? ACC : MUT, 'text-anchor': 'end' }); });
    note(120, 350, `할당 5번 · 8+16+32+64+128 = ${total} 바이트`, fade(u, 2.0), { fill: GOOD, 'font-size': 16 });
    note(120, 382, 'String() 은 버퍼를 복사하지 않고 그대로 문자열로 본다', fade(u, 2.3), { fill: MUT, 'font-size': 14.5 }); }

  // ---------- 2. 실행·결과 읽기 ----------
  function s2(t, c) { const { k, u } = c;
    const cmd = k === 1 ? '$ go test -bench=Builder -benchmem' : '$ go test -bench=. -benchmem';
    terminal(30, 24, 900, k >= 2 ? 112 : 70, k >= 2 ? [cmd, ['ConcatPlus-8      658214   1820 ns/op   5680 B/op   99 allocs/op', 'var(--term)'], ['ConcatBuilder-8  5721030    210 ns/op    248 B/op    5 allocs/op', 'var(--term)']] : [cmd], k === 2 ? 1 + 2 * E(u, 0.1, 0.8) : k >= 2 ? 3 : Math.max(0.01, E(u, 0.1, 0.8)), { fs: 14.5 });
    if (k === 0) { [['BenchmarkConcatPlus', 130], ['BenchmarkConcatBuilder', 190]].forEach(([n, y], i) => { card(220, y, 300, 44, { rx: 8, text: n, mono: true, fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.6 + i * 0.3) }); check(390, y, 9, pop(u, 1.1 + i * 0.2)); });
      note(440, 140, '-bench=.  →  정규식 "." 은 모든 이름에 맞는다', fade(u, 1.0), { 'font-size': 15 });
      note(440, 196, '-benchmem  →  B/op · allocs/op 도 잰다', fade(u, 1.6), { 'font-size': 15, fill: INFO });
      note(60, 320, '-bench 를 안 주면 go test 는 벤치를 돌리지 않는다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 1) { [['BenchmarkConcatPlus', 130, false], ['BenchmarkConcatBuilder', 190, true]].forEach(([n, y, ok], i) => { card(220, y, 300, 44, { rx: 8, text: n, mono: true, fs: 15, stroke: ok ? ACC : OFF, color: ok ? ACC : OFF, s: pop(u, 0.3 + i * 0.2) }); if (!ok) cross(390, y, 8, pop(u, 0.8)); else check(390, y, 9, pop(u, 0.9)); });
      note(440, 196, '이름에 "Builder" 가 든 벤치만', fade(u, 1.0), { fill: ACC });
      bars(c, 60, 260, 600, { ex: true }); return; }
    // 다섯 칸 이름표 (k3)
    if (k === 3) { const cols = [['-8', 'GOMAXPROCS', 176], ['b.N', '반복 수', 300], ['ns/op', '1회 시간', 418], ['B/op', '1회 바이트', 560], ['allocs/op', '1회 할당', 720]];
      cols.forEach(([a, b, x], i) => { const s = fade(u, 0.2 + i * 0.25); el('line', { x1: x, y1: 140, x2: x, y2: 156, stroke: ACC, 'stroke-width': 2, opacity: s }); mono(x, 176, a, { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: s }); tx(x, 198, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }); }
    bars(c, 60, k === 3 ? 232 : 170, 600, { ex: k === 2 });
    if (k === 2) note(60, 330, '낮을수록 빠르다 — Builder 가 약 8.7배', fade(u, 1.6), { fill: GOOD, 'font-size': 16 });
    if (k === 4) { note(60, 330, '+= 는 반복마다 새 문자열 → GC 가 치울 쓰레기도 99개', fade(u, 1.4), { fill: BAD });
      note(60, 362, 'ns/op 만 보지 말고 allocs/op 를 함께 본다', fade(u, 1.9), { fill: ACC });
      for (let i = 0; i < 20; i++) el('rect', { x: 760 + (i % 5) * 34, y: 200 + Math.floor(i / 5) * 30, width: 28, height: 22, rx: 4, fill: OFF, opacity: fade(u, 0.4 + i * 0.05) });
      tx(845, 340, '힙에 쌓이는 문자열', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); } }

  // ---------- 3. 할당 줄이기 ----------
  const GROW = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 848, 1280];   // cap 0 에서 1000번 append 할 때 잡히는 용량 (Go 1.20+ 규칙)
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(200, 120, 260, 60, { rx: 10, text: 'b.ReportAllocs()', mono: true, fs: 17, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      const on = E(u, 0.8, 1.2); el('rect', { x: 380, y: 106, width: 56, height: 28, rx: 14, fill: on > 0.5 ? GOOD : OFF }); el('circle', { cx: lerp(394, 422, on), cy: 120, r: 11, fill: PANEL });
      terminal(30, 200, 900, 110, ['$ go test -bench=Build', ['BenchmarkBuildNoCap-8    …   … ns/op   25208 B/op   12 allocs/op', 'var(--term)']], 0.01 + 2 * E(u, 1.2, 2.2), { fs: 14.5 });
      note(30, 350, '-benchmem 을 깜빡해도 B/op · allocs/op 가 나온다', fade(u, 2.3), { fill: ACC }); return; }
    if (k === 1 || k === 2) { tx(40, 46, k === 1 ? 'var out []int  — 용량 0 에서 append 1000번' : 'make([]int, 0, 1000)  — 용량을 먼저', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      if (k === 1) { const n = Math.floor(E(u, 0.2, 2.3) * GROW.length);
        GROW.forEach((cp, i) => { if (i > n) return; const y = 66 + i * 26, w = Math.max(6, cp * 0.6), live = i === Math.min(n, GROW.length - 1);
          el('rect', { x: 140, y, width: w, height: 18, rx: 3, fill: live ? ACC : OFF, opacity: live ? 0.8 : 0.5 });
          mono(130, y + 14, String(cp), { 'font-size': 13.5, fill: live ? ACC : MUT, 'text-anchor': 'end' });
          if (i > 0 && live) grow(140 + Math.max(6, GROW[i - 1] * 0.6) / 2, y - 6, 160, y + 2, 1, MUT, { plain: true }); });
        mono(940, 210, String(Math.min(12, n + 1)), { 'font-size': 52, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); note(940, 240, '번 새 배열 + 복사', 1, { fill: BAD, 'text-anchor': 'end' });
        note(940, 290, '1·2·4 … 512 다음은 848·1280', fade(u, 2.3), { 'text-anchor': 'end', fill: MUT, 'font-size': 14 });
        return; }
      const f = E(u, 0.4, 2.2); el('rect', { x: 140, y: 120, width: 768, height: 36, rx: 5, fill: SOFT, stroke: ACC, 'stroke-width': 2 });
      el('rect', { x: 140, y: 120, width: 768 * f, height: 36, rx: 5, fill: ACC, opacity: 0.5 });
      mono(130, 144, '1000', { 'font-size': 14, fill: ACC, 'text-anchor': 'end' }); mono(150, 196, `len ${Math.round(1000 * f)} / cap 1000`, { 'font-size': 15, 'font-weight': 700 });
      note(140, 260, '배열은 한 번만 — 8000 바이트 → 크기 등급 8192', fade(u, 1.0), { fill: GOOD });
      bars(c, 140, 300, 540); return; }
    if (k === 3) { bars(c, 60, 70, 640); note(60, 250, 'append 코드는 그대로 — 바뀐 것은 시작 용량 하나', fade(u, 1.5), { fill: ACC });
      note(60, 282, '버려지는 중간 배열이 없으니 바이트도 줄어든다', fade(u, 1.9), { fill: MUT }); return; }
    // k4: ResetTimer
    const x0 = 60, W = 840; el('line', { x1: x0, y1: 120, x2: x0 + W, y2: 120, stroke: GRID, 'stroke-width': 3 });
    el('rect', { x: x0, y: 96, width: 360 * E(u, 0.2, 0.9), height: 48, rx: 6, fill: OFF });
    mono(x0 + 14, 126, 'makeBigInput()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
    const ru = pop(u, 1.0); el('line', { x1: x0 + 370, y1: 80, x2: x0 + 370, y2: 160, stroke: ACC, 'stroke-width': 3, opacity: ru }); mono(x0 + 370, 74, 'b.ResetTimer()', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: ru });
    el('rect', { x: x0 + 380, y: 96, width: (W - 380) * E(u, 1.2, 2.0), height: 48, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.6 });
    mono(x0 + 396, 126, 'for b.N { parse(data) }', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
    tx(x0 + 380 + (W - 380) / 2, 176, '이 구간만 잰다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    bars(c, 60, 230, 540, { ex: true }); }

  // ---------- 4. 죽은 코드 ----------
  function s4(t, c) { const { k, u } = c;
    // 왼쪽: 함수 밖(패키지) · 함수 안
    if (k >= 1) { zone(30, 30, 420, 70, '패키지 영역', { fill: WARNBG, color: WARN });
      card(240, 74, 200, 36, { rx: 8, text: 'var sink uint64', mono: true, fs: 15, stroke: WARN, color: WARN, s: k === 1 ? pop(u, 0.3) : 1 }); }
    zone(30, 116, 420, 230, k === 0 ? 'BenchmarkHashBad' : 'BenchmarkHashGood', { fill: SOFT });
    el('rect', { x: 50, y: 150, width: 380, height: 120, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); mono(64, 172, 'for b.N {', { 'font-size': 14.5, fill: MUT }); mono(64, 262, '}', { 'font-size': 14.5, fill: MUT });
    if (k === 0) { const cut = E(u, 1.0, 1.6); card(240, 215, 220, 40, { rx: 8, text: 'hash("hello")', mono: true, fs: 15, stroke: BAD, color: BAD, op: 1 - cut * 0.85 });
      el('line', { x1: 120, y1: 215, x2: lerp(120, 360, cut), y2: 215, stroke: BAD, 'stroke-width': 3 });
      note(64, 310, '반환값을 아무도 안 쓴다 → 컴파일러가 지울 수 있다', fade(u, 0.4), { fill: BAD, 'font-size': 14 }); }
    else { card(240, 215, 240, 40, { rx: 8, text: 'h = hash("hello")', mono: true, fs: 15, stroke: k >= 2 ? GOOD : INK, color: k >= 2 ? GOOD : INK, s: k === 2 ? pop(u, 0.2) : 1 });
      if (k >= 2) { card(380, 300, 90, 34, { rx: 8, text: 'h', mono: true, fs: 15, stroke: GOOD, color: GOOD }); grow(300, 236, 360, 284, k === 2 ? E(u, 0.6, 1.0) : 1, GOOD); }
      if (k >= 3) { mono(64, 330, 'sink = h', { 'font-size': 15, 'font-weight': 800, fill: WARN }); grow(360, 300, 330, 96, k === 3 ? E(u, 0.4, 1.0) : 1, WARN); } }
    // 오른쪽: 숫자
    if (k === 1) { note(500, 80, '패키지 변수는 컴파일러가 함부로 못 지운다', fade(u, 0.8), { fill: WARN }); }
    if (k === 2) { note(500, 80, '루프 안에서는 지역 변수 h 에만', fade(u, 1.0), { fill: GOOD }); }
    if (k === 3) { note(500, 80, '패키지 변수 대입은 루프 밖에서 한 번', fade(u, 1.0), { fill: WARN }); }
    if (k === 4) { mono(700, 150, '0.3 ns/op', { 'font-size': 40, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      [0, 1, 2].forEach((i) => el('path', { d: `M${600 - i * 14},${100 - i * 10} q-20,50 0,100 M${800 + i * 14},${100 - i * 10} q20,50 0,100`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.5 + i * 0.2) * (0.5 + 0.5 * Math.sin(t * 8)) }));
      note(500, 240, '3GHz CPU 의 한 클럭이 약 0.33ns', fade(u, 1.2), { 'font-size': 14.5 });
      note(500, 270, '함수를 부를 시간이 아니다 = 코드가 지워졌다', fade(u, 1.7), { fill: BAD });
      note(500, 330, '비현실적으로 빠르면 죽은 코드 제거부터 의심', fade(u, 2.2), { fill: ACC }); return; }
    bars(c, 500, k === 0 ? 120 : 140, 360, { ex: true }); }

  // ---------- 5. benchstat ----------
  const jit = (i, s) => { const v = Math.sin((i + 1) * 12.9898 + s * 78.233) * 43758.5453; return (v - Math.floor(v)) * 2 - 1; };
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { terminal(30, 30, 900, 80, ['$ go install golang.org/x/perf/cmd/benchstat@latest'], Math.max(0.01, E(u, 0.1, 1.0)), { fs: 14.5 });
      fly(300, 110, 300, 190, seg(u, 1.0, 1.8), 'benchstat', { mono: true, fill: ACC, stay: true });
      card(300, 250, 260, 56, { rx: 10, text: '$GOBIN 또는 ~/go/bin', mono: true, fs: 15, s: pop(u, 0.8) });
      note(500, 236, '표준 도구가 아닌 x/perf 의 CLI', fade(u, 1.6)); note(500, 266, 'PATH 에 없으면 실행되지 않는다', fade(u, 2.0), { fill: WARN }); return; }
    // 분포 축
    const ax = R.axes(80, 70, 800, 150, { x: [0, 2000], y: [0, 1], xt: [0, 500, 1000, 1500, 2000], xl: 'ns/op · 예시 값' });
    const dots = (mu, pct, s, col, n, y) => { for (let i = 0; i < 10; i++) { if (i >= n) break; const v = mu * (1 + pct / 100 * jit(i, s));
      el('circle', { cx: ax.X(v), cy: y + jit(i, s + 3) * 14, r: 6, fill: col, opacity: 0.8 }); } };
    const nOld = k === 1 ? Math.floor(E(u, 0.3, 2.0) * 10) : 10, nNew = k === 2 ? Math.floor(E(u, 0.3, 2.0) * 10) : k > 2 ? 10 : 0;
    dots(1820, 2, 1, BAD, nOld, 150); if (k >= 2) dots(210, 1, 2, GOOD, nNew, 150);
    mono(ax.X(1820), 110, 'old.txt', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
    if (k >= 2) mono(ax.X(210), 110, 'new.txt', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.2) : 1 });
    if (k === 1) { note(80, 300, '-count=10 → 같은 벤치를 열 번', fade(u, 1.0)); note(80, 330, '한 번의 숫자는 CPU 스로틀·백그라운드 작업에 흔들린다', fade(u, 1.6), { fill: MUT, 'font-size': 14.5 }); return; }
    if (k === 2) { note(80, 300, '같은 머신 · 같은 부하에서 개선 후 코드도 열 번', fade(u, 1.4)); return; }
    // benchstat 표
    const tY = 290; el('rect', { x: 60, y: tY - 30, width: 840, height: 96, rx: 8, fill: SOFT, opacity: k === 3 ? fade(u, 0.2) : 1 });
    const H = [['', 80], ['old', 260], ['new', 440], ['delta', 620]];
    H.forEach(([h, x]) => mono(x, tY - 8, h, { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.3) : 1 }));
    const row = [['Concat-8', 80, INK], ['1.82µs ±2%', 260, BAD], ['0.21µs ±1%', 440, GOOD], ['-88.46%', 620, ACC], ['p=0.000 n=10', 740, INFO]];
    row.forEach(([s, x, col], i) => mono(x, tY + 30, s, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: k === 3 ? fade(u, 0.6 + i * 0.3) : 1 }));
    if (k === 3) { note(60, 404, '(210 − 1820) / 1820 = −88.46%', fade(u, 2.2), { class: 'mono', fill: ACC, 'font-size': 14.5 }); return; }
    // k4: p 값
    el('rect', { x: ax.X(210 * 0.99) - 10, y: 126, width: ax.X(210 * 1.01) - ax.X(210 * 0.99) + 20, height: 48, rx: 8, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
    el('rect', { x: ax.X(1820 * 0.98) - 10, y: 126, width: ax.X(1820 * 1.02) - ax.X(1820 * 0.98) + 20, height: 48, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.3) });
    note(60, 404, '두 분포가 겹치지 않는다 → p 가 작다 = 우연이 아니다', fade(u, 1.0), { fill: INFO, 'font-size': 14.5 });
    note(560, 404, '파일 순서가 곧 before → after', fade(u, 1.8), { fill: MUT, 'font-size': 14.5 }); }

  // ---------- 6. 실무 루프 ----------
  const NODES = [['측정', 160, 90], ['하나만 바꾸기', 420, 90], ['재측정 · benchstat', 680, 90], ['한계 확인', 820, 230], ['pprof', 540, 230]];
  function s6(t, c) { const { k, u } = c;
    NODES.forEach(([n, x, y], i) => { const on = i === k, done = i < k;
      card(x, y, tw(n, 15) + 40, 44, { rx: 22, text: n, fs: 15, fw: 800, stroke: on ? ACC : done ? GOOD : GRID, color: on ? ACC : done ? GOOD : MUT, fill: on ? ACCBG : PANEL, s: on ? pop(u, 0.1) : 1 });
      if (i > 0 && i <= k) { const [, px, py] = NODES[i - 1]; grow(px + (i < 3 ? 60 : 0), py + (i >= 3 ? 24 : 0), x - (i < 3 ? 70 : 0) + (i === 4 ? 70 : 0), y - (i >= 3 ? 24 : 0), i === k ? E(u, 0, 0.4) : 1, i === k ? ACC : MUT); } });
    const Y = 290;
    if (k === 0) { card(160, Y, 160, 50, { rx: 8, text: 'base.txt', mono: true, fs: 16, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      mono(280, Y + 6, 'go test -bench=. -benchmem -count=10 > base.txt', { 'font-size': 14, opacity: fade(u, 0.9) });
      note(80, 380, '기준선이 없으면 개선을 증명할 수 없다', fade(u, 1.6), { fill: ACC }); return; }
    if (k === 1) { // +20% 와 -15% 가 섞여 +5% 로만 보인다 (페이지의 예)
      const cx = 300, sc = 6; el('line', { x1: cx, y1: 250, x2: cx, y2: 380, stroke: MUT, 'stroke-width': 1.5 });
      [['변경 A', 20, GOOD], ['변경 B', -15, BAD], ['둘 다', 5, INK]].forEach(([n, v, col], i) => { const y = 262 + i * 40, g = E(u, 0.3 + i * 0.5, 0.8 + i * 0.5);
        tx(60, y + 16, n, { 'font-size': 14.5, 'font-weight': 700, opacity: g });
        el('rect', { x: v >= 0 ? cx : cx + v * sc * g, y, width: Math.abs(v) * sc * g, height: 24, rx: 4, fill: col, opacity: 0.75 });
        mono(v >= 0 ? cx + v * sc + 8 : cx + v * sc - 8, y + 18, (v > 0 ? '+' : '') + v + '%', { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': v >= 0 ? 'start' : 'end', opacity: fade(u, 0.6 + i * 0.5) }); });
      note(520, 300, '함께 바꾸면 +5% 만 보인다', fade(u, 1.8)); note(520, 330, '한 번에 하나씩 바꿔야 원인을 안다', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 2) { card(300, Y, 220, 56, { rx: 10, text: 'p < 0.05 ?', mono: true, fs: 18, stroke: INFO, color: INFO, s: pop(u, 0.3) });
      grow(410, Y - 10, 560, Y - 40, E(u, 0.8, 1.2), GOOD); note(570, Y - 34, '유의 → 남긴다', fade(u, 1.2), { fill: GOOD });
      grow(410, Y + 10, 560, Y + 40, E(u, 1.4, 1.8), BAD); note(570, Y + 46, '유의하지 않음 → 되돌린다 (복잡도만 는다)', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 3) { [['실제 입력 분포·크기', 160], ['데워진 캐시', 420], ['동시성·GC 부하', 680]].forEach(([n, x], i) => { const s = pop(u, 0.3 + i * 0.4);
        card(x, Y + 10, 220, 50, { rx: 10, text: n, fs: 15, stroke: WARN, color: INK, fill: WARNBG, s }); cross(x + 96, Y - 12, 8, pop(u, 0.6 + i * 0.4)); });
      note(60, 390, '마이크로 벤치에서 2배여도 실서비스는 그대로일 수 있다', fade(u, 1.8), { fill: WARN }); return; }
    // k4: 벤치는 함수를, pprof 는 함수 안을
    zone(60, 260, 380, 140, 'go test -bench', { fill: SOFT }); [0, 1, 2].forEach((i) => card(150 + i * 110, 340, 92, 40, { rx: 8, text: ['parse', 'encode', 'send'][i], mono: true, fs: 14, stroke: i === 1 ? BAD : GRID, color: i === 1 ? BAD : MUT }));
    note(80, 300, '어느 함수가 느린가', fade(u, 0.4), { fill: ACC });
    grow(310, 340, 540, 330, E(u, 0.8, 1.3), ACC);
    zone(550, 260, 380, 140, 'go tool pprof cpu.out', { fill: ACCBG, color: ACC, op: fade(u, 1.2) });
    ['for _, v := range xs {', '    buf = append(buf, …)', '}'].forEach((s, i) => mono(570, 312 + i * 26, s, { 'font-size': 14, fill: i === 1 ? BAD : INK, opacity: fade(u, 1.4 + i * 0.15), 'font-weight': i === 1 ? 800 : 500 }));
    note(570, 392, '그 함수 안 어디가 느린가 — 다음 장', fade(u, 2.0), { fill: ACC, 'font-size': 14 }); }

  const quiz = [
    { q: 'BenchmarkXxx의 for i := 0; i < b.N; i++ 에서 b.N은 누가 정하나?',
      o: ['go test가 1부터 늘려 가며 1초를 넘길 때까지 정한다', '코드에 직접 숫자를 적는다', 'GOMAXPROCS 값과 같다'], a: 0,
      why: 'b.N은 1번부터 한 번에 최대 100배씩 커진다. 전체 시간이 -benchtime(기본 1초)을 넘으면 그 b.N으로 결과를 낸다.' },
    { q: 'ConcatPlus 결과의 99 allocs/op가 뜻하는 것은 무엇인가?',
      o: ['b.N이 99번 돌았다', '연산 1회(100번 이어 붙이기)마다 힙 할당이 99번 일어났다', '99 바이트를 썼다'], a: 1,
      why: '+= 는 길이 2부터 매번 새 문자열을 만든다. Builder는 버퍼를 두 배씩 키워 5번이면 된다.' },
    { q: 'make([]int, 0, 1000)으로 시작하면 1000번 append 하는 동안 힙 할당은 몇 번인가?',
      o: ['1000번', '12번', '1번'], a: 2,
      why: '용량을 미리 잡아 재할당이 없다. 용량 0에서 시작하면 1·2·4 … 848·1280으로 12번 새 배열을 잡고 복사한다.' },
    { q: '결과를 쓰지 않는 벤치가 0.3 ns/op를 냈다. 먼저 의심할 것은 무엇인가?',
      o: ['컴파일러가 hash() 호출을 죽은 코드로 지웠다', 'hash()가 아주 잘 최적화됐다', 'b.N이 너무 작다'], a: 0,
      why: '0.3ns는 3GHz CPU의 한 클럭 남짓이라 함수를 부를 시간이 아니다. 결과를 sink로 흘려 계산을 살린다.' },
    { q: 'benchstat old.txt new.txt가 -88.46% (p=0.000 n=10)을 냈다. p=0.000이 뜻하는 것은 무엇인가?',
      o: ['측정이 0번 실패했다', '개선폭이 0%다', '열 번씩 잰 두 분포의 차이가 우연일 가능성이 매우 작다'], a: 2,
      why: '-count=10으로 모은 두 분포가 겹치지 않아 p가 작다. delta는 (210 − 1820) / 1820 = −88.46%이다.' },
    { q: '두 가지 최적화를 한꺼번에 넣었더니 +5% 좋아졌다. 이 결과만으로 알 수 없는 것은 무엇인가?',
      o: ['변경 후 코드가 컴파일되는지', '각 변경이 따로 얼마나 효과였는지', 'benchstat을 쓸 수 있는지'], a: 1,
      why: '하나가 +20%, 다른 하나가 −15% 였을 수도 있다. 한 번에 하나씩 바꾸고 재측정해야 원인을 안다.' },
  ];

  const summary = [
    '벤치는 BenchmarkXxx 안의 b.N 루프로 쓰고, b.N은 go test가 1초를 채울 때까지 늘린다.',
    'ns/op만 보지 않고 B/op와 allocs/op를 함께 본다. += 는 99번, Builder는 5번 할당했다.',
    '용량을 미리 잡으면 재할당이 사라지고, 결과를 sink로 흘려야 계산이 지워지지 않는다.',
    '전후를 열 번씩 재서 benchstat으로 비교하고, 함수 안쪽 병목은 pprof로 넘어가 찾는다.',
  ];
  const review = [
    { q: '최적화 뒤 벤치가 갑자기 100배 빨라졌는데 allocs/op도 0이 됐다. 결과를 버리는 벤치였다. 먼저 할 일은?',
      o: ['결과를 패키지 변수 sink로 흘리고 다시 잰다', '바로 배포한다', '-count를 1로 줄인다'], a: 0,
      why: '쓰지 않는 결과는 컴파일러가 계산째 지울 수 있다. sink로 살려 둔 뒤에도 빠른지 확인해야 진짜 개선이다.' },
    { q: '슬라이스에 1000개를 append하는 함수가 allocs/op 12를 낸다. 가장 직접적인 개선은?',
      o: ['b.ResetTimer()를 루프 안에 넣는다', 'make([]int, 0, 1000)으로 용량을 먼저 잡는다', '-benchmem을 뺀다'], a: 1,
      why: '용량 0에서 시작하면 12번 새 배열을 잡고 복사한다. 용량을 미리 잡으면 1번이면 된다.' },
    { q: '노트북에서 한 번 잰 값이 1820에서 1700 ns/op로 줄었다. 개선이라고 말하려면 무엇이 더 필요한가?',
      o: ['GOMAXPROCS를 1로 고정', '벤치 이름 변경', '-count=10으로 전후를 여러 번 재고 benchstat의 p 값 확인'], a: 2,
      why: '한 번의 숫자는 스로틀과 백그라운드 작업에 흔들린다. 분포를 모아 유의한 차이인지 봐야 한다.' },
  ];

  R.page({ title: '벤치마크 계기판', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
