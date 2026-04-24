# PostgreSQL 사다리형 학습 커리큘럼

> 비개발자부터 실무자까지, 한 권으로 올라가는 PostgreSQL 학습 자료.

이 자료는 PostgreSQL 공식 문서와 두꺼운 기술서와 다르게 **"아는 만큼 읽고, 필요한 만큼만 깊이 들어가도 되는"** 사다리형 구조로 짜여 있다. 데이터베이스를 처음 접하는 비개발자가 Part I부터 읽어도 막히지 않게 만들었고, 이미 SQL을 쓰는 주니어가 Part IV 이후만 발췌해 참고해도 가치가 있게 썼다.

전체 구성은 **설계도(상세 목차) + 인터랙티브 시각화**다. 각 Section은 한 꼭지의 학습 단위이며, 필요한 곳에는 `index.html`과 같은 **단계별 애니메이션 시각화**가 짝을 이뤄, 글 대신 움직이는 그림으로 개념을 체득할 수 있도록 설계되어 있다.

---

## 읽기 가이드

### 난이도 범례

| 표기 | 독자 | 설명 |
|:--|:--|:--|
| **★☆☆** | 비개발자 | 코딩 경험 없음. 컴퓨터 기본 사용 가능 |
| **★★☆** | 코딩 입문 | SQL 기초(SELECT/INSERT)를 본 적 있음 |
| **★★★** | 주니어 | SQL + 트랜잭션 + Git 실전 경험, 실무 투입 준비 |

### 독자별 추천 경로

- **처음 DB를 배우는 분** → Part I → Part II → Part III → Part III-B → Part III-C → Part IV (천천히)
- **SQL은 알지만 PostgreSQL은 처음** → Part III → Part III-B → Part IV → Part IV-B → 필요 시 Part II
- **PostgreSQL 실무 투입 준비 중** → Part IV → Part IV-B → Part V → Part VI → Part VI-B → Part VII
- **데이터 분석/API 개발 중심** → Part III-C → Part IV-B (윈도우 함수) → Part VI-B (JSON·검색·벡터)

### Section 양식 (공통)

각 Section은 아래 7개 필드를 갖는다.

- **난이도**: ★☆☆ / ★★☆ / ★★★
- **선수 지식**: 먼저 읽어두면 좋은 이전 Section
- **학습 목표**: "이 Section을 마치면 ...할 수 있다"
- **설명**: 2~3줄 핵심 요약 (비유 중심)
- **핵심 키워드**: 이 Section의 기억해둘 개념 목록
- **시각화 연결**: 관련 `index.html` 시각화 또는 향후 구현 예정
- **다음 섹션**: 다음 번호

### 번호 규칙

`Part-Chapter-Section` (예: `IV-1-1` = Part IV, Chapter 1, Section 1).  
`postgres/index.html`(SQL 쿼리 실행 파이프라인 시각화)은 이 커리큘럼의 **IV-1-1**에 해당한다.

---

## 전체 목차

### Part I. 왜 DB가 필요한가 (★☆☆)
- Chapter I-1. 데이터를 저장한다는 것
- Chapter I-2. 파일로 저장하면 안 되나?
- Chapter I-3. 데이터베이스가 해결하는 문제들

### Part II. RDB 개론 (★☆☆~★★☆)
- Chapter II-1. 관계형 데이터베이스(RDB)란
- Chapter II-2. MySQL / Oracle / PostgreSQL 비교

### Part III. PostgreSQL 첫 걸음 (★★☆)
- Chapter III-1. 설치와 첫 접속
- Chapter III-2. 기본 SQL 작성하기
- Chapter III-3. psql 도구 활용

### Part III-B. 데이터 타입과 제약 조건 (★★☆) — 신규
- Chapter III-B-1. 타입 레퍼런스
- Chapter III-B-2. 타입 변환과 제약 조건

### Part III-C. 실전 쿼리 패턴 (★★☆) — 신규
- Chapter III-C-1. 조건 검색과 정렬
- Chapter III-C-2. 집합 연산과 UPSERT

### Part IV. SQL 코어 개념 (★★☆~★★★)
- Chapter IV-1. 쿼리가 실행되는 방식
- Chapter IV-2. 조인과 집계
- Chapter IV-3. 서브쿼리와 CTE
- Chapter IV-4. 뷰와 함수

### Part IV-B. 고급 SQL (★★★) — 신규
- Chapter IV-B-1. 윈도우 함수
- Chapter IV-B-2. 고급 집계와 조인

### Part V. 트랜잭션·인덱스·성능 (★★★)
- Chapter V-1. 트랜잭션과 ACID
- Chapter V-2. 인덱스 설계
- Chapter V-3. 쿼리 성능 분석

### Part VI. 실전 스키마 설계 (★★★)
- Chapter VI-1. 정규화와 역정규화
- Chapter VI-2. 실전 스키마 예시

### Part VI-B. JSON·검색·벡터 (★★★) — 신규
- Chapter VI-B-1. JSONB 완전 가이드
- Chapter VI-B-2. 전문 검색과 벡터

### Part VII. 복제·백업·모니터링 (★★★)
- Chapter VII-1. 백업과 복구
- Chapter VII-2. 복제와 고가용성
- Chapter VII-3. 모니터링과 운영

---

## Part I. 왜 DB가 필요한가 (★☆☆)

데이터베이스(Database)는 "정보를 체계적으로 저장하는 창고"다. 이 Part에서는 왜 단순한 파일 대신 데이터베이스가 필요한지, 어떤 문제를 해결하는지를 비유 중심으로 알아본다.

> 본문 1원고: [docs/book/part-1.md](docs/book/part-1.md) (4 Section, 약 1750~1950자/Section)

---

### Chapter I-1. 데이터를 저장한다는 것

#### I-1-1. 데이터와 정보의 차이

- **난이도**: ★☆☆
- **선수 지식**: 없음
- **학습 목표**: 이 섹션을 마치면 데이터(Data)와 정보(Information)의 차이를 말할 수 있다.
- **설명**: 데이터는 "원재료"(숫자, 문자)이고, 정보는 "의미 있는 해석"이다. 예를 들어 "25"는 데이터이고, "Alice의 나이: 25세"는 정보다. 데이터베이스는 원재료를 구조화해 정보로 꺼낼 수 있게 해준다.
- **핵심 키워드**: [데이터, 정보, 구조화, 레코드(record)]
- **시각화 연결**: `chapter-i-1-1.html` (데이터→정보 변환 애니메이션)
- **다음 섹션**: I-1-2

#### I-1-2. 컴퓨터가 데이터를 기억하는 방법

- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: 이 섹션을 마치면 RAM(임시 기억)과 디스크(영구 기억)의 차이를 설명할 수 있다.
- **설명**: RAM은 빠르지만 전원이 꺼지면 사라지는 "칠판"이고, 디스크는 느리지만 영구 보관하는 "노트"다. 데이터베이스는 디스크에 데이터를 안전하게 기록하고, RAM(버퍼)을 활용해 속도를 높인다.
- **핵심 키워드**: [RAM, 디스크(disk), 영속성(persistence), 버퍼(buffer)]
- **시각화 연결**: `chapter-i-1-2.html` (RAM↔디스크 데이터 흐름, 전원 OFF 시뮬레이션)
- **다음 섹션**: I-2-1

---

### Chapter I-2. 파일로 저장하면 안 되나?

#### I-2-1. 텍스트 파일과 CSV의 한계

- **난이도**: ★☆☆
- **선수 지식**: I-1-2
- **학습 목표**: 이 섹션을 마치면 CSV 파일 방식의 3가지 한계(동시 접근, 검색 속도, 일관성)를 설명할 수 있다.
- **설명**: 엑셀 파일 하나에 100만 명의 고객을 저장하면 두 사람이 동시에 수정할 때 데이터가 뒤섞인다. 원하는 한 명을 찾으려면 전체를 다 읽어야 한다. 데이터베이스는 이 세 가지 문제를 체계적으로 해결한다.
- **핵심 키워드**: [동시성(concurrency), 순차 탐색(sequential scan), 데이터 일관성(consistency)]
- **시각화 연결**: `chapter-i-2-1.html` (CSV 동시 수정 충돌, 순차 탐색, 일관성 문제 시뮬레이션)
- **다음 섹션**: I-2-2

#### I-2-2. 데이터베이스가 해결하는 것

- **난이도**: ★☆☆
- **선수 지식**: I-2-1
- **학습 목표**: 이 섹션을 마치면 DBMS가 제공하는 4가지 핵심 기능(저장, 검색, 동시 접근 제어, 복구)을 나열할 수 있다.
- **설명**: DBMS(Database Management System, 데이터베이스 관리 시스템)는 도서관 사서와 같다. 책(데이터)을 분류해 정리하고, 여러 사람이 동시에 찾아도 충돌 없이 빌려주며, 화재(장애) 시에도 기록을 복구한다.
- **핵심 키워드**: [DBMS, 저장(storage), 검색(query), 동시 접근 제어(concurrency control), 복구(recovery)]
- **시각화 연결**: `chapter-i-2-2.html` (DBMS 4대 기능 도서관 사서 애니메이션)
- **다음 섹션**: II-1-1

---

## Part II. RDB 개론 (★☆☆~★★☆)

관계형 데이터베이스(Relational Database, RDB)의 기본 개념과 PostgreSQL이 다른 DB와 어떻게 다른지를 살펴본다.

> 본문 1원고: [docs/book/part-2.md](docs/book/part-2.md) (3 Section, 약 1650~2100자/Section)

---

### Chapter II-1. 관계형 데이터베이스(RDB)란

#### II-1-1. 테이블, 행, 열 — 엑셀처럼 생각하기

- **난이도**: ★☆☆
- **선수 지식**: I-2-2
- **학습 목표**: 이 섹션을 마치면 테이블(table), 행(row), 열(column)의 개념을 말하고, 간단한 테이블 구조를 그릴 수 있다.
- **설명**: RDB는 데이터를 행과 열로 이루어진 "표(table)"에 저장한다. 엑셀 시트와 비슷하지만, 여러 표(테이블)가 서로 연결(관계, relation)될 수 있다는 점이 핵심이다.
- **핵심 키워드**: [테이블(table), 행(row/tuple), 열(column/attribute), 관계(relation), 기본키(primary key)]
- **시각화 연결**: `chapter-ii-1-1.html` (테이블/행/열/기본키/SQL 단계별 애니메이션)
- **다음 섹션**: II-1-2

#### II-1-2. 외래키(FK)와 테이블 간 관계

- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: 이 섹션을 마치면 외래키(Foreign Key)를 사용해 두 테이블을 연결하는 구조를 설명할 수 있다.
- **설명**: 주문 테이블에 "고객 번호"를 넣어 고객 테이블과 연결하는 것이 외래키다. 도서관 대출 기록에 "도서관 카드 번호"를 적어두는 것과 같다. 이 연결 덕분에 JOIN(조인)으로 두 테이블을 합쳐 볼 수 있다.
- **핵심 키워드**: [외래키(foreign key), 참조 무결성(referential integrity), JOIN, 1:N 관계]
- **시각화 연결**: `chapter-ii-1-2.html` (외래키 연결, 참조 무결성, 1:N 관계, JOIN 애니메이션)
- **다음 섹션**: II-2-1

---

### Chapter II-2. MySQL / Oracle / PostgreSQL 비교

#### II-2-1. RDB 제품 지도

- **난이도**: ★★☆
- **선수 지식**: II-1-2
- **학습 목표**: 이 섹션을 마치면 MySQL, Oracle, PostgreSQL의 핵심 차이점과 선택 기준을 설명할 수 있다.
- **설명**: MySQL은 웹 서비스에서 가장 많이 쓰이는 빠른 RDB고, Oracle은 기업 금융권에서 선호하는 상용 DB다. PostgreSQL(Postgres)은 오픈소스이면서 SQL 표준 준수도와 확장성이 뛰어나 복잡한 쿼리와 JSON 처리에 강하다.
- **핵심 키워드**: [MySQL, Oracle, PostgreSQL, 오픈소스(open source), SQL 표준(SQL standard), JSONB]
- **시각화 연결**: `chapter-ii-2-1.html` (MySQL/Oracle/PostgreSQL 비교, SQL 동일성, 선택 기준 애니메이션)
- **다음 섹션**: III-1-1

---

## Part III. PostgreSQL 첫 걸음 (★★☆)

PostgreSQL을 직접 설치하고, psql 도구로 접속하며, 기본 SQL을 작성해 본다.

> 본문 1원고: [docs/book/part-3.md](docs/book/part-3.md) (5 Section, 약 1800~2000자/Section)

---

### Chapter III-1. 설치와 첫 접속

#### III-1-1. PostgreSQL 설치 (Windows / macOS / Linux)

- **난이도**: ★★☆
- **선수 지식**: II-2-1
- **학습 목표**: 이 섹션을 마치면 자신의 운영체제에 PostgreSQL을 설치하고 서버를 실행할 수 있다.
- **설명**: Windows는 공식 인스톨러(EDB), macOS는 Homebrew(`brew install postgresql@16`), Linux(Ubuntu)는 apt 패키지를 사용한다. 설치 후 `pg_isready` 명령으로 서버가 실행 중인지 확인한다.
- **핵심 키워드**: [PostgreSQL 16, EDB 인스톨러, Homebrew, apt, pg_isready, postgres 슈퍼유저]
- **시각화 연결**: `chapter-iii-1-1.html` (OS별 설치 과정 터미널 시뮬레이션, pg_isready 확인)
- **다음 섹션**: III-1-2

#### III-1-2. psql로 첫 접속

- **난이도**: ★★☆
- **선수 지식**: III-1-1
- **학습 목표**: 이 섹션을 마치면 psql 명령줄 도구로 로컬 PostgreSQL에 접속하고 `\l`, `\dt` 같은 메타 커맨드를 사용할 수 있다.
- **설명**: `psql -U postgres`로 접속하면 SQL과 `\` 시작 메타 커맨드를 모두 사용할 수 있다. `\l`은 데이터베이스 목록, `\c mydb`는 데이터베이스 전환, `\dt`는 테이블 목록을 보여준다.
- **핵심 키워드**: [psql, 메타 커맨드(meta-command), \l, \dt, \c, \q, connection string]
- **시각화 연결**: `chapter-iii-1-2.html` (psql 접속, 메타 커맨드 실행 시뮬레이션)
- **다음 섹션**: III-2-1

---

### Chapter III-2. 기본 SQL 작성하기

#### III-2-1. 테이블 생성과 데이터 삽입

- **난이도**: ★★☆
- **선수 지식**: III-1-2
- **학습 목표**: 이 섹션을 마치면 `CREATE TABLE`, `INSERT INTO`, `SELECT` 문을 작성하고 실행할 수 있다.
- **설명**: `CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT, age INT);`로 테이블을 만들고, `INSERT INTO users VALUES (DEFAULT, 'Alice', 30);`으로 행을 추가한다. `SERIAL`은 PostgreSQL의 자동 증가 정수 타입이다.
- **핵심 키워드**: [CREATE TABLE, INSERT INTO, SERIAL, PRIMARY KEY, TEXT, INT, SELECT]
- **시각화 연결**: `chapter-iii-2-1.html` (CREATE TABLE → INSERT → SELECT 단계별 시뮬레이션)
- **다음 섹션**: III-2-2

#### III-2-2. 데이터 수정과 삭제

- **난이도**: ★★☆
- **선수 지식**: III-2-1
- **학습 목표**: 이 섹션을 마치면 `UPDATE`, `DELETE`, `WHERE` 절을 올바르게 사용할 수 있다.
- **설명**: `UPDATE users SET age = 31 WHERE name = 'Alice';`처럼 WHERE 절 없이 UPDATE나 DELETE를 실행하면 전체 행이 바뀌거나 삭제된다. "WHERE 없는 UPDATE는 핵폭탄"이라고 기억하자.
- **핵심 키워드**: [UPDATE, DELETE, WHERE, 조건절, 전체 행 수정 위험]
- **시각화 연결**: `chapter-iii-2-2.html` (UPDATE/DELETE 안전 습관 + WHERE 없는 위험 체험)
- **다음 섹션**: III-3-1

---

### Chapter III-3. psql 도구 활용

#### III-3-1. psql 생산성 높이기

- **난이도**: ★★☆
- **선수 지식**: III-2-2
- **학습 목표**: 이 섹션을 마치면 psql의 `\e`(외부 편집기 연동), `\timing`, `\copy` 같은 유용한 기능을 사용할 수 있다.
- **설명**: `\timing on`으로 쿼리 실행 시간을 측정할 수 있다. `\e`는 시스템 편집기(vim, nano)를 열어 긴 쿼리를 편리하게 작성하게 해준다. `\copy`는 CSV 파일을 테이블에 빠르게 올리는 명령이다.
- **핵심 키워드**: [psql, \timing, \e, \copy, .psqlrc, 편집기 연동]
- **시각화 연결**: `chapter-iii-3-1.html` (\\timing, \\e, \\copy, .psqlrc 생산성 도구 시뮬레이션)
- **다음 섹션**: III-B-1-1

---

## Part III-B. 데이터 타입과 제약 조건 (★★☆) — 신규

> 본문 1원고: [docs/book/part-3b.md](docs/book/part-3b.md) (6 Section, 약 1800~2100자/Section)

CREATE TABLE을 쓸 때 INT, TEXT, TIMESTAMP 중 뭘 골라야 하는지, 타입을 변환하는 방법, 제약 조건으로 잘못된 데이터를 막는 방법을 다룬다. 비개발자가 실전에서 가장 먼저 부딪히는 영역이다.

---

### Chapter III-B-1. 타입 레퍼런스

#### III-B-1-1. 숫자 타입: INT, NUMERIC, FLOAT

- **난이도**: ★★☆
- **선수 지식**: III-2-1
- **학습 목표**: 이 섹션을 마치면 INTEGER, BIGINT, NUMERIC, FLOAT의 차이를 설명하고 용도에 맞는 타입을 선택할 수 있다.
- **설명**: INTEGER는 일반 정수(-21억~21억), BIGINT는 큰 정수, SMALLINT는 작은 정수다. NUMERIC(precision, scale)은 소수점까지 정밀하게 저장해 금액 계산에 적합하다. FLOAT/DOUBLE PRECISION은 과학 계산용 근사값이라 돈 계산에 쓰면 안 된다. "돈은 NUMERIC, 좌표는 FLOAT"로 기억한다.
- **핵심 키워드**: [INTEGER, BIGINT, SMALLINT, NUMERIC, FLOAT, DOUBLE PRECISION, 정밀도(precision), 스케일(scale)]
- **시각화 연결**: `chapter-iii-b-1-1.html` (NUMERIC vs FLOAT 오차 비교 6단계)
- **다음 섹션**: III-B-1-2

#### III-B-1-2. 문자 타입: TEXT, VARCHAR, CHAR

- **난이도**: ★★☆
- **선수 지식**: III-B-1-1
- **학습 목표**: 이 섹션을 마치면 TEXT, VARCHAR(n), CHAR(n)의 차이를 설명하고, 실무에서 TEXT를 기본으로 쓰는 이유를 이야기할 수 있다.
- **설명**: PostgreSQL에서 TEXT와 VARCHAR는 내부적으로 거의 동일하다. VARCHAR(n)은 길이 제한이 있고 TEXT는 없다. CHAR(n)은 고정 길이로 빈 자리를 공백으로 채운다. 실무에서는 TEXT를 기본으로 쓰고, 길이 제한이 정말 필요할 때만 VARCHAR(n) 또는 CHECK 제약으로 제한한다.
- **핵심 키워드**: [TEXT, VARCHAR, CHAR, 문자 인코딩, 콜레이션(collation)]
- **시각화 연결**: 해당 없음
- **다음 섹션**: III-B-1-3

#### III-B-1-3. 날짜와 시간: TIMESTAMP, DATE, TIME, INTERVAL

- **난이도**: ★★☆
- **선수 지식**: III-B-1-2
- **학습 목표**: 이 섹션을 마치면 TIMESTAMP vs TIMESTAMPTZ의 차이를 설명하고, INTERVAL로 날짜 연산을 수행할 수 있다.
- **설명**: TIMESTAMP은 타임존 없이 날짜+시간을 저장한다. TIMESTAMPTZ는 타임존 정보를 포함해 서버 시간대와 무관하게 정확한 시각을 표현한다. 실무에서는 거의 항상 TIMESTAMPTZ를 써야 한다. DATE는 날짜만, TIME은 시간만 저장한다. INTERVAL은 '3 days', '2 hours 30 minutes'처럼 기간을 표현하며 날짜 연산에 사용한다. NOW(), CURRENT_DATE, AGE() 같은 함수를 함께 다룬다.
- **핵심 키워드**: [TIMESTAMP, TIMESTAMPTZ, DATE, TIME, INTERVAL, NOW(), CURRENT_DATE, AGE(), 타임존]
- **시각화 연결**: `chapter-iii-b-1-3.html` (TIMESTAMP vs TIMESTAMPTZ 타임존 시뮬레이션 6단계)
- **다음 섹션**: III-B-1-4

#### III-B-1-4. 그 외 타입: BOOLEAN, UUID, ENUM

- **난이도**: ★★☆
- **선수 지식**: III-B-1-3
- **학습 목표**: 이 섹션을 마치면 BOOLEAN, UUID, ENUM 타입을 올바르게 사용하고 각각의 장단점을 설명할 수 있다.
- **설명**: BOOLEAN은 TRUE/FALSE/NULL 세 가지 값을 갖는다. UUID는 전역적으로 고유한 128비트 식별자로 분산 환경에 적합하다. ENUM은 제한된 값 목록(예: 'pending', 'active', 'deleted')을 타입으로 정의한다. ENUM은 편리하지만 값을 추가하거나 순서를 바꾸기 어렵다는 단점이 있어, 실무에서는 CHECK 제약이나 참조 테이블을 대안으로 고려한다.
- **핵심 키워드**: [BOOLEAN, TRUE, FALSE, UUID, gen_random_uuid(), ENUM, CREATE TYPE, 도메인 타입(domain type)]
- **시각화 연결**: 해당 없음
- **다음 섹션**: III-B-2-1

---

### Chapter III-B-2. 타입 변환과 제약 조건

#### III-B-2-1. 타입 캐스팅과 변환

- **난이도**: ★★☆
- **선수 지식**: III-B-1-4
- **학습 목표**: 이 섹션을 마치면 `::` 연산자와 `CAST()`로 타입을 변환하고, 흔한 타입 불일치 에러를 해결할 수 있다.
- **설명**: PostgreSQL은 타입이 엄격해서 '123'(TEXT)과 123(INTEGER)을 직접 비교하면 에러가 난다. `'123'::int`나 `CAST('123' AS int)`로 명시적 변환을 해야 한다. 암묵적 변환이 되는 경우와 안 되는 경우를 구분하고, 실무에서 자주 만나는 에러 패턴과 해결법을 다룬다.
- **핵심 키워드**: [타입 캐스팅(type casting), :: 연산자, CAST(), 암묵적 변환, 명시적 변환, to_char(), to_date(), to_number()]
- **시각화 연결**: 해당 없음
- **다음 섹션**: III-B-2-2

#### III-B-2-2. 제약 조건 완전 가이드

- **난이도**: ★★☆
- **선수 지식**: III-B-2-1
- **학습 목표**: 이 섹션을 마치면 NOT NULL, DEFAULT, CHECK, UNIQUE, EXCLUSION 제약 조건을 테이블에 적용하고 이름을 붙여 관리할 수 있다.
- **설명**: 제약 조건은 잘못된 데이터가 테이블에 들어오는 것을 데이터베이스 수준에서 막는 장치다. NOT NULL은 빈 값 금지, DEFAULT는 기본값 자동 채우기, CHECK는 조건 검사, UNIQUE는 중복 방지, EXCLUSION은 범위 겹침 방지다. 제약 조건에 이름을 붙이면(`CONSTRAINT chk_age CHECK (age >= 0)`) 에러 메시지가 명확해지고 나중에 수정/삭제가 쉬워진다.
- **핵심 키워드**: [NOT NULL, DEFAULT, CHECK, UNIQUE, EXCLUSION, CONSTRAINT, ALTER TABLE ADD/DROP CONSTRAINT]
- **시각화 연결**: `chapter-iii-b-2-2.html` (제약 조건 위반 시뮬레이션 6단계)
- **다음 섹션**: III-C-1-1

---

## Part III-C. 실전 쿼리 패턴 (★★☆) — 신규

> 본문 1원고: [docs/book/part-3c.md](docs/book/part-3c.md) (5 Section, 약 2100~2400자/Section)

SELECT로 데이터를 가져올 때 정렬, 필터링, NULL 처리, 중복 제거, 충돌 처리까지 — 실무에서 매일 쓰는 쿼리 패턴을 집중적으로 다룬다.

---

### Chapter III-C-1. 조건 검색과 정렬

#### III-C-1-1. 정렬과 페이지네이션: ORDER BY, LIMIT, OFFSET

- **난이도**: ★★☆
- **선수 지식**: III-B-2-2
- **학습 목표**: 이 섹션을 마치면 ORDER BY로 정렬하고 LIMIT/OFFSET으로 페이지네이션을 구현할 수 있다. 대용량 테이블에서 OFFSET의 성능 문제를 설명할 수 있다.
- **설명**: ORDER BY는 ASC(오름차순, 기본값)와 DESC(내림차순)로 결과를 정렬한다. 여러 열로 정렬할 수 있다(`ORDER BY dept ASC, salary DESC`). LIMIT은 반환 행 수 제한, OFFSET은 건너뛸 행 수다. LIMIT/OFFSET 조합으로 페이지네이션을 구현하지만, OFFSET이 크면 느려진다(커서 기반 페이지네이션 대안 소개).
- **핵심 키워드**: [ORDER BY, ASC, DESC, NULLS FIRST, NULLS LAST, LIMIT, OFFSET, 커서 기반 페이지네이션]
- **시각화 연결**: `chapter-iii-c-1-1.html` (OFFSET vs 커서 기반 페이지네이션 성능 비교 5단계)
- **다음 섹션**: III-C-1-2

#### III-C-1-2. 조건 검색: LIKE, IN, BETWEEN, IS NULL

- **난이도**: ★★☆
- **선수 지식**: III-C-1-1
- **학습 목표**: 이 섹션을 마치면 패턴 매칭(LIKE), 목록 검색(IN), 범위 검색(BETWEEN), NULL 검사(IS NULL)를 올바르게 사용할 수 있다.
- **설명**: `LIKE '%keyword%'`는 패턴 매칭(%는 임의 문자열, _는 한 글자). ILIKE는 대소문자 무시 버전. `IN (1, 2, 3)`은 목록 중 하나와 일치하는 행. `BETWEEN 10 AND 20`은 범위 검색(양쪽 포함). NULL은 = 로 비교할 수 없고 반드시 `IS NULL` / `IS NOT NULL`을 써야 한다. `WHERE age = NULL`은 항상 결과가 없다 — 가장 흔한 초보자 실수다.
- **핵심 키워드**: [LIKE, ILIKE, %, _, IN, BETWEEN, IS NULL, IS NOT NULL, 패턴 매칭]
- **시각화 연결**: `chapter-iii-c-1-2.html` (LIKE/IN/BETWEEN/IS NULL 필터링 시각화 5단계)
- **다음 섹션**: III-C-1-3

#### III-C-1-3. NULL 다루기: COALESCE, NULLIF, IS DISTINCT FROM

- **난이도**: ★★☆
- **선수 지식**: III-C-1-2
- **학습 목표**: 이 섹션을 마치면 NULL의 3값 논리를 이해하고 COALESCE, NULLIF, IS DISTINCT FROM을 실전에서 사용할 수 있다.
- **설명**: SQL의 NULL은 "값 없음"이다. TRUE/FALSE가 아닌 UNKNOWN이라는 세 번째 논리값을 만든다. `NULL + 1 = NULL`, `NULL = NULL`은 FALSE가 아니라 UNKNOWN이다. COALESCE(a, b, c)는 첫 번째 NULL이 아닌 값을 반환한다(기본값 패턴). NULLIF(a, b)는 a=b이면 NULL을 반환한다(0으로 나누기 방지). IS DISTINCT FROM은 NULL까지 포함해 안전하게 비교한다.
- **핵심 키워드**: [NULL, 3값 논리(three-valued logic), COALESCE, NULLIF, IS DISTINCT FROM, IS NOT DISTINCT FROM]
- **시각화 연결**: `chapter-iii-c-1-3.html` (3값 논리 진리표 + COALESCE 흐름 6단계)
- **다음 섹션**: III-C-2-1

---

### Chapter III-C-2. 집합 연산과 UPSERT

#### III-C-2-1. DISTINCT와 집합 연산: UNION, INTERSECT, EXCEPT

- **난이도**: ★★☆
- **선수 지식**: III-C-1-3
- **학습 목표**: 이 섹션을 마치면 DISTINCT로 중복을 제거하고, UNION/INTERSECT/EXCEPT로 두 쿼리 결과를 합치거나 비교할 수 있다.
- **설명**: SELECT DISTINCT는 결과에서 중복 행을 제거한다. UNION은 두 SELECT 결과를 합친다(중복 제거). UNION ALL은 중복을 유지해 더 빠르다. INTERSECT는 교집합, EXCEPT는 차집합이다. 두 SELECT의 열 수와 타입이 일치해야 사용할 수 있다.
- **핵심 키워드**: [DISTINCT, UNION, UNION ALL, INTERSECT, EXCEPT, 집합 연산]
- **시각화 연결**: 해당 없음
- **다음 섹션**: III-C-2-2

#### III-C-2-2. UPSERT와 RETURNING

- **난이도**: ★★☆
- **선수 지식**: III-C-2-1
- **학습 목표**: 이 섹션을 마치면 ON CONFLICT로 중복 INSERT를 처리하고, RETURNING으로 변경된 행을 즉시 반환받을 수 있다.
- **설명**: `INSERT ... ON CONFLICT DO UPDATE`(UPSERT)는 "없으면 삽입, 있으면 갱신" 패턴이다. `ON CONFLICT DO NOTHING`은 충돌 시 무시한다. RETURNING은 INSERT/UPDATE/DELETE 뒤에 붙여 변경된 행을 SELECT처럼 반환한다. 별도 SELECT 없이 방금 삽입/수정한 데이터를 바로 받을 수 있어 API 개발에서 매우 유용하다.
- **핵심 키워드**: [INSERT ON CONFLICT, DO UPDATE, DO NOTHING, UPSERT, RETURNING, excluded]
- **시각화 연결**: 해당 없음
- **다음 섹션**: IV-1-1

---

## Part IV. SQL 코어 개념 (★★☆~★★★)

SELECT 문 하나가 실행되는 내부 과정부터 조인, 집계, 서브쿼리까지 SQL의 핵심 개념을 정확히 이해한다.

> 본문 1원고: [docs/book/part-4.md](docs/book/part-4.md) (7 Section, 약 2000~2400자/Section)

---

### Chapter IV-1. 쿼리가 실행되는 방식

#### IV-1-1. SQL 쿼리 실행 파이프라인

- **난이도**: ★★☆
- **선수 지식**: III-3-1
- **학습 목표**: 이 섹션을 마치면 SQL이 Parser → Planner/Optimizer → Executor → Storage Manager를 거쳐 실행되는 흐름을 설명할 수 있다.
- **설명**: SQL은 텍스트 명령이지만 PostgreSQL 내부에서 4단계 파이프라인을 통과한다. Parser가 문법을 검사해 파스 트리를 만들고, Optimizer가 가장 빠른 실행 계획을 선택하며, Executor가 행을 가져오고, Storage Manager가 디스크 I/O를 담당한다.
- **핵심 키워드**: [Parser, Planner/Optimizer, Executor, Storage Manager, 파스 트리(parse tree), 실행 계획(execution plan)]
- **시각화 연결**: `index.html` (SQL 쿼리 실행 파이프라인 — 6단계 애니메이션)
- **다음 섹션**: IV-1-2

#### IV-1-2. EXPLAIN과 실행 계획 읽기

- **난이도**: ★★★
- **선수 지식**: IV-1-1
- **학습 목표**: 이 섹션을 마치면 `EXPLAIN ANALYZE` 출력을 읽고 Sequential Scan vs Index Scan을 구분할 수 있다.
- **설명**: `EXPLAIN SELECT * FROM users WHERE age > 25;`를 실행하면 Optimizer가 선택한 계획이 텍스트 트리로 출력된다. `cost=0.00..8.56 rows=100`처럼 예상 비용과 행 수를 보여주며, `ANALYZE` 옵션을 붙이면 실제 실행 후 실측값도 함께 표시된다.
- **핵심 키워드**: [EXPLAIN, EXPLAIN ANALYZE, Sequential Scan, Index Scan, cost, rows, actual time]
- **시각화 연결**: `chapter-iv-1-2.html` (EXPLAIN 출력 읽기, Seq Scan vs Index Scan 비교)
- **다음 섹션**: IV-2-1

---

### Chapter IV-2. 조인과 집계

#### IV-2-1. JOIN 완전 정복

- **난이도**: ★★☆
- **선수 지식**: IV-1-2
- **학습 목표**: 이 섹션을 마치면 INNER JOIN, LEFT JOIN, RIGHT JOIN의 차이를 설명하고 올바른 상황에 적용할 수 있다.
- **설명**: INNER JOIN은 두 테이블에 모두 일치하는 행만 반환한다. LEFT JOIN은 왼쪽 테이블의 행을 모두 유지하고, 오른쪽에 일치하는 행이 없으면 NULL을 채운다. 벤 다이어그램으로 시각화하면 직관적으로 이해된다.
- **핵심 키워드**: [INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, ON, NULL, 벤 다이어그램]
- **시각화 연결**: `chapter-iv-2-1.html` (INNER/LEFT/RIGHT/FULL JOIN 벤 다이어그램 + 결과 비교)
- **다음 섹션**: IV-2-2

#### IV-2-2. GROUP BY와 집계 함수

- **난이도**: ★★☆
- **선수 지식**: IV-2-1
- **학습 목표**: 이 섹션을 마치면 COUNT, SUM, AVG와 GROUP BY, HAVING을 올바르게 사용할 수 있다.
- **설명**: `SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;`는 부서별 직원 수 중 5명 초과인 부서만 보여준다. WHERE는 그룹 전 행을 필터링하고, HAVING은 그룹 후 집계 결과를 필터링한다는 차이가 핵심이다.
- **핵심 키워드**: [GROUP BY, HAVING, COUNT, SUM, AVG, MAX, MIN, 집계 함수(aggregate function)]
- **시각화 연결**: `chapter-iv-2-2.html` (GROUP BY + 집계 함수 + WHERE vs HAVING 실행 순서)
- **다음 섹션**: IV-3-1

---

### Chapter IV-3. 서브쿼리와 CTE

#### IV-3-1. 서브쿼리(Subquery)

- **난이도**: ★★★
- **선수 지식**: IV-2-2
- **학습 목표**: 이 섹션을 마치면 스칼라 서브쿼리, IN 서브쿼리, EXISTS 서브쿼리를 올바른 상황에 사용할 수 있다.
- **설명**: 서브쿼리는 "쿼리 안에 쿼리"다. `WHERE id IN (SELECT user_id FROM orders WHERE amount > 100)`처럼 동적 조건을 만들 수 있다. 그러나 상관 서브쿼리(correlated subquery)는 행마다 반복 실행되므로 성능 주의가 필요하다.
- **핵심 키워드**: [서브쿼리(subquery), 스칼라 서브쿼리, IN, EXISTS, 상관 서브쿼리(correlated subquery)]
- **시각화 연결**: `chapter-iv-3-1.html` (스칼라/IN/EXISTS/상관 서브쿼리 유형별 SQL 코드)
- **다음 섹션**: IV-3-2

#### IV-3-2. CTE (Common Table Expression)

- **난이도**: ★★★
- **선수 지식**: IV-3-1
- **학습 목표**: 이 섹션을 마치면 `WITH` 절로 CTE를 작성하고 복잡한 쿼리를 가독성 있게 분리할 수 있다.
- **설명**: CTE는 쿼리 안에서 임시 이름을 붙인 결과 집합이다. `WITH high_value_users AS (SELECT * FROM users WHERE spend > 1000) SELECT * FROM high_value_users WHERE age > 25;`처럼 단계를 분리해 읽기 쉽게 만든다. 재귀 CTE(`WITH RECURSIVE`)로 계층 데이터도 표현할 수 있다.
- **핵심 키워드**: [CTE, WITH, WITH RECURSIVE, 재귀 쿼리, 임시 결과 집합, 가독성]
- **시각화 연결**: `chapter-iv-3-2.html` (CTE vs 서브쿼리 비교, 다중 CTE, WITH RECURSIVE)
- **다음 섹션**: IV-4-1

---

### Chapter IV-4. 뷰와 함수

#### IV-4-1. 뷰(View)

- **난이도**: ★★★
- **선수 지식**: IV-3-2
- **학습 목표**: 이 섹션을 마치면 VIEW를 생성하고 복잡한 쿼리를 재사용하는 방법을 설명할 수 있다.
- **설명**: VIEW는 자주 쓰는 SELECT 쿼리를 테이블처럼 저장해두는 "가상 테이블"이다. 뷰는 실제 데이터를 복사하지 않고 쿼리 정의만 저장한다. Materialized View는 결과를 물리적으로 저장해 빠른 조회가 필요할 때 사용한다.
- **핵심 키워드**: [VIEW, CREATE VIEW, Materialized View, REFRESH MATERIALIZED VIEW, 가상 테이블]
- **시각화 연결**: `chapter-iv-4-1.html` (VIEW vs Materialized View 비교, REFRESH)
- **다음 섹션**: IV-B-1-1

---

## Part IV-B. 고급 SQL (★★★) — 신규

> 본문 1원고: [docs/book/part-4b.md](docs/book/part-4b.md) (4 Section, 약 2050~2300자/Section)

GROUP BY와 서브쿼리를 넘어서는 고급 SQL 패턴을 다룬다. 윈도우 함수로 순위·누적합·이동평균을 계산하고, LATERAL JOIN과 Grouping Sets로 복잡한 분석 쿼리를 작성한다.

---

### Chapter IV-B-1. 윈도우 함수

#### IV-B-1-1. Window Functions 기초

- **난이도**: ★★★
- **선수 지식**: IV-2-2
- **학습 목표**: 이 섹션을 마치면 OVER(), PARTITION BY, ORDER BY를 사용해 ROW_NUMBER, RANK, DENSE_RANK를 적용할 수 있다.
- **설명**: 윈도우 함수는 GROUP BY처럼 행을 그룹으로 묶지만, 원래 행을 유지한 채 그룹 단위 계산을 추가한다. `ROW_NUMBER() OVER (ORDER BY salary DESC)`는 급여 순위를 매기되 모든 행을 그대로 보여준다. PARTITION BY는 그룹을 나누는 기준이고, ORDER BY는 그룹 안에서의 정렬이다.
- **핵심 키워드**: [윈도우 함수(window function), OVER(), PARTITION BY, ORDER BY, ROW_NUMBER, RANK, DENSE_RANK]
- **시각화 연결**: `chapter-iv-b-1-1.html` (GROUP BY vs 윈도우 함수 비교 5단계)
- **다음 섹션**: IV-B-1-2

#### IV-B-1-2. Window Functions 실전

- **난이도**: ★★★
- **선수 지식**: IV-B-1-1
- **학습 목표**: 이 섹션을 마치면 LAG, LEAD로 이전/다음 행 값을 참조하고, SUM/AVG OVER로 누적합·이동평균을 계산할 수 있다.
- **설명**: LAG(column, 1)은 이전 행의 값, LEAD(column, 1)은 다음 행의 값을 가져온다. 매출 증감 비교에 유용하다. `SUM(amount) OVER (ORDER BY date)`는 날짜순 누적합이다. `AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`는 7일 이동평균이다. ROWS BETWEEN 프레임 문법을 이해하면 다양한 분석이 가능하다.
- **핵심 키워드**: [LAG, LEAD, SUM OVER, AVG OVER, ROWS BETWEEN, PRECEDING, FOLLOWING, CURRENT ROW, 누적합, 이동평균]
- **시각화 연결**: `chapter-iv-b-1-2.html` (LAG/LEAD + 누적합 + 이동평균 라이브 계산 6단계)
- **다음 섹션**: IV-B-2-1

---

### Chapter IV-B-2. 고급 집계와 조인

#### IV-B-2-1. Grouping Sets, ROLLUP, CUBE

- **난이도**: ★★★
- **선수 지식**: IV-B-1-2
- **학습 목표**: 이 섹션을 마치면 GROUPING SETS로 여러 기준의 집계를 한 쿼리에 작성하고, ROLLUP/CUBE로 소계·총계를 자동 생성할 수 있다.
- **설명**: `GROUP BY GROUPING SETS ((dept), (year), ())`는 부서별, 연도별, 전체 세 가지 집계를 한 번에 계산한다. ROLLUP은 계층적 소계(부서→부서+연도→전체), CUBE는 모든 조합의 소계를 만든다. GROUPING() 함수로 소계 행을 구분한다. 엑셀 피벗 테이블을 SQL로 구현하는 것과 같다.
- **핵심 키워드**: [GROUPING SETS, ROLLUP, CUBE, GROUPING(), 소계, 총계, 피벗]
- **시각화 연결**: 해당 없음
- **다음 섹션**: IV-B-2-2

#### IV-B-2-2. LATERAL JOIN과 고급 조인

- **난이도**: ★★★
- **선수 지식**: IV-B-2-1
- **학습 목표**: 이 섹션을 마치면 LATERAL JOIN으로 행마다 서브쿼리를 실행하고, CROSS JOIN과 generate_series를 활용해 빈 날짜를 채우는 패턴을 구사할 수 있다.
- **설명**: LATERAL JOIN은 왼쪽 테이블의 각 행을 오른쪽 서브쿼리에서 참조할 수 있게 한다. "각 부서에서 급여 상위 3명"처럼 행마다 독립적인 서브쿼리가 필요할 때 유용하다. CROSS JOIN은 두 테이블의 모든 조합(카테시안 곱)을 만든다. generate_series와 CROSS JOIN을 결합하면 빠진 날짜를 채운 매출 보고서를 만들 수 있다.
- **핵심 키워드**: [LATERAL JOIN, CROSS JOIN, generate_series, 카테시안 곱, 빈 날짜 채우기, ROWS FROM]
- **시각화 연결**: 해당 없음
- **다음 섹션**: V-1-1

---

## Part V. 트랜잭션·인덱스·성능 (★★★)

실무에서 가장 중요한 트랜잭션 원리, 인덱스 설계, 쿼리 성능 분석을 다룬다.

> 본문 1원고: [docs/book/part-5.md](docs/book/part-5.md) (5 Section, 약 1800~2200자/Section)

---

### Chapter V-1. 트랜잭션과 ACID

#### V-1-1. 트랜잭션이란 무엇인가

- **난이도**: ★★★
- **선수 지식**: IV-4-1
- **학습 목표**: 이 섹션을 마치면 트랜잭션(Transaction)의 개념과 `BEGIN / COMMIT / ROLLBACK` 사용법을 설명할 수 있다.
- **설명**: 트랜잭션은 "하나의 논리적 작업 단위"다. 계좌 이체를 예로 들면, A 계좌에서 돈을 빼고(UPDATE) B 계좌에 넣는(UPDATE) 두 동작이 반드시 같이 성공하거나 같이 취소되어야 한다. `BEGIN`으로 시작하고 `COMMIT`으로 확정, `ROLLBACK`으로 되돌린다.
- **핵심 키워드**: [트랜잭션(transaction), BEGIN, COMMIT, ROLLBACK, 원자성(atomicity), 계좌 이체]
- **시각화 연결**: `chapter-v-1-1.html` (BEGIN/COMMIT/ROLLBACK 계좌 이체 애니메이션)
- **다음 섹션**: V-1-2

#### V-1-2. ACID 속성

- **난이도**: ★★★
- **선수 지식**: V-1-1
- **학습 목표**: 이 섹션을 마치면 ACID(원자성·일관성·격리성·지속성)의 각 속성이 어떤 문제를 막는지 설명할 수 있다.
- **설명**: Atomicity(원자성)은 "전부 아니면 전무", Consistency(일관성)는 제약 조건 유지, Isolation(격리성)은 동시 트랜잭션 간 간섭 방지, Durability(지속성)는 커밋 후 장애에도 데이터 보존이다. PostgreSQL은 기본적으로 Read Committed 격리 수준을 사용한다.
- **핵심 키워드**: [ACID, 원자성(Atomicity), 일관성(Consistency), 격리성(Isolation), 지속성(Durability), Read Committed]
- **시각화 연결**: `chapter-v-1-2.html` (ACID 4속성 + 격리성 두 세션 시뮬레이션)
- **다음 섹션**: V-2-1

---

### Chapter V-2. 인덱스 설계

#### V-2-1. 인덱스의 원리

- **난이도**: ★★★
- **선수 지식**: V-1-2
- **학습 목표**: 이 섹션을 마치면 B-tree 인덱스의 원리와 언제 인덱스가 효과적인지 설명할 수 있다.
- **설명**: 인덱스는 책 뒤의 "찾아보기(색인)"와 같다. 책 전체를 읽는 대신 색인으로 페이지를 바로 찾는다. PostgreSQL 기본 인덱스는 B-tree 구조로 범위 조건(`>`, `<`, `BETWEEN`)과 동등 조건(`=`)에 모두 효과적이다.
- **핵심 키워드**: [인덱스(index), B-tree, CREATE INDEX, Sequential Scan vs Index Scan, 선택도(selectivity)]
- **시각화 연결**: `chapter-v-2-1.html` (B-tree 인덱스 탐색 vs Sequential Scan 비교 애니메이션)
- **다음 섹션**: V-2-2

#### V-2-2. 인덱스 종류와 적용 전략

- **난이도**: ★★★
- **선수 지식**: V-2-1
- **학습 목표**: 이 섹션을 마치면 복합 인덱스, 부분 인덱스, GIN/GiST 인덱스를 목적에 맞게 선택할 수 있다.
- **설명**: 복합 인덱스(multi-column index)는 WHERE 절에 여러 컬럼이 자주 함께 등장할 때 유효하다. 부분 인덱스(partial index)는 `WHERE is_active = TRUE`처럼 특정 조건의 행에만 적용해 인덱스 크기를 줄인다. JSONB 컬럼 검색에는 GIN 인덱스를 사용한다.
- **핵심 키워드**: [복합 인덱스, 부분 인덱스(partial index), GIN, GiST, JSONB, 인덱스 팽창(index bloat), REINDEX]
- **시각화 연결**: 해당 없음
- **다음 섹션**: V-3-1

---

### Chapter V-3. 쿼리 성능 분석

#### V-3-1. EXPLAIN ANALYZE 심화

- **난이도**: ★★★
- **선수 지식**: V-2-2
- **학습 목표**: 이 섹션을 마치면 `EXPLAIN (ANALYZE, BUFFERS)` 출력에서 병목 구간을 찾고 개선 방향을 제안할 수 있다.
- **설명**: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`은 쿼리의 예상 비용, 실제 소요 시간, 버퍼 캐시 히트/미스 수치를 모두 보여준다. `actual time`이 `cost` 예측보다 크게 높으면 통계 정보가 오래됐을 가능성이 높으니 `ANALYZE` 명령으로 갱신한다.
- **핵심 키워드**: [EXPLAIN ANALYZE, BUFFERS, actual time, planning time, 통계 정보(statistics), VACUUM ANALYZE]
- **시각화 연결**: 해당 없음
- **다음 섹션**: VI-1-1

---

## Part VI. 실전 스키마 설계 (★★★)

실제 서비스 데이터베이스를 설계할 때 필요한 정규화 원칙과 실전 패턴을 다룬다.

> 본문 1원고: [docs/book/part-6.md](docs/book/part-6.md) (3 Section, 약 1850~1950자/Section)

---

### Chapter VI-1. 정규화와 역정규화

#### VI-1-1. 정규화(Normalization) 1NF~3NF

- **난이도**: ★★★
- **선수 지식**: V-3-1
- **학습 목표**: 이 섹션을 마치면 1NF, 2NF, 3NF의 위반 사례를 찾고 올바른 테이블로 분리할 수 있다.
- **설명**: 정규화는 중복을 제거하고 갱신 이상(update anomaly)을 막는 테이블 설계 원칙이다. 1NF는 "컬럼에 원자 값만", 2NF는 "부분 종속 제거", 3NF는 "이행 종속 제거"다. 과도한 정규화는 JOIN 비용을 늘리므로 실무에서는 3NF를 기준으로 판단한다.
- **핵심 키워드**: [정규화(normalization), 1NF, 2NF, 3NF, 갱신 이상(update anomaly), 함수 종속(functional dependency)]
- **시각화 연결**: 해당 없음
- **다음 섹션**: VI-1-2

#### VI-1-2. 역정규화(Denormalization) 전략

- **난이도**: ★★★
- **선수 지식**: VI-1-1
- **학습 목표**: 이 섹션을 마치면 역정규화가 필요한 상황을 식별하고 trade-off를 설명할 수 있다.
- **설명**: 읽기가 매우 많고 쓰기가 드문 데이터는 JOIN 비용을 줄이기 위해 일부러 중복 컬럼을 두는 역정규화를 선택한다. 예를 들어 주문 테이블에 상품명을 직접 저장해 조인을 줄이는 방식이다. 단, 원본 데이터 변경 시 중복 데이터도 함께 갱신해야 하는 부담이 생긴다.
- **핵심 키워드**: [역정규화(denormalization), 중복 저장, 읽기 성능, 갱신 부담, trade-off]
- **시각화 연결**: 해당 없음
- **다음 섹션**: VI-2-1

---

### Chapter VI-2. 실전 스키마 예시

#### VI-2-1. 전자상거래 스키마 설계

- **난이도**: ★★★
- **선수 지식**: VI-1-2
- **학습 목표**: 이 섹션을 마치면 users, products, orders, order_items 테이블을 설계하고 외래키로 연결할 수 있다.
- **설명**: 전자상거래 스키마는 PostgreSQL 학습의 표준 예제다. users(고객), products(상품), orders(주문 헤더), order_items(주문 상세)로 구성되며, 1:N과 M:N 관계를 모두 포함한다. UUID vs SERIAL 기본키 선택, created_at 컬럼 DEFAULT NOW() 설정 같은 실무 패턴을 함께 익힌다.
- **핵심 키워드**: [ERD, users, products, orders, order_items, UUID, SERIAL, DEFAULT NOW(), 제약 조건(constraint)]
- **시각화 연결**: `chapter-vi-2-1.html` (전자상거래 ERD + 4테이블 관계 + UUID vs SERIAL 비교)
- **다음 섹션**: VI-B-1-1

---

## Part VI-B. JSON·검색·벡터 (★★★) — 신규

> 본문 1원고: [docs/book/part-6b.md](docs/book/part-6b.md) (4 Section, 약 2250~2500자/Section)

PostgreSQL의 강력한 확장 기능인 JSONB, 전문 검색(Full Text Search), 벡터 검색(pgvector)을 다룬다. API 서버 개발, 검색 기능 구현, AI 임베딩 활용까지 실전 PostgreSQL의 차별화 포인트다.

---

### Chapter VI-B-1. JSONB 완전 가이드

#### VI-B-1-1. JSON vs JSONB 완전 가이드

- **난이도**: ★★★
- **선수 지식**: VI-2-1
- **학습 목표**: 이 섹션을 마치면 JSON과 JSONB의 차이를 설명하고, JSONB 데이터를 저장·조회·추출하는 연산자(->, ->>, @>, ?)를 사용할 수 있다.
- **설명**: JSON은 텍스트 그대로 저장하고, JSONB는 바이너리로 파싱해 저장한다. JSONB가 인덱싱, 포함 연산(@>), 존재 연산(?)을 지원하므로 실무에서는 거의 항상 JSONB를 쓴다. `->` 연산자는 JSON 객체를 반환하고, `->>` 연산자는 텍스트를 반환한다. `jsonb_build_object()`, `jsonb_agg()`로 SQL 결과를 JSON으로 변환할 수 있다.
- **핵심 키워드**: [JSON, JSONB, ->, ->>, #>, @>, ?, jsonb_build_object, jsonb_agg, jsonb_each, jsonb_array_elements]
- **시각화 연결**: `chapter-vi-b-1-1.html` (JSON 트리 탐색 + 연산자 실습 5단계)
- **다음 섹션**: VI-B-1-2

#### VI-B-1-2. JSONB 업데이트와 인덱싱

- **난이도**: ★★★
- **선수 지식**: VI-B-1-1
- **학습 목표**: 이 섹션을 마치면 jsonb_set으로 JSONB 내부 값을 업데이트하고, GIN 인덱스로 JSONB 검색 성능을 최적화할 수 있다.
- **설명**: JSONB는 불변(immutable)이라 부분 업데이트가 아니라 전체를 교체한다. `jsonb_set(column, '{key}', '"new_value"')`로 특정 키만 바꿀 수 있다. `||` 연산자로 키를 추가/병합한다. `- 'key'`로 키를 삭제한다. GIN 인덱스를 만들면 @>와 ? 연산이 빨라진다. `jsonb_path_ops` 연산자 클래스를 사용하면 @> 전용으로 더 작고 빠른 인덱스를 만들 수 있다.
- **핵심 키워드**: [jsonb_set, || 연산자, - 연산자, GIN 인덱스, jsonb_path_ops, jsonb_path_query, SQL/JSON Path]
- **시각화 연결**: 해당 없음
- **다음 섹션**: VI-B-2-1

---

### Chapter VI-B-2. 전문 검색과 벡터

#### VI-B-2-1. Full Text Search

- **난이도**: ★★★
- **선수 지식**: VI-B-1-2
- **학습 목표**: 이 섹션을 마치면 tsvector와 tsquery를 사용해 전문 검색을 구현하고 GIN 인덱스로 검색 성능을 최적화할 수 있다.
- **설명**: LIKE '%keyword%'는 인덱스를 타지 않아 대용량에서 느리다. PostgreSQL의 Full Text Search는 tsvector(텍스트를 단어 토큰으로 분해)와 tsquery(검색 조건)를 매칭해 빠르게 검색한다. `to_tsvector('english', 'The quick brown fox')`는 불용어를 제거하고 어근을 추출한다. `@@` 연산자로 매칭하고, `ts_rank()`로 관련도 점수를 매긴다. GIN 인덱스를 만들면 대규모 텍스트 검색도 빠르다.
- **핵심 키워드**: [tsvector, tsquery, to_tsvector, plainto_tsquery, websearch_to_tsquery, @@, ts_rank, ts_headline, GIN, 불용어(stop words)]
- **시각화 연결**: `chapter-vi-b-2-1.html` (tsvector 토큰화 + tsquery 매칭 시각화 5단계)
- **다음 섹션**: VI-B-2-2

#### VI-B-2-2. pgvector와 시맨틱 검색

- **난이도**: ★★★
- **선수 지식**: VI-B-2-1
- **학습 목표**: 이 섹션을 마치면 pgvector 확장을 설치하고, 벡터 임베딩을 저장·검색하며, 시맨틱 검색과 유사 항목 추천을 구현할 수 있다.
- **설명**: pgvector는 PostgreSQL에 벡터 타입과 유사도 검색을 추가하는 확장이다. AI 모델(OpenAI, Sentence Transformers 등)이 생성한 임베딩 벡터를 `vector(1536)` 타입 컬럼에 저장하고, 코사인 유사도(`<=>`), L2 거리(`<->`) 연산자로 가장 유사한 항목을 찾는다. IVFFlat과 HNSW 인덱스를 사용하면 수백만 벡터에서도 밀리초 단위 검색이 가능하다.
- **핵심 키워드**: [pgvector, vector 타입, 코사인 유사도(<=>), L2 거리(<->), 내적(<#>), IVFFlat, HNSW, 임베딩(embedding), 시맨틱 검색]
- **시각화 연결**: 해당 없음
- **다음 섹션**: VII-1-1

---

## Part VII. 복제·백업·모니터링 (★★★)

운영 환경에서 PostgreSQL을 안정적으로 운용하기 위한 백업, 복제, 모니터링 기초를 다룬다.

> 본문 1원고: [docs/book/part-7.md](docs/book/part-7.md) (3 Section, 약 1850~1950자/Section)

---

### Chapter VII-1. 백업과 복구

#### VII-1-1. pg_dump / pg_restore

- **난이도**: ★★★
- **선수 지식**: VI-2-1
- **학습 목표**: 이 섹션을 마치면 `pg_dump`로 데이터베이스를 백업하고 `pg_restore`로 복구하는 절차를 수행할 수 있다.
- **설명**: `pg_dump -Fc mydb > mydb.dump`는 커스텀 포맷으로 압축 백업을 만든다. `pg_restore -d mydb mydb.dump`로 복구한다. 전체 클러스터 백업은 `pg_dumpall`을 사용한다. 백업은 주기적으로 테스트 복구를 실행해 실제로 복원되는지 확인해야 한다.
- **핵심 키워드**: [pg_dump, pg_restore, pg_dumpall, 커스텀 포맷(-Fc), 백업 테스트, PITR]
- **시각화 연결**: 해당 없음
- **다음 섹션**: VII-2-1

---

### Chapter VII-2. 복제와 고가용성

#### VII-2-1. 스트리밍 복제(Streaming Replication) 개요

- **난이도**: ★★★
- **선수 지식**: VII-1-1
- **학습 목표**: 이 섹션을 마치면 Primary-Standby 스트리밍 복제의 개념과 WAL(Write-Ahead Log)의 역할을 설명할 수 있다.
- **설명**: PostgreSQL은 Primary 서버의 WAL(변경 로그)을 Standby 서버로 실시간 전송해 복제한다. Primary 장애 시 Standby를 승격(promote)해 서비스를 이어갈 수 있다. Patroni 같은 도구를 사용하면 자동 페일오버를 구성할 수 있다.
- **핵심 키워드**: [스트리밍 복제(streaming replication), WAL(Write-Ahead Log), Primary, Standby, Failover, Patroni]
- **시각화 연결**: 해당 없음
- **다음 섹션**: VII-3-1

---

### Chapter VII-3. 모니터링과 운영

#### VII-3-1. pg_stat_activity와 슬로우 쿼리 탐지

- **난이도**: ★★★
- **선수 지식**: VII-2-1
- **학습 목표**: 이 섹션을 마치면 `pg_stat_activity` 뷰로 현재 실행 중인 쿼리를 조회하고 슬로우 쿼리를 탐지할 수 있다.
- **설명**: `SELECT pid, query, state, now() - query_start AS duration FROM pg_stat_activity WHERE state = 'active';`로 현재 실행 중인 쿼리와 소요 시간을 볼 수 있다. `log_min_duration_statement = 1000`(ms)을 postgresql.conf에 설정하면 1초 이상 걸리는 쿼리를 자동 로그에 기록한다.
- **핵심 키워드**: [pg_stat_activity, 슬로우 쿼리(slow query), log_min_duration_statement, VACUUM, autovacuum, pg_stat_statements]
- **시각화 연결**: 해당 없음
- **다음 섹션**: 부록 A

---

## 부록 A. 용어집 (가나다순)

| 용어 | 영문 | 설명 |
|:--|:--|:--|
| 격리성 | Isolation | 동시 트랜잭션이 서로 간섭하지 않는 ACID 속성 |
| 관계형 데이터베이스 | Relational Database | 데이터를 행·열 테이블로 저장하고 관계로 연결하는 DB |
| 기본키 | Primary Key | 테이블에서 각 행을 유일하게 식별하는 컬럼(또는 컬럼 조합) |
| 뷰 | View | 자주 쓰는 SELECT 쿼리를 저장해둔 가상 테이블 |
| 서브쿼리 | Subquery | 다른 SQL 문 내부에 중첩된 SELECT 문 |
| 실행 계획 | Execution Plan | Optimizer가 선택한 쿼리 처리 방법의 상세 절차 |
| 역정규화 | Denormalization | 읽기 성능을 위해 의도적으로 중복 데이터를 허용하는 설계 |
| 외래키 | Foreign Key | 다른 테이블의 기본키를 참조하는 컬럼 |
| 원자성 | Atomicity | 트랜잭션의 모든 작업이 전부 성공하거나 전부 실패하는 ACID 속성 |
| 인덱스 | Index | 특정 컬럼의 검색 속도를 높이기 위한 자료구조 (B-tree 등) |
| 일관성 | Consistency | 트랜잭션 전후로 DB 제약 조건이 항상 유지되는 ACID 속성 |
| 지속성 | Durability | 커밋된 트랜잭션은 장애 후에도 보존되는 ACID 속성 |
| 집계 함수 | Aggregate Function | 여러 행을 하나의 값으로 요약하는 함수 (COUNT, SUM 등) |
| 정규화 | Normalization | 중복 제거와 갱신 이상 방지를 위한 테이블 분리 설계 원칙 |
| 트랜잭션 | Transaction | 하나의 논리적 작업 단위로 묶인 SQL 문의 집합 |
| 파스 트리 | Parse Tree | Parser가 SQL 문자열을 분석해 만든 내부 구조체 |
| 파티셔닝 | Partitioning | 큰 테이블을 물리적으로 여러 조각으로 분할하는 기법 |
| 복제 | Replication | Primary DB의 변경 사항을 Standby DB로 실시간 동기화 |
| WAL | Write-Ahead Log | 데이터 변경 전에 먼저 기록하는 복구용 로그 |
| VACUUM | VACUUM | 삭제된 행의 공간을 회수하고 통계를 갱신하는 PostgreSQL 유지 관리 작업 |

---

## 부록 B. FAQ

**Q1. PostgreSQL과 MySQL 중 어떤 것을 먼저 배워야 하나?**

어느 쪽을 먼저 배워도 괜찮다. 기본 SQL 문법은 거의 동일하다. 취업 목표 회사나 팀의 기술 스택을 확인하고 그것을 우선하되, 이 커리큘럼은 PostgreSQL 기준이므로 PostgreSQL로 시작하면 표준 SQL 준수도가 높아 다른 DB로 이전할 때도 유리하다.

**Q2. EXPLAIN 출력이 너무 복잡해서 이해하기 어렵다.**

처음에는 두 가지만 확인한다. ① `Seq Scan`인지 `Index Scan`인지, ② `actual time`이 얼마나 큰지. `Seq Scan`이고 시간이 크다면 인덱스 추가를 검토한다. [pev2](https://explain.dalibo.com/) 같은 시각화 도구를 사용하면 트리 구조를 더 쉽게 볼 수 있다.

**Q3. 트랜잭션을 매번 BEGIN/COMMIT으로 명시해야 하나?**

PostgreSQL은 기본적으로 각 SQL 문이 자동으로 트랜잭션(auto-commit)으로 처리된다. 여러 SQL을 하나의 단위로 묶어야 할 때만 `BEGIN ... COMMIT`을 명시한다.

**Q4. 인덱스를 많이 만들면 무조건 빠를까?**

아니다. 인덱스는 읽기(SELECT)를 빠르게 하지만, 쓰기(INSERT/UPDATE/DELETE) 때마다 인덱스도 갱신해야 하므로 쓰기 비용이 늘어난다. 또 인덱스 자체도 디스크 공간을 차지한다. WHERE 절에 자주 등장하는 컬럼에 선택적으로 적용한다.

**Q5. VACUUM은 왜 필요한가?**

PostgreSQL은 UPDATE/DELETE 시 기존 행을 즉시 삭제하지 않고 "죽은 행(dead tuple)"으로 표시한다(MVCC 방식). VACUUM은 이 죽은 행을 정리해 공간을 회수한다. 대부분의 경우 `autovacuum`이 자동으로 실행되므로 수동 실행은 대규모 데이터 조작(bulk delete 등) 후에만 고려한다.

---

## 부록 C. 다음 공부 로드맵

PostgreSQL 커리큘럼을 완주한 뒤 이어갈 학습 경로:

1. **Spring Boot + JPA** — Java 백엔드에서 PostgreSQL을 ORM으로 다루기 (`springboot/` 폴더)
2. **Docker** — PostgreSQL을 컨테이너로 띄우고 환경을 격리하기 (`docker/` 폴더)
3. **GCP Cloud SQL** — 매니지드 PostgreSQL 서비스로 클라우드 배포 (`gcp/` 폴더)
4. **고급 PostgreSQL** — 파티셔닝, 논리 복제(Logical Replication), PL/pgSQL 함수, PostGIS 확장

---

## 부록 D. 참고 자료

| 자료 | 설명 | 링크 |
|:--|:--|:--|
| PostgreSQL 공식 문서 | 가장 정확한 레퍼런스. 영문 | https://www.postgresql.org/docs/ |
| PostgreSQL 16 Release Notes | 최신 버전 변경 사항 | https://www.postgresql.org/docs/16/release-16.html |
| Use the Index, Luke | 인덱스 원리를 SQL 예제로 설명. 무료 온라인 책 | https://use-the-index-luke.com/ |
| EXPLAIN 시각화 (pev2) | EXPLAIN 출력을 시각적 트리로 변환 | https://explain.dalibo.com/ |
| pgTune | 서버 사양에 맞는 postgresql.conf 튜닝 추천 | https://pgtune.leopard.in.ua/ |
| Postgres Weekly | PostgreSQL 뉴스레터 (주간) | https://postgresweekly.com/ |
