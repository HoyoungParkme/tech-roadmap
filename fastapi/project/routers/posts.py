"""
routers/posts.py — 게시글 CRUD 라우터
경로: project/routers/posts.py
목적: 게시글 생성/조회/수정/삭제 엔드포인트
주요 의존성: fastapi, services.post_service

관련 시각화:
- V-5-8 APIRouter (chapter-05-08-apirouter.html)
- VI-6-1 CRUD ORM (chapter-06-01-crud-orm.html)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_current_user, get_db
from models import User
from schemas import PostCreate, PostResponse, PostUpdate
from services.post_service import create_post, delete_post, get_post, get_posts, update_post

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[PostResponse])
def list_posts(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """게시글 목록 조회 (공개)"""
    return get_posts(db, skip=skip, limit=limit)


@router.get("/{post_id}", response_model=PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db)):
    """게시글 단건 조회 (공개)"""
    return get_post(db, post_id)


@router.post("", response_model=PostResponse, status_code=201)
def write_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """게시글 작성 (인증 필요)"""
    return create_post(db, post_data, current_user)


@router.put("/{post_id}", response_model=PostResponse)
def edit_post(
    post_id: int,
    post_data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """게시글 수정 (작성자만)"""
    return update_post(db, post_id, post_data, current_user)


@router.delete("/{post_id}", status_code=204)
def remove_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """게시글 삭제 (작성자만)"""
    delete_post(db, post_id, current_user)
