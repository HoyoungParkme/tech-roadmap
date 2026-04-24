/**
 * SectionPage.js
 * 경로: learn/components/SectionPage.js
 * 목적: Section 페이지 공통 레이아웃 — 헤더, 커스텀 애니메이션, 본문, 키워드, 네비게이션
 * 주요 의존성: React 18, GCPLearn.FadeIn, GCPLearn.StaggerReveal, GCPLearn.sectionRenderers
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

/**
 * Section 페이지 컴포넌트
 * @param {object} props
 * @param {object} props.section - Section 데이터 객체 (part-I.js에서 정의)
 * @param {function} props.onNavigate - 네비게이션 콜백
 */
window.GCPLearn.SectionPage = function SectionPage({ section, onNavigate }) {
  const { FadeIn, StaggerReveal } = window.GCPLearn;
  const CustomRenderer = window.GCPLearn.sectionRenderers[section.id];

  // 이전/다음 Section 제목 가져오기
  const getTitle = (id) => {
    const s = window.GCPLearn.sections[id];
    return s ? s.title : '';
  };

  return (
    <div className="content-wrapper">
      {/* 헤더 */}
      <div className="section-header">
        <div className="breadcrumb">
          Part {section.part} &rsaquo; Ch.{section.chapter} {section.chapterTitle} &rsaquo; {section.id}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.3', margin: '8px 0' }}>
          {section.title}
          <span className="difficulty-badge">{section.difficulty}</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          {section.objective}
        </p>
      </div>

      {/* 커스텀 애니메이션 영역 */}
      {CustomRenderer && (
        <FadeIn className="mb-8">
          <CustomRenderer section={section} />
        </FadeIn>
      )}

      {/* 본문 단락 */}
      <div style={{ marginBottom: '32px' }}>
        {section.paragraphs.map((para, i) => (
          <FadeIn key={i} delay={i * 100}>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#333',
              marginBottom: '16px',
            }}>
              {para}
            </p>
          </FadeIn>
        ))}
      </div>

      {/* 코드 블록 (있는 경우) */}
      {section.codeBlocks && section.codeBlocks.map((block, i) => (
        <FadeIn key={i} delay={100}>
          <div style={{
            marginBottom: '24px',
            background: '#1e293b',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #334155',
          }}>
            <div style={{
              padding: '8px 16px',
              background: '#0f172a',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: '8px', fontSize: '12px', color: '#94a3b8' }}>{block.title || block.language}</span>
            </div>
            <pre style={{
              padding: '16px',
              margin: 0,
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#e2e8f0',
              fontFamily: "'Fira Code', 'Consolas', monospace",
              overflowX: 'auto',
            }}>
              <code>{block.code}</code>
            </pre>
          </div>
        </FadeIn>
      ))}

      {/* 키워드 */}
      <FadeIn>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            핵심 키워드
          </h3>
          <StaggerReveal className="flex flex-wrap" interval={100}>
            {section.keywords.map(kw => (
              <span key={kw} className="keyword-pill">{kw}</span>
            ))}
          </StaggerReveal>
        </div>
      </FadeIn>

      {/* 네비게이션 */}
      <div style={{
        display: 'flex',
        justifyContent: section.prevSection ? 'space-between' : 'flex-end',
        gap: '16px',
        paddingTop: '24px',
        borderTop: '1px solid #e2e8f0',
      }}>
        {section.prevSection && (
          <button
            className="nav-button"
            onClick={() => onNavigate(section.prevSection)}
          >
            &larr; {section.prevSection}. {getTitle(section.prevSection)}
          </button>
        )}
        {section.nextSection && window.GCPLearn.sections[section.nextSection] ? (
          <button
            className="nav-button primary"
            onClick={() => onNavigate(section.nextSection)}
          >
            {section.nextSection}. {getTitle(section.nextSection)} &rarr;
          </button>
        ) : section.nextSection ? (
          <span className="nav-button" style={{ opacity: 0.4, cursor: 'default' }}>
            {section.nextSection} (준비 중)
          </span>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Welcome 페이지 컴포넌트
 * @param {object} props
 * @param {function} props.onNavigate - 네비게이션 콜백
 */
window.GCPLearn.WelcomePage = function WelcomePage({ onNavigate }) {
  const { FadeIn, StaggerReveal } = window.GCPLearn;
  const toc = window.GCPLearn.TOC;

  return (
    <div className="content-wrapper">
      <div className="welcome-hero">
        <FadeIn>
          <h1 className="welcome-title">GCP 인터랙티브 학습</h1>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="welcome-subtitle">
            비개발자부터 실무자까지, 한 권으로 올라가는 Google Cloud Platform 학습 자료.
            각 Section마다 개념 이해를 돕는 애니메이션과 함께 학습합니다.
          </p>
        </FadeIn>
        <FadeIn delay={400}>
          <button
            className="welcome-start-btn"
            onClick={() => onNavigate('I-1-1')}
          >
            학습 시작하기 &rarr;
          </button>
        </FadeIn>
        <FadeIn delay={600}>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="../cloud-run-flow.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', border: '2px solid #4361ee',
                borderRadius: '10px', textDecoration: 'none',
                fontSize: '14px', fontWeight: '600', color: '#4361ee',
                background: '#fff',
              }}
            >
              Cloud Run 요청 흐름 시각화 &rarr;
            </a>
            <a
              href="../curriculum-viewer.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', border: '2px solid #e2e8f0',
                borderRadius: '10px', textDecoration: 'none',
                fontSize: '14px', fontWeight: '600', color: '#555',
                background: '#fff',
              }}
            >
              교재 원문 뷰어
            </a>
          </div>
        </FadeIn>
      </div>

      {/* Part 목록 카드 */}
      <StaggerReveal
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12"
        interval={100}
      >
        {toc.map(partData => {
          let total = 0, done = 0;
          partData.chapters.forEach(ch => ch.sections.forEach(s => {
            total++;
            if (s.implemented) done++;
          }));

          return (
            <div
              key={partData.part}
              className="metaphor-card"
              style={{ opacity: done > 0 ? 1 : 0.5 }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#4361ee', marginBottom: '4px' }}>
                PART {partData.part}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
                {partData.title}
              </div>
              <div style={{ fontSize: '13px', color: '#888' }}>
                {done}/{total} Section {done === total && total > 0 ? '완료' : ''}
              </div>
              {done > 0 && (
                <div style={{
                  marginTop: '8px',
                  height: '4px',
                  borderRadius: '2px',
                  background: '#e2e8f0',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: (done / total * 100) + '%',
                    background: '#4361ee',
                    borderRadius: '2px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </StaggerReveal>
    </div>
  );
};
