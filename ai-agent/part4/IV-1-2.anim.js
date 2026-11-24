/* IV-1-2 MCP 아키텍처: Host, Client, Server — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * Step 5 의 메시지 본문은 실제로 Python SDK(mcp 1.30) filesystem 서버를 띄워 주고받은 값과 같다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, tokens, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미: JSON/코드 판 ----------
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
  // 프로세스 상자: 이름표 + 안쪽 내용
  function proc(x, y, w, h, title, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (title) mono(x + 12, y + 20, title, { 'font-size': 13.5, 'font-weight': 700, fill: o.color || MUT, opacity: o.op ?? 1 }); }

  // ---------- 1. Host 가 설정을 읽는다 ----------
  const HJ = [
    ['{', -1], ['  "mcpServers": {', 0],
    ['    "filesystem": {', 1], ['      "command": "npx",', 1], ['      "args": ["-y", "…/server-filesystem",', 1], ['               "/Users/me/docs"] },', 1],
    ['    "github": {', 2], ['      "command": "npx",', 2], ['      "env": { "GITHUB_PERSONAL_ACCESS_', 2], ['               TOKEN": "ghp_xxx" } },', 2],
    ['    "slack": {', 3], ['      "url": "https://mcp.example.com/slack" }', 3],
    ['  }', 4], ['}', 4],
  ];
  const SRV = [['filesystem', 'stdio', 'npx …/server-filesystem'], ['github', 'stdio', 'npx …/server-github'], ['slack', 'sse', 'https://mcp.example.com/slack']];
  function hostWin(x, y, w, h, title) { el('rect', { x, y, width: w, height: h, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: INK, 'stroke-width': 2 });
    [0, 14, 28].forEach((d) => el('circle', { cx: x + 16 + d, cy: y + 15, r: 4.5, fill: OFF }));
    tx(x + w / 2, y + 20, title, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }); }
  function s1(t, c) { const { k, u } = c;
    const vis = HJ.filter(([, g]) => g <= Math.max(k, 0) || (k >= 4)), lines = vis.map(([s]) => s);
    const hi = vis.map(([, g], i) => ((g === k || (k === 0 && g <= 0)) && k < 5 ? i : -1)).filter((i) => i >= 0);
    const fresh = vis.filter(([, g]) => g === k).length, shown = lines.length - fresh + fresh * E(u, 0.2, 1.2);
    codePanel(24, 24, 440, lines, { shown: k >= 4 ? lines.length : shown, hi: k === 5 ? null : hi, fs: 13.5, lh: 20, title: 'host.json (claude_desktop_config.json)', fill: PANEL });
    hostWin(500, 24, 440, 330, 'Claude Desktop = Host');
    tx(520, 82, 'MCP Server 목록', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const n = Math.min(k, 3);
    mono(920, 82, n + (k >= 4 ? ' 확정' : ''), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: k >= 4 ? ACC : INK });
    SRV.slice(0, n).forEach(([name, tr, cmd], i) => { const y = 112 + i * 64, s = i === k - 1 && k <= 3 ? pop(u, 1.0) : 1;
      card(720, y, 400, 52, { rx: 8, stroke: tr === 'sse' ? INFO : GRID, sw: 2, s });
      mono(534, y - 3, name, { 'font-size': 15.5, 'font-weight': 800, opacity: s }); mono(534, y + 17, cmd, { 'font-size': 13.5, fill: MUT, opacity: s });
      pill(880, y - 2, tr, tr === 'sse' ? INFO : ACC, s, { mono: true, fs: 13.5 }); });
    // 채팅 입력창 (Host 가 사람과 만나는 곳)
    el('rect', { x: 520, y: 312, width: 400, height: 30, rx: 15, fill: SOFT, stroke: GRID });
    tx(538, 332, '메시지를 입력하세요…', { 'font-size': 13.5, fill: MUT });
    if (k === 0) note(720, 380, '부팅할 때 mcpServers를 읽는다', fade(u, 1.0), { 'text-anchor': 'middle' });
    if (k === 4) note(720, 390, 'Host 하나가 Server 3개를 함께 관리한다', fade(u, 0.5), { 'text-anchor': 'middle', fill: ACC });
    if (k === 5) { // Host 가 Server 를 직접 부르는 길은 없다
      el('line', { x1: 700, y1: 370, x2: 830, y2: 370, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      cross(765, 370, 12, pop(u, 0.9));
      tx(690, 375, 'Host → Server 직접', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.3) });
      mono(940, 375, 'Client 0개', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.3) }); } }

  // ---------- 2. Server 하나에 Client 하나 ----------
  const HX = 30, HY = 30, HW = 470, HH = 360;
  function s2(t, c) { const { k, u } = c;
    hostWin(HX, HY, HW, HH, 'Host (Claude Desktop)');
    if (k === 0) { // SDK 두 조각
      codePanel(60, 90, 410, ['import { Client } from', '  "@modelcontextprotocol/sdk/client/index.js";', 'import { StdioClientTransport } from', '  "@modelcontextprotocol/sdk/client/stdio.js";'], { fs: 13.5, fill: PANEL, shown: E(u, 0.2, 1.4) * 4 });
      pill(160, 260, 'Client', ACC, pop(u, 1.4), { mono: true }); pill(340, 260, 'StdioClientTransport', INFO, pop(u, 1.7), { mono: true, fs: 13.5 });
      note(265, 320, '말하는 쪽과 실어 나르는 쪽은 따로', fade(u, 2.0), { 'text-anchor': 'middle' });
      proc(640, 140, 280, 120, '아직 띄운 Server 없음', { dash: '6 5', stroke: GRID }); return; }
    const nC = k === 6 ? 3 : 1;
    const CY = [110, 210, 300];
    for (let i = 0; i < nC; i++) { const s = i === 0 ? (k === 1 ? pop(u, 0.3) : 1) : pop(u, 0.4 + i * 0.4), y = CY[i];
      card(160, y + 30, 220, i === 0 ? 120 : 70, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.2, s });
      if (s < 0.3) continue;
      mono(62, y + (i === 0 ? -6 : 14), ['fsClient', 'ghClient', 'slackClient'][i], { 'font-size': 15, 'font-weight': 800, fill: ACC });
      if (i === 0) { mono(62, y + 16, 'claude-desktop 0.7.0', { 'font-size': 13.5, fill: MUT }); mono(62, y + 36, '{ sampling: {} }', { 'font-size': 13.5, fill: INK, opacity: k === 1 ? fade(u, 0.9) : 1 }); }
      else mono(62, y + 38, '상태·캐시 따로', { 'font-size': 13.5, fill: MUT }); }
    // Transport 와 Server 프로세스
    const pipeOn = k >= 3, SX = 650, SY = 110;
    if (k >= 2) { const g = k === 2 ? E(u, 0.3, 1.3) : 1;
      el('rect', { x: 270, y: SY + 18, width: (pipeOn ? 380 : 150) * g, height: 26, rx: 13, fill: pipeOn ? INFOBG : SOFT, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': pipeOn ? null : '6 5' });
      mono(284, SY + 36, 'stdio', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: g });
      if (k === 2) { mono(436, SY + 36, 'command: "npx"', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) }); note(640, 230, '객체만 만들었다. 아직 실행 전', fade(u, 1.4)); } }
    if (pipeOn) { const s = k === 3 ? pop(u, 0.3) : 1;
      proc(SX, SY - 20, 280, 110, 'Server 프로세스', { s, op: s });
      mono(SX + 14, SY + 30, 'npx server-filesystem', { 'font-size': 14, 'font-weight': 700, opacity: s }); mono(SX + 14, SY + 54, '/Users/me/docs', { 'font-size': 13.5, fill: MUT, opacity: s });
      if (k === 3) { fly(300, SY + 31, 620, SY + 31, seg(u, 0.8, 1.6), 'initialize', { mono: true });
        fly(620, SY + 31, 300, SY + 31, seg(u, 1.6, 2.4), 'result', { mono: true, fill: INFO });
        note(SX + 140, 250, 'connect() = 프로세스 실행 + 핸드셰이크', fade(u, 2.2), { 'text-anchor': 'middle', 'font-size': 14 }); } }
    if (k >= 4) { // 도구 목록 캐시
      const items = ['read_file  { path }', 'write_file { path, content }'];
      if (k <= 5) { tx(540, 250, 'fsClient 안의 tool 캐시', { 'font-size': 14, 'font-weight': 700, fill: MUT });
        items.forEach((s, i) => { const y = 270 + i * 40; card(700, y + 14, 320, 34, { rx: 7, stroke: GRID, s: k === 4 ? pop(u, 0.9 + i * 0.4) : 1 }); mono(552, y + 19, s, { 'font-size': 14, opacity: k === 4 ? fade(u, 1.0 + i * 0.4) : 1 }); });
        if (k === 4) fly(620, SY + 31, 300, SY + 31, seg(u, 0.2, 1.0), 'tools/list → 2', { mono: true, fill: INFO }); }
      if (k === 5) { fly(400, SY + 31, 620, SY + 31, seg(u, 0.3, 1.4), 'callTool read_file', { mono: true });
        mono(540, 370, 'arguments: { path: "/Users/me/docs/note.md" }', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.2) }); }
      if (k === 6) { [1, 2].forEach((i) => { const y = CY[i] + 30, s = pop(u, 0.4 + i * 0.4), tr = i === 2 ? 'sse' : 'stdio';
          el('rect', { x: 270, y: y - 13, width: 380 * s, height: 26, rx: 13, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: s });
          mono(284, y + 5, tr, { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: s });
          proc(SX, y - 30, 280, 60, null, { op: s }); mono(SX + 14, y + 6, ['', 'github Server', 'slack Server (원격)'][i], { 'font-size': 14, 'font-weight': 700, opacity: s }); });
        mono(800, 400, 'Client 3 = Server 3', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } } }

  // ---------- 3. Transport: 줄 단위 JSON 이 흐르는 관 ----------
  const WIRE = ['{"jsonrpc":"2.0","id":1,"method":"tools/list"}', '{"jsonrpc":"2.0","id":1,"result":{"tools":[…]}}'];
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { // stdio
      proc(40, 40, 400, 330, 'Host 프로세스 (Claude Desktop)', { stroke: INK });
      card(240, 110, 220, 54, { rx: 10, text: 'Client (filesystem)', fs: 15, stroke: ACC, fill: ACCBG, color: ACC });
      const child = k === 0 ? 1 : k === 1 ? pop(u, 0.3) : 1;
      // 자식 프로세스: k1 에서는 Host 안쪽 아래로 붙는다
      if (k >= 1) { proc(80, 250, 320, 90, '자식 프로세스', { op: child, stroke: INFO, color: INFO }); mono(100, 310, 'npx server-filesystem', { 'font-size': 14.5, 'font-weight': 700, opacity: child }); }
      const top = 137, bot = k >= 1 ? 250 : 340;
      el('line', { x1: 200, y1: top, x2: 200, y2: bot, stroke: INFO, 'stroke-width': 3 }); el('line', { x1: 280, y1: top, x2: 280, y2: bot, stroke: INFO, 'stroke-width': 3 });
      mono(192, 205, 'stdin ↓', { 'font-size': 13.5, 'text-anchor': 'end', fill: INFO, 'font-weight': 700 }); mono(288, 205, '↑ stdout', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      dot([[200, top], [200, bot]], (t * 0.6) % 1, ACC, 5); dot([[280, bot], [280, top]], (t * 0.6 + 0.5) % 1, INFO, 5);
      if (k === 0) { tx(480, 70, '관 속을 지나는 실제 바이트', { 'font-size': 14, 'font-weight': 700, fill: MUT });
        WIRE.forEach((w, i) => { const y = 110 + i * 70, s = fade(u, 0.4 + i * 0.6);
          codePanel(480, y, 460, [w.length > 46 ? w.slice(0, 46) : w], { fs: 13.5, op: s, fill: PANEL, stroke: i ? INFO : ACC });
          mono(930, y + 54, '\\n', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: s }); });
        note(710, 300, '한 줄 = 메시지 하나 (줄바꿈으로 구분)', fade(u, 1.8), { 'text-anchor': 'middle' }); }
      if (k === 1) { note(690, 150, 'Server = Host의 자식 프로세스', fade(u, 0.8), { 'text-anchor': 'middle' });
        sub(690, 180, 'Host가 끄면 같이 끝난다', fade(u, 1.2), { 'font-size': 14.5 }); }
      if (k === 2) { const net = pop(u, 0.4); card(700, 130, 220, 80, { rx: 40, stroke: GRID, s: net, text: '인터넷', fs: 16, color: MUT }); cross(700, 130, 22, pop(u, 0.9));
        ['파일', 'Git', 'Docker'].forEach((s, i) => pill(600 + i * 100, 270, s, GOOD, pop(u, 1.2 + i * 0.2)));
        note(700, 330, '네트워크를 안 거쳐 빠르고 안전하다', fade(u, 1.8), { 'text-anchor': 'middle' }); }
      return; }
    if (k <= 4) { // HTTP POST + SSE
      proc(40, 80, 280, 240, 'Host', {}); card(180, 200, 200, 54, { rx: 10, text: 'Client (slack)', fs: 15, stroke: ACC, fill: ACCBG, color: ACC });
      proc(640, 80, 290, 240, 'Remote MCP Server', { stroke: INFO, color: INFO }); mono(660, 200, 'https://mcp.example.com', { 'font-size': 13.5, fill: INFO });
      mono(660, 224, '/slack', { 'font-size': 13.5, fill: INFO });
      grow(285, 160, 640, 160, k === 3 ? seg(u, 0.2, 1.0) : 1, ACC); mono(460, 148, 'HTTP POST  요청', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
      grow(640, 250, 285, 250, k === 3 ? seg(u, 1.0, 1.8) : 1, INFO, { dash: '7 5' }); mono(460, 278, 'SSE 스트림  응답·알림', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
      for (let i = 0; i < 3; i++) dot([[640, 250], [285, 250]], ((t * 0.5 + i / 3) % 1), INFO, 5);
      if (k === 3) note(480, 370, '메시지 형식은 stdio와 같은 JSON-RPC 2.0', fade(u, 2.0), { 'text-anchor': 'middle' });
      if (k === 4) { pill(785, 290, '여러 사용자 · 클라우드', INFO, pop(u, 0.5), { fs: 13.5 }); note(480, 370, 'Client는 그대로, 상대만 원격 URL', fade(u, 1.0), { 'text-anchor': 'middle' }); }
      return; }
    if (k === 5) { // 같은 봉투, 다른 관
      const env = '{"jsonrpc":"2.0","id":42,…}';
      [['stdio', 140, ACC], ['HTTP + SSE', 280, INFO]].forEach(([n, y, col], i) => {
        el('rect', { x: 200, y: y - 20, width: 560, height: 40, rx: 20, fill: SOFT, stroke: col, 'stroke-width': 2 });
        mono(180, y + 6, n, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'end' });
        const f = (t * 0.35 + i * 0.4) % 1; card(lerp(330, 640, f), y, tw(env, 13.5) + 22, 28, { rx: 14, text: env, fs: 13.5, mono: true, fill: PANEL, stroke: col, color: INK }); });
      note(480, 370, 'Transport만 바꿔 끼운다 · Server 코드는 그대로', fade(u, 0.6), { 'text-anchor': 'middle' }); return; }
    // k6: Streamable HTTP — 엔드포인트 하나
    proc(40, 70, 260, 260, 'Client', {});
    proc(660, 70, 270, 260, 'Server  /mcp', { stroke: INFO, color: INFO });
    grow(300, 130, 660, 130, seg(u, 0.2, 0.9), ACC); mono(480, 118, 'POST /mcp', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    [['application/json', '답 한 번', 210], ['text/event-stream', '여러 번 흘려 보냄', 280]].forEach(([ct, d, y], i) => {
      grow(660, y, 300, y, seg(u, 1.0 + i * 0.5, 1.6 + i * 0.5), INFO, i ? { dash: '7 5' } : {});
      mono(480, y - 12, ct, { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.1 + i * 0.5) });
      tx(480, y + 22, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2 + i * 0.5) }); });
    note(480, 380, '2025-03-26 스펙: HTTP+SSE → Streamable HTTP', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  // ---------- 4. Server 코드가 자라며 목록이 찬다 ----------
  const PY = [
    ['from mcp.server import Server', 0], ['from mcp.server.stdio import stdio_server', 0], ['from mcp.types import Tool, TextContent', 0],
    ['app = Server("filesystem")', 1],
    ['@app.list_tools()', 2], ['async def list_tools() -> list[Tool]:', 2],
    ['    Tool(name="read_file", …required=["path"])', 3],
    ['    Tool(name="write_file", …["path", "content"])', 4],
    ['@app.call_tool()', 5], ['async def call_tool(name, arguments):', 5], ['    if name == "read_file": … read_text()', 5],
    ['async with stdio_server() as (read, write):', 6], ['    await app.run(read, write, …)', 6],
  ];
  function s4(t, c) { const { k, u } = c;
    const g = Math.min(k, 6), vis = PY.filter(([, q]) => q <= g), lines = vis.map(([s]) => s), hi = vis.map(([, q], i) => (q === k ? i : -1)).filter((i) => i >= 0);
    const fresh = hi.length, shown = lines.length - fresh + fresh * E(u, 0.2, 1.2);
    codePanel(20, 20, 470, lines, { py: true, fs: 13.5, lh: 21, title: 'server.py', fill: PANEL, shown: k === 7 ? lines.length : shown, hi: k === 7 ? null : hi });
    if (k === 7) { // 호출자를 모른다: 어디서 불러도 같은 파일
      ['Claude Desktop', 'Cursor', '원격 Host'].forEach((h, i) => { const y = 90 + i * 100, s = pop(u, 0.3 + i * 0.3);
        card(840, y, 170, 52, { rx: 10, text: h, fs: 15, stroke: i === 2 ? INFO : ACC, s });
        grow(752, y, 600, 210, seg(u, 0.6 + i * 0.3, 1.2 + i * 0.3), MUT, { plain: true }); });
      card(560, 210, 90, 120, { rx: 8, text: 'server\n.py', fs: 16, mono: true, stroke: INK, sw: 2.5 });
      note(700, 390, '코드에 Host·Client 정보가 한 줄도 없다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    // 오른쪽: 이 Server 가 응답할 수 있는 메서드 표 + tools/list 결과
    tx(520, 46, '처리할 수 있는 요청', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const rows = [['initialize', '(SDK가 처리)', 1], ['tools/list', 'list_tools()', 2], ['tools/call', 'call_tool()', 5]];
    rows.forEach(([m, f, need], i) => { if (k < need) return; const y = 72 + i * 40, s = k === need ? pop(u, 0.4) : 1;
      card(720, y, 400, 34, { rx: 7, stroke: k === need ? ACC : GRID, s, sw: 2 }); mono(534, y + 5, m, { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: s }); mono(900, y + 5, f, { 'font-size': 14, 'text-anchor': 'end', opacity: s }); });
    if (k === 0) note(720, 230, 'Server 본체 · stdio 실행기 · 타입', fade(u, 1.0), { 'text-anchor': 'middle' });
    if (k >= 3 && k <= 5) { const L = ['{"tools":[', '  {"name":"read_file",', '   "inputSchema":{"required":["path"]}}' + (k >= 4 ? ',' : ''),];
      if (k >= 4) L.push('  {"name":"write_file",', '   "inputSchema":{"required":["path","content"]}}');
      L.push(']}');
      codePanel(520, 196, 420, L, { fs: 13.5, lh: 20, title: 'tools/list 응답', fill: SOFT, stroke: INFO, shown: k === 3 || k === 4 ? (L.length - (k === 3 ? 3 : 2)) + E(u, 0.6, 1.6) * (k === 3 ? 3 : 2) : L.length }); }
    if (k === 5) { card(600, 380, 150, 34, { rx: 7, text: 'note.md', fs: 14, mono: true, stroke: GRID, s: pop(u, 0.8) });
      fly(680, 380, 880, 380, seg(u, 1.0, 2.0), 'TextContent', { mono: true, stay: true }); }
    if (k === 6) { const tl = ['> {"jsonrpc":"2.0","id":0,"method":"initialize",…}', '< {"jsonrpc":"2.0","id":0,"result":{…}}', '> {"jsonrpc":"2.0","id":1,"method":"tools/list"}', '< {"jsonrpc":"2.0","id":1,"result":{"tools":[…]}}'];
      terminal(520, 200, 420, 150, tl.map((s) => s.length > 46 ? s.slice(0, 45) + '…' : s), E(u, 0.3, 2.2) * 4, { title: 'stdin / stdout', fs: 13.5 }); } }

  // ---------- 5. 메시지 한 바퀴: 요청 → 응답 → 컨텍스트 ----------
  const LANE = [['LLM', 70], ['Host', 230], ['Client', 390], ['Transport', 550], ['Server', 710]];
  function lanes(hot) { LANE.forEach(([n, x], i) => { const on = hot && hot.includes(i);
    card(x, 46, 128, 40, { rx: 8, text: n, fs: 15, stroke: on ? ACC : GRID, fill: on ? ACCBG : PANEL, color: on ? ACC : INK });
    el('line', { x1: x, y1: 66, x2: x, y2: 400, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { lanes([2, 3, 4]);
      const L = ['{ "jsonrpc": "2.0",', '  "id": 42,', '  "method": "tools/call",'];
      if (k === 1) L.push('  "params": { "name": "read_file",', '    "arguments": { "path": "…/note.md" } } }');
      codePanel(120, 120, 400, L, { fs: 14, lh: 21, fill: PANEL, stroke: ACC, hi: k === 0 ? [1, 2] : [3, 4], shown: k === 0 ? E(u, 0.2, 1.2) * 3 : 3 + E(u, 0.2, 1.0) * 2 });
      if (k === 1) { dot([[390, 330], [550, 330], [710, 330]], seg(u, 1.2, 2.4), ACC, 8); mono(550, 318, 'Request', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) }); }
      // 기다리는 요청 표
      card(800, 210, 220, 90, { rx: 10, stroke: WARN, fill: WARNBG, s: k === 0 ? pop(u, 1.4) : 1 });
      tx(800, 196, '대기 중인 요청', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
      mono(800, 226, 'id 42 · tools/call', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); return; }
    if (k === 2) { lanes([2, 4]);
      dot([[710, 330], [550, 330], [390, 330]], seg(u, 0.2, 1.4), INFO, 8); mono(550, 318, 'Response', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700 });
      codePanel(120, 120, 400, ['{ "jsonrpc": "2.0",', '  "id": 42,', '  "result": { … } }'], { fs: 14, lh: 21, fill: PANEL, stroke: INFO, hi: [1] });
      card(800, 210, 220, 90, { rx: 10, stroke: GOOD, fill: GOODBG });
      mono(800, 210, 'id 42 · 짝 맞음', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.4) }); check(800, 238, 10, pop(u, 1.6)); return; }
    if (k === 3) { // result 가 LLM 컨텍스트 목록에 쌓인다
      codePanel(30, 40, 440, ['"result": {', '  "content": [{ "type": "text",', '    "text": "# 회의록\\n오늘 논의한 항목...\\n" }],', '  "isError": false }'], { fs: 13.5, lh: 21, fill: PANEL, stroke: INFO, hi: [2, 3] });
      tx(520, 46, 'LLM이 보는 메시지 목록', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['user', '회의록 요약해 줘', INK, 1], ['assistant', 'tool_use  read_file(path)', ACC, 1], ['tool', '# 회의록 오늘 논의한 항목...', INFO, 0]].forEach(([r, s, col, old], i) => {
        const y = 80 + i * 62, sc = old ? 1 : pop(u, 0.8);
        card(720, y + 20, 400, 48, { rx: 10, stroke: col, sw: 2, s: sc, fill: old ? PANEL : INFOBG });
        mono(536, y + 15, r, { 'font-size': 13.5, fill: MUT, opacity: sc }); tx(536, y + 34, s, { 'font-size': 14.5, 'font-weight': 600, class: i ? 'mono' : null, opacity: sc }); });
      fly(250, 120, 720, 224, seg(u, 0.2, 0.8), 'content[0].text', { mono: true, fill: INFO });
      note(720, 300, '이제 LLM이 파일 내용을 안다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { lanes([2, 4]);
      codePanel(120, 120, 460, ['{ "jsonrpc": "2.0",', '  "method": "notifications/tools/list_changed" }'], { fs: 14, lh: 21, fill: PANEL, stroke: WARN, hi: [0] });
      dot([[710, 300], [550, 300], [390, 300]], seg(u, 0.4, 1.6), WARN, 8); mono(550, 288, 'Notification', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700 });
      card(800, 210, 220, 70, { rx: 10, stroke: GRID, dash: '6 5', text: 'id 없음 · 답 없음', fs: 14.5, s: pop(u, 1.4) });
      note(480, 390, 'Server가 먼저 말을 거는 길', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    // k5: 세 종류 정리
    const T = [['Request', 'id + method (+ params)', '답을 기다린다', ACC], ['Response', '같은 id + result 또는 error', '짝을 맞춘다', INFO], ['Notification', 'method만 (id 없음)', '답이 없다', WARN]];
    T.forEach(([n, f, d, col], i) => { const y = 80 + i * 90, s = pop(u, 0.2 + i * 0.35);
      card(480, y, 760, 70, { rx: 12, stroke: col, sw: 2.2, s });
      mono(130, y + 6, n, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: s }); mono(330, y + 6, f, { 'font-size': 15, opacity: s });
      tx(830, y + 6, d, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end', opacity: s }); });
    note(480, 380, 'stdio든 HTTP든 이 세 가지 JSON을 옮길 뿐', fade(u, 1.6), { 'text-anchor': 'middle' }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'Claude Desktop(Host)이 부팅할 때 어떤 MCP Server를 띄울지 아는 방법은 무엇인가?',
      o: ['LLM이 그때그때 정한다', 'Server가 먼저 Host를 찾아온다', '설정 파일의 mcpServers 항목을 읽는다'], a: 2,
      why: 'Host는 claude_desktop_config.json 같은 설정 파일의 mcpServers를 읽어 Server 목록을 정한다. 예에서는 3개다.' },
    { q: 'host.json에 Server가 3개 적혀 있다. Host 안에 생기는 MCP Client는 몇 개인가?',
      o: ['1개 (모든 Server 공용)', '3개 (Server 하나에 하나)', '6개 (요청·응답 각각)'], a: 1,
      why: 'Client와 Server는 1:1이다. Client마다 연결 상태와 tool 캐시를 따로 들고 있다.' },
    { q: 'stdio Transport에서 메시지 하나와 다음 메시지를 가르는 것은 무엇인가?',
      o: ['줄바꿈', 'HTTP 헤더', '메시지 길이를 적은 4바이트'], a: 0,
      why: 'stdio는 자식 프로세스의 stdin/stdout으로 줄 단위 JSON을 주고받는다. 한 줄이 메시지 하나다.' },
    { q: 'server.py가 stdio에서도, 원격 HTTP에서도 그대로 쓰일 수 있는 이유는 무엇인가?',
      o: ['코드에 Host·Client 정보가 없고 Transport만 바꿔 끼우기 때문', 'Python만 원격 실행을 지원하기 때문', 'Server가 접속한 Host를 자동으로 판별하기 때문'], a: 0,
      why: 'Server는 받은 요청에 답할 뿐 누가 불렀는지 모른다. 실행부의 Transport만 바꾸면 된다.' },
    { q: 'JSON-RPC 메시지에 id가 없으면 무엇인가?',
      o: ['응답(Response)', '알림(Notification)이라 답을 기다리지 않는다', '잘못된 요청이라 서버가 버린다'], a: 1,
      why: 'id가 있어야 요청과 응답의 짝을 맞춘다. notifications/tools/list_changed처럼 id가 없으면 답이 없다.' },
  ];
  const summary = [
    'Host는 설정 파일의 mcpServers를 읽어 띄울 Server 목록을 정한다.',
    'Host는 Server마다 MCP Client를 하나씩 만들고, 늘 Client를 거쳐 Server에 닿는다.',
    'Transport는 로컬이면 stdio, 원격이면 HTTP 계열이고 메시지는 같은 JSON-RPC 2.0이다.',
    '요청은 id로 응답과 짝을 이루고, 결과 content는 LLM이 읽는 메시지 목록에 들어간다.',
  ];
  const review = [
    { q: '회사 공용 Slack MCP Server를 클라우드에 올려 여러 사람이 쓰려 한다. 어떤 Transport가 맞나?',
      o: ['HTTP 계열 Transport', 'stdio Transport', 'Transport 없이 Host가 직접 호출'], a: 0,
      why: 'stdio는 Host가 자식 프로세스로 띄우는 로컬용이다. 원격 다중 사용자는 HTTP 계열 Transport로 URL에 붙는다.' },
    { q: 'stdio로 띄운 Server에서 print로 디버그 로그를 찍었더니 연결이 깨졌다. 먼저 의심할 것은?',
      o: ['Host의 설정 파일 경로', 'stdout은 JSON-RPC 줄이 지나는 길인데 로그가 섞였다', 'Client 인스턴스 수가 모자라다'], a: 1,
      why: 'stdio에서는 stdout 한 줄이 메시지 하나다. 로그는 stderr로 보내야 Client가 JSON을 읽을 수 있다.' },
    { q: 'Client가 id 42와 43 두 요청을 보냈는데 43의 답이 먼저 왔다. Client는 어떻게 하나?',
      o: ['순서가 틀렸으니 둘 다 버린다', '먼저 온 답을 42의 결과로 쓴다', 'id 43으로 대기 중인 요청과 짝을 맞춘다'], a: 2,
      why: '응답은 같은 id를 달고 오므로 도착 순서와 상관없이 대기 표에서 짝을 찾는다.' },
  ];

  R.page({ title: 'Host · Client · Transport · Server', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
