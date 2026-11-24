/* IV-3-1 MCP Server 만들기 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 화면의 JSON 응답과 stderr 로그는 이 페이지의 server.ts·register-tools.ts 를 tsc 로 빌드해
 * (@modelcontextprotocol/sdk 1.32.2) stdio 로 직접 주고받은 값이다. 채팅 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, tokens, terminal } = R;
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
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, opacity: op });
    if (o.title) mono(x + 14, y + 22, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.stroke && o.stroke !== GRID ? o.stroke : MUT, opacity: op });
    const n = Math.ceil(shown);
    lines.slice(0, n).forEach((s, i) => { const part = i === n - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s, yy = y + top + i * lh;
      if (o.hi && o.hi.includes(i)) el('rect', { x: x + 5, y: yy, width: w - 10, height: lh, rx: 4, fill: 'var(--hl)', opacity: 0.55 * op });
      spans(x + 14, yy + fs * 0.95, (o.ts ? tokens : jtok)(part), { 'font-size': fs, opacity: op }); });
    return h; }
  // 코드가 자라는 판: rows [[줄, 등장 beat]]
  function growCode(x, y, w, rows, k, u, title, o) { o = o || {}; const vis = rows.filter(([, q]) => q <= k), lines = vis.map(([s]) => s);
    const hi = vis.map(([, q], i) => (q === k ? i : -1)).filter((i) => i >= 0), shown = lines.length - hi.length + hi.length * E(u, 0.2, 1.1);
    return codePanel(x, y, w, lines, { ts: o.ts, fs: 13.5, lh: o.lh || 20, title, shown: o.full ? lines.length : shown, hi: o.full ? null : hi }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op ?? 1 }, a || {}));
  // 실제로 받은 응답 (stdio 로 직접 실행)
  const REAL = {
    init: '{"result":{"protocolVersion":"2025-06-18","capabilities":{"tools":{}},"serverInfo":{"name":"weather-mcp-server","version":"0.1.0"}},"jsonrpc":"2.0","id":0}',
    call: '{"result":{"content":[{"type":"text","text":"Seoul: 맑음, 18°C"}]},"jsonrpc":"2.0","id":2}',
    seoulKo: '서울: 데이터 없음', unknown: '{"jsonrpc":"2.0","id":4,"error":{"code":-32603,"message":"unknown tool: get_time"}}',
    stderr: '[weather-mcp] server started on stdio',
  };

  // ---------- 1. 프로젝트 초기화 ----------
  const PKG = [['{', 0], ['  "name": "weather-mcp-server",', 0], ['  "version": "0.1.0",', 0],
    ['  "type": "module",', 1], ['  "bin": { "weather-mcp-server": "dist/server.js" },', 1],
    ['  "scripts": { "build": "tsc",', 2], ['               "start": "node dist/server.js" },', 2],
    ['  "dependencies": {', 3], ['    "@modelcontextprotocol/sdk": "^1.0.0",', 3], ['    "zod": "^3.23.8" },', 3],
    ['  "devDependencies": {', 4], ['    "@types/node": "^20.0.0", "typescript": "^5.4.0" }', 4], ['}', 0]];
  const CMDS = ['$ npm init -y', '$ npm pkg set type=module', '$ npm pkg set scripts.build=tsc', '$ npm i @modelcontextprotocol/sdk zod', '$ npm i -D typescript @types/node'];
  function s1(t, c) { const { k, u } = c;
    growCode(20, 20, 520, PKG, k, u, 'package.json', { lh: 21 });
    terminal(560, 20, 380, 150, CMDS.slice(0, k + 1), k + E(u, 0.1, 0.9), { title: 'weather-mcp-server/', fs: 13.5 });
    const X = 750;
    if (k === 0) { card(X, 260, 300, 100, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.8) });
      mono(X, 252, 'weather-mcp-server', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      mono(X, 282, 'v0.1.0', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      tx(X, 340, '나중에 serverInfo에도 같은 값', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 1) { card(X - 80, 250, 120, 44, { rx: 8, text: 'import', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.6) }); check(X - 80, 290, 9, pop(u, 0.9));
      tx(X - 80, 330, 'ESM 문법', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1) });
      card(X + 90, 250, 150, 44, { rx: 8, text: 'dist/server.js', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.2) });
      tx(X + 90, 330, 'bin = 실행 진입점', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 2) { [['src/*.ts', INK], ['tsc', WARN], ['dist/*.js', ACC]].forEach(([s, col], i) => card(600 + i * 140, 250, 116, 44, { rx: 8, text: s, fs: 14, mono: true, stroke: col, color: col, s: pop(u, 0.3 + i * 0.4) }));
      grow(658, 250, 682, 250, seg(u, 0.7, 1.0), MUT); grow(798, 250, 822, 250, seg(u, 1.1, 1.4), MUT);
      tx(740, 330, 'Claude Desktop이 띄울 것은 dist 쪽', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 3) { tx(580, 210, 'node_modules/', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      [['@modelcontextprotocol/sdk', 'MCP 서버·클라이언트'], ['zod', '스키마 검증']].forEach(([n, d], i) => { const y = 250 + i * 56, s = pop(u, 0.6 + i * 0.4);
        card(760, y, 360, 44, { rx: 8, stroke: ACC, s }); mono(594, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); tx(926, y + 5, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s }); }); }
    if (k === 4) { tx(580, 230, 'devDependencies', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: MUT });
      ['typescript', '@types/node'].forEach((n, i) => pill(640 + i * 160, 270, n, MUT, pop(u, 0.4 + i * 0.3), { mono: true, fs: 14 }));
      tx(740, 330, '빌드할 때만 쓰고 배포물에는 안 들어간다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      banner(740, 380, '1단계 끝 · package.json 완성', pop(u, 1.6)); } }

  // ---------- 2. Server 인스턴스 ----------
  const SRV = [['import { Server } from "@modelcontextprotocol/sdk/server/index.js";', 0], ['import { StdioServerTransport } from "…/server/stdio.js";', 0], ['import { registerWeatherTools } from "./register-tools.js";', 0],
    ['const server = new Server(', 1], ['  { name: "weather-mcp-server", version: "0.1.0" },', 1],
    ['  { capabilities: { tools: {} } },', 2], [');', 1],
    ['registerWeatherTools(server);', 3],
    ['const transport = new StdioServerTransport();', 4], ['await server.connect(transport);', 4],
    ['console.error("[weather-mcp] server started on stdio");', 5]];
  function s2(t, c) { const { k, u } = c;
    growCode(20, 20, 560, SRV, k, u, 'src/server.ts', { ts: true, lh: 21 });
    const X = 770;
    if (k === 0) { [['Server', '본체'], ['StdioServerTransport', '통로'], ['registerWeatherTools', '도구 등록']].forEach(([n, d], i) => { const y = 80 + i * 70, s = pop(u, 0.4 + i * 0.35);
        card(X, y, 300, 52, { rx: 10, stroke: [ACC, INFO, WARN][i], s }); mono(X - 136, y + 5, n, { 'font-size': 14.5, 'font-weight': 800, fill: [ACC, INFO, WARN][i], opacity: s }); tx(X + 136, y + 5, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s }); }); return; }
    // initialize 응답 (실제)
    if (k <= 2) { const L = ['"result": {', '  "protocolVersion": "2025-06-18",', '  "capabilities": { "tools": {} },', '  "serverInfo": {', '    "name": "weather-mcp-server",', '    "version": "0.1.0" } }'];
      codePanel(600, 40, 340, L, { fs: 13.5, lh: 20, title: 'initialize 응답 (실제)', stroke: INFO, hi: k === 1 ? [3, 4, 5] : [2] });
      note(X, 260, k === 1 ? '첫 인자가 serverInfo가 된다' : '둘째 인자가 capabilities가 된다', fade(u, 1.2), { 'text-anchor': 'middle' });
      if (k === 2) tx(X, 290, 'resources·prompts는 안 쓰니 적지 않는다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 3) { tx(600, 60, '응답할 수 있는 요청', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['initialize', 'SDK가 처리', 1], ['tools/list', '등록 함수 안에서', 0], ['tools/call', '등록 함수 안에서', 0]].forEach(([m, d, done], i) => { const y = 100 + i * 54, s = done ? 1 : pop(u, 0.6 + i * 0.3);
        card(X, y, 340, 44, { rx: 8, stroke: done ? GRID : WARN, s }); mono(612, y + 5, m, { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: s }); tx(928, y + 5, d, { 'font-size': 13.5, fill: done ? MUT : WARN, 'text-anchor': 'end', opacity: s }); });
      note(X, 300, 'entrypoint는 한 줄로 짧게', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { el('rect', { x: 610, y: 60, width: 330, height: 150, rx: 12, fill: PANEL, stroke: GOOD, 'stroke-width': 2.5 });
      mono(626, 86, 'node dist/server.js', { 'font-size': 14.5, 'font-weight': 700 });
      const r = 20 + 6 * Math.sin(t * 4); el('circle', { cx: 775, cy: 150, r, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.6) });
      mono(775, 195, 'stdin 대기', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.6) });
      note(X, 260, 'connect() 이후 메시지 루프가 돈다', fade(u, 1.2), { 'text-anchor': 'middle' }); return; }
    // k5: stdout 은 JSON 전용, 로그는 stderr
    [['stdout', 'JSON-RPC 전용', INFO, '{"result":{…},"jsonrpc":"2.0","id":0}'], ['stderr', '로그', MUT, REAL.stderr]].forEach(([n, d, col, line], i) => { const y = 70 + i * 130;
      mono(600, y, n, { 'font-size': 16, 'font-weight': 800, fill: col }); tx(680, y, d, { 'font-size': 14, fill: MUT });
      el('rect', { x: 600, y: y + 14, width: 340, height: 40, rx: 8, fill: i ? INK : INFOBG, stroke: col, 'stroke-width': 1.8 });
      mono(612, y + 39, line.length > 38 ? line.slice(0, 37) + '…' : line, { 'font-size': 13.5, fill: i ? 'var(--term)' : INK, opacity: fade(u, 0.3 + i * 0.4) }); });
    card(770, 350, 340, 54, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 1.4) });
    mono(770, 346, 'console.log → stdout', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.5) });
    tx(770, 368, 'JSON 줄 사이에 끼어 프로토콜이 깨진다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) }); }

  // ---------- 3. Tool 등록: 두 핸들러 ----------
  const REG = [['import { ListToolsRequestSchema,', 0], ['         CallToolRequestSchema } from "…/types.js";', 0],
    ['server.setRequestHandler(ListToolsRequestSchema, async () => ({', 1], ['  tools: [{ name: "get_weather",', 2], ['    description: "도시 이름을 받아 현재 날씨를 반환한다",', 2],
    ['    inputSchema: { properties: { city: … }, required: ["city"] } }] }));', 3],
    ['server.setRequestHandler(CallToolRequestSchema, async (req) => {', 4], ['  if (name !== "get_weather") throw new Error(…);', 5], ['  const weather = await fetchWeather(city);', 5],
    ['  return { content: [{ type: "text", text: `${city}: ${weather}` }] };', 6],
    ['const mock = { Seoul: "맑음, 18°C", Tokyo: …, Paris: … };', 7]];
  function s3(t, c) { const { k, u } = c;
    growCode(20, 20, 600, REG, k, u, 'src/register-tools.ts', { ts: true, lh: 21 });
    const X = 790;
    if (k <= 1 || k === 4) { // 스키마 = 어떤 method 를 받을지
      [['ListToolsRequestSchema', 'tools/list', 1], ['CallToolRequestSchema', 'tools/call', 4]].forEach(([s, m, need], i) => { const y = 270 + i * 64, on = k >= need, s0 = k === 0 ? pop(u, 0.4 + i * 0.3) : 1;
        card(300, y, 300, 46, { rx: 8, text: s, fs: 14, mono: true, stroke: on ? ACC : GRID, color: on ? ACC : INK, s: s0 });
        grow(452, y, 560, y, k === 0 ? seg(u, 1.0 + i * 0.3, 1.5 + i * 0.3) : 1, on ? ACC : MUT);
        card(640, y, 150, 46, { rx: 23, text: m, fs: 14.5, mono: true, stroke: on ? ACC : GRID, fill: on ? ACCBG : PANEL, color: on ? ACC : INK, s: k === need ? pop(u, 0.6) : s0 }); });
      if (k === 0) tx(480, 400, '스키마가 곧 "어떤 요청을 받을지"의 열쇠', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      return; }
    if (k === 2 || k === 3) { card(X, 340, 300, 140, { rx: 12, stroke: ACC, sw: 2.5 });
      mono(X - 136, 296, 'get_weather', { 'font-size': 18, 'font-weight': 800, fill: ACC });
      tx(X - 136, 322, '도시 이름을 받아 현재 날씨를', { 'font-size': 13.5, opacity: k === 2 ? fade(u, 0.6) : 1 }); tx(X - 136, 342, '반환한다', { 'font-size': 13.5, opacity: k === 2 ? fade(u, 0.6) : 1 });
      if (k === 3) { el('rect', { x: X - 136, y: 358, width: 272, height: 32, rx: 6, fill: SOFT, stroke: ACC, 'stroke-width': 1.8, opacity: fade(u, 0.6) });
        mono(X - 126, 380, 'city *', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.6) }); tx(X + 126, 380, '예: Seoul', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.9) }); }
      else tx(X - 136, 384, 'Claude는 이것만 보고 고른다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
      tx(330, 330, k === 2 ? '설명이 곧 사용 설명서' : 'required: ["city"]', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0), class: k === 3 ? 'mono' : null }); return; }
    if (k === 5) { codePanel(20, 280, 600, ['{"jsonrpc":"2.0","id":4,', '  "error":{"code":-32603,"message":"unknown tool: get_time"}}'], { fs: 13.5, lh: 20, title: 'tools/call "get_time" → 실제 응답', stroke: BAD });
      note(800, 330, '등록 안 된 이름은 실행 전에 끊는다', fade(u, 1.0), { 'text-anchor': 'middle', fill: BAD }); return; }
    if (k === 6) { codePanel(20, 280, 600, ['{"result":{"content":[{"type":"text",', '  "text":"Seoul: 맑음, 18°C"}]},"jsonrpc":"2.0","id":2}'], { fs: 13.5, lh: 20, title: 'tools/call get_weather {city:"Seoul"} → 실제 응답', stroke: GOOD });
      pill(800, 330, 'Seoul: 맑음, 18°C', GOOD, pop(u, 1.0), { fs: 15 }); return; }
    // k7: mock 표
    const rows = [['Seoul', '맑음, 18°C'], ['Tokyo', '흐림, 22°C'], ['Paris', '비, 12°C'], ['그 밖', '데이터 없음']];
    rows.forEach(([a, b], i) => { const y = 322 + i * 30, s = fade(u, 0.3 + i * 0.25), last = i === 3;
      el('rect', { x: 120, y: y - 20, width: 380, height: 28, rx: 4, fill: last ? WARNBG : i % 2 ? PANEL : SOFT, opacity: s });
      mono(136, y, a, { 'font-size': 14.5, 'font-weight': 700, opacity: s, fill: last ? WARN : INK }); tx(480, y, b, { 'font-size': 14.5, 'text-anchor': 'end', opacity: s, fill: last ? WARN : INK }); });
    note(760, 330, '실제 API 대신 표 세 줄', fade(u, 1.4), { 'text-anchor': 'middle' }); }

  // ---------- 4. stdio: 세 갈래 스트림 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { el('rect', { x: 40, y: 80, width: 260, height: 240, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); mono(56, 106, 'Claude Desktop', { 'font-size': 15, 'font-weight': 800 });
      el('rect', { x: 640, y: 80, width: 280, height: 240, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }); mono(656, 106, 'node dist/server.js', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
      [['stdin', '요청 →', 150, ACC, 1], ['stdout', '← 응답', 210, INFO, -1], ['stderr', '← 로그', 270, MUT, -1]].forEach(([n, d, y, col, dir], i) => { const g = E(u, 0.3 + i * 0.4, 0.9 + i * 0.4);
        el('line', { x1: 300, y1: y, x2: lerp(300, 640, g), y2: y, stroke: col, 'stroke-width': 4, 'stroke-dasharray': i === 2 ? '6 5' : null });
        mono(470, y - 10, n + '  ' + d, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: g });
        if (g >= 1) dot(dir > 0 ? [[300, y], [640, y]] : [[640, y], [300, y]], (t * 0.5 + i * 0.3) % 1, col, 5); });
      note(480, 370, 'Claude Desktop이 서버 프로세스를 띄운다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k <= 3) { // 실제 줄
      const L = [['> {"jsonrpc":"2.0","method":"tools/list","id":1}', null], ['< {"result":{"tools":[{"name":"get_weather",…}]},"id":1}', 'var(--term)'],
        ['> {"jsonrpc":"2.0","method":"tools/call","params":', null], ['    {"name":"get_weather","arguments":{"city":"Seoul"}},"id":2}', null],
        ['< {"result":{"content":[{"type":"text",', 'var(--term)'], ['    "text":"Seoul: 맑음, 18°C"}]},"jsonrpc":"2.0","id":2}', 'var(--term)']];
      const n = k === 1 ? 2 : k === 2 ? 4 : 6, prev = k === 1 ? 0 : k === 2 ? 2 : 4;
      terminal(30, 30, 900, 260, L.slice(0, n), prev + (n - prev) * E(u, 0.2, 1.6), { title: 'stdin(>) / stdout(<) 실제 기록', fs: 14, lh: 28 });
      const msg = ['', 'id 1로 요청과 응답이 짝을 이룬다', 'params에 도구 이름과 city 인자', 'register-tools에서 만든 그 content 형식'][k];
      note(480, 350, msg, fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { // 갈아 끼우는 Transport
      card(480, 90, 260, 60, { rx: 10, text: 'server.ts (그대로)', fs: 16, mono: true, stroke: ACC, color: ACC });
      [['StdioServerTransport', '로컬 Claude Desktop', ACC], ['SSEServerTransport', '원격 (옛 HTTP+SSE)', INFO], ['StreamableHTTPServerTransport', '원격 (2025-03-26~)', INFO]].forEach(([n, d, col], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.35);
        card(x, 260, 290, 74, { rx: 10, stroke: col, sw: 2, s, dash: i ? '6 5' : null }); mono(x, 254, n, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s });
        tx(x, 278, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); grow(480, 122, x, 222, seg(u, 0.6 + i * 0.35, 1.1 + i * 0.35), MUT); });
      note(480, 370, 'connect(transport)의 인자만 바뀐다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    codePanel(140, 90, 680, ['const transport = new StdioServerTransport();', 'await server.connect(transport);'], { ts: true, fs: 17, lh: 32, title: '실제 코드', stroke: ACC, shown: E(u, 0.2, 1.2) * 2 });
    ['JSON 직렬화', '줄 나누기', 'id 짝 맞추기'].forEach((s, i) => pill(260 + i * 220, 280, s, MUT, pop(u, 1.3 + i * 0.25), { fs: 14.5 }));
    tx(480, 340, '나머지는 SDK가 한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }

  // ---------- 5. Claude Desktop 에 등록하고 불러 본다 ----------
  const CFG = ['{', '  "mcpServers": {', '    "weather": {', '      "command": "node",', '      "args": ["/Users/me/dev/weather-mcp-server/dist/server.js"],', '      "env": { "WEATHER_API_KEY": "sk-xxxxx" }', '    }', '  }', '}'];
  function desk(x, y, w, h) { el('rect', { x, y, width: w, height: h, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: INK, 'stroke-width': 2 });
    [0, 14, 28].forEach((d) => el('circle', { cx: x + 16 + d, cy: y + 15, r: 4.5, fill: OFF })); tx(x + w / 2, y + 20, 'Claude Desktop', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['macOS', '~/Library/Application Support/Claude/'], ['Windows', '%APPDATA%/Claude/']].forEach(([os, p], i) => { const y = 110 + i * 110, s = pop(u, 0.3 + i * 0.4);
        card(480, y, 760, 80, { rx: 12, stroke: GRID, sw: 2, s }); tx(120, y - 8, os, { 'font-size': 16, 'font-weight': 800, opacity: s });
        mono(120, y + 20, p, { 'font-size': 15, opacity: s }); mono(120 + tw(p, 15), y + 20, 'claude_desktop_config.json', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: s }); });
      note(480, 360, 'MCP 설정은 이 파일 하나', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    if (k <= 3) { const hi = k === 1 ? [1, 2, 3] : k === 2 ? [4] : [5];
      codePanel(20, 30, 620, CFG, { fs: 13.5, lh: 21, title: 'claude_desktop_config.json', stroke: ACC, hi, shown: k === 1 ? 1 + E(u, 0.2, 1.2) * 8 : 9 });
      if (k === 1) note(800, 120, '"weather" = 화면에 뜰 이름', fade(u, 1.4), { 'text-anchor': 'middle' });
      if (k === 2) { card(800, 300, 280, 44, { rx: 8, text: '…/dist/server.js', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.4) }); check(950, 300, 10, pop(u, 0.6));
        card(800, 360, 280, 44, { rx: 8, text: './src/server.ts', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.9) }); cross(950, 360, 10, pop(u, 1.1));
        tx(800, 270, '빌드 결과 · 절대 경로', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); }
      if (k === 3) { el('rect', { x: 660, y: 270, width: 280, height: 110, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2.2 }); mono(676, 294, 'server 프로세스 env', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
        fly(500, 170, 800, 340, seg(u, 0.4, 1.4), 'WEATHER_API_KEY', { mono: true, stay: true }); lock(905, 300, true, WARN, pop(u, 1.5));
        tx(800, 410, '키는 코드가 아니라 설정에', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) }); }
      return; }
    desk(40, 30, 560, 370);
    if (k === 4) { // 재시작 후 도구 메뉴
      const on = u > 1.0; mono(320, 100, on ? '다시 켰다' : 'Cmd+Q로 완전히 종료', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? GOOD : MUT });
      el('rect', { x: 70, y: 340, width: 500, height: 40, rx: 20, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
      if (on) { el('rect', { x: 330, y: 200, width: 240, height: 130, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.2) });
        tx(346, 226, '도구', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
        mono(346, 260, 'weather', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); mono(366, 290, '└ get_weather', { 'font-size': 14, opacity: fade(u, 1.6) }); }
      note(780, 200, '설정은 시작할 때만 읽는다', fade(u, 0.5), { 'text-anchor': 'middle' }); return; }
    // k5 이후: 대화 메시지 목록
    const MS = [['user', '서울 날씨 알려줘', INK], ['tool_use', 'get_weather({ city: "Seoul" })', ACC], ['tool_result', 'Seoul: 맑음, 18°C', GOOD]];
    MS.forEach(([r, s, col], i) => { const y = 80 + i * 78, sc = k === 5 ? pop(u, 0.3 + i * 0.55) : 1;
      card(i === 0 ? 400 : 290, y + 20, 360, 52, { rx: 12, stroke: col, sw: 2, s: sc, fill: i === 0 ? SOFT : PANEL });
      mono(i === 0 ? 236 : 126, y + 12, r, { 'font-size': 13.5, fill: MUT, opacity: sc }); tx(i === 0 ? 236 : 126, y + 34, s, { 'font-size': 15, 'font-weight': 700, class: i ? 'mono' : null, fill: col, opacity: sc }); });
    tx(80, 360, 'assistant: 서울은 맑고 18°C입니다. (예시)', { 'font-size': 14.5, fill: MUT, opacity: k === 5 ? fade(u, 2.0) : 1 });
    if (k === 5) { note(780, 160, 'Claude가 스스로 tools/call', fade(u, 1.0), { 'text-anchor': 'middle' }); return; }
    // k6: 도시 이름이 스키마 예시를 따라야 하는 이유
    [['city: "Seoul"', 'Seoul: 맑음, 18°C', GOOD], ['city: "서울"', REAL.seoulKo, WARN]].forEach(([a, b, col], i) => { const y = 120 + i * 120, s = pop(u, 0.3 + i * 0.4);
      card(780, y, 300, 90, { rx: 12, stroke: col, sw: 2.2, s }); mono(645, y - 12, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); tx(645, y + 20, '→ ' + b, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: s }); });
    tx(780, 360, '설명의 "(예: Seoul)"이 인자를 이끈다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'package.json에 "type": "module"을 넣는 이유는 무엇인가?',
      o: ['MCP 서버로 등록되기 위해', 'import 문법(ESM)을 쓰기 위해', 'Claude Desktop이 bin을 찾게 하기 위해'], a: 1,
      why: 'type: module이어야 .js 파일에서 import를 쓸 수 있다. 실행 진입점은 따로 bin이 dist/server.js를 가리킨다.' },
    { q: 'stdio로 도는 MCP 서버에서 디버그 로그를 찍을 때 써야 하는 것은 무엇인가?',
      o: ['console.error', 'console.log', 'process.stdout.write'], a: 0,
      why: 'stdout은 JSON-RPC 줄이 지나는 길이다. 로그는 stderr로 보내야 하고, 실제로 "[weather-mcp] server started on stdio"는 stderr에 찍혔다.' },
    { q: 'tools/list와 tools/call 요청을 각각 어느 함수가 받을지 정하는 것은 무엇인가?',
      o: ['tools 배열에 적은 도구 이름 get_weather', 'package.json의 scripts 항목', 'setRequestHandler에 넘긴 두 요청 스키마'], a: 2,
      why: '두 스키마가 method를 가리키는 열쇠다. 각 스키마에 핸들러를 하나씩 걸어 목록과 실행을 나눈다.' },
    { q: '서버를 원격 HTTP로 돌리려면 server.ts에서 무엇을 바꾸나?',
      o: ['connect에 넘기는 Transport 객체', '도구 등록 코드 전체', 'Server의 name'], a: 0,
      why: 'Server와 도구 핸들러는 그대로 두고 StdioServerTransport 대신 HTTP 계열 Transport를 connect에 넘기면 된다.' },
    { q: 'claude_desktop_config.json을 고친 뒤 weather가 보이지 않는다. 가장 먼저 할 일은?',
      o: ['Claude Desktop을 완전히 종료했다가 다시 켠다', 'zod를 다시 설치한다', 'tools/list 응답에 id를 추가한다'], a: 0,
      why: '설정은 시작할 때만 읽는다. Cmd+Q처럼 완전히 끝냈다가 켜야 도구 메뉴에 weather가 나타난다.' },
  ];
  const summary = [
    'type: module과 MCP SDK, zod만 갖추면 TypeScript MCP 서버를 시작할 수 있다.',
    'new Server에 name·version과 capabilities를 넣으면 initialize 응답에 그대로 실린다.',
    'tools/list와 tools/call 핸들러 두 개가 도구 목록과 실행을 맡고, 결과는 content 배열이다.',
    'stdout은 JSON 전용이라 로그는 stderr로 보내고, Claude Desktop에는 dist 절대 경로로 등록한다.',
  ];
  const review = [
    { q: '서버를 등록했는데 Claude Desktop 로그에 JSON 파싱 오류가 계속 난다. 코드에서 먼저 찾아볼 것은?',
      o: ['console.log로 찍은 디버그 출력', 'inputSchema의 required 배열', 'package.json의 version'], a: 0,
      why: 'stdio에서는 stdout 한 줄이 JSON 메시지 하나다. console.log가 그 사이에 끼면 Client가 읽다가 깨진다.' },
    { q: '"서울 날씨"를 물었더니 "서울: 데이터 없음"이 왔다. 원인으로 가장 그럴듯한 것은?',
      o: ['stdio 연결이 끊겼다', 'city 인자가 "서울"로 와서 영어 키 Seoul과 맞지 않았다', 'capabilities에 tools가 빠졌다'], a: 1,
      why: '도구는 정상 호출됐고 결과도 왔다. mock 표의 키가 영어라 한글 도시명은 "데이터 없음"으로 떨어진다.' },
    { q: 'args에 "./src/server.ts"를 적었더니 서버가 뜨지 않는다. 고칠 방향은?',
      o: ['env에 API 키를 더 넣는다', 'command를 npx로 바꾼다', 'tsc로 빌드한 dist/server.js의 절대 경로를 적는다'], a: 2,
      why: '이 프로젝트의 실행 대상은 tsc가 만든 dist/server.js이고, 상대 경로는 Claude Desktop이 어느 폴더에서 띄우느냐에 따라 어긋난다.' },
  ];

  R.page({ title: 'weather MCP Server 만들기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
