# 🚀 postgres 폴더 시작하기 (첫 프롬프트)

이 폴더는 `D:/dev/framwork_study/` 루트와 **독립된** Claude Code 프로젝트다. 자기만의 `.claude/`, `docs/`, CLAUDE.md를 갖고 있어서 여기서 `/pm`을 실행하면 PostgreSQL 학습 자료만 놓고 스프린트가 돌아간다.

## 현재 폴더에 있는 것

| 파일 | 내용 |
|:--|:--|
| `index.html` | **Chapter 1-1 시각화** — SQL 쿼리 실행 파이프라인(Parser → Optimizer → Executor → Storage) |
| `curriculum.md` | Part I~VII 상세 목차 (Section 설명 2~3줄, 총 ~28 Section) |
| `README.md` | Live Server 실행 + GitHub Pages 배포 가이드 |
| `docs/` | Sprint 1 대기 상태 (빈 템플릿) |
| `.claude/`, `CLAUDE.md`, `USAGE.md` | 루트와 동일한 PM 워크플로우 |

## 시작 방법

### 1. 이 폴더로 이동
```bash
cd D:/dev/framwork_study/postgres
```

### 2. Claude Code 실행 후 아래 프롬프트 복사

```
/pm 이 폴더의 PostgreSQL 학습 자료 Sprint 1을 시작할게.

현재 상태
- index.html: SQL 쿼리 실행 파이프라인 시각화 (Chapter 1-1)
- curriculum.md: Part I~VII 상세 목차 (Section 설명 2~3줄)
- README.md: Live Server / Pages 배포 가이드

다음 스프린트 방향 후보를 같이 정리해줘:

A. Chapter 1-2 시각화 추가 — 트랜잭션 ACID / 인덱스 탐색(B-tree) / EXPLAIN 실행 계획 중 선택
B. curriculum 본문 1원고 집필 — Section 설명을 책 수준 본문으로 확장 (Part I부터, 토큰 한도 회피 위해 Part 단위 분할 위임)
C. 실전 프로젝트 예제 추가 — "도서관 대여 시스템 스키마" 같은 CRUD 예제

독자 타겟은 [주니어 실무 투입용 / 비개발자 입문 / 둘 다] 중 무엇으로 할지도 같이 정해줘.
```

## 방향별 참고

### A. Chapter 1-2 시각화 후보
- **트랜잭션 격리 수준 (ACID)** — Read Committed vs Repeatable Read vs Serializable 에서 같은 데이터에 동시 접근하는 과정
- **인덱스 탐색 (B-tree vs Hash)** — 단일 키 조회와 범위 조회의 차이
- **EXPLAIN 실행 계획 읽기** — Seq Scan / Index Scan / Nested Loop / Hash Join 노드

### B. curriculum 본문 집필 시 주의
- Part별 3분할 위임이 안전 (단일 위임은 32k 토큰 초과 위험 — fastapi 사례)
- 비개발자 진입부(Part I~II)는 비유 중심, 전문 용어 첫 등장 시 영어 병기

### C. 실전 프로젝트 후보
- 도서관 대여 시스템 (User/Book/Loan) — JOIN, 트랜잭션, 인덱스 실습 겸용
- 블로그 댓글 트리 — 재귀 CTE 학습
