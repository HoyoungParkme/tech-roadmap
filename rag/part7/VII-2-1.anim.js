/* VII-2-1 프로덕션 RAG 운영 체크리스트 — 장면 4개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 아래 48칸 점검표(4축 × 12)가 beat 마다 progress.done 만큼 차오르고, 위에는 그 beat 의 설정이 실제로 하는 일을 그린다
 *       (512 tok 청크와 15% 겹침, 메타 7필드, 중복 제거, 20 → 4 리랭크, 70:30 A/B, 캐시 0.95 …).
 * 숫자: 페이지 STEPS 의 progress 와 설정 파일(yaml·md)에 적힌 값. 문서 길이 2,000 tok·예시 문장처럼 설정에 없는 것은 "예시"로 표시한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const tag = (x, y, s, op) => pill(x, y, s, WARN, 1, { fs: 13.5, op: op ?? 1, fill: WARNBG });
  const head = (s, op) => tx(30, 36, s, { 'font-size': 17, 'font-weight': 800, opacity: op ?? 1 });

  // ---------- 공통: 48칸 점검표 ----------
  const AX = ['Data', 'Retrieval', 'Generation', 'Ops'];
  function board(c) { const b = c.beat, p = c.prev || {}, done = tween(p.progress ? p.progress.done : 0, b.progress.done, c.u), y = 378;
    AX.forEach((name, g) => { const x0 = 30 + g * 228, focus = ['data', 'retrieval', 'generation', 'ops'][g] === b.focus, ok = b.axisStates[['data', 'retrieval', 'generation', 'ops'][g]] === 'done';
      tx(x0, y - 8, name + (ok ? ' ✓' : ''), { 'font-size': 14, 'font-weight': 700, fill: ok ? GOOD : focus ? ACC : MUT });
      for (let i = 0; i < 12; i++) { const n = g * 12 + i, f = clamp(done - n);
        el('rect', { x: x0 + i * 18, y, width: 15, height: 22, rx: 3, fill: SOFT, stroke: focus ? GRID : 'none' });
        if (f > 0) el('rect', { x: x0 + i * 18, y: y + 22 * (1 - f), width: 15, height: 22 * f, rx: 3, fill: ok ? GOOD : ACC }); } });
    mono(930, 36, `${Math.round(done)} / 48 · ${Math.round(done / 48 * 100)}%`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: ACC }); }
  // 축 완료 도장
  function stamp(u, s) { card(480, 200, tw(s, 20) + 60, 64, { rx: 12, text: s, fs: 20, fw: 800, stroke: GOOD, color: GOOD, fill: GOODBG, sw: 3, s: pop(u, 0.3) }); }

  // ---------- 1. Data Quality ----------
  const DOC_TOK = 2000, PX = 0.42, CH = 512, OV = 77;   // 512 × 15% ≈ 77 tok, 문서 길이는 예시
  function chunks(u, k) { const x0 = 60, y0 = 70;
    el('rect', { x: x0, y: y0, width: DOC_TOK * PX, height: 30, rx: 5, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    tx(x0 + 8, y0 + 20, '원문 문서 (예시 2,000 tok)', { 'font-size': 14, 'font-weight': 700 });
    // 표 블록: 자르지 않는다
    el('rect', { x: x0 + 600 * PX, y: y0 + 4, width: 120 * PX, height: 22, rx: 3, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 });
    tx(x0 + 660 * PX, y0 + 19, '표', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
    const step = CH - OV;
    for (let i = 0, st = 0; st < DOC_TOK; i++, st += step) { const en = Math.min(DOC_TOK, st + CH), f = k === 0 ? E(u, 0.4 + i * 0.3, 1.0 + i * 0.3) : 1; if (f <= 0) break;
      const y = lerp(y0, 128 + (i % 2) * 56, f), x = x0 + st * PX, w = (en - st) * PX;
      el('rect', { x, y, width: w, height: 40, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: 0.9 });
      mono(x + 8, y + 26, `#${i} · ${en - st} tok`, { 'font-size': 13.5, 'font-weight': 700, fill: ACC });
      if (i > 0 && f >= 1) el('rect', { x, y: 116, width: OV * PX, height: 120, fill: WARN, opacity: 0.18 }); }
    if (k === 0) { note(60, 268, '겹침 77 tok (512의 15%)', fade(u, 2.0), { fill: WARN });
      note(330, 268, '— 경계에 걸친 문장이 양쪽 청크에 남는다', fade(u, 2.2), { fill: MUT });
      note(60, 300, 'strategy: semantic · 표와 코드 블록은 한 청크에 통째로', fade(u, 2.3), { fill: MUT }); } }
  const META = [['source', 'hr/policy.pdf'], ['page', '12'], ['section', '정책 > 휴가 > 연차'], ['updated_at', '2025-03-01'], ['owner', 'HR'], ['tags', 'policy, internal'], ['lang', 'ko']];
  function s1(t, c) { const { k, u } = c;
    board(c);
    if (k === 0) { head('청킹 표준 — 512 tok, 겹침 15%'); chunks(u, 0); return; }
    if (k === 1) { head('필수 메타 7필드');
      card(170, 200, 220, 150, { rx: 10, text: '청크 #2\n"1년 이상 근속 시\n연차 15일…"', fs: 15, stroke: ACC, fill: ACCBG });
      META.forEach(([kk, v], i) => { const y = 66 + i * 40, f = E(u, 0.2 + i * 0.22, 0.8 + i * 0.22);
        grow(282, 200, lerp(282, 430, f), lerp(200, y, f), f >= 1 ? 1 : 0, GRID, { plain: true });
        mono(lerp(300, 440, f), y + 5, kk, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: f });
        tx(lerp(400, 560, f), y + 5, v, { 'font-size': 14.5, opacity: f }); });
      tag(840, 70, '값은 예시', fade(u, 2.0));
      note(560, 340, '검색 필터와 감사 추적이 이 필드로 돈다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 2) { head('doc_id 고정 · 중복 걷어내기');
      mono(60, 84, 'doc_id = {source_hash}:{section_path}:{chunk_idx}', { 'font-size': 15, 'font-weight': 700 });
      ['1회차 인덱싱', '2회차 인덱싱'].forEach((s, i) => { const f = E(u, 0.3 + i * 0.4, 1.0 + i * 0.4);
        card(140, 130 + i * 60, 170, 40, { rx: 8, text: s, fs: 14.5, stroke: INK, op: f }); grow(226, 130 + i * 60, 320, 160, f, INFO); });
      card(410, 160, 160, 44, { rx: 8, text: '같은 doc_id', fs: 15, fw: 800, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 1.3) });
      note(60, 250, 'idempotent — 다시 넣어도 덮어쓸 뿐 늘지 않는다', fade(u, 1.6), { fill: MUT });
      // 중복 제거
      [['A', 0], ['A', 1], ['A′', 2], ['B', 3]].forEach(([s, i]) => { const x = 640 + (i % 2) * 140, y = 110 + Math.floor(i / 2) * 80, gone = i === 1 || i === 2, f = E(u, 1.4, 2.2);
        card(x, y, 110, 48, { rx: 8, text: '청크 ' + s, fs: 15, stroke: gone ? BAD : INK, color: gone ? BAD : INK, op: gone ? 1 - f * 0.75 : 1 });
        if (gone && f > 0.5) cross(x + 50, y - 22, 8, 1); });
      tx(640, 262, 'sha256 완전 중복 ✗', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
      tx(640, 288, 'minhash 유사도 ≥ 0.92 ✗', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { head('파싱 게이트 · PII 사전 마스킹');
      // OCR 게이트
      tx(60, 82, 'OCR 정확도', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 60, y: 96, width: 340, height: 24, rx: 5, fill: SOFT });
      const gx = 60 + 340 * 0.95; el('line', { x1: gx, y1: 88, x2: gx, y2: 128, stroke: BAD, 'stroke-width': 2.5 });
      mono(gx, 146, '0.95', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      note(60, 180, '미만이면 재시도 — 깨진 글자가 인덱스로 가지 않게', fade(u, 0.6), { fill: MUT });
      // PII
      const raw = [['문의: hong@corp.com', '[EMAIL]'], ['연락처 010-1234-5678', '[PHONE]']];
      raw.forEach(([a, b], i) => { const y = 92 + i * 56, f = E(u, 1.0 + i * 0.4, 1.6 + i * 0.4);
        el('rect', { x: 500, y: y - 22, width: 400, height: 40, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
        tx(516, y + 4, f < 0.5 ? a : a.replace(/[\w.@-]+@[\w.]+|010-\d{4}-\d{4}/, b), { 'font-size': 15, fill: f < 0.5 ? INK : INK });
        });
      tag(840, 230, '문장은 예시', fade(u, 1.8));
      note(500, 220, 'email · phone · ssn · card', fade(u, 1.8), { fill: MUT, class: 'mono' });
      note(500, 300, '적재 전에 가린다 — 검색 결과로 새지 않게', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 4) { head('갱신 · 보존 정책');
      clock(140, 170, 56, E(u, 0.2, 1.2) * (2 / 24), INFO, '매일 02:00 KST');
      ['정책.pdf', '규정.docx', 'FAQ.md', '공지.html', '매뉴얼.pdf'].forEach((s, i) => { const ch = i === 1 || i === 3, y = 80 + i * 44;
        card(390, y, 160, 34, { rx: 6, text: s, fs: 14, stroke: ch ? ACC : GRID, color: ch ? ACC : MUT, fill: ch ? ACCBG : PANEL });
        if (ch) { grow(472, y, 560, y, E(u, 0.8 + i * 0.1, 1.4 + i * 0.1), ACC); mono(570, y + 5, '다시 임베딩', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); } });
      note(390, 318, 'incremental — 바뀐 문서만', fade(u, 1.6), { fill: MUT });
      note(700, 110, '임베딩 모델 교체 시', fade(u, 1.8)); note(700, 136, '→ 전체 재빌드', fade(u, 1.9), { fill: WARN });
      note(700, 220, '보존 365일', fade(u, 2.1)); note(700, 246, '정책 문서는 만료 없음', fade(u, 2.2), { fill: MUT }); return; }
    stamp(u, 'Data Quality 12/12 ✓');
    note(480, 270, '누적 12 / 48 — 진행률 25%', fade(u, 1.2), { 'text-anchor': 'middle', fill: MUT }); }

  // ---------- 2. Retrieval Quality ----------
  function s2(t, c) { const { k, u } = c;
    board(c);
    if (k === 0) { head('Hybrid — dense 0.7 + BM25 0.3, RRF 융합');
      [['dense (의미)', 0.7, INFO, 110], ['BM25 (키워드)', 0.3, WARN, 230]].forEach(([s, w, col, y], i) => {
        card(150, y, 200, 50, { rx: 10, text: s, fs: 15, stroke: col, color: col, s: pop(u, 0.2 + i * 0.3) });
        mono(150, y + 46, 'weight ' + w, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.6) });
        for (let j = 0; j < 4; j++) dot([[250, y], [480, 170]], ((u * 0.6 + j / 4) % 1) * clamp(u - 0.6), col, 5); });
      card(560, 170, 160, 60, { rx: 10, text: 'RRF\n순위로 합치기', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.0) });
      grow(640, 170, 720, 170, E(u, 1.4, 1.8), ACC);
      note(735, 160, '의미도 키워드도', fade(u, 1.8)); note(735, 186, '한 목록에', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 1) { head('20개 넓게 회수 → cross-encoder 로 4개');
      for (let i = 0; i < 20; i++) { const x = 70 + (i % 10) * 34, y = 110 + Math.floor(i / 10) * 40, keep = [2, 7, 11, 16].includes(i), f = E(u, 1.0, 2.0);
        el('circle', { cx: lerp(x, keep ? 700 + [2, 7, 11, 16].indexOf(keep ? i : 2) * 44 : x, keep ? f : 0), cy: lerp(y, keep ? 140 : y, keep ? f : 0), r: 11, fill: keep ? ACC : OFF, opacity: keep ? 1 : 1 - f * 0.6 }); }
      mono(70, 208, 'retrieve_k = 20', { 'font-size': 15, 'font-weight': 700 });
      card(520, 140, 150, 60, { rx: 10, text: 'bge-reranker\n(GPU)', fs: 14.5, stroke: INK, s: pop(u, 0.5) });
      mono(700, 190, 'rerank_k = 4', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      note(60, 300, '같은 (질문, 문서) 점수는 redis 에 캐시', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 2) { head('검색 전에 거른다 — tenant · lang · 최신성 · 권한');
      for (let i = 0; i < 24; i++) { const x = 70 + (i % 8) * 50, y = 90 + Math.floor(i / 8) * 56, ten = i % 3 === 0 ? 'B' : 'A', en = i % 5 === 2, old = i % 7 === 4;
        const out = ten === 'B' || en || old, f = E(u, 0.5, 1.8);
        card(x, y, 40, 44, { rx: 5, text: ten, fs: 15, mono: true, stroke: out ? GRID : ACC, color: out ? OFF : ACC, fill: out ? PANEL : ACCBG, op: out ? 1 - f * 0.7 : 1 }); }
      tag(260, 280, '문서 배치는 예시', fade(u, 1.8));
      [['by_tenant', '내 테넌트(A)만'], ['by_lang', '요청 언어만'], ['by_recency', '1년 이내만'], ['by_acl', '내 그룹 권한만']].forEach(([a, b], i) => { const op = fade(u, 0.3 + i * 0.3);
        mono(520, 100 + i * 50, a, { 'font-size': 15, 'font-weight': 800, opacity: op }); tx(660, 100 + i * 50, b, { 'font-size': 15, opacity: op }); });
      note(520, 320, '다른 테넌트 문서는 아예 후보에 없다', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 3) { head('질문 바꿔 쓰기 · 3갈래 검색');
      card(140, 180, 190, 50, { rx: 10, text: '원래 질문', fs: 15, stroke: INK });
      card(330, 180, 120, 50, { rx: 10, text: 'rewrite', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.3) });
      grow(235, 180, 268, 180, E(u, 0.2, 0.5), MUT);
      [0, 1, 2].forEach((i) => { const y = 100 + i * 80, f = E(u, 0.7 + i * 0.2, 1.3 + i * 0.2);
        grow(392, 180, 470, y, f, INFO); card(540, y, 130, 42, { rx: 21, text: '질의 ' + (i + 1), fs: 14.5, stroke: INFO, op: f }); grow(606, y, 690, 180, E(u, 1.5, 1.9), ACC); });
      card(750, 180, 110, 50, { rx: 10, text: 'RRF', mono: true, fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.8) });
      card(140, 290, 150, 40, { rx: 8, text: 'HyDE', mono: true, fs: 15, stroke: GRID, color: OFF }); cross(140, 290, 12, pop(u, 1.0));
      note(230, 296, '꺼 둠 — 비용 대비 이득이 작다', fade(u, 1.4), { fill: MUT }); return; }
    if (k === 4) { head('매주 재고, 분포 변화를 감시');
      ['1주', '2주', '3주', '4주'].forEach((w, i) => { const x = 80 + i * 90, op = fade(u, 0.2 + i * 0.2);
        tx(x, 82, w, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: op });
        ['recall@k', 'MRR', 'nDCG'].forEach((m, j) => { check(x, 110 + j * 40, 8, pop(u, 0.3 + i * 0.2 + j * 0.05)); if (i === 0) mono(30, 115 + j * 40, '', {}); }); });
      ['recall@k', 'MRR', 'nDCG'].forEach((m, j) => mono(440, 115 + j * 40, m, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) }));
      note(60, 260, '라벨 단 실패 사례 200건이 회귀 셋', fade(u, 1.2), { fill: MUT });
      // drift: 두 분포
      const ax = { X: (v) => 600 + v * 300, Y: (v) => 280 - v * 150 }, bell = (m) => Array.from({ length: 41 }, (_, i) => { const v = i / 40; return [v, Math.exp(-Math.pow((v - m) / 0.14, 2))]; });
      el('line', { x1: 600, y1: 280, x2: 900, y2: 280, stroke: MUT, 'stroke-width': 1.5 });
      R.line(ax, bell(0.4), E(u, 0.6, 1.4), INFO); R.line(ax, bell(0.6), E(u, 1.4, 2.2), WARN, { dash: '6 4' });
      tx(600, 90, '임베딩 분포: 지난달 vs 이번 주', { 'font-size': 14.5, 'font-weight': 700 });
      mono(600, 310, 'KL 발산 > 0.1 이면 경보', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); return; }
    head('인덱스 버전 — blue/green 컷오버');
    const sw = E(u, 0.6, 1.4);
    card(200, 170, 200, 50, { rx: 10, text: 'prod-rag-current', mono: true, fs: 14.5, stroke: INK });
    card(560, 110, 160, 50, { rx: 10, text: 'blue (지금)', fs: 15, stroke: INFO, color: INFO, op: 1 - sw * 0.5 });
    card(560, 230, 160, 50, { rx: 10, text: 'green (새 인덱스)', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG });
    grow(300, 170, 480, lerp(110, 230, sw), 1, sw > 0.5 ? GOOD : INFO);
    note(480, 300, '문제가 나면 alias 만 되돌린다 · 직전 2개 보관', fade(u, 1.6), { fill: MUT, 'text-anchor': 'middle' });
    if (u > 2.0) banner(480, 340, 'Retrieval 12/12 ✓ · 누적 50%', pop(u, 2.0)); }

  // ---------- 3. Generation Quality ----------
  function s3(t, c) { const { k, u } = c;
    board(c);
    if (k === 0) { head('system prompt v3.2.1 — 규칙 4줄');
      ['제공된 컨텍스트만 사용', '근거가 없으면 모른다고 답변', '각 문장에 [doc_id:page] 인용', '추측 금지, 컨텍스트 밖 추론 금지'].forEach((s, i) => {
        const y = 90 + i * 52; card(400, y, 520, 40, { rx: 8, text: s, fs: 15, stroke: ACC, fill: ACCBG, s: pop(u, 0.2 + i * 0.3) }); mono(60, y + 5, `rule ${i + 1}`, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.2 + i * 0.3) }); });
      note(620, 320, 'git tag 로 버전 관리', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 1) { head('인용 강제 — 형식이 틀리면 다시 생성');
      const ans = [['연차는 1년 이상 근속 시 15일이다 ', '[doc_42:3]', true], ['리프레시 휴가 3일이 더 있다 ', '', false]];
      ans.forEach(([a, b, ok], i) => { const y = 100 + i * 60; tx(60, y, a, { 'font-size': 16 }); if (b) mono(60 + tw(a, 16), y, b, { 'font-size': 15, 'font-weight': 800, fill: ACC });
        const s = pop(u, 0.8 + i * 0.4); if (ok) check(600, y - 6, 9, s); else { cross(600, y - 6, 8, s); } });
      mono(60, 210, 'regex: \\[\\w+:\\d+\\]', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4) });
      tag(780, 100, '답 문장은 예시', fade(u, 1.0));
      el('path', { d: 'M640,160 C760,160 760,260 520,260 C330,260 330,210 360,180', fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': E(u, 1.4, 2.4) < 1 ? `${E(u, 1.4, 2.4) * 600} 600` : null });
      note(520, 296, '인용 빠짐 → 재생성', fade(u, 2.0), { fill: WARN, 'text-anchor': 'middle' }); return; }
    if (k === 2) { head('Refusal — 근거가 없으면 정직하게 거절');
      tx(60, 86, '관련도 점수', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 60, y: 100, width: 360, height: 24, rx: 5, fill: SOFT });
      const v = lerp(0.8, 0.3, E(u, 0.3, 1.4)); el('rect', { x: 60, y: 100, width: 360 * v, height: 24, rx: 5, fill: v < 0.5 ? BAD : GOOD });
      el('line', { x1: 240, y1: 92, x2: 240, y2: 132, stroke: INK, 'stroke-width': 2.5 }); mono(240, 150, '0.5', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' });
      note(60, 190, '컨텍스트가 비었거나 0.5 미만이면', fade(u, 1.2));
      card(680, 140, 380, 60, { rx: 12, text: '"관련 정보를 찾지 못했습니다."', fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.6) });
      note(510, 250, '근거 없는 추측 답보다 낫다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 3) { head('출력 schema — pydantic 으로 검사');
      const lines = ['{', '  "answer": "…",', '  "citations": ["doc_42:3"],', '  "confidence": 0.0~1.0', '}'];
      lines.forEach((s, i) => mono(80, 96 + i * 30, s, { 'font-size': 16, fill: i === 0 || i === 4 ? MUT : INK, opacity: fade(u, 0.2 + i * 0.25) }));
      ['answer: string', 'citations: array', 'confidence: float'].forEach((s, i) => { mono(540, 126 + i * 30, s, { 'font-size': 15, opacity: fade(u, 1.2 + i * 0.2) }); check(760, 121 + i * 30, 7, pop(u, 1.5 + i * 0.2)); });
      note(540, 260, '형식이 깨진 답은 화면에 닿기 전에 막는다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 4) { head('temperature 0.1 · 스트리밍');
      el('rect', { x: 60, y: 110, width: 360, height: 12, rx: 6, fill: SOFT });
      const tv = 0.1; el('circle', { cx: 60 + 360 * tv, cy: 116, r: 12 * pop(u, 0.2), fill: ACC });
      mono(60, 160, 'temperature = ' + tv.toFixed(1), { 'font-size': 17, 'font-weight': 800, fill: ACC }); mono(60, 96, '0', { 'font-size': 13.5, fill: MUT }); mono(420, 96, '1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      note(60, 200, '같은 질문에 같은 답 — 결정적으로', fade(u, 1.2), { fill: MUT });
      const words = ['연차는', ' 1년', ' 이상', ' 근속', ' 시', ' 15일', '이다.'], n = Math.floor(E(u, 0.6, 2.4) * words.length);
      el('rect', { x: 500, y: 90, width: 420, height: 60, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(516, 126, words.slice(0, n).join('') + (n < words.length ? ' ▍' : ''), { 'font-size': 16 });
      note(500, 190, 'streaming — 첫 글자가 먼저 보여 덜 기다린다', fade(u, 1.0), { fill: MUT }); return; }
    if (k === 5) { head('RAGAS 자동 평가 — 주간, 10% 샘플');
      [['faithfulness', 0.85], ['answer_relevancy', 0.80], ['context_precision', 0.75]].forEach(([n, th], i) => { const y = 92 + i * 56, op = fade(u, 0.2 + i * 0.3);
        mono(60, y + 17, n, { 'font-size': 15, 'font-weight': 700, opacity: op });
        el('rect', { x: 260, y, width: 300, height: 24, rx: 5, fill: SOFT, opacity: op });
        el('line', { x1: 260 + 300 * th, y1: y - 6, x2: 260 + 300 * th, y2: y + 30, stroke: BAD, 'stroke-width': 2.5, opacity: op });
        mono(260 + 300 * th + 8, y + 17, '≥ ' + th.toFixed(2), { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: op }); });
      for (let i = 0; i < 10; i++) el('circle', { cx: 680 + (i % 5) * 34, cy: 110 + Math.floor(i / 5) * 34, r: 11, fill: i === 0 ? ACC : OFF, opacity: fade(u, 1.2) });
      note(680, 190, '열 건 중 한 건만 채점', fade(u, 1.5), { fill: MUT });
      note(60, 300, '임계 아래로 떨어지면 #rag-alerts 로 알림', fade(u, 2.0), { fill: WARN }); return; }
    if (k === 6) { head('회귀 셋 80문항 — PR 머지 전 관문');
      card(120, 180, 120, 56, { rx: 10, text: 'PR', mono: true, fs: 18, stroke: INK });
      card(480, 180, 220, 90, { rx: 12, text: 'CI gate\n80문항 통과?', fs: 16, stroke: WARN, color: INK, fill: WARNBG, s: pop(u, 0.3) });
      dot([[180, 180], [370, 180]], seg(u, 0.4, 1.2), INK, 8);
      for (let i = 0; i < 80; i++) { const f = clamp(E(u, 1.0, 2.2) * 80 - i); if (f <= 0) break; el('rect', { x: 400 + (i % 20) * 8, y: 240 + Math.floor(i / 20) * 9, width: 6, height: 6, fill: GOOD, opacity: f }); }
      grow(590, 180, 720, 180, E(u, 2.2, 2.6), GOOD); card(800, 180, 120, 50, { rx: 10, text: 'merge', mono: true, fs: 16, stroke: GOOD, color: GOOD, s: pop(u, 2.4) });
      note(60, 300, '도메인 전문가가 고른 문항', fade(u, 1.4), { fill: MUT }); return; }
    head('prompt A/B — 70 : 30, 14일');
    el('rect', { x: 60, y: 110, width: 840 * 0.7 * E(u, 0.2, 1.2), height: 50, rx: 6, fill: INFO, opacity: 0.85 });
    el('rect', { x: 60 + 840 * 0.7, y: 110, width: 840 * 0.3 * E(u, 0.8, 1.6), height: 50, rx: 6, fill: ACC, opacity: 0.85 });
    mono(80, 142, 'control 70%', { 'font-size': 16, 'font-weight': 800, fill: PANEL, opacity: fade(u, 1.0) });
    mono(80 + 840 * 0.7, 142, 'v_strict_citation 30%', { 'font-size': 15, 'font-weight': 800, fill: PANEL, opacity: fade(u, 1.6) });
    for (let d = 0; d < 14; d++) el('rect', { x: 60 + d * 60, y: 200, width: 50, height: 22, rx: 4, fill: d < E(u, 1.4, 2.4) * 14 ? GRID : SOFT });
    tx(60, 250, '14일 동안 나란히 돌려 지표로 고른다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) });
    if (u > 2.1) banner(480, 320, 'Generation 12/12 ✓ · 누적 75%', pop(u, 2.1)); }

  // ---------- 4. Ops ----------
  function s4(t, c) { const { k, u } = c;
    board(c);
    if (k === 0) { head('SLO — 넘으면 알람이 울리는 선');
      [['p95 latency', '< 3.0s', 'p50 < 1.5s, 1분 창'], ['에러율', '< 1%', '5분 창'], ['Faithfulness', '> 0.85', '주간']].forEach(([a, b, d], i) => { const x = 180 + i * 300, s = pop(u, 0.3 + i * 0.35);
        card(x, 170, 260, 130, { rx: 12, stroke: i === 0 ? ACC : INK, sw: i === 0 ? 3 : 2, s });
        tx(x, 140, a, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.35) });
        mono(x, 186, b, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 0 ? ACC : INK, opacity: fade(u, 0.5 + i * 0.35) });
        tx(x, 214, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.35) }); }); return; }
    if (k === 1) { head('시맨틱 캐시 — 비슷한 질문은 바로 답한다');
      card(130, 140, 200, 44, { rx: 8, text: '"연차 며칠이야?"', fs: 15, stroke: INK });
      card(130, 230, 200, 44, { rx: 8, text: '"연차 휴가 며칠?"', fs: 15, stroke: INK, s: pop(u, 0.3) });
      mono(130, 290, '유사도 ≥ 0.95', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
      grow(232, 230, 400, 185, E(u, 0.9, 1.4), ACC);
      card(480, 185, 150, 56, { rx: 10, text: 'Redis HIT\n50ms', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.3) });
      tx(600, 100, 'TTL 24h', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      // hit ratio
      tx(640, 160, 'hit ratio', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 640, y: 172, width: 260, height: 24, rx: 5, fill: SOFT });
      el('rect', { x: 640, y: 172, width: 260 * 0.34 * E(u, 1.4, 2.2), height: 24, rx: 5, fill: GOOD });
      el('line', { x1: 640 + 260 * 0.3, y1: 164, x2: 640 + 260 * 0.3, y2: 204, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
      mono(640 + 260 * 0.3, 224, '목표 30%', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); mono(910, 190, '34%', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { head('비용 · 사용량 제한 · 대체 모델');
      tx(60, 86, '일일 token', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 60, y: 98, width: 380, height: 24, rx: 5, fill: SOFT });
      el('rect', { x: 60, y: 98, width: 380 * E(u, 0.2, 1.4) * 0.8, height: 24, rx: 5, fill: WARN });
      [[0.8, '80% 알림'], [1, '100% 알림']].forEach(([v, s]) => { el('line', { x1: 60 + 380 * v, y1: 90, x2: 60 + 380 * v, y2: 130, stroke: BAD, 'stroke-width': 2 }); tx(60 + 380 * v, 148, s, { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle' }); });
      [['사용자당', '60 req / min'], ['테넌트당 동시성', 'max 50']].forEach(([a, b], i) => { tx(60, 200 + i * 40, a, { 'font-size': 15, opacity: fade(u, 1.0 + i * 0.3) }); mono(230, 200 + i * 40, b, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.0 + i * 0.3) }); });
      card(600, 120, 170, 46, { rx: 10, text: 'gpt-4o-mini', mono: true, fs: 15, stroke: INK });
      if (u > 1.4) { cross(700, 100, 8, pop(u, 1.4)); mono(720, 104, '5xx', { 'font-size': 14, 'font-weight': 800, fill: BAD }); }
      grow(600, 145, 600, 210, E(u, 1.6, 2.0), WARN);
      card(600, 236, 170, 46, { rx: 10, text: 'gpt-3.5', mono: true, fs: 15, stroke: WARN, color: WARN, s: pop(u, 1.9) });
      note(700, 300, 'fallback', fade(u, 2.1), { fill: WARN }); return; }
    if (k === 3) { head('trace_id 하나로 전 단계를 꿴다');
      const spans = [['query', 0, 0.1], ['retrieve', 0.1, 0.35], ['rerank', 0.35, 0.55], ['generate', 0.55, 1]];
      spans.forEach(([s, a, b], i) => { const y = 100 + i * 46, f = E(u, 0.2 + i * 0.35, 0.8 + i * 0.35);
        mono(60, y + 18, s, { 'font-size': 15, 'font-weight': 700, opacity: f });
        el('rect', { x: 200 + 560 * a, y, width: Math.max(2, 560 * (b - a) * f), height: 26, rx: 5, fill: [INFO, ACC, WARN, GOOD][i], opacity: 0.85 }); });
      mono(200, 300, 'trace_id = 7f3a…  (예시)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) });
      note(200, 330, 'loki · prometheus · Tempo · Langfuse 에 같은 id 로 남는다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 4) { head('보안 4겹');
      [['입력 PII 차단', 'presidio'], ['prompt injection 필터', 'rebuff + 룰'], ['출력 redact', 'SSN·카드 마스킹'], ['audit log', '90일 보존']].forEach(([a, b], i) => { const x = 140 + i * 228, s = pop(u, 0.2 + i * 0.35);
        card(x, 180, 200, 130, { rx: 14, stroke: GOOD, sw: 2.5, s, fill: GOODBG }); lock(x, 150, true, GOOD, s);
        tx(x, 198, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.35) });
        tx(x, 224, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.35) }); }); return; }
    if (k === 5) { head('인시던트 — 15분 ack, 30분 escalate');
      el('line', { x1: 80, y1: 190, x2: 880, y2: 190, stroke: GRID, 'stroke-width': 4 });
      el('line', { x1: 80, y1: 190, x2: lerp(80, 880, E(u, 0.2, 2.2)), y2: 190, stroke: ACC, 'stroke-width': 4 });
      [[80, '0분', 'PagerDuty 호출'], [300, '15분', 'on-call ack'], [520, '', 'runbook 진단'], [740, '30분', '미해결 → escalate']].forEach(([x, m, s], i) => { const op = fade(u, 0.3 + i * 0.45);
        el('circle', { cx: x, cy: 190, r: 10, fill: PANEL, stroke: ACC, 'stroke-width': 3, opacity: op });
        mono(x, 168, m, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: op }); tx(x, 224, s, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: op }); });
      note(480, 290, '분기마다 retro → 액션 아이템', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT }); return; }
    stamp(u, '48 / 48 — 출항 준비 끝');
    note(480, 270, 'Data · Retrieval · Generation · Ops 네 축이 모두 ✓', fade(u, 1.2), { 'text-anchor': 'middle', fill: MUT }); }

  const quiz = [
    { q: 'chunk 512 tok에 overlap 15%를 주는 이유는 무엇인가?',
      o: ['경계에 걸친 문장이 양쪽 청크에 남아 문맥이 끊기지 않게 하려고', '인덱스 크기를 줄이려고', '중복 문서를 찾으려고'], a: 0,
      why: '청크를 딱 잘라 붙이면 경계 문장이 반씩 갈린다. 77 tok쯤 겹치면 그 문장이 한쪽에는 온전히 남는다.' },
    { q: '1차로 20개를 회수한 뒤 cross-encoder로 4개만 남기는 이유는 무엇인가?',
      o: ['검색 속도를 높이려고', '넓게 모아 놓치는 것을 줄이고, 비싼 정밀 채점은 후보에만 쓰려고', 'GPU 사용을 피하려고'], a: 1,
      why: '20개로 recall을 확보하고, 질문과 문서를 함께 읽는 리랭커는 그 20개에만 돌려 상위 4개 순서를 바로잡는다.' },
    { q: '관련도 점수가 0.5 미만일 때 생성 단계가 하는 일은 무엇인가?',
      o: ['temperature를 올려 다시 생성한다', '가장 비슷한 문서로 추측해 답한다', '"관련 정보를 찾지 못했습니다."라고 거절한다'], a: 2,
      why: '근거가 없는데 답을 지어내면 환각이 된다. refusal 규칙은 컨텍스트가 비었거나 0.5 미만이면 정직하게 거절하게 한다.' },
    { q: '시맨틱 캐시가 HIT로 판정하는 기준은 무엇인가?',
      o: ['질문 문자열이 완전히 같을 때', '질문 임베딩 유사도가 0.95 이상일 때', '같은 사용자가 다시 물을 때'], a: 1,
      why: '표현이 조금 달라도 뜻이 같은 질문은 같은 답을 쓴다. 유사도 0.95 이상이면 Redis에서 50ms 만에 돌려준다.' },
  ];

  const summary = [
    'PoC를 운영으로 넘기려면 데이터, 검색, 생성, 운영 네 축 48항목을 점검한다.',
    '데이터는 512 tok 청크에 15% 겹침, 메타 7필드, 중복 제거, PII 마스킹을 맞춘다.',
    '검색은 20개를 넓게 모아 리랭커로 4개를 고르고, 생성은 인용과 거절 규칙을 강제한다.',
    '운영은 p95 3초 SLO, 유사도 0.95 캐시, trace_id, 15분 ack 같은 숫자로 지킨다.',
  ];
  const review = [
    { q: '재인덱싱을 돌릴 때마다 같은 문서의 청크가 두 배로 늘어난다. 먼저 고칠 항목은 무엇인가?',
      o: ['doc_id를 {source_hash}:{section_path}:{chunk_idx}처럼 내용에서 정해 idempotent하게 만든다', 'top-k를 20에서 10으로 줄인다', 'temperature를 0으로 낮춘다'], a: 0,
      why: 'id가 실행마다 새로 생기면 같은 청크가 새 행으로 쌓인다. 내용에서 정한 id면 다시 넣어도 덮어쓴다.' },
    { q: '한 고객사 직원이 다른 고객사 문서를 인용한 답을 받았다. 가장 먼저 확인할 설정은 무엇인가?',
      o: ['reranker 모델', 'pre_filter의 by_tenant', 'prompt A/B 비율'], a: 1,
      why: '테넌트 필터는 검색 전에 다른 테넌트 문서를 후보에서 빼는 장치다. 이것이 빠지면 리랭커가 아무리 좋아도 섞인다.' },
    { q: '새 프롬프트를 배포했더니 주간 faithfulness가 0.85 아래로 떨어졌다. 이런 일을 배포 전에 막는 장치는 무엇인가?',
      o: ['시맨틱 캐시', 'blue/green 인덱스 컷오버', '회귀 셋 80문항 CI gate'], a: 2,
      why: '회귀 셋은 PR 머지 전에 반드시 통과해야 하는 관문이다. 프롬프트 변경이 품질을 떨어뜨리면 배포 전에 걸린다.' },
  ];

  R.page({ title: '출항 점검표 48칸', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
