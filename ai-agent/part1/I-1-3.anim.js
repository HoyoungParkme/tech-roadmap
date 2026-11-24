/* I-1-3 왜 Agent가 필요한가 — 장면 5개 (../../anim/engine.js 규칙). 학습 시점 타임라인·토큰 이어 붙이기·도구 호출·비용 막대를 그린다 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, person, cross, check, clock, terminal, G, spans, hbar, server, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  // ---------- AI Agent 공용 그림 도구 (메시지 목록 · 말풍선 · JSON · 루프 고리 · 토큰 막대) ----------
  const ROLE = { system: [MUT, SOFT], user: [INFO, INFOBG], assistant: [ACC, ACCBG], tool: [GOOD, GOODBG] };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 메시지 한 줄: [role] 내용. u 0→1 동안 칸이 왼쪽부터 채워진 뒤 글자가 나온다. o.ghost 면 점선 빈 자리
  function msg(x, y, w, role, text, o) { o = o || {}; const u = o.u ?? 1; if (u <= 0) return; const [c, bg] = ROLE[role] || ROLE.system, h = o.h || 30, tg = o.tag || 96, op = o.op ?? 1;
    el('rect', { x, y: y - h / 2, width: Math.max(6, w * E(u, 0, 0.55)), height: h, rx: 7, fill: o.ghost ? 'none' : bg, stroke: o.hot || o.ghost ? c : 'none', 'stroke-width': o.hot ? 2.4 : 1.6, 'stroke-dasharray': o.ghost ? '5 4' : null, opacity: op });
    const a = seg(u, 0.25, 0.6) * op;
    el('rect', { x: x + 5, y: y - h / 2 + 5, width: tg - 10, height: h - 10, rx: (h - 10) / 2, fill: o.ghost ? 'none' : c, stroke: o.ghost ? c : 'none', 'stroke-dasharray': o.ghost ? '4 3' : null, opacity: a });
    mono(x + tg / 2, y + 5, o.label || role, { 'font-size': 13.5, 'font-weight': 700, fill: o.ghost ? c : PANEL, 'text-anchor': 'middle', opacity: a });
    if (text) mono(x + tg + 6, y + 5, text, { 'font-size': o.fs || 14, fill: o.col || (o.ghost ? c : INK), opacity: seg(u, 0.45, 0.85) * op, 'font-weight': o.fw || 500 }); }
  // 말풍선: side 'r' 이면 x 가 오른쪽 끝(사용자), 'l' 이면 왼쪽 끝(봇). \n 으로 여러 줄
  function bubble(x, y, text, side, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const rows = String(text).split('\n'), fs = o.fs || 14.5;
    const w = Math.max(...rows.map((r) => tw(r, fs))) + 26, h = rows.length * (fs + 6) + 14, R0 = side === 'r';
    const g = G(x, y, s, o.op), fill = o.fill || (R0 ? INFO : PANEL), col = o.color || (R0 ? PANEL : INK);
    el('rect', { x: R0 ? -w : 0, y: -h / 2, width: w, height: h, rx: 12, fill, stroke: o.stroke || (R0 ? 'none' : GRID), 'stroke-width': 1.8, 'stroke-dasharray': o.dash }, g);
    rows.forEach((r, i) => tx(R0 ? -w + 13 : 13, -h / 2 + 5 + fs + i * (fs + 6), r, { 'font-size': fs, fill: col, 'font-weight': 600 }, g));
    return { w, h }; }
  // JSON·코드 조각 색칠: 키는 파랑, 문자열은 초록, 숫자는 주황, # 주석은 회색
  function jtok(line) { const out = []; let last = 0, m; const ci = line.search(/(^|\s)#\s/);
    const body = ci >= 0 ? line.slice(0, ci) : line, re = /("(?:[^"\\]|\\.)*")(\s*:)?|(\b\d+(?:\.\d+)?\b)|\b(true|false|null|None|True|False)\b/g;
    while ((m = re.exec(body))) { if (m.index > last) out.push([body.slice(last, m.index), {}]);
      if (m[1]) { out.push([m[1], { fill: m[2] ? INFO : ACC, 'font-weight': m[2] ? 700 : 500 }]); if (m[2]) out.push([m[2], {}]); }
      else if (m[3]) out.push([m[3], { fill: WARN, 'font-weight': 700 }]); else out.push([m[0], { fill: MUT, 'font-weight': 700 }]);
      last = re.lastIndex; }
    if (last < body.length) out.push([body.slice(last), {}]); if (ci >= 0) out.push([line.slice(ci), { fill: MUT }]); return out; }
  // 코드 상자: shown 줄까지 보인다(소수면 마지막 줄을 타이핑). o.hi(i) 강조 줄
  function code(x, y, lines, o) { o = o || {}; const fs = o.fs || 14, lh = fs + 7, n = lines.length, shown = o.shown ?? n, op = o.op ?? 1;
    const w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + 28, h = n * lh + 16;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: op, 'stroke-dasharray': o.dash });
    if (o.title) tx(x + 2, y - 8, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    const k = Math.ceil(shown);
    lines.forEach((s, i) => { if (i >= k) return; const part = i === k - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: y + 8 + i * lh, width: w - 8, height: lh, rx: 4, fill: HL, opacity: 0.6 * op });
      spans(x + 14, y + 8 + i * lh + fs * 0.98, jtok(part), { 'font-size': fs, opacity: op }); });
    return { w, h, lh }; }
  // 루프 고리: names 를 원 위에 고르게 놓는다. o.arc: 0→n 만큼 진행 호가 자람, o.on: 켜진 마디, o.dot: 고리 위 점(0→1 한 바퀴)
  function ring(cx, cy, r, names, o) { o = o || {}; const n = names.length, op = o.op ?? 1, A = (i) => -Math.PI / 2 + i * 2 * Math.PI / n;
    const P = (i) => [cx + r * Math.cos(A(i)), cy + r * Math.sin(A(i))];
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 6', opacity: op });
    const arc = clamp(o.arc ?? 0, 0, n);
    if (arc >= n - 0.001) el('circle', { cx, cy, r, fill: 'none', stroke: o.col || ACC, 'stroke-width': 3.5, opacity: op });
    else if (arc > 0.001) { const a1 = A(0) + arc / n * 2 * Math.PI, big = arc / n > 0.5 ? 1 : 0;
      el('path', { d: `M${cx},${cy - r} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}`, fill: 'none', stroke: o.col || ACC, 'stroke-width': 3.5, opacity: op }); }
    if (o.dot > 0 && o.dot < 1) { const a = -Math.PI / 2 + o.dot * 2 * Math.PI; el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 8, fill: o.col || ACC, opacity: op }); }
    names.forEach((s, i) => { const [x, y] = P(i), on = o.on === i, sc = o.s ? o.s(i) : 1; if (sc <= 0) return;
      card(x, y, o.nw || 118, o.nh || 40, { rx: (o.nh || 40) / 2, text: s, fs: o.fs || 15, fw: 800, fill: on ? (o.col || ACC) : PANEL, stroke: on ? (o.col || ACC) : INK, color: on ? PANEL : INK, s: sc, op }); });
    return P; }
  // 막대 칸(토큰·횟수): x 부터 w 폭, 전체 max 중 v 만큼 채움. o.ticks 눈금 개수
  function slots(x, y, n, filled, o) { o = o || {}; const w = o.w || 22, h = o.h || 22, g = o.gap ?? 4;
    for (let i = 0; i < n; i++) { const f = clamp(filled - i); el('rect', { x: x + i * (w + g), y, width: w, height: h, rx: 4, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.5 });
      if (f > 0) el('rect', { x: x + i * (w + g), y, width: w * f, height: h, rx: 4, fill: o.col ? o.col(i) : ACC, opacity: 0.85 }); } }
  // 비어 있는 자리(점선) + ✗
  function slotX(cx, cy, w, h, s, sc) { card(cx, cy, w, h, { rx: 8, text: s, fs: 14, fw: 700, fill: 'none', stroke: OFF, color: OFF, dash: '5 4', s: sc }); if (sc > 0.5) cross(cx + w / 2 - 4, cy - h / 2 + 4, 7, sc); }
  // 사람이 읽는 순서대로 위에서 아래로 쌓이는 메시지 목록. rows: [[role, text, o?]], at: 지금까지 보일 줄 수(소수 = 마지막 줄이 채워지는 중)
  function msgs(x, y, w, rows, at, o) { o = o || {}; const gap = o.gap || 36;
    if (o.title) tx(x, y - 24, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono' });
    rows.forEach(([role, text, ro], i) => { const u = clamp(at - i); if (u <= 0) return; msg(x, y + i * gap, w, role, text, Object.assign({ u, fs: o.fs, tag: o.tag, h: o.h }, ro || {})); }); }

  // 아래쪽 한계 카드 3장: 페이지 데이터의 limits(status idle · active · fixed)
  function limits(c, y) { const L = c.beat.limits || [], P = (c.prev && c.prev.limits) || [];
    L.forEach((m, i) => { const cx = 170 + i * 310, st = m.status, was = P[i] && P[i].status, fresh = st !== was && st !== 'idle';
      const col = st === 'active' ? BAD : st === 'fixed' ? GOOD : OFF, bg = st === 'active' ? BADBG : st === 'fixed' ? GOODBG : PANEL;
      card(cx, y, 290, 40, { rx: 10, stroke: col, fill: bg, sw: st === 'idle' ? 1.5 : 2.5, s: fresh ? 1 + R.bump(c.u, 0.3) : 1 });
      tx(cx - 132, y + 5, `${i + 1}. ${m.label}`, { 'font-size': 14.5, 'font-weight': 800, fill: st === 'idle' ? OFF : col });
      if (st === 'fixed' && m.fix) mono(cx + 136, y + 5, m.fix.split(' ')[0], { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'end', 'font-weight': 700, opacity: fresh ? fade(c.u, 0.8) : 1 }); }); }
  function qa(c, o) { o = o || {}; const b = c.beat, p = c.prev || {}, u = c.u;
    if (b.query) bubble(o.qx || 938, o.qy || 66, b.query, 'r', { s: b.query !== p.query ? pop(u, 0.2) : 1, fs: 14.5 }); }
  // 학습 데이터 더미 + LLM
  function brain(cx, cy, s, ice) { for (let i = 2; i >= 0; i--) el('rect', { x: cx - 70 + i * 6, y: cy - 98 - i * 6, width: 110, height: 70, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 1.8, opacity: s });
    for (let j = 0; j < 4; j++) el('line', { x1: cx - 58, y1: cy - 82 + j * 13, x2: cx + 20, y2: cy - 82 + j * 13, stroke: OFF, 'stroke-width': 3, opacity: s });
    tx(cx - 15, cy - 14, '학습 데이터', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
    if (ice > 0) { el('rect', { x: cx - 86, y: cy - 128, width: 150, height: 104, rx: 10, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: 0.55 * ice });
      tx(cx - 11, cy - 134, '얼어붙은 지식', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: ice }); }
    card(cx - 10, cy + 30, 130, 46, { rx: 10, text: 'LLM (gpt-4)', fs: 15, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, op: s }); }
  // 시간 축: 학습 시점(2024-01) 뒤는 모른다
  function timeline(y, u, items, ui) { ui = ui ?? u; const x0 = 330, xc = 600, x1 = 930;
    el('rect', { x: x0, y: y - 8, width: (xc - x0) * E(u, 0.1, 0.8), height: 16, rx: 4, fill: INFO, opacity: 0.7 });
    grow(xc, y, x1, y, E(u, 0.6, 1.2), OFF, { dash: '5 5', plain: true });
    el('line', { x1: xc, y1: y - 18, x2: xc, y2: y + 18, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.6) });
    tx(xc, y + 36, '학습 시점 2024-01', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.7) });
    (items || []).forEach(([s, x, col], i) => card(x, y, tw(s, 14) + 22, 30, { rx: 8, text: s, fs: 14, stroke: col || OFF, color: col || OFF, s: pop(ui, 1.0 + i * 0.3) })); }

  // ---------- 1. 오래된 데이터 ----------
  function s1(t, c) { const { k, u } = c;
    brain(150, 200, 1, k === 5 ? E(u, 0.2, 1.0) : 0);
    slotX(140, 300, 170, 38, '외부 데이터 통로', k === 0 ? pop(u, 0.9) : 1);
    limits(c, 392);
    if (k === 0) { note(330, 120, 'LLM 하나만 연결했다. 바깥에 물어볼 길이 없다', fade(u, 1.5)); return; }
    qa(c);
    if (k >= 2) msgs(330, 130, 600, [['user', '삼성전자 현재 주가 알려줘'], ['tool', '(실시간 시세가 들어올 자리 없음)', { ghost: true }]], k === 2 ? E(u, 0.2, 1.6) * 2 : 2, { fs: 13.5, gap: 36 });
    if (k === 2) { [0, 1, 2].forEach((i) => el('circle', { cx: 350 + i * 16, cy: 228, r: 5, fill: MUT, opacity: 0.3 + 0.7 * ((Math.floor(t * 4) + i) % 3 === 0) })); return; }
    if (k >= 3) { bubble(330, 228, '약 73,000원입니다 (학습 시점 2024-01 기준)', 'l', { s: k === 3 ? pop(u, 0.2) : 1, fs: 14.5, stroke: WARN });
      tx(940, 233, '예시 답', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
    if (k >= 3) timeline(318, k === 3 ? seg(u, 0.8, 3) * 1.6 : 2, k === 3 ? [['오늘 시세 ?', 830, WARN]] : [['시세 ?', 680], ['뉴스 ?', 770], ['환율 ?', 860]], k === 3 ? seg(u, 0.8, 3) * 1.6 : k === 4 ? u - 0.6 : 3); }

  // ---------- 2. 환각 ----------
  const TOK = ['존', ' K.', ' 리처드슨', ' 교수가', ' 양자 얽힘', ' 연구로', ' 수상'];
  function s2(t, c) { const { k, u } = c;
    limits(c, 392); qa(c, { qy: 56 });
    if (k === 0) { timeline(318, seg(u, 0.4, 3) * 1.6, [['2025 노벨상 ?', 830, WARN]]); note(330, 150, '학습 데이터에 없는 사건을 묻는다', fade(u, 1.6)); return; }
    bubble(20, 122, '존 K. 리처드슨 교수가 양자 얽힘 연구로 수상했습니다', 'l', { s: k === 1 ? pop(u, 0.2) : 1, fs: 14.5, stroke: BAD });
    pill(800, 122, '존재하지 않는 사람', BAD, k === 1 ? pop(u, 1.2) : 1, { fs: 13.5, fill: BADBG });
    if (k === 1) { note(20, 200, '모른다고 하지 않고 이름과 업적까지 지어낸다', fade(u, 1.8)); return; }
    if (k === 2) { // 그럴듯한 토큰을 잇는다
      let x = 40; TOK.forEach((s, i) => { const w = tw(s.trim(), 15) + 22, a = pop(u, 0.2 + i * 0.28);
        card(x + w / 2, 250, w, 36, { rx: 8, text: s.trim(), fs: 15, fw: 700, stroke: ACC, color: ACC, s: a });
        if (i === 0) card(x + 40, 200, 90, 30, { rx: 8, text: '모릅니다', fs: 13.5, stroke: OFF, color: OFF, dash: '4 3', s: pop(u, 0.3) });
        x += w + 8; });
      note(40, 312, '확률적으로 그럴듯한 다음 토큰을 고를 뿐, 사실인지는 보지 않는다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 3) { [['의료', '없는 약물 상호작용을 사실처럼'], ['법률', '가짜 판례 인용 (실제 변호사 징계)'], ['코딩', '없는 함수를 import']].forEach(([a, b], i) => {
        const cx = 170 + i * 310, s = pop(u, 0.3 + i * 0.4); card(cx, 250, 290, 76, { rx: 10, stroke: BAD, sw: 2, s });
        tx(cx, 240, a, { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.4) });
        tx(cx, 266, b, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); }); return; }
    // k4·k5: 생성 흐름에 사실 확인 칸이 없다
    card(110, 250, 110, 40, { rx: 20, text: '질문', fs: 15, fw: 700 }); grow(166, 250, 216, 250, 1, MUT);
    card(300, 250, 160, 44, { rx: 10, text: '토큰 생성', fs: 15, fw: 800, stroke: ACC, color: ACC });
    grow(382, 250, 470, 250, k === 4 ? E(u, 0.2, 0.7) : 1, MUT);
    if (k === 4) { slotX(570, 250, 190, 44, '사실 확인', pop(u, 0.8)); note(470, 320, '생성 시스템이라 진위를 스스로 가리지 못한다', fade(u, 1.6), { fill: MUT }); }
    else { card(570, 250, 190, 44, { rx: 10, text: '외부 사실 확인', fs: 15, fw: 800, stroke: GOOD, color: GOOD, fill: GOODBG, dash: '6 4', s: pop(u, 0.4) }); pill(570, 205, 'Grounding', GOOD, pop(u, 0.9), { mono: true, fs: 13.5 });
      note(470, 320, '바깥에서 사실을 확인해 붙이지 않으면 고칠 수 없다', fade(u, 1.4)); }
    grow(666, 250, 740, 250, 1, MUT); card(800, 250, 100, 40, { rx: 20, text: '답', fs: 15, fw: 700 }); }

  // ---------- 3. 행동 불가 ----------
  function outbox(cx, cy, n, s) { const g = G(cx, cy, s); el('rect', { x: -60, y: -34, width: 120, height: 68, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 }, g);
    el('path', { d: 'M-60,-34 L0,6 L60,-34', fill: 'none', stroke: INK, 'stroke-width': 2 }, g);
    tx(0, 56, `보낸 메일 ${n}통`, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: n ? GOOD : BAD }, g); }
  function s3(t, c) { const { k, u } = c;
    limits(c, 392); qa(c, { qy: 56 });
    if (k === 0) { outbox(820, 220, 0, pop(u, 0.8)); note(330, 230, '정보가 아니라 행동을 시킨다', fade(u, 1.4)); return; }
    bubble(20, 118, k >= 1 ? 'Gmail에 접속해 새 메일을 작성하시면 됩니다...' : '', 'l', { s: k === 1 ? pop(u, 0.2) : 1, fs: 14.5, stroke: WARN });
    if (k === 1) { outbox(820, 230, 0, 1); cross(820, 222, 16, pop(u, 1.0)); note(330, 240, '친절한 사용법만 돌아온다', fade(u, 1.5)); return; }
    if (k === 2) { [['이메일 발송', 'SMTP / Gmail API'], ['캘린더 등록', '일정 쓰기'], ['DB · 파일', '쿼리 / 파일 시스템'], ['외부 API', '날씨 / 주가 / 번역'], ['결제 · 알림', '부수효과']].forEach(([a, b], i) => {
        const cx = 110 + i * 185, s = pop(u, 0.2 + i * 0.3); card(cx, 250, 170, 70, { rx: 10, stroke: GRID, s });
        tx(cx, 244, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) }); tx(cx, 268, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) });
        cross(cx + 70, 222, 8, pop(u, 0.6 + i * 0.3)); }); return; }
    if (k === 3) { card(140, 250, 140, 46, { rx: 10, text: 'LLM', fs: 16, fw: 800, stroke: ACC, color: ACC });
      fly(210, 250, 400, 250, seg(u, 0.3, 1.3), '조언', { stay: true }); person(470, 252, '사용자', { s: pop(u, 1.0) });
      grow(510, 250, 700, 250, E(u, 1.6, 2.2), INFO); outbox(800, 245, 0, pop(u, 1.8)); tx(600, 230, '직접 실행', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // k4·k5: 텍스트 in → 텍스트 out, 바깥은 못 건드린다
    card(330, 250, 170, 56, { rx: 10, text: 'LLM', fs: 16, fw: 800, stroke: ACC, color: ACC });
    grow(130, 250, 240, 250, k === 4 ? E(u, 0.2, 0.7) : 1, MUT); mono(120, 255, 'text', { 'font-size': 15, 'text-anchor': 'end', fill: MUT });
    grow(330, 280, 330, 340, k === 4 ? E(u, 0.6, 1.1) : 1, MUT); mono(330, 360, 'text', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT });
    outbox(800, 240, 0, 1);
    if (k === 4) { grow(420, 250, 700, 250, E(u, 1.2, 1.8), BAD, { plain: true }); cross(600, 250, 13, pop(u, 1.9)); tx(560, 222, 'side effect', { 'font-size': 14, class: 'mono', fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    else { el('rect', { x: 430, y: 232, width: 260 * E(u, 0.3, 1.2), height: 36, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      tx(560, 256, 'Tool 호출', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); note(430, 320, '도구 호출을 붙이는 것 말고는 방법이 없다', fade(u, 1.6)); } }

  // ---------- 4. Agent: 도구 셋으로 세 한계를 푼다 ----------
  const TL = [['get_stock_price(ticker)', 'yf.Ticker(ticker).info["regularMarketPrice"]', 'Yahoo Finance 실시간 조회'], ['web_search(query)', 'search_api.query(query)', '모르면 검색해서 근거를 붙인다'], ['send_email(to, subject, body)', 'smtp.send(to=to, subject=subject, body=body)', 'SMTP로 실제 발송 (부수효과)']];
  const H4 = [['user', '삼성전자 현재 주가 확인하고, 매니저에게 요약 이메일 보내줘'], ['assistant', 'get_stock_price("005930.KS")'], ['tool', '71200  (예시 값)'], ['assistant', 'send_email(to="manager", subject="주가 요약", …)'], ['tool', '"sent"'], ['assistant', '주가 71,200원 → 매니저에게 메일 발송 완료']];
  function s4(t, c) { const { k, u } = c;
    limits(c, 392);
    qa(c, { qy: 40 });
    card(110, 140, 160, 50, { rx: 10, text: 'LLM (gpt-4)', fs: 15, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
    ['yfinance', 'smtplib'].forEach((s, i) => pill(70 + i * 90, 192, s, INK, k === 0 ? pop(u, 0.5 + i * 0.3) : 1, { mono: true, fs: 13.5 }));
    TL.forEach(([s], i) => { if (k < i + 1 || k === 7) return; pill(118, 240 + i * 38, s.split('(')[0] + '()', ACC, k === i + 1 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5, fill: PANEL }); });
    if (k === 0) { note(250, 140, '같은 LLM에 도구를 얹는다', fade(u, 1.4)); return; }
    if (k <= 3) { const [sig, body, d] = TL[k - 1];
      code(260, 110, ['def ' + sig + ':', '    ' + body], { fs: 14, shown: E(u, 0.2, 1.2) * 2, title: 'agent-with-tools.py' });
      note(260, 210, d, fade(u, 1.3)); grow(170 + (k - 1) * 310, 330, 170 + (k - 1) * 310, 368, E(u, 1.4, 1.9), GOOD); return; }
    if (k === 4) { code(260, 110, ['tools = [', '  {"name": "get_stock_price", "params": {"ticker": "str"}},', '  {"name": "web_search",      "params": {"query": "str"}},', '  {"name": "send_email",      "params": {"to": "str", "subject": "str", "body": "str"}},', ']'],
        { fs: 13.5, shown: E(u, 0.2, 1.8) * 5, title: 'LLM이 고르는 메뉴' }); return; }
    // k5~7: while 루프에서 history 가 쌓인다
    const at = k === 5 ? 1 : k === 6 ? 1 + E(u, 0.2, 1.8) * 2 : 3 + E(u, 0.2, 2.2) * 3;
    msgs(260, 112, 676, H4, at, { title: 'history  (while True로 매번 통째로 넘긴다)', fs: 13.5, gap: 36, tag: 96 });
    if (k === 5) { dot([[260, 112], [200, 130]], (t * 0.7) % 1, INFO, 6); note(260, 170, 'tool_call이 나오는 동안 계속 돈다', fade(u, 1.0)); }
    if (k === 7) outbox(110, 300, 1, pop(u, 2.0)); }

  // ---------- 5. 비즈니스 가치 ----------
  function week(x, y, full, u) { ['월', '화', '수', '목', '금', '토', '일'].forEach((d, i) => { const yy = y + i * 17;
      tx(x - 8, yy + 12, d, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT });
      el('rect', { x, y: yy, width: 192, height: 12, rx: 3, fill: SOFT });
      const a = full ? 0 : 9, b = full ? 24 : 18; if (!full && i >= 5) return;
      el('rect', { x: x + a * 8, y: yy, width: (b - a) * 8 * E(u, 0.2 + i * 0.1, 1.0 + i * 0.1), height: 12, rx: 3, fill: full ? ACC : INFO, opacity: 0.85 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { // 사람 vs Agent, 한 건
      person(110, 110, '사람', { s: k === 0 ? pop(u, 0.2) : 1 }); clock(250, 104, 26, k === 0 ? E(u, 0.4, 1.4) * 0.5 : 0.5, INFO, '30분');
      mono(330, 112, '25,000원', { 'font-size': 22, 'font-weight': 800, opacity: k === 0 ? fade(u, 1.0) : 1 }); sub(390, 140, '시간당 50,000원', k === 0 ? fade(u, 1.2) : 1);
      week(140, 190, false, k === 0 ? u : 3); tx(140, 330, '평일 9~18시만 · 하루 16건', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 0 ? fade(u, 1.6) : 1 });
      if (k === 0) return;
      card(590, 110, 110, 50, { rx: 10, text: 'Agent', fs: 16, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.2) }); clock(720, 104, 26, E(u, 0.4, 0.8) * (0.5 / 60), ACC, '30초');
      mono(790, 112, '200원', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); sub(840, 140, 'LLM 토큰 + API', fade(u, 1.2));
      week(620, 190, true, u); tx(620, 330, '24/7 · 병렬 처리', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { const rows = [['비용', 25000000, 200000, '2,500만원', '20만원', '99.2% 절감'], ['처리 시간', 500, 8.3, '500시간', '8.3시간', '98.3% 절감'], ['실수율', 3, 0.1, '3%', '< 0.1%', '30배 낮다']];
      tx(40, 40, '월 1,000건 기준', { 'font-size': 16, 'font-weight': 800 });
      rows.forEach(([n, a, b, sa, sb, d], i) => { const y = 90 + i * 100, g = E(u, 0.2 + i * 0.4, 1.0 + i * 0.4);
        tx(40, y + 22, n, { 'font-size': 16, 'font-weight': 800 });
        el('rect', { x: 180, y, width: Math.max(3, 520 * g), height: 20, rx: 4, fill: OFF }); el('rect', { x: 180, y: y + 26, width: Math.max(3, 520 * (b / a) * g), height: 20, rx: 4, fill: ACC });
        mono(710, y + 15, '사람 ' + sa, { 'font-size': 14, opacity: fade(u, 0.8 + i * 0.4) }); mono(190 + Math.max(3, 520 * b / a), y + 42, 'Agent ' + sb, { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4) });
        pill(880, y + 23, d, GOOD, pop(u, 1.0 + i * 0.4), { fs: 13.5 }); }); return; }
    if (k === 3) { tx(480, 40, '2026 기준 실제 도입 사례', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      [['고객 지원', ['Intercom Fin', 'Zendesk AI Agent']], ['영업 자동화', ['Salesforce Agentforce']], ['코드 작업', ['GitHub Copilot Workspace', 'Claude Code']], ['코드 편집기', ['Cursor Agent', 'Sourcegraph Cody']]].forEach(([f, ps], i) => {
        const y = 100 + i * 72; tx(90, y + 5, f, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2 + i * 0.35) });
        let x = 230; ps.forEach((p, j) => { const w = tw(p, 14) + 30; pill(x + w / 2, y, p, ACC, pop(u, 0.4 + i * 0.35 + j * 0.15), { fs: 14 }); x += w + 14; }); }); return; }
    if (k === 4) { card(240, 170, 330, 150, { rx: 12, stroke: OFF, sw: 2, s: pop(u, 0.2) }); card(720, 170, 330, 150, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.7) });
      tx(240, 130, 'LLM 단독 = 조언자', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); tx(240, 175, '답을 주면', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) }); tx(240, 205, '실행은 사용자가 한다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) });
      tx(720, 130, 'Agent = 실무자', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); tx(720, 175, '직접 행동하고', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); tx(720, 205, '결과를 돌려준다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      grow(410, 170, 550, 170, E(u, 1.3, 2.0), ACC); return; }
    tx(480, 140, '가치는 행동의 자동화에서 나온다', { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2, 0.8) });
    [['30분 → 30초', '1건 처리 시간'], ['25,000원 → 200원', '1건 비용'], ['평일 낮 → 24/7', '응대 시간']].forEach(([a, b], i) => { const s = pop(u, 1.0 + i * 0.3);
      card(220 + i * 260, 250, 230, 74, { rx: 10, stroke: ACC, sw: 2, s }); mono(220 + i * 260, 248, a, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.1 + i * 0.3) });
      tx(220 + i * 260, 272, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.1 + i * 0.3) }); });
    tx(480, 350, '그래서 많은 SaaS가 Agent 기능을 앞다퉈 붙이고 있다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'LLM에 "삼성전자 현재 주가"를 물었을 때 오늘 시세가 나오지 않는 이유는 무엇인가?',
      o: ['숫자 계산을 못해서', '바깥 데이터 통로가 없어서', '질문이 모호해서'], a: 1,
      why: 'ask_llm()은 질문 한 줄만 넘긴다. 참고할 실시간 데이터가 없으니 2024-01 기준 값 같은 학습 시점의 답이 나온다.' },
    { q: '2025년 노벨상 질문에 LLM이 없는 사람 이름을 댄 원인은 무엇인가?',
      o: ['진위를 검증하지 않고 토큰을 이어서', '학습 데이터가 너무 많아서', '일부러 속이도록 학습돼서'], a: 0,
      why: 'LLM은 검색 시스템이 아니라 토큰 생성 시스템이다. "모릅니다"보다 그럴듯한 다음 토큰을 골라 이름과 업적까지 만든다.' },
    { q: '메일을 보내 달라는 요청에 LLM이 사용법만 설명한 이유는 무엇인가?',
      o: ['Gmail 계정이 없어서', '요청 문장이 너무 길어서', '바깥을 바꾸는 능력이 없어서'], a: 2,
      why: 'LLM은 텍스트 in, 텍스트 out이다. 메일 발송, 캘린더 등록, 결제 같은 행동은 도구를 호출해야만 일어난다.' },
    { q: 'Agent에서 환각 한계를 맡는 도구는 무엇인가?',
      o: ['web_search', 'get_stock_price', 'send_email'], a: 0,
      why: '모르는 것은 지어내지 말고 web_search로 근거를 찾아 붙인다. 주가는 get_stock_price, 발송은 send_email이 맡는다.' },
    { q: '월 1,000건 기준으로 Agent가 줄이는 비용은 몇 퍼센트인가?',
      o: ['98.3%', '99.2%', '30%'], a: 1,
      why: '사람 2,500만원, Agent 20만원이라 99.2%가 준다. 98.3%는 처리 시간(500시간에서 8.3시간) 절감률이다.' },
  ];

  // 완료 화면: 정리 문장과 장면을 엮는 복습 문제
  const summary = [
    'LLM 단독은 지식이 학습 시점에 굳어 있어 오늘 주가 같은 실시간 정보를 모른다.',
    '모르는 것도 그럴듯한 토큰을 이어 지어내고, 그 말이 사실인지 스스로 가리지 못한다.',
    '텍스트만 내놓으니 메일 발송 같은 실행은 사람이 따로 해야 한다.',
    '도구를 붙인 Agent는 세 한계를 풀고 한 건 비용을 25,000원에서 200원으로 낮춘다.',
  ];
  const review = [
    { q: '사내 챗봇이 없는 규정 조항을 자신 있게 인용했다. 먼저 붙일 것은?',
      o: ['더 큰 모델', '규정 문서를 검색해 근거로 붙이는 도구', '답변 길이 제한'], a: 1,
      why: '환각은 진위를 검증할 장치가 없어서 생긴다. 바깥 문서에서 근거를 찾아 붙여야 줄어든다.' },
    { q: 'Agent가 "메일 보냈습니다"라고 답했는데 실제 보낸 메일함은 비어 있다. 먼저 확인할 것은?',
      o: ['send_email 호출 기록', '질문에 쓴 높임말', '모델의 학습 시점'], a: 0,
      why: '발송이라는 부수효과는 도구 호출에서만 생긴다. 호출 없이 LLM이 문장만 만들었다면 그 말은 또 하나의 환각이다.' },
    { q: 'Agent를 붙였는데도 "오늘 주가"를 물으면 2024년 값이 나온다. 가장 그럴듯한 원인은?',
      o: ['SMTP 설정이 틀렸다', 'web_search 결과가 너무 길다', 'LLM이 get_stock_price를 고르지 않았다'], a: 2,
      why: '도구가 있어도 LLM이 고르지 않으면 학습 시점 값으로 답한다. 도구 설명과 호출 기록을 먼저 본다.' },
  ];

  R.page({ title: '왜 Agent가 필요한가', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
