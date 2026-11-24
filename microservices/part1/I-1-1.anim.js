/* I-1-1 모놀리스 vs MSA — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 한 jar 안의 도메인 패키지 4개 → 서비스로 쪼개지며 서비스마다 DB 를 갖는다. 아래 계기판은 STEPS 의 teamSize · deployUnits · deployTime.
 * 숫자: 페이지 데이터·코드 주석만. 500~5000배(0.01ms 대 5~50ms), 최대 3번 시도·3초(timeout 1s, retry 2), 8×3=24 는 node 로 계산했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, cross, check, lock, clock, meters, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const DOM = ['user', 'product', 'order', 'payment'];
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  // 선이 자라며 그려지는 상자 (f: 0 → 1)
  function outline(x, y, w, h, f, col, o) { o = o || {}; if (f <= 0) return; const per = 2 * (w + h);
    el('rect', { x, y, width: w, height: h, rx: o.rx ?? 12, fill: f >= 1 ? (o.fill || 'none') : 'none', stroke: col || INK, 'stroke-width': o.sw || 2.5,
      'stroke-dasharray': f >= 1 ? o.dash : `${per * f} ${per}`, opacity: o.op ?? 1 }); }
  // 도메인 패키지 칸
  function tile(cx, cy, name, o) { o = o || {};
    return card(cx, cy, o.w || 100, o.h || 64, { rx: 8, text: name, fs: 15, mono: true, fw: 700, stroke: o.stroke || INK, fill: o.fill || SOFT, color: o.color || INK, dash: o.dash, sw: o.sw || 2, s: o.s, op: o.op }); }
  // 계기판: 팀 인원 · 배포 단위 · 배포 1회 소요 (앞 beat 값에서 이어서)
  function gauges(c) { const b = c.beat, p = c.prev || {};
    const ts = tween(p.teamSize, b.teamSize, c.u), du = tween(p.deployUnits, b.deployUnits, c.u), dt = tween(p.deployTime, b.deployTime, c.u);
    meters(150, 334, 660, [
      { name: '팀 인원', val: Math.round(ts) + '명', bar: ts / 50 * 100 },
      { name: '배포 단위', val: Math.round(du) + '개', bar: du / 10 * 100, good: b.deployUnits > 1 },
      { name: '배포 1회 소요', val: Math.round(dt) + '분', bar: dt / 70 * 100, hot: dt >= 30 },
    ], { h: 64 }); }

  // ---------- 1. 모놀리스 — 한 jar ----------
  const TX = [310, 420, 530, 640], TY = 150;
  function jar(f, title, o) { o = o || {}; outline(250, 40, 460, 236, f, o.col || INK, { fill: o.fill || PANEL });
    if (f >= 1) mono(268, 66, title, { 'font-size': 15, 'font-weight': 800, fill: o.col || INK }); }
  function s1(t, c) { const { k, u } = c;
    jar(k === 0 ? E(u, 0.2, 1.3) : 1, 'shop-service.jar');
    server(110, 150, '서버 1대', { lamp: k >= 1 ? GOOD : OFF, s: k === 0 ? pop(u, 0.2) : 1 });
    pill(560, 62, 'main() → 프로세스 1개', ACC, k === 0 ? pop(u, 1.4) : 1, { fs: 13.5 });
    if (k === 0) { note(480, 170, '이 main 하나가 배포 단위 하나', fade(u, 1.9), { 'text-anchor': 'middle', fill: MUT }); gauges(c); return; }
    DOM.forEach((d, i) => tile(TX[i], TY, d, { dash: '6 5', s: k === 1 ? pop(u, 0.2 + i * 0.3) : 1, stroke: k === 2 && (i === 1 || i === 3) ? ACC : k === 2 && i === 2 ? INK : INK, sw: k === 2 && i === 2 ? 3 : 2 }));
    if (k === 1) { note(480, 236, '패키지 경계 = 코드 경계일 뿐', fade(u, 1.6), { 'text-anchor': 'middle', fill: MUT }); }
    if (k === 2) { // order → product, order → payment : 객체 참조
      const g1 = E(u, 0.3, 1.0), g2 = E(u, 0.8, 1.5);
      if (g1 > 0) el('path', { d: `M${TX[2] - 20},${TY - 34} Q${TX[2] - 55},${TY - 70} ${TX[1] + 20},${TY - 34}`, fill: 'none', stroke: ACC, 'stroke-width': 2.6, 'stroke-dasharray': `${g1 * 140} 200`, 'marker-end': g1 >= 1 ? 'url(#ra-ahb)' : null });
      if (g2 > 0) el('path', { d: `M${TX[2] + 20},${TY - 34} Q${TX[2] + 55},${TY - 70} ${TX[3] - 20},${TY - 34}`, fill: 'none', stroke: ACC, 'stroke-width': 2.6, 'stroke-dasharray': `${g2 * 140} 200`, 'marker-end': g2 >= 1 ? 'url(#ra-ahb)' : null });
      note(480, 220, '필드 주입 = 같은 JVM 안의 객체 참조', fade(u, 1.5), { 'text-anchor': 'middle', fill: ACC });
      sub(480, 246, '네트워크 0 · 인증 0 · 직렬화 0', fade(u, 1.9), { 'font-size': 14.5 }); }
    if (k >= 3) { dbIcon(860, 150, '한 DB', { s: 0.8 }); el('line', { x1: 710, y1: 150, x2: 822, y2: 150, stroke: GRID, 'stroke-width': 2.5 }); }
    if (k === 3) { // @Transactional 막대: reserve → charge → save
      const steps = [['reserve', 1], ['charge', 3], ['save', 2]];
      tx(270, 222, '@Transactional', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: INFO, opacity: fade(u, 0.2) });
      steps.forEach(([s, ti], i) => { const f = E(u, 0.4 + i * 0.5, 0.9 + i * 0.5), x = 400 + i * 100;
        el('rect', { x, y: 208, width: 96, height: 22, rx: 4, fill: SOFT, stroke: GRID });
        el('rect', { x, y: 208, width: 96 * f, height: 22, rx: 4, fill: INFO, opacity: 0.8 });
        mono(x + 48, 249, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: f >= 1 ? INFO : MUT, 'font-weight': 700 }); });
      dot([[TX[2], TY + 32], [TX[1], TY + 32], [TX[3], TY + 32], [822, 150]], seg(u, 0.4, 2.0), INFO, 6);
      note(480, 300 - 10, '하나라도 실패하면 셋 다 ROLLBACK', fade(u, 2.2), { 'text-anchor': 'middle', fill: INFO }); }
    if (k === 4) { // 빌드 한 번 → 산출물 하나 → 실행 한 줄
      const ch = [['./gradlew build', 0.2], ['shop-service.jar 1개', 0.8], ['java -jar …', 1.4]], xs = [345, 530, 690], hw = ch.map(([s]) => (tw(s, 13.5) + 26) / 2);
      ch.forEach(([s, a], i) => { pill(xs[i], 236, s, i === 1 ? ACC : INK, pop(u, a), { mono: true, fs: 13.5 });
        if (i) grow(xs[i - 1] + hw[i - 1] + 4, 236, xs[i] - hw[i] - 4, 236, E(u, a - 0.3, a), MUT); });
      note(480, 300 - 10, '파이프라인 하나, 5분이면 끝', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); }
    gauges(c); }

  // ---------- 2. 장점 — 호출·TX·배포·로그·온보딩 ----------
  function logX(v) { return 200 + (Math.log10(v) + 3) / 5 * 640; }   // 0.001 ~ 100ms 로그 눈금
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { // 호출 비용 비교 (로그 눈금)
      el('line', { x1: 200, y1: 250, x2: 840, y2: 250, stroke: MUT, 'stroke-width': 1.8 });
      [0.001, 0.01, 0.1, 1, 10, 100].forEach((v) => { el('line', { x1: logX(v), y1: 250, x2: logX(v), y2: 256, stroke: MUT }); mono(logX(v), 276, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      tx(840, 300, '로그 눈금 (한 칸 = 10배)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const f1 = E(u, 0.2, 0.8), f2 = E(u, 0.9, 1.9);
      tx(40, 112, '메서드 호출', { 'font-size': 15, 'font-weight': 700 }); tx(40, 192, 'REST / gRPC', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 200, y: 96, width: (logX(0.01) - 200) * f1, height: 24, rx: 4, fill: GOOD });
      if (f1 >= 1) mono(logX(0.01) + 10, 114, '0.01ms', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      el('rect', { x: 200, y: 176, width: (logX(5) - 200) * f2, height: 24, rx: 4, fill: WARN });
      if (f2 >= 1) { el('rect', { x: logX(5), y: 176, width: (logX(50) - logX(5)) * E(u, 1.9, 2.3), height: 24, rx: 4, fill: WARN, opacity: 0.45 });
        mono(logX(50) + 10, 194, '5~50ms', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.2) }); }
      sub(logX(5), 232, '+ 직렬화 · 인증 · 재시도', fade(u, 1.6), { 'font-size': 14 });
      pill(520, 46, '같은 호출이 500 ~ 5000배', BAD, pop(u, 2.3), { fs: 15 }); return; }
    if (k === 1 || k === 2) { // 한 TX 안의 세 작업
      const bad = k === 2;
      outline(80, 70, 560, 170, k === 1 ? E(u, 0.1, 0.8) : 1, bad ? BAD : INFO, { fill: bad ? BADBG : INFOBG, op: 1 });
      mono(98, 96, '@Transactional  place(req)', { 'font-size': 15, 'font-weight': 700, fill: bad ? BAD : INFO, opacity: k === 1 ? fade(u, 0.6) : 1 });
      const names = ['① 재고 차감', '② 결제', '③ 주문 저장'];
      names.forEach((s, i) => { const x = 175 + i * 185, on = k === 1 ? fade(u, 0.8 + i * 0.4, 0.3) : 1;
        const st = bad ? (i === 1 ? { stroke: BAD, color: BAD } : { stroke: OFF, color: MUT }) : { stroke: INFO, color: INK };
        card(x, 160, 160, 54, { rx: 8, text: s, fs: 15, stroke: on > 0 ? st.stroke : GRID, color: st.color, op: 0.25 + 0.75 * (bad ? 1 : on), dash: bad && i !== 1 && u > 1.2 ? '5 4' : null });
        if (i < 2) grow(x + 82, 160, x + 103, 160, k === 1 ? E(u, 1.0 + i * 0.4, 1.2 + i * 0.4) : 1, bad ? OFF : INFO); });
      if (k === 1) { pill(360, 274, 'COMMIT 지점 1개', INFO, pop(u, 2.2), { fs: 15 });
        dbIcon(800, 160, '한 DB', { s: 0.8 }); grow(640, 160, 762, 160, E(u, 2.0, 2.5), INFO); return; }
      cross(360, 120, 11, pop(u, 0.3));
      el('path', { d: 'M 360 205 Q 260 236 175 205', fill: 'none', stroke: BAD, 'stroke-width': 2.6, 'stroke-dasharray': `${E(u, 0.6, 1.4) * 220} 300`, 'marker-end': u > 1.4 ? 'url(#ra-ahr)' : null });
      note(360, 268, 'DB 가 자동 ROLLBACK', fade(u, 1.3), { 'text-anchor': 'middle', fill: BAD });
      card(800, 160, 230, 108, { rx: 10, dash: '6 5', stroke: MUT, s: pop(u, 1.6) });
      tx(800, 136, 'MSA 였다면', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      tx(800, 164, 'Saga + 보상 트랜잭션', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(800, 190, '을 직접 짠다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { // 배포 세 명령
      const lines = ['$ ./gradlew build', ['BUILD SUCCESSFUL', 'var(--good)'], '$ scp shop.jar prod:/opt', '$ systemctl restart shop', ['shop.service: active (running)', 'var(--good)']];
      terminal(80, 60, 520, 210, lines, E(u, 0.1, 2.2) * lines.length, { title: 'deploy' });
      clock(760, 140, 52, E(u, 1.2, 2.4), GOOD, null);
      mono(760, 228, 'scp + restart ≈ 30초', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.2) });
      note(340, 310, '파이프라인 1개 · 서버 1대', fade(u, 2.3), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 4) { // 스택 트레이스 하나에 흐름 전체
      const lines = [['ERROR  IllegalStateException: 재고 부족', 'var(--bad)'], '  at c.s.product.ProductService.reserve', '  at c.s.order.OrderService.place', '  at c.s.order.OrderController.post', '  at c.s.user.AuthFilter.doFilter'];
      terminal(60, 50, 600, 200, lines, E(u, 0.2, 1.8) * lines.length, { title: 'app.log (한 파일)' });
      ['product', 'order', 'user'].forEach((d, i) => pill(790, 90 + i * 52, d, ACC, pop(u, 1.0 + i * 0.3), { mono: true, fs: 14 }));
      note(790, 270, '한 trace 에 다 보인다', fade(u, 1.9), { 'text-anchor': 'middle', fill: ACC });
      sub(360, 290, '분산 추적(trace id) 없이도 흐름이 한눈에', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k5: 온보딩
    tx(60, 96, '모놀리스', { 'font-size': 16, 'font-weight': 800, fill: GOOD });
    ['clone', 'IDE 열기', 'run'].forEach((s, i) => { pill(250 + i * 130, 90, s, GOOD, pop(u, 0.2 + i * 0.25), { fs: 14 }); if (i) grow(250 + (i - 1) * 130 + 44, 90, 250 + i * 130 - 44, 90, E(u, 0.1 + i * 0.25, 0.3 + i * 0.25), GOOD); });
    mono(690, 96, '30분', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
    tx(60, 196, 'MSA', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
    for (let i = 0; i < 10; i++) { const s = pop(u, 1.3 + i * 0.06); el('rect', { x: 190 + i * 28, y: 176, width: 22, height: 30, rx: 3, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, opacity: s }); }
    tx(190, 232, 'repo 10개', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) });
    pill(560, 190, 'docker-compose', WARN, pop(u, 1.9), { fs: 14, mono: true }); pill(560, 236, 'env 매핑', WARN, pop(u, 2.1), { fs: 14 });
    mono(690, 196, '1주', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.3) });
    note(480, 300, '단순함이 작은 팀의 무기', fade(u, 2.4), { 'text-anchor': 'middle', fill: MUT }); }

  // ---------- 3. 한계 — 30명이 한 jar ----------
  function team30(cx, cy, op) { for (let i = 0; i < 30; i++) { const g = Math.floor(i / 8), a = (i % 8) / 8 * Math.PI * 2, gx = cx + (g % 2) * 70 - 35, gy = cy + Math.floor(g / 2) * 70 - 35;
      el('circle', { cx: gx + Math.cos(a) * 20, cy: gy + Math.sin(a) * 20, r: 5, fill: [ACC, INFO, WARN, GOOD][g], opacity: op }); }
  }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { jar(1, 'shop-service.jar', { col: u > 1.0 ? WARN : INK });
      DOM.forEach((d, i) => { tile(TX[i], TY, d, { stroke: i === 3 ? WARN : INK, fill: i === 3 ? WARNBG : SOFT });
        const f = E(u, 1.0 + i * 0.3, 1.3 + i * 0.3); if (f > 0) check(TX[i], TY + 56, 9, f); });
      pill(TX[3], 92, '보안 패치 1줄', WARN, pop(u, 0.2), { fs: 13.5 });
      note(480, 250, '한 줄 고쳐도 전체 재빌드 + 전 도메인 회귀 테스트', fade(u, 1.0), { 'text-anchor': 'middle', fill: WARN });
      server(110, 150, null, { lamp: WARN }); gauges(c); return; }
    if (k === 1) { team30(150, 150, 1);
      tx(150, 262, '30명 · 4팀', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      const qx = 330; tx(qx, 96, 'main 머지 대기열', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 8; i++) { const on = clamp(E(u, 0.2, 1.8) * 8 - i);
        card(qx + 22 + i * 42, 140, 36, 44, { rx: 5, text: 'PR', fs: 13.5, mono: true, stroke: on > 0 ? WARN : GRID, fill: on > 0 ? WARNBG : PANEL, color: on > 0 ? WARN : OFF, s: 0.7 + 0.3 * on }); }
      mono(qx + 350, 146, '8개', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
      for (let i = 0; i < 4; i++) dot([[200, 150], [qx + 10, 140]], ((t * 0.7 + i / 4) % 1), [ACC, INFO, WARN, GOOD][i], 5);
      card(780, 150, 110, 96, { rx: 10, stroke: BAD, s: pop(u, 2.0) }); tx(780, 128, '금요일', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      lock(780, 166, true, BAD, pop(u, 2.2)); sub(780, 218, 'release freeze', fade(u, 2.3), { fill: BAD, 'font-weight': 700 });
      gauges(c); return; }
    if (k === 2) { // 결제만 폭증 → jar 통째로 증설
      tx(40, 60, '도메인별 트래픽', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      [['user', 1], ['product', 1], ['order', 1.4], ['payment', 6]].forEach(([d, v], i) => { const f = E(u, 0.2 + i * 0.1, 1.0);
        mono(40, 96 + i * 34, d, { 'font-size': 14 }); el('rect', { x: 120, y: 82 + i * 34, width: v * 26 * f, height: 18, rx: 3, fill: i === 3 ? BAD : OFF }); });
      for (let n = 0; n < 3; n++) { const s = pop(u, 0.9 + n * 0.35), x0 = 340 + n * 200;
        card(x0 + 85, 150, 180, 170, { rx: 10, stroke: n ? WARN : INK, s, dash: n ? '6 4' : null });
        DOM.forEach((d, i) => card(x0 + 85, 92 + i * 38, 150, 30, { rx: 5, text: d, fs: 13.5, mono: true, stroke: i === 3 ? BAD : GRID, color: i === 3 ? BAD : MUT, fill: i === 3 ? BADBG : SOFT, s }));
        mono(x0 + 85, 256, 'Java 11', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); }
      note(540, 296, '결제만 바쁜데 jar 통째로 3대', fade(u, 2.1), { 'text-anchor': 'middle', fill: BAD });
      gauges(c); return; }
    if (k === 3) { // 메모리 누수 → JVM 전체 OOM · 빌드 25 + 테스트 45
      jar(1, 'JVM 1개', { col: u > 1.6 ? BAD : INK });
      const heap = E(u, 0.2, 1.6);
      tx(270, 222, 'heap', { 'font-size': 14, 'font-weight': 700, fill: MUT }); el('rect', { x: 320, y: 208, width: 360, height: 20, rx: 4, fill: SOFT, stroke: GRID });
      el('rect', { x: 320, y: 208, width: 360 * heap, height: 20, rx: 4, fill: heap > 0.85 ? BAD : WARN });
      if (heap >= 1) mono(690, 223, 'OOM', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      DOM.forEach((d, i) => { const dead = u > 1.6 + i * 0.12; tile(TX[i], 130, d, { h: 56, stroke: dead ? BAD : i === 1 ? WARN : INK, fill: dead ? BADBG : SOFT, color: dead ? BAD : INK }); if (dead) cross(TX[i] + 36, 108, 7); });
      pill(TX[1], 74, '메모리 누수', WARN, pop(u, 0.2), { fs: 13.5 });
      // 빌드 시간 막대
      const b1 = E(u, 1.8, 2.2), b2 = E(u, 2.2, 2.7);
      el('rect', { x: 250, y: 288, width: 25 * 6.5 * b1, height: 20, fill: WARN, rx: 3 }); el('rect', { x: 250 + 25 * 6.5, y: 288, width: 45 * 6.5 * b2, height: 20, fill: BAD, rx: 3, opacity: 0.8 });
      if (b1 > 0) mono(240, 303, '빌드 25분', { 'font-size': 13.5, 'text-anchor': 'end', fill: WARN, 'font-weight': 700 });
      if (b2 >= 1) mono(250 + 70 * 6.5 + 10, 303, '+ 통합 테스트 45분 = 70분', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 });
      server(110, 150, null, { lamp: u > 1.6 ? BAD : WARN }); gauges(c); return; }
    // k4: 공유 테이블 200개
    tx(300, 50, '한 DB · 테이블 200개', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const fill = E(u, 0.1, 1.2) * 200;
    for (let i = 0; i < 200; i++) { if (i >= fill) break; const x = 300 + (i % 20) * 30, y = 64 + Math.floor(i / 20) * 24;
      el('rect', { x, y, width: 26, height: 18, rx: 3, fill: SOFT, stroke: GRID, 'stroke-width': 1.2 }); }
    const pick = [[3, 17, 45, 88, 121], [17, 60, 99, 140, 181], [45, 88, 133, 162, 199], [5, 60, 121, 170, 188]];
    ['user', 'product', 'order', 'payment'].forEach((d, g) => { const y = 90 + g * 56, col = [ACC, INFO, WARN, GOOD][g], f = E(u, 1.2 + g * 0.25, 1.7 + g * 0.25);
      mono(40, y + 5, d + ' 팀', { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.1 + g * 0.25) });
      pick[g].forEach((ti) => { const x = 300 + (ti % 20) * 30 + 13, yy = 64 + Math.floor(ti / 20) * 24 + 9;
        if (f > 0) el('line', { x1: 150, y1: y, x2: lerp(150, x, f), y2: lerp(y, yy, f), stroke: col, 'stroke-width': 1.6, opacity: 0.75 }); }); });
    note(600, 322, '누가 어느 컬럼을 쓰는지 grep 으로만 안다', fade(u, 2.3), { 'text-anchor': 'middle', fill: BAD }); }

  // ---------- 4. MSA — 서비스마다 DB 하나 ----------
  const SX = [330, 490, 650, 810];
  const SVC = [['user-service', 'identity-team', 'postgres-user'], ['product-service', 'catalog-team', 'postgres + ES'], ['order-service', 'order-team', 'postgres-order'], ['payment-service', 'payment-team', 'postgres-payment']];
  function svc(i, o) { o = o || {}; const x = SX[i], s = o.s ?? 1, [n, team, db] = SVC[i];
    card(x, 70, 148, 58, { rx: 10, stroke: o.stroke || ACC, fill: o.fill || ACCBG, s, sw: 2.5 });
    if (s > 0.5) { mono(x, 66, n, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: o.stroke || ACC }); tx(x, 86, team, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    if (s > 0.5) { el('line', { x1: x, y1: 99, x2: x, y2: 142, stroke: o.stroke || ACC, 'stroke-width': 2 }); dbIcon(x, 172, null, { s: 0.55 * s, stroke: o.stroke || ACC });
      mono(x, 222, db, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      if (i === 1) { dbIcon(x + 48, 182, null, { s: 0.32, stroke: INFO }); } } }
  function remain(nLeft, op) { if (op <= 0.01) return; const h = 50 + Math.max(nLeft, 1) * 40;
    el('rect', { x: 45, y: 50, width: 170, height: h, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op }); mono(56, 42, 'monolith.jar', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op });
    for (let i = 4 - nLeft; i < 4; i++) card(130, 98 + (i - (4 - nLeft)) * 40, 140, 30, { rx: 5, text: DOM[i], fs: 13.5, mono: true, fill: SOFT, op }); }
  function s4(t, c) { const { k, u } = c;
    const done = Math.min(k + 1, 4), left = k <= 3 ? 4 - k - (u > 0.2 ? 1 : 0) : 0;
    remain(left, k === 3 ? 1 - E(u, 1.6, 2.2) : k > 3 ? 0 : 1);
    for (let i = 0; i < done; i++) { const fresh = i === k && k <= 3;
      if (fresh) fly(130, 98, SX[i], 70, seg(u, 0.2, 0.9), DOM[i], { mono: true });
      svc(i, { s: fresh ? pop(u, 0.9) : 1 }); }
    if (k === 0) note(560, 270, '팀 · repo · DB · API · 파이프라인 = 한 세트', fade(u, 1.6), { 'text-anchor': 'middle', fill: ACC });
    if (k === 1) note(560, 270, 'catalog 팀은 검색 엔진(ES)까지 붙인다', fade(u, 1.6), { 'text-anchor': 'middle', fill: INFO });
    if (k === 2) { const f = E(u, 1.2, 1.8); el('line', { x1: SX[3], y1: 100, x2: lerp(SX[3], SX[2] + 30, f), y2: lerp(100, 170, f), stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '5 4' });
      if (f >= 1) cross(SX[2] + 46, 152, 9);
      note(560, 270, '다른 팀은 이 DB 에 직접 못 붙는다 · API 로만', fade(u, 2.0), { 'text-anchor': 'middle', fill: BAD }); }
    if (k === 3) { outline(SX[3] - 84, 32, 168, 206, E(u, 1.0, 1.9), WARN, { dash: '7 5', rx: 14 });
      tx(SX[3], 258, 'PCI-DSS 감사 범위', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.9) });
      note(330, 270, 'jar 가 비었다 · 서비스 4개', fade(u, 2.2), { fill: MUT, 'text-anchor': 'middle' }); }
    if (k === 4) { // 통신 계약: 동기 timeout 1s · retry 2 / 비동기 Kafka
      const y = 288; el('line', { x1: 250, y1: y, x2: 900, y2: y, stroke: INFO, 'stroke-width': 26, 'stroke-linecap': 'round', opacity: 0.16 * fade(u, 1.3) });
      mono(232, y + 5, 'Kafka', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      ['order.placed', 'payment.completed'].forEach((s, i) => { const p = ((t * 0.22 + i * 0.5) % 1); if (u > 1.4) card(lerp(330, 820, p), y, tw(s, 13.5) + 18, 22, { rx: 11, fill: INFO, stroke: 'none', text: s, fs: 13.5, mono: true, color: PANEL }); });
      // order → payment 동기 호출: 시도 3번 × 1초
      tx(330, 252, 'sync', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 0.2) });
      [0, 1, 2].forEach((n) => { const f = E(u, 0.2 + n * 0.35, 0.5 + n * 0.35); el('rect', { x: 345 + n * 62, y: 240, width: 56 * f, height: 16, rx: 3, fill: n ? WARN : INK, opacity: 0.8 }); });
      mono(545, 253, 'timeout 1s × (1 + 재시도 2) = 최대 3초', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) }); }
    if (k === 5) { // payment 만 다시 배포 · product 는 계속 응답
      const f = E(u, 0.2, 2.2); el('rect', { x: SX[3] - 60, y: 246, width: 120, height: 12, rx: 3, fill: SOFT, stroke: GRID });
      el('rect', { x: SX[3] - 60, y: 246, width: 120 * f, height: 12, rx: 3, fill: GOOD });
      mono(SX[3], 280, f >= 1 ? '배포 완료 5분' : '배포 중', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 });
      for (let i = 0; i < 5; i++) dot([[SX[1], 0], [SX[1], 40]], ((t * 0.6 + i / 5) % 1), ACC, 5);
      tx(SX[1], 280, 'product 조회는 계속', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) }); }
    gauges(c); }

  // ---------- 5. Trade-off ----------
  function rowList(x, y, items, u, mark, col) { items.forEach((s, i) => { const yy = y + i * 46, a = 0.2 + i * 0.3;
      card(x + 200, yy, 400, 38, { rx: 8, stroke: col, sw: 1.8, s: pop(u, a) });
      if (mark === 'ok') check(x + 22, yy, 9, pop(u, a + 0.2)); else cross(x + 22, yy, 8, pop(u, a + 0.2));
      tx(x + 42, yy + 5, s, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, a + 0.1) }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { const ok = k === 0;
      const items = ok ? ['팀 30명 넘고 도메인이 갈린다', '부분 배포 · 롤백이 잦다', '도메인별 트래픽 격차 (검색 100배)', '스택을 달리 써야 한다 (Python ML)', '장애 격리가 필수다']
        : ['팀이 10명 이하다', '도메인 경계가 자주 바뀐다', '트랜잭션 일관성이 핵심이다', 'DevOps 팀이 따로 없다', '출시 직후 검증 단계다'];
      tx(80, 40, ok ? 'MSA 가 필요한 신호' : '아직 모놀리스가 나은 신호', { 'font-size': 17, 'font-weight': 800, fill: ok ? GOOD : BAD });
      rowList(80, 74, items, u, ok ? 'ok' : 'no', ok ? GOOD : BAD);
      const n = Math.min(5, Math.floor(E(u, 0.3, 1.8) * 5.99));
      card(800, 150, 150, 110, { rx: 12, stroke: ok ? GOOD : BAD, s: pop(u, 0.3) });
      mono(800, 152, ok ? n + ' / 5' : '1개라도', { 'font-size': ok ? 30 : 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ok ? GOOD : BAD });
      tx(800, 184, ok ? '우리 쇼핑몰' : '강하면 미룬다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      gauges(c); return; }
    if (k === 2) { const st = ['모놀리스', '모듈러 모놀리스', 'Strangler Fig', 'MSA'], xs = [140, 360, 580, 800];
      el('line', { x1: 140, y1: 150, x2: lerp(140, 800, E(u, 0.1, 1.0)), y2: 150, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
      st.forEach((s, i) => { const on = i <= 2; el('circle', { cx: xs[i], cy: 150, r: 14, fill: on ? ACC : PANEL, stroke: on ? ACC : MUT, 'stroke-width': 3, opacity: pop(u, 0.2 + i * 0.25) });
        tx(xs[i], 194, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? INK : MUT, opacity: fade(u, 0.3 + i * 0.25) }); mono(xs[i], 120, String(i + 1), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.25) }); });
      const p = E(u, 1.2, 2.3) * 2; el('circle', { cx: lerp(140, 580, p / 2), cy: 150, r: 8, fill: PANEL, stroke: INK, 'stroke-width': 3 });
      note(480, 250, '경계가 굳은 도메인부터 하나씩 떼어낸다', fade(u, 2.1), { 'text-anchor': 'middle', fill: ACC });
      gauges(c); return; }
    if (k === 3) { // 사례 연표
      const X = (y) => 150 + (y - 2000) / 16 * 680;
      el('line', { x1: 150, y1: 250, x2: 830, y2: 250, stroke: MUT, 'stroke-width': 1.8 });
      [2000, 2004, 2008, 2012, 2016].forEach((y) => { el('line', { x1: X(y), y1: 250, x2: X(y), y2: 256, stroke: MUT }); mono(X(y), 276, String(y), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      tx(40, 110, '전환', { 'font-size': 15, 'font-weight': 700, fill: WARN }); tx(40, 200, '유지', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      [[2002, 'Amazon · SOA 선언'], [2008, 'Netflix · DB 장애 뒤']].forEach(([y, s], i) => { const a = 0.3 + i * 0.5; el('line', { x1: X(y), y1: 250, x2: X(y), y2: lerp(250, 112, E(u, a, a + 0.4)), stroke: WARN, 'stroke-width': 2 });
        el('circle', { cx: X(y), cy: 104, r: 7, fill: WARN, opacity: fade(u, a + 0.4) }); tx(X(y) + 14, 110, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a + 0.4) }); });
      el('rect', { x: 150, y: 188, width: 680 * E(u, 1.3, 2.2), height: 16, rx: 8, fill: GOOD, opacity: 0.35 });
      tx(170, 180, 'Shopify (Rails) · Stack Overflow · 의도적으로 모놀리스 유지', { 'font-size': 14.5, 'font-weight': 600, opacity: fade(u, 1.6) });
      note(480, 316, '규모 자체는 전환 근거가 아니다', fade(u, 2.3), { 'text-anchor': 'middle', fill: MUT }); return; }
    // k4: 운영 대상 = 서비스 8개 × (CI/CD · 모니터링 · DB 백업)
    const rows = ['CI/CD', '모니터링', 'DB 백업'];
    tx(110, 56, '모놀리스', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); tx(560, 56, 'MSA · 서비스 8개', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    rows.forEach((r, j) => { const y = 80 + j * 60; tx(250, y + 30, r, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
      el('rect', { x: 80, y, width: 60, height: 44, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.8, opacity: pop(u, 0.2 + j * 0.1) });
      for (let i = 0; i < 8; i++) { const s = clamp(E(u, 0.5, 2.0) * 24 - (j * 8 + i)); el('rect', { x: 270 + i * 74, y, width: 66, height: 44, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 1.8, opacity: s }); } });
    mono(110, 290, '3개', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
    mono(560, 290, Math.round(clamp(E(u, 0.5, 2.0)) * 24) + '개', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
    pill(480, 330 + 24, '얻는 것: 독립 배포 · 기술 자유 · 장애 격리   잃는 것: 로컬 TX · 단순성 · 디버깅', INK, pop(u, 2.3), { fs: 14 }); }

  const quiz = [
    { q: '모놀리스에서 user·product·order·payment를 패키지로 나누면 배포 단위는 몇 개인가?',
      o: ['4개', '1개', '패키지 수에 1을 더한 5개'], a: 1,
      why: '패키지 분리는 코드 경계일 뿐이다. main() 하나, jar 하나라서 배포 단위는 여전히 1개다.' },
    { q: '모놀리스에서 결제가 실패하면 앞서 차감한 재고는 어떻게 되나?',
      o: ['같은 @Transactional 안이라 DB가 자동으로 되돌린다', '보상 트랜잭션 코드를 직접 짜서 되돌린다', '재고는 차감된 채로 남는다'], a: 0,
      why: '한 DB, 한 프로세스라서 재고 차감·결제·저장이 한 트랜잭션이다. 보상 코드는 분산된 뒤에야 필요해진다.' },
    { q: 'payment 보안 패치 한 줄 때문에 배포가 45분 걸리는 이유는 무엇인가?',
      o: ['payment 코드가 길어서', '배포 단위가 하나라 전체 jar 재빌드와 전 도메인 회귀 테스트를 다시 돌려서', '서버가 한 대뿐이라 복사가 느려서'], a: 1,
      why: '배포 단위가 1개면 한 도메인의 긴급 패치도 전체를 다시 빌드하고 시험해야 한다.' },
    { q: 'order-service의 DB를 다른 팀이 쓰려면 어떻게 해야 하나?',
      o: ['postgres-order에 읽기 계정을 받아 직접 붙는다', '같은 테이블을 자기 DB에 복제해 둔다', 'order-service의 API로만 접근한다'], a: 2,
      why: 'DB를 공유하는 순간 서비스는 이름만 나뉘고 다시 붙는다. 서비스 하나가 DB 하나를 단독으로 소유한다.' },
    { q: '서비스 8개로 나눈 뒤 CI/CD·모니터링·DB 백업만 세어도 운영할 대상은 몇 개인가?',
      o: ['3개', '8개', '24개'], a: 2,
      why: '서비스마다 세 가지가 따로 붙으니 8 × 3 = 24개다. 모놀리스는 3개로 끝난다.' },
  ];

  const summary = [
    '모놀리스는 main 하나, jar 하나라서 배포 단위가 1개다.',
    '같은 JVM 안이라 호출이 0.01ms이고 한 트랜잭션으로 롤백도 자동이다.',
    '팀이 30명이 되면 payment 패치 한 줄에도 배포가 45분 걸린다.',
    'MSA는 팀·repo·DB·파이프라인을 서비스마다 따로 둔다. 운영할 것도 그만큼 는다.',
  ];
  const review = [
    { q: '8명 팀이 출시 직후인 서비스를 처음부터 서비스 8개로 나누려 한다. 먼저 따져 볼 것은?',
      o: ['서비스마다 DB를 무엇으로 고를지', '아직 모놀리스가 나은 신호에 해당하지 않는지', 'Kafka 토픽 이름을 어떻게 지을지'], a: 1,
      why: '10명 이하, 출시 직후 검증 단계는 분리를 미룰 신호다. 이때는 운영 대상 24개보다 jar 하나가 싸다.' },
    { q: 'MSA로 나눴는데 order 팀이 payment DB 테이블을 직접 읽고 있다. 무엇이 깨졌나?',
      o: ['독립 배포. payment 스키마를 바꾸면 order도 같이 고쳐야 한다', '트랜잭션 속도. 원격 조회가 느려진다', '로그 수집. 로그가 두 곳에 남는다'], a: 0,
      why: 'DB를 공유하면 스키마 변경이 두 팀의 일이 된다. 서비스는 나뉘었어도 배포는 다시 한 박자로 묶인다.' },
    { q: '모놀리스의 place() 안 productService.reserve()를 REST 호출로 바꿨다. 새로 생기는 일은?',
      o: ['@Transactional이 그대로 롤백을 맡는다', '배포 단위가 하나로 합쳐진다', '호출이 0.01ms에서 5~50ms가 되고 타임아웃·재시도를 정해야 한다'], a: 2,
      why: '네트워크를 건너면 호출이 실패할 수 있는 일이 된다. 그래서 timeout 1s, retry 2 같은 통신 계약이 필요해진다.' },
  ];

  R.page({ title: '배포 단위 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
