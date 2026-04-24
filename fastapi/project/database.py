"""
database.py — DB 연결 설정
경로: project/database.py
목적: SQLAlchemy 엔진, 세션 팩토리, Base 클래스 정의
주요 의존성: sqlalchemy, python-dotenv

관련 시각화:
- IV-4-15 Connection Pool (chapter-04-15-connection-pool.html)
- III-3-2 DB 세션 (chapter-03-02-db-session.html)
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

# SQLite 사용 — 설치 없이 바로 실행 가능
DB_URL = os.getenv("DB_URL", "sqlite:///./blog.db")

engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False},  # SQLite 전용 옵션
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """모든 모델의 베이스 클래스 (SQLAlchemy 2.0 스타일)"""
    pass
