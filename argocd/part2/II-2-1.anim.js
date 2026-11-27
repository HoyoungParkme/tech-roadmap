/* II-2-1 sync wave — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림: wave 칸(0·1·2)에 리소스 카드가 들어가고, 앞 칸이 모두 Healthy(초록)가 되어야 다음 칸이 움직인다.
 * hook 장면은 위에 phase 띠(PreSync · Sync · PostSync, 아래로 SyncFail)를 깐다.
 * 순서는 공식 규칙(phase → wave → kind → name)을 python 으로 재현한 결과와 같다:
 *   wave 없음: Deployment/api, StatefulSet/postgres, Job/db-migration 이 wave 0 에서 한 번에
 *   hook 포함: PreSync db-migration → Sync wave 0 postgres → wave 2 api·web → PostSync smoke-test */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, snippet, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const ST = { pending: [GRID, PANEL, MUT], syncing: [INFO, INFOBG, INFO], healthy: [GOOD, GOODBG, GOOD], failed: [BAD, BADBG, BAD] };
  // 리소스 카드: 상태 표시(점 셋 = 진행 중, ✓, ✕)
  function res(cx, cy, name, st, o) { o = o || {}; const [sc, bg, tc] = ST[st] || ST.pending, w = o.w || 230, s = o.s ?? 1;
    if (s <= 0.02) return; card(cx, cy, w, 44, { rx: 9, stroke: sc, sw: st === 'pending' ? 1.6 : 2.4, fill: bg, s, dash: st === 'pending' ? '5 4' : null, op: o.op });
    if (s < 0.6) return; mono(cx - w / 2 + 14, cy + 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: st === 'pending' ? MUT : INK, opacity: o.op ?? 1 });
    const ix = cx + w / 2 - 20;
    if (st === 'healthy') check(ix, cy, 8); else if (st === 'failed') cross(ix, cy, 7);
    else if (st === 'syncing') for (let i = 0; i < 3; i++) el('circle', { cx: ix - 14 + i * 9, cy, r: 3, fill: INFO, opacity: 0.3 + 0.7 * ((Math.floor((o.t || 0) * 4) + i) % 3 === 0 ? 1 : 0) }); }
  // wave 칸: 가운데 x, 머리 pill
  function lane(cx, wave, st, o) { o = o || {}; const [sc] = ST[st] || ST.pending, w = o.w || 270, h = o.h || 220, y = o.y || 130;
    el('rect', { x: cx - w / 2, y, width: w, height: h, rx: 14, fill: SOFT, stroke: st === 'pending' ? 'none' : sc, 'stroke-width': 2, opacity: o.op ?? 1 });
    pill(cx, y, `wave ${wave}`, st === 'pending' ? MUT : sc, o.s ?? 1, { mono: true, fs: 15, fill: PANEL }); }
  const X3 = [175, 480, 785];
  const stOf = (b, name) => { for (const w of (b && b.waves) || []) for (const r of w.resources) if (r.name.startsWith(name)) return r.status; return 'pending'; };
  const flowArrow = (x1, x2, y, u, col, label) => { grow(x1, y, x2, y, u, col || GOOD); if (label) sub((x1 + x2) / 2, y - 12, label, u > 0.9 ? 1 : 0, { fill: col || GOOD, 'font-weight': 700 }); };

  // ---------- 1. 왜 sync wave ----------
  const STACK = [['postgres', 'StatefulSet · DB'], ['db-migration', 'Job · 스키마'], ['api', 'Deployment · 앱']];
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    if (k === 3) {   // 한 칸이 세 칸으로 쪼개진다
      const f = E(u, 0.3, 1.6);
      X3.forEach((x, i) => lane(lerp(480, x, f), i, 'pending', { w: lerp(i === 1 ? 300 : 0, 270, f), op: i === 1 ? 1 : f, s: i === 1 ? 1 : pop(u, 1.3) }));
      STACK.forEach(([n], i) => res(lerp(480, X3[i], f), lerp(210 + i * 56, 230, f), n, 'pending', { w: 220 }));
      ['"0"', '"1"', '"2"'].forEach((v, i) => mono(X3[i], 300, `sync-wave: ${v}`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6 + i * 0.2) }));
      return; }
    if (k === 4) {
      X3.forEach((x, i) => lane(x, i, i === 0 ? 'healthy' : i === 1 ? 'syncing' : 'pending'));
      STACK.forEach(([n], i) => res(X3[i], 230, n, i === 0 ? (u > 0.6 ? 'healthy' : 'syncing') : i === 1 ? (u > 1.3 ? 'syncing' : 'pending') : 'pending', { w: 220, t }));
      flowArrow(310, 345, 230, E(u, 0.8, 1.2), GOOD); grow(615, 230, 650, 230, 1, GRID);
      tx(480, 390, '앞 wave가 모두 Healthy가 된 뒤에야 다음 wave', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      return; }
    lane(480, 0, k === 0 ? 'pending' : 'syncing', { w: 360, h: 240 });
    STACK.forEach(([n, d], i) => { const y = 200 + i * 60;
      let st = 'pending';
      if (k === 1) st = i === 0 ? 'syncing' : 'pending';
      if (k === 2 || k === 5) st = i === 0 ? 'syncing' : (k === 2 ? (u > 0.8 + i * 0.4 ? 'failed' : 'syncing') : 'failed');
      res(480, y, n, st, { w: 300, t, s: k === 0 ? pop(u, 0.4) : 1 });
      tx(650, y + 5, d, { 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 0.8) : 1 }); });
    if (k === 0) {   // kind 순으로 한 번에
      ['Deployment/api', 'StatefulSet/postgres', 'Job/db-migration'].forEach((s, i) => { mono(60, 140 + i * 30, `${i + 1}. ${s}`, { 'font-size': 14.5, opacity: fade(u, 1.2 + i * 0.15), fill: INK }); });
      tx(60, 110, 'apply 순서 (kind 순)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.1) });
      tx(480, 400, '세 개가 한 번에 들어가고, 앞 것이 Ready 될 때까지 기다리지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      return; }
    if (k === 1) { [0, 1].forEach((i) => { const y = 200 + i * 60; el('path', { d: `M310,${y + 4} C260,${y + 20} 260,${y + 44} 310,${y + 56}`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': `${120 * E(u, 0.4 + i * 0.5, 0.9 + i * 0.5)} 200` }); });
      tx(230, 262, '먼저 있어야 함', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      tx(480, 400, 'DB → 마이그레이션 → 앱 순서로만 성립한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { const rs = Math.floor(lerp(0, 4, E(u, 1.2, 2.6)));
      pill(480, 368, `api: CrashLoopBackOff · 재시작 ${rs}`, BAD, pop(u, 1.2), { mono: true, fs: 13.5 });
      tx(480, 408, 'DB가 Ready 되기 전에 앱과 마이그레이션이 붙어 실패', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    // k5: 기초 없이 골조
    [['기초', 0], ['골조', 1], ['인테리어', 2]].forEach(([n, w], i) => { const tilt = i ? E(u, 0.8, 1.6) * (i === 1 ? -8 : 12) : 0;
      el('rect', { x: 760, y: 150 - i * 52, width: 140, height: 34, rx: 4, fill: i ? BADBG : SOFT, stroke: i ? BAD : MUT, 'stroke-width': 2, transform: `rotate(${tilt} 830 ${167 - i * 52})`, opacity: fade(u, 0.2 + i * 0.2) });
      tx(830, 172 - i * 52, `${n} (${w})`, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, transform: `rotate(${tilt} 830 ${167 - i * 52})`, opacity: fade(u, 0.2 + i * 0.2) }); });
    tx(480, 400, '지금 매니페스트에는 wave가 없다 · 기초가 굳기 전에 올린 골조', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); }

  // ---------- 2. sync-wave annotation ----------
  const ANN = [['postgres', 'StatefulSet', '"0"'], ['db-migration', 'Job', '"1"'], ['api', 'Deployment', '"2"'], ['web', 'Deployment', '"2"']];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) {   // 수직선 위 정렬
      const x0 = 120, step = 180; el('line', { x1: 80, y1: 220, x2: 880, y2: 220, stroke: MUT, 'stroke-width': 2 });
      ['-2', '-1', '0', '1', '2'].forEach((v, i) => { const x = x0 + i * step, s = pop(u, 0.2 + i * 0.2); el('circle', { cx: x, cy: 220, r: 8 * s, fill: v === '0' ? ACC : PANEL, stroke: v === '0' ? ACC : INK, 'stroke-width': 2 });
        mono(x, 260, `"${v}"`, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: s }); });
      grow(120, 170, 840, 170, E(u, 1.2, 2.2), ACC); tx(480, 150, '낮은 값부터 먼저', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      tx(480, 320, '값을 안 주면 "0" · 음수는 CRD처럼 먼저 깔 것에', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 2.0) });
      mono(480, 360, 'argocd.argoproj.io/sync-wave: "0"', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 5) {
      [['미지정 = "0"', ACC], ['오름차순: -2, -1, 0, 1, 2', ACC], ['같은 wave = 병렬', WARN], ['다음 wave는 앞 wave가 모두 Healthy일 때', GOOD]].forEach(([s, col], i) => {
        const y = 80 + i * 74, sc = pop(u, 0.2 + i * 0.4); card(480, y, 640, 56, { rx: 28, stroke: col, sw: 2.2, s: sc }); if (sc > 0.5) tx(480, y + 6, s, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700 }); });
      return; }
    // k1..k4: 리소스마다 annotation 을 붙여 칸에 넣는다
    const upto = k;   // 1: postgres, 2: +Job, 3: +api, 4: +web
    const wst = (w) => (w === 0 ? (k >= 2 ? 'healthy' : 'syncing') : w === 1 ? (k >= 3 ? 'syncing' : k === 2 ? 'pending' : 'pending') : 'pending');
    [0, 1, 2].forEach((w) => { if (w > Math.min(2, upto - 1) && !(w === 2 && upto >= 3)) return; lane(X3[w], w, wst(w), { y: 150, h: 210, s: (w === upto - 1 || (w === 2 && upto === 3)) ? pop(u, 0.2) : 1 }); });
    ANN.slice(0, upto).forEach(([n, kind, v], i) => { const w = +v[1], fresh = i === upto - 1, yy = w === 2 ? 220 + (n === 'web' ? 60 : 0) : 220;
      const st = w === 0 ? (k >= 2 ? 'healthy' : 'syncing') : w === 1 ? (k >= 3 ? 'syncing' : 'pending') : 'pending';
      if (fresh) fly(170, 70, X3[w], yy, seg(u, 0.4, 1.2), `${n} · sync-wave ${v}`, { mono: true });
      res(X3[w], yy, n, fresh && u < 1.2 ? 'pending' : st, { s: fresh ? pop(u, 1.1) : 1, t }); });
    const [n, kind, v] = ANN[upto - 1];
    snippet(40, 20, [`kind: ${kind}`, `name: ${n}`, `argocd.argoproj.io/sync-wave: ${v}`], { fs: 14, op: fade(u, 0.1) });
    if (k === 4) { dot([[X3[2] - 100, 400], [X3[2] - 100, 300]], seg(u, 1.4, 2.2), INFO, 6); dot([[X3[2] + 100, 400], [X3[2] + 100, 300]], seg(u, 1.4, 2.2), INFO, 6);
      tx(X3[2], 400, 'api · web 동시에', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); } }

  // ---------- 3. sync hook ----------
  const PH = [['PreSync', 160, ACC], ['Sync', 480, INFO], ['PostSync', 800, GOOD]];
  function band(o) { o = o || {};
    PH.forEach(([n, x, col], i) => { const s = o.s ? o.s(i) : 1; el('rect', { x: x - 150, y: 40, width: 300, height: 46, rx: 10, fill: PANEL, stroke: col, 'stroke-width': o.hot === i ? 3.2 : 2, opacity: s * (o.dim && o.dim(i) ? 0.35 : 1) });
      tx(x, 70, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: s * (o.dim && o.dim(i) ? 0.35 : 1) });
      if (i < 2) grow(x + 152, 63, x + 168, 63, s, MUT); });
    if (o.fail) { el('rect', { x: 330, y: 352, width: 300, height: 46, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: o.fail });
      tx(480, 382, 'SyncFail · 실패했을 때만', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: o.fail }); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { band({ s: (i) => pop(u, 0.2 + i * 0.4) });
      tx(480, 160, 'wave = 리소스를 줄 세우는 순서', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(480, 194, 'hook = sync 생명주기의 특정 시점에 끼우는 작업', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      res(480, 270, 'postgres', 'healthy', { s: pop(u, 2.0) }); sub(480, 310, '이전 sync로 이미 떠 있음', fade(u, 2.2)); return; }
    if (k === 1) { band({ hot: 0 }); res(160, 160, 'db-migration', 'pending', { s: pop(u, 0.8) });
      fly(160, 330, 160, 160, seg(u, 0.1, 0.8), 'hook: PreSync', { mono: true });
      snippet(330, 140, ['argocd.argoproj.io/hook: PreSync', 'argocd.argoproj.io/sync-wave: "1"'], { op: fade(u, 1.0) });
      tx(480, 300, '본 리소스보다 먼저 · hook 끼리도 wave로 정렬', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { band({ hot: 0 }); res(160, 160, 'db-migration', u > 2.2 ? 'healthy' : 'syncing', { t });
      terminal(330, 120, 560, 150, ['$ alembic upgrade head', 'restartPolicy: Never · backoffLimit: 2', 'envFrom: secretRef db-credentials'], lerp(0, 3, E(u, 0.2, 1.8)), { title: 'Job · migrate' });
      tx(480, 320, '대부분의 hook은 한 번 돌고 끝나는 Job이다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { band({ hot: 2 }); res(160, 160, 'db-migration', 'healthy'); res(480, 160, 'api', u > 0.8 ? 'healthy' : 'syncing', { t }); res(800, 160, 'smoke-test', u > 1.6 ? (u > 2.4 ? 'healthy' : 'syncing') : 'pending', { t });
      mono(800, 230, 'curl -f http://api/healthz', { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 1.6) });
      tx(800, 270, '적용이 끝나고 모두 Healthy일 때', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 4) { band({ fail: fade(u, 0.3) }); res(480, 290, 'notify-fail', 'pending', { s: pop(u, 0.8) });
      grow(480, 88, 480, 344, E(u, 0.5, 1.1), BAD, { dash: '6 5' });
      mono(700, 296, '--channel #deploy-alerts', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.4) });
      tx(480, 170, '성공한 sync에서는 돌지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 5) {   // phase 가 먼저 (python 으로 재현한 순서)
      band(); const seq = [['db-migration', 'PreSync · wave "1"', 160, 150], ['postgres', 'Sync · wave 0', 400, 150], ['api · web', 'Sync · wave 2', 560, 220], ['smoke-test', 'PostSync', 800, 150]];
      seq.forEach(([n, d, x, y], i) => { const at = 0.3 + i * 0.45; res(x, y, n, 'pending', { w: 190, s: pop(u, at) }); sub(x, y + 40, d, fade(u, at + 0.1));
        el('circle', { cx: x - 95, cy: y - 22, r: 13 * pop(u, at), fill: INK }); mono(x - 95, y - 17, String(i + 1), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: PANEL, opacity: fade(u, at) }); });
      card(400, 320, 330, 56, { rx: 10, stroke: WARN, sw: 2.2, fill: WARNBG, s: pop(u, 2.1), text: '첫 배포라면 DB가 아직 없다', fs: 16 });
      return; }
    // k6: PreSync 가 실패하면 뒤는 통째로 멈춤
    band({ hot: 0, dim: (i) => i > 0 && u > 1.2 }); res(160, 160, 'db-migration', u > 1.0 ? 'failed' : 'syncing', { t });
    [['postgres', 400], ['api · web', 560], ['smoke-test', 800]].forEach(([n, x], i) => res(x, i === 1 ? 220 : 160, n, 'pending', { w: 180, op: u > 1.2 ? 0.4 : 1 }));
    if (u > 1.2) cross(560, 120, 18, pop(u, 1.2));
    tx(480, 320, 'PreSync 하나가 실패하면 sync 전체가 실패로 끝난다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }

  // ---------- 4. hook-delete-policy ----------
  // 시간축: sync 1 (x=170) · hook 끝 (x=400) · sync 2 시작 (x=700)
  const T1 = 170, T2 = 400, T3 = 700;
  function axis(o) { o = o || {}; el('line', { x1: 120, y1: 330, x2: 900, y2: 330, stroke: MUT, 'stroke-width': 2 });
    [[T1, 'sync 1'], [T2, 'hook 끝'], [T3, 'sync 2']].forEach(([x, s]) => { el('line', { x1: x, y1: 322, x2: x, y2: 338, stroke: MUT, 'stroke-width': 2 }); sub(x, 360, s, 1, { 'font-weight': 700 }); }); }
  // Job 막대: 만들어짐 → 지워짐(end). ok = 성공/실패
  function jobBar(y, end, ok, u, label, at) { const x2 = lerp(T1, end, E(u, at, at + 1.0));
    el('rect', { x: T1, y: y - 16, width: Math.max(0, x2 - T1), height: 32, rx: 8, fill: ok ? GOODBG : BADBG, stroke: ok ? GOOD : BAD, 'stroke-width': 2 });
    if (x2 - T1 > 150) mono(T1 + 12, y + 5, 'db-migration', { 'font-size': 14, 'font-weight': 700 });
    if (u > at + 1.0) { if (end < 880) { cross(end + 14, y, 8); } tx(T1, y - 26, label, { 'font-size': 14.5, 'font-weight': 700, fill: end < 880 ? MUT : WARN }); } }
  function s4(t, c) { const { k, u } = c;
    if (k === 1) {   // 한 값을 콤마로 쪼갠다
      const f = E(u, 0.8, 1.6);
      mono(480, 110, 'argocd.argoproj.io/hook-delete-policy:', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.1) });
      pill(lerp(380, 300, f), 190, 'HookSucceeded', GOOD, pop(u, 0.3), { mono: true, fs: 16 });
      pill(lerp(600, 660, f), 190, 'BeforeHookCreation', INFO, pop(u, 0.3), { mono: true, fs: 16 });
      if (f < 0.4) mono(478, 196, ',', { 'font-size': 20, 'font-weight': 800 });
      tx(300, 250, '성공하면 바로 지움', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.7) }); tx(660, 250, '다음 hook 만들기 직전 지움', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.9) });
      tx(480, 340, '정책 여러 개를 콤마로 한 값에 적는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    axis();
    if (k === 0) { jobBar(200, 890, true, u, '다음 배포까지 남음', 0.2);
      tx(480, 100, '끝난 Job은 언제 지울까?', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.1) }); return; }
    if (k === 2) { jobBar(200, T2, true, u, 'HookSucceeded · 성공 즉시 삭제', 0.2);
      tx(480, 100, 'HookSucceeded', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD, class: 'mono' }); return; }
    if (k === 3) { jobBar(170, T2, false, u, 'HookFailed · 실패 로그도 사라짐', 0.2); jobBar(250, T3, false, u, 'BeforeHookCreation · 다음까지 남김', 0.6);
      if (u > 1.8) pill(T3 - 150, 250, '로그 확인 가능', INFO, pop(u, 1.8), { fs: 13.5 });
      tx(480, 90, '실패한 Job을 언제 지우나', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 }); return; }
    if (k === 4) { jobBar(200, T3, true, u, '기본값 · BeforeHookCreation', 0.2);
      if (u > 1.4) { el('rect', { x: T3 + 4, y: 244, width: lerp(0, 160, E(u, 1.5, 2.3)), height: 32, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 2 }); mono(T3 + 14, 265, '새 Job', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      tx(480, 100, '아무것도 안 적으면', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.1) });
      tx(480, 130, '지난 Job을 지운 뒤 새 Job을 만든다 · 이름 충돌 없음', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) }); return; }
    // k5: 권장 조합
    jobBar(160, T2, true, u, '성공 → 바로 정리', 0.2); jobBar(240, T3, false, u, '실패 → 다음 배포 직전까지 남김', 0.5);
    tx(480, 90, 'HookSucceeded,BeforeHookCreation', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono', fill: ACC }); }

  // ---------- 5. wave + health 대기 ----------
  // 간트: 열 t0..t5, 행 = 리소스
  const TX = (i) => 260 + i * 110, ROWS = [['postgres', 0], ['db-migration', 1], ['api', 2], ['web', 2]];
  function gantt(bars, u, o) { o = o || {};
    for (let i = 0; i <= 5; i++) { el('line', { x1: TX(i), y1: 60, x2: TX(i), y2: 300, stroke: GRID, 'stroke-width': 1.2, 'stroke-dasharray': '3 4' }); mono(TX(i), 50, `t${i}`, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); }
    ROWS.forEach(([n, w], r) => { const y = 90 + r * 56; mono(40, y + 5, n, { 'font-size': 14.5, 'font-weight': 700 }); mono(200, y + 5, `w${w}`, { 'font-size': 13.5, fill: MUT }); });
    bars.forEach(([r, a, b2, col, at]) => { const y = 90 + r * 56, f = E(u, at, at + 0.6);
      if (f <= 0) return; el('rect', { x: TX(a), y: y - 15, width: Math.max(2, (TX(b2) - TX(a)) * f), height: 30, rx: 6, fill: col === GOOD ? GOODBG : col === BAD ? BADBG : INFOBG, stroke: col, 'stroke-width': 2 }); }); }
  function s5(t, c) { const { k, u } = c;
    const base = [[0, 0, 1, INFO, 0], [0, 1, 1.4, GOOD, 0], [1, 2, 3, INFO, 0], [1, 3, 3.4, GOOD, 0]];
    if (k === 0) { gantt([[0, 0, 1, INFO, 0.2], [0, 1, 1.4, GOOD, 0.8], [1, 2, 3, INFO, 1.4], [1, 3, 3.4, GOOD, 2.0]], u);
      tx(480, 370, 'postgres가 readinessProbe를 통과해야 wave 1이 시작된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    if (k === 1) { gantt(base.concat([[2, 4, 5, INFO, 0.3], [3, 4, 5, INFO, 0.3], [2, 5, 5.4, GOOD, 1.2], [3, 5, 5.4, GOOD, 1.2]]), u);
      tx(480, 370, 'Job이 Complete 되면 api · web이 동시에 만들어진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { const end = lerp(1, 5.4, E(u, 0.2, 2.2)); gantt([[0, 0, end, WARN, 0]], 3);
      [1, 2, 3].forEach((r) => { el('rect', { x: TX(2), y: 90 + r * 56 - 15, width: 300, height: 30, rx: 6, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 4', 'stroke-width': 1.6 }); });
      sub(TX(4), 90 + 2 * 56 + 40, '시작조차 못 함', fade(u, 1.0), { 'font-weight': 700, fill: BAD });
      tx(480, 370, 'Healthy가 안 되면 무한 대기 또는 timeout', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); return; }
    if (k === 3) {
      [['Deployment · StatefulSet', 'readinessProbe를 제대로', 240], ['Job', 'restartPolicy: Never + 완료 조건', 720]].forEach(([a, d, x], i) => { const s = pop(u, 0.2 + i * 0.6);
        card(x, 160, 400, 130, { rx: 14, stroke: GOOD, sw: 2.4, s }); if (s < 0.5) return;
        tx(x, 130, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 }); tx(x, 162, d, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT });
        check(x, 200, 12, pop(u, 0.8 + i * 0.6)); });
      tx(480, 320, 'health 판정이 정확해야 wave 순서가 의미를 갖는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { snippet(60, 60, ['kind: ConfigMap', 'metadata: { name: argocd-cm, namespace: argocd }', 'data:', '  resource.customizations.health.example.com_MyDB: |', '    -- Lua 스크립트'], { fs: 15, op: fade(u, 0.2) });
      el('rect', { x: 66, y: 141, width: 600, height: 24, rx: 4, fill: C.HL, opacity: 0.6 * fade(u, 1.0) });
      tx(480, 300, '키 = resource.customizations.health.<group>_<kind>', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.4) });
      tx(480, 340, 'example.com 그룹의 MyDB 리소스에 health 규칙을 붙인다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 5) {   // Lua 판정 흐름
      card(200, 200, 220, 70, { rx: 10, stroke: INK, text: 'MyDB 객체', fs: 17, s: pop(u, 0.1) });
      el('path', { d: 'M480,140 L580,200 L480,260 L380,200 Z', fill: PANEL, stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 0.5) });
      mono(480, 196, 'status.phase', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(480, 216, '== "Running"', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 0.6) });
      grow(312, 200, 376, 200, E(u, 0.3, 0.6), MUT);
      grow(580, 200, 700, 130, E(u, 1.0, 1.4), GOOD); grow(580, 200, 700, 280, E(u, 1.4, 1.8), INFO);
      pill(780, 130, 'Healthy', GOOD, pop(u, 1.4), { fs: 16 }); pill(790, 280, 'Progressing', INFO, pop(u, 1.8), { fs: 16 });
      sub(630, 150, '예', fade(u, 1.4)); sub(630, 270, '아니오', fade(u, 1.8));
      mono(780, 168, '"DB is running"', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); mono(790, 318, '"Waiting for DB"', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
    // k6: health 없음 → 바로 통과
    gantt([[0, 0, 0.15, GOOD, 0.2], [2, 0.3, 1.3, INFO, 0.8], [3, 0.3, 1.3, INFO, 0.8]], u);
    el('rect', { x: TX(0), y: 75, width: (TX(3) - TX(0)) * E(u, 0.2, 2.0), height: 30, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
    sub(TX(2) + 40, 96, 'MyDB는 아직 준비 중', fade(u, 1.2), { fill: WARN, 'font-weight': 700 });
    tx(480, 370, 'health가 없으면 적용 즉시 통과 · 다음 wave가 너무 일찍 출발', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }

  // ---------- 6. 실무 함정 ----------
  function s6(t, c) { const { k, u } = c;
    if (k === 0) {
      [['sync-wave: 1', 'YAML이 숫자 1로 읽는다', BAD, false], ['sync-wave: "1"', '문자열 "1"', GOOD, true]].forEach(([s, d, col, ok], i) => { const x = 250 + i * 460, sc = pop(u, 0.2 + i * 0.7);
        card(x, 170, 380, 150, { rx: 14, stroke: col, sw: 2.5, s: sc }); if (sc < 0.5) return;
        mono(x, 150, s, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800 }); tx(x, 186, d, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT });
        if (ok) check(x, 222, 13, pop(u, 1.0 + i * 0.7)); else cross(x, 222, 12, pop(u, 0.6)); });
      tx(480, 330, 'annotation 값은 문자열만 · 숫자면 매니페스트가 거부된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 1) {
      tx(240, 70, 'wave 2에 둘 다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN }); tx(720, 70, 'api="2", web="3"', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono', fill: GOOD, opacity: fade(u, 1.2) });
      lane(240, 2, 'syncing', { y: 110, h: 170, w: 300 }); res(240, 170, 'api', 'syncing', { t, w: 240 }); res(240, 230, 'web', 'syncing', { t, w: 240 });
      tx(240, 320, '순서 보장 없음 · 병렬', { 'text-anchor': 'middle', 'font-size': 15, fill: WARN, opacity: fade(u, 0.6) });
      lane(640, 2, 'healthy', { y: 110, h: 120, w: 200, s: pop(u, 1.2) }); lane(830, 3, u > 2.0 ? 'syncing' : 'pending', { y: 110, h: 120, w: 170, s: pop(u, 1.4) });
      res(640, 170, 'api', u > 1.8 ? 'healthy' : 'syncing', { w: 170, t, s: pop(u, 1.3) }); res(830, 170, 'web', u > 2.0 ? 'syncing' : 'pending', { w: 150, t, s: pop(u, 1.5) });
      tx(735, 320, 'api가 Healthy 된 뒤 web', { 'text-anchor': 'middle', 'font-size': 15, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { axis(); jobBar(190, 890, false, Math.min(u + 1.2, 3), 'HookSucceeded만 · 실패 Job이 남음', 0);
      el('rect', { x: T3, y: 234, width: 170, height: 32, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.8) });
      mono(T3 + 12, 255, '새 이미지로 적용', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.8) }); if (u > 1.4) cross(T3 + 150, 250, 8, pop(u, 1.4));
      tx(480, 90, 'Job template은 바꿀 수 없다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { band({ hot: 0, dim: (i) => i > 0, fail: fade(u, 1.0) }); res(160, 160, 'db-migration', 'failed');
      res(480, 290, 'notify-fail', u > 1.6 ? 'syncing' : 'pending', { t, s: pop(u, 1.2) }); grow(160, 186, 330, 360, E(u, 0.8, 1.3), BAD, { dash: '5 4' });
      tx(800, 170, '마이그레이션은 다시 돌려도', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.8) }); tx(800, 196, '안전하게(idempotent)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 4) {   // probe 없는 Deployment 는 바로 Healthy
      R.dbIcon(220, 180, 'DB 준비 중', { stroke: WARN, s: pop(u, 0.2) }); clock(220, 300, 18, E(u, 0.3, 2.6) * 0.9, WARN);
      card(620, 150, 340, 60, { rx: 10, stroke: GOOD, sw: 2.4, fill: GOODBG, s: pop(u, 0.5), text: 'Deployment (probe 없음)', fs: 15 });
      pill(620, 205, 'Healthy', GOOD, pop(u, 0.8), { fs: 14 }); grow(620, 230, 620, 290, E(u, 1.0, 1.5), BAD);
      card(620, 320, 300, 50, { rx: 10, stroke: BAD, sw: 2.2, s: pop(u, 1.5), text: '다음 wave 출발', fs: 15 });
      tx(480, 400, '진짜 준비 전에 다음 wave · probe와 CRD health를 정의한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 5) {
      ['sync-wave 값은 문자열', '순서가 필요하면 다른 wave', 'hook delete-policy 조합 확인', 'SyncFail hook 준비', '리소스마다 health 근거', '마이그레이션은 idempotent'].forEach((s, i) => {
        const x = i < 3 ? 250 : 710, y = 90 + (i % 3) * 90, at = 0.2 + i * 0.3; card(x, y, 400, 64, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, at) });
        if (u > at + 0.2) check(x - 170, y, 10, pop(u, at + 0.2)); tx(x - 145, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, at + 0.1) }); });
      return; }
    // k6: 머릿속 순서 vs 매니페스트
    el('ellipse', { cx: 240, cy: 160, rx: 180, ry: 100, fill: SOFT, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.2) });
    tx(240, 150, 'DB가 먼저 뜨겠지…', { 'text-anchor': 'middle', 'font-size': 17, fill: MUT, opacity: fade(u, 0.4) }); tx(240, 180, '머릿속 순서', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.5) });
    cross(240, 270, 14, pop(u, 1.0)); tx(240, 310, '리뷰도 재현도 안 된다', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, opacity: fade(u, 1.1) });
    snippet(500, 90, ['# postgres', 'argocd.argoproj.io/sync-wave: "0"', '# db-migration', 'argocd.argoproj.io/sync-wave: "1"'], { fs: 15, op: fade(u, 1.4) });
    check(700, 270, 14, pop(u, 1.9)); tx(700, 310, '매니페스트에 적힌 순서', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'sync-wave를 하나도 주지 않은 앱에서 postgres·db-migration·api는 어떻게 적용되는가?',
      o: ['postgres가 Healthy가 될 때까지 기다린 뒤 나머지가 적용된다', '모두 wave 0에서 kind 순으로 한 번에 적용되고 서로 기다리지 않는다', '이름 순서대로 하나씩 Healthy를 기다리며 적용된다'], a: 1,
      why: '값이 없으면 모두 wave 0이다. 같은 wave 안에서는 kind 순으로 apply 할 뿐 기다리지 않아, api가 아직 없는 DB에 붙어 CrashLoopBackOff가 난다.' },
    { q: 'api와 web에 똑같이 sync-wave "2" 를 주면 둘은 어떻게 배포되는가?',
      o: ['api가 먼저, web이 나중에', 'web이 먼저, api가 나중에', '서로 순서 보장 없이 병렬로'], a: 2,
      why: '같은 wave는 병렬이다. api 다음에 web이 떠야 한다면 "2" 와 "3" 처럼 번호를 나눈다.' },
    { q: 'PreSync hook인 db-migration에 sync-wave "1" 을, postgres에 wave "0" 을 줬다. 무엇이 먼저 도는가?',
      o: ['db-migration, phase가 wave보다 먼저 정렬되니까', 'postgres, wave 0이 더 낮으니까', '둘이 동시에'], a: 0,
      why: '정렬은 phase → wave → kind → name 순이다. PreSync는 Sync 단계의 모든 리소스보다 먼저라서, 첫 배포라면 DB가 아직 없다.' },
    { q: 'hook Job에 hook-delete-policy를 하나도 적지 않으면 어떻게 되는가?',
      o: ['BeforeHookCreation이 기본으로 붙어 다음 hook 직전에 지난 Job을 지운다', 'Job이 영원히 남고 두 번째 배포가 실패한다', '성공하자마자 Job이 지워진다'], a: 0,
      why: '공식 문서상 정책이 없으면 BeforeHookCreation이 적용된다. 그래서 이름 충돌은 없지만 끝난 Job이 다음 배포 직전까지 남는다.' },
    { q: 'health 규칙이 없는 CRD를 wave 0에 넣었다. wave 1은 언제 출발하는가?',
      o: ['CRD가 진짜 준비될 때까지 기다린 뒤', 'CRD가 적용되자마자 바로', 'timeout이 지난 뒤에만'], a: 1,
      why: 'health 판정이 없는 리소스는 적용되면 곧바로 통과로 본다. argocd-cm에 Lua health check를 등록해야 wave 대기가 의미를 갖는다.' },
    { q: 'Step 6의 함정 중, 따옴표 없이 sync-wave: 1이라고 쓰면 생기는 일은 무엇인가?',
      o: ['wave 1로 정상 처리된다', 'wave 0으로 바뀐다', '숫자라서 annotation으로 받아들여지지 않고 매니페스트가 거부된다'], a: 2,
      why: 'annotation 값은 문자열이어야 한다. YAML은 따옴표 없는 1을 숫자로 읽기 때문에 "1" 처럼 적어야 한다.' },
  ];

  const summary = [
    'wave를 안 주면 DB, 마이그레이션, 앱이 한 번에 들어가 앱이 CrashLoopBackOff에 빠진다.',
    'sync-wave는 따옴표 두른 정수 문자열이다. 낮은 값부터 가고 같은 값끼리는 병렬이다.',
    'hook은 phase가 먼저라 PreSync 마이그레이션은 wave 0의 DB보다도 먼저 돈다.',
    '다음 wave는 앞 wave가 모두 Healthy일 때 출발하므로 health 판정이 정확해야 한다.',
  ];
  const review = [
    { q: '첫 배포에서 PreSync 마이그레이션 Job이 "DB에 연결할 수 없음" 으로 실패했다. postgres는 같은 앱의 wave 0이다. 먼저 의심할 것은?',
      o: ['PreSync가 Sync 단계의 postgres보다 먼저 돌아 DB가 아직 없었다', 'postgres의 sync-wave가 너무 낮다', 'hook-delete-policy가 없다'], a: 0,
      why: '정렬은 phase가 먼저다. 마이그레이션을 본 리소스의 wave 1 Job으로 두거나, DB를 먼저 띄우는 별도 앱으로 나눈다.' },
    { q: 'wave 0의 커스텀 DB 리소스가 아직 준비 중인데 wave 1의 Job이 벌써 실행됐다. 고칠 곳은?',
      o: ['Job의 sync-wave를 "0" 으로 낮춘다', 'SyncFail hook을 추가한다', 'argocd-cm에 그 CRD의 health check를 Lua로 등록한다'], a: 2,
      why: 'health 판정이 없으면 적용 즉시 통과로 본다. status.phase를 보는 Lua 규칙이 있어야 Healthy를 기다린다.' },
    { q: 'hook에 HookSucceeded만 적었더니, 실패했던 마이그레이션 Job이 남아 새 이미지로 다시 돌리지 못했다. 알맞은 조치는?',
      o: ['HookFailed만 남긴다', 'HookSucceeded,BeforeHookCreation으로 바꾼다', 'sync-wave를 높인다'], a: 1,
      why: '정책을 적으면 기본값 BeforeHookCreation이 빠진다. 함께 적으면 실패 Job은 로그 확인용으로 남았다가 다음 실행 직전에 지워진다.' },
  ];

  R.page({ title: 'sync wave 진행 상황', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
