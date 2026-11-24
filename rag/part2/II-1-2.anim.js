/* II-1-2 전처리 파이프라인 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽 원본 11줄(줄마다 잡음·중복·이미지 꼬리표), 오른쪽 정제본, 맨 아래 바이트 막대.
 * 바이트 수는 11줄을 \n 으로 이은 UTF-8 길이를 실제로 잰 값: 원본 451B → 잡음 컷 260B → NFKC 256B → 공백 정리 250B → 중복 제거 211B → OCR 199B.
 * md5 앞 8자리도 실제 계산값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, grow, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const RAW = [
    ['noise', '===== 헤더: 주식회사 ABC ====='], ['noise', 'Navigation: Home | About | Contact'], ['noise', 'Copyright 2024 ABC Corp.'],
    ['normal', '제1장   인사규정'], ['normal', '1.1 근무시간은　오전 9시부터 오후 6시까지로 한다．'], ['noise', '[광고] 신입사원 모집중! 지금 바로 지원하세요!'],
    ['normal', '1.2 연차 휴가는 다음과 같다:'], ['dupe', '1.2 연차 휴가는 다음과 같다:'], ['image', '[image: scan_p3.png — 스캔 이미지]'],
    ['image', '[image: scan_p4.png — 스캔 이미지]'], ['noise', '===== 푸터: Copyright 2024 ====='],
  ];
  const OCR = ['- 1년 미만: 월 1일', '- 3년 이상: 15일 + 근속년수×1일'];
  const TAG = { noise: ['잡음', BAD], dupe: ['중복', WARN], image: ['이미지', INFO] };
  const LY = (i) => 52 + i * 26;
  // 원본 판. o.gone(i) → 0~1 지운 정도, o.hi(kind) 강조, o.ocr(i) 0~1 OCR 로 바뀐 정도, o.typing 보이는 줄 수
  function rawPane(o) { o = o || {};
    el('rect', { x: 14, y: 22, width: 486, height: 306, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(26, 40, '원본 (로딩 직후)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    RAW.forEach(([kind, s], i) => { const y = LY(i) + 14, sh = o.typing != null ? clamp(o.typing - i) : 1; if (sh <= 0) return;
      const gone = o.gone ? o.gone(i) : 0, hi = o.hi && o.hi === kind, oc = o.ocr ? o.ocr(i) : 0;
      if (hi) el('rect', { x: 20, y: y - 17, width: 474, height: 24, rx: 4, fill: kind === 'noise' ? BADBG : kind === 'dupe' ? WARNBG : INFOBG, opacity: o.hiOp ?? 1 });
      mono(40, y, String(i + 1), { 'font-size': 13.5, fill: OFF, 'text-anchor': 'end', opacity: sh });
      if (TAG[kind]) { const [t, col] = TAG[kind]; pill(80, y - 5, oc > 0.5 ? 'OCR' : t, oc > 0.5 ? GOOD : col, 0.85 * sh, { fs: 13.5, op: gone > 0.5 ? 0.4 : 1 }); }
      const txt = oc > 0.5 ? OCR[i - 8] : s;
      mono(118, y, txt, { 'font-size': 13.5, fill: gone > 0.5 ? OFF : oc > 0.5 ? GOOD : kind === 'image' ? INFO : INK, opacity: sh * (1 - 0.5 * gone), 'text-decoration': gone > 0.3 ? 'line-through' : null, 'font-weight': oc > 0.5 ? 700 : 400 }); }); }
  // 정제본 판. rows: [[text, col?, note?]]
  function cleanPane(rows, o) { o = o || {};
    el('rect', { x: 512, y: 22, width: 434, height: 306, rx: 10, fill: o.empty ? 'none' : GOODBG, stroke: o.empty ? GRID : GOOD, 'stroke-width': 1.5, 'stroke-dasharray': o.empty ? '6 5' : null });
    tx(524, 40, '정제본', { 'font-size': 13.5, 'font-weight': 700, fill: o.empty ? MUT : GOOD });
    if (o.empty) { tx(729, 180, '아직 비어 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 700 }); return; }
    rows.forEach(([s, col, op], i) => { const y = 74 + i * 30; mono(526, y, s, { 'font-size': 13.5, fill: col || INK, opacity: op ?? 1, 'font-weight': col === GOOD ? 700 : 400 }); }); }
  // 바이트 막대: 원본 451B 와 지금 정제본
  function meter(c) { const b = c.beat.stats, p = (c.prev && c.prev.stats) || b, cur = tween(p.cleanedBytes, b.cleanedBytes, c.u), W = 600;
    tx(20, 362, '원본', { 'font-size': 14, 'font-weight': 700, fill: MUT }); el('rect', { x: 80, y: 348, width: W, height: 18, rx: 4, fill: OFF });
    mono(80 + W + 10, 362, `${b.rawBytes}B`, { 'font-size': 14, 'font-weight': 700 });
    tx(20, 396, '정제본', { 'font-size': 14, 'font-weight': 700, fill: GOOD });
    if (cur > 0) { el('rect', { x: 80, y: 382, width: W * cur / b.rawBytes, height: 18, rx: 4, fill: GOOD });
      mono(80 + W * cur / b.rawBytes + 10, 396, `${Math.round(cur)}B`, { 'font-size': 14, 'font-weight': 700, fill: GOOD });
      if (b.noiseRatio != null) mono(940, 396, `−${Math.round((1 - cur / b.rawBytes) * 100)}%`, { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); }
    else mono(80, 396, '—', { 'font-size': 14, fill: MUT }); }
  const NOISE_ROWS = [0, 1, 2, 5, 10];
  const CLEAN6 = [['제1장 인사규정'], ['1.1 근무시간은 오전 9시부터 오후 6시까지로 한다.'], ['1.2 연차 휴가는 다음과 같다:'], ['1.2 연차 휴가는 다음과 같다:', WARN], ['[image: scan_p3.png — 스캔 이미지]', INFO], ['[image: scan_p4.png — 스캔 이미지]', INFO]];

  // ---------- 1. 원본 ----------
  function s1(t, c) { const { k, u } = c; meter(c);
    if (k === 0) { rawPane({ typing: lerp(0, 11, E(u, 0.2, 1.8)) }); cleanPane([], { empty: true });
      sub(729, 210, 'WebBaseLoader로 읽은 그대로', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { rawPane({ hi: 'noise', hiOp: fade(u, 0.2) });
      tx(524, 52, '그대로 자르면 청크마다 박힌다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      [0, 1, 2].forEach((i) => { const s = pop(u, 1.0 + i * 0.3), y = 80 + i * 82;
        card(729, y + 30, 400, 66, { rx: 8, stroke: GRID, s }); mono(540, y + 22, `chunk ${i + 1}`, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: s });
        mono(540, y + 46, 'Copyright 2024 ABC Corp. …', { 'font-size': 13.5, fill: BAD, opacity: s }); });
      return; }
    if (k === 2) { rawPane({ hi: 'dupe', hiOp: fade(u, 1.6) });
      el('rect', { x: 20, y: LY(4) - 3, width: 474, height: 24, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
      cleanPane([], { empty: true });
      el('rect', { x: 512, y: 22, width: 434, height: 306, rx: 10, fill: PANEL, opacity: fade(u, 0.3) });
      tx(530, 60, '눈에 같아 보여도 다른 글자', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      [['　', 'U+3000', ' ', 'U+0020', '전각 공백'], ['．', 'U+FF0E', '.', 'U+002E', '전각 마침표']].forEach(([a, ca, b, cb, name], i) => { const y = 100 + i * 82, s = pop(u, 0.6 + i * 0.4);
        card(580, y + 20, 64, 56, { rx: 6, stroke: WARN, s, text: a === '　' ? '␣' : a, fs: 22 }); mono(580, y + 64, ca, { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: s });
        tx(640, y + 26, '≠', { 'font-size': 22, 'font-weight': 800, opacity: s }); card(700, y + 20, 64, 56, { rx: 6, s, text: b === ' ' ? '␣' : b, fs: 22 }); mono(700, y + 64, cb, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s });
        tx(752, y + 26, name, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); });
      tx(530, 296, '"근무시간은 오전" 으로 찾으면', { 'font-size': 14.5, opacity: fade(u, 1.6) }); tx(530, 320, '5번 줄이 걸리지 않는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      sub(729, 266, '7·8번은 같은 조항이 두 번 들어왔다', fade(u, 2.0), { fill: WARN, 'font-weight': 700 }); return; }
    if (k === 3) { rawPane({ hi: 'image', hiOp: fade(u, 0.2) });
      [0, 1].forEach((i) => { const y = 70 + i * 120, s = pop(u, 0.4 + i * 0.3); el('rect', { x: 560, y, width: 160, height: 96, rx: 6, fill: SOFT, stroke: INFO, 'stroke-width': 2, opacity: s });
        for (let r = 0; r < 3; r++) el('line', { x1: 576, y1: y + 26 + r * 22, x2: 576 + [120, 96, 110][r], y2: y + 26 + r * 22, stroke: OFF, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: s });
        mono(740, y + 52, `scan_p${3 + i}.png`, { 'font-size': 13.5, fill: INFO, opacity: s }); });
      mono(560, 300, '"1년 미만 연차" 검색', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.5) }); cross(780, 295, 10, pop(u, 1.9));
      sub(729, 322, '그림 속 글자는 텍스트가 아니다', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); return; }
    // k 4: 문제 넷과 해결 단계
    rawPane({});
    [['잡음 줄 반복', 'Clean', BAD, [0, 1, 2, 5, 10]], ['전각 문자', 'Clean (NFKC)', BAD, [4]], ['중복 페이지', 'Dedupe', WARN, [7]], ['스캔 이미지', 'OCR', INFO, [8, 9]]].forEach(([a, b, col, rows], i) => {
      const y = 70 + i * 66, s = pop(u, 0.3 + i * 0.4); card(729, y, 400, 52, { rx: 8, stroke: col, s });
      tx(546, y + 6, `${i + 1}. ${a}`, { 'font-size': 15, 'font-weight': 700, opacity: s }); pill(870, y, b, col, s, { fs: 13.5 });
      rows.forEach((r) => el('circle', { cx: 498, cy: LY(r) + 9, r: 5, fill: col, opacity: fade(u, 0.5 + i * 0.4) })); }); }

  // ---------- 2. Clean ----------
  const PATS = [['={3,}.*?={3,}', '헤더·푸터'], ['Navigation:.*?$', '네비게이션'], ['Copyright\\s+\\d{4}.*?$', '저작권'], ['\\[광고\\].*?$', '광고']];
  const PAT_ROWS = [[0, 10], [1], [2], [5]];
  function s2(t, c) { const { k, u } = c; meter(c);
    const gone = (i) => (k >= 2 && NOISE_ROWS.includes(i) ? (k === 2 ? E(u, 0.3 + NOISE_ROWS.indexOf(i) * 0.25, 0.7 + NOISE_ROWS.indexOf(i) * 0.25) : 1) : 0);
    rawPane({ hi: k <= 1 ? 'noise' : null, gone });
    if (k === 0) { tx(526, 50, 'NOISE_PATTERNS', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2) });
      PATS.forEach(([re, name], i) => { const y = 84 + i * 62, s = pop(u, 0.4 + i * 0.35); card(729, y, 410, 48, { rx: 8, stroke: BAD, s });
        mono(540, y + 5, re, { 'font-size': 14, 'font-weight': 700, opacity: s }); tx(930, y + 5, name, { 'font-size': 14, fill: BAD, 'text-anchor': 'end', 'font-weight': 700, opacity: s });
        PAT_ROWS[i].forEach((r) => grow(522, y, 498, LY(r) + 9, E(u, 0.8 + i * 0.35, 1.1 + i * 0.35), BAD, { sw: 1.4, plain: true })); });
      return; }
    if (k === 1) { tx(526, 56, '1) 태그가 있으면 BeautifulSoup', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(540, 110, '<p>근무시간은 …</p>', { 'font-size': 15, opacity: fade(u, 0.4) }); grow(700, 105, 760, 105, E(u, 0.7, 1.0), ACC); mono(770, 110, '근무시간은 …', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      mono(540, 170, 'if "<" in text and ">" in text:', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      tx(540, 230, '이 문서에는 < > 가 없어서', { 'font-size': 15, opacity: fade(u, 1.6) }); tx(540, 256, '이 줄은 건너뛴다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.7) });
      return; }
    if (k === 2) { cleanPane([], { empty: true }); el('rect', { x: 512, y: 22, width: 434, height: 306, rx: 10, fill: PANEL, opacity: fade(u, 0.1) });
      mono(540, 90, 're.sub(pat, "", text,', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(540, 114, '       flags=re.MULTILINE)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(540, 180, '잡음 5줄이 빈 줄로', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      sub(729, 220, '헤더·네비·저작권·광고·푸터', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 3) { const f = E(u, 0.4, 1.4);
      cleanPane(CLEAN6.map(([s, col], i) => [i === 1 ? (f < 0.5 ? '1.1 근무시간은　오전 9시부터 … 한다．' : s) : s, i === 1 && f >= 0.5 ? GOOD : col, fade(u, 0.1 + i * 0.1)]));
      el('rect', { x: 520, y: 82, width: 418, height: 26, rx: 4, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
      mono(526, 290, 'unicodedata.normalize("NFKC", text)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(729, 316, '전각 공백·마침표 → 반각', fade(u, 1.6), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); return; }
    // k 4: 공백 압축
    const f = E(u, 0.4, 1.4);
    cleanPane(CLEAN6.map(([s, col], i) => [i === 0 ? (f < 0.5 ? '제1장   인사규정' : s) : s, i === 0 && f >= 0.5 ? GOOD : col]));
    el('rect', { x: 520, y: 52, width: 418, height: 26, rx: 4, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
    mono(526, 262, 're.sub(r"[ \\t]+", " ", text)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.0) }); mono(526, 288, 're.sub(r"\\n{3,}", "\\n\\n", text)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.2) });
    sub(729, 316, '남은 중복·이미지 줄은 다음 단계가 맡는다', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 3. Dedupe ----------
  const HASH = ['73ea32c6', 'fa4d8f4f', 'edf78d75', 'edf78d75', 'a4e013cb', 'f85c9460'];
  function hashRows(u, k) { // 정제본 6줄 + 해시
    CLEAN6.forEach(([s, col], i) => { const y = 74 + i * 30, dup = i === 3, skip = k >= 2 && dup ? (k === 2 ? E(u, 1.7, 2.1) : 1) : 0;
      if (k >= 3 && dup) return;
      mono(526, y, s.length > 22 ? s.slice(0, 21) + '…' : s, { 'font-size': 13.5, fill: skip > 0.5 ? OFF : col || INK, 'text-decoration': skip > 0.5 ? 'line-through' : null });
      if (k >= 2) { const a = 0.2 + i * 0.25; mono(930, y, HASH[i], { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: dup ? BAD : MUT, opacity: k === 2 ? fade(u, a) : 1 }); } }); }
  function s3(t, c) { const { k, u } = c; meter(c);
    rawPane({ gone: (i) => (NOISE_ROWS.includes(i) || (i === 7 && (k > 2 || (k === 2 && u > 2))) ? 1 : 0) });
    el('rect', { x: 512, y: 22, width: 434, height: 306, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5 }); tx(524, 40, '정제본', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD });
    if (k === 0) { const s = '1.2 연차 휴가는 다음과 같다:';
      mono(526, 80, s, { 'font-size': 14, opacity: fade(u, 0.2) }); grow(729, 92, 729, 120, E(u, 0.5, 0.8), MUT);
      mono(526, 140, '" ".join(text.split())', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) }); grow(729, 152, 729, 180, E(u, 1.0, 1.3), MUT);
      mono(526, 200, 'md5(...).hexdigest()', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
      mono(526, 236, 'edf78d757bb47c6737d2faaa3a77b72f', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      mono(526, 282, '1.2  연차 휴가는   다음과 같다:', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); mono(526, 306, '→ edf78d75…  (공백만 달라 같은 키)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { hashRows(u, 1); const s = pop(u, 0.4);
      el('rect', { x: 600, y: 262, width: 260, height: 52, rx: 26, fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: s }); mono(616, 294, 'seen = set()   # 비어 있음', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: s }); return; }
    if (k === 2) { hashRows(u, 2);
      el('rect', { x: 560, y: 262, width: 370, height: 52, rx: 26, fill: PANEL, stroke: ACC, 'stroke-width': 2.2 });
      const inSet = [0, 1, 2, 4, 5].filter((i, j) => u > 0.4 + i * 0.25 + 0.2); mono(576, 294, `seen: ${inSet.length}개`, { 'font-size': 14, 'font-weight': 700, fill: ACC });
      if (u > 1.4) { tx(700, 298, 'edf78d75 이미 있음 → skip', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); } return; }
    if (k === 3) { hashRows(u, 3); terminal(560, 230, 370, 84, ['$ python dedupe.py', ['중복 제거: 1건', 'var(--hl)']], lerp(0, 2, E(u, 0.3, 1.2)), { fs: 14 }); return; }
    // k 4: 의미가 같은 다른 문장은 못 잡는다
    tx(526, 64, '해시는 글자가 같아야 같다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
    [['1.2 연차 휴가는 다음과 같다:', 'edf78d75'], ['1.2 연차휴가는 아래와 같다:', '95d01b0f']].forEach(([s, h], i) => { const y = 110 + i * 56;
      mono(526, y, s, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.4) }); mono(930, y, h, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: i ? WARN : MUT, opacity: fade(u, 0.6 + i * 0.4) }); });
    tx(526, 220, '뜻은 같아도 해시가 다르다 → 통과', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
    pill(729, 280, 'MinHash · 임베딩 유사도로 따로 거른다', INFO, pop(u, 1.9), { fs: 14 }); }

  // ---------- 4. OCR ----------
  function scanImg(x, y, f, i) { el('rect', { x, y, width: 200, height: 92, rx: 6, fill: SOFT, stroke: INFO, 'stroke-width': 2 });
    for (let r = 0; r < 2; r++) el('line', { x1: x + 16, y1: y + 32 + r * 30, x2: x + 16 + [150, 120][r], y2: y + 32 + r * 30, stroke: INK, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-dasharray': '3 4', opacity: 0.55 });
    if (f > 0 && f < 1) el('line', { x1: x + 4 + 192 * f, y1: y + 4, x2: x + 4 + 192 * f, y2: y + 88, stroke: ACC, 'stroke-width': 3 });
    mono(x + 100, y + 112, `scan_p${3 + i}.png`, { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle' }); }
  function s4(t, c) { const { k, u } = c; meter(c);
    const oc = (i) => (i >= 8 && i <= 9 && k >= 3 ? (k === 3 ? E(u, 0.4 + (i - 8) * 0.5, 0.8 + (i - 8) * 0.5) : 1) : 0);
    rawPane({ gone: (i) => (NOISE_ROWS.includes(i) || i === 7 ? 1 : 0), hi: k <= 2 ? 'image' : null, ocr: oc });
    el('rect', { x: 512, y: 22, width: 434, height: 306, rx: 10, fill: k >= 3 ? GOODBG : PANEL, stroke: k >= 3 ? GOOD : GRID, 'stroke-width': 1.5 });
    if (k === 0) { [['import pytesseract', INFO], ['from PIL import Image', INFO]].forEach(([s, col], i) => pill(729, 90 + i * 56, s, col, pop(u, 0.3 + i * 0.3), { mono: true, fs: 14.5 }));
      sub(729, 220, 'Tesseract 엔진을 파이썬에서 부른다', fade(u, 1.2), { 'font-size': 14.5 }); sub(729, 250, '표적: 9·10번 이미지 줄', fade(u, 1.6), { 'font-size': 15, fill: INFO, 'font-weight': 700 }); return; }
    if (k === 1) { card(729, 100, 380, 56, { rx: 10, stroke: ACC, fill: ACCBG, text: 'ocr_image(path, lang="kor+eng")', fs: 15, mono: true, color: ACC, s: pop(u, 0.3) });
      [['kor', '한글'], ['eng', '영어']].forEach(([a, b], i) => { pill(640 + i * 180, 190, a, INFO, pop(u, 0.9 + i * 0.3), { mono: true, fs: 15 }); sub(640 + i * 180, 226, b, fade(u, 1.0 + i * 0.3)); });
      sub(729, 280, '두 언어 모델을 함께 써서 섞인 글자를 읽는다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { scanImg(540, 60, E(u, 0.3, 1.6), 0); grow(750, 106, 790, 106, E(u, 1.5, 1.8), ACC);
      mono(800, 112, OCR[0], { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      mono(540, 250, 'img = Image.open(path)', { 'font-size': 14, opacity: fade(u, 0.3) }); mono(540, 276, 'image_to_string(img, lang)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      sub(729, 312, '실제로 일하는 줄은 이 두 줄', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 3) { tx(524, 40, '정제본', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD });
      [['제1장 인사규정'], ['1.1 근무시간은 오전 9시부터 오후 6시까지로 한다.'], ['1.2 연차 휴가는 다음과 같다:']].forEach(([s], i) => mono(526, 74 + i * 30, s, { 'font-size': 13.5 }));
      [0, 1].forEach((i) => { const f = E(u, 0.4 + i * 0.5, 0.8 + i * 0.5), y = 164 + i * 30;
        mono(526, y, f < 0.5 ? '[image: scan_p' + (3 + i) + '.png — 스캔 이미지]' : '   ' + OCR[i], { 'font-size': 13.5, fill: f < 0.5 ? INFO : GOOD, 'font-weight': f < 0.5 ? 400 : 700 }); });
      sub(729, 270, 'text.replace(placeholder, extracted)', fade(u, 1.6), { 'font-size': 14, class: 'mono' });
      sub(729, 300, '자리표시 글자보다 짧아 바이트는 줄었다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k 4: 한계
    [['흐린 스캔', 0.45], ['이진화 후', 1]].forEach(([s, op], i) => { const x = 540 + i * 200; el('rect', { x, y: 60, width: 170, height: 90, rx: 6, fill: i ? PANEL : SOFT, stroke: GRID });
      for (let r = 0; r < 2; r++) el('line', { x1: x + 14, y1: y0(r), x2: x + 14 + [130, 100][r], y2: y0(r), stroke: INK, 'stroke-width': i ? 7 : 11, 'stroke-linecap': 'round', opacity: op, 'stroke-dasharray': i ? '3 4' : null });
      tx(x + 85, 176, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.6) }); });
    function y0(r) { return 92 + r * 28; }
    grow(714, 105, 736, 105, E(u, 0.7, 1.0), ACC);
    fileIcon2(590, 260, pop(u, 1.4)); grow(630, 260, 700, 260, E(u, 1.6, 1.9), ACC); mono(712, 266, 'pdf2image → PNG', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
    sub(729, 318, 'OCR 실패는 metadata에 표시해 둔다', fade(u, 2.2), { 'font-size': 14 }); }
  function fileIcon2(cx, cy, s) { const g = G(cx, cy, s, 1); el('path', { d: 'M-26,-34 H14 L26,-22 V34 H-26 Z', fill: PANEL, stroke: INK, 'stroke-width': 2 }, g); el('rect', { x: -26, y: 4, width: 52, height: 18, fill: WARN }, g); tx(0, 18, 'PDF', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: PANEL }, g); }

  // ---------- 5. 파이프라인 ----------
  const ST = [['clean', BAD], ['ocr_inline', INFO], ['len ≥ 50', MUT], ['dedupe', WARN]];
  function belt(u, upto, o) { o = o || {}; el('line', { x1: 60, y1: 200, x2: 900, y2: 200, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    ST.forEach(([s, col], i) => { const x = 170 + i * 200; card(x, 200, 150, 56, { rx: 10, stroke: col, fill: i < upto ? PANEL : SOFT, text: s, fs: 16, mono: true, color: col, s: o.pop ? pop(u, 0.3 + i * 0.3) : 1 }); }); }
  function s5(t, c) { const { k, u } = c; meter(c);
    if (k === 0) { [['clean.py', BAD], ['dedupe.py', WARN], ['ocr.py', INFO]].forEach(([s, col], i) => { const s2 = pop(u, 0.3 + i * 0.3); card(150, 80 + i * 80, 180, 52, { rx: 8, stroke: col, text: s, fs: 15, mono: true, s: s2 }); grow(244, 80 + i * 80, 430, 160, E(u, 0.8 + i * 0.2, 1.2 + i * 0.2), col, { sw: 1.8 }); });
      card(560, 160, 220, 64, { rx: 10, stroke: ACC, fill: ACCBG, text: 'pipeline.py', fs: 17, mono: true, color: ACC, s: pop(u, 1.2) });
      mono(720, 280, 'MIN_LEN = 50', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); sub(720, 306, '50자 미만 조각은 버린다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 1) { belt(u, 4, { pop: true }); ST.forEach((_, i) => { if (i) grow(95 + i * 200, 200, 95 + i * 200 + 0.1, 200, 1, MUT); mono(170 + i * 200, 260, `${i + 1})`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); });
      sub(480, 110, 'preprocess(docs) 한 함수가 순서를 문서로 남긴다', fade(u, 1.6), { 'font-size': 15 }); return; }
    belt(u, 4);
    if (k === 2) { const f = E(u, 0.3, 2.2), x = lerp(60, 470, f); card(x, 140, 70, 46, { rx: 6, stroke: INK, text: 'doc', fs: 14, mono: true });
      if (f > 0.35) check(170, 250, 10, pop(u, 1.0)); if (f > 0.85) check(370, 250, 10, pop(u, 2.0));
      sub(170, 290, '잡음·전각·공백', fade(u, 1.0)); sub(370, 290, '이미지 → 글자', fade(u, 2.0)); return; }
    if (k === 3) { const f = E(u, 0.2, 1.8), x = lerp(470, 880, f); card(x, 140, 70, 46, { rx: 6, stroke: INK, text: 'doc', fs: 14, mono: true });
      mono(570, 280, 'len = 102자 ≥ 50', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.8) }); check(570, 310, 10, pop(u, 1.0));
      mono(770, 280, '중복 1건 제거', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { [['중복 제거', '1건', WARN], ['OCR 복원', '2건', INFO], ['줄 수', '11 → 5', GOOD]].forEach(([a, b, col], i) => { const s = pop(u, 0.3 + i * 0.35);
        card(230 + i * 250, 100, 210, 76, { rx: 10, stroke: col, s }); tx(230 + i * 250, 88, a, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: s }); mono(230 + i * 250, 120, b, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: col, opacity: s }); });
      sub(480, 290, '바이트는 절반 아래로, 남은 글자는 전부 본문', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: ACC }); return; }
    [['정규식은 도메인마다 더한다', BAD], ['dedupe는 정확 중복만 잡는다', WARN], ['OCR 실패는 metadata에 표시한다', INFO]].forEach(([s, col], i) => { check(80 + i * 290, 290, 9, pop(u, 0.4 + i * 0.4)); tx(98 + i * 290, 296, s, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.4) }); }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: '원본을 그대로 청킹하면 헤더·저작권 같은 잡음 줄은 어떻게 되는가?',
      o: ['첫 청크에만 한 번 들어간다', '임베딩 모델이 알아서 무시한다', '페이지마다 반복돼 여러 청크에 박힌다'], a: 2,
      why: '헤더·푸터·저작권은 모든 페이지에 반복된다. 지우지 않으면 청크마다 같은 잡음이 들어가 임베딩을 흐린다.' },
    { q: 'NFKC 정규화가 하는 일로 맞는 것은 무엇인가?',
      o: ['전각 공백(U+3000)·전각 마침표를 반각으로 바꾼다', '광고 줄을 찾아 지운다', '연속 공백을 하나로 줄인다'], a: 0,
      why: 'NFKC는 호환 문자를 표준 문자로 바꾼다. 이 예에서는 260B가 256B로 줄었다. 연속 공백 압축은 그다음 re.sub가 맡는다.' },
    { q: '공백 개수만 다른 두 문장이 dedupe에서 같은 키가 되는 이유는 무엇인가?',
      o: ['MD5가 공백을 무시해서', '해시 전에 " ".join(text.split())로 공백을 정규화해서', 'set이 비슷한 값을 합쳐서'], a: 1,
      why: '공백을 하나로 맞춘 뒤 해시하므로 둘 다 edf78d75로 시작하는 같은 키가 된다. 뜻만 같은 다른 문장은 해시가 달라 못 잡는다.' },
    { q: 'OCR 단계가 꼭 필요한 줄은 어느 것인가?',
      o: ['[image: scan_p3.png] 같은 스캔 이미지 자리', 'Copyright 2024 같은 저작권 줄', '두 번 들어온 1.2 조항'], a: 0,
      why: '스캔 이미지 속 연차 조항은 글자가 아니라 검색에서 통째로 빠진다. OCR로 "1년 미만: 월 1일" 같은 텍스트를 되살린다.' },
    { q: 'preprocess()에서 dedupe를 맨 마지막에 두는 이유로 알맞은 것은 무엇인가?',
      o: ['해시 계산이 가장 느려서', 'OCR이 중복을 만들어 내기 때문에', '정제·OCR을 마친 본문끼리 비교해야 표기 차이로 놓치지 않아서'], a: 2,
      why: '잡음과 전각 문자를 걷어 낸 뒤 비교해야 같은 내용이 같은 해시가 된다. 그래서 clean, OCR, 길이 필터 뒤에 dedupe를 돈다.' },
  ];

  const summary = [
    '로딩한 원본에는 헤더·광고 같은 잡음, 전각 문자, 중복 페이지, 스캔 이미지가 섞여 있다.',
    'clean은 잡음 줄을 정규식으로 지우고 NFKC로 전각 문자를 반각으로 바꾼다.',
    'dedupe는 공백을 맞춘 본문의 MD5로 같은 페이지를 거르고, 뜻만 같은 문장은 못 잡는다.',
    'OCR로 이미지 속 조항을 되살리면 예시 문서는 451B에서 199B가 되고 남은 글자는 모두 본문이다.',
  ];
  const review = [
    { q: '"근무시간은 오전"으로 검색했는데 분명히 있는 조항이 안 나온다. 먼저 의심할 것은?',
      o: ['원문에 전각 공백이 섞여 글자가 다르다', '청크가 너무 크다', 'MD5 해시가 충돌했다'], a: 0,
      why: '눈에는 같은 공백이어도 U+3000은 U+0020과 다른 글자다. NFKC 정규화를 하지 않으면 문자열 검색이 빗나간다.' },
    { q: '사내 규정 RAG가 연차 세부 기준만 유독 못 찾는다. 원본을 보니 그 부분이 [image: …]로 되어 있다. 해결책은?',
      o: ['dedupe 해시를 SHA256으로 바꾼다', '이미지를 OCR로 글자로 바꿔 자리표시를 치환한다', '잡음 정규식을 더 추가한다'], a: 1,
      why: '스캔 이미지 속 내용은 텍스트가 없어 검색 대상이 아니다. OCR 결과로 자리표시를 바꿔야 청크와 임베딩에 들어간다.' },
    { q: '수집 경로가 둘이라 같은 공지가 "다음과 같다"와 "아래와 같다"로 조금씩 다르게 두 번 들어왔다. 해시 dedupe의 결과는?',
      o: ['공백 정규화 덕에 한 건으로 합쳐진다', 'NFKC가 두 표현을 같게 만든다', '해시가 달라 둘 다 남으므로 의미 중복 단계가 따로 필요하다'], a: 2,
      why: '해시는 글자가 같아야 같다. 표현이 다르면 95d01b0f처럼 다른 키가 나와 MinHash나 임베딩 유사도로 다시 걸러야 한다.' },
  ];

  R.page({ title: '원본이 정제되는 과정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
