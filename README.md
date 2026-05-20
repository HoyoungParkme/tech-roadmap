# 개발자 기술 로드맵 — 인터랙티브 학습 허브

개발자 기술 로드맵을 빌드 도구 없이 브라우저에서 바로 실행되는 인터랙티브 시각화로 학습합니다.

## 이 프로젝트는 뭔가요?

D3.js 마인드맵 하나가 28개 학습 자료를 연결하는 허브 역할을 합니다. 각 학습 자료는 단계별 애니메이션 시각화(총 712개)로 구성되어 있습니다. 비유를 써서 설명하면, 도서관 안내판(마인드맵)을 보고 원하는 책(학습 자료)을 찾아가는 구조입니다.

빌드 도구가 전혀 없습니다. HTML 파일을 브라우저로 열거나 정적 서버 하나를 띄우면 바로 동작합니다.

## 바로 시작하기

**GitHub Pages (추천):**
[https://hoyoungparkme.github.io/tech-roadmap/](https://hoyoungparkme.github.io/tech-roadmap/)

**로컬 실행:**
```bash
python -m http.server 8765 --directory . --bind 127.0.0.1
# 그 후 http://127.0.0.1:8765/ 접속
```

루트(`/`)에 접속하면 마인드맵으로 자동 이동합니다.

## 28개 학습 자료

(2026-05-20 기준, Sprint 93)

| 폴더 | 시각화 수 | 핵심 주제 |
|:--|:--:|:--|
| `ai-agent/` | 26개 | Agent 아키텍처, ReAct 패턴, Function Calling |
| `fastapi/` | 79개 | 비동기/Pydantic/CRUD/아키텍처/배포 — Part I~VII |
| `langchain/` | 29개 | LangChain + LangGraph 6 Parts |
| `rag/` | 35개 | RAG 파이프라인 7 Parts |
| `vector-db/` | 22개 | Vector DB 5 Parts |
| `docker/` | 47개 | 컨테이너 + Compose + 배포 |
| `springboot/` | 49개 | Spring Boot Part I~VII |
| `postgres/` | 33개 | PostgreSQL SQL 파이프라인 |
| `react/` | 39개 | React 함수형 컴포넌트 |
| `github/` | 12개 | Git 흐름 9 Parts + 56 섹션 |
| `gcp/` | 4 + SPA 52섹션 | GCP 서비스 (viewer SPA 별도) |
| `graphrag/` | 21개 | GraphRAG + Neo4j — 5 Parts |
| `kubernetes/` | 20개 | K8s 워크로드/서비스/스토리지/운영 |
| `mlops/` | 20개 | 데이터/학습/배포/모니터링/운영 |
| `observability/` | 20개 | 메트릭/로그/트레이스/SLO/사고대응 |
| `data-engineering/` | 20개 | 수집/저장/처리/스트리밍/거버넌스 |
| `cloud-infra/` | 20개 | 멀티 클라우드/네트워킹/메시징/DR |
| `terraform/` | 20개 | HCL/상태/모듈/CI/보안 |
| `kafka/` | 20개 | 브로커/프로듀서/컨슈머/스트림/운영 |
| `redis/` | 20개 | 자료구조/캐시/Pub-Sub/Cluster/운영 |
| `elasticsearch/` | 20개 | 인덱스/쿼리/Aggregation/Cluster/운영 |
| `llmops/` | 20개 | 프롬프트/RAG/평가/배포/거버넌스 |
| `nginx/` | 20개 | 설정/리버스 프록시/로드밸런싱/SSL/튜닝 |
| `nextjs/` | 20개 | App Router/Server Components/배포/Edge |
| `mongodb/` | 20개 | Document/Query/인덱스/Replica/Sharding |
| `graphql/` | 20개 | 스키마/Resolver/Federation/캐시/보안 |
| `microservices/` | 20개 | 도메인 분리/통신/데이터/배포/모니터링 |
| `linux/` | 20개 | 파일/프로세스/네트워크/자동화/운영 |

**총 시각화: 712개 + GCP SPA 52섹션** (2026-05-20 기준)

## 마인드맵

D3.js로 구현한 마인드맵이 전체 학습 자료의 허브입니다.

- 66개 노드, 모두 클릭 가능 (ready 상태)
- 노드 클릭 시 해당 학습 자료로 바로 이동
- 마커 ● = 시각화 있음, ○ = 준비 중

## 주요 기능

- **인터랙티브 시각화**: 단계별 애니메이션 + 키보드 ←/→ 탐색 + 자동 재생
- **giscus 댓글**: 28개 허브 + 마인드맵에 GitHub Discussions 기반 댓글
- **즉시 실행**: 빌드 없이 브라우저에서 바로 동작
- **반응형**: 모바일/데스크톱 모두 지원 (Tailwind 반응형 클래스)

## 기술 스택

| 분류 | 기술 | 역할 |
|:--|:--|:--|
| UI 프레임워크 | React 18 (UMD CDN) | 허브 사이드바, GiscusPanel |
| CSS | Tailwind Play CDN | 반응형 스타일링 |
| JSX 컴파일 | Babel Standalone | 브라우저 내 JSX 변환 |
| 그래프 시각화 | D3.js | 마인드맵 |
| 댓글 시스템 | giscus | GitHub Discussions 연동 |
| 배포 | GitHub Pages | 정적 파일 그대로 배포 |
| 빌드 도구 | **없음** | 단일 HTML, 추가 도구 불필요 |

## 프로젝트 구조

```
tech-roadmap/
├── mindmap/          # D3.js 마인드맵 허브 (전체 진입점)
├── ai-agent/         # AI Agent
├── fastapi/          # FastAPI (79개 시각화)
├── langchain/        # LangChain + LangGraph
├── rag/              # RAG 파이프라인
├── vector-db/        # Vector DB
├── docker/           # Docker + Compose
├── springboot/       # Spring Boot
├── postgres/         # PostgreSQL
├── react/            # React 함수형 컴포넌트
├── github/           # Git 흐름
├── gcp/              # GCP (SPA 패턴 별도)
├── graphrag/         # GraphRAG + Neo4j
├── kubernetes/       # K8s 워크로드/서비스/스토리지
├── mlops/            # MLOps 데이터~운영
├── observability/    # 메트릭/로그/트레이스/SLO
├── data-engineering/ # DE 수집~거버넌스
├── cloud-infra/      # 멀티 클라우드/네트워킹
├── terraform/        # IaC HCL~보안
├── kafka/            # Kafka 브로커~운영
├── redis/            # Redis 자료구조~운영
├── elasticsearch/    # Elastic 인덱스~운영
├── llmops/           # LLMOps 프롬프트~거버넌스
├── nginx/            # Nginx 설정~튜닝
├── nextjs/           # Next.js App Router~Edge
├── mongodb/          # MongoDB Document~Sharding
├── graphql/          # GraphQL 스키마~보안
├── microservices/    # MSA 도메인~모니터링
├── linux/            # Linux 파일~운영
└── docs/             # 프로젝트 설계·운영 문서 (Claude 전용)
```

각 폴더 안에는 `index.html` (학습 허브), `curriculum.md` (학습 흐름), `README.md` (폴더 개요)가 있습니다.

## 설계 원칙

- **빌드 도구 0**: GitHub Pages에서 빌드 없이 배포 (D-01)
- **단일 HTML**: 시각화 1개 = HTML 파일 1개, 의존성 최소화
- **ai-agent 기준 디자인**: 전체 허브 레이아웃의 golden standard (D-02)
- **점진적 콘텐츠 추가**: 새 프로젝트는 Phase A → 점진 보강 패턴 (D-13)

## 저장소

- GitHub: [https://github.com/HoyoungParkme/tech-roadmap](https://github.com/HoyoungParkme/tech-roadmap)
- 기본 브랜치: `main`
- 배포: `main` 브랜치 push 시 GitHub Pages 자동 반영

## 기여

이 저장소는 개인 학습 목적으로 운영됩니다. 오류 발견 시 각 학습 허브 하단의 giscus 댓글로 알려주세요.

## 라이선스

MIT
