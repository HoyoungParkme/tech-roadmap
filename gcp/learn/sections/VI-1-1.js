/**
 * VI-1-1.js
 * 경로: learn/sections/VI-1-1.js
 * 목적: "3계층 아키텍처" — Presentation/Logic/Data 계층 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VI-1-1'] = function SectionVI11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var tiers = [
    { name: 'Presentation', desc: '외부 요청 수신 · 응답 반환', service: 'Cloud Run (API)', icon: '🌐', color: '#3b82f6' },
    { name: 'Business Logic', desc: '비즈니스 규칙 처리', service: 'Cloud Run (Service Layer)', icon: '⚙️', color: '#10b981' },
    { name: 'Data', desc: '데이터 저장 · 조회', service: 'Cloud SQL', icon: '🗄️', color: '#f59e0b' }
  ];

  var supports = [
    { name: 'Secret Manager', icon: '🔐', desc: 'DB 비밀번호 등 민감 정보 관리' },
    { name: 'Artifact Registry', icon: '📦', desc: 'Docker 이미지 저장소' },
    { name: 'Cloud Logging', icon: '📋', desc: '로그 자동 수집/분석' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 3계층 아키텍처란?',
      desc: '웹 애플리케이션을 Presentation(표현) → Business Logic(로직) → Data(데이터) 3개 계층으로 나누는 설계 패턴입니다. 관심사 분리를 통해 유지보수성을 높입니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — 각 계층과 GCP 서비스',
      desc: 'Presentation은 Cloud Run(API), Business Logic도 Cloud Run(Service Layer), Data는 Cloud SQL이 담당합니다. 각 계층이 독립적이라 개별 스케일링이 가능합니다.',
      focus: 'tiers'
    },
    {
      title: 'STEP 3 — 요청 흐름',
      desc: '클라이언트 → Presentation → Logic → Data 순서로 요청이 흐르고, 역순으로 응답이 돌아옵니다. 각 계층 사이는 API 호출로 연결됩니다.',
      focus: 'flow'
    },
    {
      title: 'STEP 4 — 지원 서비스',
      desc: 'Secret Manager, Artifact Registry, Cloud Logging 같은 지원 서비스가 전체 아키텍처를 보완합니다.',
      focus: 'supports'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm font-bold text-slate-600 mb-2">3계층 아키텍처</div>
          {tiers.map(function (t, i) {
            return (
              <div key={t.name}>
                <div className={getStatusClass('done', 'px-6 py-3 rounded-lg border-2 text-center w-64')}>
                  <span style={{ fontSize: '28px' }}>{t.icon}</span>
                  <div className="text-sm font-bold mt-1" style={{ color: t.color }}>{t.name}</div>
                  <div className="text-xs text-slate-500">{t.desc}</div>
                </div>
                {i < tiers.length - 1 && <div className="text-center text-slate-300 text-sm">↕</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'tiers') {
      return (
        <div className="space-y-3">
          {tiers.map(function (t, i) {
            return (
              <div key={t.name}>
                <div className={getStatusClass('active', 'p-4 rounded-lg border-2 flex items-center gap-4')}>
                  <span style={{ fontSize: '32px' }}>{t.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: t.color }}>{t.name}</div>
                    <div className="text-xs text-slate-500">{t.desc}</div>
                  </div>
                  <code className="text-xs px-2 py-1 rounded font-semibold" style={{ background: t.color + '10', color: t.color }}>{t.service}</code>
                </div>
                {i < tiers.length - 1 && <div className="text-center text-slate-300 text-sm">↕</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'flow') {
      var flowSteps = [
        { label: 'Client', icon: '👤', state: 'active' },
        { label: 'Presentation', icon: '🌐', state: 'active' },
        { label: 'Business Logic', icon: '⚙️', state: 'highlight' },
        { label: 'Data', icon: '🗄️', state: 'done' }
      ];
      return (
        <div>
          <div className="text-center text-xs text-slate-400 mb-3">요청 흐름 →</div>
          <div className="space-y-2">
            {flowSteps.map(function (s, i) {
              return (
                <div key={s.label}>
                  <div className={getStatusClass(s.state, 'p-3 rounded-lg border-2 text-center')}>
                    <span style={{ fontSize: '24px' }}>{s.icon}</span>
                    <div className="text-sm font-bold text-slate-700 mt-1">{s.label}</div>
                  </div>
                  {i < flowSteps.length - 1 && <div className="text-center text-slate-300 text-sm">↓ API 호출</div>}
                </div>
              );
            })}
          </div>
          <div className="text-center text-xs text-slate-400 mt-3">← 응답 반환</div>
        </div>
      );
    }

    // supports
    return (
      <div>
        <div className="space-y-3 mb-4">
          {tiers.map(function (t, i) {
            return (
              <div key={t.name}>
                <div className={getStatusClass('done', 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <span style={{ fontSize: '24px' }}>{t.icon}</span>
                  <div className="text-sm font-bold" style={{ color: t.color }}>{t.name}</div>
                </div>
                {i < tiers.length - 1 && <div className="text-center text-slate-300 text-xs">↕</div>}
              </div>
            );
          })}
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="text-xs text-slate-400 text-center mb-2">지원 서비스</div>
          <div className="flex justify-center gap-4 flex-wrap">
            {supports.map(function (s) {
              return (
                <div key={s.name} className={getStatusClass('highlight', 'px-3 py-2 rounded-lg border-2 text-center')}>
                  <span style={{ fontSize: '20px' }}>{s.icon}</span>
                  <div className="text-xs font-semibold text-slate-600 mt-1">{s.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">왜 3계층인가?</div>
          <div className="space-y-3">
            {[
              { q: '관심사 분리', a: '각 계층이 자기 역할에만 집중' },
              { q: '독립 스케일링', a: 'API만, 또는 DB만 따로 확장 가능' },
              { q: '유지보수', a: 'Logic 변경이 Data 계층에 영향 없음' },
              { q: '팀 분업', a: '프론트/백엔드/DBA 역할 분리' }
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

    if (focus === 'tiers') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">GCP 매핑</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">계층</th>
                <th className="py-2 text-left text-slate-500">서비스</th>
                <th className="py-2 text-left text-slate-500">역할</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Presentation', 'Cloud Run', 'REST API 엔드포인트'],
                ['Logic', 'Cloud Run', '비즈니스 규칙 처리'],
                ['Data', 'Cloud SQL', 'PostgreSQL/MySQL']
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-700">{row[0]}</td>
                    <td className="py-2 text-xs text-slate-500">{row[1]}</td>
                    <td className="py-2 text-xs text-slate-500">{row[2]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>팁</strong>: 실제로는 Cloud Run 하나에 Presentation + Logic을 합치는 경우가 많습니다 (모놀리식 시작 → 필요 시 분리).
          </div>
        </div>
      );
    }

    if (focus === 'flow') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">코드 구조 예시</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">프로젝트 구조</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'src/\n├── api/          # Presentation\n│   └── routes.py # 엔드포인트 정의\n├── service/      # Business Logic\n│   └── user.py   # 비즈니스 규칙\n├── repository/   # Data\n│   └── user.py   # DB 쿼리\n└── main.py       # 앱 진입점\n\n# 요청 흐름:\n# routes.py → user_service.py → user_repo.py\n# → Cloud SQL → 역순 응답'}</div>
          </div>
        </div>
      );
    }

    // supports
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">지원 서비스 상세</div>
        <div className="space-y-3">
          {supports.map(function (s) {
            return (
              <div key={s.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                <span style={{ fontSize: '24px' }}>{s.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs text-green-700">
          <strong>핵심</strong>: 3계층 + 지원 서비스가 GCP 웹 서비스의 표준 아키텍처입니다.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
