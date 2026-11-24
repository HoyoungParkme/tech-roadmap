/* I-2-1 제어문·메서드 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono: monoRaw, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, terminal, cells, spans, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 한글이 섞인 글은 고정폭 글꼴에서 자간이 벌어지므로 보통 글꼴로 쓴다
  const mono = (x, y, s, a, p) => (/[가-힣]/.test(String(s)) ? tx(x, y, s, Object.assign({ style: 'white-space:pre' }, a || {}), p) : monoRaw(x, y, s, a, p));
  const KW = /^(var|class|static|void|string|int|long|double|bool|new|public|private|return|if|else|switch|case|break|default|for|foreach|while|do|in|out|ref|params|null|is|true|false|object)$/;
  function cs(x, y, line, o) { o = o || {}; const fs = o.fs || 14.5, f = o.shown == null ? 1 : clamp(o.shown);
    const s = line.slice(0, Math.round(line.length * f)); const parts = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) parts.push([w, KW.test(w) ? { fill: INFO, 'font-weight': 700 } : { fill: o.color || INK }]); }); buf = ''; };
    while (i < s.length) { const c = s[i];
      if (c === '/' && s[i + 1] === '/') { flush(); parts.push([s.slice(i), { fill: MUT }]); break; }
      if (c === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; parts.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += c; i++; }
    flush(); return spans(x, y, parts, { 'font-size': fs, opacity: o.op ?? 1, 'text-anchor': o.anchor }); }
  const out = (x, y, w, lines, shown, o) => terminal(x, y, w, 30 + Math.max(1, lines.length) * 22 + 14, lines.map((l) => [l, 'var(--term)']), Math.max(0.001, shown), Object.assign({ title: 'console', fs: 14 }, o || {}));
  // 값 토큰(동그란 알약)
  const token = (x, y, s, col, sc) => card(x, y, tw(s, 15) + 26, 32, { rx: 16, fill: col || ACC, stroke: 'none', text: s, fs: 15, fw: 800, color: PANEL, mono: true, s: sc ?? 1 });

  // ================= 장면 1. 조건문: 문 vs 식 =================
  function gate(x, y, w, s, st, sc) { // st: null | 'no' | 'yes'
    const col = st === 'yes' ? GOOD : st === 'no' ? OFF : INK;
    card(x, y, w, 40, { rx: 20, stroke: col, sw: 2.2, text: s, fs: 15, mono: true, color: st === 'no' ? MUT : INK, s: sc ?? 1, fill: st === 'yes' ? GOODBG : PANEL }); }
  function machine(k, u, arms) { // switch 식 기계
    card(330, 210, 360, 300, { rx: 14, stroke: INFO, sw: 2.5, fill: INFOBG });
    mono(170, 82, 'code switch {', { 'font-size': 16, 'font-weight': 800, fill: INFO }); mono(170, 346, '};', { 'font-size': 16, 'font-weight': 800, fill: INFO });
    arms.forEach((a, i) => { const y = 110 + i * 54, s = a.s ?? 1; if (s <= 0) return;
      card(330, y + 12, 320, 44, { rx: 8, stroke: a.hit ? GOOD : GRID, sw: a.hit ? 2.6 : 1.5, fill: a.hit ? GOODBG : PANEL, s });
      mono(186, y + 18, a.pat, { 'font-size': 15, 'font-weight': 800, fill: a.pat === '_' ? WARN : INK, opacity: s });
      mono(268, y + 18, '=>', { 'font-size': 15, fill: MUT, opacity: s }); mono(306, y + 18, a.ret, { 'font-size': 15, fill: ACC, opacity: s }); });
    grow(40, 210, 146, 210, 1, MUT); token(80, 182, '404', INK);
    el('path', { d: 'M510,210 H560', stroke: INFO, 'stroke-width': 4 }); sub(600, 196, '값 하나', 1, { fill: INFO, 'font-weight': 700 }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { // if / else 사다리
      token(120, 60, 'code = 404', INK, pop(u, 0.1));
      const G = [['>= 500 ?', 'no'], ['>= 400 ?', 'yes']];
      G.forEach(([s, st], i) => gate(320, 130 + i * 90, 200, s, u > 0.6 + i * 0.6 ? st : null, pop(u, 0.2 + i * 0.2)));
      const route = [[120, 76], [120, 130], [220, 130], [220, 220], [320, 220]];
      dot(route, seg(u, 0.5, 1.6), ACC, 8);
      [['Log.Error', 130, 'no'], ['Log.Warn', 220, 'yes'], ['Log.Info', 310, null]].forEach(([s, y, st], i) => { grow(420, y, 520, y, i < 2 ? 1 : 0, MUT);
        card(600, y, 150, 40, { rx: 8, text: s, fs: 15, mono: true, stroke: st === 'yes' && u > 1.8 ? GOOD : GRID, fill: st === 'yes' && u > 1.8 ? GOODBG : PANEL, color: st === 'yes' ? INK : MUT }); });
      gate(320, 310, 200, 'else', null, pop(u, 0.6)); grow(420, 310, 520, 310, 1, MUT);
      pill(820, 220, '돌려준 값: 없음', MUT, pop(u, 2.1), { fs: 14 });
      sub(480, 390, 'if/else 는 무엇을 실행할지 고른다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1 || k === 2) { // switch 문: case 방과 break 벽
      token(120, 60, 'code = 404', INK);
      const rooms = [['case 200:', '"OK" 출력'], ['case 404:', '"Not Found" 출력'], ['default:', '"Unknown" 출력']];
      rooms.forEach(([a, b], i) => { if (k === 1 && i > 0) return; const y = 110 + i * 92, s = k === 1 ? pop(u, 0.2) : i === 0 ? 1 : pop(u, 0.2 + i * 0.3), hit = k === 2 && i === 1 && u > 1.4;
        card(400, y + 30, 380, 74, { rx: 8, stroke: hit ? GOOD : INK, sw: hit ? 2.6 : 2, fill: hit ? GOODBG : PANEL, s });
        mono(226, y + 24, a, { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: s }); mono(360, y + 24, b, { 'font-size': 14.5, opacity: s });
        const wall = k === 1 ? E(u, 0.9, 1.5) : 1; el('rect', { x: 210, y: y + 60, width: 380 * wall, height: 7, rx: 3, fill: BAD, opacity: s });
        if (wall > 0.5) mono(600, y + 67, 'break', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: s }); });
      if (k === 1) { sub(400, 270, 'break 를 빠뜨리면 다음 case 로 못 흐른다: CS0163 컴파일 에러', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
      dot([[120, 76], [120, 232], [210, 232]], seg(u, 0.6, 1.4), ACC, 8);
      out(660, 90, 270, ['Not Found'], seg(u, 1.6, 2.0));
      pill(795, 230, '돌려준 값: 없음', MUT, pop(u, 2.1), { fs: 14 });
      sub(795, 270, '변수에 담으려면 case 안에서', fade(u, 2.3), { 'font-size': 14 }); sub(795, 292, '따로 대입해야 한다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k3~6 switch 식
    const A = [{ pat: '200', ret: '"OK"' }, { pat: '404', ret: '"Not Found"' }, { pat: '>= 500', ret: '"Server Error"' }, { pat: '_', ret: '"Unknown"' }];
    const arms = A.map((a, i) => ({ ...a, s: k === 3 ? 0 : k === 4 ? (i < 2 ? pop(u, 0.2 + i * 0.3) : 0) : k === 5 && i >= 2 ? pop(u, 0.2 + (i - 2) * 0.4) : i < 2 || k >= 5 ? 1 : 0, hit: (k === 4 && i === 1 && u > 1.8) || (k === 6 && i === 1) }));
    machine(k, u, arms);
    if (k === 3) { sub(330, 210, '(팔을 채우는 중)', fade(u, 0.3), { 'font-size': 14.5 });
      tx(780, 120, 'break 없음', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8), 'text-decoration': 'line-through' });
      tx(780, 290, '문이 아니라 식이다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      sub(780, 318, '그대로 대입하거나 return 한다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 4) { const route = [[146, 210], [160, 134], [160, 188]]; dot(route, seg(u, 0.9, 1.8), ACC, 8);
      sub(780, 290, '위에서부터 맞춰 보고', fade(u, 1.0), { 'font-size': 14.5, fill: INK }); sub(780, 314, '처음 맞는 팔에서 멈춘다', fade(u, 1.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5) { pill(800, 300, '_ 는 나머지 전부', WARN, pop(u, 1.2), { fs: 14 });
      sub(800, 344, '_ 를 빼면 경고 CS8509,', fade(u, 1.8), { 'font-size': 14 }); sub(800, 366, '안 맞는 입력은 실행 중 예외', fade(u, 2.0), { 'font-size': 14 }); return; }
    const o = E(u, 0.4, 1.2); token(lerp(560, 780, o), lerp(210, 300, o), '"Not Found"', ACC);
    cs(640, 350, 'var s = Describe(404);', { fs: 15, op: fade(u, 1.3) });
    sub(780, 390, '출력이 아니라 돌려받은 값이다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
  }

  // ================= 장면 2. 반복문 =================
  function s2(t, c) { const { k, u } = c;
    const items = ['"a"', '"b"', '"c"'];
    if (k <= 1) { cs(60, 60, k === 0 ? 'for (int i = 0; i < items.Length; i++)' : 'foreach (var x in items)', { fs: 15.5 });
      cells(260, 120, items, { w: 90, h: 50, index: k === 0, style: () => ({ stroke: ACC }) });
      const it = Math.min(2, Math.floor(seg(u, 0.3, 2.4) * 3)), step = seg(u, 0.3, 2.4) > 0;
      if (step) { const cx = 305 + it * 96; el('path', { d: `M${cx - 10},210 L${cx},196 L${cx + 10},210 Z`, fill: k === 0 ? INFO : GOOD });
        if (k === 0) { card(cx, 236, 64, 30, { rx: 6, text: 'i = ' + it, fs: 14, mono: true, stroke: INFO }); pill(130, 145, 'i < 3 ?', INFO, 1, { fs: 14, mono: true }); }
        else card(cx, 236, 60, 30, { rx: 6, text: 'x', fs: 14, mono: true, stroke: GOOD }); }
      out(620, 100, 290, (k === 0 ? ['0: a', '1: b', '2: c'] : ['a', 'b', 'c']), 3 * seg(u, 0.3, 2.4) + 0.001);
      sub(480, 320, k === 0 ? '인덱스를 직접 만들고 늘린다. 몇 번째인지 안다' : '인덱스 없이 원소만 꺼낸다. 범위를 벗어날 일이 없다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 1) sub(480, 350, '특별한 이유가 없으면 기본값으로 쓴다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2 || k === 3) { const isDo = k === 3;
      cs(60, 60, isDo ? 'do { line = ReadLine(); } while (!IsNullOrEmpty(line));' : 'while (q.Count > 0) WriteLine(q.Dequeue());', { fs: 15 });
      // 순서도: 검사 → 몸통 (while) / 몸통 → 검사 (do)
      const order = isDo ? [['몸통 실행', INK], ['조건 검사', WARN]] : [['조건 검사', WARN], ['몸통 실행', INK]];
      order.forEach(([s, col], i) => card(200, 140 + i * 90, 200, 50, { rx: i === (isDo ? 1 : 0) ? 25 : 8, stroke: col, sw: 2.4, text: (i + 1) + '. ' + s, fs: 15, s: pop(u, 0.2 + i * 0.3) }));
      grow(200, 165, 200, 205, seg(u, 0.6, 0.9), MUT);
      el('path', { d: 'M100,230 C 60,230 60,140 98,140', fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: fade(u, 1.0), 'marker-end': 'url(#ra-ah)' });
      if (!isDo) { const n = Math.min(3, Math.floor(seg(u, 0.6, 2.4) * 3.99));
        tx(520, 128, 'q', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
        cells(550, 104, [1, 2, 3].slice(n), { w: 56, h: 44, style: () => ({ stroke: WARN }) });
        if (n >= 3) mono(560, 132, '(비었다 → 멈춤)', { 'font-size': 14, fill: MUT });
        out(520, 200, 380, [[1, 2, 3].slice(0, n).join('  ') || ' '], 1);
        sub(560, 340, '처음부터 비어 있으면 한 번도 안 돈다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      else { pill(600, 150, '처음부터 조건이 거짓이어도', WARN, pop(u, 1.0), { fs: 14 });
        tx(600, 210, '최소 1번은 실행된다', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.4) });
        sub(600, 250, '입력 재시도·메뉴 루프에 어울린다', fade(u, 1.8), { 'font-size': 14.5 }); }
      return; }
    // k4, k5 순회 중 수정 (users 예시)
    const U = [['a', true], ['b', false], ['c', true]];
    tx(60, 50, 'users (예시: a·c 가 만료)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k === 4) { const rm = seg(u, 0.8, 1.2);
      const list = rm >= 1 ? U.slice(1) : U;
      list.forEach(([n, ex], i) => card(160 + i * 96, 100, 84, 50, { rx: 8, text: n, fs: 17, mono: true, stroke: ex ? BAD : INK, fill: ex ? BADBG : PANEL, op: rm > 0 && rm < 1 && i === 0 ? 1 - rm : 1 }));
      el('path', { d: 'M150,170 L160,156 L170,170 Z', fill: INFO }); mono(160, 192, 'u', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO });
      cs(60, 250, 'foreach (var u in users)', { fs: 15 }); cs(90, 278, 'if (u.Expired) users.Remove(u);', { fs: 15, op: fade(u, 0.4) });
      pill(720, 110, '컬렉션 버전 바뀜', WARN, pop(u, 1.3), { fs: 14 });
      pill(720, 180, 'InvalidOperationException', BAD, pop(u, 1.8), { fs: 14.5, mono: true });
      sub(720, 230, '다음 원소로 넘어가려는 순간 열거자가 멈춘다', fade(u, 2.1), { 'font-size': 14 }); return; }
    const sn = seg(u, 0.3, 1.0);
    U.forEach(([n, ex], i) => { const gone = ex && seg(u, 1.5, 2.1); card(160 + i * 96, 100, 84, 50, { rx: 8, text: n, fs: 17, mono: true, stroke: ex ? BAD : INK, fill: ex ? BADBG : PANEL, op: 1 - (gone || 0) }); });
    tx(60, 340, 'dead = users.Where(u => u.Expired).ToList()', { 'font-size': 15, class: 'mono', opacity: fade(u, 0.2) });
    [['a', 0], ['c', 1]].forEach(([n, i]) => card(160 + i * 96, 270, 84, 44, { rx: 8, text: n, fs: 16, mono: true, stroke: WARN, fill: WARNBG, s: pop(u, 0.4 + i * 0.3) }));
    tx(60, 276, 'dead', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN, opacity: sn });
    if (u > 1.4) { grow(160, 248, 160, 128, seg(u, 1.4, 1.8), WARN); grow(256, 248, 352, 128, seg(u, 1.5, 1.9), WARN); }
    out(560, 260, 330, ['users → b'], seg(u, 2.1, 2.5));
    sub(700, 140, '도는 목록 ≠ 고치는 목록', fade(u, 1.0), { 'font-size': 16, fill: GOOD, 'font-weight': 800 });
    sub(700, 170, 'for 역순 인덱스(i--)로 지워도 된다', fade(u, 1.3), { 'font-size': 14 });
  }

  // ================= 장면 3. 삼항 · 널 연산자 =================
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { // 갈림길
      cs(60, 56, k === 0 ? 'var status = input is null ? "빈 입력" : "정상";' : 'var name = input ?? "익명";', { fs: 16 });
      card(140, 180, 150, 54, { rx: 8, stroke: INK, sw: 2 }); mono(80, 186, 'input', { 'font-size': 15, 'font-weight': 700 }); mono(196, 186, 'null', { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      const y1 = 130, y2 = 240;
      el('path', { d: `M215,180 C 300,180 300,${y1} 380,${y1}`, fill: 'none', stroke: k === 0 ? GOOD : GRID, 'stroke-width': 3, opacity: fade(u, 0.3) });
      el('path', { d: `M215,180 C 300,180 300,${y2} 380,${y2}`, fill: 'none', stroke: k === 0 ? GRID : GOOD, 'stroke-width': 3, opacity: fade(u, 0.3) });
      const A = k === 0 ? ['"빈 입력"', 'null 이면'] : ['input 값 그대로', 'null 이 아니면'], B = k === 0 ? ['"정상"', '아니면'] : ['"익명"', 'null 이면'];
      card(490, y1, 210, 46, { rx: 8, text: A[0], fs: 15, mono: k === 0, stroke: k === 0 ? GOOD : GRID, fill: k === 0 ? GOODBG : PANEL, color: k === 0 ? INK : MUT, s: pop(u, 0.4) }); sub(490, y1 - 32, A[1], fade(u, 0.5));
      card(490, y2, 210, 46, { rx: 8, text: B[0], fs: 15, mono: true, stroke: k === 0 ? GRID : GOOD, fill: k === 0 ? PANEL : GOODBG, color: k === 0 ? MUT : INK, s: pop(u, 0.6) }); sub(490, y2 + 42, B[1], fade(u, 0.7));
      dot([[215, 180], [300, 180], [380, k === 0 ? y1 : y2], [480, k === 0 ? y1 : y2]], seg(u, 0.9, 1.7), ACC, 8);
      const res = k === 0 ? '"빈 입력"' : '"익명"'; card(800, 180, 190, 50, { rx: 8, stroke: ACC, sw: 2.4, s: pop(u, 1.8) });
      mono(724, 186, (k === 0 ? 'status' : 'name') + ' =', { 'font-size': 14, opacity: fade(u, 1.9) }); mono(880, 186, res, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      sub(480, 360, k === 0 ? '문이 아니라 식이라 결과를 바로 변수에 담는다' : '왼쪽이 null 일 때만 오른쪽을 평가한다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { cs(60, 56, 'cache ??= LoadFromDb();', { fs: 16 });
      const call2 = u > 1.6;
      card(180, 170, 200, 54, { rx: 8, stroke: INK, sw: 2 }); mono(100, 176, 'cache', { 'font-size': 15, 'font-weight': 700 });
      mono(260, 176, u < 1.1 ? 'null' : '데이터', { 'font-size': 15, 'font-weight': 700, fill: u < 1.1 ? BAD : GOOD, 'text-anchor': 'end' });
      dbIcon(620, 170, 'DB', { stroke: call2 ? GRID : INK });
      tx(420, 120, '1번째 호출', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      if (u < 1.2) { dot([[280, 160], [570, 160]], seg(u, 0.2, 0.7), ACC, 7); dot([[570, 180], [280, 180]], seg(u, 0.7, 1.15), GOOD, 7); }
      if (call2) { tx(420, 260, '2번째 호출', { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); grow(300, 270, 560, 270, 0.55, GRID, { plain: true }); cross(440, 290, 10, pop(u, 1.8));
        sub(440, 330, '값이 있으니 LoadFromDb() 를 부르지도 않는다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); }
      pill(820, 170, 'DB 호출 ' + (u < 0.5 ? 0 : 1) + '번', INFO, pop(u, 0.3), { fs: 15 }); return; }
    // k3~5: ?. 체인
    const L = ['user', '.Profile', '.Address', '.City'];
    cs(60, 56, k === 5 ? 'int? len = user?.Name?.Length;' : k === 4 ? 'var display = user?.Name ?? "게스트";' : 'string? city = user?.Profile?.Address?.City;', { fs: 16 });
    const nul = k === 3 ? 1 : 0; // 3장면: Profile 에서 null
    const chain = k === 3 ? L : ['user', '?.Name', k === 5 ? '?.Length' : null].filter(Boolean);
    chain.forEach((s, i) => { const x = 110 + i * 190, stop = k === 3 ? i > nul : k === 4 ? i > 0 : i > 0, isNull = k === 3 ? i === nul : k !== 3 && i === 0;
      const reach = seg(u, 0.3 + i * 0.4, 0.6 + i * 0.4);
      card(x, 160, 160, 54, { rx: 8, text: (k === 3 && i > 0 ? '?' : '') + s, fs: 15, mono: true, stroke: isNull ? BAD : stop ? GRID : INK, color: stop ? MUT : INK, fill: isNull ? BADBG : PANEL, s: pop(u, 0.2 + i * 0.15) });
      if (isNull) mono(x, 210, 'null', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      if (i > 0) grow(x - 190 + 82, 160, x - 82, 160, stop ? 0.5 : 1, stop ? GRID : MUT, { dash: stop ? '5 5' : null, plain: stop }); });
    if (k === 3) { sub(560, 240, '평가 안 함', fade(u, 1.2), { 'font-size': 14.5, 'font-weight': 700 });
      dot([[110, 190], [300, 190], [300, 300], [480, 300]], seg(u, 1.2, 2.2), BAD, 8);
      card(560, 300, 170, 46, { rx: 8, stroke: BAD, sw: 2, text: 'city = null', fs: 15, mono: true, s: pop(u, 2.0) });
      sub(560, 360, 'NullReferenceException 대신 null 을 돌려준다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { dot([[110, 190], [110, 300], [400, 300]], seg(u, 0.9, 1.8), BAD, 8);
      card(520, 300, 230, 50, { rx: 25, stroke: GOOD, sw: 2.4, text: '?? "게스트"', fs: 16, mono: true, s: pop(u, 0.8) });
      card(800, 300, 200, 50, { rx: 8, stroke: ACC, sw: 2.4, text: 'display = "게스트"', fs: 14.5, mono: true, s: pop(u, 1.9) });
      grow(636, 300, 698, 300, seg(u, 1.7, 1.9), ACC);
      sub(480, 380, 'user 가 null 이든 Name 이 null 이든 한 줄로 막는다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    card(420, 300, 220, 60, { rx: 10, stroke: WARN, sw: 2.4, s: pop(u, 1.0) });
    mono(330, 296, '결과 타입', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1) });
    mono(330, 320, 'int', { 'font-size': 18, 'font-weight': 800, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.2) });
    mono(400, 320, '→ int?', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
    sub(720, 300, 'null 이 나올 수 있으니', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); sub(720, 324, '?? 나 HasValue 로 풀어 쓴다', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
  }

  // ================= 장면 4. 메서드 해부 =================
  const SEG = [['public', '접근 제한자', MUT], ['int', '반환형', WARN], ['Fetch', '이름', INFO], ['(string url,', '필수 매개변수', INFO], ['int retries = 3)', '기본값 매개변수', GOOD]];
  function signature(n, u, k, o) { o = o || {}; let x = 60; const y = 80;
    SEG.forEach(([s, role, col], i) => { const w = tw(s, 19) + 10; if (i >= n) { x += w + 8; return; }
      const sc = o.pop && o.pop[i] != null ? o.pop[i] : 1;
      mono(x, y, s, { 'font-size': 19, 'font-weight': 800, fill: col === MUT ? INK : col, opacity: sc });
      el('rect', { x, y: y + 10, width: (w - 6) * sc, height: 5, rx: 2, fill: col });
      tx(x, y + 36, role, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: sc });
      if (i === 1) tx(x, y + 56, '시그니처 아님', { 'font-size': 13.5, fill: BAD, opacity: sc });
      x += w + 8; }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 3) { // 식 본문
      cs(60, 80, 'public int Square(int x) => x * x;', { fs: 20 });
      el('rect', { x: 60 + tw('public int Square(int x) ', 20), y: 92, width: tw('=> x * x;', 20) * E(u, 0.3, 0.9), height: 5, rx: 2, fill: GOOD });
      tx(410, 128, '식 본문: 중괄호와 return 생략', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
      card(300, 230, 360, 54, { rx: 10, stroke: INFO, sw: 2.4, s: pop(u, 1.2) }); mono(300, 236, '시그니처 = Square(int)', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      cs(60, 330, 'public string Greet(string n) => $"Hi, {n}!";', { fs: 16, op: fade(u, 1.8) });
      sub(480, 390, '몸통 모양은 시그니처와 상관없다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    signature(k === 0 ? 3 : 5, u, k, { pop: k === 0 ? [pop(u, 0.2), pop(u, 0.6), pop(u, 1.0)] : k === 1 ? [1, 1, 1, pop(u, 0.2), pop(u, 0.6)] : null });
    if (k === 0) { sub(480, 260, '반환형만 다른 두 메서드는 구분할 수 없다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k !== 5) { card(480, 190, 380, 50, { rx: 10, stroke: INFO, sw: 2.4, s: k === 1 ? pop(u, 1.3) : 1 });
    mono(480, 196, '시그니처 = Fetch(string, int)', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.4) : 1 }); }
    if (k === 1) { sub(480, 260, '이름 + 매개변수 타입 목록', fade(u, 1.7), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 290, '기본값 매개변수는 필수 매개변수 뒤에만 온다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { const L = ['{', '    for (int i = 0; i <= retries; i++)', '        if (TryGet(url, out var code)) return code;', '    return -1;', '}'];
      el('rect', { x: 50, y: 230, width: 620, height: 150, rx: 8, fill: SOFT, stroke: GRID, opacity: fade(u, 0.2) });
      L.forEach((l, i) => cs(66, 256 + i * 26, l, { fs: 14.5, shown: seg(u, 0.3 + i * 0.2, 0.7 + i * 0.2) }));
      sub(810, 280, '몸통을 바꿔도', fade(u, 1.6), { 'font-size': 15, fill: INK }); sub(810, 306, '호출하는 쪽은 그대로', fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      sub(810, 336, '(첫 시도 + 재시도 retries 번)', fade(u, 2.1), { 'font-size': 13.5 }); return; }
    if (k === 4) { // 기본값은 호출부에 박힌다
      const C2 = [['Fetch("u")', '3', '기본값이 호출부에 박힘'], ['Fetch("u", 5)', '5', '위치 인자']];
      C2.forEach(([a, v, note], i) => { const y = 270 + i * 66;
        cs(60, y, a, { fs: 17, op: fade(u, 0.2 + i * 0.6) });
        grow(230, y - 6, 330, y - 6, seg(u, 0.5 + i * 0.6, 0.8 + i * 0.6), MUT);
        card(420, y - 6, 160, 44, { rx: 8, stroke: GOOD, sw: 2, s: pop(u, 0.8 + i * 0.6) }); mono(350, y, 'retries =', { 'font-size': 14.5, opacity: fade(u, 0.9 + i * 0.6) }); mono(480, y, v, { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.9 + i * 0.6) });
        sub(660, y - 2, note, fade(u, 1.0 + i * 0.6), { 'font-size': 14, 'text-anchor': 'start' }); });
      return; }
    if (k === 5) { cs(60, 290, 'Fetch(retries: 5, url: "u");', { fs: 18 });
      // 이름으로 짝짓기: 교차선
      const P = [[455, 106], [640, 106]], A = [[150, 270], [300, 270]];
      grow(A[0][0], A[0][1], P[1][0], P[1][1] + 30, seg(u, 0.5, 1.1), GOOD); grow(A[1][0], A[1][1], P[0][0], P[0][1] + 30, seg(u, 0.7, 1.3), GOOD);
      sub(480, 350, '이름을 붙이면 순서가 자유롭고, 호출부만 봐도 뜻이 보인다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k6 반환형만 다름
    ['int  Fetch(string url) { … }', 'long Fetch(string url) { … }'].forEach((l, i) => { const y = 270 + i * 50; cs(80, y, l, { fs: 17, op: fade(u, 0.2 + i * 0.4) }); });
    if (u > 1.0) { cross(470, 290, 14, pop(u, 1.0)); pill(660, 290, 'CS0111', BAD, pop(u, 1.2), { fs: 15, mono: true }); }
    sub(480, 380, '둘 다 Fetch(string): 시그니처가 같아 같은 메서드로 취급된다', fade(u, 1.6), { 'font-size': 14.5, fill: INK });
  }

  // ================= 장면 5. ref · out · in · params =================
  function sideBoxes(callT, calleeT) { zone(30, 40, 360, 365, callT, { fill: SOFT }); zone(570, 40, 360, 365, calleeT, { fill: SOFT }); }
  function vbox(x, y, name, v, o) { o = o || {}; card(x + 80, y, 160, 46, { rx: 8, stroke: o.col || INK, sw: 2, fill: o.fill, s: o.s });
    mono(x + 12, y + 6, name, { 'font-size': 15, 'font-weight': 700, opacity: o.s ?? 1 }); if (v != null) mono(x + 148, y + 6, String(v), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: o.vcol || INK, opacity: o.s ?? 1 }); }
  function wire(x1, y1, x2, y2, u, col, label, both) { grow(x1, y1, x2, y2, u, col, { sw: 3 }); if (both && u >= 1) grow(x2, y2 + 12, x1, y1 + 12, 1, col, { sw: 2, dash: '5 4' });
    if (label && u > 0.5) pill((x1 + x2) / 2, Math.min(y1, y2) - 22, label, col, 1, { fs: 14, mono: true }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { sideBoxes('호출하는 쪽', 'Increment(ref int x)');
      const v = u < 1.6 ? 10 : 11; vbox(70, 140, 'n', v, { col: ACC, fill: u > 1.6 ? ACCBG : PANEL });
      vbox(610, 140, 'x', null, { col: ACC, s: pop(u, 0.2) }); mono(758, 146, '= n 자리', { 'font-size': 14, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.8) });
      wire(330, 140, 606, 140, E(u, 0.3, 0.9), ACC, 'ref', true);
      if (u > 1.0 && u < 1.6) mono(690, 210, 'x++', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      sub(480, 300, '메서드 안의 x++ 가 호출부 n 을 10 → 11 로 바꾼다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 330, '호출 전 초기화 필요 · 호출부에도 ref 를 적는다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 1) { sideBoxes('호출하는 쪽', 'TryParse(string s, out int result)');
      vbox(70, 120, '"42"', null, { col: INK }); vbox(70, 220, 'value', u < 1.4 ? '?' : 42, { col: GOOD, vcol: u < 1.4 ? MUT : GOOD, fill: u > 1.4 ? GOODBG : PANEL });
      vbox(610, 120, 's', '"42"', { s: pop(u, 0.2) }); vbox(610, 220, 'result', null, { col: GOOD, s: pop(u, 0.3) });
      wire(330, 120, 606, 120, E(u, 0.3, 0.8), MUT, '값 복사');
      grow(606, 236, 330, 236, E(u, 0.9, 1.4), GOOD, { sw: 3 }); if (u > 1.1) pill(468, 268, 'out', GOOD, 1, { fs: 14, mono: true });
      pill(480, 330, 'ok = true · value = 42', GOOD, pop(u, 1.8), { fs: 15, mono: true });
      sub(480, 380, '넘기기 전 초기화는 필요 없지만 메서드는 반드시 대입한다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 2) { sideBoxes('호출하는 쪽', 'Dist(in Vector3 a, in Vector3 b)');
      ['a', 'b'].forEach((n, i) => { const y = 130 + i * 100;
        card(150, y, 220, 56, { rx: 8, stroke: INFO, sw: 2 }); mono(56, y + 6, n, { 'font-size': 16, 'font-weight': 800 });
        cells(90, y - 16, ['X', 'Y', 'Z'], { w: 46, h: 32, gap: 4, style: () => ({ stroke: INFO, fill: INFOBG }) });
        vbox(610, y, 'in ' + n, null, { col: INFO, s: pop(u, 0.3 + i * 0.3) });
        grow(606, y, 264, y, E(u, 0.5 + i * 0.3, 1.0 + i * 0.3), INFO, { sw: 3 }); lock(790, y, true, INFO, pop(u, 1.0 + i * 0.3)); });
      sub(480, 350, '복사하지 않고 원본을 읽는다. 안에서 수정은 막힌다', fade(u, 1.7), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 380, 'int 처럼 작은 값에는 오히려 손해', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3 || k === 4) { sideBoxes('호출하는 쪽', 'Sum(params int[] nums)');
      if (k === 3) { cs(60, 110, 'Sum(1, 2, 3);', { fs: 17 });
        [1, 2, 3].forEach((v, i) => fly(90 + i * 40, 150, 680 + i * 60, 170, seg(u, 0.4 + i * 0.2, 1.2 + i * 0.2), String(v), { fill: INFO, mono: true }));
        if (u > 1.5) { cells(650, 150, [1, 2, 3], { w: 52, h: 40, style: () => ({ stroke: INFO, fill: INFOBG, s: pop(u, 1.5) }) }); mono(650, 140, 'int[3]', { 'font-size': 14, fill: INFO, 'font-weight': 700 }); }
        pill(750, 260, '결과 6', GOOD, pop(u, 2.0), { fs: 15 });
        sub(480, 350, '나열한 인자를 배열 하나로 묶는다. 맨 끝에 하나만 올 수 있다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
      // k4: 할당 비교
      cs(60, 100, 'Sum(1, 2, 3);  Sum(1, 2, 3);  Sum(1, 2, 3);', { fs: 14.5 });
      for (let i = 0; i < 3; i++) { const s = pop(u, 0.3 + i * 0.35); cells(600 + i * 6, 90 + i * 40, [1, 2, 3], { w: 40, h: 30, gap: 3, style: () => ({ stroke: WARN, fill: WARNBG, s }) }); }
      mono(780, 140, '호출마다 새 배열', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      cs(60, 250, 'Sum();  Sum();  Sum();', { fs: 14.5, op: fade(u, 1.2) });
      card(680, 270, 90, 36, { rx: 6, text: 'int[0]', fs: 14, mono: true, stroke: GOOD, s: pop(u, 1.4) });
      [0, 1, 2].forEach((i) => grow(220 + i * 70, 262, 632, 270, seg(u, 1.6 + i * 0.15, 1.9 + i * 0.15), GOOD, { sw: 1.8 }));
      mono(740, 320, 'Array.Empty 재사용', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(480, 385, '직접 재 보니 Sum() 1,000번 = 0바이트. 인자가 있으면 매번 할당된다', fade(u, 2.3), { 'font-size': 14, fill: INK }); return; }
    // k5 튜플
    cs(50, 70, 'Configure("db", ref timeout, out ok, "-v", "-x");', { fs: 15 });
    [['"db"', 'string name', MUT], ['ref timeout', 'ref int timeout', ACC], ['out ok', 'out bool ok', GOOD], ['"-v", "-x"', 'params string[] flags', INFO]].forEach(([a, b, col], i) => { const y = 110 + i * 34, s = fade(u, 0.2 + i * 0.2);
      mono(60, y + 5, a, { 'font-size': 14, opacity: s }); grow(190, y, 300, y, s, col); mono(310, y + 5, b, { 'font-size': 14, fill: col, opacity: s }); });
    el('line', { x1: 40, y1: 260, x2: 920, y2: 260, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '6 6', opacity: fade(u, 1.0) });
    cs(50, 300, '(bool ok, int code) Try() => (true, 200);', { fs: 15, op: fade(u, 1.2) });
    cs(50, 340, 'var (success, status) = Try();', { fs: 15, op: fade(u, 1.5) });
    card(760, 320, 180, 54, { rx: 10, stroke: GOOD, sw: 2.4, s: pop(u, 1.8), text: '(true, 200)', fs: 16, mono: true });
    sub(760, 380, '여러 값은 묶어서 돌려준다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
  }

  // ================= 장면 6. 오버로딩 =================
  const CAND = ['Print(int x)', 'Print(double x)', 'Print(string x)', 'Print(object x)'];
  // 호출별 판정: [가능 여부·이유] 4개 + 고른 번호
  const CASES = {
    1: { call: 'Print(5)', arg: 'int', r: [['정확히 일치', 1], ['int → double', 1], ['변환 없음', 0], ['박싱', 1]], pick: 0 },
    2: { call: 'Print(5.0)', arg: 'double', r: [['줄이는 변환 ✗', 0], ['정확히 일치', 1], ['변환 없음', 0], ['박싱', 1]], pick: 1 },
    3: { call: 'Print("hi")', arg: 'string', r: [['변환 없음', 0], ['변환 없음', 0], ['정확히 일치', 1], ['더 넓은 타입', 1]], pick: 2 },
    4: { call: 'Print(5L)', arg: 'long', r: [['줄이는 변환 ✗', 0], ['long → double', 1], ['변환 없음', 0], ['박싱', 1]], pick: 1 },
  };
  function s6(t, c) { const { k, u } = c;
    if (k <= 4) {
      CAND.forEach((s, i) => { const y = 80 + i * 76, cs0 = k >= 1 ? CASES[k] : null, ok = cs0 ? cs0.r[i][1] : null, hit = cs0 && cs0.pick === i && u > 1.9;
        const sc = k === 0 ? pop(u, 0.2 + i * 0.3) : 1;
        card(640, y, 260, 52, { rx: 10, stroke: hit ? GOOD : ok === 0 && u > 0.9 ? GRID : INK, sw: hit ? 3 : 2, fill: hit ? GOODBG : PANEL, text: s, fs: 16, mono: true, color: ok === 0 && u > 0.9 ? MUT : INK, s: sc });
        if (cs0) { const sh = fade(u, 0.5 + i * 0.25); tx(490, y + 5, cs0.r[i][0], { 'font-size': 14, 'text-anchor': 'end', fill: ok ? INK : MUT, opacity: sh });
          if (u > 0.6 + i * 0.25) (ok ? check : cross)(800, y, 9, 1); } });
      if (k === 0) { sub(300, 200, '이름이 같고 매개변수 타입이 다르면', fade(u, 1.4), { 'font-size': 15, fill: INK }); sub(300, 228, '함께 후보 목록에 오른다', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
      const cs0 = CASES[k]; token(140, 80, cs0.call, INK, pop(u, 0.1)); sub(140, 122, '인자 타입: ' + cs0.arg, fade(u, 0.3), { 'font-size': 14.5, fill: INFO, 'font-weight': 700 });
      dot([[220, 80], [400, 80 + cs0.pick * 76], [508, 80 + cs0.pick * 76]], seg(u, 1.5, 2.0), GOOD, 8);
      const why = { 1: '정확히 맞는 후보가 이긴다', 2: '5.0 은 double 리터럴', 3: 'string 이 object 보다 구체적이라 이긴다', 4: 'int 로는 못 줄인다. double 이 object 보다 구체적' }[k];
      sub(250, 380, why, fade(u, 2.1), { 'font-size': 15, fill: GOOD, 'font-weight': 800 });
      out(40, 260, 360, [{ 1: 'int: 5', 2: 'double: 5', 3: 'str: hi', 4: 'double: 5' }[k]], seg(u, 2.2, 2.5)); return; }
    if (k === 5) { token(140, 90, 'Log(null)', INK);
      ['Log(string s)', 'Log(int[] a)'].forEach((s, i) => { const y = 120 + i * 90; card(640, y, 260, 52, { rx: 10, stroke: WARN, sw: 2.4, text: s, fs: 16, mono: true, s: pop(u, 0.2 + i * 0.2) });
        if (u > 0.8) check(800, y, 9, 1); grow(220, 90, 506, y, seg(u, 0.6 + i * 0.2, 1.0 + i * 0.2), WARN); });
      card(480, 300, 200, 40, { rx: 20, stroke: BAD, sw: 2.4, text: '우열 없음', fs: 15, s: pop(u, 1.3) });
      pill(480, 350, 'CS0121 모호한 호출', BAD, pop(u, 1.6), { fs: 15 });
      cs(60, 300, 'Log((string)null);', { fs: 16, op: fade(u, 2.0) }); sub(160, 340, '캐스트로 의도를 못박는다', fade(u, 2.2), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 6) { ['int  Print(int x)', 'long Print(int x)'].forEach((s, i) => cs(160, 120 + i * 50, s, { fs: 18, op: fade(u, 0.2 + i * 0.3) }));
      cross(560, 140, 14, pop(u, 0.9)); pill(720, 140, 'CS0111', BAD, pop(u, 1.1), { fs: 15, mono: true });
      sub(480, 260, '반환형은 시그니처가 아니라 후보 목록에 함께 오를 수도 없다', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 300, '하는 일이 다르면 오버로딩 말고 이름을 나눈다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    // k7 결과 정리
    const rows = [['Print(5)', 'Print(int)', GOOD], ['Print(5.0)', 'Print(double)', GOOD], ['Print("hi")', 'Print(string)', GOOD], ['Print(5L)', 'Print(double)', WARN], ['Log(null)', 'CS0121', BAD]];
    rows.forEach(([a, b, col], i) => { const y = 70 + i * 60, s = fade(u, 0.2 + i * 0.25);
      mono(200, y, a, { 'font-size': 17, opacity: s }); grow(360, y - 6, 520, y - 6, s, MUT); mono(540, y, b, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: s }); });
    sub(480, 390, '가장 구체적인 후보가 이기고, 동률이면 모호하다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
  }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'switch 식 code switch { 200 => "OK", 404 => "Not Found", >= 500 => "Server Error", _ => "Unknown" }에 404를 넣으면 무엇이 되는가?',
      o: ['"Not Found"를 콘솔에 출력하고 끝난다', '"Not Found"라는 값을 돌려준다', '"Unknown"을 돌려준다'], a: 1,
      why: 'switch 식은 문이 아니라 식이다. 위에서부터 맞춰 보다 404 팔에서 멈추고 그 값을 돌려주므로 변수에 담거나 return할 수 있다.' },
    { q: 'foreach로 users를 돌면서 users.Remove(u)를 부르면 어떻게 되는가?',
      o: ['InvalidOperationException이 난다', '그 원소만 빠지고 계속 돈다', '컴파일 에러가 난다'], a: 0,
      why: '순회 중에 컬렉션이 바뀌면 열거자가 다음 원소로 넘어가려는 순간 예외를 던진다. 지울 목록을 ToList()로 먼저 떠 두고 그 목록으로 지운다.' },
    { q: 'cache ??= LoadFromDb(); 를 두 번 실행하면 LoadFromDb()는 몇 번 불리는가?',
      o: ['2번', '0번', '1번'], a: 2,
      why: '??=는 왼쪽이 null일 때만 오른쪽을 실행해 대입한다. 첫 호출에서 cache가 채워지므로 두 번째에는 부르지도 않는다.' },
    { q: 'int Fetch(string url)와 long Fetch(string url)를 한 클래스에 둘 수 없는 이유는 무엇인가?',
      o: ['반환형은 시그니처에 들어가지 않아 두 메서드의 시그니처가 같아서', 'long이 int보다 커서', '메서드 이름이 너무 짧아서'], a: 0,
      why: '시그니처는 이름과 매개변수 타입 목록이다. 둘 다 Fetch(string)이라 컴파일러가 CS0111로 막는다.' },
    { q: 'Sum(params int[] nums)를 Sum()처럼 인자 없이 부르면 무슨 일이 생기는가?',
      o: ['컴파일 에러가 난다', '길이 0 배열이 들어가고, 컴파일러가 Array.Empty를 재사용해 새 할당이 없다', 'nums에 null이 들어간다'], a: 1,
      why: '직접 재 보니 Sum()을 1,000번 불러도 할당은 0바이트였다. 반면 Sum(1, 2, 3)은 부를 때마다 새 배열이 생긴다.' },
    { q: 'Print(int), Print(double), Print(string), Print(object)가 있을 때 Print(5L)은 어느 후보로 가는가?',
      o: ['Print(object)', 'Print(int)', 'Print(double)'], a: 2,
      why: 'long은 int로 줄일 수 없어 탈락한다. double과 object 둘 다 가능하지만 double이 더 구체적이라 이긴다. 실행하면 double: 5가 찍힌다.' },
  ];

  const summary = [
    'if와 switch 문은 실행할 코드를 고르고, switch 식은 패턴에 맞는 값 하나를 돌려준다.',
    'foreach로 도는 컬렉션을 그 자리에서 지우면 예외가 나니 지울 목록을 먼저 떠 둔다.',
    '?.와 ??를 엮으면 중간에 null이 나와도 한 줄로 기본값을 채울 수 있다.',
    '시그니처는 이름과 매개변수 타입이고, 오버로딩은 가장 구체적인 후보가 이긴다.',
  ];
  const review = [
    { q: '라이브러리의 Fetch(string url, int retries = 3) 기본값을 5로 바꿔 배포했는데, 다시 빌드하지 않은 앱은 여전히 3번 재시도한다. 이유는?',
      o: ['기본값은 컴파일할 때 호출부에 박혀 있어서', '런타임이 옛 라이브러리를 캐시해서', 'retries가 ref가 아니라서'], a: 0,
      why: '기본값은 호출하는 쪽 IL에 상수로 들어간다. 그래서 공개 API의 기본값을 바꾸는 것은 호출자를 다시 빌드해야 하는 변경이다.' },
    { q: 'HTTP 상태 코드를 문자열로 바꾸는 함수를 만들려 한다. 빠진 경우를 컴파일러가 잡아 주길 원하면 무엇을 쓰나?',
      o: ['if/else를 여러 줄 쓴다', '_ 팔을 둔 switch 식으로 값을 돌려준다', 'switch 문에서 case마다 Console.WriteLine을 부른다'], a: 1,
      why: 'switch 식은 값을 돌려주고, 다루지 않은 입력이 있으면 CS8509 경고를 낸다. _ 팔로 나머지를 받아 누락을 막는다.' },
    { q: 'Log(string)와 Log(int[])가 있는 코드에서 Log(null)이 컴파일되지 않는다. 가장 알맞은 고침은?',
      o: ['Log((string)null)처럼 캐스트로 후보를 정한다', 'null 대신 0을 넘긴다', 'Log(int[])에 params를 붙인다'], a: 0,
      why: 'null은 두 후보 모두로 변환되고 우열이 없어 CS0121이 난다. 캐스트로 타입을 정해 주면 한 후보만 남는다.' },
  ];

  R.page({ title: '흐름과 호출을 따라가기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
