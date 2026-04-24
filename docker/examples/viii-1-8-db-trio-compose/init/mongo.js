db.createCollection("todos");
db.todos.insertOne({ title: "MongoDB에서 온 할 일", done: false, createdAt: new Date() });
print("=== MongoDB 초기 데이터 삽입 완료 ===");
