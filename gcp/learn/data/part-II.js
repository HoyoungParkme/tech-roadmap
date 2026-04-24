/**
 * part-II.js
 * 경로: learn/data/part-II.js
 * 목적: Part II "클라우드 비교" 3개 Section 본문 데이터
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sections = window.GCPLearn.sections || {};

window.GCPLearn.sections['II-1-1'] = {
  id: 'II-1-1',
  title: '세 공룡의 포지션',
  part: 'II',
  partTitle: '클라우드 비교',
  chapter: '1',
  chapterTitle: 'AWS vs Azure vs GCP',
  difficulty: '★☆☆',
  prerequisites: 'I-1-3',
  objective: '이 Section을 마치면 AWS·Azure·GCP의 시장 위치와 대표 강점을 한 문장씩 설명할 수 있다.',
  paragraphs: [
    '클라우드 시장은 마치 세 마리 공룡이 영역을 나눠 차지한 생태계처럼 보인다. 덩치와 성격이 제각각인 세 공룡, 즉 AWS·Azure·GCP는 저마다 다른 무기를 앞세워 시장을 분할하고 있다. 어떤 공룡이 옳고 그른 것이 아니라, 누가 무엇을 잘하는지를 파악하는 것이 출발점이다.',
    '첫 번째 공룡인 AWS(Amazon Web Services)는 2006년에 가장 먼저 시장을 개척한 맏형이다. 서비스 수가 세 클라우드 중 가장 많고, 커뮤니티와 레퍼런스가 풍부해 "일단 뭘 만들어야 하는데 어디서 시작할지 모르겠다"는 팀이 가장 많이 선택한다. 두 번째 공룡 Azure(Microsoft Azure)는 기업 사무실의 오랜 파트너다. Windows Server와 Active Directory를 이미 쓰는 기업이라면 Azure로의 이동이 자연스럽다. 세 번째 공룡 GCP(Google Cloud Platform)는 데이터·AI·Kubernetes의 본고장이다. 구글이 내부에서 실제로 쓰던 인프라 기술을 클라우드 서비스로 공개한 것이 많아, 데이터 분석이나 머신러닝 파이프라인을 주력으로 다루는 팀에게 강하다.',
    '실무에서 클라우드를 선택할 때는 단순히 시장 점유율만 보고 결정하지 않는다. 팀이 이미 익숙한 기술 스택이 무엇인지, 당장 필요한 서비스가 어느 공룡에게서 더 잘 제공되는지, 그리고 장기적으로 비용을 어떻게 맞출 것인지를 함께 고려해야 한다.',
    '세 공룡의 이름과 성격을 머릿속에 고정해두는 것만으로도 클라우드 기술 뉴스나 채용 공고를 읽을 때 맥락이 보이기 시작한다. 다음 Section에서는 이 중 GCP가 특히 강점을 가지는 세 영역을 집중적으로 살펴본다.',
  ],
  keywords: ['AWS', 'Azure', 'GCP', '시장 점유율', 'Kubernetes(쿠버네티스)'],
  prevSection: 'I-2-1',
  nextSection: 'II-1-2',
};

window.GCPLearn.sections['II-1-2'] = {
  id: 'II-1-2',
  title: 'GCP의 특화 영역 — 데이터 · AI · 컨테이너',
  part: 'II',
  partTitle: '클라우드 비교',
  chapter: '1',
  chapterTitle: 'AWS vs Azure vs GCP',
  difficulty: '★★☆',
  prerequisites: 'II-1-1',
  objective: '이 Section을 마치면 BigQuery·Vertex AI·GKE가 GCP에서 갖는 위치를 설명할 수 있다.',
  paragraphs: [
    'GCP의 서비스 상당수는 구글이 자사 서비스를 운영하면서 직접 만들어 쓰던 내부 기술을 외부에 공개한 것이다. 구글 검색, 유튜브, 지메일을 돌리려면 수십억 건의 요청을 매일 처리해야 한다. 그 과정에서 탄생한 기술들이 지금 GCP의 핵심 서비스로 들어와 있다.',
    '가장 먼저 꼽히는 것이 BigQuery다. BigQuery는 페타바이트 규모의 데이터를 SQL로 분석할 수 있는 관리형 서비스로, 원래 구글 광고 분석팀이 내부에서 쓰던 시스템에서 출발했다. 서버를 직접 띄우거나 관리할 필요 없이 SQL 쿼리만 날리면 수억 행의 데이터도 수초 안에 결과가 나온다.',
    '다음은 Vertex AI다. 머신러닝 모델을 만들면 학습, 배포, 모니터링 단계가 각각 따로 관리되기 쉬운데, Vertex AI는 이 세 단계를 하나의 플랫폼에서 통합해 관리한다. 마지막으로 GKE(Google Kubernetes Engine)는 Kubernetes를 만든 구글이 직접 운영하는 관리형 쿠버네티스 클러스터 서비스다.',
    '주니어 개발자 입장에서 실감할 수 있는 장면을 하나 떠올려보자. 로그 데이터 수백만 건을 분석해야 하는데, 로컬 PC에서 pandas로 돌리면 몇 시간이 걸릴 수 있다. 이때 BigQuery에 데이터를 올리고 SQL을 실행하면 같은 작업이 1분 이내로 끝나기도 한다.',
    'BigQuery·Vertex AI·GKE, 이 세 서비스가 GCP를 선택하는 이유의 대부분을 차지한다. 다음 Section에서는 AWS 서비스 이름과 GCP 서비스 이름을 나란히 비교하는 대응표를 살펴본다.',
  ],
  keywords: ['BigQuery', 'Vertex AI', 'GKE(Google Kubernetes Engine)', '관리형 서비스(Managed Service)'],
  prevSection: 'II-1-1',
  nextSection: 'II-1-3',
};

window.GCPLearn.sections['II-1-3'] = {
  id: 'II-1-3',
  title: '주요 서비스 대응표 (AWS vs GCP)',
  part: 'II',
  partTitle: '클라우드 비교',
  chapter: '1',
  chapterTitle: 'AWS vs Azure vs GCP',
  difficulty: '★★☆',
  prerequisites: 'II-1-1',
  objective: '이 Section을 마치면 AWS 주요 서비스에 대응하는 GCP 서비스를 찾아볼 수 있다.',
  paragraphs: [
    'AWS를 먼저 배운 개발자가 GCP로 넘어올 때 가장 먼저 맞닥뜨리는 벽은 "이게 AWS에서 뭐에 해당하지?"라는 혼란이다. 서비스 이름이 완전히 다르기 때문이다. AWS에서 S3라고 부르던 것을 GCP는 Cloud Storage라고 부르고, Lambda는 Cloud Functions, EKS는 GKE가 된다.',
    '이 중 GCP를 처음 쓸 때 자주 마주치는 서비스 몇 가지를 짚어두겠다. Cloud Run은 Docker 컨테이너를 서버 관리 없이 바로 실행하는 서비스다. Cloud SQL은 PostgreSQL이나 MySQL 같은 관계형 데이터베이스를 GCP가 대신 운영해주는 관리형 서비스다. Artifact Registry는 Docker 이미지를 안전하게 저장하는 컨테이너 레지스트리다.',
    '대응표는 외울 필요가 없다. 실제 프로젝트에서 특정 기능이 필요할 때 이 표를 펼쳐 GCP 서비스 이름을 확인하면 된다. 이름을 알면 공식 문서 검색도, 팀 내 대화도, 구직 공고 해석도 훨씬 빠르게 진행된다.',
  ],
  // 대응표 데이터
  comparisonTable: [
    { category: '서버리스 컨테이너', aws: 'ECS / App Runner', gcp: 'Cloud Run' },
    { category: '관리형 쿠버네티스', aws: 'EKS', gcp: 'GKE' },
    { category: '가상 머신', aws: 'EC2', gcp: 'Compute Engine' },
    { category: '오브젝트 스토리지', aws: 'S3', gcp: 'Cloud Storage' },
    { category: '관리형 관계형 DB', aws: 'RDS', gcp: 'Cloud SQL' },
    { category: 'NoSQL', aws: 'DynamoDB', gcp: 'Firestore / Bigtable' },
    { category: '서버리스 함수', aws: 'Lambda', gcp: 'Cloud Functions' },
    { category: '컨테이너 레지스트리', aws: 'ECR', gcp: 'Artifact Registry' },
    { category: '로드 밸런서', aws: 'ALB / NLB', gcp: 'Cloud Load Balancing' },
    { category: '로깅', aws: 'CloudWatch Logs', gcp: 'Cloud Logging' },
  ],
  keywords: ['Cloud Run', 'Cloud SQL', 'Artifact Registry', 'Cloud Logging'],
  prevSection: 'II-1-2',
  nextSection: 'III-1-1',
};
