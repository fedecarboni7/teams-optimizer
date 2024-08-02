from fastapi import Depends, HTTPException, Request

from sqlalchemy.orm import Session

from app.database import User, get_db


def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if user_id:
        user = db.get(User, user_id)
        return user
    return None