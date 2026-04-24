# Docker 사다리형 학습 커리큘럼

> 비개발자부터 실무자까지, 한 권으로 올라가는 Docker 학습 자료.

---

## 이 책이 만들어진 이유

이 자료는 Docker 공식 문서나 두꺼운 기술서와 다르게 **"아는 만큼 읽고, 필요한 만큼만 깊이 들어가도 되는"** 사다리형 구조로 짜여 있다. 처음 서버를 접하는 비개발자가 Part I부터 읽어도 막히지 않게 만들었고, 동시에 이미 실무에서 Docker를 다루는 주니어가 Part IV 이후만 발췌해 참고해도 가치가 있게 썼다.

전체 구성은 **설계도(상세 목차) + 인터랙티브 시각화**다. 각 Section은 한 꼭지의 학습 단위이며, Part IV에서는 `index.html`과 같은 **단계별 애니메이션 시각화**가 짝을 이뤄, 글 대신 움직이는 그림으로 개념을 체득할 수 있도록 설계되어 있다.

---

## 읽기 가이드

### 난이도 범례

| 표기 | 독자 | 설명 |
|:--|:--|:--|
| **★☆☆** | 비개발자 | 코딩 경험 없음. 컴퓨터 기본 사용 가능 |
| **★★☆** | 코딩 입문 | 터미널 명령어를 본 적 있음. 파일·폴더 개념을 안다 |
| **★★★** | 주니어 | Python/Node.js + Git + 리눅스 기초 실전 경험 |

### 독자별 추천 경로

- **처음 서버를 배우는 분** → Part I → Part II → Part III → Part IV (천천히)
- **리눅스·터미널은 알지만 Docker는 처음** → Part III → Part IV → 필요 시 Part II
- **Docker 실무 투입 준비 중** → Part IV → Part V → Part VI → Part VII

### Section 양식 (공통)

각 Section은 아래 7개 필드를 갖는다.

- **난이도**: ★☆☆ / ★★☆ / ★★★
- **선수 지식**: 먼저 읽어두면 좋은 이전 Section
- **학습 목표**: "이 Section을 마치면 ...할 수 있다"
- **설명**: 3~5줄 핵심 요약 (비유 중심)
- **핵심 키워드**: 이 Section의 기억해둘 개념 목록
- **시각화 연결**: 관련 `index.html` 시각화 또는 향후 구현 예정
- **다음 섹션**: 다음 번호

### 번호 규칙

`Part-Chapter-Section` (예: `IV-1-1` = Part IV, Chapter 1, Section 1).
루트의 `index.html`(Dockerfile→컨테이너 시각화)은 이 커리큘럼의 **IV-1-1**에 해당한다.

---

## 전체 목차

### Part I. 왜 컨테이너인가 (★☆☆)
- Chapter I-1. 내 노트북에선 되는데 서버에선 안 돼요
- Chapter I-2. 가상머신(VM)과 컨테이너 — 무거운 짐차 vs 가벼운 택배 상자
- Chapter I-3. 환경 일관성이란 무엇인가
- Chapter I-4. Docker가 해결하는 문제

### Part II. 컨테이너 생태계 (★☆☆~★★☆)
- Chapter II-1. Docker, Podman, LXC — 뭐가 다른가
- Chapter II-2. OCI(Open Container Initiative) 표준
- Chapter II-3. Docker Hub와 레지스트리
- Chapter II-4. 언제 Docker를 선택하나

### Part III. 첫 컨테이너 실행 (★★☆)
- Chapter III-1. Docker 설치 (Windows/Mac/Linux)
- Chapter III-2. Hello World 컨테이너
- Chapter III-3. docker ps / docker images — 상태 확인
- Chapter III-4. 처음 만나는 에러

### Part IV. 이미지·Dockerfile (★★☆~★★★)
- Chapter IV-1. Dockerfile에서 컨테이너까지 ← `index.html` 시각화 연결
- Chapter IV-2. 레이어 캐싱과 빌드 최적화
- Chapter IV-3. 멀티 스테이지 빌드

### Part V. 네트워크·볼륨·Compose (★★★)
- Chapter V-1. 컨테이너 네트워크 — bridge / host / none
- Chapter V-2. 볼륨과 바인드 마운트
- Chapter V-3. Docker Compose 기초
- Chapter V-4. Compose로 다중 컨테이너 연결
- Chapter V-5. Compose 네트워크 직접 정의하기
- Chapter V-6. 볼륨 백업과 복원

### Part VI. 실전 다중 컨테이너 앱 (★★★)
- Chapter VI-1. FastAPI + PostgreSQL + Nginx 구성
- Chapter VI-2. 환경변수와 .env 파일 관리
- Chapter VI-3. 헬스체크와 의존성 순서
- Chapter VI-4. 로컬 개발 vs 프로덕션 Compose 분리
- Chapter VI-5. 로그 수집과 `docker logs`
- Chapter VI-6. 리소스 제한 (CPU·메모리 limit)

### Part VII. 레지스트리·프로덕션 (★★★)
- Chapter VII-1. Docker Hub / GitHub Container Registry 사용
- Chapter VII-2. 이미지 태깅 전략 (semver, latest, sha)
- Chapter VII-3. 보안 — 비루트 사용자, 이미지 스캔
- Chapter VII-4. CI/CD에서 Docker 빌드 자동화
- Chapter VII-5. 프로덕션 배포 체크리스트
- Chapter VII-6. Docker에서 Kubernetes로 — 다음 단계

### Part VIII. 실전 실습 워크숍 (★★☆~★★★)
- Chapter VIII-1. docker run 핵심 옵션 총정리
- Chapter VIII-2. exec, cp, attach — 실행 중 컨테이너 조작
- Chapter VIII-3. logs, inspect, stats — 상태 파악과 디버깅
- Chapter VIII-4. system prune과 디스크 관리
- Chapter VIII-5. MySQL을 Docker로 실행하기
- Chapter VIII-6. Redis를 Docker로 실행하기
- Chapter VIII-7. MongoDB를 Docker로 실행하기
- Chapter VIII-8. DB 3종 비교와 Compose 조합
- Chapter VIII-9. Spring Boot 앱 Docker화
- Chapter VIII-10. Node.js (Express) 앱 Docker화
- Chapter VIII-11. Next.js 앱 Docker화
- Chapter VIII-12. HTML+Nginx 정적 사이트 Docker화
- Chapter VIII-13. EC2 인스턴스 생성과 Docker 설치
- Chapter VIII-14. ECR(Elastic Container Registry) 사용
- Chapter VIII-15. EC2에 Docker Compose로 배포하기
- Chapter VIII-16. 배포 자동화와 운영 체크리스트

### 부록
- 부록 A. Docker 용어집
- 부록 B. 자주 묻는 질문 (FAQ)
- 부록 C. 다음에 공부할 것
- 부록 D. 참고 자료

---

