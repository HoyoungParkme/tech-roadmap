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

## Part I. 왜 컨테이너인가

### I-1-1. "내 노트북에선 되는데 서버에선 안 돼요"

- **난이도**: ★☆☆
- **선수 지식**: 없음
- **학습 목표**: 이 Section을 마치면 "환경 불일치"가 왜 발생하는지 비유로 설명할 수 있다.
- **설명**:
  주니어 개발자라면 한 번쯤 이런 상황을 겪는다. 내 노트북에서 완벽하게 동작하던 코드가 팀원 컴퓨터나 운영 서버에 올라가는 순간 에러를 뿜는다. 원인은 대부분 Python 버전 차이, 라이브러리 버전 차이, 운영체제 차이다. 요리사 비유로 생각하면, 같은 레시피라도 사용하는 냄비·가스레인지·재료가 다르면 결과물이 달라지는 것과 같다. Docker는 레시피(코드)뿐 아니라 냄비·가스레인지까지 통째로 포장해서 어디서든 똑같이 돌아가게 만든다.
- **핵심 키워드**: 환경 불일치, 의존성 충돌, "works on my machine"
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: I-1-2

#### 본문

##### "내 노트북에선 되는데요" — 가장 흔한 개발 악몽

신입 개발자가 처음으로 혼자 서비스를 만든다. 노트북에서 열심히 짜고, 테스트도 통과했다. 그런데 팀장에게 배포해 달라고 했더니 서버에서 바로 에러가 난다. 에러 메시지를 보면 분명히 설치한 라이브러리인데, 서버에서는 못 찾겠다고 한다. 혹은 분명히 내 컴퓨터에서는 잘 되던 웹사이트가 동료 컴퓨터에서 열면 깨진다.

이 상황은 전 세계 개발자가 매일 겪는 일이다. 영어로는 "Works on my machine"(내 컴퓨터에서는 되는데)이라고 부르며, 인터넷에서는 이를 비꼬는 밈(meme)이 수도 없이 만들어졌을 정도로 오래된 문제다.

왜 이런 일이 일어날까?

##### 원인 1: 소프트웨어 버전 차이

여행을 위해 레시피를 외웠다고 상상해 보자. 집에서 연습할 때는 특정 브랜드의 소금, 특정 크기의 냄비, 특정 화력의 가스레인지를 썼다. 그런데 여행지 주방의 소금은 굵기가 다르고, 냄비는 다른 소재이고, 인덕션이다. 같은 레시피인데 맛이 달라진다.

소프트웨어도 마찬가지다. 코드(레시피)가 같아도 실행 환경(주방)이 다르면 결과가 달라진다.

| 항목 | 내 노트북 | 서버 | 팀원 컴퓨터 |
|:--|:--|:--|:--|
| 운영체제 | macOS 14 | Ubuntu 22.04 | Windows 11 |
| Python 버전 | 3.11.4 | 3.9.7 | 3.10.12 |
| 라이브러리 A | 2.1.0 | 2.0.3 | 2.1.0 |
| 라이브러리 B | 설치됨 | 미설치 | 설치됨 |

이 표에서 "내 노트북에선 되는데 서버에선 안 돼요"가 왜 생기는지 바로 보인다.

##### 원인 2: 경로와 설정 파일 차이

Windows에서 파일 경로를 `C:\Users\김철수\project`처럼 쓰는 코드를 Linux 서버에 올리면 바로 에러가 난다. Linux는 `\`(백슬래시) 대신 `/`(슬래시)를 쓰기 때문이다. 이처럼 운영체제가 다르면 폴더 경로 규칙, 줄바꿈 문자, 파일 권한 체계가 모두 다르다.

설정 파일도 마찬가지다. 개발자 노트북에는 있지만 서버에는 없는 설정 파일, 환경 변수(프로그램이 참조하는 설정값) 차이도 흔한 원인이다.

##### 원인 3: 시간이 지나면 환경이 달라진다

처음에는 모든 팀원의 환경이 같았어도, 6개월이 지나면 각자 다른 라이브러리를 설치하고, 다른 버전으로 업그레이드한다. 이것을 **환경 드리프트**(environment drift, 환경이 서서히 달라지는 현상)라고 부른다. 팀이 커질수록, 시간이 지날수록 환경 드리프트는 심해진다.

##### requirements.txt의 한계

Python 프로젝트에는 `requirements.txt`라는 파일이 있다. 필요한 라이브러리 목록을 적어두는 파일이다.

```
# requirements.txt 예시
flask==2.3.0
requests==2.31.0
```

이것만 있으면 되지 않을까? 실제로는 부족하다. `requirements.txt`는 Python 라이브러리 목록만 담는다. Python 자체 버전, 운영체제 차이, 시스템 라이브러리(예: `libpq` — PostgreSQL 접속에 필요한 시스템 도구)는 담지 못한다. 라이브러리가 의존하는 다른 라이브러리의 버전 충돌 문제도 해결하지 못한다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 같은 옷을 입어도 신발 사이즈가 다르면 걸을 수 없는 것처럼, 코드가 같아도 실행 환경이 다르면 프로그램이 돌아가지 않는다. Docker는 옷과 신발을 한 세트로 묶어서 배달하는 방법이다.
> - **체감 예시**: 친구에게 "이 레시피 따라 해봐"라고 했는데 친구 집 오븐이 없어서 못 만든 경험. Docker는 레시피뿐 아니라 오븐도 같이 배달해 준다.
> - **핵심 질문**: "내가 쓰는 도구(프로그램)의 버전이 서버와 다를 수 있다"는 것만 이해하면 이번 섹션의 핵심을 잡은 것이다.

> **[주니어 렌즈 ★★☆]**
> - **실무 상황**: `pip install -r requirements.txt`를 해도 "이미 설치된 버전과 충돌한다"는 에러가 나거나, 팀원 컴퓨터에서는 `import` 되는 모듈이 내 컴퓨터에서는 `ModuleNotFoundError`가 뜨는 상황.
> - **requirements.txt의 한계**: 파일에 버전을 명시했더라도 Python 버전 자체가 다르거나, C 확장 라이브러리(예: `psycopg2`)가 시스템 패키지에 의존하면 `requirements.txt`만으로는 재현이 안 된다.
> - **다음 단계**: `pip freeze > requirements.txt`로 현재 환경을 스냅샷하는 것이 기본이지만, 완전한 재현을 위해서는 Docker 이미지가 필요하다.

> **[실무자 렌즈 ★★★]**
> - **환경 드리프트 방지**: Ansible, Chef, Puppet 같은 configuration management 도구를 써서 서버 환경을 코드로 정의할 수 있다. 하지만 이 도구들은 서버 자체를 관리하는 것이라 "앱 실행 환경을 그대로 복제"하는 Docker보다 추상 수준이 높고 러닝 커브가 크다.
> - **기업 도입 이유**: 온보딩 시간 단축이 주요 동기다. 신규 입사자가 `docker compose up` 한 줄로 로컬 개발 환경을 구성할 수 있으면, "환경 설정에 3일 걸린다"는 문제가 사라진다.
> - **audit trail**: Docker 이미지는 빌드 시점의 환경을 SHA256 다이제스트로 고정하므로, 어떤 환경에서 어떤 버전으로 실행했는지 추적이 가능하다.

##### 체크포인트

- [ ] "환경 불일치"가 왜 생기는지 비유로 설명할 수 있다
- [ ] requirements.txt가 해결하지 못하는 문제가 무엇인지 말할 수 있다
- [ ] 환경 드리프트가 무엇인지 설명할 수 있다

### I-1-2. 가상머신(VM)과 컨테이너 — 무거운 짐차 vs 가벼운 택배 상자

- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: 이 Section을 마치면 VM과 컨테이너의 차이를 한 문장으로 설명할 수 있다.
- **설명**:
  가상머신(Virtual Machine)은 운영체제 전체를 통째로 가상으로 띄운다. 마치 여행 갈 때 집 전체를 옮기는 것처럼 무겁다. 반면 컨테이너(Container)는 운영체제의 커널(핵심 엔진)은 호스트와 공유하고, 앱 실행에 필요한 파일만 격리한다. 택배 상자에 필요한 물건만 담는 것과 같다. 덕분에 컨테이너는 VM보다 훨씬 빠르게 시작하고(수초 이내), 더 적은 메모리를 사용한다.
- **핵심 키워드**: 가상머신(VM), 컨테이너(Container), 하이퍼바이저(Hypervisor), 커널 공유
- **시각화 연결**: [visualizations/i-1-2_vm_vs_container.html](visualizations/i-1-2_vm_vs_container.html) (VM vs 컨테이너 구조 비교 3단계 시각화)
- **다음 섹션**: I-1-3

#### 본문

##### 이사 비유로 시작하기

이사를 두 가지 방법으로 할 수 있다고 상상해 보자.

**방법 A**: 집 전체를 통째로 트럭에 싣는다. 벽, 천장, 바닥, 가전제품, 수도관까지 모두 해체해서 새 땅에 재조립한다. 확실히 원래 환경과 똑같이 쓸 수 있지만, 트럭도 크고 시간도 오래 걸리고 비용도 엄청나다.

**방법 B**: 필요한 짐만 캐리어 하나에 넣는다. 새 집(호텔이든 친구 집이든)에 도착해서 캐리어를 풀면 바로 생활을 시작한다. 벽이나 가전제품은 이미 있는 것을 공유해서 쓴다.

이것이 **VM(가상머신)과 컨테이너의 차이**다.

##### VM이란 무엇인가

VM(Virtual Machine, 가상머신)은 컴퓨터 안에 또 다른 컴퓨터를 만드는 기술이다. Windows 노트북 위에서 Ubuntu Linux를 실행하는 것이 대표적인 예다.

VM을 실행하려면 **하이퍼바이저**(Hypervisor)라는 소프트웨어가 필요하다. 하이퍼바이저는 실제 하드웨어(CPU, 메모리, 저장소)를 흉내 내어 가상 하드웨어를 만들어준다. VM은 이 가상 하드웨어 위에서 자신만의 운영체제(OS)를 통째로 실행한다.

```
[물리 서버]
  └── [하이퍼바이저]
        ├── [VM 1]  OS: Ubuntu + Python 3.9 + 앱 A  (2GB RAM, 20GB 디스크)
        ├── [VM 2]  OS: Ubuntu + Python 3.11 + 앱 B  (2GB RAM, 20GB 디스크)
        └── [VM 3]  OS: Windows Server + .NET + 앱 C  (4GB RAM, 40GB 디스크)
```

VM의 장점은 완전한 격리다. 각 VM은 서로 다른 OS를 실행할 수 있고, 한 VM이 망가져도 나머지는 영향받지 않는다.

단점은 무겁다는 것이다. 각 VM이 운영체제를 통째로 실행하기 때문에 메모리를 수 GB씩 차지하고, 시작하는 데 수십 초에서 수 분이 걸린다.

##### 컨테이너는 어떻게 다른가

컨테이너는 운영체제의 **커널**(kernel, 운영체제의 핵심 엔진)을 호스트와 공유한다. 각 컨테이너는 자신만의 OS를 갖지 않는다. 대신 앱 실행에 필요한 파일(라이브러리, 설정, 코드)만 격리해서 갖는다.

```
[물리 서버]
  └── [운영체제 커널] (모든 컨테이너가 공유)
        ├── [컨테이너 1]  Python 3.9 + 앱 A  (수십 MB)
        ├── [컨테이너 2]  Python 3.11 + 앱 B  (수십 MB)
        └── [컨테이너 3]  Node.js + 앱 C  (수십 MB)
```

커널을 공유하기 때문에 각 컨테이너는 완전한 OS를 포함하지 않아도 된다. 그 결과 컨테이너 크기는 수십 MB 수준이고, 시작 시간은 1~2초 이내다.

##### VM vs 컨테이너 비교

| 항목 | VM | 컨테이너 |
|:--|:--|:--|
| 격리 단위 | OS 수준 (완전 격리) | 프로세스 수준 (커널 공유) |
| 시작 시간 | 수십 초 ~ 수 분 | 1~2초 이내 |
| 메모리 사용 | 수 GB (OS 포함) | 수십 MB ~ 수백 MB |
| 이미지 크기 | 수 GB | 수십 MB ~ 수백 MB |
| OS 다양성 | VM마다 다른 OS 가능 | 호스트 커널과 같은 OS 계열 |
| 보안 격리 | 강함 | VM보다 약함 (커널 공유) |
| 대표 도구 | VirtualBox, VMware, Hyper-V | Docker, Podman |

> **[입문 렌즈 ★☆☆]**
> - **비유**: VM은 이사할 때 집 전체를 통째로 옮기는 것이고, 컨테이너는 필요한 짐만 캐리어에 담아 새 집으로 가는 것이다. 새 집의 수도관, 전기, 벽(커널)은 이미 있는 것을 쓴다.
> - **체감 예시**: VirtualBox로 Ubuntu를 켜면 노트북 팬이 돌기 시작하고 2분은 기다려야 한다. Docker 컨테이너는 명령어 입력 후 2초 안에 서비스가 뜬다.
> - **핵심 질문**: "VM과 컨테이너 중 어느 것이 더 가벼운가?" — 컨테이너. 커널을 공유하기 때문이다.

> **[주니어 렌즈 ★★☆]**
> - **직접 비교**: `docker run -d nginx` 실행 시간을 측정해 보자. VirtualBox에서 Ubuntu VM을 시작하는 시간과 비교하면 차이가 느껴진다.
> - **메모리 차이**: Ubuntu VM은 최소 512MB ~ 2GB 메모리를 잡아먹는다. `docker run -d nginx`는 메모리를 약 30~50MB 사용한다. 서버 한 대에서 VM은 10개도 버거울 수 있지만 컨테이너는 수십~수백 개를 띄울 수 있다.
> - **주의 사항**: 컨테이너는 Linux 커널 위에서 실행된다. Windows나 Mac에서 Docker Desktop을 쓸 때는 내부적으로 가벼운 Linux VM이 하나 실행되고 그 위에 컨테이너가 올라간다. "Docker Desktop = 컨테이너만 있다"는 것은 엄밀히는 틀린 말이다.

> **[실무자 렌즈 ★★★]**
> - **하이퍼바이저 종류**: Type 1(베어메탈) 하이퍼바이저는 하드웨어 위에 직접 올라간다(VMware ESXi, Microsoft Hyper-V). Type 2는 기존 OS 위에서 실행된다(VirtualBox, VMware Workstation). 클라우드 서버(AWS EC2, GCP Compute Engine)는 Type 1 기반이다.
> - **컨테이너 보안 경계**: 커널을 공유하기 때문에 커널 취약점이 컨테이너 탈출(container escape)로 이어질 수 있다. 보안이 극도로 중요한 멀티테넌트 환경에서는 gVisor, Kata Containers 같은 샌드박스 런타임으로 격리 수준을 높인다.
> - **실무 선택 기준**: 완전히 다른 OS가 필요하거나(Windows 서버 + Linux 서버 혼합), 규정상 강한 격리가 필요한 경우 VM을 쓴다. 빠른 배포, 밀도 높은 서비스 배치, MSA 환경에서는 컨테이너를 선택한다.

##### 체크포인트

- [ ] VM과 컨테이너가 커널을 대하는 방식의 차이를 설명할 수 있다
- [ ] 컨테이너가 VM보다 가벼운 이유를 한 문장으로 말할 수 있다
- [ ] 하이퍼바이저가 무엇인지 비유로 설명할 수 있다

### I-1-3. 환경 일관성이란 무엇인가

- **난이도**: ★☆☆
- **선수 지식**: I-1-2
- **학습 목표**: 이 Section을 마치면 "이미지"가 환경 일관성을 어떻게 보장하는지 설명할 수 있다.
- **설명**:
  Docker 이미지(Image)는 앱 실행에 필요한 모든 것을 포함한 스냅샷이다. 운영체제 라이브러리, Python 런타임, 앱 소스 코드, 설정 파일이 모두 하나의 이미지에 들어있다. 이 이미지를 개발자 노트북에서도, CI 서버에서도, 운영 서버에서도 동일하게 실행하면 "내 노트북에선 되는데"라는 문제가 원천적으로 사라진다. 이것이 환경 일관성(Environment Consistency)이다.
- **핵심 키워드**: 이미지(Image), 스냅샷, 환경 일관성(Environment Consistency), 재현 가능성
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: I-1-4

#### 본문

##### 냉동식품 비유로 시작하기

마트에서 파는 냉동 볶음밥을 생각해 보자. 집에서, 사무실 전자레인지에서, 캠핑장 전자레인지에서 어디서 데워도 맛이 같다. 재료를 손질하고 볶는 과정은 공장에서 한 번만 했고, 그 결과물을 냉동해서 배포했기 때문이다. 전자레인지만 있으면 언제 어디서든 같은 결과가 나온다.

Docker 이미지(Image)가 바로 이 냉동식품이다. 앱 실행에 필요한 모든 것을 하나의 이미지에 담아두면, 어떤 컴퓨터에서 실행(= 전자레인지에 돌리는 것)해도 같은 결과가 나온다.

##### Docker 이미지란 무엇인가

Docker 이미지는 앱 실행에 필요한 모든 파일을 묶은 **스냅샷**이다. 스냅샷은 "특정 시점의 상태를 그대로 찍어둔 것"이라는 뜻이다.

하나의 이미지 안에는 이런 것들이 들어있다.

| 포함 내용 | 예시 |
|:--|:--|
| 기반 운영체제 파일 | Ubuntu 22.04 최소 설치본 |
| 런타임 | Python 3.11.4 |
| 시스템 라이브러리 | libpq (PostgreSQL 접속용) |
| 앱 의존성 | flask 2.3.0, requests 2.31.0 |
| 앱 소스 코드 | main.py, config.py ... |
| 설정 파일 | gunicorn.conf.py |
| 시작 명령 | `python main.py` |

이 모든 것이 하나의 파일 묶음(이미지)으로 저장된다.

##### 이미지가 환경 일관성을 보장하는 방법

개발자 A가 노트북에서 이미지를 만들었다(빌드했다). 그 이미지를 Docker Hub(이미지를 저장하고 공유하는 창고)에 올린다. CI 서버(자동 테스트 서버), 스테이징 서버(최종 확인 서버), 운영 서버가 모두 같은 이미지를 내려받아 실행한다.

```
개발자 노트북
    │  docker build → [이미지 v1.0]
    │
    ├──▶ docker push → Docker Hub
    │
    ├──▶ CI 서버:     docker pull + run → 이미지 v1.0 실행
    ├──▶ 스테이징:    docker pull + run → 이미지 v1.0 실행
    └──▶ 운영 서버:   docker pull + run → 이미지 v1.0 실행
```

모두 같은 이미지 v1.0을 실행하므로, 어떤 서버에서든 결과가 같다. "내 노트북에선 되는데"라는 문제가 원천적으로 사라진다.

##### 이미지는 불변이다

이미지가 한 번 만들어지면 내용이 바뀌지 않는다. 이를 **불변성**(immutability)이라고 한다. 앱을 업데이트하려면 새 이미지를 만들어서 배포한다. 이미지 자체를 수정하지 않는다.

이 방식 덕분에 "어제 잘 되던 게 왜 오늘 안 돼?"라는 상황도 줄어든다. 어제와 오늘에 완전히 동일한 이미지를 쓰는 한, 환경에서 비롯된 차이는 없다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 냉동식품은 공장에서 한 번 만들어서 얼려두면 어디서 데워도 같은 맛이 난다. Docker 이미지는 앱의 냉동식품이다. 빌드(만들기)는 한 번, 실행(데우기)은 어디서든.
> - **체감 예시**: 유튜브 영상을 생각해 보자. 영상 파일을 한 번 만들어두면 한국에서 보든 미국에서 보든 내용이 같다. 이미지도 마찬가지다. 한 번 만들면 어디서 실행해도 같다.
> - **핵심 문장**: 이미지는 실행 환경을 통째로 포장해 둔 것이다.

> **[주니어 렌즈 ★★☆]**
> - **직접 체험**: `docker pull nginx` 명령으로 nginx 이미지를 받아보자. 내 노트북에서 받은 nginx와 팀원이 받은 nginx는 동일한 이미지(같은 SHA256 해시)다. 어디서 실행해도 같은 nginx가 뜬다.
> - **이미지 확인**: `docker images` 명령으로 받은 이미지 목록을 볼 수 있다. `IMAGE ID` 컬럼의 값이 같으면 완전히 동일한 이미지다.
> - **주의 사항**: `latest` 태그는 주의해야 한다. `nginx:latest`는 시간이 지나면 내용이 바뀔 수 있다. 팀에서 재현 가능한 환경을 보장하려면 `nginx:1.25.3`처럼 구체적인 버전을 명시한다.

> **[실무자 렌즈 ★★★]**
> - **이미지 불변성과 GitOps**: GitOps 워크플로우에서는 배포할 이미지 태그(버전)를 Git 저장소에 기록한다. 운영 서버가 항상 Git에 명시된 이미지를 실행하게 하면, 누가 어떤 버전을 언제 배포했는지 Git 커밋 히스토리로 추적할 수 있다.
> - **이미지 서명**: `docker trust` 또는 Cosign을 사용해 이미지에 서명하면 "이 이미지는 빌드 파이프라인에서 만든 것이 맞다"는 것을 검증할 수 있다. 공급망 보안(supply chain security) 관점에서 중요하다.
> - **레이어 공유**: 이미지는 여러 레이어(layer)로 구성된다. Python 3.11 기반 이미지 여러 개를 실행해도, 공통 레이어는 한 번만 디스크에 저장된다. 실제 사용 공간은 이미지 크기를 단순 합산한 것보다 훨씬 작다.

##### 체크포인트

- [ ] Docker 이미지가 무엇인지 냉동식품 비유로 설명할 수 있다
- [ ] 이미지가 "불변"이라는 말이 무슨 의미인지 설명할 수 있다
- [ ] 같은 이미지를 여러 서버에서 실행하면 환경이 일치하는 이유를 말할 수 있다

### I-1-4. Docker가 해결하는 문제

- **난이도**: ★☆☆
- **선수 지식**: I-1-3
- **학습 목표**: 이 Section을 마치면 Docker 도입의 실무적 장점 3가지를 나열할 수 있다.
- **설명**:
  Docker가 해결하는 핵심 문제는 세 가지다. 첫째, 환경 불일치 해결 — 개발·스테이징·운영 환경이 동일하다. 둘째, 배포 속도 향상 — 이미지 하나를 pull하고 run하면 배포가 끝난다. 셋째, 격리(Isolation) — 한 서버에서 Python 3.9와 Python 3.11을 동시에 실행해도 충돌 없이 공존한다. 이 세 장점은 마이크로서비스 아키텍처(MSA)와 CI/CD 파이프라인에서 특히 강력하게 발휘된다.
- **핵심 키워드**: 환경 불일치 해결, 빠른 배포, 격리(Isolation), 마이크로서비스(MSA)
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-1

#### 본문

##### 택배 포장 비유로 시작하기

도자기처럼 깨지기 쉬운 물건을 택배로 보낼 때를 생각해 보자. 포장 없이 보내면 도착 과정에서 깨질 수 있다. 하지만 완충재와 상자로 꼼꼼히 포장하면, 어떤 택배 차를 타고 어떤 경로로 가든 안전하게 도착한다.

Docker는 앱을 이 "포장된 택배 상자"처럼 만들어준다. 앱(도자기)을 실행 환경(완충재)과 함께 묶어서, 어떤 서버(택배 목적지)에 도착해도 제대로 동작하게 한다.

##### Docker가 해결하는 문제 1: 환경 불일치

I-1-1에서 살펴본 "내 노트북에선 되는데" 문제다. Docker는 앱과 실행 환경을 이미지로 묶어서 어디서든 같은 환경을 재현한다. 개발 서버, 테스트 서버, 운영 서버가 모두 같은 이미지를 실행하므로 환경 차이가 생기지 않는다.

##### Docker가 해결하는 문제 2: 배포 속도

Docker 이전에는 서버에 앱을 배포하려면 이런 절차가 필요했다.

```
1. 서버에 SSH 접속
2. 필요한 패키지 설치 (apt-get install ...)
3. Python 버전 맞추기
4. 앱 소스 코드 복사
5. 의존성 설치 (pip install -r requirements.txt)
6. 설정 파일 수정
7. 서비스 재시작
8. 잘 뜨는지 확인
```

이 과정은 서버마다 반복해야 하고, 한 단계라도 실수하면 다시 처음부터다.

Docker를 쓰면 배포가 두 줄로 줄어든다.

```bash
docker pull myapp:1.2.0   # 이미지 받기
docker run -d myapp:1.2.0  # 실행
```

환경 설정은 이미지 안에 이미 완성되어 있다. 서버는 Docker만 설치되어 있으면 된다.

##### Docker가 해결하는 문제 3: 격리(Isolation)

한 서버에서 Python 3.9가 필요한 앱 A와 Python 3.11이 필요한 앱 B를 동시에 운영해야 한다고 생각해 보자. Docker 없이는 두 버전을 공존시키는 것이 복잡하다. `virtualenv`나 `pyenv`를 쓸 수 있지만, 시스템 라이브러리 충돌까지 막지는 못한다.

Docker 컨테이너는 각자 격리된 환경에서 실행된다. 컨테이너 A는 Python 3.9, 컨테이너 B는 Python 3.11을 갖고 있어도 서로 충돌하지 않는다. 같은 서버에서 포트만 다르게 설정하면 된다.

| 문제 | Docker 없을 때 | Docker 있을 때 |
|:--|:--|:--|
| Python 버전 충돌 | pyenv/virtualenv로 부분 해결 | 컨테이너별 독립 환경 |
| 시스템 라이브러리 충돌 | 해결 어려움 | 컨테이너별 독립 |
| 배포 절차 복잡성 | 서버마다 수동 설치 | docker pull + run |
| 환경 재현 | requirements.txt로 부분 해결 | 이미지로 완전 재현 |
| 서버 자원 낭비 | VM은 GB 단위 메모리 소비 | 컨테이너는 MB 단위 |

##### 세 가지 장점이 특히 빛나는 곳

**마이크로서비스 아키텍처(MSA)**: 앱을 작은 서비스 여러 개로 나눠서 운영하는 방식이다. 사용자 관리 서비스, 결제 서비스, 알림 서비스가 각자 다른 언어와 버전으로 만들어질 수 있다. Docker를 쓰면 각 서비스를 독립적인 컨테이너로 실행하고, 서로 영향 없이 배포와 업데이트가 가능하다.

**CI/CD 파이프라인**: CI/CD는 코드를 수정할 때마다 자동으로 테스트하고 배포하는 자동화 시스템이다. Docker 이미지가 있으면 "어떤 서버에서도 동일한 환경으로 테스트"가 보장된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 포장 없이 도자기를 보내면 깨질 수 있지만, 완충재와 상자로 포장하면 어디서든 안전하게 도착한다. Docker는 앱을 포장해서 어떤 서버에 가도 안전하게 실행되게 한다.
> - **세 가지 핵심**: ① 어디서나 같은 환경 ② 빠른 배포 ③ 서로 간섭 없는 격리. 이 세 가지가 Docker가 인기를 얻은 이유다.
> - **주의**: Docker가 모든 문제를 해결하지는 않는다. 데이터 보관(볼륨), 여러 서버에 걸친 배포(오케스트레이션), 보안 설정은 별도로 공부해야 한다.

> **[주니어 렌즈 ★★☆]**
> - **공존 실습**: 한 서버에서 `docker run -d -p 8001:8000 myapp:python39`와 `docker run -d -p 8002:8000 myapp:python311`을 동시에 실행해 보자. 포트 8001과 8002에서 서로 다른 Python 버전의 앱이 충돌 없이 함께 돌아간다.
> - **배포 흐름 체험**: 팀 프로젝트에서 `docker pull` + `docker run`만으로 전체 로컬 환경을 구성해 보면, "환경 설정에 하루 걸리던" 경험이 "5분 안에 끝나는" 경험으로 바뀐다.
> - **실무 연결**: 회사에서 신규 입사자 온보딩 문서에 `docker compose up` 한 줄이 있으면, 나머지 설정 없이 바로 개발을 시작할 수 있다.

> **[실무자 렌즈 ★★★]**
> - **마이크로서비스 전환 맥락**: 모노리식(하나의 큰 앱) 구조를 MSA로 전환할 때 Docker는 필수 기반이다. 서비스별로 독립 컨테이너를 쓰면 팀별 독립 배포, 장애 격리, 언어·버전 선택의 자유가 생긴다. 단, 서비스 간 네트워크 통신, 분산 추적, 서비스 디스커버리 같은 복잡성이 추가된다.
> - **CI/CD에서 Docker의 역할**: GitHub Actions, GitLab CI 같은 도구에서 Docker 이미지를 빌드하고 레지스트리(Docker Hub, AWS ECR 등)에 푸시한다. 배포 단계에서는 서버가 새 이미지를 pull하고 컨테이너를 교체한다. 이 전체 흐름이 자동화되면 코드 머지 후 수 분 안에 운영 서버에 반영된다.
> - **다음 단계**: Docker 단독으로는 서버 한 대 수준이다. 수십~수백 개 컨테이너를 여러 서버에 걸쳐 관리하려면 Kubernetes(쿠버네티스) 같은 오케스트레이션 도구가 필요하다. Part VII에서 이 전환을 다룬다.

##### 체크포인트

- [ ] Docker가 해결하는 핵심 문제 세 가지를 나열할 수 있다
- [ ] 격리(Isolation)가 실무에서 왜 중요한지 예를 들어 설명할 수 있다
- [ ] Docker 배포가 기존 배포 방식보다 빠른 이유를 설명할 수 있다

---

## Part II. 컨테이너 생태계

### II-1-1. Docker, Podman, LXC — 뭐가 다른가

- **난이도**: ★☆☆~★★☆
- **선수 지식**: I-1-4
- **학습 목표**: 이 Section을 마치면 Docker 외 컨테이너 툴의 이름과 간략한 차이를 설명할 수 있다.
- **설명**:
  Docker는 컨테이너 생태계의 대명사지만 유일한 도구는 아니다. Podman(팟맨)은 Red Hat이 만든 Docker 대안으로, 데몬(daemon) 없이 루트 권한 없이 실행할 수 있어 보안 측면에서 유리하다. LXC(Linux Containers)는 Docker보다 오래된 저수준 컨테이너 기술로, Docker 자체가 초기에 LXC를 기반으로 만들어졌다. 실무에서는 대부분 Docker 또는 Docker 호환 도구(Podman)를 사용한다.
- **핵심 키워드**: Docker, Podman, LXC, 데몬(daemon), 루트리스(rootless)
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-2

#### 본문

##### 자동차 브랜드 비유로 시작하기

현대, 기아, BMW — 브랜드는 달라도 다 자동차다. 핸들, 브레이크 페달, 기어 변속기의 위치가 비슷하고, 운전 면허 하나로 어느 브랜드든 운전할 수 있다. 컨테이너 세계도 비슷하다. Docker, Podman, LXC — 도구는 달라도 다 컨테이너를 다루는 도구다.

이 섹션에서는 Docker 외에 어떤 도구들이 있고, 왜 Docker가 아닌 도구를 쓰는 상황이 생기는지 살펴본다.

##### Docker — 사실상 업계 표준

Docker는 2013년에 등장해서 컨테이너를 대중화시킨 도구다. 지금도 "컨테이너"라고 하면 대부분 Docker를 먼저 떠올릴 만큼 시장 점유율이 높다.

Docker는 내부적으로 **데몬**(daemon)이라는 백그라운드 프로세스를 항상 실행한다. 데몬은 서비스를 조용히 뒤에서 돌리는 프로세스라는 뜻이다. 터미널에서 `docker run` 명령을 입력하면, Docker CLI(명령줄 도구)가 이 데몬에 요청을 보내고, 데몬이 실제로 컨테이너를 만든다.

```
사용자 → docker CLI → dockerd(데몬) → containerd → 컨테이너
```

데몬은 기본적으로 **루트(root) 권한**으로 실행된다. 루트 권한은 컴퓨터의 모든 것에 접근할 수 있는 최고 관리자 권한이다. 이 점이 일부 보안 환경에서는 문제가 된다.

##### Podman — 데몬 없는 대안

Podman(팟맨)은 Red Hat이 만든 Docker 대안이다. "Pod Manager"의 줄임말이다. Podman의 가장 큰 특징은 두 가지다.

첫째, **데몬이 없다**(daemonless). `podman run` 명령을 입력하면 별도의 백그라운드 프로세스 없이 명령을 직접 실행한다. 데몬이 없으면 데몬 자체가 해킹당해서 모든 컨테이너가 영향받는 상황이 생기지 않는다.

둘째, **루트리스**(rootless)로 실행할 수 있다. 루트 권한 없이, 일반 사용자 권한으로 컨테이너를 실행한다. 보안이 엄격한 기업 환경에서 선호하는 이유가 여기에 있다.

Podman의 명령어는 Docker와 거의 동일하다.

```bash
# Docker
docker run -d nginx

# Podman — 같은 명령, 같은 결과
podman run -d nginx
```

대부분의 Docker 명령어가 `podman` 명령어로 그대로 동작한다. Docker에서 Podman으로 전환하는 데 별다른 학습이 필요 없다.

##### LXC — Docker의 뿌리

LXC(Linux Containers)는 Docker보다 오래된 컨테이너 기술이다. 2008년에 Linux 커널에 추가된 저수준 컨테이너 기술로, Docker도 초기에는 LXC를 기반으로 만들어졌다. (지금은 Docker가 자체 런타임을 쓴다.)

LXC는 VM과 컨테이너의 중간쯤 되는 격리 수준을 제공한다. 컨테이너 하나가 가벼운 가상 OS처럼 동작하고, systemd(리눅스 서비스 관리 도구)를 실행하거나 여러 프로세스를 함께 실행하는 것이 Docker보다 자연스럽다.

실무에서 LXC를 직접 쓰는 경우는 많지 않다. 주로 Docker 컨테이너로 해결이 어려운 특수 환경(IoT, 임베디드 시스템, 완전한 OS 환경이 필요한 경우)에서 등장한다.

##### 세 도구 비교

| 항목 | Docker | Podman | LXC |
|:--|:--|:--|:--|
| 데몬 | 있음 (dockerd) | 없음 | 없음 |
| 루트리스 | 부분 지원 | 기본 지원 | 가능 |
| 명령어 호환 | Docker 표준 | Docker 호환 | 별도 명령어 |
| OCI 이미지 지원 | O | O | 별도 형식 |
| 주요 사용처 | 개발, 범용 | 보안 환경, RHEL | 특수 OS 환경 |
| 학습 난이도 | 쉬움 | Docker와 동일 | 어려움 |

> **[입문 렌즈 ★☆☆]**
> - **비유**: 현대, 기아, BMW 모두 "차"인 것처럼 Docker, Podman, LXC 모두 "컨테이너 도구"다. 운전면허(Docker 명령어)를 익히면 Podman도 거의 그대로 쓸 수 있다.
> - **핵심 메시지**: 지금 당장은 Docker를 배우는 것이 맞다. 단, "Docker만 있는 게 아니다"는 것을 알아두면 나중에 회사에서 Podman을 쓴다고 해도 당황하지 않는다.
> - **핵심 질문**: Docker가 컨테이너의 대명사가 된 이유는 무엇인가? — 2013년 가장 먼저 쉬운 사용법과 이미지 레지스트리(Docker Hub)를 함께 제공했기 때문이다.

> **[주니어 렌즈 ★★☆]**
> - **실무 상황**: 회사 서버가 Red Hat Enterprise Linux(RHEL)나 Fedora 계열이면 기본으로 Podman이 설치되어 있는 경우가 있다. 이때 `docker` 명령이 없어도 `podman` 명령이 동일하게 동작한다.
> - **호환성 확인**: `podman run hello-world`를 실행해보면 Docker Hub에서 이미지를 받아 실행한다. Docker와 완전히 같은 결과가 나온다.
> - **alias 활용**: 개인 개발 환경에서 `alias docker=podman`을 설정하면 Docker 명령어로 Podman을 쓸 수 있다. CI 환경에서 Docker와 Podman을 투명하게 교체하는 방법이기도 하다.

> **[실무자 렌즈 ★★★]**
> - **루트리스의 보안 이점**: Docker 데몬은 루트로 실행되므로 Docker 소켓(`/var/run/docker.sock`)에 접근할 수 있는 사람은 사실상 호스트의 루트 권한을 얻는다. Podman 루트리스 모드는 이 공격 표면을 줄인다. PCI-DSS, HIPAA 같은 컴플라이언스 환경에서 Podman 채택이 늘고 있다.
> - **라이선싱 이슈**: Docker Desktop은 직원 250명 이상이거나 매출 1000만 달러 이상인 기업에서 상업적으로 사용할 경우 유료 구독이 필요하다(2022년부터). 이 때문에 기업들이 Podman Desktop이나 Rancher Desktop 같은 무료 대안으로 전환하는 사례가 늘었다.
> - **K8s 맥락**: Kubernetes 1.24 이후 Docker(dockershim) 지원이 제거되어 containerd나 CRI-O를 직접 사용한다. 이 변화는 Podman처럼 OCI 표준 기반 도구들의 입지를 더 넓혔다.

##### 체크포인트

- [ ] Docker, Podman, LXC의 차이를 한 줄씩 설명할 수 있다
- [ ] Podman이 보안 환경에서 선호되는 이유를 설명할 수 있다
- [ ] Docker 데몬(dockerd)이 무엇인지 비유로 설명할 수 있다

### II-1-2. OCI(Open Container Initiative) 표준

- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: 이 Section을 마치면 OCI 표준이 왜 중요한지, 어떤 호환성을 보장하는지 설명할 수 있다.
- **설명**:
  OCI(Open Container Initiative)는 컨테이너 이미지 형식과 런타임 사양을 정의하는 오픈 표준이다. Docker가 만든 이미지는 OCI 표준을 따르기 때문에 Podman, containerd, CRI-O 등 다른 런타임에서도 실행할 수 있다. 쉽게 말해, OCI는 컨테이너 세계의 "USB 규격"이다. 어떤 제조사의 USB 기기든 표준 포트에 꽂히는 것처럼, OCI 이미지는 어떤 OCI 런타임에서든 실행된다. Kubernetes(쿠버네티스)도 OCI 런타임만 지원하므로 실무에서 이 표준을 의식할 일이 생긴다.
- **핵심 키워드**: OCI, containerd, 이미지 사양(Image Spec), 런타임 사양(Runtime Spec)
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-3

#### 본문

##### USB 규격 비유로 시작하기

예전에는 휴대폰 충전 단자가 제조사마다 달랐다. 삼성, LG, 소니 각자의 독자 규격. 충전기를 가방에 여러 개씩 넣어 다녀야 했다. 그러다 USB Type-C라는 공통 표준이 생기면서 이제 하나의 케이블로 대부분의 기기를 충전한다.

컨테이너 세계도 초기에는 비슷한 혼란이 있었다. Docker는 자체 이미지 형식을 쓰고, rkt(로켓)는 다른 형식을 쓰고, 각 런타임이 서로 호환되지 않았다. 이 문제를 해결하기 위해 만들어진 것이 **OCI**(Open Container Initiative) 표준이다.

##### OCI란 무엇인가

OCI는 2015년 Docker와 CoreOS 등 여러 기업이 모여 만든 **컨테이너 표준화 단체이자 표준 명세**다. Linux Foundation 산하에 있다.

OCI는 크게 두 가지 사양(spec)을 정의한다.

| 사양 | 이름 | 역할 |
|:--|:--|:--|
| 이미지 형식 | Image Specification | 컨테이너 이미지를 어떻게 저장하고 배포할지 정의 |
| 런타임 형식 | Runtime Specification | 컨테이너를 어떻게 실행할지 정의 |

이 두 사양을 따르면, 어떤 도구로 만든 이미지든 어떤 런타임에서든 실행할 수 있다. OCI 이미지는 컨테이너 세계의 USB 규격이다.

##### OCI 덕분에 생긴 일들

`docker build`로 만든 이미지를 Podman으로 실행할 수 있다. GitHub Actions에서 빌드한 이미지를 AWS ECS, GCP Cloud Run, Kubernetes 어디에서나 실행할 수 있다. 이미지를 만든 도구와 실행하는 도구가 달라도 된다.

```
[Docker로 빌드한 이미지]
          │
          ├──▶ Docker 런타임으로 실행
          ├──▶ Podman으로 실행
          ├──▶ containerd(쿠버네티스 런타임)로 실행
          └──▶ CRI-O(쿠버네티스 런타임)로 실행
```

모두 가능한 이유가 OCI 표준이다.

##### 컨테이너 런타임 계층 구조

"런타임"이라는 단어가 여러 맥락에서 나오는데, 컨테이너에는 런타임이 여러 계층으로 나뉜다.

**상위 런타임 (High-level runtime)**: 사용자가 직접 명령어를 입력하는 도구다. Docker(dockerd), Podman이 여기에 해당한다. 이미지 pull, 컨테이너 생성, 네트워크 설정 같은 고수준 작업을 담당한다.

**중간 런타임**: containerd, CRI-O가 여기에 해당한다. Kubernetes는 이 계층과 직접 통신한다. Docker도 내부적으로 containerd를 사용한다.

**하위 런타임 (Low-level runtime)**: runc가 대표적이다. 실제로 Linux 커널의 namespace와 cgroup을 호출해서 컨테이너를 격리하는 가장 낮은 수준의 코드다. OCI Runtime Specification을 구현한다.

```
사용자
  │
  ▼
Docker CLI / Podman CLI  ← 상위 런타임 (사용자 인터페이스)
  │
  ▼
containerd / CRI-O       ← 중간 런타임 (이미지 관리, K8s 연동)
  │
  ▼
runc                     ← 하위 런타임 (실제 격리 실행, OCI 구현)
  │
  ▼
Linux Kernel (namespace, cgroup)
```

일반 개발자가 이 계층을 모두 알 필요는 없다. 하지만 Kubernetes를 다루거나 "Docker 없이 컨테이너를 실행한다"는 말이 나올 때 이 그림을 떠올리면 이해가 쉬워진다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: USB 규격이 생기기 전에는 제조사마다 충전 단자가 달랐다. OCI 표준 덕분에 어떤 도구로 만든 컨테이너 이미지도 어떤 런타임에서 실행할 수 있다. 이제 "이 이미지는 Docker에서만 된다"는 말은 틀렸다.
> - **핵심 메시지**: OCI를 직접 다룰 일은 없다. 그냥 "이게 있어서 Docker 이미지가 어디서든 된다"는 것만 기억하면 충분하다.
> - **핵심 질문**: Docker가 만든 이미지를 Podman에서 실행할 수 있는 이유는? — 둘 다 OCI 표준을 따르기 때문이다.

> **[주니어 렌즈 ★★☆]**
> - **이미지에서 OCI 확인하기**: `docker image inspect nginx:latest`를 실행하면 JSON 형태의 이미지 메타데이터가 출력된다. `"Architecture"`, `"Os"`, `"RootFS"` 같은 필드가 보인다. 이 메타데이터 형식 자체가 OCI Image Spec이 정의한 내용이다.
> - **실무 연결**: CI 파이프라인에서 `docker build`로 이미지를 만들어서 AWS ECR에 push한 뒤, ECS나 EKS(Kubernetes)에서 실행하는 흐름이 표준이다. 도구가 달라도 OCI 표준 덕분에 이 연결이 자연스럽게 이루어진다.
> - **주의 사항**: OCI 이미지는 Linux 기반이다. Windows 컨테이너는 별도 사양이 있고, Mac에서 ARM 이미지를 빌드할 때 `--platform linux/amd64` 옵션을 명시해야 하는 경우가 생긴다.

> **[실무자 렌즈 ★★★]**
> - **containerd vs dockerd**: Kubernetes 1.24에서 dockershim이 제거된 이후 K8s는 containerd나 CRI-O와 직접 통신한다. EKS, GKE, AKS 모두 기본 런타임으로 containerd를 사용한다. "Docker를 쓴다"는 말이 점점 "OCI 호환 도구를 쓴다"는 말로 대체되고 있다.
> - **CRI (Container Runtime Interface)**: K8s가 런타임과 통신하는 표준 인터페이스다. OCI Runtime Spec과 별개이지만 연관되어 있다. CRI-O는 CRI를 구현하면서 내부에서 OCI 런타임(runc)을 사용한다.
> - **Buildkit과 OCI**: `docker buildx`는 멀티 아키텍처(AMD64, ARM64) 이미지를 OCI 이미지 인덱스(manifest list) 형식으로 빌드할 수 있다. 하나의 태그로 플랫폼에 맞는 이미지가 자동으로 선택된다.

##### 체크포인트

- [ ] OCI가 생긴 이유를 USB 규격 비유로 설명할 수 있다
- [ ] Image Spec과 Runtime Spec이 각각 무엇을 정의하는지 말할 수 있다
- [ ] Docker로 만든 이미지를 Podman에서 실행할 수 있는 이유를 설명할 수 있다

### II-1-3. Docker Hub와 레지스트리

- **난이도**: ★★☆
- **선수 지식**: II-1-2
- **학습 목표**: 이 Section을 마치면 docker pull / docker push 명령으로 이미지를 주고받을 수 있다.
- **설명**:
  레지스트리(Registry)는 Docker 이미지를 저장하고 배포하는 저장소다. 가장 유명한 공개 레지스트리는 Docker Hub(hub.docker.com)이며, `docker pull python:3.11-slim` 처럼 공식 이미지를 무료로 내려받을 수 있다. 회사에서는 보안과 속도를 위해 GitHub Container Registry(ghcr.io), AWS ECR, GCP Artifact Registry 같은 사설 레지스트리를 운영한다. 레지스트리는 이미지의 "앱스토어"라고 생각하면 쉽다.
- **핵심 키워드**: 레지스트리(Registry), Docker Hub, docker pull, docker push, 태그(tag)
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-4

#### 본문

##### 앱스토어 비유로 시작하기

스마트폰에서 앱을 설치할 때 App Store나 Google Play를 쓴다. 거기서 앱을 "다운로드"하면 폰에 설치되고, 개발자는 자신이 만든 앱을 그곳에 "업로드"한다. 컨테이너 세계에도 같은 구조가 있다.

**레지스트리**(Registry)는 Docker 이미지를 저장하고 배포하는 중앙 저장소다. 앱스토어처럼 이미지를 올리고(push), 내려받고(pull), 검색할 수 있다.

##### Docker Hub — 가장 큰 공개 레지스트리

Docker Hub(hub.docker.com)는 Docker가 운영하는 공식 레지스트리다. 누구나 무료로 공개 이미지를 올리고 내려받을 수 있다.

터미널에서 다음 명령어를 실행하면 Docker Hub에서 nginx 이미지를 받아온다.

```bash
docker pull nginx:1.25
```

이 명령어를 풀어쓰면 이렇다.

```
docker pull  registry.hub.docker.com / nginx : 1.25
              ↑ 레지스트리 주소(기본값이라 생략 가능)   ↑ 이미지 이름   ↑ 태그(버전)
```

Docker Hub에는 공식 이미지(Official Images)와 사용자 이미지(User Images) 두 종류가 있다.

| 종류 | 예시 | 특징 |
|:--|:--|:--|
| 공식 이미지 | `nginx`, `python`, `postgres` | Docker가 직접 관리, 보안 검토됨 |
| 사용자 이미지 | `username/myapp` | 개인 또는 팀이 업로드 |

실무에서는 기반 이미지로 공식 이미지를 쓰는 것이 기본이다.

##### 이미지 태그 이해하기

같은 이미지에도 버전별로 여러 태그가 있다.

```bash
docker pull python:3.11-slim    # Python 3.11, 최소 설치본
docker pull python:3.11         # Python 3.11, 전체 설치본
docker pull python:latest       # 최신 버전 (권장하지 않음)
```

`slim`은 크기를 줄이기 위해 불필요한 패키지를 제거한 버전이다. 실무에서는 `python:3.11-slim`처럼 구체적인 버전과 변형을 명시하는 것이 좋다. `latest` 태그는 시간이 지나면 내용이 바뀔 수 있어 재현성이 떨어진다.

##### 사설 레지스트리

기업 환경에서는 소스 코드와 마찬가지로 이미지도 외부에 공개하면 안 된다. 이를 위해 **사설 레지스트리**(Private Registry)를 운영한다.

| 레지스트리 | 주소 | 특징 |
|:--|:--|:--|
| Docker Hub (유료) | hub.docker.com | 공개/비공개 선택 가능 |
| GitHub Container Registry | ghcr.io | GitHub 저장소와 통합 |
| AWS ECR | [계정].dkr.ecr.[리전].amazonaws.com | AWS 환경과 통합 |
| GCP Artifact Registry | [리전]-docker.pkg.dev | GCP 환경과 통합 |
| Harbor (셀프 호스팅) | 직접 설치 | 사내 인프라에 직접 운영 |

사설 레지스트리에 이미지를 올리려면 먼저 로그인이 필요하다.

```bash
# Docker Hub 로그인
docker login

# GitHub Container Registry 로그인
docker login ghcr.io

# AWS ECR 로그인 (aws CLI 필요)
aws ecr get-login-password | docker login --username AWS --password-stdin [ECR 주소]
```

로그인 후 이미지에 레지스트리 주소를 태그로 붙이고 push한다.

```bash
# 로컬 이미지에 ECR 태그 붙이기
docker tag myapp:1.0 [ECR 주소]/myapp:1.0

# ECR에 push
docker push [ECR 주소]/myapp:1.0
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: Docker Hub는 App Store, 이미지는 앱이다. `docker pull`은 앱 다운로드, `docker push`는 앱 업로드. 레지스트리 주소는 "어느 App Store에서 받을지" 지정하는 것이다.
> - **처음 해볼 것**: `docker pull hello-world`를 실행해보자. 아무것도 설치하지 않아도 Docker Hub에서 이미지를 자동으로 받아온다.
> - **핵심 질문**: `docker pull python:3.11-slim`에서 `3.11-slim`이 뭔가? — 이미지의 버전을 나타내는 태그(tag)다.

> **[주니어 렌즈 ★★☆]**
> - **첫 pull 경험**: `docker pull nginx:1.25`를 실행하면 여러 줄이 출력된다. `Pull complete`가 여러 번 나타나는데, 이미지가 레이어(layer) 단위로 나눠져 내려오기 때문이다. 이미 있는 레이어는 다시 받지 않는다.
> - **push 실습**: Docker Hub에서 무료 계정을 만들고 `docker login`으로 로그인한 뒤, `docker tag hello-world [내 계정]/hello-world`로 태그를 붙이고 `docker push [내 계정]/hello-world`로 올려보자. 내 이미지가 Docker Hub에 올라간다.
> - **이미지 검색**: `docker search nginx`로 Docker Hub에서 이미지를 검색할 수 있다. 공식 이미지는 `OFFICIAL` 컬럼에 `[OK]`가 표시된다.

> **[실무자 렌즈 ★★★]**
> - **사설 레지스트리 운영 이유**: 외부 레지스트리에 의존하면 Docker Hub의 rate limit(무료 계정은 6시간에 100번 pull 제한)이나 외부 레지스트리 장애가 배포에 영향을 준다. 사내 Harbor나 클라우드 레지스트리(ECR)를 쓰면 이 의존성을 제거하고 속도도 빠르다.
> - **이미지 미러링**: 공개 이미지를 사내 레지스트리에 미리 복사해두는 것을 미러링(mirroring)이라 한다. Docker Hub 장애나 rate limit 없이 안정적으로 이미지를 받을 수 있다. Skopeo나 crane 같은 도구로 자동화할 수 있다.
> - **취약점 스캔**: 레지스트리에 push할 때 이미지 취약점 스캔을 자동화하는 것이 실무 표준이다. ECR은 기본으로 Trivy 스캔을 지원하고, Harbor도 내장 스캐너가 있다. CI 파이프라인에서 심각한 취약점이 발견되면 배포를 막도록 설정한다.

##### 체크포인트

- [ ] 레지스트리가 무엇인지 앱스토어 비유로 설명할 수 있다
- [ ] `docker pull python:3.11-slim`에서 각 부분이 무슨 의미인지 설명할 수 있다
- [ ] Docker Hub와 사설 레지스트리를 언제 사용하는지 구분할 수 있다

### II-1-4. 언제 Docker를 선택하나

- **난이도**: ★★☆
- **선수 지식**: II-1-3
- **학습 목표**: 이 Section을 마치면 Docker가 적합한 상황과 오버엔지니어링인 상황을 구분할 수 있다.
- **설명**:
  Docker가 빛을 발하는 상황: 팀원이 여럿이고 개발 환경을 통일해야 할 때, CI/CD 파이프라인에서 재현 가능한 빌드가 필요할 때, 마이크로서비스를 독립 배포하고 싶을 때. 반면 Docker가 불필요한 상황: 개발자 혼자 간단한 스크립트를 돌릴 때, 팀 전원이 동일한 OS·런타임을 쓰고 있을 때. 도구는 문제를 해결하기 위해 존재한다. Docker가 목적이 되어서는 안 된다.
- **핵심 키워드**: 환경 통일, CI/CD, 마이크로서비스, 오버엔지니어링
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: III-1-1

#### 본문

##### 전동 드릴 비유로 시작하기

나사 하나를 박는다. 손으로 드라이버를 돌리면 30초면 끝난다. 그런데 전동 드릴을 꺼낸다. 배터리를 충전하고, 드릴 비트를 장착하고, 토크를 조절하고... 결국 나사 하나에 5분이 걸렸다. 전동 드릴이 나쁜 도구가 아니다. 그냥 이 작업에는 맞지 않았을 뿐이다.

Docker도 마찬가지다. 강력한 도구이지만, 모든 상황에 적합하지는 않다. Docker를 써야 할 때와 쓰지 않아도 될 때를 구분하는 것이 좋은 엔지니어링이다.

##### Docker가 진가를 발휘하는 상황

**상황 1: 팀원이 여럿이고 개발 환경을 통일해야 할 때**

개발자 5명이 각자 다른 운영체제(Windows, Mac, Linux)를 쓰는 팀을 상상해 보자. 새 팀원이 합류할 때마다 "내 컴퓨터에서 안 돼요" 문제를 해결하는 데 하루씩 쓴다. Docker로 개발 환경을 정의하면 `docker compose up` 한 줄로 모든 팀원이 같은 환경에서 시작한다.

**상황 2: CI/CD 파이프라인에서 재현 가능한 빌드가 필요할 때**

코드를 push할 때마다 자동으로 테스트하고 배포하는 파이프라인을 만들려면 "테스트 실행 환경이 항상 동일해야 한다"는 조건이 필수다. 오늘 테스트 통과했는데 내일 환경이 바뀌어 실패하면 안 된다. Docker 이미지로 테스트 환경을 고정하면 이 조건을 쉽게 충족한다.

**상황 3: 마이크로서비스를 독립 배포하고 싶을 때**

사용자 서비스, 결제 서비스, 알림 서비스가 각각 다른 팀이 다른 언어로 만드는 구조에서, 각 서비스를 컨테이너로 감싸면 다른 서비스에 영향 없이 독립적으로 배포할 수 있다.

**상황 4: 레거시 앱을 클라우드로 옮길 때**

오래된 앱을 클라우드 서버로 이전하는 경우, Docker 이미지로 앱을 패키징하면 "이 앱이 실행되는 정확한 환경"을 그대로 이전할 수 있다.

##### Docker가 오버엔지니어링인 상황

**상황 1: 혼자 간단한 스크립트를 돌릴 때**

매일 실행하는 Python 스크립트 하나를 Docker로 만들 필요는 없다. Python이 이미 설치되어 있고, 라이브러리 충돌 문제도 없다면 `python script.py`가 가장 단순한 답이다.

**상황 2: 팀 전원이 동일한 OS와 런타임을 쓸 때**

스타트업 초기 3명이 모두 같은 맥북에 같은 Python 버전을 쓴다면, `requirements.txt`로 충분히 환경을 맞출 수 있다. Docker를 추가하는 순간 학습 비용과 관리 부담이 생긴다.

**상황 3: 배포가 월 1회 이하인 매우 단순한 서비스**

서비스 복잡도와 배포 빈도가 낮다면 Docker의 이점이 상대적으로 줄어든다. 단순한 정적 웹사이트 하나를 위해 컨테이너 인프라를 구성하는 것은 과잉이다.

##### 판단 기준 정리

```
팀원이 2명 이상이고 환경이 서로 다른가?
  → YES: Docker 고려
  → NO:  requirements.txt 또는 virtualenv로 시작

CI/CD 파이프라인을 구성할 계획인가?
  → YES: Docker 강력 권장
  → NO:  필요 시 추가

서비스가 여러 개이고 독립 배포가 필요한가?
  → YES: Docker + Compose 강력 권장
  → NO:  단일 앱은 간단히 시작
```

| 상황 | 추천 |
|:--|:--|
| 개인 프로젝트, 간단한 스크립트 | virtualenv 또는 그냥 Python |
| 팀 프로젝트, 환경 통일 필요 | Docker Compose |
| CI/CD 자동화 | Docker 이미지 + 레지스트리 |
| 마이크로서비스, 다중 서비스 | Docker Compose → K8s |
| 프로덕션 대규모 배포 | Docker + Kubernetes |

> **[입문 렌즈 ★☆☆]**
> - **비유**: 나사 하나 박는데 전동 드릴을 꺼낼 필요가 없다. Docker는 강력하지만, 팀 프로젝트나 반복 배포처럼 복잡성이 생기기 시작할 때 꺼내는 도구다.
> - **핵심 메시지**: Docker를 쓰는 것이 목적이 아니다. "환경 불일치"나 "배포 복잡성" 같은 문제가 생겼을 때 Docker가 해결책이 되는 것이다.
> - **핵심 질문**: 지금 내가 겪는 문제가 Docker로 해결되는 문제인가? — 이 질문이 도입 여부를 결정한다.

> **[주니어 렌즈 ★★☆]**
> - **판단 플로차트 활용**: 새 프로젝트를 시작할 때 "팀원이 있는가?", "배포 자동화가 필요한가?", "서비스가 여러 개인가?" 세 질문에 하나라도 YES면 Docker를 고려한다. 세 질문 모두 NO라면 일단 없이 시작해도 된다.
> - **점진적 도입**: 혼자 시작한 프로젝트라도 팀이 커지면 Docker를 도입하면 된다. 처음부터 완벽하게 설계할 필요는 없다. `Dockerfile`을 나중에 추가해도 늦지 않는다.
> - **실무 팁**: 신규 프로젝트에서 Docker를 도입할 때 가장 설득력 있는 근거는 "온보딩 시간 단축"이다. "새 팀원이 오면 환경 설정에 하루가 걸린다"는 문제를 Docker로 해결하는 것이 팀에서 가장 빠르게 공감받는 도입 이유다.

> **[실무자 렌즈 ★★★]**
> - **도입 비용 vs 효과 매트릭스**: Docker 도입 비용은 학습 시간(1~2주), Dockerfile 작성, CI 파이프라인 수정이다. 효과는 온보딩 시간 단축, 배포 안정성 향상, 인프라 이식성이다. 팀이 클수록, 배포 빈도가 높을수록 효과가 비용을 압도한다.
> - **단계적 전략**: 전체 시스템을 한번에 Docker로 전환하는 것은 리스크가 크다. 새로 만드는 서비스부터 Docker를 적용하거나, 배포 문제가 가장 자주 발생하는 서비스 하나를 먼저 컨테이너화하는 점진적 전략이 현실적이다.
> - **Docker가 은총알이 아닌 경우**: 데이터 사이언스 환경에서 GPU를 직접 다루거나, 실시간 하드웨어 제어가 필요한 경우, 극도로 낮은 레이턴시(지연 시간)가 필요한 경우 Docker 레이어가 오히려 제약이 될 수 있다. 도구는 항상 맥락에 맞게 선택해야 한다.

##### 체크포인트

- [ ] Docker를 도입하기에 적합한 상황 두 가지를 설명할 수 있다
- [ ] Docker가 오버엔지니어링이 되는 상황 한 가지를 설명할 수 있다
- [ ] "Docker가 목적이 아닌 수단"이라는 말이 무슨 뜻인지 설명할 수 있다

---

## Part III. 첫 컨테이너 실행

### III-1-1. Docker 설치 (Windows/Mac/Linux)

- **난이도**: ★★☆
- **선수 지식**: II-1-4
- **학습 목표**: 이 Section을 마치면 `docker version` 명령이 정상 출력되는 환경을 갖출 수 있다.
- **설명**:
  Windows와 Mac에서는 **Docker Desktop**을 설치하는 것이 가장 빠르다. Docker Desktop은 GUI, Docker 엔진, Docker Compose를 한 번에 설치해준다. Linux에서는 패키지 관리자로 docker-ce(Community Edition)를 설치한다. 설치 후 `docker version`을 실행해 Client와 Server 버전이 모두 출력되면 성공이다. Windows WSL2 환경에서는 Docker Desktop이 WSL2 백엔드를 자동으로 사용한다.
- **핵심 키워드**: Docker Desktop, docker-ce, WSL2, `docker version`, `docker info`
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: III-1-2

#### 본문

##### Docker 설치 — 첫 관문 통과하기

지금까지 Docker가 무엇인지, 왜 필요한지를 배웠다. 이제 실제로 설치해 보자. "이론은 알겠는데, 내 컴퓨터에서 돌아가야 진짜지"라는 생각이 드는 순간이다. 이 섹션을 마치면 터미널에 `docker version`을 쳤을 때 숫자가 출력되는 환경을 갖추게 된다.

운영체제마다 설치 방법이 조금씩 다르다. 본인의 환경에 맞는 섹션으로 바로 이동하면 된다.

---

##### Windows에서 설치하기

Windows에서는 **Docker Desktop**을 설치하는 것이 가장 빠르고 간단하다. 카카오톡을 설치하는 것과 크게 다르지 않다. `setup.exe`를 실행하면 Docker 엔진, Docker Compose, GUI 대시보드가 한 번에 설치된다.

**사전 조건: WSL2 설정**

Docker Desktop은 내부적으로 WSL2(Windows Subsystem for Linux 2)를 사용한다. WSL2는 Windows 위에서 Linux를 실행하는 가벼운 환경이다. 설치 전에 WSL2가 활성화되어 있어야 한다.

```powershell
# PowerShell을 관리자 권한으로 열고 실행
wsl --install
# 재시작 후 확인
wsl --list --verbose
```

`VERSION` 열에 `2`가 표시되면 WSL2가 정상이다.

**Docker Desktop 설치**

1. [docs.docker.com/desktop/install/windows-install](https://docs.docker.com/desktop/install/windows-install) 에서 설치 파일을 내려받는다
2. `Docker Desktop Installer.exe`를 실행한다
3. 설치 중 "Use WSL 2 instead of Hyper-V" 옵션이 체크되어 있는지 확인한다
4. 설치 완료 후 재시작한다
5. 시스템 트레이(우측 하단)에 Docker 고래 아이콘이 생기면 성공이다

**설치 확인**

```bash
# WSL2 터미널 또는 PowerShell에서
docker version
```

`Client:` 와 `Server:` 두 섹션이 모두 출력되면 Docker 엔진이 정상 동작하는 것이다.

---

##### Mac에서 설치하기

Mac도 Docker Desktop을 사용한다. 한 가지 주의할 점이 있다. **Apple Silicon(M1/M2/M3) Mac인지, Intel Mac인지 확인해야 한다.**

```bash
# 터미널에서 칩 종류 확인
uname -m
# arm64 → Apple Silicon
# x86_64 → Intel
```

[docs.docker.com/desktop/install/mac-install](https://docs.docker.com/desktop/install/mac-install) 에서 본인의 칩에 맞는 설치 파일을 내려받는다. Apple Silicon용 `.dmg`와 Intel용 `.dmg`가 별도로 제공된다.

설치 후 터미널에서 `docker version`을 실행해 확인한다.

---

##### Linux에서 설치하기

Linux에서는 Docker Desktop 대신 **docker-ce**(Community Edition)를 직접 설치한다. Ubuntu 기준으로 설명한다.

```bash
# 1. 이전에 설치된 구버전 제거
sudo apt-get remove docker docker-engine docker.io containerd runc

# 2. 필요한 패키지 설치
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 3. Docker 공식 GPG 키 추가
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Docker 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Docker 설치
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**Linux 필수 후처리: 권한 그룹 추가**

설치 직후 `docker` 명령을 치면 `permission denied` 에러가 날 수 있다. Docker 데몬은 기본적으로 `root` 권한으로 실행되기 때문이다. `sudo docker`를 매번 치는 것은 번거로우니, 현재 사용자를 `docker` 그룹에 추가한다.

```bash
# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 반드시 로그아웃 후 다시 로그인해야 적용된다
# 또는 다음 명령으로 즉시 적용
newgrp docker

# 확인
docker version
```

---

##### 운영체제별 설치 방법 비교

| 항목 | Windows | Mac | Linux |
|:--|:--|:--|:--|
| 설치 방법 | Docker Desktop (.exe) | Docker Desktop (.dmg) | docker-ce (패키지 관리자) |
| 내부 구조 | WSL2 위 Linux VM | 경량 Linux VM | 직접 실행 |
| GUI 대시보드 | 제공 | 제공 | 미제공 (CLI 전용) |
| 후처리 필요 | WSL2 사전 활성화 | 칩 종류 확인 | 그룹 권한 추가 |
| 추천 대상 | 개발용 Windows PC | Mac 개발자 | 서버·CI 환경 |

---

> **[입문 렌즈 ★☆☆]**
> - **비유**: Docker 설치는 카카오톡 설치와 같다. 설치 파일을 내려받아 실행하면 된다. Windows/Mac은 GUI 설치 마법사가 나오고, Linux는 명령어로 설치한다.
> - **막혔을 때**: `docker version` 실행 시 `Cannot connect to the Docker daemon` 에러가 나오면 Docker Desktop이 아직 실행되지 않은 것이다. 트레이 아이콘에서 Docker Desktop을 시작하면 된다.
> - **핵심 질문**: "설치 후 `docker version`을 쳤을 때 Client와 Server 버전이 모두 나오는가?" — 이것이 성공 기준이다.

> **[주니어 렌즈 ★★☆]**
> - **Windows WSL2 주의사항**: WSL2 없이 설치하면 Hyper-V 백엔드로 실행된다. Hyper-V는 Windows Home 에디션에서 사용 불가다. WSL2 백엔드가 성능도 좋고 호환성도 높으므로 기본 선택이다.
> - **Mac Apple Silicon**: x86_64용 이미지를 Apple Silicon에서 실행하면 `WARNING: The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8)` 경고가 뜬다. 기능은 작동하지만 성능이 느릴 수 있다. 멀티 플랫폼 이미지(`--platform linux/amd64`)로 명시하거나 ARM 지원 이미지를 찾는다.
> - **Linux 그룹 적용**: `newgrp docker` 또는 로그아웃-로그인 없이 터미널을 새로 열면 그룹이 적용되지 않아 `permission denied`가 계속 뜬다. 재시작이 가장 확실하다.

> **[실무자 렌즈 ★★★]**
> - **Docker Desktop 라이선싱**: 2022년부터 기업(직원 250명 이상 또는 연매출 1천만 달러 이상)은 Docker Desktop 유료 구독이 필요하다. 오픈소스 프로젝트·소규모 팀·개인은 무료다.
> - **대안 도구**: 기업 환경에서 라이선스 비용을 피하려면 **Colima**(macOS·Linux용 경량 컨테이너 런타임)나 **Rancher Desktop**을 쓴다. `colima start` 한 줄로 Docker 소켓을 띄우며 Docker CLI와 완전히 호환된다. CI 서버에서는 Docker Desktop 없이 docker-ce만 설치하면 된다.
> - **`docker info`**: `docker version`보다 자세한 환경 정보를 출력한다. 스토리지 드라이버, 런타임, cgroup 버전, 메모리 제한 등 환경 검증에 유용하다.

##### 체크포인트

- [ ] `docker version`을 실행했을 때 Client와 Server 버전이 모두 출력된다
- [ ] `docker info`를 실행했을 때 `Containers: 0` 같은 상태 정보가 출력된다
- [ ] 본인 운영체제에서 설치 시 필요한 후처리(WSL2, 그룹 권한 등)를 수행했다
- [ ] Docker Desktop이 트레이 아이콘으로 실행 중이거나, Linux에서 `systemctl status docker`가 active임을 확인했다

### III-1-2. Hello World 컨테이너

- **난이도**: ★★☆
- **선수 지식**: III-1-1
- **학습 목표**: 이 Section을 마치면 `docker run hello-world` 동작 원리를 단계별로 설명할 수 있다.
- **설명**:
  `docker run hello-world`를 실행하면 Docker는 다음 순서로 동작한다. 1) 로컬에 `hello-world` 이미지가 있는지 확인한다. 2) 없으면 Docker Hub에서 자동으로 pull한다. 3) 이미지로 컨테이너를 생성·실행한다. 4) 컨테이너가 메시지를 출력하고 종료된다. 이 짧은 과정에서 이미지 pull, 컨테이너 생성, 실행, 종료의 전체 라이프사이클이 한 번에 일어난다.
- **핵심 키워드**: `docker run`, 이미지 pull, 컨테이너 라이프사이클, `hello-world`
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: III-1-3

#### 본문

##### Hello World — 프로그래머의 첫 인사

프로그래밍을 처음 배울 때 거의 모든 교재가 "Hello, World!"를 화면에 출력하는 것부터 시작한다. Docker도 마찬가지다. `docker run hello-world`는 Docker가 제대로 설치되었는지 확인하는 동시에, Docker의 핵심 동작 원리를 한 번에 보여준다.

```bash
docker run hello-world
```

명령을 실행하면 아래와 비슷한 출력이 나온다.

```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
719385e32844: Pull complete
Digest: sha256:...
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

단순해 보이지만, 이 짧은 출력 안에 Docker의 핵심 동작이 모두 담겨 있다.

---

##### docker run의 실제 동작 — 3단계

`docker run hello-world`를 입력했을 때 Docker 내부에서는 다음 3단계가 순서대로 실행된다.

```
[1] 이미지 확인
    로컬 캐시에 hello-world 이미지가 있는가?
    ↓ 없으면
[2] 이미지 Pull
    Docker Hub(인터넷)에서 hello-world 이미지를 내려받는다
    ↓
[3] 컨테이너 생성 → 실행 → 종료
    이미지로 컨테이너를 만들고 실행한다
    프로그램이 종료되면 컨테이너도 종료된다
```

처음 실행할 때는 `Unable to find image 'hello-world:latest' locally`라는 줄이 나온다. 로컬에 없으니 인터넷에서 받겠다는 뜻이다. 두 번째 실행부터는 이미 이미지가 로컬에 캐시되어 있으므로 이 줄이 나오지 않는다.

---

##### 상호작용하는 컨테이너 — ubuntu bash

`hello-world`는 출력만 하고 바로 종료된다. 컨테이너 안에 들어가서 직접 명령을 입력해 보고 싶다면 `-it` 옵션을 쓴다.

```bash
docker run -it ubuntu bash
```

옵션 의미를 풀어보면 다음과 같다.

| 옵션 | 의미 |
|:--|:--|
| `-i` | interactive — 입력을 받을 수 있게 한다 |
| `-t` | tty — 터미널처럼 보이게 한다 |
| `ubuntu` | 사용할 이미지 이름 |
| `bash` | 컨테이너 안에서 실행할 명령 |

실행하면 프롬프트가 바뀐다.

```
root@a3b7c9d1f2e4:/#
```

이제 컨테이너 안 Ubuntu Linux 터미널이다. `ls`, `pwd`, `cat /etc/os-release` 같은 명령을 자유롭게 입력할 수 있다.

```bash
# 컨테이너 안에서
cat /etc/os-release    # Ubuntu 버전 확인
ls /                   # 루트 디렉토리 목록
exit                   # 컨테이너 종료
```

`exit`를 입력하거나 `Ctrl + D`를 누르면 bash가 종료되고, 컨테이너도 함께 종료된다.

---

##### --rm 옵션 — 쓰고 버리기

기본적으로 `docker run`으로 실행한 컨테이너는 종료 후에도 목록에 남아 있다(`docker ps -a`로 확인 가능). 한번 쓰고 정리하고 싶다면 `--rm` 옵션을 추가한다.

```bash
# 종료 후 컨테이너를 자동으로 삭제
docker run --rm -it ubuntu bash
```

테스트나 일회성 작업에 자주 쓰는 패턴이다.

---

##### docker run 옵션 정리

```bash
# 기본 실행 (이미지만 지정)
docker run hello-world

# 상호작용 터미널
docker run -it ubuntu bash

# 백그라운드(데몬) 실행
docker run -d nginx

# 포트 연결 (호스트 8080 → 컨테이너 80)
docker run -d -p 8080:80 nginx

# 종료 후 자동 삭제
docker run --rm hello-world

# 이름 지정
docker run --name my-container -d nginx
```

---

> **[입문 렌즈 ★☆☆]**
> - **비유**: `docker run hello-world`는 스마트폰을 처음 켰을 때 나오는 "설정이 완료되었습니다" 화면과 같다. 기계가 제대로 작동한다는 신호다.
> - **체감 예시**: `hello-world` 출력에 "This message shows that your installation appears to be working correctly."라는 문장이 있다. 이것이 "설치 성공" 확인서다.
> - **핵심 질문**: "`docker run -it ubuntu bash`를 실행했을 때 프롬프트가 `root@...:#`으로 바뀌었는가?" — 그렇다면 컨테이너 안에 들어온 것이다.

> **[주니어 렌즈 ★★☆]**
> - **pull → create → start 3단계**: `docker run`은 사실 세 명령의 단축키다. `docker pull`(이미지 내려받기) + `docker create`(컨테이너 생성) + `docker start`(컨테이너 실행)를 한 번에 한다. 세 단계를 분리해서 실행하고 싶을 때는 각 명령을 직접 쓸 수 있다.
> - **-it 없이 bash 실행**: `docker run ubuntu bash`처럼 `-it`를 빼면 bash가 바로 종료된다. bash는 터미널(tty)이 없으면 입력을 받을 수 없어 즉시 종료된다. 상호작용이 필요한 명령에는 반드시 `-it`를 붙인다.
> - **--rm 습관**: 학습 중에는 `--rm`을 붙이는 습관을 들이면 `docker ps -a`에 죽은 컨테이너가 쌓이지 않는다.

> **[실무자 렌즈 ★★★]**
> - **docker run의 실제 동작 순서**: docker run → Docker CLI가 dockerd에 요청 → dockerd가 containerd에 위임 → containerd가 runc로 컨테이너 생성. `hello-world` 이미지의 Dockerfile을 보면 `CMD ["/hello"]`만 있는 최소 이미지다.
> - **이미지 레이어 캐싱**: 처음 pull 시 레이어를 내려받고 로컬에 캐시한다. 같은 베이스 이미지를 공유하는 다른 이미지를 pull하면 이미 있는 레이어는 건너뛴다. `--rm`은 컨테이너만 삭제하고 이미지는 유지한다.
> - **entrypoint vs cmd**: `docker run ubuntu bash`에서 `bash`는 `CMD`를 오버라이드한다. ubuntu 이미지의 기본 `CMD`는 `bash`이므로 사실 `docker run -it ubuntu`만 해도 동일하다.

##### 체크포인트

- [ ] `docker run hello-world`를 실행해서 "Hello from Docker!" 메시지를 확인했다
- [ ] `docker run -it ubuntu bash`로 컨테이너 안에 들어갔다가 `exit`로 나왔다
- [ ] `-i`, `-t`, `-d`, `-p`, `--rm` 옵션이 각각 무슨 역할인지 설명할 수 있다
- [ ] `docker run`이 내부적으로 pull → create → start 순서로 동작한다는 것을 설명할 수 있다

### III-1-3. docker ps / docker images — 상태 확인

- **난이도**: ★★☆
- **선수 지식**: III-1-2
- **학습 목표**: 이 Section을 마치면 실행 중인 컨테이너와 로컬 이미지 목록을 확인하고 정리할 수 있다.
- **설명**:
  `docker ps`는 현재 실행 중인 컨테이너 목록을 보여준다. 종료된 컨테이너까지 보려면 `docker ps -a`를 쓴다. `docker images`는 로컬에 저장된 이미지 목록을 보여준다. 불필요한 컨테이너는 `docker rm <id>`, 이미지는 `docker rmi <id>`로 삭제한다. 디스크를 한 번에 정리하고 싶다면 `docker system prune`을 사용한다(사용하지 않는 컨테이너·이미지·네트워크를 모두 삭제).
- **핵심 키워드**: `docker ps`, `docker images`, `docker rm`, `docker rmi`, `docker system prune`
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: III-1-4

#### 본문

##### 작업관리자 비유 — 무엇이 실행 중인가

Windows를 쓰다가 컴퓨터가 느려지면 `Ctrl + Alt + Delete`로 작업관리자를 연다. 어떤 프로그램이 CPU를 많이 쓰는지, 메모리는 얼마나 차지하는지 한눈에 보인다. Docker에도 같은 역할을 하는 명령이 있다. `docker ps`는 "지금 실행 중인 컨테이너는 무엇인가"를 보여주는 Docker의 작업관리자다.

---

##### docker ps — 실행 중인 컨테이너 확인

먼저 nginx 웹 서버를 백그라운드로 실행해 보자.

```bash
docker run -d --name my-nginx -p 8080:80 nginx
```

이제 `docker ps`를 실행하면 다음과 같이 출력된다.

```
CONTAINER ID   IMAGE   COMMAND                  CREATED         STATUS         PORTS                  NAMES
a3b7c9d1f2e4   nginx   "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds   0.0.0.0:8080->80/tcp   my-nginx
```

각 컬럼의 의미를 알아두면 유용하다.

| 컬럼 | 의미 |
|:--|:--|
| CONTAINER ID | 컨테이너의 고유 ID (앞 4~12자만 써도 인식) |
| IMAGE | 이 컨테이너를 만든 이미지 이름 |
| COMMAND | 컨테이너 시작 시 실행된 명령 |
| CREATED | 컨테이너가 만들어진 시간 |
| STATUS | 현재 상태 (Up = 실행 중, Exited = 종료) |
| PORTS | 포트 연결 정보 (호스트:컨테이너) |
| NAMES | 컨테이너 이름 |

---

##### docker ps -a — 종료된 컨테이너도 보기

`docker ps`는 실행 중인 컨테이너만 보여준다. 종료된 컨테이너까지 모두 보려면 `-a`(all) 옵션을 추가한다.

```bash
docker ps -a
```

```
CONTAINER ID   IMAGE         COMMAND    CREATED         STATUS                     NAMES
a3b7c9d1f2e4   nginx         "..."      2 minutes ago   Up 2 minutes               my-nginx
b4c8e2f1a3d5   hello-world   "/hello"   5 minutes ago   Exited (0) 5 minutes ago   eager_darwin
c5d9f3g2b4e6   ubuntu        "bash"     8 minutes ago   Exited (0) 7 minutes ago   sad_turing
```

`STATUS` 컬럼에서 `Exited (0)`은 정상 종료, `Exited (1)`이나 다른 숫자는 에러로 종료된 것이다.

---

##### docker images — 로컬 이미지 목록

`docker images`는 로컬 컴퓨터에 저장된 이미지 목록을 보여준다.

```bash
docker images
```

```
REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
nginx         latest    a6bd71f48f68   2 weeks ago    187MB
ubuntu        latest    3565a89d9e81   4 weeks ago    77.9MB
hello-world   latest    d2c94e258dcb   14 months ago  13.3kB
```

| 컬럼 | 의미 |
|:--|:--|
| REPOSITORY | 이미지 이름 |
| TAG | 버전 태그 (latest = 최신, 생략 시 latest) |
| IMAGE ID | 이미지 고유 ID |
| CREATED | 이미지가 빌드된 시간 |
| SIZE | 이미지 크기 |

---

##### 정리 명령 — rm, rmi, prune

컨테이너와 이미지가 쌓이면 디스크 공간을 차지한다. 필요 없는 것은 정리해야 한다.

```bash
# 특정 컨테이너 삭제 (ID 또는 이름)
docker rm my-nginx          # 실행 중인 컨테이너는 삭제 안 됨
docker rm -f my-nginx       # -f: 실행 중이어도 강제 삭제

# 종료된 컨테이너 모두 삭제
docker rm $(docker ps -aq)

# 특정 이미지 삭제
docker rmi nginx
docker rmi nginx:latest     # 태그 명시

# 사용하지 않는 것 한 번에 정리 (컨테이너 + 이미지 + 네트워크)
docker system prune

# 볼륨까지 포함해서 정리
docker system prune -a --volumes
```

> **주의**: `docker system prune -a`는 실행 중이지 않은 이미지를 모두 삭제한다. 다시 필요하면 다시 pull해야 한다.

---

##### docker system df — 디스크 사용량 확인

정리 전에 얼마나 차지하고 있는지 먼저 확인하고 싶다면 `docker system df`를 쓴다.

```bash
docker system df
```

```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          4         2         1.2GB     800MB (67%)
Containers      6         1         0B        0B
Local Volumes   2         1         245MB     120MB (49%)
Build Cache     8         0         180MB     180MB (100%)
```

`RECLAIMABLE` 컬럼은 정리 시 회수 가능한 용량이다. 빌드 캐시가 100% 회수 가능하다는 것은 지금 당장 정리해도 아무런 문제가 없다는 뜻이다.

---

> **[입문 렌즈 ★☆☆]**
> - **비유**: `docker ps`는 컴퓨터의 작업관리자다. 어떤 컨테이너가 실행 중인지, 어떤 포트를 쓰는지 한눈에 볼 수 있다. `docker images`는 앱스토어의 "내 앱 목록"이다. 내려받은 이미지가 모두 여기에 있다.
> - **막혔을 때**: `docker ps`에 아무것도 안 나오면 실행 중인 컨테이너가 없는 것이다. `docker ps -a`를 치면 종료된 것들도 보인다.
> - **핵심 질문**: "`docker ps`와 `docker ps -a`의 차이는?" — `ps`는 실행 중만, `-a`는 종료된 것도 포함해서 보여준다.

> **[주니어 렌즈 ★★☆]**
> - **컨테이너 ID 단축**: CONTAINER ID는 12자리지만 앞 3~4자리만 입력해도 Docker가 인식한다. `docker rm a3b7`처럼 쓸 수 있다. 단, 앞 자리가 겹치는 컨테이너가 있으면 에러가 난다.
> - **docker images 출력 읽기**: `hello-world` 이미지가 13.3kB인 것을 보면, Docker 이미지가 반드시 클 필요는 없다는 것을 알 수 있다. 반면 머신러닝 이미지는 수 GB가 되기도 한다. SIZE를 보고 큰 이미지는 경량화 여부를 검토한다.
> - **정리 전 확인**: `docker system df`를 먼저 실행해서 회수 가능한 공간을 확인하는 습관을 들인다. `docker system prune -a`는 강력한 명령이라 실수로 필요한 이미지를 지울 수 있다.

> **[실무자 렌즈 ★★★]**
> - **docker system df -v**: `-v`(verbose) 옵션을 추가하면 각 이미지/컨테이너/볼륨별 상세 크기가 나온다. 어떤 이미지가 디스크를 많이 차지하는지 파악할 수 있다.
> - **CI 환경 정리**: CI 서버에서 빌드를 반복하다 보면 이미지가 빠르게 쌓인다. 파이프라인 마지막 단계에 `docker system prune -f` 또는 `docker image prune -f`를 추가해서 자동 정리한다.
> - **--filter 옵션**: `docker ps --filter status=exited`처럼 상태로 필터링하거나, `docker images --filter dangling=true`로 태그 없는 이미지만 추려서 정리할 수 있다. 스크립트 자동화에 유용하다.

##### 체크포인트

- [ ] `docker ps`와 `docker ps -a`의 출력 차이를 설명할 수 있다
- [ ] `docker images` 출력에서 REPOSITORY, TAG, SIZE 컬럼의 의미를 설명할 수 있다
- [ ] `docker rm`과 `docker rmi`의 차이를 설명할 수 있다
- [ ] `docker system prune`이 무엇을 삭제하는지 설명할 수 있다

### III-1-4. 처음 만나는 에러

- **난이도**: ★★☆
- **선수 지식**: III-1-3
- **학습 목표**: 이 Section을 마치면 Docker 초보자가 흔히 만나는 에러 3가지를 스스로 해결할 수 있다.
- **설명**:
  가장 흔한 에러 첫 번째, `Cannot connect to the Docker daemon` — Docker Desktop이 실행 중이지 않은 것이다. 트레이 아이콘에서 Docker Desktop을 시작하면 해결된다. 두 번째, `port is already allocated` — 호스트에서 같은 포트를 이미 쓰고 있다. 다른 포트로 매핑(`-p 8080:8000`)하거나 기존 프로세스를 종료한다. 세 번째, `No space left on device` — 이미지·컨테이너가 디스크를 가득 채운 것이다. `docker system prune`으로 정리한다.
- **핵심 키워드**: Docker daemon, 포트 충돌, 디스크 정리, `docker system prune`
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: IV-1-1

#### 본문

##### 에러는 기계가 보내는 메시지다

처음 Docker를 쓸 때 에러가 나면 당황스럽다. 빨간 글씨가 쏟아지면 뭔가 크게 잘못된 것 같은 느낌이 든다. 하지만 에러 메시지는 "무엇이 문제인지"를 기계가 영어로 설명해 주는 것이다. 겁내지 말고 메시지를 읽으면, 대부분 해결 방법이 메시지 안에 있거나 메시지를 검색하면 바로 나온다.

이 섹션에서는 Docker 입문자가 가장 자주 만나는 에러 3가지와 해결법을 정리한다.

---

##### 에러 1: Cannot connect to the Docker daemon

```
docker: Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
Is the docker daemon running?
```

**원인**: Docker 데몬(백그라운드 프로세스)이 실행되지 않은 상태에서 `docker` 명령을 입력했다.

이것은 자동차 시동을 걸지 않고 악셀을 밟은 것과 같다. Docker Desktop이 실행되지 않으면 `docker` 명령이 아무것도 할 수 없다.

**해결 방법**

| 운영체제 | 해결 방법 |
|:--|:--|
| Windows / Mac | 시스템 트레이에서 Docker Desktop 아이콘을 더블클릭해서 시작한다 |
| Linux | `sudo systemctl start docker` 또는 `sudo service docker start` |

확인 방법:

```bash
docker version
# 정상이면 Client: / Server: 두 섹션이 출력됨
```

---

##### 에러 2: port is already allocated

```
Error response from daemon: driver failed programming external connectivity on endpoint my-app:
Bind for 0.0.0.0:8080 failed: port is already allocated
```

**원인**: 호스트(내 컴퓨터)의 8080 포트를 이미 다른 프로세스가 사용하고 있다. Docker가 같은 포트를 사용하려고 하니 충돌이 생긴다.

**해결 방법 1: 다른 포트로 변경**

```bash
# 8080 대신 8081 포트 사용
docker run -d -p 8081:80 nginx
```

**해결 방법 2: 기존 프로세스 확인 후 종료**

```bash
# Windows PowerShell — 8080 포트 사용 프로세스 확인
netstat -ano | findstr :8080

# Mac / Linux
lsof -i :8080
# 또는
ss -tlnp | grep 8080
```

출력된 PID(프로세스 ID)를 확인하고, 해당 프로세스가 무엇인지 확인한 뒤 종료한다. 혹시 이미 실행 중인 Docker 컨테이너가 같은 포트를 쓰고 있을 수도 있다.

```bash
# 실행 중인 컨테이너 중 8080 포트를 쓰는 것 확인
docker ps | grep 8080
```

---

##### 에러 3: No such image / pull access denied

```
Unable to find image 'myngix:latest' locally
docker: Error response from daemon: pull access denied for myngix, repository does not exist or may require 'docker login'
```

**원인**: 이미지 이름을 잘못 입력했거나, 존재하지 않는 이미지를 pull하려고 했다. 오타가 가장 흔한 원인이다. 위 예시에서 `myngix`는 `nginx`의 오타다.

**해결 방법**

1. 이미지 이름의 오타를 확인한다 (`nginx`인지 `ngnix`인지)
2. [hub.docker.com](https://hub.docker.com) 에서 이미지 이름을 검색해서 정확한 이름을 확인한다
3. 비공개 저장소(사설 레지스트리)에 있는 이미지라면 `docker login` 후 다시 시도한다

```bash
# Docker Hub 로그인
docker login

# 이미지 이름 정확히 입력
docker pull nginx        # 올바른 이름
docker run -d nginx
```

---

##### 에러 4: No space left on device

```
write /var/lib/docker/tmp/...: no space left on device
```

**원인**: 디스크가 꽉 찼다. Docker는 이미지, 컨테이너, 볼륨, 빌드 캐시를 저장하는데, 이것들이 쌓이면 디스크를 많이 차지한다.

**해결 방법**

```bash
# 현재 Docker가 차지하는 공간 확인
docker system df

# 사용하지 않는 컨테이너, 이미지, 네트워크 정리
docker system prune

# 빌드 캐시까지 포함해서 정리 (더 공격적)
docker system prune -a

# 볼륨까지 포함 (주의: 데이터 손실 가능)
docker system prune -a --volumes
```

> **주의**: `--volumes` 옵션은 볼륨에 저장된 데이터도 삭제한다. 데이터베이스 볼륨이 있다면 삭제 전 백업을 확인한다.

---

##### 에러 메시지 읽는 법

에러가 길게 나와도 겁내지 않아도 된다. 아래 순서로 읽으면 대부분 해결된다.

```
1. 마지막 줄을 먼저 읽는다 — 실제 에러 원인이 대부분 마지막에 있다
2. "Error:", "failed:", "denied:" 키워드를 찾는다
3. 에러 메시지 그대로 복사해서 검색한다 (StackOverflow, GitHub Issues)
```

모르는 에러가 나왔다고 해서 처음부터 다시 읽거나 모든 줄을 이해하려고 하지 않아도 된다. 핵심 키워드만 검색하면 이미 같은 문제를 겪은 사람의 해결책을 찾을 수 있다.

---

> **[입문 렌즈 ★☆☆]**
> - **비유**: 에러 메시지는 자동차 계기판의 경고등이다. 경고등이 켜진다고 자동차가 폭발하지는 않는다. 어떤 경고등인지 확인하고 설명서(검색)를 찾아보면 된다.
> - **막혔을 때**: 에러 메시지 전체를 복사해서 ChatGPT나 Google에 붙여 넣으면 해결책이 나온다. 한국어로 "docker [에러 내용]"으로 검색해도 된다.
> - **핵심 질문**: "지금 만난 에러 메시지에서 핵심 키워드가 무엇인가?" — 그 키워드로 검색한다.

> **[주니어 렌즈 ★★☆]**
> - **포트 충돌 빠른 확인**: `docker ps`를 먼저 실행해서 이미 같은 포트를 쓰는 컨테이너가 있는지 확인한다. 이미 실행 중인 컨테이너가 원인인 경우가 많다.
> - **permission denied**: Linux에서 `docker` 그룹에 사용자를 추가하지 않은 상태에서 `sudo` 없이 `docker` 명령을 치면 `permission denied`가 난다. III-1-1 섹션의 Linux 후처리(그룹 추가)를 다시 확인한다.
> - **image not found**: Docker Hub에서 공식 이미지는 `nginx`, `ubuntu`, `python`처럼 한 단어다. 개인/조직 이미지는 `username/imagename` 형식이다. 이름 규칙을 확인한다.

> **[실무자 렌즈 ★★★]**
> - **에러 기반 학습 전략**: 에러가 날 때마다 원인과 해결책을 개인 노트에 기록한다. 같은 에러를 두 번 검색하지 않게 된다.
> - **docker logs로 디버깅**: 컨테이너가 시작하자마자 종료되는 경우(`Exited (1)`) `docker logs <container_id>`로 컨테이너 내부 로그를 확인한다. 대부분 로그 마지막 줄에 원인이 있다.
> - **docker inspect로 상세 정보 확인**: `docker inspect <container_id>`는 컨테이너의 네트워크 설정, 마운트, 환경변수, 종료 코드 등 상세 정보를 JSON으로 출력한다. `--format` 옵션으로 원하는 필드만 추출할 수 있다.

```bash
# 마지막 종료 코드 확인
docker inspect --format='{{.State.ExitCode}}' <container_id>

# 컨테이너 로그 실시간 보기
docker logs -f <container_id>

# 마지막 50줄만 보기
docker logs --tail 50 <container_id>
```

##### 체크포인트

- [ ] `Cannot connect to the Docker daemon` 에러의 원인과 해결법을 설명할 수 있다
- [ ] `port is already allocated` 에러가 났을 때 2가지 해결 방법을 말할 수 있다
- [ ] 이미지 이름 오타로 생기는 `pull access denied` 에러를 구분할 수 있다
- [ ] 에러 메시지에서 핵심 키워드를 찾아 검색하는 방법을 안다
- [ ] `docker logs <container_id>`로 컨테이너 내부 로그를 확인할 수 있다

---

## Part IV. 이미지·Dockerfile

### IV-1-1. Dockerfile에서 컨테이너까지

- **난이도**: ★★☆~★★★
- **선수 지식**: III-1-4
- **학습 목표**: 이 Section을 마치면 Dockerfile을 작성하고 `docker build` / `docker run`으로 컨테이너를 실행할 수 있다.
- **설명**:
  Dockerfile은 이미지를 만드는 설계도다. 아래 순서로 동작한다. 1) `FROM` — 베이스 이미지를 지정한다. 2) `WORKDIR` — 컨테이너 안의 작업 디렉토리를 설정한다. 3) `COPY` — 로컬 파일을 컨테이너 안으로 복사한다. 4) `RUN` — 명령어를 실행해 레이어를 쌓는다. 5) `CMD` — 컨테이너 시작 시 실행할 기본 명령을 지정한다. `docker build -t myapp .`으로 이미지를 빌드하고, `docker run -p 8000:8000 myapp`으로 실행한다.
- **핵심 키워드**: FROM, WORKDIR, COPY, RUN, CMD, ENV, EXPOSE, `docker build`, `docker run`, `-p`, `-t`, `-d`
- **시각화 연결**: `index.html` (IV-1-1 Dockerfile→컨테이너 6단계 시각화)
- **다음 섹션**: IV-1-2

### IV-1-2. 레이어 캐싱과 빌드 최적화

- **난이도**: ★★★
- **선수 지식**: IV-1-1
- **학습 목표**: 이 Section을 마치면 레이어 캐시 무효화 원리를 이해하고, 빌드 속도를 최적화하는 Dockerfile을 작성할 수 있다.
- **설명**:
  Docker 이미지는 레이어(층)의 스택이다. `docker build` 시 각 명령어가 하나의 레이어를 만든다. 어떤 레이어가 변경되면 그 아래 레이어부터 모두 다시 빌드된다(캐시 무효화). 따라서 자주 변경되는 파일(`COPY . .`)은 뒤에, 잘 변경되지 않는 의존성 설치(`COPY requirements.txt . → RUN pip install`)는 앞에 두는 것이 핵심이다. 이 순서만 지켜도 빌드 시간이 크게 단축된다.
- **핵심 키워드**: 레이어(Layer), 레이어 캐시, 캐시 무효화, 빌드 최적화, `.dockerignore`
- **시각화 연결**: 향후 구현 예정 (STEP 2 캐시 패널이 index.html에 부분 구현됨)
- **다음 섹션**: IV-1-3

#### 본문

##### 레이어 캐시란 무엇인가

Docker 이미지는 레이어(layer)의 스택이다. Dockerfile의 각 명령어(`FROM`, `RUN`, `COPY` 등)가 실행될 때마다 파일시스템 변경 사항이 새 레이어로 쌓인다. `docker build`를 실행할 때 Docker는 각 레이어를 디스크에 저장해두고, 다음 빌드 때 동일한 레이어라고 판단되면 저장된 것을 그대로 재사용한다. 이것이 **레이어 캐시**다.

레이어 캐시가 유효한지 여부는 세 가지 조건으로 결정된다.

1. **명령어 텍스트**가 이전과 동일한가
2. **`COPY` / `ADD` 대상 파일**의 내용(체크섬)이 이전과 동일한가
3. **이전 레이어**가 캐시 히트였는가

세 번째 조건이 핵심이다. 중간 레이어 하나라도 캐시가 무효화되면 **그 이후의 모든 레이어**가 다시 실행된다. 한 층이 무너지면 그 위에 쌓인 층도 모두 다시 쌓아야 하는 것과 같다.

빌드 출력에서 `---> Using cache`가 보이면 해당 레이어는 캐시를 사용한 것이다. `---> Running in ...`이 보이면 새로 실행한 것이다.

```bash
docker build -t myapp .
```

```
Step 1/6 : FROM python:3.12-slim
 ---> Using cache
Step 2/6 : WORKDIR /app
 ---> Using cache
Step 3/6 : COPY requirements.txt .
 ---> Using cache
Step 4/6 : RUN pip install -r requirements.txt
 ---> Using cache
Step 5/6 : COPY . .
 ---> Running in a1b2c3d4e5f6    ← 소스 변경 → 캐시 무효화
Step 6/6 : CMD ["python", "main.py"]
 ---> Running in b2c3d4e5f6a1
```

`requirements.txt`가 변하지 않았다면 Step 4(`pip install`)까지는 캐시가 유지된다. Step 5에서 소스 파일이 바뀌면 그 이후만 재실행된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 레고 조립과 같다. 이미 만들어둔 조각은 다시 만들지 않아도 된다. 3층짜리 탑을 쌓다가 2층을 바꾸면 2층과 3층만 다시 만들면 된다. 1층은 그대로 쓴다. Dockerfile 레이어도 마찬가지다. 변경된 명령어와 그 아래(이후) 명령어만 다시 실행된다.
> - **체감 예시**: `pip install`이 없는 빌드는 수초만에 끝난다. `requirements.txt`가 바뀌면 패키지를 전부 다시 내려받아야 해서 수분이 걸릴 수 있다. 패키지를 먼저 설치하고 소스를 나중에 복사하면 소스만 바꿀 때는 `pip install`을 건너뛴다. 이 순서 하나가 개발 사이클 속도를 크게 바꾼다.
> - **주의**: 레이어 순서가 캐시 효율을 결정한다. `COPY . .`(소스 전체 복사)를 `RUN pip install` 앞에 두면, 소스 파일이 한 글자라도 바뀔 때마다 패키지를 다시 설치하게 된다.

##### 캐시를 최대화하는 Dockerfile 작성법

캐시 효율을 높이는 핵심 원칙은 **"자주 변하는 것은 뒤에, 자주 변하지 않는 것은 앞에"** 두는 것이다.

**나쁜 순서 — 소스가 바뀔 때마다 pip install 재실행:**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . .                          # ← 소스 전체 복사 (자주 변함)
RUN pip install -r requirements.txt  # ← 의존성 설치 (시간 오래 걸림)
CMD ["python", "main.py"]
```

소스 파일이 한 줄만 바뀌어도 `COPY . .` 레이어가 무효화되고, 그 다음의 `RUN pip install`도 다시 실행된다. 매번 수십 개의 패키지를 다시 내려받는다.

**좋은 순서 — 의존성 파일만 먼저 복사, 소스는 나중에:**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .           # ← 의존성 파일만 복사 (거의 안 변함)
RUN pip install -r requirements.txt  # ← requirements.txt가 안 변하면 캐시 유지
COPY . .                          # ← 소스 복사 (자주 변해도 pip install은 건너뜀)
CMD ["python", "main.py"]
```

`requirements.txt`가 바뀌지 않으면 `RUN pip install` 레이어는 캐시가 유지된다. 소스 파일이 아무리 바뀌어도 의존성 설치는 건너뛴다.

Node.js(npm) 프로젝트도 같은 원리를 적용한다.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./  # ← 패키지 파일 먼저
RUN npm ci                               # ← node_modules 설치
COPY . .                                 # ← 소스 나중에
CMD ["node", "index.js"]
```

`npm install` 대신 `npm ci`를 쓰는 것도 실무 관행이다. `npm ci`는 `package-lock.json`을 엄격하게 따르기 때문에 빌드 환경에서 재현 가능한 의존성 설치를 보장한다.

##### .dockerignore로 불필요한 파일 제거

`COPY . .` 명령은 현재 디렉토리의 모든 파일을 컨테이너로 복사한다. `.git`, `node_modules`, `__pycache__`, `.env` 파일까지 전부 들어간다. 이 파일들이 복사 대상에 포함되면 두 가지 문제가 생긴다.

1. **캐시 무효화 빈도 증가**: `.git`이나 테스트 파일처럼 자주 바뀌는 파일이 복사 레이어에 포함되면 캐시가 더 자주 깨진다.
2. **이미지 크기 증가**: `node_modules` 수백 MB가 이미지 안으로 들어가면 이미지가 불필요하게 커진다.

`.dockerignore` 파일을 프로젝트 루트에 만들어 복사에서 제외할 패턴을 지정한다.

```
# .dockerignore
.git
.gitignore
.env
.env.*
__pycache__
*.pyc
*.pyo
node_modules
.pytest_cache
.coverage
dist
build
*.log
```

`.dockerignore` 문법은 `.gitignore`와 동일하다. 이 파일이 있으면 Docker는 `COPY . .` 전에 컨텍스트에서 해당 패턴의 파일을 제외한다. 빌드 컨텍스트(빌드에 포함되는 파일 묶음) 자체가 작아지므로 빌드 시작 속도도 빨라진다.

> **[주니어 렌즈 ★★☆]**
> - **캐시 강제 무효화**: `--no-cache` 플래그를 추가하면 캐시를 무시하고 전체를 새로 빌드한다. `docker build --no-cache -t myapp .` — 의존성이 업데이트됐는데 캐시 때문에 이전 버전이 쓰이는 상황, 또는 CI에서 깨끗한 빌드가 필요할 때 사용한다. 특정 ARG 값을 바꿔서 특정 레이어부터만 캐시를 무효화하는 기법도 있다(`ARG CACHE_BUST=$(date +%s)` 패턴).
> - **`COPY requirements.txt .`의 주의점**: 만약 여러 디렉토리에 `requirements.txt`가 나뉘어 있다면 각각 따로 COPY해야 한다. 예: `COPY backend/requirements.txt ./backend/` 뒤에 `RUN pip install -r backend/requirements.txt`. 경로를 틀리면 `no such file or directory` 빌드 오류가 난다.
> - **레이어 병합으로 크기 줄이기**: 여러 `RUN` 명령을 `&&`로 연결해 하나의 레이어로 만들면 중간 파일이 최종 이미지에 남지 않는다. 특히 `apt-get install` 뒤에 캐시를 지우는 패턴이 표준이다.
>
>   ```dockerfile
>   RUN apt-get update && apt-get install -y --no-install-recommends \
>       curl \
>       && rm -rf /var/lib/apt/lists/*
>   ```
>
>   `apt-get update`와 `apt-get install`을 별도 `RUN` 명령으로 나누면 캐시 문제로 인해 오래된 패키지가 설치될 수 있다. 반드시 같은 `RUN` 명령에 연결한다.

##### BuildKit 캐시 마운트

Docker 19.03 이상에서 기본 활성화된 **BuildKit**은 더 강력한 캐시 옵션을 제공한다. `--mount=type=cache`를 사용하면 레이어가 아닌 별도 캐시 볼륨에 빌드 캐시를 저장한다. 레이어 캐시와 달리 빌드마다 초기화되지 않고 호스트에 영속적으로 유지된다.

**pip 캐시 마운트 예시:**

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

`/root/.cache/pip`는 pip의 로컬 캐시 디렉토리다. `--mount=type=cache`로 마운트하면 이전 빌드에서 내려받은 패키지 캐시가 남아 있어 네트워크 요청 없이 설치가 완료된다. `requirements.txt`가 바뀌더라도 이미 받은 패키지는 디스크에서 바로 읽는다.

**npm 캐시 마운트 예시:**

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
CMD ["node", "index.js"]
```

> **[실무자 렌즈 ★★★]**
> - **BuildKit 원격 캐시 — CI 가속**: 로컬 빌드와 달리 CI(GitHub Actions, GitLab CI 등)는 매번 새 환경에서 실행되므로 로컬 레이어 캐시가 없다. BuildKit의 `--cache-from`과 `--cache-to` 옵션으로 레지스트리에 캐시를 저장하고 불러올 수 있다.
>
>   ```bash
>   # 레지스트리에서 캐시 불러오면서 빌드, 완료 후 캐시 저장
>   docker build \
>     --cache-from type=registry,ref=ghcr.io/myorg/myapp:cache \
>     --cache-to   type=registry,ref=ghcr.io/myorg/myapp:cache,mode=max \
>     -t ghcr.io/myorg/myapp:latest .
>   ```
>
>   `mode=max`는 중간 레이어까지 모두 캐시에 포함한다(기본 `mode=min`은 최종 이미지 레이어만). 첫 빌드는 느리지만 이후 빌드는 변경된 레이어만 새로 실행한다. 특히 의존성 설치 레이어가 CI에서 캐시되면 빌드 시간이 크게 단축된다.
> - **GitHub Actions 캐시 통합**: `docker/build-push-action`의 `cache-from: type=gha`, `cache-to: type=gha` 옵션을 쓰면 GitHub Actions의 캐시 스토리지를 BuildKit 캐시 백엔드로 사용할 수 있다. 레지스트리 권한 없이도 CI 캐시를 활용할 수 있어 설정이 간단하다.
> - **레이어 캐시 분석**: `docker history <이미지명>`으로 각 레이어의 크기와 명령어를 확인한다. 크기가 큰 레이어가 자주 무효화되는 구조라면 Dockerfile 순서를 재배치할 여지가 있다. `docker buildx imagetools inspect <이미지명>`으로 멀티플랫폼 이미지의 레이어 구성을 더 상세히 볼 수 있다.
> - **캐시 무효화 전략**: `ARG`를 활용해 캐시 무효화를 제어할 수 있다. 예를 들어 보안 패치 적용을 위해 베이스 이미지만 다시 받고 싶을 때는 `--build-arg BASEIMAGE_DIGEST=$(docker pull python:3.12-slim --quiet)` 방식으로 특정 지점부터 캐시를 깨는 트리거를 만들 수 있다.

##### 체크포인트

- [ ] Dockerfile 레이어 캐시가 무효화되는 세 가지 조건을 설명할 수 있다
- [ ] `requirements.txt`를 소스 파일보다 먼저 COPY해야 하는 이유를 설명하고, 실제 Dockerfile에 적용할 수 있다
- [ ] `.dockerignore` 파일을 만들어 `.git`, `node_modules`, `.env`를 빌드 컨텍스트에서 제외할 수 있다
- [ ] `docker build --no-cache` 옵션의 역할과 언제 사용하는지 설명할 수 있다
- [ ] BuildKit의 `--mount=type=cache` 옵션이 일반 레이어 캐시와 어떻게 다른지 설명할 수 있다

### IV-1-3. 멀티 스테이지 빌드

- **난이도**: ★★★
- **선수 지식**: IV-1-2
- **학습 목표**: 이 Section을 마치면 멀티 스테이지 빌드로 프로덕션 이미지 크기를 줄일 수 있다.
- **설명**:
  빌드 도구(컴파일러, 테스트 패키지)는 최종 이미지에 포함될 필요가 없다. 멀티 스테이지 빌드는 하나의 Dockerfile 안에 여러 `FROM` 구문을 써서 "빌드 스테이지"와 "실행 스테이지"를 분리한다. 빌드 스테이지에서 필요한 파일만 만들고, 실행 스테이지에서 그 파일만 복사한다. Go나 Java 애플리케이션에서 이미지 크기를 수백 MB에서 수십 MB로 줄이는 데 자주 쓰인다.
- **핵심 키워드**: 멀티 스테이지 빌드(Multi-stage Build), `FROM ... AS`, `COPY --from=`, 이미지 경량화
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-1-1

#### 본문

##### 멀티 스테이지 빌드가 필요한 이유

IV-1-2에서 레이어 캐시를 최적화하는 방법을 배웠다. 그런데 캐시를 아무리 잘 써도 해결되지 않는 문제가 있다. 바로 **빌드 도구가 최종 이미지에 남는다는 것**이다.

Python 패키지를 컴파일하려면 `gcc`, `make`, 헤더 파일이 필요하다. Go 프로그램을 빌드하려면 Go 컴파일러가 필요하다. Node.js 앱을 번들링하려면 `webpack`, `typescript`, 수백 MB의 `node_modules`가 필요하다. 그런데 이 도구들은 **빌드가 끝나면 실행 시에는 전혀 필요 없다**. 최종 이미지에는 실행 파일(또는 컴파일된 바이너리, 번들된 JS 파일)만 있으면 된다.

단일 스테이지 빌드에서는 이 모든 도구가 최종 이미지에 함께 포함된다.

| 구분 | 단일 스테이지 | 멀티 스테이지 |
|:--|:--|:--|
| 이미지 크기 | 빌드 도구 포함 (수백 MB~GB) | 실행에 필요한 파일만 포함 (수십~수백 MB) |
| 공격 표면 | 컴파일러·패키지 관리자 포함 | 최소화 |
| Dockerfile 파일 수 | 1개 | 1개 (스테이지가 여러 개지만 파일은 하나) |
| 복잡도 | 낮음 | 약간 높음 |
| 실무 사용 | 개발·실험 목적 | 프로덕션 이미지 표준 |

멀티 스테이지 빌드는 하나의 Dockerfile 안에 여러 `FROM` 구문을 두는 방식이다. 각 `FROM` 이후의 명령어들이 하나의 스테이지를 구성한다. 이전 스테이지에서 만든 파일만 선택적으로 가져올 수 있다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 이사할 때 짐 정리와 같다. 새집으로 이사할 때 공구함(망치, 드라이버, 전기톱)을 전부 들고 가지는 않는다. 가구를 조립하고 나면 공구는 창고에 두고, 완성된 가구만 새집으로 옮긴다. 멀티 스테이지 빌드도 마찬가지다. 첫 번째 스테이지(빌드 스테이지)에서 컴파일러와 도구로 실행 파일을 만들고, 두 번째 스테이지(실행 스테이지)에서는 완성된 파일만 깔끔하게 가져온다. 공구(빌드 도구)는 이미지에 남지 않는다.
> - **체감 예시**: Python 앱의 단일 스테이지 이미지가 `python:3.11` 기반이면 약 900MB다. 멀티 스테이지로 `python:3.11-slim` 기반 실행 스테이지를 쓰면 100~200MB대로 줄어든다. Go 앱은 더 극적이다. 빌드 스테이지는 수백 MB지만, 컴파일된 바이너리 하나만 `scratch` 이미지에 넣으면 10MB 미만이 된다.
> - **주의**: 멀티 스테이지라고 해서 Dockerfile을 여러 파일로 나누는 것이 아니다. 하나의 Dockerfile에 `FROM`이 여러 번 등장하는 것이다.

##### 멀티 스테이지 Dockerfile 작성법

실제 예제(`examples/iv-1-3-multistage-build/`)의 Dockerfile을 살펴본다.

**비교용: 단일 스테이지 (`Dockerfile.single`)**

```dockerfile
# 단일 스테이지 빌드: python:3.11 (full 이미지)
FROM python:3.11

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

`python:3.11` 풀 이미지는 gcc를 비롯한 컴파일 도구가 포함되어 있다. 결과 이미지가 불필요하게 크다.

**멀티 스테이지 (`Dockerfile`)**

```dockerfile
# --- Stage 1: 빌드 (의존성 설치) ---
FROM python:3.11 AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: 실행 (slim 이미지) ---
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Stage 1에서 설치한 패키지만 복사
COPY --from=builder /install /usr/local
COPY app/ .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

핵심 문법을 하나씩 살펴본다.

**`FROM python:3.11 AS builder`**

`AS builder`는 이 스테이지에 이름을 붙이는 것이다. 이름을 붙이지 않으면 0, 1, 2 같은 숫자 인덱스로 참조해야 하는데, 이름을 쓰면 가독성이 높아지고 나중에 스테이지를 추가해도 인덱스가 어긋나지 않는다.

**`pip install --prefix=/install`**

`--prefix` 옵션은 패키지를 지정한 디렉토리(`/install`) 아래에 설치하라는 뜻이다. 시스템 전역 경로(`/usr/local`)가 아닌 별도 위치에 모아두면, 다음 스테이지로 한 번에 복사하기 편하다.

**`COPY --from=builder /install /usr/local`**

`COPY --from=<스테이지이름>` 은 다른 스테이지에서 파일을 가져오는 명령이다. `builder` 스테이지에서 `/install` 디렉토리(설치된 패키지들)를 현재 스테이지의 `/usr/local`로 복사한다. `builder` 스테이지 전체가 복사되는 것이 아니라, 지정한 경로의 파일만 가져온다.

##### COPY --from 문법 상세

`COPY --from` 은 멀티 스테이지 빌드의 핵심 명령어다. 사용 방법은 세 가지다.

```dockerfile
# 1. 스테이지 이름으로 참조 (권장)
COPY --from=builder /app/dist ./dist

# 2. 스테이지 인덱스로 참조 (0부터 시작)
COPY --from=0 /app/dist ./dist

# 3. 외부 이미지에서 파일 가져오기
COPY --from=nginx:1.25-alpine /etc/nginx/nginx.conf ./nginx.conf
```

세 번째 사용법은 외부 이미지에서 직접 파일을 가져오는 것이다. 예를 들어 공식 Nginx 이미지의 기본 설정 파일을 그대로 가져와 시작점으로 쓸 수 있다. 이 경우 그 이미지를 `docker pull`하지 않아도 빌드 시 자동으로 가져온다.

복사 경로는 소스 스테이지의 파일시스템 기준 절대 경로를 사용한다. 소스 경로가 디렉토리면 디렉토리 내용 전체를 대상으로 복사한다.

```dockerfile
# 디렉토리 전체 복사
COPY --from=builder /app/dist /app/dist

# 특정 파일만 복사
COPY --from=builder /app/dist/main /usr/local/bin/main
```

> **[주니어 렌즈 ★★☆]**
> - **`--prefix` 옵션의 역할**: `pip install --prefix=/install`은 패키지를 `/install/lib/python3.11/site-packages/`에, 실행 파일을 `/install/bin/`에 설치한다. 이 디렉토리를 다음 스테이지의 `/usr/local`에 복사하면 Python이 표준 경로에서 패키지를 찾을 수 있다. `--prefix` 없이 전역 설치하면 `/usr/local` 전체를 복사해야 하는데, 그러면 빌드 도구까지 딸려올 수 있다.
> - **스테이지 이름 vs 인덱스**: 인덱스는 Dockerfile을 수정할 때 취약하다. 스테이지 순서가 바뀌거나 스테이지가 추가되면 인덱스도 바뀐다. `AS` 이름을 쓰면 순서가 바뀌어도 안전하다. 팀 프로젝트에서 스테이지 이름을 `builder`, `tester`, `runner`처럼 역할 중심으로 짓는 것이 관행이다.
> - **`.dockerignore`와 멀티 스테이지**: `.dockerignore`는 멀티 스테이지에서도 그대로 적용된다. 첫 번째 스테이지의 `COPY` 명령이 빌드 컨텍스트에서 파일을 가져오기 때문이다. `__pycache__`, `.git`, `.env`, `tests/` 같은 디렉토리는 빌드 스테이지에도 불필요하므로 제외한다.
> - **특정 스테이지만 빌드하기**: `docker build --target builder .` 처럼 `--target` 옵션을 쓰면 지정한 스테이지까지만 빌드하고 멈춘다. 의존성 설치 레이어만 따로 캐싱하거나, 빌드 환경을 디버깅할 때 유용하다.

##### 빌드 결과 크기 비교

빌드 후 두 이미지의 크기를 실제로 비교해볼 수 있다.

```bash
# 단일 스테이지 빌드
docker build -f Dockerfile.single -t app-single .

# 멀티 스테이지 빌드
docker build -f Dockerfile -t app-multi .

# 크기 비교
docker images | grep app-
```

```
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
app-multi     latest    a1b2c3d4e5f6   10 seconds ago  178MB
app-single    latest    f6e5d4c3b2a1   30 seconds ago  1.01GB
```

같은 앱이지만 이미지 크기가 5배 이상 차이 난다. 프로덕션 환경에서 이미지가 작을수록 레지스트리 스토리지 비용, 컨테이너 시작 시간, 네트워크 전송 시간 모두 줄어든다.

> **[실무자 렌즈 ★★★]**
> - **distroless와 scratch**: `python:3.11-slim`에도 여전히 bash, apt, 불필요한 시스템 도구가 포함된다. Google의 `distroless` 이미지(`gcr.io/distroless/python3`)는 Python 런타임만 있고 쉘이나 패키지 관리자가 없다. `scratch`는 완전히 빈 이미지로 Go, Rust처럼 정적 링크된 바이너리를 실행할 때 쓴다. 공격자가 컨테이너에 침투해도 쉘이 없어 명령어를 실행하기 어렵다. 단, 디버깅이 어려워지므로 디버그용 이미지(`distroless:debug`, busybox 포함)를 별도로 준비한다.
> - **CI/CD에서 `--cache-from` 조합**: CI 환경은 매번 새 환경에서 실행된다. 멀티 스테이지 빌드에서 `builder` 스테이지는 보통 크고 느리다. `--cache-from`으로 이전 빌드의 `builder` 스테이지를 레지스트리에서 불러오면 의존성 설치 단계를 건너뛸 수 있다. `docker buildx build --cache-from type=registry,ref=ghcr.io/org/app:builder-cache --target builder`처럼 특정 스테이지 캐시를 레지스트리에 저장·불러오는 패턴이 실무에서 자주 쓰인다.
> - **멀티 플랫폼 빌드**: `docker buildx build --platform linux/amd64,linux/arm64 .`으로 x86과 ARM 아키텍처용 이미지를 동시에 빌드할 수 있다. M1/M2 Mac에서 개발하고 amd64 서버에 배포할 때 발생하는 아키텍처 불일치 문제를 빌드 단계에서 해결한다. GitHub Actions의 `docker/build-push-action`은 QEMU 에뮬레이션 없이 BuildKit의 멀티플랫폼 빌드를 지원한다.
> - **스테이지 간 ARG 전달**: `ARG`는 스테이지마다 재선언해야 한다. 전역 `ARG`(첫 번째 `FROM` 전)는 모든 스테이지에서 `ARG`로 재선언 없이 쓸 수 없다. 스테이지 안에서 `ARG VERSION`을 선언한 다음 `ENV APP_VERSION=$VERSION`처럼 환경변수로 굳혀야 다음 명령어에서 값이 유지된다.

##### 예제 실습

`examples/iv-1-3-multistage-build/` 예제에서 직접 비교해볼 수 있다.

```bash
cd examples/iv-1-3-multistage-build

# 두 이미지 모두 빌드
docker build -f Dockerfile.single -t app-single .
docker build -f Dockerfile -t app-multi .

# 크기 비교
docker images | grep "app-"

# 멀티 스테이지 이미지 실행
docker run --rm -p 8000:8000 app-multi
```

자세한 실습 절차와 각 단계 설명은 [`examples/iv-1-3-multistage-build/README.md`](examples/iv-1-3-multistage-build/README.md)를 참고한다.

##### 체크포인트

- [ ] 멀티 스테이지 빌드가 필요한 이유를 "빌드 도구와 실행 파일의 분리" 관점에서 설명할 수 있다
- [ ] `FROM ... AS <이름>` 문법으로 스테이지에 이름을 붙이고, `COPY --from=<이름>`으로 파일을 가져오는 Dockerfile을 직접 작성할 수 있다
- [ ] `pip install --prefix=/install` 옵션이 없는 경우와 있는 경우의 차이를 설명할 수 있다
- [ ] `docker build --target <스테이지이름>`으로 특정 스테이지까지만 빌드하는 방법과 그 활용 시나리오를 설명할 수 있다
- [ ] 단일 스테이지와 멀티 스테이지 이미지를 빌드하고 `docker images`로 크기 차이를 확인할 수 있다

---

## Part V. 네트워크·볼륨·Compose

### V-1-1. 컨테이너 네트워크 — bridge / host / none

- **난이도**: ★★★
- **선수 지식**: IV-1-3
- **학습 목표**: 이 Section을 마치면 bridge / host / none 드라이버의 차이를 설명하고 용도에 맞게 선택할 수 있다.
- **설명**:
  Docker 컨테이너는 기본적으로 격리된 네트워크를 가진다. bridge(기본값) 드라이버는 가상 스위치를 만들어 컨테이너끼리 통신하게 하고, 호스트와는 포트 매핑(-p)으로 연결한다. host 드라이버는 컨테이너가 호스트 네트워크를 그대로 사용한다(포트 매핑 불필요, 격리 없음). none은 네트워크를 완전히 차단한다. 실무에서 여러 컨테이너가 통신해야 할 때는 사용자 정의 bridge 네트워크를 만들어 컨테이너 이름으로 서로를 찾을 수 있게 한다.
- **핵심 키워드**: bridge 네트워크, host 네트워크, `docker network create`, 컨테이너 DNS
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-1-2

#### 본문

##### Docker 네트워크가 필요한 이유

컨테이너는 기본적으로 격리된 프로세스다. 그런데 실전 앱은 웹 서버, DB, 캐시처럼 여러 컨테이너가 함께 동작한다. 이때 컨테이너끼리 어떻게 통신하게 만들 것인지를 결정하는 것이 **Docker 네트워크**다.

Docker는 설치 시 `docker0`이라는 기본 가상 네트워크 인터페이스를 호스트에 만든다. 컨테이너를 실행하면 이 인터페이스에 연결되어 서로 통신할 수 있는 격리된 환경이 생긴다. 네트워크 드라이버를 어떻게 선택하느냐에 따라 격리 수준, 포트 매핑 필요 여부, 컨테이너 간 통신 방식이 달라진다. 잘못 선택하면 통신이 안 되거나, 반대로 격리되어야 할 서비스가 의도치 않게 노출되는 문제가 생긴다.

네트워크를 직접 조회하면 Docker가 관리하는 네트워크 목록을 확인할 수 있다.

```bash
docker network ls
```

```
NETWORK ID     NAME      DRIVER    SCOPE
a1b2c3d4e5f6   bridge    bridge    local
b2c3d4e5f6a1   host      host      local
c3d4e5f6a1b2   none      null      local
```

Docker를 설치하면 위 세 가지가 기본으로 만들어진다.

##### 3가지 네트워크 드라이버 한눈에

| 드라이버 | 특징 | 포트 매핑 | 대표 용도 |
|:--|:--|:--|:--|
| **bridge** (기본값) | 가상 스위치 생성. 컨테이너끼리 통신 가능 | 필요 (`-p`) | 로컬 개발, 단일 호스트 다중 컨테이너 |
| **host** | 호스트 네트워크 그대로 사용. 격리 없음 | 불필요 | 성능 최우선, 네트워크 도구 |
| **none** | 네트워크 완전 차단 | 없음 | 배치 작업, 보안 격리 |

기본 bridge 네트워크(`docker0`)와 사용자 정의 bridge 네트워크는 동작이 다르다. 기본 bridge는 컨테이너 이름으로 통신이 안 되고 IP로만 가능하다. **사용자 정의 bridge**는 컨테이너 이름을 자동으로 DNS로 등록하므로 이름으로 통신할 수 있다. Compose를 쓰면 사용자 정의 bridge가 자동으로 생성된다.

##### bridge 네트워크 상세: 포트 노출 vs expose

bridge 네트워크에서 외부(호스트)와 연결하는 방법은 두 가지다. 이 둘은 용도가 전혀 다르다.

**`-p`(publish) — 호스트와 컨테이너 포트를 연결**

```bash
# 호스트 8080 포트 → 컨테이너 80 포트 연결
docker run -p 8080:80 nginx
```

`-p 호스트포트:컨테이너포트` 형식이다. 이 옵션을 써야 **호스트 밖(브라우저, 다른 머신)**에서 컨테이너에 접근할 수 있다.

**`--expose` — 같은 네트워크 내 컨테이너에게만 알림**

```bash
# 8000 포트를 같은 네트워크 컨테이너에만 공개
docker run --expose 8000 myapp
```

`--expose`는 문서화 역할에 가깝다. 실제로 방화벽을 열거나 포트 매핑을 하지 않는다. 같은 사용자 정의 네트워크 안에서 컨테이너끼리 통신할 때는 `-p` 없이 컨테이너 포트를 그대로 쓸 수 있다. Compose의 `expose:` 키가 이 역할을 한다.

실전 예시(vi-1-1 예제): `api` 서비스는 `-p` 없이 `expose: "8000"`만 선언한다. Nginx 컨테이너가 같은 네트워크 안에서 `api:8000`으로 직접 접근하고, 외부에는 Nginx가 80 포트를 통해서만 노출한다.

##### 사용자 정의 bridge와 컨테이너 DNS

사용자 정의 bridge 네트워크에 연결된 컨테이너끼리는 **서비스 이름**으로 서로를 찾을 수 있다. Docker가 내부 DNS를 운영하기 때문이다. 예를 들어 `db`라는 이름의 컨테이너에 접속하려면 호스트 이름으로 `db`를 그대로 쓸 수 있다.

네트워크를 직접 만들고 컨테이너를 연결하는 방법:

```bash
# 사용자 정의 bridge 네트워크 생성
docker network create mynet

# 컨테이너 실행 시 네트워크 지정
docker run -d --name db --network mynet postgres:16-alpine
docker run -d --name web --network mynet myapp:latest

# web 컨테이너 안에서 db를 이름으로 접속 가능
docker exec -it web ping db
```

Compose에서는 별도 설정 없이도 서비스 이름이 DNS로 자동 등록된다. `db` 서비스에 `postgresql://db:5432/demo`처럼 서비스 이름을 그대로 호스트명으로 쓸 수 있다.

네트워크 상세 정보를 조회하면 연결된 컨테이너와 IP를 확인할 수 있다.

```bash
docker network inspect mynet
```

```json
[
  {
    "Name": "mynet",
    "Driver": "bridge",
    "Subnet": "172.20.0.0/16",
    "Containers": {
      "abc123...": {
        "Name": "db",
        "IPv4Address": "172.20.0.2/16"
      },
      "def456...": {
        "Name": "web",
        "IPv4Address": "172.20.0.3/16"
      }
    }
  }
]
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: Docker 네트워크는 **사무실 내선 전화망**과 같다. bridge는 같은 사무실 안에서 내선 번호(컨테이너 이름)로 전화를 걸 수 있게 해준다. host는 사무실 전화기가 아니라 본인 휴대폰을 직접 쓰는 것과 같다. none은 전화선 자체를 뽑은 상태다.
> - **체감 예시**: 웹 서버 컨테이너가 DB 컨테이너에 접속할 때 IP 주소 대신 `db`라는 이름만 쓸 수 있는 것이, 동료에게 전화할 때 전화번호 대신 이름으로 내선을 찾는 것과 같다. 이름이 바뀌지 않는 한 IP가 바뀌어도 통신이 된다.
> - **주의**: 기본 bridge 네트워크에서는 컨테이너 이름으로 통신이 안 된다. `docker network create`로 직접 만든 사용자 정의 bridge 네트워크를 쓰거나 Compose를 사용해야 이름 기반 통신이 된다.

##### host와 none 드라이버: 언제 쓰는가

**host 드라이버**는 컨테이너가 호스트 네트워크 스택을 그대로 쓴다. `-p`로 포트를 매핑할 필요가 없고, 네트워크 오버헤드가 없어 성능이 가장 좋다. 단, 컨테이너가 호스트의 모든 포트에 직접 바인딩되므로 격리가 전혀 없다. **Linux에서만 완전히 동작하며, Docker Desktop(Mac/Windows)에서는 지원이 제한된다.**

```bash
# host 드라이버 사용 (Linux 전용)
docker run --network host nginx
# 이 경우 -p 80:80 없이도 호스트 80포트로 접근 가능
```

**none 드라이버**는 컨테이너에 루프백(`lo`) 인터페이스만 남기고 외부 네트워크를 완전히 차단한다. 외부와 통신이 필요 없는 배치 작업이나, 보안상 완전 격리가 필요한 경우에 쓴다.

```bash
# 네트워크 완전 차단
docker run --network none alpine sh -c "ping -c1 8.8.8.8 || echo 'no network'"
# 출력: no network
```

##### 네트워크 관리 명령 정리

```bash
# 네트워크 목록 확인
docker network ls

# 사용자 정의 bridge 네트워크 생성
docker network create mynet

# 네트워크 상세 정보 조회 (연결된 컨테이너, IP, 서브넷 등)
docker network inspect mynet

# 실행 중인 컨테이너를 기존 네트워크에 추가 연결
docker network connect mynet my-container

# 컨테이너를 네트워크에서 분리
docker network disconnect mynet my-container

# 사용하지 않는 네트워크 삭제
docker network rm mynet

# 컨테이너가 없는 미사용 네트워크 일괄 정리
docker network prune
```

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker network inspect <이름>` — 네트워크에 연결된 컨테이너 목록과 각 IP, 서브넷, 게이트웨이를 JSON 형태로 출력한다. 통신이 안 될 때 두 컨테이너가 **같은 네트워크**에 있는지 이 명령으로 먼저 확인한다.
> - **흔한 함정**: 서로 다른 Compose 프로젝트의 컨테이너끼리 통신하려 할 때 "이름으로 안 잡힌다"는 문제가 자주 나온다. 같은 사용자 정의 네트워크에 연결되어 있어야만 이름 DNS가 동작한다. `docker network connect <네트워크명> <컨테이너명>`으로 기존 컨테이너를 네트워크에 추가할 수 있다.
> - **체크리스트**:
>   - [ ] `docker network ls`로 Compose가 만든 네트워크 이름을 확인했다
>   - [ ] 같은 네트워크 안의 컨테이너끼리 이름으로 ping이 되는지 확인했다
>   - [ ] `docker network inspect <이름>`으로 두 컨테이너가 같은 네트워크에 있는지 확인했다
>   - [ ] `-p`(외부 노출)와 `--expose`(내부 공개)의 차이를 설명할 수 있다

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: 동일 Compose 파일 안에서도 서비스를 `frontend` 네트워크와 `backend` 네트워크로 분리해야 한다. Nginx는 두 네트워크 모두 연결하고, api는 backend 네트워크에만, DB는 backend 네트워크에만 연결하면 DB가 외부에서 직접 접근되는 것을 막을 수 있다. `docker network inspect`로 각 서비스의 네트워크 귀속을 주기적으로 검증한다.
> - **대안 기술**: 멀티 호스트 환경(Docker Swarm)에서는 `overlay` 드라이버를 사용해 여러 노드에 분산된 컨테이너끼리 하나의 네트워크처럼 통신하게 한다. Kubernetes에서는 CNI(Container Network Interface) 플러그인이 이 역할을 담당한다. 단일 호스트 범위를 벗어나는 순간 bridge는 한계가 있다.
> - **관측**: 컨테이너 내부에서 `cat /etc/hosts`와 `cat /etc/resolv.conf`를 보면 Docker가 주입한 DNS 설정을 확인할 수 있다. `docker exec -it <컨테이너명> cat /etc/resolv.conf`로 `nameserver 127.0.0.11`(Docker 내장 DNS)이 등록되어 있는지 확인한다. nslookup이나 dig가 이미지에 포함된 경우 `docker exec -it web nslookup db`로 이름 해석이 되는지 직접 확인할 수 있다.

##### 체크포인트

- [ ] bridge / host / none 드라이버의 차이를 한 줄로 설명할 수 있다
- [ ] 기본 bridge 네트워크와 사용자 정의 bridge 네트워크가 다른 점을 말할 수 있다
- [ ] 사용자 정의 bridge 네트워크에서 컨테이너 이름으로 통신이 가능한 이유를 설명할 수 있다
- [ ] `-p`(포트 노출)와 `expose`(내부 공개)의 차이를 구분할 수 있다
- [ ] `docker network create` / `inspect` / `connect` 명령의 역할을 알고 사용할 수 있다

##### 예제로 직접 해보기

[examples/vi-1-1-fastapi-postgres-nginx/](../examples/vi-1-1-fastapi-postgres-nginx/) — FastAPI, PostgreSQL, Nginx 3개 서비스가 사용자 정의 네트워크로 연결된 실전 구성이다. `api` 서비스는 `-p` 없이 `expose`만 선언하고, Nginx만 80 포트를 외부에 공개하는 네트워크 분리 패턴을 직접 확인할 수 있다.

### V-1-2. 볼륨과 바인드 마운트

- **난이도**: ★★★
- **선수 지식**: V-1-1
- **학습 목표**: 이 Section을 마치면 데이터가 컨테이너 재시작 후에도 보존되도록 볼륨을 설정할 수 있다.
- **설명**:
  컨테이너가 종료되면 내부 파일시스템도 사라진다. 데이터를 유지하려면 외부 저장소에 마운트해야 한다. 볼륨(Volume)은 Docker가 관리하는 저장 공간(`docker volume create`)으로, 컨테이너끼리 공유하거나 백업하기 쉽다. 바인드 마운트(Bind Mount)는 호스트 디렉토리를 직접 컨테이너 안에 연결한다(`-v /호스트/경로:/컨테이너/경로`). 개발 중에는 소스 코드를 바인드 마운트로 연결해 코드 변경이 즉시 반영되게 하는 패턴이 자주 쓰인다.
- **핵심 키워드**: 볼륨(Volume), 바인드 마운트(Bind Mount), `-v`, `docker volume create`, 데이터 영속성
- **시각화 연결**: [visualizations/v-1-2_volumes_vs_bindmount.html](../visualizations/v-1-2_volumes_vs_bindmount.html)
- **다음 섹션**: V-1-3

#### 본문

##### 왜 이 주제가 중요한가

컨테이너는 실행 중에는 자체 파일시스템을 갖지만, `docker compose down`으로 컨테이너를 제거하는 순간 그 안에 쌓인 데이터는 모두 사라진다. 데이터베이스에 아무리 많은 행을 넣어도, 로그 파일을 아무리 열심히 써도, 컨테이너가 없어지면 함께 없어진다. 이 문제를 해결하는 핵심이 **마운트**다. 마운트는 컨테이너 바깥의 저장 공간을 컨테이너 내부 경로에 연결하는 것으로, 컨테이너가 사라져도 데이터는 살아남는다. Docker는 세 가지 마운트 방식을 제공하며, 각각 용도와 특성이 다르다. 개발 환경 구성부터 프로덕션 데이터 관리까지, 올바른 마운트 방식을 선택하는 능력은 실무에서 반드시 필요하다.

##### 3종 마운트 타입 한눈에

| 마운트 | 저장 위치 | 수명 | 대표 용도 |
|:--|:--|:--|:--|
| **named volume** | Docker 관리 영역 (`/var/lib/docker/volumes/`) | `docker compose down -v` 전까지 유지 | DB 데이터, 영구 상태 |
| **bind mount** | 호스트 디렉터리 (개발자가 지정) | 호스트 파일이 남아 있는 한 유지 | 소스 코드 핫 리로드, 설정 파일 주입 |
| **tmpfs mount** | 호스트 메모리 (RAM) | 컨테이너 종료 즉시 소멸 | 비밀 토큰, 임시 캐시 |
| **마운트 없음** | 컨테이너 레이어 | 컨테이너 삭제 시 소멸 | 재현 가능한 빌드 아티팩트 |

---

##### 볼륨: 데이터를 컨테이너 밖에 맡기기

named volume(이하 볼륨)은 Docker가 직접 관리하는 저장 공간이다. `docker volume create pgdata` 명령으로 미리 만들 수 있고, Compose 파일에 `volumes:` 블록을 선언하면 첫 실행 시 자동으로 생성된다. 실제 데이터는 Docker 관리 영역(`/var/lib/docker/volumes/pgdata/_data`)에 저장되므로 개발자가 직접 경로를 알 필요가 없다. 컨테이너를 교체하거나 업그레이드해도 볼륨만 다시 연결하면 데이터가 그대로 살아 있다.

Compose에서 볼륨을 사용하는 핵심 구조는 다음과 같다.

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

`docker compose down`을 해도 `pgdata` 볼륨은 남아 있다. 볼륨까지 지우려면 `docker compose down -v`를 써야 한다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: named volume은 **외장 하드**와 같다. 본체(컨테이너)를 바꿔도 외장 하드를 꽂으면 데이터가 그대로 나온다. 컨테이너가 망가졌다고 해서 외장 하드까지 망가지진 않는다.
> - **체감 예시**: 노트북을 새로 사더라도 외장 하드를 연결하면 이전 사진과 문서가 모두 나오는 것과 같다.
> - **주의**: `docker compose down`과 `docker compose down -v`는 완전히 다르다. `-v`를 붙이면 볼륨이 삭제되어 DB 데이터도 함께 사라진다. 처음엔 이 차이를 모르고 데이터를 날리는 경우가 많다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose exec db psql -U app -d demo -c "SELECT * FROM items;"`
> - **흔한 함정**: `docker compose down -v`로 볼륨을 지운 뒤 데이터가 사라졌다며 버그라고 착각하는 경우. `-v` 플래그의 의미를 꼭 확인하자. 또한 볼륨 이름 `pgdata`는 Compose 파일의 `volumes:` 블록에 선언한 이름과 일치해야 한다.
> - **체크리스트**:
>   - [ ] `docker volume ls`로 볼륨이 생성되었는지 확인했다
>   - [ ] Compose `volumes:` 최상위 블록에 볼륨 이름이 선언되어 있다
>   - [ ] `docker compose down` 후 다시 `up -d`해도 데이터가 남아 있음을 확인했다
>   - [ ] `docker compose down -v` 후 데이터가 초기화되는 것을 확인했다
>   - [ ] 볼륨 내부 경로(`/var/lib/postgresql/data`)가 이미지 문서와 일치한다

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: 볼륨 데이터는 Docker 호스트에 종속된다. 호스트 장애 시 데이터 유실을 막으려면 정기 `pg_dump` 또는 볼륨 스냅샷(클라우드 EBS 스냅샷 등)을 자동화해야 한다. `docker run --rm -v pgdata:/data -v $(pwd):/backup alpine tar czf /backup/pgdata.tar.gz -C /data .` 패턴이 기본 백업 명령이다.
> - **대안 기술**: 멀티 호스트 환경에서는 볼륨이 특정 노드에 묶이는 문제가 생긴다. Docker Swarm에서는 NFS 볼륨 드라이버, Kubernetes에서는 PersistentVolumeClaim(PVC)으로 스토리지를 노드 독립적으로 관리한다.
> - **관측**: `docker system df -v`로 볼륨별 사용 용량을 확인할 수 있다. 장기 운영 시 불필요한 익명 볼륨이 쌓이면 `docker volume prune`으로 정리한다.

---

##### 바인드 마운트: 호스트 폴더를 컨테이너 안으로

바인드 마운트는 호스트의 특정 디렉터리를 컨테이너 내부 경로에 직접 연결한다. 컨테이너 안에서 해당 경로를 읽고 쓰면 호스트 파일도 실시간으로 바뀌고, 반대도 마찬가지다. 개발 환경에서 소스 코드를 바인드 마운트로 연결하면, 호스트 에디터에서 코드를 수정하는 즉시 컨테이너 안의 애플리케이션이 변경을 감지하여 자동으로 재시작된다. 이것이 **핫 리로드** 패턴이다.

Compose에서 바인드 마운트를 쓰는 예시:

```yaml
services:
  web:
    build: .
    volumes:
      - ./app:/app
    ports:
      - "8000:8000"
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

`./app`은 호스트의 상대 경로, `/app`은 컨테이너 내부 절대 경로다. `--reload` 플래그는 uvicorn이 파일 변경을 감지하면 자동 재시작하도록 한다.

핫 리로드 흐름을 확인하려면:

```bash
# 1. 서비스 시작
docker compose up -d

# 2. 초기 버전 확인
curl -s localhost:8000/version
# {"version":"v1"}

# 3. 호스트에서 파일 수정 (git bash / macOS / Linux)
sed -i 's/VERSION = "v1"/VERSION = "v2"/' app/main.py

# 4. 1~3초 후 재확인 (uvicorn이 "Reloading..." 로그를 출력한 뒤)
curl -s localhost:8000/version
# {"version":"v2"}
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: bind mount는 **창고 직결**이다. 컨테이너가 집이라면, 집 안에 문을 뚫어 바로 창고(호스트 폴더)로 통하게 만든 것이다. 집 안에서 물건을 꺼내면 창고에서 줄고, 창고에서 물건을 넣으면 집에서도 늘어난다.
> - **체감 예시**: 구글 드라이브 폴더를 바탕화면과 동기화하면 어느 쪽에서 파일을 바꿔도 양쪽이 같아지는 것과 비슷하다.
> - **주의**: 호스트 경로가 존재하지 않으면 Docker가 빈 디렉터리를 자동 생성한다. 파일 하나를 마운트하려면 파일이 먼저 호스트에 있어야 한다. 경로를 잘못 쓰면 컨테이너 안의 중요한 디렉터리가 빈 폴더로 덮어씌워질 수 있다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose up -d && curl -s localhost:8000/version`
> - **흔한 함정**: Windows 경로(`C:\Users\...`)를 Compose 파일에 그대로 쓰면 Linux 컨테이너에서 인식하지 못한다. 상대 경로(`./app`)를 쓰거나 Git Bash에서 슬래시 형식으로 변환해야 한다. 또한 `--reload` 없이 uvicorn을 실행하면 파일을 바꿔도 서버가 재시작되지 않는다.
> - **체크리스트**:
>   - [ ] Compose 파일에서 호스트 경로를 상대 경로(`./app`)로 표기했다
>   - [ ] 컨테이너 내부 경로는 절대 경로(`/app`)로 표기했다
>   - [ ] `--reload` 플래그가 실행 명령에 포함되어 있다
>   - [ ] 파일을 수정한 뒤 uvicorn 로그에 `Reloading...`이 출력되는지 확인했다
>   - [ ] `curl -s localhost:8000/version`으로 변경된 버전이 반환되는지 확인했다

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: bind mount는 **개발 전용**이다. 프로덕션 이미지에는 소스 코드를 `COPY`로 넣어야 한다. bind mount를 프로덕션에서 쓰면 호스트 파일 구조에 종속되어 이식성이 사라지고, 호스트 파일 권한 문제(UID 불일치)가 자주 발생한다.
> - **대안 기술**: 개발 편의성과 이미지 불변성을 동시에 챙기려면 `watch` 기능(Docker Compose v2.22+의 `develop.watch` 블록)을 고려할 수 있다. 변경 감지 정책을 파일 단위로 세밀하게 설정할 수 있다.
> - **관측**: 파일 변경이 컨테이너에 반영되지 않을 때는 `docker compose logs web`으로 uvicorn 로그를 확인하고, `Reloading...` → `Application startup complete.` 메시지가 나오는지 본다. 나오지 않는다면 `--reload` 플래그 누락 또는 볼륨 마운트 경로 오류를 먼저 의심한다.

---

##### tmpfs: 메모리에만 잠깐

tmpfs mount는 데이터를 디스크가 아닌 호스트 메모리(RAM)에 저장한다. 컨테이너가 종료되는 순간 메모리가 해제되므로 데이터도 완전히 사라진다. 디스크에 흔적이 남지 않기 때문에 비밀 토큰, 세션 키, 임시 캐시처럼 휘발성이어야 하는 데이터에 적합하다. 읽기·쓰기 속도가 디스크보다 빠른 것도 장점이다.

Compose에서 tmpfs를 지정하는 방법:

```yaml
services:
  app:
    image: myapp:latest
    tmpfs:
      - /tmp
      - /run/secrets
```

또는 `volumes` 구문으로도 쓸 수 있다:

```yaml
volumes:
  - type: tmpfs
    target: /tmp
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: tmpfs는 **화이트보드**다. 필요한 내용을 쓰고, 다 쓰면 지운다. 전원을 내리면(컨테이너를 종료하면) 화이트보드에 적힌 것은 모두 사라진다. 사진을 찍어두지 않으면 복구할 수 없다.
> - **체감 예시**: 회의 시간에만 쓰고 회의가 끝나면 지우는 화이트보드처럼, 컨테이너 실행 중에만 필요한 임시 데이터를 담는다.
> - **주의**: tmpfs 데이터는 컨테이너 재시작 시 무조건 사라진다. 재시작 후에도 필요한 데이터라면 named volume이나 외부 시크릿 관리 도구(Vault 등)를 써야 한다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker run --rm --tmpfs /tmp:rw,size=64m busybox df -h /tmp`
> - **흔한 함정**: tmpfs에 쓴 데이터가 컨테이너 재시작 후 사라진 것을 보고 "볼륨이 고장났다"고 착각하는 경우. tmpfs는 원래 휘발성이다. 또한 `size` 옵션을 지정하지 않으면 호스트 메모리를 무제한으로 쓸 수 있어 메모리 부족을 일으킬 수 있다.
> - **체크리스트**:
>   - [ ] tmpfs를 사용하는 이유가 "컨테이너 종료 후 데이터 삭제"임을 이해했다
>   - [ ] Compose `tmpfs:` 블록에 마운트 경로를 정확히 지정했다
>   - [ ] 메모리 사용량이 제한되어 있는지 `size` 옵션으로 확인했다
>   - [ ] 컨테이너 재시작 후 tmpfs 경로가 비어 있음을 확인했다

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: 민감한 자격증명(API 키, 인증서 등)은 tmpfs에 놓더라도 초기 주입 경로를 안전하게 관리해야 한다. Docker Secrets(Swarm) 또는 Kubernetes Secret을 tmpfs 기반 마운트로 제공하는 것이 현재 모범 사례다. 환경 변수로 직접 넘기는 방식은 `docker inspect`로 노출될 수 있어 피해야 한다.
> - **대안 기술**: HashiCorp Vault의 동적 시크릿 기능을 쓰면 애플리케이션이 필요할 때마다 단기 유효 자격증명을 발급받는다. 디스크·메모리 어디에도 장기 저장이 필요 없어진다.
> - **관측**: 컨테이너 내부에서 `df -h /tmp`로 tmpfs 마운트 용량과 사용량을 확인할 수 있다. `docker stats` 명령으로 컨테이너 메모리 사용량을 실시간 모니터링하여 tmpfs 오용으로 인한 메모리 급증을 감지한다.

---

##### 언제 무엇을 쓰는가 (의사결정 트리)

```
데이터를 컨테이너 재시작 후에도 보존해야 하는가?
│
├─ 아니오 → 컨테이너 종료 후 즉시 삭제되어야 하는 민감 데이터인가?
│            ├─ 예  → tmpfs mount  (예: 비밀 토큰, 세션 키)
│            └─ 아니오 → 마운트 없음  (예: 재현 가능한 빌드 결과물)
│
└─ 예 → 개발 중 코드 변경을 실시간 반영해야 하는가?
         ├─ 예  → bind mount  (예: 소스 코드 핫 리로드)
         └─ 아니오 → named volume  (예: DB 데이터, 업로드 파일)
```

**정리**: 운영 데이터 → named volume / 개발 편의 → bind mount / 민감·임시 → tmpfs

---

##### 체크포인트

- [ ] 3종 마운트(named volume, bind mount, tmpfs mount)의 차이를 한 줄로 설명할 수 있다
- [ ] Postgres 데이터를 영속화하는 `docker compose` v2 파일을 작성할 수 있다
- [ ] 개발 시 핫 리로드용 bind mount를 Compose 파일에 설정할 수 있다
- [ ] tmpfs가 적합한 경우를 1개 이상 말할 수 있다

##### 시각화로 보기

[볼륨 vs 바인드 마운트 시각화 (STEP 1~6 애니메이션)](../visualizations/v-1-2_volumes_vs_bindmount.html)

시각화는 총 6단계로 구성된다: STEP 1(3종 마운트 타입 소개) → STEP 2(컨테이너 실행 + 데이터 쓰기) → STEP 3(컨테이너 삭제) → STEP 4(새 컨테이너로 재기동) → STEP 5(데이터 생존 확인) → STEP 6(용도별 선택 가이드)

##### 예제로 직접 해보기

- [예제 1: Postgres 볼륨 영구화](../examples/v-1-2-postgres-volume/) — named volume으로 DB 데이터를 컨테이너 재시작 후에도 보존한다
- [예제 2: bind mount 핫 리로드](../examples/v-1-2-bind-mount-hot-reload/) — FastAPI 소스 코드를 bind mount로 연결해 저장 즉시 서버가 재시작된다

### V-1-3. Docker Compose 기초

- **난이도**: ★★★
- **선수 지식**: V-1-2
- **학습 목표**: 이 Section을 마치면 `docker-compose.yml`을 작성하고 `docker compose up`으로 다중 컨테이너를 실행할 수 있다.
- **설명**:
  실전 앱은 웹 서버, DB, 캐시 등 여러 컨테이너가 함께 돌아간다. 매번 `docker run` 명령을 여러 번 치는 건 번거롭고 실수하기 쉽다. Docker Compose는 `docker-compose.yml`(또는 `compose.yml`) 파일 하나에 모든 서비스, 네트워크, 볼륨을 선언적으로 정의한다. `docker compose up -d`로 모든 서비스를 한 번에 백그라운드에서 시작한다. `docker compose down`으로 모두 종료한다.
- **핵심 키워드**: Docker Compose, `docker-compose.yml`, `services`, `docker compose up`, `docker compose down`
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-1-4

#### 본문

##### Docker Compose가 필요한 이유

`docker run` 명령 하나로 컨테이너를 실행하는 것은 간단하다. 그런데 웹 서버, DB, 캐시처럼 세 개 이상의 컨테이너를 매번 손으로 실행하면 어떻게 될까? 각 명령에 네트워크 이름, 볼륨, 환경 변수, 포트를 빠짐없이 기억해야 한다. 한 번이라도 순서나 옵션을 잘못 치면 서비스가 올바르게 뜨지 않는다.

**Docker Compose**는 이 모든 설정을 `docker-compose.yml`(또는 `compose.yml`) 파일에 선언적으로 적어두고, `docker compose up` 명령 하나로 전체 스택을 재현 가능하게 실행한다. 팀원이 `git clone` 후 `docker compose up`만 치면 로컬 환경이 동일하게 실행된다.

Compose v2는 Docker CLI의 플러그인으로 통합되었다. `docker-compose`(하이픈) 명령은 v1 레거시다. 현재 표준은 `docker compose`(스페이스)다.

##### Compose 파일 버전과 v2 사양

과거 Compose 파일 상단에는 `version: "3.9"` 같은 버전 선언이 있었다. Docker Compose v2(현재 표준)에서는 이 `version` 필드가 필수가 아니다. 생략해도 동작하며, 최신 기능을 모두 사용할 수 있다.

```yaml
# v2 사양 — version 필드 생략이 표준
services:
  web:
    image: nginx:alpine
```

파일 이름은 `docker-compose.yml`과 `compose.yml` 둘 다 인식한다. 신규 프로젝트에서는 `compose.yml`이 권장 표기다.

##### docker-compose.yml 기본 구조

Compose 파일의 최상위 키는 세 가지다: `services`, `volumes`, `networks`.

```yaml
services:       # 실행할 컨테이너 목록
  web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./app:/app
    environment:
      - APP_ENV=development
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    env_file: .env
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:        # named volume(이하 볼륨) 선언
  pgdata:

networks:       # 사용자 정의 네트워크 선언 (생략 시 기본 bridge 자동 생성)
```

**services**

컨테이너 하나가 서비스 하나다. `image`로 기존 이미지를 쓰거나 `build`로 Dockerfile을 빌드할 수 있다. 서비스 이름이 컨테이너 DNS 호스트명이 되어 같은 네트워크 안에서 이름으로 통신할 수 있다.

주요 서비스 속성:

| 속성 | 설명 | 예시 |
|:--|:--|:--|
| `image` | 사용할 이미지 | `postgres:16-alpine` |
| `build` | Dockerfile 위치 | `.` 또는 `./api` |
| `ports` | 호스트:컨테이너 포트 매핑 | `"8000:8000"` |
| `expose` | 컨테이너 내부 포트 공개 (외부 미노출) | `"8000"` |
| `volumes` | 마운트 경로 지정 | `pgdata:/var/lib/postgresql/data` |
| `environment` | 환경 변수 직접 지정 | `APP_ENV=development` |
| `env_file` | 환경 변수 파일 지정 | `.env` |
| `depends_on` | 서비스 시작 순서 의존성 | `db` |
| `healthcheck` | 서비스 준비 여부 확인 | `pg_isready` 명령 등 |

**volumes**

최상위에 선언한 named volume(이하 볼륨)이 여기 나열된다. 서비스 안의 `volumes:`는 이 볼륨을 어느 경로에 마운트할지 지정한다. 선언만 해두면 `docker compose up` 시 Docker가 자동으로 생성한다.

**networks**

생략하면 Compose가 프로젝트 이름 기반의 기본 bridge 네트워크를 자동으로 만든다. 보안 분리가 필요하면 명시적으로 여러 네트워크를 선언하고 서비스별로 귀속을 나눈다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: `docker-compose.yml`은 **요리 레시피 카드**와 같다. 재료(이미지), 조리 순서(depends_on), 보관 용기(volumes), 그릇 크기(포트)를 한 장에 적어두면 누구든 동일한 결과를 만들 수 있다. `docker compose up`은 "이 레시피대로 요리 시작"이다.
> - **체감 예시**: 팀원이 `git clone` 후 `docker compose up`만 치면 로컬 환경이 동일하게 실행되는 것이, 레시피를 받은 사람 누구나 같은 음식을 만들 수 있는 것과 같다. 레시피(compose.yml)가 버전 관리되므로 "내 환경에서만 된다"는 상황을 막을 수 있다.
> - **주의**: `docker-compose`(하이픈)는 v1 레거시 명령이다. 현재 표준은 `docker compose`(스페이스)다. Docker Desktop을 최신으로 유지하면 `docker compose` 명령을 바로 쓸 수 있다.

##### 핵심 명령: up / down / logs / exec / ps

Compose를 다루는 데 가장 자주 쓰는 명령 다섯 가지를 익히면 충분하다.

| 명령 | 동작 | 주요 옵션 |
|:--|:--|:--|
| `docker compose up` | 서비스 전체 시작 | `-d` (백그라운드), `--build` (이미지 재빌드) |
| `docker compose down` | 서비스 전체 종료 및 컨테이너 제거 | `-v` (볼륨까지 삭제) |
| `docker compose logs` | 서비스 로그 출력 | `-f` (실시간 스트리밍), `[서비스명]` (특정 서비스) |
| `docker compose exec` | 실행 중인 컨테이너 안에서 명령 실행 | `[서비스명] [명령]` |
| `docker compose ps` | 서비스 상태·포트 확인 | (없음) |

```bash
# 백그라운드로 전체 서비스 시작
docker compose up -d

# 이미지를 새로 빌드하면서 시작 (코드 변경 후)
docker compose up -d --build

# 모든 서비스 로그 실시간 출력
docker compose logs -f

# 특정 서비스(web)만 로그 실시간 출력
docker compose logs -f web

# db 서비스 컨테이너 안에서 psql 실행
docker compose exec db psql -U app -d demo

# 서비스 상태와 포트 매핑 확인
docker compose ps

# 서비스 종료 (볼륨은 유지)
docker compose down

# 서비스 종료 + 볼륨까지 삭제 (데이터 초기화)
docker compose down -v
```

`docker compose ps`의 출력 예시:

```
NAME       IMAGE              COMMAND                  SERVICE   STATUS    PORTS
demo-db-1  postgres:16-alpine "docker-entrypoint.s…"  db        running   5432/tcp
demo-web-1 myapp:latest       "uvicorn main:app --…"  web       running   0.0.0.0:8000->8000/tcp
```

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose ps` — 현재 Compose 프로젝트의 서비스 상태(running/exited)와 포트 매핑을 한눈에 확인한다. `STATUS`가 `exited`로 표시되면 해당 서비스 로그를 `docker compose logs [서비스명]`으로 즉시 확인한다.
> - **흔한 함정**: `depends_on`은 컨테이너 **시작 순서**만 보장하고, DB가 실제로 쿼리를 받을 **준비(ready)**가 됐는지는 보장하지 않는다. `db` 컨테이너가 초기화 중인데 `web`이 접속을 시도하다 실패하는 것이 흔한 에러다. 완전히 해결하려면 `depends_on`에 `condition: service_healthy`와 `healthcheck`를 함께 써야 한다.
> - **체크리스트**:
>   - [ ] `docker compose ps`로 모든 서비스가 `running` 상태인지 확인했다
>   - [ ] `docker compose logs -f`로 실행 중 에러가 없는지 확인했다
>   - [ ] `docker compose down` 후 다시 `up -d`해도 정상 동작하는지 확인했다
>   - [ ] `docker compose exec`로 컨테이너 안에서 직접 명령을 실행해봤다

##### 환경 변수와 .env 파일

민감한 값(비밀번호, API 키)은 Compose 파일에 직접 적지 않는다. `.env` 파일에 넣고 `.gitignore`에 추가하는 것이 표준이다. Compose는 자동으로 `.env` 파일을 읽어 `${변수명}` 형태로 치환한다.

```bash
# .env 파일 예시 (crossref.md 표준 값)
POSTGRES_USER=app
POSTGRES_PASSWORD=secret_change_me
POSTGRES_DB=demo
```

```yaml
# compose.yml에서 참조 방법 1: env_file로 파일 전체 주입
services:
  db:
    image: postgres:16-alpine
    env_file: .env

# compose.yml에서 참조 방법 2: environment에서 ${} 치환
services:
  web:
    image: myapp:latest
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```

`env_file: .env`로 지정하면 해당 파일의 모든 변수가 컨테이너 환경 변수로 주입된다. `environment`의 `${변수명}` 치환은 Compose가 호스트 `.env`에서 값을 읽어 대입한다.

`.env` 파일은 반드시 `.gitignore`에 포함한다. 대신 `.env.example`을 커밋해 팀원이 어떤 변수를 채워야 하는지 알 수 있게 한다.

##### depends_on과 healthcheck: 서비스 준비 완료 대기

DB처럼 초기화 시간이 필요한 서비스가 완전히 준비된 후 다음 서비스가 시작되어야 할 때 `healthcheck`와 `condition: service_healthy`를 쓴다.

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: ./api
    depends_on:
      db:
        condition: service_healthy   # db healthcheck 통과 후 api 시작
```

`healthcheck.test`의 `$$`는 YAML 안에서 `$`를 이스케이프하는 방법이다. `pg_isready` 명령이 성공 응답을 반환하면 `service_healthy` 조건이 충족된다.

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: Compose 파일을 두 개로 분리하는 패턴이 표준이다. `compose.yml`에 공통 설정을 두고, `compose.override.yml`에 개발 전용 설정(bind mount, 디버그 포트 등)을 분리한다. `docker compose up`은 두 파일을 자동으로 병합하고, 프로덕션에서는 `docker compose -f compose.yml -f compose.prod.yml up -d`로 명시적으로 파일을 선택한다.
> - **대안 기술**: 복잡한 멀티 서비스 앱이 여러 환경(개발/스테이징/프로덕션)에 배포되어야 한다면 Helm(Kubernetes 패키지 관리자)이나 Pulumi 같은 IaC 도구를 검토할 시점이다. Compose는 단일 호스트가 한계다.
> - **관측**: `docker compose config`로 현재 Compose 파일이 병합·치환된 최종 설정을 출력할 수 있다. 환경 변수가 의도한 값으로 주입되었는지, 오버라이드 파일이 제대로 합쳐졌는지 여기서 확인한다. CI 파이프라인에서 `docker compose config`를 lint 단계로 활용하면 잘못된 설정을 배포 전에 잡을 수 있다.

##### 체크포인트

- [ ] `docker-compose.yml`의 `services` / `volumes` / `networks` 최상위 키의 역할을 설명할 수 있다
- [ ] `docker compose up -d`로 다중 서비스를 백그라운드에서 실행하고 `docker compose down`으로 종료할 수 있다
- [ ] `docker compose ps`와 `docker compose logs -f`로 서비스 상태를 확인할 수 있다
- [ ] `.env` 파일을 만들고 Compose에서 환경 변수로 주입할 수 있다
- [ ] `depends_on`만으로는 DB 준비 완료가 보장되지 않는 이유를 설명하고 `healthcheck`로 해결할 수 있다

##### 예제로 직접 해보기

- [examples/v-1-2-postgres-volume/](../examples/v-1-2-postgres-volume/) — named volume(이하 볼륨)으로 Postgres 데이터를 영속화하는 Compose 구성. `docker compose up`과 `down` 후 데이터 생존을 직접 확인한다.
- [examples/vi-1-1-fastapi-postgres-nginx/](../examples/vi-1-1-fastapi-postgres-nginx/) — FastAPI, PostgreSQL, Nginx 3개 서비스가 하나의 Compose 파일로 구성된 실전 3티어 예제. `healthcheck`, `depends_on`, `expose` 패턴을 실제 코드로 확인할 수 있다.

### V-1-4. Compose로 다중 컨테이너 연결

- **난이도**: ★★★
- **선수 지식**: V-1-3
- **학습 목표**: 이 Section을 마치면 Compose로 웹 앱과 데이터베이스를 서비스 이름으로 연결할 수 있다.
- **설명**:
  Compose 파일 안에서 같은 네트워크에 속한 서비스끼리는 서비스 이름으로 통신할 수 있다. 예를 들어 `db`라는 서비스 이름으로 정의된 PostgreSQL에 웹 앱에서 `postgresql://db:5432/mydb`처럼 접속한다. `depends_on`으로 서비스 시작 순서를 지정할 수 있고(단, 실제 준비 완료 여부는 헬스체크로 확인해야 한다), `environment`로 환경변수를 주입한다.
- **핵심 키워드**: 서비스 이름 DNS, `depends_on`, `environment`, `networks`, Compose 네트워크
- **시각화 연결**: [visualizations/v-1-4_compose_multicontainer.html](visualizations/v-1-4_compose_multicontainer.html) (Compose 다중 컨테이너 연결 5단계 시각화)
- **다음 섹션**: V-1-5

#### 본문

##### Compose로 다중 컨테이너를 연결해야 하는 이유

실전 애플리케이션은 컨테이너 하나로 끝나지 않는다. 웹 앱은 DB에 쿼리를 날리고, DB는 별도의 컨테이너에서 실행된다. 이 두 컨테이너가 서로 통신하려면 "어느 주소로 접속해야 하는가"를 알아야 한다.

컨테이너의 IP 주소는 매번 재시작할 때마다 달라질 수 있다. 그래서 IP를 하드코딩하면 컨테이너가 재시작될 때마다 설정을 다시 바꿔야 한다. Compose는 이 문제를 **서비스 이름 DNS**로 해결한다. Compose 파일에 선언한 서비스 이름이 곧 호스트명이다. `db`라는 서비스를 선언했다면 다른 서비스에서 `db:5432`로 접속할 수 있다. IP가 바뀌어도 이름은 그대로이므로 설정을 바꿀 필요가 없다.

이 섹션에서는 서비스 이름 DNS, `depends_on`을 통한 시작 순서 제어, `environment`를 통한 환경 변수 주입, 그리고 Compose가 자동으로 만드는 네트워크를 배운다.

##### 개념 한눈에

| 개념 | 역할 | 예시 |
|:--|:--|:--|
| 서비스 이름 DNS | Compose 서비스 이름을 호스트명으로 사용 | `postgresql://db:5432/demo` |
| `depends_on` | 서비스 시작 순서 지정 | `api`가 `db` 다음에 시작 |
| `condition: service_healthy` | 헬스체크 통과 후 다음 서비스 시작 | DB 초기화 완료 후 API 시작 |
| `environment` | 환경 변수를 컨테이너에 직접 주입 | `DATABASE_URL=postgresql://db:5432/demo` |
| `env_file` | `.env` 파일 내용을 환경 변수로 주입 | `env_file: .env` |
| Compose 기본 네트워크 | 같은 Compose 프로젝트의 서비스를 자동으로 같은 네트워크에 연결 | 프로젝트명_default |

> **[입문 렌즈 ★☆☆]**
> - **비유**: Compose 네트워크는 **사무실 내선 전화망**이다. 같은 Compose 프로젝트에 있는 서비스들은 같은 사무실 안에 앉아 있다. `db` 서비스에 접속하려면 전화번호(IP) 대신 이름(`db`)만 누르면 된다. 직원이 자리를 옮겨 전화번호가 바뀌어도(컨테이너 재시작으로 IP가 바뀌어도), 이름으로 걸면 항상 연결된다.
> - **체감 예시**: 웹 앱의 `DATABASE_URL`에 `172.20.0.3:5432` 대신 `db:5432`를 쓰면, DB 컨테이너가 재시작되어 IP가 바뀌어도 앱 설정을 손댈 필요가 없다.
> - **주의**: 이 이름 통신은 **같은 Compose 프로젝트** 안에서만 된다. 다른 Compose 프로젝트의 서비스는 기본적으로 다른 네트워크에 있어 이름으로 접근할 수 없다.

##### 서비스 이름 DNS: 이름으로 통신하기

Compose는 프로젝트를 시작할 때 `[프로젝트명]_default`라는 bridge 네트워크를 자동으로 생성하고, 모든 서비스를 이 네트워크에 연결한다. 같은 네트워크 안의 서비스끼리는 **서비스 이름**을 호스트명으로 사용해 통신할 수 있다. Docker 내부 DNS가 서비스 이름을 해당 컨테이너의 IP로 자동으로 변환해 준다.

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env

  api:
    build: ./api
    environment:
      # "db"는 위에 선언한 서비스 이름 — Docker DNS가 IP로 변환
      - DATABASE_URL=postgresql://app:secret@db:5432/demo
    depends_on:
      - db
```

`api` 서비스의 `DATABASE_URL`에서 호스트명 자리에 `db`를 그대로 썼다. `api` 컨테이너 안에서 `ping db`를 치면 DB 컨테이너의 IP로 응답이 온다. IP를 직접 쓸 필요가 없다.

실제로 이름 변환이 되는지 확인하는 방법:

```bash
# api 컨테이너 안에서 db 이름 조회
docker compose exec api getent hosts db
# 출력 예: 172.20.0.2       db
```

vi-1-1 예제에서는 세 서비스(`db`, `api`, `nginx`)가 모두 같은 기본 네트워크에 속하므로, `api`는 `db:5432`로, `nginx`는 `api:8000`으로 서로를 이름으로 찾는다.

##### depends_on: 시작 순서와 준비 완료의 차이

`depends_on`은 서비스 **시작 순서**를 지정한다. 그러나 중요한 제약이 있다.

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env

  api:
    build: ./api
    depends_on:
      - db   # db 컨테이너가 "시작된 후" api를 시작한다
```

`depends_on: - db`만 쓰면 `db` **컨테이너가 시작된 직후** `api`가 시작된다. `db` 컨테이너가 실행 중이라도 PostgreSQL이 실제로 쿼리를 받을 준비(초기화, 포트 바인딩 완료)가 되지 않았을 수 있다. 이 상태에서 `api`가 DB 연결을 시도하면 연결 실패 에러가 발생한다.

**해결책: `condition: service_healthy`와 `healthcheck`를 함께 쓴다.**

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: ./api
    depends_on:
      db:
        condition: service_healthy   # healthcheck 통과 후 api 시작
```

`pg_isready` 명령이 성공 응답을 반환하면 DB가 쿼리를 받을 준비가 된 것이다. `condition: service_healthy`는 이 체크가 통과된 후에야 `api`를 시작한다. vi-1-1 예제의 `docker-compose.yml`이 이 패턴을 그대로 사용한다.

`healthcheck` 속성 정리:

| 속성 | 의미 | vi-1-1 예제 값 |
|:--|:--|:--|
| `test` | 실행할 검사 명령 | `pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB` |
| `interval` | 검사 주기 | `5s` |
| `timeout` | 명령 타임아웃 | `3s` |
| `retries` | 실패 허용 횟수 (이후 unhealthy) | `5` |
| `start_period` | 초기 준비 시간 유예 (이 기간 실패는 카운트 안 함) | `10s` (api 서비스) |

> **[주니어 렌즈 ★★☆]**
> - **타이밍 함정**: `depends_on: - db`만 쓰고 healthcheck를 생략하면 `api`가 DB 초기화 중에 연결 시도를 반복하다 실패하는 경우가 많다. 특히 `init.sql` 파일로 스키마를 생성하는 설정이라면 초기화 시간이 더 걸린다. `condition: service_healthy`는 선택이 아니라 사실상 필수다.
> - **디버깅**: 서비스 시작 후 `docker compose ps`로 각 서비스의 상태를 확인한다. `STATUS` 열에 `(healthy)` 또는 `(unhealthy)`가 표시된다. `(unhealthy)` 상태라면 `docker compose logs db`로 DB 로그를 보고 초기화 에러가 없는지 확인한다. `api` 서비스가 `exited`로 표시되었다면 `docker compose logs api`로 연결 실패 메시지를 확인한다.
> - **체크리스트**:
>   - [ ] `docker compose ps`에서 `db` 서비스가 `(healthy)` 상태인지 확인했다
>   - [ ] `depends_on`에 `condition: service_healthy`를 쓰고 `healthcheck`가 함께 선언되었는지 확인했다
>   - [ ] `docker compose logs api`에서 DB 연결 실패 에러가 없는지 확인했다
>   - [ ] `docker compose exec api getent hosts db`로 DNS 이름 변환이 되는지 확인했다

##### environment와 env_file: 환경 변수 주입

컨테이너에 환경 변수를 주입하는 방법은 두 가지다.

**방법 1: `environment` — 개별 변수 직접 지정**

```yaml
services:
  api:
    build: ./api
    environment:
      - DATABASE_URL=postgresql://app:secret@db:5432/demo
      - APP_ENV=development
      - LOG_LEVEL=debug
```

리스트 형태(`- KEY=VALUE`) 또는 맵 형태(`KEY: VALUE`) 둘 다 쓸 수 있다. 변수가 몇 개 없을 때 편리하다.

**방법 2: `env_file` — .env 파일 전체 주입**

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env   # .env 파일의 모든 KEY=VALUE를 환경 변수로 주입
```

비밀번호, API 키 같은 민감한 값은 `.env` 파일에 넣고 `.gitignore`에 추가한다. 대신 `.env.example`을 커밋해 팀원이 어떤 변수를 채워야 하는지 알 수 있게 한다.

**방법 3: `${변수명}` 치환 — .env 값을 environment에서 참조**

```yaml
services:
  api:
    environment:
      # Compose가 호스트 .env를 읽어 ${} 자리를 치환
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```

vi-1-1 예제에서는 `db`와 `api` 모두 `env_file: .env`를 써서 `.env.example`에 정의된 `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`를 주입한다.

주입된 환경 변수가 올바른지 확인하는 방법:

```bash
# 최종 Compose 설정 확인 (변수 치환 결과 포함)
docker compose config

# 실행 중인 컨테이너의 환경 변수 확인
docker compose exec api env | grep DATABASE
```

> **[실무자 렌즈 ★★★]**
> - **service mesh와의 비교**: Compose의 서비스 이름 DNS는 단일 호스트 안에서만 동작하는 단순한 이름 해석이다. 프로덕션 환경에서 수십~수백 개의 서비스가 여러 호스트에 분산되면 Istio, Linkerd 같은 **service mesh**를 도입한다. service mesh는 mTLS(양방향 TLS), 트래픽 분산, 재시도 정책, 서킷 브레이커를 서비스 코드 밖에서 제어한다. Compose의 `depends_on`은 이 중 "시작 순서"만 다루는 매우 단순한 버전이다.
> - **sidecar 패턴**: Compose에서도 sidecar 패턴을 흉내낼 수 있다. 메인 서비스 컨테이너 옆에 로그 수집기(`fluentd`), 프록시(`envoy`), 모니터링 에이전트를 별도 서비스로 선언하고 같은 네트워크에 붙이면 된다. 하지만 Compose에서의 sidecar는 pod처럼 생명주기가 묶이지 않으므로 진정한 sidecar 패턴은 Kubernetes에서 구현하는 것이 올바르다.
> - **K8s Service 오브젝트와 비교**: Kubernetes의 `Service` 오브젝트가 하는 일(Pod IP 추상화, 클러스터 내 DNS 등록, 로드밸런싱)을 Compose는 자동 생성 네트워크와 서비스 이름 DNS로 단순하게 구현한다. `depends_on`의 `condition: service_healthy`는 K8s의 `readinessProbe`와 개념적으로 대응된다. 두 도구의 차이를 알고 쓰면 K8s로 마이그레이션할 때 혼란이 줄어든다.

##### 예제로 직접 해보기

[examples/vi-1-1-fastapi-postgres-nginx/](../examples/vi-1-1-fastapi-postgres-nginx/) — FastAPI, PostgreSQL, Nginx 세 서비스가 서비스 이름으로 통신하는 실전 3티어 예제. `db → api → nginx` 순서로 `condition: service_healthy` 의존성이 연결되어 있고, `env_file`로 환경 변수를 주입한다. `docker compose up -d` 후 `curl localhost/items`로 전체 통신 흐름을 확인할 수 있다.

##### 체크포인트

- [ ] Compose 서비스 이름이 DNS 호스트명으로 동작하는 원리를 설명할 수 있다
- [ ] `depends_on: - db`와 `depends_on: db: condition: service_healthy`의 차이를 설명하고, 언제 후자가 필요한지 말할 수 있다
- [ ] `environment`와 `env_file`의 차이를 설명하고, 민감한 값을 안전하게 주입하는 방법을 적용할 수 있다
- [ ] `docker compose ps`로 각 서비스의 `(healthy)` 상태를 확인하고, `docker compose logs [서비스명]`으로 연결 오류를 디버깅할 수 있다
- [ ] vi-1-1 예제의 `docker-compose.yml`에서 `db → api → nginx` 의존성 체인을 읽고 각 서비스가 어떤 순서로 시작되는지 설명할 수 있다

### V-1-5. Compose 네트워크 직접 정의하기

- **난이도**: ★★★
- **선수 지식**: V-1-4
- **학습 목표**: 이 Section을 마치면 Compose에서 사용자 정의 네트워크를 만들어 서비스 간 통신을 세밀하게 제어할 수 있다.
- **설명**:
  Compose는 기본적으로 프로젝트 이름 기반의 bridge 네트워크를 하나 만든다. 보안이 중요한 상황에서는 "프론트엔드 네트워크"와 "백엔드 네트워크"를 분리해, DB 컨테이너가 외부에서 직접 접근되지 않도록 설계할 수 있다. `networks:` 블록에서 이름과 드라이버를 선언하고, 각 서비스에 `networks:` 항목을 추가해 원하는 네트워크에만 연결한다. Nginx만 프론트엔드 네트워크에 노출하고, FastAPI와 DB는 백엔드 네트워크에만 두는 패턴이 대표적이다.
- **핵심 키워드**: 사용자 정의 네트워크, `networks:` 블록, 네트워크 격리, 프론트/백엔드 분리
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-1-6

#### 본문

##### 사용자 정의 네트워크가 필요한 이유

Compose를 실행하면 Docker는 프로젝트 이름을 딴 기본 bridge 네트워크를 자동으로 만든다. 예를 들어 프로젝트 폴더 이름이 `myapp`이면 `myapp_default`라는 네트워크가 생기고, `services:` 아래에 선언한 모든 서비스가 이 네트워크에 함께 연결된다.

이 기본 설정은 편하지만 **보안 문제**가 있다. 같은 네트워크에 있으면 모든 서비스끼리 이름으로 통신할 수 있다. FastAPI 앱 서버뿐 아니라 외부와 통신하는 Nginx도 DB에 직접 접근할 수 있는 상태가 된다. 프론트엔드 역할을 하는 Nginx가 DB에 직접 커넥션을 맺을 일은 없어야 한다. 실수나 취약점이 생겼을 때 Nginx를 통해 DB까지 침투하는 경로를 막아야 한다.

**사용자 정의 네트워크를 여러 개 선언**하면 서비스가 속할 네트워크를 직접 지정할 수 있다. "이 서비스는 이 네트워크에만 연결된다"는 규칙을 Compose 파일에 명시적으로 기록하는 것이다.

##### 기본 네트워크 vs 사용자 정의 네트워크 한눈에

| 항목 | 기본 네트워크 (자동 생성) | 사용자 정의 네트워크 |
|:--|:--|:--|
| 선언 방법 | 별도 설정 없음, 자동 생성 | `networks:` 블록에 직접 선언 |
| 네트워크 이름 | `프로젝트명_default` | 지정한 이름 (예: `frontend`, `backend`) |
| 서비스 귀속 | 모든 서비스가 같은 네트워크 | 서비스별로 다른 네트워크 지정 가능 |
| 서비스 간 통신 | 모든 서비스끼리 가능 | 같은 네트워크 안에서만 가능 |
| DB 외부 접근 차단 | 불가능 | Nginx ↔ DB 직접 통신 차단 가능 |
| 멀티 네트워크 소속 | 불가능 | 한 서비스가 여러 네트워크에 속할 수 있음 |
| 프로덕션 권장 | 개발·실습용 | 보안이 필요한 모든 환경 |

##### `networks:` 블록 선언 방법

Compose 파일에서 네트워크를 직접 정의하는 방법은 두 단계다.

**1단계: 최상위 `networks:` 블록에서 네트워크 이름을 선언한다**

```yaml
networks:
  frontend:      # Nginx ↔ API 통신용
    driver: bridge
  backend:       # API ↔ DB 통신용
    driver: bridge
```

`driver: bridge`는 기본값이므로 생략할 수 있다. 이름만 선언해도 동작한다.

**2단계: 각 서비스의 `networks:` 항목에 연결할 네트워크를 나열한다**

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    networks:
      - frontend       # frontend 네트워크에만 연결

  api:
    build: ./api
    expose:
      - "8000"
    networks:
      - frontend       # nginx와 통신 (frontend)
      - backend        # db와 통신 (backend)

  db:
    image: postgres:16-alpine
    env_file: .env
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend        # backend 네트워크에만 연결

volumes:
  pgdata:

networks:
  frontend:
  backend:
```

이 구성에서 `nginx`와 `db`는 같은 네트워크에 없다. `nginx` 컨테이너 안에서 `db`라는 이름으로 접속을 시도해도 DNS 해석 자체가 실패한다. `api`는 두 네트워크에 모두 속해 있어 `nginx`와도, `db`와도 통신할 수 있다.

##### 프론트/백엔드 분리 패턴

실전에서 가장 많이 쓰이는 구성은 "Nginx → API → DB" 트래픽 흐름을 네트워크로 표현한 것이다.

```
[외부]
   |
   | 80/443
   v
[nginx]  ── frontend 네트워크 ──  [api]
                                    |
                              backend 네트워크
                                    |
                                  [db]
```

- `nginx`는 외부 포트 80을 열고 `frontend` 네트워크를 통해 `api`로 요청을 전달한다.
- `api`는 `frontend`와 `backend` 두 네트워크에 모두 속해 중간 다리 역할을 한다.
- `db`는 `backend` 네트워크에만 속해 있어 `nginx`에서 직접 접근할 수 없다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: **아파트 동 분리**와 같다. 1동(프론트엔드 네트워크)에는 외부 손님이 드나들 수 있는 로비(Nginx)가 있다. 2동(백엔드 네트워크)은 주민(API, DB)만 들어갈 수 있는 곳이다. 외부 손님이 2동 DB에 직접 가려면 반드시 1동 로비(Nginx)를 거쳐 API까지 통하는 내부 통로를 타야 한다. 로비에서 2동 지하 창고(DB)로 가는 직통 문은 없다.
> - **체감 예시**: `docker compose up` 후 `nginx` 컨테이너 안에서 `ping db`를 실행하면 "Name or service not known" 에러가 난다. 같은 네트워크가 아니어서 DNS 자체가 없기 때문이다. 네트워크 격리가 실제로 동작한다는 것을 눈으로 확인할 수 있다.
> - **주의**: `networks:` 항목을 서비스에 선언하지 않으면 그 서비스는 어떤 네트워크에도 연결되지 않는다. 서비스 간 통신이 필요하면 반드시 최상위 `networks:` 선언과 서비스 내 `networks:` 목록을 모두 작성해야 한다.

##### `docker network inspect`로 네트워크 확인하기

`docker compose up`으로 스택을 올린 후 실제 네트워크 구성을 확인하는 방법이다.

```bash
# 생성된 네트워크 목록 확인
docker network ls
```

```
NETWORK ID     NAME               DRIVER    SCOPE
a1b2c3d4e5f6   myapp_frontend     bridge    local
b2c3d4e5f6a1   myapp_backend      bridge    local
```

Compose는 최상위 `networks:`에 선언한 이름 앞에 프로젝트 이름을 붙여 네트워크를 만든다. `frontend`로 선언했으면 실제 이름은 `myapp_frontend`가 된다.

특정 네트워크에 어떤 컨테이너가 연결되어 있는지 확인하려면:

```bash
docker network inspect myapp_backend
```

```json
[
  {
    "Name": "myapp_backend",
    "Driver": "bridge",
    "Containers": {
      "abc123...": {
        "Name": "myapp-api-1",
        "IPv4Address": "172.20.0.2/16"
      },
      "def456...": {
        "Name": "myapp-db-1",
        "IPv4Address": "172.20.0.3/16"
      }
    }
  }
]
```

`myapp_backend`에 `api`와 `db` 컨테이너만 있고 `nginx`가 없으면 격리가 의도대로 동작하고 있다는 뜻이다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker network inspect <네트워크명>` — 네트워크에 연결된 컨테이너 목록과 IP를 JSON으로 출력한다. 서비스가 통신이 안 될 때 두 서비스가 같은 네트워크에 실제로 있는지 이 명령으로 먼저 확인한다.
> - **흔한 함정 1 — 네트워크 이름 충돌**: 다른 Compose 프로젝트에서도 `frontend`라는 이름을 쓰면 Docker는 각각 `프로젝트명_frontend`로 격리해 관리한다. 단, `external: true` 옵션으로 기존 네트워크를 가져다 쓸 때는 이름이 겹치면 의도치 않은 네트워크에 연결될 수 있으니 주의한다.
> - **흔한 함정 2 — 멀티 네트워크 소속 누락**: `api` 서비스를 `backend` 네트워크에만 연결하고 `frontend`에 빠뜨리면 `nginx`에서 `api`로 요청이 안 간다. 서비스가 여러 네트워크에 속해야 할 때는 `networks:` 항목에 모두 명시한다.
> - **체크리스트**:
>   - [ ] `docker network ls`로 Compose가 만든 네트워크 이름을 확인했다
>   - [ ] `docker network inspect <백엔드 네트워크명>`에 `nginx`가 없음을 확인했다
>   - [ ] `nginx` 컨테이너 안에서 `ping db`가 실패함을 확인했다 (격리 동작 검증)
>   - [ ] `api` 컨테이너 안에서 `ping db`가 성공함을 확인했다 (통신 가능 검증)

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: 멀티 호스트 환경(Docker Swarm)에서는 `driver: overlay`를 사용한다. overlay 네트워크는 물리적으로 다른 서버에 있는 컨테이너끼리 하나의 가상 네트워크처럼 통신할 수 있게 해준다. 단일 호스트 범위를 벗어나는 순간 bridge는 한계가 있고 overlay로 전환해야 한다.
> - **대안 기술**: Kubernetes에서는 `NetworkPolicy` 리소스로 파드(컨테이너) 간 트래픽을 제어한다. Compose의 `networks:` 분리와 개념은 같지만, 레이블 셀렉터와 ingress/egress 규칙으로 훨씬 세밀하게 제어할 수 있다. Compose 단계에서 네트워크 격리 설계를 익혀두면 K8s NetworkPolicy로의 전환이 자연스럽다.
> - **마이크로서비스 토폴로지**: 서비스가 10개 이상으로 늘어나면 네트워크를 역할 단위로 세분화한다. 예를 들어 `auth-network`, `data-network`, `observability-network`처럼 나누고, 각 서비스는 필요한 네트워크에만 귀속시킨다. 이렇게 하면 서비스 간 의존성이 Compose 파일에 시각적으로 표현되고, 불필요한 통신 경로를 코드 리뷰 단계에서 발견할 수 있다.

##### 체크포인트

- [ ] Compose 기본 네트워크와 사용자 정의 네트워크의 차이를 설명할 수 있다
- [ ] `networks:` 블록을 최상위와 서비스 두 곳에 모두 선언하는 이유를 말할 수 있다
- [ ] Nginx → API → DB 프론트/백엔드 분리 구성에서 각 서비스가 속한 네트워크를 말할 수 있다
- [ ] `docker network inspect`로 특정 네트워크에 연결된 컨테이너를 확인할 수 있다
- [ ] 한 서비스가 두 네트워크에 동시에 속할 수 있는 경우와 그 이유를 설명할 수 있다

### V-1-6. 볼륨 백업과 복원

- **난이도**: ★★★
- **선수 지식**: V-1-5
- **학습 목표**: 이 Section을 마치면 Docker 볼륨에 담긴 데이터를 백업하고 다른 환경에서 복원할 수 있다.
- **설명**:
  볼륨에 저장된 데이터(PostgreSQL 데이터 등)를 백업하려면 `docker run`으로 임시 컨테이너를 띄워 볼륨을 마운트한 뒤 tar로 묶어 내보내는 패턴을 사용한다. `docker run --rm -v <볼륨명>:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .` 가 표준 명령이다. 복원은 반대로 tar를 풀어 볼륨에 쓴다. 데이터베이스라면 pg_dump/pg_restore를 직접 사용하는 것이 더 안정적이다.
- **핵심 키워드**: 볼륨 백업, tar, `--rm`, alpine 컨테이너, pg_dump, 데이터 복원
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VI-1-1

#### 본문

##### 볼륨 백업이 필요한 이유

컨테이너가 삭제되어도 볼륨은 남는다. 그렇다면 볼륨은 안전한가? 꼭 그렇지는 않다. 볼륨이 저장된 호스트 서버 자체가 망가지거나, 실수로 `docker volume rm`을 실행하거나, `docker compose down -v`를 치면 볼륨도 함께 사라진다.

PostgreSQL 데이터나 업로드된 파일처럼 재생성이 불가능한 데이터는 볼륨 외부에도 별도로 보관해야 한다. 이것이 볼륨 백업이다. 백업이 있으면 다음 상황에서 데이터를 복원할 수 있다.

- 호스트 서버를 교체하거나 이사할 때
- 다른 팀원의 로컬 환경이나 스테이징 서버에 데이터를 옮길 때
- 실수로 데이터를 삭제했을 때
- 개발 환경에서 만든 데이터를 운영 환경으로 이전할 때

##### 백업 방법 비교

| 방법 | 대상 | 특징 | 권장 상황 |
|:--|:--|:--|:--|
| **tar 백업** | 모든 볼륨 | 임시 컨테이너로 볼륨을 통째로 압축 | 범용 — DB 외 파일 데이터, 환경 이전 |
| **pg_dump / pg_restore** | PostgreSQL 전용 | SQL 형태로 추출 — 버전 간 이식성 높음 | PostgreSQL 데이터 백업·복원 |
| **docker cp** | 실행 중인 컨테이너 파일 | 컨테이너 파일시스템에서 직접 복사 | 소규모 파일, 일회성 추출 |

PostgreSQL 데이터라면 `pg_dump`가 가장 안정적이다. tar 방식은 모든 볼륨에 적용할 수 있는 범용 패턴이므로 두 가지 모두 익혀두는 것이 좋다.

##### tar 기반 볼륨 백업과 복원

tar 백업의 핵심 아이디어는 간단하다. 임시 컨테이너를 하나 띄우고, 그 컨테이너에 백업할 볼륨과 저장할 디렉토리를 동시에 마운트한 뒤 tar로 묶어 내보낸다.

```bash
# 볼륨을 tar.gz로 백업
docker run --rm \
  -v <볼륨명>:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/backup.tar.gz -C /data .
```

명령을 한 줄씩 해독하면 다음과 같다.

| 옵션 | 역할 |
|:--|:--|
| `--rm` | 작업 완료 후 임시 컨테이너 자동 삭제 |
| `-v <볼륨명>:/data` | 백업할 볼륨을 컨테이너 `/data`에 마운트 |
| `-v $(pwd):/backup` | 현재 디렉토리를 컨테이너 `/backup`에 마운트 — 여기에 파일이 저장됨 |
| `alpine` | 경량 리눅스 이미지 — tar 명령이 기본 내장 |
| `tar czf /backup/backup.tar.gz -C /data .` | `/data` 안을 압축해 `/backup/backup.tar.gz`로 저장 |

tar 옵션 두 가지를 기억하면 충분하다.

- `czf` — **c**reate(생성) + **z**ip(gzip 압축) + **f**ile(파일명 지정) — 백업 시
- `xzf` — e**x**tract(압축 해제) + **z**ip(gzip) + **f**ile(파일명 지정) — 복원 시

볼륨 복원은 tar 백업의 반대 순서다.

```bash
# tar.gz에서 볼륨 복원
docker run --rm \
  -v <볼륨명>:/data \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/backup.tar.gz -C /data
```

복원 전에 볼륨이 이미 존재하면 기존 데이터와 섞일 수 있다. 완전히 초기화된 상태로 복원하려면 먼저 볼륨을 삭제하고 다시 만드는 것이 안전하다.

```bash
# 기존 볼륨 삭제 후 재생성 (컨테이너가 중지된 상태에서 실행)
docker volume rm <볼륨명>
docker volume create <볼륨명>
# 이후 위의 복원 명령 실행
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: 컨테이너는 컴퓨터, 볼륨은 그 컴퓨터에 연결된 외장하드다. 컴퓨터(컨테이너)가 고장나거나 바뀌어도 외장하드(볼륨)에 저장해두면 데이터를 복구할 수 있다. 그런데 외장하드 자체가 분실되거나 망가지면 어떻게 될까? 외장하드(볼륨)의 내용도 별도의 안전한 장소(백업 파일, 클라우드 스토리지)에 복사해두어야 진짜로 안전하다. 이것이 볼륨 백업이다.
> - **체감 예시**: `docker compose down -v`를 치면 볼륨도 삭제된다. 개발 중에 DB 데이터가 날아가는 경험을 한 번쯤 하게 되는데, 백업이 있으면 몇 초 만에 복원할 수 있다.
> - **주의**: `$(pwd)`는 명령을 실행한 현재 디렉토리다. Docker Desktop(Windows/Mac)에서는 `$(pwd)` 대신 `"${PWD}"` 또는 절대 경로를 써야 할 수 있다. 백업 파일이 어느 디렉토리에 생성됐는지 반드시 확인한다.

##### pg_dump / pg_restore

PostgreSQL 데이터는 tar 방식보다 `pg_dump`를 쓰는 것이 더 안정적이다. tar는 데이터 파일을 그대로 복사하기 때문에 PostgreSQL 버전이 다르면 호환성 문제가 생길 수 있다. `pg_dump`는 SQL 형태로 내보내기 때문에 버전이 달라도 복원이 가능하다.

실행 중인 PostgreSQL 컨테이너에서 직접 덤프하는 명령:

```bash
# pg_dump: DB 내용을 SQL 파일로 추출 (docker exec 방식)
docker exec -t <postgres컨테이너명> \
  pg_dump -U <유저명> <DB명> > backup.sql
```

Compose를 쓰는 경우 `docker compose exec`로 같은 작업을 할 수 있다.

```bash
# Compose 환경에서 pg_dump (서비스 이름: db, 유저: app, DB: demo)
docker compose exec db \
  pg_dump -U app demo > backup.sql
```

복원은 SQL 파일을 psql로 직접 실행하는 방법이 단순하고 호환성이 높다.

```bash
# psql로 SQL 파일을 DB에 적용 (-T: TTY 비활성화, 파이프 사용 시 필수)
docker compose exec -T db \
  psql -U app demo < backup.sql
```

PostgreSQL 전용 바이너리 형식으로 백업하면 용량이 작고 복원 속도가 빠르지만 psql로 직접 읽을 수 없다.

```bash
# 바이너리 형식으로 백업 (-Fc: custom format)
docker exec -t <postgres컨테이너명> \
  pg_dump -U <유저명> -Fc <DB명> > backup.dump

# 바이너리 형식 복원 (pg_restore 사용)
docker exec -i <postgres컨테이너명> \
  pg_restore -U <유저명> -d <DB명> < backup.dump
```

> **[주니어 렌즈 ★★☆]**
> - **--rm 컨테이너의 의미**: `--rm` 옵션은 컨테이너가 종료될 때 자동으로 삭제되게 한다. 백업용 임시 컨테이너는 작업이 끝나면 필요 없으므로 `--rm`을 붙이는 것이 표준이다. 붙이지 않으면 `docker ps -a`에 종료된 컨테이너가 계속 쌓인다.
> - **-v 마운트 조합 해독법**: `docker run --rm -v <볼륨>:/data -v $(pwd):/backup alpine tar czf /backup/out.tar.gz -C /data .` — `-v`가 두 개인 이유는 읽을 대상(볼륨)과 쓸 위치(현재 디렉토리)를 동시에 연결해야 하기 때문이다. 컨테이너 안에서 `/data`는 볼륨을 보고, `/backup`은 호스트 현재 디렉토리를 본다. tar가 `/data`에서 읽어 `/backup`에 쓰면 호스트에 파일이 생긴다.
> - **tar 옵션 기억법**: `czf`(압축해서 저장 = Create Zipped File), `xzf`(압축 해제 = eXtract Zipped File). 알파벳 순서보다 의미로 외우면 헷갈리지 않는다.
> - **-T 옵션**: `docker compose exec`에 `-T`를 붙이면 TTY(터미널 입력)를 비활성화한다. 파이프(`<`, `>`)로 파일을 주고받을 때 `-T`가 없으면 "the input device is not a TTY" 에러가 난다.

##### 데이터 복원 패턴

백업이 있어도 복원이 실제로 되는지 미리 확인해두지 않으면 정작 필요할 때 믿을 수 없다.

**PostgreSQL 환경 이전 시 전체 흐름**

```bash
# [소스 환경] 백업 생성
docker compose exec db pg_dump -U app demo > backup.sql

# [대상 환경] Compose 실행 (DB 서비스만 먼저 시작)
docker compose up -d db

# [대상 환경] DB가 준비됐는지 확인
docker compose exec db pg_isready -U app

# [대상 환경] 복원
docker compose exec -T db psql -U app demo < backup.sql

# [대상 환경] 복원 결과 확인
docker compose exec db psql -U app demo -c "\dt"
```

기존 데이터가 있는 DB에 복원하면 중복 키 에러가 날 수 있다. 완전히 초기화된 상태에서 복원하려면 DB를 삭제하고 다시 만든다.

```bash
# DB 초기화 후 복원
docker compose exec db psql -U app -c "DROP DATABASE demo;"
docker compose exec db psql -U app -c "CREATE DATABASE demo;"
docker compose exec -T db psql -U app demo < backup.sql
```

> **[실무자 렌즈 ★★★]**
> - **크론 자동 백업**: 프로덕션 환경에서는 백업을 수동으로 실행하지 않는다. 리눅스 cron에 `0 3 * * * docker compose exec -T db pg_dump -U app demo > /backups/$(date +\%Y\%m\%d).sql`처럼 등록해 매일 새벽 3시에 자동 실행한다. `find /backups -mtime +30 -delete`로 30일 이상 된 파일을 주기적으로 정리한다.
> - **S3 / GCS 연동**: 백업 파일을 로컬에만 두면 서버가 망가졌을 때 함께 사라진다. `aws s3 cp backup.sql s3://my-bucket/backups/` 또는 `gsutil cp backup.sql gs://my-bucket/backups/`로 오브젝트 스토리지에 보관하면 서버와 독립적으로 유지된다. AWS Backup이나 GCP Backup and DR 같은 관리형 서비스를 쓰면 스케줄·보존·복원 테스트를 자동화할 수 있다.
> - **스냅샷 기반 백업**: 클라우드 환경에서 볼륨이 EBS(AWS) 또는 Persistent Disk(GCP) 위에 있다면 디스크 스냅샷이 더 효율적이다. SQL 덤프 없이 수 분 안에 임의 시점으로 복원할 수 있다. 자체 호스팅 환경이라면 ZFS `zfs snapshot`이 같은 역할을 한다.
> - **복원 테스트 자동화**: 백업은 복원이 성공해야 의미 있다. CI 파이프라인에서 주기적으로 백업 파일을 실제로 복원해 데이터가 정상인지 검증하는 스크립트를 만들어둔다. 복원 테스트 없이 몇 달 지난 백업 파일을 믿는 것은 위험하다.

##### 체크포인트

- [ ] `docker run --rm -v <볼륨>:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .` 명령의 각 옵션 역할을 설명할 수 있다
- [ ] tar 백업(`czf`)과 복원(`xzf`) 명령을 순서대로 실행할 수 있다
- [ ] `docker compose exec db pg_dump -U app demo > backup.sql`로 PostgreSQL 데이터를 덤프하고 psql로 복원할 수 있다
- [ ] `docker compose exec`에 `-T` 옵션이 필요한 상황을 설명할 수 있다
- [ ] tar 백업과 pg_dump 중 PostgreSQL 버전 이전에 더 적합한 방법을 선택하고 이유를 말할 수 있다

---

## Part VI. 실전 다중 컨테이너 앱

### VI-1-1. FastAPI + PostgreSQL + Nginx 구성

- **난이도**: ★★★
- **선수 지식**: V-1-4
- **학습 목표**: 이 Section을 마치면 세 개의 컨테이너로 구성된 실전 웹 앱을 Compose로 실행할 수 있다.
- **설명**:
  실무에서 자주 쓰이는 구성은 다음과 같다. Nginx(리버스 프록시) → FastAPI(앱 서버) → PostgreSQL(데이터베이스). Nginx는 80포트로 외부 요청을 받아 FastAPI로 전달하고, FastAPI는 Postgres에 쿼리를 날린다. 이 세 서비스를 하나의 `compose.yml`에 정의하면 `docker compose up`으로 전체 스택을 로컬에서 재현할 수 있다. Nginx 리버스 프록시 설정은 `nginx.conf`로 분리하고 볼륨으로 마운트한다.
- **핵심 키워드**: 리버스 프록시(Reverse Proxy), Nginx, FastAPI, PostgreSQL, 3티어 구성
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VI-1-2

#### 본문

##### 왜 다중 컨테이너가 필요한가

실무 웹 서비스는 하나의 컨테이너로 모든 것을 처리하지 않는다. 웹 서버·앱 서버·데이터베이스를 역할별로 나누면 각 부분을 독립적으로 교체하거나 확장할 수 있다. 예를 들어 트래픽이 늘어났을 때 앱 서버만 더 띄우고 DB는 그대로 두는 전략이 가능해진다. 단일 컨테이너에 모든 것을 때려넣으면 장애가 났을 때 원인도 파악하기 어렵고, 각 구성 요소를 개별 버전으로 관리하기도 힘들다. 이 Section에서는 Nginx·FastAPI·PostgreSQL 세 컨테이너를 Compose 하나로 엮는 방법을 단계별로 배운다.

##### 3티어 구성 한눈에

| 서비스 | 역할 | 이미지 | 외부 포트 | 내부 포트 |
|:--|:--|:--|:--|:--|
| `nginx` | 리버스 프록시 — 외부 요청을 받아 api로 전달 | `nginx:alpine` | `80` | `80` |
| `api` | 앱 서버 — FastAPI CRUD 처리, DB 쿼리 실행 | 로컬 빌드 (`./api`) | 노출 없음 | `8000` |
| `db` | 데이터베이스 — 아이템 데이터 영구 저장 | `postgres:16-alpine` | 노출 없음 | `5432` |

`nginx`만 호스트에 포트를 열고, `api`와 `db`는 Compose 내부 네트워크에서만 통신한다. 외부에서는 80포트 하나만 보인다.

##### docker-compose.yml 해부

아래는 이 예제의 `docker-compose.yml` 전체 구조다.

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/01_init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: ./api
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    expose:
      - "8000"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api

volumes:
  pgdata:
```

**핵심 개념 4가지**를 짚고 넘어간다.

- **`services:`** — 각 컨테이너를 정의하는 블록이다. `db`, `api`, `nginx` 세 서비스가 하나의 Compose 파일에 있다.
- **`depends_on:`** — 시작 순서를 제어한다. `api`는 `db`가 `service_healthy` 상태가 된 뒤에야 시작된다. 단순히 `depends_on: db`라고만 쓰면 컨테이너 프로세스가 "시작됨"만 보장하고 DB가 실제로 쿼리를 받을 준비가 됐는지는 보장하지 않는다.
- **`expose` vs `ports`** — `expose: "8000"`은 Compose 내부 네트워크에서만 8000 포트를 열어준다. 호스트에서는 접근할 수 없다. `ports: "80:80"`은 호스트의 80 포트와 컨테이너의 80 포트를 연결한다. `api`를 `expose`로만 열어두면 외부에서 FastAPI에 직접 접근할 수 없어 Nginx를 반드시 거쳐야 한다.
- **`healthcheck:`** — DB가 실제로 연결 가능한 상태인지 주기적으로 검사한다. `pg_isready` 명령이 성공할 때까지 `api` 컨테이너 시작을 미룬다. `interval: 5s`는 5초마다 검사, `retries: 5`는 5번 실패하면 unhealthy 판정이다.

##### Nginx 리버스 프록시

`nginx/nginx.conf`의 구조는 아래와 같다.

```nginx
upstream api {
    server api:8000;
}

server {
    listen 80;

    location / {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- **`upstream api`** — Nginx가 요청을 전달할 대상을 정의한다. `api:8000`에서 `api`는 Compose 서비스 이름이다. Docker의 내부 DNS가 서비스 이름을 컨테이너 IP로 자동 변환하므로 IP를 직접 쓰지 않아도 된다.
- **`proxy_pass http://api`** — `location /`에 들어오는 모든 요청을 `api` 업스트림으로 넘긴다.
- **`proxy_set_header`** — 원래 클라이언트의 IP와 호스트 정보를 보존해서 FastAPI가 요청 출처를 알 수 있도록 한다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 레스토랑에 비유하면 이렇다. Nginx는 **접수원**이다. 손님(브라우저)의 주문을 받아 주방(FastAPI)에 넘긴다. FastAPI는 **주방**이다. 실제 요리(데이터 처리)를 하고 창고(PostgreSQL)에서 재료를 꺼낸다. PostgreSQL은 **창고**다. 재료(데이터)를 보관하고 주방 요청에만 응답한다. 손님이 창고에 직접 들어갈 수는 없다.
> - **체감 예시**: 백화점 안내 데스크와 같다. 직접 각 매장을 찾아다니는 것보다 안내 데스크에 물어보면 알아서 연결해 준다. Nginx가 그 안내 데스크 역할이다.
> - **주의**: `docker compose up` 후 바로 `curl localhost/items`를 실행하면 "502 Bad Gateway"가 뜰 수 있다. db 헬스체크가 끝나고 api가 완전히 뜰 때까지 몇 초가 걸린다. 잠시 기다렸다가 다시 시도하면 된다.

##### FastAPI 앱 서버

`api/main.py`는 ORM(코드로 DB를 다루는 도구) 없이 `psycopg`로 PostgreSQL에 직접 연결한다. 학습 예제에서 ORM을 쓰면 설정 코드가 많아져 핵심 흐름을 파악하기 어렵기 때문이다.

제공되는 엔드포인트는 다음과 같다.

| 엔드포인트 | 메서드 | 설명 |
|:--|:--|:--|
| `/health` | GET | DB 연결 상태 확인. `{"status":"ok"}` 반환 |
| `/items` | GET | 전체 아이템 목록 반환 |
| `/items/{item_id}` | GET | 단건 아이템 조회 |
| `/items` | POST | 새 아이템 추가. body: `{"name": "..."}` |

DB 연결은 환경변수 `DATABASE_URL`에서 읽는다. `.env` 파일에 `DATABASE_URL=postgresql://app:secret_change_me@db:5432/demo`가 있고, Compose가 `env_file: .env`로 자동 주입한다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose logs -f api` — api 컨테이너의 로그를 실시간으로 따라간다. DB 연결 에러, uvicorn 시작 로그, 요청 기록을 한번에 볼 수 있다.
> - **흔한 함정 1 — 포트 충돌**: 호스트에 다른 서비스가 80 포트를 쓰고 있으면 `docker compose up`이 실패한다. `docker-compose.yml`의 `ports: "80:80"`을 `"8080:80"`으로 바꾸면 `curl localhost:8080/items`로 접근할 수 있다.
> - **흔한 함정 2 — depends_on 타이밍**: `depends_on`만 쓰고 `condition: service_healthy`를 빠뜨리면 DB가 아직 초기화 중인데 api가 연결을 시도해서 `psycopg.OperationalError`가 뜬다. 이 예제는 `healthcheck` + `condition: service_healthy`로 이 문제를 해결한다.
> - **빠른 확인 명령**: `docker compose ps`로 세 서비스가 `running`인지 확인하고, `curl localhost/health`로 API 연결을 테스트한다. 문제가 있으면 `docker compose logs -f`로 어느 서비스에서 에러가 나는지 확인한다.

##### 의사결정 트리: 언제 리버스 프록시가 필요한가

```
외부에서 직접 요청을 받는가?
  YES → 단일 앱인가?
          YES → 리버스 프록시 없이도 가능 (포트 직접 노출)
          NO  → 리버스 프록시 필요 (Nginx, Traefik 등)
  NO  → 내부 서비스 간 통신만 → expose 로 충분
```

로컬 개발 환경에서 앱 하나만 쓴다면 `ports: "8000:8000"`으로 FastAPI를 직접 노출해도 된다. 하지만 아래 상황 중 하나라도 해당하면 리버스 프록시를 도입하는 것이 좋다.

- 한 호스트에서 여러 서비스를 도메인/경로로 분기해야 할 때
- SSL(HTTPS) 인증서를 한 곳에서 관리하고 싶을 때
- 앱 서버를 외부에 직접 노출하고 싶지 않을 때
- 정적 파일은 Nginx가 직접 서빙하고 동적 요청만 앱에 넘기고 싶을 때

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: 이 예제의 Nginx 설정은 단일 `api` 인스턴스만 upstream에 등록한다. 프로덕션에서는 `upstream api { server api_1:8000; server api_2:8000; }` 처럼 여러 인스턴스를 등록하면 로드밸런싱이 된다. SSL 종료(TLS Termination)는 Nginx의 `ssl_certificate` 설정으로 처리하고, 컨테이너 내부 통신은 평문 HTTP를 유지하는 패턴이 일반적이다.
> - **대안 기술**: Traefik과 Caddy는 `docker-compose.yml` 레이블만으로 라우팅을 자동 구성하고, Let's Encrypt 인증서를 자동 갱신한다. Nginx보다 설정 파일이 적고 동적 라우팅이 쉽다. 단, Nginx는 문서와 사례가 가장 많아 트러블슈팅 자료를 찾기 쉽다.
> - **관측**: `docker compose logs nginx` — 접근 로그가 기본 포함된다. 특정 경로 응답 코드, 응답 시간 패턴을 확인할 수 있다. `docker compose logs api` 와 함께 보면 Nginx 레벨 오류인지 FastAPI 레벨 오류인지 빠르게 판별된다. 프로덕션에서는 `docker compose logs --since 10m` 으로 최근 10분치만 필터링해서 보는 습관을 들인다.

##### 체크포인트

- [ ] `docker compose up -d` 후 세 컨테이너가 모두 `running` 상태임을 확인할 수 있다
- [ ] `curl localhost/items` 로 seed 데이터를 조회할 수 있다
- [ ] `curl -X POST localhost/items -H "Content-Type: application/json" -d '{"name":"hello"}'` 로 새 항목을 추가할 수 있다
- [ ] `expose`와 `ports`의 차이를 설명할 수 있다
- [ ] Nginx `upstream`과 `proxy_pass`가 각각 무슨 역할을 하는지 설명할 수 있다

##### 예제로 직접 해보기

- [`examples/vi-1-1-fastapi-postgres-nginx/`](examples/vi-1-1-fastapi-postgres-nginx/) — Nginx + FastAPI + PostgreSQL 3티어 예제 (단계별 README 포함)

---

### VI-1-2. 환경변수와 .env 파일 관리

- **난이도**: ★★★
- **선수 지식**: VI-1-1
- **학습 목표**: 이 Section을 마치면 시크릿(비밀번호, API 키)을 이미지에 하드코딩하지 않고 안전하게 주입할 수 있다.
- **설명**:
  데이터베이스 비밀번호나 API 키를 Dockerfile이나 `compose.yml`에 직접 쓰면 Git에 올라가는 순간 보안 사고가 난다. `.env` 파일에 민감한 값을 넣고 `.gitignore`에 추가한다. Compose는 `.env` 파일을 자동으로 읽어 `${변수명}` 형태로 치환한다. `env_file:` 옵션으로 특정 env 파일을 지정할 수도 있다. 프로덕션에서는 Docker Secrets 또는 클라우드 시크릿 매니저를 사용한다.
- **핵심 키워드**: `.env`, `env_file`, `${변수명}`, `.gitignore`, Docker Secrets
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VI-1-3

#### 본문

##### 환경변수를 분리해야 하는 이유

데이터베이스 비밀번호, API 키, JWT 시크릿 같은 민감한 값을 `docker-compose.yml`이나 `Dockerfile`에 직접 쓰는 것은 가장 흔하고 치명적인 보안 실수 중 하나다. 이 파일이 Git에 커밋되는 순간 비밀번호가 코드 이력에 영원히 남는다. GitHub에 올리면 봇이 수 분 안에 긁어가는 것으로 알려져 있다.

해결책은 단순하다. 민감한 값을 별도 파일(`.env`)에 분리하고, 이 파일을 `.gitignore`에 추가해 Git에서 제외한다. Compose는 프로젝트 루트의 `.env` 파일을 자동으로 읽어 `${변수명}` 형태로 치환한다. 코드에는 `${변수명}` 자리표시자만 남고, 실제 값은 배포 환경마다 다른 `.env` 파일로 관리된다.

##### 주입 방법 3가지 비교

Compose에서 환경변수를 컨테이너에 주입하는 방법은 세 가지다.

| 방법 | 사용 위치 | 특징 | 적합한 상황 |
|:--|:--|:--|:--|
| `environment:` | 서비스 블록 | 값을 YAML에 직접 기입 | 민감하지 않은 값 (포트, 타임존 등) |
| `env_file:` | 서비스 블록 | 별도 파일에서 KEY=VALUE 읽기 | 민감한 값 묶음을 서비스에 주입 |
| `${변수명}` 치환 | YAML 파일 어디서나 | `.env` 파일 값을 YAML 내에서 치환 | 이미지 태그, 포트 번호 등 YAML 구조 안에서 동적으로 쓸 때 |

세 가지는 서로 배타적이지 않다. 한 `docker-compose.yml` 안에서 함께 쓰는 것이 일반적이다.

##### `.env` 파일과 `${변수명}` 치환

`.env` 파일은 프로젝트 루트에 `KEY=VALUE` 형식으로 작성한다.

```
# .env
POSTGRES_USER=app
POSTGRES_PASSWORD=secret_change_me
POSTGRES_DB=demo
DATABASE_URL=postgresql://app:secret_change_me@db:5432/demo
```

이 값들은 `docker-compose.yml` 안에서 `${변수명}`으로 참조할 수 있다.

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
```

`docker compose up`을 실행하면 Compose가 `.env`를 읽어 `${POSTGRES_USER}`를 `app`으로, `${POSTGRES_PASSWORD}`를 `secret_change_me`로 치환한다. YAML에는 실제 비밀번호가 없고 자리표시자만 남는다.

치환 결과가 올바른지 확인하려면 아래 명령을 쓴다.

```bash
docker compose config
```

이 명령은 `.env`가 모두 치환된 최종 Compose 설정을 출력한다. 값이 예상대로 들어갔는지 실행 전에 검증할 수 있다.

##### `env_file:`로 파일 통째로 주입하기

`environment:` 블록에서 변수를 하나씩 나열하는 대신, `env_file:`로 파일 전체를 컨테이너에 주입할 수 있다.

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env          # .env 파일의 모든 KEY=VALUE를 컨테이너 환경변수로 주입

  api:
    build: ./api
    env_file: .env          # 같은 .env를 api 컨테이너에도 주입
```

`vi-1-1-fastapi-postgres-nginx` 예제가 정확히 이 패턴을 사용한다. `db`와 `api` 모두 `env_file: .env`로 선언해 하나의 `.env` 파일에서 모든 값을 주입받는다. `DATABASE_URL`은 api 컨테이너에서 PostgreSQL 연결 주소로 쓰이고, `POSTGRES_*` 변수는 db 컨테이너의 초기 설정에 쓰인다.

`env_file:`과 `${변수명}` 치환은 동작 방식이 다르다는 점에 주의한다.

| 구분 | `env_file:` | `${변수명}` 치환 |
|:--|:--|:--|
| 값이 들어가는 곳 | 컨테이너 내부 환경변수 | `docker-compose.yml` YAML 내부 |
| 용도 | 앱이 런타임에 읽는 값 | YAML 구조를 동적으로 구성할 때 |
| 예시 | `DATABASE_URL`을 FastAPI가 읽음 | `image: postgres:${PG_VERSION}` |

> **[입문 렌즈 ★☆☆]**
> - **비유**: 비밀번호 포스트잇을 모니터에 붙여놓으면 사무실을 지나가는 사람 누구나 볼 수 있다. `.env` 파일은 그 포스트잇을 잠긴 서랍 안에 넣어두는 것과 같다. `docker-compose.yml`은 "서랍 키를 가져와"라는 메모만 남기고, 실제 비밀번호는 서랍(`.env`) 안에 있다. 코드를 GitHub에 올려도 서랍 자체는 올라가지 않는다.
> - **`.env.example`의 역할**: `.env`는 Git에 올리지 않지만, 팀원이 어떤 변수를 채워야 하는지 알 수 있도록 `.env.example`을 Git에 포함한다. 실제 값 대신 `secret_change_me` 같은 자리표시자를 넣는다. 새로운 팀원은 `cp .env.example .env` 후 실제 값을 채워 넣으면 된다.
> - **체감 예시**: vi-1-1 예제의 `.env.example`을 보면 `POSTGRES_PASSWORD=secret_change_me`라고 적혀 있다. 이 파일을 복사해서 `.env`로 만들고 비밀번호를 바꾸는 것이 첫 번째 할 일이다.

##### `.gitignore` 설정

`.env` 파일을 만들었다면 반드시 `.gitignore`에 추가해야 한다.

```
# .gitignore
.env
*.env
!.env.example    # .env.example은 Git에 포함한다
```

`.env.example`은 Git에 올리고 실제 `.env`는 올리지 않는 패턴이 표준이다. `!.env.example`은 `*.env` 규칙에서 `.env.example`만 예외로 허용한다는 뜻이다.

Git에 이미 커밋된 `.env`를 뒤늦게 제거하려면 아래 순서를 따른다.

```bash
# 1. .gitignore에 .env 추가
echo ".env" >> .gitignore

# 2. Git 추적에서 제거 (파일은 유지)
git rm --cached .env

# 3. 커밋
git add .gitignore
git commit -m "remove .env from tracking"
```

이미 원격 저장소에 올라간 경우, 해당 커밋 이력에 비밀번호가 남아 있으므로 **비밀번호 즉시 교체**가 필요하다. 이력을 지우는 것은 복잡하고 불완전하다.

> **[주니어 렌즈 ★★☆]**
> - **`docker compose config`로 치환 결과 확인**: 실수로 변수명을 틀렸거나 `.env` 파일이 없으면 `${POSTGRES_PASSWORD}`가 빈 문자열로 치환된다. `docker compose config`를 먼저 실행해 실제로 어떤 값이 들어가는지 확인하는 습관을 들인다.
> - **`.env` 우선순위**: Compose는 여러 곳에서 환경변수를 읽는다. 우선순위는 `environment:` 블록 > `env_file:` > `.env` 파일(자동 로드) 순이다. `environment:` 블록에 직접 쓴 값이 `.env` 파일 값을 덮어쓴다. 예상과 다른 값이 들어간다면 이 우선순위를 확인한다.
> - **흔한 함정 — 따옴표 처리**: `docker-compose.yml`과 `.env`에서 따옴표 처리 방식이 다르다. `.env` 파일에서 `PASSWORD="my secret"`으로 쓰면 따옴표 자체가 값에 포함된다(`"my secret"`이 아니라 `my secret`을 원하면 따옴표 없이 `PASSWORD=my secret`으로 쓴다). 공백이 포함된 값은 `.env`보다 `environment:` 블록에서 쓰는 것이 더 안전하다.
> - **`env_file:`에 여러 파일 지정**: 환경별로 파일을 분리할 때는 리스트로 지정할 수 있다. 나중에 선언된 파일의 값이 앞의 값을 덮어쓴다.
>   ```yaml
>   env_file:
>     - .env           # 공통
>     - .env.local     # 로컬 전용 (Git 제외)
>   ```

##### 프로덕션에서의 시크릿 관리

`.env` 파일은 로컬 개발과 소규모 프로젝트에 적합하다. 그러나 프로덕션 환경에서 `.env` 파일을 서버에 직접 두는 방식은 한계가 있다. 파일 권한을 잘못 설정하면 누출되고, 여러 서버에 배포할 때 동기화가 번거롭다.

프로덕션에서 흔히 쓰는 대안은 다음과 같다.

| 방법 | 특징 | 적합한 환경 |
|:--|:--|:--|
| Docker Secrets | Swarm 클러스터에서 파일로 마운트, 메모리에만 저장 | Docker Swarm |
| AWS Secrets Manager | AWS 관리형, IAM 권한 제어, 자동 교체 지원 | AWS 인프라 |
| HashiCorp Vault | 자체 호스팅 가능, 동적 시크릿 생성, 감사 로그 | 복합 클라우드, 온프레미스 |
| Kubernetes Secrets | K8s 네이티브, etcd 암호화 필요 | Kubernetes 환경 |

> **[실무자 렌즈 ★★★]**
> - **Docker Secrets**: Docker Swarm에서 `docker secret create`로 시크릿을 등록하면 컨테이너 내부의 `/run/secrets/<이름>` 경로에 파일로 마운트된다. 환경변수가 아니라 파일로 읽는 방식이라 `docker inspect`로 노출되지 않는다. 그러나 Swarm을 쓰지 않는 단일 호스트 환경에서는 지원되지 않는다.
> - **12-Factor App**: Heroku가 정리한 12-Factor App(https://12factor.net/config) 방법론은 설정을 코드에서 완전히 분리해 환경변수로만 주입하도록 권장한다. `.env` 파일 방식은 12-Factor의 개발 환경 구현체다. 프로덕션에서는 운영 체제나 플랫폼 수준의 환경변수, 또는 시크릿 매니저로 주입하는 것이 원칙이다.
> - **시크릿 교체**: AWS Secrets Manager와 Vault는 시크릿 자동 교체(rotation)를 지원한다. 데이터베이스 비밀번호를 주기적으로 자동 변경하고, 앱이 재시작 없이 새 비밀번호를 읽을 수 있다. `.env` 파일 방식에서는 파일을 수동으로 교체하고 컨테이너를 재시작해야 한다.
> - **감사 추적**: 시크릿에 누가 언제 접근했는지 기록이 필요하다면 Vault의 감사 로그나 AWS CloudTrail을 활용한다. `.env` 파일은 접근 이력이 없다.

##### 체크포인트

- [ ] `.env` 파일에 `POSTGRES_PASSWORD`를 정의하고 `docker-compose.yml`에서 `${POSTGRES_PASSWORD}`로 참조할 수 있다
- [ ] `env_file: .env`와 `environment: KEY: ${KEY}` 방식의 차이를 설명하고, 각각 어떤 상황에 적합한지 말할 수 있다
- [ ] `docker compose config`를 실행해 `.env` 값이 YAML에 올바르게 치환됐는지 확인할 수 있다
- [ ] `.gitignore`에 `.env`를 추가하고 `.env.example`은 Git에 포함하는 이유를 설명할 수 있다
- [ ] `.env` 파일 방식과 Docker Secrets의 차이점을 프로덕션 관점에서 설명할 수 있다

---

### VI-1-3. 헬스체크와 의존성 순서

- **난이도**: ★★★
- **선수 지식**: VI-1-2
- **학습 목표**: 이 Section을 마치면 DB가 완전히 준비된 후에 앱 서버가 연결을 시도하도록 설정할 수 있다.
- **설명**:
  `depends_on`은 서비스 시작 순서만 제어하고, DB가 실제로 쿼리를 받을 준비가 됐는지는 보장하지 않는다. DB 컨테이너가 시작 중인데 앱이 접속하려다 에러가 나는 것이 흔한 함정이다. 해결책은 두 가지다. 하나는 Dockerfile에 `HEALTHCHECK` 명령으로 준비 상태를 검사하고, `depends_on.condition: service_healthy`를 쓰는 것이다. 다른 하나는 `wait-for-it.sh` 같은 스크립트로 앱 시작 전에 DB 포트가 열릴 때까지 기다리는 것이다.
- **핵심 키워드**: `HEALTHCHECK`, `depends_on.condition: service_healthy`, `wait-for-it.sh`, 레이스 컨디션
- **시각화 연결**: [visualizations/vi-1-3_healthcheck_timing.html](visualizations/vi-1-3_healthcheck_timing.html) (헬스체크 타이밍 시뮬레이션 5단계 시각화)
- **다음 섹션**: VI-1-4

#### 본문

##### 왜 "시작됨"과 "준비됨"은 다른가

`docker compose up`을 실행하면 컨테이너는 순식간에 "시작됨(started)" 상태가 된다. 그런데 컨테이너가 시작됐다고 해서 그 안의 프로세스가 요청을 받을 준비가 된 것은 아니다. PostgreSQL은 컨테이너가 시작된 뒤에도 데이터 디렉터리 초기화, init.sql 실행, 포트 바인딩까지 수초가 걸린다. 이 시간 동안 앱 서버가 DB에 연결을 시도하면 `connection refused` 에러가 발생한다.

이것이 바로 **레이스 컨디션(race condition)**이다. 두 서비스가 "누가 먼저 준비되느냐"를 두고 경주를 벌이는 상황이다. `depends_on: - db`는 `db` 컨테이너가 "시작된 후" `api`를 시작한다고 보장할 뿐, DB가 쿼리를 받을 준비가 됐는지는 전혀 알지 못한다.

이 문제를 해결하는 방법은 두 가지다.

1. **HEALTHCHECK + `condition: service_healthy`** — DB 컨테이너 안에 "준비됐는지" 검사하는 명령을 심어두고, 그 검사가 통과될 때까지 다음 서비스 시작을 미룬다.
2. **`wait-for-it.sh` 스크립트** — 앱 컨테이너가 시작 직전에 DB 포트가 열릴 때까지 기다리는 쉘 스크립트를 실행한다. HEALTHCHECK 없이도 쓸 수 있는 대안이다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 병원 진찰에 비유할 수 있다. 환자(DB)가 병원에 **도착했다(started)**고 해서 진찰 준비가 **된(healthy)** 게 아니다. 접수도 하고, 가운도 입고, 검사실 침대에 누워야 비로소 의사(앱 서버)가 진찰을 시작할 수 있다. `HEALTHCHECK`는 "환자가 진찰 준비가 됐는지"를 주기적으로 확인하는 간호사 역할이다.
> - **체감 예시**: PostgreSQL 컨테이너 로그를 보면 "database system is ready to accept connections"라는 메시지가 뜨는 순간이 있다. 그 이전에는 DB가 실행 중이어도 연결이 거부된다. `condition: service_healthy`는 바로 이 "ready" 상태를 기다리게 해 준다.
> - **주의**: `depends_on`을 아예 안 쓰면 `api`와 `db`가 동시에 시작되어 레이스 컨디션이 더 심해진다. `depends_on`은 최소한 시작 순서라도 보장하므로 항상 써야 한다.

##### HEALTHCHECK: DB가 준비됐는지 검사하기

`HEALTHCHECK`는 컨테이너가 정상 동작 중인지 주기적으로 확인하는 명령이다. Dockerfile에 직접 넣거나 Compose 파일의 `healthcheck:` 블록으로 설정할 수 있다.

vi-1-1 예제의 `db` 서비스 설정을 다시 살펴본다.

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
```

`healthcheck:` 속성 각각의 의미는 다음과 같다.

| 속성 | 의미 | 예시 값 | 설명 |
|:--|:--|:--|:--|
| `test` | 실행할 검사 명령 | `pg_isready -U ...` | 명령이 exit code 0을 반환하면 healthy |
| `interval` | 검사 주기 | `5s` | 5초마다 한 번씩 검사 |
| `timeout` | 명령 타임아웃 | `3s` | 3초 안에 응답이 없으면 실패 처리 |
| `retries` | unhealthy 판정 실패 허용 횟수 | `5` | 5번 연속 실패하면 unhealthy |
| `start_period` | 초기 유예 기간 | `10s` | 컨테이너 시작 후 10초 동안은 실패해도 카운트 안 함 |

`start_period`는 DB처럼 초기화에 시간이 걸리는 서비스에서 중요하다. 이 시간 동안 검사가 실패해도 `retries` 카운터가 올라가지 않는다. 초기화 중에 unhealthy 판정이 나서 컨테이너가 의도치 않게 재시작되는 것을 막는다.

`pg_isready` 명령은 PostgreSQL이 제공하는 연결 가능 여부 확인 도구다. exit code 0을 반환하면 DB가 쿼리를 받을 준비가 된 것이다. `$$POSTGRES_USER`에서 `$$`는 Compose 변수 치환을 피하기 위해 `$`를 한 번 더 쓴 것이다.

##### depends_on.condition: 헬스체크와 시작 조건 연결하기

`healthcheck`를 선언했다면 `depends_on`에 `condition:` 옵션을 추가해서 "어느 상태가 될 때까지 기다릴지"를 명시한다.

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file: .env
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: ./api
    env_file: .env
    depends_on:
      db:
        condition: service_healthy  # db가 healthy 상태가 된 후에만 api 시작
```

`condition`에 쓸 수 있는 값은 세 가지다.

| condition | 의미 |
|:--|:--|
| `service_started` | 컨테이너가 시작되기만 하면 됨 (기본값) |
| `service_healthy` | healthcheck가 통과(healthy)된 후 시작 |
| `service_completed_successfully` | 컨테이너가 exit code 0으로 종료된 후 시작 (초기화 작업 등에 사용) |

vi-1-1 예제에서는 `db → api → nginx` 순서로 의존성 체인이 구성된다. `db`가 healthy가 되면 `api`가 시작되고, `api`가 시작되면 `nginx`가 시작된다.

##### wait-for-it.sh: 헬스체크 없이 포트로 대기하기

`HEALTHCHECK`를 쓸 수 없는 상황(서드파티 이미지, 커스텀 프로토콜)에서는 `wait-for-it.sh` 같은 스크립트를 사용한다. 이 스크립트는 지정한 호스트:포트가 열릴 때까지 앱 시작을 블록한다.

사용 방법:

```bash
# 1. 스크립트를 프로젝트에 포함
curl -o wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
chmod +x wait-for-it.sh
```

```dockerfile
# api/Dockerfile
COPY wait-for-it.sh /wait-for-it.sh
ENTRYPOINT ["/wait-for-it.sh", "db:5432", "--", "uvicorn", "main:app", "--host", "0.0.0.0"]
```

`wait-for-it.sh db:5432 --` 부분이 "db의 5432 포트가 열릴 때까지 기다린 후 `--` 뒤의 명령을 실행"하는 구조다. 포트가 열렸다는 것은 TCP 연결 수락이 가능하다는 뜻이지만, DB 초기화(init.sql 실행 등)가 완료됐는지는 보장하지 않는다. `HEALTHCHECK` + `service_healthy` 조합이 더 정확하므로, 가능하다면 그 방법을 우선한다.

> **[주니어 렌즈 ★★☆]**
> - **헬스 상태 직접 확인**: `docker inspect --format '{{json .State.Health}}' <컨테이너명>` 명령으로 현재 헬스 상태와 최근 검사 결과를 JSON으로 볼 수 있다. `Status` 필드가 `"healthy"`, `"unhealthy"`, `"starting"` 중 하나로 표시된다. `docker compose ps`는 `(healthy)` / `(unhealthy)` 약식 표시를, `docker inspect`는 상세 로그를 보여준다.
> - **타이밍 디버깅**: `api` 서비스가 `exited` 상태로 떨어지고 `docker compose logs api`에 `connection refused` 또는 `could not connect to server`가 보이면 레이스 컨디션이다. `docker compose logs db`로 DB 초기화 로그를 확인하고, `start_period`를 늘리거나 `interval`을 줄여서 더 빠르게 healthy 판정이 나도록 조정한다.
> - **healthcheck 로그 확인**: `docker inspect --format '{{range .State.Health.Log}}{{.Output}}{{end}}' <db_컨테이너명>` 명령으로 최근 healthcheck 실행 결과와 출력 메시지를 확인할 수 있다. `pg_isready`가 왜 실패하는지 원인을 파악하는 데 유용하다.

##### 전체 흐름 정리

```
docker compose up 실행
    │
    ├─ db 컨테이너 시작 (started)
    │     │
    │     │  interval마다 pg_isready 실행
    │     │  start_period 동안은 실패해도 카운트 X
    │     │
    │     └─ pg_isready 성공 → healthy 판정
    │
    ├─ api 컨테이너 시작 (condition: service_healthy 충족)
    │     │
    │     └─ DB에 연결 성공, 앱 서버 시동
    │
    └─ nginx 컨테이너 시작 (depends_on: api - 기본 service_started)
          │
          └─ api:8000으로 프록시 준비 완료
```

> **[실무자 렌즈 ★★★]**
> - **K8s의 liveness/readiness/startup probe**: Kubernetes는 컨테이너 상태 검사를 세 가지로 나눈다. `livenessProbe`는 "살아있는가"(실패 시 컨테이너 재시작), `readinessProbe`는 "트래픽을 받을 준비가 됐는가"(실패 시 서비스 엔드포인트에서 제거), `startupProbe`는 "최초 기동이 완료됐는가"(느린 앱의 초기 기동 시간 확보)에 해당한다. Compose의 `HEALTHCHECK`는 이 셋을 하나로 합친 단순화 버전이고, `condition: service_healthy`는 `readinessProbe`와 개념적으로 대응된다.
> - **graceful shutdown**: 헬스체크와 짝을 이루는 개념이다. 컨테이너가 종료될 때 `SIGTERM` 신호를 받고 진행 중인 요청을 모두 처리한 뒤 종료하는 것을 말한다. FastAPI(uvicorn)는 기본적으로 `SIGTERM`을 처리한다. Compose에서 `stop_grace_period: 30s`를 설정하면 종료 신호 후 최대 30초를 기다린다. 이 시간 안에 종료되지 않으면 강제 종료(`SIGKILL`)된다.
> - **서비스 메시 헬스체크**: Istio, Linkerd 같은 서비스 메시를 도입하면 헬스체크가 사이드카 프록시(envoy) 레벨에서 수행된다. 트래픽 분산, 재시도, 서킷 브레이커가 앱 코드 밖에서 제어된다. Compose의 `HEALTHCHECK`는 단일 호스트에서 단일 컨테이너의 준비 상태를 확인하는 단순 버전이다. 서비스 메시는 여러 호스트에 분산된 수백 개 서비스의 헬스 상태를 네트워크 레벨에서 관리한다.

##### 체크포인트

- [ ] `depends_on: - db`와 `depends_on: db: condition: service_healthy`의 차이를 설명할 수 있다
- [ ] `HEALTHCHECK`의 `interval`, `timeout`, `retries`, `start_period` 속성이 각각 무엇을 제어하는지 말할 수 있다
- [ ] `docker compose ps`와 `docker inspect`로 컨테이너의 헬스 상태를 확인할 수 있다
- [ ] vi-1-1 예제의 `docker-compose.yml`에서 `pg_isready` 헬스체크가 어떻게 레이스 컨디션을 방지하는지 설명할 수 있다
- [ ] `wait-for-it.sh`가 `service_healthy`보다 덜 정확한 이유를 설명할 수 있다

---

### VI-1-4. 로컬 개발 vs 프로덕션 Compose 분리

- **난이도**: ★★★
- **선수 지식**: VI-1-3
- **학습 목표**: 이 Section을 마치면 개발용과 프로덕션용 Compose 파일을 분리하고 필요에 따라 오버라이드할 수 있다.
- **설명**:
  개발 환경에는 소스 코드 바인드 마운트, 디버그 포트 노출, 개발용 환경변수가 필요하지만 프로덕션에서는 불필요하거나 위험하다. `compose.yml`에 공통 설정을, `compose.override.yml`에 개발 전용 설정을 넣으면 `docker compose up`이 자동으로 두 파일을 합쳐준다. 프로덕션에서는 `docker compose -f compose.yml -f compose.prod.yml up`으로 명시적으로 파일을 선택한다.
- **핵심 키워드**: `compose.override.yml`, `-f` 플래그, 파일 오버라이드, 개발/프로덕션 환경 분리
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VI-1-5

#### 본문

##### 왜 환경별 설정을 나눠야 하는가

로컬 개발과 프로덕션 서버에서 동시에 잘 동작하는 단 하나의 `compose.yml`을 만들려고 하면 파일이 점점 조건 분기와 주석으로 가득 차게 된다. 개발 환경에는 코드 변경이 즉시 반영되는 바인드 마운트, 디버거 포트, 자세한 로그가 필요하다. 반면 프로덕션 환경에는 이미지 기반 배포, 보안상 닫아야 하는 포트, 최적화된 설정이 필요하다. 이 두 가지를 한 파일에 섞으면 실수로 디버그 포트를 프로덕션 서버에 열어두거나, 바인드 마운트 경로가 서버에 없어 컨테이너 시작이 실패하는 문제가 생긴다.

해결책은 파일을 역할별로 나누는 것이다.

| 파일 | 용도 | 적용 환경 |
|:--|:--|:--|
| `compose.yml` | 모든 환경에서 공통으로 쓰는 설정 (서비스 정의, 네트워크, 볼륨 이름) | 공통 |
| `compose.override.yml` | 개발 전용 설정 (바인드 마운트, 디버그 포트, 개발 환경변수) | 개발 (자동 적용) |
| `compose.prod.yml` | 프로덕션 전용 설정 (이미지 태그 고정, 리소스 제한, 보안 설정) | 프로덕션 (명시 적용) |

Docker Compose는 `compose.override.yml` 파일이 같은 디렉터리에 있으면 `docker compose up` 실행 시 **자동으로** `compose.yml`과 합쳐준다. 개발자는 별도 명령 없이 자동으로 개발 편의 설정이 붙은 채로 실행된다.

##### compose.override.yml 작동 원리

`docker compose up`을 실행하면 내부에서 다음 두 단계가 일어난다.

1. `compose.yml`을 읽는다
2. 같은 디렉터리에 `compose.override.yml`이 있으면 그 내용을 위에 덮어씌운다(override)

덮어씌우는 규칙은 단순하다. **키가 겹치면 override 파일의 값이 이긴다**. 배열 값(`ports:`, `volumes:`)은 덮어쓰지 않고 **합쳐진다(merge)**. 예를 들어 `compose.yml`에 `ports: ["80:80"]`이 있고 `compose.override.yml`에 `ports: ["5678:5678"]`이 있으면 최종 결과는 두 포트가 모두 열린다.

합쳐진 결과를 미리 보려면 아래 명령을 쓴다.

```bash
docker compose config
```

실제로 어떤 설정이 적용되는지 확인할 수 있어서 "내 override가 제대로 먹혔나?" 디버깅에 유용하다.

##### 파일별 예시

아래는 세 파일 분리 패턴의 전형적인 예시다.

**compose.yml** — 공통 기반

```yaml
services:
  api:
    build: ./api
    environment:
      - DATABASE_URL=postgresql://app:${DB_PASSWORD}@db:5432/demo
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=demo
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d demo"]
      interval: 5s
      timeout: 3s
      retries: 5
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**compose.override.yml** — 개발 전용 (자동 적용)

```yaml
services:
  api:
    build:
      context: ./api
      target: dev          # 멀티스테이지 빌드의 dev 스테이지 사용
    volumes:
      - ./api:/app         # 소스 코드 바인드 마운트 — 코드 변경이 즉시 반영됨
    ports:
      - "8000:8000"        # 개발 중 브라우저에서 직접 API 접근
      - "5678:5678"        # 디버거 포트 (debugpy)
    environment:
      - LOG_LEVEL=debug
      - RELOAD=true

  db:
    ports:
      - "5432:5432"        # 개발 중 DB 클라이언트(TablePlus 등)로 직접 접근
```

**compose.prod.yml** — 프로덕션 전용 (명시 적용)

```yaml
services:
  api:
    image: registry.example.com/myapp-api:1.2.3  # 이미지 태그 고정
    restart: always
    environment:
      - LOG_LEVEL=warning
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512m

  db:
    restart: always
    # ports 없음 — DB를 외부에 절대 노출하지 않음
    deploy:
      resources:
        limits:
          memory: 1g
```

##### -f 플래그로 파일 명시 선택

`compose.override.yml`은 자동 적용이지만, 프로덕션처럼 파일을 직접 골라 합쳐야 할 때는 `-f` 플래그를 쓴다.

```bash
# 개발: compose.yml + compose.override.yml 자동 합쳐짐
docker compose up

# 프로덕션: compose.yml + compose.prod.yml 명시 합산
docker compose -f compose.yml -f compose.prod.yml up -d

# 결과 미리 보기 (실행하지 않고 최종 설정 출력)
docker compose -f compose.yml -f compose.prod.yml config
```

`-f`를 쓸 때는 항상 기본 파일(`compose.yml`)을 먼저 나열하고, 그 위에 덮어쓸 파일을 그 다음에 나열한다. 나열 순서가 우선순위다. 오른쪽 파일이 왼쪽 파일을 덮어쓴다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 운동선수가 연습할 때는 편한 운동복을 입고 트레이닝한다. 하지만 실제 경기(프로덕션) 무대에 설 때는 공식 유니폼을 갖춰 입는다. 두 벌 다 "입는 행위(docker compose up)"는 같지만 상황에 맞는 옷이 다르다. `compose.override.yml`은 연습복이고, `compose.prod.yml`은 경기복이다. 기본 몸(공통 설정, `compose.yml`)은 항상 동일하다.
> - **체감 예시**: 개발 중 `volumes: - ./api:/app` 바인드 마운트 덕분에 코드를 수정하면 컨테이너를 재시작하지 않아도 즉시 반영된다. 이 편리함은 개발에서만 필요하고, 프로덕션에서는 `/app` 폴더가 서버에 없어 컨테이너 시작 자체가 실패한다.
> - **주의**: `.env` 파일에 `DB_PASSWORD`를 꼭 만들어두자. `compose.yml`에 `${DB_PASSWORD}`가 있는데 `.env`가 없으면 비밀번호가 빈 문자열로 설정된다.

> **[주니어 렌즈 ★★☆]**
> - **docker compose config 활용**: override 설정이 정말 먹혔는지 확인할 때 `docker compose config | grep ports`처럼 파이프로 원하는 키를 필터링해서 보면 빠르다.
> - **우선순위 규칙 정리**: 설정 값의 우선순위는 "나중에 지정된 `-f` 파일 > 앞에 지정된 `-f` 파일 > `compose.yml`" 순이다. 배열(`volumes`, `ports`, `environment`)은 합산되고, 단일 값(`image`, `restart`, `command`)은 덮어쓴다.
> - **흔한 함정 1 — override 자동 적용 망각**: `compose.override.yml`이 있으면 `docker compose up`만 해도 자동으로 개발 설정이 붙는다. CI 서버에서 `docker compose up`을 쓴다면 `compose.override.yml`이 함께 딸려나갈 수 있다. CI에서는 `-f compose.yml -f compose.prod.yml`처럼 명시적으로 파일을 지정하는 것이 안전하다.
> - **흔한 함정 2 — 배열 합산 부작용**: `ports`는 합산이기 때문에 `compose.yml`에 이미 `5432:5432`가 있고 `compose.override.yml`에도 `5432:5432`가 있으면 포트가 중복 선언되어 오류가 난다. 공통 파일에는 배열 항목을 최소화하고, 환경별 파일에서 추가하는 방식을 유지하면 이 문제를 피할 수 있다.
> - **흔한 함정 3 — volumes 삭제 불가**: `compose.yml`에 바인드 마운트가 없더라도 `compose.override.yml`에서 추가할 수 있다. 반대로 `compose.prod.yml`에서 바인드 마운트를 삭제하는 override는 할 수 없다 — override는 추가만 하고 삭제는 못 한다. 처음부터 바인드 마운트를 `compose.override.yml`에만 두는 이유가 여기 있다.

> **[실무자 렌즈 ★★★]**
> - **CI/CD 파이프라인 연동**: GitHub Actions에서 `compose.prod.yml`을 사용하는 흐름이다. `docker compose -f compose.yml -f compose.prod.yml build`로 이미지를 빌드하고 레지스트리에 push한 뒤, 서버에서 `docker compose -f compose.yml -f compose.prod.yml pull && docker compose -f compose.yml -f compose.prod.yml up -d`로 무중단 배포한다. 파일 조합이 길어지면 `Makefile`에 `make deploy`로 추상화해두면 타이핑 실수를 줄일 수 있다.
> - **Docker Compose profiles**: Compose 1.28+부터 `profiles:` 기능이 추가됐다. 특정 서비스에 `profiles: [dev]`를 붙이면 `docker compose --profile dev up`으로 해당 서비스만 선택적으로 올릴 수 있다. override 파일 분리 없이 하나의 파일에서 환경별 서비스 켜기/끄기를 제어할 수 있어, 소규모 프로젝트에서 더 단순하게 관리하기 좋다. 파일 분리(override 방식)와 profiles는 상호 보완적으로 함께 쓸 수도 있다.
> - **Kubernetes에서의 유사 패턴**: K8s 환경에서는 `kustomize`가 같은 역할을 한다. `base/` 폴더에 공통 매니페스트를 두고, `overlays/dev/`, `overlays/prod/` 폴더에서 환경별 패치를 적용한다. Helm도 `values.yaml` + `values-prod.yaml` 패턴으로 동일한 분리 전략을 구현한다. Docker Compose의 override 개념을 이해하면 Helm이나 kustomize로 넘어갈 때 사고 방식이 그대로 이어진다.

##### 체크포인트

- [ ] `compose.override.yml`이 존재할 때 `docker compose up`을 실행하면 어떤 파일들이 합쳐지는지 설명할 수 있다
- [ ] `docker compose config`로 개발 환경에서 최종 합쳐진 설정을 미리 확인할 수 있다
- [ ] `docker compose -f compose.yml -f compose.prod.yml up -d` 명령을 실행하고 어떤 파일 조합이 적용됐는지 확인할 수 있다
- [ ] override에서 배열(`ports`, `volumes`)은 합산되고, 단일 값(`image`, `restart`)은 덮어쓰인다는 차이를 설명할 수 있다
- [ ] `compose.override.yml`에만 바인드 마운트를 두어야 하는 이유와 CI 서버에서 override 자동 적용 함정을 피하는 방법을 설명할 수 있다

---

### VI-1-5. 로그 수집과 `docker logs`

- **난이도**: ★★★
- **선수 지식**: VI-1-4
- **학습 목표**: 이 Section을 마치면 실행 중인 컨테이너의 로그를 확인하고, 로그 드라이버를 설정할 수 있다.
- **설명**:
  컨테이너가 stdout/stderr로 출력하는 내용은 `docker logs <컨테이너ID>`로 확인할 수 있다. `-f` 옵션을 붙이면 실시간으로 스트리밍된다(`tail -f`와 유사). Docker는 기본으로 json-file 로그 드라이버를 사용해 로그를 호스트 디스크에 저장한다. 로그가 무한히 쌓이지 않도록 `max-size`와 `max-file` 옵션으로 용량을 제한하는 것이 운영 필수다. Compose에서는 `logging:` 블록으로 서비스마다 설정할 수 있다. 대규모 환경에서는 fluentd나 loki 드라이버로 중앙화된 로그 수집 시스템에 연결한다.
- **핵심 키워드**: `docker logs`, `-f`, json-file 드라이버, `max-size`, `max-file`, fluentd, Loki
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VI-1-6

#### 본문

##### 컨테이너 로그가 중요한 이유

컨테이너는 프로세스가 종료되면 내부 상태를 모두 잃는다. 문제가 생겨서 컨테이너가 죽으면 이미 안에 들어가서 확인할 수 없다. 로그만이 "그 순간 무슨 일이 있었는지" 알려주는 유일한 단서다.

Docker는 컨테이너가 `stdout`(표준 출력)과 `stderr`(표준 에러)로 내보내는 내용을 모두 캡처한다. 그 내용을 `docker logs` 명령으로 꺼내볼 수 있다. 때문에 컨테이너 안에서 돌아가는 애플리케이션은 파일에 로그를 쓰는 대신 **반드시 `stdout`/`stderr`로 출력**해야 한다. 이것이 컨테이너 세계의 기본 규칙이다.

##### docker logs 주요 옵션

| 옵션 | 의미 | 예시 |
|:--|:--|:--|
| (없음) | 전체 로그 출력 후 종료 | `docker logs myapp` |
| `-f` | 실시간 스트리밍 (follow) | `docker logs -f myapp` |
| `--tail N` | 마지막 N줄만 출력 | `docker logs --tail 50 myapp` |
| `--since 시간` | 특정 시간 이후 로그만 출력 | `docker logs --since 10m myapp` |
| `--until 시간` | 특정 시간 이전 로그만 출력 | `docker logs --until 2026-04-23T12:00:00 myapp` |
| `-t` | 타임스탬프를 함께 출력 | `docker logs -t myapp` |

`--since`와 `--tail`은 함께 쓸 수 있다.

```bash
# 최근 10분간 로그 중 마지막 100줄만 보기
docker logs --since 10m --tail 100 myapp

# 타임스탬프와 함께 실시간 추적
docker logs -f -t myapp
```

Compose를 쓸 때는 `docker compose logs`로 **여러 서비스를 한 번에 볼 수 있다**.

```bash
# 모든 서비스 로그 실시간 추적
docker compose logs -f

# api 서비스만 추적
docker compose logs -f api

# api와 db 두 서비스만 추적
docker compose logs -f api db
```

##### 로그 드라이버 비교

Docker는 로그를 어디에 어떤 형식으로 저장할지 "로그 드라이버"로 결정한다. 기본값은 `json-file`이다.

| 드라이버 | 저장 위치 | 특징 | 권장 상황 |
|:--|:--|:--|:--|
| `json-file` | 호스트 디스크(`/var/lib/docker/containers/`) | 기본값, `docker logs` 명령 사용 가능 | 개발·소규모 운영 |
| `syslog` | 호스트 syslog 데몬 | 운영 체제 로그 시스템과 통합 | Linux 서버 직접 관리 |
| `journald` | systemd journal | `journalctl`로 조회 가능 | systemd 기반 Linux |
| `fluentd` | Fluentd 수집기 | 구조화 전송, 다양한 목적지 지원 | 대규모 중앙 수집 |
| `loki` | Grafana Loki | 레이블 기반 쿼리, Grafana 연동 | Grafana 스택 사용 환경 |
| `none` | 없음 | 로그 완전 비활성화 | 로그가 전혀 불필요한 경우 |

`json-file`과 `journald` 드라이버만 `docker logs` 명령을 지원한다. `fluentd`나 `loki`로 바꾸면 `docker logs`가 동작하지 않으니, 개발 환경에서는 `json-file`을 유지하고 프로덕션에서만 중앙 수집 드라이버를 설정하는 이유가 여기 있다.

##### json-file 드라이버의 용량 제한

`json-file` 드라이버는 기본적으로 용량 제한이 없다. 활발히 로그를 찍는 서비스가 오래 돌면 디스크를 가득 채울 수 있다. 실제로 운영 서버에서 발생하는 디스크 풀(disk full) 장애 중 상당수가 로그 파일 무한 증가다.

이를 막으려면 `max-size`와 `max-file`을 설정한다.

- `max-size`: 파일 하나의 최대 크기. 이 크기를 넘으면 새 파일을 만든다(로테이션).
- `max-file`: 유지할 파일 최대 개수. 개수를 초과하면 가장 오래된 파일을 삭제한다.

예를 들어 `max-size: "10m"`, `max-file: "3"`으로 설정하면 최대 30 MB의 로그만 유지된다.

##### Compose logging: 블록 설정

Compose에서는 서비스별로 `logging:` 블록을 추가한다.

```yaml
services:
  api:
    image: myapp:latest
    logging:
      driver: json-file        # 로그 드라이버 지정 (기본값이지만 명시 권장)
      options:
        max-size: "10m"        # 파일 하나 최대 10 MB
        max-file: "3"          # 최대 3개 파일 유지 (총 30 MB)

  worker:
    image: myworker:latest
    logging:
      driver: json-file
      options:
        max-size: "5m"
        max-file: "5"          # 워커는 더 많은 파일, 더 작은 크기
```

**fluentd 드라이버 예시** — 중앙 로그 수집기에 전송:

```yaml
services:
  api:
    image: myapp:latest
    logging:
      driver: fluentd
      options:
        fluentd-address: localhost:24224   # Fluentd 수집기 주소
        tag: myapp.api                    # 로그 태그 (라우팅에 사용)
        fluentd-async: "true"             # 비동기 전송 — 수집기 장애가 앱에 영향 안 줌
```

**Loki 드라이버 예시** — Grafana 스택 연동:

```yaml
services:
  api:
    image: myapp:latest
    logging:
      driver: loki
      options:
        loki-url: "http://loki:3100/loki/api/v1/push"
        loki-labels: "job=myapp,env=prod"
```

Loki 드라이버는 Docker 기본 탑재가 아니라 플러그인을 별도로 설치해야 한다.

```bash
docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: 컨테이너 로그는 CCTV 녹화 영상이다. 가게(컨테이너) 안에서 무슨 일이 일어났는지 나중에 확인하려면 CCTV(docker logs)가 있어야 한다. 문제는 녹화 용량(`max-size`/`max-file`)을 설정하지 않으면 하드디스크가 꽉 찬다는 것이다. 마치 CCTV를 덮어쓰기 설정 없이 무한 녹화하면 저장 장치가 가득 차는 것과 같다.
> - **체감 예시**: 컨테이너가 갑자기 죽었다. `docker logs myapp | tail -50`으로 죽기 직전 마지막 50줄을 보면 에러 메시지가 대부분 나온다. 이 명령 하나가 "로그를 남겨야 하는 이유"를 직접 보여준다.
> - **주의**: 앱이 파일에 로그를 기록한다면 `docker logs`로는 볼 수 없다. 이럴 때는 `docker exec -it myapp tail -f /var/log/app.log`처럼 컨테이너 안으로 들어가야 한다. 하지만 컨테이너가 죽은 뒤에는 exec도 안 된다 — 처음부터 `stdout`으로 출력하도록 앱을 설정하는 것이 정답이다.

> **[주니어 렌즈 ★★☆]**
> - **`--since`/`--tail` 필터링 조합**: 장애 대응 시 `docker logs --since 5m --tail 200 myapp 2>&1 | grep -i error`처럼 사용하면 최근 5분 로그에서 에러만 빠르게 골라낼 수 있다. `2>&1`은 stderr까지 함께 grep하기 위한 리다이렉션이다.
> - **docker compose logs 여러 서비스 동시 확인**: `docker compose logs -f api db nginx`처럼 서비스 이름을 나열하면 여러 서비스 로그가 색상으로 구분되어 한 화면에 표시된다. 어느 서비스가 먼저 에러를 냈는지 타임라인으로 바로 볼 수 있다.
> - **로그 폭증 시 대처**: 갑작스러운 트래픽 폭증이나 버그로 로그가 초당 수백 줄씩 쌓이는 경우가 있다. `max-size`/`max-file` 없이 운영하다 디스크가 꽉 차면 DB 쓰기가 실패하고 서비스 전체가 멈춘다. 최소한 `max-size: "10m"`, `max-file: "5"`는 모든 서비스에 기본 설정해두는 것이 안전하다.
> - **로그 드라이버 변경 주의**: 드라이버를 바꾸려면 컨테이너를 삭제하고 다시 만들어야 한다 (`docker compose down` 후 `docker compose up`). 실행 중인 컨테이너의 드라이버는 변경할 수 없다.

> **[실무자 렌즈 ★★★]**
> - **중앙 로그 수집 (fluentd/Loki/ELK)**: 서버가 여러 대가 되면 각 서버에서 `docker logs`를 따로 보는 것은 비효율적이다. Fluentd(수집) → Elasticsearch(저장) → Kibana(시각화) 스택(EFK), 또는 Promtail(수집) → Loki(저장) → Grafana(시각화) 스택을 구축하면 모든 컨테이너 로그를 한 대시보드에서 검색·필터할 수 있다. Loki는 Prometheus와 동일한 레이블 개념을 사용해 Grafana와 자연스럽게 연동된다.
> - **구조화 로그 (JSON)**: 앱이 로그를 일반 텍스트 대신 JSON으로 출력하면 중앙 수집 시스템에서 필드별 검색이 가능해진다. 예를 들어 `{"level":"error","user_id":42,"message":"payment failed","duration_ms":1200}` 형태로 출력하면 `user_id=42`이면서 `level=error`인 로그만 필터링할 수 있다. Python은 `structlog`, Node.js는 `pino`가 구조화 로그를 쉽게 구현한다.
> - **로그 레벨 전략**: 개발 환경에서는 `DEBUG`, 프로덕션에서는 `WARNING` 이상만 출력하도록 환경변수로 제어한다. 프로덕션에서 DEBUG 로그를 켜두면 성능 저하와 디스크 낭비가 동시에 발생한다. `LOG_LEVEL=warning`을 `compose.prod.yml`의 environment에 두고 `compose.override.yml`에서는 `LOG_LEVEL=debug`로 덮어쓰는 패턴이 표준이다.
> - **로그 기반 알림**: Grafana Loki에서 특정 패턴(예: `level=error`)이 감지되면 Alertmanager나 Slack webhook으로 알림을 보낼 수 있다. APM(Application Performance Monitoring) 도구와 연동하면 로그 이상 증가 → 자동 알림 → 자동 스케일아웃 파이프라인도 구성 가능하다.

##### 체크포인트

- [ ] `docker logs -f myapp`으로 실행 중인 컨테이너의 로그를 실시간으로 추적할 수 있다
- [ ] `docker logs --since 5m --tail 100 myapp`으로 최근 5분 로그 중 마지막 100줄만 볼 수 있다
- [ ] `logging:` 블록에 `max-size: "10m"`, `max-file: "3"`을 설정해 로그 파일이 최대 30 MB를 넘지 않도록 제한할 수 있다
- [ ] `docker compose logs -f api db`로 두 서비스의 로그를 한 화면에서 함께 볼 수 있다
- [ ] `json-file` 드라이버에서 `docker logs`가 동작하지만, `fluentd`나 `loki` 드라이버로 바꾸면 `docker logs`를 쓸 수 없다는 차이를 설명할 수 있다

---

### VI-1-6. 리소스 제한 (CPU·메모리 limit)

- **난이도**: ★★★
- **선수 지식**: VI-1-5
- **학습 목표**: 이 Section을 마치면 컨테이너가 사용하는 CPU와 메모리를 제한해 다른 서비스에 영향을 주지 않도록 설정할 수 있다.
- **설명**:
  제한이 없는 컨테이너는 메모리 누수나 트래픽 폭증 시 호스트 전체를 점유할 수 있다. `docker run --memory=512m --cpus=1.0 myapp`처럼 실행 시 제한하거나, Compose의 `deploy.resources.limits` 블록으로 선언한다. `docker stats`로 실시간 CPU·메모리 사용량을 확인할 수 있다. OOM(Out of Memory) Killer가 컨테이너를 강제 종료하면 `docker inspect`의 `OOMKilled` 필드가 true로 나타난다. 이 신호를 보면 메모리 한도를 늘리거나 앱의 메모리 누수를 찾아야 한다.
- **핵심 키워드**: `--memory`, `--cpus`, `deploy.resources`, `docker stats`, OOMKilled
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VII-1-1

#### 본문

##### 리소스 제한이 필요한 이유

컨테이너는 기본적으로 호스트 머신의 CPU와 메모리를 무제한으로 사용할 수 있다. 서버에 컨테이너가 하나뿐이라면 큰 문제가 없다. 하지만 실제 서버에는 api, db, nginx, 모니터링 에이전트처럼 여러 컨테이너가 함께 실행된다. 이때 한 컨테이너가 메모리 누수나 트래픽 폭증으로 메모리를 다 써버리면 다른 컨테이너들이 메모리를 할당받지 못해 줄줄이 강제 종료된다. CPU 독점이 일어나면 같은 호스트의 다른 서비스 응답 속도가 크게 느려진다.

리소스 제한은 세 가지 이유에서 설정해야 한다.

첫째, **장애 격리**다. 특정 컨테이너에 문제가 생겨도 다른 컨테이너에 영향을 주지 않는다. 한 서비스가 죽어도 서버 전체가 다운되지 않는다.

둘째, **예측 가능한 성능**이다. 각 서비스가 "최대 이만큼 쓸 수 있다"는 상한선이 있으면 리소스 경합이 줄고 응답 시간이 안정된다.

셋째, **K8s 전환 준비**다. Kubernetes는 리소스 requests/limits를 필수로 관리한다. Compose에서 미리 적절한 값을 파악해두면 K8s 이전이 훨씬 수월해진다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 뷔페 식당에서 1인당 접시 수를 제한하는 것과 같다. 제한이 없으면 한 사람이 접시를 수십 개 쌓아 다른 손님이 먹을 음식이 없어진다. 컨테이너도 마찬가지다. 리소스 제한은 "이 컨테이너는 메모리 512MB, CPU는 1코어까지만 쓸 수 있다"고 선을 긋는 것이다.
> - **체감 예시**: 노트북에서 `docker run` 명령으로 컨테이너를 실행하면서 크롬 브라우저를 함께 사용할 때, 컨테이너가 메모리를 무제한으로 쓰면 노트북 전체가 느려진다. `--memory=512m` 제한을 걸면 컨테이너가 512MB 이상 쓰려 할 때 컨테이너가 종료될지언정, 노트북은 정상 동작을 유지한다.
> - **주의**: 제한을 너무 낮게 잡으면 앱이 정상 동작 중에도 메모리 부족으로 강제 종료된다. 처음에는 제한 없이 실행해 `docker stats`로 실제 사용량을 확인한 뒤 적정값을 설정하자.

##### `docker run` vs Compose 리소스 설정 비교

리소스 제한은 `docker run` 명령 옵션과 Compose의 `deploy.resources` 블록 두 가지 방법으로 설정한다.

| 항목 | `docker run` 옵션 | Compose `deploy.resources` |
|:--|:--|:--|
| 메모리 상한 | `--memory=512m` | `limits.memory: 512m` |
| 메모리 예약(soft limit) | `--memory-reservation=256m` | `reservations.memory: 256m` |
| CPU 코어 수 | `--cpus=1.0` | `limits.cpus: "1.0"` |
| CPU 예약 | `--cpu-shares=512` | `reservations.cpus: "0.5"` |
| swap 포함 메모리 상한 | `--memory-swap=1g` | 별도 설정 없음 |
| 적용 시점 | 컨테이너 실행 시 | `docker compose up` 시 |

`limits`는 "이 이상은 절대 쓸 수 없다"는 하드 상한이다. `reservations`는 "최소 이만큼은 보장해달라"는 소프트 하한이다. 두 가지를 함께 설정하면 최소 보장과 최대 제한이 모두 적용된다.

**`docker run` 예시:**

```bash
docker run -d \
  --name api \
  --memory=512m \
  --memory-reservation=256m \
  --cpus=1.0 \
  myapp:latest
```

**Compose `deploy.resources` 블록:**

```yaml
services:
  api:
    image: myapp:latest
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512m
        reservations:
          cpus: "0.25"
          memory: 256m

  db:
    image: postgres:16-alpine
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 1g
        reservations:
          memory: 512m
```

메모리 단위는 숫자 뒤에 `m`(메가바이트) 또는 `g`(기가바이트)를 붙인다. `512m`은 512MB, `1g`는 1GB다. CPU는 소수로 표현하고 반드시 따옴표로 감싼다(`"1.0"`). 따옴표 없이 `1.0`을 쓰면 YAML이 숫자로 파싱해 문제가 생길 수 있다.

> **[주니어 렌즈 ★★☆]**
> - **메모리 단위 정리**: `b`(바이트), `k`(킬로바이트), `m`(메가바이트), `g`(기가바이트) 단위를 쓴다. `512m`과 `536870912b`는 같은 값이다. 실무에서는 `m`과 `g`만 쓴다.
> - **swap 메모리 주의**: `--memory=512m`만 설정하면 Docker는 기본적으로 swap도 같은 크기(512m)를 추가로 허용한다. 즉 실제 총 메모리 사용 가능량은 1024m이 된다. swap을 아예 막으려면 `--memory-swap=512m`으로 memory와 동일하게 설정한다(`--memory-swap=-1`은 무제한 swap 허용). Compose에서는 `deploy.resources`에 swap 제어가 없으므로 swap을 세밀하게 제어해야 하면 `docker run`을 써야 한다.
> - **OOMKilled 확인법**: 컨테이너가 갑자기 종료됐을 때 `docker inspect <컨테이너명> --format '{{.State.OOMKilled}}'` 명령으로 OOM으로 죽었는지 확인한다. `true`가 나오면 메모리 한도를 늘리거나 앱의 메모리 누수를 점검해야 한다. `docker inspect`의 전체 JSON을 보려면 `docker inspect <컨테이너명>`으로 `State` 객체 전체를 확인한다.
> - **CPU 비율 의미**: `--cpus=1.0`은 CPU 코어 1개 분량의 연산을 사용할 수 있다는 뜻이다. 2코어 서버에서 `--cpus=0.5`를 설정하면 어느 코어를 쓰든 상관없이 전체 CPU 용량의 50%까지 쓸 수 있다. 특정 코어를 고정하려면 `--cpuset-cpus=0,1` 옵션을 쓴다.

##### `docker stats`로 실시간 사용량 확인

제한을 설정하기 전에, 또는 설정 후 효과를 확인할 때 `docker stats` 명령으로 실시간 사용량을 볼 수 있다.

```bash
# 모든 실행 중 컨테이너 실시간 모니터링
docker stats

# 특정 컨테이너만 보기
docker stats api db

# 한 번만 출력하고 종료 (스크립트에서 활용)
docker stats --no-stream
```

`docker stats` 출력 예시:

```
CONTAINER ID   NAME    CPU %   MEM USAGE / LIMIT     MEM %   NET I/O          BLOCK I/O
a1b2c3d4e5f6   api     12.3%   210MiB / 512MiB       41.0%   1.2MB / 800kB    0B / 4.1MB
b2c3d4e5f6a1   db      2.1%    384MiB / 1GiB         37.5%   200kB / 1.5MB    2MB / 8.3MB
c3d4e5f6a1b2   nginx   0.1%    8.5MiB / 512MiB       1.7%    5MB / 3.2MB      0B / 0B
```

각 컬럼의 의미:

| 컬럼 | 의미 |
|:--|:--|
| `CPU %` | 현재 CPU 사용률. 리소스 제한 기준이 아닌 호스트 전체 CPU 대비 비율 |
| `MEM USAGE / LIMIT` | 현재 메모리 사용량 / 설정된 메모리 상한 |
| `MEM %` | (MEM USAGE / LIMIT) × 100 |
| `NET I/O` | 네트워크 수신 / 송신 누적량 |
| `BLOCK I/O` | 디스크 읽기 / 쓰기 누적량 |

`MEM USAGE / LIMIT`에서 LIMIT이 `512MiB`처럼 설정값과 같으면 제한이 적용된 것이다. 만약 LIMIT이 큰 숫자(예: `7.77GiB`)로 나타나면 메모리 제한이 설정되지 않은 것이다(호스트 전체 메모리가 한도로 표시됨).

##### OOMKilled 진단과 대응

OOM(Out of Memory) Killer는 리눅스 커널 기능으로, 메모리가 한도를 초과한 컨테이너 프로세스를 강제 종료(kill)한다. 컨테이너 관점에서 갑자기 죽은 것처럼 보이기 때문에 원인을 모르면 당황스럽다.

**OOMKilled 발생 흐름:**

```
컨테이너 메모리 사용량이 limits.memory 초과
    │
    └─ 리눅스 커널 OOM Killer 동작
          │
          └─ 컨테이너 프로세스 SIGKILL 전송 → 강제 종료
                │
                └─ docker inspect에 OOMKilled: true 기록
```

**진단 절차:**

```bash
# 1. 컨테이너 상태 확인 (종료 후 목록에 남아 있음)
docker ps -a

# 2. OOMKilled 여부 확인
docker inspect <컨테이너명> --format '{{.State.OOMKilled}}'

# 3. 종료 코드 확인 (137이면 SIGKILL로 강제 종료)
docker inspect <컨테이너명> --format '{{.State.ExitCode}}'

# 4. 최근 로그 확인 (종료 직전 로그)
docker logs --tail 50 <컨테이너명>
```

종료 코드 137은 SIGKILL(코드 9)로 종료됐다는 뜻이다(`128 + 9 = 137`). OOMKilled가 `true`이고 종료 코드가 137이면 메모리 부족으로 강제 종료된 것이 확실하다.

**대응 방법:**

| 상황 | 대응 |
|:--|:--|
| 한도가 실제 사용량보다 너무 낮게 설정됨 | `docker stats --no-stream`으로 정상 동작 시 최고 사용량 확인 후 한도를 1.5~2배로 설정 |
| 앱에 메모리 누수가 있음 | `docker stats`로 시간이 지날수록 메모리가 계속 증가하는지 확인. 애플리케이션 코드 점검 |
| 일시적 트래픽 폭증 | 한도를 높이거나 replica 수를 늘려 부하를 분산 |

> **[실무자 렌즈 ★★★]**
> - **K8s requests/limits 매핑**: Compose의 `deploy.resources`와 K8s의 `resources` 필드는 개념이 같다. Compose의 `reservations`는 K8s의 `requests`(스케줄링 기준, 최소 보장)에, `limits`는 K8s의 `limits`(하드 상한)에 직접 매핑된다. Compose에서 적정값을 파악해두면 K8s 매니페스트 작성 시 그 값을 그대로 옮겨 쓸 수 있다. K8s에서는 `requests` 없이 `limits`만 설정하면 `requests`가 `limits`와 동일하게 자동 설정된다.
> - **수직 오토스케일링(VPA)**: Kubernetes의 Vertical Pod Autoscaler는 파드의 실제 메모리·CPU 사용량을 관찰해 `requests`/`limits` 값을 자동으로 조정해준다. 초기 설정값을 잘 모를 때 VPA의 `Off` 모드(권장값만 제시, 자동 적용 없음)로 적정 값을 파악하는 용도로 활용한다.
> - **수평 오토스케일링(HPA)**: Horizontal Pod Autoscaler는 CPU/메모리 사용률이 목표치를 넘으면 파드 수를 늘리고, 내려가면 줄인다. HPA가 올바르게 동작하려면 `requests`가 반드시 설정돼 있어야 한다. `requests`를 기준으로 "현재 몇 % 사용 중인가"를 계산하기 때문이다. Compose 단계에서 적절한 `reservations`를 설정해두는 습관이 HPA 설정 시 도움이 된다.
> - **cgroup v2**: 리눅스 커널 4.5+부터 제공되는 cgroup v2는 CPU와 메모리 제한을 더 정교하게 제어한다. 특히 메모리 압력(memory pressure) 상황에서 프로세스를 강제 종료하기 전에 캐시를 먼저 해제하는 등 더 스마트하게 동작한다. Docker Desktop(Mac, Windows)은 내부 리눅스 VM이 cgroup v2를 사용한다. 리눅스 서버에서는 OS 버전에 따라 cgroup v1/v2 여부가 다를 수 있으므로 `cat /sys/fs/cgroup/cgroup.controllers` 파일로 버전을 확인한다.

##### 체크포인트

- [ ] `docker run --memory=512m --cpus=1.0` 명령으로 메모리와 CPU가 제한된 컨테이너를 실행할 수 있다
- [ ] Compose 파일에 `deploy.resources.limits`와 `reservations` 블록을 작성하고 차이를 설명할 수 있다
- [ ] `docker stats`의 `MEM USAGE / LIMIT` 컬럼을 보고 제한이 올바르게 적용됐는지 확인할 수 있다
- [ ] `docker inspect <컨테이너명> --format '{{.State.OOMKilled}}'` 명령으로 컨테이너가 메모리 부족으로 종료됐는지 확인할 수 있다
- [ ] OOMKilled가 발생했을 때 종료 코드 137의 의미와 대응 방법 두 가지를 설명할 수 있다

---

## Part VII. 레지스트리·프로덕션

### VII-1-1. Docker Hub / GitHub Container Registry 사용

- **난이도**: ★★★
- **선수 지식**: VI-1-4
- **학습 목표**: 이 Section을 마치면 자신이 빌드한 이미지를 레지스트리에 push하고 서버에서 pull할 수 있다.
- **설명**:
  이미지를 레지스트리에 올리면 어느 서버에서든 `docker pull`로 내려받아 실행할 수 있다. Docker Hub는 무료 계정으로 공개 이미지를 무제한 저장할 수 있다. GitHub Container Registry(ghcr.io)는 GitHub 저장소와 연동되어 GitHub Actions에서 자동 push하기 쉽다. 이미지를 push하기 전에 `docker login`으로 인증하고, `docker tag`로 레지스트리 주소를 포함한 이름으로 태그를 붙인다.
- **핵심 키워드**: `docker login`, `docker tag`, `docker push`, ghcr.io, ECR, Artifact Registry
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VII-1-2

#### 본문

##### 레지스트리란 무엇인가

레지스트리(Registry)는 Docker 이미지를 저장하고 배포하는 원격 저장소다. `docker build`로 만든 이미지는 기본적으로 빌드한 로컬 머신에만 존재한다. 다른 서버나 팀원의 컴퓨터에서 그 이미지를 쓰려면 어딘가 공통으로 접근할 수 있는 곳에 올려야 한다. 레지스트리가 그 역할을 한다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 클라우드 사진첩(Google Photos, iCloud)과 같다. 내 폰에서 찍은 사진을 클라우드에 올려두면 다른 기기에서 언제든 내려받을 수 있다. Docker 이미지도 마찬가지다. 내 노트북에서 빌드한 이미지를 레지스트리에 올려두면 서버에서 `docker pull` 한 줄로 내려받아 실행할 수 있다.
> - **체감 예시**: 팀원이 "내 로컬에서는 잘 되는데 서버에서 안 돼요"라는 상황을 레지스트리가 해결한다. 이미지를 레지스트리에 올리면 모두가 같은 이미지를 쓰게 되어 환경 차이가 사라진다.
> - **주의**: `docker push` 전에 반드시 `docker login`으로 인증해야 한다. 인증 없이 push하면 `denied: access forbidden` 오류가 난다.

주요 레지스트리 서비스는 다음과 같다.

| 레지스트리 | 주소 | 특징 |
|:--|:--|:--|
| Docker Hub | `docker.io` (기본값) | 가장 널리 쓰이는 공개 레지스트리. 무료 계정은 공개 이미지 무제한, 비공개 이미지 1개 |
| GitHub Container Registry (GHCR) | `ghcr.io` | GitHub 저장소·Actions와 통합. 비공개 이미지 무료 |
| AWS ECR | `<계정>.dkr.ecr.<리전>.amazonaws.com` | AWS IAM 기반 인증. ECS/EKS와 연동 |
| GCP Artifact Registry | `<리전>-docker.pkg.dev` | Google Cloud 네이티브. GKE와 연동 |
| 자체 호스팅 | `registry:2` | Docker Registry 컨테이너로 직접 운영 |

##### Docker Hub 사용: login → tag → push → pull

Docker Hub는 별도 설정 없이 바로 사용할 수 있다. 순서는 네 단계다.

**1단계: Docker Hub 로그인**

```bash
docker login
# Username: [Docker Hub 아이디]
# Password: [Docker Hub 비밀번호 또는 액세스 토큰]
```

비밀번호 대신 Docker Hub에서 발급한 **액세스 토큰**을 쓰는 것이 보안상 권장된다. Docker Hub → Account Settings → Security → New Access Token에서 발급한다. 토큰에 권한 범위(Read, Write 등)를 지정할 수 있어 비밀번호 노출 위험을 줄인다.

**2단계: 이미지에 레지스트리 주소 포함 태그 붙이기**

Docker Hub에 올리려면 이미지 이름이 `[사용자명]/[이미지명]:[태그]` 형식이어야 한다.

```bash
# 기존 이미지에 Docker Hub용 태그 추가
docker tag myapp:latest myusername/myapp:latest

# 빌드 시 바로 태그 지정
docker build -t myusername/myapp:1.0.0 .
```

**3단계: 레지스트리에 push**

```bash
docker push myusername/myapp:latest
docker push myusername/myapp:1.0.0
```

**4단계: 어느 서버에서든 pull**

```bash
docker pull myusername/myapp:latest
docker run -d -p 8000:8000 myusername/myapp:latest
```

##### GitHub Container Registry(GHCR) 사용

GHCR은 GitHub 저장소와 연동되어 GitHub Actions에서 자동 push하기 가장 편한 레지스트리다. 비공개 이미지도 GitHub 무료 계정에서 사용할 수 있다.

**GHCR Personal Access Token(PAT) 발급:**

GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) 에서 새 토큰을 만든다. 권한은 `write:packages`, `read:packages`, `delete:packages`를 선택한다.

```bash
# GHCR 로그인
echo $GITHUB_TOKEN | docker login ghcr.io -u [github-username] --password-stdin

# 이미지 태그 — ghcr.io/[github-username-or-org]/[이미지명]:[태그]
docker tag myapp:latest ghcr.io/myusername/myapp:latest

# push
docker push ghcr.io/myusername/myapp:latest
```

`--password-stdin`은 터미널에 토큰이 그대로 노출되지 않도록 stdin에서 읽는 방식이다. 스크립트나 CI 환경에서 반드시 이 방식을 사용한다.

GHCR에 올린 이미지는 기본적으로 비공개다. GitHub 저장소 Settings → Packages에서 접근 권한을 설정한다.

> **[주니어 렌즈 ★★☆]**
> - **push 전 확인**: `docker images`로 태그가 올바르게 붙었는지 확인한 뒤 push한다. `docker push`는 레이어 단위로 업로드하므로, 이전에 같은 레이어를 올린 적 있으면 `Layer already exists` 메시지와 함께 건너뛴다.
> - **`docker login` 정보 저장 위치**: 로그인 정보는 `~/.docker/config.json`에 base64로 인코딩되어 저장된다. base64는 암호화가 아니므로 이 파일이 유출되면 레지스트리 접근 권한이 노출된다. CI 환경에서는 환경 변수로만 전달하고 파일에 저장하지 않는다. Docker credential helper(`docker-credential-*`)를 설치하면 OS의 키체인에 안전하게 저장할 수 있다.
> - **멀티 레지스트리 로그인**: 여러 레지스트리에 동시에 로그인할 수 있다. `docker login docker.io`, `docker login ghcr.io`, `docker login [ECR주소]`를 각각 실행하면 된다. `~/.docker/config.json`에 레지스트리별로 인증 정보가 저장된다.

> **[실무자 렌즈 ★★★]**
> - **AWS ECR**: ECR은 IAM 기반 인증을 사용한다. `aws ecr get-login-password` 명령으로 임시 토큰을 받아 `docker login`에 전달한다. 토큰은 12시간 유효하므로 CI에서는 빌드 시작 시 항상 재발급해야 한다.
>
>   ```bash
>   aws ecr get-login-password --region ap-northeast-2 | \
>     docker login --username AWS --password-stdin \
>     123456789.dkr.ecr.ap-northeast-2.amazonaws.com
>   ```
>
> - **이미지 미러링**: 공개 이미지(Docker Hub의 `nginx`, `postgres` 등)를 그대로 쓰면 Docker Hub의 rate limit(무료 계정: 6시간에 200회 pull)에 걸릴 수 있다. 프로덕션에서는 자주 쓰는 베이스 이미지를 ECR이나 GHCR에 미러링해두고 그곳에서 pull한다. CI/CD에서도 Docker Hub 대신 내부 미러를 쓰면 빌드 실패 위험을 줄일 수 있다.
> - **접근 제어**: ECR은 리포지토리별 IAM 정책으로 push/pull 권한을 분리할 수 있다. 빌드 서버에는 `ecr:GetAuthorizationToken`과 `ecr:BatchCheckLayerAvailability`, `ecr:PutImage` 권한만 부여하고, 운영 서버에는 `ecr:GetDownloadUrlForLayer`와 `ecr:BatchGetImage`(pull 전용) 권한만 부여하는 것이 최소 권한 원칙이다.

##### 체크포인트

- [ ] `docker login`, `docker tag`, `docker push`, `docker pull` 명령을 순서대로 실행해서 Docker Hub에 이미지를 올리고 다른 터미널에서 내려받을 수 있다
- [ ] Docker Hub 이미지 이름의 형식(`사용자명/이미지명:태그`)을 설명할 수 있다
- [ ] GHCR에 이미지를 push할 때 필요한 PAT 권한(`write:packages`)을 알고, `--password-stdin` 방식으로 로그인할 수 있다
- [ ] `docker login` 인증 정보가 저장되는 위치와 CI 환경에서 주의해야 하는 이유를 설명할 수 있다
- [ ] Docker Hub, GHCR, ECR 중 자신이 사용 중인 환경에 맞는 레지스트리를 선택하고 이유를 설명할 수 있다

### VII-1-2. 이미지 태깅 전략 (semver, latest, sha)

- **난이도**: ★★★
- **선수 지식**: VII-1-1
- **학습 목표**: 이 Section을 마치면 프로덕션 배포에서 `latest` 태그를 피해야 하는 이유를 설명하고 대안을 적용할 수 있다.
- **설명**:
  `latest` 태그는 편하지만 위험하다. `latest`를 pull하면 그 시점의 가장 최신 이미지가 내려오는데, 의도치 않은 버전이 배포될 수 있다. 실무에서는 세 가지 태깅 전략을 조합한다. semver(1.2.3)로 릴리스 버전을 명시하고, Git 커밋 SHA(a1b2c3d)로 정확한 빌드를 추적하고, 브랜치명(main, release)으로 의미를 부여한다. CI/CD 파이프라인에서 자동으로 여러 태그를 동시에 붙이는 것이 표준이다.
- **핵심 키워드**: `latest` 태그, semver, Git SHA 태그, `docker tag`, 이미지 불변성
- **시각화 연결**: [visualizations/vii-1-2_tagging_strategy.html](visualizations/vii-1-2_tagging_strategy.html) (이미지 태깅 전략 4단계 시각화)
- **다음 섹션**: VII-1-3

#### 본문

##### `latest` 태그의 함정

`latest` 태그는 "가장 최신 이미지"를 가리키도록 관례적으로 쓰이는 이름이다. 편하지만 **예측 불가능하다**는 치명적인 단점이 있다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 보고서 파일 이름에 날짜를 안 붙이는 것과 같다. `report_final.docx`, `report_final2.docx`, `report_진짜최종.docx` — 어느 파일이 실제 최종본인지 모른다. 날짜와 버전 번호를 붙이면(`report_2026-04-23_v1.2.docx`) 어느 시점의 파일인지 명확해진다. 이미지 태그도 마찬가지다.
> - **체감 예시**: 서버에서 `docker pull myapp:latest`를 실행했을 때 어제 올린 이미지가 내려올 수도 있고, 방금 누군가 올린 이미지가 내려올 수도 있다. 배포 시점에 무슨 코드가 실행될지 태그 이름만으로는 보장할 수 없다.
> - **주의**: `latest`는 Docker가 특별하게 관리하는 태그가 아니다. `docker push myapp`처럼 태그를 생략하면 자동으로 `latest`가 붙을 뿐이다. Docker가 자동으로 최신 이미지를 `latest`로 갱신하지 않는다.

`latest` 태그의 구체적인 문제:

1. **재현 불가**: 3개월 전에 배포한 이미지를 그대로 다시 올리기 어렵다. `latest`는 항상 현재 시점의 최신 이미지를 가리키므로 과거 특정 버전을 정확히 가리킬 수 없다.
2. **롤백 어려움**: 장애가 발생해 이전 버전으로 되돌려야 할 때 "이전 `latest`가 무엇이었는가"를 알기 어렵다.
3. **캐시 오염**: 서버에 이미 `latest` 이미지가 캐시되어 있으면 `docker pull`을 해도 새 이미지가 내려오지 않을 수 있다. Docker는 레이어 다이제스트(SHA256)가 다를 때만 업데이트한다.

##### 세 가지 태깅 전략

실무에서 주로 세 가지 방식을 조합한다.

| 전략 | 예시 | 특징 | 용도 |
|:--|:--|:--|:--|
| **semver** | `1.0.0`, `1.2.3` | 의미론적 버전. 주.부.패치 형식 | 릴리스 버전 명시 |
| **Git SHA** | `a1b2c3d`, `a1b2c3d4e5f6` | 커밋 해시. 정확한 코드 상태 | 빌드 추적, 디버깅 |
| **브랜치/환경** | `main`, `develop`, `staging` | 브랜치 또는 환경 이름 | CI 자동 배포, 테스트 환경 |

일반적으로 하나의 이미지에 여러 태그를 동시에 붙인다. 같은 이미지 콘텐츠를 여러 이름으로 부르는 것이고, 저장 용량이 중복되지 않는다(동일 레이어는 공유).

```bash
# 같은 이미지에 여러 태그 부여
docker tag myapp:a1b2c3d myusername/myapp:1.2.3
docker tag myapp:a1b2c3d myusername/myapp:latest   # latest도 같이 올림 (선택)

# 동시에 push
docker push myusername/myapp:1.2.3
docker push myusername/myapp:latest
```

##### Git SHA 태그

**Git SHA(커밋 해시) 태그**는 이미지가 정확히 어느 코드 상태에서 빌드됐는지 추적할 수 있게 한다. semver는 "이 버전에 어떤 기능이 있다"는 의미를 전달하고, SHA는 "정확히 이 커밋의 코드"라는 사실을 보장한다.

```bash
# Git 커밋 SHA 앞 7자리 가져오기
GIT_SHA=$(git rev-parse --short HEAD)
echo $GIT_SHA  # 예: a1b2c3d

# SHA를 태그로 사용
docker build -t myusername/myapp:${GIT_SHA} .
docker push myusername/myapp:${GIT_SHA}
```

배포 기록에 이미지 태그(`a1b2c3d`)를 남기면, 나중에 문제가 생겼을 때 `git log a1b2c3d`로 정확히 어떤 커밋인지 바로 찾을 수 있다.

> **[주니어 렌즈 ★★☆]**
> - **semver 규칙 이해**: `주버전.부버전.패치버전` — 패치(버그 수정)는 `1.0.0 → 1.0.1`, 부버전(하위 호환 기능 추가)은 `1.0.0 → 1.1.0`, 주버전(하위 비호환 변경)은 `1.0.0 → 2.0.0`으로 올린다. 컨테이너 이미지 태그에 semver를 적용하면 배포된 버전의 변경 규모를 태그만 보고 파악할 수 있다.
> - **`latest`를 완전히 안 쓸 필요는 없다**: 로컬 개발 환경에서는 `latest`를 써도 된다. 프로덕션 서버와 CI에서만 명시적 버전 태그를 강제하면 된다. `docker-compose.yml`(개발용)에서는 `image: myapp:latest`, 프로덕션 배포 매니페스트에서는 `image: myapp:1.2.3` 또는 `image: myapp@sha256:...` 형식을 쓴다.
> - **이미지 다이제스트 고정**: 태그는 가변이지만 다이제스트(`sha256:...`)는 불변이다. 보안이 중요한 프로덕션 환경에서는 태그 대신 다이제스트로 이미지를 고정한다. `docker pull nginx@sha256:abc123...`처럼 쓴다. `docker inspect <이미지명> --format '{{.RepoDigests}}'`로 이미지의 다이제스트를 확인할 수 있다.

##### CI에서 자동 태깅

수동으로 태그를 붙이는 것은 실수가 생기기 쉽다. CI/CD 파이프라인에서 자동으로 태그를 생성하는 것이 표준이다.

**`git describe` 활용:**

```bash
# 가장 가까운 Git 태그 + 커밋 수 + SHA 조합
git describe --tags --always
# 예: v1.2.3-4-ga1b2c3d  (v1.2.3 태그 이후 4커밋, SHA a1b2c3d)
```

`git describe`는 가장 가까운 Git 태그로부터 현재 커밋까지의 관계를 사람이 읽기 쉬운 형식으로 표현한다. 이미지 태그로 쓰면 버전과 커밋 위치를 동시에 담을 수 있다.

**GitHub Actions에서 메타데이터 자동 생성:**

`docker/metadata-action`을 사용하면 브랜치, 태그, PR 번호에 맞는 이미지 태그를 자동으로 생성한다.

```yaml
- name: Docker 메타데이터 생성
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ghcr.io/myorg/myapp
    tags: |
      type=semver,pattern={{version}}      # Git 태그가 v1.2.3이면 → 1.2.3
      type=semver,pattern={{major}}.{{minor}}  # → 1.2
      type=sha,prefix=                     # → a1b2c3d
      type=raw,value=latest,enable={{is_default_branch}}  # main 브랜치에만 latest
```

이 액션은 `steps.meta.outputs.tags`와 `steps.meta.outputs.labels`를 제공해 `build-push-action`과 바로 연결할 수 있다.

> **[실무자 렌즈 ★★★]**
> - **이미지 불변성 원칙**: 한 번 레지스트리에 push한 이미지 태그는 다시 덮어쓰지 않는다. `1.2.3` 태그가 이미 존재하면 같은 태그로 다시 push하지 말고, `1.2.4`를 만든다. 일부 레지스트리(ECR 등)는 이미지 태그 불변성(image tag immutability)을 강제하는 설정을 제공한다. 이 옵션을 활성화하면 실수로 기존 태그를 덮어쓰는 것을 방지할 수 있다.
> - **롤백 전략**: 태그 기반 롤백은 간단하다. `docker pull myapp:1.2.2`로 이전 버전을 내려받고 재배포한다. Kubernetes 환경에서는 `kubectl set image deployment/myapp myapp=myapp:1.2.2`로 롤백한다. SHA 기반 배포(`myapp@sha256:...`)를 사용하면 태그가 덮어써지더라도 정확한 이미지를 지정할 수 있다.
> - **이미지 승격(promotion) 패턴**: CI에서 빌드된 이미지를 `staging` 환경에서 검증 후, 동일 이미지를 프로덕션용 태그로 재태그한다. 새로 빌드하지 않고 검증 완료된 이미지를 그대로 쓰는 것이다. `docker pull myapp:staging-a1b2c3d` → 검증 → `docker tag myapp:staging-a1b2c3d myapp:1.2.3` → `docker push myapp:1.2.3`. 이 패턴은 "빌드한 것을 그대로 배포"라는 원칙을 지킨다.

##### 체크포인트

- [ ] `latest` 태그를 프로덕션에서 쓰면 안 되는 이유 두 가지를 설명할 수 있다
- [ ] `git rev-parse --short HEAD`로 Git SHA를 가져와 이미지 태그로 사용할 수 있다
- [ ] 하나의 이미지에 semver 태그와 SHA 태그를 동시에 붙이는 이유를 설명할 수 있다
- [ ] 이미지 태그와 이미지 다이제스트(sha256)의 차이를 설명하고, 프로덕션에서 다이제스트를 쓰는 이유를 말할 수 있다
- [ ] CI에서 `docker/metadata-action`이 자동으로 생성하는 태그 종류를 설명할 수 있다

### VII-1-3. 보안 — 비루트 사용자, 이미지 스캔

- **난이도**: ★★★
- **선수 지식**: VII-1-2
- **학습 목표**: 이 Section을 마치면 컨테이너를 root가 아닌 일반 사용자로 실행하고, 이미지 취약점 스캔을 설정할 수 있다.
- **설명**:
  기본적으로 컨테이너 안에서 프로세스는 root로 실행된다. root 컨테이너가 탈출(escape)하면 호스트 시스템까지 위험해진다. Dockerfile에서 `USER` 명령으로 전용 비루트 사용자를 만들어 전환하는 것이 보안 모범 사례다. 이미지 스캔 도구(`docker scout`, `trivy`, `snyk`)는 이미지에 포함된 OS 패키지·라이브러리의 알려진 취약점(CVE)을 검사한다. CI 파이프라인에 스캔 단계를 추가해 취약한 이미지가 레지스트리에 올라가지 못하게 막는다.
- **핵심 키워드**: `USER`, 비루트 사용자, 컨테이너 탈출, CVE 스캔, trivy, docker scout
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VII-1-4

#### 본문

##### 왜 컨테이너 보안이 중요한가

컨테이너는 가상 머신보다 격리 수준이 낮다. 커널을 호스트와 공유하기 때문이다. 컨테이너 안에서 root 권한으로 실행 중인 프로세스가 탈출(container escape)에 성공하면 호스트 시스템 전체를 장악할 수 있다. 컨테이너 탈출 취약점은 매년 발견된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 아파트 단지의 열쇠 비유다. root는 마스터키 — 관리인이 가진 키로 모든 세대, 지하 기계실, 옥상 모두 열 수 있다. 일반 사용자 계정은 방 열쇠 — 자신의 세대와 공용 공간 일부만 열 수 있다. 컨테이너에서 root를 쓰는 것은 앱 하나를 위해 마스터키를 꽂아두는 것과 같다. 침입자가 앱 취약점을 이용하면 마스터키로 전체를 장악할 수 있다.
> - **체감 예시**: `docker run --rm ubuntu whoami` 를 실행하면 `root`가 출력된다. 이것은 컨테이너 안의 앱이 root 권한으로 동작한다는 뜻이다. 비루트 사용자로 전환하면 같은 명령에서 `appuser` 같은 일반 사용자 이름이 출력된다.
> - **주의**: 비루트 사용자로 전환했더라도 `privileged` 모드(`docker run --privileged`)로 실행하면 root와 동등한 권한을 얻는다. `--privileged`는 절대 프로덕션에서 사용하지 않는다.

두 번째 위협은 이미지 안에 포함된 **취약한 패키지**다. `FROM python:3.12-slim` 같은 베이스 이미지에도 알려진 보안 취약점(CVE: Common Vulnerabilities and Exposures)이 있는 패키지가 포함될 수 있다. 이미지 스캔 도구는 이미지에 설치된 OS 패키지와 언어 패키지의 CVE 데이터베이스와 비교해 취약점을 찾아낸다.

##### 비루트 사용자 설정

Dockerfile에서 `USER` 명령으로 비루트 사용자를 만들고 전환한다. 표준 패턴은 다음과 같다.

**Python/Linux 예시:**

```dockerfile
FROM python:3.12-slim
WORKDIR /app

# 1. 시스템 사용자 생성 (--no-create-home: 홈 디렉토리 없음, --system: 시스템 계정)
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup --no-create-home appuser

# 2. 의존성 설치 (root로 실행 — 시스템 패키지 설치 필요)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. 소스 복사
COPY . .

# 4. 파일 소유권 변경 (appuser가 읽을 수 있도록)
RUN chown -R appuser:appgroup /app

# 5. 비루트 사용자로 전환
USER appuser

CMD ["python", "main.py"]
```

`USER` 명령 이후의 모든 명령(`RUN`, `CMD`, `ENTRYPOINT`)은 해당 사용자 권한으로 실행된다. 패키지 설치처럼 root 권한이 필요한 단계는 `USER` 앞에 둔다.

**Node.js 예시 — node 이미지는 기본 제공 사용자 활용:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# node 이미지에는 'node' 사용자가 기본 포함됨
RUN chown -R node:node /app
USER node

CMD ["node", "index.js"]
```

공식 `node` 이미지는 `node` 사용자를 기본으로 포함한다. 별도로 사용자를 만들 필요가 없다.

##### trivy로 이미지 취약점 스캔

trivy는 Aqua Security에서 만든 오픈소스 취약점 스캐너다. 설치가 간단하고 Docker 이미지, 파일시스템, Git 저장소 등을 스캔할 수 있다.

**로컬 설치 (Linux/Mac):**

```bash
# Homebrew (Mac)
brew install trivy

# 스크립트 설치 (Linux)
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

**이미지 스캔:**

```bash
# 로컬 이미지 스캔
trivy image myapp:latest

# 레지스트리 이미지 스캔
trivy image ghcr.io/myorg/myapp:1.2.3

# CRITICAL, HIGH 등급 취약점만 표시
trivy image --severity CRITICAL,HIGH myapp:latest

# JSON 출력 (CI 파이프라인 처리용)
trivy image --format json --output trivy-results.json myapp:latest
```

스캔 결과 예시:

```
myapp:latest (debian 12.0)
=========================
Total: 3 (CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 0)

┌──────────────┬──────────────────┬──────────┬──────────────────────┐
│   Library    │  Vulnerability   │ Severity │     Description      │
├──────────────┼──────────────────┼──────────┼──────────────────────┤
│ libssl3      │ CVE-2024-XXXXX   │ HIGH     │ OpenSSL 버퍼 오버플로우 │
└──────────────┴──────────────────┴──────────┴──────────────────────┘
```

취약점이 발견되면 보통 두 가지 대응이 있다. 해당 패키지 버전을 업그레이드하거나, 더 최신 베이스 이미지로 변경한다.

> **[주니어 렌즈 ★★☆]**
> - **`docker scout`**: Docker Desktop 4.17+부터 포함된 공식 스캔 도구다. `docker scout cves myapp:latest`로 CVE를 확인하고, `docker scout recommendations myapp:latest`로 더 취약점이 적은 베이스 이미지를 추천받을 수 있다. trivy에 비해 간단히 쓸 수 있다.
> - **취약점 무시 파일**: 모든 취약점을 즉시 고칠 수 없는 경우 trivy의 `.trivyignore` 파일에 CVE ID를 등록해 특정 취약점을 무시할 수 있다. 단, 무시하는 이유와 재검토 일정을 주석으로 반드시 기록한다.
>
>   ```
>   # .trivyignore
>   # 이유: 해당 취약점은 이 앱에서 사용하는 코드 경로에 없음. 2026-07-01 재검토
>   CVE-2024-XXXXX
>   ```
>
> - **USER 전환 후 파일 접근 오류**: `USER appuser`로 전환 후 `/app` 디렉토리에 쓰기 권한이 없어 앱이 실패하는 경우가 많다. `chown -R appuser /app`을 `USER` 명령 전에 실행했는지 확인한다. 로그 파일, 업로드 디렉토리 등 앱이 쓰기를 필요로 하는 경로를 모두 권한 변경 대상에 포함해야 한다.

> **[실무자 렌즈 ★★★]**
> - **distroless 이미지**: Google이 만든 distroless 이미지(`gcr.io/distroless/python3`, `gcr.io/distroless/java17`)는 앱 실행에 필요한 런타임만 포함하고 셸, 패키지 관리자, 유틸리티를 전혀 포함하지 않는다. 공격 표면(attack surface)이 최소화된다. 멀티 스테이지 빌드와 함께 쓴다 — 빌드 스테이지에서 앱을 빌드하고, 최종 스테이지에서 distroless를 베이스로 아티팩트만 복사한다. 컨테이너에 침입해도 `bash`, `curl` 같은 도구가 없어 추가 공격이 어려워진다.
> - **이미지 서명 (cosign)**: `sigstore/cosign`으로 이미지에 서명하면 레지스트리에 서명 데이터가 함께 저장된다. 배포 시 서명을 검증해 신뢰할 수 있는 소스에서 빌드된 이미지인지 확인할 수 있다. Kubernetes admission controller(Policy Controller, Kyverno 등)와 연동하면 서명되지 않은 이미지의 배포를 자동 차단할 수 있다.
> - **SBOM(Software Bill of Materials)**: 이미지에 포함된 모든 소프트웨어 컴포넌트 목록이다. `trivy image --format cyclonedx myapp:latest`로 CycloneDX 형식 SBOM을 생성할 수 있다. 공급망 보안 규정이 강화되면서 SBOM 제공이 요구되는 경우가 늘고 있다. GitHub Dependency Graph, Dependabot과 통합해 자동 취약점 알림을 받을 수 있다.
> - **컨테이너 런타임 보안**: 빌드 타임 보안(이미지 스캔)과 별개로 런타임 보안도 필요하다. `seccomp` 프로파일로 컨테이너에서 허용할 시스템 콜을 제한하고, `AppArmor`/`SELinux` 프로파일로 파일 접근을 제어한다. `--read-only` 플래그로 컨테이너 파일시스템을 읽기 전용으로 만들고, 쓰기가 필요한 곳만 tmpfs 마운트로 허용하는 것이 최소 권한 원칙에 부합한다.

##### 체크포인트

- [ ] `RUN adduser`와 `USER` 명령을 사용해 비루트 사용자로 실행되는 Dockerfile을 작성할 수 있다
- [ ] `docker exec -it <컨테이너명> whoami` 명령으로 컨테이너 안의 실행 사용자를 확인할 수 있다
- [ ] trivy 또는 `docker scout`로 이미지를 스캔하고 CRITICAL/HIGH 취약점 목록을 확인할 수 있다
- [ ] `USER` 명령 이후에 파일 쓰기 오류가 발생했을 때 `chown` 명령으로 해결하는 방법을 설명할 수 있다
- [ ] distroless 이미지를 쓰는 이유와 멀티 스테이지 빌드와 함께 사용하는 방법을 설명할 수 있다

### VII-1-4. CI/CD에서 Docker 빌드 자동화

- **난이도**: ★★★
- **선수 지식**: VII-1-3
- **학습 목표**: 이 Section을 마치면 GitHub Actions 워크플로우로 이미지를 자동 빌드·태그·push할 수 있다.
- **설명**:
  코드 변경이 main 브랜치에 merge될 때마다 이미지를 자동으로 빌드하고 레지스트리에 push하는 것이 CI/CD 표준이다. GitHub Actions 기준으로, `docker/setup-buildx-action`으로 BuildKit을 켜고, `docker/build-push-action`으로 빌드·push를 한 번에 처리한다. BuildKit은 레이어 캐시를 레지스트리에 저장(`--cache-from`, `--cache-to`)해 반복 빌드 속도를 크게 높인다.
- **핵심 키워드**: GitHub Actions, BuildKit, `docker/build-push-action`, 캐시 내보내기(`--cache-to`), 자동화
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: 부록 A

#### 본문

##### CI/CD 자동화가 필요한 이유

수동 빌드·push 프로세스는 세 가지 문제가 있다. 첫째, **실수 가능성** — 태그를 잘못 붙이거나 push를 빠뜨릴 수 있다. 둘째, **재현성 부족** — "내 노트북에서 빌드한 이미지"는 환경에 따라 다를 수 있다. 셋째, **병목** — 배포가 특정 사람에게 의존하게 된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 공장 자동화와 같다. 수작업으로 제품을 만들 때는 품질이 사람마다 다르고, 담당자가 없으면 생산이 멈춘다. 공장 자동화 버튼 하나면 원자재 투입 → 가공 → 검사 → 포장 → 출하까지 자동으로 처리된다. GitHub Actions의 워크플로우가 그 버튼이다. 코드를 main에 merge하면 빌드 → 스캔 → 레지스트리 push가 자동으로 실행된다.
> - **체감 예시**: 새벽 2시에 긴급 버그를 수정해서 main에 push했다. CI가 자동으로 이미지를 빌드하고 레지스트리에 올려준다. 배포 담당자는 레지스트리에서 새 이미지를 받아 서버에 올리기만 하면 된다. 빌드 절차를 외울 필요가 없다.
> - **주의**: 자동화가 잘못되면 실수도 자동화된다. 테스트가 없는 코드가 main에 merge되면 문제 있는 이미지가 자동으로 올라간다. CI에는 빌드 전에 테스트 실행 단계를 반드시 포함한다.

##### GitHub Actions 기본 구조

GitHub Actions 워크플로우는 `.github/workflows/` 디렉토리에 YAML 파일로 저장한다. Docker 빌드 자동화에 필요한 기본 구조는 다음과 같다.

```yaml
# .github/workflows/docker-build.yml
name: Docker 빌드 및 push

on:
  push:
    branches: [main]       # main 브랜치에 push될 때 실행
  pull_request:
    branches: [main]       # main으로 향하는 PR 생성/업데이트 시 실행

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}   # myorg/myapp 형식

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write      # GHCR에 push하기 위한 권한

    steps:
      # 1. 코드 체크아웃
      - name: 저장소 체크아웃
        uses: actions/checkout@v4

      # 2. BuildKit(buildx) 활성화
      - name: Docker Buildx 설정
        uses: docker/setup-buildx-action@v3

      # 3. GHCR 로그인
      - name: GHCR 로그인
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}   # GitHub이 자동 제공하는 토큰

      # 4. 이미지 메타데이터(태그) 자동 생성
      - name: 이미지 메타데이터 생성
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest,enable={{is_default_branch}}

      # 5. 빌드 및 push
      - name: 빌드 및 push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}   # PR에서는 push 안 함
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha                # GitHub Actions 캐시에서 불러옴
          cache-to: type=gha,mode=max         # GitHub Actions 캐시에 저장
```

**각 단계 설명:**

| 단계 | 역할 |
|:--|:--|
| `actions/checkout@v4` | 저장소 코드를 워크플로우 실행 환경에 내려받음 |
| `docker/setup-buildx-action@v3` | BuildKit 기반의 `buildx` 빌더를 활성화 |
| `docker/login-action@v3` | 레지스트리에 로그인. `GITHUB_TOKEN`은 GitHub이 자동 제공 |
| `docker/metadata-action@v5` | 브랜치, 태그, SHA에 맞는 이미지 태그를 자동 생성 |
| `docker/build-push-action@v5` | 빌드와 push를 한 번에 처리. BuildKit 캐시 연동 포함 |

> **[주니어 렌즈 ★★☆]**
> - **`secrets.GITHUB_TOKEN`**: GitHub Actions가 자동으로 제공하는 토큰이다. 저장소의 패키지(GHCR 포함)에 접근할 수 있는 권한을 갖는다. 별도로 발급하지 않아도 된다. 단, `permissions.packages: write`를 워크플로우에 명시해야 GHCR에 push할 수 있다.
> - **PR에서 push 안 하는 이유**: `push: ${{ github.event_name != 'pull_request' }}`는 PR 검증 시에는 빌드만 하고 실제 레지스트리에 push하지 않는다는 설정이다. 검토 전 코드의 이미지가 레지스트리에 올라가는 것을 막는다. main merge 후에만 push된다.
> - **`cache-from: type=gha` / `cache-to: type=gha`**: GitHub Actions가 관리하는 캐시 스토리지를 BuildKit 캐시 백엔드로 사용한다. 첫 빌드 이후 변경되지 않은 레이어는 캐시에서 재사용된다. 특히 `pip install`, `npm ci` 레이어가 캐시되면 빌드 시간이 수 분에서 수십 초로 단축될 수 있다. 캐시 용량 제한은 리포지토리당 10GB다.
> - **워크플로우 디버깅**: 빌드가 실패하면 Actions 탭의 해당 워크플로우 실행 기록에서 각 단계의 로그를 확인한다. `docker/build-push-action`의 `ACTIONS_STEP_DEBUG` 시크릿을 `true`로 설정하면 더 상세한 BuildKit 로그를 볼 수 있다.

##### 전체 파이프라인 흐름

```
코드 push (main 브랜치)
    │
    ├─ [테스트] pytest / npm test 실행
    │       │
    │       └─ 실패 시 → 빌드 단계 진행 안 함
    │
    ├─ [빌드] docker/build-push-action
    │       │  캐시 불러오기 (type=gha)
    │       │  이미지 빌드
    │       │  캐시 저장 (type=gha, mode=max)
    │
    ├─ [스캔] trivy 취약점 스캔
    │       │
    │       └─ CRITICAL 취약점 발견 시 → push 중단 (선택)
    │
    └─ [push] GHCR / ECR에 이미지 push
```

테스트 → 빌드 → 스캔 → push 순서가 표준이다. 앞 단계가 실패하면 뒤 단계는 실행되지 않는다. 취약한 이미지나 테스트를 통과하지 못한 코드의 이미지는 레지스트리에 올라가지 않는다.

**trivy 스캔을 CI에 추가하는 예시:**

```yaml
- name: trivy 이미지 스캔
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}
    format: table
    exit-code: 1              # CRITICAL 취약점 발견 시 워크플로우 실패
    severity: CRITICAL,HIGH
```

> **[실무자 렌즈 ★★★]**
> - **BuildKit 원격 캐시 — 레지스트리 캐시**: `type=gha` 대신 `type=registry`를 사용하면 캐시를 레지스트리에 저장할 수 있다. 여러 저장소나 셀프 호스팅 러너에서도 캐시를 공유할 수 있다는 장점이 있다.
>
>   ```yaml
>   cache-from: type=registry,ref=ghcr.io/myorg/myapp:buildcache
>   cache-to: type=registry,ref=ghcr.io/myorg/myapp:buildcache,mode=max
>   ```
>
> - **멀티플랫폼 빌드**: `docker/setup-buildx-action`을 사용하면 QEMU 에뮬레이션을 통해 `linux/amd64`와 `linux/arm64`를 동시에 빌드할 수 있다. Apple Silicon Mac에서도 동작하는 이미지를 CI에서 한 번에 생성한다.
>
>   ```yaml
>   - name: QEMU 설정 (멀티플랫폼 빌드용)
>     uses: docker/setup-qemu-action@v3
>
>   - name: 빌드 및 push
>     uses: docker/build-push-action@v5
>     with:
>       platforms: linux/amd64,linux/arm64
>       ...
>   ```
>
> - **배포 파이프라인 설계**: CI(이미지 빌드·push)와 CD(서버 배포)는 분리하는 것이 좋다. CI는 항상 실행하지만, CD는 승인이 필요하거나 특정 조건(Git 태그 생성, 수동 트리거 등)에서만 실행한다. GitHub Actions의 `environment` + `protection rules`를 사용하면 프로덕션 배포 전 승인자가 리뷰하는 단계를 추가할 수 있다. 이미지 레지스트리가 중간 저장소 역할을 해서 CI와 CD 파이프라인이 분리되면서도 연결된다.
> - **이미지 취약점 알림 자동화**: ECR, GHCR 모두 레지스트리에 이미지가 push될 때 자동으로 스캔하고 새 취약점이 발견되면 알림을 보내는 기능을 제공한다. ECR의 경우 `Enhanced Scanning`(Inspector 연동)을 활성화하면 새 CVE가 발표될 때마다 기존 이미지도 재스캔한다.

##### 체크포인트

- [ ] `.github/workflows/` 디렉토리에 Docker 빌드 워크플로우 YAML 파일을 만들어 main 브랜치 push 시 자동으로 이미지를 빌드할 수 있다
- [ ] `docker/setup-buildx-action`, `docker/login-action`, `docker/metadata-action`, `docker/build-push-action` 네 액션의 역할을 설명할 수 있다
- [ ] `cache-from: type=gha` / `cache-to: type=gha` 설정이 빌드 시간을 단축하는 원리를 설명할 수 있다
- [ ] PR에서 빌드만 하고 push는 하지 않는 조건(`push: ${{ github.event_name != 'pull_request' }}`)의 이유를 설명할 수 있다
- [ ] CI 파이프라인에서 테스트 → 빌드 → 스캔 → push 순서가 중요한 이유를 설명할 수 있다

---

## Part VIII. 실전 실습 워크숍

> Part I~VII에서 개념을 잡았다면, Part VIII에서 손으로 직접 실행하며 익힌다. 모든 Section이 **따라하기 실습**으로 구성되어 있다.

---

### VIII-1-1. docker run 핵심 옵션 총정리

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 `docker run`의 주요 옵션을 상황에 맞게 조합해서 컨테이너를 실행할 수 있다.
- **설명**:
  `docker run`은 이미지를 내려받고 컨테이너를 생성해서 바로 실행하는 한 방 명령이다. 옵션 하나하나가 컨테이너의 동작 방식을 결정한다. `-d`는 백그라운드 실행, `-it`는 터미널 연결, `-p`는 포트 개방, `-v`는 데이터 유지. 처음에는 개별 옵션을 외우기보다 "어떤 상황에 어떤 옵션이 필요한가"를 익히는 것이 더 빠르다.
- **핵심 키워드**: `-d`, `-it`, `-p`, `-v`, `--name`, `--rm`, `-e`, `--env-file`, `--network`, `--restart`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: III-1-2 (Hello World 컨테이너)
- **다음 섹션**: VIII-1-2

#### 본문

##### 옵션 없이 실행하면 어떻게 되나

`docker run nginx:alpine`을 입력하면 nginx가 포그라운드로 실행된다. 터미널이 블로킹되고, Ctrl+C를 누르면 컨테이너가 중지된다. 포트도 열리지 않아서 브라우저에서 접속할 수 없다. 이것이 옵션의 필요성을 가장 잘 보여주는 출발점이다.

```bash
# 포그라운드 실행 — 터미널이 블로킹됨
docker run nginx:alpine
```

##### -d: 백그라운드(데몬) 실행

서버처럼 계속 실행되어야 하는 컨테이너에 사용한다. 실행 즉시 컨테이너 ID를 출력하고 프롬프트로 돌아온다.

```bash
# 백그라운드로 실행
docker run -d nginx:alpine

# 실행 확인
docker ps
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: 음악을 틀어놓고 다른 일을 하는 것과 같다. `-d` 없이 실행하면 음악이 끝날 때까지 그 자리에 서 있어야 한다. `-d`를 붙이면 음악을 틀어두고 다른 일을 할 수 있다.
> - **체감 예시**: nginx 웹 서버를 시작했다. `-d`를 붙였더니 터미널이 바로 돌아와서 다른 명령을 계속 입력할 수 있다.
> - **주의**: `-d`로 실행하면 로그가 화면에 표시되지 않는다. 문제가 생기면 `docker logs <컨테이너ID>`로 확인한다.

##### -it: 인터랙티브 터미널

컨테이너 내부에서 직접 명령을 실행해야 할 때 사용한다. `-i`는 표준 입력(stdin)을 열어두고, `-t`는 가상 터미널(pseudo-TTY)을 할당한다. 보통 셸에 접속할 때 두 옵션을 함께 쓴다.

```bash
# 컨테이너 내부 셸에 접속
docker run -it alpine sh

# 컨테이너 안에서 실행
/# ls /
/# cat /etc/os-release
/# exit
```

##### -p: 포트 매핑

호스트(내 컴퓨터)의 포트를 컨테이너의 포트에 연결한다. 형식은 `-p <호스트포트>:<컨테이너포트>`이다.

```bash
# 호스트 8080 → 컨테이너 80
docker run -d -p 8080:80 nginx:alpine

# 브라우저에서 http://localhost:8080 접속 가능
curl http://localhost:8080
```

포트를 열지 않으면 호스트에서 컨테이너 서비스에 접근할 수 없다. `docker ps`에서 `PORTS` 컬럼에 `0.0.0.0:8080->80/tcp`가 보이면 정상이다.

##### -v: 볼륨 마운트

컨테이너가 삭제되어도 데이터를 유지하거나, 호스트의 파일을 컨테이너에서 사용할 때 쓴다.

```bash
# 명명된 볼륨 (Docker가 관리)
docker run -d -v mydata:/data postgres:16-alpine

# 바인드 마운트 (호스트 경로 직접 연결)
docker run -d -v $(pwd)/html:/usr/share/nginx/html nginx:alpine
```

##### --name: 컨테이너 이름 지정

이름을 지정하지 않으면 Docker가 랜덤한 이름을 붙인다(`quirky_tesla` 같은). 이름을 지정하면 ID 대신 이름으로 명령을 실행할 수 있다.

```bash
docker run -d --name my-nginx -p 8080:80 nginx:alpine

# 이름으로 중지/재시작
docker stop my-nginx
docker start my-nginx
docker logs my-nginx
```

##### --rm: 컨테이너 종료 시 자동 삭제

컨테이너가 종료되면 자동으로 삭제된다. 임시 작업이나 테스트할 때 유용하다. `-d`와 함께 쓰면 백그라운드로 실행하다가 종료 시 자동 삭제된다.

```bash
# 셸 접속 후 exit 시 컨테이너 자동 삭제
docker run --rm -it alpine sh

# 백그라운드 + 종료 시 자동 삭제
docker run -d --rm --name temp-nginx nginx:alpine
```

##### -e / --env-file: 환경변수 주입

컨테이너 안에서 읽을 환경변수를 설정한다. 비밀번호, API 키 같은 값을 Dockerfile에 넣지 않고 실행 시점에 주입하는 방식이다.

```bash
# 단일 환경변수
docker run -d \
  -e POSTGRES_PASSWORD=mysecret \
  -e POSTGRES_DB=myapp \
  postgres:16-alpine

# .env 파일에서 일괄 주입
docker run -d --env-file .env postgres:16-alpine
```

`.env` 파일 형식:
```
POSTGRES_PASSWORD=mysecret
POSTGRES_DB=myapp
POSTGRES_USER=appuser
```

##### --network: 네트워크 연결

컨테이너를 특정 Docker 네트워크에 연결한다. 같은 네트워크에 있는 컨테이너끼리는 컨테이너 이름으로 통신할 수 있다.

```bash
# 네트워크 생성
docker network create mynet

# 같은 네트워크에 컨테이너 연결
docker run -d --name db --network mynet postgres:16-alpine
docker run -d --name web --network mynet nginx:alpine

# web에서 db로 ping
docker exec web ping db
```

##### --restart: 재시작 정책

컨테이너가 종료되었을 때 자동으로 재시작할지 결정한다.

| 값 | 동작 |
|:--|:--|
| `no` (기본값) | 재시작 안 함 |
| `always` | 항상 재시작 (Docker 재시작 시도 포함) |
| `unless-stopped` | 수동으로 중지하지 않은 경우 항상 재시작 |
| `on-failure` | 비정상 종료(exit code ≠ 0)일 때만 재시작 |

```bash
# 서버처럼 항상 켜져 있어야 하는 컨테이너
docker run -d --restart unless-stopped --name web nginx:alpine

# 에러 시에만 재시작 (최대 3회)
docker run -d --restart on-failure:3 myapp:latest
```

> **[주니어 렌즈 ★★☆]**
> - **옵션 조합 패턴**: 실무에서 자주 쓰는 조합은 정해져 있다. 웹 서버: `-d --name --restart unless-stopped -p`. DB: `-d --name -e -v`. 디버깅: `--rm -it`. 임시 작업: `--rm`.
> - **--rm과 --restart 충돌**: `--rm`과 `--restart always`를 동시에 쓰면 Docker가 에러를 낸다. `--rm`은 "종료 시 삭제", `--restart`는 "종료 시 재시작"이므로 서로 모순이다.
> - **환경변수 우선순위**: `-e`로 직접 지정한 값이 `--env-file`보다 우선한다. 같은 키가 있으면 `-e` 값을 쓴다.

> **[실무자 렌즈 ★★★]**
> - **docker run vs Compose**: 프로덕션에서는 `docker run`을 직접 쓰는 경우가 거의 없다. Compose 파일에 옵션을 선언적으로 정의하고 `docker compose up -d`를 실행한다. `docker run`은 빠른 테스트, 일회성 작업, CI 스크립트에서 주로 쓴다.
> - **--restart와 오케스트레이터**: Kubernetes, ECS를 쓰면 재시작 정책은 오케스트레이터가 관리한다. 단독 서버에서 Docker만 쓸 때 `--restart unless-stopped`가 유용하다.
> - **환경변수와 시크릿 관리**: `-e`로 패스워드를 직접 주입하면 `docker inspect`나 `ps aux`에서 노출될 수 있다. 프로덕션에서는 Docker Secrets, AWS SSM Parameter Store, HashiCorp Vault 같은 시크릿 관리 시스템을 사용한다.

##### 옵션 조합 비교 표

| 시나리오 | 명령 예시 |
|:--|:--|
| nginx 웹 서버 (프로덕션) | `docker run -d --name web -p 80:80 --restart unless-stopped nginx:alpine` |
| postgres DB (개발) | `docker run -d --name db -e POSTGRES_PASSWORD=dev -v pgdata:/var/lib/postgresql/data postgres:16-alpine` |
| 컨테이너 내부 탐색 | `docker run --rm -it alpine sh` |
| 일회성 명령 실행 | `docker run --rm alpine date` |
| 개발 서버 (핫 리로드) | `docker run -d --name dev -p 3000:3000 -v $(pwd):/app myapp:dev` |

##### 체크포인트

- [ ] `-d`와 `-it`의 차이를 설명하고, 각각 어떤 상황에 쓰는지 예시를 들 수 있다
- [ ] `-p 8080:80`에서 앞 숫자(8080)가 호스트 포트이고 뒤 숫자(80)가 컨테이너 포트임을 설명할 수 있다
- [ ] `--rm`과 `--restart always`를 동시에 쓰면 에러가 나는 이유를 설명할 수 있다
- [ ] `-e`와 `--env-file`의 차이와 우선순위를 설명할 수 있다
- [ ] nginx를 백그라운드로 실행하고, 포트를 열고, 이름을 지정하는 명령을 옵션 순서까지 맞게 작성할 수 있다

---

### VIII-1-2. exec, cp, attach — 실행 중 컨테이너 조작

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 실행 중인 컨테이너에 접속하고, 명령을 실행하고, 파일을 주고받을 수 있다.
- **설명**:
  컨테이너가 실행 중일 때 내부 상태를 확인하거나 긴급하게 파일을 수정해야 할 때가 있다. `docker exec`는 실행 중인 컨테이너에 새 프로세스를 추가로 실행하는 방법이다. `docker cp`는 호스트와 컨테이너 사이에 파일을 복사한다. `docker attach`는 컨테이너의 기존 메인 프로세스에 연결하는 방법이다. 세 명령의 차이를 이해하면 컨테이너 디버깅이 훨씬 쉬워진다.
- **핵심 키워드**: `docker exec`, `docker cp`, `docker attach`, 새 프로세스 vs stdin 공유
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-1
- **다음 섹션**: VIII-1-3

#### 본문

##### docker exec — 컨테이너 안에서 명령 실행

`docker exec`는 실행 중인 컨테이너에 새 프로세스를 추가로 실행한다. 컨테이너의 메인 프로세스(PID 1)와 독립적으로 동작한다.

```bash
# nginx 컨테이너를 백그라운드로 실행
docker run -d --name web nginx:alpine

# 컨테이너 내부 bash 셸 접속 (bash가 없으면 sh 사용)
docker exec -it web sh

# 셸 접속 후 할 수 있는 것들
/# cat /etc/nginx/nginx.conf          # 설정 파일 확인
/# ls /usr/share/nginx/html           # 기본 HTML 위치 확인
/# ps aux                              # 실행 중인 프로세스 확인
/# exit                                # 컨테이너는 계속 실행 중
```

`exit`로 나와도 컨테이너는 중지되지 않는다. `exec`로 접속한 셸만 종료될 뿐, 메인 프로세스(nginx)는 계속 실행된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 실행 중인 자동차의 창문을 열고 손을 넣어 작업하는 것과 같다. 차는 계속 달리고 있고, 나는 옆에서 추가 작업을 하는 것이다.
> - **체감 예시**: nginx 컨테이너가 실행 중인데 설정 파일이 어디에 있는지 확인하고 싶다. `docker exec -it web sh`로 접속해서 `cat /etc/nginx/nginx.conf`를 실행하면 된다. VM이나 EC2 서버에 SSH 접속하는 것과 비슷한 느낌이다.
> - **주의**: `exec -it ... bash`가 안 될 때는 `bash`가 설치되지 않은 이미지다. Alpine 기반 이미지는 기본적으로 `sh`만 있다.

##### exec로 단일 명령 실행

셸에 접속하지 않고 명령 하나만 실행할 수도 있다.

```bash
# nginx 버전 확인
docker exec web nginx -v

# 설정 파일 문법 검사
docker exec web nginx -t

# 환경변수 확인
docker exec web env

# 특정 파일 내용 출력
docker exec web cat /etc/nginx/conf.d/default.conf

# nginx 설정 리로드 (무중단)
docker exec web nginx -s reload
```

##### docker cp — 호스트↔컨테이너 파일 복사

```bash
# 컨테이너 → 호스트 (설정 파일 가져오기)
docker cp web:/etc/nginx/nginx.conf ./nginx.conf

# 호스트 → 컨테이너 (수정한 파일 넣기)
echo "<h1>Hello Docker</h1>" > index.html
docker cp index.html web:/usr/share/nginx/html/index.html

# 브라우저에서 변경 확인 (포트 매핑이 되어 있어야 함)
# docker run -d --name web -p 8080:80 nginx:alpine 으로 실행했다면:
curl http://localhost:8080
```

폴더 전체를 복사할 수도 있다.

```bash
# 폴더 통째로 컨테이너에 복사
docker cp ./config/ web:/etc/nginx/

# 컨테이너 로그 폴더 가져오기
docker cp web:/var/log/nginx/ ./nginx-logs/
```

> **[주니어 렌즈 ★★☆]**
> - **cp의 한계**: `docker cp`는 임시 방편이다. 컨테이너를 재생성하면 복사한 파일이 사라진다. 설정 파일을 자주 교체해야 한다면 바인드 마운트(`-v`)를 쓰는 게 맞다.
> - **cp로 백업**: 컨테이너 안에 생성된 파일(예: sqlite 파일, 업로드된 이미지)을 빠르게 꺼내야 할 때 `docker cp`가 유용하다. 볼륨 설정을 깜빡했을 때 최후의 수단이 되기도 한다.
> - **경로 주의**: `컨테이너명:절대경로` 형식을 사용한다. 상대 경로는 동작하지 않는다.

##### docker attach — 메인 프로세스에 연결

`docker attach`는 컨테이너의 메인 프로세스(PID 1)의 stdin/stdout에 직접 연결한다. `exec`와 가장 큰 차이는 새 프로세스를 만들지 않는다는 점이다.

```bash
# attach로 nginx 메인 프로세스에 연결
docker run -d --name web nginx:alpine
docker attach web
# nginx 접근 로그가 실시간으로 출력됨
# Ctrl+C를 누르면 nginx(메인 프로세스)가 종료됨 — 컨테이너도 중지됨!
```

`attach`에서 컨테이너를 유지하면서 빠져나오려면 `Ctrl+P`, `Ctrl+Q`를 순서대로 누른다(detach 키 시퀀스).

```bash
# attach 상태에서 안전하게 빠져나오기
# Ctrl+P → Ctrl+Q (순서대로, 동시가 아님)
```

##### exec vs attach 비교

| 구분 | `docker exec` | `docker attach` |
|:--|:--|:--|
| 동작 | 새 프로세스 생성 | 기존 메인 프로세스에 연결 |
| exit 시 | exec 프로세스만 종료, 컨테이너 유지 | 메인 프로세스 종료 → 컨테이너 중지 |
| 주 용도 | 디버깅, 설정 확인, 긴급 수정 | 메인 프로세스 출력 모니터링 |
| 안전성 | 안전 | Ctrl+C 실수 시 컨테이너 중지됨 |
| 권장 여부 | 대부분의 상황에 권장 | 특수한 경우에만 사용 |

> **[실무자 렌즈 ★★★]**
> - **exec의 보안 위험**: `docker exec -it web sh`로 컨테이너에 접속해서 설정을 수정하는 것은 임시 방편이다. 컨테이너를 재생성하면 수정 내용이 사라진다. 이미지와 Compose 파일을 수정하고 재배포하는 것이 올바른 방법이다. exec는 원인 파악용으로만 쓴다.
> - **프로덕션 exec 제한**: 프로덕션 환경에서는 보안상 `docker exec` 권한을 제한하는 경우가 있다. Kubernetes의 경우 `kubectl exec`를 허용/차단하는 RBAC 정책을 따로 설정할 수 있다.
> - **distroless 이미지에서 exec**: distroless 이미지는 셸이 없어서 `exec -it ... sh`가 불가능하다. 디버깅이 필요하면 `gcr.io/distroless/base:debug` 태그를 쓰거나, `kubectl debug`로 사이드카 컨테이너를 붙인다.

##### 실습: nginx 컨테이너 접속 후 파일 확인 및 교체

```bash
# 1. nginx 컨테이너 실행 (포트 개방)
docker run -d --name web -p 8080:80 nginx:alpine

# 2. 기본 페이지 확인
curl http://localhost:8080

# 3. 내부 접속 후 기본 HTML 위치 확인
docker exec -it web sh
/# ls /usr/share/nginx/html
/# exit

# 4. 기본 index.html을 호스트로 가져오기
docker cp web:/usr/share/nginx/html/index.html ./original-index.html

# 5. 새 index.html 만들어서 컨테이너에 복사
echo "<h1>Part VIII 실습 완료!</h1>" > new-index.html
docker cp new-index.html web:/usr/share/nginx/html/index.html

# 6. 변경 확인
curl http://localhost:8080

# 7. 정리
docker stop web && docker rm web
```

##### 체크포인트

- [ ] `docker exec -it <이름> sh`와 `docker attach <이름>`의 차이를 설명할 수 있다
- [ ] `docker exec`로 나온 후 컨테이너가 유지되는 이유를 설명할 수 있다
- [ ] `docker cp`로 컨테이너의 설정 파일을 호스트로 가져오는 명령을 작성할 수 있다
- [ ] `docker attach`에서 안전하게 빠져나오는 키 시퀀스를 알고 있다
- [ ] Alpine 기반 이미지에서 bash 대신 sh를 써야 하는 이유를 설명할 수 있다

---

### VIII-1-3. logs, inspect, stats — 상태 파악과 디버깅

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 실행 중인 컨테이너의 로그를 추적하고, 내부 설정값을 추출하고, 실시간 자원 사용량을 확인할 수 있다.
- **설명**:
  컨테이너가 예상대로 동작하지 않을 때 첫 번째로 확인하는 것이 로그(`docker logs`)다. 네트워크 설정이나 마운트 경로를 알아야 할 때는 `docker inspect`가 답을 준다. CPU와 메모리를 얼마나 쓰는지 보려면 `docker stats`를 쓴다. 세 명령을 순서대로 사용하면 대부분의 문제를 진단할 수 있다.
- **핵심 키워드**: `docker logs`, `docker inspect`, `docker stats`, `--format`, `--tail`, `--since`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-2
- **다음 섹션**: VIII-1-4

#### 본문

##### docker logs — 컨테이너 로그 확인

컨테이너 내부 애플리케이션이 stdout/stderr에 출력하는 내용을 Docker가 수집한다. `docker logs`로 이 내용을 볼 수 있다.

```bash
# 컨테이너 실행
docker run -d --name web nginx:alpine

# 전체 로그 출력
docker logs web

# 마지막 50줄만 출력
docker logs --tail 50 web

# 실시간 로그 추적 (tail -f 처럼)
docker logs -f web

# 마지막 50줄부터 실시간 추적
docker logs -f --tail 50 web
```

로그에 타임스탬프를 붙이려면 `-t`를 추가한다.

```bash
# 타임스탬프 포함
docker logs -t web

# 타임스탬프 + 실시간 추적
docker logs -ft web
```

##### 시간 필터로 로그 범위 좁히기

장애 발생 시각을 알면 로그 범위를 좁혀서 볼 수 있다.

```bash
# 최근 1시간 이내 로그
docker logs --since 1h web

# 최근 30분 이내 로그
docker logs --since 30m web

# 특정 시각 이후 로그 (ISO 8601 형식)
docker logs --since 2026-04-23T10:00:00 web

# 특정 시각 범위 (--since + --until)
docker logs --since 2026-04-23T09:00:00 --until 2026-04-23T10:00:00 web
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: 블랙박스 영상을 보는 것과 같다. 사고 전후 30분만 꺼내서 보는 것이 `--since`이고, 계속 실시간으로 보는 것이 `-f`이다.
> - **체감 예시**: 애플리케이션이 갑자기 응답을 안 한다. `docker logs -f --tail 100 app`으로 최근 100줄부터 실시간 로그를 보면서 어떤 에러가 반복되는지 확인한다.
> - **주의**: 컨테이너가 중지된 후에도 로그는 남아 있다. `docker ps -a`에서 보이는 중지된 컨테이너의 로그도 `docker logs`로 확인할 수 있다.

##### docker inspect — 컨테이너 전체 정보 조회

`docker inspect`는 컨테이너(또는 이미지, 네트워크, 볼륨)의 모든 설정을 JSON으로 출력한다.

```bash
# 컨테이너 전체 정보 (JSON)
docker inspect web

# JSON이 너무 길면 less로 보기
docker inspect web | less
```

JSON 전체를 보는 것보다 필요한 값만 추출하는 `--format` 옵션이 훨씬 실용적이다.

```bash
# IP 주소만 추출
docker inspect --format '{{.NetworkSettings.IPAddress}}' web

# 헬스체크 상태 확인
docker inspect --format '{{.State.Health.Status}}' web

# 컨테이너 상태 (running/exited 등)
docker inspect --format '{{.State.Status}}' web

# 마운트 정보 (볼륨/바인드 마운트)
docker inspect --format '{{range .Mounts}}{{.Source}} → {{.Destination}}{{println}}{{end}}' web

# 환경변수 목록
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' web

# 재시작 정책
docker inspect --format '{{.HostConfig.RestartPolicy.Name}}' web
```

> **[주니어 렌즈 ★★☆]**
> - **--format 문법**: Go 템플릿 문법을 사용한다. `{{.필드명}}`으로 값을 참조하고, `{{range .배열}}...{{end}}`로 반복한다. 처음에는 어렵게 느껴지지만, 자주 쓰는 패턴 3~4개만 외우면 된다.
> - **네트워크 vs IP**: `--network host`를 쓰면 컨테이너에 별도 IP가 없어서 `NetworkSettings.IPAddress`가 비어 있다. 이 경우 `docker inspect --format '{{.NetworkSettings.Networks}}'`로 전체 네트워크 정보를 확인한다.
> - **이미지에도 inspect 가능**: `docker inspect nginx:alpine`처럼 이미지에도 사용할 수 있다. 이미지의 레이어 수, 환경변수, CMD, ENTRYPOINT를 확인할 때 유용하다.

##### docker stats — 실시간 자원 사용량 모니터링

실행 중인 모든 컨테이너의 CPU, 메모리, 네트워크, 디스크 I/O를 실시간으로 표시한다.

```bash
# 모든 컨테이너 실시간 모니터링 (top 명령처럼 갱신됨)
docker stats

# 특정 컨테이너만 모니터링
docker stats web

# 스냅샷 (한 번만 출력하고 종료)
docker stats --no-stream

# 특정 컨테이너 스냅샷
docker stats --no-stream web
```

출력 예시:
```
CONTAINER ID   NAME    CPU %   MEM USAGE / LIMIT   MEM %   NET I/O       BLOCK I/O
a1b2c3d4e5f6   web     0.00%   3.5MiB / 7.7GiB     0.05%   1.2kB / 648B  0B / 0B
```

각 컬럼의 의미:

| 컬럼 | 의미 |
|:--|:--|
| CPU % | 전체 CPU 대비 사용률 |
| MEM USAGE / LIMIT | 현재 메모리 사용량 / 제한값 |
| MEM % | 제한값 대비 메모리 사용률 |
| NET I/O | 수신 / 송신 네트워크 데이터 |
| BLOCK I/O | 디스크 읽기 / 쓰기 |

> **[실무자 렌즈 ★★★]**
> - **inspect + jq**: `docker inspect`의 JSON 출력은 `jq`와 조합하면 훨씬 강력해진다. `docker inspect web | jq '.[0].NetworkSettings.Networks'`처럼 쓰면 --format 문법보다 직관적이다.
> - **stats의 한계**: `docker stats`는 현재 시점의 값을 보여줄 뿐, 과거 데이터를 저장하지 않는다. 시계열 모니터링이 필요하면 Prometheus + cAdvisor 또는 Datadog, Grafana Cloud 같은 도구를 사용한다.
> - **logs의 저장 위치**: Docker의 기본 로그 드라이버는 `json-file`이다. 로그는 호스트의 `/var/lib/docker/containers/<ID>/<ID>-json.log`에 저장된다. 별도 용량 제한 설정이 없으면 로그가 디스크를 가득 채울 수 있다. 프로덕션에서는 `max-size`와 `max-file` 설정을 반드시 한다.

##### 실습: postgres 컨테이너 상태 파악

```bash
# 1. postgres 컨테이너 실행
docker run -d --name db \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=myapp \
  postgres:16-alpine

# 2. 시작 로그 확인 (DB 초기화 완료 메시지 확인)
docker logs --tail 20 db

# 3. DB가 준비될 때까지 실시간 로그 추적
docker logs -f db
# "database system is ready to accept connections" 메시지 보이면 Ctrl+C

# 4. IP 주소 확인
docker inspect --format '{{.NetworkSettings.IPAddress}}' db

# 5. 마운트 정보 확인 (볼륨이 없으면 빈 배열)
docker inspect --format '{{json .Mounts}}' db

# 6. 자원 사용량 확인
docker stats --no-stream db

# 7. 정리
docker stop db && docker rm db
```

##### 체크포인트

- [ ] `docker logs -f --tail 50`이 하는 일을 설명할 수 있다
- [ ] `docker logs --since 1h`로 최근 1시간 로그를 볼 수 있다
- [ ] `docker inspect --format '{{.NetworkSettings.IPAddress}}'`로 컨테이너 IP를 추출할 수 있다
- [ ] `docker inspect --format '{{.State.Health.Status}}'`로 헬스체크 상태를 확인할 수 있다
- [ ] `docker stats --no-stream`과 `docker stats`의 차이를 설명할 수 있다

---

### VIII-1-4. system prune과 디스크 관리

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 Docker가 차지하는 디스크 공간을 파악하고, 안전하게 정리할 수 있다.
- **설명**:
  Docker를 계속 사용하다 보면 중지된 컨테이너, 사용하지 않는 이미지, 비어 있는 볼륨이 쌓인다. 이들이 디스크를 조금씩 잠식한다. `docker system df`로 현황을 파악하고, prune 명령으로 안전하게 정리할 수 있다. `docker system prune -a`는 한 번에 대량 삭제하는 강력한 명령이라 사용 전에 반드시 무엇이 삭제되는지 이해해야 한다.
- **핵심 키워드**: `docker system df`, `docker system prune`, `docker image prune`, `docker volume prune`, `docker container prune`, 댕글링 이미지
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-3
- **다음 섹션**: VIII-1-5

#### 본문

##### docker system df — 디스크 사용량 현황 파악

정리하기 전에 현황부터 파악한다. `docker system df`는 이미지, 컨테이너, 볼륨, 빌드 캐시가 각각 얼마나 차지하는지 요약해서 보여준다.

```bash
# 요약 보기
docker system df

# 상세 보기 (개별 항목 목록)
docker system df -v
```

출력 예시:
```
TYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE
Images          12      3        2.45GB    1.82GB (74%)
Containers      8       2        156MB     134MB (86%)
Local Volumes   5       2        1.2GB     800MB (66%)
Build Cache     24      0        512MB     512MB (100%)
```

`RECLAIMABLE`이 정리 가능한 용량이다. 이 숫자를 보고 정리 여부를 결정한다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 컴퓨터의 디스크 정리 도구와 같다. 무작정 파일을 지우기 전에 "이 폴더가 몇 GB인지" 먼저 확인하는 것처럼, `docker system df`로 어디에 얼마가 쌓여 있는지 먼저 본다.
> - **체감 예시**: 개발 노트북의 `/var/lib/docker`가 20GB를 넘어 디스크가 부족해졌다. `docker system df -v`로 확인해 보니 이전 스프린트에서 빌드한 이미지들이 15GB를 차지하고 있었다. `docker image prune`으로 사용하지 않는 이미지를 지워서 공간을 확보했다.
> - **주의**: macOS와 Windows에서는 Docker Desktop이 가상 디스크(vmdk, vhdx)를 사용한다. `system df`는 그 가상 디스크 안의 사용량을 보여준다.

##### 댕글링 이미지란

이미지를 새로 빌드하면 같은 태그의 이전 이미지는 태그를 잃고 `<none>:<none>`이 된다. 이를 댕글링(dangling) 이미지라고 한다. 실제로 사용되지 않지만 디스크를 차지한다.

```bash
# 댕글링 이미지 목록 확인
docker images -f dangling=true

# 댕글링 이미지만 삭제
docker image prune
```

##### docker system prune — 한 번에 정리

중지된 컨테이너 + 사용하지 않는 네트워크 + 댕글링 이미지 + 빌드 캐시를 한 번에 삭제한다.

```bash
# prune 실행 (삭제 전 확인 메시지 표시됨)
docker system prune

# 확인 메시지 없이 바로 실행
docker system prune -f
```

실행하면 아래처럼 어떤 항목이 삭제되는지 목록이 표시된다.

```
WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - all dangling build cache

Are you sure you want to continue? [y/N]
```

> **[주니어 렌즈 ★★☆]**
> - **prune의 범위 확인**: `docker system prune`은 실행 중인 컨테이너와 연결된 이미지는 삭제하지 않는다. "사용 중(active)"인 리소스는 건드리지 않는다.
> - **볼륨은 기본 제외**: `docker system prune`은 기본적으로 볼륨을 삭제하지 않는다. 볼륨에는 DB 데이터가 있을 수 있기 때문이다. 볼륨도 함께 지우려면 `--volumes` 플래그를 추가한다.
> - **빌드 캐시 별도 관리**: 빌드 캐시가 많이 쌓인 경우 `docker builder prune`으로만 캐시를 지울 수 있다. `docker system prune`도 기본적으로 빌드 캐시를 정리하지만, 캐시만 선택적으로 지우고 싶을 때 유용하다.

##### docker system prune -a — 주의 필요

`-a` 플래그를 추가하면 실행 중인 컨테이너에서 사용하지 않는 **모든** 이미지를 삭제한다. 댕글링 이미지뿐만 아니라 태그가 있는 이미지도 삭제된다.

```bash
# 경고: 사용하지 않는 모든 이미지 삭제
docker system prune -a

# 7일보다 오래된 것만 삭제 (--filter 활용)
docker system prune -a --filter "until=168h"
```

`-a`를 쓰면 다음에 필요할 때 이미지를 다시 pull해야 한다. 인터넷 환경이 느리거나 레지스트리 접근이 제한된 환경에서는 신중하게 사용한다.

##### 개별 prune 명령

전체가 아닌 특정 항목만 정리할 때 사용한다.

```bash
# 중지된 컨테이너만 삭제
docker container prune

# 댕글링 이미지만 삭제
docker image prune

# 사용하지 않는 볼륨만 삭제 (데이터 영구 삭제 — 주의!)
docker volume prune

# 사용하지 않는 네트워크만 삭제
docker network prune

# 빌드 캐시만 삭제
docker builder prune
```

각 명령이 삭제하는 대상을 정확히 이해하고 쓰는 것이 중요하다.

| 명령 | 삭제 대상 | 주의 수준 |
|:--|:--|:--|
| `container prune` | 중지된 컨테이너 | 낮음 |
| `image prune` | 댕글링 이미지 (`<none>:<none>`) | 낮음 |
| `image prune -a` | 사용하지 않는 모든 이미지 | 높음 |
| `volume prune` | 미사용 볼륨 (데이터 포함) | 매우 높음 |
| `network prune` | 미사용 네트워크 | 낮음 |
| `system prune` | 컨테이너+네트워크+댕글링 이미지+캐시 | 중간 |
| `system prune -a` | + 모든 미사용 이미지 | 높음 |
| `system prune -a --volumes` | + 볼륨 포함 | 매우 높음 |

##### --filter 옵션으로 안전하게 정리

무작정 전부 지우는 것보다 기준을 정해서 정리하면 더 안전하다.

```bash
# 24시간보다 오래된 중지된 컨테이너만 삭제
docker container prune --filter "until=24h"

# 특정 레이블이 붙은 이미지만 삭제
docker image prune --filter "label=env=dev"

# 48시간보다 오래된 빌드 캐시 삭제
docker builder prune --filter "until=48h"
```

##### 디스크 부족 시 대처 플로차트

```
디스크 부족 감지
        │
        ▼
docker system df -v 로 현황 파악
        │
        ├─── 빌드 캐시가 많다 ───► docker builder prune
        │
        ├─── 중지된 컨테이너가 많다 ───► docker container prune
        │
        ├─── 댕글링 이미지가 많다 ───► docker image prune
        │
        ├─── 오래된 이미지가 많다 ───► docker image prune -a --filter "until=168h"
        │
        └─── 미사용 볼륨이 있다 ───► docker volume ls 로 확인 후
                                      필요 없는 것만 docker volume rm <이름>
```

> **[실무자 렌즈 ★★★]**
> - **CI 서버 정기 정리**: CI 서버는 빌드할 때마다 이미지가 쌓인다. 매일 새벽 cron으로 `docker system prune -f`를 실행하거나, GitHub Actions의 self-hosted runner라면 워크플로우 마지막에 prune을 추가한다.
> - **볼륨 prune의 위험성**: `docker volume prune`은 어떤 컨테이너에도 연결되지 않은 볼륨을 삭제한다. 컨테이너를 삭제했지만 볼륨은 남겨둔 경우(데이터 보존 목적)도 삭제될 수 있다. 볼륨 이름을 명확히 관리하고, 삭제 전 `docker volume ls`로 목록을 확인한다.
> - **Docker Desktop 가상 디스크 축소**: macOS/Windows에서 `docker system prune`을 실행해도 호스트의 가상 디스크 파일 크기가 줄지 않을 수 있다. Docker Desktop의 "Clean / Purge data" 기능을 사용하거나, 가상 디스크를 직접 축소하는 절차가 필요하다.
> - **프로덕션 서버**: 프로덕션 서버에서 `docker system prune -a`를 실행하면 현재 사용하지 않는 이미지가 모두 삭제된다. 롤백 시 이전 버전 이미지를 다시 pull해야 하므로 레지스트리 접근이 보장되어 있을 때만 실행한다.

##### 체크포인트

- [ ] `docker system df`와 `docker system df -v`의 차이를 설명할 수 있다
- [ ] 댕글링 이미지가 무엇인지, 왜 생기는지 설명할 수 있다
- [ ] `docker system prune`과 `docker system prune -a`의 차이를 설명할 수 있다
- [ ] `docker volume prune`이 위험한 이유를 설명할 수 있다
- [ ] 디스크가 부족할 때 어떤 순서로 정리 명령을 실행할지 설명할 수 있다

---

### VIII-1-5. MySQL을 Docker로 실행하기

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 MySQL을 Docker 컨테이너로 실행하고, 볼륨으로 데이터를 영속화하고, CLI로 접속해서 기본 CRUD를 실행할 수 있다.
- **설명**:
  MySQL은 세계에서 가장 많이 쓰이는 관계형 데이터베이스(RDB)다. 개발 환경에서 MySQL을 Docker로 실행하면 설치·제거가 쉽고, 팀원과 완전히 동일한 버전을 쓸 수 있다. 이 Section에서는 `docker run`으로 MySQL 컨테이너를 띄우고, 환경변수로 초기 설정을 하고, 볼륨으로 데이터를 유지하는 방법을 익힌다.
- **핵심 키워드**: `mysql:8.0`, `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, 볼륨 영속화, `docker-entrypoint-initdb.d`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: V-1-2 (볼륨과 바인드 마운트), VIII-1-1 (docker run 핵심 옵션)
- **다음 섹션**: VIII-1-6

#### 본문

##### 왜 공식 이미지를 쓰나

Docker Hub에는 수많은 MySQL 이미지가 있지만, 반드시 `mysql:8.0`처럼 공식 이미지(Official Image)를 선택한다. 공식 이미지는 Docker와 MySQL 팀이 함께 관리하고, 보안 패치가 빠르게 적용된다. 태그에서 `latest` 대신 `8.0` 같은 버전을 고정하면 팀원 모두가 동일한 버전을 사용하게 된다.

```bash
# Docker Hub에서 mysql:8.0 이미지 확인
docker pull mysql:8.0

# 이미지 크기 확인
docker images mysql
```

##### 컨테이너 실행

MySQL 컨테이너를 실행할 때 반드시 루트 비밀번호를 환경변수로 전달해야 한다. 비밀번호 없이 실행하면 컨테이너가 즉시 중지된다.

```bash
# 기본 실행 (데이터 영속화 없음 — 실습 확인용)
docker run -d \
  --name mysql-demo \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=demo \
  -p 3306:3306 \
  mysql:8.0
```

```bash
# 컨테이너가 정상 시작되었는지 확인
docker ps

# MySQL 초기화 로그 확인 (시작에 10~30초 걸릴 수 있음)
docker logs -f mysql-demo
# "ready for connections" 메시지가 보이면 Ctrl+C
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: MySQL 컨테이너는 도시락 통에 DB를 넣어두는 것과 같다. 뚜껑(컨테이너)을 열면 DB가 바로 실행된다. 환경변수는 도시락을 만들기 전에 설정하는 레시피다.
> - **체감 예시**: 팀원이 "MySQL 8.0 써요"라고 하면, 예전에는 직접 설치해야 했다. 이제는 `docker run mysql:8.0` 한 줄이면 동일한 환경이 5초 안에 준비된다.
> - **주의**: `-e MYSQL_ROOT_PASSWORD`를 생략하면 컨테이너가 즉시 종료된다. `docker logs mysql-demo`에서 "No password option specified" 에러를 확인할 수 있다.

##### 환경변수 4가지

MySQL 공식 이미지는 초기 설정을 환경변수로 받는다. 자주 쓰는 4가지를 알면 충분하다.

| 환경변수 | 역할 | 예시 |
|:--|:--|:--|
| `MYSQL_ROOT_PASSWORD` | root 계정 비밀번호. 반드시 설정 (필수) | `rootpass` |
| `MYSQL_DATABASE` | 시작 시 자동 생성할 데이터베이스 이름 | `demo` |
| `MYSQL_USER` | 일반 사용자 계정 이름 | `appuser` |
| `MYSQL_PASSWORD` | MYSQL_USER의 비밀번호 | `apppass` |

`MYSQL_USER`와 `MYSQL_PASSWORD`를 함께 설정하면, root 말고 애플리케이션 전용 계정이 생성된다. 프로덕션에서는 root 계정 대신 권한이 제한된 전용 계정을 사용하는 것이 기본 원칙이다.

```bash
# 일반 사용자 계정까지 함께 생성
docker run -d \
  --name mysql-demo \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=demo \
  -e MYSQL_USER=appuser \
  -e MYSQL_PASSWORD=apppass \
  -p 3306:3306 \
  mysql:8.0
```

##### 볼륨으로 데이터 영속화

볼륨 마운트 없이 컨테이너를 삭제하면 DB 데이터가 모두 사라진다. MySQL의 데이터 저장 경로는 `/var/lib/mysql`이다. 이 경로를 Docker 볼륨에 연결하면 컨테이너를 삭제해도 데이터가 남는다.

```bash
# 볼륨을 먼저 생성
docker volume create mysql_data

# 볼륨 마운트와 함께 실행
docker run -d \
  --name mysql-demo \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=demo \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

##### 초기 SQL 파일 자동 실행

`/docker-entrypoint-initdb.d/` 경로에 `.sql` 파일을 마운트하면, 컨테이너가 처음 시작될 때 자동으로 실행된다. 테이블 생성이나 초기 데이터 삽입에 활용한다.

```bash
# init.sql 파일 예시 (호스트에서 작성)
cat > init.sql << 'EOF'
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES
  ('홍길동', 'hong@example.com'),
  ('김철수', 'kim@example.com');
EOF
```

```bash
# 초기 SQL 파일을 바인드 마운트로 주입
docker run -d \
  --name mysql-demo \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=demo \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  -v ./init.sql:/docker-entrypoint-initdb.d/01_init.sql:ro \
  mysql:8.0
```

> `:ro`는 read-only 마운트를 의미한다. 컨테이너가 해당 파일을 수정할 수 없게 보호한다. 초기화 파일은 볼륨 데이터가 이미 존재하면 실행되지 않는다. 컨테이너를 처음 생성할 때만 동작한다.

> **[주니어 렌즈 ★★☆]**
> - **초기화 파일 실행 순서**: `/docker-entrypoint-initdb.d/`에 여러 파일을 넣으면 알파벳 순서로 실행된다. `01_schema.sql` → `02_data.sql` 처럼 번호로 순서를 명시한다.
> - **볼륨이 이미 있으면**: 볼륨에 데이터가 존재하면 initdb.d 스크립트가 실행되지 않는다. 초기화를 다시 하려면 `docker volume rm mysql_data`로 볼륨을 지우고 다시 실행한다.
> - **포트 충돌**: 호스트에 MySQL이 이미 설치되어 있으면 3306 포트가 충돌한다. `-p 3307:3306`처럼 다른 호스트 포트를 사용하거나, 호스트 MySQL 서비스를 중지한다.

##### CLI로 접속해서 CRUD 실행

`docker exec`로 컨테이너 내부의 mysql 클라이언트를 실행한다.

```bash
# root 계정으로 접속 (-p 뒤에 비밀번호를 직접 입력)
docker exec -it mysql-demo mysql -u root -prootpass

# 또는 비밀번호를 프롬프트에서 입력 (보안상 권장)
docker exec -it mysql-demo mysql -u root -p
```

```sql
-- 데이터베이스 목록 확인
SHOW DATABASES;

-- demo 데이터베이스 사용
USE demo;

-- 테이블 확인
SHOW TABLES;

-- 데이터 조회
SELECT * FROM users;

-- 데이터 삽입
INSERT INTO users (name, email) VALUES ('이영희', 'lee@example.com');

-- 다시 조회
SELECT id, name, email FROM users;

-- 접속 종료
EXIT;
```

##### Docker Compose 버전

CLI 명령이 길어지면 관리하기 어렵다. Docker Compose 파일로 정리하면 한 번에 실행하고 재현할 수 있다. 예제 파일은 `examples/viii-1-5-mysql-docker/` 폴더를 참조한다.

```yaml
# examples/viii-1-5-mysql-docker/docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql-demo
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: demo
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/01_init.sql:ro
    restart: unless-stopped

volumes:
  mysql_data:
```

```bash
# 실행
docker compose up -d

# 로그 확인
docker compose logs -f mysql

# 중지 (데이터 유지)
docker compose down

# 중지 + 볼륨까지 삭제 (데이터 완전 삭제 — 주의!)
docker compose down -v
```

##### 데이터 생존 테스트

볼륨이 실제로 동작하는지 확인하는 방법이다.

```bash
# 1. 컨테이너 실행 후 데이터 삽입
docker compose up -d
docker exec -it mysql-demo mysql -u root -prootpass -e "USE demo; SELECT * FROM users;"

# 2. 컨테이너 삭제 (데이터 유지)
docker compose down

# 3. 컨테이너 재생성
docker compose up -d

# 4. 데이터가 살아 있는지 확인
docker exec -it mysql-demo mysql -u root -prootpass -e "USE demo; SELECT * FROM users;"
# 이전에 삽입한 데이터가 그대로 있으면 영속화 성공
```

> **경고**: `docker compose down -v`를 실행하면 named volume(`mysql_data`)이 삭제된다. 모든 DB 데이터가 사라지므로, 프로덕션 환경에서는 절대 실행하지 않는다.

> **[실무자 렌즈 ★★★]**
> - **환경변수 보안**: `MYSQL_ROOT_PASSWORD`를 compose.yml에 직접 쓰면 버전 관리에 노출된다. `env_file:` 옵션으로 `.env` 파일에서 읽거나, Docker Secrets(Swarm/K8s) 또는 AWS Secrets Manager 같은 외부 시크릿 관리 도구를 사용한다.
> - **커넥션 풀**: 애플리케이션에서 MySQL에 연결할 때 직접 커넥션을 여닫는 대신 커넥션 풀(connection pool)을 사용한다. SQLAlchemy의 `pool_size`, HikariCP의 `maximumPoolSize` 등을 설정하면 컨테이너 재시작 시 연결이 끊겨도 자동으로 복구된다.
> - **헬스체크 설정**: MySQL이 완전히 준비되기 전에 애플리케이션이 연결을 시도하면 에러가 발생한다. healthcheck에 `mysqladmin ping` 명령을 사용하고, 다른 서비스는 `depends_on.condition: service_healthy`로 순서를 보장한다.

##### 핵심 환경변수 및 볼륨 경로 요약

| 항목 | MySQL |
|:--|:--|
| 이미지 | `mysql:8.0` |
| 필수 환경변수 | `MYSQL_ROOT_PASSWORD` |
| 선택 환경변수 | `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` |
| 데이터 경로 | `/var/lib/mysql` |
| 초기화 스크립트 경로 | `/docker-entrypoint-initdb.d/` |
| 기본 포트 | `3306` |

##### 체크포인트

- [ ] `docker run`으로 MySQL 컨테이너를 실행하고 `docker ps`로 Running 상태를 확인할 수 있다
- [ ] `docker exec -it mysql-demo mysql -u root -p`로 CLI에 접속해서 SELECT를 실행할 수 있다
- [ ] 볼륨 마운트 없이 삭제하면 데이터가 사라지고, 볼륨을 연결하면 데이터가 유지됨을 실제로 확인할 수 있다
- [ ] `docker compose down`과 `docker compose down -v`의 차이를 설명할 수 있다
- [ ] `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` 네 환경변수의 역할을 설명할 수 있다

---

### VIII-1-6. Redis를 Docker로 실행하기

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 Redis를 Docker 컨테이너로 실행하고, redis-cli로 기본 명령을 실행하고, 데이터 영속화를 설정할 수 있다.
- **설명**:
  Redis는 메모리 기반의 키-값 저장소다. 데이터를 메모리에 올려두기 때문에 읽기·쓰기 속도가 관계형 데이터베이스보다 월등히 빠르다. 세션 저장, 캐시, 실시간 랭킹, 메시지 큐 등 다양한 용도로 쓰인다. Docker로 실행하면 설치 없이 바로 Redis 환경을 만들 수 있다.
- **핵심 키워드**: `redis:7-alpine`, `redis-cli`, `SET/GET/DEL/EXPIRE/TTL`, AOF 영속화, `--requirepass`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: V-1-2 (볼륨과 바인드 마운트), VIII-1-1 (docker run 핵심 옵션)
- **다음 섹션**: VIII-1-7

#### 본문

##### redis:7-alpine 이미지

`redis:7-alpine`은 Alpine Linux(5MB 수준의 경량 리눅스)를 기반으로 만든 이미지다. `redis:7`(데비안 기반, 약 120MB)보다 훨씬 작아서 컨테이너 시작이 빠르고 보안 취약점 노출도 적다. 개발·프로덕션 모두에서 alpine 버전을 권장한다.

```bash
# 이미지 크기 비교
docker pull redis:7
docker pull redis:7-alpine
docker images redis
# REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
# redis        7         ...            ...            ~120MB
# redis        7-alpine  ...            ...            ~30MB
```

##### 컨테이너 실행

Redis는 환경변수 없이도 실행된다. 기본 설정으로 바로 시작할 수 있다.

```bash
# 기본 실행
docker run -d \
  --name redis-demo \
  -p 6379:6379 \
  redis:7-alpine
```

```bash
# 실행 확인
docker ps

# 시작 로그 확인
docker logs redis-demo
# "Ready to accept connections" 메시지가 보이면 정상
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: Redis는 아주 빠른 메모장이다. 서랍(메모리)에 메모를 넣고 꺼내는 속도가 일반 파일 캐비넷(데이터베이스)보다 수백 배 빠르다. 대신 전기가 꺼지면 서랍 내용이 사라진다 — 영속화를 설정하지 않으면.
> - **체감 예시**: 로그인한 사용자 정보를 MySQL에서 매번 조회하면 느리다. Redis에 5분 동안 저장해두면 같은 조회가 수십 배 빨라진다.
> - **주의**: Redis는 기본적으로 인증 없이 누구나 접속할 수 있다. 개발 환경이라도 포트를 외부에 노출하지 않도록 주의한다.

##### redis-cli로 접속

`docker exec`로 컨테이너 내부의 redis-cli를 실행한다.

```bash
# redis-cli 접속
docker exec -it redis-demo redis-cli

# 접속 확인 (서버에 ping을 보내면 PONG으로 응답)
127.0.0.1:6379> PING
PONG
```

##### 기본 명령 실습

Redis의 핵심 명령을 익힌다. 키-값(key-value) 구조로 데이터를 저장한다.

```bash
# SET: 값 저장
127.0.0.1:6379> SET username "홍길동"
OK

# GET: 값 조회
127.0.0.1:6379> GET username
"홍길동"

# DEL: 키 삭제
127.0.0.1:6379> DEL username
(integer) 1

# KEYS: 키 목록 조회 (* = 모든 키)
127.0.0.1:6379> KEYS *
(empty array)
```

```bash
# EXPIRE: 만료 시간 설정 (초 단위)
127.0.0.1:6379> SET session_token "abc123"
OK
127.0.0.1:6379> EXPIRE session_token 300
(integer) 1

# TTL: 남은 만료 시간 확인 (초 단위)
127.0.0.1:6379> TTL session_token
(integer) 298

# SETEX: SET + EXPIRE 한 번에 (키, 만료시간, 값)
127.0.0.1:6379> SETEX cache_key 60 "cached_data"
OK

# 접속 종료
127.0.0.1:6379> EXIT
```

| 명령 | 설명 | 예시 |
|:--|:--|:--|
| `SET key value` | 값 저장 | `SET name "홍길동"` |
| `GET key` | 값 조회 | `GET name` |
| `DEL key` | 키 삭제 | `DEL name` |
| `KEYS pattern` | 키 목록 조회 | `KEYS *`, `KEYS user:*` |
| `EXPIRE key seconds` | 만료 시간 설정 | `EXPIRE session 300` |
| `TTL key` | 남은 만료 시간 확인 | `TTL session` |
| `SETEX key seconds value` | 저장과 동시에 만료 설정 | `SETEX token 60 "abc"` |

> **[주니어 렌즈 ★★☆]**
> - **KEYS * 주의**: 프로덕션에서 `KEYS *`는 절대 사용하지 않는다. 키 수가 많으면 Redis가 수 초 동안 응답하지 않는다. 대신 `SCAN` 명령을 쓴다.
> - **데이터 타입**: Redis는 String 외에도 List, Hash, Set, Sorted Set 등 다양한 타입을 지원한다. 세션은 Hash, 랭킹은 Sorted Set이 자주 쓰인다.
> - **네임스페이스 관리**: 키 이름을 `user:1:session`, `product:42:cache` 처럼 콜론으로 구분해서 관리하면 충돌을 방지하고 패턴 검색이 쉬워진다.

##### 패스워드 설정

Redis는 기본적으로 인증 없이 접속 가능하다. `--requirepass` 옵션으로 비밀번호를 설정한다.

```bash
# 패스워드 설정과 함께 실행
docker run -d \
  --name redis-demo \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --requirepass "mypassword"
```

```bash
# 패스워드 없이 접속하면 에러
docker exec -it redis-demo redis-cli
127.0.0.1:6379> PING
(error) NOAUTH Authentication required.

# 패스워드로 인증
127.0.0.1:6379> AUTH mypassword
OK
127.0.0.1:6379> PING
PONG

# 또는 접속 시 바로 인증
docker exec -it redis-demo redis-cli -a mypassword
```

##### 데이터 영속화 (AOF)

Redis는 메모리 기반이므로 컨테이너를 재시작하면 데이터가 사라진다. `--appendonly yes` 옵션으로 AOF(Append Only File) 영속화를 활성화하면, 모든 쓰기 명령을 파일에 기록해서 재시작 후에도 데이터를 복구할 수 있다.

```bash
# AOF 영속화 + 볼륨 마운트 + 패스워드 설정
docker run -d \
  --name redis-demo \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine \
  redis-server --requirepass "mypassword" --appendonly yes
```

Redis의 데이터 저장 경로는 `/data`다. 이 경로를 Docker 볼륨에 연결한다.

##### Docker Compose 버전

예제 파일은 `examples/viii-1-6-redis-docker/` 폴더를 참조한다.

```yaml
# examples/viii-1-6-redis-docker/docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    container_name: redis-demo
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --requirepass "mypassword" --appendonly yes
    restart: unless-stopped

volumes:
  redis_data:
```

```bash
# 실행
docker compose up -d

# redis-cli 접속 (패스워드 포함)
docker exec -it redis-demo redis-cli -a mypassword

# 중지 (데이터 유지)
docker compose down

# 중지 + 볼륨 삭제 (데이터 완전 삭제 — 주의!)
docker compose down -v
```

##### Redis를 활용하는 실제 시나리오

Redis는 다양한 용도로 사용된다. 아래는 가장 흔한 3가지 패턴이다.

| 시나리오 | 설명 | TTL 설정 |
|:--|:--|:--|
| 세션 스토어 | 로그인 세션 정보 저장 (서버 확장 시 공유 가능) | 로그인 유지 시간 (예: 1800초) |
| API 응답 캐시 | 자주 조회되지만 잘 바뀌지 않는 데이터 캐싱 | 데이터 갱신 주기에 따라 |
| 속도 제한 | API 요청 횟수 카운팅 (rate limiting) | 1분, 1시간 등 윈도우 크기 |

```bash
# 세션 저장 예시
SET session:user:42 '{"userId":42,"role":"admin"}' EX 1800

# 캐시 저장 예시
SET cache:products:list '[{"id":1,"name":"상품A"},...]' EX 300

# 요청 횟수 카운팅 예시
INCR rate:ip:192.168.1.1:minute:202604231530
EXPIRE rate:ip:192.168.1.1:minute:202604231530 60
```

> **[실무자 렌즈 ★★★]**
> - **AOF vs RDB**: Redis의 영속화 방식은 두 가지다. AOF는 모든 쓰기 명령을 로그 파일에 기록해서 복구 정확도가 높다. RDB는 주기적으로 스냅샷을 저장해서 파일이 작고 복구 속도가 빠르다. 프로덕션에서는 두 가지를 함께 쓰는 것이 권장된다.
> - **메모리 정책**: Redis는 메모리가 가득 차면 설정된 eviction 정책(LRU, LFU 등)에 따라 오래된 키를 자동으로 삭제한다. 캐시 용도라면 `maxmemory-policy allkeys-lru`를 설정한다.
> - **Redis Cluster vs Sentinel**: 단일 Redis 노드는 단일 장애점(SPOF)이 된다. 프로덕션에서는 Sentinel(장애 감지·자동 페일오버)이나 Cluster(샤딩·수평 확장)를 사용한다. AWS ElastiCache, GCP Memorystore 같은 관리형 서비스도 고려한다.

##### 핵심 설정 요약

| 항목 | Redis |
|:--|:--|
| 이미지 | `redis:7-alpine` |
| 인증 옵션 | `redis-server --requirepass <비밀번호>` |
| 영속화 옵션 | `redis-server --appendonly yes` |
| 데이터 경로 | `/data` |
| 기본 포트 | `6379` |

##### 체크포인트

- [ ] `docker run redis:7-alpine`으로 컨테이너를 실행하고 `docker logs`에서 "Ready to accept connections" 메시지를 확인할 수 있다
- [ ] `docker exec -it redis-demo redis-cli`로 접속해서 `SET`, `GET`, `EXPIRE`, `TTL` 명령을 실행할 수 있다
- [ ] `--requirepass` 옵션으로 패스워드를 설정하고, 인증 없이 접속하면 에러가 발생함을 확인할 수 있다
- [ ] `--appendonly yes`와 볼륨 마운트를 설정하고, 컨테이너 재시작 후에도 데이터가 살아 있음을 확인할 수 있다
- [ ] Redis를 캐시, 세션, 속도 제한 중 어떤 시나리오에서 사용하는지 설명할 수 있다

---

### VIII-1-7. MongoDB를 Docker로 실행하기

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 MongoDB를 Docker 컨테이너로 실행하고, mongosh로 기본 CRUD를 실행하고, 볼륨으로 데이터를 영속화할 수 있다.
- **설명**:
  MongoDB는 JSON과 유사한 BSON 형식으로 데이터를 저장하는 대표적인 NoSQL 데이터베이스다. 고정된 스키마(테이블 구조)가 없어서 자유롭게 데이터를 저장할 수 있다. API 서버의 응답 데이터, 사용자별로 구조가 다른 데이터, 빠르게 변하는 스키마 등에 적합하다.
- **핵심 키워드**: `mongo:7`, `mongosh`, `insertOne/find/updateOne/deleteOne`, `MONGO_INITDB_ROOT_USERNAME`, 볼륨 영속화
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: V-1-2 (볼륨과 바인드 마운트), VIII-1-1 (docker run 핵심 옵션)
- **다음 섹션**: VIII-1-8

#### 본문

##### RDB vs NoSQL — 간단 비교

MongoDB를 시작하기 전에 MySQL/PostgreSQL 같은 관계형 데이터베이스(RDB)와의 차이를 이해하면 언제 어떤 것을 쓸지 판단할 수 있다.

| 항목 | RDB (MySQL, PostgreSQL) | NoSQL (MongoDB) |
|:--|:--|:--|
| 데이터 형식 | 행(Row)과 열(Column), 고정 스키마 | 문서(Document), 유연한 스키마 |
| 쿼리 언어 | SQL | MongoDB Query Language (MQL) |
| 관계 표현 | 외래 키, JOIN | 임베딩 또는 참조 |
| 확장 방식 | 수직 확장 (서버 업그레이드) 주도 | 수평 확장 (샤딩) 유리 |
| 적합한 경우 | 정형 데이터, 복잡한 조인, 트랜잭션 | 비정형 데이터, 빠른 스키마 변경, 대용량 |

##### 컨테이너 실행

MongoDB는 `MONGO_INITDB_ROOT_USERNAME`과 `MONGO_INITDB_ROOT_PASSWORD` 환경변수로 최초 관리자 계정을 설정한다. 설정하지 않으면 인증 없이 접속되는 취약한 상태가 된다.

```bash
# 기본 실행 (인증 설정 포함)
docker run -d \
  --name mongo-demo \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=mongopass \
  -p 27017:27017 \
  mongo:7
```

```bash
# 실행 확인
docker ps

# 초기화 로그 확인
docker logs -f mongo-demo
# "Waiting for connections" 메시지가 보이면 준비 완료. Ctrl+C
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: MongoDB는 마치 서랍장에 봉투를 넣는 것과 같다. MySQL이 엄격한 서식지(테이블 구조)에 맞춰 작성해야 한다면, MongoDB는 봉투 안에 자유롭게 내용물을 넣을 수 있다. 봉투마다 내용물이 달라도 된다.
> - **체감 예시**: 사용자마다 프로필 필드가 다른 SNS 서비스를 만든다고 하자. MySQL은 모든 사용자에게 동일한 컬럼이 필요하지만, MongoDB는 각 문서에 서로 다른 필드를 넣을 수 있다.
> - **용어 대응**: MongoDB의 `데이터베이스 > 컬렉션 > 문서`는 RDB의 `데이터베이스 > 테이블 > 행`에 대응한다.

##### mongosh로 접속

MongoDB 7 이상에서는 구형 `mongo` 클라이언트 대신 `mongosh`를 사용한다.

```bash
# mongosh로 접속 (인증 포함)
docker exec -it mongo-demo mongosh -u root -p mongopass

# 접속 확인
test> db.runCommand({ ping: 1 })
{ ok: 1 }
```

##### 기본 CRUD 실습

MongoDB의 모든 데이터는 컬렉션(collection) 안에 문서(document) 형태로 저장된다.

```javascript
// 데이터베이스 전환 (없으면 자동 생성)
test> use demo
switched to db demo

// 문서 삽입 (insertOne)
demo> db.users.insertOne({
  name: "홍길동",
  email: "hong@example.com",
  age: 30,
  tags: ["admin", "developer"]
})
// 응답: { acknowledged: true, insertedId: ObjectId('...') }
```

```javascript
// 여러 문서 삽입 (insertMany)
demo> db.users.insertMany([
  { name: "김철수", email: "kim@example.com", age: 25 },
  { name: "이영희", email: "lee@example.com", age: 28, role: "manager" }
])
```

```javascript
// 전체 조회 (find)
demo> db.users.find()

// 조건 조회 (age가 26 이상인 문서)
demo> db.users.find({ age: { $gte: 26 } })

// 특정 필드만 조회 (name, email만, _id 제외)
demo> db.users.find({}, { name: 1, email: 1, _id: 0 })
```

```javascript
// 단일 문서 수정 (updateOne)
demo> db.users.updateOne(
  { name: "홍길동" },           // 조건
  { $set: { age: 31 } }        // 수정 내용
)

// 단일 문서 삭제 (deleteOne)
demo> db.users.deleteOne({ name: "김철수" })

// 컬렉션의 모든 문서 수 확인
demo> db.users.countDocuments()

// 접속 종료
demo> exit
```

> **[주니어 렌즈 ★★☆]**
> - **_id 필드**: MongoDB는 모든 문서에 자동으로 `_id` 필드를 추가한다. `ObjectId`라는 12바이트 고유 식별자다. 직접 지정할 수도 있지만, 자동 생성이 중복 없이 고유함을 보장한다.
> - **$연산자**: 조회와 수정에 `$gte`(이상), `$lte`(이하), `$set`(설정), `$push`(배열 추가) 같은 연산자를 사용한다. MySQL의 WHERE 절과 UPDATE SET에 대응한다.
> - **스키마가 없다는 뜻**: 컬렉션에 `age` 필드가 있는 문서와 없는 문서가 공존할 수 있다. 유연하지만 애플리케이션 레벨에서 스키마를 검증하지 않으면 데이터 품질이 낮아진다. Mongoose(Node.js)나 Motor+Pydantic(Python) 같은 ODM(Object-Document Mapper)을 사용하면 스키마를 강제할 수 있다.

##### 환경변수와 인증 설정

| 환경변수 | 역할 | 예시 |
|:--|:--|:--|
| `MONGO_INITDB_ROOT_USERNAME` | 최초 관리자 계정 이름 | `root` |
| `MONGO_INITDB_ROOT_PASSWORD` | 최초 관리자 계정 비밀번호 | `mongopass` |
| `MONGO_INITDB_DATABASE` | 초기화 스크립트가 실행될 데이터베이스 | `demo` |

##### 초기 스크립트 자동 실행

`/docker-entrypoint-initdb.d/` 경로에 `.js` 또는 `.sh` 파일을 마운트하면, 컨테이너 첫 실행 시 자동으로 실행된다.

```javascript
// init.js 파일 예시 (호스트에서 작성)
db = db.getSiblingDB('demo');

db.createCollection('users');

db.users.insertMany([
  { name: "초기 사용자 A", email: "a@example.com", role: "admin" },
  { name: "초기 사용자 B", email: "b@example.com", role: "user" }
]);

print("초기 데이터 삽입 완료");
```

```bash
# 초기 스크립트 마운트
docker run -d \
  --name mongo-demo \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=mongopass \
  -e MONGO_INITDB_DATABASE=demo \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  -v ./init.js:/docker-entrypoint-initdb.d/01_init.js:ro \
  mongo:7
```

##### 볼륨 영속화

MongoDB의 데이터 저장 경로는 `/data/db`다. 이 경로를 Docker 볼륨에 연결한다.

```bash
# 볼륨 생성 후 실행
docker volume create mongo_data

docker run -d \
  --name mongo-demo \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=mongopass \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  mongo:7
```

##### Docker Compose 버전

예제 파일은 `examples/viii-1-7-mongodb-docker/` 폴더를 참조한다.

```yaml
# examples/viii-1-7-mongodb-docker/docker-compose.yml
services:
  mongo:
    image: mongo:7
    container_name: mongo-demo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: mongopass
      MONGO_INITDB_DATABASE: demo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./init.js:/docker-entrypoint-initdb.d/01_init.js:ro
    restart: unless-stopped

volumes:
  mongo_data:
```

```bash
# 실행
docker compose up -d

# mongosh 접속
docker exec -it mongo-demo mongosh -u root -p mongopass

# 중지 (데이터 유지)
docker compose down

# 중지 + 볼륨 삭제 (데이터 완전 삭제 — 주의!)
docker compose down -v
```

##### 데이터 생존 테스트

```bash
# 1. 실행 후 문서 삽입
docker compose up -d
docker exec -it mongo-demo mongosh -u root -p mongopass \
  --eval "use demo; db.users.insertOne({name:'테스트'}); db.users.find();"

# 2. 컨테이너 삭제 (볼륨 유지)
docker compose down

# 3. 재생성
docker compose up -d

# 4. 데이터 확인
docker exec -it mongo-demo mongosh -u root -p mongopass \
  --eval "use demo; db.users.find();"
# 이전에 삽입한 문서가 그대로 있으면 영속화 성공
```

> **[실무자 렌즈 ★★★]**
> - **인증 우회 주의**: `MONGO_INITDB_ROOT_USERNAME`을 설정하지 않으면 MongoDB가 `--noauth` 모드로 실행된다. 네트워크에 노출되어 있다면 누구나 DB에 접근할 수 있다. 반드시 인증을 설정한다.
> - **Replica Set**: 프로덕션에서 MongoDB는 단일 노드로 쓰지 않는다. 최소 3개 노드로 구성된 Replica Set을 사용해야 장애 시 자동 페일오버와 데이터 복제가 보장된다. MongoDB Atlas, AWS DocumentDB 같은 관리형 서비스가 이를 자동으로 처리해준다.
> - **ODM 활용**: 애플리케이션에서 직접 MongoDB 드라이버를 쓰면 스키마 없는 특성 때문에 데이터 품질 관리가 어렵다. Node.js는 Mongoose, Python은 Beanie(Pydantic 기반) 또는 Motor를 활용해서 문서 구조를 코드로 정의한다.

##### DB별 핵심 환경변수 및 볼륨 경로 비교

세 DB를 나란히 비교하면 공통 패턴이 보인다.

| 항목 | MySQL | Redis | MongoDB |
|:--|:--|:--|:--|
| 이미지 | `mysql:8.0` | `redis:7-alpine` | `mongo:7` |
| 필수 환경변수 | `MYSQL_ROOT_PASSWORD` | (없음) | `MONGO_INITDB_ROOT_USERNAME` + `PASSWORD` |
| 선택 환경변수 | `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` | `--requirepass` (커맨드 옵션) | `MONGO_INITDB_DATABASE` |
| 데이터 경로 | `/var/lib/mysql` | `/data` | `/data/db` |
| 초기화 스크립트 | `/docker-entrypoint-initdb.d/` (`.sql`) | 없음 | `/docker-entrypoint-initdb.d/` (`.js`, `.sh`) |
| 기본 포트 | `3306` | `6379` | `27017` |
| 접속 CLI | `mysql -u root -p` | `redis-cli` | `mongosh -u root -p` |

##### 체크포인트

- [ ] `docker run`으로 MongoDB 컨테이너를 실행하고 `docker logs`에서 "Waiting for connections" 메시지를 확인할 수 있다
- [ ] `docker exec -it mongo-demo mongosh -u root -p mongopass`로 접속해서 `insertOne`, `find`, `updateOne`, `deleteOne`을 실행할 수 있다
- [ ] MySQL과 MongoDB의 용어 대응(데이터베이스/테이블/행 vs 데이터베이스/컬렉션/문서)을 설명할 수 있다
- [ ] 볼륨 마운트로 데이터를 영속화하고, 컨테이너 재생성 후에도 데이터가 유지됨을 확인할 수 있다
- [ ] MySQL, Redis, MongoDB 중 어떤 상황에 어떤 DB를 선택할지 기준을 말할 수 있다

---

### VIII-1-8. DB 3종 비교와 Compose 조합

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 MySQL, Redis, MongoDB를 하나의 docker-compose.yml로 동시에 실행하고, 각 DB에 접속하여 동작을 확인하고, 선택적으로 특정 서비스만 실행할 수 있다.
- **설명**:
  실무 백엔드 프로젝트는 단일 DB만 쓰지 않는 경우가 많다. 사용자 데이터는 MySQL에, 세션·캐시는 Redis에, 로그나 반정형 데이터는 MongoDB에 저장하는 조합이 대표적이다. Compose를 사용하면 이 세 DB를 하나의 파일로 정의하고 명령어 하나로 실행할 수 있다.
- **핵심 키워드**: `docker compose up -d`, 멀티 서비스 Compose, `healthcheck`, 선택적 서비스 실행, DB 비교표
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-5 (MySQL), VIII-1-6 (Redis), VIII-1-7 (MongoDB)
- **다음 섹션**: VIII-1-9

#### 본문

##### 왜 여러 DB를 함께 쓰는가?

"DB는 하나만 쓰면 안 되나요?"라는 질문이 자연스럽다. 하나의 DB로도 모든 데이터를 저장할 수 있지만, 각 DB는 잘하는 영역이 다르다.

| 역할 | 적합한 DB | 이유 |
|:--|:--|:--|
| 사용자 정보, 주문 이력 등 정형 데이터 | MySQL (또는 PostgreSQL) | 관계형 모델, 트랜잭션, 복잡한 JOIN |
| 로그인 세션, 캐시, 속도 제한 | Redis | 인메모리 고속 읽기/쓰기, TTL 기능 |
| API 응답 저장, 이벤트 로그, 반정형 데이터 | MongoDB | 유연한 스키마, 문서 중심 모델 |

이 세 DB를 Compose로 묶으면 로컬 개발 환경을 실제 프로덕션 구성과 유사하게 만들 수 있다.

##### 하나의 Compose 파일로 3개 DB 실행

예제 파일은 `examples/viii-1-8-db-trio-compose/` 폴더를 참조한다.

```yaml
# examples/viii-1-8-db-trio-compose/docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    container_name: trio-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: demo
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpass"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: trio-redis
    command: redis-server --requirepass redispass --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redispass", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  mongo:
    image: mongo:7
    container_name: trio-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: mongopass
      MONGO_INITDB_DATABASE: demo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "-u", "root", "-p", "mongopass", "--eval", "db.adminCommand('ping').ok"]
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
  mongo_data:
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: 주방에 냉장고(MySQL), 선반(Redis), 서랍장(MongoDB)이 모두 있다. 냉장고는 신선한 재료를 정렬해서 보관하고, 선반은 자주 꺼내는 재료를 빠르게 꺼낼 수 있도록 놓고, 서랍장은 형태가 다양한 물건을 자유롭게 넣는다. 셋 다 있어야 주방이 효율적으로 돌아간다.
> - **핵심 명령 하나**: `docker compose up -d`를 실행하면 세 DB가 모두 백그라운드에서 시작된다. `docker compose down`으로 모두 멈출 수 있다.

##### 3개 DB 동시 실행 및 접속 확인

```bash
# examples/viii-1-8-db-trio-compose/ 폴더에서 실행
docker compose up -d

# 서비스 상태 확인
docker compose ps
```

예상 출력 (healthy 상태가 되기까지 30초 정도 기다린다):

```
NAME          IMAGE           STATUS
trio-mysql    mysql:8.0       Up (healthy)
trio-redis    redis:7-alpine  Up (healthy)
trio-mongo    mongo:7         Up (healthy)
```

```bash
# MySQL 접속 확인
docker exec -it trio-mysql mysql -u root -prootpass -e "SHOW DATABASES;"

# Redis 접속 확인
docker exec -it trio-redis redis-cli -a redispass ping
# 응답: PONG

# MongoDB 접속 확인
docker exec -it trio-mongo mongosh --quiet -u root -p mongopass \
  --eval "db.adminCommand('ping')"
# 응답: { ok: 1 }
```

> **[주니어 렌즈 ★★☆]**
> - **헬스체크 비교**: 각 DB마다 헬스체크 명령이 다르다. MySQL은 `mysqladmin ping`, Redis는 `redis-cli ping`, MongoDB는 `mongosh --eval "db.adminCommand('ping')"` 방식을 사용한다. `start_period`는 컨테이너가 처음 뜰 때 초기화에 걸리는 시간을 감안해서 헬스체크를 유예하는 설정이다.
> - **포트 충돌**: 호스트에 이미 MySQL, Redis, MongoDB가 설치되어 있다면 포트가 충돌한다. `3306`, `6379`, `27017`이 이미 사용 중인지 `docker compose up` 실행 전에 확인한다.
> - **볼륨 독립성**: 각 DB가 서로 다른 볼륨(`mysql_data`, `redis_data`, `mongo_data`)을 사용한다. `docker compose down -v`를 실행하면 세 볼륨이 모두 삭제되므로 주의한다.

##### 각 DB 헬스체크 설정 비교

| 항목 | MySQL | Redis | MongoDB |
|:--|:--|:--|:--|
| 헬스체크 명령 | `mysqladmin ping -h localhost` | `redis-cli ping` | `mongosh --eval "db.adminCommand('ping')"` |
| `interval` 권장값 | 10s | 10s | 15s |
| `start_period` 필요 | O (초기화 30s 이상) | X (즉시 준비) | O (초기화 30s 이상) |
| 인증 옵션 포함 | `-u root -p<패스워드>` | `-a <패스워드>` | `-u root -p <패스워드>` |

##### 선택적 서비스 실행

`docker compose up` 뒤에 서비스 이름을 지정하면 특정 서비스만 실행할 수 있다.

```bash
# MySQL과 Redis만 실행
docker compose up -d mysql redis

# MongoDB만 추가로 실행
docker compose up -d mongo

# 특정 서비스만 중지 (나머지는 계속 실행)
docker compose stop redis

# 특정 서비스만 재시작
docker compose restart mysql

# 특정 서비스 로그만 확인
docker compose logs -f mongo
```

이 기능은 개발 중 필요한 DB만 선택적으로 켜고 끌 때 유용하다. CI 환경에서 테스트 종류에 따라 필요한 서비스만 띄울 때도 활용한다.

> **[실무자 렌즈 ★★★]**
> - **서비스 분리 vs 통합**: 로컬 개발용 Compose에는 세 DB를 하나로 묶는 것이 편리하지만, 프로덕션에서는 각 DB를 독립적으로 관리하는 것이 일반적이다. 데이터베이스는 Kubernetes에서 StatefulSet으로 배포하거나, AWS RDS·ElastiCache·Atlas 같은 관리형 서비스를 사용한다.
> - **Compose profiles**: `profiles: [dev]` 설정을 이용하면 `--profile dev` 옵션을 붙인 경우에만 특정 서비스가 실행되도록 할 수 있다. 모니터링 툴이나 관리자 UI 등 옵션 서비스에 활용한다.
> - **네트워크 격리**: 동일 Compose 파일 안에 있는 서비스는 기본적으로 같은 브리지 네트워크에 연결된다. 애플리케이션 서버가 DB에 접근할 때 컨테이너 이름(`mysql`, `redis`, `mongo`)을 호스트명으로 사용할 수 있다.

##### 체크포인트

- [ ] `docker compose up -d`로 MySQL, Redis, MongoDB 3개를 동시에 실행하고 `docker compose ps`에서 모두 `healthy` 상태임을 확인할 수 있다
- [ ] 각 DB에 대응하는 CLI(`mysql`, `redis-cli`, `mongosh`)로 접속하여 기본 명령을 실행할 수 있다
- [ ] `docker compose up -d mysql redis`로 MongoDB를 제외한 두 서비스만 선택적으로 실행할 수 있다
- [ ] MySQL, Redis, MongoDB의 헬스체크 명령과 `start_period`가 왜 다른지 설명할 수 있다
- [ ] 어떤 데이터는 MySQL에, 어떤 데이터는 Redis에, 어떤 데이터는 MongoDB에 저장하는 것이 적합한지 예를 들어 설명할 수 있다

---

### VIII-1-9. Spring Boot 앱 Docker화

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 Spring Boot 애플리케이션을 멀티 스테이지 Dockerfile로 빌드하고, JDK와 JRE를 분리하여 최소 크기의 실행 이미지를 만들고, 비루트 사용자로 안전하게 실행할 수 있다.
- **설명**:
  Java 애플리케이션을 Docker로 배포할 때 가장 흔한 실수는 JDK(개발 도구 전체)가 포함된 이미지를 그대로 실행에 사용하는 것이다. JDK 이미지는 1GB를 넘기도 하지만, 실행에 필요한 JRE 이미지는 200MB 수준이다. 멀티 스테이지 빌드를 사용하면 빌드 환경과 실행 환경을 분리하여 크기를 크게 줄일 수 있다.
- **핵심 키워드**: `eclipse-temurin:21-jdk`, `eclipse-temurin:21-jre-alpine`, 멀티 스테이지 빌드, `./gradlew bootJar`, 비루트 사용자
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: IV-1-3 (멀티 스테이지 빌드), VIII-1-1 (docker run 핵심 옵션)
- **다음 섹션**: VIII-1-10

#### 본문

##### JDK vs JRE — 왜 분리해야 하는가

Java 개발 도구(JDK)에는 컴파일러(`javac`), 디버거, 프로파일러 등이 포함되어 있다. 하지만 배포된 애플리케이션을 **실행**하는 데는 JRE(Java Runtime Environment)만 있으면 된다.

```
JDK 이미지 (eclipse-temurin:21-jdk)       ~700MB
  ├── JRE (실행 환경)
  ├── javac (컴파일러)
  ├── jdb (디버거)
  ├── jvisualvm (프로파일러)
  └── ... 개발 도구 전체

JRE 이미지 (eclipse-temurin:21-jre-alpine) ~190MB
  └── JRE (실행 환경)만
```

멀티 스테이지 빌드를 사용하면 JDK로 JAR을 빌드한 뒤, JRE만 있는 경량 이미지에 JAR만 복사해서 실행 이미지를 만든다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 케이크를 만들 때 오븐, 밀가루, 계량컵, 믹서기 등 모든 도구가 필요하다. 하지만 손님에게 전달할 때는 완성된 케이크만 예쁜 상자에 담아 보내면 된다. 멀티 스테이지 빌드는 "모든 도구를 갖춘 주방에서 케이크를 굽고, 완성된 케이크만 상자에 담는" 방식이다.
> - **실용적인 이유**: 이미지가 작을수록 CI/CD에서 이미지를 내려받는 시간이 줄고, 레지스트리 저장 비용이 낮아지고, 공격 표면(보안 취약점의 수)이 줄어든다.

##### 멀티 스테이지 Dockerfile

예제 파일은 `examples/viii-1-9-springboot-docker/` 폴더를 참조한다.

```dockerfile
# examples/viii-1-9-springboot-docker/Dockerfile

# ── 1단계: 빌드 스테이지 ──────────────────────────
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Gradle 래퍼와 의존성 파일 먼저 복사 (캐시 활용)
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle settings.gradle ./

# 의존성 다운로드 (소스 코드 변경 시 이 레이어는 캐시 재사용)
RUN ./gradlew dependencies --no-daemon

# 소스 코드 복사 후 빌드
COPY src/ src/
RUN ./gradlew bootJar --no-daemon

# ── 2단계: 실행 스테이지 ──────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runner

# 보안: 비루트 사용자 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# 빌드 스테이지에서 생성된 JAR만 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 파일 소유권 변경
RUN chown appuser:appgroup app.jar

# 비루트 사용자로 전환
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

> **[주니어 렌즈 ★★☆]**
> - **`./gradlew dependencies` 분리**: 소스 코드보다 `build.gradle`이 바뀌는 빈도가 낮다. Gradle 설정 파일을 먼저 복사하고 의존성을 다운로드하면, 소스 코드만 변경되었을 때 의존성 다운로드 레이어를 캐시에서 재사용할 수 있다. 빌드 시간이 크게 줄어든다.
> - **`--no-daemon` 옵션**: Gradle 데몬(백그라운드 프로세스)은 개발 환경에서 재사용성이 있지만, Docker 빌드 컨텍스트처럼 일회성 실행에서는 불필요하다. `--no-daemon`을 사용하면 메모리를 추가로 쓰지 않는다.
> - **`*.jar` 와일드카드**: 빌드 결과물 JAR 파일명에 버전이 포함되는 경우(`app-0.0.1-SNAPSHOT.jar`)에도 `*.jar`로 한 번에 복사할 수 있다. 단, JAR이 하나임을 보장해야 한다.

##### 이미지 빌드 및 실행

```bash
# 이미지 빌드
docker build -t myapp:latest .

# 이미지 크기 비교
docker images | grep myapp
```

예상 출력:

```
REPOSITORY  TAG         SIZE
myapp       latest      ~250MB   ← JRE 기반 최종 이미지
```

JDK만 사용했을 경우와 비교:

| 방식 | 베이스 이미지 | 최종 이미지 크기 |
|:--|:--|:--|
| JDK 단일 스테이지 | `eclipse-temurin:21-jdk` | ~800MB |
| JRE 단일 스테이지 | `eclipse-temurin:21-jre-alpine` | ~250MB |
| 멀티 스테이지 (JDK → JRE) | 빌드: JDK, 실행: JRE alpine | ~250MB (소스 코드 제외) |

```bash
# 컨테이너 실행
docker run -d \
  --name myapp \
  -p 8080:8080 \
  myapp:latest

# 로그 확인 (Spring Boot 시작 완료 메시지 확인)
docker logs -f myapp
# "Started Application in X.XXX seconds" 메시지가 보이면 완료
```

##### 환경변수로 Spring 프로파일 전달

```bash
# 프로덕션 프로파일로 실행
docker run -d \
  --name myapp-prod \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://trio-mysql:3306/demo \
  -e SPRING_DATASOURCE_USERNAME=appuser \
  -e SPRING_DATASOURCE_PASSWORD=apppass \
  myapp:latest
```

##### .dockerignore 설정

빌드 컨텍스트에서 불필요한 파일을 제외한다.

```
# .dockerignore
.git
.gradle
build/
out/
*.log
.DS_Store
```

> **[실무자 렌즈 ★★★]**
> - **JVM 메모리 튜닝**: 컨테이너 환경에서 JVM은 호스트 전체 메모리를 기준으로 힙 크기를 계산한다. `-XX:+UseContainerSupport`(Java 11+에서 기본값)를 사용하면 컨테이너 메모리 제한을 인식한다. `deploy.resources.limits.memory`와 `-Xmx` 설정을 함께 조정한다.
> - **GraalVM Native Image**: Spring Boot 3.x에서는 GraalVM을 사용해서 JVM 없이 동작하는 네이티브 실행 파일을 만들 수 있다. 시작 시간이 밀리초 단위로 줄고 이미지 크기도 50MB 이하로 줄지만, 빌드 시간이 길고 리플렉션 사용에 제약이 있다.
> - **레이어드 JAR**: Spring Boot 2.3+에서는 `bootJar`가 레이어드 JAR을 생성할 수 있다. `RUN java -Djarmode=layertools -jar app.jar extract`로 의존성 레이어를 분리하면 애플리케이션 코드만 변경될 때 이미지 빌드와 푸시 속도가 더 빨라진다.

##### 체크포인트

- [ ] 멀티 스테이지 Dockerfile에서 `AS builder`와 `COPY --from=builder`의 역할을 설명할 수 있다
- [ ] `eclipse-temurin:21-jdk`와 `eclipse-temurin:21-jre-alpine` 이미지의 크기 차이를 직접 `docker images`로 확인할 수 있다
- [ ] `addgroup`/`adduser`로 비루트 사용자를 생성하고 `USER` 명령으로 전환하는 이유를 설명할 수 있다
- [ ] Gradle 의존성 다운로드 레이어를 소스 코드 복사보다 먼저 배치하는 이유(캐시 최적화)를 설명할 수 있다
- [ ] `docker build -t myapp:latest .`로 이미지를 빌드하고 컨테이너를 실행하여 Spring Boot 앱이 뜨는 것을 확인할 수 있다

---

### VIII-1-10. Node.js (Express) 앱 Docker화

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 Node.js Express 앱을 `node:20-alpine` 이미지로 Docker화하고, 의존성 캐시를 최적화하고, 개발 환경에서 바인드 마운트로 핫 리로드를 구성할 수 있다.
- **설명**:
  Node.js 앱은 상대적으로 Docker화가 쉬운 편이다. `npm ci`로 의존성을 설치하고 소스 코드를 복사하면 된다. 하지만 `node_modules`를 이미지에 포함시키는 방식과 `.dockerignore` 설정, `npm ci` vs `npm install` 차이를 이해해야 올바른 이미지를 만들 수 있다.
- **핵심 키워드**: `node:20-alpine`, `npm ci --omit=dev`, `.dockerignore`, 의존성 캐시 최적화, 바인드 마운트 핫 리로드
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: IV-1-1 (Dockerfile에서 컨테이너까지)
- **다음 섹션**: VIII-1-11

#### 본문

##### `node:20-alpine`을 선택하는 이유

Node.js 공식 이미지는 여러 변형이 있다.

| 이미지 | 크기 | 용도 |
|:--|:--|:--|
| `node:20` | ~1GB | 데비안 기반, 개발 도구 포함 |
| `node:20-slim` | ~250MB | 데비안 기반, 불필요한 패키지 제거 |
| `node:20-alpine` | ~130MB | Alpine Linux 기반, 최소 설치 |

`alpine`은 Alpine Linux라는 초경량 리눅스 배포판을 기반으로 한다. 크기가 작아서 이미지 빌드, 푸시, 풀 속도가 빠르고 보안 취약점 노출 면적이 좁다. 다만 glibc 대신 musl libc를 사용하기 때문에 네이티브 확장(`.node` 바이너리)을 사용하는 패키지에서 호환성 문제가 생길 수 있다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 이사할 때 짐을 최소화하는 것처럼, 실행에 필요한 것만 담은 이미지가 배포하기 쉽다. `node:20-alpine`은 Node.js 실행에 꼭 필요한 것만 담은 가벼운 상자다.
> - **`npm ci` 한 줄 요약**: `npm install`은 `package.json`을 기준으로 설치하고 `package-lock.json`을 갱신할 수 있다. `npm ci`는 `package-lock.json`을 정확히 따라 설치하고 `node_modules`를 먼저 삭제하므로 재현성이 보장된다.

##### Dockerfile 작성 — 의존성 캐시 최적화

예제 파일은 `examples/viii-1-10-nodejs-docker/` 폴더를 참조한다.

```dockerfile
# examples/viii-1-10-nodejs-docker/Dockerfile
FROM node:20-alpine

# 보안: 비루트 사용자 생성 (node 이미지는 기본 제공)
# node:alpine 이미지에는 이미 'node' 사용자(uid=1000)가 있다

WORKDIR /app

# ① 의존성 파일을 먼저 복사 (소스 코드보다 변경 빈도가 낮음)
COPY package.json package-lock.json ./

# ② 프로덕션 의존성만 설치 (devDependencies 제외)
RUN npm ci --omit=dev

# ③ 소스 코드 복사 (마지막에 복사하여 캐시 재사용 극대화)
COPY src/ src/

# 파일 소유권을 node 사용자에게 변경
RUN chown -R node:node /app

# 비루트 사용자로 전환
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
```

##### `.dockerignore` — 반드시 설정해야 하는 이유

`.dockerignore`가 없으면 `COPY . .` 명령이 `node_modules` 폴더(수백 MB)를 빌드 컨텍스트에 포함시킨다. 이는 빌드 속도를 늦추고, 호스트의 `node_modules`가 컨테이너 안의 것을 덮어써서 플랫폼 불일치 문제를 일으킨다.

```
# .dockerignore
node_modules
npm-debug.log
.git
.env
.DS_Store
dist/
coverage/
*.test.js
```

##### `npm ci` vs `npm install` 차이

| 항목 | `npm install` | `npm ci` |
|:--|:--|:--|
| 기준 파일 | `package.json` | `package-lock.json` |
| `node_modules` 처리 | 기존 것 재사용 | 삭제 후 새로 설치 |
| `package-lock.json` 수정 | 가능 | 불가 (변경 시 에러) |
| 재현성 | 낮음 | 높음 |
| Docker 적합성 | 낮음 | 높음 |

```bash
# 빌드
docker build -t nodeapp:latest .

# 이미지 크기 확인
docker images nodeapp

# 실행
docker run -d \
  --name nodeapp \
  -p 3000:3000 \
  nodeapp:latest

# 동작 확인
curl http://localhost:3000
```

> **[주니어 렌즈 ★★☆]**
> - **`--omit=dev` 효과**: `jest`, `nodemon`, `eslint` 같은 개발 도구를 제외하면 `node_modules` 크기가 30~50% 줄어드는 경우가 많다. `npm ls --omit=dev`로 설치된 패키지 목록을 확인할 수 있다.
> - **`node` 사용자**: `node:alpine` 이미지에는 이미 uid=1000인 `node` 사용자가 포함되어 있다. `adduser`를 따로 만들지 않아도 `USER node`로 바로 사용할 수 있다.
> - **WORKDIR 권한**: `WORKDIR /app` 이후 파일을 복사하면 기본적으로 root 소유가 된다. `USER node`로 전환하기 전에 `chown -R node:node /app`을 실행한다.

##### 개발 환경: 바인드 마운트 + 핫 리로드

개발 중에는 코드를 수정할 때마다 이미지를 다시 빌드하면 비효율적이다. 바인드 마운트와 Node.js 내장 `--watch` 옵션을 사용하면 코드 변경이 즉시 반영된다.

```yaml
# compose.dev.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      # 소스 코드를 바인드 마운트 (코드 변경 즉시 반영)
      - ./src:/app/src
      # node_modules는 컨테이너 것을 사용 (호스트 것 덮어쓰기 방지)
      - /app/node_modules
    command: node --watch src/index.js
    environment:
      NODE_ENV: development
```

```bash
# 개발 환경 실행
docker compose -f compose.dev.yml up
```

> **[실무자 렌즈 ★★★]**
> - **멀티 스테이지 적용**: TypeScript 프로젝트에서는 `tsc`로 JS로 컴파일하는 빌드 스테이지와 컴파일된 JS만 실행하는 스테이지로 분리한다. `package.json`과 `tsconfig.json`을 빌드 스테이지에 복사하고, 컴파일 결과(`dist/`)만 실행 스테이지에 가져온다.
> - **`npm ci` 캐시 마운트**: BuildKit의 `--mount=type=cache,target=/root/.npm`을 사용하면 npm 캐시를 레이어 외부에 저장하여 반복 빌드 속도를 높일 수 있다. `RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev`
> - **신호 처리**: Node.js 프로세스를 PID 1로 직접 실행하면 `SIGTERM` 신호를 제대로 처리하지 못할 수 있다. `CMD ["node", "src/index.js"]` 형태의 exec 형식을 사용하거나, `tini`를 init 프로세스로 사용한다(`--init` 플래그 또는 `init: true` in Compose).

##### 체크포인트

- [ ] `.dockerignore`에 `node_modules`를 추가하는 이유와, 추가하지 않았을 때 발생하는 문제를 설명할 수 있다
- [ ] `COPY package.json package-lock.json ./` → `RUN npm ci` → `COPY src/ src/` 순서가 왜 캐시에 유리한지 설명할 수 있다
- [ ] `npm ci`와 `npm install`의 차이를 설명하고, Docker 빌드에는 어느 것이 적합한지 말할 수 있다
- [ ] `node:20-alpine`을 선택하는 이유와 alpine 이미지의 한계(musl libc)를 설명할 수 있다
- [ ] 바인드 마운트와 `node --watch`를 조합하여 개발 환경 핫 리로드를 구성할 수 있다

---

### VIII-1-11. Next.js 앱 Docker화

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 Next.js 앱을 standalone 출력 모드로 설정하고, 3-stage Dockerfile로 최적화된 이미지를 만들고, 빌드타임과 런타임 환경변수를 올바르게 주입할 수 있다.
- **설명**:
  Next.js는 서버 사이드 렌더링(SSR), 정적 생성(SSG), API Routes 등 복합적인 기능을 제공하기 때문에 단순히 `npm run build` 후 파일을 복사하는 방식으로는 제대로 Docker화할 수 없다. `output: 'standalone'` 설정과 3-stage Dockerfile을 사용하면 이미지 크기를 일반 빌드 대비 80% 이상 줄일 수 있다.
- **핵심 키워드**: `output: 'standalone'`, 3-stage Dockerfile, `NEXT_PUBLIC_*`, 런타임 환경변수, `.next/standalone`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: IV-1-3 (멀티 스테이지 빌드), VIII-1-10 (Node.js Docker화)
- **다음 섹션**: VIII-1-12

#### 본문

##### standalone 출력 모드란?

일반 Next.js 빌드는 `.next/` 폴더에 결과물을 생성하지만, `node_modules` 전체가 필요하다. `output: 'standalone'`을 설정하면 실행에 필요한 파일만 모아서 `.next/standalone/` 폴더에 자급자족형(standalone) 서버를 생성한다.

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
```

이 설정 하나로 이미지 크기가 극적으로 줄어든다:

| 방식 | 이미지 크기 (예시) |
|:--|:--|
| 일반 빌드 + `node_modules` 전체 | ~1.2GB |
| `output: 'standalone'` 적용 | ~150MB |

> **[입문 렌즈 ★☆☆]**
> - **비유**: 캠핑을 갈 때 집에 있는 모든 살림을 가져가는 사람은 없다. 캠핑에 꼭 필요한 것만 배낭에 담는다. `standalone` 모드는 Next.js가 "이 앱 실행에 필요한 것만" 골라서 작은 배낭에 담아주는 기능이다.
> - **왜 3-stage인가**: deps(의존성 설치) → builder(앱 빌드) → runner(실행 파일만 복사) 세 단계로 나누면 각 단계의 레이어를 독립적으로 캐시할 수 있어서 재빌드가 빠르다.

##### 3-stage Dockerfile

예제 파일은 `examples/viii-1-11-nextjs-docker/` 폴더를 참조한다.

```dockerfile
# examples/viii-1-11-nextjs-docker/Dockerfile
FROM node:20-alpine AS base

# ── 1단계: 의존성 설치 ─────────────────────────────
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── 2단계: 앱 빌드 ────────────────────────────────
FROM base AS builder

WORKDIR /app

# deps 스테이지의 node_modules 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드타임 환경변수 (NEXT_PUBLIC_* 는 빌드 시 번들에 포함됨)
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── 3단계: 실행 이미지 ────────────────────────────
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 비루트 사용자 생성
RUN addgroup -S nextgroup && adduser -S nextuser -G nextgroup

# standalone 출력물 복사
COPY --from=builder /app/.next/standalone ./
# 정적 에셋 복사 (standalone에 포함되지 않음)
COPY --from=builder /app/.next/static ./.next/static
# public 폴더 복사
COPY --from=builder /app/public ./public

# 파일 소유권 변경
RUN chown -R nextuser:nextgroup /app

USER nextuser

EXPOSE 3000

# standalone이 생성하는 server.js로 실행
CMD ["node", "server.js"]
```

> **[주니어 렌즈 ★★☆]**
> - **`libc6-compat` 패키지**: Alpine에서 일부 npm 패키지가 glibc를 필요로 하는 경우를 대비해 설치한다. Next.js 공식 Docker 예제에서도 포함된다.
> - **`static`과 `public` 별도 복사**: `output: 'standalone'`은 `.next/standalone/` 폴더에 서버 실행 파일만 생성한다. 브라우저가 요청하는 CSS/JS/이미지 파일은 `.next/static/`에, `public/` 폴더의 파일은 따로 복사해야 한다.
> - **`server.js` 위치**: standalone 빌드 후 `.next/standalone/server.js`가 생성된다. `CMD ["node", "server.js"]`는 이 파일을 가리킨다.

##### 환경변수 주입 전략

Next.js의 환경변수는 두 종류로 나뉜다:

| 종류 | 예시 | 주입 시점 | 주의 |
|:--|:--|:--|:--|
| 빌드타임 변수 | `NEXT_PUBLIC_API_URL` | `docker build` 시 `--build-arg`로 전달 | 번들에 하드코딩됨, 이미지 재빌드 필요 |
| 서버사이드 변수 | `DATABASE_URL`, `SECRET_KEY` | `docker run -e` 또는 Compose `environment:` | 런타임에 주입, 이미지 재사용 가능 |

```bash
# 빌드타임 환경변수 전달 (필요한 경우)
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  -t nextapp:latest .

# 런타임 환경변수 전달
docker run -d \
  --name nextapp \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@db:5432/mydb \
  nextapp:latest
```

```bash
# 빌드 후 이미지 크기 확인
docker images nextapp
```

> **[실무자 렌즈 ★★★]**
> - **`NEXT_PUBLIC_*` 함정**: `NEXT_PUBLIC_*` 변수는 빌드 시 번들에 하드코딩된다. 즉 API URL이 바뀌면 이미지를 새로 빌드해야 한다. 이 문제를 피하려면 런타임에 `/api/config` 엔드포인트를 만들어 브라우저가 설정을 가져오게 하거나, Next.js `instrumentation.ts`에서 환경변수를 런타임에 읽는 패턴을 사용한다.
> - **캐시 최적화**: deps 스테이지를 분리하면 `package.json`이 바뀌지 않는 한 `npm ci` 레이어를 캐시에서 재사용할 수 있다. `--cache-from` 옵션을 CI에서 사용하면 이전 빌드의 레이어를 재활용한다.
> - **`output: 'export'`와 차이**: `output: 'export'`는 완전한 정적 사이트를 생성한다. SSR이나 API Routes가 없는 경우에만 사용 가능하며, 이 경우 nginx로 정적 파일을 서빙하는 방식(VIII-1-12)이 더 적합할 수 있다.

##### 체크포인트

- [ ] `next.config.js`에 `output: 'standalone'`을 설정하고 빌드 후 `.next/standalone/` 폴더가 생성됨을 확인할 수 있다
- [ ] 3-stage Dockerfile(deps/builder/runner)에서 각 스테이지의 역할을 설명할 수 있다
- [ ] `COPY --from=builder /app/.next/static ./.next/static`를 빠뜨리면 어떤 문제가 생기는지 설명할 수 있다
- [ ] `NEXT_PUBLIC_*` 변수는 빌드타임에 주입해야 하고, `DATABASE_URL` 같은 서버사이드 변수는 런타임에 주입하는 이유를 설명할 수 있다
- [ ] `output: 'standalone'` 적용 전후 이미지 크기를 `docker images`로 비교할 수 있다

---

### VIII-1-12. HTML+Nginx 정적 사이트 Docker화

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 HTML 정적 사이트를 `nginx:alpine` 이미지로 Docker화하고, SPA 라우팅을 위한 `nginx.conf`를 작성하고, 개발 환경에서 바인드 마운트로 실시간 반영을 구성할 수 있다.
- **설명**:
  정적 사이트(HTML/CSS/JS 파일만 있는 프로젝트)의 Docker화는 가장 단순한 형태다. Dockerfile 3줄로 완성되며, 핵심은 Nginx 설정이다. Vue.js, React(CRA), Vite 같은 프레임워크로 빌드한 결과물도 이 방식으로 서빙한다.
- **핵심 키워드**: `nginx:alpine`, `nginx.conf`, `try_files`, 정적 파일 캐시, 바인드 마운트
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: IV-1-1 (Dockerfile에서 컨테이너까지)
- **다음 섹션**: VIII-1-13

#### 본문

##### 가장 단순한 Dockerfile

정적 사이트 Docker화의 Dockerfile은 3줄이면 충분하다.

예제 파일은 `examples/viii-1-12-html-nginx-docker/` 폴더를 참조한다.

```dockerfile
# examples/viii-1-12-html-nginx-docker/Dockerfile
FROM nginx:alpine

# 기본 Nginx 설정 교체 (SPA 라우팅 지원 포함)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY dist/ /usr/share/nginx/html/
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: Nginx는 인터넷 카페의 직원과 같다. 손님(브라우저)이 "index.html 주세요"라고 요청하면 파일을 찾아서 건네준다. Docker 이미지는 직원과 파일 모음을 하나의 패키지로 묶은 것이다.
> - **3줄의 의미**: `FROM`(어떤 서버를 쓸지) → `COPY nginx.conf`(서버 설정) → `COPY dist/`(파일 전달). 실행에 필요한 것이 세 가지뿐이다.

##### nginx.conf 커스텀 — SPA 라우팅

React, Vue, 일반 SPA처럼 클라이언트 사이드 라우팅을 사용하는 앱은 `/about`, `/profile/1` 같은 URL로 직접 접근하면 Nginx가 파일을 찾지 못하고 404를 반환한다. `try_files`로 이 문제를 해결한다.

```nginx
# examples/viii-1-12-html-nginx-docker/nginx.conf
server {
    listen       80;
    server_name  localhost;

    root   /usr/share/nginx/html;
    index  index.html;

    # SPA 라우팅: 파일이 없으면 index.html로 폴백
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 정적 에셋 캐시 설정 (JS/CSS/이미지)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 헬스체크 엔드포인트
    location /healthz {
        return 200 "ok";
        add_header Content-Type text/plain;
    }
}
```

`try_files $uri $uri/ /index.html`의 작동 방식:

```
요청: /about

1. $uri     → /usr/share/nginx/html/about       파일 없음
2. $uri/    → /usr/share/nginx/html/about/       폴더 없음
3. /index.html → /usr/share/nginx/html/index.html  반환!

브라우저가 index.html을 받으면 React/Vue 라우터가 /about 경로를 처리한다.
```

> **[주니어 렌즈 ★★☆]**
> - **캐시 설정의 의미**: `expires 1y`는 브라우저가 1년간 캐시를 유지하라는 지시다. Vite/webpack은 빌드마다 파일명에 해시를 붙이기 때문에(`app.abc123.js`) 파일 변경 시 자동으로 새 파일을 가져온다. `index.html`에는 캐시를 적용하지 않아서 항상 최신 HTML을 가져온다.
> - **`immutable` 헤더**: `Cache-Control: public, immutable`은 "이 파일은 절대 바뀌지 않으므로 만료 전에 서버에 재검증 요청을 보내지 않아도 된다"는 의미다. CDN과 함께 사용할 때 효과적이다.
> - **Nginx 404 vs SPA 404**: SPA 라우터에서 정의되지 않은 경로는 SPA 안에서 404 페이지를 보여줘야 한다. Nginx의 `try_files /index.html` 설정은 모든 경로를 index.html로 보내므로, Nginx 레벨 404는 없어지고 SPA가 경로를 판단한다.

##### 빌드 및 실행

```bash
# React/Vue/Vite 앱을 먼저 빌드 (호스트에서)
npm run build
# 결과: dist/ 폴더 생성

# Docker 이미지 빌드
docker build -t staticapp:latest .

# 이미지 크기 확인 (nginx:alpine 기반이라 매우 작다)
docker images staticapp

# 실행
docker run -d \
  --name staticapp \
  -p 8080:80 \
  staticapp:latest

# 동작 확인
curl http://localhost:8080
curl http://localhost:8080/healthz
```

##### 개발 환경: 바인드 마운트로 실시간 반영

```yaml
# compose.dev.yml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      # dist/ 폴더를 바인드 마운트 (빌드 결과물 변경 즉시 반영)
      - ./dist:/usr/share/nginx/html:ro
      # nginx 설정도 마운트 (설정 변경 시 docker compose restart web)
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

```bash
# 개발 환경 실행
docker compose -f compose.dev.yml up -d

# 앱 재빌드 후 자동 반영 (바인드 마운트이므로 이미지 재빌드 불필요)
npm run build
# 브라우저에서 새로고침하면 바로 반영된다
```

> **[실무자 렌즈 ★★★]**
> - **멀티 스테이지 + Nginx**: Vite/CRA 프로젝트를 완전히 Docker 안에서 빌드하려면 멀티 스테이지를 적용한다. `node:20-alpine`으로 `npm run build`를 수행하는 빌드 스테이지와 `nginx:alpine`으로 서빙하는 실행 스테이지를 분리한다.
> - **보안 헤더 추가**: 프로덕션 nginx.conf에는 `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy` 같은 보안 헤더를 추가한다.
> - **CDN 앞단 구성**: 정적 사이트는 CloudFront, Cloudflare 같은 CDN을 앞에 두는 것이 일반적이다. CDN이 캐시를 처리하므로 Nginx의 캐시 정책은 CDN과 일관성 있게 설정한다.

##### 프로젝트 4종 Docker화 비교

지금까지 다룬 4가지 프로젝트 유형의 Docker화를 한눈에 비교한다.

| 항목 | Spring Boot (VIII-1-9) | Node.js/Express (VIII-1-10) | Next.js (VIII-1-11) | HTML+Nginx (VIII-1-12) |
|:--|:--|:--|:--|:--|
| 베이스 이미지 (빌드) | `eclipse-temurin:21-jdk` | `node:20-alpine` | `node:20-alpine` | `node:20-alpine` (선택) |
| 베이스 이미지 (실행) | `eclipse-temurin:21-jre-alpine` | `node:20-alpine` | `node:20-alpine` | `nginx:alpine` |
| 스테이지 수 | 2 (builder → runner) | 1 또는 2 | 3 (deps → builder → runner) | 1 또는 2 |
| Dockerfile 핵심 명령 | `RUN ./gradlew bootJar` → `COPY *.jar` | `RUN npm ci --omit=dev` | `output: 'standalone'` + `COPY .next/standalone` | `COPY dist/ /usr/share/nginx/html/` |
| 최종 이미지 크기 (예시) | ~250MB | ~150MB | ~150MB | ~30MB |
| 빌드 시간 | 길다 (Gradle 컴파일) | 중간 (npm 의존성) | 중간~길다 (Next.js 빌드) | 빠르다 (파일 복사만) |
| 런타임 | JVM | Node.js | Node.js | Nginx |
| 환경변수 주입 | `-e SPRING_PROFILES_ACTIVE` | `-e NODE_ENV` | 런타임/빌드타임 구분 필요 | 없음 (정적 파일) |
| 핵심 함정 | JDK 이미지 그대로 사용 | `node_modules` .dockerignore 누락 | `static`/`public` 복사 누락 | SPA 라우팅 `try_files` 누락 |

##### 체크포인트

- [ ] `nginx:alpine` 이미지를 사용하여 `dist/` 폴더를 서빙하는 Dockerfile 3줄을 작성할 수 있다
- [ ] `try_files $uri $uri/ /index.html` 설정이 SPA 라우팅에서 왜 필요한지 설명할 수 있다
- [ ] 정적 에셋에 `Cache-Control: public, immutable` 헤더를 설정하고, `index.html`에는 캐시를 적용하지 않는 이유를 설명할 수 있다
- [ ] 바인드 마운트(`./dist:/usr/share/nginx/html:ro`)를 사용하여 개발 환경에서 빌드 결과물 변경을 즉시 반영할 수 있다
- [ ] Spring Boot / Node.js / Next.js / HTML+Nginx 4가지 프로젝트 유형의 베이스 이미지, 스테이지 수, 핵심 함정을 각각 설명할 수 있다

---

### VIII-1-13. EC2 인스턴스 생성과 Docker 설치

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 AWS EC2 인스턴스를 프리티어로 생성하고, SSH로 접속하여 Docker와 Docker Compose를 설치하고, 탄력적 IP를 연결하여 배포 준비를 완료할 수 있다.
- **설명**:
  로컬에서 잘 돌아가는 Docker 컨테이너를 실제 서버에 올리는 첫 단계는 EC2 인스턴스를 만드는 것이다. AWS 프리티어를 활용하면 12개월 동안 기본 실습을 무료로 할 수 있다. 이 Section에서는 EC2 생성부터 Docker 설치까지 전체 절차를 단계별로 따른다.
- **핵심 키워드**: EC2, 프리티어, AMI, 보안 그룹, 탄력적 IP, SSH, `usermod -aG docker`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: III-1-1 (Docker 설치)
- **다음 섹션**: VIII-1-14

#### 본문

##### AWS 프리티어 개요

AWS 프리티어(Free Tier)는 신규 계정 생성 후 12개월 동안 특정 서비스를 무료로 사용할 수 있는 혜택이다.

| 항목 | 내용 |
|:--|:--|
| 인스턴스 유형 | `t2.micro` (구형) 또는 `t3.micro` (신형, 일부 리전) |
| 무료 기간 | 계정 생성 후 12개월 |
| 월 제공 시간 | 750시간 (한 인스턴스를 한 달 내내 켜도 무료) |
| 스토리지 | EBS 30GB 무료 |
| 비고 | 12개월 이후 또는 프리티어 한도 초과 시 과금 발생 |

> **[경고] 실습 후 반드시 EC2 인스턴스를 중지(Stop)하세요. 중지가 아닌 실행(Running) 상태로 방치하면 프리티어 한도를 초과하여 요금이 발생합니다. 삭제(Terminate)는 복구가 불가능하므로 주의하세요.**

##### EC2 인스턴스 생성 단계

AWS 콘솔에서 순서대로 진행한다.

**1단계: 리전 선택**

AWS 콘솔 오른쪽 상단에서 리전을 선택한다. 한국에서 사용할 때는 `아시아 태평양(서울) ap-northeast-2`를 선택한다.

**2단계: EC2 대시보드 진입**

콘솔 검색창에 `EC2`를 입력하고 → `인스턴스 시작` 버튼을 클릭한다.

**3단계: AMI(Amazon Machine Image) 선택**

AMI는 서버의 운영체제 설치본이다. 실습에는 `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`을 선택한다. `프리 티어 사용 가능` 레이블을 확인한다.

**4단계: 인스턴스 유형 선택**

`t2.micro` (vCPU 1, 메모리 1GB)를 선택한다. `프리 티어 사용 가능` 레이블을 확인한다.

**5단계: 키 페어 생성**

SSH 접속에 필요한 키 파일이다. `새 키 페어 생성`을 클릭하고 이름을 지정한 뒤 `.pem` 파일을 다운로드한다. 이 파일은 분실 시 재발급이 불가능하므로 안전한 곳에 보관한다.

```bash
# 다운로드한 키 파일 권한 설정 (Linux/Mac)
chmod 400 ~/Downloads/my-key.pem
```

**6단계: 보안 그룹 설정**

보안 그룹은 EC2 인스턴스의 방화벽 역할을 한다. 아래 포트를 허용한다.

| 포트 | 프로토콜 | 소스 | 용도 |
|:--|:--|:--|:--|
| 22 | TCP | 내 IP (또는 0.0.0.0/0) | SSH 접속 |
| 80 | TCP | 0.0.0.0/0 | HTTP 웹 서비스 |
| 443 | TCP | 0.0.0.0/0 | HTTPS 웹 서비스 |

> 보안을 위해 22번 포트 소스는 `내 IP`로 제한하는 것이 좋다. `0.0.0.0/0`은 전 세계 어디서나 접근 가능하다는 의미다.

**7단계: 스토리지 설정**

기본값 8GB에서 `20GB`로 늘린다. 프리티어는 EBS 30GB까지 무료이므로 20GB는 무료 범위 안이다.

**8단계: 인스턴스 시작**

`인스턴스 시작` 버튼을 클릭한다. 약 1~2분 후 인스턴스 상태가 `running`으로 바뀐다.

##### 탄력적 IP 연결

EC2 인스턴스는 중지 후 재시작하면 퍼블릭 IP가 바뀐다. 탄력적 IP(Elastic IP)를 연결하면 고정 IP를 사용할 수 있다.

```
AWS 콘솔 → EC2 → 탄력적 IP → 탄력적 IP 주소 할당 → 인스턴스에 연결
```

> **주의**: 탄력적 IP는 인스턴스에 연결된 상태로 사용하면 무료지만, 할당만 해두고 인스턴스에 연결하지 않으면 요금이 발생한다.

##### SSH 접속

```bash
# 기본 SSH 접속 명령어
ssh -i ~/Downloads/my-key.pem ubuntu@<탄력적 IP>

# 예시
ssh -i ~/Downloads/my-key.pem ubuntu@13.125.100.200
```

처음 접속 시 "Are you sure you want to continue connecting?"이라는 경고가 나타난다. `yes`를 입력하면 된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: EC2는 AWS가 대신 관리해주는 원격 컴퓨터다. 우리가 서버를 사서 설치하는 대신, AWS에서 컴퓨터를 빌려서 쓰는 것이다. SSH는 그 컴퓨터에 원격으로 연결하는 터미널이다.
> - **키 페어**: 자물쇠(`pem` 파일)와 열쇠 쌍이다. AWS가 자물쇠를 인스턴스에 걸어놓고, 나는 열쇠(`.pem` 파일)로 문을 연다. 열쇠를 잃어버리면 문을 열 수 없다.

##### Ubuntu에 Docker 설치

SSH로 접속한 EC2 서버에서 아래 명령어를 순서대로 실행한다.

```bash
# 1. 패키지 목록 업데이트
sudo apt-get update

# 2. Docker 공식 설치 스크립트로 설치 (가장 간단한 방법)
curl -fsSL https://get.docker.com | sh
```

```bash
# 3. 현재 사용자를 docker 그룹에 추가 (sudo 없이 docker 명령 사용 가능)
sudo usermod -aG docker $USER

# 4. 그룹 변경 적용 (재로그인 또는 아래 명령 실행)
newgrp docker
```

```bash
# 5. Docker Compose 플러그인 설치
sudo apt-get install -y docker-compose-plugin
```

```bash
# 6. 설치 확인
docker --version
docker compose version
```

설치가 완료되면 아래와 같이 출력된다.

```
Docker version 27.x.x, build xxxxxxx
Docker Compose version v2.x.x
```

> **[주니어 렌즈 ★★☆]**
> - **`curl -fsSL https://get.docker.com | sh`**: Docker 공식 편의 스크립트다. 현재 OS를 자동 감지하여 적절한 패키지를 설치한다. 실무에서는 스크립트 내용을 먼저 확인하는 것이 좋지만(`curl -fsSL https://get.docker.com -o install-docker.sh && cat install-docker.sh`), 개인 실습용 서버에서는 편의를 위해 직접 파이프로 실행한다.
> - **`usermod -aG docker $USER`**: `-aG`는 "append to Group"의 약자다. `$USER` 환경변수는 현재 로그인한 사용자 이름이다. 이 명령 없이 `docker` 명령을 실행하면 `permission denied while trying to connect to the Docker daemon socket` 에러가 발생한다.
> - **`newgrp docker`**: 현재 셸 세션에서 그룹 변경을 즉시 적용한다. EC2를 재접속(SSH 재연결)해도 동일하게 적용된다.

##### Docker 동작 확인

```bash
# Hello World 컨테이너 실행 (정상 동작 확인)
docker run --rm hello-world

# 이미지 목록 확인
docker images

# 실행 중인 컨테이너 확인
docker ps
```

##### 비용 예상표

| 인스턴스 유형 | vCPU | 메모리 | 월 비용 (서울 리전) | 비고 |
|:--|:--|:--|:--|:--|
| `t2.micro` | 1 | 1GB | $0 (프리티어 12개월) | 개인 실습에 적합 |
| `t3.micro` | 2 | 1GB | ~$8 | 프리티어 적용 리전에서 무료 가능 |
| `t3.small` | 2 | 2GB | ~$15 | 소규모 서비스 운영 |
| `t3.medium` | 2 | 4GB | ~$30 | DB + 앱 함께 운영 시 |

> **[실무자 렌즈 ★★★]**
> - **프로덕션에서 `t2.micro` 사용 주의**: t2.micro는 CPU 버스트 크레딧 방식이다. 평소에는 성능을 낮게 유지하다가 크레딧이 있을 때만 높은 성능을 낸다. 지속적인 CPU 부하가 걸리면 크레딧이 소진되어 성능이 급격히 떨어진다. 실제 서비스에는 `t3` 이상을 권장한다.
> - **IMDSv2(인스턴스 메타데이터 서비스 v2)**: AWS는 최근 인스턴스에서 IMDSv2를 기본 사용한다. EC2 메타데이터를 코드에서 읽을 때는 IMDSv2 방식을 써야 한다. Docker 이미지 빌드 자체에는 영향이 없다.
> - **EBS 볼륨 스냅샷**: 운영 서버라면 EBS 스냅샷을 주기적으로 생성해두는 것이 좋다. AWS Backup 서비스를 사용하면 자동화할 수 있다.

##### 체크포인트

- [ ] EC2 인스턴스를 생성하고 SSH로 접속할 수 있다
- [ ] 탄력적 IP를 할당하고 인스턴스에 연결할 수 있다
- [ ] `curl -fsSL https://get.docker.com | sh` 명령으로 Docker를 설치하고 버전을 확인할 수 있다
- [ ] `sudo usermod -aG docker $USER` 명령의 역할을 설명하고, 이 설정 없이 `docker` 명령을 실행하면 어떤 에러가 발생하는지 말할 수 있다
- [ ] 프리티어 인스턴스를 실습 후 반드시 중지(Stop)해야 하는 이유와, 중지(Stop)와 삭제(Terminate)의 차이를 설명할 수 있다

---

### VIII-1-14. ECR(Elastic Container Registry) 사용

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 AWS ECR 프라이빗 레지스트리를 생성하고, Docker 이미지를 빌드하여 ECR에 푸시하고, EC2에서 IAM 역할을 통해 이미지를 풀(Pull)할 수 있다.
- **설명**:
  Docker Hub는 편리하지만 기본 설정이 공개(Public) 저장소다. 회사 내부 이미지나 민감한 설정이 담긴 이미지를 올리기에는 적합하지 않다. AWS ECR은 AWS 계정 안에서만 접근 가능한 프라이빗 이미지 저장소로, EC2, ECS, Lambda 등 AWS 서비스와 자연스럽게 연동된다.
- **핵심 키워드**: ECR, `aws ecr`, `docker login`, IAM 역할, 이미지 수명 주기 정책, 최소 권한 원칙
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VII-1-1 (레지스트리), VIII-1-13
- **다음 섹션**: VIII-1-15

#### 본문

##### Docker Hub vs ECR

| 항목 | Docker Hub | AWS ECR |
|:--|:--|:--|
| 기본 공개 여부 | 공개 (Public) | 비공개 (Private) |
| 무료 저장소 | 1개 프라이빗 | 500MB/월 무료 (AWS 프리티어) |
| 인증 방식 | 사용자 계정 | AWS IAM |
| AWS 서비스 연동 | 별도 설정 필요 | EC2/ECS/Lambda 자동 연동 |
| 이미지 스캔 | 유료 | 기본 스캔 무료 |
| 네트워크 비용 | AWS → Docker Hub 전송 비용 발생 | 같은 리전 내 무료 |

같은 AWS 리전 안에서 EC2 → ECR 이미지 풀은 네트워크 비용이 발생하지 않는다. 이 점에서 AWS 환경이라면 ECR이 Docker Hub보다 유리하다.

##### AWS CLI 설치와 설정

로컬 PC에서 AWS 리소스를 CLI로 제어하려면 AWS CLI를 설치해야 한다.

```bash
# Mac (Homebrew)
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 설치 확인
aws --version
```

```bash
# AWS 자격 증명 설정
aws configure
```

`aws configure` 명령을 실행하면 아래 4가지를 차례로 입력한다.

```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: ap-northeast-2
Default output format [None]: json
```

> Access Key는 AWS 콘솔 → IAM → 사용자 → 보안 자격 증명 탭에서 생성한다.

> **[입문 렌즈 ★☆☆]**
> - **ECR 비유**: ECR은 회사 내부 사진 앨범 같다. Docker Hub가 누구나 볼 수 있는 공개 갤러리라면, ECR은 우리 팀만 접근할 수 있는 비공개 드라이브다.
> - **AWS CLI**: AWS 웹 콘솔에서 클릭하는 작업을 터미널 명령어로 하는 도구다. 자동화나 스크립트 작성에 필수다.

##### ECR 리포지토리 생성

```bash
# ECR 리포지토리 생성
aws ecr create-repository \
  --repository-name demo-app \
  --region ap-northeast-2
```

성공하면 아래와 같은 JSON 응답이 나온다.

```json
{
    "repository": {
        "repositoryArn": "arn:aws:ecr:ap-northeast-2:123456789012:repository/demo-app",
        "registryId": "123456789012",
        "repositoryName": "demo-app",
        "repositoryUri": "123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app",
        "createdAt": "2026-04-23T00:00:00+00:00",
        "imageTagMutability": "MUTABLE"
    }
}
```

`repositoryUri` 값을 메모해둔다. 이후 `docker tag`와 `docker push`에 사용한다.

##### ECR 로그인

ECR에 이미지를 푸시하려면 먼저 Docker 클라이언트를 ECR에 로그인시켜야 한다.

```bash
# ECR 로그인 (AWS CLI로 임시 토큰을 받아 docker login에 전달)
aws ecr get-login-password --region ap-northeast-2 \
  | docker login \
    --username AWS \
    --password-stdin \
    123456789012.dkr.ecr.ap-northeast-2.amazonaws.com
```

성공하면 `Login Succeeded`가 출력된다. 이 토큰은 12시간 동안 유효하다.

##### 이미지 태그와 푸시

```bash
# 로컬에서 이미지 빌드
docker build -t demo-app:latest .

# ECR URI 형식으로 태그 추가
docker tag demo-app:latest \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:latest

# ECR에 푸시
docker push \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:latest
```

```bash
# 특정 버전 태그로 푸시 (권장)
docker tag demo-app:latest \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:v1.0.0

docker push \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:v1.0.0
```

> **[주니어 렌즈 ★★☆]**
> - **계정 ID 확인**: `aws sts get-caller-identity --query Account --output text` 명령으로 현재 AWS 계정 ID를 확인할 수 있다.
> - **환경변수로 URI 관리**: ECR URI를 반복 입력하지 않으려면 환경변수로 저장한다.
>   ```bash
>   export ECR_URI=123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app
>   docker tag demo-app:latest $ECR_URI:latest
>   docker push $ECR_URI:latest
>   ```
> - **`--image-tag-mutability IMMUTABLE`**: 같은 태그에 다른 이미지를 덮어쓰지 못하게 막는 옵션이다. 운영 환경에서는 이미지 불변성을 보장하기 위해 `IMMUTABLE`로 설정하는 것이 좋다.

##### EC2에서 이미지 풀 — IAM 역할 연결

EC2에서 ECR 이미지를 풀하려면 EC2 인스턴스에 적절한 IAM 역할이 연결되어야 한다. IAM 역할은 "이 인스턴스는 ECR에서 이미지를 읽을 수 있다"는 권한을 부여한다.

```
AWS 콘솔 → IAM → 역할 → 역할 만들기
→ 신뢰할 수 있는 엔티티: AWS 서비스 → EC2
→ 정책 연결: AmazonEC2ContainerRegistryReadOnly
→ 역할 이름: ec2-ecr-read-role → 생성
```

```
AWS 콘솔 → EC2 → 인스턴스 선택 → 작업 → 보안 → IAM 역할 수정
→ ec2-ecr-read-role 선택 → 저장
```

IAM 역할이 연결된 후 EC2에서 바로 `docker pull`을 실행할 수 있다.

```bash
# EC2에서 ECR 로그인 (IAM 역할 덕분에 자격 증명 없이 동작)
aws ecr get-login-password --region ap-northeast-2 \
  | docker login \
    --username AWS \
    --password-stdin \
    123456789012.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 풀
docker pull \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:latest
```

##### ECR 수명 주기 정책

이미지를 계속 푸시하면 ECR 저장 비용이 누적된다. 수명 주기 정책을 설정하면 오래된 이미지를 자동으로 삭제한다.

```bash
# 수명 주기 정책 파일 작성
cat > lifecycle-policy.json << 'EOF'
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "최근 10개 이미지만 유지",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["v"],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF

# 정책 적용
aws ecr put-lifecycle-policy \
  --repository-name demo-app \
  --lifecycle-policy-text file://lifecycle-policy.json
```

> **[실무자 렌즈 ★★★]**
> - **IAM 권한 최소화 원칙**: EC2에 부여하는 IAM 역할은 `AmazonEC2ContainerRegistryReadOnly`처럼 필요한 최소 권한만 부여한다. 빌드 서버(CI)에는 `AmazonEC2ContainerRegistryPowerUser`(push 포함)를 부여하고, 운영 서버에는 Read Only만 부여하는 식으로 역할을 분리한다.
> - **크로스 계정 접근**: 개발 계정(dev)에서 빌드한 이미지를 운영 계정(prod)에서 풀하는 경우, ECR 리포지토리 정책에 크로스 계정 IAM을 허용하는 설정이 필요하다.
> - **VPC 엔드포인트**: ECR은 기본적으로 인터넷을 통해 통신한다. 보안이 중요한 환경에서는 VPC 엔드포인트를 생성하여 인터넷을 거치지 않고 AWS 내부 네트워크로 ECR에 접근할 수 있다.

##### 체크포인트

- [ ] `aws ecr create-repository` 명령으로 ECR 리포지토리를 생성하고 `repositoryUri`를 확인할 수 있다
- [ ] `aws ecr get-login-password ... | docker login ...` 명령으로 ECR에 로그인하고 이미지를 푸시할 수 있다
- [ ] ECR이 Docker Hub 대신 필요한 이유(프라이빗, AWS 연동, 네트워크 비용)를 설명할 수 있다
- [ ] EC2에 IAM 역할을 연결하여 자격 증명 파일 없이 ECR에서 이미지를 풀할 수 있다
- [ ] ECR 수명 주기 정책을 설정하여 오래된 이미지를 자동으로 정리할 수 있다

---

### VIII-1-15. EC2에 Docker Compose로 배포하기

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 로컬에서 개발한 Docker Compose 프로젝트를 EC2에 `scp`로 전송하고, Nginx 리버스 프록시를 통해 80/443 포트로 서비스하고, Let's Encrypt HTTPS 인증서를 적용할 수 있다.
- **설명**:
  VIII-1-13에서 Docker를 설치한 EC2 서버에 실제 애플리케이션을 배포하는 단계다. `examples/vi-1-1-fastapi-postgres-nginx/` 예제를 EC2에 올리는 시나리오로 진행한다. 파일 전송부터 Nginx 리버스 프록시, HTTPS 설정까지 실제 서비스 운영에 필요한 전체 흐름을 다룬다.
- **핵심 키워드**: `scp`, Docker Compose 배포, Nginx 리버스 프록시, Let's Encrypt, certbot, HTTPS
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-13, VIII-1-14, V-1-3 (Compose)
- **다음 섹션**: VIII-1-16

#### 본문

##### 파일 전송: scp

로컬 프로젝트 파일을 EC2에 전송할 때는 `scp`(Secure Copy)를 사용한다. SSH와 동일한 키 파일을 사용한다.

```bash
# 로컬에서 EC2로 디렉토리 전체 전송
scp -i ~/Downloads/my-key.pem \
  -r ./vi-1-1-fastapi-postgres-nginx \
  ubuntu@<탄력적 IP>:~/app/

# 예시
scp -i ~/Downloads/my-key.pem \
  -r ./vi-1-1-fastapi-postgres-nginx \
  ubuntu@13.125.100.200:~/app/
```

```bash
# 파일 하나만 전송할 때
scp -i ~/Downloads/my-key.pem \
  ./docker-compose.yml \
  ubuntu@13.125.100.200:~/app/docker-compose.yml
```

##### EC2에서 Docker Compose 실행

```bash
# EC2에 SSH 접속
ssh -i ~/Downloads/my-key.pem ubuntu@13.125.100.200

# 전송한 디렉토리로 이동
cd ~/app/vi-1-1-fastapi-postgres-nginx

# 환경 변수 파일 생성 (.env는 scp로 전송하지 않는 것이 좋다)
cat > .env << 'EOF'
POSTGRES_USER=appuser
POSTGRES_PASSWORD=strongpassword123
POSTGRES_DB=appdb
EOF

# 백그라운드로 실행
docker compose up -d
```

```bash
# 실행 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f

# 특정 서비스 로그만 확인
docker compose logs -f api
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: `scp`는 USB 드라이브처럼 파일을 한 컴퓨터에서 다른 컴퓨터로 복사하는 도구다. SSH 터널을 통해 파일을 안전하게 전송한다.
> - **`.env` 파일 전송 주의**: `.env` 파일에는 비밀번호 같은 민감한 정보가 담겨 있다. `scp`로 전송하면 로그에 내용이 남을 수 있다. EC2에 직접 접속해서 생성하는 것이 더 안전하다.

##### Nginx 리버스 프록시 설정

EC2 보안 그룹에서 80번 포트를 열었지만, FastAPI 앱은 8000번 포트에서 실행된다. Nginx가 80번 포트로 들어오는 요청을 FastAPI 8000번 포트로 전달해주는 역할을 한다.

`vi-1-1-fastapi-postgres-nginx` 예제는 이미 Nginx 리버스 프록시가 포함되어 있다. EC2에서 80번 포트로 접속하면 Nginx → FastAPI 흐름으로 요청이 전달된다.

```bash
# 브라우저에서 접속 확인
# http://<탄력적 IP>
curl http://13.125.100.200/
curl http://13.125.100.200/docs
```

##### HTTPS 설정 — Let's Encrypt + certbot

도메인이 있다면 무료 SSL 인증서를 발급받아 HTTPS를 적용할 수 있다.

**사전 조건**: 도메인이 EC2 탄력적 IP를 가리키도록 DNS A 레코드가 설정되어 있어야 한다.

```bash
# EC2에서 certbot 설치
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

```bash
# 인증서 발급 (Nginx 자동 설정 포함)
sudo certbot --nginx -d example.com -d www.example.com
```

certbot이 자동으로 아래를 처리한다.
1. Let's Encrypt CA에서 인증서 발급
2. `/etc/nginx/` 설정 파일에 SSL 관련 설정 추가
3. 80번 포트 → 443번 포트 자동 리다이렉트 설정

```bash
# 인증서 자동 갱신 (90일마다 만료, cron으로 자동 갱신)
sudo certbot renew --dry-run
```

> **[주니어 렌즈 ★★☆]**
> - **도메인 없을 때 HTTP 동작 확인**: 도메인이 없는 경우 `http://<탄력적 IP>`로 접속하여 동작을 확인한다. 자체 서명(self-signed) 인증서를 사용할 수도 있지만, 브라우저 경고가 발생한다. 개인 실습이라면 HTTP로만 진행해도 무방하다.
> - **Docker Compose와 certbot 충돌**: certbot은 80번 포트를 사용하여 인증서 발급 과정을 진행한다. Docker Compose가 80번 포트를 이미 사용 중이라면 잠시 중단하고 발급한 뒤 다시 시작한다.
>   ```bash
>   docker compose stop nginx
>   sudo certbot certonly --standalone -d example.com
>   docker compose start nginx
>   ```
> - **Nginx 컨테이너 안에서 certbot 사용**: `nginx:alpine` 이미지는 snap이 없다. 이 경우 컨테이너 외부(EC2 호스트)의 Nginx에 certbot을 적용하거나, `certbot/certbot` Docker 이미지를 사용한다.

##### 업데이트 배포

코드를 수정하고 새 이미지를 ECR에 푸시한 뒤 EC2에서 업데이트한다.

```bash
# 최신 이미지 풀 + 컨테이너 재시작
docker compose pull && docker compose up -d

# 사용하지 않는 이전 이미지 정리
docker image prune -f
```

```bash
# 특정 서비스만 업데이트
docker compose pull api
docker compose up -d --no-deps api
```

> **[실무자 렌즈 ★★★]**
> - **Blue-Green 배포**: `docker compose up -d` 방식은 컨테이너를 내렸다가 다시 올리는 과정에서 짧은 다운타임이 발생한다. 무중단 배포(Blue-Green)를 원한다면 두 벌의 Compose 파일을 번갈아 실행하거나, Nginx upstream을 동적으로 교체하는 방식을 사용한다. 규모가 커지면 Kubernetes 또는 AWS ECS를 고려한다.
> - **`--no-deps` 옵션**: 한 서비스만 업데이트할 때 `--no-deps`를 붙이면 의존 서비스(DB 등)를 재시작하지 않는다. DB를 포함한 모든 서비스를 재시작하면 데이터가 날아가는 실수를 예방할 수 있다.
> - **EFS(Elastic File System) 연동**: EC2를 여러 대 운영할 때 볼륨 데이터를 공유하려면 EFS를 Docker 볼륨 드라이버로 연결한다. 단일 EC2 실습에서는 불필요하다.

##### 체크포인트

- [ ] `scp -r` 명령으로 로컬 프로젝트 폴더를 EC2에 전송할 수 있다
- [ ] EC2에서 `docker compose up -d`를 실행하고 `curl`로 서비스가 응답하는지 확인할 수 있다
- [ ] Nginx 리버스 프록시가 80번 포트 요청을 내부 컨테이너 포트로 전달하는 구조를 설명할 수 있다
- [ ] `docker compose pull && docker compose up -d` 명령으로 새 이미지를 EC2에 배포할 수 있다
- [ ] Let's Encrypt certbot으로 HTTPS 인증서를 발급받기 위한 사전 조건(도메인, DNS A 레코드)을 설명할 수 있다

---

### VIII-1-16. 배포 자동화와 운영 체크리스트

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 GitHub Actions 워크플로우로 main 브랜치 푸시 시 Docker 이미지를 빌드하여 ECR에 푸시하고 EC2에 자동 배포하는 CI/CD 파이프라인을 구축할 수 있다.
- **설명**:
  코드를 수정할 때마다 수동으로 빌드하고 EC2에 접속하여 배포하는 과정은 번거롭고 실수가 생기기 쉽다. GitHub Actions를 사용하면 `main` 브랜치에 코드를 푸시하는 것만으로 전체 배포 과정이 자동으로 진행된다. 이 Section에서는 복사해서 바로 쓸 수 있는 워크플로우 YAML과 운영 체크리스트를 제공한다.
- **핵심 키워드**: GitHub Actions, GitHub Secrets, `docker/build-push-action`, watchtower, 롤백, 운영 체크리스트
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VII-1-4 (CI/CD), VIII-1-15
- **다음 섹션**: 부록

#### 본문

##### GitHub Actions 워크플로우 전체 코드

아래 파일을 `.github/workflows/deploy.yml`로 저장한다. main 브랜치에 푸시하면 자동으로 빌드→ECR 푸시→EC2 배포까지 진행한다.

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy to EC2

on:
  push:
    branches:
      - main

env:
  AWS_REGION: ap-northeast-2
  ECR_REPOSITORY: demo-app
  EC2_USER: ubuntu

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. 소스 코드 체크아웃
      - name: 소스 코드 체크아웃
        uses: actions/checkout@v4

      # 2. AWS 자격 증명 설정
      - name: AWS 자격 증명 설정
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      # 3. ECR 로그인
      - name: ECR 로그인
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      # 4. Docker 이미지 빌드 및 ECR 푸시
      - name: Docker 이미지 빌드 및 푸시
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                     $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      # 5. EC2에 SSH 접속하여 배포
      - name: EC2 배포
        env:
          IMAGE_TAG: ${{ github.sha }}
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ env.EC2_USER }}
          key: ${{ secrets.EC2_KEY }}
          envs: IMAGE_TAG,ECR_REGISTRY,ECR_REPOSITORY,AWS_REGION
          script: |
            # ECR 로그인 (EC2에 IAM 역할이 연결되어 있어야 함)
            aws ecr get-login-password --region $AWS_REGION \
              | docker login \
                --username AWS \
                --password-stdin \
                $ECR_REGISTRY

            # 최신 이미지 풀
            docker pull $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

            # 환경변수에 새 이미지 태그 설정
            export APP_IMAGE=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

            # Docker Compose 재시작
            cd ~/app
            APP_IMAGE=$APP_IMAGE docker compose up -d --no-deps api

            # 사용하지 않는 이미지 정리
            docker image prune -f
```

##### GitHub Secrets 설정

워크플로우에서 사용하는 민감한 값은 GitHub Secrets에 저장한다.

```
GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret
```

| Secret 이름 | 값 | 설명 |
|:--|:--|:--|
| `AWS_ACCESS_KEY_ID` | `AKIAIOSFODNN7EXAMPLE` | IAM 사용자 Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | `wJalrX...` | IAM 사용자 Secret Access Key |
| `EC2_HOST` | `13.125.100.200` | EC2 탄력적 IP |
| `EC2_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | `.pem` 파일 내용 전체 |

```bash
# EC2_KEY에 넣을 내용 확인 (pem 파일 전체 내용)
cat ~/Downloads/my-key.pem
```

> **[입문 렌즈 ★☆☆]**
> - **GitHub Actions 비유**: GitHub Actions는 "코드가 올라오면 이것을 해줘"라고 시키는 자동화 도우미다. 도우미는 AWS에 접속하고, Docker 이미지를 만들고, 서버에 배포하는 일을 대신 해준다.
> - **GitHub Secrets**: 비밀번호를 코드에 직접 쓰면 누구나 볼 수 있다. Secrets는 암호화된 금고처럼 민감한 값을 안전하게 보관하고, 워크플로우 실행 시에만 꺼내 쓴다.

##### watchtower로 이미지 자동 업데이트 (간단한 대안)

GitHub Actions 없이 더 단순하게 자동 업데이트를 원한다면 watchtower를 사용할 수 있다. watchtower는 실행 중인 컨테이너의 이미지가 업데이트되면 자동으로 재시작해주는 컨테이너다.

```yaml
# compose.yml에 watchtower 서비스 추가
services:
  api:
    image: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:latest
    # ... 기타 설정

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /root/.docker/config.json:/config.json  # ECR 인증 정보
    command: --interval 300  # 5분마다 확인
    environment:
      - WATCHTOWER_CLEANUP=true  # 오래된 이미지 자동 삭제
```

```bash
# watchtower 실행
docker compose up -d watchtower
```

> watchtower는 ECR처럼 인증이 필요한 레지스트리도 지원한다. 단, ECR 토큰은 12시간마다 만료되므로 별도의 토큰 갱신 설정이 필요하다.

##### 롤백 전략

배포 후 문제가 발생하면 이전 버전으로 빠르게 되돌려야 한다. GitHub SHA 태그를 사용하면 정확한 버전으로 롤백할 수 있다.

```bash
# EC2에서 특정 버전으로 롤백
# 이전 커밋 SHA를 GitHub Actions 실행 이력에서 확인
PREVIOUS_SHA=abc1234def5678

# 이전 이미지 풀
docker pull \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:$PREVIOUS_SHA

# 이전 이미지로 컨테이너 재시작
APP_IMAGE=123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:$PREVIOUS_SHA \
  docker compose up -d --no-deps api
```

> **[주니어 렌즈 ★★☆]**
> - **`appleboy/ssh-action`**: GitHub Actions에서 SSH로 원격 서버에 명령을 실행하는 액션이다. EC2 키 파일 내용을 `EC2_KEY` Secret에 통째로 넣어서 인증한다.
> - **`${{ github.sha }}`**: 현재 커밋의 고유 SHA 해시 값이다. 이미지 태그로 사용하면 어떤 코드로 만든 이미지인지 정확히 추적할 수 있다. `latest`만 사용하면 정확한 버전을 알 수 없어 롤백이 어렵다.
> - **IAM 사용자 권한 최소화**: CI용 IAM 사용자에게는 ECR push 권한(`AmazonEC2ContainerRegistryPowerUser`)만 부여한다. EC2 전체 제어 권한은 주지 않는다. EC2 배포는 SSH 키를 통해 수행하기 때문이다.

##### 운영 체크리스트

| 단계 | 항목 | 확인 방법 |
|:--|:--|:--|
| **배포 전** | `.env` 파일이 Git에 커밋되지 않았는가 | `git status`, `.gitignore` 확인 |
| **배포 전** | 보안 그룹에서 불필요한 포트가 열려 있지 않은가 | AWS 콘솔 → 보안 그룹 인바운드 규칙 확인 |
| **배포 전** | ECR 이미지에 알려진 취약점이 없는가 | ECR 콘솔 → 이미지 스캔 결과 확인 |
| **배포 중** | GitHub Actions 워크플로우가 성공했는가 | Actions 탭 → 초록 체크 확인 |
| **배포 후** | 헬스체크 엔드포인트가 200을 반환하는가 | `curl http://<IP>/health` |
| **배포 후** | 로그에 에러가 없는가 | `docker compose logs -f` |
| **배포 후** | 컨테이너가 모두 Running 상태인가 | `docker compose ps` |
| **운영 중** | EC2 CPU/메모리 사용량이 정상 범위인가 | AWS CloudWatch 또는 `docker stats` |
| **운영 중** | EBS 디스크 용량이 여유 있는가 | `df -h` |
| **운영 중** | 불필요한 이미지가 디스크를 차지하지 않는가 | `docker system df` → `docker image prune` |

##### 비용 관리

```bash
# 프리티어 한도 확인 (AWS CLI)
aws ce get-cost-and-usage \
  --time-period Start=2026-04-01,End=2026-05-01 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

| 리소스 | 프리티어 한도 | 초과 시 비용 |
|:--|:--|:--|
| EC2 t2.micro | 750시간/월 | ~$0.013/시간 |
| EBS 스토리지 | 30GB | ~$0.1/GB/월 |
| ECR 스토리지 | 500MB/월 | ~$0.1/GB/월 |
| 데이터 전송 (아웃바운드) | 15GB/월 | ~$0.09/GB |

```bash
# 실습 종료 후 정리 목록
# 1. EC2 인스턴스 중지 (Stop) 또는 종료 (Terminate)
# 2. 탄력적 IP 해제 (인스턴스와 연결되지 않은 탄력적 IP는 과금)
# 3. ECR 이미지 삭제 (500MB 초과 시 과금)
# 4. 스냅샷 삭제 (있는 경우)
```

> **[실무자 렌즈 ★★★]**
> - **AWS Budgets 알림 설정**: AWS 콘솔 → Billing → Budgets에서 월 예산 알림을 설정한다. $1 이상 청구 예상 시 이메일 알림을 받도록 설정해두면 예상치 못한 과금을 예방할 수 있다.
> - **GitHub Actions 비용**: GitHub Actions는 퍼블릭 저장소는 무료, 프라이빗 저장소는 월 2,000분까지 무료다. `ubuntu-latest` 러너 기준으로 분당 0.008달러이므로 일반적인 배포 파이프라인은 무료 범위 안에서 동작한다.
> - **이 다음에는?**: 단일 EC2 + Docker Compose 구조는 가장 간단한 배포 방식이다. 서비스 규모가 커지면 아래 기술을 순서대로 검토한다.

**다음 학습 경로**

| 기술 | 사용 시점 | 핵심 내용 |
|:--|:--|:--|
| **AWS ECS (Fargate)** | EC2 관리 없이 컨테이너만 운영하고 싶을 때 | 서버리스 컨테이너 실행 환경 |
| **Kubernetes (EKS)** | 수십 개 이상의 컨테이너를 운영할 때 | 컨테이너 오케스트레이션 |
| **Terraform** | 인프라를 코드로 관리(IaC)하고 싶을 때 | EC2, VPC, ECR을 코드로 선언 |
| **GitHub Actions 심화** | 테스트 자동화, 멀티 환경 배포 | 매트릭스 빌드, 환경 승인 |
| **AWS CDK** | Terraform 대신 Python/TypeScript로 IaC | AWS 서비스에 최적화된 IaC |

##### 체크포인트

- [ ] `.github/workflows/deploy.yml` 파일을 작성하고 GitHub Secrets 4개(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, EC2_HOST, EC2_KEY)를 설정하여 자동 배포 파이프라인을 동작시킬 수 있다
- [ ] `${{ github.sha }}` 이미지 태그를 사용하는 이유와, `latest`만 사용할 때의 문제점을 설명할 수 있다
- [ ] 배포 후 롤백이 필요할 때 이전 SHA 태그로 컨테이너를 재시작하는 명령어를 작성할 수 있다
- [ ] 운영 체크리스트의 배포 전/중/후 항목을 보고 각 확인 방법을 실행할 수 있다
- [ ] 실습 종료 후 AWS 비용이 발생하지 않도록 정리해야 할 리소스 목록(EC2, 탄력적 IP, ECR, 스냅샷)을 말할 수 있다

---

## 부록

### 부록 A. Docker 용어집

| 용어 | 설명 |
|:--|:--|
| Dockerfile | 이미지를 만드는 설계도 파일 |
| Image | Dockerfile로 빌드된 읽기 전용 스냅샷 |
| Container | 이미지가 실행된 상태. 격리된 프로세스 |
| Layer | Dockerfile 명령어 하나가 만드는 파일시스템 변경 단위 |
| Registry | 이미지를 저장·배포하는 원격 저장소 (Docker Hub 등) |
| docker build | Dockerfile을 읽어 이미지를 만드는 명령 |
| docker run | 이미지로 컨테이너를 생성하고 실행하는 명령 |
| docker pull | 레지스트리에서 이미지를 내려받는 명령 |
| docker push | 로컬 이미지를 레지스트리에 올리는 명령 |
| docker ps | 실행 중인 컨테이너 목록 확인 |
| docker images | 로컬에 저장된 이미지 목록 확인 |
| -p (포트 매핑) | 호스트 포트:컨테이너 포트 연결 (예: -p 8000:8000) |
| -d (detached) | 컨테이너를 백그라운드에서 실행 |
| -t (tag) | 이미지 이름/태그 지정 |
| Volume | Docker가 관리하는 영구 저장소 |
| Bind Mount | 호스트 디렉토리를 컨테이너 안에 직접 마운트 |
| Docker Compose | 여러 컨테이너를 YAML로 선언하고 한 번에 실행하는 도구 |
| bridge 네트워크 | Docker 기본 가상 네트워크. 컨테이너 간 통신 허용 |
| HEALTHCHECK | 컨테이너 준비 상태를 주기적으로 검사하는 명령 |
| Multi-stage Build | 하나의 Dockerfile에서 빌드 스테이지와 실행 스테이지를 분리 |
| OCI | Open Container Initiative. 컨테이너 이미지·런타임 표준 |
| Docker Hub | Docker 공식 공개 레지스트리 |
| BuildKit | Docker 빌드 엔진. 병렬 빌드·캐시 최적화를 지원 |
| .dockerignore | 이미지 빌드 시 제외할 파일 목록 (.gitignore와 유사) |
| ENV | Dockerfile에서 환경변수를 설정하는 명령 |
| EXPOSE | 컨테이너가 사용하는 포트를 문서화하는 명령 (실제 개방은 -p로) |
| WORKDIR | 컨테이너 안의 기본 작업 디렉토리 설정 |
| FROM | 베이스 이미지 지정. Dockerfile의 첫 번째 명령 |
| CMD | 컨테이너 시작 시 실행할 기본 명령 |
| ENTRYPOINT | 컨테이너의 진입점 명령 (CMD와 함께 쓰임) |
| RUN | 빌드 시 명령을 실행해 레이어를 쌓는 명령 |
| docker exec | 실행 중인 컨테이너 안에서 명령을 실행하는 명령 (예: `docker exec -it <id> bash`) |
| docker logs | 컨테이너의 표준 출력(stdout/stderr) 로그를 확인하는 명령 |
| docker inspect | 컨테이너 또는 이미지의 상세 정보를 JSON 형식으로 출력하는 명령 |
| docker stats | 실행 중인 컨테이너의 CPU·메모리·네트워크 사용량을 실시간으로 확인하는 명령 |
| docker system prune | 사용하지 않는 컨테이너·이미지·네트워크·빌드 캐시를 한 번에 정리하는 명령 |
| docker cp | 컨테이너와 호스트 사이에 파일 또는 디렉토리를 복사하는 명령 |
| redis-cli | Redis 서버에 접속해 명령을 실행하는 명령줄 클라이언트 |
| mongosh | MongoDB 서버에 접속해 쿼리를 실행하는 공식 셸 클라이언트 (MongoDB Shell) |
| EC2 | AWS의 가상 서버 서비스 (Elastic Compute Cloud). 리눅스/윈도우 인스턴스를 시간 단위로 빌려 쓴다 |
| ECR | AWS의 Docker 이미지 저장소 (Elastic Container Registry). Docker Hub의 AWS 전용 대안 |
| IAM | AWS 접근 권한 관리 서비스 (Identity and Access Management). 사용자·역할·정책으로 AWS 리소스 접근을 제어한다 |
| watchtower | 실행 중인 컨테이너의 이미지를 주기적으로 확인해 새 버전이 나오면 자동으로 업데이트해주는 도구 |
| certbot | Let's Encrypt CA에서 무료 SSL/TLS 인증서를 자동으로 발급·갱신해주는 도구 |
| SCP | SSH 프로토콜 기반으로 원격 서버와 파일을 안전하게 전송하는 명령 (Secure Copy Protocol) |
| AOF | Append-Only File. Redis의 영속화 방식으로, 모든 쓰기 연산을 파일에 순서대로 기록한다 |
| BSON | Binary JSON. MongoDB가 내부적으로 문서를 저장하는 바이너리 형식 |

---

### 부록 B. 자주 묻는 질문 (FAQ)

**Q1. Docker와 가상머신(VM)의 차이가 뭔가요?**
VM은 하드웨어를 가상화해 OS 전체를 올린다. 컨테이너는 OS 커널을 공유하고 앱 실행 환경만 격리한다. 컨테이너는 VM보다 훨씬 가볍고 빠르게 시작된다.

**Q2. `docker run`과 `docker start`의 차이가 뭔가요?**
`docker run`은 이미지로 새 컨테이너를 만들고 실행한다. `docker start`는 이미 존재하는(종료된) 컨테이너를 다시 시작한다.

**Q3. `CMD`와 `ENTRYPOINT`의 차이가 뭔가요?**
`ENTRYPOINT`는 항상 실행되는 진입점이고, `CMD`는 기본 인수다. `docker run myapp 인수`처럼 실행 시 인수를 주면 `CMD`는 override되지만 `ENTRYPOINT`는 유지된다. 단순한 경우 `CMD`만 써도 충분하다.

**Q4. 레이어 캐시를 강제로 무효화하려면?**
`docker build --no-cache -t myapp .`처럼 `--no-cache` 옵션을 주면 모든 레이어를 새로 빌드한다.

**Q5. 컨테이너 안에 접속해서 파일을 직접 보고 싶어요.**
`docker exec -it <컨테이너ID> /bin/bash` (또는 `/bin/sh`)로 컨테이너 내부 셸에 접속할 수 있다. slim 이미지는 bash가 없는 경우 `sh`를 사용한다.

**Q6. 컨테이너가 종료되면 데이터가 사라지나요?**
컨테이너 내부 파일시스템의 변경사항은 컨테이너 종료 시 사라진다. 데이터를 보존하려면 볼륨(Volume) 또는 바인드 마운트(Bind Mount)를 사용해야 한다.

**Q7. `latest` 태그를 쓰면 안 되나요?**
개발/테스트에서는 편하지만 프로덕션에서는 피해야 한다. `latest`는 pull 시점마다 다른 버전이 올 수 있어 재현 불가능한 배포가 된다. semver 태그나 Git SHA 태그를 사용하라.

**Q8. Dockerfile에서 `COPY . .`을 하면 불필요한 파일까지 들어가지 않나요?**
`.dockerignore` 파일에 제외할 항목을 지정하면 된다. `.git`, `__pycache__`, `node_modules`, `*.log` 등을 포함하는 것이 일반적이다.

**Q9. Docker Compose와 Kubernetes의 차이가 뭔가요?**
Docker Compose는 단일 서버(로컬 또는 단일 VM)에서 여러 컨테이너를 조율하는 도구다. Kubernetes는 여러 서버에 걸친 대규모 컨테이너 클러스터를 오케스트레이션한다. 프로젝트 초기에는 Compose로 충분하다.

**Q10. `docker-compose` 명령과 `docker compose` 명령이 다른 건가요?**
Docker Compose V1은 별도로 설치하는 `docker-compose`(하이픈)였다. V2부터 Docker CLI 플러그인으로 통합되어 `docker compose`(공백)를 사용한다. 현재 공식 권장은 V2이며 `docker compose`를 쓴다.

---

### 부록 C. 다음에 공부할 것

Docker를 이 커리큘럼으로 마쳤다면 아래 순서로 확장을 추천한다.

1. **Kubernetes (k8s)** — 컨테이너 오케스트레이션. 여러 서버에서 컨테이너를 자동으로 배포·스케일링·복구한다.
2. **Helm** — Kubernetes 앱의 패키지 관리자. 복잡한 k8s 리소스를 차트(Chart)로 관리한다.
3. **GitHub Actions / GitLab CI** — Docker 빌드·push를 코드 변경에 맞게 자동화한다. 이 커리큘럼 Part VIII-16에서 EC2 자동 배포 전체 워크플로우를 이미 다뤘다. 다음 단계로 매트릭스 빌드(여러 OS·Node 버전 동시 테스트), 멀티 플랫폼 이미지 빌드(amd64/arm64), 스테이징→프로덕션 단계적 승격 파이프라인을 학습하라.
4. **Trivy / Snyk** — 이미지 보안 취약점 스캔을 CI에 통합한다.
5. **AWS ECS / EKS** — 이 커리큘럼 Part VIII-13~16에서 EC2에 직접 Docker를 설치해 배포하는 방법을 다뤘다. 다음 단계로 ECS(Elastic Container Service, AWS 관리형 컨테이너 실행 플랫폼)와 EKS(Elastic Kubernetes Service, AWS 관리형 Kubernetes)를 학습하면 수동 서버 관리 없이 컨테이너를 운영할 수 있다.
6. **Prometheus / Grafana** — 컨테이너 메트릭 수집·시각화 스택. `docker stats`로 확인하던 CPU·메모리 사용량을 시계열 DB에 저장하고 대시보드로 시각화한다. Docker Compose로 로컬에서 바로 실습할 수 있어 진입 장벽이 낮다.
7. **GCP Cloud Run** — 서버리스 컨테이너 플랫폼. Kubernetes 없이 컨테이너를 간단하게 배포한다.

---

### 부록 D. 참고 자료

| 분류 | 제목 | 주소 | 비고 |
|:--|:--|:--|:--|
| 공식 문서 | Docker 공식 문서 | https://docs.docker.com | 가장 정확한 레퍼런스 |
| 공식 문서 | Dockerfile reference | https://docs.docker.com/reference/dockerfile/ | 명령어 전체 목록 |
| 공식 문서 | Docker Compose 파일 레퍼런스 | https://docs.docker.com/compose/compose-file/ | Compose YAML 스펙 |
| 공식 이미지 | Docker Hub 공식 이미지 | https://hub.docker.com | python, postgres, nginx 등 |
| 보안 스캔 | Trivy | https://github.com/aquasecurity/trivy | 오픈소스 이미지 취약점 스캔 |
| 보안 스캔 | Docker Scout | https://docs.docker.com/scout/ | Docker 내장 취약점 스캔 |
| 표준 | OCI 스펙 | https://opencontainers.org | 컨테이너 이미지·런타임 표준 |
| 도구 | BuildKit | https://github.com/moby/buildkit | Docker 빌드 백엔드 |
| CI 통합 | docker/build-push-action | https://github.com/docker/build-push-action | GitHub Actions Docker 빌드 |
| CI 통합 | GitHub Actions 공식 문서 | https://docs.github.com/en/actions | 워크플로우 문법·매트릭스·환경변수 |
| 대안 런타임 | Podman | https://podman.io | 루트리스 컨테이너 도구 |
| 스케일링 | Kubernetes 공식 문서 | https://kubernetes.io/ko/docs/ | 다음 단계: 컨테이너 오케스트레이션 |
| AWS | Amazon ECR 공식 문서 | https://docs.aws.amazon.com/ecr/ | AWS Docker 이미지 레지스트리 |
| AWS | Amazon EC2 공식 문서 | https://docs.aws.amazon.com/ec2/ | AWS 가상 서버 |
| AWS | Amazon ECS 공식 문서 | https://docs.aws.amazon.com/ecs/ | AWS 관리형 컨테이너 서비스 |
| AWS | AWS IAM 공식 문서 | https://docs.aws.amazon.com/iam/ | AWS 접근 권한 관리 |
| 강의 | Play with Docker | https://labs.play-with-docker.com | 브라우저에서 바로 실습 가능 |
