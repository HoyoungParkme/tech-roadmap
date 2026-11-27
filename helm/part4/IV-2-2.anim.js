/* IV-2-2 helm test — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 테스트 Pod 이름·주소(my-web-test-connection, my-web:8080)는 페이지 템플릿을 python 으로 렌더해 확인했다.
 * 터미널 출력은 페이지 코드의 예시 출력(helm.sh Chart Tests 문서의 모양)이고, 클러스터에서 돌린 결과가 아니다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, terminal, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  const SC = { Running: INFO, Succeeded: GOOD, Completed: MUT, Failed: BAD, Pending: MUT };
  function pod(cx, cy, name, status, o) { o = o || {}; const w = o.w || 250, h = 58, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || (status === 'Failed' ? BAD : INK);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    tx(-w / 2 + 12, -h / 2 + 19, o.kind || 'Pod', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }, g);
    mono(-w / 2 + 12, -h / 2 + 42, name, { 'font-size': 14, 'font-weight': 700, fill: col }, g);
    if (status) { const sc = SC[status] || MUT, pw = tw(status, 13.5) + 18; el('rect', { x: w / 2 - pw - 8, y: -h / 2 + 6, width: pw, height: 22, rx: 11, fill: PANEL, stroke: sc, 'stroke-width': 1.6 }, g);
      tx(w / 2 - pw / 2 - 8, -h / 2 + 22, status, { 'font-size': 13.5, 'font-weight': 700, fill: sc, 'text-anchor': 'middle' }, g); }
    return g; }
  function svc(cx, cy, o) { o = o || {}; card(cx, cy, 150, 50, { rx: 25, stroke: o.down ? BAD : INFO, fill: o.down ? BADBG : INFOBG, text: 'Service\nmy-web:8080', fs: 13.5, mono: true, color: o.down ? BAD : INFO, s: o.s, op: o.op, dash: o.down ? '5 4' : null }); }
  const T = (s, col) => [s, col];
  const GR = '#86efac', RD = '#fca5a5';

  // ---------- 1. 설치 성공 ≠ 서비스 정상 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 50, 560, 190, ['$ helm install my-web ./my-web', 'NAME: my-web', T('STATUS: deployed', GR)], lerp(0, 3, E(u, 0.2, 1.6)), { title: 'bash', lh: 34, fs: 15.5 });
      pill(760, 110, '설치 성공', GOOD, pop(u, 1.8), { fs: 16 }); note(660, 200, '여기까지는 매니페스트가', fade(u, 2.1)); note(660, 226, '적용됐다는 뜻뿐이다', fade(u, 2.1)); return; }
    if (k === 1) { zone(30, 30, 900, 300, 'namespace · my-web', { fill: SOFT });
      pod(220, 130, 'my-web-7c9d8f6b5-abcde', 'Running', { w: 300 }); sub(220, 186, 'READY 1/1', 1, { class: 'mono', fill: GOOD, 'font-weight': 700 });
      svc(560, 130, {}); grow(485, 130, 372, 130, E(u, 0.4, 0.9), MUT, { dash: '5 4' });
      R.person(810, 140, '사용자', {}); grow(780, 130, 640, 130, E(u, 0.8, 1.3), MUT);
      lbl(710, 110, '?', fade(u, 1.3), { 'font-size': 30, fill: WARN });
      note(80, 260, 'Running = 컨테이너가 떠 있다', fade(u, 1.6)); note(80, 290, '응답 200을 주는지는 아무도 확인하지 않았다', fade(u, 2.0), { fill: WARN }); return; }
    // k2~4: 차트 구조와 tests/
    const TREE = [[0, 'my-web/', 1], [1, 'Chart.yaml'], [1, 'values.yaml'], [1, 'templates/', 1], [2, 'deployment.yaml'], [2, 'service.yaml'], [2, 'tests/', 1, 3], [3, 'test-connection.yaml', 0, 3]];
    TREE.forEach(([d, nm, dir, at], i) => { const vis = at && at > k ? 0 : at === k ? pop(u, 0.3 + (d - 2) * 0.4) : k === 2 ? fade(u, 0.2 + i * 0.2) : 1; if (vis <= 0.02) return;
      const x = 60 + d * 30, y = 60 + i * 40, hot = at === 3, col = hot ? ACC : INK, g = R.G(x, y, 1, Math.min(1, vis));
      if (dir) el('path', { d: 'M-10,-9 h7 l3,3 h10 v15 h-20 Z', fill: hot ? ACCBG : SOFT, stroke: col, 'stroke-width': 1.8 }, g);
      else el('path', { d: 'M-8,-11 h11 l5,5 v17 h-16 Z', fill: PANEL, stroke: col, 'stroke-width': 1.8 }, g);
      mono(16, 5, nm, { 'font-size': 15, 'font-weight': hot ? 800 : 600, fill: col }, g); });
    if (k === 2) { note(420, 150, '매니페스트 템플릿은 templates/ 아래', fade(u, 1.6)); return; }
    if (k === 3) { note(420, 280, '테스트 매니페스트의 자리', fade(u, 1.2), { fill: ACC }); sub(560, 310, 'helm test 때만 뜨는 Pod 정의를 둔다', fade(u, 1.6), { 'font-size': 14 }); return; }
    // k4: helm test
    zone(430, 40, 500, 240, 'helm test my-web', { fill: SOFT });
    pod(560, 120, 'my-web-test-connection', u > 1.9 ? 'Succeeded' : 'Running', { w: 220, s: pop(u, 0.2), col: GOOD });
    svc(820, 120, { s: pop(u, 0.4) });
    dot([[670, 110], [745, 110]], seg(u, 0.7, 1.2), GOOD, 6); dot([[745, 132], [670, 132]], seg(u, 1.3, 1.8), INFO, 6);
    if (u > 1.8) pill(708, 168, '200', GOOD, pop(u, 1.8), { mono: true });
    mono(680, 240, 'Phase: Succeeded', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) });
    sub(680, 330, '배포 직후 연결을 확인하는 스모크 테스트', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 600 }); }

  // ---------- 2. 테스트 Pod 정의 ----------
  const FIELDS = [['kind', 'Pod'], ['name', 'my-web-test-connection'], ['hook', '"helm.sh/hook": test'], ['restart', 'restartPolicy: Never'], ['image', 'wget · busybox:1.36'], ['args', '--spider --timeout=5 my-web:8080'], ['판정', 'exit code']];
  function spec(k, u) { el('rect', { x: 30, y: 30, width: 440, height: 40 + FIELDS.length * 46, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(46, 56, 'templates/tests/test-connection.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const upto = [1, 2, 3, 4, 5, 6][k];
    FIELDS.forEach(([a, b], i) => { const y = 92 + i * 46, now = i === upto || (k === 0 && i <= 1), on = i <= upto;
      el('rect', { x: 42, y: y - 20, width: 416, height: 38, rx: 6, fill: now ? ACCBG : on ? SOFT : PANEL, stroke: on ? 'none' : GRID, 'stroke-dasharray': '4 4', 'stroke-width': 1.2 });
      tx(56, y + 5, a, { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      if (on) mono(140, y + 5, b, { 'font-size': 14.5, 'font-weight': 700, fill: now ? ACC : INK, opacity: now ? fade(u, 0.3 + (k === 0 ? i * 0.3 : 0)) : 1 }); }); }
  function s2(t, c) { const { k, u } = c; spec(k, u);
    if (k === 0) { mono(510, 120, '"{{ .Release.Name }}-test-connection"', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
      grow(700, 136, 700, 176, E(u, 1.0, 1.4), ACC); mono(700, 206, 'my-web-test-connection', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      note(510, 270, '릴리스 이름을 붙여 다른 릴리스와 겹치지 않게', fade(u, 1.9)); return; }
    if (k === 1) { [['helm install', false], ['helm test', true]].forEach(([cmd, ok], i) => { const y = 110 + i * 110;
        mono(510, y, cmd, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.5) });
        pod(780, y, 'test-connection', ok ? 'Running' : null, { w: 220, dash: ok ? null : '5 4', op: ok ? pop(u, 1.2) : 0.5 * fade(u, 0.5), col: ok ? GOOD : OFF });
        if (!ok) cross(780, y, 14, pop(u, 0.9)); else check(905, y, 9, pop(u, 1.5)); });
      note(510, 330, 'annotation이 붙으면 helm test 때만 생성된다', fade(u, 1.8)); return; }
    if (k === 2) { const ax = R.axes(520, 90, 380, 140, { x: [0, 3], y: [0, 1], xl: '시간' });
      el('rect', { x: ax.X(0), y: 120, width: (ax.X(1) - ax.X(0)) * E(u, 0.3, 1.0), height: 30, rx: 5, fill: ACC, opacity: 0.85 });
      mono(ax.X(1) + 10, 142, 'exit code', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1) });
      el('rect', { x: ax.X(1.6), y: 180, width: 120, height: 30, rx: 5, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.4) });
      cross(ax.X(1.6) + 60, 195, 9, pop(u, 1.6)); sub(ax.X(1.6) + 60, 226, '재시작 없음', fade(u, 1.6), { 'font-size': 14 });
      note(520, 300, '첫 실행의 결과가 곧 테스트 결과', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 3) { card(700, 150, 280, 150, { rx: 12, stroke: INK, sw: 2.2, s: pop(u, 0.3) });
      mono(580, 104, 'container: wget', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.5) }); mono(580, 132, 'image: busybox:1.36', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7) });
      ['wget', 'nc', 'sh'].forEach((tl, i) => pill(610 + i * 70, 190, tl, MUT, pop(u, 1.0 + i * 0.2), { mono: true, fs: 13.5 }));
      note(560, 280, '테스트 도구가 든 가벼운 이미지면 된다', fade(u, 1.8)); return; }
    if (k === 4) { [['--spider', '헤더만 확인, 내려받지 않는다'], ['--timeout=5', '5초 넘으면 실패'], ['my-web:8080', 'fullname 조각 + .Values.service.port']].forEach(([a, b], i) => { const y = 100 + i * 70, op = fade(u, 0.3 + i * 0.5);
        mono(510, y, a, { 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: op }); tx(510, y + 24, b, { 'font-size': 14, fill: MUT, opacity: op }); });
      clock(860, 170, 34, E(u, 1.0, 2.4), WARN, '5s'); note(510, 340, '타임아웃이 없으면 테스트가 끝없이 매달린다', fade(u, 2.2), { fill: WARN }); return; }
    // k5: exit code 판정
    [['200 응답', 'exit 0', 'Succeeded', GOOD], ['연결 실패 · 타임아웃', 'exit 1', 'Failed', BAD]].forEach(([a, b, ph, col], i) => { const y = 120 + i * 120, at = 0.3 + i * 0.7;
      tx(510, y, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, at) }); grow(510, y + 20, 640, y + 20, E(u, at + 0.2, at + 0.6), col);
      mono(680, y + 26, b, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, at + 0.5) }); pill(840, y + 20, ph, col, pop(u, at + 0.7), { mono: true }); }); }

  // ---------- 3. helm test 실행 ----------
  const OK_LINES = ['$ helm test my-web --logs', 'NAME: my-web', 'STATUS: deployed', 'TEST SUITE:     my-web-test-connection', 'Last Started:   Mon Aug 11 10:05:00 2026', 'Last Completed: Mon Aug 11 10:05:04 2026', T('Phase:          Succeeded', GR), 'POD LOGS: my-web-test-connection', 'Connecting to my-web:8080 (10.96.12.34:8080)', 'remote file exists'];
  const NG_LINES = ['$ helm test my-web --logs', T('Phase:          Failed', RD), 'POD LOGS: my-web-test-connection', T('wget: download timed out', RD), T('Error: pod my-web-test-connection failed', RD)];
  function s3(t, c) { const { k, u } = c;
    const fail = k === 3 || k === 4;
    if (k <= 2) terminal(30, 30, 590, 360, OK_LINES, k === 0 ? lerp(0, 1, E(u, 0.2, 1.0)) : k === 1 ? 1 + lerp(0, 6, E(u, 0.2, 1.8)) : 7 + lerp(0, 3, E(u, 0.2, 1.4)), { title: 'helm test (예시 출력)', lh: 31, fs: 13.5 });
    else if (fail) terminal(30, 30, 590, 360, NG_LINES, k === 3 ? lerp(0, 2, E(u, 0.2, 1.0)) + (u > 1.6 ? 3 : 0) : 5, { title: 'helm test (예시 출력)', lh: 40, fs: 14 });
    else terminal(30, 30, 590, 200, ['$ kubectl get pod my-web-test-connection', 'NAME                       READY   STATUS', 'my-web-test-connection     0/1     Completed'], lerp(0, 3, E(u, 0.2, 1.5)), { title: 'bash', lh: 36, fs: 13.5 });
    // 오른쪽: 클러스터
    zone(640, 30, 300, 360, '클러스터', { fill: SOFT });
    const st = k === 0 ? 'Running' : k <= 2 ? 'Succeeded' : fail ? (k === 3 && u < 1.0 ? 'Running' : 'Failed') : 'Completed';
    pod(790, 110, 'my-web-test-connection', null, { w: 270, s: k === 0 ? pop(u, 0.4) : 1, col: fail ? BAD : k === 5 ? MUT : GOOD });
    pill(790, 160, st, SC[st], 1, { fs: 14 });
    svc(790, 240, { down: fail });
    if (k <= 2) { dot([[790, 140], [790, 215]], k === 0 ? seg(u, 1.0, 1.8) : (t * 0.6) % 1, GOOD, 6); }
    if (fail) { cross(890, 240, 12, 1); }
    if (k === 2) note(660, 330, 'Pod의 stdout이 그대로', fade(u, 1.4)), note(660, 356, '나온다 (--logs)', fade(u, 1.4));
    if (k === 4) { clock(700, 330, 26, E(u, 0.2, 1.2), BAD, null); [['Service 이름', 0.8], ['포트', 1.1], ['셀렉터', 1.4]].forEach(([s, at], i) => tx(740, 312 + i * 24, '· ' + s, { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, at) })); }
    if (k === 5) { note(660, 330, '끝나도 Completed로', fade(u, 1.6)); note(660, 356, '클러스터에 남는다', fade(u, 1.8), { fill: WARN }); } }

  // ---------- 4. 테스트 Pod 정리 ----------
  // 실행 줄: helm test 를 세 번 돌릴 때 남는 Pod
  function runs(y, policy, u, label) { tx(40, y - 34, label, { 'font-size': 15, 'font-weight': 700, fill: policy ? ACC : MUT });
    el('line', { x1: 40, y1: y, x2: 920, y2: y, stroke: GRID, 'stroke-width': 3 });
    for (let r = 0; r < 3; r++) { const x = 120 + r * 280, at = 0.3 + r * 0.6, on = u > at;
      el('circle', { cx: x, cy: y, r: 8, fill: on ? INK : PANEL, stroke: INK, 'stroke-width': 2 }); mono(x, y + 26, `helm test #${r + 1}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      // 남은 Pod: 다음 실행 직전까지 (정책 없음) / 성공 즉시 삭제 (hook-succeeded)
      const end = policy ? at + 0.25 : (r < 2 ? 0.3 + (r + 1) * 0.6 : 9), live = u > at && u < end, w = policy ? 30 : 280 * (Math.min(u, end) - at) / 0.6;
      if (u > at) el('rect', { x, y: y - 26, width: Math.max(4, Math.min(policy ? 30 : 270, w)), height: 16, rx: 4, fill: policy ? ACC : WARN, opacity: live ? 0.85 : 0.25 }); }
    const left = policy ? 0 : u > 0.3 ? 1 : 0;
    mono(920, y - 34, `남은 Pod ${left}개`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: policy ? GOOD : WARN, opacity: fade(u, 1.8) }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { runs(140, false, u, '정책 없음 = before-hook-creation (기본)');
      note(40, 240, '다음 helm test 직전에 이전 Pod를 지우니 이름 충돌은 없다', fade(u, 2.0)); note(40, 270, '그 사이에는 Completed Pod 하나가 남아 있다', fade(u, 2.3), { fill: WARN }); return; }
    if (k === 1) { runs(110, false, 3, '정책 없음'); runs(270, true, u, 'before-hook-creation,hook-succeeded');
      R.spans(40, 370, [['"helm.sh/hook-delete-policy": ', { fill: MUT }], ['before-hook-creation,hook-succeeded', { fill: ACC, 'font-weight': 700 }]], { 'font-size': 14.5, opacity: fade(u, 0.2) }); return; }
    if (k === 2) { const f = E(u, 0.4, 1.4);
      card(260, 160, 340, 130, { rx: 12, stroke: f > 0.5 ? ACC : INK, sw: 2.2 }); mono(110, 120, 'container', { 'font-size': 14, fill: MUT });
      mono(110, 156, f > 0.5 ? 'name: curl' : 'name: wget', { 'font-size': 16, 'font-weight': 800, opacity: Math.abs(f - 0.5) * 2 });
      mono(110, 186, f > 0.5 ? 'image: curlimages/curl:8.9.1' : 'image: busybox:1.36', { 'font-size': 14.5, fill: ACC, opacity: Math.abs(f - 0.5) * 2 });
      mono(110, 216, 'restartPolicy: Never', { 'font-size': 14, fill: MUT });
      note(500, 140, '검사를 여러 개 하려면 curl이 편하다', fade(u, 1.6)); note(500, 170, '훅 annotation은 그대로 둔다', fade(u, 1.9), { fill: MUT }); return; }
    const CHK = [['curl -fsS http://my-web:8080/healthz', 'health'], ['nc -z my-web-postgresql 5432', 'db port']];
    if (k <= 4) mono(40, 60, "command: ['sh', '-c']", { 'font-size': 15, 'font-weight': 700 }); if (k <= 4) mono(40, 90, 'set -e', { 'font-size': 16, 'font-weight': 800, fill: k === 3 ? BAD : INK });
    if (k === 3) { CHK.forEach(([s], i) => { const y = 150 + i * 60; mono(70, y, s, { 'font-size': 14.5, opacity: i === 1 ? 0.35 : fade(u, 0.4) }); });
      cross(50, 145, 9, pop(u, 0.9)); mono(560, 150, 'exit 22', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      el('path', { d: 'M520,160 C540,190 540,230 520,250', fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.3) });
      tx(560, 214, '실패하는 순간 멈춘다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); sub(250, 240, '두 번째 검사는 돌지 않는다', fade(u, 1.6), { 'font-size': 14 });
      note(40, 330, 'set -e가 없으면 마지막 명령의 결과만 남는다', fade(u, 2.1), { fill: WARN }); return; }
    if (k === 4) { svc(820, 150, {}); dbIcon(820, 280, 'postgresql', {});
      CHK.forEach(([s, nm], i) => { const y = 150 + i * 130, at = 0.3 + i * 0.8; mono(40, y, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, at) });
        dot([[460, y - 5], [720, y - 5]], seg(u, at + 0.2, at + 0.7), ACC, 6); check(470, y + 30, 9, pop(u, at + 0.7)); tx(490, y + 35, i ? '포트 열림' : '200 · -f라 4xx·5xx면 실패', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, at + 0.7) }); });
      mono(40, 400, 'exit 0 → Succeeded', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    // k5: 세 정책
    const P = [['before-hook-creation', '다음 helm test 직전', ACC], ['hook-succeeded', '성공하면 바로', GOOD], ['hook-failed', '실패하면 바로', BAD]];
    P.forEach(([nm, when, col], i) => { const y = 90 + i * 100, s = pop(u, 0.3 + i * 0.4);
      card(470, y, 860, 76, { rx: 12, stroke: col, sw: 2, s }); mono(60, y - 6, nm, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s > 0.5 ? 1 : 0 });
      tx(60, y + 22, when + ' 지운다', { 'font-size': 14.5, opacity: s > 0.5 ? 1 : 0 }); });
    tx(880, 290, '보통 이것은 뺀다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.8) });
    sub(480, 380, '실패 Pod를 남겨야 로그로 원인을 본다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 5. CI 게이트 ----------
  const STG = [['배포', 'upgrade --install --wait'], ['검증', 'helm test'], ['결과', '통과 / 롤백']];
  function pipeline(k, u, cur) { STG.forEach(([nm, cmd], i) => { const x = 150 + i * 300, on = i <= cur, col = i === 2 && k === 3 ? BAD : i === 2 && k === 2 ? GOOD : on ? ACC : OFF;
      card(x, 70, 220, 64, { rx: 12, stroke: col, fill: on ? (col === BAD ? BADBG : col === GOOD ? GOODBG : ACCBG) : PANEL, sw: 2.2 });
      tx(x, 64, nm, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); mono(x, 88, cmd, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      if (i < 2) grow(x + 112, 70, x + 186, 70, i < cur ? 1 : 0, ACC); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { pipeline(k, u, -1); [['set -e', '어느 명령이든 실패하면 멈춘다'], ['RELEASE=my-web', ''], ['NAMESPACE=staging', '']].forEach(([a, b], i) => { const y = 170 + i * 44, op = fade(u, 0.3 + i * 0.4);
        mono(60, y, a, { 'font-size': 16, 'font-weight': 800, fill: i ? INK : BAD, opacity: op }); if (b) tx(260, y, b, { 'font-size': 14.5, fill: MUT, opacity: op }); });
      note(60, 340, 'CI 스크립트의 첫 조건: 실패를 그냥 지나치지 않는다', fade(u, 1.8)); return; }
    if (k === 1) { pipeline(k, u, 0);
      tx(60, 170, 'Pod Ready', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < 3; i++) { const on = u > 0.6 + i * 0.5; el('rect', { x: 180 + i * 50, y: 150, width: 36, height: 36, rx: 8, fill: on ? ACCBG : PANEL, stroke: on ? ACC : OFF, 'stroke-width': 2.2 }); if (on) check(198 + i * 50, 168, 7, 1); }
      tx(60, 240, '--timeout 5m', { 'font-size': 15, 'font-weight': 700, class: 'mono' }); R.hbar(200, 226, 420, E(u, 0.3, 2.0) * 5, 5, { label: false, col: WARN, h: 18 });
      note(60, 320, '--wait 없이 바로 테스트하면', fade(u, 1.8)); note(60, 346, '아직 안 뜬 서비스에 붙어 실패한다', fade(u, 2.0), { fill: WARN }); return; }
    if (k === 2) { pipeline(k, u, u > 1.0 ? 2 : 1);
      mono(60, 190, 'if helm test "$RELEASE" … --logs; then', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(360, 240, 'exit 0', { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      grow(360, 260, 750, 110, E(u, 0.9, 1.5), GOOD);
      note(520, 320, '배포 검증 통과 — 트래픽 전환 진행', fade(u, 1.7), { fill: GOOD }); return; }
    if (k === 3) { pipeline(k, u, 2);
      mono(60, 180, 'else', { 'font-size': 15, 'font-weight': 700 }); mono(60, 210, '  helm rollback "$RELEASE"', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) }); mono(60, 240, '  exit 1', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) });
      tx(470, 180, '리비전 기록 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.6) });
      [['rev 1', '이전 버전', GOOD, 0.7], ['rev 2', '테스트 실패', BAD, 1.0], ['rev 3', 'rev 1 내용으로', ACC, 1.6]].forEach(([r, d, col, at], i) => { const x = 520 + i * 140, s = pop(u, at);
        card(x, 240, 120, 64, { rx: 10, stroke: col, sw: 2, s }); mono(x, 236, r, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s > 0.5 ? 1 : 0 }); tx(x, 258, d, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 }); });
      sub(660, 304, '롤백도 새 리비전을 하나 만든다', fade(u, 2.0), { 'font-size': 14 });
      note(60, 340, '문제 버전이 운영에 남지 않고 job은 실패로 끝난다', fade(u, 2.2), { fill: BAD }); return; }
    // k4: GitHub Actions
    [['- run: helm upgrade --install my-web ./my-web --wait', GOOD, 'success'], ['- run: helm test my-web --logs', BAD, 'failure']].forEach(([s, col, st], i) => { const y = 90 + i * 90, at = 0.3 + i * 0.6;
      card(400, y, 740, 60, { rx: 10, stroke: col, sw: 2, s: pop(u, at) }); mono(50, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, at + 0.2) });
      pill(840, y, st, col, pop(u, at + 0.4), { mono: true, fs: 13.5 }); });
    grow(400, 230, 400, 280, E(u, 1.5, 1.9), BAD);
    card(400, 320, 300, 56, { rx: 12, stroke: BAD, fill: BADBG, sw: 2.4, text: 'job failed · 배포 차단', fs: 16, color: BAD, s: pop(u, 1.9) }); }

  const quiz = [
    { q: 'helm install이 STATUS: deployed로 끝났을 때 확인된 것은 무엇인가?',
      o: ['서비스가 200을 돌려준다', '매니페스트가 클러스터에 적용됐다', '테스트 Pod가 통과했다'], a: 1,
      why: 'deployed는 설치가 끝났다는 뜻일 뿐이다. Pod가 Running이어도 서비스 응답은 helm test 같은 확인을 거쳐야 안다.' },
    { q: '테스트 Pod에 restartPolicy: Never를 주는 까닭은 무엇인가?',
      o: ['첫 실행의 exit code를 그대로 판정에 쓰려고', 'Pod를 더 빨리 지우려고', 'helm install 때도 실행되게 하려고'], a: 0,
      why: '재시작하지 않으니 한 번 돈 결과가 곧 테스트 결과다. exit 0이면 Succeeded, 아니면 Failed다.' },
    { q: 'helm test가 Phase: Failed와 "wget: download timed out"을 보였다. 먼저 의심할 것은 무엇인가?',
      o: ['테스트 이미지 크기', 'Service 이름·포트·셀렉터', '--logs 옵션'], a: 1,
      why: '타임아웃은 연결 자체가 안 됐다는 뜻이다. 테스트가 붙는 my-web:8080 주소와 Service가 Pod를 고르는 셀렉터부터 본다.' },
    { q: 'hook-delete-policy를 before-hook-creation,hook-succeeded로 주면 성공한 테스트 Pod는 어떻게 되는가?',
      o: ['다음 helm test 직전까지 남는다', '성공하자마자 지워진다', 'helm uninstall 때 지워진다'], a: 1,
      why: 'hook-succeeded가 성공한 Pod를 바로 지운다. 실패한 Pod는 남겨 로그를 보고, 다음 실행 직전에는 before-hook-creation이 치운다.' },
    { q: 'CI 스크립트에서 helm test 앞에 --wait를 둔 helm upgrade --install을 쓰는 까닭은 무엇인가?',
      o: ['리소스가 Ready 된 뒤에 테스트하려고', '테스트 Pod를 지우려고', '실패하면 자동으로 롤백하려고'], a: 0,
      why: '--wait 없이 바로 테스트하면 아직 뜨지 않은 서비스에 붙어 실패한다. 최대 --timeout 5m까지 Ready를 기다린다.' },
  ];

  const summary = [
    'helm install이 deployed여도 서비스가 응답하는지는 따로 확인해야 안다.',
    'templates/tests/에 "helm.sh/hook": test Pod를 두면 helm test 때만 생성된다.',
    '테스트 Pod는 한 번만 돌고 exit code 0이면 Succeeded, 아니면 Failed다.',
    'CI에서 --wait로 배포하고 helm test가 실패하면 rollback해 배포를 막는다.',
  ];
  const review = [
    { q: 'CI에서 helm upgrade --install 직후 helm test가 가끔 타임아웃으로 실패한다. 서비스는 몇 초 뒤면 정상이다. 먼저 고칠 것은?',
      o: ['테스트 Pod의 restartPolicy를 Always로 바꾼다', 'helm upgrade에 --wait를 붙여 Ready까지 기다린다', 'hook-delete-policy에서 hook-failed를 뺀다'], a: 1,
      why: '아직 뜨지 않은 서비스에 붙으면 테스트가 실패한다. --wait로 리소스가 Ready 될 때까지 기다린 뒤 테스트해야 한다.' },
    { q: 'set -e를 건 sh -c 테스트에서 첫 curl이 404를 받았는데도 helm test가 통과했다. 원인으로 가장 그럴듯한 것은?',
      o: ['curl에 -f를 주지 않아 404에도 exit 0이 났다', 'busybox 이미지를 써서', 'hook-succeeded 정책 때문에'], a: 0,
      why: 'curl은 -f가 없으면 HTTP 오류 응답도 성공(exit 0)으로 끝낸다. -f를 줘야 4xx·5xx가 실패가 되고 set -e가 그 자리에서 멈춘다.' },
    { q: '실패한 테스트의 원인을 보려는데 Pod가 이미 지워지고 없다. 정책을 어떻게 바꿔야 하나?',
      o: ['before-hook-creation을 뺀다', 'hook-succeeded를 뺀다', 'hook-failed를 뺀다'], a: 2,
      why: 'hook-failed는 실패한 Pod를 바로 지운다. 빼 두면 실패 Pod가 남아 kubectl logs로 원인을 볼 수 있다.' },
  ];

  R.page({ title: 'helm test 검증 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
