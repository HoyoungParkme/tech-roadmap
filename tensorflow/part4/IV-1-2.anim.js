/* IV-1-2 TFRecord·대용량 처리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 작은 파일 더미 → Example 상자(Features 표) → 바이트 레코드 → 샤드 파일 → interleave 읽기 → 판단 흐름.
 * 숫자: 1,000,000장·30GB·256샤드·cycle_length 16 은 페이지 값, 레코드 크기(27,874 B)·JPEG(27,796 B)·
 *       float32(602,112 B)·앞 바이트·샤드당 3,907장은 venv(tensorflow-cpu 2.21) 실행값 (china.jpg 224×224, quality 95). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, hbar, heat, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const hs = (i) => { const v = Math.sin((i + 1) * 91.7) * 43758.5453; return v - Math.floor(v); };

  function fileIcon(cx, cy, sz, col, op) { const h = sz, w = sz * 0.78;
    el('path', { d: `M${cx - w / 2},${cy - h / 2} h${w * 0.65} l${w * 0.35},${w * 0.35} V${cy + h / 2} H${cx - w / 2} Z`, fill: PANEL, stroke: col || MUT, 'stroke-width': 1.4, opacity: op ?? 1 }); }
  function shardBox(x, y, w, h, name, fill, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || ACC, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    if (fill > 0) el('rect', { x: x + 4, y: y + h - 4 - (h - 8) * fill, width: w - 8, height: (h - 8) * fill, rx: 5, fill: o.col || ACC, opacity: 0.25 * (o.op ?? 1) });
    if (fill > 0) for (let i = 0; i < Math.floor(fill * 8); i++) el('line', { x1: x + 8, y1: y + h - 8 - i * ((h - 12) / 8), x2: x + w - 8, y2: y + h - 8 - i * ((h - 12) / 8), stroke: o.col || ACC, 'stroke-width': 1.2, opacity: 0.7 * (o.op ?? 1) });
    if (name) mono(x + w / 2, y + h + 18, name, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
  function bytesStrip(x, y, hexes, o) { o = o || {}; const w = o.w || 34, n = o.n ?? hexes.length;
    hexes.slice(0, Math.ceil(n)).forEach((h, i) => { el('rect', { x: x + i * w, y, width: w - 3, height: 28, rx: 3, fill: o.fill ? o.fill(i) : SOFT, stroke: o.stroke ? o.stroke(i) : GRID, 'stroke-width': 1.4 });
      mono(x + i * w + (w - 3) / 2, y + 19, h, { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.color ? o.color(i) : INK }); }); }

  // =========================================================
  // 1. 작은 파일 지옥
  // =========================================================
  function pile(u0, op, n) { const cols = 26, rows = 8;
    for (let i = 0; i < cols * rows; i++) { const s = n == null ? 1 : clamp(n * cols * rows - i); if (s <= 0) return;
      fileIcon(60 + (i % cols) * 22, 70 + Math.floor(i / cols) * 26, 16 * s, MUT, op); } }
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { pile(0, 1, E(u, 0.1, 1.6));
      mono(640, 80, 'images/', { 'font-size': 16, 'font-weight': 800 });
      tx(640, 116, `파일 ${Math.round(lerp(0, 1000000, E(u, 0.1, 1.8))).toLocaleString('en-US')}개`, { 'font-size': 22, 'font-weight': 800, class: 'mono', fill: BAD });
      tx(640, 150, '총 용량은 30GB 남짓', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
      banner(480, 330, '병목은 크기가 아니라 개수', pop(u, 2.0)); return; }
    if (k === 1) { pile(0, 0.35);
      const names = ['000001.jpg', '000002.jpg', '000003.jpg', '000004.jpg', '000005.jpg', '…', '999999.jpg', '1000000.jpg'];
      el('rect', { x: 600, y: 54, width: 320, height: 270, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      mono(616, 78, 'glob("images/*.jpg")', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      names.forEach((n, i) => { const f = fade(u, 0.3 + i * 0.22); mono(616, 110 + i * 26, 'images/' + n, { 'font-size': 14, opacity: f }); });
      const ph = E(u, 0.3, 2.2); el('rect', { x: 606, y: 92 + ph * 200, width: 300, height: 24, rx: 4, fill: WARN, opacity: 0.18 });
      sub(760, 350, `디렉터리 엔트리 ${Math.round(ph * 1000000).toLocaleString('en-US')}건 조회`, 1, { 'font-weight': 700, fill: WARN }); return; }
    if (k === 2) { // 파일 하나 읽기 = 고정비 + 데이터
      tx(60, 70, '파일 하나를 읽는 시간', { 'font-size': 15, 'font-weight': 700 });
      [['000001.jpg', 3], ['000002.jpg', 12], ['000003.jpg', 40]].forEach(([n, kb], i) => { const y = 100 + i * 70, f = E(u, 0.2 + i * 0.5, 0.9 + i * 0.5);
        mono(60, y + 20, n, { 'font-size': 14, opacity: fade(u, 0.2 + i * 0.5) });
        el('rect', { x: 200, y, width: 300 * f, height: 30, rx: 4, fill: BADBG, stroke: BAD, 'stroke-width': 1.6 });
        if (f > 0.6) mono(350, y + 20, 'open · stat · seek', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
        const d = (kb / 40) * 120 * E(u, 0.8 + i * 0.5, 1.2 + i * 0.5); if (d > 0) el('rect', { x: 504, y, width: d, height: 30, rx: 4, fill: INFO, opacity: 0.8 });
        if (d > 0) mono(512 + d, y + 20, `읽기`, { 'font-size': 13.5, fill: INFO, opacity: fade(u, 1.0 + i * 0.5) }); });
      sub(350, 330, '빨간 고정비는 파일 크기와 상관없이 늘 같다 (길이는 개념도)', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      mono(760, 180, '× 1,000,000', { 'font-size': 26, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    if (k === 3) { // 순차 vs 무작위 접근
      [[100, '순서대로 읽기', false], [250, 'shuffle(10000) 뒤 읽기', true]].forEach(([y, name, rnd], r) => {
        mono(60, y - 22, name, { 'font-size': 15, 'font-weight': 700, fill: rnd ? BAD : GOOD, opacity: fade(u, r * 0.9) });
        for (let i = 0; i < 30; i++) el('rect', { x: 60 + i * 28, y, width: 24, height: 34, rx: 3, fill: PANEL, stroke: GRID, 'stroke-width': 1.4, opacity: fade(u, r * 0.9) });
        const order = rnd ? [3, 27, 11, 19, 6, 24, 14, 1, 29, 9] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], m = E(u, 0.2 + r * 0.9, 1.6 + r * 0.9) * order.length;
        const pts = order.slice(0, Math.ceil(m)).map((i) => [72 + i * 28, y + 17]);
        if (pts.length > 1) el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: rnd ? BAD : GOOD, 'stroke-width': 2.4, opacity: 0.85 });
        pts.forEach(([x, yy]) => el('circle', { cx: x, cy: yy, r: 5, fill: rnd ? BAD : GOOD })); });
      sub(480, 350, '무작위로 건드릴 때마다 디스크가 위치를 다시 찾는다 (seek)', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { const O = b.overhead || [];
      O.forEach((o, i) => { const y = 74 + i * 64, f = pop(u, 0.2 + i * 0.35);
        card(250, y, 400, 52, { rx: 10, stroke: o.tone === 'bad' ? BAD : WARN, sw: 2, s: f });
        tx(70, y + 6, o.item, { 'font-size': 15, 'font-weight': 800, fill: o.tone === 'bad' ? BAD : WARN, opacity: fade(u, 0.3 + i * 0.35) });
        tx(180, y + 6, o.detail, { 'font-size': 14, opacity: fade(u, 0.3 + i * 0.35) });
        mono(470, y + 6, o.cost, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }); });
      // 클라우드: 파일마다 GET
      const cx = 800, cy = 130; el('path', { d: `M${cx - 70},${cy + 20} a30,30 0 0 1 20,-50 a40,40 0 0 1 70,-10 a30,30 0 0 1 50,40 a20,20 0 0 1 0,20 Z`, fill: INFOBG, stroke: INFO, 'stroke-width': 2.2, opacity: fade(u, 0.8) });
      mono(cx, cy + 8, 'S3 / GCS', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.9) });
      for (let i = 0; i < 6; i++) { const f = (t * 0.7 + i / 6) % 1; dot([[cx - 60 + i * 24, 300], [cx - 60 + i * 24, cy + 26]], f, INFO, 4.5); }
      mono(cx, 330, 'GET 1회 = 파일 1개', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) });
      mono(cx, 354, '× 1,000,000', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.5) }); return; }
    // k5: 작은 파일들이 큰 파일 몇 개로
    const f = E(u, 0.3, 1.8);
    for (let i = 0; i < 64; i++) { const sx = 60 + (i % 16) * 24, sy = 80 + Math.floor(i / 16) * 30, tgt = i % 4, tx0 = 620 + tgt * 70, ty0 = 120 + hs(i) * 140;
      if (f < 0.98) fileIcon(lerp(sx, tx0, f), lerp(sy, ty0, f), 16 * (1 - 0.5 * f), MUT, 1 - 0.6 * f); }
    for (let j = 0; j < 4; j++) shardBox(592 + j * 70, 90, 56, 200, j === 3 ? '…' : `#${j}`, E(u, 0.6, 2.0), { op: fade(u, 0.2) });
    tx(60, 300, '파일 100만 개 → 큰 파일 몇 개', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.6) });
    tx(60, 330, '파일마다 붙던 고정비가 큰 파일 몇 번으로 줄어든다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
    pill(732, 340, 'TFRecord', ACC, pop(u, 2.1), { fs: 15 }); }

  // =========================================================
  // 2. tf.train.Example — 값 → Feature → Features → Example → 바이트
  // =========================================================
  const TYPECOL = { BytesList: WARN, Int64List: INFO, FloatList: GOOD };
  function shells(cx, cy, inner, list, u0, u, col) { // 값을 감싸는 껍질 세 겹
    const L = [[`${list}`, 150, 54], ['Feature', 230, 92], ['', 0, 0]];
    const f2 = E(u, u0 + 0.5, u0 + 1.0), f1 = E(u, u0, u0 + 0.5);
    if (f2 > 0) { el('rect', { x: cx - 120, y: cy - 52, width: 240 * f2, height: 104, rx: 12, fill: 'none', stroke: col, 'stroke-width': 2.2 }); mono(cx - 110, cy - 34, 'tf.train.Feature', { 'font-size': 13.5, fill: col, opacity: f2 }); }
    if (f1 > 0) { el('rect', { x: cx - 80, y: cy - 22, width: 160 * f1, height: 56, rx: 8, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': '5 3' }); mono(cx - 72, cy - 6, list, { 'font-size': 13.5, fill: col, opacity: f1 }); }
    card(cx, cy + 14, 70, 26, { rx: 6, text: inner, fs: 13.5, mono: true, stroke: INK, s: pop(u, u0 - 0.2) }); }
  function exTable(x, y, fields, u, fresh) { const rh = 40;
    el('rect', { x, y, width: 560, height: 46 + fields.length * rh, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2.4 });
    mono(x + 14, y + 26, 'tf.train.Example → Features', { 'font-size': 14, 'font-weight': 800, fill: ACC });
    fields.forEach((fd, i) => { const yy = y + 40 + i * rh, f = fresh(i) ? fade(u, 0.2 + i * 0.25) : 1, col = TYPECOL[fd.type] || INK;
      el('rect', { x: x + 10, y: yy, width: 540, height: rh - 6, rx: 6, fill: SOFT, opacity: f });
      mono(x + 22, yy + 23, `"${fd.key}"`, { 'font-size': 14.5, 'font-weight': 700, opacity: f });
      mono(x + 130, yy + 23, fd.type, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: f });
      mono(x + 250, yy + 23, fd.value.length > 30 ? fd.value.slice(0, 28) + '…' : fd.value, { 'font-size': 14, opacity: f }); }); }
  const HEAD = ['0a', 'de', 'd9', '01', '0a', '10', '0a', '06', '68', '65', '69', '67'];   // SerializeToString() 앞 12바이트 (실행값)
  function s2(t, c) { const { k, u } = c, b = c.beat, ex = b.example || {}, F = ex.fields || [], P = (c.prev && c.prev.example && c.prev.example.fields) || [];
    if (k === 0 || k === 1) {
      shells(250, 190, 'v', 'BytesList', 0.3, k === 0 ? u : 3, WARN);
      mono(250, 280, '_bytes_feature(v)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
      if (k === 1) { shells(640, 190, '7', 'Int64List', 0.3, u, INFO); mono(640, 280, '_int64_feature(v)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.8) }); }
      else { card(640, 190, 220, 104, { rx: 12, stroke: GRID, dash: '6 5', op: fade(u, 1.4) }); sub(640, 195, 'int64 자리 (다음 줄)', fade(u, 1.5)); }
      sub(480, 360, '담을 수 있는 타입은 bytes · float · int64 세 가지뿐', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) {
      card(110, 170, 70, 86, { rx: 6, stroke: INK, s: pop(u, 0.1) }); mono(110, 176, 'jpg', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.2) });
      grow(150, 170, 220, 170, E(u, 0.4, 0.8), MUT); mono(185, 154, 'read_file', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) });
      bytesStrip(232, 156, ['ff', 'd8', 'ff', 'e0', '00', '10', '4a', '46', '…', 'ff', 'd9'], { n: lerp(0, 11, E(u, 0.8, 1.8)), fill: (i) => (i < 2 || i > 8 ? WARNBG : SOFT) });
      mono(232, 214, 'JPEG 압축 바이트 27,796 B (224×224 사진, 실행 예)', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(232, 244, '디코딩하지 않는다 · 앞 ff d8 이 JPEG 표식', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9) });
      ['h = 224', 'w = 224'].forEach((s, i) => pill(300 + i * 140, 310, s, INFO, pop(u, 2.0 + i * 0.2), { mono: true }));
      sub(600, 314, '원본 크기 (복원용)', fade(u, 2.3), { 'text-anchor': 'start' }); return; }
    if (k === 3) { exTable(60, 60, F, u, (i) => !P[i] || P[i].value !== F[i].value || P[i].key !== F[i].key); sub(340, 300, '키 이름은 읽을 때 스키마와 글자까지 같아야 한다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { const f = E(u, 0.3, 1.3);
      if (f < 1) exTable(60 + 40 * f, 60 + 30 * f, F, 3, () => false);
      if (f < 1) el('rect', { x: 0, y: 0, width: 960, height: 420, fill: PANEL, opacity: f * 0.9 });
      mono(60, 120, 'example.SerializeToString()', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      bytesStrip(60, 140, HEAD, { n: lerp(0, 12, E(u, 1.1, 2.1)), w: 46, fill: (i) => (i < 4 ? ACCBG : SOFT) });
      mono(620, 160, '… 27,874 B', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      mono(60, 200, "b'\\n\\xde\\xd9\\x01\\n\\x10\\n\\x06heig…'", { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) });
      sub(300, 250, '레코드 하나 = 그냥 바이트. 키 이름과 길이까지 바이트 안에 들어간다', fade(u, 2.3), { 'font-weight': 700, fill: INK });
      sub(300, 276, '(앞 4바이트: 필드 표시 0a + 길이 27,870 을 담은 varint)', fade(u, 2.4)); return; }
    // k5: 크기 비교 (실행값)
    tx(60, 70, '같은 224×224 사진 한 장을 저장하면', { 'font-size': 16, 'font-weight': 700 });
    const ax = 60, W = 640, g1 = E(u, 0.2, 1.2), g2 = E(u, 1.0, 1.6);
    mono(ax, 120, '픽셀 float32 · 224×224×3×4', { 'font-size': 14.5, 'font-weight': 700, fill: BAD });
    el('rect', { x: ax, y: 132, width: W * g1, height: 32, rx: 4, fill: BAD, opacity: 0.8 }); mono(ax + W * g1 + 8, 154, '602,112 B', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
    mono(ax, 210, 'JPEG 바이트 그대로 (quality 95)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
    el('rect', { x: ax, y: 222, width: Math.max(3, W * 27796 / 602112 * g2), height: 32, rx: 4, fill: GOOD }); mono(ax + W * 27796 / 602112 + 10, 244, '27,796 B', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
    banner(480, 330, '약 21.7배 차이 · 디코딩은 읽을 때 한다', pop(u, 2.0)); }

  // =========================================================
  // 3. 샤드 쓰기
  // =========================================================
  function s3(t, c) { const { k, u } = c, b = c.beat, wr = b.write || {};
    if (k === 0) { const W = 820, x0 = 70;
      tx(x0, 70, '이미지 100만 장 × 약 30KB ≈ 30GB', { 'font-size': 16, 'font-weight': 700 });
      el('rect', { x: x0, y: 90, width: W * E(u, 0.1, 0.8), height: 44, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      const n = Math.round(lerp(1, 32, E(u, 0.9, 1.9))); for (let i = 1; i < n; i++) el('line', { x1: x0 + (W / 32) * i, y1: 90, x2: x0 + (W / 32) * i, y2: 134, stroke: ACC, 'stroke-width': 1.4 });
      mono(x0, 170, '÷ 128MB  ≈ 234 조각', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(x0, 204, '→ 넉넉히 NUM_SHARDS = 256  (샤드당 약 117MB)', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
      sub(480, 154, '(칸은 32개만 그림)', fade(u, 1.9));
      shardBox(x0, 250, 120, 90, 'train-00000-of-00256', 0, { op: fade(u, 2.2) }); return; }
    if (k === 1) { const names = ['train-00000-of-00256.tfrecord', 'train-00001-of-00256.tfrecord', 'train-00002-of-00256.tfrecord', '…', 'train-00255-of-00256.tfrecord'];
      names.forEach((n, i) => { const f = E(u, 0.2 + i * 0.3, 0.6 + i * 0.3); if (f <= 0) return; const s = n.slice(0, Math.round(n.length * f));
        if (n === '…' || f < 1) mono(90, 90 + i * 40, s, { 'font-size': 16, 'font-weight': 700 });
        else R.spans(90, 90 + i * 40, [['train-', {}], [n.slice(6, 11), { fill: ACC, 'font-weight': 800, 'text-decoration': 'underline' }], ['-of-', {}], ['00256', { fill: INFO, 'font-weight': 800, 'text-decoration': 'underline' }], ['.tfrecord', {}]], { 'font-size': 16, 'font-weight': 700 }); });
      mono(640, 110, '몇 번째', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      mono(640, 140, '전체 몇 개', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.9) });
      mono(90, 330, 'glob("train-*.tfrecord") 한 줄로 전부 잡힌다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const x0 = 70, W = 820;
      tx(x0, 64, 'samples (1,000,000개)', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < 100; i++) el('rect', { x: x0 + i * 8.2, y: 78, width: 6.5, height: 26, rx: 1.5, fill: OFF });
      const cut = E(u, 0.4, 1.4); [0, 1, 2].forEach((j) => { const xa = x0 + j * 82, f = fade(u, 0.4 + j * 0.3);
        el('rect', { x: xa, y: 74, width: 80, height: 34, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: f });
        grow(xa + 40, 112, 120 + j * 230, 196, cut, ACC); shardBox(70 + j * 230, 200, 110, 100, `shard ${j}`, 0, { op: f }); mono(125 + j * 230, 256, '3,907장', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4 + j * 0.2) }); });
      el('rect', { x: x0 + W - 82, y: 74, width: 80, height: 34, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2.4, opacity: fade(u, 1.5) });
      shardBox(770, 200, 110, 100, 'shard 255', 0, { op: fade(u, 1.6), stroke: WARN }); mono(825, 256, '3,715장', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.8) });
      mono(700, 256, '…', { 'font-size': 20, 'text-anchor': 'middle', fill: MUT });
      mono(x0, 360, 'per_shard = 1,000,000 // 256 + 1 = 3,907  · 마지막 샤드는 나머지 3,715장', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { const S = (wr.shards || []).filter((s) => !s.dots), P = ((c.prev && c.prev.write && c.prev.write.shards) || []).filter((s) => !s.dots);
      S.forEach((s, j) => { const pf = P[j] ? P[j].fill : 0, fl = tween(pf, s.fill, u, 1.8) / 100; shardBox(60 + j * 140, 80, 110, 180, j === S.length - 1 ? '00255' : '0000' + j, fl, {}); });
      mono(60 + 3 * 140 - 30, 175, '…', { 'font-size': 20, fill: MUT });
      for (let i = 0; i < 3; i++) fly(60 + 55, 30, 60 + 55, 200, ((t * 0.5 + i / 3) % 1), 'record', { mono: true });
      // 레코드 한 칸의 틀 (실행으로 확인: 레코드마다 16바이트)
      const fx = 640, fy = 100, f = fade(u, 1.0);
      tx(fx, fy - 12, 'TFRecord 파일 속 레코드 하나', { 'font-size': 14.5, 'font-weight': 700, opacity: f });
      [['길이', 8, INFO], ['CRC', 4, MUT], ['데이터 (Example 바이트)', 0, ACC], ['CRC', 4, MUT]].forEach(([n, by, col], i) => { const y = fy + i * 44, w = by ? 150 : 270;
        el('rect', { x: fx, y, width: w * E(u, 1.0 + i * 0.2, 1.4 + i * 0.2), height: 34, rx: 5, fill: PANEL, stroke: col, 'stroke-width': 2 });
        mono(fx + 10, y + 22, by ? `${n} ${by}B` : n, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.2) }); });
      sub(760, 300, '레코드마다 16B 가 붙고 그대로 이어 붙는다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    // k4: 왜 샤드인가
    const S = 6; for (let j = 0; j < S; j++) shardBox(60 + j * 80, 70, 60, 110, null, 0.8, { op: 1, stroke: j === 4 ? BAD : ACC });
    for (let w = 0; w < 3; w++) { const cx = 120 + w * 160; card(cx, 290, 110, 44, { rx: 10, text: `워커 ${w + 1}`, fs: 14.5, stroke: INFO, s: pop(u, 0.2 + w * 0.15) });
      [0, 1].forEach((q) => { const j = w * 2 + q; grow(90 + j * 80, 184, cx + (q ? 20 : -20), 266, E(u, 0.4 + w * 0.15, 0.9 + w * 0.15), INFO); }); }
    cross(60 + 4 * 80 + 30, 125, 12, pop(u, 1.1)); mono(390, 216, '깨진 조각만 다시', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) });
    const gx = 620, gw = 300; tx(gx, 90, '샤드 크기', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
    el('rect', { x: gx, y: 110, width: gw, height: 26, rx: 4, fill: SOFT, opacity: fade(u, 1.4) });
    el('rect', { x: gx + gw * 0.38, y: 110, width: gw * 0.24, height: 26, rx: 4, fill: GOOD, opacity: fade(u, 1.6) });
    [['수 MB', 0.05, BAD], ['100~200MB', 0.5, GOOD], ['수 GB', 0.93, BAD]].forEach(([s, p, col], i) => mono(gx + gw * p, 160, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, 1.7 + i * 0.15) }));
    mono(gx, 200, '작으면 작은 파일 문제로 돌아가고', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
    mono(gx, 222, '크면 병렬성과 재시도에서 손해', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) }); }

  // =========================================================
  // 4. 읽기 — 스키마 → parse → decode → interleave → 표준 레시피
  // =========================================================
  function schema(x, y, rows, u, fresh) {
    el('rect', { x, y, width: 470, height: 40 + rows.length * 34, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.2 });
    mono(x + 12, y + 24, 'feature_description', { 'font-size': 14, 'font-weight': 800, fill: INFO });
    rows.forEach((r, i) => { const f = fresh(i) ? fade(u, 0.3 + i * 0.25) : 1; mono(x + 14, y + 56 + i * 34, `"${r.key}"`, { 'font-size': 14, 'font-weight': 700, opacity: f }); mono(x + 112, y + 56 + i * 34, r.spec, { 'font-size': 13.5, opacity: f, fill: r.spec.includes('string') ? WARN : INFO }); }); }
  const SHC = [ACC, INFO, WARN, GOOD];
  function s4(t, c) { const { k, u } = c, b = c.beat, rd = b.read || {}, SC = rd.schema || [], PS = (c.prev && c.prev.read && c.prev.read.schema) || [];
    if (k <= 1) { bytesStrip(40, 70, HEAD.slice(0, 10).concat(['…']), { w: 40 }); mono(40, 124, '레코드 = 이름표 없는 바이트', { 'font-size': 14, fill: MUT });
      schema(40, 160, SC, u, (i) => !PS[i]);
      if (k === 0) { card(740, 110, 220, 80, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.0) }); tx(740, 104, '스키마 없이 읽으면', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.1) }); tx(740, 128, '어느 칸이 이미지인지 모른다', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
      else { check(560, 210, 14, pop(u, 1.4)); tx(590, 216, '쓸 때 넣은 네 필드와 짝이 맞았다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
        mono(590, 246, '[] = 스칼라 하나 · 길이가 바뀌면 VarLenFeature', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 2 || k === 3) { bytesStrip(40, 60, HEAD.slice(0, 8).concat(['…']), { w: 36 });
      pill(540, 74, 'parse_single_example', INFO, 1, { mono: true, fs: 13.5 }); grow(372, 74, 430, 74, 1, INFO);
      const D = [['"image"', 'string ()', WARN], ['"label"', 'int64 () = 7', INFO], ['"height"', 'int64 () = 224', INFO], ['"width"', 'int64 () = 224', INFO]];
      D.forEach(([kk, v, col], i) => { const y = 130 + i * 40, f = k === 2 ? fade(u, 0.4 + i * 0.25) : 1;
        card(150, y, 230, 32, { rx: 6, stroke: col, sw: 1.8, op: f }); mono(48, y + 5, kk, { 'font-size': 14, 'font-weight': 700, opacity: f }); mono(130, y + 5, v, { 'font-size': 13.5, fill: col, opacity: f }); });
      if (k === 2) { sub(480, 340, 'ex["image"] 는 아직 JPEG 바이트다 · 픽셀이 아니다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
      grow(270, 130, 380, 130, E(u, 0.2, 0.6), WARN); mono(325, 118, 'decode_jpeg', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.3) });
      if (u > 0.6) heat(400, 100, [[3, 5, 6, 4], [5, 8, 9, 6], [4, 7, 8, 5], [2, 4, 5, 3]], 24, { max: 9, fmt: () => '', col: INFO });
      mono(400, 216, '(224, 224, 3) uint8', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.9) });
      grow(510, 145, 600, 145, E(u, 1.2, 1.6), MUT); mono(555, 133, 'resize · /255', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3) });
      if (u > 1.6) heat(616, 100, [[3, 5, 6, 4], [5, 8, 9, 6], [4, 7, 8, 5], [2, 4, 5, 3]], 24, { max: 9, fmt: () => '', col: GOOD });
      mono(616, 216, 'float32 · 0~1', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      sub(560, 300, '저장 때 미룬 디코딩을 여기서 한다 · 이 map 도 병렬로', fade(u, 2.1), { 'font-weight': 700, fill: INK }); return; }
    // k4~6: interleave 레인
    const lanes = 4, ly = (j) => 90 + j * 52;
    tx(40, 60, 'interleave(cycle_length=16) · 16개 중 4개만 그림', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: k === 4 ? fade(u, 0.1) : 1 });
    for (let j = 0; j < lanes; j++) { const y = ly(j); shardBox(40, y - 20, 70, 40, null, 0.6, { col: SHC[j], stroke: SHC[j] }); mono(120, y + 5, `shard ${String(j).padStart(2, '0')}`, { 'font-size': 13.5, fill: SHC[j], 'font-weight': 700 });
      for (let q = 0; q < 3; q++) { const f = ((t * 0.35 + q / 3 + j * 0.08) % 1), x = lerp(200, 430, f), yy = lerp(y, 168, E(f, 0.6, 1)); el('rect', { x: x - 10, y: yy - 9, width: 20, height: 18, rx: 3, fill: SHC[j], opacity: k === 4 ? fade(u, 0.3) : 1 }); } }
    // 섞여 나오는 출력 스트림
    const outX0 = 460; for (let i = 0; i < 10; i++) { const x = outX0 + i * 46 - ((t * 30) % 46); if (x < outX0 - 4 || x > 900) continue; el('rect', { x, y: 158, width: 30, height: 20, rx: 3, fill: SHC[i % 4] }); }
    el('line', { x1: 440, y1: 168, x2: 920, y2: 168, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    if (k === 4) { sub(680, 214, '여러 샤드의 레코드가 번갈아 나온다', fade(u, 1.0), { 'font-weight': 700, fill: INK }); return; }
    const P = ['map(parse_fn)', 'shuffle(10000)', 'batch(64)', 'prefetch'], cols = [INFO, WARN, GOOD, ACC];
    P.forEach((n, i) => { const x = 140 + i * 190, s = k === 5 ? pop(u, 0.2 + i * 0.3) : 1; card(x, 330, 160, 46, { rx: 10, text: n, fs: 14, mono: true, stroke: cols[i], sw: 2.2, s });
      if (i) grow(x - 190 + 82, 330, x - 82, 330, k === 5 ? E(u, 0.4 + i * 0.3, 0.7 + i * 0.3) : 1, MUT); });
    grow(900, 180, 900, 300, k === 5 ? E(u, 0.1, 0.5) : 1, MUT, { plain: true }); el('path', { d: 'M900,300 V330 H222', fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: k === 5 ? fade(u, 0.5) : 1 });
    if (k === 5) sub(480, 400, 'IV-1-1 의 표준 레시피 그대로 · 입력 소스만 TFRecord', fade(u, 1.6), { 'font-weight': 700, fill: INK });
    if (k === 6) { pill(480, 270, 'model.fit(ds, epochs=10)', GOOD, pop(u, 0.3), { mono: true, fs: 15 }); sub(480, 400, '학습 코드는 한 줄도 바뀌지 않았다', fade(u, 0.8), { 'font-weight': 700, fill: INK }); } }

  // =========================================================
  // 5. 판단 — 언제 TFRecord 인가
  // =========================================================
  const COND = [['num_images >= 100_000', '대규모'], ['on_cloud', 'TPU · 다중 GPU'], ['epochs >= 50', '반복 스캔']];
  function s5(t, c) { const { k, u } = c, b = c.beat, J = b.judge || {};
    if (k <= 2) { card(160, 200, 220, 70, { rx: 12, stroke: INK, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
      mono(160, 196, 'should_use_tfrecord', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle' }); mono(160, 220, '(n, cloud, epochs)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      if (k === 0) { ['이미지 수', '클라우드 여부', 'epoch 수'].forEach((s, i) => { const x = 70 + i * 125; pill(x, 100, s, INFO, pop(u, 0.5 + i * 0.25), { fs: 13.5 }); grow(x, 118, 160 - 30 + i * 30, 162, E(u, 0.7 + i * 0.25, 1.0 + i * 0.25), INFO); });
        sub(600, 200, '감이 아니라 세 가지 기준으로 정한다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
      COND.forEach(([cnd, why], i) => { const y = 90 + i * 90, f = k === 1 ? E(u, 0.2 + i * 0.4, 0.6 + i * 0.4) : 1;
        grow(272, 200, 340, y, f, MUT); card(470, y, 250, 50, { rx: 10, stroke: WARN, sw: 2, s: f > 0 ? 1 : 0, op: f }); mono(470, y + 5, cnd, { 'font-size': 14, 'text-anchor': 'middle', opacity: f });
        grow(597, y, 690, y, f, GOOD); pill(760, y, `True · ${why}`, GOOD, f > 0.9 ? 1 : 0, { fs: 13.5 }); });
      if (k === 2) { grow(160, 236, 160, 330, E(u, 0.3, 0.8), BAD); pill(160, 356, 'return False · 폴더로 충분', BAD, pop(u, 0.8), { fs: 14 });
        (J.skip && J.skip.items || []).slice(0, 2).forEach((s, i) => mono(330, 350 + i * 24, '· ' + s, { 'font-size': 14, opacity: fade(u, 1.2 + i * 0.3) })); }
      return; }
    if (k === 3) { const tree = [['images/', 0], ['cat/', 1], ['dog/', 1]];
      tree.forEach(([n, d], i) => mono(80 + d * 24, 110 + i * 32, n, { 'font-size': 15, 'font-weight': 700, fill: d ? WARN : INK }));
      grow(200, 140, 300, 140, E(u, 0.3, 0.7), ACC);
      card(560, 140, 500, 60, { rx: 12, stroke: ACC, sw: 2.4, fill: ACCBG, s: pop(u, 0.6) });
      mono(560, 136, 'image_dataset_from_directory(', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7) });
      mono(560, 158, '"images/", image_size=(224, 224), batch_size=32)', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      [['변환 단계', '없음'], ['라벨', '폴더 이름'], ['배치', '함께 처리']].forEach(([a, z], i) => { const x = 220 + i * 260; card(x, 280, 220, 60, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.2 + i * 0.25) });
        tx(x, 274, a, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3 + i * 0.25) }); tx(x, 296, z, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3 + i * 0.25) }); });
      sub(480, 370, '수천 장짜리 실험에는 이 한 줄이 더 빠르다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { const A = [['TFRecord', 'TF · TPU', ACC, 200, 120], ['HDF5', '과학 · 배열', INFO, 700, 120], ['WebDataset', 'tar 샤드 · PyTorch', WARN, 200, 290], ['HF datasets', 'Arrow · NLP', GOOD, 700, 290]];
      A.forEach(([n, w, col, x, y], i) => { card(x, y, 250, 76, { rx: 12, stroke: col, sw: 2.4, s: pop(u, 0.2 + i * 0.3) });
        tx(x, y - 4, n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.3 + i * 0.3) }); tx(x, y + 20, w, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      el('circle', { cx: 450, cy: 205, r: 62, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.4) });
      tx(450, 198, '작은 파일을', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); tx(450, 220, '큰 묶음으로', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); return; }
    // k5: 샤드가 GPU 에 나뉘어 간다
    for (let j = 0; j < 8; j++) shardBox(60 + j * 60, 80, 46, 80, null, 0.7, { col: SHC[j % 4], stroke: SHC[j % 4] });
    mono(60, 64, 'train-*-of-00256.tfrecord', { 'font-size': 14, 'font-weight': 700 });
    for (let g = 0; g < 4; g++) { const cx = 120 + g * 200, f = pop(u, 0.4 + g * 0.2); card(cx, 300, 140, 50, { rx: 10, text: `GPU ${g}`, fs: 15, stroke: SHC[g], sw: 2.4, s: f });
      [g, g + 4].forEach((j) => grow(83 + j * 60, 164, cx, 272, E(u, 0.6 + g * 0.2, 1.1 + g * 0.2), SHC[g])); }
    pill(720, 120, '다음 장 IV-2-1 · 분산 전략', ACC, pop(u, 1.8), { fs: 14.5 });
    sub(480, 380, '오늘 만든 샤드가 여러 장치에 나눠 주는 단위가 된다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }

  const quiz = [
    { q: '이미지 100만 장(약 30GB)을 폴더에 두고 읽을 때 가장 큰 병목은 무엇인가?',
      o: ['30GB 라는 총 용량', '파일마다 붙는 open·seek·요청 같은 고정비', 'JPEG 디코딩 알고리즘 자체'], a: 1,
      why: '파일 열기 비용은 3KB 를 읽든 200KB 를 읽든 같다. 그 고정비가 100만 번 붙고, 셔플하면 무작위 seek 까지 더해진다.' },
    { q: '이미지를 Example 에 담을 때 JPEG 바이트를 그대로 넣는 까닭은 무엇인가?',
      o: ['float32 픽셀로 풀면 한 장이 약 20배 커지기 때문에', 'BytesList 에는 픽셀을 넣을 수 없어서', '디코딩을 저장할 때 해야 읽기가 빨라져서'], a: 0,
      why: '224×224×3 float32 는 602,112 B 이고 같은 사진의 JPEG 는 27,796 B 였다. 디코딩은 읽을 때 하면 된다.' },
    { q: '30GB 를 128MB 목표로 나누면 약 234개가 나온다. 샤드를 이 정도 크기로 여러 개 두는 가장 큰 이유는 무엇인가?',
      o: ['파일 하나가 4GB 를 넘으면 쓸 수 없어서', 'TFRecordWriter 가 샤드 하나에 3,907장까지만 받아서', '여러 워커가 서로 다른 샤드를 동시에 읽고, 깨진 조각만 다시 만들 수 있어서'], a: 2,
      why: '샤드는 병렬 읽기와 재시도의 단위다. 100~200MB 안팎이면 작은 파일 문제도 피하고 병렬성도 지킨다.' },
    { q: 'TFRecord 를 읽을 때 feature_description 을 꼭 넘겨야 하는 이유는 무엇인가?',
      o: ['interleave 가 샤드 수를 알아야 해서', 'TFRecord 는 필드 타입을 스스로 저장하지 않아서', 'decode_jpeg 가 이미지 크기를 알아야 해서'], a: 1,
      why: '레코드는 그냥 바이트다. 어떤 키가 string 이고 int64 인지 읽는 쪽이 알려 줘야 parse_single_example 이 딕셔너리로 되돌린다.' },
    { q: '로컬 SSD 한 대에서 이미지 5,000장으로 10 epoch 실험한다. 가장 알맞은 선택은 무엇인가?',
      o: ['폴더 그대로 image_dataset_from_directory 로 읽는다', '256개 샤드 TFRecord 로 먼저 굽는다', 'WebDataset tar 로 바꾼다'], a: 0,
      why: '10만 장 미만, 로컬, 50 epoch 미만이라 세 조건 모두 False 다. 변환 시간이 학습보다 길어질 수 있다.' },
  ];

  const summary = [
    '작은 파일 100만 개는 파일마다 open·seek·요청 고정비가 붙어 크기보다 개수가 병목이 된다.',
    'Example 에는 JPEG 바이트를 그대로 담는다. float32 로 풀면 602,112 B, JPEG 는 27,796 B 였다.',
    '30GB 를 256개 샤드(약 117MB)로 나눠 쓰고, interleave 로 여러 샤드를 동시에 읽는다.',
    '읽을 때는 스키마로 parse 한 뒤 디코딩하고, 수천 장 실험이면 폴더에서 바로 읽는다.',
  ];
  const review = [
    { q: 'S3 에 둔 썸네일 100만 장으로 학습하는데 GPU 가 자주 논다. 이미지 크기는 장당 3KB 다. 먼저 손볼 곳은?',
      o: ['썸네일을 더 작게 압축한다', '이미지를 묶어 TFRecord 샤드로 굽는다', 'batch 크기를 줄인다'], a: 1,
      why: '파일 하나가 GET 요청 하나라 요청 왕복이 100만 번 붙는다. 크기를 줄여도 요청 수는 그대로라, 큰 파일로 묶어야 줄어든다.' },
    { q: 'TFRecord 로 바꾼 뒤 parse 단계에서 label 이 비거나 에러가 난다. 먼저 의심할 것은?',
      o: ['읽을 때 스키마의 키 이름이 쓸 때 쓴 키와 다르다', 'cycle_length 가 너무 크다', 'JPEG 품질이 낮다'], a: 0,
      why: 'TFRecord 는 구조를 저장하지 않으므로 읽는 쪽 스키마가 쓸 때의 키·타입과 정확히 맞아야 한다.' },
    { q: '샤드 하나를 30GB 짜리 단일 파일로 만들었더니 워커 8대를 붙여도 읽기가 빨라지지 않는다. 이유는?',
      o: ['TFRecord 는 원래 한 대에서만 읽힌다', 'JPEG 바이트가 너무 커서 디스크가 막힌다', '파일이 하나뿐이라 나눠 읽을 단위가 하나다'], a: 2,
      why: '병렬 읽기의 단위는 파일(샤드)이다. 파일이 하나면 나눠 가질 조각이 없어, 100~200MB 샤드 여러 개로 쪼개야 워커가 늘어난 만큼 빨라진다.' },
  ];

  R.page({ title: 'TFRecord 로 묶기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
