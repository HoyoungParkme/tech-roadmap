/**
 * XI-1-3.js
 * 경로: learn/sections/XI-1-3.js
 * 목적: "Looker Studio 연동" — BigQuery 데이터를 시각화하는 과정 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['XI-1-3'] = function SectionXI13() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var chartTypes = [
    { icon: '📊', name: '막대 차트', use: '카테고리별 비교', example: '월별 매출' },
    { icon: '🥧', name: '원형 차트', use: '비율 비교', example: '지역별 매출 비중' },
    { icon: '📈', name: '꺾은선 차트', use: '시계열 추이', example: '일별 사용자 수' },
    { icon: '🗺️', name: '지도 차트', use: '지역 데이터', example: '국가별 트래픽' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — Looker Studio란?',
      desc: 'Looker Studio(구 Data Studio)는 무료 BI(Business Intelligence) 도구입니다. BigQuery 데이터를 드래그&드롭으로 시각화하여 대시보드를 만들 수 있습니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — BigQuery 데이터 연결',
      desc: 'Looker Studio에서 BigQuery 프로젝트 → Dataset → Table을 선택하면 바로 연결됩니다. SQL 쿼리를 직접 작성하여 커스텀 데이터 소스도 만들 수 있습니다.',
      focus: 'connect',
    },
    {
      title: 'STEP 3 — 차트 생성',
      desc: '막대, 원형, 꺾은선, 지도 등 다양한 차트를 드래그&드롭으로 생성합니다. 필터와 날짜 범위도 추가할 수 있습니다.',
      focus: 'charts',
    },
    {
      title: 'STEP 4 — 공유와 자동 갱신',
      desc: '대시보드를 링크로 공유하면 팀원들이 실시간 데이터를 볼 수 있습니다. BigQuery 데이터가 업데이트되면 차트도 자동 갱신됩니다.',
      focus: 'share',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3 items-center flex-wrap justify-center">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span style={{ fontSize: '28px' }}>💾</span>
              <div className="text-xs font-bold text-blue-600 mt-1">BigQuery</div>
              <div className="text-xs text-slate-400">데이터</div>
            </div>
            <div className="text-lg text-blue-400">→</div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span style={{ fontSize: '28px' }}>📊</span>
              <div className="text-xs font-bold text-emerald-600 mt-1">Looker Studio</div>
              <div className="text-xs text-slate-400">시각화</div>
            </div>
            <div className="text-lg text-emerald-400">→</div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span style={{ fontSize: '28px' }}>👥</span>
              <div className="text-xs font-bold text-amber-600 mt-1">대시보드</div>
              <div className="text-xs text-slate-400">팀 공유</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center mt-2">
            코드 없이 드래그&드롭으로 대시보드 생성
          </div>
        </div>
      );
    }

    if (focus === 'connect') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">데이터 연결 순서</div>
          {[
            { icon: '📊', label: 'Looker Studio 열기', desc: 'lookerstudio.google.com' },
            { icon: '🔗', label: '데이터 소스 추가', desc: 'BigQuery 커넥터 선택' },
            { icon: '📁', label: '프로젝트 → Dataset → Table', desc: '또는 Custom Query 작성' },
            { icon: '✅', label: '연결 완료', desc: '필드 자동 감지 → 차트 생성 가능' },
          ].map(function (item, i) {
            return (
              <div key={item.label}>
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                  <span>{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-700">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                </div>
                {i < 3 && <div className="text-center text-slate-300 text-sm">↓</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'charts') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">차트 유형</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {chartTypes.map(function (c) {
              return (
                <div key={c.name} className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                  <span style={{ fontSize: '28px' }}>{c.icon}</span>
                  <div className="text-xs font-bold text-slate-700 mt-1">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.use}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // share
    return (
      <div className="flex flex-col items-center gap-4">
        <span style={{ fontSize: '48px' }}>🔗</span>
        <div className="text-base font-bold text-indigo-600">대시보드 공유</div>
        <div className="w-full space-y-2">
          {[
            { icon: '🔗', label: '링크 공유', desc: 'URL로 팀원에게 전달' },
            { icon: '📧', label: '이메일 예약 발송', desc: '매주 월요일 자동 리포트' },
            { icon: '📌', label: '임베드', desc: '사내 웹에 iframe으로 삽입' },
          ].map(function (item) {
            return (
              <div key={item.label} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                <span>{item.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-700">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Looker Studio 특징</div>
          <div className="space-y-3">
            {[
              { q: '비용', a: '무료 (Google 계정만 있으면 사용 가능)' },
              { q: '코딩 필요?', a: '불필요. 드래그&드롭 인터페이스' },
              { q: '데이터 소스', a: 'BigQuery, Sheets, GA4, Cloud SQL 등 800+' },
              { q: '실시간 갱신', a: '데이터 소스 업데이트 시 차트 자동 반영' },
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

    if (focus === 'connect') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">연결 팁</div>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>Custom Query 추천</strong><br/>
              전체 테이블 대신 필요한 데이터만 SELECT하면 성능과 비용 모두 절약됩니다.
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>캐시 설정</strong><br/>
              데이터 소스의 "데이터 새로 고침" 주기를 설정하면 불필요한 BigQuery 쿼리를 줄일 수 있습니다.
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
              <strong>권한 주의</strong><br/>
              대시보드를 공유받은 사람도 BigQuery 조회 권한이 필요합니다.
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'charts') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">차트 선택 가이드</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">목적</th>
                <th className="py-2 text-center text-slate-500">차트</th>
              </tr>
            </thead>
            <tbody>
              {chartTypes.map(function (c) {
                return (
                  <tr key={c.name} className="border-b border-slate-100">
                    <td className="py-2 text-xs text-slate-600">{c.example}</td>
                    <td className="py-2 text-center text-xs font-bold text-indigo-600">{c.icon} {c.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>팁:</strong> 필터 컨트롤과 날짜 범위 셀렉터를 추가하면 인터랙티브 대시보드가 됩니다.
          </div>
        </div>
      );
    }

    // share
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">공유 권한 설정</div>
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-sm font-semibold text-slate-700">Viewer</div>
            <div className="text-xs text-slate-500 mt-1">대시보드 조회만 가능 (편집 불가)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-sm font-semibold text-slate-700">Editor</div>
            <div className="text-xs text-slate-500 mt-1">대시보드 수정 가능</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
            <strong>자동 리포트</strong><br/>
            이메일 예약 기능으로 매주/매월 정기 리포트를 자동 발송할 수 있습니다.
          </div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
