/**
 * VIII-1-1.js
 * 경로: learn/sections/VIII-1-1.js
 * 목적: "IaaS와 Compute Engine" — PaaS vs IaaS 비교 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VIII-1-1'] = function SectionVIII11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    {
      title: 'STEP 1 — IaaS vs PaaS',
      desc: 'IaaS(Compute Engine)는 가상 머신을 직접 관리하고, PaaS(Cloud Run)는 컨테이너만 올리면 됩니다. 자유도와 관리 부담이 반비례합니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — Compute Engine 특징',
      desc: 'Compute Engine은 GCP의 IaaS 서비스입니다. 원하는 OS, CPU, 메모리를 선택하고 VM(가상 머신)을 직접 세팅합니다.',
      focus: 'ce'
    },
    {
      title: 'STEP 3 — Cloud Run 특징',
      desc: 'Cloud Run은 컨테이너 기반 PaaS입니다. Docker 이미지만 올리면 스케일링, 서버 관리를 자동으로 해줍니다.',
      focus: 'cr'
    },
    {
      title: 'STEP 4 — 언제 무엇을 쓸까?',
      desc: 'Stateless API → Cloud Run, 커스텀 OS/GPU/상시 서버 → Compute Engine. 대부분의 웹 서비스는 Cloud Run이 적합합니다.',
      focus: 'compare'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-8 items-end">
            <div className="text-center">
              <span style={{ fontSize: '56px' }}>🐳</span>
              <div className="text-sm font-bold text-green-600 mt-1">Cloud Run</div>
              <div className="text-xs text-slate-400">PaaS</div>
            </div>
            <div className="text-2xl text-slate-300 font-bold">vs</div>
            <div className="text-center">
              <span style={{ fontSize: '56px' }}>🖥️</span>
              <div className="text-sm font-bold text-amber-600 mt-1">Compute Engine</div>
              <div className="text-xs text-slate-400">IaaS</div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400">
            편리함 ↔ 자유도 트레이드오프
          </div>
        </div>
      );
    }

    if (focus === 'ce') {
      var ceFeatures = [
        { icon: '🖥️', text: 'VM 직접 세팅', detail: 'OS, 네트워크, 프로세스 직접 관리' },
        { icon: '🐧', text: 'OS 선택 가능', detail: 'Debian, Ubuntu, Windows 등' },
        { icon: '🎮', text: 'GPU 연결 가능', detail: 'ML 학습, 그래픽 처리용' },
        { icon: '💰', text: '상시 할인', detail: '31일 이상 사용 시 자동 할인' }
      ];
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>🖥️</span>
            <div className="text-lg font-bold text-amber-600">Compute Engine</div>
          </div>
          <div className="space-y-2">
            {ceFeatures.map(function (f) {
              return (
                <div key={f.text} className={getStatusClass('active', 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <span style={{ fontSize: '20px' }}>{f.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{f.text}</div>
                    <div className="text-xs text-slate-500">{f.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'cr') {
      var crFeatures = [
        { icon: '🐳', text: '컨테이너 올리면 끝', detail: 'Docker 이미지만 준비' },
        { icon: '📈', text: '자동 스케일링', detail: '0 → N 자동 확장/축소' },
        { icon: '🔧', text: '서버 관리 불필요', detail: 'OS 패치, 보안 업데이트 자동' },
        { icon: '💳', text: '요청 당 과금', detail: '트래픽 없으면 비용 0' }
      ];
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>🐳</span>
            <div className="text-lg font-bold text-green-600">Cloud Run</div>
          </div>
          <div className="space-y-2">
            {crFeatures.map(function (f) {
              return (
                <div key={f.text} className={getStatusClass('active', 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <span style={{ fontSize: '20px' }}>{f.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{f.text}</div>
                    <div className="text-xs text-slate-500">{f.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // compare
    var useCases = [
      { case: 'REST API', answer: 'Cloud Run', icon: '🐳', color: '#10b981' },
      { case: 'ML 학습 (GPU)', answer: 'Compute Engine', icon: '🖥️', color: '#f59e0b' },
      { case: '웹 크롤러', answer: 'Compute Engine', icon: '🖥️', color: '#f59e0b' },
      { case: 'Stateless 마이크로서비스', answer: 'Cloud Run', icon: '🐳', color: '#10b981' },
      { case: '커스텀 데이터베이스', answer: 'Compute Engine', icon: '🖥️', color: '#f59e0b' }
    ];
    return (
      <div className="space-y-2">
        <div className="text-center text-xs font-bold text-slate-500 mb-3">유스케이스별 추천</div>
        {useCases.map(function (u) {
          return (
            <div key={u.case} className={getStatusClass('done', 'p-3 rounded-lg border-2 flex items-center gap-3')}>
              <span style={{ fontSize: '20px' }}>{u.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-700">{u.case}</div>
              </div>
              <div className="text-xs font-bold px-2 py-1 rounded" style={{ background: u.color + '15', color: u.color }}>
                {u.answer}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">IaaS vs PaaS 비교</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500"></th>
                <th className="py-2 text-center text-amber-600 font-bold">IaaS (CE)</th>
                <th className="py-2 text-center text-green-600 font-bold">PaaS (CR)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['관리 범위', 'OS부터 전부', '컨테이너만'],
                ['스케일링', '수동 (MIG 제외)', '자동'],
                ['비용 모델', '시간 당', '요청 당'],
                ['자유도', '매우 높음', '중간'],
                ['학습 곡선', '높음', '낮음']
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 text-slate-600 font-medium text-xs">{row[0]}</td>
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

    if (focus === 'ce') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Compute Engine VM 생성</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# VM 인스턴스 생성\ngcloud compute instances create \\\n  my-server \\\n  --zone=asia-northeast3-a \\\n  --machine-type=e2-micro \\\n  --image-family=debian-12 \\\n  --image-project=debian-cloud\n\n# SSH 접속\ngcloud compute ssh my-server \\\n  --zone=asia-northeast3-a'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'cr') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Cloud Run 배포</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Cloud Run 배포 (끝)\ngcloud run deploy my-api \\\n  --image=gcr.io/my-project/my-api \\\n  --region=asia-northeast3 \\\n  --allow-unauthenticated\n\n# 배포 완료! URL 자동 생성\n# https://my-api-xxx.run.app'}</div>
          </div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs text-green-700">
            <strong>비교</strong>: CE는 8줄 + SSH + 패키지 설치가 필요하지만, CR은 4줄이면 끝납니다.
          </div>
        </div>
      );
    }

    // compare
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">선택 가이드</div>
        <div className="space-y-3">
          {[
            { tip: 'Cloud Run 선택', detail: 'HTTP API, 이벤트 처리, 마이크로서비스 → 대부분 여기', color: '#10b981' },
            { tip: 'Compute Engine 선택', detail: 'GPU 필요, 커스텀 OS, 상시 실행 데몬, 특수 네트워크', color: '#f59e0b' },
            { tip: '판단 기준', detail: '"Docker로 컨테이너화 가능한가?" → Yes면 Cloud Run', color: '#3b82f6' }
          ].map(function (item) {
            return (
              <div key={item.tip} className="p-3 rounded-lg border" style={{ background: item.color + '08', borderColor: item.color + '30' }}>
                <div className="text-sm font-semibold" style={{ color: item.color }}>{item.tip}</div>
                <div className="text-xs text-slate-500 mt-1">{item.detail}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
