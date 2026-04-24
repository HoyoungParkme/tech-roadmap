"""
post_service.py — 게시글 비즈니스 로직
경로: project/services/post_service.py
목적: Post CRUD 처리
주요 의존성: sqlalchemy

관련 시각화:
- VI-6-1 CRUD ORM (chapter-06-01-crud-orm.html)
- V-5-6 Layered Architecture (chapter-05-06-layered.html)
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models import Post, User
from schemas import PostCreate, PostUpdate


def create_post(db: Session, post_data: PostCreate, author: User) -> Post:
    """게시글 작성"""
    post = Post(
        title=post_data.title,
        content=post_data.content,
        author_id=author.id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def get_posts(db: Session, skip: int = 0, limit: int = 20) -> list[Post]:
    """게시글 목록 조회 (페이지네이션)"""
    return db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()


def get_post(db: Session, post_id: int) -> Post:
    """게시글 단건 조회"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다")
    return post


def update_post(db: Session, post_id: int, post_data: PostUpdate, author: User) -> Post:
    """게시글 수정 (작성자만 가능)"""
    post = get_post(db, post_id)
    if post.author_id != author.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="수정 권한이 없습니다")

    if post_data.title is not None:
        post.title = post_data.title
    if post_data.content is not None:
        post.content = post_data.content

    db.commit()
    db.refresh(post)
    return post


def delete_post(db: Session, post_id: int, author: User) -> None:
    """게시글 삭제 (작성자만 가능)"""
    post = get_post(db, post_id)
    if post.author_id != author.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="삭제 권한이 없습니다")

    db.delete(post)
    db.commit()
