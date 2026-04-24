"""README.md 시각화 목차 + 파일 구조 갱신 스크립트"""
import pathlib

readme = pathlib.Path("fastapi/README.md")
content = readme.read_text(encoding="utf-8")

OLD_VIZ = """#### Part IV. FastAPI 코어 개념

| Chapter | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| 1-1 | 비동기 I/O & Event Loop | [`chapter-01-01-async.html`](./chapter-01-01-async.html) | ✅ 완성 |
| 1-2 | Pydantic 데이터 검증 (잘못된 입력 → 422 / 올바른 입력 → 200 분기) | [`chapter-01-02-pydantic.html`](./chapter-01-02-pydantic.html) | ✅ 완성 |
| 1-3 | 자동 OpenAPI 문서 | [`chapter-01-03-openapi.html`](./chapter-01-03-openapi.html) | ✅ 완성 |
| 3-3 | JWT 인증 | (예정) | ⏳ 준비 중 |

| Part | 제목 | 대상 난이도 | 시각화 |
|:--|:--|:--|:--|
| I | 왜 웹인가 | ★☆☆ (비개발자) | — |
| II | 웹 프레임워크 개론 | ★☆☆~★★☆ | — |
| III | FastAPI 첫 걸음 | ★★☆ (코딩 입문) | — |
| IV | FastAPI 코어 개념 | ★★☆~★★★ | ✅ IV-1-1 (`chapter-01-01-async.html`), ✅ IV-1-2 (`chapter-01-02-pydantic.html`), ✅ IV-1-3 (`chapter-01-03-openapi.html`) |
| V | 아키텍처 패턴 | ★★★ (주니어) | — |
| VI | 실전 프로젝트 | ★★★ | — |
| VII | 배포와 운영 | ★★★ | — |
| 부록 | 용어집 / FAQ / 다음 공부 / 참고자료 | 공통 | — |"""

NEW_VIZ = """#### Part II. 웹 프레임워크 개론

| Section | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| II-1-1 | 맨땅 vs 프레임워크 | [`II-1-1.html`](./II-1-1.html) | ✅ 완성 |
| II-1-2 | 라이브러리 vs 프레임워크 (IoC) | [`II-1-2.html`](./II-1-2.html) | ✅ 완성 |
| II-2-1 | 생 소켓 vs 프레임워크 코드량 | [`II-2-1.html`](./II-2-1.html) | ✅ 완성 |
| II-3 | 주요 웹 프레임워크 지도 | [`II-3.html`](./II-3.html) | ✅ 완성 |
| II-4-1 | 동기 vs 비동기 (햄버거 가게) | [`II-4-1.html`](./II-4-1.html) | ✅ 완성 |
| II-4-2 | WSGI vs ASGI | [`II-4-2.html`](./II-4-2.html) | ✅ 완성 |
| II-6 | FastAPI 선택 가이드 | [`II-6.html`](./II-6.html) | ✅ 완성 |

#### Part III. FastAPI 첫 걸음

| Section | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| III-2-1 | 가상환경 (장난감 상자 비유) | [`III-2-1.html`](./III-2-1.html) | ✅ 완성 |
| III-3-1 | 5줄짜리 첫 API | [`III-3-1.html`](./III-3-1.html) | ✅ 완성 |
| III-3-2/3 | uvicorn 실행 + 브라우저 확인 | [`III-3-23.html`](./III-3-23.html) | ✅ 완성 |
| III-4 | Swagger UI 구조 | [`III-4.html`](./III-4.html) | ✅ 완성 |
| III-5-1 | Port already in use 에러 | [`III-5-1.html`](./III-5-1.html) | ✅ 완성 |
| III-5-2 | ModuleNotFoundError 에러 | [`III-5-2.html`](./III-5-2.html) | ✅ 완성 |

#### Part IV. FastAPI 코어 개념

| Section | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| IV-1-1 | 비동기 I/O & Event Loop | [`chapter-01-01-async.html`](./chapter-01-01-async.html) | ✅ 완성 |
| IV-1-2 | Pydantic 데이터 검증 | [`chapter-01-02-pydantic.html`](./chapter-01-02-pydantic.html) | ✅ 완성 |
| IV-1-3 | 자동 OpenAPI 문서 | [`chapter-01-03-openapi.html`](./chapter-01-03-openapi.html) | ✅ 완성 |
| IV-2-1 | Path/Query Parameter | [`chapter-02-01-params.html`](./chapter-02-01-params.html) | ✅ 완성 |
| IV-2-2 | Response Model | [`chapter-02-02-response-model.html`](./chapter-02-02-response-model.html) | ✅ 완성 |
| IV-2-3 | HTTPException | [`chapter-02-03-exception.html`](./chapter-02-03-exception.html) | ✅ 완성 |
| IV-3-1 | Depends() 의존성 주입 | [`chapter-03-01-depends.html`](./chapter-03-01-depends.html) | ✅ 완성 |
| IV-3-2 | DB 세션 관리 | [`chapter-03-02-db-session.html`](./chapter-03-02-db-session.html) | ✅ 완성 |
| IV-3-3 | JWT 인증 | [`chapter-03-03-jwt.html`](./chapter-03-03-jwt.html) | ✅ 완성 |

#### Part V. 아키텍처 패턴

| Section | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| V-1-1 | 스파게티 코드 | [`chapter-05-01-spaghetti.html`](./chapter-05-01-spaghetti.html) | ✅ 완성 |
| V-1-2 | 템플릿(패턴) 효과 | [`chapter-05-02-template.html`](./chapter-05-02-template.html) | ✅ 완성 |
| V-2-1 | MVC 패턴 | [`chapter-05-03-mvc.html`](./chapter-05-03-mvc.html) | ✅ 완성 |
| V-2-2 | MVC vs MTV 비교 | [`chapter-05-04-mtv.html`](./chapter-05-04-mtv.html) | ✅ 완성 |
| V-2-3 | Fat Controller | [`chapter-05-05-fat-controller.html`](./chapter-05-05-fat-controller.html) | ✅ 완성 |
| V-3-1 | 레이어드 아키텍처 3계층 | [`chapter-05-06-layered.html`](./chapter-05-06-layered.html) | ✅ 완성 |
| V-3-2 | FastAPI 폴더 구조 | [`chapter-05-07-folder.html`](./chapter-05-07-folder.html) | ✅ 완성 |
| V-3-3 | APIRouter 분리 | [`chapter-05-08-apirouter.html`](./chapter-05-08-apirouter.html) | ✅ 완성 |
| V-4-1 | 헥사고날 아키텍처 | [`chapter-05-09-hexagonal.html`](./chapter-05-09-hexagonal.html) | ✅ 완성 |
| V-4-2 | 클린 아키텍처 | [`chapter-05-10-clean.html`](./chapter-05-10-clean.html) | ✅ 완성 |
| V-4-3 | 패턴 선택 가이드 | [`chapter-05-11-when.html`](./chapter-05-11-when.html) | ✅ 완성 |
| V-5-1 | BackgroundTasks | [`chapter-05-12-background.html`](./chapter-05-12-background.html) | ✅ 완성 |
| V-5-2 | Celery / 메시지 큐 | [`chapter-05-13-celery.html`](./chapter-05-13-celery.html) | ✅ 완성 |

#### 전체 현황

| Part | 제목 | 시각화 수 |
|:--|:--|:--|
| I | 왜 웹인가 | 7개 ✅ |
| II | 웹 프레임워크 개론 | 7개 ✅ |
| III | FastAPI 첫 걸음 | 6개 ✅ |
| IV | FastAPI 코어 개념 | 9개 ✅ |
| V | 아키텍처 패턴 | 13개 ✅ |
| **합계** | | **42개** |"""

OLD_FILES = """fastapi/
├── index.html                 # 허브(목차) 페이지 — 챕터 카드 그리드
├── I-1-1.html                 # I-1-1 인터넷이 어떻게 연결돼 있나
├── I-1-2.html                 # I-1-2 IP, 도메인, DNS — 주소의 종류
├── I-1-3.html                 # I-1-3 포트 — 한 컴퓨터 안의 여러 창구
├── I-2-1.html                 # I-2-1 요청과 응답 — 편지처럼 주고받는다
├── I-2-2.html                 # I-2-2 메서드 — GET / POST / PUT / DELETE
├── I-2-3.html                 # I-2-3 상태 코드 — 200 / 404 / 500
├── I-2-4.html                 # I-2-4 헤더와 바디 — 봉투와 편지지
├── chapter-01-01-async.html   # IV-1-1 비동기 I/O & Event Loop
├── chapter-01-02-pydantic.html # IV-1-2 Pydantic 데이터 검증
├── chapter-01-03-openapi.html # IV-1-3 자동 OpenAPI 문서
└── curriculum.md              # 전체 목차 (Part I~VII + 부록, 90+ Section)"""

NEW_FILES = """fastapi/
├── index.html                       # 허브 — 42개 시각화 카드 그리드
├── I-1-1.html ~ I-2-4.html          # Part I (7개)
├── II-1-1.html ~ II-6.html          # Part II (7개)
├── III-2-1.html ~ III-5-2.html      # Part III (6개)
├── chapter-01-01 ~ chapter-03-03    # Part IV (9개)
├── chapter-05-01 ~ chapter-05-13    # Part V (13개)
└── curriculum.md                    # 전체 목차 (Part I~VII + 부록, 90+ Section)"""

content = content.replace(OLD_VIZ, NEW_VIZ)
content = content.replace(OLD_FILES, NEW_FILES)

readme.write_text(content, encoding="utf-8")
print("README.md updated: 42 visualizations reflected")
