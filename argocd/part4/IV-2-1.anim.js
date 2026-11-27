/* IV-2-1 Sealed Secrets — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * base64 "cGFzczEyMw==" → "pass123" 은 파이썬으로 디코드해 확인했다(4글자 묶음 cGFz·czEy·Mw== → pas·s12·3).
 * 키 갱신 30일, 스코프 어노테이션, ownerReference 는 sealed-secrets README 로 확인했다. kubectl 출력은 코드에 있는 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    cross, check, lock, terminal, spans, fly, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 열쇠 (공개키 = INFO, 개인키 = WARN)
  function key(cx, cy, col, s, o) { o = o || {}; const g = G(cx, cy, s ?? 1, o.op);
    el('circle', { cx: -14, cy: 0, r: 9, fill: PANEL, stroke: col, 'stroke-width': 3.5 }, g);
    el('path', { d: 'M-5,0 H18 M10,0 V7 M16,0 V6', fill: 'none', stroke: col, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
    if (o.label) tx(2, 26, o.label, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }, g); return g; }
  // 봉투(봉인된 SealedSecret)
  function env(cx, cy, o) { o = o || {}; const w = o.w || 110, h = o.h || 70, g = G(cx, cy, o.s ?? 1, o.op), col = o.col || GOOD;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 6, fill: o.fill || GOODBG, stroke: col, 'stroke-width': 2.5 }, g);
    el('path', { d: `M${-w / 2},${-h / 2} L0,${h * 0.05} L${w / 2},${-h / 2}`, fill: 'none', stroke: col, 'stroke-width': 2 }, g);
    if (o.text) tx(0, h / 2 + 20, o.text, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }, g);
    if (o.lock) lock(0, h * 0.18, true, col, 0.8); return g; }
  // 문서 한 장
  function doc(cx, cy, name, o) { o = o || {}; const w = o.w || 170, h = o.h || 46, col = o.col || INK;
    card(cx, cy, w, h, { rx: 6, stroke: col, sw: 2, fill: o.fill || PANEL, text: name, fs: 13.5, mono: true, color: col, s: o.s, op: o.op, dash: o.dash }); }
  const AREA = [['로컬', 30, 270], ['Git', 330, 270], ['클러스터', 630, 300]];
  function areas(op) { AREA.forEach(([n, x, w]) => zone(x, 30, w, 330, n, { op: op ?? 1 })); }

  // ---------- 1. 시크릿 딜레마 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { el('rect', { x: 40, y: 40, width: 400, height: 250, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 });
      [['kind: Secret', INK], ['metadata:  name: db-credentials', INK], ['type: Opaque', WARN], ['data:', INK], ['  password: cGFzczEyMw==', BAD]].forEach(([s, col], i) =>
        mono(60, 80 + i * 40, s, { 'font-size': 15, fill: col, 'font-weight': col === INK ? 500 : 700, opacity: k === 0 ? fade(u, 0.2 + i * 0.25) : 1 }));
      if (k === 0) { lock(330, 160, false, WARN, pop(u, 1.3)); cross(330, 160, 20, pop(u, 1.8));
        note(480, 120, 'Opaque는 "보호" 라는 뜻이 아니다', fade(u, 1.4)); note(480, 150, 'base64는 인코딩일 뿐이다', fade(u, 1.8), { fill: BAD }); }
      else { const parts = [['cGFz', 'pas'], ['czEy', 's12'], ['Mw==', '3']];
        mono(480, 90, '$ echo cGFzczEyMw== | base64 -d', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
        parts.forEach(([a, b], i) => { const x = 520 + i * 130, f = E(u, 0.7 + i * 0.4, 1.3 + i * 0.4);
          card(x, 160, 96, 40, { rx: 6, text: a, fs: 16, mono: true, stroke: GRID, color: MUT });
          grow(x, 182, x, 222, f, BAD); if (f >= 1) card(x, 250, 96, 44, { rx: 6, text: b, fs: 18, mono: true, stroke: BAD, fill: BADBG, color: BAD, s: pop(u, 1.3 + i * 0.4) }); });
        note(480, 320, '한 줄이면 평문 pass123이 나온다', fade(u, 2.2), { fill: BAD }); }
      return; }
    if (k === 2) { const y = 130; el('line', { x1: 60, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 3 });
      for (let i = 0; i < 8; i++) { const x = 90 + i * 110, bad = i === 3; el('circle', { cx: x, cy: y, r: bad ? 13 : 9, fill: bad ? BAD : PANEL, stroke: bad ? BAD : INK, 'stroke-width': 2.5, opacity: fade(u, i * 0.08) }); }
      mono(420, y - 26, 'add db secret', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle' });
      [['포크', 160], ['미러 · 백업', 360], ['PR diff', 560], ['CI 로그', 760]].forEach(([n, x], i) => { const f = seg(u, 0.5 + i * 0.3, 1.3 + i * 0.3);
        dot([[420, y + 14], [x, 280]], f, BAD, 7); if (f >= 1) card(x, 290, 140, 44, { rx: 8, stroke: BAD, text: n, fs: 15, color: BAD, s: pop(u, 1.3 + i * 0.3) }); });
      note(480, 370, '히스토리를 고쳐도 퍼진 사본은 못 거둔다', fade(u, 2.3), { 'text-anchor': 'middle' });
      return; }
    if (k === 3) { zone(40, 40, 520, 230, 'Git 저장소 (원하는 상태)');
      ['Deployment', 'Service', 'ConfigMap', 'Ingress'].forEach((n, i) => doc(130 + (i % 2) * 220, 110 + Math.floor(i / 2) * 70, n, { s: pop(u, 0.1 + i * 0.1) }));
      doc(760, 140, 'Secret', { col: BAD, dash: '6 5', s: pop(u, 0.6) }); sub(760, 186, 'Git 밖에서 손으로 kubectl', fade(u, 0.8));
      grow(300, 280, 300, 330, E(u, 1.2, 1.6), MUT); card(300, 360, 260, 44, { rx: 10, stroke: INK, text: '새 클러스터를 Git으로 복구', fs: 14.5, s: pop(u, 1.5) });
      cross(500, 360, 14, pop(u, 2.0)); note(560, 366, 'Secret이 빠져 있다', fade(u, 2.1), { fill: BAD });
      return; }
    // k4: 공개키로 잠근 채 Git 에
    doc(130, 170, 'Secret (평문)', { col: BAD, s: pop(u, 0.1) }); key(300, 120, INFO, pop(u, 0.5), { label: '클러스터 공개키' });
    grow(220, 170, 400, 170, E(u, 0.7, 1.3), INFO);
    env(480, 170, { s: pop(u, 1.3), lock: true, text: 'SealedSecret' });
    grow(545, 170, 700, 170, E(u, 1.7, 2.2), GOOD); zone(710, 110, 220, 130, '공개 Git 저장소', { op: fade(u, 1.8) }); check(820, 190, 16, pop(u, 2.2));
    note(480, 320, '클러스터만 열 수 있으니 암호문은 공개돼도 된다', fade(u, 2.3), { 'text-anchor': 'middle' }); }

  // ---------- 2. 원리 ----------
  function cluster(c, o) { o = o || {}; card(780, 110, 200, 60, { rx: 10, stroke: WARN, sw: 2.5, text: 'controller', fs: 15, color: WARN, s: o.s });
    key(730, 170, INFO, o.ks, { label: '공개키' }); key(830, 170, WARN, o.ks, { label: '개인키' }); }
  function s2(t, c) { const { k, u } = c;
    areas();
    if (k === 0) { cluster(c, { s: pop(u, 0.2), ks: pop(u, 0.6) });
      card(165, 120, 160, 50, { rx: 10, stroke: INFO, text: 'kubeseal', fs: 15, mono: true, color: INFO, s: pop(u, 1.0) }); sub(165, 162, '암호화만 한다', fade(u, 1.2));
      env(465, 150, { s: pop(u, 1.5), text: 'SealedSecret (CRD)' });
      doc(780, 300, 'Secret', { s: pop(u, 2.0) }); sub(780, 340, 'controller가 만든다', fade(u, 2.2));
      return; }
    cluster(c, {});
    if (k === 1) { doc(165, 110, 'Secret (평문)', { col: BAD });
      const kf = E(u, 0.2, 1.1); key(lerp(730, 165, kf), lerp(170, 190, kf), INFO, 1);
      env(165, 290, { s: pop(u, 1.4), lock: true, text: 'SealedSecret' }); grow(165, 136, 165, 246, E(u, 1.1, 1.5), INFO);
      return; }
    if (k === 2) { const f1 = E(u, 0.2, 1.0), f2 = E(u, 1.2, 2.0);
      env(lerp(165, 465, f1), 190, { lock: true, text: 'git push' });
      if (f2 > 0) env(lerp(465, 690, f2), lerp(190, 290, f2), { lock: true, s: 0.8 });
      mono(465, 300, 'ArgoCD sync', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      return; }
    if (k === 3) { env(690, 290, { lock: true, s: 0.8 }); key(lerp(830, 712, E(u, 0.2, 0.9)), lerp(170, 290, E(u, 0.2, 0.9)), WARN, 1);
      grow(740, 290, 800, 290, E(u, 1.0, 1.4), WARN); doc(870, 290, 'Secret', { w: 110, s: pop(u, 1.3) });
      card(870, 210, 110, 40, { rx: 8, stroke: INK, text: 'Pod', fs: 15, s: pop(u, 1.9) }); grow(870, 266, 870, 232, E(u, 1.9, 2.3), MUT);
      sub(780, 352, '평문은 클러스터 안에서만', fade(u, 2.0), { fill: WARN, 'font-weight': 700 });
      return; }
    if (k === 4) { el('rect', { x: 636, y: 140, width: 288, height: 66, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.4) });
      [[165, 200], [465, 120]].forEach(([x, y], i) => key(x, y, INFO, pop(u, 0.3 + i * 0.4)));
      sub(315, 160, '공개키는 나눠 줘도 된다', fade(u, 1.0), { fill: INFO, 'font-weight': 700 });
      env(465, 260, { lock: true }); el('circle', { cx: 380, cy: 300, r: 12, fill: BAD });
      cross(430, 290, 12, pop(u, 1.8)); sub(380, 340, '암호문만으론 못 연다', fade(u, 1.9), { fill: BAD });
      sub(780, 230, '개인키는 밖으로 안 나간다', fade(u, 1.6), { fill: WARN, 'font-weight': 700 });
      return; }
    if (k === 5) { env(465, 150, { lock: true }); pill(465, 220, 'app / db-credentials', GOOD, pop(u, 0.3), { mono: true, fs: 13.5 });
      sub(465, 252, 'name + namespace가 함께 봉인', fade(u, 0.6));
      [['ns app', 690, 290, true], ['ns other', 870, 290, false]].forEach(([n, x, y, ok], i) => { const f = E(u, 0.9 + i * 0.6, 1.5 + i * 0.6);
        dot([[520, 160], [x, y - 40]], f < 1 ? f : 0.999, ok ? GOOD : BAD, 7); card(x, y, 140, 44, { rx: 8, text: n, fs: 14, mono: true, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD });
        if (f >= 1) (ok ? check : cross)(x + 56, y - 34, 10, pop(u, 1.5 + i * 0.6)); });
      return; }
    // k6: Helm 으로 설치 → 전체 흐름
    pill(760, 340, 'helm install sealed-secrets -n kube-system', INK, pop(u, 0.2), { mono: true, fs: 13.5 });
    doc(165, 110, 'Secret (평문)', { col: BAD, s: pop(u, 0.4) }); env(165, 270, { lock: true, s: pop(u, 0.7), text: 'kubeseal' });
    env(465, 190, { lock: true, s: pop(u, 1.0), text: '암호문 · 공개 OK' }); doc(870, 290, 'Secret', { w: 110, s: pop(u, 1.6) });
    grow(225, 270, 405, 200, E(u, 0.9, 1.3), GOOD); grow(525, 200, 810, 280, E(u, 1.3, 1.8), WARN); }

  // ---------- 3. kubeseal 절차 ----------
  const CMD = [
    [0, ['NS=app', 'CONTROLLER_NS=kube-system', 'CONTROLLER_NAME=sealed-secrets']],
    [1, ['$ kubectl create secret generic db-credentials \\', '    --from-literal=password="pass123" \\', '    --dry-run=client -o yaml > /tmp/plain-secret.yaml']],
    [2, ['$ kubeseal --format yaml \\', '    < /tmp/plain-secret.yaml > sealed-secret.yaml']],
    [3, ['$ rm -f /tmp/plain-secret.yaml']],
    [4, ['$ git add sealed-secret.yaml && git push']],
    [5, ['$ kubeseal --fetch-cert > pub-cert.pem', '$ kubeseal --cert pub-cert.pem --format yaml …']],
    [6, ['$ kubeseal --merge-into sealed-secret.yaml \\', '    < new-plain-secret.yaml']],
  ];
  function s3(t, c) { const { k, u } = c;
    const lines = []; CMD.forEach(([b, ls]) => { if (b <= k) ls.forEach((l) => lines.push(b === k ? [l, 'var(--panel)'] : [l, 'var(--off)'])); });
    const before = lines.length - CMD[k][1].length;
    terminal(24, 24, 540, 340, lines, before + E(u, 0.2, 1.6) * CMD[k][1].length, { fs: 13.5, lh: 21, title: 'seal-secret.sh' });
    // 오른쪽: 로컬 파일과 그 바깥
    tx(600, 50, '로컬 파일', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k >= 1 && k <= 3) doc(700, 100, 'plain-secret.yaml', { col: BAD, w: 200, s: k === 1 ? pop(u, 1.4) : 1, op: k === 3 ? 1 - E(u, 1.0, 1.8) : 1 });
    if (k === 3) cross(800, 100, 14, pop(u, 1.0));
    if (k === 1) sub(700, 140, '아직 평문, 클러스터에는 아무것도 안 생김', fade(u, 1.8), { fill: BAD });
    if (k >= 2 && k !== 4) {
      doc(700, 180, 'sealed-secret.yaml', { col: GOOD, w: 200, s: k === 2 ? pop(u, 1.4) : 1 });
      if (k === 6) { ['username', 'password', '+ 새 키'].forEach((n, i) => mono(620, 230 + i * 22, n, { 'font-size': 13.5, fill: i === 2 ? GOOD : MUT, 'font-weight': i === 2 ? 800 : 500, opacity: i === 2 ? fade(u, 1.5) : 1 })); sub(820, 296, '다시 전부 봉인할 필요 없음', fade(u, 1.9)); } }
    if (k === 2) { key(870, 100, INFO, pop(u, 0.8), { label: 'controller 공개키' }); grow(860, 128, 790, 170, E(u, 1.0, 1.4), INFO); }
    if (k >= 4) { zone(600, 300, 330, 70, 'Git 저장소'); if (k === 4) { const f = E(u, 0.4, 1.4); doc(lerp(700, 810, f), lerp(180, 340, f), 'sealed-secret.yaml', { col: GOOD, w: 200 }); }
      else doc(810, 340, 'sealed-secret.yaml', { col: GOOD, w: 200 }); }
    if (k === 0) { card(760, 180, 260, 70, { rx: 10, stroke: WARN, text: 'kube-system\nsealed-secrets', fs: 15, mono: true, color: WARN, s: pop(u, 1.4) }); sub(760, 240, '공개키를 가져올 곳', fade(u, 1.8)); }
    if (k === 5) { doc(700, 240, 'pub-cert.pem', { col: INFO, w: 200, s: pop(u, 1.0) }); pill(860, 240, 'CI', INFO, pop(u, 1.5), { fs: 14 }); sub(760, 280, 'kubeconfig 없이 봉인', fade(u, 1.8), { fill: INFO, 'font-weight': 700 }); } }

  // ---------- 4. SealedSecret 과 복호화 ----------
  const YAML = [['kind: SealedSecret', 0], ['metadata:', 0], ['  name: db-credentials', 0], ['  namespace: app', 0], ['spec:', -1], ['  encryptedData:', 1], ['    username: AgBy3i4Q…', 1], ['    password: AgCt9Kx1…', 1], ['  template:', 2], ['    labels: { app: my-api }', 2], ['    type: Opaque', 2]];
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { el('rect', { x: 24, y: 24, width: 420, height: 340, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 });
      const hi = k === 3 ? -9 : k; YAML.forEach(([s, sec], i) => { const y = 60 + i * 28, on = sec === hi;
        if (on) el('rect', { x: 32, y: y - 19, width: 404, height: 26, rx: 4, fill: [ACCBG, GOODBG, INFOBG][sec], opacity: fade(u, 0.2 + (i % 4) * 0.15) });
        mono(44, y, s, { 'font-size': 14.5, fill: on ? [ACC, GOOD, INFO][sec] : (k === 3 ? MUT : INK), 'font-weight': on ? 700 : 500 }); }); }
    if (k === 0) { pill(640, 140, 'app / db-credentials', ACC, pop(u, 0.6), { mono: true }); lock(640, 200, true, ACC, pop(u, 1.0));
      note(520, 270, '이름과 네임스페이스가 봉인에 들어간다', fade(u, 1.4)); note(520, 296, '나중에 바꾸면 못 연다', fade(u, 1.7), { fill: BAD }); }
    if (k === 1) { env(660, 150, { lock: true, s: pop(u, 0.3) }); note(520, 260, '키마다 따로 암호문이 들어간다', fade(u, 1.0)); note(520, 286, '이 파일이 Git에 커밋되는 실체다', fade(u, 1.4), { fill: GOOD }); }
    if (k === 2) { card(680, 170, 240, 150, { rx: 10, stroke: INFO, sw: 2, dash: '7 6', s: pop(u, 0.5) }); mono(680, 140, 'Secret (예정)', { 'font-size': 15, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      mono(680, 180, 'app: my-api', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); mono(680, 206, 'Opaque', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(680, 280, 'template은 암호화하지 않는다', fade(u, 1.6)); }
    if (k === 3) { const st = ['watch로 감지', '개인키로 복호화', 'Secret 생성', 'ownerReference'];
      st.forEach((s, i) => { const y = 70 + i * 66; card(700, y, 230, 46, { rx: 10, stroke: i === 3 ? ACC : WARN, text: (i + 1) + '. ' + s, fs: 15, color: i === 3 ? ACC : INK, s: pop(u, 0.2 + i * 0.4) });
        if (i < 3) grow(700, y + 24, 700, y + 42, E(u, 0.5 + i * 0.4, 0.7 + i * 0.4), MUT); });
      sub(700, 352, 'SealedSecret을 지우면 Secret도 함께 지워진다', fade(u, 2.0), { fill: ACC, 'font-weight': 700 }); }
    if (k === 4) { terminal(40, 40, 600, 200, ['$ kubectl get sealedsecret,secret -n app', 'NAME                          AGE', 'sealedsecret/db-credentials   10s', 'NAME                   TYPE     DATA   AGE', ['secret/db-credentials  Opaque   2      9s', 'var(--good)']], 1 + E(u, 0.2, 2.2) * 4, { fs: 14 });
      sub(340, 262, '코드에 적힌 예시 출력', fade(u, 2.0)); env(780, 120, { lock: true, s: 0.8, text: 'sealedsecret' }); doc(780, 240, 'secret', { w: 120, s: pop(u, 1.8) }); }
    if (k === 5) { [['cluster-wide', 170, BAD, '어디서나 풀린다'], ['namespace-wide', 115, WARN, '같은 ns 안 이름 자유'], ['strict (기본)', 60, GOOD, 'name + ns 일치']].forEach(([n, r, col, w], i) => {
        const rr = r * E(u, 0.2 + i * 0.4, 0.9 + i * 0.4); el('circle', { cx: 300, cy: 200, r: rr, fill: col, opacity: 0.1, stroke: col, 'stroke-width': 2.5 });
        mono(560, 120 + i * 70, n, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.4) }); tx(560, 144 + i * 70, w, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.4) }); });
      env(300, 200, { lock: true, s: 0.55 }); }
    if (k === 6) { doc(160, 120, 'Secret db-credentials', { w: 240 }); card(560, 200, 300, 140, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 0.3) });
      tx(430, 160, 'Pod', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.4) });
      mono(430, 200, 'envFrom:', { 'font-size': 14.5, opacity: fade(u, 0.6) }); mono(450, 226, '- secretRef: db-credentials', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9) });
      grow(280, 130, 410, 190, E(u, 1.2, 1.8), ACC); note(160, 330, '복호화된 뒤로는 평범한 Secret과 같다', fade(u, 1.8)); } }

  // ---------- 5. 키 관리 · 대안 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { zone(40, 40, 380, 230, 'kube-system');
      card(230, 130, 320, 70, { rx: 10, stroke: WARN, sw: 2.5, s: pop(u, 0.2) }); key(110, 130, WARN, pop(u, 0.4));
      mono(150, 124, 'Secret (개인키)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4) }); mono(150, 148, 'sealed-secrets-key', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
      pill(230, 220, '-l sealedsecrets.bitnami.com/sealed-secrets-key', WARN, pop(u, 0.9), { mono: true, fs: 13.5 });
      grow(420, 150, 560, 150, E(u, 1.2, 1.7), WARN); doc(720, 150, 'sealed-secrets-key-backup.yaml', { col: WARN, w: 290, s: pop(u, 1.7) });
      return; }
    if (k === 1) { doc(200, 150, 'key-backup.yaml', { col: BAD, w: 220 }); key(200, 210, WARN, pop(u, 0.3), { label: '이 파일 = 개인키' });
      card(620, 110, 240, 60, { rx: 10, stroke: GOOD, sw: 2.5, text: '사내 Vault · 오프라인 금고', fs: 14.5, color: GOOD, s: pop(u, 0.6) }); grow(312, 140, 496, 112, E(u, 0.8, 1.3), GOOD);
      card(620, 260, 240, 60, { rx: 10, stroke: BAD, sw: 2.5, text: 'Git 커밋', fs: 15, color: BAD, s: pop(u, 1.2) }); cross(760, 260, 14, pop(u, 1.6));
      note(80, 350, 'Git에 올라가는 순간 모든 봉인이 무의미해진다', fade(u, 1.9), { fill: BAD });
      return; }
    if (k === 2) { const st = [['백업 키 apply', WARN], ['controller 설치', INK], ['옛 SealedSecret 복호화', GOOD]];
      tx(60, 70, '새 클러스터 복구 순서', { 'font-size': 16, 'font-weight': 800 });
      st.forEach(([s, col], i) => { const x = 170 + i * 300; card(x, 180, 240, 60, { rx: 10, stroke: col, sw: 2.5, text: (i + 1) + '. ' + s, fs: 15, color: col, s: pop(u, 0.2 + i * 0.6) });
        if (i < 2) grow(x + 122, 180, x + 178, 180, E(u, 0.6 + i * 0.6, 0.9 + i * 0.6), MUT); });
      note(60, 300, '키를 먼저 넣어야 옛 암호문이 그대로 열린다', fade(u, 2.0));
      return; }
    if (k === 3) { const x0 = 80, x1 = 880, y = 150, days = [0, 30, 60, 90];
      el('line', { x1: x0, y1: y, x2: x0 + (x1 - x0) * E(u, 0.1, 1.6), y2: y, stroke: INK, 'stroke-width': 2.5 });
      days.forEach((d, i) => { const x = lerp(x0, x1, d / 90), op = fade(u, 0.2 + i * 0.45); el('line', { x1: x, y1: y - 6, x2: x, y2: y + 6, stroke: INK, 'stroke-width': 2, opacity: op });
        mono(x, y + 28, d + '일', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: op }); key(x, y - 34, WARN, pop(u, 0.3 + i * 0.45), { label: '키 ' + (i + 1) }); });
      env(lerp(x0, x1, 15 / 90), 270, { lock: true, s: 0.7, text: '0일에 봉인한 것' }); grow(lerp(x0, x1, 15 / 90), 240, x0 + 6, 140, E(u, 2.0, 2.4), WARN);
      note(400, 280, '옛 키도 남아 있어 그대로 열린다', fade(u, 2.2)); note(400, 306, '자동 재암호화는 없다', fade(u, 2.4), { fill: BAD });
      return; }
    if (k === 4) { el('line', { x1: 480, y1: 50, x2: 480, y2: 340, stroke: GRID, 'stroke-width': 2 });
      tx(250, 70, '암호문을 Git에 둔다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
      tx(710, 70, '외부 저장소를 참조만 한다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      [['Sealed Secrets', '가볍다 · 소~중 규모', 250, 140, GOOD], ['SOPS + age/KMS', '파일 단위 · 여러 도구 공유', 250, 240, GOOD], ['External Secrets', 'AWS · GCP Secret Manager', 710, 140, INFO], ['Vault', '동적 시크릿 · 감사 · 짧은 TTL', 710, 240, INFO]].forEach(([a, b, x, y, col], i) => {
        card(x, y, 300, 72, { rx: 10, stroke: col, sw: 2, s: pop(u, 0.4 + i * 0.3) }); tx(x, y - 6, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.5 + i * 0.3) });
        tx(x, y + 18, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.3) }); });
      note(480, 330, '고르는 기준: 규모 · 감사 · TTL', fade(u, 1.9), { 'text-anchor': 'middle' });
      return; }
    if (k === 5) { ['평문 YAML을 커밋하지 않았나 (.gitignore)', '개인키를 백업했나', '스코프를 의도대로 정했나', 'name · namespace가 맞나', 'controller와 kubeseal 버전이 맞나', '복구 문서에 키 복원 절차가 있나'].forEach((s, i) => {
        const y = 60 + i * 52, d = 0.2 + i * 0.35; el('rect', { x: 160, y: y - 21, width: 28, height: 28, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2 });
        check(174, y - 7, 9, pop(u, d + 0.2)); tx(206, y, s, { 'font-size': 15.5, opacity: fade(u, d) }); });
      return; }
    terminal(40, 50, 600, 150, ['$ kubectl logs -n kube-system deploy/sealed-secrets', ['no key could decrypt secret (password)', 'var(--bad)']], 1 + E(u, 0.2, 1.4), { fs: 14 });
    [['스코프 불일치', 'name · namespace를 바꿨다'], ['키 삭제', '봉인한 키가 이미 없다']].forEach(([a, b], i) => { const x = 200 + i * 340, s = pop(u, 1.4 + i * 0.4);
      card(x, 290, 300, 70, { rx: 10, stroke: BAD, sw: 2, s }); tx(x, 284, a, { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: s }); tx(x, 306, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    sub(340, 222, '로그 문구는 예시', fade(u, 1.4)); }

  const quiz = [
    { q: 'Secret의 password: cGFzczEyMw== 를 Git에 올리면 안 되는 이유는 무엇인가?',
      o: ['base64는 인코딩이라 누구나 pass123으로 되돌린다', 'Opaque 타입이라 Git이 거부한다', '값이 너무 길어서'], a: 0,
      why: 'echo cGFzczEyMw== | base64 -d 한 줄이면 pass123이 나온다. 히스토리와 사본에 영원히 남는다.' },
    { q: 'SealedSecret을 공개 저장소에 올려도 안전한 이유는 무엇인가?',
      o: ['kubeseal이 비밀번호를 지워서', '공개키로 잠갔고 여는 개인키는 클러스터 밖으로 안 나가서', 'Git이 자동으로 암호화해서'], a: 1,
      why: '공개키로 잠근 것은 controller의 개인키로만 열린다. 개인키는 클러스터를 떠나지 않는다.' },
    { q: 'kubeseal로 봉인한 뒤 /tmp/plain-secret.yaml은 어떻게 해야 하는가?',
      o: ['sealed-secret.yaml 옆에 같이 커밋한다', '나중을 위해 그대로 둔다', '바로 지운다'], a: 2,
      why: '남겨 두면 언젠가 커밋된다. Git에 올라가는 것은 sealed-secret.yaml 하나뿐이어야 한다.' },
    { q: 'strict 스코프로 봉인한 SealedSecret을 다른 네임스페이스에 그대로 적용하면 어떻게 되는가?',
      o: ['복호화가 거부된다', '그 네임스페이스 이름으로 다시 봉인된다', '아무 문제 없이 Secret이 생긴다'], a: 0,
      why: 'strict는 name과 namespace를 함께 봉인한다. 어디서나 풀리게 하려면 cluster-wide 어노테이션이 필요하다.' },
    { q: 'controller가 30일마다 새 키를 만든 뒤 예전에 봉인한 SealedSecret은 어떻게 되는가?',
      o: ['자동으로 새 키로 다시 봉인된다', '옛 키가 남아 있어 그대로 복호화된다', '복호화가 안 돼서 다시 만들어야 한다'], a: 1,
      why: '옛 키는 지우지 않고 보관한다. 대신 자동 재암호화도 없어서 옛 키를 버리려면 직접 다시 봉인해야 한다.' },
  ];

  const summary = [
    'Secret의 data는 base64라서 Git에 올리면 누구나 pass123 같은 평문을 읽는다.',
    'kubeseal이 controller 공개키로 봉인하고, 개인키를 가진 controller만 클러스터 안에서 연다.',
    '기본 strict 봉인은 name과 namespace를 묶어서 다른 곳에 붙이면 열리지 않는다.',
    '개인키를 잃으면 모든 SealedSecret이 못 쓰게 되니 키부터 백업하고 복구 때도 먼저 넣는다.',
  ];
  const review = [
    { q: '클러스터를 새로 만들고 Git으로 sync 했더니 SealedSecret만 있고 Secret이 안 생긴다. 먼저 의심할 것은?',
      o: ['옛 controller의 개인키를 복원하지 않았다', 'ArgoCD의 sync 주기가 길다', 'Secret의 type이 Opaque라서'], a: 0,
      why: '새 controller는 새 키를 만든다. 옛 암호문은 옛 개인키로만 열리므로 백업 키를 먼저 넣어야 한다.' },
    { q: 'CI에서 kubeconfig 없이 시크릿을 봉인해야 한다. 알맞은 방법은?',
      o: ['CI에 개인키 백업 파일을 넣는다', 'kubeseal --fetch-cert로 받아 둔 공개키를 --cert로 쓴다', '평문 Secret을 커밋하고 CI가 apply 한다'], a: 1,
      why: '봉인에는 공개키만 있으면 된다. 개인키를 밖으로 꺼내면 봉인 전체가 무의미해진다.' },
    { q: 'controller 로그에 no key could decrypt secret이 보인다. 이름을 db-cred로 바꿔 apply 한 직후다. 원인은?',
      o: ['kubeseal 버전이 너무 새롭다', '네트워크가 끊겼다', 'strict 봉인에 들어간 이름과 지금 이름이 달라서'], a: 2,
      why: 'strict 스코프는 봉인 때의 name과 namespace가 그대로여야 열린다. 바꾼 이름으로 다시 봉인해야 한다.' },
  ];

  R.page({ title: 'Sealed Secrets 봉인과 개봉', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
