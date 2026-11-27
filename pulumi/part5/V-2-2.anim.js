/* V-2-2 brownfield import — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, lock, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 세 구역: 실제 AWS · Pulumi state · 코드 ----------
  const RY = [118, 212, 306], AX = 110, SX = 470, CXL = 650;
  const NAMES = ['legacy-uploads-2019', 'prod-mysql-main', 'web-sg'], LOGI = ['legacyUploads', 'prodMysqlMain', 'webSg'];
  function glyph(i, x, y, col, s, o) { o = o || {}; if (s <= 0) return; const g = R.G(x, y, s, o.op), c = col || INK, dash = o.dash;
    if (i === 0) { el('path', { d: 'M-24,-16 L-18,20 Q0,26 18,20 L24,-16', fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-dasharray': dash }, g); el('ellipse', { cx: 0, cy: -16, rx: 24, ry: 7, fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-dasharray': dash }, g); }
    else if (i === 1) { el('path', { d: 'M-22,-14 V16 A22,7 0 0 0 22,16 V-14', fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-dasharray': dash }, g); el('ellipse', { cx: 0, cy: -14, rx: 22, ry: 7, fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-dasharray': dash }, g); el('path', { d: 'M-22,1 A22,7 0 0 0 22,1', fill: 'none', stroke: c, 'stroke-width': 1.5 }, g); }
    else { el('path', { d: 'M0,-22 L20,-14 V2 Q20,16 0,24 Q-20,16 -20,2 V-14 Z', fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-dasharray': dash }, g); } }
  // 실제 AWS 구역
  function aws(c, o) { o = o || {}; const res = c.beat.resources;
    zone(16, 16, 290, 388, '실제 AWS 계정', { fill: SOFT });
    res.forEach((r, i) => { const s = o.show ? o.show(i) : 1; if (s <= 0) return; const ph = r.phase, col = ph === 'verified' ? GOOD : ph === 'importing' ? ACC : ph === 'imported' ? INFO : INK;
      glyph(i, 60, RY[i], col, s); mono(96, RY[i] - 4, r.label, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: s });
      tx(96, RY[i] + 18, r.kind + (ph === 'console' ? ' · 콘솔 생성' : ''), { 'font-size': 13.5, fill: MUT, opacity: s });
      if (ph === 'importing') el('circle', { cx: 60, cy: RY[i], r: 32 + 6 * Math.sin(c.u * 6), fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: 0.6 }); }); }
  // state 구역: 칸 세 개, 등록 수는 앞 beat 값에서 이어진다
  function state(c, o) { o = o || {}; const res = c.beat.resources, p = c.prev || c.beat, n = Math.round(tween(p.stateCount, c.beat.stateCount, c.u, 0.6));
    zone(330, 16, 280, 388, 'Pulumi state', { fill: SOFT, stroke: o.hi ? ACC : 'none' });
    mono(596, 38, n + ' / 3', { 'font-size': 16, 'font-weight': 800, fill: n ? ACC : MUT, 'text-anchor': 'end' });
    res.forEach((r, i) => { const on = r.phase === 'imported' || r.phase === 'verified', at = o.fillAt && o.fillAt(i), f = on ? (at != null ? E(c.u, at, at + 0.4) : 1) : 0, x = 350, y = RY[i] - 26, del = o.del && o.del(i);
      el('rect', { x, y, width: 240, height: 52, rx: 9, fill: del ? BADBG : f > 0 ? ACCBG : PANEL, stroke: del ? BAD : f > 0 ? ACC : GRID, 'stroke-width': f > 0 || del ? 2.2 : 1.5, 'stroke-dasharray': f > 0 || del ? null : '5 5' });
      if (f > 0) { mono(x + 14, y + 22, LOGI[i], { 'font-size': 14.5, 'font-weight': 700, fill: del ? BAD : ACC, opacity: f });
        mono(x + 14, y + 42, 'id: ' + (i === 2 ? 'sg-0a1b…' : NAMES[i]), { 'font-size': 13.5, fill: MUT, opacity: f }); }
      else mono(x + 120, y + 31, '비어 있음', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle' }); }); }
  // 코드 구역: lines = [[글, 색]]
  function code(title, lines, o) { o = o || {}; const lh = o.lh || 23;
    el('rect', { x: 632, y: 16, width: 312, height: 388, rx: 12, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.8 });
    mono(648, 40, title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    lines.forEach(([s, col, op, b], i) => mono(648, 70 + i * lh, s, { 'font-size': 13.5, fill: col || INK, 'font-weight': b ? 800 : 500, opacity: op ?? 1 })); }
  const GEN = ['new aws.s3.Bucket("legacyUploads", {', '  bucket: "legacy-uploads-2019",', '  tags: { Team: "media",', '          CreatedBy: "console" },', '}, {', '  protect: true,', '});'];
  const note = (s, a, u, col, y, x) => tx(x || 480, y || 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: fade(u, a) });
  const link = (i, f, col, o) => grow(312, RY[i], 348, RY[i], f, col, o);

  // =========================================================
  // 1. brownfield — 클라우드에는 있고 state 에는 없다
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    aws(c, { show: (i) => (k === 0 ? (i === 0 ? pop(u, 0.4) : 0) : k === 1 ? (i === 0 ? 1 : pop(u, 0.3 + i * 0.4)) : 1) });
    if (k <= 1) R.terminal(330, 40, 614, 110, k === 0 ? ['$ aws s3 ls | grep legacy', ['2019-03-11 10:22:41 legacy-uploads-2019']] : ['$ aws rds describe-db-instances --query …', ['[ "prod-mysql-main" ]']], lerp(0.3, 2, E(u, 0.2, 1.0)), { title: '출력은 예시' });
    if (k === 0) { mono(96, RY[0] + 44, '2019-03-11 생성', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(625, 230, '콘솔로 만든 버킷이 몇 년째 운영 중이다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    if (k === 1) { tx(625, 230, '세 리소스 모두 Pulumi밖에 있다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    state(c);
    if (k === 2) { [0, 1, 2].forEach((i) => tx(322, RY[i] + 6, '?', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.6 + i * 0.25) }));
      card(790, 200, 270, 90, { rx: 12, fill: INK, stroke: 'none', s: pop(u, 1.0) });
      mono(670, 192, 'Current stack resources (0)', { 'font-size': 13.5, fill: PANEL, opacity: fade(u, 1.2) });
      tx(790, 222, 'Pulumi 에겐 없는 것과 같다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: '#fcd34d', opacity: fade(u, 1.6) }); return; }
    if (k === 3) { code('index.ts', [['new aws.s3.Bucket(', INK, fade(u, 0.2)], ['  "legacy-uploads-2019")', INK, fade(u, 0.3)]]);
      pill(470, 360, '+ create로 계획', WARN, pop(u, 0.7), { fs: 14, mono: false });
      grow(632, 80, 600, RY[0], E(u, 0.5, 0.9), WARN, {});
      card(788, 190, 290, 58, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.2) }); cross(668, 190, 9, pop(u, 1.3));
      tx(800, 186, 'bucket 이름을 적었으면', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) }); tx(800, 206, '이미 있는 이름 → 실패', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      card(788, 290, 290, 76, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 1.8) });
      tx(800, 280, '논리 이름만 주면 auto-naming', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9) });
      mono(800, 302, 'legacy-uploads-2019-xxxx', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) });
      tx(800, 322, '버킷이 하나 더 생긴다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      glyph(0, 270, RY[0] + 40, WARN, pop(u, 2.2) * 0.7, { dash: '4 3' }); return; }
    code('순서', []);
    [['1', 'pulumi import', 'state에 등록', ACC], ['2', '코드 붙여 넣기', '프로그램과 짝 맞추기', INK]].forEach(([n, a, b, col], i) => { const y = 120 + i * 120, s = pop(u, 0.3 + i * 0.6);
      card(788, y, 270, 84, { rx: 12, stroke: col, sw: 2.2, s }); tx(676, y + 8, n, { 'font-size': 26, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.6) });
      tx(708, y - 4, a, { 'font-size': 16, 'font-weight': 800, class: i === 0 ? 'mono' : null, opacity: fade(u, 0.4 + i * 0.6) }); tx(708, y + 20, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.6) });
      if (i === 0) grow(788, y + 44, 788, y + 76, E(u, 0.8, 1.1), MUT, {}); });
    note('코드보다 import가 먼저다', 1.6, u, ACC, 370, 788); }

  // =========================================================
  // 2. pulumi import — 읽어서 등록하고 코드를 만들어 준다
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const parts = [['aws:s3/bucket:Bucket', 'type', 'Pulumi 타입 토큰', INFO], ['legacyUploads', 'name', '코드에서 쓸 논리 이름', ACC], ['legacy-uploads-2019', 'id', '클라우드의 실제 식별자', WARN]];
      el('rect', { x: 20, y: 30, width: 920, height: 44, rx: 8, fill: INK });
      mono(36, 58, '$ pulumi import', { 'font-size': 15, fill: PANEL });
      parts.forEach(([s, n, d, col], i) => { const x0 = 206 + [0, 210, 360][i], x = [170, 480, 790][i], f = E(u, 0.6 + i * 0.35, 1.3 + i * 0.35);
        mono(lerp(x0, x - tw(s, 15) / 2, f), lerp(58, 170, f), s, { 'font-size': 15, 'font-weight': 700, fill: f > 0.02 ? col : PANEL });
        card(x, 236, 230, 76, { rx: 12, stroke: col, sw: 2.2, s: pop(u, 1.4 + i * 0.3) });
        tx(x, 230, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, class: 'mono', opacity: fade(u, 1.5 + i * 0.3) });
        tx(x, 254, d, { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 1.6 + i * 0.3) }); });
      note('세 값으로 리소스 하나를 지목한다', 2.3, u, INK, 340); return; }
    aws(c); state(c, { fillAt: (i) => (k === 2 && i === 0 ? 1.0 : null), hi: k === 1 || k === 2 });
    if (k === 1) { link(0, E(u, 0.3, 0.8), ACC, { dash: '4 4' });
      code('Previewing import (dev):', [[' =  aws:s3:Bucket', ACC, fade(u, 0.5), true], ['    legacyUploads   import', ACC, fade(u, 0.7), true], [''], ['state는 아직 그대로', MUT, fade(u, 1.4)]], { fill: PANEL });
      pill(470, 360, 'Plan: = import', ACC, pop(u, 1.2), { mono: true, fs: 14 }); return; }
    if (k === 2) { dot([[90, RY[0]], [350, RY[0]]], seg(u, 0.3, 1.0), ACC, 8); link(0, 1, ACC, {});
      check(60, RY[0] + 50, 9, pop(u, 1.6)); tx(78, RY[0] + 56, '리소스는 그대로', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) });
      code('Importing (dev):', [[' =  aws:s3:Bucket', INK, 1], ['    legacyUploads   imported', ACC, fade(u, 1.2), true]]); return; }
    link(0, 1, ACC, {});
    const shown = k === 3 ? Math.floor(lerp(0, GEN.length, E(u, 0.3, 2.0)) + 0.001) : GEN.length;
    code(k === 5 ? 'import 출력 (복사할 코드)' : '생성된 코드', GEN.slice(0, shown).map((s, i) => [s, i === 5 ? ACC : INK, k === 5 ? 0.55 : 1, i === 5 && k === 4]));
    if (k === 3) { dot([[90, RY[0]], [300, 60], [640, 70]], seg(u, 0.2, 1.0), INFO, 6); tx(470, 360, '실제 속성을 읽어 그대로 옮긴다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 4) { el('rect', { x: 640, y: 168, width: 296, height: 28, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 0.3) });
      lock(905, 182, true, ACC, pop(u, 0.6) * 0.8); pill(470, 360, '기본으로 붙는다', ACC, pop(u, 1.0), { fs: 14 });
      tx(788, 260, '실수로 지우지 못하게', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); }
    if (k === 5) { card(788, 300, 280, 110, { rx: 12, fill: PANEL, stroke: BAD, sw: 2, dash: '6 5', s: pop(u, 0.4) });
      mono(660, 268, 'index.ts', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.5) });
      tx(788, 310, '아직 이 코드가 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
      grow(612, RY[0], 650, 300, E(u, 1.2, 1.7), BAD, { dash: '4 4', plain: true }); cross(632, 210, 9, pop(u, 1.8));
      note('state는 찼고, 코드와의 짝은 아직이다', 2.1, u, INK, 404, 470); } }

  // =========================================================
  // 3. 코드를 프로그램에 붙이고 protect 로 잠근다
  // =========================================================
  function s3(t, c) { const { k, u } = c;
    aws(c); state(c, { del: (i) => k === 3 && i === 0 && u > 1.0 });
    const lines = [['import * as aws from "@pulumi/aws";', MUT], ['']].concat(GEN.map((s, i) => [s, i === 5 && k === 2 ? ACC : INK, k === 3 ? 1 - 0.7 * fade(u, 0.4) : 1, i === 5 && k === 2]));
    if (k === 4) lines.push([''], ['export const legacyBucketArn =', ACC, fade(u, 0.3), true], ['  legacyUploads.arn;', ACC, fade(u, 0.5), true]);
    code('index.ts', k === 0 ? lines.map((l, i) => [l[0], l[1], fade(u, 0.2 + i * 0.15)]) : lines, { stroke: k === 0 ? ACC : GRID });
    link(0, 1, ACC, {});
    if (k === 0) { grow(612, RY[0], 632, 120, E(u, 1.4, 1.8), GOOD, {}); note('state의 legacyUploads와 코드가 짝을 이룬다', 1.9, u, GOOD, 404, 470); }
    if (k === 1) { [['Team', 'media'], ['CreatedBy', 'console']].forEach(([a, b], i) => { const y = RY[0] + 40 + i * 18;
        mono(96, y, a + ': ' + b, { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3 + i * 0.3) });
        tx(320, y + 2, '=', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0 + i * 0.3) }); });
      el('rect', { x: 640, y: 124, width: 296, height: 52, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: fade(u, 0.6) });
      tx(470, 392, '하나라도 다르면 diff가 된다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 2) { lock(60, RY[0] - 40, true, ACC, pop(u, 0.3) * 0.9);
      pill(470, 360, 'pulumi destroy', BAD, pop(u, 0.6), { mono: true, fs: 14 });
      dot([[470, 340], [300, 200], [100, RY[0] + 10], [300, 260], [460, 330]], seg(u, 0.8, 2.2), BAD, 7);
      cross(60, RY[0], 12, pop(u, 1.5)); tx(470, 400, '엔진이 삭제를 거부한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); }
    if (k === 3) { tx(788, 360, '코드에서 빠지면', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
      pill(470, 352, 'state에만 있음 → delete 대상', BAD, pop(u, 1.1), { fs: 13.5 });
      lock(580, RY[0] - 18, true, ACC, pop(u, 1.8) * 0.8); tx(470, 392, 'protect라 삭제 대신 오류로 멈춘다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 4) { fly(788, 330, 470, 360, seg(u, 0.8, 1.6), 'legacyBucketArn', { mono: true, stay: true });
      tx(470, 400, '다른 스택 · CI에서 이 값을 쓴다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); } }

  // =========================================================
  // 4. bulk import — import.json 한 장으로 여럿을
  // =========================================================
  const JS = [['{ "resources": [', MUT, 0], ['  { "type": "aws:s3/bucket:Bucket",', INK, 0], ['    "name": "legacyUploads",', INK, 0], ['    "id": "legacy-uploads-2019" },', INK, 0],
    ['  { "type": "aws:rds/instance:Instance",', INK, 1], ['    "name": "prodMysqlMain",', INK, 1], ['    "id": "prod-mysql-main" },', INK, 1],
    ['  { "type": "aws:ec2/securityGroup:', INK, 2], ['            SecurityGroup",', INK, 2], ['    "name": "webSg",', INK, 2], ['    "id": "sg-0a1b2c3d4e5f67890" }', WARN, 2], [']}', MUT, 0]];
  function s4(t, c) { const { k, u } = c;
    aws(c); state(c, { fillAt: (i) => (k === 3 && i > 0 ? 1.0 + i * 0.3 : null) });
    for (let i = 0; i < 3; i++) if (c.beat.resources[i].phase !== 'console') link(i, k === 3 && i > 0 ? E(u, 0.6 + i * 0.3, 1.0 + i * 0.3) : c.beat.resources[i].phase === 'importing' ? 0 : 1, ACC, {});
    const upto = k === 0 ? 0 : k === 1 ? 1 : 2;
    code('import.json', JS.filter(([, , g]) => g <= upto).map(([s, col, g], i) => [s.length > 36 ? s.slice(0, 35) + '…' : s, g === 2 && /sg-/.test(s) ? WARN : col, (k === 0 && g === 0) || (k === 1 && g === 1) || (k === 2 && g === 2) ? fade(u, 0.3 + i * 0.08) : 1, g === upto && k < 3 && /"id"/.test(s)]), { lh: 22 });
    if (k === 0) note('항목마다 type · name · id', 1.4, u, INK, 404, 788);
    if (k === 1) note('id = DB 인스턴스 식별자', 1.4, u, ACC, 404, 788);
    if (k === 2) note('id 형식은 리소스 종류마다 다르다', 1.4, u, WARN, 404, 788);
    if (k === 3) { el('rect', { x: 640, y: 350, width: 296, height: 40, rx: 8, fill: INK, opacity: fade(u, 0.1) });
      mono(652, 376, '$ pulumi import --file import.json', { 'font-size': 13.5, fill: PANEL, opacity: fade(u, 0.3) });
      [1, 2].forEach((i) => dot([[90, RY[i]], [350, RY[i]]], seg(u, 0.6 + i * 0.3, 1.2 + i * 0.3), ACC, 7));
      note('한 번에 세 리소스 등록 + 코드 생성', 2.0, u, ACC, 400, 470); } }

  // =========================================================
  // 5. preview 로 diff 0 확인 — 편입 끝
  // =========================================================
  const PV = [['pulumi:pulumi:Stack', 'brownfield-dev'], ['aws:s3:Bucket', 'legacyUploads'], ['aws:rds:Instance', 'prodMysqlMain'], ['aws:ec2:SecurityGroup', 'webSg']];
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { // 이제 변경 경로는 하나
      const st = [['코드', 'index.ts'], ['pulumi up', 'preview 후 적용'], ['AWS', '실제 리소스']];
      st.forEach(([a, b], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.4); card(x, 170, 220, 90, { rx: 12, fill: i === 1 ? ACCBG : PANEL, stroke: ACC, sw: 2.2, s });
        tx(x, 166, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, class: i === 1 ? 'mono' : null, opacity: fade(u, 0.4 + i * 0.4) }); sub(x, 192, b, fade(u, 0.5 + i * 0.4), { 'font-size': 14 });
        if (i < 2) grow(x + 112, 170, x + 196, 170, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), ACC, {}); });
      person(170, 330, '콘솔 클릭', { s: pop(u, 1.6), stroke: MUT }); grow(210, 330, 760, 330, E(u, 1.7, 2.1), MUT, { dash: '5 5', plain: true });
      cross(480, 330, 12, pop(u, 2.1)); tx(620, 318, '수동 변경은 하지 않는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); return; }
    el('rect', { x: 20, y: 20, width: 600, height: 300, rx: 12, fill: INK });
    mono(40, 52, '$ pulumi preview', { 'font-size': 15, fill: PANEL });
    mono(40, 84, 'Previewing update (dev):', { 'font-size': 14, fill: PANEL, opacity: k === 0 ? fade(u, 0.5) : 1 });
    mono(60, 112, 'Type                     Name            Plan', { 'font-size': 13.5, fill: OFF, opacity: k === 0 ? fade(u, 0.8) : 1 });
    const diffRow = k === 3 && u < 2.0;
    PV.forEach(([ty, nm], i) => { const y = 140 + i * 28, op = k === 0 ? fade(u, 1.0 + i * 0.25) : 1, d = diffRow && i === 1;
      mono(40, y, d ? '~' : ' ', { 'font-size': 14, fill: '#fcd34d', 'font-weight': 800 });
      mono(60, y, ty, { 'font-size': 14, fill: d ? '#fcd34d' : 'var(--term)', opacity: op }); mono(300, y, nm, { 'font-size': 14, fill: d ? '#fcd34d' : 'var(--term)', opacity: op });
      if (d) mono(460, y, 'update', { 'font-size': 14, fill: '#fcd34d', 'font-weight': 700 }); });
    if (k === 0) { el('rect', { x: 30, y: 122, width: 580, height: 6, rx: 3, fill: ACC, opacity: 0.6, transform: `translate(0 ${lerp(0, 110, E(u, 1.0, 2.2))})` });
      tx(790, 170, '목표: 변경 0', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { el('rect', { x: 452, y: 122, width: 150, height: 112, rx: 6, fill: 'none', stroke: '#fcd34d', 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.3) });
      tx(790, 160, 'Plan 칸이 비어 있다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.7) });
      sub(790, 188, '+ ~ - 기호가 없으면 손대지 않는다', fade(u, 1.1), { 'font-size': 14.5 }); return; }
    if (k === 2) { const n = Math.round(lerp(0, 4, E(u, 0.3, 1.2)));
      mono(40, 268, 'Resources:', { 'font-size': 14, fill: PANEL }); mono(60, 296, n + ' unchanged', { 'font-size': 15, 'font-weight': 800, fill: '#86efac' });
      card(790, 150, 250, 110, { rx: 14, fill: GOODBG, stroke: GOOD, sw: 2.5, s: pop(u, 1.3) });
      tx(790, 146, 'diff 0', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      sub(790, 178, '스택 1 + 리소스 3 = 4 unchanged', fade(u, 1.7), { 'font-size': 14 });
      ['S3', 'RDS', 'SG'].forEach((s, i) => { const x = 700 + i * 90; check(x - 22, 300, 8, pop(u, 1.9 + i * 0.2)); tx(x, 306, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9 + i * 0.2) }); });
      note('레거시가 Pulumi 관리 안으로 들어왔다', 2.2, u, GOOD, 380); return; }
    // 3: diff 가 잡히면 코드를 고친다
    mono(40, 268, diffRow ? '~ tags: { - CreatedBy: "console" }' : 'Resources: 4 unchanged', { 'font-size': 14.5, fill: diffRow ? '#fcd34d' : '#86efac', 'font-weight': 700 });
    card(790, 110, 270, 120, { rx: 12, fill: PANEL, stroke: diffRow ? WARN : GOOD, sw: 2.2 });
    mono(670, 82, 'tags: { Team: "media",', { 'font-size': 14 });
    mono(670, 108, '        CreatedBy: "console" }', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
    tx(790, 150, diffRow ? '코드에서 CreatedBy가 빠졌다' : '빠진 태그를 코드에 되살렸다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: diffRow ? WARN : GOOD });
    card(790, 290, 270, 80, { rx: 12, fill: WARNBG, stroke: WARN, sw: 2, s: pop(u, 0.6) });
    tx(790, 284, 'up 하면 실제 태그가 지워진다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.7) });
    tx(790, 308, '그래서 코드를 실제에 맞춘다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) }); }

  const quiz = [
    { q: '콘솔로 만든 legacy-uploads-2019 버킷을 import 없이 코드로 선언하고 preview 하면 무엇이 잡히는가?',
      o: ['그 버킷을 새로 만드는 create', '기존 버킷을 지웠다 만드는 replace', '변경 없음'], a: 0,
      why: 'state에 없는 리소스는 엔진에겐 없는 것이라 create로 계획된다. 같은 이름이면 실패하고, auto-naming이면 버킷이 하나 더 생긴다.' },
    { q: 'pulumi import aws:s3/bucket:Bucket legacyUploads legacy-uploads-2019에서 legacyUploads는 무엇인가?',
      o: ['클라우드의 버킷 이름', 'Pulumi 타입 토큰', '앞으로 코드에서 쓸 논리 이름'], a: 2,
      why: '순서는 type, name, id다. name은 코드의 논리 이름이고, 실제 버킷 이름 legacy-uploads-2019는 id 자리에 들어간다.' },
    { q: 'import로 state에 등록한 뒤 생성된 코드를 index.ts에 넣지 않으면 다음 preview는 어떻게 보는가?',
      o: ['state에만 있는 리소스라 delete 대상으로 본다', '코드를 자동으로 만들어 넣는다', '아무 일도 없이 넘어간다'], a: 0,
      why: '코드에 없고 state에만 있으면 지울 대상이 된다. import 된 리소스는 protect가 붙어 있어 실제로는 오류로 멈춘다.' },
    { q: 'import.json의 각 항목에 꼭 있어야 하는 세 필드는 무엇인가?',
      o: ['bucket · tags · protect', 'type · name · id', 'parent · provider · version'], a: 1,
      why: 'type, name, id로 리소스 하나를 지목한다. parent나 provider는 필요할 때만 덧붙이는 옵션이다.' },
    { q: '편입 뒤 preview에 ~ tags가 잡혔다. 올바른 대처는 무엇인가?',
      o: ['pulumi up으로 실제 태그를 코드에 맞춘다', '코드의 tags를 실제 리소스 값에 맞게 고친다', 'state 파일에서 tags를 지운다'], a: 1,
      why: '편입의 목표는 운영 중인 리소스를 건드리지 않는 것이다. up을 하면 실제 태그가 지워지니 코드를 고쳐 diff를 0으로 만든다.' },
  ];

  const summary = [
    '콘솔로 만든 리소스는 state에 없어서, 코드로 바로 선언하면 create로 잡힌다.',
    'pulumi import는 type, name, id로 리소스를 읽어 state에 등록하고 코드를 만들어 준다.',
    '생성된 코드는 index.ts에 붙여 넣고, 기본으로 붙는 protect로 실수 삭제를 막는다.',
    '여럿은 import.json으로 한 번에 넣고, preview가 4 unchanged처럼 diff 0이면 편입이 끝난다.',
  ];
  const review = [
    { q: '콘솔로 만든 RDS를 Pulumi로 옮기려 한다. 가장 먼저 할 일은?',
      o: ['index.ts에 aws.rds.Instance를 선언하고 up 한다', 'pulumi import로 state에 등록하고 생성된 코드를 붙인다', 'RDS를 지우고 Pulumi로 새로 만든다'], a: 1,
      why: '선언부터 하면 create로 잡혀 실패하거나 하나 더 생긴다. import가 실제를 읽어 state와 코드를 함께 마련해 준다.' },
    { q: '편입한 버킷을 이제 지우려고 코드에서 뺐더니 오류가 났다. 이유는?',
      o: ['import 때 붙은 protect: true가 삭제를 막는다', 'S3 버킷은 Pulumi로 지울 수 없다', 'import.json에 남아 있어서'], a: 0,
      why: 'import 된 리소스는 protect가 기본이다. 정말 지우려면 먼저 protect를 풀고 up 한 뒤 지운다.' },
    { q: 'import --file로 세 리소스를 넣고 코드를 붙였는데 preview에 ~ update가 한 건 있다. 다음 행동은?',
      o: ['그대로 up 해서 0으로 만든다', 'import를 처음부터 다시 한다', '그 속성을 실제 값에 맞게 코드에서 고친다'], a: 2,
      why: 'diff는 코드와 실제의 차이다. up 하면 운영 리소스가 바뀌므로, 코드를 실제에 맞춰 4 unchanged가 될 때까지 고친다.' },
  ];

  R.page({ title: '기존 리소스를 코드로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
