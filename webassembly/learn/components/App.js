/**
 * App.js
 * 경로: webassembly/learn/components/App.js
 * 목적: 루트 컴포넌트 — Hash Router, 레이아웃, 모바일 사이드바 토글
 * 주요 의존성: React 18, WasmLearn.Sidebar, WasmLearn.SectionPage, WasmLearn.WelcomePage
 */
window.WasmLearn = window.WasmLearn || {};

window.WasmLearn.App = function App() {
  const { Sidebar, SectionPage, WelcomePage } = window.WasmLearn;

  const getIdFromHash = () => {
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') return '';
    return hash.replace('#/', '').replace('#', '');
  };

  const [currentId, setCurrentId] = React.useState(getIdFromHash);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const mainRef = React.useRef(null);

  React.useEffect(() => {
    const onHashChange = () => {
      setCurrentId(getIdFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentId]);

  const navigate = (id) => {
    window.location.hash = '#/' + id;
  };

  const section = currentId ? window.WasmLearn.sections[currentId] : null;

  return (
    <div className="layout">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="메뉴 열기"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <Sidebar
        currentId={currentId}
        onNavigate={navigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content" ref={mainRef}>
        {section ? (
          <SectionPage
            key={currentId}
            section={section}
            onNavigate={navigate}
          />
        ) : (
          <WelcomePage onNavigate={navigate} />
        )}
      </div>
    </div>
  );
};
