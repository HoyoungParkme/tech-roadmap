### VIII-1-8. DB 3종 비교와 Compose 조합

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 MySQL, Redis, MongoDB를 하나의 docker-compose.yml로 동시에 실행하고, 각 DB에 접속하여 동작을 확인하고, 선택적으로 특정 서비스만 실행할 수 있다.
- **설명**:
  실무 백엔드 프로젝트는 단일 DB만 쓰지 않는 경우가 많다. 사용자 데이터는 MySQL에, 세션·캐시는 Redis에, 로그나 반정형 데이터는 MongoDB에 저장하는 조합이 대표적이다. Compose를 사용하면 이 세 DB를 하나의 파일로 정의하고 명령어 하나로 실행할 수 있다.
- **핵심 키워드**: `docker compose up -d`, 멀티 서비스 Compose, `healthcheck`, 선택적 서비스 실행, DB 비교표
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-5 (MySQL), VIII-1-6 (Redis), VIII-1-7 (MongoDB)
- **다음 섹션**: VIII-1-9

#### 본문

##### 왜 여러 DB를 함께 쓰는가?

"DB는 하나만 쓰면 안 되나요?"라는 질문이 자연스럽다. 하나의 DB로도 모든 데이터를 저장할 수 있지만, 각 DB는 잘하는 영역이 다르다.

| 역할 | 적합한 DB | 이유 |
|:--|:--|:--|
| 사용자 정보, 주문 이력 등 정형 데이터 | MySQL (또는 PostgreSQL) | 관계형 모델, 트랜잭션, 복잡한 JOIN |
| 로그인 세션, 캐시, 속도 제한 | Redis | 인메모리 고속 읽기/쓰기, TTL 기능 |
| API 응답 저장, 이벤트 로그, 반정형 데이터 | MongoDB | 유연한 스키마, 문서 중심 모델 |

이 세 DB를 Compose로 묶으면 로컬 개발 환경을 실제 프로덕션 구성과 유사하게 만들 수 있다.

##### 하나의 Compose 파일로 3개 DB 실행

예제 파일은 `examples/viii-1-8-db-trio-compose/` 폴더를 참조한다.

```yaml
# examples/viii-1-8-db-trio-compose/docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    container_name: trio-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: demo
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpass"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: trio-redis
    command: redis-server --requirepass redispass --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redispass", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  mongo:
    image: mongo:7
    container_name: trio-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: mongopass
      MONGO_INITDB_DATABASE: demo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "-u", "root", "-p", "mongopass", "--eval", "db.adminCommand('ping').ok"]
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
  mongo_data:
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: 주방에 냉장고(MySQL), 선반(Redis), 서랍장(MongoDB)이 모두 있다. 냉장고는 신선한 재료를 정렬해서 보관하고, 선반은 자주 꺼내는 재료를 빠르게 꺼낼 수 있도록 놓고, 서랍장은 형태가 다양한 물건을 자유롭게 넣는다. 셋 다 있어야 주방이 효율적으로 돌아간다.
> - **핵심 명령 하나**: `docker compose up -d`를 실행하면 세 DB가 모두 백그라운드에서 시작된다. `docker compose down`으로 모두 멈출 수 있다.

##### 3개 DB 동시 실행 및 접속 확인

```bash
# examples/viii-1-8-db-trio-compose/ 폴더에서 실행
docker compose up -d

# 서비스 상태 확인
docker compose ps
```

예상 출력 (healthy 상태가 되기까지 30초 정도 기다린다):

```
NAME          IMAGE           STATUS
trio-mysql    mysql:8.0       Up (healthy)
trio-redis    redis:7-alpine  Up (healthy)
trio-mongo    mongo:7         Up (healthy)
```

```bash
# MySQL 접속 확인
docker exec -it trio-mysql mysql -u root -prootpass -e "SHOW DATABASES;"

# Redis 접속 확인
docker exec -it trio-redis redis-cli -a redispass ping
# 응답: PONG

# MongoDB 접속 확인
docker exec -it trio-mongo mongosh --quiet -u root -p mongopass \
  --eval "db.adminCommand('ping')"
# 응답: { ok: 1 }
```

> **[주니어 렌즈 ★★☆]**
> - **헬스체크 비교**: 각 DB마다 헬스체크 명령이 다르다. MySQL은 `mysqladmin ping`, Redis는 `redis-cli ping`, MongoDB는 `mongosh --eval "db.adminCommand('ping')"` 방식을 사용한다. `start_period`는 컨테이너가 처음 뜰 때 초기화에 걸리는 시간을 감안해서 헬스체크를 유예하는 설정이다.
> - **포트 충돌**: 호스트에 이미 MySQL, Redis, MongoDB가 설치되어 있다면 포트가 충돌한다. `3306`, `6379`, `27017`이 이미 사용 중인지 `docker compose up` 실행 전에 확인한다.
> - **볼륨 독립성**: 각 DB가 서로 다른 볼륨(`mysql_data`, `redis_data`, `mongo_data`)을 사용한다. `docker compose down -v`를 실행하면 세 볼륨이 모두 삭제되므로 주의한다.

##### 각 DB 헬스체크 설정 비교

| 항목 | MySQL | Redis | MongoDB |
|:--|:--|:--|:--|
| 헬스체크 명령 | `mysqladmin ping -h localhost` | `redis-cli ping` | `mongosh --eval "db.adminCommand('ping')"` |
| `interval` 권장값 | 10s | 10s | 15s |
| `start_period` 필요 | O (초기화 30s 이상) | X (즉시 준비) | O (초기화 30s 이상) |
| 인증 옵션 포함 | `-u root -p<패스워드>` | `-a <패스워드>` | `-u root -p <패스워드>` |

##### 선택적 서비스 실행

`docker compose up` 뒤에 서비스 이름을 지정하면 특정 서비스만 실행할 수 있다.

```bash
# MySQL과 Redis만 실행
docker compose up -d mysql redis

# MongoDB만 추가로 실행
docker compose up -d mongo

# 특정 서비스만 중지 (나머지는 계속 실행)
docker compose stop redis

# 특정 서비스만 재시작
docker compose restart mysql

# 특정 서비스 로그만 확인
docker compose logs -f mongo
```

이 기능은 개발 중 필요한 DB만 선택적으로 켜고 끌 때 유용하다. CI 환경에서 테스트 종류에 따라 필요한 서비스만 띄울 때도 활용한다.

> **[실무자 렌즈 ★★★]**
> - **서비스 분리 vs 통합**: 로컬 개발용 Compose에는 세 DB를 하나로 묶는 것이 편리하지만, 프로덕션에서는 각 DB를 독립적으로 관리하는 것이 일반적이다. 데이터베이스는 Kubernetes에서 StatefulSet으로 배포하거나, AWS RDS·ElastiCache·Atlas 같은 관리형 서비스를 사용한다.
> - **Compose profiles**: `profiles: [dev]` 설정을 이용하면 `--profile dev` 옵션을 붙인 경우에만 특정 서비스가 실행되도록 할 수 있다. 모니터링 툴이나 관리자 UI 등 옵션 서비스에 활용한다.
> - **네트워크 격리**: 동일 Compose 파일 안에 있는 서비스는 기본적으로 같은 브리지 네트워크에 연결된다. 애플리케이션 서버가 DB에 접근할 때 컨테이너 이름(`mysql`, `redis`, `mongo`)을 호스트명으로 사용할 수 있다.

##### 체크포인트

- [ ] `docker compose up -d`로 MySQL, Redis, MongoDB 3개를 동시에 실행하고 `docker compose ps`에서 모두 `healthy` 상태임을 확인할 수 있다
- [ ] 각 DB에 대응하는 CLI(`mysql`, `redis-cli`, `mongosh`)로 접속하여 기본 명령을 실행할 수 있다
- [ ] `docker compose up -d mysql redis`로 MongoDB를 제외한 두 서비스만 선택적으로 실행할 수 있다
- [ ] MySQL, Redis, MongoDB의 헬스체크 명령과 `start_period`가 왜 다른지 설명할 수 있다
- [ ] 어떤 데이터는 MySQL에, 어떤 데이터는 Redis에, 어떤 데이터는 MongoDB에 저장하는 것이 적합한지 예를 들어 설명할 수 있다

---

