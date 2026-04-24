"""예제 VI-1-1: FastAPI + PostgreSQL CRUD API.

경로: examples/vi-1-1-fastapi-postgres-nginx/api/main.py
목적: Nginx → FastAPI → PostgreSQL 3티어 구성의 앱 서버.
      ORM 없이 psycopg로 직접 연결하여 간결하게 유지.

주의: 학습 전용 — 요청마다 새 DB 연결을 생성한다.
      실서비스에서는 psycopg_pool.ConnectionPool 또는
      SQLAlchemy connection pool 사용을 권장한다.
"""

import os
from contextlib import contextmanager

import psycopg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

DATABASE_URL = os.environ["DATABASE_URL"]

app = FastAPI(title="VI-1-1 예제 API")


class ItemCreate(BaseModel):
    """아이템 생성 요청 스키마."""
    name: str


class ItemResponse(BaseModel):
    """아이템 응답 스키마."""
    id: int
    name: str


@contextmanager
def get_conn():
    """DB 연결을 열고 자동으로 닫는 컨텍스트 매니저.

    Raises:
        HTTPException: DB 연결 실패 시 503 반환.
    """
    try:
        conn = psycopg.connect(DATABASE_URL)
    except psycopg.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"DB 연결 실패: {e}")
    try:
        yield conn
    finally:
        conn.close()


@app.get("/health")
def health():
    """헬스체크 엔드포인트. DB 연결까지 확인."""
    try:
        with get_conn() as conn:
            conn.execute("SELECT 1")
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/items", response_model=list[ItemResponse])
def list_items():
    """전체 아이템 조회."""
    with get_conn() as conn:
        rows = conn.execute("SELECT id, name FROM items ORDER BY id").fetchall()
    return [{"id": row[0], "name": row[1]} for row in rows]


@app.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int):
    """단건 아이템 조회."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, name FROM items WHERE id = %s", (item_id,)
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": row[0], "name": row[1]}


@app.post("/items", response_model=ItemResponse, status_code=201)
def create_item(item: ItemCreate):
    """새 아이템 추가."""
    with get_conn() as conn:
        row = conn.execute(
            "INSERT INTO items (name) VALUES (%s) RETURNING id, name",
            (item.name,),
        ).fetchone()
        conn.commit()
    return {"id": row[0], "name": row[1]}
