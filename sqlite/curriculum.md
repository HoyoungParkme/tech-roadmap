# SQLite 사다리형 학습 커리큘럼

> 가장 널리 쓰이는 임베디드 데이터베이스, SQLite를 한 권으로 정리한다.

이 자료는 SQLite 공식 문서와 두꺼운 책의 빈자리를 채우기 위해 만들어졌다. **"파일 하나가 데이터베이스"라는 단순함과, 그 안에 숨어 있는 정교한 동시성 제어**를 동시에 이해할 수 있도록 사다리형 구조로 설계했다. 모바일/데스크톱/엣지 디바이스에 거의 모두 탑재돼 있는 이 작은 엔진은, 알고 쓰면 수십만 TPS를 내고, 모르고 쓰면 `database is locked` 오류로 첫날 야근을 부른다.

전체 구성은 **설계도(상세 목차) + 인터랙티브 시각화**다. 각 Section은 한 꼭지의 학습 단위이며, fastapi v1 패턴(좌 LiveDataPane / 우 VSCode CodeViewer)으로 통일된 시각화가 짝을 이룬다.

---

## 읽기 가이드

### 난이도 범례

| 표기 | 독자 | 설명 |
|:--|:--|:--|
| **★☆☆** | 비개발자 | 데이터베이스 첫 경험. SQL을 본 적 없음 |
| **★★☆** | 코딩 입문 | SQL 기초(SELECT/INSERT)는 본 적 있음 |
| **★★★** | 주니어 | SQL + 트랜잭션 + 동시성 실무 경험 |

### 독자별 추천 경로

- **DB가 처음인 분** → Part I → Part II (천천히)
- **다른 RDB는 써봤고 SQLite는 처음** → Part I-2 → Part II → Part IV (WAL/락)
- **모바일/엣지 앱 개발자** → Part I → Part IV → Part V (앱 내장)
- **데이터 분석가** → Part II → Part III (인덱스) → Part V (JSON1)

### Section 양식 (공통)

각 Section은 아래 7개 필드를 갖는다.

- **난이도**: ★☆☆ / ★★☆ / ★★★
- **선수 지식**: 먼저 읽어두면 좋은 이전 Section
- **학습 목표**: "이 Section을 마치면 ...할 수 있다"
- **설명**: 2~3줄 핵심 요약 (비유 중심)
- **핵심 키워드**: 이 Section의 기억해둘 개념 목록
- **시각화 연결**: 관련 `chapter-*.html` 시각화
- **다음 섹션**: 다음 번호

### 번호 규칙

`Part-Chapter-Section` (예: `IV-1-1` = Part IV, Chapter 1, Section 1).

---

## 전체 목차

### Part I. SQLite의 본질 (★☆☆~★★☆)
- Chapter I-1. 파일 하나가 데이터베이스
- Chapter I-2. 단일 쓰기 모델 vs 서버형 DB

### Part II. SQL 문법과 트랜잭션 (★★☆)
- Chapter II-1. SELECT/JOIN/INSERT/UPDATE/DELETE
- Chapter II-2. 트랜잭션, SAVEPOINT, PRAGMA

### Part III. 인덱스와 쿼리 플랜 (★★★) — Phase 2
- Chapter III-1. B-tree 인덱스와 Covering Index
- Chapter III-2. EXPLAIN QUERY PLAN, ANALYZE

### Part IV. WAL과 동시성 (★★★) — Phase 2
- Chapter IV-1. WAL mode vs Rollback Journal
- Chapter IV-2. busy_timeout, 락, 체크포인트

### Part V. 실전 활용 (★★★) — Phase 2
- Chapter V-1. 앱 내장(모바일/데스크톱), 백업/restore
- Chapter V-2. ORM 비교, JSON1 확장

---

## Part I. SQLite의 본질 (★☆☆~★★☆)

SQLite는 "파일 하나 = 데이터베이스 하나"라는 극단적으로 단순한 설계를 가진 임베디드 RDBMS다. 이 Part에서는 이 단순함이 왜 강력한지, 어떤 한계를 동반하는지, 다른 서버형 DB(PostgreSQL/MySQL)와 무엇이 본질적으로 다른지를 살펴본다.

> 본문 1원고: 향후 `docs/book/part-1.md`로 분리 예정 (4 Section).

---

### Chapter I-1. 파일 하나가 데이터베이스

#### I-1-1. SQLite 파일 구조 — page 단위로 본다

- **난이도**: ★☆☆
- **선수 지식**: 없음
- **학습 목표**: 이 Section을 마치면 `.db` 파일 하나가 어떻게 테이블/인덱스를 담는 "페이지의 모음"인지 설명할 수 있다.
- **설명**: SQLite 데이터베이스는 단 하나의 파일이다. 이 파일은 4096바이트(기본) 단위의 "페이지"로 잘려 있고, 첫 페이지에는 헤더(매직 문자열, 페이지 크기, 텍스트 인코딩 등 100바이트)가, 나머지 페이지에는 테이블/인덱스가 B-tree 형태로 들어간다. 즉 `users.db` 파일을 열면 그 자체가 작은 RDBMS다.
- **핵심 키워드**: [페이지(page), 헤더(header), 매직 문자열, B-tree, sqlite3 CLI]
- **시각화 연결**: `chapter-i-1-1.html` (파일 헤더 → 페이지 → B-tree 5단계 시각화)
- **다음 섹션**: I-1-2

#### I-1-2. ACID와 트랜잭션 — 파일에 어떻게 ACID를 입혔나

- **난이도**: ★★☆
- **선수 지식**: I-1-1
- **학습 목표**: 이 Section을 마치면 SQLite가 단일 파일에 ACID를 어떻게 구현했는지 (rollback journal 또는 WAL의 역할) 설명할 수 있다.
- **설명**: 트랜잭션 중에 정전이 나도 데이터가 망가지지 않는 비밀은 "보조 파일"이다. 기본 모드에서는 `users.db-journal`이라는 임시 파일에 "변경 전 원본 페이지"를 미리 복사해두고, 커밋되면 journal을 지운다. 중간에 죽으면 journal로 원래대로 되돌린다. 이게 atomicity와 durability의 정체다.
- **핵심 키워드**: [ACID, rollback journal, WAL, atomic commit, durability, fsync]
- **시각화 연결**: `chapter-i-1-2.html` (BEGIN → journal 생성 → 변경 → COMMIT/CRASH 5단계)
- **다음 섹션**: I-2-1

---

### Chapter I-2. 단일 쓰기 모델 vs 서버형 DB

#### I-2-1. Single-writer 모델 — 왜 쓰기는 한 번에 하나만?

- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: 이 Section을 마치면 SQLite가 동시에 여러 reader는 허용하지만 writer는 한 번에 하나만 받는 이유와 그 영향(database is locked)을 설명할 수 있다.
- **설명**: SQLite는 별도 서버 프로세스가 없다. 여러 프로세스가 같은 파일을 직접 연다. 이 구조의 안전을 위해 OS 파일 락(SHARED → RESERVED → PENDING → EXCLUSIVE)으로 동시성을 제어한다. 결과적으로 reader는 동시에 여럿이지만, writer는 단 하나만 허용된다. 이 한계가 곧 강점이기도 하다 — 데드락이 사실상 없다.
- **핵심 키워드**: [single writer, 파일 락, SHARED/EXCLUSIVE, database is locked, busy_timeout]
- **시각화 연결**: `chapter-i-2-1.html` (writer 1 + reader 3 동시 시나리오, 락 전이 5단계)
- **다음 섹션**: I-2-2

#### I-2-2. Embedded vs Server — SQLite를 언제 선택하나

- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: 이 Section을 마치면 SQLite(embedded)와 PostgreSQL/MySQL(server)의 본질 차이를 비유로 설명하고, 적합한 사용 사례 3가지 이상을 들 수 있다.
- **설명**: 서버형 DB는 "은행 본점"이다 — 전용 건물, 직원(프로세스), 네트워크로 손님을 받는다. SQLite는 "내 주머니 속 가계부"다 — 앱 안에 들어가 같은 프로세스에서 함수 호출처럼 동작한다. 모바일 앱, 로컬 캐시, CLI 도구, 엣지 디바이스에 압도적으로 유리하다.
- **핵심 키워드**: [embedded vs server, in-process, IPC 없음, mobile/edge, 적합 사용처, 부적합 사용처]
- **시각화 연결**: `chapter-i-2-2.html` (앱 ↔ DB 호출 흐름 비교, embedded 5단계)
- **다음 섹션**: II-1-1

---

## Part II. SQL 문법과 트랜잭션 (★★☆)

표준 SQL 대부분을 그대로 쓸 수 있지만, SQLite만의 특징(타입 유연성, 트랜잭션 단일 파일, PRAGMA로 런타임 튜닝)을 함께 이해해야 한다. 이 Part에서는 일상적으로 마주치는 쿼리 패턴부터 트랜잭션 제어, PRAGMA로 동작을 바꾸는 방법까지 본다.

> 본문 1원고: 향후 `docs/book/part-2.md`로 분리 예정 (4 Section).

---

### Chapter II-1. SELECT/JOIN/INSERT/UPDATE/DELETE

#### II-1-1. SELECT와 JOIN — 데이터 꺼내기의 기본

- **난이도**: ★★☆
- **선수 지식**: I-2-2
- **학습 목표**: 이 Section을 마치면 SELECT의 절(SELECT/FROM/WHERE/GROUP BY/ORDER BY/LIMIT) 실행 순서를 설명하고, INNER/LEFT JOIN을 두 테이블에 적용할 수 있다.
- **설명**: SQL은 "써놓은 순서"와 "실행되는 순서"가 다르다. FROM → WHERE → GROUP BY → SELECT → ORDER BY → LIMIT 순으로 실행된다. 이 순서를 알면 왜 SELECT에서 만든 alias를 WHERE에서 못 쓰는지 즉시 이해된다. JOIN은 두 테이블을 ON 조건으로 연결해 한 행으로 합치는 작업이다.
- **핵심 키워드**: [SELECT/FROM/WHERE/GROUP BY/ORDER BY/LIMIT, 논리적 실행 순서, INNER JOIN, LEFT JOIN, ON]
- **시각화 연결**: `chapter-ii-1-1.html` (SQL 절 실행 순서 + JOIN 5단계)
- **다음 섹션**: II-1-2

#### II-1-2. INSERT/UPDATE/DELETE — 데이터 변경의 안전 장치

- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: 이 Section을 마치면 INSERT의 세 가지 형태(VALUES, SELECT, UPSERT), UPDATE/DELETE의 WHERE 누락 위험, 그리고 안전한 변경 절차를 설명할 수 있다.
- **설명**: SQL에서 가장 위험한 한 줄은 `WHERE`이 빠진 UPDATE/DELETE다. SQLite는 친절하지 않다 — 1초 만에 100만 행이 다 바뀐다. 변경 전에 같은 조건으로 SELECT 먼저 → 트랜잭션으로 감싸기 → INSERT INTO ... ON CONFLICT 같은 UPSERT 패턴 이해, 이 세 가지가 안전 장치다.
- **핵심 키워드**: [INSERT VALUES/SELECT, UPSERT(ON CONFLICT), UPDATE WHERE, DELETE WHERE, 사전 SELECT 확인]
- **시각화 연결**: `chapter-ii-1-2.html` (INSERT/UPDATE/DELETE 안전 절차 5단계)
- **다음 섹션**: II-2-1

---

### Chapter II-2. 트랜잭션, SAVEPOINT, PRAGMA

#### II-2-1. 트랜잭션과 SAVEPOINT — 부분 롤백까지

- **난이도**: ★★★
- **선수 지식**: II-1-2, I-1-2
- **학습 목표**: 이 Section을 마치면 BEGIN/COMMIT/ROLLBACK과 SAVEPOINT로 "중첩 트랜잭션처럼" 부분 롤백하는 방법을 작성할 수 있다.
- **설명**: BEGIN으로 시작한 트랜잭션은 COMMIT으로 확정하거나 ROLLBACK으로 전부 취소한다. 그런데 100단계 작업 중 5번째만 취소하고 싶다면? SAVEPOINT를 찍어두고 ROLLBACK TO savepoint_name으로 부분만 되돌릴 수 있다. SQLite는 "중첩 트랜잭션"을 SAVEPOINT로 흉내 낸다.
- **핵심 키워드**: [BEGIN, COMMIT, ROLLBACK, SAVEPOINT, RELEASE, 부분 롤백]
- **시각화 연결**: `chapter-ii-2-1.html` (BEGIN → SAVEPOINT × 3 → 부분 ROLLBACK 5단계)
- **다음 섹션**: II-2-2

#### II-2-2. PRAGMA — 런타임으로 SQLite 동작 바꾸기

- **난이도**: ★★★
- **선수 지식**: II-2-1
- **학습 목표**: 이 Section을 마치면 자주 쓰이는 PRAGMA 5종(journal_mode, synchronous, foreign_keys, busy_timeout, cache_size)이 무엇을 바꾸는지 설명하고, 안전·성능 트레이드오프를 결정할 수 있다.
- **설명**: PRAGMA는 SQL이 아니라 "SQLite에게 직접 거는 설정 명령"이다. `PRAGMA journal_mode=WAL`로 동시성을 끌어올리고, `PRAGMA foreign_keys=ON`으로 외래키 강제 검사를 켜고, `PRAGMA busy_timeout=5000`으로 락 충돌 시 자동 대기를 켠다. 한 줄로 동작 자체가 바뀐다.
- **핵심 키워드**: [PRAGMA, journal_mode, synchronous, foreign_keys, busy_timeout, cache_size]
- **시각화 연결**: `chapter-ii-2-2.html` (PRAGMA 5종 적용 전후 비교 5단계)
- **다음 섹션**: III-1-1 (Phase 2)

---

## 다음 단계 (Phase 2)

- **Part III. 인덱스와 쿼리 플랜**: B-tree 인덱스의 내부, Covering Index로 디스크 I/O 줄이기, EXPLAIN QUERY PLAN/ANALYZE 읽는 법.
- **Part IV. WAL과 동시성**: WAL 모드와 Rollback Journal의 본질적 차이, busy_timeout/락/checkpoint 운영.
- **Part V. 실전 활용**: 앱 내장(모바일/데스크톱), 백업/restore, ORM(SQLAlchemy/Prisma) 비교, JSON1 확장으로 NoSQL처럼 쓰기.
