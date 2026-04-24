/**
 * IX-1-1.js
 * 경로: learn/sections/IX-1-1.js
 * 목적: "Service Account" — 서비스 계정과 최소 권한 원칙 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IX-1-1'] = function SectionIX11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var saTypes = [
    { icon: '🤖', name: '기본 서비스 계정', desc: 'GCE·Cloud Run 등 서비스 생성 시 자동 부여', risk: '높음', color: '#ef4444' },
    { icon: '🔑', name: '사용자 생성 서비스 계정', desc: '직접 만들어 최소 권한만 부여', risk: '낮음', color: '#10b981' },
  ];

  var roleExamples = [
    { icon: '☕', name: 'roles/cloudsql.client', desc: 'Cloud SQL 읽기/쓰기만', scope: '좁음', safe: true },
    { icon: '📦', name: 'roles/storage.objectViewer', desc: 'GCS 객체 조회만', scope: '좁음', safe: true },
    { icon: '🔐', name: 'roles/owner', desc: '프로젝트 전체 관리 권한', scope: '넓음', safe: false },
    { icon: '⚠️', name: 'roles/editor', desc: '대부분의 리소스 수정 가능', scope: '넓음', safe: false },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 서비스 계정이란?',
      desc: '서비스 계정은 사람이 아닌 애플리케이션·VM이 GCP API를 호출할 때 사용하는 특수 계정입니다. 사람 계정(IAM User)과 달리 비밀번호 대신 키 파일로 인증합니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — 서비스 계정 유형',
      desc: '기본 서비스 계정은 편리하지만 과도한 권한이 부여될 수 있습니다. 실무에서는 반드시 사용자 생성 서비스 계정을 만들어 필요한 권한만 부여합니다.',
      focus: 'types',
    },
    {
      title: 'STEP 3 — 최소 권한 원칙',
      desc: '카페 알바에게 에스프레소 머신 사용 권한만 주듯이, 서비스 계정에도 딱 필요한 역할만 부여합니다. Owner/Editor 같은 넓은 권한은 위험합니다.',
      focus: 'least-privilege',
    },
    {
      title: 'STEP 4 — 실습: 서비스 계정 생성',
      desc: 'gcloud CLI로 서비스 계정을 만들고, 특정 역할을 바인딩하는 과정을 확인합니다.',
      focus: 'practice',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-8 items-end">
            <div className="text-center">
              <span style={{ fontSize: '56px' }}>👤</span>
              <div className="text-sm font-bold text-blue-500 mt-1">사람 계정</div>
              <div className="text-xs text-slate-400">이메일 + 비밀번호</div>
            </div>
            <div className="text-2xl text-slate-300 font-bold">vs</div>
            <div className="text-center">
              <span style={{ fontSize: '56px' }}>🤖</span>
              <div className="text-sm font-bold text-amber-500 mt-1">서비스 계정</div>
              <div className="text-xs text-slate-400">키 파일 인증</div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            둘 다 GCP API를 호출한다.<br/>인증 방식과 사용 주체가 다르다.
          </div>
        </div>
      );
    }

    if (focus === 'types') {
      return (
        <div>
          <div className="text-center mb-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">서비스 계정 유형</div>
          </div>
          <div className="space-y-3">
            {saTypes.map(function (sa) {
              return (
                <div key={sa.name} className={'p-4 rounded-lg border transition-all duration-500 ' +
                  (sa.risk === '낮음' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '28px' }}>{sa.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: sa.color }}>{sa.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{sa.desc}</div>
                      <div className="text-xs mt-1" style={{ color: sa.color }}>리스크: {sa.risk}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'least-privilege') {
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>☕</span>
            <h3 className="text-base font-bold text-amber-500">카페 알바 비유</h3>
            <div className="text-xs text-slate-400">필요한 권한만, 딱 그만큼만</div>
          </div>
          <div className="space-y-2">
            {roleExamples.map(function (r) {
              return (
                <div key={r.name} className={'flex items-center gap-3 p-2 rounded-lg border transition-all duration-500 ' +
                  (r.safe ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')}>
                  <span style={{ fontSize: '20px' }}>{r.icon}</span>
                  <div className="flex-1">
                    <code className="text-xs font-bold" style={{ color: r.safe ? '#10b981' : '#ef4444' }}>{r.name}</code>
                    <div className="text-xs text-slate-500">{r.desc}</div>
                  </div>
                  <div className={'text-lg ' + (r.safe ? 'text-emerald-500' : 'text-red-500')}>
                    {r.safe ? '✅' : '❌'}
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
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">서비스 계정 생성 흐름</div>
        {['서비스 계정 생성', '역할 바인딩', 'VM에 연결'].map(function (label, i) {
          return (
            <div key={label}>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                <div className="text-sm font-semibold text-slate-700">{label}</div>
              </div>
              {i < 2 && <div className="text-center text-slate-300 text-lg py-1">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">서비스 계정 구조</div>
          <div className="space-y-3">
            {[
              { q: '형식', a: 'SA이름@프로젝트ID.iam.gserviceaccount.com' },
              { q: '인증 방식', a: 'JSON 키 파일 또는 Workload Identity' },
              { q: '사용 주체', a: 'VM, Cloud Run, Cloud Functions 등 앱' },
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

    if (focus === 'types') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">추천 사항</div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 mb-3">
            <strong>기본 서비스 계정 사용을 피하세요.</strong><br/>
            Compute Engine 기본 SA에는 Editor 권한이 부여됩니다.
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800">
            <strong>사용자 생성 SA를 만드세요.</strong><br/>
            앱이 필요로 하는 최소한의 역할만 부여합니다.
          </div>
        </div>
      );
    }

    if (focus === 'least-privilege') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">비교</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">역할</th>
                <th className="py-2 text-center text-slate-500">범위</th>
                <th className="py-2 text-center text-slate-500">적합</th>
              </tr>
            </thead>
            <tbody>
              {roleExamples.map(function (r) {
                return (
                  <tr key={r.name} className="border-b border-slate-100">
                    <td className="py-2 text-xs font-mono" style={{ color: r.safe ? '#10b981' : '#ef4444' }}>{r.name}</td>
                    <td className="py-2 text-center text-xs">{r.scope}</td>
                    <td className="py-2 text-center text-xs">{r.safe ? '권장' : '위험'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            <span className="ml-1.5">gcloud</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 1. 서비스 계정 생성\ngcloud iam service-accounts create my-app-sa \\\n  --display-name="My App SA"\n\n# 2. 역할 바인딩\ngcloud projects add-iam-policy-binding $PROJECT \\\n  --member="serviceAccount:my-app-sa@$PROJECT.iam.gserviceaccount.com" \\\n  --role="roles/cloudsql.client"\n\n# 3. VM에 SA 연결\ngcloud compute instances create my-vm \\\n  --service-account=my-app-sa@$PROJECT.iam.gserviceaccount.com'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
