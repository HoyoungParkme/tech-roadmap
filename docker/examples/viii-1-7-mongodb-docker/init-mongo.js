// 초기 데이터: 컨테이너 최초 생성 시 한 번만 실행된다
// 볼륨이 이미 존재하면 이 파일은 무시된다 (MongoDB 동작 방식)
// MONGO_INITDB_DATABASE 환경변수로 지정된 DB에서 실행된다

db.createCollection("users");

db.users.insertOne({
  name: "seed-user",
  email: "seed@example.com",
  createdAt: new Date()
});

print("=== 초기 데이터 삽입 완료: users 컬렉션에 seed-user 1건 ===");
