/* II-2-2 Multi-Language Component — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * gen-sdk 의 --language 값(nodejs|python|go|dotnet|java|all)과 --out 기본값(./sdk), schema 의 type token 꼴,
 * pulumi package add 로 로컬 SDK 를 만드는 길은 pulumi.com/docs (CLI · Components) 로 확인했다.
 * appStack.ts 는 tsc --noEmit(@pulumi/aws 6, @pulumi/awsx 2)으로 확인했고 container 에 필수인 name 을 넣었다.
 * pulumi CLI 가 없어 get-schema·gen-sdk·up 출력은 예시다. Go·C# 호출 모양은 Pulumi 코드 생성 관례(pulumi.Int, PascalCase)를 따른 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const LANG = { TypeScript: INFO, Python: WARN, Go: GOOD, 'C#': ACC };
  // 파일 아이콘
  function fileIc(cx, cy, label, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op), col = o.col || INK;
    el('path', { d: 'M-20,-26 H10 L22,-14 V26 H-20 Z', fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash }, g);
    el('path', { d: 'M10,-26 V-14 H22', fill: 'none', stroke: col, 'stroke-width': 2 }, g);
    if (o.tag) mono(1, 6, o.tag, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    if (label) mono(0, 46, label, { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.lcol || INK, 'font-weight': 700 }, g); }

  // ---------- 1. 왜 MLC 인가 ----------
  const TEAMS = [['플랫폼팀', 'TypeScript'], ['결제 앱팀', 'Python'], ['검색 앱팀', 'Go'], ['백오피스팀', 'C#']];
  const TXs = [120, 360, 600, 840];
  function teams(u, k, o) { o = o || {};
    TEAMS.forEach(([n, l], i) => { const s = k === 0 ? pop(u, 0.2 + i * 0.3) : 1, x = TXs[i], y = o.y || 90;
      person(x - 50, y, null, { s: s * 0.8, stroke: LANG[l] });
      tx(x - 18, y - 6, n, { 'font-size': 15, 'font-weight': 700, opacity: Math.min(1, s) });
      mono(x - 18, y + 16, l, { 'font-size': 14, 'font-weight': 800, fill: LANG[l], opacity: Math.min(1, s) }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { teams(u, k);
      if (k === 0) note(480, 220, '표준은 하나인데 쓰는 언어는 넷', fade(u, 1.6), { 'text-anchor': 'middle', 'font-size': 17 });
      if (k === 1) { card(120, 220, 200, 50, { rx: 10, stroke: INFO, text: 'npm 패키지 (TS)', fs: 15, s: pop(u, 0.2) });
        TXs.forEach((x, i) => { if (i === 0) { grow(120, 196, 120, 132, seg(u, 0.5, 0.9), INFO); return; }
          grow(220, 220, x - 30, 220, seg(u, 0.6 + i * 0.2, 1.0 + i * 0.2), BAD, { dash: '6 5', plain: true }); cross(x - 18, 220, 12, pop(u, 1.0 + i * 0.2));
          card(x, 320, 170, 48, { rx: 10, stroke: BAD, dash: '5 4', text: '복붙 재구현', fs: 14, color: BAD, s: pop(u, 1.5 + i * 0.2) }); });
        note(120, 300, 'TS·JS에서만', fade(u, 1.0), { 'text-anchor': 'middle', fill: INFO });
        note(600, 392, '언어마다 따로 고치다 표준이 갈라진다', fade(u, 2.2), { 'text-anchor': 'middle', fill: BAD }); }
      return; }
    if (k === 2) { teams(u, 3, { y: 60 });
      snippet(240, 140, ['import my_org_platform as platform', 'stack = platform.AppStack("payments", cpu=512)'], { fs: 15, op: fade(u, 0.3) });
      grow(360, 82, 300, 136, seg(u, 0.2, 0.6), WARN);
      note(480, 300, '같은 AppStack을 Python 문법 그대로', fade(u, 1.2), { 'text-anchor': 'middle', 'font-size': 17 });
      sub(480, 330, '언어별 재구현이 아니라 한 구현을 각 언어로 쓴다', fade(u, 1.6));
      return; }
    // k3: 세 단계 길
    const ST = [['TS 컴포넌트', 'AppStack.ts', INFO], ['Pulumi Package', 'schema.json', INK], ['언어별 SDK', 'Python · Go · C#', ACC]];
    ST.forEach(([a, b, col], i) => { const x = 160 + i * 320, s = pop(u, 0.2 + i * 0.5);
      card(x, 190, 240, 96, { rx: 14, stroke: col, sw: 2.5, s, fill: PANEL });
      tx(x, 182, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.5) });
      mono(x, 210, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) });
      if (i < 2) grow(x + 124, 190, x + 196, 190, seg(u, 0.6 + i * 0.5, 0.9 + i * 0.5), ACC); });
    banner(480, 330, '한 번 만들고, 어느 언어에서든 import', pop(u, 1.9)); }

  // ---------- 2. appStack.ts ----------
  const ARGS = [['cpu', 'Input<number>'], ['memory', 'Input<number>'], ['image', 'Input<string>'], ['replicas?', 'Input<number>']];
  function s2(t, c) { const { k, u } = c;
    tx(30, 50, 'interface AppStackArgs', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    ARGS.forEach(([a, ty], i) => { const y = 66 + i * 42, w = k === 0 ? seg(u, 0.3 + i * 0.3, 0.9 + i * 0.3) : 1; if (w <= 0) return;
      const hot = k === 4;
      el('rect', { x: 30, y, width: 260 * w, height: 34, rx: 6, fill: hot ? WARNBG : PANEL, stroke: GRID, 'stroke-width': 1.2 });
      mono(42, y + 23, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(w, 0.6, 0.4) }); mono(278, y + 23, ty, { 'font-size': 14, fill: INFO, 'text-anchor': 'end', opacity: fade(w, 0.6, 0.4) }); });
    if (k === 0) { note(160, 270, '이 인터페이스가 그대로 schema가 된다', fade(u, 1.8), { 'text-anchor': 'middle', fill: INFO }); return; }
    // 컴포넌트 상자
    const bop = k === 1 ? fade(u, 0.2) : 1;
    zone(330, 40, 380, 340, null, { fill: ACCBG, stroke: ACC, op: bop });
    mono(346, 66, 'class AppStack extends ComponentResource', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, opacity: bop });
    // type token
    if (k >= 2) { const op = k === 2 ? fade(u, 0.3) : 1;
      card(520, 102, 340, 34, { rx: 8, stroke: ACC, fill: PANEL, op });
      R.spans(370, 107, [['my-org-platform', { fill: ACC, 'font-weight': 800 }], [':', {}], ['index', { 'font-weight': 700 }], [':', {}], ['AppStack', { fill: INFO, 'font-weight': 800 }]], { 'font-size': 14.5, opacity: op });
      if (k === 2) [['패키지', 435], ['모듈', 540], ['타입', 615]].forEach(([s, x], i) => sub(x, 138, s, fade(u, 0.8 + i * 0.25), { 'font-weight': 700 })); }
    // 자식
    if (k >= 3) [['aws.ecs.Cluster', '-cl'], ['awsx.lb.ApplicationLoadBalancer', '-lb']].forEach(([ty, sfx], i) => {
      card(520, 178 + i * 52, 340, 42, { rx: 8, text: ty, fs: 14, mono: true, s: k === 3 ? pop(u, 0.3 + i * 0.3) : 1 }); });
    if (k === 3) sub(520, 300, 'parent: this로 상자 안에 감춘다', fade(u, 1.2), { 'font-weight': 700, fill: ACC });
    if (k >= 4) { card(520, 300, 340, 66, { rx: 8, stroke: k === 4 ? WARN : INK, sw: 2, text: 'awsx.ecs.FargateService\ndesiredCount: replicas ?? 2', fs: 14, mono: true, s: k === 4 ? pop(u, 0.2) : 1 });
      if (k === 4) ARGS.forEach((_, i) => dot([[290, 83 + i * 42], [350, 300]], seg(u, 0.6 + i * 0.25, 1.2 + i * 0.25), WARN, 6)); }
    if (k === 4) note(160, 270, '입력이 컨테이너 설정으로 흐른다', fade(u, 1.6), { 'text-anchor': 'middle', fill: WARN });
    if (k === 5) { grow(690, 230, 760, 160, seg(u, 0.2, 0.7), ACC);
      pill(840, 140, 'this.url', ACC, pop(u, 0.6), { mono: true, fs: 15, fill: PANEL });
      mono(840, 186, 'lb.loadBalancer.dnsName', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      pill(830, 250, 'registerOutputs({ url })', ACC, pop(u, 1.2), { mono: true, fs: 13.5, fill: ACCBG });
      note(830, 310, '등록한 url만', fade(u, 1.7), { 'text-anchor': 'middle' }); note(830, 334, '다른 언어에 보인다', fade(u, 1.8), { 'text-anchor': 'middle' }); } }

  // ---------- 3. schema.json ----------
  const SL = ['{', '  "name": "my-org-platform",', '  "version": "1.0.0",', '  "resources": {', '    "my-org-platform:index:AppStack": {', '      "isComponent": true,',
    '      "inputProperties": {', '        "cpu":      { "type": "integer" },', '        "memory":   { "type": "integer" },', '        "image":    { "type": "string" },', '        "replicas": { "type": "integer" } },',
    '      "requiredInputs": ["cpu", "memory", "image"],', '      "properties": { "url": { "type": "string" } },', '      "required": ["url"] } },',
    '  "language": {', '    "python": { "packageName": "my_org_platform" },', '    "go": { "importBasePath": "github.com/my-org/platform/sdk/go" },', '    "csharp": { "rootNamespace": "MyOrg.Platform" } } }'];
  const UPTO = [3, 6, 12, 14, 18], HOT = [[1, 2], [4, 5], [7, 8, 9, 10, 11], [12, 13], [15, 16, 17]];
  const DX = 320, DY = 30, LH = 21;
  function s3(t, c) { const { k, u } = c, n = UPTO[k], prevN = k ? UPTO[k - 1] : 0;
    el('rect', { x: DX - 10, y: DY - 18, width: 640, height: LH * 18 + 20, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    SL.forEach((s, i) => { if (i >= n) return; const op = i >= prevN ? fade(u, 0.2 + (i - prevN) * 0.15) : 1, hot = HOT[k].includes(i);
      if (hot) el('rect', { x: DX - 4, y: DY + i * LH - 15, width: 628, height: LH, rx: 4, fill: ACCBG, opacity: op });
      mono(DX + 4, DY + i * LH, s, { 'font-size': 13.5, opacity: op, fill: hot ? ACC : INK, 'font-weight': hot ? 700 : 400 }); });
    // 왼쪽: 어디서 왔나
    if (k === 0) { pill(150, 80, '$ pulumi package get-schema', INK, pop(u, 0.2), { mono: true, fs: 13.5, fill: PANEL });
      fileIc(150, 190, 'provider (TS 컴포넌트)', { s: pop(u, 0.5), col: INFO, tag: 'TS' }); grow(200, 120, 300, 60, seg(u, 0.9, 1.4), ACC); }
    if (k === 1) { mono(20, 90, 'super(', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.2) }); mono(20, 112, '"my-org-platform:index:AppStack"', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.3) });
      grow(240, 125, DX - 6, DY + 4 * LH - 5, seg(u, 0.6, 1.2), ACC); note(20, 180, 'type token이 key가 된다', fade(u, 1.2), { fill: ACC }); }
    if (k === 2) { const M = [['cpu: Input<number>', 'integer'], ['memory: Input<number>', 'integer'], ['image: Input<string>', 'string'], ['replicas?: Input<number>', 'integer']];
      M.forEach(([a, b], i) => { const y = DY + (7 + i) * LH - 5; mono(20, y + 5, a, { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.3 + i * 0.25) });
        grow(222, y, DX - 6, y, seg(u, 0.5 + i * 0.25, 0.9 + i * 0.25), ACC, { sw: 1.8 }); });
      note(20, DY + 11 * LH + 40, '? 가 붙은 replicas는', fade(u, 1.6), { fill: WARN }); note(20, DY + 11 * LH + 62, 'requiredInputs에 없다', fade(u, 1.7), { fill: WARN }); }
    if (k === 3) { mono(20, DY + 12 * LH, 'registerOutputs({ url })', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.2) });
      grow(222, DY + 12 * LH - 5, DX - 6, DY + 12 * LH - 5, seg(u, 0.5, 1.0), ACC); note(20, DY + 14 * LH + 10, '등록 안 한 값은 계약서에도 없다', fade(u, 1.2), { fill: ACC }); }
    if (k === 4) [['Python', 'my_org_platform'], ['Go', '…/platform/sdk/go'], ['C#', 'MyOrg.Platform']].forEach(([l, nm], i) => {
      const y = 250 + i * 40; pill(150, y, l + ' · ' + nm, LANG[l], pop(u, 0.4 + i * 0.3), { mono: true, fs: 13.5, fill: PANEL });
      grow(150 + (tw(l + ' · ' + nm, 13.5) + 26) / 2 + 4, y, DX - 6, DY + (15 + i) * LH - 5, seg(u, 0.7 + i * 0.3, 1.1 + i * 0.3), LANG[l], { sw: 1.8 }); }); }

  // ---------- 4. gen-sdk ----------
  const SDK = [['Python', 'sdk/python', 'my_org_platform', 'AppStack("payments", cpu=512)', 'PyPI (사내)'],
    ['Go', 'sdk/go', '…/platform/sdk/go', '&AppStackArgs{Cpu: pulumi.Int(512)}', 'git tag sdk/v1.0.0'],
    ['C#', 'sdk/dotnet', 'MyOrg.Platform', 'new AppStackArgs { Cpu = 512 }', 'NuGet (사내)']];
  function s4(t, c) { const { k, u } = c;
    const src = k === 4 ? 1 : 0.85, edit = k === 3 ? Math.max(0, Math.sin(seg(u, 0.1, 0.9) * Math.PI)) : 0;
    fileIc(70, 130, 'AppStack.ts', { col: INFO, tag: 'TS', fill: k === 4 ? INFOBG : PANEL, s: 1 + edit * 0.15 });
    grow(100, 130, 150, 130, 1, MUT);
    fileIc(190, 130, 'schema.json', { tag: '{ }' });
    // 생성기
    const on = k === 0 || k === 3;
    card(330, 130, 120, 70, { rx: 12, fill: on ? INK : SOFT, stroke: on ? INK : GRID, text: 'gen-sdk', fs: 16, color: on ? PANEL : INK, mono: true });
    grow(220, 130, 268, 130, 1, MUT);
    if (k === 0) ['python', 'go', 'dotnet'].forEach((l, i) => mono(30, 250 + i * 26, '$ pulumi package gen-sdk ./schema.json --language ' + l, { 'font-size': 13.5, opacity: fade(u, 0.3 + i * 0.35), fill: l === 'dotnet' ? ACC : INK }));
    if (k === 0) sub(240, 346, 'C# 는 --language dotnet', fade(u, 1.6), { 'font-weight': 700, fill: ACC });
    // SDK 세 개
    SDK.forEach(([l, dir, pkg, call, reg], i) => { const y = 70 + i * 120, col = LANG[l];
      if (k === 0) return;
      const s = k === 1 ? pop(u, 0.4 + i * 0.3) : 1;
      if (k === 1 || k === 3) dot([[390, 130], [470, y + 20]], seg(u, 0.1 + i * 0.3, 0.6 + i * 0.3), col, 6);
      card(640, y + 20, 330, 92, { rx: 10, stroke: col, sw: 2, dash: k === 4 ? '6 4' : null, s, fill: PANEL });
      if (s <= 0.3) return;
      mono(486, y + 2, dir + '/', { 'font-size': 14.5, 'font-weight': 800, fill: col }); mono(794, y + 2, pkg, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      mono(486, y + 28, call, { 'font-size': 13.5 });
      if (k === 3) mono(794, y + 52, '다시 생성', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.3) });
      if (k === 2) { grow(806, y + 20, 830, y + 20, seg(u, 0.3 + i * 0.3, 0.6 + i * 0.3), col); pill(890, y + 20, reg.split(' ')[0], col, pop(u, 0.6 + i * 0.3), { fs: 13.5, fill: PANEL }); sub(890, y + 50, reg.split(' ').slice(1).join(' '), fade(u, 0.8 + i * 0.3)); } });
    if (k === 1) note(240, 300, '손으로 쓴 wrapper 0개', fade(u, 1.6), { 'text-anchor': 'middle', fill: GOOD });
    if (k === 1) sub(240, 326, '같은 cpu가 언어마다 관용 표현으로', fade(u, 1.9));
    if (k === 2) note(240, 300, '앱팀에게는 평범한 사내 라이브러리', fade(u, 1.4), { 'text-anchor': 'middle' });
    if (k === 3) { note(240, 300, 'AppStack.ts를 고치면', fade(u, 0.4), { 'text-anchor': 'middle', fill: WARN }); note(240, 326, 'gen-sdk만 다시 · 앱팀은 버전만 올림', fade(u, 1.2), { 'text-anchor': 'middle' }); }
    if (k === 4) { note(240, 300, '원본은 TS 하나', fade(u, 0.4), { 'text-anchor': 'middle', fill: INFO, 'font-size': 17 }); sub(240, 328, '점선 SDK는 생성물 · 손대지 않는다', fade(u, 1.0)); } }

  // ---------- 5. Python 앱팀이 쓴다 ----------
  const PV = [['cpu', 512], ['memory', 1024], ['replicas', 3]];
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) {
      terminal(30, 30, 420, 120, ['$ pip install my-org-platform', ['import my_org_platform as platform', 'var(--term)']], k === 0 ? lerp(0.2, 2, E(u, 0.2, 1.4)) : 2, { title: '결제 앱팀 · Python', fs: 14, lh: 26 });
      if (k === 0) note(240, 200, '내부가 TS 인지 몰라도 된다', fade(u, 1.6), { 'text-anchor': 'middle' });
      if (k >= 1) { snippet(30, 180, ['app = platform.AppStack("payments",', '    cpu=512, memory=1024,', '    image="…/payments:v3", replicas=3)'], { fs: 14.5, op: k === 1 ? fade(u, 0.2) : 1 });
        // 값이 args 칸으로
        tx(560, 50, 'AppStackArgs (schema 타입 힌트)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
        PV.forEach(([a, v], i) => { const y = 70 + i * 46, fill = k === 1 ? seg(u, 0.6 + i * 0.3, 1.1 + i * 0.3) : 1;
          el('rect', { x: 560, y, width: 360, height: 38, rx: 7, fill: PANEL, stroke: GRID, 'stroke-width': 1.2 });
          mono(574, y + 25, a + ': int', { 'font-size': 14.5, fill: MUT });
          mono(904, y + 25, String(Math.round(v * fill)), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: WARN, opacity: fill > 0 ? 1 : 0 }); }); }
      if (k === 2) { pill(740, 270, 'app.url', ACC, pop(u, 0.3), { mono: true, fs: 15, fill: PANEL });
        sub(740, 300, 'TS의 registerOutputs({ url })', fade(u, 0.6));
        grow(740, 312, 740, 340, seg(u, 0.9, 1.2), ACC);
        pill(740, 360, 'pulumi.export("payments_url", app.url)', ACC, pop(u, 1.2), { mono: true, fs: 13.5, fill: ACCBG }); }
      return; }
    if (k === 3) {
      // 세 층: 언어 호스트 → 엔진 → component provider
      const L = [['언어 호스트', 'python __main__.py', WARN], ['Pulumi 엔진', 'preview · state', INK], ['component provider', 'TS 구현 (nodejs)', INFO]];
      L.forEach(([a, b, col], i) => { const x = 130 + i * 230, s = pop(u, 0.1 + i * 0.3);
        card(x, 80, 200, 70, { rx: 12, stroke: col, sw: 2.5, s, fill: PANEL });
        tx(x, 74, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + i * 0.3) });
        mono(x, 98, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) });
        if (i < 2) dot([[x + 100, 80], [x + 130, 80]], seg(u, 0.5 + i * 0.4, 0.9 + i * 0.4), ACC, 6); });
      terminal(30, 150, 900, 160, [['+ my-org-platform:index:AppStack     payments      create', 'var(--term)'], '+ ├─ aws:ecs:Cluster                 payments-cl   create', '+ ├─ awsx:lb:ApplicationLoadBalancer payments-lb   create', '+ └─ awsx:ecs:FargateService         payments-svc  create'],
        lerp(0.2, 4, E(u, 1.0, 2.2)), { title: 'pulumi up (예시 · 일부만)', fs: 14, lh: 26 });
      note(480, 350, '호출은 Python, 리소스 정의는 TS 한 곳', fade(u, 2.2), { 'text-anchor': 'middle', 'font-size': 16 });
      return; }
    // k4: 모든 팀이 같은 AppStack
    card(480, 320, 300, 70, { rx: 12, stroke: INFO, sw: 2.5, fill: INFOBG, text: 'AppStack 구현 (TS) 하나', fs: 16, color: INFO, s: pop(u, 0.2) });
    [['Python', 'platform.AppStack("payments", cpu=512)'], ['Go', 'platform.NewAppStack(ctx, "search", …)'], ['C#', 'new AppStack("backoffice", …)']].forEach(([l, s], i) => {
      const x = 170 + i * 310, sc = pop(u, 0.4 + i * 0.3);
      card(x, 110, 290, 76, { rx: 10, stroke: LANG[l], sw: 2, s: sc, fill: PANEL });
      mono(x - 132, 98, l, { 'font-size': 15, 'font-weight': 800, fill: LANG[l], opacity: fade(u, 0.5 + i * 0.3) });
      mono(x - 132, 124, s, { 'font-size': 13, fill: INK, opacity: fade(u, 0.5 + i * 0.3) });
      grow(x, 150, lerp(x, 480, 0.6), 284, seg(u, 0.9 + i * 0.25, 1.4 + i * 0.25), LANG[l]); });
    sub(480, 400, '언어별 재구현 없이 표준은 한 곳에서', fade(u, 1.9), { 'font-weight': 700 }); }

  const quiz = [
    { q: '플랫폼팀이 TS로 만든 ComponentResource를 npm 패키지로만 내면 무엇이 막히는가?',
      o: ['TS 프로젝트에서도 import 할 수 없다', 'Python·Go·C# 팀은 그대로 쓰지 못해 따로 다시 짠다', '컴포넌트 안의 리소스가 만들어지지 않는다'], a: 1,
      why: 'npm 패키지는 같은 언어(TS·JS) 안에서만 재사용된다. 다른 언어 팀은 복붙 재구현을 하게 되고 표준이 갈라진다.' },
    { q: 'super("my-org-platform:index:AppStack", …)의 문자열은 MLC에서 무슨 역할을 하는가?',
      o: ['모든 언어가 같은 컴포넌트를 가리키는 type token', 'ECS 클러스터 이름', 'Python 패키지 설치 경로'], a: 0,
      why: '"<패키지>:<모듈>:<타입>" 꼴의 type token이 schema의 key가 되고 언어 간 매핑의 기준점이 된다.' },
    { q: 'registerOutputs에 넣지 않은 내부 값(예: cluster.arn)은 schema와 다른 언어에서 어떻게 보이는가?',
      o: ['properties에 자동으로 추가된다', 'Python에서만 보인다', 'schema에도, 다른 언어에도 보이지 않는다'], a: 2,
      why: 'schema의 properties는 등록한 출력(url)만 담는다. 계약서에 없는 값은 SDK에도 생기지 않는다.' },
    { q: 'schema.json 하나로 C# SDK를 만들 때 gen-sdk의 --language 값은 무엇인가?',
      o: ['csharp', 'dotnet', 'nuget'], a: 1,
      why: 'gen-sdk의 --language는 nodejs·python·go·dotnet·java·all 중 하나다. C# 은 dotnet으로 고른다.' },
    { q: 'Python 앱팀이 pulumi up 하면 실제 Cluster·ALB·Fargate 정의는 어디서 실행되는가?',
      o: ['Python SDK 안에 복사된 코드', '앱팀이 새로 쓴 Python 클래스', '엔진이 부르는 component provider의 TS 구현'], a: 2,
      why: 'Python은 AppStack을 부르기만 한다. 엔진이 component provider를 호출해 TS로 정의된 리소스를 만든다.' },
  ];

  const summary = [
    'TS로 만든 컴포넌트를 npm으로만 내면 Python·Go·C# 팀은 같은 표준을 다시 짜야 한다.',
    'MLC도 평범한 ComponentResource다. 입력 타입과 registerOutputs로 연 값이 계약이 된다.',
    'type token을 key로 한 schema.json에서 gen-sdk가 언어별 SDK를 만든다. C#은 dotnet이다.',
    '앱팀은 생성된 SDK를 import해 쓰고, 실제 리소스는 component provider의 TS 구현이 만든다.',
  ];
  const review = [
    { q: 'Python 팀이 app.url은 쓰는데 app.cluster_arn은 없다고 한다. 먼저 고칠 곳은?',
      o: ['Python SDK 파일에 cluster_arn을 직접 추가한다', 'TS 컴포넌트에서 출력으로 등록하고 schema·SDK를 다시 만든다', 'pulumi up을 한 번 더 돌린다'], a: 1,
      why: 'SDK는 schema에서 생성된다. 원본인 TS 컴포넌트에 출력을 열고 schema와 gen-sdk를 다시 돌려야 모든 언어에 생긴다.' },
    { q: 'Go 팀만 생성된 SDK를 손으로 고쳐 쓰다가 다음 gen-sdk 뒤 수정이 사라졌다. 왜인가?',
      o: ['언어별 SDK는 생성물이라 다시 만들면 덮어쓰인다', 'Go는 MLC를 지원하지 않아서', 'schema.json이 지워져서'], a: 0,
      why: '원본은 TS 컴포넌트 하나다. 고칠 것은 TS 쪽에서 고치고 gen-sdk로 전 언어를 다시 만든다.' },
    { q: 'schema의 requiredInputs가 ["cpu", "memory", "image"]다. Python 팀이 replicas를 빼고 호출하면?',
      o: ['필수 입력이 빠져 호출이 막힌다', 'image도 선택 입력으로 바뀐다', '선택 입력이라 호출되고, TS 구현의 replicas ?? 2가 쓰인다'], a: 2,
      why: 'replicas는 ? 가 붙어 requiredInputs에 없다. 값이 없으면 TS 쪽 기본값 2로 FargateService를 만든다.' },
  ];

  R.page({ title: '한 컴포넌트, 여러 언어', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
