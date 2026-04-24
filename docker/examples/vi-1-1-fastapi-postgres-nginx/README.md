# 예제 VI-1-1: FastAPI + PostgreSQL + Nginx 3티어 구성

## 목적

Nginx(리버스 프록시) → FastAPI(앱 서버) → PostgreSQL(데이터베이스) 세 컨테이너를
Compose 하나로 엮어 실전 3티어 웹 앱을 로컬에서 실행한다.

이 예제의 핵심 학습 포인트는 세 가지다.

1. `expose`(내부 전용)와 `ports`(호스트 노출)의 차이
2. `healthcheck` + `depends_on.condition: service_healthy` 로 DB 준비 완료를 기다리는 방법
3. Nginx `upstream` 블록으로 FastAPI에 요청을 전달하는 리버스 프록시 설정

---

## 사전 요건

| 항목 | 버전 | 확인 명령 |
|:--|:--|:--|
| Docker Engine | 24 이상 | `docker --version` |
| Docker Compose v2 | 2.20 이상 | `docker compose version` |

> `docker-compose`(하이픈)가 아닌 `docker compose`(스페이스)를 사용한다. 하이픈 형식은 v1 레거시다.

---

## 파일 구성

```
vi-1-1-fastapi-postgres-nginx/
├── docker-compose.yml          # nginx + api + db 3서비스 정의
├── .env.example                # 환경 변수 샘플 (복사 후 사용)
├── db/
│   └── init.sql                # items 테이블 생성 + seed 1행 삽입
├── api/
│   ├── Dockerfile              # python:3.11-slim + uvicorn + fastapi
│   ├── requirements.txt        # fastapi, uvicorn, psycopg
│   └── main.py                 # CRUD 엔드포인트 (/items, /health)
└── nginx/
    └── nginx.conf              # upstream api + proxy_pass 설정
```

---

## 실행 단계

### 1단계: 환경 변수 파일 복사

```bash
cp .env.example .env
```

`.env` 파일이 생성된다. 학습 환경에서는 기본값 그대로 사용해도 된다.
실제 서비스 환경에서는 `POSTGRES_PASSWORD`와 `DATABASE_URL`의 비밀번호를 반드시 변경해야 한다.

### 2단계: 전체 스택 시작

```bash
docker compose up -d
```

db 헬스체크가 통과할 때까지 api 컨테이너 시작이 대기된다.
세 컨테이너가 모두 뜨는 데 10~20초 정도 걸린다.

### 3단계: 서비스 상태 확인

```bash
docker compose ps
```

`db`, `api`, `nginx` 세 서비스가 모두 `running` 상태여야 한다.

### 4단계: 헬스체크 확인

```bash
curl localhost/health
```

아래와 같이 응답이 오면 DB 연결까지 정상이다.

```json
{"status":"ok"}
```

### 5단계: 전체 아이템 조회

```bash
curl localhost/items
```

init.sql에서 삽입된 seed 데이터가 보인다.

```json
[{"id":1,"name":"seed-row"}]
```

### 6단계: 새 아이템 추가

```bash
curl -X POST localhost/items \
  -H "Content-Type: application/json" \
  -d '{"name":"my-item"}'
```

새로 추가된 아이템의 id와 name이 반환된다.

```json
{"id":2,"name":"my-item"}
```

### 7단계: 추가된 아이템 재조회

```bash
curl localhost/items
```

seed-row와 my-item, 두 항목이 보인다.

```json
[{"id":1,"name":"seed-row"},{"id":2,"name":"my-item"}]
```

### 8단계: 로그 확인

```bash
# nginx 접근 로그
docker compose logs nginx

# api 요청/응답 로그
docker compose logs api

# 모든 서비스 실시간 로그
docker compose logs -f
```

### 9단계: 스택 종료

```bash
docker compose down
```

컨테이너는 삭제되고 `pgdata` 볼륨은 유지된다. 다음번 `up -d` 시 데이터가 그대로 남아 있다.

볼륨까지 삭제하고 완전히 초기화하려면 `-v` 플래그를 붙인다.

```bash
docker compose down -v
```

---

## 렌즈로 이해하기

> **[입문 렌즈 ★☆☆]**
> - **비유**: 레스토랑에 비유하면 이렇다. Nginx는 **접수원**이다. 손님(브라우저)이 문 앞에서 주문하면 주방(FastAPI)에 전달한다. FastAPI는 **주방**이다. 실제 요리(데이터 처리)를 하고 창고(PostgreSQL)에서 재료를 꺼낸다. PostgreSQL은 **창고**다. 재료를 보관하고 주방 요청에만 응답한다. 손님이 창고에 직접 들어갈 수는 없다.
> - **체감 예시**: 백화점 안내 데스크와 같다. 방문객(요청)이 어느 매장(서비스)에 가야 할지 묻지 않아도 안내 데스크(Nginx)가 알아서 연결해 준다. 매장 직원은 창고 위치를 외부에 공개하지 않는다.
> - **주의**: `docker compose up -d` 직후에 `curl localhost/items`를 실행하면 "502 Bad Gateway"가 뜰 수 있다. db 헬스체크가 끝나고 api가 완전히 뜰 때까지 10~20초가 걸린다. 잠시 기다렸다가 다시 시도하면 된다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose logs -f api` — api 컨테이너 로그를 실시간으로 확인한다. DB 연결 성공 로그(`Application startup complete.`)가 보이면 api가 준비된 것이다.
> - **흔한 함정 1 — 포트 80 충돌**: 호스트에 다른 서비스(로컬 Apache, IIS 등)가 80 포트를 쓰고 있으면 `docker compose up`이 실패한다. `docker-compose.yml`의 `ports: "80:80"`을 `"8080:80"`으로 바꾸면 `curl localhost:8080/items`로 접근할 수 있다.
> - **흔한 함정 2 — depends_on 타이밍**: `condition: service_healthy` 없이 `depends_on: db`만 쓰면 DB가 아직 초기화 중인데 api가 연결을 시도해서 `psycopg.OperationalError`가 발생한다. 이 예제는 `healthcheck` + `condition: service_healthy`로 이 문제를 해결한다.
> - **체크리스트**:
>   - [ ] `docker compose ps` 에서 세 서비스 모두 `running` 상태다
>   - [ ] `curl localhost/health` 응답이 `{"status":"ok"}` 다
>   - [ ] `curl localhost/items` 응답에 `seed-row` 가 포함된다
>   - [ ] POST 후 GET 재조회 시 새 항목이 보인다

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: 이 예제의 `nginx.conf`는 단일 `api` 인스턴스만 upstream에 등록한다. 프로덕션에서는 `server api_1:8000; server api_2:8000;` 처럼 여러 인스턴스를 등록해 로드밸런싱을 구성한다. SSL 종료(TLS Termination)는 Nginx에서 처리하고 내부 통신은 평문 HTTP를 유지하는 패턴이 일반적이다. `POSTGRES_PASSWORD`는 반드시 강력한 임의 문자열로 교체해야 한다.
> - **대안 기술**: Traefik과 Caddy는 `docker-compose.yml` 레이블만으로 라우팅을 자동 구성하고 Let's Encrypt 인증서를 자동 갱신한다. 설정 파일 없이 도커 레이블로 라우팅을 선언하는 방식이라 Compose와 궁합이 좋다. 단, Nginx는 자료가 가장 많아 문제 발생 시 해결책을 찾기 쉽다.
> - **관측**: `docker compose logs nginx` 로 접근 로그를 확인하고, `docker compose logs api` 와 교차해서 보면 Nginx 레벨 오류인지 FastAPI 레벨 오류인지 빠르게 판별된다. `docker compose logs --since 10m` 으로 최근 10분치만 필터링하는 습관을 들인다. `docker compose ps` 의 `STATUS` 컬럼에서 `(healthy)` 여부를 보면 헬스체크 통과 상태를 한눈에 알 수 있다.

---

## 트러블슈팅

### 포트 80이 이미 사용 중이다

호스트에 다른 서비스가 80 포트를 점유 중인 경우 발생한다.
`docker-compose.yml`의 `ports:` 항목을 대체 포트로 변경한다.

```yaml
ports:
  - "8080:80"
```

변경 후 아래와 같이 포트를 명시해서 접근한다.

```bash
curl localhost:8080/items
```

### DB 연결 실패 — api 컨테이너가 바로 종료된다

`.env` 파일이 없거나 `DATABASE_URL`이 잘못된 경우다.

1. `.env` 파일이 존재하는지 확인한다.

```bash
ls -la .env
```

2. `.env` 내용이 올바른지 확인한다.

```bash
cat .env
```

`DATABASE_URL`의 호스트 부분이 `db`(서비스 이름)여야 한다. `localhost`로 쓰면 연결되지 않는다.

```
DATABASE_URL=postgresql://app:secret_change_me@db:5432/demo
```

3. api 로그로 정확한 에러를 확인한다.

```bash
docker compose logs api
```

### healthcheck 대기 중에 시간이 너무 오래 걸린다

db 컨테이너 로그로 PostgreSQL이 정상 시작됐는지 확인한다.

```bash
docker compose logs db
```

`database system is ready to accept connections` 메시지가 보이면 정상이다.
그래도 api가 뜨지 않는다면 `docker compose ps`로 db의 상태가 `(healthy)`인지 확인한다.

### init.sql이 적용되지 않는다

볼륨에 이미 데이터가 있으면 `init.sql`이 실행되지 않는다.
볼륨을 완전히 삭제하고 다시 시작한다.

```bash
docker compose down -v
docker compose up -d
```

### Windows에서 `cp` 명령이 동작하지 않는다

Git Bash 또는 WSL2를 사용한다. PowerShell에서는 아래 명령을 사용한다.

```powershell
Copy-Item .env.example .env
```

### curl 출력 형식이 다르다

Windows PowerShell의 `curl`은 `Invoke-WebRequest`의 별칭이라 출력 형식이 다르다.
`curl.exe`를 명시하거나 Git Bash를 사용한다.

```powershell
curl.exe -s localhost/items
```

---

## 자동 검증

검증 스크립트는 Sprint 2 Phase 3에서 test-writer가 작성할 예정이다.
스크립트가 추가되면 아래 명령으로 전체 흐름을 자동으로 검증할 수 있다.

```bash
bash tests/verify_3tier.sh
```

종료 코드 `0`이면 PASS다. 이 스크립트는 Git Bash / macOS / Linux bash 전용이다.
Windows PowerShell에서는 실행할 수 없다.
