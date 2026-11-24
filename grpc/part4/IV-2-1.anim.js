/* IV-2-1 Retry Policy — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 시도 타임라인은 beat 의 sim{maxAttempts, retryable, attempts[{n, delay, code, result}], throttle} 을 읽는다.
 * 실측(grpc-js 1.14 · grpcio 1.85, initial 0.1s ×2, cap 1s): 재시도 앞 대기 1차 90~131ms, 2차 163~253ms, 3차 327~488ms, 4차 647~955ms (base × 0.8~1.2),
 * maxAttempts 8 → 5번만 시도, retryThrottling(10, 0.1) 로 서버가 계속 14 를 주면 첫 호출 4번 시도 뒤 다음 호출은 1번만. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, person, server, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const NUM = { OK: 0, UNAVAILABLE: 14, NOT_FOUND: 5, RESOURCE_EXHAUSTED: 8, INVALID_ARGUMENT: 3, FAILED: '✗' };
  const codeCol = (cd, res) => (cd === 'OK' ? GOOD : res === 'throttled' ? OFF : cd === 'FAILED' || res === 'fail' ? BAD : WARN);

  // ---------- 시도 타임라인: 시도 상자 + 사이 대기 막대, 남은 시도 자리는 점선 ----------
  function timeline(c, o) { o = o || {}; const sim = c.beat.sim, ps = (c.prev && c.prev.sim) || { attempts: [] }, u = c.u;
    const x0 = o.x ?? 60, y = o.y ?? 200, sc = o.sc ?? 0.42, BW = 66, at = sim.attempts;
    const same = ps.attempts.length && ps.headline === sim.headline;
    let x = x0;
    el('line', { x1: x0 - 10, y1: y + 44, x2: 920, y2: y + 44, stroke: GRID, 'stroke-width': 2 });
    for (let i = 0; i < Math.max(sim.maxAttempts, at.length); i++) { const a = at[i];
      if (!a) { el('rect', { x, y: y - 22, width: BW, height: 44, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }); mono(x + BW / 2, y + 66, `#${i + 1}`, { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle' }); x += BW + 14; continue; }
      const fresh = !(i < ps.attempts.length && ps.attempts[i].code === a.code && ps.attempts[i].delay === a.delay) || !same;
      const ap = fresh && !o.still ? 0.2 + i * 0.35 : -1;
      if (a.delay) { const w = a.delay * sc, g = ap < 0 ? 1 : E(u, ap, ap + 0.35);
        el('rect', { x, y: y + 30, width: w * g, height: 12, rx: 3, fill: WARNBG, stroke: WARN, 'stroke-width': 1.4 });
        if (g > 0.5) mono(x + w / 2, y + 66, `${a.delay}ms`, { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700 });
        x += w + 4; }
      const s = ap < 0 ? 1 : pop(u, ap + 0.3), col = codeCol(a.code, a.result);
      if (s > 0) { card(x + BW / 2, y, BW, 44, { rx: 8, text: a.result === 'throttled' ? '차단' : String(NUM[a.code] ?? a.code), fs: 18, fw: 800, mono: true, stroke: col, color: col, fill: a.code === 'OK' ? GOODBG : PANEL, sw: 2.4, s, dash: a.result === 'throttled' ? '5 4' : null });
        mono(x + BW / 2, y - 34, `#${a.n}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }
      x += BW + 14; }
    if (o.head !== false) tx(x0 - 10, y - 70, sim.headline, { 'font-size': 16, 'font-weight': 800 }); }
  // 재시도 대상 체
  function sieve(c, x, y) { const r = c.beat.sim.retryable || [];
    tx(x, y, 'retryableStatusCodes', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    if (!r.length) { mono(x, y + 26, '[ ]  (아직 없음)', { 'font-size': 14, fill: OFF }); return; }
    r.forEach((s, i) => pill(x + 70 + i * 0, y + 26 + i * 32, `${s} ${NUM[s]}`, GOOD, 1, { mono: true, fs: 13.5 })); }

  // ---------- 1. 왜 자동 재시도인가 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { // 롤링 재시작
      [0, 1, 2].forEach((i) => { const down = i === 1 && u < 2.2; server(560 + i * 150, 110, `pod-${i + 1}`, { s: 0.7, lamp: down ? BAD : GOOD, stroke: down ? BAD : INK, op: down ? lerp(1, 0.5, E(u, 0.2, 0.6)) : 1 }); });
      tx(710, 196, u < 2.2 ? '재시작 중 — 연결 거부' : '새 pod 가 떴다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: u < 2.2 ? BAD : GOOD });
      timeline(c, { y: 300, head: false }); tx(50, 230, c.beat.sim.headline, { 'font-size': 16, 'font-weight': 800 });
      sub(300, 404, '수백 ms 뒤면 사라질 일시 장애 · 재시도 없이 실패로 끝', fade(u, 1.6)); return; }
    if (k === 1) { timeline(c, { y: 250 });
      card(700, 90, 420, 70, { rx: 10, stroke: BAD, sw: 1.8, dash: '6 5', s: pop(u, 0.3) });
      mono(510, 84, 'for i := 0; i < 3; i++ { call() }', { 'font-size': 14.5, opacity: fade(u, 0.4) }); tx(510, 108, '호출부마다 복붙 · 대기 없음 · 한도 제각각', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 0.6) });
      return; }
    timeline(c, { y: 250 }); sieve(c, 680, 70);
    if (k === 2) { card(330, 100, 470, 70, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.3) });
      mono(110, 106, '"name": [{"service": "user.v1.UserService"}]', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) }); return; }
    if (k === 3) { note(50, 120, 'maxAttempts 3 = 최초 1 + 재시도 2', fade(u, 0.3), { 'font-weight': 800 }); sub(50, 146, '점선 칸이 아직 쓸 수 있는 자리', fade(u, 0.8), { 'text-anchor': 'start' }); return; }
    if (k === 4) { note(50, 120, '5 NOT_FOUND 는 목록에 없다 → 그 자리에서 끝', fade(u, 1.6), { fill: BAD }); return; }
    banner(330, 120, '핸들러도 호출부도 한 줄 안 바뀐다', pop(u, 1.6)); }

  // ---------- 2. retryPolicy 필드 — 백오프 막대 ----------
  const FIELDS = ['maxAttempts', 'initialBackoff', 'maxBackoff', 'backoffMultiplier', 'retryableStatusCodes'];
  const FV = ['5', '"0.1s"', '"1s"', '2', '[UNAVAILABLE, RESOURCE_EXHAUSTED]'];
  const JIT = [[90, 131], [163, 253], [327, 488], [647, 955]];   // 실측 대기 범위 (ms)
  function s2(t, c) { const { k, u } = c, sim = c.beat.sim;
    const lit = [0, 1, 2, 3, 4, -1, -1, 4][k];
    FIELDS.forEach((f, i) => { const on = i === lit, shown = i <= Math.max(lit, k >= 5 ? 4 : lit);
      mono(40, 50 + i * 30, `${f}: ${FV[i]}`, { 'font-size': 14, 'font-weight': on ? 800 : 500, fill: on ? ACC : shown ? INK : OFF }); });
    // 오른쪽: 회차별 base 막대 (높이 = ms)
    const bx = 470, by = 330, H = 0.24;   // 1ms = 0.24px
    el('line', { x1: bx - 10, y1: by, x2: 930, y2: by, stroke: GRID, 'stroke-width': 2 });
    const cap = k >= 2; if (cap) { el('line', { x1: bx - 10, y1: by - 1000 * H, x2: 930, y2: by - 1000 * H, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: k === 2 ? fade(u, 0.3) : 1 });
      tx(bx - 4, by - 1000 * H - 8, 'maxBackoff 1s', { 'font-size': 13.5, 'font-weight': 700, fill: BAD }); }
    const bases = [100, 200, 400, 800, 1000], nShow = k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : k === 3 ? 4 : 5;
    bases.forEach((b, i) => { if (i >= nShow) return; const x = bx + 10 + i * 90, fresh = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && i >= 2) || (k === 6 && i === 4);
      const g = fresh ? E(u, 0.3 + (i % 2) * 0.4, 1.0 + (i % 2) * 0.4) : 1;
      el('rect', { x, y: by - b * H * g, width: 56, height: b * H * g, rx: 4, fill: i === 4 ? OFF : ACC, opacity: 0.85 });
      if (g > 0.6) mono(x + 28, by - b * H - 8, `${b}`, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 4 ? MUT : ACC });
      mono(x + 28, by + 20, `재시도${i + 1}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (k === 3 && i > 0 && i < 4) tx(x - 17, by - b * H * 0.75, '×2', { 'font-size': 13.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      if (k === 5 && i < 4) { const [lo, hi] = JIT[i], o = fade(u, 0.4 + i * 0.3);
        el('rect', { x: x - 6, y: by - hi * H, width: 68, height: (hi - lo) * H, rx: 3, fill: WARN, opacity: 0.35 * o });
        el('line', { x1: x - 6, y1: by - hi * H, x2: x + 62, y2: by - hi * H, stroke: WARN, 'stroke-width': 2, opacity: o });
        el('line', { x1: x - 6, y1: by - lo * H, x2: x + 62, y2: by - lo * H, stroke: WARN, 'stroke-width': 2, opacity: o }); } });
    if (k === 0) { [1, 2, 3, 4, 5].forEach((n) => { const s = pop(u, 0.2 + n * 0.25); card(470 + n * 80, 200, 60, 44, { rx: 8, text: `#${n}`, fs: 16, fw: 800, mono: true, stroke: n === 1 ? INK : ACC, color: n === 1 ? INK : ACC, s }); });
      tx(550, 270, '최초', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); tx(790, 270, '재시도 4번', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(700, 310, '5보다 크게 적어도 5로 잘린다 (8을 넣어 본 실측: 5번)', fade(u, 2.0)); }
    if (k === 4) { timeline(c, { x: 40, y: 260, sc: 0.18, head: false }); return; }
    if (k === 5) { mono(40, 230, 'base × random(0.8, 1.2)', { 'font-size': 16, 'font-weight': 800, fill: WARN });
      sub(40, 258, '노란 띠 = 실측 대기 범위', fade(u, 1.0), { 'text-anchor': 'start' }); sub(40, 282, 'grpc-js · Python 모두 같은 폭', fade(u, 1.2), { 'text-anchor': 'start' });
      sub(40, 306, '모두가 같은 순간에 다시 몰리지 않는다', fade(u, 1.6), { 'text-anchor': 'start', fill: INK }); return; }
    if (k === 6) { mono(40, 240, 'base(n) = min(0.1s × 2^(n-1), 1s)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) }); sub(40, 268, '다섯 번째부터는 1s 에 붙는다', fade(u, 1.4), { 'text-anchor': 'start' }); return; }
    if (k === 7) { [['재시도 O', ['UNAVAILABLE 14', 'RESOURCE_EXHAUSTED 8'], GOOD], ['넣지 않는다', ['INVALID_ARGUMENT 3', 'NOT_FOUND 5', 'PERMISSION_DENIED 7', 'UNAUTHENTICATED 16'], BAD]].forEach(([h, l, col], j) => {
        tx(40, 230 + j * 0, '', {}); tx(40 + j * 210, 222, h, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + j * 0.6) });
        l.forEach((s, i) => mono(40 + j * 210, 248 + i * 24, s, { 'font-size': 13.5, fill: col, opacity: fade(u, 0.4 + j * 0.6 + i * 0.15) })); }); } }

  // ---------- 3. 클라이언트 적용 — 채널에 config 부착 ----------
  function pipe(o) { o = o || {};
    person(60, 110, '호출부', { s: 0.85 });
    card(250, 110, 180, 56, { rx: 10, text: 'UserServiceClient', fs: 14, mono: true, stroke: GRID });
    el('rect', { x: 350, y: 88, width: 380, height: 44, rx: 22, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    tx(368, 116, 'ClientConn (채널)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (o.policy) card(600, 110, 180, 34, { rx: 17, text: 'retryPolicy', fs: 14, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: o.policy });
    server(850, 110, 'UserService', { s: 0.8 }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { card(480, 110, 820, 150, { rx: 12, stroke: GRID, fill: SOFT, s: pop(u, 0.1) });
      ['const retryServiceConfig = `{', '  "methodConfig": [{ "name": [{ "service": "user.v1.UserService" }],', '    "retryPolicy": { "maxAttempts": 4, "initialBackoff": "0.1s",', '      "maxBackoff": "1s", "backoffMultiplier": 2, "retryableStatusCodes": ["UNAVAILABLE"] } }] }`'].forEach((l, i) =>
        mono(84, 62 + i * 30, l, { 'font-size': 13.5, fill: (k === 1 && i >= 2) ? ACC : INK, 'font-weight': (k === 1 && i >= 2) ? 700 : 400, opacity: k === 0 ? fade(u, 0.3 + i * 0.3) : 1 }));
      if (k === 1) timeline(c, { y: 300, head: false, sc: 0.5 });
      return; }
    pipe({ policy: k === 2 ? pop(u, 0.3) : 1 });
    if (k === 2) { fly(600, 30, 600, 70, seg(u, 0.1, 0.5), 'WithDefaultServiceConfig', { mono: true }); timeline(c, { y: 290, head: false }); return; }
    if (k === 3) { // deadline 5s 창
      const w = E(u, 0.2, 1.0); el('rect', { x: 40, y: 220, width: 880 * w, height: 140, rx: 10, fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': '8 5' });
      tx(54, 244, 'ctx: WithTimeout 5s — 모든 재시도가 이 안에서 끝나야 한다', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) });
      timeline(c, { y: 300, head: false, x: 70 }); return; }
    if (k === 4) { dot([[90, 110], [350, 110], [760, 110], [800, 110]], seg(u, 0.3, 1.3), ACC, 7);
      mono(60, 200, 'user, err := client.GetUser(ctx, req)   // 평범한 한 번', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      timeline(c, { y: 310, head: false }); return; }
    if (k === 5) { timeline(c, { y: 290, head: false });
      card(480, 200, 520, 46, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.8) });
      mono(240, 206, 'log.Fatalf("최종 실패: %v", err)  // 마지막 14', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 6) { // previous-rpc-attempts
      [['#1', '(없음)'], ['#2', '1'], ['#3', '2'], ['#4', '3']].forEach(([a, v], i) => { const y = 200 + i * 48, s = pop(u, 0.2 + i * 0.35);
        card(300, y, 520, 38, { rx: 6, stroke: i ? ACC : GRID, sw: 1.8, s });
        mono(56, y + 5, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); mono(100, y + 5, `grpc-previous-rpc-attempts: ${v}`, { 'font-size': 14.5, fill: i ? ACC : MUT, opacity: s }); });
      tx(600, 200, '서버가 받은 요청 헤더 (실측)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      sub(600, 228, '응답 쪽에 다시 붙여 주는지는', fade(u, 2.0), { 'text-anchor': 'start' }); sub(600, 250, '구현마다 다르다 (grpc-js O · Python X)', fade(u, 2.1), { 'text-anchor': 'start' }); return; }
    // k7 — DNS/xDS
    [['DNS TXT', 'grpc_config=…'], ['xDS 서버', '컨트롤 플레인']].forEach(([a, b], i) => { const x = 360 + i * 260, s = pop(u, 0.3 + i * 0.4);
      card(x, 290, 220, 70, { rx: 10, stroke: INFO, sw: 2, s }); tx(x, 284, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: s }); sub(x, 306, b, s);
      grow(x, 254, 600, 132, E(u, 0.8 + i * 0.3, 1.3 + i * 0.3), INFO); });
    note(480, 390, '정책을 중앙에서 내려주면 클라이언트 재배포 없이 바꾼다', fade(u, 1.8), { 'text-anchor': 'middle' }); }

  // ---------- 4. 폭주 방지 — 토큰 버킷 + hedging ----------
  function bucket(c, o) { o = o || {}; const th = c.beat.sim.throttle; if (!th) return; const pt = (c.prev && c.prev.sim.throttle) || th;
    const tok = tween(pt.tokens, th.tokens, c.u), x0 = 580, y0 = 340;
    tx(x0, 70, `retryThrottling · 토큰 ${Math.round(tok * 10) / 10} / ${th.max}`, { 'font-size': 15, 'font-weight': 800 });
    for (let i = 0; i < th.max; i++) { const full = clamp(tok - i), x = x0 + 20 + (i % 5) * 62, y = y0 - Math.floor(i / 5) * 62 - 40;
      el('circle', { cx: x, cy: y, r: 24, fill: 'none', stroke: GRID, 'stroke-width': 1.6 });
      if (full > 0) el('circle', { cx: x, cy: y, r: 24 * full, fill: tok > th.max / 2 ? GOOD : BAD, opacity: 0.85 }); }
    const ty = y0 - 71; el('line', { x1: x0 - 14, y1: ty, x2: x0 + 300, y2: ty, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5' });
    tx(x0, y0 + 20, '빨간 선 아래(절반 5 이하)로 내려가면 재시도 금지', { 'font-size': 13.5, 'font-weight': 800, fill: BAD });
    tx(x0, 116, '실패 −1 · 성공 +0.1 · 처음엔 가득', { 'font-size': 13.5, fill: MUT }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { timeline(c, { y: 160, x: 50, sc: 0.3 });
      server(760, 330, '이미 과부하', { s: 0.8, lamp: BAD, stroke: BAD });
      for (let i = 0; i < 12; i++) dot([[80 + (i % 4) * 30, 300 + Math.floor(i / 4) * 30], [700, 330]], ((t * 0.7 + i / 12) % 1), BAD, 5);
      note(60, 400, '모든 클라이언트가 다시 던지면 트래픽이 배가된다', fade(u, 1.4), { fill: BAD }); return; }
    if (k <= 3) { bucket(c); timeline(c, { y: 230, x: 40, sc: 0.3, head: false });
      tx(30, 80, c.beat.sim.headline, { 'font-size': 16, 'font-weight': 800 });
      if (k === 1) mono(30, 120, '"maxTokens": 10, "tokenRatio": 0.1', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
      if (k === 2) note(30, 120, '실패 두 번에 10 → 8', fade(u, 0.6), { fill: BAD });
      if (k === 3) note(30, 120, '정책은 그대로 · 토큰만 더 줄어든다', fade(u, 0.6));
      return; }
    if (k <= 6) { // hedging: 세 갈래 병렬
      const lanes = c.beat.sim.attempts; tx(40, 50, 'hedgingPolicy · maxAttempts 3 · hedgingDelay 0.2s', { 'font-size': 15, 'font-weight': 800 });
      const x0 = 160, S = 0.9;
      el('line', { x1: x0, y1: 350, x2: 900, y2: 350, stroke: GRID, 'stroke-width': 2 }); [0, 200, 400, 600].forEach((v) => mono(x0 + v * S, 372, `${v}ms`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      lanes.forEach((a, i) => { const y = 120 + i * 76, st = x0 + a.delay * S, f = k === 4 && i > 0 ? 0 : E(u, 0.2 + i * 0.5, 0.8 + i * 0.5);
        mono(40, y + 5, `#${a.n}`, { 'font-size': 15, 'font-weight': 800 }); if (f <= 0) { el('line', { x1: st, y1: y, x2: st + 40, y2: y, stroke: GRID, 'stroke-dasharray': '4 4' }); return; }
        const len = (a.code === 'OK' ? 160 : 260) * S * f, col = codeCol(a.code, a.result);
        el('line', { x1: st, y1: y, x2: st + len, y2: y, stroke: col, 'stroke-width': 6, 'stroke-linecap': 'round' });
        if (f >= 1) card(st + len + 30, y, 44, 32, { rx: 6, text: String(NUM[a.code]), fs: 15, mono: true, fw: 800, stroke: col, color: col }); });
      if (k === 5) note(560, 404, '먼저 온 성공을 취한다 · 꼬리 지연(p99)이 짧아진다', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD });
      if (k === 6) { note(560, 404, '세 요청 모두 서버에서 실제로 실행된다 · 멱등 연산에만', fade(u, 1.8), { 'text-anchor': 'middle', fill: BAD });
        pill(780, 60, 'retryPolicy 와 동시 지정 불가', BAD, pop(u, 1.2), { fs: 13.5 }); }
      return; }
    bucket(c); timeline(c, { y: 230, x: 40, sc: 0.3, head: false }); tx(30, 80, c.beat.sim.headline, { 'font-size': 16, 'font-weight': 800 });
    note(30, 120, '6 → 5 가 되는 순간 세 번째 시도는 나가지 않는다', fade(u, 1.0), { fill: BAD });
    sub(30, 400, '일시 장애는 retry · p99 가 중요한 읽기는 hedging', fade(u, 1.8), { 'text-anchor': 'start' }); }

  // ---------- 5. 인터셉터 수동 재시도 vs service config ----------
  function loop(hot, u) { const cx = 250, cy = 210, r = 110;
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3 });
    [['invoker(...)', -90], ['err == nil ? return', 0], ['Code != Unavailable ? return', 90], ['wait base×2^n · ctx.Done()', 180]].forEach(([s, a], i) => {
      const x = cx + Math.cos(a * Math.PI / 180) * r, y = cy + Math.sin(a * Math.PI / 180) * r, on = hot === i;
      card(x, y, tw(s, 13.5) + 24, 32, { rx: 16, text: s, fs: 13.5, mono: true, fw: 700, stroke: on ? ACC : GRID, color: on ? ACC : INK, fill: on ? ACCBG : PANEL, sw: on ? 2.4 : 1.6 }); });
    if (hot != null) dot([[cx, cy - r], [cx + r * 0.7, cy - r * 0.7], [cx + r, cy], [cx + r * 0.7, cy + r * 0.7], [cx, cy + r], [cx - r * 0.7, cy + r * 0.7], [cx - r, cy], [cx - r * 0.7, cy - r * 0.7], [cx, cy - r]], (u * 0.45) % 1, ACC, 6); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { ['응답 내용을 보고 재시도할지 정한다', '401 이면 토큰을 갱신하고 다시 부른다', '재시도 사이에 메트릭·백필을 끼운다'].forEach((s, i) => { const y = 120 + i * 70, sc = pop(u, 0.3 + i * 0.4);
        card(360, y, 560, 52, { rx: 10, stroke: INFO, sw: 2, s: sc }); tx(100, y + 5, s, { 'font-size': 16, 'font-weight': 700, opacity: sc }); });
      note(480, 370, 'service config JSON 으로는 표현할 수 없는 조건들', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k <= 3) { loop([0, 2, 3][k - 1], u); timeline(c, { x: 480, y: 250, sc: 0.5, head: false });
      tx(470, 80, c.beat.sim.headline, { 'font-size': 16, 'font-weight': 800 }); return; }
    if (k === 4) { loop(null, u); card(680, 210, 420, 120, { rx: 12, stroke: ACC, sw: 2, s: pop(u, 0.3) });
      ['grpc.NewClient(addr,', '  grpc.WithUnaryInterceptor(', '    retryInterceptor(3, 100*time.Millisecond)))'].forEach((l, i) => mono(486, 180 + i * 28, l, { 'font-size': 13.5, opacity: fade(u, 0.5 + i * 0.3) }));
      note(680, 310, '붙는 곳은 service config 와 같은 채널', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { const rows = [['', 'service config', 'interceptor'], ['코드', '무변경 · 선언적', '직접 짠다'], ['관리', 'DNS/xDS 로 중앙', '배포해야 바뀜'], ['스트리밍', '지원', '직접 처리'], ['쓰는 때', '기본값', '조건부 재시도만']];
      rows.forEach((r, i) => { const y = 70 + i * 60, o = fade(u, 0.2 + i * 0.3);
        r.forEach((s, j) => { const x = [140, 420, 720][j]; if (i === 0) tx(x, y, s, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: j === 1 ? GOOD : j === 2 ? INFO : MUT, opacity: o });
          else tx(x, y, s, { 'font-size': 15, 'font-weight': j ? 600 : 800, 'text-anchor': 'middle', fill: j ? INK : MUT, opacity: o }); });
        if (i) el('line', { x1: 60, y1: y - 34, x2: 900, y2: y - 34, stroke: GRID, opacity: o }); }); return; }
    if (k === 6) { [['retryable 코드만', '14 처럼 다시 보내면 나을 수 있는 것'], ['멱등 연산에만', '두 번 실행돼도 결과가 같은 것'], ['deadline + throttling', '시간과 횟수에 상한을 둔다']].forEach(([a, b], i) => {
        const y = 100 + i * 90, s = pop(u, 0.3 + i * 0.45); card(480, y, 600, 68, { rx: 10, stroke: GOOD, sw: 2, s }); check(220, y, 11, s);
        tx(250, y - 4, a, { 'font-size': 17, 'font-weight': 800, opacity: s }); tx(250, y + 20, b, { 'font-size': 14, fill: MUT, opacity: s }); }); return; }
    loop(null, u); card(700, 200, 380, 130, { rx: 12, stroke: BAD, sw: 2, s: pop(u, 0.4) });
    tx(700, 170, '다음: IV-2-2', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    tx(700, 202, '재시도로 못 살리는 장애는', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    tx(700, 228, '취소와 회로 차단으로 끊는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.1) }); }

  const quiz = [
    { q: 'maxAttempts가 3이면 재시도는 최대 몇 번 일어나는가?',
      o: ['3번', '2번', '4번'], a: 1,
      why: 'maxAttempts는 최초 호출을 포함한 총 횟수다. 3이면 최초 1번에 재시도 2번이다.' },
    { q: 'initialBackoff 0.1s, 배수 2일 때 세 번째 재시도 앞 대기는 실측으로 어느 범위였나?',
      o: ['0~400ms', '정확히 400ms', '약 320~480ms'], a: 2,
      why: 'base는 0.4s이고 0.8~1.2배 지터가 붙는다. 실측도 327~488ms였다.' },
    { q: 'WithDefaultServiceConfig로 재시도를 붙일 때 함께 꼭 거는 것은 무엇인가?',
      o: ['deadline(WithTimeout)', 'hedgingPolicy', '호출부의 for 루프'], a: 0,
      why: '마감이 없으면 재시도가 시간을 끝없이 먹는다. 페이지 예시는 5초 마감 안에서 재시도를 끝낸다.' },
    { q: 'retryThrottling(maxTokens 10)에서 재시도가 막히는 때는 언제인가?',
      o: ['토큰이 0이 될 때', '토큰이 5 이하로 떨어질 때', '실패가 3번 연속일 때'], a: 1,
      why: '토큰이 maxTokens의 절반 이하면 재시도를 멈춘다. 실측에서도 첫 호출로 6이 된 뒤 다음 호출은 1번만 시도했다.' },
    { q: '인터셉터로 수동 재시도를 짜야 하는 경우는 무엇인가?',
      o: ['UNAVAILABLE을 세 번까지 다시 보낼 때', '모든 호출에 지수 백오프를 걸 때', '401이면 토큰을 갱신한 뒤 다시 부를 때'], a: 2,
      why: '토큰 갱신처럼 재시도 사이에 할 일이 있으면 설정만으로는 표현할 수 없다. 단순 재시도는 service config가 기본이다.' },
  ];

  const summary = [
    '롤링 재시작 같은 일시 장애는 UNAVAILABLE로 오고, 수백 ms 뒤 다시 보내면 대개 성공한다.',
    '재시도는 service config의 retryPolicy로 선언하고 호출부 코드는 그대로 둔다.',
    '대기는 0.1s에서 두 배씩 늘고 1s에서 멈추며, 매번 0.8~1.2배로 흔들린다.',
    'retryThrottling은 토큰이 절반 이하가 되면 재시도를 막아 장애 중 폭주를 줄인다.',
  ];
  const review = [
    { q: '결제 생성 RPC에 hedging을 걸었더니 같은 주문이 두 번 결제됐다. 원인은?',
      o: ['hedgingDelay가 너무 길었다', 'hedging은 요청을 실제로 여러 번 실행하는데 결제는 멱등이 아니다', 'retryableStatusCodes가 비어 있었다'], a: 1,
      why: 'hedging은 응답을 기다리지 않고 추가 요청을 보내 모두 서버에서 실행된다. 멱등이 아닌 연산에는 쓰면 안 된다.' },
    { q: '서버가 과부하로 14를 계속 내는데 클라이언트 재시도가 부하를 더 키운다. 설정에서 먼저 손댈 것은?',
      o: ['retryThrottling을 추가한다', 'maxAttempts를 8로 올린다', 'initialBackoff를 0으로 줄인다'], a: 0,
      why: '실패가 이어지면 토큰이 줄어 재시도가 스스로 멈춘다. maxAttempts는 어차피 5에서 잘리고 대기를 줄이면 폭주가 커진다.' },
    { q: '재시도 정책을 붙였는데 NOT_FOUND 요청이 한 번만 가고 끝난다. 어떻게 보나?',
      o: ['정책이 채널에 안 붙은 버그다', 'maxBackoff가 너무 짧아서다', '목록에 없는 코드라 바로 돌려준 정상 동작이다'], a: 2,
      why: 'retryableStatusCodes에 든 코드만 다시 보낸다. NOT_FOUND는 다시 보내도 결과가 같아 목록에 넣지 않는다.' },
  ];

  R.page({ title: '재시도 타임라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
