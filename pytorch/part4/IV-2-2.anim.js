/* IV-2-2 Hugging Face 생태계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: BERT 파라미터(109,482,240)와 그 분해, 토큰 id, logits(−4.2110, 4.5178), 확률(0.9998 / 0.9995),
 *       DistilBERT·LoRA 파라미터 수(739,586 / 67,694,596)는 transformers 5.24 · peft 0.22 · torch 2.15 CPU 로 코드를 돌려 얻은 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 생태계 지도 ----------
  function cloud(cx, cy, s, label) { const g = G(cx, cy, s);
    el('path', { d: 'M-90,20 a28,28 0 0 1 10,-44 a40,40 0 0 1 72,-14 a34,34 0 0 1 62,10 a28,28 0 0 1 36,48 z', fill: WARNBG, stroke: WARN, 'stroke-width': 2.5 }, g);
    tx(0, 4, label, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN }, g); }
  function ground(s) { card(480, 370, 860, 56, { rx: 10, fill: ACCBG, stroke: ACC, sw: 3, s });
    mono(480, 366, 'torch.nn.Module', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: s });
    tx(480, 388, '.parameters() · .to(device) · .train() / .eval() · forward()', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: s }); }
  const LIBS = [['transformers', '가중치 → 모델', ACC], ['datasets', '데이터 로딩', INFO], ['tokenizers', '문장 → 정수', WARN]];
  function libs(n, u, live) { LIBS.slice(0, n).forEach(([a, b, col], i) => { const x = 210 + i * 270, s = live && i === n - 1 ? pop(u, 0.3) : 1, y = live && i === n - 1 ? lerp(150, 268, E(u, 0.3, 1.0)) : 268;
      card(x, y, 240, 70, { rx: 10, stroke: col, sw: 2.5, s }); mono(x, y - 2, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s }); tx(x, y + 22, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { ground(pop(u, 0.2)); libs(1, u, true); note(560, 200, 'pip install transformers datasets torch', fade(u, 1.2), { class: 'mono', 'font-size': 14.5 });
      note(560, 230, 'torch 위에 얹히는 층이다', fade(u, 1.6), { fill: ACC }); return; }
    if (k === 1) { ground(1); cloud(210, 80, pop(u, 0.2), 'Hub');
      for (let i = 0; i < 5; i++) dot([[210, 100], [210, 330]], seg(u, 0.5 + i * 0.2, 1.4 + i * 0.2), WARN, 6);
      card(210, 230, 280, 56, { rx: 10, stroke: ACC, sw: 2.5, s: pop(u, 1.4) }); mono(210, 236, 'model', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      mono(400, 120, 'AutoModel.from_pretrained("bert-base-uncased")', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4) });
      card(700, 230, 300, 56, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 1.9) }); mono(700, 236, '~/.cache/huggingface', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) });
      sub(700, 286, '두 번째부터는 캐시에서 읽는다', fade(u, 2.2)); return; }
    if (k === 2) { ground(1); const N = [['BertModel', 140], ['BertPreTrainedModel', 230], ['PreTrainedModel', 300]];
      N.forEach(([n, y], i) => { const s = pop(u, 0.2 + i * 0.4); card(300, y - 60, 300, 44, { rx: 8, text: n, fs: 15, mono: true, stroke: i ? MUT : ACC, color: i ? INK : ACC, s });
        grow(300, y - 36, 300, y + (i === 2 ? 12 : 18), seg(u, 0.4 + i * 0.4, 0.7 + i * 0.4), MUT); });
      card(720, 160, 340, 56, { rx: 28, fill: GOODBG, stroke: GOOD, sw: 2.5, s: pop(u, 1.6) });
      mono(700, 166, 'isinstance(model, nn.Module)', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); check(860, 160, 11, pop(u, 2.0));
      mono(720, 230, '→ True', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { const P = [['embeddings', 23837184, WARN], ...Array.from({ length: 12 }, (_, i) => ['L' + (i + 1), 7087872, ACC]), ['pooler', 590592, INFO]], tot = 109482240;
      let x = 40; P.forEach(([n, p, col], i) => { const w = 880 * p / tot, s = clamp(E(u, 0.2, 1.8) * P.length - i);
        el('rect', { x: x + 1, y: 150, width: Math.max(2, w - 2), height: 90 * s, rx: 4, fill: col, opacity: 0.75 });
        if (i === 0) mono(x + w / 2, 268, n, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: s });
        else if (i === 1 || i === 12) mono(x + w / 2, 268, n, { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: s });
        x += w; });
      mono(40, 120, 'sum(p.numel() for p in model.parameters())', { 'font-size': 15, 'font-weight': 700 });
      mono(920, 120, '109,482,240', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 1.8) });
      tx(40, 310, 'embeddings 23,837,184', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(330, 310, '인코더 12층 × 7,087,872', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(920, 310, 'pooler 590,592', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.2) });
      sub(480, 370, 'Part Ⅰ 의 .parameters() 가 그대로 먹힌다 · 옵티마이저에 넘기는 법도 같다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 4) { ground(1); const mv = E(u, 0.3, 1.2);
      el('rect', { x: 600, y: 140, width: 130, height: 110, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 2 }); mono(665, 280, 'cuda / cpu', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
      card(lerp(220, 665, mv), 195, 110, 50, { rx: 8, text: 'model', fs: 16, mono: true, stroke: ACC, color: ACC });
      mono(330, 150, 'model.to(device)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      card(320, 290, 180, 40, { rx: 20, text: 'model.eval()', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.5) });
      sub(320, 330, '추론 전 eval() 은 여기서도 필수', fade(u, 1.8)); return; }
    ground(1); libs(3, u, false); cloud(480, 120, pop(u, 0.2), 'Hub · 모델·데이터 저장소');
    for (let i = 0; i < 3; i++) grow(480 + (i - 1) * 40, 150, 210 + i * 270, 226, seg(u, 0.5 + i * 0.2, 0.9 + i * 0.2), WARN);
    for (let i = 0; i < 3; i++) grow(210 + i * 270, 306, 210 + i * 270, 336, seg(u, 1.2 + i * 0.2, 1.5 + i * 0.2), ACC); }

  // ---------- 2. pipeline ----------
  const BX = 480, BY = 220;
  function machine(task, open, s) { card(BX, BY, 400, 150, { rx: 14, stroke: ACC, sw: 3, fill: open > 0.5 ? PANEL : ACCBG, s });
    mono(BX, BY - 90, `pipeline("${task}")`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: s });
    if (open > 0) { [['① tokenizer', '문장 → input_ids', WARN], ['② model', 'forward → logits', ACC], ['③ 후처리', 'softmax · argmax', GOOD]].forEach(([a, b, col], i) => { const x = BX - 130 + i * 130;
        card(x, BY, 118, 104, { rx: 8, stroke: col, sw: 2, s: open }); tx(x, BY - 14, a, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: open });
        tx(x, BY + 14, b.split(' → ')[0], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: open }); tx(x, BY + 34, b.includes('→') ? '→ ' + b.split(' → ')[1] : '', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: open }); }); }
    else tx(BX, BY + 6, '모델 · 토크나이저 · 후처리', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, opacity: s }); }
  function io(inp, out, u, outCol) { card(BX, 60, 520, 40, { rx: 8, text: inp, fs: 15, mono: true, stroke: INK, s: pop(u, 0.3) });
    dot([[BX, 80], [BX, BY - 76]], seg(u, 0.7, 1.2), INK, 7); dot([[BX, BY + 76], [BX, 338]], seg(u, 1.4, 1.9), outCol || ACC, 7);
    card(BX, 360, 600, 44, { rx: 8, text: out, fs: 15, mono: true, stroke: outCol || ACC, color: outCol || ACC, sw: 2.5, s: pop(u, 1.9) }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { machine('sentiment-analysis', 0, pop(u, 0.2)); note(40, 360, '태스크 이름만 넘기면 그 태스크의 기본 모델을 받아 온다', fade(u, 1.2)); return; }
    if (k === 1) { machine('sentiment-analysis', 0, 1); io('"I love PyTorch, it just clicks!"', "[{'label': 'POSITIVE', 'score': 0.9995}]", u, GOOD); return; }
    if (k === 2) { machine('ner', 0, 1); io('"Hugging Face is based in New York."', "[{'entity_group': 'ORG', 'word': 'Hugging Face'}, …]", u, INFO);
      sub(800, 140, 'aggregation_strategy="simple"', fade(u, 0.6), { 'font-size': 13.5 }); return; }
    if (k === 3) { machine('text-generation', 0, 1); io('gen("Deep learning is", max_new_tokens=20)', '[{"generated_text": "Deep learning is …"}]', u, WARN);
      sub(800, 140, 'model="gpt2" 로 직접 지정', fade(u, 0.6), { 'font-size': 14 }); return; }
    if (k === 4) { machine('sentiment-analysis', E(u, 0.2, 0.9), 1);
      for (let i = 0; i < 3; i++) dot([[BX - 210, BY], [BX + 210, BY]], seg(u, 1.0 + i * 0.3, 2.2 + i * 0.3), INK, 6);
      sub(BX, 340, '결과가 이상하면 세 칸 중 어디를 볼지 정할 수 있다', fade(u, 2.0), { 'font-size': 15 }); return; }
    machine('sentiment-analysis', 1, 1);
    card(BX, 360, 640, 44, { rx: 8, text: 'model="distilbert-base-uncased-finetuned-sst-2-english"', fs: 14, mono: true, stroke: INK, sw: 2.5, s: pop(u, 0.3) });
    lock(BX - 340, 360, true, INK, pop(u, 0.8));
    const T = ['ner', 'summarization', 'text-generation', 'question-answering', 'translation'];
    T.forEach((s, i) => pill(i < 3 ? 120 : 840, 90 + (i % 3) * 50 + (i >= 3 ? 25 : 0), s, MUT, pop(u, 1.2 + i * 0.15), { mono: true, fs: 13.5 }));
    sub(BX, 412, '모델 ID 를 못박아야 기본 모델이 바뀌어도 결과가 재현된다', fade(u, 1.8), { 'font-size': 14 }); }

  // ---------- 3. 수동 분해 ----------
  const TOK = [['[CLS]', 101], ['i', 1045], ['love', 2293], ['p', 1052], ['##yt', 22123], ['##or', 2953], ['##ch', 2818], ['!', 999], ['[SEP]', 102]];
  function tokens(u, live, y) { y = y || 140; TOK.forEach(([w, id], i) => { const x = 90 + i * 96, s = live ? pop(u, 0.5 + i * 0.12) : 1, sp = w.startsWith('[');
      card(x, y, 86, 36, { rx: 6, text: w, fs: 14.5, mono: true, stroke: sp ? MUT : WARN, color: sp ? MUT : INK, s });
      mono(x, y + 44, String(id), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: live ? fade(u, 1.2 + i * 0.1) : 1 });
      mono(x, y + 72, '1', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, opacity: live ? fade(u, 1.8 + i * 0.05) : 1 }); });
    tx(40, y + 49, 'ids', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', 'font-weight': 700 }); tx(40, y + 77, 'mask', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'end', 'font-weight': 700 }); }
  function enc(x, y, s, o) { o = o || {}; card(x, y, 150, 150, { rx: 10, stroke: ACC, sw: 2.5, s }); for (let i = 0; i < 6; i++) el('rect', { x: x - 55, y: y - 58 + i * 18, width: 110, height: 13, rx: 3, fill: ACC, opacity: 0.25 * s });
    mono(x, y + 92, o.label || 'DistilBERT', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: s }); }
  function logitsCells(x, y, s, prob) { const V = [['NEGATIVE', '-4.2110', '0.0002'], ['POSITIVE', '4.5178', '0.9998']];
    V.forEach(([n, v, p], i) => { card(x + i * 130, y, 120, 50, { rx: 6, text: prob ? p : v, fs: 17, mono: true, stroke: i ? GOOD : BAD, color: i ? GOOD : BAD, sw: 2.5, s });
      tx(x + i * 130, y + 46, n, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { const P = [['AutoTokenizer', WARN, 230], ['AutoModelForSequenceClassification', ACC, 650]];
      P.forEach(([n, col, x], i) => { card(x, 150, i ? 420 : 260, 70, { rx: 12, stroke: col, sw: 2.5, s: k === 0 ? pop(u, 0.2 + i * 0.4) : 1 }); mono(x, 156, n, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); });
      if (k === 0) { note(200, 270, 'Auto* 는 체크포인트 이름만 보고 알맞은 구현을 고른다', fade(u, 1.3)); return; }
      card(480, 300, 640, 44, { rx: 22, text: 'name = "distilbert-base-uncased-finetuned-sst-2-english"', fs: 14.5, mono: true, stroke: INK, s: pop(u, 0.2) });
      grow(330, 278, 250, 190, seg(u, 0.6, 1.0), INK); grow(630, 278, 650, 190, seg(u, 0.8, 1.2), INK);
      tx(480, 380, '토크나이저와 모델은 같은 이름으로 짝지어 부른다 · 섞으면 토큰 번호가 어긋난다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { card(480, 60, 300, 40, { rx: 8, text: '"I love PyTorch!"', fs: 16, mono: true, stroke: INK, s: pop(u, 0.2) });
      tokens(u, true); sub(480, 290, 'PyTorch 는 사전에 없어 p · ##yt · ##or · ##ch 로 쪼개진다', fade(u, 2.0), { 'font-size': 15 });
      mono(480, 330, 'return_tensors="pt"  →  input_ids [1, 9] · attention_mask [1, 9]', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    // k ≥ 3: 순전파
    card(140, 210, 200, 60, { rx: 8, text: 'input_ids [1, 9]', fs: 15, mono: true, stroke: WARN, color: WARN });
    enc(400, 210, 1); grow(242, 210, 322, 210, k === 3 ? seg(u, 0.3, 0.7) : 1, MUT);
    if (k === 3) { for (let i = 0; i < 4; i++) dot([[240, 210], [470, 210], [560, 210]], seg(u, 0.4 + i * 0.25, 1.6 + i * 0.25), WARN, 6);
      card(400, 360, 420, 44, { rx: 22, fill: INFOBG, stroke: INFO, sw: 2, s: pop(u, 1.4) }); mono(400, 366, 'with torch.no_grad():  out = model(**enc)', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.5) });
      return; }
    grow(478, 210, 560, 210, 1, MUT); logitsCells(620, 210, k === 4 ? pop(u, 0.2) : 1, k >= 5 && E(u, 0.4, 1.0) > 0.5 && k === 5 ? true : false);
    if (k === 4) { mono(685, 140, 'out.logits', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      ['type → torch.Tensor', 'shape → [1, 2]', 'dtype → float32'].forEach((s, i) => mono(560, 320 + i * 28, s, { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4) }));
      return; }
    if (k === 5) { mono(685, 140, 'torch.softmax(logits, dim=-1)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      el('rect', { x: 690, y: 238, width: 120, height: 36, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.3) });
      card(750, 340, 300, 48, { rx: 24, fill: GOODBG, stroke: GOOD, sw: 2.5, text: 'id2label[1] → POSITIVE', fs: 15, mono: true, color: GOOD, s: pop(u, 1.6) });
      sub(320, 380, '후처리를 직접 하면 임계값·상위 k 개도 바꿀 수 있다', fade(u, 2.1), { 'font-size': 14 }); return; }
    // k6: 파인튜닝의 근거
    card(860, 210, 120, 50, { rx: 8, text: 'loss', fs: 17, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.3) }); grow(810, 210, 798, 210, 1, MUT);
    el('path', { d: 'M860,185 C860,90 400,90 400,133', fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.8) });
    mono(640, 86, 'loss.backward()', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.2) });
    note(40, 400, '출력이 평범한 텐서라서 Part Ⅱ 의 3박자 루프를 그대로 얹을 수 있다', fade(u, 1.8)); }

  // ---------- 4. 파인튜닝 두 길 ----------
  function lanes(u, live) { const op = live ? fade(u, 0.2) : 1;
    el('rect', { x: 20, y: 150, width: 920, height: 112, rx: 12, fill: ACCBG, opacity: 0.5 * op }); el('rect', { x: 20, y: 280, width: 920, height: 112, rx: 12, fill: INFOBG, opacity: 0.6 * op });
    tx(36, 174, '① 우리 방식 — 3박자 루프', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: op }); tx(36, 304, '② Trainer API', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: op }); }
  function ring(cx, cy, r, u, live, col) { const N = ['zero_grad', 'backward', 'step'];
    el('circle', { cx, cy, r, fill: 'none', stroke: col, 'stroke-width': 2.5, opacity: 0.6 });
    N.forEach((n, i) => { const a = (-90 + i * 120) * Math.PI / 180; pill(cx + r * Math.cos(a), cy + r * Math.sin(a), n, col, live ? pop(u, 0.3 + i * 0.25) : 1, { mono: true, fs: 13.5, fill: PANEL }); });
    if (live) { const a = (-90 + ((u * 0.9) % 1) * 360) * Math.PI / 180; el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 6, fill: INK }); } }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { lanes(u, true);
      [['DataLoader', 210, ACC], ['load_dataset', 420, MUT], ['TrainingArguments', 230, INFO], ['Trainer', 470, INFO]].forEach(([n, x, col], i) => pill(x, i < 2 ? 215 : 345, n, col, pop(u, 0.5 + i * 0.3), { mono: true, fs: 15, fill: PANEL }));
      note(560, 80, '두 길은 배타적이지 않다', fade(u, 1.6)); note(560, 110, '같은 파일에서 부품만 골라 쓴다', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 1) { enc(260, 210, pop(u, 0.2), { label: 'distilbert-base-uncased' });
      card(520, 210, 110, 90, { rx: 10, stroke: WARN, sw: 2.5, dash: '6 4', s: pop(u, 0.9) }); grow(338, 210, 462, 210, seg(u, 0.7, 1.0), MUT);
      for (let i = 0; i < 12; i++) el('rect', { x: 478 + (i % 4) * 21, y: 180 + Math.floor(i / 4) * 21, width: 17, height: 17, rx: 3, fill: WARN, opacity: 0.15 + 0.7 * hsh(i + Math.floor(u * 6) * 13) * fade(u, 1.0) });
      mono(520, 284, 'num_labels=2', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.1) });
      note(620, 180, '새 분류 헤드는 무작위 초기화', fade(u, 1.6), { fill: WARN }); note(620, 210, '학습 전 예측은 의미가 없다', fade(u, 1.9)); note(620, 240, '→ 그래서 파인튜닝한다', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 2) { const st = ['load_dataset("imdb")', 'map(prep, batched=True)', 'with_format("torch")'];
      st.forEach((s, i) => { const x = 170 + i * 310; card(x, 110, 280, 44, { rx: 22, text: s, fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.2 + i * 0.5) }); if (i) grow(x - 170, 110, x - 142, 110, seg(u, 0.3 + i * 0.5, 0.6 + i * 0.5), MUT); });
      const f = E(u, 1.0, 2.0);
      for (let r = 0; r < 4; r++) { const y = 200 + r * 46; tx(60, y + 6, ['"This movie was great …"', '"Terrible plot and …"', '"I loved every …"', '"Not worth …"'][r], { 'font-size': 14.5, class: 'mono', opacity: 1 - f });
        for (let j = 0; j < 12; j++) el('rect', { x: 60 + j * 34, y: y - 12, width: 30, height: 24, rx: 3, fill: j < 5 + (r * 3) % 6 ? WARN : SOFT, stroke: GRID, opacity: f }); }
      mono(500, 240, 'truncation=True', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); mono(500, 268, 'padding="max_length"', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) });
      sub(700, 330, '회색 칸 = 길이를 맞추려 채운 패딩', fade(u, 2.2), { 'font-size': 14 }); return; }
    lanes(u, false);
    if (k >= 3) { pill(200, 215, 'DataLoader(batch_size=8)', ACC, k === 3 ? pop(u, 0.2) : 1, { mono: true, fs: 14, fill: PANEL }); pill(450, 215, 'AdamW(lr=2e-5)', ACC, k === 3 ? pop(u, 0.6) : 1, { mono: true, fs: 14, fill: PANEL });
      pill(620, 215, 'model.train()', ACC, k === 3 ? pop(u, 1.0) : 1, { mono: true, fs: 14, fill: PANEL }); }
    if (k === 3) { sub(480, 345, '사전학습 가중치를 크게 흔들지 않게 lr 을 2e-5 로 작게', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k >= 4) ring(830, 206, 40, u, k === 4, ACC);
    if (k === 4) { mono(400, 250, 'out = model(..., labels=batch["label"]) → out.loss', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(480, 345, 'labels 를 넘기면 모델이 loss 까지 계산해 준다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k >= 5) { pill(260, 345, 'TrainingArguments(epochs=1, batch=8, lr=2e-5)', INFO, k === 5 ? pop(u, 0.2) : 1, { mono: true, fs: 14, fill: PANEL });
      [[200, 230], [450, 340]].forEach(([a, b], i) => el('line', { x1: a, y1: 231, x2: b, y2: 329, stroke: WARN, 'stroke-width': 1.8, 'stroke-dasharray': '4 4', opacity: k === 5 ? fade(u, 0.9 + i * 0.3) : 0.5 })); }
    if (k === 5) { note(560, 80, '같은 하이퍼파라미터가 코드가 아니라 인자가 됐다', fade(u, 1.4)); return; }
    pill(660, 345, 'trainer.train()', INFO, pop(u, 0.2), { mono: true, fs: 15, fill: PANEL });
    el('circle', { cx: 830, cy: 336, r: 40, fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '5 5', opacity: fade(u, 0.6) });
    mono(830, 341, '3박자', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.7) });
    ['Lightning trainer.fit()', 'Keras model.fit()', 'HF Trainer.train()'].forEach((s, i) => pill(160 + i * 320, 80, s, MUT, pop(u, 1.2 + i * 0.25), { mono: true, fs: 14 }));
    sub(480, 122, '같은 위상의 도구 · 안에서 도는 건 결국 forward → loss → backward', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 5. 실무 지도 ----------
  function licenses(rows, u, live, x0, y0) { rows.forEach((r, i) => { const y = y0 + i * 46, s = live && i === rows.length - 1 ? pop(u, 0.4) : 1, col = r.tone === 'good' ? GOOD : r.tone === 'warn' ? WARN : BAD;
      el('circle', { cx: x0, cy: y, r: 10 * s, fill: col }); mono(x0 + 22, y - 2, r.lic, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); tx(x0 + 22, y + 18, r.ok, { 'font-size': 13.5, fill: col, opacity: s }); });
    tx(x0 - 10, y0 - 30, '라이선스 (모델 카드에서 확인)', { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  function s5(t, c) { const { k, u } = c, lr = c.beat.licenseRows || [];
    if (k === 0) { const D = [['~/.cache/huggingface', '기본 · 홈 디스크', BAD, 230], ['/data/hf_cache', 'HF_HOME 으로 지정', GOOD, 690]];
      D.forEach(([p, d, col, x], i) => { el('rect', { x: x - 150, y: 140, width: 300, height: 150, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2.5, opacity: fade(u, 0.2 + i * 0.3) });
        mono(x, 128, p, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.3 + i * 0.3) }); tx(x, 314, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      for (let i = 0; i < 5; i++) { const f = E(u, 0.8 + i * 0.25, 1.4 + i * 0.25); el('rect', { x: 560 + (i % 3) * 86, y: 236 - Math.floor(i / 3) * 40 - 30 * (1 - f), width: 76, height: 32, rx: 4, fill: GOOD, opacity: 0.6 * f }); }
      mono(480, 380, 'os.environ["HF_HOME"] = "/data/hf_cache"   # import 전에', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 1 || k === 2) { licenses(lr, u, true, 620, 140);
      if (k === 1) { pill(250, 160, 'from peft import LoraConfig', ACC, pop(u, 0.2), { mono: true, fs: 15 }); pill(250, 220, 'get_peft_model', ACC, pop(u, 0.5), { mono: true, fs: 15 }); sub(250, 270, 'pip install peft · 모델을 감싸는 방식', fade(u, 1.0), { 'font-size': 14 }); return; }
      mono(40, 120, 'AutoModelForSequenceClassification(num_labels=2)', { 'font-size': 14, 'font-weight': 700 });
      el('rect', { x: 40, y: 160, width: 500, height: 40, rx: 6, fill: BAD, opacity: 0.75 * E(u, 0.3, 1.2) });
      mono(290, 186, '66,955,010개 전부 학습 대상', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 1.0) });
      note(40, 250, '옵티마이저 상태까지 얹히면', fade(u, 1.6)); note(40, 278, '대형 모델은 GPU 메모리부터 터진다', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 3) { const x0 = 130, y0 = 120, S = 170;
      el('rect', { x: x0, y: y0, width: S, height: S, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5 }); lock(x0 + S / 2, y0 + S / 2, true, INFO, 1.2);
      mono(x0 + S / 2, y0 - 14, 'W  768 × 768', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      tx(x0 + S + 40, y0 + S / 2 + 8, '+', { 'font-size': 30, 'font-weight': 800, opacity: fade(u, 0.5) });
      const bx = x0 + S + 90, g = E(u, 0.6, 1.4);
      el('rect', { x: bx, y: y0, width: 14, height: S * g, fill: ACC, opacity: 0.8 }); mono(bx + 7, y0 + S + 22, 'B 768×8', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      el('rect', { x: bx + 40, y: y0 + S / 2 - 7, width: S * g, height: 14, fill: ACC, opacity: 0.8 }); mono(bx + 40 + S / 2, y0 + S / 2 - 16, 'A 8×768', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.3) });
      mono(660, 120, 'LoraConfig(r=8, lora_alpha=16,', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(680, 146, 'target_modules=["q_lin", "v_lin"])', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.4) });
      note(660, 210, '모듈 하나: 768×768 = 589,824 대신', fade(u, 1.6)); note(660, 240, '768×8 × 2 = 12,288 개만 학습', fade(u, 1.9), { fill: ACC });
      sub(480, 380, 'r 을 키우면 표현력이 늘지만 학습 파라미터도 함께 는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { const tot = 67694596, W = 880, x0 = 40, y = 170;
      el('rect', { x: x0, y, width: W, height: 44, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 });
      const wa = W * 147456 / tot, wh = W * 592130 / tot, g = E(u, 0.4, 1.2);
      el('rect', { x: x0, y, width: Math.max(3, wa) * g, height: 44, fill: ACC }); el('rect', { x: x0 + wa, y, width: wh * g, height: 44, fill: GOOD });
      mono(x0, 140, 'trainable params: 739,586 || all params: 67,694,596 || trainable%: 1.0925', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      [['LoRA 어댑터 147,456', ACC], ['분류 헤드 592,130', GOOD], ['동결 66,955,010', INFO]].forEach(([s, col], i) => { el('rect', { x: x0 + i * 270, y: 250, width: 16, height: 16, rx: 3, fill: col, opacity: fade(u, 1.2 + i * 0.3) }); tx(x0 + 26 + i * 270, 264, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.2 + i * 0.3) }); });
      sub(480, 330, 'SEQ_CLS 는 pre_classifier · classifier 도 함께 학습한다 · peft 0.22 실행값', fade(u, 2.0), { 'font-size': 14 });
      note(40, 390, '이 모델을 Step 4 의 루프나 Trainer 에 그대로 넣는다', fade(u, 2.3), { fill: ACC }); return; }
    if (k === 5) { ['모델 카드 — 학습 데이터·용도·한계', '라이선스 — apache/mit 인지, 연구 전용인지', '대형 모델이면 LoRA / PEFT', '캐시 — HF_HOME · delete-cache'].forEach((s, i) => { const y = 110 + i * 64;
        el('rect', { x: 150, y: y - 18, width: 30, height: 30, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 2 }); check(165, y - 3, 10, pop(u, 0.5 + i * 0.4)); tx(200, y + 4, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); });
      sub(480, 390, '라이선스는 코드가 아니라 문서에 있다 · cc-by-nc · research 표기를 놓치지 않는다', fade(u, 2.2), { 'font-size': 14.5, fill: BAD }); return; }
    ['서빙', '배포', '모니터링'].forEach((s, i) => card(250 + i * 230, 180, 190, 70, { rx: 12, text: s, fs: 18, stroke: ACC, color: ACC, s: pop(u, 0.4 + i * 0.3) }));
    banner(480, 310, '다음: Part Ⅴ · 프로덕션', pop(u, 1.4)); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'AutoModel.from_pretrained("bert-base-uncased") 가 돌려주는 것은 무엇인가?',
      o: ['Hugging Face 전용 객체라 PyTorch 메서드는 쓸 수 없다', 'torch.nn.Module 을 상속한 모델이라 .parameters() 와 .to() 가 그대로 된다', 'TensorFlow 모델을 감싼 래퍼다'], a: 1,
      why: 'isinstance(model, nn.Module) 이 True 다. 그래서 파라미터 109,482,240개를 세는 것도, .to(device)·.eval() 도 Part Ⅰ 그대로다.' },
    { q: 'pipeline("sentiment-analysis") 안에서 순서대로 도는 세 단계는 무엇인가?',
      o: ['다운로드 → 압축 해제 → 저장', 'softmax → forward → 토큰화', '토크나이저 전처리 → 모델 forward → softmax·argmax 후처리'], a: 2,
      why: '문장을 input_ids 로 바꾸고, 모델이 logits 를 내고, 후처리가 사람이 읽는 라벨과 점수로 되돌린다.' },
    { q: '수동으로 분해했을 때 out.logits 의 정체는 무엇인가?',
      o: ['모양이 [1, 2] 인 평범한 torch.Tensor', '라벨 문자열이 든 파이썬 리스트', 'Hugging Face 전용 확률 객체'], a: 0,
      why: '"I love PyTorch!" 의 logits 는 [−4.2110, 4.5178] 인 텐서다. softmax 를 걸면 POSITIVE 0.9998 이 되고 loss·backward 도 그대로 붙는다.' },
    { q: 'Hugging Face Trainer.train() 과 같은 위상의 도구는 무엇인가?',
      o: ['torch.no_grad()', 'Lightning 의 trainer.fit() 과 Keras 의 model.fit()', 'AutoTokenizer.from_pretrained()'], a: 1,
      why: '셋 다 반복되는 학습 루프를 프레임워크에 맡기는 도구다. 안에서는 결국 forward → loss → backward 가 돈다.' },
    { q: 'DistilBERT 분류 모델에 r=8 LoRA 를 씌운 뒤 학습 대상은 얼마나 되는가?',
      o: ['전체의 약 1.09% (739,586개)', '전체의 50%', '전체 그대로 100%'], a: 0,
      why: '어댑터 147,456개와 분류 헤드 592,130개만 학습하고 원본 66,955,010개는 얼린다. print_trainable_parameters() 로 확인한다.' },
  ];

  const summary = [
    'transformers 가 주는 모델은 nn.Module 이라 Part Ⅰ 에서 배운 메서드가 그대로 통한다.',
    'pipeline 은 토크나이저, 모델 forward, 후처리 세 단계를 한 줄로 묶은 것이다.',
    '손으로 분해하면 logits 는 평범한 텐서라 loss 와 backward 를 얹어 파인튜닝한다.',
    '배포 전에 모델 카드와 라이선스를 보고, 큰 모델은 LoRA 로 1% 남짓만 학습한다.',
  ];
  const review = [
    { q: '감정 분석 결과가 이상하게 나온다. 토크나이저는 distilbert, 모델은 bert-base 체크포인트로 불렀다. 먼저 고칠 것은?',
      o: ['softmax 대신 sigmoid 를 쓴다', '토크나이저와 모델을 같은 체크포인트 이름으로 맞춘다', 'model.eval() 을 지운다'], a: 1,
      why: '토큰 번호는 체크포인트마다 사전이 달라 섞으면 조용히 어긋난다. 같은 name 으로 둘 다 from_pretrained 한다.' },
    { q: '노트북 디스크가 갑자기 가득 찼다. Hugging Face 모델을 여러 개 받아 본 뒤다. 먼저 볼 곳은?',
      o: ['~/.cache/huggingface 캐시 폴더', 'model.config.id2label', 'DataLoader 의 batch_size'], a: 0,
      why: 'from_pretrained 로 받은 가중치는 기본 캐시에 쌓인다. HF_HOME 으로 위치를 옮기거나 delete-cache 로 정리한다.' },
    { q: '작은 GPU 로 큰 분류 모델을 파인튜닝하다 메모리가 부족했다. 학습 코드를 거의 그대로 두면서 쓸 방법은?',
      o: ['pipeline 으로 바꿔 학습한다', 'num_labels 를 1 로 줄인다', 'get_peft_model 로 LoRA 를 씌워 어댑터와 헤드만 학습한다'], a: 2,
      why: 'LoRA 는 원본을 얼리고 작은 행렬만 학습한다. 감싼 모델은 Step 4 의 루프나 Trainer 에 그대로 넣으면 된다.' },
  ];

  R.page({ title: 'Hugging Face 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
