/**
 * IV-1-3.js — "Cloud Run 배포 옵션" — 4가지 핵심 옵션 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IV-1-3'] = function SectionIV13() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var options = [
    { flag: '--allow-unauthenticated', desc: '공개 API — 누구나 호출 가능', icon: '🔓', color: '#10b981', detail: '인증 없이 접근 가능. 공개 웹사이트, 퍼블릭 API에 사용. 내부 서비스에는 사용하지 마세요.' },
    { flag: '--concurrency 80', desc: '인스턴스당 동시 요청 수 제한', icon: '📊', color: '#3b82f6', detail: '기본값 80. CPU 집약적 작업은 낮추고, I/O 대기가 많으면 높여도 됩니다.' },
    { flag: '--memory 512Mi', desc: '인스턴스 메모리 크기 설정', icon: '💾', color: '#8b5cf6', detail: '기본 256Mi. 이미지 처리 등 메모리를 많이 쓰는 작업은 1Gi~2Gi로 올립니다.' },
    { flag: '--min-instances 1', desc: '콜드 스타트 방지 (항상 1개 유지)', icon: '⚡', color: '#f59e0b', detail: '기본 0 (Scale to Zero). 응답 속도가 중요한 서비스는 1로 설정. 비용은 조금 발생합니다.' },
  ];

  var STEPS = [
    { title: 'STEP 1 — 배포 옵션 개요', desc: 'Cloud Run 배포 시 설정할 수 있는 핵심 옵션 4가지입니다. 기본값으로도 충분하지만, 서비스 특성에 맞게 조정하면 성능과 비용을 최적화할 수 있습니다.', focus: 'overview' },
    { title: 'STEP 2 — 🔓 인증 설정', desc: options[0].detail, focus: 0 },
    { title: 'STEP 3 — 📊 동시성 + 💾 메모리', desc: '동시 요청 수와 메모리는 성능에 직결됩니다. ' + options[1].detail, focus: 1 },
    { title: 'STEP 4 — ⚡ 콜드 스타트 방지', desc: options[3].detail, focus: 3 },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;
    return (
      <div className="space-y-2">
        {options.map(function (o, i) {
          var isActive = focus === 'overview' || i === focus || (focus === 1 && i === 2);
          return (
            <div key={o.flag} className={'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-500 ' +
              (isActive && focus !== 'overview' ? 'scale-105 ring-2 shadow-sm' : '')}
              style={{ borderColor: isActive ? o.color + '80' : '#e2e8f0', background: isActive ? o.color + '10' : 'white' }}>
              <span style={{ fontSize: '24px' }}>{o.icon}</span>
              <div>
                <code className="text-xs font-bold" style={{ color: isActive ? o.color : '#94a3b8' }}>{o.flag}</code>
                <div className="text-xs text-slate-500 mt-0.5">{o.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;
    if (focus === 'overview') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">배포 명령어 전체</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400">gcloud CLI</div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'gcloud run deploy my-api \\\n  --image gcr.io/proj/my-api \\\n  --region asia-northeast3 \\\n  --allow-unauthenticated \\\n  --concurrency 80 \\\n  --memory 512Mi \\\n  --min-instances 1'}</div>
          </div>
        </div>
      );
    }
    var tips = [
      { title: '인증 옵션', code: '# 공개 (누구나)\n--allow-unauthenticated\n\n# 비공개 (IAM 필요)\n--no-allow-unauthenticated\n\n# 내부 서비스 간 호출:\n# Service Account + IAM 역할' },
      { title: '성능 튜닝', code: '# 동시 요청 수 (기본 80)\n--concurrency 80\n# CPU 집약 → 10~20\n# I/O 대기 → 100~200\n\n# 메모리 (기본 256Mi)\n--memory 512Mi\n# 이미지 처리 → 1Gi\n# ML 추론 → 2Gi~4Gi' },
      {},
      { title: '콜드 스타트 방지', code: '# Scale to Zero (기본, 비용 $0)\n--min-instances 0\n\n# 항상 1개 유지 (빠른 응답)\n--min-instances 1\n# → 월 ~$10 추가 비용\n\n# 최대 인스턴스 제한\n--max-instances 10' },
    ];
    var tip = tips[focus];
    if (!tip || !tip.code) return null;
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">{tip.title}</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400">Terminal</div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{tip.code}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
