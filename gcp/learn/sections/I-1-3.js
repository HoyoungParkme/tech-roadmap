/**
 * I-1-3.js
 * 경로: learn/sections/I-1-3.js
 * 목적: "IaaS / PaaS / SaaS" — 5단계 인터랙티브 시각화 (책임 스택 다이어그램)
 * 주요 의존성: InteractiveViewer, getStatusClass
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['I-1-3'] = function SectionI13() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  // ─── 6층 책임 스택 정의 (아래→위: 인프라→앱) ───
  var LAYERS = [
    { id: 'network',    label: 'Network',           icon: '🌐' },
    { id: 'storage',    label: 'Storage',            icon: '💾' },
    { id: 'server',     label: 'Servers',            icon: '🖥️' },
    { id: 'os',         label: 'OS',                 icon: '⚙️' },
    { id: 'middleware',  label: 'Middleware/Runtime', icon: '🔧' },
    { id: 'app',        label: 'Application',        icon: '📱' },
  ];

  // 각 모델에서 사용자가 관리하는 레이어 (나머지는 클라우드)
  var USER_MANAGES = {
    iaas:  ['os', 'middleware', 'app'],
    paas:  ['app'],
    saas:  [],
  };

  // 모델 메타데이터
  var MODELS = {
    iaas: { type: 'IaaS', name: 'Infrastructure as a Service', pizza: '밀가루부터 직접 굽기', icon: '🫓', gcp: 'Compute Engine', color: '#ef4444', bgColor: '#fef2f2' },
    paas: { type: 'PaaS', name: 'Platform as a Service',       pizza: '피자 키트 — 토핑만',   icon: '🍕', gcp: 'Cloud Run',      color: '#f59e0b', bgColor: '#fffbeb' },
    saas: { type: 'SaaS', name: 'Software as a Service',       pizza: '완성 피자 배달',       icon: '📦', gcp: 'Gmail, Docs',    color: '#3b82f6', bgColor: '#eff6ff' },
  };

  // ─── 5단계 STEPS ───
  var STEPS = [
    {
      title: 'STEP 1 — 피자 비유로 이해하기',
      desc: '클라우드 서비스를 "피자를 먹는 방법"으로 비유합니다. 밀가루부터 직접 굽기(IaaS), 피자 키트로 토핑만 올리기(PaaS), 완성 피자 주문(SaaS). 세 가지 방식 모두 "피자를 먹는다"는 목적은 같지만, 내가 해야 할 일의 양이 다릅니다.',
      focusModel: 'overview',
    },
    {
      title: 'STEP 2 — IaaS: 밀가루부터 직접 굽기',
      desc: 'Infrastructure as a Service. VM을 빌려서 OS, 미들웨어, 런타임, 앱까지 직접 설치하고 관리합니다. 자유도가 높지만 관리 부담도 큽니다. GCP에서는 Compute Engine이 대표적인 IaaS입니다.',
      focusModel: 'iaas',
    },
    {
      title: 'STEP 3 — PaaS: 토핑만 올리기',
      desc: 'Platform as a Service. 인프라와 런타임은 플랫폼이 관리하고, 개발자는 코드(Application)만 올립니다. 서버 관리가 불필요하고 스케일링도 자동입니다. GCP Cloud Run이 대표적인 PaaS입니다.',
      focusModel: 'paas',
    },
    {
      title: 'STEP 4 — SaaS: 완성 피자 배달',
      desc: 'Software as a Service. 설치도 설정도 없이 브라우저에서 바로 사용합니다. 인프라부터 앱까지 모든 것을 클라우드 제공자가 관리합니다. Gmail, Google Docs가 대표적인 SaaS입니다.',
      focusModel: 'saas',
    },
    {
      title: 'STEP 5 — 관리 범위 한눈에 비교',
      desc: '통제권이 높을수록 자유롭지만 관리 부담도 커집니다. IaaS는 6층 중 3층을 직접 관리하고, PaaS는 1층만, SaaS는 0층입니다. 팀 규모와 서비스 특성에 따라 적절한 모델을 선택합니다.',
      focusModel: 'comparison',
    },
  ];

  // ─── 단일 모델 스택 렌더링 ───
  function renderStack(modelKey, isActive, showLabel) {
    var model = MODELS[modelKey];
    var userLayers = USER_MANAGES[modelKey];
    var reversedLayers = LAYERS.slice().reverse(); // 위→아래: App → Network

    return (
      <div className={'flex flex-col items-center ' + (isActive ? '' : '')}>
        {/* 모델 헤더 */}
        {showLabel && (
          <div className={'text-center mb-2 transition-all duration-500 ' + (isActive ? 'scale-105' : 'scale-100')}>
            <span style={{ fontSize: '28px' }}>{model.icon}</span>
            <div className="text-sm font-bold mt-1" style={{ color: model.color }}>{model.type}</div>
            <div className="text-xs text-slate-400">{model.pizza}</div>
          </div>
        )}

        {/* 6층 스택 */}
        <div className="w-full space-y-1">
          {reversedLayers.map(function (layer) {
            var isUserManaged = userLayers.indexOf(layer.id) !== -1;
            var layerState = isActive
              ? (isUserManaged ? 'highlight' : 'active')
              : 'idle';

            var baseClass = 'px-3 py-2 rounded border-2 text-center text-xs font-medium';
            var stateClass;

            if (!isActive) {
              stateClass = baseClass + ' bg-slate-50 border-slate-200 text-slate-400 transition-all duration-500';
            } else if (isUserManaged) {
              stateClass = baseClass + ' bg-red-50 border-red-400 text-red-700 ring-1 ring-red-200 shadow transition-all duration-500';
            } else {
              stateClass = baseClass + ' bg-blue-50 border-blue-300 text-blue-600 transition-all duration-500';
            }

            return (
              <div key={layer.id} className={stateClass}>
                <span className="mr-1">{layer.icon}</span>
                {layer.label}
                {isActive && (
                  <span className="ml-1 text-xs opacity-70">
                    {isUserManaged ? '(직접 관리)' : '(클라우드)'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* GCP 서비스 매핑 */}
        {showLabel && (
          <div className="mt-2 text-xs font-semibold px-3 py-1 rounded-full transition-all duration-500"
            style={{ background: isActive ? model.bgColor : '#f8fafc', color: isActive ? model.color : '#94a3b8' }}>
            GCP: {model.gcp}
          </div>
        )}
      </div>
    );
  }

  // ─── 좌측 패널: 다이어그램 ───
  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focusModel;

    if (focus === 'overview' || focus === 'comparison') {
      // 3열 동시 표시
      return (
        <div>
          <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {focus === 'overview' ? '세 가지 서비스 모델' : '관리 범위 비교'}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['iaas', 'paas', 'saas'].map(function (key) {
              return (
                <div key={key}>
                  {renderStack(key, focus === 'comparison', true)}
                </div>
              );
            })}
          </div>
          {/* 범례 */}
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-50 border border-red-400"></div>
              <span className="text-slate-500">직접 관리</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-50 border border-blue-300"></div>
              <span className="text-slate-500">클라우드 관리</span>
            </div>
          </div>
          {/* 그라데이션 바 (비교 모드) */}
          {focus === 'comparison' && (
            <div className="mt-3">
              <div style={{ height: '6px', borderRadius: '3px', background: 'linear-gradient(to right, #ef4444, #f59e0b, #3b82f6)' }}></div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>통제권 높음</span>
                <span>편의성 높음</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 단일 모델 포커스 (IaaS / PaaS / SaaS)
    var model = MODELS[focus];
    return (
      <div className="flex flex-col items-center">
        <div className="text-center mb-3">
          <span style={{ fontSize: '40px' }}>{model.icon}</span>
          <h3 className="text-lg font-bold mt-1" style={{ color: model.color }}>{model.type}</h3>
          <div className="text-xs text-slate-400">{model.name}</div>
          <div className="text-sm text-slate-500 mt-1">"{model.pizza}"</div>
        </div>
        <div className="w-64">
          {renderStack(focus, true, false)}
        </div>
        {/* 관리 항목 수 카운터 */}
        <div className="mt-3 text-center">
          <div className="text-2xl font-bold" style={{ color: model.color }}>
            {USER_MANAGES[focus].length} <span className="text-sm font-normal text-slate-400">/ 6 레이어 직접 관리</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── 우측 패널: 상세 정보 ───
  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focusModel;

    // STEP 1: 피자 비유 카드
    if (focus === 'overview') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">피자 비유</div>
          <div className="space-y-3">
            {['iaas', 'paas', 'saas'].map(function (key) {
              var m = MODELS[key];
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span style={{ fontSize: '32px' }}>{m.icon}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: m.color }}>{m.type}</div>
                    <div className="text-xs text-slate-500">{m.pizza}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // STEP 5: 비교 요약
    if (focus === 'comparison') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">비교 요약</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500 font-medium">항목</th>
                <th className="py-2 text-center font-bold text-red-500">IaaS</th>
                <th className="py-2 text-center font-bold text-amber-500">PaaS</th>
                <th className="py-2 text-center font-bold text-blue-500">SaaS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">통제권</td>
                <td className="py-2 text-center">높음</td>
                <td className="py-2 text-center">중간</td>
                <td className="py-2 text-center">낮음</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">편의성</td>
                <td className="py-2 text-center">낮음</td>
                <td className="py-2 text-center">높음</td>
                <td className="py-2 text-center">최고</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">관리 레이어</td>
                <td className="py-2 text-center font-bold text-red-500">3/6</td>
                <td className="py-2 text-center font-bold text-amber-500">1/6</td>
                <td className="py-2 text-center font-bold text-blue-500">0/6</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-600">GCP 서비스</td>
                <td className="py-2 text-center text-xs">Compute Engine</td>
                <td className="py-2 text-center text-xs">Cloud Run</td>
                <td className="py-2 text-center text-xs">Gmail, Docs</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>핵심</strong>: 통제권과 편의성은 반비례합니다. 프로젝트 요구사항에 맞는 모델을 선택하세요.
          </div>
        </div>
      );
    }

    // STEP 2-4: 개별 모델 상세
    var model = MODELS[focus];
    var userLayers = USER_MANAGES[focus];
    var cliExamples = {
      iaas: { title: 'VM 인스턴스 생성', code: 'gcloud compute instances create my-vm \\\n  --machine-type e2-medium \\\n  --zone asia-northeast3-a \\\n  --image-family debian-11' },
      paas: { title: 'Cloud Run 배포', code: 'gcloud run deploy my-api \\\n  --image gcr.io/myproject/my-api \\\n  --region asia-northeast3 \\\n  --allow-unauthenticated' },
      saas: { title: '브라우저 접속', code: 'https://mail.google.com\nhttps://docs.google.com\n\n# 설치 없음, 설정 없음\n# 브라우저에서 바로 사용' },
    };

    var cli = cliExamples[focus];
    var items = {
      iaas: ['OS 설치 및 패치', '미들웨어 설정 (Nginx 등)', '런타임 설치 (Node.js 등)', '앱 배포 및 관리'],
      paas: ['코드(컨테이너)만 올리면 끝', '서버·OS·런타임 관리 불필요', '트래픽에 따라 자동 스케일링'],
      saas: ['설치 없음', '설정 없음', '업데이트 자동', '브라우저에서 바로 사용'],
    };

    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">{model.type} 상세</div>

        {/* 관리 항목 */}
        <div className="mb-3">
          <div className="text-xs font-semibold text-slate-500 mb-1">
            {userLayers.length > 0 ? '내가 해야 할 일' : '해야 할 일: 없음!'}
          </div>
          <div className="space-y-1">
            {items[focus].map(function (item, i) {
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span style={{ color: model.color }}>&#8226;</span>
                  <span className="text-slate-600">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CLI 예시 */}
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">{cli.title}</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
            {cli.code}
          </div>
        </div>

        {/* GCP 서비스 배지 */}
        <div className="mt-3 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: model.bgColor, color: model.color }}>
            GCP: {model.gcp}
          </span>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
