/* III-2-1 AppProject 로 격리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 관문(sourceRepos · destinations · 리소스 종류)의 값과 앱 통과 여부는 STEPS 의 gate · apps 를 읽는다.
 * 권한 칸과 sync window 주간표는 페이지 YAML 을 규칙대로 계산한 결과다(파이썬으로 재현: allow 는 합쳐서, deny 가 우선. 창은 UTC). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, person, terminal, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function yml(x, y, w, lines, o) { o = o || {}; const lh = o.lh || 23, fs = o.fs || 14, n = o.n ?? lines.length;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    lines.slice(0, Math.ceil(n)).forEach((s, i) => { const yy = y + 12 + fs + i * lh, last = i === Math.ceil(n) - 1 && n % 1, part = last ? s.slice(0, Math.round(s.length * (n % 1))) : s;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: yy - fs, width: w - 8, height: lh, rx: 4, fill: ACCBG });
      const m = part.match(/^(\s*-?\s*)([\w.\-/"]+:)(.*)$/);
      if (m && !part.trim().startsWith('#')) R.spans(x + 14, yy, [[m[1], {}], [m[2], { fill: INFO, 'font-weight': 700 }], [m[3], { fill: INK }]], { 'font-size': fs });
      else mono(x + 14, yy, part, { 'font-size': fs, fill: part.trim().startsWith('#') ? MUT : INK }); }); }

  // ---------- 관문 그림 (장면 1~3) ----------
  // 위: 앱 카드들, 가운데: 관문 띠 세 개, 아래: 클러스터. 앱마다 점이 내려가며 관문을 지난다.
  const BAND = [['sourceRepos', 'src', 150], ['destinations', 'dst', 212], ['리소스 종류', 'res', 274]];
  const OPEN = /\*|미설정|검증 없음|무관|대기|없음|전체/, PLAN = /예정/;
  function failAt(name) { if (/repo|외부/.test(name)) return 0; if (/ns|네임스페이스/.test(name)) return 1; return 2; }
  function bands(c, o) { o = o || {}; const g = c.beat.gate || {}, pg = (c.prev && c.prev.gate) || {};
    BAND.forEach(([lab, key, y], i) => { const v = String(g[key] || ''), plan = PLAN.test(v), open = (OPEN.test(v) || plan) && !/✔/.test(v), changed = pg[key] !== g[key] && c.prev;
      const op = changed ? fade(c.u, 0.2 + i * 0.15) : 1;
      el('rect', { x: 30, y: y - 20, width: 900, height: 40, rx: 8, fill: open ? PANEL : ACCBG, stroke: plan ? ACC : open ? GRID : ACC, 'stroke-width': open && !plan ? 1.5 : 2.2, 'stroke-dasharray': open ? '6 5' : null });
      tx(44, y + 5, lab, { 'font-size': 14.5, 'font-weight': 800, fill: plan ? ACC : open ? MUT : ACC });
      tx(160, y + 5, v.replace(/[✔⛔]/g, ''), { 'font-size': 13.5, fill: open ? MUT : INK, 'font-weight': 600, opacity: changed ? op : 1 }); }); }
  // 앱이 관문을 지나는 모습. upto: 몇 번째 관문까지 검사했는지(0~3)
  function flow(c, apps, o) { o = o || {}; const { u } = c, n = apps.length, x0 = 370, W = 560, colW = W / n;
    apps.forEach((a, i) => { const x = x0 + colW * i + colW / 2, fail = a.allowed ? 9 : (a.fail ?? failAt(a.name)), upto = o.upto ?? 3, stop = Math.min(fail, upto);
      const fresh = o.freshAll || (c.prev && !(c.prev.apps || []).some((p) => p.name === a.name));
      const s = fresh ? pop(u, 0.2 + i * 0.15) : 1, col = a.allowed ? (o.badPass ? BAD : GOOD) : BAD;
      const cw = Math.min(colW - 14, 260), two = tw(a.name, 13.5) > cw - 20, label = two ? a.name.replace(' (', '\n(').replace(' → ', '\n→ ') : a.name;
      card(x, 70, cw, two ? 52 : 42, { rx: 8, text: label, fs: 13.5, stroke: o.badPass ? BAD : INK, color: INK, s, fw: 700 });
      const yEnd = stop >= 3 ? (o.yEnd || 330) : BAND[stop][2], a0 = 0.5 + i * 0.25, g = E(u, a0, a0 + 0.9);
      el('line', { x1: x, y1: 97, x2: x, y2: lerp(97, yEnd - (stop < 3 ? 14 : 0), g), stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': a.allowed ? null : '5 4' });
      BAND.forEach(([, , y], j) => { if (j >= stop || j >= upto || g < (y - 92) / (yEnd - 92)) return; check(x + 16, y, 6, 1); });
      if (!a.allowed && stop === fail && g >= 1) cross(x, BAND[fail][2], 11, pop(u, a0 + 0.9));
      if (stop >= 3 && g >= 1 && !o.yEnd) el('circle', { cx: x, cy: 340, r: 8, fill: col, opacity: fade(u, a0 + 0.9) }); }); }
  function cluster(o) { o = o || {}; zone(30, 312, 900, 98, '클러스터', { fill: o.fill || SOFT, stroke: o.stroke || 'none', color: o.color }); }

  // ---------- 1. 왜 AppProject ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    pill(870, 22, 'project: ' + b.proj, MUT, 1, { fs: 13.5, mono: true });
    if (k === 2) { bands(c); cluster();
      ['frontend', 'backend', 'platform'].forEach((p, i) => { const x = 470 + i * 170; card(x, 70, 150, 44, { rx: 10, text: p, fs: 15, mono: true, stroke: ACC, color: ACC, dash: '6 4', s: pop(u, 0.3 + i * 0.3) }); });
      sub(240, 76, '팀마다 경계를 하나씩', fade(u, 1.2), { fill: ACC, 'font-weight': 700 }); return; }
    cluster({ stroke: k === 1 || k === 4 ? BAD : 'none', color: k === 1 || k === 4 ? BAD : MUT });
    bands(c);
    flow(c, b.apps, { badPass: k === 1, freshAll: k === 0 || k === 1 || k === 4 });
    if (k === 1) sub(480, 396, '막아 주는 곳이 한 군데도 없다', fade(u, 1.8), { fill: BAD, 'font-weight': 700 });
    if (k === 3) sub(480, 396, '세 관문을 다 좁혀야 경계가 닫힌다', fade(u, 1.8), { fill: GOOD, 'font-weight': 700 });
    if (k === 4) { el('circle', { cx: 480, cy: 361, r: lerp(10, 440, E(u, 1.4, 2.4)), fill: BAD, opacity: 0.12 }); sub(480, 396, '사고 반경 = 클러스터 전체', fade(u, 2.0), { fill: BAD, 'font-weight': 800, 'font-size': 15 }); } }

  // ---------- 2. AppProject 정의 ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    pill(860, 22, 'AppProject: ' + b.proj, ACC, k === 0 ? pop(u, 0.2) : 1, { fs: 13.5, mono: true });
    if (k === 5) { bands(c);
      terminal(30, 300, 900, 116, ['$ argocd proj list          (예시, 열 일부)', 'NAME       DESTINATIONS   SOURCES', 'default    *              *', 'frontend   2              2'], lerp(1, 4, E(u, 0.1, 1.2)), { fs: 13.5, lh: 18 });
      flow(c, b.apps, { freshAll: false, yEnd: 296 }); return; }
    cluster(); bands(c);
    flow(c, b.apps, { freshAll: k === 0 });
    if (k === 3) { card(170, 362, 250, 32, { rx: 6, text: 'clusterResourceWhitelist: []', fs: 13.5, mono: true, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 0.3) }); sub(480, 396, '빈 배열은 전부 금지, "*" 는 전부 허용', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); }
    if (k === 4) sub(480, 396, 'group "" 은 core 그룹 (Service 등)', fade(u, 1.8), { fill: INFO, 'font-weight': 700 });
    if (k === 0) sub(480, 396, '껍데기만 있으면 아무것도 막지 않는다', fade(u, 1.2), { fill: MUT, 'font-weight': 700 }); }

  // ---------- 3. Application 소속 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat;
    pill(860, 22, 'spec.project: ' + b.proj, ACC, k === 0 ? pop(u, 0.4) : 1, { fs: 13.5, mono: true });
    const upto = [0, 1, 2, 3, 3, 3, 3][k];
    if (k !== 6) cluster({ stroke: k === 5 ? GOOD : 'none' });
    bands(c);
    if (k === 6) { terminal(30, 300, 900, 116, ['$ argocd app get web-app', 'Project:      frontend', 'Sync Status:  Synced', '# 위반 시 Conditions: InvalidSpecError'], lerp(1, 4, E(u, 0.1, 1.4)), { fs: 14, lh: 18 });
      flow(c, [{ name: 'web-app → web ns', allowed: true }, { name: 'web-app → payment ns', allowed: false, fail: 1 }], { upto: 3, yEnd: 296 }); return; }
    const apps = k === 5 ? [{ name: 'web-app → web ns', allowed: true }, { name: 'web-app → payment ns', allowed: false, fail: 1 }] : b.apps.map((a) => Object.assign({}, a));
    if (k === 5) apps[0].allowed = true;
    flow(c, apps, { upto, freshAll: k === 0 || k === 4 });
    if (k === 3) { pill(480, 372, 'Synced', GOOD, pop(u, 1.6), { fs: 14 }); pill(580, 372, 'Healthy', GOOD, pop(u, 1.8), { fs: 14 }); }
    if (k === 4) { mono(480, 396, 'do not match any of the allowed destinations (예시)', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 5) { sub(480, 396, '거부는 Argo CD에서 일어난다. 클러스터에는 아무것도 닿지 않는다', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 }); } }

  // ---------- 4. RBAC ----------
  const ACT = ['get', 'sync', 'override', 'delete'];
  // 각 beat 의 권한 칸: [그룹 이름, frontend/* 동작 4칸, backend/*]. 1 허용, 0 거부, null 아직 없음
  const RB = {
    0: [['그룹 없음', [null, null, null, null], null]],
    1: [['그룹 없음', [null, null, null, null], null]],
    2: [['role: developer', [1, 1, 0, 0], null]],
    3: [['acme:frontend-devs', [1, 1, 0, 0], null], ['그룹 밖 사용자', [0, 0, 0, 0], null]],
    4: [['acme:frontend-devs', [1, 1, 0, 0], null], ['acme:frontend-leads', [1, 1, 1, 1], null], ['그룹 밖 사용자', [0, 0, 0, 0], null]],
    5: [['acme:frontend-devs', [1, 1, 0, 0], 0], ['acme:frontend-leads', [1, 1, 1, 1], 0], ['그룹 밖 사용자', [0, 0, 0, 0], 0]],
  };
  function grid4(c) { const { k, u } = c, rows = RB[k], pr = RB[k - 1] || [], x0 = 330, cw = 112, y0 = 150, rh = 62;
    ACT.concat(['backend/*']).forEach((a, j) => mono(x0 + j * cw + cw / 2, y0 - 22, a, { 'font-size': 14, 'font-weight': 700, fill: j === 4 ? WARN : MUT, 'text-anchor': 'middle' }));
    tx(x0, y0 - 52, 'frontend/* 에 대해', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    rows.forEach(([g, v, bk], i) => { const y = y0 + i * rh, old = pr[i] && pr[i][0] === g;
      mono(x0 - 16, y + 30, g, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: old ? 1 : fade(u, 0.2) });
      v.concat([bk]).forEach((s, j) => { const x = x0 + j * cw + 6, a = 0.4 + i * 0.3 + j * 0.15, on = old && (j < 4 || (pr[i] && pr[i][2] != null)) ? 1 : seg(u, a, a + 0.3);
        el('rect', { x, y: y + 6, width: cw - 12, height: rh - 14, rx: 8, fill: s == null ? 'none' : s ? GOODBG : BADBG, stroke: s == null ? GRID : s ? GOOD : BAD, 'stroke-width': 1.8, 'stroke-dasharray': s == null ? '5 4' : null, opacity: s == null ? 1 : on });
        if (s != null && on > 0.5) (s ? check : cross)(x + (cw - 12) / 2, y + 6 + (rh - 14) / 2, s ? 10 : 8, 1); }); }); }
  function s4(t, c) { const { k, u } = c;
    pill(860, 22, 'AppProject: frontend', ACC, 1, { fs: 13.5, mono: true });
    if (k <= 5) { grid4(c);
      const pol = { 0: ['roles:', '  # 아직 없음'], 1: ['sourceRepos: [acme/web]', 'destinations: [web]', 'roles: # 아직 없음'], 2: ['- name: developer', '  policies:', '  - p, …, get,  frontend/*, allow', '  - p, …, sync, frontend/*, allow'],
        3: ['  groups:', '  - acme:frontend-devs'], 4: ['- name: admin', '  policies:', '  - p, …, *, frontend/*, allow', '  groups: [acme:frontend-leads]'], 5: ['# devs: frontend/* get·sync', '# delete와 backend/* 는 거부'] }[k];
      if (k === 1) { tx(40, 60, '무엇을 배포하나 (화이트리스트)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }
      yml(30, k === 1 ? 72 : 40, 290, pol, { n: lerp(1, pol.length, E(u, 0.1, 1.0)) });
      if (k === 1) sub(620, 380, '누가 할 수 있나 는 아직 비어 있다', fade(u, 1.0), { fill: MUT, 'font-weight': 700 });
      if (k === 2) sub(620, 380, '적지 않은 동작은 거부', fade(u, 1.6), { fill: BAD, 'font-weight': 700 });
      if (k === 3) sub(620, 380, 'groups가 있어야 사람이 역할을 얻는다', fade(u, 1.6), { fill: INFO, 'font-weight': 700 });
      if (k === 4) sub(620, 380, 'admin은 프로젝트 안 전권, 인원은 좁게', fade(u, 1.6), { fill: WARN, 'font-weight': 700 });
      if (k === 5) sub(620, 380, '프로젝트 role은 자기 프로젝트 앱에만 권한을 준다', fade(u, 1.6), { fill: WARN, 'font-weight': 700 });
      return; }
    if (k === 6) { // 두 정책 합산
      [['argocd-rbac-cm (글로벌)', 260, INFO], ['프로젝트 roles', 700, ACC]].forEach(([s, x, col], i) => { card(x, 110, 300, 110, { rx: 12, stroke: col, sw: 2.2, s: pop(u, 0.2 + i * 0.3) }); lbl(x, 84, s, fade(u, 0.3 + i * 0.3), { fill: col });
        mono(x, 118, i === 0 ? 'p, role:…, allow' : 'p, proj:frontend:…, allow', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.3) }); mono(x, 142, i === 0 ? 'p, role:…, deny' : '', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.5) }); });
      grow(260, 168, 450, 240, E(u, 0.9, 1.4), MUT); grow(700, 168, 510, 240, E(u, 0.9, 1.4), MUT);
      card(480, 270, 340, 60, { rx: 12, text: '합쳐서 한 번에 평가', fs: 16, stroke: INK, s: pop(u, 1.4) });
      [['allow가 하나라도 맞음', GOOD, '통과'], ['deny가 하나라도 맞음', BAD, '거부']].forEach(([a, col, r], i) => { const y = 340 + i * 34; note(270, y + 6, a, fade(u, 1.8 + i * 0.3), { fill: col }); mono(690, y + 6, '→ ' + r, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.9 + i * 0.3) }); });
      return; }
    // k7 CI 토큰
    terminal(30, 50, 560, 130, ['$ argocd proj role list frontend', 'developer   sync와 조회만 허용', 'admin       프로젝트 전권', '$ argocd proj role create-token frontend developer'], lerp(1, 4, E(u, 0.1, 1.4)), { fs: 14, lh: 22, title: '예시 출력' });
    fly(310, 200, 760, 120, seg(u, 1.6, 2.3), 'JWT', { mono: true, fill: ACC });
    if (u > 2.3) { card(760, 120, 270, 70, { rx: 10, stroke: ACC, s: pop(u, 2.3) }); mono(760, 114, 'proj:frontend:developer', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' }); sub(760, 138, 'CI가 쓰는 토큰, get·sync만', 1); }
    person(160, 290, 'CI 파이프라인', { s: pop(u, 0.4) }); sub(480, 380, '사람 대신 CI도 같은 역할 범위 안에서만 움직인다', fade(u, 2.4), { fill: INK, 'font-weight': 700 }); }

  // ---------- 5. Sync window ----------
  const DAYS = '월화수목금토일';
  const allowAt = (d, h) => d < 5 && h >= 9 && h < 18;
  const denyAt = (d, h) => d === 4 && h >= 14;
  // 주간 창 표: 칸 색 = 그 시각 sync 판정. o.from 은 앞 beat 상태(바뀌는 칸만 칠해 나간다)
  const cellFill = (d, h, st) => (st.deny && denyAt(d, h) ? BAD : st.allow ? (allowAt(d, h) ? GOOD : WARNBG) : GOODBG);
  function week(c, o) { o = o || {}; const { u } = c, x0 = 100, y0 = 70, cw = 33, rh = 36, from = o.from || o;
    for (let h = 0; h <= 24; h += 6) mono(x0 + h * cw, y0 - 10, String(h), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    for (let d = 0; d < 7; d++) { tx(x0 - 18, y0 + d * rh + rh / 2 + 5, DAYS[d], { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      for (let h = 0; h < 24; h++) { const f0 = cellFill(d, h, from), f1 = cellFill(d, h, o), r = { x: x0 + h * cw + 1, y: y0 + d * rh + 2, width: cw - 2, height: rh - 4, rx: 3 };
        el('rect', Object.assign({ fill: f0, opacity: f0 === GOOD || f0 === BAD ? 0.8 : 1 }, r));
        if (f1 !== f0) el('rect', Object.assign({ fill: f1, opacity: (f1 === GOOD || f1 === BAD ? 0.8 : 1) * seg(u, 0.3 + h * 0.05 + d * 0.06, 0.6 + h * 0.05 + d * 0.06) }, r)); } }
    return { X: (h) => x0 + h * cw, Y: (d) => y0 + d * rh, rh }; }
  function legend(items, y) { items.forEach(([s, col], i) => { const x = 100 + i * 250; el('rect', { x, y: y - 12, width: 18, height: 16, rx: 3, fill: col }); tx(x + 26, y + 2, s, { 'font-size': 14, 'font-weight': 600 }); }); }
  function s5(t, c) { const { k, u } = c;
    pill(860, 22, 'AppProject: production', ACC, k === 0 ? pop(u, 0.2) : 1, { fs: 13.5, mono: true });
    if (k === 5) { tx(480, 52, '격리 종합 함정 5가지', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      ['default를 운영에 그대로 사용', 'sourceRepos · destinations 화이트리스트 누락', 'resource whitelist 미설정 → CRD·ClusterRole 방치', '프로젝트 남발 → 관리 폭증', 'syncWindow만 믿고 화이트리스트 생략'].forEach((s, i) => { const y = 100 + i * 58;
        card(480, y, 640, 46, { rx: 10, stroke: i === 4 ? WARN : BAD, sw: 2, s: pop(u, 0.2 + i * 0.35) }); cross(190, y, 8, pop(u, 0.3 + i * 0.35)); note(215, y + 6, s, fade(u, 0.3 + i * 0.35)); }); return; }
    const w = week(c, { allow: k >= 2, deny: k >= 3, from: { allow: k >= 3 || (k === 2 ? false : k >= 2), deny: k >= 4 } });
    if (k <= 1) { legend([['언제든 sync', GOODBG]], 340); sub(480, 380, k === 0 ? '창이 없으면 시간 제한도 없다' : 'sourceRepos acme/* · destinations ns "*" 로 넓게 열었다', fade(u, 0.6), { fill: k === 0 ? MUT : WARN, 'font-weight': 700 }); }
    if (k >= 2) legend([['자동 sync 허용', GOOD], ['수동만 (manualSync)', WARNBG]].concat(k >= 3 ? [['전부 막힘', BAD]] : []), 340);
    if (k === 2) sub(480, 390, 'allow 0 9 * * 1-5 · 9h → 월~금 09~18시', fade(u, 1.4), { class: 'mono', fill: GOOD, 'font-weight': 700 });
    if (k === 3) sub(480, 390, 'deny 0 14 * * 5 · 10h · manualSync false → 금 14~24시 동결', fade(u, 1.4), { class: 'mono', fill: BAD, 'font-weight': 700 });
    if (k === 4) { el('rect', { x: w.X(14) - 2, y: w.Y(4), width: w.X(18) - w.X(14) + 4, height: w.rh, rx: 4, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: fade(u, 0.3) });
      sub(480, 390, '금 14~18시는 allow와 deny가 겹친다 → deny가 이긴다', fade(u, 0.9), { fill: BAD, 'font-weight': 800 }); }
    if (k === 6) { const nx = w.X(15) + 16, ny = w.Y(4) + w.rh / 2; el('circle', { cx: nx, cy: ny, r: 9, fill: INK, opacity: fade(u, 0.2) });
      card(nx - 40, ny - 70, 300, 36, { rx: 8, text: '$ argocd app sync web-prd', fs: 14, mono: true, stroke: INK, s: pop(u, 0.6) });
      sub(480, 390, '금 15시: deny 창 안이라 sync 거부 (창은 기본 UTC 기준)', fade(u, 1.4), { fill: BAD, 'font-weight': 700 }); if (u > 1.2) cross(nx + 130, ny - 70, 9, pop(u, 1.2)); } }

  const quiz = [
    { q: '설치 직후 default 프로젝트가 위험한 이유는 무엇인가?',
      o: ['소스 repo·대상·리소스 종류가 모두 "*"라 무엇이든 통과해서', 'Application을 하나도 만들 수 없어서', 'sync가 매번 수동이라서'], a: 0,
      why: 'default는 sourceRepos, destinations, clusterResourceWhitelist가 전부 "*"다. 한 팀의 실수가 클러스터 전체로 번진다.' },
    { q: 'frontend 프로젝트에서 clusterResourceWhitelist: []의 뜻은 무엇인가?',
      o: ['클러스터 범위 리소스를 전부 허용한다', '클러스터 범위 리소스를 하나도 만들 수 없다', '설정하지 않은 것과 같아 default 값을 따른다'], a: 1,
      why: '화이트리스트는 적은 것만 통과시킨다. 빈 배열이면 ClusterRole·CRD 같은 클러스터 범위 리소스가 모두 거부된다.' },
    { q: 'web-app의 destination만 payment로 바꾸면 어디서 막히는가?',
      o: ['클러스터의 admission 단계', 'Argo CD의 프로젝트 검사 단계에서 destinations 관문', 'Git push 단계'], a: 1,
      why: 'payment는 frontend.destinations에 없다. Argo CD가 적용 전에 거부하므로 클러스터에는 아무것도 닿지 않는다.' },
    { q: 'acme:frontend-devs 그룹이 frontend/web-app을 delete하려 하면 어떻게 되는가?',
      o: ['developer 역할에 delete가 없어 거부된다', 'get을 받았으니 delete도 된다', '글로벌 RBAC과 상관없이 항상 허용된다'], a: 0,
      why: 'developer 정책에는 get과 sync만 적었다. 적지 않은 동작은 allow가 없으니 거부된다.' },
    { q: 'production 프로젝트에서 금요일 15시(UTC)에 자동 sync는 어떻게 되는가?',
      o: ['allow 창 안이라 나간다', 'manualSync가 true라 자동으로 나간다', 'deny 창과 겹쳐 막힌다'], a: 2,
      why: '금요일 14시부터 10시간이 deny 창이다. allow 창(09~18시)과 겹치는 14~18시도 deny가 이긴다.' },
  ];

  const summary = [
    'default 프로젝트는 소스 repo, 대상, 리소스 종류가 모두 열려 있어 사고가 클러스터 전체로 번진다.',
    'AppProject는 sourceRepos, destinations, 리소스 화이트리스트 세 관문으로 배포 경계를 정한다.',
    'Application은 spec.project 한 줄로 경계에 들고, 벗어나면 Argo CD가 적용 전에 거부한다.',
    '프로젝트 roles로 누가 무엇을 할지 정하고, syncWindows로 언제 배포할지 정한다. deny 창이 allow보다 우선한다.',
  ];
  const review = [
    { q: '프론트팀 앱이 실수로 payment ns에 배포됐다. 그 앱은 project 필드를 적지 않았다. 가장 먼저 할 일은?',
      o: ['앱에 project: frontend를 적고 frontend.destinations를 web·landing으로 둔다', 'payment ns를 지운다', 'syncWindow를 추가한다'], a: 0,
      why: 'project를 비우면 default에 들어가 destinations가 "*"다. 팀 프로젝트에 넣어야 payment가 destinations 관문에서 막힌다.' },
    { q: 'frontend 앱에 ConfigMap을 하나 더했더니 sync가 거부됐다. 원인으로 맞는 것은?',
      o: ['sourceRepos에 repo가 없어서', 'namespaceResourceWhitelist에 ConfigMap이 없어서', 'deny 창 안이라서'], a: 1,
      why: '페이지의 frontend는 Deployment·Service·Ingress만 열었다. 목록에 없는 종류는 ns 리소스여도 거부된다.' },
    { q: '프로젝트 role로 developer에게 get·sync만 줬는데, 글로벌 argocd-rbac-cm에서 같은 그룹에 applications * 를 줬다. 결과는?',
      o: ['프로젝트 role이 더 좁으니 get·sync만 된다', '둘이 충돌해 아무것도 못 한다', '두 정책이 합쳐져 delete까지 된다'], a: 2,
      why: '글로벌 정책과 프로젝트 role은 합쳐서 평가된다. 어느 쪽이든 allow가 있고 deny가 없으면 통과하므로 글로벌 쪽을 좁혀야 한다.' },
  ];

  R.page({ title: 'AppProject 관문', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
