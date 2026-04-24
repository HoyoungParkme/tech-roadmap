/**
 * V-1-2.js
 * 경로: learn/sections/V-1-2.js
 * 목적: "IAM 기본 개념" — 병원 비유 + 역할/서비스계정/최소권한 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['V-1-2'] = function SectionV12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var roles = [
    { who: '의사', icon: '👨‍⚕️', can: '기록 읽기 + 처방', gcpRole: 'roles/run.admin', color: '#3b82f6' },
    { who: '간호사', icon: '👩‍⚕️', can: '기록 읽기 + 처치', gcpRole: 'roles/run.invoker', color: '#10b981' },
    { who: '청소부', icon: '🧹', can: '병실 출입만', gcpRole: 'roles/viewer', color: '#f59e0b' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — IAM이란?',
      desc: 'IAM(Identity and Access Management)은 "누가 무엇을 할 수 있는가"를 정의합니다. 병원에서 의사/간호사/청소부마다 할 수 있는 일이 다른 것과 같습니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — 역할(Role) 기반 권한',
      desc: '각 사용자에게 역할을 부여하면 해당 역할에 포함된 권한만 사용할 수 있습니다. 의사(admin), 간호사(invoker), 청소부(viewer)처럼 역할별로 다릅니다.',
      focus: 'roles'
    },
    {
      title: 'STEP 3 — 서비스 계정',
      desc: '사람이 아닌 "애플리케이션"에도 권한이 필요합니다. 서비스 계정은 앱 전용 ID로, Cloud Run이 Cloud SQL에 접근할 때 사용합니다.',
      focus: 'service-account'
    },
    {
      title: 'STEP 4 — 최소 권한 원칙',
      desc: '"필요한 만큼만 권한을 부여한다"가 핵심입니다. Owner 역할을 남발하면 보안 사고 위험이 급증합니다.',
      focus: 'least-privilege'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '56px' }}>🏥</span>
          <div className="text-lg font-bold text-blue-600">IAM = 병원 출입 관리</div>
          <div className="text-sm text-slate-500 text-center">
            누가(Identity) + 무엇을(Permission) + 어디서(Resource)<br/>
            이 3가지를 조합해서 접근을 통제합니다.
          </div>
          <div className="flex gap-6 mt-2">
            {roles.map(function (r) {
              return (
                <div key={r.who} className="text-center">
                  <span style={{ fontSize: '36px' }}>{r.icon}</span>
                  <div className="text-xs font-semibold mt-1" style={{ color: r.color }}>{r.who}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'roles') {
      return (
        <div className="space-y-3">
          {roles.map(function (r, i) {
            var state = i === 0 ? 'active' : i === 1 ? 'done' : 'idle';
            return (
              <div key={r.who} className={getStatusClass(state, 'p-4 rounded-lg border-2 flex items-center gap-4')}>
                <span style={{ fontSize: '36px' }}>{r.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-700">{r.who}</div>
                  <div className="text-xs text-slate-500">{r.can}</div>
                </div>
                <code className="text-xs px-2 py-1 rounded font-semibold" style={{ background: r.color + '15', color: r.color }}>{r.gcpRole}</code>
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'service-account') {
      var saFlow = [
        { icon: '🐳', label: 'Cloud Run', sub: '앱 컨테이너', state: 'active' },
        { icon: '🤖', label: '서비스 계정', sub: 'my-api@project.iam', state: 'highlight' },
        { icon: '🗄️', label: 'Cloud SQL', sub: 'roles/cloudsql.client', state: 'done' }
      ];
      return (
        <div className="space-y-2">
          {saFlow.map(function (s, i) {
            return (
              <div key={s.label}>
                <div className={getStatusClass(s.state, 'p-4 rounded-lg border-2 text-center')}>
                  <span style={{ fontSize: '28px' }}>{s.icon}</span>
                  <div className="text-sm font-bold text-slate-700 mt-1">{s.label}</div>
                  <div className="text-xs text-slate-500">{s.sub}</div>
                </div>
                {i < saFlow.length - 1 && <div className="text-center text-slate-300 text-sm">↓ 권한 위임</div>}
              </div>
            );
          })}
        </div>
      );
    }

    // least-privilege
    var examples = [
      { label: '❌ 나쁜 예', role: 'roles/owner', desc: '모든 권한 — DB 삭제도 가능', state: 'idle', bad: true },
      { label: '✅ 좋은 예', role: 'roles/run.invoker', desc: 'Cloud Run 호출만 가능', state: 'active', bad: false }
    ];
    return (
      <div className="space-y-4">
        <div className="text-center mb-2">
          <span style={{ fontSize: '40px' }}>🔐</span>
          <div className="text-sm font-bold text-slate-700 mt-1">최소 권한 원칙</div>
        </div>
        {examples.map(function (ex) {
          return (
            <div key={ex.label} className={getStatusClass(ex.state, 'p-4 rounded-lg border-2')}>
              <div className="text-sm font-bold" style={{ color: ex.bad ? '#ef4444' : '#10b981' }}>{ex.label}</div>
              <code className="text-xs font-semibold text-slate-600">{ex.role}</code>
              <div className="text-xs text-slate-500 mt-1">{ex.desc}</div>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">IAM 3요소</div>
          <div className="space-y-3">
            {[
              { q: 'WHO (주체)', a: '사용자, 그룹, 서비스 계정' },
              { q: 'WHAT (역할)', a: 'Viewer, Editor, Admin, 커스텀 역할' },
              { q: 'WHERE (리소스)', a: '프로젝트, 폴더, 개별 서비스' }
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

    if (focus === 'roles') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">역할 계층 비교</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">역할</th>
                <th className="py-2 text-left text-slate-500">권한 범위</th>
                <th className="py-2 text-left text-slate-500">위험도</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Viewer', '읽기만', '🟢 낮음'],
                ['Editor', '읽기 + 수정', '🟡 중간'],
                ['Admin', '읽기 + 수정 + 삭제', '🟠 높음'],
                ['Owner', '모든 것 + IAM 관리', '🔴 매우 높음']
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-700">{row[0]}</td>
                    <td className="py-2 text-xs text-slate-500">{row[1]}</td>
                    <td className="py-2 text-xs">{row[2]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (focus === 'service-account') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">서비스 계정 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 서비스 계정 생성\ngcloud iam service-accounts create \\\n  my-api-sa \\\n  --display-name="My API Service Account"\n\n# Cloud SQL 접근 권한 부여\ngcloud projects add-iam-policy-binding \\\n  my-project \\\n  --member="serviceAccount:my-api-sa@my-project.iam.gserviceaccount.com" \\\n  --role="roles/cloudsql.client"'}</div>
          </div>
        </div>
      );
    }

    // least-privilege
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">실전 팁</div>
        <div className="space-y-3">
          {[
            { tip: 'Owner 역할은 프로젝트 생성자만', detail: '다른 사람에게는 필요한 역할만 부여' },
            { tip: '서비스 계정에 Editor 금지', detail: '필요한 API 권한만 세밀하게 부여' },
            { tip: '정기적으로 권한 감사', detail: 'IAM Recommender로 사용하지 않는 권한 확인' },
            { tip: '조건부 IAM 활용', detail: '특정 시간/IP에서만 접근 허용 가능' }
          ].map(function (item) {
            return (
              <div key={item.tip} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-blue-700">{item.tip}</div>
                <div className="text-xs text-blue-500 mt-1">{item.detail}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
