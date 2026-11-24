/* II-2-2 예외 처리 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 실행 위치가 try → catch → finally 로 건너뛰는 모습, 예외 타입 나무와 catch 순서, when 필터, 스택 추적, 예외 비용, 자원 해제 경로를 그린다.
 * 출력 문자열과 스택 추적, CS0160·CA2200, Parse+catch 와 TryParse 의 시간은 .NET 10 SDK 로 이 PC 에서 실제 실행해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, pill, grow, dot, zone, cross, check, terminal, clock, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const code = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 14.5, fill: INK, opacity: op ?? 1 }, a || {}));
  const ptr = (x, y, op) => el('path', { d: `M${x - 14},${y - 9} L${x},${y} L${x - 14},${y + 9} Z`, fill: ACC, opacity: op ?? 1 });
  function burst(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s); let d = '';
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 12 : 24; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1); }
    el('path', { d: d + 'Z', fill: col || BAD, opacity: 0.9 }, g); }
  // 예외 공: 이름이 적힌 알약
  const ball = (x, y, s, col, o) => card(x, y, tw(s, 13.5) + 26, 30, Object.assign({ rx: 15, text: s, fs: 13.5, fw: 700, fill: col || BAD, stroke: 'none', color: PANEL, mono: true }, o || {}));

  // ---------- 1. try / catch / finally / using — 실행 위치가 건너뛴다 ----------
  const BANDS = [['try', 40, 112, INFO], ['catch (IndexOutOfRangeException ex)', 166, 46, WARN], ['finally', 226, 46, GOOD], ['using (var file = File.OpenRead("data.bin"))', 300, 96, ACC]];
  function s1(t, c) { const { k, u } = c;
    BANDS.forEach(([h, y, hh, col], i) => { const on = (i === 0) || (i === 1 && k >= 2) || (i === 2 && k >= 3) || (i === 3 && k >= 4);
      el('rect', { x: 30, y, width: 480, height: hh, rx: 8, fill: on ? PANEL : SOFT, stroke: on ? col : GRID, 'stroke-width': 2, opacity: on ? 1 : 0.5 });
      code(46, y + 22, h, on ? 1 : 0.5, { 'font-weight': 800, fill: on ? col : MUT, 'font-size': 14 }); });
    code(60, 88, 'int[] data = { 1, 2, 3 };', 1, { 'font-size': 14 });
    code(60, 112, 'Console.WriteLine(data[10]);', 1, { 'font-size': 14, fill: k >= 1 ? BAD : INK });
    code(60, 136, '// 뒤 줄은 실행되지 않는다', k >= 1 ? fade(k === 1 ? u : 3, 1.6) : 0, { 'font-size': 14, fill: MUT });
    code(60, 210, 'Console.WriteLine($"잡음: {ex.Message}");', k >= 2 ? 1 : 0.4, { 'font-size': 13.5 });
    code(60, 268, 'Console.WriteLine("finally 는 무조건 실행");', k >= 3 ? 1 : 0.4, { 'font-size': 13.5 });
    code(60, 350, '// 파일 사용', k >= 4 ? 1 : 0.4, { 'font-size': 13.5, fill: MUT });
    code(46, 384, '}   → file.Dispose()', k >= 4 ? 1 : 0.4, { 'font-size': 14, fill: k === 5 ? GOOD : MUT, 'font-weight': 700 });
    // 실행 위치
    const PY = [83, 107, 205, 263, 322, 379], at = k === 0 ? 0 : k, prevY = k === 0 ? 70 : PY[k - 1], f = E(u, 0.2, 0.8);
    ptr(24, lerp(prevY, PY[at], f));
    if (k >= 1 && k <= 2) { const jump = k === 2 ? E(u, 0.1, 0.8) : 0; if (k === 2) el('path', { d: `M14,${PY[1]} C-10,${PY[1] + 40} -10,${PY[2] - 40} 14,${PY[2]}`, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: jump }); }
    // 배열 칸
    if (k <= 1) { code(560, 60, 'data', 1, { fill: MUT, 'font-weight': 700 });
      [1, 2, 3].forEach((v, i) => { card(600 + i * 56, 96, 50, 44, { rx: 4, text: String(v), fs: 16, mono: true, s: k === 0 ? pop(u, 0.6 + i * 0.2) : 1 }); mono(600 + i * 56, 136, `[${i}]`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      if (k === 1) { const f2 = E(u, 0.3, 1.0); dot([[600, 70], [880, 70]], f2 < 1 ? f2 : 0, BAD, 6);
        el('rect', { x: 855, y: 74, width: 50, height: 44, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.9) });
        mono(880, 136, '[10]', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); burst(880, 96, pop(u, 1.1), BAD);
        code(560, 190, 'IndexOutOfRangeException', fade(u, 1.3), { fill: BAD, 'font-weight': 800 });
        say(560, 220, '그 줄에서 실행이 끊기고 catch 를 찾는다', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); } }
    if (k >= 2) { const lines = ['잡음: Index was outside the bounds of the array.'];
      if (k >= 3) lines.push('finally 는 무조건 실행');
      terminal(540, 40, 400, 110, lines, k === 2 ? E(u, 0.8, 1.6) : k === 3 ? 1 + E(u, 0.8, 1.4) : 2, { title: 'dotnet run', fs: 13.5 }); }
    if (k === 3) { el('path', { d: 'M520,120 C560,160 560,220 520,250', fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.4) });
      say(560, 200, '예외가 없어도, return 이 있어도', fade(u, 1.6), { 'font-size': 14.5, fill: GOOD }); say(560, 224, 'finally 로 모인다', fade(u, 1.6), { 'font-size': 14.5, fill: GOOD }); }
    if (k >= 4) { const open = k === 4 ? fade(u, 0.6) : 1 - fade(u, 0.9);
      el('circle', { cx: 600, cy: 330, r: 18, fill: open > 0.5 ? WARN : GOOD, opacity: 0.9 });
      say(630, 326, open > 0.5 ? '파일 핸들 열림' : '파일 핸들 닫힘', 1, { 'font-size': 15, fill: open > 0.5 ? WARN : GOOD });
      tx(630, 350, open > 0.5 ? '닫는 코드는 쓰지 않았다' : '예외로 끝나도 똑같이 닫힌다', { 'font-size': 13.5, fill: MUT });
      if (k === 5) { code(560, 200, 'try { … }', fade(u, 1.4), { 'font-size': 14, fill: MUT }); code(560, 224, 'finally { file.Dispose(); }', fade(u, 1.6), { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
        tx(560, 176, 'using 은 이렇게 바뀐다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) }); } } }

  // ---------- 2. 예외 나무와 catch 순서 ----------
  const TN = { ex: [230, 56, 'Exception'], sys: [230, 126, 'SystemException'], arg: [130, 196, 'ArgumentException'], inv: [345, 196, 'InvalidOperationException'], anl: [130, 266, 'ArgumentNullException'] };
  const tnode = (key, s, hot) => { const [x, y, n] = TN[key]; card(x, y, tw(n, 13.5) + 26, 36, { rx: 8, text: n, fs: 13.5, mono: true, s, stroke: hot || INK, color: hot || INK, fill: hot ? PANEL : null }); };
  const tline = (a, b, u) => { const A = TN[a], B = TN[b]; grow(B[0], B[1] - 18, A[0], A[1] + 18, u, MUT); };
  function s2(t, c) { const { k, u } = c;
    const vis = { ex: 1, sys: k >= 1, arg: k >= 1, anl: k >= 1, inv: k >= 2 };
    if (vis.sys) { tline('ex', 'sys', k === 1 ? E(u, 0.2, 0.4) : 1); tline('sys', 'arg', k === 1 ? E(u, 0.4, 0.6) : 1); tline('arg', 'anl', k === 1 ? E(u, 0.6, 0.8) : 1); }
    if (vis.inv) tline('sys', 'inv', k === 2 ? E(u, 0.2, 0.4) : 1);
    tnode('ex', 1, k === 3 || k === 4 ? BAD : null);
    if (vis.sys) { tnode('sys', k === 1 ? pop(u, 0.3) : 1); tnode('arg', k === 1 ? pop(u, 0.5) : 1, k === 2 ? WARN : null); tnode('anl', k === 1 ? pop(u, 0.7) : 1, k === 1 ? ACC : null); }
    if (vis.inv) tnode('inv', k === 2 ? pop(u, 0.3) : 1, k === 3 ? INFO : null);
    tx(30, 330, '자식이 아래, 넓은 타입이 위', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    // catch 목록
    const order = k === 4 || k === 5 ? ['Exception', 'ArgumentNullException', 'ArgumentException'] : ['ArgumentNullException', 'ArgumentException', 'Exception'];
    const nC = k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : 3, CY = [130, 200, 270];
    card(770, 46, 200, 34, { rx: 6, text: 'ProcessOrder(order)', fs: 14, mono: true, stroke: GRID });
    for (let i = 0; i < nC; i++) { const fresh = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && i === 2), dead = (k === 4 || k === 5) && i > 0;
      card(770, CY[i], 300, 46, { rx: 8, text: `catch (${order[i]})`, fs: 14, mono: true, s: fresh ? pop(u, 0.2) : 1, stroke: dead ? OFF : INK, color: dead ? MUT : INK, fill: dead ? SOFT : null });
      if (dead) tx(612, CY[i] + 5, '도달 불가', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.2) }); }
    // 떨어지는 예외
    const B = [null, ['ArgumentNullException', 0, ACC], ['ArgumentException', 1, WARN], ['InvalidOperationException', 2, INFO], ['ArgumentNullException', 0, ACC]][k];
    if (k === 0) { const f = E(u, 0.4, 1.8); ball(770, lerp(80, 400, f), 'Exception ?', BAD, { op: 1 - fade(u, 1.8, 0.4) }); say(560, 400, 'catch 가 없으면 호출자에게 그대로 올라간다', fade(u, 1.9), { 'font-size': 14.5, fill: MUT }); }
    if (B) { const [n, stop, col] = B, f = E(u, 0.6, 1.4), y = lerp(80, CY[stop] - 4, f); ball(530, y, n.replace('Exception', 'Ex'), col);
      for (let i = 0; i < stop; i++) if (y > CY[i]) cross(585 + 200, CY[i] - 22, 7, 1);
      if (f >= 1) check(905, CY[stop], 8, pop(u, 1.5));
      const msg = [null, '필수 값 누락: ex.ParamName', '인자 오류: ex.Message', '로깅 후 throw;', '모든 예외가 여기서 걸린다'][k];
      say(560, 340, msg, fade(u, 1.8), { 'font-size': 14.5, fill: k === 4 ? BAD : col, 'font-family': k <= 3 ? 'monospace' : null }); }
    if (k === 5) { card(770, 370, 300, 44, { rx: 8, text: 'error CS0160 · 빌드 실패', fs: 15, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.4) });
      say(560, 340, '앞 catch 가 이미 상위 타입을 잡는다', fade(u, 1.2), { 'font-size': 14.5, fill: BAD }); } }

  // ---------- 3. when 필터 — 잡기 전에 평가 ----------
  const GT = [['when (StatusCode == 429)', 120], ['when ((int?)StatusCode >= 500)', 210], ['catch (Exception) when (Log(ex))', 300]];
  function frames(op, hot) { tx(40, 50, '호출 스택', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    ['SendAsync', 'CallApi', 'Main'].forEach((f, i) => card(140, 90 + i * 50, 200, 40, { rx: 6, text: f, fs: 14.5, mono: true, op, stroke: hot && i === 0 ? WARN : INK, color: hot && i === 0 ? WARN : INK })); }
  function gate(i, s, st) { const [lab, y] = GT[i]; card(660, y, 360, i < 2 ? 58 : 46, { rx: 8, text: (i < 2 ? 'catch (HttpRequestException)\n' : '') + lab, fs: 13.5, mono: true, s, stroke: st === true ? GOOD : st === false ? BAD : INK, color: INK });
    if (st != null) pill(880, y - 40, st ? 'true' : 'false', st ? GOOD : BAD, 1, { fs: 13.5, mono: true }); }
  function s3(t, c) { const { k, u } = c;
    frames(1, k === 1 || k === 3);
    if (k === 0) { ball(450, 120, 'HRE · 429', WARN, { s: pop(u, 0.4) }); ball(450, 200, 'HRE · 500', BAD, { s: pop(u, 0.8) });
      say(380, 280, '둘 다 HttpRequestException', fade(u, 1.4), { 'font-size': 14.5 }); say(380, 306, '타입만으로는 대응을 가를 수 없다', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); return; }
    const show = k >= 3 ? 2 : 1; for (let i = 0; i < show; i++) gate(i, (k === 1 && i === 0) || (k === 3 && i === 1) ? pop(u, 0.2) : 1, null);
    if (k >= 5) gate(2, pop(u, 0.2), u > 1.4 ? false : null);
    if (k === 1) { const f = E(u, 0.4, 1.2); ball(lerp(330, 430, f), lerp(90, 120, f), '429', WARN); if (f >= 1) pill(880, 80, 'true', GOOD, pop(u, 1.3), { fs: 13.5, mono: true });
      say(380, 300, '스택을 풀기 전에 조건부터 본다', fade(u, 1.8), { 'font-size': 14.5, fill: GOOD }); }
    if (k === 2) { clock(520, 320, 28, E(u, 0.3, 1.6), INFO, 'Task.Delay(backoff)');
      el('path', { d: 'M600,320 C700,380 800,320 760,280', fill: 'none', stroke: GOOD, 'stroke-width': 2.2, opacity: fade(u, 1.5) });
      code(680, 380, 'RetryAsync → 성공', fade(u, 1.9), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 3 || k === 4) { const f = E(u, 0.4, 1.0), g = E(u, 1.2, 1.8);
      if (k === 3) { ball(lerp(330, 430, f), lerp(90, 120, f) + g * 90, '500', BAD); if (f >= 1) pill(880, 80, 'false', BAD, 1, { fs: 13.5, mono: true }); if (g >= 1) pill(880, 170, 'true', GOOD, pop(u, 1.9), { fs: 13.5, mono: true });
        say(380, 300, '첫 catch 는 아예 잡지 않고 지나간다', fade(u, 2.0), { 'font-size': 14.5, fill: MUT }); }
      if (k === 4) { ball(430, 210, '500', BAD, { op: 1 - fade(u, 1.4) });
        terminal(380, 270, 300, 70, ['서버 오류 500'], E(u, 0.3, 0.8), { title: 'logger.LogError' });
        code(850, 300, 'throw;', fade(u, 1.0), { fill: BAD, 'font-weight': 800 }); grow(860, 280, 930, 40, E(u, 1.2, 1.8), BAD);
        say(380, 380, '로깅만 하고 원래 스택 그대로 위로', fade(u, 2.0), { 'font-size': 14.5, fill: MUT }); } }
    if (k === 5) { const f = E(u, 0.3, 1.0); ball(lerp(330, 410, f), lerp(90, 300, f), 'Exception', BAD, { op: 1 - fade(u, 2.2, 0.3) });
      terminal(380, 340, 260, 66, ['logged: …'], E(u, 1.0, 1.4), { title: 'Log(ex)' });
      code(680, 380, '본문은 실행 안 됨, 예외는 계속 위로', fade(u, 1.8), { fill: MUT, 'font-size': 13.5 }); } }

  // ---------- 4. throw; vs throw ex; — 스택 추적 ----------
  const FR = [['Repo.Load()', 120], ['Service.Get()', 200], ['Controller.Handle()', 280]];
  function trace(x, y, lines, o) { o = o || {}; el('rect', { x, y, width: 430, height: 40 + lines.length * 26, rx: 8, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    code(x + 14, y + 24, o.title || 'ex.StackTrace', o.op ?? 1, { 'font-weight': 800, fill: o.col || INK, 'font-size': 14 });
    lines.forEach(([s, st], i) => code(x + 24, y + 52 + i * 26, s, (o.op ?? 1) * (st && st.op != null ? st.op : 1), Object.assign({ 'font-size': 14 }, st || {}))); }
  function s4(t, c) { const { k, u } = c;
    tx(40, 60, '호출 스택 (위가 깊은 쪽)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    FR.forEach(([n, y], i) => { const hot = (k === 0 && i === 0) || (k === 1 && i === 1);
      card(170, y, 240, 46, { rx: 6, text: n, fs: 15, mono: true, stroke: hot ? BAD : INK, color: hot ? BAD : INK, op: k >= 1 && i === 0 ? 0.45 : 1 }); });
    if (k === 0) { burst(300, 120, pop(u, 0.4), BAD); trace(490, 90, [['at Repo.Load()  ← 처음 터진 곳', { fill: BAD, 'font-weight': 700 }]], { op: fade(u, 0.9) });
      say(490, 210, '스택 추적은 예외가 지나온 줄을 적는다', fade(u, 1.6), { 'font-size': 14.5, fill: MUT }); return; }
    if (k === 1) { dot([[300, 140], [300, 180]], seg(u, 0.2, 0.7), BAD, 7);
      trace(490, 90, [['at Repo.Load()', { fill: BAD }], ['at Service.Get()', { op: fade(u, 0.8) }]]);
      terminal(490, 250, 430, 70, ['DB 조회 실패 id=…  (예외 객체째 기록)'], E(u, 1.2, 1.8), { title: 'logger.LogError(ex, …)', fs: 13.5 }); return; }
    const full = [['at Repo.Load()', { fill: GOOD, 'font-weight': 700 }], ['at Service.Get()'], ['at Controller.Handle()'], ['at Program.<Main>$']];
    if (k === 2 || k === 5) { if (k === 2) dot([[300, 220], [300, 260]], seg(u, 0.2, 0.7), INFO, 7);
      code(490, 60, k === 2 ? 'throw;' : '최종 로그', k === 2 ? fade(u, 0.1) : fade(u, 0.1), { 'font-weight': 800, fill: GOOD });
      trace(490, 80, full.map((l, i) => [l[0], Object.assign({}, l[1] || {}, { op: k === 2 ? fade(u, 0.6 + i * 0.3) : 1 })]), { col: GOOD });
      if (k === 5) { el('rect', { x: 504, y: 117, width: 300, height: 26, rx: 5, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, opacity: fade(u, 0.6) });
        say(490, 260, '첫 줄이 장애 분석의 출발점', fade(u, 1.2), { 'font-size': 14.5, fill: GOOD }); }
      else say(490, 260, '최초 발생 지점이 그대로 남는다', fade(u, 2.0), { 'font-size': 14.5, fill: GOOD }); return; }
    if (k === 3) { code(490, 60, 'throw ex;', fade(u, 0.1), { 'font-weight': 800, fill: BAD });
      const r = E(u, 0.6, 1.3);
      trace(490, 80, [['at Repo.Load()', { fill: BAD, 'text-decoration': 'line-through', op: 1 - r * 0.7 }], ['at Service.Get()  ← 여기가 시작?', { fill: BAD, 'font-weight': 700, op: fade(u, 1.2) }], ['at Controller.Handle()', { op: fade(u, 1.4) }], ['at Program.<Main>$', { op: fade(u, 1.5) }]], { col: BAD });
      pill(600, 270, '분석기 경고 CA2200', WARN, pop(u, 1.9), { fs: 13.5 });
      say(490, 320, '스택이 이 줄에서 다시 시작된다', fade(u, 2.1), { 'font-size': 14.5, fill: BAD }); return; }
    // k4: 감싸서 올리기
    el('rect', { x: 470, y: 80, width: 460, height: 230, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.4, opacity: fade(u, 0.2) });
    code(486, 106, 'DataAccessException', fade(u, 0.3), { 'font-weight': 800, fill: INFO });
    code(486, 132, '"주문 {id} 로드 실패"', fade(u, 0.5), { 'font-size': 14 });
    el('rect', { x: 490, y: 150, width: 420, height: 140, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.8, opacity: fade(u, 0.9) });
    code(504, 174, 'InnerException: 원래 예외', fade(u, 1.0), { 'font-weight': 700, 'font-size': 14 });
    code(514, 202, 'at Repo.Load()', fade(u, 1.3), { fill: GOOD, 'font-weight': 700, 'font-size': 14 });
    code(514, 228, 'at Service.Get()', fade(u, 1.5), { 'font-size': 14 });
    say(470, 350, '바깥은 도메인 예외, 원본 스택은 안쪽에 보관', fade(u, 2.0), { 'font-size': 14.5, fill: INFO }); }

  // ---------- 5. 커스텀 예외 · 예외의 비용 ----------
  const COST = { ex: 280, tp: 3 };   // 이 PC 측정(ms): 잘못된 입력 100,000번, .NET 10 Release 세 번 실행 276.5~297.5 / 2.93~3.03
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) { // 나무에 새 잎
      card(170, 70, 130, 38, { rx: 8, text: 'Exception', fs: 14, mono: true });
      grow(170, 192, 170, 90, k === 0 ? E(u, 0.3, 0.8) : 1, MUT);
      card(170, 210, 300, 40, { rx: 8, text: 'InsufficientBalanceException', fs: 14, mono: true, stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.7) : 1 });
      if (k === 0) say(30, 290, '이름이 …Exception 으로 끝나고, 타입 자체가 뜻을 말한다', fade(u, 1.6), { 'font-size': 14.5, fill: MUT });
      if (k >= 1) { const rows = [['Message', k >= 3 ? '"잔액이 3000원 부족합니다"' : k === 2 ? '"잔액이 {shortfall}원 부족합니다"' : ''], ['Shortfall', k >= 3 ? '3000' : 'decimal'], ['InnerException', k >= 2 ? 'inner (null 가능)' : ''], ['StackTrace', '']];
        tx(360, 40, '예외 객체의 칸', { 'font-size': 14, 'font-weight': 700, fill: MUT });
        rows.forEach(([n, v], i) => { const y = 54 + i * 44, hot = (k === 1 && i === 1) || (k === 2 && (i === 0 || i === 2)) || (k === 3 && i < 2);
          el('rect', { x: 360, y, width: 570, height: 40, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : INK, 'stroke-width': 1.8, opacity: k === 1 && i === 1 ? fade(u, 0.3) : 1 });
          code(374, y + 26, n, 1, { fill: MUT, 'font-size': 14 }); code(530, y + 26, v, k === 3 ? fade(u, 0.8 + i * 0.3) : 1, { 'font-weight': 700, fill: hot ? ACC : INK, 'font-size': 14 }); }); }
      if (k === 2) { code(30, 290, 'InsufficientBalanceException(', fade(u, 0.2), { 'font-size': 14 }); code(50, 314, 'decimal shortfall, Exception? inner = null)', fade(u, 0.3), { 'font-size': 14 });
        code(50, 338, ': base($"잔액이 {shortfall}원 부족합니다", inner)', fade(u, 0.6), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
        grow(470, 330, 520, 88, E(u, 1.0, 1.5), ACC); grow(500, 330, 560, 176, E(u, 1.3, 1.8), ACC); }
      if (k === 3) { code(30, 290, 'throw new InsufficientBalanceException(3000);', fade(u, 0.2), { 'font-size': 14 });
        code(30, 330, 'catch (InsufficientBalanceException ex)', fade(u, 1.4), { 'font-size': 14 }); code(50, 356, '→ ex.Shortfall = 3000', fade(u, 1.8), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
        tx(30, 400, '3000 은 예시 값', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); }
      return; }
    // k4, k5: 비용 막대
    tx(40, 52, '잘못된 입력 "abc" 를 100,000번 파싱 (이 PC, .NET 10 Release)', { 'font-size': 15, 'font-weight': 700 });
    const a = k === 4 ? E(u, 0.3, 1.8) : 1;
    code(40, 132, 'int.Parse + catch', 1, { 'font-weight': 700, fill: BAD });
    hbar(260, 116, 560, COST.ex * a, 300, { col: BAD, h: 26, text: '약 ' + Math.round(COST.ex * a) + 'ms' });
    if (k === 4) { say(40, 220, '예외 한 번마다 스택 추적을 모은다', fade(u, 2.0), { 'font-size': 14.5, fill: MUT }); say(40, 246, '한 번에 약 2.8µs, 정상 경로의 수십 배', fade(u, 2.2), { 'font-size': 14.5, fill: MUT }); }
    if (k === 5) { const b = E(u, 0.3, 1.0); code(40, 202, 'int.TryParse', 1, { 'font-weight': 700, fill: GOOD });
      hbar(260, 186, 560, COST.tp * b, 300, { col: GOOD, h: 26, text: '약 ' + Math.round(COST.tp * b) + 'ms' });
      card(480, 300, 420, 60, { rx: 10, text: '자주 나는 실패는 bool 로 답한다', fs: 16, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
      tx(40, 400, '측정값은 PC 마다 다르다. 세 번 실행해 276~298ms / 2.9~3.0ms', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); } }

  // ---------- 6. 견고한 에러 전략 — 모든 길이 DisposeAsync 를 지난다 ----------
  function s6(t, c) { const { k, u } = c;
    // conn 수명 막대
    const life = k === 0 ? E(u, 0.3, 1.3) : 1;
    el('rect', { x: 40, y: 60, width: 16, height: 300 * life, rx: 6, fill: WARN, opacity: 0.8 });
    code(70, 52, 'await using var conn', 1, { 'font-weight': 800, 'font-size': 14 });
    const closed = k === 4 && u > 1.6;
    card(160, 380, 220, 40, { rx: 20, text: closed ? 'DisposeAsync ✓ 닫힘' : 'DisposeAsync', fs: 14, mono: true, stroke: closed ? GOOD : WARN, color: closed ? GOOD : WARN, s: k === 0 ? pop(u, 1.4) : 1 });
    if (k === 0) { say(300, 200, '메서드를 어떻게 빠져나가든', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); say(300, 224, '이 문을 지난다', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); }
    if (k >= 1) { el('rect', { x: 90, y: 90, width: 300, height: 110, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k === 1 ? fade(u, 0.3) : 1 });
      code(100, 110, 'try', 1, { fill: INFO, 'font-weight': 800, 'font-size': 14 });
      card(240, 136, 220, 36, { rx: 6, text: 'conn.OpenAsync()', fs: 14, mono: true, s: k === 1 ? pop(u, 0.6) : 1 });
      card(240, 178, 220, 36, { rx: 6, text: 'FetchAsync(conn, id)', fs: 14, mono: true, s: k === 1 ? pop(u, 0.8) : 1 });
      if (k === 1) say(420, 150, '실패할 수 있는 두 줄만 감싼다', fade(u, 1.6), { 'font-size': 14.5, fill: INFO }); }
    if (k >= 2) { card(640, 120, 380, 44, { rx: 8, text: 'when (ex.Number == 1205)  데드락', fs: 13.5, mono: true, stroke: GOOD, color: GOOD, s: k === 2 ? pop(u, 0.2) : 1, op: k >= 5 ? 0.6 : 1 });
      grow(350, 178, 448, 128, k === 2 ? E(u, 0.4, 0.8) : 1, GOOD);
      if (k === 2) { dot([[350, 178], [450, 128], [640, 100], [600, 60], [240, 60], [240, 118]], seg(u, 0.6, 2.2), GOOD, 7);
        code(560, 70, 'LogWarning → 재시도', fade(u, 1.2), { fill: GOOD, 'font-size': 14 }); } }
    if (k >= 3) { card(640, 240, 380, 44, { rx: 8, text: 'catch (SqlException ex)', fs: 13.5, mono: true, stroke: BAD, color: BAD, s: k === 3 ? pop(u, 0.2) : 1, op: k >= 5 ? 0.6 : 1 });
      grow(350, 190, 448, 236, k === 3 ? E(u, 0.4, 0.8) : 1, BAD);
      code(470, 300, 'LogError(ex, …)  →  throw;', k === 3 ? fade(u, 1.0) : k >= 5 ? 0.6 : 1, { fill: BAD, 'font-size': 14, 'font-weight': 700 });
      if (k === 3) { dot([[350, 190], [450, 240], [640, 260], [640, 300]], seg(u, 0.6, 1.6), BAD, 7); say(470, 340, '복구 못 하는 것은 기록하고 그대로 올린다', fade(u, 1.9), { 'font-size': 14.5, fill: MUT }); } }
    if (k === 4) { dot([[640, 300], [300, 340], [160, 380], [160, 420]], seg(u, 0.3, 1.8), BAD, 7);
      say(470, 350, 'throw 로 빠져나가도 conn 은 닫힌다', fade(u, 1.9), { 'font-size': 14.5, fill: GOOD }); }
    if (k === 5) { [['복구 계획이 있는 예외만 잡는다', 0], ['잡으면 로깅하고 throw; 로 올린다', 1], ['자원은 using 으로 확정 해제', 2]].forEach(([s, i]) => {
        const y = 320 + i * 30; check(430, y - 5, 7, pop(u, 0.4 + i * 0.4)); tx(446, y, s, { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5 + i * 0.4) }); }); } }

  const quiz = [
    { q: 'try 안에서 data[10]이 예외를 던졌다. 그 뒤의 실행 순서로 맞는 것은 무엇인가?',
      o: ['try의 나머지 줄 → catch → finally', 'catch → finally (try의 나머지 줄은 건너뜀)', 'finally → catch'], a: 1,
      why: '예외가 난 줄에서 try는 끊기고 맞는 catch로 간다. finally는 그 뒤에 무조건 돈다.' },
    { q: 'catch (Exception)을 catch (ArgumentException)보다 위에 두면 어떻게 되나?',
      o: ['아래 catch가 먼저 검사된다', '실행 중에만 경고가 뜬다', 'CS0160 오류로 빌드가 멈춘다'], a: 2,
      why: 'catch는 위에서부터 맞는 첫 블록을 고른다. 앞에서 상위 타입을 잡으면 아래는 닿을 수 없어 컴파일러가 막는다.' },
    { q: 'StatusCode 500인 HttpRequestException이 when (StatusCode == 429)를 만나면?',
      o: ['조건이 false라 그 catch는 잡지 않고 다음 catch로 간다', '일단 잡은 뒤 다시 던진다', '프로그램이 바로 끝난다'], a: 0,
      why: 'when은 잡기 전에 평가된다. false면 그 catch는 없었던 것과 같고 스택도 손대지 않은 채로 남는다.' },
    { q: 'catch에서 throw ex; 로 다시 던지면 최종 StackTrace 첫 줄은 어떻게 되나?',
      o: ['at Repo.Load()가 그대로 남는다', 'at Service.Get()처럼 다시 던진 곳부터 시작한다', 'StackTrace가 비어 있다'], a: 1,
      why: 'throw ex; 는 스택 추적을 그 줄에서 새로 시작한다. 처음 터진 Repo.Load()가 로그에서 사라진다.' },
    { q: '잘못된 입력 100,000개를 파싱할 때 이 PC에서 Parse + catch와 TryParse의 시간 차이는 대략 어느 정도였나?',
      o: ['거의 같다', '약 2배', '약 90배 이상'], a: 2,
      why: 'Parse + catch는 약 280ms, TryParse는 약 3ms 였다. 예외를 만들 때마다 스택 추적을 모으기 때문이다.' },
    { q: 'LoadOrderAsync에서 SqlException이 나 throw; 로 빠져나갈 때 conn은 어떻게 되나?',
      o: ['await using이라 DisposeAsync가 불려 닫힌다', '다음 GC 때까지 열려 있다', 'catch에서 직접 Close 해야 닫힌다'], a: 0,
      why: 'await using은 메서드를 떠나는 모든 길, 예외 경로까지 DisposeAsync를 부른다.' },
  ];

  const summary = [
    '예외가 나면 try의 남은 줄은 건너뛰고 catch를 거쳐 finally가 반드시 돈다.',
    'catch는 위에서부터 맞는 첫 블록을 고르니 구체적인 타입을 위에 둔다.',
    '다시 던질 때는 throw; 를 써야 처음 터진 곳이 스택 추적에 남는다.',
    '자주 나는 실패는 TryParse처럼 값으로 답하고, 자원은 using으로 닫는다.',
  ];
  const review = [
    { q: '장애 로그의 스택 추적이 Service.Get에서 시작해 원인을 못 찾고 있다. 먼저 의심할 것은 무엇인가?',
      o: ['catch에서 throw ex; 로 다시 던진 코드', 'finally 블록이 너무 길다', 'using을 쓰지 않았다'], a: 0,
      why: 'throw ex; 는 스택을 그 줄에서 새로 시작한다. throw; 로 바꾸거나 원본을 InnerException으로 감싸야 첫 줄이 남는다.' },
    { q: '외부 API가 가끔 429를 돌려준다. 재시도는 429 에만 하고 싶다. 알맞은 방법은 무엇인가?',
      o: ['catch (Exception)으로 모두 잡고 재시도', 'when으로 StatusCode가 429일 때만 잡기', '빈 catch { }로 무시하고 다시 부르기'], a: 1,
      why: 'when으로 상태 코드를 걸면 429만 잡고 나머지는 스택을 그대로 둔 채 위로 보낸다.' },
    { q: '사용자 입력 검증 실패가 초당 수천 번 나는데 int.Parse를 try/catch로 감싸 두었다. 무엇이 문제인가?',
      o: ['catch 순서가 틀렸다', 'finally가 없다', '자주 나는 정상 실패에 비싼 예외를 쓰고 있다'], a: 2,
      why: '예외는 만들 때마다 스택 추적을 모아 느리다. TryParse로 bool을 받으면 같은 일을 훨씬 싸게 한다.' },
  ];

  R.page({ title: '예외가 지나가는 길', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
