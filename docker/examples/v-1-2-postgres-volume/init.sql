-- 예제 V-1-2: 볼륨 영구화 학습용 초기 스키마
-- 단일 진실원: ../../docs/design/crossref.md §2

CREATE TABLE IF NOT EXISTS items (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO items (name) VALUES ('seed-row');
