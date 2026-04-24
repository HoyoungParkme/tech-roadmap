"""
dependencies.py — FastAPI 의존성 주입
경로: project/dependencies.py
목적: DB 세션, 현재 사용자 등 공통 의존성 제공
주요 의존성: fastapi, sqlalchemy

관련 시각화:
- III-3-1 Depends (chapter-03-01-depends.html)
- III-3-2 DB 세션 (chapter-03-02-db-session.html)
"""

from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from auth import decode_access_token
from database import SessionLocal
from models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_db() -> Generator[Session, None, None]:
    """DB 세션을 생성하고, 요청 종료 시 자동 close

    Yields:
        SQLAlchemy Session 인스턴스
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """JWT 토큰에서 현재 로그인 사용자를 조회

    Args:
        token: Authorization 헤더의 Bearer 토큰
        db: DB 세션

    Returns:
        인증된 User 객체

    Raises:
        HTTPException 401: 토큰이 유효하지 않거나 사용자가 없을 때
    """
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰입니다",
        )

    user = db.query(User).filter(User.email == payload.get("sub")).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다",
        )
    return user
