### VIII-1-9. Spring Boot 앱 Docker화

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 Spring Boot 애플리케이션을 멀티 스테이지 Dockerfile로 빌드하고, JDK와 JRE를 분리하여 최소 크기의 실행 이미지를 만들고, 비루트 사용자로 안전하게 실행할 수 있다.
- **설명**:
  Java 애플리케이션을 Docker로 배포할 때 가장 흔한 실수는 JDK(개발 도구 전체)가 포함된 이미지를 그대로 실행에 사용하는 것이다. JDK 이미지는 1GB를 넘기도 하지만, 실행에 필요한 JRE 이미지는 200MB 수준이다. 멀티 스테이지 빌드를 사용하면 빌드 환경과 실행 환경을 분리하여 크기를 크게 줄일 수 있다.
- **핵심 키워드**: `eclipse-temurin:21-jdk`, `eclipse-temurin:21-jre-alpine`, 멀티 스테이지 빌드, `./gradlew bootJar`, 비루트 사용자
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: IV-1-3 (멀티 스테이지 빌드), VIII-1-1 (docker run 핵심 옵션)
- **다음 섹션**: VIII-1-10

#### 본문

##### JDK vs JRE — 왜 분리해야 하는가

Java 개발 도구(JDK)에는 컴파일러(`javac`), 디버거, 프로파일러 등이 포함되어 있다. 하지만 배포된 애플리케이션을 **실행**하는 데는 JRE(Java Runtime Environment)만 있으면 된다.

```
JDK 이미지 (eclipse-temurin:21-jdk)       ~700MB
  ├── JRE (실행 환경)
  ├── javac (컴파일러)
  ├── jdb (디버거)
  ├── jvisualvm (프로파일러)
  └── ... 개발 도구 전체

JRE 이미지 (eclipse-temurin:21-jre-alpine) ~190MB
  └── JRE (실행 환경)만
```

멀티 스테이지 빌드를 사용하면 JDK로 JAR을 빌드한 뒤, JRE만 있는 경량 이미지에 JAR만 복사해서 실행 이미지를 만든다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 케이크를 만들 때 오븐, 밀가루, 계량컵, 믹서기 등 모든 도구가 필요하다. 하지만 손님에게 전달할 때는 완성된 케이크만 예쁜 상자에 담아 보내면 된다. 멀티 스테이지 빌드는 "모든 도구를 갖춘 주방에서 케이크를 굽고, 완성된 케이크만 상자에 담는" 방식이다.
> - **실용적인 이유**: 이미지가 작을수록 CI/CD에서 이미지를 내려받는 시간이 줄고, 레지스트리 저장 비용이 낮아지고, 공격 표면(보안 취약점의 수)이 줄어든다.

##### 멀티 스테이지 Dockerfile

예제 파일은 `examples/viii-1-9-springboot-docker/` 폴더를 참조한다.

```dockerfile
# examples/viii-1-9-springboot-docker/Dockerfile

# ── 1단계: 빌드 스테이지 ──────────────────────────
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Gradle 래퍼와 의존성 파일 먼저 복사 (캐시 활용)
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle settings.gradle ./

# 의존성 다운로드 (소스 코드 변경 시 이 레이어는 캐시 재사용)
RUN ./gradlew dependencies --no-daemon

# 소스 코드 복사 후 빌드
COPY src/ src/
RUN ./gradlew bootJar --no-daemon

# ── 2단계: 실행 스테이지 ──────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runner

# 보안: 비루트 사용자 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# 빌드 스테이지에서 생성된 JAR만 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 파일 소유권 변경
RUN chown appuser:appgroup app.jar

# 비루트 사용자로 전환
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

> **[주니어 렌즈 ★★☆]**
> - **`./gradlew dependencies` 분리**: 소스 코드보다 `build.gradle`이 바뀌는 빈도가 낮다. Gradle 설정 파일을 먼저 복사하고 의존성을 다운로드하면, 소스 코드만 변경되었을 때 의존성 다운로드 레이어를 캐시에서 재사용할 수 있다. 빌드 시간이 크게 줄어든다.
> - **`--no-daemon` 옵션**: Gradle 데몬(백그라운드 프로세스)은 개발 환경에서 재사용성이 있지만, Docker 빌드 컨텍스트처럼 일회성 실행에서는 불필요하다. `--no-daemon`을 사용하면 메모리를 추가로 쓰지 않는다.
> - **`*.jar` 와일드카드**: 빌드 결과물 JAR 파일명에 버전이 포함되는 경우(`app-0.0.1-SNAPSHOT.jar`)에도 `*.jar`로 한 번에 복사할 수 있다. 단, JAR이 하나임을 보장해야 한다.

##### 이미지 빌드 및 실행

```bash
# 이미지 빌드
docker build -t myapp:latest .

# 이미지 크기 비교
docker images | grep myapp
```

예상 출력:

```
REPOSITORY  TAG         SIZE
myapp       latest      ~250MB   ← JRE 기반 최종 이미지
```

JDK만 사용했을 경우와 비교:

| 방식 | 베이스 이미지 | 최종 이미지 크기 |
|:--|:--|:--|
| JDK 단일 스테이지 | `eclipse-temurin:21-jdk` | ~800MB |
| JRE 단일 스테이지 | `eclipse-temurin:21-jre-alpine` | ~250MB |
| 멀티 스테이지 (JDK → JRE) | 빌드: JDK, 실행: JRE alpine | ~250MB (소스 코드 제외) |

```bash
# 컨테이너 실행
docker run -d \
  --name myapp \
  -p 8080:8080 \
  myapp:latest

# 로그 확인 (Spring Boot 시작 완료 메시지 확인)
docker logs -f myapp
# "Started Application in X.XXX seconds" 메시지가 보이면 완료
```

##### 환경변수로 Spring 프로파일 전달

```bash
# 프로덕션 프로파일로 실행
docker run -d \
  --name myapp-prod \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://trio-mysql:3306/demo \
  -e SPRING_DATASOURCE_USERNAME=appuser \
  -e SPRING_DATASOURCE_PASSWORD=apppass \
  myapp:latest
```

##### .dockerignore 설정

빌드 컨텍스트에서 불필요한 파일을 제외한다.

```
# .dockerignore
.git
.gradle
build/
out/
*.log
.DS_Store
```

> **[실무자 렌즈 ★★★]**
> - **JVM 메모리 튜닝**: 컨테이너 환경에서 JVM은 호스트 전체 메모리를 기준으로 힙 크기를 계산한다. `-XX:+UseContainerSupport`(Java 11+에서 기본값)를 사용하면 컨테이너 메모리 제한을 인식한다. `deploy.resources.limits.memory`와 `-Xmx` 설정을 함께 조정한다.
> - **GraalVM Native Image**: Spring Boot 3.x에서는 GraalVM을 사용해서 JVM 없이 동작하는 네이티브 실행 파일을 만들 수 있다. 시작 시간이 밀리초 단위로 줄고 이미지 크기도 50MB 이하로 줄지만, 빌드 시간이 길고 리플렉션 사용에 제약이 있다.
> - **레이어드 JAR**: Spring Boot 2.3+에서는 `bootJar`가 레이어드 JAR을 생성할 수 있다. `RUN java -Djarmode=layertools -jar app.jar extract`로 의존성 레이어를 분리하면 애플리케이션 코드만 변경될 때 이미지 빌드와 푸시 속도가 더 빨라진다.

##### 체크포인트

- [ ] 멀티 스테이지 Dockerfile에서 `AS builder`와 `COPY --from=builder`의 역할을 설명할 수 있다
- [ ] `eclipse-temurin:21-jdk`와 `eclipse-temurin:21-jre-alpine` 이미지의 크기 차이를 직접 `docker images`로 확인할 수 있다
- [ ] `addgroup`/`adduser`로 비루트 사용자를 생성하고 `USER` 명령으로 전환하는 이유를 설명할 수 있다
- [ ] Gradle 의존성 다운로드 레이어를 소스 코드 복사보다 먼저 배치하는 이유(캐시 최적화)를 설명할 수 있다
- [ ] `docker build -t myapp:latest .`로 이미지를 빌드하고 컨테이너를 실행하여 Spring Boot 앱이 뜨는 것을 확인할 수 있다

---

