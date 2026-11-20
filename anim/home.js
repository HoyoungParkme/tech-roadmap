/**
 * 모듈: anim/home.js — 첫 화면(모든 주제). 루트 index.html 의 CATS 와 ANIM(주제별 애니메이션 장 수)을 쓴다.
 * 진도: 주제마다 localStorage 'trn-read-<id>' 의 완료 장 수 / 전체 장 수. 이어서 보기: 'trn-last' (lesson.jsx 가 기록)
 */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const read = (id) => { try { return Object.keys(JSON.parse(localStorage.getItem('trn-read-' + id) || '{}')).length; } catch (e) { return 0; } };
  let all = 0, ch = 0, anim = 0;
  CATS.forEach((c) => c.items.forEach((t) => { all++; ch += t[4]; anim += (ANIM[t[0]] || 0); }));
  $('links').innerHTML = `<a class="on" href="./index.html">${ICON.grid}주제</a><a href="./mindmap/index.html">${ICON.map}지도로 보기</a>`;
  $('stats').innerHTML = `<span>${ICON.grid}<b>${all}</b>개 주제</span><span>${ICON.pages}<b>${ch.toLocaleString()}</b>장</span><span>${ICON.play}<b>${anim}</b>장 애니메이션</span>`;
  // 이어서 보기
  let last = null; try { last = JSON.parse(localStorage.getItem('trn-last') || 'null'); } catch (e) { /* 없음 */ }
  const firstAnim = CATS.flatMap((c, ci) => c.items.map((t) => ({ t, ci }))).find((x) => ANIM[x.t[0]]);
  const goUrl = last && last.url && !/^\.\.\//.test(last.url) ? './' + last.url.replace(/^\.\//, '') : firstAnim ? `./${firstAnim.t[0]}/index.html` : './index.html';
  const goLabel = last && last.label && !/^\.\.\//.test(last.url || '') ? last.label : firstAnim ? `${firstAnim.t[1]} · 첫 장부터` : '';
  const lastTopic = (goUrl.match(/^\.\/([^/]+)\//) || [])[1];
  const lc = CATS.findIndex((c) => c.items.some((t) => t[0] === lastTopic)); const lk = KKEY[lc >= 0 ? lc : 1];
  $('cont').href = goUrl; $('contArt').innerHTML = ART[lk](KCOL[lk]);
  $('contK').textContent = last ? '이어서 보기' : '여기서 시작'; $('contT').textContent = goLabel;
  let pick = -1;
  function render() {
    $('filters').innerHTML = ['전체', ...CATS.map((c) => c.name)].map((n, i) => `<button class="${pick === i - 1 ? 'on' : ''}" data-i="${i - 1}">${esc(n)}</button>`).join('');
    $('cats').innerHTML = CATS.map((c, ci) => (pick !== -1 && pick !== ci) ? '' : `<section class="pf-cat"><h2>${esc(c.name)} <small>${c.items.length}개 주제</small></h2><div class="pf-grid">` +
      c.items.map(([id, name, desc, parts, n]) => { const k = KKEY[ci], r = read(id), pct = Math.round(r / n * 100), unit = id === 'gcp' ? '섹션' : '장';
        return `<a class="pf-card pf-tc" href="./${esc(id)}/index.html"><span class="pf-art">${ART[k](KCOL[k])}</span><h3>${esc(name)}</h3><p>${esc(desc)}</p>
          <div class="meta"><span class="pf-meta">${ICON.parts}${parts} Part</span><span class="pf-meta">${ICON.pages}${n}${unit}</span>${ANIM[id] ? `<span class="pf-meta">${ICON.play}애니메이션</span>` : ''}</div>
          ${r ? `<div class="pf-bar"><b style="width:${pct}%"></b></div>` : ''}</a>`; }).join('') + `</div></section>`).join('');
  }
  $('filters').onclick = (e) => { const b = e.target.closest('button'); if (b) { pick = +b.dataset.i; render(); } };
  render();
})();
