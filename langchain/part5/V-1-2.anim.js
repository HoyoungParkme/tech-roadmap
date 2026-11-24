/* V-1-2 프롬프트 관리 (LangSmith Hub) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 파일 아이콘 + 이름
  function fileRow(x, y, w, name, memo, o) { o = o || {};
    const g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: -24, width: w, height: 48, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.8 }, g);
    el('path', { d: 'M14,-14 h16 l8,8 v22 h-24 z', fill: SOFT, stroke: MUT, 'stroke-width': 1.6 }, g);
    mono(50, -2, name, { 'font-size': 14.5, 'font-weight': 700 }, g);
    tx(50, 17, memo, { 'font-size': 13.5, fill: MUT }, g); return g; }

  // ── 1. 코드에 박힌 프롬프트와 쌓이는 final 파일들
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const all = ['llm = ChatOpenAI(model="gpt-4o-mini")', 'PROMPT_TEXT = """', '당신은 친절한 고객 상담 챗봇입니다.', '문서: {context}   질문: {question}', '"""', 'prompt = ChatPromptTemplate.from_template(...)', 'chain = prompt | llm'];
    const n = k === 0 ? 1 : k === 1 ? 5 : 7;
    tx(24, 34, 'hardcoded.py', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    snippet(24, 44, all.slice(0, n), { fs: 14.5, w: 450 });
    if (k >= 1) { const o = k === 1 ? fade(u, 0.5) : 1; el('rect', { x: 24, y: 44 + 10 + 22.5, width: 450, height: 4 * 22.5 + 2, rx: 4, fill: BAD, opacity: 0.12 * o });
      tx(484, 128, '←', { 'font-size': 18, fill: BAD, opacity: o, 'font-weight': 800 }); }
    // 폴더
    el('path', { d: 'M520,40 h120 l14,16 h286 v344 h-420 z', fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    mono(536, 74, 'prompts/', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const files = b.tree || [], pn = (p.tree || []).length;
    files.forEach((f, i) => { const y = 120 + i * 64, fresh = i >= pn, s = fresh ? pop(u, 0.4) : 1;
      fileRow(540, y, 380, f.ver, `메모: ${f.msg} · 작성: ${f.author}`, { s, stroke: k === 4 ? BAD : GRID });
      if (k === 4) card(890, y - 2, 34, 34, { rx: 17, fill: WARN, stroke: 'none', text: '?', fs: 18, fw: 800, s: pop(u, 0.3 + i * 0.2) }); });
    if (k === 0) tx(730, 220, '아직 비어 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) });
    if (k >= 3) { const ps = ['수정 = 재배포', 'PM은 못 고친다', '비교 = git log', '롤백 = git revert', '공유 = 슬랙 복붙'];
      ps.forEach((s, i) => { const x = 130 + (i % 2) * 220, y = 270 + Math.floor(i / 2) * 44;
        card(x, y, 200, 34, { rx: 17, stroke: BAD, sw: 1.8, fill: BADBG, text: s, fs: 14, s: k === 3 ? pop(u, 0.2 + i * 0.25) : 1 }); }); }
    if (k === 4) tx(730, 392, '어느 게 진짜 최종인가?', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); }

  // ── 2. hub.pull: Hub 저장소의 커밋을 가리켜 받아 온다
  const CY = { v1: 170, v2: 240, v3: 310 };
  function hubRepo(c, name, o) { const b = c.beat, p = c.prev || {}, { k, u } = c;
    el('rect', { x: 18, y: 24, width: 350, height: 376, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
    tx(34, 52, 'LangSmith Hub', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    mono(34, 82, name, { 'font-size': 16, 'font-weight': 800 });
    if (o.stats) tx(34, 108, `다운로드 ${b.hubBox.downloads.toLocaleString('en-US')} · ★ ${b.hubBox.stars} (예시)`, { 'font-size': 13.5, fill: MUT });
    const tree = b.tree || [], ptree = p.tree || [];
    if (tree.length > 1) el('line', { x1: 60, y1: CY[tree[0].ver], x2: 60, y2: CY[tree[tree.length - 1].ver], stroke: GRID, 'stroke-width': 3 });
    tree.forEach((n) => { const y = CY[n.ver], fresh = !ptree.some((q) => q.ver === n.ver), on = n.status === 'pulled', s = fresh ? pop(u, 0.3) : 1;
      card(60, y, 40, 40, { rx: 20, fill: on ? ACC : PANEL, stroke: on ? ACC : MUT, sw: 2, text: n.ver, fs: 14, color: on ? PANEL : INK, s });
      tx(92, y - 3, n.msg, { 'font-size': 14, 'font-weight': 700, opacity: fresh ? fade(u, 0.5) : 1 });
      tx(92, y + 17, '@' + n.author, { 'font-size': 13.5, fill: MUT, opacity: fresh ? fade(u, 0.5) : 1 }); });
    const cur = tree.find((n) => n.status === 'pulled'), prv = ptree.find((n) => n.status === 'pulled');
    return cur ? tween(prv ? CY[prv.ver] : null, CY[cur.ver], u) : null; }
  function s2(t, c) { const { k, u } = c;
    const py = hubRepo(c, 'rlm/rag-prompt', { stats: true });
    const line = k === 3 ? 'prompt_v2 = hub.pull("rlm/rag-prompt:v2")' : 'prompt = hub.pull("rlm/rag-prompt")';
    mono(400, 52, line, { 'font-size': 15, 'font-weight': 700, fill: k === 3 ? ACC : INK });
    if (py != null) { pill(320, py, k === 3 ? '고정' : '최신', ACC, 1, { fs: 13.5 });
      if (k === 0 || k === 3) dot([[340, py], [400, 140]], seg(u, 0.4, 1.2), ACC, 7); }
    // 받아 온 템플릿: Human 메시지 하나, 자리 두 개
    const op = k === 0 ? fade(u, 1.1) : 1, X = 400, Y = 82;
    el('rect', { x: X, y: Y, width: 540, height: 160, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
    tx(X + 16, Y + 26, 'ChatPromptTemplate · Human 메시지 1개', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
    tx(X + 16, Y + 56, 'You are an assistant for question-answering tasks. …', { 'font-size': 14, opacity: op });
    const fillQ = k === 2 ? seg(u, 1.0, 1.6) : 0, fillC = k === 2 ? seg(u, 0.6, 1.2) : 0;
    const slot = (x, y, a, v, f) => { if (f >= 1 || (k > 2 && false)) mono(x, y, v, { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: op });
      else { const w = tw(a, 14) + 16; el('rect', { x: x - 6, y: y - 17, width: w, height: 24, rx: 6, fill: k === 1 ? ACCBG : SOFT, stroke: ACC, 'stroke-width': k === 1 ? 2 : 1.2, opacity: op }); mono(x + 2, y, a, { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: op }); } };
    tx(X + 16, Y + 92, 'Question:', { 'font-size': 14, opacity: op }); slot(X + 100, Y + 92, '{question}', '"LangSmith가 뭔가요?"', fillQ);
    tx(X + 16, Y + 126, 'Context:', { 'font-size': 14, opacity: op }); slot(X + 100, Y + 126, '{context}', '"LangSmith는 LLM 모니터링 도구입니다."', fillC);
    if (k === 1) tx(X + 270, 278, 'prompt.messages 로 확인: 자리 두 개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
    if (k === 2) { card(X + 270, 300, 540, 56, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.6, text: 'chain.invoke({"context": …, "question": …})', fs: 14, mono: true, s: pop(u, 0.1) });
      fly(X + 330, 296, X + 200, Y + 126, seg(u, 0.5, 1.2), 'context', { mono: true, fill: GOOD });
      fly(X + 420, 296, X + 200, Y + 92, seg(u, 0.9, 1.6), 'question', { mono: true, fill: GOOD });
      grow(X + 270, 330, X + 270, 356, seg(u, 1.8, 2.1), INK);
      card(X + 270, 380, 300, 34, { rx: 17, fill: ACCBG, stroke: ACC, sw: 2, text: '| llm  → AIMessage (예시)', fs: 14, mono: true, s: pop(u, 2.0) }); }
    if (k === 3) tx(X + 270, 290, '같은 이름, 다른 커밋 · 실험을 그대로 재현', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
    if (k === 4) { banner(X + 270, 300, '이름만 쓰면 최신 커밋', pop(u, 0.4)); tx(X + 270, 350, '남의 프롬프트를 쓰는 데서, 내 프롬프트를 올리는 쪽으로', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) }); } }

  // ── 3. hub.push: 새 커밋이 이력에 붙는다
  const NX = { v1: 170, v2: 400, v3: 630 };
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    mono(40, 46, 'my-org/qa-prompt', { 'font-size': 17, 'font-weight': 800 }); pill(262, 41, 'private', MUT, 1, { fs: 13.5 });
    const tree = b.tree || [], Y = 140, hasV3 = tree.some((n) => n.ver === 'v3');
    const lineTo = hasV3 ? (k === 1 ? lerp(NX.v2, NX.v3, E(u, 0.9, 1.5)) : NX.v3) : NX.v2;
    el('line', { x1: NX.v1, y1: Y, x2: lineTo, y2: Y, stroke: GRID, 'stroke-width': 4 });
    tree.forEach((n) => { const x = NX[n.ver], isNew = n.status === 'new', on = n.status === 'pulled';
      const s = isNew && k === 1 ? pop(u, 1.4) : 1;
      card(x, Y, 52, 52, { rx: 26, fill: isNew ? ACC : on ? INFO : PANEL, stroke: isNew ? ACC : on ? INFO : INK, sw: 2.2, text: n.ver, fs: 16, fw: 800, color: isNew || on ? PANEL : INK, s });
      tx(x, Y + 50, '@' + n.author, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: s });
      tx(x, Y + 72, n.msg, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); });
    if (k === 0) { snippet(390, 250, ['("system", "당신은 친근한 고객 상담 챗봇입니다."', '           " 답변은 bullet list 로 정리하세요."),'], { fs: 14, op: fade(u, 0.3) });
      card(NX.v3, Y, 52, 52, { rx: 26, fill: PANEL, stroke: MUT, dash: '5 5', sw: 2, text: '?', fs: 16, s: pop(u, 1.2) });
      tx(NX.v3, Y + 50, '아직 Hub 밖', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) }); }
    if (k === 1) { fly(560, 300, NX.v3, Y, seg(u, 0.2, 1.3), 'hub.push(...)', { mono: true });
      ['+ 톤: 친근하게', '+ 출력 형식: bullet list'].forEach((s, i) => pill(NX.v3 + 140, 250 + i * 40, s, GOOD, pop(u, 1.8 + i * 0.3), { fs: 13.5 }));
      tx(NX.v3 + 140, 330, 'diff · 작성자 · 시간 자동 기록', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 2) { person(830, 320, '팀원', { s: pop(u, 0.1) });
      dot([[NX.v3 + 20, Y + 26], [820, 280]], seg(u, 0.3, 1.1), ACC, 7);
      mono(830, 392, 'hub.pull("my-org/qa-prompt")', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      dot([[NX.v2, Y + 30], [NX.v2, 290]], seg(u, 1.3, 2.0), INFO, 7);
      card(NX.v2, 320, 250, 40, { rx: 10, stroke: INFO, sw: 2, text: 'hub.pull("…:v2")  롤백', fs: 14, mono: true, s: pop(u, 1.8) }); }
    if (k === 3) [['배포 없이 교체', '코드는 pull 한 줄'], ['이력 자동 기록', '작성자 · diff · 시간'], ['한 줄 롤백', ':v2 로 바로']].forEach(([a, s], i) => {
      card(170 + i * 310, 320, 270, 66, { rx: 10, stroke: GOOD, sw: 2, fill: GOODBG, text: a + '\n' + s, fs: 15, s: pop(u, 0.2 + i * 0.35) }); }); }

  // ── 4. A/B: 같은 50문항으로 두 버전을 잰다
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    card(150, 46, 220, 40, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.6, text: 'qa-eval-50 · 50문항', fs: 14.5 });
    pill(430, 46, 'chain_v2', INFO, k === 0 ? pop(u, 0.3) : 1, { mono: true }); pill(560, 46, 'chain_v3', ACC, k === 0 ? pop(u, 0.6) : 1, { mono: true });
    if (k === 0) for (let i = 0; i < 8; i++) { dot([[260, 46], [300, 82], [430, 82], [430, 66]], (t * 0.6 + i / 8) % 1, INFO, 4); dot([[260, 46], [300, 82], [560, 82], [560, 66]], (t * 0.6 + i / 8 + 0.05) % 1, ACC, 4); }
    const M = (b.abChart && b.abChart.metrics) || [{ name: '정확도 (%)', max: 100 }, { name: '응답 시간 (ms)', max: 1500, lowerIsBetter: true }, { name: '비용 ($/1k)', max: 0.3, lowerIsBetter: true }, { name: '사용자 만족 (★)', max: 5 }];
    const PM = (p.abChart && p.abChart.metrics) || [];
    const BX = 250, BW = 440, fmtv = (m, v) => m.unit === '$' ? v.toFixed(2) : m.unit === '★' ? v.toFixed(1) : String(Math.round(v));
    tx(BX, 108, '■ v2', { 'font-size': 14, 'font-weight': 700, fill: INFO }); tx(BX + 60, 108, '■ v3', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    if (k === 3) tx(905, 108, '승자', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    M.forEach((m, i) => { const y = 150 + i * 66, pm = PM[i] || {};
      tx(30, y + 4, m.name, { 'font-size': 15, 'font-weight': 700 });
      if (m.lowerIsBetter) tx(30, y + 24, '낮을수록 좋다', { 'font-size': 13.5, fill: MUT });
      [['v2', INFO, -12], ['v3', ACC, 12]].forEach(([key, col, dy]) => { const v = m[key] == null ? 0 : tween(pm[key] == null ? 0 : pm[key], m[key], u);
        el('rect', { x: BX, y: y + dy - 9, width: BW, height: 18, rx: 4, fill: SOFT });
        if (v > 0) { el('rect', { x: BX, y: y + dy - 9, width: BW * v / m.max, height: 18, rx: 4, fill: col });
          mono(BX + BW * v / m.max + 8, y + dy + 5, fmtv(m, v), { 'font-size': 14, 'font-weight': 700, fill: col }); } });
      if (k === 3) { const v3win = m.lowerIsBetter ? m.v3 < m.v2 : m.v3 > m.v2;
        pill(905, y, v3win ? 'v3' : 'v2 근소', v3win ? ACC : INFO, pop(u, 0.2 + i * 0.25), { fs: 13.5 }); } });
    if (k === 0) tx(470, 300, '아직 승자는 없다. 데이터로 정한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1) });
    if (k === 3) { banner(780, 46, 'WINNER v3 · latest', pop(u, 1.4)); }
    sub(470, 412, '수치는 이 장의 예시 값', 1); }

  // ── 5. 협업: 태그가 버전을 가리키고 역할마다 하는 일이 다르다
  const VX = { v3: 300, v4: 520, v5: 740 }, ROLE = [['서연', '개발자', 'hub.pull(":production")'], ['미나', 'PM', 'UI에서 편집 · v5 저장'], ['지훈', 'QA', 'A/B 평가 · staging'], ['세라', '운영', '승급 · 롤백']];
  function flag(x, y, s, col, sc) { const g = R.G(x, y, sc);
    el('line', { x1: 0, y1: 0, x2: 0, y2: -34, stroke: col, 'stroke-width': 2.5 }, g);
    const w = tw(s, 13.5) + 18; el('rect', { x: 0, y: -50, width: w, height: 24, rx: 5, fill: col }, g);
    tx(9, -33, s, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, class: 'mono' }, g); }
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {}, Y = 140;
    const tree = b.tree || [], pt = p.tree || [], mem = (b.collab && b.collab.members) || [], pm = ((p.collab && p.collab.members) || []).length;
    mono(30, 40, 'my-org/qa-prompt', { 'font-size': 16, 'font-weight': 800 });
    const xs = tree.map((n) => VX[n.ver]); if (xs.length > 1) el('line', { x1: Math.min(...xs), y1: Y, x2: Math.max(...xs), y2: Y, stroke: GRID, 'stroke-width': 4 });
    tree.forEach((n) => { const x = VX[n.ver], fresh = !pt.some((q) => q.ver === n.ver), s = fresh ? pop(u, 0.5) : 1;
      const col = n.status === 'tagged-prod' ? GOOD : n.status === 'tagged-stg' ? WARN : MUT;
      card(x, Y, 50, 50, { rx: 25, fill: PANEL, stroke: col, sw: 2.5, text: n.ver, fs: 16, fw: 800, s });
      tx(x, Y + 46, '@' + n.author, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); });
    const tags = (b.hubBox && b.hubBox.tags) || [], ptags = (p.hubBox && p.hubBox.tags) || [];
    if (tags.includes('production')) flag(VX.v3 - 4, Y - 26, 'production', GOOD, 1);
    if (tags.includes('staging')) flag(VX.v4 - 4, Y - 26, 'staging', WARN, ptags.includes('staging') ? 1 : pop(u, 1.0));
    if (tags.includes('experimental')) { const s = ptags.includes('experimental') ? 1 : pop(u, 0.6);
      card(870, Y, 150, 52, { rx: 8, dash: '5 4', stroke: INFO, sw: 2, text: 'experimental\n자유 실험', fs: 13.5, s }); }
    if (k === 3) { dot([[VX.v4, Y - 60], [VX.v3, Y - 60]], seg(u, 0.6, 1.6), GOOD, 7); tx((VX.v3 + VX.v4) / 2, 52, '검증되면 승급', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) }); }
    mem.forEach((m, i) => { const x = 130 + i * 233, fresh = i >= pm, s = fresh ? pop(u, 0.2) : 1, [nm, role, act] = ROLE[i];
      person(x, 290, null, { s, stroke: fresh ? ACC : INK });
      tx(x, 346, `${nm} · ${role}`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: s });
      tx(x, 370, act, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: i === 0 ? 'mono' : null, opacity: s });
      const tgt = i === 0 ? VX.v3 : i === 1 ? VX.v5 : i === 2 ? VX.v4 : VX.v3;
      if (fresh && k < 4) dot([[x, 256], [tgt, Y + 64]], seg(u, 0.7, 1.6), ACC, 6); });
    if (k === 4) banner(520, 222, '코드 배포 0번으로 프롬프트가 바뀐다', pop(u, 1.2)); }

  const quiz = [
    { q: '프롬프트를 .py 안에 문자열로 박아 두면 생기는 문제는 무엇인가?',
      o: ['LLM 호출이 느려진다', '문구 하나만 고쳐도 코드 변경과 배포가 필요하다', '프롬프트에 {context} 자리를 쓸 수 없다'], a: 1,
      why: '프롬프트가 코드의 일부라서 수정이 곧 배포다. 그래서 prompt_v2_final.txt 같은 백업 파일만 쌓이고 PM은 손대지 못한다.' },
    { q: 'hub.pull("rlm/rag-prompt")처럼 이름만 주면 어떤 버전을 받는가?',
      o: ['가장 최신 커밋', '가장 처음 올린 버전', '다운로드가 가장 많은 버전'], a: 0,
      why: '이름 뒤에 아무것도 없으면 최신 커밋을 받는다. 커밋 해시나 태그를 붙여야 그 버전에 고정된다.' },
    { q: 'v3를 push한 뒤 답변 품질이 떨어졌다. 가장 빠른 되돌리기는 무엇인가?',
      o: ['git revert 후 다시 배포한다', 'Hub에서 v3 커밋을 지운다', '이전 커밋 v2를 지정해 다시 pull한다'], a: 2,
      why: 'Hub에는 v1부터 모든 커밋이 남는다. v2를 지정해 pull하면 바로 그 프롬프트로 돌아간다.' },
    { q: 'A/B에서 v3가 정확도 87%, v2가 79%이고 비용은 v3 0.13, v2 0.12였다. 알맞은 판단은 무엇인가?',
      o: ['비용이 조금 더 드니 v2를 유지한다', '정확도·응답 시간·만족도가 앞선 v3를 채택한다', '차이가 작으니 감으로 고른다'], a: 1,
      why: '네 지표 중 세 개에서 v3가 앞서고 비용 차이는 0.01뿐이다. 같은 50문항으로 잰 결과라 비교가 공정하다.' },
    { q: '운영 코드가 hub.pull("my-org/qa-prompt:production")을 쓴다. PM이 UI에서 v5를 저장하면 운영은 어떻게 되는가?',
      o: ['production 태그를 v5로 옮기기 전까지 그대로다', '저장 즉시 v5로 바뀐다', '코드를 다시 배포해야 v5가 된다'], a: 0,
      why: '코드는 태그를 가리킨다. 태그가 v3에 붙어 있는 한 운영은 v3를 받고, 승급은 태그를 옮기는 일로 끝난다.' },
  ];

  const summary = [
    '프롬프트를 코드에 박아 두면 문구 하나 고쳐도 배포해야 하고 final 파일만 쌓인다.',
    'hub.pull 한 줄로 Hub의 프롬프트를 받고, 커밋 해시나 태그를 붙이면 그 버전에 고정된다.',
    'hub.push는 새 커밋을 만들고 작성자와 이력을 남겨서 이전 버전으로 바로 돌아갈 수 있다.',
    '같은 50문항으로 v2와 v3를 재서 고르고, production 태그로 운영 버전을 정한다.',
  ];
  const review = [
    { q: 'PM이 프롬프트 문구를 자주 바꾸고 싶어 한다. 개발자가 매번 배포하지 않으려면 어떻게 하나?',
      o: ['프롬프트를 Hub에 두고 코드는 태그로 pull한다', '프롬프트를 .txt 파일로 빼서 함께 배포한다', 'PM에게 코드 저장소 쓰기 권한을 준다'], a: 0,
      why: 'Hub에 둔 프롬프트는 UI에서 고쳐 새 커밋이 되고, 코드는 태그만 가리키므로 배포 없이 바뀐다.' },
    { q: 'PM이 새 버전 v5를 만들었다. 운영에 올리기 전에 할 일로 알맞은 것은?',
      o: ['바로 production 태그를 v5로 옮긴다', '같은 평가 데이터셋으로 지금 운영 버전과 A/B를 돌린다', '최신 커밋이니 자동으로 운영된다'], a: 1,
      why: '감이 아니라 같은 문항에 대한 점수로 비교해야 한다. v2와 v3도 50문항 결과로 승자를 정했다.' },
    { q: '실험 결과를 몇 달 뒤 똑같이 재현해야 한다. 코드에 쓸 pull 방식은?',
      o: ['이름만 주고 매번 최신 커밋을 받는다', 'production 태그를 붙여 받는다', '커밋 해시를 붙여 그 버전에 고정한다'], a: 2,
      why: '최신 커밋이나 태그는 나중에 다른 커밋을 가리킬 수 있다. 커밋 해시는 바뀌지 않아 같은 프롬프트로 다시 돌릴 수 있다.' },
  ];

  R.page({ title: 'Prompt Hub 버전 관리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
