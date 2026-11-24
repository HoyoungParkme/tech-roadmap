/* IV-2-1 Resources, Tools, Prompts — 장면 4개 (../../anim/engine.js 규칙을 따른다)
 * resources/read · prompts/get 응답 본문은 이 페이지 코드를 Python SDK(mcp 1.30)로 띄워 받은 값이다. LLM 리뷰 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, tokens, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const JRE = /("(?:[^"\\]|\\.)*")(\s*:)?|(\/\/.*$)|(-?\b\d+(?:\.\d+)?\b|\btrue\b|\bfalse\b|\bnull\b)/g;
  function jtok(line) { const out = []; let i = 0, m; JRE.lastIndex = 0;
    while ((m = JRE.exec(line))) { if (m.index > i) out.push([line.slice(i, m.index), {}]);
      if (m[1]) { out.push([m[1], m[2] ? { fill: INFO, 'font-weight': 700 } : { fill: ACC }]); if (m[2]) out.push([m[2], {}]); }
      else if (m[3]) out.push([m[3], { fill: MUT }]); else out.push([m[4], { fill: WARN, 'font-weight': 700 }]);
      i = JRE.lastIndex; }
    if (i < line.length) out.push([line.slice(i), {}]); return out; }
  function codePanel(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 7, shown = o.shown ?? lines.length, op = o.op ?? 1;
    const top = o.title ? 34 : 12, h = o.h || lines.length * lh + top + 10;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: op });
    if (o.title) mono(x + 14, y + 22, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op });
    const n = Math.ceil(shown);
    lines.slice(0, n).forEach((s, i) => { const part = i === n - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s, yy = y + top + i * lh;
      if (o.hi && o.hi.includes(i)) el('rect', { x: x + 5, y: yy, width: w - 10, height: lh, rx: 4, fill: 'var(--hl)', opacity: 0.55 * op });
      spans(x + 14, yy + fs * 0.95, (o.py ? tokens : jtok)(part), { 'font-size': fs, opacity: op }); });
    return h; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op ?? 1 }, a || {}));
  // 코드가 자라는 왼쪽 판: rows [[줄, 등장 beat]]
  function growCode(rows, k, u, title, o) { o = o || {}; const vis = rows.filter(([, q]) => q <= k), lines = vis.map(([s]) => s);
    const hi = vis.map(([, q], i) => (q === k ? i : -1)).filter((i) => i >= 0), shown = lines.length - hi.length + hi.length * E(u, 0.2, 1.1);
    codePanel(20, 20, o.w || 440, lines, { py: true, fs: 13.5, lh: 21, title, fill: PANEL, shown: o.full ? lines.length : shown, hi: o.full ? null : hi }); }
  // capability 선반: 서버 하나에 칸 세 개
  const CAPC = { resources: GOOD, tools: WARN, prompts: INFO };
  function shelf(x, y, name, on, s) { const g = R.G(x, y, s ?? 1);
    el('rect', { x: -230, y: -40, width: 460, height: 80, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
    mono(-216, -20, 'Server("' + name + '")', { 'font-size': 14, 'font-weight': 800 }, g);
    ['resources', 'tools', 'prompts'].forEach((c, i) => { const hot = on === c, cx = -150 + i * 150;
      el('rect', { x: cx - 66, y: -6, width: 132, height: 34, rx: 8, fill: hot ? CAPC[c] : SOFT, stroke: hot ? CAPC[c] : GRID, 'stroke-width': 2 }, g);
      mono(cx, 16, c, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: hot ? PANEL : MUT }, g); }); return g; }

  // ---------- 1. Resources: URI 로 찾는 읽기 전용 데이터 ----------
  const RPY = [['server = Server("docs-server")', 0], ['@server.list_resources()', 1], ['async def list_resources():', 1],
    ['    Resource(uri="file:///project/README.md",', 2], ['             mimeType="text/markdown")', 2], ['    Resource(uri="db://users/42",', 3], ['             mimeType="application/json")', 3],
    ['@server.read_resource()', 4], ['async def read_resource(uri) -> str:', 4], ['    uri = str(uri)', 4], ['    if uri.startswith("file://"): … read()', 4],
    ['    if uri.startswith("db://users/"): … SELECT', 5], ['    raise ValueError(f"unknown uri: {uri}")', 5]];
  function uriCard(x, y, uri, mime, kind, s, col) { card(x, y, 400, 54, { rx: 10, stroke: col || GOOD, sw: 2, s });
    mono(x - 186, y - 4, uri, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); mono(x - 186, y + 17, mime, { 'font-size': 13.5, fill: MUT, opacity: s });
    tx(x + 186, y - 4, kind, { 'font-size': 13.5, fill: col || GOOD, 'text-anchor': 'end', 'font-weight': 700, opacity: s }); }
  function s1(t, c) { const { k, u } = c;
    growCode(RPY, Math.min(k, 5), u, 'resources.py', { full: k === 6 });
    if (k <= 1) { shelf(710, 110, 'docs-server', k === 1 ? 'resources' : null, k === 0 ? pop(u, 0.3) : 1);
      if (k === 0) note(710, 210, '한 Server에 세 가지를 모두 올릴 수 있다', fade(u, 1.0), { 'text-anchor': 'middle' });
      else { fly(560, 320, 560, 178, seg(u, 0.6, 1.6), 'resources/list', { mono: true }); note(710, 250, '"무엇을 읽을 수 있나?"에 답하는 핸들러', fade(u, 1.2), { 'text-anchor': 'middle' }); }
      return; }
    if (k <= 3) { tx(500, 46, 'resources/list 결과', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      uriCard(710, 100, 'file:///project/README.md', 'text/markdown', '파일', k === 2 ? pop(u, 0.4) : 1);
      if (k === 3) { uriCard(710, 170, 'db://users/42', 'application/json', 'DB 행', pop(u, 0.4)); dbIcon(880, 290, null, { s: pop(u, 1.0) * 0.8 });
        note(700, 300, '파일이 아니어도 URI만 붙이면 리소스', fade(u, 1.4), { 'text-anchor': 'middle' }); }
      else note(710, 200, 'URI가 곧 리소스의 주소다', fade(u, 1.2), { 'text-anchor': 'middle' });
      return; }
    if (k === 4) { // 실제로 주고받은 resources/read
      codePanel(480, 30, 460, ['{"method":"resources/read",', ' "params":{"uri":"file:///project/README.md"}}'], { fs: 13.5, lh: 20, fill: PANEL, stroke: ACC, title: '요청', shown: E(u, 0.1, 0.8) * 2 });
      codePanel(480, 150, 460, ['{"result":{"contents":[{', '  "uri":"file:///project/README.md",', '  "text":"…README 본문…"}]}}'], { fs: 13.5, lh: 20, fill: PANEL, stroke: GOOD, title: '응답', op: fade(u, 1.0) });
      card(710, 345, 440, 60, { rx: 10, stroke: WARN, fill: WARNBG, s: pop(u, 1.8) });
      mono(710, 340, 'uri 는 AnyUrl 객체로 온다', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(710, 362, 'str(uri) 없이 .startswith → 오류 (직접 실행)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { // db 분기 + 모르는 URI 는 거절
      dbIcon(600, 120, 'users', {}); fly(660, 80, 800, 80, seg(u, 0.3, 1.2), 'SELECT … id=42', { mono: true, fill: INFO });
      card(810, 120, 180, 44, { rx: 8, text: 'json.dumps(row)', fs: 14, mono: true, stroke: GOOD, s: pop(u, 1.2) });
      card(710, 300, 420, 50, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 1.6) });
      mono(710, 306, 'db://orders/7  → ValueError', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      tx(710, 360, '모르는 URI에 값을 지어내지 않는다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k6: 몇 번 읽어도 상태는 그대로
    tx(500, 60, '같은 URI를 세 번 읽는다', { 'font-size': 15, 'font-weight': 700 });
    for (let i = 0; i < 3; i++) { const y = 100 + i * 56, s = pop(u, 0.3 + i * 0.4);
      card(640, y, 260, 40, { rx: 8, text: 'resources/read  #' + (i + 1), fs: 14, mono: true, stroke: GOOD, s }); check(800, y, 10, s); }
    card(710, 330, 400, 56, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 1.6) });
    tx(710, 336, 'DB·파일 상태 변화 0', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.7) });
    tx(890, 100, 'INSERT', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0), 'text-decoration': 'line-through' });
    tx(890, 128, 'UPDATE', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.1), 'text-decoration': 'line-through' });
    tx(890, 156, 'DELETE', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2), 'text-decoration': 'line-through' }); }

  // ---------- 2. Tools: 실행하면 세상이 바뀐다 ----------
  const TPY = [['server = Server("file-server")', 0], ['@server.list_tools()', 1], ['async def list_tools():', 1],
    ['    Tool(name="create_file",', 2], ['         description="새 파일을 생성한다",', 2], ['         inputSchema={… "required": ["path", "content"]})', 3],
    ['    Tool(name="send_message", … ["channel", "text"])', 4],
    ['@server.call_tool()', 5], ['async def call_tool(name, args):', 5], ['    if name == "create_file": open(…, "w").write(…)', 5],
    ['    if name == "send_message": slack.post(…)', 6], ['    raise ValueError(f"unknown tool: {name}")', 6]];
  function tree(x, y, files, hot) { mono(x, y, '/project/', { 'font-size': 15, 'font-weight': 800 });
    files.forEach((f, i) => { const on = f === hot; mono(x + 22, y + 28 + i * 26, '├ ' + f, { 'font-size': 14.5, fill: on ? WARN : INK, 'font-weight': on ? 800 : 400 }); }); }
  function s2(t, c) { const { k, u } = c;
    growCode(TPY, Math.min(k, 6), u, 'tools.py', { full: k === 7, w: 470 });
    const X = 720;
    if (k <= 1) { shelf(X, 110, 'file-server', k === 1 ? 'tools' : null, k === 0 ? pop(u, 0.3) : 1);
      note(X, 220, k === 0 ? '틀은 Resources와 똑같다' : '"무엇을 실행할 수 있나?"를 광고', fade(u, 1.0), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { tx(510, 60, 'LLM이 도구를 고를 때 보는 것', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      card(X, 130, 400, 90, { rx: 12, stroke: WARN, sw: 2.2, s: pop(u, 0.3) });
      mono(X - 180, 118, 'create_file', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) });
      tx(X - 180, 150, '새 파일을 생성한다', { 'font-size': 15, opacity: fade(u, 0.8) });
      note(X, 240, '이름과 설명이 곧 인터페이스', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    if (k === 3) { // 스키마 → LLM 이 채운 인자
      codePanel(510, 40, 420, ['"inputSchema": {', '  "properties": { "path":    {"type":"string"},', '                  "content": {"type":"string"} },', '  "required": ["path", "content"] }'], { fs: 13.5, lh: 20, fill: PANEL, stroke: WARN, hi: [3] });
      grow(720, 160, 720, 210, seg(u, 0.8, 1.3), WARN);
      codePanel(510, 220, 420, ['"arguments": {', '  "path": "/project/notes.md",', '  "content": "…" }'], { fs: 13.5, lh: 20, fill: SOFT, stroke: ACC, title: 'LLM이 만든 인자 (예시)', op: fade(u, 1.3) }); return; }
    if (k === 4) { tx(510, 46, 'tools/list 결과', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['create_file', 'path, content'], ['send_message', 'channel, text']].forEach(([n, a], i) => { const y = 96 + i * 70, s = i ? pop(u, 0.4) : 1;
        card(X, y, 400, 54, { rx: 10, stroke: WARN, sw: 2, s }); mono(X - 186, y + 5, n, { 'font-size': 16, 'font-weight': 800, opacity: s }); mono(X + 186, y + 5, a, { 'font-size': 14, 'text-anchor': 'end', fill: MUT, opacity: s }); });
      note(X, 260, '이름·설명·스키마 세 칸이면 도구 하나', fade(u, 1.2), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { // 세 capability 를 나란히 + 파일이 생긴다
      [['resources', '읽기', '상태 그대로', GOOD], ['tools', '실행', '상태가 바뀐다', WARN], ['prompts', '템플릿', '메시지를 만든다', INFO]].forEach(([n, a, b, col], i) => { const x = 560 + i * 130, hot = n === 'tools';
        card(x, 80, 120, 80, { rx: 10, stroke: col, fill: hot ? WARNBG : PANEL, sw: hot ? 3 : 1.8 }); mono(x, 66, n, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col });
        tx(x, 90, a, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); tx(x, 110, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      const files = ['README.md'].concat(u > 1.4 ? ['notes.md'] : []);
      tree(560, 200, files, 'notes.md'); fly(700, 140, 640, 255, seg(u, 0.5, 1.4), 'tools/call create_file', { mono: true, fill: WARN });
      if (u > 1.4) note(780, 260, '디스크가 바뀌었다', fade(u, 1.5), { fill: WARN }); return; }
    if (k === 6) { card(X, 100, 400, 70, { rx: 12, stroke: GRID, fill: SOFT, s: pop(u, 0.3) });
      mono(X - 180, 88, '#dev', { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.4) }); tx(X - 180, 116, 'send_message가 올린 글', { 'font-size': 15, opacity: fade(u, 0.8) });
      card(X, 240, 400, 54, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 1.2) });
      mono(X, 246, 'tools/call "delete_all" → ValueError', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.3) });
      tx(X, 300, '등록 안 된 이름은 실행하지 않는다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); return; }
    // k7: 확인 창
    card(X, 170, 380, 200, { rx: 14, stroke: INK, sw: 2.5, s: pop(u, 0.3) });
    tx(X, 110, '이 도구를 실행할까요?', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
    mono(X, 146, 'create_file /project/notes.md', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.6) });
    card(X - 70, 222, 110, 40, { rx: 8, text: '거부', fs: 15, s: pop(u, 0.9) }); card(X + 70, 222, 110, 40, { rx: 8, text: '허용', fs: 15, stroke: 'none', fill: ACC, color: PANEL, s: pop(u, 1.0) });
    mono(X, 320, 'return [TextContent(type="text", …)]', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
    tx(X, 350, '결과는 늘 content 목록', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); }

  // ---------- 3. Prompts: 빈칸이 있는 템플릿 ----------
  const PPY = [['server = Server("prompt-server")', 0], ['@server.list_prompts()', 1], ['async def list_prompts():', 1],
    ['    Prompt(name="code-review", arguments=[', 2], ['        PromptArgument(name="file", required=True),', 2], ['        PromptArgument(name="lang", required=False)])', 2],
    ['    Prompt(name="translate", … text, target)', 3],
    ['@server.get_prompt()', 4], ['async def get_prompt(name, args) -> GetPromptResult:', 4], ['    file_uri = args["file"]', 4],
    ['    return GetPromptResult(messages=[PromptMessage(', 5], ['        role="user", content=TextContent(', 5],
    ['            text=f"… 파일: {file_uri}\\n"))])', 6]];
  const MSG = ['다음 코드를 리뷰해라.', '기준: 가독성, 버그, 성능.', '파일: file:///project/README.md'];
  function s3(t, c) { const { k, u } = c;
    growCode(PPY, Math.min(k, 6), u, 'prompts.py', { full: k === 7, w: 470 });
    const X = 720;
    if (k <= 1) { shelf(X, 110, 'prompt-server', k === 1 ? 'prompts' : null, k === 0 ? pop(u, 0.3) : 1);
      note(X, 220, k === 0 ? '세 번째도 같은 골격' : '쓸 수 있는 템플릿 목록을 알려준다', fade(u, 1.0), { 'text-anchor': 'middle' }); return; }
    if (k <= 3) { tx(510, 46, 'prompts/list 결과', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['/code-review', [['file', 1], ['lang', 0]]], ['/translate', [['text', 1], ['target', 1]]]].slice(0, k - 1).forEach(([n, args], i) => { const y = 100 + i * 80, s = i === k - 2 ? pop(u, 0.3) : 1;
        card(X, y, 400, 62, { rx: 10, stroke: INFO, sw: 2, s }); mono(X - 186, y + 5, n, { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: s });
        args.forEach(([a, req], j) => pill(X + 20 + j * 100, y + 1, a + (req ? ' *' : ' ?'), req ? INK : MUT, s * pop(u, 0.6 + j * 0.3), { mono: true, fs: 13.5 })); });
      note(X, 300, '* 필수   ? 선택', fade(u, 1.2), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 4) { // 사용자가 slash command 로 부른다
      el('rect', { x: 510, y: 300, width: 420, height: 44, rx: 22, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
      const cmd = '/code-review file=file:///project/README.md', n = Math.round(cmd.length * E(u, 0.2, 1.4));
      mono(530, 328, cmd.slice(0, n), { 'font-size': 13.5, fill: INK });
      fly(720, 300, 720, 120, seg(u, 1.5, 2.3), 'prompts/get', { mono: true, fill: INFO });
      codePanel(510, 60, 420, ['{"name": "code-review",', ' "arguments": {"file": "file:///project/README.md"}}'], { fs: 13.5, lh: 20, fill: PANEL, stroke: INFO, op: fade(u, 2.0) }); return; }
    // k5~7: 메시지가 완성된다 (실제 응답)
    const fill = k === 5 ? 0 : k === 6 ? E(u, 0.2, 1.4) : 1;
    tx(510, 46, 'prompts/get 응답 = messages', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    card(X, 150, 420, 160, { rx: 14, stroke: INFO, sw: 2.2, s: k === 5 ? pop(u, 0.3) : 1 });
    mono(530, 92, 'role: "user"', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: k === 5 ? fade(u, 0.6) : 1 });
    MSG.forEach((m, i) => { const y = 130 + i * 30;
      if (i < 2) tx(530, y, m, { 'font-size': 15, opacity: k === 5 ? fade(u, 0.9 + i * 0.2) : 1 });
      else { tx(530, y, '파일:', { 'font-size': 15, opacity: k === 5 ? fade(u, 1.3) : 1 });
        el('rect', { x: 572, y: y - 18, width: 340, height: 26, rx: 5, fill: fill > 0 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': fill > 0.99 ? null : '5 4' });
        const s = 'file:///project/README.md'; mono(580, y, fill > 0 ? s.slice(0, Math.round(s.length * fill)) : '{file_uri}', { 'font-size': 14, fill: fill > 0 ? ACC : MUT, 'font-weight': 700 }); } });
    if (k === 6) note(X, 270, '기준은 고정, 파일 경로만 갈아 끼운다', fade(u, 1.6), { 'text-anchor': 'middle' });
    if (k === 7) { const cmds = ['/code-review', '/translate'];
      el('rect', { x: 510, y: 250, width: 200, height: 90, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
      cmds.forEach((s, i) => mono(526, 280 + i * 30, s, { 'font-size': 15, 'font-weight': 700, fill: i ? INK : INFO, opacity: fade(u, 0.3 + i * 0.2) }));
      el('rect', { x: 510, y: 350, width: 420, height: 40, rx: 20, fill: SOFT, stroke: GRID, 'stroke-width': 2 }); mono(530, 376, '/', { 'font-size': 16, 'font-weight': 800 });
      note(820, 300, '외울 필요 없이 고른다', fade(u, 1.0), { 'text-anchor': 'middle' }); } }

  // ---------- 4. 종합: 읽고 → 가공 → (LLM) → 실행 ----------
  const STG = [['resources/read', 'README.md 읽기', GOOD], ['prompts/get', '/code-review', INFO], ['messages.create', 'LLM 리뷰', ACC], ['tools/call', 'review.md 저장', WARN]];
  function s4(t, c) { const { k, u } = c;
    const done = [0, 1, 2, 2, 3, 4, 4][k];   // 이 beat 까지 끝난 단계 수
    STG.forEach(([m, d, col], i) => { const x = 120 + i * 240, y = 70, on = i < done, cur = i === done - 1 && k > 0 && k < 6;
      const s = cur && (k === 1 || k === 2 || k === 4 || k === 5) ? pop(u, 0.3) : 1;
      card(x, y, 200, 70, { rx: 12, stroke: on ? col : GRID, fill: on ? PANEL : SOFT, sw: cur ? 3 : 2, dash: on ? null : '6 5', s });
      mono(x, y - 6, m, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? col : MUT });
      tx(x, y + 18, d, { 'font-size': 14, 'text-anchor': 'middle', fill: on ? INK : MUT });
      if (i < 3) grow(x + 102, y, x + 136, y, on ? 1 : 0, MUT); });
    // 디스크 상태 표시: tools/call 전까지 변화 없음
    const changed = k >= 5 || (k === 4 && u > 1.2);
    card(820, 370, 220, 44, { rx: 22, stroke: changed ? WARN : GOOD, fill: changed ? WARNBG : GOODBG, text: changed ? '디스크 변경 1건' : '디스크 변화 없음', fs: 15, color: changed ? WARN : GOOD });
    if (k === 0) { codePanel(60, 150, 520, ['async def code_review_bot(session: ClientSession):', '    llm = Anthropic()'], { py: true, fs: 14, fill: PANEL });
      note(320, 270, 'ClientSession 하나로 세 capability를 다 부른다', fade(u, 0.8), { 'text-anchor': 'middle' }); return; }
    // 메시지 상자: 단계마다 채워진다
    const box = { x: 40, y: 150, w: 600 };
    tx(box.x, box.y, 'messages[0]  (role: user)', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    el('rect', { x: box.x, y: box.y + 12, width: box.w, height: 180, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
    if (k === 1) { mono(box.x + 16, box.y + 44, 'source_text = readme.contents[0].text', { 'font-size': 14, opacity: fade(u, 0.6) });
      fly(120, 110, 300, box.y + 90, seg(u, 0.8, 1.8), 'README 본문', { fill: GOOD }); tx(box.x + 16, box.y + 150, '아직 메시지는 비어 있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k >= 2) { const lines = MSG.slice(0, 2).concat(['파일: file:///project/README.md']);
      lines.forEach((m, i) => tx(box.x + 16, box.y + 42 + i * 24, m, { 'font-size': 14.5, opacity: k === 2 ? fade(u, 0.6 + i * 0.2) : 1 })); }
    if (k >= 3) { const g = k === 3 ? E(u, 0.3, 1.4) : 1; mono(box.x + 16, box.y + 122, '---', { 'font-size': 14, fill: MUT, opacity: g });
      el('rect', { x: box.x + 16, y: box.y + 132, width: (box.w - 32) * g, height: 40, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5 });
      tx(box.x + 28, box.y + 158, '+ README 본문 (①에서 읽은 것)', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: g }); }
    if (k === 4) { fly(box.x + 300, box.y + 100, 600, 110, seg(u, 0.2, 1.0), 'messages', { mono: true });
      card(800, 230, 260, 90, { rx: 12, stroke: ACC, s: pop(u, 1.2) });
      mono(690, 216, 'review_text', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      tx(690, 244, '리뷰 문장 (예시 · 실제 호출 안 함)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 5) { card(800, 230, 260, 90, { rx: 12, stroke: WARN, sw: 2.5, s: pop(u, 0.4) });
      mono(690, 220, '/project/', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.5) });
      mono(706, 246, '├ README.md', { 'font-size': 14, opacity: fade(u, 0.5) }); mono(706, 270, '├ review.md', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.0) }); }
    if (k === 6) { const log = ['resources/read  file:///project/README.md', 'prompts/get     code-review', 'tools/call      create_file /project/review.md'];
      el('rect', { x: 660, y: 150, width: 280, height: 180, rx: 10, fill: INK });
      mono(676, 176, '감사 로그', { 'font-size': 13.5, fill: OFF });
      log.forEach((s, i) => { const [m, ...rest] = s.split(/\s{2,}/); mono(676, 210 + i * 40, m, { 'font-size': 13.5, 'font-weight': 700, fill: [GOOD, INFO, WARN][i] === WARN ? 'var(--warn)' : 'var(--term)', opacity: fade(u, 0.3 + i * 0.4) });
        mono(676, 228 + i * 40, rest.join(' ').slice(0, 32), { 'font-size': 13.5, fill: 'var(--term)', opacity: fade(u, 0.4 + i * 0.4) }); });
      note(340, 390, '읽고 → 생각하고 → 행동한다', fade(u, 1.6), { 'text-anchor': 'middle', 'font-size': 17 }); } }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'MCP Resources의 read_resource 핸들러가 지켜야 할 약속은 무엇인가?',
      o: ['같은 URI를 여러 번 읽어도 시스템 상태를 바꾸지 않는다', '읽을 때마다 접근 기록을 DB에 INSERT한다', '모르는 URI에는 비슷한 값을 지어내 돌려준다'], a: 0,
      why: 'Resources는 조회만 한다. 상태를 바꾸는 일이 필요하면 Tools로 옮기고, 모르는 URI는 예외로 끊는다.' },
    { q: 'LLM이 create_file을 부를 때 path와 content 인자의 모양을 아는 근거는 무엇인가?',
      o: ['함수 본문의 open() 호출', 'tools/list가 알려 준 inputSchema(JSON Schema)', 'Server 프로세스 이름'], a: 1,
      why: 'Tool은 이름·설명·inputSchema로 광고된다. LLM은 required: ["path", "content"]를 보고 인자를 채운다.' },
    { q: '/code-review 템플릿에서 사용자가 반드시 채워야 하는 인자는 무엇인가?',
      o: ['lang', 'file과 lang 둘 다', 'file'], a: 2,
      why: 'file은 required=True, lang은 required=False다. get_prompt는 file 값을 문장 속 빈칸에 끼워 user 메시지를 만든다.' },
    { q: '종합 워크플로우에서 디스크가 처음 바뀌는 단계는 어디인가?',
      o: ['resources/read로 README를 읽을 때', 'tools/call로 review.md를 만들 때', 'prompts/get으로 템플릿을 받을 때'], a: 1,
      why: '읽기와 템플릿 가공, LLM 호출까지는 부작용이 없다. create_file을 실행하는 마지막 단계에서만 파일이 생긴다.' },
  ];
  const summary = [
    'Resources는 URI로 찾는 읽기 전용 데이터라 몇 번 읽어도 상태가 그대로다.',
    'Tools는 이름·설명·inputSchema로 광고되고, 실행하면 파일이나 메시지처럼 바깥이 바뀐다.',
    'Prompts는 인자 빈칸이 있는 템플릿이고 get_prompt가 완성된 user 메시지를 돌려준다.',
    '읽기, 가공, 실행 순으로 나누면 부작용이 마지막 한 단계에만 생긴다.',
  ];
  const review = [
    { q: '"주문 목록 조회"를 Tool로, "주문 취소"를 Resource로 만들었다. 무엇이 문제인가?',
      o: ['둘 다 Prompt여야 한다', '조회는 Resource, 상태를 바꾸는 취소는 Tool이어야 한다', '문제없다. 이름만 맞으면 된다'], a: 1,
      why: 'Resource는 읽기만 해야 하므로 취소처럼 상태를 바꾸는 일은 Tool로 두고 사용자 확인을 거치게 해야 한다.' },
    { q: 'read_resource 안에서 uri.startswith를 썼더니 "AnyUrl object has no attribute startswith" 오류가 났다. 먼저 고칠 것은?',
      o: ['uri를 str(uri)로 바꿔 쓴다', 'list_resources의 mimeType을 고친다', 'Server 이름을 바꾼다'], a: 0,
      why: 'Python SDK는 uri를 pydantic AnyUrl 객체로 넘긴다. 문자열 메서드를 쓰려면 먼저 str로 바꿔야 한다.' },
    { q: '팀원 모두가 같은 기준으로 코드 리뷰를 요청하게 하고 싶다. 어떤 capability가 맞나?',
      o: ['Tools에 review 함수를 추가', 'Resources에 리뷰 기준 파일을 노출', 'Prompts에 /code-review 템플릿을 등록'], a: 2,
      why: 'Prompts는 기준 문장을 서버가 들고 있고 사용자는 /code-review로 고르기만 하므로 매번 같은 지시가 나간다.' },
  ];

  R.page({ title: 'Resources · Tools · Prompts', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
