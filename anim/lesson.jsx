/**
 * 모듈: anim/lesson.jsx (모든 주제 공용) — 챕터 페이지의 A형(레슨) 화면
 * 불리는 순서: engine.js → <id>.anim.js → stage.jsx → lesson.jsx → 페이지 본 스크립트
 * 페이지 쪽에서 쓰는 이름:
 *   STEPS (필수), CodeViewer (필수), SummaryTable·RefPanel·MARK (있으면)
 *   window.LESSON = { topic, topicName, topicHref, id, title, sub, prev, next, wrap }  (scripts/to_lesson.py 가 넣는다)
 *   RA.page({ ..., quiz: [{ q, o:[…], a, why }] })  — 장면(Step)마다 확인 문제 하나 (없으면 문제 없이 진행)
 *   RA.page({ ..., summary: ['짧은 문장', …], review: [{ q, o, a, why }] }) — 완료 화면의 정리(3~4줄)와 복습 문제(3개)
 * 화면: 위(✕·위치·장면별 진행·n/N) → 장면 이름·단계 제목 → 그림 → 설명·변화 → 메모·핵심 → 코드 두세 줄(전체는 접기) → 표·정리 보기
 *       장면 끝마다 확인 문제, 마지막에 완료 화면. 아래 고정: 이전 · 계속
 */
const LS_STORE = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } },
};

function lsItems() {
  const quiz = (window.RA && RA.cfg && RA.cfg.quiz) || [];
  const groups = [];
  STEPS.forEach((_, i) => { const { g } = raGroupOf(i); (groups[g] = groups[g] || []).push(i); });
  const items = [];
  groups.forEach((idx, g) => { idx.forEach((i) => items.push({ i, g })); if (quiz[g]) items.push({ quiz: g, g }); });
  items.push({ done: true, g: groups.length - 1 });
  return { items, groups, quiz };
}

function lsSnippet(code) {
  if (!code || code.lang === 'markdown' || !code.lines) return null;   // 설명 문서는 코드로 보이지 않는다
  const hi = (code.highlight || []).slice(0, 5);
  if (!hi.length) return null;
  const raw = hi.map((n) => code.lines[n - 1] || '').filter((l) => l.trim() && !/^\s*("""|'''|```)\s*$/.test(l));   // 빈 줄·따옴표만 있는 줄은 빼고
  if (!raw.length) return null;
  const ind = Math.min(...raw.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length).concat([99]));
  return raw.slice(0, 3).map((l) => l.slice(ind === 99 ? 0 : ind)).join('\n');
}

// 정리 문장을 한 줄씩 (summary 가 없을 때 LESSON.wrap 을 문장 단위로 나눈다)
function lsSentences(t) {
  if (!t) return [];
  return t.split(/(?<=[.!?다요])\s+(?=\S)/).map((x) => x.trim()).filter(Boolean);
}

function LessonApp() {
  const L = window.LESSON || {};
  const { items, groups, quiz } = React.useMemo(lsItems, []);
  const start = (() => { const m = location.hash.match(/s=(\d+)/); return m ? Math.min(+m[1], items.length - 1) : 0; })();
  const [at, setAt] = React.useState(start);
  const [solved, setSolved] = React.useState({});
  const [codeOpen, setCodeOpen] = React.useState(false);
  const [refOpen, setRefOpen] = React.useState(false);
  const [pick, setPick] = React.useState(null);
  const [res, setRes] = React.useState(null);   // 확인 문제: null | 'ok' | 'no'
  const [rv, setRv] = React.useState({});      // 완료 화면 복습 문제: 문제 번호 → 고른 보기 (한 번만 고른다)
  const it = items[at];

  React.useEffect(() => { document.body.classList.add('pf', 'pf-white'); }, []);
  React.useEffect(() => {
    window.scrollTo(0, 0); setCodeOpen(false); setPick(null); setRes(solved[at] ? 'ok' : null);
    try { history.replaceState(null, '', '#s=' + at); } catch (e) { /* 무시 */ }
    if (L.topic && L.id) LS_STORE.set('trn-last', { url: `${L.topic}/${L.path || ''}`, label: `${L.topicName || L.topic} · ${L.id} ${L.title || ''}` });
    if (it.done && L.topic && L.id) { const r = LS_STORE.get('trn-read-' + L.topic, {}); r[L.id] = true; LS_STORE.set('trn-read-' + L.topic, r); }
  }, [at]);
  const canNext = !(it.quiz != null && !solved[at]);
  const go = (d) => setAt((a) => Math.max(0, Math.min(items.length - 1, a + d)));
  React.useEffect(() => {
    const onKey = (e) => { if (e.target.closest && e.target.closest('input,textarea')) return;
      if (e.key === 'ArrowRight' && canNext && !it.done) go(1); else if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });
  window.__lesson = { items, at, go: (n) => setAt(n), solve: () => setSolved((s) => ({ ...s, [at]: true })) };

  // 진행 막대: 장면마다 한 칸, 칸 안은 그 장면의 단계+문제 중 지난 비율
  const segs = groups.map((idx, g) => { const total = idx.length + (quiz[g] ? 1 : 0);
    const mine = items.slice(0, at + 1).filter((x) => x.g === g && !x.done).length;
    return it.g > g || it.done ? 1 : it.g < g ? 0 : mine / total; });

  let body;
  if (it.done) {
    const sum = (RA.cfg && RA.cfg.summary) || lsSentences(L.wrap);
    const rq = (RA.cfg && RA.cfg.review) || [];
    const got = rq.filter((q, k) => rv[k] === q.a).length, doneN = rq.filter((q, k) => rv[k] != null).length;
    body = (
      <div className="pf-done">
        <div className="pf-eyebrow">{L.id} · {L.title}</div>
        <h1>이 장에서 배운 것</h1>
        {sum.length > 0 && <ol className="pf-sum">{sum.map((t, k) => <li key={k}>{t}</li>)}</ol>}
        {rq.length > 0 && (<section className="pf-review">
          <h2>복습 문제 <span>{doneN === rq.length ? `${rq.length}문제 중 ${got}개 맞힘` : `${rq.length}문제`}</span></h2>
          {rq.map((q, k) => { const p = rv[k], judged = p != null;
            return (<div key={k} className="pf-rq">
              <p className="q"><b>{k + 1}</b>{q.q}</p>
              <div className="pf-opts">{q.o.map((o, j) => {
                const cls = judged && j === q.a ? 'right' : judged && j === p ? 'wrong' : '';
                return (<button key={j} className={'pf-opt ' + cls} disabled={judged} onClick={() => setRv((r) => ({ ...r, [k]: j }))}>
                  <span className="mk">{'ABCD'[j]}</span>{o}</button>); })}</div>
              {judged && <div className={'pf-fb ' + (p === q.a ? 'ok' : 'no')}><b>{p === q.a ? '맞았어요' : `정답은 ${'ABCD'[q.a]}`}</b>{q.why}</div>}
            </div>); })}
        </section>)}
        <a className="pf-back" href={L.topicHref || '../index.html'}>{L.topicName ? L.topicName + ' 주제로' : '주제로'} 돌아가기</a>
      </div>
    );
  } else if (it.quiz != null) {
    const q = quiz[it.quiz];
    body = (<React.Fragment>
      <div className="pf-eyebrow">{STEPS[groups[it.quiz][0]].title} · 확인 문제</div>
      <h1>{q.q}</h1>
      <div className="pf-opts">
        {q.o.map((o, k) => {
          const cls = res === 'ok' && k === q.a ? 'right' : res === 'no' && k === pick ? 'wrong' : pick === k ? 'sel' : '';
          return (<button key={k} className={'pf-opt ' + cls} onClick={() => { if (res !== 'ok') { setPick(k); setRes(null); } }}>
            <span className="mk">{'ABCD'[k]}</span>{o}</button>);
        })}
      </div>
      {res && (<div className={'pf-fb ' + res}><b>{res === 'ok' ? '맞았어요' : '다시 생각해 봐요'}</b>{res === 'ok' ? q.why : '다른 답을 골라 다시 확인해 보세요.'}</div>)}
    </React.Fragment>);
  } else {
    const s = STEPS[it.i], b = s.beat || {}, snip = lsSnippet(s.code);
    const marks = { new: 'new', changed: 'changed', read: 'read', gone: 'gone' };
    const ref = typeof RefPanel === 'function' ? RefPanel({ step: s, stepIdx: it.i }) : null;
    const alertTone = s.alert && (s.alert.tone || 'info');
    body = (<React.Fragment>
      <div className="pf-eyebrow">{s.title}</div>
      <h1>{b.label || s.title}</h1>
      {raGroupOf(it.i).k === 0 && s.desc && <p className="pf-lead">{s.desc}</p>}
      <div className="pf-card pf-fig"><AnimStage stepIdx={it.i} /></div>
      <div className="pf-swipe">← 그림을 옆으로 밀어 보기 →</div>
      {b.caption && <p className="pf-cap">{b.caption}</p>}
      {b.changes && <div className="pf-chips">{b.changes.map((c, k) => <span key={k} className={'pf-chip ' + (marks[c.mark] || '')}>{c.text}</span>)}</div>}
      {snip && (<div className="pf-code">
        <div className="snip">{snip}</div>
        <button onClick={() => setCodeOpen((o) => !o)} aria-expanded={codeOpen}>{codeOpen ? '▴ 코드 접기' : '▾ 코드 전체 보기'} · {s.code.filename}</button>
        {codeOpen && <div className="full"><CodeViewer code={s.code} stepIdx={it.i} total={STEPS.length} /></div>}
      </div>)}
      {s.alert && s.alert.text && s.alert.text !== s.keyPoint && <div className={'pf-note ' + alertTone}>{s.alert.text}</div>}
      {typeof SummaryTable === 'function' && s.summary && <SummaryTable summary={s.summary} />}
      {s.keyPoint && <div className="pf-key"><b>핵심</b>{s.keyPoint}</div>}
      {ref && (<div className="pf-card pf-ref">
        <button onClick={() => setRefOpen((o) => !o)} aria-expanded={refOpen}><span>📋 표·정리 보기</span><span style={{ fontWeight: 400 }}>{refOpen ? '접기 ▴' : '펼치기 ▾'}</span></button>
        {refOpen && <div className="bd ra-ref">{ref}</div>}
      </div>)}
    </React.Fragment>);
  }

  const isQuiz = it.quiz != null && !solved[at];
  const check = () => { if (pick == null) return; const ok = pick === quiz[it.quiz].a; setRes(ok ? 'ok' : 'no'); if (ok) setSolved((s) => ({ ...s, [at]: true })); };
  return (
    <React.Fragment>
      <header className="pf-ltop"><div className="in">
        <a className="pf-x" href={L.topicHref || '../index.html'} aria-label={(L.topicName ? L.topicName + ' 주제' : '주제') + '로 돌아가기'}>✕</a>
        <span className="pf-where">{L.topicName} · {L.id}</span>
        <div className="pf-prog">{segs.map((f, g) => <i key={g}><b style={{ width: (f * 100) + '%' }} /></i>)}</div>
        <span className="pf-cnt">{Math.min(at + 1, items.length - 1)} / {items.length - 1}</span>
      </div></header>
      <main className="pf-lmain">{body}</main>
      <footer className="pf-lfoot"><div className="in">
        <button className="pf-btn" onClick={() => go(-1)} disabled={at === 0} aria-label="이전 단계">이전</button>
        {it.done ? (L.next ? <a className="pf-btn primary" href={L.next.href}>다음 장</a> : <a className="pf-btn primary" href={L.topicHref || '../index.html'}>주제로</a>)
          : isQuiz ? <button className="pf-btn primary" disabled={pick == null || res === 'no'} onClick={check} aria-label="확인">확인</button>
          : <button className="pf-btn primary" onClick={() => go(1)} aria-label="다음 단계">{items[at + 1] && items[at + 1].done ? '마치기' : '계속'}</button>}
      </div></footer>
    </React.Fragment>
  );
}
