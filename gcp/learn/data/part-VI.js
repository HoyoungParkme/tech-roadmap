/**
 * part-VI.js
 * 경로: learn/data/part-VI.js
 * 목적: Part VI "실전 배포 프로젝트" 3개 Section 본문 데이터
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sections = window.GCPLearn.sections || {};

window.GCPLearn.sections['VI-1-1'] = {
  id: 'VI-1-1', title: '프로젝트 설계 — 3계층 아키텍처',
  part: 'VI', partTitle: '실전 배포 프로젝트', chapter: '1', chapterTitle: '프로젝트 설계와 배포',
  difficulty: '★★★', prerequisites: 'IV-1-3, IV-3-2, V-1-2',
  objective: '이 Section을 마치면 Cloud Run · Cloud SQL · Secret Manager를 조합한 3계층 아키텍처를 설계도로 그릴 수 있다.',
  paragraphs: [
    '건물을 지을 때 1층은 로비(안내·출입), 2층은 업무 공간(실제 일처리), 3층은 창고(자료 보관)로 층을 나눠 설계한다. 실전 GCP 프로젝트도 이와 같은 방식으로 3계층 아키텍처를 적용해 설계한다.',
    '3계층 아키텍처는 시스템을 역할에 따라 세 층으로 나누는 설계 방식이다. Presentation 계층은 외부 요청을 받아 응답을 반환하는 층으로, Cloud Run이 API 서버 역할을 맡는다. Business Logic 계층은 실제 비즈니스 규칙을 처리하는 층이다. Data 계층은 데이터를 영구적으로 저장하고 조회하는 층으로, Cloud SQL이 이 역할을 한다.',
    'Part IV에서 익힌 Cloud Run · Cloud SQL · Secret Manager가 이 설계도 안에서 각자 자리를 찾는다. 각 계층은 IAM 서비스 계정으로 최소 권한을 부여받아 통신한다.',
    '3계층 아키텍처는 GCP에서 서비스를 설계하는 기본 뼈대다. Presentation · Logic · Data 세 층의 역할과 경계를 명확히 정해두면, 팀이 커지거나 기능이 늘어나도 구조가 흔들리지 않는다.',
  ],
  keywords: ['3계층 아키텍처', 'Presentation·Logic·Data 계층', 'IAM 서비스 계정', '아키텍처 설계'],
  prevSection: 'V-2-2', nextSection: 'VI-1-2',
};

window.GCPLearn.sections['VI-1-2'] = {
  id: 'VI-1-2', title: 'CI/CD 파이프라인 — Cloud Build',
  part: 'VI', partTitle: '실전 배포 프로젝트', chapter: '1', chapterTitle: '프로젝트 설계와 배포',
  difficulty: '★★★', prerequisites: 'VI-1-1, IV-1-2',
  objective: '이 Section을 마치면 Cloud Build로 코드 커밋 → 이미지 빌드 → Cloud Run 배포까지 자동화할 수 있다.',
  paragraphs: [
    '자동화가 없는 배포 현장을 상상해보자. 개발자가 코드를 수정할 때마다 터미널을 열고 gcloud run deploy 명령을 직접 입력한다. 작업이 반복될수록 명령어 옵션을 빠뜨리거나 잘못된 이미지 태그를 입력하는 실수가 생긴다.',
    'Cloud Build는 이 문제를 해결하는 GCP의 CI/CD 서비스다. GitHub 레포지터리에 코드를 push하면, Cloud Build가 변경을 감지해 Docker 이미지를 빌드하고 Artifact Registry에 업로드한 뒤 Cloud Run에 자동으로 배포한다. 이 파이프라인 전체를 cloudbuild.yaml 파일 하나로 정의한다.',
    '파이프라인이 세 단계로 구성된다. 첫 번째 단계는 Docker 이미지를 빌드하고, 두 번째 단계는 Artifact Registry에 push하며, 세 번째 단계는 Cloud Run에 배포한다.',
    'Cloud Build는 배포를 사람이 아닌 파일이 책임지게 만든다. 누가 언제 어떤 설정으로 배포했는지 Git 히스토리에 고스란히 남고, 실수로 인한 배포 오류가 줄어든다.',
  ],
  codeBlocks: [
    { title: 'cloudbuild.yaml 예시', language: 'yaml',
      code: "# cloudbuild.yaml\nsteps:\n  - name: 'gcr.io/cloud-builders/docker'\n    args: ['build', '-t', 'gcr.io/$PROJECT_ID/my-api', '.']\n  - name: 'gcr.io/cloud-builders/docker'\n    args: ['push', 'gcr.io/$PROJECT_ID/my-api']\n  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'\n    args:\n      - gcloud\n      - run\n      - deploy\n      - my-api\n      - --image=gcr.io/$PROJECT_ID/my-api\n      - --region=asia-northeast3" },
  ],
  keywords: ['Cloud Build', 'CI/CD', 'cloudbuild.yaml', '자동 배포(Automated Deployment)', 'GitHub 트리거'],
  prevSection: 'VI-1-1', nextSection: 'VI-1-3',
};

window.GCPLearn.sections['VI-1-3'] = {
  id: 'VI-1-3', title: '환경 분리 — dev · staging · prod',
  part: 'VI', partTitle: '실전 배포 프로젝트', chapter: '1', chapterTitle: '프로젝트 설계와 배포',
  difficulty: '★★★', prerequisites: 'VI-1-2',
  objective: '이 Section을 마치면 GCP 프로젝트 또는 Cloud Run 서비스 이름으로 환경을 분리하고 각 환경별 배포 파이프라인을 구성할 수 있다.',
  paragraphs: [
    '소프트웨어 공장에는 시제품 라인과 양산 라인이 따로 있다. 시제품 라인에서는 새 부품을 실험하고 불량이 나와도 큰 피해가 없다. 양산 라인은 검증된 설계만 들어온다.',
    '실무에서는 개발(dev) · 스테이징(staging) · 운영(prod) 환경을 반드시 분리한다. GCP에서 환경을 분리하는 방법은 두 가지다. 프로젝트 분리 방식과 서비스 이름 분리 방식이다.',
    '소규모 팀은 서비스 이름 분리가 설정이 간단해 출발점으로 적합하다. 팀 규모가 커지거나 규정 준수 요구가 생기면 프로젝트 분리로 전환하는 것이 낫다.',
    '환경 분리는 사고를 예방하는 가장 기본적인 운영 규칙이다. 개발·스테이징·운영 세 층의 경계를 명확히 유지하면 안정적인 서비스 운영이 가능해진다.',
  ],
  keywords: ['환경 분리(Environment Separation)', 'dev·staging·prod', '프로젝트 분리', '서비스 이름 규칙'],
  prevSection: 'VI-1-2', nextSection: 'VII-1-1',
};
