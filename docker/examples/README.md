# examples — Docker 학습 예제 모음

이 폴더에는 Docker의 핵심 개념을 직접 체험할 수 있는 예제 12세트가 있다.
각 예제는 독립적으로 실행 가능하며, 서로 다른 Docker 기능을 다룬다.

> 예제 1~4(Part IV~VI)는 개별 폴더에 README.md가 있다. 예제 5~12(Part VIII)는 이 파일에서 직접 설명한다.

## 사전 요건

| 항목 | 버전 | 확인 명령 |
|:--|:--|:--|
| Docker Engine | 24 이상 | `docker --version` |
| Docker Compose v2 | 2.20 이상 | `docker compose version` |

> `docker-compose`(하이픈)가 아닌 `docker compose`(스페이스)를 사용한다. 하이픈 형식은 v1 레거시다.

---

## 예제 목록

| 폴더 | 챕터 | 주제 | 핵심 개념 |
|:--|:--|:--|:--|
| [`iv-1-3-multistage-build/`](./iv-1-3-multistage-build/) | IV-1-3 | Multi-stage 빌드로 이미지 크기 줄이기 | multi-stage, `COPY --from`, 빌드 vs 런타임 분리 |
| [`v-1-2-postgres-volume/`](./v-1-2-postgres-volume/) | V-1-2 | Postgres named volume 영구화 | named volume, `down` 후 데이터 생존 |
| [`v-1-2-bind-mount-hot-reload/`](./v-1-2-bind-mount-hot-reload/) | V-1-2 | FastAPI bind mount 핫 리로드 | bind mount, uvicorn `--reload` |
| [`vi-1-1-fastapi-postgres-nginx/`](./vi-1-1-fastapi-postgres-nginx/) | VI-1-1 | FastAPI + PostgreSQL + Nginx 3티어 구성 | multi-container, depends_on, healthcheck |
| [`viii-1-5-mysql-docker/`](./viii-1-5-mysql-docker/) | VIII-1-5 | MySQL을 Docker로 실행하기 | MySQL 8.0, named volume, healthcheck, init.sql |
| [`viii-1-6-redis-docker/`](./viii-1-6-redis-docker/) | VIII-1-6 | Redis를 Docker로 실행하기 | Redis 7 alpine, appendonly, 비밀번호 인증, named volume |
| [`viii-1-7-mongodb-docker/`](./viii-1-7-mongodb-docker/) | VIII-1-7 | MongoDB를 Docker로 실행하기 | MongoDB 7, mongosh, 초기화 스크립트, named volume |
| [`viii-1-8-db-trio-compose/`](./viii-1-8-db-trio-compose/) | VIII-1-8 | DB 3종 비교와 Compose 조합 | MySQL + Redis + MongoDB 동시 실행, healthcheck 비교 |
| [`viii-1-9-springboot-docker/`](./viii-1-9-springboot-docker/) | VIII-1-9 | Spring Boot 앱 Docker화 | JDK→JRE multi-stage, 비루트 사용자, Actuator 헬스체크 |
| [`viii-1-10-nodejs-docker/`](./viii-1-10-nodejs-docker/) | VIII-1-10 | Node.js (Express) 앱 Docker화 | node:20-alpine, npm ci, 레이어 캐시, 비루트 사용자 |
| [`viii-1-11-nextjs-docker/`](./viii-1-11-nextjs-docker/) | VIII-1-11 | Next.js 앱 Docker화 | 3-stage 빌드(deps→builder→runner), standalone output |
| [`viii-1-12-html-nginx-docker/`](./viii-1-12-html-nginx-docker/) | VIII-1-12 | HTML+Nginx 정적 사이트 Docker화 | nginx:alpine, 커스텀 nginx.conf, 정적 파일 서빙 |

---

## 예제 1: Multi-stage 빌드로 이미지 크기 줄이기

`iv-1-3-multistage-build/` 폴더에 있다.

빌드 단계(builder)와 런타임 단계를 분리하여 최종 이미지에 컴파일 도구·캐시를 제거한다.
`COPY --from=builder` 명령으로 빌드 산출물만 골라 담는 방법을 체험할 수 있다.

자세한 실행 방법은 [iv-1-3-multistage-build/README.md](./iv-1-3-multistage-build/README.md)를 참고한다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 이사할 때 짐을 싸는 사람(빌드 도구)과 실제로 이사 가는 짐(실행 파일)은 다르다. 이사 후엔 포장 재료를 두고 간다.
> - **체감 예시**: 단일 스테이지 이미지가 800MB라면, 멀티 스테이지 후 150MB 수준으로 줄일 수 있다.
> - **주의**: `Dockerfile.single`과 `Dockerfile` 두 파일을 비교하면 차이를 한눈에 볼 수 있다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker build -t app-multi .` 후 `docker images | grep app` 으로 크기 비교
> - **흔한 함정**: 스테이지 이름(`AS builder`)을 오타 내면 `COPY --from=builder`가 실패한다.
> - **체크리스트**:
>   - [ ] 단일 스테이지 이미지와 멀티 스테이지 이미지 크기를 `docker images`로 비교했다
>   - [ ] `docker run --rm app-multi` 실행 결과가 정상임을 확인했다
>   - [ ] `--target builder` 옵션으로 중간 스테이지만 빌드해봤다

---

## 예제 2: Postgres named volume 영구화

`v-1-2-postgres-volume/` 폴더에 있다.

컨테이너를 삭제하고 다시 시작해도 PostgreSQL 데이터가 사라지지 않는 이유를 직접 확인한다.
named volume(이하 볼륨)이 어떻게 데이터를 Docker 관리 영역에 보관하는지 체험할 수 있다.

자세한 실행 방법은 [v-1-2-postgres-volume/README.md](./v-1-2-postgres-volume/README.md)를 참고한다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: named volume은 외장 하드와 같다. 본체(컨테이너)를 바꿔도 외장 하드는 그대로 꼽으면 데이터가 살아 있다.
> - **체감 예시**: 회원 가입 후 서버를 재배포했는데 회원 정보가 모두 사라진다면? 볼륨이 없기 때문이다.
> - **주의**: 볼륨은 `docker compose down -v` 를 실행하면 삭제된다. `-v` 플래그가 없으면 삭제되지 않는다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose down` — 컨테이너만 삭제, 볼륨 유지 / `docker compose down -v` — 볼륨까지 삭제
> - **흔한 함정**: `docker compose down -v`를 습관적으로 사용하면 개발 DB 데이터가 전부 날아간다.
> - **체크리스트**:
>   - [ ] `docker volume ls` 로 `pgdata` 볼륨이 존재하는지 확인했다
>   - [ ] `down` 후 `up -d` 재기동 시 데이터가 살아 있는지 SELECT로 확인했다
>   - [ ] `down -v` 후 재기동 시 seed-row 1행만 남는지 확인했다

---

## 예제 3: FastAPI bind mount 핫 리로드

`v-1-2-bind-mount-hot-reload/` 폴더에 있다.

호스트에서 코드를 수정하면 컨테이너 안의 uvicorn이 자동으로 재시작되는 개발 편의 흐름을 체험한다.
bind mount(바인드 마운트)가 호스트 폴더를 컨테이너 안에 직결하는 방식을 이해할 수 있다.

자세한 실행 방법은 [v-1-2-bind-mount-hot-reload/README.md](./v-1-2-bind-mount-hot-reload/README.md)를 참고한다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose up -d` 후 `curl -s localhost:8000/version` 으로 현재 버전 확인
> - **흔한 함정**: bind mount를 사용하면 이미지 빌드 없이 소스가 반영되지만, 의존성 변경(`requirements.txt`)은 반드시 `docker compose build`를 다시 실행해야 한다.
> - **체크리스트**:
>   - [ ] `docker compose up -d` 전에 이미지를 빌드했다 (`docker compose up --build` 또는 `docker compose build`)
>   - [ ] `app/main.py`를 수정했을 때 uvicorn 로그에 `Reloading...` 이 보인다
>   - [ ] `curl -s localhost:8000/version` 응답이 수정한 버전으로 바뀐다

---

## 예제 4: FastAPI + PostgreSQL + Nginx 3티어 구성

`vi-1-1-fastapi-postgres-nginx/` 폴더에 있다.

실무에서 자주 쓰는 3티어 구성(Nginx → FastAPI → PostgreSQL)을 Compose 한 파일로 띄운다.
`depends_on` + `healthcheck`로 서비스 시작 순서를 제어하고, Nginx가 리버스 프록시로 동작하는 흐름을 체험한다.

자세한 실행 방법은 [vi-1-1-fastapi-postgres-nginx/README.md](./vi-1-1-fastapi-postgres-nginx/README.md)를 참고한다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose up -d` 후 `curl -s localhost/health` 로 Nginx → FastAPI 응답 확인
> - **흔한 함정**: PostgreSQL이 ready 상태가 되기 전에 FastAPI가 DB 연결을 시도하면 오류가 난다. `depends_on` + `condition: service_healthy`가 이를 막는다.
> - **체크리스트**:
>   - [ ] `docker compose ps` 에서 세 컨테이너가 모두 `running` 상태다
>   - [ ] `curl -s localhost/health` 가 `{"status":"ok"}` 를 반환한다
>   - [ ] `docker compose logs db` 에서 `database system is ready to accept connections` 메시지를 확인했다

---

## 예제 5: MySQL을 Docker로 실행하기

`viii-1-5-mysql-docker/` 폴더에 있다.

MySQL 8.0을 Docker로 띄우고, named volume으로 데이터를 영속화하는 방법을 체험한다.
`init.sql`로 컨테이너 최초 기동 시 테이블과 초기 데이터를 자동으로 생성한다.
`docker compose down` 후 재기동해도 데이터가 살아 있는지 직접 확인할 수 있다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: MySQL 컨테이너는 외장 하드(named volume)를 꽂은 컴퓨터다. 컴퓨터를 껐다 켜도 외장 하드 안의 파일은 그대로다.
> - **체감 예시**: `docker compose down` 후 `docker compose up -d` 해도 INSERT했던 행이 살아 있다.
> - **주의**: 환경변수(`MYSQL_ROOT_PASSWORD` 등)를 `.env` 파일에서 관리한다. `.env.example`을 복사해서 시작한다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} demo` 로 MySQL CLI 접속
> - **흔한 함정**: MySQL은 초기화 스크립트(`init.sql`)를 볼륨이 비어 있을 때만 실행한다. `down -v` 없이 재기동하면 스크립트가 다시 실행되지 않는다.
> - **체크리스트**:
>   - [ ] `docker compose ps` 에서 `db` 서비스가 `healthy` 상태다
>   - [ ] `docker volume ls` 로 `mysql_data` 볼륨이 존재하는지 확인했다
>   - [ ] `down` 후 `up -d` 재기동 시 INSERT한 행이 살아 있는지 SELECT로 확인했다

---

## 예제 6: Redis를 Docker로 실행하기

`viii-1-6-redis-docker/` 폴더에 있다.

Redis 7 (alpine)을 Docker로 띄우고, `appendonly yes` 옵션으로 재기동 후에도 데이터가 살아남는 영속화를 체험한다.
비밀번호 인증(`requirepass`)으로 보안 설정하는 방법도 함께 확인할 수 있다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: Redis는 초고속 메모판(캐시)이다. 기본 설정에서는 전원을 끄면 내용이 지워지지만, `appendonly yes`를 켜면 메모판이 파일로 저장된다.
> - **체감 예시**: `SET greeting hello` 후 `down` → `up -d` 해도 `GET greeting` 결과가 `hello` 그대로다.
> - **주의**: `redis:7-alpine`은 이미지 크기가 작지만 기능은 동일하다. alpine은 경량 리눅스 배포판이다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose exec cache redis-cli -a ${REDIS_PASSWORD} ping` 으로 연결 상태 확인
> - **흔한 함정**: `-a` 플래그 없이 `redis-cli`에 접속하면 `NOAUTH Authentication required` 오류가 난다.
> - **체크리스트**:
>   - [ ] `docker compose ps` 에서 `cache` 서비스가 `healthy` 상태다
>   - [ ] `docker volume ls` 로 `redis_data` 볼륨이 존재하는지 확인했다
>   - [ ] `SET` 후 `down` → `up -d` → `GET` 순서로 데이터 영속화를 확인했다

---

## 예제 7: MongoDB를 Docker로 실행하기

`viii-1-7-mongodb-docker/` 폴더에 있다.

MongoDB 7을 Docker로 띄우고, `init-mongo.js` 초기화 스크립트로 컬렉션과 초기 문서를 자동 생성한다.
`mongosh`로 CLI에 접속하여 문서를 읽고 쓰는 방법을 체험할 수 있다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: MongoDB는 엑셀 표 대신 JSON 메모지를 모아두는 서랍장이다. 테이블·행·열 대신 컬렉션·문서·필드라는 이름을 쓴다.
> - **체감 예시**: `db.items.find()` 로 초기화 스크립트가 넣어 둔 문서를 바로 조회할 수 있다.
> - **주의**: MySQL과 달리 스키마가 없다. 같은 컬렉션에 필드 구조가 다른 문서를 넣을 수 있다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose exec db mongosh -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase admin`
> - **흔한 함정**: `mongosh` 없이 `mongo` 명령을 쓰면 MongoDB 7에서 오류가 난다. 7 버전부터 `mongo` CLI가 제거됐다.
> - **체크리스트**:
>   - [ ] `docker compose ps` 에서 `db` 서비스가 `healthy` 상태다
>   - [ ] `docker volume ls` 로 `mongo_data` 볼륨이 존재하는지 확인했다
>   - [ ] `down` 후 `up -d` 재기동 시 초기화 스크립트의 문서가 살아 있는지 `find()`로 확인했다

---

## 예제 8: DB 3종 비교와 Compose 조합

`viii-1-8-db-trio-compose/` 폴더에 있다.

MySQL 8.0 + Redis 7 + MongoDB 7을 하나의 Compose 파일로 동시에 띄운다.
세 DB의 헬스체크 방식과 볼륨 경로 차이를 한 파일에서 비교할 수 있다.
포트: MySQL `3306`, Redis `6379`, MongoDB `27017`.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose up -d` 후 `docker compose ps` 로 세 서비스 상태를 한눈에 확인
> - **흔한 함정**: 예제 5~7을 이미 실행 중이면 포트 충돌이 난다. `docker compose down`으로 기존 예제를 먼저 종료한다.
> - **체크리스트**:
>   - [ ] `docker compose ps` 에서 `mysql`, `redis`, `mongodb` 세 서비스가 모두 `healthy` 상태다
>   - [ ] `docker compose stop mysql` 로 MySQL만 선택적으로 종료할 수 있다
>   - [ ] 각 DB의 `healthcheck.test` 명령이 서로 다른 형태임을 Compose 파일에서 확인했다

> **[실무자 렌즈 ★★★]**
> - MySQL은 관계형 데이터(정규화된 테이블), Redis는 세션/캐시, MongoDB는 비정형 문서 저장에 적합하다.
> - 실무에서는 세 DB를 함께 쓰는 경우가 많다. 예: 웹 서버가 MySQL로 주문 데이터를 저장하고, Redis로 장바구니 세션을 관리하며, MongoDB로 상품 리뷰 원문을 보관한다.
> - `docker compose up mysql redis` 처럼 서비스 이름을 지정하면 필요한 DB만 선택 실행할 수 있다.

---

## 예제 9: Spring Boot 앱 Docker화

`viii-1-9-springboot-docker/` 폴더에 있다.

Gradle로 빌드하는 Spring Boot 앱을 2-stage 멀티스테이지 빌드로 Docker화한다.
Stage 1에서 `eclipse-temurin:21-jdk`로 JAR를 생성하고, Stage 2에서 `eclipse-temurin:21-jre-alpine`만 포함해 이미지 크기를 줄인다.
비루트 사용자(`app`)로 실행하고, Spring Actuator 헬스체크를 Compose에서 활용한다.
포트: `8080`.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose up --build -d` 후 `curl -s localhost:8080/actuator/health` 로 앱 상태 확인
> - **흔한 함정**: `./gradlew bootJar`가 처음 실행될 때 의존성 다운로드로 수 분이 걸린다. 두 번째 빌드부터 레이어 캐시가 적용되어 빠르다.
> - **체크리스트**:
>   - [ ] `docker compose up --build -d` 가 오류 없이 완료됐다
>   - [ ] `curl -s localhost:8080/actuator/health` 가 `{"status":"UP"}` 을 반환한다
>   - [ ] `docker images` 에서 JDK 기반 이미지보다 JRE 기반 최종 이미지가 작다는 것을 확인했다

> **[실무자 렌즈 ★★★]**
> - JDK(개발 도구 포함)를 빌드 스테이지에만 쓰고, 런타임에는 JRE(실행 환경만)를 쓰는 패턴이 Spring Boot 표준이다.
> - `eclipse-temurin:21-jre-alpine`은 `eclipse-temurin:21-jdk`보다 이미지 크기가 약 3배 작다.
> - `SPRING_PROFILES_ACTIVE: docker` 환경변수로 프로파일별 설정을 분리할 수 있다.

---

## 예제 10: Node.js (Express) 앱 Docker화

`viii-1-10-nodejs-docker/` 폴더에 있다.

Express 앱을 `node:20-alpine` 기반 단일 스테이지 이미지로 Docker화한다.
`package.json`을 소스보다 먼저 COPY해 레이어 캐시를 최대한 활용한다.
`npm ci --omit=dev`로 개발 의존성을 제외하고, 비루트 사용자(`app`)로 실행한다.
포트: `3000`.

> **[입문 렌즈 ★☆☆]**
> - **비유**: `package.json`을 먼저 복사하는 이유는 재료 목록(레시피)을 먼저 준비하고, 소스 코드(요리)를 나중에 넣는 것과 같다. 소스 코드만 바뀌면 재료 준비 단계를 건너뛸 수 있다.
> - **체감 예시**: 소스 코드만 수정하면 `docker build`가 `npm ci` 단계를 재실행하지 않고 바로 이미지를 만든다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose up --build -d` 후 `curl -s localhost:3000/health` 로 응답 확인
> - **흔한 함정**: `.dockerignore`에 `node_modules`를 포함해야 한다. 없으면 호스트의 `node_modules`가 컨테이너 안으로 복사되어 플랫폼 충돌이 발생한다.
> - **체크리스트**:
>   - [ ] `.dockerignore`에 `node_modules`가 있는지 확인했다
>   - [ ] `docker compose up --build -d` 가 오류 없이 완료됐다
>   - [ ] `curl -s localhost:3000/health` 가 정상 응답을 반환한다

---

## 예제 11: Next.js 앱 Docker화

`viii-1-11-nextjs-docker/` 폴더에 있다.

Next.js 앱을 3-stage 멀티스테이지 빌드로 Docker화한다.
Stage 1(`deps`)에서 의존성 설치, Stage 2(`builder`)에서 `npm run build`, Stage 3(`runner`)에서 `standalone` 출력만 실행한다.
`next.config.js`의 `output: 'standalone'` 설정이 필수다.
포트: `3000`.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 3-stage 빌드는 공장 3라인과 같다. 1라인(재료 준비) → 2라인(제품 조립) → 3라인(포장·출하). 출하 상자에는 판매할 제품만 담는다.
> - **체감 예시**: `next build`가 생성한 수백 MB의 빌드 산출물 중 `standalone` 폴더만 최종 이미지에 담아 크기를 대폭 줄인다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose up --build -d` 후 브라우저에서 `http://localhost:3000` 접속
> - **흔한 함정**: `next.config.js`에 `output: 'standalone'`이 없으면 `standalone` 폴더가 생성되지 않아 `COPY --from=builder .next/standalone` 단계에서 실패한다.
> - **체크리스트**:
>   - [ ] `next.config.js`에 `output: 'standalone'`이 설정되어 있다
>   - [ ] `.dockerignore`에 `node_modules`와 `.next`가 있는지 확인했다
>   - [ ] `docker compose up --build -d` 가 오류 없이 완료됐다

---

## 예제 12: HTML+Nginx 정적 사이트 Docker화

`viii-1-12-html-nginx-docker/` 폴더에 있다.

가장 단순한 Docker 예제다. `nginx:alpine` 이미지에 커스텀 `nginx.conf`와 `public/` 폴더의 정적 파일을 복사해 웹 서버를 만든다.
서버 측 런타임(Node.js, Python 등)이 전혀 없고, Nginx만으로 HTML/CSS/JS를 서빙한다.
포트: `80`.

> **[입문 렌즈 ★☆☆]**
> - **비유**: USB에 HTML 파일을 담아 공용 컴퓨터에 꽂는 것과 같다. Nginx가 공용 컴퓨터 역할을 한다.
> - **체감 예시**: `docker compose up -d` 한 줄로 `http://localhost`에서 정적 사이트가 뜬다. 별도의 빌드 과정이 없다.
> - **주의**: 정적 파일만 서빙하므로 API 호출이나 DB 연결은 이 예제에 포함되지 않는다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose up -d` 후 `curl -s localhost` 또는 브라우저에서 `http://localhost` 접속
> - **흔한 함정**: 포트 `80`이 이미 사용 중이면 `docker compose up` 이 실패한다. `lsof -i :80` (Mac/Linux) 또는 `netstat -ano | findstr :80` (Windows)으로 충돌 프로세스를 확인한다.
> - **체크리스트**:
>   - [ ] `docker compose up -d` 가 오류 없이 완료됐다
>   - [ ] 브라우저에서 `http://localhost` 가 정상적으로 열린다
>   - [ ] `public/index.html`을 수정 후 `docker compose up --build -d` 로 변경 사항이 반영됐다

---

## 참고

- 모든 예제는 로컬 학습용이다. 프로덕션 환경에서 그대로 사용하지 않는다.
- 예제에서 사용하는 포트: `80`(Nginx/HTML), `3000`(Node.js/Next.js), `3306`(MySQL), `5432`(Postgres), `6379`(Redis), `8000`(FastAPI), `8080`(Spring Boot), `27017`(MongoDB)
- 포트 충돌 시 각 예제 README의 "트러블슈팅" 섹션을 참고한다.
- 검증 스크립트는 Git Bash 또는 macOS/Linux bash 전용이다.
