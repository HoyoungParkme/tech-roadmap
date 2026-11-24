/* IV-1-2 캐싱 — 중복 호출 0원 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   숫자 출처: 페이지 코드 주석(일 4000회, $0.03/호출, hit ratio), 캐시 키 해시는 sha256 실제 계산값.
   임베딩 유사도·일별 hit ratio·대시보드 곡선은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    server, redisBox, person, cross, check, clock, axes, line, kvTable, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const money = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const pct = (s) => { const m = String(s || '').match(/(\d+)%/); return m ? +m[1] : null; };
  // 오른쪽 위: 이번 beat 의 hit ratio 와 월 절감액 (월 $3,600 × hit ratio)
  function hitBadge(c) { const a = pct(c.beat.hitRatio); if (a == null) return; const p = c.prev ? pct(c.prev.hitRatio) : null, v = tween(p, a, c.u);
    el('rect', { x: 716, y: 8, width: 236, height: 56, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(730, 28, 'hit ratio', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); mono(730, 54, Math.round(v) + '%', { 'font-size': 20, 'font-weight': 800, fill: v > 0 ? GOOD : BAD });
    tx(830, 28, '월 절감', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); mono(830, 54, money(3600 * v / 100), { 'font-size': 18, 'font-weight': 800, fill: v > 0 ? GOOD : MUT }); }
  function llmBox(cx, cy, o) { o = o || {}; return card(cx, cy, o.w || 130, 58, { rx: 12, text: o.text || 'LLM API', fs: 16, fw: 800, stroke: o.off ? OFF : INK, color: o.off ? OFF : INK, fill: o.off ? SOFT : PANEL, dash: o.off ? '6 5' : null, s: o.s }); }

  // ───────── 1. 캐시 없음 ─────────
  const LOG = ['환불 정책 알려주세요', '배송 기간은?', '환불 정책 알려주세요', '교환 가능한가요?', '배송 기간은?', '환불 정책 알려주세요', '쿠폰 중복 되나요?', '배송 기간은?'];
  const DUPC = { '환불 정책 알려주세요': ACC, '배송 기간은?': INFO };
  const TOP = [['환불 정책 알려주세요', 320], ['배송 기간은?', 280], ['교환 가능한가요?', 210], ['회원 가입 방법', 180], ['적립금 사용', 165]];
  function s1(t, c) { const { k, u } = c;
    hitBadge(c);
    if (k === 0) { tx(60, 40, '운영 로그 (일부)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      LOG.forEach((q, i) => { const y = 56 + i * 42, s = pop(u, 0.1 + i * 0.12), col = DUPC[q], dup = col && LOG.indexOf(q) < i;
        card(220, y + 16, 320, 34, { rx: 8, stroke: col && u > 1.4 ? col : GRID, sw: col && u > 1.4 ? 2.2 : 1.4, fill: dup && u > 1.4 ? (col === ACC ? ACCBG : INFOBG) : PANEL, s });
        tx(76, y + 22, q, { 'font-size': 14.5, opacity: clamp(s) }); if (dup && u > 1.4) mono(368, y + 22, '중복', { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, 1.5) }); });
      const f = E(u, 1.6, 2.5); tx(480, 140, '같은 질문의 반복', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) });
      el('rect', { x: 480, y: 160, width: 400, height: 34, rx: 6, fill: SOFT }); el('rect', { x: 480, y: 160, width: 240 * f, height: 34, rx: 6, fill: BAD, opacity: 0.85 });
      mono(480 + 240 * f + 10, 184, Math.round(60 * f) + '%', { 'font-size': 20, 'font-weight': 800, fill: BAD });
      sub(680, 230, '전체 트래픽 중', fade(u, 1.6)); return; }
    if (k === 1) { const X = (v) => 330 + v * 1.4; tx(60, 92, '자주 묻는 질문 (일 호출 수)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      TOP.forEach(([q, n], i) => { const y = 110 + i * 46, f = E(u, 0.2 + i * 0.2, 1.0 + i * 0.2); tx(310, y + 20, q, { 'font-size': 15, 'font-weight': 600, 'text-anchor': 'end' });
        el('rect', { x: 330, y, width: (X(n) - 330) * f, height: 28, rx: 5, fill: i ? INFO : ACC, opacity: 0.8 }); mono(X(n) * 1 + 10 - (1 - f) * (X(n) - 330), y + 20, Math.round(n * f) + '', { 'font-size': 15, 'font-weight': 700 }); });
      card(700, 372, 300, 52, { rx: 12, stroke: INK, sw: 2, text: '질문 1000종 · 일 4000회 호출', fs: 16, s: pop(u, 1.6) }); return; }
    if (k === 2) { person(90, 200, '사용자', {}); server(330, 200, 'chat_no_cache()', { lamp: BAD }); llmBox(760, 200, { text: 'gpt-4' });
      el('line', { x1: 120, y1: 200, x2: 272, y2: 200, stroke: GRID, 'stroke-width': 2.5 }); el('line', { x1: 388, y1: 200, x2: 695, y2: 200, stroke: GRID, 'stroke-width': 2.5 });
      const n = Math.min(3, Math.floor(u / 0.8) + 1);
      for (let i = 0; i < 3; i++) { const v = seg(u, i * 0.8, i * 0.8 + 0.9); fly(130, 150, 700, 150, v, '환불 정책 알려주세요', { fill: ACC }); }
      mono(760, 270, `호출 ${n}번째`, { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      cross(420, 300, 10, pop(u, 1.2)); tx(440, 305, '같은 질문인지 보지 않는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); return; }
    if (k === 3) { const x = 120, w = 720, f = E(u, 0.2, 1.0);
      mono(120, 92, '일 4000회 × $0.03 = $120/일 → 월 $3,600', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.1) });
      el('rect', { x, y: 130, width: w * f, height: 60, rx: 8, fill: OFF });
      const g = E(u, 1.0, 1.8); el('rect', { x, y: 130, width: w * 0.6 * g, height: 60, rx: 8, fill: BAD, opacity: 0.85 });
      mono(x + w * 0.3, 167, '$2,160 낭비', { 'font-size': 18, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(x + w * 0.8, 167, '$1,440', { 'font-size': 18, 'font-weight': 800, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(x + w * 0.3, 216, '60% = 이미 한 번 답한 질문', fade(u, 1.8), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); sub(x + w * 0.8, 216, '처음 보는 질문', fade(u, 1.8), { 'font-size': 14 });
      banner(480, 320, '답은 같은데 매번 새로 만든다', pop(u, 2.1)); return; }
    // k4: latency
    tx(60, 100, '응답 시간 (ms)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const X = (ms) => 260 + ms * 0.4;
    [['캐시 없음', 1500, BAD, 0.2], ['hit 1건', 5, GOOD, 0.8], ['평균 (hit 60%)', 603, ACC, 1.4]].forEach(([n, ms, col, at], i) => { const y = 130 + i * 70, f = E(u, at, at + 0.7);
      tx(240, y + 22, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: 260, y, width: Math.max(3, (X(ms) - 260) * f), height: 32, rx: 6, fill: col, opacity: 0.85 });
      mono(X(ms) + 12, y + 22, i === 2 ? '약 600ms' : ms + 'ms', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, at + 0.5) }); });
    sub(480, 380, '0.4 × 1500 + 0.6 × 5 ≈ 600ms, 비용도 60% 준다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ───────── 2. Exact match ─────────
  const P = { px: 70, sx: 270, rx: 560, ry: 120, lx: 560, ly: 330 };
  function exactBase(o) { o = o || {}; person(P.px, 220, null, {}); server(P.sx, 220, null, { lamp: o.lamp });
    el('line', { x1: P.px + 30, y1: 220, x2: P.sx - 58, y2: 220, stroke: GRID, 'stroke-width': 2.5 });
    el('line', { x1: P.sx + 58, y1: 205, x2: P.rx - 70, y2: P.ry + 10, stroke: ACC, 'stroke-width': 2.5, opacity: 0.6 });
    el('line', { x1: P.sx + 58, y1: 240, x2: P.lx - 70, y2: P.ly, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': o.llmOff ? '5 6' : null });
    redisBox(P.rx, P.ry, { sub: 'TTL 24h', w: 140 }); llmBox(P.lx, P.ly, { off: o.llmOff }); }
  const toR = [[P.px + 30, 220], [P.sx - 58, 220], [P.sx + 58, 205], [P.rx - 70, P.ry + 10]];
  function s2(t, c) { const { k, u } = c;
    hitBadge(c);
    if (k === 0) { const s = pop(u, 0.2); redisBox(300, 200, { sub: 'localhost:6379', w: 200, h: 80, s });
      clock(600, 200, 56, 0.75 * E(u, 0.8, 2.2), WARN, 'CACHE_TTL = 3600 × 24');
      tx(600, 290, '24시간 보관 후 자동 삭제', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      sub(300, 270, 'key → 답변 (KV 스토어)', fade(u, 0.8), { 'font-size': 15 }); return; }
    if (k === 1) { const rows = [['question', '"  환불 정책?  "', INK], ['strip().lower()', '"환불 정책?"', INK], ['+ prompt_version', '"v3::환불 정책?"', INFO], ['sha256[:16]', 'llm:exact:464206d7860286dd', ACC]];
      rows.forEach(([a, b, col], i) => { const y = 100 + i * 75, f = fade(u, 0.2 + i * 0.5);
        tx(250, y + 6, a, { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: f });
        card(520, y, 420, 46, { rx: 10, stroke: i === 3 ? ACC : GRID, sw: i === 3 ? 2.5 : 1.5, fill: i === 3 ? ACCBG : PANEL, text: b, mono: true, fs: 15, color: col, s: f > 0 ? 1 : 0, op: f });
        if (i) grow(520, y - 52, 520, y - 25, seg(u, 0.05 + i * 0.5, 0.3 + i * 0.5), MUT); });
      sub(830, 316, 'v4로 바꾸면 키가 달라져', fade(u, 2.2), { fill: INFO, 'font-weight': 700 }); sub(830, 336, '옛 캐시는 자동으로 안 맞는다', fade(u, 2.2), { fill: INFO, 'font-weight': 700 }); return; }
    if (k === 2) { exactBase({ lamp: GOOD, llmOff: true });
      dot(toR, seg(u, 0.2, 1.0), ACC, 7); dot(toR.slice().reverse(), seg(u, 1.1, 1.9), GOOD, 7);
      pill(P.rx + 130, P.ry, 'HIT', GOOD, pop(u, 0.9), { mono: true });
      tx(P.lx + 80, P.ly + 6, 'LLM 호출 없음 · $0', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      sub(P.sx, 300, 'cache_hit +1, 응답 5ms', fade(u, 1.8), { 'font-weight': 700, fill: GOOD }); return; }
    if (k === 3) { exactBase({ lamp: WARN });
      dot(toR, seg(u, 0.1, 0.7), ACC, 7); pill(P.rx + 130, P.ry, 'MISS', WARN, pop(u, 0.6), { mono: true });
      dot([[P.sx + 58, 240], [P.lx - 70, P.ly]], seg(u, 0.8, 1.3), INK, 7); dot([[P.lx - 70, P.ly - 10], [P.rx - 20, P.ry + 30]], seg(u, 1.4, 2.0), ACC, 7);
      fly(P.lx + 70, P.ly - 40, P.rx + 150, P.ry + 60, seg(u, 1.4, 2.2), 'setex(key, TTL, answer)', { mono: true, stay: true, fill: INFO });
      sub(P.sx, 300, '다음 같은 질문은 hit', fade(u, 2.3), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { mono(70, 96, 'hit_ratio = hits / (hits + misses)', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.1) });
      const ax = axes(110, 140, 480, 200, { x: [0, 30], y: [0, 50], xt: [1, 7, 30], yt: [0, 25, 50], xl: '운영 일수 (예시)', yl: 'hit ratio %', grid: true });
      const pts = [[1, 15], [7, 28], [30, 35]]; line(ax, pts, E(u, 0.3, 1.8), GOOD); pts.forEach(([d, v], i) => { const op = fade(u, 0.4 + i * 0.6); el('circle', { cx: ax.X(d), cy: ax.Y(v), r: 6, fill: GOOD, opacity: op }); mono(ax.X(d), ax.Y(v) - 12, v + '%', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); });
      card(790, 230, 260, 100, { rx: 12, stroke: GOOD, sw: 2, text: 'hit 35%\n= 비용 35% 절감\n$3,600 → $2,340', fs: 16, color: INK, s: pop(u, 2.0) }); return; }
    // k5: 한계
    [['환불 정책?', '464206d7860286dd', true], ['환불 정책 알려줘', '4e5f85c57bc0c9dd', false], ['환불정책', 'b213cefaa20da9c4', false]].forEach(([q, h, ok], i) => { const y = 90 + i * 90, f = fade(u, 0.2 + i * 0.5);
      card(200, y, 250, 50, { rx: 10, text: q, fs: 16, stroke: ok ? GOOD : WARN, s: f > 0 ? 1 : 0, op: f }); grow(330, y, 400, y, seg(u, 0.4 + i * 0.5, 0.7 + i * 0.5), MUT);
      mono(410, y + 5, 'llm:exact:' + h, { 'font-size': 15, fill: ok ? GOOD : BAD, opacity: fade(u, 0.6 + i * 0.5) });
      if (i) { cross(860, y, 10, pop(u, 0.9 + i * 0.5)); mono(880, y + 5, 'MISS', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9 + i * 0.5) }); } else { mono(880, y + 5, '저장됨', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: f }); } });
    sub(480, 370, '뜻이 같아도 글자가 하나 다르면 해시가 완전히 다르다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ───────── 3. Semantic ─────────
  // 2D 로 줄여 그린 임베딩 공간 (위치는 예시)
  const SP = { cx: 330, cy: 235, r: 150 };
  const STORED = [['환불 정책 알려주세요', -30, -20, ACC], ['배송 기간은?', 80, 60, INFO], ['교환 가능한가요?', -90, 70, WARN], ['회원 가입 방법', 60, -90, GOOD]];
  function space(u, o) { o = o || {}; el('circle', { cx: SP.cx, cy: SP.cy, r: SP.r, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(SP.cx - SP.r, SP.cy - SP.r - 6, 'faiss IndexFlatIP(1536)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    STORED.forEach(([q, dx, dy, col], i) => { const s = o.appear ? pop(u, 0.3 + i * 0.25) : 1; if (s <= 0) return; el('circle', { cx: SP.cx + dx, cy: SP.cy + dy, r: 7 * clamp(s, 0, 1.3), fill: col });
      tx(SP.cx + dx + 12, SP.cy + dy + 5, q, { 'font-size': 13.5, fill: INK, opacity: clamp(s) }); }); }
  function s3(t, c) { const { k, u } = c;
    hitBadge(c);
    if (k === 0) { card(150, 130, 220, 50, { rx: 10, text: '"환불은 어떻게?"', fs: 16, s: pop(u, 0.1) }); grow(260, 130, 360, 130, seg(u, 0.4, 0.8), MUT);
      card(450, 130, 170, 50, { rx: 10, text: 'embed()', mono: true, fs: 16, stroke: INFO, color: INFO, s: pop(u, 0.6) });
      grow(540, 130, 600, 130, seg(u, 0.9, 1.2), MUT);
      for (let i = 0; i < 24; i++) { const h = 14 + Math.abs(Math.sin(i * 2.7 + 1)) * 50 * (Math.sin(i * 1.3) > 0 ? 1 : -1), f = E(u, 1.1 + i * 0.03, 1.5 + i * 0.03);
        el('rect', { x: 614 + i * 13, y: h > 0 ? 130 - h * f : 130, width: 10, height: Math.abs(h) * f, rx: 2, fill: h > 0 ? ACC : INFO, opacity: 0.8 }); }
      sub(770, 210, '1536차원 벡터 (앞 24개, 모양은 예시)', fade(u, 1.6));
      card(480, 320, 380, 60, { rx: 12, stroke: GRID, text: 'text-embedding-3-small · $0.02 / 1M tokens', fs: 15, s: pop(u, 2.0) }); return; }
    if (k === 1) { space(u, { appear: true });
      card(750, 160, 260, 60, { rx: 10, text: 'threshold = 0.95', mono: true, fs: 17, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      sub(750, 220, '정규화 벡터의 내적 = cosine 유사도', fade(u, 1.7)); sub(750, 244, '0.95 이상이면 같은 질문으로 본다', fade(u, 1.9)); return; }
    if (k === 2 || k === 3) { space(u, {});
      const hit = k === 2, q = hit ? ['환불은 어떻게?', -10, -48] : ['포장 박스 버려도 되나요?', -40, 130], f = E(u, 0.2, 1.0);
      const qx = lerp(840, SP.cx + q[1], f), qy = lerp(80, SP.cy + q[2], f);
      el('circle', { cx: qx, cy: qy, r: 8, fill: PANEL, stroke: INK, 'stroke-width': 3 }); tx(qx + 12, qy - 8, q[0], { 'font-size': 14, 'font-weight': 700 });
      const nx = SP.cx + (hit ? -30 : -90), ny = SP.cy + (hit ? -20 : 70);
      if (u > 1.0) grow(qx, qy, nx, ny, seg(u, 1.0, 1.4), hit ? GOOD : WARN, { plain: true, dash: '5 4' });
      if (hit) { card(760, 200, 250, 90, { rx: 12, stroke: GOOD, sw: 2, text: 'top-1 유사도 0.96\n≥ 0.95 → HIT', fs: 17, color: GOOD, s: pop(u, 1.5) }); sub(760, 268, '유사도 값은 예시', fade(u, 1.8)); }
      else { card(760, 170, 250, 80, { rx: 12, stroke: WARN, sw: 2, text: '가장 가까워도 < 0.95\nMISS → LLM 호출', fs: 16, color: WARN, s: pop(u, 1.4) });
        mono(760, 270, 'index.add(q_emb)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
        sub(760, 296, '캐시 항목 4 → 5', fade(u, 2.2), { 'font-weight': 700, fill: INK }); }
      return; }
    if (k === 4) { const steps = [['cache.get(q)', 150, INK], ['hit → 바로 반환', 330, GOOD], ['miss → call_llm()', 550, WARN], ['cache.set(q, a)', 770, ACC]];
      steps.forEach(([s, x, col], i) => { card(x, 160, 190, 54, { rx: 12, text: s, mono: true, fs: 15, stroke: col, color: col, s: pop(u, 0.2 + i * 0.4) }); if (i) grow(steps[i - 1][1] + 97, 160, x - 97, 160, seg(u, 0.3 + i * 0.4, 0.6 + i * 0.4), MUT); });
      ['exact: r.get(key)', 'semantic: index.search(k=1)'].forEach((s, i) => mono(150, 260 + i * 34, s, { 'font-size': 15, fill: i ? ACC : MUT, opacity: fade(u, 1.8 + i * 0.3) }));
      sub(600, 290, '바뀐 것은 "찾는 방법" 하나뿐', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { const X = (v) => 360 + (v - 0.85) / 0.15 * 480; tx(60, 76, '유사도 (예시 값)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      [['"환불 정책 알려주세요"', 1.0, '저장'], ['"환불은 어떻게?"', 0.96, 'HIT'], ['"환불 가능한가요?"', 0.93, 'MISS'], ['"리펀드 어떡해?"', 0.92, 'MISS']].forEach(([q, v, r], i) => { const y = 100 + i * 60, f = E(u, 0.2 + i * 0.35, 0.9 + i * 0.35), col = r === 'HIT' ? GOOD : r === 'MISS' ? WARN : MUT;
        tx(340, y + 20, q, { 'font-size': 15, 'font-weight': 600, 'text-anchor': 'end' }); el('rect', { x: 360, y, width: Math.max(3, (X(v) - 360) * f), height: 30, rx: 5, fill: col, opacity: 0.8 });
        if (i) mono(X(v) + 10, y + 21, v.toFixed(2) + ' ' + r, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.8 + i * 0.35) }); });
      el('line', { x1: X(0.95), y1: 86, x2: X(0.95), y2: 340, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); mono(X(0.95), 362, '0.95', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
      return; }
    // k6: threshold 위험
    const X = (v) => 120 + (v - 0.80) / 0.20 * 720; el('line', { x1: X(0.8), y1: 200, x2: X(1.0), y2: 200, stroke: MUT, 'stroke-width': 3 });
    [0.80, 0.85, 0.90, 0.95, 1.0].forEach((v) => mono(X(v), 228, v.toFixed(2), { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }));
    el('rect', { x: X(0.93), y: 176, width: X(0.96) - X(0.93), height: 48, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.6) });
    tx((X(0.93) + X(0.96)) / 2, 166, '권장 0.93~0.96', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
    const k1 = pop(u, 0.2); el('circle', { cx: X(0.85), cy: 200, r: 9 * clamp(k1), fill: BAD });
    card(X(0.85), 300, 300, 76, { rx: 12, stroke: BAD, sw: 2, text: '0.85: "환불 가능?" 과 "환불 불가?"\n가 같은 질문으로 hit', fs: 14.5, color: BAD, s: pop(u, 0.4) });
    el('circle', { cx: X(0.99), cy: 200, r: 9 * clamp(pop(u, 0.9)), fill: WARN });
    card(X(0.99) - 60, 100, 220, 54, { rx: 12, stroke: WARN, sw: 2, text: '0.99: hit이 거의 없다', fs: 15, color: WARN, s: pop(u, 1.0) }); }

  // ───────── 4. TTL ─────────
  const TTL = [['pricing', 1, '1h', 0.20], ['promotion', 3, '3h', 0.30], ['shipping', 12, '12h', 0.55], ['policy', 24, '1d', 0.65], ['faq', 168, '7d', 0.80], ['general', 24, '1d', 0.45]];
  const TX = (h) => 220 + Math.log10(h) / Math.log10(168) * 560;
  function ttlBars(u, o) { o = o || {};
    [1, 24, 168].forEach((h) => { el('line', { x1: TX(h), y1: 70, x2: TX(h), y2: 70 + TTL.length * 46, stroke: GRID, 'stroke-dasharray': '3 4' }); });
    TTL.forEach(([n, h, lab], i) => { const y = 80 + i * 46, f = o.f ? o.f(i) : 1, hh = o.h ? o.h(i) : h, hi = o.hi === i;
      mono(200, y + 20, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: hi ? ACC : INK });
      el('rect', { x: 220, y, width: Math.max(4, (TX(hh) - 220) * f), height: 28, rx: 5, fill: hi ? ACC : WARN, opacity: o.dim && !hi ? 0.35 : 0.8 });
      mono(TX(hh) * 1 + 10 - (1 - f) * (TX(hh) - 220), y + 20, o.h ? (hh >= 24 ? (hh / 24).toFixed(0) + 'd' : Math.round(hh) + 'h') : lab, { 'font-size': 14.5, 'font-weight': 700, opacity: f }); });
    mono(TX(1), 72 + TTL.length * 46 + 18, '1시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(TX(24), 72 + TTL.length * 46 + 18, '1일', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(TX(168), 72 + TTL.length * 46 + 18, '7일', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tx(220, 50, '카테고리별 TTL (로그 눈금)', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); ttlBars(u, { f: (i) => E(u, 0.2 + i * 0.25, 0.9 + i * 0.25) });
      sub(870, 120, '자주 바뀌면 짧게', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); sub(870, 290, '거의 안 바뀌면 길게', fade(u, 2.0), { fill: WARN, 'font-weight': 700 }); return; }
    if (k === 1) { ttlBars(u, { hi: 0, dim: true });
      card(860, 90, 180, 46, { rx: 10, text: '"할인가 얼마예요?"', fs: 14.5, s: pop(u, 0.1) }); grow(860, 113, 860, 160, seg(u, 0.4, 0.7), MUT);
      card(860, 186, 180, 46, { rx: 10, text: 'classify_question()', mono: true, fs: 13.5, stroke: INFO, color: INFO, s: pop(u, 0.6) });
      grow(860, 209, 860, 250, seg(u, 0.9, 1.2), MUT); pill(860, 270, 'pricing → 1시간', ACC, pop(u, 1.3), { fs: 15 });
      sub(860, 320, '모르면 general (1일)', fade(u, 2.0), { 'font-weight': 700 }); return; }
    if (k === 2) { const T4 = [['TTL 만료', '자연 만료', MUT], ['프롬프트 v3 → v4', '키가 바뀌어 자동 무효', INFO], ['정책 변경 알람', '관리자가 그 카테고리만', WARN], ['사고 후 응급', '문제된 답을 즉시 비움', BAD]];
      T4.forEach(([a, b, col], i) => { const cx = 135 + i * 230, s = pop(u, 0.2 + i * 0.4); card(cx, 190, 210, 150, { rx: 14, stroke: col, sw: 2.2, s });
        mono(cx, 150, String(i + 1), { 'font-size': 28, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: clamp(s) });
        tx(cx, 200, a, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(s) }); tx(cx, 228, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: clamp(s) }); });
      sub(480, 330, '2번은 키에 버전을 넣은 덕에 따로 할 일이 없다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const rows = [['llm:exact:policy:…', '환불은 7일 이내', 'policy'], ['llm:exact:faq:…', '영업시간 9~18시', 'faq'], ['llm:exact:policy:…', '교환은 1회', 'policy'], ['llm:exact:pricing:…', '배송비 3,000원', 'pricing'], ['llm:exact:policy:…', '적립 1%', 'policy']];
      const del = (i) => rows[i][2] === 'policy' && u > 1.0 + i * 0.25;
      kvTable(80, 80, 560, rows.map(([kk, v], i) => [kk, v, { gone: del(i) }]), { title: 'Redis', kw: 300, rh: 42 });
      mono(700, 120, 'scan_iter("llm:*:policy:*")', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
      tx(700, 160, 'policy 키 3개만 지운다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); tx(700, 186, 'faq · pricing은 그대로 hit', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(360, 360, '키에 카테고리를 넣어 둬야 이 패턴이 맞는다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4) { tx(120, 50, '카테고리별 hit ratio (코드의 예시 값)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      TTL.slice().sort((a, b) => a[3] - b[3]).forEach(([n, h, lab, r], i) => { const y = 70 + i * 48, f = E(u, 0.2 + i * 0.2, 0.9 + i * 0.2);
        mono(220, y + 20, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); mono(270, y + 20, lab, { 'font-size': 14, fill: WARN, 'text-anchor': 'end', 'font-weight': 700 });
        el('rect', { x: 290, y, width: 480 * r * f, height: 30, rx: 5, fill: GOOD, opacity: 0.4 + r * 0.6 }); mono(290 + 480 * r * f + 10, y + 21, r.toFixed(2), { 'font-size': 15, 'font-weight': 800, opacity: f }); });
      sub(480, 380, 'TTL이 길수록 대체로 높다. general처럼 같은 1d여도 다를 수 있다', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { const X = (s) => 120 + s * 130; el('line', { x1: X(0), y1: 120, x2: X(5.6), y2: 120, stroke: MUT, 'stroke-width': 2 });
      tx(X(0), 100, '시간 →', { 'font-size': 13.5, fill: MUT }); el('line', { x1: X(2), y1: 80, x2: X(2), y2: 330, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); mono(X(2), 72, 'TTL 만료', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN });
      el('rect', { x: X(0), y: 140, width: X(2) - X(0), height: 26, rx: 5, fill: GOOD, opacity: 0.7 }); tx(X(0) + 10, 158, 'fresh', { 'font-size': 14, fill: PANEL, 'font-weight': 700 });
      const a = E(u, 0.3, 1.0); el('rect', { x: X(2), y: 140, width: (X(3.2) - X(2)) * a, height: 26, rx: 5, fill: WARN, opacity: 0.7 }); tx(X(2) + 10, 158, 'stale', { 'font-size': 14, fill: PANEL, 'font-weight': 700, opacity: a });
      const b = E(u, 1.2, 1.7); el('rect', { x: X(3.2), y: 140, width: (X(5.6) - X(3.2)) * b, height: 26, rx: 5, fill: GOOD, opacity: 0.7 }); tx(X(3.2) + 10, 158, 'fresh (갱신됨)', { 'font-size': 14, fill: PANEL, 'font-weight': 700, opacity: b });
      person(X(2.6), 240, null, { s: 0.8 }); fly(X(2.6) + 30, 210, X(2.6) + 30, 180, seg(u, 0.3, 0.6), '요청', { fill: INK });
      pill(X(2.6) + 150, 230, 'stale 답 즉시 반환 (지연 0)', GOOD, pop(u, 0.7), { fs: 14 });
      const g = E(u, 0.9, 1.9); el('rect', { x: X(2.6), y: 290, width: (X(3.2) - X(2.6)) * g, height: 22, rx: 4, fill: INFO, opacity: 0.8 }); tx(X(2.6), 336, 'background_revalidate(): LLM 호출 후 캐시 갱신', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) });
      return; }
    // k6: 운영 가이드
    const f = E(u, 1.0, 2.2); tx(220, 50, f < 0.5 ? '첫 도입: 모두 24시간' : '한 달 뒤: hit ratio 보고 카테고리별 조정', { 'font-size': 15, fill: f < 0.5 ? MUT : ACC, 'font-weight': 700 });
    ttlBars(u, { h: (i) => Math.exp(lerp(Math.log(24), Math.log(TTL[i][1]), f)) }); }

  // ───────── 5. 모니터링 ─────────
  const LAY = [['1층 Exact', 'r.get(key)', 35, GOOD, '$0'], ['2층 Semantic', 'index.search', 30, ACC, '임베딩 비용만'], ['3층 LLM', 'call_llm()', 35, BAD, '과금']];
  function funnel(k, u) { const x0 = 330, w = 560;
    LAY.forEach(([n, f, share, col, costT], i) => { const y = 70 + i * 100, on = i <= k - 1, act = i === k - 1, a = act ? fade(u, 0.1) : on ? 1 : 0.25;
      el('rect', { x: 40, y, width: 260, height: 74, rx: 12, fill: on ? PANEL : SOFT, stroke: on ? col : GRID, 'stroke-width': on ? 2.5 : 1.5, opacity: Math.max(0.35, a) });
      tx(58, y + 30, n, { 'font-size': 16, 'font-weight': 800, fill: on ? col : MUT }); mono(58, y + 56, f, { 'font-size': 14, fill: MUT });
      if (!on) return; const g = act ? E(u, 0.3, 1.4) : 1;
      el('rect', { x: x0, y: y + 18, width: w * share / 100 * g, height: 38, rx: 6, fill: col, opacity: 0.8 });
      mono(x0 + w * share / 100 * g + 10, y + 44, `${share}% ${i === 2 ? '' : 'hit'}`, { 'font-size': 16, 'font-weight': 800, opacity: g });
      tx(x0 + w * share / 100 + 100, y + 44, costT, { 'font-size': 14, fill: MUT, opacity: act ? fade(u, 1.2) : 1 });
      if (i < 2) for (let j = 0; j < 5; j++) dot([[300, y + 37], [x0, y + 37]], ((u * 0.7 + j / 5) % 1), col, 4); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['llm_cache_hits_total', 'type="exact" | "semantic"'], ['llm_cache_misses_total', 'type="exact" | "semantic"']].forEach(([n, l], i) => { const y = 90 + i * 90, s = pop(u, 0.2 + i * 0.3);
        card(220, y, 360, 70, { rx: 12, stroke: GRID, sw: 1.6, s }); mono(56, y - 8, n, { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: clamp(s) }); mono(56, y + 18, l, { 'font-size': 14, fill: MUT, opacity: clamp(s) }); });
      tx(480, 60, 'llm_cache_similarity 버킷 (높이는 예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.8) });
      const B = [0.7, 0.8, 0.85, 0.90, 0.93, 0.95, 0.97, 0.99, 1.0], H = [10, 18, 26, 40, 60, 90, 120, 80, 30];
      B.forEach((b, i) => { const x = 490 + i * 50, h = H[i] * E(u, 1.0 + i * 0.08, 1.6 + i * 0.08); el('rect', { x, y: 260 - h, width: 40, height: h, rx: 3, fill: b >= 0.95 ? GOOD : OFF, opacity: 0.85 });
        mono(x + 20, 282, String(b), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      sub(690, 320, '0.95 오른쪽이 hit', fade(u, 2.0), { fill: GOOD, 'font-weight': 700 }); return; }
    if (k <= 3) { funnel(k, u); mono(330, 50, '요청 100건이 내려가는 길', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      if (k === 2) { el('path', { d: 'M300,190 C330,150 330,130 300,108', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.5), 'marker-end': 'url(#ra-ahb)' });
        tx(40, 392, 'semantic hit의 답을 exact에도 넣어 다음엔 1층에서 끝낸다', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); }
      if (k === 3) tx(40, 392, '과금되는 것은 둘 다 miss인 35%뿐, 답은 두 캐시에 모두 저장', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      return; }
    if (k === 4) { const ax = axes(90, 60, 520, 260, { x: [0, 24], y: [0, 100], yt: [0, 30, 60, 100], xl: '시간 (예시)', yl: 'hit ratio %', grid: true });
      const pts = []; for (let h = 0; h <= 24; h++) pts.push([h, 60 + Math.sin(h * 0.9) * 5]); line(ax, pts, E(u, 0.2, 1.6), GOOD);
      tx(ax.X(24) + 8, ax.Y(60) + 5, '목표 60%', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(700, 90, 'hit by type', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      [0, 1, 2, 3, 4].forEach((i) => { const f = E(u, 0.6 + i * 0.2, 1.2 + i * 0.2), a = 35 * f, b = 25 * f; el('rect', { x: 710 + i * 46, y: 320 - (a + b) * 2.5, width: 34, height: b * 2.5, fill: ACC, opacity: 0.8 }); el('rect', { x: 710 + i * 46, y: 320 - a * 2.5, width: 34, height: a * 2.5, fill: GOOD, opacity: 0.8 }); });
      el('rect', { x: 710, y: 344, width: 12, height: 12, fill: GOOD }); tx(728, 355, 'exact', { 'font-size': 13.5 }); el('rect', { x: 800, y: 344, width: 12, height: 12, fill: ACC }); tx(818, 355, 'semantic', { 'font-size': 13.5 }); return; }
    if (k === 5) { const ax = axes(90, 60, 520, 260, { x: [0, 24], y: [0, 100], yt: [0, 30, 60, 100], xl: '시간 (예시)', yl: 'hit ratio %', grid: true });
      const pts = []; for (let h = 0; h <= 24; h++) pts.push([h, h < 14 ? 60 + Math.sin(h * 0.9) * 5 : 18 + Math.sin(h) * 3]); line(ax, pts, E(u, 0.2, 1.4), GOOD);
      el('line', { x1: ax.X(0), y1: ax.Y(30), x2: ax.X(24), y2: ax.Y(30), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      el('line', { x1: ax.X(14), y1: 60, x2: ax.X(14), y2: 320, stroke: INFO, 'stroke-width': 2 }); tx(ax.X(14) + 6, 78, '프롬프트 v4 배포', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.8) });
      ['hit ratio < 30%', 'hit ratio 급락', '유사도 분포 이동'].forEach((s, i) => pill(800, 130 + i * 60, s, i < 2 ? BAD : WARN, pop(u, 1.4 + i * 0.3), { fs: 14 }));
      return; }
    // k6: ROI
    const X = (v) => 260 + v * 0.28; [['운영 비용', 50, BAD, '$50 / 월'], ['절감', 2000, GOOD, '$2,000+ / 월']].forEach(([n, v, col, s], i) => { const y = 110 + i * 80, f = E(u, 0.2 + i * 0.5, 1.0 + i * 0.5);
      tx(240, y + 26, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: 260, y, width: Math.max(4, (X(v) - 260) * f), height: 40, rx: 6, fill: col, opacity: 0.85 });
      mono(X(v) + 12, y + 27, s, { 'font-size': 17, 'font-weight': 800, opacity: f }); });
    banner(480, 320, 'ROI 40배 · 도입은 1인-주', pop(u, 1.8)); sub(480, 370, 'Redis + 임베딩 운영비 대비 LLM 호출 절감', fade(u, 2.0)); }

  // ───────── 확인 문제 ─────────
  const quiz = [
    { q: '하루 4000번 호출, 호출당 $0.03인 FAQ 챗봇에서 캐시가 없을 때 낭비되는 월 금액은 얼마인가?',
      o: ['$1,440', '$2,160', '$3,600'], a: 1,
      why: '월 $3,600 중 60%가 이미 답한 질문의 반복이다. $3,600 × 0.6 = $2,160이 같은 답을 다시 만드는 데 쓰인다.' },
    { q: 'exact 캐시 키에 prompt_version을 넣는 이유는 무엇인가?',
      o: ['프롬프트를 v4로 바꾸면 키가 달라져 옛 답이 자동으로 안 맞게 하려고', '해시 충돌을 줄이려고', 'Redis 메모리를 아끼려고'], a: 0,
      why: '"v3::환불 정책?"과 "v4::환불 정책?"은 해시가 다르다. 배포만 해도 옛 프롬프트로 만든 답은 hit 되지 않는다.' },
    { q: 'semantic 캐시 threshold를 0.85로 낮추면 생기는 위험은 무엇인가?',
      o: ['hit가 거의 나지 않는다', '임베딩 비용이 두 배가 된다', '"환불 가능?"과 "환불 불가?"처럼 뜻이 반대인 질문이 같은 답을 받는다'], a: 2,
      why: '낮은 threshold는 hit를 늘리지만 비슷하게 생긴 반대 의미 질문까지 묶는다. 권장 범위는 0.93~0.96이다.' },
    { q: '환불 정책이 바뀐 날 가장 알맞은 캐시 처리는 무엇인가?',
      o: ['Redis 전체를 flush 한다', '키 패턴으로 policy 카테고리 키만 지운다', 'TTL이 끝날 때까지 기다린다'], a: 1,
      why: '전체를 비우면 faq처럼 멀쩡한 hit까지 날아간다. invalidate_by_category로 해당 카테고리만 지운다.' },
    { q: '다층 캐시에서 exact 1층을 semantic 2층보다 먼저 보는 이유는 무엇인가?',
      o: ['조회가 가장 싸고 빨라서 hit면 임베딩 비용도 들지 않기 때문이다', 'exact가 hit ratio가 더 높기 때문이다', 'semantic은 miss를 기록하지 못하기 때문이다'], a: 0,
      why: '1층 hit는 Redis 조회 한 번으로 끝난다. 2층은 질문마다 임베딩을 만들어야 하니 싼 층부터 내려간다.' },
  ];

  const summary = [
    'FAQ 챗봇 트래픽의 60%는 같은 질문의 반복이고, 캐시가 없으면 그만큼 돈과 시간이 샌다.',
    'exact 캐시는 정규화한 질문과 프롬프트 버전을 키로 쓴다. 글자가 다르면 miss다.',
    'semantic 캐시는 임베딩 유사도가 0.95를 넘으면 hit다. 너무 낮추면 엉뚱한 답이 나간다.',
    'TTL은 카테고리별로 다르게 주고, hit ratio를 매시간 본다. 급락은 배포나 모델 변경의 신호다.',
  ];
  const review = [
    { q: '프롬프트를 v4로 배포한 직후 hit ratio가 60%에서 18%로 떨어졌다. 먼저 의심할 것은?',
      o: ['Redis 서버가 메모리 부족으로 죽었다', '키의 프롬프트 버전이 바뀌어 옛 답이 miss가 됐다', '사용자 질문이 갑자기 길어졌다'], a: 1,
      why: '키에 prompt_version이 들어 있어 배포 순간 옛 답은 모두 miss가 된다. 의도된 무효화라면 다시 차오르는지 지켜본다.' },
    { q: '"환불 정책?"은 hit인데 "환불 정책 알려줘"는 매번 LLM을 부른다. 가장 맞는 다음 조치는?',
      o: ['exact 앞에 strip을 한 번 더 한다', 'TTL을 7일로 늘린다', 'exact 다음 층에 semantic 캐시를 둔다'], a: 2,
      why: '두 문장은 해시가 완전히 다르다. 뜻이 같은 표현을 묶으려면 임베딩 유사도로 찾는 semantic 층이 필요하다.' },
    { q: '가격 답변의 hit ratio가 0.20으로 낮다. 무작정 TTL을 7일로 늘리면 생기는 문제는?',
      o: ['바뀐 가격 대신 옛 가격이 나간다', '임베딩 비용이 늘어난다', 'Redis 키가 사라진다'], a: 0,
      why: 'pricing은 자주 바뀌어 1시간을 준 카테고리다. hit를 올리려 TTL을 늘리면 틀린 답이 나간다. 필요하면 stale-while-revalidate를 쓴다.' },
  ];

  R.page({ title: '캐시 hit / miss 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
