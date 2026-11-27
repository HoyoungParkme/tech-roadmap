/* IV-2-2 Automation API — 코드에서 Pulumi 실행 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 테넌트 상태는 STEPS 의 tenants, 엔진 로그는 events, 돌려받은 값은 outputs 를 읽는다. 로그·이름 뒤의 임의 접미사는 예시다. */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, spans, tokens, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, person, cross, check, terminal, snippet, dbIcon } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function engine(cx, cy, o) { o = o || {}; const g = card(cx, cy, o.w || 170, o.h || 76, { rx: 12, fill: INK, stroke: 'none', s: o.s, op: o.op });
    tx(0, -6, 'Pulumi 엔진', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: PANEL }, g);
    tx(0, 18, o.sub || 'preview · up · destroy', { 'text-anchor': 'middle', 'font-size': 13.5, fill: OFF }, g); return g; }
  function stateFile(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-18,-24 L8,-24 L18,-14 L18,24 L-18,24 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    mono(0, 5, '{ }', { 'font-size': 13.5, 'text-anchor': 'middle', fill: c, 'font-weight': 700 }, g);
    if (name) mono(0, 44, name, { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.nameCol || INK, 'font-weight': 700 }, g); return g; }
  function folder(cx, cy, name, files, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    el('path', { d: 'M-110,-70 L-50,-70 L-38,-56 L110,-56 L110,70 L-110,70 Z', fill: WARNBG, stroke: WARN, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    mono(-96, -30, name, { 'font-size': 15, 'font-weight': 800 }, g);
    files.forEach((f, i) => mono(-84, 0 + i * 24, f, { 'font-size': 14, fill: f === 'Pulumi.yaml' ? ACC : INK, 'font-weight': f === 'Pulumi.yaml' ? 700 : 400 }, g)); return g; }
  function bucket(cx, cy, s, col, op) { const g = G(cx, cy, s, op); el('path', { d: 'M-18,-14 L18,-14 L13,16 L-13,16 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g); el('ellipse', { cx: 0, cy: -14, rx: 18, ry: 6, fill: PANEL, stroke: col || INK, 'stroke-width': 2.4 }, g); return g; }
  const ST = { deployed: GOOD, provisioning: INFO, queued: WARN };
  function tenantCard(cx, cy, t, o) { o = o || {}; const col = ST[t.status] || MUT, g = card(cx, cy, 200, 62, { rx: 10, stroke: col, sw: 2.2, s: o.s, op: o.op });
    tx(-86, -6, t.name, { 'font-size': 15.5, 'font-weight': 800 }, g); mono(-86, 18, t.status, { 'font-size': 13.5, fill: col, 'font-weight': 700 }, g); return g; }

  // ---------- 1. CLI 대신 함수 호출 ----------
  function s1(t, c) { const { k, u } = c, EX = 780, EY = 210;
    engine(EX, EY, { s: k === 0 ? pop(u, 0.2) : 1 });
    // 위: 사람 + 터미널
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1; person(70, 100, '사람', { s: s * 0.9 });
      terminal(120, 50, 330, 100, [['$ pulumi stack init dev', null], ['$ pulumi up', null]], k === 1 ? lerp(0, 2, E(u, 0.4, 1.4)) : 2, { title: '터미널', lh: 24 });
      grow(455, 100, EX - 90, EY - 30, k === 1 ? E(u, 1.5, 2.1) : 1, MUT); mono(600, 120, 'CLI', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.8) : 1 }); }
    // 아래: 앱 코드
    const appS = k === 0 ? pop(u, 0.5) : 1;
    el('rect', { x: 30, y: 230, width: 490, height: k >= 2 ? 150 : 110, rx: 10, fill: SOFT, stroke: ACC, 'stroke-width': 2, opacity: appS });
    tx(56, 256, '내 앱 (포털 · CI 도구)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: appS });
    spans(56, 290, tokens('import { LocalWorkspace, Stack }'), { 'font-size': 14, opacity: k === 0 ? fade(u, 0.9) : 1 });
    spans(56, 312, tokens('  from "@pulumi/pulumi/automation";'), { 'font-size': 14, opacity: k === 0 ? fade(u, 1.1) : 1 });
    if (k >= 2) { spans(56, 340, tokens('const stack = await LocalWorkspace.createOrSelectStack(…);'), { 'font-size': 13.5, opacity: k === 2 ? fade(u, 0.2) : 1 });
      spans(56, 364, tokens('const result = await stack.up();'), { 'font-size': 14, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.6) : 1 });
      grow(525, 330, EX - 90, EY + 30, k === 2 ? E(u, 0.9, 1.5) : 1, ACC); mono(600, 350, 'Automation API', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.2) : 1 });
      if (k === 2) dot([[525, 330], [EX - 90, EY + 30]], seg(u, 1.5, 2.3), ACC, 7); }
    if (k === 0) { sub(EX, EY + 70, '엔진이 라이브러리가 된다', fade(u, 1.6), { 'font-size': 15, fill: INK }); }
    if (k === 3) { fly(EX - 90, EY + 50, 640, 396, seg(u, 0.3, 1.3), 'summary · outputs', { mono: true, fill: GOOD, stay: true });
      sub(EX, EY + 74, '함수가 결과를 돌려준다', fade(u, 1.4), { 'font-size': 15, fill: INK });
      tx(EX, EY - 70, '같은 엔진', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { [['셀프서비스 포털', 0], ['SaaS 테넌트별 인프라', 1], ['커스텀 CI/CD', 2]].forEach(([s, i]) => pill(EX + 50, 300 + i * 40, s, ACC, pop(u, 0.3 + i * 0.4), { fs: 14.5 })); } }

  // ---------- 2. inline program vs local program ----------
  function s2(t, c) { const { k, u } = c, FX = 480, FY = 190;
    // 가운데 깔때기: createOrSelectStack
    const fs = k === 0 ? pop(u, 0.3) : 1, g = G(FX, FY, fs);
    el('path', { d: 'M-130,-44 L130,-44 L46,34 L46,58 L-46,58 L-46,34 Z', fill: INFOBG, stroke: INFO, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    mono(0, -22, 'LocalWorkspace', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 800, fill: INFO }, g);
    mono(0, -3, '.createOrSelectStack', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO }, g);
    if (k === 0) { sub(FX, 330, '무엇을 넘기느냐로 inline과 local이 갈린다', fade(u, 1.2), { 'font-size': 15, fill: INK }); return; }
    // 왼쪽: inline 함수
    const ins = k === 1 ? pop(u, 0.2) : 1;
    el('rect', { x: 20, y: 60, width: 300, height: 170, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: ins });
    mono(36, 88, 'const pulumiProgram = async () => {', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: ins });
    bucket(80, 140, ins); mono(110, 136, 'BucketV2 "data"', { 'font-size': 14, opacity: ins }); mono(110, 156, 'tags.managedBy', { 'font-size': 13.5, fill: MUT, opacity: ins });
    mono(36, 206, '  return { bucketName }  }', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.2) : 1 });
    if (k === 1) sub(170, 270, '리턴한 객체가 stack outputs', fade(u, 1.6), { 'font-size': 14.5, fill: INK });
    if (k >= 2) { grow(322, 150, FX - 112, FY - 20, k === 2 ? E(u, 0.2, 0.8) : 1, ACC); mono(330, 128, 'program:', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      card(250, 350, 220, 54, { rx: 10, stroke: ACC, text: 'inline-demo / dev', fs: 15, mono: true, s: k === 2 ? pop(u, 1.0) : 1 });
      grow(FX - 20, FY + 60, 330, 330, k === 2 ? E(u, 0.8, 1.3) : 1, ACC);
      if (k === 2) { card(170, 290, 180, 34, { rx: 8, stroke: OFF, dash: '5 4', text: 'Pulumi.yaml 폴더', fs: 13.5, color: OFF, s: pop(u, 1.6) });
        el('line', { x1: 86, y1: 290, x2: lerp(86, 254, E(u, 1.9, 2.3)), y2: 290, stroke: BAD, 'stroke-width': 3 }); } }
    // 오른쪽: local 폴더
    if (k >= 3) { folder(820, 120, './infra', ['Pulumi.yaml', 'index.ts', 'package.json'], { s: k === 3 ? pop(u, 0.2) : 1 });
      grow(708, 120, FX + 112, FY - 20, k === 3 ? E(u, 0.7, 1.2) : 1, WARN); mono(620, 132, 'workDir:', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
      card(720, 350, 220, 54, { rx: 10, stroke: WARN, text: 'dev (./infra)', fs: 15, mono: true, s: k === 3 ? pop(u, 1.4) : 1 });
      grow(FX + 20, FY + 60, 630, 330, k === 3 ? E(u, 1.2, 1.6) : 1, WARN); }
    if (k === 4) { pill(250, 400, '새 앱에 인프라를 넣을 때', ACC, pop(u, 0.4), { fs: 14 }); pill(720, 400, '이미 있는 프로젝트를 돌릴 때', WARN, pop(u, 0.9), { fs: 14 }); } }

  // ---------- 3. up() 과 이벤트 스트림 ----------
  function s3(t, c) { const { k, u } = c, EV = c.beat.events || [], OUT = c.beat.outputs || [];
    el('rect', { x: 20, y: 30, width: 330, height: 360, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(36, 56, 'deploy.ts', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    const CODE = ['const result = await', '  inlineStack.up({', '    onOutput: (msg) =>', '      portalUI.appendLog(msg),', '  });', 'result.summary', 'result.outputs.bucketName.value'];
    const HOT = [[0, 1], [2, 3], [5], [6], []][k];
    CODE.forEach((s, i) => { const y = 92 + i * 34 + (i >= 5 ? 20 : 0);
      if (HOT.includes(i)) el('rect', { x: 28, y: y - 22, width: 314, height: 32, rx: 6, fill: ACCBG });
      spans(40, y, tokens(s), { 'font-size': 14 }); });
    engine(470, 130, { w: 150, h: 70, sub: 'up 실행 중' });
    if (k === 0) { dot([[350, 92], [395, 130]], seg(u, 0.3, 1.0), ACC, 7); sub(465, 230, 'pulumi up을 친 것과 같다', fade(u, 1.2), { 'font-size': 14.5, fill: INK }); }
    // 오른쪽: 포털 화면
    el('rect', { x: 580, y: 30, width: 360, height: 360, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    tx(598, 58, '셀프서비스 포털', { 'font-size': 15, 'font-weight': 800 });
    const shown = k === 1 ? lerp(0, Math.min(2, EV.length), E(u, 0.4, 2.0)) : k > 1 ? EV.length : 0;
    EV.slice(0, Math.ceil(shown)).forEach((s, i) => { const op = clamp(shown - i); mono(596, 96 + i * 26, s.replace(/\s{2,}/g, ' '), { 'font-size': 13.5, fill: s.startsWith('Resources') ? GOOD : INK, 'font-weight': s.startsWith('Resources') ? 700 : 400, opacity: op }); });
    if (k === 1) EV.slice(0, 2).forEach((_, i) => dot([[545, 130], [590, 96 + i * 26]], seg(u, 0.4 + i * 0.6, 1.0 + i * 0.6), INFO, 6));
    if (k >= 1) { const prog = k === 1 ? E(u, 0.4, 2.2) * 0.8 : 1; el('rect', { x: 598, y: 200, width: 324, height: 12, rx: 6, fill: SOFT }); el('rect', { x: 598, y: 200, width: 324 * prog, height: 12, rx: 6, fill: prog >= 1 ? GOOD : INFO }); }
    if (k >= 2) { const s = k === 2 ? pop(u, 0.3) : 1; el('rect', { x: 380, y: 236, width: 180, height: 110, rx: 8, fill: GOODBG, stroke: GOOD, opacity: s });
      mono(392, 260, 'summary', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: s });
      mono(392, 286, 'result: succeeded', { 'font-size': 13.5, opacity: s }); mono(392, 310, 'resourceChanges:', { 'font-size': 13.5, opacity: s }); mono(392, 332, '  { create: 2 }', { 'font-size': 13.5, 'font-weight': 700, opacity: s }); }
    if (k === 2) sub(470, 380, 'Stack 리소스까지 2개 생성 (예시)', fade(u, 1.2), { 'font-size': 14, fill: INK });
    if (k >= 3 && OUT[0]) { const s = k === 3 ? E(u, 0.3, 1.2) : 1; fly(470, 230, 760, 270, k === 3 ? seg(u, 0.2, 1.0) : 0, OUT[0].value, { mono: true, fill: GOOD });
      if (s >= 1 || k > 3) { tx(598, 256, '내 버킷', { 'font-size': 14, fill: MUT }); mono(598, 284, OUT[0].value, { 'font-size': 16, 'font-weight': 800, fill: GOOD }); tx(598, 308, '(이름 뒤 접미사는 예시)', { 'font-size': 13.5, fill: MUT }); } }
    if (k === 4) { [['preview()', INFO, '미리보기만'], ['up()', GOOD, '배포'], ['destroy()', BAD, '정리']].forEach(([s, col, d], i) => {
        const x = 640 + i * 100, sc = pop(u, 0.3 + i * 0.35); card(x + 20, 350, 92, 36, { rx: 8, stroke: col, text: s, fs: 13.5, mono: true, color: col, s: sc }); tx(x + 20, 384, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: sc }); }); } }

  // ---------- 4. 테넌트별 stack ----------
  function s4(t, c) { const { k, u } = c, TN = c.beat.tenants || [], EV = c.beat.events || [], OUT = c.beat.outputs || [];
    TN.forEach((tn, i) => tenantCard(130 + i * 230, 50, tn, { s: tn.name === 'initech' && k === 1 ? pop(u, 0.5) : 1 }));
    // 한 프로세스 안에 express + automation
    el('rect', { x: 20, y: 110, width: 520, height: 150, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(36, 134, 'node 프로세스 하나', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    card(140, 190, 200, 64, { rx: 10, stroke: INK, text: 'express\nPOST /tenants/:id', fs: 14, s: k === 0 ? pop(u, 0.3) : 1 });
    card(400, 190, 200, 64, { rx: 10, stroke: ACC, text: 'Automation API\nLocalWorkspace', fs: 14, color: ACC, s: k === 0 ? pop(u, 0.8) : 1 });
    if (k === 0) { sub(280, 300, '앱 코드와 인프라 코드가 같은 런타임에 있다', fade(u, 1.4), { 'font-size': 15, fill: INK }); }
    if (k === 1) { fly(640, 50, 140, 160, seg(u, 0.6, 1.5), 'POST /tenants/initech', { mono: true, fill: INFO });
      mono(36, 290, 'tenantId = req.params.id  →  "initech"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 2) { [['`${tenantId}-data`', 'initech-data', 0], ['`${tenantId}-db`', 'initech-db', 1]].forEach(([a, b, i]) => { const y = 300 + i * 50, sw = E(u, 0.6 + i * 0.4, 1.2 + i * 0.4);
        mono(40, y, a, { 'font-size': 15, fill: MUT, opacity: 1 - sw * 0.6 }); grow(230, y - 5, 290, y - 5, sw, ACC); mono(300, y, b, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: sw }); });
      bucket(480, 296, pop(u, 1.3)); dbIcon(480, 360, null, { s: 0.45 * pop(u, 1.6) }); }
    // 오른쪽: 테넌트마다 state
    if (k >= 3) { ['tenant-acme-corp', 'tenant-globex', 'tenant-initech'].forEach((n, i) => { const y = 150 + i * 90, me = i === 2;
        stateFile(640, y, null, { stroke: me ? ACC : MUT, s: me && k === 3 ? pop(u, 0.4) : 1 }); mono(672, y + 5, n, { 'font-size': 14.5, 'font-weight': me ? 800 : 400, fill: me ? ACC : MUT }); });
      if (k === 3) sub(280, 320, 'stackName만 달라도 state가 완전히 나뉜다', fade(u, 1.2), { 'font-size': 15, fill: INK }); }
    if (k === 4) { const ev = EV.filter((s) => s.includes('initech')), n = k === 4 ? lerp(0, ev.length, E(u, 0.3, 1.8)) : ev.length;
      ev.slice(0, Math.ceil(n)).forEach((s, i) => mono(36, 300 + i * 26, s.replace(/\s{2,}/g, ' '), { 'font-size': 13.5, fill: s.includes('created') ? GOOD : INFO, opacity: clamp(n - i) })); }
    if (k === 4) sub(280, 380, 'HTTP 요청을 처리하는 도중에 배포가 돈다', fade(u, 2.0), { 'font-size': 15, fill: INK });
    if (k === 5 && OUT.length) { const s = pop(u, 0.4); el('rect', { x: 20, y: 290, width: 560, height: 118, rx: 10, fill: INK, opacity: s });
      mono(36, 316, 'res.json({', { 'font-size': 14, fill: PANEL, opacity: s });
      mono(52, 340, 'tenant: "initech",', { 'font-size': 14, fill: '#86efac', opacity: fade(u, 0.6) });
      OUT.forEach((o, i) => mono(52, 362 + i * 22, `${o.key}: "${o.value}",`, { 'font-size': 13.5, fill: '#86efac', opacity: fade(u, 0.9 + i * 0.3) })); } }

  // ---------- 5. 정리와 CLI 비교 ----------
  function s5(t, c) { const { k, u } = c, TN = c.beat.tenants || [], EV = c.beat.events || [];
    if (k <= 1) { const ALL = ['acme-corp', 'globex', 'initech'];
      pill(480, 40, 'DELETE /tenants/globex', BAD, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
      ALL.forEach((n, i) => { const x = 180 + i * 300, me = n === 'globex', gone = me && k === 1, fadeOut = gone ? 1 - E(u, 1.6, 2.4) : 1;
        if (fadeOut <= 0.02) { mono(x, 150, 'tenant-' + n, { 'font-size': 14.5, fill: OFF, 'text-anchor': 'middle', 'text-decoration': 'line-through' }); return; }
        stateFile(x, 110, null, { stroke: me ? BAD : MUT, op: fadeOut, s: me && k === 0 ? 1 + 0.1 * Math.sin(seg(u, 0.8, 1.4) * Math.PI) : 1 });
        mono(x, 160, 'tenant-' + n, { 'font-size': 14.5, 'font-weight': me ? 800 : 400, fill: me ? BAD : MUT, 'text-anchor': 'middle', opacity: fadeOut });
        // 리소스 두 개
        [0, 1].forEach((j) => { const rx = x - 40 + j * 80, ry = 240, rop = gone ? 1 - E(u, 0.3 + j * 0.5, 0.9 + j * 0.5) : 1;
          if (rop <= 0.02) { cross(rx, ry, 10, 1); return; }
          if (j === 0) bucket(rx, ry, 1, me ? BAD : INK, rop); else dbIcon(rx, ry + 4, null, { s: 0.4, stroke: me ? BAD : INK, op: rop }); });
        mono(x, 296, n + '-data · ' + n + '-db', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fadeOut }); });
      if (k === 0) { mono(480, 360, 'LocalWorkspace.selectStack({ stackName: "tenant-globex", … })', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) });
        sub(480, 395, '다른 테넌트는 건드리지 않는다', fade(u, 1.6), { 'font-size': 15, fill: INK }); }
      if (k === 1) { mono(480, 350, 'await stack.destroy()', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
        mono(480, 380, 'await stack.workspace.removeStack(stack.name)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
        sub(480, 408, '리소스를 지우고 state까지 정리한다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); }
      return; }
    // k2~4: 두 길, 같은 엔진
    const EX = 720, EY = 210;
    const lane = (y, who, how, when, col, s) => { person(60, y, null, { s: 0.7 * s, stroke: col }); tx(100, y - 8, who, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s });
      mono(100, y + 18, how, { 'font-size': 14, opacity: s }); tx(100, y + 42, when, { 'font-size': 14, fill: MUT, opacity: s }); };
    lane(110, '사람이', '$ pulumi up', '개발·운영 단계에서', INK, k === 2 ? pop(u, 0.2) : 1);
    lane(300, '앱이', 'await stack.up()', '런타임에, 제품 기능으로', ACC, k === 2 ? pop(u, 0.8) : 1);
    if (k >= 3) { engine(EX, EY, { s: k === 3 ? pop(u, 0.2) : 1 }); grow(330, 120, EX - 90, EY - 20, k === 3 ? E(u, 0.5, 1.0) : 1, MUT); grow(330, 310, EX - 90, EY + 20, k === 3 ? E(u, 0.8, 1.3) : 1, ACC);
      stateFile(EX, EY + 110, '같은 state', { stroke: INFO, s: k === 3 ? pop(u, 1.4) : 1, nameCol: INFO }); }
    if (k === 3) sub(EX, 60, '바뀐 것은 호출 경로뿐', fade(u, 1.8), { 'font-size': 15, fill: INK });
    if (k === 4) banner(EX, 60, '인프라 생성이 제품 기능이 된다', pop(u, 0.3)); }

  const quiz = [
    { q: 'Automation API로 바뀌는 것은 무엇인가?',
      o: ['Pulumi 엔진과 state 형식', 'preview·up을 실행하는 주체가 사람에서 앱 코드로', '리소스를 만드는 클라우드 API'], a: 1,
      why: '@pulumi/pulumi/automation이 CLI 동작을 함수로 내준다. pulumi up 한 줄이 await stack.up() 한 줄이 된다.' },
    { q: 'inline program으로 stack을 만들 때 필요 없는 것은 무엇인가?',
      o: ['Pulumi.yaml이 있는 프로젝트 폴더', 'LocalWorkspace', 'stackName'], a: 0,
      why: 'program 필드에 함수를 그대로 넘기면 폴더 없이 stack이 생긴다. 기존 폴더를 쓰려면 workDir을 넘기는 local program이다.' },
    { q: 'stack.up()이 끝난 뒤 export 한 값은 어디서 꺼내나?',
      o: ['onOutput 콜백의 마지막 줄', 'result.summary.resourceChanges', 'result.outputs'], a: 2,
      why: 'inline program이 return 한 객체가 result.outputs로 돌아온다. summary에는 변경 개수와 시각이 담긴다.' },
    { q: '테넌트마다 state를 나누려고 핸들러가 다르게 주는 값은 무엇인가?',
      o: ['projectName', 'stackName (tenant-${tenantId})', 'onOutput'], a: 1,
      why: '같은 프로젝트 saas-tenants 안에서 stackName이 다르면 state가 따로 생긴다. 그래서 테넌트 하나를 고쳐도 다른 테넌트는 그대로다.' },
    { q: 'globex가 탈퇴할 때 리소스와 state를 모두 정리하는 호출은 무엇인가?',
      o: ['stack.destroy() 다음 workspace.removeStack()', 'stack.preview()', 'createOrSelectStack()을 다시 부르기'], a: 0,
      why: 'destroy()가 globex의 버킷과 DB를 지우고, removeStack()이 tenant-globex state를 없앤다.' },
  ];

  const summary = [
    'CLI는 사람이 터미널 앞에 있어야 해서 가입 버튼 하나로 인프라를 내주는 제품을 만들기 어렵다.',
    'Automation API는 preview·up·destroy를 함수로 내준다. 엔진과 state는 CLI와 같다.',
    'inline program은 인프라를 함수로 넘기고, local program은 workDir로 기존 폴더를 가리킨다.',
    '테넌트마다 stackName을 달리 주면 state가 나뉘고, up이 돌려준 outputs를 그대로 응답한다.',
  ];
  const review = [
    { q: '가입 API가 자꾸 타임아웃 난다. 핸들러 안에서 RDS를 만드는 stack.up()을 await하고 있었다. 먼저 의심할 것은?',
      o: ['up()이 끝날 때까지 HTTP 응답이 기다린다', 'stackName이 테넌트마다 같다', 'onOutput 콜백이 로그를 너무 많이 찍는다'], a: 0,
      why: 'up()은 리소스가 다 만들어져야 돌아온다. 오래 걸리는 배포는 작업 큐로 넘기고 진행 상황을 onOutput 로그로 보여 주는 편이 낫다.' },
    { q: '테넌트 둘이 같은 stackName을 쓰도록 실수했다. 어떤 일이 생기나?',
      o: ['Pulumi가 자동으로 이름 뒤에 번호를 붙여 나눈다', '한 state를 같이 써서 앞 테넌트 리소스가 지워진다', '두 번째 up이 이름 충돌로 실패하고 아무것도 안 바뀐다'], a: 1,
      why: 'state는 stack 단위다. 같은 stack에 다른 프로그램을 up 하면 엔진은 state와 비교해 없는 리소스를 지우는 계획을 세운다.' },
    { q: '이미 Pulumi.yaml이 있는 infra 폴더를 사내 배포 도구에서 그대로 돌리고 싶다. 무엇을 넘기나?',
      o: ['program에 새 함수', 'stack.destroy()', 'workDir: "./infra"'], a: 2,
      why: 'local program은 workDir로 기존 프로젝트를 가리킨다. 프로그램 코드를 옮겨 적을 필요가 없다.' },
  ];

  R.page({ title: 'Automation API', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
