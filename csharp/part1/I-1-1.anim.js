/* I-1-1 .NET 런타임과 관리 코드 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono: monoRaw, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, terminal, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 한글이 섞인 글은 고정폭 글꼴에서 자간이 벌어지므로 보통 글꼴로 쓴다
  const mono = (x, y, s, a, p) => (/[가-힣]/.test(String(s)) ? tx(x, y, s, Object.assign({ style: 'white-space:pre' }, a || {}), p) : monoRaw(x, y, s, a, p));
  const KW = /^(var|class|internal|static|void|string|int|new|public|private|using|object|null|return|ret|call|ldstr|ldloc|stloc)$/;
  // C# 한 줄 색칠 (키워드 INFO, 문자열 ACC, 주석 MUT). shown: 0→1 타이핑
  function cs(x, y, line, o) { o = o || {}; const fs = o.fs || 14.5, f = o.shown == null ? 1 : clamp(o.shown);
    const s = line.slice(0, Math.round(line.length * f)); const parts = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) parts.push([w, KW.test(w) ? { fill: INFO, 'font-weight': 700 } : { fill: o.color || INK }]); }); buf = ''; };
    while (i < s.length) { const c = s[i];
      if (c === '/' && s[i + 1] === '/') { flush(); parts.push([s.slice(i), { fill: MUT }]); i = s.length; break; }
      if (c === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; parts.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += c; i++; }
    flush(); return spans(x, y, parts, { 'font-size': fs, opacity: o.op ?? 1 }); }
  // 파일 아이콘 (접힌 귀퉁이)
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), w = o.w || 46, h = o.h || 58, c = o.stroke || INK;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 14} L${w / 2},${-h / 2 + 14} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: `M${w / 2 - 14},${-h / 2} V${-h / 2 + 14} H${w / 2}`, fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    if (o.tag) tx(0, 6, o.tag, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: c, class: 'mono' }, g);
    if (name) tx(0, h / 2 + 20, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono' }, g); return g; }
  // CPU 칩
  function cpu(cx, cy, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), c = o.stroke || INK;
    for (let i = -2; i <= 2; i++) { const d = i * 12; [[d, -42, d, -32], [d, 32, d, 42], [-42, d, -32, d], [32, d, 42, d]].forEach(([a, b, x2, y2]) => el('line', { x1: a, y1: b, x2, y2, stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round' }, g)); }
    el('rect', { x: -32, y: -32, width: 64, height: 64, rx: 8, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.6 }, g);
    tx(0, 6, 'CPU', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: c }, g);
    if (o.name) tx(0, 66, o.name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }, g); return g; }
  // 톱니 (JIT·Roslyn)
  function gear(cx, cy, r, rot, name, o) { o = o || {}; const g = el('g', { transform: `translate(${cx} ${cy}) scale(${o.s ?? 1})`, opacity: o.op ?? 1 }), c = o.stroke || ACC;
    const gg = el('g', { transform: `rotate(${rot})` }, g);
    for (let i = 0; i < 8; i++) el('rect', { x: -6, y: -r - 9, width: 12, height: 14, rx: 2, fill: c, transform: `rotate(${i * 45})` }, gg);
    el('circle', { cx: 0, cy: 0, r, fill: o.fill || ACCBG, stroke: c, 'stroke-width': 3 }, gg);
    el('circle', { cx: 0, cy: 0, r: r * 0.32, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, gg);
    if (name) tx(0, r + 30, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: c }, g); return g; }
  // 바이트 막대 (IL = INFO, 기계어 = GOOD)
  function strip(x, y, n, col, u, o) { o = o || {}; const w = o.w || 14, k = Math.round(n * clamp(u ?? 1));
    for (let i = 0; i < n; i++) el('rect', { x: x + i * (w + 3), y, width: w, height: o.h || 16, rx: 3, fill: i < k ? col : SOFT, stroke: i < k ? 'none' : GRID, 'stroke-width': 1 }); }
  const typed = (u, a, b) => seg(u, a, b);

  // ================= 장면 1. C# 소스 =================
  const SRC = ['var name = "World";', 'Console.WriteLine($"Hello, {name}!");'];
  function editor(k, u) {
    card(250, 96, 420, 120, { rx: 10, stroke: INK, sw: 2 });
    el('line', { x1: 40, y1: 64, x2: 460, y2: 64, stroke: GRID, 'stroke-width': 1.5 });
    mono(56, 56, 'Program.cs', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    [0, 1].forEach((i) => mono(56, 94 + i * 30, String(i + 1), { 'font-size': 13.5, fill: OFF }));
    if (k === 0) { if (Math.floor(u * 2.2) % 2 === 0) el('rect', { x: 80, y: 80, width: 3, height: 18, fill: INK }); return; }
    if (k >= 4) { const g = k === 4 ? (seg(u, 0.9, 1.3) * 0.4) : 0.4; if (g > 0) { cs(80, 94, SRC[0], { op: g, color: MUT }); cs(80, 124, SRC[1], { op: g, fs: 14, color: MUT }); } return; }
    cs(80, 94, SRC[0], { shown: k === 1 ? typed(u, 0.2, 1.3) : 1 });
    if (k >= 2) cs(80, 124, SRC[1], { shown: k === 2 ? typed(u, 0.2, 1.4) : 1, fs: 14 });
  }
  function s1(t, c) { const { k, u } = c;
    editor(k, u);
    // 오른쪽: 컴파일러가 보는 코드
    const wrapU = k < 3 ? 0 : k === 3 ? E(u, 0.2, 1.4) : 1;
    if (k < 3) { el('rect', { x: 500, y: 36, width: 420, height: 196, rx: 12, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: k === 0 ? fade(u, 0.6) : 1 });
      sub(710, 128, '컴파일러가 Main 을 만들어 감쌀 자리', k === 0 ? fade(u, 0.9) : 1, { 'font-size': 14.5 });
      sub(710, 152, '(아직 비어 있음)', k === 0 ? fade(u, 1.1) : 1); }
    else {
      el('rect', { x: 500, y: 36, width: 420 * wrapU, height: 196, rx: 12, fill: SOFT, stroke: INFO, 'stroke-width': 2 });
      el('rect', { x: 520, y: 82, width: 380 * clamp(wrapU * 1.3 - 0.3), height: 120, rx: 8, fill: PANEL, stroke: INFO, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
      cs(516, 66, 'internal class Program {', { fs: 14, op: fade(u, k === 3 ? 0.5 : -1) });
      cs(532, 104, 'static void <Main>$(string[] args) {', { fs: 13.5, op: k === 3 ? fade(u, 1.0) : 1 });
      mono(516, 224, '}', { 'font-size': 14, opacity: k === 3 ? fade(u, 1.2) : 1 });
      if (k === 3) sub(710, 160, '← 내가 쓴 두 줄이 들어갈 자리', fade(u, 1.6), { 'font-size': 14 });
      if (k <= 4) pill(808, 252, '진입점은 그대로 있다', INFO, k === 3 ? pop(u, 1.8) : 1, { fs: 13.5 });
    }
    // 두 줄이 Main 안으로
    if (k === 4) { const a = E(u, 0.2, 1.3), b = E(u, 0.6, 1.7);
      cs(lerp(80, 544, a), lerp(94, 136, a), SRC[0], { fs: lerp(14.5, 13.5, a) });
      cs(lerp(80, 544, b), lerp(124, 166, b), SRC[1], { fs: 13.5 }); }
    if (k >= 5) { cs(544, 136, SRC[0], { fs: 13.5 }); cs(544, 166, SRC[1], { fs: 13.5 }); }
    if (k === 4) pill(260, 252, '사람이 쓴 것: 두 줄뿐', ACC, pop(u, 1.9), { fs: 14 });
    // 변수 칸
    if (k >= 1 && k <= 3) { const s = k === 1 ? pop(u, 1.4) : 1;
      card(150, 196, 220, 50, { rx: 8, stroke: ACC, sw: 2, s });
      mono(58, 202, 'name', { 'font-size': 15, 'font-weight': 700, opacity: s });
      mono(116, 202, '"World"', { 'font-size': 15, fill: ACC, opacity: s });
      pill(330, 196, 'var → string', INFO, k === 1 ? pop(u, 1.9) : 1, { fs: 13.5, mono: true });
      if (k === 1) sub(250, 240, '타입은 컴파일 때 string 으로 확정', fade(u, 2.1), { 'font-size': 14 }); }
    // 출력 터미널
    if (k === 2 || k === 3) { const o = k === 2 ? seg(u, 1.6, 2.3) : 1;
      if (k === 2) fly(146, 196, 300, 124, seg(u, 1.1, 1.8), '"World"', { mono: true });
      terminal(40, 276, 420, 100, ['$ dotnet run', ['Hello, World!', 'var(--term)']], k === 2 ? 1 + o : 2, { title: 'console' }); }
    // CPU 는 텍스트를 못 읽는다
    if (k === 5) { const x = 150;
      card(x + 90, 300, 260, 70, { rx: 10, stroke: GRID, sw: 1.5, fill: SOFT });
      mono(x - 26, 292, 'Console.WriteLine(', { 'font-size': 14, fill: MUT }); mono(x - 26, 314, '  $"Hello, {name}!");', { 'font-size': 14, fill: MUT });
      const fl = seg(u, 0.3, 1.2), back = seg(u, 1.2, 1.7), xx = fl < 1 ? lerp(380, 600, E(u, 0.3, 1.2)) : lerp(600, 520, back);
      if (u > 0.3) card(xx, 300, 70, 30, { rx: 6, text: 'C# 글자', fs: 13.5, stroke: MUT, color: MUT });
      cpu(700, 300, { stroke: INK });
      if (u > 1.2) cross(640, 260, 12, pop(u, 1.2));
      tx(700, 386, 'CPU 는 기계어만 읽는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
      ['C# 텍스트', 'IL', '기계어'].forEach((s, i) => { const y = 290 + i * 40, sc = pop(u, 1.6 + i * 0.25);
        pill(870, y, s, i === 0 ? ACC : i === 1 ? INFO : GOOD, sc, { fs: 13.5 }); if (i < 2) grow(870, y + 13, 870, y + 25, seg(u, 1.8 + i * 0.25, 2.0 + i * 0.25), MUT, { plain: true }); });
      tx(240, 400, 'CLR 의 관리를 받으며 도는 코드 = 관리 코드', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.2) }); }
  }

  // ================= 장면 2. 컴파일: C# → IL =================
  const IL = [['ldstr', '"World"'], ['stloc.0', ''], ['ldstr', '"Hello, "'], ['ldloc.0', ''], ['ldstr', '"!"'],
    ['call', 'String::Concat(string×3)'], ['call', 'Console::WriteLine(string)'], ['ret', '']];
  // IL 실행 상태: 명령 i 까지 실행한 뒤의 평가 스택과 지역 변수
  function ilState(n) { let st = [], loc = null, out = '';
    for (let i = 0; i < n; i++) { const [op, a] = IL[i];
      if (op === 'ldstr') st.push(a.replace(/"/g, '')); else if (op === 'stloc.0') loc = st.pop(); else if (op === 'ldloc.0') st.push(loc);
      else if (a.startsWith('String::Concat')) { const z = st.splice(-3).join(''); st.push(z); } else if (a.startsWith('Console')) out = st.pop(); }
    return { st, loc, out }; }
  function asm(k, u, o) { o = o || {}; const x = 640, y = 30, w = 290, h = 150, s = o.s ?? 1;
    if (k < 2) { el('rect', { x, y, width: w, height: h, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6' }); sub(x + w / 2, y + h / 2 + 5, '어셈블리 — 아직 없음', 1, { 'font-size': 14 }); return; }
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.2, opacity: s });
    tx(x + 14, y + 22, 'HelloApp.dll', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: s });
    const parts = [['IL 코드', o.il, INFO], ['메타데이터', o.meta, WARN], ['Manifest', o.man, GOOD]];
    parts.forEach(([name, val, col], i) => { const yy = y + 36 + i * 36;
      el('rect', { x: x + 10, y: yy, width: w - 20, height: 30, rx: 6, fill: val ? SOFT : PANEL, stroke: val ? col : GRID, 'stroke-width': val ? 2 : 1.3, opacity: s });
      tx(x + 20, yy + 20, name, { 'font-size': 13.5, 'font-weight': 700, fill: val ? col : MUT, opacity: s });
      if (val) tx(x + w - 18, yy + 20, val, { 'font-size': 13.5, 'font-weight': 600, 'text-anchor': 'end', fill: INK, opacity: o.valOp ? o.valOp[i] : 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    const lines = [['$ dotnet new console -n HelloApp', PANEL], ['$ cd HelloApp', PANEL], ['$ dotnet build -c Release', PANEL], ['  → bin/Release/net8.0/HelloApp.dll', 'var(--term)'], ['$ ilspycmd -il …/HelloApp.dll', PANEL]];
    const shown = k === 0 ? 2 * seg(u, 0.1, 1.2) : k === 1 ? 2 + seg(u, 0.1, 0.8) : k === 2 ? 3 + seg(u, 1.4, 2.0) : k >= 3 ? 5 : 0;
    terminal(30, 30, 380, 150, lines, Math.max(0.001, shown), { title: 'terminal', fs: 13.5 });
    const rot = k === 1 ? t * 120 : 0;
    gear(525, 92, 30, rot, 'Roslyn', { stroke: k === 1 ? ACC : MUT, fill: k === 1 ? ACCBG : SOFT });
    asm(k, u, { s: k === 2 ? pop(u, 1.0) : 1, il: k >= 2 ? (k >= 3 ? '8개 명령' : '…') : null, meta: k >= 4 ? 'String·Console 참조' : null, man: k >= 5 ? 'net8.0' : null, valOp: k === 5 ? [1, 1, fade(u, 1.3)] : k === 4 ? [1, fade(u, 1.8), 1] : null });
    if (k === 0) { // 폴더 트리
      const rows = [['HelloApp/', 0], ['HelloApp.csproj', 1], ['Program.cs', 1]];
      rows.forEach(([n, d], i) => { const y = 250 + i * 40, s = pop(u, 1.0 + i * 0.35); if (s <= 0) return;
        if (d) el('path', { d: `M76,${y - 30} V${y - 6} H96`, fill: 'none', stroke: GRID, 'stroke-width': 2 });
        mono(60 + d * 44, y, n, { 'font-size': 15, 'font-weight': 700, fill: d ? INK : ACC, opacity: s }); });
      sub(480, 300, 'IL 은 아직 한 줄도 없다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 1) { fileIcon(200, 300, 'Program.cs', { tag: 'C#', stroke: ACC });
      for (let i = 0; i < 6; i++) dot([[226, 300], [400, 300], [400, 150], [495, 110]], ((u * 0.7 + i / 6) % 1), ACC, 5);
      sub(700, 300, 'C# 텍스트 → IL (CPU 종류는 아직 모른다)', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    if (k === 2) { fly(560, 110, 700, 100, seg(u, 0.3, 1.0), 'IL + 메타데이터', { fill: INFO });
      mono(480, 270, 'bin/Release/net8.0/HelloApp.dll', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      sub(480, 302, '파일 하나 = 배포 단위', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 3 || k === 4) { // IL 스택 기계
      const n = k === 3 ? Math.floor(lerp(0, 5.99, seg(u, 0.2, 2.4))) : 5 + Math.floor(lerp(0, 3.99, seg(u, 0.2, 2.4)));
      const S = ilState(n);
      tx(40, 212, '<Main>$ 의 IL', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      IL.forEach(([op, a], i) => { const y = 236 + i * 22, on = i === n - 1, done = i < n;
        if (on) el('rect', { x: 34, y: y - 16, width: 368, height: 21, rx: 4, fill: ACCBG });
        mono(44, y, op, { 'font-size': 14, 'font-weight': 700, fill: done ? INFO : OFF }); mono(124, y, a, { 'font-size': 14, fill: done ? INK : OFF }); });
      tx(470, 212, '평가 스택', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      el('path', { d: 'M440,226 V396 H640 V226', fill: 'none', stroke: INK, 'stroke-width': 2 });
      S.st.forEach((v, i) => card(540, 376 - i * 36, 184, 30, { rx: 6, text: '"' + v + '"', fs: 13.5, mono: true, stroke: ACC, fill: ACCBG }));
      tx(668, 212, '지역 변수 [0]', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      card(760, 246, 160, 34, { rx: 6, text: S.loc ? '"' + S.loc + '"' : '(비어 있음)', fs: 13.5, mono: true, stroke: S.loc ? INFO : GRID, color: S.loc ? INK : MUT });
      if (k === 4) { terminal(668, 300, 262, 96, [['Hello, World!', 'var(--term)']], S.out ? 1 : 0.001, { title: 'console' });
      } }
    if (k === 5) { // TFM → Manifest, 같은 IL 이 여러 곳에서
      cs(40, 236, '<TargetFramework>net8.0</TargetFramework>', { fs: 14.5 });
      fly(270, 230, 840, 140, seg(u, 0.4, 1.3), 'net8.0', { fill: GOOD, mono: true });
      const T = [['Windows · x64', '런타임 8.0 있음', true], ['Linux · ARM64', '런타임 8.0 있음', true], ['서버', '런타임 8.0 없음', false]];
      T.forEach(([a, b, ok], i) => { const cx = 170 + i * 310, s = pop(u, 1.4 + i * 0.3);
        card(cx, 330, 250, 76, { rx: 10, stroke: ok ? GOOD : BAD, sw: 2, s });
        tx(cx - 100, 322, a, { 'font-size': 15, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 }); tx(cx - 100, 346, b, { 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? 1 : 0 });
        (ok ? check : cross)(cx + 96, 330, 12, s); });
      sub(480, 400, '같은 .dll 이 OS·CPU 를 가리지 않는다. 단, 맞는 런타임이 있어야 한다', fade(u, 2.2), { 'font-size': 14, fill: INK }); }
  }

  // ================= 장면 3. CLR 로드 & JIT =================
  const MT = ['Main()', 'Console.WriteLine()', 'Helper.Rarely()'];
  // 메서드 표: st[i] = 'none' | 'il' | 'jit' | 'nat', f[i] 번역 진행 0~1
  function methods(st, f, o) { o = o || {}; const x = 430, y = 56;
    zone(420, 30, 510, 200, 'CLR 메모리 — HelloApp 의 메서드', { fill: SOFT, stroke: GRID, sw: 1.5 });
    MT.forEach((m, i) => { const yy = y + 22 + i * 52, s = st[i];
      if (s === 'none') return; const op = o.op ? o.op[i] : 1;
      mono(x + 12, yy + 18, m, { 'font-size': 14.5, 'font-weight': 700, opacity: op });
      const lab = s === 'il' ? ['IL', INFO] : s === 'jit' ? ['번역 중', WARN] : ['기계어', GOOD];
      pill(x + 252, yy + 13, lab[0], lab[1], op, { fs: 13.5 });
      if (s === 'nat') strip(x + 310, yy + 5, 9, GOOD, 1, { w: 15 });
      else if (s === 'jit') { strip(x + 310, yy + 5, 9, INFO, 1, { w: 15 }); strip(x + 310, yy + 5, 9, GOOD, f[i], { w: 15 }); }
      else strip(x + 310, yy + 5, 9, INFO, 1, { w: 15 }); }); }
  function s3(t, c) { const { k, u } = c;
    const tl = [['$ dotnet run', PANEL], ['  Hello, World!', 'var(--term)']];
    terminal(30, 30, 360, 96, tl, k === 0 ? Math.max(0.001, 2 * seg(u, 0.2, 1.2)) : 2, { title: 'terminal', fs: 14 });
    if (k === 0) { el('rect', { x: 420, y: 30, width: 510, height: 200, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.8) });
      tx(675, 140, '?', { 'text-anchor': 'middle', 'font-size': 64, 'font-weight': 800, fill: OFF, opacity: fade(u, 1.0) });
      sub(675, 196, '명령 하나 뒤에 로드 · JIT · 실행이 숨어 있다', fade(u, 1.4), { 'font-size': 14.5, fill: INK });
      gear(200, 300, 28, 0, 'JIT', { stroke: OFF, fill: SOFT, op: fade(u, 1.8) }); cpu(820, 320, { op: fade(u, 1.8) }); return; }
    const J = [220, 316];
    if (k === 1) { const a = E(u, 0.2, 1.1);
      if (a < 1) fileIcon(lerp(200, 600, a), lerp(200, 120, a), null, { tag: 'IL', stroke: INFO, s: 1 - a * 0.3 });
      methods(['il', 'il', 'il'], [0, 0, 0], { op: [fade(u, 1.1), fade(u, 1.3), fade(u, 1.5)] });
      gear(J[0], J[1], 28, 0, 'JIT', { stroke: OFF, fill: SOFT });
      pill(220, 180, '번역한 메서드 0개', MUT, pop(u, 1.8), { fs: 14 }); cpu(820, 330, {}); return; }
    if (k === 2) { const go = seg(u, 0.3, 0.9), jit = seg(u, 0.9, 2.0), back = seg(u, 2.0, 2.6);
      methods([jit < 1 ? (go > 0 ? 'jit' : 'il') : 'nat', 'il', 'il'], [jit, 0, 0]);
      grow(250, 90, 428, 92, seg(u, 0.1, 0.4), ACC); sub(330, 80, '첫 호출', fade(u, 0.2), { fill: ACC, 'font-weight': 700 });
      gear(J[0], J[1], 28, jit > 0 && jit < 1 ? t * 160 : 0, 'JIT', { stroke: jit > 0 ? ACC : OFF, fill: jit > 0 ? ACCBG : SOFT });
      if (go > 0 && go < 1) fly(600, 92, J[0], J[1], go, 'Main 의 IL', { fill: INFO });
      if (back > 0 && back < 1) fly(J[0], J[1], 600, 92, back, 'x64 기계어', { fill: GOOD });
      sub(420, 330, '그 메서드 하나만, 지금 이 CPU 에 맞게', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      cpu(820, 330, {}); return; }
    if (k === 3) { methods(['nat', 'il', 'il'], [1, 0, 0]);
      gear(J[0], J[1], 28, 0, 'JIT', { stroke: OFF, fill: SOFT });
      el('path', { d: 'M760,108 C 820,170 830,220 822,280', fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: fade(u, 0.3) });
      for (let i = 0; i < 3; i++) dot([[760, 108], [810, 170], [822, 280]], ((u * 0.8 + i / 3) % 1), GOOD, 6);
      sub(560, 268, '두 번째 호출: 캐시된 기계어로 바로', fade(u, 0.6), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      cpu(820, 330, { stroke: GOOD });
      card(540, 382, 360, 52, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 1.2) });
      mono(375, 377, 'JitInfo 번역 수', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      mono(375, 398, '첫 호출 +1   두 번째 호출 +0', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      sub(540, 344, '.NET 10 에서 직접 잰 값', fade(u, 1.8)); return; }
    if (k === 4) { // AOT: 번역 시점을 빌드로 옮긴다
      methods(['nat', 'nat', 'nat'], [1, 1, 1], { op: [1, 1, 1] });
      pill(675, 248, 'Helper.Rarely() 까지 번역 → 파일이 커진다', WARN, pop(u, 1.8), { fs: 13.5 });
      const x0 = 60, w = 320; tx(x0, 300, '번역 시점', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['JIT', 0], ['AOT', 1]].forEach(([n, i]) => { const y = 322 + i * 46; tx(x0, y + 18, n, { 'font-size': 15, 'font-weight': 800 });
        el('rect', { x: x0 + 50, y, width: w / 2 - 6, height: 26, rx: 5, fill: SOFT, stroke: GRID }); el('rect', { x: x0 + 50 + w / 2, y, width: w / 2, height: 26, rx: 5, fill: SOFT, stroke: GRID });
        const at = i === 0 ? x0 + 50 + w / 2 + 6 : x0 + 56, g = E(u, 0.4 + i * 0.6, 1.2 + i * 0.6);
        el('rect', { x: at, y: y + 4, width: 60 * g, height: 18, rx: 4, fill: i ? GOOD : WARN }); });
      sub(x0 + 50 + w / 4, 412, '빌드', 1); sub(x0 + 50 + w * 0.75, 412, '실행', 1);
      tx(560, 330, 'PublishAot=true', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: GOOD, opacity: fade(u, 1.0) });
      tx(560, 356, '실행 중 JIT 없음 · 시작이 빠르다', { 'font-size': 14, fill: INK, opacity: fade(u, 1.3) });
      tx(560, 380, 'OS·CPU 마다 따로 빌드 · 리플렉션 제약', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.6) }); return; }
    // k5 경계 정리
    methods(['nat', 'jit', 'il'], [1, seg(u, 0.4, 2.4), 0]);
    pill(675, 248, 'Rarely() 는 불리지 않았으니 번역도 안 한다', MUT, pop(u, 1.6), { fs: 13.5 });
    el('line', { x1: 380, y1: 280, x2: 380, y2: 410, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    tx(200, 300, 'IL', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: INFO });
    tx(200, 324, 'CPU 독립', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    tx(560, 300, '기계어', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: GOOD });
    tx(560, 324, '이 CPU 전용', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    gear(380, 362, 20, t * 140, null, { stroke: ACC });
    sub(380, 414, 'JIT 가 필요할 때만 잇는다', fade(u, 0.8), { fill: ACC, 'font-weight': 700, 'font-size': 14 });
    cpu(840, 340, { stroke: GOOD });
  }

  // ================= 장면 4. 관리 런타임 =================
  // 스택 칸과 힙 객체, 참조 화살표
  function slot(x, y, name, val, o) { o = o || {}; const s = o.s ?? 1;
    el('rect', { x, y, width: 160, height: 34, rx: 6, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: s });
    mono(x + 10, y + 22, name, { 'font-size': 14.5, 'font-weight': 700, opacity: s });
    if (val != null) mono(x + 150, y + 22, val, { 'font-size': 14, 'text-anchor': 'end', fill: o.vcol || MUT, opacity: s }); }
  function obj(x, y, w, title, rows, o) { o = o || {}; const h = 30 + rows.length * 24, s = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: s });
    tx(x + 10, y + 20, title, { 'font-size': 14, 'font-weight': 800, fill: o.stroke || INK, class: 'mono', opacity: s });
    rows.forEach((r, i) => mono(x + 14, y + 44 + i * 24, r, { 'font-size': 13.5, fill: INK, opacity: s })); return { x, y, w, h }; }
  function ref(x1, y1, x2, y2, u, col) { grow(x1, y1, x2, y2, u, col || INK, { sw: 2.4 }); if (u > 0) el('circle', { cx: x1, cy: y1, r: 4, fill: col || INK }); }
  function frame(title) { zone(30, 40, 200, 360, '스택', { fill: SOFT }); zone(260, 40, 440, 360, '관리 힙 (GC 가 돌본다)', { fill: SOFT }); if (title) tx(820, 64, title, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); }
  function service(i, on, txt) { const names = ['GC', '타입 검사', '예외'], y = 100 + i * 64;
    card(820, y, 200, 48, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.5, fill: on ? ACCBG : PANEL });
    tx(735, y + 5, names[i], { 'font-size': 15, 'font-weight': 800, fill: on ? ACC : MUT });
    if (txt) tx(905, y + 5, txt, { 'font-size': 13.5, fill: on ? INK : MUT, 'text-anchor': 'end' }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { // using: 비관리 자원
      zone(30, 40, 560, 360, 'CLR 이 관리하는 곳', { fill: SOFT });
      zone(620, 40, 310, 360, 'OS 자원 (GC 소관 밖)', { fill: WARNBG, color: WARN });
      cs(50, 92, 'using (var file = File.OpenRead("data.bin"))', { fs: 14 });
      el('path', { d: 'M56,108 V230', stroke: INFO, 'stroke-width': 3 }); mono(50, 254, '}', { 'font-size': 16, 'font-weight': 700 });
      obj(90, 130, 220, 'FileStream', ['handle →'], {});
      const closed = seg(u, 1.4, 1.9);
      card(775, 160, 200, 64, { rx: 10, stroke: closed ? MUT : WARN, sw: 2.5, text: '파일 핸들', fs: 15, color: closed ? MUT : INK });
      if (closed < 1) ref(190, 176, 673, 166, E(u, 0.2, 0.8), WARN);
      lock(775, 240, closed > 0, closed > 0 ? GOOD : WARN, 1);
      tx(80, 254, '블록 끝 → Dispose()', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      tx(775, 300, closed ? '확정 해제' : '열려 있음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: closed ? GOOD : WARN });
      sub(310, 340, 'GC 는 메모리만 돌본다. 핸들·소켓은 using 으로 직접 닫는다', fade(u, 2.0), { 'font-size': 14, fill: INK }); return; }
    frame('CLR 이 돌보는 것');
    if (k === 0) { service(0, true, '회수 담당'); service(1, false); service(2, false);
      slot(50, 90, 'buffer', null, { s: pop(u, 0.2) });
      const cut = seg(u, 1.3, 1.6), gone = seg(u, 1.8, 2.5);
      obj(300, 80, 360, 'byte[1_000_000]', ['1MB 배열'], { op: 1 - gone * 0.6, dash: gone > 0 ? '6 5' : null, stroke: gone > 0 ? MUT : INK });
      if (cut < 1) ref(200, 107, 298, 107, E(u, 0.4, 0.9), INK);
      if (cut > 0) { mono(196, 112, 'null', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', opacity: cut }); cross(250, 107, 9, pop(u, 1.3)); }
      if (gone > 0) pill(480, 180, 'GC 가 회수할 대상', GOOD, pop(u, 1.9), { fs: 14 });
      sub(480, 240, 'free() 를 부르지 않는다. 언제 회수할지는 GC 가 정한다', fade(u, 2.2), { 'font-size': 14, fill: INK });
      return; }
    if (k === 1) { service(0, false, '계속 동작'); service(1, true, '(int)o 를 막음'); service(2, true, '예외 던짐');
      slot(50, 90, 'o', null); obj(300, 80, 220, 'String', ['"text"'], {}); ref(200, 107, 298, 107, 1, INK);
      const g = seg(u, 0.3, 1.2);
      card(410, 240, 300, 48, { rx: 8, stroke: INFO, sw: 2, s: pop(u, 0.3), text: 'int n = (int)o;', mono: true, fs: 15 });
      if (g > 0) { mono(300, 310, 'String', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: g }); mono(370, 310, '≠', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) }); mono(400, 310, 'Int32', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: g }); }
      pill(480, 356, 'InvalidCastException', BAD, pop(u, 1.4), { fs: 15, mono: true });
      sub(480, 392, '쓰레기 값을 읽기 전에 런타임이 멈춘다', fade(u, 1.9), { 'font-size': 14, fill: INK });
      return; }
    // k2~4 이벤트 구독과 누수
    const subGone = k === 4 ? seg(u, 1.6, 2.4) : 0;
    service(0, k >= 3, k === 3 ? '참조가 있어 못 지움' : k === 4 ? '이제 회수' : '참조 추적'); service(1, false, '통과'); service(2, false, '조용함');
    slot(50, 90, 'publisher', null);
    const subLive = k === 2 || (k === 3 && u < 0.6);
    slot(50, 140, 'subscriber', null, { stroke: subLive ? INK : GRID });
    if (!subLive) sub(130, 196, '지역 변수는 범위를 벗어남', 1);
    const P = obj(290, 70, 190, 'Publisher', ['OnTick: [Handler]'], {});
    const S = obj(520, 170, 160, 'Subscriber', ['Handler()'], { op: 1 - subGone, stroke: k === 4 && u > 1.6 ? MUT : INK, dash: k === 4 && u > 1.6 ? '6 5' : null });
    ref(200, 107, 288, 107, 1, INK);
    if (subLive) ref(200, 157, 518, 190, 1, INK);
    const evOn = k === 2 ? E(u, 0.6, 1.6) : k === 3 ? 1 : 1 - seg(u, 0.3, 0.9);
    if (evOn > 0) { el('path', { d: `M470,118 C 520,118 540,140 ${lerp(470, 560, evOn)},${lerp(118, 168, evOn)}`, fill: 'none', stroke: BAD, 'stroke-width': 3 });
      if (evOn > 0.98) el('circle', { cx: 560, cy: 168, r: 5, fill: BAD }); }
    if (k === 2) { pill(380, 260, 'publisher.OnTick += Handler', BAD, pop(u, 0.3), { fs: 14, mono: true });
      sub(480, 300, '게시자가 구독자를 가리키기 시작한다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); }
    if (k === 3) { // 표시 단계: 뿌리에서 따라가며 표시
      const m = seg(u, 0.8, 2.0);
      if (m > 0) { [[100, 107], [385, 100], [600, 200]].forEach(([x, y], i) => { const s = pop(u, 0.9 + i * 0.4); el('circle', { cx: x + 0, cy: y - 26, r: 9 * s, fill: GOOD, opacity: 0.9 }); });
        sub(480, 280, '뿌리 → Publisher → Subscriber: 살아 있음', fade(u, 1.8), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); }
      card(480, 340, 360, 46, { rx: 8, stroke: BAD, sw: 2, s: pop(u, 2.1) });
      tx(316, 346, 'static List 에 계속 Add 해도 같은 함정', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
    if (k === 4) { pill(380, 260, 'publisher.OnTick -= Handler', GOOD, pop(u, 0.2), { fs: 14, mono: true });
      if (u > 1.2) for (let i = 0; i < 8; i++) { const a = i * 0.8, d = 30 * seg(u, 1.6, 2.6); el('circle', { cx: 600 + Math.cos(a) * d, cy: 200 + Math.sin(a) * d + 30 * seg(u, 1.6, 2.6), r: 4, fill: OFF, opacity: 1 - seg(u, 2.2, 2.7) }); }
      sub(480, 320, '참조가 끊기면 다시 GC 대상이 된다', fade(u, 1.8), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); }

  }

  // ================= 장면 5. 전체 지도 =================
  const CH = ['C# 소스', 'IL + 메타', 'CLR 로드', 'JIT', '기계어', '실행'];
  const CX = [90, 246, 402, 558, 714, 870];
  function chain(n, u0, o) { o = o || {};
    CH.forEach((s, i) => { if (i >= n) return; const s0 = o.pop && o.pop[i] != null ? o.pop[i] : 1;
      card(CX[i], 92, 124, 50, { rx: 10, text: s, fs: 15, stroke: i === 0 ? ACC : i <= 1 ? INFO : i <= 4 ? INK : GOOD, sw: 2.2, s: s0 });
      if (i > 0) grow(CX[i - 1] + 62, 92, CX[i] - 64, 92, o.grow && o.grow[i] != null ? o.grow[i] : 1, MUT); });
    if (n >= 2) sub(168, 64, 'Roslyn', o.rOp ?? 1, { fill: ACC, 'font-weight': 700 }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { chain(2, u, { pop: [pop(u, 0.2), pop(u, 0.9)], grow: [0, seg(u, 0.5, 0.9)], rOp: fade(u, 0.6) });
      tx(90, 160, '.java', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, class: 'mono', opacity: fade(u, 1.5) });
      tx(246, 160, '.class', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, class: 'mono', opacity: fade(u, 1.5) });
      sub(168, 186, 'Java 로 치면 여기까지', fade(u, 1.7));
      terminal(300, 250, 360, 80, ['$ dotnet build', ['  → HelloApp.dll', 'var(--term)']], Math.max(0.001, 2 * seg(u, 1.0, 2.0)), { title: 'terminal' });
      sub(480, 370, '빌드까지는 내 PC 안의 일이다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const all = { grow: [0, 1, 1, 1, 1, 1] };
    if (k === 1) { chain(6, u, { pop: [1, 1, pop(u, 0.2), pop(u, 0.6), pop(u, 1.0), pop(u, 1.4)], grow: [0, 1, seg(u, 0.1, 0.3), seg(u, 0.5, 0.7), seg(u, 0.9, 1.1), seg(u, 1.3, 1.5)] });
      dot([[30, 92], [930, 92]], seg(u, 1.6, 2.7), ACC, 8);
      sub(480, 200, '여기까지가 코드가 도는 전체 경로', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    chain(6, u, all);
    // 관리 서비스 띠
    const bw = k === 2 ? E(u, 0.2, 1.2) : 1;
    el('rect', { x: 340, y: 132, width: 590 * bw, height: 34, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8 });
    tx(635, 155, 'GC · 타입 검사 · 예외 — 실행 내내', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 1.0) : 1 });
    if (k === 2) { [['Java', '.java → .class → JVM → HotSpot JIT'], ['.NET', '.cs → IL(.dll) → CLR → RyuJIT']].forEach(([a, b], i) => {
        tx(160, 250 + i * 40, a, { 'font-size': 15, 'font-weight': 800, fill: i ? ACC : MUT, opacity: fade(u, 1.4 + i * 0.3) });
        mono(230, 250 + i * 40, b, { 'font-size': 15, fill: i ? INK : MUT, opacity: fade(u, 1.4 + i * 0.3) }); });
      sub(480, 350, '이 셋이 늘 붙어 있어서 "관리 런타임"이다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { // NuGet
      card(170, 290, 210, 110, { rx: 10, stroke: INFO, sw: 2 }); mono(80, 260, 'HelloApp.csproj', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      mono(80, 290, '<PackageReference', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 1.4) }); mono(92, 312, 'Newtonsoft.Json />', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.4) });
      const a = E(u, 0.4, 1.3); card(430, 205, 150, 46, { rx: 23, text: 'NuGet', fs: 16, stroke: ACC, color: ACC });
      if (a < 1) card(lerp(430, 300, a), lerp(256, 300, a), 170, 38, { rx: 8, text: 'Newtonsoft.Json', fs: 14, mono: true, stroke: ACC, fill: ACCBG });
      terminal(600, 290, 330, 80, ['$ dotnet add package', '  Newtonsoft.Json'], Math.max(0.001, 2 * seg(u, 0.2, 1.0)), { title: 'terminal', fs: 13.5 });
      sub(480, 405, '남의 코드와 그 버전까지 내 배포물에 들어온다', fade(u, 1.9), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { // TFM 사고: 실제 실행 메시지
      fileIcon(110, 280, 'net8.0 앱', { tag: 'dll', stroke: INFO });
      const a = seg(u, 0.3, 1.0), back = seg(u, 1.0, 1.4); fly(140, 270, 330, 270, a < 1 ? a : 0.999 - back * 0.5, 'net8.0', { fill: INFO, mono: true, stay: false });
      card(450, 280, 220, 96, { rx: 10, stroke: BAD, sw: 2.5 }); tx(360, 262, '서버 런타임', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      mono(360, 290, 'NETCore.App 10.0.2', { 'font-size': 14, 'font-weight': 700 }); mono(360, 314, '8.0 없음', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      if (u > 1.0) cross(330, 240, 12, pop(u, 1.0));
      terminal(580, 220, 350, 120, [['You must install or update', '#fca5a5'], ['.NET to run this application.', '#fca5a5'], "Framework: 'Microsoft.NETCore.App',", "  version '8.0.0'"], Math.max(0.001, 4 * seg(u, 1.2, 2.3)), { title: 'dotnet app.dll', fs: 13.5, lh: 20 });
      sub(480, 380, '10.0 만 있는 머신에서도 8.0 앱은 기본으로 안 돈다 (직접 실행해 본 결과)', fade(u, 2.3), { 'font-size': 14, fill: INK }); return; }
    if (k === 5) { // NuGet 버전 충돌
      const N = [['App', 120, 300], ['패키지 A', 300, 240], ['패키지 B', 300, 360], ['Lib v1 기대', 520, 240], ['Lib v2 기대', 520, 360]];
      N.forEach(([s, x, y], i) => card(x, y, 140, 40, { rx: 8, text: s, fs: 14, stroke: i >= 3 ? WARN : INK, s: pop(u, 0.1 + i * 0.2) }));
      [[190, 290, 228, 250], [190, 310, 228, 350], [370, 240, 448, 240], [370, 360, 448, 360]].forEach(([a, b, c2, d], i) => grow(a, b, c2, d, seg(u, 0.3 + i * 0.2, 0.6 + i * 0.2), MUT));
      card(730, 300, 150, 44, { rx: 8, text: '실제 로드: Lib v2', fs: 14, stroke: INK, s: pop(u, 1.3) });
      grow(592, 240, 655, 290, seg(u, 1.4, 1.7), BAD); grow(592, 360, 655, 310, seg(u, 1.4, 1.7), GOOD);
      pill(760, 380, 'MissingMethodException', BAD, pop(u, 1.8), { fs: 13.5, mono: true });
      mono(560, 200, '$ dotnet list package --outdated / --vulnerable', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(820, 240, '(버전 이름은 예시)', fade(u, 1.5)); return; }
    // k6
    banner(480, 240, 'CLR = .NET 의 JVM · C# → IL → JIT → 기계어 + GC·타입·예외', pop(u, 0.3));
    pill(480, 310, '배포 사고 1순위: TFM 불일치 · NuGet 버전 충돌', BAD, pop(u, 0.9), { fs: 14.5 });
    pill(480, 370, '다음 장 I-1-2: 이 위에서 도는 값 타입과 참조 타입', ACC, pop(u, 1.5), { fs: 14.5 });
  }

  // ---------- 확인 문제 (장면마다 1개) ----------
  const quiz = [
    { q: 'Main 없이 두 줄만 쓴 Program.cs를 빌드하면 진입점은 어떻게 되는가?',
      o: ['진입점 없이 첫 줄부터 바로 CPU가 실행한다', '컴파일러가 Program 클래스와 진입 메서드를 만들어 두 줄을 그 안에 넣는다', '런타임이 실행 때마다 Main을 새로 찾아 만든다'], a: 1,
      why: '최상위 문은 Main을 생략하는 문법일 뿐이다. 컴파일러가 Program 클래스와 <Main>$ 메서드를 만들어 두 줄을 감싼다.' },
    { q: '"Hello, {name}!" 보간 문자열은 IL에서 어떻게 처리되는가?',
      o: ['"Hello, ", name, "!" 세 조각을 스택에 싣고 String.Concat이 하나로 합친다', 'CPU가 {name} 자리를 직접 바꿔 끼운다', 'Roslyn이 빌드 때 "Hello, World!"로 미리 바꿔 둔다'], a: 0,
      why: '.NET 10으로 빌드한 IL을 풀어 보면 ldstr·ldloc·ldstr로 세 조각을 싣고 call String::Concat으로 합친다. IL은 레지스터 없이 스택으로 값을 다룬다.' },
    { q: 'JIT가 Main()을 번역한 뒤 Main()을 두 번째로 부르면 무슨 일이 생기는가?',
      o: ['IL을 처음부터 다시 번역한다', '번역 없이 캐시해 둔 기계어를 바로 실행한다', 'AOT로 자동 전환된다'], a: 1,
      why: 'JIT는 처음 호출될 때 한 번만 번역하고 기계어를 캐시한다. 직접 재 보니 번역 수가 첫 호출에 +1, 두 번째 호출에 +0이었다.' },
    { q: '이벤트를 += 로 구독만 하고 -= 를 하지 않으면 구독자 객체는 어떻게 되는가?',
      o: ['게시자가 살아 있는 한 참조가 남아 GC가 회수하지 못한다', 'GC가 쓸모없다고 판단해 곧 회수한다', '컴파일러가 경고를 내고 빌드를 멈춘다'], a: 0,
      why: 'GC는 쓸모가 아니라 참조를 기준으로 판단한다. 게시자의 호출 목록이 구독자를 가리키는 동안 구독자는 살아 있는 객체다.' },
    { q: 'net8.0으로 빌드한 앱을 .NET 10 런타임만 있는 서버에서 실행하면 어떻게 되는가?',
      o: ['10.0이 더 새 버전이라 그대로 돈다', '실행이 거부되고 .NET을 설치하라는 메시지가 나온다', 'JIT가 IL을 10.0용으로 다시 컴파일해 돈다'], a: 1,
      why: '직접 실행해 보니 "You must install or update .NET" 메시지와 함께 8.0.0 프레임워크를 찾지 못했다. 기본 설정은 주 버전을 넘어가지 않는다.' },
  ];

  const summary = [
    'C# 소스는 CPU가 바로 못 읽는 글자라서 실행하려면 두 번 번역해야 한다.',
    'Roslyn이 소스를 IL과 메타데이터가 든 .dll로 만들고, IL은 OS와 CPU를 가리지 않는다.',
    'CLR의 JIT는 메서드가 처음 불릴 때 한 번만 기계어로 바꾸고 그 결과를 다시 쓴다.',
    'GC는 참조가 남은 객체를 지우지 못하니 이벤트는 -=로 끊고 파일은 using으로 닫는다.',
  ];
  const review = [
    { q: '서버에 올린 앱이 처음 몇 번의 요청만 유난히 느리고 그 뒤로는 빨라졌다. 먼저 떠올릴 원인은?',
      o: ['GC가 처음에 메모리를 많이 회수해서', '메서드가 처음 불릴 때마다 JIT가 IL을 기계어로 번역해서', 'NuGet 패키지를 그때 내려받아서'], a: 1,
      why: '첫 호출만 번역 비용을 내는 워밍업 구간이다. 시작 지연이 문제라면 AOT나 ReadyToRun으로 번역을 빌드 시점으로 옮긴다.' },
    { q: '관리 코드인데도 오래 켜 둔 앱의 메모리가 계속 늘어난다. 가장 먼저 확인할 것은?',
      o: ['GC가 꺼져 있는지', '이벤트 구독을 해제하지 않았거나 static 컬렉션에 계속 담고 있는지', 'IL이 CPU에 맞지 않게 컴파일됐는지'], a: 1,
      why: 'GC는 참조가 살아 있는 객체를 지우지 않는다. 해제하지 않은 이벤트 핸들러와 계속 커지는 static 컬렉션이 대표적인 관리 메모리 누수다.' },
    { q: '같은 HelloApp.dll을 Windows x64 PC와 Linux ARM64 서버에 그대로 복사했다. 둘 다 실행되려면 무엇이 맞아야 하나?',
      o: ['두 머신에 net8.0에 맞는 .NET 런타임이 깔려 있어야 한다', 'CPU마다 .dll을 따로 컴파일해야 한다', '두 머신의 C# 컴파일러 버전이 같아야 한다'], a: 0,
      why: 'IL은 CPU에 묶이지 않아 같은 .dll을 쓸 수 있다. 대신 TFM에 맞는 런타임이 있어야 CLR이 로드하고 JIT로 그 CPU의 기계어를 만든다.' },
  ];

  R.page({ title: 'C# 코드가 기계어가 되기까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
