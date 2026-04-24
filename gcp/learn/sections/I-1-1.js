/**
 * I-1-1.js
 * 경로: learn/sections/I-1-1.js
 * 목적: "내 서버를 직접 운영한다는 것" — 온프레미스 vs 클라우드 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['I-1-1'] = function SectionI11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var onPremItems = [
    { icon: '🏗️', text: '땅 구매 + 건축', detail: '물리 서버, 네트워크 장비 직접 구매' },
    { icon: '⚡', text: '전기·수도 직접 연결', detail: 'IDC 입주, 전력·냉방 계약' },
    { icon: '🔧', text: '고장 나면 직접 수리', detail: '하드웨어 장애 시 엔지니어 출동' },
    { icon: '💰', text: 'CapEx + OpEx 모두 부담', detail: '초기 투자 + 운영비 이중 부담' },
    { icon: '⏳', text: '확장에 몇 주 소요', detail: '서버 발주 → 입고 → 설치 → 테스트' },
  ];

  var cloudItems = [
    { icon: '🏨', text: '체크인만 하면 끝', detail: '콘솔에서 클릭 몇 번으로 시작' },
    { icon: '🔌', text: '시설 관리는 호텔 측', detail: '하드웨어·네트워크는 클라우드 제공자 책임' },
    { icon: '📞', text: '문제 시 프런트 한 통', detail: 'SLA 기반 지원, 자동 장애 복구' },
    { icon: '💳', text: '쓴 만큼만 결제', detail: 'Pay-as-you-go, OpEx만 발생' },
    { icon: '⚡', text: '방 추가 즉시 가능', detail: '수 초~수 분 내 서버 추가' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 비유로 이해하기',
      desc: '서버를 직접 운영하는 것은 "집을 직접 짓는 것"과 같습니다. 클라우드는 "호텔에 투숙하는 것"입니다. 둘 다 "잠을 잔다"는 목적은 같지만, 내가 해야 할 일의 양이 완전히 다릅니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — 온프레미스: 직접 집 짓기',
      desc: '물리 서버를 직접 구매하고, IDC에 입주하고, 네트워크를 구성합니다. 초기 투자(CapEx)가 크고, 확장하려면 새 서버를 발주해야 합니다. 모든 장애를 직접 처리해야 합니다.',
      focus: 'onprem',
    },
    {
      title: 'STEP 3 — 클라우드: 호텔 투숙',
      desc: '콘솔에서 몇 번 클릭하면 서버가 준비됩니다. 하드웨어 관리는 클라우드 제공자(Google, AWS 등)가 합니다. 쓴 만큼만 비용이 발생하고, 확장도 즉시 가능합니다.',
      focus: 'cloud',
    },
    {
      title: 'STEP 4 — 핵심 비교',
      desc: '온프레미스는 통제권은 높지만 관리 부담이 큽니다. 클라우드는 편리하지만 제공자에게 의존합니다. 대부분의 스타트업과 신규 프로젝트는 클라우드를 선택합니다.',
      focus: 'compare',
    },
  ];

  function renderItem(item, isActive) {
    return (
      <div key={item.text} className={'flex items-center gap-3 p-2 rounded-lg border transition-all duration-500 ' +
        (isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent')}>
        <span style={{ fontSize: '24px' }}>{item.icon}</span>
        <div>
          <div className="text-sm font-semibold text-slate-700">{item.text}</div>
          {isActive && <div className="text-xs text-slate-500 mt-0.5">{item.detail}</div>}
        </div>
      </div>
    );
  }

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-8 items-end">
            <div className="text-center">
              <span style={{ fontSize: '56px' }}>🏠</span>
              <div className="text-sm font-bold text-red-500 mt-1">직접 집 짓기</div>
              <div className="text-xs text-slate-400">온프레미스</div>
            </div>
            <div className="text-2xl text-slate-300 font-bold">vs</div>
            <div className="text-center">
              <span style={{ fontSize: '56px' }}>🏨</span>
              <div className="text-sm font-bold text-blue-500 mt-1">호텔 투숙</div>
              <div className="text-xs text-slate-400">클라우드</div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            목적은 같다. "서버를 사용한다."<br/>방법이 다르다.
          </div>
        </div>
      );
    }

    if (focus === 'onprem') {
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>🏠</span>
            <h3 className="text-lg font-bold text-red-500">온프레미스</h3>
            <div className="text-xs text-slate-400">직접 집 짓기</div>
          </div>
          <div className="space-y-2">
            {onPremItems.map(function (item) { return renderItem(item, true); })}
          </div>
        </div>
      );
    }

    if (focus === 'cloud') {
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>🏨</span>
            <h3 className="text-lg font-bold text-blue-500">클라우드</h3>
            <div className="text-xs text-slate-400">호텔 투숙</div>
          </div>
          <div className="space-y-2">
            {cloudItems.map(function (item) { return renderItem(item, true); })}
          </div>
        </div>
      );
    }

    // compare
    return (
      <div>
        <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">항목별 비교</div>
        <div className="space-y-2">
          {['구매/계약', '관리', '장애 대응', '비용 모델', '확장 속도'].map(function (label, i) {
            return (
              <div key={label} className="grid grid-cols-3 gap-2 text-xs">
                <div className="font-semibold text-slate-600 py-2 text-center">{label}</div>
                <div className="bg-red-50 border border-red-200 rounded p-2 text-center text-red-700">{onPremItems[i].text}</div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center text-blue-700">{cloudItems[i].text}</div>
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
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">핵심 질문</div>
          <div className="space-y-3">
            {[
              { q: '서버를 누가 관리하나요?', a: '온프레미스: 내가 / 클라우드: 제공자' },
              { q: '비용은 언제 발생하나요?', a: '온프레미스: 구매 시 / 클라우드: 사용 시' },
              { q: '확장은 얼마나 걸리나요?', a: '온프레미스: 주 단위 / 클라우드: 분 단위' },
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

    if (focus === 'onprem') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">온프레미스 현실</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">서버 증설 프로세스</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'1. 서버 사양 결정 (1일)\n2. 견적 요청 + 승인 (3~5일)\n3. 발주 + 배송 대기 (1~2주)\n4. IDC 입고 + 랙 마운트 (1일)\n5. OS + 네트워크 설정 (1~2일)\n6. 앱 배포 + 테스트 (1일)\n\n총 소요: 약 3~4주'}</div>
          </div>
          <div className="mt-3 p-3 bg-red-50 rounded-lg text-xs text-red-700">
            <strong>핵심 고통</strong>: 트래픽 급증을 3주 전에 예측해야 합니다.
          </div>
        </div>
      );
    }

    if (focus === 'cloud') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">클라우드 현실</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">서버 증설 프로세스</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# GCP 콘솔에서 클릭 3번\n# 또는 CLI 한 줄:\n\ngcloud compute instances create \\\n  --machine-type e2-medium \\\n  --zone asia-northeast3-a\n\n# 총 소요: 약 30초'}</div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>핵심 장점</strong>: 트래픽 급증 시 즉시 대응 가능합니다.
          </div>
        </div>
      );
    }

    // compare
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">요약</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 text-left text-slate-500"></th>
              <th className="py-2 text-center font-bold text-red-500">온프레미스</th>
              <th className="py-2 text-center font-bold text-blue-500">클라우드</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['통제권', '높음', '중간'],
              ['초기 비용', '매우 큼', '거의 없음'],
              ['확장 속도', '3~4주', '30초'],
              ['관리 부담', '전부 내 몫', '제공자 분담'],
              ['적합 대상', '규제 산업', '스타트업·신규'],
            ].map(function (row) {
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
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
