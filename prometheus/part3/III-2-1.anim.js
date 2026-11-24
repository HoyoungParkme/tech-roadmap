/* III-2-1 Alertmanager 라우팅 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 라벨·route·receiver 이름은 페이지 코드(alertmanager.yml)의 값. group_wait 30s·group_interval 5m·repeat_interval 4h 는 Alertmanager 기본값과 같다.
 * amtool 오류 문구는 Alertmanager 설정 검사 메시지 형식("undefined receiver … used in route")을 따른 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, terminal, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const chip = (x, y, s, col, sc, o) => { o = o || {}; const w = tw(s, 13.5) + 18; card(x + w / 2, y, w, 26, { rx: 13, text: s, fs: 13.5, mono: true, stroke: col || INK, color: o.color || INK, fill: o.fill, s: sc, op: o.op }); return w; };
  // 알림 1건 = 라벨 묶음 카드
  function alertObj(x, y, labels, o) { o = o || {}; const w = o.w || 250, h = 30 + labels.length * 32;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || BAD, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    tx(x + 12, y + 20, o.title || 'firing 알림 1건', { 'font-size': 13.5, 'font-weight': 700, fill: o.stroke || BAD, opacity: o.op ?? 1 });
    labels.forEach(([s, col, sc], i) => chip(x + 12, y + 44 + i * 32, s, col, sc ?? 1, { op: o.op })); }
  // route 노드
  function node(cx, cy, title, m, o) { o = o || {}; const w = o.w || 230;
    const g = card(cx, cy, w, 54, { rx: 10, stroke: o.on ? ACC : o.off ? GRID : INK, sw: o.on ? 3 : 2, fill: o.on ? ACCBG : PANEL, s: o.s, op: o.op ?? (o.off ? 0.45 : 1), dash: o.dash });
    tx(0, m ? -4 : 6, title, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.on ? ACC : INK }, g);
    if (m) tx(0, 17, m, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: 'mono' }, g); return g; }
  const recvTag = (x, y, s, col, sc) => { const w = tw(s, 13.5) + 22; card(x, y, w, 26, { rx: 6, text: '→ ' + s, fs: 13.5, mono: true, fill: SOFT, stroke: col || GRID, color: col || INK, s: sc }); };

  // ---------- 1. Prometheus → Alertmanager ----------
  function s1(t, c) { const { k, u } = c;
    server(120, 230, 'Prometheus', { lamp: BAD });
    card(560, 230, 170, 70, { rx: 10, text: 'Alertmanager', fs: 16, fw: 800, stroke: k >= 1 ? ACC : GRID, dash: k === 0 ? '6 5' : null });
    if (k >= 1) mono(560, 290, 'alertmanager:9093', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.3) : 1 });
    if (k === 0) { mono(120, 120, 'alerting:', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) }); mono(120, 144, '  alertmanagers: [ ? ]', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      grow(182, 230, 470, 230, E(u, 0.8, 1.6), MUT, { dash: '6 5' }); note(240, 360, '여기에는 firing 알림을 넘길 상대만 적는다', fade(u, 1.8)); return; }
    grow(182, 230, 470, 230, k === 1 ? E(u, 0.2, 0.8) : 1, ACC);
    tx(326, 216, 'HTTP push', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.6) : 1 });
    if (k === 1) { for (let i = 0; i < 3; i++) dot([[182, 230], [470, 230]], seg(u, 0.9 + i * 0.5, 1.6 + i * 0.5), BAD, 7); note(240, 360, 'firing 이 되면 이 주소로 알림을 밀어 보낸다', fade(u, 1.8)); return; }
    const L = [['alertname="HighErrorRate"', INK], ['severity="critical"', BAD], ['team="payments"', INFO], ['instance="api-7f9c"', MUT]];
    if (k === 2 || k === 3) { const n = k === 2 ? 2 : 4, mv = k === 2 ? E(u, 0.2, 1.2) : 1;
      alertObj(lerp(80, 190, mv), lerp(100, 24, mv), L.slice(0, n).map(([s, col], i) => [s, col, k === 3 && i >= 2 ? pop(u, 0.3 + (i - 2) * 0.4) : 1]), { w: 270 });
      note(650, 360 - 200, k === 2 ? '문장이 아니라 라벨 묶음' : '이 라벨이 곧 배달 기준', fade(u, k === 2 ? 1.4 : 1.4), { 'font-size': 15 });
      if (k === 3) sub(560, 330, 'team · severity 가 route 매처의 비교 대상', fade(u, 1.8), { 'font-size': 14 }); return; }
    // k4: 수신자는 Alertmanager 쪽
    [['Slack', 170], ['PagerDuty', 250], ['Email', 330]].forEach(([s, y], i) => { card(850, y, 150, 44, { rx: 8, text: s, fs: 15, s: pop(u, 0.2 + i * 0.2) }); grow(647, 230, 772, y, E(u, 0.6 + i * 0.2, 1.0 + i * 0.2), MUT); });
    el('path', { d: 'M120,170 C200,60 700,60 780,150', fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.2) });
    cross(450, 82, 14, pop(u, 1.4));
    note(150, 380, 'prometheus.yml 어디에도 채널은 없다. 받는 곳은 alertmanager.yml 이 정한다', fade(u, 1.8), { 'font-size': 14.5 }); }

  // ---------- 2. route 트리 ----------
  const RT = { x: 480, y: 96 }, CH = [{ x: 260, y: 270, t: 'team="payments"', r: 'payments-slack' }, { x: 700, y: 270, t: 'team="infra"', r: 'infra-slack' }];
  function s2(t, c) { const { k, u } = c;
    node(RT.x, RT.y, 'route (root)', '매처 없음', { s: k === 0 ? pop(u, 0.2) : 1, on: k === 0 || k === 5 });
    if (k === 0) { const cols = [BAD, INFO, WARN, ACC, GOOD]; for (let i = 0; i < 5; i++) dot([[160 + i * 160, 380], [160 + i * 160, 300], [RT.x, RT.y + 30]], seg(u, 0.6 + i * 0.25, 1.6 + i * 0.25), cols[i], 7);
      note(260, 400, '모든 알림이 여기로 들어온다. 진입점은 이 하나뿐', fade(u, 1.8)); return; }
    recvTag(RT.x, RT.y + 44, 'default-slack', GOOD, k === 1 ? pop(u, 0.3) : 1);
    if (k === 1) { dot([[RT.x - 200, 200], [RT.x, RT.y + 30], [RT.x, RT.y + 44]], seg(u, 0.8, 1.8), MUT, 7);
      note(260, 300, '어느 자식에도 안 맞으면 여기로 간다', fade(u, 1.5)); sub(480, 330, '알림이 사라지지 않게 받치는 안전망', fade(u, 1.9), { 'font-size': 14 }); return; }
    const OPT = ['group_by: [alertname, cluster]', 'group_wait: 30s', 'group_interval: 5m', 'repeat_interval: 4h'];
    if (k === 2) { OPT.forEach((s, i) => chip(640, 70 + i * 32, s, ACC, pop(u, 0.2 + i * 0.25)));
      note(140, 300, 'root 에 둔 옵션은 자식 route 가 그대로 물려받는다', fade(u, 1.6)); return; }
    // k3~: 자식
    CH.forEach((ch, i) => { grow(RT.x, RT.y + 58, ch.x, ch.y - 30, k === 3 ? E(u, 0.3 + i * 0.4, 0.9 + i * 0.4) : 1, MUT);
      mono(ch.x + (i ? 70 : -70), ch.y - 70, (i + 1) + '번째', { 'font-size': 14, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.0 + i * 0.4) : 1 });
      if (k === 3) { node(ch.x, ch.y, '자식 route', null, { dash: '6 5', off: true, s: pop(u, 0.8 + i * 0.4) }); return; }
      const off = k === 5 && i === 1;
      node(ch.x, ch.y, ch.t, null, { s: k === 4 ? pop(u, 0.2 + i * 0.4) : 1, on: k === 5 && i === 0 && u > 1.0, off });
      recvTag(ch.x, ch.y + 44, ch.r, off ? GRID : INFO, k === 4 ? pop(u, 0.6 + i * 0.4) : 1);
      if (k === 4) chip(ch.x - 100, ch.y + 82, 'group_by 상속', GRID, k === 4 ? pop(u, 1.4 + i * 0.2) : 1, { color: MUT }); });
    if (k === 3) { note(140, 400, 'routes 아래 자식은 적힌 순서대로 평가된다', fade(u, 1.8)); return; }
    if (k === 4) return;
    alertObj(20, 20, [['team="payments"', INFO]], { w: 200, stroke: BAD, op: 1 });
    dot([[220, 60], [RT.x - 115, RT.y], [RT.x, RT.y + 30], [CH[0].x, CH[0].y - 30]], seg(u, 0.2, 1.2), BAD, 8);
    check(CH[0].x + 130, CH[0].y, 12, pop(u, 1.2)); tx(CH[1].x, CH[1].y + 100, '평가하지 않음', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
    banner(480, 395, '처음 맞는 자식 하나에서 확정 (first-match)', pop(u, 2.0)); }

  // ---------- 3. 중첩 매칭 ----------
  const N3 = { root: [480, 96], pay: [300, 206], inf: [680, 206], crit: [300, 316] };
  function s3(t, c) { const { k, u } = c;
    const L = [['severity="critical"', BAD], ['team="payments"', INFO]];
    alertObj(20, 20, L.map(([s, col], i) => [s, (k === 1 && i === 1) || (k === 3 && i === 0) ? ACC : col]), { w: 220 });
    const on = (id) => ({ root: k === 0, pay: k === 1 || k === 2, crit: k === 3 })[id] || (k === 5 && id !== 'inf');
    node(N3.root[0], N3.root[1], 'route (root)', '매처 없음', { on: on('root') });
    grow(N3.root[0], N3.root[1] + 28, N3.pay[0], N3.pay[1] - 28, 1, k === 5 || k >= 1 ? ACC : MUT);
    grow(N3.root[0], N3.root[1] + 28, N3.inf[0], N3.inf[1] - 28, 1, MUT);
    node(N3.pay[0], N3.pay[1], 'team="payments"', null, { on: on('pay') });
    node(N3.inf[0], N3.inf[1], 'team="infra"', null, { off: k >= 4, on: false });
    if (k >= 2) { grow(N3.pay[0], N3.pay[1] + 28, N3.crit[0], N3.crit[1] - 28, k === 2 ? E(u, 0.3, 0.9) : 1, k >= 3 ? ACC : MUT);
      node(N3.crit[0], N3.crit[1], k === 2 ? '자식 routes' : 'severity="critical"', null, { dash: k === 2 ? '6 5' : null, on: on('crit'), s: k === 2 ? pop(u, 0.8) : 1 }); }
    // 지금 receiver
    const rv = k === 0 ? 'default-slack' : k <= 2 ? 'payments-slack' : 'payments-pagerduty';
    tx(560, 340, '지금 receiver', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    card(700, 372, 280, 44, { rx: 8, text: rv, fs: 17, fw: 800, mono: true, stroke: k >= 3 ? BAD : ACC, color: k >= 3 ? BAD : ACC, s: (k === 1 || k === 3) ? pop(u, 0.9) : 1 });
    if (k === 0) dot([[240, 60], [N3.root[0] - 115, N3.root[1]]], seg(u, 0.2, 1.0), BAD, 8);
    if (k === 1) dot([[N3.root[0], N3.root[1] + 28], [N3.pay[0], N3.pay[1] - 28]], seg(u, 0.2, 0.9), BAD, 8);
    if (k === 3) dot([[N3.pay[0], N3.pay[1] + 28], [N3.crit[0], N3.crit[1] - 28]], seg(u, 0.2, 0.9), BAD, 8);
    if (k === 2) sub(N3.crit[0], N3.crit[1] + 50, '같은 팀 안에서 다시 좁힌다', fade(u, 1.2), { 'font-size': 14 });
    if (k === 4) { cross(N3.inf[0] + 130, N3.inf[1], 11, pop(u, 0.4)); tx(N3.inf[0], N3.inf[1] + 52, '이미 확정 · 보지 않는다', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); }
    if (k === 5) { ['root', 'team=payments', 'severity=critical'].forEach((s, i) => chip([470, 530, 663][i], 270, s, ACC, pop(u, 0.3 + i * 0.3)));
      sub(700, 308, '좁고 구체적인 조건을 위에 둔다', fade(u, 1.6), { 'font-size': 14 }); } }

  // ---------- 4. receivers ----------
  const RV = [['default-slack', 'Slack #alerts', 0, GOOD], ['payments-slack', 'Slack #pay-alerts', 1, INFO], ['payments-pagerduty', 'PagerDuty 호출', 2, BAD], ['infra-slack', 'Slack #infra-alerts', 3, INFO]];
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { tx(40, 72, 'route 가 부르는 이름', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(600, 72, 'receivers: 실제 채널', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      RV.forEach(([n, ch, at, col], i) => { if (at > k) return; const y = 110 + i * 78, sc = at === k ? pop(u, 0.2) : 1;
        card(190, y, 290, 50, { rx: 8, text: n, fs: 15, mono: true, s: sc });
        grow(338, y, 520, y, at === k ? E(u, 0.6, 1.1) : 1, col === BAD ? BAD : MUT);
        card(720, y, 380, 50, { rx: 8, text: n + '  →  ' + ch, fs: 14.5, stroke: col, s: at === k ? pop(u, 1.0) : 1 }); });
      if (k === 0) mono(720, 152, 'send_resolved: true', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      if (k === 1) note(40, 400, '이름은 문자열로 정확히 같아야 한다', fade(u, 1.6), { 'font-size': 14.5 });
      if (k === 2) { dot([[40, 266], [338, 266], [520, 266], [880, 266]], seg(u, 1.2, 2.2), BAD, 8); note(40, 400, '앞 장면에서 확정된 알림이 온콜 호출로 이어진다', fade(u, 2.0), { 'font-size': 14.5 }); }
      if (k === 3) note(40, 400, '가지마다 통합을 다르게: slack · pagerduty · email · webhook', fade(u, 1.6), { 'font-size': 14.5 });
      return; }
    // k4: 묶기
    const n = 6, mv = E(u, 0.5, 1.6);
    for (let i = 0; i < n; i++) { const x0 = 120, y0 = 90 + i * 50; const x = lerp(x0, 470, mv), y = lerp(y0, 215, mv);
      if (mv < 1) card(x, y, 200, 36, { rx: 6, text: 'HighErrorRate', fs: 13.5, stroke: BAD, op: 1 - mv }); }
    if (mv >= 1) { card(480, 215, 220, 90, { rx: 10, stroke: BAD, sw: 3, s: pop(u, 1.6) });
      tx(480, 206, 'HighErrorRate', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); tx(480, 232, '알림 여러 건 → 통지 1통', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); }
    grow(592, 215, 740, 215, E(u, 1.9, 2.3), BAD); card(830, 215, 160, 50, { rx: 8, text: 'PagerDuty', fs: 15, stroke: BAD, s: pop(u, 2.2) });
    mono(480, 330, 'group_by: [alertname, cluster]', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
    sub(480, 360, '라벨 값이 같은 알림을 한 봉투에 담는다 (group_wait 30s 동안 모아서)', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 5. 함정 ----------
  const P5 = { root: [480, 96], a: [290, 220], b: [690, 220] };
  function s5(t, c) { const { k, u } = c;
    if (k === 5) { terminal(60, 70, 840, 140, ['$ amtool check-config alertmanager.yml', "Checking 'alertmanager.yml'  FAILED: undefined receiver", '  "oncall-pagerdty" used in route'], lerp(0, 3, E(u, 0.2, 1.6)), { title: 'bash' });
      tx(60, 250, '순서 = 우선순위', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
      [['team="infra"', '넓은 조건', BAD], ['severity="critical"', '구체 조건 · 영영 안 걸림', MUT]].forEach(([s, d, col], i) => { const y = 290 + i * 54;
        card(250, y, 300, 42, { rx: 8, text: s, fs: 15, mono: true, stroke: col, op: i ? 0.5 : 1, s: pop(u, 1.4 + i * 0.3) }); tx(420, y + 5, d, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 1.5 + i * 0.3) }); });
      sub(760, 330, '배포 전에 amtool 로 먼저 검사', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    alertObj(20, 20, [['severity="critical"', BAD], ['team="infra"', INFO]], { w: 210 });
    node(P5.root[0], P5.root[1], 'route (root)', null, { on: k === 0 });
    recvTag(P5.root[0] + 200, P5.root[1], 'default-slack', k === 4 ? WARN : GRID, 1);
    grow(P5.root[0], P5.root[1] + 28, P5.a[0], P5.a[1] - 28, 1, k >= 1 && k < 4 ? ACC : MUT);
    grow(P5.root[0], P5.root[1] + 28, P5.b[0], P5.b[1] - 28, 1, k === 3 ? ACC : MUT);
    mono(P5.a[0] - 150, P5.a[1] - 40, '1번째', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(P5.b[0] + 100, P5.b[1] - 40, '2번째', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    node(P5.a[0], P5.a[1], 'severity="critical"', null, { on: k >= 1 && k <= 3, w: 250 });
    node(P5.b[0], P5.b[1], k === 4 ? 'team="infra"' : 'team="infra"', null, { on: k === 3, off: k === 1, w: 230 });
    recvTag(P5.a[0], P5.a[1] + 44, 'oncall-pagerduty', k >= 1 && k <= 3 ? BAD : GRID, 1); recvTag(P5.b[0], P5.b[1] + 44, 'infra-slack', k === 3 ? INFO : GRID, 1);
    if (k >= 2 && k <= 3) chip(P5.a[0] - 70, P5.a[1] + 82, 'continue: true', ACC, k === 2 ? pop(u, 0.3) : 1, { color: ACC });
    if (k === 0) { dot([[230, 60], [P5.root[0] - 115, P5.root[1]]], seg(u, 0.2, 1.0), BAD, 8); note(60, 380, '같은 트리를 형제 순서와 continue 로 다시 본다', fade(u, 1.4)); return; }
    if (k === 1) { dot([[P5.root[0], P5.root[1] + 28], [P5.a[0], P5.a[1] - 28]], seg(u, 0.2, 0.9), BAD, 8);
      tx(P5.b[0], P5.b[1] + 90, '여기서 멈춘다', { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      note(60, 380, 'severity="critical" 이 위에 있어 온콜 호출이 먼저 잡는다', fade(u, 1.6)); return; }
    if (k === 2) { el('path', { d: `M${P5.a[0] + 126},${P5.a[1]} C${P5.a[0] + 220},${P5.a[1] - 70} ${P5.b[0] - 190},${P5.b[1] - 70} ${P5.b[0] - 117},${P5.b[1] - 6}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', 'marker-end': 'url(#ra-ahb)', opacity: fade(u, 0.8) });
      note(60, 380, '붙이면 다음 형제도 이어서 평가한다', fade(u, 1.4)); return; }
    if (k === 3) { dot([[P5.root[0], P5.root[1] + 28], [P5.a[0], P5.a[1] - 28]], seg(u, 0.1, 0.6), BAD, 8); dot([[P5.root[0], P5.root[1] + 28], [P5.b[0], P5.b[1] - 28]], seg(u, 0.7, 1.2), BAD, 8);
      person(P5.a[0], 360, null, { s: 0.8, op: fade(u, 1.3) }); card(P5.b[0], 360, 160, 40, { rx: 8, text: '#infra-alerts', fs: 14.5, mono: true, stroke: INFO, s: pop(u, 1.5) });
      banner(480, 405, '온콜 호출 + 팀 슬랙, 두 곳에 간다', pop(u, 2.0)); return; }
    // k4: 매처 오타
    const want = 'team="payment"', have = 'team="payments"';
    mono(560, 330, '매처 ', { 'font-size': 15, fill: MUT }); mono(610, 330, want, { 'font-size': 17, 'font-weight': 800, fill: BAD });
    mono(560, 362, '라벨 ', { 'font-size': 15, fill: MUT }); spans(610, 362, [[have.slice(0, 13), {}], ['s', { fill: BAD, 'font-weight': 800 }], ['"', {}]], { 'font-size': 17, 'font-weight': 800 });
    dot([[P5.root[0], P5.root[1] + 28], [P5.root[0] + 120, P5.root[1]]], seg(u, 0.8, 1.6), WARN, 8);
    note(60, 330, '오류 메시지 없이', fade(u, 1.0), { fill: BAD }); note(60, 360, '그냥 안 맞아 default 로 샌다', fade(u, 1.4), { fill: BAD });
    sub(480, 405, '예: payments 팀 알림이 payments 가지 대신 기본 채널로 간다', fade(u, 2.0), { 'font-size': 14 }); }

  const quiz = [
    { q: '알림을 누구에게 보낼지는 어디에서 정해지나?',
      o: ['prometheus.yml의 alerting 블록', 'alertmanager.yml의 route 트리', '알림 규칙의 annotations'], a: 1,
      why: 'Prometheus는 라벨 묶음을 alertmanager:9093으로 밀어 줄 뿐이다. 받는 곳은 Alertmanager의 route가 라벨을 보고 고른다.' },
    { q: 'root route의 receiver가 맡는 역할은 무엇인가?',
      o: ['어느 자식에도 안 맞은 알림을 받는 기본 배달지', '모든 알림을 무조건 한 번 더 받는 감시 채널', 'critical 알림만 받는 채널'], a: 0,
      why: 'root는 매처가 없어 모든 알림이 들어온다. 자식이 하나도 안 맞으면 default-slack으로 가서 알림이 사라지지 않는다.' },
    { q: 'severity="critical", team="payments" 알림의 최종 receiver는 무엇인가?',
      o: ['payments-slack', 'infra-slack', 'payments-pagerduty'], a: 2,
      why: 'root에서 team="payments" 가지로 내려간 뒤 그 안의 severity="critical" 자식에 걸려 payments-pagerduty로 확정된다.' },
    { q: '같은 인시던트에서 알림 여러 건이 와도 통지가 한 통으로 가는 이유는 무엇인가?',
      o: ['receiver가 같은 채널이라서', 'group_by 라벨 값이 같은 알림을 한 그룹으로 묶어서', 'repeat_interval이 4h라서'], a: 1,
      why: 'Alertmanager는 group_by에 적은 라벨(alertname, cluster) 값이 같은 알림을 한 봉투에 모아 보낸다.' },
    { q: 'critical 알림을 온콜 호출과 팀 슬랙 두 곳에 모두 보내려면 무엇이 필요한가?',
      o: ['위쪽 critical route에 continue: true', 'receiver 이름을 두 번 적기', 'group_by를 비우기'], a: 0,
      why: '형제 route는 처음 맞는 하나에서 멈춘다. continue: true를 붙여야 다음 형제(team="infra")까지 평가가 이어진다.' },
  ];

  const summary = [
    'Prometheus는 라벨이 붙은 firing 알림을 Alertmanager로 밀어 줄 뿐 받는 곳은 모른다.',
    '받는 곳은 alertmanager.yml의 route 트리가 라벨 매처로 위에서부터 골라 정한다.',
    '형제 route는 처음 맞는 하나에서 멈추고, 이어서 보내려면 continue: true가 필요하다.',
    '매처 오타는 오류 없이 기본 채널로 새므로 순서를 점검하고 amtool로 검사한다.',
  ];
  const review = [
    { q: 'payments 팀 critical 알림이 PagerDuty가 아니라 #alerts로 왔다. 먼저 의심할 것은?',
      o: ['matchers 값에 오타가 있어 아무 자식에도 안 맞았다', 'group_wait이 너무 짧다', 'Prometheus의 alertmanagers 주소가 틀렸다'], a: 0,
      why: '#alerts는 root의 기본 receiver다. 매처가 안 맞으면 오류 없이 그곳으로 가므로 라벨과 매처 문자열부터 비교한다.' },
    { q: 'critical이면 온콜 호출, team="infra" 면 팀 슬랙으로 보내도록 형제 두 개를 두었다. infra의 critical 알림이 슬랙에 안 온다. 고칠 곳은?',
      o: ['infra route를 위로 올리고 critical route를 지운다', 'critical route에 continue: true를 붙인다', 'receivers에 같은 이름을 하나 더 만든다'], a: 1,
      why: 'first-match라 위의 critical route에서 멈췄다. continue: true가 있으면 다음 형제까지 평가해 두 곳에 모두 간다.' },
    { q: 'route에 receiver: "oncall-pagerdty" 라고 적고 배포했더니 Alertmanager가 새 설정을 못 올렸다. 왜인가?',
      o: ['receivers에 없는 이름이라 설정 검사에서 실패했다', 'PagerDuty 토큰이 만료됐다', 'continue가 빠졌다'], a: 0,
      why: 'route가 가리키는 receiver 이름은 receivers 목록에 정확히 있어야 한다. amtool check-config로 배포 전에 잡을 수 있다.' },
  ];

  R.page({ title: '라우팅 트리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
