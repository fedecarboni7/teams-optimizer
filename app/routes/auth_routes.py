from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from app.db.database import get_db
from app.db.database_utils import execute_with_retries, query_user
from app.db.models import User
from app.utils.security import create_access_token
from app.utils.validators import validate_password, validate_username


router = APIRouter()

@router.post("/signup")
async def signup(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    username = username.strip().lower()
    try:
        validate_username(username)
        user = execute_with_retries(query_user, db, username)
        if user:
            return JSONResponse({"error": "Usuario ya registrado"}, status_code=409)
        validate_password(password)
    except ValueError as e:
        return JSONResponse({"error": str(e)}, status_code=400)
    except OperationalError:
        return JSONResponse({"error": "Error al acceder a la base de datos. Inténtalo de nuevo más tarde."}, status_code=500)

    new_user = User(username=username)
    new_user.set_password(password)
    db.add(new_user)
    db.commit()

    # Crear token JWT para el nuevo usuario
    access_token_expires = timedelta(minutes=15)
    access_token = create_access_token(
        data={"sub": new_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/token", response_model=Token)
async def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        db: Session = Depends(get_db)
    ) -> Token:

    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not user.verify_password(form_data.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=15)
    
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")