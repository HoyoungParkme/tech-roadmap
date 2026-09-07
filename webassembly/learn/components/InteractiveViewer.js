/**
 * InteractiveViewer.js
 * 경로: webassembly/learn/components/InteractiveViewer.js
 * 목적: 단계별 인터랙티브 시각화 재사용 컴포넌트
 * 주요 기능: STEPS 기반 자동재생/이전/다음, 좌우 분할 레이아웃, 상태 기반 애니메이션
 * 주요 의존성: React 18 (useState, useEffect, useRef)
 */
window.WasmLearn = window.WasmLearn || {};

/**
 * 단계 컨트롤러 훅
 */
function useStepController(totalSteps, interval) {
  if (interval === undefined) interval = 2500;
  const { useState, useEffect, useRef } = React;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  const isEnd = currentIdx === totalSteps - 1;

  const handleNext = function () {
    setCurrentIdx(function (prev) {
      if (prev < totalSteps - 1) return prev + 1;
      setIsPlaying(false);
      return prev;
    });
  };

  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;

  const handlePrev = function () {
    if (currentIdx > 0) {
      setCurrentIdx(function (prev) { return prev - 1; });
      setIsPlaying(false);
    }
  };

  const togglePlay = function () {
    if (isEnd) setCurrentIdx(0);
    setIsPlaying(function (prev) { return !prev; });
  };

  const goTo = function (idx) {
    setCurrentIdx(idx);
    setIsPlaying(false);
  };

  useEffect(function () {
    if (isPlaying) {
      playIntervalRef.current = setInterval(function () {
        handleNextRef.current();
      }, interval);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return function () { clearInterval(playIntervalRef.current); };
  }, [isPlaying]);

  return { currentIdx, isPlaying, isEnd, handleNext, handlePrev, togglePlay, goTo };
}

/**
 * 상태 기반 Tailwind 클래스 생성
 */
function getStatusClass(state, baseClass) {
  var transition = ' transition-all duration-500';
  if (state === 'active' || state === 'sending') {
    return baseClass + ' bg-violet-100 border-violet-500 ring-2 ring-violet-300 shadow-lg scale-105' + transition;
  }
  if (state === 'highlight') {
    return baseClass + ' bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-lg scale-105' + transition;
  }
  if (state === 'waiting') {
    return baseClass + ' bg-yellow-50 border-yellow-400 border-dashed text-yellow-700' + transition;
  }
  if (state === 'done' || state === 'received') {
    return baseClass + ' bg-slate-100 border-violet-400 text-violet-700' + transition;
  }
  return baseClass + ' bg-white border-slate-200 text-slate-400' + transition;
}

/**
 * 컨트롤 바
 */
function StepControls({ controller, totalSteps }) {
  var currentIdx = controller.currentIdx;
  var isPlaying = controller.isPlaying;
  var isEnd = controller.isEnd;

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        <button
          aria-label="이전 단계"
          onClick={controller.handlePrev}
          disabled={currentIdx === 0}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 20L9 12l10-8v16z"/><line x1="5" y1="19" x2="5" y2="5"/>
          </svg>
        </button>

        <button
          aria-label={isPlaying ? '정지' : '자동 실행'}
          onClick={controller.togglePlay}
          className="flex items-center px-4 py-2 rounded text-white font-medium transition shadow-sm w-28 justify-center text-sm"
          style={{ background: '#654FF0' }}
        >
          {isPlaying ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
              정지
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              자동 실행
            </>
          )}
        </button>

        <button
          aria-label="다음 단계"
          onClick={controller.handleNext}
          disabled={isEnd}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 4l10 8-10 8V4z"/><line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
        </button>
      </div>

      <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
        Step: {currentIdx + 1} / {totalSteps}
      </div>
    </div>
  );
}

/**
 * 인터랙티브 뷰어 메인 컴포넌트
 */
function InteractiveViewer({ steps, renderDiagram, renderDetail, autoPlayInterval }) {
  var controller = useStepController(steps.length, autoPlayInterval || 2500);
  var stepData = steps[controller.currentIdx];

  return (
    <div className="interactive-viewer-wrap">
      <div className="text-white p-4 rounded-xl shadow-sm mb-4" style={{ background: '#654FF0' }}>
        <h3 className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: '#ddd6fe' }}>{stepData.title}</h3>
        <p className="text-base font-medium leading-relaxed">{stepData.desc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 min-h-[350px] flex flex-col justify-center">
          {renderDiagram(stepData, controller.currentIdx, controller)}
        </div>

        {renderDetail && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 min-h-[350px] flex flex-col justify-center">
            {renderDetail(stepData, controller.currentIdx, controller)}
          </div>
        )}
      </div>

      <StepControls controller={controller} totalSteps={steps.length} />
    </div>
  );
}

window.WasmLearn.InteractiveViewer = InteractiveViewer;
window.WasmLearn.useStepController = useStepController;
window.WasmLearn.getStatusClass = getStatusClass;
window.WasmLearn.StepControls = StepControls;
