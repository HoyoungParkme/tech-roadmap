/* II-1-2 내장 객체 (Built-in Objects) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, pill, banner, grow, fly, dot,
    cross, check, kvTable, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 서랍(내장 객체) 6개: 이름 첫 글자(대문자)를 강조
  const DR = ['.Values', '.Release', '.Chart', '.Files', '.Capabilities', '.Template'];
  function drawer(x, y, i, o) { o = o || {}; const w = o.w || 200, h = 42, on = o.on, op = o.op ?? 1, dx = o.dx || 0;
    el('rect', { x: x + dx, y, width: w, height: h, rx: 7, fill: on ? ACCBG : PANEL, stroke: on ? ACC : o.dim ? GRID : INK, 'stroke-width': on ? 2.5 : 2, opacity: op });
    el('rect', { x: x + dx + w - 40, y: y + 17, width: 24, height: 8, rx: 4, fill: on ? ACC : OFF, opacity: op });
    const n = DR[i]; spans(x + dx + 16, y + 27, [['.', {}], [n[1], { fill: ACC, 'font-weight': 800 }], [n.slice(2), {}]], { 'font-size': 16, 'font-weight': 700, fill: o.dim ? MUT : INK, opacity: op }); }
  const DY = (i) => 62 + i * 52;   // 장면 1·5 의 서랍 높이
  function cabinet(o) { o = o || {};
    el('rect', { x: 38, y: 26, width: 224, height: 348, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    mono(54, 48, '. (루트)', { 'font-size': 14, 'font-weight': 800, fill: MUT });
    DR.forEach((_, i) => { const a = o.slide ? E(o.u, 0.2 + i * 0.18, 0.7 + i * 0.18) : 1; if (a <= 0) return;
      drawer(50, DY(i), i, { on: o.on && o.on.includes(i), dim: o.on && !o.on.includes(i), dx: lerp(-40, 0, a), op: a }); }); }
  // 종이(파일): lines 는 문자열 또는 [글, 색], n 줄까지 (소수면 마지막 줄 타이핑)
  function paper(x, y, w, h, title, lines, n, o) { o = o || {}; const lh = o.lh || 22, fs = o.fs || 14;
    el('path', { d: `M${x},${y} h${w - 22} l22,22 v${h - 22} h${-w} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round', opacity: o.op ?? 1 });
    mono(x + 14, y + 22, title, { 'font-size': 13.5, 'font-weight': 800, fill: MUT, opacity: o.op ?? 1 });
    const m = n == null ? lines.length : n;
    lines.slice(0, Math.ceil(m)).forEach((ln, i) => { const [s, col] = Array.isArray(ln) ? ln : [ln], last = i === Math.ceil(m) - 1 && m % 1;
      mono(x + 14, y + 48 + i * lh, last ? s.slice(0, Math.round(s.length * (m % 1))) : s, { 'font-size': fs, fill: col || INK, 'font-weight': col ? 700 : 400, opacity: o.op ?? 1 }); }); }
  // 검은 명령 줄
  function cmdBar(x, y, w, s, u0, o) { o = o || {}; el('rect', { x, y, width: w, height: 40, rx: 8, fill: INK });
    const n = o.typed == null ? s.length : Math.round(s.length * o.typed); mono(x + 14, y + 26, s.slice(0, n), { 'font-size': 15, fill: PANEL, 'font-weight': 700 }); }

  // 1. 내장 객체란
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { cabinet({ slide: true, u });
      tx(330, 90, '내가 만들지 않아도 Helm이 넣어 주는 값', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.3) });
      [['{{ .Values.replicaCount }}', true, '대문자 V: 내장 객체'], ['{{ .values.replicaCount }}', false, '소문자: 그런 키는 없다 → 렌더 오류']].forEach(([s, ok, d], i) => {
        const y = 170 + i * 90, a = pop(u, 1.6 + i * 0.4);
        card(560, y, 380, 48, { rx: 10, stroke: ok ? GOOD : BAD, sw: 2, s: a });
        mono(390, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7 + i * 0.4) });
        if (ok) check(782, y, 11, a); else cross(782, y, 10, a);
        tx(370, y + 46, d, { 'font-size': 14, fill: ok ? GOOD : BAD, 'font-weight': 700, opacity: fade(u, 1.9 + i * 0.4) }); });
      return; }
    if (k <= 2) { const lit = k === 1 ? [0, 1, 2] : [3, 4, 5];
      cabinet({ on: lit });
      const SRC = ['values.yaml + -f 파일 + --set', '$ helm install web ./mychart', 'Chart.yaml (name·version·appVersion)', 'mychart/ 안의 파일 (templates/ 밖)', '대상 클러스터 (API 목록·버전)', '지금 렌더 중인 템플릿 파일'];
      SRC.forEach((s, i) => { const mine = lit.includes(i); if (!mine && i > 2 && k === 1) return;
        const yy = DY(i) + 21, a = mine ? E(u, 0.2 + (i % 3) * 0.4, 0.9 + (i % 3) * 0.4) : 1, op = mine ? a : 0.4;
        card(720 + (1 - a) * 60, yy, 400, 40, { rx: 8, text: s, fs: 14, fw: 700, mono: i === 1, stroke: mine ? ACC : GRID, color: mine ? INK : MUT, op });
        if (mine) grow(518, yy, 256, yy, E(u, 0.6 + (i % 3) * 0.4, 1.2 + (i % 3) * 0.4), ACC);
        else el('line', { x1: 518, y1: yy, x2: 256, y2: yy, stroke: GRID, 'stroke-width': 2 }); });
      sub(720, 400, k === 1 ? '자주 쓰는 셋: 사용자 값 · 이번 배포 · 차트 자신' : '가끔 쓰지만 대신할 방법이 없는 셋', fade(u, 1.9), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // k 3~5: 템플릿에 서랍 값을 꽂는다
    cabinet({ on: k === 3 ? [1] : k === 4 ? [0, 2] : [0, 1, 2] });
    const TL = ['name: {{ .Release.Name }}-config', 'replicas: {{ .Values.replicaCount | quote }}', 'chart: {{ .Chart.Name }}-{{ .Chart.Version }}'];
    if (k <= 4) { paper(300, 26, 640, 136, 'templates/configmap.yaml (일부)', TL.map((s, i) => [s, (k === 3 && i === 0) || (k === 4 && i > 0) ? ACC : null]), k === 3 ? 1 : 3);
      const RL = ['name: web-config', 'replicas: "3"', 'chart: mychart-0.1.0'];
      paper(300, 200, 640, 140, 'helm install web ./mychart 렌더 결과', RL.map((s, i) => [s, (k === 3 && i === 0) || (k === 4 && i > 0) ? GOOD : null]), k === 3 ? lerp(0, 1, E(u, 1.4, 2.2)) : 1 + lerp(0, 2, E(u, 1.5, 2.5)));
      if (k === 3) fly(252, DY(1) + 21, 380, 244, seg(u, 0.3, 1.4), 'web', { mono: true });
      if (k === 4) { fly(252, DY(0) + 21, 400, 266, seg(u, 0.3, 1.3), '3 → "3"', { mono: true }); fly(252, DY(2) + 21, 400, 288, seg(u, 0.7, 1.7), 'mychart · 0.1.0', { mono: true });
        pill(820, 266, '"3" = 문자열', WARN, pop(u, 2.0), { fs: 14 }); }
      sub(620, 380, k === 3 ? '이름 앞에 릴리스 이름 → 여러 번 설치해도 안 겹친다' : 'ConfigMap data 값은 문자열이라 quote로 감싼다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK });
      return; }
    paper(300, 26, 380, 222, 'ConfigMap (렌더 결과)', ['apiVersion: v1', 'kind: ConfigMap', 'metadata:', ['  name: web-config', GOOD], 'data:', ['  replicas: "3"', GOOD], ['  chart: mychart-0.1.0', GOOD]], lerp(0, 7, E(u, 0.2, 1.6)), { lh: 22 });
    [['web', '.Release'], ['"3"', '.Values'], ['mychart-0.1.0', '.Chart']].forEach(([a, b], i) => { const y = 90 + i * 60, s = pop(u, 1.4 + i * 0.3);
      card(820, y, 220, 44, { rx: 22, stroke: GOOD, sw: 2, s }); mono(730, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5 + i * 0.3) });
      mono(915, y + 5, '← ' + b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.5 + i * 0.3) }); });
    banner(620, 320, '정의한 적 없는 값 세 가지가 매니페스트를 채웠다', pop(u, 2.2)); }

  // 2. .Values 와 .Release
  const REL = (k) => k === 7 ? [['Name', 'web'], ['Namespace', 'prod'], ['Revision', '2'], ['IsInstall', 'false'], ['IsUpgrade', 'true'], ['Service', 'Helm']]
    : [['Name', 'web'], ['Namespace', 'prod'], ['Revision', '1'], ['IsInstall', 'true'], ['IsUpgrade', 'false'], ['Service', 'Helm']];
  const RY = (i) => 90 + 30 + i * 34 + 17;
  function s2(t, c) { const { k, u } = c;
    const HOT = [[0, 1], [], [], [2], [3, 4], [], [0, 1, 2, 3], [2, 3, 4]][k];
    cmdBar(40, 26, 340, k === 7 ? '$ helm upgrade web . -n prod' : '$ helm install web . -n prod', 0, { typed: k === 0 ? E(u, 0.1, 0.9) : 1 });
    kvTable(40, 90, 340, REL(k).map(([a, b], i) => [a, b, { hot: HOT.includes(i), op: k === 1 || k === 2 || k === 5 ? 0.45 : 1 }]), { title: '.Release (이번 배포)', kw: 160 });
    if (k === 0) { fly(200, 46, 250, RY(0), seg(u, 0.9, 1.5), 'web', { mono: true }); fly(352, 46, 250, RY(1), seg(u, 1.1, 1.7), 'prod', { mono: true });
      [['name: {{ .Release.Name }}-web', 'name: web-web'], ['namespace: {{ .Release.Namespace }}', 'namespace: prod']].forEach(([a, b], i) => { const y = 140 + i * 110;
        mono(430, y, a, { 'font-size': 15, opacity: fade(u, 1.6 + i * 0.3) }); grow(450, y + 14, 450, y + 40, E(u, 1.8 + i * 0.3, 2.1 + i * 0.3), ACC);
        mono(470, y + 50, b, { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0 + i * 0.3) }); }); return; }
    if (k === 1) { const L = [['values.yaml', 'replicaCount: 3', false], ['-f 파일', '이번엔 없음', true], ['--set', '이번엔 없음', true]];
      L.forEach(([a, b, dash], i) => { const y = 300 - i * 64, a2 = E(u, 0.2 + i * 0.4, 0.8 + i * 0.4); if (a2 <= 0) return;
        el('rect', { x: 430, y: y - 24 - (1 - a2) * 50, width: 300, height: 48, rx: 8, fill: dash ? PANEL : ACCBG, stroke: dash ? GRID : ACC, 'stroke-width': 2, 'stroke-dasharray': dash ? '6 5' : null, opacity: a2 });
        mono(446, y + 6 - (1 - a2) * 50, a, { 'font-size': 15, 'font-weight': 800, fill: dash ? MUT : ACC, opacity: a2 }); mono(714, y + 6 - (1 - a2) * 50, b, { 'font-size': 14, fill: dash ? MUT : INK, 'text-anchor': 'end', opacity: a2 }); });
      grow(410, 310, 410, 120, E(u, 1.4, 1.9), MUT); tx(400, 100, '나중 것이 이긴다', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.6) });
      grow(740, 236, 790, 236, E(u, 1.8, 2.1), ACC);
      card(860, 210, 150, 44, { rx: 8, text: '.Values', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.9) });
      mono(860, 270, 'replicas: 3', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const N = [['.Values', 440, 80], ['replicaCount: 3', 480, 120], ['image', 480, 160], ['repository: nginx', 520, 200], ['tag: "1.27"', 520, 240]];
      [[0, 1], [0, 2], [2, 3], [2, 4]].forEach(([a, b]) => { el('path', { d: `M${N[a][1] + 8},${N[a][2] + 8} V${N[b][2] - 5} H${N[b][1] - 6}`, fill: 'none', stroke: GRID, 'stroke-width': 2 }); });
      N.forEach(([s, x, y], i) => { const on = [0, 2, 3, 4].includes(i) && u > 0.3 + i * 0.3; mono(x, y, s, { 'font-size': 15, 'font-weight': on ? 800 : 500, fill: on ? ACC : INK }); });
      dot([[448, 86], [448, 155], [478, 155], [488, 195], [516, 195]], seg(u, 0.3, 1.3), ACC, 7);
      mono(720, 160, '.Values.image.repository', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9) }); mono(720, 186, '.Values.image.tag', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(440, 290, 'image: "nginx:1.27"', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      mono(440, 340, '.image.tga  → "nginx:" (조용히 빈 값)', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) });
      mono(440, 368, '.imag.tag   → nil pointer 오류', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { const T = [['install', 1, 480], ['upgrade', 2, 680], ['rollback', 3, 880]];
      el('line', { x1: 450, y1: 140, x2: 450 + 460 * E(u, 0.2, 1.0), y2: 140, stroke: GRID, 'stroke-width': 4 });
      T.forEach(([a, n, x], i) => { const s = pop(u, 0.4 + i * 0.3), on = i === 0;
        el('circle', { cx: x, cy: 140, r: (on ? 24 : 18) * s, fill: on ? ACC : PANEL, stroke: on ? ACC : OFF, 'stroke-width': 3 });
        mono(x, 147, String(n), { 'font-size': 17, 'font-weight': 800, fill: on ? PANEL : MUT, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 });
        tx(x, 190, a, { 'font-size': 15, 'font-weight': 700, fill: on ? ACC : MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.3) }); });
      tx(680, 86, 'Revision: 설치 1, 그 뒤 upgrade·rollback마다 +1', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(440, 260, '- name: RELEASE_REVISION', { 'font-size': 15, opacity: fade(u, 1.4) }); mono(440, 286, '  value: {{ .Release.Revision | quote }}', { 'font-size': 15, opacity: fade(u, 1.5) });
      mono(460, 330, '숫자 1 → quote → "1"', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
      sub(680, 372, 'env 값은 문자열이어야 한다', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700 }); return; }
    if (k === 4) { [['install', 'IsInstall = true', ['RELEASE_REVISION "1"', 'RUN_DB_SEED "true"'], GOOD, 0], ['upgrade', 'IsUpgrade = true', ['RELEASE_REVISION "2"', 'RUN_DB_SEED'], WARN, 1]].forEach(([h, d, env, col, j]) => {
        const x = 430 + j * 260, a = pop(u, 0.3 + j * 0.8);
        el('rect', { x, y: 40, width: 240, height: 250, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2.5, opacity: a });
        tx(x + 16, 70, h, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: a }); mono(x + 16, 96, d, { 'font-size': 14, fill: MUT, opacity: a });
        mono(x + 16, 130, 'env:', { 'font-size': 14, fill: MUT, opacity: a });
        env.forEach((s, i) => { const gone = j === 1 && i === 1, op = fade(u, 0.6 + j * 0.8 + i * 0.3);
          mono(x + 28, 162 + i * 34, '- ' + s, { 'font-size': 14.5, 'font-weight': 700, fill: gone ? OFF : i === 1 ? GOOD : INK, 'text-decoration': gone ? 'line-through' : null, opacity: op }); });
        if (j === 1) tx(x + 28, 250, '블록이 통째로 빠진다', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) }); });
      sub(690, 330, 'rollback도 IsUpgrade가 참이다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 5) { paper(660, 50, 280, 150, 'values.yaml', ['replicaCount: 3', 'image:', '  repository: nginx', '  tag: "1.27"'], lerp(0, 4, E(u, 0.2, 1.0)));
      [['.Values.replicaCount', 0], ['.Values.image.repository', 2], ['.Values.image.tag', 3]].forEach(([s, li], i) => { const y = 98 + li * 22, a = pop(u, 1.0 + i * 0.3);
        pill(530, y - 5, s, ACC, a, { mono: true, fs: 13.5 }); grow(638, y - 5, 668, y - 5, E(u, 1.2 + i * 0.3, 1.5 + i * 0.3), ACC, { plain: true }); });
      sub(690, 260, '템플릿 경로 = values.yaml 들여쓰기 구조', fade(u, 1.9), { 'font-size': 15, 'font-weight': 700, fill: INK });
      sub(690, 290, '환경별 값은 -f 파일로 덮어쓴다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 6) { const L = ['metadata:', ['  name: web-web', GOOD], ['  namespace: prod', GOOD], 'spec:', ['  replicas: 3', GOOD], '  # …', ['      image: "nginx:1.27"', GOOD], '      env:', '      - name: RELEASE_REVISION', ['        value: "1"', GOOD], '      - name: RUN_DB_SEED', ['        value: "true"', GOOD]];
      paper(430, 26, 500, 330, 'helm install web . -n prod 결과', L, lerp(0, 12, E(u, 0.2, 2.2)), { lh: 22 }); return; }
    // k 7: 회차가 바뀌면 Pod 템플릿이 바뀐다
    [['rev 1 Pod 템플릿', ['REVISION "1"', 'RUN_DB_SEED "true"'], 0], ['rev 2 Pod 템플릿', ['REVISION "2"', 'RUN_DB_SEED'], 1]].forEach(([h, L, j]) => { const x = 430 + j * 260, a = pop(u, 0.2 + j * 0.4);
      el('rect', { x, y: 30, width: 240, height: 130, rx: 10, fill: PANEL, stroke: j ? WARN : GRID, 'stroke-width': 2, opacity: a });
      tx(x + 14, 56, h, { 'font-size': 15, 'font-weight': 800, opacity: a });
      L.forEach((s, i) => { const gone = j === 1 && i === 1; mono(x + 14, 92 + i * 30, s, { 'font-size': 14.5, 'font-weight': 700, fill: gone ? OFF : j === 1 && i === 0 ? WARN : INK, 'text-decoration': gone ? 'line-through' : null, opacity: fade(u, 0.4 + j * 0.4) }); }); });
    tx(680, 196, '이미지는 그대로 nginx:1.27', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    for (let i = 0; i < 3; i++) { const x = 470 + i * 70, x2 = 730 + i * 70, f = E(u, 1.2 + i * 0.35, 1.7 + i * 0.35);
      el('circle', { cx: x, cy: 280, r: 22, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); el('circle', { cx: x, cy: 280, r: 22 * (1 - f) + 0.01, fill: OFF, opacity: 1 - f }); mono(x, 285, 'rev1', { 'font-size': 13.5, 'text-anchor': 'middle', fill: PANEL, opacity: (1 - f) > 0.6 ? 1 : 0 });
      el('circle', { cx: x2, cy: 280, r: 22 * f + 0.01, fill: ACC, opacity: f }); mono(x2, 285, 'rev2', { 'font-size': 13.5, 'text-anchor': 'middle', fill: PANEL, opacity: f > 0.6 ? 1 : 0 }); }
    tx(540, 330, '옛 Pod 3개', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); tx(800, 330, '새 Pod 3개', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    sub(680, 372, 'values를 안 바꿔도 upgrade마다 Pod가 다시 뜬다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: WARN }); }

  // 3. .Chart 와 표준 라벨
  const LBL = [['name: web-web', '.Release.Name'], ['app.kubernetes.io/name: mychart', '.Chart.Name'], ['app.kubernetes.io/instance: web', '.Release.Name'],
    ['app.kubernetes.io/version: "1.27"', '.Chart.AppVersion | quote'], ['helm.sh/chart: mychart-0.1.0', '.Chart.Name-.Chart.Version'], ['app.kubernetes.io/managed-by: Helm', '.Release.Service']];
  const SRC3 = [[290, 238], [290, 78], [290, 238], [290, 122], [290, 100], [290, 264]];   // 이 줄 값이 나오는 자리
  function s3(t, c) { const { k, u } = c, upto = Math.min(k, 5);
    const hiC = k === 1 ? [0] : k === 3 ? [2] : k === 4 ? [0, 1] : k === 6 ? [0, 1, 2] : [];
    paper(40, 30, 260, 128, 'Chart.yaml', [['name: mychart', hiC.includes(0) ? ACC : null], ['version: 0.1.0', hiC.includes(1) ? ACC : null], ['appVersion: "1.27"', hiC.includes(2) ? ACC : null]]);
    cmdBar(40, 180, 260, '$ helm install web .', 0);
    mono(48, 244, '.Release.Name = web', { 'font-size': 14, fill: [0, 2].includes(k) ? ACC : INK, 'font-weight': 700 });
    mono(48, 270, '.Release.Service = Helm', { 'font-size': 14, fill: k === 5 ? ACC : INK, 'font-weight': 700 });
    el('rect', { x: 340, y: 30, width: 600, height: 190, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
    mono(354, 52, 'service.yaml 렌더 결과 · metadata', { 'font-size': 13.5, 'font-weight': 800, fill: MUT });
    LBL.forEach(([s, src], i) => { if (i > upto) return; const y = 80 + i * 24, now = i === k || (k === 7);
      const typed = i === k && k <= 5 ? E(u, 1.0, 1.8) : 1, ind = i === 0 ? '' : '  ';
      mono(354, y, ind + s.slice(0, Math.round(s.length * typed)), { 'font-size': 14, 'font-weight': i === k ? 800 : 500, fill: i === k ? GOOD : INK });
      mono(926, y, src, { 'font-size': 13.5, fill: i === k ? ACC : MUT, 'text-anchor': 'end', opacity: i === k ? fade(u, 0.3) : 0.8 }); });
    if (k <= 5) dot([SRC3[k], [330, SRC3[k][1]], [345, 80 + k * 24 - 5]], seg(u, 0.2, 1.0), ACC, 7);
    if (k === 0) sub(640, 270, 'metadata.labels 아래에 표준 라벨을 채운다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 1) pill(640, 270, 'name = "무슨 앱" = 차트 이름', ACC, pop(u, 1.8), { fs: 15 });
    if (k === 2) { [['helm install web .', 'instance=web'], ['helm install web2 .', 'instance=web2']].forEach(([a, b], i) => { const x = 400 + i * 280, s = pop(u, 1.6 + i * 0.3);
        card(x + 120, 290, 250, 70, { rx: 10, stroke: i ? INFO : ACC, sw: 2, s }); mono(x + 10, 284, a, { 'font-size': 14, opacity: fade(u, 1.7 + i * 0.3) });
        mono(x + 10, 308, b, { 'font-size': 14.5, 'font-weight': 800, fill: i ? INFO : ACC, opacity: fade(u, 1.7 + i * 0.3) }); });
      sub(640, 352, 'name은 둘 다 mychart, instance가 배포를 가른다', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); }
    if (k === 3) { [['version: 1.27', '숫자 1.27로 읽힌다', BAD, false], ['version: "1.27"', '문자열 "1.27"', GOOD, true]].forEach(([a, b, col, ok], i) => { const x = 420 + i * 270, s = pop(u, 1.6 + i * 0.35);
        card(x + 110, 290, 230, 70, { rx: 10, stroke: col, sw: 2, s }); mono(x + 10, 284, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7 + i * 0.35) });
        tx(x + 10, 308, b, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, 1.7 + i * 0.35) }); if (ok) check(x + 200, 290, 10, s); else cross(x + 200, 290, 9, s); });
      sub(640, 352, '라벨 값은 문자열이어야 한다', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); }
    if (k === 4) { const j = E(u, 1.4, 2.0);
      if (u < 2.0) [['mychart', 420], ['-', 540], ['0.1.0', 650]].forEach(([s, x], i) => pill(lerp(x, 500 + i * 22, j), 290, s, i === 1 ? MUT : ACC, pop(u, 1.1 + i * 0.15), { mono: true, fs: 14.5, op: 1 - 0.6 * j }));
      else pill(540, 290, 'mychart-0.1.0', GOOD, pop(u, 2.0), { mono: true, fs: 15 });
      sub(800, 296, '어느 차트 몇 버전에서 왔나', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); }
    if (k === 5) { pill(640, 280, '.Release.Service는 Helm에서 늘 "Helm"', ACC, pop(u, 1.6), { fs: 15 });
      sub(640, 330, 'kubectl로 봐도 Helm이 관리하는 객체인지 안다', fade(u, 2.0), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); }
    if (k === 6) { [['name', '.Chart.Name', 'mychart'], ['version', '.Chart.Version', '0.1.0'], ['appVersion', '.Chart.AppVersion', '1.27']].forEach(([a, b, v], i) => { const y = 262 + i * 46, op = fade(u, 0.4 + i * 0.4);
        mono(390, y, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); grow(500, y - 5, 548, y - 5, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), ACC);
        spans(560, y, [['.Chart.', {}], [b[7], { fill: ACC, 'font-weight': 800 }], [b.slice(8), {}]], { 'font-size': 15, 'font-weight': 700, opacity: op });
        mono(870, y, v, { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.8 + i * 0.4) }); });
      sub(640, 404, '키 첫 글자가 대문자가 된다 · --set으로 못 바꾼다', fade(u, 2.0), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); }
    if (k === 7) { card(640, 262, 560, 36, { rx: 8, fill: INK, stroke: 'none', text: 'kubectl get all -l app.kubernetes.io/instance=web', mono: true, fs: 14, color: PANEL, s: pop(u, 0.3) });
      [['Deployment', 'web-web', true], ['Service', 'web-web', true], ['ConfigMap', 'web-config', true], ['Service', 'web2-web', false]].forEach(([a, b, ok], i) => { const x = 160 + i * 215, s = pop(u, 0.8 + i * 0.2), hit = u > 1.6;
        card(x, 352, 195, 66, { rx: 10, stroke: hit ? (ok ? GOOD : GRID) : INK, sw: 2, fill: hit && ok ? GOODBG : PANEL, s, op: hit && !ok ? 0.5 : 1 });
        tx(x - 84, 345, a, { 'font-size': 14, 'font-weight': 800, opacity: s > 0.5 ? (hit && !ok ? 0.5 : 1) : 0 }); mono(x - 84, 370, b + (ok ? '' : ' (web2)'), { 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? (hit && !ok ? 0.5 : 1) : 0 });
        if (hit && ok) check(x + 74, 340, 9, pop(u, 1.6 + i * 0.1)); }); } }

  // 4. .Files 와 .Capabilities
  const TREE = [['mychart/', null], ['├─ Chart.yaml', null], ['├─ values.yaml', null], ['├─ .helmignore', null], ['├─ config/', null], ['│  └─ nginx.conf', 'ok'], ['└─ templates/', 'no'], ['   ├─ configmap.yaml', 'no'], ['   └─ _helpers.tpl', 'no']];
  const TY = (i) => 64 + i * 26;
  function tree(o) { o = o || {};
    TREE.forEach(([s, st], i) => { const on = o.mark && st, col = on ? (st === 'ok' ? GOOD : BAD) : INK;
      mono(48, TY(i), s, { 'font-size': 14.5, 'font-weight': i === 5 && o.hot ? 800 : 500, fill: o.hot && i === 5 ? ACC : on ? col : o.dim ? MUT : INK, opacity: o.op ?? 1 });
      if (on && o.mark) { const a = pop(o.u, 0.4 + i * 0.12); if (st === 'ok') check(270, TY(i) - 5, 8, a); else cross(270, TY(i) - 5, 7, a); } }); }
  const NG = ['server {', '  listen 80;', '  location / {', '    root /usr/share/nginx/html;', '  }', '}'];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tree({ mark: true, u });
      tx(440, 70, '.Files가 읽을 수 있는 파일', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      [['templates/ 밖의 파일 (config/nginx.conf)', true], ['templates/ 안의 파일', false], ['.helmignore로 뺀 파일', false], ['다른 차트(상위 차트)의 파일', false]].forEach(([s, ok], i) => { const y = 120 + i * 56, a = pop(u, 0.9 + i * 0.35);
        card(680, y, 480, 44, { rx: 10, stroke: ok ? GOOD : BAD, sw: 2, s: a }); if (ok) check(470, y, 9, a); else cross(470, y, 8, a);
        tx(496, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.35) }); });
      sub(680, 380, 'templates/ 안 파일은 Helm이 템플릿으로 렌더한다', fade(u, 2.3), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); return; }
    const CM = ['apiVersion: v1', 'kind: ConfigMap', 'metadata:', ['  name: web-nginx', k === 1 ? GOOD : null], 'data:', ['  nginx.conf: |-', k === 1 || k === 2 ? ACC : null]];
    if (k <= 2) { tree({ hot: true, dim: true });
      paper(430, 26, 510, 340, 'ConfigMap 렌더 결과', CM, k === 1 ? lerp(0, 6, E(u, 0.2, 1.6)) : 6, { lh: 21 });
      if (k === 1) { mono(40, 340, 'name: {{ .Release.Name }}-nginx', { 'font-size': 14, fill: INK, opacity: fade(u, 1.6) }); }
      if (k === 2) { NG.forEach((s, i) => { const y = 26 + 48 + (6 + i) * 21, a = seg(u, 0.3 + i * 0.22, 0.6 + i * 0.22);
          if (a < 1) fly(200, TY(5) - 5, 520, y - 5, a, s.trim() || '}', { mono: true });
          if (a >= 1) { for (let d = 0; d < 4; d++) el('rect', { x: 446 + d * 8.4, y: y - 9, width: 5, height: 5, rx: 1, fill: ACC, opacity: 0.8 }); mono(446 + 4 * 8.4, y, s, { 'font-size': 14, 'font-weight': 700, fill: GOOD }); } });
        mono(40, 330, '.Files.Get "config/nginx.conf"', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
        mono(40, 356, '| nindent 4 = 줄바꿈 + 모든 줄 4칸', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.4) });
        mono(40, 390, 'nindent 없으면 둘째 줄부터 0칸 → YAML 오류', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
      return; }
    if (k === 3 || k === 4) { const old = k === 4, AP = ['v1', 'apps/v1', 'autoscaling/v1', old ? 'autoscaling/v2beta2' : 'autoscaling/v2'];
      el('rect', { x: 40, y: 26, width: 900, height: 160, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
      tx(58, 52, old ? '구버전 클러스터의 API 목록' : '대상 클러스터의 API 목록 (.Capabilities.APIVersions)', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      const scan = Math.floor(lerp(0, 4.99, E(u, 0.3, 1.5)));
      AP.forEach((s, i) => { const x = 130 + i * 200, hit = i === 3 && !old && u > 1.5, look = i === scan && u < 1.6;
        pill(x + (i === 3 ? 30 : 0), 110, s, hit ? GOOD : look ? ACC : old && i === 3 && u > 1.5 ? BAD : INK, old && i === 3 ? 1 + R.bump(u, 0.2) : 1, { mono: true, fs: 15, fill: hit ? GOODBG : PANEL }); });
      mono(58, 166, 'Has "autoscaling/v2" → ' + (u > 1.5 ? (old ? 'false' : 'true') : '…'), { 'font-size': 15, 'font-weight': 800, fill: u > 1.5 ? (old ? BAD : GOOD) : MUT });
      const S = [['{{- if .Capabilities.APIVersions.Has "autoscaling/v2" }}', null], ['apiVersion: autoscaling/v2', !old], ['{{- else }}', null], ['apiVersion: autoscaling/v2beta2', old], ['{{- end }}', null]];
      S.forEach(([s, take], i) => { const y = 236 + i * 32, on = take === true && u > 1.8, off = take === false && u > 1.8;
        if (on) el('rect', { x: 50, y: y - 22, width: 520, height: 30, rx: 6, fill: GOODBG });
        mono(take == null ? 60 : 84, y, s, { 'font-size': 15, 'font-weight': on ? 800 : 500, fill: on ? GOOD : off ? OFF : take == null ? MUT : INK, 'text-decoration': off ? 'line-through' : null }); });
      sub(760, 300, old ? 'else 쪽이 남아 구버전에서도 설치된다' : 'autoscaling/v2는 1.23부터 정식', fade(u, 2.1), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 5) { mono(200, 120, 'v1.28.0', { 'font-size': 44, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      [['Major', '1', 130], ['Minor', '28', 230]].forEach(([a, b, x], i) => { grow(x, 140, x, 180, E(u, 0.7 + i * 0.3, 1.0 + i * 0.3), MUT); mono(x, 204, b, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.9 + i * 0.3) });
        tx(x, 228, '.' + a, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.9 + i * 0.3) }); });
      tx(200, 60, '.Capabilities.KubeVersion', { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', class: 'mono' });
      tx(200, 290, '(버전 값은 예시)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      paper(430, 60, 510, 190, 'HPA metadata', ['name: web-hpa', 'annotations:', '  # 렌더할 때 본 클러스터 버전', ['  built-for-k8s: "v1.28.0"', GOOD]], lerp(0, 4, E(u, 1.2, 2.2)));
      sub(685, 300, '나중에 어느 클러스터 기준으로 렌더됐는지 남는다', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); return; }
    // k 6: 결과 + helm template 은 클러스터를 모른다
    [['ConfigMap web-nginx', 'data.nginx.conf: 6줄 그대로'], ['HPA web-hpa', 'apiVersion: autoscaling/v2']].forEach(([a, b], i) => { const x = 250 + i * 460, s = pop(u, 0.2 + i * 0.3);
      card(x, 70, 400, 70, { rx: 10, stroke: GOOD, sw: 2, s }); tx(x - 184, 64, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) }); mono(x - 184, 90, b, { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); });
    [['helm template', '클러스터에 붙지 않는다', 'Helm에 든 기본 목록으로 판단', false], ['helm install / upgrade', '클러스터에 묻는다', '실제 API 목록·버전', true]].forEach(([a, b, d, live], i) => { const x = 50 + i * 460, op = fade(u, 0.9 + i * 0.4);
      el('rect', { x, y: 170, width: 420, height: 160, rx: 12, fill: PANEL, stroke: live ? ACC : WARN, 'stroke-width': 2, opacity: op });
      mono(x + 16, 200, a, { 'font-size': 16, 'font-weight': 800, opacity: op }); tx(x + 16, 228, b, { 'font-size': 14.5, fill: live ? ACC : WARN, 'font-weight': 700, opacity: op }); tx(x + 16, 254, d, { 'font-size': 14, fill: MUT, opacity: op });
      card(x + 340, 250, 110, 50, { rx: 10, text: '클러스터', fs: 14, stroke: live ? ACC : GRID, dash: live ? null : '5 4', op });
      if (live) dot([[x + 220, 250], [x + 285, 250]], ((t * 0.7) % 1), ACC, 6); else { el('line', { x1: x + 220, y1: 250, x2: x + 280, y2: 250, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '4 5', opacity: op }); cross(x + 250, 250, 7, pop(u, 1.4)); } });
    pill(270, 300, '--kube-version · --api-versions', WARN, pop(u, 1.9), { mono: true, fs: 13.5 });
    sub(480, 380, 'helm template으로 볼 때는 Capabilities가 실제 클러스터와 다를 수 있다', fade(u, 2.3), { 'font-size': 15, 'font-weight': 700, fill: INK }); }

  // 5. .Template 과 정리
  const TERM = ['$ helm install web ./mychart -n prod', 'NAME: web', 'NAMESPACE: prod', 'REVISION: 1', 'NOTES:', '파일: mychart/templates/NOTES.txt', '경로: mychart/templates',
    '=== 배포 완료: web ===', '차트    : mychart v0.1.0', '앱 버전 : 1.27', '네임스페이스: prod', '배포 회차: 1', '최초 설치가 완료되었습니다.', '서비스 확인:', '  kubectl get svc -n prod \\', '    -l app.kubernetes.io/instance=web'];
  const UPTO = [7, 8, 12, 13, 16], FROM = [0, 7, 8, 12, 13];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const P = 'mychart/templates/NOTES.txt', fs = 24, x0 = 130, cw = fs * 0.6;
      mono(x0, 110, P.slice(0, Math.round(P.length * E(u, 0.2, 1.0))), { 'font-size': fs, 'font-weight': 800 });
      const b1 = x0 + 17 * cw, b2 = x0 + P.length * cw;
      el('path', { d: `M${x0},132 v10 H${lerp(x0, b1, E(u, 1.0, 1.5))}`, fill: 'none', stroke: ACC, 'stroke-width': 3 }); if (u > 1.5) el('line', { x1: b1, y1: 132, x2: b1, y2: 142, stroke: ACC, 'stroke-width': 3 });
      mono(x0, 170, '.Template.BasePath', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      el('path', { d: `M${x0},190 v10 H${lerp(x0, b2, E(u, 1.5, 2.0))}`, fill: 'none', stroke: INFO, 'stroke-width': 3 }); if (u > 2.0) el('line', { x1: b2, y1: 190, x2: b2, y2: 200, stroke: INFO, 'stroke-width': 3 });
      mono(x0, 228, '.Template.Name', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8) });
      terminal(130, 260, 640, 120, [['파일: mychart/templates/NOTES.txt', 'var(--term)'], ['경로: mychart/templates', 'var(--term)']], u > 2.0 ? 2 : 0, { title: 'NOTES 첫 두 줄' });
      return; }
    if (k <= 4) { const lines = TERM.map((s, i) => [s, i >= FROM[k] && i < UPTO[k] && i > 4 ? WARN : null]);
      terminal(360, 24, 580, 376, lines, k === 1 ? lerp(5, UPTO[1], E(u, 0.3, 1.6)) : lerp(FROM[k], UPTO[k], E(u, 0.8, 2.0)), { title: '출력 예시', lh: 21, fs: 14 });
      tx(40, 46, 'templates/NOTES.txt', { 'font-size': 14, 'font-weight': 800, fill: MUT, class: 'mono' });
      if (k === 1) { mono(40, 100, '=== 배포 완료:', { 'font-size': 14.5 }); mono(40, 126, '    {{ .Release.Name }} ===', { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
        pill(150, 190, '.Release.Name = web', ACC, pop(u, 1.4), { mono: true, fs: 14 });
        sub(170, 250, '설치 뒤 화면에 그대로 찍힌다', fade(u, 1.9), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); }
      if (k === 2) [['.Chart.Name', 'mychart'], ['.Chart.Version', '0.1.0'], ['.Chart.AppVersion', '1.27'], ['.Release.Namespace', 'prod'], ['.Release.Revision', '1']].forEach(([a, b], i) => { const y = 96 + i * 46, s = pop(u, 0.4 + i * 0.25);
        card(180, y, 290, 36, { rx: 18, stroke: i < 3 ? ACC : INFO, sw: 1.8, s }); mono(48, y + 5, a, { 'font-size': 14, 'font-weight': 700, fill: i < 3 ? ACC : INFO, opacity: s > 0.5 ? 1 : 0 });
        mono(312, y + 5, b, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', opacity: s > 0.5 ? 1 : 0 }); });
      if (k === 3) { [['install · rev 1', 'IsInstall = true', '최초 설치가 완료되었습니다.', GOOD], ['upgrade · rev 2', 'IsUpgrade = true', '업그레이드가 완료되었습니다', WARN]].forEach(([a, b, d, col], i) => { const y = 120 + i * 130, s = pop(u, 0.3 + i * 0.6);
          el('rect', { x: 36, y: y - 40, width: 304, height: 106, rx: 10, fill: PANEL, stroke: col, 'stroke-width': i ? 2 : 2.5, 'stroke-dasharray': i ? '6 4' : null, opacity: s });
          tx(50, y - 14, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); mono(50, y + 12, b, { 'font-size': 14, opacity: s }); tx(50, y + 40, d, { 'font-size': 14, fill: i ? MUT : INK, 'font-weight': 700, opacity: s }); });
        sub(190, 380, '둘 중 하나만 남는다 · rollback도 IsUpgrade', fade(u, 2.0), { 'font-size': 14, 'font-weight': 700, fill: INK }); }
      if (k === 4) { ['kubectl get svc', '  -n {{ .Release.Namespace }}', '  -l …/instance={{ .Release.Name }}'].forEach((s, i) => mono(40, 100 + i * 28, s, { 'font-size': 14.5, fill: i ? ACC : INK, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }));
        sub(170, 230, '복사해서 바로 쓰는 명령', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK });
        sub(170, 260, 'Service 라벨과 같은 instance 값', fade(u, 1.9), { 'font-size': 14.5 }); }
      return; }
    // k 5: 서랍 6개 정리
    const USE = ['replicas: 3 · image nginx:1.27', 'web · prod · Revision 1', 'mychart-0.1.0 · appVersion 1.27', 'config/nginx.conf → ConfigMap', 'autoscaling/v2를 고른다', 'mychart/templates/NOTES.txt'];
    el('rect', { x: 38, y: 26, width: 884, height: 348, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    DR.forEach((_, i) => { const a = E(u, 0.2 + i * 0.3, 0.6 + i * 0.3); drawer(56, DY(i), i, { on: a > 0.5, dx: 30 * a, w: 220 });
      grow(312, DY(i) + 21, 312 + 50 * a, DY(i) + 21, a, ACC, { plain: true });
      mono(380, DY(i) + 27, USE[i], { 'font-size': 15, 'font-weight': 700, fill: a > 0.5 ? INK : OFF, opacity: a }); });
    sub(480, 404, '여섯 서랍을 조합하면 실무 매니페스트 대부분이 나온다', fade(u, 2.4), { 'font-size': 15, 'font-weight': 700, fill: INK }); }

  const quiz = [
    { q: '템플릿에 {{ .values.replicaCount }}라고 쓰면 무슨 일이 생기나?',
      o: ['.Values와 똑같이 3이 들어간다', '없는 키라서 렌더가 오류로 멈춘다', 'Helm이 자동으로 대문자로 고쳐 준다'], a: 1,
      why: '내장 객체는 모두 대문자로 시작한다. 소문자 values라는 키는 없어서 그 아래 replicaCount를 꺼내려다 오류가 난다.' },
    { q: 'helm install 뒤 helm upgrade를 하고 다시 helm rollback을 했다. 롤백 때 .Release.Revision과 .Release.IsUpgrade는 무엇인가?',
      o: ['Revision 1, IsUpgrade false', 'Revision 2, IsUpgrade false', 'Revision 3, IsUpgrade true'], a: 2,
      why: 'Revision은 설치 때 1이고 upgrade와 rollback마다 1씩 오른다. rollback도 IsUpgrade가 참이다.' },
    { q: 'app.kubernetes.io/version: {{ .Chart.AppVersion }}에서 quote를 빼면 어떻게 되나?',
      o: ['1.27이 숫자로 읽혀 문자열이어야 하는 라벨 값과 맞지 않는다', '아무 차이 없다', '라벨 값이 빈 칸이 된다'], a: 0,
      why: '따옴표 없는 1.27은 YAML이 숫자로 읽는다. 라벨 값은 문자열이어야 하므로 quote로 "1.27"을 만든다.' },
    { q: 'helm template으로 렌더하면 .Capabilities.APIVersions.Has는 무엇을 보고 답하나?',
      o: ['연결된 클러스터에 그때그때 물어본다', 'values.yaml에 적힌 apiVersion 값', 'Helm에 든 기본 목록, 또는 --api-versions로 준 목록'], a: 2,
      why: 'helm template은 클러스터에 붙지 않는다. 실제 클러스터 기준이 필요하면 --api-versions와 --kube-version을 준다.' },
    { q: 'NOTES.txt에서 .Release.IsInstall과 .Release.IsUpgrade로 문구를 나눴다. 첫 설치에서 화면에 남는 것은 무엇인가?',
      o: ['"최초 설치가 완료되었습니다."만 남는다', '두 문구가 모두 찍힌다', '아무 문구도 찍히지 않는다'], a: 0,
      why: '첫 설치에서는 IsInstall만 참이라 if 쪽만 렌더된다. 둘이 함께 참인 경우는 없다.' },
  ];

  const summary = [
    '내장 객체 여섯 가지는 정의하지 않아도 들어오고, .Values처럼 모두 대문자로 시작한다.',
    '.Release는 이름·네임스페이스·회차를 주고, Revision은 설치 1에서 upgrade와 rollback마다 오른다.',
    '표준 라벨은 차트 이름과 릴리스 이름을 섞어 만들고, 버전 같은 값은 quote로 문자열로 둔다.',
    '.Files는 templates 밖 파일을 읽고, .Capabilities는 클러스터 API에 따라 매니페스트를 고른다.',
  ];
  const review = [
    { q: '아무 값도 바꾸지 않고 helm upgrade만 했는데 Pod가 전부 새로 떴다. 먼저 의심할 것은?',
      o: ['values.yaml이 몰래 바뀌었다', 'Pod 템플릿 env에 .Release.Revision 같은 회차 값이 들어 있다', 'Chart.yaml의 name이 바뀌었다'], a: 1,
      why: 'Revision은 upgrade마다 오른다. 그 값이 Pod 템플릿에 있으면 템플릿이 바뀌어 Deployment가 Pod를 새로 만든다.' },
    { q: '같은 차트를 web과 web2로 두 번 설치했다. kubectl -l로 web 쪽 객체만 고르려면 어느 라벨을 쓰나?',
      o: ['app.kubernetes.io/name', 'helm.sh/chart', 'app.kubernetes.io/instance'], a: 2,
      why: 'name과 helm.sh/chart는 두 설치가 같다. instance에는 .Release.Name이 들어가 배포마다 달라진다.' },
    { q: 'config/nginx.conf를 .Files.Get으로 넣었더니 YAML 오류가 났다. 먼저 고칠 곳은?',
      o: ['nindent로 모든 줄을 data 블록 깊이만큼 들여쓰기', '파일을 templates/ 안으로 옮기기', '.Capabilities로 버전을 확인하기'], a: 0,
      why: '여러 줄 파일을 그대로 넣으면 둘째 줄부터 들여쓰기가 0칸이 되어 블록이 깨진다. templates/ 안으로 옮기면 .Files가 읽지도 못한다.' },
  ];

  R.page({ title: '내장 객체 6가지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
