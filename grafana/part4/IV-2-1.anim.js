/* IV-2-1 Plugin 설치·관리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 설치 목록(plugins: id·name·kind·sig·ver·state·note)과 카탈로그(catalog)는 페이지 STEPS 의 beat 데이터를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, server, terminal, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 지역 도우미 ──
  function code(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 11;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    lines.forEach((s, i) => { const yy = y + 9 + i * lh;
      if (o.hl && o.hl.includes(i)) el('rect', { x: x + 5, y: yy + 1, width: w - 10, height: lh - 2, rx: 5, fill: o.hlc || ACCBG });
      spans(x + 14, yy + lh / 2 + fs * 0.36, tokens(s), { 'font-size': fs, opacity: o.rowOp ? o.rowOp(i) : 1 }); });
    return (i) => y + 9 + i * lh + lh / 2; }
  const KC = { panel: ACC, datasource: INFO, app: WARN };
  const KN = { panel: 'panel', datasource: 'data source', app: 'app' };
  // 플러그인 칩: 종류 색 띠 + 이름 + 버전 + 서명
  function chip(cx, cy, p, o) { o = o || {}; const w = o.w || 250, h = 46, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = KC[p.kind] || INK;
    const blocked = p.state === 'blocked' || o.blocked, inst = p.state === 'installing';
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: blocked ? BADBG : PANEL, stroke: blocked ? BAD : inst ? ACC : GRID, 'stroke-width': blocked || inst ? 2.2 : 1.5, 'stroke-dasharray': o.dash }, g);
    el('rect', { x: -w / 2, y: -h / 2, width: 7, height: h, rx: 3, fill: col }, g);
    tx(-w / 2 + 18, -3, p.name, { 'font-size': 15, 'font-weight': 800, fill: blocked ? BAD : INK }, g);
    mono(-w / 2 + 18, 16, KN[p.kind] + (p.ver ? ' · ' + p.ver : ''), { 'font-size': 13.5, fill: MUT }, g);
    const sg = p.sig === 'unsigned' ? ['unsigned', BAD] : ['signed', GOOD]; if (o.sig !== false) mono(w / 2 - 10, -3, sg[0], { 'font-size': 13.5, 'font-weight': 700, fill: sg[1], 'text-anchor': 'end' }, g);
    if (inst) { const bw = w * 0.35; el('rect', { x: w / 2 - 10 - bw, y: 9, width: bw, height: 7, rx: 3, fill: SOFT }, g); el('rect', { x: w / 2 - 10 - bw, y: 9, width: bw * (o.prog ?? 0.5), height: 7, rx: 3, fill: ACC }, g); }
    return g; }
  function shelf(x, y, w, list, c, o) { o = o || {}; const prev = (c.prev && c.prev[o.key || 'plugins']) || [];
    zone(x, y, w, (o.h || 50 + list.length * 54), o.title || 'Grafana에서 쓸 수 있는 확장', { stroke: o.stroke || GRID });
    list.forEach((p, i) => { const q = prev.find((z) => z.id === p.id), isNew = !q, ch = q && q.state !== p.state;
      chip(x + w / 2, y + 58 + i * 54, p, { w: w - 28, s: isNew ? pop(c.u, 0.3 + i * 0.1) : 1, prog: E(c.u, 0.2, 2.4), dash: o.dash }); }); }
  const PJSON = { id: 'clock', name: 'Clock', kind: 'panel', sig: 'signed' };

  // 1. 플러그인 3종
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 1) { const L = [['$ grafana-cli plugins ls', null], ['(외부 플러그인 없음)', 'var(--term)']];
      if (k === 1) L.push(['$ grafana-cli plugins list-remote | grep -i clock', null], ['id: grafana-clock-panel  version: 2.1.3', '#fbbf24']);
      terminal(40, 50, 470, 200, L, k === 0 ? lerp(0, 2, E(u, 0.2, 1.6)) : 2 + lerp(0, 2, E(u, 0.2, 1.6)), { title: 'bash', fs: 14 });
      shelf(560, 46, 360, b.plugins, c, { title: '설치됨 (내장)' });
      if (k === 1) { zone(40, 280, 470, 110, '카탈로그 (미설치)', { stroke: GRID }); (b.catalog || []).forEach((p) => chip(275, 340, { ...p, name: 'grafana-clock-panel' }, { w: 430, s: pop(u, 1.6), dash: '6 4' })); }
      else sub(275, 300, '내장 플러그인은 plugins ls에 나오지 않는다', fade(u, 1.8), { 'font-size': 14.5, fill: INK });
      return; }
    // 가운데 Grafana 몸통에 세 가지 꽂는 자리
    const SX = [200, 480, 760], KS = ['panel', 'datasource', 'app'], DESC = ['새 시각화', '새 백엔드', 'panel + data source + 페이지'];
    if (k === 2) { el('rect', { x: 60, y: 210, width: 840, height: 70, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.2 }); tx(480, 252, 'Grafana', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      KS.forEach((kd, i) => { const s = pop(u, 0.2 + i * 0.3); card(SX[i], 210, 120, 26, { rx: 6, text: KN[kd], fs: 14, mono: true, stroke: KC[kd], color: KC[kd], sw: 2.2, s });
        sub(SX[i], 312, DESC[i], fade(u, 0.4 + i * 0.3), { 'font-size': 14.5, fill: INK }); });
      const cat = b.catalog || []; cat.forEach((p) => { const i = KS.indexOf(p.kind), j = cat.filter((q) => q.kind === p.kind).indexOf(p);
        const y = lerp(40, 150 - j * 52, E(u, 0.9 + i * 0.2 + j * 0.8, 1.6 + i * 0.2 + j * 0.8)); chip(SX[i], y, p, { w: 220, sig: false, op: fade(u, 0.9 + i * 0.2 + j * 0.8) }); });
      chip(SX[1], lerp(60, 150, E(u, 1.4, 2.3)), { name: 'Prometheus', kind: 'datasource', ver: '내장', sig: 'signed' }, { w: 220, sig: false });
      return; }
    if (k === 3) { const T = ['/var/lib/grafana/plugins/', '  grafana-clock-panel/', '    plugin.json', '    module.js', '    img/ …'];
      T.forEach((s, i) => { const op = fade(u, 0.2 + i * 0.3); mono(120, 100 + i * 40, s, { 'font-size': 17, 'font-weight': i < 2 ? 700 : 400, fill: i === 0 ? ACC : INK, opacity: op }); });
      pill(700, 100, 'GF_PATHS_PLUGINS', INFO, pop(u, 0.4), { mono: true, fs: 14 });
      card(700, 260, 360, 70, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 1.6), text: '이 경로가 볼륨에 없으면\n컨테이너를 다시 띄울 때 사라진다', fs: 14.5 }); return; }
    // k4 plugin.json
    code(60, 70, 420, ['{', '  "type": "panel",', '  "id": "grafana-clock-panel",', '  "name": "Clock",', '  …', '}'], { fs: 15, lh: 30, hl: [1, 2] });
    grow(482, 115, 640, 170, E(u, 0.6, 1.3), ACC); card(740, 190, 180, 50, { rx: 10, text: 'panel 자리에 꽂힘', fs: 15, stroke: ACC, color: ACC, sw: 2.2, s: pop(u, 1.2) });
    chip(740, 290, { ...PJSON, ver: '2.1.3' }, { w: 260, s: pop(u, 1.6) });
    sub(270, 330, 'type과 id로 자기를 Grafana에 알린다', fade(u, 0.8), { 'font-size': 15, fill: INK }); }

  // 2. grafana-cli install
  const VIZ = ['Time series', 'Bar chart', 'Pie chart', 'Stat'];
  function picker(x, y, withClock, s) { zone(x, y, 300, 70 + (VIZ.length + 1) * 36, 'Visualization 고르기', { stroke: INK });
    VIZ.concat(withClock ? ['Clock'] : []).forEach((v, i) => { const isC = v === 'Clock'; card(x + 150, y + 60 + i * 36, 260, 30, { rx: 6, text: v, fs: 14.5, stroke: isC ? ACC : GRID, color: isC ? ACC : INK, fill: isC ? ACCBG : PANEL, sw: isC ? 2.2 : 1.2, s: isC ? s : 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    const L = [['$ grafana-cli plugins install grafana-clock-panel', null], ['✔ Downloaded grafana-clock-panel v2.1.3', '#4ade80'], ['installed into /var/lib/grafana/plugins/…', 'var(--term)'],
      ['$ grafana-cli plugins install grafana-clock-panel 2.1.3', null], ['$ systemctl restart grafana-server', null], ['$ grafana-cli plugins ls', null], ['grafana-clock-panel @ 2.1.3', '#fbbf24']];
    const upto = [1, 3, 4, 5, 7, 7][k], from = [0, 1, 3, 4, 5, 7][k];
    if (k <= 4) terminal(40, 46, 520, 250, L, lerp(from, upto, E(u, 0.2, 1.6)), { title: 'bash', fs: 13.5 });
    if (k === 1) { el('rect', { x: 60, y: 320, width: 480, height: 18, rx: 9, fill: SOFT }); el('rect', { x: 60, y: 320, width: 480 * E(u, 0.2, 1.6), height: 18, rx: 9, fill: ACC });
      mono(60, 370, 'zip 받기 → plugins 폴더에 풀기', { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.4) }); }
    if (k === 2) { card(300, 350, 480, 50, { rx: 10, stroke: ACC, sw: 2.2, text: 'id 뒤에 버전을 적으면 그 버전만 설치된다', fs: 15, s: pop(u, 0.8) }); }
    if (k <= 3) { const restarted = k === 3 && u > 1.6; picker(620, 46, restarted, pop(u, 1.7));
      if (k === 3) { const x0 = 60, x1 = 540, y = 345; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 3 });
        [['stop', 0.15], ['기동', 0.45], ['플러그인 스캔', 0.7], ['서비스', 0.95]].forEach(([s, f], i) => { const xx = lerp(x0, x1, f), op = fade(u, 0.3 + i * 0.4); el('circle', { cx: xx, cy: y, r: 8, fill: i === 2 ? ACC : INK, opacity: op }); tx(xx, y + 30, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: i === 2 ? ACC : INK, opacity: op }); });
        dot([[x0, y], [x1, y]], seg(u, 0.3, 2.0), ACC, 7); }
      if (k <= 2) sub(770, 330, k === 0 ? '아직 받지도 않았다' : '받았지만 목록에 없다', fade(u, 0.8), { fill: k ? WARN : MUT, 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 4) { chip(760, 120, { ...PJSON, ver: '2.1.3', state: 'installed' }, { w: 300, s: pop(u, 1.2) }); check(760, 200, 14, pop(u, 1.6)); sub(760, 240, '외부 플러그인으로 잡힌다', fade(u, 1.7), { fill: INK, 'font-size': 14.5 }); }
    if (k === 5) { server(200, 170, '서버 A', { lamp: GOOD }); chip(200, 300, { ...PJSON, ver: '2.1.3' }, { w: 240 });
      server(700, 170, '새 서버 B', { lamp: OFF, s: pop(u, 0.4) }); el('rect', { x: 580, y: 277, width: 240, height: 46, rx: 8, fill: 'none', stroke: BAD, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
      tx(700, 306, '플러그인 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      sub(450, 380, '서버를 새로 띄우면 install을 또 손으로 친다', fade(u, 1.4), { fill: INK, 'font-size': 15, 'font-weight': 700 }); } }

  // 3. GF_INSTALL_PLUGINS
  function container(x, y, w, h, title, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    mono(x + 14, y + 24, title, { 'font-size': 14, 'font-weight': 700, fill: o.stroke || INK, opacity: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { container(40, 60, 320, 220, 'grafana (old)', { stroke: BAD, dash: '6 5', op: 1 - E(u, 0.6, 1.4) * 0.6 }); chip(200, 140, { name: 'Clock', kind: 'panel', ver: '수동 설치', sig: 'signed' }, { w: 280, op: 1 - E(u, 0.6, 1.4) });
      cross(200, 200, 22, pop(u, 1.0)); grow(370, 170, 470, 170, E(u, 1.0, 1.5), MUT);
      container(480, 60, 440, 220, 'grafana:11.2.0 (new)', { op: fade(u, 1.3) }); sub(700, 170, 'image와 ports만 있다', fade(u, 1.6), { fill: INK, 'font-size': 15 });
      sub(480, 340, '컨테이너는 언제든 다시 만들어진다', fade(u, 1.9), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k <= 4) { container(40, 50, 880, 300, 'grafana:11.2.0', {});
      const ids = k >= 3 ? ['grafana-clock-panel 2.1.3', 'grafana-worldmap-panel'] : k === 2 ? ['grafana-clock-panel', 'grafana-worldmap-panel'] : ['…'];
      card(250, 110, 380, 40, { rx: 8, text: 'GF_INSTALL_PLUGINS', fs: 15, mono: true, stroke: ACC, color: ACC, sw: 2.2, s: k === 1 ? pop(u, 0.2) : 1 });
      ids.forEach((s, i) => card(250, 170 + i * 46, 380, 38, { rx: 6, text: s, fs: 14.5, mono: true, stroke: k === 3 && i === 0 ? ACC : GRID, sw: 1.6, s: k === 2 && i === 1 ? pop(u, 0.3) : k === 3 && i === 0 ? pop(u, 0.2) : 1 }));
      grow(442, 170, 540, 170, k === 1 ? E(u, 0.8, 1.4) : 1, ACC); pill(495, 148, 'entrypoint', INK, 1, { fs: 13.5, mono: true });
      const pl = (b.plugins || []).filter((p) => p.note !== '내장'); pl.forEach((p, i) => chip(730, 120 + i * 60, p, { w: 330, s: 1, prog: E(u, 0.3, 2.4) }));
      if (k === 1) sub(730, 250, '부팅할 때 grafana cli install을 대신 실행', fade(u, 1.4), { fill: INK, 'font-size': 14 });
      if (k === 3) sub(250, 290, '"id 버전" 꼴 — 공백으로 구분', fade(u, 1.0), { fill: ACC, 'font-weight': 700, 'font-size': 14.5 });
      if (k === 4) { R.dbIcon(250, 280, 'grafana-storage', { s: pop(u, 0.3), stroke: ACC }); grow(300, 270, 600, 270, E(u, 0.7, 1.3), ACC);
        mono(620, 276, '/var/lib/grafana', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1) }); sub(480, 385, '재부팅마다 다시 받지 않는다', fade(u, 1.6), { fill: INK, 'font-size': 15 }); }
      return; }
    if (k === 5) { code(80, 60, 440, ['services:', '  grafana:', '    volumes:', '      - grafana-storage:/var/lib/grafana', '', 'volumes:', '  grafana-storage:'], { fs: 15, lh: 32, hl: [5, 6], rowOp: (i) => (i >= 5 ? fade(u, 0.4 + (i - 5) * 0.3) : 1) });
      card(740, 180, 300, 90, { rx: 10, stroke: BAD, sw: 2, text: '최상위 선언이 빠지면\n컨테이너가 뜨지 않는다', fs: 15, s: pop(u, 1.4) }); return; }
    // k6 어디서 띄워도 같은 셋
    ['CI', 'staging', 'prod'].forEach((n, i) => { const x = 60 + i * 300; container(x, 110, 260, 200, n, { stroke: GOOD, op: fade(u, 0.2 + i * 0.3) });
      ['Clock 2.1.3', 'Worldmap 1.0.3'].forEach((s, j) => card(x + 130, 170 + j * 50, 220, 38, { rx: 8, text: s, fs: 14.5, stroke: GRID, s: pop(u, 0.5 + i * 0.3 + j * 0.1) })); check(x + 230, 136, 9, pop(u, 1.4 + i * 0.2)); });
    banner(480, 60, '같은 env = 같은 플러그인 셋', pop(u, 1.8)); sub(480, 360, 'compose 파일만 보면 무엇이 깔리는지 안다', fade(u, 2.0), { fill: INK, 'font-size': 15 }); }

  // 4. provisioning — 설치는 env, 설정은 yaml
  const ZY = ['apiVersion: 1', 'datasources:', '  - name: Zabbix', '    type: alexanderzobnin-zabbix-datasource', '    access: proxy', '    url: http://zabbix-web/api_jsonrpc.php', '    jsonData:', '      username: grafana', '      trends: true', '    secureJsonData:', '      password: ${ZABBIX_PASSWORD}', '    editable: false'];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { zone(60, 70, 380, 250, '설치 = GF_INSTALL_PLUGINS', { stroke: ACC }); zone(520, 70, 380, 250, '설정 = provisioning yaml', { stroke: INFO, op: fade(u, 0.6) });
      chip(250, 150, { name: 'Zabbix', kind: 'app', ver: 'alexanderzobnin-zabbix-app', sig: 'signed' }, { w: 340, sig: false }); check(250, 230, 12, pop(u, 0.3));
      mono(540, 140, 'apiVersion: 1', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.9) }); sub(710, 220, '접속 주소·계정은 아직 없다', fade(u, 1.3), { fill: INK, 'font-size': 14.5 });
      sub(480, 370, '플러그인을 깔았다고 data source가 생기지는 않는다', fade(u, 1.8), { fill: INK, 'font-size': 15, 'font-weight': 700 }); return; }
    if (k === 6) { zone(60, 60, 400, 250, 'Git 저장소', { stroke: GOOD }); [['docker-compose.yml', '설치 (env)'], ['provisioning/datasources/zabbix.yml', '설정'], ['provisioning/plugins/zabbix.yml', 'app 켜기']].forEach(([a, bb], i) => {
        mono(80, 112 + i * 62, a, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) }); tx(80, 134 + i * 62, bb, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2 + i * 0.3) }); });
      grow(470, 185, 600, 185, E(u, 1.2, 1.7), ACC); pill(535, 160, 'docker up', ACC, pop(u, 1.2), { mono: true, fs: 13.5 }); container(610, 90, 300, 200, '새 환경', { stroke: GOOD, op: fade(u, 1.6) });
      ['Clock · Worldmap', 'Zabbix data source'].forEach((s, i) => card(760, 160 + i * 56, 250, 40, { rx: 8, text: s, fs: 14.5, stroke: GOOD, s: pop(u, 1.8 + i * 0.2) })); return; }
    if (k === 5) { code(60, 70, 480, ['# provisioning/plugins/zabbix.yml', 'apiVersion: 1', 'apps:', '  - type: alexanderzobnin-zabbix-app', '    org_id: 1', '    disabled: false'], { fs: 15, lh: 32, hl: [3, 5] });
      const on = E(u, 1.0, 1.6); el('rect', { x: 680, y: 150, width: 90, height: 46, rx: 23, fill: on > 0.5 ? GOOD : OFF }); el('circle', { cx: lerp(703, 747, on), cy: 173, r: 18, fill: PANEL });
      tx(725, 236, on > 0.5 ? 'app 켜짐' : 'app 꺼짐', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: on > 0.5 ? GOOD : MUT });
      sub(300, 330, '클릭으로 켤 필요가 없다', fade(u, 1.6), { fill: INK, 'font-size': 15 }); return; }
    const hl = [[], [2, 3], [4, 5], [6, 7, 8], [9, 10, 11]][k], when = [0, 0, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4];
    const row = code(40, 46, 520, ZY, { fs: 14, lh: 27, hl, rowOp: (i) => (when[i] < k ? 1 : when[i] === k ? fade(u, 0.2 + (i % 3) * 0.25) : 0.12) });
    // 오른쪽: 만들어지는 data source 카드
    const done = k >= 4 && u > 1.2; el('rect', { x: 600, y: 60, width: 320, height: 250, rx: 12, fill: done ? GOODBG : PANEL, stroke: done ? GOOD : ACC, 'stroke-width': 2.2, opacity: fade(u, k === 1 ? 0.6 : 0) });
    tx(620, 96, 'Zabbix', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, k === 1 ? 0.8 : 0) }); mono(620, 122, 'data source (플러그인)', { 'font-size': 13.5, fill: INFO, opacity: fade(u, k === 1 ? 0.9 : 0) });
    if (k >= 2) { mono(620, 160, 'proxy', { 'font-size': 14.5, fill: INK, opacity: k === 2 ? fade(u, 0.5) : 1 }); mono(620, 184, 'zabbix-web/api_jsonrpc.php', { 'font-size': 13.5, fill: INK, opacity: k === 2 ? fade(u, 0.7) : 1 }); }
    if (k >= 3) [['username', 'grafana'], ['trends', 'true']].forEach(([a, v], i) => { mono(620, 222 + i * 24, a, { 'font-size': 14, fill: MUT, opacity: k === 3 ? fade(u, 0.5 + i * 0.3) : 1 }); mono(740, 222 + i * 24, v, { 'font-size': 14, opacity: k === 3 ? fade(u, 0.5 + i * 0.3) : 1 }); });
    if (k === 1) sub(760, 350, '내장 타입이 아니라 플러그인 id', fade(u, 1.4), { fill: INFO, 'font-weight': 700, 'font-size': 14.5 });
    if (k === 3) sub(760, 350, 'jsonData 항목은 플러그인마다 다르다', fade(u, 1.4), { fill: INK, 'font-size': 14.5 });
    if (k === 4) { lock(880, 96, true, INK, pop(u, 0.8)); mono(620, 290, 'password ●●●● (env)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) }); check(890, 285, 11, pop(u, 1.4)); sub(760, 350, '등록 완료 · UI 수정 잠금', fade(u, 1.5), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 2) grow(562, row(5), 600, 184, E(u, 0.6, 1.1), ACC); }

  // 5. 서명 검사 문
  const PL = [{ id: 'clock', name: 'Clock', kind: 'panel', sig: 'signed', ver: '2.1.3' }, { id: 'worldmap', name: 'Worldmap', kind: 'panel', sig: 'signed', ver: '1.0.3' }, { id: 'myorg', name: 'my-org-panel', kind: 'panel', sig: 'unsigned', ver: '0.1.0' }];
  function s5(t, c) { const { k, u } = c, GX = 470;
    if (k <= 3) { // 문
      el('rect', { x: GX - 14, y: 50, width: 28, height: 290, rx: 6, fill: INK }); tx(GX, 40, '서명 검사', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
      const allow = k >= 1; PL.forEach((p, i) => { const y = 100 + i * 100, isU = p.sig === 'unsigned', pass = !isU || allow;
        const mv = i === 2 ? (k <= 1 ? E(u, 0.6, 1.6) : 1) : (k === 0 ? E(u, 0.2 + i * 0.2, 1.2 + i * 0.2) : 1);
        const x = pass ? lerp(200, 720, mv) : lerp(200, GX - 150, mv);
        chip(x, y, isU && !pass ? { ...p, state: 'blocked' } : p, { w: 250 }); if (isU && !pass) cross(GX - 2, y, 14, pop(u, 1.6));
        if (isU && pass) pill(x, y + 38, '허용 목록', WARN, 1, { fs: 13.5 }); });
      if (k === 0) sub(GX, 380, '[plugins] 허용 목록이 비어 있으면 unsigned는 로드되지 않는다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 });
      if (k >= 1) { const L = k === 3 ? 'GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=my-org-panel' : k === 2 ? 'allow_loading_unsigned_plugins = my-org-panel,my-org-datasource' : 'allow_loading_unsigned_plugins = my-org-panel';
        card(480, 390, tw(L, 14) + 40, 36, { rx: 8, text: L, fs: 14, mono: true, stroke: WARN, sw: 2, s: pop(u, 0.2) }); }
      if (k === 2) { const r = E(u, 0.8, 1.8); tx(820, 40, '허용 개수 ↑ = 위험 ↑', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) }); el('rect', { x: 900, y: 60, width: 16, height: 280, rx: 8, fill: SOFT }); el('rect', { x: 900, y: 340 - 280 * (0.3 + 0.35 * r), width: 16, height: 280 * (0.3 + 0.35 * r), rx: 8, fill: BAD }); }
      return; }
    if (k === 4) { tx(480, 46, '서명 종류', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      [['grafana', 'Grafana Labs가 만든 플러그인', GOOD, 'Clock · Worldmap'], ['commercial', '상용 플러그인', GOOD, ''], ['community', '카탈로그의 오픈소스 플러그인', GOOD, ''], ['private', '지정한 주소의 Grafana에서만', INFO, ''], ['unsigned', '서명 없음 → 기본 차단', BAD, 'my-org-panel']].forEach(([a, d, col, ex], i) => {
        const y = 90 + i * 62, s = pop(u, 0.2 + i * 0.25); card(180, y, 200, 48, { rx: 24, text: a, fs: 15, mono: true, stroke: col, color: col, sw: 2.2, s });
        tx(300, y + 5, d, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.25) }); if (ex) mono(900, y + 5, ex, { 'font-size': 14, fill: col, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.25) }); }); return; }
    if (k === 5) { el('rect', { x: 120, y: 60, width: 720, height: 260, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.2 }); tx(140, 90, 'Grafana 프로세스 안', { 'font-size': 15, 'font-weight': 800 });
      chip(330, 170, { ...PL[2] }, { w: 280 }); grow(470, 170, 640, 170, E(u, 0.6, 1.2), BAD);
      ['로그인 세션', 'data source 응답', '사용자 화면'].forEach((s, i) => card(730, 130 + i * 56, 180, 42, { rx: 8, text: s, fs: 14.5, stroke: BAD, s: pop(u, 1.0 + i * 0.25) }));
      sub(480, 360, '검증되지 않은 코드가 Grafana와 같은 권한으로 돈다', fade(u, 1.8), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); return; }
    // k6 운영 함정
    [['버전 호환', '플러그인마다 지원하는 Grafana 버전이 다르다'], ['플러그인 과다', '시작이 느려지고 메모리가 는다'], ['수동 install', '환경마다 셋이 달라진다']].forEach(([a, d], i) => {
      const y = 100 + i * 90, s = pop(u, 0.2 + i * 0.4); card(200, y, 220, 58, { rx: 10, text: a, fs: 16, stroke: WARN, color: INK, sw: 2.2, s }); tx(340, y + 6, d, { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.4) }); });
    banner(480, 385, 'env와 provisioning으로 정리하면 크게 준다', pop(u, 1.8)); }

  const quiz = [
    { q: 'Zabbix처럼 panel·data source·페이지를 한데 묶은 플러그인 종류는 무엇인가?',
      o: ['panel', 'app', 'data source'], a: 1,
      why: '플러그인은 panel·data source·app 세 종류다. app은 여러 부품을 묶은 통합 앱이다.' },
    { q: 'grafana-cli로 Clock을 설치했는데 시각화 목록에 안 보인다. 무엇이 빠졌나?',
      o: ['Grafana 재시작', 'Git 커밋', '브라우저 새로고침만 하면 된다'], a: 0,
      why: '플러그인은 Grafana가 기동할 때 스캔된다. grafana-cli 설치 뒤에는 재시작해야 목록에 나타난다.' },
    { q: 'GF_INSTALL_PLUGINS로 Clock 버전을 고정하는 값은 어느 것인가?',
      o: ['grafana-clock-panel@2.1.3', 'grafana-clock-panel:2.1.3', 'grafana-clock-panel 2.1.3'], a: 2,
      why: 'GF_INSTALL_PLUGINS는 id와 버전을 공백으로 나눈다. @ 꼴은 GF_PLUGINS_PREINSTALL 같은 preinstall 설정이 쓰는 형식이다.' },
    { q: 'Zabbix 플러그인을 깐 뒤 data source를 쓰려면 무엇이 더 필요한가?',
      o: ['grafana.ini에서 unsigned 허용', 'type·url·jsonData 등을 적은 provisioning yaml', '플러그인 폴더 이름 바꾸기'], a: 1,
      why: '설치는 플러그인 파일만 깐다. 접속 주소와 계정은 provisioning yaml이 등록해야 실제로 쓸 수 있다.' },
    { q: '서명 없는 사내 my-org-panel을 로드하려면 어떻게 하나?',
      o: ['allow_loading_unsigned_plugins에 my-org-panel id를 적는다', '모든 unsigned를 여는 스위치를 켠다', 'GF_INSTALL_PLUGINS에 넣으면 저절로 허용된다'], a: 0,
      why: '허용은 id 단위다. 운영 설정에 전체 허용 스위치는 없고, 허용한 만큼 검증 안 된 코드가 돈다.' },
  ];

  const summary = [
    'Grafana 확장은 panel, data source, app 세 종류 플러그인으로 한다.',
    'grafana-cli install은 손으로 쳐야 하고 재시작해야 로드되며 새 서버에서 다시 해야 한다.',
    '컨테이너는 GF_INSTALL_PLUGINS에 id를 적어 부팅 때 깔고, 접속 설정은 provisioning yaml로 넣는다.',
    '서명 없는 플러그인은 기본으로 막히고 allow_loading_unsigned_plugins에 id를 적어야 열린다.',
  ];
  const review = [
    { q: '컨테이너를 다시 배포했더니 어제 grafana-cli로 깐 Clock 패널이 전부 "plugin not found"로 나온다. 고칠 방법은?',
      o: ['브라우저 캐시를 지운다', 'GF_INSTALL_PLUGINS에 grafana-clock-panel을 적어 부팅 때 깔게 한다', 'allow_loading_unsigned_plugins에 Clock을 넣는다'], a: 1,
      why: '손으로 깐 플러그인은 새 컨테이너에 없다. env에 적어 두면 어느 환경에서 띄워도 같은 셋이 깔린다.' },
    { q: 'Zabbix 플러그인은 잘 깔렸는데 data source 목록에 Zabbix가 없다. 먼저 볼 곳은?',
      o: ['grafana.ini의 서명 정책', 'plugins 폴더의 module.js', 'provisioning/datasources 아래 zabbix.yml과 그 마운트'], a: 2,
      why: '설치와 등록은 다른 일이다. data source는 provisioning yaml이 마운트된 경로에서 읽혀야 생긴다.' },
    { q: '사내 플러그인 다섯 개를 편하게 쓰려고 허용 목록에 모두 넣자는 제안이 나왔다. 무엇을 먼저 따져야 하나?',
      o: ['허용한 플러그인마다 검증 안 된 코드가 Grafana 안에서 돈다는 점', '허용 목록에 다섯 개까지만 넣을 수 있다는 점', '허용하면 플러그인이 자동 업데이트된다는 점'], a: 0,
      why: 'unsigned 허용은 그 코드를 믿는다는 결정이다. 꼭 필요한 id만 넣거나 private 서명을 검토한다.' },
  ];

  R.page({ title: 'Plugin 설치·관리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
