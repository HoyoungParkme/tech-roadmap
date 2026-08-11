# Kotlin 인터랙티브 학습 커리큘럼

## 학습 목표
Kotlin 을 실무(Android, JVM 서버, Multiplatform)에 적용할 수 있을 만큼 익힌다. 기초 문법, 함수형 코틀린, 코루틴 비동기, Android/JVM 적용, 실전 운영까지 5단계로 다룬다.

## Part I. 기초
- I-1-1. val vs var — 불변성과 식(expression) 중심 설계
- I-1-2. null safety — ? !! ?: let — NPE 가 사라진 이유
- I-2-1. when 식 — switch 와 if/else 를 한 번에 대체
- I-2-2. data class — equals/hashCode/copy 자동 생성

## Part II. 함수형 Kotlin
- II-1-1. lambda / 고차함수 — map/filter/reduce 와 Java 비교
- II-1-2. scope function — let / run / with / apply / also 차이
- II-2-1. extension function — 기존 타입에 메서드 붙이기
- II-2-2. sealed class / interface — 닫힌 계층과 when 망라 검사

## Part III. 코루틴 (Coroutines)
- III-1-1. suspend / launch / async — 스레드 없이 비동기
- III-1-2. structured concurrency — coroutineScope / supervisorScope
- III-2-1. Flow — Cold stream 으로 데이터 스트림 모델링
- III-2-2. Dispatcher / withContext — IO / Main / Default 분리

## Part IV. Android / JVM 적용
- IV-1-1. ViewModel + StateFlow — UI 상태를 한 곳에서
- IV-1-2. Jetpack Compose — 선언형 UI + remember/State
- IV-2-1. Room — DAO 와 코루틴/Flow 통합
- IV-2-2. Retrofit + 코루틴 — 서버 API 호출 패턴

## Part V. 실전 운영
- V-1-1. Kotlin Multiplatform — 공통 모듈 + expect/actual
- V-1-2. Ktor — 서버 프레임워크로 API 만들기
- V-2-1. 코루틴 운영 — 취소, 예외, supervisorScope
- V-2-2. 테스트 — runTest / TestDispatcher / Turbine

## 색상 매핑
- 도메인 색상: Kotlin purple (#7F52FF)
- 좌 LiveDataPane (Kotlin 도메인 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark, lang=kotlin)
- 3000ms autoplay, 4 controls (처음/이전/재생/다음), 키보드 ←/→
