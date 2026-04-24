/**
 * animations.js
 * 경로: learn/components/animations.js
 * 목적: 스크롤 트리거 애니메이션 프리미티브 (FadeIn, StaggerReveal, ScaleIn)
 * 주요 의존성: React 18 (CDN), IntersectionObserver API
 */
window.GCPLearn = window.GCPLearn || {};

/**
 * FadeIn — 뷰포트 진입 시 아래에서 위로 페이드인
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.delay=0] - 애니메이션 딜레이 (ms)
 * @param {string} [props.className] - 추가 CSS 클래스
 * @param {string} [props.animation='animate-fade-in-up'] - 애니메이션 클래스
 */
window.GCPLearn.FadeIn = function FadeIn({ children, delay = 0, className = '', animation = 'animate-fade-in-up' }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? animation : 'anim-hidden'} ${className}`}
      style={visible && delay > 0 ? { animationDelay: delay + 'ms' } : undefined}
    >
      {children}
    </div>
  );
};

/**
 * StaggerReveal — 자식 요소들을 순차적으로 페이드인
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.baseDelay=0] - 첫 자식 딜레이 (ms)
 * @param {number} [props.interval=200] - 자식 간 딜레이 간격 (ms)
 * @param {string} [props.className] - 컨테이너 CSS 클래스
 * @param {string} [props.animation='animate-fade-in-up'] - 애니메이션 클래스
 */
window.GCPLearn.StaggerReveal = function StaggerReveal({ children, baseDelay = 0, interval = 200, className = '', animation = 'animate-fade-in-up' }) {
  const { FadeIn } = window.GCPLearn;

  return (
    <div className={className}>
      {React.Children.map(children, (child, i) => (
        <FadeIn delay={baseDelay + i * interval} animation={animation}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

/**
 * ScaleIn — 뷰포트 진입 시 스케일업 등장
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.delay=0] - 애니메이션 딜레이 (ms)
 * @param {string} [props.className] - 추가 CSS 클래스
 */
window.GCPLearn.ScaleIn = function ScaleIn({ children, delay = 0, className = '' }) {
  return (
    <window.GCPLearn.FadeIn delay={delay} className={className} animation="animate-scale-in">
      {children}
    </window.GCPLearn.FadeIn>
  );
};
