/* III-2-2 스트림과 버퍼 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 1 Buffer 바이트 · 2 스트림 4종 · 3 readFile vs 스트림 메모리 · 4 pipe 와 백프레셔 · 5 data·end·error 와 함정
 * 실측값(node v24): Buffer.from("Hi🔥") → <Buffer 48 69 f0 9f 94 a5>, length 6, "Hi🔥".length 4, base64 SGnwn5Sl, hex 4869f09f94a5.
 *   fs 읽기 스트림 청크 65536, 쓰기 highWaterMark 16384. 300MB 파일 복사 최대 RSS 증가: readFile +301~302MB, data+write +22~24MB, pipe +20~23MB.
 *   느린 소비자(쓰기 1ms, highWaterMark 16KB, 4MB 파일): 수동 data+write 대기열 최대 3392KB, pipe 64KB(pause 65회).
 *   data.csv("a,b" 40000줄 + "가,나" 10000줄 = 240000바이트, utf8): 청크 65536/65536/47232/21696 글자, 총 200000 글자. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, cells, terminal, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  const FIRE = '\u{1F525}';

  // ---------- 1. Buffer ----------
  const BY = [72, 105, 240, 159, 148, 165], HX = BY.map((b) => b.toString(16).padStart(2, '0'));
  const GL = [['H', 0, 1], ['i', 1, 1], [FIRE, 2, 4]];   // 글자, 첫 바이트, 바이트 수
  const BX = 230, BW = 78, BG = 8;   // 바이트 칸 시작 · 폭 · 간격
  const bx = (i) => BX + i * (BW + BG);
  function glyphs(s, y) { GL.forEach(([g, b0, n], i) => { const cx = (bx(b0) + bx(b0 + n - 1) + BW) / 2;
      card(cx, y, 64, 56, { rx: 10, text: g, fs: 26, stroke: i === 2 ? WARN : INK, s: s(i) }); }); }
  function bytes(y, vals, s, col) { vals.forEach((v, i) => card(bx(i) + BW / 2, y, BW, 50, { rx: 8, text: String(v), fs: 18, mono: true, stroke: col || INK, color: col || INK, s: s(i) })); }
  function braces(y0, y1, a) { GL.forEach(([g, b0, n], i) => { const x0 = bx(b0) + 4, x1 = bx(b0 + n - 1) + BW - 4, cx = (x0 + x1) / 2;
      el('path', { d: `M${cx},${y0} V${(y0 + y1) / 2} M${x0},${y1} V${(y0 + y1) / 2} H${x1} V${y1}`, fill: 'none', stroke: i === 2 ? WARN : MUT, 'stroke-width': 2, opacity: a });
      tx(cx, y1 + 94, n + '바이트', { 'font-size': 13.5, 'font-weight': 700, fill: i === 2 ? WARN : MUT, opacity: a, 'text-anchor': 'middle' }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { tx(40, 92, '"Hi' + FIRE + '"', { 'font-size': 20, 'font-weight': 800, class: 'mono' });
      glyphs((i) => (k === 0 ? pop(u, 0.2 + i * 0.2) : 1), 86);
      braces(116, 168, k === 0 ? fade(u, 1.4) : 1);
      tx(40, 222, k === 0 ? 'utf8 바이트' : '16진수 표기', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      bytes(216, k === 0 ? BY : HX, (i) => (k === 0 ? pop(u, 0.8 + i * 0.12) : 1), k === 1 ? ACC : INK);
      if (k === 0) { note(40, 300, '한 칸 = 1바이트 (0~255) · 모두 6바이트', fade(u, 1.8)); return; }
      mono(40, 300, typed('console.log(buf)', E(u, 0.2, 0.7)), { 'font-size': 15, fill: MUT });
      mono(40, 336, typed('<Buffer 48 69 f0 9f 94 a5>', E(u, 0.8, 1.8)), { 'font-size': 17, 'font-weight': 800, fill: ACC });
      note(40, 380, 'buf[0] 은 72 = 0x48', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 2) { tx(40, 52, '같은 "Hi' + FIRE + '", 세 가지 길이', { 'font-size': 18, 'font-weight': 800 });
      [['눈에 보이는 글자', 3, INK, 'H · i · ' + FIRE], ['"Hi' + FIRE + '".length', 4, INFO, 'UTF-16 단위 — ' + FIRE + ' 하나가 2'], ['buf.length', 6, ACC, '바이트 — ' + FIRE + ' 하나가 4']].forEach(([n, v, col, d], i) => {
        const y = 110 + i * 92, g = E(u, 0.3 + i * 0.5, 1.1 + i * 0.5);
        tx(40, y + 6, n, { 'font-size': 15, 'font-weight': 700, fill: col, class: i ? 'mono' : null });
        for (let j = 0; j < v; j++) el('rect', { x: 290 + j * 62, y: y - 18, width: 54, height: 34, rx: 6, fill: col, opacity: 0.8 * clamp(g * v - j) });
        mono(290 + v * 62 + 10, y + 6, String(v), { 'font-size': 22, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.5) });
        tx(290, y + 40, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0 + i * 0.5) }); });
      note(40, 400, '업로드 크기 제한처럼 크기를 잴 때는 바이트(buf.length)로 잰다', fade(u, 2.2), { fill: WARN, 'font-size': 14.5 }); return; }
    if (k === 3) { tx(40, 92, '같은 6바이트', { 'font-size': 15, 'font-weight': 700, fill: MUT }); bytes(80, HX, () => 1);
      [['"utf8"', 'Hi' + FIRE, INK], ['"base64"', 'SGnwn5Sl', INFO], ['"hex"', '4869f09f94a5', ACC]].forEach(([e, r, col], i) => { const y = 180 + i * 62, a = fade(u, 0.3 + i * 0.6);
        mono(40, y, `buf.toString(${e})`, { 'font-size': 15, 'font-weight': 700, opacity: a }); grow(290, y - 5, 350, y - 5, E(u, 0.4 + i * 0.6, 0.7 + i * 0.6), col);
        mono(366, y, r, { 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.7 + i * 0.6) }); });
      note(560, 366, '바이트는 그대로, 읽는 규칙만 다르다', fade(u, 2.2), { fill: MUT }); return; }
    mono(40, 92, 'Buffer.alloc(4)', { 'font-size': 17, 'font-weight': 800 });
    bytes(150, ['00', '00', '00', '00'], (i) => pop(u, 0.3 + i * 0.15), MUT);
    note(40, 250, '0 으로 채운 4바이트를 미리 잡는다', fade(u, 1.1));
    pill(480, 320, '스트림이 흘려보내는 청크도 이런 Buffer 다', ACC, pop(u, 1.7), { fs: 15, fill: PANEL }); }
  function typed(s, g) { return s.slice(0, Math.round(s.length * clamp(g))); }

  // ---------- 2. Stream 4종 ----------
  const RX = 120, TX = 480, WX = 840, PY = 150;
  function tap(x, y, s, label, col) { const g = R.G(x, y, s);
    el('rect', { x: -76, y: -44, width: 152, height: 88, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    tx(0, -10, label[0], { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g); mono(0, 16, label[1], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { [['fs', '파일 스트림'], ['zlib', '압축 스트림'], ['net', '소켓 스트림']].forEach(([m, d], i) => { const x = 180 + i * 300;
        pill(x, 140, `require("${m}")`, ACC, pop(u, 0.3 + i * 0.4), { mono: true, fs: 15, fill: PANEL }); tx(x, 186, d, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6 + i * 0.4) }); });
      note(180, 290, '스트림은 Node 전체에 깔린 공통 규약 — 만드는 모듈만 다르다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    tap(RX, PY, k === 1 ? pop(u, 0.2) : 1, ['Readable', 'createReadStream'], INFO);
    if (k >= 2) tap(WX, PY, k === 2 ? pop(u, 0.2) : 1, ['Writable', 'createWriteStream'], GOOD);
    if (k >= 4) tap(TX, PY, k === 4 ? pop(u, 0.2) : 1, ['Transform', 'createGzip'], ACC);
    const flow = k >= 4;
    el('line', { x1: RX + 78, y1: PY, x2: WX - 78, y2: PY, stroke: k >= 2 ? GRID : 'none', 'stroke-width': 3, 'stroke-dasharray': flow ? null : '6 6' });
    if (k === 1) { note(RX - 76, PY + 90, '통로만 만들었다 — 파일 내용은 아직 안 읽혔다', fade(u, 1.0), { fill: INFO, 'font-size': 14.5 }); return; }
    if (k === 2) { note(WX - 300, PY + 90, '받는 쪽 통로 · HTTP 응답 res 도 Writable', fade(u, 1.0), { fill: GOOD, 'font-size': 14.5 });
      note(RX - 76, PY + 124, 'HTTP 요청 req 는 Readable', fade(u, 1.6), { fill: INFO, 'font-size': 14.5 }); return; }
    if (k === 3) { const g = R.G(480, 320, pop(u, 0.2)); el('rect', { x: -170, y: -50, width: 340, height: 100, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.2 }, g);
      tx(0, -24, 'Duplex · TCP 소켓', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }, g);
      el('line', { x1: -140, y1: 2, x2: 140, y2: 2, stroke: INFO, 'stroke-width': 2.5, 'marker-end': 'url(#ra-ah)' }, g); el('line', { x1: 140, y1: 30, x2: -140, y2: 30, stroke: GOOD, 'stroke-width': 2.5, 'marker-end': 'url(#ra-ah)' }, g);
      for (let i = 0; i < 3; i++) { dot([[340, 322], [620, 322]], (t * 0.7 + i / 3) % 1, INFO, 5); dot([[620, 350], [340, 350]], (t * 0.6 + i / 3) % 1, GOOD, 5); }
      tx(662, 326, 'write', { 'font-size': 14, fill: INFO, 'font-weight': 700 }); tx(290, 354, 'read', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end' });
      note(40, 404, '두 방향이 서로 독립 — 보내는 것과 받는 것이 달라도 된다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 4) { for (let i = 0; i < 3; i++) { const p = (t * 0.45 + i / 3) % 1;
        if (p < 0.5) card(lerp(RX + 100, TX - 100, p * 2), PY, 44, 30, { rx: 5, text: '청크', fs: 13.5, fill: INFO, stroke: 'none', color: PANEL });
        else card(lerp(TX + 96, WX - 96, (p - 0.5) * 2), PY, 26, 22, { rx: 4, fill: ACC, stroke: 'none' }); }
      note(TX - 160, PY + 90, '통과하며 바꾼다 — 들어간 청크보다 작게 나온다', fade(u, 1.0), { fill: ACC, 'font-size': 14.5 });
      sub(TX, PY + 120, 'Transform 은 Duplex 의 특수한 형태', fade(u, 1.6)); return; }
    // k === 5: 64KB 청크
    for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1; if (p < 0.4 || p > 0.6) dot([[RX + 78, PY], [WX - 78, PY]], p, ACC, 6); }
    tx(40, 268, '큰 파일', { 'font-size': 15, 'font-weight': 700 });
    const n = 40; for (let i = 0; i < n; i++) el('rect', { x: 150 + i * 18, y: 252, width: 15, height: 26, rx: 3, fill: i === Math.floor(t * 4) % n ? ACC : OFF, opacity: 0.9 });
    tx(40, 350, '메모리', { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 150, y: 330, width: 180, height: 34, rx: 6, fill: SOFT, stroke: GRID });
    card(205, 347, 100, 26, { rx: 5, text: '64KB 한 조각', fs: 13.5, fill: ACC, stroke: 'none', color: PANEL, s: pop(u, 0.6) });
    note(370, 352, 'fs 읽기 스트림 청크 기본값 65536 바이트 — 파일이 100GB 여도 한 번에 이만큼', fade(u, 1.2), { 'font-size': 14 }); }

  // ---------- 3. readFile vs 스트림 메모리 (300MB 파일 복사 실측) ----------
  const RF = [[0, 0], [0.1, 32], [0.2, 64], [0.3, 96], [0.4, 128], [0.5, 160], [0.6, 192], [0.7, 224], [0.8, 256], [0.9, 290], [1, 301]];
  const ST = [[0, 0], [0.04, 16], [0.15, 20], [0.3, 18], [0.45, 22], [0.6, 19], [0.75, 21], [0.9, 20], [1, 22]];
  function s3(t, c) { const { k, u } = c;
    const ax = axes(110, 60, 470, 290, { x: [0, 1], y: [0, 320], yt: [0, 100, 200, 300], xl: '복사 진행 →', yl: '메모리 증가 (MB)', grid: true });
    el('line', { x1: ax.X(0), y1: ax.Y(300), x2: ax.X(1), y2: ax.Y(300), stroke: WARN, 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }); tx(ax.X(1) - 4, ax.Y(300) - 8, '파일 크기 300MB', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', 'font-weight': 700 });
    const rg = k === 0 ? E(u, 0.3, 2.4) : 1, sg = k <= 1 ? 0 : k === 2 ? 0 : k === 3 ? E(u, 0.3, 2.4) : 1;
    line(ax, RF, rg, BAD, { sw: 3.5 });
    if (k >= 2) line(ax, ST, sg, ACC, { sw: 3.5 });
    const lab = (x, y, s, col, a) => tx(x, y, s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: a });
    lab(610, 92, 'readFile — 파일만큼 쌓인다', BAD, k === 0 ? fade(u, 1.0) : 1);
    if (k === 0) { note(610, 128, '다 읽을 때까지 계속 차오른다', fade(u, 1.8), { fill: MUT, 'font-size': 14 }); }
    if (k === 1) { tx(610, 140, '동시 요청 3개면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      for (let i = 0; i < 3; i++) card(690, 190 + i * 40, 160, 34, { rx: 6, text: 'data (파일 통째)', fs: 13.5, fill: BADBG, stroke: BAD, color: BAD, s: pop(u, 0.5 + i * 0.35) });
      note(610, 340, '필요한 메모리도 3배 · OOM 은 프로세스 전체를 죽인다', fade(u, 1.9), { fill: BAD, 'font-size': 14 }); }
    if (k === 2) { lab(610, 140, '스트림 두 개 — 통로만 열었다', ACC, fade(u, 0.3)); note(610, 176, '아직 메모리에 올라온 데이터가 없다', fade(u, 1.0), { fill: MUT, 'font-size': 14 }); el('circle', { cx: ax.X(0), cy: ax.Y(0), r: 7, fill: ACC }); }
    if (k === 3) { lab(610, 140, '스트림 — 청크가 들어왔다 나간다', ACC, 1);
      el('rect', { x: 640, y: 200, width: 220, height: 60, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); tx(650, 192, '메모리', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const p = (t * 0.9) % 1; card(lerp(610, 890, p), 230, 64, 30, { rx: 5, text: '64KB', fs: 13.5, mono: true, fill: ACC, stroke: 'none', color: PANEL });
      note(610, 300, '쓴 조각은 회수되어 곡선이 평평하다', fade(u, 1.6), { fill: MUT, 'font-size': 14 }); }
    if (k === 4) { lab(610, 140, '스트림 — 평평하게', ACC, 1);
      mono(610, 210, 'readFile  +301MB', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) });
      mono(610, 244, 'stream    +22MB', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
      note(610, 290, '실측 · 300MB 파일 복사, 최대 RSS 증가', fade(u, 1.2), { fill: MUT, 'font-size': 14 });
      note(610, 320, '결과는 같은 복사, 메모리 곡선만 다르다', fade(u, 1.8), { 'font-size': 14.5 }); } }

  // ---------- 4. pipe 와 백프레셔 ----------
  const P = { r: 130, g: 450, w: 770, y: 130 };
  function parts(conn, o) { o = o || {};
    [[P.r, 'read', INFO], [P.g, 'gzip', ACC], [P.w, 'write', GOOD]].forEach(([x, n, col], i) => { const dead = o.dead && o.dead[i];
      card(x, P.y, 130, 64, { rx: 12, text: n, fs: 17, mono: true, stroke: dead ? OFF : o.err === i ? BAD : col, color: dead ? OFF : o.err === i ? BAD : col, fill: o.err === i ? BADBG : PANEL, sw: 2.5, s: o.s ? o.s(i) : 1 }); });
    [[P.r + 66, P.g - 66], [P.g + 66, P.w - 66]].forEach(([a, b], i) => { const g = clamp(conn * 2 - i);
      if (g > 0) el('line', { x1: a, y1: P.y, x2: lerp(a, b, g), y2: P.y, stroke: MUT, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: o.dim ? 0.35 : 1 }); }); }
  function tank(x, y, lvl, hwm) { el('rect', { x, y, width: 70, height: 120, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    el('rect', { x: x + 4, y: y + 116 - 112 * lvl, width: 62, height: 112 * lvl, rx: 5, fill: lvl >= hwm - 0.02 ? WARN : GOOD, opacity: 0.8 });
    el('line', { x1: x - 8, y1: y + 116 - 112 * hwm, x2: x + 78, y2: y + 116 - 112 * hwm, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    tx(x + 35, y + 160, 'highWaterMark', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); tx(x + 35, y + 140, '쓰기 대기열', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { parts(0, { s: (i) => pop(u, 0.3 + i * 0.3) }); note(130, 240, '부품 세 개 — 아직 이어지지 않아 아무것도 흐르지 않는다', fade(u, 1.5)); sub(P.g, 190, 'Transform', fade(u, 1.0)); return; }
    if (k <= 2) { const paused0 = k === 2 && (Math.floor(t * 0.8) % 2 === 1);
      if (k === 1 || !paused0) for (let i = 0; i < 4; i++) dot([[P.r + 66, P.y], [P.w - 66, P.y]], k === 1 && u < 1.0 ? 0 : (t * 0.5 + i / 4) % 1, ACC, 6);
      parts(k === 1 ? E(u, 0.2, 1.0) : 1);
      mono(130, 50, 'read.pipe(gzip).pipe(write)', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.1) : 1 });
      const paused = k === 2 && (Math.floor(t * 0.8) % 2 === 1);
      if (k === 1) { note(130, 240, '청크 전달 · 백프레셔 · end 전파를 pipe 가 맡는다', fade(u, 1.3), { 'font-size': 14.5 }); sub(480, 276, 'pipe 는 대상 스트림을 돌려줘 이어 붙일 수 있다', fade(u, 1.9)); return; }
      const ph = (t * 0.8) % 1, lvl = paused ? 0.8 * (1 - ph) + 0.15 : 0.15 + 0.65 * ph;
      tank(862, 48, lvl, 0.8);
      if (paused) { card(P.r, P.y + 56, 92, 32, { rx: 16, text: '❚❚ 멈춤', fs: 14, stroke: BAD, color: BAD, fill: BADBG }); }
      note(40, 240, paused ? '대기열이 차면 pipe 가 읽기를 멈춘다' : '대기열이 비면 다시 흐른다', 1, { fill: paused ? BAD : GOOD });
      tx(40, 300, '실측 예 · 느린 쓰기(청크당 1ms), 4MB 파일, 쓰기 대기열 최대', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.8) });
      R.hbar(240, 320, 380, Math.round(3392 * E(u, 1.0, 2.0)), 3392, { col: BAD, text: '수동 data+write ' + Math.round(3392 * E(u, 1.0, 2.0)) + 'KB', h: 18 });
      R.hbar(240, 352, 380, 64, 3392, { col: GOOD, text: 'pipe 64KB', h: 18, u: E(u, 1.0, 2.0) });
      tx(230, 334, '수동', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); tx(230, 366, 'pipe', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); return; }
    if (k === 3) { parts(1, { err: E(u, 0.4, 0.6) > 0.5 ? 1 : -1, dim: u > 0.6 });
      cross(P.g, P.y - 56, 12, pop(u, 0.5));
      mono(P.r, P.y + 66, '계속 열려 있음 ?', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); mono(P.w, P.y + 66, '끝을 모른 채 대기 ?', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      note(130, 270, 'pipe 는 에러를 다음 스트림에 전하지 않는다', fade(u, 1.7), { fill: BAD }); mono(130, 306, "const { pipeline } = require(\"stream\")", { 'font-size': 14.5, fill: ACC, opacity: fade(u, 2.2) }); return; }
    // k === 4: pipeline
    el('rect', { x: 40, y: 70, width: 880, height: 120, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '8 6' }); mono(56, 62, 'pipeline(read, gzip, write, cb)', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    const fail = E(u, 0.6, 0.8) > 0.5;
    parts(1, { err: fail ? 0 : -1, dead: fail ? [false, u > 1.4, u > 1.4] : null });
    if (fail) cross(P.r, P.y - 52, 10, 1);
    grow(P.r, P.y + 34, 480, 270, E(u, 0.8, 1.3), BAD);
    card(480, 296, 300, 50, { rx: 10, text: '(err) => 파이프 실패 처리', fs: 14.5, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.2) });
    note(140, 370, '어디서 실패해도 콜백 하나로 · 나머지 스트림은 정리된다', fade(u, 1.8), { fill: ACC, 'font-size': 14.5 });
    sub(480, 400, '실측: 없는 파일을 읽게 하면 콜백이 ENOENT 를 받는다', fade(u, 2.2)); }

  // ---------- 5. data · end · error 와 함정 ----------
  const CK = [[65536, 65536], [65536, 65536], [47232, 65536], [21696, 43392]];   // [글자, 바이트]
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { tx(480, 46, '스트림 실무 체크리스트', { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'middle' });
      [['대용량을 readFile 로 통째 로드', '스트림으로 청크 처리'], ['pipe 없이 수동 처리 — 백프레셔 무시', 'pipe / pipeline'], ['error 리스너 없음 — 프로세스 다운', '.on("error") 항상'], ['인코딩 실수 — 데이터 깨짐', '인코딩 명시 (utf8 등)']].forEach(([b, f], i) => {
        const y = 100 + i * 72, s = pop(u, 0.2 + i * 0.35); card(480, y, 820, 56, { rx: 10, stroke: GRID, s });
        cross(100, y, 8, s); tx(124, y + 6, b, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3 + i * 0.35) });
        check(560, y, 9, pop(u, 0.5 + i * 0.35)); tx(584, y + 6, f, { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6 + i * 0.35) }); });
      return; }
    mono(40, 50, 'createReadStream("./data.csv", "utf8")', { 'font-size': 15.5, 'font-weight': 800 });
    sub(700, 48, '실측 예 · 240000바이트 (한글 줄 포함)', 1, { 'text-anchor': 'start' });
    if (k === 0) { cells(40, 92, ['61', '2c', '62', '0a'], { w: 52, h: 40, gap: 6, style: (i) => ({ s: pop(u, 0.2 + i * 0.08) }) });
      cells(40, 146, ['ea', 'b0', '80'], { w: 52, h: 40, gap: 6, style: (i) => ({ stroke: WARN, s: pop(u, 0.6 + i * 0.08) }) });
      grow(290, 112, 370, 112, E(u, 0.9, 1.2), ACC); grow(290, 166, 370, 166, E(u, 1.0, 1.3), ACC);
      mono(386, 118, '"a,b\\n"  4글자', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      mono(386, 172, '"가"  1글자', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) });
      note(40, 236, '"utf8" 을 주면 청크가 Buffer 대신 문자열로 온다', fade(u, 1.6));
      note(40, 270, '이때 chunk.length 는 바이트가 아니라 글자 수 — "가" 는 3바이트, 1글자', fade(u, 2.1), { fill: WARN, 'font-size': 14.5 }); return; }
    // 청크 막대 (k1~3)
    const nshow = k === 1 ? Math.min(4, Math.floor(E(u, 0.2, 2.2) * 4 + 0.001)) : 4;
    let total = 0;
    CK.forEach(([ch, by], i) => { if (i >= nshow) return; total += ch; const y = 92 + i * 46;
      el('rect', { x: 140, y, width: 380 * by / 65536, height: 30, rx: 5, fill: SOFT, stroke: GRID });
      el('rect', { x: 140, y, width: 380 * ch / 65536, height: 30, rx: 5, fill: ACC, opacity: 0.85 });
      mono(40, y + 21, `data #${i + 1}`, { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      mono(536, y + 21, `${ch} 글자 / ${by} 바이트`, { 'font-size': 14, fill: ch === by ? INK : WARN, 'font-weight': 700 }); });
    if (k !== 3) mono(40, 300, `total = ${total}`, { 'font-size': 17, 'font-weight': 800, fill: ACC });
    if (k === 1) { note(330, 300, 'data 는 청크마다 여러 번 불린다', fade(u, 1.0), { fill: MUT, 'font-size': 14.5 }); return; }
    if (k === 2) { card(800, 300, 80, 34, { rx: 17, text: 'end', fs: 15, mono: true, fill: INK, stroke: 'none', color: PANEL, s: pop(u, 0.3) });
      note(330, 300, '딱 한 번 — 여기서 합계를 확정한다', fade(u, 0.7), { 'font-size': 14.5 });
      mono(40, 350, '완료, 총 200000 글자', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.3) }); note(330, 350, '파일은 240000 바이트 — 한글 줄이 3바이트씩', fade(u, 1.8), { fill: WARN, 'font-size': 14 }); return; }
    // k === 3: error
    el('rect', { x: 0, y: 280, width: 960, height: 140, fill: PANEL });
    mono(40, 312, 'createReadStream("./없는파일.csv")', { 'font-size': 15, 'font-weight': 700 });
    grow(370, 307, 430, 307, E(u, 0.3, 0.6), BAD); pill(490, 307, 'ENOENT', BAD, pop(u, 0.6), { mono: true, fs: 14 });
    [['on("error") 있음', '읽기 실패: ENOENT … 서버는 계속', GOOD], ['on("error") 없음', '잡히지 않은 예외 → 프로세스 다운', BAD]].forEach(([a, b, col], i) => { const y = 356 + i * 36, op = fade(u, 1.0 + i * 0.5);
      tx(40, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op, class: 'mono' }); tx(250, y, b, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op }); });
    note(620, 312, 'try/catch 로는 못 잡는다', fade(u, 2.0), { fill: BAD, 'font-size': 14.5 }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'Buffer.from("Hi🔥").length는 얼마인가?',
      o: ['3 — 글자 수', '4 — 문자열 length와 같다', '6 — 바이트 수'], a: 2,
      why: 'H와 i는 1바이트씩, 🔥는 utf8로 4바이트다. 문자열 "Hi🔥".length는 4, 눈에 보이는 글자는 3개다.' },
    { q: '압축(zlib.createGzip)처럼 지나가는 데이터를 바꿔 내보내는 스트림은 무엇인가?',
      o: ['Readable', 'Transform', 'Writable'], a: 1,
      why: 'Transform은 읽기와 쓰기를 함께 가진 Duplex의 특수형이다. 파이프 중간에 끼워 압축·암호화·파싱을 한다.' },
    { q: '300MB 파일을 복사할 때 readFile과 스트림의 메모리 차이로 맞는 것은?',
      o: ['readFile은 파일 크기만큼 늘고 스트림은 청크 단위로만 늘어난다', '둘 다 300MB씩 쓴다', '스트림이 더 많이 쓴다'], a: 0,
      why: '실측에서 readFile은 RSS가 약 301MB 늘었고 스트림은 약 22MB만 늘었다. 스트림은 64KB 조각을 쓰고 나면 회수한다.' },
    { q: '쓰기가 느린데 read.on("data")에서 write.write(chunk)만 부르면 무슨 일이 생기는가?',
      o: ['읽기가 자동으로 느려진다', 'write가 에러를 던진다', '못 쓴 청크가 메모리에 쌓인다'], a: 2,
      why: '수동 방식은 write()의 반환값과 drain을 무시해 대기열이 커진다. 실측에서 3392KB까지 쌓였고 pipe는 64KB에 머물렀다.' },
    { q: 'createReadStream에 error 리스너를 걸지 않고 없는 파일을 읽으면 어떻게 되는가?',
      o: ['data가 0번 불리고 조용히 끝난다', '잡히지 않은 예외가 되어 프로세스가 죽는다', 'end만 한 번 불린다'], a: 1,
      why: '스트림 에러는 나중에 error 이벤트로 온다. 리스너가 없으면 EventEmitter의 error 규칙대로 throw되어 프로세스가 내려간다.' },
  ];
  const summary = [
    'Buffer는 바이트 배열이라 길이가 글자 수가 아니라 바이트 수다.',
    '스트림은 데이터를 64KB 조각으로 흘려 파일이 커도 메모리를 조금만 쓴다.',
    'pipe는 쓰기가 느리면 읽기를 멈춰 대기열이 쌓이지 않게 한다.',
    '스트림을 이을 때는 pipeline을 쓰고 error 리스너는 꼭 건다.',
  ];
  const review = [
    { q: '동영상 다운로드 API에 사용자가 몰리자 서버가 메모리 부족으로 죽었다. 핸들러는 readFile로 파일을 읽어 res.end로 보낸다. 고칠 방향은?',
      o: ['createReadStream(파일).pipe(res)로 바꾼다', 'readFile에 "utf8"을 준다', 'setMaxListeners를 올린다'], a: 0,
      why: 'readFile은 요청마다 파일 전체를 메모리에 올린다. 스트림으로 흘리면 요청당 청크 몇 개만 쓰고, res도 Writable이라 바로 이을 수 있다.' },
    { q: 'CSV 업로드 크기를 chunk.length를 더해 재고 있다. 한글 파일에서 실제 크기보다 작게 나온다. 원인은?',
      o: ['highWaterMark가 64KB라서', '스트림에 "utf8"을 줘서 length가 글자 수가 됐다', 'end 이벤트가 두 번 불려서'], a: 1,
      why: '인코딩을 주면 청크가 문자열이 되어 length가 글자 수다. 실측에서 240000바이트 파일이 200000글자로 나왔다. 바이트는 Buffer로 받거나 Buffer.byteLength로 잰다.' },
    { q: '압축 파이프 중간에서 에러가 나자 요청이 끝나지 않고 매달렸다. pipe 두 번으로 이어 두었다. 바꿀 것은?',
      o: ['gzip을 빼고 readFile을 쓴다', 'data 리스너를 추가한다', 'stream.pipeline으로 이어 에러를 콜백 하나로 받는다'], a: 2,
      why: 'pipe는 중간 스트림의 에러를 다음으로 전하지 않는다. pipeline은 어느 단계의 실패든 콜백 하나로 받고 나머지 스트림을 정리한다.' },
  ];

  R.page({ title: 'Buffer와 Stream — 바이트와 청크', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
