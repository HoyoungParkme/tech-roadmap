/**
 * part-IV.js
 * 경로: learn/data/part-IV.js
 * 목적: Part IV "Compute · Storage · DB" 7개 Section 본문 데이터
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sections = window.GCPLearn.sections || {};

window.GCPLearn.sections['IV-1-1'] = {
  id: 'IV-1-1', title: 'Cloud Run 요청이 처리되는 흐름 (시각화)',
  part: 'IV', partTitle: 'Compute · Storage · DB', chapter: '1', chapterTitle: 'Cloud Run',
  difficulty: '★★☆', prerequisites: 'III-1-2, III-1-3',
  objective: '이 Section을 마치면 클라이언트 HTTPS 요청이 Cloud Run 인프라에서 처리되는 6단계를 순서대로 설명할 수 있다.',
  paragraphs: [
    '택배 회사 물류 센터를 떠올려보자. 주문이 들어오면 창고 직원이 출근해 상자를 꾸리고, 주문이 없는 밤에는 직원을 대기시키지 않는다. Cloud Run이 동작하는 방식이 정확히 이와 같다. 요청이 오면 인스턴스가 켜지고, 요청이 없으면 인스턴스를 0개까지 줄인다. 이를 Scale to Zero라 부른다.',
    'Cloud Run은 GCP가 제공하는 서버리스 컨테이너 실행 서비스다. 개발자는 코드를 Docker 이미지로 만들어 GCP에 올리기만 하면, 나머지 서버 관리는 GCP가 맡는다. 컨테이너는 Stateless(상태 없음) 구조로 동작한다. 각 요청은 독립적으로 처리되며 이전 요청의 데이터를 메모리에 남겨두지 않는다.',
    '클라이언트가 HTTPS 요청을 보내면 처리 흐름은 6단계로 이어진다. ① 클라이언트가 HTTPS 요청을 전송한다. ② Google Load Balancer가 요청을 받아 SSL 인증서를 처리하고 적절한 Cloud Run 인스턴스로 라우팅한다. ③ Cloud Run 인스턴스가 코드를 실행해 요청을 처리한다. ④ 데이터 조회나 저장이 필요하면 Cloud SQL에 접근한다. ⑤ 처리 결과를 클라이언트에 응답으로 반환한다. ⑥ 모든 요청과 에러 로그는 Cloud Logging에 자동으로 기록된다.',
    'Cloud Run의 핵심은 Scale to Zero다. 트래픽이 없을 때 비용이 발생하지 않고, 트래픽이 몰릴 때는 자동으로 인스턴스가 늘어난다. Load Balancer가 SSL을 처리하므로 개발자는 인증서 관리 없이 HTTPS 엔드포인트를 바로 얻는다.',
  ],
  codeBlocks: [
    { title: 'Cloud Run 배포 및 연결', language: 'bash',
      code: '# Cloud Run 배포\ngcloud run deploy my-api \\\n  --image gcr.io/myproject/my-api \\\n  --region asia-northeast3 \\\n  --allow-unauthenticated\n\n# Cloud SQL 연결 설정\ngcloud run services update my-api \\\n  --add-cloudsql-instances myproject:asia-northeast3:mydb\n\n# 로그 확인\ngcloud logging read "resource.type=cloud_run_revision" --limit 10' },
  ],
  keywords: ['Cloud Run', 'Scale to Zero', 'Stateless 컨테이너', 'Load Balancer', 'SSL Termination', 'Cloud Logging'],
  prevSection: 'III-2-2', nextSection: 'IV-1-2',
};

window.GCPLearn.sections['IV-1-2'] = {
  id: 'IV-1-2', title: 'Dockerfile과 컨테이너 이미지 만들기',
  part: 'IV', partTitle: 'Compute · Storage · DB', chapter: '1', chapterTitle: 'Cloud Run',
  difficulty: '★★☆', prerequisites: 'IV-1-1',
  objective: '이 Section을 마치면 Python 앱을 Docker 이미지로 만들고 Artifact Registry에 푸시할 수 있다.',
  paragraphs: [
    '택배 상자를 생각해보자. 상자 안에 물건과 함께 "이 물건은 냉장 보관, 습기 주의" 같은 취급 안내서를 동봉하면, 어떤 택배 기사가 가져가든 동일하게 처리된다. 컨테이너 이미지가 이 역할을 한다. 앱 코드뿐 아니라 Python 버전, 설치 라이브러리, 시작 명령어까지 하나의 패키지로 묶는다.',
    'Dockerfile은 이 상자를 조립하는 설명서다. "어떤 베이스 이미지를 쓸 것인지", "어떤 패키지를 설치할 것인지", "앱을 어떻게 시작할 것인지"를 순서대로 적는다. 빌드된 이미지는 Artifact Registry에 업로드되고, Cloud Run이 이곳에서 이미지를 내려받아 실행한다.',
    'Dockerfile 예시에서 각 줄의 역할이 명확하다. FROM python:3.11-slim은 경량 리눅스 환경을 베이스로 삼는다. 의존성 파일을 먼저 복사하고 설치한 뒤 나머지 소스코드를 복사하면 코드만 변경됐을 때 pip 설치 단계를 건너뛸 수 있어 빌드가 빨라진다.',
    '컨테이너 이미지는 Cloud Run 배포의 출발점이다. "로컬에서는 되는데 서버에서는 안 된다"는 상황을 컨테이너가 근본적으로 해결해준다.',
  ],
  codeBlocks: [
    { title: 'Dockerfile 예시 (Python FastAPI)', language: 'dockerfile',
      code: 'FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]' },
    { title: '이미지 빌드 및 푸시', language: 'bash',
      code: '# 이미지 빌드 및 Artifact Registry 푸시\ngcloud builds submit --tag gcr.io/myproject/my-api' },
  ],
  keywords: ['Dockerfile', '컨테이너 이미지(Container Image)', 'Artifact Registry', 'docker build', 'gcloud builds submit'],
  prevSection: 'IV-1-1', nextSection: 'IV-1-3',
};

window.GCPLearn.sections['IV-1-3'] = {
  id: 'IV-1-3', title: 'Cloud Run 배포 옵션 이해하기',
  part: 'IV', partTitle: 'Compute · Storage · DB', chapter: '1', chapterTitle: 'Cloud Run',
  difficulty: '★★☆', prerequisites: 'IV-1-2',
  objective: '이 Section을 마치면 주요 gcloud run deploy 옵션(리전, 인증, 동시성, 메모리)을 설명하고 실습할 수 있다.',
  paragraphs: [
    'gcloud run deploy 명령은 이미지를 클라우드에 올리는 단순한 업로드 명령이 아니다. 서비스가 어떤 조건에서 실행될지를 명시하는 계약서에 가깝다. 식당에 자리를 예약할 때 조건을 지정하듯, 배포 명령에서도 인증 방식·동시 처리 수·메모리·인스턴스 수를 직접 정해야 한다.',
    '가장 먼저 이해해야 할 옵션은 인증 설정이다. --allow-unauthenticated는 누구든 URL만 알면 호출할 수 있도록 서비스를 공개하는 옵션이다. 다음은 동시성(Concurrency) 설정이다. --concurrency 80은 인스턴스 하나가 최대 80개의 요청을 동시에 처리하도록 제한하는 값이다.',
    '실무에서 가장 자주 놓치는 옵션은 --min-instances다. Cloud Run은 요청이 없으면 인스턴스를 0으로 줄이는데, 새 요청이 들어오면 컨테이너가 처음부터 시작되면서 몇 초의 지연이 발생한다. 이것을 콜드 스타트(Cold Start)라고 부른다. --min-instances 1로 설정하면 콜드 스타트 없이 즉시 응답할 수 있다.',
    '배포 옵션 하나하나가 서비스의 보안, 성능, 비용을 결정하는 레버다. 처음에는 기본값으로 시작해도 좋지만, 서비스가 실제 사용자에게 노출되기 전에 반드시 각 옵션의 의미를 확인하는 습관을 들이자.',
  ],
  codeBlocks: [
    { title: '모든 옵션 적용 배포', language: 'bash',
      code: 'gcloud run deploy my-api \\\n  --image gcr.io/myproject/my-api \\\n  --region asia-northeast3 \\\n  --no-allow-unauthenticated \\\n  --concurrency 80 \\\n  --memory 512Mi \\\n  --min-instances 1' },
  ],
  keywords: ['--allow-unauthenticated', '동시성(Concurrency)', '콜드 스타트(Cold Start)', '--min-instances', '메모리 설정'],
  prevSection: 'IV-1-2', nextSection: 'IV-2-1',
};

window.GCPLearn.sections['IV-2-1'] = {
  id: 'IV-2-1', title: 'Cloud Storage — 파일을 클라우드에 보관하기',
  part: 'IV', partTitle: 'Compute · Storage · DB', chapter: '2', chapterTitle: 'Storage',
  difficulty: '★★☆', prerequisites: 'III-1-2',
  objective: '이 Section을 마치면 Cloud Storage 버킷을 만들고, 파일을 업로드·다운로드·삭제할 수 있다.',
  paragraphs: [
    '창고를 상상해 보자. 창고 안에는 여러 개의 캐비닛이 있고, 각 캐비닛 안에는 물건들이 들어 있다. Cloud Storage는 바로 이 창고 역할을 하는 GCP의 파일 저장 서비스다. 창고 칸 하나하나가 버킷(Bucket), 그 안에 담긴 파일 하나하나가 오브젝트(Object)에 해당한다.',
    '버킷을 만들 때 이름은 전 세계에서 유일해야 한다. 퍼블릭 접근(Public Access)을 허용하면 누구나 URL만으로 파일을 다운로드할 수 있다. 민감한 파일은 비공개로 두고, Signed URL을 발급해 일시적으로만 접근을 허용하는 방식을 쓴다.',
    'Cloud Storage는 단순한 파일 보관함을 넘어, 서비스 이미지 에셋을 배포하고 사용자가 업로드한 파일을 처리하고 서버 로그를 장기 보관하는 등 거의 모든 GCP 프로젝트에서 등장한다.',
  ],
  codeBlocks: [
    { title: 'Cloud Storage 기본 조작', language: 'bash',
      code: '# 버킷 생성\ngcloud storage buckets create gs://my-bucket-name \\\n  --location=asia-northeast3\n\n# 파일 업로드\ngcloud storage cp ./image.png gs://my-bucket-name/\n\n# 파일 목록 확인\ngcloud storage ls gs://my-bucket-name/' },
  ],
  keywords: ['Cloud Storage', '버킷(Bucket)', '오브젝트(Object)', 'Signed URL', '퍼블릭 접근(Public Access)'],
  prevSection: 'IV-1-3', nextSection: 'IV-3-1',
};

window.GCPLearn.sections['IV-3-1'] = {
  id: 'IV-3-1', title: 'Cloud SQL — 관리형 관계형 데이터베이스',
  part: 'IV', partTitle: 'Compute · Storage · DB', chapter: '3', chapterTitle: 'Database',
  difficulty: '★★☆', prerequisites: 'III-1-3, IV-1-1',
  objective: '이 Section을 마치면 Cloud SQL 인스턴스를 생성하고 Cloud Run에 연결할 수 있다.',
  paragraphs: [
    '호텔에 묵을 때 침구를 직접 빨거나 고장 난 샤워기를 손수 고칠 필요가 없는 것처럼, Cloud SQL은 데이터베이스 서버의 설치·패치·백업·장애 복구를 GCP가 대신 맡아 처리하는 관리형 DB 서비스다.',
    'Cloud SQL 인스턴스를 생성하고 나면, Cloud Run 서비스가 그 DB에 어떻게 연결하는지가 관건이다. Private IP 연결은 GCP 내부 네트워크만 통과하므로 외부 인터넷이 끼어들 틈이 없다. 보안과 성능 두 마리 토끼를 동시에 잡는 구조다.',
    '실무에서 Cloud SQL의 가치가 드러나는 장면은 패치 주기다. 직접 운영하는 DB 서버라면 모든 관리를 개발팀이 직접 챙겨야 한다. Cloud SQL은 이 모든 작업을 GCP가 수행한다.',
    'Cloud SQL은 "DB 서버도 GCP에 맡기면 된다"는 한 문장으로 요약된다.',
  ],
  codeBlocks: [
    { title: 'Cloud SQL 생성 및 연결', language: 'bash',
      code: '# Cloud SQL 인스턴스 생성 (PostgreSQL)\ngcloud sql instances create mydb \\\n  --database-version=POSTGRES_15 \\\n  --region=asia-northeast3 \\\n  --tier=db-f1-micro\n\n# Cloud Run에 Cloud SQL 연결\ngcloud run services update my-api \\\n  --add-cloudsql-instances myproject:asia-northeast3:mydb' },
  ],
  keywords: ['Cloud SQL', 'Cloud SQL Auth Proxy', 'Private IP', '관리형 DB(Managed DB)', '인스턴스(Instance)'],
  prevSection: 'IV-2-1', nextSection: 'IV-3-2',
};

window.GCPLearn.sections['IV-3-2'] = {
  id: 'IV-3-2', title: 'Cloud SQL 연결 — 환경 변수와 Secret Manager',
  part: 'IV', partTitle: 'Compute · Storage · DB', chapter: '3', chapterTitle: 'Database',
  difficulty: '★★★', prerequisites: 'IV-3-1',
  objective: '이 Section을 마치면 DB 비밀번호를 Secret Manager에 저장하고 Cloud Run 환경 변수로 주입할 수 있다.',
  paragraphs: [
    'DB 비밀번호를 코드에 직접 적어 두면 왜 위험한가? 퍼블릭 저장소라면 크롤러가 수 분 안에 해당 비밀번호를 수집한다. 프라이빗 저장소라도 팀원이 늘거나 저장소 권한이 잘못 설정되면 언제든 노출될 수 있다.',
    'Secret Manager는 비밀 값을 금고에 잠그고, 꺼낼 때마다 누가 꺼냈는지 기록하는 GCP의 보안 저장소다. Cloud Run에서는 --set-secrets 옵션 한 줄로 Secret Manager의 값을 환경 변수로 주입할 수 있다.',
    '최소 권한 원칙이 함께 작동한다. Cloud Run 서비스는 자신에게 허용된 Secret만 열 수 있는 열쇠를 가진다. 코드 밖에 비밀을 두는 것과 필요한 곳에만 접근을 허용하는 것이 실무 보안의 기본 패턴이다.',
  ],
  codeBlocks: [
    { title: 'Secret Manager + Cloud Run', language: 'bash',
      code: '# Secret 생성\necho -n "my-db-password" | \\\n  gcloud secrets create db-password --data-file=-\n\n# Cloud Run에 Secret을 환경 변수로 주입\ngcloud run services update my-api \\\n  --set-secrets=DB_PASSWORD=db-password:latest' },
  ],
  keywords: ['Secret Manager', '환경 변수(Environment Variable)', '--set-secrets', '보안(Security)', '최소 권한 원칙'],
  prevSection: 'IV-3-1', nextSection: 'IV-3-3',
};

window.GCPLearn.sections['IV-3-3'] = {
  id: 'IV-3-3', title: 'Cloud SQL Studio 사용하기',
  part: 'IV', partTitle: 'Compute · Storage · DB', chapter: '3', chapterTitle: 'Database',
  difficulty: '★★☆', prerequisites: 'IV-3-1',
  objective: '이 Section을 마치면 Cloud SQL Studio에서 데이터베이스에 접속해 테이블을 조회하고 SQL을 실행할 수 있다.',
  paragraphs: [
    '은행 앱에서 잔액을 확인하듯, Cloud SQL Studio는 별도 설비 없이 브라우저 하나로 DB 안을 바로 들여다볼 수 있게 해준다. 일반적으로 DB에 접근하려면 DBeaver나 pgAdmin 같은 클라이언트를 설치해야 하지만, Cloud SQL Studio는 이 과정 전체를 생략할 수 있게 해준다.',
    '개발 과정에서 Cloud SQL Studio가 특히 유용한 장면은 두 가지다. 첫째, Cloud Run 서비스를 배포한 뒤 데이터가 DB에 올바르게 저장되고 있는지 빠르게 확인할 때. 둘째, 초기 스키마를 잡을 때다. 테이블 구조를 바꾸거나 시드 데이터를 넣는 SQL을 바로 실행할 수 있다.',
    'Cloud SQL Studio는 운영 환경보다는 개발·디버깅 단계에서 쓰는 도구다. 프로덕션 데이터를 직접 수정하는 용도로는 적합하지 않지만, 학습 과정에서 DB 상태를 빠르게 확인하는 데 매우 편리하다.',
  ],
  keywords: ['Cloud SQL Studio', '웹 기반 SQL 클라이언트', '테이블 조회', 'SQL 실행', '스키마 확인'],
  prevSection: 'IV-3-2', nextSection: 'V-1-1',
};
