/* II-2-2 예외 처리 설계 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, dot, fly, cells, zone, cross, check, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, j, a = 0.2, d = 0.6) => (c.k > j ? 1 : c.k === j ? E(c.u, a, a + d) : 0);
  const pp = (c, j, a = 0.2) => (c.k > j ? 1 : c.k === j ? pop(c.u, a) : 0);
  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const x = lerp(x1, x2, u), y = lerp(y1, y2, u), c = col || MUT;
    el('line', { x1, y1, x2: x, y2: y, stroke: c, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (u > 0.92 && !o.plain) { const a = Math.atan2(y2 - y1, x2 - x1), L = o.hs || 10;
      el('path', { d: `M${x},${y} L${x - L * Math.cos(a - 0.42)},${y - L * Math.sin(a - 0.42)} L${x - L * Math.cos(a + 0.42)},${y - L * Math.sin(a + 0.42)} Z`, fill: c, opacity: o.op ?? 1 }); } }
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op }, a || {}));
  const code = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op }, a || {}));
  // 예외 알약 (빨간 번개 모양 대신 둥근 알약 + ! 표시)
  function exc(x, y, name, o) { o = o || {}; const fs = o.fs || 14.5, w = tw(name, fs) + 40, g = R.G(x, y, o.s ?? 1, o.op ?? 1), col = o.col || BAD;
    el('rect', { x: -w / 2, y: -15, width: w, height: 30, rx: 15, fill: o.fill || col, stroke: 'none' }, g);
    el('circle', { cx: -w / 2 + 15, cy: 0, r: 8, fill: PANEL }, g); tx(-w / 2 + 15, 5, '!', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 900, fill: col }, g);
    mono(-w / 2 + 28, 5, name, { 'font-size': fs, 'font-weight': 700, fill: PANEL }, g); return w; }

  // =========================================================
  // 1. 네 블록의 실행 순서 — 정상 경로와 예외 경로
  // =========================================================
  const BY = (i) => 118 + i * 58;
  function lane(c, x, key, title, out) { const { k, u } = c, rows = c.beat.flow ? c.beat.flow[key] : null, prev = c.prev && c.prev.flow ? c.prev.flow[key] : null, all = k === 5;
    tx(x, 92, title, { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    const data = rows || (c.prev && c.prev.flow[key]) || [];
    data.forEach((r, i) => { const y = BY(i), was = prev && prev[i] && prev[i].run, fresh = r.run && !was;
      const ord = all ? (key === 'normal' ? [1, null, 2, 3] : [1, 2, null, 3])[i] : r.order, run = all ? ord != null : r.run;
      const t0 = all ? 0.3 + (ord || 0) * 0.5 : 0.5, on = run ? (fresh || all ? fade(u, t0) : 1) : 0;
      const col = r.block === 'finally' ? INFO : r.block === 'except' ? BAD : r.block === 'else' ? GOOD : INK;
      el('rect', { x, y, width: 380, height: 46, rx: 8, fill: on > 0.5 ? (col === INK ? SOFT : col === BAD ? BADBG : col === GOOD ? GOODBG : INFOBG) : PANEL, stroke: run ? col : GRID, 'stroke-width': run ? 2.4 : 1.6, 'stroke-dasharray': run ? null : '5 5' });
      mono(x + 46, y + 21, r.block + ':', { 'font-size': 15, 'font-weight': 800, fill: run ? col : OFF });
      mono(x + 46, y + 39, r.label, { 'font-size': 13.5, fill: run ? INK : OFF });
      if (ord != null && run) { el('circle', { cx: x + 22, cy: y + 23, r: 13 * clamp(on * 1.3), fill: col }); tx(x + 22, y + 28, String(ord), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: PANEL, opacity: on }); }
      else if (!run && k >= i + 1 && i > 0) mono(x + 368, y + 28, '건너뜀', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'end' }); });
    if (all) { const path = (key === 'normal' ? [0, 2, 3] : [0, 1, 3]).map((i) => [x + 22, BY(i) + 23]); dot(path, seg(u, 0.3, 2.0), key === 'normal' ? GOOD : BAD, 7);
      code(x, 372, out, fade(u, 2.1), { fill: key === 'normal' ? GOOD : BAD, 'font-size': 14.5 }); } }
  function s1(t, c) { const { k, u } = c;
    // 열린 파일 리소스
    const closed = (k === 4 && u > 1.2) || k === 5 && u > 1.9;
    const g = R.G(480, 40, pp(c, 0, 0.2), 1);
    el('path', { d: 'M-12,-16 h16 l8,8 v24 h-24 z', fill: PANEL, stroke: closed ? INFO : WARN, 'stroke-width': 2 }, g);
    mono(20, 6, closed ? 'audit.log · f.close() 됨' : 'audit.log · 열림 (닫아야 함)', { 'font-size': 14.5, 'font-weight': 700, fill: closed ? INFO : WARN }, g);
    if (closed) check(-36, 0, 9, 1);
    lane(c, 60, 'normal', 'parse("10")', '변환 성공: 10 → 10');
    lane(c, 520, 'error', 'parse("oops")', '변환 실패, 0으로 대체 → 0');
    if (k === 1) exc(840, BY(0) + 23, 'ValueError', { s: pop(u, 1.4), fs: 13.5 });
    if (k === 2) arrow(880, BY(0) + 44, 880, BY(1) + 2, E(u, 0.3, 0.7), BAD);
    if (k === 3) say(250, 372, 'try 가 무사히 끝났을 때만', fade(u, 1.2), { 'font-size': 14, fill: GOOD });
    if (k === 4) say(480, 372, 'except 안에 return 0 이 있어도 finally 는 돈다', fade(u, 1.4), { 'font-size': 14.5, fill: INFO }); }

  // =========================================================
  // 2. 예외 전파 — 프레임을 하나씩 끊으며 내려간다(되감기)
  // =========================================================
  const FR = [['<module>', 'print(high("x"))'], ['high(raw)', 'try: return mid(raw)'], ['mid(raw)', 'return low(raw) * 2'], ['low(raw)', 'return int(raw)']];
  const FY = (i) => 330 - i * 72;   // 0=<module> 바닥, 3=low 꼭대기
  function s2(t, c) { const { k, u } = c;
    tx(60, 40, '호출 스택 (위가 가장 최근 호출)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const gone = (i) => (i === 3 && (k >= 2 || (k === 1 && u > 0.6))) || (i === 2 && (k >= 3 || (k === 2 && u > 0.9)));
    FR.forEach(([fn, line], i) => { const y = FY(i), g = gone(i), caught = i === 1 && (k >= 3 && k <= 4), bad = k === 5;
      const col = g ? OFF : caught ? GOOD : i === 3 && k === 0 && u > 0.8 ? BAD : bad && i > 0 ? BAD : INK;
      el('rect', { x: 60, y, width: 400, height: 58, rx: 8, fill: caught ? GOODBG : PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': g ? '6 5' : null, opacity: k === 0 && i > 0 ? fade(u, 0.1 + (i - 1) * 0.15) : 1 });
      mono(76, y + 24, fn, { 'font-size': 15, 'font-weight': 800, fill: col }); mono(76, y + 46, line, { 'font-size': 13.5, fill: g ? OFF : MUT });
      if (g) mono(444, y + 34, '프레임 끊김', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'end' }); });
    if (k !== 5) { el('rect', { x: 52, y: FY(1) - 4, width: 6, height: 66, fill: k >= 2 ? GOOD : OFF }); mono(40, FY(1) + 34, 'try', { 'font-size': 13.5, fill: k >= 2 ? GOOD : OFF, 'text-anchor': 'end' }); }
    // 예외 알약 위치
    const ey = k === 0 ? FY(3) + 29 : k === 1 ? lerp(FY(3), FY(2), E(u, 0.3, 0.9)) + 29 : k === 2 ? lerp(FY(2), FY(1), E(u, 0.3, 0.9)) + 29 : FY(1) + 29;
    if (k <= 3) exc(600, ey, 'ValueError', { s: k === 0 ? pop(u, 0.8) : k === 3 ? 1 - E(u, 0.6, 1.0) : 1 });
    if (k <= 3) arrow(470, ey, 520, ey, k === 0 ? E(u, 0.9, 1.2) : 1, BAD, { sw: 1.8 });
    if (k === 0) say(700, FY(3) - 18, "int('x') 가 그 줄에서 실행을 끊는다", fade(u, 1.3), { 'font-size': 14 });
    if (k === 1) { el('line', { x1: 196, y1: FY(2) + 42, x2: 250, y2: FY(2) + 42, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.0) }); say(700, FY(2) + 60, '* 2 는 실행되지 못한다', fade(u, 1.2), { 'font-size': 14, fill: BAD }); }
    if (k === 2) say(720, FY(1) + 70, 'except ValueError 에 맞는지 검사', fade(u, 1.2), { 'font-size': 14 });
    if (k === 3) { card(700, FY(1) + 29, 260, 40, { rx: 8, text: 'except ValueError ✓', fs: 15, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.4) });
      terminal(510, 30, 420, 86, [["high 에서 복구: invalid literal for", '#86efac'], ["int() with base 10: 'x'", '#86efac']], lerp(0, 2, E(u, 1.2, 2.0)), { fs: 13.5, lh: 20 }); }
    if (k === 4) { dot([[260, FY(1) + 29], [260, FY(0) + 29]], seg(u, 0.3, 1.0), GOOD, 8); code(700, FY(0) + 35, 'high("x") → -1', fade(u, 1.0), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 17 });
      say(700, FY(0) - 8, '호출자는 트레이스백을 보지 않는다', fade(u, 1.6), { 'font-size': 14 }); }
    if (k === 5) { terminal(490, 40, 450, 330, ['Traceback (most recent call last):', '  File …, in <module>', '    high("x")', '  File …, in high', '    return mid(raw)', '  File …, in mid', '    return low(raw) * 2', '  File …, in low', '    return int(raw)', ['ValueError: invalid literal for int()', '#fca5a5'], ["  with base 10: 'x'", '#fca5a5']], lerp(0, 11, E(u, 0.2, 2.2)), { fs: 13.5, lh: 26, title: 'high 에 except 가 없다면' });
      say(260, 400, '바깥 호출부터 예외가 난 곳까지 순서대로 찍힌다', fade(u, 2.2), { 'font-size': 14 }); } }

  // =========================================================
  // 3. 예외 계층 트리와 except 체 — 위에서부터 걸러 낸다
  // =========================================================
  const NP = { BaseException: [265, 66], SystemExit: [90, 156], KeyboardInterrupt: [250, 156], Exception: [420, 156], ValueError: [150, 252], TypeError: [290, 252], KeyError: [420, 252] };
  const PAR = { SystemExit: 'BaseException', KeyboardInterrupt: 'BaseException', Exception: 'BaseException', ValueError: 'Exception', TypeError: 'Exception', KeyError: 'Exception' };
  function tree(c, names, o) { o = o || {}; const { k, u } = c, prevN = (c.prev && c.prev.hierarchy) ? c.prev.hierarchy.tree.map((n) => n.name) : [];
    names.forEach((n) => { const p = PAR[n]; if (p && NP[p]) { const fresh = !prevN.includes(n); const [x1, y1] = NP[p], [x2, y2] = NP[n];
      el('line', { x1, y1: y1 + 16, x2: lerp(x1, x2, fresh ? E(u, 0.2, 0.6) : 1), y2: lerp(y1 + 16, y2 - 16, fresh ? E(u, 0.2, 0.6) : 1), stroke: GRID, 'stroke-width': 2 }); } });
    names.forEach((n) => { const [x, y] = NP[n], fresh = !prevN.includes(n), hi = o.hi && o.hi(n), sys = n === 'SystemExit' || n === 'KeyboardInterrupt';
      const col = hi === 'match' ? GOOD : hi === 'raised' ? BAD : hi === 'net' ? WARN : sys ? MUT : INK;
      card(x, y, tw(n, 14) + 24, 32, { rx: 8, text: n, fs: 14, mono: true, stroke: col, color: col, fill: hi === 'match' ? GOODBG : hi === 'raised' ? BADBG : hi === 'net' ? WARNBG : null, s: fresh ? pop(u, 0.4) : 1 }); }); }
  function clauses(c, list, hit, o) { o = o || {}; const { u } = c;
    list.forEach((s, i) => { const y = 104 + i * 62, isHit = i === hit && u > (o.t || 1.0) + i * 0.35, passed = hit != null && i < hit && u > (o.t || 1.0) + i * 0.35, dead = o.dead === i;
      el('rect', { x: 530, y, width: 400, height: 48, rx: 8, fill: isHit ? GOODBG : PANEL, stroke: isHit ? GOOD : dead ? OFF : INK, 'stroke-width': isHit ? 2.6 : 2, 'stroke-dasharray': dead ? '6 5' : null, opacity: o.op ?? 1 });
      mono(548, y + 30, s, { 'font-size': 15, 'font-weight': 700, fill: dead ? OFF : isHit ? GOOD : INK, 'text-decoration': dead ? 'line-through' : null, opacity: o.op ?? 1 });
      if (passed) mono(916, y + 30, '아님', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      if (isHit) mono(916, y + 30, '잡음 ✓', { 'font-size': 14, fill: GOOD, 'text-anchor': 'end', 'font-weight': 700 });
      if (dead) mono(916, y + 30, '도달 불가', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end' }); });
    if (hit != null) { const yy = 104 + hit * 62 + 24; dot([[505, 70], [505, yy]], seg(u, o.t ? o.t - 0.4 : 0.6, (o.t || 1.0) + hit * 0.35), BAD, 7); } }
  function s3(t, c) { const { k, u } = c, H = c.beat.hierarchy, names = H.tree.map((n) => n.name);
    if (k === 0) { tree(c, names); card(700, 200, 280, 50, { rx: 10, text: 'config = {"port": "8080"}', fs: 15, mono: true, s: pop(u, 0.6) });
      say(700, 260, '있는 키는 port 하나', fade(u, 1.2), { 'font-size': 14, fill: MUT }); return; }
    if (k === 1) { tree(c, names, { hi: (n) => (n === 'KeyError' && u > 1.0 ? 'raised' : null) });
      pill(700, 120, 'int(config["prot"])', INK, pop(u, 0.2), { mono: true, fs: 15 }); exc(700, 190, "KeyError: 'prot'", { s: pop(u, 0.9) });
      say(700, 250, 'int() 는 실행조차 안 된다', fade(u, 1.5), { 'font-size': 14 }); return; }
    if (k === 2) { tree(c, names, { hi: (n) => (n === 'KeyError' ? 'raised' : null) }); exc(700, 60, 'KeyError', { s: pop(u, 0.2) });
      clauses(c, ['except KeyError:', 'except (ValueError, TypeError):', 'except Exception:'], 0, { t: 0.8 });
      code(530, 320, "설정 키 없음: 'prot'", fade(u, 1.5), { fill: GOOD }); say(730, 360, '먼저 걸린 절 하나만 돈다 · 아래는 검사 안 함', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 3) { tree(c, names, { hi: (n) => (n === 'ValueError' ? 'match' : n === 'TypeError' ? 'net' : null) }); exc(700, 60, 'ValueError 라면', { s: pop(u, 0.2) });
      clauses(c, ['except KeyError:', 'except (ValueError, TypeError):', 'except Exception:'], 1, { t: 0.8 });
      say(730, 340, '처리 방법이 같으면 튜플로 한 절에 묶는다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 4) { tree(c, names, { hi: (n) => (['Exception', 'ValueError', 'TypeError', 'KeyError'].includes(n) && u > 0.8 ? 'net' : null) });
      el('path', { d: 'M165,132 H505 V280 H86 V188 H165 Z', fill: 'none', stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', 'stroke-linejoin': 'round', opacity: fade(u, 0.8) });
      clauses(c, ['except KeyError:', 'except (ValueError, TypeError):', 'except Exception:'], null, {});
      el('rect', { x: 526, y: 100 + 2 * 62, width: 408, height: 56, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.6, opacity: fade(u, 0.5) });
      say(730, 340, 'Exception 하위 전부를 잡는 마지막 안전망', fade(u, 1.2), { 'font-size': 14, fill: WARN });
      say(90, 120, '그물 밖', fade(u, 1.8), { 'font-size': 14, fill: MUT }); return; }
    tree(c, names, { hi: (n) => (n === 'ValueError' ? 'raised' : n === 'Exception' && u > 1.0 ? 'match' : null) }); exc(700, 60, "ValueError: 'oops'", { s: pop(u, 0.2) });
    clauses(c, ['except Exception:', 'except ValueError:'], 0, { t: 0.8, dead: 1 });
    code(530, 260, '여기서 다 잡힘', fade(u, 1.4), { fill: GOOD });
    say(730, 310, '넓은 절이 위에 있으면 아래 구체 절은 죽은 코드', fade(u, 1.8), { 'font-size': 14, fill: BAD });
    say(270, 330, 'SystemExit · KeyboardInterrupt 는 Exception 밖', fade(u, 2.2), { 'font-size': 14, fill: MUT }); }

  // =========================================================
  // 4. raise from — 저수준 예외를 도메인 예외로 바꾸고 원인을 매단다
  // =========================================================
  const LX = [160, 480, 800], LN = ['호출부 (상위)', 'load(path)', 'open(path)'];
  function s4(t, c) { const { k, u } = c;
    LN.forEach((n, i) => { zone(LX[i] - 145, 40, 290, 360, n, { op: 1 }); });
    if (k === 0) { card(480, 150, 250, 64, { rx: 10, text: 'class DataLoadError\n(Exception)', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.3) });
      say(480, 230, '상위가 알아들을 이름', fade(u, 1.0), { 'font-size': 14 }); say(480, 256, '아직 던지지 않는다', fade(u, 1.4), { 'font-size': 14, fill: MUT }); return; }
    pill(800, 96, 'open("missing.yaml")', INK, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
    const fnf = (x, y, s, op) => exc(x, y, 'FileNotFoundError', { s, op, fs: 14 });
    if (k === 1) { fnf(800, 170, pop(u, 0.9)); say(800, 220, '저수준 원인', fade(u, 1.3), { 'font-size': 14, fill: BAD });
      say(800, 246, '상위가 파일을 알아야 할까?', fade(u, 1.8), { 'font-size': 14, fill: MUT }); return; }
    // k>=2: 번역된 DataLoadError + __cause__
    const dx = k === 2 ? 480 : k === 3 ? lerp(480, 160, E(u, 0.3, 1.2)) : 160, dy = 170;
    if (k === 2) fly(800, 170, 480, 262, seg(u, 0.2, 0.9), 'FileNotFoundError', { stay: true, fill: BAD, mono: true });
    exc(dx, dy, 'DataLoadError', { col: INFO, s: k === 2 ? pop(u, 0.9) : 1 });
    if (k >= 3 || (k === 2 && u > 1.2)) { el('line', { x1: dx, y1: dy + 16, x2: dx, y2: dy + 76, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: k === 2 ? fade(u, 1.2) : 1 });
      mono(dx + 8, dy + 50, '__cause__', { 'font-size': 13.5, fill: MUT, opacity: k === 2 ? fade(u, 1.3) : 1 });
      if (k >= 3) fnf(dx, dy + 92, 1, k === 3 ? 1 - 0.5 * E(u, 1.4, 1.8) : 0.5); }
    if (k === 2) { code(480, 330, 'raise DataLoadError(…) from e', fade(u, 1.6), { 'text-anchor': 'middle', 'font-size': 13.5, fill: INFO }); }
    if (k === 3) { card(160, 330, 250, 40, { rx: 8, text: 'except DataLoadError ✓', fs: 14, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.3) });
      say(480, 330, '상위는 파일 세부를 몰라도 된다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 4) { terminal(330, 236, 610, 130, ['print(type(e).__name__, "->", e.__cause__)', ['DataLoadError -> [Errno 2] No such file or', '#86efac'], ["directory: 'missing.yaml'", '#86efac']], lerp(0, 3, E(u, 0.3, 1.5)), { fs: 14, lh: 24 });
      say(480, 402, '트레이스백: The above exception was the direct cause …', fade(u, 1.9), { 'font-size': 13.5, fill: MUT }); }
    if (k === 5) { card(480, 300, 270, 64, { rx: 10, text: 'log.warning("…")\nraise', fs: 14.5, mono: true, stroke: WARN, color: INK, s: pop(u, 0.2) });
      dot([[800, 300], [480, 300], [160, 300]], seg(u, 0.6, 1.8), BAD, 7); say(480, 365, '번역하지 않고 같은 예외를 그대로 다시 던진다', fade(u, 1.8), { 'font-size': 14 }); } }

  // =========================================================
  // 5. 도메인 예외 계층 · EAFP — 일단 꺼내 보고, 실패를 번역한다
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    // 왼쪽 계층
    const node = (x, y, n, s, col, fill) => card(x, y, tw(n, 14.5) + 26, 34, { rx: 8, text: n, fs: 14.5, mono: true, stroke: col || INK, color: col || INK, fill, s });
    const climb = k === 5 && u > 0.5, caughtAt = k === 5 && u > 1.3;
    node(200, 60, 'Exception', 1, MUT);
    el('line', { x1: 200, y1: 77, x2: 200, y2: 113, stroke: GRID, 'stroke-width': 2, opacity: at(c, 0, 0.3) });
    node(200, 130, 'OrderError', pp(c, 0, 0.3), caughtAt ? GOOD : INFO, caughtAt ? GOODBG : null);
    if (k >= 3) { el('line', { x1: 180, y1: 147, x2: 110, y2: 193, stroke: GRID, 'stroke-width': 2, opacity: at(c, 3, 0.3) }); node(110, 210, 'PaymentError', pp(c, 3, 0.4), MUT); }
    if (k >= 1) { el('line', { x1: 220, y1: 147, x2: 290, y2: 193, stroke: GRID, 'stroke-width': 2, opacity: at(c, 1, 0.3) }); node(290, 210, 'OutOfStockError', pp(c, 1, 0.3), k >= 4 ? BAD : INFO, k >= 4 ? BADBG : null); }
    if (k === 1) { card(290, 300, 220, 96, { rx: 10, s: pop(u, 0.9), stroke: INFO }); ['sku', 'need', 'have'].forEach((f, i) => mono(200, 280 + i * 24, 'self.' + f, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1 + i * 0.2) }));
      say(290, 372, '값을 속성으로 담아 둔다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 1) return;
    if (climb) { arrow(270, 192, 220, 150, E(u, 0.5, 1.2), GOOD); }
    // 오른쪽
    if (k === 0) { say(680, 180, '"주문에서 난 실패"를 한 이름으로', fade(u, 0.8), { 'font-size': 15 }); say(680, 212, 'except OrderError 하나로 골라 잡는다', fade(u, 1.3), { 'font-size': 14, fill: MUT }); return; }
    if (k === 2) { const lb = c.beat.custom.compare.lbyl, ea = c.beat.custom.compare.eafp;
      R.snippet(470, 60, lb.lines, { fs: 14, w: 230, op: fade(u, 0.2) }); tx(470, 50, 'LBYL · 미리 검사', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      R.snippet(720, 60, ea.lines, { fs: 14, w: 220, op: fade(u, 0.6) }); tx(720, 50, 'EAFP · 일단 시도', { 'font-size': 14, 'font-weight': 700, fill: GOOD });
      // 시간축: 검사와 실행 사이 틈
      const y = 280; el('line', { x1: 470, y1: y, x2: 700, y2: y, stroke: MUT, 'stroke-width': 2 }); [[480, '검사'], [680, '꺼냄']].forEach(([x, s]) => { el('circle', { cx: x, cy: y, r: 6, fill: INK }); sub(x, y + 26, s, 1, { fill: INK }); });
      el('rect', { x: 520, y: y - 18, width: 120, height: 36, rx: 6, fill: WARNBG, opacity: fade(u, 1.2) }); sub(580, y - 26, '상태가 바뀔 틈', fade(u, 1.3), { fill: WARN, 'font-weight': 700 });
      el('line', { x1: 740, y1: y, x2: 900, y2: y, stroke: GOOD, 'stroke-width': 2 }); el('circle', { cx: 760, cy: y, r: 6, fill: GOOD }); sub(760, y + 26, '바로 꺼냄', 1, { fill: GOOD });
      code(700, 360, 'KeyError → OrderError(…) from None', fade(u, 1.9), { 'text-anchor': 'middle', 'font-size': 14, fill: INFO }); return; }
    // 재고 막대
    const stock = 2, need = 5;
    tx(470, 96, 'stock["apple"]', { 'font-size': 14, 'font-weight': 700, class: 'mono' }); hbar(620, 82, 220, stock, 6, { h: 20, col: GOOD, text: String(stock), u: at(c, 3, 0.3) });
    tx(470, 136, 'qty (요청)', { 'font-size': 14, 'font-weight': 700 }); hbar(620, 122, 220, need, 6, { h: 20, col: BAD, text: String(need), u: at(c, 3, 0.7) });
    if (k === 3) { code(700, 190, 'if qty > have:  raise OutOfStockError', fade(u, 1.3), { 'text-anchor': 'middle', 'font-size': 14 }); say(700, 222, '비교는 if 가 자연스럽다 · EAFP 가 늘 정답은 아니다', fade(u, 1.8), { 'font-size': 14, fill: MUT }); }
    if (k >= 4) { pill(700, 190, 'reserve({"apple": 2}, "apple", 5)', INK, k === 4 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
      exc(700, 240, 'OutOfStockError', { s: k === 4 ? pop(u, 0.8) : 1 });
      code(700, 286, "sku='apple'  need=5  have=2", k === 4 ? fade(u, 1.3) : 1, { 'text-anchor': 'middle', 'font-size': 14 }); }
    if (k === 4) say(700, 330, '로그만 봐도 상황이 재구성된다', fade(u, 1.9), { 'font-size': 14 });
    if (k === 5) { card(700, 330, 260, 40, { rx: 8, text: 'except OrderError ✓', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.3) });
      code(700, 384, 'OutOfStockError apple: 필요 5 > 재고 2', fade(u, 1.8), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14 }); } }

  // =========================================================
  // 6. 안티패턴 — 실패가 사라지는 길 vs 흔적을 남기고 올라가는 길
  // =========================================================
  function logPanel(lines, shown) { terminal(560, 60, 370, 200, lines, shown, { fs: 13.5, lh: 22, title: 'log · __name__' }); }
  function s6(t, c) { const { k, u } = c;
    if (k === 0) { pill(270, 90, 'log = logging.getLogger(__name__)', INK, pop(u, 0.2), { mono: true, fs: 14 }); arrow(440, 90, 556, 110, E(u, 0.7, 1.1), MUT);
      logPanel([['(아직 비어 있음)', '#bdb6a5']], fade(u, 1.0)); say(270, 160, '흔적을 남길 도구부터', fade(u, 1.4), { 'font-size': 14 }); return; }
    if (k <= 2) { R.snippet(40, 60, ['def bad(order):', '    try:', '        save(order)', '    except:', '        pass'], { fs: 15, w: 330 });
      logPanel([['(비어 있음)', '#bdb6a5']], 1);
      if (k === 1) { exc(470, 118, '실패 가능', { s: pop(u, 1.0), col: WARN }); say(200, 230, '문제는 이 실패를 어떻게 받느냐', fade(u, 1.5), { 'font-size': 14 }); return; }
      // 블랙홀
      const hx = 200, hy = 300; el('ellipse', { cx: hx, cy: hy, rx: 90, ry: 26, fill: INK, opacity: 0.85 }); mono(hx, hy + 5, 'pass', { 'text-anchor': 'middle', 'font-size': 15, fill: PANEL, 'font-weight': 700 });
      [['DBError', 0.2], ['NameError', 0.6], ['KeyboardInterrupt', 1.0]].forEach(([n, a], i) => { const p = E(u, a, a + 0.8); if (p < 1) exc(lerp(470, hx + (i - 1) * 40, p), lerp(110 + i * 40, hy, p), n, { s: 1 - p * 0.7, fs: 13.5 }); });
      say(745, 300, '로그 0줄 · 호출자도 모른다', fade(u, 1.8), { 'font-size': 15, fill: BAD }); say(745, 330, 'Ctrl+C 까지 삼킨다', fade(u, 2.1), { 'font-size': 14, fill: BAD }); return; }
    // k3~5: good / with
    if (k <= 4) { R.snippet(40, 60, ['def good(order):', '    try:', '        save(order)', '    except DBError:', '        log.exception(…)', '        raise'], { fs: 15, w: 330 });
      const shown = k === 4 ? lerp(0, 3, E(u, 0.6, 1.6)) : 0;
      logPanel([['ERROR 주문 저장 실패: 42', '#fca5a5'], 'Traceback (most recent call last):', '  … DBError'], shown);
      card(745, 340, 240, 44, { rx: 10, text: '호출자 (상위)', fs: 15, stroke: INK });
      if (k === 3) { exc(470, 160, 'DBError', { s: pop(u, 0.3), fs: 13.5 }); check(530, 160, 9, pop(u, 0.8)); sub(470, 196, '좁게 잡는다', fade(u, 0.8), { fill: GOOD, 'font-weight': 700 });
        const p = E(u, 1.2, 2.2); exc(lerp(470, 745, p), lerp(250, 315, p), 'NameError', { fs: 13.5, col: WARN }); say(300, 300, '모르는 실패는 잡지 않고 위로', fade(u, 1.6), { 'font-size': 14, fill: WARN }); }
      if (k === 4) { exc(470, 160, 'DBError', { fs: 13.5 }); arrow(520, 160, 556, 130, E(u, 0.3, 0.6), BAD);
        const p = E(u, 1.6, 2.4); exc(lerp(470, 745, p), lerp(190, 315, p), 'DBError', { fs: 13.5, op: u > 1.6 ? 1 : 0 });
        say(300, 300, '트레이스백까지 남기고 다시 던진다', fade(u, 1.8), { 'font-size': 14, fill: GOOD }); }
      return; }
    R.snippet(40, 60, ['def read_config(path):', '    with open(path) as f:', '        return f.read()'], { fs: 15, w: 330 });
    const open1 = u < 1.4; const g = R.G(560, 160, 1, 1);
    el('path', { d: 'M-22,-30 h30 l14,14 v46 h-44 z', fill: PANEL, stroke: open1 ? WARN : INFO, 'stroke-width': 2.4 }, g);
    mono(36, 6, open1 ? 'f 열림' : 'f.close() 자동', { 'font-size': 15, 'font-weight': 700, fill: open1 ? WARN : INFO }, g);
    if (!open1) check(-46, 0, 10, pop(u, 1.4));
    exc(520, 250, '읽다가 예외', { s: pop(u, 0.7), fs: 13.5 });
    arrow(600, 250, 820, 250, E(u, 1.6, 2.2), BAD); say(720, 290, '예외는 위로 간다', fade(u, 2.0), { 'font-size': 14 });
    say(300, 300, 'finally 를 손으로 쓸 일이 줄어든다', fade(u, 1.8), { 'font-size': 14, fill: GOOD }); }

  const quiz = [
    { q: 'parse("oops")를 부르면 네 블록은 어떤 순서로 실행되는가?',
      o: ['try → else → finally', 'try → except → finally', 'try → except → else → finally'], a: 1,
      why: '변환이 실패해 except로 가고 else는 건너뛴다. finally는 except 안에 return 0이 있어도 마지막에 돈다.' },
    { q: 'low에서 난 ValueError를 mid가 잡지 않으면 mid의 low(raw) * 2는 어떻게 되는가?',
      o: ['실행되지 않고 mid 프레임이 끊긴다', '0을 곱한 값이 반환된다', 'None이 반환된다'], a: 0,
      why: '예외는 잡힐 때까지 프레임을 하나씩 끊으며 올라간다. 중간 함수의 남은 코드는 건너뛰므로 잘못된 값이 조용히 반환되지 않는다.' },
    { q: 'except Exception: 절을 except ValueError: 위에 두면 int("oops")는 어디서 잡히는가?',
      o: ['except ValueError:', '둘 다 차례로 실행된다', 'except Exception:'], a: 2,
      why: 'except 절은 위에서 아래로 검사하고 처음 맞는 절 하나만 돈다. ValueError는 Exception 하위라 위 절에 먼저 걸리고 아래 절은 죽은 코드가 된다.' },
    { q: 'raise DataLoadError(...) from e에서 from e가 하는 일은 무엇인가?',
      o: ['원본 FileNotFoundError를 __cause__로 매달아 원인을 남긴다', '원본 예외를 없애고 새 예외만 남긴다', 'DataLoadError를 FileNotFoundError로 바꾼다'], a: 0,
      why: 'from e는 번역한 예외에 원인을 명시적으로 연결한다. 상위는 DataLoadError로 잡고, 필요하면 e.__cause__로 근본 원인을 본다.' },
    { q: 'reserve({"apple": 2}, "apple", 5)에서 난 OutOfStockError가 except OrderError에 잡히는 이유는 무엇인가?',
      o: ['메시지에 apple이 들어 있어서', 'OutOfStockError가 OrderError를 상속한 하위 예외라서', 'OrderError가 모든 예외를 잡아서'], a: 1,
      why: 'except는 그 클래스이거나 하위 클래스면 잡는다. 도메인 계층을 만들면 상위 이름 하나로 하위 실패까지 골라 잡을 수 있다.' },
    { q: 'except: pass로 감싼 save(order)가 실패하면 어떻게 되는가?',
      o: ['로그에 오류가 한 줄 남는다', '호출자에게 예외가 전달된다', '흔적 없이 사라지고 Ctrl+C까지 삼킨다'], a: 2,
      why: '빈 except는 KeyboardInterrupt를 포함한 모든 실패를 지운다. 좁게 잡고 log.exception으로 흔적을 남긴 뒤 raise로 넘긴다.' },
  ];

  const summary = [
    'try에는 실패할 한 줄만 두고, 성공 후속은 else에, 정리는 finally나 with에 둔다.',
    '잡히지 않은 예외는 프레임을 끊으며 위로 가므로 가장 잘 대응할 수 있는 계층에서 잡는다.',
    'except는 위에서 아래로 검사하므로 구체적인 예외를 먼저, except Exception은 맨 아래에 둔다.',
    '저수준 예외는 raise ... from e로 도메인 예외로 바꾸고, 빈 except로 실패를 삼키지 않는다.',
  ];
  const review = [
    { q: '주문 저장이 가끔 실패하는데 로그가 한 줄도 없다. 코드에서 먼저 의심할 것은?',
      o: ['finally에서 파일을 닫는 코드', 'except: pass처럼 실패를 삼키는 절', 'else 블록의 print'], a: 1,
      why: '빈 except는 실패를 흔적 없이 지운다. DBError처럼 좁게 잡고 log.exception으로 남긴 뒤 raise로 상위에 넘겨야 원인을 찾을 수 있다.' },
    { q: 'API 계층에서 DB 드라이버의 예외 이름이 그대로 사용자 응답에 나온다. 알맞은 고침은?',
      o: ['저장소 계층에서 도메인 예외로 바꿔 raise ... from e로 던진다', '모든 함수에 except Exception: pass를 넣는다', '드라이버 예외를 except 없이 그대로 둔다'], a: 0,
      why: '저수준 어휘가 상위로 새지 않게 번역하는 것이 from e의 쓰임이다. 상위는 도메인 예외로 잡고 원인은 __cause__에 남는다.' },
    { q: 'try 안에 변환과 후속 처리를 몽땅 넣었더니 후속 처리의 TypeError까지 except가 잡아 0을 돌려준다. 어떻게 고치는가?',
      o: ['except를 Exception으로 넓힌다', 'finally에 후속 처리를 옮긴다', 'try에는 변환 한 줄만 두고 후속 처리는 else로 뺀다'], a: 2,
      why: 'else는 try가 성공했을 때만 돈다. try를 좁히면 except가 의도한 예외만 잡고, 후속 처리의 버그는 그대로 드러난다.' },
  ];

  R.page({ title: '예외가 흐르는 길', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
