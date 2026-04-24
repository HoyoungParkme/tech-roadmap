### VIII-1-7. MongoDB를 Docker로 실행하기

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 MongoDB를 Docker 컨테이너로 실행하고, mongosh로 기본 CRUD를 실행하고, 볼륨으로 데이터를 영속화할 수 있다.
- **설명**:
  MongoDB는 JSON과 유사한 BSON 형식으로 데이터를 저장하는 대표적인 NoSQL 데이터베이스다. 고정된 스키마(테이블 구조)가 없어서 자유롭게 데이터를 저장할 수 있다. API 서버의 응답 데이터, 사용자별로 구조가 다른 데이터, 빠르게 변하는 스키마 등에 적합하다.
- **핵심 키워드**: `mongo:7`, `mongosh`, `insertOne/find/updateOne/deleteOne`, `MONGO_INITDB_ROOT_USERNAME`, 볼륨 영속화
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: V-1-2 (볼륨과 바인드 마운트), VIII-1-1 (docker run 핵심 옵션)
- **다음 섹션**: VIII-1-8

#### 본문

##### RDB vs NoSQL — 간단 비교

MongoDB를 시작하기 전에 MySQL/PostgreSQL 같은 관계형 데이터베이스(RDB)와의 차이를 이해하면 언제 어떤 것을 쓸지 판단할 수 있다.

| 항목 | RDB (MySQL, PostgreSQL) | NoSQL (MongoDB) |
|:--|:--|:--|
| 데이터 형식 | 행(Row)과 열(Column), 고정 스키마 | 문서(Document), 유연한 스키마 |
| 쿼리 언어 | SQL | MongoDB Query Language (MQL) |
| 관계 표현 | 외래 키, JOIN | 임베딩 또는 참조 |
| 확장 방식 | 수직 확장 (서버 업그레이드) 주도 | 수평 확장 (샤딩) 유리 |
| 적합한 경우 | 정형 데이터, 복잡한 조인, 트랜잭션 | 비정형 데이터, 빠른 스키마 변경, 대용량 |

##### 컨테이너 실행

MongoDB는 `MONGO_INITDB_ROOT_USERNAME`과 `MONGO_INITDB_ROOT_PASSWORD` 환경변수로 최초 관리자 계정을 설정한다. 설정하지 않으면 인증 없이 접속되는 취약한 상태가 된다.

```bash
# 기본 실행 (인증 설정 포함)
docker run -d \
  --name mongo-demo \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=mongopass \
  -p 27017:27017 \
  mongo:7
```

```bash
# 실행 확인
docker ps

# 초기화 로그 확인
docker logs -f mongo-demo
# "Waiting for connections" 메시지가 보이면 준비 완료. Ctrl+C
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: MongoDB는 마치 서랍장에 봉투를 넣는 것과 같다. MySQL이 엄격한 서식지(테이블 구조)에 맞춰 작성해야 한다면, MongoDB는 봉투 안에 자유롭게 내용물을 넣을 수 있다. 봉투마다 내용물이 달라도 된다.
> - **체감 예시**: 사용자마다 프로필 필드가 다른 SNS 서비스를 만든다고 하자. MySQL은 모든 사용자에게 동일한 컬럼이 필요하지만, MongoDB는 각 문서에 서로 다른 필드를 넣을 수 있다.
> - **용어 대응**: MongoDB의 `데이터베이스 > 컬렉션 > 문서`는 RDB의 `데이터베이스 > 테이블 > 행`에 대응한다.

##### mongosh로 접속

MongoDB 7 이상에서는 구형 `mongo` 클라이언트 대신 `mongosh`를 사용한다.

```bash
# mongosh로 접속 (인증 포함)
docker exec -it mongo-demo mongosh -u root -p mongopass

# 접속 확인
test> db.runCommand({ ping: 1 })
{ ok: 1 }
```

##### 기본 CRUD 실습

MongoDB의 모든 데이터는 컬렉션(collection) 안에 문서(document) 형태로 저장된다.

```javascript
// 데이터베이스 전환 (없으면 자동 생성)
test> use demo
switched to db demo

// 문서 삽입 (insertOne)
demo> db.users.insertOne({
  name: "홍길동",
  email: "hong@example.com",
  age: 30,
  tags: ["admin", "developer"]
})
// 응답: { acknowledged: true, insertedId: ObjectId('...') }
```

```javascript
// 여러 문서 삽입 (insertMany)
demo> db.users.insertMany([
  { name: "김철수", email: "kim@example.com", age: 25 },
  { name: "이영희", email: "lee@example.com", age: 28, role: "manager" }
])
```

```javascript
// 전체 조회 (find)
demo> db.users.find()

// 조건 조회 (age가 26 이상인 문서)
demo> db.users.find({ age: { $gte: 26 } })

// 특정 필드만 조회 (name, email만, _id 제외)
demo> db.users.find({}, { name: 1, email: 1, _id: 0 })
```

```javascript
// 단일 문서 수정 (updateOne)
demo> db.users.updateOne(
  { name: "홍길동" },           // 조건
  { $set: { age: 31 } }        // 수정 내용
)

// 단일 문서 삭제 (deleteOne)
demo> db.users.deleteOne({ name: "김철수" })

// 컬렉션의 모든 문서 수 확인
demo> db.users.countDocuments()

// 접속 종료
demo> exit
```

> **[주니어 렌즈 ★★☆]**
> - **_id 필드**: MongoDB는 모든 문서에 자동으로 `_id` 필드를 추가한다. `ObjectId`라는 12바이트 고유 식별자다. 직접 지정할 수도 있지만, 자동 생성이 중복 없이 고유함을 보장한다.
> - **$연산자**: 조회와 수정에 `$gte`(이상), `$lte`(이하), `$set`(설정), `$push`(배열 추가) 같은 연산자를 사용한다. MySQL의 WHERE 절과 UPDATE SET에 대응한다.
> - **스키마가 없다는 뜻**: 컬렉션에 `age` 필드가 있는 문서와 없는 문서가 공존할 수 있다. 유연하지만 애플리케이션 레벨에서 스키마를 검증하지 않으면 데이터 품질이 낮아진다. Mongoose(Node.js)나 Motor+Pydantic(Python) 같은 ODM(Object-Document Mapper)을 사용하면 스키마를 강제할 수 있다.

##### 환경변수와 인증 설정

| 환경변수 | 역할 | 예시 |
|:--|:--|:--|
| `MONGO_INITDB_ROOT_USERNAME` | 최초 관리자 계정 이름 | `root` |
| `MONGO_INITDB_ROOT_PASSWORD` | 최초 관리자 계정 비밀번호 | `mongopass` |
| `MONGO_INITDB_DATABASE` | 초기화 스크립트가 실행될 데이터베이스 | `demo` |

##### 초기 스크립트 자동 실행

`/docker-entrypoint-initdb.d/` 경로에 `.js` 또는 `.sh` 파일을 마운트하면, 컨테이너 첫 실행 시 자동으로 실행된다.

```javascript
// init.js 파일 예시 (호스트에서 작성)
db = db.getSiblingDB('demo');

db.createCollection('users');

db.users.insertMany([
  { name: "초기 사용자 A", email: "a@example.com", role: "admin" },
  { name: "초기 사용자 B", email: "b@example.com", role: "user" }
]);

print("초기 데이터 삽입 완료");
```

```bash
# 초기 스크립트 마운트
docker run -d \
  --name mongo-demo \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=mongopass \
  -e MONGO_INITDB_DATABASE=demo \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  -v ./init.js:/docker-entrypoint-initdb.d/01_init.js:ro \
  mongo:7
```

##### 볼륨 영속화

MongoDB의 데이터 저장 경로는 `/data/db`다. 이 경로를 Docker 볼륨에 연결한다.

```bash
# 볼륨 생성 후 실행
docker volume create mongo_data

docker run -d \
  --name mongo-demo \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=mongopass \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  mongo:7
```

##### Docker Compose 버전

예제 파일은 `examples/viii-1-7-mongodb-docker/` 폴더를 참조한다.

```yaml
# examples/viii-1-7-mongodb-docker/docker-compose.yml
services:
  mongo:
    image: mongo:7
    container_name: mongo-demo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: mongopass
      MONGO_INITDB_DATABASE: demo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./init.js:/docker-entrypoint-initdb.d/01_init.js:ro
    restart: unless-stopped

volumes:
  mongo_data:
```

```bash
# 실행
docker compose up -d

# mongosh 접속
docker exec -it mongo-demo mongosh -u root -p mongopass

# 중지 (데이터 유지)
docker compose down

# 중지 + 볼륨 삭제 (데이터 완전 삭제 — 주의!)
docker compose down -v
```

##### 데이터 생존 테스트

```bash
# 1. 실행 후 문서 삽입
docker compose up -d
docker exec -it mongo-demo mongosh -u root -p mongopass \
  --eval "use demo; db.users.insertOne({name:'테스트'}); db.users.find();"

# 2. 컨테이너 삭제 (볼륨 유지)
docker compose down

# 3. 재생성
docker compose up -d

# 4. 데이터 확인
docker exec -it mongo-demo mongosh -u root -p mongopass \
  --eval "use demo; db.users.find();"
# 이전에 삽입한 문서가 그대로 있으면 영속화 성공
```

> **[실무자 렌즈 ★★★]**
> - **인증 우회 주의**: `MONGO_INITDB_ROOT_USERNAME`을 설정하지 않으면 MongoDB가 `--noauth` 모드로 실행된다. 네트워크에 노출되어 있다면 누구나 DB에 접근할 수 있다. 반드시 인증을 설정한다.
> - **Replica Set**: 프로덕션에서 MongoDB는 단일 노드로 쓰지 않는다. 최소 3개 노드로 구성된 Replica Set을 사용해야 장애 시 자동 페일오버와 데이터 복제가 보장된다. MongoDB Atlas, AWS DocumentDB 같은 관리형 서비스가 이를 자동으로 처리해준다.
> - **ODM 활용**: 애플리케이션에서 직접 MongoDB 드라이버를 쓰면 스키마 없는 특성 때문에 데이터 품질 관리가 어렵다. Node.js는 Mongoose, Python은 Beanie(Pydantic 기반) 또는 Motor를 활용해서 문서 구조를 코드로 정의한다.

##### DB별 핵심 환경변수 및 볼륨 경로 비교

세 DB를 나란히 비교하면 공통 패턴이 보인다.

| 항목 | MySQL | Redis | MongoDB |
|:--|:--|:--|:--|
| 이미지 | `mysql:8.0` | `redis:7-alpine` | `mongo:7` |
| 필수 환경변수 | `MYSQL_ROOT_PASSWORD` | (없음) | `MONGO_INITDB_ROOT_USERNAME` + `PASSWORD` |
| 선택 환경변수 | `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` | `--requirepass` (커맨드 옵션) | `MONGO_INITDB_DATABASE` |
| 데이터 경로 | `/var/lib/mysql` | `/data` | `/data/db` |
| 초기화 스크립트 | `/docker-entrypoint-initdb.d/` (`.sql`) | 없음 | `/docker-entrypoint-initdb.d/` (`.js`, `.sh`) |
| 기본 포트 | `3306` | `6379` | `27017` |
| 접속 CLI | `mysql -u root -p` | `redis-cli` | `mongosh -u root -p` |

##### 체크포인트

- [ ] `docker run`으로 MongoDB 컨테이너를 실행하고 `docker logs`에서 "Waiting for connections" 메시지를 확인할 수 있다
- [ ] `docker exec -it mongo-demo mongosh -u root -p mongopass`로 접속해서 `insertOne`, `find`, `updateOne`, `deleteOne`을 실행할 수 있다
- [ ] MySQL과 MongoDB의 용어 대응(데이터베이스/테이블/행 vs 데이터베이스/컬렉션/문서)을 설명할 수 있다
- [ ] 볼륨 마운트로 데이터를 영속화하고, 컨테이너 재생성 후에도 데이터가 유지됨을 확인할 수 있다
- [ ] MySQL, Redis, MongoDB 중 어떤 상황에 어떤 DB를 선택할지 기준을 말할 수 있다

---

