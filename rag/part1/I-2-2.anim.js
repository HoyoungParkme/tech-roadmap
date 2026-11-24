/* I-2-2 RAG vs Fine-tuning — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 오른쪽 위 점수판: 페이지 데이터 ft·rag 의 cost·speed·accuracy (0~5 상대 점수, 예시)를 앞 beat 값에서 이어 그린다.
 * 그림: 가중치 격자가 학습으로 물드는 FT, 가중치는 잠그고 문서 책장만 붙이는 RAG, 분 단위와 일 단위 갱신 타임라인,
 *       같은 질문에 대한 두 답(톤 vs 사실), LoRA 어댑터 + KB 를 합친 하이브리드.
 * 8B·fp16 16GB 는 파라미터 수 × 2바이트로 계산한 값이다. 답변 문장·별점·비용은 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cross, check, lock, clock, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const FTC = WARN, RGC = ACC;   // FT = 주황, RAG = 기본 강조색

  const at = (c) => (kk, a, d = 0.6) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a, a + d) : 0);
  function wrap(s, maxW, fs) { const out = []; let line = '';
    for (const w of String(s).split(' ')) { const t = line ? line + ' ' + w : w; if (tw(t, fs) > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out; }

  // ---------- 점수판 (오른쪽 위) ----------
  function board(c, label) { const b = c.beat, pv = c.prev;
    el('rect', { x: 690, y: 6, width: 262, height: 138, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    [['cost', '비용'], ['speed', '갱신 속도'], ['accuracy', label || '정확도']].forEach(([key, name], i) => { const y = 30 + i * 36;
      tx(702, y + 4, name, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      [['ft', FTC, -7], ['rag', RGC, 5]].forEach(([w, col, dy]) => { const v = tween(pv ? pv[w][key] : b[w][key], b[w][key], c.u);
        el('rect', { x: 790, y: y + dy - 4, width: 120, height: 9, rx: 4, fill: SOFT }); el('rect', { x: 790, y: y + dy - 4, width: 24 * v, height: 9, rx: 4, fill: col });
        const ch = pv && pv[w][key] !== b[w][key];
        mono(w === 'ft' ? 926 : 946, y + 5, String(b[w][key]), { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: ch ? 0.4 + 0.6 * fade(c.u, 1.0) : 1 }); }); });
    el('rect', { x: 702, y: 126, width: 10, height: 10, fill: FTC }); tx(716, 136, 'FT', { 'font-size': 13.5, 'font-weight': 700, fill: FTC });
    el('rect', { x: 748, y: 126, width: 10, height: 10, fill: RGC }); tx(762, 136, 'RAG', { 'font-size': 13.5, 'font-weight': 700, fill: RGC });
    tx(944, 136, '0~5 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
  // 가중치 격자: tint(r,c) → 0~1 (FT 색으로 물든 정도)
  function weights(x, y, cols, rows, cs, tint, o) { o = o || {};
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const t = tint ? tint(r, q) : 0;
      el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 3, fill: t > 0 ? FTC : o.fill || INFOBG, opacity: t > 0 ? 0.25 + 0.7 * t : 1, stroke: o.stroke || 'none' }); } }
  const H = (r, q) => ((r * 7 + q * 13) % 10) / 10;   // 칸마다 다른 시작 시각

  // =========================================================
  // 1. Fine-tuning — 가중치를 직접 고친다
  // =========================================================
  function s1(t, c) { const { k, u } = c, p = at(c); board(c);
    const load = k === 0 ? E(u, 0.2, 1.6) : 1, trained = k < 3 ? 0 : k === 3 ? clamp((u - 0.4) / 1.8) : 1;
    weights(50, 90, 12, 8, 26, (r, q) => (k === 5 ? (u > 0.6 ? clamp((u - 0.6 - H(r, q) * 0.8) / 0.4) : 1) : clamp((trained - H(r, q) * 0.6) / 0.4)), { fill: load * 12 > 0 ? INFOBG : SOFT });
    if (k === 0) { el('rect', { x: 50, y: 310, width: 308 * load, height: 10, rx: 5, fill: INFO });
      lbl(204, 70, 'Meta-Llama-3-8B 가중치', fade(u, 0.2), {}); mono(204, 345, '80억 파라미터 × 2바이트 ≈ 16GB', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) });
      sub(204, 372, 'fp16 기준 — 통째로 메모리에', fade(u, 1.6), { 'font-size': 14 }); }
    else lbl(204, 70, k >= 4 ? 'company-llm-v1 가중치' : 'Meta-Llama-3-8B 가중치', 1, { fill: k >= 4 ? FTC : INK });
    if (k === 1) { tx(400, 180, 'company_qa.jsonl', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      for (let i = 0; i < 6; i++) { const f = E(u, 0.3 + i * 0.22, 0.6 + i * 0.22); el('rect', { x: 400, y: 194 + i * 30, width: 260 * f, height: 24, rx: 4, fill: WARNBG, stroke: FTC, 'stroke-width': 1 });
        if (f > 0.9) mono(410, 211 + i * 30, `{"q": "…", "a": "…"}`, { 'font-size': 13.5, fill: FTC }); }
      sub(530, 395, '수천~수만 건의 Q&A 페어 — 데이터 준비부터 비용', fade(u, 1.8), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
    if (k === 2) { [1, 2, 3].forEach((e, i) => { const cx = 450 + i * 80, s = pop(u, 0.3 + i * 0.4);
        el('circle', { cx, cy: 220, r: 28 * s, fill: 'none', stroke: FTC, 'stroke-width': 3, 'stroke-dasharray': '120 60' }); mono(cx, 226, `${e}`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: FTC, opacity: s }); });
      mono(530, 290, 'num_train_epochs=3', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      mono(530, 316, 'learning_rate=2e-5 · batch=4', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) });
      sub(530, 360, '데이터 전체를 3번 돌며 미세 조정', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { for (let i = 0; i < 8; i++) { const x = 400 + (i % 4) * 64, y = 180 + Math.floor(i / 4) * 64;
        el('rect', { x, y, width: 52, height: 40, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(x + 26, y + 25, 'GPU', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 }); }
      clock(450, 350, 26, clamp((u - 0.4) / 1.8), FTC); mono(490, 356, `${Math.round(12 * clamp((u - 0.4) / 1.8))}h / 12h`, { 'font-size': 16, 'font-weight': 800, fill: FTC });
      pill(620, 350, '$$$', BAD, pop(u, 2.0), { fs: 16, fill: BADBG }); tx(400, 160, 'GPU 8장 × 12시간', { 'font-size': 15, 'font-weight': 800 }); }
    if (k === 4) { grow(370, 200, 470, 200, E(u, 0.2, 0.6), FTC); card(570, 200, 190, 56, { rx: 10, text: './company-llm-v1', mono: true, fs: 14.5, stroke: FTC, color: FTC, s: pop(u, 0.6) });
      sub(530, 270, '도메인 지식이 가중치에 "내장된" 새 모델', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 5) { el('rect', { x: 50, y: 90 + 3 * 26, width: 309, height: 23, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.2) });
      tx(370, 180, '← 데이터 1건 변경', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
      sub(204, 330, '전체를 다시 학습해야 한다', fade(u, 1.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      ['데이터 1건 → 전체 재학습', '비용·시간이 커서 실험 반복이 어렵다', '학습 데이터 편향이 그대로 박힌다'].forEach((s, i) => pill(530, 240 + i * 44, s, BAD, pop(u, 1.4 + i * 0.3), { fs: 14, fill: BADBG })); } }

  // =========================================================
  // 2. RAG — 가중치는 잠그고 책장만 붙인다
  // =========================================================
  function s2(t, c) { const { k, u } = c, p = at(c); board(c);
    weights(50, 110, 8, 6, 22, null, {}); lock(138, 250 + 6, true, INFO, 1); tx(138, 92, '가중치 그대로', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
    sub(138, 300, '변경 0 · GPU 학습 0', k === 0 ? fade(u, 0.4) : 1, { 'font-size': 14, fill: INFO, 'font-weight': 700 });
    // 책장
    const sh = k === 0 ? E(u, 0.4, 1.6) : 1;
    for (let i = 0; i < 7; i++) { const s = clamp(sh * 7 - i); if (s <= 0) continue; el('rect', { x: 300 + i * 22, y: 100 + (i % 3) * 6, width: 18, height: 90 - (i % 3) * 6, rx: 2, fill: [ACCBG, INFOBG, WARNBG][i % 3], stroke: INK, 'stroke-width': 1.5, opacity: s }); }
    el('line', { x1: 290, y1: 192, x2: 470, y2: 192, stroke: INK, 'stroke-width': 3 }); mono(380, 215, './company_docs/', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    if (k >= 1) { const f = k === 1 ? E(u, 0.3, 1.4) : 1; for (let i = 0; i < 6; i++) { const s = clamp(f * 6 - i); if (s > 0) el('rect', { x: 500 + (i % 3) * 56, y: 100 + Math.floor(i / 3) * 40, width: 50, height: 32, rx: 4, fill: PANEL, stroke: RGC, 'stroke-width': 1.8, opacity: s }); }
      mono(580, 200, 'chunk_size=500 · overlap=50', { 'font-size': 13.5, 'text-anchor': 'middle', fill: RGC, opacity: k === 1 ? fade(u, 1.2) : 1 });
      if (k === 1) sub(400, 300, 'GPU 없이 CPU 로 끝난다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k >= 2) { dbIcon(420, 300, 'Chroma', { stroke: RGC, s: k === 2 ? pop(u, 0.3) : 1 });
      if (k === 2) { clock(580, 300, 30, clamp((u - 0.6) / 1.2) * (5 / 60), RGC); mono(625, 306, '≈ 5분', { 'font-size': 18, 'font-weight': 800, fill: RGC, opacity: fade(u, 1.0) });
        sub(540, 380, '임베딩 API 만 호출해 색인', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }
    if (k === 3) { card(600, 260, 230, 40, { rx: 20, text: '"연차 신청 절차는?"', fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      grow(490, 300, 470, 300, 1, MUT, { plain: true });
      [0, 1, 2].forEach((i) => fly(440, 290, 560 + i * 56, 340, E(u, 0.8 + i * 0.25, 1.5 + i * 0.25), `#${i + 1}`, { fill: RGC, stay: true }));
      mono(620, 395, 'similarity_search(k=3)', { 'font-size': 14, 'text-anchor': 'middle', fill: RGC, opacity: fade(u, 1.6) }); }
    if (k === 4) { card(600, 270, 220, 44, { rx: 10, text: 'prompt + LLM', mono: true, fs: 15, stroke: RGC, color: RGC, s: pop(u, 0.2) }); grow(470, 290, 488, 280, 1, MUT);
      card(600, 350, 260, 44, { rx: 10, text: 'KB 근거 사내 절차 답변', fs: 14.5, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.0) }); grow(600, 294, 600, 326, E(u, 0.7, 1.0), GOOD);
      pill(770, 330, '예시', WARN, pop(u, 1.2), { fs: 13.5, fill: WARNBG }); }
    if (k === 5) { [['가중치 변경 0', GOOD], ['GPU 학습 비용 0', GOOD], ['셋업 5분', GOOD], ['톤·스타일 체화 X', BAD]].forEach(([s, col], i) => pill(820, 200 + i * 50, s, col, pop(u, 0.3 + i * 0.4), { fs: 15, fill: col === BAD ? BADBG : GOODBG })); } }

  // =========================================================
  // 3. 갱신 사이클 — 분 단위 vs 일 단위
  // =========================================================
  function s3(t, c) { const { k, u } = c, p = at(c); board(c, '정확도');
    // 새 규정 문서
    const g = R.G(90, 85, k === 0 ? pop(u, 0.2) : 1); el('path', { d: 'M-30,-38 H18 L30,-26 V38 H-30 Z', fill: PANEL, stroke: INK, 'stroke-width': 2 }, g); tx(0, 2, 'v2', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD }, g);
    tx(140, 80, '휴가 규정이 바뀌었다', { 'font-size': 16, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.5) : 1 });
    // RAG 레인 (분)
    const rl = ['09:00 업로드', '09:01 청크·임베딩', '09:01 upsert', '09:02 live ✓'];
    tx(40, 172, 'RAG', { 'font-size': 15, 'font-weight': 800, fill: RGC });
    el('line', { x1: 100, y1: 168, x2: 660, y2: 168, stroke: GRID, 'stroke-width': 2 });
    rl.forEach((s, i) => { const x = 120 + i * 170, f = k === 1 ? E(u, 0.2 + i * 0.4, 0.5 + i * 0.4) : k > 1 ? 1 : 0; if (f <= 0) return;
      el('circle', { cx: x, cy: 168, r: 7 * f, fill: i === 3 ? GOOD : RGC }); tx(x, 196, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: i === 3 ? GOOD : INK, opacity: f }); });
    if (k === 2) ['비용: 임베딩 API 한 번 (수 원)', '다운타임: 0', '롤백: doc_id 삭제 → 즉시'].forEach((s, i) => tx(120 + i * 200 - (i ? 30 : 0), 226, s, { 'font-size': 14, fill: RGC, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }));
    // FT 레인 (일)
    const fl = ['D1 통보', 'D2 Q&A 50건', 'D3 검증', 'D4 학습', 'D5 회귀 테스트', 'D6 교체'];
    tx(40, 282, 'FT', { 'font-size': 15, 'font-weight': 800, fill: FTC });
    el('line', { x1: 100, y1: 278, x2: 660, y2: 278, stroke: GRID, 'stroke-width': 2 });
    fl.forEach((s, i) => { const x = 120 + i * 100, f = k === 3 ? E(u, 0.2 + i * 0.3, 0.5 + i * 0.3) : k > 3 ? 1 : 0; if (f <= 0) return;
      el('rect', { x: x - 44, y: 266, width: 88 * f, height: 24, rx: 4, fill: i === 3 ? FTC : WARNBG, stroke: FTC, 'stroke-width': 1.2 }); tx(x, 310 + (i % 2) * 20, s, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: f }); });
    if (k === 4) ['비용: GPU 100시간 (예시)', '다운타임: 배포 시 수 분', '롤백: 모델 가중치 교체'].forEach((s, i) => tx(120 + i * 200 - (i ? 20 : 0), 374, s, { 'font-size': 14, fill: FTC, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }));
    if (k === 5) { el('rect', { x: 690, y: 160, width: 262, height: 250, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 1.5 });
      [['', 'RAG', 'FT'], ['단위', '문서 1건', '데이터셋'], ['시간', '1분', '수 일'], ['비용', '수 원', '수십~수백만원'], ['롤백', '즉시', '모델 교체']].forEach((r, i) => { const y = 188 + i * 44, f = i ? fade(u, 0.2 + i * 0.3) : 1;
        tx(702, y, r[0], { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: f }); tx(800, y, r[1], { 'font-size': 14, 'font-weight': 800, fill: RGC, 'text-anchor': 'middle', opacity: f }); tx(900, y, r[2], { 'font-size': 14, 'font-weight': 800, fill: FTC, 'text-anchor': 'middle', opacity: f }); }); }
    if (k === 6) { el('line', { x1: 120, y1: 390, x2: 640, y2: 390, stroke: MUT, 'stroke-width': 2 }); const m = lerp(600, 180, E(u, 0.3, 1.6));
      [['1년 1회', 600], ['주 1회', 180]].forEach(([s, x]) => { el('line', { x1: x, y1: 384, x2: x, y2: 396, stroke: MUT }); mono(x, 414, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      el('circle', { cx: m, cy: 390, r: 9, fill: m < 300 ? RGC : FTC }); tx(m, 372, m < 300 ? 'RAG 가 사실상 강제' : 'FT 도 가능', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: m < 300 ? RGC : FTC }); } }

  // =========================================================
  // 4. 도메인 적응 — 같은 질문, 톤 vs 사실
  // =========================================================
  const FTA = ['안녕하세요, 고객님. 저희 환불 절차를', '안내드리겠습니다. 마이페이지의 주문내역에서', '신청해주시면 영업일 기준 3일 이내에', '결과를 안내드리겠습니다.'];
  const RGA = ['환불은 마이페이지 → 주문내역 → 환불 신청에서', '요청 가능합니다. 2026-04-01부터 신선식품은', '24시간 내 환불만 가능합니다.', '출처: 환불정책_v3.2.pdf'];
  const STARS = [['회사 톤·말투', 5, 2], ['전문 용어', 4, 3], ['최신 정보', 1, 5], ['사실·출처', 2, 5], ['환각 통제', 2, 4]];
  function s4(t, c) { const { k, u } = c, p = at(c); board(c, '강점 정확도');
    if (k === 5) { // 별점 표
      tx(60, 70, '무엇을 누가 잘하나 (별점은 예시)', { 'font-size': 15, 'font-weight': 800 }); tx(330, 106, 'FT', { 'font-size': 15, 'font-weight': 800, fill: FTC, 'text-anchor': 'middle' }); tx(520, 106, 'RAG', { 'font-size': 15, 'font-weight': 800, fill: RGC, 'text-anchor': 'middle' });
      STARS.forEach(([n, a, b], i) => { const y = 140 + i * 52; tx(60, y + 6, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.25) });
        [[a, FTC, 270], [b, RGC, 460]].forEach(([v, col, x]) => { for (let s = 0; s < 5; s++) { const on = s < v && u > 0.4 + i * 0.25 + s * 0.05; el('circle', { cx: x + s * 26, cy: y, r: 9, fill: on ? col : SOFT, stroke: on ? col : GRID }); } }); });
      return; }
    if (k === 6) { const j = E(u, 0.3, 1.4);
      const piece = (x, col, name, sub2) => { const g = R.G(x, 230, 1); el('path', { d: 'M-110,-70 H0 V-20 A18,18 0 0 1 0,20 V70 H-110 Z', fill: col === FTC ? WARNBG : ACCBG, stroke: col, 'stroke-width': 2.5, transform: col === RGC ? 'scale(-1 1)' : null }, g); };
      piece(lerp(250, 340, j), FTC); piece(lerp(450, 360, j), RGC);
      tx(lerp(195, 285, j), 236, 'FT 톤', { 'font-size': 16, 'font-weight': 800, fill: FTC, 'text-anchor': 'middle' }); tx(lerp(505, 415, j), 236, 'RAG 사실', { 'font-size': 16, 'font-weight': 800, fill: RGC, 'text-anchor': 'middle' });
      sub(350, 360, '경쟁이 아니라 상호 보완 — 다음 단계에서 결합', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    card(340, 70, 280, 40, { rx: 20, text: '"환불 절차 알려주세요"', fs: 15, stroke: INFO, color: INFO, s: k === 0 ? pop(u, 0.2) : 1 });
    const panel = (x, col, name, lines, show, hi) => { el('rect', { x, y: 120, width: 320, height: 200, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2 }); tx(x + 14, 146, name, { 'font-size': 15, 'font-weight': 800, fill: col });
      lines.forEach((s, i) => { if (show > i) tx(x + 14, 178 + i * 26, s, { 'font-size': 14, fill: hi && hi(i) ? col : INK, 'font-weight': hi && hi(i) ? 800 : 500, opacity: clamp(show - i) }); }); };
    panel(20, FTC, 'Fine-tuned 모델', FTA, k === 1 ? clamp((u - 0.2) / 1.2) * 4 : k > 1 ? 4 : 0, (i) => i === 0 || i === 2);
    panel(360, RGC, 'RAG 모델', RGA, k === 3 ? clamp((u - 0.2) / 1.2) * 4 : k > 3 ? 4 : 0, (i) => i === 1 || i === 3);
    if (k === 0) sub(340, 360, '두 모델이 같은 질문에 답한다 — 스타일을 비교', fade(u, 0.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k >= 1) pill(290, 120, '답변 예시', WARN, 1, { fs: 13.5, fill: WARNBG });
    if (k >= 3) pill(630, 120, '답변 예시', WARN, 1, { fs: 13.5, fill: WARNBG });
    if (k === 1) sub(180, 350, '정중체·정형 표현이 가중치에 새겨져 있다', fade(u, 1.6), { 'font-size': 14, fill: FTC, 'font-weight': 700 });
    if (k >= 2) { const f = k === 2 ? fade(u, 0.3) : 0.6; card(180, 350, 300, 40, { rx: 8, text: '⚠ 작년 정책 — 신선식품 24시간 규정 없음', fs: 14, stroke: BAD, color: BAD, fill: BADBG, op: f }); }
    if (k === 3) sub(520, 350, '어제 갱신된 PDF 에서 회수 + 출처', fade(u, 1.6), { 'font-size': 14, fill: RGC, 'font-weight': 700 });
    if (k >= 4) { const f = k === 4 ? fade(u, 0.3) : 0.6; card(520, 395, 300, 40, { rx: 8, text: '⚠ 톤이 단조 — 베이스 모델 말투', fs: 14, stroke: BAD, color: BAD, fill: BADBG, op: f }); } }

  // =========================================================
  // 5. 결합 — LoRA 로 톤, RAG 로 사실
  // =========================================================
  function s5(t, c) { const { k, u } = c, p = at(c); board(c);
    if (k === 5) { // 운영 달력: RAG 매일, LoRA 분기 1회
      tx(40, 90, '한 해 운영 (90일 = 분기)', { 'font-size': 15, 'font-weight': 800 });
      for (let d = 0; d < 360; d += 6) { const x = 100 + d * 1.5, f = clamp((u - 0.2) * 3 - d / 120); el('line', { x1: x, y1: 140, x2: x, y2: 160, stroke: RGC, 'stroke-width': 2, opacity: f }); }
      tx(40, 130, 'RAG', { 'font-size': 14, 'font-weight': 800, fill: RGC }); tx(40, 220, 'LoRA', { 'font-size': 14, 'font-weight': 800, fill: FTC });
      [0, 90, 180, 270].forEach((d, i) => { const x = 100 + d * 1.5; el('rect', { x: x - 8, y: 200, width: 16, height: 30, rx: 3, fill: FTC, opacity: fade(u, 0.6 + i * 0.3) }); });
      el('line', { x1: 100, y1: 250, x2: 640, y2: 250, stroke: MUT, 'stroke-width': 1.5 }); mono(100, 272, '1월', { 'font-size': 13.5, fill: MUT }); mono(640, 272, '12월', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      pill(340, 340, '"RAG vs FT" 가 아니라 "RAG + FT"', GOOD, pop(u, 1.8), { fs: 16, fill: GOODBG }); return; }
    // 베이스 가중치 + LoRA 어댑터
    weights(40, 110, 8, 6, 20, null, {}); tx(120, 96, 'base (Llama-3-8B)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
    const la = k === 0 ? E(u, 0.4, 1.2) : 1; el('rect', { x: lerp(260, 206, la), y: 116, width: 26, height: 110, rx: 4, fill: FTC, opacity: 0.85 });
    if (k === 0) { tx(250, 260, 'LoRA 어댑터 · 수십 MB', { 'font-size': 14.5, 'font-weight': 800, fill: FTC, opacity: fade(u, 1.2) }); sub(200, 290, '가중치 일부만 학습', fade(u, 1.5), { 'font-size': 14 }); }
    else tx(120, 252, '+ LoRA (회사 톤)', { 'font-size': 14, 'font-weight': 800, fill: FTC, 'text-anchor': 'middle' });
    if (k >= 1) { dbIcon(560, 200, null, { stroke: RGC, s: k === 1 ? pop(u, 0.3) : 1 }); tx(560, 268, './company-kb', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: RGC, class: 'mono' });
      if (k === 1) { pill(560, 300, '매일 ingestion', RGC, pop(u, 0.9), { fs: 14, fill: ACCBG }); } }
    if (k === 2) { ['docs (k=3)', 'context', 'sources'].forEach((s, i) => fly(560, 220, 400, 160 + i * 44, E(u, 0.3 + i * 0.3, 1.0 + i * 0.3), s, { fill: RGC, stay: true }));
      sub(400, 320, '앞 절반 — 최신 사실과 출처를 회수', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { grow(400, 200, 260, 170, E(u, 0.2, 0.7), RGC); card(400, 200, 150, 40, { rx: 8, text: '[참고 자료]', fs: 14.5, stroke: RGC, color: RGC });
      pill(130, 300, '(회사 정중체로 답하라)', FTC, pop(u, 0.9), { fs: 14, fill: WARNBG });
      sub(350, 350, '뒷 절반 — LoRA 모델이 자료를 회사 톤으로 빚는다', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 4) { el('rect', { x: 30, y: 290, width: 640, height: 116, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      [['톤', '"안녕하세요, 고객님. 환불 절차를 안내드리겠습니다…"', 'LoRA', FTC], ['사실', '"2026-04-01부터 신선식품은 24시간 내…"', 'RAG', RGC], ['출처', '["환불정책_v3.2.pdf"]', 'RAG', RGC]].forEach(([a, b, w, col], i) => {
        const y = 320 + i * 32, f = fade(u, 0.3 + i * 0.4); tx(46, y, a, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: f }); tx(96, y, b, { 'font-size': 14, opacity: f }); mono(656, y, w, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: f }); });
      pill(610, 290, '응답 예시', WARN, 1, { fs: 13.5, fill: WARNBG }); } }

  const quiz = [
    { q: 'Fine-tuning에서 데이터 1건만 바뀌어도 부담이 큰 까닭은 무엇인가?',
      o: ['지식이 가중치에 박혀 있어 다시 학습해야 해서', '데이터셋 파일을 열 수 없어서', '토크나이저가 바뀌어서'], a: 0,
      why: '지식이 가중치 전체에 흩어져 들어가므로 고치려면 재학습해야 한다. 예시에서는 GPU 8장 × 12시간이 들었다.' },
    { q: 'RAG가 Fine-tuning보다 셋업이 빠른 이유는 무엇인가?',
      o: ['더 작은 모델을 쓰기 때문에', '가중치는 그대로 두고 문서를 청크로 잘라 색인만 하기 때문에', 'GPU를 더 많이 쓰기 때문에'], a: 1,
      why: '학습 없이 임베딩 API로 색인만 만들면 된다. 그래서 GPU 학습 비용이 0이고 셋업이 분 단위로 끝난다.' },
    { q: '휴가 규정이 바뀌었을 때 RAG의 갱신 단위는 무엇인가?',
      o: ['데이터셋 전체', '모델 가중치 파일', '바뀐 문서 1건'], a: 2,
      why: '새 PDF를 청크·임베딩해 upsert하면 09:00 업로드가 09:02에 반영된다. 롤백도 doc_id 삭제 한 번이다.' },
    { q: '같은 환불 질문에서 Fine-tuned 모델 답의 강점과 약점을 바르게 짝지은 것은?',
      o: ['최신 정책 반영 / 말투가 단조로움', '회사 고유 말투 / 작년 정책이 남아 있을 수 있음', '출처 표기 / 답이 너무 짧음'], a: 1,
      why: 'FT는 정중체·정형 표현을 가중치에 새긴다. 학습 시점 이후 바뀐 신선식품 24시간 규정은 빠질 수 있다.' },
    { q: '하이브리드 구성에서 톤과 사실은 각각 어디서 오는가?',
      o: ['톤은 LoRA 어댑터, 사실과 출처는 RAG 검색', '톤은 RAG 검색, 사실은 LoRA 어댑터', '둘 다 베이스 모델'], a: 0,
      why: '회사 톤은 수십 MB LoRA 어댑터가, 최신 사실과 출처는 매일 갱신되는 KB가 맡는다. LoRA는 분기 1회, KB는 매일 바뀐다.' },
  ];

  const summary = [
    'Fine-tuning은 가중치를 다시 학습해 지식을 넣고 GPU 시간과 데이터가 많이 든다.',
    'RAG는 가중치를 그대로 두고 문서를 검색해 붙여 분 단위로 준비된다.',
    '규정이 바뀌면 RAG는 문서 1건 교체로, FT는 며칠 걸리는 재학습으로 따라간다.',
    'FT는 톤과 용어를, RAG는 최신 사실과 출처를 맡아 함께 쓸 때가 많다.',
  ];
  const review = [
    { q: '상품 가격이 매주 바뀌는 쇼핑몰 상담봇을 만든다. 가격 정보는 어떻게 넣는 게 맞나?',
      o: ['가격표를 KB에 두고 RAG로 검색한다', '매주 모델을 Fine-tuning한다', '가격을 system prompt에 고정해 둔다'], a: 0,
      why: '주 1회라도 바뀌는 데이터는 RAG가 사실상 강제된다. 문서 1건을 갱신하면 몇 분 안에 반영되고 롤백도 쉽다.' },
    { q: 'RAG 챗봇의 답은 정확한데 브랜드 말투와 어긋난다는 피드백을 받았다. 알맞은 처방은?',
      o: ['검색 결과 수 k를 더 늘린다', '임베딩 모델을 다른 것으로 바꾼다', '말투 데이터로 LoRA 어댑터를 학습해 붙인다'], a: 2,
      why: '톤은 가중치에 새기는 FT가 잘하는 영역이다. 가벼운 LoRA로 톤을 입히고 사실은 계속 RAG로 가져온다.' },
    { q: 'FT 모델이 출시 뒤 바뀐 환불 정책을 틀리게 안내했다. 원인으로 가장 그럴듯한 것은?',
      o: ['temperature가 0이 아니어서', '정책이 학습 시점 이후에 바뀌어 가중치에 없어서', 'LoRA 어댑터가 너무 작아서'], a: 1,
      why: 'FT의 지식은 학습 데이터 시점에 멈춘다. 바뀐 사실을 바로 반영하려면 RAG로 최신 문서를 붙여야 한다.' },
  ];

  R.page({ title: 'RAG vs Fine-tuning', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
