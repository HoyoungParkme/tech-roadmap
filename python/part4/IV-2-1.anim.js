/* IV-2-1 requests로 API 호출 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽 파이썬(요청 조각 dict), 가운데 실제로 나가는 HTTP 메시지 종이, 오른쪽 서버.
 * 출력 값: requests 2.34·urllib3 2.8 로 직접 확인한 것(준비된 URL·바디·헤더, 로컬 서버로 잰 연결 수·재시도 간격).
 * api.example.com 의 응답 값(42, 1024, 137, "회의록")은 페이지의 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, fly, dot, cells, zone, cross, check, lock, snippet, spans, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // HTTP 메시지 종이: lines [[text, color, op]]
  function msg(x, y, w, h, title, lines, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash });
    el('rect', { x, y, width: w, height: 28, rx: 8, fill: o.head || SOFT, stroke: 'none' }); el('line', { x1: x, y1: y + 28, x2: x + w, y2: y + 28, stroke: o.stroke || INK, 'stroke-width': 1.5 });
    tx(x + 12, y + 19, title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    lines.forEach(([s, col, op], i) => { if ((op ?? 1) <= 0.02) return; mono(x + 14, y + 52 + i * 26, s, { 'font-size': o.fs || 14.5, fill: col || INK, opacity: op ?? 1, 'font-weight': col ? 700 : 400 }); }); }
  function kv(x, y, name, rows, o) { o = o || {}; const w = o.w || 300;
    el('rect', { x, y, width: w, height: rows.length * 32 + 36, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    if (o.hi != null) el('rect', { x: x + 6, y: y + 33 + o.hi * 32, width: w - 12, height: 28, rx: 6, fill: ACCBG, opacity: o.hiOp ?? 1 });
    mono(x + 12, y + 22, name, { 'font-size': 14.5, 'font-weight': 800, opacity: o.op ?? 1 });
    rows.forEach(([k, v], i) => { mono(x + 16, y + 52 + i * 32, k, { 'font-size': 14.5, fill: INFO, opacity: o.op ?? 1 }); mono(x + (o.kw || 120), y + 52 + i * 32, v, { 'font-size': 14.5, opacity: o.op ?? 1 }); }); }
  const SRV = [860, 150];
  function srv(o) { o = o || {}; server(SRV[0], SRV[1], 'api.example.com', { lamp: o.lamp || OFF, stroke: o.stroke }); }

  // ---------- 1. GET 요청 조립 ----------
  function s1(t, c) { const { k, u } = c; srv({ lamp: k === 5 ? GOOD : k === 4 && u > 1 ? BAD : OFF });
    const parts = { line: k >= 2, q: k >= 3, acc: k >= 3 };
    if (k >= 1 && k <= 3) { kv(20, 40, 'params', [['"q"', '"python"'], ['"page"', '2']], { w: 280, kw: 110, op: k === 1 ? fade(u, 0.2) : 1 }); kv(20, 170, 'headers', [['"Accept"', '"application/json"']], { w: 280, kw: 110, op: k === 1 ? fade(u, 0.6) : 1 }); }
    if (k === 0) { pill(160, 90, 'import requests', ACC, pop(u, 0.2), { mono: true, fs: 15 }); sub(160, 130, '외부 패키지 · pip install requests', fade(u, 0.5), { 'font-size': 14.5 });
      msg(340, 60, 400, 200, '나갈 HTTP 요청', [['(아직 요청을 만들지 않음)', MUT]], { dash: '6 5', stroke: OFF });
      sub(540, 310, '요청은 조각(메서드·URL·쿼리·헤더·timeout)을 모아 만든다', fade(u, 1.2), { 'font-size': 15, fill: INK }); return; }
    if (k <= 3) { const ql = k === 3 ? '?q=python&page=2' : '', g = k === 3 ? E(u, 0.4, 1.2) : 1;
      const line = 'GET /search' + ql.slice(0, Math.round(ql.length * g)) + ' HTTP/1.1';
      msg(340, 60, 440, 200, '나갈 HTTP 요청', [[line, k === 3 ? ACC : null, k === 2 ? fade(u, 0.3) : 1], ['Host: api.example.com', null, k === 2 ? fade(u, 0.6) : 1], ['Accept: application/json', ACC, k === 3 ? fade(u, 1.3) : 0], ['(timeout 아직 없음)', MUT, k >= 2 ? fade(u, 1.0) : 0]], { stroke: k >= 2 ? INK : OFF, dash: k < 2 ? '6 5' : null });
      if (k === 1) { tx(340, 300, '아직 URL 에 붙지 않은 재료 두 개', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); sub(540, 336, '숫자 2 도 문자열로 바꿀 필요가 없다', fade(u, 1.6), { 'font-size': 14.5 }); }
      if (k === 2) { pill(560, 300, 'requests.get(url, ...)', INK, pop(u, 0.2), { mono: true, fs: 14.5 }); sub(560, 340, '응답이 올 때까지 이 줄에서 멈춘다', fade(u, 1.4), { 'font-size': 14.5 }); }
      if (k === 3) { dot([[300, 80], [520, 112]], seg(u, 0.2, 0.9), ACC, 7); dot([[300, 210], [400, 164]], seg(u, 0.9, 1.4), ACC, 7);
        mono(340, 300, 'params={"q": "파이썬 입문"} 이면', { 'font-size': 14.5, opacity: fade(u, 1.7) });
        mono(340, 328, '?q=%ED%8C%8C%EC%9D%B4%EC%8D%AC+%EC%9E%85%EB%AC%B8', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 2.0) });
        sub(560, 360, '한글·공백도 알아서 퍼센트 인코딩 (직접 확인)', fade(u, 2.2), { 'font-size': 14 }); }
      return; }
    if (k === 4) { msg(30, 40, 420, 150, '나갈 HTTP 요청', [['GET /search?q=python&page=2', ACC], ['Accept: application/json', ACC], ['timeout=(3, 10)', WARN, fade(u, 0.2)]]);
      const f1 = E(u, 0.3, 0.9), f2 = E(u, 0.9, 2.3);
      R.clock(560, 110, 34, f1 * 0.3, GOOD, '연결 3s'); R.clock(680, 110, 34, f2, f2 > 0.98 ? BAD : WARN, '읽기 10s');
      if (u > 0.9) mono(SRV[0], 60, 'zzz…', { 'font-size': 16, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle' });
      sub(560, 184, '연결은 됐다', fade(u, 0.9), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); sub(680, 184, '응답이 멈췄다', fade(u, 1.3), { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      card(560, 270, 420, 50, { rx: 10, stroke: BAD, sw: 2.2, s: pop(u, 2.3), text: 'requests.Timeout → 스레드가 풀려난다', fs: 15, color: BAD });
      tx(30, 270, 'timeout 을 빼면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); mono(30, 300, '기본값 None = 무한 대기', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      sub(480, 370, 'timeout 은 전체 시간이 아니라 아무 진전이 없는 시간의 상한이다', fade(u, 2.5), { 'font-size': 14 }); return; }
    // k5 보내고 확인
    msg(30, 40, 420, 150, '나간 HTTP 요청', [['GET /search?q=python&page=2', ACC], ['Accept: application/json', ACC], ['timeout=(3, 10)', WARN]]);
    dot([[450, 110], [SRV[0] - 60, 110]], seg(u, 0.2, 0.9), ACC, 7); dot([[SRV[0] - 60, 180], [450, 180]], seg(u, 1.0, 1.6), GOOD, 7);
    pill(650, 200, '200 OK', GOOD, pop(u, 1.4), { mono: true, fs: 15 });
    mono(30, 260, 'print(r.url)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
    mono(30, 290, '→ https://api.example.com/search?q=python&page=2', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
    sub(480, 350, 'r.url 은 실제로 나간 주소 · 이 값은 requests 로 직접 만들어 확인했다', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 2. 응답 다루기 ----------
  const CASES = [['200', 'True', '통과', GOOD], ['401', 'False', '401 Client Error: Unauthorized', BAD], ['500', 'False', '500 Server Error: Internal Server Error', BAD]];
  function lanes(k, u, col3) { CASES.forEach(([code, ok, rs, col], i) => { const y = 90 + i * 90;
      card(120, y, 150, 56, { rx: 10, stroke: col, sw: 2.2, fill: PANEL, text: 'r.status_code\n' + code, fs: 14.5, mono: true, color: col });
      if (col3) col3(i, y, code, ok, rs, col); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { CASES.forEach(([code, , , col], i) => { const y = 90 + i * 90, g = E(u, 0.2 + i * 0.3, 0.9 + i * 0.3);
        card(lerp(820, 120, g), y, 150, 56, { rx: 10, stroke: col, sw: 2.2, text: 'HTTP ' + code, fs: 16, mono: true, color: col });
        if (g > 0.98) { check(240, y, 11, pop(u, 1.0 + i * 0.3)); tx(262, y + 6, 'r = requests.get(...) 통과', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.3) }); } });
      sub(560, 380, '에러 응답이어도 예외가 나지 않는다 · 응답을 받았다는 사실만 알려 준다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { lanes(k, u, (i, y, code, ok, rs, col) => { mono(240, y + 6, 'r.ok →', { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.3) }); mono(330, y + 6, ok, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.3) }); });
      zone(500, 60, 420, 250, '로컬 서버로 직접 확인한 r.ok', { op: fade(u, 1.2) });
      [['200', 'True'], ['301', 'True  ← 3xx 도 True'], ['401', 'False'], ['404', 'False'], ['500', 'False']].forEach(([a, b], i) => mono(530, 116 + i * 36, a + '  →  ' + b, { 'font-size': 15, fill: b.startsWith('True') ? GOOD : BAD, opacity: fade(u, 1.4 + i * 0.15) }));
      sub(480, 360, 'r.ok = status_code < 400', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { lanes(k, u, (i, y, code, ok, rs, col) => { mono(220, y + 6, 'raise_for_status()', { 'font-size': 15, opacity: fade(u, 0.2) });
        if (i === 0) { grow(400, y, 470, y, E(u, 0.5, 0.9), GOOD); tx(480, y + 6, '다음 줄로', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) }); }
        else { el('path', { d: `M410,${y - 18} l-12,18 h10 l-8,18`, fill: 'none', stroke: BAD, 'stroke-width': 3.2, opacity: fade(u, 0.7 + i * 0.4) }); mono(430, y + 6, 'HTTPError: ' + rs, { 'font-size': 13.5, fill: BAD, opacity: fade(u, 0.8 + i * 0.4) }); } });
      sub(480, 380, '이 한 줄이 조용한 실패를 시끄러운 실패로 바꾼다 (메시지는 직접 실행 결과)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { msg(30, 50, 400, 110, '200 응답 바디 (예시)', [['{"items": [], "total": 42}', null]]);
      grow(440, 105, 520, 105, E(u, 0.4, 0.8), GOOD); mono(540, 98, 'data = r.json()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(540, 124, 'data["total"] → 42', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
      msg(30, 200, 400, 110, '500 응답 바디', [['<html>error</html>', BAD]], { stroke: BAD });
      grow(440, 255, 520, 255, E(u, 1.4, 1.8), BAD); mono(540, 248, 'r.json()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); mono(540, 274, '→ JSONDecodeError', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
      sub(480, 370, 'JSON 이 아닌 바디면 예외 · ValueError 의 한 종류다 (직접 확인)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4) { msg(480, 70, 420, 120, 'r.headers', [['Content-Type: application/json', ACC]]);
      [['r.headers["Content-Type"]', 110], ['r.headers["content-type"]', 200]].forEach(([s, y], i) => { mono(40, y, s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.6) }); grow(310, y - 5, 490, 125, E(u, 0.6 + i * 0.6, 1.1 + i * 0.6), ACC); });
      pill(250, 290, '같은 값 → application/json', GOOD, pop(u, 1.8), { mono: true, fs: 14.5 });
      sub(660, 260, '대소문자를 가리지 않는 dict', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(660, 292, 'Content-Type 을 보고 json() 을 부를지 정한다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k5 text vs content
    [['r.text', 'str', "'{\"items\": [], ...'", INFO], ['r.content', 'bytes', "b'{\"items\": [], ...'", WARN]].forEach(([a, ty, v, col], i) => { const y = 90 + i * 110;
      mono(40, y, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.6) }); pill(220, y - 6, ty, col, pop(u, 0.5 + i * 0.6), { mono: true, fs: 15 });
      mono(290, y, v, { 'font-size': 15, fill: col, opacity: fade(u, 0.7 + i * 0.6) }); });
    cells(290, 230, ['7B', '22', '69', '74', '…'], { w: 46, h: 36, gap: 4, fs: 14.5, style: () => ({ stroke: WARN, color: WARN, op: fade(u, 1.5) }) });
    sub(480, 330, '글자로 읽을 때는 text, 이미지·파일을 받을 때는 content', fade(u, 2.0), { 'font-size': 15, fill: INK }); }

  // ---------- 3. POST ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { zone(20, 30, 290, 150, '환경 변수 (OS)', { fill: WARNBG }); mono(40, 100, 'API_TOKEN=●●●●●●', { 'font-size': 16, 'font-weight': 800 }); lock(250, 94, true, WARN);
      dot([[200, 120], [400, 120]], seg(u, 0.3, 0.9), WARN, 7);
      card(560, 105, 380, 48, { rx: 8, stroke: ACC, sw: 2, s: pop(u, 0.9), text: 'Authorization: Bearer ●●●●●●', fs: 15, mono: true, color: ACC });
      fileDoc2(160, 300, 'post_auth.py', fade(u, 1.4)); check(230, 280, 11, pop(u, 1.8)); tx(260, 286, '소스에는 비밀이 없다 → 깃에 남지 않는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      mono(560, 200, 'os.environ["API_TOKEN"]', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); sub(560, 230, '없으면 KeyError 로 바로 멈춘다', fade(u, 1.2), { 'font-size': 14 }); return; }
    if (k === 1) { kv(40, 60, 'payload', [['"title"', '"회의록"'], ['"done"', 'False']], { w: 320, kw: 120, hi: 1, hiOp: fade(u, 1.0) });
      tx(420, 110, '아직 파이썬 값이다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) }); tx(420, 146, 'json.dumps 를 손으로 부르지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { kv(20, 40, 'payload', [['"title"', '"회의록"'], ['"done"', 'False']], { w: 300, kw: 110 });
      pill(400, 80, 'json=payload', ACC, pop(u, 0.2), { mono: true, fs: 15 });
      msg(470, 40, 470, 130, '실제 바디 (직접 만들어 확인)', [['Content-Type: application/json', ACC, fade(u, 0.7)], ['{"title": "\\ud68c\\uc758\\ub85d",', null, fade(u, 1.0)], [' "done": false}', ACC, fade(u, 1.2)]], { fs: 14 });
      sub(705, 196, '한글은 \\uXXXX 로, False 는 false 로', fade(u, 1.4), { 'font-size': 14 });
      [['data=json.dumps(payload)', 'Content-Type 없음', BAD], ['data=payload', 'form-urlencoded: title=%ED…&done=False', WARN]].forEach(([a, b, col], i) => { const y = 260 + i * 46;
        mono(30, y, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7 + i * 0.3) }); mono(330, y, '→ ' + b, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 1.9 + i * 0.3) }); }); return; }
    if (k === 3) { msg(40, 40, 520, 230, '나갈 HTTP 요청', [['POST /todos HTTP/1.1', INK], ['Content-Type: application/json', ACC], ['Authorization: Bearer ●●●●●●', WARN, fade(u, 0.4)], [''], ['{"title": "\\ud68c…", "done": false}', null]]);
      R.clock(670, 120, 40, E(u, 0.8, 2.4), WARN, 'timeout=10'); srv();
      sub(660, 250, 'POST 도 timeout 규칙은 같다', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(300, 330, '같은 POST 를 두 번 보내면 데이터가 두 번 생길 수 있다 · 재시도는 조심', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 4) { srv({ lamp: BAD }); card(640, 150, 140, 50, { rx: 10, stroke: BAD, sw: 2.2, text: '401', fs: 18, mono: true, color: BAD, s: pop(u, 0.3) });
      dot([[SRV[0] - 60, 150], [640, 150]], seg(u, 0.1, 0.4), BAD, 7);
      snippet(30, 50, ['r.raise_for_status()', '', 'print(r.status_code)', 'print(r.json()["id"])'], { w: 420, fs: 15 });
      el('path', { d: 'M470,70 l-12,18 h10 l-8,18', fill: 'none', stroke: BAD, 'stroke-width': 3.2, opacity: fade(u, 0.7) });
      mono(30, 210, 'HTTPError: 401 Client Error: Unauthorized', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) });
      el('rect', { x: 32, y: 104, width: 416, height: 52, fill: PANEL, opacity: 0.7 * fade(u, 1.2) });
      sub(240, 270, '아래 줄은 실행되지 않는다 · 만들어진 줄 아는 사고를 막는다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    srv({ lamp: GOOD }); dot([[SRV[0] - 60, 150], [560, 150]], seg(u, 0.1, 0.6), GOOD, 7);
    msg(140, 60, 400, 160, '응답 (예시)', [['HTTP/1.1 201 Created', GOOD, fade(u, 0.5)], ['{"id": 1024,', null, fade(u, 0.8)], [' "title": "회의록", "done": false}', null, fade(u, 0.9)]]);
    mono(140, 280, 'r.status_code → 201', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) }); mono(140, 316, 'r.json()["id"] → 1024', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) });
    sub(700, 300, '생성 성공은 보통 201 + 새 id', fade(u, 2.1), { 'font-size': 15, fill: INK }); }
  function fileDoc2(cx, cy, name, op) { const x = cx - 50, y = cy - 50;
    el('path', { d: `M${x},${y} H${x + 82} L${x + 100},${y + 18} V${y + 100} H${x} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
    [0.7, 0.5, 0.8].forEach((w, i) => el('rect', { x: x + 12, y: y + 30 + i * 18, width: 70 * w, height: 7, rx: 3, fill: OFF, opacity: op }));
    mono(cx, y + 122, name, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); }

  // ---------- 4. Session · Retry · 페이지 ----------
  function handshake(x, y, col) { el('rect', { x, y: y - 12, width: 62, height: 24, rx: 5, fill: col === BAD ? BADBG : WARNBG, stroke: col, 'stroke-width': 1.6 }); mono(x + 31, y + 5, '연결', { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }); }
  function req(x, y) { el('rect', { x, y: y - 12, width: 70, height: 24, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 1.6 }); mono(x + 35, y + 5, 'GET', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['requests.Session', '요청을 보내는 쪽', INK], ['HTTPAdapter', '커넥션 풀 · 재시도를 붙이는 자리', INFO], ['urllib3 Retry', '재시도 규칙 (requests 아래 계층)', WARN]].forEach(([a, b, col], i) => { const y = 80 + i * 86;
        card(300, y, 400, 64, { rx: 10, stroke: col, sw: 2.2, s: pop(u, 0.2 + i * 0.4) }); mono(120, y + 6, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) });
        tx(560, y + 6, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); if (i) grow(300, y - 54, 300, y - 34, fade(u, 0.3 + i * 0.4), MUT); });
      sub(480, 360, 'urllib3 는 requests 와 함께 설치된다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { tx(40, 60, '같은 서버에 GET 3번 (로컬 서버로 잰 연결 수)', { 'font-size': 15.5, 'font-weight': 700 });
      [['requests.get × 3', 3, BAD], ['session.get × 3', 1, GOOD]].forEach(([a, n, col], i) => { const y = 130 + i * 120;
        mono(40, y + 5, a, { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.2 + i * 0.8) });
        for (let j = 0; j < 3; j++) { const x = 260 + j * 180, at = 0.3 + i * 0.8 + j * 0.2; if (u < at) continue;
          if (j < n) handshake(x, y, col === BAD ? BAD : WARN); req(x + (j < n ? 70 : 0), y); }
        pill(860, y, '연결 ' + n + '개', col, pop(u, 0.9 + i * 0.8), { fs: 15 }); });
      sub(480, 370, 'Session 은 연결을 풀에 두고 재사용한다 · 공통 헤더도 한 번만 심는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { snippet(30, 40, ['Retry(total=3, backoff_factor=0.5,', '      status_forcelist=[502, 503, 504])'], { w: 520, fs: 14.5 });
      tx(40, 150, '실패 뒤 기다리는 시간 (urllib3 2.8 로 계산)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      [['1번째 재시도', 0], ['2번째 재시도', 1.0], ['3번째 재시도', 2.0]].forEach(([a, v], i) => { const y = 180 + i * 44;
        tx(40, y + 14, a, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.3) }); R.hbar(180, y, 300, v * E(u, 0.6 + i * 0.3, 1.2 + i * 0.3), 2, { h: 20, col: WARN, label: false });
        mono(500, y + 15, v ? v.toFixed(1) + 's' : '0s (바로)', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9 + i * 0.3) }); });
      ['502', '503', '504'].forEach((s, i) => pill(660 + i * 90, 200, s, WARN, pop(u, 1.4 + i * 0.15), { mono: true, fs: 15 }));
      ['400', '401'].forEach((s, i) => { pill(705 + i * 90, 270, s, OFF, pop(u, 1.9), { mono: true, fs: 15 }); });
      sub(750, 160, '재시도 대상', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); sub(750, 310, '4xx 는 다시 보내도 같다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 3) { snippet(30, 36, ['session.mount("https://", HTTPAdapter(max_retries=retry))'], { w: 600, fs: 14.5 });
      tx(40, 130, '로컬 서버가 503, 503, 200 을 주게 해서 직접 잰 흐름', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      const x0 = 80, sx = 300, ev = [[0, '503', BAD], [0.0, '503', BAD], [1.0, '200', GOOD]];
      el('line', { x1: x0, y1: 240, x2: 880, y2: 240, stroke: INK, 'stroke-width': 2 });
      [0, 1, 2].forEach((s) => mono(x0 + s * sx, 266, s + 's', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }));
      let tt = 0; ev.forEach(([gap, code, col], i) => { tt += gap; const x = x0 + tt * sx, at = 0.4 + i * 0.6, top = i === 1 ? 140 : 180;
        el('line', { x1: x, y1: 240, x2: x, y2: lerp(240, top + 14, E(u, at, at + 0.3)), stroke: col, 'stroke-width': 3 });
        pill(x + (i === 1 ? 60 : 0), top, i === 1 ? code + ' (0.0s 뒤)' : code, col, pop(u, at + 0.2), { mono: true, fs: 14.5 }); });
      mono(x0 + 2, 310, '간격 0.0s → 1.0s, 세 번째에 200 (session.get 은 200 하나만 돌려준다)', { 'font-size': 14, opacity: fade(u, 2.2) }); return; }
    // k4·k5 페이지네이션
    const pages = [['page=1', '50'], ['page=2', '50'], ['page=3', '37']], n = k === 4 ? Math.floor(E(u, 0.2, 2.2) * 3.99) : 3;
    pages.forEach(([p, cnt], i) => { const x = 150 + i * 280, s = i < n ? 1 : 0.25;
      card(x, 120, 200, 110, { rx: 10, stroke: i < n ? ACC : OFF, sw: 2, op: s });
      mono(x - 86, 92, '?' + p, { 'font-size': 15, 'font-weight': 800, opacity: s });
      mono(x - 86, 124, 'results: ' + cnt + '건', { 'font-size': 14.5, opacity: s }); mono(x - 86, 154, i < 2 ? 'next: ?page=' + (i + 2) : 'next: None', { 'font-size': 14.5, fill: i < 2 ? ACC : BAD, opacity: s });
      if (i < 2) grow(x + 102, 120, x + 176, 120, i < n - 1 ? 1 : 0, ACC); });
    tx(40, 36, '예시 응답 세 쪽', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    if (k === 4) { mono(40, 250, 'while url:', { 'font-size': 15, 'font-weight': 700 }); mono(60, 278, 'r = session.get(url, timeout=10); r.raise_for_status()', { 'font-size': 14.5 });
      mono(60, 306, 'url = body.get("next")   # 없으면 None → 끝', { 'font-size': 14.5, fill: MUT }); return; }
    const g = E(u, 0.2, 1.6); el('rect', { x: 40, y: 250, width: 700 * g, height: 30, rx: 6, fill: ACC, opacity: 0.8 });
    [50, 100].forEach((v) => el('line', { x1: 40 + 700 * v / 137, y1: 246, x2: 40 + 700 * v / 137, y2: 284, stroke: PANEL, 'stroke-width': 3, opacity: g > v / 137 ? 1 : 0 }));
    mono(760, 272, 'len(items) → ' + Math.round(137 * g), { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) });
    sub(480, 330, 'items.extend 로 쌓다가 next 가 None 이면 while 이 끝난다 (예시: 50+50+37)', fade(u, 1.8), { 'font-size': 14.5 }); }

  // ---------- 5. 견고한 호출 함수 ----------
  const SH = [['① timeout', 'timeout=(3, 10)'], ['② raise', 'raise_for_status()'], ['③ Session', '연결 재사용'], ['④ 비밀', '환경 변수 토큰']];
  function shields(on, u, hot) { SH.forEach(([a, b], i) => { const y = 60 + i * 74, lit = on[i];
      card(800, y, 250, 58, { rx: 10, stroke: lit ? GOOD : GRID, sw: lit ? 2.4 : 1.5, fill: lit ? GOODBG : PANEL, s: hot === i ? pop(u, 0.3) : 1 });
      tx(690, y - 4, a, { 'font-size': 15, 'font-weight': 800, fill: lit ? GOOD : MUT }); mono(690, y + 18, b, { 'font-size': 13.5, fill: lit ? INK : MUT }); }); }
  function s5(t, c) { const { k, u } = c;
    const on = [k >= 2, k >= 3, true, true];
    shields(k === 0 ? [false, false, u > 0.6, u > 1.0] : on, u, k === 2 ? 0 : k === 3 ? 1 : null);
    if (k === 0) { snippet(30, 40, ['session = requests.Session()', 'session.headers["Authorization"] = ...', "    # f\"Bearer {os.environ['API_TOKEN']}\""], { w: 560, fs: 14.5 });
      tx(40, 200, '모듈을 불러올 때 한 번만 만든다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(300, 240, '이후 모든 호출이 재사용과 인증을 그대로 얻는다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    zone(20, 30, 600, 330, 'def fetch_todo(todo_id: int) -> dict:', { stroke: INK, fill: PANEL, op: k === 1 ? fade(u, 0.2) : 1 });
    if (k === 1) { mono(50, 96, '"""견고한 GET — timeout·raise·예외처리 포함"""', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      zone(40, 120, 560, 220, 'try:', { stroke: INFO, dash: '6 5', fill: INFOBG, op: fade(u, 1.0) });
      sub(320, 250, '호출 규칙을 한 곳에서만 지킨다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { mono(50, 100, 'r = session.get(url,', { 'font-size': 15 }); mono(50, 128, '        timeout=(3, 10))', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      R.clock(150, 230, 34, E(u, 0.3, 0.8) * 0.3, GOOD, '연결 3s'); R.clock(300, 230, 34, E(u, 0.5, 2.0), WARN, '읽기 10s');
      tx(380, 220, 'Session 에는 timeout', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.2) }); tx(380, 246, '기본값을 심을 곳이 없다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(50, 330, 'HTTPAdapter.send(timeout=None)  # 직접 확인', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { mono(50, 100, 'r.raise_for_status()', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD }); mono(50, 130, 'return r.json()', { 'font-size': 15.5, 'font-weight': 700 });
      [['200', 'dict 반환', GOOD], ['4xx·5xx', 'HTTPError', BAD]].forEach(([a, b, col], i) => { const y = 200 + i * 60;
        pill(110, y, a, col, pop(u, 0.4 + i * 0.5), { mono: true, fs: 15 }); grow(180, y, 290, y, E(u, 0.6 + i * 0.5, 1.0 + i * 0.5), col); tx(300, y + 6, b, { 'font-size': 15.5, 'font-weight': 800, fill: col, opacity: fade(u, 0.9 + i * 0.5) }); });
      sub(320, 340, '검증 안 된 값이 돌아가는 길이 없다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 4) { [['requests.Timeout', 'API 응답 지연(timeout)'], ['requests.HTTPError', 'HTTP 401  (e.response.status_code)'], ['requests.ConnectionError', '네트워크 연결 실패']].forEach(([a, b], i) => { const y = 100 + i * 76, at = 0.3 + i * 0.5;
        mono(44, y, 'except ' + a, { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, at) });
        grow(80, y + 12, 80, y + 34, E(u, at + 0.2, at + 0.4), MUT, { plain: true });
        mono(90, y + 34, 'RuntimeError("' + b + '")', { 'font-size': 14, fill: INK, opacity: fade(u, at + 0.3) }); });
      sub(320, 344, 'ConnectTimeout 은 Timeout 이자 ConnectionError · 앞의 except 가 잡는다', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    mono(50, 100, 'print(fetch_todo(1)["title"])', { 'font-size': 16, 'font-weight': 800 });
    mono(50, 140, '→ "회의록"   (예시)', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
    tx(50, 210, '호출하는 쪽에는 방어 코드가 없다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.0) });
    tx(50, 246, '네 가지 규칙은 함수 안에서 이미 지켜졌다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
    check(560, 120, 14, pop(u, 1.8)); }

  const quiz = [
    { q: 'requests.get(url)에 timeout을 주지 않으면 서버가 응답을 멈췄을 때 어떻게 되나?',
      o: ['기본 30초 뒤 Timeout 예외가 난다', '응답이 올 때까지 끝없이 기다린다', '자동으로 세 번 다시 보낸다'], a: 1,
      why: 'timeout의 기본값은 None이라 무한 대기다. timeout=(3, 10)처럼 연결과 읽기 상한을 따로 준다.' },
    { q: '서버가 500을 돌려줬다. requests.get 다음 줄에서 일어나는 일은 무엇인가?',
      o: ['아무 예외 없이 r이 만들어진다', 'requests.get이 HTTPError를 낸다', 'r.json()이 자동으로 호출된다'], a: 0,
      why: '에러 응답도 응답이라 예외가 없다. r.raise_for_status()를 불러야 HTTPError로 바뀐다.' },
    { q: 'requests.post(url, data=json.dumps(payload))로 보냈더니 서버가 바디를 못 읽는다. 이유는 무엇인가?',
      o: ['한글이 들어 있어서', 'timeout이 없어서', 'Content-Type: application/json 헤더가 붙지 않아서'], a: 2,
      why: '직접 확인하면 data= 에 문자열을 넣은 요청에는 Content-Type이 없다. json=payload는 직렬화와 헤더를 함께 처리한다.' },
    { q: 'Retry(total=3, backoff_factor=0.5)로 503을 연달아 받으면 재시도 간격은 어떻게 되나? (urllib3 2.x)',
      o: ['0.5초, 1초, 2초', '바로, 1초, 2초', '매번 0.5초'], a: 1,
      why: 'urllib3 2.x는 첫 재시도를 바로 하고, 그다음부터 backoff_factor × 2^(n-1) 초(1초, 2초)를 기다린다. 로컬 서버로 재 보니 간격이 0.0초, 1.0초였다.' },
    { q: 'fetch_todo 안에서 timeout·raise·예외 변환을 모두 처리하면 무엇이 좋아지나?',
      o: ['호출하는 쪽이 방어 코드를 매번 쓰지 않아도 된다', '네트워크가 빨라진다', '토큰이 필요 없어진다'], a: 0,
      why: '규칙을 함수 한 곳에서 지키면 호출부는 결과만 쓴다. 실패는 이해하기 쉬운 RuntimeError 하나로 올라온다.' },
  ];
  const summary = [
    '모든 요청에 timeout을 준다. 기본값이 None이라 서버가 멈추면 끝없이 기다린다.',
    'requests는 4xx·5xx에도 예외를 내지 않는다. 응답 직후 raise_for_status()를 부른다.',
    'POST 바디는 json=으로 넘기면 직렬화와 Content-Type이 함께 붙는다. 토큰은 환경 변수에서 읽는다.',
    '반복 호출은 Session으로 연결을 재사용하고, Retry를 mount해 일시적 5xx를 다시 보낸다.',
  ];
  const review = [
    { q: '배치 작업이 가끔 밤새 멈춰 있다. 로그에는 마지막 API 호출 뒤로 아무것도 없다. 먼저 의심할 것은?',
      o: ['raise_for_status를 빠뜨렸다', 'requests 호출에 timeout이 없다', 'Session 대신 requests.get을 썼다'], a: 1,
      why: '응답이 멈추면 timeout 없는 호출은 영원히 기다린다. 예외도 로그도 남지 않아 멈춘 것처럼 보인다.' },
    { q: '수집한 데이터에 {"error": "internal"} 같은 행이 섞여 저장됐다. 고칠 곳은?',
      o: ['응답 직후 r.raise_for_status()를 부른다', 'timeout을 더 길게 준다', 'json= 대신 data= 를 쓴다'], a: 0,
      why: '500 응답도 예외 없이 r이 되어 r.json()이 에러 바디를 그대로 돌려준다. raise로 그 길을 끊는다.' },
    { q: '페이지 300쪽을 도는 수집기가 느리고, 가끔 503 하나에 전체가 실패한다. 알맞은 조합은?',
      o: ['requests.get을 스레드 300개로 동시에 부른다', 'timeout을 없애 기다리게 한다', 'Session 하나에 Retry(status_forcelist=[502, 503, 504])를 mount 한다'], a: 2,
      why: 'Session은 연결을 재사용해 핸드셰이크를 줄이고, Retry는 일시적 503을 간격을 두고 다시 보낸다.' },
  ];

  R.page({ title: 'HTTP 요청이 오가는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
