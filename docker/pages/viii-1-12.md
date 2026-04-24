### VIII-1-12. HTML+Nginx 정적 사이트 Docker화

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 HTML 정적 사이트를 `nginx:alpine` 이미지로 Docker화하고, SPA 라우팅을 위한 `nginx.conf`를 작성하고, 개발 환경에서 바인드 마운트로 실시간 반영을 구성할 수 있다.
- **설명**:
  정적 사이트(HTML/CSS/JS 파일만 있는 프로젝트)의 Docker화는 가장 단순한 형태다. Dockerfile 3줄로 완성되며, 핵심은 Nginx 설정이다. Vue.js, React(CRA), Vite 같은 프레임워크로 빌드한 결과물도 이 방식으로 서빙한다.
- **핵심 키워드**: `nginx:alpine`, `nginx.conf`, `try_files`, 정적 파일 캐시, 바인드 마운트
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: IV-1-1 (Dockerfile에서 컨테이너까지)
- **다음 섹션**: VIII-1-13

#### 본문

##### 가장 단순한 Dockerfile

정적 사이트 Docker화의 Dockerfile은 3줄이면 충분하다.

예제 파일은 `examples/viii-1-12-html-nginx-docker/` 폴더를 참조한다.

```dockerfile
# examples/viii-1-12-html-nginx-docker/Dockerfile
FROM nginx:alpine

# 기본 Nginx 설정 교체 (SPA 라우팅 지원 포함)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY dist/ /usr/share/nginx/html/
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: Nginx는 인터넷 카페의 직원과 같다. 손님(브라우저)이 "index.html 주세요"라고 요청하면 파일을 찾아서 건네준다. Docker 이미지는 직원과 파일 모음을 하나의 패키지로 묶은 것이다.
> - **3줄의 의미**: `FROM`(어떤 서버를 쓸지) → `COPY nginx.conf`(서버 설정) → `COPY dist/`(파일 전달). 실행에 필요한 것이 세 가지뿐이다.

##### nginx.conf 커스텀 — SPA 라우팅

React, Vue, 일반 SPA처럼 클라이언트 사이드 라우팅을 사용하는 앱은 `/about`, `/profile/1` 같은 URL로 직접 접근하면 Nginx가 파일을 찾지 못하고 404를 반환한다. `try_files`로 이 문제를 해결한다.

```nginx
# examples/viii-1-12-html-nginx-docker/nginx.conf
server {
    listen       80;
    server_name  localhost;

    root   /usr/share/nginx/html;
    index  index.html;

    # SPA 라우팅: 파일이 없으면 index.html로 폴백
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 정적 에셋 캐시 설정 (JS/CSS/이미지)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 헬스체크 엔드포인트
    location /healthz {
        return 200 "ok";
        add_header Content-Type text/plain;
    }
}
```

`try_files $uri $uri/ /index.html`의 작동 방식:

```
요청: /about

1. $uri     → /usr/share/nginx/html/about       파일 없음
2. $uri/    → /usr/share/nginx/html/about/       폴더 없음
3. /index.html → /usr/share/nginx/html/index.html  반환!

브라우저가 index.html을 받으면 React/Vue 라우터가 /about 경로를 처리한다.
```

> **[주니어 렌즈 ★★☆]**
> - **캐시 설정의 의미**: `expires 1y`는 브라우저가 1년간 캐시를 유지하라는 지시다. Vite/webpack은 빌드마다 파일명에 해시를 붙이기 때문에(`app.abc123.js`) 파일 변경 시 자동으로 새 파일을 가져온다. `index.html`에는 캐시를 적용하지 않아서 항상 최신 HTML을 가져온다.
> - **`immutable` 헤더**: `Cache-Control: public, immutable`은 "이 파일은 절대 바뀌지 않으므로 만료 전에 서버에 재검증 요청을 보내지 않아도 된다"는 의미다. CDN과 함께 사용할 때 효과적이다.
> - **Nginx 404 vs SPA 404**: SPA 라우터에서 정의되지 않은 경로는 SPA 안에서 404 페이지를 보여줘야 한다. Nginx의 `try_files /index.html` 설정은 모든 경로를 index.html로 보내므로, Nginx 레벨 404는 없어지고 SPA가 경로를 판단한다.

##### 빌드 및 실행

```bash
# React/Vue/Vite 앱을 먼저 빌드 (호스트에서)
npm run build
# 결과: dist/ 폴더 생성

# Docker 이미지 빌드
docker build -t staticapp:latest .

# 이미지 크기 확인 (nginx:alpine 기반이라 매우 작다)
docker images staticapp

# 실행
docker run -d \
  --name staticapp \
  -p 8080:80 \
  staticapp:latest

# 동작 확인
curl http://localhost:8080
curl http://localhost:8080/healthz
```

##### 개발 환경: 바인드 마운트로 실시간 반영

```yaml
# compose.dev.yml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      # dist/ 폴더를 바인드 마운트 (빌드 결과물 변경 즉시 반영)
      - ./dist:/usr/share/nginx/html:ro
      # nginx 설정도 마운트 (설정 변경 시 docker compose restart web)
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

```bash
# 개발 환경 실행
docker compose -f compose.dev.yml up -d

# 앱 재빌드 후 자동 반영 (바인드 마운트이므로 이미지 재빌드 불필요)
npm run build
# 브라우저에서 새로고침하면 바로 반영된다
```

> **[실무자 렌즈 ★★★]**
> - **멀티 스테이지 + Nginx**: Vite/CRA 프로젝트를 완전히 Docker 안에서 빌드하려면 멀티 스테이지를 적용한다. `node:20-alpine`으로 `npm run build`를 수행하는 빌드 스테이지와 `nginx:alpine`으로 서빙하는 실행 스테이지를 분리한다.
> - **보안 헤더 추가**: 프로덕션 nginx.conf에는 `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy` 같은 보안 헤더를 추가한다.
> - **CDN 앞단 구성**: 정적 사이트는 CloudFront, Cloudflare 같은 CDN을 앞에 두는 것이 일반적이다. CDN이 캐시를 처리하므로 Nginx의 캐시 정책은 CDN과 일관성 있게 설정한다.

##### 프로젝트 4종 Docker화 비교

지금까지 다룬 4가지 프로젝트 유형의 Docker화를 한눈에 비교한다.

| 항목 | Spring Boot (VIII-1-9) | Node.js/Express (VIII-1-10) | Next.js (VIII-1-11) | HTML+Nginx (VIII-1-12) |
|:--|:--|:--|:--|:--|
| 베이스 이미지 (빌드) | `eclipse-temurin:21-jdk` | `node:20-alpine` | `node:20-alpine` | `node:20-alpine` (선택) |
| 베이스 이미지 (실행) | `eclipse-temurin:21-jre-alpine` | `node:20-alpine` | `node:20-alpine` | `nginx:alpine` |
| 스테이지 수 | 2 (builder → runner) | 1 또는 2 | 3 (deps → builder → runner) | 1 또는 2 |
| Dockerfile 핵심 명령 | `RUN ./gradlew bootJar` → `COPY *.jar` | `RUN npm ci --omit=dev` | `output: 'standalone'` + `COPY .next/standalone` | `COPY dist/ /usr/share/nginx/html/` |
| 최종 이미지 크기 (예시) | ~250MB | ~150MB | ~150MB | ~30MB |
| 빌드 시간 | 길다 (Gradle 컴파일) | 중간 (npm 의존성) | 중간~길다 (Next.js 빌드) | 빠르다 (파일 복사만) |
| 런타임 | JVM | Node.js | Node.js | Nginx |
| 환경변수 주입 | `-e SPRING_PROFILES_ACTIVE` | `-e NODE_ENV` | 런타임/빌드타임 구분 필요 | 없음 (정적 파일) |
| 핵심 함정 | JDK 이미지 그대로 사용 | `node_modules` .dockerignore 누락 | `static`/`public` 복사 누락 | SPA 라우팅 `try_files` 누락 |

##### 체크포인트

- [ ] `nginx:alpine` 이미지를 사용하여 `dist/` 폴더를 서빙하는 Dockerfile 3줄을 작성할 수 있다
- [ ] `try_files $uri $uri/ /index.html` 설정이 SPA 라우팅에서 왜 필요한지 설명할 수 있다
- [ ] 정적 에셋에 `Cache-Control: public, immutable` 헤더를 설정하고, `index.html`에는 캐시를 적용하지 않는 이유를 설명할 수 있다
- [ ] 바인드 마운트(`./dist:/usr/share/nginx/html:ro`)를 사용하여 개발 환경에서 빌드 결과물 변경을 즉시 반영할 수 있다
- [ ] Spring Boot / Node.js / Next.js / HTML+Nginx 4가지 프로젝트 유형의 베이스 이미지, 스테이지 수, 핵심 함정을 각각 설명할 수 있다

---

