/* V-1-1 kubectl 핵심 명령어 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── 위쪽 띠: kubectl · API server · etcd · (노드: kubelet · 컨테이너) ──
  const Y = 60;
  const NX = { kubectl: 80, apiserver: 270, etcd: 452, kubelet: 668, container: 852 };
  const NAME = { kubectl: 'kubectl', apiserver: 'API server', kubelet: 'kubelet', container: '컨테이너' };
  const arc = (() => { const p0 = [300, 36], q = [470, -30], p2 = [640, 36], out = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16; out.push([(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * q[0] + t * t * p2[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * q[1] + t * t * p2[1]]); } return out; })();
  const GEO = { 'kubectl|apiserver': [[146, Y], [204, Y]], 'apiserver|etcd': [[336, Y], [410, Y]], 'apiserver|kubelet': arc, 'kubelet|container': [[734, Y], [786, Y]] };
  const geo = (e) => { const [a, b] = e.split('->'); return GEO[a + '|' + b] || GEO[b + '|' + a].slice().reverse(); };
  const base = (e) => { const [a, b] = e.split('->'); return GEO[a + '|' + b] ? a + '|' + b : b + '|' + a; };
  const pts = (p) => p.map((q) => q.join(',')).join(' ');

  // 띠 그리기. o.cut: 끊긴 노드, o.grow: 이번 beat 에 새로 켜지는 선이 자라는 시각
  function map(c, o) { o = o || {}; const b = c.beat, p = c.prev, u = c.u;
    const on = new Set(b.activeNodes || []), act = new Set((b.activeEdges || []).map(base)), was = new Set(((p && p.activeEdges) || []).map(base));
    zone(574, 14, 366, 92, null, { fill: SOFT });
    tx(757, 124, 'node-2 (워커 노드)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    Object.keys(GEO).forEach((k) => { el('polyline', { points: pts(GEO[k]), fill: 'none', stroke: GRID, 'stroke-width': 2.5 });
      if (act.has(k)) el('polyline', { points: pts(GEO[k]), fill: 'none', stroke: ACC, 'stroke-width': 3.2, pathLength: 1, 'stroke-dasharray': `${was.has(k) ? 1 : E(u, o.grow ?? 0.1, (o.grow ?? 0.1) + 0.7)} 1` }); });
    Object.keys(NX).forEach((n) => { const x = NX[n], a = on.has(n), col = a ? ACC : GRID;
      if (n === 'etcd') { dbIcon(x, Y - 2, null, { s: 0.6, stroke: a ? INFO : GRID }); tx(x + 34, Y + 6, 'etcd', { 'font-size': 15, 'font-weight': 700, fill: a ? INFO : MUT }); }
      else card(x, Y, 128, 44, { text: NAME[n], fs: 15, stroke: col, sw: a ? 2.5 : 1.8, color: a ? INK : MUT, fill: a ? ACCBG : PANEL });
      if ((o.cut || []).includes(n)) cross(x, Y, 13, pop(u, o.cutAt ?? 0.4)); }); }
  // 데이터의 activeEdges 순서대로 점이 한 칸씩 지나간다 (a~b 초 사이)
  function flow(c, a, b, col) { const es = c.beat.activeEdges || [], n = es.length; if (!n) return;
    es.forEach((e, i) => { const t0 = lerp(a, b, i / n), t1 = lerp(a, b, (i + 1) / n); dot(geo(e), seg(c.u, t0, t1), col || ACC, 7); }); }
  // 표 줄 맞추기
  const pad = (row, w) => row.map((v, i) => String(v).padEnd(w[i] || 8)).join('').trimEnd();
  const W5 = [18, 7, 10, 10, 6, 8];

  // 1. get pods
  function s1(t, c) { const { k, u } = c, b = c.beat, o = b.output;
    map(c, { grow: k === 1 ? 0.3 : 0.1 });
    flow(c, 0.3, k === 1 ? 2.2 : 1.4);
    const cmd = ['$ kubectl get pods', '$ kubectl get pods', '$ kubectl get pods -o wide', '$ kubectl get pods -l app=web', '$ kubectl get po'][k];
    const head = pad(o.headers, W5), rows = o.rows.map((r) => pad(r, W5));
    let lines = [cmd, ['', null], [head, 'var(--off)']], shown;
    if (k === 0) { lines.push(['(응답 기다리는 중…)', 'var(--off)']); shown = 1 + 3 * E(u, 0.2, 1.4); }
    else if (k === 3) { const all = c.steps[1].output.rows.map((r) => pad(r, W5)), gone = clamp(seg(u, 0.6, 1.6));
      all.forEach((r) => { const keep = rows.includes(r); if (keep || gone < 1) lines.push([r, keep ? null : 'var(--bad)']); }); shown = lines.length; }
    else { rows.forEach((r) => lines.push(r)); shown = k === 1 ? 3 + rows.length * seg(u, 1.4, 2.4) : lines.length; }
    terminal(40, 146, 600, 262, lines, shown, { title: 'zsh', fs: 14 });
    if (k === 3 && seg(u, 0.6, 1.6) < 1) { const yy = [0, 1, 2, 3].filter((i) => !rows.includes(pad(c.steps[1].output.rows[i], W5)));
      yy.forEach((i) => el('line', { x1: 56, y1: 146 + 44 + (3 + i) * 22 - 5, x2: lerp(56, 520, E(u, 0.3, 0.9)), y2: 146 + 44 + (3 + i) * 22 - 5, stroke: BAD, 'stroke-width': 2 })); }
    // 오른쪽: 이 beat 에 무슨 일이 있었나
    const rx = 668;
    if (k === 0) { card(790, 210, 250, 86, { rx: 10, stroke: GRID, sw: 1.5, s: pop(u, 0.3) });
      tx(rx + 10, 196, '~/.kube/config', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(rx + 10, 222, 'server: https://…', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7) }); mono(rx + 10, 242, 'token:  ••••••', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
      sub(790, 300, 'GET 요청 하나만 간다', fade(u, 1.2), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
    if (k === 1) { ['인증', '인가 (RBAC)'].forEach((s, i) => pill(240 + i * 96, 104, s, GOOD, pop(u, 0.5 + i * 0.25), { fs: 13.5 }));
      tx(rx, 168, 'etcd에서 읽은 키', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1) });
      o.rows.forEach((r, i) => mono(rx, 196 + i * 26, '/registry/pods/default/' + r[0].replace(/^.*-/, '…'), { 'font-size': 13.5, fill: INK, opacity: fade(u, 1.1 + i * 0.2) }));
      tx(rx, 318, 'kubelet은 거치지 않는다', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 2) }); }
    if (k === 2) { [['-A', '모든 namespace'], ['-o wide', 'NODE · Pod IP 추가'], ['-w', '변화를 계속 지켜봄']].forEach(([f, d], i) => {
        const y = 186 + i * 56, s = pop(u, 0.3 + i * 0.3); pill(rx + 46, y, f, ACC, s, { mono: true, fs: 14 }); tx(rx + 104, y + 5, d, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.3) }); });
      el('rect', { x: 40 + 16 + 51 * 8.4 - 4, y: 146 + 44 + 2 * 22 - 18, width: 60, height: 22 * (o.rows.length + 1) + 6, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.2) }); }
    if (k === 3) { tx(rx, 176, '라벨로 고른다', { 'font-size': 15, 'font-weight': 700 });
      [['web-…aa1', 'app=web', true], ['web-…bb2', 'app=web', true], ['api-…cc3', 'app=api', false], ['db-0', 'app=db', false]].forEach(([n, l, ok], i) => {
        const y = 206 + i * 32, op = ok ? 1 : 1 - 0.65 * E(u, 0.8, 1.6); mono(rx, y, n, { 'font-size': 14, opacity: op, 'font-weight': 700 }); pill(rx + 150, y - 5, l, ok ? GOOD : OFF, 1, { fs: 13.5, op });
        if (ok) check(rx + 226, y - 5, 8, pop(u, 1 + i * 0.2)); });
      tx(rx, 352, '4행 → 2행', { 'font-size': 15, 'font-weight': 700, fill: ACC, class: 'mono', opacity: fade(u, 1.6) }); }
    if (k === 4) { [['po', 'pods'], ['svc', 'services'], ['deploy', 'deployments'], ['ns', 'namespaces']].forEach(([a, f], i) => {
        const y = 186 + i * 46, s = pop(u, 0.2 + i * 0.25); pill(rx + 30, y, a, ACC, s, { mono: true, fs: 14 }); grow(rx + 70, y, rx + 116, y, E(u, 0.4 + i * 0.25, 0.9 + i * 0.25), MUT); mono(rx + 124, y + 5, f, { 'font-size': 14, opacity: fade(u, 0.7 + i * 0.25) }); });
      sub(790, 378, '결과는 똑같다', fade(u, 1.8), { 'font-size': 14, fill: INK, 'font-weight': 700 }); } }

  // 2. describe pod — Pod 본문 + Events
  function s2(t, c) { const { k, u } = c, o = c.beat.output, po = c.prev && c.prev.output;
    map(c);
    flow(c, 0.2, 1.4);
    // 왼쪽: describe 본문
    zone(30, 142, 430, 270, 'describe 본문', { fill: SOFT });
    const sw = k === 4 ? E(u, 0.2, 0.8) : 1, name = o.name, run = o.status === 'Running';
    const rows = [['Name:', name, INK], ['Status:', o.status, run ? GOOD : WARN]];
    if (k >= 1 && k !== 4) rows.push(['Image:', 'myapp:v1', INK], ['State:', 'Running', GOOD]);
    if (k === 4) rows.push(['Image:', 'myapi:v2.1', BAD], ['State:', 'Waiting', WARN]);
    if (o.lastReason !== '—') rows.push([k === 4 ? 'Reason:' : 'Last State:', k === 4 ? o.lastReason : 'Terminated', k === 4 ? BAD : MUT], ...(k === 4 ? [] : [['  Reason:', o.lastReason, BAD], ['  Exit Code:', '137', BAD]]));
    rows.forEach(([a, v, col], i) => { const nw = (k === 1 && i >= 2) || (k === 2 && i >= 4) || (k === 0 && i < 2) || k === 4, op = nw ? fade(u, 0.3 + i * 0.2) : 1;
      mono(50, 190 + i * 28, a, { 'font-size': 14.5, fill: MUT, opacity: op * sw }); mono(190, 190 + i * 28, v, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: op * sw }); });
    if (k === 2 || k === 3) { const y = 190 + 6 * 28; card(330, y - 5, 200, 30, { rx: 15, stroke: BAD, sw: 2, fill: PANEL, text: '137 = 128 + 9 (SIGKILL)', fs: 13.5, color: BAD, s: k === 2 ? pop(u, 1.4) : 1, mono: true }); }
    if (k === 0) sub(245, 392, 'Pod와 Event, 두 종류를 etcd에서 같이 읽는다', fade(u, 1.2), { 'font-size': 14 });
    // 오른쪽: Events 목록
    tx(490, 160, 'Events (시간순)', { 'font-size': 15, 'font-weight': 700 });
    const prevMsgs = new Set(((po && k !== 4) ? po.events : []).map((e) => e.reason + e.msg));
    const evs = o.events;
    if (k === 5) { const gone = po.events.filter((e) => !evs.some((x) => x.reason === e.reason && x.msg === e.msg));
      gone.forEach((e, i) => { const y = 186 + i * 40, op = 1 - E(u, 0.8, 1.8); evRow(490, y, e, op, true); });
      clock(912, 150, 15, E(u, 0.2, 1.4), WARN); mono(890, 156, '1h', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end' });
      evs.forEach((e, i) => evRow(490, lerp(186 + (gone.length + i) * 40, 186 + i * 40, E(u, 1.6, 2.4)), e, 1));
      sub(700, 400, 'event-ttl 기본 1시간: 오래 보관은 Loki · Datadog', fade(u, 2), { 'font-size': 14 }); return; }
    evs.forEach((e, i) => { const nw = !prevMsgs.has(e.reason + e.msg), y = 186 + i * 40; evRow(490, y, e, nw ? fade(u, 0.5 + i * 0.18) : 1, false, nw && e.type === 'Warning'); });
    if (k === 3) { const i = evs.length - 1; el('rect', { x: 482, y: 186 + i * 40 - 20, width: 452, height: 38, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.2) }); } }
  function evRow(x, y, e, op, strike, hot) { const w = e.type === 'Warning';
    el('circle', { cx: x + 6, cy: y - 5, r: 5, fill: w ? BAD : GOOD, opacity: op });
    tx(x + 18, y, e.reason, { 'font-size': 14.5, 'font-weight': 700, fill: w ? BAD : INK, opacity: op, 'text-decoration': strike ? 'line-through' : null });
    mono(x + 120, y, e.from, { 'font-size': 13.5, fill: MUT, opacity: op });
    const m = e.msg.length > 30 ? e.msg.slice(0, 29) + '…' : e.msg; mono(x + 210, y, m, { 'font-size': 13.5, fill: hot ? BAD : INK, opacity: op }); }

  // 3. logs — kubelet 에게 묻는다
  function s3(t, c) { const { k, u } = c, o = c.beat.output;
    map(c, { cut: k === 4 ? ['kubelet'] : ['etcd'], cutAt: k === 0 || k === 4 ? 0.5 : 0 });
    if (k < 4) { flow(c, 0.2, 1.2); for (let i = 0; i < (k === 0 ? 0 : 4); i++) dot(geo('container->kubelet').concat(arc.slice().reverse(), [[204, Y], [146, Y]]), (t * 0.5 + i / 4) % 1, INFO, 5); }
    else flow(c, 0.2, 1);
    // 왼쪽: 노드의 로그 파일
    const lx = 40;
    if (k === 2) { card(150, 200, 200, 60, { rx: 10, stroke: BAD, sw: 2, dash: '5 4', text: '이전 컨테이너\nOOMKilled', fs: 14, color: BAD });
      card(150, 300, 200, 60, { rx: 10, stroke: GOOD, sw: 2, text: '지금 컨테이너\n재시작 후 깨끗함', fs: 14, color: INK });
      grow(260, 200, 330, 230, E(u, 0.4, 1.2), BAD); pill(150, 362, '--previous', ACC, pop(u, 0.9), { mono: true, fs: 14 }); }
    else if (k === 3) { ['web-…aa1', 'web-…bb2'].forEach((n, i) => { card(130, 200 + i * 80, 160, 52, { rx: 10, stroke: ACC, sw: 2, text: n, fs: 14, mono: true });
        grow(212, 200 + i * 80, 330, 260, E(u, 0.3 + i * 0.2, 1 + i * 0.2), ACC); });
      pill(150, 362, '-l app=web --tail=2', ACC, pop(u, 0.6), { mono: true, fs: 13.5 }); }
    else { const fy = 176; el('path', { d: `M${lx},${fy} h170 l24,24 v150 h-194 z`, fill: PANEL, stroke: k === 4 ? OFF : INK, 'stroke-width': 2 });
      mono(lx + 12, fy + 26, '0.log', { 'font-size': 15, 'font-weight': 700, fill: k === 4 ? OFF : INK });
      for (let i = 0; i < 7; i++) el('rect', { x: lx + 14, y: fy + 46 + i * 18, width: 150 - (i % 3) * 30, height: 7, rx: 3, fill: k === 4 ? SOFT : i >= 3 && k >= 1 ? ACC : OFF, opacity: k === 1 && i >= 3 ? fade(u, 0.4 + (i - 3) * 0.4) : 1 });
      tx(lx + 97, fy + 196, '/var/log/pods/…/app/', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: 'mono' });
      if (k === 4) tx(lx + 97, fy + 120, '노드에만 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1) }); }
    // 오른쪽: 터미널
    const col = (l) => (l === 'ERROR' ? 'var(--bad)' : l === 'WARN' ? 'var(--warn)' : null);
    const cmd = ['$ kubectl logs web-aa1', '$ kubectl logs -f web-aa1', '$ kubectl logs --previous web-aa1', '$ kubectl logs -l app=web --tail=2', '$ kubectl logs -f web-aa1'][k];
    const lines = [cmd].concat(o.lines.map((l) => k === 4 ? [l.msg.slice(0, 62), 'var(--bad)'] : [`${l.ts.slice(11, 19)} ${l.lvl.padEnd(5)} ${l.msg}`.slice(0, 62), col(l.lvl)]));
    const shown = k === 1 ? 4 + (lines.length - 4) * seg(u, 0.4, 2.4) : 1 + (lines.length - 1) * E(u, 0.2, 1.2);
    terminal(330, 146, 600, 262, lines, shown, { title: k === 1 ? 'zsh — 계속 흘러내림' : 'zsh', fs: 13.5 }); }

  // 4. exec — 양방향 스트림
  function s4(t, c) { const { k, u } = c, o = c.beat.output;
    map(c, { cut: k === 5 ? ['container'] : [] });
    const there = geo('kubectl->apiserver').concat(arc, [[734, Y], [786, Y]]), back = there.slice().reverse();
    if (k === 0) { dot(there, seg(u, 0.2, 1.2), ACC, 7); dot(back, seg(u, 1.3, 2.3), INFO, 7); }
    else if (k < 5) { for (let i = 0; i < 3; i++) { dot(there, (t * 0.45 + i / 3) % 1, ACC, 5); dot(back, (t * 0.45 + i / 3 + 0.17) % 1, INFO, 5); } }
    else dot(there.slice(0, -2), seg(u, 0.2, 1.2), ACC, 7);
    // 왼쪽: Pod 안 컨테이너
    zone(30, 142, 280, 268, k === 4 ? 'Pod 두 개 (같은 namespace)' : 'Pod web-aa1', { fill: SOFT });
    if (k === 0) { card(170, 230, 200, 60, { rx: 10, stroke: ACC, sw: 2, text: 'app 컨테이너', fs: 15 });
      pill(170, 320, '한 번 실행하고 끝', MUT, pop(u, 1.6), { fs: 14 }); }
    if (k === 1) { card(170, 220, 200, 56, { rx: 10, stroke: ACC, sw: 2, text: 'app 컨테이너', fs: 15 });
      pill(110, 300, '-i  stdin', ACC, pop(u, 0.3), { mono: true, fs: 14 }); pill(230, 300, '-t  TTY', INFO, pop(u, 0.6), { mono: true, fs: 14 });
      sub(170, 352, '입력 ⇄ 출력이 계속 열려 있다', fade(u, 1), { 'font-size': 14, fill: INK }); }
    if (k === 2) { card(170, 210, 200, 50, { rx: 10, stroke: ACC, sw: 2.5, text: 'app', fs: 15, mono: true, fill: ACCBG });
      card(170, 280, 200, 50, { rx: 10, stroke: GRID, sw: 1.8, text: 'log-shipper', fs: 15, mono: true, color: MUT });
      pill(170, 350, '-c app', ACC, pop(u, 0.4), { mono: true, fs: 14 }); grow(170, 336, 170, 240, E(u, 0.6, 1.2), ACC); }
    if (k === 3) { [['env', 'DB_HOST 확인'], ['resolv.conf', 'DNS 10.96.0.10'], ['curl', 'api/health ok']].forEach(([a, d], i) => {
        const y = 196 + i * 62; check(56, y, 9, pop(u, 0.6 + i * 0.5)); mono(76, y - 4, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) }); tx(76, y + 18, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.5) }); }); }
    if (k === 4) { card(110, 230, 140, 60, { rx: 10, stroke: GRID, sw: 1.8, text: 'web-aa1\n도구 없음', fs: 14, color: MUT });
      card(230, 300, 130, 60, { rx: 10, stroke: ACC, sw: 2, dash: '6 4', text: 'tmp\nbusybox', fs: 14, s: pop(u, 0.3) });
      pill(170, 380, '--rm: 나가면 지워짐', MUT, pop(u, 1.2), { fs: 13.5 }); }
    if (k === 5) { card(170, 230, 200, 60, { rx: 10, stroke: BAD, sw: 2, text: 'distroless 이미지', fs: 15, color: BAD });
      tx(170, 300, 'bash · sh 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      sub(170, 340, '흔적은 Audit log를 켜야 남는다', fade(u, 1.4), { 'font-size': 13.5 }); }
    // 오른쪽: 셸
    const cmd = ['$ kubectl exec web-aa1 -- ls /app', '$ kubectl exec -it web-aa1 -- bash', '$ kubectl exec -it web-aa1 -c app -- sh', '$ kubectl exec -it web-aa1 -- bash', '$ kubectl run tmp --rm -it --image=busybox -- sh', '$ kubectl exec -it web-prod -- bash'][k];
    const lines = [cmd];
    o.history.forEach((h) => { if (k === 5 && h.type === 'cmd') return; (h.type === 'cmd' ? [`${o.prompt} ${h.text}`] : h.text.split('\n')).forEach((s) => lines.push(h.type === 'cmd' ? [s, 'var(--panel)'] : [s.slice(0, 64), k === 5 ? 'var(--bad)' : null])); });
    if (k === 0) lines.splice(1, 1);
    const prevN = 1, shown = prevN + (lines.length - prevN) * E(u, 0.3, 2);
    terminal(330, 146, 600, 262, lines, shown, { title: k === 0 ? 'zsh' : 'web-aa1 셸', fs: 13.5 }); }

  // 5. apply — 원하는 상태를 쓰면 컨트롤러가 메운다
  const ROLL = [[3, 1, 0], [3, 1, 1], [2, 1, 1], [2, 2, 1], [2, 2, 2], [1, 2, 2], [1, 3, 2], [1, 3, 3], [0, 3, 3]];   // rolling.py 결과 (v1, v2, v2 Ready)
  function rsBox(x, y, name, tag, n, ready, o) { o = o || {};
    card(x, y, 250, 46, { rx: 10, stroke: o.col || INK, sw: 2, text: '', op: o.op });
    mono(x - 112, y + 5, name, { 'font-size': 14, 'font-weight': 700, fill: o.col || INK, opacity: o.op ?? 1 }); pill(x + 82, y, tag, o.col || INK, 1, { mono: true, fs: 13.5, op: o.op });
    for (let i = 0; i < n; i++) { const cx = x - 100 + i * 50, cy = y + 52, r = i < ready ? 1 : 0;
      el('circle', { cx, cy, r: 15, fill: r ? (o.col === ACC ? ACCBG : SOFT) : PANEL, stroke: o.col || INK, 'stroke-width': 2, 'stroke-dasharray': r ? null : '4 3', opacity: o.op ?? 1 });
      if (r) tx(cx, cy + 5, 'P', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: o.col || INK, opacity: o.op ?? 1 }); } }
  function s5(t, c) { const { k, u } = c, lines = c.beat.output.lines;
    map(c, { grow: 0.1 });
    flow(c, 0.2, 1.6);
    const sx = 40, sy = 146;
    if (k === 0) { zone(sx, sy, 460, 150, 'kubectl diff -f deployment.yaml', { fill: SOFT });
      el('rect', { x: sx + 14, y: sy + 42, width: 432, height: 30, rx: 4, fill: 'var(--badbg)', opacity: fade(u, 0.4) }); mono(sx + 24, sy + 63, '-  image: myapp:v1', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.4) });
      el('rect', { x: sx + 14, y: sy + 80, width: 432, height: 30, rx: 4, fill: 'var(--goodbg)', opacity: fade(u, 0.8) }); mono(sx + 24, sy + 101, '+  image: myapp:v2', { 'font-size': 15, fill: GOOD, opacity: fade(u, 0.8) });
      pill(sx + 130, sy + 190, '--dry-run=server', INFO, pop(u, 1.2), { mono: true, fs: 14 }); tx(sx + 230, sy + 195, '검증만, 저장 안 함', { 'font-size': 14, opacity: fade(u, 1.4) });
      tx(720, 200, 'etcd', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT }); el('rect', { x: 620, y: 214, width: 200, height: 110, rx: 12, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      tx(720, 274, '아직 그대로', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); return; }
    if (k === 1) { fly(100, 200, 452, 110, seg(u, 0.2, 1.5), 'deployment.yaml', { mono: true });
      zone(300, 160, 600, 220, 'etcd의 Deployment web', { fill: SOFT });
      tx(330, 218, 'spec (원하는 상태)', { 'font-size': 15, 'font-weight': 700, fill: ACC }); tx(630, 218, 'status (지금 상태)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      mono(330, 256, 'image: myapp:v2', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) }); mono(330, 286, 'replicas: 3', { 'font-size': 15, opacity: fade(u, 1.5) });
      mono(630, 256, 'v1 Pod 3개 Running', { 'font-size': 15, fill: MUT }); el('line', { x1: 600, y1: 196, x2: 600, y2: 360, stroke: GRID, 'stroke-width': 2 });
      banner(600, 340, '둘이 다르다 → 컨트롤러가 움직인다', pop(u, 2)); pill(140, 290, 'configured', GOOD, pop(u, 1.6), { mono: true }); return; }
    // k ≥ 2: Deployment → ReplicaSet → Pod
    card(120, 190, 160, 46, { rx: 10, stroke: INK, sw: 2.5, text: 'Deployment web', fs: 14.5 });
    let st = k === 2 ? [3, 1, 0] : k === 3 ? [3, 1, 0] : k === 4 ? ROLL[Math.min(ROLL.length - 1, Math.floor(seg(u, 0.1, 2.5) * (ROLL.length - 1) + 1e-6))] : [0, 3, 3];
    if (k === 2) st = [3, u < 1.2 ? 0 : 1, 0];
    const newOp = k === 2 ? fade(u, 0.4) : 1;
    grow(200, 190, 310, 190, 1, MUT); grow(200, 200, 310, 290, k === 2 ? E(u, 0.3, 0.8) : 1, ACC);
    rsBox(440, 190, 'web-7d9f8c5b', 'v1', st[0], st[0], { col: INK, op: k === 5 ? 0.5 : 1 });
    rsBox(440, 290, 'web-5b6c8d9f', 'v2', st[1], st[2], { col: ACC, op: newOp });
    const mx = 620;
    if (k === 2) { pill(mx + 150, 200, 'maxSurge = ceil(3 × 25%) = 1', ACC, pop(u, 1.2), { mono: true, fs: 13.5 }); tx(mx + 20, 250, 'Pod는 최대 4개까지', { 'font-size': 14.5, opacity: fade(u, 1.6) });
      tx(mx + 20, 276, '새 Pod 1개가 Pending으로', { 'font-size': 14.5, opacity: fade(u, 1.9) }); }
    if (k === 3) { const nx = 760; ['node-1', 'node-2', 'node-3'].forEach((n, i) => { const y = 166 + i * 54; card(nx, y, 230, 44, { rx: 8, stroke: i === 2 ? ACC : GRID, sw: 2 }); mono(nx - 100, y + 5, n, { 'font-size': 14, 'font-weight': 700 }); });
      fly(340, 342, nx + 50, 274, seg(u, 0.3, 1.4), 'Pod dd4', { mono: true, stay: true });
      el('rect', { x: nx - 100, y: 306, width: 200, height: 10, rx: 5, fill: SOFT }); el('rect', { x: nx - 100, y: 306, width: 200 * E(u, 1.4, 2.5), height: 10, rx: 5, fill: ACC });
      mono(nx, 336, 'kubelet: pull myapp:v2', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); tx(nx, 362, 'scheduler가 nodeName을 채움', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) }); }
    if (k === 4) { const tot = st[0] + st[1];
      mono(mx + 20, 190, `v1 ${st[0]} · v2 ${st[1]} (Ready ${st[2]})`, { 'font-size': 15, 'font-weight': 700 });
      mono(mx + 20, 220, `전체 ${tot} ≤ 4,  가용 ${st[0] + st[2]} ≥ 3`, { 'font-size': 14.5, fill: tot > 4 || st[0] + st[2] < 3 ? BAD : GOOD });
      // kubectl rollout status 가 지금 찍는 줄 (rolling.py 와 같은 판정)
      const msg = st[1] < 3 ? `${st[1]} out of 3 new replicas have been updated...` : st[0] > 0 ? `${st[0]} old replicas are pending termination...` : 'deployment "web" successfully rolled out';
      el('rect', { x: 40, y: 368, width: 880, height: 34, rx: 6, fill: INK });
      mono(56, 390, '$ kubectl rollout status · ' + msg, { 'font-size': 13.5, fill: st[0] === 0 ? 'var(--term)' : PANEL }); }
    if (k === 5) { pill(mx + 140, 200, 'unchanged', MUT, pop(u, 0.4), { mono: true, fs: 14 }); tx(mx + 20, 250, '다시 apply 해도 차이가 없으면', { 'font-size': 14.5, opacity: fade(u, 0.8) });
      tx(mx + 20, 276, '아무것도 만들지 않는다', { 'font-size': 14.5, opacity: fade(u, 1) }); sub(mx + 130, 316, '옛 ReplicaSet은 0개로 남아 롤백에 쓰인다', fade(u, 1.5), { 'font-size': 13.5 }); } }

  // 6. delete — 정중한 종료
  function s6(t, c) { const { k, u } = c, tl = c.beat.output.timeline;
    map(c);
    flow(c, 0.2, 1.2);
    const ax = 80, aw = 800, ay = 378, force = k === 4, quick = k === 5;
    const T = (s) => ax + aw * clamp(s / 30);   // 0~30초
    el('line', { x1: ax, y1: ay, x2: ax + aw, y2: ay, stroke: MUT, 'stroke-width': 2 });
    [0, 5, 10, 15, 20, 25, 30].forEach((s) => { el('line', { x1: T(s), y1: ay - 4, x2: T(s), y2: ay + 4, stroke: MUT }); mono(T(s), ay + 22, s === 30 ? '30s (grace)' : s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    // Pod 와 Service
    const alive = k <= 2 || (k === 3 && u < 1.2) || (k === 5 && u < 1.6), state = k === 0 ? 'Running' : alive ? 'Terminating' : '삭제됨';
    card(170, 200, 210, 64, { rx: 12, stroke: k === 0 ? GOOD : alive ? WARN : OFF, sw: 2.5, dash: alive ? null : '6 4', text: 'web-aa1\n' + state, fs: 15, color: alive ? INK : MUT });
    if (k >= 1 && k !== 4) { mono(70, 252, 'deletionTimestamp: now', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.5) : 1 }); }
    zone(330, 148, 250, 150, 'Service web의 endpoints', { fill: SOFT });
    ['10.1.2.11 (aa1)', '10.1.3.12 (bb2)', '10.1.1.13 (cc3)'].forEach((ip, i) => { const out = i === 0 && k >= 1, y = 196 + i * 32;
      mono(350, y, ip, { 'font-size': 14, fill: out ? OFF : INK, 'text-decoration': out ? 'line-through' : null, opacity: out && k === 1 ? 1 - 0.4 * E(u, 0.6, 1.2) : 1 }); });
    if (k === 1) tx(455, 292, '새 트래픽이 끊긴다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
    // 오른쪽: 신호
    const sx = 720;
    if (k === 0) { fly(100, Y + 40, 260, Y + 40, seg(u, 0.2, 1), 'DELETE', { mono: true }); tx(sx, 210, '명령은 바로 끝난 듯 보여도', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1) }); tx(sx, 236, '종료는 이제 시작이다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) }); }
    if (k === 2 || k === 5) { ['SIGTERM', 'preStop', 'drain'].forEach((s, i) => pill(sx - 90 + i * 92, 190, s, i === 0 ? WARN : INFO, pop(u, 0.3 + i * 0.3), { mono: true, fs: 13.5 }));
      const n = k === 5 ? Math.round(lerp(12, 0, E(u, 0.6, 1.8))) : Math.round(lerp(12, 3, E(u, 0.6, 2.5)));
      tx(sx - 120, 246, '처리 중인 요청', { 'font-size': 14, fill: MUT }); mono(sx + 60, 246, String(n) + '건', { 'font-size': 16, 'font-weight': 800, fill: n === 0 ? GOOD : INK });
      for (let i = 0; i < n; i++) el('circle', { cx: sx - 110 + (i % 12) * 20, cy: 272, r: 6, fill: INFO }); }
    if (k === 3) { pill(sx, 190, 'SIGKILL', BAD, pop(u, 0.3), { mono: true }); fly(sx, 230, 170, 200, seg(u, 0.4, 1.2), '강제 종료', { fill: BAD });
      card(sx - 40, 274, 210, 56, { rx: 12, stroke: GOOD, sw: 2.5, text: '새 Pod\nReplicaSet이 복구', fs: 14, s: pop(u, 1.8) }); }
    if (k === 4) { pill(sx, 190, '--grace-period=0 --force', BAD, pop(u, 0.2), { mono: true, fs: 13.5 }); tx(sx, 240, '확인 없이 객체부터 지운다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      tx(sx, 266, '앱은 정리할 틈이 없다', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1.1) }); }
    // 시간 막대
    const end = force ? 0.3 : quick ? 5.1 : k === 3 ? 30.2 : k === 2 ? 30 : k === 1 ? 0.1 : 0;
    const prevEnd = k === 3 ? 30 : 0, cur = k === 2 ? lerp(0.2, 30, E(u, 0.6, 2.6)) : tween(prevEnd, end, u, 1.6);
    el('rect', { x: ax, y: ay - 10, width: Math.max(2, T(cur) - ax), height: 10, rx: 3, fill: force ? BAD : k === 3 ? BAD : quick ? GOOD : WARN, opacity: 0.8 });
    if (k === 3 || force || quick) tl.filter((e) => ['sigkill', 'gone', 'reborn'].includes(e.state)).forEach((e, i) => { const s = parseFloat(e.t), op = fade(u, 0.6 + i * 0.3);
      mono(s < 15 ? T(s) + 4 : T(s) - 4, ay - 18 - i * 18, (e.state === 'sigkill' ? 'KILL ' : e.state === 'gone' ? '삭제 ' : '새 Pod ') + e.t, { 'font-size': 13.5, 'text-anchor': s < 15 ? 'start' : 'end', fill: e.state === 'reborn' ? GOOD : BAD, 'font-weight': 700, opacity: op }); });
    if (quick) { el('line', { x1: T(30), y1: ay - 30, x2: T(30), y2: ay, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 3' }); mono(T(30), ay - 36, 'KILL 안 감', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) }); } }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'kubectl get pods 요청이 거치지 않는 곳은 무엇인가?',
      o: ['API server', 'etcd', '노드의 kubelet'], a: 2,
      why: 'get은 API server가 인증과 인가를 통과시킨 뒤 etcd의 /registry/pods를 읽어 돌려주는 읽기 경로다. 노드까지 가지 않는다.' },
    { q: '지금은 Running인 Pod가 직전에 메모리 초과로 죽었는지 describe에서 확인하는 곳은 무엇인가?',
      o: ['맨 위 Name 줄', 'Last State의 Reason과 Exit Code', 'Containers의 Image 줄'], a: 1,
      why: '직전에 죽은 기록은 Last State에 남는다. Reason OOMKilled, Exit Code 137(128+9)이면 SIGKILL로 죽은 것이다.' },
    { q: 'kubectl logs 요청에서 실제로 로그 파일을 읽어 보내는 쪽은 무엇인가?',
      o: ['그 Pod가 떠 있는 노드의 kubelet', 'etcd', 'controller-manager'], a: 0,
      why: 'API server는 요청을 노드의 kubelet으로 넘기고, kubelet이 /var/log/pods 아래 파일을 읽어 흘려보낸다. 그래서 kubelet이 죽으면 로그도 못 본다.' },
    { q: '컨테이너 안에서 셸을 계속 쓰려면 exec에 붙여야 하는 옵션은 무엇인가?',
      o: ['-c', '--previous', '-it'], a: 2,
      why: '-i는 stdin을, -t는 터미널을 연다. 둘이 없으면 명령을 한 번 실행하고 바로 끝난다.' },
    { q: 'replicas 3인 Deployment의 이미지만 바꿔 apply하면, 기본 설정에서 새 v2 Pod는 처음에 몇 개 생기나?',
      o: ['3개가 한꺼번에', '1개', '0개, 옛 Pod부터 지운다'], a: 1,
      why: 'maxSurge 25%를 올림하면 1이라 Pod는 최대 4개까지만 둔다. 새 Pod 1개가 Ready가 되면 옛 Pod 하나를 줄이는 일을 세 번 되풀이한다.' },
    { q: 'kubectl delete pod 직후 kubelet이 컨테이너에 먼저 보내는 신호는 무엇인가?',
      o: ['SIGTERM', 'SIGKILL', '신호 없이 바로 지운다'], a: 0,
      why: '먼저 SIGTERM을 보내고 기본 30초를 기다린다. 그 안에 끝나지 않을 때만 SIGKILL로 강제로 끝낸다.' },
  ];

  const summary = [
    'get과 describe는 API server가 etcd에서 읽어 오는 일이라 노드까지 가지 않는다.',
    'logs와 exec는 노드의 kubelet까지 가야 해서 kubelet이 죽으면 둘 다 막힌다.',
    'apply는 원하는 상태를 etcd에 적을 뿐이고 Pod 교체는 컨트롤러가 한 개씩 한다.',
    'delete는 SIGTERM을 보내고 30초를 기다린 뒤에야 SIGKILL로 끝낸다.',
  ];
  const review = [
    { q: 'Pod가 자꾸 재시작하는데 kubectl logs로 본 지금 로그는 깨끗하다. 먼저 볼 것은?',
      o: ['kubectl get pods -o wide', 'logs --previous와 describe의 Last State', 'apply -f로 다시 배포'], a: 1,
      why: '재시작한 컨테이너의 현재 로그에는 사고 흔적이 없다. 죽기 직전 로그와 Last State의 Reason·Exit Code가 원인을 알려 준다.' },
    { q: '이미지를 바꿔 apply했더니 rollout status가 "1 old replicas are pending termination..."을 찍는다. 지금 상태는?',
      o: ['v2 Pod 3개가 만들어졌고 v1 Pod 1개가 아직 남아 있다', 'etcd 저장이 실패했다', 'v2 Pod가 하나도 만들어지지 않았다'], a: 0,
      why: '새 Pod가 replicas 수만큼 만들어진 뒤에 나오는 줄이다. 남은 v1 Pod 하나가 빠지면 successfully rolled out이 찍힌다.' },
    { q: 'kubectl delete pod를 할 때마다 처리 중이던 요청 몇 건이 실패한다. 먼저 고칠 곳은?',
      o: ['--force를 붙여 더 빨리 지운다', 'Event 보관 시간을 늘린다', '앱이 SIGTERM을 받으면 새 요청을 거절하고 남은 요청만 끝내게 한다'], a: 2,
      why: '쿠버네티스는 SIGTERM 뒤 30초를 준다. 그 사이 남은 요청을 마무리하도록 앱이 짜여 있어야 끊김 없이 내려간다.' },
  ];

  R.page({ title: 'kubectl 트래픽 경로', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
