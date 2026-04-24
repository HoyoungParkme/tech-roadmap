"""
user_service.py — 사용자 비즈니스 로직
경로: project/services/user_service.py
목적: 회원가입, 로그인 처리
주요 의존성: sqlalchemy, auth

관련 시각화:
- V-5-6 Layered Architecture (chapter-05-06-layered.html)
- IV-4-11 Bcrypt (chapter-04-11-bcrypt.html)
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from auth import create_access_token, hash_password, verify_password
from models import User
from schemas import UserCreate


def register_user(db: Session, user_data: UserCreate) -> User:
    """새 사용자 등록

    Args:
        db: DB 세션
        user_data: 회원가입 데이터 (email, username, password)

    Returns:
        생성된 User 객체

    Raises:
        HTTPException 400: 이메일 또는 사용자명이 이미 존재할 때
    """
    # 중복 체크
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 사용자명입니다")

    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> str:
    """로그인 인증 후 JWT 토큰 반환

    Args:
        db: DB 세션
        email: 로그인 이메일
        password: 평문 비밀번호

    Returns:
        JWT 액세스 토큰 문자열

    Raises:
        HTTPException 401: 이메일/비밀번호가 틀렸을 때
    """
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다",
        )
    return create_access_token(data={"sub": user.email})
