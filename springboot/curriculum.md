# Spring Boot 사다리형 학습 커리큘럼

> 비개발자부터 실무 주니어까지, 한 권으로 올라가는 Spring Boot 학습 자료.

---

## 이 책이 만들어진 이유

이 자료는 Spring Boot 공식 문서나 두꺼운 교재와 달리 **"아는 만큼 읽고, 필요한 만큼만 깊이 들어가도 되는"** 사다리형 구조로 짜여 있다. Java를 한 번도 본 적 없는 비개발자가 Part I부터 읽어도 막히지 않게 만들었고, 동시에 Java 기초는 있지만 Spring Boot가 처음인 주니어가 Part III 이후만 발췌해 참고해도 가치 있게 썼다.

전체 구성은 **설계도(상세 목차) + 인터랙티브 시각화**다. 각 Section은 한 꼭지의 학습 단위이며, 필요한 곳에는 `index.html`과 같은 **단계별 애니메이션 시각화**가 짝을 이뤄, 글 대신 움직이는 그림으로 개념을 체득할 수 있도록 설계되어 있다.

---

## 읽기 가이드

### 난이도 범례

| 표기 | 독자 | 설명 |
|:--|:--|:--|
| **★☆☆** | 비개발자 | 코딩 경험 없음. 컴퓨터 기본 사용 가능 |
| **★★☆** | 코딩 입문 | Java/Python 기초 문법(변수/함수/클래스)을 본 적 있음 |
| **★★★** | 주니어 | Java + HTTP + Git 실전 경험, 실무 투입 준비 중 |

### 독자별 추천 경로

- **처음 개발을 배우는 분** → Part I → Part II → Part III → Part IV (천천히)
- **Java는 알지만 Spring은 처음** → Part III → Part IV → 필요 시 Part II
- **Spring Boot 실무 투입 준비 중** → Part IV → Part V → Part VI → Part VII

### Section 양식 (공통)

각 Section은 아래 7개 필드를 갖는다.

- **난이도**: ★☆☆ / ★★☆ / ★★★
- **선수 지식**: 먼저 읽어두면 좋은 이전 Section
- **학습 목표**: "이 Section을 마치면 ...할 수 있다"
- **설명**: 비유 중심 본문 (독자 타겟에 따라 분량 유동적)
- **핵심 키워드**: 이 Section의 기억해둘 개념 목록
- **시각화 연결**: 관련 `index.html` 시각화 또는 향후 구현 예정
- **다음 섹션**: 다음 번호

### 번호 규칙

`Part-Chapter-Section` (예: `IV-1-1` = Part IV, Chapter 1, Section 1).
현재 `chapter-04-01-request-flow.html`(HTTP 요청 처리 계층 시각화)은 이 커리큘럼의 **IV-1-1**에 해당한다.

---

## 전체 목차

### Part I. 왜 Java 프레임워크인가 (★☆☆)
- Chapter I-1. Java와 JVM — "한 번 쓰고 어디서나 실행"
- Chapter I-2. 서버사이드 Java의 역사
- Chapter I-3. 프레임워크란 무엇인가

### Part II. JVM·Spring 생태계 (★☆☆~★★☆)
- Chapter II-1. JVM 동작 원리
- Chapter II-2. 빌드 도구 — Maven vs Gradle
- Chapter II-3. Spring 생태계 지도

### Part III. Spring Boot 첫 걸음 (★★☆)
- Chapter III-1. 개발 환경 준비
- Chapter III-2. Spring Initializr로 프로젝트 생성
- Chapter III-3. Hello World API

### Part IV. Spring Boot 코어 (DI / AOP) (★★☆~★★★)
- Chapter IV-1. HTTP 요청 처리 계층  ← `index.html` 시각화 연결
- Chapter IV-2. 의존성 주입(DI)과 IoC 컨테이너
- Chapter IV-3. AOP와 트랜잭션

### Part V. 웹·DB·보안 계층 (★★★)
- Chapter V-1. REST API 설계
- Chapter V-2. JPA와 Hibernate
- Chapter V-3. Spring Security

### Part VI. 실전 REST API 프로젝트 (★★★)
- Chapter VI-1. 도메인 설계
- Chapter VI-2. API 구현 전체 사이클
- Chapter VI-3. 테스트

### Part VII. 배포·로깅·모니터링 (★★★)
- Chapter VII-1. 패키징과 배포
- Chapter VII-2. 로깅과 예외 처리
- Chapter VII-3. Actuator와 모니터링

---

## Part I. 왜 Java 프레임워크인가

> 코딩 경험이 없어도 읽을 수 있다. Java와 서버가 무엇인지, 왜 프레임워크가 필요한지를 일상 비유로 풀어낸다.

---

### Chapter I-1. Java와 JVM — "한 번 쓰고 어디서나 실행"

#### I-1-1. Java란 무엇인가

- **난이도**: ★☆☆
- **선수 지식**: 없음
- **학습 목표**: 이 섹션을 마치면 Java가 어떤 언어인지, 왜 서버 개발에 많이 쓰이는지 설명할 수 있다.
- **설명**:
  Java는 1995년 미국 회사 Sun Microsystems(선 마이크로시스템즈)가 만든 프로그래밍 언어(컴퓨터에게 일을 시키기 위해 사람이 작성하는 명령어 모음)다.
  언어라는 표현이 생소하다면 이렇게 생각해보자. 우리가 사람에게 "3시에 커피 한 잔 가져다줘"라고 말하듯, 컴퓨터에게도 특정 규칙에 맞는 문장으로 일을 시켜야 한다. 그 규칙 중 하나가 Java다.

  Java의 가장 큰 특징은 "Write Once, Run Anywhere(한 번 쓰고 어디서나 실행)"라는 철학이다.
  일반적으로 프로그램은 만들어진 운영체제(OS, 윈도우·맥OS·리눅스처럼 컴퓨터를 관리하는 기반 소프트웨어)에서만 실행된다. 그런데 Java로 만든 프로그램은 Windows(윈도우)에서 작성해도 Linux(리눅스, 서버에 주로 쓰이는 운영체제) 위에서 코드 변경 없이 그대로 돌아간다. 내 집 부엌에서 쓴 레시피(Java 코드)를 어느 나라 주방(운영체제)에서도 그대로 요리할 수 있는 셈이다.

  Java는 객체지향 프로그래밍(OOP, Object-Oriented Programming)을 기반으로 한다. OOP란 현실 세계처럼 "사물(객체)"을 중심으로 코드를 구성하는 방법이다. 예를 들어 "자동차"라는 객체는 색깔, 속도 같은 속성과 "출발", "정지" 같은 동작을 함께 묶어서 표현한다. 이 방식은 코드를 체계적으로 정리하고 재사용하기 쉽게 만들어준다.

  전 세계 은행, 공공기관, 대기업 백엔드(서비스의 뒷단, 사용자 눈에 보이지 않는 처리 엔진)에 Java가 많이 쓰이는 이유는 세 가지다. 첫째, 30년 가까운 역사에서 검증된 안정성. 둘째, 수백만 개의 라이브러리(도구 모음)로 이루어진 방대한 생태계. 셋째, 정적 타입(코드를 실행하기 전에 오류를 미리 잡아주는 방식) 덕분에 대규모 팀에서도 실수를 줄일 수 있다는 점이다.

  이 Section이 중요한 이유는, Java가 무엇인지 이해해야 이후에 배울 JVM·Spring Boot·Spring 생태계 전체가 왜 그렇게 설계되어 있는지 맥락이 연결되기 때문이다.
- **핵심 키워드**: Java, 객체지향 프로그래밍(OOP), 플랫폼 독립성, 정적 타입
- **시각화 연결**: `chapter-01-01-what-is-java.html` — Write Once, Run Anywhere · OOP · 기업 선택 이유 시각화
- **다음 섹션**: I-1-2

#### I-1-2. JVM(Java Virtual Machine)이란

- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: 이 섹션을 마치면 JVM이 왜 필요한지, 바이트코드가 무엇인지 설명할 수 있다.
- **설명**:
  JVM(Java Virtual Machine, 자바 가상 머신)은 Java 프로그램이 실제로 컴퓨터 위에서 돌아가도록 해주는 "번역기 겸 실행 엔진"이다. 가상 머신이라는 말이 낯설다면, 실제 기계(컴퓨터) 위에 소프트웨어로 만든 가상의 컴퓨터라고 생각하면 된다.

  Java로 코드를 작성하면 두 단계를 거친다. 첫 번째 단계는 컴파일(compile, 번역)이다. 사람이 쓴 Java 코드가 바이트코드(Bytecode, 사람 말을 컴퓨터가 이해할 수 있는 중간 형태로 번역한 것)로 변환되고, 이 결과물이 `.class` 파일에 저장된다. 두 번째 단계는 실행이다. JVM이 이 `.class` 파일의 바이트코드를 읽어서, 현재 운영체제(Windows든 Linux든 macOS든)에 맞는 기계어(0과 1로 이루어진 컴퓨터만 이해하는 언어)로 바꿔 실행한다.

  이 구조를 요리 비유로 이해해보자. Java 코드는 요리사가 쓴 "레시피 원본"이다. 바이트코드는 그 레시피를 "국제 표준 요리 기호"로 옮긴 공용 레시피다. JVM은 이 공용 레시피를 받아서, 한국 주방(Windows)이든 미국 주방(Linux)이든 그 환경에 맞는 실제 요리로 완성하는 "현지 요리사"다. 이 구조 덕분에 개발자는 운영체제별로 코드를 따로 만들 필요가 없다.

  JVM은 번역 외에도 메모리 관리, 가비지 컬렉션(Garbage Collection, 더 이상 쓰지 않는 데이터를 자동으로 청소하는 기능), 보안 검사 등을 담당한다. 즉 Java 프로그램이 안전하고 안정적으로 실행되는 환경 전체를 JVM이 책임진다.

  이 Section이 중요한 이유는, JVM의 역할을 알아야 "왜 JDK를 설치해야 하는지", "왜 Spring Boot 애플리케이션이 특정 Java 버전을 요구하는지"를 이해할 수 있기 때문이다.
- **핵심 키워드**: JVM, 바이트코드, 컴파일, .class 파일, 플랫폼 독립성
- **시각화 연결**: `chapter-01-02-jvm.html` — Java 코드 → 바이트코드 → JVM → 기계어 파이프라인
- **다음 섹션**: I-1-3

#### I-1-3. JRE와 JDK — 무엇을 설치해야 하나

- **난이도**: ★☆☆
- **선수 지식**: I-1-2
- **학습 목표**: 이 섹션을 마치면 JDK와 JRE의 차이를 알고, 개발을 시작하려면 무엇을 설치해야 하는지 판단할 수 있다.
- **설명**:
  Java 환경은 크게 두 가지 패키지(꾸러미)로 나뉜다. JRE(Java Runtime Environment, 자바 실행 환경)와 JDK(Java Development Kit, 자바 개발 도구 모음)다.

  JRE는 이미 만들어진 Java 프로그램을 실행하기 위한 최소 패키지다. JVM과 Java 표준 라이브러리(기본 도구 모음)가 포함되어 있다. 예를 들어 회사에서 Java로 만든 사내 프로그램을 직원 컴퓨터에 설치할 때, 개발을 하지 않는 직원에게는 JRE만 있으면 충분하다. 프로그램을 실행하기만 하면 되기 때문이다.

  JDK는 JRE에 컴파일러(javac, Java 코드를 바이트코드로 번역하는 도구)와 디버거(코드 오류를 찾는 도구), 각종 개발 유틸리티를 추가한 패키지다. 코드를 직접 작성하고 컴파일해야 하는 개발자라면 반드시 JDK를 설치해야 한다. 요리 비유로 하면, JRE는 "완성된 음식을 먹을 수 있는 식당", JDK는 "음식을 직접 만들 수 있는 조리 도구 일체가 갖춰진 주방"이다.

  Java는 버전이 다양하며, 버전마다 새로운 기능과 성능 개선이 이루어진다. LTS(Long Term Support, 장기 지원 버전)는 특별히 오랫동안 보안 패치와 버그 수정을 제공하는 버전이다. 2026년 기준 Spring Boot 3.x는 JDK 17 이상을 요구하며, JDK 21이 현재 최신 LTS다.

  JDK를 어디서 받을지도 선택 사항이다. Java는 OpenJDK라는 공개 소스를 기반으로 여러 회사가 각자의 배포판을 만들어 제공한다. Eclipse Temurin(구 AdoptOpenJDK)과 Amazon Corretto가 가장 널리 쓰이며 둘 다 무료다. 어느 배포판을 써도 Spring Boot 개발에는 문제없다.

  이 Section이 중요한 이유는, 개발 환경을 처음 세팅할 때 JDK를 올바른 버전으로 설치해야 Spring Boot 프로젝트가 정상적으로 빌드되기 때문이다.
- **핵심 키워드**: JRE, JDK, OpenJDK, Java 17, LTS(Long Term Support)
- **시각화 연결**: `chapter-01-03-jre-jdk.html` — JDK ⊃ JRE ⊃ JVM 포함 관계 다이어그램
- **다음 섹션**: I-2-1

---

### Chapter I-2. 서버사이드 Java의 역사

#### I-2-1. Servlet에서 Spring까지

- **난이도**: ★☆☆
- **선수 지식**: I-1-3
- **학습 목표**: 이 섹션을 마치면 Java 서버 개발이 어떻게 발전해왔는지 큰 그림을 그릴 수 있다.
- **설명**:
  웹 개발이란, 사용자가 브라우저(인터넷 익스플로러, 크롬 등)에서 어떤 주소를 입력하면 서버(인터넷 반대편에 있는 컴퓨터)가 그 요청을 받아서 화면이나 데이터를 돌려주는 과정이다. Java로 이 서버 쪽 역할을 담당하는 프로그램을 만들기 위한 첫 번째 도구가 Servlet(서블릿)이다.

  Servlet은 1997년에 등장했다. HTTP 요청(사용자가 서버에 "이 페이지 보여줘"라고 보내는 메시지)을 받아서 응답(서버가 돌려주는 HTML 또는 데이터)을 만드는 Java 코드 단위다. 그런데 Servlet만으로 웹 애플리케이션(웹 기반 프로그램)을 만들면 몇 가지 문제가 있었다. 첫째, `web.xml`이라는 설정 파일에 모든 주소를 일일이 등록해야 했다. 둘째, 반복되는 코드가 너무 많았다. 서버에서 해야 하는 공통 작업(로그인 확인, 예외 처리 등)을 매 요청마다 직접 손으로 써야 했다.

  이 불편함을 해소하기 위해 2003년 Rod Johnson(로드 존슨)이 Spring Framework(스프링 프레임워크)를 출시했다. Spring은 반복 코드를 줄이고, 의존성 주입(DI, 객체 간의 관계를 개발자 대신 Spring이 관리해주는 기능)을 통해 코드 구조를 훨씬 깔끔하게 만들었다. 그러나 Spring Framework 역시 XML 설정 파일이 많고, 처음 프로젝트를 세팅하는 데 시간이 오래 걸린다는 단점이 있었다.

  2014년, Spring Boot가 등장하면서 이 문제가 크게 해결됐다. Spring Boot는 "설정은 내가 알아서 할 테니, 개발자는 비즈니스 로직(실제 문제를 푸는 코드)에만 집중해라"는 철학을 내세웠다. 그 결과 지금은 Java로 서버를 만들 때 Spring Boot가 사실상의 표준으로 자리잡았다.

  이 Section이 중요한 이유는, 역사적 맥락을 알아야 Spring Boot가 왜 이런 구조로 설계됐는지, 어떤 문제를 해결하기 위해 만들어졌는지 이해할 수 있기 때문이다.
- **핵심 키워드**: Servlet, JSP, Spring Framework, Spring Boot, 설정 자동화
- **시각화 연결**: `chapter-01-04-servlet-to-spring.html` — 1997 Servlet → 2003 Spring → 2014 Spring Boot 타임라인
- **다음 섹션**: I-2-2

#### I-2-2. Spring Boot가 해결한 것

- **난이도**: ★☆☆
- **선수 지식**: I-2-1
- **학습 목표**: 이 섹션을 마치면 Spring Boot가 기존 Spring Framework 대비 무엇을 편하게 해줬는지 설명할 수 있다.
- **설명**:
  기존 Spring Framework로 프로젝트를 시작하려면 먼저 해야 할 일이 산처럼 쌓였다. XML(설정 내용을 적는 파일 형식) 설정 파일 수십 줄을 직접 작성해야 했고, Tomcat(톰캣, Java 웹 애플리케이션을 실행해주는 서버 소프트웨어)을 별도로 내려받아 설치·설정해야 했다. 또한 라이브러리들의 버전을 서로 맞추는 과정에서 충돌이 자주 발생했다. 코드 한 줄 쓰기 전에 하루를 날릴 수도 있었다.

  Spring Boot는 이 문제를 세 가지 핵심 아이디어로 해결했다.

  첫 번째는 자동 설정(Auto-configuration, 오토 컨피규레이션)이다. Spring Boot는 프로젝트에 어떤 라이브러리가 포함되어 있는지 스스로 파악하고, 그에 맞는 설정을 자동으로 적용한다. 예를 들어 데이터베이스(DB) 라이브러리가 있으면 DB 연결 설정을 알아서 만든다. 마치 스마트 가전제품이 환경을 감지해 온도를 자동으로 맞추는 것과 같다. 개발자는 기본 설정에서 바꾸고 싶은 부분만 명시하면 된다.

  두 번째는 내장 Tomcat이다. Spring Boot는 Tomcat을 프로젝트 안에 포함시켜 배포한다. 별도의 서버 소프트웨어를 설치하지 않아도, 빌드(build, 코드를 실행 가능한 파일로 만드는 과정)된 파일 하나를 실행하면 서버가 바로 올라온다.

  세 번째는 Spring Initializr(스프링 이니셜라이저, https://start.spring.io)다. 웹 페이지에서 필요한 기능을 체크박스로 고르면 프로젝트 기본 뼈대를 zip 파일로 생성해준다. 이 파일을 압축 해제하고 개발 도구에서 열면 즉시 코딩을 시작할 수 있다.

  이 세 가지 덕분에 예전에는 숙련된 개발자도 반나절 이상 걸리던 초기 세팅이 이제는 10분 안에 끝난다.

  이 Section이 중요한 이유는, Spring Boot의 핵심 편의 기능 세 가지를 알아야 이후 개발 환경 구축과 프로젝트 생성 과정을 이해하고 따라갈 수 있기 때문이다.
- **핵심 키워드**: Auto-configuration, 내장 Tomcat, Spring Initializr, Starter 의존성
- **시각화 연결**: `chapter-01-05-spring-boot-solutions.html` — Before/After: XML 설정 vs Auto-config
- **다음 섹션**: I-3-1

---

### Chapter I-3. 프레임워크란 무엇인가

#### I-3-1. 라이브러리 vs 프레임워크

- **난이도**: ★☆☆
- **선수 지식**: 없음
- **학습 목표**: 이 섹션을 마치면 라이브러리와 프레임워크의 차이를 "제어의 역전" 개념으로 설명할 수 있다.
- **설명**:
  개발을 배우다 보면 "라이브러리를 쓴다"와 "프레임워크를 쓴다"는 표현을 자주 듣게 된다. 둘 다 다른 사람이 미리 만들어둔 코드를 가져다 쓴다는 공통점이 있지만, 주도권이 누구에게 있느냐가 결정적으로 다르다.

  라이브러리(library)는 내가 필요할 때 꺼내 쓰는 도구 상자다. 망치가 필요하면 망치를 꺼내고, 드라이버가 필요하면 드라이버를 꺼낸다. 내가 프로그램의 흐름을 직접 제어하고, 필요한 순간에 라이브러리를 호출한다. 예를 들어 날짜 계산 라이브러리를 쓸 때, "지금 날짜를 알려줘"라고 내가 직접 라이브러리를 부른다.

  프레임워크(framework)는 반대다. 프레임워크가 전체 무대와 규칙을 만들어놓고, 개발자의 코드를 "내가 필요할 때" 대신 불러서 실행한다. 마치 연극 무대(프레임워크)가 이미 세워져 있고, 배우(개발자의 코드)는 대본과 큐사인에 따라 등장하는 것과 같다. 배우가 무대를 직접 꾸미지 않아도, 무대가 배우를 원하는 타이밍에 불러낸다.

  이 차이를 전문 용어로 IoC(Inversion of Control, 제어의 역전)라 한다. 제어의 역전이란 프로그램 실행의 주도권이 개발자에서 프레임워크로 넘어가는 것이다. 오케스트라에 비유하면, 지휘자(Spring)가 악보에 따라 바이올린 연주자(개발자의 코드)를 정해진 타이밍에 지목해 연주하게 한다. 연주자는 전체 곡의 흐름을 직접 관리하지 않는다.

  Spring Boot는 대표적인 프레임워크다. 개발자가 특정 규칙에 맞게 클래스를 작성하면, Spring이 그 클래스를 언제 만들고, 언제 사용하고, 언제 종료할지 결정한다.

  이 Section이 중요한 이유는, 라이브러리와 프레임워크의 차이를 이해해야 Spring Boot가 내 코드를 어떻게 관리하는지, 왜 특정 방식으로 코드를 작성해야 하는지 납득할 수 있기 때문이다.
- **핵심 키워드**: 라이브러리, 프레임워크, IoC(제어의 역전), 제어 흐름
- **시각화 연결**: `chapter-01-06-library-vs-framework.html` — "내가 호출" vs "프레임워크가 호출" 제어의 역전 시각화
- **다음 섹션**: I-3-2

#### I-3-2. Spring Boot의 위치 — 다른 프레임워크와 비교

- **난이도**: ★☆☆
- **선수 지식**: I-3-1
- **학습 목표**: 이 섹션을 마치면 Spring Boot를 Python의 Django/FastAPI, Node.js의 Express와 비교해 언제 선택하는지 설명할 수 있다.
- **설명**:
  프레임워크는 도구다. 도구는 쓰임새에 따라 골라야 한다. 망치로 나사를 박으면 안 되듯, 상황에 맞지 않는 프레임워크를 선택하면 개발 내내 고생한다. Spring Boot가 어느 상황에 가장 잘 맞는지 이해하려면, 비슷한 역할을 하는 다른 선택지와 나란히 놓고 보는 것이 제일 빠르다.

  Spring Boot는 Java 생태계에서 엔터프라이즈(enterprise, 금융·공공기관·대기업처럼 규모가 크고 오래 운영되는 시스템을 뜻하는 말) 프로젝트의 사실상 표준으로 자리잡았다. Python 진영의 Django(장고, Python 웹 프레임워크)처럼 웹 서버 개발에 필요한 기능을 처음부터 갖춰 제공하는 "풀배터리(full-battery, 필요한 부품이 모두 들어있는)" 방식이다. 여기에 JVM이 주는 강력한 타입 안전성(타입 안전성 — 코드를 실행하기 전에 데이터 종류가 맞는지 컴파일 단계에서 미리 확인해주는 특성)과 Spring Security·Spring Cloud 같은 방대한 주변 생태계가 더해진다. 은행 거래 시스템이나 정부 공공 포털처럼 오랫동안 안정적으로 돌아가야 하는 서비스에서 Spring Boot를 선택하는 이유가 여기 있다.

  반면 같은 웹 서버 역할을 하는 Python의 FastAPI(패스트에이피아이)나 Node.js의 Express(익스프레스)는 시작이 빠르다. 코드 몇 줄이면 간단한 API(응용프로그램 사이의 통신 창구) 서버가 바로 실행된다. 아이디어를 빠르게 시제품(MVP, Minimum Viable Product)으로 만들어봐야 할 때, 또는 소규모 팀이 빠르게 배포해야 할 때는 이쪽이 유리하다. Spring Boot는 처음 배우는 데 시간이 더 걸리고, JVM(자바 가상 머신) 자체를 메모리에 올리는 데도 수 초가 소요된다. 따라서 "가볍고 빠른 프로토타입"이 목표라면 FastAPI나 Express 쪽이 손이 덜 간다.

  정리하면, 선택 기준은 프로젝트의 수명과 규모다. "지금 당장 빠르게 만들고, 몇 달 후 버려도 괜찮다"면 Python이나 Node.js가 어울린다. "5년 이상 운영하고, 팀이 커지고, 보안·트랜잭션(transaction, 여러 작업을 하나의 묶음으로 처리해 중간에 실패하면 전부 되돌리는 처리 방식)이 중요하다"면 Spring Boot가 강력한 선택이다.

  이 Section이 중요한 이유는, 기술 선택의 이유를 알아야 Spring Boot의 복잡한 구조가 "불필요한 복잡함"이 아니라 "특정 문제를 해결하기 위한 선택"임을 납득할 수 있기 때문이다.
- **핵심 키워드**: 엔터프라이즈, 타입 안전성, Spring 생태계, 학습 곡선
- **시각화 연결**: `chapter-01-07-spring-boot-position.html` — Django · Express · Rails 비교 · 선택 기준 시각화
- **다음 섹션**: II-1-1

---

## Part II. JVM·Spring 생태계

> Java를 처음 보는 독자도 이해할 수 있도록 JVM 내부 동작과 Spring 생태계 전체 지도를 펼쳐본다.

---

### Chapter II-1. JVM 동작 원리

#### II-1-1. 클래스 로딩과 메모리 구조

- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: 이 섹션을 마치면 JVM이 클래스를 어떻게 불러오고 힙·스택에 어떻게 배치하는지 설명할 수 있다.
- **설명**:
  Java 프로그램이 실행된다는 것은 결국 두 가지 일이 일어나는 것이다. 첫째, 프로그램에서 필요한 코드 조각(클래스)을 메모리로 불러온다. 둘째, 불러온 코드를 정해진 메모리 공간에 배치해서 실행한다. 이 두 가지 과정을 담당하는 핵심 기관이 ClassLoader(클래스 로더)와 JVM 메모리 구조다.

  ClassLoader(클래스 로더 — .class 파일을 JVM 메모리에 불러오는 담당자)를 도서관 사서에 비유해보자. 도서관 서고(파일 시스템)에는 수천 권의 책(.class 파일)이 있다. 프로그램이 어떤 기능을 필요로 할 때, 사서(ClassLoader)가 서고에서 해당 책을 꺼내 열람석(JVM 메모리)으로 가져다 놓는다. 모든 책을 처음부터 다 꺼내놓지 않고, 실제로 필요한 책만 그때그때 꺼내오기 때문에 메모리를 효율적으로 쓸 수 있다.

  책이 열람석에 올라오면 JVM은 세 가지 구역(메모리 영역)에 내용을 나눠 보관한다. Method Area(메서드 에어리어 — 클래스의 설계도, 즉 어떤 기능이 있는지 정보를 저장하는 공간)에는 클래스의 구조 정보가 들어간다. Heap(힙 — 프로그램이 실행 중에 만들어낸 실제 데이터(객체)가 저장되는 창고)에는 프로그램이 동작하면서 생성한 데이터 덩어리들이 쌓인다. Stack(스택 — 현재 실행 중인 작업의 임시 기록을 쌓아두는 공간)에는 "지금 이 함수를 실행하고 있고, 다음에는 저 함수를 실행할 것"이라는 호출 순서와 임시 변수가 기록된다.

  Spring Boot 애플리케이션에서는 대부분의 Spring Bean(빈 — Spring이 직접 관리하는 객체 단위, 레고 블록에 해당)이 Heap 영역에 올라간다. Heap은 가장 크고 중요한 창고인 만큼, 여기서 쓰이다 버려진 데이터를 정리하는 작업이 필요하다. 이 정리 역할을 맡은 것이 바로 GC(Garbage Collector, 가비지 컬렉터 — 더 이상 사용하지 않는 객체를 자동으로 제거하는 청소 담당자)다.

  이 Section이 중요한 이유는, 클래스 로딩과 메모리 구조를 알아야 Spring 애플리케이션이 시작될 때 무슨 일이 일어나는지, 그리고 메모리 관련 오류가 발생했을 때 원인을 어디서 찾아야 하는지 감을 잡을 수 있기 때문이다.
- **핵심 키워드**: ClassLoader, Heap, Stack, GC(Garbage Collection), Method Area
- **시각화 연결**: `chapter-02-01-classloader-memory.html` — ClassLoader(사서) → JVM 메모리 3영역 배치
- **다음 섹션**: II-1-2

#### II-1-2. GC(가비지 컬렉션)와 성능

- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: 이 섹션을 마치면 GC가 메모리를 어떻게 관리하는지, G1GC와 ZGC의 차이를 간단히 설명할 수 있다.
- **설명**:
  Heap(힙) 창고에는 프로그램이 실행되는 동안 수많은 데이터 덩어리(객체)가 만들어진다. 그런데 한 번 만들어진 데이터가 더 이상 쓰이지 않아도, 컴퓨터는 스스로 치우지 않는다. 그대로 두면 창고가 가득 차서 새 데이터를 쌓을 공간이 없어진다. 이 문제를 해결하는 것이 GC(Garbage Collector, 가비지 컬렉터 — 더 이상 참조되지 않는 객체를 자동으로 찾아 메모리를 회수하는 청소 담당자)다.

  GC를 사무실을 도는 청소 로봇에 비유해보자. 직원들(코드)이 사용하다 버린 종이들(참조가 끊긴 객체)이 사무실 곳곳에 쌓인다. 청소 로봇(GC)은 주기적으로 사무실을 순회하며 아무도 집지 않은 종이만 골라 쓰레기통에 버린다. 직원들은 청소를 신경 쓸 필요 없이 일에만 집중하면 된다. Java의 GC가 바로 이 역할을 한다.

  문제는 청소 로봇이 사무실을 청소하는 동안 직원들의 작업이 잠깐 멈춘다는 점이다. 이 멈춤을 Stop-The-World(스톱 더 월드 — GC가 작동하는 동안 다른 모든 작업이 일시적으로 정지되는 현상)라 한다. 멈추는 시간이 길면 서버가 그 순간 응답을 못 하는 것처럼 보인다. 그래서 JVM 개발팀은 이 정지 시간을 줄이기 위해 여러 종류의 GC 알고리즘을 개발했다.

  Java 17부터 기본으로 적용되는 G1GC(G1 가비지 컬렉터 — Garbage-First GC의 약자, 힙을 작은 구역으로 나눠 가장 쓰레기가 많은 곳부터 먼저 청소하는 방식)는 정지 시간을 짧게 유지하면서도 전반적인 성능 균형이 좋다. ZGC(제트GC — 수백 GB에 달하는 대용량 힙에서도 정지 시간을 1밀리초(ms) 이하로 줄이는 것을 목표로 하는 최신 GC)는 특히 응답 속도가 중요한 대규모 서비스에 적합하다. Spring Boot 서버가 간헐적으로 응답이 느려진다면, GC 로그를 확인하는 것이 원인 파악의 첫 단계다.

  이 Section이 중요한 이유는, GC 동작 방식을 이해해야 Spring Boot 서버에서 발생하는 성능 저하의 원인을 진단하고, 적절한 JVM 설정으로 서비스 품질을 개선할 수 있기 때문이다.
- **핵심 키워드**: GC, G1GC, ZGC, Stop-The-World, Heap 튜닝
- **시각화 연결**: `chapter-02-02-gc-performance.html` — 청소 로봇 비유 · Stop-The-World · G1GC vs ZGC
- **다음 섹션**: II-2-1

---

### Chapter II-2. 빌드 도구 — Maven vs Gradle

#### II-2-1. 빌드 도구가 필요한 이유

- **난이도**: ★☆☆
- **선수 지식**: I-1-3
- **학습 목표**: 이 섹션을 마치면 빌드 도구가 의존성 관리·컴파일·테스트·패키징을 자동화하는 방식을 설명할 수 있다.
- **설명**:
  Java 프로젝트는 혼자 만들어지지 않는다. 로그인 기능을 만들려면 보안 라이브러리가 필요하고, DB(데이터베이스)에 데이터를 저장하려면 DB 연결 라이브러리가 필요하다. 날짜 계산, 파일 읽기, 이메일 발송 등 모든 기능마다 누군가 미리 만들어둔 라이브러리(library — 특정 기능을 담아놓은 코드 꾸러미)를 가져다 쓴다. 이런 외부 도구에 대한 의존을 의존성(dependency, 디펜던시)이라 한다.

  Spring Boot 프로젝트 하나에는 수십~수백 개의 의존성이 생긴다. 이를 손으로 관리하면 어떻게 될까. 각 라이브러리를 일일이 인터넷에서 찾아 다운로드하고, 버전이 서로 맞는지 확인하고, 프로젝트 폴더에 복사해야 한다. A 라이브러리가 B 라이브러리 버전 2.x를 필요로 하는데 C 라이브러리는 B 라이브러리 버전 1.x를 필요로 한다면, 이 충돌을 사람이 하나하나 해결해야 한다. 이 작업이 며칠씩 걸리는 것은 드문 일이 아니었다.

  빌드 도구(build tool)는 이 혼돈을 해결한다. 요리에 비유하면, 빌드 도구는 주방 매니저다. 요리사(개발자)가 "오늘 메뉴는 파스타입니다"라고 선언(의존성 목록 작성)하면, 주방 매니저(빌드 도구)가 필요한 식재료(라이브러리)를 시장(인터넷 중앙 저장소)에서 알아서 사 오고, 손질하고(컴파일), 조리하고(테스트 실행), 완성된 요리를 그릇에 담아(JAR·WAR 패키징) 손님 앞에 낸다. 요리사는 재료 조달 과정에 일절 관여하지 않아도 된다.

  결과물인 JAR(자바 아카이브 — Java 프로젝트의 모든 코드와 의존성을 하나의 파일로 압축한 실행 파일, `.jar` 확장자)는 "이 파일 하나만 있으면 서버를 어디서든 실행할 수 있다"는 의미를 갖는다. Spring Boot는 내장 Tomcat까지 JAR 안에 포함시키기 때문에, 서버 컴퓨터에 Java만 설치되어 있으면 추가 설정 없이 `java -jar 파일명.jar` 한 줄로 서비스를 시작할 수 있다.

  이 Section이 중요한 이유는, 빌드 도구가 하는 일을 이해해야 Maven과 Gradle의 역할이 구분되고, Spring Boot 프로젝트의 의존성 문제를 스스로 진단할 수 있기 때문이다.
- **핵심 키워드**: 빌드 도구, 의존성 관리, JAR, 컴파일, 패키징
- **시각화 연결**: `chapter-02-03-why-build-tool.html` — 주방 매니저 비유 · 빌드 파이프라인
- **다음 섹션**: II-2-2

#### II-2-2. Maven과 Gradle 비교

- **난이도**: ★★☆
- **선수 지식**: II-2-1
- **학습 목표**: 이 섹션을 마치면 Maven(pom.xml)과 Gradle(build.gradle) 방식의 차이를 이해하고, 신규 프로젝트에서 어느 쪽을 선택할지 판단할 수 있다.
- **설명**:
  빌드 도구라는 주방 매니저 역할을 하는 소프트웨어는 여러 종류가 있다. Java 세계에서 가장 널리 쓰이는 두 가지가 Maven(메이븐)과 Gradle(그레이들)이다. 둘 다 의존성 관리와 빌드 자동화를 해주지만, 그 방식이 다르다.

  Maven은 2004년에 등장한 오래된 도구다. 모든 설정을 `pom.xml`(프로젝트 오브젝트 모델, XML 형식의 설정 파일)에 작성한다. XML(이엑스엠엘 — 꺾쇠 태그로 데이터를 표현하는 형식, `<name>값</name>` 구조)은 사람이 읽기는 쉽지만, 같은 내용을 반복해서 써야 하는 경우가 많고 설정이 길어질수록 파악하기 어렵다. 그래도 10년 이상 쌓인 레퍼런스(참고 자료)가 풍부하고, 기존 프로젝트에 Maven이 이미 쓰이는 경우가 여전히 많다.

  Gradle은 2012년에 등장했다. Groovy(그루비) 또는 Kotlin(코틀린) DSL(DSL — Domain Specific Language, 특정 작업에 특화된 표현 방식)로 설정 파일(`build.gradle`)을 작성한다. 같은 레시피를 종이 매뉴얼로 보느냐 스마트 태블릿 레시피로 보느냐의 차이와 같다. Maven의 `pom.xml`이 상세한 종이 설명서라면, Gradle의 `build.gradle`은 핵심 내용만 간결하게 담은 태블릿 화면이다. 코드량이 적고 읽기 쉬우며, 조건에 따라 빌드 흐름을 바꾸는 것도 자유롭다.

  속도 면에서도 Gradle이 유리한 경우가 많다. Gradle은 증분 빌드(Incremental Build, 인크리멘털 빌드 — 이전 빌드 이후 변경된 파일만 다시 빌드하는 방식)와 빌드 캐시(Build Cache — 이전에 만든 결과물을 저장해 두었다가 재사용하는 기능)를 지원한다. 수백 개 파일 중 하나만 바꿔도 전부 다시 빌드해야 하는 Maven과 달리, Gradle은 변경된 부분만 처리하기 때문에 빌드 시간이 크게 줄어든다.

  2026년 기준, Spring Initializr(스프링 이니셜라이저, 프로젝트 생성 사이트)에서 신규 프로젝트를 만들 때 Gradle(Kotlin DSL)을 선택하는 비율이 높아지는 추세다. 새 프로젝트를 시작한다면 Gradle Kotlin DSL을 기본 선택으로 삼는 것이 현재 권장 방향이다.

  이 Section이 중요한 이유는, Maven과 Gradle 중 어느 쪽을 쓰느냐에 따라 빌드 설정 파일의 문법이 달라지기 때문에, 프로젝트를 처음 열었을 때 어떤 파일을 봐야 하는지 즉시 판단할 수 있어야 하기 때문이다.
- **핵심 키워드**: Maven, pom.xml, Gradle, build.gradle, 의존성 선언, 증분 빌드
- **시각화 연결**: `chapter-02-04-maven-vs-gradle.html` — pom.xml vs build.gradle 코드 비교 · 속도 비교
- **다음 섹션**: II-3-1

---

### Chapter II-3. Spring 생태계 지도

#### II-3-1. Spring 프로젝트 전체 지도

- **난이도**: ★★☆
- **선수 지식**: I-3-2
- **학습 목표**: 이 섹션을 마치면 Spring Boot / Spring Security / Spring Data / Spring Cloud 등 주요 프로젝트의 역할을 간략히 설명할 수 있다.
- **설명**:
  "Spring"이라는 이름을 처음 들으면 하나의 프레임워크를 떠올리기 쉽다. 하지만 정확히는 "Spring"이라는 이름을 쓰는 프로젝트 모음 전체를 가리키는 브랜드다. 출판사 비유를 빌리면, "Spring"은 출판사 이름이고, Spring Boot·Spring Security·Spring Data·Spring Cloud는 그 출판사가 내는 서로 다른 분야의 시리즈 책이다. 독자(개발자)는 자신이 풀어야 할 문제에 맞는 시리즈를 골라서 쓴다.

  각 시리즈가 담당하는 역할을 간단히 살펴보자. Spring Boot(스프링 부트)는 시작점이다. 나머지 모든 시리즈를 쉽게 조합해 쓸 수 있도록 기반을 만들어주는 시리즈다. Spring Security(스프링 시큐리티)는 보안 담당 시리즈다. 로그인(인증 — 누구인지 확인), 권한(인가 — 무엇을 할 수 있는지 확인), 암호화 같은 보안 기능을 다룬다. Spring Data(스프링 데이터)는 데이터 저장소 담당 시리즈다. 데이터베이스 종류가 달라도(MySQL이든 MongoDB든) 비슷한 방식으로 데이터를 저장하고 조회할 수 있게 추상화(추상화 — 내부 구현의 복잡함을 감추고 일관된 방식으로 쓸 수 있게 만드는 것)해준다. Spring Cloud(스프링 클라우드)는 마이크로서비스(microservices — 하나의 큰 서비스를 작은 독립 서비스 여러 개로 나눠 운영하는 구조) 환경을 구성하는 데 필요한 도구 모음이다. 서비스 간 통신, 로드 밸런싱(부하 분산), 설정 관리 등을 담당한다.

  이 시리즈들은 단독으로도 쓸 수 있고 함께 조합해서 쓸 수도 있다. 소규모 서비스라면 Spring Boot + Spring Data JPA(자바 퍼시스턴스 API, DB 접근 라이브러리) 두 가지만으로 충분하다. 규모가 커지면 Spring Security를 더하고, 더 커지면 Spring Cloud를 붙이는 식으로 점진적으로 확장할 수 있다.

  처음 Spring Boot를 배우는 단계에서는 Spring Boot와 Spring Data JPA 두 가지에 집중하는 것으로 충분하다. 나머지 시리즈는 필요가 생길 때 하나씩 추가하면 된다.

  이 Section이 중요한 이유는, Spring 생태계 전체 지도를 미리 알아야 현재 배우는 내용이 어느 위치에 있는지, 다음에 무엇을 배워야 하는지 방향을 잡을 수 있기 때문이다.
- **핵심 키워드**: Spring Boot, Spring Security, Spring Data JPA, Spring Cloud, Spring Batch
- **시각화 연결**: `chapter-02-05-spring-ecosystem.html` — 출판사 시리즈 비유 · 5개 프로젝트 지도
- **다음 섹션**: II-3-2

#### II-3-2. 언제 Spring Boot를 선택하나

- **난이도**: ★☆☆
- **선수 지식**: II-3-1
- **학습 목표**: 이 섹션을 마치면 프로젝트 규모·팀 구성·요구사항에 따라 Spring Boot 선택이 적합한지 판단할 수 있다.
- **설명**:
  Part II를 마무리하면서 가장 실용적인 질문에 답해보자. "나는 Spring Boot를 선택해야 할까?" 이 질문에 대한 정직한 답은 "경우에 따라 다르다"다. Spring Boot가 모든 상황의 최선은 아니다. 그러나 특정 조건에서는 다른 어떤 선택보다 강력하다.

  Spring Boot가 진가를 발휘하는 환경은 "장기 운영되는 복잡한 비즈니스 시스템"이다. 은행의 계좌이체 처리 시스템, 대기업의 ERP(Enterprise Resource Planning, 기업 자원 관리 시스템 — 회계·인사·재고 등 회사 전체 업무를 하나로 통합 관리하는 소프트웨어) 연동, 정부 공공 포털처럼 수백만 명이 동시에 쓰고 몇 년~몇 십 년간 유지해야 하는 서비스가 Spring Boot의 주 무대다. 이런 시스템은 기능이 많고 복잡하며, 도중에 팀이 교체되거나 규모가 커져도 코드가 무너지지 않아야 한다. Spring Boot의 엄격한 구조(Router → Service → Repository 계층)와 강한 타입 안전성, Spring Security의 탄탄한 보안 기능은 이 요구를 잘 충족한다.

  반면 Spring Boot가 과한(overkill, 오버킬) 선택이 되는 상황도 있다. 아이디어를 이틀 안에 시제품(MVP)으로 만들어야 한다거나, 몇 백 줄짜리 단순 API 서버 하나가 전부라면, JVM을 올리고 Spring 컨텍스트(Context — Spring이 모든 Bean을 준비하는 초기화 과정)가 초기화되는 수 초의 대기 시간조차 불필요한 복잡함으로 느껴질 수 있다. 이럴 때는 Python의 FastAPI나 Node.js의 Express처럼 시작이 빠른 도구가 어울린다.

  선택 기준을 한 문장으로 요약하면 이렇다. "지금 만드는 서비스가 3년 후에도 살아있을 가능성이 높고, 팀이 함께 유지보수해야 한다면 Spring Boot를 선택하라." 특히 Java를 이미 쓰는 팀이 있거나, 대규모 트래픽과 트랜잭션(transaction — 여러 작업을 한 묶음으로 처리해 중간에 실패하면 전부 되돌리는 처리 방식) 처리가 핵심인 시스템이라면, Spring Boot는 충분히 검증된 선택이다.

  이 Section이 중요한 이유는, Spring Boot를 "왜" 배우는지 납득해야 학습 동기가 유지되고, 나중에 다른 프레임워크와 비교하는 상황에서 스스로 근거 있는 판단을 내릴 수 있기 때문이다.
- **핵심 키워드**: 엔터프라이즈, 장기 운영, 보안, 확장성, 팀 역량
- **시각화 연결**: `chapter-02-06-when-spring-boot.html` — 선택 기준 매트릭스 · 강점 vs 과한 경우
- **다음 섹션**: III-1-1

---

## Part III. Spring Boot 첫 걸음

> 직접 코드를 작성하며 Spring Boot가 어떻게 동작하는지 손으로 확인한다.

---

### Chapter III-1. 개발 환경 준비

#### III-1-1. JDK 17 설치

- **난이도**: ★★☆
- **선수 지식**: I-1-3
- **학습 목표**: 이 섹션을 마치면 JDK 17을 설치하고 `java -version` 명령으로 확인할 수 있다.
- **설명**:
  JDK(Java Development Kit, 자바 개발 도구 모음)는 Java 코드를 작성하고 실행하기 위한 "작업 공구 세트"다. 목수에게 톱과 망치가 없으면 가구를 만들 수 없듯이, JDK 없이는 Java 코드를 실행할 수 없다.

  Spring Boot 3.x는 JDK 17 이상을 요구한다. LTS(Long-Term Support, 장기 지원 버전)이기 때문에 안정적으로 오래 쓸 수 있다. 여러 JDK 배포판 중 Eclipse Temurin 17을 권장한다(https://adoptium.net). 오픈소스이고 기업용으로도 무료다.

  설치 방법은 운영체제마다 다르다. macOS라면 Homebrew(맥OS 패키지 관리자)로 한 줄에 끝난다:
  ```
  brew install --cask temurin@17
  ```
  Windows라면 adoptium.net에서 설치 파일(.msi)을 내려받아 실행하면 된다.

  설치 후 터미널(명령 프롬프트)을 열고 아래 명령을 실행해 확인한다:
  ```
  java -version
  ```
  `openjdk 17.x.x`라는 문구가 보이면 JDK가 정상 설치된 것이다. `JAVA_HOME`(자바 설치 위치를 OS에 알려주는 환경변수)은 대부분 설치 시 자동 설정되지만, 설정이 안 됐다면 직접 JDK 설치 경로를 지정해야 한다.

  이 Section이 중요한 이유는, JDK 없이는 Spring Boot 프로젝트 자체를 실행할 수 없으며 이후 모든 실습의 전제 조건이기 때문이다.
- **핵심 키워드**: JDK 17, Eclipse Temurin, JAVA_HOME, 환경변수
- **시각화 연결**: `chapter-03-01-jdk-install.html` — JDK 설치 단계별 가이드
- **다음 섹션**: III-1-2

#### III-1-2. IDE 설치 — IntelliJ IDEA

- **난이도**: ★★☆
- **선수 지식**: III-1-1
- **학습 목표**: 이 섹션을 마치면 IntelliJ IDEA를 설치하고 Spring Boot 프로젝트를 임포트해 실행할 수 있다.
- **설명**:
  IDE(Integrated Development Environment, 통합 개발 환경)는 코드 편집기, 실행 버튼, 디버거(오류 추적 도구)를 한 화면에 모아놓은 "개발자 전용 작업 공간"이다. 소설가에게 맞춤법 검사·자동 저장·목차 관리가 합쳐진 워드프로세서가 있다면, 개발자에게는 IDE가 그 역할을 한다.

  Spring Boot 개발에서 가장 많이 쓰이는 IDE는 IntelliJ IDEA(JetBrains 제작)다. 두 가지 버전이 있다.
  Community(무료) 버전은 Java 개발과 Spring Boot 기본 기능을 모두 지원하므로 입문자에게 충분하다.
  Ultimate(유료) 버전은 Spring 전용 기능(빈 의존성 그래프, 데이터 흐름 추적, HTTP 클라이언트 내장 등)이 추가되어 실무팀에서 많이 쓴다.

  설치는 https://www.jetbrains.com/idea/download 에서 Community 버전을 내려받아 실행하면 된다.
  설치 후 Spring Initializr로 만든 프로젝트 폴더를 열 때는 `File → Open`에서 `build.gradle` 파일을 선택하고
  "Open as Project"를 클릭하면 의존성이 자동으로 내려받아진다.

  IntelliJ는 코드를 입력하는 순간 자동완성(Auto-complete) 목록이 뜨고, 오류가 있으면 빨간 밑줄로 즉시 알려준다.
  애노테이션이나 클래스 이름 위에 커서를 올리면 해당 소스 코드로 바로 이동하는 단축키(`Ctrl+B` / `Cmd+B`)도 지원한다.
  이런 기능들이 없으면 Spring Boot 코드를 처음 읽을 때 애노테이션이 어디서 무슨 일을 하는지 파악하기 어렵다.

  VSCode + Extension Pack for Java 조합도 가능하지만, 처음 Spring Boot를 배우는 단계라면 자동완성과 오류 탐지가 더 강력한 IntelliJ Community를 권장한다.

  이 Section이 중요한 이유는, 올바른 개발 환경이 갖춰져야 코드를 작성하고 즉시 실행하며 배울 수 있는 피드백 루프가 만들어지기 때문이다.
- **핵심 키워드**: IntelliJ IDEA, Community, Ultimate, Spring 플러그인
- **시각화 연결**: `chapter-03-02-intellij-setup.html` — IDE 설치 · 핵심 기능 안내
- **다음 섹션**: III-2-1

---

### Chapter III-2. Spring Initializr로 프로젝트 생성

#### III-2-1. Spring Initializr 사용하기

- **난이도**: ★★☆
- **선수 지식**: III-1-2
- **학습 목표**: 이 섹션을 마치면 start.spring.io에서 프로젝트를 생성하고 로컬에서 실행할 수 있다.
- **설명**:
  Spring Initializr(스프링 이니셜라이저)는 레고(LEGO) 기본 블록 세트 주문서와 같다. "어떤 부품이 필요한지"를 체크박스로 고르면, 그 부품들이 미리 조립된 시작 상태의 프로젝트를 zip 파일로 내려보내준다. 처음부터 폴더 구조와 설정 파일을 직접 만들 필요가 없다.

  https://start.spring.io 에 접속해 아래 항목을 선택한다:
  - Project: `Gradle - Groovy` (빌드 도구)
  - Language: `Java`
  - Spring Boot: 최신 안정 버전 (SNAPSHOT이 아닌 것)
  - Packaging: `Jar`
  - Java: `17`

  화면 오른쪽 "ADD DEPENDENCIES"에서 `Spring Web`을 추가한다. 이것만 추가해도 REST API를 만들기에 충분한 최소 세팅이 완성된다. "GENERATE" 버튼을 누르면 zip 파일이 내려받아진다. 압축을 풀고 IntelliJ에서 `build.gradle`을 선택해 프로젝트로 열면 된다.

  Starter(스타터)란 "특정 기능을 위해 필요한 의존성 묶음"이다. `spring-boot-starter-web` 하나를 추가하면 내장 Tomcat, Spring MVC, Jackson(JSON 변환기) 등이 한꺼번에 들어온다. Starter가 없다면 개발자가 이 세 가지 라이브러리의 버전을 각각 찾아서 충돌 없이 맞춰야 한다. Starter는 검증된 ��전 조합을 미리 묶어놓은 "세트 메뉴"라서, 하나만 골라도 필요한 재료가 전부 따라온다.

  이 Section이 중요한 이유는, 프로젝트 초기 설정을 직접 짜는 시간을 없애주어 처음부터 핵심 코드에만 집중할 수 있게 해주기 때문이다.
- **핵심 키워드**: Spring Initializr, start.spring.io, Starter, Gradle, Jar
- **시각화 연결**: `chapter-03-03-spring-initializr.html` — 레고 주문서 비유 · Starter 세트 메뉴
- **다음 섹션**: III-2-2

#### III-2-2. 프로젝트 구조 이해하기

- **난이도**: ★★☆
- **선수 지식**: III-2-1
- **학습 목표**: 이 섹션을 마치면 Spring Boot 기본 폴더 구조를 보고 각 파일의 역할을 설명할 수 있다.
- **설명**:
  Spring Boot 프로젝트 구조는 새 아파트의 방 배치도와 같다. 처음엔 낯설지만, 각 방(폴더)이 무엇을 위한 공간인지 한 번만 이해하면 이후에는 헷갈리지 않는다.

  핵심 폴더와 파일은 세 곳이다. 첫째, `src/main/java/` 아래에 실제 비즈니스 로직이 담긴 Java 코드가 들어간다. 패키지 이름이 긴 것처럼 보이지만, 코드를 기능별로 분류하는 "서랍장" 역할을 한다. 둘째, `src/main/resources/application.properties`는 DB 접속 주소, 서버 포트 등 환경 설정값을 모아두는 "설정 파일"이다. 코드를 바꾸지 않아도 이 파일만 수정해 동작 방식을 바꿀 수 있다. 셋째, `build.gradle`은 어떤 외부 라이브러리를 쓸지 선언하는 "장바구니 목록"이다.

  진입점(프로그램이 시작되는 곳)은 `@SpringBootApplication`이 붙은 메인 클래스다:
  ```java
  @SpringBootApplication
  public class DemoApplication {
      public static void main(String[] args) {
          SpringApplication.run(DemoApplication.class, args);
      }
  }
  ```
  `SpringApplication.run()`이 호출되는 순간 내장 Tomcat(웹 서버)이 시작되고 HTTP 요청을 받을 준비가 된다.

  이 Section이 중요한 이유는, 폴더 구조를 모르면 코드를 어디에 작성해야 할지 매번 헷갈리게 되고, 구조를 알면 새 기능을 추가할 때 자연스럽게 올바른 위치에 파일을 만들 수 있기 때문이다.
- **핵심 키워드**: @SpringBootApplication, application.properties, src/main, SpringApplication.run
- **시각화 연결**: `chapter-03-04-project-structure.html` — 폴더 배치도 · 진입점 코드
- **다음 섹션**: III-3-1

---

### Chapter III-3. Hello World API

#### III-3-1. 첫 번째 REST 엔드포인트

- **난이도**: ★★☆
- **선수 지식**: III-2-2
- **학습 목표**: 이 섹션을 마치면 `@RestController`와 `@GetMapping`을 이용해 GET 요청에 JSON을 응답하는 API를 직접 만들 수 있다.
- **설명**:
  Spring Boot의 컨트롤러(Controller)는 건물 안내 데스크 직원과 같다. 방문객(HTTP 요청)이 "3층 회의실 어디예요?"라고 물으면, 안내 직원이 정해진 응답을 돌려준다. 컨트롤러도 마찬가지로, 특정 URL로 들어온 요청을 받아서 정해진 응답을 보내준다.

  코드로 보면 두 개의 애노테이션(Annotation, 코드에 붙이는 메타 정보)으로 시작한다:
  ```java
  @RestController
  public class HelloController {

      @GetMapping("/hello")
      public String hello() {
          return "Hello, Spring Boot!";
      }
  }
  ```
  `@RestController`는 "이 클래스가 HTTP 요청을 받아 응답 본문을 직접 반환한다"는 선언이다. `@GetMapping("/hello")`는 GET 방식으로 `/hello` 경로에 들어온 요청을 이 메서드에 연결하는 URL 매핑(연결 지도)이다.

  위 예시처럼 `String`을 반환하면 텍스트 그대로 응답된다. 만약 `Map`이나 Java 객체를 반환하면, Spring이 자동으로 JSON(JavaScript Object Notation, 데이터를 표현하는 경량 형식)으로 변환한다. 이것이 가능한 이유는 `spring-boot-starter-web`에 Jackson(자바 객체를 JSON으로 바꿔주는 라이브러리)이 자동으로 포함되어 있기 때문이다. 개발자가 별도 설정을 하지 않아도 된다.

  이 Section이 중요한 이유는, 이 패턴 하나가 Spring Boot로 만드는 모든 API의 기본 뼈대이며, 이 구조를 이해하면 이후 복잡한 엔드포인트도 같은 방식으로 확장할 수 있기 때문이다.
- **핵심 키워드**: @RestController, @GetMapping, Jackson, JSON 직렬화, HTTP 200
- **시각화 연결**: `chapter-03-05-first-rest-endpoint.html` — 코드 하이라이트 + 요청/응답 흐름
- **다음 섹션**: III-3-2

#### III-3-2. 내장 Tomcat으로 실행하기

- **난이도**: ★★☆
- **선수 지식**: III-3-1
- **학습 목표**: 이 섹션을 마치면 `./gradlew bootRun` 명령으로 서버를 시작하고, curl이나 브라우저로 API 응답을 확인할 수 있다.
- **설명**:
  예전 Java 웹 개발에서는 Tomcat(웹 서버 소프트웨어)을 별도로 설치하고 설정한 뒤, 만든 코드를 배포하는 절차가 필요했다. 마치 카페를 열기 전에 주방 공사를 먼저 외부 업체에 맡겨야 하는 것과 같다. Spring Boot는 이 과정을 없앴다. Tomcat이 애플리케이션 안에 내장되어 있어서, 카페에 주방이 이미 갖춰진 채로 문을 여는 것처럼 명령 하나로 바로 서버가 뜬다.

  프로젝트 루트 폴더에서 아래 명령을 실행한다:
  ```
  ./gradlew bootRun
  ```
  콘솔에 `Started DemoApplication in X.XXX seconds`가 보이면 서버가 8080 포트에서 시작된 것이다.

  이제 두 가지 방법으로 API를 확인할 수 있다. 브라우저 주소창에 `http://localhost:8080/hello`를 입력하거나, 터미널에서 아래를 실행한다:
  ```
  curl http://localhost:8080/hello
  ```
  응답으로 `Hello, Spring Boot!`가 출력되면 성공이다.

  포트(Port, 서버가 통신에 사용하는 번호)를 바꾸고 싶으면 `application.properties`에 한 줄을 추가한다:
  ```
  server.port=9090
  ```
  이 한 줄이면 8080 대신 9090 포트에서 서버가 뜬다. 이처럼 `application.properties`는 코드를 바꾸지 않고 동작을 조정하는 "설정 리모컨"이다.

  이 Section이 중요한 이유는, 내장 서버 방식이 개발 사이클을 크게 단축하며 실제로 내 코드가 동작하는 순간을 직접 눈으로 확인함으로써 학습 동기가 높아지기 때문이다.
- **핵심 키워드**: 내장 Tomcat, bootRun, localhost:8080, application.properties, server.port
- **시각화 연결**: `chapter-03-06-embedded-tomcat.html` — bootRun · curl · 포트 변경 체험
- **다음 섹션**: IV-1-1

---

## Part IV. Spring Boot 코어 (DI / AOP)

> Spring Boot가 요청을 처리하는 핵심 메커니즘을 단계별 시각화와 함께 이해한다.

---

### Chapter IV-1. HTTP 요청 처리 계층

#### IV-1-1. 요청 처리 7계층 흐름 (index.html 시각화)

- **난이도**: ★★☆
- **선수 지식**: III-3-2
- **학습 목표**: 이 섹션을 마치면 HTTP 요청이 Tomcat에서 시작해 DB까지 내려갔다가 JSON 응답으로 돌아오는 7단계 흐름을 순서대로 설명할 수 있다.
- **설명**:
  HTTP 요청 처리 과정은 호텔 체크인과 닮았다. 손님(요청)이 호텔에 들어서면 프런트(Tomcat)가 먼저 맞이하고, 중앙 안내 데스크(DispatcherServlet)로 안내한다. 데스크는 어느 부서가 담당인지 찾아주고(HandlerMapping), 각 부서 직원이 실제 서비스를 처리한 뒤(Controller → Service → Repository), 완성된 결과가 역순으로 올라와 손님에게 전달된다.

  `GET /users/1` 요청을 기준으로 7단계를 순서대로 따라가 보자.

  ① **Tomcat** — 네트워크 소켓(Socket, 연결 통로)에서 HTTP 패킷을 수신하고 서블릿(Servlet, Java 웹 컴포넌트) 컨테이너로 전달한다.
  ② **DispatcherServlet** — 모든 경로(`/*`)를 담당하는 프런트 컨트롤러(Front Controller). 이 단일 진입점이 이후 모든 흐름을 조율한다.
  ③ **HandlerMapping** — 요청 URL과 HTTP 메서드를 분석해 어느 `@RestController` 메서드를 실행할지 결정한다. 결정된 메서드는 HandlerAdapter를 통해 호출된다(IV-1-2에서 상세 설명).
  ④ **@RestController** — 실제 메서드가 호출된다. 파라미터 파싱, 유효성 검사 등 웹 계층 책임을 여기서 수행한다.
  ⑤ **@Service** — 비즈니스 로직(Business Logic, 핵심 업무 처리) 영역이다. 예: 사용자가 존재하는지 확인, 권한 체크.
  ⑥ **@Repository (JPA)** — SQL을 자동 생성해 DB에 질의한다. 개발자는 SQL 없이 `findById(1L)` 한 줄로 조회할 수 있다.
  ⑦ **Jackson (응답 직렬화)** — 조회된 Java 객체를 JSON 문자열로 변환(직렬화, Serialization)해 HTTP 응답 바디에 담는다.

  각 계층의 역할 분리 덕분에 Controller를 바꿔도 Service 로직은 그대로 유지되고, DB를 교체해도 Controller는 영향받지 않는다.

  7단계 흐름을 단계별 애니메이션으로 확인하려면 `chapter-04-01-request-flow.html` 시각화를 열어보자. 각 STEP을 클릭하면 데이터가 어느 계층을 지나는지 실시간으로 강조 표시된다.

  이 Section이 중요한 이유는, 7계층 흐름을 모르면 버그가 어느 계층에서 발생했는지 추적하기 어렵고 로그를 읽어도 전체 그림이 잡히지 않기 때문이다.
- **핵심 키워드**: Tomcat, DispatcherServlet, HandlerMapping, @RestController, @Service, @Repository, JPA, Jackson
- **시각화 연결**: `chapter-04-01-request-flow.html` (HTTP 요청 처리 계층 7-STEP 인터랙티브 시각화)
- **다음 섹션**: IV-1-2

#### IV-1-2. DispatcherServlet과 Front Controller 패턴

- **난이도**: ★★☆
- **선수 지식**: IV-1-1
- **학습 목표**: 이 섹션을 마치면 DispatcherServlet이 왜 모든 요청을 받는지, HandlerAdapter와의 협력 관계를 설명할 수 있다.
- **설명**:
  공항을 상상해보자. 탑승객이 수십 개의 게이트로 흩어지기 전에 반드시 거쳐야 하는 중앙 안내 게이트가 있다. Spring MVC에서 DispatcherServlet이 바로 그 역할이다. 모든 HTTP 요청(`/*`)이 이 단일 서블릿(Servlet, Java 웹 컴포넌트) 하나로 집중되는 구조를 Front Controller 패턴이라 한다.

  DispatcherServlet이 요청을 받으면 세 단계로 협력한다.

  첫째, **HandlerMapping** — URL 경로와 HTTP 메서드를 보고 어느 `@Controller` 메서드를 실행할지 결정한다. Spring Boot에서는 `@RequestMapping`, `@GetMapping`, `@PostMapping` 등의 애노테이션이 이 매핑 정보를 제공한다.

  둘째, **HandlerAdapter** — 찾아낸 메서드를 실제로 호출한다. 다양한 Controller 형태(일반 MVC, REST, 함수형 등)를 동일한 방식으로 실행할 수 있도록 어댑터 패턴(Adapter Pattern)으로 구현되어 있다.

  셋째, **MessageConverter(메시지 변환기)** — REST API에서는 ViewResolver 대신 이것이 동작한다. `@RestController`가 반환한 Java 객체를 JSON으로 변환(Jackson 라이브러리 사용)해 HTTP 응답 바디에 쓴다.

  개발자는 이 세 단계를 직접 코딩하지 않는다. `@RestController`와 `@GetMapping("/users/{id}")`만 선언하면 Spring이 나머지를 자동으로 연결해 준다. 이것이 "설정보다 관례(Convention over Configuration)"라는 Spring Boot의 철학이다.

  `chapter-04-01-request-flow.html` 시각화의 STEP 2, 3에서 HandlerMapping과 HandlerAdapter가 동작하는 순서를 직접 확인할 수 있다.

  이 Section이 중요한 이유는, DispatcherServlet의 역할을 알아야 인터셉터(Interceptor), 필터(Filter), 예외 처리(ExceptionHandler)가 어느 시점에 끼어드는지를 이해할 수 있기 때문이다.
- **핵심 키워드**: DispatcherServlet, Front Controller, HandlerMapping, HandlerAdapter, MessageConverter
- **시각화 연결**: `chapter-04-03-dispatcher-servlet.html` — DispatcherServlet 내부 흐름 (HandlerMapping → Adapter → MessageConverter)
- **다음 섹션**: IV-2-1

---

### Chapter IV-2. 의존성 주입(DI)과 IoC 컨테이너

#### IV-2-1. DI(의존성 주입)란

- **난이도**: ★★☆
- **선수 지식**: I-3-1
- **학습 목표**: 이 섹션을 마치면 DI가 무엇인지, 왜 쓰는지를 생성자 주입 예시로 설명할 수 있다.
- **설명**:
  레고를 조립할 때 부품을 직접 공장에서 만들어 쓰지 않는다. 이미 만들어진 블록을 받아서 끼워 맞출 뿐이다. DI(의존성 주입, Dependency Injection)도 마찬가지다. "내가 쓸 객체를 직접 만들지 않고, 외부(Spring 컨테이너)에서 받아 쓴다"는 원칙이다.

  직접 생성하는 방식(`new` 키워드)과 비교해 보자.

  ```java
  // 직접 생성 — 강하게 묶임(강한 결합)
  public class UserController {
      private UserService userService = new UserService(); // 직접 생성
  }
  ```

  ```java
  // 생성자 주입 — 느슨하게 연결(느슨한 결합, Loose Coupling)
  public class UserController {
      private final UserService userService;

      public UserController(UserService userService) { // Spring이 주입
          this.userService = userService;
      }
  }
  ```

  첫 번째 방식에서는 `UserController`가 `UserService` 구현체에 직접 의존한다. `UserService`를 교체하려면 `UserController` 코드도 함께 수정해야 한다. 두 번째 방식에서는 Spring이 알맞은 `UserService` 객체를 골라 생성자로 넘겨준다. `UserController`는 어떤 구현체가 오는지 알 필요가 없다.

  테스트할 때 이 차이가 두드러진다. 생성자 주입 방식에서는 테스트 코드에서 가짜 객체(Mock)를 직접 주입할 수 있어 DB 연결 없이도 단위 테스트(Unit Test)가 가능하다.

  Spring Boot에서는 `@Component` 또는 `@Service` 애노테이션과 생성자가 하나뿐이면 `@Autowired` 없이도 자동 주입된다.

  이 Section이 중요한 이유는, DI를 이해하지 못하면 Spring의 거의 모든 기능(AOP, Security, Transaction)이 어떻게 동작하는지 파악할 수 없기 때문이다.
- **핵심 키워드**: DI, 생성자 주입, @Autowired, 느슨한 결합(Loose Coupling), 테스트 용이성
- **시각화 연결**: `chapter-04-04-di-injection.html` — new vs 생성자 주입 코드 비교 · Mock 테스트
- **다음 섹션**: IV-2-2

#### IV-2-2. Spring Bean과 IoC 컨테이너

- **난이도**: ★★☆
- **선수 지식**: IV-2-1
- **학습 목표**: 이 섹션을 마치면 Spring Bean이 무엇인지, ApplicationContext가 어떻게 Bean을 관리하는지 설명할 수 있다.
- **설명**:
  회사의 인사부(HR)를 떠올려 보자. 직원(객체)을 직접 고용해 사원 명부에 등록하고, 어느 부서에 배치할지 결정하며, 퇴사할 때 인수인계를 처리한다. Spring의 IoC 컨테이너(ApplicationContext)가 바로 인사부 역할이다. 그리고 컨테이너가 관리하는 객체 하나하나를 **Bean(빈)**이라 한다.

  어떤 클래스가 Bean이 되려면 Spring에게 "이 클래스를 관리해달라"고 알려야 한다. 애노테이션으로 선언하면 된다.

  ```java
  @Service          // 비즈니스 로직 계층
  public class UserService { ... }

  @Repository       // DB 접근 계층
  public class UserRepository { ... }

  @Component        // 그 밖의 일반 컴포넌트
  public class EmailSender { ... }
  ```

  서버가 시작되면 ApplicationContext가 클래스패스(Classpath, 클래스 파일을 찾는 경로)를 스캔해 위 애노테이션이 붙은 클래스를 전부 찾아 Bean으로 등록하고 의존관계를 자동으로 연결한다. 이 과정을 **컴포넌트 스캔(Component Scan)**이라 한다.

  기본 전략은 **싱글톤(Singleton)** — Bean 인스턴스를 딱 하나만 생성해서 모든 곳에 공유한다. 매 요청마다 새로 만들 필요가 없는 Service, Repository 같은 무상태(Stateless) 클래스에 적합하다.

  Bean 생명주기(Life Cycle)는 생성 → 의존관계 주입 → 초기화(`@PostConstruct`) → 사용 → 소멸(`@PreDestroy`) 순이다. 이 전체 주기를 단계별로 확인하려면 `chapter-04-02-bean-lifecycle.html` 시각화를 참고한다.

  이 Section이 중요한 이유는, Bean과 컨테이너를 이해해야 Spring 애플리케이션이 시작 시 무엇을 하는지, 객체가 언제 만들어지고 공유되는지를 파악할 수 있기 때문이다.
- **핵심 키워드**: Bean, IoC 컨테이너, ApplicationContext, @Component, 싱글톤
- **시각화 연결**: `chapter-04-02-bean-lifecycle.html` (Bean 생명주기 인터랙티브 시각화)
- **다음 섹션**: IV-3-1

---

### Chapter IV-3. AOP와 트랜잭션

#### IV-3-1. AOP(관점 지향 프로그래밍) 개요

- **난이도**: ★★★
- **선수 지식**: IV-2-2
- **학습 목표**: 이 섹션을 마치면 AOP가 왜 필요한지, @Transactional이 AOP로 어떻게 동작하는지 설명할 수 있다.
- **설명**:
  대형 건물에 보안 CCTV를 설치한다고 가정하자. 각 사무실마다 담당자가 직접 CCTV를 운영하는 대신, 건물 복도에 통합 CCTV를 설치해 모든 출입을 한 곳에서 관찰한다. AOP(관점 지향 프로그래밍, Aspect-Oriented Programming)가 이 구조다. 로깅, 트랜잭션, 인증 확인처럼 여러 클래스에 반복되는 코드를 **횡단 관심사(Cross-cutting Concern)**라 하고, AOP는 이를 핵심 비즈니스 로직과 완전히 분리해 한 곳(Aspect)에서 관리한다.

  AOP의 핵심 용어를 정리하면 다음과 같다.

  - **Pointcut(포인트컷)**: "어디에" 적용할지를 정의한다. 예: `execution(* com.example.service.*.*(..))` — service 패키지의 모든 메서드
  - **Advice(어드바이스)**: "언제, 무엇을" 실행할지를 정의한다. `@Before`(메서드 실행 전), `@After`(실행 후), `@Around`(전후 모두) 등이 있다.
  - **Aspect(애스펙트)**: Pointcut + Advice를 묶은 모듈이다.

  Spring에서 AOP는 **Proxy(프록시) 패턴**으로 구현된다. Spring이 원본 Bean 대신 프록시 객체를 생성해서 메서드 호출을 가로챈 뒤, Advice 코드를 실행하고 원본 메서드를 호출한다. 호출자는 프록시인지 원본인지 모른다.

  실무에서 가장 자주 보는 AOP 활용이 `@Transactional`이다.

  ```java
  @Service
  public class OrderService {
      private final OrderRepository orderRepository;
      private final InventoryRepository inventoryRepository;
      // 생성자 주입 생략 (IV-2-1 참고)

      @Transactional  // AOP가 자동으로 트랜잭션을 열고 닫는다
      public void placeOrder(OrderRequest request) {
          orderRepository.save(request.toOrder());
          inventoryRepository.decrease(request.getItemId());
          // 예외 발생 시 Spring이 자동으로 rollback
      }
  }
  ```

  이 애노테이션 하나가 "트랜잭션 시작 → 메서드 실행 → 성공 시 커밋(Commit) → 실패 시 롤백(Rollback)"이라는 4단계를 자동으로 처리한다. 개발자는 트랜잭션 코드를 직접 쓰지 않아도 된다.

  이 Section이 중요한 이유는, AOP와 Proxy 동작 방식을 모르면 `@Transactional`이 붙었는데도 롤백이 안 되는 상황(같은 클래스 내 메서드 호출 시 Proxy 우회)을 이해하거나 디버깅하기 어렵기 때문이다.
- **핵심 키워드**: AOP, 횡단 관심사, @Transactional, Proxy, Advice, Pointcut
- **시각화 연결**: `chapter-04-05-aop-transaction.html` — CCTV 비유 · Proxy 패턴 · @Transactional 4단계
- **다음 섹션**: V-1-1

---

## Part V. 웹·DB·보안 계층

> REST API 설계, JPA로 DB 연동, Spring Security로 인증까지 실무 3대 핵심을 다룬다.

---

### Chapter V-1. REST API 설계

#### V-1-1. REST 원칙과 HTTP 메서드

- **난이도**: ★★★
- **선수 지식**: III-3-1
- **학습 목표**: 이 섹션을 마치면 REST 6원칙을 설명하고 GET/POST/PUT/PATCH/DELETE를 올바르게 사용할 수 있다.
- **설명**: REST(Representational State Transfer)는 URL로 자원(Resource)을 표현하고, HTTP 메서드로 행동을 표현하는 설계 방식이다. "창고에 무엇이 있느냐"는 URL이 답하고, "무엇을 할 것이냐"는 HTTP 메서드가 답한다고 보면 된다.

  HTTP 메서드별 역할은 다음과 같다.

  | 메서드 | 역할 | 예시 |
  |:--|:--|:--|
  | GET | 조회 | `GET /users/1` |
  | POST | 생성 | `POST /users` |
  | PUT | 전체 수정 | `PUT /users/1` |
  | PATCH | 부분 수정 | `PATCH /users/1` |
  | DELETE | 삭제 | `DELETE /users/1` |

  URL에 동사를 넣는 것은 REST 안티패턴이다. `/getUser`, `/createUser` 같은 URL은 REST가 아니다.

  Spring Boot에서 각 메서드는 매핑 애노테이션으로 처리한다.

  ```java
  @RestController
  @RequestMapping("/users")
  public class UserController {

      @GetMapping("/{id}")
      public UserResponse getUser(@PathVariable Long id) { ... }

      @PostMapping
      public UserResponse createUser(@RequestBody UserCreateRequest request) { ... }

      @PatchMapping("/{id}")
      public UserResponse updateUser(@PathVariable Long id,
                                     @RequestBody UserUpdateRequest request) { ... }

      @DeleteMapping("/{id}")
      public void deleteUser(@PathVariable Long id) { ... }
  }
  ```

  REST 6원칙은 Client-Server 분리, Stateless(무상태성), Cacheable(캐시 가능), Uniform Interface(균일 인터페이스), Layered System(계층 구조), Code on Demand(선택)이다. 이 중 실무에서 가장 자주 위반되는 것은 **무상태성**이다. 서버가 클라이언트 상태를 세션으로 들고 있으면 REST가 아니다. JWT를 쓰는 이유도 여기에 있다.

  이 섹션이 중요한 이유는 잘못 설계된 URL 구조와 메서드 선택은 나중에 API 버전이 쌓일수록 유지보수를 크게 어렵게 만들기 때문이다.
- **핵심 키워드**: REST, @GetMapping, @PostMapping, @PutMapping, @PatchMapping, @DeleteMapping, @PathVariable, @RequestBody
- **시각화 연결**: `chapter-05-01-rest-principles.html` — 5가지 HTTP 메서드 · 안티패턴 비교
- **다음 섹션**: V-1-2

#### V-1-2. DTO와 응답 구조 설계

- **난이도**: ★★★
- **선수 지식**: V-1-1
- **학습 목표**: 이 섹션을 마치면 DTO(Data Transfer Object)를 Entity와 분리해야 하는 이유를 설명하고 Record 클래스로 DTO를 만들 수 있다.
- **설명**: Entity(DB 테이블과 매핑되는 클래스)를 API 응답에 직접 노출하면 두 가지 문제가 생긴다. 첫째, `password`처럼 민감한 필드가 그대로 JSON에 담겨 나간다. 둘째, DB 컬럼 이름을 바꾸면 API 응답 구조도 함께 바뀌어 클라이언트가 깨진다.

  DTO(Data Transfer Object)는 이 문제를 해결하는 API 입출력 전용 객체다. Entity와 DTO를 분리하면 DB 내부 구조를 외부에 숨길 수 있고, 두 계층을 독립적으로 수정할 수 있다.

  Java 16+의 Record를 쓰면 불변(Immutable) DTO를 가장 간결하게 만들 수 있다.

  ```java
  // 응답 DTO — 노출할 필드만 담는다
  public record UserResponse(Long id, String name, String email) {}

  // 요청 DTO — 입력값만 담는다
  public record UserCreateRequest(String name, String email, String password) {}
  ```

  Service 계층에서 Entity → DTO 변환을 책임진다.

  ```java
  public UserResponse getUser(Long id) {
      User user = userRepository.findById(id)
              .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));
      return new UserResponse(user.getId(), user.getName(), user.getEmail());
  }
  ```

  Jackson(Spring Boot 기본 JSON 라이브러리)은 Record의 컴포넌트 필드를 자동으로 직렬화(Serialization)한다. `@JsonProperty` 없이도 필드 이름 그대로 JSON 키가 된다.

  공통 응답 구조가 필요하면 `ApiResponse<T>` 같은 래퍼(Wrapper) 클래스를 추가하는 방식이 실무에서 많이 쓰인다.

  이 섹션이 중요한 이유는 Entity와 DTO 분리는 API 안정성의 기초이며, 이를 지키지 않으면 DB 변경 한 번에 클라이언트 전체가 영향을 받는 상황이 반복되기 때문이다.
- **핵심 키워드**: DTO, Entity 분리, Record, 불변 객체, Jackson 직렬화
- **시각화 연결**: `chapter-05-02-dto-response.html` — Entity→DTO 분리 · record · 응답 구조
- **다음 섹션**: V-2-1

---

### Chapter V-2. JPA와 Hibernate

#### V-2-1. ORM 개념과 JPA 소개

- **난이도**: ★★★
- **선수 지식**: IV-1-1
- **학습 목표**: 이 섹션을 마치면 ORM이 무엇인지, JPA가 Hibernate 위에서 어떻게 동작하는지 설명할 수 있다.
- **설명**: ORM(Object-Relational Mapping)이 없던 시절에는 JDBC로 SQL을 직접 작성하고, ResultSet에서 필드를 하나씩 꺼내 Java 객체에 채워야 했다. 컬럼이 30개면 코드도 30줄이 됐다. ORM은 이 반복 작업을 자동화한다.

  JPA(Jakarta Persistence API)는 ORM의 표준 인터페이스(규격)이고, Hibernate는 그 규격을 실제로 구현한 라이브러리다. Spring Boot는 기본적으로 Hibernate를 JPA 구현체로 사용한다.

  `@Entity`와 `@Id`를 선언하면 Hibernate가 해당 클래스를 DB 테이블과 매핑한다.

  ```java
  @Entity
  @Table(name = "users")
  public class User {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(nullable = false)
      private String name;

      private String email;

      // getter, setter 또는 Lombok @Getter
  }
  ```

  JPA는 영속성 컨텍스트(Persistence Context)라는 1차 캐시를 관리한다. 같은 트랜잭션 안에서 같은 ID로 두 번 조회하면 SQL이 한 번만 실행되고, 두 번째는 캐시에서 반환한다. 이 동작 방식은 쿼리 수를 예측할 때 반드시 알아야 한다.

  개발 환경에서는 `spring.jpa.show-sql=true`를 `application.properties`에 추가해 Hibernate가 실행하는 SQL을 콘솔에서 확인하자. 어떤 SQL이 나가는지 확인하는 습관이 중요하다. 단, 운영 환경에서는 성능과 로그 양 문제로 끄는 것이 일반적이다.

  이 섹션이 중요한 이유는 JPA를 모르면 N+1 문제 같은 성능 함정을 인식조차 못하고 운영 환경에서 문제를 겪기 때문이다.
- **핵심 키워드**: ORM, JPA, Hibernate, @Entity, @Id, CRUD, 영속성 컨텍스트
- **시각화 연결**: `chapter-05-03-orm-jpa.html` — JDBC vs ORM · JPA/Hibernate 관계 · @Entity
- **다음 섹션**: V-2-2

#### V-2-2. Spring Data JPA — JpaRepository

- **난이도**: ★★★
- **선수 지식**: V-2-1
- **학습 목표**: 이 섹션을 마치면 JpaRepository를 상속하는 인터페이스만으로 findById, save, delete 등 기본 CRUD를 구현할 수 있다.
- **설명**: Spring Data JPA는 JPA 위에 추상화 계층을 추가해서 Repository를 인터페이스 선언만으로 완성할 수 있게 한다. `JpaRepository<Entity, ID타입>`을 상속하면 Spring이 런타임에 구현체를 자동으로 생성한다.

  ```java
  public interface UserRepository extends JpaRepository<User, Long> {
      // 이 한 줄만으로 findById, findAll, save, deleteById 등이 제공된다
  }
  ```

  기본 제공 메서드는 다음과 같다.

  | 메서드 | 동작 |
  |:--|:--|
  | `findById(id)` | Optional로 단건 조회 |
  | `findAll()` | 전체 목록 조회 |
  | `save(entity)` | 저장 또는 수정 (id 유무로 결정) |
  | `deleteById(id)` | ID로 삭제 |
  | `existsById(id)` | 존재 여부 확인 |

  기본 메서드로 부족할 때는 메서드 이름 쿼리(Derived Query)를 쓴다. 규칙에 맞는 이름을 선언하면 Hibernate가 SQL을 자동 생성한다.

  ```java
  public interface UserRepository extends JpaRepository<User, Long> {
      Optional<User> findByEmail(String email);
      List<User> findByNameContaining(String keyword);
      boolean existsByEmail(String email);
  }
  ```

  `findById`는 `Optional<User>`를 반환한다. 결과가 없을 때 `null` 대신 빈 Optional을 반환하므로, `orElseThrow()`로 안전하게 처리한다.

  ```java
  User user = userRepository.findById(id)
          .orElseThrow(() -> new EntityNotFoundException("유저 없음"));
  ```

  이 섹션이 중요한 이유는 JpaRepository 하나로 대부분의 CRUD가 해결되며, 실무 코드의 Repository 계층이 얼마나 얇고 간결해질 수 있는지를 직접 경험할 수 있기 때문이다.
- **핵심 키워드**: JpaRepository, findById, Optional, save, deleteById, 메서드 이름 쿼리
- **시각화 연결**: `chapter-05-04-jpa-repository.html` — CRUD 자동 생성 · 쿼리 메서드 · 페이징
- **다음 섹션**: V-3-1

---

### Chapter V-3. Spring Security

#### V-3-1. 인증(Authentication)과 인가(Authorization)

- **난이도**: ★★★
- **선수 지식**: V-1-1
- **학습 목표**: 이 섹션을 마치면 인증과 인가의 차이를 설명하고, Spring Security의 Filter Chain 구조를 간략히 이해할 수 있다.
- **설명**: 인증(Authentication)은 "당신이 누구냐?"를 확인하는 단계고, 인가(Authorization)는 "당신이 이것을 할 수 있냐?"를 결정하는 단계다. 로그인은 인증이고, 관리자 페이지 접근 제어는 인가다. 순서는 항상 인증 → 인가다.

  Spring Security는 HTTP 요청이 DispatcherServlet에 도달하기 전에 Filter Chain(필터 연쇄)이 가로채서 인증과 인가를 처리한다. 필터는 서블릿 레벨에서 동작하므로 Spring MVC(@Controller) 코드가 실행되기 전에 검사가 완료된다.

  ```
  HTTP 요청
     ↓
  Filter Chain (Spring Security)
     ↓  인증 실패 → 401 Unauthorized 반환
  DispatcherServlet
     ↓
  @Controller / @RestController
  ```

  실무 REST API에서는 JWT(JSON Web Token) + Bearer Token 방식을 주로 사용한다. 클라이언트가 로그인하면 서버가 JWT를 발급하고, 이후 요청마다 `Authorization: Bearer <token>` 헤더에 담아 보낸다. 서버는 세션을 저장하지 않고 토큰만 검증한다(무상태성 유지).

  ```java
  @Configuration
  @EnableWebSecurity  // Spring Boot 3.x에서는 생략 가능하지만 명시적 선언 권장
  public class SecurityConfig {

      @Bean
      public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
          http
              .csrf(csrf -> csrf.disable())              // REST API는 CSRF 불필요
              .sessionManagement(sm -> sm
                  .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 미사용
              .authorizeHttpRequests(auth -> auth
                  .requestMatchers("/auth/**").permitAll() // 로그인은 허용
                  .anyRequest().authenticated());           // 나머지는 인증 필요
          return http.build();
      }
  }
  ```

  `@PreAuthorize("hasRole('ADMIN')")`을 메서드에 붙이면 인가 검사를 메서드 레벨로 내릴 수 있다. URL 패턴 기반 인가와 병행해서 쓰는 방식이 일반적이다.

  이 섹션이 중요한 이유는 인증과 인가를 Filter Chain 수준에서 통제하지 않으면 @Controller 코드 곳곳에 보안 검사 로직이 흩어져 유지보수가 불가능해지기 때문이다.
- **핵심 키워드**: Spring Security, 인증, 인가, Filter Chain, JWT, Bearer Token
- **시각화 연결**: `chapter-05-05-security.html` — 인증 vs 인가 · Filter Chain · SecurityFilterChain · BCrypt
- **다음 섹션**: VI-1-1

---

## Part VI. 실전 REST API 프로젝트

> 지금까지 배운 모든 것을 조합해 완성형 REST API 하나를 처음부터 만들어본다.

---

### Chapter VI-1. 도메인 설계

#### VI-1-1. 요구사항에서 엔티티 설계까지

- **난이도**: ★★★
- **선수 지식**: V-2-2
- **학습 목표**: 이 섹션을 마치면 요구사항을 읽고 User·Post 같은 도메인 엔티티와 그 관계(@OneToMany 등)를 설계할 수 있다.
- **설명**: 실전 프로젝트는 요구사항 분석에서 시작한다.
  "사용자는 게시글을 여러 개 쓸 수 있다"는 문장을 JPA로 표현하면 User와 Post 사이에 `@OneToMany` / `@ManyToOne` 관계가 생긴다.
  User 입장에서는 `@OneToMany(mappedBy = "user") List<Post> posts`, Post 입장에서는 `@ManyToOne @JoinColumn(name = "user_id") User user`다.
  연관관계 주인(FK를 가진 쪽)은 항상 `@ManyToOne` 쪽이므로 `mappedBy`는 반대쪽에만 붙인다.

  엔티티 설계 시 모든 테이블에 `createdAt`, `updatedAt`을 추가하는 것이 운영 관례다.
  이를 개별 엔티티마다 직접 작성하면 반복 코드가 늘어난다.
  `@MappedSuperclass`(공통 필드를 상속하는 JPA 베이스 클래스)에 두 필드를 모아두고,
  `@EntityListeners(AuditingEntityListener.class)`를 붙이면 저장·수정 시 Spring Data가 자동으로 값을 채운다.
  메인 클래스에 `@EnableJpaAuditing`을 추가해야 이 기능이 활성화된다.

  ```java
  @MappedSuperclass
  @EntityListeners(AuditingEntityListener.class)
  public abstract class BaseEntity {
      @CreatedDate
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;
  }
  ```

  엔티티 클래스는 `extends BaseEntity`만 하면 두 필드를 자동으로 물려받는다.
  도메인 관계와 공통 필드를 명확히 잡아야 이후 API 구현과 테스트가 흔들리지 않는다.
  이 섹션이 중요한 이유는 잘못된 연관관계 설계가 N+1 쿼리 같은 성능 문제로 이어지기 때문이다.
- **핵심 키워드**: @Entity, @OneToMany, @ManyToOne, JPA Auditing, createdAt, updatedAt
- **시각화 연결**: `chapter-06-01-entity-design.html` — 요구사항→관계 · @OneToMany · BaseEntity
- **다음 섹션**: VI-2-1

---

### Chapter VI-2. API 구현 전체 사이클

#### VI-2-1. Controller → Service → Repository 전체 구현

- **난이도**: ★★★
- **선수 지식**: VI-1-1
- **학습 목표**: 이 섹션을 마치면 User 목록 조회 API를 Controller, Service, Repository 3계층으로 분리해 완성할 수 있다.
- **설명**: 3계층 구조의 핵심은 "각 계층이 자기 책임만 진다"는 것이다.
  Controller는 HTTP 요청 파싱과 응답 포맷팅만 담당한다.
  Service는 비즈니스 로직(권한 체크, 데이터 조합)만 담당한다.
  Repository는 SQL(JPA 쿼리)만 담당한다.

  "사용자 전체 목록 조회" API를 예로 들면 코드 흐름은 다음과 같다.

  ```java
  // Controller — HTTP 요청만 받고 Service를 호출한다
  @RestController
  @RequiredArgsConstructor
  public class UserController {
      private final UserService userService;

      @GetMapping("/users")
      public List<UserResponse> getUsers() {
          return userService.getAll();
      }
  }

  // Service — 비즈니스 로직 처리. 여기서는 전체 조회 후 DTO 변환
  @Service
  @RequiredArgsConstructor
  public class UserService {
      private final UserRepository userRepository;

      public List<UserResponse> getAll() {
          return userRepository.findAll().stream()
              .map(UserResponse::from)
              .toList();
      }
  }

  // Repository — DB 접근만 담당. JpaRepository 상속으로 findAll() 기본 제공
  public interface UserRepository extends JpaRepository<User, Long> { }
  ```

  Controller가 Entity(DB 테이블과 1:1 매핑된 객체)를 직접 반환하면 비밀번호 같은 민감한 필드까지 노출된다.
  그래서 Service에서 Entity를 DTO(Data Transfer Object — 화면에 보낼 데이터만 담은 객체)로 변환한 뒤 반환하는 것이 실무 표준이다.
  `UserResponse::from`은 정적 팩토리 메서드 패턴으로, Entity에서 DTO를 만드는 로직을 한 곳에 모은다.
  계층 간 의존성은 항상 위에서 아래로만 흐른다. Repository가 Service를 알면 안 된다.
  이 분리 덕분에 테스트를 각 계층 단위로 독립적으로 작성할 수 있다.
  이 섹션이 중요한 이유는 3계층 분리가 무너지면 코드 한 줄을 고칠 때 어디까지 영향이 미치는지 추적할 수 없기 때문이다.
- **핵심 키워드**: 3계층 아키텍처, Controller, Service, Repository, 단일 책임 원칙
- **시각화 연결**: `chapter-06-02-three-layer.html` — 3계층 분리 · 계층별 코드 · 의존 방향
- **다음 섹션**: VI-2-2

#### VI-2-2. 전역 예외 처리 — @ControllerAdvice

- **난이도**: ★★★
- **선수 지식**: VI-2-1
- **학습 목표**: 이 섹션을 마치면 @ControllerAdvice를 이용해 예외를 한 곳에서 처리하고 일관된 에러 응답 구조를 반환할 수 있다.
- **설명**: 각 Controller마다 try-catch를 넣으면 코드가 중복되고 에러 응답 포맷이 들쭉날쭉해진다.
  `@ControllerAdvice` + `@ExceptionHandler`를 사용하면 모든 컨트롤러에서 발생한 예외를 한 곳에서 처리할 수 있다.

  실무에서는 먼저 도메인 예외 클래스를 직접 정의한다.

  ```java
  // 커스텀 예외 — 사용자가 존재하지 않을 때
  public class UserNotFoundException extends RuntimeException {
      public UserNotFoundException(Long id) {
          super("사용자를 찾을 수 없습니다. id=" + id);
      }
  }
  ```

  그 다음 전역 핸들러를 만들어 이 예외를 잡고 일관된 JSON 응답을 반환한다.

  ```java
  @ControllerAdvice
  public class GlobalExceptionHandler {

      @ExceptionHandler(UserNotFoundException.class)
      public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException e) {
          ErrorResponse body = new ErrorResponse(404, e.getMessage());
          return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
      }

      // 예상치 못한 서버 오류는 500으로 일괄 처리
      @ExceptionHandler(Exception.class)
      public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
          ErrorResponse body = new ErrorResponse(500, "서버 내부 오류가 발생했습니다.");
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
      }
  }
  ```

  `ErrorResponse`는 `{ "status": 404, "message": "..." }` 구조의 단순한 레코드나 클래스로 만든다.
  Service에서 `throw new UserNotFoundException(id)`만 던지면 나머지는 `GlobalExceptionHandler`가 처리한다.
  클라이언트(프론트엔드)가 항상 같은 형태의 에러 JSON을 받게 되어 예외 처리 로직을 공통화할 수 있다.
  이 섹션이 중요한 이유는 에러 응답 포맷이 일관되지 않으면 API를 사용하는 클라이언트 측 오류 처리가 복잡해지기 때문이다.
- **핵심 키워드**: @ControllerAdvice, @ExceptionHandler, 전역 예외 처리, HTTP 상태코드, 에러 응답 포맷
- **시각화 연결**: `chapter-06-03-exception-handling.html` — 커스텀 예외 · GlobalExceptionHandler · 일관된 에러 응답
- **다음 섹션**: VI-3-1

---

### Chapter VI-3. 테스트

#### VI-3-1. 단위 테스트 — JUnit5와 Mockito

- **난이도**: ★★★
- **선수 지식**: VI-2-2
- **학습 목표**: 이 섹션을 마치면 Mockito로 Repository를 Mock 처리하고 Service 계층의 비즈니스 로직을 단위 테스트로 검증할 수 있다.
- **설명**: Spring Boot 프로젝트에서 테스트는 JUnit5(테스트 프레임워크) + Mockito(가짜 객체 라이브러리) 조합이 표준이다.
  단위 테스트는 DB 없이 Service 로직만 검증한다.
  `spring-boot-starter-test` 의존성 하나에 JUnit5 + Mockito + AssertJ가 모두 포함된다.

  `UserService.getOne(id)` 메서드를 테스트하는 예를 보자.

  ```java
  @ExtendWith(MockitoExtension.class)   // Spring 컨텍스트 없이 Mockito만 사용
  class UserServiceTest {

      @Mock
      UserRepository userRepository;   // 가짜 Repository. 실제 DB에 접근하지 않는다

      @InjectMocks
      UserService userService;          // userRepository 가짜를 주입받은 실제 Service

      @Test
      void getOne_존재하는_사용자를_반환한다() {
          // given — 가짜 Repository의 동작을 지정한다
          User user = new User(1L, "alice");
          when(userRepository.findById(1L)).thenReturn(Optional.of(user));

          // when — Service 메서드를 실행한다
          UserResponse result = userService.getOne(1L);

          // then — 결과를 검증한다
          assertThat(result.name()).isEqualTo("alice");
      }

      @Test
      void getOne_없는_사용자는_예외를_던진다() {
          when(userRepository.findById(99L)).thenReturn(Optional.empty());

          assertThatThrownBy(() -> userService.getOne(99L))
              .isInstanceOf(UserNotFoundException.class);
      }
  }
  ```

  `@Mock`은 가짜 객체를 만들고, `@InjectMocks`는 그 가짜를 주입한 실제 객체를 만든다.
  `when(...).thenReturn(...)`으로 "이 입력이 들어오면 이 값을 돌려줘"라는 시나리오를 설정한다.
  given / when / then 구조로 테스트를 작성하면 의도가 명확해진다.
  이 섹션이 중요한 이유는 DB 없이 빠르게 비즈니스 로직 버그를 잡을 수 있어야 CI(지속적 통합) 파이프라인 속도를 유지할 수 있기 때문이다.
- **핵심 키워드**: JUnit5, Mockito, @Mock, @InjectMocks, 단위 테스트, 가짜 객체(Mock)
- **시각화 연결**: `chapter-06-04-unit-test.html` — @Mock/@InjectMocks · given/when/then · 예외 테스트
- **다음 섹션**: VII-1-1

---

## Part VII. 배포·로깅·모니터링

> 개발이 끝난 Spring Boot 애플리케이션을 실제 서버에 올리고, 운영 중 문제를 빠르게 파악하는 방법을 익힌다.

---

### Chapter VII-1. 패키징과 배포

#### VII-1-1. Executable JAR 생성과 실행

- **난이도**: ★★★
- **선수 지식**: III-2-2
- **학습 목표**: 이 섹션을 마치면 `./gradlew bootJar`로 실행 가능한 JAR를 만들고 `java -jar`로 서버를 시작할 수 있다.
- **설명**: Spring Boot의 큰 장점은 모든 의존성과 내장 Tomcat이 포함된 단일 JAR 파일로 패키징된다는 점이다.
  별도의 WAS(웹 애플리케이션 서버)를 설치할 필요 없이 JAR 하나로 서버를 띄울 수 있다.

  빌드와 실행 순서는 다음과 같다.

  ```bash
  # 1. JAR 빌드 — build/libs/myapp-0.0.1-SNAPSHOT.jar 파일이 생긴다
  ./gradlew bootJar

  # 2. 개발 환경에서 실행
  java -jar build/libs/myapp-0.0.1-SNAPSHOT.jar

  # 3. 운영 환경에서 실행 — prod 프로파일 적용
  java -jar myapp.jar --spring.profiles.active=prod

  # 또는 환경변수로 주입 (Docker/K8s 환경에서 더 흔한 방식)
  SPRING_PROFILES_ACTIVE=prod java -jar myapp.jar
  ```

  Spring Profiles(프로파일)는 환경에 따라 다른 설정 파일을 사용하는 기능이다.
  `application-dev.properties`는 로컬 DB를, `application-prod.properties`는 운영 DB를 가리키게 설정한다.
  프로파일을 전환하는 것만으로 코드 수정 없이 환경을 바꿀 수 있다.
  DB 비밀번호처럼 민감한 값은 properties 파일에 하드코딩하지 않고 환경변수로 주입하는 것이 보안 관례다.

  ```properties
  # application-prod.properties
  spring.datasource.url=${DB_URL}
  spring.datasource.password=${DB_PASSWORD}
  ```

  이 섹션이 중요한 이유는 JAR 빌드와 프로파일 분리가 배포 자동화(CI/CD)의 출발점이기 때문이다.
- **핵심 키워드**: Executable JAR, bootJar, java -jar, Spring Profiles, 환경변수
- **시각화 연결**: `chapter-07-01-executable-jar.html` — bootJar → java -jar → Profiles
- **다음 섹션**: VII-1-2

#### VII-1-2. Docker 컨테이너로 배포하기

- **난이도**: ★★★
- **선수 지식**: VII-1-1
- **학습 목표**: 이 섹션을 마치면 Spring Boot 앱용 Dockerfile을 작성하고 컨테이너 이미지를 빌드해 실행할 수 있다.
- **설명**: 가장 단순한 Spring Boot Dockerfile은 JRE 이미지 위에 JAR를 복사하고 실행하는 세 줄로 이뤄진다.

  ```dockerfile
  # 단순 버전 — 빠르게 시작할 때
  FROM eclipse-temurin:17-jre
  COPY build/libs/myapp.jar /app.jar
  ENTRYPOINT ["java", "-jar", "/app.jar"]
  ```

  `eclipse-temurin`은 OpenJDK의 공식 Docker 배포판이다.
  JRE(Java Runtime Environment — 실행 전용)를 사용하면 JDK(개발 도구 포함)보다 이미지 크기가 작아진다.

  실제 운영에서는 멀티스테이지 빌드(Multi-stage Build)를 사용한다.
  빌드 도구(Gradle)가 포함된 빌더 이미지와 실행만 하는 런타임 이미지를 분리해 최종 이미지 크기를 줄인다.

  ```dockerfile
  # 멀티스테이지 빌드 — 운영 권장
  FROM eclipse-temurin:17-jdk AS builder
  WORKDIR /workspace
  COPY . .
  RUN ./gradlew bootJar -x test

  FROM eclipse-temurin:17-jre
  WORKDIR /app
  COPY --from=builder /workspace/build/libs/*.jar app.jar
  # 루트 유저 대신 별도 사용자로 실행 — 보안 관례
  RUN useradd -m appuser
  USER appuser
  ENTRYPOINT ["java", "-jar", "app.jar"]
  ```

  `docker build -t myapp .` 으로 이미지를 빌드하고, `docker run -p 8080:8080 myapp`으로 컨테이너를 실행한다.
  환경변수는 `-e SPRING_PROFILES_ACTIVE=prod` 옵션으로 주입한다.
  이 섹션이 중요한 이유는 Docker 이미지 하나로 어떤 서버에서든 동일한 환경을 재현할 수 있어야 "내 컴퓨터에서는 됐는데" 문제가 사라지기 때문이다.
- **핵심 키워드**: Dockerfile, eclipse-temurin, COPY, ENTRYPOINT, 멀티스테이지 빌드
- **시각화 연결**: `chapter-07-02-docker.html` — 단순/멀티스테이지 Dockerfile · 보안 관례
- **다음 섹션**: VII-2-1

---

### Chapter VII-2. 로깅과 예외 처리

#### VII-2-1. SLF4J와 Logback 설정

- **난이도**: ★★★
- **선수 지식**: VI-2-2
- **학습 목표**: 이 섹션을 마치면 SLF4J 로거로 로그를 남기고, application.properties에서 로그 레벨을 조정할 수 있다.
- **설명**: Spring Boot는 기본으로 SLF4J(로깅 API 추상화 계층) + Logback(실제 로그를 파일/콘솔에 쓰는 구현체) 조합을 사용한다.
  별도 의존성 추가 없이 `spring-boot-starter`에 포함된다.

  코드에서 로거를 사용하는 두 가지 방법이 있다.

  ```java
  // 방법 1: 직접 선언 (Lombok 없이)
  @Service
  public class UserService {
      private static final Logger log = LoggerFactory.getLogger(UserService.class);

      public UserResponse getOne(Long id) {
          log.debug("사용자 조회 시작: id={}", id);   // 개발 환경에서만 출력
          User user = userRepository.findById(id)
              .orElseThrow(() -> {
                  log.warn("사용자 없음: id={}", id);  // 경고 — 추적 필요한 이상 상황
                  return new UserNotFoundException(id);
              });
          log.info("사용자 조회 완료: name={}", user.getName());
          return UserResponse.from(user);
      }
  }

  // 방법 2: @Slf4j 사용 (Lombok 필요 — 권장)
  // Logger 선언 없이 log 필드를 바로 사용할 수 있다
  @Slf4j
  @Service
  public class UserService {
      public UserResponse getOne(Long id) {
          log.info("사용자 조회: id={}", id);  // @Slf4j가 log 필드를 자동 생성
          return userRepository.findById(id)
              .map(UserResponse::from)
              .orElseThrow(() -> new UserNotFoundException(id));
      }
  }
  ```

  로그 레벨은 `TRACE → DEBUG → INFO → WARN → ERROR` 순서다.
  설정한 레벨 이상만 출력된다. `application.properties`에서 패키지 단위로 설정한다.

  ```properties
  # 기본 레벨은 INFO
  logging.level.root=INFO
  # 내 코드는 DEBUG로 상세히 보기
  logging.level.com.example.myapp=DEBUG
  ```

  운영 환경에서는 `INFO` 또는 `WARN`으로 설정하고 개발 환경에서만 `DEBUG`를 쓰는 것이 관례다.
  로그 메시지에 `{}` 플레이스홀더를 사용하면 문자열 연결 비용 없이 변수를 안전하게 출력할 수 있다.
  파일 기반으로 로그 포맷, 롤링 정책 등을 세밀하게 제어하려면 `src/main/resources`에 `logback-spring.xml`을 추가하면 된다.
  이 섹션이 중요한 이유는 운영 중 장애가 발생했을 때 로그가 없으면 원인을 추적할 방법이 없기 때문이다.
- **핵심 키워드**: SLF4J, Logback, Logger, @Slf4j, 로그 레벨, logback-spring.xml
- **시각화 연결**: `chapter-07-03-logging.html` — SLF4J/Logback · 로그 레벨 · @Slf4j · 설정
- **다음 섹션**: VII-3-1

---

### Chapter VII-3. Actuator와 모니터링

#### VII-3-1. Spring Boot Actuator

- **난이도**: ★★★
- **선수 지식**: VII-2-1
- **학습 목표**: 이 섹션을 마치면 Actuator 엔드포인트(/health, /metrics, /info)를 활성화하고 애플리케이션 상태를 외부에서 확인할 수 있다.
- **설명**: Spring Boot Actuator는 운영 중인 애플리케이션의 상태를 HTTP로 조회하는 기능을 제공한다.
  `spring-boot-starter-actuator` 의존성 하나를 추가하면 `/actuator/*` 엔드포인트가 자동으로 생긴다.

  ```groovy
  // build.gradle
  implementation 'org.springframework.boot:spring-boot-starter-actuator'
  ```

  주요 엔드포인트와 역할은 다음과 같다.

  | 엔드포인트 | 역할 |
  |:--|:--|
  | `/actuator/health` | 서버 생존 여부 확인. UP / DOWN 반환 |
  | `/actuator/info` | 앱 버전, 빌드 정보 등 커스텀 메타 데이터 |
  | `/actuator/metrics` | JVM 메모리, HTTP 요청 수, DB 커넥션 수 등 |
  | `/actuator/loggers` | 실행 중 로그 레벨을 동적으로 변경 |

  기본으로 `/health`와 `/info`만 노출된다. 더 많은 엔드포인트를 열려면 properties에 명시한다.

  ```properties
  # 모든 엔드포인트 노출 (운영에서는 필요한 것만 선택 노출)
  management.endpoints.web.exposure.include=health,info,metrics
  # /health 상세 정보 표시 (DB, Redis 연결 상태 포함)
  management.endpoint.health.show-details=always
  ```

  `/actuator/health`는 쿠버네티스(Kubernetes) Liveness/Readiness 프로브에 그대로 연결할 수 있다.
  Prometheus(메트릭 수집 도구) 연동을 원하면 `micrometer-registry-prometheus` 의존성을 추가한다.
  그러면 `/actuator/prometheus` 엔드포인트가 생기고 Grafana 대시보드로 시각화할 수 있다.
  Actuator 엔드포인트는 내부 망에서만 접근 가능하도록 포트를 분리하는 것이 보안 관례다.
  이 섹션이 중요한 이유는 서비스 장애를 사람이 먼저 알아채기 전에 모니터링 시스템이 먼저 감지해야 빠른 대응이 가능하기 때문이다.
- **핵심 키워드**: Actuator, /health, /metrics, Prometheus, Grafana, 헬스체크
- **시각화 연결**: `chapter-07-04-actuator.html` — 엔드포인트 · 노출 설정 · Prometheus+Grafana
- **다음 섹션**: VIII-1-1

---

## Part VIII. 실무 설정과 운영

> 서비스를 실제로 운영하려면 코드 변경 없이 설정을 바꿀 수 있어야 하고, 문제를 코드 배포 전에 시스템이 먼저 감지해야 한다. Part VIII은 Spring Boot를 프로덕션에서 다루는 세 가지 핵심 능력인 외부 설정 관리, 자동 구성 원리 이해, 메트릭 기반 모니터링을 다룬다.

---

### Chapter VIII-1. 외부 설정 마스터

#### VIII-1-1. application.properties vs application.yml

- **난이도**: ★★★
- **선수 지식**: VII-3-1
- **학습 목표**: 이 섹션을 마치면 `.properties`와 `.yml` 형식의 차이를 설명하고, 팀 컨벤션에 맞게 설정 파일을 선택·작성할 수 있다.
- **설명**: Spring Boot는 `src/main/resources`에 위치한 `application.properties` 또는 `application.yml` 파일을 자동으로 읽어 설정을 적용한다.
  두 형식은 동일한 설정을 표현하지만 구조가 다르다.

  ```properties
  # application.properties — 평면(flat) 구조
  server.port=8080
  spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
  spring.datasource.username=myuser
  spring.datasource.password=secret
  ```

  ```yaml
  # application.yml — 계층(hierarchical) 구조
  server:
    port: 8080
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/mydb
      username: myuser
      password: secret
  ```

  변환 규칙은 간단하다. `.`으로 이어진 키를 들여쓰기로 풀면 YAML이 된다.
  YAML은 중복 접두사를 한 번만 쓰므로 설정이 많아질수록 가독성이 좋다.
  반면 `.properties`는 단순하고 오래된 IDE에서도 잘 지원된다.
  실무에서는 신규 프로젝트는 대부분 YAML을 선택한다.
  단, 한 프로젝트에서 두 형식을 동시에 사용하면 혼란이 생기므로 하나로 통일한다.
  YAML의 주의점: 들여쓰기에 반드시 공백(space)을 쓰고 탭(tab)은 절대 사용하지 않는다.
  이 섹션이 중요한 이유는 설정 파일 형식을 잘못 쓰면 애플리케이션이 시작조차 안 되는 파싱 오류가 발생하기 때문이다.
- **핵심 키워드**: application.properties, application.yml, 평면 구조, 계층 구조, 설정 파일
- **시각화 연결**: `chapter-08-01-properties-yml.html` — properties·yml 비교 · 변환 규칙 · 선택 기준
- **다음 섹션**: VIII-1-2

---

#### VIII-1-2. @Value로 설정 주입

- **난이도**: ★★★
- **선수 지식**: VIII-1-1
- **학습 목표**: 이 섹션을 마치면 `@Value`로 설정 값을 필드에 주입하고, SpEL(스프링 표현 언어) 문법과 기본값 지정 방법을 활용할 수 있다.
- **설명**: `@Value`는 설정 파일의 값을 Spring Bean의 필드에 직접 주입하는 가장 단순한 방법이다.

  ```yaml
  # application.yml
  app:
    name: MyService
    max-retry: 3
  ```

  ```java
  @Component
  public class AppConfig {

      // 기본 사용
      @Value("${app.name}")
      private String appName;

      // 기본값 지정 — 키가 없으면 "DefaultService" 사용
      @Value("${app.description:DefaultService}")
      private String description;

      // 숫자 타입으로 바로 주입
      @Value("${app.max-retry:5}")
      private int maxRetry;

      // SpEL(Spring Expression Language) — 시스템 환경변수 읽기
      @Value("#{systemEnvironment['HOME']}")
      private String homeDir;
  }
  ```

  주의사항이 있다. `@Value`는 `static` 필드에 주입되지 않는다. 반드시 인스턴스 필드에 써야 한다.
  또한 `@Configuration` 또는 `@Component`로 관리되는 Bean에서만 동작한다.
  일반 POJO(스프링이 관리하지 않는 객체)에 선언하면 값이 null로 남는다.
  설정 키가 많아지면 `@Value`를 남발하게 되는데, 이때는 `@ConfigurationProperties`로 교체하는 것이 좋다.
  이 섹션이 중요한 이유는 설정 값이 하드코딩되면 환경마다 코드를 바꿔야 하고, `@Value`는 이를 가장 빠르게 해결하는 도구이기 때문이다.
- **핵심 키워드**: @Value, SpEL(스프링 표현 언어), 기본값, 설정 주입, 정적 필드 주의
- **시각화 연결**: `chapter-08-02-value.html` — @Value 사용법 · SpEL · 주의사항
- **다음 섹션**: VIII-1-3

---

#### VIII-1-3. @ConfigurationProperties — 타입 안전 설정

- **난이도**: ★★★
- **선수 지식**: VIII-1-2
- **학습 목표**: 이 섹션을 마치면 `@ConfigurationProperties`로 관련 설정을 하나의 클래스에 묶고, `@Validated`로 설정 값의 유효성을 검증할 수 있다.
- **설명**: `@Value`는 설정이 몇 개일 때는 편리하지만, 관련 설정이 10개 이상 쌓이면 관리가 어려워진다.
  `@ConfigurationProperties`는 설정 그룹을 전용 클래스(또는 record)에 바인딩해 타입 안전하게 관리한다.

  ```yaml
  # application.yml
  app:
    datasource:
      url: jdbc:postgresql://localhost:5432/mydb
      username: myuser
      max-pool-size: 10
  ```

  ```java
  // Spring Boot 3.x — record 사용 권장
  @ConfigurationProperties(prefix = "app.datasource")
  @Validated
  public record DataSourceProperties(
      @NotBlank String url,
      @NotBlank String username,
      @Min(1) @Max(100) int maxPoolSize
  ) {}
  ```

  ```java
  // build.gradle — 메타데이터 자동 생성 (IDE 자동완성 지원)
  annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
  ```

  ```java
  // @ConfigurationPropertiesScan으로 자동 등록
  @SpringBootApplication
  @ConfigurationPropertiesScan
  public class MyApp { ... }
  ```

  `@Value` vs `@ConfigurationProperties` 비교:

  | 항목 | @Value | @ConfigurationProperties |
  |:--|:--|:--|
  | 설정 개수 | 소수 (1~3개) | 다수 (4개 이상) |
  | 타입 변환 | 수동 | 자동 바인딩 |
  | 유효성 검증 | 불가 | @Validated 적용 가능 |
  | IDE 자동완성 | 없음 | 메타데이터 생성 시 지원 |

  이 섹션이 중요한 이유는 잘못된 설정 값(예: maxPoolSize=0)이 런타임이 아닌 시작 시점에 즉시 오류로 잡혀 장애를 사전에 막을 수 있기 때문이다.
- **핵심 키워드**: @ConfigurationProperties, prefix, record, @Validated, 타입 바인딩, configuration-processor
- **시각화 연결**: `chapter-08-03-config-properties.html` — 바인딩 구조 · @Validated · @Value 비교
- **다음 섹션**: VIII-1-4

---

#### VIII-1-4. 프로파일과 설정 우선순위

- **난이도**: ★★★
- **선수 지식**: VIII-1-1
- **학습 목표**: 이 섹션을 마치면 dev/prod 환경별 설정 파일을 분리하고, Spring Boot 설정 우선순위 규칙을 이해해 "왜 이 값이 적용됐지?" 문제를 스스로 디버깅할 수 있다.
- **설명**: 환경마다 설정이 다른 것은 당연하다. 로컬 개발용 DB와 운영 DB 주소는 달라야 한다.
  Spring Boot는 프로파일(profile)로 환경별 설정 파일을 분리한다.

  ```
  src/main/resources/
  ├── application.yml          # 공통 설정 (모든 환경에서 로드)
  ├── application-dev.yml      # 개발 환경 추가 설정
  └── application-prod.yml     # 운영 환경 추가 설정
  ```

  활성 프로파일 지정 방법 세 가지:

  ```bash
  # 1. 커맨드라인 인수 — 가장 높은 우선순위
  java -jar myapp.jar --spring.profiles.active=prod

  # 2. 환경변수
  export SPRING_PROFILES_ACTIVE=prod
  java -jar myapp.jar

  # 3. application.yml (기본 fallback)
  # spring.profiles.active=dev
  ```

  Spring Boot 설정 우선순위 (높을수록 나중에 덮어씀):

  | 우선순위 | 출처 |
  |:--|:--|
  | 1순위 (최고) | 커맨드라인 인수 (`--server.port=9090`) |
  | 2순위 | 환경변수 (`SERVER_PORT=9090`) |
  | 3순위 | 프로파일 설정 파일 (`application-prod.yml`) |
  | 4순위 (최저) | 기본 설정 파일 (`application.yml`) |

  실무 패턴: 민감한 정보(DB 비밀번호, API Key)는 환경변수나 AWS Secrets Manager로 관리하고 설정 파일에 평문으로 절대 커밋하지 않는다.
  이 섹션이 중요한 이유는 우선순위를 모르면 설정을 바꿨는데도 적용이 안 되는 상황에서 원인을 찾지 못하기 때문이다.
- **핵심 키워드**: profile, spring.profiles.active, 설정 우선순위, application-{profile}.yml, 환경변수
- **시각화 연결**: `chapter-08-04-profiles.html` — 프로파일 분리 · 우선순위 계층 · 실무 패턴
- **다음 섹션**: VIII-2-1

---

### Chapter VIII-2. 자동 구성(Auto Configuration)

#### VIII-2-1. Auto Configuration 동작 원리

- **난이도**: ★★★
- **선수 지식**: VIII-1-4
- **학습 목표**: 이 섹션을 마치면 `@SpringBootApplication` 안에서 자동 구성이 어떻게 시작되는지 설명하고, `META-INF/spring/` 파일을 직접 열어 어떤 설정이 자동 등록되는지 확인할 수 있다.
- **설명**: Spring Boot가 "설정이 거의 필요 없다"고 하는 핵심 이유가 바로 자동 구성(Auto Configuration)이다.

  `@SpringBootApplication`은 세 어노테이션의 합성이다:

  ```java
  // 실제 소스 코드 (개념 설명용 단순화)
  @SpringBootConfiguration   // = @Configuration
  @EnableAutoConfiguration   // 자동 구성 활성화
  @ComponentScan             // 컴포넌트 스캔
  public @interface SpringBootApplication { ... }
  ```

  `@EnableAutoConfiguration`이 동작하면 Spring Boot는 클래스패스의 모든 JAR에서 아래 파일을 탐색한다:

  ```
  META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
  ```

  이 파일 안에는 수백 개의 자동 구성 클래스 이름이 나열되어 있다.
  각 클래스는 특정 조건이 맞을 때만 Bean을 등록한다 (조건은 다음 섹션에서 다룬다).

  예시: H2 드라이버가 클래스패스에 있으면 `DataSourceAutoConfiguration`이 자동으로 인메모리 DB를 생성한다.
  `spring-boot-autoconfigure` JAR를 IDE에서 열면 실제 파일을 바로 확인할 수 있다.
  Spring Boot 2.x에서 사용하던 `META-INF/spring.factories`는 3.x에서 레거시로 분류되었다.
  이 섹션이 중요한 이유는 자동 구성의 원리를 알아야 "왜 내가 등록 안 했는데 Bean이 생겼지?" 혹은 "왜 Bean이 안 생기지?"를 해결할 수 있기 때문이다.
- **핵심 키워드**: @SpringBootApplication, @EnableAutoConfiguration, AutoConfiguration.imports, 자동 구성, spring.factories(레거시)
- **시각화 연결**: `chapter-08-05-auto-config.html` — @SpringBootApplication 분해 · imports 파일 · 동작 흐름
- **다음 섹션**: VIII-2-2

---

#### VIII-2-2. @Conditional과 조건부 빈 등록

- **난이도**: ★★★
- **선수 지식**: VIII-2-1
- **학습 목표**: 이 섹션을 마치면 `@ConditionalOnClass`, `@ConditionalOnProperty`, `@ConditionalOnMissingBean`의 차이를 설명하고, H2를 추가하면 DB가 자동 연결되는 이유를 정확히 설명할 수 있다.
- **설명**: 자동 구성 클래스는 조건부로 Bean을 등록한다. 조건이 맞지 않으면 Bean은 생성되지 않는다.
  Spring Boot는 이를 위해 `@Conditional` 계열 어노테이션을 제공한다.

  ```java
  // Spring Boot 내부 DataSourceAutoConfiguration (개념 설명용 단순화)
  @Configuration
  @ConditionalOnClass(DataSource.class)          // DataSource 클래스가 클래스패스에 있어야 함
  @ConditionalOnMissingBean(DataSource.class)    // 사용자가 직접 DataSource를 등록하지 않았어야 함
  public class DataSourceAutoConfiguration {

      @Bean
      public DataSource dataSource() {
          // H2 드라이버가 있으면 인메모리 DB 자동 생성
          return new EmbeddedDatabaseBuilder()
              .setType(EmbeddedDatabaseType.H2)
              .build();
      }
  }
  ```

  ```java
  // @ConditionalOnProperty — 설정 값 기반 조건
  @Bean
  @ConditionalOnProperty(prefix = "app", name = "cache.enabled", havingValue = "true")
  public CacheManager cacheManager() {
      return new ConcurrentMapCacheManager();
  }
  ```

  H2 의존성만 추가해도 DB가 연결되는 이유: `H2 드라이버 추가` → `DataSource 클래스 클래스패스 진입` → `@ConditionalOnClass 조건 충족` → `DataSourceAutoConfiguration Bean 등록`.
  `@ConditionalOnMissingBean` 덕분에 직접 DataSource를 등록하면 자동 구성은 물러나 충돌하지 않는다.
  이 섹션이 중요한 이유는 자동 구성과 직접 등록이 충돌하는 문제의 원인이 거의 `@Conditional` 조건에서 발생하기 때문이다.
- **핵심 키워드**: @ConditionalOnClass, @ConditionalOnProperty, @ConditionalOnMissingBean, 조건부 Bean 등록
- **시각화 연결**: `chapter-08-06-conditional.html` — @Conditional 계열 · H2 자동 연결 흐름 · 우선순위
- **다음 섹션**: VIII-2-3

---

#### VIII-2-3. 자동 구성 디버깅 — --debug 플래그

- **난이도**: ★★★
- **선수 지식**: VIII-2-2
- **학습 목표**: 이 섹션을 마치면 `--debug` 플래그로 `ConditionEvaluationReport`를 출력하고, Positive/Negative matches를 읽어 특정 Bean이 왜 등록됐는지 또는 안 됐는지 확인할 수 있다.
- **설명**: "Bean이 왜 등록 안 됐지?"는 Spring Boot 개발에서 자주 만나는 의문이다.
  `--debug` 플래그 하나로 자동 구성 결과 보고서를 콘솔에 출력할 수 있다.

  활성화 방법 두 가지:

  ```bash
  # 방법 1. 커맨드라인
  java -jar myapp.jar --debug

  # 방법 2. application.yml
  # debug: true
  ```

  실행하면 콘솔에 `ConditionEvaluationReport`가 출력된다:

  ```
  ============================
  CONDITIONS EVALUATION REPORT
  ============================

  Positive matches:     <-- 조건이 충족되어 등록된 Bean
  -----------------
     DataSourceAutoConfiguration matched:
        - @ConditionalOnClass found required class 'javax.sql.DataSource' (OnClassCondition)

  Negative matches:     <-- 조건 불충족으로 미등록된 Bean + 이유
  -----------------
     ActiveMQAutoConfiguration:
        Did not match:
           - @ConditionalOnClass did not find required class 'javax.jms.ConnectionFactory' (OnClassCondition)
  ```

  읽는 법: Positive matches에서 원하는 자동 구성이 목록에 있는지 확인한다.
  없다면 Negative matches에서 해당 클래스를 찾아 "Did not match" 이유를 확인한다.
  대부분 클래스패스에 의존성이 없거나 `@ConditionalOnMissingBean` 조건에서 사용자 Bean이 이미 존재하기 때문이다.
  운영 환경에서는 `debug: true`를 반드시 제거한다. 민감한 구성 정보가 로그에 노출된다.
  이 섹션이 중요한 이유는 자동 구성 문제를 추측이 아닌 실제 보고서를 읽어서 해결하는 능력이 트러블슈팅 시간을 크게 줄여주기 때문이다.
- **핵심 키워드**: --debug, ConditionEvaluationReport, Positive matches, Negative matches, 자동 구성 디버깅
- **시각화 연결**: `chapter-08-07-debug.html` — --debug 출력 · 보고서 읽기 · 트러블슈팅 패턴
- **다음 섹션**: VIII-3-1

---

### Chapter VIII-3. 모니터링 실무

#### VIII-3-1. Micrometer와 메트릭 체계

- **난이도**: ★★★
- **선수 지식**: VII-3-1
- **학습 목표**: 이 섹션을 마치면 Micrometer의 메트릭 구성 요소(이름·태그·값)를 설명하고, Spring Boot Actuator가 자동 등록하는 기본 메트릭의 종류를 나열할 수 있다.
- **설명**: Micrometer는 메트릭(숫자로 표현된 시스템 상태)을 수집하는 라이브러리다.
  SLF4J가 로깅 프레임워크를 추상화하듯, Micrometer는 Prometheus·Datadog·CloudWatch 등 다양한 모니터링 시스템을 단일 API로 추상화한다.

  메트릭의 세 구성 요소:

  | 구성 요소 | 설명 | 예시 |
  |:--|:--|:--|
  | 이름(name) | 메트릭의 식별자 | `http.server.requests` |
  | 태그(tags) | 메트릭을 구분하는 key=value 쌍 | `method=GET, uri=/api/users, status=200` |
  | 값(value) | 실제 측정 값 | `0.023` (초) |

  Micrometer가 제공하는 주요 측정 도구:

  ```java
  // Counter — 누적 횟수 (주문 수, 로그인 횟수)
  // Timer   — 시간 측정 (API 응답 시간)
  // Gauge   — 현재 상태 값 (큐 크기, 현재 접속자 수)
  ```

  `spring-boot-starter-actuator`를 추가하면 `MeterRegistry`(메트릭 등록 중앙 레지스트리)가 자동 구성되고
  JVM 메모리(`jvm.memory.used`), HTTP 요청(`http.server.requests`), HikariCP 커넥션 풀(`hikaricp.connections`) 등 수십 개 메트릭이 자동 등록된다.
  `/actuator/metrics/{이름}`으로 각 메트릭 값을 즉시 확인할 수 있다.
  이 섹션이 중요한 이유는 메트릭 개념을 모르면 Grafana 대시보드의 숫자가 무엇을 의미하는지 알 수 없어 모니터링이 형식에 그치기 때문이다.
- **핵심 키워드**: Micrometer, MeterRegistry, Counter, Timer, Gauge, 메트릭 이름·태그·값
- **시각화 연결**: `chapter-08-08-micrometer.html` — 메트릭 구조 · MeterRegistry · 자동 메트릭 목록
- **다음 섹션**: VIII-3-2

---

#### VIII-3-2. Prometheus 설치와 연동

- **난이도**: ★★★
- **선수 지식**: VIII-3-1
- **학습 목표**: 이 섹션을 마치면 `micrometer-registry-prometheus` 의존성을 추가해 `/actuator/prometheus` 엔드포인트를 활성화하고, Prometheus가 Spring Boot 메트릭을 수집하도록 `prometheus.yml`을 설정할 수 있다.
- **설명**: Prometheus(프로메테우스)는 메트릭을 주기적으로 pull(가져오기)해서 시계열 데이터베이스에 저장하는 모니터링 시스템이다.

  Spring Boot 측 설정:

  ```groovy
  // build.gradle
  implementation 'org.springframework.boot:spring-boot-starter-actuator'
  implementation 'io.micrometer:micrometer-registry-prometheus'
  ```

  ```yaml
  # application.yml
  management:
    endpoints:
      web:
        exposure:
          include: health,info,prometheus
    endpoint:
      prometheus:
        enabled: true
  ```

  의존성을 추가하면 `/actuator/prometheus` 엔드포인트가 자동 생성된다.
  브라우저에서 열면 Prometheus 텍스트 형식 메트릭이 출력된다.

  Prometheus 설정 파일:

  ```yaml
  # prometheus.yml
  global:
    scrape_interval: 15s   # 15초마다 수집

  scrape_configs:
    - job_name: 'spring-boot-app'
      static_configs:
        - targets: ['localhost:8080']   # Spring Boot 서버 주소
      metrics_path: '/actuator/prometheus'
  ```

  Docker로 Prometheus 실행:

  ```bash
  docker run -d \
    -p 9090:9090 \
    -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
  ```

  `http://localhost:9090`에서 PromQL(프로메테우스 쿼리 언어)로 메트릭을 조회할 수 있다.
  예: `http_server_requests_seconds_count{uri="/api/users"}`
  이 섹션이 중요한 이유는 애플리케이션 로그만으로는 성능 추이를 시각화할 수 없고, Prometheus가 있어야 시간에 따른 변화를 추적할 수 있기 때문이다.
- **핵심 키워드**: Prometheus, micrometer-registry-prometheus, /actuator/prometheus, scrape, prometheus.yml, PromQL
- **시각화 연결**: `chapter-08-09-prometheus.html` — pull 방식 · scrape 설정 · PromQL 예시
- **다음 섹션**: VIII-3-3

---

#### VIII-3-3. Grafana 대시보드 구성

- **난이도**: ★★★
- **선수 지식**: VIII-3-2
- **학습 목표**: 이 섹션을 마치면 Docker로 Grafana를 실행하고 Prometheus를 Data Source로 연결한 뒤, 공유 대시보드를 import해서 JVM·HTTP 메트릭을 시각화할 수 있다.
- **설명**: Grafana(그라파나)는 Prometheus가 수집한 메트릭을 차트와 패널로 시각화하는 대시보드 도구다.

  Docker로 Grafana 실행:

  ```bash
  docker run -d \
    -p 3000:3000 \
    --name grafana \
    grafana/grafana
  ```

  `http://localhost:3000`에 접속하면 로그인 화면이 나온다. 초기 계정은 `admin / admin`이다.

  Data Source 추가 절차:
  1. 좌측 메뉴 → Connections → Data Sources → Add new data source
  2. Prometheus 선택
  3. Connection URL: `http://localhost:9090` 입력
  4. Save & Test 클릭 — "Data source is working" 메시지 확인

  공유 대시보드 import:

  ```
  좌측 메뉴 → Dashboards → Import
  → Dashboard ID 입력: 4701 (JVM Micrometer 공식 대시보드)
  → Prometheus 선택 → Import
  ```

  대시보드 4701은 JVM 힙 메모리, GC 횟수, CPU 사용률, HTTP 요청 수를 즉시 시각화해준다.
  커스텀 패널 추가 시 PromQL 쿼리를 직접 작성한다.
  예: 에러율 패널 → `rate(http_server_requests_seconds_count{status=~"5.."}[1m])`
  이 섹션이 중요한 이유는 숫자 나열만으로는 이상 징후를 파악하기 어렵고, 시각화된 대시보드가 있어야 장애 전 경보를 빠르게 인지할 수 있기 때문이다.
- **핵심 키워드**: Grafana, Data Source, Dashboard, Import, 대시보드 ID 4701, 패널, PromQL
- **시각화 연결**: `chapter-08-10-grafana.html` — Data Source 설정 · 대시보드 import · 커스텀 패널
- **다음 섹션**: VIII-3-4

---

#### VIII-3-4. 커스텀 메트릭 — @Counted, @Timed, Gauge

- **난이도**: ★★★
- **선수 지식**: VIII-3-1
- **학습 목표**: 이 섹션을 마치면 `@Counted`, `@Timed` 어노테이션으로 비즈니스 메트릭을 추가하고, `MeterRegistry.gauge()`로 현재 상태 값을 실시간 추적할 수 있다.
- **설명**: Spring Boot 자동 메트릭은 JVM·HTTP 수준이다. 비즈니스 수준 메트릭(주문 수, 결제 성공률, 큐 크기)은 직접 등록해야 한다.

  어노테이션 방식 — AOP로 메서드에 자동 적용:

  ```java
  // build.gradle — AOP 의존성 필요
  implementation 'org.springframework.boot:spring-boot-starter-aop'
  implementation 'io.micrometer:micrometer-core'
  ```

  ```java
  @Service
  public class OrderService {

      // 메서드 호출 횟수를 카운트 — 태그로 결과 구분
      @Counted(value = "order.placed", description = "주문 생성 횟수")
      public Order placeOrder(OrderRequest request) { ... }

      // 메서드 실행 시간을 측정
      @Timed(value = "order.processing", description = "주문 처리 소요 시간",
             percentiles = {0.5, 0.95, 0.99})
      public void processOrder(Long orderId) { ... }
  }
  ```

  Gauge — 현재 값을 실시간 반영:

  ```java
  @Component
  public class OrderQueueMetrics {

      private final Queue<Order> orderQueue;

      public OrderQueueMetrics(MeterRegistry registry, Queue<Order> orderQueue) {
          this.orderQueue = orderQueue;
          // 메트릭 이름 "order.queue.size", 실시간 Queue::size 반환
          Gauge.builder("order.queue.size", orderQueue, Queue::size)
               .description("현재 처리 대기 중인 주문 수")
               .register(registry);
      }
  }
  ```

  Grafana 패널에서 `order_placed_total`, `order_processing_seconds_p95`, `order_queue_size`로 즉시 조회된다.
  실무 팁: 메트릭 이름은 `도메인.대상.측정항목` 패턴으로 통일하면 관리가 쉽다 (예: `payment.success.count`).
  이 섹션이 중요한 이유는 JVM 메트릭만으로는 "주문이 왜 느려졌지?"를 알 수 없고, 비즈니스 메트릭이 있어야 코드 변경과 성능 변화의 상관관계를 직접 확인할 수 있기 때문이다.
- **핵심 키워드**: @Counted, @Timed, Gauge, MeterRegistry, 커스텀 메트릭, 비즈니스 메트릭
- **시각화 연결**: `chapter-08-11-custom-metrics.html` — @Counted·@Timed AOP · Gauge 등록 · Grafana 쿼리
- **다음 섹션**: 부록 A

---

## 부록

### 부록 A. 핵심 용어집

| 용어 | 설명 |
|:--|:--|
| JVM | Java Virtual Machine. 바이트코드를 실행하는 가상 머신 |
| JDK | Java Development Kit. Java 개발에 필요한 도구 모음 |
| Bean | Spring이 관리하는 객체. @Component/@Service/@Repository 등으로 등록 |
| IoC | Inversion of Control. 제어의 역전. 객체 생성과 관리를 Spring이 담당 |
| DI | Dependency Injection. 의존성 주입. 필요한 객체를 외부에서 받아 씀 |
| AOP | Aspect-Oriented Programming. 횡단 관심사(로깅, 트랜잭션 등)를 분리해 관리 |
| ORM | Object-Relational Mapping. Java 객체와 DB 테이블을 자동으로 매핑 |
| JPA | Jakarta Persistence API. ORM 표준 인터페이스 |
| Hibernate | JPA의 가장 널리 쓰이는 구현체 |
| DispatcherServlet | Spring MVC의 Front Controller. 모든 HTTP 요청의 첫 관문 |
| HandlerMapping | URL 패턴과 Controller 메서드를 연결하는 역할 |
| @RestController | HTTP 요청을 받아 JSON을 응답하는 컨트롤러 클래스 표시 |
| @Service | 비즈니스 로직을 담당하는 클래스 표시 |
| @Repository | DB 접근을 담당하는 클래스 표시 |
| @Transactional | 트랜잭션 시작/커밋/롤백을 자동으로 처리하는 AOP 애노테이션 |
| DTO | Data Transfer Object. API 입출력 전용 클래스, Entity와 분리 |
| Spring Security | 인증(Authentication)과 인가(Authorization)를 담당하는 Spring 프로젝트 |
| Actuator | 운영 중인 앱 상태를 HTTP로 노출하는 Spring Boot 기능 |
| Gradle | Groovy/Kotlin DSL 기반 Java 빌드 도구 |
| Maven | XML(pom.xml) 기반 Java 빌드 도구 |
| Starter | 관련 의존성을 묶어놓은 Spring Boot 편의 의존성 패키지 |
| application.properties | 서버 포트, DB 접속 정보 등 설정을 담는 Spring Boot 기본 설정 파일 |
| @SpringBootApplication | 메인 클래스에 붙이는 진입점 애노테이션 (컴포넌트 스캔 + 자동설정 포함) |
| JpaRepository | Spring Data JPA가 제공하는 기본 CRUD 인터페이스 |
| Filter Chain | Spring Security의 보안 필터 묶음. DispatcherServlet 앞단에서 동작 |
| Jackson | Java 객체를 JSON으로 변환(직렬화)하고 역변환하는 라이브러리 |
| SLF4J | Simple Logging Facade for Java. 로깅 추상화 인터페이스 |
| Logback | SLF4J의 기본 구현체. Spring Boot 기본 로깅 라이브러리 |
| Mockito | 단위 테스트에서 가짜 객체(Mock)를 만드는 Java 라이브러리 |
| JUnit5 | Java 표준 테스트 프레임워크 |
| @OneToMany | JPA에서 1:N 관계를 표현하는 애노테이션 |

---

### 부록 B. 자주 묻는 질문 (FAQ)

**Q. Spring Framework와 Spring Boot의 차이는 무엇인가?**
A. Spring Framework는 DI 컨테이너, MVC, AOP 등 핵심 기능을 제공하는 기반 프레임워크다. Spring Boot는 Spring Framework 위에서 자동 설정, 내장 Tomcat, Starter 의존성을 더해 시작 편의성을 극대화한 확장판이다. 현재 신규 프로젝트는 거의 모두 Spring Boot로 시작한다.

**Q. @Autowired vs 생성자 주입, 어느 쪽을 써야 하나?**
A. 생성자 주입을 권장한다. 필드에 `@Autowired`를 붙이는 방식은 테스트가 어렵고 순환 의존성을 늦게 발견한다. 생성자 주입은 final 필드로 선언해 불변을 보장하고, 컴파일 시점에 의존성 누락을 잡는다. Lombok `@RequiredArgsConstructor`를 쓰면 생성자 코드를 자동 생성할 수 있다.

**Q. Entity를 직접 API 응답으로 반환하면 안 되나?**
A. 가능하지만 권장하지 않는다. Entity를 직접 반환하면 비밀번호 같은 민감 필드가 노출될 수 있고, DB 구조 변경이 API 계약에 바로 영향을 준다. DTO를 별도로 만들어 분리하는 것이 실무 표준이다.

**Q. JPA `findById`가 Optional을 반환하는 이유는?**
A. 데이터가 없을 때 null 대신 Optional을 반환해 NullPointerException을 예방한다. `orElseThrow()`로 데이터가 없으면 예외를 던지거나, `orElse(defaultValue)`로 기본값을 제공한다.

**Q. @Transactional을 왜 Service 계층에 붙이나?**
A. 트랜잭션 범위는 비즈니스 로직 단위가 되어야 한다. Controller는 HTTP 관심사를, Repository는 DB 쿼리만 담당하므로, 여러 Repository 호출을 하나의 트랜잭션으로 묶는 책임은 Service에 있다.

**Q. application.properties vs application.yml 어느 쪽이 좋나?**
A. 기능 차이는 없다. yml은 계층 구조를 들여쓰기로 표현해 properties 대비 간결하다. 팀 컨벤션을 따르되, 신규 프로젝트라면 yml을 많이 쓰는 추세다.

**Q. Spring Boot 3.x에서 Jakarta EE로 네임스페이스가 바뀐 이유는?**
A. Java EE가 Eclipse Foundation으로 이전되면서 Jakarta EE로 브랜드가 변경됐다. Spring Boot 3.x는 Jakarta EE 9+ 기준이므로 import 패키지가 `javax.*`에서 `jakarta.*`로 변경됐다. Spring Boot 2.x 코드를 3.x로 마이그레이션할 때 import 변경이 필요한 주된 이유다.

**Q. H2 인메모리 DB와 실제 DB를 어떻게 전환하나?**
A. application.properties에서 spring.datasource.url을 변경한다. 개발 시 H2, 운영 시 MySQL/PostgreSQL을 쓰는 패턴이 일반적이다. Spring Profiles(`application-dev.properties`, `application-prod.properties`)로 환경별 설정을 분리하면 코드 변경 없이 전환된다.

**Q. @RestController와 @Controller의 차이는?**
A. @Controller는 View(Thymeleaf 같은 템플릿)를 반환하는 전통적인 방식이다. @RestController는 @Controller + @ResponseBody를 합친 것으로, 메서드 반환값을 JSON으로 직렬화해 응답 Body에 직접 쓴다. REST API 서버를 만들 때는 @RestController를 쓴다.

**Q. Spring Boot Actuator 엔드포인트를 외부에 노출해도 되나?**
A. 기본적으로 /actuator/health만 외부에 노출하고, 나머지는 내부망 또는 인증이 필요한 경로로 제한한다. application.properties에서 `management.endpoints.web.exposure.include=health,info`처럼 노출 범위를 명시적으로 지정한다.

---

### 부록 C. 다음 공부 로드맵

이 커리큘럼을 마쳤다면 아래 순서로 학습을 이어간다.

1. **Spring Cloud** — 마이크로서비스 아키텍처 (Service Discovery, API Gateway, Config Server)
2. **Kafka** — 비동기 메시지 큐를 활용한 이벤트 드리븐 아키텍처
3. **Kubernetes** — Spring Boot 컨테이너 오케스트레이션
4. **Spring WebFlux** — 리액티브 프로그래밍으로 고성능 비동기 API
5. **Querydsl** — JPA의 동적 쿼리 한계를 극복하는 타입 안전 SQL DSL
6. **Redis** — 캐싱, 세션 저장, 분산 락 활용
7. **Clean Architecture / Hexagonal Architecture** — 도메인 중심 대규모 구조 설계

---

### 부록 D. 참고 자료

| # | 분류 | 제목 | URL |
|:--|:--|:--|:--|
| 1 | 공식 문서 | Spring Boot 공식 문서 | https://docs.spring.io/spring-boot/docs/current/reference/html/ |
| 2 | 공식 문서 | Spring Framework 공식 문서 | https://docs.spring.io/spring-framework/docs/current/reference/html/ |
| 3 | 공식 문서 | Spring Data JPA 공식 문서 | https://docs.spring.io/spring-data/jpa/docs/current/reference/html/ |
| 4 | 공식 도구 | Spring Initializr | https://start.spring.io |
| 5 | 공식 문서 | Spring Security 공식 문서 | https://docs.spring.io/spring-security/reference/ |
| 6 | 공식 문서 | Spring Boot Actuator | https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html |
| 7 | 한국어 | 스프링 입문 - 코드로 배우는 스프링 부트 (김영한) | https://www.inflearn.com/course/스프링-입문-스프링부트 |
| 8 | 한국어 | 스프링 핵심 원리 - 기본편 (김영한) | https://www.inflearn.com/course/스프링-핵심-원리-기본편 |
| 9 | 한국어 | 실전! 스프링 부트와 JPA 활용 (김영한) | https://www.inflearn.com/course/스프링부트-JPA-활용-1 |
| 10 | 한국어 | 자바 ORM 표준 JPA 프로그래밍 (김영한 저) | 교보문고/예스24 검색 |
| 11 | 영어 | Baeldung Spring Tutorials | https://www.baeldung.com/spring-boot |
| 12 | 영어 | TechEmpower Framework Benchmarks | https://www.techempower.com/benchmarks/ |
| 13 | 도구 | IntelliJ IDEA Community | https://www.jetbrains.com/idea/download/ |
| 14 | 도구 | Eclipse Temurin JDK 17 | https://adoptium.net/temurin/releases/?version=17 |
| 15 | 도구 | Postman — API 테스트 도구 | https://www.postman.com/ |
| 16 | 도구 | H2 Database 공식 | https://www.h2database.com/ |

> **[확인 필요]**: Baeldung과 Inflearn 강의 목록은 2026-04-19 기준 확인됨. 강의 URL은 변경될 수 있으므로 최신 링크를 직접 검색해 확인하길 권장한다.
