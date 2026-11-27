/* III-2-2 Silence & Mute — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 알람 목록·억제 여부는 페이지 STEPS의 alerts(name · labels · muted · reason)를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function tagL(x, y, s, col, o) { o = o || {}; const fs = o.fs || 14, w = tw(s, fs) + 24; card(x + w / 2, y, w, fs + 14, { rx: (fs + 14) / 2, stroke: col || INK, sw: 1.8, text: s, fs, fw: 700, color: o.color || col || INK, fill: o.fill, s: o.s, op: o.op, mono: o.mono }); return w; }
  function bell(cx, cy, s, col, muted) { const g = R.G(cx, cy, s ?? 1); col = col || INK;
    el('path', { d: 'M-13,7 Q-13,-15 0,-15 Q13,-15 13,7 L17,12 H-17 Z', fill: PANEL, stroke: col, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: 0, cy: 16, r: 3.6, fill: col }, g);
    if (muted) el('line', { x1: -20, y1: -18, x2: 20, y2: 20, stroke: BAD, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g); return g; }
  function slackBox(x, y, w, h, s) { card(x + w / 2, y + h / 2, w, h, { rx: 12, stroke: INK, sw: 2, s }); tx(x + 14, y + 24, '#slack-platform', { 'font-size': 14, 'font-weight': 800, class: 'mono', opacity: s ?? 1 }); }
  // 알람 한 줄: 이름 · 라벨 · 결과 종
  function alertRow(x, y, a, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y: y - 22, width: o.w || 400, height: 44, rx: 8, fill: a.muted ? SOFT : PANEL, stroke: o.hot ? (o.hotCol || BAD) : GRID, 'stroke-width': o.hot ? 2.6 : 1.4, opacity: op });
    mono(x + 14, y + 5, a.name, { 'font-size': 15, 'font-weight': 800, fill: a.muted ? MUT : INK, opacity: op });
    mono(x + 140, y + 5, a.labels, { 'font-size': 13.5, fill: MUT, opacity: op });
    if (o.bell !== false) bell(x + (o.w || 400) - 26, y - 2, 0.8 * op, a.muted ? MUT : BAD, a.muted); }

  // ---------- 1. 억제가 없으면 ----------
  const TR = [{ n: 'Normal', x: 90, col: GOOD }, { n: 'Pending', x: 250, col: WARN }, { n: 'Firing', x: 410, col: BAD }];
  function track(k, u, lit) { TR.forEach((s, i) => { const on = lit === i; card(s.x, 70, 130, 46, { rx: 23, stroke: on ? s.col : GRID, sw: on ? 3 : 1.8, fill: on ? (i === 0 ? GOODBG : i === 1 ? WARNBG : BADBG) : PANEL });
      tx(s.x, 76, s.n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: on ? s.col : MUT }); if (i < 2) grow(s.x + 66, 70, TR[i + 1].x - 66, 70, 1, MUT); });
    grow(476, 70, 540, 70, 1, MUT);
    // 억제 게이트 자리
    card(590, 70, 90, 60, { rx: 10, stroke: GRID, sw: 2, dash: '6 5', fill: 'none' }); tx(590, 76, '억제', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 700 });
    grow(636, 70, 700, 70, 1, MUT); slackBox(705, 30, 230, 80); }
  function s1(t, c) { const { k, u } = c;
    track(k, u, k === 4 ? Math.min(2, Math.floor(E(u, 0.2, 1.4) * 3)) : null);
    // 정책 트리 (아래 왼쪽)
    const PY = 200;
    mono(40, PY - 40, 'policies:', { 'font-size': 15, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) { card(170, PY + 10, 240, 60, { rx: 10, stroke: GRID, dash: '6 5', fill: 'none', s: pop(u, 0.5) }); sub(170, PY + 16, '라우팅도 억제도 없다', fade(u, 0.9), { 'font-size': 15 });
      sub(640, 300, '억제를 말하려면 먼저 통지 경로가 있어야 한다', fade(u, 1.6), { 'font-size': 15 }); return; }
    card(170, PY + 10, 240, 64, { rx: 10, stroke: INK, sw: 2.4, s: k === 1 ? pop(u, 0.2) : 1 }); mono(62, PY + 4, '루트 → slack-platform', { 'font-size': 14, 'font-weight': 800 });
    mono(62, PY + 28, 'group_by: [alertname, team]', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 0.8) : 1 });
    if (k >= 3) { grow(290, PY + 10, 360, PY + 90, k === 3 ? E(u, 0.2, 0.7) : 1, ACC); card(470, PY + 90, 230, 56, { rx: 10, stroke: ACC, sw: 2.4, s: k === 3 ? pop(u, 0.6) : 1 });
      mono(368, PY + 84, 'team = platform', { 'font-size': 14, 'font-weight': 700, fill: ACC }); mono(368, PY + 106, '→ slack-platform', { 'font-size': 13.5 }); }
    if (k === 1) sub(640, 320, '묶어도 통지 자체는 막지 못한다', fade(u, 1.4), { 'font-size': 15 });
    if (k === 2) { el('rect', { x: 543, y: 38, width: 94, height: 64, rx: 12, fill: 'none', stroke: BAD, 'stroke-width': 2.6, opacity: fade(u, 0.3) });
      tx(590, 128, '비어 있음', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) });
      tx(560, 300, 'firing은 전부 그대로 나간다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) });
      tx(560, 330, 'mute timing은 루트가 아닌 자식 경로에만', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 4) { dot([[90, 100], [250, 100], [410, 100], [590, 100], [720, 100]], seg(u, 0.2, 2.0), BAD, 8);
      const m = E(u, 1.9, 2.3); if (m > 0) { card(820, 80, 190, 30, { rx: 6, text: 'HighCPU firing', fs: 13.5, stroke: BAD, color: BAD, s: m }); }
      card(800, 360, 260, 40, { rx: 8, text: '해소되면 resolved도 한 번 더', fs: 14.5, stroke: GOOD, color: GOOD, s: pop(u, 2.3) }); }
    if (k === 5) { const n = Math.floor(E(u, 0.2, 2.0) * 9); for (let i = 0; i < n; i++) { const real = i === 6;
        card(820, 150 + i * 28, 210, 24, { rx: 5, text: real ? 'DiskFull firing' : '배포 중 firing', fs: 13.5, stroke: real ? BAD : GRID, color: real ? BAD : MUT, fill: real ? BADBG : PANEL }); }
      tx(600, 330, '점검 소음 사이에', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(600, 356, '진짜 알람이 묻힌다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) }); } }

  // ---------- 2. Silence ----------
  function timeline(x0, w, y, win, now, o) { o = o || {}; const H = (h) => x0 + (w * (h - 12)) / 6;
    el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: MUT, 'stroke-width': 2 });
    [12, 13, 14, 15, 16, 17, 18].forEach((h) => { el('line', { x1: H(h), y1: y - 5, x2: H(h), y2: y + 5, stroke: MUT }); mono(H(h), y + 36, h + ':00', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    if (win > 0) { el('rect', { x: H(14), y: y - 18, width: (H(16) - H(14)) * win, height: 36, rx: 6, fill: INFO, opacity: 0.25 }); el('rect', { x: H(14), y: y - 18, width: (H(16) - H(14)) * win, height: 36, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 2 }); }
    if (now != null) { el('line', { x1: H(now), y1: y - 28, x2: H(now), y2: y + 10, stroke: INK, 'stroke-width': 2.6 }); el('circle', { cx: H(now), cy: y - 30, r: 5, fill: INK }); }
    return H; }
  function s2(t, c) { const { k, u } = c, al = c.beat.alerts;
    // 왼쪽: silence 본문
    card(205, 160, 370, 290, { rx: 12, stroke: INFO, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(36, 44, 'POST …/api/v2/silences', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.4) : 1 });
    mono(40, 72, '"matchers": [', { 'font-size': 14, 'font-weight': 700 });
    if (k >= 1) [['alertname', 'HighCPU'], ['team', 'platform']].forEach(([a, b], i) => tagL(58, 102 + i * 38, a + ' = ' + b, INFO, { mono: true, fs: 13.5, s: k === 1 ? pop(u, 0.2 + i * 0.4) : 1 }));
    mono(40, 178, ']', { 'font-size': 14, 'font-weight': 700 });
    if (k >= 2) { mono(40, 210, 'startsAt  14:00Z', { 'font-size': 14, opacity: k === 2 ? fade(u, 0.3) : 1 }); mono(40, 234, 'endsAt    16:00Z', { 'font-size': 14, 'font-weight': 800, opacity: k === 2 ? fade(u, 0.6) : 1 }); }
    if (k >= 3) { mono(40, 262, 'createdBy oncall@corp.io', { 'font-size': 13.5, opacity: k === 3 ? fade(u, 0.3) : 1 }); mono(40, 284, 'comment   DB 마이그레이션 · JIRA-1234', { 'font-size': 13.5, opacity: k === 3 ? fade(u, 0.6) : 1 }); }
    const RX = 430;
    if (k === 0) { sub(680, 200, 'Silence는 API로 만드는 임시 규칙', fade(u, 0.9), { 'font-size': 15 }); return; }
    if (k === 1) { alertRow(RX, 110, { name: 'HighCPU', labels: 'team=platform', muted: false }, { w: 480, bell: false });
      [['alertname ✓', 0.9], ['team ✓', 1.3]].forEach(([s, a], i) => tagL(RX + 40 + i * 150, 170, s, GOOD, { fs: 14, s: pop(u, a) }));
      sub(670, 230, '두 매처가 모두 맞아야 대상 (AND)', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 2) { timeline(RX + 20, 460, 200, E(u, 0.4, 1.4), null); tx(RX + 250, 140, '14:00–16:00 두 시간만', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) });
      sub(670, 290, '끝 시각이 곧 안전장치다', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 3) { const g = R.G(680, 180, pop(u, 0.9)); el('rect', { x: -110, y: -60, width: 220, height: 120, fill: WARNBG, stroke: WARN, 'stroke-width': 2 }, g);
      tx(0, -18, '누가 · 왜', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }, g); mono(0, 14, 'JIRA-1234', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 }, g);
      sub(680, 290, '사유가 없으면 지워도 되는지 아무도 모른다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 4 || k === 5 || k === 6) { const H = timeline(RX + 20, 460, 370, 1, k === 4 ? lerp(14.5, 16.5, E(u, 1.6, 2.6)) : 15);
      al.forEach((a, i) => { const y = 70 + i * 60; const expired = k === 4 && E(u, 1.6, 2.6) > 0.55;
        alertRow(RX, y, Object.assign({}, a, { muted: a.muted && !expired }), { w: 480, hot: true, hotCol: a.muted && !expired ? INFO : BAD }); });
      if (k === 4) { tx(RX + 20, 210, '매처 일치 → Suppressed', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) }); tx(RX + 20, 236, '매처 불일치 → 그대로 통지', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
        tx(H(16.2), 312, '16:00 만료 → 통지 재개', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 2.3) }); }
      if (k === 5) { terminal(RX, 180, 500, 120, ['$ amtool silence add alertname=HighCPU team=platform \\', '    --duration=2h --comment="점검" --author=oncall'], E(u, 0.2, 2.0) * 2, { fs: 13.5 }); }
      if (k === 6) { [['점검', 0.2], ['배포', 0.5], ['스톰 진화', 0.8]].forEach(([s, a], i) => tagL(RX + i * 120, 210, s, INFO, { fs: 15, s: pop(u, a) })); tx(RX + 380, 216, '기간은 짧게', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); } } }

  // ---------- 3. 매처 함정 ----------
  function s3(t, c) { const { k, u } = c, al = c.beat.alerts, RX = 360;
    const narrow = k >= 3, mY = narrow ? [70, 70] : [70, 70 + 70 * (al.length - 1)];
    // 매처 카드 (왼쪽)
    card(175, 110, 300, 150, { rx: 12, stroke: narrow ? INFO : BAD, sw: 2.6, s: k === 0 || k === 3 ? pop(u, 0.2) : 1 });
    tx(40, 60, narrow ? '좁은 매처' : '매처 1개', { 'font-size': 15, 'font-weight': 800, fill: narrow ? INFO : BAD });
    if (!narrow) mono(40, 100, 'team = platform', { 'font-size': 15, 'font-weight': 700 });
    else { mono(40, 100, 'alertname = HighCPU', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.4) : 1 }); mono(40, 130, 'instance = db-01:9100', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.8) : 1 }); }
    // 기간 막대
    const days = k <= 2 || k === 5 ? 7 : k === 4 ? lerp(7, 2 / 24, E(u, 0.3, 1.6)) : 2 / 24, BW = 300;
    tx(30, 240, '기간', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    el('rect', { x: 30, y: 252, width: BW, height: 22, rx: 5, fill: SOFT }); el('rect', { x: 30, y: 252, width: Math.max(4, BW * days / 7), height: 22, rx: 5, fill: days > 1 ? BAD : INFO });
    mono(30 + BW, 296, days > 1 ? Math.round(days) + '일' : '2시간', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: days > 1 ? BAD : INFO });
    if (k === 1) { card(175, 345, 300, 44, { rx: 8, fill: WARNBG, stroke: WARN, sw: 2, text: 'comment: "그냥 시끄러워서"', fs: 14, s: pop(u, 0.8) }); }
    // 오른쪽: 알람 목록 + 그물
    if (k === 5) { ['alertname은 거의 항상 넣는다', 'instance · pod로 범위를 좁힌다', 'isRegex는 신중히', '기간은 작업 시간 + 버퍼'].forEach((s, i) => { check(RX + 16, 70 + i * 56, 10, pop(u, 0.2 + i * 0.3)); tx(RX + 40, 76 + i * 56, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); });
      mono(RX + 16, 320, 'team=~".*"', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); cross(RX + 150, 314, 10, pop(u, 1.8)); tx(RX + 175, 320, '= 전부 끄기', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    al.forEach((a, i) => { const y = 70 + i * 70, s = k === 0 ? pop(u, 0.4 + i * 0.3) : 1; alertRow(RX, y, a, { w: 470, op: s, hot: !a.muted || (k === 2 && i > 0), hotCol: a.muted ? BAD : GOOD }); });
    const top = mY[0] - 32, bot = (narrow ? 70 : 70 + 70 * (al.length - 1)) + 32;
    el('rect', { x: RX - 12, y: top, width: 494, height: bot - top, rx: 12, fill: 'none', stroke: narrow ? INFO : BAD, 'stroke-width': 2.4, 'stroke-dasharray': '8 5', opacity: k === 0 ? fade(u, 1.4) : 1 });
    if (k === 2) { al.forEach((a, i) => { if (i === 0) return; tx(RX + 410, 70 + i * 70 + 5, '진짜 장애인데 침묵', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.4) }); }); }
    if (k === 0) sub(600, 300, '그 팀의 모든 알람이 대상이 된다', fade(u, 1.8), { 'font-size': 15 });
    if (k === 3) sub(600, 300, '같은 이름이라도 그 장비 하나만 조용해진다', fade(u, 1.6), { 'font-size': 15 });
    if (k === 4) sub(600, 300, '작업 시간에 버퍼만 조금 더한다', fade(u, 1.6), { 'font-size': 15 }); }

  // ---------- 4. Mute Timing 한 주 ----------
  const GX = 100, GY = 74, CW = 17.5, CH = 26, DAYS = ['월', '화', '수', '목', '금', '토', '일'];
  const wkend = (r) => r >= 5, night = (r, h) => r < 5 && (h >= 22 || h < 8);
  function week(fillU, mark, ghost) { DAYS.forEach((d, r) => { tx(GX - 14, GY + r * CH + 18, d, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: r >= 5 ? BAD : INK });
      for (let h = 0; h < 24; h++) { const i = r * 24 + h, s = clamp(fillU * 168 - i); if (s <= 0) continue; const m = mark(r, h);
        el('rect', { x: GX + h * CW, y: GY + r * CH, width: CW - 2, height: CH - 3, rx: 2, fill: m || SOFT, opacity: m ? 0.85 : s });
        if (ghost && ghost(r, h)) el('rect', { x: GX + h * CW + 1, y: GY + r * CH + 1, width: CW - 4, height: CH - 5, rx: 2, fill: 'none', stroke: BAD, 'stroke-width': 1.6, 'stroke-dasharray': '3 2' }); } });
    [0, 6, 12, 18, 24].forEach((h) => mono(GX + h * CW, GY - 10, String(h).padStart(2, '0'), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); }
  function s4(t, c) { const { k, u } = c, RX = 560;
    const mk = (r, h) => (k >= 1 && wkend(r) ? WARN : null) || (k >= 2 && night(r, h) && (k > 2 || E(u, 0.9, 1.6) > 0.5) ? INFO : null);
    // UTC로 해석하면: 22–08 UTC = 한국 07–17 시
    const ghost = k === 3 ? (r, h) => r === 0 && h >= 7 && h < 17 && fade(u, 1.0) > 0.5 : null;
    week(k === 0 ? E(u, 0.2, 2.0) : 1, mk, ghost);
    if (k === 0) { mono(RX, 60, 'muteTimes:', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) }); tagL(RX, 100, 'weekends-and-nights', INFO, { mono: true, s: pop(u, 0.8) });
      sub(750, 180, 'Silence와 달리 설정 파일에 남는다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { mono(RX, 70, '- weekdays: [saturday, sunday]', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) }); sub(750, 130, 'times를 빼면 그날 전체', fade(u, 1.0), { 'font-size': 15 }); return; }
    if (k === 2) { const x0 = RX, w = 360, H = (h) => x0 + (w * (h - 18)) / 16, g = E(u, 0.2, 0.9), sp = E(u, 0.9, 1.5);
      tx(x0, 70, '평일 22:00 → 다음 날 08:00', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: H(22) - sp * 6, y: 90, width: (H(24) - H(22)) * g, height: 26, rx: 5, fill: INFO, opacity: 0.85 }); el('rect', { x: H(24) + sp * 6, y: 90, width: (H(32) - H(24)) * clamp(g * 2 - 1), height: 26, rx: 5, fill: INFO, opacity: 0.85 });
      [[22, '22'], [24, '24|00'], [32, '08']].forEach(([h, s]) => mono(H(h), 136, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      mono(x0, 180, '22:00–24:00', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) }); mono(x0 + 160, 180, '00:00–08:00', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      sub(750, 230, '자정을 넘는 구간은 두 개로 쪼갠다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 3) { mono(RX, 70, 'location: Asia/Seoul', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
      tx(RX, 120, '빼면 UTC로 계산된다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      tx(RX, 146, '22–08 UTC = 한국 07–17시', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.3) }); tx(RX, 172, '→ 월요일 낮에 알림이 꺼진다', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.6) }); return; }
    // 정책 연결
    mono(RX, 50, 'policies:', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    card(RX + 180, 110, 340, 60, { rx: 10, stroke: WARN, sw: 2.4, s: k === 4 ? pop(u, 0.3) : 1 }); mono(RX + 22, 104, 'severity = warning', { 'font-size': 14, 'font-weight': 700, fill: WARN }); mono(RX + 22, 126, '→ slack-noncritical', { 'font-size': 13.5 });
    const linked = k > 4 || E(u, 1.0, 1.8) > 0.5;
    el('path', { d: `M${GX + 24 * CW},${GY + 90} C ${RX - 40},${GY + 90} ${RX - 20},140 ${RX + 10},140`, fill: 'none', stroke: linked ? INFO : GRID, 'stroke-width': 2.4, 'stroke-dasharray': linked ? null : '6 6' });
    tagL(RX + 20, 162, 'mute: weekends-and-nights', INFO, { mono: true, fs: 13.5, s: linked ? (k === 4 ? pop(u, 1.4) : 1) : 0 });
    if (k === 4) { tx(RX, 230, linked ? '연결해야 효과가 난다' : '정의만 하면 아무 일도 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) }); }
    if (k === 5) { card(RX + 180, 270, 340, 60, { rx: 10, stroke: BAD, sw: 2.4, s: pop(u, 0.2) }); mono(RX + 22, 264, 'severity = critical', { 'font-size': 14, 'font-weight': 700, fill: BAD }); mono(RX + 22, 286, 'mute 없음 · 항상 통지', { 'font-size': 13.5 });
      const cx = GX + 2.5 * CW, cy = GY + CH * 1 + 11; el('circle', { cx, cy, r: 8, fill: INK }); tx(cx - 6, GY - 28, '화 02:30', { 'font-size': 13.5, 'font-weight': 700 }); el('line', { x1: cx, y1: GY - 22, x2: cx, y2: cy - 8, stroke: INK, 'stroke-width': 1.5 });
      bell(RX + 360, 210, pop(u, 0.8), MUT, true); tx(RX + 330, 216, 'HighLatency', { 'font-size': 14, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.8) });
      bell(RX + 360, 360, 1 + R.bump(u, 1.4), BAD); tx(RX + 330, 366, 'ServiceDown', { 'font-size': 14, 'text-anchor': 'end', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k === 6) { el('rect', { x: RX - 10, y: 200, width: 390, height: 200, rx: 10, fill: PANEL });
      [['critical까지 mute → 야간 장애 놓침', 0.2], ['location 누락 → 9시간 어긋남', 0.6], ['end_time "24:00" = 자정', 1.0]].forEach(([s, a], i) => { const y = 230 + i * 54; (i < 2 ? cross : check)(RX + 10, y, 9, pop(u, a)); tx(RX + 32, y + 6, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a + 0.1) }); }); } }

  // ---------- 5. 만료 관리 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 1 || k === 2) { const exp = k >= 1, mv = k === 1 ? E(u, 0.8, 1.8) : exp ? 1 : 0;
      if (k === 0) terminal(30, 30, 430, 110, ['$ amtool silence query', '$ amtool silence query --expired'], E(u, 0.2, 1.4) * 2, { fs: 13.5 });
      if (k === 1) terminal(30, 30, 430, 110, ['$ amtool silence expire <id>', ['expired', 'var(--good)']], E(u, 0.2, 1.0) * 2, { fs: 13.5 });
      if (k === 2) { card(245, 85, 430, 110, { rx: 10, stroke: GRID }); tx(50, 64, 'Alerting → Silences', { 'font-size': 15, 'font-weight': 800 }); ['Active', 'Pending', 'Expired'].forEach((s, i) => pill(90 + i * 120, 108, s, i === 0 ? ACC : MUT, pop(u, 0.3 + i * 0.25), { fs: 14 })); }
      // 두 칸: Active / Expired
      [['Active', 520, ACC], ['Expired', 770, MUT]].forEach(([n, x, col]) => { zone(x - 115, 40, 230, 340, n, { fill: SOFT }); });
      const x = lerp(520, 770, mv); card(x, 130, 200, 70, { rx: 10, stroke: exp ? MUT : INFO, sw: 2.2 }); mono(x - 88, 124, 'HighCPU', { 'font-size': 15, 'font-weight': 800 }); mono(x - 88, 148, 'team=platform', { 'font-size': 13.5, fill: MUT });
      bell(245, 300, exp ? (k === 1 ? 1 + R.bump(u, 1.8) : 1) : 1, exp ? BAD : MUT, !exp);
      tx(245, 356, exp ? '통지 재개' : '아직 살아 있다 · 음소거 중', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: exp ? BAD : MUT, opacity: k === 1 ? fade(u, 1.8) : 1 });
      if (k === 1) tx(645, 250, '기간이 남아도 점검이 끝나면 바로', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) });
      if (k === 2) tx(645, 250, '주기적으로 목록을 본다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      return; }
    if (k === 3) { tx(480, 46, '운영 체크리스트', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      ['모든 silence에 endsAt (무기한 금지)', 'comment에 사유 + 티켓 번호', '점검 끝나면 즉시 expire', 'mute timing은 warning 급만', 'location(TZ) 명시 · end_time 경계 확인'].forEach((s, i) => { const y = 96 + i * 58; card(480, y, 560, 46, { rx: 23, stroke: GOOD, sw: 2, s: pop(u, 0.2 + i * 0.3) }); check(230, y, 9, pop(u, 0.3 + i * 0.3)); tx(256, y + 6, s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); }); return; }
    // k4: 비교
    const rows = c.beat.summary ? c.beat.summary.rows : [];
    tx(330, 46, 'Silence', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: INFO }); tx(680, 46, 'Mute Timing', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: WARN });
    rows.forEach((r, i) => { const y = 96 + i * 62, s = pop(u, 0.2 + i * 0.3), a = (x) => x.replace(/^Silence:\s*|^Mute:\s*/, '');
      tx(90, y + 6, r.metric, { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: s }); card(330, y, 290, 46, { rx: 10, stroke: INFO, sw: 1.8, text: a(r.before), fs: 15, s }); card(680, y, 290, 46, { rx: 10, stroke: WARN, sw: 1.8, text: a(r.after), fs: 15, s }); }); }

  const quiz = [
    { q: '억제 설정이 하나도 없을 때 계획된 DB 점검 중 HighCPU가 firing되면 어떻게 되나?',
      o: ['Grafana가 점검 중임을 알아서 통지를 미룬다', '평소처럼 slack-platform으로 통지된다', 'Pending에 머물러 통지가 나가지 않는다'], a: 1,
      why: '억제가 없으면 firing 전이마다 통지가 그대로 나간다. 그래서 점검 소음이 쌓이고 진짜 알람이 묻힌다.' },
    { q: 'alertname=HighCPU, team=platform 두 매처로 만든 silence에 걸리는 알람은 무엇인가?',
      o: ['team=platform인 모든 알람', 'HighCPU이거나 team=platform인 알람', 'HighCPU이면서 team=platform인 알람'], a: 2,
      why: '매처는 AND로 걸린다. 두 조건을 모두 만족하는 HighCPU만 Suppressed가 되고 DiskFull(team=payment)은 그대로 통지된다.' },
    { q: 'team=platform 매처 하나로 7일 silence를 걸면 생기는 일은 무엇인가?',
      o: ['점검과 무관한 OOMKilled·DiskFull까지 7일간 침묵한다', 'HighCPU만 7일간 침묵한다', '7일이 지나도 만료되지 않는다'], a: 0,
      why: '매처가 넓으면 그 팀의 모든 알람이 대상이다. 기간까지 길면 진짜 장애를 오래 못 보고 지나친다.' },
    { q: '평일 22:00부터 다음 날 08:00까지 mute하려면 times를 어떻게 적나?',
      o: ['start_time 22:00, end_time 08:00 한 구간', '22:00–24:00과 00:00–08:00 두 구간', 'start_time 08:00, end_time 22:00 한 구간'], a: 1,
      why: '한 구간은 시작이 끝보다 앞서야 해서 자정을 넘길 수 없다. 24:00은 자정을 뜻하므로 두 구간으로 쪼갠다.' },
    { q: '점검이 14:30에 끝났는데 silence가 16:00까지 남아 있다. 어떻게 하나?',
      o: ['16:00까지 그냥 둔다', 'endsAt을 하루 더 늘린다', '바로 expire해서 통지를 되살린다'], a: 2,
      why: '기간이 남았다고 놔두면 그사이 장애를 놓친다. 점검이 끝나면 amtool silence expire나 UI로 즉시 해제한다.' },
  ];
  const summary = [
    '억제가 없으면 점검 중에도 firing 통지가 그대로 나가 진짜 알람이 묻힌다.',
    'Silence는 라벨 매처와 기간으로 대상만 끄고, endsAt이 지나면 통지가 돌아온다.',
    '매처는 alertname과 instance로 좁히고, 기간은 작업 시간에 버퍼만 더한다.',
    'Mute Timing은 요일·시간대로 반복 적용하고, location과 critical 제외를 꼭 챙긴다.',
  ];
  const review = [
    { q: '야간 mute를 걸었는데 오히려 월요일 낮에 알림이 안 왔다. 먼저 확인할 것은?',
      o: ['time_intervals에 location이 빠져 UTC로 계산됐는지', 'silence 매처에 isRegex가 켜졌는지', 'group_by에 team이 있는지'], a: 0,
      why: 'location이 없으면 UTC 기준이라 22–08시가 한국 07–17시로 밀린다. 구간마다 Asia/Seoul을 적어야 한다.' },
    { q: '배포 때문에 HighCPU 알람을 두 시간 끄려고 한다. 가장 알맞은 방법은?',
      o: ['team=platform 경로에 Mute Timing을 단다', 'alertname=HighCPU와 instance 매처로 2시간짜리 Silence를 만든다', 'Alert Rule의 for를 2h로 늘린다'], a: 1,
      why: '한 번뿐인 작업은 Silence가 맞다. 매처를 좁히고 endsAt을 작업 시간에 맞추면 다른 알람은 그대로 받는다.' },
    { q: '3주 전 걸어 둔 silence 때문에 장애를 놓쳤다. 다시 안 생기게 할 습관은?',
      o: ['silence를 만들 때 comment를 비워 둔다', 'Mute Timing을 critical 경로에도 단다', 'Silences 목록을 주기적으로 보고 끝난 것은 즉시 expire한다'], a: 2,
      why: '영구 침묵은 만료를 잊어서 생긴다. 목록을 정기적으로 보고 작업이 끝난 silence를 바로 해제하면 막을 수 있다.' },
  ];

  R.page({ title: '알림 억제', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
