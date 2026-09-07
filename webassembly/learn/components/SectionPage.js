/**
 * SectionPage.js
 * 경로: webassembly/learn/components/SectionPage.js
 * 목적: Section 페이지 공통 레이아웃 — 헤더, 커스텀 애니메이션, 본문, 키워드, 네비게이션
 * 주요 의존성: React 18, WasmLearn.FadeIn, WasmLearn.StaggerReveal, WasmLearn.sectionRenderers
 */
window.WasmLearn = window.WasmLearn || {};
window.WasmLearn.sectionRenderers = window.WasmLearn.sectionRenderers || {};

window.WasmLearn.SectionPage = function SectionPage({ section, onNavigate }) {
  const { FadeIn, StaggerReveal } = window.WasmLearn;
  const CustomRenderer = window.WasmLearn.sectionRenderers[section.id];

  const getTitle = (id) => {
    const s = window.WasmLearn.sections[id];
    return s ? s.title : '';
  };

  return (
    <div className="content-wrapper">
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

      {CustomRenderer && (
        <FadeIn className="mb-8">
          <CustomRenderer section={section} />
        </FadeIn>
      )}

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
        {section.nextSection && window.WasmLearn.sections[section.nextSection] ? (
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

window.WasmLearn.WelcomePage = function WelcomePage({ onNavigate }) {
  const { FadeIn, StaggerReveal } = window.WasmLearn;
  const toc = window.WasmLearn.TOC;

  return (
    <div className="content-wrapper">
      <div className="welcome-hero">
        <FadeIn>
          <h1 className="welcome-title">WebAssembly 인터랙티브 학습</h1>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="welcome-subtitle">
            JS 개발자도, 시스템 개발자도 — wasm 모듈의 구조부터 Rust·C·Go 컴파일까지.
            각 Section마다 개념 이해를 돕는 시각화와 함께 학습합니다.
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
      </div>

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
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#654FF0', marginBottom: '4px' }}>
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
                    background: '#654FF0',
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
