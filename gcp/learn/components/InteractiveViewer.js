/**
 * InteractiveViewer.js
 * 경로: learn/components/InteractiveViewer.js
 * 목적: 단계별 인터랙티브 시각화 재사용 컴포넌트
 * 주요 기능: STEPS 기반 자동재생/이전/다음, 좌우 분할 레이아웃, 상태 기반 애니메이션
 * 주요 의존성: React 18 (useState, useEffect, useRef)
 *
 * cloud-run-flow.html에서 추출한 핵심 패턴:
 * - useStepController: 자동재생 + 이전/다음 상태 관리
 * - getStatusClass: 상태별 Tailwind 클래스 매핑
 * - StepControls: 컨트롤 바 UI
 * - InteractiveViewer: 메인 레이아웃 (설명 + 좌우 패널 + 컨트롤)
 */
window.GCPLearn = window.GCPLearn || {};

/**
 * 단계 컨트롤러 훅
 * setInterval의 클로저 문제를 useRef로 해결
 * @param {number} totalSteps - 전체 단계 수
 * @param {number} interval - 자동재생 간격 (ms, 기본 2500)
 * @returns {{ currentIdx, isPlaying, isEnd, handleNext, handlePrev, togglePlay, goTo }}
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
 * @param {string} state - 'active' | 'idle' | 'done' | 'waiting' | 'sending' | 'received'
 * @param {string} baseClass - 기본 CSS 클래스
 * @returns {string} 완성된 클래스 문자열
 */
function getStatusClass(state, baseClass) {
  var transition = ' transition-all duration-500';
  if (state === 'active' || state === 'sending') {
    return baseClass + ' bg-blue-100 border-blue-500 ring-2 ring-blue-300 shadow-lg scale-105' + transition;
  }
  if (state === 'highlight') {
    return baseClass + ' bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-lg scale-105' + transition;
  }
  if (state === 'waiting') {
    return baseClass + ' bg-yellow-50 border-yellow-400 border-dashed text-yellow-700' + transition;
  }
  if (state === 'done' || state === 'received') {
    return baseClass + ' bg-slate-100 border-blue-400 text-blue-700' + transition;
  }
  return baseClass + ' bg-white border-slate-200 text-slate-400' + transition;
}

/**
 * 컨트롤 바 (이전/다음/자동재생 + Step 카운터)
 * @param {object} props
 * @param {object} props.controller - useStepController 반환값
 * @param {number} props.totalSteps - 전체 단계 수
 */
function StepControls({ controller, totalSteps }) {
  var currentIdx = controller.currentIdx;
  var isPlaying = controller.isPlaying;
  var isEnd = controller.isEnd;

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        {/* 이전 */}
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

        {/* 자동재생 */}
        <button
          aria-label={isPlaying ? '정지' : '자동 실행'}
          onClick={controller.togglePlay}
          className="flex items-center px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-sm w-28 justify-center text-sm"
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

        {/* 다음 */}
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
 * @param {object} props
 * @param {Array} props.steps - 단계 데이터 배열 (각각 title, desc + 커스텀 필드)
 * @param {function} props.renderDiagram - (stepData, stepIdx, controller) => ReactElement (좌측 패널)
 * @param {function} props.renderDetail - (stepData, stepIdx, controller) => ReactElement (우측 패널, 선택)
 * @param {number} [props.autoPlayInterval=2500] - 자동재생 간격 (ms)
 */
function InteractiveViewer({ steps, renderDiagram, renderDetail, autoPlayInterval }) {
  var controller = useStepController(steps.length, autoPlayInterval || 2500);
  var stepData = steps[controller.currentIdx];

  return (
    <div className="interactive-viewer-wrap">
      {/* 현재 단계 설명 배너 */}
      <div className="bg-blue-700 text-white p-4 rounded-xl shadow-sm border border-blue-800 mb-4">
        <h3 className="text-xs font-bold text-blue-200 mb-1 uppercase tracking-wider">{stepData.title}</h3>
        <p className="text-base font-medium leading-relaxed">{stepData.desc}</p>
      </div>

      {/* 좌우 분할 (모바일: 상하) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* 좌측: 다이어그램 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 min-h-[350px] flex flex-col justify-center">
          {renderDiagram(stepData, controller.currentIdx, controller)}
        </div>

        {/* 우측: 상세 (있을 때만) */}
        {renderDetail && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 min-h-[350px] flex flex-col justify-center">
            {renderDetail(stepData, controller.currentIdx, controller)}
          </div>
        )}
      </div>

      {/* 컨트롤 바 */}
      <StepControls controller={controller} totalSteps={steps.length} />
    </div>
  );
}

// 전역 등록
window.GCPLearn.InteractiveViewer = InteractiveViewer;
window.GCPLearn.useStepController = useStepController;
window.GCPLearn.getStatusClass = getStatusClass;
window.GCPLearn.StepControls = StepControls;
