### VIII-1-6. Redis를 Docker로 실행하기

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 Redis를 Docker 컨테이너로 실행하고, redis-cli로 기본 명령을 실행하고, 데이터 영속화를 설정할 수 있다.
- **설명**:
  Redis는 메모리 기반의 키-값 저장소다. 데이터를 메모리에 올려두기 때문에 읽기·쓰기 속도가 관계형 데이터베이스보다 월등히 빠르다. 세션 저장, 캐시, 실시간 랭킹, 메시지 큐 등 다양한 용도로 쓰인다. Docker로 실행하면 설치 없이 바로 Redis 환경을 만들 수 있다.
- **핵심 키워드**: `redis:7-alpine`, `redis-cli`, `SET/GET/DEL/EXPIRE/TTL`, AOF 영속화, `--requirepass`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: V-1-2 (볼륨과 바인드 마운트), VIII-1-1 (docker run 핵심 옵션)
- **다음 섹션**: VIII-1-7

#### 본문

##### redis:7-alpine 이미지

`redis:7-alpine`은 Alpine Linux(5MB 수준의 경량 리눅스)를 기반으로 만든 이미지다. `redis:7`(데비안 기반, 약 120MB)보다 훨씬 작아서 컨테이너 시작이 빠르고 보안 취약점 노출도 적다. 개발·프로덕션 모두에서 alpine 버전을 권장한다.

```bash
# 이미지 크기 비교
docker pull redis:7
docker pull redis:7-alpine
docker images redis
# REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
# redis        7         ...            ...            ~120MB
# redis        7-alpine  ...            ...            ~30MB
```

##### 컨테이너 실행

Redis는 환경변수 없이도 실행된다. 기본 설정으로 바로 시작할 수 있다.

```bash
# 기본 실행
docker run -d \
  --name redis-demo \
  -p 6379:6379 \
  redis:7-alpine
```

```bash
# 실행 확인
docker ps

# 시작 로그 확인
docker logs redis-demo
# "Ready to accept connections" 메시지가 보이면 정상
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: Redis는 아주 빠른 메모장이다. 서랍(메모리)에 메모를 넣고 꺼내는 속도가 일반 파일 캐비넷(데이터베이스)보다 수백 배 빠르다. 대신 전기가 꺼지면 서랍 내용이 사라진다 — 영속화를 설정하지 않으면.
> - **체감 예시**: 로그인한 사용자 정보를 MySQL에서 매번 조회하면 느리다. Redis에 5분 동안 저장해두면 같은 조회가 수십 배 빨라진다.
> - **주의**: Redis는 기본적으로 인증 없이 누구나 접속할 수 있다. 개발 환경이라도 포트를 외부에 노출하지 않도록 주의한다.

##### redis-cli로 접속

`docker exec`로 컨테이너 내부의 redis-cli를 실행한다.

```bash
# redis-cli 접속
docker exec -it redis-demo redis-cli

# 접속 확인 (서버에 ping을 보내면 PONG으로 응답)
127.0.0.1:6379> PING
PONG
```

##### 기본 명령 실습

Redis의 핵심 명령을 익힌다. 키-값(key-value) 구조로 데이터를 저장한다.

```bash
# SET: 값 저장
127.0.0.1:6379> SET username "홍길동"
OK

# GET: 값 조회
127.0.0.1:6379> GET username
"홍길동"

# DEL: 키 삭제
127.0.0.1:6379> DEL username
(integer) 1

# KEYS: 키 목록 조회 (* = 모든 키)
127.0.0.1:6379> KEYS *
(empty array)
```

```bash
# EXPIRE: 만료 시간 설정 (초 단위)
127.0.0.1:6379> SET session_token "abc123"
OK
127.0.0.1:6379> EXPIRE session_token 300
(integer) 1

# TTL: 남은 만료 시간 확인 (초 단위)
127.0.0.1:6379> TTL session_token
(integer) 298

# SETEX: SET + EXPIRE 한 번에 (키, 만료시간, 값)
127.0.0.1:6379> SETEX cache_key 60 "cached_data"
OK

# 접속 종료
127.0.0.1:6379> EXIT
```

| 명령 | 설명 | 예시 |
|:--|:--|:--|
| `SET key value` | 값 저장 | `SET name "홍길동"` |
| `GET key` | 값 조회 | `GET name` |
| `DEL key` | 키 삭제 | `DEL name` |
| `KEYS pattern` | 키 목록 조회 | `KEYS *`, `KEYS user:*` |
| `EXPIRE key seconds` | 만료 시간 설정 | `EXPIRE session 300` |
| `TTL key` | 남은 만료 시간 확인 | `TTL session` |
| `SETEX key seconds value` | 저장과 동시에 만료 설정 | `SETEX token 60 "abc"` |

> **[주니어 렌즈 ★★☆]**
> - **KEYS * 주의**: 프로덕션에서 `KEYS *`는 절대 사용하지 않는다. 키 수가 많으면 Redis가 수 초 동안 응답하지 않는다. 대신 `SCAN` 명령을 쓴다.
> - **데이터 타입**: Redis는 String 외에도 List, Hash, Set, Sorted Set 등 다양한 타입을 지원한다. 세션은 Hash, 랭킹은 Sorted Set이 자주 쓰인다.
> - **네임스페이스 관리**: 키 이름을 `user:1:session`, `product:42:cache` 처럼 콜론으로 구분해서 관리하면 충돌을 방지하고 패턴 검색이 쉬워진다.

##### 패스워드 설정

Redis는 기본적으로 인증 없이 접속 가능하다. `--requirepass` 옵션으로 비밀번호를 설정한다.

```bash
# 패스워드 설정과 함께 실행
docker run -d \
  --name redis-demo \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --requirepass "mypassword"
```

```bash
# 패스워드 없이 접속하면 에러
docker exec -it redis-demo redis-cli
127.0.0.1:6379> PING
(error) NOAUTH Authentication required.

# 패스워드로 인증
127.0.0.1:6379> AUTH mypassword
OK
127.0.0.1:6379> PING
PONG

# 또는 접속 시 바로 인증
docker exec -it redis-demo redis-cli -a mypassword
```

##### 데이터 영속화 (AOF)

Redis는 메모리 기반이므로 컨테이너를 재시작하면 데이터가 사라진다. `--appendonly yes` 옵션으로 AOF(Append Only File) 영속화를 활성화하면, 모든 쓰기 명령을 파일에 기록해서 재시작 후에도 데이터를 복구할 수 있다.

```bash
# AOF 영속화 + 볼륨 마운트 + 패스워드 설정
docker run -d \
  --name redis-demo \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine \
  redis-server --requirepass "mypassword" --appendonly yes
```

Redis의 데이터 저장 경로는 `/data`다. 이 경로를 Docker 볼륨에 연결한다.

##### Docker Compose 버전

예제 파일은 `examples/viii-1-6-redis-docker/` 폴더를 참조한다.

```yaml
# examples/viii-1-6-redis-docker/docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    container_name: redis-demo
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --requirepass "mypassword" --appendonly yes
    restart: unless-stopped

volumes:
  redis_data:
```

```bash
# 실행
docker compose up -d

# redis-cli 접속 (패스워드 포함)
docker exec -it redis-demo redis-cli -a mypassword

# 중지 (데이터 유지)
docker compose down

# 중지 + 볼륨 삭제 (데이터 완전 삭제 — 주의!)
docker compose down -v
```

##### Redis를 활용하는 실제 시나리오

Redis는 다양한 용도로 사용된다. 아래는 가장 흔한 3가지 패턴이다.

| 시나리오 | 설명 | TTL 설정 |
|:--|:--|:--|
| 세션 스토어 | 로그인 세션 정보 저장 (서버 확장 시 공유 가능) | 로그인 유지 시간 (예: 1800초) |
| API 응답 캐시 | 자주 조회되지만 잘 바뀌지 않는 데이터 캐싱 | 데이터 갱신 주기에 따라 |
| 속도 제한 | API 요청 횟수 카운팅 (rate limiting) | 1분, 1시간 등 윈도우 크기 |

```bash
# 세션 저장 예시
SET session:user:42 '{"userId":42,"role":"admin"}' EX 1800

# 캐시 저장 예시
SET cache:products:list '[{"id":1,"name":"상품A"},...]' EX 300

# 요청 횟수 카운팅 예시
INCR rate:ip:192.168.1.1:minute:202604231530
EXPIRE rate:ip:192.168.1.1:minute:202604231530 60
```

> **[실무자 렌즈 ★★★]**
> - **AOF vs RDB**: Redis의 영속화 방식은 두 가지다. AOF는 모든 쓰기 명령을 로그 파일에 기록해서 복구 정확도가 높다. RDB는 주기적으로 스냅샷을 저장해서 파일이 작고 복구 속도가 빠르다. 프로덕션에서는 두 가지를 함께 쓰는 것이 권장된다.
> - **메모리 정책**: Redis는 메모리가 가득 차면 설정된 eviction 정책(LRU, LFU 등)에 따라 오래된 키를 자동으로 삭제한다. 캐시 용도라면 `maxmemory-policy allkeys-lru`를 설정한다.
> - **Redis Cluster vs Sentinel**: 단일 Redis 노드는 단일 장애점(SPOF)이 된다. 프로덕션에서는 Sentinel(장애 감지·자동 페일오버)이나 Cluster(샤딩·수평 확장)를 사용한다. AWS ElastiCache, GCP Memorystore 같은 관리형 서비스도 고려한다.

##### 핵심 설정 요약

| 항목 | Redis |
|:--|:--|
| 이미지 | `redis:7-alpine` |
| 인증 옵션 | `redis-server --requirepass <비밀번호>` |
| 영속화 옵션 | `redis-server --appendonly yes` |
| 데이터 경로 | `/data` |
| 기본 포트 | `6379` |

##### 체크포인트

- [ ] `docker run redis:7-alpine`으로 컨테이너를 실행하고 `docker logs`에서 "Ready to accept connections" 메시지를 확인할 수 있다
- [ ] `docker exec -it redis-demo redis-cli`로 접속해서 `SET`, `GET`, `EXPIRE`, `TTL` 명령을 실행할 수 있다
- [ ] `--requirepass` 옵션으로 패스워드를 설정하고, 인증 없이 접속하면 에러가 발생함을 확인할 수 있다
- [ ] `--appendonly yes`와 볼륨 마운트를 설정하고, 컨테이너 재시작 후에도 데이터가 살아 있음을 확인할 수 있다
- [ ] Redis를 캐시, 세션, 속도 제한 중 어떤 시나리오에서 사용하는지 설명할 수 있다

---

