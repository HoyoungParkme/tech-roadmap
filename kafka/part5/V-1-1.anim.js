/* V-1-1 보존 정책 (retention.ms / bytes) + 압축 토픽 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 로그는 beat 의 logBefore / logAfter 를 읽는다. 결과(세그먼트 삭제·compact·tombstone)는 저장소 밖 verify.py 로 다시 계산해 맞췄다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, clock, meters, terminal, snippet, hbar, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const KC = { userA: ACC, userB: INFO, userC: WARN, orderA: ACC, orderB: INFO, orderC: WARN };
  const X = (i) => 170 + i * 155;                     // 로그 칸 가운데
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const mid = (x, y, s, op, a) => note(x, y, s, op, Object.assign({ 'text-anchor': 'middle' }, a || {}));

  // 메시지 칸: 위에 offset, 안에 key·value, 아래 나이. st: ok | del | keep | warn | dim | tomb
  function cell(cx, cy, m, o) { o = o || {}; const w = o.w || 124, h = o.h || 66, st = o.st || 'ok', s = o.s ?? 1, op = o.op ?? 1;
    if (s <= 0 || op <= 0) return;
    const g = R.G(cx, cy + (o.dy || 0), s, op);
    const stroke = { del: BAD, keep: GOOD, warn: WARN, dim: GRID, tomb: INK }[st] || INK, fill = { del: BADBG, keep: GOODBG, warn: WARNBG, tomb: SOFT }[st] || PANEL;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: st === 'tomb' ? 22 : 8, fill, stroke, 'stroke-width': 2.2, 'stroke-dasharray': st === 'tomb' ? '6 4' : null }, g);
    if (m.offset != null) tx(0, -h / 2 - 9, String(m.offset), { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT, 'font-weight': 700 }, g);
    if (m.key) tx(0, o.oneLine ? 6 : -5, m.key, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: KC[m.key] || INK }, g);
    if (!o.oneLine && m.value != null) tx(0, 18, String(m.value).replace('name=', '').replace(' (tombstone)', ''), { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: st === 'tomb' ? MUT : INK }, g);
    if (o.age && m.ageDays != null) tx(0, h / 2 + 20, m.ageDays + '일', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: st === 'del' ? BAD : MUT, 'font-weight': 700 }, g);
    if (o.strike) el('line', { x1: -w / 2 + 8, y1: h / 2 - 8, x2: w / 2 - 8, y2: -h / 2 + 8, stroke: BAD, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: o.strike }, g); }
  // 위로 휘는 연결선 (같은 key 묶기). u 만큼 그린다
  function arc(x1, x2, y, hgt, u, col) { if (u <= 0) return; const p = el('path', { d: `M${x1},${y} C${x1},${y - hgt} ${x2},${y - hgt} ${x2},${y}`, fill: 'none', stroke: col, 'stroke-width': 2.4, pathLength: 100 });
    p.setAttribute('stroke-dasharray', u < 1 ? `${u * 100} 100` : '6 5'); }
  // 아래로 여는 괄호 (세그먼트 표시)
  function brace(x1, x2, y, u, col, label, lop) { if (u <= 0) return; const xm = lerp(x1, x2, 0.5), half = (x2 - x1) / 2 * u;
    el('path', { d: `M${xm - half},${y - 8} V${y} H${xm + half} V${y - 8}`, fill: 'none', stroke: col, 'stroke-width': 2.4 });
    if (label) tx(xm, y + 21, label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: lop ?? 1 }); }
  // 세로 임계선 + 이름표
  function cut(x, y1, y2, u, text, col, py) { if (u <= 0) return; col = col || BAD;
    el('line', { x1: x, y1, x2: x, y2: lerp(y1, y2, u), stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': '7 5' });
    if (u > 0.6) pill(x, py ?? y1 - 16, text, col, 1, { fs: 13.5, fill: PANEL, mono: true }); }

  // ---------- 1. retention.ms ----------
  function s1(t, c) { const { k, u } = c, L = c.beat.logBefore, Y = 158;
    note(40, 48, 'orders 토픽 · 파티션 0 로그', 1, { 'font-size': 16, 'font-weight': 800 });
    sub(820, 48, '← 오래됨 · 최신 →', 1, { 'font-size': 14 });
    if (k === 4) {   // 세그먼트 기본 7일이라면: [100,101] 닫힌 세그먼트, [102..104] 활성 세그먼트
      const drop = E(u, 1.0, 1.9);
      L.forEach((m, i) => { const A = i < 2;
        cell(X(i), Y, m, { st: A ? 'del' : i === 2 && u > 1.9 ? 'warn' : 'ok', age: true, dy: A ? drop * 50 : 0, op: A ? 1 - drop * 0.85 : 1, strike: A ? E(u, 0.9, 1.2) : 0 }); });
      brace(X(0) - 64, X(1) + 64, Y + 62, E(u, 0.2, 0.7), BAD, '닫힌 세그먼트 · 최신 8일', 1 - drop);
      brace(X(2) - 64, X(4) + 64, Y + 62, E(u, 0.35, 0.85), GOOD, '활성 세그먼트 · 최신 1일 → 지우지 않음');
      cut(X(2) + 77, 104, Y + 44, 1, '3일');
      if (u > 1.9) note(X(2) - 62, Y + 118, '102는 6일이지만 같은 파일이라 남는다', fade(u, 1.9), { fill: WARN });
      mid(480, 360, 'segment.ms 기본 7일이면 며칠 치가 한 파일에 묶인다 (예시)', fade(u, 2.2), { fill: MUT, 'font-weight': 500 });
      mid(480, 392, '보존 점검은 5분마다 돈다 · 정확한 삭제 시각은 보장되지 않는다', fade(u, 2.4), { fill: MUT, 'font-weight': 500 });
      return; }
    const lineX = k === 0 ? X(1) + 77 : k === 1 ? lerp(X(1) + 77, X(2) + 77, E(u, 0.2, 1.3)) : X(2) + 77;
    const dimLog = k >= 2;
    L.forEach((m, i) => { let on;
      if (k === 0) on = i < 2 && u > 1.9; else if (k === 1) on = i < 2 || (i === 2 && u > 1.4); else on = i < 3;
      cell(X(i), Y, m, { st: on ? 'del' : 'ok', age: true, s: k === 0 ? pop(u, 0.2 + i * 0.16) : 1, op: dimLog ? 0.5 : 1 });
      if (on && !dimLog) tx(X(i), Y + 76, '삭제 대상', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: k === 1 && i === 2 ? fade(u, 1.4) : k === 0 ? fade(u, 1.9) : 1 }); });
    const days = k === 0 ? '7일 = 604800000' : '3일 = 259200000';
    cut(lineX, 104, Y + 46, k === 0 ? E(u, 1.2, 1.8) : 1, 'retention.ms ' + days, dimLog ? OFF : BAD);
    if (k <= 1) {
      mid(480, 334, k === 0 ? '9일·8일 된 100, 101이 7일 선을 넘었다' : '선을 3일로 당기면 6일 된 102도 넘어간다', fade(u, k === 0 ? 2.0 : 1.5));
      if (k === 1) mid(480, 368, '운영 중에 줄이면 이미 쌓인 데이터가 한꺼번에 대상이 된다', fade(u, 2.1), { fill: WARN }); return; }
    const lines = ['$ kafka-configs.sh --describe \\', '    --entity-type topics --entity-name orders', "Configs for topic 'orders' are:", '  retention.ms=259200000', '  segment.ms=86400000'];
    terminal(150, 268, 660, 146, lines, k === 2 ? lerp(0, 2, E(u, 0.2, 1.6)) : lerp(2, 5, E(u, 0.2, 1.4)), { title: 'broker 셸', fs: 14 });
    if (k === 2) mid(480, 250, '읽기만 한다 · 로그는 그대로', fade(u, 1.8), { fill: MUT });
    if (k === 3) { L.forEach((m, i) => brace(X(i) - 60, X(i) + 60, Y + 64, E(u, 1.5 + i * 0.12, 1.9 + i * 0.12), INFO));
      note(40, Y + 70, '세그먼트', fade(u, 1.5), { fill: INFO, 'font-size': 14 }); }
  }

  // ---------- 2. retention.bytes ----------
  const BX = 160, MB = 50, BY = 140, BH = 60;
  function bytesBar(L, o) { o = o || {};
    L.forEach((m, i) => { const x = BX + i * 2 * MB, gone = o.gone ? o.gone(i) : 0, lift = o.lift ? o.lift(i) : 0;
      if (gone >= 1) return; const grow0 = o.fill ? clamp(o.fill * 6 - i) : 1; if (grow0 <= 0) return;
      const op = 1 - gone, y = BY - lift * 46;
      el('rect', { x: x + 2, y, width: (2 * MB - 4) * grow0, height: BH, rx: 6, fill: lift > 0 ? BADBG : ACCBG, stroke: lift > 0 ? BAD : ACC, 'stroke-width': 2, opacity: op });
      tx(x + MB, y - 9, String(m.offset), { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT, 'font-weight': 700, opacity: op * grow0 });
      tx(x + MB, y + 28, m.value, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', opacity: op * grow0 });
      tx(x + MB, y + 48, '2MB', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT, opacity: op * grow0 });
      if (lift > 0) cross(x + MB, y + BH / 2, 14, clamp(lift * 2)); }); }
  function limitLine(u, op) { cut(BX + 8 * MB, BY - 20, BY + BH + 24, u, 'retention.bytes = 8MB', BAD, BY - 46); }
  function total(v, op) { mono(860, BY + 30, v.toFixed(0) + 'MB', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: v > 8.01 ? BAD : GOOD, opacity: op ?? 1 });
    tx(860, BY + 56, '파티션 크기', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op ?? 1 }); }
  function s2(t, c) { const { k, u } = c, L = c.beat.logBefore;
    note(40, 48, 'events 토픽 · 파티션 0 디스크 (2MB 세그먼트 6개 · 그림용 축소 예시)', 1, { 'font-size': 15, 'font-weight': 800 });
    if (k === 1) {   // 파티션 수만큼 곱한다 (코드: 1GiB × 4)
      const du = [42, 41, 43, 42];
      du.forEach((v, j) => { const y = 92 + j * 62, a = E(u, 0.2 + j * 0.2, 0.7 + j * 0.2);
        tx(150, y + 21, 'events-' + j, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: a });
        el('rect', { x: 170, y, width: 560, height: 30, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: a });
        el('rect', { x: 170, y, width: Math.max(3, 560 * v / 1024) * a, height: 30, rx: 6, fill: ACC });
        mono(182 + 560 * v / 1024, y + 21, v + 'M', { 'font-size': 13.5, fill: MUT, opacity: a });
        mono(722, y + 21, '≤ 1GB', { 'font-size': 13.5, 'text-anchor': 'end', fill: BAD, 'font-weight': 700, opacity: a }); });
      const b = E(u, 1.2, 1.7); if (b > 0) { el('path', { d: 'M748,92 H768 V308 H748', fill: 'none', stroke: INK, 'stroke-width': 2.2, opacity: b });
        mono(790, 205, '× 4 = 4GB', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); }
      mid(480, 360, 'retention.bytes는 파티션 하나의 상한이다', fade(u, 1.9));
      mid(480, 392, 'du로 재는 값(42M …)도 파티션 디렉터리 하나씩이다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 });
      return; }
    const gone = (i) => { const after = c.beat.logAfter[i].deleted, before = c.prev && c.prev.logAfter && k > 0 ? c.prev.logAfter[i].deleted : false;
      if (!after) return 0; if (before) return 1; return E(u, 1.2, 1.9); };
    const lift = (i) => { const after = c.beat.logAfter[i].deleted, before = c.prev && c.prev.logAfter && k > 0 ? c.prev.logAfter[i].deleted : false;
      return after && !before ? E(u, 0.3, 1.1) : 0; };
    bytesBar(L, { fill: k === 0 ? E(u, 0.2, 1.3) : 1, gone, lift });
    limitLine(k === 0 ? E(u, 1.3, 1.9) : 1);
    const now = c.beat.logAfter.filter((m) => !m.deleted).length * 2, was = c.prev && c.prev.logAfter && k > 0 ? c.prev.logAfter.filter((m) => !m.deleted).length * 2 : 12;
    total(k === 0 ? 12 * E(u, 0.2, 1.3) : lerp(was, now, E(u, 1.2, 1.9)), k === 0 ? fade(u, 0.4) : 1);
    if (k === 0) { mid(480, 290, '설정만 걸었다 · 보존 점검이 돌기 전이라 12MB 그대로', fade(u, 2.0));
      mid(480, 324, 'retention.bytes 기본값은 -1 (크기 제한 없음)', fade(u, 2.3), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 2) { const y0 = 258;
      note(70, y0 + 14, '시간', fade(u, 0.3)); hbar(140, y0, 420, 2, 7, { col: GOOD, u: E(u, 0.3, 1.0), text: '가장 오래된 2일 / 7일' });
      note(70, y0 + 60, '크기', fade(u, 0.9)); hbar(140, y0 + 46, 420, 8, 8, { col: BAD, u: E(u, 0.9, 1.6), text: '12MB / 8MB 초과' });
      pill(830, y0 + 32, 'OR', BAD, pop(u, 1.8), { fs: 18 });
      mid(480, 392, '둘 중 하나만 넘어도 오래된 세그먼트부터 지운다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 3) { pill(260, 300, '$ du -sh  →  12MB', INK, pop(u, 0.1), { mono: true, fs: 14 });
      mid(480, 360, '가장 오래된 200부터 잘린다 · 10MB라 아직 8MB를 넘는다', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 4) { check(560, 300, 14, pop(u, 2.0)); note(584, 306, '8MB ≤ 8MB에서 멈춘다', fade(u, 2.0), { fill: GOOD });
      mid(480, 360, '활성 세그먼트(205)는 지우지 않고, 세그먼트보다 잘게 자르지 못한다', fade(u, 2.3), { fill: MUT, 'font-weight': 500 });
      mid(480, 392, '디스크의 70% 선에 맞춰 잡는다', fade(u, 2.5), { fill: MUT, 'font-weight': 500 }); }
  }

  // ---------- 3. delete vs compact ----------
  function policyPill(text, s, col) { pill(480, 52, 'cleanup.policy = ' + text, col || INK, s ?? 1, { mono: true, fs: 15, fill: PANEL }); }
  function s3(t, c) { const { k, u } = c, L = c.beat.logBefore, Y = 172;
    if (k === 3) {   // 대조표
      const rows = [['기준', '시간 / 크기', 'key'], ['단위', '세그먼트', '메시지'], ['key 필수?', '아니오', '예'], ['데이터 양', '일정하게 유지', 'key 수에 수렴'], ['용도', '이벤트 로그', '상태 저장소']];
      tx(470, 58, 'delete', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD }); tx(720, 58, 'compact', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC });
      rows.forEach(([a, b, d], r) => { const y = 102 + r * 54, s = pop(u, 0.2 + r * 0.3);
        card(250, y, 160, 44, { rx: 8, text: a, fs: 15, fw: 700, fill: SOFT, stroke: GRID, s });
        card(470, y, 220, 44, { rx: 8, text: b, fs: 15, fw: 600, stroke: BAD, s }); card(720, y, 220, 44, { rx: 8, text: d, fs: 15, fw: 600, stroke: ACC, s }); });
      mid(480, 400, 'compact는 key 종류가 많으면 줄지 않는다', fade(u, 2.0), { fill: WARN }); return; }
    if (k === 5) {   // 질문 하나로 고른다
      const mini = (x0, keys, del, col) => keys.forEach((kk, i) => card(x0 + i * 44, 250, 38, 38, { rx: 6, text: kk, fs: 14, fw: 800, mono: true, stroke: del.includes(i) ? BAD : col, fill: del.includes(i) ? BADBG : PANEL, color: del.includes(i) ? BAD : INK, op: del.includes(i) ? lerp(1, 0.45, E(u, 1.6, 2.2)) : 1 }));
      card(250, 110, 380, 64, { rx: 12, text: '시간이 지나면 잊어도 되나?', fs: 17, fw: 800, stroke: BAD, s: pop(u, 0.2) });
      card(710, 110, 380, 64, { rx: 12, text: '어떤 entity의 최신 상태인가?', fs: 17, fw: 800, stroke: ACC, s: pop(u, 0.5) });
      if (u > 0.9) { pill(250, 186, 'delete', BAD, pop(u, 0.9), { mono: true, fs: 15 }); pill(710, 186, 'compact', ACC, pop(u, 1.1), { mono: true, fs: 15 }); }
      if (u > 1.3) { mini(140, ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'], [0, 1], BAD); mini(610, ['A', 'B', 'A', 'C', 'A'], [0, 2], ACC); }
      sub(250, 304, '앞쪽부터 시간으로 자른다', fade(u, 1.6), { 'font-size': 14 }); sub(710, 304, 'key마다 마지막만 남긴다', fade(u, 1.6), { 'font-size': 14 });
      sub(250, 348, '이벤트 로그 · 메트릭 · 클릭 스트림', fade(u, 2.0), { 'font-size': 15, fill: INK }); sub(710, 348, '사용자 프로필 · 설정 · 캐시', fade(u, 2.0), { 'font-size': 15, fill: INK });
      return; }
    const mode = ['delete', 'compact', 'both', null, 'switch'][k];
    const tDel = mode === 'delete' || mode === 'both', tComp = mode === 'compact' || mode === 'both' || mode === 'switch';
    if (mode === 'switch') { const sw = E(u, 0.2, 0.9);
      policyPill(sw < 0.5 ? 'delete' : 'compact', 1, sw < 0.5 ? BAD : ACC);
      pill(830, 52, '--alter', INK, pop(u, 0.1), { mono: true, fs: 14 }); }
    else policyPill(mode === 'both' ? 'compact,delete' : mode, k === 0 ? pop(u, 0.1) : 1, mode === 'delete' ? BAD : mode === 'compact' ? ACC : WARN);
    const T0 = mode === 'switch' ? 1.1 : 0.3;
    if (tComp) [[0, 2], [2, 4]].forEach(([a, b], j) => arc(X(a), X(b), Y - 54, 46, E(u, T0 + j * 0.35, T0 + 0.5 + j * 0.35), ACC));
    if (tDel) cut(X(1) + 77, 104, Y + 46, E(u, 0.3, 0.9), 'retention.ms = 3일', BAD, Y + 84);
    const after = c.beat.logAfter, T1 = mode === 'switch' ? 1.9 : 1.4;
    L.forEach((m, i) => { const d = after[i].deleted, on = d && u > T1, keep = !d && u > T1 + 0.3;
      cell(X(i), Y, m, { st: on ? 'del' : keep ? (m.key === 'userA' ? 'keep' : 'ok') : 'ok', age: true, strike: on ? E(u, T1, T1 + 0.3) : 0, op: on ? lerp(1, 0.6, E(u, T1 + 0.3, T1 + 0.8)) : 1 }); });
    const msg = { delete: ['delete는 key를 보지 않는다 · 나이만 본다', 'userB의 하나뿐인 값(301)도 사라졌다'],
      compact: ['compact는 나이를 보지 않는다 · 같은 key의 옛 값만 지운다', 'userB·userC는 값이 하나라 그대로 남는다'],
      both: ['두 기준을 함께 건다 · 300, 301, 302 삭제', '최신값 301도 4일이 지나 사라진다'],
      switch: ['delete → compact로 바꾸면 쌓인 로그도 새 기준으로 정리된다', '지운 옛 값(300, 302)은 되돌릴 수 없다'] }[mode];
    mid(480, 330, msg[0], fade(u, T1 + 0.5));
    mid(480, 366, msg[1], fade(u, T1 + 0.9), { fill: mode === 'compact' ? GOOD : BAD });
  }

  // ---------- 4. compact 토픽 ----------
  function s4(t, c) { const { k, u } = c, L = c.beat.logBefore, Y = 180;
    if (k === 0) {
      el('rect', { x: 36, y: Y - 40, width: 62, height: 80, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.2) });
      tx(67, Y + 5, 'tail', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.2) });
      L.forEach((m, i) => cell(X(i), Y, m, { st: m.key === 'userA' && u > 1.3 ? 'warn' : 'ok', s: pop(u, 0.2 + i * 0.12) }));
      el('path', { d: `M${X(0) - 64},${Y - 70} V${Y - 80} H${lerp(X(0) - 64, X(4) + 64, E(u, 0.9, 1.4))} ${u > 1.4 ? `V${Y - 70}` : ''}`, fill: 'none', stroke: WARN, 'stroke-width': 2.4 });
      tx(480, Y - 90, 'head · 아직 정리 안 됨', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
      mid(480, 300, 'userA가 300, 302, 304 세 번 있다', fade(u, 1.6), { fill: WARN });
      mid(480, 336, 'tail은 이미 정리된 앞부분이다 · 이 예에서는 아직 비어 있다', fade(u, 2.0), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { const sx = lerp(X(0) - 70, X(4) + 70, E(u, 0.2, 1.4));
      L.forEach((m, i) => { const d = c.beat.logAfter[i].deleted && u > 1.6; cell(X(i), Y - 30, m, { st: d ? 'del' : 'ok', strike: d ? E(u, 1.6, 1.9) : 0, op: d ? lerp(1, 0.55, E(u, 1.9, 2.3)) : 1 }); });
      if (u < 1.5) el('line', { x1: sx, y1: Y - 80, x2: sx, y2: Y + 14, stroke: ACC, 'stroke-width': 3 });
      // offset map: key → 마지막 offset (스캔이 지나간 곳까지)
      const seen = L.filter((m, i) => sx > X(i)); const map = {}; seen.forEach((m) => { map[m.key] = m.offset; });
      zone(160, 236, 300, 150, 'LogCleaner의 offset 지도');
      ['userA', 'userB', 'userC'].forEach((kk, j) => { const y = 284 + j * 32; tx(184, y, kk, { 'font-size': 15, 'font-weight': 800, fill: KC[kk] });
        if (map[kk] != null) mono(330, y, '→ ' + map[kk], { 'font-size': 15, 'font-weight': 700 }); });
      const sz = lerp(5, 3, E(u, 1.6, 2.3));
      meters(510, 250, 300, [{ name: '파티션 크기', val: sz.toFixed(0) + 'MB', good: u > 2.2 }, { name: 'dirty 비율', val: '1.0 ≥ 0.5', hot: false }], { h: 76 });
      return; }
    if (k === 2) { const Y1 = 120, Y2 = 290;
      tx(40, Y1 + 5, '전', { 'font-size': 17, 'font-weight': 800, fill: MUT }); tx(40, Y2 + 5, '후', { 'font-size': 17, 'font-weight': 800, fill: GOOD });
      L.forEach((m, i) => { cell(X(i), Y1, m, { op: 0.75 }); const d = c.beat.logAfter[i].deleted;
        if (d) { el('rect', { x: X(i) - 62, y: Y2 - 33, width: 124, height: 66, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.0) });
          tx(X(i), Y2 - 42, String(m.offset), { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: OFF, opacity: fade(u, 1.0) });
          tx(X(i), Y2 + 6, '비어 있음', { 'text-anchor': 'middle', 'font-size': 13.5, fill: OFF, opacity: fade(u, 1.0) }); }
        else { grow(X(i), Y1 + 36, X(i), Y2 - 52, E(u, 0.2 + i * 0.1, 0.7 + i * 0.1), GOOD); cell(X(i), Y2, m, { st: 'keep', s: pop(u, 0.6 + i * 0.1) }); } });
      mid(480, 388, '5개 → 3개 · offset은 다시 매기지 않는다 (301 다음이 303)', fade(u, 1.8)); return; }
    if (k === 3) { const kept = L.filter((m, i) => !c.beat.logAfter[i].deleted), idx = L.map((m, i) => i).filter((i) => !c.beat.logAfter[i].deleted);
      idx.forEach((i) => cell(X(i), 140, L[i], { st: 'keep' }));
      const p = E(u, 0.2, 1.6); dot([[X(0) - 80, 140], [X(4) + 80, 140]], p > 0 && p < 1 ? p : 0, INK, 8);
      person(80, 300, 'consumer', {});
      zone(300, 236, 400, 150, '처음부터 읽은 상태');
      kept.forEach((m, j) => { const at = (X(idx[j]) - (X(0) - 80)) / ((X(4) + 80) - (X(0) - 80)); const op = fade(p, at, 0.05);
        const y = 284 + j * 32; tx(324, y, m.key, { 'font-size': 15, 'font-weight': 800, fill: KC[m.key], opacity: op }); mono(440, y, '= ' + m.value.replace('name=', ''), { 'font-size': 15, opacity: op }); });
      note(730, 290, 'key 별 최신값', fade(u, 1.8), { fill: GOOD }); note(730, 320, '= changelog', fade(u, 2.0), { fill: GOOD });
      mid(480, 412, 'Kafka Streams의 KTable 백업 토픽이 이렇게 쓰인다', fade(u, 2.3), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 4) { const ax = (h) => (h <= 1 ? lerp(120, 260, h) : lerp(260, 780, (h - 1) / 23)), y = 210;
      el('line', { x1: 110, y1: y, x2: lerp(110, 830, E(u, 0.1, 0.6)), y2: y, stroke: MUT, 'stroke-width': 2 });
      [[0, '0h'], [1, '1h'], [24, '24h']].forEach(([h, s]) => { el('line', { x1: ax(h), y1: y - 6, x2: ax(h), y2: y + 6, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 0.5) }); mono(ax(h), y + 26, s, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) }); });
      const b1 = E(u, 0.7, 1.1), b2 = E(u, 1.2, 1.6);
      el('rect', { x: ax(0), y: y - 46, width: (ax(1) - ax(0)) * b1, height: 34, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5 });
      el('rect', { x: ax(1), y: y - 46, width: (ax(24) - ax(1)) * b2, height: 34, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 });
      tx(ax(0.5), y - 72, 'min.compaction.lag.ms = 1h', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: WARN, 'font-weight': 700, opacity: b1 });
      tx(ax(0.5), y + 56, '정리 대상 아님', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: b1 });
      tx(ax(12), y - 24, 'dirty 비율 ≥ 0.5이면 정리될 수 있다', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: b2 });
      cut(ax(24), y - 70, y + 10, E(u, 1.7, 2.1), 'max.compaction.lag.ms = 24h', BAD);
      tx(ax(24), y + 56, '늦어도 이때는 정리 대상', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) });
      dot([[ax(0), y], [ax(24), y]], (u % 1.5) / 1.5 * (u > 0.6 ? 1 : 0), INK, 7);
      mid(480, 360, '테스트에서 compact가 안 보이면 dirty.ratio를 0.01로 낮춘다', fade(u, 2.3), { fill: MUT, 'font-weight': 500 }); return; }
    // k5: key 가 null 이면 거부
    L.forEach((m, i) => { if (!c.beat.logAfter[i].deleted) cell(X(i), 140, m, { st: 'keep', w: 116, h: 60 }); });
    card(140, 310, 150, 56, { rx: 10, text: 'producer', fs: 16, fw: 800 });
    const f = E(u, 0.3, 1.1), back = E(u, 1.3, 1.9), bx = lerp(lerp(220, 560, f), 240, back), by = lerp(lerp(310, 210, f), 310, back);
    if (u > 0.3 && u < 1.9) card(bx, by, 196, 32, { rx: 16, text: 'key=null, value={…}', fs: 13.5, mono: true, fw: 700, fill: INK, stroke: 'none', color: PANEL });
    if (u > 1.1) cross(580, 205, 16, pop(u, 1.1));
    note(620, 214, '브로커가 쓰기를 거부한다', fade(u, 1.2), { fill: BAD });
    clock(870, 316, 26, 0.7 * E(u, 1.8, 2.8), WARN); note(620, 300, 'compact는 백그라운드', fade(u, 2.0)); note(620, 326, '바로 반영되지 않는다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 });
  }

  // ---------- 5. tombstone ----------
  const SORT = (L) => L.slice().sort((a, b) => a.offset - b.offset);
  function s5(t, c) { const { k, u } = c, Y = 150;
    const L = SORT(c.beat.logBefore), A = SORT(c.beat.logAfter);
    const isT = (m) => String(m.value).startsWith('null');
    const row = (o) => { o = o || {}; L.forEach((m, i) => { if (o.skip && o.skip(m)) return; const d = A[i] && A[i].deleted;
      cell(X(i), Y, m, Object.assign({ st: isT(m) ? 'tomb' : 'ok', s: o.s ? o.s(m, i) : 1 }, o.extra ? o.extra(m, i, d) : {})); }); };
    if (k === 0) { row({ s: (m, i) => pop(u, 0.2 + i * 0.15) });
      el('rect', { x: X(3) - 62, y: Y - 33, width: 124, height: 66, rx: 22, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.8) });
      tx(X(3), Y + 5, '다음 칸', { 'text-anchor': 'middle', 'font-size': 14, fill: OFF, opacity: fade(u, 0.8) });
      cell(300, 300, { key: 'userA', value: 'null' }, { st: 'tomb', s: pop(u, 1.2), w: 150 });
      note(400, 292, 'tombstone = 같은 key + value=null', fade(u, 1.5));
      note(400, 322, '삭제 표시로 읽히고 24시간 뒤 자신도 사라진다', fade(u, 1.9), { fill: MUT, 'font-weight': 500 });
      mid(480, 400, 'compact 토픽에는 DELETE 문이 없다 · 삭제도 메시지로 보낸다', fade(u, 2.3), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { snippet(70, 40, ['value_serializer=lambda v: json.dumps(v).encode("utf-8")', '                 if v is not None else None,'], { fs: 14.5, op: fade(u, 0.1) });
      grow(300, 130, 220, 200, E(u, 0.6, 1.0), GOOD); grow(560, 130, 680, 200, E(u, 0.6, 1.0), BAD);
      card(220, 240, 300, 70, { rx: 10, text: 'v = None\n그대로 None 전송', fs: 15, stroke: GOOD, s: pop(u, 1.0) });
      card(700, 240, 340, 70, { rx: 10, text: 'json.dumps(None)\n"null" · 4바이트 문자열', fs: 15, stroke: BAD, s: pop(u, 1.2), mono: false });
      check(220, 320, 13, pop(u, 1.6)); note(244, 326, 'tombstone이 된다', fade(u, 1.6), { fill: GOOD });
      cross(560, 320, 12, pop(u, 1.8)); note(584, 326, '그냥 값 "null" 이 된다', fade(u, 1.8), { fill: BAD });
      mid(480, 396, 'None을 건너뛰는 분기가 없으면 삭제가 일어나지 않는다', fade(u, 2.2)); return; }
    if (k === 2) { row({ skip: isT });
      card(90, 320, 130, 52, { rx: 10, text: 'producer', fs: 15, fw: 800 });
      fly(130, 290, X(3), Y, seg(u, 0.3, 1.4), 'userA · null', { fill: INK, mono: true });
      if (u > 1.4) cell(X(3), Y, L[3], { st: 'tomb', s: pop(u, 1.4) });
      el('rect', { x: X(2) - 66, y: Y - 37, width: 132, height: 74, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      note(X(2) - 60, Y + 66, '304는 아직 그대로다', fade(u, 1.8), { fill: WARN });
      mid(560, 330, 'producer.flush()로 실제 전송을 확인한다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 3) { row();
      person(830, 300, 'consumer', {});
      dot([[X(3), Y + 36], [X(3), 300], [800, 300]], seg(u, 0.2, 1.2), INK, 8);
      zone(250, 238, 400, 150, 'consumer 로컬 캐시');
      [['userA', 'Tom-Jr'], ['userB', 'Sue'], ['userC', 'Amy']].forEach(([kk, v], j) => { const y = 286 + j * 32, gone = j === 0 && u > 1.3;
        tx(276, y, kk, { 'font-size': 15, 'font-weight': 800, fill: gone ? OFF : KC[kk], 'text-decoration': gone ? 'line-through' : null });
        mono(390, y, v, { 'font-size': 15, fill: gone ? OFF : INK, 'text-decoration': gone ? 'line-through' : null });
        if (gone) cross(600, y - 5, 9, pop(u, 1.3)); });
      mid(480, 410, 'msg.value is None이면 local_cache.pop(key)', fade(u, 1.8), { class: 'mono', 'font-size': 14.5, fill: ACC }); return; }
    if (k === 4) { const drop = E(u, 0.4, 1.2);
      L.forEach((m, i) => { const d = A[i].deleted; cell(X(i), Y, m, { st: isT(m) ? 'tomb' : d ? 'del' : 'ok', strike: d ? E(u, 0.2, 0.4) : 0, dy: d ? drop * 50 : 0, op: d ? 1 - drop * 0.9 : 1 }); });
      tx(160, 300, '1차', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.4) }); note(210, 300, '옛 값 304 제거 · tombstone은 남는다', fade(u, 0.6));
      clock(X(3), 330, 30, E(u, 1.3, 2.5), WARN, 'delete.retention.ms 24h');
      tx(160, 400, '2차', { 'font-size': 17, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.6) }); note(210, 400, '24h가 지난 뒤 청소에서 305도 사라진다', fade(u, 1.8), { fill: MUT });
      return; }
    // k5: 늦게 읽으면 삭제를 모른다
    const ax = (h) => lerp(120, 840, h / 36), y = 220;
    el('line', { x1: 110, y1: y, x2: lerp(110, 850, E(u, 0.1, 0.6)), y2: y, stroke: MUT, 'stroke-width': 2 });
    [[0, '0h'], [24, '24h'], [30, '30h']].forEach(([h, s]) => mono(ax(h), y + 28, s, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) }));
    el('rect', { x: ax(0), y: y - 16, width: (ax(24) - ax(0)) * E(u, 0.5, 1.0), height: 32, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '6 4' });
    tx(ax(12), y + 5, 'tombstone이 로그에 있는 동안', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.0) });
    grow(ax(2), 110, ax(2), y - 20, E(u, 1.1, 1.5), GOOD); card(ax(2) + 50, 92, 190, 40, { rx: 10, text: 'consumer A · 2h', fs: 14, stroke: GOOD, s: pop(u, 1.1) });
    check(ax(2) + 170, 92, 11, pop(u, 1.5)); note(ax(2) + 4, 150, 'null을 받아 userA 삭제', fade(u, 1.5), { fill: GOOD, 'font-size': 14 });
    grow(ax(30), 330, ax(30), y + 40, E(u, 1.8, 2.2), BAD); card(ax(30) - 40, 352, 200, 40, { rx: 10, text: 'consumer B · 30h', fs: 14, stroke: BAD, s: pop(u, 1.8) });
    note(560, 357, 'userA를 계속 들고 있다', fade(u, 2.2), { fill: BAD, 'text-anchor': 'end' });
    mid(480, 410, '늦게 붙는 consumer가 있으면 delete.retention.ms를 7일로 늘리기도 한다', fade(u, 2.5), { fill: MUT, 'font-weight': 500, 'font-size': 14 });
  }

  const quiz = [
    { q: 'retention.ms를 3일로 줄였는데 6일 된 메시지 102가 아직 남아 있다. 이유로 맞는 것은 무엇인가?',
      o: ['1일 된 메시지와 같은 활성 세그먼트에 들어 있어 파일째 남았다', 'retention.ms는 메시지 개수 기준이라 날짜와 상관없다', '보존 설정은 브로커를 재시작해야 반영된다'], a: 0,
      why: '삭제는 세그먼트 파일 단위다. 파일 안 가장 최신 메시지가 임계를 넘어야 지워지고, 지금 쓰는 활성 세그먼트는 지우지 않는다.' },
    { q: 'retention.bytes=1GB인 토픽의 파티션이 4개다. 이 토픽이 쓸 수 있는 디스크 상한은 무엇인가?',
      o: ['1GB', '4GB', '256MB'], a: 1,
      why: 'retention.bytes는 파티션 하나의 상한이다. 1GB × 4 = 4GB이고, 파티션을 늘리면 상한도 같이 커진다.' },
    { q: 'cleanup.policy=compact,delete, retention.ms=3일이다. 4일 전에 들어온 userB의 하나뿐인 값(301)은 어떻게 되나?',
      o: ['key마다 최신값은 남는다', 'key가 하나뿐이라 정리 대상에서 빠진다', 'delete 조건에 걸려 지워진다'], a: 2,
      why: 'compact 만이면 최신값이라 남지만 delete를 같이 걸면 나이 조건이 최신값에도 적용된다. 그래서 301도 사라진다.' },
    { q: 'compact가 300과 302를 지웠다. 남은 메시지의 offset은 무엇인가?',
      o: ['301, 303, 304 그대로', '0, 1, 2로 다시 매겨진다', '300, 301, 302로 당겨진다'], a: 0,
      why: 'compact는 offset을 다시 매기지 않는다. 301 다음이 303으로 건너뛰고 consumer는 빈 번호를 그냥 지나간다.' },
    { q: 'compact 토픽에 보낸 tombstone(offset 305)은 언제 로그에서 사라지나?',
      o: ['보내는 순간 바로', 'delete.retention.ms(기본 24시간)가 지난 뒤의 청소 때', '사라지지 않고 영원히 남는다'], a: 1,
      why: '1차 청소에서 옛 값 304만 지우고 tombstone은 남긴다. 늦게 읽는 consumer를 위해 24시간을 둔 뒤 2차에서 지운다.' },
  ];

  const summary = [
    'retention.ms 기본값은 7일이고, 삭제는 메시지가 아니라 세그먼트 파일 단위로 일어난다.',
    'retention.bytes는 파티션 하나의 상한이라 1GB에 파티션 4개면 토픽은 4GB까지 쓴다.',
    '시간과 크기 조건은 OR로 묶여, 하나만 넘어도 오래된 세그먼트부터 지운다.',
    'compact는 key마다 마지막 값만 남기고, 키 삭제는 value가 null인 tombstone으로 한다.',
  ];
  const review = [
    { q: '사용자 프로필 토픽을 compact,delete(7일)로 두었더니 몇 주 동안 안 바뀐 사용자가 토픽에서 사라졌다. 원인은?',
      o: ['delete 조건이 key의 최신값에도 걸렸다', 'compact가 다른 key를 같은 key로 묶었다', 'producer가 tombstone을 자동으로 보냈다'], a: 0,
      why: 'compact만 걸면 최신값은 나이와 상관없이 남는다. delete를 함께 걸면 7일이 지난 최신값도 지워진다.' },
    { q: 'compact 토픽을 테스트하는데 같은 key의 옛 값이 몇 분이 지나도 그대로 보인다. 먼저 의심할 것은?',
      o: ['retention.bytes가 너무 크다', '정리 안 된 비율이 min.cleanable.dirty.ratio(0.5)에 못 미쳤다', 'offset을 다시 매기는 중이라 늦다'], a: 1,
      why: 'compact는 백그라운드 작업이고 dirty 비율이 기준을 넘어야 시작한다. 테스트에서는 0.01로 낮추면 금방 보인다.' },
    { q: '삭제된 사용자를 캐시하는 consumer가 3일 쉬고 돌아왔더니, 지운 사용자가 캐시에 그대로 있다. 이유는?',
      o: ['compact가 옛 값을 다시 살려 냈다', 'consumer가 null을 받으면 예외를 던진다', 'tombstone이 24시간 뒤 지워져 받을 기회가 없었다'], a: 2,
      why: 'tombstone은 delete.retention.ms 동안만 남는다. 그 안에 읽지 못한 consumer는 삭제 사실을 모른 채 옛 값을 들고 있다.' },
  ];

  R.page({ title: '토픽 로그 보존 · 압축', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
