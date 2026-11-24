/* I-2-2 스택 프레임 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 스택은 위(높은 주소)에서 아래(낮은 주소)로 자란다. 주소 값은 모두 예시다(실행마다 달라진다).
 * 프레임 이름·변수는 페이지 STEPS 의 frames · frameParts 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 프레임 상자 (왼쪽 위 기준). o.vars: 문자열 배열
  function frame(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1, top = o.top;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || (top ? ACCBG : PANEL), stroke: o.stroke || (top ? ACC : GRID), 'stroke-width': top ? 2.5 : 2, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 12, y + 22, name, { 'font-size': 15, 'font-weight': 800, fill: o.stroke || (top ? ACC : INK), opacity: op });
    (o.vars || []).forEach((v, i) => mono(x + 24, y + 46 + i * 22, v, { 'font-size': 14, fill: o.varCol || INK, opacity: op })); }
  // 주소가 붙은 칸 하나
  function slot(x, y, w, h, text, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 4, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    tx(x + w / 2, y + h / 2 + 5, text, { 'font-size': o.fs || 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.color || INK, opacity: op, class: o.mono ? 'mono' : null });
    if (o.addr) mono(x - 10, y + h / 2 + 5, o.addr, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }
  // 오른쪽 포인터 화살표 (rsp/rbp)
  function ptr(x, y, name, col, op) { grow(x + 60, y, x + 4, y, 1, col, { op: op ?? 1 }); mono(x + 66, y + 5, name, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op ?? 1 }); }
  function growthAxis(x, y0, y1) { el('line', { x1: x, y1: y0, x2: x, y2: y1, stroke: GRID, 'stroke-width': 2 }); grow(x, y1 - 30, x, y1, 1, MUT);
    tx(x - 8, y0 + 4, '높은 주소', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); tx(x - 8, y1, '낮은 주소', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }

  // ---------- 1. 콜 스택 ----------
  function s1(t, c) { const { k, u } = c, fr = c.beat.frames || [], FX = 540, FW = 300;
    growthAxis(520, 50, 390);
    const FY = [56, 166];
    fr.forEach((f, i) => { const isNew = !(c.prev && c.prev.frames && c.prev.frames[i]) , s = isNew ? E(u, 0.2, 0.9) : 1;
      frame(FX, FY[i] + (1 - s) * 60, FW, 96, f.name, { top: f.top, vars: f.vars, op: s, varCol: /접근 불가/.test(f.vars.join()) ? OFF : INK }); });
    // pop 되는 greet
    if (k === 3) { const g = E(u, 0.3, 1.3); if (g < 1) frame(FX, FY[1] + g * 60, FW, 96, 'greet()', { top: true, vars: ['const char* who = "world"'], op: 1 - g }); }
    const topY = FY[fr.length - 1] + 96; ptr(FX + FW + 4, topY, 'rsp', ACC, 1);
    // 왼쪽: 문자열 리터럴과 출력
    if (k === 1 || k === 2) { card(200, 330, 200, 50, { rx: 8, text: '"world"', fs: 17, mono: true, fw: 800, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 0.6) : 1 });
      tx(200, 380, '읽기 전용 데이터 영역', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      el('path', { d: `M${FX + 24},${FY[1] + 52} C450,${FY[1] + 52} 420,330 302,330`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': `${(k === 1 ? E(u, 1.0, 1.8) : 1) * 400} 600` }); }
    if (k === 0) { mono(60, 120, 'int main(void) {', { 'font-size': 16 }); mono(80, 150, 'int n = 3;', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      tx(60, 210, '프로그램이 시작되면 main 프레임이 먼저 선다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); }
    if (k === 1) { mono(60, 120, 'greet("world");', { 'font-size': 17, 'font-weight': 800, fill: ACC }); tx(60, 160, '호출 = 새 프레임을 아래에 하나 더', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); }
    if (k === 2) { terminal(40, 60, 420, 90, ['$ ./callstack', 'hello, world'], 1 + E(u, 0.4, 1.2), {});
      tx(60, 200, 'greet 는 자기 프레임의 who 만 본다', { 'font-size': 15, fill: INK, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k === 3) { tx(60, 140, 'return → 프레임째 사라진다', { 'font-size': 17, 'font-weight': 800, fill: WARN }); tx(60, 176, 'free 를 부르지 않아도 지역변수가 정리된다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 4) { [[['main'], '시작'], [['main', 'greet'], '호출 → push'], [['main'], '반환 → pop']].forEach(([st, cap], i) => { const x = 70 + i * 140, s = pop(u, 0.2 + i * 0.4);
        st.forEach((n, j) => card(x, 110 + j * 46, 110, 40, { rx: 6, text: n, fs: 15, mono: true, fw: 800, stroke: j === st.length - 1 ? ACC : GRID, s }));
        tx(x, 230, cap, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); if (i < 2) grow(x + 58, 132, x + 80, 132, fade(u, 0.6 + i * 0.4), MUT); });
      tx(250, 300, '나중에 부른 것이 먼저 사라진다 (LIFO)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); }
  }

  // ---------- 2. 프레임 구성 ----------
  const SX = 560, SW = 220, SH = 46, ROW = (i) => 92 + i * 50;
  const PARTS = [['b = 3', '0x…e58', INFO], ['a = 2', '0x…e50', INFO], ['반환 주소', '0x…e48', WARN], ['저장된 rbp', '0x…e40', WARN], ['sum = 5', '0x…e38', GOOD]];
  function s2(t, c) { const { k, u } = c;
    tx(SX + SW / 2, 40, '주소는 예시 (8바이트 칸)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    el('rect', { x: SX, y: 50, width: SW, height: 34, rx: 4, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); tx(SX + 12, 72, 'main 프레임', { 'font-size': 14, fill: MUT });
    const shown = [2, 4, 5, 5, 5][k], prevShown = [0, 2, 4, 5, 5][k], gone = k === 4 ? E(u, 0.8, 1.8) : 0;
    PARTS.forEach(([s, a, col], i) => { if (i >= shown) return; const nu = i >= prevShown ? E(u, 0.2 + (i - prevShown) * 0.5, 0.8 + (i - prevShown) * 0.5) : 1; if (nu <= 0) return;
      const txt = i === 4 && k === 2 && u < 1.6 ? 'sum = ?' : s;
      slot(SX, ROW(i) - (1 - nu) * 20, SW, SH, txt, { addr: k === 3 ? null : a, stroke: col, color: col === INFO ? INK : col, op: nu * (1 - gone * 0.9), mono: i !== 2 && i !== 3 }); });
    if (k === 2) { fly(SX + SW / 2, ROW(1) + 23, SX + SW / 2, ROW(4) + 23, seg(u, 0.6, 1.5), '2 + 3', { mono: true }); }
    // rsp, rbp 화살표
    const rspRow = [2, 4, 5, 5, 0][k], prevRsp = [0, 2, 4, 5, 5][k], rY = (r) => (r === 0 ? 84 : ROW(r - 1) + SH);
    const rspY = k === 4 ? lerp(rY(5), 84, E(u, 0.8, 1.8)) : lerp(rY(prevRsp), rY(rspRow), E(u, 0.3, 1.3));
    ptr(SX + SW + 4, rspY, 'rsp', ACC, 1);
    const rbpY = k === 0 ? 67 : k === 1 ? lerp(67, ROW(3) + 23, E(u, 1.2, 2.0)) : k === 4 ? lerp(ROW(3) + 23, 67, E(u, 0.8, 1.8)) : ROW(3) + 23;
    ptr(SX + SW + 4, rbpY, 'rbp', WARN, 1);
    // 왼쪽 설명
    const L = 40;
    if (k === 0) { mono(L, 120, 'int r = add(2, 3);', { 'font-size': 17, 'font-weight': 800 }); tx(L, 160, '인자 2, 3 이 먼저 실린다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      tx(L, 250, '그림은 인자를 스택으로 넘기는 32비트 방식', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); tx(L, 274, 'x86-64 는 6개까지 레지스터(edi, esi…)로 넘긴다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 1) { tx(L, 120, '반환 주소: 끝나면 돌아갈 main 의 다음 줄', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(L, 152, '저장된 rbp: 호출 전 기준점 백업', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.1) }); tx(L, 196, 'rbp 가 그 자리로 옮겨 와 새 기준점이 된다', { 'font-size': 15, fill: INK, opacity: fade(u, 2.0) }); }
    if (k === 2) { tx(L, 120, 'rsp 를 더 빼서 지역변수 자리를 만든다', { 'font-size': 15, fill: INK, opacity: fade(u, 0.4) }); tx(L, 152, 'malloc 없이 프레임 안에 생긴다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 3) { const g = E(u, 0.3, 1.2), bx = SX - 92;
      el('path', { d: `M${SX - 4},${ROW(3) + 23} C${bx},${ROW(3) + 23} ${bx},${ROW(4) + 23} ${SX - 4},${ROW(4) + 23}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: g });
      mono(bx - 6, ROW(4) - 2, 'rbp - 8', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: g });
      tx(L, 120, 'rsp 는 push/pop 마다 움직이지만', { 'font-size': 15, opacity: fade(u, 0.6) }); tx(L, 146, 'rbp 는 함수가 도는 동안 고정이다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      card(210, 380, 340, 58, { rx: 8, text: '실제 clang -O0 x86-64: a → rbp-4, b → rbp-8\n레지스터로 받은 인자를 rbp 아래에 적는다', fs: 13.5, stroke: GRID, s: pop(u, 1.8) }); }
    if (k === 4) { slot(SX + 120, 54, 92, 26, 'r = 5', { stroke: GOOD, color: GOOD, op: fade(u, 1.8), mono: true, fs: 14 });
      tx(L, 120, 'return → 반환 주소로 돌아가고', { 'font-size': 15, opacity: fade(u, 0.3) }); tx(L, 146, '네 덩어리가 한꺼번에 정리된다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); }
  }

  // ---------- 3. 재귀 ----------
  function s3(t, c) { const { k, u } = c, fr = c.beat.frames || [], FX = 540, FW = 300, FH = 56, FY = (i) => 46 + i * 62, LIM = 380;
    el('line', { x1: FX - 20, y1: LIM, x2: FX + FW + 80, y2: LIM, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' });
    tx(FX + FW + 80, LIM + 20, '스택 한계 (스레드당 1~8MB)', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 });
    if (k === 5) { // 끝없는 재귀: 얇은 프레임이 한계까지
      const n = Math.floor(E(u, 0.1, 1.8) * 30); for (let i = 0; i < n; i++) { const y = 46 + i * 11; if (y > LIM) break; el('rect', { x: FX, y, width: FW, height: 9, rx: 2, fill: i % 2 ? ACCBG : WARNBG, stroke: WARN, 'stroke-width': 1 }); }
      if (u > 1.8) { card(FX + FW / 2, 200, 280, 54, { rx: 10, text: 'Segmentation fault', fs: 18, mono: true, fw: 800, fill: BADBG, stroke: BAD, color: BAD, s: pop(u, 1.8) }); }
      mono(40, 110, 'long f(int n) { return f(n+1); }', { 'font-size': 15, 'font-weight': 700 }); tx(40, 140, '종료 조건이 없어 프레임이 끝없이 쌓인다', { 'font-size': 14.5, fill: MUT });
      mono(40, 220, 'void g() { int big[1000000]; g(); }', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(40, 250, 'int 100만 개 = 프레임 하나에 4MB', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) });
      tx(40, 310, '깊은 재귀는 반복문이나 명시적 스택으로 바꾼다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    const pn = c.prev && c.prev.frames ? c.prev.frames.length : 0;
    const popN = k === 4 ? Math.min(3, Math.floor(E(u, 0.3, 2.0) * 3.4)) : 0;   // 안쪽부터 몇 개 사라졌나
    fr.forEach((f, i) => { if (k === 4 && i >= fr.length - popN && i > 0) return; const isNew = i >= pn, s = isNew ? E(u, 0.2, 0.8) : 1;
      let vars = f.vars; if (k === 4) { const res = ['result = 6', 'n = 3  → 6', 'n = 2  → 2', 'n = 1  → 1'][i]; vars = [i === 0 ? (popN >= 3 ? res : 'result = ?') : res]; }
      frame(FX, FY(i) + (1 - s) * 30, FW, FH, f.name, { top: f.top && k !== 4, vars: vars.slice(0, 1), op: s }); });
    const depth = k === 4 ? fr.length - 1 - popN : fr.length - 1;
    // 왼쪽: 깊이 막대
    tx(40, 60, '재귀 깊이', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 3; i++) el('rect', { x: 40 + i * 50, y: 74, width: 44, height: 26, rx: 4, fill: i < depth ? ACC : SOFT, opacity: 0.9 });
    mono(200, 94, String(depth), { 'font-size': 20, 'font-weight': 800, fill: ACC });
    const notes = [['main 이 factorial(3) 을 부른다', '아직 재귀는 시작 전'], ['먼저 n <= 1 을 검사', 'n = 3 이라 계속 내려간다'], ['안쪽 호출이 끝나야 곱할 수 있다', '바깥 프레임은 n 을 쥔 채 기다린다'],
      ['n = 1 에서 1 을 돌려준다', '프레임 4개, 스택을 가장 많이 쓰는 순간'], ['안쪽부터 pop 하며 곱해 올라간다', '1 → 2 → 6']][k];
    tx(40, 170, notes[0], { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.4) }); tx(40, 200, notes[1], { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
    if (k === 1) { card(FX + FW + 60, FY(1) + 28, 90, 36, { rx: 18, text: 'n<=1 ?', fs: 14, mono: true, stroke: WARN, s: pop(u, 0.4) }); cross(FX + FW + 60, FY(1) + 62, 8, pop(u, 1.0)); }
    if (k === 3) { el('rect', { x: FX - 8, y: FY(0) - 6, width: FW + 16, height: FY(3) + FH - FY(0) + 12, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.2) });
      tx(40, 260, '최대 깊이 × 프레임 크기 = 재귀의 메모리 비용', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); }
    if (k === 4) { mono(40, 280, 'factorial(3) = 6', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); }
  }

  // ---------- 4. 댕글링 ----------
  const BX = 560, BW = 20;
  function bytes(y, chars, o) { o = o || {}; chars.forEach((ch, i) => { const st = (o.style && o.style(i)) || {};
    el('rect', { x: BX + i * (BW + 2), y, width: BW, height: 30, rx: 3, fill: st.fill || PANEL, stroke: st.stroke || INK, 'stroke-width': 1.5, opacity: st.op ?? 1 });
    if (ch) mono(BX + i * (BW + 2) + BW / 2, y + 20, ch, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: st.color || INK, opacity: st.op ?? 1 }); }); }
  const HI = ['h', 'i', '\\0', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  function s4(t, c) { const { k, u } = c;
    // main 프레임 (위)
    frame(520, 40, 410, k >= 4 ? 120 : 80, 'main()', { top: k === 2 || k === 3 || k === 5 });
    if (k >= 2 && k <= 3) { slot(640, 68, 130, 36, 'p = 0x…e30', { mono: true, fs: 14, stroke: BAD, color: BAD }); }
    if (k >= 4) { tx(540, 96, 'char buf[16]', { 'font-size': 14, 'font-weight': 700, class: 'mono' });
      bytes(110, k === 5 || (k === 4 && u > 1.8) ? HI : Array(16).fill(''), { style: (i) => ({ stroke: GOOD, fill: i < 3 && (k === 5 || u > 1.8) ? GOODBG : PANEL }) }); }
    // 아래 프레임
    const FY2 = 150;
    if (k <= 3) { const dead = k >= 2 || (k === 1 && E(u, 0.9, 1.7) >= 1), fadeOut = k === 1 ? E(u, 0.9, 1.7) : dead ? 1 : 0;
      if (k === 3) { frame(520, FY2, 410, 130, 'another()', { top: true }); }
      else if (!dead || k === 1) frame(520, FY2, 410, 130, 'make_msg_bad()', { top: true, op: 1 - fadeOut * 0.75 });
      if (dead && k !== 3) { el('rect', { x: 520, y: FY2, width: 410, height: 130, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0.8 });
        tx(900, FY2 + 22, '이미 pop 된 자리', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'end' }); }
      tx(780, FY2 + 50, 'char buf[16]', { 'font-size': 14, 'font-weight': 700, class: 'mono', opacity: k === 3 ? 0.4 : 1 });
      const over = k === 3 ? E(u, 0.4, 1.6) : 0;
      bytes(FY2 + 62, HI.map((ch, i) => (i < over * 17 ? 'X' : ch)), { style: (i) => ({ op: dead && k !== 3 ? 0.55 : 1, stroke: i < over * 17 ? BAD : INK, color: i < over * 17 ? BAD : INK }) });
      mono(BX - 10, FY2 + 82, '0x…e30', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      if (k === 1) fly(760, FY2 + 22, 700, 86, seg(u, 0.3, 1.0), 'return 0x…e30', { mono: true, fill: WARN });
      if (k >= 2) { el('path', { d: `M705,104 C705,140 ${BX + 30},150 ${BX + 30},${FY2 + 60}`, fill: 'none', stroke: BAD, 'stroke-width': 2.6, 'stroke-dasharray': '6 5', 'marker-end': 'url(#ra-ahr)', opacity: k === 2 ? fade(u, 0.5) : 1 }); }
      if (k === 0) { tx(40, 120, '지역 배열은 이 프레임 소유', { 'font-size': 16, 'font-weight': 800 }); tx(40, 150, '함수가 도는 동안은 안전하다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); }
      if (k === 1) { mono(40, 120, 'return buf;', { 'font-size': 18, 'font-weight': 800, fill: WARN }); tx(40, 156, '곧 사라질 프레임의 주소를 내보낸다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); }
      if (k === 2) { tx(40, 120, '댕글링 포인터', { 'font-size': 20, 'font-weight': 800, fill: BAD }); tx(40, 152, '주소 값은 멀쩡해 보여서 눈으로는 모른다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); }
      if (k === 3) { tx(40, 120, '다른 호출이 같은 자리를 덮는다', { 'font-size': 16, 'font-weight': 800, fill: BAD }); tx(40, 150, 'p 로 읽으면 쓰레기가 나온다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
        terminal(40, 300, 440, 104, ['실행 예 (clang -O0, 윈도우)', '첫 printf 부터 깨진 글자가 찍혔다'], 2, { lh: 24 }); }
      return; }
    // k 4, 5: out 파라미터
    if (k === 4) { frame(520, 200, 410, 110, 'make_msg_ok(out, cap)', { top: true, vars: ['char* out  (main 의 buf 주소)'] });
      el('path', { d: 'M548,250 C470,250 470,125 556,125', fill: 'none', stroke: GOOD, 'stroke-width': 2.6, 'marker-end': 'url(#ra-ah)', opacity: fade(u, 0.8) });
      tx(40, 120, '호출자가 버퍼를 준다', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); tx(40, 150, '함수는 남의 방에 쓰기만 한다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); }
    if (k === 5) { el('rect', { x: 520, y: 200, width: 410, height: 110, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); tx(725, 260, 'make_msg_ok 는 끝났다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle' });
      terminal(40, 220, 400, 84, ['$ ./dangling', 'hi'], 1 + E(u, 0.5, 1.2), {});
      tx(40, 120, '버퍼 수명은 main 이 쥔다', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); tx(40, 150, 'main 이 사는 동안 늘 유효하다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); }
  }

  // ---------- 5. 스택과 힙 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { const cols = [['스택', ['프레임과 함께 자동 정리', '작다 (1~8MB)', '빠르다', '함수 안에서만 쓸 데이터'], ACC], ['힙', ['malloc / free 로 직접', '크다 (수 GB)', '느리다', '함수 밖으로 살릴 데이터'], INFO]];
      cols.forEach(([n, rows, col], i) => { const x = 250 + i * 460, s = pop(u, 0.2 + i * 0.3); card(x, 70, 360, 50, { rx: 10, text: n, fs: 20, fw: 800, stroke: col, color: col, fill: i ? INFOBG : ACCBG, s });
        rows.forEach((r, j) => tx(x, 150 + j * 52, r, { 'font-size': 16, 'font-weight': j === 3 ? 800 : 600, 'text-anchor': 'middle', fill: j === 3 ? col : INK, opacity: fade(u, 0.5 + j * 0.3 + i * 0.2) })); });
      ['수명', '크기', '속도', '고르는 기준'].forEach((s, j) => tx(480, 150 + j * 52, s, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.4 + j * 0.3) })); return; }
    zone(520, 36, 416, 220, '스택', { fill: SOFT }); zone(24, 250, 440, 160, '힙', { fill: INFOBG });
    frame(540, 64, 376, 64, 'main()', { top: k >= 1 });
    const mval = k >= 1 && (k > 1 || u > 1.6) ? 'm = 0x…2a0' : 'm = ?';
    slot(720, 82, 160, 34, k === 3 && u > 1.4 ? 'm (free 됨)' : mval, { mono: true, fs: 14, stroke: k === 3 && u > 1.4 ? MUT : INFO, color: k === 3 && u > 1.4 ? MUT : INFO });
    const heapLive = !(k === 3 && u > 1.4), filled = k >= 1 && (k > 1 || u > 0.6);
    if (k === 0) { frame(540, 140, 376, 100, 'make_msg_heap("hi")', { top: true, vars: ['char* buf = 0x…2a0'] }); }
    if (k === 1 && u < 1.4) frame(540, 140, 376, 100, 'make_msg_heap("hi")', { top: true, vars: ['strcpy(buf, s);', 'return buf;'], op: 1 - E(u, 0.8, 1.4) });
    if (k === 2) { const cyc = (E(u, 0.2, 2.4) * 2) % 1; frame(540, 140, 376, 64, 'another()', { op: Math.sin(cyc * Math.PI) }); tx(728, 232, '다른 호출이 와도 힙은 그대로', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); }
    // 힙 블록 3바이트
    const s0 = k === 0 ? pop(u, 0.5) : 1, hx = 120;
    ['h', 'i', '\\0'].forEach((ch, i) => { const x = hx + i * 60; el('rect', { x, y: 300, width: 54, height: 46, rx: 5, fill: heapLive ? PANEL : BADBG, stroke: heapLive ? INFO : BAD, 'stroke-width': 2, 'stroke-dasharray': heapLive ? null : '6 5', opacity: s0 });
      mono(x + 27, 330, filled && heapLive ? ch : heapLive ? '?' : '', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: s0 }); });
    mono(hx, 290, '0x…2a0', { 'font-size': 13.5, fill: MUT, opacity: s0 }); tx(hx + 200, 330, heapLive ? 'strlen("hi") + 1 = 3 바이트' : '반납됨', { 'font-size': 14, fill: heapLive ? MUT : BAD, 'font-weight': 700, opacity: s0 });
    if (heapLive) { const fromY = k === 0 ? 196 : 99, fromX = k === 0 ? 700 : 720; el('path', { d: `M${fromX},${fromY} C470,${fromY} 300,230 210,296`, fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)', opacity: k === 0 ? fade(u, 1.0) : 1 }); }
    if (k === 0) { mono(40, 80, 'malloc(strlen(s) + 1)', { 'font-size': 17, 'font-weight': 800, fill: INFO }); tx(40, 112, '힙은 어느 프레임에도 속하지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 1) { tx(40, 80, '프레임은 pop 돼도 힙 블록은 남는다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) }); tx(40, 112, '힙 주소는 반환해도 댕글링이 아니다', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 2) { tx(40, 80, 'm 으로 마음껏 쓴다', { 'font-size': 16, 'font-weight': 800 }); }
    if (k === 3) { mono(40, 80, 'free(m);', { 'font-size': 18, 'font-weight': 800, fill: WARN });
      tx(40, 116, '정확히 한 번만', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(40, 146, '빠뜨리면 누수, 두 번이면 double free', { 'font-size': 15, fill: BAD, opacity: fade(u, 2.0) }); }
  }

  const quiz = [
    { q: 'main이 greet를 부르고 greet가 반환하면 스택은 어떻게 되는가?',
      o: ['greet 프레임이 통째로 pop 되어 main 프레임만 남는다', 'main 프레임이 먼저 사라진다', '두 프레임이 그대로 남는다'], a: 0,
      why: '호출은 push, 반환은 pop이다. 나중에 쌓인 greet가 먼저 정리되는 LIFO 순서다.' },
    { q: '함수가 도는 동안 지역변수를 rbp - 8처럼 고정 오프셋으로 찾을 수 있는 이유는 무엇인가?',
      o: ['rsp가 절대 움직이지 않기 때문이다', 'rbp가 함수 안에서 기준점으로 고정되기 때문이다', '지역변수는 힙에 있기 때문이다'], a: 1,
      why: 'rsp는 push/pop마다 움직인다. 프롤로그에서 정한 rbp는 함수가 끝날 때까지 그대로라 기준으로 쓰기 좋다.' },
    { q: 'factorial(3)을 부를 때 스택에 동시에 살아 있는 프레임은 최대 몇 개인가 (main 포함)?',
      o: ['2개', '3개', '4개'], a: 2,
      why: 'main, factorial(3), factorial(2), factorial(1)이 n = 1에서 한꺼번에 쌓여 있다. 이 최대 깊이가 메모리 비용이다.' },
    { q: 'make_msg_bad가 return buf; 로 지역 배열 주소를 돌려줬다. 받은 포인터 p의 상태는?',
      o: ['힙으로 옮겨져 안전하다', '이미 pop 된 스택 자리를 가리키는 댕글링 포인터다', 'NULL이 되어 바로 에러가 난다'], a: 1,
      why: 'buf는 make_msg_bad 프레임 안에 있었다. 프레임이 사라진 뒤 그 자리는 다른 호출이 덮을 수 있다.' },
    { q: '함수 밖으로 오래 살려야 하는 문자열은 어디에 두어야 하는가?',
      o: ['malloc으로 힙에 두고 호출자가 free 한다', '함수 안의 지역 배열', '더 큰 지역 배열'], a: 0,
      why: '힙 블록은 프레임과 무관하게 살아 있다. 대신 자동 정리가 없어 free를 정확히 한 번 불러야 한다.' },
  ];

  const summary = [
    '함수를 부르면 프레임이 스택에 쌓이고, 반환하면 나중에 쌓인 것부터 사라진다.',
    '프레임에는 인자, 반환 주소, 저장된 rbp, 지역변수가 들고, rbp 기준 오프셋으로 찾는다.',
    'factorial(3)은 프레임 4개를 쌓고, 끝없는 재귀는 1~8MB 스택을 다 써서 죽는다.',
    '지역 배열 주소를 반환하면 사라진 프레임을 가리킨다. 오래 쓸 값은 힙에 두고 free 한다.',
  ];
  const review = [
    { q: '테스트에서는 잘 되던 문자열 함수가 다른 함수를 하나 더 부른 뒤부터 가끔 깨진 글자를 찍는다. 먼저 의심할 것은?',
      o: ['함수가 지역 배열의 주소를 반환하고 있다', 'printf의 버퍼가 작다', '스택 한계가 8MB를 넘었다'], a: 0,
      why: '반환된 주소가 pop 된 프레임 자리라 다른 호출이 그 자리를 덮으면 값이 바뀐다. out 버퍼나 malloc으로 고친다.' },
    { q: '재귀로 짠 트리 순회가 깊이 수만에서 Segmentation fault로 죽는다. 맞는 처방은?',
      o: ['지역변수를 늘린다', '반복문과 명시적 스택으로 바꿔 콜 스택 깊이를 줄인다', '함수를 static으로 바꾼다'], a: 1,
      why: '재귀 깊이만큼 프레임이 동시에 살아 있어 스택이 바닥난다. 깊이를 콜 스택이 아닌 힙의 자료구조로 옮긴다.' },
    { q: '함수 안에 int big[1000000]; 을 선언했더니 실행하자마자 죽는다. 왜인가?',
      o: ['int가 너무 작아서', '배열이 힙에 잡혀 free가 필요해서', '프레임 하나에 4MB를 잡아 스택 한계에 닿아서'], a: 2,
      why: '지역 배열은 프레임 안에 들어간다. 스택은 스레드당 1~8MB라 4MB 배열 하나로도 넘칠 수 있으니 힙이나 static으로 옮긴다.' },
  ];

  R.page({ title: '콜 스택과 프레임', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
