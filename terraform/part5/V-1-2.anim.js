/* V-1-2 drift 감지 + sentinel — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 틀: main.tf(원하는 상태) · terraform.tfstate(알고 있는 상태) · AWS(현재 상태) 세 칸의 instance_type 을 나란히 비교한다.
 * 값은 각 beat 의 stateRes / liveRes 데이터를 읽는다. 터미널·plan 출력은 실행 결과가 아니라 동작 규칙으로 만든 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, tokens, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, lock, terminal, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const chip = (cx, cy, s, col, sc, o) => pill(cx, cy, s, col, sc, Object.assign({ mono: true, fs: 13.5, fill: PANEL }, o || {}));
  const vals = (c) => ({ code: 't3.small', st: c.beat.stateRes.instanceType, live: c.beat.liveRes.instanceType,
    pst: c.prev ? c.prev.stateRes.instanceType : c.beat.stateRes.instanceType, plive: c.prev ? c.prev.liveRes.instanceType : c.beat.liveRes.instanceType });

  // 세 칸: o.y 위쪽, o.h 높이, o.code/st/live 값, o.pop(i) 등장, o.flash(i) 값이 바뀐 칸
  const COLS = [[170, 'main.tf', '원하는 상태'], [480, 'terraform.tfstate', '알고 있는 상태'], [790, 'AWS', '현재 상태']];
  function three(o) { const y = o.y ?? 24, h = o.h ?? 120, w = 270;
    const v = [o.code, o.st, o.live];
    COLS.forEach(([cx, name, role], i) => { const s = o.pop ? o.pop(i) : 1; if (s <= 0) return;
      const bad = v[i] !== v[0] && i > 0, col = o.hot === i ? ACC : bad ? BAD : INK;
      card(cx, y + h / 2, w, h, { rx: 12, stroke: o.hot === i ? ACC : GRID, sw: o.hot === i ? 2.8 : 1.6, s, fill: i === 2 ? SOFT : PANEL });
      if (s < 0.6) return;
      mono(cx - w / 2 + 16, y + 26, name, { 'font-size': 14.5, 'font-weight': 800 });
      tx(cx + w / 2 - 16, y + 26, role, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      mono(cx - w / 2 + 16, y + h - 30, 'instance_type', { 'font-size': 13.5, fill: MUT });
      mono(cx + w / 2 - 16, y + h - 30, `"${v[i]}"`, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: o.vop ? o.vop(i) : 1 });
      if (o.extra && o.extra[i]) tx(cx - w / 2 + 16, y + h - 8, o.extra[i], { 'font-size': 13.5, fill: o.extraCol || MUT }); });
    // 칸 사이 = / ≠
    [[325, v[0], v[1]], [635, v[1], v[2]]].forEach(([x, a, b], i) => { if (o.pop && o.pop(i + 1) < 0.6) return; if (o.noRel) return;
      tx(x, y + h / 2 + 10, a === b ? '=' : '≠', { 'font-size': 28, 'font-weight': 800, fill: a === b ? GOOD : BAD, 'text-anchor': 'middle' }); }); }

  // ================= 1. drift 란 =================
  function s1(t, c) { const { k, u } = c, v = vals(c);
    const live = k === 1 && u < 1.4 ? v.plive : v.live;
    three({ code: v.code, st: v.st, live, pop: k === 0 ? (i) => pop(u, 0.2 + i * 0.4) : null, hot: k === 1 && u > 1.4 ? 2 : null });
    if (k === 0) { note(480, 200, '세 칸이 같으면 plan은 할 일이 없다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { [['콘솔 직접 수정', 0.2], ['보안팀 규칙 추가', 0.5], ['다른 팀의 작업', 0.8], ['오토스케일링', 1.1]].forEach(([s, a], i) => {
        const x = 150 + i * 220; chip(x, 250, s, WARN, pop(u, a), { mono: false, fs: 14.5 });
        dot([[x, 232], [790, 150]], seg(u, a + 0.2, a + 1.0), WARN, 6); });
      note(480, 340, 'state는 그대로, 실제만 t3.large로 바뀌었다', fade(u, 1.8), { 'text-anchor': 'middle', fill: BAD }); return; }
    if (k === 2) { // 다음 apply 가 되돌린다
      el('path', { d: 'M170,150 C170,250 790,250 790,150', fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: E(u, 0.2, 1.0) });
      chip(480, 232, '다음 apply: t3.large → t3.small', BAD, pop(u, 0.8));
      zone(150, 290, 660, 100, null, { fill: BADBG });
      note(176, 326, '급해서 키운 서버가 다음 배포 때 다시 작아진다', fade(u, 1.4));
      note(176, 360, '리뷰를 안 거친 변경이라 누가 왜 바꿨는지 기록도 없다', fade(u, 1.9)); return; }
    if (k === 3) { // 변경 경로
      const path = [['변경 요청', 90], ['main.tf 수정', 270], ['PR 리뷰', 450], ['apply', 610], ['AWS', 780]];
      path.forEach(([s, x], i) => { chip(x, 250, s, i === 4 ? INK : GOOD, pop(u, 0.2 + i * 0.25), { mono: false, fs: 14.5 }); if (i < 4) grow(x + 62, 250, path[i + 1][1] - 62, 250, E(u, 0.35 + i * 0.25, 0.6 + i * 0.25), GOOD); });
      el('path', { d: 'M90,272 C90,360 780,360 780,272', fill: 'none', stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': '6 6', opacity: fade(u, 1.6) });
      chip(435, 340, '콘솔 수정: 긴급일 때만 + 사후에 코드 반영', WARN, pop(u, 1.8), { mono: false, fs: 14 }); return; }
    // k === 4: 앞으로 쌓을 보호막
    [['감지', 'plan'], ['동기화', 'refresh-only'], ['차단', 'Sentinel · OPA'], ['자동화', 'CI cron']].forEach(([a, b], i) => {
      const x = 150 + i * 220, s = pop(u, 0.2 + i * 0.4);
      card(x, 270, 190, 84, { rx: 12, stroke: ACC, sw: 2.2, s, fill: i === 0 ? ACCBG : PANEL });
      if (s > 0.6) { lbl(x, 262, `${i + 1}. ${a}`, 1, { fill: ACC }); mono(x, 290, b, { 'font-size': 14, 'text-anchor': 'middle' }); }
      if (i < 3) grow(x + 98, 270, x + 120, 270, E(u, 0.4 + i * 0.4, 0.6 + i * 0.4), ACC); });
    note(480, 370, 'drift는 없앨 수 없다. 빨리 찾고 정한 방향으로 푸는 체계를 만든다', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  // ================= 2. plan 으로 감지 =================
  const SH = ['$ set -euo pipefail', '$ terraform init -input=false', '$ terraform plan -detailed-exitcode \\', '    -out=/tmp/plan.bin || EXIT=$?'];
  function exitBoxes(on, u, o) { o = o || {};
    [['0', '변경 없음', GOOD], ['1', '에러', BAD], ['2', '변경 있음', WARN]].forEach(([n, s, col], i) => { const y = 200 + i * 66, hot = on === i;
      card(760, y, 300, 54, { rx: 10, stroke: hot ? col : GRID, sw: hot ? 2.8 : 1.6, fill: hot ? (i === 0 ? GOODBG : i === 1 ? BADBG : WARNBG) : PANEL, s: o.pop ? o.pop(i) : 1 });
      if (!o.pop || o.pop(i) > 0.6) { mono(632, y + 7, 'exit ' + n, { 'font-size': 17, 'font-weight': 800, fill: col }); tx(720, y + 6, s, { 'font-size': 15, 'font-weight': 700 }); if (o.what && o.what[i]) tx(900, y + 6, o.what[i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } }); }
  function s2(t, c) { const { k, u } = c, v = vals(c);
    three({ y: 16, h: 104, code: v.code, st: v.st, live: v.live });
    if (k === 0) { terminal(24, 150, 560, 150, [SH[0], SH[1], ['Terraform has been successfully initialized!', null]], 3 * E(u, 0.2, 1.8), { title: 'plan-detect.sh' });
      note(24, 340, '실패하면 즉시 멈춘다', fade(u, 1.6)); note(24, 372, '조용히 실패하면 "drift 없음"으로 오해한다', fade(u, 2.0), { fill: WARN });
      exitBoxes(null, u, { pop: () => 0 }); return; }
    if (k === 1) { terminal(24, 150, 560, 190, [SH[2], SH[3], '', ['  ~ instance_type = "t3.large" -> "t3.small"', '#fbbf24'], ['Plan: 0 to add, 1 to change, 0 to destroy.', null]], 5 * E(u, 0.2, 2.2), { title: 'plan (예시)' });
      dot([[790, 120], [790, 170], [480, 170], [170, 170], [170, 120]], seg(u, 0.4, 1.4), INFO, 6);
      note(24, 372, 'set -e 아래에서는 || 로 받아야 exit 2에서 스크립트가 안 끊긴다', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 2) { exitBoxes(null, u, { pop: (i) => pop(u, 0.3 + i * 0.4) });
      note(24, 230, '기본 plan은 변경이 있어도 exit 0이다', fade(u, 1.6)); note(24, 264, '-detailed-exitcode가 있어야', fade(u, 1.9)); note(24, 294, '결과가 종료 코드에 담긴다', fade(u, 2.1)); return; }
    if (k === 3) { exitBoxes(0, u, { what: ['조용히 종료', '출력 남기고 실패', ''] });
      dot([[480, 120], [480, 200], [610, 200]], seg(u, 0.3, 1.2), GOOD, 7);
      terminal(24, 160, 440, 120, ['✅ 변경 없음 — drift 없음', ['exit 0', '#4ade80']], 2 * E(u, 1.0, 2.0), { title: 'EXIT=0' });
      note(24, 320, 'exit 1은 plan 출력을 남기고 실패로 끝낸다', fade(u, 1.8)); note(24, 352, '에러와 drift를 섞으면 알람을 아무도 안 본다', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 4) { exitBoxes(2, u, { what: ['', '', 'terraform show'] });
      dot([[790, 120], [790, 140], [610, 332]], seg(u, 0.3, 1.2), WARN, 7);
      terminal(24, 160, 560, 150, ['⚠️ Drift 감지됨 — 코드와 실제가 다릅니다', '$ terraform show /tmp/plan.bin', ['  ~ instance_type = "t3.large" -> "t3.small"', '#fbbf24']], 3 * E(u, 0.8, 2.2), { title: 'EXIT=2 (예시)' });
      note(24, 350, '"변경 있음"이 곧 drift는 아니다. 사람이 읽고 판정한다', fade(u, 2.3)); return; }
    // k === 5: Slack
    exitBoxes(2, u, {});
    card(250, 230, 400, 110, { rx: 14, stroke: INFO, sw: 2.2, fill: INFOBG, s: pop(u, 0.6) });
    mono(70, 210, '#infra-drift', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) });
    tx(70, 244, 'Drift detected in prod', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
    tx(70, 272, 'webhook으로 보낸 메시지', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
    fly(610, 332, 450, 230, seg(u, 0.2, 0.8), 'curl webhook', { mono: true, fill: INFO });
    chip(250, 330 + 40, 'exit 2 → CI에서도 실패로 표시', WARN, pop(u, 1.6), { mono: false, fs: 14.5 }); }

  // ================= 3. refresh-only =================
  function s3(t, c) { const { k, u } = c, v = vals(c);
    const st = k === 4 ? (u < 1.2 ? v.pst : v.st) : v.st, code = k === 5 && u > 1.8 ? 't3.large' : v.code;
    three({ code, st, live: v.live, hot: k === 4 && u > 1.2 ? 1 : k === 5 && u > 1.8 ? 0 : null, vop: (i) => (k === 5 && i === 0 && u > 1.8 ? fade(u, 1.8) : 1) });
    const arrowRS = (g, col, dash) => { if (g <= 0) return; el('path', { d: 'M790,150 C790,210 480,210 480,150', fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-dasharray': dash, opacity: g }); };
    if (k === 0) { el('path', { d: 'M170,150 C170,250 790,250 790,150', fill: 'none', stroke: OFF, 'stroke-width': 3, 'stroke-dasharray': '6 6', opacity: fade(u, 0.3) });
      chip(330, 252, '① apply: 실제를 코드로 되돌림', MUT, pop(u, 0.4), { mono: false, fs: 14 });
      arrowRS(E(u, 1.0, 1.6), ACC); chip(640, 220, '② refresh-only: state만 실제로', ACC, pop(u, 1.4), { mono: false, fs: 14 });
      cross(170, 175, 10, pop(u, 2.0)); note(200, 330, 'refresh-only는 main.tf를 건드리지 않는다', fade(u, 2.1)); note(200, 362, '콘솔 변경이 맞는 변경일 때만 쓴다', fade(u, 2.3), { fill: WARN }); return; }
    if (k === 1) { arrowRS(1, ACC, '6 5'); chip(640, 220, '미리보기', ACC, 1, { mono: false });
      terminal(24, 250, 600, 150, ['$ terraform plan -refresh-only -out=/tmp/refresh.bin', ['Note: Objects have changed outside of Terraform', '#fbbf24'], ['  ~ instance_type = "t3.small" -> "t3.large"', '#fbbf24']], 3 * E(u, 0.3, 2.0), { title: 'refresh-only plan (예시)' });
      fly(624, 330, 790, 330, seg(u, 2.0, 2.6), '/tmp/refresh.bin', { mono: true, fill: INK, stay: true }); return; }
    if (k === 2) { card(480, 290, 520, 150, { rx: 12, stroke: WARN, sw: 2.4, s: pop(u, 0.2), fill: WARNBG });
      if (u > 0.4) { note(250, 250, '위 내용이 state에 반영됩니다.', fade(u, 0.4)); note(250, 280, '리소스는 만들거나 지우지 않습니다.', fade(u, 0.8));
        mono(250, 322, '계속하시겠습니까? (y/N) _', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) }); }
      lock(690, 318, true, WARN, pop(u, 1.8)); return; }
    if (k === 3) { chip(300, 270, '입력: N', MUT, pop(u, 0.3));
      grow(370, 270, 520, 270, E(u, 0.6, 1.0), MUT); chip(620, 270, '"취소됨" · exit 0', MUT, pop(u, 1.0));
      note(480, 350, 'state는 그대로, drift도 그대로 남는다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { arrowRS(E(u, 0.2, 1.0), ACC); chip(640, 220, 'apply -refresh-only', ACC, pop(u, 0.4));
      if (u > 1.2) check(480, 205, 12, pop(u, 1.3));
      note(480, 300, '실제 인프라는 손대지 않고 state만 고친다', fade(u, 1.6), { 'text-anchor': 'middle' });
      note(480, 334, '이제 main.tf와 state가 어긋난다', fade(u, 2.1), { 'text-anchor': 'middle', fill: BAD }); return; }
    // k === 5: 남은 숙제
    [['main.tf 수정', 0.2], ['PR', 0.6], ['리뷰', 1.0], ['apply', 1.4]].forEach(([s, a], i) => { const x = 170 + i * 210;
      chip(x, 260, s, GOOD, pop(u, a), { mono: false, fs: 15 }); if (i < 3) grow(x + 62, 260, x + 148, 260, E(u, a + 0.2, a + 0.4), GOOD); });
    note(480, 340, '세 칸이 다시 같아져야 다음 plan이 깨끗하다', fade(u, 2.1), { 'text-anchor': 'middle' }); }

  // ================= 4. Sentinel =================
  const RC = [['aws_instance.web', 'managed', 'update', 't3.large'], ['aws_s3_bucket.logs', 'managed', 'create', '—'], ['aws_instance.old', 'managed', 'delete', '—'], ['data.aws_ami.base', 'data', 'read', '—']];
  const FORBID = ['t3.large', 't3.xlarge', 'm5.large', 'm5.xlarge', 'c5.large'];
  function rcTable(x, y, keep, u, o) { o = o || {};
    tx(x, y - 12, 'tfplan.resource_changes (예시)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    RC.forEach(([addr, mode, act, it], i) => { const yy = y + i * 40, k = keep ? keep(i) : 1, hot = o.hot === i;
      el('rect', { x, y: yy, width: 470, height: 34, rx: 6, fill: hot ? BADBG : PANEL, stroke: hot ? BAD : GRID, 'stroke-width': hot ? 2.4 : 1.2, opacity: 0.25 + 0.75 * k });
      mono(x + 12, yy + 22, addr, { 'font-size': 14, 'font-weight': 700, opacity: 0.3 + 0.7 * k });
      mono(x + 230, yy + 22, act, { 'font-size': 14, fill: act === 'delete' ? BAD : act === 'create' ? GOOD : WARN, opacity: 0.3 + 0.7 * k });
      mono(x + 300, yy + 22, mode, { 'font-size': 13.5, fill: MUT, opacity: 0.3 + 0.7 * k });
      mono(x + 458, yy + 22, it, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: it === 't3.large' ? BAD : MUT, opacity: 0.3 + 0.7 * k });
      if (k < 0.5) el('line', { x1: x + 8, y1: yy + 17, x2: x + 462, y2: yy + 17, stroke: OFF, 'stroke-width': 2 }); }); }
  function gate(cx, cy, open, s) { const g = R.G(cx, cy, s ?? 1); const col = open ? GOOD : BAD;
    el('rect', { x: -60, y: -60, width: 14, height: 120, rx: 3, fill: INK }, g); el('rect', { x: 46, y: -60, width: 14, height: 120, rx: 3, fill: INK }, g);
    el('rect', { x: -46, y: -8, width: 92 * (open ? 0.15 : 1), height: 16, rx: 3, fill: col }, g);
    tx(0, 84, open ? 'apply 진행' : 'apply 차단', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }, g); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { card(150, 150, 180, 110, { rx: 12, stroke: INK, sw: 2.2, s: pop(u, 0.2), text: 'plan 결과\n(JSON)', fs: 16 });
      grow(245, 150, 395, 150, E(u, 0.6, 1.2), ACC); mono(320, 136, 'tfplan/v2', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      card(500, 150, 200, 110, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 1.0), text: '정책 코드\n(Sentinel)', fs: 16, color: ACC, fill: ACCBG });
      grow(605, 150, 720, 150, E(u, 1.4, 1.9), MUT); gate(800, 150, true, pop(u, 1.8));
      note(480, 320, '검사 대상은 인프라가 아니라 적용되기 전의 계획이다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { tx(480, 60, 'forbidden_instance_types', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono' });
      FORBID.forEach((s, i) => chip(160 + i * 160, 130, s, BAD, pop(u, 0.3 + i * 0.25), { fill: BADBG }));
      note(480, 230, '목록도 코드라 PR 리뷰를 거친다', fade(u, 1.8), { 'text-anchor': 'middle' });
      note(480, 264, '왜 막혔는지 코드에서 바로 확인할 수 있다', fade(u, 2.1), { 'text-anchor': 'middle', fill: MUT }); return; }
    const keep = (i) => (k === 2 ? 1 - (i === 0 ? 0 : seg(u, 0.6 + i * 0.4, 1.0 + i * 0.4)) : i === 0 ? 1 : 0);
    rcTable(30, 60, keep, u, { hot: k >= 3 ? 0 : null });
    if (k === 2) { ['type = aws_instance', 'mode = managed', 'actions에 create · update'].forEach((s, i) => chip(740, 70 + i * 50, s, ACC, pop(u, 0.2 + i * 0.4), { mono: false, fs: 14 }));
      note(30, 260, '삭제만 있는 변경, data source, 다른 타입은 건너뛴다', fade(u, 2.2)); return; }
    if (k === 3) { // after 값으로 판정
      fly(470, 77, 700, 130, seg(u, 0.4, 1.3), 'after = t3.large', { mono: true, fill: BAD, stay: true });
      FORBID.slice(0, 3).forEach((s, i) => chip(700, 190 + i * 40, s, i === 0 ? BAD : MUT, 1, { fill: i === 0 ? BADBG : PANEL }));
      if (u > 1.5) check(800, 190, 9, pop(u, 1.5));
      zone(30, 250, 470, 80, 'violating', { fill: BADBG, stroke: BAD, sw: 2 }); if (u > 1.7) chip(170, 300, 'aws_instance.web', BAD, pop(u, 1.8));
      note(30, 370, '바뀌기 전(before)이 아니라 바뀐 뒤(after) 값을 본다', fade(u, 2.2)); return; }
    if (k === 4) { zone(30, 250, 470, 80, 'violating', { fill: BADBG, stroke: BAD, sw: 2 }); chip(170, 300, 'aws_instance.web', BAD, 1);
      mono(560, 110, 'main = rule {', { 'font-size': 15, 'font-weight': 700 }); mono(580, 140, 'length(violating) is 0', { 'font-size': 15, 'font-weight': 700, fill: ACC }); mono(560, 170, '}', { 'font-size': 15 });
      mono(580, 210, `length = 1 → ${u > 1.0 ? 'false' : '?'}`, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
      gate(800, 300, false, pop(u, 1.2)); return; }
    // k === 5: 위반 메시지
    terminal(30, 240, 600, 160, ['🛑 차단: aws_instance.web instance_type = t3.large', '   사유: 비용 큰 인스턴스는 prod에서 금지', ['   예외 신청: #infra-policy 슬랙 채널', '#fbbf24']], 3 * E(u, 0.2, 1.8), { title: 'Sentinel 출력 (예시)' });
    gate(800, 300, false, 1); note(660, 140, '이유를 말해 주지 않으면 우회만 는다', fade(u, 2.2)); }

  // ================= 5. CI 정기 점검 =================
  const PIPE = ['checkout', 'OIDC 인증', 'terraform 1.7.5', 'init', 'plan', 'conftest', 'Slack', '요약'];
  function pipe(on, u, o) { o = o || {}; PIPE.forEach((s, i) => { const x = 70 + i * 117, lit = on.includes(i), done = o.done ? o.done(i) : 0;
    card(x, 380, 108, 44, { rx: 8, stroke: lit ? ACC : GRID, sw: lit ? 2.6 : 1.4, fill: lit ? ACCBG : done ? GOODBG : PANEL, text: s, fs: 13.5, mono: /^(checkout|init|plan|conftest)$/.test(s) || /\d/.test(s), color: lit ? ACC : o.skip && o.skip(i) ? OFF : INK }); }); }
  function s5(t, c) { const { k, u } = c, v = vals(c);
    if (k === 0) { // UTC ↔ KST 눈금
      const X = (h) => 80 + h * 33;
      const g = E(u, 1.0, 1.8); el('rect', { x: X(18) - 16, y: 92, width: 32, height: 150, rx: 8, fill: ACCBG, opacity: g });
      [['UTC', 120, 0], ['KST', 210, 9]].forEach(([name, y, off]) => { tx(40, y + 6, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
        grow(X(0), y, X(24), y, E(u, 0.1, 0.8), MUT, { plain: true });
        for (let h = 0; h <= 24; h += 3) { el('line', { x1: X(h), y1: y - 6, x2: X(h), y2: y + 6, stroke: MUT, opacity: fade(u, 0.5) }); mono(X(h), y + 26, String((h + off) % 24).padStart(2, '0'), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); } });
      chip(X(18), 76, 'cron: "0 18 * * *"', ACC, pop(u, 1.2)); chip(X(18), 268, '= KST 03:00', ACC, pop(u, 1.8), { mono: false });
      note(80, 330, 'cron은 UTC 기준이다. KST로 착각하면 9시간 어긋난다', fade(u, 2.2)); pipe([], u); return; }
    if (k === 1) { chip(300, 120, 'contents: read', GOOD, pop(u, 0.3)); chip(620, 120, 'id-token: write', ACC, pop(u, 0.7));
      note(300, 180, '저장소는 읽기만', fade(u, 0.6), { 'text-anchor': 'middle' }); note(620, 180, 'OIDC 토큰을 받으려고', fade(u, 1.0), { 'text-anchor': 'middle' });
      chip(460, 250, 'contents: write', MUT, pop(u, 1.4)); cross(560, 250, 10, pop(u, 1.7)); note(460, 300, '점검 워크플로에 쓰기 권한은 필요 없다', fade(u, 2.0), { 'text-anchor': 'middle' });
      pipe([0], u); return; }
    if (k === 2) { card(150, 150, 200, 80, { rx: 12, stroke: INK, sw: 2.2, text: 'GitHub Actions', fs: 16 });
      card(480, 150, 200, 80, { rx: 12, stroke: INK, sw: 2.2, text: 'AWS STS', fs: 16, s: pop(u, 0.3) });
      card(800, 150, 200, 80, { rx: 12, stroke: ACC, sw: 2.4, text: 'AWS_ROLE_ARN\n임시 자격 증명', fs: 14.5, color: ACC, s: pop(u, 1.4), fill: ACCBG });
      fly(250, 150, 380, 150, seg(u, 0.4, 1.0), 'OIDC 토큰', { fill: ACC }); grow(580, 150, 700, 150, E(u, 1.1, 1.5), ACC);
      chip(150, 250, '장기 액세스 키', MUT, pop(u, 1.6)); cross(230, 250, 10, pop(u, 1.9));
      mono(480, 210, 'ap-northeast-2', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      pipe([1], u); return; }
    if (k === 3) { ['어제', '오늘'].forEach((d, i) => { const y = 120 + i * 100;
        tx(120, y + 6, d, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.6) });
        chip(320, y, 'terraform 1.7.5', ACC, pop(u, 0.3 + i * 0.6)); grow(420, y, 520, y, E(u, 0.5 + i * 0.6, 0.8 + i * 0.6), MUT);
        chip(640, y, 'init -input=false', INK, pop(u, 0.7 + i * 0.6)); });
      note(160, 320, '버전이 흔들리면 어제 없던 변경이 버전 차이로 뜬다', fade(u, 2.0)); pipe([2, 3], u); return; }
    if (k === 4) { three({ y: 16, h: 104, code: v.code, st: v.st, live: v.live, hot: 2 });
      terminal(24, 150, 600, 150, ['$ set +e', '$ terraform plan -detailed-exitcode -no-color -out=plan.bin', ['$ echo "exit=$?" >> "$GITHUB_OUTPUT"', null], ['exit=2', '#fbbf24']], 4 * E(u, 0.3, 2.2), { title: 'drift 감지 (예시)' });
      chip(780, 230, 'steps.plan.outputs.exit = 2', WARN, pop(u, 2.2)); pipe([4], u, { done: (i) => i < 4 }); return; }
    if (k === 5) { [['plan.bin', INK], ['terraform show -json', MUT], ['plan.json', INK], ['conftest test', ACC]].forEach(([s, col], i) => {
        const x = 130 + i * 230; chip(x, 150, s, col, pop(u, 0.2 + i * 0.4)); if (i < 3) grow(x + 80, 150, x + 150, 150, E(u, 0.4 + i * 0.4, 0.6 + i * 0.4), MUT); });
      chip(480, 240, 'if: steps.plan.outputs.exit == 2', WARN, pop(u, 1.6)); note(480, 300, '변경이 있을 때만 검사해서 매일 도는 작업이 가볍다', fade(u, 2.0), { 'text-anchor': 'middle' });
      pipe([5], u, { done: (i) => i < 5 }); return; }
    if (k === 6) { card(480, 160, 460, 120, { rx: 14, stroke: INFO, sw: 2.2, fill: INFOBG, s: pop(u, 0.3) });
      mono(270, 136, '#infra-drift', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.5) });
      tx(270, 170, 'Drift detected in prod terraform', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.7) });
      mono(270, 200, 'SLACK_WEBHOOK_URL ← secrets', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
      clock(140, 290, 26, E(u, 1.2, 2.2) * 0.25, WARN, '아침 09:00'); note(200, 296, '출근해서 코드와 콘솔 중 어느 쪽에 맞출지 정한다', fade(u, 1.8));
      pipe([6], u, { done: (i) => i < 6 }); return; }
    // k === 7: 요약 (always)
    three({ y: 16, h: 104, code: v.code, st: v.st, live: v.live });
    [['exit 0', '변경 없음', GOOD], ['exit 1', '에러', BAD], ['exit 2', 'drift 있음', WARN]].forEach(([a, b, col], i) => { const x = 200 + i * 280;
      card(x, 210, 230, 60, { rx: 10, stroke: col, sw: 2.2, s: pop(u, 0.2 + i * 0.3) }); mono(x - 90, 216, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.3) }); tx(x + 90, 216, b, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.3) }); });
    chip(480, 290, 'if: always() · 실패해도 요약은 남는다', ACC, pop(u, 1.4), { mono: false });
    pipe([7], u, { done: (i) => i < 7 && i !== 5 && i !== 6, skip: (i) => i === 5 || i === 6 }); }

  const quiz = [
    { q: 'drift는 무엇과 무엇이 어긋난 상태인가?',
      o: ['main.tf와 Git 원격 저장소', 'state가 기억하는 값과 실제 클라우드의 값', 'provider 버전과 Terraform 버전'], a: 1,
      why: '콘솔에서 instance_type을 t3.large로 바꾸면 state는 t3.small을 기억하고 실제는 t3.large가 된다. 이 어긋남이 drift다.' },
    { q: 'plan -detailed-exitcode가 exit 2를 냈다. 이것이 뜻하는 것은 무엇인가?',
      o: ['plan은 성공했고 변경 사항이 있다', 'plan 도중 에러가 났다', '변경이 없다'], a: 0,
      why: '0은 변경 없음, 1은 에러, 2는 성공했고 변경이 있음이다. drift인지는 terraform show로 내용을 읽고 판단한다.' },
    { q: 'terraform apply -refresh-only를 적용하면 무엇이 바뀌는가?',
      o: ['실제 인스턴스가 t3.small로 돌아간다', 'main.tf가 t3.large로 고쳐진다', 'state만 실제 값 t3.large로 갱신된다'], a: 2,
      why: 'refresh-only는 리소스를 만들거나 지우지 않고 state만 실제에 맞춘다. 그래서 main.tf는 따로 고쳐야 한다.' },
    { q: 'Sentinel 정책이 인스턴스 타입을 판정할 때 보는 값은 무엇인가?',
      o: ['변경 전 값 change.before', '변경 후 값 change.after', '현재 state의 값'], a: 1,
      why: '정책은 적용될 계획을 검사한다. after.instance_type이 금지 목록에 있으면 violating에 들어가고 main 규칙이 거짓이 된다.' },
    { q: 'GitHub Actions에서 cron: "0 18 * * *"는 한국 시각으로 언제 도는가?',
      o: ['매일 18:00', '매일 03:00', '매일 09:00'], a: 1,
      why: 'cron은 UTC 기준이고 KST는 UTC보다 9시간 빠르다. UTC 18:00은 다음 날 KST 03:00이다.' },
  ];

  const summary = [
    '콘솔에서 고친 값은 state와 실제를 갈라 놓고, 다음 apply가 그 변경을 되돌린다.',
    'plan -detailed-exitcode로 변경 여부를 종료 코드 0, 1, 2로 받아 감지한다.',
    '콘솔 쪽이 맞으면 refresh-only로 state를 맞추고 main.tf도 같은 값으로 고친다.',
    'Sentinel이나 OPA로 위험한 계획을 막고, CI가 매일 KST 03:00에 plan을 돌린다.',
  ];
  const review = [
    { q: '새벽 점검 스크립트가 set -euo pipefail 아래에서 plan -detailed-exitcode를 그냥 실행했더니, drift가 있는 날 Slack 알림 없이 끝났다. 먼저 의심할 것은?',
      o: ['exit 2에서 set -e가 스크립트를 바로 끝냈다', 'webhook URL이 secrets에 없다', 'state lock이 걸려 있었다'], a: 0,
      why: 'set -e는 0이 아닌 종료 코드에서 멈춘다. plan 줄 뒤에 || EXIT=$? 를 붙이거나 set +e로 감싸야 exit 2 분기까지 간다.' },
    { q: '긴급 상황에서 콘솔로 t3.large로 키웠고 이 값을 유지하기로 했다. 순서로 맞는 것은?',
      o: ['terraform apply로 바로 반영한다', 'refresh-only로 state를 맞추고 main.tf도 고친다', 'state 파일을 열어 값을 직접 고친다'], a: 1,
      why: '그냥 apply하면 t3.small로 되돌아간다. state는 refresh-only로, 코드는 PR로 맞춰야 다음 plan이 깨끗하다.' },
    { q: '새벽 점검이 exit 2를 냈고 내용은 instance_type "t3.large" -> "t3.small"이었다. 팀이 콘솔 변경을 버리기로 했다면 할 일은?',
      o: ['refresh-only로 state를 t3.large로 맞춘다', '금지 목록에서 t3.large를 뺀다', 'plan을 검토하고 apply해 t3.small로 되돌린다'], a: 2,
      why: '코드가 맞는 쪽이면 일반 apply가 실제를 main.tf 값으로 되돌린다. refresh-only는 콘솔 변경을 받아들일 때 쓴다.' },
  ];

  R.page({ title: 'drift 감지와 정책', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
