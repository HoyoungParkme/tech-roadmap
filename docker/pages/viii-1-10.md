### VIII-1-10. Node.js (Express) 앱 Docker화

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 Node.js Express 앱을 `node:20-alpine` 이미지로 Docker화하고, 의존성 캐시를 최적화하고, 개발 환경에서 바인드 마운트로 핫 리로드를 구성할 수 있다.
- **설명**:
  Node.js 앱은 상대적으로 Docker화가 쉬운 편이다. `npm ci`로 의존성을 설치하고 소스 코드를 복사하면 된다. 하지만 `node_modules`를 이미지에 포함시키는 방식과 `.dockerignore` 설정, `npm ci` vs `npm install` 차이를 이해해야 올바른 이미지를 만들 수 있다.
- **핵심 키워드**: `node:20-alpine`, `npm ci --omit=dev`, `.dockerignore`, 의존성 캐시 최적화, 바인드 마운트 핫 리로드
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: IV-1-1 (Dockerfile에서 컨테이너까지)
- **다음 섹션**: VIII-1-11

#### 본문

##### `node:20-alpine`을 선택하는 이유

Node.js 공식 이미지는 여러 변형이 있다.

| 이미지 | 크기 | 용도 |
|:--|:--|:--|
| `node:20` | ~1GB | 데비안 기반, 개발 도구 포함 |
| `node:20-slim` | ~250MB | 데비안 기반, 불필요한 패키지 제거 |
| `node:20-alpine` | ~130MB | Alpine Linux 기반, 최소 설치 |

`alpine`은 Alpine Linux라는 초경량 리눅스 배포판을 기반으로 한다. 크기가 작아서 이미지 빌드, 푸시, 풀 속도가 빠르고 보안 취약점 노출 면적이 좁다. 다만 glibc 대신 musl libc를 사용하기 때문에 네이티브 확장(`.node` 바이너리)을 사용하는 패키지에서 호환성 문제가 생길 수 있다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 이사할 때 짐을 최소화하는 것처럼, 실행에 필요한 것만 담은 이미지가 배포하기 쉽다. `node:20-alpine`은 Node.js 실행에 꼭 필요한 것만 담은 가벼운 상자다.
> - **`npm ci` 한 줄 요약**: `npm install`은 `package.json`을 기준으로 설치하고 `package-lock.json`을 갱신할 수 있다. `npm ci`는 `package-lock.json`을 정확히 따라 설치하고 `node_modules`를 먼저 삭제하므로 재현성이 보장된다.

##### Dockerfile 작성 — 의존성 캐시 최적화

예제 파일은 `examples/viii-1-10-nodejs-docker/` 폴더를 참조한다.

```dockerfile
# examples/viii-1-10-nodejs-docker/Dockerfile
FROM node:20-alpine

# 보안: 비루트 사용자 생성 (node 이미지는 기본 제공)
# node:alpine 이미지에는 이미 'node' 사용자(uid=1000)가 있다

WORKDIR /app

# ① 의존성 파일을 먼저 복사 (소스 코드보다 변경 빈도가 낮음)
COPY package.json package-lock.json ./

# ② 프로덕션 의존성만 설치 (devDependencies 제외)
RUN npm ci --omit=dev

# ③ 소스 코드 복사 (마지막에 복사하여 캐시 재사용 극대화)
COPY src/ src/

# 파일 소유권을 node 사용자에게 변경
RUN chown -R node:node /app

# 비루트 사용자로 전환
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
```

##### `.dockerignore` — 반드시 설정해야 하는 이유

`.dockerignore`가 없으면 `COPY . .` 명령이 `node_modules` 폴더(수백 MB)를 빌드 컨텍스트에 포함시킨다. 이는 빌드 속도를 늦추고, 호스트의 `node_modules`가 컨테이너 안의 것을 덮어써서 플랫폼 불일치 문제를 일으킨다.

```
# .dockerignore
node_modules
npm-debug.log
.git
.env
.DS_Store
dist/
coverage/
*.test.js
```

##### `npm ci` vs `npm install` 차이

| 항목 | `npm install` | `npm ci` |
|:--|:--|:--|
| 기준 파일 | `package.json` | `package-lock.json` |
| `node_modules` 처리 | 기존 것 재사용 | 삭제 후 새로 설치 |
| `package-lock.json` 수정 | 가능 | 불가 (변경 시 에러) |
| 재현성 | 낮음 | 높음 |
| Docker 적합성 | 낮음 | 높음 |

```bash
# 빌드
docker build -t nodeapp:latest .

# 이미지 크기 확인
docker images nodeapp

# 실행
docker run -d \
  --name nodeapp \
  -p 3000:3000 \
  nodeapp:latest

# 동작 확인
curl http://localhost:3000
```

> **[주니어 렌즈 ★★☆]**
> - **`--omit=dev` 효과**: `jest`, `nodemon`, `eslint` 같은 개발 도구를 제외하면 `node_modules` 크기가 30~50% 줄어드는 경우가 많다. `npm ls --omit=dev`로 설치된 패키지 목록을 확인할 수 있다.
> - **`node` 사용자**: `node:alpine` 이미지에는 이미 uid=1000인 `node` 사용자가 포함되어 있다. `adduser`를 따로 만들지 않아도 `USER node`로 바로 사용할 수 있다.
> - **WORKDIR 권한**: `WORKDIR /app` 이후 파일을 복사하면 기본적으로 root 소유가 된다. `USER node`로 전환하기 전에 `chown -R node:node /app`을 실행한다.

##### 개발 환경: 바인드 마운트 + 핫 리로드

개발 중에는 코드를 수정할 때마다 이미지를 다시 빌드하면 비효율적이다. 바인드 마운트와 Node.js 내장 `--watch` 옵션을 사용하면 코드 변경이 즉시 반영된다.

```yaml
# compose.dev.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      # 소스 코드를 바인드 마운트 (코드 변경 즉시 반영)
      - ./src:/app/src
      # node_modules는 컨테이너 것을 사용 (호스트 것 덮어쓰기 방지)
      - /app/node_modules
    command: node --watch src/index.js
    environment:
      NODE_ENV: development
```

```bash
# 개발 환경 실행
docker compose -f compose.dev.yml up
```

> **[실무자 렌즈 ★★★]**
> - **멀티 스테이지 적용**: TypeScript 프로젝트에서는 `tsc`로 JS로 컴파일하는 빌드 스테이지와 컴파일된 JS만 실행하는 스테이지로 분리한다. `package.json`과 `tsconfig.json`을 빌드 스테이지에 복사하고, 컴파일 결과(`dist/`)만 실행 스테이지에 가져온다.
> - **`npm ci` 캐시 마운트**: BuildKit의 `--mount=type=cache,target=/root/.npm`을 사용하면 npm 캐시를 레이어 외부에 저장하여 반복 빌드 속도를 높일 수 있다. `RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev`
> - **신호 처리**: Node.js 프로세스를 PID 1로 직접 실행하면 `SIGTERM` 신호를 제대로 처리하지 못할 수 있다. `CMD ["node", "src/index.js"]` 형태의 exec 형식을 사용하거나, `tini`를 init 프로세스로 사용한다(`--init` 플래그 또는 `init: true` in Compose).

##### 체크포인트

- [ ] `.dockerignore`에 `node_modules`를 추가하는 이유와, 추가하지 않았을 때 발생하는 문제를 설명할 수 있다
- [ ] `COPY package.json package-lock.json ./` → `RUN npm ci` → `COPY src/ src/` 순서가 왜 캐시에 유리한지 설명할 수 있다
- [ ] `npm ci`와 `npm install`의 차이를 설명하고, Docker 빌드에는 어느 것이 적합한지 말할 수 있다
- [ ] `node:20-alpine`을 선택하는 이유와 alpine 이미지의 한계(musl libc)를 설명할 수 있다
- [ ] 바인드 마운트와 `node --watch`를 조합하여 개발 환경 핫 리로드를 구성할 수 있다

---

