# 정적 사이트 Docker화 — 가장 단순한 Docker 예제
FROM nginx:alpine

# 기본 설정 교체
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY public/ /usr/share/nginx/html/

EXPOSE 80
