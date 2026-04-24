### VIII-1-5. MySQL을 Docker로 실행하기

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 MySQL을 Docker 컨테이너로 실행하고, 볼륨으로 데이터를 영속화하고, CLI로 접속해서 기본 CRUD를 실행할 수 있다.
- **설명**:
  MySQL은 세계에서 가장 많이 쓰이는 관계형 데이터베이스(RDB)다. 개발 환경에서 MySQL을 Docker로 실행하면 설치·제거가 쉽고, 팀원과 완전히 동일한 버전을 쓸 수 있다. 이 Section에서는 `docker run`으로 MySQL 컨테이너를 띄우고, 환경변수로 초기 설정을 하고, 볼륨으로 데이터를 유지하는 방법을 익힌다.
- **핵심 키워드**: `mysql:8.0`, `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, 볼륨 영속화, `docker-entrypoint-initdb.d`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: V-1-2 (볼륨과 바인드 마운트), VIII-1-1 (docker run 핵심 옵션)
- **다음 섹션**: VIII-1-6

#### 본문

##### 왜 공식 이미지를 쓰나

Docker Hub에는 수많은 MySQL 이미지가 있지만, 반드시 `mysql:8.0`처럼 공식 이미지(Official Image)를 선택한다. 공식 이미지는 Docker와 MySQL 팀이 함께 관리하고, 보안 패치가 빠르게 적용된다. 태그에서 `latest` 대신 `8.0` 같은 버전을 고정하면 팀원 모두가 동일한 버전을 사용하게 된다.

```bash
# Docker Hub에서 mysql:8.0 이미지 확인
docker pull mysql:8.0

# 이미지 크기 확인
docker images mysql
```

##### 컨테이너 실행

MySQL 컨테이너를 실행할 때 반드시 루트 비밀번호를 환경변수로 전달해야 한다. 비밀번호 없이 실행하면 컨테이너가 즉시 중지된다.

```bash
# 기본 실행 (데이터 영속화 없음 — 실습 확인용)
docker run -d \
  --name mysql-demo \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=demo \
  -p 3306:3306 \
  mysql:8.0
```

```bash
# 컨테이너가 정상 시작되었는지 확인
docker ps

# MySQL 초기화 로그 확인 (시작에 10~30초 걸릴 수 있음)
docker logs -f mysql-demo
# "ready for connections" 메시지가 보이면 Ctrl+C
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: MySQL 컨테이너는 도시락 통에 DB를 넣어두는 것과 같다. 뚜껑(컨테이너)을 열면 DB가 바로 실행된다. 환경변수는 도시락을 만들기 전에 설정하는 레시피다.
> - **체감 예시**: 팀원이 "MySQL 8.0 써요"라고 하면, 예전에는 직접 설치해야 했다. 이제는 `docker run mysql:8.0` 한 줄이면 동일한 환경이 5초 안에 준비된다.
> - **주의**: `-e MYSQL_ROOT_PASSWORD`를 생략하면 컨테이너가 즉시 종료된다. `docker logs mysql-demo`에서 "No password option specified" 에러를 확인할 수 있다.

##### 환경변수 4가지

MySQL 공식 이미지는 초기 설정을 환경변수로 받는다. 자주 쓰는 4가지를 알면 충분하다.

| 환경변수 | 역할 | 예시 |
|:--|:--|:--|
| `MYSQL_ROOT_PASSWORD` | root 계정 비밀번호. 반드시 설정 (필수) | `rootpass` |
| `MYSQL_DATABASE` | 시작 시 자동 생성할 데이터베이스 이름 | `demo` |
| `MYSQL_USER` | 일반 사용자 계정 이름 | `appuser` |
| `MYSQL_PASSWORD` | MYSQL_USER의 비밀번호 | `apppass` |

`MYSQL_USER`와 `MYSQL_PASSWORD`를 함께 설정하면, root 말고 애플리케이션 전용 계정이 생성된다. 프로덕션에서는 root 계정 대신 권한이 제한된 전용 계정을 사용하는 것이 기본 원칙이다.

```bash
# 일반 사용자 계정까지 함께 생성
docker run -d \
  --name mysql-demo \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=demo \
  -e MYSQL_USER=appuser \
  -e MYSQL_PASSWORD=apppass \
  -p 3306:3306 \
  mysql:8.0
```

##### 볼륨으로 데이터 영속화

볼륨 마운트 없이 컨테이너를 삭제하면 DB 데이터가 모두 사라진다. MySQL의 데이터 저장 경로는 `/var/lib/mysql`이다. 이 경로를 Docker 볼륨에 연결하면 컨테이너를 삭제해도 데이터가 남는다.

```bash
# 볼륨을 먼저 생성
docker volume create mysql_data

# 볼륨 마운트와 함께 실행
docker run -d \
  --name mysql-demo \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=demo \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

##### 초기 SQL 파일 자동 실행

`/docker-entrypoint-initdb.d/` 경로에 `.sql` 파일을 마운트하면, 컨테이너가 처음 시작될 때 자동으로 실행된다. 테이블 생성이나 초기 데이터 삽입에 활용한다.

```bash
# init.sql 파일 예시 (호스트에서 작성)
cat > init.sql << 'EOF'
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES
  ('홍길동', 'hong@example.com'),
  ('김철수', 'kim@example.com');
EOF
```

```bash
# 초기 SQL 파일을 바인드 마운트로 주입
docker run -d \
  --name mysql-demo \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=demo \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  -v ./init.sql:/docker-entrypoint-initdb.d/01_init.sql:ro \
  mysql:8.0
```

> `:ro`는 read-only 마운트를 의미한다. 컨테이너가 해당 파일을 수정할 수 없게 보호한다. 초기화 파일은 볼륨 데이터가 이미 존재하면 실행되지 않는다. 컨테이너를 처음 생성할 때만 동작한다.

> **[주니어 렌즈 ★★☆]**
> - **초기화 파일 실행 순서**: `/docker-entrypoint-initdb.d/`에 여러 파일을 넣으면 알파벳 순서로 실행된다. `01_schema.sql` → `02_data.sql` 처럼 번호로 순서를 명시한다.
> - **볼륨이 이미 있으면**: 볼륨에 데이터가 존재하면 initdb.d 스크립트가 실행되지 않는다. 초기화를 다시 하려면 `docker volume rm mysql_data`로 볼륨을 지우고 다시 실행한다.
> - **포트 충돌**: 호스트에 MySQL이 이미 설치되어 있으면 3306 포트가 충돌한다. `-p 3307:3306`처럼 다른 호스트 포트를 사용하거나, 호스트 MySQL 서비스를 중지한다.

##### CLI로 접속해서 CRUD 실행

`docker exec`로 컨테이너 내부의 mysql 클라이언트를 실행한다.

```bash
# root 계정으로 접속 (-p 뒤에 비밀번호를 직접 입력)
docker exec -it mysql-demo mysql -u root -prootpass

# 또는 비밀번호를 프롬프트에서 입력 (보안상 권장)
docker exec -it mysql-demo mysql -u root -p
```

```sql
-- 데이터베이스 목록 확인
SHOW DATABASES;

-- demo 데이터베이스 사용
USE demo;

-- 테이블 확인
SHOW TABLES;

-- 데이터 조회
SELECT * FROM users;

-- 데이터 삽입
INSERT INTO users (name, email) VALUES ('이영희', 'lee@example.com');

-- 다시 조회
SELECT id, name, email FROM users;

-- 접속 종료
EXIT;
```

##### Docker Compose 버전

CLI 명령이 길어지면 관리하기 어렵다. Docker Compose 파일로 정리하면 한 번에 실행하고 재현할 수 있다. 예제 파일은 `examples/viii-1-5-mysql-docker/` 폴더를 참조한다.

```yaml
# examples/viii-1-5-mysql-docker/docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql-demo
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: demo
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/01_init.sql:ro
    restart: unless-stopped

volumes:
  mysql_data:
```

```bash
# 실행
docker compose up -d

# 로그 확인
docker compose logs -f mysql

# 중지 (데이터 유지)
docker compose down

# 중지 + 볼륨까지 삭제 (데이터 완전 삭제 — 주의!)
docker compose down -v
```

##### 데이터 생존 테스트

볼륨이 실제로 동작하는지 확인하는 방법이다.

```bash
# 1. 컨테이너 실행 후 데이터 삽입
docker compose up -d
docker exec -it mysql-demo mysql -u root -prootpass -e "USE demo; SELECT * FROM users;"

# 2. 컨테이너 삭제 (데이터 유지)
docker compose down

# 3. 컨테이너 재생성
docker compose up -d

# 4. 데이터가 살아 있는지 확인
docker exec -it mysql-demo mysql -u root -prootpass -e "USE demo; SELECT * FROM users;"
# 이전에 삽입한 데이터가 그대로 있으면 영속화 성공
```

> **경고**: `docker compose down -v`를 실행하면 named volume(`mysql_data`)이 삭제된다. 모든 DB 데이터가 사라지므로, 프로덕션 환경에서는 절대 실행하지 않는다.

> **[실무자 렌즈 ★★★]**
> - **환경변수 보안**: `MYSQL_ROOT_PASSWORD`를 compose.yml에 직접 쓰면 버전 관리에 노출된다. `env_file:` 옵션으로 `.env` 파일에서 읽거나, Docker Secrets(Swarm/K8s) 또는 AWS Secrets Manager 같은 외부 시크릿 관리 도구를 사용한다.
> - **커넥션 풀**: 애플리케이션에서 MySQL에 연결할 때 직접 커넥션을 여닫는 대신 커넥션 풀(connection pool)을 사용한다. SQLAlchemy의 `pool_size`, HikariCP의 `maximumPoolSize` 등을 설정하면 컨테이너 재시작 시 연결이 끊겨도 자동으로 복구된다.
> - **헬스체크 설정**: MySQL이 완전히 준비되기 전에 애플리케이션이 연결을 시도하면 에러가 발생한다. healthcheck에 `mysqladmin ping` 명령을 사용하고, 다른 서비스는 `depends_on.condition: service_healthy`로 순서를 보장한다.

##### 핵심 환경변수 및 볼륨 경로 요약

| 항목 | MySQL |
|:--|:--|
| 이미지 | `mysql:8.0` |
| 필수 환경변수 | `MYSQL_ROOT_PASSWORD` |
| 선택 환경변수 | `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` |
| 데이터 경로 | `/var/lib/mysql` |
| 초기화 스크립트 경로 | `/docker-entrypoint-initdb.d/` |
| 기본 포트 | `3306` |

##### 체크포인트

- [ ] `docker run`으로 MySQL 컨테이너를 실행하고 `docker ps`로 Running 상태를 확인할 수 있다
- [ ] `docker exec -it mysql-demo mysql -u root -p`로 CLI에 접속해서 SELECT를 실행할 수 있다
- [ ] 볼륨 마운트 없이 삭제하면 데이터가 사라지고, 볼륨을 연결하면 데이터가 유지됨을 실제로 확인할 수 있다
- [ ] `docker compose down`과 `docker compose down -v`의 차이를 설명할 수 있다
- [ ] `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` 네 환경변수의 역할을 설명할 수 있다

---

