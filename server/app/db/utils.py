from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


def commit_or_409(db: Session, message: str) -> None:
    """Commit, and turn a database constraint error into a clean 409 response
    instead of a crash (a crash shows up as 'Failed to fetch' in the browser)."""
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=message)