/* V-2-2 Multi-Agent 개요 — 장면 4개 (../../anim/engine.js 규칙을 따른다)
   그래프 노드와 그 사이를 오가는 state, GuardRail 값, 선택 기준을 그린다. LLM 결과 내용은 "…" 로 둔다. */
(function () {
  const R = window.RA, { C, el, tx, E, clamp, seg, pop, fade, tw, card, mono, sub, pill, grow, fly, dot, check, cross, spans, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const ap = (c, at, t0 = 0.2, d = 0.6) => (c.k > at ? 1 : c.k === at ? seg(c.u, t0, t0 + d) : 0);
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  // 노드 (가운데 기준)
  const node = (x, y, s, o) => { o = o || {}; return card(x, y, o.w || tw(s, 15) + 34, o.h || 44, { rx: 12, text: s, fs: 15, fw: 800, mono: o.mono, stroke: o.col || INK, color: o.col || INK, fill: o.fill || PANEL, sw: o.sw || 2.2, s: o.s, op: o.op, dash: o.dash }); };
  // state 판: rows = [[key, value, {op, hot, empty}]]
  function stateBox(x, y, w, title, rows, o) {
    o = o || {}; const rh = o.rh || 32;
    el('rect', { x, y, width: w, height: rows.length * rh + 40, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 2 });
    tx(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    rows.forEach(([kk, v, ro], i) => { ro = ro || {}; const yy = y + 36 + i * rh, op = ro.op ?? 1; if (op <= 0.01) return;
      if (ro.hot) el('rect', { x: x + 6, y: yy, width: w - 12, height: rh - 4, rx: 6, fill: ACCBG, opacity: op });
      mono(x + 16, yy + rh / 2 + 3, kk, { 'font-size': 14, 'font-weight': 700, fill: ro.empty ? MUT : INK, opacity: op });
      mono(x + (o.kw || 140), yy + rh / 2 + 3, v, { 'font-size': 14, fill: ro.empty ? MUT : ro.col || ACC, opacity: op }); });
  }

  // 1. Supervisor — 팀장이 다음 사람을 고른다
  const SV = { s: [190, 200], r: [420, 80], c: [420, 200], v: [420, 320], e: [190, 340] };
  function s1(t, c) { const { k, u } = c;
    pill(110, 34, 'StateGraph(dict)', INK, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
    // 배선 (k5 부터 실선, 그 전엔 흐린 선)
    const W = [['r', 1], ['c', 2], ['v', 3]];
    W.forEach(([key, at]) => { const op = ap(c, at, 0.2, 0.5); if (op <= 0) return; const [x, y] = SV[key], f = k === 5 ? E(u, 0.4 + at * 0.2, 1.0 + at * 0.2) : k > 5 ? 1 : 0;
      el('line', { x1: SV.s[0] + 70, y1: SV.s[1], x2: x - 70, y2: y, stroke: GRID, 'stroke-width': 2, opacity: op });
      if (f > 0) { grow(SV.s[0] + 70, SV.s[1] - 6, x - 72, y - 6, f, ACC, { dash: '6 5' }); grow(x - 72, y + 6, SV.s[0] + 72, SV.s[1] + 6, f, MUT); } });
    if (k >= 5) { const f = k === 5 ? E(u, 0.2, 0.8) : 1; grow(SV.s[0], 92, SV.s[0], SV.s[1] - 26, f, ACC); mono(SV.s[0] + 10, 104, 'entry', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: f });
      grow(SV.s[0], SV.s[1] + 24, SV.e[0], SV.e[1] - 18, k === 5 ? E(u, 1.4, 1.9) : 1, MUT, { dash: '6 5' }); }
    if (k === 5) tx(305, 400, '조건부 엣지가 팀장의 결정을 라우팅한다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    node(SV.s[0], SV.s[1], 'supervisor', { mono: true, col: k === 4 ? ACC : INK, s: k === 0 ? pop(u, 0.5) : 1, sw: k === 4 ? 2.8 : 2.2 });
    node(SV.e[0], SV.e[1], 'END', { mono: true, col: MUT, s: k === 0 ? pop(u, 0.9) : 1, h: 36 });
    [['r', 'researcher', '조사'], ['c', 'coder', '구현'], ['v', 'reviewer', 'pass / fail']].forEach(([key, s, d], i) => { const sc = c.k > i + 1 ? 1 : c.k === i + 1 ? pop(u, 0.2) : 0; if (sc <= 0) return; const [x, y] = SV[key];
      node(x, y, s, { mono: true, s: sc, w: 140, col: k === i + 1 ? ACC : INK }); sub(x, y + 38, d, sc); });
    if (k === 2) { grow(SV.r[0] + 76, SV.r[1] + 6, SV.c[0] + 76, SV.c[1] - 6, 1, ACC); tx(SV.c[0], 262, 'research 를 입력으로', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); }
    // state
    const X = 590, Wd = 346, keys = ['research', 'code', 'review'];
    const filled = k === 6 ? Math.floor(clamp((u - 0.2) / 0.75, 0, 3.99)) : 0;
    const rows = [['task', '"사용자 인증 모듈 만들기"', { col: INK }]].concat(keys.map((kk, i) => { const shown = k >= i + 1, full = k === 6 && filled > i;
      return [kk, full ? '"…"' : '(아직 없음)', { op: shown ? (k === i + 1 ? fade(u, 0.6) : 1) : 0, empty: !full, hot: k === 6 && filled === i + 1 }]; }));
    stateBox(X, 22, Wd, 'state', rows, { kw: 120 });
    if (k === 1) tx(X + Wd / 2, 214, '결과는 state 의 자기 칸에만 쓴다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    if (k === 4 || k === 6) { const R4 = ['"research" 없음 → researcher', '"code" 없음 → coder', '"review" 없음 → reviewer', '다 찼음 → END'];
      const cur = k === 4 ? 0 : Math.min(3, filled);
      R4.forEach((s, i) => { const y = 214 + i * 34, op = k === 4 ? fade(u, 0.3 + i * 0.3) : 1;
        el('rect', { x: X, y, width: Wd, height: 28, rx: 6, fill: i === cur ? ACCBG : PANEL, stroke: i === cur ? ACC : GRID, 'stroke-width': 1.5, opacity: op });
        mono(X + 12, y + 19, s, { 'font-size': 14, 'font-weight': i === cur ? 800 : 400, opacity: op }); });
      if (k === 4) tx(X + Wd / 2, 372, '팀장은 일을 하지 않고 다음 사람만 고른다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 6) { const P = [SV.s, SV.r, SV.s, SV.c, SV.s, SV.v, SV.s, SV.e]; dot(P, seg(u, 0.2, 2.6), ACC, 8);
      tx(305, 400, '흐름이 늘 supervisor 한 점을 지난다. 디버깅이 가장 쉽다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); } }

  // 2. Hierarchy — hand-off · task split · memory share
  const HN = { ceo: [240, 52], fe: [120, 160], be: [360, 160], ui: [120, 262], api: [300, 262], db: [420, 262] };
  function s2(t, c) { const { k, u } = c;
    const lay = ap(c, 0, 0.2, 1.2);
    [['ceo', 'fe'], ['ceo', 'be'], ['fe', 'ui'], ['be', 'api'], ['be', 'db']].forEach(([a, b], i) => { const f = clamp(lay * 5 - i), hot = (k === 2 && a === 'ceo') || (k === 3 && a === 'fe') || (k === 4 && a === 'be');
      grow(HN[a][0], HN[a][1] + 24, HN[b][0], HN[b][1] - 24, f, hot ? ACC : GRID, { plain: !hot, sw: hot ? 2.8 : 2 }); });
    [['ceo', 'CEO', 0], ['fe', 'FE Lead', 1], ['be', 'BE Lead', 1], ['ui', 'UI', 2], ['api', 'API', 2], ['db', 'DB', 2]].forEach(([key, s, lv]) => { const [x, y] = HN[key], sc = k === 0 ? pop(u, 0.3 + lv * 0.4) : 1;
      const hot = (k === 2 && lv === 0) || (k === 5 && lv === 0) || (k === 3 && (key === 'fe' || key === 'ui')) || (k === 4 && (key === 'be' || key === 'api' || key === 'db'));
      node(x, y, s, { s: sc, col: hot ? ACC : lv === 2 ? MUT : INK, w: lv === 2 ? 86 : 120 }); });
    if (k === 0) [['사업부', 52], ['팀', 160], ['팀원', 262]].forEach(([s, y], i) => tx(24, y + 5, s, { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }));
    // 공유 state
    const X = 520, Wd = 416, h = ap(c, 1, 0.2, 0.4);
    const fe = k >= 2, be = k >= 2, fr = k >= 3, br = k >= 4, fin = k >= 5;
    const rows = [['feature_request', '(기능 요구사항)', { col: INK }],
      ['fe_subtasks', fe ? '["UI"]' : '[]', { empty: !fe, hot: k === 2, op: k === 1 ? fade(u, 0.4) : 1 }],
      ['be_subtasks', be ? '["API", "DB"]' : '[]', { empty: !be, hot: k === 2, op: k === 1 ? fade(u, 0.5) : 1 }],
      ['fe_results', fr ? '["…"]  (UI 1건)' : '[]', { empty: !fr, hot: k === 3 || k === 5, op: k === 1 ? fade(u, 0.6) : 1 }],
      ['be_results', br ? '["…", "…"]  (API, DB)' : '[]', { empty: !br, hot: k === 4 || k === 5, op: k === 1 ? fade(u, 0.7) : 1 }],
      ['final', fin ? '"…"' : '""', { empty: !fin, hot: k === 5, op: k === 1 ? fade(u, 0.8) : 1 }]];
    if (k >= 1) { stateBox(X, 22, Wd, 'SharedState  (모두가 읽고 쓴다)', rows, { kw: 176, stroke: k === 1 || k === 5 ? ACC : GRID }); }
    if (k === 1) tx(X + Wd / 2, 270, '이 한 칸짜리 공유 저장소가 memory share 다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    if (k === 2) { fly(HN.ceo[0] + 60, HN.ceo[1], X + 20, 104, seg(u, 0.5, 1.3), 'FE: UI', { mono: true }); fly(HN.ceo[0] + 60, HN.ceo[1], X + 20, 136, seg(u, 0.9, 1.7), 'BE: API, DB', { mono: true });
      tx(X + Wd / 2, 290, 'CEO 가 요구사항을 두 갈래로 넘긴다 = hand-off', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (k === 3) { mono(HN.ui[0], 310, 'run_fe_worker("UI")', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(X + Wd / 2, 290, 'subtask 마다 자식 worker 를 부른다 = task split', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
    if (k === 4) { mono(360, 310, 'run_be_worker × 2', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(X + Wd / 2, 290, '두 Lead 는 서로를 모른 채 병렬로 돈다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
    if (k === 5) { fly(X - 40, 168, HN.ceo[0] + 50, HN.ceo[1] + 10, seg(u, 0.3, 1.2), 'fe_results', { mono: true });
      fly(X - 40, 200, HN.ceo[0] + 50, HN.ceo[1] + 10, seg(u, 0.6, 1.5), 'be_results', { mono: true });
      tx(X + Wd / 2, 290, '결과를 따로 받지 않고 state 에서 읽어 합친다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    // 그래프 배선 (아래)
    if (k >= 6) { const F = { h: [84, 370], f: [236, 344], b: [236, 398], i: [380, 370], e: [478, 370] };
      [['h', 'ceo_handoff'], ['f', 'fe_lead'], ['b', 'be_lead'], ['i', 'ceo_integrate'], ['e', 'END']].forEach(([key, s], i) => pill(F[key][0], F[key][1], s, key === 'h' ? ACC : key === 'e' ? MUT : INK, k === 6 ? pop(u, 0.2 + i * 0.25) : 1, { mono: true, fs: 13.5 }));
      if (k === 6) { mono(84, 336, 'entry', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
        tx(X + Wd / 2, 370, 'add_node × 4 · set_entry_point("ceo_handoff")', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 1.6) }); }
      if (k === 7) { const E2 = [['h', 'f'], ['h', 'b'], ['f', 'i'], ['b', 'i'], ['i', 'e']], off = { h: 60, f: 44, b: 44, i: 69, e: 27 };
        E2.forEach(([a, b], i) => grow(F[a][0] + off[a], F[a][1], F[b][0] - off[b], F[b][1], E(u, 0.2 + i * 0.35, 0.6 + i * 0.35), i < 2 ? ACC : MUT));
        tx(X + Wd / 2, 340, 'fan-out 2 · join 1 · END', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) });
        tx(X + Wd / 2, 372, 'hand-off · split · share 가 한 그래프에', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); } } }

  // 3. Network — 자유 hand-off 와 12 가드
  const NW = { Writer: [100, 64], Critic: [330, 64], Researcher: [100, 190], Tester: [330, 190] };
  const GUARD = [
    ['Loop Guard', [['max_iterations', '25', 1], ['no_progress_window', '3', 1], ['tool_error_cap', '3', 0], ['wall_clock_timeout', '300  # 5min', 1]]],
    ['Cost Cap', [['session_token_cap', '200_000', 1], ['daily_call_limit', '1_000', 0], ['small_model_threshold', '2_000', 0], ['tool_call_cap', '30', 0]]],
    ['Observability', [['trace_id', 'uuid4().hex', 1], ['log_handoffs', 'True', 1], ['metrics_p95_target_ms', '8_000', 0], ['require_human_for_risky', 'True', 1]]]];
  function s3(t, c) { const { k, u } = c, done = c.beat.checklistDone;
    // 네트워크: 모든 쌍이 연결 가능
    const names = Object.keys(NW);
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) { const [x1, y1] = NW[names[a]], [x2, y2] = NW[names[b]], f = k === 0 ? E(u, 0.4 + (a + b) * 0.12, 1.0 + (a + b) * 0.12) : 1;
      el('line', { x1, y1, x2: x1 + (x2 - x1) * f, y2: y1 + (y2 - y1) * f, stroke: k === 0 ? WARN : GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); }
    names.forEach((n, i) => node(NW[n][0], NW[n][1], n, { s: k === 0 ? pop(u, 0.1 + i * 0.15) : 1, w: 130, col: (k === 5 && i < 2) || (k === 7 && (n === 'Writer' || n === 'Researcher')) ? ACC : INK }));
    if (k === 0) tx(215, 262, '셀끼리 아무 방향으로나 넘긴다. 폭주도 쉽다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.6) });
    // GuardRail
    const X = 470, Wd = 466; let y = 20, idx = 0;
    tx(X, y + 4, '@dataclass  GuardRail', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    mono(X + Wd, y + 4, `${k === 1 || k === 2 || k === 3 ? Math.round(done - 4 + 4 * E(u, 0.2, 1.4)) : done} / 12`, { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' });
    const hotRow = { 5: ['max_iterations', 'wall_clock_timeout'], 6: ['no_progress_window', 'session_token_cap'], 7: ['trace_id', 'log_handoffs'], 8: ['require_human_for_risky'] }[k] || [];
    GUARD.forEach(([g, rows], gi) => { y += 22; const gop = ap(c, gi + 1, 0.1, 0.4);
      tx(X, y + 14, g, { 'font-size': 14.5, 'font-weight': 800, fill: gop > 0 ? INFO : MUT, opacity: Math.max(0.35, gop) });
      rows.forEach(([kk, v, inLoop], ri) => { y += 24; idx++; const op = ap(c, gi + 1, 0.2 + ri * 0.3, 0.4), hot = hotRow.includes(kk);
        el('rect', { x: X, y: y - 2, width: Wd, height: 24, rx: 5, fill: hot ? ACCBG : SOFT, stroke: hot ? ACC : 'none', 'stroke-width': 2, opacity: Math.max(0.3, op) });
        if (op > 0) { check(X + 12, y + 10, 5, pop(op, 0, 1)); mono(X + 26, y + 15, kk, { 'font-size': 13.5, opacity: op }); mono(X + 250, y + 15, '= ' + v, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: op }); }
        if (k === 8) mono(X + Wd - 8, y + 15, inLoop ? '루프 안' : '바깥', { 'font-size': 13.5, 'font-weight': 700, fill: inLoop ? GOOD : MUT, 'text-anchor': 'end', opacity: fade(u, 1.2 + idx * 0.06) }); }); });
    // 실행 카운터
    const CX = 24, CY = 290;
    if (k >= 4) { const it = k === 4 ? 0 : k === 5 ? 1 : 3;
      [['iter_count', String(it)], ['tool_errors', '0'], ['used_tokens', k >= 6 ? '…' : '0'], ['started', 'monotonic()'], ['last_responses', k === 6 ? '[A, B, B, B]' : '[]']].forEach(([a, b], i) => {
        const x = CX + (i % 3) * 148, yy = CY + Math.floor(i / 3) * 52, op = k === 4 ? fade(u, 0.2 + i * 0.2) : 1;
        el('rect', { x, y: yy, width: i === 4 ? 288 : 140, height: 44, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
        mono(x + 10, yy + 18, a, { 'font-size': 13.5, fill: MUT, opacity: op }); mono(x + 10, yy + 37, b, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: op }); });
      if (k === 4) mono(CX, CY + 118, 'payload = {task, trace_id}', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) }); }
    if (k === 5) { dot([NW.Writer, NW.Critic], seg(u, 0.2, 1.0), ACC, 7); dot([NW.Critic, NW.Writer], seg(u, 1.1, 1.9), ACC, 7);
      tx(215, 262, 'iter 1 ≤ 25 · 경과 ≤ 300s 이면 통과', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6) }); }
    if (k === 6) { tx(215, 262, '최근 3턴이 같은 응답 B · B · B → break', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.8) });
      cross(440, 364, 8, pop(u, 1.4)); tx(215, 408, '토큰이 세션 상한을 넘어도 break', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 7) { grow(NW.Writer[0], NW.Writer[1] + 24, NW.Researcher[0], NW.Researcher[1] - 24, E(u, 0.2, 0.8), ACC);
      el('rect', { x: 180, y: 222, width: 270, height: 50, rx: 8, fill: INK, opacity: fade(u, 0.8) });
      mono(190, 242, 'log.info("handoff", trace_id,', { 'font-size': 13.5, fill: 'var(--term)', opacity: fade(u, 1.0) });
      mono(190, 262, '  from=Writer, iter=3)', { 'font-size': 13.5, fill: 'var(--term)', opacity: fade(u, 1.2) }); }
    if (k === 8) { card(215, 256, 300, 44, { rx: 22, text: 'needs_human → human_approve?', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.3) });
      tx(215, 408, '루프가 직접 보는 가드는 7개, 나머지는 바깥에서', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); } }

  // 4. 시작 가이드 — 고르고, 설계하고, 가드를 켜고, PoC
  const STAGE = ['패턴 선택', '메커니즘 설계', '12 가드', 'PoC'];
  function s4(t, c) { const { k, u } = c, st = [0, 0, 0, 1, 2, 2, 2, 3, 4][k];
    STAGE.forEach((s, i) => { const x = 130 + i * 233, on = st === i || st === 4, past = st > i, sc = k === 0 ? pop(u, 0.2 + i * 0.35) : 1;
      card(x, 40, 190, 42, { rx: 21, text: `${i + 1}. ${s}`, fs: 15, fw: 800, stroke: on ? ACC : past ? GOOD : GRID, color: on ? ACC : past ? GOOD : MUT, fill: on ? ACCBG : PANEL, s: sc });
      if (i < 3) grow(x + 98, 40, x + 134, 40, k === 0 ? E(u, 0.4 + i * 0.35, 0.7 + i * 0.35) : 1, MUT); });
    if (k === 0) tx(480, 120, '이 순서를 건너뛰면 대개 되돌아온다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    // 1. 도구 수 축
    if (k === 1 || k === 2) { const X = (v) => 80 + v * 32, y = 170;
      el('line', { x1: X(0), y1: y, x2: X(25), y2: y, stroke: MUT, 'stroke-width': 2 });
      [0, 5, 10, 15, 20, 25].forEach((v) => { el('line', { x1: X(v), y1: y - 5, x2: X(v), y2: y + 5, stroke: MUT }); mono(X(v), y + 24, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      tx(X(25), y + 46, '도구 개수', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 });
      const a = k === 1 ? E(u, 0.3, 1.0) : 1, b = k === 1 ? E(u, 1.1, 1.8) : 1;
      el('rect', { x: X(0), y: y - 46, width: (X(5) - X(0)) * a, height: 34, rx: 6, fill: GOOD, opacity: 0.85 }); if (a > 0.9) tx(X(2.5), y - 24, 'Single', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
      el('rect', { x: X(10), y: y - 46, width: (X(20) - X(10)) * b, height: 34, rx: 6, fill: ACC, opacity: 0.85 }); if (b > 0.9) tx(X(15), y - 24, 'Supervisor', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
      if (k === 1) { tx(X(2.5), y + 72, '단일 도메인이면 Multi로 가지 마라', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        tx(X(15), y + 72, '분업이 분명해지는 구간', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }
    if (k === 2) { [['Hierarchy', '큰 조직, 도메인별 분할', 'FE / BE / Data Lead', INFO], ['Network', '검증 · 토론, 다양한 의견', 'loop guard 필수', WARN]].forEach(([a, b, d, col], i) => { const x = 250 + i * 460, s = pop(u, 0.3 + i * 0.5);
        card(x, 320, 400, 100, { rx: 12, stroke: col, sw: 2.4, s }); tx(x - 180, 302, a, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) });
        tx(x - 180, 330, b, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.5) }); tx(x - 180, 354, d, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); }); }
    // 2. 메커니즘
    if (k === 3) { [['Hand-off', '명시적 호출 + 컨텍스트 전달', '@tool 또는 graph edge'], ['Memory share', '공유 state / store', 'StateGraph, Redis'], ['Task split', '자식 N개 fan-out → join', 'map-reduce']].forEach(([a, b, d], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
        card(x, 220, 280, 150, { rx: 12, stroke: ACC, sw: 2.2, s }); tx(x, 180, a, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
        tx(x, 222, b, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.4) }); mono(x, 258, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
      tx(480, 340 + 50, '셋을 조합해서 쓴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    // 3. 12 가드
    if (k >= 4 && k <= 6) { const COLS = [['Loop Guard', ['max_iterations ≤ 25', '3턴 같은 응답 → break', 'tool error ≥ 3 → escalate', 'wall-clock 5min']],
        ['Cost Cap', ['세션 token 200k', '일일 호출 한도 + 80% 알람', '모델 라우팅 small/large', 'tool call 최대 30']],
        ['Observability', ['trace_id 전파', 'hand-off 로그', 'p50/p95 · error 대시', '위험 작업은 사람 확인']]];
      COLS.forEach(([g, items], gi) => { const x = 24 + gi * 312, cur = k - 4 === gi, on = k - 4 >= gi, op = on ? 1 : 0.35;
        el('rect', { x, y: 90, width: 300, height: 260, rx: 12, fill: cur ? GOODBG : PANEL, stroke: cur ? GOOD : GRID, 'stroke-width': cur ? 2.6 : 1.5, opacity: op });
        tx(x + 16, 120, g, { 'font-size': 17, 'font-weight': 800, fill: on ? GOOD : MUT, opacity: op });
        items.forEach((s, i) => { const yy = 150 + i * 46, ck = cur ? clamp(u * 2.2 - 0.3 - i * 0.35) : on ? 1 : 0;
          el('rect', { x: x + 16, y: yy, width: 22, height: 22, rx: 4, fill: PANEL, stroke: ck > 0 ? GOOD : MUT, 'stroke-width': 1.8, opacity: op });
          if (ck > 0) check(x + 27, yy + 11, 6, pop(ck, 0, 1)); tx(x + 48, yy + 16, s, { 'font-size': 14.5, opacity: op }); }); });
      tx(480, 384, ['반복 상한 · 무진전 · 에러 누적 · 시간 제한은 첫날부터', '비용이 새는 네 구멍을 막는다', '관측이 없으면 개선도 없다'][k - 4], { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    // 4. PoC
    if (k === 7) { card(250, 200, 400, 150, { rx: 14, stroke: ACC, sw: 2.6, s: pop(u, 0.2) });
      tx(250, 160, 'PoC 1개 · 1주일', { 'font-size': 19, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      [['Supervisor 패턴', 0.5], ['도구 3개', 0.8], ['12 가드', 1.1]].forEach(([s, a], i) => pill([120, 250, 370][i], 214, s, INK, pop(u, a), { fs: 14.5 }));
      grow(460, 200, 560, 200, E(u, 1.3, 1.7), MUT);
      [['측정', 'p95 latency · 비용 · 루프 빈도'], ['확장 결정', '한계를 만나면 Hierarchy 나 Network']].forEach(([a, b], i) => { const y = 160 + i * 80, op = fade(u, 1.6 + i * 0.4);
        tx(580, y, a, { 'font-size': 17, 'font-weight': 800, opacity: op }); tx(580, y + 26, b, { 'font-size': 15, fill: MUT, opacity: op }); }); }
    if (k === 8) { tx(480, 190, '패턴이 멋있어서가 아니라', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2, 0.6) });
      tx(480, 232, '문제가 요구할 때만 Multi 로 간다', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8, 0.6) });
      [['3 패턴', 'Supervisor · Hierarchy · Network'], ['3 메커니즘', 'hand-off · share · split'], ['12 가드', 'Loop · Cost · Observability']].forEach(([a, b], i) => { const x = 180 + i * 300, s = pop(u, 1.4 + i * 0.25);
        card(x, 320, 270, 70, { rx: 10, stroke: ACC, sw: 2, s }); tx(x, 314, a, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5 + i * 0.25) });
        tx(x, 338, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5 + i * 0.25) }); }); } }

  const quiz = [
    { q: 'supervisor_node가 하는 일은 무엇인가?',
      o: ['조사·구현·리뷰를 직접 나눠서 한다', 'state에 빠진 칸을 보고 다음 worker를 고른다', '모든 worker의 결과를 하나로 요약한다'], a: 1,
      why: '"research" 가 없으면 researcher, "code" 가 없으면 coder처럼 다음 사람만 고르고, 다 차면 END를 돌려준다.' },
    { q: 'Hierarchy 예제에서 CEO는 FE·BE 결과를 어떻게 받나?',
      o: ['공유 state의 fe_results와 be_results를 읽는다', '각 Lead가 CEO에게 메시지를 따로 보낸다', '자식 worker를 다시 실행해 얻는다'], a: 0,
      why: 'ceo_integrate는 SharedState에서 두 칸을 읽어 final을 쓴다. 이것이 memory share다.' },
    { q: 'network.py의 no-progress 가드가 루프를 끊는 조건은 무엇인가?',
      o: ['iter_count가 25를 넘을 때', '토큰이 200,000을 넘을 때', '최근 3턴의 응답이 모두 같을 때'], a: 2,
      why: 'last_responses의 마지막 3개가 한 종류뿐이면 진전이 없다고 보고 break 한다. 상한과 토큰은 다른 가드다.' },
    { q: '도구 5개 이내, 단일 도메인인 봇에 알맞은 구조는 무엇인가?',
      o: ['Network', 'Supervisor', 'Single Agent'], a: 2,
      why: '체크리스트 첫 줄이 "도구 5개 이내, 단일 도메인이면 Multi로 가지 마라" 다. 분업이 분명한 10~20개 구간부터 Supervisor를 쓴다.' },
  ];

  const summary = [
    'Supervisor는 팀장 노드가 state의 빈칸을 보고 다음 worker를 고르고, worker는 늘 팀장에게 돌아온다.',
    'Hierarchy는 hand-off로 일을 넘기고 자식 worker로 쪼갠 뒤, 공유 state에서 결과를 모아 합친다.',
    '셀끼리 자유롭게 넘기는 Network는 반복 상한, 무진전, 시간, 토큰 같은 가드를 먼저 켠다.',
    '도구 5개 이내면 Single로 충분하다. Multi는 문제가 요구할 때만 쓰고 PoC 하나로 먼저 잰다.',
  ];
  const review = [
    { q: 'Writer와 Critic이 같은 피드백을 주고받으며 몇 분째 돌고, 토큰이 계속 쌓인다. 가장 먼저 걸렸어야 할 가드는?',
      o: ['최근 3턴 응답이 같으면 끊는 no-progress 감지', 'p95 latency 목표 8,000ms', 'small_model_threshold 라우팅'], a: 0,
      why: '같은 응답이 반복되는 것은 진전이 없다는 신호다. no_progress_window 3이 걸리면 시간이나 토큰 상한까지 가기 전에 멈춘다.' },
    { q: '도구 4개짜리 FAQ 봇을 Hierarchy로 만들었더니 느리고 디버깅이 어렵다. 체크리스트대로라면 어떻게 하나?',
      o: ['Network로 바꿔 자유 hand-off를 준다', 'Single Agent로 되돌린다', 'Lead를 하나 더 둔다'], a: 1,
      why: '도구 5개 이내, 단일 도메인이면 Multi가 필요 없다. 층이 늘면 호출과 비용만 곱해진다.' },
    { q: '사고가 난 뒤 어느 agent가 누구에게 일을 넘겼는지 재구성할 수 없었다. 무엇이 빠졌나?',
      o: ['max_iterations 상한', 'session_token_cap', 'trace_id를 붙인 hand-off 로그'], a: 2,
      why: 'from, to, iter를 trace_id와 함께 남겨야 흐름을 되짚을 수 있다. 상한 가드는 멈추게 할 뿐 기록은 남기지 않는다.' },
  ];

  R.page({ title: 'Multi-Agent 그래프와 운영 가드', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
