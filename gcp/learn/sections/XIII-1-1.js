/**
 * XIII-1-1.js
 * 경로: learn/sections/XIII-1-1.js
 * 목적: "Vertex AI Agent Builder" — AI 에이전트 빌더 개요와 유형 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['XIII-1-1'] = function SectionXIII11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var agentTypes = [
    { icon: '🔍', title: '웹검색 질의응답', desc: '실시간 웹 검색 → 답변 생성', color: '#3b82f6', use: '고객 FAQ, 상품 정보 안내' },
    { icon: '📄', title: '사내 문서 검색', desc: '내부 문서·DB 기반 안내', color: '#10b981', use: '사내 위키, 매뉴얼 검색' },
    { icon: '💬', title: '고객 상담 자동화', desc: '시나리오 기반 대화 흐름', color: '#8b5cf6', use: '예약, 문의, A/S 접수' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — Agent Builder란?',
      desc: 'Vertex AI Agent Builder는 코드 없이 AI 에이전트를 만들 수 있는 서비스입니다. LLM(대규모 언어 모델)에 나의 데이터를 연결(Grounding)하여 맞춤형 AI를 만듭니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — 에이전트 유형',
      desc: '웹검색형, 문서검색형, 대화형 세 가지 주요 유형이 있습니다. 용도에 따라 적절한 유형을 선택합니다.',
      focus: 'types',
    },
    {
      title: 'STEP 3 — Grounding (데이터 연결)',
      desc: 'LLM은 일반 지식만 가지고 있으므로, 내 데이터(웹사이트, 문서, DB)를 연결해야 정확한 답변을 생성합니다. 이것이 Grounding입니다.',
      focus: 'grounding',
    },
    {
      title: 'STEP 4 — RAG 패턴',
      desc: 'Retrieval-Augmented Generation: 질문 → 관련 문서 검색 → LLM에 전달 → 답변 생성. Agent Builder가 이 패턴을 자동으로 처리합니다.',
      focus: 'rag',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3 items-center flex-wrap justify-center">
            <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span style={{ fontSize: '28px' }}>📚</span>
              <div className="text-xs font-bold text-slate-600 mt-1">내 데이터</div>
            </div>
            <div className="text-lg text-slate-300">+</div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span style={{ fontSize: '28px' }}>🧠</span>
              <div className="text-xs font-bold text-blue-600 mt-1">LLM (Gemini)</div>
            </div>
            <div className="text-lg text-blue-400">=</div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span style={{ fontSize: '28px' }}>🤖</span>
              <div className="text-xs font-bold text-purple-600 mt-1">AI Agent</div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            코드 한 줄 없이 AI 에이전트를 만들 수 있습니다
          </div>
        </div>
      );
    }

    if (focus === 'types') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">에이전트 유형</div>
          </div>
          <div className="space-y-3">
            {agentTypes.map(function (t) {
              return (
                <div key={t.title} className="p-4 rounded-lg border transition-all duration-500"
                  style={{ background: t.color + '08', borderColor: t.color + '40' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '28px' }}>{t.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: t.color }}>{t.title}</div>
                      <div className="text-xs text-slate-500">{t.desc}</div>
                      <div className="text-xs text-slate-400 mt-0.5">활용: {t.use}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'grounding') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <span style={{ fontSize: '40px' }}>🔗</span>
            <div className="text-base font-bold text-emerald-600 mt-1">Grounding 소스</div>
          </div>
          <div className="w-full space-y-2">
            {[
              { icon: '🌐', name: '웹사이트 URL', desc: '공개 웹 페이지 크롤링' },
              { icon: '☁️', name: 'Cloud Storage', desc: 'PDF, HTML, TXT 파일' },
              { icon: '💾', name: 'BigQuery', desc: '구조화된 데이터 테이블' },
              { icon: '🔍', name: 'Google 검색', desc: '실시간 웹 검색 결과 활용' },
            ].map(function (item) {
              return (
                <div key={item.name} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-700">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // rag
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">RAG 패턴</div>
        {[
          { icon: '❓', label: '사용자 질문', desc: '"반품 정책이 뭔가요?"', color: '#64748b' },
          { icon: '🔍', label: '관련 문서 검색', desc: '벡터 검색으로 유사 문서 추출', color: '#3b82f6' },
          { icon: '📄', label: '컨텍스트 전달', desc: '검색 결과를 LLM에 프롬프트로 전달', color: '#8b5cf6' },
          { icon: '🧠', label: 'LLM 답변 생성', desc: '문서 기반 정확한 답변 생성', color: '#10b981' },
          { icon: '✅', label: '사용자에게 전달', desc: '출처 포함 답변 반환', color: '#f59e0b' },
        ].map(function (item, i) {
          return (
            <div key={item.label}>
              <div className="flex items-center gap-2 p-2 rounded border"
                style={{ borderColor: item.color + '30' }}>
                <span>{item.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: item.color }}>{item.label}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
              {i < 4 && <div className="text-center text-slate-300 text-sm">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Agent Builder 특징</div>
          <div className="space-y-3">
            {[
              { q: '코딩 필요?', a: '불필요. 콘솔에서 클릭으로 설정' },
              { q: 'LLM 모델', a: 'Gemini (Google) 기반' },
              { q: '배포 방식', a: 'API 엔드포인트 또는 웹 위젯' },
              { q: '비용', a: '쿼리당 과금 (무료 티어 있음)' },
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">유형 선택 가이드</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">상황</th>
                <th className="py-2 text-center text-slate-500">유형</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['실시간 최신 정보 필요', '웹검색형'],
                ['사내 문서 기반 답변', '문서검색형'],
                ['단계별 안내 (예약, 주문)', '대화형'],
                ['FAQ 자동 응답', '문서검색형'],
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 text-xs text-slate-600">{row[0]}</td>
                    <td className="py-2 text-center text-xs font-bold text-indigo-600">{row[1]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (focus === 'grounding') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">왜 Grounding이 필요한가?</div>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
              <strong>❌ Grounding 없이</strong><br/>
              LLM이 학습 데이터에만 의존 → 최신 정보 부족, 환각(Hallucination) 위험
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>✅ Grounding 적용</strong><br/>
              내 데이터 기반 답변 → 정확성 향상, 출처 제공 가능
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>팁:</strong> 문서 품질이 답변 품질을 결정합니다. 최신·정확한 문서를 유지하세요.
          </div>
        </div>
      );
    }

    // rag
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">RAG vs Fine-tuning</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 text-left text-slate-500"></th>
              <th className="py-2 text-center font-bold text-blue-500">RAG</th>
              <th className="py-2 text-center font-bold text-amber-500">Fine-tuning</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['데이터 업데이트', '즉시 반영', '재학습 필요'],
              ['비용', '저렴', '비쌈'],
              ['정확도', '높음 (출처 포함)', '맥락 이해 깊음'],
              ['난이도', '쉬움 (Agent Builder)', '어려움 (ML 지식)'],
              ['적합 사례', '문서 검색·FAQ', '특수 도메인 언어'],
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

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
