/**
 * VII-2-1.js
 * 경로: learn/sections/VII-2-1.js
 * 목적: "비용 최적화 튜닝" — Cloud Run 비용 절감 플래그 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VII-2-1'] = function SectionVII21() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var tips = [
    { flag: '--min-instances 0', desc: '트래픽 없으면 비용 0 (콜드 스타트 감수)', icon: '💤', color: '#10b981', saving: '최대 90%' },
    { flag: '--memory 128Mi', desc: '가벼운 API는 128MiB로 절감', icon: '💾', color: '#3b82f6', saving: '최대 75%' },
    { flag: '--cpu-throttling', desc: '요청 처리 중에만 CPU 할당', icon: '⚡', color: '#f59e0b', saving: '최대 50%' },
    { flag: '--max-instances 10', desc: '인스턴스 폭증 방지', icon: '🔒', color: '#ef4444', saving: '비용 상한선' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — Cloud Run 비용 구조',
      desc: 'Cloud Run은 CPU, 메모리, 요청 수에 따라 과금됩니다. "사용한 만큼만" 과금되지만, 설정을 잘못하면 불필요한 비용이 발생합니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — 핵심 절감 플래그',
      desc: '--min-instances, --memory, --cpu-throttling, --max-instances 4가지 플래그로 비용을 크게 줄일 수 있습니다.',
      focus: 'flags'
    },
    {
      title: 'STEP 3 — 시나리오별 설정',
      desc: '서비스 특성에 따라 최적 설정이 다릅니다. 개발용 API, 프로덕션 API, 배치 작업 각각의 권장 설정을 알아봅니다.',
      focus: 'scenarios'
    },
    {
      title: 'STEP 4 — 비용 모니터링',
      desc: '설정 후에는 실제 비용을 모니터링해야 합니다. Billing 알림, 예산 설정으로 예상치 못한 비용 폭증을 방지합니다.',
      focus: 'monitoring'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      var costs = [
        { item: 'CPU', price: '$0.00002400/vCPU-초', icon: '⚙️' },
        { item: 'Memory', price: '$0.00000250/GiB-초', icon: '💾' },
        { item: 'Requests', price: '$0.40/백만 요청', icon: '📊' }
      ];
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '48px' }}>💰</span>
          <div className="text-lg font-bold text-green-600">사용한 만큼만 과금</div>
          <div className="space-y-2 w-full">
            {costs.map(function (c) {
              return (
                <div key={c.item} className={getStatusClass('done', 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <span style={{ fontSize: '24px' }}>{c.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-700">{c.item}</div>
                    <div className="text-xs text-slate-500">{c.price}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'flags') {
      return (
        <div className="space-y-3">
          {tips.map(function (t) {
            return (
              <div key={t.flag} className={getStatusClass('active', 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                <span style={{ fontSize: '24px' }}>{t.icon}</span>
                <div className="flex-1">
                  <code className="text-xs font-bold" style={{ color: t.color }}>{t.flag}</code>
                  <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
                </div>
                <div className="text-xs font-bold px-2 py-1 rounded" style={{ background: t.color + '15', color: t.color }}>{t.saving}</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'scenarios') {
      var scenarios = [
        {
          name: '개발 API', icon: '🧪', color: '#22c55e',
          settings: ['--min-instances 0', '--memory 128Mi', '--cpu-throttling']
        },
        {
          name: '프로덕션 API', icon: '🏭', color: '#ef4444',
          settings: ['--min-instances 1', '--memory 512Mi', '--max-instances 10']
        },
        {
          name: '배치 작업', icon: '📦', color: '#3b82f6',
          settings: ['--min-instances 0', '--memory 1Gi', '--timeout 3600']
        }
      ];
      return (
        <div className="space-y-3">
          {scenarios.map(function (s) {
            return (
              <div key={s.name} className={getStatusClass('active', 'p-4 rounded-lg border-2')}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                  <div className="text-sm font-bold" style={{ color: s.color }}>{s.name}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.settings.map(function (set) {
                    return (
                      <code key={set} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{set}</code>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // monitoring
    var alertItems = [
      { icon: '📧', label: '예산 알림 설정', desc: '월 $50 초과 시 이메일', state: 'active' },
      { icon: '📊', label: 'Billing 대시보드', desc: '일별 비용 추이 확인', state: 'done' },
      { icon: '🔔', label: '비정상 과금 알림', desc: '갑자기 비용 급증 시 알림', state: 'highlight' }
    ];
    return (
      <div className="space-y-3">
        {alertItems.map(function (a) {
          return (
            <div key={a.label} className={getStatusClass(a.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
              <span style={{ fontSize: '24px' }}>{a.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-700">{a.label}</div>
                <div className="text-xs text-slate-500">{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">비용 절감 핵심</div>
          <div className="space-y-3">
            {[
              { q: '기본 원칙', a: '필요한 리소스만 할당, 쓰지 않으면 0원' },
              { q: '콜드 스타트', a: 'min-instances 0이면 첫 요청이 느림 (1~3초)' },
              { q: '무료 할당', a: '매월 200만 요청, 36만 vCPU-초 무료' },
              { q: '주의점', a: '메모리 부족 → OOM 에러 → 과도한 재시작 비용' }
            ].map(function (item) {
              return (
                <div key={item.q} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-semibold text-slate-700">{item.q}</div>
                  <div className="text-xs text-slate-500 mt-1">{item.a}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'flags') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">비용 절감 배포 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 비용 최적화 배포\ngcloud run deploy my-api \\\n  --image=...my-api:latest \\\n  --min-instances=0 \\\n  --max-instances=10 \\\n  --memory=256Mi \\\n  --cpu=1 \\\n  --cpu-throttling \\\n  --region=asia-northeast3'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'scenarios') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">월 비용 예측 (예시)</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">시나리오</th>
                <th className="py-2 text-right text-slate-500">기본 설정</th>
                <th className="py-2 text-right text-slate-500">최적화</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['개발 API', '$15', '$2'],
                ['프로덕션 (소규모)', '$50', '$20'],
                ['프로덕션 (중규모)', '$200', '$80']
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-700 text-xs">{row[0]}</td>
                    <td className="py-2 text-right text-xs text-red-500">{row[1]}</td>
                    <td className="py-2 text-right text-xs text-green-600 font-bold">{row[2]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-slate-400 text-center">* 실제 비용은 사용 패턴에 따라 다릅니다</div>
        </div>
      );
    }

    // monitoring
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">예산 알림 설정</div>
        <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud CLI</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 예산 생성 (월 $50)\ngcloud billing budgets create \\\n  --billing-account=ACCOUNT_ID \\\n  --display-name="Cloud Run Budget" \\\n  --budget-amount=50USD \\\n  --threshold-rule=percent=0.5 \\\n  --threshold-rule=percent=0.8 \\\n  --threshold-rule=percent=1.0'}</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-xs text-green-700">
          <strong>핵심</strong>: 50%, 80%, 100% 도달 시 알림을 받으면 비용 폭증을 사전에 방지할 수 있습니다.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
