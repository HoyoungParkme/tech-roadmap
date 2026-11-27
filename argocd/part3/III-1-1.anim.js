/* III-1-1 App of Apps 패턴 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 이름·경로·리비전·retry 값은 페이지 코드(root-app.yaml, apps/web.yaml, apps-folder-tree.txt, delete-cascade.md)의 값이다.
 * retry 대기 5·10·20·40·80초는 backoff(5s, ×2, 최대 3m)를 그대로 계산한 값이다. HPA 가 바꾼 replicas 7 은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, person, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공용 부품 (Argo CD 그림) ----------
  const SCOL = { Synced: GOOD, Healthy: GOOD, OutOfSync: WARN, Progressing: INFO, Missing: BAD, Degraded: BAD, '수동 승인 대기': WARN };
  // Application 객체 카드: 왼쪽 sync 고리 아이콘 + 이름 (+ 상태)
  function app(cx, cy, name, o) { o = o || {}; const w = o.w || 176, h = o.h || (o.st ? 54 : 42), col = o.col || (o.parent ? ACC : INK);
    const g = R.G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 9, fill: o.fill || (o.parent ? ACCBG : PANEL), stroke: col, 'stroke-width': o.parent ? 2.6 : 2, 'stroke-dasharray': o.dash }, g);
    const ix = -w / 2 + 18;
    el('path', { d: `M${ix + 7},-3 A7,7 0 1 0 ${ix + 4},5`, fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
    el('path', { d: `M${ix + 3},-6 L${ix + 8},-3 L${ix + 10},-9`, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    mono(-w / 2 + 34, o.st ? -5 : 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: col }, g);
    if (o.st) { let x = -w / 2 + 34; o.st.forEach((s) => { tx(x, 16, s, { 'font-size': 13.5, 'font-weight': 700, fill: SCOL[s] || MUT }, g); x += tw(s, 13.5) + 10; }); }
    return g; }
  // finalizer 갈고리
  function hook(cx, cy, col, s) { const g = R.G(cx, cy, s ?? 1); el('path', { d: 'M0,-11 V4 A6,6 0 0 1 -12,4', fill: 'none', stroke: col || WARN, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); el('circle', { cx: 0, cy: -13, r: 3.5, fill: col || WARN }, g); return g; }
  function fileIco(cx, cy, col) { el('path', { d: `M${cx - 5},${cy - 7} h7 l4,4 v10 h-11 Z`, fill: PANEL, stroke: col || MUT, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }); }
  function dirIco(cx, cy, col) { el('path', { d: `M${cx - 7},${cy - 5} h5 l2,2 h7 v9 h-14 Z`, fill: col === ACC ? ACCBG : SOFT, stroke: col || MUT, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }); }
  // Git 저장소 판: rows [{t, d(들여쓰기), dir, col, hi, op, gone}]
  function repo(x, y, w, title, br, rows, o) { o = o || {}; const lh = o.lh || 25, h = o.h || 46 + rows.length * lh;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    el('circle', { cx: x + 16, cy: y + 14, r: 3.5, fill: 'none', stroke: MUT, 'stroke-width': 1.8 }); el('circle', { cx: x + 16, cy: y + 28, r: 3.5, fill: 'none', stroke: MUT, 'stroke-width': 1.8 });
    el('path', { d: `M${x + 16},${y + 17.5} V${y + 24.5} M${x + 26},${y + 14} C${x + 26},${y + 22} ${x + 16},${y + 20} ${x + 16},${y + 24}`, fill: 'none', stroke: MUT, 'stroke-width': 1.8 });
    mono(x + 34, y + 26, title, { 'font-size': 14.5, 'font-weight': 700, opacity: o.op ?? 1 });
    if (br) pill(x + w - tw(br, 13.5) / 2 - 22, y + 21, br, o.brCol || INFO, o.brS ?? 1, { fs: 13.5, mono: true });
    el('line', { x1: x, y1: y + 40, x2: x + w, y2: y + 40, stroke: GRID, 'stroke-width': 1.5 });
    const Y = (i) => y + 46 + i * lh + lh / 2 - 3;
    rows.forEach((r, i) => { const op = r.op ?? 1; if (op <= 0) return; const yy = Y(i), xx = x + 16 + (r.d || 0) * 18;
      if (r.hi) el('rect', { x: x + 6, y: yy - lh / 2 + 1, width: w - 12, height: lh - 2, rx: 5, fill: r.hi === true ? ACCBG : r.hi, opacity: op });
      (r.dir ? dirIco : fileIco)(xx + 6, yy, r.col);
      mono(xx + 20, yy + 5, r.t, { 'font-size': 14, fill: r.col || INK, opacity: op, 'font-weight': r.hi ? 700 : 400, 'text-decoration': r.gone ? 'line-through' : null }); });
    return { Y, h }; }
  // 네임스페이스 영역 (점선)
  const ns = (x, y, w, h, name, o) => { o = o || {}; zone(x, y, w, h, name, Object.assign({ fill: o.fill || 'none', stroke: o.stroke || GRID, dash: o.dash ?? '6 5', sw: 1.8, color: o.color }, o)); };
  // 쿠버네티스 리소스 칩
  const kres = (cx, cy, s, o) => { o = o || {}; return card(cx, cy, o.w || tw(s, 13.5) + 24, 28, { rx: 6, text: s, fs: 13.5, mono: true, fw: 700, stroke: o.col || INFO, color: o.col || INFO, fill: o.fill || INFOBG, s: o.s, op: o.op, dash: o.dash }); };
  // 작은 YAML 판: lines 는 문자열, o.hi(i) 강조, o.n 보이는 줄 수(소수면 마지막 줄 타이핑)
  function yml(x, y, w, lines, o) { o = o || {}; const lh = o.lh || 23, fs = o.fs || 14, n = o.n ?? lines.length;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    lines.slice(0, Math.ceil(n)).forEach((s, i) => { const yy = y + 12 + fs + i * lh, last = i === Math.ceil(n) - 1 && n % 1, part = last ? s.slice(0, Math.round(s.length * (n % 1))) : s;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: yy - fs, width: w - 8, height: lh, rx: 4, fill: ACCBG });
      const m = part.match(/^(\s*-?\s*)([\w.\-/"]+:)(.*)$/);
      if (part.trim().startsWith('#')) mono(x + 14, yy, part, { 'font-size': fs, fill: MUT });
      else if (m) R.spans(x + 14, yy, [[m[1], {}], [m[2], { fill: INFO, 'font-weight': 700 }], [m[3], { fill: INK }]], { 'font-size': fs });
      else mono(x + 14, yy, part, { 'font-size': fs, fill: INK }); });
    return { h: lines.length * lh + 18 }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const pathLine = (d, col, o) => { o = o || {}; el('path', { d, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'marker-end': o.arrow ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); };

  // ---------- 1. 왜 App of Apps ----------
  const T1 = { trunk: 372, root: [480, 92], kids: [175, 235, 295], kx: 505 };
  function tree1(c, names, o) { o = o || {}; const { k, u } = c;
    names.forEach((nm, i) => { const y = T1.kids[i], st = o.style ? o.style(i) : {};
      if (o.root) { const gu = o.growU ? o.growU(i) : 1; if (gu > 0) el('path', { d: `M${T1.trunk},118 V${lerp(118, y, gu)} ${gu >= 1 ? `H${T1.kx - 105}` : ''}`, fill: 'none', stroke: st.col || MUT, 'stroke-width': 2 }); }
      if ((st.s ?? 1) > 0) app(T1.kx, y, nm, { w: 210, s: st.s, op: st.op, dash: st.dash, col: st.col }); }); }
  function s1(t, c) { const { k, u } = c;
    ns(330, 30, 310, 352, 'argocd ns · Application 객체', { stroke: k === 5 ? ACC : GRID, color: k === 5 ? ACC : MUT, sw: k === 5 ? 2.5 : 1.8 });
    const names = ['web-app', 'api-app', 'worker-app'];
    if (k === 0) { person(150, 200, '운영자', {});
      names.forEach((nm, i) => { const a = 0.25 + i * 0.75; fly(190, 190, T1.kx - 40, T1.kids[i], seg(u, a, a + 0.6), 'kubectl apply', { mono: true, fill: INK }); });
      tree1(c, names, { style: (i) => ({ s: pop(u, 0.85 + i * 0.75), dash: '6 4' }) });
      const n = Math.min(3, Math.floor(seg(u, 0.25, 2.6) * 3.2));
      mono(150, 300, `apply × ${n}`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: n ? BAD : MUT });
      sub(150, 326, '서비스 30개면 30번', fade(u, 1.8)); sub(480, 360, '부모가 없다 · 회수도 손으로', fade(u, 2.2), { fill: WARN, 'font-weight': 700 });
      return; }
    // k ≥ 1: 왼쪽 저장소, 가운데 부모
    const fileRows = [{ t: 'apps/', dir: true, col: ACC, hi: k === 1 }, { t: 'web.yaml', d: 1 }, { t: 'api.yaml', d: 1 }, { t: 'worker.yaml', d: 1 }];
    if (k === 4) { fileRows[3].gone = true; fileRows[3].col = BAD; fileRows.push({ t: 'new.yaml', d: 1, col: GOOD, hi: GOODBG, op: fade(u, 0.5) }); }
    if (k === 1) fileRows.slice(1).forEach((r) => { r.op = 0; });
    if (k === 2) fileRows.slice(1).forEach((r, i) => { r.op = fade(u, 0.2 + i * 0.5); r.hi = seg(u, 0.2 + i * 0.5, 0.9 + i * 0.5) > 0 && seg(u, 0.2 + i * 0.5, 0.9 + i * 0.5) < 1; });
    const rp = repo(30, 50, 270, 'infra-gitops', 'main', fileRows, { op: k === 1 ? fade(u, 0.1) : 1 });
    const rs = k === 1 ? pop(u, 0.3) : 1;
    app(T1.root[0], T1.root[1], 'root-app', { parent: true, w: 200, s: rs });
    if (k === 1) { mono(150, 330, 'apply × 1', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      grow(T1.root[0] - 100, T1.root[1], 304, rp.Y(0), E(u, 0.9, 1.8), ACC);
      sub(150, 356, 'source: path=apps/', fade(u, 1.8), { class: 'mono', fill: ACC, 'font-weight': 700 }); return; }
    if (k === 2) { names.forEach((nm, i) => dot([[290, rp.Y(i + 1)], [T1.kx - 105, T1.kids[i]]], seg(u, 0.5 + i * 0.5, 1.2 + i * 0.5), ACC, 6));
      tree1(c, names, { root: true, growU: (i) => E(u, 0.9 + i * 0.5, 1.3 + i * 0.5), style: (i) => ({ s: pop(u, 1.2 + i * 0.5) }) });
      sub(165, 230, '파일 1개 = 자식 1개', fade(u, 2.2), { fill: ACC, 'font-weight': 700 }); return; }
    if (k === 3) { tree1(c, names, { root: true, style: (i) => ({ col: i === 0 ? ACC : INK }) });
      const rw = repo(660, 40, 270, 'acme/web', null, [{ t: 'k8s/', dir: true, hi: true }], { op: fade(u, 0.2) });
      grow(T1.kx + 105, T1.kids[0], 660, 80, E(u, 0.3, 1.0), ACC);
      ns(660, 140, 270, 230, 'web ns', { op: fade(u, 1.0) });
      ['Deployment', 'Service', 'Ingress'].forEach((s, i) => kres(795, 200 + i * 50, s, { w: 150, s: pop(u, 1.3 + i * 0.35) }));
      grow(795, 117, 795, 182, E(u, 1.0, 1.4), INFO); return; }
    if (k === 4) { const st = (i) => (i === 2 ? { dash: '6 4', col: BAD, op: 1 - 0.6 * E(u, 1.0, 1.8) } : {});
      tree1(c, names, { root: true, style: st });
      // 새 파일 → 새 자식
      el('path', { d: `M${T1.trunk},295 V352 H${T1.kx - 105}`, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.9) });
      app(T1.kx, 352, 'new-app', { w: 210, col: GOOD, s: pop(u, 1.0) });
      fly(150, 400, 150, 210, seg(u, 0.1, 0.8), 'git push', { mono: true, fill: INK });
      if (u > 1.0) cross(T1.kx + 120, 295, 9, pop(u, 1.4));
      ['apps/dev', 'apps/stg', 'apps/prd'].forEach((s, i) => { const y = 120 + i * 70; card(795, y, 200, 46, { rx: 8, text: s, fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.6 + i * 0.25) }); });
      sub(795, 340, '환경별로 트리를 가른다', fade(u, 2.3), { fill: ACC, 'font-weight': 700 }); return; }
    // k5 함정 3가지
    tree1(c, names, { root: true });
    pathLine(`M${T1.kx - 105},300 C345,300 345,92 ${T1.root[0] - 104},${T1.root[1]}`, BAD, { dash: '6 5', op: fade(u, 1.6), arrow: true });
    if (u > 1.9) cross(352, 196, 10, pop(u, 1.9));
    hook(T1.root[0] + 88, T1.root[1] - 26, WARN, pop(u, 0.9));
    [['① 자식도 argocd ns에 산다', ACC], ['② 부모 삭제 파급 = finalizer', WARN], ['③ 자식이 부모를 가리키면 무한 sync', BAD]].forEach(([s, col], i) => {
      card(795, 110 + i * 90, 270, 62, { rx: 10, stroke: col, sw: 2, s: pop(u, 0.3 + i * 0.6) }); note(672, 116 + i * 90, s, fade(u, 0.4 + i * 0.6), { 'font-size': 14.5, fill: col }); }); }

  // ---------- 2. 부모 Application ----------
  const B2 = [
    { sum: 'metadata: root-app @ argocd', lines: ['kind: Application', 'metadata:', '  name: root-app', '  namespace: argocd', '  finalizers:', '    - resources-finalizer.argocd…'] },
    { sum: 'source: infra-gitops / apps', lines: ['spec:', '  source:', '    repoURL: …/acme/infra-gitops.git', '    targetRevision: main', '    path: apps'] },
    { sum: 'directory: recurse, *.yaml', lines: ['    directory:', '      recurse: true', '      include: "*.yaml"'] },
    { sum: 'destination: in-cluster / argocd', lines: ['  destination:', '    server: https://kubernetes.default.svc', '    namespace: argocd'] },
    { sum: 'syncPolicy: prune, selfHeal', lines: ['  syncPolicy:', '    automated:', '      prune: true', '      selfHeal: true', '    syncOptions:', '      - ApplyOutOfSyncOnly=true'] },
  ];
  const R2 = [{ t: 'apps/', dir: true }, { t: 'web.yaml', d: 1 }, { t: 'api.yaml', d: 1 }, { t: 'worker.yaml', d: 1 }, { t: 'dev/', d: 1, dir: true }, { t: 'prd/', d: 1, dir: true }, { t: 'README.md', d: 1 }];
  function sw(x, y, on, label, op) { el('rect', { x, y: y - 10, width: 34, height: 20, rx: 10, fill: on ? GOOD : SOFT, stroke: on ? GOOD : GRID, 'stroke-width': 1.5, opacity: op }); el('circle', { cx: x + (on ? 24 : 10), cy: y, r: 7, fill: PANEL, opacity: op }); mono(x + 42, y + 5, label, { 'font-size': 13.5, fill: INK, opacity: op }); }
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: YAML 아코디언 (지난 블록은 한 줄 요약)
    if (k <= 5) { let y = 30;
      B2.slice(0, Math.min(k, 5)).forEach((b) => { check(48, y + 12, 7); mono(64, y + 17, b.sum, { 'font-size': 14, fill: MUT }); y += 28; });
      if (k < 5) { const b = B2[k]; yml(30, y + 6, 420, b.lines, { n: lerp(1, b.lines.length, E(u, 0.1, 1.6)), hi: (i) => i === b.lines.length - 1 && u > 1.6 }); }
      else { yml(30, y + 6, 420, ['$ kubectl apply -f root-app.yaml -n argocd'], { n: lerp(0.2, 1, E(u, 0.1, 0.5)) });
        ['① argocd ns에 root-app 등록', '② apps/ 폴더 스캔 → 자식 3개 발견', '③ 자식 3개를 argocd ns에 생성', '④ 자식마다 자기 매니페스트 적용'].forEach((s, i) => note(44, y + 86 + i * 34, s, fade(u, 0.5 + i * 0.45), { 'font-size': 15 })); } }
    else terminal(30, 40, 430, 230, ['$ argocd app list', 'NAME        STATUS    HEALTH', 'root-app    Synced    Healthy', 'web-app     Synced    Healthy', 'api-app     Synced    Healthy', 'worker-app  Synced    Healthy'], lerp(1, 6, E(u, 0.1, 1.4)), { title: '예시 출력 · 열 일부' });
    if (k === 6) sub(245, 300, '부모와 자식이 한 목록에 나란히 선다', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 });
    // 오른쪽: argocd ns + 저장소
    ns(470, 30, 205, 375, 'argocd ns', { stroke: k === 3 ? ACC : GRID, color: k === 3 ? ACC : MUT });
    app(572, 82, 'root-app', { parent: true, w: 180, s: k === 0 ? pop(u, 0.2) : 1 });
    hook(652, 52, WARN, k === 0 ? pop(u, 0.9) : 1);
    if (k === 0) { sub(572, 132, 'finalizer: 지울 때 자식 회수', fade(u, 1.3), { fill: WARN, 'font-weight': 700 }); }
    const rows = R2.map((r, i) => Object.assign({}, r, { op: k === 0 ? 0 : 1 }));
    if (k === 1) rows[0].hi = true;
    if (k === 4 && u > 1.6) { rows[3].gone = true; rows[3].col = BAD; }
    if (k === 2) { const p = E(u, 0.3, 2.0) * 7; rows.forEach((r, i) => { if (p > i && p < i + 1.4) r.hi = INFOBG; }); if (u > 2.0) { rows[6].gone = true; rows[6].col = OFF; } rows[4].col = rows[5].col = u > 0.9 ? ACC : null; }
    const rp = repo(690, 30, 240, 'infra-gitops', 'main', rows, { op: k === 0 ? 0.35 : 1 });
    if (k === 0) return;
    if (k === 1) { grow(662, 82, 690, rp.Y(0), E(u, 0.3, 1.2), ACC); sub(572, 132, 'path: apps', fade(u, 1.2), { class: 'mono', fill: ACC, 'font-weight': 700 }); return; }
    if (k === 2) { dot([[700, rp.Y(0)], [700, rp.Y(6)]], seg(u, 0.3, 2.0), INFO, 6); sub(572, 132, 'recurse: 하위 폴더까지', fade(u, 1.0), { fill: INFO, 'font-weight': 700 }); return; }
    const slots = [230, 290, 350];
    if (k === 3) { [1, 2, 3].forEach((r, i) => { grow(690, rp.Y(r), 664, slots[i], E(u, 0.3 + i * 0.3, 1.0 + i * 0.3), INFO, { dash: '5 4' }); app(572, slots[i], '', { w: 180, dash: '6 5', col: GRID, op: fade(u, 0.9 + i * 0.3) }); });
      sub(572, 160, '자식이 놓일 곳 = argocd', fade(u, 1.6), { fill: ACC, 'font-weight': 700 }); return; }
    if (k === 4) { [['prune', 0.3], ['selfHeal', 0.8], ['ApplyOutOfSyncOnly', 1.3]].forEach(([s, a], i) => sw(480, 140 + i * 34, u > a + 0.3, s, fade(u, a)));
      mono(700, 300, 'worker.yaml 삭제', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
      mono(700, 324, '→ worker-app 회수', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    ['web-app', 'api-app', 'worker-app'].forEach((nm, i) => { const s = k === 5 ? pop(u, 1.4 + i * 0.3) : 1;
      if (k === 5) dot([[690, rp.Y(i + 1)], [664, slots[i]]], seg(u, 0.9 + i * 0.3, 1.5 + i * 0.3), ACC, 6);
      app(572, slots[i], nm, { w: 180, s, st: k === 6 || u > 2.2 ? ['Synced', 'Healthy'] : null, h: 54 }); }); }

  // ---------- 3. 자식 Application ----------
  function s3(t, c) { const { k, u } = c;
    ns(30, 30, 260, 210, 'argocd ns');
    const cs = k === 0 ? pop(u, 1.0) : 1;
    if (k === 0) fly(160, 400, 160, 100, seg(u, 0.2, 1.0), 'apps/web.yaml', { mono: true, fill: INK });
    app(160, 100, 'web-app', { w: 190, s: cs, col: k === 0 ? INK : ACC });
    if (k >= 1) { pill(105, 150, 'team: frontend', INFO, k === 1 ? pop(u, 0.3) : 1, { fs: 13.5, mono: true }); pill(232, 150, 'env: prd', INFO, k === 1 ? pop(u, 0.6) : 1, { fs: 13.5, mono: true });
      hook(252, 72, WARN, k === 1 ? pop(u, 1.0) : 1); }
    if (k >= 2) { const rrows = [{ t: 'k8s/', dir: true }, { t: 'base/', d: 1, dir: true }, { t: 'overlays/', d: 1, dir: true }, { t: 'prd/', d: 2, dir: true, hi: true, col: ACC }];
      repo(320, 30, 280, 'acme/web', 'v2.3.1', rrows, { op: k === 2 ? fade(u, 0.2) : 1, brCol: ACC, brS: k === 2 ? pop(u, 0.8) : 1 });
      grow(256, 100, 318, 80, k === 2 ? E(u, 0.2, 0.8) : 1, ACC); }
    if (k >= 4) { ns(630, 30, 300, 210, 'web ns', { stroke: k === 5 ? ACC : GRID, color: k === 5 ? ACC : MUT, dash: k === 5 ? null : '6 5', op: k === 5 ? E(u, 0.2, 0.9) : 1 });
      grow(600, 120, 650, 120, k === 4 ? E(u, 0.2, 0.7) : 1, INFO);
      ['Deployment prd-web', 'Service prd-web', 'Ingress prd-web'].forEach((s, i) => kres(780, 85 + i * 50, s, { w: 230, s: k === 4 ? pop(u, 0.7 + i * 0.3) : 1 }));
      if (k === 7) { el('circle', { cx: 912, cy: 85, r: 13, fill: WARNBG, stroke: WARN, 'stroke-width': 2 }); mono(912, 90, 'H', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' }); } }
    // 아래 칸: beat 마다 한 가지
    const by = 262;
    if (k === 0) { mono(480, by + 40, 'metadata.namespace: argocd', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.3) });
      sub(480, by + 72, '부모가 apps/를 훑어 이 파일을 Application 객체로 만든다', fade(u, 1.8)); }
    if (k === 1) { note(120, by + 40, '라벨 → 목록 필터, 권한 나누기에 쓴다', fade(u, 0.6)); note(120, by + 80, 'finalizer → 이 앱을 지울 때 워크로드까지 지운다', fade(u, 1.2), { fill: WARN }); }
    if (k === 2) { // 브랜치는 움직이고 태그는 박힌다
      el('line', { x1: 140, y1: by + 60, x2: 820, y2: by + 60, stroke: GRID, 'stroke-width': 3 });
      const n = 8, head = Math.min(n - 1, 4 + Math.floor(E(u, 0.6, 2.4) * 3.99));
      for (let i = 0; i < n; i++) el('circle', { cx: 160 + i * 90, cy: by + 60, r: 8, fill: i <= head ? PANEL : SOFT, stroke: i <= head ? INK : GRID, 'stroke-width': 2 });
      pill(160 + 3 * 90, by + 22, 'tag v2.3.1', ACC, pop(u, 0.4), { fs: 13.5, mono: true }); el('line', { x1: 430, y1: by + 36, x2: 430, y2: by + 51, stroke: ACC, 'stroke-width': 2 });
      pill(160 + head * 90, by + 100, 'main', INFO, 1, { fs: 13.5, mono: true });
      sub(480, by + 140, '운영은 움직이지 않는 태그를 가리킨다', fade(u, 1.8), { fill: ACC, 'font-weight': 700 }); }
    if (k === 3) { const rows = [['Deployment 이름', 'web', 'prd-web'], ['Service 이름', 'web', 'prd-web'], ['image', 'acme/web', 'acme/web:v2.3.1']];
      tx(150, by + 22, 'kustomize 렌더링', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      rows.forEach(([a, b, d], i) => { const y = by + 58 + i * 38, op = fade(u, 0.3 + i * 0.45);
        tx(150, y, a, { 'font-size': 14.5, fill: MUT, opacity: op }); mono(390, y, b, { 'font-size': 15, opacity: op });
        grow(530, y - 5, 600, y - 5, E(u, 0.6 + i * 0.45, 1.0 + i * 0.45), ACC); mono(620, y, d, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9 + i * 0.45) }); }); }
    if (k === 4) { card(270, by + 70, 380, 92, { rx: 10, stroke: ACC, s: pop(u, 0.8) }); mono(100, by + 62, 'metadata.namespace: argocd', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) }); sub(270, by + 92, 'Application 객체가 사는 곳', fade(u, 1.0));
      card(700, by + 70, 380, 92, { rx: 10, stroke: INFO, s: pop(u, 1.3) }); mono(530, by + 62, 'destination.namespace: web', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) }); sub(700, by + 92, '워크로드가 배포되는 곳', fade(u, 1.5)); }
    if (k === 5) { const steps = [['① web ns 생성', 'CreateNamespace=true', ACC], ['② 리소스 apply', 'Deployment·Service·Ingress', INFO], ['③ prune은 맨 끝', 'PruneLast=true', WARN]];
      steps.forEach(([a, b, col], i) => { const x = 170 + i * 310, s = pop(u, 0.4 + i * 0.55); card(x, by + 70, 270, 74, { rx: 10, stroke: col, s }); tx(x, by + 64, a, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.5 + i * 0.55) }); mono(x, by + 88, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.55) });
        if (i < 2) grow(x + 138, by + 70, x + 170, by + 70, E(u, 0.8 + i * 0.55, 1.1 + i * 0.55), MUT); }); }
    if (k === 6) { const X = (s) => 80 + s * 4.6, waits = [5, 10, 20, 40, 80];
      el('line', { x1: X(0), y1: by + 90, x2: X(180), y2: by + 90, stroke: MUT, 'stroke-width': 1.8 });
      [0, 60, 120, 180].forEach((s) => { el('line', { x1: X(s), y1: by + 90, x2: X(s), y2: by + 96, stroke: MUT }); mono(X(s), by + 114, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      el('line', { x1: X(180), y1: by + 20, x2: X(180), y2: by + 90, stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }); mono(X(180) - 6, by + 18, 'maxDuration 3m', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end' });
      let at = 0; cross(X(0), by + 64, 7, pop(u, 0.2));
      waits.forEach((w, i) => { const a = 0.4 + i * 0.4, g = E(u, a, a + 0.35);
        el('rect', { x: X(at) + 2, y: by + 56, width: Math.max(1, (w * 4.6 - 4) * g), height: 16, rx: 3, fill: WARN, opacity: i % 2 ? 0.5 : 0.85 });
        if (g > 0.9) mono(X(at + w / 2), by + 48, w + 's', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
        at += w; if (g >= 1) { if (i < 4) cross(X(at), by + 64, 6, 1); else el('circle', { cx: X(at), cy: by + 64, r: 7, fill: INFO }); } });
      sub(480, by + 146, '재시도 5번 · 기다린 시간 합 155초 · 한 번도 3분 상한에 안 닿는다', fade(u, 2.4), { 'font-weight': 700, fill: INK }); }
    if (k === 7) { const rows = [['필드', 'Git', '클러스터', '판정'], ['/spec/replicas', '5', String(Math.round(tween(5, 7, u, 1.0))), '무시'], ['image', 'v2.3.1', 'v2.3.1', '같음']];
      rows.forEach((r, i) => { const y = by + 30 + i * 36, hd = i === 0;
        [110, 330, 450, 590].forEach((x, j) => (j === 0 || hd ? tx : mono)(x, y, r[j], { 'font-size': hd ? 13.5 : 15, fill: hd ? MUT : j === 3 ? (r[j] === '무시' ? WARN : GOOD) : INK, 'font-weight': hd ? 600 : 700, opacity: hd ? 1 : fade(u, 0.3 + i * 0.4), 'text-decoration': i === 1 && j >= 1 && j <= 2 && u > 1.6 ? 'line-through' : null })); });
      sub(470, by + 66, '← HPA가 7로 (예시)', fade(u, 1.0), { fill: WARN, 'font-weight': 700, 'text-anchor': 'start' });
      app(820, by + 70, 'web-app', { w: 190, st: ['Synced'], s: pop(u, 1.9), h: 54 }); }
    if (k === 8) { const P = [[150, by + 70], [480, by + 70], [810, by + 70]];
      app(P[0][0], P[0][1], 'root-app', { parent: true, w: 180 }); app(P[1][0], P[1][1], 'web-app', { w: 180, s: pop(u, 0.9) }); kres(P[2][0], P[2][1], 'Deployment · Service · Ingress', { w: 250, s: pop(u, 2.0) });
      grow(242, by + 70, 388, by + 70, E(u, 0.2, 0.8), ACC); sub(315, by + 54, 'sync ① 부모', fade(u, 0.3), { fill: ACC, 'font-weight': 700 });
      grow(572, by + 70, 683, by + 70, E(u, 1.3, 1.9), INFO); sub(628, by + 54, 'sync ② 자식', fade(u, 1.4), { fill: INFO, 'font-weight': 700 });
      dot([[242, by + 70], [388, by + 70]], seg(u, 0.2, 0.8), ACC, 6); dot([[572, by + 70], [683, by + 70]], seg(u, 1.3, 1.9), INFO, 6);
      sub(480, by + 130, 'argocd ns의 객체 → web ns의 워크로드', fade(u, 2.2), { 'font-weight': 700, fill: INK }); } }

  // ---------- 4. 다중 환경 ----------
  const L4 = [470, 650, 830];
  function s4(t, c) { const { k, u } = c;
    let rows;
    if (k !== 7) { rows = [{ t: 'root-app.yaml' }, { t: 'apps/', dir: true }, { t: 'dev/', d: 1, dir: true, col: ACC }, { t: 'web.yaml', d: 2, hi: k >= 2 && k <= 3 }, { t: 'api.yaml', d: 2 }, { t: 'worker.yaml', d: 2 },
        { t: 'stg/', d: 1, dir: true, col: ACC }, { t: 'prd/', d: 1, dir: true, col: ACC }, { t: 'web.yaml', d: 2, hi: k >= 4 && k <= 6 }];
      if (k === 0) rows.forEach((r, i) => { r.op = i <= 5 ? fade(u, 0.2 + i * 0.25) : 0; });
      if (k === 1) rows.forEach((r, i) => { if (i >= 6) r.op = fade(u, 0.3 + (i - 6) * 0.35); });
      if (k === 1 && u > 1.2) rows.forEach((r) => { if (r.dir && r.d === 1) r.hi = INFOBG; });
      repo(30, 30, 300, 'infra-gitops', 'main', rows); }
    else { rows = [{ t: 'k8s/', dir: true }, { t: 'base/', d: 1, dir: true, col: INFO }, { t: 'deployment.yaml', d: 2 }, { t: 'service.yaml', d: 2 }, { t: 'overlays/', d: 1, dir: true, col: ACC },
        { t: 'dev/  replicas=1', d: 2, dir: true, hi: true }, { t: 'stg/', d: 2, dir: true }, { t: 'prd/  replicas=5', d: 2, dir: true, hi: true }];
      rows.forEach((r, i) => { r.op = fade(u, 0.1 + i * 0.12); }); repo(30, 30, 300, 'acme/web', null, rows); }
    const envs = ['dev', 'stg', 'prd'];
    envs.forEach((e, i) => { const x = L4[i], show = i === 0 || k >= 1, op = i === 0 && k === 0 ? fade(u, 1.6) : i > 0 && k === 1 ? fade(u, 0.8 + i * 0.3) : 1;
      if (!show) return; lbl(x, 46, e, op, { 'font-size': 17, fill: ACC }); el('line', { x1: x - 80, y1: 58, x2: x + 80, y2: 58, stroke: GRID, 'stroke-width': 1.5, opacity: op }); });
    // 앱 카드
    const shown = (i) => (i === 0 ? k >= 2 : i === 2 ? k >= 4 : k >= 2);
    envs.forEach((e, i) => { if (!shown(i)) return; const fresh = (i === 0 && k === 2) || (i === 2 && k === 4), ghost = i === 1 && k < 8;
      const st = k === 8 ? (i === 2 ? ['OutOfSync'] : ['Synced']) : null;
      app(L4[i], 100, 'web-' + e, { w: 168, s: fresh ? pop(u, 0.3) : 1, dash: ghost ? '6 4' : null, col: ghost ? MUT : i === 2 ? WARN : ACC, st, h: st ? 54 : 42 });
      if (i === 0 && k >= 2) pill(L4[0], 146, 'env: dev', INFO, k === 2 ? pop(u, 0.9) : 1, { fs: 13.5, mono: true });
      if (i === 1 && k >= 2 && k < 8) sub(L4[1], 150, 'dev와 같은 모양', 1); });
    if (k === 2) dot([[300, 168], [L4[0] - 84, 100]], seg(u, 0.2, 0.8), ACC, 6);
    if (k === 4) dot([[300, 268], [L4[2] - 84, 100]], seg(u, 0.1, 0.6), ACC, 6);
    // 리비전과 네임스페이스
    const nsY = 210;
    if (k >= 3) { pill(L4[0], 182, 'main', INFO, k === 3 ? pop(u, 0.2) : 1, { fs: 13.5, mono: true });
      if (k === 3) for (let j = 0; j < 3; j++) dot([[L4[0] - 70, 182], [L4[0] - 30, 182]], (t * 0.6 + j / 3) % 1, INFO, 4);
      ns(L4[0] - 84, nsY, 168, 150, 'web-dev', { op: k === 3 ? fade(u, 1.0) : 1, stroke: k === 3 ? ACC : GRID }); }
    if (k >= 3) { ns(L4[1] - 84, nsY, 168, 150, 'web-stg', { op: k === 3 ? fade(u, 1.4) : 1 }); pill(L4[1], 182, 'main', INFO, k === 3 ? pop(u, 1.4) : 1, { fs: 13.5, mono: true }); }
    if (k >= 4) { const lk = k === 4 ? pop(u, 0.9) : 1; R.lock(L4[2] + 100, 100, true, WARN, lk); if (k === 4) sub(L4[2], 150, 'project: production', fade(u, 1.2), { class: 'mono', fill: WARN, 'font-weight': 700 }); }
    if (k >= 5) { pill(L4[2], 182, 'tag v2.3.1', ACC, k === 5 ? pop(u, 0.3) : 1, { fs: 13.5, mono: true }); ns(L4[2] - 84, nsY, 168, 150, 'web', { op: k === 5 ? fade(u, 0.9) : 1, stroke: k === 5 ? ACC : GRID }); }
    if (k === 6 || k === 8) { [0, 1].forEach((i) => { grow(L4[i] + 64, 128, L4[i] + 64, 206, k === 6 ? E(u, 0.3, 0.8) : 1, GOOD); }); sub(L4[0], 400, '자동 sync', k === 6 ? fade(u, 0.6) : 1, { fill: GOOD, 'font-weight': 700 }); sub(L4[1], 400, '자동 sync', k === 6 ? fade(u, 0.6) : 1, { fill: GOOD, 'font-weight': 700 }); }
    if (k === 6) { person(L4[2] - 40, 300, null, { s: pop(u, 1.0) }); card(L4[2] + 30, 290, 92, 34, { rx: 8, text: 'SYNC', fs: 14, stroke: WARN, color: WARN, s: pop(u, 1.4) });
      if (u > 2.0) dot([[L4[2] + 30, 272], [L4[2] + 30, 125]], seg(u, 2.0, 2.6), WARN, 6); sub(L4[2], 400, '사람이 승인', fade(u, 1.6), { fill: WARN, 'font-weight': 700 }); }
    if (k === 7) { const pods = [1, null, 5];
      pods.forEach((n, i) => { if (n == null) { sub(L4[i], 300, 'overlay 값', 1); return; }
        for (let j = 0; j < n; j++) { const s = pop(u, 0.8 + j * 0.15); const x = L4[i] - 52 + (j % 3) * 52, y = 270 + Math.floor(j / 3) * 46; card(x, y, 40, 34, { rx: 6, text: '', stroke: INFO, fill: INFOBG, s }); }
        mono(L4[i], 352, 'replicas ' + n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.6) }); }); }
    if (k === 8) { sub(L4[2], 400, '수동 승인 대기', 1, { fill: WARN, 'font-weight': 700 }); check(L4[0], 290, 14, pop(u, 0.3)); check(L4[1], 290, 14, pop(u, 0.5));
      el('circle', { cx: L4[2], cy: 290, r: 16, fill: 'none', stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '4 4', opacity: fade(u, 0.7) }); } }

  // ---------- 5. 부모 삭제 ----------
  const T5 = { root: [480, 78], kids: [[200, 190], [480, 190], [760, 190]], wl: 300 };
  const CASE5 = { 0: 1, 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 7: 1 };
  function s5(t, c) { const { k, u } = c;
    if (k === 6) { tx(480, 46, '부모를 지우기 전에', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      const items = ['백업  argocd app list -o yaml', '자식 목록  argocd app resources root-app', 'dry-run  kubectl delete … --dry-run=server', 'finalizer 확인  get app -o yaml', '영향 범위 공유', '실제 삭제', '회수 모니터링  watch argocd app list'];
      items.forEach((s, i) => { const y = 92 + i * 44, a = 0.2 + i * 0.32, on = u > a + 0.25;
        el('rect', { x: 200, y: y - 13, width: 24, height: 24, rx: 5, fill: on ? GOODBG : PANEL, stroke: on ? GOOD : GRID, 'stroke-width': 2 }); if (on) check(212, y, 7, 1);
        const [h, ...rest] = s.split('  '); note(240, y + 6, h, fade(u, a), { 'font-size': 15.5 }); if (rest.length) mono(240 + tw(h, 15.5) + 14, y + 6, rest.join(' '), { 'font-size': 14, fill: MUT, opacity: fade(u, a) }); });
      return; }
    if (k === 8) { const cols = ['부모', '자식 App', '워크로드'], rows = [['케이스 1 · 둘 다 finalizer', ['삭제', '삭제', '삭제']], ['케이스 2 · 부모에 없음', ['삭제', '남음', '남음']], ['케이스 3 · 자식에 없음', ['삭제', '삭제', '남음']]];
      cols.forEach((s, j) => lbl(520 + j * 150, 70, s, 1, { fill: MUT, 'font-size': 15 }));
      rows.forEach(([nm, v], i) => { const y = 130 + i * 80; tx(60, y + 6, nm, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.5) });
        v.forEach((s, j) => { const ok = s === '삭제', sc = pop(u, 0.4 + i * 0.5 + j * 0.12); card(520 + j * 150, y, 120, 48, { rx: 8, text: s, fs: 15, stroke: ok ? GOOD : WARN, color: ok ? GOOD : WARN, fill: ok ? GOODBG : WARNBG, s: sc }); }); });
      sub(480, 390, 'syncPolicy의 prune은 이 표의 어느 칸도 바꾸지 않는다', fade(u, 2.0), { 'font-weight': 700, fill: INK });
      return; }
    const cs = CASE5[k], rootHook = cs !== 2, kidHook = cs === 1;
    const caseName = { 1: '케이스 1 · 부모·자식 모두 finalizer', 2: '케이스 2 · 부모에 finalizer 없음', 3: '케이스 3 · 자식에 finalizer 없음' }[cs];
    if (k !== 7) tx(30, 34, caseName, { 'font-size': 15, 'font-weight': 700, fill: cs === 1 ? GOOD : WARN });
    // 삭제 진행 (k 1, 3, 5)
    const del = k === 1 || k === 3 || k === 5;
    const tRoot = k === 1 ? E(u, 2.0, 2.5) : k === 3 ? E(u, 0.4, 0.9) : k === 5 ? E(u, 2.0, 2.5) : 0;
    const tKid = k === 1 ? E(u, 1.3, 1.8) : k === 5 ? E(u, 0.9, 1.4) : 0;
    const tWl = k === 1 ? E(u, 0.6, 1.1) : 0;
    const rootCol = del && u > 0.2 ? BAD : ACC;
    app(T5.root[0], T5.root[1], 'root-app', { parent: true, w: 190, col: rootCol, op: 1 - 0.85 * tRoot, dash: tRoot > 0 ? '6 4' : null, s: k === 0 || k === 2 || k === 4 ? pop(u, 0.1) : 1 });
    if (rootHook && tRoot < 0.5) hook(T5.root[0] + 104, T5.root[1] - 22, WARN, k === 0 || k === 4 ? pop(u, 0.6) : 1);
    if (k === 2) { fly(T5.root[0] + 104, T5.root[1] - 22, T5.root[0] + 250, T5.root[1] - 60, seg(u, 0.4, 1.4), '− finalizer', { fill: BAD }); }
    if (del) mono(T5.root[0] + 110, T5.root[1] + 6, 'deletionTimestamp', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.3) * (1 - tRoot) });
    T5.kids.forEach(([x, y], i) => { const nm = ['web-app', 'api-app', 'worker-app'][i];
      el('line', { x1: T5.root[0], y1: T5.root[1] + 22, x2: x, y2: y - 22, stroke: GRID, 'stroke-width': 2, opacity: 1 - tRoot });
      const orphan = cs === 2 && (k === 3 && u > 0.9);
      app(x, y, nm, { w: 176, op: 1 - 0.85 * tKid, dash: tKid > 0 ? '6 4' : null, col: orphan ? WARN : tKid > 0 ? BAD : INK, s: k === 7 && i === 1 ? 1 : 1 });
      if (orphan) sub(x, y + 40, '고아', fade(u, 1.0), { fill: WARN, 'font-weight': 800, 'font-size': 15 });
      if (kidHook && tKid < 0.5) hook(x + 96, y - 20, WARN, k === 0 ? pop(u, 1.0 + i * 0.2) : 1);
      ns(x - 110, 250, 220, 112, ['web', 'api', 'worker'][i] + ' ns', { stroke: GRID });
      const gone = tWl, left = (cs === 3 && k === 5 && u > 1.6) || (cs === 2 && k === 3 && u > 1.3);
      ['Deployment', 'Service'].forEach((s, j) => kres(x, 292 + j * 36, s, { w: 140, op: 1 - 0.85 * gone, col: left ? WARN : gone > 0 ? BAD : INFO, fill: left ? WARNBG : gone > 0 ? BADBG : INFOBG, dash: gone > 0 ? '5 4' : null }));
      if (left) sub(x, 384, '남음 (수동 정리)', fade(u, cs === 3 ? 1.8 : 1.5), { fill: WARN, 'font-weight': 700 }); });
    if (k === 1) { const st = ['① deletionTimestamp', '② 워크로드 삭제', '③ 자식 삭제', '④ 부모 삭제'];
      st.forEach((s, i) => { const a = [0.2, 0.6, 1.3, 2.0][i]; tx(30 + i * 230, 408, s, { 'font-size': 14.5, 'font-weight': 700, fill: u > a ? BAD : OFF }); }); }
    if (k === 7) { tx(30, 408, '회수가 멈췄을 때: 원인을 본 뒤 마지막 수단으로 finalizer를 뗀다', { 'font-size': 15, 'font-weight': 700, fill: BAD });
      pill(T5.kids[1][0], T5.kids[1][1] + 40, '삭제 중 멈춤', BAD, pop(u, 0.3), { fs: 13.5 });
      terminal(16, 16, 362, 108, ['$ kubectl patch app api-app --type=merge \\', "  -p '{\"metadata\":{\"finalizers\":null}}'", '# 원인 확인 뒤 마지막 수단'], lerp(0, 3, E(u, 0.8, 2.0)), { fs: 13.5, lh: 21 });
      if (u > 2.1) cross(T5.kids[1][0] + 96, T5.kids[1][1] - 20, 9, pop(u, 2.1)); } }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'App of Apps에서 사람이 kubectl apply 하는 대상은 무엇인가?',
      o: ['서비스마다 만든 자식 Application 전부', '부모 Application 하나', '자식이 배포할 Deployment들'], a: 1,
      why: '부모 root-app 하나만 apply 하면 그 source인 apps/ 폴더의 YAML이 자식 Application으로 만들어진다. 서비스가 30개여도 apply는 1번이다.' },
    { q: '부모 root-app의 destination.namespace가 argocd인 이유는 무엇인가?',
      o: ['부모가 만드는 것이 워크로드가 아니라 Application 객체라서', 'argocd ns가 가장 권한이 넓어서', '자식 워크로드도 전부 argocd ns에 배포하려고'], a: 0,
      why: '부모의 source인 apps/ 안에는 kind: Application YAML이 들어 있다. Application 객체는 argocd ns에 살아야 하므로 부모의 배포 대상도 argocd다.' },
    { q: 'apps/web.yaml에서 metadata.namespace와 destination.namespace의 차이는 무엇인가?',
      o: ['둘 다 워크로드가 배포될 곳이다', '앞은 Git 리포 이름, 뒤는 클러스터 이름이다', '앞은 Application 객체가 사는 곳, 뒤는 워크로드가 가는 곳이다'], a: 2,
      why: 'web-app 객체는 argocd ns에 만들어지고, 그 Deployment·Service·Ingress는 destination인 web ns에 배포된다.' },
    { q: 'apps/prd/web.yaml이 dev와 달리 sync 후 OutOfSync로 머무는 까닭은 무엇인가?',
      o: ['syncPolicy에 automated가 없어 사람이 sync를 눌러야 해서', 'v2.3.1 태그가 Git에 없어서', 'prd 폴더를 recurse가 찾지 못해서'], a: 0,
      why: 'prd 자식은 automated를 빼고 syncOptions만 남겼다. 변경을 감지해도 수동 승인 뒤에야 sync되므로 그 전까지 OutOfSync다.' },
    { q: '부모에는 finalizer가 있고 자식에는 없을 때 root-app을 지우면 무엇이 남는가?',
      o: ['아무것도 남지 않는다', '자식 Application과 워크로드 모두', '자식이 배포한 워크로드'], a: 2,
      why: '부모의 finalizer가 자식 Application을 지우지만, 자식에 finalizer가 없으니 그 Deployment·Service는 지울 주체가 없어 남는다.' },
  ];

  const summary = [
    'Application을 서비스마다 손으로 만들면 30개면 30번 apply하고 회수도 사람이 챙긴다.',
    '부모 root-app 하나만 apply하면 apps/ 폴더의 YAML이 자식 Application으로 생긴다.',
    '자식 객체는 argocd ns에 살고, 워크로드는 destination.namespace로 간다.',
    '부모를 지울 때 회수 범위는 부모와 자식의 finalizer가 정한다. prune 값과는 상관없다.',
  ];
  const review = [
    { q: 'apps/에서 worker.yaml을 지우고 push했는데 worker-app이 그대로 있다. 먼저 볼 것은?',
      o: ['부모 root-app의 automated.prune이 켜져 있는지', '자식 worker-app의 targetRevision', 'argocd ns의 리소스 쿼터'], a: 0,
      why: '부모 syncPolicy의 prune이 꺼져 있으면 Git에서 사라진 자식 Application을 지우지 않는다. 페이지의 root-app은 prune: true로 이 회수를 맡긴다.' },
    { q: 'HPA가 Deployment replicas를 늘릴 때마다 selfHeal이 다시 줄여 버린다. 맞는 조치는?',
      o: ['selfHeal을 부모에서만 끈다', 'ignoreDifferences에 /spec/replicas를 넣는다', 'retry limit을 5에서 늘린다'], a: 1,
      why: 'ignoreDifferences로 /spec/replicas를 diff에서 빼면 HPA가 바꾼 값이 드리프트로 잡히지 않아 selfHeal과 부딪히지 않는다.' },
    { q: '연습 클러스터에서 root-app을 지웠더니 web ns의 Deployment가 남았다. 자식 web-app도 지워진 상태다. 원인은?',
      o: ['부모에 finalizer가 없었다', '부모의 prune이 false였다', '자식 web-app에 finalizer가 없었다'], a: 2,
      why: '자식 Application까지 지워졌으니 부모 finalizer는 동작했다. 워크로드가 남은 것은 자식에 finalizer가 없어서이고, prune 값은 삭제 회수와 상관없다.' },
  ];

  R.page({ title: 'App of Apps 트리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
