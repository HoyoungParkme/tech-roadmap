/**
 * XIII-1-2.js
 * 경로: learn/sections/XIII-1-2.js
 * 목적: "Agent Builder 실습" — 에이전트 생성부터 배포까지 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['XIII-1-2'] = function SectionXIII12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var setupSteps = [
    { icon: '🎯', title: '에이전트 유형 선택', desc: '검색형 or 대화형' },
    { icon: '🔗', title: '데이터 소스 연결', desc: '웹 URL · Cloud Storage · BigQuery' },
    { icon: '💬', title: '테스트 대화', desc: 'Console에서 바로 실행' },
    { icon: '🚀', title: '배포', desc: 'API 엔드포인트 or 웹 위젯' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 에이전트 생성 흐름',
      desc: '유형 선택 → 데이터 소스 연결 → 테스트 → 배포 순서로 AI 에이전트를 만듭니다. 콘솔에서 모든 과정을 GUI로 수행합니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — 데이터 소스 연결',
      desc: '웹사이트 URL을 입력하거나, Cloud Storage에 문서를 업로드하여 에이전트의 지식 소스를 구성합니다.',
      focus: 'datasource',
    },
    {
      title: 'STEP 3 — 테스트와 튜닝',
      desc: '콘솔의 "Preview" 기능으로 에이전트와 대화하며 답변 품질을 확인합니다. 프롬프트와 데이터를 조정하여 품질을 높입니다.',
      focus: 'test',
    },
    {
      title: 'STEP 4 — 배포와 통합',
      desc: 'API 엔드포인트로 배포하거나, 웹 위젯을 생성하여 사이트에 삽입합니다. 코드 한 줄 없이 AI 에이전트를 서비스에 통합합니다.',
      focus: 'deploy',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">에이전트 생성 단계</div>
          </div>
          <div className="space-y-2">
            {setupSteps.map(function (s, i) {
              return (
                <div key={s.title}>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                    <span style={{ fontSize: '20px' }}>{s.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-700">{s.title}</div>
                      <div className="text-xs text-slate-500">{s.desc}</div>
                    </div>
                  </div>
                  {i < setupSteps.length - 1 && <div className="text-center text-slate-300 text-lg py-1">↓</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'datasource') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <span style={{ fontSize: '40px' }}>🔗</span>
            <div className="text-base font-bold text-emerald-600 mt-1">데이터 소스 설정</div>
          </div>
          <div className="w-full space-y-3">
            {[
              { icon: '🌐', name: '웹사이트 크롤링', desc: 'URL 입력 → 자동 크롤링 → 인덱싱', detail: '가장 간편한 방법', color: '#3b82f6' },
              { icon: '☁️', name: 'Cloud Storage', desc: 'PDF/HTML/TXT 파일 업로드', detail: '사내 문서에 적합', color: '#10b981' },
              { icon: '💾', name: 'BigQuery', desc: '테이블 데이터 연결', detail: '구조화된 데이터 검색', color: '#8b5cf6' },
            ].map(function (item) {
              return (
                <div key={item.name} className="p-3 rounded-lg border"
                  style={{ background: item.color + '08', borderColor: item.color + '30' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: item.color }}>{item.name}</div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.detail}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'test') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-sm p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-500 mb-3 text-center">Preview 대화창</div>
            <div className="space-y-2">
              <div className="flex justify-end">
                <div className="p-2 bg-blue-100 rounded-lg text-xs text-blue-700 max-w-[80%]">
                  반품 정책이 어떻게 되나요?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 max-w-[80%]">
                  <div>구매 후 7일 이내 반품 가능합니다. 상품이 미개봉 상태여야 합니다.</div>
                  <div className="text-xs text-slate-400 mt-1 border-t border-slate-100 pt-1">출처: 반품정책.pdf (p.3)</div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="p-2 bg-blue-100 rounded-lg text-xs text-blue-700 max-w-[80%]">
                  배송비는 누가 부담하나요?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 max-w-[80%]">
                  <div>단순 변심은 고객 부담, 불량은 판매자 부담입니다.</div>
                  <div className="text-xs text-slate-400 mt-1 border-t border-slate-100 pt-1">출처: 반품정책.pdf (p.5)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // deploy
    return (
      <div className="flex flex-col items-center gap-4">
        <span style={{ fontSize: '48px' }}>🚀</span>
        <div className="text-base font-bold text-purple-600">배포 옵션</div>
        <div className="w-full space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '24px' }}>🔌</span>
              <div>
                <div className="text-sm font-bold text-blue-600">API 엔드포인트</div>
                <div className="text-xs text-slate-500">REST API로 앱에서 호출</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '24px' }}>💬</span>
              <div>
                <div className="text-sm font-bold text-purple-600">웹 위젯</div>
                <div className="text-xs text-slate-500">iframe/script 태그로 사이트에 삽입</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '24px' }}>📱</span>
              <div>
                <div className="text-sm font-bold text-emerald-600">Dialogflow CX 통합</div>
                <div className="text-xs text-slate-500">전화·메신저 채널 연동</div>
              </div>
            </div>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">콘솔 경로</div>
          <div className="space-y-3">
            {[
              { step: '1', desc: 'GCP Console → Vertex AI → Agent Builder' },
              { step: '2', desc: '"Create Agent" 클릭 → 유형 선택' },
              { step: '3', desc: 'Data Store 생성 → 소스 연결' },
              { step: '4', desc: 'Preview에서 테스트 → Deploy' },
            ].map(function (item) {
              return (
                <div key={item.step} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{item.step}</div>
                  <div className="text-xs text-slate-600">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'datasource') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">데이터 준비 팁</div>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>문서 구조화</strong><br/>
              제목, 소제목, 단락이 명확한 문서일수록 검색 정확도가 높습니다.
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>지원 포맷</strong><br/>
              PDF, HTML, TXT, CSV (Cloud Storage) / 웹 URL 자동 크롤링
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
              <strong>인덱싱 시간</strong><br/>
              데이터 양에 따라 수 분~수 시간 소요. 변경 시 재인덱싱 필요.
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'test') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">품질 개선 방법</div>
          <div className="space-y-3">
            {[
              { q: '답변이 부정확하다', a: '데이터 소스에 관련 문서가 있는지 확인. 없으면 추가' },
              { q: '답변이 너무 길다', a: '시스템 프롬프트에 "간결하게 답변하라" 지시 추가' },
              { q: '특정 주제에 대답 못 함', a: '해당 주제의 문서를 Data Store에 추가' },
              { q: '환각(Hallucination)', a: '프롬프트에 "모르면 모른다고 답하라" 추가' },
            ].map(function (item) {
              return (
                <div key={item.q} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs font-semibold text-red-600">{item.q}</div>
                  <div className="text-xs text-slate-500 mt-1">→ {item.a}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // deploy
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">통합 코드 예시</div>
        <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">웹 위젯 삽입</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'<!-- Agent Builder 위젯 -->\n<script src="https://cloud.google.com/ai/\n  gen-app-builder/client">\n</script>\n<gen-search-widget\n  configId="YOUR_CONFIG_ID"\n  triggerId="searchWidgetTrigger">\n</gen-search-widget>'}</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-700 text-center">
          <strong>코드 한 줄 없이 AI 에이전트를 만들어보는 것으로</strong><br/>
          <strong>이 GCP 학습 여정을 마무리합니다.</strong>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
