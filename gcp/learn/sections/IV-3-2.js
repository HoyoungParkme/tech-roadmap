/**
 * IV-3-2.js — "환경 변수와 Secret Manager" — 코드 vs Secret 비교 3단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IV-3-2'] = function SectionIV32() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var STEPS = [
    { title: 'STEP 1 — ❌ 코드에 비밀번호 직접 작성', desc: 'DB 비밀번호를 코드에 직접 쓰면 GitHub에 push할 때 노출됩니다. 크롤러가 즉시 수집하고, 수 분 내에 비트코인 채굴에 악용된 사례가 실제로 있습니다.', focus: 'bad' },
    { title: 'STEP 2 — ✅ Secret Manager + 환경 변수', desc: '비밀번호를 Secret Manager에 저장하고, 환경 변수로 주입합니다. 코드에는 비밀이 전혀 없으므로 안전합니다. Cloud Run이 실행될 때 GCP가 자동으로 주입합니다.', focus: 'good' },
    { title: 'STEP 3 — 🔐 최소 권한 원칙', desc: 'Cloud Run은 허용된 Secret만 열 수 있는 열쇠(Service Account)를 가집니다. 다른 프로젝트나 다른 서비스의 Secret에는 접근할 수 없습니다.', focus: 'principle' },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'bad') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="text-2xl">❌</div>
          <h3 className="text-lg font-bold text-red-500">위험한 방법</h3>
          <div className="w-full rounded-lg overflow-hidden border-2 border-red-300">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-red-400">main.py</div>
            <div className="bg-slate-900 p-3 text-xs font-mono leading-relaxed">
              <div className="text-slate-400"># 절대 이렇게 하지 마세요!</div>
              <div className="text-red-300">DB_URL = <span className="text-amber-300">"postgresql://</span></div>
              <div className="text-red-300 pl-4"><span className="text-amber-300">user:</span><span className="bg-red-600 text-white px-1 rounded">mypassword</span><span className="text-amber-300">@..."</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full">
            {['📤 git push', '🕷️ 크롤러 수집', '💀 유출'].map(function (step, i) {
              return (
                <React.Fragment key={step}>
                  <div className="flex-1 p-2 bg-red-50 rounded border border-red-200 text-xs text-center text-red-600">{step}</div>
                  {i < 2 && <span className="text-slate-300">→</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'good') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="text-2xl">✅</div>
          <h3 className="text-lg font-bold text-green-600">안전한 방법</h3>
          <div className="w-full rounded-lg overflow-hidden border-2 border-green-300">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-green-400">main.py</div>
            <div className="bg-slate-900 p-3 text-xs font-mono leading-relaxed">
              <div className="text-slate-400"># 환경 변수에서 읽기</div>
              <div className="text-green-300">DB_PASSWORD = <span className="text-cyan-400">os.environ</span>[</div>
              <div className="text-green-300 pl-4"><span className="text-amber-300">"DB_PASSWORD"</span>]</div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full">
            {['🔐 Secret Manager', '💉 환경 변수 주입', '🐳 Cloud Run'].map(function (step, i) {
              return (
                <React.Fragment key={step}>
                  <div className="flex-1 p-2 bg-green-50 rounded border border-green-200 text-xs text-center text-green-600">{step}</div>
                  {i < 2 && <span className="text-slate-300">→</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      );
    }

    // principle
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl">🔐</div>
        <h3 className="text-lg font-bold text-blue-600">최소 권한 원칙</h3>
        <div className="w-full space-y-3">
          <div className="p-3 rounded-lg border-2 border-green-300 bg-green-50 flex items-center gap-3">
            <span>🐳</span>
            <div className="text-xs"><span className="font-bold text-green-700">Cloud Run A</span> → DB_PASSWORD 접근 ✅</div>
          </div>
          <div className="p-3 rounded-lg border-2 border-red-300 bg-red-50 flex items-center gap-3">
            <span>🐳</span>
            <div className="text-xs"><span className="font-bold text-red-700">Cloud Run B</span> → DB_PASSWORD 접근 ❌</div>
          </div>
          <div className="p-3 rounded-lg border-2 border-red-300 bg-red-50 flex items-center gap-3">
            <span>👤</span>
            <div className="text-xs"><span className="font-bold text-red-700">다른 프로젝트</span> → 모든 Secret 접근 ❌</div>
          </div>
        </div>
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;
    var codes = {
      bad: '# 이런 코드가 GitHub에 올라가면:\n# 1. 크롤러가 수 분 내 발견\n# 2. AWS 키 유출 → 비트코인 채굴\n# 3. DB 접근 → 데이터 탈취\n\n# 실제 사고 사례:\n# - CodeSpaces (2014) 폐업\n# - Uber (2016) 5,700만 명 유출',
      good: '# 1. Secret 생성\ngcloud secrets create DB_PASSWORD \\\n  --data-file=./password.txt\n\n# 2. Cloud Run에 연결\ngcloud run deploy my-api \\\n  --set-secrets=\\\n  DB_PASSWORD=DB_PASSWORD:latest\n\n# 3. 코드에서 읽기\n# os.environ["DB_PASSWORD"]',
      principle: '# Service Account에 권한 부여\ngcloud secrets add-iam-policy-binding \\\n  DB_PASSWORD \\\n  --member="serviceAccount:\\\n  my-api@proj.iam.gserviceaccount.com" \\\n  --role="roles/secretmanager\\\n  .secretAccessor"\n\n# 이 SA만 DB_PASSWORD 열람 가능\n# 다른 SA/사용자는 접근 불가',
    };

    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
          {focus === 'bad' ? '실제 사고 사례' : 'CLI 명령어'}
        </div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400">Terminal</div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{codes[focus]}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
