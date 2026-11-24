/* V-1-2 Helm 패키지 매니저 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const D = (c) => c.beat.dataState;

  // 파일 아이콘 (모서리 접힌 종이)
  function paper(x, y, w, h, o) { o = o || {}; const f = 12;
    el('path', { d: `M${x},${y} h${w - f} l${f},${f} v${h - f} h${-w} z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 1.8, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); }
  // 폴더 트리 (Chart 안의 파일)
  const KIND = { meta: INFO, values: WARN, template: ACC };
  function tree(x, y, files, o) { o = o || {};
    tx(x, y, 'mychart/', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: o.op ?? 1 });
    files.forEach((f, i) => { const yy = y + 34 + i * 34, nw = o.fresh && o.fresh(f), op = (nw ? fade(o.u, 0.2 + (o.order ? o.order(f) : 0) * 0.3) : 1) * (o.op ?? 1);
      el('line', { x1: x + 8, y1: yy - 24, x2: x + 8, y2: yy - 5, stroke: GRID, 'stroke-width': 1.5, opacity: op }); el('line', { x1: x + 8, y1: yy - 5, x2: x + 22, y2: yy - 5, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      el('rect', { x: x + 26, y: yy - 13, width: 10, height: 13, rx: 2, fill: KIND[f.kind] || MUT, opacity: op });
      mono(x + 44, yy, f.name, { 'font-size': 14, 'font-weight': o.hi === f.name ? 800 : 500, fill: o.hi === f.name ? INK : MUT, opacity: op });
      if (o.check) check(x + 280, yy - 5, 8, o.check(i)); }); }
  // Pod 동그라미 n 개 (tag 표기)
  function pods(x, y, n, tag, col, o) { o = o || {};
    for (let i = 0; i < n; i++) { const cx = x + i * 70, s = o.pop ? pop(o.u, o.pop + i * 0.2) : 1, c = typeof col === 'function' ? col(i) : col, t = typeof tag === 'function' ? tag(i) : tag;
      el('circle', { cx, cy: y, r: 30 * s, fill: PANEL, stroke: c, 'stroke-width': 2.5 }); tx(cx, y - 3, 'Pod', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: c, opacity: s });
      mono(cx, y + 14, t, { 'text-anchor': 'middle', 'font-size': 13.5, fill: c, opacity: s }); } }
  // revision 상자
  function rev(x, y, n, tag, status, o) { o = o || {}; const col = status === 'deployed' ? GOOD : status === 'superseded' ? MUT : WARN;
    card(x, y, 150, 62, { rx: 10, stroke: col, sw: status === 'deployed' ? 2.8 : 1.8, s: o.s, op: o.op, fill: status === 'deployed' ? 'var(--goodbg)' : PANEL });
    if ((o.s ?? 1) > 0.5) { tx(x, y - 8, 'REVISION ' + n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, opacity: o.op ?? 1 });
      mono(x, y + 16, tag + ' · ' + status, { 'text-anchor': 'middle', 'font-size': 13.5, fill: col, opacity: o.op ?? 1 }); } }

  // 1. yaml 사본 지옥
  const KINDS = ['Deployment', 'Service', 'Ingress', 'ConfigMap', 'Secret', 'HPA', 'ServiceAccount'], FN = ['deploy', 'service', 'ingress', 'config', 'secret', 'hpa', 'sa'];
  const ENVS = ['dev', 'staging', 'prod'];
  function s1(t, c) { const { k, u } = c;
    const gx = 330, gw = 170, gy = 74;
    if (k === 0) {
      ENVS.forEach((e, j) => lbl(gx + j * gw + 60, 48, e + '/', fade(u, 0.1), { 'font-size': 15, class: 'mono' }));
      KINDS.forEach((kd, i) => { tx(gx - 24, gy + i * 44 + 22, kd, { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 600, fill: MUT });
        ENVS.forEach((e, j) => { const n = i * 3 + j, s = clamp(seg(u, 0.1, 1.6) * 21 - n), x = gx + j * gw, y = gy + i * 44, bad = j === 2 && i === 0 && u > 2;
          if (s <= 0) return; paper(x, y + 4, 120 * s, 32, { stroke: bad ? BAD : GRID, fill: bad ? 'var(--badbg)' : PANEL });
          if (s > 0.9) mono(x + 10, y + 25, FN[i] + '.yaml', { 'font-size': 13.5, fill: bad ? BAD : MUT }); }); });
      mono(gx + 3 * gw - 10, 390, '7 × 3 = 21개', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      pill(180, 390, "sed -i 's/v1.5.0/v1.6.0/'", BAD, pop(u, 1.9), { mono: true, fs: 13.5 });
      if (u > 2) tx(gx + 2 * gw + 128, gy + 26, '오타 한 글자', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
      return; }
    // k1: 21개가 폴더 하나로 접힌다
    const f = E(u, 0.2, 1.4);
    KINDS.forEach((kd, i) => ENVS.forEach((e, j) => { const x0 = gx + j * gw, y0 = gy + i * 44, x = lerp(x0, 150, f), y = lerp(y0, 180, f);
      if (f < 1) paper(x, y + 4, lerp(120, 60, f), lerp(32, 20, f), { stroke: GRID, op: 1 - f * 0.9 }); }));
    const s = pop(u, 1.2);
    el('path', { d: 'M90,150 h56 l14,14 h90 v100 h-160 z', fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: s });
    mono(170, 225, 'mychart/', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: s });
    tx(170, 300, '사본 21개 → 디렉토리 1개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
    terminal(420, 130, 500, 170, ['$ helm lint ./mychart', ['==> Linting ./mychart', null], ['구조 · 템플릿 문법 검사', 'var(--off)']], 1 + 2 * E(u, 1.6, 2.4), { title: 'zsh', fs: 14 });
    sub(670, 340, 'Chart 를 쓰기 시작한다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // 2. Chart 구조
  function s2(t, c) { const { k, u } = c, d = c.beat.dataState, pd = c.prev ? c.prev.dataState : { chartFiles: [] };
    const had = new Set(pd.chartFiles.map((f) => f.name));
    zone(30, 40, 310, 360, null, { fill: SOFT });
    tree(52, 82, d.chartFiles, { fresh: (f) => !had.has(f.name), order: (f) => d.chartFiles.indexOf(f) - pd.chartFiles.length, u, hi: c.beat.file });
    const cx = 380, cy = 40, cw = 548;
    if (k === 0) { paper(cx, cy, cw, 230, { stroke: INFO, sw: 2 }); mono(cx + 18, cy + 30, 'Chart.yaml', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      [['name:', 'web', 'Chart 이름'], ['version:', '1.0.0', 'Chart 자체 버전'], ['appVersion:', 'v1.5.0', '담긴 앱 버전']].forEach(([a, v, n], i) => { const y = cy + 76 + i * 46, op = fade(u, 0.3 + i * 0.4);
        mono(cx + 24, y, a, { 'font-size': 15, fill: MUT, opacity: op }); mono(cx + 160, y, v, { 'font-size': 16, 'font-weight': 800, opacity: op }); tx(cx + 300, y, n, { 'font-size': 14, fill: MUT, opacity: op }); });
      sub(cx + cw / 2, 320, '차트를 고치면 version, 앱을 바꾸면 appVersion 이 오른다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1 || k === 2) { const v = d.values, rows = [['image.repository', 'myapp'], ['image.tag', v.tag], ['replicas', String(v.replicas)]];
      if (k === 2) rows.push(['ingress.host', v.host]);
      paper(cx, cy, cw, 300, { stroke: WARN, sw: 2 }); mono(cx + 18, cy + 30, 'values.yaml', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      rows.forEach(([a, b], i) => { const nw = k === 1 || i === 3, y = cy + 76 + i * 48, op = nw ? fade(u, 0.3 + (k === 1 ? i : 0) * 0.4) : 1;
        if (nw && k === 2) el('rect', { x: cx + 12, y: y - 26, width: cw - 36, height: 38, rx: 6, fill: 'var(--warnbg)', opacity: op });
        mono(cx + 24, y, a + ':', { 'font-size': 15, fill: MUT, opacity: op }); mono(cx + 250, y, b, { 'font-size': 16, 'font-weight': 800, opacity: op }); });
      tx(cx + cw / 2, 380, k === 1 ? '환경마다 달라지는 값만 여기 모은다' : '도메인은 환경마다 반드시 다르다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // k3·k4: 템플릿의 빈자리
    paper(cx, cy, cw, 250, { stroke: ACC, sw: 2 }); mono(cx + 18, cy + 30, 'templates/deployment.yaml', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    const hole = (x, y, s, on, op) => { const w = tw(s, 14.5) + 16; el('rect', { x: x - 6, y: y - 18, width: w, height: 26, rx: 6, fill: on ? ACCBG : 'none', stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': '5 3', opacity: op }); mono(x + 2, y, s, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: op }); return w; };
    mono(cx + 24, cy + 74, 'name:', { 'font-size': 14.5, fill: MUT }); hole(cx + 90, cy + 74, '{{ .Release.Name }}', k === 3, 1); mono(cx + 268, cy + 74, '-web', { 'font-size': 14.5 });
    mono(cx + 24, cy + 118, 'replicas:', { 'font-size': 14.5, fill: MUT }); mono(cx + 24, cy + 162, 'image:', { 'font-size': 14.5, fill: MUT });
    if (k === 3) { mono(cx + 120, cy + 118, '3', { 'font-size': 14.5, fill: MUT }); mono(cx + 120, cy + 162, '"myapp:v1.5.0"', { 'font-size': 14.5, fill: MUT });
      grow(cx + 190, cy + 96, cx + 360, cy + 220, E(u, 0.6, 1.4), ACC); pill(cx + 390, cy + 230, 'helm install myrelease', INK, pop(u, 1.3), { mono: true, fs: 13.5 });
      tx(cx + 24, 340, '설치할 때 정한 이름이 들어간다 → 사본이 필요 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    hole(cx + 120, cy + 118, '{{ .Values.replicas }}', true, fade(u, 0.2)); hole(cx + 90, cy + 162, '{{ .Values.image.tag }}', true, fade(u, 0.5));
    paper(cx + 330, cy + 270, 218, 100, { stroke: WARN }); mono(cx + 344, cy + 296, 'values.yaml', { 'font-size': 14, 'font-weight': 700, fill: WARN });
    mono(cx + 344, cy + 322, 'replicas: 3', { 'font-size': 14 }); mono(cx + 344, cy + 348, 'tag: v1.5.0', { 'font-size': 14 });
    grow(cx + 330, cy + 317, cx + 300, cy + 126, E(u, 0.8, 1.5), WARN); grow(cx + 330, cy + 343, cx + 300, cy + 170, E(u, 1, 1.7), WARN);
    tx(cx + 24, cy + 300, '빈자리를 values 가 채운다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }

  // 3. helm install
  const EX = 455, EY = 180;
  function engine(on, label, t) { const r = 46; el('circle', { cx: EX, cy: EY, r, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': 2.5 });
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + (on ? t * 1.5 : 0); el('rect', { x: EX + Math.cos(a) * r - 6, y: EY + Math.sin(a) * r - 6, width: 12, height: 12, rx: 2, fill: on ? ACC : GRID, transform: `rotate(${a * 57.3} ${EX + Math.cos(a) * r} ${EY + Math.sin(a) * r})` }); }
    tx(EX, EY + 6, 'helm', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: on ? ACC : MUT });
    if (label) mono(EX, EY + 82, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: on ? ACC : MUT }); }
  function cluster(o) { o = o || {}; zone(640, 50, 290, 330, null, { fill: o.empty ? 'none' : SOFT, stroke: o.empty ? GRID : 'none', dash: o.empty ? '6 5' : null });
    tx(785, 76, 'namespace production', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' }); }
  function s3(t, c) { const { k, u } = c, d = c.beat.dataState;
    zone(30, 50, 300, 330, null, { fill: SOFT });
    tree(48, 90, d.chartFiles, { hi: null, check: k === 0 ? (i) => pop(u, 0.3 + i * 0.3) : null });
    engine(d.engineActive, d.engineLabel, t);
    cluster({ empty: !d.release });
    if (k === 0) { tx(785, 220, 'Release 아직 없음', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT }); tx(180, 340, 'helm lint ./mychart', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) }); return; }
    if (k === 1) { fly(200, 130, EX, EY, seg(u, 0.2, 1), 'tag: v1.5.0', { fill: WARN, mono: true }); fly(200, 200, EX, EY, seg(u, 0.4, 1.2), 'deployment.yaml', { mono: true });
      paper(EX - 120, 290, 240, 80, { stroke: ACC, op: fade(u, 1.3) }); mono(EX - 104, 318, 'replicas: 3', { 'font-size': 14, opacity: fade(u, 1.5) }); mono(EX - 104, 344, 'image: myapp:v1.5.0', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      tx(785, 200, '클러스터는', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); tx(785, 226, '건드리지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { pill(200, 340, '-f values-prod.yaml', WARN, pop(u, 0.2), { mono: true, fs: 13.5 });
      [0, 1, 2].forEach((i) => fly(EX + 50, EY, 700 + i * 60, 250, seg(u, 0.6 + i * 0.2, 1.6 + i * 0.2), 'yaml', { mono: true })); }
    if (d.release) { const st = d.release.status, s = k === 2 ? pop(u, 1.4) : 1;
      card(785, 130, 240, 64, { rx: 10, stroke: st === 'deployed' ? GOOD : WARN, sw: 2.5, s });
      if (s > 0.5) { tx(785, 124, 'Release ' + d.release.name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); mono(785, 148, 'STATUS ' + st, { 'text-anchor': 'middle', 'font-size': 14, fill: st === 'deployed' ? GOOD : WARN }); } }
    if (k >= 3) { mono(785, 200, 'REVISION ' + d.revision, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: k === 3 ? fade(u, 0.3) : 1 });
      pods(715, 262, d.podCount, d.deployedTag, GOOD, k === 3 ? { pop: 0.6, u } : {});
      if (k === 3) tx(785, 330, 'replicas 3 → Pod 3개', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 4) { const rows = [['NAME', 'NAMESPACE', 'REVISION', 'STATUS'], ['myrelease', 'production', '1', 'deployed']];
      el('rect', { x: 40, y: 300, width: 590, height: 90, rx: 8, fill: INK, opacity: fade(u, 0.2) });
      mono(56, 324, '$ helm list -n production   (출력 예시)', { 'font-size': 13.5, fill: PANEL, opacity: fade(u, 0.3) });
      rows.forEach((r, i) => r.forEach((v, j) => mono(56 + j * 140, 350 + i * 24, v, { 'font-size': 13.5, fill: i ? 'var(--term)' : 'var(--off)', opacity: fade(u, 0.6 + i * 0.4) })));
      sub(785, 350, 'kubectl 이 아니라 helm 에게 묻는다', fade(u, 1.4), { 'font-size': 14, fill: INK }); } }

  // 4. helm upgrade — 값만 바꿔 revision 을 쌓는다
  function layers(k, u, d) { const x = 40, w = 300;
    const L = [['values.yaml (기본값)', 'tag: v1.5.0', MUT, 330], ['-f values-prod.yaml', '환경 값 덮기', WARN, 276]];
    if (k >= 1) L.push(['--set image.tag=v1.6.0', 'tag: v1.6.0', ACC, 222]);
    tx(x, 60, '값은 아래에서 위로 덮인다', { 'font-size': 15, 'font-weight': 700 });
    L.forEach(([a, b, col, y], i) => { const drop = i === 2 && k === 1 ? lerp(-36, 0, E(u, 0.2, 1)) : 0, op = i === 2 && k === 1 ? fade(u, 0.2) : 1;
      card(x + w / 2, y + drop, w, 46, { rx: 8, stroke: col, sw: 2, fill: PANEL, op }); mono(x + 14, y + drop + 5, a, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op }); });
    const tag = d.values.tag, old = k === 1 && u < 1.2;
    mono(x + w / 2, 100, '최종 image.tag', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    mono(x + w / 2, 134, old ? 'v1.5.0' : tag, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: tag === 'v1.6.0' && !old ? ACC : INK }); }
  function s4(t, c) { const { k, u } = c, d = c.beat.dataState;
    if (k < 3) layers(k, u, d);
    const rx = 520;
    if (k === 3) { tx(40, 70, '$ helm history myrelease   (출력 예시)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      const rows = [['REVISION', 'STATUS', 'CHART', 'APP VERSION'], ['1', 'superseded', 'web-1.0.0', 'v1.5.0'], ['2', 'deployed', 'web-1.0.0', 'v1.6.0']];
      rows.forEach((r, i) => { const y = 120 + i * 44; if (i) el('rect', { x: 34, y: y - 28, width: 420, height: 38, rx: 6, fill: i === 2 ? 'var(--goodbg)' : SOFT, opacity: fade(u, 0.2 + i * 0.4) });
        r.forEach((v, j) => mono(48 + j * 104, y, v, { 'font-size': 14, 'font-weight': i ? 600 : 700, fill: i === 0 ? MUT : i === 1 && j === 1 ? MUT : INK, opacity: fade(u, 0.2 + i * 0.4) })); });
      tx(40, 300, '1번은 지워지지 않고 superseded 로 남는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(40, 330, '그래서 되돌릴 수 있다', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.7) }); }
    // 오른쪽: revision 기록과 Pod
    tx(rx, 60, 'Release myrelease', { 'font-size': 15, 'font-weight': 800 });
    const r2 = d.revision >= 2;
    rev(rx + 90, 130, 1, 'v1.5.0', r2 ? 'superseded' : 'deployed', {});
    if (r2) { grow(rx + 170, 130, rx + 218, 130, k === 2 ? E(u, 0.2, 0.6) : 1, MUT); rev(rx + 300, 130, 2, 'v1.6.0', 'deployed', { s: k === 2 ? pop(u, 0.5) : 1 }); }
    else if (k === 1) { card(rx + 300, 130, 150, 62, { rx: 10, stroke: WARN, sw: 2, dash: '6 4', text: 'pending-upgrade', fs: 14, color: WARN, s: pop(u, 0.9) }); }
    const sw = k === 2 ? seg(u, 1, 2.4) * 3 : r2 ? 3 : 0;
    pods(rx + 60, 280, 3, (i) => (i < sw ? 'v1.6.0' : 'v1.5.0'), (i) => (i < sw ? ACC : GOOD));
    tx(rx + 172, 340, k === 0 ? '같은 Chart, 사본 0개' : k === 1 ? '값 하나만 바뀌었다' : '배포된 앱 = ' + d.deployedTag, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, k === 2 ? 2 : 1) });
    if (k === 0) pill(rx + 172, 390, 'helm upgrade myrelease ./mychart', INK, pop(u, 0.3), { mono: true, fs: 13.5 }); }

  // 5. rollback — 되감기가 아니라 +1
  function s5(t, c) { const { k, u } = c, d = c.beat.dataState;
    const rx = 40, ry = 110;
    const st1 = 'superseded', st2 = d.revision >= 3 ? 'superseded' : 'deployed';
    if (k <= 1 || k === 3) { rev(rx + 90, ry, 1, 'v1.5.0', st1, { op: k === 3 ? 1 - 0.7 * E(u, 0.6, 1.4) : 1 }); grow(rx + 170, ry, rx + 218, ry, 1, MUT);
      rev(rx + 300, ry, 2, 'v1.6.0', st2, { op: k === 3 ? 1 - 0.7 * E(u, 0.6, 1.4) : 1 });
      if (d.revision >= 3) { grow(rx + 380, ry, rx + 428, ry, k === 1 ? E(u, 0.3, 0.7) : 1, MUT); rev(rx + 510, ry, 3, 'v1.5.0', 'deployed', { s: k === 1 ? pop(u, 0.7) : 1, op: k === 3 ? 1 - 0.7 * E(u, 0.6, 1.4) : 1 });
        if (k === 1) { el('path', { d: `M${rx + 90},${ry + 34} C${rx + 90},${ry + 110} ${rx + 510},${ry + 110} ${rx + 510},${ry + 34}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', pathLength: 1, opacity: 1 });
          tx(rx + 300, ry + 104, '1번 내용을 복사해 3번으로', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1) }); } } }
    const bad = d.deployedTag === 'v1.6.0';
    if (k <= 1 || k === 3) { const sw = k === 1 ? seg(u, 1, 2.4) * 3 : bad ? 0 : 3;
      pods(rx + 650, 110, 3, (i) => (i < sw ? 'v1.5.0' : 'v1.6.0'), (i) => (k === 3 ? OFF : i < sw ? GOOD : BAD)); }
    if (k === 0) { pill(rx + 706, 50, '5xx 급증', BAD, pop(u, 0.2), { fs: 14 }); el('path', { d: `M${rx + 300},${ry + 34} C${rx + 300},${ry + 100} ${rx + 90},${ry + 100} ${rx + 90},${ry + 36}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'marker-end': 'url(#ra-ahb)', opacity: fade(u, 1) });
      pill(rx + 195, ry + 110, '목표 revision = 1', ACC, pop(u, 1.1), { fs: 13.5 });
      terminal(40, 260, 880, 120, ['$ helm rollback myrelease 1 -n production'], E(u, 0.4, 1.6), { title: 'zsh', fs: 14 }); return; }
    if (k === 1) { terminal(40, 260, 880, 120, ['$ helm rollback myrelease 1 -n production', ['Rollback was a success! Happy Helming!', 'var(--term)']], 1 + E(u, 1.8, 2.4), { title: 'zsh', fs: 14 }); return; }
    if (k === 2) { tx(40, 50, '$ helm history myrelease   (출력 예시)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      const rows = [['REVISION', 'STATUS', 'APP VERSION', 'DESCRIPTION'], ['1', 'superseded', 'v1.5.0', 'Install complete'], ['2', 'superseded', 'v1.6.0', 'Upgrade complete'], ['3', 'deployed', 'v1.5.0', 'Rollback to 1']];
      rows.forEach((r, i) => { const y = 100 + i * 46, nw = i === 3 || (i === 2), op = i === 3 ? fade(u, 0.6) : 1;
        if (i) el('rect', { x: 34, y: y - 29, width: 640, height: 40, rx: 6, fill: i === 3 ? 'var(--goodbg)' : SOFT, opacity: op });
        r.forEach((v, j) => { const w = i === 2 && j === 1 && u < 1 ? 'deployed' : v; mono(48 + j * 150, y, w, { 'font-size': 14.5, 'font-weight': i ? 600 : 700, fill: i === 0 ? MUT : w === 'superseded' ? MUT : INK, opacity: op }); }); });
      tx(720, 300, '줄이 줄지 않고 늘어난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    if (k === 3) { card(480, 300, 600, 76, { rx: 12, stroke: BAD, sw: 2, dash: '7 5', fill: PANEL, s: pop(u, 0.3) });
      mono(480, 296, '# helm uninstall myrelease -n production', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
      tx(480, 322, '실행하면 Pod 3개와 history 가 함께 사라진다 (주석으로만 둠)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) }); cross(760, 110, 30, pop(u, 1.2)); return; }
    // k4: 두 줄 비교
    const x0 = 160, dx = 260;
    tx(40, 120, 'REVISION', { 'font-size': 15, 'font-weight': 800 }); tx(40, 250, '앱 버전', { 'font-size': 15, 'font-weight': 800 });
    [1, 2, 3].forEach((n, i) => { const x = x0 + i * dx, s = pop(u, 0.2 + i * 0.4);
      card(x, 114, 90, 52, { rx: 26, stroke: ACC, sw: 2.5, text: String(n), fs: 22, mono: true, color: ACC, s });
      const tg = ['v1.5.0', 'v1.6.0', 'v1.5.0'][i]; card(x, 244, 120, 52, { rx: 10, stroke: i === 1 ? BAD : GOOD, sw: 2.5, text: tg, fs: 17, mono: true, color: i === 1 ? BAD : GOOD, s });
      if (i) { grow(x - dx + 50, 114, x - 50, 114, E(u, 0.3 + i * 0.4, 0.7 + i * 0.4), ACC); grow(x - dx + 66, 244, x - 66, 244, E(u, 0.3 + i * 0.4, 0.7 + i * 0.4), MUT); } });
    tx(480, 180, '번호는 늘 +1', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
    tx(480, 330, '보이는 버전만 예전으로 돌아간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); }

  const quiz = [
    { q: '매니페스트 7개짜리 앱을 dev·staging·prod 사본으로 관리하면 파일은 몇 개가 되나?',
      o: ['7개', '10개', '21개'], a: 2,
      why: '환경마다 7개씩 복사하니 7 × 3 = 21개다. 태그 하나를 바꿀 때도 21개를 sed로 손대야 해서 오타가 끼어든다.' },
    { q: '템플릿의 {{ .Values.image.tag }} 자리를 채우는 값은 어디서 오나?',
      o: ['values.yaml과 그 위에 덮은 -f·--set 값', 'Chart.yaml의 version', '클러스터의 etcd'], a: 0,
      why: '템플릿의 빈자리는 values가 채운다. Chart.yaml의 version은 차트 자체의 버전이라 이미지 태그와 상관없다.' },
    { q: 'helm template와 helm install의 차이는 무엇인가?',
      o: ['template가 더 빠르게 설치한다', 'template는 렌더링한 yaml을 화면에만 보이고 클러스터에는 적용하지 않는다', 'install은 lint를 건너뛴다'], a: 1,
      why: 'template는 values를 채운 결과를 미리 보는 명령이다. install이 실제로 적용해 Release와 REVISION 1을 만든다.' },
    { q: 'helm upgrade로 태그를 v1.6.0으로 바꾸면 REVISION 1은 어떻게 되나?',
      o: ['지워진다', 'REVISION 2로 덮어쓰인다', 'superseded로 history에 남는다'], a: 2,
      why: 'upgrade는 새 revision 2를 쌓고 1은 superseded로 남긴다. 이 기록이 있어서 rollback을 할 수 있다.' },
    { q: 'REVISION 2 상태에서 helm rollback myrelease 1을 하면 새 revision 번호는 무엇인가?',
      o: ['3', '1', '2 그대로'], a: 0,
      why: 'rollback은 1번 내용을 복사해 3번으로 쌓는다. 번호는 늘 +1이고 배포된 앱 버전만 v1.5.0으로 돌아간다.' },
  ];

  const summary = [
    '매니페스트 7개를 환경 3개로 복사하면 21개가 되고, sed 오타 한 글자가 장애가 된다.',
    'Chart는 템플릿의 빈자리를 values가 채우는 구조라 환경마다 값 파일만 다르게 준다.',
    'install은 REVISION 1을, upgrade는 2를 만들고 앞의 revision은 history에 남는다.',
    'rollback은 옛 내용을 새 revision으로 쌓는다. 번호는 늘고 앱 버전만 돌아간다.',
  ];
  const review = [
    { q: 'staging에 배포했더니 Ingress 도메인이 prod 것으로 나갔다. Chart에서 먼저 볼 곳은?',
      o: ['templates/deployment.yaml의 replicas', 'staging에 넘긴 values 파일의 ingress.host', 'Chart.yaml의 appVersion'], a: 1,
      why: '도메인은 환경마다 다른 값이라 values의 ingress.host에 둔다. 그 환경에 -f로 넘긴 값 파일이 맞는지부터 본다.' },
    { q: 'v1.6.0 배포 뒤 5xx가 늘어 helm rollback myrelease 1을 했다. helm history 맨 아래 줄은?',
      o: ['3  deployed  v1.5.0  Rollback to 1', '1  deployed  v1.5.0  Install complete', '2  deployed  v1.6.0  Upgrade complete'], a: 0,
      why: 'rollback은 1번 내용으로 3번을 새로 쌓는다. 2번은 superseded로 바뀌고 줄은 줄지 않는다.' },
    { q: '배포가 꼬여 Release를 지우려고 helm uninstall을 생각 중이다. 먼저 알아 둘 것은?',
      o: ['uninstall 뒤에도 rollback으로 되살릴 수 있다', 'Chart 디렉토리도 같이 지워진다', 'Release가 만든 Pod와 history가 함께 사라진다'], a: 2,
      why: 'uninstall은 Release가 만든 리소스와 history를 함께 지운다. 이전 상태로 돌아가려는 것이면 rollback이 맞다.' },
  ];

  R.page({ title: 'Chart · values · Release', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
