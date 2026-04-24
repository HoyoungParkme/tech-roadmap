# Node.js Express 앱 Docker화
FROM node:20-alpine

# 보안: 비루트 사용자
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# 의존성 먼저 설치 (레이어 캐시 활용)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# 소스 복사
COPY src/ src/

USER app
EXPOSE 3000

CMD ["node", "src/index.js"]
