from fastapi import Depends, HTTPException, Request
from fastapi.responses import HTMLResponse

from sqlalchemy.orm import Session

from database import User, get_db


def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=302, detail="Not authenticated", headers={"Location": "/login"}
        )

    user = db.query(User).get(user_id)
    
    return user
