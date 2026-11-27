/* IV-2-2 PR + plan 자동화 (Atlantis). 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * plan 출력·시각·버전·조건은 페이지 CODE 블록(pr-plan.md, atlantis-setup.yaml, apply-flow.md)과 STEPS 의 timeline 에서 옮겼다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, spans, cross, check, lock, terminal, server, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, kk, d) => (c.k > kk ? 1 : c.k === kk ? pop(c.u, d ?? 0.2) : 0);
  const fa = (c, kk, d) => (c.k > kk ? 1 : c.k === kk ? fade(c.u, d ?? 0.2) : 0);
  // GitHub PR 카드 머리
  function prHead(x, y, w, status, col, op) {
    el('rect', { x, y, width: w, height: 64, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6, opacity: op ?? 1 });
    tx(x + 14, y + 26, 'feat: add bastion EC2 for ops team', { 'font-size': 15, 'font-weight': 800, opacity: op ?? 1 });
    mono(x + 14, y + 50, 'feature/bastion-ec2 → main', { 'font-size': 13.5, fill: MUT, opacity: op ?? 1 });
    if (status) pill(x + w - tw(status, 13.5) / 2 - 26, y + 44, status, col || INK, 1, { fs: 13.5, fill: PANEL, op }); }
  // 타임라인 한 줄: 시각 · 누가 · 무엇
  function row(x, y, time, who, body, col, s) { const op = clamp(s ?? 1);
    el('circle', { cx: x + 8, cy: y - 5, r: 6, fill: col || MUT, opacity: op });
    mono(x + 22, y, time, { 'font-size': 13.5, fill: MUT, opacity: op });
    mono(x + 76, y, who, { 'font-size': 13.5, 'font-weight': 800, fill: col || INK, opacity: op });
    tx(x + 76 + tw(who, 13.5) + 10, y, body, { 'font-size': 13.5, opacity: op }); }
  // SG 와 22 포트
  function sgBox(cx, cy, open, s) { const g = R.G(cx, cy, s ?? 1);
    el('rect', { x: -110, y: -70, width: 220, height: 140, rx: 14, fill: 'none', stroke: open ? BAD : GOOD, 'stroke-width': 2.4, 'stroke-dasharray': '8 5' }, g);
    mono(-100, -50, 'bastion_sg', { 'font-size': 13.5, 'font-weight': 800, fill: open ? BAD : GOOD }, g);
    el('rect', { x: -122, y: -14, width: 24, height: 28, rx: 4, fill: open ? BAD : GOOD }, g); mono(-110, 34, ':22', { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: open ? BAD : GOOD }, g); return g; }

  // ---------- 1. 수동 PR + 로컬 apply ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0 || k === 2) { prHead(20, 30, 460, 'MERGED', INFO);
      ['+ resource "aws_instance" "bastion"', '+ resource "aws_security_group" "bastion_sg"', '+   cidr_blocks = ["0.0.0.0/0"]'].forEach((l, i) =>
        mono(36, 130 + i * 26, l, { 'font-size': 14, fill: i === 2 && k === 2 ? BAD : GOOD, 'font-weight': i === 2 && k === 2 ? 800 : 500 }));
      row(20, 230, '10:30', '@senior', 'LGTM 👍', MUT, k === 0 ? fade(u, 0.6) : 1);
      row(20, 260, '10:31', '@junior-dev', 'Merged into main', INFO, k === 0 ? fade(u, 1.0) : 1);
      el('rect', { x: 540, y: 60, width: 380, height: 200, rx: 12, fill: k === 2 ? BADBG : 'none', stroke: k === 2 ? BAD : MUT, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: k === 0 ? fade(u, 1.4) : 1 });
      tx(730, 150, 'plan 출력', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 2 ? BAD : MUT, opacity: k === 0 ? fade(u, 1.4) : 1 });
      tx(730, 178, 'PR 어디에도 없다', { 'font-size': 15, 'text-anchor': 'middle', fill: k === 2 ? BAD : MUT, opacity: k === 0 ? fade(u, 1.6) : 1 });
      if (k === 0) tx(250, 340, '리뷰어는 코드 diff만 보고 머지했다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      if (k === 2) { el('rect', { x: 30, y: 168, width: 300, height: 24, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.4) });
        mono(560, 226, '(있었다면) Plan: 2 to add', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
        tx(480, 360, '무엇이 만들어지는지 건수와 값으로 보여 줄 plan이 검토에서 빠졌다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 1) { terminal(20, 40, 330, 130, ['$ terraform apply', 'Apply complete! (10:35)'], 1 + E(u, 0.2, 0.8), { fs: 14, title: '내 노트북' });
      zone(420, 30, 520, 300, 'AWS', { fill: SOFT });
      server(640, 180, 'bastion EC2', { s: 0.8 * pop(u, 0.6) }); sgBox(640, 180, true, pop(u, 0.9));
      tx(840, 70, '인터넷', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(840, 94, '0.0.0.0/0', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      for (let i = 0; i < 8; i++) dot([[900, 120 + (i % 4) * 40], [770, 140 + (i % 3) * 30], [522, 180]], u > 1.6 ? ((t * 0.9 + i / 8) % 1) : 0, BAD, 5);
      card(180, 260, 300, 56, { rx: 10, text: '11:05 · SSH 무차별 대입 시작', fs: 15, fw: 800, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.8) });
      tx(180, 316, 'apply 30분 뒤', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    if (k === 3) { [['개발자 A', '1.5.7', 120], ['개발자 B', '1.7.2', 330]].forEach(([n, v, x], i) => { const s = pop(u, 0.2 + i * 0.3);
        card(x, 120, 170, 100, { rx: 10, stroke: INK, sw: 2.2, s }); el('rect', { x: x - 100, y: 170, width: 200, height: 10, rx: 4, fill: OFF, opacity: clamp(s) });
        mono(x, 112, 'terraform ' + v, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: i ? WARN : INFO, opacity: clamp(s) });
        tx(x, 214, n, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) }); });
      tx(225, 270, '노트북마다 버전이 다르면 결과도 갈린다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      zone(520, 50, 410, 250, 'apply 기록', { fill: SOFT });
      ['누가', '언제', '어떤 plan으로', '무엇을'].forEach((h, i) => { const y = 100 + i * 48;
        tx(545, y, h, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.2) });
        mono(880, y, '?', { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.4 + i * 0.2) }); });
      tx(725, 340, '감사 로그가 남지 않는다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      return; }
    // k = 4: 바꿀 흐름
    const F = ['PR push', 'bot이 plan', 'PR 코멘트', '승인', 'apply 코멘트'];
    F.forEach((s, i) => { const x = 100 + i * 190, sp = pop(u, 0.2 + i * 0.3);
      card(x, 150, 160, 56, { rx: 28, text: s, fs: 15, fw: 800, stroke: i === 3 ? GOOD : ACC, color: i === 3 ? GOOD : ACC, s: sp });
      if (i) grow(x - 110, 150, x - 82, 150, seg(u, 0.2 + i * 0.3, 0.5 + i * 0.3), MUT); });
    el('rect', { x: 20, y: 240, width: 920 * E(u, 1.6, 2.4), height: 34, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 });
    tx(480, 263, '모든 단계가 PR 타임라인에 남는다 = 감사 로그', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 2.3) }); }

  // ---------- 2. Atlantis 봇 ----------
  function container(cx, cy, s) { card(cx, cy, 310, 150, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s });
    mono(cx, cy - 46, 'atlantis :4141', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: clamp(s) }); }
  function s2(t, c) { const { k, u } = c;
    container(480, 110, at(c, 0, 0.2));
    if (k === 0) { ['GH_USER = atlantis-bot', 'GH_TOKEN = ghp_xxx', 'GH_WEBHOOK_SECRET = …', 'REPO_ALLOWLIST = github.com/myorg/*'].forEach((s, i) =>
        mono(340, 98 + i * 22, s, { 'font-size': 13.5, opacity: fade(u, 0.6 + i * 0.25) }));
      [['github.com/myorg/infra', true], ['github.com/other/repo', false]].forEach(([r, ok], i) => { const y = 270 + i * 60;
        mono(40, y, r, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.3) });
        grow(300, y - 5, ok ? 400 : 340, ok ? 180 : y - 5, seg(u, 1.6 + i * 0.3, 2.1 + i * 0.3), ok ? ACC : BAD);
        if (!ok && u > 2.4) cross(352, y - 5, 10, pop(u, 2.4)); });
      tx(620, 300, '봇 서버가 직접 clone → init → plan', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(620, 328, 'allowlist 밖 리포는 무시한다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    if (k === 1) { [['automerge', false], ['parallel_plan', true], ['parallel_apply', false]].forEach(([n, on], i) => { const y = 82 + i * 30;
        mono(376, y + 5, n, { 'font-size': 14, opacity: fade(u, 0.2 + i * 0.2) });
        el('rect', { x: 540, y: y - 9, width: 34, height: 18, rx: 9, fill: on ? GOOD : OFF, opacity: fade(u, 0.3 + i * 0.2) });
        el('circle', { cx: on ? 565 : 549, cy: y, r: 7, fill: PANEL, opacity: fade(u, 0.3 + i * 0.2) }); });
      tx(60, 250, 'plan', { 'font-size': 15, 'font-weight': 800 }); tx(60, 340, 'apply', { 'font-size': 15, 'font-weight': 800 });
      ['infra/prod', 'infra/staging'].forEach((d, i) => { const g = E(u, 0.8, 1.6);
        el('rect', { x: 140, y: 228 + i * 30, width: 260 * g, height: 22, rx: 5, fill: INFO, opacity: 0.8 }); mono(150, 244 + i * 30, d, { 'font-size': 13.5, fill: PANEL, opacity: g > 0.5 ? 1 : 0 }); });
      ['infra/prod', 'infra/staging'].forEach((d, i) => { const g = E(u, 1.0 + i * 0.8, 1.8 + i * 0.8);
        el('rect', { x: 140 + i * 270, y: 324, width: 260 * g, height: 22, rx: 5, fill: WARN, opacity: 0.8 }); mono(150 + i * 270, 340, d, { 'font-size': 13.5, fill: PANEL, opacity: g > 0.5 ? 1 : 0 }); });
      tx(700, 250, '동시에', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) });
      tx(700, 386, '하나씩 · 자동 머지 없음', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.4) });
      return; }
    if (k === 2) { snippet(370, 70, ['- name: prod-infra', '  dir: infra/prod', '  workspace: prod', '  terraform_version: v1.7.5'], { fs: 13.5, op: fade(u, 0.2) });
      [['1.5.7', 120], ['1.7.2', 290]].forEach(([v, x], i) => { mono(x, 300, 'terraform ' + v, { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: 1 - 0.7 * fade(u, 1.0) }); if (u > 1.0) cross(x + 150, 294, 9, pop(u, 1.0 + i * 0.2)); });
      card(700, 300, 260, 56, { rx: 10, text: '봇의 terraform v1.7.5 하나', fs: 15, fw: 800, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.5) });
      tx(480, 380, '모든 plan이 같은 버전으로 돈다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      return; }
    if (k === 3) { tx(40, 220, 'PR이 바꾼 파일', { 'font-size': 15, 'font-weight': 800 });
      [['infra/prod/main.tf', '"*.tf"', true], ['modules/vpc/main.tf', '"../modules/**/*.tf"', true], ['README.md', '규칙 밖', false]].forEach(([f, r, ok], i) => { const y = 256 + i * 44, s = pop(u, 0.2 + i * 0.3);
        mono(40, y, f, { 'font-size': 14.5, opacity: clamp(s) }); mono(300, y, r, { 'font-size': 13.5, fill: ok ? GOOD : MUT, opacity: clamp(s) });
        (ok ? check : cross)(540, y - 5, 9, pop(u, 0.6 + i * 0.3)); });
      card(120, 110, 140, 60, { rx: 10, text: 'GitHub', fs: 16, fw: 800, stroke: INK });
      grow(190, 110, 358, 110, E(u, 1.4, 1.9), MUT); dot([[190, 110], [358, 110]], seg(u, 1.4, 2.0), ACC, 7);
      mono(275, 98, 'PR opened', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      pill(760, 110, 'terraform plan 실행 중', ACC, pop(u, 2.1), { fs: 14 }); grow(602, 110, 655, 110, E(u, 2.0, 2.3), ACC);
      return; }
    if (k === 4) { [['approved', 'PR 승인'], ['mergeable', '머지 가능 상태'], ['undiverged', 'main과 어긋나지 않음']].forEach(([n, d], i) => { const x = 160 + i * 230, s = pop(u, 0.3 + i * 0.3);
        card(x, 290, 200, 70, { rx: 10, stroke: WARN, sw: 2.2, s }); lock(x - 70, 290, true, WARN, clamp(s));
        mono(x + 10, 286, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: clamp(s) });
        tx(x + 10, 310, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) }); });
      tx(160, 375, 'apply_requirements를 모두 채워야 apply가 열린다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      lock(780, 110, true, ACC, pop(u, 1.4)); mono(810, 116, 'prod 잠금', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      tx(780, 160, '다른 PR의 prod plan은 거절된다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      return; }
    // k = 5: staging + webhook
    [['prod-infra', ['approved', 'mergeable', 'undiverged']], ['staging-infra', ['approved']]].forEach(([n, req], i) => { const y = 240 + i * 80;
      mono(40, y + 5, n, { 'font-size': 15, 'font-weight': 800, opacity: i ? fade(u, 0.2) : 1 });
      req.forEach((r, j) => card(270 + j * 135, y, 122, 36, { rx: 18, text: r, fs: 13.5, mono: true, stroke: WARN, color: WARN, s: i ? pop(u, 0.4 + j * 0.2) : 1 })); });
    snippet(615, 230, ['Payload URL: https://atlantis…/events', 'Events: PR · Review · Push · Comments'], { fs: 13.5, op: fade(u, 1.2) });
    tx(600, 360, '환경마다 조건 강도를 다르게 준다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ---------- 3. PR 코멘트의 plan ----------
  const PLAN = [
    ['Ran terraform plan for dir: infra/prod workspace: prod', INK, 0],
    ['# aws_instance.bastion will be created', MUT, 1], ['+ resource "aws_instance" "bastion" {', GOOD, 1], ['    + ami           = "ami-0c11b2c..."', GOOD, 1], ['    + instance_type = "t3.small"', GOOD, 1], ['    + subnet_id     = "subnet-0a1b..."', GOOD, 1],
    ['# aws_security_group.bastion_sg will be created', MUT, 2], ['+ resource "aws_security_group" "bastion_sg" {', GOOD, 2], ['    + ingress { from_port = 22, to_port = 22', GOOD, 2], ['        protocol = "tcp"', GOOD, 2],
    ['        cidr_blocks = ["0.0.0.0/0"] }', BAD, 3],
    ['Plan: 2 to add, 0 to change, 0 to destroy.', INK, 4],
  ];
  function s3(t, c) { const { k, u } = c;
    el('rect', { x: 20, y: 20, width: 600, height: 390, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    el('rect', { x: 20, y: 20, width: 600, height: 34, rx: 10, fill: SOFT });
    tx(36, 43, '🤖 atlantis-bot 님의 코멘트' + (k === 5 ? ' · 갱신됨' : ''), { 'font-size': 14, 'font-weight': 800, fill: k === 5 ? GOOD : INK });
    PLAN.forEach(([l, col, kk], i) => { if (kk > k) return; const y = 80 + i * 26 + (i ? 8 : 0), s = kk === k ? fade(u, 0.2 + (i - PLAN.findIndex((p) => p[2] === kk)) * 0.25) : 1;
      let text = l, cc = col;
      if (i === 10 && k === 5 && u > 1.0) { text = '        cidr_blocks = ["10.20.0.0/16"] }'; cc = GOOD; }
      if (i === 10 && (k === 3 || (k === 5 && u <= 1.0))) el('rect', { x: 30, y: y - 17, width: 360, height: 24, rx: 4, fill: BADBG, opacity: s });
      mono(36, y, text, { 'font-size': 14, 'font-weight': i === 0 || i === 11 ? 800 : i === 10 ? 800 : 500, fill: cc, opacity: s }); });
    if (k >= 3) { card(790, 120, 300, 110, { rx: 12, stroke: WARN, sw: 2.2, fill: WARNBG, s: at(c, 3, 0.8) });
      tx(655, 98, '@senior', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fa(c, 3, 1.0) });
      tx(655, 124, '0.0.0.0/0은 위험합니다.', { 'font-size': 14.5, opacity: fa(c, 3, 1.1) });
      tx(655, 148, '사내 VPN 대역으로', { 'font-size': 14.5, opacity: fa(c, 3, 1.2) });
      mono(655, 172, '10.20.0.0/16', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fa(c, 3, 1.3) }); }
    if (k === 1) tx(790, 200, '코드 diff가 아니라 실제로 생길 값', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    if (k === 2) tx(790, 200, 'SG와 ingress 규칙이 함께 생긴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    if (k >= 4) { [['+2', GOOD], ['~0', WARN], ['-0', BAD]].forEach(([s, col], i) => card(690 + i * 90, 260, 76, 50, { rx: 10, text: s, fs: 20, fw: 800, mono: true, stroke: col, color: col, s: k === 4 ? pop(u, 0.3 + i * 0.2) : 1 }));
      ['atlantis apply -d infra/prod -w prod', 'atlantis plan -d infra/prod -w prod'].forEach((s, i) => mono(650, 330 + i * 26, (i ? '↻ ' : '▶ ') + s, { 'font-size': 13.5, fill: ACC, opacity: k === 4 ? fade(u, 1.2 + i * 0.3) : 1 })); }
    if (k === 4) tx(790, 400, '아직 apply 하지 않는다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    if (k === 5) { pill(790, 400, 'push → 봇이 plan을 다시 돌렸다', GOOD, pop(u, 1.4), { fs: 13.5 }); } }

  // ---------- 4. apply 승인 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { prHead(20, 20, 440, k === 1 && u > 2.4 ? 'MERGED' : 'OPEN', k === 1 && u > 2.4 ? INFO : GOOD);
      const T = [['10:36', 'atlantis-bot', 'Plan: 2 to add (갱신)', ACC], ['10:40', '@senior', 'Approved ✅', GOOD], ['10:41', '@senior', 'atlantis apply -d infra/prod -w prod', ACC]];
      T.forEach(([a, b, d, col], i) => row(24, 120 + i * 34, a, b, d, col, k === 0 ? fade(u, 0.3 + i * 0.5) : 1));
      if (k === 0) { tx(480, 330, 'PR 코멘트 한 줄이 운영 명령이 된다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
      ['approved', 'mergeable', 'undiverged'].forEach((n, i) => { const x = 560 + i * 130;
        card(x, 80, 116, 40, { rx: 20, text: n, fs: 13.5, mono: true, fw: 800, stroke: GOOD, color: GOOD }); check(x, 116, 9, pop(u, 0.2 + i * 0.3)); });
      el('rect', { x: 500, y: 160, width: 420, height: 18, rx: 6, fill: SOFT }); el('rect', { x: 500, y: 160, width: 420 * E(u, 1.0, 1.9), height: 18, rx: 6, fill: ACC });
      mono(500, 200, 'terraform apply', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      row(24, 222, '10:43', 'atlantis-bot', 'Apply complete! 2 added, 0 changed, 0 destroyed.', GOOD, fade(u, 1.9));
      row(24, 256, '10:44', '@senior', 'Merged into main', INFO, fade(u, 2.4));
      return; }
    if (k === 2) { const CMD = [['atlantis plan', '전체 plan 다시'], ['atlantis plan -d infra/prod', '디렉터리 하나만'], ['atlantis apply -d infra/prod -w prod', '워크스페이스 지정 적용'], ['atlantis unlock', '락 풀기'], ['atlantis approve_policies', '정책 검사 실패 승인']];
      CMD.forEach(([a, b], i) => { const y = 60 + i * 64, s = pop(u, 0.2 + i * 0.3);
        card(260, y, 470, 46, { rx: 10, stroke: ACC, s }); mono(40, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: clamp(s) });
        tx(520, y + 5, b, { 'font-size': 15, opacity: clamp(s) }); });
      return; }
    if (k === 3) { tx(40, 46, '시각', { 'font-size': 14, 'font-weight': 800, fill: MUT }); tx(116, 46, '누가 · 무엇', { 'font-size': 14, 'font-weight': 800, fill: MUT });
      const L = [['10:12', '@junior-dev', 'EC2 + SG 커밋', MUT], ['10:14', 'atlantis-bot', 'Plan: 2 to add', ACC], ['10:22', '@senior', '0.0.0.0/0 변경 요청', WARN], ['10:35', '@junior-dev', 'SG를 VPN 대역으로', MUT], ['10:40', '@senior', 'Approved', GOOD], ['10:41', '@senior', 'atlantis apply', ACC], ['10:43', 'atlantis-bot', 'Apply complete!', GOOD], ['10:44', '@senior', 'Merged', INFO]];
      el('line', { x1: 32, y1: 60, x2: 32, y2: lerp(60, 380, E(u, 0.2, 2.2)), stroke: GRID, 'stroke-width': 3 });
      L.forEach(([a, b, d, col], i) => row(24, 80 + i * 40, a, b, d, col, fade(u, 0.2 + i * 0.25)));
      tx(860, 200, '별도 감사 시스템 없이', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.2) });
      tx(860, 228, '누가·언제·무엇이 남는다', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 2.3) });
      return; }
    // k = 4: 남는 한계
    server(160, 170, '봇 서버 가용성', { s: pop(u, 0.2) });
    if (u > 0.6) { el('polyline', { points: '80,280 120,280 135,250 150,310 165,280 240,280', fill: 'none', stroke: BAD, 'stroke-width': 2.4, opacity: fade(u, 0.6) }); }
    R.dbIcon(480, 160, 'S3 + DynamoDB lock', { s: pop(u, 0.8), stroke: WARN }); lock(480, 160, true, WARN, pop(u, 1.0));
    [0, 1, 2].forEach((i) => person(740 + i * 60, 160, null, { s: 0.8 * pop(u, 1.3 + i * 0.15) }));
    tx(800, 230, 'RBAC · SSO는 약하다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    tx(480, 360, '셀프호스팅이라 운영 책임은 우리에게 남는다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }

  // ---------- 5. 대안 비교 ----------
  const TOOLS = ['Atlantis', 'Spacelift', 'Env0', 'TFC'];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const F = ['push', 'plan', '코멘트', '승인', 'apply', '기록'];
      F.forEach((s, i) => { const x = 90 + i * 156; card(x, 90, 126, 50, { rx: 25, text: s, fs: 15, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.2 + i * 0.2) }); if (i) grow(x - 93, 90, x - 65, 90, seg(u, 0.2 + i * 0.2, 0.4 + i * 0.2), MUT); });
      TOOLS.forEach((n, i) => { const y = 180 + i * 50; el('rect', { x: 30, y, width: 900 * E(u, 1.2 + i * 0.2, 1.9 + i * 0.2), height: 36, rx: 8, fill: i ? SOFT : ACCBG, stroke: i ? GRID : ACC });
        tx(48, y + 24, n, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.4 + i * 0.2) }); });
      return; }
    if (k === 1) { const ROWS = [['호스팅', '셀프', 'SaaS', 'SaaS', 'SaaS'], ['가격', '무료 OSS', '사용량', '사용량', 'Free→Plus'], ['정책 엔진', 'OPA(외부)', 'OPA 내장', 'OPA+자체', 'Sentinel'], ['Drift/state', '없음/직접', '자동/내장', '자동/내장', '자동/내장'], ['RBAC/SSO', '약함', '강함', '강함', '강함'], ['모듈 레지스트리', '외부', '내장', '내장', '공식']];
      TOOLS.forEach((n, j) => tx(260 + j * 170, 44, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }));
      ROWS.forEach((r, i) => { const y = 64 + i * 54, s = fade(u, 0.2 + i * 0.3);
        tx(30, y + 30, r[0], { 'font-size': 14.5, 'font-weight': 700, opacity: s });
        r.slice(1).forEach((v, j) => { const weak = j === 0 && (i === 3 || i === 4);
          el('rect', { x: 186 + j * 170, y: y + 6, width: 150, height: 40, rx: 7, fill: weak ? BADBG : SOFT, stroke: weak ? BAD : GRID, opacity: s });
          tx(261 + j * 170, y + 31, v, { 'font-size': 14, 'text-anchor': 'middle', fill: weak ? BAD : INK, 'font-weight': weak ? 800 : 500, opacity: s }); }); });
      return; }
    if (k === 2) { el('line', { x1: 60, y1: 250, x2: lerp(60, 900, E(u, 0.2, 1.0)), y2: 250, stroke: MUT, 'stroke-width': 3 });
      tx(900, 280, '팀 규모', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      [['~30명', 260], ['50명+', 640]].forEach(([s, x], i) => { el('line', { x1: x, y1: 240, x2: x, y2: 260, stroke: MUT, 'stroke-width': 2 }); mono(x, 284, s, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6 + i * 0.3) }); });
      card(220, 180, 260, 70, { rx: 10, text: 'Atlantis\n처음 도입 · 외부 SaaS 제약', fs: 14.5, stroke: ACC, color: INK, s: pop(u, 0.8) });
      card(680, 180, 300, 70, { rx: 10, text: 'Spacelift / Env0\nOPA · drift · 셀프서비스', fs: 14.5, stroke: WARN, s: pop(u, 1.2) });
      card(680, 350, 300, 70, { rx: 10, text: 'TFC\nVault·Consul 생태계 · Sentinel', fs: 14.5, stroke: INFO, s: pop(u, 1.6) });
      tx(250, 370, '규모보다 생태계가 먼저면', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    if (k === 3) { el('rect', { x: 40, y: 180, width: 360 * E(u, 0.2, 1.2), height: 44, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      tx(60, 208, 'Atlantis 6~12개월', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      [['정책이 부족하다', 'Spacelift', 90], ['환경 수요가 크다', 'Env0', 200], ['HashiCorp 생태계', 'TFC', 310]].forEach(([why, to, y], i) => { const s = seg(u, 1.0 + i * 0.4, 1.5 + i * 0.4);
        grow(400, 202, 560, y, s, MUT); tx(470, y - 10 + (y < 202 ? 0 : 20), why, { 'font-size': 13.5, fill: MUT, opacity: s });
        card(680, y, 200, 50, { rx: 25, text: to, fs: 16, fw: 800, stroke: WARN, color: WARN, s: pop(u, 1.3 + i * 0.4) }); });
      tx(480, 400, '흐름이 같아서 옮기는 비용은 학습과 설정 정도다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) });
      return; }
    // k = 4: 네 단계 정리
    const S = [['수동 로컬 apply', BAD], ['bot이 plan을 PR에', ACC], ['조건 검사 후 apply', GOOD], ['규모에 맞춰 SaaS', INFO]];
    S.forEach(([s, col], i) => { const x = 130 + i * 233, sp = pop(u, 0.2 + i * 0.4);
      card(x, 170, 200, 90, { rx: 12, text: s, fs: 15, fw: 800, stroke: col, color: col, s: sp });
      mono(x, 108, 'Step ' + (i === 0 ? '1' : i === 1 ? '2~3' : i === 2 ? '4' : '5'), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: clamp(sp) });
      if (i) grow(x - 133, 170, x - 102, 170, seg(u, 0.2 + i * 0.4, 0.5 + i * 0.4), MUT); });
    tx(480, 320, 'plan을 PR에 보이는 것이 출발점이다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: '이 사고에서 22번 포트가 열린 것을 리뷰에서 놓친 직접 원인은 무엇인가?',
      o: ['리뷰어가 Terraform을 몰라서', 'plan 출력이 PR에 붙지 않아 실제로 생길 값을 아무도 보지 않아서', 'AWS가 보안 그룹을 잘못 만들어서'], a: 1,
      why: 'diff만 보고 LGTM이 났고, plan은 머지 뒤 노트북에서만 돌았다. 0.0.0.0/0이 무엇을 뜻하는지 검토 단계에서 드러나지 않았다.' },
    { q: 'atlantis.yaml에 terraform_version: v1.7.5를 적으면 무엇이 해결되는가?',
      o: ['노트북마다 버전이 달라 결과가 갈리던 문제', 'state 잠금 문제', 'SSH 무차별 대입'], a: 0,
      why: '모든 plan과 apply가 봇 서버의 같은 버전으로 돈다. 1.5.7과 1.7.2가 섞이던 문제가 사라진다.' },
    { q: '봇이 올린 plan 요약이 "Plan: 2 to add, 0 to change, 0 to destroy."다. 리뷰어가 다음에 할 일은 무엇인가?',
      o: ['바로 atlantis apply를 적는다', 'PR을 닫고 로컬에서 apply한다', '접힌 세부 출력을 펴서 실제 값(cidr_blocks 등)을 본다'], a: 2,
      why: '요약 건수만으로는 위험을 모른다. 세부 출력에서 cidr_blocks = ["0.0.0.0/0"]을 찾아 변경을 요청했다.' },
    { q: 'prod 프로젝트에서 atlantis apply가 거부됐다. apply_requirements 기준으로 가장 먼저 의심할 것은?',
      o: ['terraform 버전', 'approve 리뷰가 없거나, 머지할 수 없거나, main과 어긋난 상태', 'webhook 비밀값'], a: 1,
      why: 'prod는 approved, mergeable, undiverged 세 조건을 모두 요구한다. 하나라도 빠지면 apply 코멘트가 거부된다.' },
    { q: 'Atlantis 대신 SaaS로 옮기는 흔한 이유는 무엇인가?',
      o: ['PR 코멘트로 plan을 보는 기능이 Atlantis에 없어서', 'Atlantis는 GitHub를 지원하지 않아서', '봇 운영 부담과 약한 RBAC·drift 감지를 넘기고 싶어서'], a: 2,
      why: '네 도구 모두 PR에서 plan을 보고 승인 뒤 apply하는 흐름은 같다. 갈리는 곳은 운영 부담, 정책 엔진, drift, RBAC다.' },
  ];

  const summary = [
    '코드 diff만 보고 머지한 뒤 노트북에서 apply하자 22번 포트가 인터넷에 열렸다.',
    'Atlantis는 PR 이벤트를 받아 같은 terraform 버전으로 plan을 돌리고 결과를 코멘트로 단다.',
    '리뷰어는 plan의 실제 값에서 0.0.0.0/0을 찾았고, 고친 push에 봇이 plan을 다시 돌렸다.',
    'apply는 approved, mergeable, undiverged를 통과해야 열리고 모든 단계가 PR에 기록된다.',
  ];
  const review = [
    { q: '봇이 plan을 올렸는데 다른 PR이 같은 prod를 plan하려 하자 잠겨 있다는 답이 왔다. 이유는?',
      o: ['Atlantis가 prod 워크스페이스를 잠가 동시 작업을 막고 있다', 'GitHub webhook이 끊겼다', 'terraform 버전이 달라서'], a: 0,
      why: 'plan을 돌린 PR이 그 디렉터리와 워크스페이스를 잠근다. 앞 PR이 끝나거나 atlantis unlock으로 풀어야 한다.' },
    { q: 'atlantis.yaml에 automerge: false를 두었다. apply가 성공한 뒤 PR은 어떻게 되는가?',
      o: ['봇이 바로 머지한다', '열린 채로 남고 사람이 머지한다', 'PR이 자동으로 닫힌다'], a: 1,
      why: '자동 머지를 껐으므로 apply 결과를 확인한 리뷰어가 머지한다. 그 시각도 타임라인에 남는다.' },
    { q: '보안팀이 지난달 prod 변경을 누가 언제 적용했는지 물었다. 이 흐름에서 가장 빨리 찾는 곳은?',
      o: ['각 개발자 노트북의 셸 기록', 'Terraform state 파일의 주석', '해당 PR 타임라인의 apply 코멘트와 결과 코멘트'], a: 2,
      why: 'apply는 PR 코멘트로만 실행되므로 작성자와 시각, 결과가 같은 PR에 남는다.' },
  ];

  R.page({ title: 'PR 위의 plan과 apply', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
