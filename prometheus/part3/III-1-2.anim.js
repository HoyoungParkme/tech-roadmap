/* III-1-2 Alerting Rule — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 서비스별 요청 수(checkout-api 분당 920+80, payment-api 997+3)는 페이지의 promtool 테스트 시나리오 값.
 * 에러 비율 8%·0.3%, 1m pending·3m firing, summary "8%" 는 Prometheus rate(외삽)·for·humanizePercentage 규칙을 파이썬으로 재현해 확인했다.
 * 장면 2의 에러율 곡선은 "예시"다(상태 전이는 for 규칙대로 계산). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, op, s) => tx(x, y, s || '예시 값', { 'font-size': 13.5, fill: MUT, opacity: op ?? 1 });
  const ST = { inactive: [OFF, '비활성'], pending: [WARN, 'pending'], firing: [BAD, 'firing'] };

  // ---------- 1. expr ----------
  const SV = [['checkout-api', 80, 1000], ['payment-api', 3, 1000]];   // 분당 5xx, 분당 전체 (테스트 시나리오)
  function ratioRows(k, u) { // k3~k5 공통: 서비스별 분자/분모/비율 막대
    const x0 = 300, W = 560, max = 0.1, X = (v) => x0 + W * v / max;
    SV.forEach(([n, e, all], i) => { const y = 150 + i * 110;
      mono(40, y + 18, n, { 'font-size': 16, 'font-weight': 800 });
      const num = (e / 60).toFixed(2), den = (all / 60).toFixed(2);
      mono(40, y + 44, `5xx ${num}/s`, { 'font-size': 14, fill: BAD, opacity: k === 3 ? fade(u, 0.4 + i * 0.3) : 1 });
      if (k >= 4) mono(170, y + 44, `/ ${den}/s`, { 'font-size': 14, fill: INFO, opacity: k === 4 ? fade(u, 0.4 + i * 0.3) : 1 });
      if (k === 3) { // 분자만: 5xx 막대 (초당)
        el('rect', { x: x0, y: y, width: W, height: 28, rx: 4, fill: SOFT });
        el('rect', { x: x0, y: y, width: Math.max(3, W * (e / 60) / 1.5 * E(u, 0.3 + i * 0.3, 1.2 + i * 0.3)), height: 28, rx: 4, fill: BAD });
        return; }
      const v = e / all, g = k === 4 ? E(u, 0.8 + i * 0.3, 1.6 + i * 0.3) : 1, dropped = k >= 5 && v <= 0.005;
      el('rect', { x: x0, y: y, width: W, height: 28, rx: 4, fill: SOFT, opacity: dropped ? 0.4 : 1 });
      el('rect', { x: x0, y: y, width: Math.max(3, (X(v) - x0) * g), height: 28, rx: 4, fill: dropped ? OFF : v > 0.005 ? BAD : INFO });
      mono(Math.max(X(v), x0 + 3) * 1 + 10, y + 20, (v * 100).toFixed(1) + '%', { 'font-size': 15, 'font-weight': 800, fill: dropped ? MUT : INK, opacity: k === 4 ? fade(u, 1.4 + i * 0.3) : 1 });
      if (dropped) { el('line', { x1: 30, y1: y + 14, x2: lerp(30, 870, E(u, 1.2, 1.9)), y2: y + 14, stroke: MUT, 'stroke-width': 2 }); } });
    [0, 0.05, 0.1].forEach((v) => mono(X(v), 390, (v * 100) + '%', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
    if (k >= 5) { const gx = X(0.005), lu = k === 5 ? E(u, 0.2, 0.9) : 1; el('line', { x1: gx, y1: 130, x2: gx, y2: lerp(130, 370, lu), stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
      mono(gx - 6, 140, '> 0.005', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: lu, 'text-anchor': 'end' }); } }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { el('rect', { x: 200, y: 90, width: 560, height: 260, rx: 12, fill: SOFT, opacity: fade(u, 0.1) });
      mono(224, 122, '- name: api-error-rate', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
      mono(224, 152, '  rules:', { 'font-size': 16, opacity: fade(u, 0.6) });
      [0, 1].forEach((i) => card(480, 210 + i * 70, 460, 50, { rx: 8, dash: '5 5', stroke: GRID, text: i ? '룰 …' : '여기에 alert 가 들어간다', fs: 15, color: MUT, s: pop(u, 0.9 + i * 0.3) }));
      note(200, 390, '같은 그룹의 룰은 한 평가 주기에 차례로 계산된다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 1) { const x0 = 100, W = 760, X = (v) => x0 + W * v / 0.025;
      el('line', { x1: x0, y1: 280, x2: x0 + W, y2: 280, stroke: MUT, 'stroke-width': 2 });
      [0, 0.005, 0.01, 0.015, 0.02, 0.025].forEach((v) => mono(X(v), 304, (v * 100).toFixed(1) + '%', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      tx(x0, 330, '에러율', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      [[0.001, '예산 0.1%', GOOD, '가용성 99.9%'], [0.005, 'warning 0.5%', WARN, '예산의 5배'], [0.02, 'critical 2%', BAD, '예산의 20배']].forEach(([v, s, col, d], i) => {
        const lu = E(u, 0.3 + i * 0.5, 0.8 + i * 0.5), h = 70 + i * 40;
        el('line', { x1: X(v), y1: 280, x2: X(v), y2: 280 - h * lu, stroke: col, 'stroke-width': 3 });
        tx(X(v) + (i === 0 ? -6 : 6), 280 - h - 22, s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: lu, 'text-anchor': i === 0 ? 'end' : 'start' });
        tx(X(v) + (i === 0 ? -6 : 6), 280 - h - 2, d, { 'font-size': 13.5, fill: MUT, opacity: lu, 'text-anchor': i === 0 ? 'end' : 'start' }); });
      note(100, 380, '임계치는 감이 아니라 SLO 의 에러 예산에서 거꾸로 구한다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) { card(300, 170, 380, 56, { rx: 10, text: '- alert: HighErrorRate', fs: 18, fw: 800, mono: true, s: pop(u, 0.2) });
      mono(130, 238, '    expr: |', { 'font-size': 16, opacity: fade(u, 0.6) });
      el('rect', { x: 170, y: 254, width: 400, height: 90, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
      sub(370, 304, 'PromQL 을 여러 줄로', fade(u, 1.0));
      fly(490, 170, 790, 170, seg(u, 1.2, 2.0), 'alertname="HighErrorRate"', { mono: true, stay: true, fill: INFO });
      sub(790, 210, '이 이름이 알림의 alertname 라벨이 된다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k >= 3 && k <= 5) { ratioRows(k, u);
      tx(300, 116, k === 3 ? 'sum by (service) (rate(…{code=~"5.."}[5m]))' : k === 4 ? '5xx rate ÷ 전체 rate' : '0.5% 선을 넘은 시계열만 남는다', { 'font-size': 15, 'font-weight': 700, class: k === 3 ? 'mono' : null, fill: k === 5 ? WARN : INK });
      ex(40, 400, 1, '테스트 시나리오 값 (분당 80건 · 3건)');
      if (k === 5) { pill(760, 60, '결과 1줄 = 알림 후보 1건', BAD, pop(u, 2.0), { fs: 13.5 }); }
      return; }
    // k6: 원칙
    [['sum by (service)', '서비스마다 따로 운다'], ['rate(…[5m])', '5분 평균으로 잡음을 줄인다'], ['분자·분모 같은 모양', '라벨이 맞아야 나눗셈이 된다'], ['데이터가 없으면 결과도 없다', '멈춘 서비스는 이 식으로 못 잡는다']].forEach(([a, b], i) => {
      const x = 250 + (i % 2) * 460, y = 150 + Math.floor(i / 2) * 120, s = pop(u, 0.2 + i * 0.3), bad = i === 3;
      card(x, y, 420, 90, { rx: 12, stroke: bad ? WARN : GOOD, sw: 2, s });
      tx(x - 190, y - 8, a, { 'font-size': 16, 'font-weight': 800, class: i < 2 ? 'mono' : null, opacity: fade(u, 0.3 + i * 0.3) });
      tx(x - 190, y + 22, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
    sub(480, 380, '데이터 없음까지 잡으려면 absent() 같은 식을 따로 둔다', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 2. for 상태기계 ----------
  // 예시 곡선: 2분부터 9분까지 0.5% 위, 그 뒤 아래. 상태는 for 규칙으로 계산 (verify.py 와 같음)
  const RT = [0.2, 0.25, 0.9, 1.1, 1.0, 1.2, 1.1, 1.3, 1.2, 1.0, 0.3, 0.25, 0.2];   // % 단위, 0~12분
  function states(forMin, curve) { let act = null; return curve.map((v, t) => { const on = v > 0.5; if (on && act == null) act = t; if (!on) act = null; return act == null ? 'inactive' : t - act >= forMin ? 'firing' : 'pending'; }); }
  const SP = [0.2, 0.25, 0.9, 1.1, 1.0, 0.3, 0.25, 0.2, 0.2, 0.25, 0.3, 0.2, 0.2];   // 3분짜리 스파이크
  function chart(curve, lu, y0, h) { const ax = R.axes(110, y0, 760, h, { x: [0, 12], y: [0, 1.5], yt: [0, 0.5, 1.5], xt: [0, 2, 4, 6, 8, 10, 12] });
    el('line', { x1: ax.X(0), y1: ax.Y(0.5), x2: ax.X(12), y2: ax.Y(0.5), stroke: WARN, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' });
    R.line(ax, curve.map((v, i) => [i, v]), lu, INFO, { sw: 3 }); return ax; }
  function lane(ax, st, y, upto, label) { tx(100, y + 20, label || '상태', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: MUT });
    st.forEach((s, i) => { if (i >= upto || i === 12) return; const [col] = ST[s]; el('rect', { x: ax.X(i) + 1, y, width: ax.X(1) - ax.X(0) - 2, height: 28, rx: 3, fill: s === 'inactive' ? SOFT : col, opacity: s === 'inactive' ? 1 : 0.85 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 3) { const ax = chart(RT, k === 0 ? E(u, 0.2, 1.4) : 1, 90, 170);
      tx(110, 78, '에러율 (%)', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); mono(ax.X(12), ax.Y(0.5) - 8, '0.5%', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end' }); ex(760, 78, 1);
      const st = k === 0 ? states(0, RT) : states(5, RT), up = k === 0 ? Math.round(E(u, 0.8, 2.0) * 12) : k === 1 ? 2 : k === 2 ? 2 + Math.round(E(u, 0.3, 1.8) * 4) : 12;
      lane(ax, st, 300, up);
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((m) => el('circle', { cx: ax.X(m), cy: 344, r: 3, fill: MUT }));
      tx(100, 350, '평가', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      if (k === 0) { pill(ax.X(2) + 60, 400, 'for 없음 → 첫 평가에서 바로 firing', BAD, pop(u, 2.0), { fs: 14 }); return; }
      if (k === 1) { el('rect', { x: ax.X(2), y: 300, width: (ax.X(7) - ax.X(2)) * E(u, 0.3, 1.3), height: 28, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
        mono(ax.X(4.5), 392, 'for: 5m = 5분 동안 계속 참이어야', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); return; }
      if (k === 2) { const m = E(u, 0.3, 1.8) * 4; clock(ax.X(2) - 4, 392, 16, m / 5, WARN); mono(ax.X(2) + 20, 398, `pending ${m.toFixed(0)}분 경과 / 5분`, { 'font-size': 15, 'font-weight': 800, fill: WARN });
        mono(ax.X(8), 398, '아직 아무도 모른다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); return; }
      clock(ax.X(7), 392, 16, 1, BAD); fly(ax.X(7) + 20, 392, 700, 392, seg(u, 0.6, 1.5), 'Alertmanager 로', { fill: BAD, stay: true });
      mono(ax.X(7) + 24, 242, '7분: firing', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) }); return; }
    if (k === 4) { const ax = chart(SP, 1, 90, 140); tx(110, 78, '짧은 스파이크 (3분)', { 'font-size': 14.5, 'font-weight': 700 }); ex(760, 78, 1);
      lane(ax, states(5, SP), 260, Math.round(E(u, 0.2, 1.4) * 12), 'spike');
      lane(ax, states(5, RT), 330, Math.round(E(u, 0.9, 2.2) * 12), '지속');
      mono(ax.X(5) + 6, 125, 'pending → 비활성: 아무도 안 깨운다', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) });
      mono(ax.X(10) + 4, 392, '거짓 → 해제', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { const L = [['critical (호출)', 5, BAD], ['warning (슬랙)', 10, WARN], ['DB down 같은 즉시 장애', 2, BAD], ['SLO 빠른 소진', 2, ACC]];
      tx(80, 100, 'for 값 고르기 (분)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      L.forEach(([n, m, col], i) => { const y = 130 + i * 62; tx(80, y + 18, n, { 'font-size': 15, 'font-weight': 700 }); R.hbar(360, y, 440, m, 10, { col, text: m + 'm', h: 24, u: E(u, 0.2 + i * 0.25, 0.9 + i * 0.25) }); });
      note(80, 400, '길수록 오탐은 줄고, 알아채는 시간은 그만큼 늦다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    terminal(120, 110, 720, 150, ['$ promtool test rules tests/error-rate.test.yml', 'Unit Testing:  tests/error-rate.test.yml', '  SUCCESS'], lerp(0, 3, E(u, 0.2, 1.8)), { title: 'bash' });
    note(120, 320, '언제 pending 이고 언제 firing 인지 테스트로 못 박는다', fade(u, 2.0)); }

  // ---------- 3. labels / annotations ----------
  function alertCard(k, u, o) { o = o || {}; const x = 30, y = 90, w = 390;
    el('rect', { x, y, width: w, height: 300, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 });
    mono(x + 16, y + 28, o.name || 'alert: HighErrorRate', { 'font-size': 15.5, 'font-weight': 800, fill: o.stroke || INK });
    mono(x + 16, y + 54, o.expr || 'expr: …에러율 > 0.005', { 'font-size': 14, fill: MUT }); mono(x + 16, y + 76, o.for || 'for: 5m', { 'font-size': 14, fill: MUT });
    tx(x + 16, y + 110, 'labels — 라우팅', { 'font-size': 14, 'font-weight': 700, fill: INFO });
    const L = o.labels || [['severity', 'warning'], ['team', 'ops'], ['service', 'checkout-api'], ['slo', 'availability-99.9']];
    L.forEach(([a, b], i) => { const s = k === 1 ? pop(u, 0.3 + i * 0.3) : k >= 1 ? 1 : 0; if (s <= 0) return;
      card(x + 16 + (tw(a + '=' + b, 13.5) + 20) / 2, y + 136 + i * 34, tw(a + '=' + b, 13.5) + 20, 28, { rx: 14, text: a + '=' + b, fs: 13.5, mono: true, stroke: a === 'severity' ? (b === 'critical' ? BAD : WARN) : INFO, s }); });
    if (k === 0) { card(x + w / 2, y + 190, w - 60, 90, { rx: 10, dash: '6 5', stroke: GRID, text: '라벨 없음', fs: 16, color: MUT }); } }
  function slack(k, u, o) { o = o || {}; const x = 460, y = 90, w = 470;
    el('rect', { x, y, width: w, height: 300, rx: 10, fill: SOFT });
    tx(x + 16, y + 26, 'annotations — 사람이 읽는 메시지', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    if (k >= 2) mono(x + 16, y + 62, o.sum || '에러율 8% (5m)', { 'font-size': 20, 'font-weight': 800, opacity: k === 2 ? fade(u, 0.4) : 1 });
    if (k === 2) sub(x + w / 2, y + 96, 'humanizePercentage(0.08) → 8%', fade(u, 1.2), { 'font-size': 14 });
    if (k >= 3) { mono(x + 16, y + 112, 'service=checkout-api', { 'font-size': 14.5, opacity: k === 3 ? fade(u, 0.3) : 1 }); mono(x + 16, y + 138, 'threshold=0.5%, 현재=8%', { 'font-size': 14.5, opacity: k === 3 ? fade(u, 0.8) : 1 }); }
    if (k >= 4) [['runbook', 120], ['dashboard', 300]].forEach(([s, dx], i) => card(x + dx, y + 210, 150, 40, { rx: 8, text: s + ' ↗', fs: 15, stroke: ACC, color: ACC, s: k === 4 ? pop(u, 0.3 + i * 0.4) : 1 })); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 4) { alertCard(k, u); slack(k, u);
      if (k === 0) { note(470, 200, 'Alertmanager 는 어디로 보낼지 알 길이 없다', fade(u, 0.6), { fill: WARN, 'font-size': 14.5 }); pill(690, 260, '→ 기본 수신자로 샌다', WARN, pop(u, 1.4), { fs: 14 }); }
      if (k === 1) note(470, 380, '라벨 값은 문자열로 정확히 비교된다', fade(u, 1.8), { 'font-size': 14 });
      if (k === 4) note(470, 360, '새벽에 받은 사람이 검색하지 않게', fade(u, 1.4), { 'font-size': 14 });
      return; }
    if (k === 5) { const rows = [['', 'HighErrorRate', 'CriticalErrorRate'], ['임계치', '> 0.5%', '> 2%'], ['for', '5m', '2m'], ['severity', 'warning', 'critical']];
      rows.forEach((r, i) => { const y = 120 + i * 60; r.forEach((s, j) => { const x = [120, 420, 720][j];
        const col = i === 0 ? (j === 2 ? BAD : j === 1 ? WARN : INK) : j === 2 ? BAD : INK;
        tx(x, y, s, { 'font-size': i === 0 ? 17 : 16, 'font-weight': i === 0 || j === 0 ? 800 : 600, class: j > 0 ? 'mono' : null, fill: col, 'text-anchor': j ? 'middle' : 'start', opacity: j === 2 ? fade(u, 0.4 + i * 0.3) : 1 }); });
        if (i) el('line', { x1: 100, y1: y - 38, x2: 860, y2: y - 38, stroke: GRID }); });
      note(120, 390, '같은 expr 를 두 단으로: warning 은 관찰, critical 은 호출', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 6) { [['severity=warning', WARN, 160, 'Slack #ops'], ['severity=critical', BAD, 300, 'PagerDuty 호출']].forEach(([s, col, y, r], i) => {
        card(200, y, 250, 44, { rx: 22, text: s, fs: 15, mono: true, stroke: col, color: col, s: pop(u, 0.2 + i * 0.3) });
        grow(330, y, 600, y, E(u, 0.7 + i * 0.4, 1.3 + i * 0.4), col === BAD ? BAD : MUT);
        card(720, y, 220, 50, { rx: 10, text: r, fs: 16, stroke: col, s: pop(u, 1.2 + i * 0.4) }); });
      server(480, 230, null, { s: 0.6, op: fade(u, 0.5) }); sub(480, 270, 'Alertmanager route', fade(u, 0.5));
      note(200, 390, 'critical 을 남발하면 호출기가 울려도 아무도 안 일어난다', fade(u, 2.0), { fill: BAD, 'font-size': 14.5 }); return; }
    // k7: 린터
    [['severity ∈ {critical, warning, info}', true], ['team · service · runbook_url 필수', true], ['summary 는 한 줄, 값과 단위 포함', true], ['severity: "high"', false]].forEach(([s, ok], i) => {
      const y = 130 + i * 62, sc = pop(u, 0.2 + i * 0.35); card(480, y, 560, 48, { rx: 10, stroke: ok ? GOOD : BAD, s: sc });
      (ok ? check : cross)(232, y, 11, sc); tx(262, y + 6, s, { 'font-size': 15.5, 'font-weight': 700, class: ok ? null : 'mono', opacity: fade(u, 0.3 + i * 0.35) }); });
    note(240, 400, 'CI 린터가 합의되지 않은 값을 막는다', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 4. promtool test ----------
  function testChart(u, lu) { const ax = R.axes(110, 110, 560, 170, { x: [0, 10], y: [0, 10200], yt: [0, 5000, 10000], xt: [0, 1, 3, 5, 10], xl: '분' });
    R.line(ax, Array.from({ length: 11 }, (_, i) => [i, 920 + 920 * i]), lu, INFO, { sw: 3 });
    R.line(ax, Array.from({ length: 11 }, (_, i) => [i, 80 + 80 * i]), lu, BAD, { sw: 3 });
    mono(ax.X(10) - 6, ax.Y(10120) + 24, 'code=200', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: lu, 'text-anchor': 'end' });
    mono(ax.X(10) - 6, ax.Y(880) - 10, 'code=500', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: lu, 'text-anchor': 'end' }); return ax; }
  const TST = ['inactive', 'pending', 'pending', 'firing', 'firing', 'firing', 'firing', 'firing', 'firing', 'firing', 'firing'];   // CriticalErrorRate, for 2m (계산값)
  function tlane(ax, upto) { tx(100, 318, '상태', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 });
    TST.forEach((s, i) => { if (i >= upto || i === 10) return; el('rect', { x: ax.X(i) + 1, y: 300, width: ax.X(1) - ax.X(0) - 2, height: 26, rx: 3, fill: s === 'inactive' ? SOFT : ST[s][0], opacity: 0.85 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const N = [['가짜 시계열', 'input_series'], ['룰 평가', '../alert-rules.yml · 1m'], ['기대값과 비교', 'exp_alerts']];
      N.forEach(([a, b], i) => { const x = 170 + i * 310; card(x, 200, 240, 90, { rx: 12, s: pop(u, 0.2 + i * 0.4) }); tx(x, 192, a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
        mono(x, 220, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) }); if (i < 2) grow(x + 124, 200, x + 186, 200, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), ACC); });
      note(130, 330, 'evaluation_interval 이 운영과 다르면 for 계산도 달라진다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    const ax = k < 6 ? testChart(u, k === 1 ? E(u, 0.2, 1.6) : 1) : null;
    if (k === 1) { mono(700, 150, "'920+920x10'", { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) }); mono(700, 176, '매분 +920', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) });
      mono(700, 226, "'80+80x10'", { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); mono(700, 252, '매분 +80', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
      mono(700, 310, '80 ÷ 1000 = 8%', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.9) }); return; }
    if (k <= 3) { tlane(ax, k === 2 ? 2 : 4); const at = k === 2 ? 1 : 3, col = k === 2 ? WARN : BAD;
      el('line', { x1: ax.X(at), y1: 100, x2: ax.X(at), y2: 340, stroke: col, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
      mono(ax.X(at), 96, 'eval_time ' + at + 'm', { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      const lines = k === 2 ? ['결과: pending', '(for 2m 미충족)', 'exp_alerts: []'] : ['결과: firing', '(1m 부터 2분 지남)', 'exp_alerts: 1건'];
      lines.forEach((s, i) => mono(720, 180 + i * 30, s, { 'font-size': 15, 'font-weight': i ? 600 : 800, fill: i === 2 ? INK : col, opacity: fade(u, 0.7 + i * 0.3) }));
      check(740, 300, 14, pop(u, 1.9)); tx(764, 306, '기대와 같음', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
      if (k === 2) sub(400, 380, '"울리면 안 된다"를 확인하는 단언이 더 중요하다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4 || k === 5) { tlane(ax, 10);
      const rows = k === 4 ? [['severity', 'critical'], ['team', 'ops'], ['service', 'checkout-api']] : [['summary', 'critical: 8%'], ['runbook_url', '…#HighErrorRate']];
      tx(700, 120, k === 4 ? 'exp_labels' : 'exp_annotations', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      rows.forEach(([a, b], i) => { const y = 160 + i * 46, s = pop(u, 0.3 + i * 0.35); mono(700, y, a + ':', { 'font-size': 14, fill: MUT, opacity: s }); mono(700, y + 20, b, { 'font-size': 15, 'font-weight': 700, opacity: s }); check(918, y + 8, 9, pop(u, 0.8 + i * 0.35)); });
      if (k === 5) sub(780, 290, '$value 템플릿 렌더 결과까지 비교', fade(u, 1.6), { 'font-size': 13.5 });
      sub(400, 380, k === 4 ? '라벨 오타는 여기서 걸린다. 라우팅이 이 값에 달려 있다' : '템플릿이 깨지면 빈 메시지가 나가기 전에 잡는다', fade(u, 1.8), { 'font-size': 14 }); return; }
    // k6, k7: payment-api 0.3%
    const ax2 = R.axes(110, 120, 560, 200, { x: [0, 10], y: [0, 1], yt: [0, 0.3, 0.5, 1], xt: [0, 5, 10], xl: '분', yl: 'payment-api 에러율 (%)' });
    el('line', { x1: ax2.X(0), y1: ax2.Y(0.5), x2: ax2.X(10), y2: ax2.Y(0.5), stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
    mono(ax2.X(10), ax2.Y(0.5) - 8, '임계치 0.5%', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end' });
    R.line(ax2, Array.from({ length: 10 }, (_, i) => [i + 1, 0.3]), k === 6 ? E(u, 0.3, 1.6) : 1, INFO, { sw: 3 });
    mono(720, 170, "500: '3+3x10'", { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: k === 6 ? fade(u, 0.4) : 1 }); mono(720, 196, "200: '997+997x10'", { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: k === 6 ? fade(u, 0.6) : 1 });
    mono(720, 236, '3 ÷ 1000 = 0.3%', { 'font-size': 17, 'font-weight': 800, opacity: k === 6 ? fade(u, 1.4) : 1 });
    if (k === 6) return;
    el('line', { x1: ax2.X(10), y1: 112, x2: ax2.X(10), y2: 330, stroke: GOOD, 'stroke-width': 2.5 }); mono(ax2.X(10), 108, 'eval_time 10m', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
    mono(720, 290, 'exp_alerts: []', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.4) }); check(890, 284, 11, pop(u, 0.8));
    pill(480, 392, 'promtool test rules tests/*.yml 이 CI 게이트', GOOD, pop(u, 1.6), { fs: 14 }); }

  // ---------- 5. runbook · 카탈로그 · DeadManSwitch ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { el('rect', { x: 30, y: 90, width: 400, height: 310, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(48, 122, '# HighErrorRate', { 'font-size': 17, 'font-weight': 800 });
      [['언제 발화', '5분 평균 에러율 > 0.5%', 0], ['왜 위험', 'SLO 99.9% 예산 소진 시작', 0], ['진단', '대시보드 → 로그 → 추적', 1], ['대응', '롤백 · 의존성 · 짧은 silence', 2]].forEach(([a, b, at], i) => {
        if (at > k) return; const op = at === k ? fade(u, 0.3 + i * 0.3) : 1, y = 168 + i * 56;
        tx(48, y, a, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: op }); tx(48, y + 22, b, { 'font-size': 15, opacity: op }); });
      if (k === 0) { card(690, 200, 380, 120, { rx: 12, stroke: GRID, s: pop(u, 0.6) }); tx(690, 190, '새벽 3시, 알림을 받은 사람', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
        tx(690, 220, '이 두 줄로 깰지 말지를 정한다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); return; }
      if (k === 1) { [['Grafana error-rate', 380], ['로그 · 최근 5분 ERROR', 290], ['Tempo · error=true', 200]].forEach(([s, w], i) => {
          const y = 140 + i * 80; card(690, y, w, 54, { rx: 10, text: s, fs: 15, stroke: [INFO, WARN, ACC][i], s: pop(u, 0.3 + i * 0.45) }); if (i < 2) grow(690, y + 28, 690, y + 52, E(u, 0.7 + i * 0.45, 1.0 + i * 0.45), MUT); });
        sub(690, 388, '넓게 보고 점점 좁힌다. 쿼리까지 적어 둔다', fade(u, 1.9), { 'font-size': 14 }); return; }
      [['최근 배포 → 롤백 검토', ACC], ['결제 게이트웨이 상태 확인', INFO]].forEach(([s, col], i) => card(690, 140 + i * 70, 400, 50, { rx: 10, text: s, fs: 15, stroke: col, s: pop(u, 0.2 + i * 0.4) }));
      clock(560, 320, 26, E(u, 1.2, 2.2), WARN); mono(600, 314, 'silence ≤ 1시간', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) }); mono(600, 338, '+ 티켓 필수', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      sub(690, 392, '기한 없는 silence 가 다음 장애를 삼킨다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 3) { const rows = [['alertname', 'severity', 'team', 'runbook'], ['HighErrorRate', 'warning', 'ops', '#HER'], ['CriticalErrorRate', 'critical', 'ops', '#HER'], ['HighLatency', 'critical', 'ops', '#HL']];
      tx(120, 110, 'alerts.md', { 'font-size': 15, 'font-weight': 800, fill: MUT, class: 'mono' });
      rows.forEach((r, i) => { const y = 160 + i * 54, op = i ? fade(u, 0.2 + i * 0.35) : 1;
        if (i) el('rect', { x: 110, y: y - 30, width: 740, height: 44, rx: 6, fill: i % 2 ? SOFT : PANEL, opacity: op });
        r.forEach((s, j) => tx([126, 400, 580, 720][j], y, s, { 'font-size': 15.5, 'font-weight': i ? (j ? 600 : 800) : 800, class: i && j !== 2 ? 'mono' : null, fill: i === 0 ? MUT : s === 'critical' ? BAD : s === 'warning' ? WARN : INK, opacity: op })); });
      note(120, 395, '"이 알림 누가 받나"를 표 한 장으로 답한다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k4·k5: DeadManSwitch
    const dead = k === 5 && u > 0.6;
    server(130, 210, 'Prometheus', { lamp: dead ? BAD : GOOD }); if (dead) cross(130, 210, 30, pop(u, 0.6));
    card(470, 210, 170, 60, { rx: 10, text: 'Alertmanager', fs: 15 }); card(800, 210, 190, 60, { rx: 10, text: '외부 모니터', fs: 15, stroke: k === 5 && u > 2.0 ? BAD : INK });
    el('line', { x1: 190, y1: 210, x2: 383, y2: 210, stroke: GRID, 'stroke-width': 2 }); el('line', { x1: 557, y1: 210, x2: 703, y2: 210, stroke: GRID, 'stroke-width': 2 });
    const stopAt = k === 5 ? 0.6 : 99;
    for (let i = 0; i < 6; i++) { const s0 = i * 0.45; if (s0 > stopAt) break; dot([[190, 210], [383, 210]], seg(u, s0, s0 + 0.6), GOOD, 6); dot([[557, 210], [703, 210]], seg(u, s0 + 0.6, s0 + 1.1), GOOD, 6); }
    mono(130, 120, 'expr: vector(1)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
    if (k === 4) { pill(470, 140, 'DeadManSwitch · 늘 firing', GOOD, pop(u, 0.5), { fs: 14 });
      note(130, 330, 'severity: info 라 사람에게는 안 가고 외부 모니터만 받는다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    const f = E(u, 0.8, 2.2); clock(800, 320, 26, f, BAD); mono(840, 326, Math.round(f * 5) + '분 / 5분', { 'font-size': 16, 'font-weight': 800, fill: BAD });
    banner(480, 395, '신호가 끊기면 Prometheus 자체가 죽은 것', pop(u, 2.2)); }

  const quiz = [
    { q: 'expr 끝에 > 0.005를 붙였을 때 결과에서 일어나는 일은 무엇인가?',
      o: ['모든 서비스의 비율이 0 또는 1로 바뀐다', '0.5%를 넘은 서비스의 시계열만 남고 나머지는 빠진다', '0.5%를 넘으면 바로 Alertmanager로 전송된다'], a: 1,
      why: '비교 연산은 조건을 넘은 시계열만 돌려준다. 테스트 값에서 8%인 checkout-api만 남고 0.3%인 payment-api는 빠진다.' },
    { q: 'for: 5m이 붙은 알림에서 에러율이 3분만 높았다가 내려가면 어떻게 되나?',
      o: ['pending 이었다가 firing 없이 비활성으로 돌아간다', '3분 뒤 firing이 된다', '5분이 지날 때까지 firing을 유지한다'], a: 0,
      why: 'for는 조건이 계속 참인 시간을 잰다. 5분을 못 채우고 거짓이 되면 타이머가 0으로 돌아가고 아무에게도 가지 않는다.' },
    { q: 'labels와 annotations의 역할 차이는 무엇인가?',
      o: ['labels는 사람이 읽는 메시지, annotations는 라우팅 키다', 'labels는 Alertmanager가 라우팅에 쓰고, annotations는 사람이 읽는 본문이다', '둘 다 라우팅에만 쓰인다'], a: 1,
      why: 'severity·team 같은 labels로 Alertmanager가 받는 곳을 고르고, summary·runbook_url 같은 annotations는 메시지 본문이 된다.' },
    { q: '8% 에러율 테스트에서 eval_time 1m에 CriticalErrorRate의 exp_alerts가 빈 목록인 이유는 무엇인가?',
      o: ['1m에는 에러율이 아직 2% 아래라서', 'for: 2m을 채우지 못해 pending이라서', 'promtool이 1m 시점은 평가하지 않아서'], a: 1,
      why: '1m에 이미 8%로 조건은 참이지만 pending이다. 2분을 채운 3m 에서야 firing이 되어 exp_alerts에 나타난다.' },
    { q: 'DeadManSwitch(expr: vector(1))를 두는 목적은 무엇인가?',
      o: ['늘 firing인 신호가 끊기는 것으로 Prometheus 자체의 죽음을 알아챈다', '에러율이 1을 넘는지 감시한다', '모든 알림을 1번씩만 보내게 한다'], a: 0,
      why: 'Prometheus가 죽으면 다른 알림도 울리지 않는다. 그래서 늘 오는 신호를 외부 모니터가 받다가 5분 이상 끊기면 알린다.' },
  ];

  const summary = [
    '알림 조건은 PromQL로 쓰고, 임계치는 SLO 예산에서 구한다. 99.9%면 warning 0.5%, critical 2%다.',
    '비교식은 임계치를 넘은 시계열만 남기고, 결과가 한 줄이라도 있으면 알림이 활성이 된다.',
    'for: 5m은 5분 동안 계속 참일 때만 firing으로 올리고, 그 전에 꺼지면 아무도 깨우지 않는다.',
    'labels는 라우팅에, annotations는 사람에게 쓰이고, promtool test로 1m pending과 3m firing을 확인한다.',
  ];
  const review = [
    { q: '배포 뒤 서비스가 완전히 멈췄는데 HighErrorRate가 울리지 않았다. 먼저 의심할 것은?',
      o: ['for가 너무 짧다', '요청이 0이라 5xx 비율식의 결과가 비어 있었다', 'severity가 critical이 아니었다'], a: 1,
      why: '데이터가 없으면 비율식은 결과가 없고 알림도 없다. 멈춘 서비스는 absent()나 up 같은 다른 식으로 잡는다.' },
    { q: '룰을 고친 뒤 critical 알림이 PagerDuty 대신 기본 슬랙으로 갔다. 먼저 볼 것은?',
      o: ['for 값', 'expr의 [5m] 창', 'labels의 severity 값에 오타가 없는지'], a: 2,
      why: 'Alertmanager는 labels 문자열을 정확히 비교해 받을 곳을 고른다. promtool 테스트의 exp_labels가 이런 오타를 머지 전에 잡는다.' },
    { q: '하루에도 몇 번씩 1~2분짜리 스파이크로 호출기가 울린다. 알맞은 조치는?',
      o: ['for를 늘려 짧은 스파이크가 pending에서 끝나게 한다', '임계치를 0으로 낮춘다', 'annotations에 runbook을 추가한다'], a: 0,
      why: 'for는 조건이 이어진 시간을 요구하므로 짧은 스파이크는 firing까지 가지 못한다. 대신 알아채는 시간은 그만큼 늦어진다.' },
  ];

  R.page({ title: '알림 규칙의 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
