# Multi-stage 빌드: python:3.11 → python:3.11-slim
# 빌드 스테이지에서 의존성을 설치하고, 실행 스테이지에서는 slim 이미지만 사용한다.
# 결과: 불필요한 빌드 도구(gcc, make 등)가 제거되어 이미지 크기가 줄어든다.

# --- Stage 1: 빌드 (의존성 설치) ---
FROM python:3.11 AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: 실행 (slim 이미지) ---
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Stage 1에서 설치한 패키지만 복사
COPY --from=builder /install /usr/local
COPY app/ .

ENV BUILD_TYPE=multi-stage

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
