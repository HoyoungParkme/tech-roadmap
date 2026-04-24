# 🚀 springboot 폴더 시작하기 (첫 프롬프트)

이 폴더는 `D:/dev/framwork_study/` 루트와 **독립된** Claude Code 프로젝트다. 여기서 `/pm`을 실행하면 Spring Boot 학습 자료만 놓고 스프린트가 돌아간다.

## 현재 폴더에 있는 것

| 파일 | 내용 |
|:--|:--|
| `index.html` | **Chapter 1-1 시각화** — HTTP 요청 처리 계층(DispatcherServlet → Controller → Service → Repository → JPA) |
| `curriculum.md` | Part I~VII 상세 목차 (Section 설명 2~3줄, 총 ~30 Section) |
| `README.md` | Live Server 실행 + GitHub Pages 배포 가이드 |
| `docs/` | Sprint 1 대기 상태 |
| `.claude/`, `CLAUDE.md`, `USAGE.md` | 루트와 동일한 PM 워크플로우 |

## 시작 방법

### 1. 이 폴더로 이동
```bash
cd D:/dev/framwork_study/springboot
```

### 2. Claude Code 실행 후 아래 프롬프트 복사

```
/pm 이 폴더의 Spring Boot 학습 자료 Sprint 1을 시작할게.

현재 상태
- index.html: HTTP 요청 처리 계층 시각화 (Chapter 1-1)
- curriculum.md: Part I~VII 상세 목차
- README.md: Live Server / Pages 가이드

다음 스프린트 방향 후보를 같이 정리해줘:

A. Chapter 1-2 시각화 추가 — Bean 생명주기 / Spring Security 필터 체인 / JPA 영속성 컨텍스트 중 선택
B. curriculum 본문 1원고 집필 — Section 설명을 책 수준 본문으로 확장 (Part 단위 분할 위임)
C. 실전 프로젝트 예제 추가 — "할 일 관리 REST API" 전체 코드 (Controller/Service/Repository)

독자 타겟은 [Java 처음인 주니어 / 실무 투입 주니어 / 비개발자 입문] 중 무엇으로?
```

## 방향별 참고

### A. Chapter 1-2 시각화 후보
- **Bean 생명주기** — `@Component` 스캔 → 생성자 주입 → `@PostConstruct` → 사용 → `@PreDestroy`
- **Spring Security 필터 체인** — 요청이 SecurityFilterChain의 각 필터(JWT/CORS/CSRF)를 통과하는 과정
- **JPA 영속성 컨텍스트** — 엔티티의 Transient/Persistent/Detached/Removed 상태 전이

### B. curriculum 본문 집필 시 주의
- Part별 3분할 위임 (토큰 한도 회피)
- Part I~II에서 JVM/JDK/GC 같은 Java 배경지식을 비개발자도 이해 가능하게 풀어 주기

### C. 실전 프로젝트 후보
- 할 일 관리 API (CRUD + 검증 + 예외 처리)
- 게시판 + JWT 인증 (Spring Security 통합 실습)
