/* III-1-2 Notification Channel — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 수신자·정책·템플릿·무음 시간은 페이지 코드(contact-points / notification-policies / templates / mute-timings / full-pipeline)의 값을 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function tagL(x, y, s, col, o) { o = o || {}; const fs = o.fs || 14, w = tw(s, fs) + 24; card(x + w / 2, y, w, fs + 14, { rx: (fs + 14) / 2, stroke: col || INK, sw: 1.8, text: s, fs, fw: 700, color: o.color || col || INK, fill: o.fill, s: o.s, op: o.op, mono: o.mono }); return w; }
  function bell(cx, cy, s, col, muted) { const g = R.G(cx, cy, s ?? 1); col = col || INK;
    el('path', { d: 'M-13,7 Q-13,-15 0,-15 Q13,-15 13,7 L17,12 H-17 Z', fill: PANEL, stroke: col, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: 0, cy: 16, r: 3.6, fill: col }, g);
    if (muted) el('line', { x1: -20, y1: -18, x2: 20, y2: 20, stroke: BAD, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g); return g; }
  function env(cx, cy, s, col, o) { o = o || {}; const g = R.G(cx, cy, s ?? 1, o.op); col = col || ACC;
    el('rect', { x: -19, y: -13, width: 38, height: 26, rx: 3, fill: PANEL, stroke: col, 'stroke-width': 2.4 }, g);
    el('path', { d: 'M-19,-13 L0,3 L19,-13', fill: 'none', stroke: col, 'stroke-width': 2.2 }, g); return g; }
  // 메시지 카드 (왼쪽 색 띠)
  function msg(x, y, w, h, col, s) { const g = R.G(x + w / 2, y + h / 2, s ?? 1); el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }, g);
    el('rect', { x: -w / 2, y: -h / 2, width: 6, height: h, rx: 3, fill: col || BAD }, g); return g; }

  // ---------- 1. Contact Point ----------
  const CP = [{ n: 'slack-ops', t: 'slack', col: ACC, at: 1 }, { n: 'email-oncall', t: 'email', col: INFO, at: 5 }, { n: 'pagerduty-critical', t: 'pagerduty', col: BAD, at: 7 }, { n: 'webhook-internal', t: 'webhook', col: WARN, at: 8 }];
  function s1(t, c) { const { k, u } = c;
    tx(30, 36, 'contactPoints:', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: k === 0 ? fade(u, 0.1) : 1 });
    CP.forEach((p, i) => { const y = 84 + i * 86, on = k >= p.at, cur = [p.at, p.at + 1, p.at + 2, p.at + 3].includes(k) && (i === 0 ? k <= 4 : i === 1 ? k <= 6 : i === 2 ? k === 7 : k === 8);
      card(160, y, 260, 66, { rx: 10, stroke: on ? p.col : GRID, sw: cur ? 3 : 2, dash: on ? null : '6 6', fill: on ? PANEL : 'none', s: k === 0 ? pop(u, 0.3 + i * 0.2) : k === p.at ? pop(u, 0.2) : 1 });
      if (on) { mono(46, y - 4, p.n, { 'font-size': 15, 'font-weight': 800 }); mono(46, y + 20, 'type: ' + p.t, { 'font-size': 13.5, fill: p.col, 'font-weight': 700 }); } });
    const DX = 340;
    if (k === 0) { sub(640, 200, '받는 곳마다 수신자를 하나씩 만든다', fade(u, 1.2), { 'font-size': 16 }); sub(640, 232, '수신자 하나 = name + receivers[type]', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { card(640, 150, 320, 110, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.5) });
      mono(500, 130, 'name: slack-ops', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.8) }); mono(500, 160, 'receivers:', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      mono(520, 186, '- type: slack', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) });
      sub(640, 260, '이름은 정책이 이 수신자를 부를 때 쓴다', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 2) { card(440, 170, 140, 60, { rx: 10, text: 'Grafana', fs: 16, fw: 800, stroke: INK, s: pop(u, 0.2) });
      card(840, 170, 150, 60, { rx: 10, text: '#ops', fs: 18, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.4) });
      grow(510, 170, 765, 170, E(u, 0.6, 1.4), ACC); dot([[510, 170], [765, 170]], seg(u, 1.4, 2.4), ACC, 7);
      mono(640, 150, 'url: $SLACK_WEBHOOK_OPS', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(640, 226, 'Slack App의 Incoming Webhook', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      mono(840, 230, 'recipient · username', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 3) { msg(460, 90, 420, 170, ACC, pop(u, 0.2));
      [['title', 'slack.default.title', 130], ['text', 'slack.default.text', 200]].forEach(([f, n, y], i) => { mono(484, y, f + ':', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) });
        const x = lerp(700, 560, E(u, 0.7 + i * 0.4, 1.5 + i * 0.4)); tagL(x, y - 5, n, INFO, { mono: true, fs: 13.5, op: fade(u, 0.6 + i * 0.4) }); });
      sub(670, 300, '메시지 모양은 수신자가 아니라 템플릿이 정한다', fade(u, 2.0), { 'font-size': 15 }); }
    if (k === 4) { ['mentionGroups', 'mentionUsers', 'mentionChannel'].forEach((f, i) => { const y = 110 + i * 50; mono(440, y, f + ': ""', { 'font-size': 15, opacity: fade(u, 0.2 + i * 0.25) }); });
      card(820, 160, 150, 56, { rx: 10, text: '@channel', fs: 17, fw: 800, stroke: MUT, color: MUT, s: pop(u, 1.1) }); cross(820, 160, 26, pop(u, 1.5));
      sub(640, 290, '지금은 아무도 호출하지 않는다 · 멘션은 critical에만', fade(u, 1.9), { 'font-size': 15 }); }
    if (k === 5) { card(640, 150, 320, 110, { rx: 12, stroke: INFO, sw: 2.5, s: pop(u, 0.4) }); env(530, 150, pop(u, 0.8), INFO);
      mono(570, 140, 'email-oncall', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.9) }); mono(570, 168, 'type: email', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.1) }); }
    if (k === 6) { const g = E(u, 0.9, 2.0); env(440, 170, 1.2, INFO);
      mono(440, 210, 'singleEmail: false', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO });
      [['oncall@example.com', 110], ['dev-lead@example.com', 230]].forEach(([a, y]) => { env(lerp(440, 640, g), lerp(170, y, g), 1, INFO); mono(670, y + 5, a, { 'font-size': 14.5, opacity: fade(u, 1.8) }); });
      sub(640, 310, '주소마다 메일이 한 통씩 · true면 한 통에 두 주소', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 7) { card(470, 170, 150, 60, { rx: 10, text: 'Grafana', fs: 16, fw: 800, s: pop(u, 0.2) });
      grow(545, 170, 730, 170, E(u, 0.5, 1.2), BAD); mono(640, 150, 'integrationKey', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 0.7) });
      const g = R.G(820, 170, pop(u, 1.2)); el('rect', { x: -26, y: -40, width: 52, height: 80, rx: 9, fill: PANEL, stroke: BAD, 'stroke-width': 2.6 }, g); el('rect', { x: -18, y: -30, width: 36, height: 40, rx: 4, fill: BADBG }, g);
      const w = Math.sin(t * 18) * 3; el('path', { d: `M858,${156 + w} q8,14 0,28 M868,${148 + w} q12,22 0,44`, fill: 'none', stroke: BAD, 'stroke-width': 2.4, opacity: fade(u, 1.6) });
      sub(640, 290, '밤에도 사람을 깨우는 호출용', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 8) { card(450, 170, 150, 60, { rx: 10, text: 'Grafana', fs: 16, fw: 800 });
      fly(525, 170, 720, 170, seg(u, 0.4, 1.6), 'POST', { fill: WARN, stay: true, mono: true });
      card(850, 170, 150, 60, { rx: 10, text: '사내 시스템', fs: 15, stroke: WARN, s: pop(u, 0.2) });
      mono(640, 240, 'https://hooks.local/grafana', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      mono(640, 290, 'maxAlerts: 0  →  ∞ (무제한)', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.6) }); } }

  // ---------- 2. Notification Policy 트리 ----------
  const RT = { x: 115, y: 215 }, CX = 405, NW = 250, NH = 50;
  const KIDS = [
    { y: 62, m: 'severity = critical', r: 'pagerduty-critical', at: 3, col: BAD, cont: true },
    { y: 136, m: 'severity = critical', r: 'slack-ops', at: 4, col: BAD },
    { y: 215, m: 'team = backend', r: 'slack-backend', at: 5, col: ACC },
    { y: 294, m: 'team = database', r: 'slack-database', at: 6, col: ACC },
    { y: 368, m: 'severity = info', r: 'email-oncall', at: 7, col: INFO }];
  const GC = { x: 745, y: 215, m: 'service = api', r: 'slack-backend-api' };
  function node(x, y, m, r, col, s, hot) { card(x, y, NW, NH, { rx: 10, stroke: hot ? col : GRID, sw: hot ? 3 : 1.8, fill: hot ? PANEL : PANEL, s });
    if (s > 0.3) { mono(x - NW / 2 + 12, y - 4, m, { 'font-size': 13.5, 'font-weight': 700, fill: col }); mono(x - NW / 2 + 12, y + 17, '→ ' + r, { 'font-size': 13.5 }); } }
  function edge(x1, y1, x2, y2, u, col) { if (u <= 0) return; const mx = (x1 + x2) / 2;
    const p = el('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, fill: 'none', stroke: col || GRID, 'stroke-width': 2.2, pathLength: 100, 'stroke-dasharray': `${u * 100} 100` }); }
  function s2(t, c) { const { k, u } = c;
    // 루트
    card(RT.x, RT.y, 170, 70, { rx: 12, stroke: INK, sw: 2.6, s: k === 0 ? pop(u, 0.3) : 1 });
    tx(RT.x, RT.y - 8, k >= 1 ? '루트 (기본)' : 'policies', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
    if (k >= 1) mono(RT.x, RT.y + 18, '→ slack-ops', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
    if (k === 0) { sub(560, 215, '여기서부터 경로가 갈린다', fade(u, 1.0), { 'font-size': 16 }); return; }
    KIDS.forEach((n, i) => { if (k < n.at) return; const s = k === n.at ? pop(u, 0.2) : 1, hot = k === n.at || (k === 8 && i < 2);
      edge(RT.x + 85, RT.y, CX - NW / 2, n.y, k === n.at ? E(u, 0, 0.5) : 1, hot ? n.col : GRID); node(CX, n.y, n.m, n.r, n.col, s, hot);
      if (n.cont) mono(CX + NW / 2 + 10, n.y + 5, 'continue: true', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: k === n.at ? fade(u, 0.8) : 1 }); });
    if (k >= 5) { edge(CX + NW / 2, 215, GC.x - NW / 2, GC.y, k === 5 ? E(u, 0.4, 0.9) : 1, k === 5 ? ACC : GRID); node(GC.x, GC.y, GC.m, GC.r, ACC, k === 5 ? pop(u, 0.6) : 1, k === 5); }
    // beat 별 장면
    const NX = 115;
    if (k === 1) { pill(NX, 70, '{team=frontend}', MUT, pop(u, 0.4), { mono: true, fs: 13.5 }); dot([[NX, 86], [NX, RT.y - 36]], seg(u, 0.9, 1.9), INK, 7);
      sub(NX, 300, '어디에도 안 맞으면', fade(u, 1.6), { 'font-size': 14.5 }); sub(NX, 322, '루트가 받는다', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 2) { const g = E(u, 0.3, 1.4); [0, 1, 2].forEach((i) => env(lerp(330 + i * 110, 470, g), lerp(110, 150, g), 1, ACC, { op: i ? 1 - g * 0.8 : 1 }));
      card(470, 205, 300, 40, { rx: 8, text: 'group_by: [alertname, severity, team]', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.3) });
      [['group_wait', '30s'], ['group_interval', '5m'], ['repeat_interval', '4h']].forEach(([a, b], i) => { tagL(330 + i * 0, 270 + i * 40, a + ' ' + b, INK, { mono: true, fs: 13.5, s: pop(u, 1.6 + i * 0.25) }); });
      sub(760, 290, '같은 라벨끼리 모아', fade(u, 2.0), { 'font-size': 14.5 }); sub(760, 314, '기다렸다 한 번에 보낸다', fade(u, 2.2), { 'font-size': 14.5 }); }
    if (k === 3) { tagL(CX + 70, 110, 'group_wait 10s · repeat 30m', BAD, { mono: true, fs: 13.5, s: pop(u, 1.2) });
      pill(NX, 330, '{severity=critical}', BAD, pop(u, 0.4), { mono: true, fs: 13.5 }); dot([[RT.x + 85, RT.y], [CX - NW / 2, 62]], seg(u, 1.4, 2.4), BAD, 7); }
    if (k === 4) { pill(NX, 330, '{severity=critical}', BAD, 1, { mono: true, fs: 13.5 });
      dot([[RT.x + 85, RT.y], [CX - NW / 2, 62]], seg(u, 0.2, 1.0), BAD, 7); dot([[CX - NW / 2, 62], [CX - NW / 2 - 20, 99], [CX - NW / 2, 136]], seg(u, 1.1, 1.9), BAD, 7);
      check(CX + NW / 2 + 160, 62, 10, pop(u, 1.0)); check(CX + NW / 2 + 160, 136, 10, pop(u, 2.0));
      tx(CX + NW / 2 + 180, 141, 'PagerDuty + Slack', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 5) { pill(NX, 330, '{team=backend, service=api}', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      dot([[RT.x + 85, RT.y], [CX - NW / 2, 215], [CX + NW / 2, 215], [GC.x - NW / 2, 215]], seg(u, 1.0, 2.6), ACC, 7);
      sub(GC.x, 270, '더 좁은 조건이 안쪽에', fade(u, 2.2), { 'font-size': 14.5 }); }
    if (k === 6) { pill(NX, 330, '{team=database}', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); dot([[RT.x + 85, RT.y], [CX - NW / 2, 294]], seg(u, 1.0, 2.0), ACC, 7);
      tx(CX + NW / 2 + 14, 299, '자식 없음 · 여기서 끝', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 7) { tagL(CX + NW / 2 + 14, 368, 'group_interval 30m · repeat 24h', INFO, { mono: true, fs: 13.5, s: pop(u, 1.0) });
      tx(CX + NW / 2 + 14, 334, '급하지 않은 것은 메일로 모은다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 8) { ['① 안쪽(자식)까지 내려간다', '② 형제 중 첫 매칭에서 멈춘다', '③ continue: true면 다음 형제도 본다'].forEach((s, i) => tx(690, 300 + i * 30, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) })); } }

  // ---------- 3. Template ----------
  const EX = { name: 'API 5xx 비율 높음', sum: '5xx 비율이 5%를 5분 이상 넘었다' };
  function s3(t, c) { const { k, u } = c;
    // 왼쪽: 템플릿 이름
    tx(30, 36, 'templates:', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
    [['slack.custom.title', 1], ['slack.custom.text', 2], ['email.custom.subject', 5]].forEach(([n, at], i) => { const y = 80 + i * 56, on = k >= at, hot = (k === at) || (at === 2 && k >= 2 && k <= 4) || (k === 8 && i < 2);
      card(170, y, 280, 42, { rx: 8, stroke: on ? (hot ? ACC : INK) : GRID, sw: hot ? 2.8 : 1.6, dash: on ? null : '6 6', fill: on ? PANEL : 'none', s: k === 0 ? pop(u, 0.3 + i * 0.25) : k === at ? pop(u, 0.2) : 1 });
      if (on) mono(44, y + 5, 'define "' + n + '"', { 'font-size': 13.5, 'font-weight': 700, fill: hot ? ACC : INK }); });
    if (k === 0) { sub(620, 200, '이름 붙은 템플릿을 등록하고', fade(u, 1.2), { 'font-size': 16 }); sub(620, 230, 'Contact Point에서 이름으로 불러 쓴다', fade(u, 1.6), { 'font-size': 16 }); return; }
    if (k <= 4) { pill(870, 30, '예시 값', MUT, 1, { fs: 13.5 });
      msg(350, 52, 590, k >= 2 ? 340 : 120, k === 4 ? BAD : ACC, k === 1 ? pop(u, 0.2) : 1);
      const title = '🔥 [FIRING] ' + EX.name;
      tx(374, 90, title, { 'font-size': 17, 'font-weight': 800, opacity: k === 1 ? fade(u, 0.6) : 1 });
      if (k === 1) { tx(374, 140, '✅ [RESOLVED] ' + EX.name, { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
        sub(645, 210, '.Status가 firing이면 🔥, 아니면 ✅', fade(u, 2.0), { 'font-size': 15 }); return; }
      [['Severity', k === 4 ? 'critical' : 'warning'], ['Team', 'backend'], ['Service', 'api']].forEach(([a, b], i) => { const op = k === 2 ? fade(u, 0.3 + i * 0.3) : 1;
        tx(374, 128 + i * 26, a + ':', { 'font-size': 14.5, 'font-weight': 800, opacity: op }); el('rect', { x: 450, y: 113 + i * 26, width: tw(b, 13.5) + 14, height: 21, rx: 4, fill: SOFT, opacity: op }); mono(457, 128 + i * 26, b, { 'font-size': 13.5, fill: BAD, opacity: op }); });
      if (k === 2) { sub(645, 300, '공통 라벨은 .CommonLabels에서 꺼낸다', fade(u, 1.6), { 'font-size': 15 }); return; }
      [0, 1].forEach((i) => { const y = 222 + i * 62, op = k === 3 ? fade(u, 0.5 + i * 0.8) : 1;
        tx(374, y, '• ' + EX.sum, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); tx(390, y + 24, 'Grafana에서 보기   📖 Runbook', { 'font-size': 14, fill: INFO, opacity: op }); });
      if (k === 3) { const p = el('path', { d: 'M 925 230 C 960 250, 960 300, 925 315', fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 0.4) }); mono(918, 210, 'range .Alerts', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.4) }); }
      if (k === 4) { card(645, 370, 200, 34, { rx: 6, fill: BADBG, stroke: BAD, sw: 1.8, text: '<!channel> 즉시 대응', fs: 14, color: BAD, s: pop(u, 0.8) });
        tx(910, 375, 'critical일 때만', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.4) }); }
      return; }
    if (k === 5) { card(650, 200, 520, 150, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.2) }); env(430, 160, pop(u, 0.4), INFO);
      tx(470, 166, '제목', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      const s = '[FIRING CRITICAL] ' + EX.name; tx(420, 214, s.slice(0, Math.round(s.length * E(u, 0.7, 1.9))), { 'font-size': 17, 'font-weight': 800 });
      sub(650, 320, 'toUpper로 상태와 severity를 대문자로', fade(u, 2.0), { 'font-size': 15 }); pill(870, 30, '예시 값', MUT, 1, { fs: 13.5 }); }
    if (k === 6) { card(400, 210, 60, 60, { rx: 30, text: '.', fs: 30, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      ['.Status', '.Alerts', '.CommonLabels', '.CommonAnnotations', '.GroupLabels', '.ExternalURL'].forEach((f, i) => { const y = 70 + i * 56, s = pop(u, 0.4 + i * 0.25);
        edge(430, 210, 560, y, E(u, 0.3 + i * 0.25, 0.8 + i * 0.25), ACC); tagL(565, y, f, INK, { mono: true, fs: 14, s }); });
      tx(940, 210, '늘 들어오는 값', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.2) }); }
    if (k === 7) { [['humanize 1000', '1k'], ['"firing" | toUpper', 'FIRING'], ['printf "%.2f" 6.6', '6.60']].forEach(([a, b], i) => { const y = 90 + i * 90;
        card(520, y, 250, 50, { rx: 8, text: a, fs: 14, mono: true, s: pop(u, 0.2 + i * 0.5) }); grow(650, y, 730, y, E(u, 0.5 + i * 0.5, 0.9 + i * 0.5), ACC);
        card(820, y, 140, 50, { rx: 8, text: b, fs: 17, fw: 800, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.9 + i * 0.5) }); }); }
    if (k === 8) { card(640, 120, 360, 100, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.2) }); mono(480, 102, 'slack-ops', { 'font-size': 15, 'font-weight': 800 });
      mono(480, 128, 'title: {{ template "slack.custom.title" . }}', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 0.6) }); mono(480, 152, 'text:  {{ template "slack.custom.text" . }}', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 0.9) });
      grow(640, 172, 640, 240, E(u, 1.2, 1.6), ACC); msg(470, 250, 340, 70, ACC, pop(u, 1.7)); tx(494, 292, '🔥 [FIRING] ' + EX.name, { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 1.9) }); } }

  // ---------- 4. Mute Timing: 한 주 달력 ----------
  const GX = 100, GY = 70, CW = 17.5, CH = 26, DAYS = ['월', '화', '수', '목', '금', '토', '일'];
  function week(fillU, marks) { DAYS.forEach((d, r) => { tx(GX - 14, GY + r * CH + 18, d, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: r >= 5 ? BAD : INK });
      for (let h = 0; h < 24; h++) { const i = r * 24 + h, s = clamp(fillU * 168 - i); if (s <= 0) continue; const m = marks(r, h);
        el('rect', { x: GX + h * CW, y: GY + r * CH, width: CW - 2, height: CH - 3, rx: 2, fill: m ? m : SOFT, opacity: m ? 0.85 : s }); } });
    [0, 6, 12, 18, 24].forEach((h) => mono(GX + h * CW, GY - 10, String(h).padStart(2, '0'), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); }
  const nightly = (r, h) => r < 5 && h >= 2 && h < 4, weekend = (r, h) => r >= 5 && h < 6;
  function s4(t, c) { const { k, u } = c, RX = 560;
    week(k === 0 ? E(u, 0.2, 2.0) : 1, (r, h) => (k >= 1 && nightly(r, h) ? INFO : null) || (k >= 2 && weekend(r, h) ? WARN : null));
    tx(GX, 280, 'location: Asia/Seoul', { 'font-size': 14, class: 'mono', fill: MUT, opacity: k >= 1 ? 1 : 0 });
    if (k === 0) { sub(760, 160, '이름 붙은 시간대를 먼저 정의하고', fade(u, 1.4), { 'font-size': 15 }); sub(760, 186, '정책에서 이름으로 부른다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { tagL(RX, 90, 'nightly-maintenance', INFO, { mono: true, s: pop(u, 0.4) }); mono(RX, 132, '월~금 02:00–04:00', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7) });
      for (let r = 0; r < 5; r++) el('rect', { x: GX + 11 * CW, y: GY + r * CH, width: 2 * CW - 2, height: CH - 3, rx: 2, fill: 'none', stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '4 3', opacity: fade(u, 1.5) });
      tx(RX, 190, 'location을 빼면 UTC 기준', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(RX, 214, '→ 한국 시간 11~13시가 꺼진다', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.9) }); }
    if (k === 2) { tagL(RX, 90, 'weekend-batch', WARN, { mono: true, s: pop(u, 0.4) }); mono(RX, 132, '토·일 00:00–06:00', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7) });
      sub(GX + 210, 320, '예정된 배치 소음은 시간대로 미리 막는다', fade(u, 1.6), { 'font-size': 15 }); }
    if (k === 3) { tagL(RX, 90, 'holiday-2026', BAD, { mono: true, s: pop(u, 0.3) });
      [['1월', '1'], ['5월', '5']].forEach(([m, d], i) => { const x = RX + 60 + i * 150, s = pop(u, 0.7 + i * 0.4); card(x, 190, 110, 110, { rx: 10, stroke: BAD, sw: 2.4, s });
        el('rect', { x: x - 55, y: 135, width: 110 * s, height: 30, rx: 8, fill: BAD, opacity: s }); tx(x, 157, m, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL, opacity: s });
        mono(x, 220, d, { 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 800, opacity: s }); });
      mono(RX, 290, 'months + days_of_month', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k >= 4) { // 정책 쪽
      el('line', { x1: RX - 20, y1: 40, x2: RX - 20, y2: 380, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '8 6', opacity: k === 4 ? fade(u, 0.2) : 1 });
      mono(RX, 48, '--- policies', { 'font-size': 14, fill: MUT, opacity: k === 4 ? fade(u, 0.4) : 1 }); }
    if (k === 4) { card(RX + 180, 130, 300, 56, { rx: 10, stroke: ACC, sw: 2.4, s: pop(u, 0.8) }); mono(RX + 44, 125, 'severity = info', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
      mono(RX + 44, 148, '→ slack-info', { 'font-size': 14, opacity: fade(u, 1.1) }); sub(RX + 180, 230, '정의와 적용은 다른 문서 · 이름으로 잇는다', fade(u, 1.6), { 'font-size': 14.5 }); }
    if (k === 5 || k === 6) { card(RX + 180, 100, 300, 56, { rx: 10, stroke: INFO, sw: 2.4 }); mono(RX + 44, 95, 'severity = info → slack-info', { 'font-size': 13.5, 'font-weight': 700, fill: INFO }); mono(RX + 44, 118, 'mute × 3', { 'font-size': 13.5 });
      card(RX + 180, 250, 300, 56, { rx: 10, stroke: BAD, sw: 2.4 }); mono(RX + 44, 245, 'severity = critical → pagerduty', { 'font-size': 13.5, 'font-weight': 700, fill: BAD }); mono(RX + 44, 268, 'mute 없음', { 'font-size': 13.5 });
      el('circle', { cx: GX + 3 * CW + CW / 2, cy: GY + 1 * CH + 11, r: 8, fill: k === 5 ? INFO : BAD }); tx(GX + 3 * CW + 16, GY + 1 * CH - 4, '화 03시', { 'font-size': 13.5, 'font-weight': 700 }); }
    if (k === 5) { [['nightly', 0], ['weekend', 1], ['holiday', 2]].forEach(([n, i]) => tagL(RX + 120 + i * 100, 150, n, INFO, { mono: true, fs: 13.5, s: pop(u, 0.2 + i * 0.2) }));
      bell(RX + 180, 330, pop(u, 1.4), INFO, true); tx(RX + 210, 336, 'info는 조용히', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 6) { bell(RX + 180, 330, 1 + R.bump(u, 0.8), BAD); tx(RX + 210, 336, 'critical은 새벽에도 울린다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      dot([[GX + 3 * CW + CW / 2, GY + CH + 11], [RX + 30, 250]], seg(u, 0.2, 1.4), BAD, 7); }
    if (k === 7) { [['critical', '항상 통지', BAD, 0], ['warning', '야간만 mute', WARN, 1], ['info', '야간·주말 mute', INFO, 2]].forEach(([a, b, col, i]) => { const y = 110 + i * 80;
        pill(RX + 70, y, a, col, pop(u, 0.2 + i * 0.4), { fs: 15 }); tx(RX + 150, y + 6, b, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); }); }
    if (k === 8) { ['전체 mute → 진짜 사고도 못 받음', 'mute 후 해제 잊음 → 영구 무음', 'location 미지정 → UTC로 동작'].forEach((s, i) => { const y = 110 + i * 70; cross(RX + 14, y, 9, pop(u, 0.2 + i * 0.4)); tx(RX + 36, y + 6, s, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 0.3 + i * 0.4) }); }); } }

  // ---------- 5. 전체 파이프라인 ----------
  const PN = [{ n: 'Rule', s: 'Firing', x: 80 }, { n: 'Policy', s: '라우팅', x: 265 }, { n: 'Mute', s: '시간대', x: 450 }, { n: 'Template', s: '메시지', x: 635 }, { n: 'Contact', s: '발송', x: 835 }];
  const FS = [{ n: '1) contactPoints', ks: [0, 1, 2] }, { n: '2) policies', ks: [3, 4, 8] }, { n: '3) muteTimes', ks: [5] }, { n: '4) templates', ks: [6, 7] }];
  const PON = [[4], [4, 3], [4], [1], [1], [2], [3], [3], [0, 1, 4]];
  function s5(t, c) { const { k, u } = c;
    PN.forEach((p, i) => { const on = PON[k].includes(i); card(p.x, 70, 150, 64, { rx: 12, stroke: on ? ACC : GRID, sw: on ? 3 : 1.8, fill: on ? ACCBG : PANEL, s: on ? 1 + R.bump(u, 0.2) : 1 });
      tx(p.x, 66, p.n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: on ? ACC : INK }); tx(p.x, 88, p.s, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      if (i < 4) grow(p.x + 76, 70, PN[i + 1].x - 76, 70, 1, MUT); });
    FS.forEach((f, i) => { const on = f.ks.includes(k), x = 30 + i * 228; card(x + 106, 380, 212, 42, { rx: 8, stroke: on ? ACC : GRID, sw: on ? 2.6 : 1.5, fill: on ? ACCBG : PANEL });
      mono(x + 14, 385, f.n, { 'font-size': 14, 'font-weight': on ? 800 : 500, fill: on ? INK : MUT }); });
    tx(30, 350, 'full.yaml 한 파일', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const MY = 220;
    if (k === 0) { sub(480, MY, '파이프라인 순서대로 읽으면 구조가 보인다', fade(u, 0.6), { 'font-size': 16 }); sub(480, MY + 30, '첫 블록은 수신자', fade(u, 1.2), { 'font-size': 15 }); }
    if (k === 1) { card(330, MY, 260, 90, { rx: 10, stroke: ACC, sw: 2.4, s: pop(u, 0.2) }); mono(220, MY - 14, 'slack-ops', { 'font-size': 15, 'font-weight': 800 }); mono(220, MY + 12, 'url: $SLACK_WEBHOOK', { 'font-size': 13.5 });
      grow(462, MY, 560, MY, E(u, 0.8, 1.3), ACC); tagL(570, MY - 20, 'custom.title', INFO, { mono: true, fs: 13.5, s: pop(u, 1.3) }); tagL(570, MY + 20, 'custom.text', INFO, { mono: true, fs: 13.5, s: pop(u, 1.6) });
      tx(760, MY + 6, '이름으로 연결', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 2) { card(400, MY, 280, 70, { rx: 10, stroke: BAD, sw: 2.4, s: pop(u, 0.2) }); mono(280, MY - 6, 'pagerduty-critical', { 'font-size': 15, 'font-weight': 800 }); mono(280, MY + 18, 'integrationKey: $PD_KEY', { 'font-size': 13.5, opacity: fade(u, 0.8) });
      tx(580, MY + 6, '호출이 필요한 급은 따로 뺀다', { 'font-size': 15, opacity: fade(u, 1.4) }); }
    if (k === 3) { card(300, MY, 260, 56, { rx: 10, text: '루트 → slack-ops', fs: 15, stroke: INK, s: pop(u, 0.2) });
      mono(460, MY - 30, 'group_by: [alertname, severity]', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.7) });
      [['30s', 'group_wait'], ['5m', 'group_interval'], ['4h', 'repeat_interval']].forEach(([a, b], i) => { clock(500 + i * 140, MY + 28, 18, E(u, 1.0 + i * 0.3, 2.4), WARN, null); mono(530 + i * 140, MY + 34, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.0 + i * 0.3) }); mono(500 + i * 140, MY + 66, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.1 + i * 0.3) }); }); }
    if (k === 4) { card(140, MY, 120, 46, { rx: 10, text: '루트', fs: 15 });
      [['severity = critical → pagerduty', MY - 50, BAD, 'continue: true'], ['severity = warning → slack-ops', MY + 50, WARN, 'mute: nightly']].forEach(([s, y, col, tg], i) => { const sc = pop(u, 0.3 + i * 0.5);
        grow(200, MY, 300, y, E(u, 0.2 + i * 0.5, 0.6 + i * 0.5), col); card(470, y, 330, 46, { rx: 10, text: s, fs: 13.5, mono: true, stroke: col, color: INK, s: sc }); tagL(650, y, tg, col, { mono: true, fs: 13.5, s: sc }); }); }
    if (k === 5) { const x0 = 160, w = 640, H = (h) => x0 + (w * h) / 24, g = E(u, 0.3, 1.4);
      el('rect', { x: x0, y: MY - 10, width: w, height: 30, rx: 6, fill: SOFT });
      el('rect', { x: H(22), y: MY - 10, width: (H(24) - H(22)) * g, height: 30, rx: 4, fill: INFO, opacity: 0.85 }); el('rect', { x: H(0), y: MY - 10, width: (H(8) - H(0)) * g, height: 30, rx: 4, fill: INFO, opacity: 0.85 });
      [0, 8, 22, 24].forEach((h) => mono(H(h), MY + 40, String(h).padStart(2, '0') + ':00', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      tx(480, MY - 26, '자정을 넘는 구간은 22–24와 00–08 두 개로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k === 6 || k === 7) { msg(250, MY - 70, 460, k === 7 ? 150 : 60, ACC, k === 6 ? pop(u, 0.3) : 1); tx(274, MY - 32, '[FIRING] API 5xx 비율 높음', { 'font-size': 16, 'font-weight': 800, opacity: k === 6 ? fade(u, 0.8) : 1 });
      pill(870, 30, '예시 값', MUT, 1, { fs: 13.5 });
      if (k === 7) { [0, 1].forEach((i) => tx(274, MY + 6 + i * 30, '• 5xx 비율이 5%를 5분 이상 넘었다', { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.7) })); mono(700, MY + 66, 'range .Alerts', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.3) }); } }
    if (k === 8) { const rows = [['a. severity = critical → pagerduty', '✓ 매칭 · continue', GOOD, 0.3], ['b. severity = warning → slack-ops', '✗ 안 맞음', MUT, 0.9], ['c. 루트 slack-ops', '자식이 맞았으니 안 감', MUT, 1.5]];
      pill(130, 150, '{severity=critical}', BAD, pop(u, 0.1), { mono: true, fs: 13.5 });
      rows.forEach(([a, b, col, at], i) => { const y = 200 + i * 40; mono(250, y, a, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, at) }); tx(930, y, b, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, at + 0.2) }); });
      banner(480, 330, 'PagerDuty만 받는다', pop(u, 2.0)); } }

  const quiz = [
    { q: 'email-oncall에 주소 두 개와 singleEmail: false를 두면 알람 하나에 메일은 어떻게 나가나?',
      o: ['두 주소를 모두 받는 사람으로 넣은 한 통', '알람 수와 상관없이 하루 한 통', '주소마다 한 통씩 두 통'], a: 2,
      why: 'singleEmail: false면 주소마다 따로 보낸다. true일 때만 한 통에 모든 주소를 넣는다.' },
    { q: 'notification-policies.yaml에서 severity=critical 알람은 어디로 가나?',
      o: ['PagerDuty와 slack-ops 두 곳', 'PagerDuty 한 곳', '루트의 slack-ops 한 곳'], a: 0,
      why: '첫 경로가 PagerDuty로 보내고 continue: true라 다음 형제도 본다. 바로 아래 형제가 같은 critical 매처로 slack-ops를 받는다.' },
    { q: '템플릿의 range .Alerts가 하는 일은 무엇인가?',
      o: ['알람을 severity 순으로 정렬한다', '한 메시지에 묶인 알람을 하나씩 돌며 줄을 만든다', '알람 수만큼 메시지를 따로 보낸다'], a: 1,
      why: '한 그룹 메시지에 여러 알람이 들어오므로 range로 돌며 요약과 링크를 한 줄씩 찍는다.' },
    { q: 'nightly-maintenance에 location을 빼면 무엇이 달라지나?',
      o: ['서버 시간대로 계산되어 그대로 맞는다', 'UTC로 계산되어 한국 시간과 9시간 어긋난다', '설정이 거부되어 저장되지 않는다'], a: 1,
      why: 'location이 없으면 UTC 기준이다. 02:00–04:00 UTC는 한국 시간 11:00–13:00이라 낮에 알림이 꺼진다.' },
    { q: 'full-pipeline.yaml에서 severity=critical 알람을 받는 곳은 어디인가?',
      o: ['PagerDuty만', 'PagerDuty와 루트의 slack-ops', 'slack-ops만'], a: 0,
      why: 'PagerDuty 경로가 맞았고 다음 형제(warning)는 안 맞는다. 자식이 하나라도 맞으면 루트로 돌아가지 않으므로 PagerDuty만 받는다.' },
  ];
  const summary = [
    'Contact Point는 받는 곳 하나다. Slack, Email, PagerDuty, Webhook마다 하나씩 만든다.',
    'Notification Policy는 라벨로 경로를 고르는 트리이고, 안 맞는 알람은 루트가 받는다.',
    '형제 경로는 첫 매칭에서 멈추고, continue: true여야 다음 형제도 본다.',
    '템플릿은 메시지 모양을, Mute Timing은 경로별로 알림을 끌 시간대를 정한다.',
  ];
  const review = [
    { q: 'critical 알람이 PagerDuty로만 오고 Slack에는 안 왔다. 정책에서 먼저 확인할 것은?',
      o: ['continue: true 다음에 critical을 받는 Slack 경로가 있는지', 'group_wait가 30s인지', '템플릿에 <!channel>이 있는지'], a: 0,
      why: 'continue는 다음 형제를 보라는 뜻일 뿐이다. 그 형제가 critical에 맞아야 Slack도 받는다.' },
    { q: '새벽 3시 DB 장애 알림을 아침에야 봤다. 설정을 보니 모든 경로에 nightly mute가 걸려 있었다. 고칠 방향은?',
      o: ['group_interval을 늘린다', 'critical 경로에서 mute를 빼고 warning·info에만 남긴다', '템플릿에서 멘션을 지운다'], a: 1,
      why: 'Mute Timing은 붙은 경로의 알림을 그 시간 동안 막는다. critical 경로에는 mute를 달지 않아야 새벽 장애를 받는다.' },
    { q: 'info 알람이 4시간마다 반복돼 메일함이 시끄럽다. 어디를 바꾸나?',
      o: ['Contact Point의 singleEmail', 'Alert Rule의 for', 'info 경로의 repeat_interval'], a: 2,
      why: '같은 그룹을 다시 보내는 간격은 정책의 repeat_interval이 정한다. 예제처럼 info 경로만 24h로 늘리면 된다.' },
  ];

  R.page({ title: '알림 라우팅', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
