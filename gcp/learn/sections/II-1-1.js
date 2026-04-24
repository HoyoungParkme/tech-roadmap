/**
 * II-1-1.js
 * 경로: learn/sections/II-1-1.js
 * 목적: "세 공룡의 포지션" — AWS/Azure/GCP 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['II-1-1'] = function SectionII11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var clouds = [
    {
      name: 'AWS', fullName: 'Amazon Web Services', icon: '🟠', year: '2006',
      color: '#f59e0b', bgColor: '#fffbeb',
      strength: '서비스 수 최다, 레퍼런스 풍부',
      bestFor: '"뭘 만들어야 하는데 어디서 시작할지 모르겠다"는 팀',
      share: '31%', services: '200+',
      features: ['가장 넓은 서비스 범위', '가장 큰 커뮤니티', '엔터프라이즈 레퍼런스 최다', '복잡한 요금 체계'],
    },
    {
      name: 'Azure', fullName: 'Microsoft Azure', icon: '🔵', year: '2010',
      color: '#3b82f6', bgColor: '#eff6ff',
      strength: 'Windows / Office 365 / Active Directory 연동',
      bestFor: '.NET 기반 기업, 사내 시스템 클라우드 전환',
      share: '25%', services: '200+',
      features: ['MS 생태계 최강 연동', 'Active Directory 통합', '하이브리드 클라우드 강점', '엔터프라이즈 라이선스 할인'],
    },
    {
      name: 'GCP', fullName: 'Google Cloud Platform', icon: '🔴', year: '2008',
      color: '#ef4444', bgColor: '#fef2f2',
      strength: '데이터 · AI · Kubernetes 본고장',
      bestFor: '데이터 분석, 머신러닝 파이프라인 팀',
      share: '12%', services: '100+',
      features: ['BigQuery — PB급 분석', 'Kubernetes 창시자', 'Vertex AI — 통합 ML', '깔끔한 요금 체계'],
    },
  ];

  var STEPS = [
    { title: 'STEP 1 — 세 공룡 개요', desc: '클라우드 시장은 AWS, Azure, GCP 세 공룡이 지배합니다. 각각 출발점과 강점이 다릅니다. 어느 것이 "최고"가 아니라, 팀의 상황에 맞는 선택이 중요합니다.', focus: 'overview' },
    { title: 'STEP 2 — 🟠 AWS: 서비스 왕국', desc: clouds[0].strength + '. 2006년 시작으로 가장 오래된 퍼블릭 클라우드입니다. 서비스 수가 200개 이상으로 "없는 게 없다"는 평가를 받습니다.', focus: 0 },
    { title: 'STEP 3 — 🔵 Azure: MS 생태계', desc: clouds[1].strength + '. 2010년 시작. Windows Server, .NET, Office 365를 이미 쓰고 있는 기업이라면 Azure가 자연스러운 선택입니다.', focus: 1 },
    { title: 'STEP 4 — 🔴 GCP: 데이터·AI 본고장', desc: clouds[2].strength + '. 구글이 내부에서 쓰던 기술(BigQuery, Kubernetes)을 서비스로 공개한 것이 GCP입니다. 데이터 + AI 분야에서 독보적입니다.', focus: 2 },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">시장 점유율 (2024)</div>
          <div className="flex gap-4 items-end" style={{ height: '160px' }}>
            {clouds.map(function (c) {
              var h = parseInt(c.share) * 4;
              return (
                <div key={c.name} className="flex flex-col items-center gap-1">
                  <div className="text-xs font-bold" style={{ color: c.color }}>{c.share}</div>
                  <div className="w-16 rounded-t transition-all duration-500" style={{ height: h + 'px', background: c.color }}></div>
                  <span style={{ fontSize: '24px' }}>{c.icon}</span>
                  <div className="text-sm font-bold" style={{ color: c.color }}>{c.name}</div>
                  <div className="text-xs text-slate-400">{c.year}~</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    var c = clouds[focus];
    return (
      <div className="flex flex-col items-center gap-3">
        <span style={{ fontSize: '48px' }}>{c.icon}</span>
        <h3 className="text-xl font-bold" style={{ color: c.color }}>{c.name}</h3>
        <div className="text-xs text-slate-400">{c.fullName} ({c.year}~)</div>
        <div className="text-sm font-semibold text-slate-700 text-center mt-2">{c.strength}</div>
        <div className="w-full mt-3 space-y-2">
          {c.features.map(function (f, i) {
            return (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg border-2 transition-all duration-500"
                style={{ borderColor: c.color + '40', background: c.bgColor }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: c.color }}>
                  {i + 1}
                </div>
                <span className="text-sm text-slate-700">{f}</span>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">포지셔닝 요약</div>
          {clouds.map(function (c) {
            return (
              <div key={c.name} className="mb-3 p-3 rounded-lg border border-slate-200" style={{ background: c.bgColor }}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{c.icon}</span>
                  <span className="font-bold text-sm" style={{ color: c.color }}>{c.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">점유율 {c.share}</span>
                </div>
                <div className="text-xs text-slate-600">{c.bestFor}</div>
              </div>
            );
          })}
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center mt-2">
            이 강의에서는 <strong className="text-red-500">GCP</strong>를 중심으로 학습합니다
          </div>
        </div>
      );
    }

    var c = clouds[focus];
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">이런 팀에게 추천</div>
        <div className="p-4 rounded-xl border-2 mb-3" style={{ borderColor: c.color + '60', background: c.bgColor }}>
          <div className="text-sm font-semibold text-slate-700 text-center leading-relaxed">{c.bestFor}</div>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {[
              ['시작 연도', c.year],
              ['서비스 수', c.services],
              ['시장 점유율', c.share],
              ['주요 강점', c.strength],
            ].map(function (row) {
              return (
                <tr key={row[0]} className="border-b border-slate-100">
                  <td className="py-2 text-slate-500 font-medium text-xs">{row[0]}</td>
                  <td className="py-2 text-slate-700 text-sm">{row[1]}</td>
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
