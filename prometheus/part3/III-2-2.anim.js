/* III-2-2 Grouping / Silence / Inhibit — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 알림 다섯 건(NodeDown·ApiDown×3·HighLatency, node-01)과 라벨은 페이지 코드의 예. cluster="c1" 과 각 알림의 도착 시각은 "예시"다.
 * group_wait 30s · group_interval 5m · repeat_interval 4h, silence 09:00~11:00(2h) 는 페이지 설정값.
 * group_by 동작은 Alertmanager 문서 기준: ['...'] 은 모든 라벨로 묶어 사실상 묶지 않고, root 에 group_by 가 없으면 알림이 한 그룹으로 모인다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, op, s) => tx(x, y, s || '예시 값', { 'font-size': 13.5, fill: MUT, opacity: op ?? 1 });
  // 알림 다섯 건 (페이지 코드의 storm 예)
  const AL = [['NodeDown', 'node-01', null, 'critical'], ['ApiDown', 'node-01', 'api', 'warning'], ['ApiDown', 'node-01', 'auth', 'warning'], ['ApiDown', 'node-01', 'cart', 'warning'], ['HighLatency', 'node-01', 'api', 'warning']];
  const atext = (a) => a[0] + (a[2] ? '{' + a[2] + '}' : '{node-01}');
  // 알림 카드 (가로 막대)
  function acard(x, y, a, o) { o = o || {}; const w = o.w || 230, col = o.muted ? OFF : a[3] === 'critical' ? BAD : WARN;
    const g = card(x + w / 2, y, w, 32, { rx: 6, stroke: col, sw: o.hot ? 3 : 1.8, fill: o.muted ? SOFT : PANEL, s: o.s, op: o.op });
    tx(-w / 2 + 12, 5, atext(a), { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: o.muted ? MUT : INK, 'text-decoration': o.muted ? 'line-through' : null }, g); return g; }
  // 봉투 (통지 1건)
  function env(cx, cy, w, h, title, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.col || ACC, 'stroke-width': 2.5 }, g);
    el('path', { d: `M${-w / 2},${-h / 2 + 4} L0,${-h / 2 + 22} L${w / 2},${-h / 2 + 4}`, fill: 'none', stroke: o.col || ACC, 'stroke-width': 2 }, g);
    if (title) tx(0, -h / 2 + 42, title, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: o.col || ACC, class: 'mono' }, g); return g; }
  // 시간 축 (라벨 배열)
  function tline(x0, x1, y, ticks, o) { o = o || {}; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: MUT, 'stroke-width': 2, opacity: o.op ?? 1 });
    ticks.forEach(([f, s]) => { const x = lerp(x0, x1, f); el('line', { x1: x, y1: y, x2: x, y2: y + 6, stroke: MUT, opacity: o.op ?? 1 }); mono(x, y + 24, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: o.op ?? 1 }); }); }

  // ---------- 1. 알림 폭주 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { server(130, 250, 'node-01', { lamp: k === 0 && u < 0.6 ? GOOD : BAD });
      if (!(k === 0 && u < 0.6)) cross(130, 250, 26, k === 0 ? pop(u, 0.6) : 1);
      ['api', 'auth', 'cart'].forEach((s, i) => card(130 + (i - 1) * 76, 150, 66, 34, { rx: 6, text: s, fs: 14, mono: true, stroke: k === 0 && u < 1.0 + i * 0.25 ? INK : BAD, color: INK }));
      AL.forEach((a, i) => { const s = k === 0 ? pop(u, 1.4 + i * 0.2) : 1; acard(330, 110 + i * 46, a, { s: k === 0 ? s : 1, w: 260 }); });
      if (k === 0) { note(330, 380, '원인은 노드 하나, firing은 다섯 건', fade(u, 2.3)); return; }
      for (let i = 0; i < 14; i++) { const x = 640 + (i % 2) * 140, y = 90 + Math.floor(i / 2) * 42, s = pop(u, 0.2 + i * 0.12);
        card(x + 60, y, 124, 32, { rx: 6, stroke: i % 5 ? WARN : BAD, sw: 1.5, s, op: 0.85 }); }
      mono(640, 400, '… 실제로는 수십 건', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { el('rect', { x: 260, y: 70, width: 440, height: 330, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
      tx(280, 96, '# alerts', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      const sc = E(u, 0.2, 2.2) * 8;
      for (let i = 0; i < 18; i++) { const y = 140 + i * 30 - sc * 30; if (y < 128 || y > 390) continue; const a = AL[(i * 3 + 1) % 5], cause = a[0] === 'NodeDown';
        el('rect', { x: 276, y: y - 12, width: 10, height: 10, rx: 2, fill: cause ? BAD : WARN });
        mono(296, y - 2, atext(a), { 'font-size': 14, fill: cause ? MUT : INK, 'font-weight': cause ? 400 : 600 }); }
      note(730, 200, '원인 NodeDown이', fade(u, 1.6), { fill: BAD }); note(730, 226, '소음에 묻힌다', fade(u, 1.8), { fill: BAD });
      sub(830, 300, '많을수록 무시하게 된다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { [['grouping', '비슷한 알림을 한 통지로', ACC], ['inhibit', '상위 장애가 하위 소음을 가린다', INFO], ['silence', '점검 중 잠시 음소거', WARN]].forEach(([a, b, col], i) => {
        const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.4); card(x, 200, 270, 150, { rx: 14, stroke: col, sw: 2.5, s });
        tx(x, 190, a, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: col, class: 'mono', opacity: fade(u, 0.4 + i * 0.4) });
        tx(x, 224, b, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
      note(170, 360, '세 가지로 한 번 가공한 뒤에야 사람에게 보낸다', fade(u, 1.9)); return; }
    // k4: 빈 route
    card(300, 200, 330, 110, { rx: 12, stroke: INK, sw: 2 }); mono(160, 180, 'route:', { 'font-size': 17, 'font-weight': 800 }); mono(160, 212, '  receiver: "slack-default"', { 'font-size': 15 });
    ['group_by ?', 'inhibit_rules ?', 'silence ?'].forEach((s, i) => card(700, 130 + i * 70, 250, 46, { rx: 10, dash: '6 5', stroke: GRID, text: s, fs: 15, color: MUT, mono: true, s: pop(u, 0.5 + i * 0.3) }));
    note(150, 360, '기본 수신자만 있다. 무엇을 묶고 가릴지는 다음 단계부터 채운다', fade(u, 1.8), { 'font-size': 14.5 }); }

  // ---------- 2. Grouping ----------
  const KEY = (a) => a[0] + ' · c1';
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { const mv = E(u, 0.6, 1.8);
      AL.forEach((a, i) => { const x0 = 40, y0 = 100 + i * 52; let tx_ = x0, ty_ = y0;
        if (k === 0) { tx_ = lerp(x0, 520, mv); ty_ = lerp(y0, 200 + (i - 2) * 30, mv); }
        else { const gi = ['NodeDown', 'ApiDown', 'HighLatency'].indexOf(a[0]), sl = AL.filter((b, j) => b[0] === a[0] && j < i).length; tx_ = lerp(x0, 540, mv); ty_ = lerp(y0, 104 + gi * 112 + sl * 26, mv); }
        if (mv < 1 || k === 1) acard(tx_, ty_, a, { w: 230, op: k === 0 && mv >= 1 ? 0 : 1 }); });
      if (k === 0) { env(650, 210, 300, 230, '그룹 키 없음', { s: pop(u, 1.7), col: WARN }); AL.forEach((a, i) => mono(520, 196 + i * 26, atext(a), { 'font-size': 14, opacity: fade(u, 1.9) }));
        note(40, 400, 'root에 group_by가 없으면 이 route의 알림이 전부 한 그룹이 된다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      ['NodeDown', 'ApiDown', 'HighLatency'].forEach((n, gi) => { const h = gi === 1 ? 100 : 52; el('rect', { x: 528, y: 84 + gi * 112, width: 254, height: h, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.9) });
        mono(800, 104 + gi * 112, n + ' · c1', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); });
      mono(40, 400, 'group_by: [alertname, cluster]  →  통지 5건이 3건으로', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.2) }); ex(800, 400, fade(u, 2.2), '예시: cluster="c1"'); return; }
    if (k === 2) { const x0 = 100, x1 = 860; tline(x0, x1, 300, [[0, '0s'], [0.25, '15s'], [0.5, '30s'], [0.75, '45s'], [1, '60s']]);
      const arr = [[0, 'ApiDown{api}'], [0.1, 'ApiDown{auth}'], [0.33, 'ApiDown{cart}']];
      arr.forEach(([f, s], i) => { const x = lerp(x0, x1, f), sc = pop(u, 0.2 + i * 0.4); el('circle', { cx: x, cy: 300, r: 7 * sc, fill: WARN }); mono(x + 4, 270 - i * 30, s, { 'font-size': 13.5, opacity: sc }); });
      const w = E(u, 0.3, 1.8); el('rect', { x: x0, y: 314 + 28, width: (lerp(x0, x1, 0.5) - x0) * w, height: 14, rx: 4, fill: ACC, opacity: 0.5 }); tx(x0, 380, 'group_wait 30s 동안 모은다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      env(lerp(x0, x1, 0.5) + 60, 140, 150, 90, '통지 1건', { s: pop(u, 2.0) }); grow(lerp(x0, x1, 0.5), 290, lerp(x0, x1, 0.5) + 30, 190, E(u, 1.8, 2.1), ACC);
      ex(760, 400, 1, '도착 시각은 예시'); return; }
    if (k === 3) { const x0 = 100, x1 = 860, F = (m) => m / 6; tline(x0, x1, 300, [[0, '0'], [F(0.5), '30s'], [F(2), '2m'], [F(5.5), '5m30s']]);
      env(lerp(x0, x1, F(0.5)), 160, 120, 80, '1차', { s: pop(u, 0.2) });
      el('circle', { cx: lerp(x0, x1, F(2)), cy: 300, r: 8 * pop(u, 0.7), fill: WARN }); mono(lerp(x0, x1, F(2)) + 6, 268, '새 멤버 합류', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.8) });
      const w = E(u, 1.0, 2.0); el('rect', { x: lerp(x0, x1, F(0.5)), y: 330, width: (lerp(x0, x1, F(5.5)) - lerp(x0, x1, F(0.5))) * w, height: 14, rx: 4, fill: INFO, opacity: 0.5 });
      tx(lerp(x0, x1, F(0.5)), 370, 'group_interval 5m', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
      env(lerp(x0, x1, F(5.5)) - 30, 160, 140, 80, '2차 (+1)', { s: pop(u, 2.1) }); return; }
    if (k === 4) { const x0 = 100, x1 = 860; tline(x0, x1, 260, [[0, '0h'], [1 / 3, '4h'], [2 / 3, '8h'], [1, '12h']]);
      el('rect', { x: x0, y: 214, width: (x1 - x0) * E(u, 0.2, 2.2), height: 20, rx: 4, fill: BAD, opacity: 0.25 }); tx(x0, 204, '계속 firing · 변화 없음', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      [0, 1 / 3, 2 / 3, 1].forEach((f, i) => env(lerp(x0, x1, f), 330, 70, 50, null, { s: pop(u, 0.3 + i * 0.6), col: i ? WARN : ACC }));
      note(100, 395, 'repeat_interval 4h: 그대로면 4시간마다 한 번만 다시 알린다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 5) { card(480, 90, 360, 46, { rx: 10, text: 'root · group_by [alertname, cluster]', fs: 14.5, mono: true });
      grow(480, 114, 300, 186, E(u, 0.2, 0.6), MUT); grow(480, 114, 680, 186, E(u, 0.2, 0.6), MUT);
      card(300, 210, 320, 46, { rx: 10, text: 'team="payments" · [alertname, service]', fs: 13.5, mono: true, stroke: ACC, s: pop(u, 0.6) });
      card(680, 210, 280, 46, { rx: 10, text: '그 밖 · 상속한 기준 그대로', fs: 14.5, stroke: GRID, s: pop(u, 0.8) });
      [['ApiDown · checkout', 0], ['ApiDown · payment', 1]].forEach(([s, i]) => env(220 + i * 170, 330, 150, 70, s, { s: pop(u, 1.4 + i * 0.3) }));
      note(560, 340, '자식에서 덮어쓰면 그 가지만 기준이 바뀐다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    // k6: 함정
    [["group_by: ['...']", '모든 라벨로 묶는다 → 사실상 안 묶음', '알림마다 통지, 폭주가 그대로'], ['root에 group_by 없음', '그룹 키가 비어 하나로 모인다', '무관한 알림까지 한 통지에']].forEach(([a, b, d], i) => {
      const y = 130 + i * 150, s = pop(u, 0.2 + i * 0.6);
      card(200, y, 320, 54, { rx: 10, text: a, fs: 16, mono: true, stroke: BAD, s });
      tx(400, y - 6, b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.6) }); tx(400, y + 20, d, { 'font-size': 14.5, fill: BAD, opacity: fade(u, 0.7 + i * 0.6) });
      for (let j = 0; j < 5; j++) { if (i === 0) env(700 + j * 46, y + 64, 38, 30, null, { s: pop(u, 0.9 + j * 0.1), col: WARN }); }
      if (i === 1) env(790, y + 64, 120, 34, null, { s: pop(u, 1.8), col: WARN }); });
    note(60, 405, '기준 라벨을 골라 적어야 묶음이 뜻을 가진다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 3. Inhibition ----------
  const IN = [['NodeDown', 'node-01', null, 'critical'], ['ApiDown', 'node-01', 'api', 'warning'], ['ApiDown', 'node-02', 'api', 'warning']];
  const itxt = (a) => a[0] + '{node="' + a[1] + '"' + (a[3] === 'warning' ? ', warning' : '') + '}';
  function icard(x, y, a, o) { o = o || {}; const w = 380, col = o.muted ? OFF : a[3] === 'critical' ? BAD : WARN;
    card(x + w / 2, y, w, 36, { rx: 6, stroke: o.hot || col, sw: o.hot ? 3 : 2, fill: o.muted ? SOFT : PANEL, s: o.s, op: o.op });
    mono(x + 12, y + 5, itxt(a), { 'font-size': 14, 'font-weight': 700, fill: o.muted ? MUT : INK, 'text-decoration': o.muted ? 'line-through' : null, opacity: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [['route', '어디로 보낼까', INFO, 260], ['inhibit_rules', '보낼까 말까', ACC, 700]].forEach(([a, b, col, x], i) => {
        card(x, 200, 340, 150, { rx: 14, stroke: col, sw: 2.5, s: pop(u, 0.2 + i * 0.5) });
        tx(x, 190, a, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', fill: col, opacity: fade(u, 0.3 + i * 0.5) });
        tx(x, 224, b, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.5) }); });
      note(170, 360, '억제 규칙은 route 트리와 따로 도는 최상위 블록이다', fade(u, 1.6)); return; }
    if (k <= 3 || k === 5 || k === 6) {
      const muted = (i) => (k === 3 || k === 5) ? i === 1 : k === 6 ? (u < 1.5 ? i > 0 : false) : false;
      IN.forEach((a, i) => { const y = 110 + i * 70;
        const hot = k === 1 && i === 0 ? BAD : k === 2 && i > 0 ? WARN : k === 6 && u >= 1.5 && i === 0 ? GOOD : null;
        icard(40, y, a, { hot, muted: muted(i) && u > (k === 3 ? 1.6 : 0), s: 1 }); });
      if (k === 1) { card(700, 140, 260, 60, { rx: 10, text: 'source: NodeDown', fs: 16, mono: true, stroke: BAD, s: pop(u, 0.3) });
        const on = u > 1.2; el('rect', { x: 640, y: 210, width: 64, height: 32, rx: 16, fill: on ? BAD : OFF }); el('circle', { cx: on ? 688 : 656, cy: 226, r: 12, fill: PANEL });
        tx(720, 232, on ? '억제 켜짐' : '꺼짐', { 'font-size': 15, 'font-weight': 800, fill: on ? BAD : MUT });
        note(560, 330, 'source가 firing인 동안에만 억제가 돈다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
      if (k === 2) { card(700, 140, 280, 60, { rx: 10, text: 'target: severity="warning"', fs: 15, mono: true, stroke: WARN, s: pop(u, 0.3) });
        note(560, 260, '숨김 후보: warning 두 건', fade(u, 1.0), { fill: WARN }); note(560, 292, 'critical은 대상이 아니다', fade(u, 1.4), { 'font-size': 14.5 }); return; }
      if (k === 3) { card(700, 140, 200, 60, { rx: 10, text: 'equal: [node]', fs: 16, mono: true, stroke: ACC, s: pop(u, 0.2) });
        [[1, true], [2, false]].forEach(([i, same], j) => { const y = 110 + i * 70; const s = pop(u, 0.8 + j * 0.4);
          (same ? check : cross)(450, y, 10, s); tx(468, y + 5, same ? 'node 같음 → 숨김' : 'node 다름 → 통지', { 'font-size': 14.5, 'font-weight': 700, fill: same ? MUT : GOOD, opacity: s }); });
        el('path', { d: 'M260,110 C320,140 320,150 260,180', fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 0.6) });
        note(560, 330, 'equal 라벨 값이 같을 때만 억제가 성립한다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
      if (k === 5) { env(760, 150, 220, 90, 'NodeDown{node-01}', { col: BAD, s: pop(u, 0.4) }); env(760, 280, 220, 90, 'ApiDown{node-02}', { col: WARN, s: pop(u, 0.8) });
        tx(560, 380, '통지되는 것은 두 건, node-01의 ApiDown은 숨는다', { 'font-size': 14.5, 'font-weight': 600, opacity: fade(u, 1.4) }); return; }
      // k6: 함정 두 가지
      if (u < 1.5) {
        card(700, 160, 260, 60, { rx: 10, text: 'equal을 빼면', fs: 16, stroke: BAD, s: pop(u, 0.2) }); note(560, 260, 'node-02까지 숨는다 (과잉 억제)', fade(u, 0.6), { fill: BAD }); return; }
      card(700, 160, 260, 60, { rx: 10, text: 'NodeDown resolved', fs: 16, mono: true, stroke: GOOD, s: pop(u, 1.5) });
      note(560, 260, 'source가 꺼지면 숨었던 알림이 다시 통지된다', fade(u, 1.7), { fill: WARN, 'font-size': 14.5 }); return; }
    // k4: critical 이 warning 을 덮는다
    [['HighLatency{instance="i-1", critical}', BAD, false], ['HighLatency{instance="i-1", warning}', WARN, true], ['HighLatency{instance="i-2", warning}', WARN, false]].forEach(([s, col, hid], i) => {
      const y = 110 + i * 70, m = hid && u > 1.4; card(250, y, 420, 36, { rx: 6, stroke: m ? OFF : col, fill: m ? SOFT : PANEL, s: pop(u, 0.2 + i * 0.2) });
      mono(52, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: m ? MUT : INK, 'text-decoration': m ? 'line-through' : null }); });
    card(760, 150, 300, 90, { rx: 10, stroke: ACC, s: pop(u, 0.6) }); mono(624, 140, 'source: critical', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 0.7) }); mono(624, 164, 'target: warning', { 'font-size': 14.5, fill: WARN, opacity: fade(u, 0.8) }); mono(624, 188, 'equal: [alertname, instance]', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.9) });
    note(40, 360, '같은 대상의 critical이 켜지면 warning은 중복이라 숨긴다', fade(u, 1.8), { 'font-size': 14.5 }); ex(40, 400, 1, '인스턴스 이름은 예시'); }

  // ---------- 4. Silence ----------
  const X0 = 120, X1 = 880, TX = (h) => lerp(X0, X1, (h - 8) / 6);   // 08:00 ~ 14:00
  const TT = [[0, '08:00'], [1 / 6, '09:00'], [2 / 6, '10:00'], [3 / 6, '11:00'], [4 / 6, '12:00'], [5 / 6, '13:00'], [1, '14:00']];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['amtool', 160], ['웹 UI', 230], ['API', 300]].forEach(([s, y], i) => { card(180, y, 160, 46, { rx: 10, text: s, fs: 16, mono: i !== 1, s: pop(u, 0.2 + i * 0.25) }); grow(262, y, 560, 230, E(u, 0.8 + i * 0.2, 1.3 + i * 0.2), ACC); });
      card(660, 230, 190, 70, { rx: 10, text: 'Alertmanager', fs: 16 });
      card(660, 110, 230, 44, { rx: 8, text: 'alertmanager.yml', fs: 15, mono: true, stroke: GRID, color: MUT }); cross(800, 110, 10, pop(u, 1.4));
      note(470, 360, '설정 파일이 아니라 돌아가는 중에 만들고 지운다. 재시작 없음', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    tline(X0, X1, 330, TT);
    const endH = k === 4 ? lerp(11, 9.75, E(u, 0.6, 1.4)) : k === 6 ? lerp(11, 14, E(u, 0.3, 1.4)) : 11;
    if (k >= 2) { const w = k === 2 ? E(u, 0.2, 1.4) : 1; el('rect', { x: TX(9), y: 280, width: (TX(endH) - TX(9)) * w, height: 34, rx: 6, fill: WARN, opacity: 0.3 });
      mono(TX(9) + 8, 302, k === 4 && u > 1.4 ? 'expire' : k === 6 ? 'endsAt을 넉넉히' : '2h', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: k === 2 ? fade(u, 1.2) : 1 }); }
    const M = ['alertname="ApiDown"', 'service="cart"'];
    if (k <= 3) M.forEach((s, i) => card(140 + i * 200 + (i ? 30 : 0), 80, tw(s, 14) + 24, 32, { rx: 16, text: s, fs: 14, mono: true, stroke: WARN, s: k === 1 ? pop(u, 0.2 + i * 0.3) : 1 }));
    if (k === 1) { [['ApiDown{cart}', true], ['ApiDown{auth}', false], ['HighLatency{cart}', false]].forEach(([s, m], i) => { const y = 150 + i * 42, sc = pop(u, 0.9 + i * 0.25);
        card(240, y, 220, 34, { rx: 6, text: s, fs: 14, mono: true, stroke: m ? OFF : WARN, color: m ? MUT : INK, s: sc }); tx(370, y + 5, m ? '음소거' : '그대로 통지', { 'font-size': 14.5, 'font-weight': 700, fill: m ? MUT : GOOD, opacity: sc }); });
      note(560, 200, '두 matcher가 모두 맞는 알림만', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { [['--duration="2h"', 0], ['--comment="cart 배포 점검 (JIRA-1234)"', 1], ['--author="hoyoung"', 2]].forEach(([s, i]) => mono(560, 140 + i * 30, s, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.3), 'text-anchor': 'middle' }));
      sub(480, 250, '누가 왜 껐는지 나중에 추적된다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3) { terminal(380, 120, 540, 130, ['$ amtool silence query', 'ID   Matchers                  Ends At', '3f2…  alertname="ApiDown" service="cart"  11:00'], lerp(0, 3, E(u, 0.2, 1.6)), { title: 'bash', fs: 13.5 });
      ex(380, 268, fade(u, 1.6), 'ID와 출력 줄은 예시'); return; }
    if (k === 4) { el('line', { x1: TX(9.75), y1: 260, x2: TX(9.75), y2: 340, stroke: INK, 'stroke-width': 2.5 }); mono(TX(9.75), 252, '지금 09:45', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' });
      mono(300, 140, 'amtool silence expire <SILENCE_ID>', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      note(300, 190, '실수로 만든 silence는 만료를 기다리지 않고 바로 끝낸다', fade(u, 1.5), { 'font-size': 14.5 }); return; }
    if (k === 5) { const J = [['"matchers": [{ "name": "service", "value": "cart",', 0], ['               "isRegex": false }],', 0], ['"startsAt": "2026-08-11T09:00:00Z",', 1], ['"endsAt":   "2026-08-11T11:00:00Z"', 2]];
      J.forEach(([s, w], i) => mono(130, 110 + i * 30, s, { 'font-size': 14, 'font-weight': w ? 800 : 500, fill: w === 1 ? ACC : w === 2 ? BAD : INK, opacity: fade(u, 0.2 + i * 0.3) }));
      grow(TX(9), 236, TX(9), 276, E(u, 1.2, 1.6), ACC); grow(TX(11), 236, TX(11), 276, E(u, 1.5, 1.9), BAD);
      sub(560, 236, '시각은 UTC', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k6
    el('circle', { cx: TX(12.5), cy: 330, r: 10 * pop(u, 1.5), fill: BAD }); mono(TX(12.5), 260, '12:30 실제 장애', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
    if (u > 1.9) { cross(TX(12.5), 230, 10, pop(u, 1.9)); }
    mono(TX(10.5), 230, '점검은 11:00에 끝남', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    note(120, 120, '점검이 끝난 뒤의 진짜 장애까지 묵살된다', fade(u, 2.0), { fill: BAD }); note(120, 150, '짧게 잡고 필요하면 늘린다', fade(u, 2.3), { 'font-size': 14.5 }); ex(760, 120, 1, '장애 시각은 예시'); }

  // ---------- 5. 라이프사이클 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['group_wait 30s', '첫 통지 전 모으기', ACC], ['group_interval 5m', '새 멤버는 이 간격으로', INFO], ['repeat_interval 4h', '그대로면 이 간격으로 다시', WARN]].forEach(([a, b, col], i) => {
        const y = 120 + i * 90, sc = pop(u, 0.2 + i * 0.4); card(260, y, 330, 60, { rx: 10, text: a, fs: 17, mono: true, stroke: col, s: sc }); tx(460, y + 6, b, { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.4) }); });
      sub(480, 400, '통지 리듬은 route의 이 세 값으로 정해진다', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k <= 3) { el('rect', { x: 500, y: 80, width: 420, height: 310, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2 }); mono(520, 108, '# alerts', { 'font-size': 15, 'font-weight': 800 });
      card(220, 150, 300, 50, { rx: 10, text: 'receiver: slack-default', fs: 15, mono: true, s: k === 1 ? pop(u, 0.2) : 1 }); grow(372, 150, 496, 150, k === 1 ? E(u, 0.6, 1.1) : 1, ACC);
      if (k >= 2) { const on = !(k === 2 && u < 1.0); el('rect', { x: 120, y: 236, width: 64, height: 32, rx: 16, fill: on ? GOOD : OFF }); el('circle', { cx: on ? 168 : 136, cy: 252, r: 12, fill: PANEL });
        mono(200, 258, 'send_resolved: ' + (on ? 'true' : 'false'), { 'font-size': 15, 'font-weight': 800 }); if (k === 2) sub(260, 300, 'slack_configs 기본값은 false', fade(u, 1.3), { 'font-size': 14 }); }
      const msg = k >= 3 ? [['[FIRING] ApiDown', BAD, 'title ← .CommonLabels.alertname'], ['cart API 응답 없음', INK, 'text ← .CommonAnnotations.summary']] : [['[FIRING] …', BAD]];
      msg.forEach(([s, col, d], i) => { mono(520, 150 + i * 32, s, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: k >= 3 ? fade(u, 0.3 + i * 0.4) : 1 }); if (d && k === 3) tx(110, 330 + i * 28, d, { 'font-size': 14, class: 'mono', fill: MUT, opacity: fade(u, 0.5 + i * 0.4) }); });
      if (k >= 2 && !(k === 2 && u < 1.6)) mono(520, 250, '[RESOLVED] …', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: k === 2 ? fade(u, 1.6) : 1 });
      if (k === 3) ex(520, 375, 1, '메시지 문구는 예시');
      return; }
    if (k === 4) { const S = [['inactive', OFF], ['pending', WARN], ['firing', BAD], ['resolved', GOOD]];
      S.forEach(([s, col], i) => { const x = 140 + i * 230, sc = pop(u, 0.2 + i * 0.35); card(x, 190, 170, 60, { rx: 30, text: s, fs: 17, mono: true, stroke: col, color: col === OFF ? MUT : col, s: sc });
        if (i < 3) grow(x + 88, 190, x + 142, 190, E(u, 0.4 + i * 0.35, 0.7 + i * 0.35), MUT); });
      tx(370, 150, 'for', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      el('rect', { x: 515, y: 240, width: 400, height: 8, rx: 4, fill: ACC, opacity: fade(u, 1.6) }); tx(515, 278, '통지는 firing부터', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7) }); return; }
    if (k === 5) { const x0 = 100, x1 = 880; tline(x0, x1, 300, [[0, '0'], [1 / 3, '4h'], [2 / 3, '8h'], [0.83, '10h']]);
      el('rect', { x: x0, y: 250, width: (lerp(x0, x1, 0.83) - x0) * E(u, 0.2, 2.0), height: 22, rx: 4, fill: BAD, opacity: 0.25 }); tx(x0, 240, 'firing', { 'font-size': 14, 'font-weight': 800, fill: BAD });
      [0, 1 / 3, 2 / 3].forEach((f, i) => env(lerp(x0, x1, f) + 10, 160, 80, 56, null, { col: BAD, s: pop(u, 0.3 + i * 0.5) }));
      env(lerp(x0, x1, 0.83) + 10, 160, 90, 56, null, { col: GOOD, s: pop(u, 2.0) }); mono(lerp(x0, x1, 0.83) + 10, 116, 'resolved', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      note(100, 380, 'firing은 주기마다 다시, resolved는 한 번', fade(u, 2.2)); ex(760, 380, 1, '해제 시각은 예시'); return; }
    // k6: 깔때기
    const F = [['firing 알림', 5, BAD], ['grouping 뒤 통지', 3, ACC], ['inhibit 뒤 통지', 1, INFO]];
    F.forEach(([s, n, col], i) => { const y = 120 + i * 80; tx(100, y + 20, s, { 'font-size': 16, 'font-weight': 700 }); R.hbar(330, y, 420, n, 5, { col, text: n + '건', h: 28, u: E(u, 0.2 + i * 0.5, 0.9 + i * 0.5) }); });
    note(100, 380, 'silence는 사람이 잠재우고, repeat는 잊지 않게 다시 알린다', fade(u, 2.0), { 'font-size': 14.5 }); ex(760, 100, 1, '이 장의 node-01 예로 셈'); }

  const quiz = [
    { q: 'node-01 하나가 죽었는데 슬랙이 도배되는 이유는 무엇인가?',
      o: ['노드 위 서비스 알림이 한꺼번에 firing 되고 그대로 통지되어서', 'Prometheus가 같은 알림을 여러 번 보내서', 'Alertmanager가 꺼져 있어서'], a: 0,
      why: '원인은 하나지만 그 위의 ApiDown, HighLatency까지 동시에 firing 된다. 가공 없이 보내면 원인 NodeDown이 묻힌다.' },
    { q: 'group_by: [alertname, cluster]일 때 한 통지로 묶이는 알림은 무엇인가?',
      o: ['severity가 같은 알림', 'alertname과 cluster 값이 둘 다 같은 알림', '같은 시각에 도착한 알림'], a: 1,
      why: 'group_by에 적은 라벨 값이 모두 같아야 같은 그룹이다. ApiDown 세 건은 한 통지, NodeDown과 HighLatency는 따로 간다.' },
    { q: 'NodeDown{node="node-01"}이 firing일 때 ApiDown{node="node-02", warning}이 통지되는 이유는 무엇인가?',
      o: ['severity가 warning이 아니라서', 'equal: [node]의 node 값이 달라서', 'source가 resolved 되어서'], a: 1,
      why: '억제는 equal 라벨 값이 source와 같을 때만 성립한다. node-02는 무관한 장애이므로 그대로 통지된다.' },
    { q: 'silence를 만들 때 가장 흔한 실수는 무엇인가?',
      o: ['matcher를 두 개 이상 쓰는 것', 'comment를 남기는 것', 'endsAt을 넉넉히 잡아 점검 뒤 실제 장애까지 묵살하는 것'], a: 2,
      why: 'silence는 endsAt까지 매칭 알림을 모두 끈다. 짧게 잡고 필요하면 늘리며, 잘못 만든 것은 expire로 바로 끝낸다.' },
    { q: 'slack_configs에 send_resolved를 적지 않으면 어떻게 되나?',
      o: ['해제됨 통지가 오지 않는다', 'firing 통지도 오지 않는다', '4시간마다 해제 통지가 온다'], a: 0,
      why: 'Slack 설정의 send_resolved 기본값은 false다. true로 켜야 알림이 끝났을 때 RESOLVED 메시지가 온다.' },
  ];

  const summary = [
    '노드 하나가 죽으면 그 위 서비스 알림이 한꺼번에 울려 원인 알림이 소음에 묻힌다.',
    'group_by 라벨 값이 같은 알림은 한 통지로 묶이고 group_wait 30초 동안 모아서 보낸다.',
    'inhibit은 상위 장애가 firing인 동안 equal 라벨이 같은 하위 알림을 숨긴다.',
    'silence는 점검 동안만 짧게 끄고, firing은 4시간마다 다시, 해제는 send_resolved로 알린다.',
  ];
  const review = [
    { q: '스위치 장애 때 통지가 수십 건 그대로 왔다. 설정을 보니 group_by: [\'...\'] 였다. 원인은?',
      o: ['모든 라벨로 묶어 사실상 알림마다 다른 그룹이 됐다', 'group_wait이 30초라서', 'inhibit의 equal이 빠져서'], a: 0,
      why: "'...'은 모든 라벨을 그룹 키로 써서 묶지 않는 것과 같다. alertname, cluster처럼 기준 라벨을 골라 적어야 한다." },
    { q: '노드 장애 동안 다른 노드의 ApiDown까지 통지가 안 왔다. 먼저 볼 곳은?',
      o: ['silence의 author', 'inhibit_rules에 equal: [node]가 빠졌는지', 'repeat_interval'], a: 1,
      why: 'equal이 없으면 노드가 달라도 source가 켜진 동안 target이 모두 숨는다. 과잉 억제는 equal 라벨부터 확인한다.' },
    { q: '배포 점검용 silence를 하루짜리로 걸어 두었더니 저녁 장애 알림이 오지 않았다. 다음부터 할 일은?',
      o: ['silence 대신 inhibit 규칙을 영구로 둔다', 'group_by를 비운다', '점검 시간만큼 짧게 걸고 끝나면 expire 한다'], a: 2,
      why: 'silence는 endsAt까지 매칭 알림을 모두 끈다. 기간을 점검에 맞추고 amtool silence query로 남은 것을 확인한다.' },
  ];

  R.page({ title: '알림 가공 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
