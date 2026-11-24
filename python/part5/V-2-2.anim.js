/* V-2-2 종합: CLI 도구 만들기 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 확인(python 3.12): 페이지 코드를 logtool 패키지로 묶고 INFO 12 · WARN 3 · ERROR 1 (16줄) access.log 로 돌렸다.
 *  count access.log → "INFO=12  WARN=3  ERROR=1" exit 0 / nope.log → stderr 한 줄 exit 1 / top --n abc → argparse 오류 exit 2
 *  --level DEBUG → invalid choice exit 2 / 명령 없음 → "the following arguments are required: cmd" exit 2
 *  LOG_LEVEL=debug → "DEBUG 집계 시작: 16 줄" 추가, > out.txt 에는 결과 한 줄만, basicConfig(level='DEBG') → ValueError: Unknown level
 *  parse_args → Namespace(cmd='count', path='access.log', level='ERROR'), --n 생략 시 n=3, pytest 2 passed. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, terminal, cells, person, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const typed = (s, p) => s.slice(0, Math.round(s.length * clamp(p)));
  const RED = '#f87171', YEL = '#fbbf24', GRN = '#4ade80';
  // 종료코드 배지
  function exitBadge(cx, cy, code, s) { const col = code === 0 ? GOOD : code === 1 ? BAD : WARN;
    card(cx, cy, 110, 56, { rx: 28, stroke: col, sw: 2.6, fill: code === 0 ? C.GOODBG : code === 1 ? C.BADBG : C.WARNBG, s });
    tx(cx, cy - 4, 'exit', { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: s ?? 1 }); mono(cx, cy + 18, String(code), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s ?? 1 }); }
  function fileIc(x, y, col, s) { const g = R.G(x, y, s ?? 1);
    el('path', { d: 'M-9,-12 L4,-12 L9,-7 L9,12 L-9,12 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g); return g; }

  // ═════════ 1. 구조: 파싱 → 검증 → 로직 → 출력 ═════════
  const ST = [['① parse_args', 130, 2], ['② validate', 360, 3], ['③ count_levels', 600, 0], ['④ render', 830, 4]];
  function belt(k, u) { const y = 340;
    ST.forEach(([n, x, kk], i) => { if (kk > k) return; const now = kk === k, s = now ? pop(u, 0.2) : 1, pure = i === 2;
      card(x, y, 190, 50, { rx: 10, text: n, mono: true, fs: 15, stroke: pure ? GOOD : INK, color: pure ? GOOD : INK, sw: pure ? 2.6 : 2, fill: pure ? C.GOODBG : PANEL, s });
      if (i < 3 && ST[i + 1][2] <= k) grow(x + 98, y, ST[i + 1][1] - 98, y, ST[i + 1][2] === k ? E(u, 0.4, 0.9) : 1, MUT); });
    if (k >= 2) tx(480, 400, 'main(argv) 은 조립만 한다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }
  function s1(t, c) { const { k, u } = c; belt(k, u);
    if (k === 0) { card(480, 150, 300, 90, { rx: 12, stroke: GOOD, sw: 2.6, fill: C.GOODBG, s: pop(u, 0.2) });
      mono(480, 140, 'count_levels(lines)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.3) });
      mono(480, 168, 'list[str] → dict[str, int]', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      [['파일', 160, 110], ['argparse', 160, 200], ['print', 800, 150]].forEach(([n, x, y], i) => { card(x, y, 130, 40, { rx: 8, text: n, fs: 14.5, stroke: OFF, color: MUT, s: pop(u, 1.0 + i * 0.2) }); cross(x + 72, y - 18, 8, pop(u, 1.4 + i * 0.2)); });
      tx(480, 240, 'I/O 를 모르는 순수 함수: 테스트가 쉽다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); }
    if (k === 1) { const L = ['INFO ok', 'ERROR boom', '', 'INFO hi'];
      L.forEach((s, i) => { const y = 70 + i * 44, a = 0.2 + i * 0.4, tok = s.split(' ')[0];
        card(170, y, 200, 34, { rx: 6, stroke: GRID, sw: 1.5, s: pop(u, a) });
        if (s) { mono(84, y + 5, tok, { 'font-size': 15, 'font-weight': 800, fill: tok === 'ERROR' ? BAD : INFO, opacity: fade(u, a) }); mono(84 + tw(tok, 15) + 9, y + 5, s.slice(tok.length + 1), { 'font-size': 15, fill: MUT, opacity: fade(u, a) });
          dot([[270, y], [520, tok === 'INFO' ? 110 : 170]], seg(u, a + 0.2, a + 0.8), tok === 'ERROR' ? BAD : INFO, 6); }
        else tx(300, y + 5, '빈 줄 건너뜀', { 'font-size': 13.5, fill: OFF, opacity: fade(u, a) }); });
      const n1 = (u > 0.4 ? 1 : 0) + (u > 1.6 ? 1 : 0), n2 = u > 0.8 ? 1 : 0;
      [['INFO', n1, INFO, 110], ['ERROR', n2, BAD, 170]].forEach(([n, v, col, y]) => { mono(560, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: col });
        el('rect', { x: 650, y: y - 12, width: 60 * v, height: 24, rx: 4, fill: col, opacity: 0.8 }); mono(650 + 60 * v + 10, y + 6, String(v), { 'font-size': 15, 'font-weight': 700 }); });
      mono(700, 250, '{"INFO": 2, "ERROR": 1}', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.1) }); }
    if (k === 2) { tx(130, 60, 'argv', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      ['count', 'access.log'].forEach((s, i) => { const x = 160 + i * 150; card(x, 100, 130, 38, { rx: 6, text: '"' + s + '"', mono: true, fs: 14.5, s: pop(u, 0.2 + i * 0.2) });
        dot([[x, 120], [x, 200], [500, 200]], seg(u, 0.8 + i * 0.2, 1.6 + i * 0.2), ACC, 6); });
      card(690, 200, 476, 46, { rx: 8, stroke: ACC, sw: 2.2, s: pop(u, 1.4) });
      mono(690, 206, "Namespace(cmd='count', path='access.log', level=None)", { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) });
      tx(700, 254, 'argv 를 인자로 받아 두면 테스트에서 직접 넘긴다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 3) { card(190, 120, 240, 44, { rx: 8, text: "Path('access.log')", mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      grow(316, 120, 420, 120, E(u, 0.6, 1.0), MUT); mono(368, 108, '.read_text()', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.7) });
      for (let i = 0; i < 16; i++) { const s = clamp((E(u, 0.9, 2.0)) * 16 - i); el('rect', { x: 440 + (i % 8) * 56, y: 86 + Math.floor(i / 8) * 34, width: 50, height: 26, rx: 4, fill: SOFT, stroke: GRID, opacity: s }); }
      mono(660, 186, 'splitlines() → 16줄', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      tx(190, 190, '파일 I/O 는 main 에만', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k === 4) { mono(300, 100, "{'INFO': 12, 'WARN': 3, 'ERROR': 1}", { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      grow(500, 96, 580, 96, E(u, 0.6, 1.0), MUT);
      terminal(600, 64, 330, 70, [['INFO=12  WARN=3  ERROR=1', 'var(--term)']], u > 1.1 ? 1 : 0, { fs: 14.5 });
      mono(480, 200, 'return 0', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6) });
      tx(480, 230, '아직은 함수의 반환값일 뿐 셸은 모른다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) }); }
    if (k === 5) { terminal(40, 50, 560, 140, ['$ python -m logtool.cli count access.log', ['INFO=12  WARN=3  ERROR=1', 'var(--term)'], '$ echo $?', ['0', GRN]], lerp(0, 4, E(u, 0.2, 1.6)), { fs: 14.5, lh: 23 });
      mono(780, 110, 'raise SystemExit(main())', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
      exitBadge(780, 180, 0, pop(u, 1.7));
      tx(480, 250, 'main 의 반환값이 프로세스 종료코드가 된다: 셸과 CI 가 성공을 안다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); } }

  // ═════════ 2. argparse ═════════
  function ptree(k, u) { const N = (x, y, s, col, kk, o) => { if (kk > k) return false; const now = kk === k; card(x, y, tw(s, 14.5) + 26, 36, { rx: 8, text: s, mono: true, fs: 14.5, stroke: col, color: col, s: now ? pop(u, (o && o.at) || 0.3) : 1, dash: o && o.dash }); return true; };
    N(240, 60, 'logtool', INK, 0);
    if (k >= 1) { grow(240, 80, 240, 120, k === 1 ? E(u, 0.2, 0.6) : 1, MUT, { plain: true }); N(240, 134, '{count, top}  필수', ACC, 1, { at: 0.5 }); }
    const sub = (x, name, kk, args) => { if (kk > k) return; grow(240, 154, x, 198, kk === k ? E(u, 0.2, 0.6) : 1, MUT, { plain: true }); N(x, 214, name, INFO, kk, { at: 0.4 });
      args.forEach(([s, ak, col], i) => { if (ak > k) return; const y = 270 + i * 46; grow(x, 234, x, y - 18, ak === k ? E(u, 0.6, 0.9) : 1, GRID, { plain: true }); N(x, y, s, col || INK, ak, { at: 0.8 }); }); };
    sub(130, 'count', 2, [['path', 2], ['--level', 3, WARN]]);
    sub(350, 'top', 4, [['path', 4], ['--n  int = 3', 5, WARN]]); }
  function s2(t, c) { const { k, u } = c; ptree(k, u); const x = 500;
    const T = (lines, a, h) => terminal(x, 50, 430, h || 150, lines, lerp(0, lines.length, E(u, a || 0.4, (a || 0.4) + 1.0)), { fs: 13.5, lh: 21 });
    if (k === 0) { T(['$ logtool -h', 'usage: logtool [-h] {count,top} ...', '', '로그 파일 분석 도구'], 0.5); tx(x, 240, 'ArgumentParser 를 만들면 -h 가 공짜로 생긴다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 1) { T(['$ logtool', 'usage: logtool [-h] {count,top} ...', ['logtool: error: the following', RED], ['arguments are required: cmd', RED]], 0.6, 140); exitBadge(870, 250, 2, pop(u, 1.8));
      tx(x, 256, 'required=True: 명령을 빼면 파서가 막는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 2) { T(['$ logtool count', ['logtool count: error: the following', RED], ['arguments are required: path', RED]], 0.6, 120);
      tx(x, 220, '하이픈 없는 인자 = 위치 인자 = 필수', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 3) { ['INFO', 'WARN', 'ERROR'].forEach((s, i) => pill(130 + (i - 1) * 76, 380, s, GOOD, pop(u, 0.5 + i * 0.15), { mono: true, fs: 13.5 }));
      T(['$ logtool count a.log --level DEBUG', ["error: argument --level: invalid", RED], ["choice: 'DEBUG' (choose from", RED], ['INFO, WARN, ERROR)', RED]], 0.9, 140); exitBadge(870, 250, 2, pop(u, 2.0));
      tx(x, 256, '목록 밖 값은 우리 코드에 닿지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 4) { tx(x + 10, 100, '서브커맨드마다 인자 집합이 따로다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(x + 10, 128, 'top 에는 --level 이 없다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.3) }); }
    if (k === 5) { [['--n 5', '"5"', '5', 0.4], ['(생략)', '', '3', 1.3]].forEach(([a, s, v, at], i) => { const y = 90 + i * 80;
        mono(x + 10, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, at) });
        if (s) { card(x + 150, y, 70, 36, { rx: 6, text: s, mono: true, fs: 15, stroke: MUT, color: MUT, s: pop(u, at + 0.1) }); mono(x + 150, y + 34, 'str', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, at + 0.2) }); }
        grow(x + 195, y, x + 265, y, E(u, at + 0.3, at + 0.6), ACC); mono(x + 270, y + 5, 'args.n = ' + v, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, at + 0.6) });
        mono(x + 290, y + 34, i ? 'default' : 'type=int', { 'font-size': 13.5, fill: MUT, opacity: fade(u, at + 0.6) }); });
      tx(x + 10, 290, '--n abc 는 파서가 잡아 exit 2', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 6) { mono(x + 10, 80, 'p.parse_args(argv)', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      [['argv = None', 'sys.argv[1:] 을 읽는다', '셸에서 실행할 때'], ['argv = ["count", "a.log"]', '그 리스트를 그대로', '테스트에서 직접']].forEach(([a, b, w], i) => { const y = 140 + i * 90, at = 0.5 + i * 0.6;
        mono(x + 10, y, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, at) }); grow(x + 20, y + 12, x + 20, y + 36, E(u, at + 0.2, at + 0.4), MUT);
        tx(x + 40, y + 34, b, { 'font-size': 14.5, opacity: fade(u, at + 0.3) }); tx(x + 410, y + 34, w, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, at + 0.3) }); }); }
    if (k === 7) { const toks = [['count', 'cmd'], ['access.log', 'path'], ['--level ERROR', 'level']];
      mono(x, 70, '$ logtool', { 'font-size': 15, 'font-weight': 700 });
      toks.forEach(([s, f], i) => { const tx0 = x + 100 + [0, 70, 180][i], ty = 70, y2 = 170 + i * 50, p = seg(u, 0.3 + i * 0.4, 1.1 + i * 0.4);
        mono(tx0, ty, s, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: 1 - 0.6 * clamp(p * 2) });
        if (p > 0 && p < 1) pill(lerp(tx0 + 30, x + 260, E(p, 0, 1)), lerp(ty + 20, y2, E(p, 0, 1)), s, ACC, 1, { mono: true, fs: 13.5 });
        card(x + 215, y2, 430, 40, { rx: 8, stroke: p >= 1 ? ACC : GRID, sw: 1.8, op: fade(u, 0.2) }); mono(x + 16, y2 + 5, 'args.' + f, { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
        if (p >= 1) mono(x + 180, y2 + 5, "'" + s.replace('--level ', '') + "'", { 'font-size': 15, 'font-weight': 700 }); });
      tx(x + 215, 340, "Namespace(cmd='count', path='access.log', level='ERROR')", { 'font-size': 13.5, 'text-anchor': 'middle', class: 'mono', fill: MUT, opacity: fade(u, 2.1) }); } }

  // ═════════ 3. 예외 처리 · 종료코드 ═════════
  function lanes(cmd, out, err, code, a, o) { o = o || {}; const p = seg(u0, a, a + 0.8);
    mono(40, 66, '$ ' + cmd, { 'font-size': 15, 'font-weight': 700, opacity: fade(u0, a - 0.2) });
    [['stdout (결과)', 110, out, INK], ['stderr (에러·로그)', 200, err, BAD]].forEach(([n, y, txt, col], i) => {
      el('rect', { x: 40, y, width: 720, height: 70, rx: 10, fill: i ? C.BADBG : SOFT, stroke: i ? BAD : GRID, 'stroke-width': 1.6 });
      tx(56, y + 22, n, { 'font-size': 13.5, 'font-weight': 700, fill: i ? BAD : MUT });
      (Array.isArray(txt) ? txt : [txt]).forEach((s, j) => { if (s) mono(56, y + 48 + j * 18, typed(s, p), { 'font-size': 14, fill: col, 'font-weight': 600 }); }); });
    exitBadge(860, 170, code, pop(u0, a + 0.9)); }
  let u0 = 0;
  function s3(t, c) { const { k, u } = c; u0 = u;
    if (k === 0) { lanes('logtool count access.log', 'INFO=12  WARN=3  ERROR=1', '', 0, 0.8);
      card(200, 330, 200, 40, { rx: 8, text: "'access.log'  str", mono: true, fs: 14, stroke: MUT, color: MUT, s: pop(u, 0.2) }); grow(304, 330, 380, 330, E(u, 0.4, 0.7), ACC);
      card(500, 330, 220, 40, { rx: 8, text: 'Path → .exists() ✓', mono: true, fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 0.6) });
      tx(480, 400, 'validate(args) -> Path: 반환 타입이 쓰임새를 알려 준다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 1) { lanes('logtool count nope.log', '', 'error: 파일을 찾을 수 없습니다: nope.log', 1, 0.5);
      tx(400, 330, '결과는 stdout, 에러는 stderr', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(400, 358, '> out.txt 로 결과만 담아도 에러는 화면에 남는다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 2) { lanes('logtool count nope.log', '', 'error: 파일을 찾을 수 없습니다: nope.log', 1, 0.1);
      card(240, 345, 380, 72, { rx: 8, stroke: OFF, sw: 1.5, s: pop(u, 0.8) });
      ['Traceback (most recent call last):', '  File "cli.py", line …', 'FileNotFoundError: …'].forEach((s, i) => mono(62, 330 + i * 18, s, { 'font-size': 13.5, fill: OFF, opacity: fade(u, 0.9) }));
      cross(240, 345, 24, pop(u, 1.4));
      tx(700, 360, 'raise SystemExit(1): 트레이스백 대신 한 줄', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) }); }
    if (k === 3) { lanes('logtool top access.log --n abc', '', ['usage: logtool top [-h] [--n N] path', "logtool top: error: argument --n: invalid int value: 'abc'"], 2, 0.5);
      tx(400, 330, '파서가 대신 끝낸다: 우리 코드까지 오지 않는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.8) }); }
    if (k === 4) { const steps = [['parse_args', 130], ['validate', 350], ['read_text', 570], ['count_levels', 790]];
      steps.forEach(([n, x], i) => { card(x, 150, 180, 46, { rx: 8, text: n, mono: true, fs: 15, stroke: i === 1 ? BAD : i > 1 ? OFF : INK, color: i > 1 ? OFF : INK, s: pop(u, 0.2 + i * 0.1) }); if (i) grow(steps[i - 1][1] + 92, 150, x - 92, 150, 1, i > 1 ? OFF : MUT); });
      dot([[40, 150], [350, 150]], seg(u, 0.5, 1.4), BAD, 8); if (u > 1.4) { el('line', { x1: 444, y1: 120, x2: 444, y2: 180, stroke: BAD, 'stroke-width': 4 }); exitBadge(350, 250, 1, pop(u, 1.5)); }
      tx(480, 340, '없는 파일은 여기서 멈춘다. 뒤쪽 코드는 정상 값만 다룬다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (k === 5) { mono(480, 60, 'except OSError as e:  →  return 1', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.1) });
      el('rect', { x: 330, y: 110, width: 300, height: 200, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.3) });
      tx(480, 134, '잡는 그물: OSError 만', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
      const p1 = seg(u, 0.6, 1.4), p2 = seg(u, 1.2, 2.2);
      if (p1 > 0) card(lerp(140, 470, E(p1, 0, 1)), 190, 140, 36, { rx: 18, text: 'OSError', mono: true, fs: 14, fill: WARN, stroke: 'none', color: PANEL });
      if (p1 >= 1) tx(790, 196, 'error: 읽기 실패 + exit 1', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
      if (p2 > 0) card(lerp(140, 820, E(p2, 0, 1)), 260, 160, 36, { rx: 18, text: '예상 못 한 버그', fs: 14, fill: BAD, stroke: 'none', color: PANEL });
      tx(480, 360, '예상 못 한 예외는 일부러 그대로 터뜨린다: 진짜 버그를 숨기지 않는다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 6) { [[0, '성공', '정상 처리', GOOD], [1, '일반 오류', '파일 없음 · 읽기 실패', BAD], [2, '사용법 오류', '잘못된 인자 (argparse)', WARN]].forEach(([code, a, b, col], i) => { const x = 180 + i * 300;
        exitBadge(x, 140, code, pop(u, 0.2 + i * 0.3)); tx(x, 210, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.4 + i * 0.3) });
        tx(x, 238, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5 + i * 0.3) }); });
      tx(480, 320, '0 이 아닌 값으로 끝나야 파이프라인과 CI 가 실패를 안다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }

  // ═════════ 4. 로깅 · LOG_LEVEL ═════════
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { card(300, 160, 300, 60, { rx: 10, text: 'setup_logging()', mono: true, fs: 18, stroke: ACC, color: ACC, sw: 2.6, s: pop(u, 0.2) });
      card(700, 160, 220, 60, { rx: 10, stroke: INK, s: pop(u, 0.6) }); mono(700, 154, '$ LOG_LEVEL=DEBUG', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.7) }); tx(700, 178, '실행 환경이 준다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.7) });
      grow(585, 160, 455, 160, E(u, 1.0, 1.5), ACC);
      tx(480, 270, '상세도는 코드가 아니라 환경에서 받는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(480, 298, '진입점에서 한 번만 부른다 (여러 번이면 핸들러가 겹친다)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 1) { mono(480, 70, 'os.environ.get("LOG_LEVEL", "INFO").upper()', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.1) });
      [['LOG_LEVEL 없음', '"INFO"'], ['LOG_LEVEL=debug', '"DEBUG"']].forEach(([a, b], i) => { const y = 160 + i * 90, at = 0.5 + i * 0.6;
        card(260, y, 260, 46, { rx: 8, text: a, mono: true, fs: 15, stroke: INK, s: pop(u, at) }); grow(395, y, 560, y, E(u, at + 0.3, at + 0.6), ACC);
        mono(600, y + 6, b, { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, at + 0.6) }); });
      tx(480, 370, 'os.environ["LOG_LEVEL"] 로 읽으면 없을 때 KeyError', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { [['basicConfig(level="DEBUG")', '루트 레벨 = 10', GOOD], ['basicConfig(level="DEBG")', "ValueError: Unknown level: 'DEBG'", BAD]].forEach(([a, b, col], i) => { const y = 120 + i * 120, at = 0.3 + i * 0.8;
        mono(80, y, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, at) }); grow(90, y + 14, 90, y + 50, E(u, at + 0.3, at + 0.5), col);
        mono(110, y + 54, b, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, at + 0.5) }); });
      tx(700, 160, '레벨 이름 문자열을 그대로 받는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(700, 280, '오타는 시작하자마자 드러난다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) }); return; }
    const term = (x, y, w, h, lines, a, title) => terminal(x, y, w, h, lines, lerp(0, lines.length, E(u, a, a + 0.9)), { fs: 14, lh: 22, title });
    if (k === 3) { mono(40, 56, '$ logtool count access.log > out.txt', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      [['stderr → 화면', 110, BAD], ['stdout → out.txt', 250, GOOD]].forEach(([n, y, col], i) => dot([[120, 70], [120, y + 40], [480, y + 40]], seg(u, 0.4 + i * 0.4, 1.2 + i * 0.4), col, 7));
      term(500, 90, 430, 90, [['INFO 집계 완료: 3 종류', '#93c5fd']], 0.9, '화면 (stderr)');
      card(715, 300, 430, 70, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.4) }); mono(520, 290, 'out.txt', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      mono(520, 316, 'INFO=12  WARN=3  ERROR=1', { 'font-size': 15, opacity: fade(u, 1.6) });
      tx(250, 390, '결과와 로그가 섞이지 않는다 (실행 확인)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { card(480, 90, 200, 50, { rx: 10, text: 'root', mono: true, fs: 17, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      tx(600, 96, 'basicConfig 가 여기에 핸들러를 단다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
      card(480, 250, 240, 50, { rx: 10, text: 'logtool', mono: true, fs: 17, stroke: ACC, color: ACC, s: pop(u, 0.7) }); grow(480, 224, 480, 118, E(u, 1.0, 1.4), ACC);
      dot([[480, 224], [480, 118]], seg(u, 1.5, 2.2), ACC, 7);
      tx(480, 320, 'getLogger("logtool"): 출처가 찍히고 설정은 루트에서 물려받는다', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    // k 5, 6: 같은 명령, LOG_LEVEL 만 다르게
    const runA = ['$ logtool count access.log', ['INFO 집계 완료: 3 종류', '#93c5fd'], ['INFO=12  WARN=3  ERROR=1', 'var(--term)']];
    const runB = ['$ LOG_LEVEL=DEBUG logtool count access.log', ['DEBUG 집계 시작: 16 줄', YEL], ['INFO 집계 완료: 3 종류', '#93c5fd'], ['INFO=12  WARN=3  ERROR=1', 'var(--term)']];
    term(30, 60, 440, 150, runA, k === 5 ? 0.2 : 0.1, '기본 (INFO)'); term(490, 60, 440, 150, runB, k === 5 ? 0.9 : 0.6, 'LOG_LEVEL=DEBUG');
    const hl = (x, y, col) => el('rect', { x, y, width: 410, height: 24, rx: 5, fill: 'none', stroke: col, 'stroke-width': 2.4, opacity: fade(u, 1.8) });
    if (k === 5) { hl(503, 108, YEL); tx(710, 250, 'debug 는 평소 숨고, DEBUG 에서만 보인다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) });
      tx(480, 300, '지우지 않고 남겨 두는 게 요점이다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 6) { hl(43, 108, INFO); hl(503, 130, INFO); tx(480, 250, 'info 완료 이정표는 기본 설정에서도 보인다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 2.0) });
      tx(480, 280, '결과(stdout)는 레벨과 상관없이 늘 같다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); } }

  // ═════════ 5. 테스트 · 배포 ═════════
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(200, 200, 260, 70, { rx: 10, stroke: INFO, sw: 2.4, s: pop(u, 0.2) }); mono(200, 206, 'tests/test_cli.py', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
      [['count_levels', 120], ['main', 260]].forEach(([n, y], i) => { grow(330, 200, 560, y, E(u, 0.6 + i * 0.3, 1.1 + i * 0.3), ACC); card(660, y, 200, 44, { rx: 8, text: n, mono: true, fs: 15, stroke: ACC, color: ACC, s: pop(u, 1.0 + i * 0.3) }); });
      [['임시 파일', 330], ['fixture', 470]].forEach(([n, x], i) => { card(x, 340, 120, 36, { rx: 8, text: n, fs: 14, stroke: OFF, color: OFF, s: pop(u, 1.6 + i * 0.2) }); cross(x + 62, 322, 8, pop(u, 1.9 + i * 0.2)); });
      tx(780, 350, '필요 없다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { mono(60, 80, 'lines = ["INFO ok", "ERROR boom", "INFO hi"]', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      card(300, 180, 240, 56, { rx: 10, text: 'count_levels', mono: true, fs: 16, stroke: GOOD, color: GOOD, fill: C.GOODBG, s: pop(u, 0.4) });
      dot([[200, 92], [200, 180], [180, 180]], seg(u, 0.6, 1.2), ACC, 7); grow(422, 180, 520, 180, E(u, 1.2, 1.5), MUT);
      mono(540, 186, '{"INFO": 2, "ERROR": 1}', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); check(900, 180, 12, pop(u, 1.9));
      tx(480, 290, '입력도 출력도 그냥 값: 테스트가 한 줄로 끝난다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    if (k === 2 || k === 3) { mono(60, 70, 'main(["count", "no_such.log"])', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      ['parse_args', 'validate'].forEach((n, i) => card(170 + i * 230, 150, 180, 44, { rx: 8, text: n, mono: true, fs: 15, stroke: i ? BAD : INK, s: k === 2 ? pop(u, 0.3 + i * 0.2) : 1 }));
      if (k === 3) el('path', { d: 'M 600 110 L 600 200 Q 700 230 800 200 L 800 110', fill: C.WARNBG, stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', opacity: fade(u, 0.2) });
      dot([[60, 150], [400, 150]], k === 2 ? seg(u, 0.6, 1.4) : 0, ACC, 7);
      const p = k === 2 ? seg(u, 1.5, 2.3) : 1; if (p > 0) card(lerp(400, 700, E(p, 0, 1)), lerp(150, 150, p), 170, 38, { rx: 19, text: 'SystemExit(1)', mono: true, fs: 14, fill: BAD, stroke: 'none', color: PANEL });
      tx(250, 230, 'sys.argv 를 건드리지 않고 셸 없이 실행', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 2 ? fade(u, 1.0) : 1 });
      if (k === 3) { mono(700, 100, 'pytest.raises(SystemExit) as e', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.3) });
        mono(700, 262, 'assert e.value.code == 1', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); check(860, 258, 10, pop(u, 1.1));
        terminal(40, 290, 440, 110, ['$ pytest -v tests', ['test_count_levels_기본 PASSED', GRN], ['test_main_없는_파일_exit1 PASSED', GRN], ['2 passed', GRN]], lerp(0, 4, E(u, 1.2, 2.2)), { fs: 13.5, lh: 18 });
        tx(720, 330, 'try/except 로 쓰면', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) });
        tx(720, 356, '예외가 안 나도 통과해 버린다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 4) { card(260, 130, 380, 110, { rx: 10, stroke: INFO, s: pop(u, 0.2) }); mono(90, 102, 'pyproject.toml', { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      mono(90, 130, '[tool.poetry.scripts]', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) }); mono(90, 158, typed('logtool = "logtool.cli:main"', seg(u, 0.6, 1.4)), { 'font-size': 15, 'font-weight': 700, fill: ACC });
      [['명령 이름', 130, 'logtool'], ['모듈경로:함수', 320, 'logtool.cli:main']].forEach(([a, x, b], i) => { grow(x, 172, x, 240, E(u, 1.5 + i * 0.2, 1.8 + i * 0.2), MUT); tx(x, 262, a, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8 + i * 0.2) }); });
      card(720, 200, 300, 70, { rx: 10, stroke: ACC, sw: 2.2, s: pop(u, 2.0) }); mono(720, 194, 'def main(argv=None) -> int', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(720, 218, '인자 없이 부를 수 있어야 한다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k === 5
    terminal(40, 60, 520, 170, ['$ poetry install', '$ logtool count access.log', ['INFO 집계 완료: 3 종류', '#93c5fd'], ['INFO=12  WARN=3  ERROR=1', 'var(--term)']], lerp(0, 4, E(u, 0.2, 1.6)), { fs: 14, lh: 23 });
    card(760, 110, 280, 50, { rx: 10, text: 'sys.exit(main())', mono: true, fs: 16, stroke: ACC, color: ACC, s: pop(u, 1.4) });
    tx(760, 156, '설치된 logtool 실행 파일이 하는 일', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) }); exitBadge(760, 210, 0, pop(u, 1.8));
    const parts = ['구조', '인자', '예외', '로깅', '테스트', '배포'];
    parts.forEach((s, i) => card(110 + i * 148, 320, 130, 40, { rx: 20, text: s, fs: 15, stroke: GOOD, color: GOOD, fill: C.GOODBG, s: pop(u, 2.0 + i * 0.08) }));
    tx(480, 380, '여섯 조각이 명령 하나로 합쳐졌다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.5) }); }

  const quiz = [
    { q: 'count_levels를 파일·argparse·print와 떼어 순수 함수로 두는 까닭은 무엇인가?',
      o: ['실행 속도가 빨라져서', '리스트만 넣어 바로 테스트할 수 있어서', 'argparse가 순수 함수만 받아서'], a: 1,
      why: 'I/O가 없으면 입력도 출력도 값이다. ["INFO ok", "ERROR boom", "INFO hi"]를 넣고 {"INFO": 2, "ERROR": 1}을 단언하면 끝난다.' },
    { q: 'logtool top access.log --n abc를 실행하면 어떻게 되는가?',
      o: ['n이 0으로 바뀌어 실행된다', '우리 코드의 try가 잡는다', 'argparse가 invalid int value 오류를 내고 exit 2로 끝낸다'], a: 2,
      why: 'type=int 변환이 실패하면 파서가 usage와 오류를 stderr로 찍고 종료코드 2로 끝낸다. 우리 코드까지 오지 않는다.' },
    { q: '없는 파일을 넘겼을 때 logtool이 지켜야 할 동작은 무엇인가?',
      o: ['stderr에 한 줄 메시지를 내고 종료코드 1로 끝낸다', '트레이스백을 그대로 보여 주고 0으로 끝낸다', 'stdout에 에러를 찍고 계속 진행한다'], a: 0,
      why: '에러는 stderr로, 실패는 0이 아닌 코드로 알려야 셸과 CI가 실패를 안다.' },
    { q: 'logtool count access.log > out.txt를 실행했을 때 out.txt에 담기는 것은 무엇인가?',
      o: ['INFO 집계 완료 로그와 결과 둘 다', '결과 줄 INFO=12  WARN=3  ERROR=1만', '아무것도 담기지 않는다'], a: 1,
      why: '로그는 basicConfig(stream=sys.stderr)로 stderr에 가고, 결과만 stdout으로 나가 파일에 담긴다.' },
    { q: '[tool.poetry.scripts]에 logtool = "logtool.cli:main"을 적으면 생기는 일은 무엇인가?',
      o: ['poetry install 뒤 logtool 명령이 main()을 부르고 반환값이 종료코드가 된다', 'main.py 파일이 자동으로 만들어진다', 'pytest가 main을 자동으로 테스트한다'], a: 0,
      why: '설치된 실행 파일은 sys.exit(main())을 부른다. 그래서 main이 돌려준 0이나 1이 종료코드가 된다.' },
  ];

  const summary = [
    'main은 파싱, 검증, 집계, 출력을 순서대로 부르기만 하고 계산은 순수 함수에 맡긴다.',
    'argparse의 choices와 type=int가 잘못된 입력을 걸러 usage와 종료코드 2를 대신 낸다.',
    '예상한 실패만 stderr 한 줄과 종료코드 1로 바꾸고, 로그도 stderr로 보내 결과와 섞지 않는다.',
    '테스트는 리스트와 argv를 직접 넘기고, scripts 한 줄로 main을 logtool 명령에 잇는다.',
  ];
  const review = [
    { q: 'CI 스크립트가 logtool이 실패했는데도 다음 단계로 넘어갔다. 먼저 확인할 것은?',
      o: ['로그 레벨이 DEBUG인지', '실패 경로가 0이 아닌 종료코드로 끝나는지', '결과가 stdout에 찍히는지'], a: 1,
      why: 'CI는 종료코드만 본다. raise SystemExit(main())과 return 1이 제대로 이어져야 실패가 전달된다.' },
    { q: 'logtool count a.log > out.txt를 했더니 out.txt에 INFO 로그 줄까지 섞였다. 원인은?',
      o: ['로깅이 stdout으로 나가도록 설정됐다', 'argparse 설정이 틀렸다', 'count_levels가 순수 함수가 아니다'], a: 0,
      why: '로그를 stderr로 보내야 결과만 파일에 담긴다. basicConfig에 stream=sys.stderr를 준다.' },
    { q: '종료코드 테스트를 try/except로 썼더니 validate를 지워도 테스트가 통과한다. 고칠 방법은?',
      o: ['except를 Exception으로 넓힌다', '테스트를 지운다', 'pytest.raises(SystemExit)로 감싸고 e.value.code를 단언한다'], a: 2,
      why: 'try/except는 예외가 안 나면 아무것도 확인하지 않는다. pytest.raises는 예외가 안 나면 실패한다.' },
  ];

  R.page({ title: '종합: CLI 도구 만들기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
