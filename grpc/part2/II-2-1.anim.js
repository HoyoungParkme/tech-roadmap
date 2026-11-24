/* II-2-1 Client Streaming — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 메시지 수(256KB = meta 1 + 64KB 청크 4 = 5개), chunk_count·bytes_stored, 청크 메시지 크기, 부분 실패·종료 신호 누락 때의 상태 코드와 문구는
 * grpcio 1.85(python)로 upload.proto 와 코드 블록을 재현해 돌려 확인한 값이다. Go 코드는 같은 동작을 python 으로 재현했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, clock, terminal, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KW = /^(syntax|package|option|service|rpc|returns|stream|message|oneof|string|int64|uint32|bytes|func|return|if|else|for|range|go|defer|nil|var|type|struct|switch|case|import|from|def|with|as|try|except|yield|class|while|break|not|in|elif)$/;
  function ctok(s) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { fill: INFO, 'font-weight': 700 } : {}]); }); buf = ''; };
    while (i < s.length) { const ch = s[i];
      if ((ch === '/' && s[i + 1] === '/') || ch === '#') { flush(); out.push([s.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; out.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  function code(x, y, rows, n, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 9, N = n == null ? rows.length : n;
    if (o.box) el('rect', { x: x - 14, y: y - fs - 10, width: o.box, height: rows.length * lh + 16, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    rows.forEach((s, i) => { if (i >= Math.ceil(N - 1e-6)) return; const part = i === Math.ceil(N) - 1 && N % 1 ? s.slice(0, Math.round(s.length * (N % 1))) : s;
      const hc = o.hi && o.hi(i); if (hc) el('rect', { x: x - 6, y: y + i * lh - fs + 1, width: tw(s, fs) + 12, height: lh - 3, rx: 4, fill: hc });
      spans(x, y + i * lh, ctok(part), { 'font-size': fs }); }); }
  const stat = (cx, cy, s, col, sc) => pill(cx, cy, s, col, sc, { mono: true, fs: 14 });
  // 메시지 알약: meta 는 INFO, chunk 는 ACC
  function msg(cx, cy, i, o) { o = o || {}; const meta = i === 0;
    card(cx, cy, meta ? 66 : 84, 30, { rx: 15, text: meta ? 'meta' : 'chunk ' + i, mono: true, fs: 13.5, fill: o.dead ? OFF : meta ? INFO : ACC, stroke: 'none', color: PANEL, s: o.s, op: o.op }); }
  // 클라 → 서버 선로: n 개 메시지가 오른쪽(서버)으로. n 소수면 하나가 날아가는 중
  const W = { L: 150, R: 790, y: 170 };
  function wire(n, o) { o = o || {}; person(90, W.y, 'Client'); server(870, W.y, 'Server', { s: 0.8, lamp: o.lamp });
    el('line', { x1: W.L, y1: W.y, x2: W.R, y2: W.y, stroke: o.closed ? OFF : GRID, 'stroke-width': 2.5, 'stroke-dasharray': o.closed ? '6 6' : null });
    const whole = Math.floor(n), part = n - whole;
    for (let i = 0; i < whole; i++) msg(W.R - 60 - i * 92, W.y - 30, i, { dead: o.dead && i >= o.dead });
    if (part > 0.001) msg(lerp(W.L + 40, W.R - 60 - whole * 92, E(part, 0, 1)), W.y - 30, whole); }
  // 64KB 칸 네 개 (파일 또는 서버 저장소)
  function blocks(x, y, filled, o) { o = o || {}; for (let i = 0; i < 4; i++) { const f = clamp(filled - i);
      el('rect', { x: x + i * 92, y, width: 84, height: 40, rx: 6, fill: PANEL, stroke: o.col || GRID, 'stroke-width': 2 });
      if (f > 0) el('rect', { x: x + i * 92, y, width: 84 * f, height: 40, rx: 6, fill: o.fill || ACC, opacity: 0.8 });
      mono(x + i * 92 + 42, y + 26, '64KB', { 'font-size': 13.5, 'text-anchor': 'middle', fill: f > 0.6 ? PANEL : MUT }); }
    if (o.label) tx(x, y - 10, o.label, { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  const kb = (b) => Math.round(b).toLocaleString('en-US');

  // ---------- 1. 개요 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { spans(60, 70, [['rpc Upload(', {}], ['stream', { fill: ACC, 'font-weight': 800 }], [' UploadRequest) returns (UploadResponse);', {}]], { 'font-size': 17, opacity: fade(u, 0.2) });
      wire(E(u, 0.6, 2.2) * 5, {});
      if (u > 2.3) fly(W.R - 20, W.y + 40, W.L + 140, W.y + 40, seg(u, 2.3, 2.9), 'UploadResponse 1개', { stay: true, fill: INK });
      mono(480, 300, '요청 N · 응답 1', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { code(60, 80, ['message UploadRequest {', '  oneof payload {', '    FileMeta meta  = 1;', '    bytes    chunk = 2;', '  }', '}'], 6, { box: 330, fs: 14, hi: (i) => (i === 2 && u > 0.6 ? INFOBG : i === 3 && u > 1.0 ? ACCBG : null) });
      for (let i = 0; i < 5; i++) msg(470 + i * 92, 120, i, { s: pop(u, 0.8 + i * 0.25) });
      tx(470, 175, '첫 메시지', { 'font-size': 14, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(700, 175, '나머지는 모두 chunk', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(640, 260, '한 메시지에는 둘 중 하나만 들어간다', fade(u, 2.1), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2 || k === 3) { const ag = b.aggregate || { chunks: 0, bytes: 0 }, pa = (p && p.aggregate) || { chunks: 0, bytes: 0 };
      const ch = tween(k === 2 ? 0 : pa.chunks, ag.chunks, u, 1.6), by = tween(k === 2 ? 0 : pa.bytes, ag.bytes, u, 1.6);
      card(200, 110, 300, 80, { rx: 10, stroke: INFO, fill: INFOBG });
      mono(200, 104, 'filename: "video.mp4"', { 'font-size': 14.5, 'text-anchor': 'middle' }); mono(200, 130, 'total_bytes: 262144', { 'font-size': 14.5, 'text-anchor': 'middle' });
      blocks(470, 90, ch, { label: '서버 저장소 (262144 바이트 자리를 미리 잡음)' });
      mono(470, 170, `chunks ${Math.round(ch)} · bytes ${kb(by)}`, { 'font-size': 16, 'font-weight': 800, fill: ACC });
      if (k === 2) { sub(480, 300, 'meta 를 먼저 받으면 서버가 저장 위치와 크기를 미리 정한다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
      const r = b.response; card(480, 290, 520, 90, { rx: 12, stroke: GOOD, fill: GOODBG, sw: 2.5, s: pop(u, 1.8) });
      mono(480, 282, 'UploadResponse 1개', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) });
      mono(480, 308, `file_id "${r.file_id}" · bytes_stored ${r.bytes_stored} · chunk_count ${r.chunk_count}`, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(480, 370, '청크마다 답하지 않는다. 스트림이 닫혀야 하나 만든다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k4 세 용도
    [['파일 업로드', '청크 → 파일 ID 1개'], ['배치 집계', '값 수천 개 → 합계·평균 1개'], ['로그 수집', '이벤트 → 저장 요약 1개']].forEach(([n, d], i) => {
      const y = 90 + i * 100, s = pop(u, 0.2 + i * 0.5); tx(60, y + 6, n, { 'font-size': 17, 'font-weight': 800, opacity: s });
      for (let j = 0; j < 6; j++) el('circle', { cx: 250 + j * 34, cy: y, r: 9 * clamp(E(u, 0.4 + i * 0.5 + j * 0.06, 0.7 + i * 0.5 + j * 0.06)), fill: ACC });
      grow(460, y, 560, y, E(u, 0.9 + i * 0.5, 1.2 + i * 0.5), INK); card(620, y, 40, 40, { rx: 20, fill: GOOD, stroke: 'none', s: pop(u, 1.2 + i * 0.5) });
      tx(660, y + 6, d, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.3 + i * 0.5) }); });
    sub(480, 390, '많이 보내고 결과는 하나라 왕복이 한 번으로 준다', fade(u, 2.5), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 2. Go 클라이언트 ----------
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const cnt = (y) => mono(480, y || 330, `보낸 메시지 ${Math.round(tween(p.sent ?? 0, b.sent, u, 1.2))}`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    if (k === 0) { wire(0, {}); pill(300, 110, 'stream, err := client.Upload(ctx)', ACC, pop(u, 0.3), { mono: true, fs: 14 });
      clock(720, 290, 34, E(u, 0.8, 2.4) * 0.15, WARN, 'ctx 30s'); cnt(260);
      sub(380, 330, '핸들만 받았다. 선로에는 아직 아무것도 없다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { card(160, 200, 150, 120, { rx: 8, stroke: INK, s: pop(u, 0.2) }); tx(160, 196, 'video.mp4', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(160, 222, '262144 B', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
      blocks(340, 180, E(u, 0.7, 1.8) * 4, { fill: OFF, label: 'os.Open → 4 × 64KB 로 읽을 원본' });
      pill(530, 300, 'defer file.Close()', GOOD, pop(u, 2.0), { mono: true, fs: 14 }); return; }
    if (k === 2) { wire(seg(u, 0.3, 1.5), {}); code(120, 300, ['info, _ := file.Stat()', 'stream.Send(&pb.UploadRequest{Meta: …})'], E(u, 0.1, 0.8) * 2, { fs: 14 }); cnt(380); return; }
    if (k === 3) { wire(1, { closed: u > 0.6 }); if (u > 0.6) cross(480, W.y, 16, pop(u, 0.6));
      card(480, 290, 400, 60, { rx: 10, stroke: BAD, s: pop(u, 1.0) }); mono(480, 296, 'if err != nil { return err }', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.1) });
      sub(480, 370, 'Send 가 실패하면 이 스트림은 끝. 다시 하려면 새 스트림을 연다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { blocks(120, 120, 4, { fill: OFF, label: '파일' });
      const at = Math.min(3, Math.floor(E(u, 0.4, 2.4) * 4)); el('rect', { x: 120 + at * 92 - 3, y: 117, width: 90, height: 46, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 3 });
      card(640, 140, 160, 60, { rx: 10, stroke: ACC, fill: ACCBG }); mono(640, 136, 'buf', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); mono(640, 156, '64 × 1024', { 'font-size': 13.5, 'text-anchor': 'middle' });
      grow(120 + at * 92 + 84, 140, 556, 140, 1, ACC); mono(640, 210, `file.Read(buf) → n = 65536`, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      sub(480, 300, '버퍼 하나를 돌려 쓰니 파일이 커도 메모리는 64KB', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); cnt(360); return; }
    if (k === 5) { wire(lerp(2, 4, E(u, 0.2, 2.2)), {});
      zone(560, 250, 300, 90, 'HTTP/2 보내기 창', {}); const fill = clamp(E(u, 0.2, 1.8)); el('rect', { x: 575, y: 290, width: 270 * fill, height: 30, rx: 6, fill: fill > 0.95 ? WARN : ACC, opacity: 0.8 });
      if (fill > 0.95) mono(710, 360, 'Send 잠깐 대기', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
      cnt(300); return; }
    if (k === 6) { wire(lerp(4, 5, E(u, 0.2, 1.2)), {});
      pill(260, 290, 'file.Read → io.EOF', WARN, pop(u, 1.0), { mono: true, fs: 14 }); grow(360, 290, 430, 290, E(u, 1.3, 1.6), WARN); pill(520, 290, 'break', WARN, pop(u, 1.5), { mono: true });
      tx(860, 250, '서버: 아직 대기', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); cnt(360); return; }
    if (k === 7) { wire(5, { closed: u > 0.9 });
      fly(W.L + 40, W.y + 40, W.R - 20, W.y + 40, seg(u, 0.2, 0.9), 'END_STREAM (EOF)', { mono: true, fill: WARN });
      fly(W.R - 20, W.y + 90, W.L + 140, W.y + 90, seg(u, 1.4, 2.2), 'UploadResponse', { stay: true, fill: GOOD });
      mono(480, 330, 'resp, err := stream.CloseAndRecv()', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      sub(480, 370, '닫기와 받기가 한 호출. 빠뜨리면 서버는 끝을 모르고 기다린다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    // k8
    const r = b.response; terminal(120, 100, 720, 110, [['업로드 완료: id=' + r.file_id + ' bytes=' + r.bytes_stored + ' chunks=' + r.chunk_count, null]], E(u, 0.3, 1.4), { title: 'log.Printf', fs: 15 });
    [['FileId', r.file_id], ['BytesStored', r.bytes_stored], ['ChunkCount', r.chunk_count]].forEach(([a, v], i) => pill(220 + i * 260, 280, `resp.${a} = ${v}`, GOOD, pop(u, 1.4 + i * 0.3), { mono: true, fs: 13.5 }));
    sub(480, 360, '보낸 메시지 5개(meta 1 + 청크 4)에 응답은 1개', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 3. Go 서버 ----------
  function ledger(ag, o) { o = o || {}; card(720, 300, 300, 100, { rx: 10, stroke: o.col || INK, sw: 2 });
    tx(590, 272, '누적 (루프 밖 변수)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    mono(590, 300, `chunkCount  ${Math.round(ag.chunks)}`, { 'font-size': 15, 'font-weight': 700 }); mono(590, 326, `bytes       ${kb(ag.bytes)}`, { 'font-size': 15, 'font-weight': 700, 'text-decoration': o.gone ? 'line-through' : null, fill: o.gone ? BAD : INK }); }
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const ag = b.aggregate || { chunks: 0, bytes: 0 }, pa = p.aggregate || ag, cur = { chunks: tween(pa.chunks, ag.chunks, u), bytes: tween(pa.bytes, ag.bytes, u) };
    if (k === 0) { lbl(240, 70, 'Unary', 1, { fill: MUT }); lbl(720, 70, 'Client Streaming', 1, { fill: ACC });
      card(240, 160, 360, 60, { rx: 10, text: 'GetInfo(ctx, req) (*Resp, error)', mono: true, fs: 14, stroke: GRID, s: pop(u, 0.2) });
      card(720, 160, 360, 60, { rx: 10, text: 'Upload(stream) error', mono: true, fs: 15, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.7) });
      pill(620, 260, 'req 없음', BAD, pop(u, 1.3)); pill(820, 260, 'ctx = stream.Context()', INFO, pop(u, 1.6), { mono: true, fs: 13.5 });
      sub(480, 350, '인자가 스트림 하나뿐이면 요청이 여러 개 온다는 뜻', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { [['filename', '""'], ['totalBytes', '0'], ['chunkCount', '0']].forEach(([a, v], i) => { card(200, 110 + i * 60, 260, 46, { rx: 8, stroke: GRID, s: pop(u, 0.2 + i * 0.3) }); mono(90, 116 + i * 60, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); mono(310, 116 + i * 60, v, { 'font-size': 15, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      blocks(450, 140, 0, { label: 'sink = 임시 파일 · 오브젝트 스토리지', col: ACC });
      sub(480, 330, '응답 하나를 만들려면 루프 밖에 모아 둘 곳이 있어야 한다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { wire(seg(u, 0.2, 1.2), {}); ledger(cur);
      card(250, 300, 300, 70, { rx: 10, stroke: ACC, s: pop(u, 1.0) }); mono(250, 294, 'req, err := stream.Recv()', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      mono(250, 318, 'err == io.EOF → break', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.5) }); return; }
    if (k === 3) { wire(2, { closed: u > 0.6 }); if (u > 0.6) cross(300, W.y, 16, pop(u, 0.6)); ledger(cur, { gone: u > 1.4, col: u > 1.4 ? BAD : INK });
      card(250, 300, 320, 60, { rx: 10, stroke: BAD, s: pop(u, 1.0) }); mono(250, 306, 'return err  (EOF 아님)', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.1) }); return; }
    if (k === 4) { wire(3, {}); ledger(cur);
      card(250, 300, 360, 90, { rx: 10, stroke: INFO, s: pop(u, 0.3) }); mono(250, 282, 'case *pb.UploadRequest_Meta:', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.4) });
      mono(250, 308, 'filename = "video.mp4"', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); mono(250, 330, 'totalBytes = 262144', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    if (k === 5) { wire(lerp(3, 5, E(u, 0.1, 1.2)), {}); ledger(cur);
      card(250, 300, 380, 90, { rx: 10, stroke: BAD, dash: '5 4', s: pop(u, 1.4) }); mono(250, 284, 'sink.Write 실패하면 바로', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.5) });
      mono(250, 310, 'status Internal (13)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      mono(250, 334, '"청크 저장 실패: …"', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 6) { wire(5, { closed: true }); ledger(cur, { col: GOOD });
      card(250, 300, 340, 80, { rx: 10, stroke: GOOD, s: pop(u, 0.6) }); mono(250, 292, 'sink.Commit(filename)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      mono(250, 318, 'fileID "f-8kd2" · stored 262144', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.1) });
      sub(480, 395, '마무리는 EOF 를 본 뒤, 루프 밖에서', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    // k7
    wire(5, { closed: true }); fly(W.R - 20, W.y + 40, W.L + 140, W.y + 40, seg(u, 0.4, 1.3), 'UploadResponse 1개', { stay: true, fill: GOOD });
    mono(480, 300, 'return stream.SendAndClose(&resp)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    frame2(480, 350, pop(u, 1.6)); }
  function frame2(cx, cy, s) { card(cx, cy, 300, 40, { rx: 6, stroke: GOOD, fill: GOODBG, s, text: '트레일러  grpc-status: 0', fs: 14, mono: true, color: GOOD }); }

  // ---------- 4. Python ----------
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { spans(100, 90, ctok('CHUNK_SIZE = 64 * 1024  # 65536'), { 'font-size': 17, opacity: fade(u, 0.2) });
      const H = ['12', '80', '80', '04']; H.forEach((h, i) => card(150 + i * 54, 180, 46, 36, { rx: 5, text: h, mono: true, fs: 14.5, fw: 700, stroke: i === 0 ? ACC : WARN, color: i === 0 ? ACC : WARN, s: pop(u, 0.6 + i * 0.15) }));
      el('rect', { x: 370, y: 162, width: 440 * E(u, 1.0, 1.8), height: 36, rx: 5, fill: ACCBG, stroke: ACC }); if (u > 1.6) mono(590, 186, '청크 65536 바이트', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
      tx(150, 232, '태그 2×8+2', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.2) }); tx(250, 232, '길이 65536 (varint 3바이트)', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 1.3) });
      mono(480, 300, 'chunk 메시지 하나 = 65540 바이트', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 1) { code(80, 90, ['def request_chunks(path) -> Iterator[UploadRequest]:', '    …', '    yield …'], 3, { box: 560 });
      card(300, 250, 260, 60, { rx: 30, text: 'generator 객체', fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.8) }); grow(440, 250, 560, 250, E(u, 1.2, 1.5), ACC);
      card(700, 250, 240, 60, { rx: 10, text: '요청 스트림', fs: 16, fw: 800, stroke: INK, s: pop(u, 1.5) });
      sub(480, 340, 'Send 루프를 직접 쓰지 않는다. gRPC 가 꺼내 가며 보낸다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2 || k === 3) { wire(k === 2 ? seg(u, 0.3, 1.4) : lerp(1, b.sent, E(u, 0.2, 2.4)), {});
      mono(480, 300, k === 2 ? 'yield UploadRequest(meta=FileMeta(…))' : 'while True: chunk = f.read(CHUNK_SIZE) … yield', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      mono(480, 345, `yield ${Math.round(tween(p.sent ?? 0, b.sent, u, 2))}번 = Send ${Math.round(tween(p.sent ?? 0, b.sent, u, 2))}번`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); return; }
    if (k === 4) { wire(5, { closed: u > 0.4 }); fly(W.R - 20, W.y + 40, W.L + 140, W.y + 40, seg(u, 0.8, 1.6), 'UploadResponse', { stay: true, fill: GOOD });
      mono(480, 300, 'resp = stub.Upload(request_chunks(path), timeout=30.0)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(480, 345, '제너레이터가 끝나면 스트림이 닫히고, 반환값이 응답 1개다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 5) { code(80, 90, ['def Upload(self, request_iterator, context):', '    filename = ""; chunk_count = 0; stored = 0', '    sink = FileSink()'], E(u, 0.2, 1.4) * 3, { box: 560 });
      sub(480, 260, '모을 변수는 for 루프 밖에 둔다 (Go 와 같은 규칙)', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 6) { const kinds = ['meta', 'chunk', 'chunk', 'chunk', 'chunk']; for (let i = 0; i < 5; i++) { const s = pop(u, 0.2 + i * 0.35);
        msg(120 + i * 100, 130, i, { s }); mono(120 + i * 100, 180, `"${kinds[i]}"`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: i ? ACC : INFO, opacity: fade(u, 0.4 + i * 0.35) }); }
      mono(320, 230, 'req.WhichOneof("payload")', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      card(720, 150, 300, 80, { rx: 10, stroke: GOOD, s: pop(u, 2.0) }); mono(720, 144, 'for req in request_iterator', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); mono(720, 168, 'io.EOF 분기 없음', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.1) });
      sub(480, 320, '스트림이 닫히면 for 가 스스로 끝난다', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 7) { wire(3, { closed: u > 1.0 }); for (let i = 3; i < 5; i++) msg(W.R - 60 - i * 92, W.y - 30, i, { dead: true, op: 0.5 });
      if (u > 1.0) cross(W.R - 60 - 2 * 92, W.y - 30, 14, pop(u, 1.0));
      card(480, 290, 600, 80, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 1.3) });
      mono(480, 282, 'context.abort(INTERNAL, …)  — 메시지 3개째에서', { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.4) });
      mono(480, 308, "클라: StatusCode.INTERNAL '청크 저장 실패: disk full'", { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) });
      sub(480, 375, '두 번째 청크 쓰기가 실패하도록 해서 돌린 결과', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k8
    terminal(120, 80, 720, 150, [['[server] 수신 시작: video.mp4 (262144 bytes)', null], ['[client] 업로드 완료: id=f-8kd2 bytes=262144 chunks=4', null]], E(u, 0.2, 1.6) * 2, { title: 'python 실행', fs: 15, lh: 30 });
    mono(480, 290, 'return UploadResponse(...)  =  SendAndClose', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) }); }

  // ---------- 5. 정리 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['Unary', '1:1'], ['Server', '1:N'], ['Client', 'N:1'], ['Bidi', 'N:N']].forEach(([n, r], i) => { const hot = i === 2, s = pop(u, 0.2 + i * 0.3);
        card(130 + i * 233, 170, 200, 100, { rx: 12, stroke: hot ? ACC : GRID, sw: hot ? 2.8 : 1.5, fill: hot ? ACCBG : PANEL, s }); tx(130 + i * 233, 160, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : INK, opacity: s });
        mono(130 + i * 233, 192, r, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : MUT, opacity: s }); });
      spans(220, 300, [['rpc F(', {}], ['stream', { fill: ACC, 'font-weight': 800 }], [' Req) returns (Resp)', {}]], { 'font-size': 17, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { lbl(420, 50, 'Go', 1); lbl(740, 50, 'Python', 1);
      [['클라 전송', 'stream.Send(&req)', 'yield req'], ['클라 종료', 'CloseAndRecv()', '제너레이터 끝'], ['서버 수신', 'Recv() + io.EOF', 'for req in iterator'], ['서버 응답', 'SendAndClose(&r)', 'return resp']].forEach(([r, g, py], i) => {
        const y = 100 + i * 66, op = fade(u, 0.2 + i * 0.4); tx(70, y + 5, r, { 'font-size': 15, 'font-weight': 700, opacity: op });
        card(420, y, 260, 46, { rx: 8, text: g, mono: true, fs: 13.5, stroke: GRID, op }); card(740, y, 260, 46, { rx: 8, text: py, mono: true, fs: 13.5, stroke: ACC, op }); }); return; }
    if (k === 2) { const ax = axes(140, 90, 640, 120, { x: [0, 3], y: [0, 1], xt: [0, 1, 2, 3], xl: '초' }), g = E(u, 0.2, 2.2) * 2.6;
      el('rect', { x: ax.X(0), y: 130, width: ax.X(Math.min(g, 2)) - ax.X(0), height: 30, rx: 6, fill: WARN, opacity: 0.8 });
      tx(ax.X(0) + 10, 151, '청크는 다 보냈는데 제너레이터가 안 끝남', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4) });
      el('line', { x1: ax.X(2), y1: 110, x2: ax.X(2), y2: 212, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 0.3) });
      if (g > 2) stat(ax.X(2) + 120, 145, 'DEADLINE_EXCEEDED', BAD, pop(u, 1.9));
      sub(480, 290, 'timeout 2초로 돌린 결과: 서버는 meta 만 찍고 for 에서 계속 기다렸다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 3) { wire(5, { closed: true }); [0, 1, 2].forEach((i) => { const s = pop(u, 0.4 + i * 0.4); card(W.L + 80 + i * 150, W.y + 60, 120, 30, { rx: 15, text: 'Resp ' + (i + 1), mono: true, fs: 13.5, fill: i ? BAD : GOOD, stroke: 'none', color: PANEL, s }); });
      if (u > 1.4) { cross(W.L + 230, W.y + 60, 12, 1); cross(W.L + 380, W.y + 60, 12, 1); }
      sub(480, 320, '응답이 여러 개 필요하면 Bidirectional 을 골라야 한다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { wire(2 + E(u, 0.1, 0.5), {}); for (let i = 3; i < 5; i++) msg(W.L + 60 + (4 - i) * 92, W.y - 30, i, { dead: true, op: fade(u, 0.6) });
      if (u > 1.0) { stat(480, 290, '바로 status 에러', BAD, pop(u, 1.0)); }
      sub(480, 350, '남은 청크를 다 받고 실패하지 말고, 그 자리에서 끊는다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 5) { person(90, 200, '빠른 클라'); server(870, 200, '느린 서버', { s: 0.8 });
      zone(330, 140, 300, 120, 'HTTP/2 흐름 제어 창', {}); const lvl = clamp(E(u, 0.2, 1.4)); el('rect', { x: 345, y: 230 - 70 * lvl, width: 270, height: 70 * lvl, rx: 6, fill: lvl > 0.95 ? WARN : ACC, opacity: 0.75 });
      for (let i = 0; i < 4; i++) dot([[150, 200], [330, 200]], ((t * 0.6 + i / 4) % 1) * (lvl < 0.95 ? 1 : 0.4), ACC, 6);
      if (lvl > 0.95) mono(480, 300, 'Send 가 기다린다', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      sub(480, 360, '서버가 읽어 창이 비면 다시 보낸다. 직접 짤 코드는 없다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    // k6 다음: 양쪽 모두 스트림
    person(130, 200, 'Client'); server(830, 200, 'Server', { s: 0.8 });
    el('line', { x1: 180, y1: 180, x2: 770, y2: 180, stroke: GRID, 'stroke-width': 2 }); el('line', { x1: 180, y1: 225, x2: 770, y2: 225, stroke: GRID, 'stroke-width': 2 });
    for (let i = 0; i < 4; i++) { dot([[180, 180], [770, 180]], (t * 0.4 + i / 4) % 1, ACC, 6); dot([[770, 225], [180, 225]], E(u, 0.6, 1.0) * ((t * 0.4 + i / 4 + 0.12) % 1), INK, 6); }
    spans(220, 310, [['rpc Chat(', {}], ['stream', { fill: ACC, 'font-weight': 800 }], [' Msg) returns (', {}], ['stream', { fill: ACC, 'font-weight': 800 }], [' Msg)', {}]], { 'font-size': 17, opacity: fade(u, 1.2) });
    sub(480, 370, '다음 장 II-2-2: 양쪽이 동시에 보내는 Bidirectional Streaming', fade(u, 1.8), { fill: INK, 'font-size': 15 }); }

  const quiz = [
    { q: 'Client Streaming의 .proto는 어떤 모양인가?',
      o: ['rpc Upload(UploadRequest) returns (stream UploadResponse)', 'rpc Upload(stream UploadRequest) returns (UploadResponse)', 'rpc Upload(stream UploadRequest) returns (stream UploadResponse)'], a: 1,
      why: 'stream은 요청 쪽에만 붙는다. 요청이 여러 개 가고 응답은 UploadResponse 하나다.' },
    { q: 'Go 클라이언트가 청크를 다 Send한 뒤 꼭 불러야 하는 것은 무엇인가?',
      o: ['stream.CloseAndRecv()', 'conn.Close()', 'stream.Recv()를 루프로'], a: 0,
      why: 'CloseAndRecv가 보내는 쪽을 닫아 서버에 EOF를 알리고 그 자리에서 응답 1개를 받는다. 빠뜨리면 서버가 계속 기다린다.' },
    { q: '서버 Recv 루프에서 io.EOF가 아닌 에러가 오면 어떻게 되나?',
      o: ['다음 메시지를 기다리며 계속 돈다', 'EOF처럼 응답을 만들어 보낸다', '그 에러를 반환하고 모아 둔 것은 버린다'], a: 2,
      why: '클라 취소나 전송 오류는 정상 종료가 아니다. 바로 반환하고, 응답은 EOF를 본 뒤에만 만든다.' },
    { q: 'Python 서버에서 청크 저장이 실패했을 때 쓰는 것은 무엇인가?',
      o: ['return None', 'context.abort(grpc.StatusCode.INTERNAL, …)', 'yield 에러 메시지'], a: 1,
      why: 'abort가 그 자리에서 스트림을 끊는다. 실행해 보니 클라는 INTERNAL과 "청크 저장 실패: disk full"을 받았다.' },
    { q: '루프 안에서 청크마다 응답을 돌려주고 싶다면 어떤 모드가 맞나?',
      o: ['Bidirectional Streaming', 'Client Streaming 그대로', 'Unary'], a: 0,
      why: 'Client Streaming의 응답은 반드시 1개다. 응답이 여러 개면 양쪽이 stream인 Bidirectional을 골라야 한다.' },
  ];
  const summary = [
    '큰 파일이나 수천 건 데이터는 Unary 하나에 담기 어렵고, 건마다 부르면 왕복이 쌓인다.',
    'Client Streaming은 요청 쪽에만 stream을 붙여 여러 메시지를 보내고 응답 하나를 받는다.',
    '256KB 파일은 meta 1개와 64KB 청크 4개, 모두 5개 메시지로 가고 응답의 chunk_count는 4다.',
    '보내기를 닫지 않으면 서버가 끝을 모르고, 저장이 실패하면 EOF를 기다리지 말고 바로 끊는다.',
  ];
  const review = [
    { q: '업로드 클라이언트가 30초마다 DEADLINE_EXCEEDED로 끝나고 서버 로그에는 "수신 시작"만 있다. 먼저 의심할 것은?',
      o: ['청크 크기가 64KB라서', '마지막에 CloseAndRecv를 부르지 않았다', '서버가 SendAndClose를 두 번 불렀다'], a: 1,
      why: '보내는 쪽이 닫히지 않으면 서버의 Recv 루프는 EOF를 못 받고 계속 기다리다가 클라 데드라인에 먼저 걸린다.' },
    { q: '1GB 업로드 중 디스크가 가득 찼는데 서버가 끝까지 다 받은 뒤에야 실패를 알렸다. 고칠 곳은?',
      o: ['청크를 쓰다 실패한 그 자리에서 status 에러를 반환한다', '클라이언트 버퍼를 1GB로 늘린다', 'EOF를 받은 뒤 한꺼번에 저장한다'], a: 0,
      why: '부분 실패에서 EOF를 기다리면 남은 청크를 전부 받는다. 즉시 Internal로 끊으면 클라의 CloseAndRecv가 바로 그 에러를 받는다.' },
    { q: '센서 값 1만 개를 보내 평균 하나를 받으려 한다. 어떤 설계가 맞나?',
      o: ['값마다 Unary 호출 1만 번', 'Server Streaming으로 평균을 여러 번 받기', 'Client Streaming으로 값을 흘리고 끝에 평균 하나 받기'], a: 2,
      why: '많이 보내고 결과가 하나면 Client Streaming이다. 서버는 루프 밖 변수에 모으다 EOF 뒤에 평균을 만든다.' },
  ];

  R.page({ title: 'Client Streaming 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
