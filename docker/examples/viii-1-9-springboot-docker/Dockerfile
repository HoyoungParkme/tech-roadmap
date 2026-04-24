# Spring Boot Multi-stage 빌드
# Stage 1: Gradle 빌드 (빌드 도구 + 소스 → JAR 생성)
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle/ gradle/
COPY gradlew ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

COPY src/ src/
RUN ./gradlew bootJar --no-daemon

# Stage 2: 실행 (JRE만 포함 — 이미지 크기 대폭 감소)
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
