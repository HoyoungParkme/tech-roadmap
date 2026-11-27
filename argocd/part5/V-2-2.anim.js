/* V-2-2 Notifications + 종합 운영 · 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 구독 annotation 형식 notifications.argoproj.io/subscribe.<trigger>.<service>: <recipient> 와
 * 저장소 기본 폴링 3분은 argo-cd.readthedocs.io 문서로 확인했다. 시각(09:00 …)과 리비전 a1b2c3 은 페이지의 예시다.
 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, person, cross, check, clock, lock, terminal, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // Argo CD Application 카드: 이름 + 상태 두 줄 (sync / health)
  function appCard(cx, cy, o) { o = o || {}; const w = o.w || 210, h = 96;
    card(cx, cy, w, h, { rx: 12, stroke: o.bad ? BAD : INK, sw: 2.2, s: o.s });
    if ((o.s ?? 1) < 0.5) return;
    tx(cx - w / 2 + 16, cy - 22, o.name || 'web-app', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
    [[o.sync || 'Synced', o.syncCol || GOOD], [o.health || 'Healthy', o.healthCol || GOOD]].forEach(([s, col], i) => { const y = cy + 6 + i * 26;
      el('circle', { cx: cx - w / 2 + 22, cy: y - 5, r: 6, fill: col }); mono(cx - w / 2 + 36, y, s, { 'font-size': 14.5, 'font-weight': 700, fill: col }); }); }
  // Slack 창: 채널 이름 + 메시지 줄들 [{text, col}]
  function slack(x, y, w, h, ch, msgs, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
    el('rect', { x, y, width: w, height: 32, rx: 10, fill: SOFT }); mono(x + 14, y + 22, '#' + ch, { 'font-size': 14.5, 'font-weight': 800 });
    if (o.muted) { tx(x + w - 14, y + 22, '음소거', { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, 'font-weight': 700 }); }
    const rows = Math.floor((h - 44) / 30), list = msgs.slice(Math.max(0, msgs.length - rows));
    list.forEach((m, i) => { const yy = y + 44 + i * 30, op = m.op ?? 1;
      el('rect', { x: x + 12, y: yy, width: 5, height: 22, rx: 2, fill: m.col || GOOD, opacity: op });
      tx(x + 26, yy + 16, m.text, { 'font-size': 13.5, 'font-weight': 600, fill: m.tcol || INK, opacity: op }); }); }
  // 흐름 노드 줄: beat 의 flow 데이터(label, sub, tone)를 그대로 그린다
  const TONE = { event: INFO, trigger: WARN, template: ACC, channel: GOOD };
  function chain(flow, y, u, o) { o = o || {}; const n = flow.length, x0 = o.x0 || 110, x1 = o.x1 || 850, gap = n > 1 ? (x1 - x0) / (n - 1) : 0, w = Math.min(190, gap - 24 || 190);
    flow.forEach((f, i) => { const cx = n === 1 ? (x0 + x1) / 2 : x0 + i * gap, col = TONE[f.tone] || INK, fresh = o.fresh != null && i >= o.fresh, s = fresh ? pop(u, 0.3 + (i - o.fresh) * 0.35) : 1;
      if (i > 0) grow(cx - gap + w / 2 + 4, y, cx - w / 2 - 6, y, fresh ? seg(u, 0.1 + (i - o.fresh) * 0.35, 0.4 + (i - o.fresh) * 0.35) : 1, GRID);
      card(cx, y, w, 62, { rx: 10, stroke: col, sw: 2, s });
      if (s > 0.5) { tx(cx, y - 4, f.label, { 'font-size': f.label.length > 14 ? 13.5 : 14.5, 'text-anchor': 'middle', 'font-weight': 800, fill: col });
        tx(cx, y + 18, f.sub, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); } });
    if (o.dots && n > 1) for (let i = 1; i < n; i++) { const a = x0 + (i - 1) * gap + w / 2 + 4, b = x0 + i * gap - w / 2 - 8;
      if (o.fresh == null || i < o.fresh || u > 0.6 + (i - o.fresh) * 0.35) dot([[a, y], [b, y]], (o.t * 0.7 + i * 0.3) % 1, INFO, 5); } }

  // =========== 1. 왜 Notifications ===========
  function s1(t, c) { const { k, u } = c, f = c.beat.flow;
    if (k === 0 || k === 1) {
      appCard(170, 150, { sync: 'Sync 실패', syncCol: BAD, health: 'Degraded', healthCol: BAD, bad: true, s: k === 0 ? pop(u, 0.2) : 1 });
      sub(170, 220, 'CrashLoopBackOff 파드', k === 0 ? fade(u, 0.8) : 1, { fill: BAD, 'font-weight': 700 });
      person(760, 170, '담당자', { stroke: k === 1 && u > 1.6 ? INK : OFF });
      if (k === 0) { mono(800, 120, 'z z z', { 'font-size': 16, fill: MUT, opacity: fade(u, 0.8) }); clock(560, 130, 26, E(u, 0.4, 2.6), INFO);
        mono(560, 182, '03:00 → 09:00', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) });
        tx(480, 320, 'UI를 열기 전까지 아무도 모른다', { 'font-size': 17, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.8) }); return; }
      // k1: pull (사람 → UI) 대신 push (이벤트 → Slack → 사람)
      grow(730, 120, 280, 120, 1, OFF, { dash: '6 5' }); tx(505, 108, 'pull · 사람이 UI를 찾아간다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 }); cross(505, 132, 9, pop(u, 0.4));
      slack(400, 220, 240, 110, 'deploy', [{ text: 'web-app sync 실패', col: BAD, op: fade(u, 1.4) }]);
      grow(278, 180, 396, 260, seg(u, 0.7, 1.2), ACC); grow(644, 260, 730, 200, seg(u, 1.2, 1.6), ACC);
      dot([[278, 180], [396, 260]], seg(u, 0.7, 1.2), BAD, 6);
      tx(520, 370, 'push · 변화가 사람에게 온다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); return; }
    chain(f, 150, u, { fresh: k === 2 ? 1 : k === 3 ? 2 : k === 4 ? 3 : 99, dots: true, t });
    if (k === 2) { mono(480, 250, "when: app.status.health.status == 'Degraded'", { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(480, 290, '조건이 참일 때만 발화한다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.5) }); }
    if (k === 3) { const fields = ['앱 이름', '상태', '리비전', '링크'];
      fields.forEach((s, i) => { pill(330 + i * 100, 260, s, ACC, pop(u, 0.9 + i * 0.25), { fs: 14 }); });
      tx(480, 318, '메시지 본문을 template이 만든다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 4) { ['slack', 'email', 'webhook'].forEach((s, i) => { const y = 250 + i * 46;
        grow(850, 186, 760, y, seg(u, 1.0 + i * 0.2, 1.4 + i * 0.2), GOOD); pill(700, y, s, GOOD, pop(u, 1.3 + i * 0.2), { mono: true, fs: 14 }); });
      tx(300, 300, '한 이벤트를 여러 채널로', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) }); }
    if (k === 5) { mono(480, 270, 'argocd-notifications-cm', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 0.6) });
      sub(480, 298, '한 ConfigMap에 trigger와 template를 적는다', fade(u, 1.0), { 'font-weight': 700 }); } }

  // =========== 2. trigger + template ===========
  const CMK = [['trigger.on-sync-failed', WARN], ['trigger.on-health-degraded', WARN], ['trigger.on-deployed', WARN], ['template.app-sync-failed', ACC], ['template.app-deployed', ACC]];
  function cm(k, u, upto, hot) { el('rect', { x: 30, y: 40, width: 330, height: 70 + upto * 40, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.8 });
    mono(48, 66, 'ConfigMap', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(48, 88, 'argocd-notifications-cm', { 'font-size': 15, 'font-weight': 800 });
    CMK.slice(0, upto).forEach(([s, col], i) => { const y = 124 + i * 40, isNew = i === upto - 1 && k > 0, on = i === hot;
      if (on) el('rect', { x: 40, y: y - 20, width: 310, height: 30, rx: 6, fill: col === WARN ? WARNBG : ACCBG });
      mono(56, y, s, { 'font-size': 14, 'font-weight': on ? 800 : 500, fill: on ? col : INK, opacity: isNew ? fade(u, 0.2) : 1 }); }); }
  // 앱 상태 판: phase · health · revision
  function state(x, y, ph, hl, o) { o = o || {};
    el('rect', { x, y, width: 270, height: 112, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    tx(x + 14, y + 22, 'web-app 상태', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    [['operationState.phase', ph, ph === 'Succeeded' ? GOOD : BAD], ['health.status', hl, hl === 'Healthy' ? GOOD : BAD], ['sync.revision', 'a1b2c3', INK]].forEach(([a, b, col], i) => {
      mono(x + 14, y + 48 + i * 24, a, { 'font-size': 13.5, fill: MUT }); mono(x + 256, y + 48 + i * 24, b, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'end' }); }); }
  function s2(t, c) { const { k, u } = c;
    const upto = [0, 1, 2, 3, 4, 4, 5][k], hot = [-1, 0, 1, 2, 3, 3, 4][k];
    cm(k, u, upto, hot);
    if (k === 0) { tx(650, 170, 'trigger와 template를', { 'font-size': 17, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 0.4) });
      tx(650, 202, '한 장에 나란히 적는다', { 'font-size': 17, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 0.7) });
      pill(650, 260, 'namespace: argocd', INFO, pop(u, 1.2), { mono: true, fs: 14 }); return; }
    if (k >= 1 && k <= 3) { const [ph, hl] = [['Failed', 'Healthy'], ['Succeeded', 'Degraded'], ['Succeeded', 'Healthy']][k - 1];
      state(420, 50, ph, hl);
      const conds = [["phase in ['Error','Failed']", ph === 'Failed'], ["health == 'Degraded'", hl === 'Degraded'], ["phase == 'Succeeded' and health == 'Healthy'", ph === 'Succeeded' && hl === 'Healthy']];
      const [cs, ok] = conds[k - 1];
      mono(420, 204, 'when: ' + cs, { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) });
      if (ok) check(910, 198, 10, pop(u, 0.9)); else cross(910, 198, 9, pop(u, 0.9));
      if (k === 1) { // oncePer: 같은 리비전 이벤트 세 번 → 메시지 한 번
        [0, 1, 2].forEach((i) => { const s = pop(u, 1.1 + i * 0.3); pill(470 + i * 100, 262, 'a1b2c3', i ? OFF : BAD, s, { mono: true, fs: 13.5 }); if (i) cross(470 + i * 100 + 40, 252, 6, s); });
        grow(700, 262, 770, 262, seg(u, 2.0, 2.3), BAD); pill(840, 262, '메시지 1건', BAD, pop(u, 2.3), { fs: 14 });
        sub(620, 306, 'oncePer: 같은 리비전엔 한 번만', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }
      if (k === 2) { mono(420, 250, "on-sync-failed의 when: phase in ['Error','Failed']", { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) }); cross(910, 244, 7, pop(u, 1.5));
        tx(420, 300, 'sync는 성공, 파드는 죽은 경우를 health로 잡는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      if (k === 3) tx(420, 260, 'and로 묶어야 "sync 됐지만 죽은" 상태를 성공으로 보지 않는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      return; }
    if (k === 4) { // Go 템플릿 치환
      const rows = [['{{.app.metadata.name}}', 'web-app'], ['{{.app.status.operationState.phase}}', 'Failed'], ['{{.app.status.sync.revision}}', 'a1b2c3']];
      rows.forEach(([a, b], i) => { const y = 90 + i * 66, f = E(u, 0.6 + i * 0.4, 1.1 + i * 0.4);
        mono(420, y, a, { 'font-size': 14, fill: MUT, opacity: 1 - f * 0.5 }); grow(420, y + 12, 420 + 300 * f, y + 12, f > 0 ? 1 : 0, GRID, { plain: true });
        mono(920, y, b, { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: f }); });
      slack(420, 290, 500, 90, 'deploy-frontend', [{ text: ':x: web-app sync 실패 · 단계 Failed · 리비전 a1b2c3', col: BAD, op: fade(u, 2.0) }]); return; }
    if (k === 5) { // Slack 첨부 카드
      el('rect', { x: 430, y: 90, width: 460, height: 150, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2, opacity: fade(u, 0.2) });
      el('rect', { x: 430, y: 90, width: 8, height: 150 * E(u, 0.4, 1.0), rx: 3, fill: BAD });
      tx(456, 128, 'web-app — Sync Failed', { 'font-size': 17, 'font-weight': 800, fill: INFO, 'text-decoration': 'underline', opacity: fade(u, 0.9) });
      mono(456, 162, 'color: #DC2626', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      mono(456, 192, 'title_link: …/applications/web-app', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      person(860, 320, null, { s: pop(u, 1.8) * 0.7 }); grow(820, 300, 700, 140, seg(u, 2.0, 2.5), ACC);
      tx(456, 300, '누르면 바로 그 앱 화면으로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k6: 성공 알림은 짧게
    slack(420, 70, 500, 200, 'deploy-frontend', [{ text: ':x: web-app sync 실패 · 단계 Failed · 리비전 a1b2c3', col: BAD }, { text: ':white_check_mark: web-app 배포 완료 · 리비전 a1b2c3', col: GOOD, op: fade(u, 0.8) }]);
    tx(420, 320, '성공은 이름과 리비전만', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
    sub(420, 348, '실패 본문은 원인과 링크까지', fade(u, 1.8), { 'text-anchor': 'start' }); }

  // =========== 3. 구독과 시크릿 ===========
  function s3(t, c) { const { k, u } = c;
    // 위 왼쪽: cm 의 service.slack
    el('rect', { x: 30, y: 36, width: 400, height: 110, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.8 });
    mono(46, 62, 'argocd-notifications-cm', { 'font-size': 14.5, 'font-weight': 800 });
    if (k === 0) { tx(680, 90, '채널(notifier)도 같은 ConfigMap에', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.0) });
      sub(680, 118, 'slack · email · webhook …', fade(u, 1.4), { class: 'mono' });
      mono(46, 98, 'service.<notifier>: …', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5) }); el('rect', { x: 44, y: 110, width: 370, height: 26, rx: 6, fill: 'none', stroke: ACC, 'stroke-dasharray': '5 4', 'stroke-width': 1.8, opacity: fade(u, 0.9) }); }
    else { mono(46, 98, 'service.slack:', { 'font-size': 14.5, 'font-weight': 700 }); mono(66, 126, 'token: $slack-token', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 0.5) : 1 }); }
    // 위 오른쪽: Secret
    if (k >= 1) { const real = k >= 2;
      el('rect', { x: 540, y: 36, width: 390, height: 110, rx: 12, fill: real ? WARNBG : 'none', stroke: real ? WARN : GRID, 'stroke-width': 1.8, 'stroke-dasharray': real ? null : '6 5', opacity: k === 2 ? fade(u, 0.3) : 1 });
      mono(556, 62, 'argocd-notifications-secret', { 'font-size': 14.5, 'font-weight': 800, fill: real ? INK : MUT });
      if (real) { mono(556, 112, 'slack-token: ••••••••', { 'font-size': 15, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.7) : 1 }); lock(900, 104, true, WARN, k === 2 ? pop(u, 1.0) : 1); }
      grow(272, 120, 536, 104, k === 1 ? seg(u, 0.8, 1.6) : 1, real ? ACC : OFF, { dash: real ? null : '5 5' });
      if (k === 1) tx(410, 176, '$ 로 시작하면 Secret의 키를 가리킨다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      if (k === 2) tx(735, 176, 'Vault · SealedSecret로 넣는다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k <= 2) { if (k === 1) tx(735, 112, '아직 없음', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); return; }
    // 아래: Application annotation → 채널
    el('rect', { x: 30, y: 176, width: 560, height: 226, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(46, 202, 'Application web-app · project production', { 'font-size': 14.5, 'font-weight': 800 });
    mono(46, 230, 'annotations:', { 'font-size': 14, fill: MUT });
    const subs = [['on-deployed', 'deploy-frontend', 4], ['on-sync-failed', 'deploy-frontend', 4], ['on-health-degraded', 'oncall-alerts', 5]];
    subs.forEach(([tr, ch, from], i) => { if (k < from) return; const y = 262 + i * 40, op = k === from ? fade(u, 0.3 + i * 0.4) : 1;
      R.spans(56, y, [['subscribe.', { fill: MUT }], [tr, { fill: WARN, 'font-weight': 700 }], ['.', { fill: MUT }], ['slack', { fill: ACC, 'font-weight': 700 }], [': ' + ch, { fill: GOOD, 'font-weight': 700 }]], { 'font-size': 14, opacity: op }); });
    if (k === 3) { el('rect', { x: 50, y: 244, width: 520, height: 30, rx: 6, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 4', 'stroke-width': 1.6 });
      sub(310, 300, 'subscribe.<trigger>.<notifier>: <채널>', fade(u, 0.6), { class: 'mono', fill: INK });
      sub(310, 340, '구독은 별도 리소스가 아니라 annotation 한 줄', fade(u, 1.2), { 'font-weight': 700 }); return; }
    // 채널 상자
    const CH = { 'deploy-frontend': [790, 240], 'oncall-alerts': [790, 350] };
    Object.entries(CH).forEach(([n, [x, y]]) => { const on = k >= 5 || n === 'deploy-frontend';
      if (on) card(x, y, 220, 50, { rx: 10, text: '#' + n, fs: 15, mono: true, stroke: n === 'oncall-alerts' ? BAD : GOOD, color: n === 'oncall-alerts' ? BAD : GOOD, s: k === (n === 'oncall-alerts' ? 5 : 4) ? pop(u, 1.0) : 1 }); });
    subs.forEach(([tr, ch, from], i) => { if (k < from) return; const y = 256 + i * 40, [x2, y2] = CH[ch];
      grow(560, y, x2 - 112, y2, k === from ? seg(u, 0.9 + i * 0.3, 1.4 + i * 0.3) : 1, ch === 'oncall-alerts' ? BAD : GOOD);
      if (k === 6) { const col = tr === 'on-deployed' ? GOOD : BAD; dot([[560, y], [x2 - 112, y2]], seg(u, 0.3 + i * 0.6, 1.0 + i * 0.6), col, 7); } });
    if (k === 6) sub(790, 160, '같은 앱도 이벤트마다 도착지가 다르다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }

  // =========== 4. I~V 가 하나의 파이프라인으로 ===========
  const ST = [['I', 'Git', '09:00'], ['II', 'Sync', '09:01'], ['III', 'App of Apps', '09:01'], ['IV', 'RBAC · SSO', '09:01'], ['V', 'Rollouts', '09:02'], ['V', '알림', '09:02']];
  const SX = (i) => 100 + i * 152, SY = 120;
  function s4(t, c) { const { k, u } = c;
    const shown = Math.min(k + 1, 6), lit = k === 6 ? 6 : k + 1;
    el('line', { x1: SX(0), y1: SY, x2: SX(0) + (SX(5) - SX(0)) * (lit - 1) / 5 + (k < 6 ? (SX(1) - SX(0)) * 0 : 0), y2: SY, stroke: ACC, 'stroke-width': 3 });
    ST.forEach(([ch, n, tm], i) => { if (i >= shown) { el('circle', { cx: SX(i), cy: SY, r: 22, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); return; }
      const fresh = i === k, s = fresh ? pop(u, 0.2) : 1;
      el('circle', { cx: SX(i), cy: SY, r: 22 * s, fill: fresh ? ACC : ACCBG, stroke: ACC, 'stroke-width': 2 });
      mono(SX(i), SY + 5, ch, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 800, fill: fresh ? PANEL : ACC, opacity: s });
      tx(SX(i), SY + 46, n, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: s });
      mono(SX(i), SY - 36, tm, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
    if (k < 6) dot([[SX(Math.max(0, k - 1)), SY], [SX(k), SY]], seg(u, 0.1, 0.8), INK, 7);
    sub(930, 70, '시각은 예시', 1, { 'text-anchor': 'end' });
    const Y = 240;
    if (k === 0) { person(140, Y + 20, '개발자', {}); grow(180, Y + 10, 290, Y + 10, seg(u, 0.4, 0.9), ACC);
      [0, 1, 2, 3].forEach((i) => { el('circle', { cx: 320 + i * 60, cy: Y + 10, r: 9, fill: i === 3 ? ACC : OFF, opacity: i === 3 ? fade(u, 1.0) : 1 }); if (i) el('line', { x1: 329 + (i - 1) * 60, y1: Y + 10, x2: 311 + i * 60, y2: Y + 10, stroke: OFF, 'stroke-width': 2.5 }); });
      mono(500, Y + 50, 'image: acme/web:a1b2c3', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      sub(500, Y + 80, 'CI가 매니페스트 리포에 커밋 · 사람 손은 여기까지', fade(u, 1.6), { 'font-weight': 700 }); }
    if (k === 1) { [['OutOfSync', WARN], ['Syncing', INFO]].forEach(([s, col], i) => pill(330 + i * 200, Y + 10, s, col, pop(u, 0.4 + i * 0.6), { fs: 15 }));
      grow(400, Y + 10, 458, Y + 10, seg(u, 0.8, 1.1), MUT);
      mono(500, Y + 64, 'automated: { prune: true, selfHeal: true }', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(500, Y + 94, 'webhook이면 바로, 없으면 기본 3분 폴링 안에 감지', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }
    if (k === 2) { el('rect', { x: 240, y: Y - 22, width: 520, height: 150, rx: 12, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.4) });
      mono(752, Y - 2, 'AppProject production', { 'font-size': 13.5, 'text-anchor': 'end', fill: INFO, 'font-weight': 700, opacity: fade(u, 1.4) });
      [['root-app', 330, Y + 30], ['apps/prd/web.yaml', 500, Y + 30], ['web-app', 670, Y + 30]].forEach(([s, x, y], i) => { card(x, y, i === 1 ? 170 : 120, 38, { text: s, fs: 13.5, mono: true, stroke: i === 2 ? ACC : INK, color: i === 2 ? ACC : INK, s: pop(u, 0.3 + i * 0.35) });
        if (i) grow(x - (i === 1 ? 145 : 145), y, x - (i === 1 ? 88 : 64), y, seg(u, 0.4 + i * 0.35, 0.7 + i * 0.35), MUT); });
      sub(500, Y + 100, '배포 대상 클러스터 · 네임스페이스를 project가 제한', fade(u, 1.8), { 'font-weight': 700 }); }
    if (k === 3) { lock(500, Y + 10, true, INK, pop(u, 0.3));
      [['SSO 그룹 frontend', GOOD, true], ['다른 그룹', BAD, false]].forEach(([s, col, ok], i) => { const x = i ? 700 : 300;
        person(x, Y + 10, null, { s: 0.7, stroke: col }); tx(x, Y + 60, s, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col, opacity: fade(u, 0.6 + i * 0.4) });
        if (ok) check(x + 40, Y - 10, 9, pop(u, 1.0)); else cross(x + 40, Y - 10, 8, pop(u, 1.4)); });
      sub(500, Y + 100, 'production project의 sync는 frontend만', fade(u, 1.8), { 'font-weight': 700 }); }
    if (k === 4) { const w = u < 0.9 ? lerp(0, 10, E(u, 0.2, 0.8)) : u < 1.8 ? lerp(10, 50, E(u, 1.2, 1.7)) : lerp(50, 100, E(u, 2.0, 2.5));
      el('rect', { x: 260, y: Y, width: 480, height: 22, rx: 6, fill: INFO, opacity: 0.8 }); el('rect', { x: 740 - 480 * w / 100, y: Y, width: 480 * w / 100, height: 22, rx: 6, fill: ACC });
      mono(740, Y + 44, 'canary ' + Math.round(w) + '%', { 'font-size': 15, 'text-anchor': 'end', 'font-weight': 800, fill: ACC });
      pill(500, Y + 80, '사이마다 AnalysisRun 판정 · 나쁘면 자동 롤백', INFO, pop(u, 1.0), { fs: 14 }); }
    if (k === 5) { slack(200, Y - 30, 280, 110, 'deploy-frontend', [{ text: 'web-app 배포 완료 (rev a1b2c3)', col: GOOD, op: fade(u, 0.6) }]);
      slack(520, Y - 30, 280, 110, 'oncall-alerts', [{ text: '실패했다면: Degraded · 롤백 중', col: BAD, op: fade(u, 1.2) }]);
      sub(500, Y + 112, '성공은 팀 채널, 장애는 당직 채널', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }
    if (k === 6) { person(SX(0), 300, '사람', {}); el('circle', { cx: SX(0), cy: 290, r: 44, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.4) });
      [1, 2, 3, 4, 5].forEach((i) => { card(SX(i), 300, 120, 40, { rx: 20, text: '자동', fs: 15, stroke: GRID, color: MUT, s: pop(u, 0.4 + i * 0.2) }); });
      tx(480, 390, '사람이 누른 것은 머지 한 번', { 'font-size': 17, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.8) }); } }

  // =========== 5. 프로덕션 체크리스트 + 관측 ===========
  const GATES = [['I~II Git · Sync', ['리포 분리', '태그 고정', 'selfHeal', 'prune + PruneLast']], ['III 앱 · 권한', ['App of Apps', 'AppProject 범위']], ['IV 보안', ['admin 끄고 SSO', '최소 권한 RBAC', '시크릿 평문 금지']], ['V 배포 · 알림', ['canary · blue-green', '자동 롤백', '메트릭 수집', '실패 · 저하 구독', '당직 채널 분리']]];
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) { GATES.forEach(([h, items], g) => { if (g > k) return; const x = 40 + g * 225, fresh = g === k;
        el('rect', { x, y: 40, width: 210, height: 46, rx: 10, fill: fresh ? ACCBG : SOFT, stroke: fresh ? ACC : GRID, 'stroke-width': 2 });
        tx(x + 105, 69, h, { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: fresh ? ACC : INK });
        items.forEach((s, i) => { const y = 120 + i * 50, on = !fresh || u > 0.4 + i * 0.35;
          el('rect', { x: x + 8, y: y - 16, width: 22, height: 22, rx: 5, fill: PANEL, stroke: on ? GOOD : GRID, 'stroke-width': 2 });
          if (on) check(x + 19, y - 5, 6, fresh ? pop(u, 0.4 + i * 0.35) : 1);
          tx(x + 40, y + 1, s, { 'font-size': 14.5, 'font-weight': 600, fill: on ? INK : MUT }); }); });
      if (k === 0) sub(480, 390, '운영에서 main을 추적하면 원치 않는 배포가 언제든 일어난다', fade(u, 2.0), { 'font-weight': 700, fill: WARN });
      if (k === 3) sub(480, 390, '네 관문을 모두 지나야 운영으로 간다', fade(u, 2.2), { 'font-weight': 700, fill: INK });
      return; }
    // k4: 상시 관측 메트릭 세 가지 (모양은 그림용 예시)
    [['argocd_app_info', 'gauge · sync_status · health_status'], ['argocd_app_sync_total', 'counter · phase'], ['argocd_app_reconcile', 'histogram · 컨트롤러 지연']].forEach(([n, d], i) => { const x = 40 + i * 300, s = fade(u, 0.2 + i * 0.4);
      el('rect', { x, y: 50, width: 280, height: 250, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.8, opacity: s });
      mono(x + 14, 78, n, { 'font-size': 14.5, 'font-weight': 800, opacity: s }); tx(x + 14, 100, d, { 'font-size': 13.5, fill: MUT, opacity: s });
      const g = E(u, 0.5 + i * 0.4, 1.4 + i * 0.4);
      if (i === 0) [['Synced', 0.8, GOOD], ['OutOfSync', 0.15, WARN], ['Degraded', 0.05, BAD]].forEach(([l, v, col], j) => { const y = 140 + j * 46;
        tx(x + 14, y + 14, l, { 'font-size': 13.5, 'font-weight': 700, opacity: s }); el('rect', { x: x + 110, y, width: 150 * v * g, height: 20, rx: 4, fill: col }); });
      if (i === 1) { const ax = { X: (v) => x + 20 + v * 24, Y: (v) => 280 - v * 14 }; line(ax, [[0, 0], [1, 1], [2, 3], [3, 4], [4, 6], [5, 7], [6, 9], [7, 10], [8, 12], [9, 13], [10, 15]], g, GOOD);
        line(ax, [[0, 0], [3, 0], [4, 1], [8, 1], [9, 2], [10, 2]], g, BAD); tx(x + 270, 150, 'Succeeded', { 'font-size': 13.5, 'text-anchor': 'end', fill: GOOD, 'font-weight': 700, opacity: g }); tx(x + 270, 255, 'Failed', { 'font-size': 13.5, 'text-anchor': 'end', fill: BAD, 'font-weight': 700, opacity: g }); }
      if (i === 2) [3, 8, 12, 7, 4, 2, 1].forEach((h, j) => el('rect', { x: x + 24 + j * 34, y: 280 - h * 11 * g, width: 28, height: h * 11 * g, rx: 3, fill: INFO, opacity: 0.75 })); });
    sub(480, 330, '그래프 모양은 그림용 예시', 1);
    tx(480, 372, '대시보드는 터지기 전 추세, 알림은 터졌을 때, 감사 로그는 누가 했는지', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // =========== 6. 알림 함정 ===========
  function s6(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { const n = k === 0 ? Math.floor(lerp(2, 9, E(u, 0.2, 2.0))) : 9, msgs = [];
      for (let i = 0; i < n; i++) { const env = ['dev', 'stg', 'prd'][i % 3], fail = i === 5;
        const drop = k === 1 && !fail && env !== 'prd';
        msgs.push({ text: fail ? `[${env}] api sync 실패` : `[${env}] app-${i} 배포 완료`, col: fail ? BAD : GOOD, op: drop ? 1 - fade(u, 0.4 + i * 0.1) * 0.85 : 1, tcol: drop ? MUT : INK }); }
      slack(60, 40, 420, 340, 'deploy', msgs, { muted: k === 0 && u > 2.0 });
      if (k === 0) { tx(560, 150, '모든 sync 성공까지 보낸다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6) });
        tx(560, 190, '실패 한 줄이 묻힌다', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
        tx(560, 230, '결국 채널을 음소거한다', { 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: fade(u, 2.0) }); }
      else { [['dev · stg는 실패만', 0.6], ['정상 알림은 prd만', 1.0], ['oncePer로 같은 리비전 중복 차단', 1.4], ['성공은 하루 한 번 요약', 1.8]].forEach(([s, at], i) => { pill(720, 120 + i * 56, s, GOOD, pop(u, at), { fs: 14 }); }); }
      return; }
    if (k === 2) { appCard(190, 150, { sync: 'Synced · Succeeded', syncCol: GOOD, health: 'Degraded', healthCol: BAD, w: 250 });
      [['on-sync-failed', 'phase in [Error, Failed]', false, 110], ['on-health-degraded', "health == 'Degraded'", true, 210]].forEach(([n, w, ok, y], i) => { const s = pop(u, 0.4 + i * 0.7);
        card(600, y, 330, 70, { rx: 10, stroke: ok ? GOOD : GRID, sw: 2, s });
        mono(450, y - 6, n, { 'font-size': 15, 'font-weight': 800, fill: ok ? GOOD : MUT, opacity: fade(u, 0.5 + i * 0.7) }); mono(450, y + 20, w, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.7) });
        if (ok) check(740, y, 10, pop(u, 1.4)); else cross(740, y, 9, pop(u, 0.8));
        grow(318, 150, 432, y, seg(u, 0.3 + i * 0.7, 0.7 + i * 0.7), ok ? GOOD : OFF, { dash: ok ? null : '5 5' }); });
      tx(480, 330, '알림이 없다고 배포가 성공한 것은 아니다', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { el('rect', { x: 120, y: 60, width: 720, height: 220, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
      mono(140, 90, 'git diff argocd-notifications-cm.yaml', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      mono(150, 130, '  service.slack: |', { 'font-size': 15 });
      el('rect', { x: 130, y: 144, width: 700, height: 30, fill: BADBG }); mono(150, 165, '-   token: xoxb-XXXX-YYYY', { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      el('rect', { x: 130, y: 182, width: 700, height: 30, fill: GOODBG, opacity: fade(u, 1.0) }); mono(150, 203, '+   token: $slack-token', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0) });
      lock(800, 198, true, GOOD, pop(u, 1.4));
      tx(480, 330, 'webhook URL도 토큰과 같은 비밀이다', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { const apps = ['web', 'api', 'pay', 'admin'], split = E(u, 1.0, 1.8);
      apps.forEach((a, i) => { const y = 80 + i * 70; card(140, y, 120, 44, { text: a, fs: 15, mono: true });
        const to = split > 0.5 ? (a === 'pay' ? [760, 330] : [760, 140]) : [760, 230];
        grow(202, y, lerp(700, to[0] - 112, 1), lerp(230, to[1], split), 1, a === 'pay' && split > 0.5 ? BAD : GRID); });
      if (split <= 0.5) card(760, 230, 220, 50, { text: '#all-alerts', fs: 15, mono: true, stroke: WARN, color: WARN });
      else { card(760, 140, 220, 50, { text: '#team 채널', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.4) }); card(760, 330, 220, 50, { text: '#oncall-alerts', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.6) }); }
      sub(480, 400, '앱마다 annotation으로 채널을 나누고, 저하만 당직으로', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    [['적게', '실패 · 저하 위주로 보낸다'], ['올바른 사람에게', '팀 채널과 당직 채널을 나눈다'], ['행동 가능하게', '링크 · 리비전 · 원인을 담는다']].forEach(([a, b], i) => { const y = 110 + i * 92, s = pop(u, 0.3 + i * 0.5);
      card(480, y, 600, 70, { rx: 14, stroke: ACC, sw: 2, s });
      mono(210, y + 8, String(i + 1), { 'font-size': 24, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.5) });
      tx(250, y + 7, a, { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.5) });
      tx(450, y + 7, b, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5 + i * 0.5) }); }); }

  const quiz = [
    { q: 'Argo CD Notifications에서 trigger와 template가 맡는 일은 무엇인가?',
      o: ['trigger는 채널, template은 토큰을 정한다', 'trigger는 언제 보낼지, template은 무엇을 보낼지 정한다', 'trigger는 sync를 시작하고, template은 롤백한다'], a: 1,
      why: 'trigger는 앱 상태에 대한 조건식이고, template은 메시지 본문이다. 어디로 보낼지는 notifier와 구독이 정한다.' },
    { q: 'oncePer: app.status.sync.revision을 trigger에 거는 이유는 무엇인가?',
      o: ['같은 리비전에 대해 같은 알림이 여러 번 가지 않게 하려고', '리비전이 바뀔 때마다 sync를 다시 하려고', '실패한 리비전을 자동으로 되돌리려고'], a: 0,
      why: '상태가 같은 채로 여러 번 평가돼도 같은 리비전이면 한 번만 보낸다. 알림 폭탄을 막는 장치다.' },
    { q: 'web-app의 health 저하만 당직 채널로 보내려면 무엇을 적는가?',
      o: ['argocd-notifications-secret에 채널 이름을 적는다', 'AppProject에 oncall 역할을 만든다', 'Application에 notifications.argoproj.io/subscribe.on-health-degraded.slack: oncall-alerts annotation을 단다'], a: 2,
      why: '구독은 subscribe.<trigger>.<notifier>: <채널> 형식의 annotation 한 줄이다. 이벤트마다 다른 채널을 줄 수 있다.' },
    { q: '09:00에 머지한 변경을 Argo CD가 1분 안에 감지하려면 무엇이 필요한가?',
      o: ['Git webhook을 Argo CD에 연결한다', '아무것도 필요 없다, 기본 폴링이 30초다', 'selfHeal을 끈다'], a: 0,
      why: '기본 저장소 폴링은 3분이다. webhook을 걸면 push 직후 바로 새로 읽어 OutOfSync를 감지한다.' },
    { q: 'argocd_app_sync_total{phase} 메트릭으로 볼 수 있는 것은 무엇인가?',
      o: ['컨트롤러가 앱 하나를 처리하는 데 걸린 시간 분포', 'phase 별 sync 횟수, 곧 sync 성공과 실패의 추세', 'Slack으로 보낸 메시지 수'], a: 1,
      why: 'sync_total은 phase 라벨이 붙은 counter다. 처리 시간은 argocd_app_reconcile 히스토그램이 보여 준다.' },
    { q: 'sync는 Succeeded 인데 파드가 죽어 Degraded다. on-sync-failed만 구독했다면 어떻게 되는가?',
      o: ['on-sync-failed가 발화해 알림이 간다', 'Argo CD가 자동으로 on-health-degraded를 켠다', 'phase 조건에 맞지 않아 알림이 오지 않는다'], a: 2,
      why: 'on-sync-failed는 phase가 Error·Failed일 때만 참이다. health 저하는 on-health-degraded를 함께 구독해야 잡힌다.' },
  ];

  const summary = [
    'Argo CD는 sync가 실패해도 UI를 열기 전까지 알리지 않아서 Notifications로 사람에게 보낸다.',
    'trigger는 언제, template은 무엇을 정하고 둘 다 argocd-notifications-cm 한 장에 적는다.',
    '구독은 Application annotation 한 줄이고, Slack 토큰은 Secret에 두고 $slack-token으로 가리킨다.',
    '실패와 저하는 즉시 당직 채널로, 성공은 짧게 요약해서 보내야 알림이 무시되지 않는다.',
  ];
  const review = [
    { q: '팀이 배포 채널을 음소거했고 그 사이 운영 sync 실패를 놓쳤다. 먼저 바꿀 것은?',
      o: ['dev·stg의 성공 알림을 끄고 실패와 저하만 즉시 보낸다', '알림 채널을 하나 더 만든다', 'oncePer를 지운다'], a: 0,
      why: '알림이 많으면 신호가 묻힌다. 발송량을 줄이고 실패·저하를 따로 보내야 채널이 다시 읽힌다.' },
    { q: '새 Slack 알림을 설정하다 실수로 token 실제 값을 ConfigMap에 넣어 커밋했다. 올바른 고침은?',
      o: ['ConfigMap을 private 리포로 옮긴다', '토큰을 새로 발급하고, cm에는 $slack-token만 두고 값은 argocd-notifications-secret에 넣는다', 'template에 토큰을 적는다'], a: 1,
      why: 'Git에 들어간 값은 이미 새었다고 본다. cm은 Secret 키를 가리키기만 하고 실제 값은 Vault·SealedSecret로 Secret에 넣는다.' },
    { q: 'canary 분석이 실패해 자동 롤백됐는데 당직이 아무 알림도 받지 못했다. 가장 먼저 확인할 것은?',
      o: ['AppProject의 destination 목록', 'argocd_app_reconcile 히스토그램', '그 앱에 on-health-degraded 구독 annotation이 있는지'], a: 2,
      why: '롤백된 Rollout은 Degraded가 되고 앱 health도 Degraded로 보인다. on-health-degraded를 당직 채널에 구독해야 그 순간이 전달된다.' },
  ];

  R.page({ title: 'Notifications와 운영 파이프라인', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
