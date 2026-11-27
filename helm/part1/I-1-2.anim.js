/* I-1-2 Release 생명주기 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, server, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  const chip = (x, y, s, col, sc, o) => pill(x, y, s, col, sc, Object.assign({ mono: true, fs: 13.5 }, o || {}));
  const ST = { deployed: GOOD, superseded: MUT, failed: BAD, uninstalled: WARN, 'pending-install': WARN };
  // 터미널: 줄 목록, 0→n 줄을 u 동안 보인다
  const term = (x, y, w, h, lines, u, t0, o) => R.terminal(x, y, w, h, lines, Math.min(lines.length, lerp(0.5, lines.length, E(u, t0 ?? 0.1, (t0 ?? 0.1) + 0.25 * lines.length))), Object.assign({ fs: 13.5, lh: 21, title: '터미널 (출력은 예시)' }, o || {}));
  // revision 하나: 원 + 상태 + 이미지 태그
  function rev(x, y, n, status, tag, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const col = ST[status] || INK, g = R.G(x, y, s);
    el('circle', { cx: 0, cy: 0, r: 28, fill: status === 'deployed' ? GOODBG : PANEL, stroke: col, 'stroke-width': o.hot ? 3.5 : 2.5 }, g);
    tx(0, -3, 'rev', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); mono(0, 15, String(n), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col }, g);
    if (status) chip(x, y + 48, status, col, s, { color: col });
    if (tag) mono(x, y + 80, tag, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.tagCol || MUT, opacity: s, 'font-weight': 700 }); }
  // release Secret 한 장
  function secret(x, y, n, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1; if (s <= 0 || op <= 0) return; const nm = 'sh.helm.release.v1.web.v' + n;
    card(x, y, tw(nm, 13.5) + 46, 34, { rx: 8, stroke: o.col || INFO, sw: o.hot ? 2.6 : 1.6, fill: o.hot ? INFOBG : PANEL, s, op, dash: o.dash });
    lock(x - tw(nm, 13.5) / 2 - 6, y + 1, true, o.col || INFO, 0.55 * s); mono(x + 8, y + 5, nm, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.col || INFO, 'font-weight': 700, opacity: op * (s > 0.6 ? 1 : 0) }); }
  // 리소스 카드 (Deployment / Service …)
  function res(x, y, kind, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; card(x, y, 150, 50, { rx: 10, stroke: o.col || INK, sw: 2, dash: o.dash, s, op: o.op, fill: o.fill });
    tx(x, y - 4, kind, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: o.col || INK, opacity: (o.op ?? 1) * (s > 0.6 ? 1 : 0) });
    mono(x, y + 15, o.name || 'web-webapp', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: (o.op ?? 1) * (s > 0.6 ? 1 : 0) }); }
  function nsBox(op, dash) { zone(384, 14, 560, 392, 'namespace prod', { stroke: INFO, sw: 2, fill: INFOBG, op, dash, color: INFO }); }
  // 표 (헤더 + 줄)
  function table(x, y, cols, rows, o) { o = o || {}; const lh = o.lh || 28;
    cols.forEach(([h, cx]) => tx(x + cx, y, h, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 }));
    el('line', { x1: x, y1: y + 8, x2: x + (o.w || 400), y2: y + 8, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    rows.forEach((r, i) => { const a = o.show == null ? 1 : clamp(o.show - i); if (a <= 0) return; const yy = y + 8 + lh * (i + 1) - 8;
      if (o.hi && o.hi(i)) el('rect', { x: x - 6, y: yy - 19, width: (o.w || 400) + 12, height: lh - 2, rx: 6, fill: o.hiCol || ACCBG, opacity: a });
      r.forEach((v, j) => { const st = ST[v]; mono(x + cols[j][1], yy, v, { 'font-size': 14, fill: st || INK, 'font-weight': st ? 700 : 400, opacity: a }); }); }); }

  // =========================================================
  // 1. helm install — 첫 Release
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    const T = [
      ['$ helm install web ./webapp -n prod \\', '    --dry-run --debug', ['렌더 결과만 출력한다', 'var(--term)']],
      ['$ helm install web ./webapp \\', '    --namespace prod --create-namespace \\', '    -f prod-values.yaml \\', '    --set image.tag=v1.0.0'],
      ['NAME: web', 'NAMESPACE: prod', 'STATUS: deployed', 'REVISION: 1'],
      ['NOTES:', '  Your webapp is now deployed.', '  Get URL: kubectl -n prod \\', '    port-forward svc/web-webapp 8080:80'],
      ['$ helm list -n prod', 'NAME  NAMESPACE  REVISION  STATUS', 'web   prod       1         deployed'],
      ['$ helm get manifest web -n prod', '$ helm get values web -n prod', 'USER-SUPPLIED VALUES:', 'image: {tag: v1.0.0} …'],
      ['$ kubectl get secret -n prod -l owner=helm', 'NAME                       TYPE', 'sh.helm.release.v1.web.v1  helm.sh/release.v1'],
      ['$ helm version', '# 클러스터 안에 helm 서버가 없다', '# kubeconfig 권한으로 API 서버에 직접']][k];
    term(16, 14, 356, 196, T, u, 0.1);
    // 오른쪽: 클러스터
    if (k === 0) { nsBox(0.6, '7 6'); tx(664, 210, 'Release 없음 · 클러스터 변화 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      ['Deployment', 'Service'].forEach((kd, i) => res(150 + i * 170, 300, kd, { s: pop(u, 0.8 + i * 0.3), dash: '5 4', col: MUT }));
      tx(235, 360, '미리 보기 (화면에만)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
      grow(320, 300, 470, 300, E(u, 1.4, 1.9), MUT, { dash: '5 4', plain: true }); cross(400, 300, 11, pop(u, 1.9)); return; }
    nsBox(k === 1 ? E(u, 0.2, 0.6) : 1);
    if (k === 1) chip(664, 46, '--create-namespace로 새로 만든다', INFO, pop(u, 0.4), { mono: false, color: INFO });
    ['Deployment', 'Service'].forEach((kd, i) => { const a = k === 1 ? E(u, 0.9 + i * 0.4, 1.7 + i * 0.4) : 1;
      res(lerp(200, 520 + i * 190, a), lerp(330, 100, a), kd, { s: a > 0 ? 1 : 0, op: a }); });
    if (k === 1) { chip(180, 260, '-f prod-values.yaml', ACC, pop(u, 0.6), { color: ACC }); chip(180, 300, '--set image.tag=v1.0.0', ACC, pop(u, 0.8), { color: ACC });
      sub(180, 340, '값을 합쳐 렌더한 뒤 보낸다', fade(u, 1.2), { 'font-size': 14, fill: INK }); return; }
    // release 기록
    const rs = k === 2 ? pop(u, 0.3) : 1;
    card(664, 210, 300, k === 5 ? 120 : 72, { rx: 14, stroke: ACC, sw: 2.5, fill: ACCBG, s: rs });
    if (k === 5) { mono(530, 175, 'Release web', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      [['manifest', 'Deployment·Service YAML'], ['values', 'prod-values + tag v1.0.0']].forEach(([a, b], i) => { const y = 204 + i * 30, op = fade(u, 0.5 + i * 0.5);
        mono(530, y, a, { 'font-size': 14, 'font-weight': 800, fill: INK, opacity: op }); tx(620, y, b, { 'font-size': 13.5, fill: INK, opacity: op }); }); }
    else { mono(530, 204, 'Release web', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: rs > 0.6 ? 1 : 0 }); mono(530, 228, 'chart webapp-0.1.0', { 'font-size': 13.5, fill: MUT, opacity: rs > 0.6 ? 1 : 0 });
      rev(760, 210, 1, null, null, { s: k === 2 ? pop(u, 0.8) : 1 }); chip(860, 210, 'deployed', GOOD, k === 2 ? pop(u, 1.3) : 1, { color: GOOD }); }
    if (k === 3) { card(180, 300, 330, 110, { rx: 14, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 0.4) }); tx(30, 270, 'templates/NOTES.txt 렌더 결과', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
      tx(30, 300, '사용자 화면에만 찍힌다', { 'font-size': 14.5, opacity: fade(u, 0.7) }); tx(30, 326, 'K8s 리소스가 아니다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(30, 352, '나중에 helm get notes로 다시 본다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) }); }
    if (k === 4) { el('rect', { x: 516, y: 176, width: 296, height: 68, rx: 14, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.8) });
      sub(180, 300, '현재 namespace만 본다', fade(u, 1.0), { 'font-size': 14.5, fill: INK }); chip(180, 340, 'helm list -A = 전체 namespace', INFO, pop(u, 1.5), { color: INFO }); }
    if (k === 5) sub(180, 300, 'values 스냅샷이 같이 남아 재현할 수 있다', fade(u, 1.5), { 'font-size': 14, fill: INK });
    if (k >= 6) { const a = k === 6 ? E(u, 0.6, 1.4) : 1; grow(664, 250, 664, 318, a, INFO); secret(664, 340, 1, { s: k === 6 ? pop(u, 1.2) : 1, hot: k === 6 });
      if (k === 6) { tx(664, 388, '이름 끝 v1 = revision 번호 · 라벨 owner=helm', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8) }); } }
    if (k === 7) { card(110, 300, 180, 70, { rx: 12, stroke: MUT, dash: '6 4', s: pop(u, 0.4) }); tx(110, 296, 'Helm 2 Tiller', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.5) });
      tx(110, 318, '클러스터 안 서버', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) }); cross(195, 272, 12, pop(u, 0.9));
      lock(270, 300, true, INFO, pop(u, 1.4)); tx(300, 296, 'K8s RBAC', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) }); tx(300, 318, '그대로 쓴다', { 'font-size': 13.5, opacity: fade(u, 1.5) });
      sub(190, 390, '기록은 Secret, 권한은 kubectl과 같다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }

  // =========================================================
  // 2. helm upgrade — revision 이 하나씩 쌓인다
  // =========================================================
  function line2(k, u, n) { el('line', { x1: 90, y1: 92, x2: lerp(90, 560, n), y2: 92, stroke: GRID, 'stroke-width': 3 }); }
  function s2(t, c) { const { k, u } = c, up = k >= 4, f = k === 4 ? E(u, 0.6, 1.4) : up ? 1 : 0;
    line2(k, u, up ? 1 : 0.5);
    rev(120, 92, 1, f > 0.5 ? 'superseded' : 'deployed', 'image v1.0.0');
    if (up) rev(380, 92, 2, 'deployed', 'image v1.1.0', { s: k === 4 ? pop(u, 0.3) : 1, tagCol: ACC, hot: k === 4 });
    else { card(380, 92, 56, 56, { rx: 28, stroke: GRID, dash: '5 4', fill: 'none' }); mono(380, 97, '?', { 'text-anchor': 'middle', 'font-size': 17, fill: MUT }); }
    const RX = 600;
    if (k === 0) { chip(760, 60, '--set image.tag=v1.1.0', ACC, pop(u, 0.3), { color: ACC }); grow(660, 72, 420, 92, E(u, 0.8, 1.5), ACC);
      sub(760, 110, '차트 경로를 다시 주고 값만 바꾼다', fade(u, 1.4), { 'font-size': 14, fill: INK }); }
    if (k === 1) { const rows = [['--reuse-values 있음', ['prod-values 값', 'tag v1.1.0'], GOOD], ['--reuse-values 없음', ['values.yaml 기본값', 'tag v1.1.0'], BAD]];
      rows.forEach(([h, bars, col], i) => { const y = 230 + i * 92, a = fade(u, 0.3 + i * 0.7); tx(40, y - 20, h, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: a });
        bars.forEach((b, j) => { const w = j ? 160 : 260, x = 40 + (j ? 272 : 0), s = E(u, 0.5 + i * 0.7 + j * 0.2, 1.0 + i * 0.7 + j * 0.2);
          el('rect', { x, y: y - 8, width: w * s, height: 34, rx: 8, fill: j ? ACCBG : i ? BADBG : GOODBG, stroke: j ? ACC : col, 'stroke-width': 1.8 }); if (s > 0.7) tx(x + 12, y + 14, b, { 'font-size': 14, 'font-weight': 700, fill: j ? ACC : INK }); }); });
      card(760, 280, 300, 80, { rx: 12, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 2.0) }); tx(760, 274, '-f로 줬던 설정이', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(760, 298, '통째로 사라지는 사고', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); }
    if (k === 2) { chip(200, 250, 'prod-values.yaml', MUT, 1, { color: MUT, op: 1 - E(u, 0.6, 1.2) }); chip(200, 250, 'prod-values-v2.yaml', ACC, pop(u, 1.0), { color: ACC });
      grow(310, 250, 470, 250, E(u, 1.2, 1.7), ACC); chip(620, 250, 'helm upgrade … -f', INFO, pop(u, 1.6), { color: INFO });
      sub(480, 330, '값이 많이 바뀌면 파일로 넘긴다. 바뀐 내용은 git diff로 남는다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); }
    if (k === 3) { const cx = 480, cy = 260; el('path', { d: `M${cx},${cy - 50} L${cx + 120},${cy} L${cx},${cy + 50} L${cx - 120},${cy} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.3) });
      tx(cx, cy + 5, 'release web 있나?', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4) });
      grow(cx - 120, cy, 180, cy, E(u, 0.9, 1.4), MUT); card(120, cy, 110, 44, { rx: 10, stroke: ACC, text: 'install', fs: 15, mono: true, color: ACC, s: pop(u, 1.3) }); tx(270, cy - 10, '없다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      grow(cx + 120, cy, 780, cy, E(u, 1.4, 1.9), MUT); card(840, cy, 120, 44, { rx: 10, stroke: ACC, text: 'upgrade', fs: 15, mono: true, color: ACC, s: pop(u, 1.8) }); tx(660, cy - 10, '있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      chip(480, 370, 'helm upgrade --install web ./webapp', INFO, pop(u, 2.1), { color: INFO }); }
    if (k === 4) { tx(120, 230, 'superseded = 대체됨 (지워지지 않는다)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) }); term(560, 230, 384, 110, ['Release "web" has been upgraded.', 'STATUS: deployed', 'REVISION: 2'], u, 0.8); }
    if (k === 5) { secret(180, 230, 1, { s: pop(u, 0.2), col: MUT }); secret(380, 280, 2, { s: pop(u, 0.5), hot: true }); sub(280, 340, 'revision 하나에 Secret 하나', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 5) term(560, 140, 384, 130, ['$ helm history web -n prod', 'REV  STATUS      DESCRIPTION', '1    superseded  Install complete', '2    deployed    Upgrade complete'], u, 0.6);
    if (k === 6) { [['--atomic', '실패하면 자동 rollback (revision이 하나 더 는다)', ACC], ['--wait', 'Pod가 ready 될 때까지 기다린다', INFO], ['--cleanup-on-fail', '실패 때 새로 만든 리소스를 지운다', WARN]].forEach(([a, b, col], i) => {
        const y = 310 + i * 34; chip(110, y, a, col, pop(u, 0.4 + i * 0.4), { color: col }); tx(220, y + 5, b, { 'font-size': 14, opacity: fade(u, 0.5 + i * 0.4) }); });
      card(760, 120, 300, 70, { rx: 12, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 0.3) }); tx(760, 116, '그냥 실패하면 STATUS failed', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
      tx(760, 140, '리소스가 반쯤 바뀐 채 남을 수 있다', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 0.5) }); }
    if (k === 7) { const n = 10, sh = E(u, 0.8, 1.8); tx(40, 240, 'revision 보관 한도 (기본 10개)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      for (let i = 0; i < n + 1; i++) { const x = 40 + (i - sh) * 62; if (x < 0 || x > 700) continue; const old = i === 0;
        card(x + 26, 296, 52, 44, { rx: 8, stroke: old && sh > 0.5 ? BAD : INFO, text: 'v' + (i + 1), fs: 15, mono: true, color: old && sh > 0.5 ? BAD : INFO, op: old ? 1 - E(u, 1.4, 2.0) : i === n ? sh : 1 }); }
      tx(40, 360, '11번째가 생기면 가장 오래된 v1 Secret이 지워진다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      chip(820, 296, 'HELM_MAX_HISTORY', MUT, pop(u, 0.6), { color: MUT }); }
    if (k === 8) { [['--atomic + --wait', '실패하면 자동으로 되돌아온다', ACC], ['--reuse-values', '이전 값 + 이번 값', GOOD], ['--reset-values', 'values.yaml 기본값 + 이번 값', WARN]].forEach(([a, b, col], i) => {
        const y = 250 + i * 50; chip(130, y, a, col, pop(u, 0.3 + i * 0.35), { color: col }); tx(260, y + 5, b, { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.35) }); });
      tx(600, 214, '과거 Secret이 남아 있어야 rollback 할 수 있다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); } }

  // =========================================================
  // 3. helm rollback — 되돌려도 번호는 늘어난다
  // =========================================================
  function s3(t, c) { const { k, u } = c, rb = k >= 1, f = k === 1 ? E(u, 0.4, 1.4) : rb ? 1 : 0;
    el('line', { x1: 90, y1: 92, x2: rb ? 720 : 420, y2: 92, stroke: GRID, 'stroke-width': 3 });
    rev(120, 92, 1, 'superseded', 'image v1.0.0', { hot: k === 0 });
    rev(380, 92, 2, f > 0.6 ? 'superseded' : 'deployed', 'image v1.1.0', { tagCol: BAD });
    if (!rb) { cross(412, 60, 9, pop(u, 0.6)); tx(470, 70, '문제 발생', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.7) }); }
    if (rb) { const a = k === 1 ? E(u, 0.3, 1.2) : 1; el('path', { d: `M120,58 C200,0 560,0 640,${lerp(58, 58, a)}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': `${a * 700} 700` });
      if (k === 1) dot([[120, 58], [380, 14], [640, 58]], seg(u, 0.3, 1.2), ACC, 7);
      tx(380, 24, '내용 복사', { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: a });
      rev(660, 92, 3, 'deployed', 'image v1.0.0', { s: k === 1 ? pop(u, 1.1) : 1, tagCol: GOOD, hot: k === 1 }); }
    if (k === 0) term(470, 180, 474, 150, ['$ helm history web -n prod', 'REV  STATUS      DESCRIPTION', '1    superseded  Install complete', '2    deployed    Upgrade complete'], u, 0.8);
    if (k === 1) { tx(660, 222, 'Rollback to 1', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      tx(380, 300, 'revision은 줄지 않는다. 되돌리기도 새 배포 하나다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) }); }
    if (k === 2) term(40, 200, 600, 172, ['$ helm history web -n prod', 'REV  STATUS      DESCRIPTION', '1    superseded  Install complete', '2    superseded  Upgrade complete', '3    deployed    Rollback to 1'], u, 0.3);
    if (k === 3) { const st = [['Secret v1 읽기', '매니페스트 + values'], ['현재와 비교', 'diff 계산'], ['K8s에 적용', 'image v1.1.0 → v1.0.0'], ['Secret v3 저장', '새 시각 + 설명']];
      st.forEach(([a, b], i) => { const x = 120 + i * 240, s = pop(u, 0.3 + i * 0.45); card(x, 300, 200, 74, { rx: 12, stroke: i === 2 ? ACC : INFO, sw: 2, s, fill: i === 2 ? ACCBG : PANEL });
        tx(x, 294, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.45) }); tx(x, 318, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.45), class: i === 2 ? 'mono' : null });
        if (i < 3) grow(x + 102, 300, x + 136, 300, E(u, 0.6 + i * 0.45, 0.9 + i * 0.45), ACC); }); }
    if (k === 4) { el('path', { d: 'M660,140 C640,230 420,230 395,150', fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.5) });
      chip(530, 250, 'helm rollback web 0', WARN, pop(u, 0.8), { color: WARN }); tx(530, 300, '0 = 바로 이전 revision (rev3이면 rev2)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      tx(530, 330, '어디로 가는지는 history로 확인한다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 5) { tx(60, 250, 'Pod ready', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); const n = 3, r = Math.floor(E(u, 0.4, 2.0) * n + 0.001);
      for (let i = 0; i < n; i++) card(200 + i * 56, 246, 44, 34, { rx: 8, stroke: i < r ? GOOD : GRID, fill: i < r ? GOODBG : PANEL, text: i < r ? '✓' : '…', fs: 15, color: i < r ? GOOD : MUT });
      tx(380, 252, '--wait: 모두 ready일 때 끝난다 (--timeout 5m까지)', { 'font-size': 14.5, opacity: fade(u, 0.6) });
      chip(190, 330, '--cleanup-on-fail', WARN, pop(u, 1.6), { color: WARN }); tx(300, 335, '실패하면 새로 만든 리소스를 정리', { 'font-size': 14.5, opacity: fade(u, 1.8) }); }
    if (k === 6) { chip(170, 250, 'helm upgrade --atomic', ACC, pop(u, 0.3), { color: ACC }); grow(290, 250, 380, 250, E(u, 0.7, 1.0), BAD); card(450, 250, 120, 44, { rx: 10, stroke: BAD, fill: BADBG, text: '실패', fs: 15, color: BAD, s: pop(u, 1.0) });
      grow(512, 250, 600, 250, E(u, 1.3, 1.6), ACC); card(700, 250, 180, 44, { rx: 10, stroke: GOOD, fill: GOODBG, text: '자동 rollback', fs: 15, color: GOOD, s: pop(u, 1.6) });
      tx(480, 330, '사람이 알아채기 전에 되돌아간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 7) { [['매니페스트', 'image v1.1.0 → v1.0.0', GOOD, 1], ['DB 스키마', '마이그레이션은 그대로', BAD, 0], ['PVC 데이터', '디스크 내용은 그대로', BAD, 0]].forEach(([a, b, col, ok], i) => {
        const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.45); card(x, 290, 270, 90, { rx: 12, stroke: col, sw: 2.2, s, fill: ok ? GOODBG : BADBG });
        tx(x, 282, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.45) }); tx(x, 308, b, { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.5 + i * 0.45) }); (ok ? check : cross)(x + 115, 258, 10, pop(u, 0.8 + i * 0.45)); }); }
    if (k === 8) { el('rect', { x: 0, y: 160, width: 960, height: 260, fill: PANEL });
      [['git commit', 'helm install / upgrade'], ['git log', 'helm history'], ['git revert', 'helm rollback'], ['git reset --hard', '(Helm에는 없다)']].forEach(([a, b], i) => {
        const y = 200 + i * 50, op = fade(u, 0.3 + i * 0.35); mono(300, y, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: op, fill: i === 3 ? MUT : INK });
        grow(320, y - 5, 400, y - 5, E(u, 0.4 + i * 0.35, 0.7 + i * 0.35), i === 3 ? MUT : ACC, { plain: true }); mono(420, y, b, { 'font-size': 16, 'font-weight': 800, opacity: op, fill: i === 3 ? MUT : ACC }); }); } }

  // =========================================================
  // 4. helm test · status — 일회용 Pod 로 확인한다
  // =========================================================
  function testPod(x, y, o) { o = o || {}; card(x, y, 200, 64, { rx: 12, stroke: o.col || WARN, sw: 2.2, fill: o.fill || WARNBG, s: o.s ?? 1, dash: o.dash, op: o.op });
    tx(x, y - 6, 'Pod (busybox)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: o.col || WARN, opacity: o.op ?? 1 }); mono(x, y + 16, 'web-webapp-test-connection', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: o.op ?? 1 }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { R.snippet(30, 60, ['apiVersion: v1', 'kind: Pod', 'metadata:', '  name: "{{ include "webapp.fullname" . }}-test-connection"'], { fs: 14.5, op: fade(u, 0.2) });
      tx(30, 40, 'templates/tests/test-connection.yaml', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono', opacity: fade(u, 0.2) });
      grow(480, 250, 600, 250, E(u, 0.9, 1.4), ACC); testPod(740, 250, { s: pop(u, 1.3) }); tx(740, 310, '한 번 돌고 끝나는 검사용 Pod', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); return; }
    if (k === 1) { R.snippet(30, 40, ['annotations:', '  "helm.sh/hook": test', '  "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded'], { fs: 14, op: fade(u, 0.2) });
      chip(130, 250, 'helm install', INFO, pop(u, 0.5), { color: INFO }); grow(210, 250, 560, 250, E(u, 0.7, 1.2), ACC); res(640, 250, 'Deployment', { s: pop(u, 1.1) }); res(800, 250, 'Service', { s: pop(u, 1.2) });
      testPod(400, 340, { dash: '5 4', col: MUT, fill: PANEL, op: fade(u, 1.4) }); cross(510, 316, 10, pop(u, 1.7)); tx(560, 345, 'install 때는 만들지 않는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { testPod(200, 200, {}); res(720, 200, 'Service', { col: INFO });
      grow(302, 200, 642, 200, E(u, 0.4, 1.0), ACC); for (let i = 0; i < 3; i++) dot([[302, 200], [642, 200]], ((u * 0.6 + i / 3) % 1) * (u > 1 ? 1 : 0), ACC, 6);
      mono(470, 186, 'wget web-webapp:80/healthz', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      tx(470, 290, '포트 80은 .Values.service.port에서 온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); chip(470, 340, 'restartPolicy: Never', MUT, pop(u, 1.9), { color: MUT }); return; }
    if (k === 3) { term(30, 30, 480, 160, ['$ helm test web -n prod', 'TEST SUITE:  web-webapp-test-connection', 'Phase:       Succeeded'], u, 0.2);
      [['exit 0', 'Phase: Succeeded', '통과', GOOD], ['exit ≠ 0', 'Phase: Failed', 'helm test 오류 종료', BAD]].forEach(([e, p, r, col], i) => { const x = 210 + i * 420, y = 300, s = pop(u, 0.9 + i * 0.5);
        card(x, y, 340, 86, { rx: 12, stroke: col, sw: 2.2, s }); mono(x - 150, y - 12, e, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.5) });
        mono(x - 40, y - 12, p, { 'font-size': 14, opacity: fade(u, 1.0 + i * 0.5) }); tx(x - 150, y + 20, r, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1 + i * 0.5) }); });
      tx(870, 120, 'release STATUS는', { 'text-anchor': 'end', 'font-size': 14, opacity: fade(u, 2.0) }); tx(870, 142, 'deployed 그대로', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { testPod(200, 160, { op: 1 - E(u, 0.8, 1.4) }); check(320, 140, 12, 1 - E(u, 0.8, 1.4));
      tx(200, 240, '성공 → hook-succeeded로 곧 삭제', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
      testPod(700, 160, { col: BAD, fill: BADBG }); tx(700, 240, '실패한 Pod는 남는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
      chip(480, 320, 'helm test web -n prod --logs', INFO, pop(u, 1.6), { color: INFO }); tx(480, 366, '로그를 결과와 함께 바로 찍는다', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { const L = ['info:', '  status: deployed', '  first_deployed: 2026-05-11T10:00:00Z', '  last_deployed:  2026-05-11T11:30:00Z', '  notes: Your webapp is now deployed.', 'chart:', '  metadata: {name: webapp, version: 0.1.0}'];
      R.snippet(30, 30, L.slice(0, Math.max(1, Math.round(L.length * E(u, 0.2, 1.4)))), { fs: 14.5, w: 560 });
      tx(30, 300, '$ helm status web -n prod -o yaml', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, class: 'mono', opacity: fade(u, 0.2) });
      chip(780, 140, '-o yaml', ACC, pop(u, 1.2), { color: ACC }); chip(780, 190, '-o json', ACC, pop(u, 1.4), { color: ACC }); tx(780, 240, '스크립트가 그대로 읽는다', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1.8) }); return; }
    if (k === 6) { term(30, 30, 620, 150, ['$ helm status web -n prod --show-resources', '==> v1/Deployment', 'NAME         READY   UP-TO-DATE   AVAILABLE', 'web-webapp   3/3     3            3'], u, 0.2);
      for (let i = 0; i < 3; i++) card(250 + i * 70, 280, 56, 56, { rx: 10, stroke: GOOD, fill: GOODBG, text: 'Pod', fs: 14, color: GOOD, s: pop(u, 1.2 + i * 0.2) });
      tx(560, 286, 'deployed = 적용됐다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(560, 312, '정상 동작은 ready 수와 test로 본다', { 'font-size': 14.5, opacity: fade(u, 1.9) }); return; }
    if (k === 7) { const cmds = [['helm list -A', '모든 namespace'], ['helm list --failed', '실패한 release'], ['helm list --pending', '진행 중인 작업'], ['helm get manifest web', '적용된 YAML'], ['helm get values web', '적용된 값'], ['helm get notes web', 'NOTES 다시'], ['helm history web', 'revision 목록'], ['helm test web --logs', '검사 + 로그']];
      cmds.forEach(([a, b], i) => { const x = 40 + (i % 2) * 460, y = 60 + Math.floor(i / 2) * 82, s = pop(u, 0.2 + i * 0.2); card(x + 210, y + 16, 420, 62, { rx: 12, stroke: i === 1 ? BAD : GRID, sw: i === 1 ? 2.4 : 1.6, s });
        mono(x + 18, y + 12, a, { 'font-size': 15, 'font-weight': 800, fill: i === 1 ? BAD : INK, opacity: fade(u, 0.3 + i * 0.2) }); tx(x + 18, y + 36, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.2) }); }); return; }
    // k8 CI 흐름
    [['helm upgrade --install', '--atomic --wait'], ['helm test web', '--logs'], ['deployed + test passed', '']].forEach(([a, b], i) => { const x = 160 + i * 320, s = pop(u, 0.3 + i * 0.6);
      card(x, 210, 270, 90, { rx: 14, stroke: i === 2 ? GOOD : ACC, sw: 2.5, fill: i === 2 ? GOODBG : PANEL, s }); mono(x, b ? 204 : 215, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: i === 2 ? GOOD : ACC, opacity: fade(u, 0.4 + i * 0.6) });
      if (b) mono(x, 228, b, { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.4 + i * 0.6) }); if (i < 2) grow(x + 138, 210, x + 180, 210, E(u, 0.7 + i * 0.6, 1.0 + i * 0.6), ACC); });
    tx(480, 320, 'CI의 배포 뒤 검사 단계', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); }

  // =========================================================
  // 5. helm uninstall — 무엇이 지워지고 무엇이 남나
  // =========================================================
  function world(o) { o = o || {}; nsBox(1);
    ['Deployment', 'Service'].forEach((kd, i) => res(520 + i * 190, 90, kd, { op: o.res ?? 1, s: (o.res ?? 1) > 0.02 ? 1 : 0 }));
    [1, 2, 3].forEach((n, i) => secret(664, 210 + i * 46, n, { op: o.sec ?? 1, col: o.secCol, hot: n === 3 && o.hot3 })); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { world(); chip(180, 80, '$ helm uninstall web -n prod', INFO, pop(u, 0.2), { color: INFO });
      card(180, 210, 230, 80, { rx: 12, stroke: WARN, sw: 2.2, fill: WARNBG, s: pop(u, 0.8) }); tx(180, 204, 'pre-delete hook', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9) });
      tx(180, 228, 'Job (DB 백업 등)', { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.9) }); const sp = u * 3; el('circle', { cx: 180 + Math.cos(sp) * 30, cy: 280 + Math.sin(sp) * 8, r: 5, fill: WARN, opacity: fade(u, 1.0) });
      sub(180, 330, '리소스를 지우기 전에 먼저 돈다', fade(u, 1.5), { 'font-size': 14, fill: INK }); return; }
    if (k === 1) { const g = 1 - E(u, 0.3, 1.4); world({ res: g, sec: 1 - E(u, 1.0, 1.9) });
      term(16, 30, 356, 200, ['$ helm list -n prod', '(없음)', '$ kubectl get all -n prod', 'No resources found.'], u, 1.2);
      tx(190, 290, 'history도 같이 지워져', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); tx(190, 314, 'rollback 할 수 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { world({ res: 1 - E(u, 0.3, 1.2), hot3: true }); term(16, 30, 356, 172, ['$ helm uninstall web --keep-history', '$ helm history web -n prod', 'REV  STATUS', '1    superseded', '2    superseded', '3    uninstalled'], u, 0.4);
      tx(664, 380, 'Secret은 남고 rev3는 uninstalled', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { world({ res: E(u, 0.8, 1.6) }); chip(190, 90, '$ helm rollback web 1 -n prod', INFO, pop(u, 0.2), { color: INFO });
      grow(330, 90, 440, 90, E(u, 0.5, 0.9), ACC); tx(190, 200, '남겨 둔 기록으로', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.2) }); tx(190, 224, '리소스가 다시 생긴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); return; }
    if (k === 4) { world({ res: 1 - E(u, 1.6, 2.4) }); chip(180, 70, '--dry-run', ACC, pop(u, 0.2), { color: ACC }); tx(60, 112, '지울 목록만 보여 준다', { 'font-size': 14.5, opacity: fade(u, 0.4) });
      el('rect', { x: 434, y: 56, width: 460, height: 70, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 0.6) * (1 - E(u, 1.4, 1.6)) });
      chip(180, 220, '--wait --timeout 5m', INFO, pop(u, 1.2), { color: INFO }); tx(40, 262, '리소스가 실제로 사라질 때까지', { 'font-size': 14.5, opacity: fade(u, 1.4) }); tx(40, 286, '명령이 기다린다', { 'font-size': 14.5, opacity: fade(u, 1.4) }); return; }
    if (k === 5) { [['pre-delete hook', 'DB 백업', WARN], ['리소스 삭제', 'kind 순서대로', BAD], ['post-delete hook', '알림 등', WARN], ['Release Secret 삭제', '--keep-history 없을 때', INFO]].forEach(([a, b, col], i) => {
        const x = 130 + i * 233, s = pop(u, 0.3 + i * 0.45); card(x, 210, 200, 90, { rx: 12, stroke: col, sw: 2.2, s }); mono(x - 82, 190, String(i + 1), { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.45) });
        tx(x, 214, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.45) }); tx(x, 238, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.45) });
        if (i < 3) grow(x + 102, 210, x + 132, 210, E(u, 0.6 + i * 0.45, 0.9 + i * 0.45), ACC); });
      tx(480, 330, '백업은 리소스가 사라지기 전, pre-delete에 둔다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { nsBox(1); ['Deployment', 'Service'].forEach((kd, i) => res(520 + i * 190, 90, kd, { op: 1 - E(u, 0.2, 0.8), s: 1 }));
      [['PersistentVolumeClaim', 'DB 데이터', 0.8], ['CustomResourceDefinition', 'CRD', 1.2], ['Namespace prod', '차트가 만든 게 아니면', 1.6]].forEach(([a, b, d], i) => {
        const y = 190 + i * 70; card(664, y, 380, 56, { rx: 10, stroke: WARN, sw: 2.2, fill: WARNBG, s: pop(u, d) }); mono(500, y - 2, a, { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, d) }); tx(500, y + 19, b, { 'font-size': 13.5, opacity: fade(u, d) }); });
      tx(190, 220, 'uninstall 뒤에도', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.8) }); tx(190, 246, '남아 있는 것들', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
      tx(190, 290, '디스크 요금이 계속 나오면 PVC', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 7) { world({ secCol: WARN }); chip(664, 380, 'status: pending-upgrade로 멈춤', WARN, pop(u, 0.2), { color: WARN });
      chip(190, 80, 'helm uninstall --no-hooks', INFO, pop(u, 0.6), { color: INFO }); chip(190, 140, 'kubectl delete secret', BAD, pop(u, 1.2), { color: BAD });
      mono(190, 170, '-l owner=helm,name=web', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.3) });
      grow(300, 150, 500, 240, E(u, 1.5, 2.0), BAD); tx(190, 250, 'Secret이 사라지면', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 2.0) }); tx(190, 274, 'helm은 release를 잊는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k8 한 바퀴
    const L = [['install', 'rev1 deployed'], ['upgrade', 'rev2 · rev1 superseded'], ['rollback', 'rev3 · rev2 superseded'], ['test', 'status 확인'], ['uninstall', '제거 또는 --keep-history']];
    el('line', { x1: 90, y1: 200, x2: lerp(90, 870, E(u, 0.2, 2.0)), y2: 200, stroke: GRID, 'stroke-width': 3 });
    L.forEach(([a, b], i) => { const x = 100 + i * 190, s = pop(u, 0.3 + i * 0.35); card(x, 200, 140, 46, { rx: 23, stroke: i === 4 ? WARN : ACC, sw: 2.2, fill: PANEL, text: a, fs: 15, mono: true, color: i === 4 ? WARN : ACC, s });
      tx(x, 250, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.35) }); }); }

  const quiz = [
    { q: 'helm install로 release web을 처음 만들었다. 이 revision의 기록은 어디에 저장되는가?',
      o: ['helm이 로컬 PC에 두는 데이터베이스', 'namespace prod의 Secret sh.helm.release.v1.web.v1', '클러스터 안의 Tiller 서버'], a: 1,
      why: 'Helm 3은 별도 서버나 DB 없이 release 기록을 클러스터의 Secret으로 남긴다. 이름 끝 v1이 revision 번호다.' },
    { q: 'prod-values.yaml로 설치한 release에 helm upgrade --set image.tag=v1.1.0 만 주면 어떻게 되는가?',
      o: ['prod-values.yaml 값이 빠지고 values.yaml 기본값에 이번 --set만 얹힌다', '이전 값을 모두 유지하고 tag만 바뀐다', 'upgrade가 거부된다'], a: 0,
      why: '값을 하나라도 새로 주면 이전에 준 값은 이어받지 않는다. 이어받으려면 --reuse-values를 붙인다.' },
    { q: 'rev2에서 helm rollback web 1을 실행했다. 그 뒤 history의 맨 아래 줄은 무엇인가?',
      o: ['rev 1 deployed', 'rev 2 deployed', 'rev 3 deployed, Rollback to 1'], a: 2,
      why: 'rollback은 rev1의 내용을 복사해 새 revision 3을 만든다. revision 번호는 줄지 않고 늘기만 한다.' },
    { q: 'helm test에서 테스트 Pod가 0이 아닌 코드로 끝났다. 무엇이 바뀌는가?',
      o: ['release STATUS가 failed가 된다', '테스트 Phase가 Failed로 남고 helm test가 오류로 끝난다', 'release가 직전 revision으로 돌아간다'], a: 1,
      why: '판정은 Pod의 종료 코드로 한다. 테스트가 실패해도 release STATUS는 deployed 그대로다.' },
    { q: 'helm uninstall web --keep-history 뒤에 남는 것은 무엇인가?',
      o: ['Deployment와 Service', 'release Secret과 revision 이력', '아무것도 남지 않는다'], a: 1,
      why: '--keep-history는 리소스만 지우고 Secret 이력은 uninstalled 상태로 둔다. 그래서 helm rollback으로 되살릴 수 있다.' },
  ];

  const summary = [
    'helm install은 렌더한 매니페스트를 적용하고 그 기록을 revision 1로 Secret에 남긴다.',
    'upgrade마다 revision이 하나 늘고 앞 revision은 superseded로 남는다.',
    'rollback도 과거 내용을 복사한 새 revision이라 번호는 줄지 않는다.',
    'uninstall은 기본으로 이력까지 지우고, --keep-history를 붙이면 되살릴 수 있다.',
  ];
  const review = [
    { q: 'CI에서 helm upgrade --set image.tag=v2를 돌렸더니 prod 설정이 기본값으로 돌아갔다. 먼저 의심할 것은?',
      o: ['--atomic을 빼서', '--reuse-values 없이 값을 줘서 이전 -f 값이 빠진 것', 'Secret 보관 한도 10개를 넘어서'], a: 1,
      why: '값을 새로 주면 이전 release의 값을 이어받지 않는다. --reuse-values를 붙이거나 -f 파일을 함께 넘겨야 한다.' },
    { q: '새 버전을 배포한 뒤 장애가 났다. helm rollback web 0을 실행했다. 무슨 일이 일어나는가?',
      o: ['바로 이전 revision의 매니페스트가 새 revision으로 다시 적용된다', 'revision 0으로 돌아가 release가 사라진다', '현재 revision Secret이 지워진다'], a: 0,
      why: '0은 바로 이전 revision을 뜻한다. 되돌린 결과도 새 revision으로 history에 쌓인다.' },
    { q: 'DB 차트를 uninstall 했는데 디스크 요금이 계속 나온다. 먼저 확인할 것은?',
      o: ['release Secret이 남았는지', 'NOTES.txt가 남았는지', 'PersistentVolumeClaim이 남았는지'], a: 2,
      why: 'StatefulSet이 만든 PVC는 uninstall 대상이 아니다. 디스크를 쓰는 PVC와 PV는 따로 정리해야 한다.' },
  ];

  R.page({ title: 'Release 생명주기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
