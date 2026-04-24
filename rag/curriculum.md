# RAG 파이프라인 인터랙티브 학습 커리큘럼

## 읽기 가이드

### 난이도 범례
- ★☆☆ : LLM API 사용 경험만 있으면 이해 가능
- ★★☆ : 벡터 검색, 프롬프트 엔지니어링 기본 경험 권장
- ★★★ : RAG 파이프라인 구축 경험이 있으면 더 깊이 이해

### 독자별 추천 경로
- **RAG가 처음**: Part I → Part II → Part III → Part IV → Part V → Part VI → Part VII (순서대로)
- **개념은 아는데 고도화가 궁금**: Part I(훑기) → Part IV → Part VI
- **평가/운영이 급하다**: Part I(훑기) → Part VII → Part V
- **LangChain 프로젝트를 먼저 봤다**: Part I(I-2-1, I-2-2만) → Part IV → Part VI (겹치는 기초는 생략)

---

## 전체 목차

```
Part I.  RAG 기초 ────────────────── "왜 RAG인가"               (5개)
  └ Chapter I-1. RAG의 필요성
      ├ I-1-1. LLM의 한계 — 할루시네이션과 지식 컷오프
      ├ I-1-2. RAG란 무엇인가 — 검색 + 생성
      └ I-1-3. RAG 파이프라인 전체 흐름
  └ Chapter I-2. RAG의 발전
      ├ I-2-1. Naive RAG vs Advanced RAG vs Modular RAG
      └ I-2-2. RAG vs Fine-tuning — 언제 무엇을 선택하나

Part II. 데이터 준비 — Ingestion ───── "좋은 입력이 좋은 출력"     (5개)
  └ Chapter II-1. 문서 로딩과 전처리
      ├ II-1-1. Document Loading — 다양한 소스 통합
      ├ II-1-2. 전처리 파이프라인 — 노이즈 제거와 정규화
      └ II-1-3. 메타데이터 보존과 활용
  └ Chapter II-2. 청킹 전략
      ├ II-2-1. Chunking 전략 비교 — Fixed, Recursive, Semantic
      └ II-2-2. Chunk Size와 Overlap의 영향

Part III. Embedding & Vector Store ── "의미를 숫자로 바꾸다"      (5개)
  └ Chapter III-1. Embedding
      ├ III-1-1. Embedding이란 — 텍스트를 벡터 공간으로
      ├ III-1-2. Embedding 모델 비교와 선택 기준
      └ III-1-3. 유사도 측정 — Cosine, Euclidean, Dot Product
  └ Chapter III-2. Vector Store
      ├ III-2-1. Vector Store 동작 원리 — ANN 검색
      └ III-2-2. 인덱싱 전략 — IVF, HNSW, PQ

Part IV. Retrieval 고도화 ──────────── "정확한 검색이 핵심이다"   (7개)
  └ Chapter IV-1. 검색 기법
      ├ IV-1-1. Dense Retrieval — 임베딩 기반 검색
      ├ IV-1-2. Sparse Retrieval — BM25와 키워드 검색
      └ IV-1-3. Hybrid Search — Dense + Sparse 결합
  └ Chapter IV-2. 검색 품질 향상
      ├ IV-2-1. Re-ranking — Cross-Encoder로 재정렬
      ├ IV-2-2. Query Transformation — HyDE, Multi-Query, Step-Back
      ├ IV-2-3. Contextual Compression — 불필요한 정보 제거
      └ IV-2-4. Parent Document Retriever — 계층적 검색

Part V.  Generation & 프롬프트 ─────── "검색 결과를 답변으로"     (5개)
  └ Chapter V-1. 생성 전략
      ├ V-1-1. Context Stuffing 전략 — 컨텍스트 배치와 구성
      ├ V-1-2. 프롬프트 엔지니어링 for RAG — 시스템 프롬프트 설계
      └ V-1-3. Citation & Source Attribution — 출처 표시
  └ Chapter V-2. 사용자 경험
      ├ V-2-1. Multi-turn RAG — 대화 히스토리 통합
      └ V-2-2. Streaming & 사용자 경험 최적화

Part VI. Advanced RAG 패턴 ─────────── "상황에 맞는 고급 전략"   (5개)
  └ Chapter VI-1. 자기 교정 패턴
      ├ VI-1-1. Self-RAG — 자기 성찰과 품질 판단
      └ VI-1-2. CRAG — Corrective RAG
  └ Chapter VI-2. 확장 패턴
      ├ VI-2-1. Agentic RAG — 도구 활용 RAG
      ├ VI-2-2. Adaptive RAG — 쿼리 라우팅
      └ VI-2-3. Graph RAG — 지식 그래프 결합

Part VII. 평가 & 운영 ──────────────── "측정할 수 없으면 개선 불가" (3개)
  └ Chapter VII-1. 평가
      ├ VII-1-1. RAG 평가 프레임워크 — RAGAS와 핵심 지표
      └ VII-1-2. 평가 지표 심화 — Faithfulness, Relevancy, Context
  └ Chapter VII-2. 운영
      └ VII-2-1. 프로덕션 RAG — 디버깅, 모니터링, 배포 패턴
```

---

## 상세 목차

---

# Part I. RAG 기초

> LLM은 놀라울 정도로 똑똑하지만, 치명적인 약점이 있다. 모르는 걸 자신 있게 지어내고(할루시네이션), 학습 이후의 정보를 모른다(지식 컷오프). RAG는 이 문제를 "외부 문서를 검색해서 LLM에 전달"하는 방식으로 해결한다.

## Chapter I-1. RAG의 필요성

### I-1-1. LLM의 한계 — 할루시네이션과 지식 컷오프

- **난이도**: ★☆☆
- **선수 지식**: 없음
- **학습 목표**: LLM이 왜 잘못된 답변을 하는지, 3가지 한계를 구분해서 설명할 수 있다
- **설명**: 시험을 보는 학생이 (1) 모르는 문제에 자신 있게 틀린 답을 쓰고(할루시네이션), (2) 시험 범위 밖의 최신 뉴스를 물으면 답하지 못하고(지식 컷오프), (3) 사내 기밀 문서는 처음부터 본 적이 없다(비공개 데이터).
- **핵심 키워드**: 할루시네이션(Hallucination), 지식 컷오프(Knowledge Cutoff), 비공개 데이터, Grounding
- **시각화 연결**: [I-1-1 시각화 보기](part1/I-1-1.html) — LLM 한계 3가지 시나리오 (5단계)
- **다음 섹션**: I-1-2

### I-1-2. RAG란 무엇인가 — 검색 + 생성

- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: RAG의 핵심 아이디어(검색으로 LLM을 보강)를 비유와 함께 설명할 수 있다
- **설명**: 클로즈드 북 시험(LLM 단독)을 오픈북 시험(RAG)으로 바꾸는 것이다. 문제를 읽고 → 교과서에서 관련 내용을 찾고(Retrieval) → 찾은 내용을 기반으로 답안을 작성한다(Augmented Generation).
- **핵심 키워드**: RAG, Retrieval, Augmented, Generation, 오픈북 시험
- **시각화 연결**: [I-1-2 시각화 보기](part1/I-1-2.html) — 클로즈드 북 vs 오픈북 비교 (5단계)
- **다음 섹션**: I-1-3

### I-1-3. RAG 파이프라인 전체 흐름

- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: Indexing → Retrieval → Generation 3단계 파이프라인을 그리고 각 단계의 역할을 설명할 수 있다
- **설명**: 도서관 시스템과 같다. (1) Indexing: 책을 분류하고 카탈로그를 만드는 과정. (2) Retrieval: 사서에게 질문하면 관련 책을 찾아주는 과정. (3) Generation: 찾은 책을 참고해서 보고서를 작성하는 과정.
- **핵심 키워드**: Indexing, Retrieval, Generation, 파이프라인, 3단계
- **시각화 연결**: [I-1-3 시각화 보기](part1/I-1-3.html) — RAG 3단계 파이프라인 흐름 (9단계)
- **다음 섹션**: I-2-1

---

## Chapter I-2. RAG의 발전

### I-2-1. Naive RAG vs Advanced RAG vs Modular RAG

- **난이도**: ★★☆
- **선수 지식**: I-1-3
- **학습 목표**: 3세대 RAG의 특징과 차이점을 비교 설명할 수 있다
- **설명**: 요리의 진화와 같다. Naive RAG는 레시피 그대로 따라하기. Advanced RAG는 프로 셰프의 요리(Pre/Post-retrieval 추가). Modular RAG는 분자요리(모듈 자유 조합).
- **핵심 키워드**: Naive RAG, Advanced RAG, Modular RAG, Pre-retrieval, Post-retrieval
- **시각화 연결**: [I-2-1 시각화 보기](part1/I-2-1.html) — 3세대 RAG 비교 (6단계)
- **다음 섹션**: I-2-2

### I-2-2. RAG vs Fine-tuning — 언제 무엇을 선택하나

- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: RAG와 Fine-tuning의 장단점을 비교하고, 상황에 맞는 선택 기준을 제시할 수 있다
- **설명**: Fine-tuning은 직원을 연수원에 보내서 새로운 지식을 머릿속에 넣는 것. RAG는 직원에게 매뉴얼 책장을 주는 것. 판단 기준: 데이터 변경 빈도, 비용, 정확성 요구 수준.
- **핵심 키워드**: Fine-tuning, RAG, 비용, 업데이트 주기, 판단 기준, 하이브리드
- **시각화 연결**: [I-2-2 시각화 보기](part1/I-2-2.html) — RAG vs Fine-tuning 의사결정 (6단계)
- **다음 섹션**: II-1-1

---

# Part II. 데이터 준비 — Ingestion

> "Garbage in, garbage out"은 RAG에서 더욱 절실하다. 아무리 좋은 검색 알고리즘을 써도, 원본 데이터가 지저분하면 결과도 지저분하다.

## Chapter II-1. 문서 로딩과 전처리

### II-1-1. Document Loading — 다양한 소스 통합

- **난이도**: ★☆☆
- **선수 지식**: I-1-3
- **학습 목표**: PDF, 웹, DB 등 다양한 소스를 통합 처리하는 패턴과 Document 객체의 구조를 설명할 수 있다
- **설명**: 우체국 집배원이 편지(PDF), 소포(웹 페이지), 등기(DB 레코드) 등 다양한 형태의 우편물을 수거해서, 표준 양식(page_content + metadata)으로 정리하는 것.
- **핵심 키워드**: Document, page_content, metadata, PDF Parser, 소스 통합
- **시각화 연결**: [II-1-1 시각화 보기](part2/II-1-1.html) — 다양한 소스 → Document 통합 (5단계)
- **다음 섹션**: II-1-2

### II-1-2. 전처리 파이프라인 — 노이즈 제거와 정규화

- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: 문서 전처리의 필요성과 주요 기법(노이즈 제거, 정규화, 필터링)을 설명할 수 있다
- **설명**: 음식 재료 손질과 같다. 야채를 씻고(노이즈 제거), 껍질을 벗기고(정규화), 상한 부분을 잘라낸다(필터링).
- **핵심 키워드**: 노이즈 제거, 정규화, 중복 제거, 인코딩, 전처리
- **시각화 연결**: [II-1-2 시각화 보기](part2/II-1-2.html) — 전처리 Before/After (5단계)
- **다음 섹션**: II-1-3

### II-1-3. 메타데이터 보존과 활용

- **난이도**: ★★☆
- **선수 지식**: II-1-2
- **학습 목표**: 메타데이터가 검색 품질에 미치는 영향을 설명하고 활용 전략을 제시할 수 있다
- **설명**: 도서관의 카탈로그 카드와 같다. 책 내용만 있으면 검색은 되지만, 저자, 출판일, 분류가 있으면 필터링이 가능하다.
- **핵심 키워드**: metadata, 필터링, 출처 추적, 날짜 기반 검색
- **시각화 연결**: [II-1-3 시각화 보기](part2/II-1-3.html) — 메타데이터 필터링 시뮬레이션 (5단계)
- **다음 섹션**: II-2-1

---

## Chapter II-2. 청킹 전략

### II-2-1. Chunking 전략 비교 — Fixed, Recursive, Semantic

- **난이도**: ★★☆
- **선수 지식**: II-1-3
- **학습 목표**: 3가지 청킹 전략의 동작 방식, 장단점을 비교하고 상황에 맞게 선택할 수 있다
- **설명**: 피자를 자르는 방법. Fixed-size: 자로 재서 같은 크기로. Recursive: 먼저 큰 경계(문단)로, 큰 조각은 다시 작은 경계(문장)로. Semantic: 의미가 바뀌는 지점을 감지해서 자연스럽게.
- **핵심 키워드**: Fixed-size, Recursive, Semantic Chunking, 구분자, 의미 보존
- **시각화 연결**: [II-2-1 시각화 보기](part2/II-2-1.html) — 3가지 청킹 전략 비교 (6단계)
- **다음 섹션**: II-2-2

### II-2-2. Chunk Size와 Overlap의 영향

- **난이도**: ★★☆
- **선수 지식**: II-2-1
- **학습 목표**: chunk_size와 chunk_overlap이 검색 품질에 미치는 영향을 설명하고 적절한 값을 선택할 수 있다
- **설명**: 퍼즐 조각 크기. 너무 크면 검색 부정확, 너무 작으면 문맥 상실. Overlap은 경계에서 정보 손실 방지. 실무 권장: chunk_size=500~1000, overlap=10~20%.
- **핵심 키워드**: chunk_size, chunk_overlap, 검색 정밀도, 문맥 보존, 트레이드오프
- **시각화 연결**: [II-2-2 시각화 보기](part2/II-2-2.html) — Chunk Size/Overlap 시뮬레이션 (5단계)
- **다음 섹션**: III-1-1

---

# Part III. Embedding & Vector Store

> 텍스트를 컴퓨터가 비교할 수 있는 형태(벡터)로 바꾸고, 효율적으로 저장하고 검색하는 것이 RAG의 핵심 인프라다.

## Chapter III-1. Embedding

### III-1-1. Embedding이란 — 텍스트를 벡터 공간으로

- **난이도**: ★★☆
- **선수 지식**: II-2-2
- **학습 목표**: 텍스트가 벡터로 변환되는 원리와, 의미적 유사성이 벡터 거리로 표현되는 개념을 설명할 수 있다
- **설명**: 지도의 좌표 시스템과 같다. "서울"과 "부산"은 한국 영역 안에서 가까운 좌표에 찍히고, "서울"과 "뉴욕"은 먼 좌표에 찍힌다.
- **핵심 키워드**: Embedding, 벡터, 벡터 공간, 차원, 의미적 유사성
- **시각화 연결**: [III-1-1 시각화 보기](part3/III-1-1.html) — 텍스트 → 벡터 공간 (5단계)
- **다음 섹션**: III-1-2

### III-1-2. Embedding 모델 비교와 선택 기준

- **난이도**: ★★☆
- **선수 지식**: III-1-1
- **학습 목표**: 주요 임베딩 모델(OpenAI, Cohere, 오픈소스)의 특성을 비교하고 프로젝트에 맞는 모델을 선택할 수 있다
- **설명**: 카메라 렌즈 선택과 같다. 비싼 렌즈(OpenAI)는 화질이 좋지만 비싸다. 중간 렌즈(Cohere)는 다국어에 강하다. 오픈소스 렌즈(BGE, E5)는 무료이고 직접 호스팅 가능.
- **핵심 키워드**: text-embedding-3, embed-v3, BGE, MTEB, 차원 축소, 비용
- **시각화 연결**: [III-1-2 시각화 보기](part3/III-1-2.html) — Embedding 모델 비교 (5단계)
- **다음 섹션**: III-1-3

### III-1-3. 유사도 측정 — Cosine, Euclidean, Dot Product

- **난이도**: ★★☆
- **선수 지식**: III-1-1
- **학습 목표**: 3가지 유사도 측정 방법의 차이를 이해하고 상황에 맞는 방법을 선택할 수 있다
- **설명**: Cosine: 두 사람이 바라보는 방향이 같은가? Euclidean: 물리적으로 얼마나 가까운가? Dot Product: 방향 + 크기를 동시에 고려.
- **핵심 키워드**: Cosine Similarity, Euclidean Distance, Dot Product, 정규화
- **시각화 연결**: [III-1-3 시각화 보기](part3/III-1-3.html) — 유사도 측정 인터랙티브 (5단계)
- **다음 섹션**: III-2-1

---

## Chapter III-2. Vector Store

### III-2-1. Vector Store 동작 원리 — ANN 검색

- **난이도**: ★★☆
- **선수 지식**: III-1-3
- **학습 목표**: 벡터 저장소가 왜 "정확한 검색(KNN)" 대신 "근사 검색(ANN)"을 사용하는지 설명할 수 있다
- **설명**: KNN은 모든 책을 하나씩 들어보는 것(100% 정확, 느림). ANN은 먼저 코너로 범위를 좁히고 그 안에서만 찾는 것(99.9% 정확, 1000배 빠름).
- **핵심 키워드**: KNN, ANN, 근사 검색, 정확도-속도 트레이드오프
- **시각화 연결**: [III-2-1 시각화 보기](part3/III-2-1.html) — KNN vs ANN 비교 (5단계)
- **다음 섹션**: III-2-2

### III-2-2. 인덱싱 전략 — IVF, HNSW, PQ

- **난이도**: ★★★
- **선수 지식**: III-2-1
- **학습 목표**: IVF, HNSW, PQ 인덱싱 전략의 핵심 원리를 비유와 함께 설명할 수 있다
- **설명**: IVF: 도시를 구역별로 나누고 해당 구역만 탐색. HNSW: 층별 네비게이션으로 내려가며 정밀 탐색. PQ: 요약본으로 먼저 비교하고 후보만 원본 확인.
- **핵심 키워드**: IVF, HNSW, PQ, 인덱싱, 메모리, Recall
- **시각화 연결**: [III-2-2 시각화 보기](part3/III-2-2.html) — IVF/HNSW/PQ 인덱싱 (6단계)
- **다음 섹션**: IV-1-1

---

# Part IV. Retrieval 고도화

> RAG의 성능은 80% 검색 품질에 달려 있다. 아무리 좋은 LLM을 써도, 검색이 엉뚱한 문서를 가져오면 답변도 엉뚱해진다.

## Chapter IV-1. 검색 기법

### IV-1-1. Dense Retrieval — 임베딩 기반 검색

- **난이도**: ★★☆
- **선수 지식**: III-2-1
- **학습 목표**: Dense Retrieval의 동작 원리와 장단점을 설명할 수 있다
- **설명**: 의미로 책을 찾는 사서. "점심 추천"이라고 하면 "맛집", "런치 메뉴" 등 의미가 비슷한 문서를 찾아준다.
- **핵심 키워드**: Dense Retrieval, 의미 검색, 임베딩, semantic search
- **시각화 연결**: [IV-1-1 시각화 보기](part4/IV-1-1.html) — Dense Retrieval 시뮬레이션 (5단계)
- **다음 섹션**: IV-1-2

### IV-1-2. Sparse Retrieval — BM25와 키워드 검색

- **난이도**: ★★☆
- **선수 지식**: IV-1-1
- **학습 목표**: BM25의 동작 원리와 Dense Retrieval 대비 장단점을 설명할 수 있다
- **설명**: 색인으로 책을 찾는 방법. 단어 빈도(TF)와 희소성(IDF)을 곱해서 중요도를 계산한다.
- **핵심 키워드**: BM25, TF-IDF, Sparse, 키워드 검색, 역색인
- **시각화 연결**: [IV-1-2 시각화 보기](part4/IV-1-2.html) — BM25 스코어링 (5단계)
- **다음 섹션**: IV-1-3

### IV-1-3. Hybrid Search — Dense + Sparse 결합

- **난이도**: ★★★
- **선수 지식**: IV-1-1, IV-1-2
- **학습 목표**: Dense와 Sparse 검색을 결합하는 이유와 방법(RRF)을 설명할 수 있다
- **설명**: 두 명의 사서를 동시에 고용. 의미 사서(Dense) + 키워드 사서(Sparse)의 추천을 합쳐서 최종 리스트를 만든다.
- **핵심 키워드**: Hybrid Search, RRF, Dense+Sparse, 앙상블
- **시각화 연결**: [IV-1-3 시각화 보기](part4/IV-1-3.html) — Hybrid Search 결합 (6단계)
- **다음 섹션**: IV-2-1

---

## Chapter IV-2. 검색 품질 향상

### IV-2-1. Re-ranking — Cross-Encoder로 재정렬

- **난이도**: ★★★
- **선수 지식**: IV-1-3
- **학습 목표**: Bi-Encoder와 Cross-Encoder의 차이, Re-ranking이 검색 품질을 높이는 원리를 이해할 수 있다
- **설명**: 서류 심사의 2단계. 1차(Bi-Encoder): 이력서와 채용 공고를 각각 읽고 빠르게 후보 100명. 2차(Cross-Encoder): 함께 읽으며 정밀하게 10명 선별.
- **핵심 키워드**: Re-ranking, Bi-Encoder, Cross-Encoder, 2단계 검색
- **시각화 연결**: [IV-2-1 시각화 보기](part4/IV-2-1.html) — Re-ranking 순위 변동 (6단계)
- **다음 섹션**: IV-2-2

### IV-2-2. Query Transformation — HyDE, Multi-Query, Step-Back

- **난이도**: ★★★
- **선수 지식**: IV-2-1
- **학습 목표**: 3가지 쿼리 변환 기법의 원리와 적용 상황을 비교할 수 있다
- **설명**: HyDE: 가상 문서를 먼저 만들고 비슷한 실제 문서를 검색. Multi-Query: 하나의 질문을 여러 각도로 변환. Step-Back: 구체적 질문을 추상화.
- **핵심 키워드**: HyDE, Multi-Query, Step-Back, Query Expansion
- **시각화 연결**: [IV-2-2 시각화 보기](part4/IV-2-2.html) — 쿼리 변환 3가지 (6단계)
- **다음 섹션**: IV-2-3

### IV-2-3. Contextual Compression — 불필요한 정보 제거

- **난이도**: ★★★
- **선수 지식**: IV-2-1
- **학습 목표**: Contextual Compression의 원리를 설명할 수 있다
- **설명**: 형광펜 밑줄 치기. 교과서 전체보다, 시험 문제와 관련된 문장에만 형광펜을 칠해서 주는 것이 더 정확하다.
- **핵심 키워드**: Contextual Compression, 문서 압축, 노이즈 제거
- **시각화 연결**: [IV-2-3 시각화 보기](part4/IV-2-3.html) — Compression Before/After (5단계)
- **다음 섹션**: IV-2-4

### IV-2-4. Parent Document Retriever — 계층적 검색

- **난이도**: ★★★
- **선수 지식**: IV-2-3
- **학습 목표**: 작은 청크로 검색하고 큰 청크를 반환하는 전략의 원리와 장점을 설명할 수 있다
- **설명**: 책의 목차와 본문. 작은 청크(소제목)로 정밀 검색하고, 해당 소제목이 속한 전체 절(부모 문서)을 전달.
- **핵심 키워드**: Parent Document, Child Chunk, 계층적 검색, 정밀도+문맥
- **시각화 연결**: [IV-2-4 시각화 보기](part4/IV-2-4.html) — Parent Document 구조 (5단계)
- **다음 섹션**: V-1-1

---

# Part V. Generation & 프롬프트

> 좋은 검색 결과를 가져왔다면, 이제 LLM이 정확하고 유용한 답변을 생성하도록 해야 한다.

## Chapter V-1. 생성 전략

### V-1-1. Context Stuffing 전략 — 컨텍스트 배치와 구성

- **난이도**: ★★☆
- **선수 지식**: IV-2-4
- **학습 목표**: "Lost in the Middle" 문제와 컨텍스트 배치 전략을 설명할 수 있다
- **설명**: LLM은 프롬프트의 시작과 끝에 더 주목하고, 중간 정보를 놓치는 경향(Lost in the Middle). 가장 관련성 높은 문서를 맨 앞이나 맨 뒤에 배치.
- **핵심 키워드**: Context Stuffing, Lost in the Middle, top-k, 문서 순서
- **시각화 연결**: [V-1-1 시각화 보기](part5/V-1-1.html) — Context Stuffing 시뮬레이션 (5단계)
- **다음 섹션**: V-1-2

### V-1-2. 프롬프트 엔지니어링 for RAG

- **난이도**: ★★☆
- **선수 지식**: V-1-1
- **학습 목표**: RAG 전용 시스템 프롬프트의 핵심 요소를 설계할 수 있다
- **설명**: 오픈북 시험의 답안 작성 규칙. (1) 참고 자료에 근거해서만 답하세요. (2) 없으면 "정보가 없습니다". (3) 출처를 표시하세요.
- **핵심 키워드**: System Prompt, 할루시네이션 방지, 컨텍스트 바운딩
- **시각화 연결**: [V-1-2 시각화 보기](part5/V-1-2.html) — RAG 프롬프트 설계 (5단계)
- **다음 섹션**: V-1-3

### V-1-3. Citation & Source Attribution — 출처 표시

- **난이도**: ★★☆
- **선수 지식**: V-1-2
- **학습 목표**: 3가지 인용 패턴(인라인, 각주, 사이드바)과 구현 전략을 설명할 수 있다
- **설명**: 학술 논문의 참고 문헌 표기법과 같다. 답변의 각 주장이 어떤 문서에서 왔는지 추적할 수 있어야 신뢰도가 높아진다.
- **핵심 키워드**: Citation, Source Attribution, 출처 추적, 신뢰도
- **시각화 연결**: [V-1-3 시각화 보기](part5/V-1-3.html) — Citation 패턴 비교 (5단계)
- **다음 섹션**: V-2-1

---

## Chapter V-2. 사용자 경험

### V-2-1. Multi-turn RAG — 대화 히스토리 통합

- **난이도**: ★★★
- **선수 지식**: V-1-3
- **학습 목표**: History-aware Retriever의 동작 원리를 설명할 수 있다
- **설명**: 단골 손님과의 대화. "휴가 정책 알려줘" → "그럼 신청 방법은?" — "그럼"이 가리키는 것은 "휴가". 대화 히스토리를 참고해 독립형 질문으로 재작성.
- **핵심 키워드**: Multi-turn, 질문 재작성, History-aware Retriever
- **시각화 연결**: [V-2-1 시각화 보기](part5/V-2-1.html) — Multi-turn RAG 흐름 (6단계)
- **다음 섹션**: V-2-2

### V-2-2. Streaming & 사용자 경험 최적화

- **난이도**: ★★☆
- **선수 지식**: V-2-1
- **학습 목표**: RAG 응답의 지연 시간을 줄이는 방법을 설명할 수 있다
- **설명**: 레스토랑 서빙. 일반: 전체 코스가 다 준비될 때까지 대기. Streaming: 나오는 대로 바로 서빙.
- **핵심 키워드**: Streaming, TTFT, 비동기, 프로그레시브 UI
- **시각화 연결**: [V-2-2 시각화 보기](part5/V-2-2.html) — Streaming 타임라인 비교 (5단계)
- **다음 섹션**: VI-1-1

---

# Part VI. Advanced RAG 패턴

> Naive RAG로 충분하지 않을 때, 상황에 맞는 고급 패턴을 적용한다.

## Chapter VI-1. 자기 교정 패턴

### VI-1-1. Self-RAG — 자기 성찰과 품질 판단

- **난이도**: ★★★
- **선수 지식**: V-2-1
- **학습 목표**: Self-RAG의 3단계 자기 성찰 과정을 설명할 수 있다
- **설명**: 시험 중 자기 검토하는 모범생. (1) 교과서를 봐야 할까? (2) 이 페이지가 관련 있나? (3) 내 답이 충실한가?
- **핵심 키워드**: Self-RAG, Retrieve 판단, Relevance 평가, Support 검증
- **시각화 연결**: [VI-1-1 시각화 보기](part6/VI-1-1.html) — Self-RAG 의사결정 흐름 (6단계)
- **다음 섹션**: VI-1-2

### VI-1-2. CRAG — Corrective RAG

- **난이도**: ★★★
- **선수 지식**: VI-1-1
- **학습 목표**: CRAG가 검색 결과를 평가하고 보완하는 과정을 설명할 수 있다
- **설명**: 의사의 진단. 1차 검사 → 결과 평가: 정확/모호/부정확 → 부정확이면 2차 검사(웹 검색)로 전환.
- **핵심 키워드**: CRAG, Corrective, 품질 평가, 웹 검색 폴백
- **시각화 연결**: [VI-1-2 시각화 보기](part6/VI-1-2.html) — CRAG 교정 흐름 (6단계)
- **다음 섹션**: VI-2-1

---

## Chapter VI-2. 확장 패턴

### VI-2-1. Agentic RAG — 도구 활용 RAG

- **난이도**: ★★★
- **선수 지식**: VI-1-2
- **학습 목표**: RAG에 Agent 패턴을 결합하는 구조를 설명할 수 있다
- **설명**: 탐정 사무소. 기본 RAG는 한 서랍만 뒤지지만, Agentic RAG는 서랍(Vector DB), 전화(API), 인터넷(웹), 계산기(코드)를 자유롭게 사용.
- **핵심 키워드**: Agentic RAG, Tool Use, ReAct, 동적 검색
- **시각화 연결**: [VI-2-1 시각화 보기](part6/VI-2-1.html) — Agentic RAG 실행 흐름 (6단계)
- **다음 섹션**: VI-2-2

### VI-2-2. Adaptive RAG — 쿼리 라우팅

- **난이도**: ★★★
- **선수 지식**: VI-2-1
- **학습 목표**: 쿼리 유형에 따라 다른 RAG 전략을 적용하는 원리를 설명할 수 있다
- **설명**: 병원 응급실 트리아지. 가벼운 질문: LLM 직접. 사실 확인: 기본 RAG. 복잡한 분석: 고급 RAG.
- **핵심 키워드**: Adaptive RAG, 라우팅, 쿼리 분류, 파이프라인 선택
- **시각화 연결**: [VI-2-2 시각화 보기](part6/VI-2-2.html) — Adaptive RAG 라우팅 (5단계)
- **다음 섹션**: VI-2-3

### VI-2-3. Graph RAG — 지식 그래프 결합

- **난이도**: ★★★
- **선수 지식**: VI-2-2
- **학습 목표**: 벡터 검색의 한계와 Graph RAG가 이를 보완하는 원리를 설명할 수 있다
- **설명**: 인물 관계도. 벡터 검색은 "비슷한 사람"을 찾지만, "이 사람의 상사는?" 같은 관계 추적에는 약하다. Graph RAG는 지식 그래프로 관계를 따라간다.
- **핵심 키워드**: Graph RAG, Knowledge Graph, Entity, Relationship
- **시각화 연결**: [VI-2-3 시각화 보기](part6/VI-2-3.html) — Graph RAG 네트워크 탐색 (6단계)
- **다음 섹션**: VII-1-1

---

# Part VII. 평가 & 운영

> RAG 시스템을 만든 것으로 끝이 아니다. "이 시스템이 정말 잘 동작하는가?"를 측정하고, 프로덕션에서 안정적으로 운영해야 한다.

## Chapter VII-1. 평가

### VII-1-1. RAG 평가 프레임워크 — RAGAS와 핵심 지표

- **난이도**: ★★★
- **선수 지식**: V-2-2
- **학습 목표**: RAG 평가의 3대 축(검색 품질, 생성 품질, 종합)과 RAGAS를 설명할 수 있다
- **설명**: 레스토랑 평가. 재료 품질(검색) + 요리 실력(생성) + 종합 만족도(End-to-End).
- **핵심 키워드**: RAGAS, Context Relevancy, Faithfulness, Answer Relevancy
- **시각화 연결**: [VII-1-1 시각화 보기](part7/VII-1-1.html) — RAGAS 평가 프레임워크 (6단계)
- **다음 섹션**: VII-1-2

### VII-1-2. 평가 지표 심화 — Faithfulness, Relevancy, Context

- **난이도**: ★★★
- **선수 지식**: VII-1-1
- **학습 목표**: Faithfulness, Answer Relevancy, Context Precision/Recall의 계산과 해석을 설명할 수 있다
- **설명**: 시험 채점. Faithfulness: 교과서에 근거하는가? Answer Relevancy: 질문에 직접 답하는가? Context Precision: 관련 문서 비율. Context Recall: 필요 정보 포함 비율.
- **핵심 키워드**: Faithfulness, Answer Relevancy, Context Precision, Context Recall
- **시각화 연결**: [VII-1-2 시각화 보기](part7/VII-1-2.html) — 평가 지표 계산 과정 (6단계)
- **다음 섹션**: VII-2-1

---

## Chapter VII-2. 운영

### VII-2-1. 프로덕션 RAG — 디버깅, 모니터링, 배포 패턴

- **난이도**: ★★★
- **선수 지식**: VII-1-2
- **학습 목표**: 프로덕션 RAG의 디버깅, 모니터링, 배포 아키텍처 패턴을 설명할 수 있다
- **설명**: 공장 운영. 디버깅: 불량품이 어느 단계에서 생겼는지 추적. 모니터링: 검색 지연, 답변 품질, 비용 대시보드. 배포: 캐싱, A/B 테스트, 버전 관리.
- **핵심 키워드**: 파이프라인 추적, 모니터링, 캐싱, A/B 테스트, 재인덱싱
- **시각화 연결**: [VII-2-1 시각화 보기](part7/VII-2-1.html) — 프로덕션 RAG 아키텍처 (6단계)
