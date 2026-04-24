# LangChain + LangGraph 인터랙티브 학습 커리큘럼

## 읽기 가이드

### 난이도 범례
- ★☆☆ : LLM API 기본 사용 경험만 있으면 이해 가능
- ★★☆ : LangChain 기본 사용 경험 권장
- ★★★ : 복잡한 체인/그래프 구축 경험이 있으면 더 깊이 이해

### 독자별 추천 경로
- **LangChain이 처음**: Part I → Part II → Part III → Part IV → Part V → Part VI (순서대로)
- **기본은 아는데 LangGraph가 처음**: Part I(훑기) → Part IV → Part V
- **실전 프로젝트 바로 만들고 싶다**: Part III → Part IV → Part VI
- **LangSmith/평가가 궁금하다**: Part V 전체

---

## 전체 목차

```
Part I.  LangChain이란 ──────────── "왜 LangChain인가?"
  └ Chapter I-1. LangChain 개요
      ├ I-1-1. LLM 직접 호출 vs LangChain
      ├ I-1-2. LangChain 아키텍처 전체 지도
      └ I-1-3. LCEL (LangChain Expression Language)
  └ Chapter I-2. 핵심 컴포넌트
      ├ I-2-1. PromptTemplate
      └ I-2-2. OutputParser

Part II. LangChain 컴포넌트 ─────── "데이터를 다루는 도구들"
  └ Chapter II-1. 문서 처리
      ├ II-1-1. Document Loaders
      ├ II-1-2. Text Splitters
      └ II-1-3. Embeddings
  └ Chapter II-2. 저장과 검색
      ├ II-2-1. Vector Stores
      └ II-2-2. Retrievers

Part III. 체인 패턴 ─────────────── "컴포넌트를 연결하는 방법"
  └ Chapter III-1. 기본 체인
      ├ III-1-1. SequentialChain (순차)
      ├ III-1-2. RouterChain (분기)
      └ III-1-3. ConversationChain (대화)
  └ Chapter III-2. 고급 체인
      ├ III-2-1. RAG Chain (검색+생성)
      ├ III-2-2. MapReduce Chain
      └ III-2-3. Agent + Tools Chain

Part IV. LangGraph ──────────────── "상태 기반 그래프 워크플로우"
  └ Chapter IV-1. LangGraph 개요
      ├ IV-1-1. 왜 LangGraph인가 (Chain의 한계)
      ├ IV-1-2. StateGraph 기본 개념
      └ IV-1-3. Node, Edge, Conditional Edge
  └ Chapter IV-2. LangGraph 실전
      ├ IV-2-1. ReAct Agent (LangGraph 버전)
      ├ IV-2-2. Human-in-the-Loop
      └ IV-2-3. Multi-Agent Supervisor

Part V.  LangSmith & 평가 ────────── "관찰, 디버깅, 품질 측정"
  └ Chapter V-1. LangSmith
      ├ V-1-1. 트레이싱과 디버깅
      └ V-1-2. 프롬프트 관리
  └ Chapter V-2. 평가
      ├ V-2-1. LLM-as-Judge
      └ V-2-2. 자동 평가 파이프라인

Part VI. 실전 프로젝트 ──────────── "처음부터 끝까지 만들어보자"
  └ Chapter VI-1. 프로젝트
      ├ VI-1-1. RAG 챗봇 (문서 Q&A)
      ├ VI-1-2. 코드 리뷰 Agent
      └ VI-1-3. Multi-Agent 워크플로우
```

---

## 상세 목차

---

# Part I. LangChain이란

> LLM API를 직접 호출하면 반복 코드가 많고, 컴포넌트를 조합하기 어렵다. LangChain은 LLM 애플리케이션을 만드는 **프레임워크**다. 레고 블록처럼 컴포넌트를 조합해서 복잡한 파이프라인을 만든다.

## Chapter I-1. LangChain 개요

### I-1-1. LLM 직접 호출 vs LangChain

- **난이도**: ★☆☆
- **선수 지식**: AI Agent 프로젝트의 II-2-2 (API 호출 기본)
- **학습 목표**: LLM 직접 호출의 문제점과 LangChain이 해결하는 것을 설명할 수 있다
- **설명**: 직접 요리하면 재료 손질부터 설거지까지 다 해야 한다. LangChain은 **밀키트** — 재료가 손질되어 있고, 순서대로 넣으면 요리가 완성된다. 프롬프트 관리, 출력 파싱, 체인 연결, 메모리 관리를 프레임워크가 처리한다.
- **핵심 키워드**: LangChain, 프레임워크, 반복 코드 제거, 컴포넌트 조합
- **시각화 연결**: [I-1-1 시각화 보기](part1/I-1-1.html) — 직접 호출 vs LangChain 비교 (5단계)
- **다음 섹션**: I-1-2

### I-1-2. LangChain 아키텍처 전체 지도

- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: LangChain의 핵심 모듈(Model, Prompt, Chain, Memory, Agent)을 구분할 수 있다
- **설명**: 공장의 **생산 라인**을 상상해보자. 원재료(입력) → 가공(Prompt) → 기계(Model) → 검수(OutputParser) → 포장(Chain) → 출하(응답). LangChain은 이 생산 라인의 각 단계를 모듈로 제공한다.
- **핵심 키워드**: Model I/O, Chains, Memory, Agents, Callbacks
- **시각화 연결**: [I-1-2 시각화 보기](part1/I-1-2.html) — 아키텍처 모듈 다이어그램 (5단계)
- **다음 섹션**: I-1-3

### I-1-3. LCEL (LangChain Expression Language)

- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: LCEL의 파이프(`|`) 문법으로 체인을 구성할 수 있다
- **설명**: Unix의 **파이프(|)** 처럼, `prompt | model | parser`로 체인을 만든다. 앞 단계의 출력이 다음 단계의 입력이 된다. 선언적이고 읽기 쉽다.
- **핵심 키워드**: LCEL, 파이프(|), Runnable, invoke, stream, batch
- **시각화 연결**: [I-1-3 시각화 보기](part1/I-1-3.html) — LCEL 파이프 흐름 + 코드 (5단계)
- **다음 섹션**: I-2-1

---

## Chapter I-2. 핵심 컴포넌트

### I-2-1. PromptTemplate

- **난이도**: ★☆☆
- **선수 지식**: I-1-3
- **학습 목표**: PromptTemplate으로 재사용 가능한 프롬프트를 만들 수 있다
- **설명**: **편지 양식**과 같다. "Dear {name}, ..."에서 {name}만 바꾸면 된다. ChatPromptTemplate은 System/Human/AI 메시지를 템플릿화한다.
- **핵심 키워드**: PromptTemplate, ChatPromptTemplate, 변수 바인딩, format
- **시각화 연결**: [I-2-1 시각화 보기](part1/I-2-1.html) — 템플릿 → 변수 주입 → 완성 (5단계)
- **다음 섹션**: I-2-2

### I-2-2. OutputParser

- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: LLM 출력을 구조화된 데이터(JSON, 리스트 등)로 변환할 수 있다
- **설명**: LLM은 자유 텍스트를 출력한다. OutputParser는 **세관 검사관** — 텍스트를 JSON, 리스트, Pydantic 객체 등 정해진 형식으로 변환한다.
- **핵심 키워드**: StrOutputParser, JsonOutputParser, PydanticOutputParser
- **시각화 연결**: [I-2-2 시각화 보기](part1/I-2-2.html) — 자유 텍스트 → 구조화 데이터 (5단계)
- **다음 섹션**: II-1-1

---

# Part II. LangChain 컴포넌트

> LLM이 외부 데이터를 활용하려면, 문서를 로드하고, 적절한 크기로 자르고, 벡터로 변환해서 저장해야 한다. Part II는 이 데이터 파이프라인의 각 단계를 다룬다.

## Chapter II-1. 문서 처리

### II-1-1. Document Loaders

- **난이도**: ★☆☆
- **선수 지식**: I-2-2
- **학습 목표**: 다양한 형식(PDF, 웹, DB)의 문서를 LangChain Document 객체로 로드할 수 있다
- **설명**: **우체부**가 다양한 형태의 편지(봉투, 소포, 등기)를 수거해서 표준 양식으로 정리하는 것. PDF, HTML, CSV 등 어떤 형식이든 Document(page_content + metadata)로 통일한다.
- **핵심 키워드**: Document, page_content, metadata, PyPDFLoader, WebBaseLoader
- **시각화 연결**: [II-1-1 시각화 보기](part2/II-1-1.html) — 다양한 소스 → Document 통일 (5단계)
- **다음 섹션**: II-1-2

### II-1-2. Text Splitters

- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: 긴 문서를 적절한 크기의 청크로 분할하는 전략을 설명할 수 있다
- **설명**: 두꺼운 **백과사전**을 한 번에 읽을 수 없다. 챕터별, 문단별로 나눠서 필요한 부분만 찾아 읽는다. chunk_size와 chunk_overlap이 핵심 파라미터다.
- **핵심 키워드**: RecursiveCharacterTextSplitter, chunk_size, chunk_overlap, 의미 보존
- **시각화 연결**: [II-1-2 시각화 보기](part2/II-1-2.html) — 긴 문서 → 청크 분할 과정 (5단계)
- **다음 섹션**: II-1-3

### II-1-3. Embeddings

- **난이도**: ★★☆
- **선수 지식**: II-1-2
- **학습 목표**: 텍스트를 벡터(숫자 배열)로 변환하는 원리와 유사도 검색의 기본을 설명할 수 있다
- **설명**: **좌표 찍기**와 같다. "왕"과 "여왕"은 가까운 좌표에, "왕"과 "사과"는 먼 좌표에 찍힌다. 의미가 비슷한 텍스트는 벡터 공간에서 가까이 위치한다.
- **핵심 키워드**: Embedding, 벡터, 코사인 유사도, OpenAIEmbeddings
- **시각화 연결**: [II-1-3 시각화 보기](part2/II-1-3.html) — 텍스트 → 벡터 변환 + 유사도 (5단계)
- **다음 섹션**: II-2-1

---

## Chapter II-2. 저장과 검색

### II-2-1. Vector Stores

- **난이도**: ★★☆
- **선수 지식**: II-1-3
- **학습 목표**: 벡터를 저장하고 유사도 검색하는 Vector Store의 동작 원리를 설명할 수 있다
- **설명**: **도서관 서가**와 같다. 책(벡터)을 주제별로 정리해두면, 비슷한 주제의 책을 빠르게 찾을 수 있다. FAISS, Chroma, pgvector 등이 있다.
- **핵심 키워드**: FAISS, Chroma, pgvector, similarity_search, add_documents
- **시각화 연결**: [II-2-1 시각화 보기](part2/II-2-1.html) — 벡터 저장 → 유사도 검색 (5단계)
- **다음 섹션**: II-2-2

### II-2-2. Retrievers

- **난이도**: ★★☆
- **선수 지식**: II-2-1
- **학습 목표**: Retriever 인터페이스와 다양한 검색 전략을 설명할 수 있다
- **설명**: **사서**와 같다. "AI Agent에 대해 알려줘"라고 하면 관련 책을 여러 권 찾아준다. Vector Store의 검색 기능을 Retriever 인터페이스로 추상화한다.
- **핵심 키워드**: BaseRetriever, VectorStoreRetriever, MMR, similarity threshold
- **시각화 연결**: [II-2-2 시각화 보기](part2/II-2-2.html) — 질문 → Retriever → 관련 문서 (5단계)
- **다음 섹션**: III-1-1

---

# Part III. 체인 패턴

> 컴포넌트를 연결하면 체인이 된다. 순차 실행, 분기, 대화, RAG 등 다양한 패턴이 있다. Part III은 이 체인 패턴들을 비유와 코드로 설명한다.

## Chapter III-1. 기본 체인

### III-1-1. SequentialChain

- **난이도**: ★★☆
- **선수 지식**: II-2-2
- **학습 목표**: 여러 체인을 순서대로 연결하는 SequentialChain을 구성할 수 있다
- **설명**: **공장 조립 라인** — 1번 작업자가 부품 A를 만들고, 2번이 A를 받아서 B를 만들고, 3번이 B를 받아서 완성품을 만든다. 각 단계의 출력이 다음 단계의 입력이 된다.
- **핵심 키워드**: SequentialChain, RunnableSequence, 파이프라인
- **시각화 연결**: [III-1-1 시각화 보기](part3/III-1-1.html) — 순차 체인 흐름 (5단계)
- **다음 섹션**: III-1-2

### III-1-2. RouterChain

- **난이도**: ★★☆
- **선수 지식**: III-1-1
- **학습 목표**: 입력에 따라 다른 체인으로 분기하는 RouterChain을 구성할 수 있다
- **설명**: **콜센터 ARS** — "제품 문의는 1번, 배송 문의는 2번, 환불은 3번". 입력을 분류해서 적절한 처리기로 보낸다.
- **핵심 키워드**: RouterChain, RunnableBranch, 조건부 분기
- **시각화 연결**: [III-1-2 시각화 보기](part3/III-1-2.html) — 분기 흐름 다이어그램 (5단계)
- **다음 섹션**: III-1-3

### III-1-3. ConversationChain

- **난이도**: ★★☆
- **선수 지식**: III-1-2
- **학습 목표**: 대화 이력을 유지하는 ConversationChain의 메모리 동작을 설명할 수 있다
- **설명**: **단골 카페** — 바리스타가 "오늘도 아메리카노요?"라고 기억하는 것. ConversationBufferMemory가 대화 이력을 저장하고, 매 호출마다 포함시킨다.
- **핵심 키워드**: ConversationBufferMemory, ConversationSummaryMemory, chat_history
- **시각화 연결**: [III-1-3 시각화 보기](part3/III-1-3.html) — 대화 메모리 동작 (5단계)
- **다음 섹션**: III-2-1

---

## Chapter III-2. 고급 체인

### III-2-1. RAG Chain

- **난이도**: ★★★
- **선수 지식**: III-1-3, II-2-2
- **학습 목표**: 검색(Retrieval) + 생성(Generation)을 결합한 RAG 체인을 구성할 수 있다
- **설명**: **오픈북 시험** — 시험 중에 교과서를 펼쳐보고(Retrieval) 답을 쓴다(Generation). LLM이 모르는 정보를 외부 문서에서 찾아서 답변한다.
- **핵심 키워드**: RAG, create_retrieval_chain, context, stuff_documents_chain
- **시각화 연결**: [III-2-1 시각화 보기](part3/III-2-1.html) — 질문 → 검색 → LLM → 답변 (6단계)
- **다음 섹션**: III-2-2

### III-2-2. MapReduce Chain

- **난이도**: ★★★
- **선수 지식**: III-2-1
- **학습 목표**: 대량 문서를 병렬 처리하는 MapReduce 패턴을 설명할 수 있다
- **설명**: **단체 과제** — 10개 챕터를 5명이 2개씩 나눠 요약(Map)하고, 한 명이 전체를 종합(Reduce)한다.
- **핵심 키워드**: MapReduce, map_chain, reduce_chain, 병렬 처리
- **시각화 연결**: [III-2-2 시각화 보기](part3/III-2-2.html) — Map(분할) → Reduce(종합) (5단계)
- **다음 섹션**: III-2-3

### III-2-3. Agent + Tools Chain

- **난이도**: ★★★
- **선수 지식**: III-2-2
- **학습 목표**: LangChain Agent가 도구를 선택하고 사용하는 체인을 구성할 수 있다
- **설명**: ai-agent 프로젝트에서 배운 ReAct + Tool Use를 LangChain으로 구현한다. create_react_agent로 Agent를 만들고, Tool 목록을 전달한다.
- **핵심 키워드**: create_react_agent, AgentExecutor, Tool, @tool 데코레이터
- **시각화 연결**: [III-2-3 시각화 보기](part3/III-2-3.html) — LangChain Agent 실행 흐름 (6단계)
- **다음 섹션**: IV-1-1

---

# Part IV. LangGraph

> LangChain의 Chain은 선형적이다. 하지만 실전에서는 조건 분기, 루프, 병렬 실행이 필요하다. LangGraph는 **상태 기반 그래프**로 복잡한 워크플로우를 표현한다.

## Chapter IV-1. LangGraph 개요

### IV-1-1. 왜 LangGraph인가

- **난이도**: ★★☆
- **선수 지식**: III-2-3
- **학습 목표**: Chain의 한계와 LangGraph가 해결하는 문제를 설명할 수 있다
- **설명**: **일직선 도로(Chain)** vs **교차로가 있는 도시(Graph)**. Chain은 A→B→C만 가능하지만, Graph는 A→B→(조건)→C 또는 D, 그리고 D→A로 돌아가기도 가능하다.
- **핵심 키워드**: StateGraph, 조건 분기, 루프, 비선형 워크플로우
- **시각화 연결**: [IV-1-1 시각화 보기](part4/IV-1-1.html) — Chain vs Graph 비교 (5단계)
- **다음 섹션**: IV-1-2

### IV-1-2. StateGraph 기본 개념

- **난이도**: ★★☆
- **선수 지식**: IV-1-1
- **학습 목표**: State, Node, Edge의 개념과 관계를 설명할 수 있다
- **설명**: **보드게임**과 같다. State는 게임판 위의 현재 상태, Node는 칸(행동), Edge는 이동 경로, Conditional Edge는 주사위 결과에 따른 분기.
- **핵심 키워드**: TypedDict State, add_node, add_edge, compile
- **시각화 연결**: [IV-1-2 시각화 보기](part4/IV-1-2.html) — State + Node + Edge 구조 (5단계)
- **다음 섹션**: IV-1-3

### IV-1-3. Node, Edge, Conditional Edge

- **난이도**: ★★★
- **선수 지식**: IV-1-2
- **학습 목표**: Conditional Edge로 분기 로직을 구현하고, END 노드로 종료하는 그래프를 만들 수 있다
- **설명**: **지하철 노선도** — 환승역(Conditional Edge)에서 "2호선으로 갈까, 3호선으로 갈까?" 결정한다. 종착역(END)에 도착하면 그래프가 종료된다.
- **핵심 키워드**: add_conditional_edges, END, should_continue, 종료 조건
- **시각화 연결**: [IV-1-3 시각화 보기](part4/IV-1-3.html) — 조건부 분기 + 종료 (6단계)
- **다음 섹션**: IV-2-1

---

## Chapter IV-2. LangGraph 실전

### IV-2-1. ReAct Agent (LangGraph 버전)

- **난이도**: ★★★
- **선수 지식**: IV-1-3
- **학습 목표**: LangGraph로 ReAct Agent를 구현하는 흐름을 추적할 수 있다
- **설명**: ai-agent 프로젝트에서 배운 ReAct를 LangGraph의 StateGraph로 구현한다. agent_node → should_continue → tool_node → agent_node 루프.
- **핵심 키워드**: create_react_agent (langgraph), ToolNode, agent loop
- **시각화 연결**: [IV-2-1 시각화 보기](part4/IV-2-1.html) — LangGraph ReAct 그래프 (6단계)
- **다음 섹션**: IV-2-2

### IV-2-2. Human-in-the-Loop

- **난이도**: ★★★
- **선수 지식**: IV-2-1
- **학습 목표**: 그래프 실행 중 사람의 승인을 받는 interrupt 패턴을 설명할 수 있다
- **설명**: **공장 품질 검사** — 자동 라인에서 돌다가, 특정 단계에서 검사원이 "이거 OK?" 확인한다. interrupt_before로 실행을 멈추고, 사람이 승인하면 재개한다.
- **핵심 키워드**: interrupt_before, checkpoint, resume, 승인 패턴
- **시각화 연결**: [IV-2-2 시각화 보기](part4/IV-2-2.html) — 실행 → 중단 → 승인 → 재개 (5단계)
- **다음 섹션**: IV-2-3

### IV-2-3. Multi-Agent Supervisor

- **난이도**: ★★★
- **선수 지식**: IV-2-2
- **학습 목표**: Supervisor 패턴으로 여러 Agent를 조율하는 그래프를 설명할 수 있다
- **설명**: **프로젝트 매니저** — PM이 Research Agent, Coding Agent, Review Agent에게 업무를 분배하고 결과를 종합한다. Supervisor가 다음에 어떤 Agent를 실행할지 결정한다.
- **핵심 키워드**: Supervisor, sub-graph, 역할 분담, 라우팅
- **시각화 연결**: [IV-2-3 시각화 보기](part4/IV-2-3.html) — Supervisor → Sub-agent 흐름 (6단계)
- **다음 섹션**: V-1-1

---

# Part V. LangSmith & 평가

> LLM 애플리케이션은 "동작은 하는데 품질이 어떤지 모르겠다"가 가장 큰 문제다. LangSmith로 관찰하고, 자동 평가로 품질을 측정한다.

## Chapter V-1. LangSmith

### V-1-1. 트레이싱과 디버깅

- **난이도**: ★★☆
- **선수 지식**: IV-2-3
- **학습 목표**: LangSmith에서 체인 실행 과정을 추적하고 병목을 찾을 수 있다
- **설명**: **블랙박스 녹화기** — 비행기 사고 후 블랙박스를 열어보듯, LLM 체인의 모든 호출을 기록하고 나중에 재생할 수 있다.
- **핵심 키워드**: Trace, Run, 토큰 사용량, 지연 시간, 에러 추적
- **시각화 연결**: [V-1-1 시각화 보기](part5/V-1-1.html) — 트레이스 타임라인 (5단계)
- **다음 섹션**: V-1-2

### V-1-2. 프롬프트 관리

- **난이도**: ★★☆
- **선수 지식**: V-1-1
- **학습 목표**: LangSmith Hub에서 프롬프트를 버전 관리하고 공유하는 방법을 설명할 수 있다
- **설명**: **Git for 프롬프트** — 코드를 Git으로 버전 관리하듯, 프롬프트도 버전별로 관리하고, 팀과 공유하고, A/B 테스트한다.
- **핵심 키워드**: LangSmith Hub, 프롬프트 버전, pull/push, A/B 테스트
- **시각화 연결**: [V-1-2 시각화 보기](part5/V-1-2.html) — 프롬프트 버전 관리 흐름 (5단계)
- **다음 섹션**: V-2-1

---

## Chapter V-2. 평가

### V-2-1. LLM-as-Judge

- **난이도**: ★★★
- **선수 지식**: V-1-2
- **학습 목표**: LLM을 평가자로 사용하는 패턴과 한계를 설명할 수 있다
- **설명**: **학생이 학생을 채점** — 시험 답안을 다른 LLM이 평가한다. 빠르고 저렴하지만, 평가 기준이 명확해야 한다.
- **핵심 키워드**: LLM-as-Judge, 평가 기준, 정확성, 관련성, 충실성
- **시각화 연결**: [V-2-1 시각화 보기](part5/V-2-1.html) — LLM 평가 파이프라인 (5단계)
- **다음 섹션**: V-2-2

### V-2-2. 자동 평가 파이프라인

- **난이도**: ★★★
- **선수 지식**: V-2-1
- **학습 목표**: Dataset + Evaluator로 자동 평가 파이프라인을 구성할 수 있다
- **설명**: **자동차 충돌 테스트** — 다양한 시나리오(Dataset)로 반복 테스트하고, 점수(Metrics)를 자동 산출한다.
- **핵심 키워드**: Dataset, run_on_dataset, Evaluator, Metrics, 회귀 테스트
- **시각화 연결**: [V-2-2 시각화 보기](part5/V-2-2.html) — 자동 평가 루프 (5단계)
- **다음 섹션**: VI-1-1

---

# Part VI. 실전 프로젝트

> 지금까지 배운 모든 것을 조합하여 실제 동작하는 프로젝트를 만든다.

## Chapter VI-1. 프로젝트

### VI-1-1. RAG 챗봇 (문서 Q&A)

- **난이도**: ★★★
- **선수 지식**: III-2-1
- **학습 목표**: PDF를 로드해서 질문에 답하는 RAG 챗봇의 전체 파이프라인을 구성할 수 있다
- **설명**: 회사 매뉴얼 PDF를 올리면, 직원이 "휴가 신청 방법이 뭐야?"라고 질문할 수 있는 챗봇.
- **핵심 키워드**: PDF → 청크 → 임베딩 → Vector Store → RAG Chain → 답변
- **시각화 연결**: [VI-1-1 시각화 보기](part6/VI-1-1.html) — RAG 챗봇 전체 아키텍처 (6단계)
- **다음 섹션**: VI-1-2

### VI-1-2. 코드 리뷰 Agent

- **난이도**: ★★★
- **선수 지식**: IV-2-1
- **학습 목표**: LangGraph로 코드를 분석하고 리뷰하는 Agent를 설계할 수 있다
- **설명**: GitHub PR의 코드를 읽고 → 버그/개선점을 분석하고 → 리뷰 코멘트를 생성하는 Agent.
- **핵심 키워드**: 코드 분석, 리뷰 생성, LangGraph Agent, 도구 연동
- **시각화 연결**: [VI-1-2 시각화 보기](part6/VI-1-2.html) — 코드 리뷰 Agent 흐름 (6단계)
- **다음 섹션**: VI-1-3

### VI-1-3. Multi-Agent 워크플로우

- **난이도**: ★★★
- **선수 지식**: IV-2-3
- **학습 목표**: 여러 전문 Agent가 협업하는 워크플로우를 LangGraph로 구현할 수 있다
- **설명**: Research Agent가 조사 → Writer Agent가 초안 → Editor Agent가 교정 → 최종 문서 완성.
- **핵심 키워드**: Multi-Agent, Supervisor, 역할 분담, 결과 종합
- **시각화 연결**: [VI-1-3 시각화 보기](part6/VI-1-3.html) — Multi-Agent 협업 다이어그램 (6단계)
- **다음 섹션**: (완료)
