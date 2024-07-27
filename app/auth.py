from fastapi import Depends, HTTPException, Request

from sqlalchemy.orm import Session

from app.database import User, get_db


def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if user_id is None:
        return HTTPException(
            status_code=302, detail="Not authenticated", headers={"Location": "/login"}
        )

    user = db.get(User, user_id)
    return user
