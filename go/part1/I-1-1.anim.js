/* I-1-1 왜 Go 인가 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 배포 묶음(런타임 층), Go 키워드 25개 전체, 정적 바이너리, G·P·M 스케줄러와 버퍼 채널, 두 칸 반환(결과, error).
 * 숫자는 페이지 코드·설명에 있는 값만 쓴다. 고루틴 출력 순서처럼 실행마다 달라지는 값은 "예시" 로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, u) => s.slice(0, Math.round(s.length * clamp(u)));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 고루틴 하나 = 작은 원
  function gor(x, y, name, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1), col = o.col || ACC;
    el('circle', { cx: 0, cy: 0, r: o.r || 18, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2.2 }, g);
    tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, class: 'mono', fill: col }, g); return g; }
  // 줄 친 칩 (없는 기능)
  function nope(x, y, s, sc) { if (sc <= 0) return; const w = tw(s, 14) + 26; card(x, y, w, 30, { rx: 15, text: s, fs: 14, stroke: MUT, color: MUT, s: sc, mono: true });
    el('line', { x1: x - w / 2 + 8, y1: y, x2: x - w / 2 + 8 + (w - 16) * clamp(sc), y2: y, stroke: BAD, 'stroke-width': 2.5 }); }

  // ---------- 1. 다른 언어는 무겁다 ----------
  const COLS = [
    { x: 165, name: 'Python', layers: ['Python 인터프리터', 'venv · pip 패키지', 'app.py'] },
    { x: 480, name: 'Java', layers: ['JRE (JVM)', 'lib · *.jar', 'app.jar'] },
    { x: 795, name: 'Node', layers: ['Node 런타임', 'node_modules 수백MB', 'app.js'] },
  ];
  function stack(col, u, hot) { lbl(col.x, 44, col.name, fade(u, 0.1), { 'font-size': 18, 'font-weight': 800 });
    col.layers.forEach((s, i) => { const a = seg(u, 0.2 + i * 0.3, 0.6 + i * 0.3); if (a <= 0) return; const y = 196 - i * 40 - (1 - E(a, 0, 1)) * 26, app = i === col.layers.length - 1;
      card(col.x, y, 220, 34, { rx: 6, text: s, fs: 14.5, fw: app ? 700 : 600, stroke: app ? ACC : hot ? BAD : WARN, fill: app ? ACCBG : hot ? BADBG : WARNBG, color: INK, op: a, sw: hot && !app ? 2.6 : 2 }); }); }
  function gil(x, t, u) { // 스레드 4개, GIL 을 쥔 1개만 CPU 에서 돈다
    const on = Math.floor(t * 1.4) % 4, op = fade(u, 1.1);
    for (let i = 0; i < 4; i++) { const tx0 = x - 90 + i * 60, live = i === on;
      el('line', { x1: tx0, y1: 298, x2: tx0, y2: 322, stroke: live ? ACC : GRID, 'stroke-width': 2.2, opacity: op });
      gor(tx0, 280, 'T' + (i + 1), { r: 16, col: live ? ACC : MUT, fill: live ? ACCBG : PANEL, op });
      card(tx0, 344, 46, 40, { rx: 6, text: 'CPU' + i, fs: 13.5, mono: true, stroke: live ? ACC : GRID, fill: live ? ACCBG : PANEL, color: live ? ACC : MUT, op }); }
    pill(x - 90 + on * 60, 252, 'GIL', WARN, op, { fs: 13.5, mono: true, fill: PANEL });
    sub(x, 392, '스레드 4개, 바이트코드 실행은 한 번에 1개', fade(u, 1.6), { 'font-size': 14 }); }
  function jit(x, u) { const ax = { X: (v) => x - 105 + v * 210, Y: (v) => 360 - v * 92 }, op = fade(u, 1.0);
    el('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(1), y2: ax.Y(0), stroke: MUT, 'stroke-width': 1.8, opacity: op });
    el('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(0), y2: ax.Y(1), stroke: MUT, 'stroke-width': 1.8, opacity: op });
    tx(ax.X(0) + 6, ax.Y(1) + 2, '처리 속도', { 'font-size': 13.5, fill: MUT, opacity: op }); tx(ax.X(1), 382, '시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
    const pts = []; for (let i = 0; i <= 40; i++) { const v = i / 40; pts.push([v, 0.12 + 0.8 / (1 + Math.exp(-(v - 0.42) * 14))]); }
    R.line({ X: ax.X, Y: ax.Y }, pts, E(u, 1.2, 2.3), INFO, { sw: 3 });
    el('rect', { x: ax.X(0) + 2, y: ax.Y(1), width: ax.X(0.38) - ax.X(0) - 2, height: 92, fill: WARNBG, opacity: 0.7 * fade(u, 1.6) });
    tx(ax.X(0.19), ax.Y(0.55), 'JIT 예열', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
  function loop(x, t, u, blocked) { const cx = x + 40, cy = 318, r = 40, op = fade(u, 1.0);
    el('circle', { cx, cy, r, fill: 'none', stroke: blocked ? BAD : INFO, 'stroke-width': 3, opacity: op });
    const a = blocked ? -0.6 : t * 3; el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 6, fill: blocked ? BAD : INFO, opacity: op });
    tx(cx, cy + 5, blocked ? 'CPU 작업' : '루프 1개', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: blocked ? BAD : INFO, opacity: op });
    const q = blocked ? Math.round(lerp(2, 7, E(u, 1.4, 2.4))) : 2;
    for (let i = 0; i < q; i++) el('circle', { cx: cx - r - 16 - i * 15, cy, r: 5.5, fill: blocked ? WARN : OFF, opacity: op });
    if (blocked) sub(x, 392, '요청이 줄을 선다', fade(u, 2.0), { fill: BAD, 'font-weight': 700, 'font-size': 14 }); }
  function s1(t, c) { const { k, u } = c;
    COLS.forEach((col, i) => { if (k < i) return; const uu = k === i ? u : 3; stack(col, uu, k === 3 ? fade(u, 0.3) > 0.5 : false);
      if (i === 0) gil(col.x, t, uu); if (i === 1) jit(col.x, uu); if (i === 2) loop(col.x, t, uu, k === 2 && u > 1.3 || k === 3); });
    if (k >= 1) pill(480, 76, '이미지 200MB+', WARN, k === 1 ? pop(u, 1.3) : 1, { fs: 14, mono: true });
    if (k === 3) banner(480, 232, '셋 다 런타임을 함께 싣는다 · 이미지가 크다 · 시작이 느리다', pop(u, 1.0)); }

  // ---------- 2. 컴팩트 주방 ----------
  const KW = ['break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type', 'var'];
  const SRC = ['package main', 'import "fmt"', 'func main() {', '  fmt.Println(…)', '}'];
  function kwGrid(k, u) { tx(16, 48, 'Go 키워드 25개 — 이게 전부다', { 'font-size': 16, 'font-weight': 800 });
    const hot = k === 0 ? ['package', 'import'] : k === 1 ? ['func'] : [];
    KW.forEach((w, i) => { const r = Math.floor(i / 5), q = i % 5, s = k === 0 ? pop(u, 0.15 + i * 0.04, 0.4) : 1, on = hot.includes(w);
      card(16 + q * 95 + 46, 80 + r * 38, 92, 32, { rx: 6, text: w, fs: 13.5, mono: true, fw: on ? 800 : 500, stroke: on ? ACC : GRID, fill: on ? ACCBG : PANEL, color: on ? ACC : INK, s, sw: on ? 2.4 : 1.4 }); }); }
  function srcCard(n, u) { card(610, 150, 196, 148, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.5 }); mono(522, 94, 'hello.go', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    SRC.forEach((s, i) => { const v = i < n - 1 ? 1 : i === n - 1 ? u : 0; if (v <= 0) return; mono(522, 120 + i * 22, typed(s, v), { 'font-size': 14, fill: i < 2 ? ACC : INK, 'font-weight': 700 }); }); }
  function binary(u, noSub) { const x = 860, y = 150;
    el('path', { d: `M${x - 62},${y - 74} H${x + 38} L${x + 62},${y - 50} V${y + 74} H${x - 62} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2.4, opacity: fade(u, 0.1) });
    mono(x - 50, y - 52, 'app', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
    [['내 코드', ACC, ACCBG], ['fmt', INFO, INFOBG], ['Go 런타임', WARN, WARNBG]].forEach(([s, col, bg], i) => { const a = seg(u, 0.4 + i * 0.3, 0.8 + i * 0.3); if (a <= 0) return;
      card(x, y - 14 + i * 32, 104, 26, { rx: 4, text: s, fs: 13.5, stroke: col, fill: bg, color: INK, op: a }); });
    if (!noSub) sub(x, y + 94, 'GC · 스케줄러까지 안에 든 파일 1개', fade(u, 1.4), { 'font-size': 13.5 }); }
  function server(u, lines) { card(860, 340, 170, 104, { rx: 8, stroke: INK, sw: 2, op: fade(u, 0) }); tx(782, 310, 'Go 미설치 서버', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0) });
    lines.forEach(([s, col], i) => mono(784, 342 + i * 24, s, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) })); }
  function s2(t, c) { const { k, u } = c;
    kwGrid(k, u);
    srcCard(k === 0 ? 2 : 5, k === 0 ? E(u, 0.8, 2.2) : k === 1 ? E(u, 0.2, 1.4) : 1);
    if (k >= 1) pill(610, 262, '출력: Hello, Go!', GOOD, k === 1 ? pop(u, 1.8) : 1, { fs: 14.5, mono: true });
    if (k === 0) sub(250, 290, '외부 패키지 없이 표준 라이브러리 fmt 하나', fade(u, 2.0), { 'font-size': 14.5 });
    if (k === 1) sub(250, 290, 'package main 의 func main 이 시작점', fade(u, 1.6), { 'font-size': 14.5 });
    if (k >= 2) { grow(712, 150, 792, 150, k === 2 ? E(u, 0.1, 0.5) : 1, ACC); mono(752, 138, 'go build', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle' });
      binary(k === 2 ? u : 3, k === 3);
      server(k === 2 ? seg(u, 1.6, 1.9) * 3 : 3, [['$ ./app', INK], ['Hello, Go!', GOOD]]); }
    if (k === 3) { fly(860, 230, 860, 300, seg(u, 0.2, 1.0), 'scp app  약 2~3MB', { mono: true });
      card(610, 340, 196, 66, { rx: 8, stroke: ACC, s: pop(u, 1.0) }); mono(522, 330, 'go.mod', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      tx(522, 356, '의존성 목록 한 파일', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) });
      nope(250, 340, 'Java: .class + JVM + lib', pop(u, 1.6)); nope(250, 384, 'Python: .py + venv + pip', pop(u, 1.9)); } }

  // ---------- 3. go 한 줄로 새 일꾼 ----------
  const CH = { x: 540, y: 78, w: 124, gap: 6 };
  const chX = (i) => CH.x + i * (CH.w + CH.gap) + CH.w / 2;
  function chan(vals, o) { o = o || {}; const n = vals.filter((v) => v).length;
    mono(CH.x, 62, 'done  chan string · cap 3', { 'font-size': 14, 'font-weight': 700, fill: o.dash ? MUT : INK });
    if (!o.dash) mono(924, 62, `len ${o.len ?? n} / 3`, { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    cells(CH.x, CH.y, vals, { w: CH.w, h: 44, gap: CH.gap, fs: 13.5, mono: false, style: (i, v) => ({ stroke: o.dash ? GRID : v ? ACC : INK, fill: v ? ACCBG : PANEL, dash: o.dash ? '5 4' : null, s: o.grow ? o.grow(i) : 1 }) }); }
  const PX = [130, 340];
  function gmp(k, u, o) { o = o || {};
    tx(24, 40, 'G 고루틴 · P 실행 자리 · M OS 스레드', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    zone(24, 64, 420, 74, '잠든 G — time.Sleep(1초)', { fill: SOFT });
    PX.forEach((x, i) => { card(x, 210, 170, 58, { rx: 10, stroke: INK, sw: 2 }); mono(x - 74, 196, 'P' + i, { 'font-size': 15, 'font-weight': 800 });
      [0, 1].forEach((q) => el('circle', { cx: x + 40 + q * 32, cy: 214, r: 13, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }));
      el('line', { x1: x, y1: 239, x2: x, y2: 282, stroke: GRID, 'stroke-width': 2.2 });
      card(x, 300, 140, 36, { rx: 6, text: `M${i} · OS 스레드`, fs: 13.5, stroke: MUT, color: INK });
      el('line', { x1: x, y1: 318, x2: x, y2: 340, stroke: GRID, 'stroke-width': 2.2 });
      card(x, 356, 90, 30, { rx: 5, text: 'CPU ' + i, fs: 13.5, mono: true, stroke: GRID, color: MUT }); });
    sub(234, 404, '예시: GOMAXPROCS=2 (기본값은 쓸 수 있는 CPU 수)', 1, { 'font-size': 13.5 });
    if (!o.noMain) gor(o.mainX ?? PX[0] - 22, o.mainY ?? 214, 'main', { r: 21, col: INFO, fill: INFOBG }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { // 함수 하나의 일생
      chan([null, null, null], { dash: true });
      mono(CH.x, 150, '인자로 받은 통로 (아직 만들기 전)', { 'font-size': 13.5, fill: MUT });
      tx(24, 60, 'func cook(order, done)', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      gor(70, 160, 'cook', { r: 24, s: pop(u, 0.2) });
      const bar = E(u, 0.5, 1.6); el('rect', { x: 110, y: 146, width: 260 * bar, height: 28, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 1.8 });
      if (bar > 0.3) tx(122, 166, 'time.Sleep(1초)', { 'font-size': 14, 'font-weight': 700, fill: WARN, class: 'mono' });
      fly(380, 160, chX(0), CH.y + 22, seg(u, 1.7, 2.5), '주문 1 완료', { stay: true });
      note(24, 250, 'return 대신 done 채널로 결과를 밀어 넣는다', fade(u, 2.1), { fill: ACC }); return; }
    if (k === 4) { const ax = { X: (s) => 200 + s * 220, Y: 0 };
      tx(24, 50, '같은 세 주문, 걸린 시간', { 'font-size': 17, 'font-weight': 800 });
      [0, 1, 2, 3].forEach((s) => { el('line', { x1: ax.X(s), y1: 90, x2: ax.X(s), y2: 340, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '3 4' }); mono(ax.X(s), 362, s + '초', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); });
      lbl(110, 132, '순차 실행', 1, { 'font-size': 16 }); lbl(110, 262, 'go 로 동시에', 1, { 'font-size': 16, fill: ACC });
      [0, 1, 2].forEach((i) => { const g1 = E(u, 0.2 + i * 0.4, 0.6 + i * 0.4);
        if (g1 > 0) card(ax.X(i) + 110 * g1, 128, 216 * g1, 34, { rx: 6, text: g1 > 0.8 ? `주문 ${i + 1}` : '', fs: 14, stroke: MUT, fill: SOFT });
        const g2 = E(u, 1.5, 2.1); if (g2 > 0) card(ax.X(0) + 110 * g2, 216 + i * 40, 216 * g2, 32, { rx: 6, text: g2 > 0.8 ? `G${i + 1} 주문 ${i + 1}` : '', fs: 14, stroke: ACC, fill: ACCBG }); });
      pill(ax.X(3) + 60, 145, '3초', BAD, pop(u, 1.4), { mono: true, fs: 16 }); pill(ax.X(1) + 60, 256, '약 1초', GOOD, pop(u, 2.2), { mono: true, fs: 16 });
      sub(480, 404, '총 시간 = 가장 긴 한 건', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    // k 1~3 : 스케줄러 + 채널
    const recv = k === 3;
    // 채널 칸: k3 에서 차고(1.0~1.6) 비워진다(1.7~2.5)
    const ORDER = [2, 1, 3], vals = [null, null, null];
    let len = 0;
    if (recv) ORDER.forEach((o, i) => { const inn = u > 1.0 + i * 0.25, out = u > 1.8 + i * 0.25; if (inn && !out) { vals[i] = `주문 ${o} 완료`; len++; } });
    chan(vals, { len, grow: k === 1 ? (i) => pop(u, 0.2 + i * 0.25) : null });
    gmp(k, u, { mainX: recv ? PX[0] - 22 : null });
    if (k === 1) { note(540, 170, '버퍼 3칸: 받는 쪽이 없어도 3개까지는 보낸 쪽이 바로 다음 일로 간다', fade(u, 1.0), { 'font-size': 14, 'font-weight': 500 });
      note(540, 200, '아직 일꾼은 main 하나', fade(u, 1.6), { fill: INFO }); }
    // G1~G3
    const G3 = [['G1', [PX[0] + 40, 214]], ['G2', [PX[1] - 22, 214]], ['G3', [PX[0] + 72, 214]]];
    if (k === 2) { G3.forEach(([n, to], i) => { const a = 0.3 + i * 0.4, f = E(u, a, a + 0.5), park = E(u, 1.8 + i * 0.12, 2.4 + i * 0.12);
        if (u < a) return; const sx = PX[0] - 22, sy = 166, px = 90 + i * 70, py = 108;
        const x = park > 0 ? lerp(to[0], px, park) : lerp(sx, to[0], f), y = park > 0 ? lerp(to[1], py, park) : lerp(sy, to[1], f);
        gor(x, y, n, { s: pop(u, a, 0.4) }); });
      note(540, 180, 'go cook(i, done) × 3', fade(u, 0.3), { class: 'mono', 'font-weight': 800 });
      note(540, 212, 'main 은 기다리지 않고 다음 줄로 간다', fade(u, 0.9));
      note(540, 260, 'G 하나는 2KB 스택에서 시작한다', fade(u, 1.5), { fill: ACC });
      note(540, 288, 'OS 스레드 스택은 MB 단위', fade(u, 1.7), { fill: MUT, 'font-weight': 500 });
      note(540, 330, '잠든 G 는 M 을 붙잡지 않는다', fade(u, 2.3), { fill: INFO }); return; }
    if (recv) { G3.forEach(([n], i) => { const o = ORDER.indexOf(i + 1), wake = 1.0 + o * 0.25, px = 90 + i * 70;
        clock(px + 30, 122, 9, E(u, 0.2, 0.9), WARN);
        if (u < wake) gor(px, 108, n, {}); else fly(px, 108, chX(o), CH.y + 22, seg(u, wake - 0.25, wake), n); });
      tx(PX[0] - 22, 258, '<-done 대기', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
      const lines = ORDER.map((o) => `주문 ${o} 완료`), shown = ORDER.reduce((n, _, i) => n + (u > 1.85 + i * 0.25 ? 1 : 0), 0);
      terminal(540, 226, 384, 136, lines, shown, { title: '출력 (순서는 예시)' });
      sub(732, 392, '<-done 세 번 = 세 요리사가 모두 끝났다', fade(u, 2.4), { 'font-size': 14 }); return; } }

  // ---------- 4. 이거 하나만 있어요 ----------
  function structBox(u, vals) { tx(40, 64, 'type User struct', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
    [['ID', 'int', 150], ['Name', 'string', 210]].forEach(([f, ty, w], i) => { const x = 40 + (i ? 156 : 0), s = pop(u, 0.2 + i * 0.3);
      card(x + w / 2, 112, w, 56, { rx: 6, stroke: ACC, fill: PANEL, s });
      mono(x + 12, 104, f, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.3) });
      mono(x + 12, 126, vals ? vals[i] : ty, { 'font-size': 14, fill: vals ? INK : MUT, opacity: fade(u, 0.3 + i * 0.3) }); }); }
  function s4(t, c) { const { k, u } = c;
    structBox(k === 0 ? u : 3, null);
    if (k === 0) { note(40, 176, '대문자로 시작하면 패키지 밖에서도 보인다', fade(u, 1.2)); note(40, 204, '생성자 · 접근 제어자 없음', fade(u, 1.6), { fill: MUT, 'font-weight': 500 }); }
    nope(80, 392, 'class', k === 0 ? pop(u, 2.0) : 1);
    if (k >= 1) { const a = k === 1 ? E(u, 0.3, 0.9) : 1;
      card(212, 250, 330, 44, { rx: 8, text: 'func (u User) Greet() string', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 0.2) : 1 });
      grow(212, 228, 212, 228 - 84 * a, a, INFO, { plain: true }); mono(222, 196, 'u = 받는 쪽 (receiver)', { 'font-size': 13.5, fill: INFO, opacity: k === 1 ? fade(u, 1.0) : 1 });
      nope(206, 392, 'extends', k === 1 ? pop(u, 1.6) : 1);
      if (k === 1) note(40, 310, '메서드는 타입 선언 밖에서 붙인다', fade(u, 1.9)); }
    if (k >= 2) { const s = k === 2 ? pop(u, 0.2) : 1;
      card(720, 72, 230, 44, { rx: 8, text: 'findUser(id)', fs: 15, mono: true, stroke: INK, s });
      mono(560, 132, '*User', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(k === 2 ? u : 3, 0.3) }); mono(760, 132, 'error', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(k === 2 ? u : 3, 0.3) });
      const row = (y, idTxt, a, b, at, bad) => { const op = k === 2 ? fade(u, at) : 1; mono(508, y + 5, idTxt, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: op });
        card(640, y, 180, 36, { rx: 6, text: a, fs: 13.5, mono: true, stroke: bad ? GRID : GOOD, fill: bad ? PANEL : GOODBG, color: bad ? MUT : INK, op });
        card(840, y, 180, 36, { rx: 6, text: b, fs: 13.5, mono: true, stroke: bad ? BAD : GRID, fill: bad ? BADBG : PANEL, color: bad ? BAD : MUT, op }); };
      row(160, 'id=1', '&User{1 Alice}', 'nil', 0.5, false);
      row(206, 'id=0', 'nil', 'invalid id: 0', 1.3, true);
      nope(336, 392, 'throw · try', k === 2 ? pop(u, 2.0) : 1); }
    if (k === 3) { const y = 286;
      card(600, y, 200, 36, { rx: 6, text: 'findUser(1)', fs: 14, mono: true, stroke: INK, s: pop(u, 0.2) });
      grow(700, y, 742, y, E(u, 0.5, 0.8), MUT);
      el('path', { d: `M802,${y - 26} L862,${y} L802,${y + 26} L742,${y} Z`, fill: PANEL, stroke: WARN, 'stroke-width': 2.2, opacity: fade(u, 0.7) });
      mono(802, y + 5, 'err?', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      grow(862, y, 900, y, E(u, 1.0, 1.3), GOOD); mono(882, y - 10, 'nil', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(940, y + 36, 'Hello, Alice', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      // gofmt
      tx(500, 356, 'gofmt', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
      mono(560, 356, 'user,err:=findUser(1)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      grow(500, 372, 540, 372, E(u, 2.0, 2.2), ACC); mono(560, 392, 'user, err := findUser(1)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  // ---------- 5. 어디에 Go 가 어울리나 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const sx = 470, sy = 200;
      card(sx, sy, 200, 92, { rx: 10, stroke: INK, sw: 2.4, s: pop(u, 0.2) }); lbl(sx, sy - 12, 'net/http 서버', fade(u, 0.3), { 'font-size': 16 }); mono(sx, sy + 16, ':8080', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      pill(sx, sy - 74, '/api/users → handleUsers', ACC, pop(u, 0.5), { mono: true, fs: 14 });
      [0, 1, 2].forEach((i) => { const y = 120 + i * 80, a = 0.8 + i * 0.4; R.person(90, y, null, { s: 0.7 });
        dot([[120, y], [sx - 100, sy]], seg(u, a, a + 0.5), ACC, 6);
        if (u > a + 0.5) { gor(640 + i * 0, 120 + i * 80, 'G' + (i + 1), { s: pop(u, a + 0.5, 0.4) }); grow(sx + 100, sy, 616, 120 + i * 80, E(u, a + 0.5, a + 0.8), ACC, { plain: true }); } });
      note(690, 126, '연결마다', fade(u, 1.4)); note(690, 150, '고루틴 하나', fade(u, 1.4), { fill: ACC });
      sub(470, 380, '프레임워크 없이 표준 라이브러리 두 줄 · 외부 의존성 0', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 1) { const lines = ['$ ./app', 'Hello, world', '$ ./app --name=Go', 'Hello, Go'];
      terminal(110, 70, 420, 210, lines, lerp(0, 4, E(u, 0.2, 2.0)), { title: 'flag 로 만든 CLI', fs: 16, lh: 30 });
      mono(550, 148, '← 기본값 "world"', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) }); mono(550, 208, '← --name 으로 받은 값', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) });
      sub(480, 330, 'go build 하면 이 CLI 가 실행 파일 하나로 나온다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 2) { const x0 = 370, y0 = 104, n = Math.round(lerp(0, 100, E(u, 0.3, 1.6)));
      lbl(480, 50, 'for i := 0; i < 100; i++ { go worker(jobs, results) }', 1, { class: 'mono', 'font-size': 14.5, 'font-weight': 700 });
      for (let i = 0; i < 100; i++) { if (i >= n) break; const r = Math.floor(i / 10), q = i % 10, busy = (Math.floor(t * 3) + i * 7) % 5 === 0;
        el('circle', { cx: x0 + q * 24, cy: y0 + r * 24, r: 8, fill: busy ? ACC : ACCBG, stroke: ACC, 'stroke-width': 1.5 }); }
      mono(480, 362, `worker 고루틴 ${n}개`, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      [['jobs', 150], ['results', 810]].forEach(([s, x], j) => { for (let i = 0; i < 5; i++) card(x, 120 + i * 40, 90, 32, { rx: 5, stroke: j ? GOOD : INFO, fill: PANEL, s: pop(u, 0.2 + i * 0.06) });
        lbl(x, 94, s, 1, { class: 'mono', fill: j ? GOOD : INFO }); });
      for (let i = 0; i < 6; i++) { dot([[200, 140 + (i % 5) * 40], [x0 - 10, y0 + 30 + i * 30]], (t * 0.7 + i / 6) % 1, INFO, 5); dot([[x0 + 226, y0 + 30 + i * 30], [760, 140 + (i % 5) * 40]], (t * 0.7 + i / 6 + 0.5) % 1, GOOD, 5); }
      sub(480, 400, '스레드 풀 설정도, 라이브러리도 없다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { tx(60, 60, '컨테이너 이미지 크기', { 'font-size': 17, 'font-weight': 800 });
      const g = E(u, 0.3, 1.3), W = 560;
      tx(60, 120, '런타임 동봉 이미지', { 'font-size': 15, 'font-weight': 700 }); R.hbar(250, 104, W, 200 * g, 200, { h: 26, col: WARN, text: '200MB+' });
      tx(60, 186, 'FROM scratch + app', { 'font-size': 15, 'font-weight': 700, fill: ACC }); R.hbar(250, 170, W, 10 * g, 200, { h: 26, col: ACC, text: '10MB 이하' });
      R.snippet(60, 236, ['FROM scratch', 'COPY app /app', 'ENTRYPOINT ["/app"]'], { op: fade(u, 1.4), fs: 15 });
      [['OS 패키지 · 셸', 1.7], ['런타임 레이어', 1.9]].forEach(([s, a], i) => nope(560 + i * 190, 270, s, pop(u, a)));
      note(470, 330, '셸조차 없으니 공격할 틈도 적다', fade(u, 2.2)); return; }
    // k 4
    const TOOLS = ['Docker', 'Kubernetes', 'Terraform', 'Prometheus', 'etcd', 'Hugo'];
    card(480, 200, 150, 64, { rx: 10, text: 'Go 바이너리', fs: 16, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.2) });
    TOOLS.forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 3, x = 480 + Math.cos(a) * 270, y = 200 + Math.sin(a) * 140, at = 0.5 + i * 0.22;
      grow(480 + Math.cos(a) * 80, 200 + Math.sin(a) * 36, x - Math.cos(a) * 60, y - Math.sin(a) * 18, E(u, at, at + 0.3), GRID, { plain: true });
      pill(x, y, s, INK, pop(u, at + 0.2), { fs: 15 }); });
    [['단일 바이너리', 0], ['동시성', 1], ['빠른 빌드', 2]].forEach(([s, i]) => pill(330 + i * 150, 396, s, ACC, pop(u, 2.0 + i * 0.15), { fs: 14 })); }

  const quiz = [
    { q: 'Python에서 스레드를 4개 띄워도 CPU를 하나만 쓰는 이유는 무엇인가?',
      o: ['스레드가 바이트코드를 실행하려면 GIL을 쥐어야 해서', '운영체제가 스레드를 4개까지만 허용해서', 'venv가 스레드 수를 제한해서'], a: 0,
      why: 'GIL은 한 번에 한 스레드만 바이트코드를 실행하게 한다. 그래서 스레드를 늘려도 계산은 줄을 선다.' },
    { q: 'go build로 만든 app 파일을 Go가 깔리지 않은 서버에서 바로 실행할 수 있는 이유는 무엇인가?',
      o: ['서버가 실행할 때 Go를 내려받아서', 'Go 런타임까지 실행 파일 안에 들어 있어서', '실행 파일이 사실은 스크립트라서'], a: 1,
      why: '정적 바이너리에는 내 코드, fmt 같은 패키지, GC와 스케줄러를 가진 Go 런타임이 함께 들어 있다. 그래서 파일 하나만 복사하면 된다.' },
    { q: '1초씩 걸리는 cook 세 건을 go로 띄웠을 때 총 시간이 약 1초인 이유는 무엇인가?',
      o: ['채널이 요리 시간을 줄여 줘서', 'main이 세 건을 차례로 빨리 처리해서', '세 고루틴이 동시에 기다리고 main은 결과만 받아서'], a: 2,
      why: '세 고루틴이 같은 1초를 겹쳐서 쓰고, main은 <-done으로 결과 셋을 받는다. 총 시간은 가장 긴 한 건과 같다.' },
    { q: 'Go에서 함수가 실패를 알리는 기본 방법은 무엇인가?',
      o: ['예외를 throw 한다', '두 번째 반환값으로 error를 돌려준다', '전역 변수에 에러 코드를 적는다'], a: 1,
      why: 'findUser(0)은 nil과 "invalid id: 0" 에러를 함께 돌려준다. 실패 가능성이 함수 시그니처에 보인다.' },
    { q: 'FROM scratch 이미지에 Go 앱을 넣을 수 있는 이유는 무엇인가?',
      o: ['scratch 이미지에 Go 런타임이 미리 들어 있어서', 'Docker가 Go 전용 모드를 켜서', '앱이 런타임을 품은 바이너리 하나라 다른 레이어가 필요 없어서'], a: 2,
      why: '바이너리 하나만 복사하면 되므로 OS 패키지도 런타임 레이어도 없는 빈 베이스로 충분하다. 이미지가 10MB 이하로 줄어든다.' },
  ];

  const summary = [
    'Python, Java, Node는 배포할 때 런타임을 함께 싣고, 이미지가 크고 시작이 느리다.',
    'go build는 Go 런타임까지 든 실행 파일 하나를 만든다. 복사하면 배포가 끝난다.',
    'go 한 줄로 고루틴이 생기고, 채널로 결과를 받으면 1초짜리 세 건이 약 1초에 끝난다.',
    '클래스, 상속, 예외 없이 struct와 메서드, error 반환으로 쓴다. 그래서 코드 모양이 비슷하다.',
  ];
  const review = [
    { q: 'Node 서버에서 이미지 크기 변환 요청 하나가 들어오자 다른 요청이 모두 느려졌다. 먼저 의심할 것은?',
      o: ['CPU 작업이 하나뿐인 이벤트 루프를 붙잡고 있다', 'node_modules가 너무 커서 디스크가 느리다', '네트워크 대역폭이 모자란다'], a: 0,
      why: '이벤트 루프가 하나라 CPU를 오래 쓰는 작업이 그 루프를 막으면 뒤 요청이 줄을 선다. Go는 고루틴을 여러 OS 스레드에 나눠 돌린다.' },
    { q: 'Go로 만든 API를 컨테이너로 배포하려 한다. 이미지를 가장 작게 만드는 방법은?',
      o: ['Go가 설치된 베이스 이미지 위에서 go run으로 실행한다', 'go build로 만든 바이너리만 FROM scratch 이미지에 복사한다', '소스 코드와 go.mod를 함께 넣는다'], a: 1,
      why: '바이너리 안에 런타임이 있으므로 빈 베이스에 파일 하나면 된다. 셸도 패키지도 없어 공격 표면도 줄어든다.' },
    { q: '고루틴 100개를 띄워 작업을 나누는 코드를 처음 봤다. 따로 준비해야 하는 것은?',
      o: ['스레드 풀 라이브러리 설치', 'OS 스레드 100개를 미리 만들기', 'jobs와 results 채널을 만들고 go worker를 반복해서 부르기'], a: 2,
      why: '동시성이 언어에 들어 있어 go 키워드와 채널만으로 작업자 풀이 된다. 고루틴은 2KB 스택에서 시작해 수가 많아도 가볍다.' },
  ];

  R.page({ title: '왜 Go 인가', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
