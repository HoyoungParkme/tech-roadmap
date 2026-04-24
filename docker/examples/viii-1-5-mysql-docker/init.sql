-- 초기 데이터: 컨테이너 최초 생성 시 한 번만 실행된다
-- 볼륨이 이미 존재하면 이 파일은 무시된다 (MySQL 동작 방식)

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES
    ('seed-user', 'seed@example.com');
