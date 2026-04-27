# Vector DB 인터랙티브 학습 커리큘럼

## 읽기 가이드

### 난이도 범례
- ★☆☆ : DB 기본 개념만 있으면 이해 가능
- ★★☆ : 임베딩, 벡터 검색 기본 경험 권장
- ★★★ : 벡터 DB 운영 경험이 있으면 더 깊이 이해

### 독자별 추천 경로
- **벡터 DB가 처음**: Part I → Part II → Part III → Part IV → Part V (순서대로)
- **RAG 프로젝트를 이미 봤다**: Part I(훑기) → 관심 DB Part → Part V
- **특정 DB만 궁금하다**: Part I(I-1-1만) → Part II/III/IV 중 택 1
- **어떤 DB를 쓸지 결정해야 한다**: Part I → Part V → 선택한 DB Part

---

## 전체 목차

```
Part I.  벡터 DB 기초 ──────────────── "왜 벡터 DB인가"               (4개)
  └ Chapter I-1. 벡터 DB의 필요성
      ├ I-1-1. 전통 DB vs 벡터 DB — 왜 새로운 DB가 필요한가
      └ I-1-2. 벡터 DB 핵심 개념 — Embedding, Index, Query
  └ Chapter I-2. 벡터 DB 아키텍처
      ├ I-2-1. 벡터 DB 아키텍처 전체 지도
      └ I-2-2. 벡터 DB 종류와 분류 — 라이브러리 vs 서버 vs 확장

Part II. FAISS ─────────────────────── "Facebook의 벡터 검색 엔진"    (5개)
  └ Chapter II-1. FAISS 기초
      ├ II-1-1. FAISS란 — 라이브러리 기반 벡터 검색
      └ II-1-2. FAISS 인덱스 종류 — Flat, IVF, HNSW, PQ
  └ Chapter II-2. FAISS 실전
      ├ II-2-1. FAISS 실전 워크플로우 — 빌드부터 검색까지
      ├ II-2-2. FAISS 최적화 — GPU 가속과 양자화
      └ II-2-3. FAISS의 한계와 보완 — 메타데이터, 영속성, 필터링

Part III. Chroma ───────────────────── "개발자 친화적 임베딩 DB"       (4개)
  └ Chapter III-1. Chroma 기초
      ├ III-1-1. Chroma란 — 설치에서 첫 검색까지
      └ III-1-2. Chroma 핵심 기능 — Collection, 메타데이터, 영속성
  └ Chapter III-2. Chroma 실전
      ├ III-2-1. Chroma 아키텍처 — 인메모리 vs Client-Server
      └ III-2-2. Chroma + LangChain/LlamaIndex 통합

Part IV. pgvector ──────────────────── "PostgreSQL의 벡터 확장"       (5개)
  └ Chapter IV-1. pgvector 기초
      ├ IV-1-1. pgvector란 — PostgreSQL에 벡터 검색 추가
      └ IV-1-2. pgvector 데이터 모델 — vector 타입과 연산자
  └ Chapter IV-2. pgvector 실전
      ├ IV-2-1. pgvector 인덱싱 — IVFFlat vs HNSW
      ├ IV-2-2. pgvector 실전 — SQL로 벡터 검색 + 메타데이터 필터
      └ IV-2-3. pgvector 운영 — 성능 튜닝과 스케일링

Part V.  비교와 선택 가이드 ─────────── "내 프로젝트에 맞는 선택"      (4개)
  └ Chapter V-1. 비교 분석
      ├ V-1-1. FAISS vs Chroma vs pgvector — 기능 비교 매트릭스
      └ V-1-2. 의사결정 플로우차트 — 상황별 선택 가이드
  └ Chapter V-2. 실전 아키텍처
      ├ V-2-1. 벡터 DB 조합 패턴 — 하이브리드 아키텍처
      └ V-2-2. 프로덕션 벡터 DB 운영 — 모니터링, 백업, 스케일링
```

---

## Part I. 벡터 DB 기초 — "왜 벡터 DB인가"

> 전통 DB는 "정확히 일치하는 것"을 찾는다. 벡터 DB는 "비슷한 것"을 찾는다.
> 이 근본적 차이가 AI 시대에 왜 중요한지, 핵심 개념을 잡는다.

### I-1-1. 전통 DB vs 벡터 DB — 왜 새로운 DB가 필요한가

- 난이도: ★☆☆
- 선수 지식: SQL 기초
- 학습 목표: 전통 DB의 한계와 벡터 DB의 필요성을 이해한다
- 설명: 도서관에서 책을 찾는 두 가지 방법을 비유로 사용한다. **색인 카드**(ISBN, 제목 정확 검색)가 전통 DB라면, **사서에게 "이런 느낌의 책 추천해주세요"**라고 요청하는 것이 벡터 DB다. SQL의 WHERE exact = match로는 "의미적으로 비슷한" 검색이 불가능하다.
- 핵심 키워드: `정확 매칭`, `의미 검색`, `Semantic Search`, `벡터 유사도`
- 시각화: [I-1-1 시각화 보기](part1/I-1-1.html) — 전통 DB vs 벡터 DB 검색 비교 (5단계)
- 다음 섹션: [I-1-2. 벡터 DB 핵심 개념](#i-1-2-벡터-db-핵심-개념--embedding-index-query)

### I-1-2. 벡터 DB 핵심 개념 — Embedding, Index, Query

- 난이도: ★☆☆
- 선수 지식: I-1-1
- 학습 목표: 벡터 DB의 3대 작업(저장, 인덱싱, 검색)을 이해한다
- 설명: 물류 창고를 비유로 사용한다. **(1) 입고** = 텍스트를 임베딩으로 변환해 저장, **(2) 정리** = 인덱스를 빌드해 빠르게 찾을 수 있도록 분류, **(3) 출고** = 쿼리 벡터와 유사한 벡터를 검색해 반환. 이 세 단계가 모든 벡터 DB의 공통 구조다.
- 핵심 키워드: `Embedding`, `Index`, `Query`, `k-NN`, `유사도`
- 시각화: [I-1-2 시각화 보기](part1/I-1-2.html) — 벡터 DB 3대 작업 파이프라인 (5단계)
- 다음 섹션: [I-2-1. 벡터 DB 아키텍처 전체 지도](#i-2-1-벡터-db-아키텍처-전체-지도)

### I-2-1. 벡터 DB 아키텍처 전체 지도

- 난이도: ★★☆
- 선수 지식: I-1-2
- 학습 목표: 벡터 DB의 내부 구성 요소와 데이터 흐름을 파악한다
- 설명: 벡터 DB 내부를 공장 조립 라인에 비유한다. 원료(텍스트) → 가공(임베딩) → 분류(인덱싱) → 검색(쿼리 엔진) → 출하(결과 반환). 각 구성 요소(Storage Engine, Index Engine, Query Engine, Metadata Store)의 역할을 시각화한다.
- 핵심 키워드: `Storage Engine`, `Index Engine`, `Query Engine`, `Metadata`, `Pipeline`
- 시각화: [I-2-1 시각화 보기](part1/I-2-1.html) — 벡터 DB 내부 아키텍처 흐름도 (6단계)
- 다음 섹션: [I-2-2. 벡터 DB 종류와 분류](#i-2-2-벡터-db-종류와-분류--라이브러리-vs-서버-vs-확장)

### I-2-2. 벡터 DB 종류와 분류 — 라이브러리 vs 서버 vs 확장

- 난이도: ★★☆
- 선수 지식: I-2-1
- 학습 목표: 벡터 DB의 3가지 분류를 이해하고 각 대표 제품을 안다
- 설명: 세 가지 도구를 비유로 사용한다. **(1) 도구함**(FAISS) = 내가 직접 꺼내 쓰는 라이브러리, 서버 없이 코드에 임포트. **(2) 미니 냉장고**(Chroma) = 독립 실행 가능한 경량 서버, 개발/프로토타입에 최적. **(3) 대형 냉장고 확장**(pgvector) = 기존 PostgreSQL에 벡터 기능을 추가하는 확장, SQL과 벡터 검색을 함께 사용.
- 핵심 키워드: `라이브러리`, `독립 서버`, `DB 확장`, `FAISS`, `Chroma`, `pgvector`
- 시각화: [I-2-2 시각화 보기](part1/I-2-2.html) — 벡터 DB 3분류 비교 (5단계)
- 다음 섹션: [II-1-1. FAISS란](#ii-1-1-faiss란--라이브러리-기반-벡터-검색)

---

## Part II. FAISS — "Facebook의 벡터 검색 엔진"

> FAISS는 라이브러리다. 서버가 아니라 코드에 직접 임포트해서 쓴다.
> 메모리에서 초고속 검색이 가능하지만, 영속성은 직접 관리해야 한다.

### II-1-1. FAISS란 — 라이브러리 기반 벡터 검색

- 난이도: ★☆☆
- 선수 지식: Part I
- 학습 목표: FAISS의 특성과 기본 사용법을 이해한다
- 설명: `pip install faiss-cpu` 한 줄이면 끝. 레고 블록을 조립하듯 import → index 생성 → add → search 4단계로 벡터 검색이 완성된다.
- 핵심 키워드: `faiss-cpu`, `faiss-gpu`, `IndexFlatL2`, `add()`, `search()`
- 시각화: [II-1-1 시각화 보기](part2/II-1-1.html) — FAISS 기본 워크플로우 (5단계)
- 다음 섹션: [II-1-2. FAISS 인덱스 종류](#ii-1-2-faiss-인덱스-종류--flat-ivf-hnsw-pq)

### II-1-2. FAISS 인덱스 종류 — Flat, IVF, HNSW, PQ

- 난이도: ★★☆
- 선수 지식: II-1-1
- 학습 목표: 4가지 인덱스의 동작 원리와 트레이드오프를 이해한다
- 설명: Flat(전수 검색, 느리지만 100% 정확), IVF(군집 분할, 빠르지만 근사치), HNSW(그래프 탐색, 메모리 많이 사용), PQ(양자화, 메모리 절약). 속도/메모리/정확도 레이더 차트로 비교한다.
- 핵심 키워드: `IndexFlatL2`, `IndexIVFFlat`, `IndexHNSWFlat`, `IndexPQ`, `nprobe`, `recall`
- 시각화: [II-1-2 시각화 보기](part2/II-1-2.html) — FAISS 인덱스 4종 비교 (6단계)
- 다음 섹션: [II-2-1. FAISS 실전 워크플로우](#ii-2-1-faiss-실전-워크플로우--빌드부터-검색까지)

### II-2-1. FAISS 실전 워크플로우 — 빌드부터 검색까지

- 난이도: ★★☆
- 선수 지식: II-1-2
- 학습 목표: 실전 FAISS 프로젝트의 전체 파이프라인을 구현할 수 있다
- 설명: 데이터 준비 → 임베딩 생성 → 인덱스 선택 & 빌드 → 학습(train) → 검색 → 결과 처리. 각 단계의 코드와 함께 실전 팁을 시각화한다.
- 핵심 키워드: `train()`, `add()`, `search()`, `write_index()`, `read_index()`, `batch`
- 시각화: [II-2-1 시각화 보기](part2/II-2-1.html) — FAISS 실전 파이프라인 (6단계)
- 다음 섹션: [II-2-2. FAISS 최적화](#ii-2-2-faiss-최적화--gpu-가속과-양자화)

### II-2-2. FAISS 최적화 — GPU 가속과 양자화

- 난이도: ★★★
- 선수 지식: II-2-1
- 학습 목표: FAISS의 GPU 가속과 양자화를 통한 성능 최적화를 이해한다
- 설명: 일반 도로(CPU)와 고속도로(GPU)의 속도 차이. 양자화(PQ, SQ)는 트럭 적재 최적화 — 벡터를 압축해서 메모리를 절약하면서 속도를 유지한다.
- 핵심 키워드: `faiss-gpu`, `GpuIndexFlat`, `OPQ`, `SQ8`, `메모리 절약`, `throughput`
- 시각화: [II-2-2 시각화 보기](part2/II-2-2.html) — CPU vs GPU 성능 비교 (5단계)
- 다음 섹션: [II-2-3. FAISS의 한계와 보완](#ii-2-3-faiss의-한계와-보완--메타데이터-영속성-필터링)

### II-2-3. FAISS의 한계와 보완 — 메타데이터, 영속성, 필터링

- 난이도: ★★★
- 선수 지식: II-2-2
- 학습 목표: FAISS에 없는 기능과 이를 보완하는 방법을 안다
- 설명: 스위스 아미 나이프에도 없는 도구가 있다. FAISS에는 **(1) 메타데이터 필터링**, **(2) 자동 영속성**, **(3) CRUD 업데이트**, **(4) 분산 처리**가 없다. 각각을 외부 도구(SQLite, pickle, ID 매핑)로 보완하는 패턴을 보여준다.
- 핵심 키워드: `메타데이터`, `persistence`, `ID 매핑`, `pre-filter`, `post-filter`
- 시각화: [II-2-3 시각화 보기](part2/II-2-3.html) — FAISS 한계 + 보완 패턴 (5단계)
- 다음 섹션: [III-1-1. Chroma란](#iii-1-1-chroma란--설치에서-첫-검색까지)

---

## Part III. Chroma — "개발자 친화적 임베딩 DB"

> Chroma는 "임베딩에 특화된 DB"다. 서버 모드와 인메모리 모드를 모두 지원하고,
> 메타데이터 필터링이 내장되어 있다. RAG 프로토타이핑에 가장 빠르게 시작할 수 있다.

### III-1-1. Chroma란 — 설치에서 첫 검색까지

- 난이도: ★☆☆
- 선수 지식: Part I
- 학습 목표: Chroma의 기본 사용법을 3분 안에 이해한다
- 설명: 커피 머신에 비유한다. **(1) 원두 넣기** = `pip install chromadb`, **(2) 추출** = collection 생성 + 문서 추가, **(3) 서빙** = query로 유사 문서 검색. FAISS보다 코드가 직관적이고 메타데이터가 내장되어 있다.
- 핵심 키워드: `chromadb`, `Collection`, `add()`, `query()`, `embedding_function`
- 시각화: [III-1-1 시각화 보기](part3/III-1-1.html) — Chroma 기본 워크플로우 (5단계)
- 다음 섹션: [III-1-2. Chroma 핵심 기능](#iii-1-2-chroma-핵심-기능--collection-메타데이터-영속성)

### III-1-2. Chroma 핵심 기능 — Collection, 메타데이터, 영속성

- 난이도: ★★☆
- 선수 지식: III-1-1
- 학습 목표: Chroma의 3대 핵심 기능을 실전에서 활용할 수 있다
- 설명: 정리된 파일 캐비닛에 비유한다. **Collection** = 서랍(주제별 분류), **메타데이터 필터** = 태그 검색(날짜, 카테고리로 좁히기), **영속성** = 파일 캐비닛을 잠그고 나갔다 와도 그대로.
- 핵심 키워드: `Collection`, `where`, `where_document`, `persist_directory`, `PersistentClient`
- 시각화: [III-1-2 시각화 보기](part3/III-1-2.html) — Chroma 핵심 3기능 (6단계)
- 다음 섹션: [III-2-1. Chroma 아키텍처](#iii-2-1-chroma-아키텍처--인메모리-vs-client-server)

### III-2-1. Chroma 아키텍처 — 인메모리 vs Client-Server

- 난이도: ★★☆
- 선수 지식: III-1-2
- 학습 목표: Chroma의 두 가지 운영 모드를 이해하고 상황에 맞게 선택할 수 있다
- 설명: 1인 카페(인메모리 모드)와 프랜차이즈(Client-Server 모드)에 비유한다. 인메모리는 개발/노트북에서 빠르게 프로토타이핑, Client-Server는 여러 애플리케이션이 공유하는 프로덕션 환경.
- 핵심 키워드: `EphemeralClient`, `PersistentClient`, `HttpClient`, `ChromaDB Server`, `Docker`
- 시각화: [III-2-1 시각화 보기](part3/III-2-1.html) — Chroma 운영 모드 비교 (5단계)
- 다음 섹션: [III-2-2. Chroma + LangChain/LlamaIndex 통합](#iii-2-2-chroma--langchainllamaindex-통합)

### III-2-2. Chroma + LangChain/LlamaIndex 통합

- 난이도: ★★★
- 선수 지식: III-2-1
- 학습 목표: Chroma를 RAG 프레임워크와 연동하는 패턴을 안다
- 설명: 어댑터/변환기에 비유한다. LangChain의 `Chroma.from_documents()`와 LlamaIndex의 `ChromaVectorStore`가 각각 어떻게 Chroma를 감싸는지, 코드 패턴을 비교한다.
- 핵심 키워드: `Chroma.from_documents()`, `ChromaVectorStore`, `VectorStoreIndex`, `as_retriever()`
- 시각화: [III-2-2 시각화 보기](part3/III-2-2.html) — 프레임워크 통합 패턴 (5단계)
- 다음 섹션: [IV-1-1. pgvector란](#iv-1-1-pgvector란--postgresql에-벡터-검색-추가)

---

## Part IV. pgvector — "PostgreSQL의 벡터 확장"

> 이미 PostgreSQL을 쓰고 있다면, pgvector를 설치하면 기존 테이블에 벡터 컬럼을 추가할 수 있다.
> SQL로 벡터 검색과 일반 쿼리를 함께 쓸 수 있다는 점이 최대 강점이다.

### IV-1-1. pgvector란 — PostgreSQL에 벡터 검색 추가

- 난이도: ★☆☆
- 선수 지식: SQL 기초, Part I
- 학습 목표: pgvector의 설치와 기본 사용법을 이해한다
- 설명: 기존 집에 방 하나를 증축하는 비유. `CREATE EXTENSION vector;` 한 줄이면 PostgreSQL이 벡터 DB로 변신한다. 새 DB를 도입할 필요 없이 기존 인프라를 활용.
- 핵심 키워드: `CREATE EXTENSION vector`, `vector(1536)`, `INSERT`, `SELECT`, `ORDER BY`
- 시각화: [IV-1-1 시각화 보기](part4/IV-1-1.html) — pgvector 설치와 기본 사용 (5단계)
- 다음 섹션: [IV-1-2. pgvector 데이터 모델](#iv-1-2-pgvector-데이터-모델--vector-타입과-연산자)

### IV-1-2. pgvector 데이터 모델 — vector 타입과 연산자

- 난이도: ★★☆
- 선수 지식: IV-1-1
- 학습 목표: pgvector의 데이터 타입과 거리 연산자를 정확히 사용할 수 있다
- 설명: 거리 측정 도구에 비유한다. `<->` = L2 거리(직선 거리), `<=>` = 코사인 거리(방향 차이), `<#>` = 내적(크기 × 방향). 각 연산자가 언제 유용한지 시각적으로 비교한다.
- 핵심 키워드: `vector(N)`, `<->`, `<=>`, `<#>`, `L2`, `Cosine`, `Inner Product`
- 시각화: [IV-1-2 시각화 보기](part4/IV-1-2.html) — 벡터 연산자 비교 (5단계)
- 다음 섹션: [IV-2-1. pgvector 인덱싱](#iv-2-1-pgvector-인덱싱--ivfflat-vs-hnsw)

### IV-2-1. pgvector 인덱싱 — IVFFlat vs HNSW

- 난이도: ★★☆
- 선수 지식: IV-1-2
- 학습 목표: pgvector의 두 가지 인덱스 전략을 이해하고 적절히 선택할 수 있다
- 설명: 도서관의 두 가지 분류 체계. IVFFlat = 층별 분류(몇 개 층을 검색할지 lists/probes로 조절), HNSW = 추천 네트워크(친구의 친구를 따라가며 탐색, ef_construction/m 파라미터). CREATE INDEX 구문과 성능 차이를 시각화.
- 핵심 키워드: `ivfflat`, `hnsw`, `lists`, `probes`, `m`, `ef_construction`, `CREATE INDEX`
- 시각화: [IV-2-1 시각화 보기](part4/IV-2-1.html) — IVFFlat vs HNSW 인덱스 비교 (6단계)
- 다음 섹션: [IV-2-2. pgvector 실전](#iv-2-2-pgvector-실전--sql로-벡터-검색--메타데이터-필터)

### IV-2-2. pgvector 실전 — SQL로 벡터 검색 + 메타데이터 필터

- 난이도: ★★★
- 선수 지식: IV-2-1
- 학습 목표: SQL 하나로 벡터 유사도 검색과 메타데이터 필터를 결합할 수 있다
- 설명: pgvector의 최대 강점 — `SELECT ... WHERE category = 'tech' ORDER BY embedding <=> query_vec LIMIT 10`. 일반 SQL 조건과 벡터 검색을 한 쿼리에 섞는 하이브리드 검색 시나리오를 시각화한다.
- 핵심 키워드: `WHERE + ORDER BY <=>`, `hybrid query`, `JOIN`, `CTE`, `pg_trgm`
- 시각화: [IV-2-2 시각화 보기](part4/IV-2-2.html) — 하이브리드 SQL 검색 (5단계)
- 다음 섹션: [IV-2-3. pgvector 운영](#iv-2-3-pgvector-운영--성능-튜닝과-스케일링)

### IV-2-3. pgvector 운영 — 성능 튜닝과 스케일링

- 난이도: ★★★
- 선수 지식: IV-2-2
- 학습 목표: pgvector를 프로덕션 환경에서 안정적으로 운영하는 방법을 안다
- 설명: 자동차 엔진 튜닝에 비유한다. lists/probes 최적화, ef_construction/m 튜닝, VACUUM, 파티셔닝, 커넥션 풀링. 100만 → 1000만 벡터 스케일업 시 고려사항.
- 핵심 키워드: `VACUUM`, `maintenance_work_mem`, `partitioning`, `connection pool`, `pgbouncer`
- 시각화: [IV-2-3 시각화 보기](part4/IV-2-3.html) — 성능 튜닝 체크리스트 (6단계)
- 다음 섹션: [V-1-1. FAISS vs Chroma vs pgvector](#v-1-1-faiss-vs-chroma-vs-pgvector--기능-비교-매트릭스)

---

## Part V. 비교와 선택 가이드 — "내 프로젝트에 맞는 선택"

> 3가지 벡터 DB 중 어떤 것을 선택해야 하는가? 정답은 "상황에 따라 다르다".
> Part V는 의사결정 기준을 제시한다.

### V-1-1. FAISS vs Chroma vs pgvector — 기능 비교 매트릭스

- 난이도: ★★☆
- 선수 지식: Part II, III, IV 중 최소 2개
- 학습 목표: 3개 벡터 DB의 장단점을 한눈에 비교할 수 있다
- 설명: 속도, 메모리, 기능 풍부함, 운영 편의성, 생태계를 레이더 차트 + 비교 테이블로 시각화한다.
- 핵심 키워드: `비교`, `트레이드오프`, `레이더 차트`, `선택 기준`
- 시각화: [V-1-1 시각화 보기](part5/V-1-1.html) — 3종 비교 매트릭스 (6단계)
- 다음 섹션: [V-1-2. 의사결정 플로우차트](#v-1-2-의사결정-플로우차트--상황별-선택-가이드)

### V-1-2. 의사결정 플로우차트 — 상황별 선택 가이드

- 난이도: ★★☆
- 선수 지식: V-1-1
- 학습 목표: 자신의 프로젝트에 적합한 벡터 DB를 논리적으로 선택할 수 있다
- 설명: "이미 PostgreSQL 쓰는가?" → "데이터 10만 건 이상?" → "프로토타입인가?" 등 예/아니오 분기로 최적의 선택지에 도달하는 플로우차트.
- 핵심 키워드: `의사결정`, `플로우차트`, `프로토타입`, `프로덕션`, `마이그레이션`
- 시각화: [V-1-2 시각화 보기](part5/V-1-2.html) — 선택 플로우차트 (5단계)
- 다음 섹션: [V-2-1. 벡터 DB 조합 패턴](#v-2-1-벡터-db-조합-패턴--하이브리드-아키텍처)

### V-2-1. 벡터 DB 조합 패턴 — 하이브리드 아키텍처

- 난이도: ★★★
- 선수 지식: V-1-2
- 학습 목표: 벡터 DB를 다른 시스템과 조합하는 패턴을 안다
- 설명: 하나의 벡터 DB만 쓰는 것이 아니라, FAISS(실시간 검색) + PostgreSQL(메타데이터 저장), Chroma(개발) → pgvector(프로덕션) 마이그레이션 등 조합 패턴을 시각화한다.
- 핵심 키워드: `하이브리드`, `마이그레이션`, `캐시 레이어`, `읽기/쓰기 분리`
- 시각화: [V-2-1 시각화 보기](part5/V-2-1.html) — 하이브리드 아키텍처 패턴 (6단계)
- 다음 섹션: [V-2-2. 프로덕션 벡터 DB 운영](#v-2-2-프로덕션-벡터-db-운영--모니터링-백업-스케일링)

### V-2-2. 프로덕션 벡터 DB 운영 — 모니터링, 백업, 스케일링

- 난이도: ★★★
- 선수 지식: V-2-1
- 학습 목표: 벡터 DB를 프로덕션에서 안정적으로 운영하는 체크리스트를 갖춘다
- 설명: 자동차 정기 점검에 비유한다. 모니터링(검색 레이턴시, 인덱스 크기), 백업(스냅샷, WAL), 스케일링(수평 분산, 샤딩), 보안(접근 제어, 암호화)을 운영 체크리스트로 정리한다.
- 핵심 키워드: `모니터링`, `백업`, `스케일링`, `샤딩`, `보안`, `운영 체크리스트`
- 시각화: [V-2-2 시각화 보기](part5/V-2-2.html) — 프로덕션 운영 체크리스트 (5단계)
