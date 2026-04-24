/**
 * App.js
 * 경로: learn/components/App.js
 * 목적: 루트 컴포넌트 — Hash Router, 레이아웃, 모바일 사이드바 토글
 * 주요 의존성: React 18, GCPLearn.Sidebar, GCPLearn.SectionPage, GCPLearn.WelcomePage
 */
window.GCPLearn = window.GCPLearn || {};

window.GCPLearn.App = function App() {
  const { Sidebar, SectionPage, WelcomePage } = window.GCPLearn;

  // Hash에서 Section ID 추출 (#/I-1-1 → "I-1-1")
  const getIdFromHash = () => {
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') return '';
    return hash.replace('#/', '').replace('#', '');
  };

  const [currentId, setCurrentId] = React.useState(getIdFromHash);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const mainRef = React.useRef(null);

  // Hash 변경 감지
  React.useEffect(() => {
    const onHashChange = () => {
      setCurrentId(getIdFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // 페이지 전환 시 스크롤 맨 위로
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentId]);

  // 네비게이션 함수
  const navigate = (id) => {
    window.location.hash = '#/' + id;
  };

  // 현재 Section 데이터
  const section = currentId ? window.GCPLearn.sections[currentId] : null;

  return (
    <div className="layout">
      {/* 모바일 토글 버튼 */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="메뉴 열기"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* 사이드바 */}
      <Sidebar
        currentId={currentId}
        onNavigate={navigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 메인 콘텐츠 */}
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
