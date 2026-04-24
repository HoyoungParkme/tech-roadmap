/**
 * III-2-2.js
 * 경로: learn/sections/III-2-2.js
 * 목적: "Billing 알람 설정하기" — Budget Alert 게이지 + 3단계 임계값 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['III-2-2'] = function SectionIII22() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var thresholds = [
    { percent: 50, label: '점검 시간', icon: '💡', color: '#22c55e', bgColor: '#ecfdf5', desc: '리소스를 점검하라는 신호' },
    { percent: 90, label: '정리 경고', icon: '⚠️', color: '#f59e0b', bgColor: '#fffbeb', desc: '불필요한 리소스를 지금 정리하라' },
    { percent: 100, label: '예산 초과', icon: '🚨', color: '#ef4444', bgColor: '#fef2f2', desc: '예산을 넘었다는 최종 알림' },
  ];

  var STEPS = [
    { title: 'STEP 1 — Budget Alert이란?', desc: '설정한 예산에 도달하면 이메일로 알려주는 안전장치입니다. 학습 중 실수로 과금되는 것을 방지합니다. 자동 중지 기능은 아니므로 알림 후 직접 정리해야 합니다.', focus: 'overview', gauge: 0 },
    { title: 'STEP 2 — 💡 50% 점검 알림', desc: '예산의 절반에 도달했습니다. "지금까지 쓴 만큼 남은 기간 동안 쓸 수 있는지" 점검하는 시점입니다. 불필요한 리소스가 있으면 미리 정리합니다.', focus: 0, gauge: 50 },
    { title: 'STEP 3 — ⚠️ 90% 경고 알림', desc: '예산이 거의 소진되었습니다. 사용하지 않는 인스턴스, 오래된 스냅샷 등을 즉시 정리해야 합니다. Budget Alert의 핵심 구간입니다.', focus: 1, gauge: 90 },
    { title: 'STEP 4 — 🚨 100% 초과 + 대응', desc: '예산을 넘었습니다. GCP는 자동으로 서비스를 중지하지 않으므로, 직접 리소스를 삭제하거나 프로젝트를 정리해야 합니다. Billing 페이지에서 비용을 확인하세요.', focus: 2, gauge: 100 },
  ];

  function renderDiagram(stepData) {
    var gauge = stepData.gauge;
    var focus = stepData.focus;

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">월 예산 $50 — 현재 사용량</div>

        {/* 게이지 바 */}
        <div className="w-full relative">
          <div className="h-8 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: Math.min(gauge, 100) + '%',
                background: gauge <= 50 ? '#22c55e' : gauge <= 90 ? 'linear-gradient(to right, #22c55e, #f59e0b)' : 'linear-gradient(to right, #22c55e, #f59e0b, #ef4444)',
              }}></div>
            {/* 마커 */}
            {thresholds.map(function (t) {
              return (
                <div key={t.percent} className="absolute top-0 h-full" style={{ left: t.percent + '%' }}>
                  <div className="h-full border-r-2 border-dashed" style={{ borderColor: t.color }}></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-400">$0</span>
            <span className="font-bold" style={{ color: gauge <= 50 ? '#22c55e' : gauge <= 90 ? '#f59e0b' : '#ef4444' }}>
              ${Math.round(gauge / 2)} / $50
            </span>
          </div>
        </div>

        {/* 3단계 임계값 카드 */}
        <div className="w-full grid grid-cols-3 gap-2">
          {thresholds.map(function (t, i) {
            var isActive = focus !== 'overview' && i === focus;
            var isPassed = gauge >= t.percent;
            return (
              <div key={t.percent} className={'p-2 rounded-lg border-2 text-center transition-all duration-500 ' +
                (isActive ? 'scale-105 ring-2 shadow-sm' : '') +
                (isPassed ? '' : ' opacity-40')}
                style={{ borderColor: isActive ? t.color : t.color + '40', background: t.bgColor, ringColor: t.color + '60' }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <div className="text-lg font-bold" style={{ color: t.color }}>{t.percent}%</div>
                <div className="text-xs font-semibold text-slate-600">{t.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">설정 방법</div>
          <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">Budget Alert 설정 경로</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Console 경로:\n# Billing → Budgets & alerts\n# → CREATE BUDGET\n# → 금액: $10 (학습용)\n# → 임계값: 50%, 90%, 100%\n# → 알림 이메일 확인'}</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>중요</strong>: Budget Alert은 알림만 보냅니다. 자동 중지 기능이 아닙니다!
          </div>
        </div>
      );
    }

    var actions = [
      { title: '50% 도달 시 체크리스트', items: ['현재 활성 리소스 확인', '미사용 인스턴스 존재?', '남은 기간 대비 사용량 적정?', '불필요한 테스트 리소스 정리'] },
      { title: '90% 도달 시 긴급 조치', items: ['미사용 VM 즉시 중지/삭제', 'Cloud Storage 오래된 파일 삭제', '스냅샷/백업 불필요분 정리', '다음 달까지 최소 리소스만 유지'] },
      { title: '100% 초과 시 대응', items: ['Billing → 비용 상세 확인', '과금 원인 리소스 식별', '해당 리소스 즉시 삭제', '다음 달 예산 재설정 검토'] },
    ];

    var action = actions[focus];
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">{action.title}</div>
        <div className="space-y-2">
          {action.items.map(function (item, i) {
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <input type="checkbox" disabled className="rounded" />
                <span className="text-slate-600">{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
