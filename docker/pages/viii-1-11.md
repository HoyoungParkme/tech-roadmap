### VIII-1-11. Next.js 앱 Docker화

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 Next.js 앱을 standalone 출력 모드로 설정하고, 3-stage Dockerfile로 최적화된 이미지를 만들고, 빌드타임과 런타임 환경변수를 올바르게 주입할 수 있다.
- **설명**:
  Next.js는 서버 사이드 렌더링(SSR), 정적 생성(SSG), API Routes 등 복합적인 기능을 제공하기 때문에 단순히 `npm run build` 후 파일을 복사하는 방식으로는 제대로 Docker화할 수 없다. `output: 'standalone'` 설정과 3-stage Dockerfile을 사용하면 이미지 크기를 일반 빌드 대비 80% 이상 줄일 수 있다.
- **핵심 키워드**: `output: 'standalone'`, 3-stage Dockerfile, `NEXT_PUBLIC_*`, 런타임 환경변수, `.next/standalone`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: IV-1-3 (멀티 스테이지 빌드), VIII-1-10 (Node.js Docker화)
- **다음 섹션**: VIII-1-12

#### 본문

##### standalone 출력 모드란?

일반 Next.js 빌드는 `.next/` 폴더에 결과물을 생성하지만, `node_modules` 전체가 필요하다. `output: 'standalone'`을 설정하면 실행에 필요한 파일만 모아서 `.next/standalone/` 폴더에 자급자족형(standalone) 서버를 생성한다.

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
```

이 설정 하나로 이미지 크기가 극적으로 줄어든다:

| 방식 | 이미지 크기 (예시) |
|:--|:--|
| 일반 빌드 + `node_modules` 전체 | ~1.2GB |
| `output: 'standalone'` 적용 | ~150MB |

> **[입문 렌즈 ★☆☆]**
> - **비유**: 캠핑을 갈 때 집에 있는 모든 살림을 가져가는 사람은 없다. 캠핑에 꼭 필요한 것만 배낭에 담는다. `standalone` 모드는 Next.js가 "이 앱 실행에 필요한 것만" 골라서 작은 배낭에 담아주는 기능이다.
> - **왜 3-stage인가**: deps(의존성 설치) → builder(앱 빌드) → runner(실행 파일만 복사) 세 단계로 나누면 각 단계의 레이어를 독립적으로 캐시할 수 있어서 재빌드가 빠르다.

##### 3-stage Dockerfile

예제 파일은 `examples/viii-1-11-nextjs-docker/` 폴더를 참조한다.

```dockerfile
# examples/viii-1-11-nextjs-docker/Dockerfile
FROM node:20-alpine AS base

# ── 1단계: 의존성 설치 ─────────────────────────────
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── 2단계: 앱 빌드 ────────────────────────────────
FROM base AS builder

WORKDIR /app

# deps 스테이지의 node_modules 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드타임 환경변수 (NEXT_PUBLIC_* 는 빌드 시 번들에 포함됨)
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── 3단계: 실행 이미지 ────────────────────────────
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 비루트 사용자 생성
RUN addgroup -S nextgroup && adduser -S nextuser -G nextgroup

# standalone 출력물 복사
COPY --from=builder /app/.next/standalone ./
# 정적 에셋 복사 (standalone에 포함되지 않음)
COPY --from=builder /app/.next/static ./.next/static
# public 폴더 복사
COPY --from=builder /app/public ./public

# 파일 소유권 변경
RUN chown -R nextuser:nextgroup /app

USER nextuser

EXPOSE 3000

# standalone이 생성하는 server.js로 실행
CMD ["node", "server.js"]
```

> **[주니어 렌즈 ★★☆]**
> - **`libc6-compat` 패키지**: Alpine에서 일부 npm 패키지가 glibc를 필요로 하는 경우를 대비해 설치한다. Next.js 공식 Docker 예제에서도 포함된다.
> - **`static`과 `public` 별도 복사**: `output: 'standalone'`은 `.next/standalone/` 폴더에 서버 실행 파일만 생성한다. 브라우저가 요청하는 CSS/JS/이미지 파일은 `.next/static/`에, `public/` 폴더의 파일은 따로 복사해야 한다.
> - **`server.js` 위치**: standalone 빌드 후 `.next/standalone/server.js`가 생성된다. `CMD ["node", "server.js"]`는 이 파일을 가리킨다.

##### 환경변수 주입 전략

Next.js의 환경변수는 두 종류로 나뉜다:

| 종류 | 예시 | 주입 시점 | 주의 |
|:--|:--|:--|:--|
| 빌드타임 변수 | `NEXT_PUBLIC_API_URL` | `docker build` 시 `--build-arg`로 전달 | 번들에 하드코딩됨, 이미지 재빌드 필요 |
| 서버사이드 변수 | `DATABASE_URL`, `SECRET_KEY` | `docker run -e` 또는 Compose `environment:` | 런타임에 주입, 이미지 재사용 가능 |

```bash
# 빌드타임 환경변수 전달 (필요한 경우)
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  -t nextapp:latest .

# 런타임 환경변수 전달
docker run -d \
  --name nextapp \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@db:5432/mydb \
  nextapp:latest
```

```bash
# 빌드 후 이미지 크기 확인
docker images nextapp
```

> **[실무자 렌즈 ★★★]**
> - **`NEXT_PUBLIC_*` 함정**: `NEXT_PUBLIC_*` 변수는 빌드 시 번들에 하드코딩된다. 즉 API URL이 바뀌면 이미지를 새로 빌드해야 한다. 이 문제를 피하려면 런타임에 `/api/config` 엔드포인트를 만들어 브라우저가 설정을 가져오게 하거나, Next.js `instrumentation.ts`에서 환경변수를 런타임에 읽는 패턴을 사용한다.
> - **캐시 최적화**: deps 스테이지를 분리하면 `package.json`이 바뀌지 않는 한 `npm ci` 레이어를 캐시에서 재사용할 수 있다. `--cache-from` 옵션을 CI에서 사용하면 이전 빌드의 레이어를 재활용한다.
> - **`output: 'export'`와 차이**: `output: 'export'`는 완전한 정적 사이트를 생성한다. SSR이나 API Routes가 없는 경우에만 사용 가능하며, 이 경우 nginx로 정적 파일을 서빙하는 방식(VIII-1-12)이 더 적합할 수 있다.

##### 체크포인트

- [ ] `next.config.js`에 `output: 'standalone'`을 설정하고 빌드 후 `.next/standalone/` 폴더가 생성됨을 확인할 수 있다
- [ ] 3-stage Dockerfile(deps/builder/runner)에서 각 스테이지의 역할을 설명할 수 있다
- [ ] `COPY --from=builder /app/.next/static ./.next/static`를 빠뜨리면 어떤 문제가 생기는지 설명할 수 있다
- [ ] `NEXT_PUBLIC_*` 변수는 빌드타임에 주입해야 하고, `DATABASE_URL` 같은 서버사이드 변수는 런타임에 주입하는 이유를 설명할 수 있다
- [ ] `output: 'standalone'` 적용 전후 이미지 크기를 `docker images`로 비교할 수 있다

---

