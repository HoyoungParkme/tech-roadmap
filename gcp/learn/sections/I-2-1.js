/**
 * I-2-1.js
 * 경로: learn/sections/I-2-1.js
 * 목적: "클라우드 비용 구조 이해하기" — 종량제 + Free Tier + Budget Alert + Scale to Zero 4단계
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['I-2-1'] = function SectionI21() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var STEPS = [
    {
      title: 'STEP 1 — 종량제 (Pay-as-you-go)',
      desc: '전기를 쓴 만큼 요금이 나오는 것처럼, 클라우드도 사용한 만큼만 비용이 발생합니다. 쓰지 않으면 비용이 멈춥니다. 이것이 클라우드 비용의 핵심 원리입니다.',
      focus: 'paygo',
    },
    {
      title: 'STEP 2 — 🎁 Free Tier',
      desc: 'GCP 신규 가입 시 $300 크레딧(90일)을 줍니다. 일부 서비스는 "Always Free"로 영구 무료 한도가 있습니다. 학습과 PoC에 충분한 양입니다.',
      focus: 'freetier',
    },
    {
      title: 'STEP 3 — 🔔 Budget Alert',
      desc: '설정 금액에 근접하면 이메일 알림이 옵니다. 예상치 못한 청구를 사전에 차단할 수 있습니다. 학습 중 실수로 과금되는 것을 방지하는 안전장치입니다.',
      focus: 'budget',
    },
    {
      title: 'STEP 4 — 📉 Scale to Zero',
      desc: 'Cloud Run은 요청이 없으면 인스턴스를 0으로 줄입니다. 인스턴스 0 = 비용 0. "끄면 안 내도 된다"는 원리로, 학습/실험 시 비용 걱정이 없습니다.',
      focus: 'scalezero',
    },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'paygo') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '56px' }}>⚡</span>
          <h3 className="text-lg font-bold text-purple-600">종량제</h3>
          <div className="w-full flex items-end justify-center gap-3" style={{ height: '120px' }}>
            {[20, 45, 80, 60, 30, 10].map(function (h, i) {
              var months = ['1월', '2월', '3월', '4월', '5월', '6월'];
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-10 rounded-t transition-all duration-500"
                    style={{ height: h + 'px', background: 'linear-gradient(to top, #7c3aed, #a78bfa)' }}>
                  </div>
                  <div className="text-xs text-slate-400">{months[i]}</div>
                </div>
              );
            })}
          </div>
          <div className="text-sm text-slate-500 text-center">사용량에 따라 매월 비용이 다릅니다</div>
        </div>
      );
    }

    if (focus === 'freetier') {
      return (
        <div className="flex flex-col items-center gap-3">
          <span style={{ fontSize: '48px' }}>🎁</span>
          <h3 className="text-lg font-bold text-green-600">Free Tier</h3>
          <div className="w-full space-y-2">
            {[
              { label: '$300 크레딧', sub: '90일간 자유롭게 사용', bar: 100, color: '#10b981' },
              { label: 'Cloud Run', sub: '200만 요청/월 무료', bar: 70, color: '#06b6d4' },
              { label: 'Cloud Storage', sub: '5GB 무료', bar: 40, color: '#8b5cf6' },
              { label: 'Compute Engine', sub: 'e2-micro 1대 무료', bar: 30, color: '#f59e0b' },
            ].map(function (item) {
              return (
                <div key={item.label} className="bg-white rounded-lg border border-slate-200 p-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="text-slate-400">{item.sub}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: item.bar + '%', background: item.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'budget') {
      return (
        <div className="flex flex-col items-center gap-3">
          <span style={{ fontSize: '48px' }}>🔔</span>
          <h3 className="text-lg font-bold text-amber-600">Budget Alert</h3>
          <div className="w-full">
            {/* 게이지 바 */}
            <div className="relative w-full h-8 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
                style={{ width: '72%' }}></div>
              <div className="absolute top-0 h-full border-r-2 border-dashed border-red-500" style={{ left: '80%' }}></div>
              <div className="absolute top-0 right-0 h-full flex items-center pr-2">
                <span className="text-xs font-bold text-slate-500">$100</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>$0</span>
              <span className="text-amber-600 font-bold">현재: $72</span>
              <span className="text-red-500 font-bold">예산: $80</span>
            </div>

            {/* 알림 단계 */}
            <div className="mt-4 space-y-2">
              {[
                { pct: '50%', status: '정보', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                { pct: '80%', status: '경고', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                { pct: '100%', status: '초과', color: 'bg-red-100 text-red-700 border-red-200' },
              ].map(function (a) {
                return (
                  <div key={a.pct} className={'flex items-center gap-2 p-2 rounded-lg border text-xs font-medium ' + a.color}>
                    <span>📧</span>
                    <span>예산 {a.pct} 도달 → {a.status} 이메일</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // scalezero
    return (
      <div className="flex flex-col items-center gap-3">
        <span style={{ fontSize: '48px' }}>📉</span>
        <h3 className="text-lg font-bold text-blue-600">Scale to Zero</h3>
        <div className="w-full flex items-end justify-center gap-4" style={{ height: '140px' }}>
          {[
            { label: '오전 9시', h: 80, req: '요청 많음', instances: 5 },
            { label: '오후 3시', h: 50, req: '보통', instances: 3 },
            { label: '자정', h: 15, req: '거의 없음', instances: 1 },
            { label: '새벽 3시', h: 2, req: '없음', instances: 0 },
          ].map(function (item) {
            return (
              <div key={item.label} className="flex flex-col items-center gap-1 flex-1">
                <div className="text-xs font-bold text-blue-600">{item.instances}개</div>
                <div className="w-full rounded-t transition-all duration-700"
                  style={{
                    height: item.h + 'px',
                    background: item.h > 10 ? 'linear-gradient(to top, #3b82f6, #93c5fd)' : '#e2e8f0',
                    minHeight: '4px',
                  }}></div>
                <div className="text-xs text-slate-400">{item.label}</div>
                <div className="text-xs text-slate-300">{item.req}</div>
              </div>
            );
          })}
        </div>
        <div className="text-center text-sm font-semibold text-blue-700 mt-2">
          인스턴스 0 = 비용 $0
        </div>
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;

    var details = {
      paygo: {
        title: '비용 모델 비교',
        content: (
          <div>
            <table className="w-full text-sm mb-3">
              <thead><tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500"></th>
                <th className="py-2 text-center text-red-500 font-bold">온프레미스</th>
                <th className="py-2 text-center text-purple-500 font-bold">클라우드</th>
              </tr></thead>
              <tbody>
                {[['비용 발생', '구매 시점', '사용 시점'], ['비용 유형', 'CapEx + OpEx', 'OpEx만'], ['미사용 시', '감가상각 진행', '비용 $0'], ['예측 가능성', '고정 비용', '변동 비용']].map(function (row) {
                  return (
                    <tr key={row[0]} className="border-b border-slate-100">
                      <td className="py-2 text-slate-600 font-medium">{row[0]}</td>
                      <td className="py-2 text-center text-xs">{row[1]}</td>
                      <td className="py-2 text-center text-xs">{row[2]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700">
              <strong>핵심</strong>: 전기 계량기처럼, 쓴 만큼만 나옵니다.
            </div>
          </div>
        ),
      },
      freetier: {
        title: '무료 한도로 할 수 있는 것',
        content: (
          <div className="space-y-2">
            {[
              '간단한 웹 앱 배포 + 운영',
              'BigQuery로 1TB/월 쿼리',
              'Cloud Functions 200만 호출/월',
              'AI API 소량 테스트',
              'GCP 자격증 실습 전체',
            ].map(function (item, i) {
              return (
                <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 text-sm">
                  <span className="text-green-500">✓</span>
                  <span className="text-slate-600">{item}</span>
                </div>
              );
            })}
            <div className="p-3 bg-green-50 rounded-lg text-xs text-green-700 mt-2">
              <strong>팁</strong>: $300 크레딧이 끝나도 Always Free 한도는 계속 유지됩니다.
            </div>
          </div>
        ),
      },
      budget: {
        title: '설정 방법',
        content: (
          <div>
            <div className="rounded-lg overflow-hidden border border-slate-700">
              <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
                <span className="ml-1.5">Budget Alert 설정</span>
              </div>
              <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 콘솔에서:\n# Billing → Budgets & alerts\n# → CREATE BUDGET\n\n# 또는 CLI:\ngcloud billing budgets create \\\n  --billing-account=ACCOUNT_ID \\\n  --display-name="학습용" \\\n  --budget-amount=10USD \\\n  --threshold-rule=percent=0.5 \\\n  --threshold-rule=percent=0.8 \\\n  --threshold-rule=percent=1.0'}</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700 mt-3">
              <strong>권장</strong>: 학습용은 $10 예산 + 50%/80%/100% 알림 설정
            </div>
          </div>
        ),
      },
      scalezero: {
        title: '핵심 원리',
        content: (
          <div>
            <div className="space-y-3">
              {[
                { time: '요청 도착', state: 'Cold Start → 인스턴스 1개 생성', icon: '🟢' },
                { time: '요청 증가', state: '자동으로 인스턴스 추가', icon: '🟢' },
                { time: '요청 감소', state: '인스턴스 하나씩 종료', icon: '🟡' },
                { time: '요청 없음', state: '인스턴스 0 → 비용 $0', icon: '⚪' },
              ].map(function (item) {
                return (
                  <div key={item.time} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-500">{item.time}</div>
                      <div className="text-sm text-slate-700">{item.state}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 mt-3 text-center">
              <strong>"끄면 안 내도 된다"</strong> — Cloud Run의 핵심 장점
            </div>
          </div>
        ),
      },
    };

    var d = details[focus];
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">{d.title}</div>
        {d.content}
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
