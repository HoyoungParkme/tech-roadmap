/**
 * Sidebar.js
 * 경로: learn/components/Sidebar.js
 * 목적: 왼쪽 사이드바 — 전체 목차 트리, 현재 페이지 하이라이트, 모바일 토글
 * 주요 의존성: React 18 (CDN), GCPLearn.TOC, GCPLearn.APPENDIX
 */
window.GCPLearn = window.GCPLearn || {};

/**
 * 사이드바 컴포넌트
 * @param {object} props
 * @param {string} props.currentId - 현재 활성 Section ID
 * @param {function} props.onNavigate - Section 클릭 시 콜백
 * @param {boolean} props.isOpen - 모바일 사이드바 열림 상태
 * @param {function} props.onClose - 모바일 사이드바 닫기 콜백
 */
window.GCPLearn.Sidebar = function Sidebar({ currentId, onNavigate, isOpen, onClose }) {
  const toc = window.GCPLearn.TOC;
  const appendix = window.GCPLearn.APPENDIX;

  // 현재 Section이 속한 Part를 기본 열림 상태로
  const currentPart = currentId ? currentId.split('-')[0] : 'I';
  const [openParts, setOpenParts] = React.useState({ [currentPart]: true });

  // currentId가 바뀌면 해당 Part를 자동으로 열기
  React.useEffect(() => {
    if (currentId) {
      const part = currentId.split('-')[0];
      setOpenParts(prev => ({ ...prev, [part]: true }));
    }
  }, [currentId]);

  const togglePart = (part) => {
    setOpenParts(prev => ({ ...prev, [part]: !prev[part] }));
  };

  const handleClick = (id, implemented) => {
    if (!implemented) return;
    onNavigate(id);
    if (onClose) onClose();
  };

  // 구현된 Section 수 계산
  const countImplemented = (partData) => {
    let total = 0, done = 0;
    partData.chapters.forEach(ch => {
      ch.sections.forEach(s => {
        total++;
        if (s.implemented) done++;
      });
    });
    return { total, done };
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-title">GCP 인터랙티브 학습</div>

        {toc.map(partData => {
          const isOpen = openParts[partData.part];
          const { total, done } = countImplemented(partData);

          return (
            <div key={partData.part}>
              <div
                className="sidebar-part"
                onClick={() => togglePart(partData.part)}
              >
                <span className={`sidebar-part-arrow ${isOpen ? 'open' : ''}`}>&#9654;</span>
                Part {partData.part}. {partData.title}
                {done > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#4cc9f0' }}>
                    {done}/{total}
                  </span>
                )}
              </div>

              {isOpen && partData.chapters.map(ch => (
                <div key={`${partData.part}-${ch.chapter}`}>
                  {partData.chapters.length > 1 && (
                    <div className="sidebar-chapter">
                      Ch.{ch.chapter} {ch.title}
                    </div>
                  )}
                  {ch.sections.map(s => (
                    <div
                      key={s.id}
                      className={`sidebar-section ${s.id === currentId ? 'active' : ''} ${!s.implemented ? 'disabled' : ''}`}
                      onClick={() => handleClick(s.id, s.implemented)}
                    >
                      {s.id}. {s.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}

        {/* 부록 */}
        <div
          className="sidebar-part"
          onClick={() => togglePart('appendix')}
          style={{ marginTop: '8px' }}
        >
          <span className={`sidebar-part-arrow ${openParts.appendix ? 'open' : ''}`}>&#9654;</span>
          부록
        </div>
        {openParts.appendix && appendix.map(a => (
          <div
            key={a.id}
            className={`sidebar-section ${!a.implemented ? 'disabled' : ''}`}
          >
            부록 {a.id}. {a.title}
          </div>
        ))}
      </div>

      {/* 모바일 오버레이 */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
    </>
  );
};
