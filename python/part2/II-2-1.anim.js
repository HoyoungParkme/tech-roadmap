/* II-2-1 모듈·패키지·가상환경(venv·pip) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, dot, fly, cells, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, j, a = 0.2, d = 0.6) => (c.k > j ? 1 : c.k === j ? E(c.u, a, a + d) : 0);
  const pp = (c, j, a = 0.2) => (c.k > j ? 1 : c.k === j ? pop(c.u, a) : 0);

  function obj(cx, top, w, head, rows, o) { o = o || {}; const rh = 30, h = 36 + rows.length * rh + 6, g = R.G(cx, top, o.s ?? 1, o.op ?? 1), col = o.stroke || INK;
    el('rect', { x: -w / 2, y: 0, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: -w / 2, y1: 33, x2: w / 2, y2: 33, stroke: col, 'stroke-width': 1.2, opacity: 0.45 }, g);
    tx(-w / 2 + 12, 23, head, { 'font-size': 15, 'font-weight': 700, fill: o.hcol || col, class: o.hmono === false ? null : 'mono' }, g);
    if (o.tag) tx(w / 2 - 12, 23, o.tag, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g);
    rows.forEach((r, i) => { const y = 36 + i * rh, op = r.op ?? 1; if (op <= 0) return;
      if (r.hot) el('rect', { x: -w / 2 + 5, y: y + 1, width: w - 10, height: rh - 3, rx: 6, fill: r.hot === true ? ACCBG : r.hot, opacity: op }, g);
      mono(-w / 2 + 14, y + 20, r.k, { 'font-size': 14.5, 'font-weight': 700, fill: r.kcol || INK, opacity: op }, g);
      if (r.v) mono(w / 2 - 14, y + 20, r.v, { 'font-size': 14.5, fill: r.vcol || INK, 'text-anchor': 'end', 'font-weight': r.vb ? 700 : 400, opacity: op }, g); });
    return { top, h, bottom: top + h, left: cx - w / 2, right: cx + w / 2, cx, rowY: (i) => top + 36 + i * rh + 15 }; }
  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const x = lerp(x1, x2, u), y = lerp(y1, y2, u), c = col || MUT;
    el('line', { x1, y1, x2: x, y2: y, stroke: c, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (u > 0.92 && !o.plain) { const a = Math.atan2(y2 - y1, x2 - x1), L = o.hs || 10;
      el('path', { d: `M${x},${y} L${x - L * Math.cos(a - 0.42)},${y - L * Math.sin(a - 0.42)} L${x - L * Math.cos(a + 0.42)},${y - L * Math.sin(a + 0.42)} Z`, fill: c, opacity: o.op ?? 1 }); } }
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op }, a || {}));
  const code = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op }, a || {}));
  // 파일 아이콘(모서리 접힌 종이) · 폴더 아이콘
  function fileIco(x, y, col, op) { el('path', { d: `M${x - 7},${y - 9} h10 l5,5 v13 h-15 z`, fill: PANEL, stroke: col || INK, 'stroke-width': 1.8, opacity: op ?? 1 }); }
  function folderIco(x, y, col, op) { el('path', { d: `M${x - 9},${y - 7} h7 l2,3 h9 v11 h-18 z`, fill: SOFT, stroke: col || INK, 'stroke-width': 1.8, opacity: op ?? 1 }); }
  // 트리 한 줄: depth, 이름, 폴더?, 색, 나타남
  function treeRow(x0, y, depth, name, isDir, col, op, o) { o = o || {}; if (op <= 0) return; const x = x0 + depth * 26;
    if (depth > 0) el('path', { d: `M${x - 18},${y - 26} V${y} H${x - 12}`, fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: op });
    if (o.hot) el('rect', { x: x - 14, y: y - 14, width: tw(name, 15) + 46, height: 28, rx: 6, fill: o.hot, opacity: op });
    (isDir ? folderIco : fileIco)(x, y, col, op); mono(x + 16, y + 5, name, { 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: op }); }

  // =========================================================
  // 1. 파일 = 모듈, 폴더 = 패키지 · import 가 이름공간에 무엇을 붙이나
  // =========================================================
  const TREE = [['myproject/', -1, true], ['main.py', 0, false], ['utils/', 0, true], ['__init__.py', 1, false], ['math_tools.py', 1, false], ['text_tools.py', 1, false]];
  function s1(t, c) { const { k, u } = c;
    TREE.forEach(([n, d, dir], i) => { const y = 66 + i * 40, hot = (n === 'math_tools.py' && (k === 0 || k === 1 || k === 2)) ? ACCBG : (n === 'text_tools.py' && k === 3) ? ACCBG : (n === 'main.py' && k >= 4) ? ACCBG : null;
      treeRow(56, y, d + 1, n, dir, n === '__init__.py' ? MUT : INK, k === 0 ? fade(u, 0.1 + i * 0.12, 0.25) : 1, { hot }); });
    sub(150, 318, '__init__.py = 패키지 표식', at(c, 0, 1.0), { 'font-size': 13.5 });
    if (k === 0) { code(620, 120, 'utils/math_tools.py', fade(u, 1.0), { 'text-anchor': 'middle', fill: MUT });
      arrow(620, 140, 620, 176, E(u, 1.4, 1.8), ACC); code(620, 206, 'utils.math_tools', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC, 'font-size': 18 });
      say(620, 246, '슬래시와 .py 를 빼고 점으로 잇는다', fade(u, 2.2), { 'font-size': 14, fill: MUT }); return; }
    // main.py 이름공간과 모듈 객체
    const NS = obj(470, 50, 200, 'main.py 이름공간', [
      { k: 'utils', v: '●', vcol: ACC, op: at(c, 1, 0.5), hot: k === 1 ? true : null }, { k: 'add', v: '●', vcol: ACC, op: at(c, 2, 0.5), hot: k === 2 ? true : null },
      { k: 'txt', v: '●', vcol: ACC, op: at(c, 3, 0.5), hot: k === 3 ? true : null }, { k: 'main', v: '●', vcol: ACC, op: at(c, 4, 0.5), hot: k === 4 ? true : null }], { hmono: false });
    const M1 = obj(790, 50, 270, 'module utils.math_tools', [{ k: 'add', v: 'function' , vcol: MUT, hot: k === 2 && u > 0.9 ? true : null }], { s: pp(c, 1, 0.3) });
    const M2 = obj(790, 150, 270, 'module utils.text_tools', [{ k: 'shout', v: 'function', vcol: MUT }], { s: pp(c, 3, 0.3) });
    const F = obj(790, 250, 270, 'function main', [], { s: pp(c, 4, 0.3) });
    arrow(NS.right - 16, NS.rowY(0), M1.left - 4, M1.top + 18, at(c, 1, 0.8), ACC);
    arrow(NS.right - 16, NS.rowY(1), M1.left - 4, M1.rowY(0), at(c, 2, 0.8), ACC);
    arrow(NS.right - 16, NS.rowY(2), M2.left - 4, M2.top + 18, at(c, 3, 0.8), ACC);
    arrow(NS.right - 16, NS.rowY(3), F.left - 4, F.top + 18, at(c, 4, 0.8), ACC);
    const stmt = ['', 'import utils.math_tools', 'from utils.math_tools import add', 'import utils.text_tools as txt', 'def main(): ...', 'if __name__ == "__main__":'][k];
    const call = ['', 'utils.math_tools.add(1, 2) → 3', 'add(10, 20) → 30', 'txt.shout("hi") → HI!', '정의만 했다 · 출력 없음', ''][k];
    if (k <= 4) { pill(470, 262, stmt, INK, pop(u, 0.2), { mono: true, fs: 14.5 }); code(470, 312, call, fade(u, 1.4), { 'text-anchor': 'middle', fill: k === 4 ? MUT : ACC });
      if (k === 2) say(470, 350, '모듈 안의 add 만 이 파일 이름으로 끌어온다', fade(u, 1.9), { 'font-size': 14 });
      if (k === 1) say(470, 350, '쓸 때마다 전체 경로를 적는다', fade(u, 1.9), { 'font-size': 14 });
      if (k === 3) say(470, 350, 'numpy 를 np 로 쓰는 관례와 같다', fade(u, 1.9), { 'font-size': 14 }); return; }
    terminal(330, 290, 300, 116, ['$ python main.py', '__name__ == "__main__"', ['run as script', '#86efac']], lerp(0, 3, E(u, 0.3, 1.3)), { fs: 14, lh: 24 });
    terminal(650, 290, 290, 116, ['>>> import main', '__name__ == "main"', ['(출력 없음)', '#bdb6a5']], lerp(0, 3, E(u, 1.3, 2.3)), { fs: 14, lh: 24 }); }

  // =========================================================
  // 2. import 의 길 — 캐시(sys.modules) 먼저, 없으면 sys.path 를 앞에서부터
  // =========================================================
  const PX = 540, PW = 390, py = (i) => 96 + i * 64;
  function s2(t, c) { const { k, u } = c, sp = c.beat.searchPath;
    const target = ['sys', null, 'json', 'greet', 'greet', 'greet'][k];
    const stmt = ['import sys', 'for p in sys.path: print(p)', 'import json', 'import greet   # 1차', 'import greet   # 2차', 'importlib.reload(greet)'][k];
    pill(480, 36, stmt, INK, pop(u, 0.15), { mono: true, fs: 15 });
    // 캐시
    const have = ['sys'].concat(k > 2 || (k === 2 && u > 2.0) ? ['json'] : []).concat(k > 3 || (k === 3 && u > 2.2) ? ['greet'] : []);
    const cacheHit = k === 0 || k === 4, missAt = k === 2 || k === 3;
    zone(40, 70, 250, 220, 'sys.modules  (캐시)', { stroke: cacheHit && u > 0.6 ? GOOD : GRID, sw: 2 });
    have.forEach((m, i) => { const y = 124 + i * 46, hot = (cacheHit && m === target && u > 0.6) || (k === 5 && m === 'greet');
      card(165, y, 210, 36, { rx: 8, text: '"' + m + '" → module', fs: 14.5, mono: true, stroke: hot ? GOOD : INK, fill: hot ? GOODBG : null, color: INK, s: (k === 2 && m === 'json') || (k === 3 && m === 'greet') ? pop(u, k === 2 ? 2.0 : 2.2) : 1 }); });
    if (target) dot([[400, 52], [300, 90], [200, 100]], seg(u, 0.2, 0.6), ACC, 7);
    if (missAt && u > 0.6) { cross(260, 270, 10, pop(u, 0.6)); mono(240, 275, '없음', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.6) }); }
    if (cacheHit && target) code(165, 316, k === 0 ? '기동 때 이미 로드됨' : '캐시 히트 · 탐색 생략', fade(u, 0.7), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14.5 });
    // sys.path
    tx(PX, 76, 'sys.path  (앞에서부터 검사)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const hitIdx = k === 2 ? 2 : k === 3 ? 0 : -1, scanUpto = k === 1 ? Math.floor(clamp((u - 0.3) / 0.45, 0, 4)) : hitIdx >= 0 ? Math.min(hitIdx, Math.floor(clamp((u - 0.7) / 0.35, 0, 4))) : -1;
    sp.forEach((r, i) => { const y = py(i), scanned = i <= scanUpto && (k === 1 || hitIdx >= 0), hit = i === hitIdx && i <= scanUpto, dim = k === 4;
      el('rect', { x: PX, y, width: PW, height: 54, rx: 8, fill: hit ? GOODBG : scanned && k !== 1 ? SOFT : PANEL, stroke: hit ? GOOD : scanned ? WARN : GRID, 'stroke-width': hit ? 2.6 : 1.8, opacity: dim ? 0.45 : k === 0 ? fade(u, 0.5 + i * 0.15) : 1 });
      mono(PX + 14, y + 23, String(r.idx), { 'font-size': 16, 'font-weight': 800, fill: hit ? GOOD : MUT, opacity: dim ? 0.45 : 1 });
      tx(PX + 40, y + 23, r.label, { 'font-size': 14.5, 'font-weight': 700, opacity: dim ? 0.45 : k === 0 ? fade(u, 0.5 + i * 0.15) : 1 });
      tx(PX + 40, y + 44, r.note, { 'font-size': 13.5, fill: hit ? GOOD : MUT, opacity: dim ? 0.45 : k === 0 ? fade(u, 0.6 + i * 0.15) : 1 });
      if (hitIdx > i && i <= scanUpto) mono(PX + PW - 12, y + 32, '없음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    if (hitIdx >= 0) { const fname = k === 2 ? 'json/' : 'greet.py'; code(PX + PW - 12, py(hitIdx) + 32, fname, fade(u, 0.7 + hitIdx * 0.35 + 0.2), { 'text-anchor': 'end', fill: GOOD, 'font-size': 14.5 });
      arrow(PX - 6, py(hitIdx) + 27, 292, k === 2 ? 170 : 216, E(u, 1.6, 2.0), GOOD); }
    if (k === 1) say(735, 372, '0번이 내 스크립트 폴더 · 이름이 겹치면 내 파일이 이긴다', fade(u, 2.0), { 'font-size': 14, fill: WARN });
    if (k === 2) code(165, 316, '"json" in sys.modules → True', fade(u, 2.2), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14 });
    const out = k === 3 ? [['loading greet', '#86efac']] : k === 4 ? [['(출력 없음)', '#bdb6a5']] : k === 5 ? [['loading greet', '#86efac']] : null;
    if (out) { terminal(40, 330, 460, 76, out, k === 3 ? fade(u, 1.0) : k === 4 ? fade(u, 1.0) : fade(u, 0.8), { fs: 15, lh: 26, title: '출력' });
      if (k === 3) say(735, 382, '처음 import 할 때 모듈 최상단이 실행된다', fade(u, 2.3), { 'font-size': 14 });
      if (k === 4) say(735, 382, '본문은 다시 돌지 않는다 · 같은 모듈 객체를 돌려준다', fade(u, 1.6), { 'font-size': 14 });
      if (k === 5) say(735, 382, 'reload 는 캐시를 무시하고 본문을 다시 실행한다', fade(u, 1.4), { 'font-size': 14 }); } }

  // =========================================================
  // 3. 절대·상대 임포트 · 순환 임포트가 막히는 순간
  // =========================================================
  function pkg(c, o) { o = o || {}; const op = o.op ?? 1;
    zone(40, 70, 330, 230, '', { stroke: o.broken ? OFF : INK, dash: o.broken ? '6 6' : null, fill: o.broken ? PANEL : SOFT, op });
    treeRow(70, 100, 0, 'myproject/', true, o.broken ? OFF : INK, op);
    treeRow(70, 150, 1, '__init__.py', false, MUT, op);
    treeRow(70, 200, 1, 'service.py', false, INK, op, { hot: o.svc ? ACCBG : null });
    treeRow(70, 250, 1, 'utils.py', false, INK, op, { hot: o.utl ? GOODBG : null }); }
  function modBox(cx, name, lines, ptr, ns, o) { o = o || {}; const w = 380, top = 70, h = 36 + lines.length * 30 + 10;
    el('rect', { x: cx - w / 2, y: top, width: w, height: h, rx: 10, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2.2 });
    mono(cx - w / 2 + 14, top + 23, name, { 'font-size': 15, 'font-weight': 800, fill: o.col || INK });
    lines.forEach((l, i) => { const y = top + 36 + i * 30 + 20; if (i === ptr) el('path', { d: `M${cx - w / 2 + 8},${y - 11} l10,6 l-10,6 z`, fill: o.pcol || ACC });
      mono(cx - w / 2 + 24, y, l, { 'font-size': 14.5, fill: i === ptr ? (o.pcol || ACC) : INK, 'font-weight': i === ptr ? 700 : 400 }); });
    const nt = top + h + 14; el('rect', { x: cx - w / 2, y: nt, width: w, height: 44, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(cx - w / 2 + 14, nt + 27, '이름공간: {' + ns.join(', ') + '}', { 'font-size': 14.5, fill: ns.length ? GOOD : MUT, 'font-weight': 700 });
    return { top, bottom: nt + 44, y: (i) => top + 36 + i * 30 + 15, nsY: nt + 22 }; }
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) {
      pkg(c, { op: k === 0 ? fade(u, 0.2) : 1, broken: k === 3 && u < 1.6, svc: k >= 2, utl: (k === 1 || k === 2) && u > 1.0 });
      if (k === 0) { say(660, 170, 'service.py 에서 utils.py 의 add 를 쓰려 한다', fade(u, 0.9), { 'font-size': 14.5 }); say(660, 205, '__init__.py 가 있어 myproject 가 패키지다', fade(u, 1.5), { 'font-size': 14, fill: MUT }); return; }
      if (k === 1) { pill(660, 120, 'from myproject.utils import add', GOOD, pop(u, 0.2), { mono: true, fs: 15 });
        dot([[92, 100], [118, 250]], seg(u, 0.5, 1.0), GOOD, 7); code(660, 180, '최상위 패키지부터 전부 적는다', fade(u, 1.2), { 'text-anchor': 'middle', 'font-size': 14 });
        say(660, 220, '어디서 열어 봐도 같은 이름 · PEP 8 권장', fade(u, 1.7), { 'font-size': 14, fill: GOOD }); }
      if (k === 2) { pill(660, 120, 'from .utils import add', WARN, pop(u, 0.2), { mono: true, fs: 15 });
        code(48, 108, '.', fade(u, 0.5), { 'font-size': 22, fill: WARN }); arrow(255, 200, 255, 238, E(u, 0.6, 1.0), WARN);
        code(660, 180, '. = 현재 패키지   .. = 한 단계 위', fade(u, 1.1), { 'text-anchor': 'middle', 'font-size': 14 });
        say(660, 220, '짧지만 파일 위치에 묶인다', fade(u, 1.7), { 'font-size': 14, fill: WARN }); }
      if (k === 3) { terminal(420, 90, 510, 96, ['$ python myproject/service.py', ['ImportError: attempted relative import', '#fca5a5'], ['  with no known parent package', '#fca5a5']], lerp(0, 3, E(u, 0.2, 1.2)), { fs: 14, lh: 22 });
        say(660, 214, '부모 패키지를 모르면 . 이 가리킬 곳이 없다', fade(u, 1.2), { 'font-size': 14, fill: BAD });
        terminal(420, 240, 510, 70, ['$ python -m myproject.service', ['3', '#86efac']], lerp(0, 2, E(u, 1.6, 2.4)), { fs: 14, lh: 22 }); }
      return; }
    if (k === 4) { const ph = u < 0.5 ? 0 : u < 1.0 ? 1 : u < 1.5 ? 2 : 3;
      const A = modBox(250, 'myproject/a.py', ['from myproject.b import helper', 'def f(): return 1'], ph >= 0 ? 0 : -1, [], { pcol: ph >= 1 ? WARN : ACC });
      const B = modBox(710, 'myproject/b.py', ['from myproject.a import f', 'def helper(x): return x'], ph >= 1 ? 0 : -1, [], { pcol: ph >= 2 ? BAD : ACC });
      arrow(440, A.y(0), 520, B.y(0), E(u, 0.5, 0.9), WARN); mono(480, A.y(0) - 12, 'a 가 멈추고 b 로', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      arrow(560, B.y(0) + 12, 250, A.nsY - 24, E(u, 1.0, 1.5), BAD, { dash: '5 4' });
      say(250, A.bottom + 26, 'a 는 아직 1행 · f 가 없다', fade(u, 1.5), { 'font-size': 14, fill: BAD });
      terminal(40, 300, 880, 100, [['ImportError: cannot import name \'f\' from partially', '#fca5a5'], ['initialized module \'myproject.a\' (most likely due to a circular import)', '#fca5a5']], lerp(0, 2, E(u, 1.7, 2.5)), { fs: 14, lh: 24 }); return; }
    // k5: 지연 import
    const run = u < 1.4 ? 0 : 1;
    const A = modBox(250, 'myproject/a.py', ['def handle(x):', '    from myproject.b import helper', '    return helper(x)'], u < 0.8 ? 0 : -1, u > 0.8 ? ['handle'] : [], { pcol: ACC });
    if (u > 0.8) say(250, A.bottom + 24, 'a 는 끝까지 실행돼 완성된다', fade(u, 0.8), { 'font-size': 14, fill: GOOD });
    pill(710, 100, 'handle(x) 를 부를 때', ACC, pop(u, 1.3), { fs: 14.5 });
    arrow(710, 120, 710, 160, E(u, 1.5, 1.8), ACC); card(710, 188, 300, 50, { rx: 10, text: '그제야 b 를 import', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.8) });
    check(880, 188, 11, pop(u, 2.1));
    say(710, 262, '해결 ① 공통 코드를 c.py 로 빼기', fade(u, 2.2), { 'font-size': 14 });
    say(710, 290, '해결 ② import 를 함수 안으로 늦추기', fade(u, 2.3), { 'font-size': 14 });
    void run; }

  // =========================================================
  // 4. venv — 프로젝트마다 자기 python 과 site-packages
  // =========================================================
  function proj(x, name, venv, pk, o) { o = o || {};
    zone(x, 60, 400, 250, name, { stroke: INK, sw: 2 });
    if (venv > 0) { const g = R.G(x + 200, 190, venv, 1);
      el('rect', { x: -170, y: -86, width: 340, height: 168, rx: 10, fill: o.active ? ACCBG : PANEL, stroke: o.active ? ACC : MUT, 'stroke-width': o.active ? 2.6 : 2, 'stroke-dasharray': o.ghost ? '6 5' : null }, g);
      mono(-156, -62, '.venv/', { 'font-size': 15, 'font-weight': 800, fill: o.active ? ACC : MUT }, g);
      if (o.cross) { el('line', { x1: -170, y1: -86, x2: 170, y2: 82, stroke: BAD, 'stroke-width': 2.4, opacity: 0.6 }, g); }
      mono(-156, -34, 'bin/python', { 'font-size': 14, fill: INK }, g);
      mono(-156, -8, 'site-packages/', { 'font-size': 14, fill: MUT }, g);
      el('rect', { x: -156, y: 2, width: 312, height: 66, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }, g);
      pk.forEach(([s, op], i) => { if (op > 0) card(-80 + i * 160, 35, 140, 34, { rx: 8, text: s, fs: 14, mono: true, stroke: GOOD, color: INK, fill: GOODBG, op, p: g }); }); } }
  function s4(t, c) { const { k, u } = c;
    const aPk = k >= 3 ? [['Django 3.2', k === 3 ? fade(u, 0.9) : 1], ['requests', k === 3 ? fade(u, 1.2) : 1]] : [];
    const bPk = k >= 3 ? [['Django 5.0', k === 3 ? fade(u, 1.6) : 1]] : [];
    const act = k >= 1 && k <= 3 || (k === 5 && false);
    proj(40, '프로젝트 A', pp(c, 0, 0.3), aPk, { active: act && !(k === 1 && u < 0.6), cross: k === 5 && u > 0.8 });
    proj(520, '프로젝트 B', k >= 3 ? pp(c, 3, 0.2) : 0, bPk, {});
    if (k < 3) say(720, 190, '아직 .venv 없음', 1, { 'font-size': 14, fill: OFF });
    // 전역 저장소
    el('rect', { x: 40, y: 330, width: 880, height: 60, rx: 10, fill: k === 0 ? WARNBG : SOFT, stroke: k === 0 ? WARN : GRID, 'stroke-width': 2 });
    tx(56, 354, 'system site-packages (전역, 모두가 공유)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k === 0) { code(56, 378, 'A 는 Django 3.2, B 는 Django 5.0 · 한 칸에 한 버전만', fade(u, 1.0), { fill: WARN, 'font-size': 14 }); code(480, 32, 'python -m venv .venv', pop(u, 0.2) > 0.5 ? 1 : fade(u, 0.2), { 'text-anchor': 'middle' }); }
    else { const shell = k === 4 ? '$ deactivate' : k === 5 ? '.gitignore 에  .venv/' : '(.venv) $ ' + (k === 1 ? 'source .venv/bin/activate' : k === 2 ? 'which python' : 'pip install requests');
      pill(480, 30, shell, k === 5 ? BAD : ACC, k >= 1 ? pop(u, 0.15) : 0, { mono: true, fs: 14.5 }); }
    if (k === 1) { arrow(480, 48, 160, 148, E(u, 0.7, 1.3), ACC); say(480, 410, '이 셸의 python · pip 이 .venv 쪽을 가리킨다', fade(u, 1.6), { 'font-size': 14 }); }
    if (k === 2) { code(240, 300, '→ …/myproject/.venv/bin/python', fade(u, 0.7), { 'text-anchor': 'middle', fill: ACC, 'font-size': 14 });
      say(720, 110, 'sys.prefix 도 .venv 를 가리키면', fade(u, 1.4), { 'font-size': 14 }); say(720, 136, '격리가 걸린 것이다', fade(u, 1.6), { 'font-size': 14, fill: GOOD }); }
    if (k === 3) { fly(480, 48, 160, 225, seg(u, 0.4, 0.9), 'Django 3.2', { mono: true }); fly(480, 48, 720, 225, seg(u, 1.1, 1.6), 'Django 5.0', { mono: true });
      code(480, 372, '전역에는 아무것도 안 깔렸다', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14 }); }
    if (k === 4) { arrow(480, 48, 480, 326, E(u, 0.4, 1.0), MUT); say(480, 410, '셸은 전역 파이썬으로 · 설치물은 .venv 에 그대로', fade(u, 1.4), { 'font-size': 14 }); }
    if (k === 5) { card(760, 360, 230, 40, { rx: 8, text: 'requirements.txt → 커밋', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.4) });
      say(240, 330 - 40, '.venv 는 OS·경로에 묶여 공유 안 한다', fade(u, 1.0), { 'font-size': 13.5, fill: BAD }); } }

  // =========================================================
  // 5. pip — 설치 · freeze 로 기록 · -r 로 복원 · 버전 고정
  // =========================================================
  function s5(t, c) { const { k, u } = c, rf = c.beat.reqFile;
    const cmd = ['pip install requests fastapi', 'pip freeze > requirements.txt', 'pip install -r requirements.txt', 'pip list · pip show requests', 'pip check', '버전 표기 비교'][k];
    pill(480, 30, cmd, INK, pop(u, 0.15), { mono: true, fs: 15 });
    // 왼쪽: 내 venv
    zone(30, 60, 270, 300, '내 .venv site-packages', { stroke: GRID });
    const mine = [['requests', k === 0 ? fade(u, 0.7) : 1], ['fastapi', k === 0 ? fade(u, 1.0) : 1]].concat(k >= 3 ? [['pydantic', k === 3 ? fade(u, 0.8) : 1]] : []);
    mine.forEach(([s, op], i) => card(165, 110 + i * 54, 200, 40, { rx: 8, text: s + (k === 0 ? '  (버전?)' : ''), fs: 14.5, mono: true, op, stroke: GOOD, fill: GOODBG }));
    if (k === 0) { fly(480, 48, 165, 110, seg(u, 0.3, 0.8), 'requests', { mono: true }); fly(480, 48, 165, 164, seg(u, 0.6, 1.1), 'fastapi', { mono: true }); say(165, 300, '무슨 버전인지 기록이 없다', fade(u, 1.6), { 'font-size': 14, fill: WARN }); }
    if (k === 3) { arrow(165, 186, 165, 198, 1, MUT, { sw: 1.6, hs: 7 }); sub(165, 258, 'fastapi 가 끌고 옴', fade(u, 1.0), { 'font-size': 13.5 });
      terminal(30, 290, 270, 70, ['Location: …/.venv/…', ['격리 확인 ✓', '#86efac']], lerp(0, 2, E(u, 1.2, 2.0)), { fs: 13.5, lh: 20 }); }
    // 가운데: requirements.txt
    const fx = 340, fw = 300, lines = k === 0 ? [] : rf.map((r) => [r.pkg, r.tone]);
    el('path', { d: `M${fx},70 h${fw - 24} l24,24 v${270} h-${fw} z`, fill: PANEL, stroke: k >= 1 ? INK : OFF, 'stroke-width': 2, 'stroke-dasharray': k === 0 ? '6 5' : null });
    mono(fx + 14, 96, 'requirements.txt', { 'font-size': 15, 'font-weight': 800, fill: k >= 1 ? INK : OFF });
    if (k >= 1) sub(fx + fw - 40, 116, '버전 값은 예시', 1, { 'font-size': 13.5, 'text-anchor': 'end' });
    lines.forEach(([s, tone], i) => { const y = 150 + i * 44, typed = k === 1 ? clamp((u - 0.4 - i * 0.5) / 0.5) : 1;
      const col = tone === 'bad' ? BAD : tone === 'good' ? GOOD : WARN;
      code(fx + 16, y, s.slice(0, Math.round(s.length * typed)), typed > 0 ? 1 : 0, { fill: k >= 4 ? col : INK, 'font-size': 15 });
      if (k === 5) sub(fx + 16, y + 20, rf[i].mean, fade(u, 0.4 + i * 0.4), { 'text-anchor': 'start', fill: col }); });
    if (k === 0) say(fx + fw / 2, 220, '아직 없음', 1, { fill: OFF });
    // 오른쪽: 다른 머신
    zone(680, 60, 250, 300, k === 5 ? '두 머신이 깐 numpy' : '다른 머신 · 서버', { stroke: GRID });
    if (k === 2 || k === 3 || k === 4) { ['requests', 'fastapi'].forEach((s, i) => { const op = k === 2 ? fade(u, 1.0 + i * 0.4) : 1;
        card(805, 110 + i * 54, 210, 40, { rx: 8, text: s + ' ==', fs: 14.5, mono: true, op, stroke: GOOD, fill: GOODBG }); });
      if (k === 2) { fly(fx + fw / 2, 160, 805, 110, seg(u, 0.4, 1.0), 'requests==2.31.0', { mono: true }); say(805, 260, '같은 버전이 그대로 깔린다', fade(u, 1.9), { 'font-size': 14, fill: GOOD }); } }
    if (k === 4) { terminal(680, 240, 250, 80, ['$ pip check', ['No broken requirements', '#86efac'], ['found.', '#86efac']], lerp(0, 3, E(u, 0.3, 1.2)), { fs: 13.5, lh: 20 });
      say(480, 392, '같은 하위 패키지의 다른 버전을 요구하면 여기서 걸린다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 5) { card(805, 130, 210, 44, { rx: 8, text: '오늘 깐 최신', fs: 14.5, stroke: INK, s: pop(u, 1.4) }); card(805, 200, 210, 44, { rx: 8, text: '다음 달 깐 최신', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 1.7) });
      code(805, 262, '≠', fade(u, 1.9), { 'text-anchor': 'middle', 'font-size': 26, fill: BAD });
      say(805, 300, '이름만 적으면 재현이 안 된다', fade(u, 2.1), { 'font-size': 14, fill: BAD });
      say(480, 392, '== 로 고정해야 언제 누가 깔아도 같은 버전이다', fade(u, 2.3), { 'font-size': 14.5, fill: GOOD }); } }

  const quiz = [
    { q: 'main.py를 다른 파일에서 import 했을 때 if __name__ == "__main__": 아래 main()이 돌지 않는 이유는 무엇인가?',
      o: ['import 할 때 __name__은 "main"이라 조건이 거짓이기 때문이다', 'import는 함수를 지우기 때문이다', '__main__ 블록은 항상 무시되기 때문이다'], a: 0,
      why: '직접 실행하면 __name__이 "__main__"이고, import 되면 모듈 이름 "main"이 된다. 그래서 진입점과 재사용 코드를 나눌 수 있다.' },
    { q: '같은 프로세스에서 import greet를 두 번 쓰면 "loading greet"는 몇 번 찍히는가?',
      o: ['두 번', '한 번', '한 번도 안 찍힌다'], a: 1,
      why: '첫 import에서 본문이 실행되고 sys.modules에 등록된다. 두 번째는 캐시에서 같은 모듈 객체를 돌려줄 뿐이다.' },
    { q: 'python myproject/service.py로 실행했더니 from .utils import add에서 ImportError가 났다. 무엇을 바꾸면 되는가?',
      o: ['utils.py 이름을 바꾼다', '. 을 .. 으로 바꾼다', 'python -m myproject.service로 패키지로서 실행한다'], a: 2,
      why: '상대 임포트의 점은 현재 패키지를 뜻한다. 파일을 직접 실행하면 부모 패키지를 몰라 점이 가리킬 곳이 없다.' },
    { q: 'venv를 활성화한 셸에서 pip install requests를 하면 requests는 어디에 깔리는가?',
      o: ['시스템 전역 site-packages', '그 프로젝트의 .venv 안 site-packages', '홈 폴더의 캐시'], a: 1,
      why: '활성화하면 그 셸의 python과 pip이 .venv를 가리킨다. 그래서 설치가 프로젝트 안에 갇히고 다른 프로젝트와 버전이 섞이지 않는다.' },
    { q: 'requirements.txt에 requests라고만 적으면 어떤 문제가 생기는가?',
      o: ['설치 자체가 안 된다', '파일을 읽을 수 없다', '깔 때마다 그 시점의 최신이 와서 환경이 재현되지 않는다'], a: 2,
      why: '버전을 적지 않으면 오늘과 다음 달에 깔리는 버전이 달라진다. requests==2.31.0처럼 ==로 고정해야 같은 환경이 나온다.' },
  ];

  const summary = [
    '.py 파일 하나가 모듈이고 __init__.py가 있는 폴더가 패키지다. import는 경로가 아니라 점으로 이은 이름을 쓴다.',
    'import는 sys.modules 캐시를 먼저 보고 없으면 sys.path를 앞에서부터 뒤진다. 모듈 본문은 한 번만 돈다.',
    '상대 임포트는 패키지로 실행할 때만 동작하고, 순환 임포트는 공통 코드를 빼거나 import를 함수 안으로 늦춰 푼다.',
    '프로젝트마다 .venv를 만들어 설치를 가두고, pip freeze로 버전을 ==로 적은 requirements.txt만 공유한다.',
  ];
  const review = [
    { q: '프로젝트 폴더에 random.py를 만들었더니 import random 뒤 random.randint에서 AttributeError가 난다. 원인은?',
      o: ['random 모듈이 설치되지 않았다', 'sys.path 0번인 스크립트 폴더의 내 random.py가 표준 모듈을 가렸다', 'random은 import 할 때마다 새로 실행된다'], a: 1,
      why: 'sys.path는 앞에서부터 검사하고 0번이 스크립트 폴더다. 같은 이름의 내 파일이 먼저 걸려 표준 random을 가린다.' },
    { q: '팀원이 저장소를 받아 실행했더니 다른 버전의 패키지 때문에 깨진다. 저장소에 무엇이 있어야 했는가?',
      o: ['==로 버전을 고정한 requirements.txt', '내 컴퓨터의 .venv 폴더 전체', 'sys.path에 경로를 추가하는 코드'], a: 0,
      why: '.venv는 OS와 경로에 묶여 공유해도 돌지 않는다. 고정된 requirements.txt로 각자 venv를 만들고 pip install -r로 복원한다.' },
    { q: 'a.py와 b.py가 최상단에서 서로를 import 해 "partially initialized module" 오류가 난다. 구조로 푸는 첫 방법은?',
      o: ['두 파일을 하나로 합친 뒤 venv를 다시 만든다', 'import를 매번 importlib.reload로 바꾼다', '두 모듈이 함께 쓰는 코드를 c.py로 빼 한 방향으로 만든다'], a: 2,
      why: 'a가 다 실행되기 전에 b가 a의 이름을 찾아서 생기는 오류다. 공유 부분을 제3 모듈로 빼면 고리가 사라지고, 급하면 함수 안 import로 늦춘다.' },
  ];

  R.page({ title: 'import와 환경 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
