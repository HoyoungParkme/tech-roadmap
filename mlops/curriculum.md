# MLOps 인터랙티브 학습 커리큘럼

머신러닝 모델을 안정적으로 운영하기 위한 표준 — 학습-배포-모니터링 라이프사이클을 자동화한다.

## 독자 가이드

- **선수 지식**: 머신러닝 기초 개념 (모델 학습/추론), Docker, Kubernetes 기초 (있으면 좋음)
- **목표**: 작은 ML 모델을 학습→평가→배포→모니터링까지 자동화 파이프라인으로 묶는다
- **분량**: 5 Parts × 20 sections, Phase A부터 점진 추가

---

## Part I. MLOps 개론

학습 목표: 왜 MLOps가 일반 SW 운영(DevOps)과 다른가, 어떤 추가 책임이 있는가.

### Section I-1-1. MLOps란 무엇인가
- **난이도**: ★☆☆
- **선수 지식**: 머신러닝 기초
- **학습 목표**: 모델 1개를 production에 두는 데 데이터/학습/배포/모니터링 4축 자동화가 왜 필요한지 안다.
- **핵심 키워드**: [재현성, 추적성, 자동화, 데이터 드리프트]
- **시각화 연결**: [MLOps란 시각화 보기](part1/I-1-1.html) — 노트북에서 production까지 / 4축 자동화 / 재현성 / 모니터링 (수술실 안전수칙 비유)
- **다음 섹션**: I-1-2

### Section I-1-2. ML vs 일반 SW의 차이
- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: 코드 외에 데이터/모델/하이퍼파라미터까지 버전 관리해야 하는 이유, 데이터 드리프트의 본질을 안다.
- **핵심 키워드**: [코드 + 데이터 + 모델 3축, 데이터 드리프트, 컨셉 드리프트, retraining]
- **시각화 연결**: [ML vs 일반 SW 시각화 보기](part1/I-1-2.html) — 가전제품(고정) / 식물(자라남) / 3축 버전 / drift 감지 (키우는 식물 비유)
- **다음 섹션**: I-2-1

### Section I-2-1. ML 라이프사이클 — 6 단계
- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: 데이터 수집 → 전처리 → 학습 → 평가 → 배포 → 모니터링 사이클을 안다.
- **핵심 키워드**: [data ingestion, feature engineering, training, evaluation, deployment, monitoring]
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: I-2-2

### Section I-2-2. 성숙도 모델 (Level 0~2)
- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: Google MLOps 성숙도 모델 0(수동)/1(자동)/2(전자동 CI-CD-CT)을 안다.
- **핵심 키워드**: [Level 0 manual, Level 1 ML pipeline automation, Level 2 CI/CD/CT]
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-1

---

## Part II. 데이터 & 학습 파이프라인

학습 목표: 데이터 → 학습 자동화 흐름과 핵심 도구를 안다.

### Section II-1-1. 데이터 버전 관리 (DVC)
- **난이도**: ★★☆
- **시각화 연결**: [DVC 시각화 보기](part2/II-1-1.html) — git 한계 / dvc add / dvc push / 재현 (사진 앨범 버전 비유)
- **다음 섹션**: II-1-2

### Section II-1-2. Feature Store
- **난이도**: ★★★
- **시각화 연결**: [Feature Store 시각화 보기](part2/II-1-2.html) — Skew / Feast 등록 / 학습-서빙 일관 / online (공유 부엌 비유)
- **다음 섹션**: II-2-1

### Section II-2-1. 학습 파이프라인 (Airflow / Kubeflow)
- **난이도**: ★★★
- **시각화 연결**: [학습 파이프라인 시각화 보기](part2/II-2-1.html) — 수동 / DAG / 병렬+재시도 / 스케줄 (공장 자동화 비유)
- **다음 섹션**: II-2-2

### Section II-2-2. 실험 추적 (MLflow Tracking)
- **난이도**: ★★☆
- **시각화 연결**: [MLflow Tracking 시각화 보기](part2/II-2-2.html) — 기록 누락 / log_param / UI 비교 / Registry (실험 노트북 비유)
- **다음 섹션**: III-1-1

---

## Part III. 모델 배포 & 서빙

학습 목표: 학습된 모델을 production에 배포하고 추론 요청을 처리하는 방법.

### Section III-1-1. 모델 레지스트리 (MLflow Model Registry)
- **난이도**: ★★☆
- **시각화 연결**: [모델 레지스트리 시각화 보기](part3/III-1-1.html) — 파일 공유 / register_model / Stage 전환 / Production 로드 (도서관 카탈로그 비유)
- **다음 섹션**: III-1-2

### Section III-1-2. 서빙 패턴 (Online / Batch / Streaming)
- **난이도**: ★★☆
- **시각화 연결**: [서빙 패턴 시각화 보기](part3/III-1-2.html) — Online 즉석 / Batch 포장 / Streaming 구독 / 선택 기준 (주문 방식 3종 비유)
- **다음 섹션**: III-2-1

### Section III-2-1. 모델 서빙 도구 (Triton / TorchServe / KServe)
- **난이도**: ★★★
- **시각화 연결**: [서빙 도구 시각화 보기](part3/III-2-1.html) — Triton 만능 / TorchServe 전용 / KServe K8s / 선택 가이드 (주방 도구 3종 비유)
- **다음 섹션**: III-2-2

### Section III-2-2. 배포 전략 (Canary / Shadow / A/B Test)
- **난이도**: ★★★
- **시각화 연결**: [배포 전략 시각화 보기](part3/III-2-2.html) — Canary 시식 / Shadow 시연 / A-B 비교 / 순차 조합 (신메뉴 출시 3종 비유)
- **다음 섹션**: IV-1-1

---

## Part IV. 모니터링 & 거버넌스

학습 목표: production 모델의 품질을 추적하고 문제를 조기 감지한다.

### Section IV-1-1. 모델 성능 모니터링
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: IV-1-2

### Section IV-1-2. 데이터 드리프트 감지
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: IV-2-1

### Section IV-2-1. Retraining 트리거
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: IV-2-2

### Section IV-2-2. 거버넌스 & 감사 로그
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-1-1

---

## Part V. 실전 도구

학습 목표: MLflow / Kubeflow / Airflow를 실제 사용할 수 있다.

### Section V-1-1. MLflow 한 사이클
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-1-2

### Section V-1-2. Kubeflow Pipelines
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-2-1

### Section V-2-1. Airflow ML DAG 패턴
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-2-2

### Section V-2-2. 실전 체크리스트
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: 없음 (커리큘럼 마지막 섹션)

---

## 참고 자료

- Google "MLOps: Continuous delivery and automation pipelines in machine learning"
- "Machine Learning Engineering" (Andriy Burkov)
- MLflow / Kubeflow / Airflow 공식 문서
