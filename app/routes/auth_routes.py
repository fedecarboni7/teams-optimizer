from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from app.config.config import templates
from app.db.database import get_db
from app.db.database_utils import execute_with_retries, query_user
from app.db.models import User
from app.utils.security import create_access_token
from app.utils.validators import validate_password, validate_username


router = APIRouter()

@router.get("/signup", response_class=HTMLResponse, include_in_schema=False)
async def signup_page(request: Request):
    if request.session.get("user_id"):
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse(request=request, name="signup.html")


@router.post("/signup")
async def signup(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    username = username.strip().lower()

    # Validar nombre de usuario y contraseña
    try:
        validate_username(username)

        user = execute_with_retries(query_user, db, username)
        if user:
            raise ValueError("Usuario ya registrado")
        
        validate_password(password)
    except ValueError as e:
        return templates.TemplateResponse(request=request, name="signup.html", context={"error": str(e)})
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)

    new_user = User(username=username)
    new_user.set_password(password)
    db.add(new_user)
    db.commit()

    # Set user_id in session after successful registration
    request.session["user_id"] = new_user.id
    return RedirectResponse(url="/", status_code=302)


@router.get("/login", response_class=HTMLResponse, include_in_schema=False)
async def login_page(request: Request):
    if request.session.get("user_id"):
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse(request=request, name="login.html")


@router.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    username = username.strip().lower()

    try:
        user: User = execute_with_retries(query_user, db, username)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
    if not user or not user.verify_password(password):
        return templates.TemplateResponse(request=request, name="login.html", context={"error": "Usuario o contraseña incorrectos"})

    request.session["user_id"] = user.id
    return RedirectResponse(url="/", status_code=302)

@router.get("/logout", include_in_schema=False)
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login", status_code=307)

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: Session = Depends(get_db)) -> Token:
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