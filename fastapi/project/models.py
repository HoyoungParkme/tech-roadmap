"""
models.py — SQLAlchemy ORM 모델
경로: project/models.py
목적: User, Post 테이블 정의
주요 의존성: sqlalchemy

관련 시각화:
- VI-6-1 CRUD ORM (chapter-06-01-crud-orm.html)
- III-3-2 DB 세션 (chapter-03-02-db-session.html)
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    """사용자 테이블"""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    posts: Mapped[list["Post"]] = relationship(back_populates="author")


class Post(Base):
    """게시글 테이블"""
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    author: Mapped["User"] = relationship(back_populates="posts")
