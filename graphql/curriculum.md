# GraphQL 인터랙티브 학습 커리큘럼

## 학습 목표
REST 대안 GraphQL로 정확한 필드 조회, 단일 엔드포인트, schema-first 설계, N+1 해결, 캐싱·구독을 마스터한다.

## Part I. GraphQL 기초 (Why GraphQL)
- I-1-1. REST 한계 — Over-fetching / Under-fetching
- I-1-2. GraphQL이 해결하는 것 — 정확한 필드만
- I-2-1. REST vs GraphQL vs tRPC vs gRPC
- I-2-2. 설치 + 첫 query (Apollo Server)

## Part II. Schema-First 설계
- II-1-1. Type System (scalar / object / list / non-null)
- II-1-2. Query / Mutation / Subscription
- II-2-1. Resolver — 필드별 함수
- II-2-2. Input / Enum / Interface / Union

## Part III. 쿼리 패턴
- III-1-1. Variables + Fragment
- III-1-2. Aliases + Directives (@include/@skip)
- III-2-1. Pagination (offset vs cursor + Relay spec)
- III-2-2. Mutation 응답 설계 (errors as data)

## Part IV. 성능 + 통합
- IV-1-1. N+1 문제 + DataLoader
- IV-1-2. Schema Stitching vs Federation (Apollo Federation v2)
- IV-2-1. Caching (HTTP / Persisted Query / Apollo Cache)
- IV-2-2. Subscription — WebSocket 실시간

## Part V. 운영과 보안
- V-1-1. 인증/인가 — context.user + field-level auth
- V-1-2. Query Complexity / Depth Limit (DoS 방지)
- V-2-1. 모니터링 — Apollo Studio / Hive / GraphOS
- V-2-2. 실전 체크리스트 — 운영 출항 점검표

## 색상 매핑: GraphQL magenta (#e10098) / fastapi v1 패턴
