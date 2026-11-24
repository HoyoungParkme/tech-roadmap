/* III-1-1 terraform.tfstate — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 세 칸: 코드(.tf, 원하는 상태) · state(terraform 이 아는 상태) · 클라우드(실제 상태) */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, cross, check, lock, terminal, snippet, meters } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ---------- 지역 도우미 ----------
  function bucket(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-38,-24 L38,-24 L30,28 L-30,28 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: 0, cy: -24, rx: 38, ry: 8, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    if (name) tx(0, 50, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  function fileIc(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-18,-24 H8 L18,-14 V24 H-18 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M8,-24 V-14 H18', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-6, 2, 10].forEach((y) => el('line', { x1: -11, y1: y, x2: 11, y2: y, stroke: OFF, 'stroke-width': 2.5 }, g));
    if (name) tx(0, 44, name, { 'text-anchor': 'middle', 'font-size': o.fs || 14, 'font-weight': 700, class: 'mono', fill: o.color || c }, g); return g; }
  function laptop(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('rect', { x: -48, y: -36, width: 96, height: 60, rx: 6, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-62,24 H62 L56,34 H-56 Z', fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    if (name) tx(0, 56, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: c }, g); return g; }
  function keyIc(cx, cy, col, s) { const g = G(cx, cy, s ?? 1);
    el('circle', { cx: -8, cy: 0, r: 7, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
    el('path', { d: 'M-1,0 H17 M11,0 V7 M16,0 V6', stroke: col, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g); return g; }
  function vault(cx, cy, name, o) { o = o || {}; const g = card(cx, cy, 120, 70, { rx: 10, stroke: o.stroke || INFO, sw: 2.5, s: o.s, op: o.op });
    el('circle', { cx: 0, cy: -4, r: 16, fill: 'none', stroke: o.stroke || INFO, 'stroke-width': 3 }, g);
    [0, 1, 2, 3].forEach((i) => { const a = i * Math.PI / 2; el('line', { x1: Math.cos(a) * 6, y1: -4 + Math.sin(a) * 6, x2: Math.cos(a) * 14, y2: -4 + Math.sin(a) * 14, stroke: o.stroke || INFO, 'stroke-width': 2.5 }, g); });
    if (name) tx(0, 56, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: o.stroke || INFO }, g); return g; }
  // 칸 머리 (코드 / state / 클라우드)
  const COLS = [{ x: 24, w: 290, t: '코드 (.tf)' }, { x: 334, w: 292, t: 'state (장부)' }, { x: 646, w: 290, t: '클라우드 (실물)' }];
  function cols(on) { COLS.forEach((cl, i) => { const hot = on === i;
    el('rect', { x: cl.x, y: 18, width: cl.w, height: 388, rx: 12, fill: hot ? ACCBG : SOFT, stroke: hot ? ACC : 'none', 'stroke-width': 1.8 });
    lbl(cl.x + cl.w / 2, 44, cl.t, 1, { fill: hot ? ACC : MUT }); }); }
  // 장부 한 줄: 주소 → ID
  function row(cx, y, addr, id, u, o) { o = o || {}; const col = o.col || ACC, w = 268;
    el('rect', { x: cx - w / 2, y: y - 22, width: w, height: 44, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.6, opacity: o.op ?? 1 });
    mono(cx - w / 2 + 10, y - 4, addr, { 'font-size': 13.5, 'font-weight': 700, fill: o.gone ? OFF : INK, opacity: o.op ?? 1, 'text-decoration': o.gone ? 'line-through' : null });
    mono(cx - w / 2 + 10, y + 15, '→ ' + id, { 'font-size': 13.5, fill: o.gone ? OFF : col, opacity: (o.op ?? 1) * clamp(u * 1.5) }); }

  // ---------- 1. tfstate JSON 장부 ----------
  const J = ['{', '  "version": 4,', '  "terraform_version": "1.7.0",', '  "serial": 1,', '  "lineage": "f2a9...",', '  "resources": [{', '    "mode": "managed",', '    "type": "aws_instance",',
    '    "name": "web",', '    "instances": [{ "attributes": {', '      "id": "i-0abcd1234",', '      "ami": "ami-0c55b159cbfafe1f0",', '      "instance_type": "t3.micro",', '      "private_ip": "10.0.1.42",',
    '      "tags": { "Name": "web-server" }', '    } }]', '  }]', '}'];
  const JY = (i) => 70 + i * 18.5;
  const JV = [[0, 1, 2, 17], [0, 1, 2, 3, 4, 17], [0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 17], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17]];
  const JNEW = [[1, 2], [3, 4], [5, 6, 7, 8], [9, 10], [11, 12, 13, 14]];
  const JHI = [[1, 2], [3, 4], [7, 8], [10], [11, 12, 13, 14], [1, 3, 4], [7, 8, 10]];
  function jsonDoc(k, u) {
    zone(22, 22, 356, 384, null, { fill: PANEL, stroke: GRID, sw: 1.5 });
    mono(38, 46, 'terraform.tfstate', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const vis = JV[k] || J.map((_, i) => i), fresh = JNEW[k] || [];
    (JHI[k] || []).forEach((i) => el('rect', { x: 28, y: JY(i) - 13.5, width: 344, height: 18, rx: 4, fill: ACCBG }));
    vis.forEach((i) => { const p = fresh.indexOf(i); let s = J[i];
      if (p >= 0) { const st = k === 4 ? 0.7 + p * 0.4 : 0.2 + p * 0.3; s = s.slice(0, Math.round(s.length * seg(u, st, st + 0.5))); }
      mono(32, JY(i), s, { 'font-size': 13.5, fill: (JHI[k] || []).includes(i) ? ACC : INK, 'font-weight': (JHI[k] || []).includes(i) ? 700 : 400 }); }); }
  function s1(t, c) { const { k, u } = c;
    jsonDoc(k, u);
    if (k === 0) { const s = pop(u, 0.3); fileIc(560, 150, 'terraform.tfstate', { s: 1.6 * s });
      pill(790, 112, '포맷 버전 4', ACC, pop(u, 0.9), { mono: true }); pill(790, 168, 'terraform 1.7.0', INK, pop(u, 1.3), { mono: true });
      sub(660, 300, '사람이 아니라 terraform 이 읽는 JSON', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { // serial 계수기 + lineage 신분증
      card(540, 140, 150, 96, { rx: 12, stroke: ACC, sw: 2.5 }); tx(540, 112, 'serial', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
      const roll = E(u, 0.4, 1.2);
      mono(540, 162 + roll * 30, '0', { 'font-size': 34, 'font-weight': 800, 'text-anchor': 'middle', fill: OFF, opacity: 1 - roll });
      mono(540, 162 - (1 - roll) * 30, '1', { 'font-size': 34, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: roll });
      sub(540, 214, '바뀌어 저장될 때마다 +1', fade(u, 1.2));
      const s = pop(u, 1.4); card(790, 140, 220, 96, { rx: 12, stroke: INK, sw: 2.5, s });
      tx(790, 116, 'lineage', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      mono(790, 154, 'f2a9...', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.6) });
      sub(790, 214, '다르면 남의 state', fade(u, 2.0)); return; }
    if (k === 5) { // 메타 필드 세 개
      [[1, 'version 4', '포맷 버전'], [3, 'serial 1', '변경 번호'], [4, 'lineage f2a9...', '계보 UUID']].forEach(([i, a, b], n) => {
        const y = 92 + n * 82, g = E(u, 0.2 + n * 0.4, 0.8 + n * 0.4);
        grow(300, JY(i) - 5, 512, y, g, ACC, { plain: true, sw: 1.8 });
        card(660, y, 290, 58, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.6 + n * 0.4) });
        mono(528, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8 + n * 0.4) });
        tx(790, y + 5, b, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.8 + n * 0.4) }); });
      sub(660, 360, '덮어쓸 때 serial·lineage 로 최신과 계보를 확인한다', fade(u, 1.9), { 'font-size': 14.5, fill: INK }); return; }
    // k >= 2: 코드 블록 · 주소 · 실물
    const sop = k === 2 ? fade(u, 0.2) : 1;
    snippet(430, 30, ['resource "aws_instance" "web" {', '  ami           = "ami-0c55…"', '  instance_type = "t3.micro"', '}'], { fs: 14, op: sop });
    tx(430 + 330, 46, 'main.tf', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: sop });
    const pg = k === 2 ? E(u, 0.9, 1.6) : 1;
    grow(268, JY(7.5), 470, 222, pg, ACC, { sw: 2 });
    grow(560, 142, 560, 204, k === 2 ? E(u, 0.6, 1.2) : 1, MUT, { sw: 2 });
    pill(560, 228, 'aws_instance.web', ACC, k === 2 ? pop(u, 1.5) : 1, { mono: true, fs: 15 });
    sub(560, 266, 'type + "." + name = 코드 주소', k === 2 ? fade(u, 1.9) : 1);
    if (k >= 3) { const ss = k === 3 ? pop(u, 0.3) : 1; server(850, 218, 'i-0abcd1234', { s: ss, lamp: GOOD });
      grow(650, 228, 790, 228, k === 3 ? E(u, 1.0, 1.8) : 1, GOOD, { sw: 2.5, plain: true });
      if (k === 3) { dot([[260, JY(10) - 4], [700, JY(10) - 4], [790, 236]], seg(u, 0.4, 1.4), GOOD, 6); sub(720, 300, 'attributes.id 가 실물을 가리킨다', fade(u, 1.8), { fill: GOOD, 'font-weight': 700 }); } }
    if (k === 4) { ['ami', 'instance_type', 'private_ip', 'tags'].forEach((a, i) => fly(850, 218, 300, JY(11 + i) - 4, seg(u, 0.2 + i * 0.4, 0.8 + i * 0.4), a, { mono: true, fill: INK }));
      sub(850, 330, '속성 전체를 복사해 둔다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(850, 352, 'plan 이 코드와 비교하는 값', fade(u, 2.2)); }
    if (k === 6) banner(660, 356, '장부 한 줄 = 코드 주소 ↔ 실제 ID', pop(u, 0.4)); }

  // ---------- 2. 매핑이 없으면 ----------
  function s2(t, c) { const { k, u } = c;
    cols(k === 2 || k === 6 ? 1 : k === 1 ? 0 : -1);
    const SX = 480;
    if (k <= 3) {
      snippet(40, 70, ['resource "aws_instance"', '         "web" {', '  ...', '}'], { fs: 14.5 });
      if (k === 1) { el('rect', { x: 50, y: 114, width: 260, height: 2.5, fill: ACC, opacity: fade(u, 0.3) }); pill(169, 200, '주소: aws_instance.web', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
        sub(169, 240, '실제 ID 는 코드 어디에도 없다', fade(u, 1.0), { fill: INK, 'font-weight': 700 }); }
      server(790, 140, 'i-0abcd1234', { lamp: GOOD, stroke: k >= 3 ? BAD : INK });
      if (k === 0) { const w = E(u, 0.4, 1.6);
        row(SX, 140, 'aws_instance.web', 'i-0abcd1234', 1, { op: 1 - w });
        el('rect', { x: SX - 136, y: 116, width: 272 * w, height: 48, fill: SOFT });
        sub(SX, 200, '장부를 지웠다', fade(u, 1.6), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
        sub(SX, 224, '코드와 실물은 그대로', fade(u, 2.0)); }
      if (k === 1) { tx(SX, 170, '?', { 'text-anchor': 'middle', 'font-size': 64, 'font-weight': 800, fill: OFF, opacity: fade(u, 0.6) });
        grow(316, 130, 728, 130, E(u, 1.2, 2.2), OFF, { dash: '6 6', plain: true }); sub(790, 236, '코드에 없음', fade(u, 1.6), { fill: MUT }); }
      if (k === 2) { [['코드에 web', true], ['state 에 web', false]].forEach(([s, ok], i) => { const y = 110 + i * 56, sc = pop(u, 0.3 + i * 0.5);
          card(SX, y, 240, 44, { rx: 8, stroke: ok ? GOOD : BAD, sw: 2, s: sc }); tx(SX - 100, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) });
          (ok ? check : cross)(SX + 92, y, 10, sc); });
        pill(SX, 244, '+ create (처음 만든다)', GOOD, pop(u, 1.6), { fs: 15 }); sub(SX, 286, '기준은 클라우드가 아니라 state', fade(u, 2.1), { fill: INK, 'font-weight': 700 });
        sub(790, 236, '이미 떠 있지만 모른다', fade(u, 1.2), { fill: WARN, 'font-weight': 700 }); }
      if (k === 3) { const s2v = pop(u, 0.3); server(790, 300, 'i-0newnew99', { lamp: GOOD, stroke: GOOD, s: s2v });
        row(SX, 140, 'aws_instance.web', 'i-0newnew99', E(u, 0.8, 1.6), { col: GOOD });
        grow(SX + 136, 150, 732, 288, E(u, 1.2, 2.0), GOOD, { sw: 2 });
        pill(790, 220, '고아', BAD, pop(u, 1.6), { fs: 14 });
        pill(SX, 240, 'EC2 2대 · 비용 ×2', BAD, pop(u, 2.0), { fs: 15 }); }
      return; }
    // k 4~6: 리소스 3개의 장부
    const RS = [['aws_instance.web', 'i-0abcd1234', 'resource "aws_instance" "web"'], ['aws_s3_bucket.logs', 'my-log-bkt-2026', 'resource "aws_s3_bucket" "logs"'], ['aws_db_instance.db', 'prod-db-01', 'resource "aws_db_instance" "db"']];
    const ys = [100, 192, 284];
    RS.forEach(([a, id, code], i) => { const y = ys[i], g = k === 4 ? E(u, 0.2 + i * 0.5, 0.9 + i * 0.5) : 1;
      mono(36, y + 5, code, { 'font-size': 13.5, 'font-weight': 600, fill: INK });
      row(SX, y, a, id, g, { col: GOOD, stroke: k === 5 ? GOOD : GRID });
      grow(SX + 136, y, 728, y, g, GOOD, { plain: true, sw: 2 }); });
    server(790, 100, null, { s: 0.62, lamp: GOOD }); mono(850, 105, 'EC2', { 'font-size': 14, 'font-weight': 700 });
    bucket(790, 192, null, { s: 0.75 }); mono(830, 197, 'S3', { 'font-size': 14, 'font-weight': 700 });
    dbIcon(790, 284, null, { s: 0.62 }); mono(830, 289, 'RDS', { 'font-size': 14, 'font-weight': 700 });
    if (k === 5) { terminal(36, 326, 580, 72, [['$ terraform plan', null], ['No changes. Your infrastructure matches the configuration.', 'var(--good)']], E(u, 0.2, 1.4) * 2, { fs: 13.5, lh: 20 });
      ys.forEach((y, i) => check(SX + 116, y, 9, pop(u, 1.4 + i * 0.25))); }
    if (k === 6) { sub(169, 352, '사람이 지은 주소', fade(u, 0.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(790, 352, '기계가 만든 ID', fade(u, 0.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      banner(SX, 360, '그 사이를 잇는 표 = state', pop(u, 1.1)); } }

  // ---------- 3. 로컬 state 의 한계 ----------
  function folder(x, y, files, u0, t0) { zone(x, y, 300, 40 + files.length * 40, './ (작업 폴더)', { fill: PANEL, stroke: GRID, sw: 1.5 });
    files.forEach(([n, col, st], i) => { const s = st == null ? 1 : pop(u0, st); const yy = y + 48 + i * 40;
      fileIc(x + 30, yy, null, { s: 0.62 * s, stroke: col || INK }); mono(x + 52, yy + 5, n, { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: clamp(s) }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2 || k === 5) { laptop(110, 130, 'A 노트북', {});
      const files = [['main.tf', INK, null], ['terraform.tfstate', BAD, k === 0 ? 0.6 : null], ['terraform.tfstate.backup', BAD, k === 0 ? 1.2 : null]];
      folder(210, 64, files, u);
      card(800, 150, 220, 110, { rx: 12, stroke: k === 5 ? GOOD : INK, sw: 2.5, op: k === 0 ? 0 : 1 });
      if (k !== 0) { tx(800, 116, 'GitHub', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }); sub(800, 138, '원격 저장소'); }
      if (k === 0) { sub(360, 260, '비밀번호가 든 파일이 main.tf 바로 옆에', fade(u, 1.7), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
      if (k === 1) { terminal(210, 250, 300, 110, ['$ git add -A', '$ git commit -m "first apply"', '$ git push'], E(u, 0.1, 1.0) * 3, { fs: 14 });
        ['main.tf', 'terraform.tfstate', '…backup'].forEach((n, i) => fly(400, 120 + i * 40, 800, 160, seg(u, 1.0 + i * 0.3, 1.9 + i * 0.3), n, { mono: true, fill: i ? BAD : INK }));
        if (u > 2.0) { keyIc(800, 176, BAD, pop(u, 2.0)); sub(800, 232, 'RDS 비밀번호도 함께', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); }
        return; }
      if (k === 2) { keyIc(800, 176, BAD, 1); pill(800, 70, 'force-push', INK, pop(u, 0.2), { mono: true });
        cross(800, 176, 18, pop(u, 0.5));
        ['reflog', 'PR 캐시', '클론·포크'].forEach((s, i) => { card(700 + i * 100, 250, 88, 40, { rx: 8, text: s, fs: 13.5, stroke: BAD, sw: 1.8, s: pop(u, 0.9 + i * 0.25) }); keyIc(700 + i * 100, 290, BAD, 0.7 * pop(u, 1.0 + i * 0.25)); });
        sub(800, 330, '지워도 사본이 남는다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 });
        const rot = E(u, 1.8, 2.6); keyIc(360, 330, BAD, 1 - rot); keyIc(360, 330, GOOD, rot); sub(430, 336, '비밀 자체를 바꾼다 (회전)', fade(u, 2.0), { 'text-anchor': 'start', fill: GOOD, 'font-weight': 700 }); return; }
      // k === 5 : .gitignore
      snippet(220, 260, ['# .gitignore', '*.tfstate', '*.tfstate.*', '.terraform/'], { fs: 14 });
      el('line', { x1: 620, y1: 60, x2: 620, y2: 240, stroke: GOOD, 'stroke-width': 4, opacity: fade(u, 0.2) });
      sub(620, 262, '무시 목록', fade(u, 0.3), { fill: GOOD, 'font-weight': 700 });
      fly(540, 112, 790, 160, seg(u, 0.5, 1.5), 'main.tf', { mono: true, fill: INK, stay: true });
      [1, 2].forEach((i) => { const p = seg(u, 0.8 + i * 0.3, 1.6 + i * 0.3); fly(540, 112 + i * 40, 590, 112 + i * 40, p, i === 1 ? 'tfstate' : 'backup', { mono: true, fill: BAD, stay: true }); cross(626, 112 + i * 40, 9, pop(u, 1.6 + i * 0.3)); });
      check(880, 160, 12, pop(u, 1.6)); return; }
    // k 3, 4, 6: 노트북 두 대
    const A = [110, 110], B = [110, 300];
    laptop(A[0], A[1], 'A 노트북', {}); laptop(B[0], B[1], 'B 노트북', { s: k === 3 ? pop(u, 0.2) : 1 });
    if (k === 6) { const bs = pop(u, 0.3); bucket(560, 205, null, { s: 1.3 * bs, stroke: GOOD });
      lbl(560, 290, 'S3 원격 state 하나', fade(u, 0.6), { fill: GOOD });
      grow(180, 120, 500, 190, E(u, 0.6, 1.4), GOOD, { sw: 2.5 }); grow(180, 290, 500, 220, E(u, 0.8, 1.6), GOOD, { sw: 2.5 });
      lock(700, 205, true, GOOD, pop(u, 1.4)); tx(724, 211, '잠금(lock)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      sub(700, 246, '동시 apply 차단', fade(u, 1.7)); banner(480, 370, '팀이 되면 원격 backend 로', pop(u, 2.0)); return; }
    pill(300, 110, 'web = i-0abcd1234', INK, 1, { mono: true, fs: 13.5 });
    pill(300, 300, 'web = i-0xyzz9999', INK, k === 3 ? pop(u, 0.6) : 1, { mono: true, fs: 13.5 });
    if (k === 3) { card(560, 205, 150, 54, { rx: 10, text: '같은 main.tf', fs: 15, stroke: ACC, color: ACC });
      grow(486, 196, 380, 122, E(u, 0.9, 1.5), ACC, { plain: true }); grow(486, 214, 380, 288, E(u, 0.9, 1.5), ACC, { plain: true });
      lbl(780, 205, '진실이 둘', fade(u, 1.6), { fill: BAD, 'font-size': 22 }); sub(780, 236, '어느 쪽이 맞는지 판정할 수 없다', fade(u, 1.9)); return; }
    // k === 4 : 서로를 보지 못한다
    zone(640, 20, 296, 386, '클라우드', { fill: SOFT });
    server(790, 110, 'i-0abcd1234', { lamp: GOOD }); server(790, 300, 'i-0xyzz9999', { lamp: GOOD });
    grow(390, 110, 728, 110, E(u, 0.3, 1.0), GOOD, { sw: 2.2, plain: true }); grow(390, 300, 728, 300, E(u, 0.5, 1.2), GOOD, { sw: 2.2, plain: true });
    grow(390, 122, 728, 286, E(u, 1.0, 1.6), OFF, { dash: '5 6', plain: true }); grow(390, 288, 728, 124, E(u, 1.0, 1.6), OFF, { dash: '5 6', plain: true });
    cross(560, 205, 12, pop(u, 1.6));
    pill(300, 160, 'plan: No changes', MUT, pop(u, 1.9), { mono: true, fs: 13.5 }); pill(300, 350, 'plan: No changes', MUT, pop(u, 2.0), { mono: true, fs: 13.5 });
    sub(560, 236, '남의 것은 안 보인다', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); }

  // ---------- 4. state 를 잃었을 때 ----------
  const CL = [[590, 'i-0abcd1234'], [735, 'my-log-bkt-2026'], [870, 'prod-db-01']];
  function cloud3(o) { o = o || {}; zone(500, 22, 436, 238, '클라우드 (그대로 살아 있다)', { fill: SOFT });
    server(CL[0][0], 130, CL[0][1], { s: 0.9, lamp: GOOD, stroke: o.st && o.st[0] });
    bucket(CL[1][0], 130, CL[1][1], { stroke: o.st && o.st[1] });
    dbIcon(CL[2][0], 130, CL[2][1], { s: 0.9, stroke: o.st && o.st[2] }); }
  const PLAN = [['$ terraform plan', null], ['', null], ['Terraform will perform the following actions:', null], ['  # aws_instance.web will be created', 'var(--good)'],
    ['  # aws_s3_bucket.logs will be created', 'var(--good)'], ['      + bucket = "my-log-bkt-2026"', 'var(--good)'], ['  # aws_db_instance.db will be created', 'var(--good)'], ['Plan: 3 to add, 0 to change, 0 to destroy.', null]];
  const NADD = [0, 0, 1, 2, 3];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { cloud3(); const s = 1 - E(u, 0.8, 1.6) * 0.4; fileIc(130, 140, 'terraform.tfstate', { s: 1.5 * s, stroke: BAD, op: 1 - E(u, 1.2, 2.0) * 0.6 }); cross(130, 136, 26, pop(u, 1.0));
      ['포맷', 'rm 실수', 'CI 종료'].forEach((s, i) => pill(330, 80 + i * 56, s, INK, pop(u, 0.2 + i * 0.25), { fs: 14 }));
      CL.forEach(([x], i) => grow(160, 140, x - 40, 130, 1 - E(u, 1.4, 2.2), OFF, { dash: '5 5', plain: true }));
      banner(470, 330, '장부만 사라지고 실물은 남는다', pop(u, 2.1)); return; }
    if (k <= 4) { cloud3({ st: [k >= 2 ? WARN : null, k >= 3 ? WARN : null, k >= 4 ? WARN : null] });
      const sh = [3, 3, 4, 6, 8][k], prevSh = [0, 0, 3, 4, 6][k];
      terminal(22, 22, 466, 230, PLAN, k === 1 ? E(u, 0.2, 1.4) * 3 : lerp(prevSh, sh, E(u, 0.2, 1.2)), { fs: 13.5, lh: 22, title: k === 1 ? 'state 없이' : '' });
      if (k >= 2) pill(CL[0][0], 232, '이미 있음', WARN, k === 2 ? pop(u, 1.2) : 1, { fs: 13.5 });
      if (k === 3) { pill(735, 300, '버킷 이름은 전역에서 유일', BAD, pop(u, 1.4), { fs: 14 }); grow(735, 284, 735, 188, E(u, 1.6, 2.1), BAD, { sw: 2 }); }
      const n = tween(NADD[k - 1] ?? 0, NADD[k], u);
      if (k === 4) { meters(40, 290, 440, [{ name: 'to add', val: String(Math.round(n)), hot: true }, { name: 'to change', val: '0' }, { name: 'to destroy', val: '0' }]);
        sub(710, 300, '바꾼 게 없는데 add 3', fade(u, 1.4), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); sub(710, 324, 'state 손실부터 의심한다', fade(u, 1.7), { fill: INK }); }
      if (k === 1) sub(255, 300, '코드의 모든 것을 "만들 것" 으로 계산', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      return; }
    if (k === 5) { // 두 세계
      card(220, 170, 320, 220, { rx: 14, stroke: OFF, sw: 2.5, dash: '8 6' }); lbl(220, 92, 'terraform 의 인식', 1, { fill: MUT });
      mono(220, 190, String(Math.round(lerp(3, 0, E(u, 0.3, 1.2)))), { 'font-size': 72, 'font-weight': 800, 'text-anchor': 'middle', fill: OFF }); sub(220, 234, '리소스 (건)');
      cloud3(); const gap = E(u, 1.0, 2.0); el('line', { x1: 450 + gap * 15, y1: 30, x2: 450 - gap * 10, y2: 372, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '10 8', opacity: gap });
      banner(718, 330, 'EC2 1 · S3 1 · RDS 1', pop(u, 1.4)); sub(250, 330, '이 상태로 apply 하면 사고가 난다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 6) { cloud3({ st: [null, BAD, null] });
      terminal(22, 22, 466, 150, [['$ terraform apply', null], ['aws_instance.web: Creation complete [id=i-0newnew99]', 'var(--good)'], ['Error: creating S3 Bucket (my-log-bkt-2026):', '#f87171'], ['  BucketAlreadyOwnedByYou', '#f87171']], E(u, 0.1, 1.8) * 4, { fs: 13.5, title: '출력 예시' });
      server(590, 340, 'i-0newnew99', { s: 0.8, lamp: GOOD, stroke: WARN, op: fade(u, 0.7) }); pill(590, 280, '중복 생성', WARN, pop(u, 0.9), { fs: 13.5 });
      cross(735, 130, 22, pop(u, 1.4)); pill(800, 300, '반쯤 만들어진 채 중단', BAD, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 7) { cloud3({ st: [BAD, BAD, BAD] });
      card(230, 130, 300, 140, { rx: 12, stroke: OFF, sw: 2, dash: '6 6' }); lbl(230, 112, 'state', 1, { fill: MUT }); sub(230, 140, '(비어 있음)');
      CL.forEach(([x], i) => { grow(380, 130, x - 44, 130, 1, OFF, { dash: '4 6', plain: true }); });
      CL.forEach(([x], i) => pill(x, 232, '고아', BAD, pop(u, 0.3 + i * 0.25), { fs: 13.5 }));
      for (let i = 0; i < 12; i++) { const on = seg(u, 0.8 + i * 0.12, 1.0 + i * 0.12); if (on > 0) el('ellipse', { cx: 720, cy: 380 - i * 7, rx: 30, ry: 6, fill: WARN, stroke: PANEL, 'stroke-width': 1.5, opacity: on }); }
      sub(720, 404, '요금은 계속 나간다', fade(u, 1.2), { fill: WARN, 'font-weight': 700 });
      sub(230, 330, '수정도 삭제도 terraform 으로는 불가', fade(u, 1.6), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 8) { cloud3({ st: [GOOD, GOOD, GOOD] });
      const L = [['$ terraform import aws_instance.web i-0abcd1234', null], ['$ terraform import aws_s3_bucket.logs my-log-bkt-2026', null], ['$ terraform import aws_db_instance.db prod-db-01', null]];
      terminal(22, 280, 470, 116, L, E(u, 0.2, 2.0) * 3, { fs: 13.5, lh: 22 });
      card(240, 130, 300, 170, { rx: 12, stroke: GOOD, sw: 2 }); lbl(240, 70, 'state', 1, { fill: GOOD });
      ['aws_instance.web', 'aws_s3_bucket.logs', 'aws_db_instance.db'].forEach((a, i) => { const g = seg(u, 0.5 + i * 0.6, 1.1 + i * 0.6);
        mono(110, 110 + i * 34, a, { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: g });
        if (g > 0) grow(380, 104 + i * 34, CL[i][0] - 44, 130, g, GOOD, { plain: true, sw: 2 }); });
      return; }
    if (k === 9) { // import 100줄 / 1000줄
      lbl(250, 60, 'import 한 줄 = 리소스 한 개', 1, {});
      const cs = 17, n = Math.round(lerp(0, 100, E(u, 0.3, 2.3)));
      for (let i = 0; i < 100; i++) { const x = 60 + (i % 20) * cs, y = 90 + Math.floor(i / 20) * cs; el('rect', { x, y, width: cs - 3, height: cs - 3, rx: 2, fill: i < n ? (i < 10 ? WARN : BAD) : SOFT }); }
      sub(230, 200, '한 칸 = 10줄', 1);
      mono(230, 260, Math.round(n * 10) + ' 줄', { 'font-size': 34, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      [['리소스 100개', 'import 100줄'], ['리소스 1000개', 'import 1000줄']].forEach(([a, b], i) => { const y = 110 + i * 90, s = pop(u, 0.5 + i * 1.0);
        card(720, y, 300, 66, { rx: 10, stroke: i ? BAD : WARN, sw: 2, s }); tx(590, y + 6, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6 + i * 1.0) });
        mono(850, y + 6, b, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: i ? BAD : WARN, opacity: fade(u, 0.6 + i * 1.0) }); });
      banner(480, 360, '복구보다 예방이 압도적으로 싸다', pop(u, 2.2)); return; }
    // k === 10: 예방 세 가지
    [['S3 versioning ON', '이전 state 로 되돌린다'], ['DynamoDB lock', '동시 apply 를 막는다'], ['apply 직전 백업', 'state pull > backup']].forEach(([a, b], i) => {
      const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.45);
      card(cx, 200, 270, 230, { rx: 14, stroke: GOOD, sw: 2.5, s });
      if (i === 0) { [2, 1, 0].forEach((d) => fileIc(cx - 10 + d * 12, 160 - d * 10, null, { s: s * 1.1, stroke: d ? OFF : GOOD })); }
      if (i === 1) lock(cx, 160, true, GOOD, 1.8 * s);
      if (i === 2) { fileIc(cx - 26, 160, null, { s: s * 1.1 }); grow(cx - 6, 160, cx + 14, 160, seg(u, 1.4, 1.8), GOOD, {}); fileIc(cx + 36, 160, null, { s: s * 1.1 * pop(u, 1.6), stroke: GOOD }); }
      lbl(cx, 240, a, fade(u, 0.4 + i * 0.45), { fill: GOOD });
      tx(cx, 268, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.45), class: i === 2 ? 'mono' : null }); }); }

  // ---------- 5. state 안의 비밀 ----------
  const DOC = [['"type": "aws_db_instance",', null], ['"username": "admin",', null], ['"password": "S3cretP@ss2026!",', 'hot'], ['"endpoint": "prod-db-01.xxx..."', null]];
  function stateDoc(x, y, w, rows, o) { o = o || {}; zone(x, y, w, 40 + rows.length * 26, o.title || 'terraform.tfstate', { fill: PANEL, stroke: o.stroke || GRID, sw: 1.8, color: o.stroke });
    rows.forEach(([s, kind], i) => { const yy = y + 50 + i * 26, op = o.op ? o.op(i) : 1;
      if (kind === 'hot') el('rect', { x: x + 8, y: yy - 16, width: w - 16, height: 22, rx: 4, fill: BADBG, opacity: op });
      if (kind === 'ok') el('rect', { x: x + 8, y: yy - 16, width: w - 16, height: 22, rx: 4, fill: GOODBG, opacity: op });
      mono(x + 16, yy, s, { 'font-size': 13.5, 'font-weight': kind ? 700 : 400, fill: kind === 'hot' ? BAD : kind === 'ok' ? GOOD : INK, opacity: op }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { snippet(24, 40, ['output "db_password" {', '  value     = aws_db_instance.db.password', '  sensitive = true', '}'], { fs: 14 });
      if (k === 0) { el('rect', { x: 40, y: 104, width: 210, height: 3, fill: ACC, opacity: fade(u, 0.3) });
        terminal(470, 40, 460, 100, [['$ terraform output', null], ['db_password = <sensitive>', null]], E(u, 0.5, 1.4) * 2, { fs: 14 });
        pill(700, 200, '화면에서만 가린다', ACC, pop(u, 1.6), { fs: 15 }); sub(700, 240, '저장 방식과는 무관', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); return; }
      terminal(24, 200, 400, 90, [['$ terraform output', null], ['db_password = <sensitive>', null]], 2, { fs: 14 });
      stateDoc(470, 40, 460, DOC, {});
      const mask = 1 - E(u, 0.5, 1.5); el('rect', { x: 600, y: 116 + 26 * 2 - 16 + 0, width: 300 * mask, height: 22, rx: 4, fill: INK, opacity: mask > 0.01 ? 1 : 0 });
      lbl(700, 250, '파일을 열면 평문', fade(u, 1.6), { fill: BAD, 'font-size': 18 }); return; }
    if (k === 2) { lbl(480, 50, 'state 에 평문으로 남는 대표 필드', 1, {});
      [['aws_db_instance', 'password'], ['aws_iam_access_key', 'secret'], ['tls_private_key', 'private_key_pem'], ['random_password', 'result'], ['kubernetes_secret', 'data']].forEach(([r, f], i) => {
        const y = 100 + i * 56, s = pop(u, 0.2 + i * 0.3); card(480, y, 640, 44, { rx: 8, stroke: GRID, sw: 1.6, s });
        mono(190, y + 5, r, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); grow(470, y, 560, y, seg(u, 0.4 + i * 0.3, 0.8 + i * 0.3), MUT, {});
        mono(580, y + 5, f, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6 + i * 0.3) }); keyIc(770, y, BAD, 0.8 * s); }); return; }
    if (k <= 4) { snippet(300, 22, k === 3 ? ['backend "s3" {', '  bucket = "my-tfstate"', '  key    = "prod/terraform.tfstate"', '}'] : ['backend "s3" {', '  ...', '  encrypt        = true', '  kms_key_id     = "alias/tfstate"', '  dynamodb_table = "tfstate-lock"', '}'], { fs: 14 });
      laptop(110, 260, '로컬', {}); bucket(800, 270, 'my-tfstate', { s: 1.2, stroke: k === 4 ? GOOD : INK });
      if (k === 3) { fly(110, 250, 800, 262, seg(u, 0.6, 1.8), 'terraform.tfstate', { mono: true, fill: INK, stay: true });
        card(450, 370, 180, 44, { rx: 8, text: 'git 커밋 경로', fs: 14, stroke: OFF, color: MUT }); cross(450, 370, 14, pop(u, 1.8));
        sub(800, 360, 'state 는 버킷에', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      ['AES-256 암호화', 'KMS 키 권한', '잠금 테이블'].forEach((s, i) => pill(520, 210 + i * 50, s, GOOD, pop(u, 0.4 + i * 0.4), { fs: 14 }));
      lock(800, 266, true, GOOD, 1.6 * pop(u, 0.3)); keyIc(880, 216, INFO, pop(u, 0.9));
      sub(330, 380, 'encrypt 를 빼먹으면 저장 시 평문 그대로', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); return; }
    if (k === 5) { [['① 암호화한다', '유출돼도 피해를 줄인다', WARN, true], ['② 남기지 않는다', '애초에 비밀이 없다', GOOD, false]].forEach(([a, b, col, has], i) => {
        const cx = 260 + i * 440, s = pop(u, 0.2 + i * 0.7); card(cx, 200, 360, 250, { rx: 14, stroke: col, sw: 2.5, s });
        fileIc(cx, 150, null, { s: 1.8 * s, stroke: col }); if (has) { keyIc(cx + 4, 160, BAD, 0.9 * s); lock(cx + 50, 120, true, col, s); }
        else { tx(cx, 166, '∅', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: GOOD, opacity: s }); }
        lbl(cx, 240, a, fade(u, 0.4 + i * 0.7), { fill: col, 'font-size': 18 }); sub(cx, 270, b, fade(u, 0.5 + i * 0.7), { 'font-size': 15 }); });
      sub(480, 380, '①은 피해 축소, ②가 근본 해법', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k 6~9: Secrets Manager 에서 읽기
    const V = [800, 90], T = [480, 250], D = [800, 330];
    vault(V[0], V[1], 'Secrets Manager', { s: k === 6 ? pop(u, 0.3) : 1 });
    if (k === 6) { snippet(24, 40, ['data "aws_secretsmanager_secret_version" "db" {', '  secret_id = "prod/db/password"', '}'], { fs: 14 });
      grow(440, 75, 732, 85, E(u, 0.8, 1.6), INFO, { sw: 2.2 }); sub(600, 68, '조회', fade(u, 1.2), { fill: INFO, 'font-weight': 700 });
      pill(240, 200, '코드에 값 없음', GOOD, pop(u, 1.6), { fs: 15 }); pill(240, 250, 'tfvars 에도 없음', GOOD, pop(u, 1.9), { fs: 15 }); return; }
    card(T[0], T[1], 170, 54, { rx: 10, text: 'terraform apply', fs: 15, mono: true, stroke: INK });
    dbIcon(D[0], D[1], 'prod-db-01', { s: 0.85 });
    grow(V[0] - 40, V[1] + 40, T[0] + 60, T[1] - 28, 1, GRID, { plain: true }); grow(T[0] + 86, T[1] + 10, D[0] - 44, D[1] - 6, 1, GRID, { plain: true });
    const flow = k === 7 ? seg(u, 0.4, 2.0) : seg(u, 0.2, 1.2);
    dot([[V[0] - 40, V[1] + 40], [T[0] + 60, T[1] - 28], [T[0] + 86, T[1] + 10], [D[0] - 44, D[1] - 6]], flow, k === 9 ? GOOD : INFO, 7);
    if (k === 7) { snippet(24, 40, ['resource "aws_db_instance" "db" {', '  username = "admin"', '  password = data.aws_secrets…', '}'], { fs: 14 });
      sub(250, 200, '코드에는 경로만 남는다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(250, 224, '값은 실행 시점에 조회', fade(u, 1.9)); return; }
    if (k === 8) { grow(T[0] - 86, T[1] + 10, 260, 300, E(u, 1.0, 1.6), BAD, { sw: 2.2 });
      stateDoc(24, 300, 400, [['secret_string = "S3cretP@ss2026!"', 'hot'], ['password      = "S3cretP@ss2026!"', 'hot']], { stroke: BAD, op: (i) => fade(u, 1.5 + i * 0.3) });
      snippet(24, 40, ['data "aws_secretsmanager_..." "db"', 'password = data.aws_secrets…'], { fs: 14 });
      return; }
    // k === 9: write-only 인자
    snippet(24, 30, ['ephemeral "aws_secretsmanager_secret_version" "db"', 'password_wo         = ephemeral.aws_secr…', 'password_wo_version = 1'], { fs: 13.5 });
    grow(T[0] - 86, T[1] + 10, 260, 300, E(u, 1.0, 1.6), GOOD, { sw: 2.2 });
    stateDoc(24, 300, 400, [['password_wo   = (저장 안 함)', 'ok'], ['ephemeral 값 = (저장 안 함)', 'ok']], { stroke: GOOD, op: (i) => fade(u, 1.5 + i * 0.3) });
    pill(800, 200, 'Terraform 1.11+', GOOD, pop(u, 0.4), { mono: true, fs: 14 }); }

  // 6. (Step 5 끝) 사고 대응 순서 — s5 의 마지막 beat
  function s5x(t, c) { if (c.k < 10) return s5(t, c); const { u } = c;
    lbl(480, 70, 'tfstate 가 새어 나갔을 때', 1, { 'font-size': 18 });
    el('line', { x1: 110, y1: 200, x2: lerp(110, 850, E(u, 0.2, 2.0)), y2: 200, stroke: ACC, 'stroke-width': 4, 'stroke-linecap': 'round' });
    [['1', '비밀 회전', 'DB·IAM·TLS 키'], ['2', 'state 재암호화', '새 KMS 키'], ['3', 'git 기록 정리', '캐시 제거 요청'], ['4', 'CloudTrail 점검', '오용 흔적 확인']].forEach(([n, a, b], i) => {
      const x = 110 + i * 246.6, s = pop(u, 0.3 + i * 0.5);
      el('circle', { cx: x, cy: 200, r: 24 * s, fill: i === 0 ? BAD : ACC });
      mono(x, 207, n, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: PANEL, opacity: s });
      lbl(x, 262, a, fade(u, 0.4 + i * 0.5), { fill: i === 0 ? BAD : INK }); sub(x, 288, b, fade(u, 0.5 + i * 0.5)); });
    sub(480, 360, '파일을 지우는 게 아니라 비밀을 바꾸는 게 먼저다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: 'tfstate에서 코드의 aws_instance.web과 클라우드의 실제 인스턴스를 이어 주는 값은 무엇인가?',
      o: ['instances[].attributes.id', 'terraform_version', 'lineage'], a: 0,
      why: 'type과 name이 코드 주소를 만들고, attributes.id(i-0abcd1234)가 클라우드의 실물을 가리킨다. lineage는 state 파일 자체의 계보 표시다.' },
    { q: '클라우드에 i-0abcd1234가 떠 있는데 state만 지운 뒤 apply하면 무슨 일이 생기나?',
      o: ['terraform이 클라우드를 뒤져 i-0abcd1234를 찾아 다시 매핑한다', '기존 인스턴스를 지우고 새로 만든다', '같은 EC2를 하나 더 만들어 두 대가 된다'], a: 2,
      why: 'terraform의 판단 기준은 클라우드가 아니라 state다. 장부에 없으니 처음 만드는 것으로 보고 i-0newnew99를 하나 더 만든다.' },
    { q: 'A와 B가 각자 노트북의 로컬 state로 같은 코드를 apply했다. A가 다시 plan을 돌리면 B가 만든 i-0xyzz9999는 어떻게 보이나?',
      o: ['보이지 않는다. A의 state에 없기 때문이다', 'destroy 대상으로 나온다', 'A의 state로 자동으로 합쳐진다'], a: 0,
      why: 'terraform은 자기 state에 적힌 실물만 본다. 그래서 둘 다 No changes가 나오지만 서버는 두 대이고, 둘 다 아는 사람이 없다.' },
    { q: '아무것도 바꾸지 않았는데 plan에 Plan: 3 to add가 나왔다. 가장 먼저 의심할 것은?',
      o: ['provider 버전이 올라갔다', 'state 파일을 잃었다', '클라우드 리소스가 삭제됐다'], a: 1,
      why: 'state가 비면 코드의 모든 리소스를 처음 만들 것으로 계산한다. 실제 인프라는 그대로인데 add 숫자만 커진다.' },
    { q: 'output에 sensitive = true를 달았다. tfstate 파일 안의 그 값은 어떻게 저장되나?',
      o: ['평문 그대로 저장된다', 'AES-256으로 암호화된다', '저장되지 않는다'], a: 0,
      why: 'sensitive는 CLI 출력을 <sensitive>로 가리는 기능일 뿐이다. state에서 값을 빼려면 1.11의 write-only 인자 같은 다른 장치가 필요하다.' },
  ];

  const summary = [
    'tfstate는 코드 주소와 클라우드의 실제 ID를 한 줄씩 이어 둔 JSON 장부다.',
    'terraform은 클라우드가 아니라 state를 보고 판단해서, 장부가 비면 있는 리소스도 새로 만든다.',
    '로컬 state는 git으로 새거나 노트북마다 갈라진다. 팀이면 원격 backend로 옮긴다.',
    'sensitive는 화면만 가린다. state에는 비밀이 평문으로 남으니 암호화하고 접근을 줄인다.',
  ];
  const review = [
    { q: '동료가 노트북을 포맷한 뒤 plan을 돌리자 리소스 수십 개가 전부 + create로 나왔다. 가장 먼저 할 일은?',
      o: ['그대로 apply해서 state를 다시 만든다', '로컬 state가 사라진 것으로 보고 apply를 멈춘다', 'provider를 최신으로 올린다'], a: 1,
      why: '실물은 살아 있는데 장부만 없는 상태다. apply하면 중복 생성과 이름 충돌로 반쯤 만들어진 채 멈춘다.' },
    { q: 'tfstate가 실수로 GitHub에 push됐다. 가장 먼저 해야 할 일은?',
      o: ['force-push로 커밋을 지운다', 'state를 새 KMS 키로 다시 암호화한다', 'state 안의 DB 비밀번호와 키를 바꾼다'], a: 2,
      why: 'force-push를 해도 reflog나 PR 캐시, 클론에 사본이 남는다. 새어 나간 비밀은 회수가 아니라 회전으로 막는다.' },
    { q: 'DB 비밀번호를 Secrets Manager data 소스로 읽게 바꿨다. 아직 남은 위험은?',
      o: ['state에 secret_string과 password가 평문으로 남는다', '코드에 비밀번호가 적혀 있다', 'tfvars에 비밀번호가 남는다'], a: 0,
      why: 'data 소스 결과와 리소스 속성은 state에 저장된다. 코드와 git에서만 비밀이 빠지므로 state 보호는 계속 필요하다.' },
  ];

  R.page({ title: 'tfstate 장부 들여다보기', scenes: [s1, s2, s3, s4, s5x], quiz, summary, review });
})();
