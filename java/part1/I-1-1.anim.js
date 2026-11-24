/* I-1-1 JVM·JRE·JDK — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 바이트 값(CA FE BA BE, major 65/61, B2 00 07 …)은 JVM 명세의 class 파일 형식과 페이지의 javap 출력(#7 #13 #15)에서 나온다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, p) => s.slice(0, Math.round(s.length * clamp(p)));

  // 문서 한 장 (왼쪽 위 x, y). 오른쪽 위 모서리가 접힌 종이 + 맨 위 파일 이름
  function doc(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1, col = o.stroke || INK, f = 16;
    el('path', { d: `M${x},${y} H${x + w - f} L${x + w},${y + f} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round', opacity: op });
    el('path', { d: `M${x + w - f},${y} V${y + f} H${x + w}`, fill: 'none', stroke: col, 'stroke-width': 1.5, opacity: op });
    if (name) { mono(x + 12, y + 22, name, { 'font-size': o.fs || 15, 'font-weight': 700, fill: o.nameCol || col, opacity: op });
      el('line', { x1: x, y1: y + 32, x2: x + w - f, y2: y + 32, stroke: GRID, 'stroke-width': 1.5, opacity: op }); } }
  function cpu(cx, cy, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    for (let i = -2; i <= 2; i++) { const d = i * 13; [[d, -46, d, -34], [d, 34, d, 46], [-46, d, -34, d], [34, d, 46, d]].forEach(([a, b, p, q]) => el('line', { x1: a, y1: b, x2: p, y2: q, stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round' }, g)); }
    el('rect', { x: -34, y: -34, width: 68, height: 68, rx: 6, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    tx(0, 6, 'CPU', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: c }, g); return g; }
  // 사각 테두리가 선처럼 그려지며 나타남 (u 0→1)
  function drawRect(x, y, w, h, u, o) { o = o || {}; if (u <= 0) return; el('rect', { x, y, width: w, height: h, rx: o.rx ?? 12, fill: o.fill || 'none', stroke: o.stroke || INK, 'stroke-width': o.sw || 2.2, pathLength: 100, 'stroke-dasharray': u >= 1 ? (o.dash || null) : `${u * 100} 100`, 'fill-opacity': u >= 1 ? 1 : 0 }); }

  // ---------- 1. .java 는 글자 파일 ----------
  const SX = 40, SY = 36, SW = 470, SH = 236, LH = 28, CH = 9;   // 코드 15px 고정폭 → 글자 하나 9px
  const lineY = (i) => SY + 64 + i * LH;
  function srcDoc(c) { const { k, u } = c, lines = c.beat.source.lines, prev = c.prev ? c.prev.source.lines : [];
    doc(SX, SY, SW, SH, 'Hello.java', { op: k === 0 ? fade(u, 0, 0.3) : 1 });
    let n = 0; lines.forEach((s, i) => { const fresh = !prev.includes(s), a = 0.3 + n * 0.55; if (fresh) n++;
      mono(SX + 20, lineY(i), fresh ? typed(s, seg(u, a, a + 0.5)) : s, { 'font-size': 15, fill: INK }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 3) el('rect', { x: SX + 10, y: lineY(2) - 19, width: SW - 30, height: 26, rx: 5, fill: ACCBG, opacity: fade(u, 0.2) });
    srcDoc(c);
    if (k === 0) { const s = fade(u, 1.3);
      el('rect', { x: SX + 10, y: SY + 6, width: 5 * CH + 4, height: 22, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: s });
      el('rect', { x: SX + 18 + 13 * CH, y: lineY(0) - 17, width: 5 * CH + 4, height: 22, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: s });
      el('path', { d: `M${SX + 34},${SY + 28} C${SX + 34},${SY + 52} ${SX + 140},${SY + 30} ${SX + 140},${lineY(0) - 17}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: s });
      pill(735, 110, '클래스 이름 = 파일 이름', ACC, pop(u, 1.6), { fs: 15 });
      sub(735, 160, '다르면 javac가 컴파일하지 않는다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) { const parts = [['public', 2, 'JVM(밖)이 부른다'], ['static', 9, '객체 없이 부른다'], ['void', 16, '돌려줄 값 없음'], ['main', 21, '약속된 이름'], ['String[] args', 26, '명령행 인자']];
      parts.forEach(([w, at, why], i) => { const a = 0.9 + i * 0.32, s = pop(u, a), y = 66 + i * 52;
        el('line', { x1: SX + 20 + at * CH, y1: lineY(1) + 6, x2: SX + 20 + (at + w.length) * CH, y2: lineY(1) + 6, stroke: ACC, 'stroke-width': 3, opacity: fade(u, a) });
        pill(640, y, w, ACC, s, { mono: true, fs: 14 }); tx(722, y + 5, why, { 'font-size': 15, opacity: fade(u, a + 0.1) }); check(910, y, 9, s); });
      sub(735, 340, '다섯 개가 다 맞아야 JVM이 찾는다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const s = pop(u, 1.3);
      card(800, lineY(1) - 5, 150, 58, { text: 'JVM', fs: 18, fw: 800, stroke: INFO, color: INFO, s });
      grow(722, lineY(1) - 5, SX + SW + 6, lineY(1) - 5, E(u, 1.5, 2.1), ACC);
      tx(800, lineY(1) + 52, 'main 부터 호출한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      pill(625, lineY(1) - 34, '진입점', ACC, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 3) { const gx = 560;
      terminal(gx + 40, 60, 330, 150, [['$ (아직 실행 전)', 'var(--term)']], 1, { title: 'console' });
      if (Math.floor(t * 2) % 2) el('rect', { x: gx + 58, y: 116, width: 9, height: 16, fill: OFF });
      const p = E(u, 0.6, 1.6), back = E(u, 1.6, 2.1); fly(SX + 300, lineY(2) - 5, 548, lineY(2) - 5, p - back * 0.25 + (p >= 1 ? 0 : 0), 'println', { mono: true, stay: true });
      el('line', { x1: 575, y1: 236, x2: 575, y2: 300, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.4) });
      sub(770, 260, '글자일 뿐, 출력은 아직 없다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    // k4: CPU 는 글자를 못 읽는다 + C/C++ 와 Java 의 길
    cpu(800, 130, { s: pop(u, 0.2) });
    'public'.split('').forEach((ch, i) => { const a = 0.4 + i * 0.12, p = seg(u, a, a + 0.6); if (p > 0 && p < 1) mono(lerp(SX + 38 + i * CH, 740, E(p, 0, 1)), lerp(lineY(0) - 5, 130 + (i - 2.5) * 8, E(p, 0, 1)), ch, { 'font-size': 16, 'font-weight': 800, fill: ACC }); });
    cross(860, 70, 11, pop(u, 1.3)); sub(800, 205, '글자를 직접 실행하지 못한다', fade(u, 1.4), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    const r1 = 318, r2 = 378;
    tx(40, r1 + 5, 'C / C++', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.5) });
    pill(170, r1, '.c', INK, pop(u, 1.6), { mono: true });
    const outs = [['Windows 실행파일', 300], ['macOS 실행파일', 450], ['Linux 실행파일', 590]];
    outs.forEach(([s, x], i) => grow(190, r1, x - 62, r1, E(u, 1.7 + i * 0.15, 2.0 + i * 0.15), MUT));
    outs.forEach(([s, x], i) => pill(x, r1, s, BAD, pop(u, 1.9 + i * 0.15), { fs: 13.5 }));
    tx(680, r1 + 5, 'OS마다 다시 빌드', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.3) });
    tx(40, r2 + 5, 'Java', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.9) });
    pill(170, r2, '.java', INK, pop(u, 2.0), { mono: true }); grow(206, r2, 252, r2, E(u, 2.1, 2.3), MUT);
    pill(292, r2, '.class', ACC, pop(u, 2.2), { mono: true }); grow(330, r2, 380, r2, E(u, 2.3, 2.5), MUT);
    pill(455, r2, '각 OS의 JVM', GOOD, pop(u, 2.4), { fs: 13.5 });
    tx(680, r2 + 5, '한 번 컴파일', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.5) }); }

  // ---------- 2. javac: .java → .class ----------
  const HEX = ['CA FE BA BE', '00 00 00 41'];
  function classDoc(x, y, o) { o = o || {}; doc(x, y, 200, 118, 'Hello.class', { stroke: ACC, op: o.op });
    HEX.forEach((h, i) => mono(x + 16, y + 60 + i * 26, o.type != null ? typed(h, o.type - i) : h, { 'font-size': 15, 'font-weight': 700, fill: i === 1 && o.hiMajor ? WARN : INK, opacity: o.op ?? 1 }));
    mono(x + 140, y + 86, '…', { 'font-size': 15, fill: MUT, opacity: o.op ?? 1 }); }
  function s2(t, c) { const { k, u } = c, J = [40, 70], K = [300, 129], L = [400, 70];
    if (k <= 1) { const op = 1;
      if (k === 1) zone(24, 30, 600, 190, '작업 폴더', { fill: 'none', stroke: MUT, dash: '6 5', op: fade(u, 0.2) });
      doc(J[0], J[1], 170, 118, 'Hello.java', { op });
      [0, 1, 2].forEach((i) => el('rect', { x: J[0] + 16, y: J[1] + 48 + i * 20, width: [120, 136, 70][i], height: 7, rx: 3, fill: OFF, opacity: op }));
      card(K[0], K[1], 104, 52, { text: 'javac', mono: true, fs: 16, fw: 800, stroke: k === 1 ? GRID : INK, color: k === 1 ? MUT : INK });
      if (k === 0) { for (let i = 0; i < 6; i++) dot([[210, 129], [248, 129], [352, 129], [398, 129]], seg(u, 0.2 + i * 0.12, 1.0 + i * 0.12), i % 2 ? ACC : INK, 5);
        pill(K[0], 70, '문법 검사 통과', GOOD, pop(u, 0.7), { fs: 13.5 });
        classDoc(L[0], L[1], { op: fade(u, 1.1), type: clamp((u - 1.2) * 1.4) * 2 });
        tx(650, 112, 'CA FE BA BE', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 2.0) });
        tx(650, 140, '모든 .class 파일의 첫 4바이트', { 'font-size': 15, opacity: fade(u, 2.1) });
        tx(650, 166, '사람이 읽는 글자가 아니다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
      classDoc(L[0], L[1], {});
      terminal(650, 50, 285, 120, ['$ ls', 'Hello.java   Hello.class'], k === 1 ? 0.6 + E(u, 0.3, 1.4) * 1.4 : 2, { title: 'terminal' });
      tx(320, 268, '원본은 그대로, 산출물 하나가 늘었다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(320, 296, '배포할 때 넘기는 것은 .class (또는 .jar)', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2 || k === 3) { const mv = k === 2 ? E(u, 0.1, 0.9) : 1;
      classDoc(lerp(L[0], 30, mv), lerp(L[1], 50, mv), {});
      const ls = ['$ javap -c Hello', 'public static void main(java.lang.String[]);'], ins = ['  0: getstatic     #7   // Field System.out', '  3: ldc           #13  // String "Hello, JVM!"', '  5: invokevirtual #15  // Method println', '  8: return'];
      if (k === 2) { grow(236, 110, 262, 110, E(u, 0.9, 1.2), MUT); if (u > 0.9) terminal(270, 40, 660, 200, ls, 0.4 + E(u, 1.0, 2.2) * 1.6, { title: 'javap' });
        sub(600, 290, '이진 파일을 JVM 명령어 이름으로 풀어 보여 준다', fade(u, 2.2), { 'font-size': 15 }); return; }
      terminal(270, 40, 660, 196, ls.slice(1).concat(ins), 1 + E(u, 0.1, 1.2) * 4, { title: 'javap -c Hello', fs: 14 });
      const B = [['B2', 0], ['00', 0], ['07', 0], ['12', 1], ['0D', 1], ['B6', 2], ['00', 2], ['0F', 2], ['B1', 3]], col = [ACC, INFO, GOOD, WARN], nm = ['getstatic', 'ldc', 'invokevirtual', 'return'];
      tx(30, 300, 'main 의 바이트 9개', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      B.forEach(([h, g], i) => { const x = 270 + i * 64, s = clamp((u - 1.3) * 6 - i * 0.6);
        if (s > 0) card(x + 28, 300, 56, 40, { rx: 6, text: h, mono: true, fs: 15, fw: 700, stroke: col[g], color: col[g], s: 0.5 + 0.5 * s });
        if ([0, 3, 5, 8].includes(i)) mono(x + 28, 340, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5 + i * 0.1) }); });
      [[0, 3], [3, 5], [5, 8], [8, 9]].forEach(([a, b], g) => { const x0 = 270 + a * 64, x1 = 270 + b * 64 - 8, op = fade(u, 1.9 + g * 0.12);
        el('path', { d: `M${x0},262 V256 H${x1} V262`, fill: 'none', stroke: col[g], 'stroke-width': 2, opacity: op });
        tx((x0 + x1) / 2, 250, nm[g], { 'font-size': 13.5, 'font-weight': 700, fill: col[g], 'text-anchor': 'middle', class: 'mono', opacity: op }); });
      tx(480, 392, '오프셋 0 · 3 · 5 · 8 = 명령어 길이 3 · 2 · 3 · 1바이트. CPU 명령어는 하나도 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    // k4: 버전 함정과 --release
    const y1 = 110, y2 = 300;
    tx(40, 52, '실행할 JVM이 Java 17일 때', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    card(150, y1, 200, 70, { text: 'Hello.class\nmajor 65 (Java 21)', fs: 15, stroke: WARN, mono: false, s: pop(u, 0.2) });
    grow(252, y1, 420, y1, E(u, 0.5, 1.0), BAD); card(500, y1, 150, 56, { text: 'Java 17 JVM', fs: 15, s: pop(u, 0.5) });
    cross(600, y1, 12, pop(u, 1.0)); mono(625, y1 + 5, 'UnsupportedClassVersionError', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) });
    sub(500, y1 + 52, 'Java 17 JVM이 읽는 class 버전은 61까지', fade(u, 1.2), { 'font-size': 14 });
    mono(40, 222, '$ javac --release 17 Hello.java', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
    card(150, y2, 200, 70, { text: 'Hello.class\nmajor 61 (Java 17)', fs: 15, stroke: GOOD, s: pop(u, 1.6) });
    grow(252, y2, 420, y2, E(u, 1.8, 2.2), ACC); card(500, y2, 150, 56, { text: 'Java 17 JVM', fs: 15, s: pop(u, 1.8) });
    check(600, y2, 12, pop(u, 2.2)); tx(625, y2 + 5, '실행된다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) }); }

  // ---------- 3. JVM 내부 ----------
  const JV = { x: 210, y: 36, w: 730, h: 370 }, LD = [225, 76, 135, 150], MA = [375, 76, 330, 64], HP = [375, 154, 210, 236], ST = [597, 154, 108, 236], EN = [720, 76, 208, 314];
  function jvmFrame(c, o) { o = o || {}; const { k, u } = c;
    drawRect(JV.x, JV.y, JV.w, JV.h, k === 0 ? E(u, 0.6, 1.8) : 1, { stroke: INFO, sw: 2.5, rx: 14 });
    const op = k === 0 ? fade(u, 1.6) : 1;
    tx(JV.x + 14, JV.y + 26, 'JVM', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: op });
    const box = ([x, y, w, h], name, hot, extra) => { el('rect', { x, y, width: w, height: h, rx: 8, fill: hot ? ACCBG : SOFT, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.2 : 1.5, opacity: op });
      tx(x + 10, y + 21, name, { 'font-size': 14, 'font-weight': 700, fill: hot ? ACC : MUT, opacity: op }); if (extra) tx(x + 10, y + h - 10, extra, { 'font-size': 13.5, fill: MUT, opacity: op * (o.tags ?? 1) }); };
    box(LD, '클래스로더', o.hot === 'ld'); if (o.only === 'ld') return;
    box(MA, 'Method Area · 클래스 정보', o.hot === 'ma'); box(HP, 'Heap', o.hot === 'hp', '공유 · GC 대상'); box(ST, 'Stack', o.hot === 'st', '스레드마다');
    el('rect', { x: EN[0], y: EN[1], width: EN[2], height: EN[3], rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: op });
    tx(EN[0] + 10, EN[1] + 21, '실행 엔진', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op }); }
  const EY = [EN[1] + 50, EN[1] + 170, EN[1] + 280];
  const eng = (i, name, on, col) => card(EN[0] + EN[2] / 2, EY[i], EN[2] - 24, 50, { rx: 8, text: name, fs: 15, stroke: on ? col : GRID, color: on ? col : MUT, fill: on ? PANEL : SOFT, sw: on ? 2.4 : 1.5 });
  function frameMain(o) { o = o || {}; const s = o.s ?? 1, y = ST[1] + ST[3] - 60 - (1 - s) * 140;
    card(ST[0] + ST[2] / 2, y, ST[2] - 16, 50, { rx: 6, text: 'main\nargs', fs: 14, stroke: ACC, color: INK, op: s > 0 ? 1 : 0 });
    return y; }
  function heapObj(x, y, s, o) { o = o || {}; card(x, y, o.w || 150, 40, { rx: 8, text: s, fs: 14, mono: true, stroke: o.stroke || INK, color: o.color || INK, fill: o.fill, s: o.s, op: o.op }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 5) { // 로드 실패: 그 뒤 단계는 시작도 못 한다
      jvmFrame(c, { only: 'ld', hot: 'ld' });
      zone(20, 120, 172, 150, 'classpath', { fill: PANEL, stroke: GRID });
      doc(40, 160, 130, 80, 'Hello.class', { fs: 14 });
      const p = E(u, 0.3, 1.2); pill(lerp(292, 90, p), lerp(130, 300, p), 'Helo ?', BAD, 1, { mono: true, fs: 14 });
      cross(160, 300, 12, pop(u, 1.2)); tx(106, 340, '없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      terminal(380, 76, 548, 150, ['$ java Helo', ['Error: Could not find or load main class Helo', '#fca5a5'], ['Caused by: java.lang.ClassNotFoundException: Helo', '#fca5a5']], 1 + E(u, 1.3, 2.3) * 2, { fs: 13.5 });
      tx(654, 270, 'Heap · Stack · 실행 엔진은 시작도 못 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
      tx(654, 300, '먼저 볼 곳: 클래스 이름 · classpath · 패키지 경로', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.5) }); return; }
    jvmFrame(c, { hot: ['', 'ld', 'st', '', '', ''][k] });
    terminal(14, 250, 186, 150, ['$ java Hello', 'Hello, JVM!'], k === 0 ? 0.3 + E(u, 0.2, 2.4) * 1.7 : 2, { fs: 13.5 });
    // 클래스로더: classpath 에서 읽어 Method Area 로
    if (k === 0) return;
    const loaded = k > 1 || u > 2.2;
    if (k === 1) { doc(14, 70, 120, 74, 'Hello.class', { fs: 13.5, op: 1 - fade(u, 0.5, 0.3) }); fly(74, 130, LD[0] + 66, 150, seg(u, 0.4, 1.0), 'Hello.class', { mono: true });
      ['로드', '링크·검증', '초기화'].forEach((s, i) => pill(LD[0] + 66, 130 + i * 34, s, ACC, pop(u, 1.0 + i * 0.3), { fs: 13.5 }));
      fly(LD[0] + 120, 115, MA[0] + 150, MA[1] + 44, seg(u, 1.9, 2.5), 'Hello', { mono: true }); }
    if (loaded) { pill(MA[0] + 90, MA[1] + 44, 'Hello · main()', INK, 1, { mono: true, fs: 13.5 }); pill(MA[0] + 250, MA[1] + 44, 'static', MUT, 1, { mono: true, fs: 13.5 }); }
    if (k === 1) return;
    // Stack 의 main 프레임 + Heap 의 args 배열
    const fy = frameMain({ s: k === 2 ? E(u, 0.2, 0.9) : 1 });
    const hs = k === 2 ? pop(u, 1.0) : 1; heapObj(HP[0] + 105, HP[1] + 70, 'String[0] args', { s: hs });
    grow(ST[0] + 8, fy + 8, HP[0] + 182, HP[1] + 78, k === 2 ? E(u, 1.3, 1.8) : 1, ACC);
    if (k === 2) { tx(HP[0] + 105, HP[1] + 130, 'new 로 만든 객체는 여기', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      eng(0, '인터프리터', false); eng(1, 'JIT 컴파일러', false); eng(2, 'GC', false); return; }
    // k3: 인터프리터 → 핫스팟 → JIT
    if (k === 3) { eng(0, '인터프리터', true, INFO); eng(1, 'JIT 컴파일러', u > 1.6, GOOD); eng(2, 'GC', false);
      ['getstatic', 'ldc', 'invokevirtual', 'return'].forEach((s, i) => dot([[MA[0] + 300, MA[1] + 44], [EN[0] + 20, EY[0]]], seg(u, 0.2 + i * 0.2, 0.8 + i * 0.2), INFO, 5));
      const h = E(u, 0.3, 1.6); el('rect', { x: EN[0] + 14, y: EY[0] + 34, width: (EN[2] - 28) * h, height: 8, rx: 4, fill: h > 0.95 ? ACC : WARN });
      tx(EN[0] + 14, EY[0] + 64, '자주 돌면 핫스팟', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
      grow(EN[0] + 104, EY[0] + 72, EN[0] + 104, EY[1] - 28, E(u, 1.5, 1.8), ACC);
      pill(EN[0] + 104, EY[1] + 54, '기계어 캐시', GOOD, pop(u, 2.0), { fs: 13.5, fill: PANEL }); return; }
    // k4: 로그로 보는 JIT · GC
    eng(0, '인터프리터', true, INFO); eng(1, 'JIT 컴파일러', true, GOOD); eng(2, 'GC', true, GOOD);
    const objs = [[HP[0] + 60, HP[1] + 140, true], [HP[0] + 150, HP[1] + 140, false], [HP[0] + 60, HP[1] + 190, false], [HP[0] + 150, HP[1] + 190, true]];
    const sweep = E(u, 1.2, 2.2);
    objs.forEach(([x, y, live], i) => { const gone = !live && sweep > (i === 1 ? 0.3 : 0.7); if (gone) return;
      card(x, y, 74, 34, { rx: 6, text: live ? '사용 중' : '버려짐', fs: 13.5, stroke: live ? INK : OFF, color: live ? INK : MUT, dash: live ? null : '4 3', s: pop(u, 0.2 + i * 0.12) }); });
    el('line', { x1: HP[0] + 10 + sweep * 190, y1: HP[1] + 110, x2: HP[0] + 10 + sweep * 190, y2: HP[1] + 215, stroke: GOOD, 'stroke-width': 3, opacity: sweep > 0 && sweep < 1 ? 1 : 0 });
    pill(EN[0] + 104, EY[0] + 60, '-XX:+PrintCompilation', GOOD, pop(u, 0.5), { mono: true, fs: 13.5, fill: PANEL });
    pill(EN[0] + 104, EY[1] + 54, '-Xlog:gc', GOOD, pop(u, 0.9), { mono: true, fs: 13.5, fill: PANEL }); }

  // ---------- 4. Write Once, Run Anywhere ----------
  const OS = [['Windows', 'java.exe (HotSpot)', 'C:\\app> java Hello', '\\', 'CRLF'], ['macOS', 'java (HotSpot)', '$ java Hello', '/', 'LF'], ['Linux', 'java (HotSpot)', '$ java Hello', '/', 'LF']];
  const MX = [170, 480, 790];
  function machine(i, on, c, o) { o = o || {}; const x = MX[i], [os, jvm, cmd] = OS[i], col = on ? INK : OFF;
    el('rect', { x: x - 135, y: 150, width: 270, height: 120, rx: 10, fill: on ? 'var(--ink)' : SOFT, stroke: on ? 'none' : GRID, 'stroke-width': 1.5, 'stroke-dasharray': on ? null : '5 4' });
    if (on) { mono(x - 120, 182, cmd, { 'font-size': 14, fill: PANEL }); mono(x - 120, 210, typed('Hello, JVM!', o.out ?? 1), { 'font-size': 14, fill: 'var(--term)' }); }
    card(x, 298, 270, 40, { rx: 8, text: jvm, fs: 14.5, stroke: on ? ACC : GRID, color: on ? ACC : MUT, fill: on ? ACCBG : PANEL, sw: on ? 2.2 : 1.5 });
    card(x, 344, 270, 40, { rx: 8, text: os, fs: 15, fw: 800, stroke: col, color: col }); }
  function s4(t, c) { const { k, u } = c, top = k >= 5 ? 1 - fade(u, 0.2) : 1;
    // 위: 컴파일 한 번
    if (top > 0) { card(300, 62, 130, 40, { rx: 8, text: 'Hello.java', mono: true, fs: 14, op: top }); grow(368, 62, 420, 62, k === 0 ? E(u, 0.3, 0.7) : 1, MUT, { op: top });
      mono(395, 48, 'javac', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: top });
      card(500, 62, 150, 44, { rx: 8, text: 'Hello.class', mono: true, fs: 15, fw: 800, stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.7) : 1, op: top });
      tx(600, 67, k === 0 ? '산출물은 하나뿐' : '같은 파일을 복사', { 'font-size': 15, 'font-weight': 700, opacity: top * (k === 0 ? fade(u, 1.2) : 1) }); }
    const on = (i) => k >= 4 || (k >= 1 && i < k) || (k === i + 1 && u > 1.0);
    OS.forEach((_, i) => { const live = on(i), justNow = k === i + 1; machine(i, live, c, { out: justNow ? seg(u, 1.4, 2.0) : 1 });
      if (justNow) fly(500, 84, MX[i], 150, seg(u, 0.1, 1.0), 'Hello.class', { mono: true });
      if (live && (k >= 3 && !(k === 3 && i === 2 && u < 2.0))) check(MX[i] + 112, 205, 10, k === 3 && i === 2 ? pop(u, 2.0) : 1); });
    if (k === 3) tx(480, 128, '세 JVM은 서로 다른 프로그램, 출력은 같다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) });
    if (k === 4) { OS.forEach((_, i) => { const x = MX[i];
        fly(x - 70, 240, x - 70, 400, seg(u, 0.3 + i * 0.25, 1.2 + i * 0.25), 'getstatic …', { mono: true, fill: ACC });
        if (u > 1.3 + i * 0.25) pill(x, 397, '이 OS·CPU용 기계어', GOOD, pop(u, 1.3 + i * 0.25), { fs: 13.5, fill: PANEL }); });
      tx(480, 128, 'OS 차이를 흡수하는 쪽은 내 코드가 아니라 JVM', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 5) { OS.forEach(([, , , sep, nl], i) => { const x = MX[i], s = pop(u, 0.5 + i * 0.2);
        pill(x - 60, 400, '경로 ' + sep, WARN, s, { fs: 13.5, mono: true, fill: PANEL }); pill(x + 60, 400, nl, WARN, s, { fs: 13.5, mono: true, fill: PANEL }); });
      pill(300, 62, 'Paths.get(...)', GOOD, pop(u, 1.4), { mono: true, fs: 14 }); pill(560, 62, 'System.lineSeparator()', GOOD, pop(u, 1.7), { mono: true, fs: 14 });
      tx(480, 118, 'OS 관습은 표준 API로 처리한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); } }

  // ---------- 5. JDK ⊃ JRE ⊃ JVM ----------
  function s5(t, c) { const { k, u } = c;
    // 포함 관계 상자
    const jdkOn = k >= 1, jdkU = k === 1 ? E(u, 0.8, 1.8) : 1;
    if (jdkOn) drawRect(24, 26, 540, 380, jdkU, { stroke: ACC, sw: 2.6, rx: 16, fill: ACCBG });
    else el('rect', { x: 24, y: 26, width: 540, height: 380, rx: 16, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '7 6' });
    tx(44, 56, jdkOn ? 'JDK · 개발용' : 'JDK ?', { 'font-size': 16, 'font-weight': 800, fill: jdkOn ? ACC : MUT, opacity: jdkOn ? fade(u, k === 1 ? 1.5 : 0) : 1 });
    if (jdkOn) ['javac', 'javap', 'jar', 'jdb', 'javadoc'].forEach((s, i) => pill(200 + i * 78, 50, s, ACC, k === 1 ? pop(u, 1.6 + i * 0.12) : 1, { mono: true, fs: 13.5, fill: PANEL }));
    const jre = k === 0 ? E(u, 0.3, 1.0) : 1;
    drawRect(50, 92, 488, 290, jre, { stroke: INFO, sw: 2.4, rx: 14, fill: INFOBG });
    tx(70, 120, 'JRE · 실행용', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: k === 0 ? fade(u, 0.8) : 1 });
    ['java.lang', 'java.util', 'java.io'].forEach((s, i) => pill(256 + i * 92, 114, s, INFO, k === 0 ? pop(u, 0.9 + i * 0.12) : 1, { mono: true, fs: 13.5, fill: PANEL }));
    drawRect(76, 156, 436, 200, k === 0 ? E(u, 0.2, 0.8) : 1, { stroke: INK, sw: 2.4, rx: 12, fill: PANEL });
    tx(96, 186, 'JVM · 실행 엔진', { 'font-size': 16, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.6) : 1 });
    ['클래스로더', '실행 엔진', 'GC'].forEach((s, i) => card(160 + i * 135, 280, 120, 48, { rx: 8, text: s, fs: 15, stroke: GRID, s: k === 0 ? pop(u, 0.7 + i * 0.12) : 1 }));
    // 오른쪽: 터미널과 beat 별 그림
    const RX = 584, RW = 352, term = [['$ java -version', 'openjdk version "21.0.3" 2024-04-16 LTS'], ['$ javac -version', 'javac 21.0.3'], ['$ java -version', 'openjdk version "21.0.3"', '$ javac -version', 'javac 21.0.3'], null, ['$ sdk use java 17.0.11-tem'], null][k];
    if (term) terminal(RX, 26, RW, k === 2 ? 150 : 110, term, k <= 1 || k === 4 ? 0.4 + E(u, 0.2, 1.2) * (term.length - 0.4) : term.length, { fs: 13.5 });
    if (k === 0) { tx(RX + RW / 2, 175, 'JVM · JRE는 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
      tx(RX + RW / 2, 203, '컴파일러가 있는지는 아직 모른다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { tx(RX + RW / 2, 175, 'javac가 답하면 JDK', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { const s = pop(u, 0.6); pill(RX + 80, 230, 'java 21.0.3', INK, s, { mono: true }); tx(RX + 176, 236, '=', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      pill(RX + 270, 230, 'javac 21.0.3', INK, s, { mono: true }); check(RX + RW / 2, 280, 12, pop(u, 1.3));
      tx(RX + RW / 2, 330, '실행·컴파일 버전이 같다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(RX + RW / 2, 360, '개발자는 JDK, LTS 17·21', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { doc(RX, 26, RW, 132, 'build.gradle.kts', { fs: 14 });
      ['java { toolchain {', '  languageVersion =', '    JavaLanguageVersion.of(21)', '} }'].forEach((s, i) => mono(RX + 14, 78 + i * 21, typed(s, seg(u, 0.2 + i * 0.2, 0.6 + i * 0.2)), { 'font-size': 13.5, fill: i === 2 ? ACC : INK, 'font-weight': i === 2 ? 700 : 400 }));
      [['PC A', '17'], ['PC B', '21'], ['CI', '11']].forEach(([n, v], i) => { const x = RX + 60 + i * 116, s = pop(u, 1.2 + i * 0.15);
        card(x, 236, 96, 54, { rx: 8, text: n + '\n로컬 JDK ' + v, fs: 13.5, stroke: GRID, s }); grow(x, 266, x, 318, E(u, 1.7 + i * 0.1, 2.1 + i * 0.1), ACC);
        pill(x, 340, '21로 빌드', ACC, pop(u, 2.1 + i * 0.1), { fs: 13.5 }); });
      tx(RX + RW / 2, 392, '버전은 빌드 파일이 정한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.4) }); return; }
    if (k === 4) { const rows = ['21.0.3', '17.0.11-tem'], at = E(u, 1.2, 1.9);
      tx(RX, 175, '설치된 JDK', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      rows.forEach((s, i) => { const y = 210 + i * 50, on = (i === 0 && at < 0.5) || (i === 1 && at >= 0.5);
        card(RX + RW / 2 + 20, y, RW - 60, 40, { rx: 8, text: s, mono: true, fs: 15, stroke: on ? ACC : GRID, color: on ? ACC : INK, fill: on ? ACCBG : PANEL }); });
      mono(RX + 6, lerp(215, 265, at), '▶', { 'font-size': 16, fill: ACC });
      tx(RX + RW / 2, 330, '프로젝트마다 필요한 JDK로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(RX + RW / 2, 358, 'JAVA_HOME을 손으로 고치지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
    // k5: 버전 불일치 사고 → 통일
    const fix = E(u, 1.7, 2.4), envs = [['로컬', 21, 21], ['CI', 21, 21], ['서버', 17, 21]];
    envs.forEach(([n, a, b], i) => { const y = 60 + i * 84, v = Math.round(lerp(a, b, fix)), bad = v < 21;
      card(RX + 70, y, 120, 58, { rx: 8, text: n, fs: 16, fw: 800, stroke: bad ? BAD : INK, color: bad ? BAD : INK, s: pop(u, 0.2 + i * 0.15) });
      mono(RX + 150, y + 6, 'Java ' + v, { 'font-size': 16, 'font-weight': 800, fill: bad ? BAD : GOOD, opacity: fade(u, 0.4 + i * 0.15) });
      if (bad) cross(RX + 280, y, 11, pop(u, 1.0)); else if (fix > 0.9) check(RX + 280, y, 11, 1); });
    mono(RX + RW / 2, 318, 'UnsupportedClassVersionError', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) * (1 - fix) });
    tx(RX + RW / 2, 350, '로컬·CI·서버 버전을 하나로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'Hello.java 파일을 CPU가 바로 실행할 수 없는 이유는 무엇인가?',
      o: ['파일 이름이 클래스 이름과 달라서', '사람이 읽는 글자 파일이라 아직 번역되지 않아서', 'main 메서드에 static이 붙어서'], a: 1,
      why: '.java는 텍스트일 뿐이다. javac로 바이트코드 .class를 만들고 JVM이 그것을 실행해야 출력이 나온다.' },
    { q: 'Java 21 javac로 만든 Hello.class(major 65)를 Java 17 JVM에서 돌리면 어떻게 되는가?',
      o: ['UnsupportedClassVersionError로 실행되지 않는다', '조금 느리지만 그대로 실행된다', 'JVM이 자동으로 다시 컴파일해 실행한다'], a: 0,
      why: 'Java 17 JVM은 class 버전 61까지만 읽는다. javac --release 17로 major 61을 만들어야 실행된다.' },
    { q: 'java Helo처럼 클래스 이름을 잘못 쳤을 때 JVM은 어느 단계에서 멈추는가?',
      o: ['JIT 컴파일 단계', 'GC가 Heap을 정리하는 단계', '클래스로더가 클래스를 찾는 단계'], a: 2,
      why: '클래스로더가 classpath에서 Helo를 못 찾아 ClassNotFoundException이 난다. Heap·Stack·실행 엔진은 시작도 하지 않는다.' },
    { q: '같은 Hello.class가 Windows·macOS·Linux에서 모두 같은 결과를 내는 이유는 무엇인가?',
      o: ['javac가 OS 세 개용 기계어를 한 파일에 넣어서', 'OS마다 설치된 JVM이 같은 바이트코드를 각자 기계어로 바꿔 실행해서', 'Java 코드에 OS별 분기를 넣어서'], a: 1,
      why: '바이트코드에는 OS·CPU 정보가 없다. OS 차이를 흡수하는 일은 각 OS 전용 JVM이 맡는다.' },
    { q: 'java -version은 되는데 javac -version이 실패한다면 무엇이 빠져 있는가?',
      o: ['JDK의 개발 도구', 'JVM의 실행 엔진', 'JRE의 표준 라이브러리'], a: 0,
      why: 'java가 돈다면 JVM과 JRE는 있다. javac·javap·jar 같은 개발 도구는 바깥 상자인 JDK에만 들어 있다.' },
  ];

  const summary = [
    '.java는 사람이 읽는 글자 파일이라 CPU도 JVM도 그대로는 실행하지 못한다.',
    'javac가 만든 .class에는 JVM 명령어만 있고 OS·CPU 정보가 없어 어디서나 같은 파일을 쓴다.',
    'JVM은 클래스로더로 읽고 Heap·Stack에 올린 뒤 인터프리터와 JIT로 실행하고 GC로 회수한다.',
    'Java 17 JVM은 class 버전 61까지만 읽으니 로컬·CI·서버 JDK 버전을 하나로 맞춘다.',
  ];
  const review = [
    { q: '로컬에서는 잘 돌던 jar가 서버에서 UnsupportedClassVersionError를 낸다. 먼저 확인할 것은?',
      o: ['서버의 classpath에 jar가 있는지', '빌드한 JDK 버전과 서버 JVM 버전', '서버의 GC 로그'], a: 1,
      why: '이 오류는 class 파일 버전이 실행 JVM보다 높을 때 난다. --release나 toolchain으로 타깃을 서버 버전에 맞추거나 서버 JDK를 올린다.' },
    { q: '팀원 한 명만 Error: Could not find or load main class가 난다. 가장 그럴듯한 원인은?',
      o: ['JIT가 main을 아직 컴파일하지 않았다', '그 PC의 Heap이 너무 작다', '클래스 이름 오타나 classpath 설정이 다르다'], a: 2,
      why: '클래스로더가 .class를 찾지 못한 것이다. 이름·패키지 경로·classpath를 먼저 본다.' },
    { q: '새 서버에서 자바 프로그램을 빌드하고 실행해야 한다. 무엇을 설치하나?',
      o: ['JDK 하나', 'JVM만 따로', 'JRE만'], a: 0,
      why: '컴파일하려면 javac가 있어야 하고 javac는 JDK에만 있다. JDK에는 실행에 필요한 JRE·JVM도 들어 있다.' },
  ];

  R.page({ title: '자바 실행 과정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
