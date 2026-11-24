/* IV-2-1 Schema Registry + Avro — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 중심: Producer → 토픽(signup-events, 오프셋 칸) → Consumer, 위에 Schema Registry.
 * 실제로 돌려 맞춘 값 (python + fastavro 1.13):
 *   - 이벤트 5필드를 Avro 로 쓰면 payload 33바이트, 앞 5바이트(magic 0x00 + id 42 = 00 00 00 2A)를 붙여 38바이트. 같은 dict 의 JSON 은 98바이트
 *   - 바이트: 00 00 00 00 2A 02 0A 61 6C 69 63 65 3C 02 22 …
 *   - 1715000000000 ms = 2024-05-06 12:53:20 UTC
 *   - 호환성 표: 쓴 스키마/읽는 스키마를 바꿔 실제로 읽어 본 결과
 *   - "30" >= 18 은 TypeError: '>=' not supported between instances of 'str' and 'int'
 * schema id 42·43, version 1 은 코드 주석의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, server, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op }, a || {}));
  // 토픽 로그: cells [{t: 글자, col}] 를 n 칸까지
  function topicLog(x, y, cells, n, o) { o = o || {}; const w = o.w || 64, h = o.h || 34, slots = o.slots || 4;
    mono(x, y - 10, o.name || 'signup-events', { 'font-size': 14.5, 'font-weight': 700 });
    for (let i = 0; i < slots; i++) { const cx = x + i * (w + 4), f = clamp(n - i), c0 = cells[i] || {};
      el('rect', { x: cx, y, width: w, height: h, rx: 5, fill: 'none', stroke: GRID, 'stroke-dasharray': '3 3' });
      if (f > 0) { el('rect', { x: cx, y, width: w, height: h, rx: 5, fill: c0.bg || ACCBG, stroke: c0.col || ACC, 'stroke-width': 1.8, opacity: f });
        mono(cx + w / 2, y + h / 2 + 5, c0.t || '', { 'font-size': 13.5, 'text-anchor': 'middle', fill: c0.col || ACC, opacity: f, 'font-weight': 700 }); }
      mono(cx + w / 2, y + h + 18, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); } }
  function svc(cx, cy, name, o) { o = o || {}; card(cx, cy, o.w || 170, o.h || 64, { rx: 12, stroke: o.stroke || INK, fill: o.fill || PANEL, sw: 2.4, s: o.s, op: o.op });
    tx(cx, cy - (o.sub ? 4 : -5), name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.stroke || INK, opacity: o.op ?? 1 });
    if (o.sub) mono(cx, cy + 18, o.sub, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: o.op ?? 1 }); }
  function registry(cx, cy, o) { o = o || {}; card(cx, cy, o.w || 220, o.h || 60, { rx: 12, stroke: INFO, fill: INFOBG, sw: 2.4, s: o.s, op: o.op });
    tx(cx, cy - 3, 'Schema Registry', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: o.op ?? 1 });
    mono(cx, cy + 18, o.sub || ':8081', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: o.op ?? 1 }); }

  // ---------- 1. JSON: 스키마가 없다 ----------
  const J1 = '{"id":1,"name":"alice","age":30}', J2 = '{"id":2,"name":"bob","age":"thirty"}';
  function s1(t, c) { const { k, u } = c;
    const bad = k >= 4;
    svc(110, 130, 'Producer', { sub: 'Service A' });
    topicLog(330, 113, [{ t: 'age 30' }, { t: 'age "…"', col: WARN, bg: WARNBG }], k === 0 ? 0 : k === 1 ? E(u, 0.8, 1.8) : k === 2 ? 1 + E(u, 0.8, 1.8) : 2, { w: 92 });
    if (k >= 3) svc(830, 130, 'Consumer', { sub: 'Service B', stroke: bad && (k > 4 || u > 1.6) ? BAD : INK, fill: bad && (k > 4 || u > 1.6) ? BADBG : PANEL, s: k === 3 ? pop(u, 0.2) : 1 });
    if (k === 0) { card(110, 250, 190, 40, { rx: 8, stroke: GRID, text: 'json.dumps(v)', fs: 14.5, mono: true, s: pop(u, 0.3) });
      ['{…}', '[ ]', '"x"', '42'].forEach((s, i) => { const a = 0.6 + i * 0.4; fly(110, 320, 110, 230, seg(u, a, a + 0.5), s, { mono: true, fill: MUT }); });
      say(240, 330, '무엇을 넣어도 통과한다 · 검증 지점이 없다', fade(u, 2.0), { fill: WARN }); return; }
    if (k === 1) { fly(200, 130, 380, 130, seg(u, 0.2, 0.9), 'age: 30', { mono: true }); mono(40, 300, J1, { 'font-size': 14, opacity: fade(u, 0.2) });
      say(330, 230, '브로커는 그냥 바이트로 저장한다', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 2) { svc(110, 300, '다른 팀 Producer', { stroke: WARN, s: pop(u, 0.2) });
      fly(200, 300, 470, 135, seg(u, 0.4, 1.0), 'age: "thirty"', { mono: true, fill: WARN }); mono(40, 380, J2, { 'font-size': 14, fill: WARN, opacity: fade(u, 0.6) });
      say(520, 230, '막아 줄 장치가 없다', fade(u, 1.8), { fill: WARN }); sub(600, 256, '토픽에 두 모양이 섞였다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3) { card(830, 250, 230, 40, { rx: 8, stroke: GRID, text: 'json.loads(v)', fs: 14.5, mono: true, s: pop(u, 0.5) });
      mono(720, 318, 'if event["age"] >= 18:', { 'font-size': 14.5, opacity: fade(u, 0.9) });
      card(830, 366, 210, 34, { rx: 17, stroke: INFO, text: 'age 는 int 라고 가정', fs: 14, color: INFO, s: pop(u, 1.5) });
      say(330, 230, '기대는 코드 안에만 있다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 4) { dot([[380, 130], [740, 130]], seg(u, 0.2, 0.8), ACC, 7); check(780, 210, 10, pop(u, 0.8)); mono(800, 215, 'alice 성인 가입', { 'font-size': 14, opacity: fade(u, 0.8) });
      dot([[470, 130], [740, 130]], seg(u, 1.0, 1.6), WARN, 7); cross(780, 250, 10, pop(u, 1.6));
      mono(560, 300, "TypeError: '>=' not supported", { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      mono(560, 324, "between instances of 'str' and 'int'", { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
      say(560, 370, '터진 곳은 Producer 가 아니라 Consumer', fade(u, 2.2)); return; }
    // k === 5: 세 가지 문제
    [['스키마 없음', 'Producer 가 모양을 마음대로 바꾼다'], ['호환성 무보장', '어제 되던 Consumer 가 오늘 죽는다'], ['필드명 반복', '"id" "name" "age" 가 메시지마다 실린다']].forEach(([a, b], i) => { const y = 230 + i * 50, s = pop(u, 0.2 + i * 0.4);
      cross(90, y - 5, 8, s); tx(110, y, a, { 'font-size': 15.5, 'font-weight': 700, opacity: s }); tx(270, y, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.4) }); });
    pill(820, 380, 'Schema Registry + Avro', INFO, pop(u, 1.8), { fs: 15 }); }

  // ---------- 2. Avro 스키마 = 계약서 ----------
  const FIELDS = [['id', 'long'], ['name', 'string'], ['age', 'int'], ['email', '["null","string"]', 'default null'], ['signed_up_at', 'long', 'timestamp-millis']];
  function contract(nRows, hi, o) { o = o || {}; const x = 60, y = 50, w = 470;
    el('rect', { x, y, width: w, height: 70 + nRows * 44, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
    mono(x + 18, y + 28, '"type": "record"', { 'font-size': 14, fill: MUT });
    mono(x + 18, y + 54, o.name != null ? o.name : 'com.example.signup.User', { 'font-size': 15.5, 'font-weight': 800, fill: ACC });
    for (let i = 0; i < nRows; i++) { const [n, ty, ex] = FIELDS[i], yy = y + 70 + i * 44, f = clamp(nRows - i);
      el('rect', { x: x + 12, y: yy, width: w - 24, height: 38, rx: 6, fill: hi === i ? ACCBG : SOFT, stroke: hi === i ? ACC : 'none', 'stroke-width': 2, opacity: f });
      mono(x + 28, yy + 24, n, { 'font-size': 15, 'font-weight': 700, opacity: f }); mono(x + 160, yy + 24, ty, { 'font-size': 14.5, fill: INFO, opacity: f });
      if (ex) mono(x + w - 24, yy + 24, ex, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: f }); } }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const g = E(u, 0.6, 1.4);
      contract(0, null, { name: '' });
      pill(lerp(640, 230, g), 104, 'com.example.signup', INFO, pop(u, 0.2), { mono: true, fs: 14 }); pill(lerp(840, 420, g), 104, 'User', ACC, pop(u, 0.4), { mono: true, fs: 14 });
      sub(700, 160, 'namespace + name = 완전한 이름', fade(u, 1.5), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(700, 186, '패키지처럼 이름 충돌을 막는다', fade(u, 1.8), { 'font-size': 14 });
      mono(700, 240, '"doc": "회원가입 이벤트"', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { contract(E(u, 0.2, 1.2) * 3, 2);
      fly(820, 190, 560, 194, seg(u, 1.4, 2.0), 'age: "thirty"', { mono: true, fill: WARN, stay: u < 2.1 });
      if (u > 2.0) { cross(620, 194, 12, pop(u, 2.0)); mono(700, 240, '직렬화 단계에서 실패', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
      say(600, 80, 'age 의 타입이 계약으로 고정된다', fade(u, 1.0), { fill: ACC }); return; }
    if (k === 2) { contract(3 + E(u, 0.2, 0.8), 3);
      card(760, 120, 260, 44, { rx: 8, stroke: GRID, text: '{id, name, age}  (email 없음)', fs: 14, mono: true, s: pop(u, 0.9) });
      grow(760, 144, 760, 190, E(u, 1.2, 1.6), ACC);
      card(760, 214, 260, 44, { rx: 8, stroke: ACC, text: 'email = null 로 채움', fs: 14.5, color: ACC, s: pop(u, 1.7) });
      say(640, 300, 'default 가 있어야 선택 필드다', fade(u, 2.1)); sub(760, 326, '나중에 넣고 빼기도 이 default 로 갈린다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k === 3: 논리 타입
    contract(4 + E(u, 0.2, 0.8), 4);
    mono(760, 140, '1715000000000', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
    sub(760, 166, '저장은 long (epoch ms)', fade(u, 0.9), { 'font-size': 14 });
    grow(760, 180, 760, 222, E(u, 1.2, 1.6), INFO);
    mono(760, 250, '2024-05-06 12:53:20 UTC', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.6) });
    sub(760, 276, '의미는 시각 (timestamp-millis)', fade(u, 1.8), { 'font-size': 14 });
    say(640, 340, '.avsc 는 git 에 두고 코드처럼 리뷰한다', fade(u, 2.2)); }

  // ---------- 3. Schema Registry 에 등록 ----------
  function drawer(x, y, o) { o = o || {}; el('rect', { x, y, width: 330, height: 210, rx: 12, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 16, y + 28, 'subject: signup-events-value', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    registry(680, 60, { sub: 'http://localhost:8081' });
    drawer(515, 110, { op: k === 0 ? fade(u, 1.6) : 1 });
    if (k === 0) { pill(140, 150, 'signup-events', ACC, pop(u, 0.2), { mono: true, fs: 15 }); pill(300, 150, '-value', INFO, pop(u, 0.6), { mono: true, fs: 15 });
      grow(360, 150, 505, 140, E(u, 1.0, 1.5), INFO);
      sub(220, 200, '토픽명 + -value (TopicNameStrategy)', fade(u, 1.2), { 'font-size': 14 });
      sub(220, 226, '키 스키마라면 -key', fade(u, 1.5), { 'font-size': 13.5 }); return; }
    if (k === 1) { card(130, 140, 140, 50, { rx: 8, stroke: INK, text: 'user.avsc', fs: 15, mono: true, s: pop(u, 0.2) });
      grow(205, 140, 265, 140, E(u, 0.5, 0.9), ACC); mono(235, 118, 'jq -Rs .', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
      card(380, 140, 220, 50, { rx: 8, stroke: ACC, text: '"{\\n  \\"type\\": …"', fs: 14, mono: true, color: ACC, s: pop(u, 1.0) });
      snippet(40, 250, ['{"schema": "<escape 된 문자열>",', ' "schemaType": "AVRO"}'], { fs: 14, op: fade(u, 1.5) });
      sub(250, 360, 'schema 칸은 객체가 아니라 문자열이어야 한다', fade(u, 2.1), { 'font-size': 14, fill: WARN, 'font-weight': 700 }); return; }
    const ruled = k > 2 || u > 1.0;
    if (ruled) { lock(560, 170, true, INFO, k === 2 ? pop(u, 1.0) : 1); mono(585, 176, 'compatibility: BACKWARD', { 'font-size': 14, 'font-weight': 700, fill: INFO }); }
    if (k === 2) { card(200, 120, 280, 40, { rx: 8, fill: INK, stroke: 'none', text: 'PUT /config/{subject}', fs: 14, mono: true, color: PANEL, s: pop(u, 0.2) });
      grow(340, 130, 505, 160, E(u, 0.5, 1.0), INFO);
      say(80, 230, '규칙을 먼저 건다', fade(u, 1.5)); sub(220, 258, '이후 모든 등록이 이 규칙으로 검사된다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 3) { card(200, 120, 300, 40, { rx: 8, fill: INK, stroke: 'none', text: 'POST /subjects/{s}/versions', fs: 14, mono: true, color: PANEL, s: pop(u, 0.2) });
      fly(340, 140, 620, 230, seg(u, 0.5, 1.3), 'user.avsc', { mono: true, stay: true });
      if (u > 1.4) check(720, 230, 11, pop(u, 1.5)); mono(745, 236, '검사 통과', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.6) });
      say(80, 230, '등록과 호환성 검사가 한 번에', fade(u, 1.9)); sub(220, 258, '같은 스키마면 기존 id 를 그대로 준다', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k >= 4: id 42 발급 · 확인
    card(680, 236, 290, 44, { rx: 8, stroke: GOOD, fill: GOODBG, text: 'version 1  ·  id 42', fs: 16, mono: true, color: GOOD, s: k === 4 ? pop(u, 0.4) : 1 });
    if (k === 4) { fly(560, 236, 200, 236, seg(u, 0.9, 1.6), '{"id":42}', { mono: true, fill: GOOD, stay: true });
      say(60, 320, '이 숫자가 모든 서비스가 공유할 스키마 이름이다', fade(u, 1.8)); sub(240, 348, '(42 는 예시 값)', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    card(200, 140, 300, 40, { rx: 8, fill: INK, stroke: 'none', text: 'GET …/versions/latest', fs: 14, mono: true, color: PANEL, s: pop(u, 0.2) });
    snippet(60, 200, ['{ "subject": "signup-events-value",', '  "version": 1, "id": 42, … }'], { fs: 14, op: fade(u, 0.7) });
    svc(130, 370, 'Producer', { w: 150, h: 50, s: pop(u, 1.4) }); svc(380, 370, 'Consumer', { w: 150, h: 50, s: pop(u, 1.6) });
    grow(205, 370, 560, 262, E(u, 1.8, 2.3), GOOD, { plain: true, dash: '5 4' }); grow(455, 370, 600, 262, E(u, 1.9, 2.4), GOOD, { plain: true, dash: '5 4' });
    mono(700, 360, 'id 42 한 단어로 통한다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); }

  // ---------- 4. 직렬화 · 역직렬화 ----------
  const BYTES = [['00', BAD], ['00', INFO], ['00', INFO], ['00', INFO], ['2A', INFO], ['02', INK], ['0A', INK], ['61', INK], ['6C', INK], ['69', INK], ['63', INK], ['65', INK], ['3C', INK], ['02', INK], ['22', INK], ['…', MUT]];
  function frame(x, y, n, o) { o = o || {}; BYTES.forEach(([b, col], i) => { const f = clamp(n - i); if (f <= 0) return; const xx = x + i * 34 + (i >= 1 ? 8 : 0) + (i >= 5 ? 8 : 0);
      el('rect', { x: xx, y, width: 30, height: 30, rx: 4, fill: col === BAD ? BADBG : col === INFO ? INFOBG : SOFT, stroke: col, 'stroke-width': 1.4, opacity: f });
      mono(xx + 15, y + 20, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: f }); });
    if (o.labels) { sub(x + 15, y + 52, 'magic', o.labels, { fill: BAD, 'font-weight': 700 }); sub(x + 8 + 34 + 68, y + 52, 'schema id = 42', o.labels, { fill: INFO, 'font-weight': 700 }); sub(x + 16 + 5 * 34 + 170, y + 52, 'Avro payload (id 1 · "alice" · age 30 · …)', o.labels, { fill: INK, 'font-weight': 700 }); } }
  function s4(t, c) { const { k, u } = c;
    svc(100, 80, 'Producer', { w: 160, h: 56 });
    registry(480, 50, { w: 230, h: 56, sub: k >= 1 ? 'id 42 ↔ user.avsc' : ':8081' });
    svc(860, 80, 'Consumer', { w: 160, h: 56, op: k >= 4 ? 1 : 0.35 });
    if (k === 0) { card(100, 170, 170, 40, { rx: 8, stroke: INFO, text: 'SchemaRegistryClient', fs: 13.5, mono: true, color: INFO, s: pop(u, 0.3) }); grow(185, 160, 365, 70, E(u, 0.6, 1.1), INFO);
      card(100, 230, 170, 40, { rx: 8, stroke: INK, text: 'user.avsc 읽기', fs: 14, s: pop(u, 1.0) });
      say(300, 300, '직렬화기의 재료 두 개: Registry 주소와 스키마 문자열', fade(u, 1.6)); sub(480, 330, '이 클라이언트를 Producer·Consumer 가 함께 쓴다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 1) { card(100, 170, 170, 40, { rx: 8, stroke: ACC, fill: ACCBG, text: 'AvroSerializer', fs: 14, mono: true, color: ACC, s: pop(u, 0.2) });
      dot([[185, 160], [365, 70]], seg(u, 0.5, 1.0), INFO, 6); dot([[365, 78], [185, 168]], seg(u, 1.0, 1.5), INFO, 6);
      pill(300, 210, '최초 1회 조회 → 캐시', INFO, pop(u, 1.4), { fs: 13.5 });
      frame(160, 280, 5, {}); sub(176, 340, 'magic', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); sub(260, 340, 'schema id 4바이트', fade(u, 1.9), { fill: INFO, 'font-weight': 700 });
      mono(380, 300, '+ avro bytes', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { snippet(40, 140, ['event = {"id": 1, "name": "alice", "age": 30,', '         "email": "alice@example.com",', '         "signed_up_at": 1715000000000}'], { fs: 14.5, op: fade(u, 0.3) });
      sub(320, 270, '스키마의 5개 필드를 모두 채운다', fade(u, 1.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(320, 296, '스키마에 없는 필드는 직렬화할 때 실패한다', fade(u, 1.5), { 'font-size': 14 }); return; }
    if (k === 3) { frame(40, 170, E(u, 0.2, 1.8) * 16, { labels: fade(u, 1.8) });
      topicLog(330, 300, [{ t: '38 B' }], E(u, 2.0, 2.5), { slots: 3, w: 80 }); dot([[200, 220], [370, 300]], seg(u, 1.9, 2.3), ACC, 6);
      mono(700, 320, '같은 dict 를 JSON 으로: 98 B', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
      sub(480, 400, '브로커는 여전히 내용을 모른다. 앞 5바이트에 스키마 주소가 들어갔을 뿐', fade(u, 2.4), { 'font-size': 14 }); return; }
    // k >= 4: Consumer 쪽
    topicLog(330, 300, [{ t: '38 B' }], 1, { slots: 3, w: 80 });
    if (k === 4) { card(860, 170, 180, 40, { rx: 8, stroke: ACC, fill: ACCBG, text: 'AvroDeserializer', fs: 14, mono: true, color: ACC, s: pop(u, 0.2) });
      frame(40, 180, 5, {}); el('rect', { x: 34, y: 174, width: 192, height: 42, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.5) });
      mono(144, 240, '→ id 42', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      dot([[860, 150], [600, 70]], seg(u, 1.0, 1.5), INFO, 6); mono(700, 140, 'GET /schemas/ids/42', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      sub(700, 220, '처음 한 번만 묻고 그다음은 캐시', fade(u, 1.8), { 'font-size': 14 }); sub(700, 246, 'Consumer 는 스키마 파일이 없어도 된다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 5) { const p = E(u, 0.6, 1.2); el('path', { d: `M${370},${380 - 8 * p} l-8,12 l16,0 Z`, fill: ACC, opacity: p });
      mono(370, 410, 'earliest: 0 부터', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      card(820, 170, 240, 40, { rx: 8, stroke: INK, text: 'group.id = signup-consumer', fs: 13.5, mono: true, s: pop(u, 0.3) });
      say(600, 210, '여기까지는 평범한 컨슈머', fade(u, 1.6)); sub(700, 236, '달라지는 것은 값을 해석하는 방법뿐', fade(u, 1.9), { 'font-size': 14 }); return; }
    // k === 6
    dot([[377, 300], [860, 112]], seg(u, 0.2, 0.9), ACC, 7);
    card(700, 200, 400, 48, { rx: 10, stroke: GOOD, fill: GOODBG, text: 'User(id=1, name="alice", age=30)', fs: 15, mono: true, color: GOOD, s: pop(u, 1.0) });
    check(475, 200, 11, pop(u, 1.3));
    say(500, 270, 'age 는 언제나 int: TypeError 가 날 자리가 없다', fade(u, 1.8), { fill: GOOD }); }

  // ---------- 5. 호환성 ----------
  // 실제로 읽어 본 결과 (fastavro): [변경, BACKWARD, FORWARD, FULL]
  const MX = [['필드 추가 (default 있음)', 1, 1, 1], ['필드 추가 (default 없음)', 0, 1, 0], ['필드 삭제 (default 없음)', 1, 0, 0], ['age int → string', 0, 0, 0]];
  const MODE = ['BACKWARD', 'FORWARD', 'FULL'];
  function matrix(x, y, cols, o) { o = o || {}; const cw = 130, rh = 44;
    MODE.forEach((m, j) => mono(x + 280 + j * cw, y, m, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: o.cur === j ? ACC : MUT }));
    MX.forEach((r, i) => { const yy = y + 22 + i * rh, hot = o.rows && o.rows.includes(i);
      if (hot) el('rect', { x: x - 6, y: yy, width: 280 + 3 * cw - 50, height: rh - 6, rx: 6, fill: BADBG });
      tx(x, yy + 26, r[0], { 'font-size': 14.5, 'font-weight': 600 });
      for (let j = 0; j < 3; j++) { const f = cols[j] ?? 0; if (f <= 0) continue; const cx = x + 280 + j * cw, cy = yy + 19;
        (r[j + 1] ? check : cross)(cx, cy, 9, f); } }); }
  function timeline(x, y, o) { o = o || {}; const W = 360;
    [['Producer', o.p ?? 0.6, ACC], ['Consumer', o.c ?? 0.3, INFO]].forEach(([n, at, col], i) => { const yy = y + i * 46;
      tx(x, yy + 5, n, { 'font-size': 14.5, 'font-weight': 700 });
      el('rect', { x: x + 90, y: yy - 9, width: W * at, height: 18, rx: 4, fill: OFF });
      el('rect', { x: x + 90 + W * at, y: yy - 9, width: W * (1 - at), height: 18, rx: 4, fill: col });
      mono(x + 96, yy + 5, 'v1', { 'font-size': 13.5, fill: PANEL, 'font-weight': 700 }); mono(x + 96 + W * at, yy + 5, 'v2', { 'font-size': 13.5, fill: PANEL, 'font-weight': 700 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { timeline(60, 100, { p: 0.6, c: 0.3 });
      const g = E(u, 0.8, 1.4); el('rect', { x: 150 + 360 * 0.3, y: 70, width: 360 * 0.3 * g, height: 90, fill: WARN, opacity: 0.18 });
      say(170, 200, '배포는 동시에 끝나지 않는다', fade(u, 1.2), { fill: WARN }); sub(280, 226, '옛 버전과 새 버전이 잠깐 같이 산다', fade(u, 1.5), { 'font-size': 14 });
      topicLog(560, 100, [{ t: 'v1' }, { t: 'v1' }, { t: 'v2', col: INFO, bg: INFOBG }], E(u, 1.2, 2.4) * 3, { slots: 3, w: 80 });
      sub(700, 190, '한 토픽에 두 버전 메시지', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k >= 1 && k <= 3) { const j = k - 1;
      matrix(60, 220, [1, 1, 1].map((v, i) => (i < j ? 1 : i === j ? pop(u, 0.8) : 0)), { cur: j });
      const D = [['새 Consumer 가 옛 메시지를 읽는다', 'Consumer 먼저 배포', 0.25, 0.6], ['옛 Consumer 가 새 메시지를 읽는다', 'Producer 먼저 배포', 0.6, 0.25], ['양쪽 다 읽는다', '배포 순서 자유', 0.45, 0.45]][j];
      timeline(60, 60, { p: D[2], c: D[3] });
      say(560, 70, MODE[j], fade(u, 0.2), { fill: ACC, 'font-size': 17 }); tx(560, 100, D[0], { 'font-size': 14.5, opacity: fade(u, 0.4) }); tx(560, 128, D[1], { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      if (j === 2) sub(700, 170, '가장 안전하고 가장 엄격', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 4) { matrix(60, 80, [1, 1, 1], { rows: [1, 2, 3] });
      card(780, 330, 260, 54, { rx: 10, stroke: BAD, fill: BADBG, text: '409 Conflict · 등록 거부', fs: 16, color: BAD, s: pop(u, 0.8) });
      sub(300, 330, '지금 모드에서 ✗ 인 변경은 Registry 가 막는다', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(300, 356, '타입 변경은 어느 모드에서도 안 된다', fade(u, 1.8), { 'font-size': 14 });
      sub(300, 382, '깨진 스키마는 토픽에 들어오지 못한다', fade(u, 2.1), { 'font-size': 14 }); return; }
    // k === 5: 실무 규칙 · v2 등록
    topicLog(60, 90, [{ t: 'id 42' }, { t: 'id 42' }, { t: 'id 43', col: INFO, bg: INFOBG }, { t: 'id 43', col: INFO, bg: INFOBG }], 2 + E(u, 0.8, 1.8) * 2, { slots: 4, w: 84 });
    card(700, 106, 320, 46, { rx: 10, stroke: GOOD, fill: GOODBG, text: '+ phone (default null) · v2 · id 43', fs: 14, mono: true, color: GOOD, s: pop(u, 0.3) });
    ['BACKWARD 로 시작', '새 필드는 default 와 함께', '삭제는 deprecated 를 거쳐', '타입 변경 대신 새 필드', 'CI 에서 호환성 검사'].forEach((s, i) => { const y = 214 + i * 38; check(90, y - 5, 8, pop(u, 1.0 + i * 0.25)); tx(110, y, s, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.05 + i * 0.25) }); });
    sub(700, 290, '같은 토픽, 다른 schema id 가 함께 산다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'JSON 이벤트에서 age가 문자열로 바뀌었을 때 오류가 처음 드러나는 곳은 어디인가?',
      o: ['그 이벤트를 보낸 Producer', '바이트를 저장한 브로커', '값을 읽어 비교한 Consumer'], a: 2,
      why: 'json.dumps와 브로커는 어떤 값이든 통과시킨다. "thirty" >= 18을 계산하는 Consumer에서 TypeError가 난다.' },
    { q: 'Avro 스키마에서 email을 나중에 넣고 빼도 안전한 선택 필드로 만드는 것은 무엇인가?',
      o: ['type을 ["null","string"]으로 하고 default null을 주는 것', 'doc에 "선택"이라고 적는 것', 'logicalType을 붙이는 것'], a: 0,
      why: 'default가 있어야 값이 없는 메시지를 읽을 때 채울 값이 생긴다. 호환성 검사도 이 default로 갈린다.' },
    { q: 'Schema Registry에 compatibility를 먼저 PUT으로 걸어 두는 이유는 무엇인가?',
      o: ['스키마 id를 원하는 번호로 받으려고', '이후 모든 등록을 그 규칙으로 검사하게 하려고', '토픽을 자동으로 만들려고'], a: 1,
      why: 'POST /versions 한 번이 등록과 호환성 검사를 같이 한다. 규칙을 나중에 걸면 그전에 올라간 버전은 검사를 거치지 않는다.' },
    { q: 'Confluent Avro 메시지의 맨 앞 5바이트 00 00 00 00 2A가 뜻하는 것은 무엇인가?',
      o: ['magic byte 0과 schema id 42', '메시지 길이 42바이트', '필드 5개의 개수'], a: 0,
      why: '첫 바이트 0x00이 magic byte, 다음 4바이트 0x0000002A가 schema id 42다. Consumer는 이 id로 Registry에서 스키마를 받는다.' },
    { q: 'BACKWARD 모드에서 막히는 변경은 무엇인가?',
      o: ['default가 있는 필드 추가', 'default가 없는 필드 추가', '필드 삭제'], a: 1,
      why: 'BACKWARD는 새 스키마로 옛 메시지를 읽어야 한다. 옛 메시지에 없는 필드는 default가 있어야 채울 수 있다.' },
  ];

  // ---------- 정리 · 복습 ----------
  const summary = [
    'JSON만 쓰면 아무 모양이나 토픽에 들어가고, 오류는 보낸 쪽이 아니라 읽는 쪽에서 터진다.',
    'Avro 스키마는 필드 이름과 타입, default를 먼저 정한 계약서이고 git으로 관리한다.',
    'Registry에 등록하면 schema id가 나오고 메시지에는 그 id를 담은 5바이트만 붙는다.',
    '배포 중에는 옛 버전과 새 버전이 섞이니 호환성 모드를 걸고 새 필드에는 default를 단다.',
  ];
  const review = [
    { q: '새 필드 phone을 default 없이 추가해 등록하려다 409가 났다. 모드는 BACKWARD다. 어떻게 고치는가?',
      o: ['phone에 default를 붙여 다시 등록한다', '모드를 NONE으로 바꾼다', 'Consumer를 먼저 재시작한다'], a: 0,
      why: 'BACKWARD에서는 새 스키마로 옛 메시지를 읽어야 해서 추가 필드에 default가 필요하다. default null을 붙이면 FULL 기준으로도 통과한다.' },
    { q: 'Avro로 바꿨는데 어떤 Consumer가 스키마 파일 없이도 메시지를 읽는다. 어떻게 가능한가?',
      o: ['메시지 안에 스키마 전체가 들어 있어서', '앞 5바이트의 schema id로 Registry에서 스키마를 받아서', '브로커가 스키마를 알고 있어서'], a: 1,
      why: '메시지에는 스키마가 아니라 id만 실린다. Consumer는 처음 한 번 GET /schemas/ids/42로 받고 그다음은 캐시를 쓴다.' },
    { q: 'age를 int에서 string으로 바꾸고 싶다. 운영 중인 토픽에서 가장 안전한 방법은?',
      o: ['age 타입을 그대로 바꿔 등록한다', '토픽을 지우고 다시 만든다', '새 필드를 default와 함께 추가하고 age는 deprecated로 두었다가 뺀다'], a: 2,
      why: '타입 변경은 어느 호환성 모드에서도 막힌다. 새 필드를 추가하고 옛 필드는 릴리스 몇 번을 거쳐 지우는 것이 실무 규칙이다.' },
  ];

  R.page({ title: 'Schema Registry 직렬화 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
