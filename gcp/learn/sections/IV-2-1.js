/**
 * IV-2-1.js — "Cloud Storage" — 창고/캐비닛/파일 3층 구조 + 접근 방식 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IV-2-1'] = function SectionIV21() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var STEPS = [
    { title: 'STEP 1 — Storage 구조', desc: 'Cloud Storage는 3층 구조입니다: Storage(서비스) → Bucket(캐비닛, 이름 전 세계 유일) → Object(파일). 파일 시스템의 폴더/파일과 비슷하지만, 실제로는 플랫한 키-값 저장소입니다.', focus: 'structure' },
    { title: 'STEP 2 — 🌐 Public Access', desc: 'URL만 알면 누구나 다운로드할 수 있는 공개 접근입니다. 프로필 이미지, CSS/JS 정적 에셋, 공개 데이터셋에 사용합니다.', focus: 'public' },
    { title: 'STEP 3 — 🔑 Signed URL', desc: '일시적으로만 접근을 허용하는 서명된 URL입니다. 만료 시간이 지나면 접근 불가. 영수증 PDF, 민감한 파일 공유에 사용합니다.', focus: 'signed' },
    { title: 'STEP 4 — 스토리지 클래스', desc: '접근 빈도에 따라 4단계 클래스가 있습니다. Standard(자주) → Nearline(월 1회) → Coldline(분기 1회) → Archive(년 1회). 빈도가 낮을수록 저장 비용이 싸지만, 읽기 비용이 비싸집니다.', focus: 'class' },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'structure') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">3층 구조</div>
          {[
            { icon: '🏭', label: 'Cloud Storage', sub: '서비스 전체', color: '#3b82f6' },
            { icon: '🗄️', label: 'Bucket', sub: '이름 전 세계 유일', color: '#f59e0b' },
            { icon: '📄', label: 'Object', sub: '파일 (이미지, PDF 등)', color: '#10b981' },
          ].map(function (item, i) {
            return (
              <div key={item.label}>
                <div className="flex items-center gap-3 p-3 rounded-lg border-2" style={{ borderColor: item.color + '60', marginLeft: i * 24 + 'px' }}>
                  <span style={{ fontSize: '32px' }}>{item.icon}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: item.color }}>{item.label}</div>
                    <div className="text-xs text-slate-400">{item.sub}</div>
                  </div>
                </div>
                {i < 2 && <div className="text-center text-slate-300 text-lg" style={{ marginLeft: (i * 24 + 20) + 'px' }}>↓</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'public' || focus === 'signed') {
      var isPublic = focus === 'public';
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '48px' }}>{isPublic ? '🌐' : '🔑'}</span>
          <h3 className={'text-lg font-bold ' + (isPublic ? 'text-green-600' : 'text-amber-600')}>
            {isPublic ? 'Public Access' : 'Signed URL'}
          </h3>
          <div className="w-full p-4 rounded-xl border-2" style={{ borderColor: isPublic ? '#10b981' : '#f59e0b', background: isPublic ? '#ecfdf5' : '#fffbeb' }}>
            <div className="text-center text-sm">
              <div className="mb-2">👤 사용자</div>
              <div className="text-2xl text-slate-300 mb-2">↓</div>
              <div className={'p-2 rounded-lg text-xs font-mono ' + (isPublic ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                {isPublic ? 'https://storage.googleapis.com/bucket/photo.jpg' : 'https://storage...?X-Goog-Signature=abc&Expires=3600'}
              </div>
              <div className="text-2xl text-slate-300 my-2">↓</div>
              <div>📦 Bucket → 📄 Object</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 text-center">
            {isPublic ? '제한 없음 — URL 아는 사람 모두 접근' : '만료 시간 후 접근 차단'}
          </div>
        </div>
      );
    }

    // class
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">스토리지 클래스</div>
        <div className="space-y-2">
          {[
            { name: 'Standard', freq: '자주 접근', cost: '저장 비쌈, 읽기 무료', color: '#3b82f6', bar: 100 },
            { name: 'Nearline', freq: '월 1회', cost: '저장 -50%, 읽기 유료', color: '#10b981', bar: 70 },
            { name: 'Coldline', freq: '분기 1회', cost: '저장 -75%, 읽기 비쌈', color: '#f59e0b', bar: 40 },
            { name: 'Archive', freq: '년 1회', cost: '저장 최저, 읽기 최비쌈', color: '#ef4444', bar: 15 },
          ].map(function (c) {
            return (
              <div key={c.name} className="p-2 rounded-lg border border-slate-200 bg-white">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold" style={{ color: c.color }}>{c.name}</span>
                  <span className="text-slate-400">{c.freq}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: c.bar + '%', background: c.color }}></div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{c.cost}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;
    var codes = {
      structure: '# 버킷 생성\ngcloud storage buckets create \\\n  gs://my-unique-bucket-name \\\n  --location=asia-northeast3\n\n# 파일 업로드\ngcloud storage cp \\\n  ./photo.jpg \\\n  gs://my-unique-bucket-name/',
      public: '# 공개 설정\ngcloud storage buckets \\\n  add-iam-policy-binding \\\n  gs://my-bucket \\\n  --member=allUsers \\\n  --role=roles/storage.objectViewer\n\n# URL: https://storage\n#   .googleapis.com/my-bucket/\n#   photo.jpg',
      signed: '# Signed URL 생성 (1시간)\ngcloud storage sign-url \\\n  gs://my-bucket/receipt.pdf \\\n  --duration=1h\n\n# → https://storage...?\n#   X-Goog-Signature=abc\n#   &X-Goog-Expires=3600',
      class: '# 클래스 지정 생성\ngcloud storage buckets create \\\n  gs://my-archive-bucket \\\n  --storage-class=COLDLINE\n\n# 자동 전환 (Lifecycle)\n# 30일 후 Nearline으로\n# 90일 후 Coldline으로\n# 365일 후 Archive로',
    };

    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">CLI 명령어</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400">Terminal</div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{codes[focus]}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
