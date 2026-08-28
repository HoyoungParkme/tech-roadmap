# 개발자 기술 로드맵 — 인터랙티브 학습 허브

개발자 기술 로드맵을 빌드 도구 없이 브라우저에서 바로 실행되는 인터랙티브 시각화로 학습합니다.

## 이 프로젝트는 뭔가요?

루트 허브(개발자 학습 노트)가 65개 학습 자료를 목차로 연결합니다. D3.js 마인드맵도 별도 페이지로 볼 수 있습니다. 각 학습 자료는 단계별 애니메이션 시각화(총 1454개)로 구성되어 있습니다. 비유를 써서 설명하면, 도서관 안내판(허브 목차)을 보고 원하는 책(학습 자료)을 찾아가는 구조입니다.

빌드 도구가 전혀 없습니다. HTML 파일을 브라우저로 열거나 정적 서버 하나를 띄우면 바로 동작합니다.

## 바로 시작하기

**GitHub Pages (추천):**
[https://hoyoungparkme.github.io/tech-roadmap/](https://hoyoungparkme.github.io/tech-roadmap/)

**로컬 실행:**
```bash
python -m http.server 8765 --directory . --bind 127.0.0.1
# 그 후 http://127.0.0.1:8765/ 접속
```

루트(`/`)에 접속하면 65개 학습 자료를 모은 학습 노트 허브가 뜹니다. 상단 "☷ 마인드맵으로 보기" 버튼으로 D3.js 마인드맵으로도 이동할 수 있습니다.

## 65개 학습 자료

(2026-08-28 기준)

| 폴더 | 시각화 수 | 핵심 주제 |
|:--|:--:|:--|
| `ai-agent/` | 26개 | Agent 아키텍처, ReAct 패턴, Function Calling |
| `fastapi/` | 78개 | 비동기/Pydantic/CRUD/아키텍처/배포 — Part I~VII |
| `langchain/` | 29개 | LangChain + LangGraph 6 Parts |
| `rag/` | 37개 | RAG 파이프라인 8 Parts |
| `vector-db/` | 22개 | Vector DB 5 Parts |
| `docker/` | 47개 | 컨테이너 + Compose + 배포 |
| `springboot/` | 48개 | Spring Boot Part I~VII |
| `postgres/` | 33개 | PostgreSQL SQL 파이프라인 |
| `react/` | 39개 | React 함수형 컴포넌트 |
| `github/` | 12개 | Git 흐름 9 Parts + 56 섹션 |
| `gcp/` | 4 + SPA 52섹션 | GCP 서비스 (viewer SPA 별도) |
| `graphrag/` | 23개 | GraphRAG + Neo4j — 6 Parts |
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
| `typescript/` | 20개 | type/interface/generic, 고급 타입, React-Node 적용, 설계 패턴, strict 운영 |
| `vue/` | 20개 | Composition API, 컴포넌트 패턴, Pinia/Router, 렌더링/성능, Vite/Nuxt |
| `kotlin/` | 20개 | 기초 문법/OOP/함수형/코루틴/Spring Boot |
| `go/` | 20개 | 기초/고루틴/채널/표준 라이브러리/마이크로서비스 |
| `rust/` | 20개 | 소유권/빌림/라이프타임/비동기/시스템 프로그래밍 |
| `svelte/` | 20개 | 반응형 선언/컴포넌트/스토어/SvelteKit/성능 |
| `vite/` | 20개 | 개발 서버/HMR/번들링/플러그인/최적화 |
| `tailwindcss/` | 20개 | 유틸리티 클래스/반응형/다크모드/커스터마이징/JIT |
| `storybook/` | 20개 | 스토리 작성/Addon/UI 테스트/디자인 시스템/배포 |
| `helm/` | 20개 | 차트 구조/템플릿/값/릴리스/저장소 |
| `argocd/` | 20개 | GitOps/Application/동기화/롤백/멀티 클러스터 |
| `prometheus/` | 20개 | 메트릭/PromQL/Alerting/Exporter/연동 |
| `grafana/` | 20개 | 대시보드/패널/데이터소스/알림/플러그인 |
| `opentelemetry/` | 20개 | 트레이스/메트릭/로그/SDK/Collector |
| `jaeger/` | 20개 | 분산 추적/샘플링/UI/백엔드/연동 |
| `spring-cloud/` | 20개 | Config/Eureka/Gateway/Circuit Breaker/Sleuth |
| `vault/` | 20개 | 시크릿 관리/정책/인증/동적 시크릿/HA |
| `opensearch/` | 20개 | 인덱스/쿼리/Aggregation/보안/Dashboards |
| `rabbitmq/` | 20개 | Exchange/Queue/바인딩/클러스터/메시지 패턴 |
| `grpc/` | 20개 | Protobuf/단방향/스트리밍/인터셉터/부하분산 |
| `pulumi/` | 20개 | IaC 코드/스택/상태/프로바이더/CI |
| `sqlite/` | 20개 | SQL 기초/인덱스/트랜잭션/FTS/임베디드 패턴 |
| `ml/` | 20개 | 지도/비지도/강화학습, SVM, XGBoost |
| `dl/` | 20개 | ANN→CNN→RNN→Transformer |
| `pytorch/` | 20개 | 텐서/autograd/학습 루프 |
| `tensorflow/` | 20개 | Keras/GradientTape 두 방식 |
| `python/` | 20개 | 문법/OOP/타입힌트/현장 활용 |
| `java/` | 20개 | JVM/OOP/컬렉션/모던 자바 |
| `c/` | 20개 | 포인터/메모리/자료구조 직접 구현 |
| `csharp/` | 20개 | .NET/LINQ/async/ASP.NET |
| `cpp/` | 20개 | RAII/STL/이동 시맨틱/멀티스레딩 |
| `nodejs/` | 20개 | 이벤트 루프/비동기/Express |
| `html/` | 20개 | 시맨틱/폼/접근성/성능 |
| `css/` | 20개 | Flex/Grid/반응형/애니메이션 |
| `js/` | 20개 | 비동기/DOM/이벤트/모던 문법 |
| `search/` | 20개 | 역색인/BM25/HNSW/RRF |
| `dw-pipeline/` | 20개 | ODS·DW·DM/dbt/Airflow |

**총 시각화: 1454개 + GCP SPA 52섹션** (2026-08-28 기준)

> 참고: 위 개수는 루트 허브 `index.html`의 `CATS` 배열(등록된 65개 주제) 기준이며, 대표 주제(rag/graphrag/ai-agent/docker/postgres/react/github 등)를 실제 파일 수로 교차 검증했습니다. `webpack/`, `webassembly/`는 아직 `CATS` 배열에 등록되지 않은 별도 진행 중 폴더라 이 표에서 제외했습니다. fastapi의 `project-viewer.html`은 뷰어 페이지라 집계에서 제외했으며, 이에 맞춰 루트 `index.html`의 `CATS` 값도 정정했습니다(springboot도 과다 집계분을 함께 정정). 이제 `CATS` 선언값과 실제 파일 수가 전부 일치합니다.

## 마인드맵

D3.js로 구현한 마인드맵이 전체 학습 자료의 허브입니다.

- 66개 노드, 모두 클릭 가능 (ready 상태)
- 노드 클릭 시 해당 학습 자료로 바로 이동
- 마커 ● = 시각화 있음, ○ = 준비 중

## 주요 기능

- **인터랙티브 시각화**: 단계별 애니메이션 + 키보드 ←/→ 탐색 + 자동 재생
- **giscus 댓글**: 65개 허브 + 마인드맵에 GitHub Discussions 기반 댓글
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
├── mindmap/          # D3.js 마인드맵 (루트 학습 노트 허브에서 링크)
├── ai-agent/         # AI Agent
├── fastapi/          # FastAPI (78개 시각화)
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
├── typescript/       # TypeScript type~설계 패턴
├── vue/              # Vue Composition API~Nuxt
├── kotlin/           # Kotlin 기초~Spring Boot
├── go/               # Go 기초~마이크로서비스
├── rust/             # Rust 소유권~시스템 프로그래밍
├── svelte/           # Svelte 반응형~SvelteKit
├── vite/             # Vite 개발 서버~최적화
├── tailwindcss/      # Tailwind 유틸리티~JIT
├── storybook/        # Storybook 스토리~디자인 시스템
├── helm/             # Helm 차트~저장소
├── argocd/           # ArgoCD GitOps~멀티 클러스터
├── prometheus/       # Prometheus 메트릭~연동
├── grafana/          # Grafana 대시보드~플러그인
├── opentelemetry/    # OpenTelemetry 트레이스~Collector
├── jaeger/           # Jaeger 분산 추적~연동
├── spring-cloud/     # Spring Cloud Config~Sleuth
├── vault/            # Vault 시크릿~HA
├── opensearch/       # OpenSearch 인덱스~Dashboards
├── rabbitmq/         # RabbitMQ Exchange~메시지 패턴
├── grpc/             # gRPC Protobuf~부하분산
├── pulumi/           # Pulumi IaC 코드~CI
├── sqlite/           # SQLite SQL~임베디드 패턴
├── ml/               # Machine Learning 지도~강화학습
├── dl/               # Deep Learning ANN~Transformer
├── pytorch/          # PyTorch 텐서~학습 루프
├── tensorflow/       # TensorFlow Keras~GradientTape
├── python/           # Python 문법~현장 활용
├── java/             # Java JVM~모던 자바
├── c/                # C 포인터~자료구조 직접 구현
├── csharp/           # C# .NET~ASP.NET
├── cpp/              # C++ RAII~멀티스레딩
├── nodejs/           # Node.js 이벤트 루프~Express
├── html/             # HTML 시맨틱~성능
├── css/              # CSS Flex/Grid~애니메이션
├── js/               # JavaScript 비동기~모던 문법
├── search/           # Search 역색인~RRF
├── dw-pipeline/      # DW Pipeline ODS~Airflow
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
