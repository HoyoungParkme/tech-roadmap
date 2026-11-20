/**
 * 모듈: anim/engine.js (모든 주제 공용)
 * 목적: 챕터 페이지의 애니메이션 무대(SVG 960×420)를 그리는 도구 모음.
 *       페이지마다 <id>.anim.js 가 RA.page({...}) 로 장면 5개를 등록하고,
 *       ../../anim/stage.jsx 의 AnimStage 가 beat 가 바뀔 때마다 RA.render 로 그린다.
 *
 * 시간 규칙: 한 장면(Step)의 beat k 는 장면 시각 [k*BEAT, (k+1)*BEAT) 구간을 차지한다.
 *   그리기 함수는 draw(t, c) 하나다. t 는 장면 시각, c 는 { k, u, n, beat, prev, steps } 이며
 *   u = t - k*BEAT (지금 beat 안에서 흐른 시간, 0 → BEAT). 같은 t 면 언제나 같은 그림이어야 한다.
 * 색: 모두 CSS 변수(.rp-stage 에 정의). 색을 직접 쓰지 않는다.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const BEAT = 3;
  let fg = null;

  // ---------- 기본 ----------
  function el(tag, a, p) { const e = document.createElementNS(NS, tag); for (const k in a) { if (a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]); } (p || fg).appendChild(e); return e; }
  function tx(x, y, s, a, p) { const e = el('text', Object.assign({ x, y, 'font-size': 15 }, a || {}), p); e.textContent = s; return e; }
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
  const E = (t, a, b) => ease(seg(t, a, b));
  const lerp = (a, b, u) => a + (b - a) * u;
  const spring = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.exp(-5.5 * u) * Math.cos(9 * u));
  const pop = (t, a, d = 0.6) => spring(seg(t, a, a + d));           // a초부터 튀어나오는 크기 0→1
  const fade = (t, a, d = 0.4) => seg(t, a, a + d);                  // a초부터 서서히 보이기
  const bump = (t, a) => { const u = seg(t, a, a + 0.7); return u > 0 && u < 1 ? Math.sin(u * Math.PI * 3) * (1 - u) * 0.14 : 0; };
  const tw = (s, fs) => [...String(s)].reduce((w, c) => w + (c.charCodeAt(0) > 255 ? fs : fs * 0.6), 0);   // 글자 폭 어림

  // ---------- 색 ----------
  const C = {
    INK: 'var(--ink)', MUT: 'var(--muted)', OFF: 'var(--off)', PANEL: 'var(--panel)', SOFT: 'var(--soft)', GRID: 'var(--grid)',
    ACC: 'var(--new)', ACCBG: 'var(--newbg)', BAD: 'var(--bad)', BADBG: 'var(--badbg)', GOOD: 'var(--good)', GOODBG: 'var(--goodbg)',
    WARN: 'var(--warn)', WARNBG: 'var(--warnbg)', INFO: 'var(--info)', INFOBG: 'var(--infobg)', HL: 'var(--hl)',
  };
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD } = C;

  // ---------- 모양 ----------
  function G(x, y, s, op, p) { return el('g', { transform: `translate(${x} ${y}) scale(${s ?? 1})`, opacity: op ?? 1 }, p); }
  // 가운데 기준 둥근 판. o.text 는 \n 으로 여러 줄
  function card(cx, cy, w, h, o) { o = o || {}; const g = G(cx, cy, o.s, o.op, o.p);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: o.rx ?? 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw ?? 2, 'stroke-dasharray': o.dash }, g);
    const rows = o.text != null ? String(o.text).split('\n') : [], fs = o.fs || 15;
    rows.forEach((r, i) => tx(0, (i - (rows.length - 1) / 2) * (fs + 6) + fs * 0.36, r, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': o.fw || 600, fill: o.color || INK, class: o.mono ? 'mono' : null }, g));
    return g; }
  // 색이 다른 조각을 한 줄로 (고정폭)
  function spans(x, y, parts, a, p) { const e = el('text', Object.assign({ x, y, 'font-size': 15, class: 'mono', style: 'white-space:pre' }, a || {}), p);
    parts.forEach(([s, pa]) => { if (!s) return; const ts = document.createElementNS(NS, 'tspan'); for (const k in pa || {}) ts.setAttribute(k, pa[k]); ts.textContent = s; e.appendChild(ts); }); return e; }
  const mono = (x, y, s, a, p) => tx(x, y, s, Object.assign({ class: 'mono', style: 'white-space:pre' }, a || {}), p);
  const sub = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op ?? 1 }, a || {}));
  const lbl = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const pill = (cx, cy, s, col, sc, o) => { o = o || {}; const fs = o.fs || 14; return card(cx, cy, tw(s, fs) + 26, fs + 14, { rx: (fs + 14) / 2, stroke: col || INK, sw: 1.8, text: s, fs, fw: 700, color: o.color || col || INK, fill: o.fill, s: sc, op: o.op, mono: o.mono }); };
  const banner = (cx, cy, s, sc) => card(cx, cy, tw(s, 15) + 44, 38, { rx: 19, fill: INK, stroke: 'none', text: s, fs: 15, fw: 700, color: PANEL, s: sc });
  // 선이 자라는 화살표 (u 0→1)
  function grow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {};
    el('line', { x1, y1, x2: lerp(x1, x2, u), y2: lerp(y1, y2, u), stroke: col || MUT, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'marker-end': u > 0.98 && !o.plain ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); }
  // 알약이 a 에서 b 로 날아감 (o.stay 면 도착 후 남음)
  function fly(ax, ay, bx, by, u, text, o) { o = o || {}; if (u <= 0 || (u >= 1 && !o.stay)) return;
    return card(lerp(ax, bx, E(u, 0, 1)), lerp(ay, by, E(u, 0, 1)), tw(text, 13.5) + 24, 28, { rx: 14, fill: o.fill || ACC, stroke: 'none', text, fs: 13.5, fw: 700, color: o.color || PANEL, mono: o.mono }); }
  // 경로(점 배열)를 따라 움직이는 점
  function dot(route, u, col, r) { if (u <= 0 || u >= 1) return;
    const segs = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1])), total = segs.reduce((a, b) => a + b, 0);
    let d = u * total, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const k = segs[i] ? d / segs[i] : 0, p = route[i], q = route[i + 1];
    el('circle', { cx: lerp(p[0], q[0], k), cy: lerp(p[1], q[1], k), r: r || 6, fill: col || ACC }); }
  // 한 줄 칸 (배열, 리스트, 메모리 칸). o.style(i, v) → {stroke, fill, color, s, op}
  function cells(x, y, vals, o) { o = o || {}; const w = o.w || 56, h = o.h || 44, gap = o.gap ?? 6;
    vals.forEach((v, i) => { const st = (o.style && o.style(i, v)) || {}, cx = x + i * (w + gap) + w / 2;
      card(cx, y + h / 2, w, h, { rx: o.rx ?? 6, text: v == null ? '' : String(v), fs: o.fs || 15, fw: 600, mono: o.mono !== false, stroke: st.stroke || INK, fill: st.fill, color: st.color, sw: st.sw || 2, s: st.s, op: st.op, dash: st.dash });
      if (o.index) tx(cx, y + h + 17, String(i), { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }); }); }
  // 키-값 표 (Redis 메모리 들여다보기). rows: [[key, value, o?]] o = {hot, gone, ttl}
  function kvTable(x, y, w, rows, o) { o = o || {}; const rh = o.rh || 34, kw = o.kw || w * 0.45;
    el('rect', { x, y, width: w, height: rh * rows.length + 30, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 14, y + 20, o.title || 'Redis 메모리', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    rows.forEach(([k, v, ro], i) => { ro = ro || {}; const yy = y + 30 + i * rh, op = ro.op ?? 1, col = ro.gone ? OFF : ro.hot ? ACC : INK;
      if (ro.hot) el('rect', { x: x + 6, y: yy + 2, width: w - 12, height: rh - 4, rx: 6, fill: ACCBG, opacity: op });
      mono(x + 16, yy + rh / 2 + 5, k, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op, 'text-decoration': ro.gone ? 'line-through' : null });
      mono(x + kw, yy + rh / 2 + 5, v, { 'font-size': 14.5, fill: ro.gone ? OFF : INK, opacity: op });
      if (ro.ttl != null) mono(x + w - 14, yy + rh / 2 + 5, ro.ttl, { 'font-size': 13.5, fill: ro.ttlCol || C.WARN, 'text-anchor': 'end', opacity: op }); }); }
  // 영역 상자
  function zone(x, y, w, h, title, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: o.rx ?? 12, fill: o.fill || SOFT, stroke: o.stroke || 'none', 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (title) tx(x + 14, y + 22, title, { 'font-size': 13.5, 'font-weight': 700, fill: o.color || MUT, opacity: o.op ?? 1 }); }

  // ---------- 그림 부품 ----------
  function server(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    [-28, 0, 28].forEach((y) => { el('rect', { x: -56, y: y - 12, width: 112, height: 24, rx: 5, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5 }, g); el('circle', { cx: 40, cy: y, r: 4.5, fill: o.lamp || OFF }, g); el('line', { x1: -42, y1: y, x2: 6, y2: y, stroke: OFF, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); });
    if (name) tx(0, 64, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }, g); return g; }
  function dbIcon(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-44,-26 V26 A44,13 0 0 0 44,26 V-26', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5 }, g); el('ellipse', { cx: 0, cy: -26, rx: 44, ry: 13, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5 }, g); el('path', { d: 'M-44,0 A44,13 0 0 0 44,0', fill: 'none', stroke: c, 'stroke-width': 1.5 }, g);
    if (name) tx(0, 62, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: c }, g); return g; }
  // Redis 상자: 빨간 큐브 대신 판 + 이름 (색은 ACC)
  function redisBox(cx, cy, o) { o = o || {}; const w = o.w || 124, h = o.h || 58, g = card(cx, cy, w, h, { rx: 10, stroke: o.stroke || ACC, sw: 2.5, fill: o.fill || ACCBG, s: o.s, op: o.op });
    tx(0, o.sub ? -3 : 6, o.name || 'Redis', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: o.stroke || ACC }, g);
    if (o.sub) tx(0, 17, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  function person(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('circle', { cx: 0, cy: -16, r: 13, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5 }, g); el('path', { d: 'M-24,26 Q-24,2 0,2 Q24,2 24,26 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    if (name) tx(0, 50, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }, g); return g; }
  // 사람이 몰린 모습: 가운데 사람 + 둘레 점 n개 (최대 24)
  function crowd(cx, cy, n, label) { for (let i = 0; i < Math.min(Math.round(n), 24); i++) { const a = i * 2.4, rr = 30 + (i % 3) * 9; el('circle', { cx: cx + Math.cos(a) * rr, cy: cy - 4 + Math.sin(a) * rr * 0.8, r: 4.5, fill: OFF }); }
    person(cx, cy, null, {}); if (label) lbl(cx, cy + 54, label, 1, { 'font-size': 14 }); }
  function browser(cx, cy, w, h, name, o) { o = o || {}; const g = card(cx, cy, w, h, { rx: 10, sw: 2.5, s: o.s, op: o.op, stroke: o.stroke });
    el('line', { x1: -w / 2, y1: -h / 2 + 26, x2: w / 2, y2: -h / 2 + 26, stroke: o.stroke || INK, 'stroke-width': 2 }, g); [0, 14, 28].forEach((d) => el('circle', { cx: -w / 2 + 16 + d, cy: -h / 2 + 13, r: 4, fill: OFF }, g));
    if (name) tx(0, h / 2 + 22, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }, g); return g; }
  function cross(x, y, r, s) { const g = G(x, y, s ?? 1); el('path', { d: `M${-r},${-r} L${r},${r} M${r},${-r} L${-r},${r}`, stroke: C.BAD, 'stroke-width': Math.max(3, r / 3), 'stroke-linecap': 'round' }, g); return g; }
  function check(x, y, r, s) { const g = G(x, y, s ?? 1); el('path', { d: `M${-r},0 L${-r * 0.3},${r * 0.7} L${r},${-r * 0.7}`, fill: 'none', stroke: C.GOOD, 'stroke-width': Math.max(3, r / 3), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); return g; }
  function lock(cx, cy, locked, col, s) { const g = G(cx, cy, s ?? 1), c = col || INK;
    el('path', { d: locked ? 'M-9,-4 V-14 A9,9 0 0 1 9,-14 V-4' : 'M-9,-4 V-14 A9,9 0 0 1 9,-14 V-12', fill: 'none', stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round', transform: locked ? null : 'translate(14 0) scale(-1 1) translate(-4 0)' }, g);
    el('rect', { x: -13, y: -5, width: 26, height: 20, rx: 4, fill: PANEL, stroke: c, 'stroke-width': 3 }, g); return g; }
  // 시계 (TTL 등): frac 0→1 만큼 채워진 원
  function clock(cx, cy, r, frac, col, label) { el('circle', { cx, cy, r, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
    const f = clamp(frac); if (f > 0.001) { const a = -Math.PI / 2 + f * 2 * Math.PI, big = f > 0.5 ? 1 : 0;
      el('path', { d: f >= 0.999 ? `M${cx},${cy - r} A${r},${r} 0 1 1 ${cx - 0.01},${cy - r} Z` : `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} Z`, fill: col || C.WARN, opacity: 0.85 }); }
    if (label) tx(cx, cy + r + 18, label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono' }); }
  // 계기판: items [{name, val, hot, bar(0~100)}] 를 가로로 나란히
  function meters(x, y, w, items, o) { o = o || {}; const n = items.length, gap = 14, cw = (w - gap * (n - 1)) / n, h = o.h || 68;
    items.forEach((m, i) => { const cx = x + i * (cw + gap) + cw / 2, cy = y + h / 2, col = m.hot ? C.BAD : m.good ? C.GOOD : INK;
      card(cx, cy, cw, h, { rx: 10, stroke: m.hot ? C.BAD : GRID, sw: m.hot ? 2.5 : 1.5 });
      tx(cx - cw / 2 + 14, cy - h / 2 + 21, m.name, { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      tx(cx - cw / 2 + 14, cy - h / 2 + 48, m.val, { 'font-size': 22, 'font-weight': 700, class: 'mono', fill: col });
      if (m.bar != null) { const bw = cw - 28, by = cy + h / 2 - 13; el('rect', { x: cx - cw / 2 + 14, y: by, width: bw, height: 6, rx: 3, fill: SOFT }); el('rect', { x: cx - cw / 2 + 14, y: by, width: bw * clamp(m.bar / 100), height: 6, rx: 3, fill: m.hot ? C.BAD : ACC }); } }); }
  // 숫자를 이전 beat 값에서 지금 값으로 부드럽게 (u: beat 안 시간)
  const tween = (a, b, u, d = 1.2) => (a == null ? b : lerp(a, b, E(u, 0.1, 0.1 + d)));
  // 터미널 창: lines 는 문자열 또는 [text, color]. shown 개수까지 보임 (소수면 마지막 줄을 타이핑)
  function terminal(x, y, w, h, lines, shown, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 10, fill: INK });
    [0, 14, 28].forEach((d, i) => el('circle', { cx: x + 16 + d, cy: y + 15, r: 4.5, fill: ['#f87171', '#fbbf24', '#4ade80'][i], opacity: 0.9 }));
    if (o.title) mono(x + 62, y + 20, o.title, { 'font-size': 13.5, fill: OFF });
    const lh = o.lh || 22, rows = Math.floor((h - 40) / lh), all = lines.slice(0, Math.ceil(shown)), first = Math.max(0, all.length - rows);
    all.slice(first).forEach((ln, i) => { const [s, col] = Array.isArray(ln) ? ln : [ln, null], idx = first + i, part = idx === Math.ceil(shown) - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s;
      mono(x + 16, y + 44 + i * lh, part, { 'font-size': o.fs || 14, fill: col || (s.startsWith('>') || s.startsWith('$') || s.startsWith('127.') ? PANEL : 'var(--term)') }); }); }
  // 짧은 코드 조각 (파이썬 색칠)
  const KW = /^(def|return|if|else|elif|for|while|in|import|from|with|as|async|await|try|except|finally|not|and|or|None|True|False|class|lambda|local|then|end|redis)$/;
  function tokens(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: C.INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const c = line[i];
      if (c === '#' || (c === '-' && line[i + 1] === '-')) { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (c === '"' || c === "'") { flush(); const e = line.indexOf(c, i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += c; i++; }
    flush(); return out; }
  function snippet(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 8, w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + 36, h = lines.length * lh + 20, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    lines.forEach((s, i) => spans(x + 18, y + 14 + fs + i * lh, tokens(s), { 'font-size': fs, opacity: op })); return { w, h }; }

  // ---------- 그래프 (ML·데이터 주제용) ----------
  // 좌표축: 범위 o.x=[min,max], o.y=[min,max]. 돌려준 X(v)/Y(v) 로 값→좌표. o.xl/o.yl 축 이름, o.xt/o.yt 눈금 값 배열
  function axes(x, y, w, h, o) { o = o || {}; const [x0, x1] = o.x || [0, 1], [y0, y1] = o.y || [0, 1];
    const X = (v) => x + ((v - x0) / (x1 - x0)) * w, Y = (v) => y + h - ((v - y0) / (y1 - y0)) * h;
    el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: MUT, 'stroke-width': 1.8 }); el('line', { x1: x, y1: y, x2: x, y2: y + h, stroke: MUT, 'stroke-width': 1.8 });
    (o.xt || []).forEach((v) => { el('line', { x1: X(v), y1: y + h, x2: X(v), y2: y + h + 5, stroke: MUT }); mono(X(v), y + h + 20, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    (o.yt || []).forEach((v) => { el('line', { x1: x - 5, y1: Y(v), x2: x, y2: Y(v), stroke: MUT }); mono(x - 9, Y(v) + 5, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    if (o.grid) (o.yt || []).forEach((v) => el('line', { x1: x, y1: Y(v), x2: x + w, y2: Y(v), stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '3 4' }));
    if (o.xl) tx(x + w, y + h + 40, o.xl, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
    if (o.yl) tx(x, y - 12, o.yl, { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    return { X, Y, x, y, w, h }; }
  // 점 찍기: pts [[vx, vy, 색(선택), 모양 'o'|'x'(선택)]], u(0→1)만큼 앞에서부터 나타남
  function scatter(ax, pts, o) { o = o || {}; const u = o.u ?? 1, r = o.r || 6, n = pts.length;
    pts.forEach(([vx, vy, col, sh], i) => { const s = clamp(u * n - i); if (s <= 0) return; const cx = ax.X(vx), cy = ax.Y(vy), c = col || o.col || ACC;
      if (sh === 'x') el('path', { d: `M${cx - r},${cy - r} L${cx + r},${cy + r} M${cx + r},${cy - r} L${cx - r},${cy + r}`, stroke: c, 'stroke-width': 2.5, opacity: s });
      else el('circle', { cx, cy, r: r * (0.4 + 0.6 * s), fill: o.hollow ? PANEL : c, stroke: c, 'stroke-width': 2, opacity: s }); }); }
  // 꺾은선: pts [[vx, vy]] 를 u 만큼 그려 나감
  function line(ax, pts, u, col, o) { o = o || {}; if (u <= 0 || pts.length < 2) return; const n = pts.length - 1, k = clamp(u) * n, i = Math.floor(k);
    const ps = pts.slice(0, i + 1).map(([a, b]) => [ax.X(a), ax.Y(b)]); if (i < n) { const [a0, b0] = pts[i], [a1, b1] = pts[i + 1], f = k - i; ps.push([ax.X(lerp(a0, a1, f)), ax.Y(lerp(b0, b1, f))]); }
    el('polyline', { points: ps.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.6, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: o.op ?? 1 }); }
  // 행렬/히트맵: m[행][열] 숫자, 칸 크기 cs. 진할수록 큰 값(o.max 기준). o.rows/o.cols 머리글, o.fmt 값 표기, o.hi(r,c) 강조
  function heat(x, y, m, cs, o) { o = o || {}; const max = o.max ?? Math.max(...m.flat().map(Math.abs)) ?? 1, fs = o.fs || 14.5;
    m.forEach((row, r) => row.forEach((v, c) => { const cx = x + c * cs, cy = y + r * cs, a = clamp(Math.abs(v) / (max || 1)), hi = o.hi && o.hi(r, c);
      el('rect', { x: cx, y: cy, width: cs - 3, height: cs - 3, rx: 4, fill: v < 0 ? C.BAD : o.col || ACC, opacity: 0.12 + 0.75 * a });
      if (hi) el('rect', { x: cx - 1, y: cy - 1, width: cs - 1, height: cs - 1, rx: 5, fill: 'none', stroke: INK, 'stroke-width': 2.5 });
      mono(cx + (cs - 3) / 2, cy + (cs - 3) / 2 + fs * 0.36, o.fmt ? o.fmt(v) : String(v), { 'font-size': fs, 'text-anchor': 'middle', 'font-weight': 700, fill: a > 0.6 ? PANEL : INK }); }));
    (o.cols || []).forEach((s, c) => tx(x + c * cs + (cs - 3) / 2, y - 10, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 }));
    (o.rows || []).forEach((s, r) => tx(x - 10, y + r * cs + (cs - 3) / 2 + 5, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 })); }
  // 막대 하나: 값 v / 최대 max, 길이 w. 끝에 값 표기
  function hbar(x, y, w, v, max, o) { o = o || {}; const h = o.h || 18, len = Math.max(2, (w * clamp(v / (max || 1))) * (o.u ?? 1));
    el('rect', { x, y, width: w, height: h, rx: 4, fill: SOFT }); el('rect', { x, y, width: len, height: h, rx: 4, fill: o.col || ACC });
    if (o.label !== false) mono(x + w + 8, y + h * 0.5 + 5, o.text ?? String(v), { 'font-size': 14, 'font-weight': 700, fill: o.col || INK }); }

  // ---------- 무대 ----------
  function defs(svg) { if (svg.querySelector('#ra-ah')) return; const d = el('defs', {}, svg);
    [['ra-ah', MUT], ['ra-ahb', ACC], ['ra-ahr', C.BAD]].forEach(([id, col]) => { const m = el('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, d); el('path', { d: 'M0,0 L10,5 L0,10 z', fill: col }, m); }); }

  const RA = {
    BEAT, C, el, tx, clamp, seg, ease, E, lerp, spring, pop, fade, bump, tw, tween,
    G, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, kvTable, zone,
    server, dbIcon, redisBox, person, crowd, browser, cross, check, lock, clock, meters, terminal, tokens, snippet,
    axes, scatter, line, heat, hbar,
    cfg: null,
    // 페이지 장면 등록: { title, scenes: [draw × 장면 수], codeOpen?: [bool…], vb?: [string…] }
    page(cfg) { RA.cfg = cfg; },
    // g 에 장면 gi 의 t 시각을 그린다. c = { k, u, n, beat, prev, steps }
    render(g, gi, t, c) { fg = g; while (g.firstChild) g.removeChild(g.firstChild); defs(g.ownerSVGElement);
      const fn = RA.cfg && RA.cfg.scenes[gi]; if (!fn) { tx(480, 210, '장면 준비 중', { 'text-anchor': 'middle', fill: MUT }); return; }
      fn(t, c); },
  };
  window.RA = RA;
})();
