# Webpack 인터랙티브 학습 커리큘럼

## 학습 목표
Webpack의 빌드 파이프라인을 실무에 적용할 수 있을 만큼 익힌다. entry/output부터 loader/plugin, dev/prod 분리, 코드 스플리팅, Module Federation까지 5단계로 다룬다.

## Part I. 기초
- I-1-1. entry / output — 빌드의 시작점과 산출물 경로
- I-1-2. loader — 비-JS 파일(CSS/이미지/TS)을 모듈로 변환
- I-2-1. module resolution — extension / alias / modules
- I-2-2. mode + target — development / production / web / node

## Part II. 플러그인 / 최적화
- II-1-1. plugin — HtmlWebpackPlugin / DefinePlugin 기본기
- II-1-2. optimization — minimizer / terser / sideEffects
- II-2-1. minify + tree shaking — production 모드의 자동 효과
- II-2-2. css extract — style-loader vs MiniCssExtractPlugin

## Part III. 개발 / 프로덕션
- III-1-1. devServer — port / proxy / static
- III-1-2. source map — devtool 선택 가이드
- III-2-1. HMR — Hot Module Replacement 흐름
- III-2-2. cache — filesystem / contenthash

## Part IV. 코드 스플리팅 / 지연 로딩
- IV-1-1. code splitting 기본 — multiple entry vs SplitChunks
- IV-1-2. dynamic import — import() 문법과 청크 자동 생성
- IV-2-1. runtimeChunk — 런타임 분리로 캐시 안정성
- IV-2-2. optimization.splitChunks 튜닝 — cacheGroups

## Part V. 실전
- V-1-1. 마이그레이션 — 4 → 5 주요 변화
- V-1-2. webpack vs Vite vs esbuild 비교
- V-2-1. 모노레포 — yarn workspaces + webpack
- V-2-2. Module Federation — 마이크로 프론트엔드 입문

## 색상 매핑
- 도메인 색상: Webpack sky (#8DD6F9)
- 좌 LiveDataPane (Webpack 빌드 파이프라인 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 3000ms autoplay, 4 controls, 키보드 ←/→
