/* IV-1-1 토큰 비용 추적 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   숫자 출처: tiktoken(cl100k_base, gpt-4) 실제 실행, pricing.py 단가로 다시 계산한 값. 대시보드·z-score 곡선 모양은 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, axes, line, hbar, zone, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 토큰 칩: 왼쪽 위 (x, y). 폭을 돌려준다
  function chipW(s, fs) { return Math.max(24, tw(s, fs || 15) + 14); }
  function chip(x, y, s, o) { o = o || {}; const fs = o.fs || 15, w = o.w || chipW(s, fs), h = o.h || 30, sc = o.s ?? 1;
    if (sc <= 0.01) return w; const g = G(x + w / 2, y + h / 2, sc, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 6, fill: o.fill || ACCBG, stroke: o.stroke || ACC, 'stroke-width': 1.6, 'stroke-dasharray': o.dash }, g);
    mono(0, fs * 0.36, s, { 'text-anchor': 'middle', 'font-size': fs, fill: o.color || INK, 'font-weight': 600 }, g); return w; }
  // 칩 한 줄을 n(소수 가능)개까지 차례로 보인다
  function chipRow(x, y, items, n, o) { o = o || {}; const gap = o.gap ?? 6, fs = o.fs || 15; let cx = x; const pos = [];
    items.forEach((it, i) => { const s = typeof it === 'string' ? it : it.t, st = typeof it === 'string' ? {} : it, w = chipW(s, fs);
      const sc = clamp(n - i); chip(cx, y, s, Object.assign({ fs, s: sc < 1 ? R.spring(sc) : 1 }, o.style || {}, st)); pos.push([cx, w]); cx += w + gap; });
    return pos; }
  const money = (v, d) => '$' + v.toLocaleString('en-US', { minimumFractionDigits: d ?? 0, maximumFractionDigits: d ?? 0 });
  // 로그 눈금: v → x
  const logx = (v, x0, x1, lo, hi) => x0 + (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) * (x1 - x0);

  // ───────── 1. tiktoken 으로 세기 ─────────
  const HELLO = [['Hello', 9906], [',', 11], [' world', 1917], ['!', 0]];
  const ENG = ['I', '␣love', '␣programming', '.'];
  const KOR = ['나', '는', '␣프', '로그', '래', { t: '밍', dash: '4 3' }, { t: '·', dash: '4 3' }, '을', { t: '␣좋', dash: '4 3' }, { t: '·', dash: '4 3' }, '아', '합니다', '.'];
  // 메시지 두 개: [역할, 내용, 내용 토큰 수]
  const MSG = [['system', '친절한 상담원', 9], ['user', '환불 정책?', 8]];
  function tokenBar(x, y, n, o) { o = o || {}; const cw = 26, cells = [];   // 28칸: 3 틀 + 1 role + 9 / 3 + 1 + 8 / 3 응답
    MSG.forEach(([, , c]) => { for (let i = 0; i < 3; i++) cells.push(WARN); cells.push(INFO); for (let i = 0; i < c; i++) cells.push(ACC); });
    for (let i = 0; i < 3; i++) cells.push(OFF);
    cells.forEach((col, i) => { const s = clamp(n - i); if (s <= 0) return; el('rect', { x: x + i * (cw + 3), y: y + (1 - s) * 10, width: cw, height: 30, rx: 4, fill: col, opacity: 0.25 + 0.6 * s }); });
    return { cw: cw + 3 }; }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      const fs = 24, cw = fs * 0.6, s = 'Hello, world!', left = 480 - (s.length * cw) / 2;
      card(480, 70, s.length * cw + 40, 50, { rx: 10, stroke: GRID, sw: 1.8 }); mono(left, 78, s, { 'font-size': fs, fill: INK, opacity: 1 - 0.6 * E(u, 0.4, 1.2) });
      sub(480, 118, 'enc = tiktoken.encoding_for_model("gpt-4")', fade(u, 0.1), { class: 'mono', 'font-size': 14 });
      const ws = HELLO.map(([p]) => chipW(p.replace(' ', '␣'), 18)), tot = ws.reduce((a, b) => a + b, 0) + 14 * 3; let cx = 480 - tot / 2, off = 0;
      HELLO.forEach(([p, id], i) => { const w = ws[i], sx = left + (off + p.length / 2) * cw - w / 2, f = E(u, 0.4 + i * 0.15, 1.3 + i * 0.15);
        chip(lerp(sx, cx, f), lerp(56, 190, f), p.replace(' ', '␣'), { fs: 18, h: 38, s: f > 0 ? 1 : 0, op: f > 0 ? 1 : 0 });
        mono(cx + w / 2, 256, String(id), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5 + i * 0.12) });
        off += p.length; cx += w + 14; });
      sub(480, 290, '토큰 ID', fade(u, 1.6));
      mono(480, 360, '4 tokens', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      return; }
    if (k === 1) {
      lbl(110, 110, '영어 19자', 1, { 'text-anchor': 'start' }); lbl(110, 230, '한글 16자', 1, { 'text-anchor': 'start' });
      sub(110, 132, '"I love programming."', 1, { 'text-anchor': 'start', class: 'mono' }); sub(110, 252, '"나는 프로그래밍을 좋아합니다."', 1, { 'text-anchor': 'start' });
      chipRow(250, 92, ENG, lerp(0, 4, E(u, 0.2, 0.8)), { fs: 15 });
      const kp = chipRow(250, 212, KOR, lerp(0, 13, E(u, 0.9, 2.1)), { fs: 15, gap: 5 });
      if (u > 2.1) { [[5, 6, '밍'], [8, 9, '좋']].forEach(([a, b, ch]) => { const x0 = kp[a][0], x1 = kp[b][0] + kp[b][1], op = fade(u, 2.1);
        el('path', { d: `M${x0},${266} V${274} H${x1} V${266}`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: op });
        tx((x0 + x1) / 2, 294, `'${ch}' 한 글자 = 2토큰`, { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: op }); }); }
      mono(870, 113, '4', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.8) });
      mono(870, 233, Math.round(lerp(0, 13, E(u, 0.9, 2.1))) + '', { 'font-size': 26, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.9) });
      tx(880, 113, '토큰', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) }); tx(880, 233, '토큰', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) });
      if (u > 2.2) banner(480, 360, '같은 뜻인데 토큰은 3배 넘게', pop(u, 2.2));
      return; }
    if (k === 5) { const L = 140, W = 600, X = (v) => L + W * v / 8192;
      tx(L, 70, 'safe_call(): 부르기 전에 input 토큰을 잰다', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      [[0, '28 tokens', 28, GOOD, 0.3], [1, 'n > 4000', 6800, BAD, 1.3]].forEach(([i, name, v, col, at]) => { const y = 130 + i * 110, f = E(u, at, at + 0.8);
        el('rect', { x: L, y, width: W, height: 34, rx: 6, fill: SOFT });
        el('rect', { x: L, y, width: Math.max(4, (X(v) - L) * f), height: 34, rx: 6, fill: col, opacity: 0.85 });
        mono(L - 14, y + 23, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: col, opacity: fade(u, at) });
        if (i === 0) { check(X(8192) + 40, y + 17, 13, pop(u, at + 0.6)); tx(X(8192) + 62, y + 23, '호출', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, at + 0.6) }); }
        else { cross(X(8192) + 40, y + 17, 12, pop(u, at + 0.9)); mono(X(8192) + 60, y + 23, 'ValueError', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, at + 0.9) }); } });
      el('line', { x1: X(4000), y1: 104, x2: X(4000), y2: 290, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
      mono(X(4000), 100, 'MAX_INPUT_TOKENS 4000', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700 });
      mono(L, 310, '0', { 'font-size': 13.5, fill: MUT }); mono(L + W, 310, '8k (gpt-4 문맥)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      sub(480, 370, '긴 입력은 API를 부르기 전에 막아 비용이 0으로 끝난다', fade(u, 2.3), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    // k2~: 메시지 두 개
    MSG.forEach(([role, txt, n], i) => { const y = 64 + i * 86, s = k === 2 ? pop(u, 0.2 + i * 0.4) : 1;
      card(200, y + 22, 300, 56, { rx: 10, stroke: GRID, sw: 1.6, s });
      mono(66, y + 18, role, { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: clamp(s) }); tx(66, y + 40, txt, { 'font-size': 15, 'font-weight': 600, opacity: clamp(s) });
      mono(336, y + 30, `${n}토큰`, { 'font-size': 14, fill: ACC, 'text-anchor': 'end', 'font-weight': 700, opacity: clamp(s) });
      if (k >= 2) { const f = k === 2 ? seg(u, 0.9 + i * 0.4, 1.5 + i * 0.4) : 1;
        ['<|start|>', 'role', '<|message|>'].forEach((p, j) => chip(380 + j * (j === 2 ? 112 : 96) - (j === 2 ? 16 : 0), y + 8, p, { fs: 13.5, w: j === 1 ? 70 : 104, fill: j === 1 ? INFOBG : WARNBG, stroke: j === 1 ? INFO : WARN, s: R.spring(f) }));
        mono(720, y + 30, '+3', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: f }); } });
    if (k === 2) { mono(820, 110, 'total = 0', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(820, 136, '메시지마다 +3', fade(u, 2.0), { fill: WARN, 'font-weight': 700 }); return; }
    // k3~: 28칸 막대
    const n = k === 3 ? lerp(0, 28, E(u, 0.2, 2.4)) : 28, bx = 60;
    const tb = tokenBar(bx, 250, n);
    mono(900, 272, Math.round(n) + '', { 'font-size': 26, 'font-weight': 800, fill: INK, 'text-anchor': 'end' });
    [[WARN, '구분자 3'], [INFO, 'role 1'], [ACC, '내용'], [OFF, '응답 시작 3']].forEach(([col, s], i) => {
      el('rect', { x: 120 + i * 190, y: 306, width: 14, height: 14, rx: 3, fill: col, opacity: 0.8 }); tx(142 + i * 190, 318, s, { 'font-size': 14, fill: MUT }); });
    if (k === 3) return;
    if (k === 4) { const brace = (a, b, s, col, y) => { const x0 = bx + a * tb.cw, x1 = bx + b * tb.cw - 3;
        el('path', { d: `M${x0},${y + 8} V${y} H${x1} V${y + 8}`, fill: 'none', stroke: col, 'stroke-width': 2, opacity: fade(u, 0.3) });
        tx((x0 + x1) / 2, y - 8, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 0.4) }); };
      brace(4, 13, '본문 9', ACC, 236); brace(17, 25, '본문 8', ACC, 236);
      banner(480, 372, '본문 17 + 구분자·role 11 = 28 tokens', pop(u, 1.0)); } }

  // ───────── 2. 가격표 ─────────
  const OAI = [['gpt-4', 30, 60], ['gpt-4-turbo', 10, 30], ['gpt-4o', 5, 15], ['gpt-3.5-turbo', 0.5, 1.5], ['gpt-4o-mini', 0.15, 0.6]];
  const OTH = [['claude-3-opus', 15, 75], ['claude-3-sonnet', 3, 15], ['claude-3-haiku', 0.25, 1.25], ['gemini-1.5-pro', 1.25, 5], ['gemini-1.5-flash', 0.075, 0.3], ['llama-3-70b', 0.9, 0.9], ['llama-3-8b', 0.1, 0.1]];
  const fmtP = (v) => '$' + (v >= 1 ? (Number.isInteger(v) ? v : v.toFixed(2)) : v);
  function dumbbell(rows, y0, rh, u, o) { o = o || {}; const x0 = 300, x1 = 900, lo = 0.05, hi = 300, X = (v) => logx(v, x0, x1, lo, hi);
    [0.1, 1, 10, 100].forEach((v) => { el('line', { x1: X(v), y1: y0 - 18, x2: X(v), y2: y0 + rows.length * rh - 10, stroke: GRID, 'stroke-dasharray': '3 4' });
      mono(X(v), y0 + rows.length * rh + 8, '$' + v, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); });
    rows.forEach(([n, a, b], i) => { const y = y0 + i * rh, f = E(u, 0.2 + i * 0.18, 0.8 + i * 0.18); if (f <= 0) return;
      mono(x0 - 16, y + 5, n, { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, opacity: f });
      el('line', { x1: X(a), y1: y, x2: lerp(X(a), X(b), f), y2: y, stroke: OFF, 'stroke-width': 4, 'stroke-linecap': 'round' });
      el('circle', { cx: X(a), cy: y, r: 7, fill: ACC, opacity: f }); if (a !== b) el('circle', { cx: lerp(X(a), X(b), f), cy: y, r: 7, fill: PANEL, stroke: BAD, 'stroke-width': 3, opacity: f });
      else el('circle', { cx: X(a), cy: y, r: 11, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: f });
      if (o.vals) mono(Math.max(X(a), X(b)) + 16, y + 5, `${fmtP(a)} / ${fmtP(b)}`, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1 + i * 0.18) }); });
    el('circle', { cx: 330, cy: 22, r: 6, fill: ACC }); tx(342, 27, 'input', { 'font-size': 14, fill: MUT });
    el('circle', { cx: 410, cy: 22, r: 6, fill: PANEL, stroke: BAD, 'stroke-width': 2.5 }); tx(422, 27, 'output', { 'font-size': 14, fill: MUT });
    tx(510, 27, '$ / 1M tokens (로그 눈금)', { 'font-size': 14, fill: MUT }); return X; }
  const CALL = [['gpt-4', 0.036], ['gpt-4o', 0.007], ['gpt-4o-mini', 0.00024], ['claude-3-haiku', 0.00045]];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) {
      card(480, 120, 360, 130, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) });
      mono(320, 78, '@dataclass ModelPricing', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      [['input_per_1m', 30, ACC], ['output_per_1m', 60, BAD]].forEach(([n, v, col], i) => { const y = 118 + i * 40;
        mono(320, y, n, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.3) });
        mono(620, y, '$' + Math.round(lerp(0, v, E(u, 0.8 + i * 0.3, 1.6 + i * 0.3))), { 'font-size': 20, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.3) }); });
      for (let i = 0; i < 6; i++) { dot([[60, 300], [300, 300], [440, 300]], ((u * 0.55 + i / 6) % 1), ACC, 6); dot([[520, 300], [700, 300], [900, 300]], ((u * 0.55 + i / 6 + 0.5) % 1), BAD, 6); }
      card(480, 300, 120, 50, { rx: 10, text: 'gpt-4', mono: true, fs: 15, stroke: INK });
      sub(250, 336, '읽는 토큰 (input)', 1, { fill: ACC, 'font-weight': 700 }); sub(710, 336, '쓰는 토큰 (output)', 1, { fill: BAD, 'font-weight': 700 });
      sub(480, 390, '두 단가가 다르니 둘을 따로 들고 다닌다', fade(u, 2));
      return; }
    if (k === 1) { const X = dumbbell(OAI, 80, 52, u, { vals: true });
      if (u > 1.6) { const op = fade(u, 1.6); el('path', { d: `M${X(0.15)},${355} V${365} H${X(30)} V${355}`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: op });
        tx((X(0.15) + X(30)) / 2, 390, 'input 단가 200배 ($30 ÷ $0.15)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op }); }
      return; }
    if (k === 2) { const X = dumbbell(OTH, 66, 42, u, { vals: true });
      tx(480, 404, '아래 두 줄 self-host는 input = output 단가 (GPU 시간 과금)', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 3) {
      const rows = [['800', '× $30', '= 24,000', ACC, 0.3], ['200', '× $60', '= 12,000', BAD, 0.9]];
      rows.forEach(([a, b, d, col, at], i) => { const y = 90 + i * 56, op = fade(u, at);
        mono(260, y, a, { 'font-size': 26, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: op }); mono(280, y, b, { 'font-size': 22, fill: INK, opacity: op });
        mono(400, y, d, { 'font-size': 22, fill: INK, opacity: fade(u, at + 0.3) }); tx(600, y, i ? 'output 토큰' : 'input 토큰', { 'font-size': 15, fill: col, 'font-weight': 700, opacity: op }); });
      grow(150, 166, 580, 166, seg(u, 1.4, 1.8), INK, { plain: true });
      mono(400, 206, '/ 1,000,000 = $0.036', { 'font-size': 24, 'font-weight': 800, fill: INK, opacity: fade(u, 1.7) });
      const bx = 170, bw = 620, f = E(u, 2.0, 2.6);
      el('rect', { x: bx, y: 250, width: bw * 2 / 3 * f, height: 34, rx: 6, fill: ACC, opacity: 0.85 }); el('rect', { x: bx + bw * 2 / 3, y: 250, width: bw / 3 * f, height: 34, rx: 6, fill: BAD, opacity: 0.85 });
      mono(bx + bw / 3, 273, '$0.024', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: f }); mono(bx + bw * 5 / 6, 273, '$0.012', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: f });
      sub(480, 320, '토큰은 4 : 1 인데 돈은 2 : 1', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4, k5: 같은 호출 네 모델
    chip(300, 34, 'IN 800', { fs: 15, s: k === 4 ? pop(u, 0.1) : 1 }); chip(400, 34, 'OUT 200', { fs: 15, fill: BADBG, stroke: BAD, s: k === 4 ? pop(u, 0.25) : 1 });
    tx(520, 55, '고정, 모델만 바꾼다', { 'font-size': 14, fill: MUT });
    CALL.forEach(([n, v], i) => { const y = 100 + i * 64, f = k === 4 ? E(u, 0.5 + i * 0.35, 1.4 + i * 0.35) : 1;
      mono(250, y + 18, n, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 270, y, width: 470, height: 26, rx: 5, fill: SOFT }); el('rect', { x: 270, y, width: Math.max(3, 470 * v / 0.036 * f), height: 26, rx: 5, fill: i ? ACC : BAD, opacity: 0.85 });
      if (k === 4) mono(756, y + 18, '$' + (v * f).toFixed(5), { 'font-size': 15, fill: MUT });
      else { mono(756, y + 18, '$' + v, { 'font-size': 15, 'font-weight': 700 }); tx(940, y + 18, i ? `1/${Math.round(0.036 / v)}` : '기준', { 'font-size': 15, 'font-weight': 800, fill: i ? GOOD : BAD, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.3) }); } });
    if (k === 5) { const pts = [['출시', 30], ['turbo', 10], ['4o', 5]], X = (i) => 380 + i * 110, Y = (v) => 400 - v * 1.6;
      tx(250, 372, 'GPT-4 계열 input', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      pts.forEach(([n, v], i) => { const op = fade(u, 1.5 + i * 0.3); el('circle', { cx: X(i), cy: Y(v), r: 5, fill: INK, opacity: op });
        mono(X(i), Y(v) - 10, '$' + v, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, opacity: op }); if (i) grow(X(i - 1), Y(pts[i - 1][1]), X(i), Y(v), seg(u, 1.5 + i * 0.3, 1.8 + i * 0.3), MUT, { plain: true }); }); } }

  // ───────── 3. context 길이 ─────────
  const SC = [['no RAG', 50], ['RAG top-3', 800], ['RAG top-10', 3000], ['PDF 통째', 50000]];
  const SCOST = [0.0075, 0.03, 0.096, 1.506];
  const BD = [['system', 150, INFO], ['few-shot', 300, WARN], ['RAG chunks', 2000, ACC], ['대화 이력', 500, GOOD], ['질문', 50, MUT]];
  const CUT = { 'RAG chunks': [1200, '−27%'], '대화 이력': [200, '−10%'], 'few-shot': [100, '−7%'], 'system': [60, '−3%'] };
  function stack(x, y, w, parts, total, o) { o = o || {}; let cx = x; const out = [];
    parts.forEach(([n, v, col], i) => { const ww = w * v / total; el('rect', { x: cx, y, width: Math.max(0, ww - 2), height: o.h || 44, rx: 4, fill: col, opacity: 0.85 });
      out.push([cx, ww]); cx += ww; }); return out; }
  function s3(t, c) { const { k, u } = c;
    pill(150, 36, 'Q. 환불 정책 알려주세요', INK, 1, { fs: 14 });
    if (k <= 2) { const max = k < 2 ? 3000 : lerp(3000, 50000, E(u, 0.2, 1.4)), x0 = 210, W = 640, X = (v) => x0 + W * Math.min(v, max) / max;
      tx(x0, 82, `input 토큰 (눈금 최대 ${Math.round(max).toLocaleString('en-US')})`, { 'font-size': 13.5, fill: MUT });
      SC.forEach(([n, v], i) => { if (i > 0 && k === 0) return; if (i === 3 && k < 2) return; const y = 104 + i * 58;
        const f = (k === 0 && i === 0) || (k === 1 && i > 0) ? E(u, 0.2 + (i - 1) * 0.5, 1.0 + (i - 1) * 0.5) : k === 2 && i === 3 ? E(u, 1.0, 2.0) : 1;
        mono(x0 - 14, y + 20, n, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: x0, y, width: W, height: 30, rx: 5, fill: SOFT });
        el('rect', { x: x0, y, width: Math.max(3, (X(v) - x0) * f), height: 30, rx: 5, fill: i === 3 ? BAD : ACC, opacity: 0.85 });
        mono(Math.min(X(v) * 1 + 10, x0 + W - 4), y + 21, v.toLocaleString('en-US'), { 'font-size': 15, 'font-weight': 700, 'text-anchor': X(v) > x0 + W - 80 ? 'end' : 'start', fill: X(v) > x0 + W - 80 ? PANEL : INK, opacity: f }); });
      sub(530, 398, 'output은 네 경우 모두 100 토큰', 1, { 'font-size': 14 });
      if (k === 2) banner(530, 356, 'no RAG의 1000배', pop(u, 2.0));
      return; }
    if (k === 3) { const x0 = 210, x1 = 860, X = (v) => logx(v, x0, x1, 0.001, 3);
      [0.001, 0.01, 0.1, 1].forEach((v) => { el('line', { x1: X(v), y1: 92, x2: X(v), y2: 340, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(X(v), 360, '$' + v, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); });
      tx(x0, 82, '호출 한 번 비용 (gpt-4, 로그 눈금)', { 'font-size': 13.5, fill: MUT });
      SC.forEach(([n], i) => { const y = 110 + i * 56, v = SCOST[i], f = E(u, 0.2 + i * 0.35, 1.0 + i * 0.35);
        mono(x0 - 14, y + 20, n, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: x0, y, width: Math.max(3, (X(v) - x0) * f), height: 30, rx: 5, fill: i === 3 ? BAD : ACC, opacity: 0.85 });
        mono(X(v) + 10, y + 21, `$${v.toFixed(4)}`, { 'font-size': 15, 'font-weight': 700, opacity: f });
        mono(X(v) + 96, y + 21, `×${Math.round(v / SCOST[0])}`, { 'font-size': 15, 'font-weight': 800, fill: i ? BAD : MUT, opacity: fade(u, 1.0 + i * 0.35) }); });
      sub(530, 396, 'output 몫 $0.006은 그대로, 차이는 전부 input에서 났다', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4 || k === 5) { const x = 80, w = 800;
      const parts = BD.map(([n, v, col]) => { const cut = CUT[n], f = k === 5 && cut ? E(u, 0.3 + ['RAG chunks', '대화 이력', 'few-shot', 'system'].indexOf(n) * 0.45, 0.8 + ['RAG chunks', '대화 이력', 'few-shot', 'system'].indexOf(n) * 0.45) : 0;
        return [n, cut ? lerp(v, cut[0], f) : v, col]; });
      const tot = parts.reduce((a, p) => a + p[1], 0);
      tx(x, 92, 'top-5 호출 하나의 context', { 'font-size': 13.5, fill: MUT });
      mono(x + w, 92, Math.round(tot).toLocaleString('en-US') + ' tokens', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' });
      const split = k === 4 ? E(u, 0.2, 1.0) : 1;
      if (split < 1) el('rect', { x, y: 110, width: w, height: 44, rx: 4, fill: OFF, opacity: 1 - split });
      const pos = stack(x, 110, w * tot / 3000, parts.map((p) => [p[0], p[1], p[2]]), tot, {}); void pos;
      if (split < 1) el('rect', { x, y: 110, width: w, height: 44, rx: 4, fill: OFF, opacity: 1 - split });
      BD.forEach(([n, v, col], i) => { const y = 200 + i * 38, op = k === 4 ? fade(u, 1.0 + i * 0.2) : 1;
        el('rect', { x: 120, y: y - 13, width: 16, height: 16, rx: 3, fill: col, opacity: op * 0.85 }); tx(146, y, n, { 'font-size': 15, 'font-weight': 600, opacity: op });
        mono(340, y, v.toLocaleString('en-US'), { 'font-size': 15, 'text-anchor': 'end', opacity: op });
        mono(400, y, Math.round(v / 30) + '%', { 'font-size': 15, 'text-anchor': 'end', fill: n === 'RAG chunks' ? ACC : MUT, 'font-weight': n === 'RAG chunks' ? 800 : 400, opacity: op });
        if (k === 5 && CUT[n]) { const j = ['RAG chunks', '대화 이력', 'few-shot', 'system'].indexOf(n), op2 = fade(u, 0.4 + j * 0.45);
          mono(440, y, `→ ${CUT[n][0].toLocaleString('en-US')}`, { 'font-size': 15, opacity: op2 }); mono(560, y, CUT[n][1], { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: op2 }); } });
      if (k === 4) card(720, 270, 260, 80, { rx: 12, stroke: ACC, sw: 2, text: 'RAG chunk 가\n3분의 2를 먹는다', fs: 16, color: ACC, s: pop(u, 1.8) });
      else card(740, 280, 220, 70, { rx: 12, stroke: GOOD, sw: 2, text: '큰 것부터 줄인다\n합계 −46%', fs: 16, color: GOOD, s: pop(u, 2.2) });
      return; }
    // k6: 운영 측정 (예시)
    const ax = axes(110, 90, 560, 230, { x: [0, 24], y: [0, 6000], yt: [0, 3000, 6000], xl: '시간 (예시)', yl: 'context 토큰 / 호출', grid: true });
    const pts = []; for (let i = 0; i <= 24; i++) pts.push([i, i < 17 ? 3000 + Math.sin(i * 1.7) * 180 : 5200 + Math.sin(i * 2.1) * 200]);
    line(ax, pts, E(u, 0.2, 1.8), ACC);
    if (u > 1.4) { el('line', { x1: ax.X(17), y1: 90, x2: ax.X(17), y2: 320, stroke: BAD, 'stroke-dasharray': '5 4', 'stroke-width': 2, opacity: fade(u, 1.4) }); }
    pill(820, 130, '알람: context 급증', BAD, pop(u, 1.8), { fs: 15 });
    ['system', 'user', 'assistant'].forEach((r, i) => { const y = 200 + i * 40, op = fade(u, 0.4 + i * 0.2); mono(730, y + 5, r, { 'font-size': 14.5, opacity: op });
      el('rect', { x: 820, y: y - 9, width: [24, 70, 44][i] * (i === 1 && u > 1.6 ? 1.6 : 1), height: 16, rx: 3, fill: [INFO, ACC, GOOD][i], opacity: op * 0.85 }); });
    sub(820, 340, 'role 별로 나눠 센다', fade(u, 0.6)); }

  // ───────── 4. 월 비용 추정 ─────────
  const INP = [['DAU', '10,000'], ['인당 호출/일', '10'], ['일수', '30'], ['input', '800'], ['output', '200'], ['model', 'gpt-4o-mini']];
  const SCN = [['베타', '1K', 'gpt-4o-mini', 72], ['성장', '10K', 'gpt-4o-mini', 720], ['성장', '10K', 'gpt-4', 108000], ['대규모', '100K', 'gpt-4o', 210000]];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { INP.forEach(([n, v], i) => { const cx = 200 + (i % 3) * 280, cy = 120 + Math.floor(i / 3) * 130, s = pop(u, 0.2 + i * 0.25);
        card(cx, cy, 230, 92, { rx: 12, stroke: i === 5 ? ACC : GRID, sw: 2, s });
        tx(cx - 100, cy - 14, n, { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: clamp(s) }); mono(cx - 100, cy + 22, v, { 'font-size': 22, 'font-weight': 800, opacity: clamp(s), fill: i === 5 ? ACC : INK }); });
      sub(480, 360, '이 6개만 정하면 월 비용이 계산된다', fade(u, 2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const calls = Math.round(lerp(0, 3000000, E(u, 0.6, 1.4))), cost = lerp(0, 720, E(u, 1.7, 2.4));
      const parts = [['10,000', 'DAU'], ['× 10', '호출'], ['× 30', '일']]; parts.forEach(([a, b], i) => { const op = fade(u, 0.1 + i * 0.2); mono(150 + i * 140, 110, a, { 'font-size': 26, 'font-weight': 800, opacity: op }); sub(190 + i * 140, 140, b, op); });
      mono(600, 110, '= ' + calls.toLocaleString('en-US'), { 'font-size': 26, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) }); sub(700, 140, '월 호출 수', fade(u, 0.6));
      grow(480, 170, 480, 214, seg(u, 1.3, 1.6), INK);
      mono(150, 260, '× $0.00024', { 'font-size': 26, 'font-weight': 800, opacity: fade(u, 1.4) }); sub(250, 290, '호출당 비용 (gpt-4o-mini, 800/200)', fade(u, 1.4));
      mono(600, 260, '= ' + money(cost), { 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) }); sub(680, 290, '월 비용', fade(u, 1.7));
      sub(480, 370, 'daily_calls × days → monthly_calls × cost_per_call', fade(u, 2.2), { class: 'mono' }); return; }
    if (k >= 5) return s4b(t, c);
    // k2~k4: 시나리오 표
    const x0 = 60;
    SCN.forEach(([n, us, m, v], i) => { const y = 70 + i * 70, s = k === 2 ? pop(u, 0.2 + i * 0.3) : 1, hot = k === 4 && i === 2;
      card(x0 + 150, y + 22, 300, 52, { rx: 10, stroke: hot ? BAD : GRID, sw: hot ? 2.5 : 1.6, s });
      tx(x0 + 16, y + 28, `${n} (${us})`, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s) }); mono(x0 + 284, y + 28, m, { 'font-size': 14.5, fill: m === 'gpt-4' ? BAD : INFO, 'text-anchor': 'end', opacity: clamp(s) });
      if (k === 3) { const f = E(u, 0.4 + i * 0.3, 1.2 + i * 0.3); el('rect', { x: 400, y: y + 12, width: 420, height: 20, rx: 4, fill: SOFT }); el('rect', { x: 400, y: y + 12, width: 420 * f, height: 20, rx: 4, fill: INFO, opacity: 0.5 });
        mono(836, y + 28, f < 1 ? '계산 중' : '완료', { 'font-size': 13.5, fill: MUT }); }
      if (k === 4) { const X = (vv) => logx(vv, 400, 840, 10, 1e6), f = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3);
        el('rect', { x: 400, y: y + 8, width: Math.max(3, (X(v) - 400) * f), height: 28, rx: 5, fill: v >= 100000 ? BAD : ACC, opacity: 0.85 });
        mono(X(v) * 1 + 8 > 860 ? 860 : X(v) + 8, y + 28, money(v), { 'font-size': 15, 'font-weight': 800, 'text-anchor': X(v) + 8 > 860 ? 'end' : 'start', fill: X(v) + 8 > 860 ? PANEL : INK, opacity: fade(u, 0.9 + i * 0.3) }); } });
    if (k === 3) { banner(480, 380, '공통 조건: 인당 10회 · input 800 · output 200', pop(u, 0.1)); }
    if (k === 4) { sub(620, 360, '월 비용 (로그 눈금)', 1); banner(480, 396, '사용자 수는 같고 모델만 다르다: $720 → $108,000', pop(u, 1.8)); }
  }
  function s4b(t, c) { const { k, u } = c;
    if (k === 5) { // z-score (예시 곡선)
      const ax = axes(110, 80, 600, 240, { x: [0, 31], y: [0, 3], yt: [], xl: '최근 30일 + 오늘 (예시)', yl: '일 비용' });
      const mean = 1.2, sd = 0.12; el('rect', { x: ax.X(0), y: ax.Y(mean + 3 * sd), width: ax.X(30) - ax.X(0), height: ax.Y(mean - 3 * sd) - ax.Y(mean + 3 * sd), fill: GOODBG, opacity: fade(u, 0.2) });
      el('line', { x1: ax.X(0), y1: ax.Y(mean), x2: ax.X(30), y2: ax.Y(mean), stroke: GOOD, 'stroke-dasharray': '6 4', opacity: fade(u, 0.2) });
      tx(ax.X(30) + 8, ax.Y(mean + 3 * sd) + 4, '평균 + 3σ', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 0.3) });
      const pts = []; for (let i = 0; i <= 30; i++) pts.push([i, mean + Math.sin(i * 2.3) * sd * 1.2]);
      line(ax, pts, E(u, 0.2, 1.4), INK, { sw: 2 });
      if (u > 1.4) { const f = E(u, 1.4, 2.0); el('line', { x1: ax.X(30), y1: ax.Y(pts[30][1]), x2: ax.X(31), y2: ax.Y(lerp(pts[30][1], 2.6, f)), stroke: BAD, 'stroke-width': 3 }); el('circle', { cx: ax.X(31), cy: ax.Y(lerp(pts[30][1], 2.6, f)), r: 7, fill: BAD }); }
      card(840, 140, 200, 80, { rx: 12, stroke: BAD, sw: 2, text: 'z > 3\nalert()', fs: 18, mono: true, color: BAD, s: pop(u, 2.0) });
      mono(840, 260, 'z = (오늘 − 평균) / σ', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); return; }
    // k6: 사용자별 한도
    const L = 220, W = 560, X = (v) => L + W * v / 140000; el('line', { x1: X(100000), y1: 70, x2: X(100000), y2: 330, stroke: BAD, 'stroke-width': 2.5 });
    mono(X(100000), 60, 'USER_DAILY_TOKEN_LIMIT 100,000', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD });
    [['user_a', 18000], ['user_b', 42000], ['user_c', 9000], ['loop_bot', 0], ['user_d', 26000]].forEach(([n, v], i) => { const y = 96 + i * 46, run = n === 'loop_bot';
      const val = run ? lerp(0, 138000, E(u, 0.4, 2.0)) : v * E(u, 0.1, 0.8); mono(L - 14, y + 18, n, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: run ? BAD : INK });
      el('rect', { x: L, y, width: W, height: 26, rx: 5, fill: SOFT }); el('rect', { x: L, y, width: X(Math.min(val, 138000)) - L, height: 26, rx: 5, fill: run && val > 100000 ? BAD : ACC, opacity: 0.85 }); });
    if (u > 1.5) { pill(820, 280, 'QuotaExceeded', BAD, pop(u, 1.5), { mono: true, fs: 14 }); }
    sub(480, 380, '사용량 막대는 예시, 한도를 넘는 순간 호출 자체를 거절한다', fade(u, 2.2), { 'font-size': 14 }); }

  // ───────── 5. 대시보드 ─────────
  function counter(cx, cy, name, labels, val, o) { o = o || {}; const s = o.s ?? 1; const g = G(cx, cy, s, clamp(s));
    el('rect', { x: -150, y: -46, width: 300, height: 92, rx: 12, fill: PANEL, stroke: o.hot ? ACC : GRID, 'stroke-width': o.hot ? 2.5 : 1.6 }, g);
    mono(-136, -22, name, { 'font-size': 14, 'font-weight': 700, fill: INFO }, g);
    mono(136, 30, val, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: o.col || INK }, g);
    let lx = -136; labels.forEach((l) => { const w = tw(l, 13.5) + 12; el('rect', { x: lx, y: -8, width: w, height: 22, rx: 11, fill: SOFT }, g); mono(lx + 6, 8, l, { 'font-size': 13.5, fill: MUT }, g); lx += w + 5; }); }
  function panel(x, y, w, h, title, f) { el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 10, y + 20, title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); return f; }
  function s5(t, c) { const { k, u } = c;
    const C3 = [['llm_tokens_in_total', ['model', 'feature', 'user_tier'], 800, ''], ['llm_tokens_out_total', ['model', 'feature', 'user_tier'], 200, ''], ['llm_cost_usd_total', ['model', 'feature', 'user'], 0.036, '$']];
    if (k <= 3) {
      const show = k === 0 ? 1 : 3;
      C3.slice(0, show).forEach(([n, ls, v, unit], i) => { const cy = 80 + i * 110, s = (k === 0 && i === 0) || (k === 1 && i > 0) ? pop(u, 0.2 + i * 0.3) : 1;
        const inc = k === 3 ? E(u, 0.9 + i * 0.25, 1.4 + i * 0.25) : k === 0 ? E(u, 1.2, 1.8) : k > 0 ? 1 : 0;
        const val = unit === '$' ? '$' + (v * inc).toFixed(3) : Math.round(v * inc).toLocaleString('en-US');
        counter(760, cy, n, ls, val, { s, hot: k === 3 && inc > 0 && inc < 1, col: unit === '$' ? ACC : INK }); });
      if (k === 0) { dot([[60, 80], [600, 80]], seg(u, 0.4, 1.2), ACC, 7); card(130, 80, 150, 46, { rx: 10, text: 'LLM 호출 1회', fs: 15 }); sub(330, 66, '+800 input 토큰', fade(u, 0.8), { 'font-weight': 700, fill: ACC }); }
      if (k >= 2) { const s = k === 2 ? pop(u, 0.2) : 1; card(220, 172, 300, 200, { rx: 12, stroke: INK, sw: 2, s });
        mono(90, 110, 'res.usage', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: clamp(s) });
        mono(90, 146, 'prompt_tokens     800', { 'font-size': 15, opacity: clamp(s) }); mono(90, 176, 'completion_tokens 200', { 'font-size': 15, opacity: clamp(s) });
        mono(90, 222, 'cost(800, 200, "gpt-4")', { 'font-size': 14.5, fill: MUT, opacity: k === 2 ? fade(u, 1.0) : 1 });
        mono(90, 256, '= $0.036', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 1.5) : 1 });
        sub(220, 290, '추정이 아니라 응답의 실제 값 (예시 호출)', k === 2 ? fade(u, 1.8) : 1); }
      if (k === 3) { [80, 190, 300].forEach((cy, i) => dot([[370, 160], [520, 160], [610, cy]], seg(u, 0.2 + i * 0.25, 1.0 + i * 0.25), i === 2 ? ACC : INFO, 7));
        sub(480, 400, '같은 라벨로 세 카운터를 한 곳에서 올린다', fade(u, 1.8), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
      return; }
    // k4~k6: 6 패널 대시보드 (모양은 예시)
    const PW = 290, PH = 165, P = [[30, 40], [335, 40], [640, 40], [30, 220], [335, 220], [640, 220]];
    tx(30, 26, 'Grafana · LLM 비용 (예시 데이터)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const on = (i) => (i < 3 ? (k === 4 ? E(u, 0.2 + i * 0.5, 1.0 + i * 0.5) : 1) : k === 5 ? E(u, 0.2 + (i - 3) * 0.5, 1.0 + (i - 3) * 0.5) : k >= 5 ? 1 : 0);
    const titles = ['1 시간별 비용', '2 모델별 분포', '3 feature 별', '4 top spender', '5 호출당 평균 토큰', '6 하루 예측'];
    P.forEach(([x, y], i) => { const f = on(i); panel(x, y, PW, PH, titles[i]); if (f <= 0) return;
      if (i === 0) { const ax = { X: (v) => x + 20 + v * 250 / 23, Y: (v) => y + 145 - v * 100 }; const pts = []; for (let h = 0; h < 24; h++) pts.push([h, 0.25 + 0.35 * Math.sin((h - 6) / 24 * Math.PI * 2) ** 2 + (k === 6 && h > 19 ? (h - 19) * 0.16 : 0)]);
        line(ax, pts, f, ACC); if (k === 6) { el('line', { x1: x + 20, y1: y + 70, x2: x + 270, y2: y + 70, stroke: BAD, 'stroke-dasharray': '5 4', 'stroke-width': 2 }); mono(x + 270, y + 64, '$1K/h', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 }); } }
      if (i === 1) { const cx = x + 100, cy = y + 95, r = 50; let a0 = -Math.PI / 2; [[0.62, BAD, 'gpt-4'], [0.28, ACC, 'gpt-4o'], [0.10, GOOD, 'mini']].forEach(([fr, col, n], j) => { const a1 = a0 + fr * 2 * Math.PI * f;
          el('path', { d: `M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`, fill: col, opacity: 0.85 });
          el('rect', { x: x + 175, y: y + 52 + j * 30, width: 12, height: 12, rx: 2, fill: col }); mono(x + 193, y + 63 + j * 30, n, { 'font-size': 13.5 }); a0 = a1; }); el('circle', { cx, cy, r: 22, fill: PANEL }); }
      if (i === 2) { ['chat', 'search', 'summary', 'agent'].forEach((n, j) => { const v = [0.9, 0.45, 0.6, 0.3][j]; el('rect', { x: x + 20 + j * 66, y: y + 145 - 100 * v * f, width: 40, height: 100 * v * f, rx: 3, fill: [ACC, INFO, WARN, GOOD][j], opacity: 0.85 }); mono(x + 40 + j * 66, y + 160, n, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }); }
      if (i === 3) { [['user_17', 0.9], ['user_05', 0.5], ['user_42', 0.3]].forEach(([n, v], j) => { const yy = y + 50 + j * 36; mono(x + 16, yy + 14, n, { 'font-size': 14, opacity: f, fill: j === 0 && k === 6 ? BAD : INK }); el('rect', { x: x + 110, y: yy, width: 160 * v * f, height: 20, rx: 4, fill: j === 0 && k === 6 ? BAD : ACC, opacity: 0.8 }); }); }
      if (i === 4) { const cx = x + 145, cy = y + 130, r = 70; el('path', { d: `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`, fill: 'none', stroke: SOFT, 'stroke-width': 16 });
        const a = Math.PI * (1 - 0.55 * f); el('path', { d: `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r * Math.cos(a)},${cy - r * Math.sin(a)}`, fill: 'none', stroke: INFO, 'stroke-width': 16 });
        mono(cx, cy - 8, 'avg', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); }
      if (i === 5) { const X0 = x + 20, Y0 = y + 140; el('polyline', { points: [[0, 0], [60, -22], [120, -40]].map(([a, b]) => `${X0 + a},${Y0 + b}`).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: f });
        el('line', { x1: X0 + 120, y1: Y0 - 40, x2: X0 + 120 + 130 * f, y2: Y0 - 40 - 50 * f, stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '6 5' });
        mono(X0 + 250, Y0 - 98, 'predict_linear', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: f }); } });
    if (k === 6) { el('rect', { x: 0, y: 392, width: 960, height: 28, fill: PANEL, opacity: 0.95 });
      ['> $1K / 시간', '평소의 3배', '사용자 1명 > $100 / 시간'].forEach((s, i) => pill([110, 290, 540][i], 404, s, i === 0 ? BAD : WARN, pop(u, 0.6 + i * 0.3), { fs: 13.5 }));
      card(845, 404, 200, 30, { rx: 15, text: '09:00 Slack 일간 요약', fs: 13.5, fill: INFOBG, stroke: INFO, color: INFO, s: pop(u, 1.8) }); } }

  // ───────── 확인 문제 ─────────
  const quiz = [
    { q: 'system·user 메시지 두 개의 본문이 합쳐 17토큰일 때 num_tokens_from_messages가 28을 내는 이유는 무엇인가?',
      o: ['tiktoken이 한글을 두 번 세기 때문이다', '메시지마다 구분자 3토큰과 role 토큰이 붙고 응답 시작분 3토큰이 더해지기 때문이다', 'gpt-4 인코더가 문장 끝마다 마침표 토큰을 넣기 때문이다'], a: 1,
      why: '메시지마다 구분자 3 + role 1, 마지막에 응답 시작 3이 붙어 11토큰이 더해진다. content만 더하면 실제보다 적게 나온다.' },
    { q: 'input 800, output 200 토큰 호출을 gpt-4에서 gpt-4o-mini로 바꾸면 호출당 비용은 어떻게 되는가?',
      o: ['$0.036에서 $0.00024로, 약 150분의 1이 된다', '$0.036에서 $0.018로, 절반이 된다', '토큰 수가 같으니 비용도 같다'], a: 0,
      why: '(800×30 + 200×60)/1M = $0.036, (800×0.15 + 200×0.6)/1M = $0.00024다. 모델 이름 하나가 150배 차이를 만든다.' },
    { q: 'top-5 context 3,000토큰을 줄일 때 가장 먼저 손댈 곳은 무엇인가?',
      o: ['system prompt 다듬기', 'few-shot 예시를 3개에서 1개로', 'RAG chunk를 top-5에서 top-3으로'], a: 2,
      why: 'RAG chunk가 2,000토큰으로 67%를 차지한다. top-3으로 줄이면 −27%, system prompt 다이어트는 −3%뿐이다.' },
    { q: 'DAU 10K, 인당 10회, input 800·output 200 조건에서 모델만 gpt-4o-mini에서 gpt-4로 바꾸면 월 비용은?',
      o: ['$720에서 $1,440으로 두 배가 된다', '$720에서 $108,000으로 150배가 된다', '사용자 수가 같으니 그대로다'], a: 1,
      why: '월 호출 3,000,000건에 호출당 $0.00024와 $0.036을 곱하면 $720과 $108,000이다.' },
    { q: 'llm_cost 카운터에 model·feature 라벨을 달아 두는 까닭은 무엇인가?',
      o: ['라벨이 있어야 Prometheus가 값을 저장하기 때문이다', '단가가 바뀌어도 토큰 수를 다시 셀 필요가 없게 하려고', '총액을 모델별·기능별로 쪼개 원인을 찾으려고'], a: 2,
      why: '라벨이 없으면 총합만 남는다. sum by (model), sum by (feature) 같은 패널은 처음에 단 라벨 덕분에 가능하다.' },
  ];

  const summary = [
    '토큰 수는 인코더를 돌려야 정확하다. 같은 뜻도 한글은 영어보다 3배 넘게 든다.',
    '호출 비용은 input과 output에 단가를 따로 곱해 더한다. output 단가가 보통 두세 배 비싸다.',
    '같은 질문도 context가 길면 비용이 커진다. RAG chunk처럼 큰 덩어리부터 줄인다.',
    '월 비용은 미리 곱해 보고, 실제 사용량은 라벨 단 카운터로 쌓아 알람을 건다.',
  ];
  const review = [
    { q: 'RAG를 top-3에서 top-10으로 바꿨더니 청구액이 세 배 넘게 뛰었다. 답변 길이는 그대로다. 먼저 확인할 것은?',
      o: ['output 단가가 올랐는지', '호출당 input 토큰이 몇 배로 늘었는지', '사용자 수가 늘었는지'], a: 1,
      why: 'context가 800에서 3,000토큰이 되면 gpt-4 호출당 $0.030이 $0.096이 된다. 차이는 전부 input 쪽에서 난다.' },
    { q: '한국어 챗봇 비용을 영어 기준 견적으로 잡았더니 실제 청구가 훨씬 많았다. 가장 그럴듯한 원인은?',
      o: ['한국어 응답은 output 단가가 따로 비싸다', 'tiktoken이 한국어에서 오류를 낸다', '같은 뜻이어도 한국어가 토큰을 3배 넘게 쓴다'], a: 2,
      why: '"I love programming."은 4토큰, 같은 뜻의 한글 문장은 13토큰이었다. 견적은 실제 언어로 토큰을 세서 잡아야 한다.' },
    { q: '밤사이 한 계정의 스크립트가 같은 호출을 끝없이 반복했다. 이를 호출 전에 막는 장치는?',
      o: ['사용자별 일일 토큰 한도 검사', '월말 비용 보고서', '모델별 비용 파이 차트'], a: 0,
      why: 'check_user_quota가 일 100,000토큰을 넘으면 호출 자체를 거절한다. 대시보드와 보고서는 일이 벌어진 뒤에야 보여 준다.' },
  ];

  R.page({ title: '토큰 비용 계산기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
