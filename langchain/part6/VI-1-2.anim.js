/* VI-1-2 코드 리뷰 Agent — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 확인한 값: diff 를 재현해 git diff(+11/−0, @@ -10,2 +10,13 @@), ruff(E722), bandit(B105 Low · B307 Medium),
 * pytest(없는 파일 → collected 0 items), langgraph 1.2 create_react_agent(노드 agent·tools, 도구 3번 = 7단계)를 실행했다.
 * Thought 문장·코멘트 문장·9.2s 는 LLM 실행 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, check, cross } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 14, fill: MUT, opacity: op ?? 1 }, a || {}));

  const DIFF = [[10, ' ', 'router = APIRouter(prefix="/auth")'], [11, ' ', ''], [12, '+', 'SECRET_KEY = "supersecret123"'], [13, '+', ''],
    [14, '+', '@router.post("/login")'], [15, '+', 'def login(payload: dict):'], [16, '+', '    user_expr = payload.get("filter")'], [17, '+', '    user = eval(user_expr)'],
    [18, '+', '    try:'], [19, '+', '        token = jwt.encode(user, SECRET_KEY)'], [20, '+', '    except:'], [21, '+', '        return {"error": "fail"}'], [22, '+', '    return {"token": token}']];
  const LH = 24;
  function diffView(x, y, w, n, o) { o = o || {};
    el('rect', { x, y, width: w, height: 34 + DIFF.length * LH, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(x + 12, y + 22, 'app/auth.py  @@ -10,2 +10,13 @@', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    DIFF.slice(0, n).forEach(([ln, t, s], i) => { const yy = y + 34 + i * LH, hot = o.hot && o.hot[ln];
      if (t === '+') el('rect', { x: x + 2, y: yy, width: w - 4, height: LH, fill: hot ? BADBG : GOODBG, opacity: hot ? 1 : 0.7 });
      mono(x + 30, yy + 17, String(ln), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      mono(x + 40, yy + 17, t, { 'font-size': 14, fill: t === '+' ? GOOD : MUT, 'font-weight': 800 });
      mono(x + 56, yy + 17, s, { 'font-size': 14, fill: hot ? BAD : INK, 'font-weight': hot ? 700 : 400 }); }); }
  const rowY = (ln) => 34 + (ln - 10) * LH;
  const TOOLS = [['read_file', 'path'], ['run_tests', 'target'], ['lint', 'spec']];
  function toolChip(cx, cy, name, on, s) { card(cx, cy, 150, 40, { rx: 20, text: name, fs: 15, mono: true, stroke: on ? ACC : GRID, fill: on ? ACCBG : SOFT, color: on ? ACC : OFF, sw: on ? 2.4 : 1.6, s }); }

  // ---------- 1. PR diff 입력 ----------
  const FIELDS = [['number', 'int', '142'], ['title', 'str', '"feat: add user auth endpoint"'], ['author', 'str', '"@junior-dev"'], ['base', 'str', '"main"'], ['head', 'str', '"feat/auth"'], ['diff', 'str', 'open("pr-142.diff")'], ['changed_files', 'list[str]', '["app/auth.py"]']];
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { // 왼쪽: PullRequest 칸
      const x = 30, y = 46, w = k === 0 ? 560 : 370;
      mono(x, y - 12, k === 0 ? '@dataclass  class PullRequest' : 'pr = PullRequest(...)', { 'font-size': 15, 'font-weight': 800 });
      FIELDS.forEach(([f, ty, v], i) => { const yy = y + i * 46, s = k === 0 ? fade(u, 0.2 + i * 0.25, 0.3) : 1;
        el('rect', { x, y: yy, width: w, height: 38, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: s });
        mono(x + 12, yy + 25, f, { 'font-size': 14.5, 'font-weight': 700, opacity: s });
        if (k === 0) mono(x + w - 12, yy + 25, ty, { 'font-size': 14, fill: INFO, 'text-anchor': 'end', opacity: s });
        else { const vs = k === 1 ? fade(u, 0.2 + i * 0.2) : 1, vv = f === 'title' ? '"feat: add user auth…"' : v;
          mono(x + 130, yy + 25, vv, { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: vs }); } });
      if (k === 0) { note(x, 390, '입력은 PR 하나. diff 본문과 바뀐 파일 목록까지 담는다', fade(u, 2.0), { 'font-size': 15 }); return; } }
    const dx = k === 3 ? 30 : 420, n = k === 1 ? Math.round(lerp(0, DIFF.length, E(u, 0.6, 2.2))) : DIFF.length;
    const hot = k === 2 ? Object.fromEntries([12, 17, 20].filter((l, i) => u > 0.3 + i * 0.5).map((l) => [l, 1])) : k === 3 ? { 12: 1, 17: 1, 20: 1 } : null;
    diffView(dx, 46, 510, n, { hot });
    if (k === 1) { mono(dx + 510, 30, '+11  −0', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 2.2) }); return; }
    if (k === 2) { [[12, '하드코딩 비밀', 0.3], [17, 'eval(사용자 입력)', 0.8], [20, 'bare except', 1.3]].forEach(([ln, s, a]) => {
        const y = 46 + rowY(ln) + 12; pill(dx + 440, y, s, BAD, pop(u, a), { fs: 13.5, fill: PANEL }); });
      card(dx + 255, 406, 300, 26, { rx: 8, text: 'tests/test_auth.py  없음', fs: 14, mono: true, stroke: BAD, color: BAD, dash: '5 4', s: pop(u, 1.9) }); return; }
    // k === 3: Agent 의 출발점
    grow(548, 200, 680, 200, E(u, 0.2, 1.0), ACC);
    const as = pop(u, 0.8);
    el('circle', { cx: 760, cy: 200, r: 62 * as, fill: SOFT, stroke: INK, 'stroke-width': 2.5 });
    lbl(760, 196, 'Agent', as, { 'font-size': 17 }); mono(760, 220, 'idle', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: as });
    TOOLS.forEach(([n], i) => card(660 + i * 100, 320, 92, 34, { rx: 17, text: n, fs: 13.5, mono: true, stroke: GRID, fill: SOFT, color: OFF, s: pop(u, 1.3 + i * 0.2) }));
    note(760, 380, '도구도 이슈도 아직 없다', fade(u, 2.0), { 'text-anchor': 'middle', 'font-size': 15 }); }

  // ---------- 2. Tool 정의 ----------
  function s2(t, c) { const { k, u } = c, on = (c.beat.toolsActive || []);
    if (k !== 4) TOOLS.forEach(([n], i) => toolChip(190 + i * 290, 70, n, on.includes(n), 1));
    if (k === 0) { ['import subprocess', 'from pathlib import Path', 'from langchain_core.tools import tool'].forEach((s, i) => mono(190, 170 + i * 36, s, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.4) }));
      card(700, 230, 200, 80, { rx: 12, text: '@tool\n함수 → Tool', fs: 16, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.6) });
      note(190, 360, '셋 다 아직 회색. 데코레이터를 붙여야 Agent가 볼 수 있다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // 고른 도구의 "LLM 이 보는 모습"
    const box = (x, y, w, h, title) => { el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); note(x + 14, y + 24, title, 1, { 'font-weight': 700 }); };
    if (k === 1) { grow(190, 92, 190, 128, E(u, 0.1, 0.5), ACC);
      box(40, 134, 420, 150, 'LLM이 보는 도구 설명');
      mono(56, 186, 'name: read_file', { 'font-size': 15, opacity: fade(u, 0.4) });
      mono(56, 214, 'args: { path: str }', { 'font-size': 15, opacity: fade(u, 0.7) });
      tx(56, 244, 'docstring: 저장소의 파일 전체를 읽어', { 'font-size': 14.5, opacity: fade(u, 1.0) });
      tx(56, 266, '줄 번호와 함께 돌려준다.', { 'font-size': 14.5, opacity: fade(u, 1.0) });
      R.terminal(500, 134, 430, 150, ['  10: router = APIRouter(prefix="/auth")', '  11: ', '  12: SECRET_KEY = "supersecret123"'], lerp(0, 3, E(u, 1.3, 2.4)), { title: 'read_file 결과' });
      note(40, 340, 'f"{i+1:>4}: {line}" 형식으로 줄마다 번호를 붙인다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2) { grow(480, 92, 480, 128, E(u, 0.1, 0.5), ACC);
      R.terminal(150, 134, 660, 120, ['$ pytest tests/test_auth.py -k login --tb=short'], lerp(0, 1, E(u, 0.5, 1.6)), { title: 'run_tests가 실행하는 명령' });
      note(150, 300, 'stdout의 마지막 2000자만 돌려준다. 긴 로그가 문맥을 다 먹지 않게', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 3) { grow(770, 92, 770, 128, E(u, 0.1, 0.5), ACC);
      mono(60, 170, 'ruff check app/auth.py', { 'font-size': 15, opacity: fade(u, 0.3) }); pill(400, 165, '스타일', INFO, pop(u, 0.4), { fs: 13.5 });
      mono(60, 204, 'bandit -q app/auth.py', { 'font-size': 15, opacity: fade(u, 0.6) }); pill(400, 199, '보안', BAD, pop(u, 0.7), { fs: 13.5 });
      // 인자 이름 함정
      box(500, 140, 430, 230, '인자 이름에 따라 바뀌는 스키마');
      mono(520, 200, 'def lint(args: str)', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.0) });
      mono(540, 228, '→ { v__args: array }', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.3) }); cross(900, 206, 9, pop(u, 1.4));
      mono(520, 286, 'def lint(spec: str)', { 'font-size': 15, fill: GOOD, opacity: fade(u, 1.8) });
      mono(540, 314, '→ { spec: str }', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 2.0) }); check(900, 292, 10, pop(u, 2.1));
      note(60, 260, 'rule_id와 줄 번호를 돌려준다', fade(u, 1.0), { 'font-size': 15 });
      note(500, 396, 'langchain-core 1.8.4에서 직접 호출해 확인', fade(u, 2.2)); return; }
    // k === 4: TOOLS 리스트로 묶기
    const g = E(u, 0.3, 1.4);
    TOOLS.forEach(([n], i) => card(lerp(190 + i * 290, 330 + i * 160, g), lerp(70, 230, g), 150, 40, { rx: 20, text: n, fs: 15, mono: true, stroke: ACC, fill: ACCBG, color: ACC, sw: 2.4 }));
    const bo = fade(u, 1.4);
    mono(110, 238, 'TOOLS = [', { 'font-size': 20, 'font-weight': 800, opacity: bo });
    mono(730, 238, ']', { 'font-size': 20, 'font-weight': 800, opacity: bo });
    mono(400, 238, ',', { 'font-size': 20, opacity: bo }); mono(560, 238, ',', { 'font-size': 20, opacity: bo });
    note(480, 330, '이 리스트가 통째로 Agent에 들어간다', fade(u, 2.0), { 'text-anchor': 'middle', 'font-size': 15 }); }

  // ---------- 3. ReAct 그래프 ----------
  const N = { start: [110, 210], agent: [380, 210], tools: [680, 210], end: [380, 360] };
  function node(p, name, o) { o = o || {}; const s = o.s ?? 1;
    if (o.term) { el('ellipse', { cx: p[0], cy: p[1], rx: 66 * s, ry: 24 * s, fill: SOFT, stroke: MUT, 'stroke-width': 2 }); mono(p[0], p[1] + 5, name, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); return; }
    card(p[0], p[1], 150, 60, { rx: 14, text: name, fs: 17, mono: true, stroke: o.col || ACC, fill: o.fill || ACCBG, color: o.col || ACC, sw: 2.6, s }); }
  function graph(k, u, build) {
    const gs = (a) => (build ? pop(u, a) : 1), ge = (a, b) => (build ? E(u, a, b) : 1);
    node(N.start, '__start__', { term: true, s: gs(0.2) }); node(N.agent, 'agent', { s: gs(0.5) }); node(N.tools, 'tools', { col: INFO, fill: INFOBG, s: gs(0.8) }); node(N.end, '__end__', { term: true, s: gs(1.1) });
    grow(176, 210, 300, 210, ge(1.2, 1.6), MUT);
    grow(458, 196, 602, 196, ge(1.5, 1.9), ACC); grow(602, 226, 458, 226, ge(1.8, 2.2), INFO);
    grow(380, 242, 380, 332, ge(2.0, 2.4), MUT, { dash: '5 4' });
    const lo = build ? fade(u, 1.9) : 1;
    mono(530, 184, 'tool_calls 있음', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: lo });
    mono(530, 252, 'ToolMessage', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: lo });
    mono(392, 292, 'tool_calls 없음', { 'font-size': 13.5, fill: MUT, opacity: build ? fade(u, 2.3) : 1 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [['ChatOpenAI', 'gpt-4o-mini · temperature=0', 180, 0.2], ['create_react_agent', 'langgraph.prebuilt', 480, 0.6], ['TOOLS', 'read_file · run_tests · lint', 780, 1.0]].forEach(([a, b, x, d]) => {
        card(x, 150, 250, 76, { rx: 12, stroke: x === 480 ? ACC : INK, fill: x === 480 ? ACCBG : PANEL, s: pop(u, d) });
        mono(x, 144, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, d) });
        tx(x, 168, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, d) });
        grow(x, 192, lerp(x, 480, 0.6), 282, E(u, 1.5, 2.0), ACC); });
      card(480, 310, 220, 46, { rx: 23, text: 'review_agent', fs: 16, mono: true, stroke: ACC, fill: ACC, color: PANEL, s: pop(u, 2.0) });
      note(480, 376, '세 재료가 한 줄 호출에 모인다', fade(u, 2.2), { 'text-anchor': 'middle', 'font-size': 15 }); return; }
    if (k === 1) { el('rect', { x: 200, y: 50, width: 560, height: 300, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      mono(220, 80, 'SYSTEM_PROMPT', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      tx(220, 116, '너는 시니어 리뷰어다. 주어진 PR diff를 검토하라.', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['read_file', '변경된 파일 문맥 확보'], ['lint', '보안·스타일 정적 분석'], ['run_tests', '회귀·테스트 확인'], ['정리', '분류 + severity']].forEach(([a, b], i) => {
        const y = 160 + i * 46, s = pop(u, 0.6 + i * 0.35);
        el('circle', { cx: 240, cy: y - 5, r: 14 * s, fill: ACC }); mono(240, y, String(i + 1), { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: s });
        mono(268, y, a, { 'font-size': 15, 'font-weight': 700, fill: i < 3 ? ACC : INK, opacity: s }); tx(400, y, b, { 'font-size': 15, opacity: s }); });
      note(480, 390, '시니어의 작업 순서를 프롬프트에 박아 둔다', fade(u, 2.2), { 'text-anchor': 'middle', 'font-size': 15 }); return; }
    graph(k, u, k === 2);
    if (k === 2) { pill(840, 360, 'ready', GOOD, pop(u, 2.3), { fs: 14, mono: true });
      mono(560, 60, 'prompt=SYSTEM_PROMPT', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) });
      mono(560, 88, 'state_modifier=… → TypeError', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.6) }); return; }
    // k === 3: invoke → 루프
    fly(110, 90, N.start[0], N.start[1], seg(u, 0.1, 0.6), '{"messages": [...]}', { mono: true });
    if (u > 0.6) { const ph = seg(u, 0.6, 2.4), loop = [[176, 210], [300, 210], [458, 196], [602, 196], [602, 226], [458, 226], [458, 196], [602, 196], [602, 226], [458, 226], [380, 242], [380, 332]]; dot(loop, ph, BAD, 8); }
    note(560, 300, 'Thought → Action → Observation을 tool_calls가 없을 때까지', fade(u, 1.0), { 'font-size': 15 });
    note(560, 326, '밖에서는 invoke 한 번', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700, fill: INK }); }

  // ---------- 4. 자동 리뷰 실행 ----------
  const MSG = [['Human', 'PR #142를 리뷰해줘 … diff:\\n…', INK], ['AI', 'tool_calls: read_file("app/auth.py")', ACC], ['Tool', '22줄 · 12·17·20행 결함 위치', INFO],
    ['AI', 'tool_calls: lint("app/auth.py --rules …")', ACC], ['Tool', 'B307 · B105 · E722', INFO], ['AI', 'tool_calls: run_tests("tests/test_auth.py -k login")', ACC],
    ['Tool', 'collected 0 items', INFO], ['AI', '이슈 4건 보고 · tool_calls 없음', GOOD]];
  const NMSG = [1, 1, 3, 5, 8], NSTEP = [0, 0, 2, 4, 7];
  const ISS = [['I-1', 'Critical', BAD], ['I-2', 'High', WARN], ['I-3', 'Medium', INFO], ['I-4', 'Low', MUT]];
  function s4(t, c) { const { k, u } = c;
    // 왼쪽: 작은 그래프
    const A = [120, 150], T = [120, 290];
    card(A[0], A[1], 130, 50, { rx: 12, text: 'agent', fs: 16, mono: true, stroke: ACC, fill: ACCBG, color: ACC });
    card(T[0], T[1], 130, 50, { rx: 12, text: 'tools', fs: 16, mono: true, stroke: INFO, fill: INFOBG, color: INFO });
    el('line', { x1: 100, y1: 176, x2: 100, y2: 264, stroke: ACC, 'stroke-width': 2, 'marker-end': 'url(#ra-ahb)' }); el('line', { x1: 140, y1: 264, x2: 140, y2: 176, stroke: INFO, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)' });
    if (k >= 2) { const cyc = [[100, 176], [100, 264], [140, 264], [140, 176]]; dot(cyc, seg(u, 0.2, 1.6), BAD, 7); }
    // 위: 단계 칸 12개
    const ns = Math.round(tween(NSTEP[k - 1] ?? 0, NSTEP[k], u, 1.4));
    mono(40, 44, 'recursion_limit', { 'font-size': 14, fill: MUT, opacity: k >= 1 ? 1 : 0.3 });
    for (let i = 0; i < 12; i++) el('rect', { x: 40 + i * 20, y: 54, width: 16, height: 16, rx: 3, fill: i < ns ? BAD : PANEL, stroke: i < ns ? BAD : GRID, 'stroke-width': 1.5, opacity: k >= 1 ? 1 : 0.3 });
    mono(40, 96, `${ns} / 12 단계`, { 'font-size': 15, 'font-weight': 800, fill: ns ? BAD : MUT, opacity: k >= 1 ? 1 : 0.3 });
    // 오른쪽: state["messages"]
    const X = 330, W = 600; note(X, 44, 'state["messages"]', 1, { 'font-weight': 700, class: 'mono' });
    const nm = NMSG[k], prev = k ? NMSG[k - 1] : 0;
    MSG.slice(0, nm).forEach(([role, s, col], i) => { const y = 58 + i * 38, fresh = i >= prev, op = fresh ? fade(u, 0.4 + (i - prev) * 0.45) : 1;
      if (op <= 0) return;
      el('rect', { x: X, y, width: W, height: 32, rx: 6, fill: PANEL, stroke: fresh ? col : GRID, 'stroke-width': fresh ? 2 : 1.2, opacity: op });
      mono(X + 12, y + 21, role, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: op });
      mono(X + 76, y + 21, s, { 'font-size': 14, opacity: op }); });
    if (k === 0) { note(X, 120, 'f-string으로 제목·변경 파일·diff 본문을 합친 HumanMessage 하나', fade(u, 0.8), { 'font-size': 15 }); return; }
    if (k === 1) { pill(120, 370, 'thinking', WARN, pop(u, 0.5), { mono: true }); note(X, 120, '노드가 한 번 돌 때마다 칸이 하나 찬다', fade(u, 1.0), { 'font-size': 15 }); return; }
    // 이슈 카드
    const ni = k === 3 ? 3 : k === 4 ? 4 : 0, pi = k === 4 ? 3 : 0;
    ISS.slice(0, ni).forEach(([id, sv, col], i) => { const s = i >= pi ? pop(u, 1.4 + (i - pi) * 0.25) : 1;
      card(X + 70 + i * 152, 388, 140, 36, { rx: 8, text: id + ' ' + sv, fs: 14, stroke: col, color: col, fill: PANEL, sw: 2.2, s }); });
    if (k === 4) pill(120, 370, 'END', GOOD, pop(u, 2.2), { mono: true }); }

  // ---------- 5. severity 별 코멘트 ----------
  const CM = [['Critical · 보안', 'eval() on user input — RCE 가능', 'app/auth.py:17', 'eval(user_expr)  →  LoginPayload(**body)', BAD],
    ['High · 보안', 'SECRET_KEY 하드코딩', 'app/auth.py:12', 'SECRET_KEY = os.getenv("SECRET_KEY")', WARN],
    ['Medium · 스타일', 'bare except — 모든 예외를 삼킴', 'app/auth.py:20', 'except:  →  except jwt.PyJWTError as e:', INFO],
    ['Low · 테스트', 'login 엔드포인트 테스트 부재', 'tests/test_auth.py', 'TestClient로 정상·실패 2건 추가', MUT]];
  function s5(t, c) { const { k, u } = c, shown = (c.beat.shownComments || []).length, before = ((c.prev && c.prev.shownComments) || []).length;
    // 머리
    el('rect', { x: 40, y: 20, width: 880, height: 56, rx: 10, fill: INK });
    tx(60, 46, 'Code Review Bot — PR #142 자동 리뷰 결과', { 'font-size': 15.5, 'font-weight': 800, fill: PANEL });
    mono(60, 66, '총 4건', { 'font-size': 14, fill: OFF, opacity: k === 0 ? fade(u, 0.5) : 1 });
    ISS.forEach(([id, sv, col], i) => { const s = k === 0 ? pop(u, 0.8 + i * 0.25) : 1; card(540 + i * 96, 48, 88, 30, { rx: 15, text: sv + ' 1', fs: 13.5, stroke: col, color: col === MUT ? PANEL : col, fill: col === MUT ? MUT : PANEL, s }); });
    if (k === 0) { pill(840, 110, 'Agent: done', GOOD, pop(u, 1.8), { mono: true }); note(60, 120, '이슈 4건을 넣어 LLM을 한 번 더 부르면 코멘트 마크다운이 나온다', fade(u, 2.0), { 'font-size': 15 }); return; }
    CM.slice(0, shown).forEach(([tag, title, loc, fix, col], i) => { const y = 88 + i * 78, fresh = i >= before, s = fresh ? E(u, 0.2, 0.9) : 1;
      el('rect', { x: 40, y, width: 880 * Math.max(0.05, s), height: 70, rx: 8, fill: PANEL, stroke: fresh ? col : GRID, 'stroke-width': fresh ? 2.2 : 1.5 });
      el('rect', { x: 40, y, width: 8, height: 70, rx: 4, fill: col });
      if (s < 0.95) return;
      tx(62, y + 26, tag, { 'font-size': 14, 'font-weight': 800, fill: col === MUT ? INK : col });
      tx(210, y + 26, title, { 'font-size': 15, 'font-weight': 700 });
      mono(900, y + 26, loc, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const fo = fresh ? fade(u, 1.2) : 1;
      el('rect', { x: 62, y: y + 38, width: 560, height: 24, rx: 4, fill: SOFT, opacity: fo });
      mono(72, y + 55, fix, { 'font-size': 14, fill: col === MUT ? INK : GOOD, 'font-weight': 700, opacity: fo }); });
    if (k === 4) { mono(900, 410, '3 tool calls · 9.2s (예시)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) });
      note(40, 410, 'PyGithub로 PR에 그대로 게시할 수 있다', fade(u, 2.1), { 'font-size': 14.5 }); } }

  const quiz = [
    { q: 'PR #142의 diff에서 Agent가 짚어야 할 결함이 아닌 것은?',
      o: ['12행의 하드코딩된 SECRET_KEY', '17행의 eval(user_expr)', '10행의 APIRouter(prefix="/auth")'], a: 2,
      why: '10행은 diff 밖의 기존 문맥 줄이다. 결함은 추가된 11줄 안의 12·17·20행과 없는 테스트 파일이다.' },
    { q: '@tool 함수의 인자 이름을 args로 지으면 어떤 일이 생기나?',
      o: ['스키마가 v__args로 바뀌어 Agent의 호출이 깨진다', '아무 문제 없이 동작한다', '도구 이름이 args로 바뀐다'], a: 0,
      why: 'langchain-core 1.8.4에서 args라는 인자는 스키마에서 v__args가 되어 {"args": …}로 부르면 TypeError가 난다. 그래서 spec으로 바꿨다.' },
    { q: 'create_react_agent로 만든 그래프에서 agent 노드 다음에 __end__로 가는 조건은 무엇인가?',
      o: ['tools 노드가 오류를 냈을 때', 'LLM 응답에 tool_calls가 없을 때', 'messages가 3개를 넘었을 때'], a: 1,
      why: 'agent가 도구를 부르면 tools로 가고, 더 부를 도구가 없으면 끝난다. 이 판단이 ReAct 루프의 종료 조건이다.' },
    { q: '도구를 3번 쓰고 끝난 이번 리뷰는 recursion_limit 12 가운데 몇 단계를 썼나?',
      o: ['3단계', '6단계', '7단계'], a: 2,
      why: 'agent와 tools를 세 번 오가면 6단계, 마지막으로 결론을 내는 agent가 1단계 더해 7단계다. 가짜 모델로 돌려 센 값이다.' },
    { q: '코멘트마다 꼭 들어가는 요소가 아닌 것은?',
      o: ['severity와 분류 라벨', '위치(파일:줄)와 수정 제안 코드', '작성자의 다른 PR 목록'], a: 2,
      why: '코멘트는 [severity · 분류] 라벨, 파일:줄 위치, 문제 설명, Before/After 제안으로 이루어진다. 다른 PR 목록은 쓰지 않는다.' },
  ];

  const summary = [
    'LLM에게 리뷰해 달라고만 하면 근거 없는 말이 섞이기 쉬워서, 사실을 확인할 도구를 따로 쥐여 준다.',
    'read_file, lint, run_tests 세 도구는 @tool로 등록하고, docstring과 인자 이름이 그대로 사용 설명서가 된다.',
    'create_react_agent는 agent와 tools 두 노드를 잇고, tool_calls가 없어질 때까지 둘 사이를 오간다.',
    '이번 리뷰는 도구 3번, 7단계로 끝났고 이슈 4건이 severity별 코멘트로 정리됐다.',
  ];
  const review = [
    { q: 'Agent가 lint 도구를 부를 때마다 TypeError가 난다. 먼저 볼 곳은?',
      o: ['SYSTEM_PROMPT의 작업 순서', '@tool 함수의 인자 이름과 생성된 스키마', 'recursion_limit 값'], a: 1,
      why: '인자 이름이 args면 스키마가 v__args로 바뀌어 모델이 보낸 {"args": …}가 함수에 맞지 않는다. lint.args를 찍어 보면 바로 보인다.' },
    { q: '도구를 쓸 일이 많은 큰 PR에서 리뷰가 "need more steps"로 끝났다. 가장 직접적인 조치는?',
      o: ['recursion_limit를 늘리거나 리뷰할 파일을 나눈다', 'temperature를 올린다', 'TOOLS에서 read_file을 뺀다'], a: 0,
      why: '노드가 한 번 돌 때마다 한 단계를 쓰므로 도구 호출이 많으면 12단계를 넘긴다. 한도를 늘리거나 일을 나누면 된다.' },
    { q: 'bandit은 B307을 Medium으로 냈는데 Agent는 Critical로 매겼다. 그 까닭으로 가장 알맞은 것은?',
      o: ['bandit 결과를 잘못 읽었다', 'Critical이 기본값이다', '파일을 읽어 사용자 입력이 eval로 바로 가는 것을 봤다'], a: 2,
      why: '정적 분석은 패턴만 보고 등급을 매긴다. Agent는 파일을 읽어 payload 값이 그대로 eval로 간다는 문맥까지 보고 등급을 올렸다.' },
  ];

  R.page({ title: 'PR 코드 리뷰 Agent', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
