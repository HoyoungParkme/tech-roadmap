/**
 * part-III.js
 * 경로: learn/data/part-III.js
 * 목적: Part III "GCP 계정 · gcloud CLI" 5개 Section 본문 데이터
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sections = window.GCPLearn.sections || {};

window.GCPLearn.sections['III-1-1'] = {
  id: 'III-1-1',
  title: 'GCP 계정 생성과 프로젝트 구조',
  part: 'III',
  partTitle: 'GCP 계정 · gcloud CLI',
  chapter: '1',
  chapterTitle: '계정과 CLI',
  difficulty: '★★☆',
  prerequisites: '없음',
  objective: '이 Section을 마치면 GCP 계정을 만들고, 프로젝트(Project)가 무엇인지 설명할 수 있다.',
  paragraphs: [
    '회사 건물에 입주한다고 상상해 보자. 건물 자체는 하나지만, 각 층은 서로 다른 팀이 쓴다. 마케팅 팀 문서가 개발 팀 서랍에 섞이지 않도록 층마다 잠금장치가 있다. GCP의 프로젝트(Project)가 이 역할을 한다. GCP 계정 하나 아래에 여러 프로젝트를 두고, 청구·권한·리소스를 프로젝트 단위로 완전히 격리한다.',
    'GCP 계정을 처음 만들면 무료 체험 크레딧($300)이 자동으로 부여된다. 이 크레딧 안에서 Cloud Run, Cloud SQL 등 대부분의 서비스를 실습할 수 있다. GCP 리소스 계층은 조직(Organization) — 프로젝트(Project) — 리소스 순서로 내려간다. 조직은 회사 전체를 묶는 최상위 단위이고, 프로젝트는 그 아래 실제 서비스나 환경을 담는 그릇이다. 청구 계정(Billing Account)은 프로젝트에 연결해 요금을 집계한다.',
    '실무에서는 하나의 서비스를 dev-project, staging-project, prod-project로 나누는 방식이 일반적이다. 개발자가 dev-project에서 실험적인 설정을 바꾸더라도, 운영 환경(prod-project)에는 영향이 전혀 없다. 프로젝트를 만들 때 부여되는 프로젝트 ID는 GCP 전체에서 고유한 식별자로, 한 번 정하면 변경할 수 없다.',
    'GCP를 시작하는 첫 단계는 계정을 만들고 프로젝트 구조를 이해하는 것이다. 프로젝트가 무엇인지 이해해야 이후 CLI 설정, 리소스 배포, 권한 관리 모두 자연스럽게 이어진다.',
  ],
  keywords: ['프로젝트(Project)', '조직(Organization)', '청구 계정(Billing Account)', '리소스 계층'],
  prevSection: 'II-1-3',
  nextSection: 'III-1-2',
};

window.GCPLearn.sections['III-1-2'] = {
  id: 'III-1-2',
  title: 'gcloud CLI 설치와 초기 설정',
  part: 'III',
  partTitle: 'GCP 계정 · gcloud CLI',
  chapter: '1',
  chapterTitle: '계정과 CLI',
  difficulty: '★★☆',
  prerequisites: 'III-1-1',
  objective: '이 Section을 마치면 gcloud CLI를 설치하고 gcloud init으로 프로젝트·리전을 설정할 수 있다.',
  paragraphs: [
    'TV를 제어하는 방법은 두 가지다. 본체 버튼을 직접 누르거나 리모컨을 쓰거나. 리모컨이 있으면 소파에서 채널을 바꾸고 볼륨을 조절할 수 있다. gcloud CLI가 GCP에서 리모컨 역할을 한다. console.cloud.google.com 웹 화면을 마우스로 클릭하는 대신, 터미널에서 명령어 한 줄로 동일한 작업을 수행할 수 있다.',
    'gcloud CLI는 Google Cloud SDK에 포함된 명령줄 도구다. 설치 후 처음 실행하는 명령은 gcloud init이다. 이 명령 하나가 세 단계를 순서대로 안내한다. 첫째, 구글 계정 인증 — 브라우저가 열리며 계정 로그인을 요청한다. 둘째, 작업할 프로젝트 선택. 셋째, 기본 리전 설정 — 이후 명령에서 --region을 매번 쓰지 않아도 되도록 기본값을 저장한다.',
    '실무에서 gcloud CLI가 빛을 발하는 순간은 반복 작업을 자동화할 때다. 콘솔 화면에서 10번 클릭해야 하는 배포 과정을 셸 스크립트 한 파일로 만들어두면, 이후에는 파일 하나를 실행하는 것으로 끝난다.',
    'gcloud CLI는 GCP를 다루는 기본 도구다. Part IV에서 Cloud Run 배포, Cloud SQL 연결 등 핵심 작업을 수행할 때 이 CLI가 계속 등장한다.',
  ],
  codeBlocks: [
    {
      title: 'gcloud CLI 초기 설정',
      language: 'bash',
      code: '# gcloud CLI 설치 후 초기 설정\ngcloud init\n\n# 현재 설정 확인\ngcloud config list\n\n# 프로젝트 변경\ngcloud config set project MY_PROJECT_ID',
    },
  ],
  keywords: ['gcloud CLI', 'gcloud init', '인증(Authentication)', '프로젝트 ID(Project ID)', '리전(Region)'],
  prevSection: 'III-1-1',
  nextSection: 'III-1-3',
};

window.GCPLearn.sections['III-1-3'] = {
  id: 'III-1-3',
  title: '리전(Region)과 존(Zone) 선택하기',
  part: 'III',
  partTitle: 'GCP 계정 · gcloud CLI',
  chapter: '1',
  chapterTitle: '계정과 CLI',
  difficulty: '★★☆',
  prerequisites: 'III-1-2',
  objective: '이 Section을 마치면 리전·존의 차이를 이해하고 서비스 특성에 맞는 리전을 선택할 수 있다.',
  paragraphs: [
    '전국에 물류 창고가 있는 택배 회사를 떠올려보자. 서울 고객에게 제주 창고에서 물건을 보내면 시간이 오래 걸린다. 그래서 서울에도 창고를 두고, 서울 고객의 주문은 서울 창고에서 처리한다. GCP의 리전(Region)이 이 역할을 한다. 리전은 GCP 데이터센터들이 모여 있는 지리적 위치다.',
    '리전은 asia-northeast3(서울), us-central1(미국 중부)처럼 구체적인 지명으로 구분된다. 한국 사용자에게 서비스한다면 서울 리전을 선택해야 지연 시간(Latency)이 짧아진다. 존(Zone)은 리전 안의 더 작은 단위다. 서울 리전에는 asia-northeast3-a, asia-northeast3-b, asia-northeast3-c 세 존이 있다. 각 존은 독립된 전력·냉각·네트워크를 갖춘 데이터센터 집합이다.',
    '실무에서 리전과 존 선택은 단순한 옵션이 아니다. 데이터 규정 준수가 중요한 서비스는 사용자 데이터가 특정 국가 안에 머물도록 리전을 강제해야 하는 경우가 있다. 고가용성이 필요한 서비스는 리소스를 여러 존에 분산해 단일 존 장애로 인한 서비스 중단을 막는다.',
    '리전은 성능과 가용성을 동시에 결정하는 핵심 설정이다. Part IV에서 Cloud Run과 Cloud SQL을 배포할 때 asia-northeast3가 반복해서 등장하는 이유가 여기에 있다.',
  ],
  keywords: ['리전(Region)', '존(Zone)', '지연 시간(Latency)', '고가용성(High Availability)', 'asia-northeast3(서울)'],
  prevSection: 'III-1-2',
  nextSection: 'III-2-1',
};

window.GCPLearn.sections['III-2-1'] = {
  id: 'III-2-1',
  title: 'Cloud Console 주요 화면 둘러보기',
  part: 'III',
  partTitle: 'GCP 계정 · gcloud CLI',
  chapter: '2',
  chapterTitle: 'Console과 Billing',
  difficulty: '★★☆',
  prerequisites: 'III-1-1',
  objective: '이 Section을 마치면 Cloud Console에서 리소스 목록 조회·생성·삭제를 수행할 수 있다.',
  paragraphs: [
    '공항 관제탑에는 모든 항공기의 위치·상태·연료를 한 화면에서 보고 제어하는 시스템이 있다. GCP의 Cloud Console(console.cloud.google.com)이 이 역할을 한다. GCP 계정에 속한 모든 리소스를 웹 브라우저에서 시각적으로 확인하고 조작하는 포털이다.',
    '화면 왼쪽의 내비게이션 메뉴에는 GCP 서비스 목록이 카테고리별로 정리되어 있다. 상단 검색창에 서비스 이름을 입력하면 더 빠르게 이동할 수 있다. 오른쪽 상단의 Cloud Shell 버튼을 누르면 브라우저 안에 터미널이 열린다. 별도 설치 없이 gcloud CLI를 바로 실행할 수 있다.',
    '콘솔에서 할 수 있는 대부분의 작업은 gcloud CLI로도 동일하게 수행할 수 있다. 처음에는 콘솔의 시각적 인터페이스로 서비스 구조를 파악하고, 이후에는 같은 작업을 CLI 명령어로 옮겨 자동화하는 식이 효율적이다.',
    'Cloud Console은 GCP 전체를 한눈에 파악하는 시작점이다. 계정 생성, CLI 설정, 리전 선택까지 마쳤다면, 이제 Part IV에서 실제 서비스를 배포할 준비가 갖춰진 것이다.',
  ],
  keywords: ['Cloud Console', 'Cloud Shell', '내비게이션 메뉴', '리소스 조회'],
  prevSection: 'III-1-3',
  nextSection: 'III-2-2',
};

window.GCPLearn.sections['III-2-2'] = {
  id: 'III-2-2',
  title: 'Billing 알람 설정하기',
  part: 'III',
  partTitle: 'GCP 계정 · gcloud CLI',
  chapter: '2',
  chapterTitle: 'Console과 Billing',
  difficulty: '★★☆',
  prerequisites: 'III-1-1',
  objective: '이 Section을 마치면 GCP 프로젝트에 예산 알림을 설정해 예상치 못한 비용 초과를 사전에 방지할 수 있다.',
  paragraphs: [
    '수도 계량기 옆에 월 사용량 한도를 설정해두면, 기준선을 넘는 순간 알림이 온다. GCP의 Budget Alert(예산 알림)도 같은 역할을 한다. Part I(I-2-1)에서 "클라우드는 쓴 만큼 과금되며, Budget Alert으로 예상치 못한 청구를 막을 수 있다"고 배웠다. 이 Section에서는 그 개념을 실제 명령으로 구현한다.',
    '학습 과정에서 비용 사고가 발생하는 가장 흔한 패턴이 있다. 실습용으로 Cloud Run, Cloud SQL, Compute Engine 인스턴스를 켜놓은 채 다음 주제로 넘어가다가 잊어버리는 것이다. 특히 Cloud SQL과 Compute Engine은 Scale to Zero가 없기 때문에, 명시적으로 중지하지 않으면 비용이 멈추지 않는다.',
    'gcloud billing budgets create 명령은 청구 계정 단위로 예산을 생성한다. --budget-amount로 월 예산 금액을 지정하고, --threshold-rule로 세 가지 임계값(50%, 90%, 100%)을 설정한다. 50% 시점 알림은 "리소스를 점검할 시간"이라는 신호이고, 90%는 "지금 당장 불필요한 리소스를 정리하라"는 경고이며, 100%는 "예산을 넘었다"는 최종 알림이다.',
    'Budget Alert은 GCP가 자동으로 리소스를 중지하는 기능이 아니다. 알림을 받은 뒤 직접 정리하는 것은 여전히 사용자의 몫이다. 그러나 학습을 시작하기 전에 이 명령 하나를 먼저 실행해두는 습관이 불필요한 비용 낭비를 막는 첫 번째 방어선이 된다.',
  ],
  codeBlocks: [
    {
      title: '예산 알림 생성',
      language: 'bash',
      code: '# 예산 알림 생성 (월 $50)\ngcloud billing budgets create \\\n  --billing-account=BILLING_ACCOUNT_ID \\\n  --display-name="Monthly Budget" \\\n  --budget-amount=50USD \\\n  --threshold-rule=percent=0.5 \\\n  --threshold-rule=percent=0.9 \\\n  --threshold-rule=percent=1.0',
    },
  ],
  keywords: ['Budget Alert', '예산 알림', '임계값(Threshold)', 'gcloud billing budgets'],
  prevSection: 'III-2-1',
  nextSection: 'IV-1-1',
};
