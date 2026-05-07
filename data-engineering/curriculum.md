# Data Engineering 인터랙티브 학습 커리큘럼

운영 데이터(OLTP) → 분석 데이터(OLAP) → 보관(Data Lake)으로 이어지는 데이터 흐름의 핵심 — DW/DM/DL/Lakehouse + ETL/ELT/CDC + Streaming + 거버넌스.

## 독자 가이드

- **선수 지식**: SQL 기초, 백엔드/DB 기초
- **목표**: 분석 가능한 데이터 플랫폼을 설계·운영
- **분량**: 5 Parts × 20 sections, Phase B 시점 10/20

---

## Part I. 데이터 엔지니어링 개론

### Section I-1-1. Data Engineering이란
- **시각화 연결**: [Data Engineering이란 시각화 보기](part1/I-1-1.html) — OLTP/OLAP/Lake/통합 (도서관 3개 층 비유)
- **다음 섹션**: I-1-2

### Section I-1-2. OLTP vs OLAP
- **시각화 연결**: [OLTP vs OLAP 시각화 보기](part1/I-1-2.html) — 편의점 vs 도서관
- **다음 섹션**: I-2-1

### Section I-2-1. ETL vs ELT
- **시각화 연결**: [ETL vs ELT 시각화 보기](part1/I-2-1.html) — 미리 다듬기 vs 원본 보관 후 조리
- **다음 섹션**: I-2-2

### Section I-2-2. CDC (Change Data Capture)
- **시각화 연결**: [CDC 시각화 보기](part1/I-2-2.html) — 실시간 복사기
- **다음 섹션**: II-1-1

---

## Part II. 데이터 웨어하우스 (DW)

### Section II-1-1. Data Warehouse 개론
- **시각화 연결**: [Data Warehouse 시각화 보기](part2/II-1-1.html) — 분석용 대형 도서관
- **다음 섹션**: II-1-2

### Section II-1-2. Star Schema
- **시각화 연결**: [Star Schema 시각화 보기](part2/II-1-2.html) — 별 모양 차원 모델링
- **다음 섹션**: II-2-1

### Section II-2-1. Snowflake / BigQuery / Redshift
- **시각화 연결**: [3대 DW 시각화 보기](part2/II-2-1.html) — 클라우드 DW 비교
- **다음 섹션**: II-2-2

### Section II-2-2. Slowly Changing Dimensions
- **시각화 연결**: [SCD 시각화 보기](part2/II-2-2.html) — 직원 부서 변경 추적
- **다음 섹션**: III-1-1

---

## Part III. 데이터 레이크 & Lakehouse

### Section III-1-1. Data Lake 개론
- **시각화 연결**: [Data Lake 시각화 보기](part3/III-1-1.html) — 물 저장소 (Parquet/Partition)
- **다음 섹션**: III-1-2

### Section III-1-2. Lakehouse (Delta/Iceberg/Hudi)
- **시각화 연결**: [Lakehouse 시각화 보기](part3/III-1-2.html) — 도서관+물저장소 통합
- **다음 섹션**: III-2-1

### Section III-2-1. Apache Spark
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: III-2-2

### Section III-2-2. dbt (Data Build Tool)
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: IV-1-1

---

## Part IV. 통합 & Streaming

### Section IV-1-1. Airflow ML/DE DAG
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: IV-1-2

### Section IV-1-2. Kafka 개론
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: IV-2-1

### Section IV-2-1. Streaming SQL (ksqlDB / Flink)
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: IV-2-2

### Section IV-2-2. Lambda vs Kappa 아키텍처
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-1-1

---

## Part V. 거버넌스 & 실전

### Section V-1-1. Data Catalog (Glue/DataHub)
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-1-2

### Section V-1-2. 데이터 품질 (Great Expectations)
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-2-1

### Section V-2-1. Lineage & Privacy
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-2-2

### Section V-2-2. 실전 체크리스트
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: 없음
