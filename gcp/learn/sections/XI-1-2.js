/**
 * XI-1-2.js
 * 경로: learn/sections/XI-1-2.js
 * 목적: "BigQuery 실습" — BigQuery 데이터 구조와 쿼리 실습 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['XI-1-2'] = function SectionXI12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var dataStructure = [
    { icon: '🏗️', name: 'Project', desc: 'GCP 프로젝트 (결제·권한 단위)', color: '#64748b' },
    { icon: '📁', name: 'Dataset', desc: '테이블 묶음 (폴더)', color: '#3b82f6' },
    { icon: '📄', name: 'Table', desc: '실제 데이터 (행·열)', color: '#10b981' },
    { icon: '🔍', name: 'SQL Query', desc: '데이터 분석 (SELECT ...)', color: '#f59e0b' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — BigQuery 데이터 구조',
      desc: 'BigQuery는 Project → Dataset → Table 계층 구조입니다. Dataset은 폴더, Table은 파일에 비유됩니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — Dataset과 Table 생성',
      desc: 'bq CLI로 Dataset을 만들고, CSV·JSON 데이터를 Table로 로드합니다.',
      focus: 'create',
    },
    {
      title: 'STEP 3 — SQL 쿼리 실행',
      desc: 'BigQuery는 표준 SQL을 지원합니다. SELECT, WHERE, GROUP BY, JOIN 등 익숙한 문법을 그대로 사용합니다.',
      focus: 'query',
    },
    {
      title: 'STEP 4 — 비용 최적화 팁',
      desc: 'BigQuery는 스캔한 데이터 양에 비례하여 과금됩니다. SELECT * 대신 필요한 컬럼만 지정하면 비용을 줄일 수 있습니다.',
      focus: 'tips',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">BigQuery 계층 구조</div>
          </div>
          <div className="space-y-2">
            {dataStructure.map(function (d, i) {
              return (
                <div key={d.name}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border"
                    style={{ background: d.color + '08', borderColor: d.color + '30', marginLeft: (i * 16) + 'px' }}>
                    <span style={{ fontSize: '24px' }}>{d.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: d.color }}>{d.name}</div>
                      <div className="text-xs text-slate-500">{d.desc}</div>
                    </div>
                  </div>
                  {i < dataStructure.length - 1 && (
                    <div className="text-slate-300 text-sm py-0.5" style={{ marginLeft: (i * 16 + 24) + 'px' }}>↓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'create') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">생성 흐름</div>
          {[
            { icon: '📁', label: 'Dataset 생성', desc: 'my_dataset (리전: US)' },
            { icon: '📄', label: 'Table 생성', desc: 'orders (스키마 정의)' },
            { icon: '📥', label: '데이터 로드', desc: 'CSV/JSON → Table' },
          ].map(function (item, i) {
            return (
              <div key={item.label}>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                </div>
                {i < 2 && <div className="text-center text-slate-300 text-lg py-1">↓</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'query') {
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '36px' }}>🔍</span>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">SQL 쿼리 예시</div>
          </div>
          <div className="space-y-3">
            {[
              { title: '전체 매출', sql: 'SELECT SUM(amount)\nFROM my_dataset.orders' },
              { title: '월별 집계', sql: 'SELECT month, SUM(amount)\nFROM my_dataset.orders\nGROUP BY month' },
              { title: '상위 10 고객', sql: 'SELECT user_id, SUM(amount) as total\nFROM my_dataset.orders\nGROUP BY user_id\nORDER BY total DESC\nLIMIT 10' },
            ].map(function (q) {
              return (
                <div key={q.title} className="rounded-lg overflow-hidden border border-slate-200">
                  <div className="bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{q.title}</div>
                  <div className="bg-slate-800 p-2 text-xs font-mono text-blue-300 whitespace-pre-wrap">{q.sql}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // tips
    return (
      <div>
        <div className="text-center mb-3">
          <span style={{ fontSize: '36px' }}>💰</span>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">비용 최적화</div>
        </div>
        <div className="space-y-3">
          {[
            { icon: '❌', label: 'SELECT *', cost: '전체 컬럼 스캔 → 비쌈', bad: true },
            { icon: '✅', label: 'SELECT col1, col2', cost: '필요한 컬럼만 → 절약', bad: false },
            { icon: '✅', label: 'Partitioned Table', cost: '날짜별 분할 → 범위 스캔만', bad: false },
            { icon: '✅', label: 'Clustered Table', cost: '자주 필터하는 컬럼 기준 정렬', bad: false },
          ].map(function (item) {
            return (
              <div key={item.label} className={'flex items-center gap-3 p-2 rounded-lg border ' +
                (item.bad ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200')}>
                <span>{item.icon}</span>
                <div>
                  <code className={'text-xs font-bold ' + (item.bad ? 'text-red-600' : 'text-emerald-600')}>{item.label}</code>
                  <div className="text-xs text-slate-500">{item.cost}</div>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">주소 형식</div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm font-semibold text-slate-700">테이블 참조 형식</div>
              <code className="text-xs text-indigo-600 mt-1 block">project.dataset.table</code>
              <div className="text-xs text-slate-400 mt-1">예: my-project.my_dataset.orders</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>공개 데이터셋</strong><br/>
              bigquery-public-data 프로젝트에서 무료 데이터로 연습 가능
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'create') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">CLI 명령어</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">bq</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Dataset 생성\nbq mk --dataset \\\n  --location=US \\\n  my_dataset\n\n# CSV 로드\nbq load \\\n  --source_format=CSV \\\n  --autodetect \\\n  my_dataset.orders \\\n  gs://my-bucket/orders.csv\n\n# 테이블 확인\nbq show my_dataset.orders'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'query') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">쿼리 실행 방법</div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>콘솔</strong>: BigQuery Studio에서 SQL 직접 입력·실행
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              <strong>CLI</strong>: <code>bq query --use_legacy_sql=false 'SELECT ...'</code>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>클라이언트 라이브러리</strong>: Python, Java, Go 등에서 API 호출
            </div>
          </div>
          <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>팁:</strong> 쿼리 실행 전 우측 상단에서 예상 스캔 데이터 양을 확인하세요.
          </div>
        </div>
      );
    }

    // tips
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">과금 모델</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 text-left text-slate-500">항목</th>
              <th className="py-2 text-left text-slate-500">가격</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['쿼리 (On-demand)', '$5 / TB 스캔'],
              ['쿼리 (월정액)', '$2,000 / 100 슬롯'],
              ['저장 (Active)', '$0.02 / GB·월'],
              ['저장 (Long-term)', '$0.01 / GB·월'],
              ['무료 티어', '매월 1TB 쿼리 + 10GB 저장'],
            ].map(function (row) {
              return (
                <tr key={row[0]} className="border-b border-slate-100">
                  <td className="py-2 text-xs text-slate-600">{row[0]}</td>
                  <td className="py-2 text-xs font-semibold text-slate-700">{row[1]}</td>
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
