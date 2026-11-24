/* IV-1-2 Span·메모리 효율 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 .NET 10 에서 코드를 실제로 돌려 잰 값: 원본 string 80 B, Substring(4,13) 48 B, 5만 번 2.4 MB,
 * 100만 번 48 MB · Gen0 GC 3회(약 16 MB 마다), AsSpan 루프 0 B, sizeof(ReadOnlySpan<char>) 16,
 * Rent(64*1024) → 길이 65,536, Substring 3개 파싱 96 B, 보간 문자열 48 B, 오류 번호 CS8331·CS4012·CS4007·CS8345·CS8352. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, axes, line, hbar, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const REQ = 'GET /api/users?id=42 HTTP/1.1';

  // 글자 칸 띠: x0 부터 칸 너비 cw. o.hi(i) → 강조, o.op
  function chars(x0, y, str, cw, o) { o = o || {}; const h = o.h || 34;
    [...str].forEach((ch, i) => { const hi = o.hi && o.hi(i), s = o.s ? o.s(i) : 1; if (s <= 0) return;
      el('rect', { x: x0 + i * cw, y, width: cw - 2, height: h, rx: 3, fill: hi ? ACCBG : PANEL, stroke: hi ? ACC : GRID, 'stroke-width': hi ? 1.8 : 1.2, opacity: (o.op ?? 1) * s });
      mono(x0 + i * cw + (cw - 2) / 2, y + h / 2 + 5, ch === ' ' ? '·' : ch, { 'font-size': o.fs || 15, 'text-anchor': 'middle', fill: ch === ' ' ? OFF : hi ? ACC : INK, 'font-weight': hi ? 800 : 500, opacity: (o.op ?? 1) * s }); });
    if (o.index) o.index.forEach((i) => mono(x0 + i * cw + (cw - 2) / 2, y + h + 17, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); }
  // 창(Span): 칸 a..a+n-1 를 두른 굵은 틀
  function frame(x0, y, cw, a, n, u, col, lab, o) { o = o || {}; if (u <= 0) return; const h = o.h || 34, w = (cw * n - 2) * u;
    el('rect', { x: x0 + a * cw - 4, y: y - 5, width: w + 8, height: h + 10, rx: 6, fill: 'none', stroke: col || ACC, 'stroke-width': 3.2 });
    if (lab && u > 0.95) mono(x0 + a * cw - 4, y - 12, lab, { 'font-size': 14.5, 'font-weight': 800, fill: col || ACC }); }
  function heapBox(x, y, w, h, title) { zone(x, y, w, h, title || '힙', { fill: SOFT }); }

  // ---------- 1. 문제: Substring 은 복사한다 ----------
  const X0 = 64, CW = 28, SY = 80;
  function s1(t, c) { const { k, u } = c;
    if (k === 4) return gcSaw(c);
    heapBox(30, 30, 900, k >= 3 ? 230 : 210);
    mono(X0, SY - 14, 'request : string · 29글자 · 80 B', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    chars(X0, SY, REQ, CW, { hi: (i) => k >= 0 && i >= 4 && i < 17 && (k > 0 || u > 1.0), s: (i) => (k === 0 ? pop(u, 0.1 + i * 0.02, 0.4) : 1), index: k <= 1 ? [0, 4, 16, 28] : null });
    if (k === 0) { const a = X0 + 4 * CW, b = X0 + 17 * CW - 2;
      el('path', { d: `M${a},${SY + 56} v8 H${b} v-8`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 1.2) });
      note((a + b) / 2, SY + 88, '필요한 건 index 4부터 13글자', fade(u, 1.4), { 'text-anchor': 'middle', fill: ACC });
      return; }
    if (k === 1) { const y2 = 170, x2 = X0 + 4 * CW;
      mono(x2, y2 - 12, 'path : 새 string · 48 B', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.2) });
      const n = Math.floor(seg(u, 0.5, 2.1) * 13);
      chars(x2, y2, '/api/users?id', CW, { s: (i) => (i < n ? 1 : 0) });
      for (let i = 0; i < 13; i++) dot([[X0 + (4 + i) * CW + 13, SY + 34], [x2 + i * CW + 13, y2]], seg(u, 0.5 + i * 0.12, 0.75 + i * 0.12), BAD, 5);
      mono(900, 300, `복사한 글자 ${n} / 13`, { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
      return; }
    if (k === 2) {
      card(300, 330, 300, 70, { rx: 10, stroke: WARN, sw: 2.2, s: pop(u, 0.2) });
      mono(170, 324, 'for (i = 0; i < 50,000; i++)', { 'font-size': 15, opacity: fade(u, 0.3) });
      mono(170, 350, '    Substring(4, 13)', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.5) });
      spans(520, 340, [['48 B', { fill: BAD, 'font-weight': 800 }], [' × ', {}], ['50,000', { 'font-weight': 800 }], [' = ?', { fill: MUT }]], { 'font-size': 22, opacity: fade(u, 1.0) });
      note(520, 380, '아직 0회 실행', fade(u, 1.6), { fill: MUT });
      return; }
    // k=3 쓰레기가 쌓인다, k=4 GC 톱니
    if (k === 3) { const g = E(u, 0.2, 2.4), n = Math.round(g * 120);
      for (let i = 0; i < n; i++) { const col = i % 30, row = Math.floor(i / 30); el('rect', { x: 64 + col * 28, y: 150 + row * 22, width: 24, height: 16, rx: 3, fill: BAD, opacity: 0.55 }); }
      note(64, 140, '버려진 임시 string', 1, { fill: BAD, 'font-size': 14 });
      mono(64, 320, `반복 ${Math.round(g * 50000).toLocaleString('en-US')}회`, { 'font-size': 18, 'font-weight': 800 });
      mono(64, 356, `쓰레기 ${(g * 2.4).toFixed(1)} MB`, { 'font-size': 26, 'font-weight': 800, fill: BAD });
      sub(620, 356, '쓰고 바로 버리는 객체', fade(u, 2.0), { 'font-size': 15 });
      return; }
  }
  // 100만 번 동안 Gen0 에 쌓인 양 (약 16 MB 마다 GC)
  function gcSaw(c) { const u = c.u;
    const ax = axes(110, 120, 760, 210, { x: [0, 48], y: [0, 18], xl: '할당 누적 (MB) · 100만 번 = 48 MB', yl: 'Gen0 에 쌓인 양 (MB)', xt: [0, 16, 32, 48], yt: [0, 16] });
    const p = E(u, 0.2, 2.2) * 48, pts = [[0, 0]];
    [16, 32, 48].forEach((m) => { if (p >= m) { pts.push([m, 16]); pts.push([m, 0]); } else if (p > m - 16) pts.push([p, p - (m - 16)]); });
    line(ax, pts, 1, BAD, { sw: 2.6 });
    const gcs = [16, 32, 48].filter((m) => p >= m).length;
    [16, 32, 48].forEach((m, i) => { if (p >= m) pill(ax.X(m), ax.Y(16) - 20, 'GC', WARN, pop(u, 0.2 + (m / 48) * 2.0), { fs: 13.5 }); });
    mono(870, 400, `Gen0 GC ${gcs}번`, { 'font-size': 18, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
    tx(110, 400, '이 컴퓨터 실측 · GC 때마다 스레드가 잠깐 멈춘다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
  }

  // ---------- 2. Span = 원본 위의 창 ----------
  function spanStruct(x, y, s, o) { o = o || {};
    card(x, y, 220, 92, { rx: 10, stroke: ACC, sw: 2.4, s });
    if (s <= 0) return;
    mono(x - 96, y - 18, 'ReadOnlySpan<char> path', { 'font-size': 14, 'font-weight': 800, fill: ACC });
    mono(x - 96, y + 10, 'ref _pointer', { 'font-size': 15 }); el('circle', { cx: x + 86, cy: y + 5, r: 5, fill: ACC });
    mono(x - 96, y + 36, 'int _length', { 'font-size': 15 }); mono(x + 92, y + 36, '13', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); }
  function s2(t, c) { const { k, u } = c;
    heapBox(30, 30, 900, 150); zone(30, 200, 900, 210, '스택', { fill: SOFT });
    mono(X0 + 24, SY - 34, 'request : string (힙에 이미 있다)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const open = k === 0 ? 0 : k === 1 ? E(u, 0.8, 1.6) : 1;
    chars(X0, SY, REQ, CW, { hi: (i) => open >= 1 && i >= 4 && i < 17, index: [0, 4, 16, 28] });
    if (k === 0) { note(140, 300, '스택에는 아직 아무것도 없다', fade(u, 0.4), { fill: MUT }); return; }
    if (k <= 2 || k === 4) { const sx = 200, sy = 300, s = k === 1 ? pop(u, 0.2) : 1;
      spanStruct(sx, sy, s);
      if (s > 0.9) { const tx2 = X0 + 4 * CW + 12; const pu = k === 1 ? E(u, 0.5, 1.0) : 1;
        el('path', { d: `M${sx + 86},${sy + 5} C${sx + 200},${sy - 40} ${tx2},${SY + 110} ${tx2},${SY + 44}`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, pathLength: 100, 'stroke-dasharray': `${pu * 100} 100`, 'marker-end': pu > 0.98 ? 'url(#ra-ahb)' : null }); }
      frame(X0, SY, CW, 4, 13, open, ACC, 'path');
      if (k === 1) { mono(900, 290, '힙 할당 0 B', { 'font-size': 22, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.8) });
        sub(780, 330, '글자는 한 개도 복사하지 않는다', fade(u, 2.1), { 'font-size': 15 }); }
      if (k === 2) { const n = Math.floor(seg(u, 0.5, 1.8) * 13);
        mono(560, 262, 'path.ToString() → 새 string 48 B', { 'font-size': 14.5, fill: WARN, 'font-weight': 800, opacity: fade(u, 0.2) });
        chars(500, 280, '/api/users?id', 30, { s: (i) => (i < n ? 1 : 0) });
        sub(700, 360, '문자열이 꼭 필요한 이 순간에만 할당', fade(u, 2.0), { 'font-size': 15 }); }
      if (k === 4) { // 5만 번 비교
        [['Substring 루프', 2.4, BAD, '2.4 MB'], ['AsSpan 루프', 0, GOOD, '0 B']].forEach(([n, v, col, s2], i) => { const y = 252 + i * 64;
          tx(470, y + 14, n, { 'font-size': 15, 'font-weight': 700 });
          hbar(600, y, 220, v * E(u, 0.3 + i * 0.4, 1.2 + i * 0.4), 2.4, { col, text: s2, h: 20 }); });
        note(470, 392, '100만 번이면 Gen0 GC 3번 대 0번', fade(u, 1.8), { fill: GOOD }); }
      return; }
    // k=3: Span 의 정체
    const s = pop(u, 0.2);
    card(300, 300, 330, 130, { rx: 12, stroke: ACC, sw: 2.6, s });
    if (s > 0.5) { mono(160, 266, 'Span<T> (값 타입)', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      el('rect', { x: 160, y: 282, width: 180, height: 34, rx: 5, fill: ACCBG, stroke: ACC }); mono(172, 304, 'ref T _pointer', { 'font-size': 15 });
      el('rect', { x: 344, y: 282, width: 110, height: 34, rx: 5, fill: PANEL, stroke: ACC }); mono(356, 304, 'int _length', { 'font-size': 15 });
      mono(160, 344, '어디서부터 + 몇 개', { 'font-size': 14.5, fill: MUT }); }
    mono(560, 290, 'sizeof = 16바이트', { 'font-size': 22, 'font-weight': 800, opacity: fade(u, 1.0) });
    note(560, 326, '복사해도 좌표만 복사된다', fade(u, 1.5));
    note(560, 356, '데이터는 소유하지 않는다', fade(u, 1.9), { fill: ACC });
  }

  // ---------- 3. 3형제 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { zone(40, 40, 420, 340, '스택 프레임', { fill: SOFT });
      mono(70, 90, 'stackalloc int[3] { 1, 2, 3 }', { 'font-size': 15, opacity: fade(u, 0.1) });
      const v0 = u > 1.6 ? '99' : '1';
      ['', '2', '3'].forEach((v, i) => card(110 + i * 90, 160, 76, 54, { rx: 6, text: i === 0 ? v0 : v, mono: true, fs: 20, fw: 800, stroke: i === 0 && u > 1.6 ? ACC : INK, fill: i === 0 && u > 1.6 ? ACCBG : PANEL, s: pop(u, 0.2 + i * 0.12) }));
      card(200, 290, 200, 50, { rx: 8, text: 'Span<int> nums', mono: true, fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.7) });
      grow(200, 265, 130, 192, E(u, 0.9, 1.2), ACC);
      note(520, 170, 'nums[0] = 99', fade(u, 1.3), { class: 'mono', 'font-size': 20, 'font-weight': 800, fill: ACC });
      note(520, 210, '창을 통해 원본 칸을 바로 고친다', fade(u, 1.8));
      note(520, 300, '수명: 이 스택 프레임 안', fade(u, 2.2), { fill: MUT });
      return; }
    if (k === 1) { heapBox(40, 40, 420, 200, '힙');
      chars(90, 110, 'hello', 60, { h: 50, fs: 22 });
      frame(90, 110, 60, 0, 5, E(u, 0.2, 0.8), INFO, 'ReadOnlySpan<char> view', { h: 50 });
      note(520, 130, "view[0] = 'H';", fade(u, 1.0), { class: 'mono', 'font-size': 20, 'font-weight': 800 });
      if (u > 1.4) { lock(520 + 230, 122, true, BAD, pop(u, 1.4)); pill(640, 190, 'CS8331 · 읽기 전용', BAD, pop(u, 1.6), { mono: true, fs: 14.5 }); }
      note(520, 260, '실행 전에 컴파일러가 막는다', fade(u, 2.0));
      note(520, 290, '원본을 바꿀 일이 없으면 기본값', fade(u, 2.3), { fill: INFO });
      return; }
    if (k === 2) { // await 를 건너는 Memory
      const ty = 70;
      el('line', { x1: 60, y1: ty, x2: 900, y2: ty, stroke: GRID, 'stroke-width': 2 });
      [[60, 'HandleAsync 시작'], [380, 'await Task.Delay(10)'], [700, '이어서 실행']].forEach(([x, s], i) => { el('circle', { cx: x, cy: ty, r: 7, fill: i === 1 ? WARN : ACC, opacity: fade(u, 0.1 + i * 0.5) }); mono(x + 12, ty - 14, s, { 'font-size': 14, opacity: fade(u, 0.1 + i * 0.5) }); });
      zone(40, 120, 420, 270, '스택', { fill: SOFT }); zone(480, 120, 440, 270, '힙', { fill: SOFT });
      const out = E(u, 0.7, 1.3);   // await 에서 스택 프레임이 내려가고 상태 머신으로
      card(250, 200, 300, 70, { rx: 8, text: 'HandleAsync 프레임', fs: 15, op: 1 - out, dash: out > 0.5 ? '5 4' : null });
      if (out > 0.3) note(100, 290, 'await 에서 프레임은 사라진다', fade(u, 1.1), { fill: MUT });
      card(700, 210, 300, 120, { rx: 10, stroke: WARN, sw: 2.2, s: pop(u, 0.9) });
      if (u > 1.1) { tx(560, 176, '상태 머신 객체', { 'font-size': 15, 'font-weight': 800, fill: WARN });
        mono(570, 212, 'Memory<byte> buffer', { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); check(855, 207, 9, 1);
        mono(570, 248, 'Span<byte> …', { 'font-size': 15, fill: BAD, 'text-decoration': 'line-through' }); cross(855, 243, 8, 1); }
      if (u > 1.8) { card(250, 330, 300, 50, { rx: 8, text: 'buffer.Span → span[0] = 0xFF', mono: true, fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 1.8) }); }
      sub(700, 372, 'await 뒤에서 .Span 으로 창을 꺼낸다', fade(u, 2.1), { 'font-size': 14.5 });
      return; }
    // k=3 선택 기준: 수명 축
    const fam = c.beat.family;
    el('line', { x1: 80, y1: 120, x2: 880, y2: 120, stroke: MUT, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)', opacity: fade(u, 0.1) });
    note(80, 100, '이 자리에서 잠깐', fade(u, 0.2), { fill: ACC });
    note(880, 100, '필드에 보관 · await 건너기', fade(u, 0.2), { fill: WARN, 'text-anchor': 'end' });
    tx(480, 150, '기준은 수명', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
    fam.forEach((f, i) => { const x = [200, 450, 760][i], s = pop(u, 0.6 + i * 0.4), col = i === 2 ? WARN : i === 1 ? INFO : ACC;
      card(x, 270, 230, 150, { rx: 12, stroke: col, sw: 2.4, s });
      if (s < 0.5) return;
      mono(x, 222, f.name, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'middle' });
      tx(x, 256, f.where, { 'font-size': 14, 'text-anchor': 'middle' });
      tx(x, 286, ['이 자리에서 읽고 쓴다', '읽기만 하는 창', 'await 를 건너 산다'][i], { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      mono(x, 322, f.can.replace(' (.Span 으로 사용)', ''), { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 800, fill: f.can.includes('✓') ? GOOD : BAD }); });
  }

  // ---------- 4. Slice · stackalloc · ArrayPool ----------
  const KV = 'user=42;role=admin;ttl=300', KX = 70, KC = 31, KY = 90;
  function shelf(x, y, taken, back) { zone(x, y, 380, 150, 'ArrayPool<byte>.Shared', { fill: SOFT });
    for (let i = 0; i < 4; i++) { const isT = i === 1 && taken && !back;
      el('rect', { x: x + 24 + i * 88, y: y + 50, width: 72, height: 70, rx: 6, fill: isT ? 'none' : PANEL, stroke: isT ? GRID : INK, 'stroke-dasharray': isT ? '5 4' : null, 'stroke-width': 1.8 });
      if (!isT) mono(x + 60 + i * 88, y + 90, 'byte[]', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); } }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { heapBox(30, 30, 900, 200);
      mono(KX, KY - 30, 'string (힙)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      chars(KX, KY, KV, KC, { index: [0, 5, 13, 25], hi: (i) => k === 1 && ((i >= 5 && i < 7 && u > 0.9) || (i >= 13 && i < 18 && u > 1.6)) });
      frame(KX, KY, KC, 0, 26, k === 0 ? E(u, 0.3, 1.2) : 1, k === 1 ? GRID : ACC, k === 1 ? null : 'kv = AsSpan()');
      if (k === 1) { frame(KX, KY, KC, 5, 2, E(u, 0.4, 0.9), ACC); frame(KX, KY, KC, 13, 5, E(u, 1.1, 1.6), ACC);
        if (u > 0.9) mono(KX + 5 * KC, KY + 78, 'id = kv.Slice(5, 2)', { 'font-size': 15, 'font-weight': 800, fill: ACC });
        if (u > 1.6) mono(KX + 13 * KC, KY + 108, 'role = kv.Slice(13, 5)', { 'font-size': 15, 'font-weight': 800, fill: ACC }); }
      mono(900, 300, `힙 할당 0 B`, { 'font-size': 22, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, k === 0 ? 1.4 : 2.0) });
      sub(480, 360, k === 0 ? '전체를 가리키는 창 하나에서 시작한다' : '창 위에 또 창: 시작 위치와 길이만 다시 계산한다', fade(u, 1.8), { 'font-size': 15 });
      return; }
    if (k === 2) { zone(30, 40, 900, 200, '스택 (스레드마다 보통 1 MB)', { fill: SOFT });
      note(60, 100, 'Span<byte> buf = stackalloc byte[128];', fade(u, 0.1), { class: 'mono' });
      const n = Math.round(E(u, 0.3, 1.3) * 32);
      for (let i = 0; i < n; i++) el('rect', { x: 60 + i * 26, y: 130, width: 24, height: 40, rx: 3, fill: i === 0 && u > 1.6 ? ACCBG : PANEL, stroke: i === 0 && u > 1.6 ? ACC : GRID });
      if (u > 1.6) mono(72, 156, 'EF', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      mono(60, 200, '128 B (칸 하나 = 4 B)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
      note(60, 300, '함수가 끝나면 스택과 함께 사라진다', fade(u, 1.9));
      note(60, 334, 'free 도, GC 도 필요 없다', fade(u, 2.2), { fill: GOOD });
      return; }
    // k=3 Rent, k=4 Return
    zone(30, 40, 380, 130, '스택 ~1 MB', { fill: SOFT });
    note(50, 100, 'stackalloc byte[65536]', 1, { class: 'mono', fill: BAD, 'font-size': 14.5 });
    if (k === 3) { cross(370, 95, 10, pop(u, 0.6)); note(50, 140, '크거나 가변이면 위험', fade(u, 0.8), { fill: BAD, 'font-size': 14 }); }
    else note(50, 140, '크거나 가변이면 위험', 1, { fill: BAD, 'font-size': 14 });
    shelf(470, 40, true, k === 4 && u > 1.6);
    const ax = 470 + 24 + 88 + 36, ay = 40 + 85;
    if (k === 3) { const m = E(u, 0.6, 1.4);
      card(lerp(ax, 640, m), lerp(ay, 300, m), 160, 70, { rx: 6, text: 'byte[]\nLength 65,536', mono: true, fs: 14.5, stroke: ACC, color: ACC });
      note(470, 380, 'Rent(64 * 1024) → 빌린 배열', fade(u, 1.6), { class: 'mono', fill: ACC }); }
    else { const m = E(u, 0.5, 1.6);
      if (m < 1) card(lerp(640, ax, m), lerp(300, ay, m), 160, 70, { rx: 6, text: 'byte[]\nLength 65,536', mono: true, fs: 14.5, stroke: ACC, color: ACC });
      note(470, 360, 'finally { Return(big); }', fade(u, 0.2), { class: 'mono', fill: GOOD });
      note(470, 392, '예외가 나도 돌려준다 · 다음 Rent 가 재사용', fade(u, 1.8), { 'font-size': 14.5 }); }
  }

  // ---------- 5. 할당 없는 파싱 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { const x0 = 110, cw = 56, y = 80;
      mono(x0, y - 22, 'time = "12:34:56".AsSpan()', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      chars(x0, y, '12:34:56', cw, { h: 46, fs: 22, index: [0, 3, 6] });
      if (k === 0) { frame(x0, y, cw, 0, 8, E(u, 0.3, 1.1), ACC, null, { h: 46 }); note(x0, 230, '아직 아무것도 자르지 않았다', fade(u, 1.4), { fill: MUT }); return; }
      const ws = [[0, 12], [3, 34], [6, 56]];
      ws.forEach(([a, v], i) => { const p = k === 1 ? E(u, 0.2 + i * 0.45, 0.6 + i * 0.45) : 1; frame(x0, y, cw, a, 2, p, ACC, null, { h: 46 });
        const x = x0 + a * cw + cw - 2; if (p >= 1) { grow(x, y + 60, x, y + 112, k === 1 ? seg(u, 0.6 + i * 0.45, 0.9 + i * 0.45) : 1, ACC);
          card(x, 150, 70, 44, { rx: 8, text: String(v), mono: true, fs: 20, fw: 800, stroke: ACC, color: ACC, s: k === 1 ? pop(u, 0.9 + i * 0.45) : 1 }); } });
      mono(x0 - 6, 154, 'int', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      if (k === 1) { [['Slice + int.Parse(span)', 0, GOOD, '0 B'], ['Substring + int.Parse', 96, BAD, '96 B · 임시 string 3개']].forEach(([n, v, col, s2], i) => { const yy = 250 + i * 50;
          tx(110, yy + 14, n, { 'font-size': 15, 'font-weight': 700, class: 'mono' });
          hbar(420, yy, 200, v * E(u, 1.9, 2.5), 96, { col, text: s2, h: 20 }); }); }
      if (k === 2) { const n = Math.floor(seg(u, 0.4, 1.6) * 11);
        mono(110, 248, '$"{hh}h {mm}m {ss}s"', { 'font-size': 15, opacity: fade(u, 0.2) });
        chars(110, 266, '12h 34m 56s', 34, { s: (i) => (i < n ? 1 : 0) });
        mono(110, 350, '할당은 여기 한 번 · 48 B', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) }); }
      return; }
    // k=3, k=4: csv 토크나이저 — 실제 실행: a(comma 1) → bb(comma 2) → ccc(comma -1)
    const x0 = 110, cw = 56, y = 80, CSV = 'a,bb,ccc';
    mono(x0, y - 36, 'csv = "a,bb,ccc".AsSpan()', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    chars(x0, y, CSV, cw, { h: 46, fs: 22, index: [0, 1, 4] });
    const its = [[0, 1, 1], [2, 2, 2], [5, -1, 3]];   // 시작, comma(창 기준), 필드 길이
    let step = 0; if (k === 4) step = u < 0.9 ? 0 : u < 1.8 ? 1 : 2;
    const [st, cm, ln] = its[step];
    frame(x0, y, cw, st, 8 - st, 1, GRID, null, { h: 46 });
    if (k === 3) { const sc = E(u, 0.3, 0.9); el('circle', { cx: x0 + lerp(0, 1, sc) * cw + 27, cy: y + 70, r: 6, fill: WARN });
      if (u > 1.0) note(x0 + cw + 27, y + 100, 'IndexOf(\',\') = 1', 1, { class: 'mono', fill: WARN, 'text-anchor': 'middle' });
      frame(x0, y, cw, 0, 1, E(u, 1.3, 1.7), ACC, 'field', { h: 46 }); }
    else { frame(x0, y, cw, st, ln, E(u, step * 0.9 + 0.2, step * 0.9 + 0.6), ACC, 'field', { h: 46 }); }
    // 반복 기록 표
    tx(110, 240, '반복', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(220, 240, 'comma', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(340, 240, 'field', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const shown = k === 3 ? (u > 1.7 ? 1 : 0) : step + 1;
    [['1', '1', '"a"'], ['2', '2', '"bb"'], ['3', '-1 → break', '"ccc"']].slice(0, shown).forEach((r, i) => r.forEach((v, j) => mono([110, 220, 340][j], 272 + i * 30, v, { 'font-size': 15, 'font-weight': 700 })));
    note(560, 272, k === 3 ? '쉼표 앞까지 Slice(0, comma)' : 'csv = csv.Slice(comma + 1)', fade(u, 0.4), { class: 'mono', 'font-size': 14.5 });
    note(560, 306, '창의 시작점만 옮긴다 · 할당 0', fade(u, 1.0), { fill: GOOD });
  }

  // ---------- 6. 제약과 수명 ----------
  function s6(t, c) { const { k, u } = c;
    if (k === 0) { heapBox(40, 40, 520, 300, '힙');
      card(300, 190, 380, 190, { rx: 12, stroke: INK, sw: 2.2, s: pop(u, 0.2) });
      mono(130, 122, 'class Cache', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) });
      mono(140, 180, 'Span<byte> _buf;', { 'font-size': 16, fill: BAD, opacity: fade(u, 0.6), 'text-decoration': u > 1.2 ? 'line-through' : null });
      if (u > 1.2) { cross(460, 174, 9, pop(u, 1.2)); pill(760, 176, 'CS8345', BAD, pop(u, 1.3), { mono: true }); }
      mono(140, 240, 'Memory<byte> _buf;', { 'font-size': 16, fill: GOOD, opacity: fade(u, 1.7) });
      if (u > 1.9) check(460, 234, 10, pop(u, 1.9));
      note(600, 240, 'ref struct 는 힙에 살 수 없다', fade(u, 2.2));
      return; }
    if (k === 1) { const ax = 80, bx = 880, ty = 120, aw = 470;
      mono(ax, 70, 'async Task Work(…)', { 'font-size': 16, 'font-weight': 800 });
      el('line', { x1: ax, y1: ty, x2: bx, y2: ty, stroke: GRID, 'stroke-width': 3 });
      el('line', { x1: aw, y1: ty - 40, x2: aw, y2: 380, stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 0.2) });
      mono(aw + 8, ty - 22, 'await', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.2) });
      // Span 지역 변수: await 앞에서만 쓰면 OK
      card(250, 180, 280, 44, { rx: 8, text: 'Span 지역 변수 (await 앞)', fs: 14.5, stroke: GOOD, s: pop(u, 0.5) }); if (u > 0.8) check(410, 180, 9, 1);
      const m = E(u, 1.0, 1.6);
      card(lerp(250, aw - 104, m), 250, 200, 44, { rx: 8, text: 'Span 을 await 너머로', fs: 14.5, stroke: BAD, s: pop(u, 0.9) });
      if (m >= 1) { cross(aw + 18, 250, 11, pop(u, 1.6)); pill(700, 250, 'CS4007', BAD, pop(u, 1.7), { mono: true }); }
      card(250, 320, 280, 44, { rx: 8, text: 'Span<byte> 매개변수', mono: false, fs: 14.5, stroke: BAD, s: pop(u, 1.9) }); if (u > 2.1) pill(700, 320, 'CS4012', BAD, pop(u, 2.1), { mono: true });
      sub(700, 395, '지역 변수는 힙의 상태 머신으로 옮겨진다', fade(u, 2.3), { 'font-size': 14.5 });
      return; }
    // k=2,3: 스택 프레임
    const fx = 90, fw = 360;
    zone(40, 40, 460, 360, '스택', { fill: SOFT });
    card(fx + fw / 2, 340, fw, 70, { rx: 8, text: 'Main 프레임', fs: 15 });
    const pop3 = k === 3 ? E(u, 0.5, 1.3) : 0;
    const fy = 200 - pop3 * 120, fop = 1 - pop3;
    if (fop > 0.02) { card(fx + fw / 2, fy, fw, 160, { rx: 8, stroke: WARN, sw: 2.2, op: fop, s: k === 2 ? pop(u, 0.2) : 1 });
      mono(fx + 14, fy - 56, 'Dangling() 프레임', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fop });
      for (let i = 0; i < 4; i++) card(fx + 50 + i * 74, fy, 62, 44, { rx: 4, text: '0', mono: true, fs: 15, op: fop, s: k === 2 ? pop(u, 0.5 + i * 0.1) : 1 });
      mono(fx + 14, fy + 56, 'stackalloc int[4]', { 'font-size': 14, fill: MUT, opacity: fop }); }
    if (k === 3 && pop3 > 0.5) { el('rect', { x: fx, y: 120, width: fw, height: 160, rx: 8, fill: 'none', stroke: BAD, 'stroke-dasharray': '6 5', 'stroke-width': 2 });
      mono(fx + fw / 2, 205, '사라진 메모리', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }
    card(720, 200, 220, 60, { rx: 8, text: 'Span<int> local', mono: true, fs: 15, stroke: ACC, color: ACC, s: k === 2 ? pop(u, 1.0) : 1 });
    const to = k === 3 && pop3 > 0.5 ? [fx + fw, 205] : [fx + fw, fy];
    grow(610, 200, to[0] + 8, to[1], k === 2 ? E(u, 1.3, 1.8) : 1, k === 3 && pop3 > 0.5 ? BAD : ACC);
    if (k === 2) { note(560, 300, '수명 = 이 함수 프레임', fade(u, 1.9)); return; }
    note(560, 110, 'return local;', fade(u, 0.2), { class: 'mono', 'font-size': 18, 'font-weight': 800 });
    if (u > 1.6) { card(720, 310, 240, 60, { rx: 10, fill: BADBG, stroke: BAD, text: 'CS8352 컴파일 에러', fs: 15.5, fw: 800, color: BAD, s: pop(u, 1.6) }); }
    sub(720, 372, '실행 전에 컴파일러가 막는다', fade(u, 2.1), { 'font-size': 14.5 });
  }
  function s6map(t, c) { const { k, u } = c; if (k !== 4) return s6(t, c);
    const rows = c.beat.pick.rows;
    tx(480, 50, '무엇을 쓸까', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
    rows.forEach((r, i) => { const y = 100 + i * 62, s = pop(u, 0.2 + i * 0.3), col = i === 4 ? MUT : i === 0 ? ACC : i === 1 ? WARN : INFO;
      card(260, y, 380, 48, { rx: 8, stroke: GRID, s }); tx(86, y + 5, r.cmd, { 'font-size': 15, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 });
      grow(456, y, 530, y, seg(u, 0.4 + i * 0.3, 0.7 + i * 0.3), MUT);
      card(720, y, 360, 48, { rx: 8, stroke: col, sw: 2.2, s }); mono(720, y + 5, r.see.replace(' (→ .Span 으로 사용)', ''), { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 }); });
  }

  const quiz = [
    { q: 'request.Substring(4, 13)을 부르면 메모리에서 무슨 일이 일어나나?',
      o: ['원본 string의 13글자 구간에 표시만 한다', '힙에 48바이트짜리 새 string을 만들고 13글자를 복사한다', '스택에 13글자를 잠깐 올렸다가 지운다'], a: 1,
      why: 'Substring은 원본이 있어도 항상 복사본을 만든다. 5만 번 돌면 2.4MB가 쌓여 GC를 부른다.' },
    { q: 'request.AsSpan(4, 13)이 만드는 것은 무엇인가?',
      o: ['원본의 index 4를 가리키는 포인터와 길이 13만 든 16바이트 값', '13글자를 복사한 새 char 배열', '원본 전체를 복사한 읽기 전용 string'], a: 0,
      why: 'Span은 _pointer와 _length 두 필드뿐이라 힙 할당이 0이다. ToString을 부를 때만 새 string이 생긴다.' },
    { q: 'await를 건너서도 버퍼를 들고 있어야 한다. 무엇으로 받아야 하나?',
      o: ['Span<byte>', 'ReadOnlySpan<byte>', 'Memory<byte>'], a: 2,
      why: 'await 너머의 값은 힙의 상태 머신에 담긴다. Span은 힙에 살 수 없어 CS4007이 나고, Memory는 담을 수 있다.' },
    { q: '64KB 짜리 임시 버퍼가 필요하다. 알맞은 방법은 무엇인가?',
      o: ['stackalloc byte[65536]', 'ArrayPool에서 Rent하고 finally에서 Return', '매번 new byte[65536]'], a: 1,
      why: '스택은 보통 1MB라 큰 stackalloc은 위험하다. 풀에서 빌리면 길이 65,536 배열을 받아 쓰고 돌려줘 재사용한다.' },
    { q: '"12:34:56" 을 Slice와 int.Parse(span)으로 파싱하면 할당은 얼마인가?',
      o: ['0바이트', '96바이트', '임시 string 3개'], a: 0,
      why: 'int.Parse에 ReadOnlySpan<char> 오버로드가 있어 창을 그대로 넘긴다. Substring으로 자르면 96바이트, 3개가 생긴다.' },
    { q: 'stackalloc 버퍼를 가리키는 Span을 함수 밖으로 return 하면 어떻게 되나?',
      o: ['컴파일러가 CS8352로 막는다', '실행 중 NullReferenceException이 난다', 'GC가 버퍼를 힙으로 옮겨 준다'], a: 0,
      why: '함수가 끝나면 그 스택 프레임은 사라진다. 죽은 메모리를 가리키게 되므로 컴파일 단계에서 막힌다.' },
  ];

  const summary = [
    'Substring은 원본이 있어도 새 string을 만든다. 5만 번 돌면 2.4MB가 쌓여 Gen0 GC를 부른다.',
    'Span은 시작 위치와 길이만 든 16바이트 값이다. AsSpan과 Slice는 할당이 0이다.',
    'Span은 스택에만 산다. 필드에 두거나 await를 건너려면 Memory를 쓰고 쓸 때 .Span을 꺼낸다.',
    '작은 버퍼는 stackalloc, 큰 버퍼는 ArrayPool에서 빌려 쓰고 finally에서 돌려준다.',
  ];
  const review = [
    { q: '로그 파서가 줄마다 Substring으로 필드를 떼어 int.Parse에 넘긴다. GC가 자주 돈다. 먼저 바꿀 것은?',
      o: ['Substring 대신 AsSpan과 Slice로 잘라 int.Parse(span)에 넘긴다', 'GC.Collect()를 주기적으로 부른다', '필드를 Memory<char> 필드에 저장해 둔다'], a: 0,
      why: '조각마다 새 string이 생기는 것이 원인이다. 창을 그대로 Parse에 넘기면 파싱 단계 할당이 0이 된다.' },
    { q: 'async 메서드에서 받은 버퍼를 await 뒤에 고치려다 CS4012가 났다. 어떻게 고치나?',
      o: ['매개변수를 ReadOnlySpan<byte>로 바꾼다', '매개변수를 Memory<byte>로 받고 await 뒤에 .Span을 꺼낸다', 'stackalloc으로 새 버퍼를 만든다'], a: 1,
      why: 'ref struct인 Span 계열은 async 매개변수가 될 수 없다. Memory는 상태 머신에 담기고 필요할 때 창을 꺼낼 수 있다.' },
    { q: '요청마다 크기가 다른 버퍼(수십 KB까지)를 stackalloc으로 잡도록 바꿨더니 가끔 프로세스가 죽는다. 원인과 해결은?',
      o: ['GC가 스택 버퍼를 지워서다. new로 바꾼다', 'Span이 16바이트라 모자라서다. Memory로 바꾼다', '스택이 넘친 것이다. 큰 버퍼는 ArrayPool에서 빌린다'], a: 2,
      why: '스택은 보통 1MB라 크고 가변인 stackalloc은 넘칠 수 있고, 스택 오버플로는 잡을 수 없다. 큰 버퍼는 풀에서 빌려 돌려준다.' },
  ];

  R.page({ title: '복사 없이 메모리 들여다보기', scenes: [s1, s2, s3, s4, s5, s6map], quiz, summary, review });
})();
