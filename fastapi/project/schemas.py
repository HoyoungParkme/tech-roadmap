"""
schemas.py — Pydantic v2 스키마
경로: project/schemas.py
목적: 요청/응답 데이터 검증 및 직렬화
주요 의존성: pydantic

관련 시각화:
- I-1-2 Pydantic (chapter-01-02-pydantic.html)
- IV-4-8 Pydantic Advanced (chapter-04-08-pydantic-advanced.html)
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


# ─── User 스키마 ───
class UserCreate(BaseModel):
    """회원가입 요청"""
    email: EmailStr
    username: str
    password: str


class UserResponse(BaseModel):
    """사용자 응답"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    created_at: datetime


class Token(BaseModel):
    """JWT 토큰 응답"""
    access_token: str
    token_type: str = "bearer"


# ─── Post 스키마 ───
class PostCreate(BaseModel):
    """게시글 작성 요청"""
    title: str
    content: str


class PostUpdate(BaseModel):
    """게시글 수정 요청"""
    title: str | None = None
    content: str | None = None


class PostResponse(BaseModel):
    """게시글 응답"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
    updated_at: datetime | None = None
