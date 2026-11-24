/* IV-1-1 Android View 시스템 (XML + ViewBinding) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 대상: XML 도면, 폰 화면의 View 트리, 코드 쪽 참조 변수 칸, 생성된 Binding 클래스, 생명주기 시간축. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, person, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // XML(또는 코드) 문서: 머리줄에 파일 이름, 아래로 고정폭 줄. lines: 문자열 또는 [s, {col, strike, op, b}]
  function doc(x, y, w, h, name, lines, o) { o = o || {}; const op = o.op ?? 1, lh = o.lh || 24;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 2, opacity: op });
    el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    mono(x + 12, y + 20, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.nameCol || MUT, opacity: op });
    lines.forEach((ln, i) => { const [s, st] = Array.isArray(ln) ? ln : [ln, {}]; if (!s) return;
      mono(x + 14, y + 54 + i * lh, s, { 'font-size': o.fs || 14, fill: st.col || INK, 'font-weight': st.b ? 700 : 400, opacity: op * (st.op ?? 1), 'text-decoration': st.strike ? 'line-through' : null }); }); }
  // 폰 틀. 화면 안쪽 좌표를 돌려준다
  function phone(cx, cy, w, h, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 22, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5, opacity: op });
    el('line', { x1: cx - 18, y1: cy - h / 2 + 13, x2: cx + 18, y2: cy - h / 2 + 13, stroke: OFF, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: op });
    return { x0: cx - w / 2 + 10, y0: cy - h / 2 + 26, x1: cx + w / 2 - 10, y1: cy + h / 2 - 18 }; }
  // 참조 변수 칸: 위에 이름, 아래 값 상자(비면 점선)
  function slot(x, y, w, name, val, o) { o = o || {}; const op = o.op ?? 1, g = G(x + w / 2, y + 30, o.s ?? 1, op);
    tx(-w / 2, -14, name, { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: o.nameCol || INK, 'text-decoration': o.strike ? 'line-through' : null }, g);
    el('rect', { x: -w / 2, y: -4, width: w, height: 40, rx: 8, fill: val ? (o.fill || ACCBG) : PANEL, stroke: val ? (o.stroke || ACC) : (o.empty || WARN), 'stroke-width': 2, 'stroke-dasharray': val ? null : '6 5' }, g);
    tx(0, 21, val || o.emptyText || '비어 있음', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: val ? (o.color || ACC) : (o.empty || WARN), class: val ? 'mono' : null }, g); }
  // 작성 → 빌드 → 실행 세 정거장. marks: { build: 'ok'|'bad', run: 'ok'|'bad' } 와 각각의 등장 크기
  function track(x0, x1, y, o) { o = o || {}; const xs = [x0, (x0 + x1) / 2, x1], names = ['코드 작성', '빌드', '실행'];
    el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 3 });
    xs.forEach((x, i) => { el('circle', { cx: x, cy: y, r: 13, fill: PANEL, stroke: INK, 'stroke-width': 2 }); lbl(x, y - 24, names[i], 1, { 'font-size': 15 }); });
    if (o.build) (o.build === 'ok' ? check : cross)(xs[1], y, 7, o.bs ?? 1);
    if (o.run) (o.run === 'ok' ? check : cross)(xs[2], y, 7, o.rs ?? 1);
    return xs; }

  // ---------- 1. findViewById ----------
  const XML1 = ['<LinearLayout>', '  <TextView', ['    id="@+id/tv_title"/>', { col: ACC, b: true }], '  <Button', ['    id="@+id/btn_save"/>', { col: ACC, b: true }], '</LinearLayout>'];
  const PH = { cx: 480, cy: 190, w: 200, h: 300 }, TV = { cx: 480, cy: 124 }, BT = { cx: 480, cy: 196 };
  // 폰 화면 위 View 트리. o.build 0→1, o.hit: 'tv'|'btn' 찾는 중 강조, o.text: TextView 글자, o.ripple: 0→1 누름
  function viewTree(o) { const sc = phone(PH.cx, PH.cy, PH.w, PH.h);
    if (!(o.build > 0)) { sub(PH.cx, PH.cy, '아직 화면 없음', 1); return sc; }
    const b = o.build, a = clamp(b * 3);
    el('rect', { x: sc.x0 + 8, y: sc.y0 + 10, width: sc.x1 - sc.x0 - 16, height: sc.y1 - sc.y0 - 20, rx: 6, fill: 'none', stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: a });
    mono(sc.x0 + 14, sc.y1 - 18, 'LinearLayout', { 'font-size': 13.5, fill: MUT, opacity: a });
    const s1 = clamp(b * 3 - 1), s2 = clamp(b * 3 - 2);
    mono(TV.cx - 72, TV.cy - 28, 'tv_title', { 'font-size': 13.5, fill: MUT, opacity: s1 });
    card(TV.cx, TV.cy, 150, 40, { rx: 6, text: o.text || 'TextView', fs: o.text ? 16 : 14, mono: !o.text, color: o.text ? INK : MUT, stroke: o.hit === 'tv' ? INFO : INK, sw: o.hit === 'tv' ? 3 : 2, s: s1 });
    mono(BT.cx - 55, BT.cy - 28, 'btn_save', { 'font-size': 13.5, fill: MUT, opacity: s2 });
    card(BT.cx, BT.cy, 110, 40, { rx: 20, text: 'Button', fs: 14, mono: true, fill: ACCBG, stroke: o.hit === 'btn' ? INFO : ACC, color: ACC, sw: o.hit === 'btn' ? 3 : 2, s: s2 });
    if (o.ripple > 0 && o.ripple < 1) el('circle', { cx: BT.cx, cy: BT.cy, r: 10 + 34 * o.ripple, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: 1 - o.ripple });
    return sc; }
  function s1(t, c) { const { k, u } = c;
    if (k === 3) return s1cost(u);
    doc(30, 70, 250, 210, 'activity_main.xml', XML1);
    const built = k === 0 ? 0 : k === 1 ? E(u, 0.1, 0.6) : 1;
    const fTv = k === 1 ? seg(u, 1.1, 1.7) : k > 1 ? 1 : 0, fBt = k === 1 ? seg(u, 1.7, 2.3) : k > 1 ? 1 : 0;
    const hit = k === 1 ? (u > 0.6 && u < 1.2 ? 'tv' : u > 1.2 && u < 1.8 ? 'btn' : null) : null;
    viewTree({ build: built, hit, text: k === 2 && u > 1.1 ? '저장됨' : null, ripple: k === 2 ? seg(u, 0.3, 1.1) : 0 });
    // 참조 변수 칸
    slot(680, 78, 250, 'tvTitle : TextView', fTv >= 1 ? 'TextView 객체' : null, { s: k === 0 ? pop(u, 0.3) : 1 });
    slot(680, 178, 250, 'btnSave : Button', fBt >= 1 ? 'Button 객체' : null, { s: k === 0 ? pop(u, 0.6) : 1 });
    if (k === 0) { pill(800, 46, 'lateinit = 나중에 채운다는 약속', WARN, pop(u, 1.0), { fs: 13.5 });
      tx(330, 388, '채우기 전에 읽으면 UninitializedPropertyAccessException', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) }); return; }
    if (k === 1) { // 트리를 뒤져 찾고, 칸으로 옮긴다
      dot([[400, 78], [404, 124], [460, 124]], seg(u, 0.6, 1.15), INFO, 7);
      dot([[400, 78], [404, 124], [404, 196], [462, 196]], seg(u, 1.2, 1.75), INFO, 7);
      fly(TV.cx, TV.cy, 805, 122, fTv, 'TextView', { fill: INFO, mono: true });
      fly(BT.cx, BT.cy, 805, 222, fBt, 'Button', { fill: INFO, mono: true });
      mono(300, 372, 'tvTitle = findViewById(R.id.tv_title)', { 'font-size': 14.5, opacity: fade(u, 0.6) });
      mono(300, 398, 'btnSave = findViewById(R.id.btn_save)', { 'font-size': 14.5, opacity: fade(u, 1.2) });
      sub(805, 162, '찾은 View를 TextView로 캐스팅', fade(u, 1.8));
      sub(805, 262, '찾은 View를 Button으로 캐스팅', fade(u, 2.3));
      return; }
    // k 2: 리스너
    mono(40, 372, 'btnSave.setOnClickListener { tvTitle.text = "저장됨" }', { 'font-size': 14.5, opacity: fade(u, 0.2) });
    grow(680, 222, 545, 200, E(u, 0.2, 0.7), ACC);
    check(60, 398, 9, pop(u, 1.7)); tx(78, 404, '화면은 잘 돈다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) });
    tx(300, 404, '하지만 id와 타입은 아무도 확인하지 않았다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); }
  // 이 방식의 대가: 실패가 모두 실행 칸에 모인다
  function s1cost(u) {
    track(160, 800, 72, { build: 'ok', run: 'bad', bs: pop(u, 0.3), rs: pop(u, 0.6) });
    [['이 XML에서 id를 지움', '다른 XML에 남으면 빌드 통과, 실행 중 NPE', BAD],
     ['다른 타입으로 받음', '실행 순간 ClassCastException', BAD],
     ['화면 회전', 'Activity가 새로 만들어져 다시 찾는다', WARN],
     ['View가 늘어남', '변수 선언과 findViewById 줄도 같이 는다', WARN]].forEach(([a, b, col], i) => {
      const cx = i % 2 ? 710 : 250, cy = i < 2 ? 175 : 285, s = pop(u, 0.8 + i * 0.3);
      card(cx, cy, 420, 84, { rx: 10, stroke: col, sw: 2, s });
      tx(cx - 192, cy - 8, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.3) });
      tx(cx - 192, cy + 20, b, { 'font-size': 14.5, fill: col, 'font-weight': 600, opacity: fade(u, 0.9 + i * 0.3) }); });
    tx(480, 380, '컴파일러가 대신 막아 주는 것은 하나도 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ---------- 2. 도면이 바뀌면 코드가 깨진다 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { // id 한 글자 차이로 연결이 끊긴다
      person(110, 330, '디자이너', { s: pop(u, 0.1) }); person(850, 330, '개발자', { s: pop(u, 0.1) });
      const typed = 'tv_header'.slice(0, Math.round(9 * E(u, 0.9, 1.5)));
      doc(40, 70, 360, 170, 'activity_main.xml', ['<TextView', ['  android:id="@+id/tv_title"/>', { col: u > 0.5 ? OFF : ACC, b: true, strike: u > 0.5 }], ['  android:id="@+id/' + typed + (typed.length === 9 ? '"/>' : ''), { col: WARN, b: true, op: u > 0.9 ? 1 : 0 }]]);
      doc(560, 70, 360, 170, 'MainActivity.kt', ['', ['findViewById(R.id.tv_title)', { col: ACC, b: true }]]);
      const broken = u > 1.6;
      el('line', { x1: 400, y1: 148, x2: 560, y2: 148, stroke: broken ? BAD : ACC, 'stroke-width': 3, 'stroke-dasharray': broken ? '7 6' : null });
      if (broken) cross(480, 148, 11, pop(u, 1.6));
      tx(480, 290, '둘을 잇는 것은 문자열 id 하나뿐', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(480, 316, '코드는 그대로인데 도면만 달라졌다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { // 폰용 · 태블릿용 레이아웃
      doc(40, 40, 400, 110, 'layout/main.xml', [['@+id/tv_title', { col: GOOD, b: true }]]);
      doc(520, 40, 400, 110, 'layout-sw600dp/main.xml', [['@+id/tv_title  (삭제됨)', { col: OFF, strike: true }]]);
      pill(480, 190, 'R.id.tv_title은 폰 레이아웃에 남아 있다 → 빌드 통과', INFO, pop(u, 0.4), { fs: 14 });
      const p = phone(240, 300, 96, 150, { op: fade(u, 0.7) }); const tb = phone(720, 300, 230, 150, { op: fade(u, 0.7), stroke: u > 1.8 ? BAD : INK });
      check(240, 300, 14, pop(u, 1.1)); lbl(240, 400, '폰: 통과', fade(u, 1.1), { fill: GOOD });
      cross(720, 296, 16, pop(u, 1.8)); lbl(720, 400, '태블릿: NullPointerException', fade(u, 1.9), { fill: BAD });
      return; }
    if (k === 2) { // 타입이 어긋난다
      mono(480, 56, 'val view: ImageView = findViewById(R.id.btn_save)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      // 클래스 계보: View 아래 TextView·ImageView, TextView 아래 Button
      const nd = { View: [200, 120], TextView: [120, 200], ImageView: [290, 200], Button: [120, 280] };
      [['View', 'TextView'], ['View', 'ImageView'], ['TextView', 'Button']].forEach(([a, b]) => el('line', { x1: nd[a][0], y1: nd[a][1] + 16, x2: nd[b][0], y2: nd[b][1] - 16, stroke: GRID, 'stroke-width': 2 }));
      Object.entries(nd).forEach(([n, [x, y]]) => { const on = u > 1.9 && (n === 'Button' || n === 'TextView' || n === 'View');
        card(x, y, n === 'ImageView' ? 118 : 104, 32, { rx: 6, text: n, fs: 14, mono: true, stroke: n === 'ImageView' ? WARN : on ? INFO : INK, color: n === 'ImageView' ? WARN : INK, sw: on ? 2.8 : 1.8 }); });
      sub(200, 330, 'Button은 TextView 쪽 가지, ImageView가 아니다', fade(u, 2.0));
      // 받을 칸과 실제 객체
      el('rect', { x: 650, y: 160, width: 200, height: 110, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
      mono(750, 150, 'view : ImageView', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
      const fl = E(u, 0.4, 1.2), bx = u < 1.2 ? lerp(450, 750, fl) : lerp(750, 560, E(u, 1.2, 1.6));
      card(bx, 215, 130, 50, { rx: 25, text: 'Button 객체', fs: 15, fill: ACCBG, stroke: ACC, color: ACC });
      if (u > 1.3) { cross(750, 215, 14, pop(u, 1.3)); lbl(750, 300, 'ClassCastException', 1, { fill: BAD }); }
      track(560, 900, 380, { build: 'ok', run: u > 1.3 ? 'bad' : null, rs: pop(u, 1.3) });
      return; }
    // k 3: 필요한 장치
    tx(480, 70, '빌드 시점에 확인해 줄 장치가 필요하다', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.1) });
    ['id가 있는지 빌드에서 확인', '타입을 빌드에서 확정'].forEach((s, i) => { const y = 140 + i * 70, sc = pop(u, 0.4 + i * 0.4);
      card(300, y, 360, 54, { rx: 10, stroke: INFO, sw: 2, s: sc });
      el('rect', { x: 140, y: y - 13, width: 26, height: 26, rx: 5, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.4 + i * 0.4) });
      tx(182, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }); });
    grow(490, 175, 600, 175, E(u, 1.3, 1.7), ACC);
    pill(740, 140, 'ViewBinding · 다음 장면', ACC, pop(u, 1.7), { fs: 15 });
    pill(740, 210, 'Compose · XML 자체를 없앰', INFO, pop(u, 2.0), { fs: 15 });
    sub(480, 330, '동적 조회를 빌드가 만든 정적 프로퍼티로 바꾸는 방향', fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 3. ViewBinding ----------
  const XML3 = (k, u) => ['<LinearLayout>', '  <TextView', ['    id="@+id/tv_title"/>', { col: k === 4 && u > 0.4 ? OFF : ACC, b: true, strike: k === 4 && u > 0.4 }], '  <Button', ['    id="@+id/btn_save"/>', { col: ACC, b: true }]];
  const MEM = [['root : LinearLayout', 0], ['tvTitle : TextView', 2], ['btnSave : Button', 4]];   // [멤버, XML 줄]
  function bindCard(op, shown, o) { o = o || {};
    el('rect', { x: 350, y: 80, width: 280, height: 170, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: op });
    mono(364, 106, o.inst ? 'binding (인스턴스)' : 'class ActivityMainBinding', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op });
    MEM.forEach(([m], i) => { if (o.gone === i && o.goneU >= 1) return; const a = clamp(shown - i);
      mono(372, 150 + i * 36, m, { 'font-size': 14.5, 'font-weight': 600, opacity: op * a * (o.gone === i ? 1 - (o.goneU || 0) : 1), fill: o.gone === i ? BAD : INK, 'text-decoration': o.gone === i && o.goneU > 0 ? 'line-through' : null }); }); }
  function s3(t, c) { const { k, u } = c;
    doc(30, 80, 270, 170, 'activity_main.xml', XML3(k, u), { lh: 22 });
    if (k === 0) { // 설정 한 줄 → 빌드가 클래스를 만든다
      mono(30, 50, 'buildFeatures { viewBinding = true }', { 'font-size': 14.5, 'font-weight': 700 });
      const on = E(u, 0.2, 0.6); el('rect', { x: 370, y: 34, width: 48, height: 24, rx: 12, fill: on > 0.5 ? ACC : OFF });
      el('circle', { cx: 382 + 24 * on, cy: 46, r: 9, fill: PANEL });
      grow(300, 165, 346, 165, E(u, 0.7, 1.0), ACC); tx(323, 155, '빌드', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      const op = fade(u, 0.9, 0.3); bindCard(op, [0, 1, 2].filter((i) => u >= 1.6 + i * 0.4).length);
      MEM.forEach(([m, line], i) => fly(170, 134 + line * 22 - 4, 470, 146 + i * 36, seg(u, 1.1 + i * 0.4, 1.6 + i * 0.4), i ? m.split(' ')[0] : 'root', { mono: true }));
      tx(800, 150, 'tv_title → tvTitle', { 'text-anchor': 'middle', 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(800, 178, 'id가 camelCase 프로퍼티가 된다', fade(u, 1.9), { 'font-size': 14.5 });
      sub(480, 320, '레이아웃 파일 하나마다 Binding 클래스 하나가 빌드 때 생긴다', fade(u, 2.2), { 'font-size': 15 }); return; }
    bindCard(1, 3, { inst: k >= 2, gone: k === 4 ? 1 : null, goneU: k === 4 ? seg(u, 0.8, 1.3) : 0 });
    if (k === 1) { // View 별 변수 두 개 → binding 하나
      const f = E(u, 0.3, 1.0);
      slot(680, 70, 250, 'tvTitle : TextView', null, { op: 1 - 0.7 * f, strike: f > 0.5, empty: OFF, emptyText: '필요 없음' });
      slot(680, 160, 250, 'btnSave : Button', null, { op: 1 - 0.7 * f, strike: f > 0.5, empty: OFF, emptyText: '필요 없음' });
      slot(365, 290, 250, 'binding : ActivityMainBinding', null, { s: pop(u, 1.1), emptyText: '아직 빔' });
      mono(805, 300, `참조 변수 ${u > 1.6 ? 1 : 2}개`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: u > 1.6 ? ACC : INK });
      sub(805, 328, 'findViewById 호출 0회', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k ≥ 2: 폰 화면과 연결
    const sc = phone(800, 205, 190, 270); const b = k === 2 ? E(u, 0.2, 0.8) : 1;
    el('rect', { x: sc.x0 + 6, y: sc.y0 + 8, width: sc.x1 - sc.x0 - 12, height: sc.y1 - sc.y0 - 16, rx: 6, fill: 'none', stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: b });
    const txt = k >= 3 && (k === 4 || u > 1.6) ? 'Welcome' : null;
    card(800, 128, 150, 40, { rx: 6, text: txt || 'TextView', fs: txt ? 16 : 14, mono: !txt, color: txt ? INK : MUT, s: clamp(b * 2 - 0.4), stroke: k === 4 && u > 1.3 ? BAD : INK });
    card(800, 200, 110, 40, { rx: 20, text: 'Button', fs: 14, mono: true, fill: ACCBG, stroke: ACC, color: ACC, s: clamp(b * 2 - 1) });
    const link = k === 2 ? E(u, 0.9, 1.6) : 1, gone = k === 4 && u > 1.0;
    grow(540, 182, 722, 128, gone ? 0 : link, ACC, { plain: true, op: 0.8 });
    grow(540, 218, 742, 200, link, ACC, { plain: true, op: 0.8 });
    grow(545, 146, 715, 100, link, MUT, { plain: true, dash: '4 4' });
    if (k === 2) { pill(165, 300, 'inflate(layoutInflater)', ACC, pop(u, 0.2), { fs: 13.5, mono: true });
      mono(40, 370, 'setContentView(binding.root)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      sub(560, 370, '이 순간 binding의 프로퍼티가 실제 View를 가리킨다', fade(u, 1.7), { 'font-size': 14.5 }); return; }
    if (k === 3) { // 자동 완성으로 쓴다
      const typed = 'binding.'; mono(40, 300, typed, { 'font-size': 16, 'font-weight': 700 });
      const pop1 = fade(u, 0.3) * (1 - fade(u, 1.2));
      if (pop1 > 0) { el('rect', { x: 40, y: 310, width: 230, height: 88, rx: 6, fill: PANEL, stroke: INFO, 'stroke-width': 1.8, opacity: pop1 });
        MEM.forEach(([m], i) => { if (i === 1) el('rect', { x: 44, y: 314 + i * 28, width: 222, height: 26, rx: 4, fill: INFOBG, opacity: pop1 });
          mono(54, 333 + i * 28, m, { 'font-size': 14, opacity: pop1 }); }); }
      if (u > 1.2) mono(40 + tw(typed, 16), 300, 'tvTitle.text = "Welcome"'.slice(0, Math.round(24 * E(u, 1.2, 1.6))), { 'font-size': 16, 'font-weight': 700, fill: ACC });
      pill(420, 360, '캐스팅 0', GOOD, pop(u, 1.8), { fs: 14 }); pill(540, 360, 'null 검사 0', GOOD, pop(u, 2.0), { fs: 14 }); return; }
    // k 4: id 를 지우면 빌드가 막는다
    mono(40, 300, 'binding.tvTitle.text = "Welcome"', { 'font-size': 16, 'font-weight': 700, fill: u > 1.3 ? BAD : INK });
    if (u > 1.3) { el('path', { d: 'M117,306 q4,5 8,0 t8,0 t8,0 t8,0 t8,0 t8,0 t8,0 t8,0', fill: 'none', stroke: BAD, 'stroke-width': 2 });
      mono(40, 330, 'Unresolved reference: tvTitle', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); }
    // 실패를 만나는 곳: 실행 → 빌드
    const xs = track(80, 520, 395, {}); const m = lerp(xs[2], xs[1], E(u, 1.6, 2.4));
    el('circle', { cx: m, cy: 395, r: 9, fill: BAD });
    tx(600, 400, '실패 시점: 실행 → 빌드', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }

  // ---------- 4·5. 생명주기 시간축 ----------
  function evts(list, y, hot) { list.forEach(([n, x]) => { const h = hot && hot.includes(n + x);
    el('line', { x1: x, y1: y + 8, x2: x, y2: 282, stroke: h ? ACC : GRID, 'stroke-width': h ? 2 : 1, 'stroke-dasharray': '3 4' });
    mono(x, y, n, { 'font-size': 13.5, 'text-anchor': 'middle', fill: h ? ACC : MUT, 'font-weight': h ? 800 : 500 }); }); }
  // 가로 막대: x0→x1 을 u 만큼, 안에 이름
  function bar(x0, x1, y, u, name, o) { o = o || {}; if (u <= 0) return; const w = (x1 - x0) * clamp(u);
    el('rect', { x: x0, y: y - 12, width: w, height: 24, rx: 6, fill: o.fill || SOFT, stroke: o.stroke || INK, 'stroke-width': 1.8, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (name && u > 0.6) tx(x0 + 10, y + 5, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.color || INK, opacity: (o.op ?? 1) * fade(u, 0.6, 0.3) }); }
  const LC = [['onCreate', 90], ['onStart', 175], ['onResume', 260], ['onPause', 385], ['onStop', 470], ['onDestroy', 555], ['onCreate', 665], ['onStart', 750], ['onResume', 835]];
  function s4(t, c) { const { k, u } = c;
    evts(LC, 50, k === 1 ? ['onCreate90', 'onCreate665'] : k === 2 ? ['onStart175', 'onStop470', 'onStart750', 'onDestroy555'] : null);
    el('line', { x1: 610, y1: 30, x2: 610, y2: 282, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    tx(610, 24, '화면 회전', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
    const A = k === 0 ? E(u, 0.2, 0.8) : 1;
    bar(90, 555, 100, A, 'Activity #1'); bar(665, 920, 100, A, 'Activity #2');
    const Bn = k === 0 ? E(u, 1.5, 2.1) : 1;
    bar(90, 555, 140, Bn, 'binding #1', { fill: WARNBG, stroke: WARN }); bar(665, 920, 140, Bn, 'binding #2', { fill: WARNBG, stroke: WARN });
    const V = k === 0 ? E(u, 0.9, 1.7) : 1, vEnd = k === 5 ? 900 : 920;
    bar(90, vEnd, 262, V, 'viewModel · 회전에도 같은 인스턴스', { fill: GOODBG, stroke: GOOD, color: GOOD });
    if (k >= 2) { const g1 = k === 2 ? E(u, 0.2, 0.9) : 1, g2 = k === 2 ? E(u, 1.4, 1.9) : 1, ls = k === 2 ? E(u, 0.2, 1.1) : 1;
      bar(175, 470, 180, g1, 'collect', { fill: ACCBG, stroke: ACC, color: ACC }); bar(750, 920, 180, g2, 'collect', { fill: ACCBG, stroke: ACC, color: ACC });
      bar(90, 555, 220, ls, 'lifecycleScope', { fill: PANEL, stroke: MUT, color: MUT }); bar(665, 920, 220, g2, 'lifecycleScope', { fill: PANEL, stroke: MUT, color: MUT });
      if (k === 2) { cross(470, 180, 8, pop(u, 1.0)); cross(555, 220, 8, pop(u, 1.2)); } }
    if (k === 0) { pill(300, 340, 'viewModel: 회전에도 유지', GOOD, pop(u, 1.9), { fs: 14.5 }); pill(640, 340, 'binding: 화면마다 새로 만든다', WARN, pop(u, 2.2), { fs: 14.5 }); return; }
    if (k === 1) { [['XML', 120], ['View 트리', 360], ['화면', 600]].forEach(([n, x], i) => card(x, 345, 130, 46, { rx: 8, text: n, fs: 15, s: pop(u, 0.3 + i * 0.4) }));
      grow(186, 345, 294, 345, E(u, 0.6, 0.9), ACC); mono(240, 330, 'inflate', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
      grow(426, 345, 534, 345, E(u, 1.0, 1.3), ACC); mono(480, 330, 'setContentView', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      tx(700, 350, 'onCreate 한 번 = 초기화 한 번', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { tx(60, 330, 'repeatOnLifecycle(STARTED): onStop에서 블록 취소, onStart에서 다시 시작', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      tx(60, 362, 'lifecycleScope: onDestroy에서 코루틴 자동 취소', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { // 시간이 흐르며 collect 구간에서만 값이 흐른다
      const x = lerp(90, 920, E(u, 0.2, 2.6)); el('line', { x1: x, y1: 36, x2: x, y2: 282, stroke: INFO, 'stroke-width': 2.5 });
      const live = (x >= 175 && x <= 470) || x >= 750;
      card(170, 352, 230, 60, { rx: 10, fill: GOODBG, stroke: GOOD, text: 'viewModel.state', fs: 15, mono: true, color: GOOD });
      card(760, 352, 280, 60, { rx: 10, stroke: live ? ACC : GRID, text: 'binding.tvTitle = "로딩"', fs: 15, mono: true });
      if (live) for (let i = 0; i < 4; i++) dot([[290, 352], [615, 352]], (t * 0.9 + i / 4) % 1, ACC, 5);
      else tx(452, 340, x > 470 && x < 750 ? '수집 멈춤' : '아직 수집 전', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN });
      return; }
    if (k === 4) { // 쓰기 창구와 읽기 창구
      zone(250, 300, 420, 112, 'MainViewModel', { fill: GOODBG });
      card(370, 365, 200, 46, { rx: 8, text: '_state (쓰기)', fs: 14.5, mono: true, stroke: GOOD, s: pop(u, 0.2) });
      card(590, 365, 130, 46, { rx: 8, text: 'state', fs: 14.5, mono: true, stroke: GOOD, s: pop(u, 0.5) });
      grow(470, 365, 523, 365, E(u, 0.7, 1.0), GOOD); sub(497, 334, 'asStateFlow', fade(u, 0.9));
      card(840, 365, 150, 46, { rx: 8, text: 'Activity', fs: 15, s: pop(u, 0.9) });
      grow(655, 355, 764, 355, E(u, 1.1, 1.4), ACC); sub(712, 343, '읽기', fade(u, 1.3));
      grow(764, 400, 472, 400, E(u, 1.6, 2.2) * 0.62, BAD, { dash: '6 5', plain: true }); if (u > 2.2) cross(590, 400, 9, pop(u, 2.2));
      sub(110, 340, '초기값', fade(u, 0.3)); mono(110, 365, 'UiState("로딩")', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); return; }
    // k 5: viewModelScope 코루틴과 onCleared
    const x = lerp(380, 900, E(u, 0.3, 1.8));
    if (u < 2.0) pill(x, 262, 'fetch()', ACC, 1, { fs: 13.5, mono: true, fill: PANEL }); else cross(900, 262, 11, pop(u, 2.0));
    mono(60, 340, 'viewModelScope.launch { _state.value = fetch() }', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
    tx(60, 378, 'Activity를 완전히 닫으면 onCleared → 진행 중이던 코루틴도 취소', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }

  const FC = [['onCreate', 80], ['onCreateView', 180], ['onViewCreated', 290], ['onDestroyView', 500], ['onCreateView', 680], ['onViewCreated', 790]];
  function s5(t, c) { const { k, u } = c;
    el('rect', { x: 500, y: 76, width: 180, height: 200, fill: WARNBG, opacity: 0.7 });
    tx(590, 268, '백스택', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN });
    evts(FC, 50, k === 1 ? ['onCreateView180'] : k === 4 ? ['onDestroyView500'] : k === 2 ? ['onViewCreated290', 'onViewCreated790'] : null);
    bar(80, 920, 100, k === 0 ? E(u, 0.2, 0.9) : 1, 'Fragment 인스턴스 · 생명주기 1', { fill: GOODBG, stroke: GOOD, color: GOOD });
    if (k >= 1) { const v1 = k === 1 ? E(u, 0.2, 1.0) : 1; bar(180, 500, 145, v1, 'view #1 · 생명주기 2', { fill: WARNBG, stroke: WARN });
      if (k >= 2) bar(680, 920, 145, 1, 'view #2', { fill: WARNBG, stroke: WARN }); }
    if (k >= 2) { const g = k === 2 ? E(u, 0.2, 0.9) : 1, g2 = k === 2 ? E(u, 1.0, 1.4) : 1, bd = k === 2 ? E(u, 1.4, 2.2) : 1;
      bar(300, 490, 190, g, 'viewLifecycleOwner', { fill: ACCBG, stroke: ACC, color: ACC }); bar(800, 920, 190, g2, '', { fill: ACCBG, stroke: ACC });
      bar(300, 920, 232, bd, 'Fragment 기준 수집 · view가 없어도 살아 있다', { fill: BADBG, stroke: BAD, color: BAD, dash: '6 4' });
      if (k === 2) { check(470, 190, 7, pop(u, 1.0)); bar(800, 920, 262, E(u, 2.0, 2.5), '두 번째 수집', { fill: BADBG, stroke: BAD, color: BAD, dash: '6 4' }); } }
    // 아래: _binding 칸과 view 트리
    const filled = k === 1 ? u > 1.2 : k === 2 || k === 3 || (k === 4 && u < 0.8);
    slot(60, 300, 290, '_binding : FragmentProfileBinding?', filled ? 'binding 객체' : null, { empty: k === 4 ? GOOD : WARN, emptyText: 'null' });
    if (k === 0) { mono(400, 334, 'binding get() = _binding!!', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      grow(400, 352, 360, 352, E(u, 1.0, 1.3), BAD);
      tx(400, 384, '지금 읽으면 NullPointerException', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); return; }
    const treeOp = k === 4 ? 1 - 0.6 * E(u, 1.2, 1.8) : k === 1 ? fade(u, 0.6) : 1;
    card(720, 355, 260, 62, { rx: 10, text: 'view 트리\nbinding.tvName', fs: 14.5, stroke: k === 4 && u > 1.2 ? OFF : INK, color: k === 4 && u > 1.2 ? MUT : INK, op: treeOp });
    const linkU = k === 1 ? E(u, 1.2, 1.8) : k === 4 ? (u < 0.8 ? 1 : 0) : 1;
    grow(350, 352, 588, 352, linkU, ACC, { plain: true });
    if (k === 1) pill(470, 318, 'return binding.root', ACC, pop(u, 1.8), { fs: 13.5, mono: true });
    if (k === 3) { for (let i = 0; i < 3; i++) dot([[460, 300], [600, 330]], (t * 0.9 + i / 3) % 1, ACC, 5);
      pill(400, 290, 'viewModel.state', GOOD, 1, { fs: 13.5, mono: true }); mono(720, 404, 'tvName.text ← it.name', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC }); }
    if (k === 4) { if (u > 0.8) cross(470, 352, 10, pop(u, 0.8));
      mono(400, 404, '_binding = null', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) });
      tx(720, 404, '사라진 트리를 아무도 붙잡지 않는다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) }); } }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'findViewById로 찾는 View의 id가 이 화면의 XML에서만 지워지고 다른 XML에는 남아 있다. 문제는 언제 드러나는가?',
      o: ['빌드할 때 컴파일 에러로', '앱을 실행해 그 화면을 열 때 NPE로', 'XML을 저장하는 순간 IDE 경고로'], a: 1,
      why: 'R.id는 모든 레이아웃이 함께 쓰므로 다른 XML에 id가 남아 있으면 빌드는 통과한다. findViewById가 실행 중에 null을 돌려줄 때 비로소 터진다.' },
    { q: 'btn_save(Button)를 val view: ImageView = findViewById(R.id.btn_save)로 받으면 어떻게 되는가?',
      o: ['컴파일 에러로 빌드가 멈춘다', 'Button이 ImageView로 자동 변환된다', '빌드는 되고 실행 순간 ClassCastException이 난다'], a: 2,
      why: 'findViewById는 받는 쪽 타입으로 캐스팅만 할 뿐 검사는 실행 중에 한다. Button은 ImageView의 하위 타입이 아니라서 캐스팅에서 죽는다.' },
    { q: 'ViewBinding을 켠 뒤 XML에서 tv_title id를 지우면 어떻게 되는가?',
      o: ['binding.tvTitle이 사라져 컴파일 에러가 난다', 'binding.tvTitle이 null을 돌려준다', '실행 중에 ClassCastException이 난다'], a: 0,
      why: 'Binding 클래스는 빌드 때 XML에서 만들어진다. id가 없으면 프로퍼티도 생기지 않아 그 줄이 Unresolved reference가 된다.' },
    { q: 'repeatOnLifecycle(STARTED) 안의 collect는 onStop이 오면 어떻게 되는가?',
      o: ['onDestroy까지 계속 돈다', '그 자리에서 멈췄다가 같은 코루틴이 이어서 돈다', '블록이 취소되고 onStart에서 다시 시작된다'], a: 2,
      why: 'repeatOnLifecycle은 상태가 STARTED 아래로 내려가면 블록을 취소하고, 다시 STARTED가 되면 블록을 새로 실행한다.' },
    { q: 'Fragment의 onDestroyView에서 _binding = null을 하는 이유는 무엇인가?',
      o: ['Fragment 인스턴스를 메모리에서 지우려고', '사라진 view 트리를 Fragment가 붙잡지 않게 하려고', '다음 onCreateView를 빠르게 하려고'], a: 1,
      why: 'Fragment는 백스택에서 view 없이 살아 있는 구간이 있다. 참조를 끊지 않으면 이미 사라진 view 트리가 메모리에 남는다.' },
  ];

  const summary = [
    'findViewById는 실행 중에 트리를 뒤져 View를 찾아서, id와 타입 실수가 실행해야 보인다.',
    '태블릿 레이아웃에만 id가 빠지거나 Button을 ImageView로 받아도 빌드는 그대로 통과한다.',
    'ViewBinding은 XML마다 Binding 클래스를 만들어 id와 타입을 빌드 때 확인하게 해 준다.',
    '수집은 repeatOnLifecycle(STARTED)로 묶고, Fragment는 onDestroyView에서 binding을 비운다.',
  ];
  const review = [
    { q: '폰에서는 멀쩡한데 태블릿에서만 화면을 열면 앱이 죽는다는 신고가 왔다. 먼저 의심할 것은?',
      o: ['layout-sw600dp XML에 그 id가 빠졌다', '태블릿의 메모리가 부족하다', 'ViewBinding을 켜서 생긴 문제다'], a: 0,
      why: '폰 레이아웃에 id가 남아 있으면 R.id가 있어 빌드는 통과한다. 태블릿용 XML에만 없으면 그 기기에서 findViewById가 null을 돌려준다.' },
    { q: 'Fragment를 백스택에 넣었다 돌아왔더니 값이 두 번씩 반영되고 가끔 binding 접근에서 죽는다. 고칠 곳은?',
      o: ['ViewModel을 화면마다 새로 만든다', 'Fragment의 lifecycleScope 대신 viewLifecycleOwner 기준으로 수집한다', 'binding을 onCreate에서 만든다'], a: 1,
      why: 'Fragment 기준 코루틴은 view가 사라진 뒤에도 살아 있어 돌아올 때 수집이 하나 더 붙는다. view 수명에 묶으면 onDestroyView에서 함께 끝난다.' },
    { q: '화면을 돌리면 불러온 목록이 사라져 다시 받아 온다. 목록을 어디에 두어야 하나?',
      o: ['binding 안의 TextView', 'Activity의 lateinit 변수', 'by viewModels()로 받은 ViewModel'], a: 2,
      why: '회전하면 Activity와 binding은 새로 만들어지지만 ViewModel은 같은 인스턴스가 돌아온다. 데이터를 ViewModel에 두면 다시 받을 필요가 없다.' },
  ];

  R.page({ title: 'XML 도면 · View 트리 · 생명주기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
