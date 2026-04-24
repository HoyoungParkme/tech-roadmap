/**
 * II-1-3.js
 * 경로: learn/sections/II-1-3.js
 * 목적: "주요 서비스 대응표" — AWS vs GCP 카테고리별 3단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['II-1-3'] = function SectionII13({ section }) {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var table = section.comparisonTable;
  if (!table) return null;

  // 카테고리를 3그룹으로 분류
  var groups = [
    { name: '컴퓨팅 & 컨테이너', icon: '🖥️', color: '#3b82f6', indices: [0, 1, 2, 6] },
    { name: '스토리지 & 데이터베이스', icon: '💾', color: '#10b981', indices: [3, 4, 5] },
    { name: '네트워크 & 운영', icon: '🌐', color: '#f59e0b', indices: [7, 8, 9] },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 전체 대응표',
      desc: 'AWS 서비스를 이미 알고 있다면, GCP에서 같은 역할을 하는 서비스를 찾으면 됩니다. 외울 필요 없이, 필요할 때 이 표를 펼쳐보세요.',
      focus: 'all',
    },
    {
      title: 'STEP 2 — 🖥️ 컴퓨팅 & 컨테이너',
      desc: '서버리스 컨테이너(Cloud Run), 관리형 쿠버네티스(GKE), 가상 머신(Compute Engine), 서버리스 함수(Cloud Functions). 이 네 가지가 GCP의 컴퓨팅 핵심입니다.',
      focus: 0,
    },
    {
      title: 'STEP 3 — 💾 스토리지 & DB + 🌐 네트워크',
      desc: '오브젝트 스토리지(Cloud Storage), 관계형 DB(Cloud SQL), NoSQL(Firestore). 그리고 컨테이너 레지스트리, 로드 밸런서, 로깅까지.',
      focus: 1,
    },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'all') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">AWS → GCP 대응표</div>
          <div className="rounded-lg overflow-hidden border-2 border-slate-200">
            <div className="grid grid-cols-3 bg-slate-800 text-white text-xs font-bold">
              <div className="px-3 py-2">분류</div>
              <div className="px-3 py-2 text-amber-400">AWS</div>
              <div className="px-3 py-2 text-cyan-400">GCP</div>
            </div>
            {table.map(function (row, i) {
              return (
                <div key={row.category} className={'grid grid-cols-3 text-xs border-t border-slate-100 transition-all duration-300 ' + (i % 2 === 0 ? 'bg-white' : 'bg-slate-50')}>
                  <div className="px-3 py-1.5 font-semibold text-slate-600">{row.category}</div>
                  <div className="px-3 py-1.5 text-amber-700">{row.aws}</div>
                  <div className="px-3 py-1.5 text-blue-700 font-medium">{row.gcp}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 그룹별 포커스
    var activeGroups = focus === 0 ? [groups[0]] : [groups[1], groups[2]];
    return (
      <div className="space-y-4">
        {activeGroups.map(function (g) {
          return (
            <div key={g.name}>
              <div className="flex items-center gap-2 mb-2">
                <span>{g.icon}</span>
                <span className="text-sm font-bold" style={{ color: g.color }}>{g.name}</span>
              </div>
              {g.indices.map(function (idx) {
                var row = table[idx];
                if (!row) return null;
                return (
                  <div key={row.category} className="flex items-center gap-2 mb-2 p-2 rounded-lg border-2 bg-white transition-all duration-500"
                    style={{ borderColor: g.color + '40' }}>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-500">{row.category}</div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">{row.aws}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">{row.gcp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;

    if (focus === 'all') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">카테고리별 분류</div>
          {groups.map(function (g) {
            return (
              <div key={g.name} className="mb-3 p-3 rounded-lg border border-slate-200" style={{ background: g.color + '08' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{g.icon}</span>
                  <span className="text-sm font-bold" style={{ color: g.color }}>{g.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">{g.indices.length}개</span>
                </div>
                <div className="text-xs text-slate-500">
                  {g.indices.map(function (idx) { return table[idx] ? table[idx].gcp : ''; }).join(', ')}
                </div>
              </div>
            );
          })}
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center mt-2">
            AWS 경험이 있으면 GCP 대응 서비스를 찾아서 시작하세요
          </div>
        </div>
      );
    }

    var activeGroups = focus === 0 ? [groups[0]] : [groups[1], groups[2]];
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">GCP 서비스 핵심 설명</div>
        <div className="space-y-2">
          {activeGroups.map(function (g) {
            return g.indices.map(function (idx) {
              var row = table[idx];
              if (!row) return null;
              var tips = {
                'Cloud Run': '컨테이너를 서버리스로 실행. Scale to Zero 지원',
                'GKE': 'Google이 만든 Kubernetes의 관리형 서비스',
                'Compute Engine': 'AWS EC2와 동일. 커스텀 머신 타입 강점',
                'Cloud Functions': 'AWS Lambda 대응. HTTP/이벤트 트리거',
                'Cloud Storage': 'AWS S3 대응. 단일 API로 전 세계 접근',
                'Cloud SQL': 'MySQL/PostgreSQL 관리형. 자동 백업/HA',
                'Firestore / Bigtable': 'NoSQL. Firestore=문서DB, Bigtable=대용량',
                'Artifact Registry': '컨테이너/패키지 저장소. ECR + CodeArtifact',
                'Cloud Load Balancing': '글로벌 LB. Premium 티어 네트워크',
                'Cloud Logging': '통합 로그 수집. 자동 수집 + 쿼리',
              };
              return (
                <div key={row.category} className="p-2 rounded-lg border border-slate-200 bg-white">
                  <div className="text-xs font-bold text-blue-600">{row.gcp}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{tips[row.gcp] || row.category}</div>
                </div>
              );
            });
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
