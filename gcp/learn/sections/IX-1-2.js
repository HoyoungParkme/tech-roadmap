/**
 * IX-1-2.js
 * 경로: learn/sections/IX-1-2.js
 * 목적: "IAM 접근 제어 실습" — 역할 체계와 정책 바인딩 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IX-1-2'] = function SectionIX12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var roles = [
    { role: 'Owner', level: '전체 관리', risk: '최고', color: '#ef4444', desc: '모든 리소스 관리 + IAM 변경 + 결제' },
    { role: 'Editor', level: '수정 가능', risk: '높음', color: '#f59e0b', desc: '대부분 리소스 생성·수정·삭제 (IAM 변경 불가)' },
    { role: 'Viewer', level: '조회만', risk: '낮음', color: '#10b981', desc: '모든 리소스 읽기 전용' },
  ];

  var customRoles = [
    { name: 'Storage 관리자', role: 'roles/storage.admin', scope: 'GCS 버킷 전체 관리' },
    { name: 'SQL 클라이언트', role: 'roles/cloudsql.client', scope: 'Cloud SQL 접속만' },
    { name: 'Log 뷰어', role: 'roles/logging.viewer', scope: '로그 조회만' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — IAM 구조 개요',
      desc: 'IAM은 "누가(Member) 무엇을(Role) 어디에(Resource)" 할 수 있는지를 정의합니다. 이 세 가지 축으로 접근 제어를 구성합니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — 기본 역할 (Basic Roles)',
      desc: 'Owner, Editor, Viewer 세 가지가 기본 역할입니다. 편리하지만 범위가 넓어서 실무에서는 사전 정의된 역할(Predefined Role)을 권장합니다.',
      focus: 'basic-roles',
    },
    {
      title: 'STEP 3 — 사전 정의 역할',
      desc: '서비스별로 세분화된 역할을 사용하면 최소 권한 원칙을 지킬 수 있습니다. roles/storage.admin, roles/cloudsql.client 등이 예입니다.',
      focus: 'predefined',
    },
    {
      title: 'STEP 4 — 정책 바인딩 실습',
      desc: 'gcloud CLI로 특정 멤버에게 역할을 바인딩하는 실습을 합니다.',
      focus: 'practice',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">IAM 정책 = 누가 + 무엇을 + 어디에</div>
          <div className="flex gap-4 items-center flex-wrap justify-center">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span style={{ fontSize: '32px' }}>👤</span>
              <div className="text-sm font-bold text-blue-600 mt-1">Member</div>
              <div className="text-xs text-slate-400">누가</div>
            </div>
            <div className="text-xl text-slate-300">+</div>
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <span style={{ fontSize: '32px' }}>🎭</span>
              <div className="text-sm font-bold text-amber-600 mt-1">Role</div>
              <div className="text-xs text-slate-400">무엇을</div>
            </div>
            <div className="text-xl text-slate-300">+</div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <span style={{ fontSize: '32px' }}>📦</span>
              <div className="text-sm font-bold text-emerald-600 mt-1">Resource</div>
              <div className="text-xs text-slate-400">어디에</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center mt-2">
            예: user@gmail.com + roles/storage.admin + my-bucket
          </div>
        </div>
      );
    }

    if (focus === 'basic-roles') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">기본 역할 3종</div>
          </div>
          <div className="space-y-3">
            {roles.map(function (r) {
              return (
                <div key={r.role} className="p-4 rounded-lg border transition-all duration-500"
                  style={{ background: r.color + '08', borderColor: r.color + '40' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold" style={{ color: r.color }}>{r.role}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: r.color + '15', color: r.color }}>
                      리스크: {r.risk}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'predefined') {
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '36px' }}>🎯</span>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">사전 정의 역할 예시</div>
          </div>
          <div className="space-y-2">
            {customRoles.map(function (r) {
              return (
                <div key={r.role} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-lg">✅</span>
                  <div>
                    <div className="text-sm font-bold text-emerald-700">{r.name}</div>
                    <code className="text-xs text-emerald-600">{r.role}</code>
                    <div className="text-xs text-slate-500 mt-0.5">{r.scope}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // practice
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">IAM 바인딩 흐름</div>
        {['멤버 식별 (이메일/SA)', '적절한 역할 선택', '리소스 레벨에 바인딩', '접근 테스트'].map(function (label, i) {
          return (
            <div key={label}>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                <div className="text-sm font-semibold text-slate-700">{label}</div>
              </div>
              {i < 3 && <div className="text-center text-slate-300 text-lg py-1">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">IAM 멤버 유형</div>
          <div className="space-y-3">
            {[
              { type: 'user:', desc: 'Google 계정 (user@gmail.com)' },
              { type: 'serviceAccount:', desc: '서비스 계정 (sa@project.iam.gserviceaccount.com)' },
              { type: 'group:', desc: 'Google 그룹 (team@googlegroups.com)' },
              { type: 'domain:', desc: '전체 도메인 (example.com)' },
            ].map(function (item) {
              return (
                <div key={item.type} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-sm font-semibold text-indigo-600">{item.type}</code>
                  <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'basic-roles') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">역할 비교</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">역할</th>
                <th className="py-2 text-center text-slate-500">권한</th>
                <th className="py-2 text-center text-slate-500">IAM 변경</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-bold text-red-500">Owner</td>
                <td className="py-2 text-center text-xs">전체</td>
                <td className="py-2 text-center text-xs">가능</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-bold text-amber-500">Editor</td>
                <td className="py-2 text-center text-xs">생성·수정·삭제</td>
                <td className="py-2 text-center text-xs">불가</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-bold text-emerald-500">Viewer</td>
                <td className="py-2 text-center text-xs">읽기 전용</td>
                <td className="py-2 text-center text-xs">불가</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>주의:</strong> 실무에서는 Basic Role 대신 Predefined Role 사용을 권장합니다.
          </div>
        </div>
      );
    }

    if (focus === 'predefined') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">왜 사전 정의 역할인가?</div>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
              <strong>❌ roles/editor</strong><br/>
              Cloud SQL, GCS, Pub/Sub, GCE 등 거의 모든 서비스 수정 가능
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>✅ roles/cloudsql.client</strong><br/>
              Cloud SQL 접속만 가능. 다른 서비스에는 접근 불가
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>팁:</strong> GCP에는 900+ 사전 정의 역할이 있습니다. 콘솔의 IAM 페이지에서 검색하세요.
          </div>
        </div>
      );
    }

    // practice
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">CLI 명령어</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud iam</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 프로젝트 IAM 정책 조회\ngcloud projects get-iam-policy $PROJECT\n\n# 역할 바인딩 추가\ngcloud projects add-iam-policy-binding $PROJECT \\\n  --member="user:dev@gmail.com" \\\n  --role="roles/storage.objectViewer"\n\n# 역할 바인딩 제거\ngcloud projects remove-iam-policy-binding $PROJECT \\\n  --member="user:dev@gmail.com" \\\n  --role="roles/storage.objectViewer"'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
