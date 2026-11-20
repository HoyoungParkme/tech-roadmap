/**
 * 모듈: anim/topic.js — 주제 페이지(학습 경로). 각 주제의 index.html 이 TOPIC 설정과 함께 부른다.
 *   window.TOPIC = { id, name, desc, cat(0~4), catName, sections:[{part, label, items:[{id,title,file,anim}]}] }
 * 진도: localStorage 'trn-read-<id>' (장 완료 = lesson.jsx 가 완료 화면에서 기록, 예전 노트의 ☑ 와 같은 키)
 * 예전 주소 호환: index.html#I-1-1 로 오면 그 장으로 바로 간다.
 */
(function () {
  const T = window.TOPIC, $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const flat = T.sections.flatMap((s) => s.items);
  const h = location.hash.slice(1); const hit = flat.find((x) => x.id === h);
  if (hit) { location.replace(hit.file); return; }
  let read = {}; try { read = JSON.parse(localStorage.getItem('trn-read-' + T.id) || '{}'); } catch (e) { /* 저장 불가 */ }
  const doneN = flat.filter((x) => read[x.id]).length, cur = flat.find((x) => !read[x.id]) || flat[0];
  const pct = Math.round(doneN / flat.length * 100), k = KKEY[T.cat] || 'be';
  const animN = flat.filter((x) => x.anim).length;
  document.title = T.name + ' — 개발자 학습 노트';
  $('links').innerHTML = `<a class="on" href="../index.html">${ICON.grid}주제</a><a href="../mindmap/index.html">${ICON.map}지도로 보기</a>`;
  $('info').innerHTML = `<a class="crumb" href="../index.html">${ICON.back}모든 주제 · ${esc(T.catName)}</a>
    <span class="pf-art">${ART[k](KCOL[k])}</span><h1>${esc(T.name)}</h1><p>${esc(T.desc)}</p>
    <div class="meta"><span class="pf-meta">${ICON.parts}${T.sections.length} Part</span><span class="pf-meta">${ICON.pages}${flat.length}장</span>${animN ? `<span class="pf-meta">${ICON.play}애니메이션 ${animN}장</span>` : ''}</div>
    <div class="pf-bar"><b style="width:${pct}%"></b></div><div class="row"><span>${doneN} / ${flat.length}장 완료</span><span>${pct}%</span></div>
    <a class="pf-btn primary" href="${esc(cur.file)}">${doneN ? '계속하기' : '시작하기'} · ${esc(cur.title)}</a>
    <a class="alt" href="../mindmap/index.html">${ICON.map}지도에서 보기</a>`;
  let n = 0;
  $('path').innerHTML = T.sections.map((p) => { const d = p.items.filter((x) => read[x.id]).length;
    return `<div class="pf-card pf-part"><div class="k">PART ${esc(p.part)}</div><div class="n">${esc(p.label.replace(/^Part\s*[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ0-9]+\.?\s*/, ''))}</div><div class="c">${d} / ${p.items.length}장</div></div>` +
      p.items.map((it, j) => { const st = read[it.id] ? 'done' : it === cur ? 'cur' : 'lock'; n++;
        const node = `<a class="pf-node ${st} pf-l${j % 4}" href="${esc(it.file)}"><span class="pf-disc"><i>${st === 'done' ? '✓' : n}</i></span><span><span class="id">${esc(it.id)}</span><div class="tt">${esc(it.title)}</div></span></a>`;
        return st === 'cur' ? node + `<div class="pf-card pf-curcard pf-l${j % 4}"><div class="k">${esc(it.id)} · ${doneN ? '지금 할 장' : '첫 장'}</div><div class="tt">${esc(it.title)}</div><a class="pf-btn primary" href="${esc(it.file)}">시작</a></div>` : node; }).join(''); }).join('');

  // 댓글 (giscus) — 처음 열 때만 불러온다
  const btn = $('cmBtn'), pane = $('cm'); let loaded = false;
  const W = () => Math.min(420, Math.round(innerWidth * 0.9));
  function set(open) { pane.style.width = W() + 'px'; pane.style.transform = open ? 'none' : 'translateX(100%)'; btn.style.right = open ? W() + 'px' : '0';
    btn.textContent = open ? '닫기' : '💬 댓글'; btn.setAttribute('aria-expanded', open);
    if (open && !loaded) { loaded = true; const s = document.createElement('script'); s.src = 'https://giscus.app/client.js'; s.async = true; s.crossOrigin = 'anonymous';
      Object.entries({ repo: 'HoyoungParkme/tech-roadmap', 'repo-id': 'R_kgDOSIZCtg', category: 'General', 'category-id': 'DIC_kwDOSIZCts4C7lgx', mapping: 'specific', term: T.id,
        strict: '0', 'reactions-enabled': '1', 'emit-metadata': '0', 'input-position': 'bottom', theme: 'light', lang: 'ko' }).forEach(([a, v]) => s.setAttribute('data-' + a, v));
      $('cmBody').appendChild(s); } }
  let open = false; btn.onclick = () => set(open = !open); $('cmClose').onclick = () => set(open = false); set(false);
})();
