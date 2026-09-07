/**
 * Sidebar.js
 * 경로: webassembly/learn/components/Sidebar.js
 * 목적: 왼쪽 사이드바 — 전체 목차 트리, 현재 페이지 하이라이트, 모바일 토글
 * 주요 의존성: React 18 (CDN), WasmLearn.TOC, WasmLearn.APPENDIX
 */
window.WasmLearn = window.WasmLearn || {};

window.WasmLearn.Sidebar = function Sidebar({ currentId, onNavigate, isOpen, onClose }) {
  const toc = window.WasmLearn.TOC;
  const appendix = window.WasmLearn.APPENDIX || [];

  const currentPart = currentId ? currentId.split('-')[0] : 'I';
  const [openParts, setOpenParts] = React.useState({ [currentPart]: true });

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
        <div className="sidebar-title">WebAssembly 학습</div>

        {toc.map(partData => {
          const isPartOpen = openParts[partData.part];
          const { total, done } = countImplemented(partData);

          return (
            <div key={partData.part}>
              <div
                className="sidebar-part"
                onClick={() => togglePart(partData.part)}
              >
                <span className={`sidebar-part-arrow ${isPartOpen ? 'open' : ''}`}>&#9654;</span>
                Part {partData.part}. {partData.title}
                {done > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#a78bfa' }}>
                    {done}/{total}
                  </span>
                )}
              </div>

              {isPartOpen && partData.chapters.map(ch => (
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
      </div>

      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
    </>
  );
};
