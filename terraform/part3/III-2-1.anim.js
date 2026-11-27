/* III-2-1 state 명령 (import · mv · rm · list/show) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   세 칸: 코드(.tf) · state(장부) · 클라우드(실물). 아래 줄은 지금 친 명령과 그 명령이 닿는 칸 */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, terminal, snippet } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ---------- 지역 도우미 ----------
  const CX = [169, 480, 791], COLS = [{ x: 24, w: 290, t: '코드 (.tf)' }, { x: 334, w: 292, t: 'state (장부)' }, { x: 646, w: 290, t: '클라우드 (실물)' }];
  function cols(hot, o) { o = o || {}; COLS.forEach((cl, i) => { const h = hot === i;
    el('rect', { x: cl.x, y: 18, width: cl.w, height: o.h || 304, rx: 12, fill: h ? ACCBG : SOFT, stroke: h ? ACC : 'none', 'stroke-width': 1.8 });
    lbl(cl.x + cl.w / 2, 44, cl.t, 1, { fill: h ? ACC : MUT }); }); }
  // 아래 명령 줄: 글자가 타이핑되고, 끝나면 닿는 칸으로 점이 올라간다
  function cmdBar(cmd, u, to, o) { o = o || {}; const shown = o.done ? 1 : seg(u, 0.1, 0.9);
    el('rect', { x: 24, y: 338, width: 912, height: 62, rx: 10, fill: INK });
    mono(42, 375, '$ ' + cmd.slice(0, Math.round(cmd.length * shown)), { 'font-size': o.fs || 14.5, fill: PANEL });
    (to || []).forEach((ci, i) => dot([[CX[ci], 336], [CX[ci], 300]], seg(u, 1.0 + i * 0.15, 1.5 + i * 0.15), o.col || ACC, 7)); }
  // 장부 한 줄
  function srow(y, addr, id, o) { o = o || {}; const w = 272, x = 480 - w / 2, col = o.col || INK, op = o.op ?? 1, sx = o.sx ?? 1;
    el('rect', { x, y: y - 24, width: w * sx, height: 48, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || col, 'stroke-width': 2, opacity: op });
    if (sx > 0.9) { mono(x + 12, y - 4, addr, { 'font-size': o.afs || 13.5, 'font-weight': 700, fill: col, opacity: op, 'text-decoration': o.strike ? 'line-through' : null });
      mono(x + 12, y + 16, '→ ' + id, { 'font-size': 13.5, fill: MUT, opacity: op }); } }
  function ec2(y, id, badge, o) { o = o || {}; server(791, y, null, { s: 0.72, lamp: o.lamp || GOOD, stroke: o.stroke, op: o.op });
    mono(791, y + 52, id, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: o.op ?? 1 });
    if (badge) pill(791, y + 82, badge, o.bcol || MUT, o.bs ?? 1, { fs: 13.5 }); }
  function codeBlock(lines, o) { o = o || {}; return snippet(36, o.y || 70, lines, { fs: o.fs || 13.5, w: 266, op: o.op }); }
  const stamp = (x, y, s, col, sc) => pill(x, y, s, col, sc, { fs: 14 });

  // ---------- 1. import ----------
  const WEB = ['resource "aws_instance" "web" {', '  ami           = "ami-0c11…"', '  instance_type = "t3.micro"', '}'];
  function s1(t, c) { const { k, u } = c, b = c.beat;
    cols(k === 2 ? 1 : k === 1 || k === 5 ? 0 : -1);
    ec2(130, 'i-0123abcd', k === 0 ? '콘솔 생성' : k === 2 ? '손대지 않음' : '그대로', { bcol: k === 2 ? GOOD : MUT, bs: k === 2 ? pop(u, 1.6) : 1 });
    if (k === 0) { sub(480, 150, '(비어 있음)', 1, { 'font-size': 15 }); sub(169, 150, '(아직 없음)', 1, { 'font-size': 15 });
      cmdBar('terraform state list', u, []); mono(500, 375, '# 아무것도 안 나온다', { 'font-size': 14, fill: OFF, opacity: fade(u, 1.0) });
      pill(480, 250, '이대로 apply 하면 + 하나 더', BAD, pop(u, 1.6), { fs: 14 }); return; }
    if (k === 5) { codeBlock(['import {', '  to = aws_instance.web', '  id = "i-0123abcd"', '}'], { op: fade(u, 0.2) });
      cmdBar('terraform plan -generate-config-out=generated.tf', u, [0, 1], { fs: 13.5 });
      pill(169, 220, 'generated.tf 초안', ACC, pop(u, 1.4), { mono: true, fs: 13.5 });
      card(480, 150, 270, 64, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.2) });
      mono(480, 145, 'Plan: 1 to import,', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) });
      mono(480, 167, '0 to add, 0 to destroy', { 'text-anchor': 'middle', 'font-size': 14, fill: INK, opacity: fade(u, 1.4) });
      sub(480, 230, 'apply 때 state에 들어간다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    // 코드 블록: k1 에 줄 단위로 나타남
    const ln = k === 1 ? Math.ceil(lerp(0.01, 4, E(u, 0.2, 1.6))) : 4;
    codeBlock(WEB.slice(0, ln), { op: k === 4 ? 0.45 : 1 });
    if (k === 1) { cmdBar('cat > main.tf', u, [0]); sub(480, 150, '(여전히 비어 있음)', 1, { 'font-size': 15 }); sub(169, 210, 'import는 코드를 만들어 주지 않는다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    const ra = k === 2 ? E(u, 1.3, 2.0) : 1;
    srow(130, 'aws_instance.web', 'i-0123abcd', { col: GOOD, sx: Math.max(0.01, ra), fill: GOODBG });
    if (k === 2) { cmdBar(b.command, u, [1]); grow(616, 130, 735, 130, E(u, 2.0, 2.5), GOOD, { plain: true, sw: 2 }); return; }
    if (k === 3) { cmdBar('terraform plan', u, [0, 1, 2]);
      const fixd = E(u, 1.6, 2.2);
      mono(169, 220, fixd < 0.5 ? 'ami: 코드 ≠ 실제' : 'ami: 코드 = 실제', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: fixd < 0.5 ? WARN : GOOD, opacity: fade(u, 1.0) });
      pill(480, 250, 'No changes가 될 때까지 코드 수정', GOOD, pop(u, 2.2), { fs: 13.5 }); return; }
    // k === 4
    cmdBar(b.command, 0, [], { done: true });
    el('rect', { x: 36, y: 66, width: 266 * E(u, 0.3, 1.0), height: 120, fill: SOFT, opacity: 0.85 });
    pill(169, 230, '블록이 없으면', BAD, pop(u, 0.8), { fs: 14 }); pill(480, 230, 'import가 에러로 멈춘다', BAD, pop(u, 1.2), { fs: 14 });
    sub(480, 300, 'import ID 형식은 자원마다 다르다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); }

  // ---------- 2. state mv ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    cols(k === 1 || k === 6 ? 0 : k === 2 || k === 4 ? 1 : -1);
    ec2(130, 'i-0123abcd', '그대로', {});
    const newName = k >= 1, morph = k === 1 ? E(u, 0.4, 1.2) : 1;
    if (k === 6) { codeBlock(['moved {', '  from = aws_instance.web', '  to   = aws_instance.web_server', '}'], { op: fade(u, 0.2) });
      const m = E(u, 1.0, 1.8); srow(130, m < 0.5 ? 'aws_instance.web' : 'aws_instance.web_server', 'i-0123abcd', { col: m < 0.5 ? INK : GOOD });
      cmdBar('terraform plan', u, [0, 1]); pill(480, 220, 'web has moved to web_server', GOOD, pop(u, 1.8), { mono: true, fs: 13.5 });
      sub(480, 262, '재생성 없음 · PR로 리뷰된다', fade(u, 2.1), { fill: INK, 'font-weight': 700 }); return; }
    codeBlock(['resource "aws_instance"', '  "' + (newName ? (morph < 0.5 ? 'web' : 'web_server') : 'web') + '" {', '  ...', '}']);
    if (k === 0) { srow(130, 'aws_instance.web', 'i-0123abcd', {}); cmdBar('terraform plan   # 코드 이름만 바꾼 뒤', u, [0, 1, 2], { fs: 14 });
      pill(480, 220, '- aws_instance.web', BAD, pop(u, 1.4), { mono: true, fs: 14 }); pill(480, 262, '+ aws_instance.web_server', GOOD, pop(u, 1.7), { mono: true, fs: 14 });
      cross(791, 126, 20, pop(u, 2.1)); mono(169, 240, '1 to add, 1 to destroy', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    const mvd = k === 2 ? E(u, 1.4, 2.0) : k >= 3 ? 1 : 0;
    const addr = k === 4 ? (u < 1.4 ? 'aws_instance.web_server' : 'module.app.aws_instance.web_server') : mvd < 0.5 ? 'aws_instance.web' : 'aws_instance.web_server';
    srow(130, addr, 'i-0123abcd', { col: k === 1 ? BAD : mvd > 0.5 ? GOOD : INK, afs: addr.length > 30 ? 13.5 : 13.5 });
    if (k === 1) { cmdBar(b.command, u, [0], { fs: 13.5 }); grow(306, 110, 342, 120, E(u, 1.2, 1.6), BAD, { plain: true }); pill(320, 200, '주소 불일치', BAD, pop(u, 1.6), { fs: 14 });
      sub(169, 260, '이 상태로 apply 하면 사고', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 2) { cmdBar('terraform state mv aws_instance.web aws_instance.web_server', u, [1], { fs: 13.5 }); stamp(791, 262, 'ID·속성 그대로', GOOD, pop(u, 2.2)); return; }
    if (k === 3) { cmdBar('terraform plan', u, [0, 1, 2]); [0, 1, 2].forEach((i) => check(CX[i], 250, 12, pop(u, 1.5 + i * 0.2))); sub(480, 296, 'No changes', fade(u, 1.8), { class: 'mono', fill: GOOD, 'font-size': 16, 'font-weight': 700 }); return; }
    if (k === 4) { cmdBar('terraform state mv aws_instance.web_server module.app.aws_instance.web_server', u, [1], { fs: 13.5 });
      pill(480, 230, 'web[0] → web["primary"]', INFO, pop(u, 2.0), { mono: true, fs: 13.5 }); sub(480, 270, 'count 인덱스를 map 키로도 옮긴다', fade(u, 2.2)); return; }
    // k === 5: 짝
    cmdBar(b.command, 0, [], { done: true, fs: 13.5 });
    card(169, 250, 220, 50, { rx: 25, text: '코드 이름 수정', fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.2) });
    card(480, 250, 220, 50, { rx: 25, text: 'state mv', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.5) });
    grow(282, 250, 366, 250, E(u, 0.8, 1.2), ACC, { sw: 3, plain: true }); sub(324, 282, '항상 짝', fade(u, 1.0), { fill: ACC, 'font-weight': 700 });
    pill(791, 250, 'state pull > backup', INK, pop(u, 1.6), { mono: true, fs: 13.5 }); sub(791, 290, '작업 전 백업', fade(u, 1.8)); }

  // ---------- 3. state rm ----------
  const WS = ['resource "aws_instance"', '  "web_server" {', '  ...', '}'];
  function s3(t, c) { const { k, u } = c, b = c.beat;
    cols(k === 2 ? 1 : k === 3 ? 0 : -1);
    const alive = true;
    ec2(130, 'i-0123abcd', k === 4 ? null : '살아 있음', { bcol: GOOD });
    if (k === 5) { // destroy vs rm 비교
      el('rect', { x: 24, y: 18, width: 912, height: 304, rx: 12, fill: PANEL });
      [['', 'state', '실제 자원'], ['terraform destroy', '삭제', '삭제'], ['terraform state rm', '삭제', '그대로']].forEach((r, i) => { const y = 70 + i * 80, s = i ? pop(u, 0.2 + i * 0.5) : 1;
        r.forEach((cell, j) => { const x = [210, 560, 800][j]; if (!cell) return;
          if (i === 0) lbl(x, y, cell, 1, { fill: MUT });
          else if (j === 0) mono(x, y + 5, cell, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: s });
          else { const bad = cell === '삭제'; card(x, y, 140, 46, { rx: 8, text: cell, fs: 16, stroke: bad ? BAD : GOOD, color: bad ? BAD : GOOD, fill: bad ? BADBG : GOODBG, s }); } }); });
      cmdBar('# 차이는 하나: 실제 자원까지 지우는가', u, []); return; }
    if (k === 0) { codeBlock(WS); srow(130, 'aws_instance.web_server', 'i-0123abcd', {});
      cmdBar('terraform destroy -target=aws_instance.web_server', u, [1, 2], { col: BAD, fs: 13.5 });
      cross(480, 210, 16, pop(u, 1.6)); cross(791, 126, 20, pop(u, 1.7)); pill(480, 270, '절대 금지: 운영 EC2까지 삭제', BAD, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 1) { codeBlock(WS); srow(130, 'aws_instance.web_server', 'i-0123abcd', {});
      cmdBar(b.command, u, [1], { fs: 14 }); fly(480, 150, 480, 250, seg(u, 1.3, 2.0), 'backup-before-rm.tfstate', { mono: true, fill: INFO, stay: true }); return; }
    if (k === 2) { codeBlock(WS); const g = 1 - E(u, 1.3, 2.0); if (g > 0.02) srow(130, 'aws_instance.web_server', 'i-0123abcd', { col: BAD, sx: g, strike: true });
      if (g <= 0.02) sub(480, 140, '(비어 있음)', 1, { 'font-size': 15 }); cmdBar(b.command, u, [1], { fs: 14 }); stamp(791, 230 + 30, '변화 없음', GOOD, pop(u, 2.1)); return; }
    if (k === 3) { const g = 1 - E(u, 0.4, 1.4); codeBlock(WS.slice(0, Math.max(0, Math.ceil(4 * g))), { op: g });
      if (g < 0.1) sub(169, 150, '(블록 삭제)', fade(u, 1.4), { 'font-size': 15 }); sub(480, 140, '(비어 있음)', 1, { 'font-size': 15 });
      cmdBar(b.command, u, [0], { fs: 13.5 }); pill(169, 260, '남기면 다음 apply가 + create', WARN, pop(u, 1.8), { fs: 13.5 }); return; }
    // k === 4
    sub(169, 150, '(없음)', 1, { 'font-size': 15 }); sub(480, 150, '(없음)', 1, { 'font-size': 15 });
    person(880, 250, '다른 팀', { s: pop(u, 1.2) }); grow(840, 250, 820, 190, E(u, 1.4, 1.8), GOOD, {});
    cmdBar('terraform plan   # No changes', u, [0, 1]); pill(700, 250, '인수', GOOD, pop(u, 1.6), { fs: 14 }); }

  // ---------- 4. list / show ----------
  const LIST = ['aws_instance.web_server', 'aws_security_group.web_sg', 'aws_vpc.main', 'module.app.aws_iam_role.app_role'];
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { lbl(480, 60, '권장 작업 순서', 1, { 'font-size': 18 });
      [['list', '무엇이 있나'], ['pull', '백업'], ['mv · rm · import', '작업'], ['plan', 'No changes 확인']].forEach(([a, b2], i) => { const x = 140 + i * 226, s = pop(u, 0.3 + i * 0.45);
        if (i) grow(x - 226 + 80, 190, x - 80, 190, E(u, 0.2 + i * 0.45, 0.5 + i * 0.45), ACC, { sw: 2.5 });
        card(x, 190, 150, 90, { rx: 14, stroke: i === 3 ? GOOD : ACC, sw: 2.5, s }); mono(x, 186, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: i === 3 ? GOOD : ACC, opacity: s });
        sub(x, 212, b2, s); });
      sub(480, 320, 'list·show는 읽기 전용, 아무것도 바꾸지 않는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { cols(1); codeBlock(['(코드는 그대로)'], {}); srow(130, 'aws_instance.web_server', 'i-0123abcd', { col: INFO });
      ec2(130, 'i-0123abcd', '콘솔에서 바뀐 속성', { bcol: WARN });
      grow(735, 110, 616, 110, E(u, 1.2, 2.0), INFO, { sw: 3 }); sub(676, 96, '실제 → state', fade(u, 1.6), { fill: INFO, 'font-weight': 700 });
      cmdBar('terraform apply -refresh-only', u, [1]); pill(480, 240, 'state만 다시 맞춘다', INFO, pop(u, 2.2), { fs: 14 }); return; }
    // 터미널 출력
    if (k === 0 || k === 2) { const out = k === 0 ? LIST : LIST;
      terminal(24, 22, 560, 220, [['$ terraform state list' + (k === 2 ? ' | grep aws_instance' : ''), null]].concat(out.map((s) => [s, k === 2 && !s.startsWith('aws_instance') ? '#57534a' : null])), k === 0 ? 1 + E(u, 0.4, 1.8) * 4 : 5, { fs: 14 });
      if (k === 2) { el('rect', { x: 30, y: 74, width: 548, height: 24, rx: 4, fill: ACC, opacity: 0.25 * fade(u, 0.8) }); pill(760, 150, "list 'module.app.*'", INFO, pop(u, 1.4), { mono: true, fs: 14 }); sub(760, 190, '모듈 안만 골라 본다', fade(u, 1.7)); }
      else { mono(760, 120, String(Math.round(lerp(0, 4, E(u, 0.4, 1.8)))), { 'text-anchor': 'middle', 'font-size': 56, 'font-weight': 800, fill: ACC }); sub(760, 156, '등록된 주소', 1, { 'font-size': 15 }); sub(760, 180, '모듈 안 자원까지', fade(u, 1.8)); }
      cmdBar('# 읽기만 한다', 0, [], { done: true }); return; }
    if (k === 1) { terminal(24, 22, 560, 300, [['$ terraform state show aws_instance.web_server', null], ['resource "aws_instance" "web_server" {', null], ['  ami           = "ami-0c11b7e8a3f1c2d4e"', null], ['  id            = "i-0123abcd"', '#4ade80'], ['  instance_type = "t3.micro"', null], ['  private_ip    = "10.0.1.42"', null], ['  ...', null], ['}', null]], 1 + E(u, 0.3, 2.0) * 7, { fs: 14, title: '출력 예시' });
      card(780, 160, 270, 90, { rx: 12, stroke: ACC, sw: 2, s: pop(u, 2.0) }); tx(780, 154, 'terraform이 기억하는 값', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(780, 180, 'state 스냅샷 전체', fade(u, 2.2)); return; }
    // k === 3: pull
    cols(1); srow(110, 'aws_instance.web_server', 'i-0123abcd', {}); srow(170, 'aws_security_group.web_sg', 'sg-0789', {}); srow(230, 'aws_vpc.main', 'vpc-001', {});
    ec2(130, 'i-0123abcd', null, {}); codeBlock(['…'], {});
    cmdBar('terraform state pull > current.tfstate', u, [1]);
    fly(480, 290, 169, 230, seg(u, 1.3, 2.1), 'current.tfstate', { mono: true, fill: INFO, stay: true }); sub(169, 270, 'JSON 그대로 저장', fade(u, 2.2)); }

  // ---------- 5. 함정 ----------
  const MAT = [['import', 'state 추가', 0], ['state mv', '키 변경', 0], ['state rm', '제거', 0], ['state list', '읽기', 0], ['apply', '반영', 1], ['destroy', '제거', 1]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(240, 170, 340, 240, { rx: 14, stroke: ACC, sw: 2.5 }); lbl(240, 80, '장부 (state 파일)', 1, { fill: ACC });
      mono(240, 180, 'terraform.tfstate', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700 }); sub(240, 210, 'JSON 한 파일');
      card(720, 170, 340, 240, { rx: 14, stroke: WARN, sw: 2.5, s: pop(u, 0.5) }); lbl(720, 80, '창고 (실제 AWS)', fade(u, 0.6), { fill: WARN });
      server(660, 180, null, { s: 0.6 * pop(u, 0.7) }); server(780, 180, null, { s: 0.6 * pop(u, 0.9) }); sub(720, 250, '돈이 나가는 곳', fade(u, 1.1));
      el('rect', { x: 474, y: 40, width: 12, height: 280 * E(u, 1.2, 2.0), rx: 4, fill: INK });
      cmdBar('# state 명령은 state 파일만 바꾼다', u, []); return; }
    if (k === 1 || k === 2) { // 영향 범위 표
      el('rect', { x: 24, y: 18, width: 912, height: 312, rx: 12, fill: PANEL });
      ['명령', 'state', '실제 자원'].forEach((h, j) => lbl([200, 520, 780][j], 46, h, 1, { fill: MUT }));
      MAT.forEach(([cmd, st, real], i) => { const y = 84 + i * 40, show = i < 4 ? (k === 1 ? fade(u, 0.2 + i * 0.3) : 1) : (k === 2 ? fade(u, 0.3 + (i - 4) * 0.5) : 0);
        if (show <= 0) return; const hot = k === 2 && i >= 4;
        if (hot) el('rect', { x: 34, y: y - 18, width: 892, height: 34, rx: 6, fill: ACCBG, opacity: show });
        mono(200, y + 5, 'terraform ' + cmd, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: show });
        tx(520, y + 5, st, { 'text-anchor': 'middle', 'font-size': 14.5, opacity: show });
        if (real) check(780, y, 9, show); else cross(780, y, 8, show); });
      cmdBar(k === 1 ? '# import · mv · rm · list : 실제 자원 열은 전부 X' : '# 실제를 바꾸는 명령은 apply와 destroy뿐', u, [], { fs: 14 }); return; }
    if (k === 3) { cols(-1); sub(169, 150, '(블록 없음)', 1, { 'font-size': 15 }); srow(130, 'aws_instance.web', 'state에만 있음', { col: WARN });
      ec2(130, 'i-0123abcd', null, { stroke: BAD }); cmdBar('terraform plan', u, [0, 1, 2]);
      pill(480, 230, '- aws_instance.web will be destroyed', BAD, pop(u, 1.5), { mono: true, fs: 13.5 }); mono(480, 280, '0 to add, 1 to destroy', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 4) { cols(-1); codeBlock(WS); sub(480, 150, '(rm 완료, 비어 있음)', 1, { 'font-size': 15 });
      server(740, 120, null, { s: 0.6 }); server(840, 120, null, { s: 0.6 * pop(u, 1.6), stroke: BAD }); mono(740, 172, '원본', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }); mono(840, 172, '중복', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      cmdBar('terraform apply   # 코드가 남아 있어 새로 만든다', u, [0, 1, 2], { fs: 14 });
      pill(480, 230, '+ aws_instance.web_server', GOOD, pop(u, 1.3), { mono: true, fs: 14 }); pill(791, 240, '같은 자원 2개', BAD, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 5) { lbl(480, 46, '안전한 작업 순서', 1, { 'font-size': 17 });
      ['list로 확인', 'pull로 백업', 'import·mv·rm', '코드 맞추기', 'plan 확인', 'push -force로 롤백'].forEach((s, i) => { const x = 90 + (i % 3) * 300, y = 120 + Math.floor(i / 3) * 110, sc = pop(u, 0.2 + i * 0.3);
        card(x + 60, y, 220, 64, { rx: 12, stroke: i === 5 ? WARN : ACC, sw: 2, s: sc });
        el('circle', { cx: x - 40, cy: y, r: 18 * sc, fill: i === 5 ? WARN : ACC }); mono(x - 40, y + 6, String(i + 1), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: PANEL, opacity: sc });
        tx(x + 60, y + 6, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: sc }); });
      sub(480, 316, '6번은 문제가 있을 때만 (백업의 serial이 낮아 -force 필요)', fade(u, 2.2), { fill: WARN, 'font-weight': 700 });
      cmdBar('terraform state pull > backup.tfstate  →  작업  →  terraform plan', u, [], { fs: 13.5 }); return; }
    // k === 6: 세 고리
    [[390, 150, '코드'], [570, 150, 'state'], [480, 250, '실제']].forEach(([x, y, s], i) => { const sc = pop(u, 0.2 + i * 0.3);
      el('circle', { cx: x, cy: y - 20, r: 100 * sc, fill: [ACC, INFO, WARN][i], opacity: 0.13, stroke: [ACC, INFO, WARN][i], 'stroke-width': 2.5 });
      lbl(x + (i === 0 ? -50 : i === 1 ? 50 : 0), y + (i === 2 ? 50 : -60), s, fade(u, 0.4 + i * 0.3), { fill: [ACC, INFO, WARN][i], 'font-size': 17 }); });
    check(480, 160, 18, pop(u, 1.5)); sub(480, 196, '셋이 맞아야 안전', fade(u, 1.7), { fill: INK, 'font-weight': 700, 'font-size': 15 });
    cmdBar('# 실제를 바꾸는 건 plan → apply뿐', u, [], { fs: 14 }); }

  const quiz = [
    { q: '콘솔에서 만든 EC2를 terraform import로 가져온 직후 바뀐 곳은 어디인가?',
      o: ['state에만 주소와 ID 한 줄이 생긴다', '코드에 resource 블록이 자동으로 생긴다', 'EC2가 terraform 설정으로 다시 만들어진다'], a: 0,
      why: 'import는 장부에 aws_instance.web → i-0123abcd를 적을 뿐이다. 코드는 직접 쓰고, plan이 No changes가 될 때까지 맞춘다.' },
    { q: '코드에서 web을 web_server로 이름만 바꾸고 state mv 없이 plan하면 무엇이 나오나?',
      o: ['No changes', '1 to add, 1 to destroy', '0 to add, 1 to change'], a: 1,
      why: 'terraform에게 주소가 다르면 다른 자원이다. web은 지우고 web_server는 새로 만드는 계획이 된다. state mv나 moved 블록이 이를 막는다.' },
    { q: '운영 중인 EC2를 다른 팀에 넘기려고 terraform 관리에서만 빼고 싶다. 맞는 방법은?',
      o: ['terraform destroy -target', 'terraform apply -refresh-only', 'terraform state rm 후 코드 블록도 삭제'], a: 2,
      why: 'state rm은 장부에서만 줄을 지우고 실물은 남긴다. 코드 블록이 남아 있으면 다음 apply가 같은 자원을 하나 더 만든다.' },
    { q: 'terraform apply -refresh-only가 하는 일은 무엇인가?',
      o: ['실제 자원의 현재 값을 state에만 반영한다', '코드에 맞게 실제 자원을 고친다', 'state의 주소를 바꾼다'], a: 0,
      why: '실제에서 state 쪽으로만 맞춘다. 콘솔에서 바뀐 속성을 장부에 받아 적을 뿐 자원은 건드리지 않는다.' },
    { q: 'import, state mv, state rm, state list 가운데 실제 클라우드 자원을 바꾸는 명령은 몇 개인가?',
      o: ['한 개', '두 개', '하나도 없다'], a: 2,
      why: '네 명령 모두 state 파일만 다룬다. 실제 자원은 apply와 destroy로만 바뀐다.' },
  ];

  const summary = [
    'state 명령은 장부만 고치고, 실제 자원은 apply와 destroy로만 바뀐다.',
    'import는 state에 줄을 더할 뿐이라 코드 블록을 직접 쓰고 plan으로 맞춘다.',
    '이름을 바꿀 때 state mv나 moved 블록을 안 쓰면 삭제 후 재생성 계획이 나온다.',
    'state rm은 실물을 남긴다. 코드도 같이 지우고, 작업 전에는 state pull로 백업한다.',
  ];
  const review = [
    { q: 'import해 둔 EC2가 며칠 뒤 plan에서 destroy로 나왔다. 먼저 의심할 것은?',
      o: ['import ID 형식이 틀렸다', '누군가 코드에서 그 resource 블록을 지웠다', 'refresh-only를 안 돌렸다'], a: 1,
      why: 'state에는 있는데 코드에 없으면 terraform은 지울 대상으로 본다. 관리를 끝내려면 블록 삭제와 state rm을 함께 한다.' },
    { q: 'state rm으로 관리를 해제했는데, 다음 apply에서 똑같은 EC2가 하나 더 생겼다. 원인은?',
      o: ['코드에 resource 블록이 남아 있었다', 'state rm이 EC2를 지우지 못했다', 'state pull 백업을 안 했다'], a: 0,
      why: '코드에는 블록이 있고 state는 비었으니 새로 만들 대상이 된다. rm과 코드 블록 삭제는 한 세트다.' },
    { q: '팀 저장소에서 리소스 이름을 바꾸는 PR을 올린다. 모든 환경에 같은 이동이 적용되게 하려면?',
      o: ['각 환경에서 손으로 state mv를 친다', 'state rm 후 다시 import한다', 'moved 블록을 코드에 넣는다'], a: 2,
      why: 'moved 블록은 코드로 남아 리뷰되고, 어느 환경에서 plan해도 재생성 없이 주소만 옮긴다.' },
  ];

  R.page({ title: '코드 · state · 실물 세 칸', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
