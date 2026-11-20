/**
 * 모듈: redis/anim/stage.jsx  (페이지의 본 스크립트보다 먼저 type="text/babel" 로 불린다)
 * 목적: Redis 챕터 페이지의 본문 레이아웃 "C안".
 *   - 코드가 필요한 단계: 왼쪽 애니메이션 + 오른쪽 CodeViewer
 *   - 코드가 필요 없는 단계(기본: 마크다운 문서): 애니메이션을 크게, 코드는 접힘
 *   - "코드 접기 / 코드 보기" 버튼으로 언제든 바꾼다. 파일이 바뀌면 기본값으로 돌아간다.
 * 페이지 쪽에서 쓰는 이름: STEPS, CodeViewer, SummaryTable, MARK, TONE (페이지에 정의돼 있다)
 * 주의: 페이지가 const { useState… } = React 를 선언하므로 여기서는 React.useState 처럼 쓴다.
 */

// STEPS 를 Step(제목) 단위로 묶는다: 단계 i → { g, k, n }
function raGroupOf(i) {
  if (!window.__raGroups) {
    let last = null, g = -1, k = 0;
    const pos = STEPS.map((s) => { if (s.title !== last) { g++; k = 0; last = s.title; } return { g, k: k++ }; });
    const n = {}; pos.forEach((p) => { n[p.g] = (n[p.g] || 0) + 1; });
    window.__raGroups = pos.map((p) => ({ ...p, n: n[p.g] }));
  }
  return window.__raGroups[i];
}

function AnimStage({ stepIdx }) {
  const gRef = React.useRef(null);
  const [replay, setReplay] = React.useState(0);
  const { g, k, n } = raGroupOf(stepIdx);
  const cfg = window.RA.cfg || {};
  const vb = (cfg.vb && cfg.vb[g]) || '0 0 960 420';
  React.useEffect(() => {
    const B = window.RA.BEAT, t0 = k * B, t1 = (k + 1) * B;
    const steps = STEPS.filter((_, i) => raGroupOf(i).g === g);
    const c = { k, n, beat: STEPS[stepIdx], prev: k > 0 ? STEPS[stepIdx - 1] : null, steps };
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf; const start = performance.now();
    const tick = (now) => {
      const t = reduce ? t1 - 0.001 : Math.min(t1 - 0.001, t0 + ((now - start) / 1000) * 1.15);
      window.RA.render(gRef.current, g, t, { ...c, u: t - t0 });
      if (t < t1 - 0.001) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stepIdx, replay]);
  return (
    <div className="rp-stage" onClick={() => setReplay((r) => r + 1)} title="누르면 이 장면을 다시 재생">
      <svg viewBox={vb} role="img" aria-label={(STEPS[stepIdx].beat && STEPS[stepIdx].beat.label) || STEPS[stepIdx].title}><g ref={gRef} /></svg>
    </div>
  );
}

function RaBeatNote({ state }) {
  const b = state.beat;
  if (!b) return null;
  const marks = typeof MARK !== 'undefined' ? MARK : {};
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-zinc-900">{b.label}</span>
        {b.at && <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-zinc-300 bg-zinc-50 text-zinc-700">↔ {b.at}</span>}
      </div>
      {b.caption && <p className="text-[13px] mt-1 text-zinc-600 leading-relaxed">{b.caption}</p>}
      {b.changes && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {b.changes.map((c, i) => {
            const m = marks[c.mark] || { sign: '•', color: '#57534a', bg: '#faf7ef', bd: '#cfc9ba' };
            return (<span key={i} className="trn-mark text-[11px] px-1.5 py-0.5 rounded border" style={{ background: m.bg, borderColor: m.bd, color: m.color }}><b>{m.sign}</b> {c.text}</span>);
          })}
        </div>
      )}
    </div>
  );
}

function AnimPane({ state, stepIdx, fold }) {
  const tones = typeof TONE !== 'undefined' ? TONE : {};
  const t = tones[state.verdictTone] || tones.warn || { badge: 'bg-amber-200 text-amber-800' };
  const cfg = window.RA.cfg || {};
  return (
    <div className="rounded-xl border border-neutral-300 bg-white p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-sm font-bold text-neutral-800">{cfg.title || '애니메이션'}</h3>
        <span className="flex items-center gap-2 flex-wrap justify-end">
          {state.verdict && <span className={`text-[10px] px-2 py-0.5 rounded ${t.badge}`}>{state.verdict}</span>}
          <button onClick={fold.toggle} className="text-[11px] px-2 py-0.5 rounded border border-neutral-400 bg-white text-neutral-700 hover:bg-neutral-50 font-mono" aria-expanded={fold.open}>
            {fold.open ? '코드 접기 ▸' : '◂ 코드 보기 · ' + fold.file}
          </button>
        </span>
      </div>
      <AnimStage stepIdx={stepIdx} />
      <RaBeatNote state={state} />
      {typeof SummaryTable !== 'undefined' && <SummaryTable summary={state.summary} />}
      {state.keyPoint && <div className="mt-3 text-xs text-neutral-800 bg-neutral-100 border border-neutral-300 rounded p-2">💡 {state.keyPoint}</div>}
    </div>
  );
}

function HybridBody({ step, stepIdx }) {
  const [pick, setPick] = React.useState({ file: null, open: null });
  const { g } = raGroupOf(stepIdx);
  const cfg = window.RA.cfg || {};
  const file = step.code.filename;
  const dflt = cfg.codeOpen && cfg.codeOpen[g] != null ? cfg.codeOpen[g] : step.code.lang !== 'markdown';
  const open = pick.file === file && pick.open !== null ? pick.open : dflt;
  const fold = { open, file, toggle: () => setPick({ file, open: !open }) };
  if (open) return (
    <div className="ra-split grid grid-cols-1 gap-4">
      <AnimPane state={step} stepIdx={stepIdx} fold={fold} />
      <CodeViewer code={step.code} stepIdx={stepIdx} total={STEPS.length} />
    </div>
  );
  return (
    <div className="max-w-5xl mx-auto">
      <AnimPane state={step} stepIdx={stepIdx} fold={fold} />
    </div>
  );
}
