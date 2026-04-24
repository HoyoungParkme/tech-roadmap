# 예제 V-1-2: Postgres named volume 영구화

## 목적

named volume(이하 볼륨)을 사용해 PostgreSQL 데이터를 Docker 관리 영역에 저장한다.
컨테이너를 삭제하고 다시 시작해도 데이터가 사라지지 않음을 직접 확인하는 것이 핵심 목표다.

볼륨 없이 PostgreSQL을 실행하면 `docker compose down` 한 번으로 모든 데이터가 사라진다.
이 예제는 그 문제를 `pgdata` 볼륨 하나로 해결하는 과정을 단계별로 보여준다.

---

## 사전 요건

| 항목 | 버전 | 확인 명령 |
|:--|:--|:--|
| Docker Engine | 24 이상 | `docker --version` |
| Docker Compose v2 | 2.20 이상 | `docker compose version` |
| psql 클라이언트 | — | `docker compose exec` 로 컨테이너 내부에서 실행하므로 호스트 설치 불필요 |

> `docker-compose`(하이픈)가 아닌 `docker compose`(스페이스)를 사용한다. 하이픈 형식은 v1 레거시다.

---

## 파일 구성

```
v-1-2-postgres-volume/
├── docker-compose.yml      # postgres:16-alpine + pgdata 볼륨 정의
├── .env.example            # 환경 변수 샘플 (복사 후 사용)
├── init.sql                # items 테이블 생성 + seed 1행 삽입
└── tests/
    └── verify_persistence.sh  # 자동 검증 스크립트 (Git Bash / bash 전용)
```

---

## 실행 단계

### 1단계: 환경 변수 파일 복사

```bash
cp .env.example .env
```

`.env` 파일이 생성된다. 학습 환경에서는 기본값 그대로 사용해도 된다.
실제 서비스 환경에서는 `POSTGRES_PASSWORD`를 반드시 변경해야 한다.

### 2단계: 컨테이너 시작

```bash
docker compose up -d
```

`db-1 Started` 가 출력된다. 최초 시작 시 `init.sql`이 자동 실행되어 `items` 테이블이 생성되고 seed 1행이 삽입된다.

### 3단계: 초기 데이터 확인

```bash
docker compose exec db psql -U app -d demo -c "SELECT * FROM items;"
```

seed 1행이 보인다.

```
 id |   name
----+----------
  1 | seed-row
(1 row)
```

### 4단계: 데이터 추가 삽입

```bash
docker compose exec db psql -U app -d demo -c "INSERT INTO items(name) VALUES ('after-insert');"
```

`INSERT 0 1` 이 출력된다.

### 5단계: 컨테이너 삭제 (볼륨은 유지)

```bash
docker compose down
```

`db-1 Removed` 가 출력된다. 이 명령은 컨테이너만 삭제하고 `pgdata` 볼륨은 그대로 남긴다.

### 6단계: 컨테이너 재시작

```bash
docker compose up -d
```

`db-1 Started` 가 출력된다. 이번에는 볼륨이 이미 존재하므로 `init.sql`이 실행되지 않는다.

### 7단계: 데이터 생존 확인 (핵심)

```bash
docker compose exec db psql -U app -d demo -c "SELECT * FROM items;"
```

seed와 after-insert, 두 행 모두 존재한다. 컨테이너가 삭제되었어도 데이터는 살아 있다.

```
 id |     name
----+--------------
  1 | seed-row
  2 | after-insert
(2 rows)
```

### 8단계: 볼륨까지 삭제

```bash
docker compose down -v
```

`db-1 Removed`, `Volume pgdata Removed` 가 출력된다. `-v` 플래그를 붙이면 볼륨도 함께 삭제된다.

### 9단계: 재시작 (볼륨 없음)

```bash
docker compose up -d
```

볼륨이 없으므로 `init.sql`이 다시 실행된다.

### 10단계: 초기화 확인 (핵심)

```bash
docker compose exec db psql -U app -d demo -c "SELECT * FROM items;"
```

seed 1행만 보인다. after-insert는 사라졌다. 이것이 `down -v` 와 `down` 의 차이다.

```
 id |   name
----+----------
  1 | seed-row
(1 row)
```

---

## 렌즈로 이해하기

> **[입문 렌즈 ★☆☆]**
> - **비유**: named volume은 외장 하드와 같다. 본체(컨테이너)를 바꿔도 외장 하드는 그대로 꽂으면 데이터가 살아 있다. Docker가 외장 하드의 위치를 대신 관리해 준다.
> - **체감 예시**: 온라인 게임에서 캐릭터 정보가 서버에 저장되어 있어 내 PC를 바꿔도 그대로 불러올 수 있는 것과 같다. 볼륨이 없으면 컨테이너를 재시작할 때마다 캐릭터가 초기화된다.
> - **주의**: `docker compose down`과 `docker compose down -v`는 완전히 다르다. `-v`가 붙으면 볼륨까지 삭제된다. 실수로 개발 DB가 날아가는 가장 흔한 원인이다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker volume ls` — 현재 존재하는 볼륨 목록 확인. `pgdata` 볼륨이 보여야 정상이다.
> - **흔한 함정**: `init.sql`은 볼륨이 비어 있을 때만 실행된다. 이미 데이터가 있는 볼륨에 컨테이너를 붙이면 `init.sql`이 무시된다. 스키마를 변경했는데 반영이 안 된다면 `docker compose down -v` 후 재시작해야 한다.
> - **체크리스트**:
>   - [ ] `docker volume ls` 로 `pgdata` 볼륨이 존재하는지 확인했다
>   - [ ] `down` 후 `up -d` 재기동 시 SELECT 결과에 seed-row와 after-insert 두 행이 보인다
>   - [ ] `down -v` 후 재기동 시 seed-row 1행만 남는다

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: 프로덕션에서 named volume만으로는 데이터 백업이 되지 않는다. `pg_dump`를 크론잡으로 실행하거나, 관리형 DB(RDS, Cloud SQL 등)를 사용해 스냅샷을 자동화해야 한다. 볼륨은 "호스트 재부팅 생존"까지는 보장하지만, 디스크 장애나 서버 교체에는 취약하다.
> - **대안 기술**: Docker 볼륨 드라이버를 `local` 대신 `nfs` 나 CSI 드라이버로 교체하면 원격 스토리지를 동일 인터페이스로 사용할 수 있다. Kubernetes 환경에서는 PersistentVolumeClaim(PVC)이 동일 역할을 한다.
> - **관측**: `docker system df -v` 로 볼륨별 디스크 사용량을 확인할 수 있다. 장기 운영 시 오래된 dangling 볼륨이 쌓이지 않도록 주기적으로 `docker volume prune`을 실행한다.

---

## 보안 안내

이 예제의 포트 설정(`5432:5432`)은 학습 편의를 위해 모든 인터페이스(`0.0.0.0`)에 바인딩된다.
학습 환경이 아닌 서버에서 실행하는 경우, `docker-compose.yml`의 포트를 아래와 같이 수정해 로컬호스트에서만 접근하도록 제한하는 것을 권장한다.

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

---

## 자동 검증

위 10단계를 자동으로 실행하고 PASS/FAIL을 확인하려면:

```bash
bash tests/verify_persistence.sh
```

종료 코드 `0`이면 PASS다. 이 스크립트는 Git Bash / macOS / Linux bash 전용이다.
Windows PowerShell에서는 실행할 수 없다.

---

## 트러블슈팅

### 포트 5432가 이미 사용 중이다

호스트에 PostgreSQL이 이미 실행 중인 경우 발생한다.

`docker-compose.yml`의 `ports:` 항목을 대체 포트로 변경한다.

```yaml
ports:
  - "5433:5432"
```

변경 후 psql 접속 시 포트를 명시한다.

```bash
docker compose exec db psql -U app -d demo -p 5432 -c "SELECT * FROM items;"
```

> 컨테이너 내부에서 실행하는 `exec` 명령은 컨테이너 내부 포트(5432)를 그대로 사용한다. 호스트 포트 변경은 호스트에서 직접 접속할 때만 영향을 미친다.

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
curl.exe -s localhost:5432
```
