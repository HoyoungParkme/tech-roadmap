/* IV-2-1 Room + 코루틴/Flow — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 대상: tasks 테이블(행·열), 데이터 클래스와 컬럼의 짝, 메인/백그라운드 스레드 줄, Flow 가 흘려보내는 리스트 묶음,
 * ViewModel 의 StateFlow 상자, Compose 목록. 행 데이터는 페이지 STEPS 의 rows · emit · ui · pitfalls 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // tasks 테이블. o.cols(보이는 열 수, 소수면 마지막 열이 자라는 중), o.due(due 열 0→1), o.hot(id), o.slide(id, 0→1)
  const CW = [64, 170, 86, 90], HEAD = ['id', 'title', 'done', 'due'];
  function table(x, y, rows, o) { o = o || {}; const cols = o.cols ?? 3, rh = 32, op = o.op ?? 1;
    const ncol = Math.ceil(cols) + (o.due > 0 ? 1 : 0), w = CW.slice(0, ncol).reduce((a, b) => a + b, 0) * (o.due > 0 ? 1 : 1);
    tx(x, y - 10, o.title || 'tasks', { 'font-size': 14.5, 'font-weight': 800, class: 'mono', opacity: op });
    let cx = x;
    for (let j = 0; j < ncol; j++) { const isDue = j === 3, g = isDue ? o.due : clamp(cols - j), cw = CW[j] * g; if (g <= 0) continue;
      el('rect', { x: cx, y, width: cw, height: 32, fill: isDue ? WARNBG : INFOBG, stroke: isDue ? WARN : INFO, 'stroke-width': 1.5, opacity: op });
      if (g > 0.7) mono(cx + 8, y + 21, HEAD[j] + (j === 0 ? ' 🔑' : ''), { 'font-size': 14, 'font-weight': 700, fill: isDue ? WARN : INFO, opacity: op });
      cx += cw; }
    const tw0 = cx - x;
    rows.forEach((r, i) => { const yy = y + 32 + i * rh, sl = o.slide === r.id ? (o.slideU ?? 1) : 1; if (sl <= 0) return;
      const dx = (1 - E(sl, 0, 1)) * 120, hot = o.hot === r.id;
      el('rect', { x: x + dx, y: yy, width: tw0, height: rh, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2 : 1, opacity: op * clamp(sl * 1.5) });
      const vals = [String(r.id), r.title, r.done ? 'true' : 'false', 'NULL'];
      let xx = x + dx; for (let j = 0; j < ncol; j++) { const g = j === 3 ? o.due : clamp(cols - j); if (g <= 0) continue;
        if (g > 0.7) tx(xx + 8, yy + 21, vals[j], { 'font-size': 14, class: j === 1 ? null : 'mono', fill: j === 3 ? MUT : INK, opacity: op * clamp(sl * 1.5) });
        xx += CW[j] * g; } });
    return { w: tw0, h: 32 + rows.length * rh }; }
  // 코드 카드: 줄 배열, 강조 줄 번호
  function codeCard(x, y, w, lines, o) { o = o || {}; const lh = 22, h = lines.length * lh + 18, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': 1.8, opacity: op });
    lines.forEach((s, i) => mono(x + 12, y + 26 + i * lh, s, { 'font-size': 14, fill: (o.hi || []).includes(i) ? ACC : s.trim().startsWith('@') ? INFO : INK, 'font-weight': (o.hi || []).includes(i) ? 700 : 400, opacity: op }));
    return h; }
  // 스레드 줄: 메인은 프레임 눈금이 계속 지나간다(멈추면 blocked)
  function lanes(t, y1, y2, o) { o = o || {};
    [['Main', y1, INK], ['IO (Room 백그라운드)', y2, INFO]].forEach(([n, y, col]) => {
      el('line', { x1: 200, y1: y, x2: 920, y2: y, stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round' });
      tx(40, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, fill: col }); });
    for (let i = 0; i < 12; i++) { const x = 200 + ((i * 60 + (o.blocked ? 0 : t * 70)) % 720);
      el('rect', { x: x - 2, y: y1 - 9, width: 4, height: 18, rx: 2, fill: o.blocked ? BAD : GOOD, opacity: 0.8 }); }
    if (o.note !== false) tx(920, y1 - 16, o.blocked ? '화면이 멈췄다' : '화면은 계속 그려진다', { 'font-size': 13.5, 'font-weight': 700, fill: o.blocked ? BAD : GOOD, 'text-anchor': 'end' }); }
  const rowsOf = (c) => c.beat.rows || [];

  // ---------- 1. @Entity · @Dao · @Database ----------
  function s1(t, c) { const { k, u } = c, rows = rowsOf(c);
    if (k <= 1) {
      codeCard(30, 60, 400, ['@Entity(tableName = "tasks")', 'data class Task(', '  @PrimaryKey(autoGenerate = true)', '  val id: Long = 0,', '  val title: String,', '  val done: Boolean = false,', ')'], { hi: k === 0 ? [0, 2, 3] : [4, 5] });
      const cols = k === 0 ? E(u, 0.4, 1.2) : 1 + E(u, 0.3, 1.6) * 2;
      table(500, 110, [], { cols });
      if (k === 0) { grow(430, 80, 496, 112, E(u, 0.2, 0.5), ACC); sub(560, 172, '자동 증가 기본키', fade(u, 1.4), { 'font-size': 14.5 });
        tx(480, 330, 'CREATE TABLE을 손으로 쓰지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
      [['Long', 'INTEGER'], ['String', 'TEXT'], ['Boolean', 'INTEGER (0/1)']].forEach(([a, b], i) => { const y = 220 + i * 44, s = pop(u, 0.8 + i * 0.35);
        pill(560, y, a, INFO, s, { mono: true, fs: 14 }); grow(610, y, 660, y, E(u, 0.9 + i * 0.35, 1.2 + i * 0.35), MUT); pill(730, y, b, ACC, s, { mono: true, fs: 14 }); });
      tx(480, 390, '프로퍼티 하나 = 컬럼 하나', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    table(520, 80, rows, { cols: 3 });
    if (k === 2) { // SQL 을 빌드 때 검사한다
      codeCard(30, 60, 420, ['@Dao', 'interface TaskDao {', '  @Query("SELECT * FROM tasks', '         ORDER BY id")', '  fun observeAll(): List<Task>', '}'], { hi: [2, 3] });
      const scan = E(u, 0.3, 1.3); el('rect', { x: 140, y: 112, width: 300 * scan, height: 50, fill: INFO, opacity: 0.12 });
      grow(408, 126, 520, 72, E(u, 0.9, 1.3), INFO, { dash: '5 4' }); grow(250, 148, 530, 100, E(u, 1.1, 1.5), INFO, { dash: '5 4' });
      check(592, 66, 8, pop(u, 1.4));
      pill(240, 250, '빌드가 SQL을 파싱해 테이블·컬럼을 맞춰 본다', INFO, pop(u, 1.6), { fs: 14 });
      mono(40, 310, 'ORDER BY titel', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      tx(200, 310, '예: 컬럼 이름 오타는 빌드 에러로 멈춘다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    // k 3: @Database 진입점
    zone(30, 60, 440, 290, '', { fill: ACCBG, stroke: ACC, op: fade(u, 0.1) });
    mono(48, 92, '@Database(entities = [Task::class],', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
    mono(48, 116, '          version = 1)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
    mono(48, 146, 'abstract class AppDb : RoomDatabase()', { 'font-size': 14, opacity: fade(u, 0.3) });
    card(150, 220, 170, 56, { rx: 8, text: 'entity: Task', fs: 15, mono: true, s: pop(u, 0.6) });
    card(350, 220, 150, 56, { rx: 8, text: 'v1', fs: 22, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.9) });
    card(250, 305, 240, 50, { rx: 25, text: 'taskDao() → TaskDao', fs: 15, mono: true, fill: PANEL, stroke: ACC, color: ACC, s: pop(u, 1.3) });
    grow(470, 305, 516, 250, E(u, 1.6, 2.0), ACC);
    tx(520, 370, 'version은 스키마 번호, 나중에 Migration과 짝을 이룬다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) }); }

  // ---------- 2. suspend DAO ----------
  function hop(x0, x1, y1, y2, u, text, col, stay) { if (u <= 0 || (u >= 1 && !stay)) return; // 메인 → IO 로 건너가 달린다
    const a = clamp(u / 0.35), b = clamp((u - 0.35) / 0.65), x = u < 0.35 ? x0 : lerp(x0, x1, b), y = u < 0.35 ? lerp(y1, y2, E(a, 0, 1)) : y2;
    pill(x, y, text, col || ACC, 1, { mono: true, fs: 13.5, fill: PANEL }); }
  function s2(t, c) { const { k, u } = c, rows = rowsOf(c);
    lanes(t, 70, 150);
    if (k === 0) { hop(300, 640, 70, 150, seg(u, 0.4, 2.2), 'suspend insert(task)', ACC, true);
      mono(40, 250, '@Insert', { 'font-size': 15, fill: INFO, 'font-weight': 700 }); mono(40, 276, 'suspend fun insert(task: Task): Long', { 'font-size': 15, 'font-weight': 700 });
      tx(40, 330, 'Room이 이 호출을 백그라운드 스레드로 옮겨 실행한다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) });
      table(560, 230, rows, { op: 0.9 }); return; }
    if (k === 1) { mono(40, 236, '@Query("SELECT * FROM tasks WHERE id = :id")', { 'font-size': 15, 'font-weight': 700 });
      mono(40, 264, 'suspend fun findById(id: Long): Task?', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 40 + tw('@Query("SELECT * FROM tasks WHERE id = ', 15) - 2, y: 220, width: tw(':id', 15) + 4, height: 22, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.3) });
      el('path', { d: `M${40 + tw('suspend fun findById(', 15) + 10},${270} C${300},${300} ${430},${290} ${40 + tw('@Query("SELECT * FROM tasks WHERE id = ', 15) + 12},${244}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.7) });
      tx(260, 310, '이름으로 묶인다', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      pill(220, 365, '있으면 Task', GOOD, pop(u, 1.5), { fs: 14.5 }); pill(400, 365, '없으면 null', WARN, pop(u, 1.8), { fs: 14.5, mono: false });
      sub(310, 405, '반환 타입이 Task?인 이유', fade(u, 2.1), { 'font-size': 14 });
      table(600, 230, rows, { op: 0.9 }); return; }
    if (k === 2) { hop(300, 600, 70, 150, seg(u, 0.2, 1.4), 'insert(배포 점검)');
      table(560, 230, rows, { slide: 3, slideU: seg(u, 1.3, 2.0), hot: u > 2.0 ? 3 : null });
      if (u > 1.9) fly(620, 150, 380, 70, seg(u, 1.9, 2.6), 'newId = 3', { mono: true, fill: GOOD });
      mono(40, 250, 'viewModelScope.launch {', { 'font-size': 15, 'font-weight': 700 });
      mono(40, 276, '  val newId = dao.insert(Task(title = "배포 점검"))', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      return; }
    // k 3: 앞 줄이 끝난 뒤 다음 줄
    hop(300, 600, 70, 150, seg(u, 0.2, 1.3), 'findById(3)', INFO);
    table(560, 230, rows, { hot: u > 1.3 ? 3 : null });
    if (u > 1.4) fly(640, 150, 380, 70, seg(u, 1.4, 2.2), 'Task(3, 배포 점검)', { mono: true, fill: GOOD });
    [['① insert', 0.2], ['② findById', 1.0]].forEach(([s, d], i) => pill(110 + i * 170, 260, s, i ? INFO : ACC, pop(u, d), { fs: 14.5, mono: true }));
    grow(170, 260, 210, 260, E(u, 0.8, 1.0), MUT);
    tx(40, 320, '순차 코드처럼 읽히지만', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    tx(40, 346, '기다리는 동안 메인 스레드는 자유롭다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); }

  // ---------- 3. Flow 쿼리: 바뀌면 새 리스트를 흘려보낸다 ----------
  function packet(x, y, n, col) { el('rect', { x: x - 34, y: y - 12 - n * 5, width: 68, height: 24 + n * 10, rx: 6, fill: PANEL, stroke: col || ACC, 'stroke-width': 2 });
    for (let i = 0; i < n; i++) el('rect', { x: x - 24, y: y - 6 - n * 5 + i * 10, width: 48, height: 6, rx: 2, fill: col || ACC, opacity: 0.7 });
    mono(x, y + 26 + n * 5, `List(${n})`, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col || ACC }); }
  function screenList(cx, n, o) { o = o || {}; card(cx, 140, 130, 190, { rx: 16, stroke: INK, sw: 2.2 }); tx(cx, 34, o.name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    for (let i = 0; i < n; i++) el('rect', { x: cx - 48, y: 64 + i * 32, width: 96, height: 24, rx: 5, fill: o.fresh && i === n - 1 ? ACCBG : SOFT, stroke: o.fresh && i === n - 1 ? ACC : 'none' });
    mono(cx, 222, `${n}건`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: o.fresh ? ACC : INK }); }
  function s3(t, c) { const { k, u } = c, rows = rowsOf(c), em = c.beat.emit || { count: 0 }, pe = (c.prev && c.prev.emit) || em;
    table(40, 90, rows, { slide: k === 2 ? 4 : null, slideU: seg(u, 0.3, 1.0), hot: k === 2 && u > 1.0 ? 4 : null });
    card(430, 300, 220, 50, { rx: 8, text: 'observeAll(): Flow', fs: 14.5, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.2) : 1 });
    grow(370, 180, 420, 280, k === 0 ? E(u, 0.2, 0.5) : 1, ACC, { plain: true });
    // 관 (쿼리 → 구독자들)
    const pipe = k === 0 ? E(u, 0.4, 1.0) : 1;
    el('path', { d: 'M540,300 C620,300 610,140 655,140', fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: pipe, 'stroke-dasharray': pipe < 1 ? `${pipe * 400} 400` : null });
    el('path', { d: 'M540,300 C700,320 860,320 870,235', fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: pipe, 'stroke-dasharray': pipe < 1 ? `${pipe * 400} 400` : null });
    const n0 = k === 3 ? (u > 1.6 ? 4 : 3) : k === 0 ? (u > 1.6 ? em.count : 0) : 3;
    screenList(720, n0, { name: '구독자 A', fresh: k === 3 && u > 1.6 }); screenList(870, n0, { name: '구독자 B', fresh: k === 3 && u > 1.6 });
    if (k === 0) { const f = seg(u, 0.9, 1.6); if (f > 0 && f < 1) { packet(lerp(560, 640, f), lerp(300, 150, E(f, 0, 1)), em.count); } { const f2 = seg(u, k === 0 ? 1.2 : 0.6, k === 0 ? 1.9 : 1.8); if (f2 > 0 && f2 < 1) packet(lerp(560, 860, f2), lerp(310, 260, f2), em.count); }
      tx(430, 380, '한 번 실행이 아니라 구독이 된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { codeCard(40, 270, 280, ['@Insert', 'suspend fun insert(task)'], { op: fade(u, 0.2) });
      pill(180, 380, '재조회 코드 0줄', GOOD, pop(u, 1.2), { fs: 14.5 });
      tx(560, 395, '쓰기와 읽기는 서로를 모른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { pill(200, 300, 'insert(회의 준비)', ACC, pop(u, 0.1), { mono: true, fs: 14 });
      // 변경 추적기가 신호를 보낸다
      const bell = seg(u, 1.1, 1.7); if (bell > 0) for (let r = 0; r < 3; r++) { const rr = 10 + r * 12 + bell * 10; el('circle', { cx: 380, cy: 150, r: rr, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: (1 - bell) * 0.9 }); }
      grow(380, 180, 440, 276, E(u, 1.4, 1.9), WARN, { dash: '5 4' });
      tx(430, 392, '변경 감지 → 재쿼리 예약', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); return; }
    // k 3: 새 리스트가 모든 구독자에게
    const f = seg(u, 0.3, 1.5); if (f > 0 && f < 1) { packet(lerp(560, 640, f), lerp(300, 150, E(f, 0, 1)), em.count); } { const f2 = seg(u, k === 0 ? 1.2 : 0.6, k === 0 ? 1.9 : 1.8); if (f2 > 0 && f2 < 1) packet(lerp(560, 860, f2), lerp(310, 260, f2), em.count); }
    tx(430, 392, `다시 조회 없이 ${tween(pe.count, em.count, u > 1.6 ? 3 : 0)}건짜리 새 리스트`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7) }); }

  // ---------- 4. ViewModel → Compose ----------
  function s4(t, c) { const { k, u } = c, em = c.beat.emit || { count: 4 };
    // DAO
    card(130, 150, 180, 70, { rx: 10, text: 'dao\n.observeAll()', fs: 15, mono: true, stroke: ACC, color: ACC, fill: ACCBG });
    const p1 = k === 0 ? E(u, 0.3, 1.0) : 1; grow(222, 150, 338, 150, p1, ACC);
    // ViewModel
    zone(340, 70, 300, 230, 'TaskViewModel', { fill: SOFT, op: k === 0 ? fade(u, 0.6) : 1 });
    const val = k === 0 ? null : k === 1 ? (u > 1.0 ? em.count : 0) : em.count;
    card(490, 150, 220, 70, { rx: 10, stroke: GOOD, sw: 2.5, fill: GOODBG, text: val == null ? 'tasks' : val ? `StateFlow · ${val}건` : 'StateFlow · []', fs: 15, mono: true, color: GOOD, s: k === 0 ? pop(u, 1.0) : 1 });
    if (k === 1) { sub(490, 205, val ? '마지막 값을 들고 있다' : 'initialValue = emptyList()', 1, { 'font-size': 14 });
      // 구독자가 떠나도 5초는 유지
      clock(560, 360, 26, E(u, 1.4, 2.6), WARN, 'WhileSubscribed(5_000)');
      tx(250, 350, '구독자가 떠나도 5초는 위쪽 Flow를 유지', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(250, 376, '화면 회전처럼 금방 돌아오면 쿼리를 다시 열지 않는다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    // UI
    const sc = { cx: 820, cy: 200 }; card(sc.cx, sc.cy, 170, 300, { rx: 22, stroke: INK, sw: 2.5 });
    const gate = k === 3 ? (u > 0.9 && u < 1.9 ? 0 : 1) : 1;
    grow(600, 150, 732, 150, k <= 2 ? (k === 2 ? 1 : (k === 1 ? E(u, 0.4, 0.8) : 0)) : 1, ACC);
    if (k >= 3) { const gx = 668; el('rect', { x: gx - 6, y: gate ? 112 : 132, width: 12, height: gate ? 16 : 36, rx: 3, fill: gate ? GOOD : BAD });
      tx(gx, 104, gate ? 'STARTED' : 'STOPPED', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: gate ? GOOD : BAD }); }
    const list = k === 4 ? (c.beat.ui || []) : [];
    list.forEach((s, i) => { const sh = pop(u, 0.3 + i * 0.3); card(sc.cx, 96 + i * 46, 136, 36, { rx: 6, text: s, fs: 14.5, s: sh, stroke: s.includes('✓') ? GOOD : GRID, color: s.includes('✓') ? GOOD : INK }); });
    if (k === 0) { tx(490, 340, 'UI는 DAO를 직접 구독하지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { // 쓰기는 DB 로만, 읽기는 Flow 로만
      pill(490, 260, 'add(title)', INFO, pop(u, 0.2), { mono: true, fs: 14 });
      el('path', { d: 'M440,262 C300,300 150,280 130,188', fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.5), 'marker-end': 'url(#ra-ah)' });
      tx(250, 330, 'insert만 한다', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      for (let i = 0; i < 2; i++) { dot([[222, 150], [338, 150]], (t * 0.7 + i / 2) % 1, ACC, 5); dot([[600, 150], [732, 150]], (t * 0.7 + i / 2) % 1, ACC, 5); }
      tx(480, 390, '쓰기는 DB로, 읽기는 Flow로 · 두 길이 섞이지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { mono(480, 350, 'vm.tasks.collectAsStateWithLifecycle()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
      tx(480, 388, gate ? (u > 1.9 ? '돌아오면 마지막 값부터 이어 받는다' : '화면이 보이는 동안 수집') : '백그라운드: 수집 멈춤', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: gate ? GOOD : BAD });
      if (gate) for (let i = 0; i < 2; i++) dot([[600, 150], [732, 150]], (t * 0.8 + i / 2) % 1, ACC, 5); return; }
    if (k === 4) { mono(480, 380, 'LazyColumn { items(tasks) { Text(it.title) } }', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(480, 406, 'DB → Flow → StateFlow → Compose', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); } }

  // ---------- 5. 실무 함정 ----------
  function board(list, k, u) { list.forEach((p, i) => { const y = 54 + i * 86, fresh = i === list.length - 1, s = fresh ? pop(u, 0.1) : 1;
      card(215, y + 30, 370, 76, { rx: 10, stroke: fresh ? WARN : GRID, sw: fresh ? 2.2 : 1.5, s });
      cross(52, y + 18, 7, s); tx(68, y + 23, p.bad, { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(s) });
      check(52, y + 46, 7, fresh ? pop(u, 1.8) : 1); tx(68, y + 51, p.fix, { 'font-size': 14.5, fill: GOOD, 'font-weight': 600, opacity: fresh ? fade(u, 1.8) : 1 }); }); }
  function s5(t, c) { const { k, u } = c;
    board(c.beat.pitfalls || [], k, u);
    if (k === 0) { // 메인 스레드에서 동기 쿼리
      const blocked = u > 0.8; el('line', { x1: 450, y1: 120, x2: 920, y2: 120, stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round' });
      tx(450, 96, 'Main', { 'font-size': 14.5, 'font-weight': 700 });
      for (let i = 0; i < 8; i++) { const x = 450 + ((i * 60 + (blocked ? 0 : t * 70)) % 470); el('rect', { x: x - 2, y: 111, width: 4, height: 18, rx: 2, fill: blocked ? BAD : GOOD }); }
      card(660, 120, 200, 40, { rx: 8, text: 'dao.observeAllBlocking()', fs: 13.5, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.5) });
      cross(780, 200, 18, pop(u, 1.2)); mono(690, 260, 'IllegalStateException', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(690, 286, 'Cannot access database on the main thread', fade(u, 1.5), { class: 'mono' });
      tx(690, 350, '개발 중에 바로 보이는 크래시다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { // ALTER TABLE: due 열이 붙는다
      const rows = c.beat.rows || []; table(450, 90, rows, { cols: 3, due: E(u, 0.8, 1.6), title: 'tasks' });
      card(560, 50, 70, 30, { rx: 6, text: u > 1.6 ? 'v2' : 'v1', fs: 15, mono: true, stroke: WARN, color: WARN });
      mono(450, 250, 'ALTER TABLE tasks ADD COLUMN due INTEGER', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      sub(690, 300, '기존 행은 due = NULL로 남고 데이터는 그대로', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 2) { // 새로 설치한 기기 vs 기존 사용자 기기
      const add = u > 1.5;
      [['개발 기기 (새로 설치)', 540, true, '처음부터 v2로 생성'], ['사용자 기기 (v1 데이터)', 800, add, add ? 'MIGRATION_1_2 실행' : 'Migration 없음 → 크래시']].forEach(([n, cx, ok, why], i) => {
        card(cx, 160, 120, 180, { rx: 18, stroke: ok ? GOOD : BAD, sw: 2.5 }); tx(cx, 50, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
        (ok ? check : cross)(cx, 160, 16, i === 1 ? (add ? pop(u, 1.6) : pop(u, 0.6)) : pop(u, 0.4));
        tx(cx, 280, why, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ok ? GOOD : BAD, opacity: i === 1 && add ? fade(u, 1.6) : fade(u, 0.5) }); });
      mono(670, 340, '.addMigrations(MIGRATION_1_2)', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(670, 380, '개발 기기에서는 재현되지 않는다 · 마이그레이션 테스트로 막는다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 3) { // 수집자마다 쿼리 → stateIn 하나로
      const share = u > 1.4; card(520, 210, 120, 60, { rx: 8, text: 'tasks\n테이블', fs: 14.5, stroke: INFO });
      [90, 210, 330].forEach((y, i) => { card(860, y, 110, 46, { rx: 8, text: `화면 ${i + 1}`, fs: 14.5, s: pop(u, 0.2 + i * 0.15) });
        if (!share) { el('path', { d: `M580,210 C700,210 700,${y} 805,${y}`, fill: 'none', stroke: BAD, 'stroke-width': 2.2 }); dot([[580, 210], [700, y], [805, y]], (t * 0.8 + i / 3) % 1, BAD, 5); }
        else el('path', { d: `M740,210 C780,210 780,${y} 805,${y}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2 }); });
      if (share) { el('line', { x1: 580, y1: 210, x2: 680, y2: 210, stroke: GOOD, 'stroke-width': 3 }); card(710, 210, 70, 40, { rx: 8, text: 'stateIn', fs: 13.5, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG }); }
      mono(520, 300, `쿼리 ${share ? 1 : 3}회`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: share ? GOOD : BAD });
      sub(520, 330, '예: 화면 세 곳이 같은 Flow를 수집할 때', 1, { 'font-size': 14 }); return; }
    // k 4: 큰 목록은 페이지 단위로
    const paged = u > 1.3; tx(450, 70, paged ? 'PagingSource: 필요한 페이지만 읽는다' : 'List로 수만 행을 한 번에', { 'font-size': 15, 'font-weight': 700, fill: paged ? GOOD : BAD });
    for (let i = 0; i < 24; i++) { const col = i % 6, row = Math.floor(i / 6), x = 450 + col * 76, y = 96 + row * 40, on = paged ? i < 6 * E(u, 1.4, 2.4) * 1.4 && i < 8 : i < 24 * E(u, 0.2, 1.0);
      el('rect', { x, y, width: 68, height: 32, rx: 4, fill: on ? (paged ? GOODBG : BADBG) : 'none', stroke: on ? (paged ? GOOD : BAD) : OFF, 'stroke-width': 1.5, 'stroke-dasharray': on ? null : '4 4' }); }
    tx(450, 290, '메모리', { 'font-size': 14.5, 'font-weight': 700 });
    const mem = paged ? 0.25 : E(u, 0.2, 1.0); el('rect', { x: 520, y: 276, width: 380, height: 20, rx: 5, fill: SOFT });
    el('rect', { x: 520, y: 276, width: 380 * mem, height: 20, rx: 5, fill: paged ? GOOD : BAD });
    if (!paged && u > 1.0) mono(900, 320, 'OutOfMemoryError', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
    tx(690, 380, '공통 뿌리: 어느 스레드에서, 얼마나 많은 데이터를', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: '@Query 문자열에 tasks 테이블에 없는 컬럼 이름을 쓰면 언제 알게 되는가?',
      o: ['앱이 그 쿼리를 처음 부를 때', '빌드할 때 에러로', '사용자가 신고할 때'], a: 1,
      why: 'Room은 빌드 때 @Query의 SQL을 파싱해 @Entity로 만든 테이블과 맞춰 본다. 컬럼 오타는 실행 전에 빌드 에러가 된다.' },
    { q: 'viewModelScope.launch 안에서 dao.insert(...) 다음 줄의 findById(newId)는 언제 실행되는가?',
      o: ['insert와 동시에', 'insert가 끝날 때까지 메인 스레드를 막고 기다린 뒤', 'insert가 끝난 뒤, 그동안 메인 스레드는 다른 일을 한다'], a: 2,
      why: 'suspend 호출은 순서대로 이어지지만 기다리는 동안 코루틴만 멈추고 스레드는 놓아준다. 그래서 newId = 3을 받은 뒤 findById(3)이 돈다.' },
    { q: 'Flow<List<Task>>를 반환하는 쿼리를 구독 중일 때 다른 곳에서 insert가 일어나면 어떻게 되는가?',
      o: ['구독자가 직접 다시 조회해야 한다', 'Room이 쿼리를 다시 돌려 새 리스트를 방출한다', '앱을 다시 켜야 반영된다'], a: 1,
      why: 'Room의 변경 추적이 tasks 테이블 변경을 감지하고 쿼리를 다시 실행한다. 구독자는 3건에서 4건짜리 리스트를 저절로 받는다.' },
    { q: 'stateIn(started = WhileSubscribed(5_000))에서 5_000은 무엇을 뜻하는가?',
      o: ['마지막 구독자가 떠난 뒤 5초 동안 위쪽 Flow를 유지한다', '5초마다 쿼리를 다시 돌린다', '5초 안에 첫 값이 없으면 에러를 낸다'], a: 0,
      why: '회전처럼 잠깐 구독이 끊겼다 돌아오는 경우 쿼리를 닫았다 다시 열지 않으려고 5초를 기다린다.' },
    { q: 'version을 2로 올리고 addMigrations(MIGRATION_1_2)를 빠뜨리면 어디서 크래시가 나는가?',
      o: ['새로 설치한 개발 기기', '빌드 서버', 'v1 데이터가 있는 기존 사용자 기기'], a: 2,
      why: '새로 설치한 기기는 처음부터 v2로 DB를 만든다. v1 DB가 있는 기기만 1에서 2로 가는 길을 찾지 못해 열 때 죽는다.' },
  ];

  const summary = [
    'Room은 @Entity 클래스로 테이블을, @Dao의 @Query로 쿼리를 정하고 그 SQL을 빌드 때 검사한다.',
    '일회성 읽기와 쓰기는 suspend로 두면 Room이 백그라운드에서 돌려 메인 스레드가 막히지 않는다.',
    'Flow를 반환하는 쿼리는 테이블이 바뀔 때마다 다시 돌아 3건에서 4건처럼 새 리스트를 방출한다.',
    'ViewModel에서 stateIn으로 하나를 공유하고, 스키마 version을 올리면 Migration을 꼭 등록한다.',
  ];
  const review = [
    { q: '할 일을 추가하면 DB에는 들어가는데 목록 화면이 그대로다. 목록은 suspend fun getAll(): List<Task>로 한 번 읽었다. 고칠 것은?',
      o: ['insert 뒤에 잠깐 기다렸다 화면을 그린다', '목록 쿼리를 Flow<List<Task>>로 바꿔 구독한다', 'insert를 메인 스레드에서 부른다'], a: 1,
      why: 'suspend 조회는 한 번 읽고 끝나 이후 변경을 모른다. Flow 쿼리는 테이블이 바뀔 때마다 새 리스트를 흘려보낸다.' },
    { q: '업데이트를 배포하자 기존 사용자만 앱을 열자마자 죽는다. 개발 기기는 멀쩡하다. 먼저 의심할 것은?',
      o: ['스키마 version을 올리고 Migration 등록을 빠뜨렸다', 'Flow를 너무 많이 구독한다', 'PagingSource를 썼다'], a: 0,
      why: '새로 설치한 개발 기기는 새 스키마로 DB를 만들어 문제가 없다. 옛 DB가 있는 기기만 Migration이 없어 열 때 크래시가 난다.' },
    { q: '목록 화면과 배지 화면이 각자 dao.observeAll()을 collect하자 같은 쿼리가 두 번씩 돈다. 고치는 방법은?',
      o: ['두 화면에서 runBlocking으로 한 번만 읽는다', 'observeAll을 suspend 함수로 바꾼다', 'ViewModel에서 stateIn(WhileSubscribed)로 하나를 만들어 함께 구독한다'], a: 2,
      why: '차가운 Flow는 수집자마다 쿼리를 따로 돌린다. stateIn으로 공유하면 쿼리는 한 번만 돌고 두 화면이 같은 값을 받는다.' },
  ];

  R.page({ title: 'tasks 테이블 · 스레드 · Flow 방출', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
